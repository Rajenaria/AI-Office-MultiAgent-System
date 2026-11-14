import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PlanImportPreviewPanel, PlanTransferPanel } from "../../src/web/components/PlanTransferPanel.js";
import { TaskPlanBoard } from "../../src/web/components/TaskPlanningPanel.js";
import { PlanningScopeSchema, createTaskPlan, editTaskPlan, markTaskPlanned, newPlanningBoard,
  planRolePreview, restorePlanningBoard, type PlanningBoard } from "../../src/web/planning/model.js";
import { MAX_PLAN_FILE_BYTES, PLAN_DOWNLOAD_NAME, PlanTransferError, PlanTransferSession, applyPlanImport,
  cancelPlanImport, parsePlanningExport, preparePlanImport, readLocalPlanFile, serializePlanningBoard } from "../../src/web/planning/transfer.js";
import { exportPlanFile, requestPlanDownload } from "../../src/web/planning/download.js";
import { PROJECT_A, PROJECT_B, deferred } from "./fixtures.js";

const time = "2026-11-14T01:00:00.000Z", later = "2026-11-14T01:00:01.000Z";
const scope = (projectId = PROJECT_A, label = "Saved workspace") => PlanningScopeSchema.parse({ kind: "TEMPORARY", projectId, label });
function board(projectId = PROJECT_A, title = "Task from file") {
  return createTaskPlan(newPlanningBoard(scope(projectId)), { projectId, taskId: "plan:one", title,
    description: "Notes 日本語", proposedAgentRole: "agent:frontend", at: time });
}
function document() {
  return JSON.parse(serializePlanningBoard(board())) as {
    format: string; schemaVersion: number; scope: Record<string, unknown>; tasks: Record<string, unknown>[]; [key: string]: unknown;
  };
}
function file(text = serializePlanningBoard(board()), metadata: Record<string, unknown> = {}) {
  return { name: "plans.json", type: "application/json", size: new TextEncoder().encode(text).byteLength,
    text: vi.fn(async () => text), ...metadata };
}
function expectCode(action: () => unknown, code: string) {
  let error: unknown; try { action(); } catch (value) { error = value; }
  expect(error).toBeInstanceOf(PlanTransferError); expect((error as PlanTransferError).code).toBe(code);
}

describe("PROD02 versioned selected-scope export and strict parsing", () => {
  it("serializes deterministically with only format, version, scope and actual planning records", () => {
    const source = board(), text = serializePlanningBoard(source), parsed = JSON.parse(text);
    expect(serializePlanningBoard(source)).toBe(text);
    expect(Object.keys(parsed)).toEqual(["format", "schemaVersion", "scope", "tasks"]);
    expect(parsed).toMatchObject({ format: "ai-office.task-plans", schemaVersion: 1, scope: source.scope, tasks: source.tasks });
    expect(parsed.changes).toBeUndefined(); expect(text).not.toContain("executionAuthority"); expect(text).not.toContain("CREATED");
  });
  it("round trips Draft/Planned identity, text, role, timestamp and version; no persistent history", () => {
    const source = markTaskPlanned(board(), { projectId: PROJECT_A, taskId: "plan:one", expectedVersion: 1, at: later });
    const target = newPlanningBoard(source.scope), preview = preparePlanImport(serializePlanningBoard(source), target);
    const restored = applyPlanImport(preview, target, "REPLACE_CURRENT_BOARD");
    expect(restored.tasks).toEqual(source.tasks); expect(restored.scope).toEqual(source.scope); expect(restored.changes).toEqual([]);
    expect(Object.isFrozen(restored)).toBe(true); expect(Object.isFrozen(restored.tasks)).toBe(true);
  });
  it("selected scope export does not collect another in-memory board", () => {
    const selected = board(PROJECT_A, "A only"), other = board(PROJECT_B, "B only");
    const text = serializePlanningBoard(selected);
    expect(text).toContain("A only"); expect(text).not.toContain("B only"); expect(other.tasks[0]?.projectId).toBe(PROJECT_B);
  });
  it("handles empty export and rejects an empty imported task list", () => {
    expectCode(() => serializePlanningBoard(newPlanningBoard(scope())), "EMPTY_BOARD");
    expectCode(() => parsePlanningExport(JSON.stringify({ ...document(), tasks: [] })), "INVALID_DOCUMENT");
  });
  it.each([0, 2, "1", null])("rejects unsupported/non-numeric schema version %s", schemaVersion => {
    expectCode(() => parsePlanningExport(JSON.stringify({ ...document(), schemaVersion })), "UNSUPPORTED_VERSION");
  });
  it.each(["{", "not json", "", "[1,2]", "null"])("rejects malformed/unsupported JSON %s", text => {
    expect(() => parsePlanningExport(text)).toThrow(PlanTransferError);
  });
  it("requires correct format and all mandatory version/scope fields", () => {
    for (const raw of [{ ...document(), format: "other" }, { scope: scope(), tasks: [] }, { ...document(), scope: null }])
      expectCode(() => parsePlanningExport(JSON.stringify(raw)), "INVALID_DOCUMENT");
  });
  it("bounds actual UTF-8 bytes on both export and import", () => {
    expectCode(() => parsePlanningExport("x".repeat(MAX_PLAN_FILE_BYTES + 1)), "FILE_SIZE");
    expectCode(() => parsePlanningExport("界".repeat(Math.floor(MAX_PLAN_FILE_BYTES / 3) + 1)), "FILE_SIZE");
    const huge = restorePlanningBoard(scope(), Array.from({ length: 100 }, (_, index) => ({ ...board().tasks[0]!,
      taskId: `plan:${index}`, description: "\ud800".repeat(2000) })));
    expectCode(() => serializePlanningBoard(huge), "FILE_SIZE");
  });
  it("rejects duplicate IDs, over-limit lists and task/project contradictions", () => {
    const raw = document(), task = raw.tasks[0];
    for (const tasks of [[task, task], Array.from({ length: 101 }, (_, i) => ({ ...task, taskId: `plan:${i}` })),
      [{ ...task, projectId: PROJECT_B }]]) expectCode(() => parsePlanningExport(JSON.stringify({ ...raw, tasks })), "INVALID_DOCUMENT");
  });
  it.each([
    { proposedAgentRole: "agent:unknown" }, { state: "RUNNING" }, { state: "COMPLETED" },
    { state: "PLANNED", proposedAgentRole: null }, { version: 0 }, { version: 1.5 }, { version: "1" },
    { updatedAt: "yesterday" }, { updatedAt: "2026-11-14T01:00:00Z" }, { title: " " }, { description: "x".repeat(2001) },
  ])("uses actual model validation for invalid task %j", change => {
    const raw = document(); raw.tasks[0] = { ...raw.tasks[0], ...change };
    expectCode(() => parsePlanningExport(JSON.stringify(raw)), "INVALID_DOCUMENT");
  });
  it.each(["executionAuthority", "credentials", "grant", "process", "changes"])("rejects extra %s at root, scope or task", name => {
    for (const position of ["root", "scope", "task"]) {
      const raw = document();
      if (position === "root") raw[name] = false;
      else if (position === "scope") raw.scope[name] = false;
      else raw.tasks[0]![name] = false;
      expectCode(() => parsePlanningExport(JSON.stringify(raw)), "INVALID_DOCUMENT");
    }
  });
  it("rejects prototype metadata and contradictory temporary binding claims", () => {
    const raw = document();
    expectCode(() => parsePlanningExport(JSON.stringify({ ...raw, scope: { ...raw.scope, binding: { projectId: PROJECT_A } } })), "INVALID_DOCUMENT");
    expectCode(() => parsePlanningExport('{"__proto__":{"granted":true},"schemaVersion":1}'), "INVALID_DOCUMENT");
    expect(({} as { granted?: unknown }).granted).toBeUndefined();
  });
});

describe("PROD02 scope ownership, confirmation and atomic replacement", () => {
  it("reassociates temporary references only with an explicitly selected temporary target", () => {
    const target = newPlanningBoard(scope(PROJECT_B, "Restored workspace")), source = board();
    const preview = preparePlanImport(serializePlanningBoard(source), target);
    expect(preview.sourceScope.projectId).toBe(PROJECT_A); expect(preview.targetScope.projectId).toBe(PROJECT_B);
    expect(preview.warnings.join(" ")).toContain("reassociated");
    const next = applyPlanImport(preview, target, "REPLACE_CURRENT_BOARD");
    expect(next.scope).toEqual(target.scope); expect(next.tasks[0]).toEqual({ ...source.tasks[0], projectId: PROJECT_B });
    expect(source.tasks[0]?.projectId).toBe(PROJECT_A);
  });
  it("requires exact attached project/binding/generation and rejects cross-kind adoption", () => {
    const attached = PlanningScopeSchema.parse({ kind: "ATTACHED", projectId: PROJECT_A, label: "Current project",
      binding: { projectId: PROJECT_A, bindingId: "binding:a", generation: 1 } });
    if (attached.kind !== "ATTACHED") throw new Error("Attached fixture required");
    const source = restorePlanningBoard(attached, board().tasks), text = serializePlanningBoard(source), target = newPlanningBoard(attached);
    expect(applyPlanImport(preparePlanImport(text, target), target, "REPLACE_CURRENT_BOARD").scope).toEqual(attached);
    for (const scopeInput of [
      { ...attached, binding: { ...attached.binding, generation: 2 } },
      { ...attached, binding: { ...attached.binding, bindingId: "binding:other" } },
      { ...attached, projectId: PROJECT_B, binding: { ...attached.binding, projectId: PROJECT_B } },
    ]) expectCode(() => preparePlanImport(text, newPlanningBoard(scopeInput)), "SCOPE_MISMATCH");
    expectCode(() => preparePlanImport(text, newPlanningBoard(scope())), "SCOPE_MISMATCH");
    expectCode(() => preparePlanImport(serializePlanningBoard(board()), target), "SCOPE_MISMATCH");
  });
  it("does not overwrite before confirmation and replaces rather than merging on approval", () => {
    const target = board(PROJECT_A, "Existing tasks"), before = JSON.stringify(target);
    const incoming = createTaskPlan(newPlanningBoard(scope()), { projectId: PROJECT_A, taskId: "plan:new", title: "Replacement",
      description: "", proposedAgentRole: "agent:qa", at: time });
    // Build the incoming record through the ordinary form command, not a file-owned mutation.
    expect(incoming.tasks).toHaveLength(1);
    const preview = preparePlanImport(serializePlanningBoard(incoming), target);
    expect(preview.replacedTaskCount).toBe(1); expectCode(() => applyPlanImport(preview, target), "CONFIRMATION_REQUIRED");
    expect(JSON.stringify(target)).toBe(before);
    const replaced = applyPlanImport(preview, target, "REPLACE_CURRENT_BOARD");
    expect(replaced.tasks.map(task => task.taskId)).toEqual(["plan:new"]); expect(target.tasks[0]?.title).toBe("Existing tasks");
    expectCode(() => applyPlanImport(preview, replaced, "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
  });
  it("failed validation leaves both target tasks and history unchanged", () => {
    const target = board(), before = JSON.stringify(target);
    expectCode(() => preparePlanImport('{"schemaVersion":2}', target), "UNSUPPORTED_VERSION");
    expect(JSON.stringify(target)).toBe(before);
  });
  it("rejects edited boards, switched scopes and copied/cancelled previews", () => {
    const target = board(), text = serializePlanningBoard(board());
    const preview = preparePlanImport(text, target);
    const edited = editTaskPlan(target, { projectId: PROJECT_A, taskId: "plan:one", title: "New local edit", description: "",
      proposedAgentRole: null, expectedVersion: 1, at: later });
    expectCode(() => applyPlanImport(preview, edited, "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
    const next = preparePlanImport(text, target);
    expectCode(() => applyPlanImport(next, newPlanningBoard(scope(PROJECT_B)), "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
    expectCode(() => applyPlanImport(next, target, "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
    const owned = preparePlanImport(text, target);
    expectCode(() => applyPlanImport({ ...owned }, target, "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
    cancelPlanImport(owned); expectCode(() => applyPlanImport(owned, target, "REPLACE_CURRENT_BOARD"), "STALE_PREVIEW");
  });
  it("restored Planned records remain blocked with no active worker or positive authority", () => {
    const source = markTaskPlanned(board(), { projectId: PROJECT_A, taskId: "plan:one", expectedVersion: 1, at: later });
    const target = newPlanningBoard(scope()), next = applyPlanImport(preparePlanImport(serializePlanningBoard(source), target), target, "REPLACE_CURRENT_BOARD");
    expect(planRolePreview(next.tasks[0]!)).toMatchObject({ runtimeState: "BLOCKED", activeWorkers: 0,
      executionAuthority: false, publicationAuthority: false, deliveryAuthority: false });
  });
});

describe("PROD02 local file action and transfer session races", () => {
  it.each([{ name: "plan.exe" }, { type: "text/html" }, { size: 0 }, { size: MAX_PLAN_FILE_BYTES + 1 }])("rejects file metadata %j before reading", async change => {
    const selected = file(undefined, change); await expect(readLocalPlanFile(selected)).rejects.toBeInstanceOf(PlanTransferError);
    expect(selected.text).not.toHaveBeenCalled();
  });
  it("accepts portable JSON names/empty MIME and validates actual bytes after reading", async () => {
    const selected = file(undefined, { name: "PLANS.JSON", type: "" }); expect(await readLocalPlanFile(selected)).toContain("schemaVersion");
    await expect(readLocalPlanFile(file("x".repeat(MAX_PLAN_FILE_BYTES + 1), { size: 1 }))).rejects.toMatchObject({ code: "FILE_SIZE" });
  });
  it("reads and previews without mutation, then requires an explicit replacement selection", async () => {
    const current = board(), original = JSON.stringify(current), session = new PlanTransferSession();
    await session.load(file(), () => current); expect(session.getState()).toMatchObject({ phase: "PREVIEW", confirmed: false });
    expectCode(() => session.apply(current), "CONFIRMATION_REQUIRED"); expect(JSON.stringify(current)).toBe(original);
    session.confirm(true); const next = session.apply(current);
    expect(next.tasks).toEqual(current.tasks); expect(session.getState().phase).toBe("APPLIED"); session.dispose();
  });
  it("cancellation invalidates the preview and late file read without changing the board", async () => {
    const current = board(), session = new PlanTransferSession(), waiting = deferred<string>();
    const selected = file(); selected.text.mockImplementationOnce(() => waiting.promise);
    const loading = session.load(selected, () => current); session.cancel(); waiting.resolve(serializePlanningBoard(board())); await loading;
    expect(session.getState()).toMatchObject({ phase: "CANCELLED", preview: null, confirmed: false });
    expectCode(() => session.apply(current), "STALE_PREVIEW"); expect(current.tasks).toHaveLength(1); session.dispose();
  });
  it("scope/board changes during reading reject results, and unmount fences away/back scope reuse", async () => {
    let current = board(); const session = new PlanTransferSession(), waiting = deferred<string>(), selected = file();
    selected.text.mockImplementationOnce(() => waiting.promise); const loading = session.load(selected, () => current);
    current = board(PROJECT_B); waiting.resolve(serializePlanningBoard(board())); await loading;
    expect(session.getState().error?.code).toBe("STALE_PREVIEW");
    const second = new PlanTransferSession(), pending = deferred<string>(), chosen = file(); chosen.text.mockImplementationOnce(() => pending.promise);
    current = board(); const lateRead = second.load(chosen, () => current); second.dispose(); second.activate();
    pending.resolve(serializePlanningBoard(board())); await lateRead;
    expect(second.getState().preview).toBeNull(); expectCode(() => second.apply(current), "STALE_PREVIEW"); session.dispose(); second.dispose();
  });
  it("an old file completion cannot overwrite a newer preview and each file resets confirmation", async () => {
    const current = board(), session = new PlanTransferSession(), pending = deferred<string>(), first = file();
    first.text.mockImplementationOnce(() => pending.promise); const firstRead = session.load(first, () => current);
    const newer = restorePlanningBoard(scope(PROJECT_A, "Newer file"), current.tasks);
    await session.load(file(serializePlanningBoard(newer)), () => current); session.confirm(true);
    pending.resolve(serializePlanningBoard(current)); await firstRead;
    expect(session.getState().preview?.sourceScope.label).toBe("Newer file");
    await session.load(file(), () => current); expect(session.getState().confirmed).toBe(false); session.dispose();
  });
  it("local read failures use fixed errors without reflecting private input", async () => {
    const session = new PlanTransferSession(), chosen = file(); chosen.text.mockRejectedValueOnce(new Error("SYNTHETIC_PRIVATE_PATH"));
    await session.load(chosen, () => board()); expect(session.getState().error?.code).toBe("READ_FAILED");
    expect(session.getState().error?.message).not.toContain("PRIVATE_PATH"); session.dispose();
  });
  it("requests one browser download with exact JSON/portable name and releases its URL", async () => {
    let payload: Blob | null = null;
    const port = { createURL: vi.fn((blob: Blob) => { payload = blob; return "blob:unit-plan"; }), request: vi.fn(), release: vi.fn() };
    const text = serializePlanningBoard(board()); requestPlanDownload(text, port);
    expect(port.request).toHaveBeenCalledExactlyOnceWith("blob:unit-plan", PLAN_DOWNLOAD_NAME);
    expect(port.release).toHaveBeenCalledExactlyOnceWith("blob:unit-plan");
    expect(await (payload as unknown as Blob).text()).toBe(text);
    port.request.mockImplementationOnce(() => { throw new Error("Browser refused download"); });
    expect(() => requestPlanDownload(text, port)).toThrow(); expect(port.release).toHaveBeenCalledTimes(2);
  });
  it("the actual Export action validates before any browser download effect", () => {
    const port = { createURL: vi.fn(() => "blob:validated"), request: vi.fn(), release: vi.fn() };
    exportPlanFile(board(), port); expect(port.request).toHaveBeenCalledOnce();
    expectCode(() => exportPlanFile(newPlanningBoard(scope()), port), "EMPTY_BOARD");
    const invalid = { ...board(), tasks: [{ ...board().tasks[0]!, executionAuthority: true }] } as unknown as PlanningBoard;
    expectCode(() => exportPlanFile(invalid, port), "INVALID_DOCUMENT");
    expect(port.createURL).toHaveBeenCalledOnce(); expect(port.request).toHaveBeenCalledOnce();
  });
});

describe("PROD02 actual React transfer controls and preview", () => {
  it("renders existing-scope export/import actions without executing browser/file APIs", () => {
    const html = renderToStaticMarkup(createElement(PlanTransferPanel, { board: board(), onReplace: vi.fn() }));
    expect(html).toContain("Export plan"); expect(html).toContain("Import plan"); expect(html).toContain('type="file"');
    expect(html).toContain('accept=".json,application/json"'); expect(html).toContain("No credentials"); expect(html).not.toContain("Run agent");
  });
  it("previews scope/count/version/replace effect and requires checkbox confirmation", () => {
    const target = board(PROJECT_B), preview = preparePlanImport(serializePlanningBoard(board()), target), actions = { onConfirm: vi.fn(), onApply: vi.fn(), onCancel: vi.fn() };
    const html = renderToStaticMarkup(createElement(PlanImportPreviewPanel, { preview, confirmed: false, ...actions }));
    expect(html).toContain("Schema version"); expect(html).toContain("Incoming tasks"); expect(html).toContain(PROJECT_A); expect(html).toContain(PROJECT_B);
    expect(html).toContain("No merge"); expect(html).toContain('disabled=""'); expect(html).toContain("Cancel import");
    const confirmed = renderToStaticMarkup(createElement(PlanImportPreviewPanel, { preview, confirmed: true, ...actions }));
    expect(confirmed).not.toContain('disabled=""'); cancelPlanImport(preview);
  });
  it("renders imported titles/notes/scope labels inertly in real preview/board components", () => {
    const source = restorePlanningBoard(scope(PROJECT_A, "<script>label</script>"), [{ ...board().tasks[0]!, title: "<script>task</script>", description: "<img src=x>" }]);
    const target = newPlanningBoard(scope()), preview = preparePlanImport(serializePlanningBoard(source), target);
    const html = renderToStaticMarkup(createElement(PlanImportPreviewPanel, { preview, confirmed: false, onConfirm: vi.fn(), onApply: vi.fn(), onCancel: vi.fn() }));
    expect(html).toContain("&lt;script&gt;label"); expect(html).not.toContain("<script>");
    const restored = applyPlanImport(preview, target, "REPLACE_CURRENT_BOARD");
    const rendered = renderToStaticMarkup(createElement(TaskPlanBoard, { board: restored, selectedId: "plan:one", onSelect: vi.fn(), onNew: vi.fn(), onSave: vi.fn(), onMark: vi.fn() }));
    expect(rendered).toContain("&lt;script&gt;task"); expect(rendered).not.toContain("<script>"); expect(rendered).not.toContain("<img");
    expect(rendered).toContain("Blocked — no active worker");
  });
});
