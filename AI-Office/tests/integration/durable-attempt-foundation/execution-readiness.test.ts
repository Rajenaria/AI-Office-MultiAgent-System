import { randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import children from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import { evaluateWorkerAdmission } from "../../../src/contracts/execution-fence.js";
import { hash, type Attempt } from "../../../src/server/attempt-control/contracts.js";
import { type ExecutionReadiness, type ReadinessReason } from "../../../src/server/attempt-control/execution-readiness.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { openTestConnection } from "../../../src/server/attempt-control/test-storage.js";
import { advance, expected, failure, fixture, identity, issueCommand, own, terminalCommand, transitionCommand } from "./helpers.js";
import { clockAt, leasedFixture } from "./lease-helpers.js";

function readyFixture() {
  const f = fixture(), command = issueCommand(f.ref);
  let attempt = f.repository.issue(command).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = f.repository.transition(transitionCommand(attempt, command.ownerNonce, phase));
  const request = { expected: expected(attempt, command.ownerNonce), securityRevision: 1 };
  return { ...f, command, attempt, request, raw: own(openTestConnection(f.ref)) };
}
function denied(result: ExecutionReadiness, reason: ReadinessReason): void {
  expect(result).toMatchObject({ eligible: false, executionAuthority: false });
  expect(result.reasons).toContain(reason);
  expect(result.reason).toBe(result.reasons[0]);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.reasons)).toBe(true);
}
function snapshot(f: ReturnType<typeof readyFixture>) {
  return ["runtime_attempts", "runtime_owner_epochs", "runtime_attempt_events", "runtime_execution_security"].map(
    table => f.raw.db.prepare(`SELECT * FROM ${table}`).all());
}

describe("PI02 persisted default denial", () => {
  it("D01 newly issued CREATED attempt inherits persisted UNKNOWN, not approval", () => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt;
    const result = f.repository.assessExecutionReadiness({ expected: expected(a, command.ownerNonce), securityRevision: 1 });
    denied(result, "SECURITY_STATE_UNKNOWN");
    expect(result.observed).toMatchObject({ securityState: "UNKNOWN", securityRevision: 1 });
  });
  it("D02 absent security row denies without recreating it", () => {
    const f = readyFixture(); f.raw.db.exec("DELETE FROM runtime_execution_security");
    denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_RECORD_MISSING");
    expect(f.raw.db.prepare("SELECT * FROM runtime_execution_security").all()).toEqual([]);
  });
  it.each([ ["BLOCKED", "SECURITY_STATE_BLOCKED"], ["ACTIVE_STOP", "SECURITY_STOP_ACTIVE"] ] as const)(
    "D03 persisted %s denies", (state, reason) => {
      const f = readyFixture();
      f.raw.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
      denied(f.repository.assessExecutionReadiness({ ...f.request, securityRevision: 2 }), reason);
    });
  it.each(["READY", "CLEARED", "invalid"])("D04 corrupt enum %s cannot confer authority", state => {
    const f = readyFixture(); f.raw.db.exec("PRAGMA ignore_check_constraints=ON");
    f.raw.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
    denied(f.repository.assessExecutionReadiness(f.request), "PERSISTED_STATE_INVALID");
  });
  it("D05 principal, grant and policy absence are explicit independent blockers", () => {
    const f = readyFixture(), result = f.repository.assessExecutionReadiness(f.request);
    for (const reason of ["PRINCIPAL_UNAVAILABLE", "GRANT_UNAVAILABLE", "POLICY_UNAVAILABLE"] as const) denied(result, reason);
  });
  it("D06 a persisted policy name has no trusted resolver", () => {
    const f = readyFixture();
    f.raw.db.exec("UPDATE runtime_execution_security SET policyVersion='untrusted-v1',securityRevision=2");
    denied(f.repository.assessExecutionReadiness({ ...f.request, securityRevision: 2 }), "POLICY_UNSUPPORTED");
  });
  it("D07 a claimed synthetic capability/provider/session is rejected at the contract boundary", () => {
    const f = readyFixture();
    for (const extra of [{ capability: { executionAuthority: true } }, { providerAvailable: true },
      { sessionId: "other-session" }, { principal: "trusted" }, { grant: "approved" }])
      denied(f.repository.assessExecutionReadiness({ ...f.request, ...extra }), "INVALID_REQUEST");
  });
  it("D08 actual positive R5 supplied-evidence evaluation cannot authorize this repository", () => {
    const f = readyFixture();
    const id = { projectId: f.ref.projectId, sessionId: "dummy-session", ownerId: "dummy-owner",
      runId: "dummy-run", workerId: "dummy-worker", taskScope: "review" };
    const proof = { evidenceId: "dummy-proof", identity: id, epoch: 1, policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 };
    const assertion = { status: "VERIFIED" as const, evidence: proof };
    const r5 = evaluateWorkerAdmission({ requestId: "request", identity: id, epoch: 1, policyVersion: "v1",
      workerType: "reviewer", providerId: null }, { identity: id, epoch: 1, policyVersion: "v1", nowMs: 150,
      lifecycle: "APPROVAL_GRANTED", cancellation: "CLEAR", authorization: assertion, containment: assertion,
      outputFence: assertion, securityStop: { state: "CLEARED", clearance: proof }, provider: null },
    { policyId: "policy", version: "v1", status: "ACTIVE", validFromMs: 100, expiresAtMs: 200,
      scope: { projectId: id.projectId, sessionId: id.sessionId, ownerId: id.ownerId },
      admission: { enabled: true, workerTypes: ["reviewer"], taskScopes: ["review"] },
      publication: { enabled: false, sequenceRequired: true, destinations: [] }, providers: [] });
    expect(r5.outcome).toBe("ELIGIBLE_FOR_ADMISSION"); expect(r5.executionAuthority).toBe(false);
    denied(f.repository.assessExecutionReadiness({ ...f.request, r5 }), "INVALID_REQUEST");
    denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
  });
});

describe("PI02 identity and lifecycle", () => {
  const cases: [string, (a: Attempt) => object, ReadinessReason][] = [
    ["attempt", () => ({ attemptId: randomUUID() }), "ATTEMPT_NOT_FOUND"],
    ["project", () => ({ projectId: randomUUID() }), "IDENTITY_MISMATCH"],
    ["task", () => ({ taskId: "different-task" }), "IDENTITY_MISMATCH"],
    ["incarnation", () => ({ authorityIncarnation: randomUUID() }), "INCARNATION_MISMATCH"],
    ["epoch", a => ({ attemptGeneration: a.attemptGeneration + 1 }), "EPOCH_MISMATCH"],
    ["revision", a => ({ stateVersion: a.stateVersion - 1 }), "STALE_ATTEMPT_REVISION"],
    ["phase", () => ({ phase: "CREATED" }), "STALE_ATTEMPT_REVISION"],
    ["owner", () => ({ ownerId: randomUUID() }), "OWNER_MISMATCH"],
    ["host", () => ({ hostInstanceId: randomUUID() }), "OWNER_MISMATCH"],
    ["nonce", () => ({ ownerNonce: hash("wrong") }), "OWNER_MISMATCH"],
  ];
  it.each(cases)("I01 wrong %s denies without mutation", (_name, change, reason) => {
    const f = readyFixture(), before = snapshot(f);
    denied(f.repository.assessExecutionReadiness({ ...f.request, expected: { ...f.request.expected, ...change(f.attempt) } }), reason);
    expect(snapshot(f)).toEqual(before);
  });
  it("I02 session does not exist in this repository contract and cannot be smuggled into Expected", () => {
    const f = readyFixture();
    denied(f.repository.assessExecutionReadiness({ ...f.request, expected: { ...f.request.expected, sessionId: "wrong" } }), "INVALID_REQUEST");
  });
  it("I03 old security revision denies independently of current attempt revision", () => {
    const f = readyFixture(); f.raw.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=2");
    denied(f.repository.assessExecutionReadiness(f.request), "STALE_SECURITY_REVISION");
  });
  it("I04 persisted noLaunch cancellation is honored even when phase stays APPROVAL_GRANTED", () => {
    const f = leasedFixture(); let a = f.attempt;
    for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
      a = f.repository.transition({ ...transitionCommand(a, f.command.ownerNonce, phase), clock: clockAt(a, a.updatedAtMs + 1 - a.createdAtMs) });
    const clock = clockAt(a, a.updatedAtMs + 1 - a.createdAtMs);
    const authority = f.repository.authorizeHostForTest(expected(a, f.command.ownerNonce), clock);
    a = f.repository.requestCancellation({ expected: expected(a, f.command.ownerNonce), clock, eventId: randomUUID(),
      requestId: randomUUID(), decisionId: randomUUID(), reason: "OWNER_CANCELLED", authorization: "s12-test-only" }, authority).attempt;
    expect(a.phase).toBe("APPROVAL_GRANTED");
    denied(f.repository.assessExecutionReadiness({ expected: expected(a, f.command.ownerNonce), securityRevision: 1 }), "ATTEMPT_CANCELLED");
  });
  it("I05 terminal attempt is denied after synthetic success and reopen", () => {
    const f = fixture(), command = issueCommand(f.ref), a = advance(f.repository, command);
    const terminal = f.repository.commitTerminal(terminalCommand(a, command.ownerNonce)).attempt; f.repository.close();
    const r = own(DurableAttemptRepository.openForTest(f.ref));
    denied(r.assessExecutionReadiness({ expected: expected(terminal, command.ownerNonce), securityRevision: 1 }), "ATTEMPT_TERMINAL");
  });
  it("I06 uncertain/fenced recovery does not regain readiness or accept an old epoch", () => {
    const f = fixture(), command = issueCommand(f.ref), old = advance(f.repository, command, "UNCERTAIN");
    const owner = { hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash("new-owner") };
    const a = f.repository.fenceForTestRecovery({ expected: expected(old, command.ownerNonce), newOwner: owner,
      eventId: randomUUID(), atMs: old.updatedAtMs + 1, testRecoveryGrantId: randomUUID(), authorization: "s12-test-only" });
    denied(f.repository.assessExecutionReadiness({ expected: expected(old, command.ownerNonce), securityRevision: 1 }), "EPOCH_MISMATCH");
    denied(f.repository.assessExecutionReadiness({ expected: expected(a, owner.ownerNonce), securityRevision: 1 }), "LIFECYCLE_NOT_ADMISSIBLE");
  });
  it("I07 attempt ID reuse, issue replay and retry never create approval", () => {
    const f = readyFixture();
    failure(() => f.repository.issue({ ...f.command, issueRequestId: randomUUID() }), "CONFLICT");
    expect(f.repository.issue(f.command).replay).toBe(true);
    for (let i = 0; i < 3; i++) denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
    expect(f.repository.read(identity(f.attempt))).toEqual(f.attempt);
  });
  it("I08 synthetic LAUNCHING/RUNNING metadata remains compatible but confers no readiness", () => {
    const f = readyFixture(); let a = f.attempt;
    for (const phase of ["LAUNCHING", "RUNNING"] as const) {
      a = f.repository.transition(transitionCommand(a, f.command.ownerNonce, phase));
      denied(f.repository.assessExecutionReadiness({ expected: expected(a, f.command.ownerNonce), securityRevision: 1 }), "LIFECYCLE_NOT_ADMISSIBLE");
    }
  });
});

describe("PI02 transaction and safety", () => {
  it("T00 malformed transport and throwing property access are denied before a transaction", () => {
    const f = readyFixture(), before = snapshot(f);
    for (const input of [null, [], {}, { get expected() { throw new Error("invalid transport"); } },
      { ...f.request, securityRevision: 0 }, { ...f.request, securityRevision: Number.MAX_SAFE_INTEGER + 1 }])
      denied(f.repository.assessExecutionReadiness(input), "INVALID_REQUEST");
    expect(snapshot(f)).toEqual(before);
  });
  it("T01 repeated/duplicate assessment creates no event, intent or partial metadata", () => {
    const f = readyFixture(), before = snapshot(f), first = f.repository.assessExecutionReadiness(f.request);
    expect(f.repository.assessExecutionReadiness(f.request)).toEqual(first); expect(snapshot(f)).toEqual(before);
    expect(f.raw.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all().map(r => r.name))
      .toEqual(["runtime_accepted_outputs", "runtime_application_session_bindings", "runtime_attempt_events", "runtime_attempts", "runtime_control_meta", "runtime_execution_security",
        "runtime_execution_sessions", "runtime_grant_provenance", "runtime_output_events", "runtime_output_grant_claims", "runtime_output_operations", "runtime_output_outbox", "runtime_output_streams", "runtime_owner_epochs", "runtime_policy_provenance", "runtime_principal_provenance",
        "runtime_security_stop_events", "runtime_security_stop_operations"]);
  });
  it("T02 independent readers cannot see an uncommitted security update; commit invalidates old revision", () => {
    const f = readyFixture(), second = own(DurableAttemptRepository.openForTest(f.ref));
    f.raw.db.exec("BEGIN IMMEDIATE; UPDATE runtime_execution_security SET securityState='ACTIVE_STOP',securityRevision=2");
    try {
      for (const r of [f.repository, second]) denied(r.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
      f.raw.db.exec("COMMIT");
    } finally { if (f.raw.db.isTransaction) f.raw.db.exec("ROLLBACK"); }
    for (const r of [f.repository, second]) {
      denied(r.assessExecutionReadiness(f.request), "STALE_SECURITY_REVISION");
      denied(r.assessExecutionReadiness({ ...f.request, securityRevision: 2 }), "SECURITY_STOP_ACTIVE");
    }
  });
  it("T03 exclusive storage lock returns denial; retry after rollback is still denied", () => {
    const f = readyFixture(), before = snapshot(f); f.raw.db.exec("BEGIN EXCLUSIVE");
    try { denied(f.repository.assessExecutionReadiness(f.request), "STORAGE_UNAVAILABLE"); }
    finally { f.raw.db.exec("ROLLBACK"); }
    denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN"); expect(snapshot(f)).toEqual(before);
  });
  it("T04 failed write transaction leaves security and attempt history unchanged", () => {
    const f = readyFixture(), before = snapshot(f);
    const faulty = own(DurableAttemptRepository.openForTest(f.ref, { stage: "afterEvent", eventType: "PHASE_CHANGED" }));
    failure(() => faulty.transition(transitionCommand(f.attempt, f.command.ownerNonce, "LAUNCHING")), "FAULT");
    expect(snapshot(f)).toEqual(before); denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
  });
  it("T05 closed connection fails closed without exposing raw storage details", () => {
    const f = readyFixture(); f.repository.close();
    expect(f.repository.assessExecutionReadiness(f.request)).toEqual({ eligible: false, executionAuthority: false,
      reason: "STORAGE_UNAVAILABLE", reasons: ["STORAGE_UNAVAILABLE"], observed: null });
  });
  it("T06 assessment invokes no process, provider, network, publication or new database/file path", () => {
    const f = readyFixture();
    const spies = [vi.spyOn(children, "spawn"), vi.spyOn(children, "fork"), vi.spyOn(children, "exec"),
      vi.spyOn(globalThis, "fetch"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs, "openSync"), vi.spyOn(fs, "readFileSync")];
    try {
      denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally { for (const spy of spies) spy.mockRestore(); }
  });
  it("T07 denial receipt and nested observations cannot be mutated into authority", () => {
    const f = readyFixture(), result = f.repository.assessExecutionReadiness(f.request);
    expect(Object.isFrozen(result.observed)).toBe(true);
    expect(Reflect.set(result, "executionAuthority", true)).toBe(false);
    expect(Reflect.set(result.observed!, "securityState", "READY")).toBe(false);
    denied(f.repository.assessExecutionReadiness(f.request), "SECURITY_STATE_UNKNOWN");
  });
});
