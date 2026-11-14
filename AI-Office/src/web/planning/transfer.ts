import { z } from "zod";
import { PlanningScopeSchema, TaskPlanSchema, planningScopeKey, restorePlanningBoard,
  type PlanningBoard, type PlanningScope } from "./model.js";

export const PLAN_FILE_FORMAT = "ai-office.task-plans" as const;
export const PLAN_FILE_VERSION = 1 as const;
export const MAX_PLAN_FILE_BYTES = 1024 * 1024;
export const PLAN_DOWNLOAD_NAME = "ai-office-task-plans-v1.json";
export const PlanningExportSchema = z.strictObject({ format: z.literal(PLAN_FILE_FORMAT), schemaVersion: z.literal(PLAN_FILE_VERSION),
  scope: PlanningScopeSchema, tasks: TaskPlanSchema.array().min(1).max(100).readonly() }).readonly();
type PlanningExport = z.infer<typeof PlanningExportSchema>;
export type TransferErrorCode = "EMPTY_BOARD" | "FILE_TYPE" | "FILE_SIZE" | "INVALID_JSON" | "UNSUPPORTED_VERSION" |
  "INVALID_DOCUMENT" | "SCOPE_MISMATCH" | "CONFIRMATION_REQUIRED" | "STALE_PREVIEW" | "READ_FAILED" | "SERIALIZATION_FAILED";
const messages: Record<TransferErrorCode, string> = {
  EMPTY_BOARD: "Create at least one task plan before exporting.",
  FILE_TYPE: "Choose a local .json file with a JSON file type.",
  FILE_SIZE: "Choose a nonempty JSON file no larger than 1 MiB. Reduce plan notes if the export is too large.",
  INVALID_JSON: "The selected file is not valid JSON.",
  UNSUPPORTED_VERSION: "This plan file version is unsupported. Only schema version 1 is accepted; no migration was applied.",
  INVALID_DOCUMENT: "The file contains invalid planning records, contradictory scope data or unexpected fields. Nothing was imported.",
  SCOPE_MISMATCH: "The file does not match this planning scope. Attached project and binding references must match exactly.",
  CONFIRMATION_REQUIRED: "Confirm replacement of the current in-memory board before applying the import.",
  STALE_PREVIEW: "The scope or board changed, or the preview was cancelled. Select and preview the file again.",
  READ_FAILED: "The local file could not be read. No task plans were changed.",
  SERIALIZATION_FAILED: "The plan download could not be prepared. No task plans were changed.",
};
export class PlanTransferError extends Error {
  constructor(readonly code: TransferErrorCode) { super(messages[code]); this.name = "PlanTransferError"; }
}
function fail(code: TransferErrorCode): never { throw new PlanTransferError(code); }
function records(board: PlanningBoard): PlanningBoard {
  try { return restorePlanningBoard(board.scope, board.tasks); } catch { return fail("INVALID_DOCUMENT"); }
}
function fingerprint(board: PlanningBoard): string {
  const value = records(board);
  return JSON.stringify({ scope: value.scope, tasks: value.tasks }); // Local equality only; not an authenticated digest.
}
function boundedText(text: string) {
  if (typeof text !== "string" || text.length > MAX_PLAN_FILE_BYTES || new TextEncoder().encode(text).byteLength > MAX_PLAN_FILE_BYTES) fail("FILE_SIZE");
}
export function serializePlanningBoard(board: PlanningBoard): string {
  const value = records(board);
  if (!value.tasks.length) fail("EMPTY_BOARD");
  let text: string;
  try {
    const document = PlanningExportSchema.parse({ format: PLAN_FILE_FORMAT, schemaVersion: PLAN_FILE_VERSION,
      scope: value.scope, tasks: value.tasks });
    text = JSON.stringify(document, null, 2) + "\n";
  } catch { return fail("SERIALIZATION_FAILED"); }
  boundedText(text);
  return text;
}
export function parsePlanningExport(text: string): PlanningExport {
  boundedText(text);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return fail("INVALID_JSON"); }
  if (raw && typeof raw === "object" && "schemaVersion" in raw && raw.schemaVersion !== PLAN_FILE_VERSION) fail("UNSUPPORTED_VERSION");
  try {
    const document = PlanningExportSchema.parse(raw);
    restorePlanningBoard(document.scope, document.tasks); // Project agreement, unique IDs and actual model semantics.
    return document;
  } catch { return fail("INVALID_DOCUMENT"); }
}

export type PlanImportPreview = Readonly<{ schemaVersion: 1; sourceScope: PlanningScope; targetScope: PlanningScope;
  taskCount: number; replacedTaskCount: number; warnings: readonly string[] }>;
type Pending = { baseline: string; targetKey: string; replacement: PlanningBoard };
const pending = new WeakMap<object, Pending>();
export function preparePlanImport(text: string, currentBoard: PlanningBoard): PlanImportPreview {
  const document = parsePlanningExport(text), current = records(currentBoard);
  if (document.scope.kind !== current.scope.kind) fail("SCOPE_MISMATCH");
  if (current.scope.kind === "ATTACHED" && planningScopeKey(document.scope) !== planningScopeKey(current.scope)) fail("SCOPE_MISMATCH");
  const rebound = document.tasks.map(task => ({ ...task, projectId: current.scope.projectId }));
  const replacement = restorePlanningBoard(current.scope, rebound);
  const warnings = ["Only local planning data is restored. The file does not register a project or grant execution permission.",
    "Replacement discards the current in-memory tasks. No merge is performed; session change history restarts empty."];
  if (document.scope.projectId !== current.scope.projectId) warnings.push("Temporary task project references will be reassociated with the explicitly selected temporary context. Task IDs, versions and states are preserved.");
  const preview = Object.freeze({ schemaVersion: PLAN_FILE_VERSION, sourceScope: document.scope, targetScope: current.scope,
    taskCount: replacement.tasks.length, replacedTaskCount: current.tasks.length, warnings: Object.freeze(warnings) });
  pending.set(preview, { baseline: fingerprint(current), targetKey: planningScopeKey(current.scope), replacement });
  return preview;
}
export function cancelPlanImport(preview: PlanImportPreview | null): void { if (preview) pending.delete(preview); }
export function applyPlanImport(preview: PlanImportPreview | null, currentBoard: PlanningBoard,
  confirmation?: "REPLACE_CURRENT_BOARD"): PlanningBoard {
  const entry = preview ? pending.get(preview) : undefined;
  if (!entry) fail("STALE_PREVIEW");
  if (entry.targetKey !== planningScopeKey(currentBoard.scope) || entry.baseline !== fingerprint(currentBoard)) {
    cancelPlanImport(preview); fail("STALE_PREVIEW");
  }
  if (confirmation !== "REPLACE_CURRENT_BOARD") fail("CONFIRMATION_REQUIRED");
  cancelPlanImport(preview); // One use; copied/serialized/cancelled previews are not accepted.
  return entry.replacement;
}

export type LocalPlanFile = Readonly<{ name: string; type: string; size: number; text(): Promise<string> }>;
export async function readLocalPlanFile(file: LocalPlanFile): Promise<string> {
  if (typeof file.name !== "string" || file.name.length > 255 || !/^[^/\\]+\.json$/i.test(file.name) ||
    typeof file.type !== "string" || !["", "application/json", "text/json"].includes(file.type.split(";")[0]!.trim().toLowerCase())) fail("FILE_TYPE");
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_PLAN_FILE_BYTES) fail("FILE_SIZE");
  let text: string;
  try { text = await file.text(); } catch { return fail("READ_FAILED"); }
  boundedText(text);
  return text;
}

export type TransferState = Readonly<{ phase: "IDLE" | "READING" | "PREVIEW" | "APPLIED" | "CANCELLED" | "ERROR";
  preview: PlanImportPreview | null; confirmed: boolean; error: PlanTransferError | null; notice: string | null }>;
// UI transfer state only. No task backend, identity verifier, filesystem path or network dependency.
export class PlanTransferSession {
  private state: TransferState = Object.freeze({ phase: "IDLE", preview: null, confirmed: false, error: null, notice: null });
  private listeners = new Set<() => void>();
  private generation = 0;
  private active = true;
  getState = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(value: TransferState) { this.state = Object.freeze(value); this.listeners.forEach(listener => listener()); }
  activate() { if (!this.active) { this.active = true; this.generation++; } }
  dispose() { this.active = false; this.generation++; cancelPlanImport(this.state.preview); }
  cancel() {
    this.generation++; cancelPlanImport(this.state.preview);
    this.update({ phase: "CANCELLED", preview: null, confirmed: false, error: null, notice: "Import cancelled. Current tasks are unchanged." });
  }
  confirm(value: boolean) { if (this.state.preview) this.update({ ...this.state, confirmed: value === true }); }
  async load(file: LocalPlanFile, current: () => PlanningBoard): Promise<void> {
    if (!this.active) return;
    const initial = current(), baseline = fingerprint(initial), ticket = ++this.generation;
    cancelPlanImport(this.state.preview);
    this.update({ phase: "READING", preview: null, confirmed: false, error: null, notice: "Reading local plan file…" });
    try {
      const text = await readLocalPlanFile(file);
      if (!this.active || ticket !== this.generation) return;
      const latest = current();
      if (fingerprint(latest) !== baseline) fail("STALE_PREVIEW");
      const preview = preparePlanImport(text, latest);
      this.update({ phase: "PREVIEW", preview, confirmed: false, error: null, notice: "Valid plan file. Review and confirm replacement; nothing has been imported yet." });
    } catch (error) {
      if (this.active && ticket === this.generation) this.update({ phase: "ERROR", preview: null, confirmed: false,
        error: error instanceof PlanTransferError ? error : new PlanTransferError("READ_FAILED"), notice: null });
    }
  }
  apply(board: PlanningBoard): PlanningBoard {
    if (!this.active) fail("STALE_PREVIEW");
    try {
      const next = applyPlanImport(this.state.preview, board, this.state.confirmed ? "REPLACE_CURRENT_BOARD" : undefined);
      this.generation++;
      this.update({ phase: "APPLIED", preview: null, confirmed: false, error: null,
        notice: `Imported ${next.tasks.length} task plan(s). Current scope retained; local session history restarted. Nothing was sent to an agent.` });
      return next;
    } catch (error) {
      const failure = error instanceof PlanTransferError ? error : new PlanTransferError("INVALID_DOCUMENT");
      if (failure.code !== "CONFIRMATION_REQUIRED") cancelPlanImport(this.state.preview);
      this.update({ ...this.state, phase: "ERROR", error: failure, notice: null,
        ...(failure.code !== "CONFIRMATION_REQUIRED" ? { preview: null, confirmed: false } : {}) });
      throw failure;
    }
  }
}
