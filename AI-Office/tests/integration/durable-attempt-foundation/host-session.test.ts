import { randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import children from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { type ApplicationSessionBinding, type ExecutionSession, type FixtureHostContext,
  type SessionDecision, type SessionReadinessRequest, type SessionReason } from "../../../src/server/attempt-control/host-session.js";
import { type PrincipalProvenance, type PolicyProvenance, type GrantProvenance } from "../../../src/server/attempt-control/provenance.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS } from "../../../src/server/attempt-control/schema.js";
import { openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { expected, failure, fixture, issueCommand, own, terminalCommand, transitionCommand } from "./helpers.js";
import { clockAt } from "./lease-helpers.js";

const table = { principal: "runtime_principal_provenance", policy: "runtime_policy_provenance", grant: "runtime_grant_provenance",
  application: "runtime_application_session_bindings", execution: "runtime_execution_sessions" } as const;
function insert(db: ReturnType<typeof openTestConnection>["db"], name: string, row: object) {
  const keys = Object.keys(row); db.prepare(`INSERT INTO ${name}(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`)
    .run(...Object.values(row) as (string | number | null)[]);
}
function setup(options: { application?: Partial<ApplicationSessionBinding>; execution?: Partial<ExecutionSession>;
  principal?: Partial<PrincipalProvenance>; policy?: Partial<PolicyProvenance>; grant?: Partial<GrantProvenance>;
  omitExecution?: boolean; leased?: boolean; ids?: { principalId: string; applicationId: string; executionId: string; attemptId: string } } = {}) {
  const f = fixture(), command = issueCommand(f.ref);
  if (options.ids) command.attemptId = options.ids.attemptId;
  const issue = options.leased ? { ...command, leaseClock: { hostInstanceId: command.hostInstanceId, clockDomainId: randomUUID(),
    wallMs: command.createdAtMs, monotonicMs: 100 } } : command;
  let attempt = f.repository.issue(issue).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = f.repository.transition({ ...transitionCommand(attempt, command.ownerNonce, phase),
      ...(options.leased ? { clock: clockAt(attempt, attempt.updatedAtMs + 1 - attempt.createdAtMs) } : {}) });
  const common = { recordVersion: 1, projectId: f.ref.projectId, authorityIncarnation: f.ref.authorityIncarnation,
    sourceId: "pi03-fixture-source-v1", sourceRevision: 1, sourceClass: "LOCAL_TEST_FIXTURE" as const,
    status: "ACTIVE" as const, validFromMs: 1000, expiresAtMs: 10_000 };
  const principal: PrincipalProvenance = { ...common, principalId: options.ids?.principalId ?? randomUUID(), principalKind: "HUMAN", revision: 1 };
  const policy: PolicyProvenance = { ...common, policyId: randomUUID(), policyVersion: 1, revision: 1,
    action: "attempt.execute", taskId: attempt.taskId, destinationId: "fixture-private-output" };
  const grant: GrantProvenance = { ...common, grantId: randomUUID(), authorizationRevision: 1,
    principalId: principal.principalId, principalRevision: 1, policyId: policy.policyId, policyRevision: 1,
    policyVersion: 1, sessionId: options.ids?.executionId ?? `execution:${randomUUID()}`, attemptId: attempt.attemptId,
    attemptGeneration: 1, action: policy.action, taskId: attempt.taskId, destinationId: policy.destinationId };
  const sessionCommon = { recordVersion: 1, projectId: f.ref.projectId, authorityIncarnation: f.ref.authorityIncarnation,
    principalId: principal.principalId, principalRevision: 1, sourceKind: "LOCAL_TEST_FIXTURE" as const,
    status: "ACTIVE" as const, validFromMs: 1000, expiresAtMs: 9000 };
  const application: ApplicationSessionBinding = { ...sessionCommon,
    applicationSessionId: options.ids?.applicationId ?? `application:${randomUUID()}`, generation: 1, revision: 1 };
  const issuer = f.repository.hostIssuerForTest;
  const execution: ExecutionSession = { ...sessionCommon, executionSessionId: grant.sessionId, bindingRevision: 1,
    applicationSessionId: application.applicationSessionId, applicationGeneration: 1, attemptId: attempt.attemptId,
    attemptGeneration: 1, policyId: policy.policyId, policyVersion: 1, policyRevision: 1, grantId: grant.grantId,
    authorizationRevision: 1, provenanceSourceRevision: 1, hostIssuerId: issuer.issuerId,
    hostIssuerGeneration: issuer.generation, hostContextRevision: issuer.contextRevision };
  const request: SessionReadinessRequest = { expected: expected(attempt, command.ownerNonce), securityRevision: 1,
    executionSessionId: execution.executionSessionId, sessionRevision: 1, workspaceBindingId: attempt.bindingId,
    workspaceGeneration: attempt.bindingGeneration, action: policy.action, destinationId: policy.destinationId, atMs: 2000 };
  const raw = own(openTestConnection(f.ref));
  insert(raw.db, table.principal, { ...principal, ...options.principal });
  insert(raw.db, table.policy, { ...policy, ...options.policy });
  insert(raw.db, table.grant, { ...grant, ...options.grant });
  insert(raw.db, table.application, { ...application, ...options.application });
  if (!options.omitExecution) insert(raw.db, table.execution, { ...execution, ...options.execution });
  return { ...f, command, attempt, principal, policy, grant, application, execution, request, raw,
    context: () => f.repository.issueHostContextForTest(request) };
}
function denied(d: SessionDecision, reason?: SessionReason) {
  expect(d).toMatchObject({ eligible: false, executionAuthority: false, principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED",
    hostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" });
  expect(d.reasons).toContain("PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
  if (reason) { expect(d.sessionReasons).toContain(reason); expect(d.sessionStatus).toBe("SESSION_BINDING_DENIED"); }
}
function snapshot(f: ReturnType<typeof setup>) {
  return ["runtime_attempts", "runtime_attempt_events", "runtime_owner_epochs", "runtime_execution_security", ...Object.values(table)]
    .map(name => f.raw.db.prepare(`SELECT * FROM ${name}`).all());
}
function tamper(f: ReturnType<typeof setup>, name: string, sql: string, remove = false) {
  f.raw.db.exec(`PRAGMA foreign_keys=OFF; PRAGMA ignore_check_constraints=ON; DROP TRIGGER ${name}_guard`);
  if (remove) f.raw.db.exec(`DROP TRIGGER ${name}_no_delete`);
  f.raw.db.exec(sql);
  for (const suffix of ["guard", ...(remove ? ["no_delete"] : [])])
    f.raw.db.exec(SCHEMA_STATEMENTS.find(s => s.startsWith(`CREATE TRIGGER ${name}_${suffix} `))!);
  f.raw.db.exec("PRAGMA foreign_keys=ON; PRAGMA ignore_check_constraints=OFF");
}

describe("PI04 host provenance", () => {
  it("H01 repository-issued local handle proves fixture binding consistency and never execution authority", () => {
    const f = setup(), before = snapshot(f), context = f.context(), d = f.repository.assessSessionReadiness(f.request, context);
    expect(context).toEqual({ sourceKind: "LOCAL_TEST_FIXTURE", executionAuthority: false }); denied(d);
    expect(d.sessionStatus).toBe("FIXTURE_SESSION_BINDING_CONSISTENT"); expect(d.sessionReasons).toEqual([]);
    expect(d.provenanceStatus).toBe("FIXTURE_PROVENANCE_CONSISTENT"); expect(d.reason).toBe("SECURITY_STATE_UNKNOWN");
    expect(snapshot(f)).toEqual(before);
  });
  it("H02 missing host context denies even with valid canonical metadata", () => {
    const f = setup(); denied(f.repository.assessSessionReadiness(f.request), "HOST_CONTEXT_MISSING");
  });
  it("H03 caller labels, pseudo branding, unknown source and principal claims cannot create context membership", () => {
    const f = setup();
    for (const fake of [{}, { sourceKind: "LOCAL_TEST_FIXTURE", executionAuthority: false }, { trusted: true, principalId: f.principal.principalId },
      { sourceKind: "PRODUCTION_AUTHENTICATED" }, { [Symbol("HostContext")]: true }, "caller-session-token"])
      denied(f.repository.assessSessionReadiness(f.request, fake), "HOST_CONTEXT_INVALID");
  });
  it.each(["json", "clone", "spread", "proxy"])("H04 %s copy loses private object membership", mode => {
    const f = setup(), context = f.context();
    const copy = mode === "json" ? JSON.parse(JSON.stringify(context)) : mode === "clone" ? structuredClone(context) :
      mode === "spread" ? { ...context } : new Proxy(context, {});
    denied(f.repository.assessSessionReadiness(f.request, copy), "HOST_CONTEXT_INVALID");
  });
  it("H05 another real fixture issuer cannot impersonate the repository issuer", () => {
    const f = setup(), other = setup(); denied(f.repository.assessSessionReadiness(f.request, other.context()), "HOST_ISSUER_MISMATCH");
  });
  it("H06 stale issuer generation in canonical binding denies existing handle and new issuance", () => {
    const f = setup(), c = f.context(); f.raw.db.exec(`UPDATE ${table.execution} SET hostIssuerGeneration=2,bindingRevision=2`);
    denied(f.repository.assessSessionReadiness({ ...f.request, sessionRevision: 2 }, c), "HOST_ISSUER_GENERATION_MISMATCH");
    failure(() => f.repository.issueHostContextForTest({ ...f.request, sessionRevision: 2 }), "AUTHORITY_INVALID");
  });
  it("H07 bounded context expires at equality while canonical sessions remain active", () => {
    const f = setup(), c = f.context();
    denied(f.repository.assessSessionReadiness({ ...f.request, atMs: 3000 }, c), "HOST_CONTEXT_EXPIRED");
    expect(f.repository.assessSessionReadiness({ ...f.request, atMs: 2999 }, c).sessionStatus).toBe("FIXTURE_SESSION_BINDING_CONSISTENT");
    denied(f.repository.assessSessionReadiness({ ...f.request, atMs: 1999 }, c), "HOST_CONTEXT_NOT_EFFECTIVE");
  });
  it("H08 unsupported host-context revision cannot be accepted or issued", () => {
    const f = setup({ execution: { hostContextRevision: 2 } });
    denied(f.repository.assessSessionReadiness(f.request), "HOST_CONTEXT_REVISION_MISMATCH");
    failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("H09 unverified stored source cannot be promoted by issuer metadata", () => {
    const f = setup({ execution: { sourceKind: "UNVERIFIED" } });
    denied(f.repository.assessSessionReadiness(f.request), "SESSION_SOURCE_UNSUPPORTED"); failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("H10 request cannot replace principal, application session, issuer or context", () => {
    const f = setup(), c = f.context(), before = snapshot(f);
    for (const extra of [{ principalId: randomUUID() }, { applicationSessionId: "replacement" }, { issuerId: f.repository.hostIssuerForTest.issuerId },
      { hostContext: c }, { trusted: true }, { credentials: "dummy-only" }, { callback: () => { throw new Error("Never invoke"); } }]) {
      const d = f.repository.assessSessionReadiness({ ...f.request, ...extra }, c); denied(d); expect(d.reason).toBe("INVALID_REQUEST");
    }
    expect(snapshot(f)).toEqual(before);
  });
});

describe("PI04 canonical principal/application/execution binding", () => {
  it("S01 missing and unknown execution session deny without manufacturing rows", () => {
    const f = setup({ omitExecution: true }), before = snapshot(f);
    denied(f.repository.assessSessionReadiness(f.request), "SESSION_MISSING");
    denied(f.repository.assessSessionReadiness({ ...f.request, executionSessionId: "unknown" }), "SESSION_MISSING");
    expect(snapshot(f)).toEqual(before);
  });
  it("S02 missing principal/application reference fails FK and corrupt orphan state denies", () => {
    const f = setup(), c = f.context();
    expect(() => insert(f.raw.db, table.application, { ...f.application, applicationSessionId: "orphan", principalId: randomUUID() })).toThrow();
    tamper(f, table.principal, `DELETE FROM ${table.principal}`, true);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("PERSISTED_STATE_INVALID");
  });
  it("S03 ownership change requires generation advance and invalidates old context", () => {
    const f = setup(), c = f.context(), other = { ...f.principal, principalId: randomUUID() }; insert(f.raw.db, table.principal, other);
    expect(() => f.raw.db.prepare(`UPDATE ${table.application} SET principalId=?,revision=2`).run(other.principalId)).toThrow();
    f.raw.db.prepare(`UPDATE ${table.application} SET principalId=?,generation=2,revision=2`).run(other.principalId);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d, "SESSION_PRINCIPAL_MISMATCH");
    expect(d.sessionReasons).toContain("SESSION_APPLICATION_GENERATION_MISMATCH"); failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("S04 canonical application association cannot be silently replaced", () => {
    const f = setup(), c = f.context(), other = { ...f.application, applicationSessionId: "new-application" };
    insert(f.raw.db, table.application, other);
    expect(() => f.raw.db.exec(`UPDATE ${table.execution} SET applicationSessionId='new-application',bindingRevision=2`)).toThrow();
    const fake = { ...c, applicationSessionId: other.applicationSessionId };
    denied(f.repository.assessSessionReadiness(f.request, fake), "HOST_CONTEXT_INVALID");
  });
  it("S05 application recreation/revision changes cannot inherit old context", () => {
    const f = setup(), c = f.context(); f.raw.db.exec(`UPDATE ${table.application} SET generation=2,revision=2`);
    denied(f.repository.assessSessionReadiness(f.request, c), "SESSION_APPLICATION_GENERATION_MISMATCH");
    expect(() => insert(f.raw.db, table.application, f.application)).toThrow();
    expect(() => f.raw.db.exec(`DELETE FROM ${table.application}`)).toThrow();
  });
  it.each(["projectId", "authorityIncarnation", "attemptId"] as const)("S06 wrong expected %s denies", key => {
    const f = setup(), d = f.repository.assessSessionReadiness({ ...f.request, expected: { ...f.request.expected, [key]: randomUUID() } }, f.context());
    denied(d); expect(d.observed).toBeNull();
  });
  it.each(["workspaceBindingId", "workspaceGeneration"] as const)("S07 cross-workspace %s denies", key => {
    const f = setup(); denied(f.repository.assessSessionReadiness({ ...f.request,
      [key]: key === "workspaceBindingId" ? "other-workspace" : 2 }, f.context()), "SESSION_WORKSPACE_MISMATCH");
  });
  const cases: [string, Partial<ExecutionSession>, SessionReason][] = [
    ["unknown", { status: "UNKNOWN" }, "SESSION_UNKNOWN"],
    ["revoked", { status: "REVOKED" }, "SESSION_REVOKED"],
    ["expired", { expiresAtMs: 2000 }, "SESSION_EXPIRED"],
    ["future", { validFromMs: 2001 }, "SESSION_NOT_EFFECTIVE"],
    ["epoch", { attemptGeneration: 2 }, "SESSION_EPOCH_MISMATCH"],
    ["revision", { bindingRevision: 2 }, "SESSION_REVISION_MISMATCH"],
    ["missing issuer", { hostIssuerId: null, hostIssuerGeneration: null }, "HOST_BINDING_MISSING"],
    ["unknown issuer", { hostIssuerId: randomUUID() }, "HOST_ISSUER_MISMATCH"],
    ["application generation", { applicationGeneration: 2 }, "SESSION_APPLICATION_GENERATION_MISMATCH"],
    ["principal revision", { principalRevision: 2 }, "SESSION_PRINCIPAL_REVISION_MISMATCH"],
  ];
  it.each(cases)("S08 canonical execution %s denies and blocks fixture context issuance", (_name, execution, issue) => {
    const f = setup({ execution }); denied(f.repository.assessSessionReadiness(f.request), issue); failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it.each([ ["status", "UNKNOWN", "APPLICATION_SESSION_UNKNOWN"], ["status", "REVOKED", "APPLICATION_SESSION_REVOKED"],
    ["sourceKind", "UNVERIFIED", "SESSION_SOURCE_UNSUPPORTED"] ] as const)("S09 application %s %s denies", (key, value, issue) => {
    const f = setup({ application: { [key]: value } }); denied(f.repository.assessSessionReadiness(f.request), issue);
    failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("S10 same principal/application/execution/attempt ID strings in a new authority do not authenticate old context", () => {
    const f = setup(), c = f.context(), fresh = setup({ ids: { principalId: f.principal.principalId,
      applicationId: f.application.applicationSessionId, executionId: f.execution.executionSessionId, attemptId: f.attempt.attemptId } });
    expect(fresh.attempt.authorityIncarnation).not.toBe(f.attempt.authorityIncarnation);
    denied(fresh.repository.assessSessionReadiness(fresh.request, c), "HOST_ISSUER_MISMATCH");
    expect(fresh.repository.assessSessionReadiness(fresh.request, fresh.context()).sessionStatus).toBe("FIXTURE_SESSION_BINDING_CONSISTENT");
  });
  it("S11 execution ID cannot be deleted/reinserted or rebound to another identity", () => {
    const f = setup(), c = f.context();
    expect(() => insert(f.raw.db, table.execution, f.execution)).toThrow();
    expect(() => f.raw.db.exec(`DELETE FROM ${table.execution}`)).toThrow();
    expect(() => f.raw.db.exec(`UPDATE ${table.execution} SET executionSessionId='replacement',bindingRevision=2`)).toThrow();
    f.raw.db.exec(`UPDATE ${table.execution} SET bindingRevision=2`);
    denied(f.repository.assessSessionReadiness({ ...f.request, sessionRevision: 2 }, c), "HOST_CONTEXT_BINDING_MISMATCH");
  });
});

describe("PI04 lifecycle and provenance integration", () => {
  it("A01 canonical epoch advancement invalidates old context and session", () => {
    const f = setup(), c = f.context(); const uncertain = f.repository.transition(transitionCommand(f.attempt, f.command.ownerNonce, "UNCERTAIN"));
    const owner = { hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash("replacement") };
    const a = f.repository.fenceForTestRecovery({ expected: expected(uncertain, f.command.ownerNonce), newOwner: owner,
      eventId: randomUUID(), atMs: uncertain.updatedAtMs + 1, testRecoveryGrantId: randomUUID(), authorization: "s12-test-only" });
    denied(f.repository.assessSessionReadiness({ ...f.request, expected: expected(a, owner.ownerNonce) }, c), "SESSION_EPOCH_MISMATCH");
  });
  it("A02 noLaunch cancellation retains approval phase but still denies", () => {
    const f = setup({ leased: true }), c = f.context(), clock = clockAt(f.attempt, f.attempt.updatedAtMs + 1 - f.attempt.createdAtMs);
    const authority = f.repository.authorizeHostForTest(expected(f.attempt, f.command.ownerNonce), clock);
    const a = f.repository.requestCancellation({ expected: expected(f.attempt, f.command.ownerNonce), clock, eventId: randomUUID(),
      requestId: randomUUID(), decisionId: randomUUID(), reason: "OWNER_CANCELLED", authorization: "s12-test-only" }, authority).attempt;
    expect(a.phase).toBe("APPROVAL_GRANTED"); const d = f.repository.assessSessionReadiness({ ...f.request, expected: expected(a, f.command.ownerNonce) }, c);
    denied(d); expect(d.reason).toBe("ATTEMPT_CANCELLED"); failure(() => f.repository.issueHostContextForTest({ ...f.request,
      expected: expected(a, f.command.ownerNonce) }), "AUTHORITY_INVALID");
  });
  it("A03 terminal attempts cannot acquire new context or execute using old context", () => {
    const f = setup(), c = f.context(), a = f.repository.commitTerminal(terminalCommand(f.attempt, f.command.ownerNonce, "INTERRUPTED")).attempt;
    const q = { ...f.request, expected: expected(a, f.command.ownerNonce) }, d = f.repository.assessSessionReadiness(q, c);
    denied(d); expect(d.reason).toBe("ATTEMPT_TERMINAL"); failure(() => f.repository.issueHostContextForTest(q), "AUTHORITY_INVALID");
  });
  it.each([ ["policyRevision", 2, "POLICY_REVISION_MISMATCH"], ["authorizationRevision", 2, "GRANT_REVISION_MISMATCH"],
    ["principalRevision", 2, "PRINCIPAL_REVISION_MISMATCH"], ["provenanceSourceRevision", 2, "PRINCIPAL_SOURCE_REVISION_MISMATCH"] ] as const)(
    "A04 stale canonical %s denies through existing PI03 checks", (key, value, issue) => {
      const f = setup({ execution: { [key]: value } }), d = f.repository.assessSessionReadiness(f.request); denied(d);
      expect(d.provenanceReasons).toContain(issue); failure(() => f.context(), "AUTHORITY_INVALID");
    });
  it.each(["principal", "policy", "grant"] as const)("A05 missing %s relationship cannot bypass session binding", kind => {
    const f = setup(), c = f.context(); tamper(f, table[kind], `DELETE FROM ${table[kind]}`, true);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("PERSISTED_STATE_INVALID");
  });
  it("A06 grant/session mismatch cannot be hidden behind a valid handle", () => {
    const f = setup(), c = f.context(); tamper(f, table.grant, `UPDATE ${table.grant} SET sessionId='other-session'`);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.provenanceReasons).toContain("GRANT_SESSION_MISMATCH");
  });
  it("A07 mismatched principal grant with valid FK is denied by provenance", () => {
    const f = setup(), c = f.context(), other = { ...f.principal, principalId: randomUUID() }; insert(f.raw.db, table.principal, other);
    tamper(f, table.grant, `UPDATE ${table.grant} SET principalId='${other.principalId}'`);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.provenanceReasons).toContain("PRINCIPAL_BINDING_MISMATCH");
  });
  it("A08 revoked grant and principal revision invalidate future fixture issuance", () => {
    const f = setup(), c = f.context(); f.raw.db.exec(`UPDATE ${table.grant} SET status='REVOKED',authorizationRevision=2`);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.provenanceReasons).toContain("GRANT_REVOKED");
    failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"] as const)("A09 %s security always denies consistent fixture context", state => {
    const f = setup(), c = f.context(); f.raw.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
    const d = f.repository.assessSessionReadiness({ ...f.request, securityRevision: 2 }, c); denied(d);
    expect(d.reason).toBe(state === "UNKNOWN" ? "SECURITY_STATE_UNKNOWN" : state === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STOP_ACTIVE");
  });
  it("A10 security absence denies even with a genuine fixture context", () => {
    const f = setup(), c = f.context(); f.raw.db.exec("DELETE FROM runtime_execution_security");
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("SECURITY_RECORD_MISSING");
    failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("A11 a grant redirected to an unknown attempt denies before provenance evaluation", () => {
    const f = setup(), c = f.context();
    tamper(f, table.grant, `UPDATE ${table.grant} SET attemptId='${randomUUID()}'`);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d);
    expect(d.reason).toBe("PERSISTED_STATE_INVALID"); failure(() => f.context(), "INTEGRITY");
  });
  it("A12 removal of the canonical application session cannot be repaired by the request or old context", () => {
    const f = setup(), c = f.context(); tamper(f, table.application, `DELETE FROM ${table.application}`, true);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("PERSISTED_STATE_INVALID");
    failure(() => f.context(), "INTEGRITY");
  });
});

describe("PI04 SQLite recovery, transactions and safety", () => {
  it("R01 SQL defaults do not manufacture host authority or active sessions", () => {
    const f = setup({ omitExecution: true }), row: Record<string, unknown> = { ...f.execution };
    for (const key of ["recordVersion", "sourceKind", "status", "bindingRevision", "hostIssuerId", "hostIssuerGeneration", "hostContextRevision"]) delete row[key];
    insert(f.raw.db, table.execution, row);
    expect(f.raw.db.prepare(`SELECT sourceKind,status,hostIssuerId FROM ${table.execution}`).get())
      .toEqual({ sourceKind: "UNVERIFIED", status: "UNKNOWN", hostIssuerId: null });
    denied(f.repository.assessSessionReadiness(f.request), "HOST_BINDING_MISSING"); failure(() => f.context(), "AUTHORITY_INVALID");
  });
  it("R02 reopen preserves rows but old or reconstructed contexts cannot establish issuer continuity", () => {
    const f = setup(), c = f.context(), before = snapshot(f); f.repository.close();
    const fresh = own(DurableAttemptRepository.openForTest(f.ref));
    denied(fresh.assessSessionReadiness(f.request, c), "HOST_ISSUER_MISMATCH");
    denied(fresh.assessSessionReadiness(f.request, JSON.parse(JSON.stringify(c))), "HOST_CONTEXT_INVALID");
    failure(() => fresh.issueHostContextForTest(f.request), "AUTHORITY_INVALID"); expect(snapshot(f)).toEqual(before);
    const issuer = fresh.hostIssuerForTest;
    f.raw.db.prepare(`UPDATE ${table.execution} SET hostIssuerId=?,hostIssuerGeneration=?,bindingRevision=2`).run(issuer.issuerId, issuer.generation);
    const q = { ...f.request, sessionRevision: 2 }, renewed = fresh.issueHostContextForTest(q);
    denied(fresh.assessSessionReadiness(q, c), "HOST_ISSUER_MISMATCH");
    expect(fresh.assessSessionReadiness(q, renewed).sessionStatus).toBe("FIXTURE_SESSION_BINDING_CONSISTENT");
  });
  it.each(["execution", "application"] as const)("R03 revoked %s binding persists across reopen and cannot be restored", kind => {
    const f = setup(), c = f.context(), name = table[kind], rev = kind === "execution" ? "bindingRevision" : "revision";
    f.raw.db.exec(`UPDATE ${name} SET status='REVOKED',${rev}=2`);
    expect(() => f.raw.db.exec(`UPDATE ${name} SET status='ACTIVE',${rev}=3`)).toThrow();
    expect(() => f.raw.db.exec(`DELETE FROM ${name}`)).toThrow(); f.repository.close();
    const fresh = own(DurableAttemptRepository.openForTest(f.ref));
    denied(fresh.assessSessionReadiness({ ...f.request, sessionRevision: kind === "execution" ? 2 : 1 }, c),
      kind === "execution" ? "SESSION_REVOKED" : "APPLICATION_SESSION_REVOKED");
    failure(() => fresh.issueHostContextForTest(f.request), "AUTHORITY_INVALID");
  });
  it("R04 version7-shaped fixture without binding tables denies repeatedly without assigning legacy identity", () => {
    const f = setup(); f.raw.db.exec(`DROP TABLE ${table.execution}; DROP TABLE ${table.application}; PRAGMA user_version=7`);
    const d = f.repository.assessSessionReadiness(f.request); denied(d); expect(d.reason).toBe("SCHEMA_UNSUPPORTED");
    f.repository.close(); f.raw.close(); const filename = testDatabaseFilename(f.ref), before = fs.readFileSync(filename);
    for (let i = 0; i < 2; i++) failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
    expect(fs.readFileSync(filename)).toEqual(before);
  });
  it("R05 unsupported schema denies on already open repository", () => {
    const f = setup(), c = f.context(); f.raw.db.exec("PRAGMA user_version=99");
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("SCHEMA_UNSUPPORTED");
  });
  it("R06 corrupt binding and orphaned references deny after exact guard restoration", () => {
    const f = setup(), c = f.context(); tamper(f, table.execution, `UPDATE ${table.execution} SET applicationSessionId='orphan'`);
    const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("PERSISTED_STATE_INVALID");
  });
  it("R07 typed malformed binding is rejected even when SQL accepts the text", () => {
    const f = setup(), c = f.context(); tamper(f, table.execution, `UPDATE ${table.execution} SET hostIssuerId=' '`);
    denied(f.repository.assessSessionReadiness(f.request, c), "SESSION_RECORD_INVALID");
  });
  it("R08 real SQLITE_READONLY rolls back partially written fixture application binding", () => {
    const f = setup({ omitExecution: true }), before = snapshot(f);
    f.raw.db.exec("BEGIN IMMEDIATE");
    try {
      insert(f.raw.db, table.application, { ...f.application, applicationSessionId: "new-partial" }); f.raw.db.exec("PRAGMA query_only=ON");
      try { insert(f.raw.db, table.execution, f.execution); throw new Error("Expected READONLY"); }
      catch (e) { expect(e).toHaveProperty("errcode", 8); }
    } finally { f.raw.db.exec("ROLLBACK; PRAGMA query_only=OFF"); }
    expect(snapshot(f)).toEqual(before); denied(f.repository.assessSessionReadiness(f.request), "SESSION_MISSING");
  });
  it("R09 committed/uncommitted binding revisions share one repository snapshot and never authorize", () => {
    const f = setup(), c = f.context(); f.raw.db.exec(`BEGIN IMMEDIATE; UPDATE ${table.execution} SET bindingRevision=2`);
    try { expect(f.repository.assessSessionReadiness(f.request, c).sessionStatus).toBe("FIXTURE_SESSION_BINDING_CONSISTENT");
      f.raw.db.exec("COMMIT"); } finally { if (f.raw.db.isTransaction) f.raw.db.exec("ROLLBACK"); }
    denied(f.repository.assessSessionReadiness(f.request, c), "SESSION_REVISION_MISMATCH");
    denied(f.repository.assessSessionReadiness({ ...f.request, sessionRevision: 2 }, c), "HOST_CONTEXT_BINDING_MISMATCH");
  });
  it("R10 read failure and retry after lock rollback remain deny-only", () => {
    const f = setup(), c = f.context(), before = snapshot(f); f.raw.db.exec("BEGIN EXCLUSIVE");
    try { const d = f.repository.assessSessionReadiness(f.request, c); denied(d); expect(d.reason).toBe("STORAGE_UNAVAILABLE"); }
    finally { f.raw.db.exec("ROLLBACK"); }
    denied(f.repository.assessSessionReadiness(f.request, c)); expect(snapshot(f)).toEqual(before);
  });
  it("R11 failed repository validation changes no bindings and consumes no grant", () => {
    const f = setup(), c = f.context(), before = snapshot(f);
    failure(() => f.repository.transition(transitionCommand(f.attempt, f.command.ownerNonce, "CREATED")), "INVALID_TRANSITION");
    expect(snapshot(f)).toEqual(before); denied(f.repository.assessSessionReadiness(f.request, c));
  });
  it("R12 no worker/provider/network/credential/output IO occurs during context issuance or readiness", () => {
    const f = setup(); const spies = [vi.spyOn(children, "spawn"), vi.spyOn(children, "fork"), vi.spyOn(children, "exec"),
      vi.spyOn(globalThis, "fetch"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs, "openSync")];
    try { denied(f.repository.assessSessionReadiness(f.request, f.context())); for (const s of spies) expect(s).not.toHaveBeenCalled(); }
    finally { for (const s of spies) s.mockRestore(); }
  });
  it("R13 decisions and context handles stay immutable; no intent or grant consumption is recorded", () => {
    const f = setup(), c = f.context(), before = snapshot(f), d = f.repository.assessSessionReadiness(f.request, c);
    denied(d); expect(f.repository.assessSessionReadiness(f.request, c)).toEqual(d);
    expect(Object.isFrozen(c)).toBe(true); expect(Object.isFrozen(d.sessionReasons)).toBe(true); expect(Object.isFrozen(d.reasons)).toBe(true);
    expect(Reflect.set(c, "executionAuthority", true)).toBe(false); expect(Reflect.set(d, "executionAuthority", true)).toBe(false);
    expect(snapshot(f)).toEqual(before);
    expect(Object.getOwnPropertyNames(f.repository)).not.toContain("hostIssuer");
  });
  it("R14 malformed request and throwing transport getter return structured denial before transactions", () => {
    const f = setup(), c = f.context(), before = snapshot(f);
    for (const q of [null, {}, [], { get expected() { throw new Error("invalid transport"); } }, { ...f.request, sessionRevision: 0 }]) {
      const d = f.repository.assessSessionReadiness(q, c); denied(d); expect(d.reason).toBe("INVALID_REQUEST");
    }
    expect(snapshot(f)).toEqual(before);
  });
});
