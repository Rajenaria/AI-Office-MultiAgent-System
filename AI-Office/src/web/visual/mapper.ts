import { ProjectSnapshotSchema, type Freshness, type ProjectSnapshot } from "../../contracts/index.js";

// Pure display projection. It cannot dispatch work, alter tasks, promote knowledge
// or infer completion from freshness. This M01 input supports DEMO events only.
export function mapVisualAgents(input: ProjectSnapshot, freshness: Freshness["status"]) {
  const snapshot = ProjectSnapshotSchema.parse(input);
  return snapshot.tasks.map((task) => {
    const event = snapshot.events.filter((item) => item.taskId === task.taskId).at(-1);
    return Object.freeze({ projectId: snapshot.projectId, agentId: task.demoAgentId, taskId: task.taskId,
      title: task.title, taskState: task.state, activityType: event?.type ?? "UNKNOWN", eventSource: snapshot.source,
      occurredAt: event?.occurredAt ?? null, freshness, assetReference: null });
  });
}
