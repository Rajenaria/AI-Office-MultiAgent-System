import { describe, expect, it } from "vitest";
import { mapVisualAgents } from "../../src/web/visual/mapper.js";
import { snapshot } from "./fixtures.js";

describe("pure DEMO visual adapter", () => {
  it("preserves supported backend state/source and optional assets", () => {
    const input = snapshot().snapshot; const original = JSON.stringify(input);
    const result = mapVisualAgents(input, "fresh")[0]!;
    expect(result.taskState).toBe("RUNNING"); expect(result.eventSource).toBe("demo");
    expect(result.activityType).toBe("demo.task.created"); expect(result.assetReference).toBeNull();
    expect(JSON.stringify(input)).toBe(original);
  });
  it.each(["unknown", "stale", "disconnected"] as const)("%s transport does not imply coding or completion", (freshness) => {
    const input = { ...snapshot().snapshot, events: [] };
    const result = mapVisualAgents(input, freshness)[0]!;
    expect(result.activityType).toBe("UNKNOWN"); expect(result.taskState).toBe("RUNNING"); expect(result.freshness).toBe(freshness);
  });
  it("rejects unsupported activity instead of mapping it into coding", () => {
    const input = snapshot().snapshot;
    expect(() => mapVisualAgents({ ...input, source: "real" } as never, "fresh")).toThrow();
    expect(() => mapVisualAgents({ ...input, tasks: [{ ...input.tasks[0], state: "MAGIC_CODING" }] } as never, "fresh")).toThrow();
  });
});
