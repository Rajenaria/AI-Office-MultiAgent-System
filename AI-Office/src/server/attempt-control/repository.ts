import type { DatabaseSync } from "node:sqlite";
import { HeldOutputRevalidationSchema, inspectHeldOutputSnapshot, revalidationDenied,
  type HeldOutputRevalidationResult } from "./output-revalidation.js";
import { randomUUID } from "node:crypto";
import { HeldOutputCommandSchema, OutputLookupSchema, BindingSchema, AcceptedSchema, OperationSchema, StreamSchema,
  OUTPUT_LIMITS, OutputFailure, outputRequire, outputDenied, heldReceipt, inertOutputInput, logicalFields,
  bindingDigest, metadataDigest, outputRequestDigest, projectionDigest, outputEventDigest,
  type HeldOutputCommand, type HeldOutputResult, type HeldAccepted, type HeldOutbox, type OutputStream,
  type OutputFaultStage, type TransactionObservation } from "./output-metadata.js";
import { insertOutputRow, appendOutputEvent, verifyOutputHistory, outputRow, readOutputBinding } from "./output-journal.js";
import { AttemptSchema, ExpectedSchema, FenceSchema, IdentitySchema, IssueSchema, TerminalSchema, TransitionSchema,
  assertOne, databaseError, hash, issuanceDigest, nextInteger, parse, requireAuthority,
  AuthorityFailure, type Attempt, type Expected, type Terminal } from "./contracts.js";
import { appendEvent, verifyHistory, type EventType } from "./journal.js";
import { ATTEMPT_KEYS } from "./schema.js";
import { assertIdentity, isTerminal, validateTransition } from "./state-machine.js";
import type { TestDatabaseRef } from "./test-storage.js";
import { verifySchema } from "./sqlite-format.js";
import { claimHostSQLiteConnection } from "./host-sqlite.js";
import { claimOwnedFixtureConnection, openOwnedFixtureConnection, type RepositoryConnection } from "./connection.js";
import { ReadinessRequestSchema, denyReadiness, evaluatePersistedReadiness,
  type ExecutionReadiness, type ReadinessRequest, type ReadinessReason } from "./execution-readiness.js";
import { ProvenanceRequestSchema, evaluateProvenanceRows, provenanceDecision,
  GrantProvenanceSchema, PolicyProvenanceSchema, type ProvenanceDecision, type ProvenanceRequest } from "./provenance.js";
import { ApplicationSessionBindingSchema, ExecutionSessionSchema, SessionReadinessRequestSchema,
  compareHostSnapshot, createHostIssuerForTest, evaluateSessionBinding, sessionDecision, FIXTURE_HOST_CONTEXT_LIFETIME_MS,
  type FixtureHostContext, type HostBindingSnapshot, type SessionDecision, type SessionReadinessRequest,
  type SessionReason } from "./host-session.js";
import { assertExpected } from "./state-machine.js";
import { ConcernSchema, HeartbeatSchema, assertLeaseActive, classifyLease, heartbeatDigest, initialLease, readLease, renewedLease } from "./lease.js";
import { AckCommandSchema, CancellationRequestSchema, CancellationSchema, ExitCommandSchema, assertCancellationTerminal,
  assertHostAuthority, cancellationDigest, mintHostAuthorityForTest, readCancellation, type HostAuthority } from "./cancellation.js";
import { ReconcileSchema, assertRecoveryAuthority, classifyRecovery, createRecoveryAuthorityForTest, readRecovery,
  recoveryDigest, type RecoveryAuthority } from "./recovery.js";
import { ActivateSecurityStopSchema, SecurityStopEventSchema, activationDigest, securityStopEventDigest,
  securityStopReceipt, verifySecurityStopJournal, type ActivateSecurityStop, type SecurityStopFault } from "./security-stop.js";
import { ExecutionSecuritySchema } from "./execution-readiness.js";

export type FaultStage = "beforeProjection" | "afterProjection" | "afterEvent" | "conflict";
// Enum fault injection only: no callback or arbitrary code can execute inside the transaction.
export type TestFault = { stage: FaultStage; eventType: EventType } |
  { stage: SecurityStopFault; eventType: "SECURITY_STOP_ACTIVATED" } |
  { stage: OutputFaultStage; eventType: "OUTPUT_HELD_RECORDED" };
const outputFixtureOwners = new WeakSet<object>();
export class DurableAttemptRepository {
  readonly #hostIssuer = createHostIssuerForTest();
  private closed = false;
  private closing = false;
  private constructor(private readonly connection: RepositoryConnection, private readonly fault?: TestFault) {}
  static openForTest(ref: TestDatabaseRef, fault?: TestFault): DurableAttemptRepository {
    return DurableAttemptRepository.openHostOwnedForFixtures(openOwnedFixtureConnection(ref), fault);
  }
  static openHostOwnedForFixtures(token: unknown, fault?: TestFault): DurableAttemptRepository {
    const repository = this.fromConnection(claimOwnedFixtureConnection(token), fault);
    outputFixtureOwners.add(repository); return repository;
  }
  // Internal storage ownership transfer; no authenticated execution authority is created.
  static openHostOwnedSQLite(token: unknown): DurableAttemptRepository {
    return this.fromConnection(claimHostSQLiteConnection(token));
  }
  private static fromConnection(connection: RepositoryConnection, fault?: TestFault): DurableAttemptRepository {
    const repository = new DurableAttemptRepository(connection, fault);
    try {
      repository.readTransaction(() => {
        repository.verifyControl(connection.db);
        for (const row of connection.db.prepare("SELECT * FROM runtime_attempts").all()) verifyHistory(connection.db, parse(AttemptSchema, row));
      });
      return repository;
    } catch (error) { repository.close(); throw error; }
  }

  private outputFault(stage: OutputFaultStage): void {
    if (this.fault?.eventType === "OUTPUT_HELD_RECORDED" && this.fault.stage === stage) throw new AuthorityFailure("FAULT");
  }
  private outputOwner(expected: Expected): Attempt {
    const current=this.current(this.connection.db,this.identity(expected)); assertIdentity(current,expected);
    requireAuthority(current.attemptGeneration===expected.attemptGeneration && current.hostInstanceId===expected.hostInstanceId &&
      current.ownerId===expected.ownerId && current.ownerNonceHash===hash(expected.ownerNonce),"STALE_OWNER");
    return current;
  }
  private outputError(error: unknown, observation?: TransactionObservation): HeldOutputResult {
    if (observation && observation.commitAttempted && !observation.rolledBack ||
        error instanceof AggregateError && observation && !observation.rolledBack) {
      try { this.close(); } catch { this.closing=true; }
      return outputDenied("COMMIT_OUTCOME_UNKNOWN",true);
    }
    return outputDenied(error instanceof OutputFailure ? error.code : error instanceof AuthorityFailure ? error.code : "DATABASE_FAILURE");
  }
  // Fixture metadata only. No host facade exposes this method and no delivery API exists.
  recordHeldOutputForTest(input: unknown): HeldOutputResult {
    if (!outputFixtureOwners.has(this)) return outputDenied("OUTPUT_FIXTURE_REQUIRED");
    let q: HeldOutputCommand;
    try { q=HeldOutputCommandSchema.parse(inertOutputInput(input)); } catch { return outputDenied("OUTPUT_INVALID_REQUEST"); }
    const observation: TransactionObservation={commitAttempted:false,committed:false,rolledBack:false};
    try {
      return this.transaction(true,db=>{
        this.verifyControl(db);
        const current=this.outputOwner(q.expected);
        const prior=db.prepare("SELECT * FROM runtime_output_operations WHERE operationId=?").get(q.operationId);
        if(prior){
          const op=outputRow(OperationSchema,prior);
          const a=outputRow(AcceptedSchema,db.prepare("SELECT * FROM runtime_accepted_outputs WHERE outputId=?").get(op.outputId));
          const s=outputRow(StreamSchema,db.prepare("SELECT * FROM runtime_output_streams WHERE streamId=?").get(op.streamId));
          const b=readOutputBinding(a.bindingSnapshot);
          outputRequire(s.projectId===q.expected.projectId && s.authorityIncarnation===q.expected.authorityIncarnation &&
            s.attemptId===q.expected.attemptId && s.attemptGeneration===q.expected.attemptGeneration &&
            s.executionSessionId===q.executionSessionId && s.destinationId===q.destinationId && s.channel===q.channel,"OUTPUT_SCOPE_DENIED");
          outputRequire(op.idempotencyKey===q.idempotencyKey && op.outputId===q.outputId &&
            op.requestDigest===outputRequestDigest(s,logicalFields(q),b,q.claim?.claimKey??null) &&
            (!q.claim || q.claim.grantId===a.grantId && q.claim.authorizationRevision===a.authorizationRevision),"OUTPUT_CONFLICT");
          return heldReceipt(a,s,true);
        }
        assertExpected(current,q.expected);
        const security=parse(ExecutionSecuritySchema,db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(q.expected.projectId));
        outputRequire(security.securityRevision===q.expectedSecurityRevision && security.securityState==="UNKNOWN" &&
          security.stopJournalHead===null,"OUTPUT_SECURITY_DENIED");
        outputRequire(current.cancellationPayload===null && current.recoveryPayload===null && current.leasePayload===null &&
          current.ownerMode==="EXECUTION" && ["APPROVAL_GRANTED","RUNNING"].includes(current.phase),"OUTPUT_CANCELLED");
        outputRequire(q.atMs>=current.updatedAtMs && q.producerId===current.ownerId,"OUTPUT_SCOPE_DENIED");
        const policy=parse(PolicyProvenanceSchema,db.prepare("SELECT * FROM runtime_policy_provenance WHERE policyId=?").get(q.policyId));
        const snap=this.sessionSnapshot(db,{expected:q.expected,securityRevision:q.expectedSecurityRevision,
          executionSessionId:q.executionSessionId,sessionRevision:q.expectedBindingRevision,
          workspaceBindingId:current.bindingId,workspaceGeneration:current.bindingGeneration,
          action:policy.action,destinationId:q.destinationId,atMs:q.atMs},undefined,false);
        // Only local association consistency is used, never eligible/authentication/readiness authority.
        // Durable fixture metadata does not acquire a per-instance runtime issuer handle.
        // Reopening/another owned fixture connection may have a new ephemeral issuer ID.
        // Keep every persisted binding/source/scope check; runtime PI04 decisions stay unchanged.
        const ephemeralIssuer = new Set<string>(["HOST_ISSUER_MISMATCH","HOST_ISSUER_GENERATION_MISMATCH","HOST_CONTEXT_REVISION_MISMATCH"]);
        outputRequire(snap.binding && snap.decision.sessionReasons.every(r=>ephemeralIssuer.has(r)) &&
          snap.decision.provenanceReasons.length===0,"OUTPUT_SCOPE_DENIED");
        const b=BindingSchema.parse({...snap.binding,producerId:q.producerId,channel:q.channel});
        outputRequire(b.principalRevision===q.expectedPrincipalRevision && b.applicationGeneration===q.expectedApplicationGeneration &&
          b.applicationRevision===q.expectedApplicationRevision && b.bindingRevision===q.expectedBindingRevision &&
          b.policyId===q.policyId && b.policyVersion===q.policyVersion && b.policyRevision===q.policyRevision &&
          b.grantId===q.grantId && b.authorizationRevision===q.authorizationRevision &&
          b.provenanceSourceRevision===q.provenanceSourceRevision && b.expiresAtMs>q.atMs,"OUTPUT_SCOPE_DENIED");
        outputRequire(!q.claim || q.claim.grantId===b.grantId && q.claim.authorizationRevision===b.authorizationRevision,"OUTPUT_SCOPE_DENIED");
        let raw=db.prepare("SELECT * FROM runtime_output_streams WHERE projectId=? AND authorityIncarnation=? AND attemptId=? AND attemptGeneration=? AND executionSessionId=? AND destinationId=? AND channel=?")
          .get(q.expected.projectId,q.expected.authorityIncarnation,q.expected.attemptId,q.expected.attemptGeneration,q.executionSessionId,q.destinationId,q.channel);
        if(!raw){
          outputRequire(q.expectedStream.streamId===null && q.expectedStream.revision===0 && q.expectedStream.lastAccepted===0,"OUTPUT_CONFLICT");
          outputRequire(Number(db.prepare("SELECT count(*) AS n FROM runtime_output_streams").get()?.n)<OUTPUT_LIMITS.streams,"OUTPUT_LIMIT");
          const stream: OutputStream={streamId:randomUUID(),projectId:q.expected.projectId,authorityIncarnation:q.expected.authorityIncarnation,
            attemptId:q.expected.attemptId,attemptGeneration:q.expected.attemptGeneration,executionSessionId:q.executionSessionId,
            destinationId:q.destinationId,channel:q.channel,lastAccepted:0,revision:0,createdAtMs:q.atMs};
          insertOutputRow(db,"runtime_output_streams",stream); raw=stream;
        } else outputRequire(raw.streamId===q.expectedStream.streamId,"OUTPUT_CONFLICT");
        const s=outputRow(StreamSchema,raw);
        outputRequire(q.expectedStream.revision===s.revision && q.expectedStream.lastAccepted===s.lastAccepted &&
          q.sequence===s.lastAccepted+1,"OUTPUT_CONFLICT");
        outputRequire(q.sequence<=OUTPUT_LIMITS.outputsPerStream,"OUTPUT_LIMIT");
        outputRequire(!db.prepare("SELECT operationId FROM runtime_output_operations WHERE streamId=? AND idempotencyKey=?").get(s.streamId,q.idempotencyKey) &&
          !db.prepare("SELECT outputId FROM runtime_accepted_outputs WHERE outputId=? OR (streamId=? AND producerId=? AND producerEventId=?)")
            .get(q.outputId,s.streamId,q.producerId,q.producerEventId),"OUTPUT_CONFLICT");
        const digest=outputRequestDigest(s,logicalFields(q),b,q.claim?.claimKey??null);
        assertOne(db.prepare("UPDATE runtime_output_streams SET lastAccepted=?,revision=? WHERE streamId=? AND lastAccepted=? AND revision=?")
          .run(q.sequence,s.revision+1,s.streamId,s.lastAccepted,s.revision).changes);
        this.outputFault("afterSequence");
        insertOutputRow(db,"runtime_output_operations",{operationId:q.operationId,streamId:s.streamId,idempotencyKey:q.idempotencyKey,
          requestDigest:digest,outputId:q.outputId,claimKey:q.claim?.claimKey??null,createdAtMs:q.atMs});
        this.outputFault("afterOperation");
        if(q.claim) insertOutputRow(db,"runtime_output_grant_claims",{...q.claim,operationId:q.operationId,claimedAtMs:q.atMs});
        this.outputFault("afterClaim");
        const a: HeldAccepted={...logicalFields(q),operationId:q.operationId,outboxId:randomUUID(),streamId:s.streamId,recordVersion:1,
          recordClass:"OFFLINE_CONTRACT_ONLY",classificationSource:q.confidentiality==="UNVERIFIED"?"UNVERIFIED":"OFFLINE_SUPPLIED",
          classificationDigest:null,bindingSnapshot:JSON.stringify(b),bindingDigest:bindingDigest(b),payloadReference:null,
          payloadDigest:metadataDigest(digest),payloadByteLength:0,attemptStateVersion:current.stateVersion,
          securityRevision:security.securityRevision,createdAtMs:q.atMs};
        insertOutputRow(db,"runtime_accepted_outputs",a); this.outputFault("afterMetadata");
        const o: HeldOutbox={outboxId:a.outboxId,outputId:a.outputId,state:"HELD",rowRevision:1,lastEventId:randomUUID(),
          holdReason:"AUTHORITY_UNAVAILABLE",createdAtMs:q.atMs,updatedAtMs:q.atMs};
        insertOutputRow(db,"runtime_output_outbox",o); this.outputFault("afterOutbox");
        const seed={eventId:o.lastEventId,outboxId:o.outboxId,rowRevision:1 as const,eventType:"OFFLINE_HELD_RECORDED" as const,
          priorState:null,newState:"HELD" as const,reasonCode:"AUTHORITY_UNAVAILABLE" as const,atMs:q.atMs,
          snapshotDigest:projectionDigest(o,a,digest),previousEventId:null,previousDigest:null};
        const readonly=this.fault?.eventType==="OUTPUT_HELD_RECORDED" && this.fault.stage==="auditWrite";
        if(readonly) db.exec("PRAGMA query_only=ON");
        try { appendOutputEvent(db,{...seed,eventDigest:outputEventDigest(seed)}); }
        finally { if(readonly) db.exec("PRAGMA query_only=OFF"); }
        this.outputFault("afterAudit");
        if(this.fault?.eventType==="OUTPUT_HELD_RECORDED" && this.fault.stage==="constraint")
          insertOutputRow(db,"runtime_output_operations",{operationId:q.operationId,streamId:s.streamId,idempotencyKey:q.idempotencyKey,
            requestDigest:digest,outputId:q.outputId,claimKey:null,createdAtMs:q.atMs});
        this.outputFault("rollbackFailure");
        this.verifyControl(db); this.outputFault("beforeCommit");
        return heldReceipt(a,{...s,lastAccepted:q.sequence,revision:s.revision+1},false);
      },observation);
    } catch(error) { return this.outputError(error,observation); }
  }
  lookupOutputOperation(input: unknown): HeldOutputResult {
    if(!outputFixtureOwners.has(this)) return outputDenied("OUTPUT_FIXTURE_REQUIRED");
    let q: ReturnType<typeof OutputLookupSchema.parse>;
    try { q=OutputLookupSchema.parse(inertOutputInput(input)); } catch { return outputDenied("OUTPUT_INVALID_REQUEST"); }
    try { return this.readTransaction(()=>{
      this.verifyControl(this.connection.db); this.outputOwner(q.expected);
      const op=outputRow(OperationSchema,this.connection.db.prepare("SELECT * FROM runtime_output_operations WHERE operationId=?").get(q.operationId));
      const s=outputRow(StreamSchema,this.connection.db.prepare("SELECT * FROM runtime_output_streams WHERE streamId=?").get(op.streamId));
      outputRequire(s.projectId===q.expected.projectId && s.authorityIncarnation===q.expected.authorityIncarnation &&
        s.attemptId===q.expected.attemptId && s.attemptGeneration===q.expected.attemptGeneration,"OUTPUT_SCOPE_DENIED");
      return heldReceipt(outputRow(AcceptedSchema,this.connection.db.prepare("SELECT * FROM runtime_accepted_outputs WHERE outputId=?").get(op.outputId)),s,true);
    }); } catch(error) { return this.outputError(error); }
  }
  // Internal inspection only. Authentication is unavailable on the ordinary host path.
  // A verified fixture snapshot is never a publication/delivery permit.
  evaluateHeldOutputRevalidation(input: unknown): HeldOutputRevalidationResult {
    if (!outputFixtureOwners.has(this)) return revalidationDenied("PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
    if (this.closed || this.closing) return revalidationDenied("REPOSITORY_CLOSED");
    let q: ReturnType<typeof HeldOutputRevalidationSchema.parse>;
    try { q = HeldOutputRevalidationSchema.parse(inertOutputInput(input)); }
    catch { return revalidationDenied("INVALID_REQUEST"); }
    try {
      const result = this.readTransaction(() => inspectHeldOutputSnapshot(
        this.connection.db, this.connection.ref, this.#hostIssuer.descriptor, q));
      return this.closed || this.closing ? revalidationDenied("REPOSITORY_CLOSED") : result;
    } catch (error) {
      if (this.closed || this.closing) return revalidationDenied("REPOSITORY_CLOSED");
      if (error instanceof OutputFailure || error instanceof AuthorityFailure &&
          ["INTEGRITY", "VALIDATION", "IDENTITY_CONFLICT"].includes(error.code))
        return revalidationDenied("PERSISTED_STATE_INVALID", { consistency: "FIXTURE_METADATA_INVALID" }, { metadata: "INVALID" });
      if (error instanceof AuthorityFailure && error.code === "SCHEMA") return revalidationDenied("SCHEMA_UNSUPPORTED");
      return revalidationDenied(error instanceof AuthorityFailure && error.code === "DATABASE_BUSY" ? "STORAGE_BUSY" : "STORAGE_UNAVAILABLE");
    }
  }
  get settings() { return this.connection.settings; }
  close(): void {
    if (this.closed) return;
    this.closing = true; this.#hostIssuer.close();
    this.connection.close(); this.closed = true;
  }
  private transaction<T>(write: boolean, operation: (db: DatabaseSync) => T, observation?: TransactionObservation): T {
    requireAuthority(!this.closed && !this.closing, "DATABASE_FAILURE");
    const db = this.connection.db;
    try {
      // One bounded acquisition, no automatic command-body/worker retries.
      db.exec(write ? "BEGIN IMMEDIATE" : "BEGIN");
      const meta = db.prepare("SELECT * FROM runtime_control_meta").get();
      requireAuthority(meta?.projectId === this.connection.ref.projectId &&
        meta?.authorityIncarnation === this.connection.ref.authorityIncarnation, "IDENTITY_CONFLICT");
      const result = operation(db);
      if (observation) observation.commitAttempted = true;
      db.exec("COMMIT");
      if (observation) { observation.committed = true; this.outputFault("afterCommit"); }
      return result;
    } catch (error) {
      try { if (db.isTransaction) {
        if (observation) this.outputFault("rollbackFailure");
        db.exec("ROLLBACK"); if (observation) observation.rolledBack = true;
      } }
      catch (rollbackError) { this.close(); throw new AggregateError([databaseError(error), rollbackError], "ROLLBACK_FAILED"); }
      if (error instanceof OutputFailure) throw error;
      throw databaseError(error);
    }
  }
  private readTransaction<T>(operation: () => T): T { return this.transaction(false, operation); }
  private verifyControl(db: DatabaseSync): void {
    verifySchema(db, this.connection.ref);
    verifySecurityStopJournal(db, this.connection.ref);
    verifyOutputHistory(db, this.connection.ref);
  }
  private securityStopFault(stage: SecurityStopFault): boolean {
    return this.fault?.eventType === "SECURITY_STOP_ACTIVATED" && this.fault.stage === stage;
  }
  private stopFault(stage: SecurityStopFault): void { requireAuthority(!this.securityStopFault(stage), "FAULT"); }
  private stopWrite(db: DatabaseSync, stage: "journalWrite" | "operationWrite", sql: string, values: (string | number | null)[]): void {
    const readonly = this.securityStopFault(stage);
    if (readonly) db.exec("PRAGMA query_only=ON");
    try { db.prepare(sql).run(...values); } finally { if (readonly) db.exec("PRAGMA query_only=OFF"); }
  }
  // Unexposed fixture repository operation. This records a stop, never caller authentication or owner approval.
  activateSecurityStop(input: unknown) {
    let q: ActivateSecurityStop;
    try { q = parse(ActivateSecurityStopSchema, input); } catch { throw new AuthorityFailure("VALIDATION"); }
    const digest = activationDigest(q);
    const result = this.transaction(true, db => {
      this.verifyControl(db); this.binding(q.expected);
      const journal = verifySecurityStopJournal(db, this.connection.ref);
      const prior = journal.events.find(event => event.operationId === q.operationId);
      if (prior) {
        requireAuthority(prior.requestDigest === digest, "SECURITY_IDEMPOTENCY_CONFLICT");
        // Historical receipt, not current admission: lifecycle/epoch may since have advanced.
        return securityStopReceipt(prior, true);
      }
      const current = this.current(db, this.identity(q.expected));
      assertExpected(current, q.expected);
      const raw = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(this.connection.ref.projectId);
      requireAuthority(raw, "INTEGRITY");
      const security = parse(ExecutionSecuritySchema, raw);
      requireAuthority(security.recordVersion === 1 && security.projectId === current.projectId &&
        security.authorityIncarnation === current.authorityIncarnation, "INTEGRITY");
      requireAuthority(q.expectedSecurityRevision === security.securityRevision, "SECURITY_REVISION_CONFLICT");
      requireAuthority(security.securityState !== "ACTIVE_STOP", "SECURITY_STOP_ALREADY_ACTIVE");
      requireAuthority(security.stopJournalHead === null, "INTEGRITY");
      requireAuthority(q.atMs >= current.updatedAtMs, "VALIDATION");
      const revision = nextInteger(security.securityRevision);
      const seed = parse(SecurityStopEventSchema, { eventId: q.eventId, operationId: q.operationId, recordVersion: 1,
        projectId: current.projectId, authorityIncarnation: current.authorityIncarnation, taskId: current.taskId,
        attemptId: current.attemptId, attemptGeneration: current.attemptGeneration, attemptStateVersion: current.stateVersion,
        attemptPhase: current.phase, hostInstanceId: current.hostInstanceId, ownerId: current.ownerId, ownerNonceHash: current.ownerNonceHash,
        action: q.action, reason: q.reason, sourceClass: "LOCAL_TEST_FIXTURE", revisionBefore: security.securityRevision,
        revisionAfter: revision, stateBefore: security.securityState, stateAfter: "ACTIVE_STOP", policyVersion: security.policyVersion,
        journalSequence: 1, atMs: q.atMs, requestDigest: digest, eventDigest: "0".repeat(64) });
      const event = parse(SecurityStopEventSchema, { ...seed, eventDigest: securityStopEventDigest(seed) });
      this.stopFault("beforeUpdate");
      assertOne(db.prepare(`UPDATE runtime_execution_security SET securityState='ACTIVE_STOP',securityRevision=?,stopJournalHead=?
        WHERE projectId=? AND authorityIncarnation=? AND recordVersion=1 AND securityRevision=? AND securityState=? AND stopJournalHead IS NULL`)
        .run(revision, q.eventId, current.projectId, current.authorityIncarnation, q.expectedSecurityRevision, security.securityState).changes);
      this.stopFault("afterUpdate");
      const keys = Object.keys(event) as (keyof typeof event)[];
      this.stopWrite(db, "journalWrite", `INSERT INTO runtime_security_stop_events(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`,
        keys.map(key => key === "journalSequence" && this.securityStopFault("journalConstraint") ? 0 : event[key]));
      this.stopFault("afterJournal");
      this.stopWrite(db, "operationWrite", `INSERT INTO runtime_security_stop_operations(operationId,recordVersion,projectId,authorityIncarnation,eventId,requestDigest)
        VALUES(?,?,?,?,?,?)`, [q.operationId, this.securityStopFault("operationConstraint") ? 0 : 1,
        current.projectId, current.authorityIncarnation, q.eventId, digest]);
      this.stopFault("afterOperation");
      this.verifyControl(db);
      const committed = verifySecurityStopJournal(db, this.connection.ref).events[0]!;
      this.stopFault("beforeCommit");
      return securityStopReceipt(committed, false);
    });
    if (!result.replay) this.stopFault("afterCommit"); // Controlled lost-ack fixture; transaction already committed.
    return result;
  }
  securityStopHistory() {
    return this.readTransaction(() => {
      this.verifyControl(this.connection.db);
      return Object.freeze({ ...verifySecurityStopJournal(this.connection.db, this.connection.ref),
        executionAuthority: false as const, eligible: false as const, productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" as const,
        externalWitness: "EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED" as const, priorActivationHistory: "NOT_BACKFILLED" as const });
    });
  }
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
  // A snapshot diagnostic only. It creates no intent, event, permission or reusable admission receipt.
  assessExecutionReadiness(input: unknown): ExecutionReadiness {
    let request: ReadinessRequest;
    // Parsing is outside the transaction; malformed inputs cannot enter its body.
    try {
      const parsed = ReadinessRequestSchema.safeParse(input);
      if (!parsed.success) return denyReadiness(["INVALID_REQUEST"]);
      request = parsed.data;
    } catch { return denyReadiness(["INVALID_REQUEST"]); }
    const e = request.expected, ref = this.connection.ref;
    try {
      return this.readTransaction(() => {
        const db = this.connection.db;
        this.verifyControl(db); // Schema and tracked security history share this snapshot.
        if (e.projectId !== ref.projectId) return denyReadiness(["IDENTITY_MISMATCH"]);
        if (e.authorityIncarnation !== ref.authorityIncarnation) return denyReadiness(["INCARNATION_MISMATCH"]);
        const row = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?").get(e.projectId, e.attemptId);
        if (!row) return denyReadiness(["ATTEMPT_NOT_FOUND"]);
        const attempt = parse(AttemptSchema, row);
        verifyHistory(db, attempt);
        const security = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(ref.projectId);
        return evaluatePersistedReadiness(attempt, security, request);
      });
    } catch (error) {
      if (error instanceof AuthorityFailure) {
        if (error.code === "SCHEMA") return denyReadiness(["SCHEMA_UNSUPPORTED"]);
        if (["INTEGRITY", "VALIDATION", "IDENTITY_CONFLICT"].includes(error.code))
          return denyReadiness(["PERSISTED_STATE_INVALID"]);
      }
      return denyReadiness(["STORAGE_UNAVAILABLE"]);
    }
  }
  // Complements PI-02 without replacing its deny-only contract. No provenance write/issuance API.
  assessProvenanceReadiness(input: unknown): ProvenanceDecision {
    let request: ProvenanceRequest;
    try {
      const parsed = ProvenanceRequestSchema.safeParse(input);
      if (!parsed.success) return provenanceDecision(denyReadiness(["INVALID_REQUEST"]), ["PROVENANCE_NOT_EVALUATED"]);
      request = parsed.data;
    } catch { return provenanceDecision(denyReadiness(["INVALID_REQUEST"]), ["PROVENANCE_NOT_EVALUATED"]); }
    try {
      return this.readTransaction(() => {
        const db = this.connection.db, ref = this.connection.ref;
        this.verifyControl(db);
        if (request.expected.projectId !== ref.projectId)
          return provenanceDecision(denyReadiness(["IDENTITY_MISMATCH"]), ["PROVENANCE_NOT_EVALUATED"]);
        if (request.expected.authorityIncarnation !== ref.authorityIncarnation)
          return provenanceDecision(denyReadiness(["INCARNATION_MISMATCH"]), ["PROVENANCE_NOT_EVALUATED"]);
        const row = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?")
          .get(ref.projectId, request.expected.attemptId);
        if (!row) return provenanceDecision(denyReadiness(["ATTEMPT_NOT_FOUND"]), ["PROVENANCE_NOT_EVALUATED"]);
        const attempt = parse(AttemptSchema, row); verifyHistory(db, attempt);
        const security = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(ref.projectId);
        const base = evaluatePersistedReadiness(attempt, security, request);
        const rows = this.provenanceRows(db, request);
        return provenanceDecision(base, evaluateProvenanceRows(attempt, request, rows));
      });
    } catch (error) {
      if (error instanceof AuthorityFailure) {
        if (error.code === "SCHEMA") return provenanceDecision(denyReadiness(["SCHEMA_UNSUPPORTED"]), ["PROVENANCE_NOT_EVALUATED"]);
        if (error.code === "CONFLICT") return provenanceDecision(denyReadiness(["ATTEMPT_NOT_FOUND"]), ["PROVENANCE_NOT_EVALUATED"]);
        if (["INTEGRITY", "VALIDATION", "IDENTITY_CONFLICT"].includes(error.code))
          return provenanceDecision(denyReadiness(["PERSISTED_STATE_INVALID"]), ["PERSISTED_PROVENANCE_INVALID"]);
      }
      return provenanceDecision(denyReadiness(["STORAGE_UNAVAILABLE"]), ["PROVENANCE_NOT_EVALUATED"]);
    }
  }
  private provenanceRows(db: DatabaseSync, request: Pick<ProvenanceRequest, "principalId" | "policyId" | "grantId">) {
    return {
      principal: db.prepare("SELECT * FROM runtime_principal_provenance WHERE principalId=?").get(request.principalId),
      policy: db.prepare("SELECT * FROM runtime_policy_provenance WHERE policyId=?").get(request.policyId),
      grant: db.prepare("SELECT * FROM runtime_grant_provenance WHERE grantId=?").get(request.grantId),
    };
  }
  private denySession(reason: ReadinessReason, issues: readonly SessionReason[]): SessionDecision {
    return sessionDecision(provenanceDecision(denyReadiness([reason]), ["PROVENANCE_NOT_EVALUATED"]), issues);
  }
  // Descriptor is diagnostic fixture metadata. The private issuer token/handle map is never exposed.
  get hostIssuerForTest() { return this.#hostIssuer.descriptor; }
  issueHostContextForTest(input: unknown): FixtureHostContext {
    const request = parse(SessionReadinessRequestSchema, input);
    return this.readTransaction(() => {
      const result = this.sessionSnapshot(this.connection.db, request, undefined, false);
      const allowed = new Set<string>(["SECURITY_STATE_UNKNOWN", "SECURITY_STATE_BLOCKED", "SECURITY_STOP_ACTIVE",
        "POLICY_UNAVAILABLE", "POLICY_UNSUPPORTED", "PRINCIPAL_UNAVAILABLE", "GRANT_UNAVAILABLE",
        "PRODUCTION_PRINCIPAL_UNVERIFIED", "PRODUCTION_AUTHORITY_UNAVAILABLE", "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE"]);
      requireAuthority(result.binding && result.decision.sessionReasons.length === 0 &&
        result.decision.provenanceReasons.length === 0 && result.decision.reasons.every(r => allowed.has(r)), "AUTHORITY_INVALID");
      return this.#hostIssuer.issue(result.binding);
    });
  }
  assessSessionReadiness(input: unknown, hostContext?: unknown): SessionDecision {
    let request: SessionReadinessRequest;
    try {
      const parsed = SessionReadinessRequestSchema.safeParse(input);
      if (!parsed.success) return this.denySession("INVALID_REQUEST", ["SESSION_NOT_EVALUATED"]);
      request = parsed.data;
    } catch { return this.denySession("INVALID_REQUEST", ["SESSION_NOT_EVALUATED"]); }
    try { return this.readTransaction(() => this.sessionSnapshot(this.connection.db, request, hostContext, true).decision); }
    catch (error) {
      if (error instanceof AuthorityFailure) {
        if (error.code === "SCHEMA") return this.denySession("SCHEMA_UNSUPPORTED", ["SESSION_NOT_EVALUATED"]);
        if (["INTEGRITY", "VALIDATION", "IDENTITY_CONFLICT"].includes(error.code))
          return this.denySession("PERSISTED_STATE_INVALID", ["SESSION_RECORD_INVALID"]);
      }
      return this.denySession("STORAGE_UNAVAILABLE", ["SESSION_NOT_EVALUATED"]);
    }
  }
  private sessionSnapshot(db: DatabaseSync, request: SessionReadinessRequest, handle: unknown, requireContext: boolean):
    { decision: SessionDecision; binding: HostBindingSnapshot | null } {
    const fail = (reason: ReadinessReason) => ({ decision: this.denySession(reason, ["SESSION_NOT_EVALUATED"]), binding: null });
    const ref = this.connection.ref; this.verifyControl(db);
    if (request.expected.projectId !== ref.projectId) return fail("IDENTITY_MISMATCH");
    if (request.expected.authorityIncarnation !== ref.authorityIncarnation) return fail("INCARNATION_MISMATCH");
    const attemptRow = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?").get(ref.projectId, request.expected.attemptId);
    if (!attemptRow) return fail("ATTEMPT_NOT_FOUND");
    const attempt = parse(AttemptSchema, attemptRow); verifyHistory(db, attempt);
    const security = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(ref.projectId);
    const base = evaluatePersistedReadiness(attempt, security, request);
    const host = requireContext ? this.#hostIssuer.read(handle, request.atMs) : { snapshot: null, issues: [] };
    const executionRow = db.prepare("SELECT * FROM runtime_execution_sessions WHERE executionSessionId=?").get(request.executionSessionId);
    const execution = ExecutionSessionSchema.safeParse(executionRow);
    if (!execution.success) return { binding: null, decision: sessionDecision(provenanceDecision(base, ["PROVENANCE_NOT_EVALUATED"]),
      [executionRow === undefined ? "SESSION_MISSING" : "SESSION_RECORD_INVALID", ...host.issues]) };
    const e = execution.data;
    const appRow = db.prepare("SELECT * FROM runtime_application_session_bindings WHERE applicationSessionId=?").get(e.applicationSessionId);
    const app = ApplicationSessionBindingSchema.safeParse(appRow), application = app.success ? app.data : null;
    const provenanceRequest: ProvenanceRequest = { expected: request.expected, securityRevision: request.securityRevision,
      principalId: e.principalId, principalRevision: e.principalRevision, policyId: e.policyId,
      policyVersion: e.policyVersion, policyRevision: e.policyRevision, grantId: e.grantId,
      authorizationRevision: e.authorizationRevision, sourceRevision: e.provenanceSourceRevision,
      sessionId: e.executionSessionId, action: request.action, destinationId: request.destinationId, atMs: request.atMs };
    const rows = this.provenanceRows(db, provenanceRequest);
    const provenance = provenanceDecision(base, evaluateProvenanceRows(attempt, provenanceRequest, rows));
    const issues: SessionReason[] = [...evaluateSessionBinding(attempt, request, e, application, this.#hostIssuer.descriptor), ...host.issues];
    if (!app.success && appRow !== undefined) issues.push("APPLICATION_SESSION_INVALID");
    const grant = GrantProvenanceSchema.safeParse(rows.grant);
    const binding: HostBindingSnapshot | null = application && grant.success ? {
      projectId: attempt.projectId, authorityIncarnation: attempt.authorityIncarnation,
      principalId: e.principalId, principalRevision: e.principalRevision, applicationSessionId: application.applicationSessionId,
      applicationGeneration: application.generation, applicationRevision: application.revision,
      executionSessionId: e.executionSessionId, bindingRevision: e.bindingRevision,
      attemptId: attempt.attemptId, attemptGeneration: attempt.attemptGeneration, attemptStateVersion: attempt.stateVersion, attemptPhase: attempt.phase,
      workspaceBindingId: attempt.bindingId, workspaceGeneration: attempt.bindingGeneration,
      policyId: e.policyId, policyRevision: e.policyRevision, policyVersion: e.policyVersion,
      grantId: e.grantId, authorizationRevision: e.authorizationRevision, provenanceSourceRevision: e.provenanceSourceRevision,
      action: request.action, destinationId: request.destinationId, issuedAtMs: request.atMs,
      expiresAtMs: Math.min(e.expiresAtMs, application.expiresAtMs, grant.data.expiresAtMs, request.atMs + FIXTURE_HOST_CONTEXT_LIFETIME_MS),
    } : null;
    if (requireContext && binding && host.snapshot) issues.push(...compareHostSnapshot(binding, host.snapshot));
    return { binding, decision: sessionDecision(provenance, issues) };
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
