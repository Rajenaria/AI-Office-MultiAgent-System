import { z } from "zod";
import {
  PositiveVersionSchema, ProjectIdSchema, ReferenceIdSchema,
  ShortTextSchema, TimestampSchema,
} from "./primitives.js";
import { KnowledgeVersionSchema } from "./knowledge.js";
import { WorkspaceBindingRefSchema } from "./project.js";

const demoAgentId = z.string().max(128).regex(/^demo:[A-Za-z0-9][A-Za-z0-9._:-]*$/);

export const DemoTaskSchema = z.strictObject({
  projectId: ProjectIdSchema,
  taskId: ReferenceIdSchema,
  demoAgentId,
  title: ShortTextSchema,
  state: z.enum([
    "IDLE", "RUNNING", "WAITING_APPROVAL", "BLOCKED", "PAUSED",
    "VALIDATING", "COMPLETED", "FAILED",
  ]),
  version: PositiveVersionSchema,
  updatedAt: TimestampSchema,
  source: z.literal("demo"),
}).readonly();
export type DemoTask = z.infer<typeof DemoTaskSchema>;

// Descriptive fixtures only: no commands, dispatch, token usage or inferred
// completion. Application mock data is a separate future concern; a real coding
// event is not a DEMO event merely because its UI uses mock application data.
export const DemoEventSchema = z.strictObject({
  projectId: ProjectIdSchema,
  eventId: ReferenceIdSchema,
  taskId: ReferenceIdSchema,
  agentId: demoAgentId,
  sequence: PositiveVersionSchema,
  type: z.enum(["demo.task.created", "demo.task.updated"]),
  occurredAt: TimestampSchema,
  payloadVersion: z.literal(1),
  source: z.literal("demo"),
}).readonly();
export type DemoEvent = z.infer<typeof DemoEventSchema>;

export const FreshnessSchema = z.strictObject({
  status: z.enum(["unknown", "fresh", "stale", "disconnected"]),
  // Event time is distinct from snapshot observation time; no clock is read.
  lastEventAt: TimestampSchema.nullable(),
}).readonly();
export type Freshness = z.infer<typeof FreshnessSchema>;

export const ProjectSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  projectId: ProjectIdSchema,
  binding: WorkspaceBindingRefSchema,
  snapshotVersion: PositiveVersionSchema,
  tasks: z.array(DemoTaskSchema).readonly(),
  events: z.array(DemoEventSchema).readonly(),
  knowledge: z.array(KnowledgeVersionSchema).readonly(),
  observedAt: TimestampSchema,
  source: z.literal("demo"),
  freshness: FreshnessSchema,
}).superRefine((snapshot, ctx) => {
  if (snapshot.binding.projectId !== snapshot.projectId) {
    ctx.addIssue({ code: "custom", path: ["binding", "projectId"], message: "Project mismatch" });
  }
  const taskIds = new Map<string, string>();
  const eventIds = new Set<string>();
  const sequences = new Set<number>();
  const knowledgeVersions = new Set<string>();
  const records = { tasks: snapshot.tasks, events: snapshot.events, knowledge: snapshot.knowledge };
  for (const [name, entries] of Object.entries(records)) {
    entries.forEach((entry, index) => {
      if (entry.projectId !== snapshot.projectId) {
        ctx.addIssue({ code: "custom", path: [name, index, "projectId"], message: "Project mismatch" });
      }
    });
  }
  snapshot.tasks.forEach((task, index) => {
    if (taskIds.has(task.taskId)) {
      ctx.addIssue({ code: "custom", path: ["tasks", index, "taskId"], message: "Duplicate task" });
    }
    taskIds.set(task.taskId, task.demoAgentId);
  });
  snapshot.events.forEach((event, index) => {
    if (taskIds.get(event.taskId) !== event.agentId) {
      ctx.addIssue({ code: "custom", path: ["events", index, "taskId"], message: "Event must reference its task and agent" });
    }
    if (eventIds.has(event.eventId) || sequences.has(event.sequence)) {
      ctx.addIssue({ code: "custom", path: ["events", index], message: "Duplicate event identity or sequence" });
    }
    eventIds.add(event.eventId);
    sequences.add(event.sequence);
  });
  snapshot.knowledge.forEach((record, index) => {
    const key = `${record.knowledgeId}/${record.version}`;
    if (knowledgeVersions.has(key)) {
      ctx.addIssue({ code: "custom", path: ["knowledge", index], message: "Duplicate knowledge version" });
    }
    knowledgeVersions.add(key);
  });
}).readonly();
export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;
