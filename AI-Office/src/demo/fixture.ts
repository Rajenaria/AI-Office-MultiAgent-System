import { createHash } from "node:crypto";
import { z } from "zod";
import { DemoEventSchema, DemoTaskSchema, KnowledgeVersionSchema } from "../contracts/index.js";

// One explicit synthetic fixture batch. No command, runtime, scheduler or usage.
export const DemoSeedSchema = z.strictObject({ knowledge: KnowledgeVersionSchema, task: DemoTaskSchema, event: DemoEventSchema })
  .refine((seed) => seed.knowledge.source === "fixture" && seed.knowledge.status === "CANDIDATE", "Fixture knowledge stays CANDIDATE");
export type DemoSeed = z.infer<typeof DemoSeedSchema>;
export const FIXTURE_TIME = "2026-10-28T12:00:00.000Z";

export function demoFixture(projectId: string, label: string, markdown: string): DemoSeed {
  return DemoSeedSchema.parse({
    knowledge: { projectId, knowledgeId: "knowledge:fixture", version: 1, relativePath: ".ai-office/brain/fixture.md",
      contentHash: createHash("sha256").update(markdown, "utf8").digest("hex"), source: "fixture", status: "CANDIDATE", createdAt: FIXTURE_TIME },
    task: { projectId, taskId: "task:fixture", demoAgentId: "demo:frontend", title: label, state: "IDLE", version: 1, updatedAt: FIXTURE_TIME, source: "demo" },
    event: { projectId, eventId: "event:fixture", taskId: "task:fixture", agentId: "demo:frontend", sequence: 1,
      type: "demo.task.created", occurredAt: FIXTURE_TIME, payloadVersion: 1, source: "demo" },
  });
}
