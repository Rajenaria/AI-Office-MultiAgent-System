import { randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import children from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { type PrincipalProvenance, type PolicyProvenance, type GrantProvenance,
  type ProvenanceRequest, type ProvenanceReason, type ProvenanceDecision } from "../../../src/server/attempt-control/provenance.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS } from "../../../src/server/attempt-control/schema.js";
import { openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { expected, failure, fixture, identity, issueCommand, own, terminalCommand, transitionCommand } from "./helpers.js";
import { clockAt, leasedFixture } from "./lease-helpers.js";

const tables = { principal: "runtime_principal_provenance", policy: "runtime_policy_provenance", grant: "runtime_grant_provenance" } as const;
type Kind = keyof typeof tables;
function insert(db: DatabaseSync, table: string, row: object): void {
  const fields = Object.keys(row), values = Object.values(row) as (string | number)[];
  db.prepare(`INSERT INTO ${table}(${fields.join(",")}) VALUES(${fields.map(() => "?").join(",")})`).run(...values);
}
function setup(options: { principal?: Partial<PrincipalProvenance>; policy?: Partial<PolicyProvenance>;
  grant?: Partial<GrantProvenance>; omit?: readonly Kind[] } = {}) {
  const f = fixture(), command = issueCommand(f.ref); let attempt = f.repository.issue(command).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = f.repository.transition(transitionCommand(attempt, command.ownerNonce, phase));
  const common = { recordVersion: 1, projectId: f.ref.projectId, authorityIncarnation: f.ref.authorityIncarnation,
    sourceId: "pi03-fixture-source-v1", sourceRevision: 1, sourceClass: "LOCAL_TEST_FIXTURE" as const,
    status: "ACTIVE" as const, validFromMs: 1000, expiresAtMs: 10_000 };
  const principal: PrincipalProvenance = { ...common, principalId: randomUUID(), principalKind: "HUMAN", revision: 1 };
  const policy: PolicyProvenance = { ...common, policyId: randomUUID(), revision: 1, policyVersion: 1,
    action: "attempt.execute", taskId: attempt.taskId, destinationId: "fixture-private-output" };
  const grant: GrantProvenance = { ...common, grantId: randomUUID(), authorizationRevision: 1,
    principalId: principal.principalId, principalRevision: 1, policyId: policy.policyId, policyRevision: 1,
    policyVersion: 1, sessionId: "fixture-session", attemptId: attempt.attemptId, attemptGeneration: 1,
    action: policy.action, taskId: attempt.taskId, destinationId: policy.destinationId };
  const request: ProvenanceRequest = { expected: expected(attempt, command.ownerNonce), securityRevision: 1,
    principalId: principal.principalId, principalRevision: 1, policyId: policy.policyId, policyRevision: 1,
    policyVersion: 1, grantId: grant.grantId, authorizationRevision: 1, sourceRevision: 1,
    sessionId: grant.sessionId, action: grant.action, destinationId: grant.destinationId, atMs: 2000 };
  const raw = own(openTestConnection(f.ref));
  if (!options.omit?.includes("principal")) insert(raw.db, tables.principal, { ...principal, ...options.principal });
  if (!options.omit?.includes("policy")) insert(raw.db, tables.policy, { ...policy, ...options.policy });
  if (!options.omit?.includes("grant")) insert(raw.db, tables.grant, { ...grant, ...options.grant });
  return { ...f, command, attempt, principal, policy, grant, request, raw };
}
function denied(result: ProvenanceDecision, issue?: ProvenanceReason): void {
  expect(result).toMatchObject({ eligible: false, executionAuthority: false,
    principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED" });
  expect(result.reasons).toContain("PRODUCTION_AUTHORITY_UNAVAILABLE");
  if (issue) { expect(result.provenanceReasons).toContain(issue); expect(result.provenanceStatus).toBe("PROVENANCE_DENIED"); }
}
function snapshot(f: ReturnType<typeof setup>) {
  return ["runtime_attempts", "runtime_attempt_events", "runtime_owner_epochs", "runtime_execution_security", ...Object.values(tables)]
    .map(table => f.raw.db.prepare(`SELECT * FROM ${table}`).all());
}
function corrupt(f: ReturnType<typeof setup>, kind: Kind, sql: string): void {
  const table = tables[kind]; f.raw.db.exec(`PRAGMA foreign_keys=OFF; PRAGMA ignore_check_constraints=ON; DROP TRIGGER ${table}_guard`);
  f.raw.db.exec(sql);
  f.raw.db.exec(SCHEMA_STATEMENTS.find(s => s.startsWith(`CREATE TRIGGER ${table}_guard `))!);
  f.raw.db.exec("PRAGMA foreign_keys=ON; PRAGMA ignore_check_constraints=OFF");
}

describe("PI03 canonical provenance contracts", () => {
  it("P00 internally consistent fixture rows remain unverified production identity and execution denial", () => {
    const f = setup(), before = snapshot(f), result = f.repository.assessProvenanceReadiness(f.request);
    denied(result); expect(result.provenanceStatus).toBe("FIXTURE_PROVENANCE_CONSISTENT");
    expect(result.provenanceReasons).toEqual([]); expect(result.reason).toBe("SECURITY_STATE_UNKNOWN");
    expect(snapshot(f)).toEqual(before);
  });
  it("P01 fresh authority has no fabricated principal/policy/grant; all missing deny", () => {
    const f = setup({ omit: ["principal", "policy", "grant"] }), result = f.repository.assessProvenanceReadiness(f.request);
    for (const issue of ["PRINCIPAL_MISSING", "POLICY_MISSING", "GRANT_MISSING"] as const) denied(result, issue);
  });
  it("P02 SQL provenance defaults are UNKNOWN/UNVERIFIED for every entity", () => {
    const f = setup({ omit: ["principal", "policy", "grant"] });
    for (const kind of ["principal", "policy", "grant"] as const) {
      const row: Record<string, unknown> = { ...f[kind] };
      for (const key of ["sourceClass", "sourceId", "sourceRevision", "status", "recordVersion", "revision", "authorizationRevision"]) delete row[key];
      insert(f.raw.db, tables[kind], row);
      expect(f.raw.db.prepare(`SELECT status,sourceClass FROM ${tables[kind]}`).get()).toEqual({ status: "UNKNOWN", sourceClass: "UNVERIFIED" });
    }
    const r = f.repository.assessProvenanceReadiness(f.request);
    for (const issue of ["PRINCIPAL_UNKNOWN", "POLICY_UNKNOWN", "GRANT_UNKNOWN"] as const) denied(r, issue);
  });
  const principalCases: [string, Partial<PrincipalProvenance>, ProvenanceReason][] = [
    ["unknown", { status: "UNKNOWN" }, "PRINCIPAL_UNKNOWN"],
    ["revoked", { status: "REVOKED" }, "PRINCIPAL_REVOKED"],
    ["expiry equality", { expiresAtMs: 2000 }, "PRINCIPAL_EXPIRED"],
    ["not effective", { validFromMs: 2001 }, "PRINCIPAL_NOT_EFFECTIVE"],
    ["unsupported issuer", { sourceId: "unknown-issuer" }, "PRINCIPAL_SOURCE_UNSUPPORTED"],
    ["unverified source", { sourceClass: "UNVERIFIED" }, "PRINCIPAL_SOURCE_UNSUPPORTED"],
    ["stale source revision", { sourceRevision: 2 }, "PRINCIPAL_SOURCE_REVISION_MISMATCH"],
    ["stale principal revision", { revision: 2 }, "PRINCIPAL_REVISION_MISMATCH"],
  ];
  it.each(principalCases)("P03 principal %s denies", (_name, principal, issue) => {
    const f = setup({ principal }); denied(f.repository.assessProvenanceReadiness(f.request), issue);
  });
  it("P04 copied or unknown principal ID is never authentication", () => {
    const f = setup(); denied(f.repository.assessProvenanceReadiness({ ...f.request, principalId: randomUUID() }), "PRINCIPAL_MISSING");
    denied(f.repository.assessProvenanceReadiness(structuredClone(f.request)));
  });
  it("P05 a different existing principal cannot replace the grant's principal", () => {
    const f = setup(), other = { ...f.principal, principalId: randomUUID() }; insert(f.raw.db, tables.principal, other);
    denied(f.repository.assessProvenanceReadiness({ ...f.request, principalId: other.principalId }), "PRINCIPAL_BINDING_MISMATCH");
  });
  it("P06 cross-project principal is rejected by FK and persisted tampering is denied", () => {
    const f = setup(); expect(() => insert(f.raw.db, tables.principal,
      { ...f.principal, principalId: randomUUID(), projectId: randomUUID() })).toThrow();
    corrupt(f, "principal", `UPDATE ${tables.principal} SET projectId='${randomUUID()}'`);
    denied(f.repository.assessProvenanceReadiness(f.request), "PERSISTED_PROVENANCE_INVALID");
  });
  const policyCases: [string, Partial<PolicyProvenance>, ProvenanceReason][] = [
    ["unknown state", { status: "UNKNOWN" }, "POLICY_UNKNOWN"],
    ["unknown version", { policyVersion: 2 }, "POLICY_VERSION_UNSUPPORTED"],
    ["stale revision", { revision: 2 }, "POLICY_REVISION_MISMATCH"],
    ["revoked", { status: "REVOKED" }, "POLICY_REVOKED"],
    ["expired", { expiresAtMs: 2000 }, "POLICY_EXPIRED"],
    ["not effective", { validFromMs: 2001 }, "POLICY_NOT_EFFECTIVE"],
    ["wrong action", { action: "other-action" }, "POLICY_ACTION_MISMATCH"],
    ["wrong task", { taskId: "other-task" }, "POLICY_TASK_MISMATCH"],
    ["wrong destination", { destinationId: "other-destination" }, "POLICY_DESTINATION_MISMATCH"],
    ["unsupported issuer", { sourceId: "unknown-issuer" }, "POLICY_SOURCE_UNSUPPORTED"],
    ["stale source", { sourceRevision: 2 }, "POLICY_SOURCE_REVISION_MISMATCH"],
  ];
  it.each(policyCases)("O01 policy %s denies", (_name, policy, issue) => {
    const f = setup({ policy }); denied(f.repository.assessProvenanceReadiness(f.request), issue);
  });
  it("O02 missing/unknown policy and stale requested policy version deny", () => {
    const f = setup({ omit: ["policy", "grant"] }); denied(f.repository.assessProvenanceReadiness(f.request), "POLICY_MISSING");
    const other = setup(); denied(other.repository.assessProvenanceReadiness({ ...other.request, policyId: randomUUID() }), "POLICY_MISSING");
    denied(other.repository.assessProvenanceReadiness({ ...other.request, policyVersion: 2 }), "POLICY_VERSION_MISMATCH");
  });
  it("O03 SQL revision/version/source rollback fails without restoring eligibility", () => {
    const f = setup(); f.raw.db.exec(`UPDATE ${tables.policy} SET revision=2,policyVersion=2,sourceRevision=2`);
    for (const sql of ["revision=1", "revision=3,policyVersion=1", "revision=3,sourceRevision=1"])
      expect(() => f.raw.db.exec(`UPDATE ${tables.policy} SET ${sql}`)).toThrow();
    denied(f.repository.assessProvenanceReadiness(f.request), "POLICY_VERSION_UNSUPPORTED");
  });
  it("O04 a different existing policy cannot replace the grant's policy", () => {
    const f = setup(), other = { ...f.policy, policyId: randomUUID() }; insert(f.raw.db, tables.policy, other);
    denied(f.repository.assessProvenanceReadiness({ ...f.request, policyId: other.policyId }), "POLICY_BINDING_MISMATCH");
  });
});

describe("PI03 grant scope", () => {
  const grantCases: [string, Partial<GrantProvenance>, ProvenanceReason][] = [
    ["unknown", { status: "UNKNOWN" }, "GRANT_UNKNOWN"],
    ["revoked", { status: "REVOKED" }, "GRANT_REVOKED"],
    ["expired", { expiresAtMs: 2000 }, "GRANT_EXPIRED"],
    ["not effective", { validFromMs: 2001 }, "GRANT_NOT_EFFECTIVE"],
    ["wrong session", { sessionId: "another-session" }, "GRANT_SESSION_MISMATCH"],
    ["stale epoch", { attemptGeneration: 2 }, "GRANT_EPOCH_MISMATCH"],
    ["stale authorization", { authorizationRevision: 2 }, "GRANT_REVISION_MISMATCH"],
    ["wrong action", { action: "another-action" }, "GRANT_ACTION_MISMATCH"],
    ["wrong task", { taskId: "another-task" }, "GRANT_TASK_MISMATCH"],
    ["wrong destination", { destinationId: "another-output" }, "GRANT_DESTINATION_MISMATCH"],
    ["stale principal reference", { principalRevision: 2 }, "GRANT_PRINCIPAL_REVISION_MISMATCH"],
    ["stale policy reference", { policyRevision: 2 }, "GRANT_POLICY_REVISION_MISMATCH"],
    ["wrong policy version", { policyVersion: 2 }, "GRANT_POLICY_VERSION_MISMATCH"],
    ["unsupported source", { sourceClass: "PRODUCTION_AUTHORITY_UNAVAILABLE" }, "GRANT_SOURCE_UNSUPPORTED"],
    ["stale source revision", { sourceRevision: 2 }, "GRANT_SOURCE_REVISION_MISMATCH"],
    ["outlives parent records", { expiresAtMs: 10_001 }, "GRANT_VALIDITY_MISMATCH"],
  ];
  it.each(grantCases)("G01 grant %s denies", (_name, grant, issue) => {
    const f = setup({ grant }); denied(f.repository.assessProvenanceReadiness(f.request), issue);
  });
  it("G02 missing and unknown grant deny", () => {
    const f = setup({ omit: ["grant"] }); denied(f.repository.assessProvenanceReadiness(f.request), "GRANT_MISSING");
    const g = setup(); denied(g.repository.assessProvenanceReadiness({ ...g.request, grantId: randomUUID() }), "GRANT_MISSING");
  });
  it.each(["principalId", "policyId", "attemptId", "projectId", "authorityIncarnation"] as const)(
    "G03 invalid grant FK %s cannot be persisted", key => {
      const f = setup({ omit: ["grant"] }); expect(() => insert(f.raw.db, tables.grant, { ...f.grant, [key]: randomUUID() }))
        .toThrow(); denied(f.repository.assessProvenanceReadiness(f.request), "GRANT_MISSING");
    });
  it("G04 valid FK to another principal still requires exact ownership binding", () => {
    const f = setup({ omit: ["grant"] }), other = { ...f.principal, principalId: randomUUID() };
    insert(f.raw.db, tables.principal, other); insert(f.raw.db, tables.grant, { ...f.grant, principalId: other.principalId });
    denied(f.repository.assessProvenanceReadiness(f.request), "PRINCIPAL_BINDING_MISMATCH");
  });
  it("G05 valid FK to another policy still requires exact policy binding", () => {
    const f = setup({ omit: ["grant"] }), other = { ...f.policy, policyId: randomUUID() };
    insert(f.raw.db, tables.policy, other); insert(f.raw.db, tables.grant, { ...f.grant, policyId: other.policyId });
    denied(f.repository.assessProvenanceReadiness(f.request), "POLICY_BINDING_MISMATCH");
  });
  it("G06 corrupt grant relationship is denied even after schema guard restoration", () => {
    const f = setup(); corrupt(f, "grant", `UPDATE ${tables.grant} SET attemptId='${randomUUID()}'`);
    denied(f.repository.assessProvenanceReadiness(f.request), "PERSISTED_PROVENANCE_INVALID");
  });
});

describe("PI03 repository lifecycle and storage", () => {
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"] as const)("R01 consistent claims cannot override security %s", state => {
    const f = setup(); f.raw.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
    const r = f.repository.assessProvenanceReadiness({ ...f.request, securityRevision: 2 }); denied(r);
    expect(r.reason).toBe(state === "UNKNOWN" ? "SECURITY_STATE_UNKNOWN" : state === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STOP_ACTIVE");
    expect(r.provenanceStatus).toBe("FIXTURE_PROVENANCE_CONSISTENT");
  });
  it("R02 missing security state denies even with consistent claims", () => {
    const f = setup(); f.raw.db.exec("DELETE FROM runtime_execution_security");
    expect(f.repository.assessProvenanceReadiness(f.request)).toMatchObject({ reason: "SECURITY_RECORD_MISSING", executionAuthority: false });
  });
  it.each(["projectId", "authorityIncarnation", "attemptId"] as const)("R03 wrong current attempt %s denies", key => {
    const f = setup(); const r = f.repository.assessProvenanceReadiness({ ...f.request, expected: { ...f.request.expected, [key]: randomUUID() } });
    denied(r); expect(r.provenanceStatus).toBe("PROVENANCE_DENIED"); expect(r.observed).toBeNull();
  });
  it("R04 cancellation noLaunch and terminal states preserve PI02 denial semantics", () => {
    const f = leasedFixture(); let a = f.attempt;
    for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
      a = f.repository.transition({ ...transitionCommand(a, f.command.ownerNonce, phase), clock: clockAt(a, a.updatedAtMs + 1 - a.createdAtMs) });
    const clock = clockAt(a, a.updatedAtMs + 1 - a.createdAtMs), authority = f.repository.authorizeHostForTest(expected(a, f.command.ownerNonce), clock);
    a = f.repository.requestCancellation({ expected: expected(a, f.command.ownerNonce), clock, eventId: randomUUID(), requestId: randomUUID(),
      decisionId: randomUUID(), reason: "OWNER_CANCELLED", authorization: "s12-test-only" }, authority).attempt;
    const q = setup().request;
    const cancelled = f.repository.assessProvenanceReadiness({ ...q, expected: expected(a, f.command.ownerNonce) }); denied(cancelled);
    expect(cancelled.reason).toBe("ATTEMPT_CANCELLED");
    const g = setup(); const terminal = g.repository.commitTerminal(terminalCommand(g.attempt, g.command.ownerNonce, "INTERRUPTED")).attempt;
    const ended = g.repository.assessProvenanceReadiness({ ...g.request, expected: expected(terminal, g.command.ownerNonce) });
    denied(ended); expect(ended.reason).toBe("ATTEMPT_TERMINAL");
  });
  it("R05 version6-shaped fixture rejects repeated reopen without migrating or changing data", () => {
    const f = setup();
    // Remove newer empty child tables before their provenance parents to retain a v6-shaped fixture.
    for (const table of ["runtime_execution_sessions", "runtime_application_session_bindings"]) f.raw.db.exec(`DROP TABLE ${table}`);
    for (const kind of ["grant", "policy", "principal"] as const) f.raw.db.exec(`DROP TABLE ${tables[kind]}`);
    f.raw.db.exec("PRAGMA user_version=6");
    expect(f.repository.assessProvenanceReadiness(f.request).reason).toBe("SCHEMA_UNSUPPORTED");
    f.repository.close(); f.raw.close(); const filename = testDatabaseFilename(f.ref), before = fs.readFileSync(filename);
    for (let i = 0; i < 2; i++) failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
    expect(fs.readFileSync(filename)).toEqual(before);
    const raw = own(new DatabaseSync(filename)); expect(raw.prepare("SELECT attemptId FROM runtime_attempts").get()?.attemptId).toBe(f.attempt.attemptId);
  });
  it("R06 unsupported schema version denies on the existing connection", () => {
    const f = setup(); f.raw.db.exec("PRAGMA user_version=99");
    expect(f.repository.assessProvenanceReadiness(f.request)).toMatchObject({ reason: "SCHEMA_UNSUPPORTED", executionAuthority: false });
  });
  it.each(["principal", "policy", "grant"] as const)("R07 %s revocation survives reopen and cannot be undone by UPDATE/delete", kind => {
    const f = setup(), table = tables[kind], revision = kind === "grant" ? "authorizationRevision" : "revision";
    f.raw.db.exec(`UPDATE ${table} SET status='REVOKED',${revision}=2`);
    expect(() => f.raw.db.exec(`UPDATE ${table} SET status='ACTIVE',${revision}=3`)).toThrow();
    expect(() => f.raw.db.exec(`DELETE FROM ${table}`)).toThrow(); f.raw.close(); f.repository.close();
    const r = own(DurableAttemptRepository.openForTest(f.ref));
    denied(r.assessProvenanceReadiness(f.request), `${kind.toUpperCase()}_REVOKED` as ProvenanceReason);
  });
  it("R08 typed row validation rejects malformed provenance even when SQL shape accepts it", () => {
    const f = setup({ principal: { sourceId: " " } });
    denied(f.repository.assessProvenanceReadiness(f.request), "PRINCIPAL_RECORD_INVALID");
  });
  it("R09 unknown record version and forged TRUSTED classification fail closed", () => {
    const f = setup(); corrupt(f, "principal", `UPDATE ${tables.principal} SET recordVersion=2,sourceClass='TRUSTED'`);
    denied(f.repository.assessProvenanceReadiness(f.request), "PERSISTED_PROVENANCE_INVALID");
  });
  it("R10 reused attempt ID with new incarnation cannot inherit old provenance", () => {
    const f = setup(); failure(() => f.repository.issue({ ...f.command, authorityIncarnation: randomUUID(), issueRequestId: randomUUID() }), "IDENTITY_CONFLICT");
    const a = f.repository.assessProvenanceReadiness({ ...f.request, expected: { ...f.request.expected, authorityIncarnation: randomUUID() } }); denied(a);
    expect(a.reason).toBe("INCARNATION_MISMATCH");
  });
  it("R11 wrong caller task is an identity denial, not a claim of persisted corruption", () => {
    const f = setup(), before = snapshot(f);
    const r = f.repository.assessProvenanceReadiness({ ...f.request, expected: { ...f.request.expected, taskId: "another-task" } });
    denied(r); expect(r.reason).toBe("IDENTITY_MISMATCH"); expect(snapshot(f)).toEqual(before);
  });
  it("R12 reusing an attempt UUID in a fresh authority cannot inherit old principal/policy/grant rows", () => {
    const old = setup(), fresh = fixture(), command = { ...issueCommand(fresh.ref), attemptId: old.attempt.attemptId };
    const a = fresh.repository.issue(command).attempt, raw = own(openTestConnection(fresh.ref));
    expect(a.authorityIncarnation).not.toBe(old.attempt.authorityIncarnation);
    expect(() => insert(raw.db, tables.principal, old.principal)).toThrow();
    const r = fresh.repository.assessProvenanceReadiness({ ...old.request, expected: expected(a, command.ownerNonce) });
    for (const issue of ["PRINCIPAL_MISSING", "POLICY_MISSING", "GRANT_MISSING"] as const) denied(r, issue);
  });
});

describe("PI03 transactions, input and safety", () => {
  it("X01 revision changes before evaluation invalidate references, not just caller versions", () => {
    const f = setup(); f.raw.db.exec(`UPDATE ${tables.policy} SET revision=2`);
    denied(f.repository.assessProvenanceReadiness(f.request), "POLICY_REVISION_MISMATCH");
    denied(f.repository.assessProvenanceReadiness({ ...f.request, policyRevision: 2 }), "GRANT_POLICY_REVISION_MISMATCH");
  });
  it("X02 uncommitted revocation is invisible to readers; committed revocation always denies", () => {
    const f = setup(), other = own(DurableAttemptRepository.openForTest(f.ref));
    f.raw.db.exec(`BEGIN IMMEDIATE; UPDATE ${tables.grant} SET status='REVOKED',authorizationRevision=2`);
    try {
      for (const r of [f.repository, other]) { const d = r.assessProvenanceReadiness(f.request); denied(d); expect(d.provenanceStatus).toBe("FIXTURE_PROVENANCE_CONSISTENT"); }
      f.raw.db.exec("COMMIT");
    } finally { if (f.raw.db.isTransaction) f.raw.db.exec("ROLLBACK"); }
    for (const r of [f.repository, other]) denied(r.assessProvenanceReadiness(f.request), "GRANT_REVOKED");
  });
  it("X03 exclusive lock/read failure returns false, retry after rollback stays false", () => {
    const f = setup(), before = snapshot(f); f.raw.db.exec("BEGIN EXCLUSIVE");
    try { expect(f.repository.assessProvenanceReadiness(f.request)).toMatchObject({ reason: "STORAGE_UNAVAILABLE", executionAuthority: false }); }
    finally { f.raw.db.exec("ROLLBACK"); }
    denied(f.repository.assessProvenanceReadiness(f.request)); expect(snapshot(f)).toEqual(before);
  });
  it("X04 actual grant-write failure rolls back preceding fixture principal/policy writes", () => {
    const f = setup({ omit: ["principal", "policy", "grant"] }), before = snapshot(f);
    f.raw.db.exec("BEGIN IMMEDIATE");
    try {
      insert(f.raw.db, tables.principal, f.principal); insert(f.raw.db, tables.policy, f.policy); f.raw.db.exec("PRAGMA query_only=ON");
      try { insert(f.raw.db, tables.grant, f.grant); throw new Error("Expected READONLY"); }
      catch (e) { expect(e).toHaveProperty("errcode", 8); }
    } finally { f.raw.db.exec("ROLLBACK; PRAGMA query_only=OFF"); }
    expect(snapshot(f)).toEqual(before); denied(f.repository.assessProvenanceReadiness(f.request), "GRANT_MISSING");
  });
  it("X05 failed lifecycle validation rolls repository transaction back without consuming/mutating claims", () => {
    const f = setup(), before = snapshot(f);
    failure(() => f.repository.transition(transitionCommand(f.attempt, f.command.ownerNonce, "CREATED")), "INVALID_TRANSITION");
    expect(snapshot(f)).toEqual(before); denied(f.repository.assessProvenanceReadiness(f.request));
  });
  it("X06 caller-supplied provenance, authority flags, credentials and callbacks are rejected without writes", () => {
    const f = setup(), before = snapshot(f);
    for (const extra of [{ principal: f.principal }, { policy: f.policy }, { grant: f.grant },
      { trusted: true }, { sourceClass: "LOCAL_TEST_FIXTURE" }, { executionAuthority: true },
      { credentials: "dummy-only" }, { callback: () => { throw new Error("Do not invoke"); } }]) {
      const r = f.repository.assessProvenanceReadiness({ ...f.request, ...extra }); denied(r); expect(r.reason).toBe("INVALID_REQUEST");
    }
    expect(snapshot(f)).toEqual(before);
  });
  it("X07 malformed requests and throwing accessors return a structured denial", () => {
    const f = setup();
    for (const input of [null, [], {}, { get expected() { throw new Error("invalid transport"); } },
      { ...f.request, authorizationRevision: 0 }, { ...f.request, atMs: Infinity },
      { ...f.request, expected: { ...f.request.expected, principalId: f.principal.principalId } }]) {
      const r = f.repository.assessProvenanceReadiness(input); denied(r); expect(r.reason).toBe("INVALID_REQUEST");
    }
  });
  it("X08 readiness assessment performs no process/provider/network/credential/publication IO", () => {
    const f = setup(); const spies = [vi.spyOn(children, "spawn"), vi.spyOn(children, "fork"), vi.spyOn(children, "exec"),
      vi.spyOn(globalThis, "fetch"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs, "openSync")];
    try { denied(f.repository.assessProvenanceReadiness(f.request)); for (const s of spies) expect(s).not.toHaveBeenCalled(); }
    finally { for (const s of spies) s.mockRestore(); }
  });
  it("X09 repeated decisions are immutable, leave no intent or grant consumption and preserve PI02 result", () => {
    const f = setup(), before = snapshot(f), pi02 = { expected: f.request.expected, securityRevision: 1 };
    const baseline = f.repository.assessExecutionReadiness(pi02), result = f.repository.assessProvenanceReadiness(f.request);
    denied(result); expect(f.repository.assessProvenanceReadiness(f.request)).toEqual(result);
    expect(Object.isFrozen(result.provenanceReasons)).toBe(true); expect(Object.isFrozen(result.reasons)).toBe(true);
    expect(Reflect.set(result, "executionAuthority", true)).toBe(false);
    expect(f.repository.assessExecutionReadiness(pi02)).toEqual(baseline); expect(snapshot(f)).toEqual(before);
    expect(Object.getOwnPropertyNames(DurableAttemptRepository.prototype).join(" ")).not.toMatch(/issueGrant|clearStop|dispatch|publish/);
  });
  it("X10 closed repository denies without opening alternate storage or refreshing authority", () => {
    const f = setup(); f.repository.close(); const d = f.repository.assessProvenanceReadiness(f.request); denied(d);
    expect(d.reason).toBe("STORAGE_UNAVAILABLE");
  });
});
