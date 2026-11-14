import { z } from "zod";
import { DemoTaskSchema, ProjectIdSchema, ReferenceIdSchema, ShortTextSchema, TimestampSchema,
  WorkspaceBindingRefSchema } from "../../contracts/index.js";
import { assertBinding, SnapshotResponseSchema, WorkspaceResponseSchema } from "../api.js";
import type { ShellState } from "../workspace/controller.js";

// Proposed roles, not an installed/running agent registry or a dispatch target.
export const PLANNING_ROLES = Object.freeze([
  { id: "agent:pm", label: "PM" }, { id: "agent:frontend", label: "Frontend" },
  { id: "agent:backend", label: "Backend" }, { id: "agent:design", label: "UI/UX" },
  { id: "agent:database", label: "Database" }, { id: "agent:research", label: "Research" },
  { id: "agent:qa", label: "QA" }, { id: "agent:devops", label: "DevOps" },
] as const);
const RoleSchema = ReferenceIdSchema.refine(value => PLANNING_ROLES.some(role => role.id === value), "Unknown proposed role").nullable();
export const PlanningScopeSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("TEMPORARY"), projectId: ProjectIdSchema, label: ShortTextSchema }).readonly(),
  z.strictObject({ kind: z.literal("ATTACHED"), projectId: ProjectIdSchema, label: ShortTextSchema,
    binding: WorkspaceBindingRefSchema }).refine(scope => scope.projectId === scope.binding.projectId).readonly(),
]);
export type PlanningScope = z.infer<typeof PlanningScopeSchema>;

// Reuse task identity/title/version/time fields. User plans are NOT demo runtime
// records and never enter ProjectSnapshot or the fixture/authority databases.
export const TaskPlanSchema = DemoTaskSchema.unwrap().pick({ projectId: true, taskId: true, title: true,
  version: true, updatedAt: true }).extend({ description: z.string().max(2000), proposedAgentRole: RoleSchema,
  state: z.enum(["DRAFT", "PLANNED"]), source: z.literal("client_planning") })
  .refine(task => task.state !== "PLANNED" || task.proposedAgentRole !== null, "A planned task needs a proposed role").readonly();
export type TaskPlan = z.infer<typeof TaskPlanSchema>;
type Change = Readonly<{ taskId: string; version: number; action: "CREATED" | "EDITED" | "PLANNED"; at: string }>;
export type PlanningBoard = Readonly<{ scope: PlanningScope; tasks: readonly TaskPlan[]; changes: readonly Change[] }>;
const FieldsSchema = z.strictObject({ title: z.string().trim().pipe(ShortTextSchema),
  description: z.string().max(2000).transform(value => value.trim()), proposedAgentRole: RoleSchema });
export type PlanFormValues = z.input<typeof FieldsSchema>;
const CreateSchema = FieldsSchema.extend({ projectId: ProjectIdSchema, taskId: ReferenceIdSchema, at: TimestampSchema });
const EditSchema = CreateSchema.extend({ expectedVersion: z.int().positive() });
const MarkSchema = z.strictObject({ projectId: ProjectIdSchema, taskId: ReferenceIdSchema,
  expectedVersion: z.int().positive(), at: TimestampSchema });

export function planningScopeKey(input: PlanningScope): string {
  const scope = PlanningScopeSchema.parse(input);
  return JSON.stringify(scope.kind === "ATTACHED" ? [scope.kind, scope.projectId, scope.binding.bindingId, scope.binding.generation] :
    [scope.kind, scope.projectId]);
}
export function newPlanningBoard(input: PlanningScope): PlanningBoard {
  return Object.freeze({ scope: PlanningScopeSchema.parse(input), tasks: Object.freeze([]), changes: Object.freeze([]) });
}
// Restore only validated planning records. This creates no registered project,
// runtime context or persistent history. File confirmation belongs to transfer.ts.
export function restorePlanningBoard(scopeInput: PlanningScope, tasksInput: unknown): PlanningBoard {
  const scope = PlanningScopeSchema.parse(scopeInput), tasks = TaskPlanSchema.array().max(100).readonly().parse(tasksInput);
  const ids = new Set<string>();
  for (const task of tasks) {
    if (task.projectId !== scope.projectId) throw new Error("PLAN_PROJECT_MISMATCH");
    if (ids.has(task.taskId)) throw new Error("PLAN_ID_CONFLICT");
    ids.add(task.taskId);
  }
  return Object.freeze({ scope, tasks, changes: Object.freeze([]) });
}
function assertProject(board: PlanningBoard, projectId: string) {
  if (board.scope.projectId !== projectId) throw new Error("PLAN_PROJECT_MISMATCH");
}
function currentTask(board: PlanningBoard, input: z.infer<typeof MarkSchema>): TaskPlan {
  assertProject(board, input.projectId);
  const task = board.tasks.find(item => item.taskId === input.taskId);
  if (!task || task.projectId !== input.projectId) throw new Error("PLAN_NOT_FOUND");
  if (task.version !== input.expectedVersion) throw new Error("PLAN_VERSION_CONFLICT");
  if (input.at < task.updatedAt) throw new Error("PLAN_CLOCK_REGRESSION");
  return task;
}
function record(board: PlanningBoard, task: TaskPlan, action: Change["action"]): PlanningBoard {
  const exists = board.tasks.some(item => item.taskId === task.taskId);
  return Object.freeze({ scope: board.scope,
    tasks: Object.freeze(exists ? board.tasks.map(item => item.taskId === task.taskId ? task : item) : [...board.tasks, task]),
    changes: Object.freeze([...board.changes, Object.freeze({ taskId: task.taskId, version: task.version,
      action, at: task.updatedAt })].slice(-100)) });
}
export function createTaskPlan(board: PlanningBoard, input: unknown): PlanningBoard {
  const value = CreateSchema.parse(input); assertProject(board, value.projectId);
  if (board.tasks.length >= 100) throw new Error("PLAN_LIMIT_REACHED");
  if (board.tasks.some(task => task.taskId === value.taskId)) throw new Error("PLAN_ID_CONFLICT");
  return record(board, TaskPlanSchema.parse({ projectId: value.projectId, taskId: value.taskId, title: value.title,
    description: value.description, proposedAgentRole: value.proposedAgentRole, version: 1,
    updatedAt: value.at, state: "DRAFT", source: "client_planning" }), "CREATED");
}
export function editTaskPlan(board: PlanningBoard, input: unknown): PlanningBoard {
  const value = EditSchema.parse(input), task = currentTask(board, value);
  return record(board, TaskPlanSchema.parse({ ...task, title: value.title, description: value.description,
    proposedAgentRole: value.proposedAgentRole, version: task.version + 1, updatedAt: value.at, state: "DRAFT" }), "EDITED");
}
export function markTaskPlanned(board: PlanningBoard, input: unknown): PlanningBoard {
  const value = MarkSchema.parse(input), task = currentTask(board, value);
  if (!task.proposedAgentRole) throw new Error("PLAN_ROLE_REQUIRED");
  if (task.state === "PLANNED") return board;
  return record(board, TaskPlanSchema.parse({ ...task, version: task.version + 1, updatedAt: value.at, state: "PLANNED" }), "PLANNED");
}
export function savePlanForm(board: PlanningBoard, taskId: string, values: PlanFormValues, at: string): PlanningBoard {
  const task = board.tasks.find(item => item.taskId === taskId);
  const command = { ...values, projectId: board.scope.projectId, taskId, at };
  return task ? editTaskPlan(board, { ...command, expectedVersion: task.version }) : createTaskPlan(board, command);
}
// Current UI association only, not workspace authorization. Uncertain/mismatched
// transport hides associated plans; no browser-created binding is substituted.
export function attachedPlanningScope(context: Pick<ShellState, "workspace" | "snapshot" | "sessionReady" | "connection" | "freshness" | "busy">): PlanningScope | null {
  if (context.busy || !context.sessionReady || context.connection !== "CONNECTED" || context.freshness !== "fresh") return null;
  const workspace = WorkspaceResponseSchema.safeParse(context.workspace), snapshot = SnapshotResponseSchema.safeParse(context.snapshot);
  if (!workspace.success || !snapshot.success || workspace.data.view.state !== "READY" || snapshot.data.snapshot.freshness.status !== "fresh") return null;
  try { assertBinding(snapshot.data.snapshot.binding, workspace.data.view.binding); } catch { return null; }
  const projectId = workspace.data.view.identity.projectId;
  if (snapshot.data.identity.projectId !== projectId) return null;
  return PlanningScopeSchema.parse({ kind: "ATTACHED", projectId, label: `Project ${projectId.slice(0, 8)}`, binding: workspace.data.view.binding });
}
export function planRolePreview(task: TaskPlan) {
  const plan = TaskPlanSchema.parse(task);
  return Object.freeze({ label: PLANNING_ROLES.find(role => role.id === plan.proposedAgentRole)?.label ?? "Unassigned",
    taskState: plan.state, runtimeState: "BLOCKED" as const, activeWorkers: 0 as const,
    executionAuthority: false as const, publicationAuthority: false as const, deliveryAuthority: false as const });
}
