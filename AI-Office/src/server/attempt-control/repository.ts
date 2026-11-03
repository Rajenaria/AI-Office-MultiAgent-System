import type { DatabaseSync } from "node:sqlite";
import { AttemptSchema, ExpectedSchema, FenceSchema, IdentitySchema, IssueSchema, TerminalSchema, TransitionSchema,
  assertOne, databaseError, hash, issuanceDigest, nextInteger, parse, requireAuthority,
  type Attempt, type Expected, type Terminal } from "./contracts.js";
import { appendEvent, verifyHistory, type EventType } from "./journal.js";
import { ATTEMPT_KEYS } from "./schema.js";
import { assertIdentity, isTerminal, validateTransition } from "./state-machine.js";
import { openTestConnection, type TestDatabaseRef } from "./test-storage.js";
import { assertExpected } from "./state-machine.js";
import { ConcernSchema, HeartbeatSchema, assertLeaseActive, classifyLease, heartbeatDigest, initialLease, readLease, renewedLease } from "./lease.js";
import { AckCommandSchema, CancellationRequestSchema, CancellationSchema, ExitCommandSchema, assertCancellationTerminal,
  assertHostAuthority, cancellationDigest, mintHostAuthorityForTest, readCancellation, type HostAuthority } from "./cancellation.js";
import { ReconcileSchema, assertRecoveryAuthority, classifyRecovery, createRecoveryAuthorityForTest, readRecovery,
  recoveryDigest, type RecoveryAuthority } from "./recovery.js";

export type FaultStage = "beforeProjection" | "afterProjection" | "afterEvent" | "conflict";
// Enum fault injection only: no callback or arbitrary code can execute inside the transaction.
export type TestFault = { stage: FaultStage; eventType: EventType };
export class DurableAttemptRepository {
  private closed = false;
  private constructor(private readonly connection: ReturnType<typeof openTestConnection>, private readonly fault?: TestFault) {}
  static openForTest(ref: TestDatabaseRef, fault?: TestFault): DurableAttemptRepository {
    const connection = openTestConnection(ref), repository = new DurableAttemptRepository(connection, fault);
    try {
      repository.readTransaction(() => {
        for (const row of connection.db.prepare("SELECT * FROM runtime_attempts").all()) verifyHistory(connection.db, parse(AttemptSchema, row));
      });
      return repository;
    } catch (error) { repository.close(); throw error; }
  }
  get settings() { return this.connection.settings; }
  close(): void { if (!this.closed) { this.closed = true; this.connection.close(); } }
  private transaction<T>(write: boolean, operation: (db: DatabaseSync) => T): T {
    requireAuthority(!this.closed, "DATABASE_FAILURE");
    const db = this.connection.db;
    try {
      // One bounded acquisition, no automatic command-body/worker retries.
      db.exec(write ? "BEGIN IMMEDIATE" : "BEGIN");
      const meta = db.prepare("SELECT * FROM runtime_control_meta").get();
      requireAuthority(meta?.projectId === this.connection.ref.projectId &&
        meta?.authorityIncarnation === this.connection.ref.authorityIncarnation, "IDENTITY_CONFLICT");
      const result = operation(db);
      db.exec("COMMIT");
      return result;
    } catch (error) {
      try { if (db.isTransaction) db.exec("ROLLBACK"); }
      catch (rollbackError) { this.close(); throw new AggregateError([databaseError(error), rollbackError], "ROLLBACK_FAILED"); }
      throw databaseError(error);
    }
  }
  private readTransaction<T>(operation: () => T): T { return this.transaction(false, operation); }
  private inject(stage: FaultStage, eventType: EventType): void {
    if (this.fault?.stage === stage && this.fault.eventType === eventType) requireAuthority(false, "FAULT");
  }
  private binding(identity: { projectId: string; authorityIncarnation: string }): void {
    requireAuthority(identity.projectId === this.connection.ref.projectId &&
      identity.authorityIncarnation === this.connection.ref.authorityIncarnation, "IDENTITY_CONFLICT");
  }
  private current(db: DatabaseSync, identity: unknown): Attempt {
    const parsed = parse(IdentitySchema, identity); this.binding(parsed);
    const row = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?").get(parsed.projectId, parsed.attemptId);
    requireAuthority(row, "CONFLICT");
    const current = parse(AttemptSchema, row); assertIdentity(current, parsed); verifyHistory(db, current); return current;
  }
  read(identity: unknown): Attempt {
    const parsed = parse(IdentitySchema, identity);
    return this.readTransaction(() => this.current(this.connection.db, parsed));
  }
  history(identity: unknown) {
    const parsed = parse(IdentitySchema, identity);
    return this.readTransaction(() => verifyHistory(this.connection.db, this.current(this.connection.db, parsed)));
  }
  private epoch(db: DatabaseSync, attempt: Attempt): void {
    db.prepare("INSERT INTO runtime_owner_epochs VALUES(?,?,?,?,?,?,?,?)").run(attempt.projectId, attempt.attemptId,
      attempt.attemptGeneration, attempt.hostInstanceId, attempt.ownerId, attempt.ownerNonceHash, attempt.ownerMode, attempt.updatedAtMs);
  }
  issue(input: unknown): { attempt: Attempt; replay: boolean } {
    const command = parse(IssueSchema, input); this.binding(command);
    const issueDigest = issuanceDigest({ ...command, ownerNonceHash: hash(command.ownerNonce) });
    return this.transaction(true, (db) => {
      const prior = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND taskId=? AND issueRequestId=?")
        .get(command.projectId, command.taskId, command.issueRequestId);
      if (prior) {
        const attempt = parse(AttemptSchema, prior); verifyHistory(db, attempt);
        if (attempt.issueDigest !== issueDigest) { this.inject("conflict", "ATTEMPT_ISSUED"); requireAuthority(false, "CONFLICT"); }
        return { attempt, replay: true };
      }
      requireAuthority(!db.prepare("SELECT 1 FROM runtime_attempts WHERE projectId=? AND conflictHeld=1").get(command.projectId), "CONFLICT");
      const { ownerNonce: _nonce, eventId: _event, leaseClock, ...fields } = command;
      const attempt = parse(AttemptSchema, { ...fields, issueDigest, ownerNonceHash: hash(command.ownerNonce),
        updatedAtMs: command.createdAtMs, attemptGeneration: 1, stateVersion: 1, phase: "CREATED",
        ownerMode: "EXECUTION", conflictHeld: 1, terminalReceiptId: null, terminalDigest: null, terminalPayload: null,
        leasePayload: leaseClock ? initialLease(leaseClock, command.hostInstanceId, command.createdAtMs) : null });
      this.inject("beforeProjection", "ATTEMPT_ISSUED");
      db.prepare(`INSERT INTO runtime_attempts(${ATTEMPT_KEYS.join(",")}) VALUES(${ATTEMPT_KEYS.map(() => "?").join(",")})`)
        .run(...ATTEMPT_KEYS.map((key) => attempt[key]));
      this.epoch(db, attempt); this.inject("afterProjection", "ATTEMPT_ISSUED");
      appendEvent(db, attempt, command.eventId, "ATTEMPT_ISSUED", command.issueRequestId, command.issueRequestId);
      this.inject("afterEvent", "ATTEMPT_ISSUED"); verifyHistory(db, attempt);
      return { attempt, replay: false };
    });
  }
  private update(db: DatabaseSync, current: Attempt, next: Attempt, expected: Expected, eventId: string,
    eventType: EventType, key: string, decisionId: string | null): Attempt {
    this.inject("beforeProjection", eventType);
    const result = db.prepare(`UPDATE runtime_attempts SET attemptGeneration=?,stateVersion=?,phase=?,hostInstanceId=?,
      ownerId=?,ownerNonceHash=?,ownerMode=?,updatedAtMs=?,terminalReceiptId=?,terminalDigest=?,terminalPayload=?,leasePayload=?,cancellationPayload=?,recoveryPayload=?
      WHERE projectId=? AND authorityIncarnation=? AND taskId=? AND attemptId=? AND attemptGeneration=?
        AND stateVersion=? AND phase=? AND hostInstanceId=? AND ownerId=? AND ownerNonceHash=?`)
      .run(next.attemptGeneration, next.stateVersion, next.phase, next.hostInstanceId, next.ownerId, next.ownerNonceHash,
        next.ownerMode, next.updatedAtMs, next.terminalReceiptId, next.terminalDigest, next.terminalPayload, next.leasePayload, next.cancellationPayload, next.recoveryPayload,
        expected.projectId, expected.authorityIncarnation, expected.taskId, expected.attemptId, expected.attemptGeneration,
        expected.stateVersion, expected.phase, expected.hostInstanceId, expected.ownerId,
        eventType === "RECOVERY_CLASSIFIED" ? current.ownerNonceHash : hash(expected.ownerNonce));
    if (Number(result.changes) === 0) this.inject("conflict", eventType);
    assertOne(result.changes);
    if (next.attemptGeneration !== current.attemptGeneration) this.epoch(db, next);
    this.inject("afterProjection", eventType);
    appendEvent(db, next, eventId, eventType, key, decisionId); this.inject("afterEvent", eventType);
    verifyHistory(db, next); return next;
  }
  transition(input: unknown): Attempt {
    const command = parse(TransitionSchema, input);
    requireAuthority(!isTerminal(command.target), "INVALID_TRANSITION");
    return this.transaction(true, (db) => {
      const current = this.current(db, parse(IdentitySchema, this.identity(command.expected)));
      validateTransition(current, command.target, command.expected, command);
      requireAuthority(current.recoveryPayload === null, "RECOVERY_REQUIRED");
      assertLeaseActive(current, command.clock, command.atMs);
      if (current.leasePayload !== null) requireAuthority(current.cancellationPayload === null && command.target !== "CANCELLATION_REQUESTED", "CANCELLATION_INVALID");
      const next = parse(AttemptSchema, { ...current, phase: command.target,
        stateVersion: nextInteger(current.stateVersion), updatedAtMs: command.atMs });
      requireAuthority(next.updatedAtMs >= current.updatedAtMs, "VALIDATION");
      return this.update(db, current, next, command.expected, command.eventId, "PHASE_CHANGED", command.eventId, null);
    });
  }
  fenceForTestRecovery(input: unknown): Attempt {
    const command = parse(FenceSchema, input);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected));
      validateTransition(current, "RECONCILIATION_REQUIRED", command.expected, { ...command, fencing: true });
      requireAuthority(current.recoveryPayload === null, "RECOVERY_REQUIRED");
      requireAuthority(current.leasePayload === null, "LEASE_INVALID");
      requireAuthority(command.newOwner.ownerNonce !== command.expected.ownerNonce, "VALIDATION");
      const next = parse(AttemptSchema, { ...current, phase: "RECONCILIATION_REQUIRED", ownerMode: "RECOVERY",
        hostInstanceId: command.newOwner.hostInstanceId, ownerId: command.newOwner.ownerId, ownerNonceHash: hash(command.newOwner.ownerNonce),
        attemptGeneration: nextInteger(current.attemptGeneration), stateVersion: nextInteger(current.stateVersion), updatedAtMs: command.atMs });
      requireAuthority(next.updatedAtMs >= current.updatedAtMs, "VALIDATION");
      return this.update(db, current, next, command.expected, command.eventId, "OWNER_FENCED", command.eventId, command.testRecoveryGrantId);
    });
  }
  commitTerminal(input: unknown, authority?: HostAuthority): { attempt: Attempt; replay: boolean } {
    const command = parse(TerminalSchema, input); requireAuthority(isTerminal(command.target), "INVALID_TRANSITION");
    const payload = this.receiptPayload(command), digest = hash(payload);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected));
      if (current.cancellationPayload !== null) assertHostAuthority(current, command.expected, authority);
      if (isTerminal(current.phase)) {
        requireAuthority(current.terminalReceiptId === command.receipt.receiptId && current.terminalDigest === digest &&
          current.terminalPayload === payload, "TERMINAL_CONFLICT");
        return { attempt: current, replay: true };
      }
      validateTransition(current, command.target, command.expected, command);
      assertLeaseActive(current, command.clock, command.atMs);
      assertCancellationTerminal(current, command.target, command.receipt, command.expected, authority);
      requireAuthority(current.recoveryPayload === null, "RECOVERY_REQUIRED");
      const allowed = command.target === "COMPLETED" ? ["NORMAL"] : command.target === "APPROVAL_DENIED" ? ["DENIED"] :
        current.ownerMode === "RECOVERY" ? ["CONTROLLER_RECONCILED"] : command.target === "INTERRUPTED" ? ["CANCELLED", "TIMED_OUT"] :
        current.phase === "LAUNCHING" ? ["START_FAILED"] : ["UNEXPECTED"];
      requireAuthority(allowed.includes(command.receipt.reason), "VALIDATION");
      const next = parse(AttemptSchema, { ...current, phase: command.target, stateVersion: nextInteger(current.stateVersion),
        updatedAtMs: command.atMs, terminalReceiptId: command.receipt.receiptId, terminalDigest: digest, terminalPayload: payload });
      requireAuthority(next.updatedAtMs >= current.updatedAtMs, "VALIDATION");
      return { attempt: this.update(db, current, next, command.expected, command.eventId, "TERMINAL_COMMITTED",
        command.receipt.receiptId, command.receipt.receiptId), replay: false };
    });
  }
  private identity(expected: Pick<Expected, "projectId" | "authorityIncarnation" | "taskId" | "attemptId">) {
    return { projectId: expected.projectId, authorityIncarnation: expected.authorityIncarnation,
      taskId: expected.taskId, attemptId: expected.attemptId };
  }
  openRecoveryForTest(inspector: unknown): RecoveryAuthority {
    requireAuthority(!this.closed, "DATABASE_FAILURE");
    return createRecoveryAuthorityForTest(this.connection.ref.projectId, this.connection.ref.authorityIncarnation, inspector);
  }
  recoveryInventory() {
    return this.readTransaction(() => {
      const db = this.connection.db;
      return { dispatch: "CLOSED" as const, attempts: db.prepare("SELECT * FROM runtime_attempts ORDER BY attemptId").all().map((row) => {
        const a = parse(AttemptSchema, row); verifyHistory(db, a);
        return { identity: this.identity(a), phase: a.phase, stateVersion: a.stateVersion,
          attemptGeneration: a.attemptGeneration, terminal: isTerminal(a.phase), conflictHeld: a.conflictHeld,
          pendingCancellation: a.cancellationPayload !== null && !isTerminal(a.phase) };
      }) };
    });
  }
  reconcile(input: unknown, authority: RecoveryAuthority) {
    const command = parse(ReconcileSchema, input), digest = recoveryDigest(command);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected));
      assertRecoveryAuthority(current, command, authority);
      const prior = readRecovery(current);
      if (prior?.reconciliationId === command.reconciliationId) {
        requireAuthority(prior.requestDigest === digest, "CONFLICT"); return { attempt: current, recovery: prior, replay: true };
      }
      requireAuthority(current.stateVersion === command.expected.stateVersion && current.phase === command.expected.phase, "CONFLICT");
      const recovery = classifyRecovery(current, command);
      if (isTerminal(current.phase)) return { attempt: current, recovery, replay: true };
      const phase = current.phase === "RECONCILIATION_REQUIRED" ? current.phase : "UNCERTAIN";
      const next = parse(AttemptSchema, { ...current, phase, stateVersion: nextInteger(current.stateVersion),
        updatedAtMs: Math.max(current.updatedAtMs, command.clock.wallMs), recoveryPayload: JSON.stringify(recovery) });
      // Inspector capability authorizes quarantine only. Preserve the actual current
      // owner hash in the SQL predicate; never claim possession of a lost owner nonce.
      return { attempt: this.update(db, current, next, { ...current, ownerNonce: "" }, command.reconciliationId,
        "RECOVERY_CLASSIFIED", command.reconciliationId, command.decisionId), recovery, replay: false };
    });
  }
  authorizeHostForTest(expectedInput: unknown, clock: unknown): HostAuthority {
    const expected = parse(ExpectedSchema, expectedInput);
    return this.readTransaction(() => mintHostAuthorityForTest(this.current(this.connection.db, this.identity(expected)), expected, clock));
  }
  requestCancellation(input: unknown, authority: HostAuthority): { attempt: Attempt; replay: boolean } {
    const command = parse(CancellationRequestSchema, input), digest = cancellationDigest(command);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected)); assertHostAuthority(current, command.expected, authority);
      const prior = readCancellation(current);
      if (prior) { requireAuthority(prior.requestId === command.requestId && prior.requestDigest === digest, "CONFLICT"); return { attempt: current, replay: true }; }
      assertExpected(current, command.expected); assertLeaseActive(current, command.clock, command.clock.wallMs);
      requireAuthority(!isTerminal(current.phase) && !["UNCERTAIN", "RECONCILIATION_REQUIRED", "CANCELLATION_REQUESTED"].includes(current.phase), "INVALID_TRANSITION");
      const noLaunch = ["CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED"].includes(current.phase);
      const cancellation = parse(CancellationSchema, { requestId: command.requestId, decisionId: command.decisionId,
        intentGeneration: current.attemptGeneration, reason: command.reason, requestDigest: digest,
        requestedAtMs: command.clock.wallMs, noLaunch, ack: null, exit: null });
      const next = parse(AttemptSchema, { ...current, phase: noLaunch ? current.phase : "CANCELLATION_REQUESTED",
        stateVersion: nextInteger(current.stateVersion), updatedAtMs: command.clock.wallMs, cancellationPayload: JSON.stringify(cancellation) });
      return { attempt: this.update(db, current, next, command.expected, command.eventId, "CANCEL_INTENT", command.requestId, command.decisionId), replay: false };
    });
  }
  recordCancellationAck(input: unknown, authority: HostAuthority) { return this.cancellationObservation(input, authority, "ack"); }
  recordCancellationExit(input: unknown, authority: HostAuthority) { return this.cancellationObservation(input, authority, "exit"); }
  private cancellationObservation(input: unknown, authority: HostAuthority, kind: "ack" | "exit"): { attempt: Attempt; replay: boolean } {
    const command = kind === "ack" ? parse(AckCommandSchema, input) : parse(ExitCommandSchema, input);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected)); assertHostAuthority(current, command.expected, authority);
      const cancel = readCancellation(current); requireAuthority(cancel && !cancel.noLaunch, "CANCELLATION_INVALID");
      const receipt = command.receipt;
      requireAuthority(receipt.requestId === cancel.requestId && receipt.attemptGeneration === current.attemptGeneration &&
        receipt.hostInstanceId === current.hostInstanceId, "CANCELLATION_INVALID");
      if (cancel[kind]) { requireAuthority(JSON.stringify(cancel[kind]) === JSON.stringify(receipt), "CONFLICT"); return { attempt: current, replay: true }; }
      assertExpected(current, command.expected); assertLeaseActive(current, command.clock, command.clock.wallMs);
      requireAuthority(current.phase === "CANCELLATION_REQUESTED", "INVALID_TRANSITION");
      const other = kind === "ack" ? cancel.exit : cancel.ack;
      requireAuthority(!other || other.invocationNonce === receipt.invocationNonce, "CANCELLATION_INVALID");
      if ("scopeDigest" in receipt) requireAuthority(receipt.scopeDigest === current.scopeDigest, "CANCELLATION_INVALID");
      const next = parse(AttemptSchema, { ...current, stateVersion: nextInteger(current.stateVersion), updatedAtMs: command.clock.wallMs,
        cancellationPayload: JSON.stringify({ ...cancel, [kind]: receipt }) });
      const key = "ackId" in receipt ? receipt.ackId : receipt.exitId;
      return { attempt: this.update(db, current, next, command.expected, command.eventId, kind === "ack" ? "CANCEL_ACK" : "CANCEL_EXIT", key, key), replay: false };
    });
  }
  renewLease(input: unknown): { attempt: Attempt; replay: boolean } {
    const command = parse(HeartbeatSchema, input);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected)), lease = readLease(current);
      requireAuthority(lease && !isTerminal(current.phase), "LEASE_INVALID");
      const digestCurrent = heartbeatDigest({ ...current, stateVersion: command.expected.stateVersion,
        phase: command.expected.phase }, command.clock, command.heartbeatId, command.previousSequence);
      // Replays still require current owner possession; only the old version check is read-only idempotency.
      assertExpected(current, { ...command.expected, stateVersion: current.stateVersion, phase: current.phase });
      if (lease.lastHeartbeatId === command.heartbeatId) {
        requireAuthority(lease.lastHeartbeatDigest === digestCurrent, "CONFLICT"); return { attempt: current, replay: true };
      }
      assertExpected(current, command.expected);
      requireAuthority(lease.heartbeatSequence === command.previousSequence, "CONFLICT");
      const next = parse(AttemptSchema, { ...current, stateVersion: nextInteger(current.stateVersion), updatedAtMs: command.clock.wallMs,
        leasePayload: renewedLease(current, command.clock, command.heartbeatId, digestCurrent) });
      return { attempt: this.update(db, current, next, command.expected, command.heartbeatId, "LEASE_RENEWED", command.heartbeatId, null), replay: false };
    });
  }
  recordLeaseConcern(input: unknown): Attempt {
    const command = parse(ConcernSchema, input);
    return this.transaction(true, (db) => {
      const current = this.current(db, this.identity(command.expected)); assertExpected(current, command.expected);
      const concern = classifyLease(current, command.clock), lease = readLease(current);
      requireAuthority(lease && ["EXPIRED", "CLOCK_UNTRUSTED", "PREVIOUS_HOST"].includes(concern), "LEASE_INVALID");
      const next = parse(AttemptSchema, { ...current, phase: "UNCERTAIN", stateVersion: nextInteger(current.stateVersion),
        updatedAtMs: Math.max(current.updatedAtMs, command.clock.wallMs), leasePayload: JSON.stringify({ ...lease, status: "QUARANTINED", concern }) });
      return this.update(db, current, next, command.expected, command.eventId, "LEASE_QUARANTINED", command.eventId, null);
    });
  }
  private receiptPayload(command: Terminal): string {
    const expected = parse(ExpectedSchema, command.expected);
    // Event ID and transport timestamp do not change an already accepted receipt.
    return JSON.stringify({ version: 1, identity: this.identity(expected), generation: expected.attemptGeneration,
      expectedVersion: expected.stateVersion, predecessor: expected.phase, hostInstanceId: expected.hostInstanceId,
      ownerId: expected.ownerId, ownerNonceHash: hash(expected.ownerNonce), target: command.target, receipt: command.receipt });
  }
}
