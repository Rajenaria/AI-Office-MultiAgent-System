import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile, realpath, rename } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { securityFixture, type SecurityFixture } from "./fixtures/helpers.js";
import { probeRequest } from "../../../src/server/runtime-security/supervisor.js";
import { isWithin } from "../../../src/server/workspace/paths.js";

describe("S10-S12 owned non-AI processes and cancellation", () => {
  let f: SecurityFixture;
  beforeEach(async () => { f = await securityFixture(); });
  afterEach(async () => { vi.unstubAllEnvs(); await f.checkSentinels(); await f.cleanup(); });

  it("records a real PID, successful terminal observation and bounded stdout/stderr", async () => {
    const a = await f.issue(), input = probeRequest(a, "output"), approval = await f.approve(a, input);
    const result = await (await f.harness.dispatch(a, input, approval.requestId)).done;
    expect(result.pid).toBeGreaterThan(0); expect(result.record.lastProcess?.pid).toBe(result.pid);
    expect(result.record.phase).toBe("COMPLETED"); expect(result.record.outcome).toMatchObject({ code: 0, reason: "NORMAL" });
    expect(result.stdout.length).toBe(4096); expect(result.stderr.length).toBe(4096); expect(result.outputTruncated).toBe(true);
    expect(() => process.kill(result.pid!, 0)).toThrow();
  });
  it("cancels before dispatch and never starts the cancelled attempt", async () => {
    const a = await f.issue(); const first = await f.harness.cancel(a), second = await f.harness.cancel(a);
    expect(first.phase).toBe("INTERRUPTED"); expect(second.version).toBe(first.version); expect(first.lastProcess).toBeNull();
    await expect(f.harness.dispatch(a, probeRequest(a), "missing")).rejects.toThrow("ATTEMPT_CANCELLED");
  });
  it("cancels pending consent and rejects a later simulated approval", async () => {
    const a = await f.issue(); await f.harness.requestApproval(a, probeRequest(a));
    expect((await f.harness.cancel(a)).phase).toBe("INTERRUPTED");
    await expect(f.approve(a)).rejects.toThrow("ATTEMPT_CANCELLED");
  });
  it("cancels during startup before spawn using a controlled gate", async () => {
    await f.cleanup();
    let release!: () => void, entered!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const atSpawn = new Promise<void>((resolve) => { entered = resolve; });
    f = await securityFixture(async () => { entered(); await gate; });
    const a = await f.issue(), grant = await f.approve(a);
    const dispatch = f.harness.dispatch(a, probeRequest(a), grant.requestId);
    await atSpawn; const cancellation = f.harness.cancel(a); release();
    await expect(dispatch).rejects.toThrow("CANCELLED_BEFORE_SPAWN");
    expect((await cancellation).phase).toBe("INTERRUPTED"); expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
  });
  it("cancels active work idempotently and observes no further writes, without rolling earlier writes back", async () => {
    const a = await f.issue(), input = probeRequest(a, "wait"), grant = await f.approve(a, input);
    const handle = await f.harness.dispatch(a, input, grant.requestId);
    const pulse = path.join(f.a, "work/pulse.txt");
    await expect.poll(async () => (await readFile(pulse)).length, { timeout: 2000 }).toBeGreaterThan(0);
    const [first, second] = await Promise.all([f.harness.cancel(a), f.harness.cancel(a)]);
    expect(first.phase).toBe("INTERRUPTED"); expect(second.phase).toBe("INTERRUPTED");
    const result = await handle.done; expect(result.forced).toBe(false); expect(result.record.outcome?.reason).toBe("CANCELLED");
    const bytes = await readFile(pulse); await delay(70); expect(await readFile(pulse)).toEqual(bytes); expect(bytes.length).toBeGreaterThan(0);
  });
  it("escalates a stubborn owned probe without terminating by name or stale journal PID", async () => {
    const a = await f.issue(), input = probeRequest(a, "ignore-cancel"), grant = await f.approve(a, input);
    const handle = await f.harness.dispatch(a, input, grant.requestId);
    expect((await f.harness.cancel(a)).phase).toBe("INTERRUPTED");
    const result = await handle.done; expect(result.forced).toBe(true); expect(result.record.outcome?.reason).toBe("FORCED");
    expect(() => process.kill(handle.pid!, 0)).toThrow();
  });
  it("observes a cooperative child and grandchild exit on cancellation", async () => {
    const a = await f.issue(), input = probeRequest(a, "tree"), grant = await f.approve(a, input);
    const handle = await f.harness.dispatch(a, input, grant.requestId); await f.harness.cancel(a);
    const result = await handle.done;
    expect(result.record.phase).toBe("INTERRUPTED"); expect(result.descendants).toHaveLength(2); expect(result.descendantsStopped).toBe(true);
    for (const pid of [handle.pid!, ...result.descendants]) expect(() => process.kill(pid, 0)).toThrow();
  });
  it("force-stops only its stubborn parent handle while cooperative descendants exit on IPC disconnect", async () => {
    const a = await f.issue(), input = probeRequest(a, "tree-ignore-cancel"), grant = await f.approve(a, input);
    const handle = await f.harness.dispatch(a, input, grant.requestId); await f.harness.cancel(a);
    const result = await handle.done;
    expect(result.forced).toBe(true); expect(result.descendants).toHaveLength(2); expect(result.descendantsStopped).toBe(true);
    expect(result.record.phase).toBe("INTERRUPTED");
    for (const pid of result.descendants) expect(() => process.kill(pid, 0)).toThrow();
  });
  it("keeps observed child failure separate from cancellation and never invents success", async () => {
    const a = await f.issue(), input = probeRequest(a, "fail"), grant = await f.approve(a, input);
    const handle = await f.harness.dispatch(a, input, grant.requestId);
    const cancelled = await f.harness.cancel(a), result = await handle.done;
    expect(cancelled.phase).toBe("FAILED"); expect(result.record.outcome?.code).toBe(7); expect(result.stderr).toContain("SYNTHETIC_PROBE_FAILURE");
  });
  it("handles exit racing cancellation and cancellation after normal completion", async () => {
    const a = await f.issue(), grant = await f.approve(a);
    const handle = await f.harness.dispatch(a, probeRequest(a), grant.requestId);
    const result = await handle.done;
    expect(result.record.phase).toBe("COMPLETED");
    expect((await f.harness.cancel(a)).phase).toBe("COMPLETED");
    const b = await f.issue("b"), other = await f.approve(b);
    const racing = await f.harness.dispatch(b, probeRequest(b), other.requestId);
    const terminal = await f.harness.cancel(b);
    expect(["COMPLETED", "INTERRUPTED", "RECONCILIATION_REQUIRED"]).toContain(terminal.phase);
    expect((await racing.done).record.phase).toBe(terminal.phase);
  });
  it("records an actual OS spawn error from a removed fixture cwd without retry", async () => {
    await f.cleanup();
    let ownedRoot = "", work = "";
    f = await securityFixture(async () => {
      const source = await realpath(work), destination = path.join(path.dirname(work), "work-moved");
      expect(isWithin(ownedRoot, source) && isWithin(ownedRoot, destination)).toBe(true);
      await rename(source, destination);
    });
    ownedRoot = f.root; work = path.join(f.a, "work");
    const a = await f.issue(), grant = await f.approve(a);
    const result = await (await f.harness.dispatch(a, probeRequest(a), grant.requestId)).done;
    expect(result.record.phase).toBe("FAILED"); expect(result.pid).toBeNull(); expect(result.record.outcome?.reason).toBe("START_FAILED");
    await expect(f.harness.dispatch(a, probeRequest(a), grant.requestId)).rejects.toThrow("DUPLICATE_OR_UNAPPROVED");
  });
});

describe("S15 host checks are not OS containment", () => {
  it("blocks canary requests through policy but demonstrates unrestricted same-user direct read", async () => {
    const f = await securityFixture(); vi.stubEnv("AI_OFFICE_FAKE_PARENT_SECRET", f.canary);
    try {
      const a = await f.issue();
      const { probeMode: _, ...base } = probeRequest(a);
      await expect(f.harness.policy.evaluate(a, { ...base, operation: "READ", path: path.join(f.root, "dummy-credentials/fake-token.txt") })).rejects.toThrow();
      const input = probeRequest(a, "canary"), grant = await f.approve(a, input);
      const result = await (await f.harness.dispatch(a, input, grant.requestId)).done;
      const canary = result.messages.find((message) => message.type === "canary");
      expect(canary?.canaryReadable).toBe(true); // Deliberate evidence AGAINST OS containment.
      expect(canary?.environmentKeys).not.toContain("AI_OFFICE_FAKE_PARENT_SECRET");
      expect(canary?.environmentKeys).not.toContain("NODE_OPTIONS");
      expect(result.stdout + result.stderr + JSON.stringify(result.record)).not.toContain(f.canary);
      await f.checkSentinels();
    } finally { vi.unstubAllEnvs(); await f.cleanup(); }
  });
});
