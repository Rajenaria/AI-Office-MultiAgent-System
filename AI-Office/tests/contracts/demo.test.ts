import { describe, expect, it } from "vitest";
import {
  DemoEventSchema, DemoTaskSchema, FreshnessSchema, ProjectSnapshotSchema,
} from "../../src/contracts/index.js";
import {
  bindingRefFixture, EVENT_TIME, eventFixture, knowledgeFixture,
  PROJECT_B, snapshotFixture, taskFixture,
} from "./fixtures.js";

describe("nonexecuting DEMO contracts", () => {
  it("accepts explicitly DEMO task and event descriptions", () => {
    expect(DemoTaskSchema.parse(taskFixture()).source).toBe("demo");
    expect(DemoEventSchema.parse(eventFixture()).source).toBe("demo");
  });

  it.each(["real", "mock", undefined])("rejects task/event source %s", (source) => {
    expect(DemoTaskSchema.safeParse({ ...taskFixture(), source }).success).toBe(false);
    expect(DemoEventSchema.safeParse({ ...eventFixture(), source }).success).toBe(false);
  });

  it.each([
    { ...taskFixture(), projectId: undefined },
    { ...taskFixture(), version: 0 },
    { ...taskFixture(), demoAgentId: "real-worker" },
    { ...taskFixture(), command: "must-not-be-an-execution-contract" },
    { ...taskFixture(), progressPercent: 90 },
  ])("rejects invalid task or execution claims %#", (input) => {
    expect(DemoTaskSchema.safeParse(input).success).toBe(false);
  });

  it.each([
    { ...eventFixture(), projectId: undefined },
    { ...eventFixture(), sequence: 0 },
    { ...eventFixture(), sequence: 1.5 },
    { ...eventFixture(), payloadVersion: 0 },
    { ...eventFixture(), payloadVersion: 2 },
    { ...eventFixture(), type: "command.executed" },
    { ...eventFixture(), tokensUsed: 100 },
  ])("rejects invalid event or invented execution/usage fields %#", (input) => {
    expect(DemoEventSchema.safeParse(input).success).toBe(false);
  });
});

describe("project snapshot composition", () => {
  it("accepts consistent records and freezes nested read-only data", () => {
    const snapshot = ProjectSnapshotSchema.parse(snapshotFixture());
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.tasks)).toBe(true);
    expect(Object.isFrozen(snapshot.tasks[0])).toBe(true);
  });

  it.each([
    { ...snapshotFixture(), binding: bindingRefFixture(PROJECT_B) },
    { ...snapshotFixture(), tasks: [taskFixture(PROJECT_B)] },
    { ...snapshotFixture(), events: [eventFixture(PROJECT_B)] },
    { ...snapshotFixture(), knowledge: [knowledgeFixture(PROJECT_B)] },
    { ...snapshotFixture(), binding: { ...bindingRefFixture(), bindingId: "" } },
    { ...snapshotFixture(), binding: { ...bindingRefFixture(), generation: -1 } },
    { ...snapshotFixture(), source: "real" },
    { ...snapshotFixture(), snapshotVersion: 0 },
  ])("rejects mixed project or malformed snapshot references %#", (input) => {
    expect(ProjectSnapshotSchema.safeParse(input).success).toBe(false);
  });

  it.each([
    { ...snapshotFixture(), events: [{ ...eventFixture(), taskId: "task:missing" }] },
    { ...snapshotFixture(), events: [{ ...eventFixture(), agentId: "demo:other" }] },
    { ...snapshotFixture(), tasks: [taskFixture(), taskFixture()] },
    { ...snapshotFixture(), events: [eventFixture(), { ...eventFixture(), sequence: 2 }] },
    { ...snapshotFixture(), events: [eventFixture(), { ...eventFixture(), eventId: "event:other" }] },
    { ...snapshotFixture(), knowledge: [knowledgeFixture(), knowledgeFixture()] },
  ])("rejects dangling/duplicate composed records %#", (input) => {
    expect(ProjectSnapshotSchema.safeParse(input).success).toBe(false);
  });

  it("permits multiple versions of the same scoped knowledge record", () => {
    expect(ProjectSnapshotSchema.safeParse({
      ...snapshotFixture(), knowledge: [knowledgeFixture(), { ...knowledgeFixture(), version: 2 }],
    }).success).toBe(true);
  });

  it.each(["unknown", "fresh", "stale", "disconnected"]) (
    "does not infer activity/completion from %s freshness", (status) => {
      const snapshot = ProjectSnapshotSchema.parse({
        ...snapshotFixture(), freshness: { status, lastEventAt: EVENT_TIME },
      });
      expect(snapshot.tasks[0]?.state).toBe("RUNNING");
      expect(snapshot.events[0]?.occurredAt).toBe(EVENT_TIME);
      expect(snapshot.source).toBe("demo");
    },
  );

  it("allows an empty snapshot with no known event time", () => {
    expect(ProjectSnapshotSchema.safeParse({
      ...snapshotFixture(), tasks: [], events: [], knowledge: [],
      freshness: { status: "unknown", lastEventAt: null },
    }).success).toBe(true);
  });

  it("rejects activity claims as freshness and requires observation time", () => {
    expect(FreshnessSchema.safeParse({ status: "coding-live", lastEventAt: EVENT_TIME }).success).toBe(false);
    expect(ProjectSnapshotSchema.safeParse({ ...snapshotFixture(), observedAt: undefined }).success).toBe(false);
  });
});
