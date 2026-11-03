import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { rename, symlink } from "node:fs/promises";
import path from "node:path";
import { securityFixture, decisionFor, type SecurityFixture } from "./fixtures/helpers.js";
import { probeRequest } from "../../../src/server/runtime-security/supervisor.js";

describe("S07-S09 explicit simulated decisions", () => {
  let f: SecurityFixture;
  beforeEach(async () => { f = await securityFixture(); });
  afterEach(async () => { await f.cleanup(); });
  it("denies missing, pending and unknown approvals without creating a process", async () => {
    const a = await f.issue(), input = probeRequest(a);
    await expect(f.harness.dispatch(a, input, randomUUID())).rejects.toThrow("DUPLICATE_OR_UNAPPROVED");
    const request = await f.harness.requestApproval(a, input);
    await expect(f.harness.dispatch(a, input, request.requestId)).rejects.toThrow("DUPLICATE_OR_UNAPPROVED");
    expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
    await expect(f.harness.decide(a, { source: "synthetic-trusted-controller" }, decisionFor(request))).rejects.toThrow("TRUSTED_TEST_CONTROLLER");
  });
  it("accepts only the trusted test controller, consumes once, and blocks duplicate dispatch", async () => {
    const a = await f.issue(), request = await f.approve(a);
    const first = f.harness.dispatch(a, probeRequest(a), request.requestId);
    const duplicate = f.harness.dispatch(a, probeRequest(a), request.requestId);
    const handle = await first;
    await expect(duplicate).rejects.toThrow("DUPLICATE_OR_UNAPPROVED");
    expect((await handle.done).record.phase).toBe("COMPLETED");
    await expect(f.harness.approvals.consume(a, await f.harness.policy.evaluate(a, probeRequest(a)), request.requestId)).rejects.toThrow("EXPLICIT_UNUSED");
  });
  it("keeps explicit denial terminal across decision retries", async () => {
    const a = await f.issue(), request = await f.approve(a, probeRequest(a), "DENY");
    await expect(f.harness.decide(a, f.harness.controller, decisionFor(request))).rejects.toThrow("NO_PENDING_APPROVAL");
    await expect(f.harness.dispatch(a, probeRequest(a), request.requestId)).rejects.toThrow();
    expect((await f.harness.journal.read(a.attemptId)).phase).toBe("APPROVAL_DENIED");
  });
  it("rejects expired approval and stale attempt generation", async () => {
    const a = await f.issue(), request = await f.harness.requestApproval(a, probeRequest(a), 10);
    f.advance(11);
    await expect(f.harness.decide(a, f.harness.controller, decisionFor(request))).rejects.toThrow("APPROVAL_STALE");
    const b = await f.issue("b"), other = await f.harness.requestApproval(b, probeRequest(b));
    await expect(f.harness.decide(b, f.harness.controller, { ...decisionFor(other), attemptGeneration: 99 })).rejects.toThrow("DECISION_SCOPE_MISMATCH");
  });
  it("invalidates granted permission when the proposed probe operation changes", async () => {
    const a = await f.issue(), grant = await f.approve(a);
    await expect(f.harness.dispatch(a, probeRequest(a, "wait"), grant.requestId)).rejects.toThrow("APPROVAL_STALE_OR_SCOPE_MISMATCH");
    await expect(f.harness.dispatch(a, probeRequest(a), grant.requestId)).rejects.toThrow("EXPLICIT_UNUSED");
    expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
  });
  it("rejects an approval that expires after an explicit grant and before dispatch", async () => {
    const a = await f.issue(), input = probeRequest(a);
    const request = await f.harness.requestApproval(a, input, 10);
    await f.harness.decide(a, f.harness.controller, decisionFor(request)); f.advance(11);
    await expect(f.harness.dispatch(a, input, request.requestId)).rejects.toThrow("APPROVAL_STALE_OR_SCOPE_MISMATCH");
    expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
  });
  it("rechecks a directory replaced with an actual junction after approval", async () => {
    const a = await f.issue(), approval = await f.approve(a);
    await rename(path.join(f.a, "work"), path.join(f.a, "saved-work"));
    await symlink(path.join(f.b, "work"), path.join(f.a, "work"), "junction");
    await expect(f.harness.dispatch(a, probeRequest(a), approval.requestId)).rejects.toThrow();
    expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
    await f.checkSentinels();
  });
  it.each(["projectId", "taskId", "attemptId", "fingerprint"])("rejects decision field substitution: %s", async (field) => {
    const a = await f.issue(), request = await f.harness.requestApproval(a, probeRequest(a));
    const response = { ...decisionFor(request), [field]: field.endsWith("Id") && field !== "taskId" ? randomUUID() : "tampered" };
    await expect(f.harness.decide(a, f.harness.controller, response)).rejects.toThrow();
    expect((await f.harness.journal.read(a.attemptId)).lastProcess).toBeNull();
  });
  it("rejects project B using project A approval", async () => {
    const a = await f.issue(), approvalA = await f.approve(a);
    const b = await f.issue("b"); await f.approve(b);
    await expect(f.harness.dispatch(b, probeRequest(b), approvalA.requestId)).rejects.toThrow("APPROVAL_STALE_OR_SCOPE_MISMATCH");
  });
});
