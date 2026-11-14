import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/web/App.js";
import { TaskPlanBoard } from "../../src/web/components/TaskPlanningPanel.js";
import { PlanningScopeSchema, TaskPlanSchema, attachedPlanningScope, createTaskPlan, editTaskPlan, markTaskPlanned,
  newPlanningBoard, planRolePreview, planningScopeKey, savePlanForm, type PlanningBoard } from "../../src/web/planning/model.js";
import { ShellController } from "../../src/web/workspace/controller.js";
import { fakeApi, PROJECT_A, PROJECT_B, ready, snapshot } from "./fixtures.js";

const time = "2026-11-14T01:00:00.000Z", later = "2026-11-14T01:00:01.000Z";
const scope = (projectId = PROJECT_A) => PlanningScopeSchema.parse({ kind: "TEMPORARY", projectId, label: "Website planning" });
const command = (projectId = PROJECT_A) => ({ projectId, taskId: "plan:first", title: "Build account settings",
  description: "Review layout and validation", proposedAgentRole: "agent:frontend", at: time });
const boardWithTask = () => createTaskPlan(newPlanningBoard(scope()), command());
function renderBoard(board: PlanningBoard, selectedId: string | null = "plan:first") {
  return renderToStaticMarkup(createElement(TaskPlanBoard, { board, selectedId, onSelect: vi.fn(), onNew: vi.fn(), onSave: vi.fn(), onMark: vi.fn() }));
}

describe("PROD01 temporary planning domain and ownership", () => {
  it("creates a user plan using existing task identity/title/version/time fields, distinct from DEMO runtime", () => {
    const initial = newPlanningBoard(scope()), board = createTaskPlan(initial, { ...command(), title: "  Build account settings  " });
    expect(board.tasks[0]).toMatchObject({ projectId: PROJECT_A, title: "Build account settings", state: "DRAFT", source: "client_planning", version: 1 });
    expect(initial.tasks).toEqual([]); expect(board.changes).toEqual([{ taskId: "plan:first", version: 1, action: "CREATED", at: time }]);
    expect(TaskPlanSchema.safeParse({ ...board.tasks[0], source: "demo", state: "RUNNING" }).success).toBe(false);
  });
  it.each(["", "   ", "x".repeat(201)])("rejects invalid title %s", title => {
    expect(() => createTaskPlan(newPlanningBoard(scope()), { ...command(), title })).toThrow();
  });
  it("rejects unknown role, excessive notes and execution overrides", () => {
    for (const change of [{ proposedAgentRole: "agent:unknown" }, { description: "x".repeat(2001) }, { executionAuthority: true }, { state: "RUNNING" }])
      expect(() => createTaskPlan(newPlanningBoard(scope()), { ...command(), ...change })).toThrow();
  });
  it("requires matching project ownership on create, edit and status changes", () => {
    const board = boardWithTask();
    expect(() => createTaskPlan(board, { ...command(PROJECT_B), taskId: "plan:foreign" })).toThrow("PLAN_PROJECT_MISMATCH");
    expect(() => editTaskPlan(board, { ...command(PROJECT_B), expectedVersion: 1 })).toThrow("PLAN_PROJECT_MISMATCH");
    expect(() => markTaskPlanned(board, { projectId: PROJECT_B, taskId: "plan:first", expectedVersion: 1, at: later })).toThrow("PLAN_PROJECT_MISMATCH");
  });
  it("prevents duplicate IDs and stale edits without mutating a current plan", () => {
    const board = boardWithTask(), before = JSON.stringify(board);
    expect(() => createTaskPlan(board, command())).toThrow("PLAN_ID_CONFLICT");
    expect(() => editTaskPlan(board, { ...command(), expectedVersion: 2 })).toThrow("PLAN_VERSION_CONFLICT");
    expect(JSON.stringify(board)).toBe(before);
  });
  it("moves Draft to Planned without conferring execution and requires a proposed role", () => {
    const emptyRole = createTaskPlan(newPlanningBoard(scope()), { ...command(), proposedAgentRole: null });
    expect(() => markTaskPlanned(emptyRole, { projectId: PROJECT_A, taskId: "plan:first", expectedVersion: 1, at: later })).toThrow("PLAN_ROLE_REQUIRED");
    const board = markTaskPlanned(boardWithTask(), { projectId: PROJECT_A, taskId: "plan:first", expectedVersion: 1, at: later });
    expect(board.tasks[0]).toMatchObject({ state: "PLANNED", version: 2 });
    expect(planRolePreview(board.tasks[0]!)).toEqual({ label: "Frontend", taskState: "PLANNED", runtimeState: "BLOCKED", activeWorkers: 0,
      executionAuthority: false, publicationAuthority: false, deliveryAuthority: false });
    expect(markTaskPlanned(board, { projectId: PROJECT_A, taskId: "plan:first", expectedVersion: 2, at: later })).toBe(board);
  });
  it("editing a Planned task returns it to Draft and records its new role/version", () => {
    const planned = markTaskPlanned(boardWithTask(), { projectId: PROJECT_A, taskId: "plan:first", expectedVersion: 1, at: time });
    const edited = editTaskPlan(planned, { ...command(), title: "Add validation", proposedAgentRole: "agent:qa", expectedVersion: 2, at: later });
    expect(edited.tasks[0]).toMatchObject({ state: "DRAFT", proposedAgentRole: "agent:qa", version: 3 });
    expect(planned.tasks[0]?.state).toBe("PLANNED"); expect(edited.changes.map(c => c.action)).toEqual(["CREATED", "PLANNED", "EDITED"]);
  });
  it("does not accept a client clock regression or an unknown task status command", () => {
    const board = boardWithTask();
    expect(() => editTaskPlan(board, { ...command(), expectedVersion: 1, at: "2026-11-13T00:00:00.000Z" })).toThrow("PLAN_CLOCK_REGRESSION");
    expect(() => markTaskPlanned(board, { projectId: PROJECT_A, taskId: "plan:missing", expectedVersion: 1, at: later })).toThrow("PLAN_NOT_FOUND");
  });
  it("maps actual editor values through the same save function on create and edit", () => {
    const initial = newPlanningBoard(scope());
    const first = savePlanForm(initial, "plan:form", { title: "  New page  ", description: " Notes ", proposedAgentRole: "agent:design" }, time);
    const second = savePlanForm(first, "plan:form", { title: "Review page", description: "QA checks", proposedAgentRole: "agent:qa" }, later);
    expect(first.tasks[0]).toMatchObject({ title: "New page", description: "Notes", proposedAgentRole: "agent:design" });
    expect(second.tasks).toHaveLength(1); expect(second.tasks[0]).toMatchObject({ title: "Review page", version: 2, proposedAgentRole: "agent:qa" });
  });
  it("caps task count and keeps plans/change arrays and entries immutable", () => {
    let board = newPlanningBoard(scope());
    for (let i = 0; i < 100; i++) board = createTaskPlan(board, { ...command(), taskId: `plan:${i}` });
    expect(() => createTaskPlan(board, { ...command(), taskId: "plan:overflow" })).toThrow("PLAN_LIMIT_REACHED");
    expect(Object.isFrozen(board)).toBe(true); expect(Object.isFrozen(board.tasks)).toBe(true);
    expect(board.tasks.every(Object.isFrozen)).toBe(true); expect(board.changes.every(Object.isFrozen)).toBe(true);
  });
  it("uses identity/binding keys, with no filesystem path or cross-project state substitution", () => {
    expect(planningScopeKey(scope(PROJECT_A))).not.toBe(planningScopeKey(scope(PROJECT_B)));
    const a = PlanningScopeSchema.parse({ kind: "ATTACHED", projectId: PROJECT_A, label: "A",
      binding: { projectId: PROJECT_A, bindingId: "binding:a", generation: 1 } });
    if (a.kind !== "ATTACHED") throw new Error("Attached test scope required");
    expect(planningScopeKey(a)).not.toBe(planningScopeKey({ ...a, binding: { ...a.binding, generation: 2 } }));
    expect(PlanningScopeSchema.safeParse({ ...a, projectId: PROJECT_B }).success).toBe(false);
    expect(planningScopeKey(a)).not.toMatch(/[\\/]/);
  });
});

describe("PROD01 existing workspace integration and actual React presentation", () => {
  it("uses the current controller workspace/snapshot, hides stale scope and follows project switching", async () => {
    vi.useFakeTimers();
    const api = fakeApi(), controller = new ShellController(api);
    try {
      await controller.connect("synthetic-transport-only");
      expect(attachedPlanningScope(controller.getState())?.projectId).toBe(PROJECT_A);
      expect(attachedPlanningScope({ ...controller.getState(), freshness: "stale" })).toBeNull();
      expect(attachedPlanningScope({ ...controller.getState(), snapshot: snapshot(PROJECT_B) })).toBeNull();
      await controller.open("B fixture"); expect(attachedPlanningScope(controller.getState())?.projectId).toBe(PROJECT_B);
      await controller.detach(); expect(attachedPlanningScope(controller.getState())).toBeNull();
    } finally { controller.stop(); vi.useRealTimers(); }
  });
  it.each(["DISCONNECTED", "SESSION_INVALID"] as const)("%s cannot display attached project plans as current", connection => {
    const controller = new ShellController(fakeApi());
    const context = { ...controller.getState(), workspace: ready(), snapshot: snapshot(), freshness: "fresh" as const, sessionReady: true, connection };
    expect(attachedPlanningScope(context)).toBeNull(); controller.stop();
  });
  it("renders planning in the actual App shell without backend startup or a disconnected demo page", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain("Task planning"); expect(html).toContain("Start temporary planning workspace");
    expect(html).toContain("disappear on reload"); expect(html).toContain("Agent activity"); expect(html).toContain("Shared Brain");
    expect(html).not.toContain("Run agent"); expect(html).not.toContain("Dispatch");
  });
  it("renders a real model-created plan, its role preview, status and non-persistent metadata", () => {
    const html = renderBoard(boardWithTask());
    expect(html).toContain("Build account settings"); expect(html).toContain("Frontend"); expect(html).toContain("Draft");
    expect(html).toContain("Blocked — no active worker"); expect(html).toContain("not persisted");
    expect(html).toContain("Mark as planned"); expect(html).toContain("CREATED");
    expect(html).not.toMatch(/>Run|>Execute|>Approve|>Dispatch/);
  });
  it("disables marking an unassigned plan and represents planned state distinctly from completion", () => {
    const unassigned = createTaskPlan(newPlanningBoard(scope()), { ...command(), proposedAgentRole: null });
    expect(renderBoard(unassigned)).toContain('disabled=""');
    const planned = markTaskPlanned(boardWithTask(), { projectId: PROJECT_A, taskId: "plan:first", expectedVersion: 1, at: later });
    const html = renderBoard(planned); expect(html).toContain("Planned"); expect(html).toContain("not approval, dispatch, progress or completion");
  });
  it("escapes user task text without executing markup or treating it as generated work", () => {
    const board = createTaskPlan(newPlanningBoard(scope()), { ...command(), title: '<script>alert("x")</script>', description: "<img src=x onerror=bad()>" });
    const html = renderBoard(board); expect(html).toContain("&lt;script&gt;"); expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img"); expect(html).toContain("Temporary browser memory");
  });
});
