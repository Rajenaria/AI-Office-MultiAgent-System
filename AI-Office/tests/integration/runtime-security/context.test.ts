import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fileRequest, securityFixture, type SecurityFixture } from "./fixtures/helpers.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("R01 atomic in-process synthetic issuance", () => {
  let f: SecurityFixture;
  let releases: Array<() => void>;
  let pending: Promise<unknown>[];
  beforeEach(async () => { f = await securityFixture(); releases = []; pending = []; });
  afterEach(async () => {
    for (const release of releases) release();
    await Promise.allSettled(pending);
    vi.restoreAllMocks();
    await f.checkSentinels(); await f.cleanup();
  });
  function track<T>(promise: Promise<T>) {
    pending.push(promise); void promise.catch(() => undefined); return promise;
  }
  function pause() {
    const entered = deferred(), gate = deferred(); releases.push(gate.resolve);
    return { entered: entered.promise, release: gate.resolve,
      async hold() { entered.resolve(); await gate.promise; } };
  }
  function pauseInspection() {
    const control = pause(), inspect = f.manager.inspect.bind(f.manager);
    vi.spyOn(f.manager, "inspect").mockImplementationOnce(async (scope) => {
      const validated = await inspect(scope); // Actual binding validation still runs.
      await control.hold(); return validated;
    });
    return control;
  }
  function pauseVerification(call = 1, fail = false) {
    const control = pause(), verify = f.registry.verify.bind(f.registry); let calls = 0;
    vi.spyOn(f.registry, "verify").mockImplementation(async () => {
      await verify();
      if (++calls === call) { await control.hold(); if (fail) throw new Error("SYNTHETIC_VALIDATION_FAILURE"); }
    });
    return control;
  }

  it("rejects a different task while the first genuine request is pending, without replacing its ownership", async () => {
    const input = { ...await f.options(), taskId: "task:first", attemptGeneration: 3 };
    const control = pauseInspection(), first = track(f.authority.issue(input));
    await control.entered;
    const duplicate = track(f.authority.issue({ ...input, taskId: "task:second", attemptGeneration: 4,
      policyRef: "policy:other", readScope: ["work"], writeScope: ["read"] }));
    await expect(duplicate).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    control.release(); const context = await first;
    expect(context).toMatchObject({ projectId: input.scope.projectId, taskId: "task:first", attemptGeneration: 3,
      workspaceBindingId: input.scope.binding.bindingId, policyRef: input.policyRef,
      readScope: input.readScope, writeScope: input.writeScope, projectRoot: f.a });
    expect(Object.isFrozen(context)).toBe(true); expect(Object.isFrozen(context.writeScope)).toBe(true);
    await f.authority.assert(context);
    expect((await f.harness.policy.evaluate(context, fileRequest(context, "read/input.txt"))).canonicalPath).toContain("project-a");
    await f.harness.register(context, randomUUID());
    await expect(f.harness.register(context, randomUUID())).rejects.toThrow("DUPLICATE_ATTEMPT");
  });

  it("rejects project B using pending project A attempt identity after a genuine foreground switch", async () => {
    const a = { ...await f.options(), taskId: "task:A" }, control = pauseInspection();
    const first = track(f.authority.issue(a)); await control.entered;
    const b = { ...await f.options("b"), taskId: "task:B", attemptId: a.attemptId, attemptGeneration: 2 };
    expect(b.scope.projectId).not.toBe(a.scope.projectId);
    await expect(track(f.authority.issue(b))).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    control.release(); const context = await first;
    expect(context).toMatchObject({ projectId: a.scope.projectId, taskId: "task:A", projectRoot: f.a,
      workspaceBindingId: a.scope.binding.bindingId, attemptGeneration: 1 });
    await f.authority.assert(context);
    await expect(f.harness.policy.evaluate(context, { ...fileRequest(context, "read/input.txt"),
      projectId: b.scope.projectId, workspaceBindingId: b.scope.binding.bindingId })).rejects.toThrow("REQUEST_SCOPE_MISMATCH");
  });

  it("rejects an identical concurrent request instead of silently creating another attempt", async () => {
    const input = await f.options(), control = pauseInspection();
    const first = track(f.authority.issue(input)); await control.entered;
    await expect(track(f.authority.issue(input))).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    control.release(); const context = await first; await f.authority.assert(context);
    await expect(f.authority.issue(input)).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
  });

  it("allows a distinct attempt to finish while another request remains held", async () => {
    const input = await f.options(), control = pauseInspection(); let firstFinished = false;
    const first = track(f.authority.issue(input).then((context) => { firstFinished = true; return context; }));
    await control.entered;
    const second = await track(f.authority.issue({ ...input, attemptId: randomUUID(), taskId: "task:independent" }));
    expect(firstFinished).toBe(false); await f.authority.assert(second);
    control.release(); const original = await first;
    expect(original.attemptId).not.toBe(second.attemptId); expect(original.taskId).toBe(input.taskId);
    await f.authority.assert(original);
  });

  it("retains a failed post-binding reservation and never publishes or transfers it", async () => {
    const input = await f.options();
    // verify #1 belongs to genuine manager.inspect; #2 is the issuer's check.
    const control = pauseVerification(2, true); let published = false;
    const first = track(f.authority.issue(input).then((context) => { published = true; return context; }));
    await control.entered;
    await expect(track(f.authority.issue({ ...input, taskId: "task:competitor" }))).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    control.release(); await expect(first).rejects.toThrow("SYNTHETIC_VALIDATION_FAILURE");
    expect(published).toBe(false);
    await expect(f.authority.issue(input)).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    await expect(f.harness.journal.read(input.attemptId)).rejects.toThrow("ATTEMPT_NOT_REGISTERED");
  });

  it("expires a pending issuance without extending its lifetime at delayed publication", async () => {
    const input = { ...await f.options(), lifetimeMs: 10 }, control = pauseInspection();
    const first = track(f.authority.issue(input)); await control.entered;
    f.advance(11); control.release(); await expect(first).rejects.toThrow("CONTEXT_EXPIRED");
    await expect(f.authority.issue(input)).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
  });

  it("checks expiry again after final asynchronous validation before publishing", async () => {
    const input = { ...await f.options(), lifetimeMs: 10 };
    const control = pauseVerification(3), first = track(f.authority.issue(input));
    await control.entered; f.advance(11); control.release();
    await expect(first).rejects.toThrow("CONTEXT_EXPIRED");
    await expect(f.authority.issue(input)).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
  });

  it("does not let an in-flight assertion revive an issued context after revocation", async () => {
    const input = await f.options(), context = await f.authority.issue(input);
    const control = pauseVerification(), assertion = track(f.authority.assert(context));
    await control.entered; f.authority.revoke(context); control.release();
    await expect(assertion).rejects.toThrow("CONTEXT_NOT_ISSUED_OR_REVOKED");
    await expect(f.authority.issue(input)).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    await expect(f.harness.register(context, randomUUID())).rejects.toThrow("CONTEXT_NOT_ISSUED_OR_REVOKED");
  });

  it("rejects expiry that occurs during an existing context assertion", async () => {
    const context = await f.authority.issue({ ...await f.options(), lifetimeMs: 10 });
    const control = pauseVerification(), assertion = track(f.authority.assert(context));
    await control.entered; f.advance(11); control.release();
    await expect(assertion).rejects.toThrow("CONTEXT_EXPIRED");
  });

  it("preserves safe correction of rejected binding input before a context can exist", async () => {
    const input = await f.options(), forged = randomUUID();
    await expect(f.authority.issue({ ...input, scope: { projectId: forged,
      binding: { ...input.scope.binding, projectId: forged } } })).rejects.toThrow();
    const context = await f.authority.issue(input); await f.authority.assert(context);
    expect(context.projectId).toBe(input.scope.projectId);
  });

  it("rejects malformed basic identity before reserving a valid attempt ID", async () => {
    const input = await f.options();
    await expect(f.authority.issue({ ...input, attemptGeneration: 0 })).rejects.toThrow();
    const context = await f.authority.issue(input); await f.authority.assert(context);
    await expect(f.harness.policy.evaluate(context, { ...fileRequest(context, "read/input.txt"), attemptGeneration: 2 }))
      .rejects.toThrow("REQUEST_SCOPE_MISMATCH");
  });
});
