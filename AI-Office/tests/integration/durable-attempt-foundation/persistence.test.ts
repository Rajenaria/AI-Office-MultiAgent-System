import { randomUUID } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { DurableAttemptRepository, type FaultStage } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS, USER_VERSION } from "../../../src/server/attempt-control/schema.js";
import { createTestDatabase, openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { advance, evidence, expected, failure, fixture, identity, issueCommand, own, root, terminalCommand, transitionCommand } from "./helpers.js";

describe("PI02 isolated readiness persistence", () => {
  it("S01 fresh schema uses SQL defaults UNKNOWN/revision1 and has no grant", () => {
    const { ref } = fixture(), c = own(openTestConnection(ref));
    expect(c.db.prepare("PRAGMA user_version").get()?.user_version).toBe(USER_VERSION);
    expect(c.db.prepare("SELECT * FROM runtime_execution_security").get()).toMatchObject({
      projectId: ref.projectId, authorityIncarnation: ref.authorityIncarnation, recordVersion: 1,
      securityRevision: 1, securityState: "UNKNOWN", policyVersion: null });
    c.db.exec("DELETE FROM runtime_execution_security");
    c.db.prepare("INSERT INTO runtime_execution_security(projectId,authorityIncarnation) VALUES(?,?)").run(ref.projectId, ref.authorityIncarnation);
    expect(c.db.prepare("SELECT securityState FROM runtime_execution_security").get()?.securityState).toBe("UNKNOWN");
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"] as const)("S02 reopen preserves %s denial and exact revision", state => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt;
    const c = own(openTestConnection(f.ref));
    c.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
    c.close(); f.repository.close(); const r = own(DurableAttemptRepository.openForTest(f.ref));
    const result = r.assessExecutionReadiness({ expected: expected(a, command.ownerNonce), securityRevision: 2 });
    expect(result).toMatchObject({ eligible: false, executionAuthority: false, observed: { securityState: state, securityRevision: 2 } });
    expect(r.read(identity(a))).toEqual(a);
  });
  it("S03 missing row stays missing after repeated reopen, never backfilled as approved", () => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt;
    const c = own(openTestConnection(f.ref)); c.db.exec("DELETE FROM runtime_execution_security"); c.close(); f.repository.close();
    for (let i = 0; i < 2; i++) {
      const r = own(DurableAttemptRepository.openForTest(f.ref));
      expect(r.assessExecutionReadiness({ expected: expected(a, command.ownerNonce), securityRevision: 1 }))
        .toMatchObject({ reason: "SECURITY_RECORD_MISSING", executionAuthority: false }); r.close();
    }
  });
  it("S04 legacy v5 without readiness table is rejected repeatedly without migration/data rewriting", () => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt; f.repository.close();
    const c = own(openTestConnection(f.ref));
    c.db.exec("DROP TRIGGER runtime_security_guard; DROP TABLE runtime_execution_security; PRAGMA user_version=5"); c.close();
    const filename = testDatabaseFilename(f.ref), before = readFileSync(filename);
    for (let i = 0; i < 2; i++) failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
    expect(readFileSync(filename)).toEqual(before);
    const raw = own(new DatabaseSync(filename));
    expect(raw.prepare("SELECT attemptId FROM runtime_attempts").get()?.attemptId).toBe(a.attemptId);
    expect(raw.prepare("PRAGMA user_version").get()?.user_version).toBe(5);
  });
  it("S05 unsupported version is denied on an already open repository and rejected on reopen", () => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt;
    const c = own(openTestConnection(f.ref)); c.db.exec("PRAGMA user_version=99"); c.close();
    expect(f.repository.assessExecutionReadiness({ expected: expected(a, command.ownerNonce), securityRevision: 1 }))
      .toMatchObject({ reason: "SCHEMA_UNSUPPORTED", executionAuthority: false });
    f.repository.close(); failure(() => DurableAttemptRepository.openForTest(f.ref), "SCHEMA");
  });
  it("S06 malformed policy record is rejected by typed row validation even if SQL accepts it", () => {
    const f = fixture(), command = issueCommand(f.ref), a = f.repository.issue(command).attempt;
    const c = own(openTestConnection(f.ref)); c.db.exec("UPDATE runtime_execution_security SET policyVersion=' ',securityRevision=2");
    expect(f.repository.assessExecutionReadiness({ expected: expected(a, command.ownerNonce), securityRevision: 2 }))
      .toMatchObject({ reason: "SECURITY_RECORD_INVALID", executionAuthority: false });
  });
  it("S07 security identity and monotonic revision/stop restrictions are enforced in SQL", () => {
    const { ref } = fixture(), c = own(openTestConnection(ref));
    for (const sql of ["UPDATE runtime_execution_security SET securityRevision=0",
      "UPDATE runtime_execution_security SET securityRevision=1",
      "UPDATE runtime_execution_security SET projectId='other',securityRevision=2",
      "UPDATE runtime_execution_security SET authorityIncarnation='other',securityRevision=2",
      "UPDATE runtime_execution_security SET securityState='READY',securityRevision=2"])
      sqlFailure(() => c.db.exec(sql));
    c.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=2");
    sqlFailure(() => c.db.exec("UPDATE runtime_execution_security SET securityState='UNKNOWN',securityRevision=3"));
    c.db.exec("UPDATE runtime_execution_security SET securityState='ACTIVE_STOP',securityRevision=3");
    sqlFailure(() => c.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=4"));
    expect(c.db.prepare("SELECT securityState,securityRevision FROM runtime_execution_security").get())
      .toEqual({ securityState: "ACTIVE_STOP", securityRevision: 3 });
  });
  it.each(["afterSchema", "afterSecurity", "securityWrite"] as const)("S08 initializer failure %s leaves no partial schema/security/meta", fault => {
    const before = new Set(readdirSync(root.root));
    const error = failure(() => createTestDatabase(root, fault), fault === "securityWrite" ? "DATABASE_FAILURE" : "FAULT");
    if (fault === "securityWrite") expect(error.sqlite?.primary).toBe(8); // real SQLITE_READONLY
    const added = readdirSync(root.root).filter(name => !before.has(name)); expect(added).toHaveLength(1);
    const filename = path.join(root.root, added[0]!, "authority.db"), c = own(new DatabaseSync(filename));
    expect(c.prepare("SELECT name FROM sqlite_schema WHERE sql IS NOT NULL").all()).toEqual([]);
    expect(c.prepare("PRAGMA user_version").get()?.user_version).toBe(0);
    expect(c.isTransaction).toBe(false);
    const healthy = createTestDatabase(root), reopened = own(openTestConnection(healthy));
    expect(reopened.db.prepare("SELECT securityState FROM runtime_execution_security").get()?.securityState).toBe("UNKNOWN");
    evidence(`pi02-initializer-${fault}`, { fault, failedFile: filename, rollbackVerified: true, healthy });
  });
  it("S09 duplicate security insertion is rejected and retains the original denial", () => {
    const { ref } = fixture(), c = own(openTestConnection(ref));
    sqlFailure(() => c.db.prepare("INSERT INTO runtime_execution_security(projectId,authorityIncarnation) VALUES(?,?)")
      .run(ref.projectId, ref.authorityIncarnation));
    expect(c.db.prepare("SELECT securityState,securityRevision FROM runtime_execution_security").get())
      .toEqual({ securityState: "UNKNOWN", securityRevision: 1 });
  });
});

function counts(ref: Parameters<typeof openTestConnection>[0]) {
  const c = own(openTestConnection(ref));
  return { attempts: c.db.prepare("SELECT count(*) AS n FROM runtime_attempts").get()?.n,
    events: c.db.prepare("SELECT count(*) AS n FROM runtime_attempt_events").get()?.n,
    epochs: c.db.prepare("SELECT count(*) AS n FROM runtime_owner_epochs").get()?.n };
}
function sqlFailure(operation: () => unknown, primary = 19) {
  try { operation(); throw new Error("Expected SQLite failure"); }
  catch (error) { expect(error).toHaveProperty("errcode"); expect(Number((error as { errcode: number }).errcode) & 255).toBe(primary); return error; }
}
describe("isolated storage", () => {
  it("verifies every connection PRAGMA and actual adapter bound statements/changes/close/reopen", () => {
    const { ref, repository } = fixture(), second = own(openTestConnection(ref));
    expect(repository.settings).toMatchObject({ journalMode: "delete", synchronous: 3, foreignKeys: 1, busyTimeout: 100,
      trustedSchema: 0, readUncommitted: 0 });
    expect(second.settings).toEqual(repository.settings);
    expect(repository.settings.sqliteVersion).toMatch(/^\d+\.\d+\.\d+$/);
    const command = issueCommand(ref), result = repository.issue(command);
    expect(result).toMatchObject({ replay: false, attempt: { phase: "CREATED", attemptGeneration: 1, stateVersion: 1 } });
    repository.close(); second.close();
    const reopened = own(DurableAttemptRepository.openForTest(ref));
    expect(reopened.read(identity(result.attempt))).toEqual(result.attempt);
    expect(counts(ref)).toEqual({ attempts: 1, events: 1, epochs: 1 });
    evidence("configuration-reopen", { ref, settings: reopened.settings, counts: counts(ref), file: testDatabaseFilename(ref) });
  });
  it("rejects arbitrary production-shaped paths, forged ownership, path traversal and missing DB without creating it", () => {
    const { ref } = fixture();
    failure(() => openTestConnection({ ...ref, filename: "C:\\production\\project.db" }), "VALIDATION");
    failure(() => openTestConnection({ ...ref, root: path.dirname(root.root) }), "UNSAFE_STORAGE");
    failure(() => openTestConnection({ ...ref, databaseToken: ".." }), "VALIDATION");
    failure(() => openTestConnection({ ...ref, rootToken: randomUUID() }), "UNSAFE_STORAGE");
    failure(() => openTestConnection({ ...ref, projectId: randomUUID() }), "UNSAFE_STORAGE");
    const absent = path.join(root.root, randomUUID(), "authority.db");
    failure(() => openTestConnection({ ...ref, databaseToken: path.basename(path.dirname(absent)) }), "DATABASE_FAILURE");
    expect(() => lstatSync(absent)).toThrow();
  });
  it.each(["PRAGMA user_version=99", "PRAGMA application_id=0", "CREATE TABLE impostor(x TEXT)"])("rejects incompatible schema %s", (sql) => {
    const { ref, repository } = fixture(); repository.close();
    const c = own(openTestConnection(ref)); c.db.exec(sql); c.close();
    failure(() => DurableAttemptRepository.openForTest(ref), "SCHEMA");
  });
  it("rejects an unexpected persistent journal mode without changing it back", () => {
    const { ref, repository } = fixture(); repository.close();
    const c = own(openTestConnection(ref)); c.db.exec("PRAGMA journal_mode=WAL"); c.close();
    failure(() => openTestConnection(ref), "SCHEMA");
  });
  it("enforces foreign keys, immutable identity and append-only epochs/events at SQLite boundary", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = repository.issue(command).attempt;
    const c = own(openTestConnection(ref));
    const fk = sqlFailure(() => c.db.prepare("INSERT INTO runtime_owner_epochs VALUES(?,?,?,?,?,?,?,?)")
      .run(ref.projectId, randomUUID(), 1, a.hostInstanceId, a.ownerId, a.ownerNonceHash, "EXECUTION", 1));
    expect(fk).toMatchObject({ errcode: 787 });
    for (const sql of ["UPDATE runtime_attempts SET projectId='changed'", "UPDATE runtime_attempts SET taskId='changed'",
      "UPDATE runtime_attempts SET attemptId='changed'", "DELETE FROM runtime_attempt_events", "UPDATE runtime_attempt_events SET eventType='PHASE_CHANGED'",
      "DELETE FROM runtime_owner_epochs", "UPDATE runtime_owner_epochs SET ownerId='changed'", "DELETE FROM runtime_attempts"]) sqlFailure(() => c.db.exec(sql));
    expect(repository.read(identity(a))).toEqual(a);
    evidence("constraints", { ref, foreignKeyError: { extended: 787, primary: 19 }, counts: counts(ref) });
  });
});
describe("issuance, CAS and journal", () => {
  it("deduplicates identical issue digest across independent connections and rejects changed payload/attempt/project", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), first = repository.issue(command);
    const second = own(DurableAttemptRepository.openForTest(ref));
    expect(second.issue({ ...command, eventId: randomUUID(), createdAtMs: 2_000 })).toEqual({ attempt: first.attempt, replay: true });
    for (const change of [{ actionDigest: hash("different") }, { attemptId: randomUUID() }, { ownerId: randomUUID() }])
      failure(() => second.issue({ ...command, ...change }), "CONFLICT");
    failure(() => second.issue({ ...command, projectId: randomUUID() }), "IDENTITY_CONFLICT");
    failure(() => second.issue({ ...command, taskId: "other-task", issueRequestId: randomUUID(), attemptId: randomUUID() }), "CONFLICT");
    expect(counts(ref)).toEqual({ attempts: 1, events: 1, epochs: 1 });
  });
  it("rejects wrong immutable identities, versions, generations and owners without mutation", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = repository.issue(command).attempt;
    for (const change of [{ projectId: randomUUID() }, { authorityIncarnation: randomUUID() }, { taskId: "other" }])
      failure(() => repository.transition({ ...transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"), expected: { ...expected(a, command.ownerNonce), ...change } }), "IDENTITY_CONFLICT");
    failure(() => repository.transition({ ...transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"), expected: { ...expected(a, command.ownerNonce), attemptId: randomUUID() } }), "CONFLICT");
    for (const change of [{ attemptGeneration: 2 }, { ownerId: randomUUID() }, { hostInstanceId: randomUUID() }, { ownerNonce: hash("wrong") }])
      failure(() => repository.transition({ ...transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"), expected: { ...expected(a, command.ownerNonce), ...change } }), "STALE_OWNER");
    failure(() => repository.transition({ ...transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"), expected: { ...expected(a, command.ownerNonce), stateVersion: 2 } }), "CONFLICT");
    const b = repository.transition(transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"));
    failure(() => repository.transition(transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING")), "CONFLICT");
    expect(b.stateVersion).toBe(2); expect(repository.history(identity(b)).map((e) => e.newVersion)).toEqual([1, 2]);
  });
  it("CAS zero-row is CONFLICT even after successful prevalidation, with no event; later valid transaction succeeds", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = repository.issue(command).attempt;
    const c = own(openTestConnection(ref));
    c.db.exec("CREATE TRIGGER s12_ignore BEFORE UPDATE ON runtime_attempts BEGIN SELECT RAISE(IGNORE); END");
    failure(() => repository.transition(transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING")), "CONFLICT");
    c.db.exec("DROP TRIGGER s12_ignore");
    expect(counts(ref)).toEqual({ attempts: 1, events: 1, epochs: 1 });
    expect(repository.transition(transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING")).stateVersion).toBe(2);
  });
  it("duplicate event ID rolls projection back and preserves extended SQLite code", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = repository.issue(command).attempt;
    const error = failure(() => repository.transition({ ...transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING"), eventId: command.eventId }), "DATABASE_FAILURE");
    expect(error.sqlite).toMatchObject({ primary: 19, extended: 1555 });
    expect(repository.read(identity(a))).toEqual(a); expect(counts(ref)).toEqual({ attempts: 1, events: 1, epochs: 1 });
    evidence("event-duplicate", { ref, sqlite: error.sqlite, counts: counts(ref) });
  });
  it("synthetic recovery atomically advances epoch and rejects all old-generation mutations/terminal receipts", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = advance(repository, command, "UNCERTAIN");
    const newOwner = { hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash(randomUUID()) };
    const fenced = repository.fenceForTestRecovery({ expected: expected(a, command.ownerNonce), newOwner,
      eventId: randomUUID(), atMs: a.updatedAtMs + 1, testRecoveryGrantId: randomUUID(), authorization: "s12-test-only" });
    expect(fenced).toMatchObject({ attemptGeneration: 2, stateVersion: 3, phase: "RECONCILIATION_REQUIRED", ownerMode: "RECOVERY" });
    failure(() => repository.transition(transitionCommand(a, command.ownerNonce, "RECONCILIATION_REQUIRED")), "STALE_OWNER");
    failure(() => repository.commitTerminal(terminalCommand(a, command.ownerNonce, "FAILED")), "STALE_OWNER");
    failure(() => repository.commitTerminal(terminalCommand(fenced, newOwner.ownerNonce, "COMPLETED")), "INVALID_TRANSITION");
    const terminal = repository.commitTerminal(terminalCommand(fenced, newOwner.ownerNonce, "FAILED"));
    expect(terminal.attempt).toMatchObject({ attemptGeneration: 2, stateVersion: 4, phase: "FAILED" });
    expect(counts(ref)).toEqual({ attempts: 1, events: 4, epochs: 2 });
    evidence("generation-fence", { ref, prior: { generation: 1, version: 2 }, final: terminal.attempt, counts: counts(ref) });
  });
  it("detects projection/event version gaps on a separate reopen rather than repairing them", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref); repository.issue(command); repository.close();
    const c = own(openTestConnection(ref)); c.db.exec("UPDATE runtime_attempts SET stateVersion=2,phase='APPROVAL_PENDING'"); c.close();
    failure(() => DurableAttemptRepository.openForTest(ref), "INTEGRITY");
  });
  it("detects tampered event payload/hash despite restored append-only trigger and schema identity", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref); repository.issue(command); repository.close();
    const c = own(openTestConnection(ref));
    c.db.exec("DROP TRIGGER runtime_attempt_events_no_update");
    c.db.prepare("UPDATE runtime_attempt_events SET payloadDigest=?").run(hash("tampered"));
    c.db.exec(SCHEMA_STATEMENTS.find((s) => s.startsWith("CREATE TRIGGER runtime_attempt_events_no_update"))!); c.close();
    failure(() => DurableAttemptRepository.openForTest(ref), "INTEGRITY");
  });
});
describe("terminal receipts", () => {
  it("commits once, recognizes identical semantic receipt after reopen, rejects conflicting receipt/payload/project", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = advance(repository, command), receipt = terminalCommand(a, command.ownerNonce);
    const first = repository.commitTerminal(receipt); expect(first.replay).toBe(false); repository.close();
    const second = own(DurableAttemptRepository.openForTest(ref));
    expect(second.commitTerminal({ ...receipt, eventId: randomUUID(), atMs: receipt.atMs + 100 })).toEqual({ attempt: first.attempt, replay: true });
    failure(() => second.commitTerminal({ ...receipt, receipt: { ...receipt.receipt, receiptId: randomUUID() } }), "TERMINAL_CONFLICT");
    failure(() => second.commitTerminal({ ...receipt, receipt: { ...receipt.receipt, resultDigest: hash("different") } }), "TERMINAL_CONFLICT");
    failure(() => second.commitTerminal({ ...receipt, expected: { ...receipt.expected, projectId: randomUUID() } }), "IDENTITY_CONFLICT");
    failure(() => second.transition(transitionCommand(first.attempt, command.ownerNonce, "RUNNING")), "INVALID_TRANSITION");
    const c = own(openTestConnection(ref)); sqlFailure(() => c.db.exec("UPDATE runtime_attempts SET phase='RUNNING',stateVersion=stateVersion+1"));
    expect(counts(ref)).toEqual({ attempts: 1, events: 6, epochs: 1 });
    const raw = readFileSync(testDatabaseFilename(ref)); expect(raw.includes(command.ownerNonce)).toBe(false);
    evidence("terminal-idempotency", { ref, receiptId: receipt.receipt.receiptId, version: first.attempt.stateVersion, counts: counts(ref) });
  });
  it("stop-intent-first rejects success, and later cancellation terminal cannot be replaced", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = advance(repository, command);
    const stopped = repository.transition(transitionCommand(a, command.ownerNonce, "CANCELLATION_REQUESTED"));
    failure(() => repository.commitTerminal(terminalCommand(stopped, command.ownerNonce)), "INVALID_TRANSITION");
    const terminal = repository.commitTerminal(terminalCommand(stopped, command.ownerNonce, "INTERRUPTED"));
    failure(() => repository.commitTerminal(terminalCommand(a, command.ownerNonce)), "TERMINAL_CONFLICT");
    expect(terminal.attempt.phase).toBe("INTERRUPTED"); expect(counts(ref).events).toBe(7);
  });
  it("requires a terminal receipt and matching outcome reason, never terminalizes through generic transition", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = advance(repository, command);
    failure(() => repository.transition(transitionCommand(a, command.ownerNonce, "COMPLETED")), "INVALID_TRANSITION");
    failure(() => repository.commitTerminal({ ...terminalCommand(a, command.ownerNonce), receipt: {} }), "VALIDATION");
    const receipt = terminalCommand(a, command.ownerNonce);
    failure(() => repository.commitTerminal({ ...receipt, receipt: { ...receipt.receipt, reason: "CANCELLED" } }), "VALIDATION");
    expect(repository.read(identity(a))).toEqual(a);
  });
});
describe("controlled transaction faults", () => {
  it.each(["beforeProjection", "afterProjection", "afterEvent"] as FaultStage[])("issuance %s leaves no partial rows and allows the same command later", (stage) => {
    const ref = createTestDatabase(root), command = issueCommand(ref);
    const faulty = own(DurableAttemptRepository.openForTest(ref, { stage, eventType: "ATTEMPT_ISSUED" }));
    failure(() => faulty.issue(command), "FAULT"); faulty.close();
    expect(counts(ref)).toEqual({ attempts: 0, events: 0, epochs: 0 });
    const reopened = own(DurableAttemptRepository.openForTest(ref)); expect(reopened.issue(command).replay).toBe(false);
    evidence(`rollback-issue-${stage}`, { ref, stage, afterFailure: { attempts: 0, events: 0, epochs: 0 }, final: counts(ref) });
  });
  it.each(["PHASE_CHANGED", "TERMINAL_COMMITTED", "OWNER_FENCED"] as const)("all three %s failure points roll back projection/events/epochs", (eventType) => {
    for (const stage of ["beforeProjection", "afterProjection", "afterEvent"] as const) {
      const { ref, repository } = fixture(), command = issueCommand(ref);
      const a = eventType === "PHASE_CHANGED" ? repository.issue(command).attempt : advance(repository, command, eventType === "OWNER_FENCED" ? "UNCERTAIN" : "RUNNING");
      repository.close();
      const newOwner = { hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash(randomUUID()) };
      const operation = eventType === "PHASE_CHANGED" ? (r: DurableAttemptRepository) => r.transition(transitionCommand(a, command.ownerNonce, "APPROVAL_PENDING")) :
        eventType === "TERMINAL_COMMITTED" ? (r: DurableAttemptRepository) => r.commitTerminal(terminalCommand(a, command.ownerNonce)) :
          (r: DurableAttemptRepository) => r.fenceForTestRecovery({ expected: expected(a, command.ownerNonce), newOwner,
            eventId: randomUUID(), atMs: a.updatedAtMs + 1, testRecoveryGrantId: randomUUID(), authorization: "s12-test-only" });
      const faulty = own(DurableAttemptRepository.openForTest(ref, { stage, eventType })); failure(() => operation(faulty), "FAULT"); faulty.close();
      const reopened = own(DurableAttemptRepository.openForTest(ref)); expect(reopened.read(identity(a))).toEqual(a);
      expect(counts(ref)).toEqual({ attempts: 1, events: a.stateVersion, epochs: 1 });
      operation(reopened); expect(counts(ref).events).toBe(a.stateVersion + 1);
      evidence(`rollback-${eventType}-${stage}`, { ref, stage, unchangedVersion: a.stateVersion, final: counts(ref) });
    }
  });
  it("preserves existing issuance while a controlled conflict handler fails", () => {
    const { ref, repository } = fixture(), command = issueCommand(ref), a = repository.issue(command).attempt; repository.close();
    const faulty = own(DurableAttemptRepository.openForTest(ref, { stage: "conflict", eventType: "ATTEMPT_ISSUED" }));
    failure(() => faulty.issue({ ...command, actionDigest: hash("different") }), "FAULT"); faulty.close();
    const reopened = own(DurableAttemptRepository.openForTest(ref)); expect(reopened.read(identity(a))).toEqual(a);
    expect(reopened.issue(command).replay).toBe(true);
  });
});
