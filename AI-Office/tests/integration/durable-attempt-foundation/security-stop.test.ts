import { randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import children from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS, USER_VERSION } from "../../../src/server/attempt-control/schema.js";
import { type ActivateSecurityStop, type SecurityStopFault } from "../../../src/server/attempt-control/security-stop.js";
import { createTestDatabase, openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { evidence, expected, failure, fixture, identity, issueCommand, own, root, terminalCommand, transitionCommand } from "./helpers.js";

const events = "runtime_security_stop_events", operations = "runtime_security_stop_operations", security = "runtime_execution_security";
function setup(state: "UNKNOWN" | "BLOCKED" | "ACTIVE_STOP" = "UNKNOWN") {
  const f = fixture(), command = issueCommand(f.ref);
  let attempt = f.repository.issue(command).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = f.repository.transition(transitionCommand(attempt, command.ownerNonce, phase));
  const raw = own(openTestConnection(f.ref));
  if (state !== "UNKNOWN") raw.db.prepare(`UPDATE ${security} SET securityState=?,securityRevision=2`).run(state);
  const q: ActivateSecurityStop = { expected: expected(attempt, command.ownerNonce), expectedSecurityRevision: state === "UNKNOWN" ? 1 : 2,
    operationId: randomUUID(), eventId: randomUUID(), action: "ACTIVATE_STOP", reason: "TEST_SECURITY_CONCERN", atMs: 2000 };
  return { ...f, command, attempt, raw, q };
}
type F = ReturnType<typeof setup>;
function snapshot(f: F) {
  return f.raw.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all()
    .map(r => [r.name, f.raw.db.prepare(`SELECT * FROM ${String(r.name)} ORDER BY rowid`).all()]);
}
function receipt(r: ReturnType<DurableAttemptRepository["activateSecurityStop"]>) {
  expect(r).toMatchObject({ executionAuthority: false, eligible: false, stateAfter: "ACTIVE_STOP", ownerApproval: "NOT_GRANTED",
    sourceClass: "LOCAL_TEST_FIXTURE", productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE",
    journalStatus: "REPOSITORY_APPEND_ONLY_JOURNAL_VERIFIED", externalWitness: "EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED" });
  expect(Object.isFrozen(r)).toBe(true);
}
function assertCounts(f: F, n: number, revision: number) {
  expect(f.raw.db.prepare(`SELECT count(*) AS n FROM ${events}`).get()?.n).toBe(n);
  expect(f.raw.db.prepare(`SELECT count(*) AS n FROM ${operations}`).get()?.n).toBe(n);
  expect(f.raw.db.prepare(`SELECT securityRevision FROM ${security}`).get()?.securityRevision).toBe(revision);
}
function sqlFailure(op: () => unknown) {
  try { op(); throw new Error("Expected SQLite constraint"); }
  catch (error) { expect(error).toHaveProperty("errcode"); expect(Number((error as { errcode: number }).errcode) & 255).toBe(19); }
}
// Privileged corruption of a newly owned fixture only; restore the exact production-shaped DDL before evaluation.
function tamper(f: F, table: string, sql: string) {
  const triggers = f.raw.db.prepare("SELECT name FROM sqlite_schema WHERE type='trigger' AND tbl_name=?").all(table).map(r => String(r.name));
  f.raw.db.exec("PRAGMA foreign_keys=OFF; PRAGMA ignore_check_constraints=ON");
  for (const name of triggers) f.raw.db.exec(`DROP TRIGGER ${name}`);
  try { f.raw.db.exec(sql); }
  finally {
    for (const name of triggers) f.raw.db.exec(SCHEMA_STATEMENTS.find(s => s.startsWith(`CREATE TRIGGER ${name} `))!);
    f.raw.db.exec("PRAGMA ignore_check_constraints=OFF; PRAGMA foreign_keys=ON");
  }
}
function faulty(f: F, stage: SecurityStopFault) {
  return own(DurableAttemptRepository.openForTest(f.ref, { eventType: "SECURITY_STOP_ACTIVATED", stage }));
}
function corruptDenied(f: F) {
  const d = f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: 2 });
  expect(d).toMatchObject({ reason: "PERSISTED_STATE_INVALID", executionAuthority: false, eligible: false });
  failure(() => f.repository.activateSecurityStop(f.q), "INTEGRITY");
  failure(() => f.repository.securityStopHistory(), "INTEGRITY");
  f.repository.close(); failure(() => DurableAttemptRepository.openForTest(f.ref), "INTEGRITY");
}

describe("PI05 activation-only state and identity", () => {
  it.each(["UNKNOWN", "BLOCKED"] as const)("S01 %s activates explicitly without approval or execution authority", state => {
    const f = setup(state), before = f.repository.read(identity(f.attempt));
    expect(f.repository.securityStopHistory().status).toBe("ACTIVATION_HISTORY_UNAVAILABLE");
    const r = f.repository.activateSecurityStop(f.q); receipt(r);
    expect(r).toMatchObject({ replay: false, revisionBefore: f.q.expectedSecurityRevision,
      revisionAfter: f.q.expectedSecurityRevision + 1, stateBefore: state, eventId: f.q.eventId, operationId: f.q.operationId });
    assertCounts(f, 1, r.revisionAfter); expect(f.repository.read(identity(f.attempt))).toEqual(before);
    expect(f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: r.revisionAfter }))
      .toMatchObject({ reason: "SECURITY_STOP_ACTIVE", executionAuthority: false });
    evidence("pi05-activation-" + state, { ref: f.ref, receipt: r, history: f.repository.securityStopHistory() });
  });
  it("S02 ACTIVE_STOP new operation is rejected while exact retry returns historical receipt", () => {
    const f = setup(), r = f.repository.activateSecurityStop(f.q), before = snapshot(f);
    receipt(f.repository.activateSecurityStop(f.q));
    expect(f.repository.activateSecurityStop(f.q)).toEqual({ ...r, replay: true });
    failure(() => f.repository.activateSecurityStop({ ...f.q, operationId: randomUUID(), eventId: randomUUID(), expectedSecurityRevision: 2 }), "SECURITY_STOP_ALREADY_ACTIVE");
    expect(snapshot(f)).toEqual(before); assertCounts(f, 1, 2);
  });
  it("S03 missing security denies without synthesizing a state or journal", () => {
    const f = setup(); f.raw.db.exec(`DELETE FROM ${security}`); const before = snapshot(f);
    failure(() => f.repository.activateSecurityStop(f.q), "INTEGRITY"); expect(snapshot(f)).toEqual(before);
    expect(f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: 1 }).reason).toBe("SECURITY_RECORD_MISSING");
  });
  it("S04 invalid persisted state is rejected before any stop write", () => {
    const f = setup(); tamper(f, security, `UPDATE ${security} SET securityState='READY'`);
    const before = snapshot(f); failure(() => f.repository.activateSecurityStop(f.q), "INTEGRITY"); expect(snapshot(f)).toEqual(before);
  });
  it("S05 missing attempt denies", () => {
    const f = setup(), before = snapshot(f);
    failure(() => f.repository.activateSecurityStop({ ...f.q, expected: { ...f.q.expected, attemptId: randomUUID() } }), "CONFLICT");
    expect(snapshot(f)).toEqual(before);
  });
  it.each(["projectId", "authorityIncarnation", "taskId", "hostInstanceId", "ownerId", "ownerNonce", "attemptGeneration", "stateVersion", "phase"] as const)(
    "S06 wrong expected %s denies without side effects", key => {
      const f = setup(), before = snapshot(f), value = key === "taskId" ? "wrong-task" : key === "ownerNonce" ? hash("wrong-owner") :
        key === "phase" ? "CREATED" : key === "attemptGeneration" || key === "stateVersion" ? 99 : randomUUID();
      const code = ["projectId", "authorityIncarnation", "taskId"].includes(key) ? "IDENTITY_CONFLICT" :
        ["stateVersion", "phase"].includes(key) ? "CONFLICT" : "STALE_OWNER";
      failure(() => f.repository.activateSecurityStop({ ...f.q, expected: { ...f.q.expected, [key]: value } }), code);
      expect(snapshot(f)).toEqual(before);
    });
  it.each(["CLEAR_STOP", "DEACTIVATE_STOP", "SET_READY", "ACKNOWLEDGE_STOP", "UNKNOWN"])("S07 action %s is absent from the API", action => {
    const f = setup(), before = snapshot(f); failure(() => f.repository.activateSecurityStop({ ...f.q, action }), "VALIDATION");
    expect(snapshot(f)).toEqual(before);
  });
  it.each([null, {}, [], { get expected() { throw new Error("bad transport"); } }])("S08 malformed input denies before transaction", input => {
    const f = setup(), before = snapshot(f); failure(() => f.repository.activateSecurityStop(input), "VALIDATION"); expect(snapshot(f)).toEqual(before);
  });
  it.each(["sourceClass", "authenticated", "issuer", "ownerApproval", "credentials", "callback"])("S09 caller %s metadata cannot fabricate authority", key => {
    const f = setup(), before = snapshot(f); failure(() => f.repository.activateSecurityStop({ ...f.q, [key]: "dummy-test-only" }), "VALIDATION");
    expect(snapshot(f)).toEqual(before);
  });
  it("S10 unjournaled ACTIVE_STOP is never certified or silently given fabricated activation history", () => {
    const f = setup("ACTIVE_STOP");
    expect(f.repository.securityStopHistory()).toMatchObject({ status: "ACTIVATION_HISTORY_UNAVAILABLE", events: [], executionAuthority: false });
    failure(() => f.repository.activateSecurityStop(f.q), "SECURITY_STOP_ALREADY_ACTIVE"); assertCounts(f, 0, 2);
  });
});

describe("PI05 CAS, durable idempotency and SQLite connections", () => {
  it("C01 stale revision leaves state and both journal tables untouched", () => {
    const f = setup("BLOCKED"), before = snapshot(f);
    failure(() => f.repository.activateSecurityStop({ ...f.q, expectedSecurityRevision: 1 }), "SECURITY_REVISION_CONFLICT"); expect(snapshot(f)).toEqual(before);
  });
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "1", null])("C02 invalid expected revision %s rejects", revision => {
    const f = setup(), before = snapshot(f); failure(() => f.repository.activateSecurityStop({ ...f.q, expectedSecurityRevision: revision }), "VALIDATION");
    expect(snapshot(f)).toEqual(before);
  });
  it("C03 two independent repository connections cannot commit competing CAS transitions", () => {
    const f = setup(), second = own(DurableAttemptRepository.openForTest(f.ref));
    receipt(f.repository.activateSecurityStop(f.q));
    failure(() => second.activateSecurityStop({ ...f.q, operationId: randomUUID(), eventId: randomUUID() }), "SECURITY_REVISION_CONFLICT");
    assertCounts(f, 1, 2); receipt(second.activateSecurityStop(f.q));
  });
  it("C04 held independent writer causes bounded BUSY, then retry after rollback succeeds once", () => {
    const f = setup(), before = snapshot(f); f.raw.db.exec("BEGIN IMMEDIATE");
    try { expect(failure(() => f.repository.activateSecurityStop(f.q), "DATABASE_BUSY").sqlite?.primary).toBe(5); }
    finally { f.raw.db.exec("ROLLBACK"); }
    expect(snapshot(f)).toEqual(before); receipt(f.repository.activateSecurityStop(f.q)); assertCounts(f, 1, 2);
  });
  it("C05 independent read lock causes actual COMMIT BUSY and rollback, never a confirmed receipt", () => {
    const f = setup(), before = snapshot(f); f.raw.db.exec("BEGIN"); f.raw.db.prepare(`SELECT * FROM ${security}`).all();
    try { expect(failure(() => f.repository.activateSecurityStop(f.q), "DATABASE_BUSY").sqlite?.primary).toBe(5); }
    finally { f.raw.db.exec("ROLLBACK"); }
    expect(snapshot(f)).toEqual(before); receipt(f.repository.activateSecurityStop(f.q)); assertCounts(f, 1, 2);
  });
  it("C06 duplicate operation through a second connection returns one committed event", () => {
    const f = setup(), second = own(DurableAttemptRepository.openForTest(f.ref)), r = f.repository.activateSecurityStop(f.q);
    expect(second.activateSecurityStop(f.q)).toEqual({ ...r, replay: true }); assertCounts(f, 1, 2);
  });
  it.each(["attemptId", "reason", "expectedSecurityRevision", "eventId", "atMs", "operationScope", "ownerNonce"] as const)(
    "C07 same operation ID with different %s is explicit idempotency conflict", kind => {
      const f = setup(); f.repository.activateSecurityStop(f.q); const before = snapshot(f);
      const q = kind === "attemptId" || kind === "ownerNonce" || kind === "operationScope" ? { ...f.q, expected: { ...f.q.expected,
        [kind === "operationScope" ? "taskId" : kind]: kind === "ownerNonce" ? hash("replacement") : kind === "operationScope" ? "other-task" : randomUUID() } } :
        { ...f.q, [kind]: kind === "reason" ? "POLICY_VIOLATION" : kind === "eventId" ? randomUUID() : 2 };
      failure(() => f.repository.activateSecurityStop(q), "SECURITY_IDEMPOTENCY_CONFLICT"); expect(snapshot(f)).toEqual(before);
    });
  it("C08 exact persisted retry survives reopen and later lifecycle change without granting current admission", () => {
    const f = setup(), r = f.repository.activateSecurityStop(f.q);
    f.repository.commitTerminal(terminalCommand(f.attempt, f.command.ownerNonce, "INTERRUPTED")); f.repository.close();
    const fresh = own(DurableAttemptRepository.openForTest(f.ref)); expect(fresh.activateSecurityStop(f.q)).toEqual({ ...r, replay: true }); assertCounts(f, 1, 2);
  });
  it("C09 lost acknowledgement after real commit reconciles by durable operation identity", () => {
    const f = setup(), writer = faulty(f, "afterCommit"); failure(() => writer.activateSecurityStop(f.q), "FAULT"); writer.close();
    assertCounts(f, 1, 2); const fresh = own(DurableAttemptRepository.openForTest(f.ref)), r = fresh.activateSecurityStop(f.q);
    receipt(r); expect(r.replay).toBe(true); assertCounts(f, 1, 2);
  });
  it("C10 supported SQL cannot roll back revisions, mutate a tracked projection, delete it or clear the stop", () => {
    const f = setup(); f.repository.activateSecurityStop(f.q); const before = snapshot(f);
    for (const sql of [`UPDATE ${security} SET securityRevision=1`, `UPDATE ${security} SET securityRevision=3`,
      `UPDATE ${security} SET securityState='UNKNOWN',securityRevision=3`, `UPDATE ${security} SET securityState='BLOCKED',securityRevision=3`,
      `UPDATE ${security} SET stopJournalHead=NULL,securityRevision=3`, `DELETE FROM ${security}`]) sqlFailure(() => f.raw.db.exec(sql));
    expect(snapshot(f)).toEqual(before);
  });
  it("C11 safe integer overflow and backdated activation cannot partially commit", () => {
    const f = setup(); failure(() => f.repository.activateSecurityStop({ ...f.q, atMs: 0 }), "VALIDATION");
    tamper(f, security, `UPDATE ${security} SET securityRevision=9007199254740991`); const before = snapshot(f);
    failure(() => f.repository.activateSecurityStop({ ...f.q, expectedSecurityRevision: Number.MAX_SAFE_INTEGER }), "INTEGRITY");
    expect(snapshot(f)).toEqual(before);
  });
});

describe("PI05 append-only journal, corruption and atomic faults", () => {
  it.each([events, operations])("J01 %s rejects UPDATE and DELETE", table => {
    const f = setup(); f.repository.activateSecurityStop(f.q); const before = snapshot(f);
    sqlFailure(() => f.raw.db.exec(`UPDATE ${table} SET requestDigest='${hash("changed")}'`));
    sqlFailure(() => f.raw.db.exec(`DELETE FROM ${table}`)); expect(snapshot(f)).toEqual(before);
  });
  it("J02 committed receipt references actual event, operation, head and revision without raw owner secrets", () => {
    const f = setup(), r = f.repository.activateSecurityStop(f.q); receipt(r);
    expect(f.raw.db.prepare(`SELECT eventId,requestDigest FROM ${operations}`).get()).toEqual({ eventId: r.eventId, requestDigest: r.requestDigest });
    expect(f.raw.db.prepare(`SELECT stopJournalHead,securityRevision FROM ${security}`).get()).toEqual({ stopJournalHead: r.eventId, securityRevision: r.revisionAfter });
    expect(f.repository.securityStopHistory().events[0]?.eventDigest).toBe(r.eventDigest);
    expect(JSON.stringify(f.repository.securityStopHistory())).not.toContain(f.command.ownerNonce);
    expect(Reflect.set(r, "executionAuthority", true)).toBe(false);
  });
  it("J03 duplicate event revision/operation constraints reject insertion without deleting evidence", () => {
    const f = setup(), r = f.repository.activateSecurityStop(f.q), event = f.raw.db.prepare(`SELECT * FROM ${events}`).get()!;
    const keys = Object.keys(event), insert = (row: Record<string, unknown>) => f.raw.db.prepare(`INSERT INTO ${events}(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`)
      .run(...keys.map(key => row[key]) as (string | number | null)[]);
    sqlFailure(() => insert({ ...event, eventId: randomUUID() }));
    sqlFailure(() => insert({ ...event, eventId: randomUUID(), operationId: randomUUID() })); assertCounts(f, 1, r.revisionAfter);
  });
  const corruptions = [
    [events, `DELETE FROM ${events}`, "missing required event"],
    [operations, `DELETE FROM ${operations}`, "missing operation"],
    [events, `UPDATE ${events} SET recordVersion=99`, "unsupported event schema"],
    [operations, `UPDATE ${operations} SET recordVersion=99`, "unsupported operation schema"],
    [events, `UPDATE ${events} SET journalSequence=2`, "revision ordering gap"],
    [events, `UPDATE ${events} SET eventDigest='${hash("corrupt")}'`, "corrupt event digest"],
    [events, `UPDATE ${events} SET taskId='wrong-task'`, "invalid attempt scope"],
    [events, `UPDATE ${events} SET attemptGeneration=2`, "invalid epoch"],
    [events, `UPDATE ${events} SET authorityIncarnation='${randomUUID()}'`, "invalid incarnation"],
    [operations, `UPDATE ${operations} SET requestDigest='${hash("wrong")}'`, "inconsistent operation digest"],
    [operations, `UPDATE ${operations} SET eventId='${randomUUID()}'`, "invalid operation event reference"],
    [security, `UPDATE ${security} SET securityRevision=3`, "projection revision mismatch"],
    [security, `UPDATE ${security} SET stopJournalHead=NULL`, "missing projection head"],
  ] as const;
  it.each(corruptions)("J04 %s %s detects %s on readiness, activation, audit and reopen", (table, sql) => {
    const f = setup(); f.repository.activateSecurityStop(f.q); tamper(f, table, sql); corruptDenied(f);
  });
  it.each(["beforeUpdate", "afterUpdate", "afterJournal", "afterOperation", "beforeCommit"] as const)("F01 fixed %s fault rolls all records back; retry succeeds once", stage => {
    const f = setup(), writer = faulty(f, stage), before = snapshot(f);
    failure(() => writer.activateSecurityStop(f.q), "FAULT"); expect(snapshot(f)).toEqual(before); writer.close(); f.repository.close();
    const fresh = own(DurableAttemptRepository.openForTest(f.ref));
    expect(fresh.securityStopHistory().events).toEqual([]); receipt(fresh.activateSecurityStop(f.q)); assertCounts(f, 1, 2);
  });
  it.each(["journalWrite", "operationWrite", "journalConstraint", "operationConstraint"] as const)("F02 actual SQLite %s failure rolls state/event/idempotency back", stage => {
    const f = setup(), writer = faulty(f, stage), before = snapshot(f), err = failure(() => writer.activateSecurityStop(f.q), "DATABASE_FAILURE");
    expect(err.sqlite?.primary).toBe(stage.endsWith("Write") ? 8 : 19);
    expect(snapshot(f)).toEqual(before); writer.close(); receipt(f.repository.activateSecurityStop(f.q)); assertCounts(f, 1, 2);
  });
  it("F03 actual exclusive read lock denies all readiness while preserving stop history", () => {
    const f = setup(); f.repository.activateSecurityStop(f.q); f.raw.db.exec("BEGIN EXCLUSIVE");
    try {
      expect(f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: 2 }))
        .toMatchObject({ reason: "STORAGE_UNAVAILABLE", executionAuthority: false });
      failure(() => f.repository.activateSecurityStop(f.q), "DATABASE_BUSY");
    } finally { f.raw.db.exec("ROLLBACK"); }
    receipt(f.repository.activateSecurityStop(f.q)); assertCounts(f, 1, 2);
  });
  it("F04 closed repository cannot return a success receipt or open alternate storage", () => {
    const f = setup(), before = snapshot(f); f.repository.close();
    failure(() => f.repository.activateSecurityStop(f.q), "DATABASE_FAILURE"); expect(snapshot(f)).toEqual(before);
  });
});

describe("PI05 fixture schema, recovery limits and safety", () => {
  it("R01 fresh v9 has UNKNOWN/revision1, null head, empty operations/events and unavailable history", () => {
    const f = setup(); expect(USER_VERSION).toBe(10); assertCounts(f, 0, 1);
    expect(f.raw.db.prepare(`SELECT securityState,stopJournalHead FROM ${security}`).get()).toEqual({ securityState: "UNKNOWN", stopJournalHead: null });
    expect(f.repository.securityStopHistory().status).toBe("ACTIVATION_HISTORY_UNAVAILABLE");
  });
  it("R02 v8-versioned fixture with no journal tables repeatedly rejects without migration or byte rewriting", () => {
    const f = setup(); f.raw.db.exec(`DROP TABLE ${operations}; DROP TABLE ${events}; PRAGMA user_version=8`);
    f.repository.close(); f.raw.close(); const filename = testDatabaseFilename(f.ref), before = fs.readFileSync(filename);
    for (let n = 0; n < 2; n++) failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
    expect(fs.readFileSync(filename)).toEqual(before);
  });
  it("R03 unsupported schema denies on an open repository and reopen", () => {
    const f = setup(); f.raw.db.exec("PRAGMA user_version=99");
    failure(() => f.repository.activateSecurityStop(f.q), "SCHEMA"); f.repository.close();
    failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
  });
  it.each(["afterSchema", "afterSecurity", "securityWrite"] as const)("R04 fresh initializer %s rollback leaves no partial journal/schema; retry uses another DB", fault => {
    const before = new Set(fs.readdirSync(root.root));
    failure(() => createTestDatabase(root, fault), fault === "securityWrite" ? "DATABASE_FAILURE" : "FAULT");
    const names = fs.readdirSync(root.root).filter(n => !before.has(n)); expect(names).toHaveLength(1);
    const db = own(new DatabaseSync(path.join(root.root, names[0]!, "authority.db")));
    expect(db.prepare("SELECT name FROM sqlite_schema WHERE sql IS NOT NULL").all()).toEqual([]);
    expect(db.prepare("PRAGMA user_version").get()?.user_version).toBe(0);
    const healthy = createTestDatabase(root), fresh = own(DurableAttemptRepository.openForTest(healthy));
    expect(fresh.securityStopHistory().events).toEqual([]);
  });
  it("R05 complete internally consistent old DB restoration is not detectable without an external witness", () => {
    const f = setup(), filename = testDatabaseFilename(f.ref), oldBytes = fs.readFileSync(filename);
    receipt(f.repository.activateSecurityStop(f.q)); f.repository.close(); f.raw.close();
    fs.writeFileSync(filename, oldBytes);
    const fresh = own(DurableAttemptRepository.openForTest(f.ref));
    expect(fresh.securityStopHistory()).toMatchObject({ status: "ACTIVATION_HISTORY_UNAVAILABLE", events: [],
      externalWitness: "EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED", executionAuthority: false });
    expect(fresh.assessExecutionReadiness({ expected: f.q.expected, securityRevision: 1 }))
      .toMatchObject({ reason: "SECURITY_STATE_UNKNOWN", executionAuthority: false });
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"] as const)("R06 %s always denies and never creates READY", state => {
    const f = setup(state), d = f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: f.q.expectedSecurityRevision });
    expect(d).toMatchObject({ executionAuthority: false, eligible: false, observed: { securityState: state } });
    expect(d.reason).toBe(state === "UNKNOWN" ? "SECURITY_STATE_UNKNOWN" : state === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STOP_ACTIVE");
  });
  it("R07 activation/history/readiness do not dispatch, call providers, read credentials or publish output", () => {
    const f = setup(), spies = [vi.spyOn(children, "spawn"), vi.spyOn(children, "fork"), vi.spyOn(children, "exec"),
      vi.spyOn(globalThis, "fetch"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs, "openSync")];
    try {
      receipt(f.repository.activateSecurityStop(f.q)); expect(f.repository.securityStopHistory().executionAuthority).toBe(false);
      expect(f.repository.assessExecutionReadiness({ expected: f.q.expected, securityRevision: 2 }).executionAuthority).toBe(false);
      for (const s of spies) expect(s).not.toHaveBeenCalled();
    } finally { for (const s of spies) s.mockRestore(); }
  });
  it("R08 activation changes no attempt/event/epoch/provenance/session/grant rows or launch intent", () => {
    const f = setup(), before = snapshot(f).filter(([name]) => ![security, events, operations].includes(String(name)));
    receipt(f.repository.activateSecurityStop(f.q));
    expect(snapshot(f).filter(([name]) => ![security, events, operations].includes(String(name)))).toEqual(before);
    expect(f.repository.securityStopHistory().events).toHaveLength(1);
  });
});
