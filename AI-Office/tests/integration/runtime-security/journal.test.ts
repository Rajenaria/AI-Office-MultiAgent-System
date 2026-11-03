import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { securityFixture, type SecurityFixture } from "./fixtures/helpers.js";
import { FixtureAttemptJournal } from "../../../src/server/runtime-security/journal.js";
import { probeRequest, SyntheticSecurityHarness } from "../../../src/server/runtime-security/supervisor.js";

describe("S13-S14 durable fixture journal and uncertainty", () => {
  let f: SecurityFixture;
  beforeEach(async () => { f = await securityFixture(); });
  afterEach(async () => { await f.cleanup(); });
  const filename = () => path.join(f.root, "journals/attempts.json");
  it("holds a single writer and rejects duplicate command keys across attempts", async () => {
    const a = await f.issue(), record = await f.harness.journal.read(a.attemptId);
    await expect(FixtureAttemptJournal.open(f.root)).rejects.toThrow();
    await expect(f.harness.register(a, randomUUID())).rejects.toThrow("DUPLICATE_ATTEMPT");
    const other = await f.authority.issue(await f.options());
    await expect(f.harness.register(other, record.idempotencyKey)).rejects.toThrow("DUPLICATE_ATTEMPT_OR_COMMAND");
  });
  it("preserves terminal evidence, history versions and idempotency after reopen", async () => {
    const a = await f.issue(), grant = await f.approve(a);
    const original = (await (await f.harness.dispatch(a, probeRequest(a), grant.requestId)).done).record;
    await f.harness.close();
    const reopened = await FixtureAttemptJournal.open(f.root);
    try {
      expect(await reopened.read(a.attemptId)).toEqual(original);
      await expect(reopened.create(a, randomUUID())).rejects.toThrow("DUPLICATE_ATTEMPT");
      expect(original.history.map((event) => event.sequence)).toEqual(original.history.map((_, i) => i + 1));
      await expect(reopened.transition(a.attemptId, "LAUNCHING")).rejects.toThrow("INVALID_ATTEMPT_TRANSITION");
    } finally { await reopened.close(); }
  });
  it("requires reconciliation on unresolved launch without inferring completion from an absent PID", async () => {
    const a = await f.issue(), record = await f.harness.journal.read(a.attemptId);
    await f.harness.close();
    const journal = await FixtureAttemptJournal.open(f.root);
    // Separate fixture attempt; these transition inputs are synthetic, not OS observations.
    const context = { ...a, attemptId: randomUUID() };
    await journal.create(context, randomUUID());
    await journal.transition(context.attemptId, "APPROVAL_PENDING"); await journal.transition(context.attemptId, "APPROVAL_GRANTED");
    await journal.transition(context.attemptId, "LAUNCHING"); await journal.close();
    const recovered = await FixtureAttemptJournal.open(f.root);
    try {
      const pending = await recovered.read(context.attemptId);
      expect(pending.phase).toBe("RECONCILIATION_REQUIRED"); expect(pending.outcome).toBeNull(); expect(pending.lastProcess).toBeNull();
      expect(pending.history.slice(-2).map((event) => event.phase)).toEqual(["UNCERTAIN", "RECONCILIATION_REQUIRED"]);
      await expect(recovered.create(context, record.idempotencyKey)).rejects.toThrow("DUPLICATE_ATTEMPT");
      await expect(recovered.transition(context.attemptId, "RUNNING")).rejects.toThrow("INVALID_ATTEMPT_TRANSITION");
      expect((await recovered.reconcile(context.attemptId, "FAILED")).outcome?.reason).toBe("CONTROLLER_RECONCILED");
    } finally { await recovered.close(); }
  });
  it("fails closed on external tampering without overwriting it", async () => {
    const a = await f.issue(); const original = await readFile(filename());
    await writeFile(filename(), "corrupt fixture evidence");
    try { await expect(f.harness.journal.read(a.attemptId)).rejects.toThrow("JOURNAL_CHANGED_EXTERNALLY");
      expect(await readFile(filename(), "utf8")).toBe("corrupt fixture evidence");
    } finally { await writeFile(filename(), original); } // Test-owned injected bytes restored for teardown only.
  });
  it("detects deletion of the initialization seal during a live instance", async () => {
    const context = await f.issue(), seal = path.join(f.root, "journals/initialized"), original = await readFile(seal);
    await unlink(seal);
    try { await expect(f.harness.journal.read(context.attemptId)).rejects.toThrow("JOURNAL_SEAL_CHANGED_OR_MISSING"); }
    finally { await writeFile(seal, original); }
  });
  it("rejects a missing initialized journal across restart without creating an empty one", async () => {
    await f.issue(); await f.harness.close(); await unlink(filename());
    await expect(FixtureAttemptJournal.open(f.root)).rejects.toThrow("JOURNAL_MISSING_OR_PARTIAL");
    expect(await readdir(path.dirname(filename()))).not.toContain("attempts.json");
  });
  it("preserves interrupted atomic-write evidence and requires review on reopen", async () => {
    const context = await f.authority.issue(await f.options()); await f.harness.close();
    const journal = await FixtureAttemptJournal.open(f.root, () => { throw new Error("SYNTHETIC_RENAME_FAILURE"); });
    try { await expect(journal.create(context, randomUUID())).rejects.toThrow("SYNTHETIC_RENAME_FAILURE"); }
    finally { await journal.close(); }
    expect((await readdir(path.dirname(filename()))).some((name) => name.endsWith(".tmp"))).toBe(true);
    await expect(FixtureAttemptJournal.open(f.root)).rejects.toThrow("JOURNAL_INTERRUPTED_REVIEW_REQUIRED");
  });
  it("does not dispatch an unresolved durable identity in a new harness instance", async () => {
    const context = await f.authority.issue(await f.options()); await f.harness.close();
    const journal = await FixtureAttemptJournal.open(f.root); await journal.create(context, randomUUID());
    await journal.transition(context.attemptId, "APPROVAL_PENDING"); await journal.close();
    const next = await SyntheticSecurityHarness.create(f.authority);
    try {
      expect((await next.journal.read(context.attemptId)).phase).toBe("RECONCILIATION_REQUIRED");
      await expect(next.register(context, randomUUID())).rejects.toThrow("DUPLICATE_ATTEMPT");
      await expect(next.dispatch(context, probeRequest(context), randomUUID())).rejects.toThrow("REGISTERED_CONTEXT_REQUIRED");
    } finally { await next.close(); }
  });
});
