// Synthetic contract data only; no user projects, model activity or IO.
export const PROJECT_A = "11111111-1111-4111-8111-111111111111";
export const PROJECT_B = "22222222-2222-4222-8222-222222222222";
export const EVENT_TIME = "2026-10-28T12:00:00.000Z";
export const OBSERVED_TIME = "2026-10-28T12:00:02.000Z";

export const identityFixture = (projectId = PROJECT_A) => ({
  schemaVersion: 1 as const, projectId, createdAt: EVENT_TIME,
});

export const bindingRefFixture = (projectId = PROJECT_A) => ({
  bindingId: "binding:fixture", projectId, generation: 1,
});

export const knowledgeFixture = (projectId = PROJECT_A) => ({
  projectId, knowledgeId: "knowledge:fixture", version: 1,
  relativePath: ".ai-office/brain/fixture-v1.md", contentHash: "a".repeat(64),
  source: "fixture" as const, status: "CANDIDATE" as const, createdAt: EVENT_TIME,
});

export const taskFixture = (projectId = PROJECT_A) => ({
  projectId, taskId: "task:fixture", demoAgentId: "demo:frontend",
  title: "Contract fixture task", state: "RUNNING" as const,
  version: 1, updatedAt: EVENT_TIME, source: "demo" as const,
});

export const eventFixture = (projectId = PROJECT_A) => ({
  projectId, eventId: "event:fixture", taskId: "task:fixture", agentId: "demo:frontend",
  sequence: 1, type: "demo.task.created" as const,
  occurredAt: EVENT_TIME, payloadVersion: 1 as const, source: "demo" as const,
});

export const snapshotFixture = (projectId = PROJECT_A) => ({
  schemaVersion: 1 as const, projectId, binding: bindingRefFixture(projectId), snapshotVersion: 1,
  tasks: [taskFixture(projectId)], events: [eventFixture(projectId)], knowledge: [knowledgeFixture(projectId)],
  observedAt: OBSERVED_TIME, source: "demo" as const,
  freshness: { status: "fresh" as const, lastEventAt: EVENT_TIME },
});

export const skillFixture = () => ({
  skillId: "skill:fixture", runtime: { runtimeId: "runtime:unverified" }, scope: "global" as const,
  installationStatus: "UNKNOWN" as const, discoveryStatus: "NOT_VERIFIED" as const,
  compatibilityStatus: "UNKNOWN" as const, sessionAvailability: "UNKNOWN" as const,
  sessionVerification: "NOT_VERIFIED" as const, allowedByPolicy: "UNKNOWN" as const,
  enforcementVerification: "NOT_VERIFIED" as const,
});
