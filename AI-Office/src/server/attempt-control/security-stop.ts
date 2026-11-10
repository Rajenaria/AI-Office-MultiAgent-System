import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { ContentHashSchema, ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";
import { AttemptSchema, ExpectedSchema, PhaseSchema, SafePositive, SafeTime, hash, parse, requireAuthority, semanticDigest } from "./contracts.js";
import { ExecutionSecuritySchema } from "./execution-readiness.js";
import { verifyHistory } from "./journal.js";

export const ActivationReasonSchema = z.enum(["OWNER_REPORTED_RISK", "INTEGRITY_CONCERN", "POLICY_VIOLATION", "TEST_SECURITY_CONCERN"]);
export const ActivateSecurityStopSchema = z.strictObject({ expected: ExpectedSchema, expectedSecurityRevision: SafePositive,
  operationId: ProjectIdSchema, eventId: ProjectIdSchema, action: z.literal("ACTIVATE_STOP"),
  reason: ActivationReasonSchema, atMs: SafeTime });
export type ActivateSecurityStop = z.infer<typeof ActivateSecurityStopSchema>;
export const SecurityStopEventSchema = z.strictObject({
  eventId: ProjectIdSchema, operationId: ProjectIdSchema, recordVersion: z.literal(1),
  projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema, taskId: ReferenceIdSchema,
  attemptId: ProjectIdSchema, attemptGeneration: SafePositive, attemptStateVersion: SafePositive, attemptPhase: PhaseSchema,
  hostInstanceId: ProjectIdSchema, ownerId: ProjectIdSchema, ownerNonceHash: ContentHashSchema,
  action: z.literal("ACTIVATE_STOP"), reason: ActivationReasonSchema, sourceClass: z.literal("LOCAL_TEST_FIXTURE"),
  revisionBefore: SafePositive, revisionAfter: SafePositive, stateBefore: z.enum(["UNKNOWN", "BLOCKED"]),
  stateAfter: z.literal("ACTIVE_STOP"), policyVersion: ReferenceIdSchema.nullable(), journalSequence: z.literal(1),
  atMs: SafeTime, requestDigest: ContentHashSchema, eventDigest: ContentHashSchema,
}).readonly();
export type SecurityStopEvent = z.infer<typeof SecurityStopEventSchema>;
const OperationSchema = z.strictObject({ operationId: ProjectIdSchema, recordVersion: z.literal(1),
  projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema, eventId: ProjectIdSchema, requestDigest: ContentHashSchema });
export type SecurityStopFault = "beforeUpdate" | "afterUpdate" | "journalWrite" | "journalConstraint" |
  "afterJournal" | "operationWrite" | "operationConstraint" | "afterOperation" | "beforeCommit" | "afterCommit";
export type SecurityStopJournalStatus = "ACTIVATION_HISTORY_UNAVAILABLE" | "REPOSITORY_APPEND_ONLY_JOURNAL_VERIFIED";

// Fixed, versioned ordering; owner nonce itself is never persisted in this journal.
function requestDigest(row: Pick<SecurityStopEvent, "projectId" | "authorityIncarnation" | "taskId" | "attemptId" |
  "attemptGeneration" | "attemptStateVersion" | "attemptPhase" | "hostInstanceId" | "ownerId" | "ownerNonceHash" |
  "revisionBefore" | "operationId" | "eventId" | "action" | "reason" | "atMs">): string {
  return semanticDigest(["security-stop-request", row.projectId, row.authorityIncarnation, row.taskId, row.attemptId,
    row.attemptGeneration, row.attemptStateVersion, row.attemptPhase, row.hostInstanceId, row.ownerId, row.ownerNonceHash,
    row.revisionBefore, row.operationId, row.eventId, row.action, row.reason, row.atMs]);
}
export function activationDigest(q: ActivateSecurityStop): string {
  return requestDigest({ ...q.expected, attemptStateVersion: q.expected.stateVersion, attemptPhase: q.expected.phase,
    ownerNonceHash: hash(q.expected.ownerNonce), revisionBefore: q.expectedSecurityRevision,
    operationId: q.operationId, eventId: q.eventId, action: q.action, reason: q.reason, atMs: q.atMs });
}
export function securityStopEventDigest(event: SecurityStopEvent): string {
  const keys = Object.keys(SecurityStopEventSchema.unwrap().shape).filter(key => key !== "eventDigest") as (keyof SecurityStopEvent)[];
  return semanticDigest(["security-stop-event", ...keys.map(key => event[key])]);
}
export function securityStopReceipt(event: SecurityStopEvent, replay: boolean) {
  return Object.freeze({ ...event, replay, eligible: false as const, executionAuthority: false as const,
    journalStatus: "REPOSITORY_APPEND_ONLY_JOURNAL_VERIFIED" as const,
    productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" as const, ownerApproval: "NOT_GRANTED" as const,
    priorActivationHistory: "NOT_BACKFILLED" as const, externalWitness: "EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED" as const });
}
// Same private repository connection/transaction. No external witness, clock, IO or callbacks.
export function verifySecurityStopJournal(db: DatabaseSync, scope: { projectId: string; authorityIncarnation: string }):
  { status: SecurityStopJournalStatus; events: readonly SecurityStopEvent[] } {
  try {
    const row = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(scope.projectId);
    const events = db.prepare("SELECT * FROM runtime_security_stop_events ORDER BY journalSequence").all();
    const operations = db.prepare("SELECT * FROM runtime_security_stop_operations").all();
    // Existing unjournaled fixture states remain deny-only diagnostics, never certified history.
    // Missing/malformed security is rejected by activation and the existing readiness evaluator.
    if ((row === undefined || row.stopJournalHead === null) && events.length === 0 && operations.length === 0)
      return { status: "ACTIVATION_HISTORY_UNAVAILABLE", events: Object.freeze([]) };
    const security = parse(ExecutionSecuritySchema, row);
    requireAuthority(security.recordVersion === 1 && events.length === 1 && operations.length === 1, "INTEGRITY");
    const event = parse(SecurityStopEventSchema, events[0]), operation = parse(OperationSchema, operations[0]);
    requireAuthority(security.projectId === scope.projectId && security.authorityIncarnation === scope.authorityIncarnation &&
      event.projectId === scope.projectId && event.authorityIncarnation === scope.authorityIncarnation &&
      operation.projectId === scope.projectId && operation.authorityIncarnation === scope.authorityIncarnation &&
      security.stopJournalHead === event.eventId && security.securityState === event.stateAfter &&
      security.securityRevision === event.revisionAfter && security.policyVersion === event.policyVersion &&
      event.revisionAfter === event.revisionBefore + 1 && event.journalSequence === 1 &&
      operation.operationId === event.operationId && operation.eventId === event.eventId &&
      operation.requestDigest === event.requestDigest && event.requestDigest === requestDigest(event) &&
      event.eventDigest === securityStopEventDigest(event), "INTEGRITY");
    const attempt = parse(AttemptSchema, db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?")
      .get(scope.projectId, event.attemptId));
    const history = verifyHistory(db, attempt), captured = history[event.attemptStateVersion - 1];
    requireAuthority(captured, "INTEGRITY");
    const snapshot = parse(AttemptSchema, (JSON.parse(captured.payload) as { snapshot: unknown }).snapshot);
    requireAuthority(snapshot.authorityIncarnation === event.authorityIncarnation && snapshot.taskId === event.taskId &&
      snapshot.attemptGeneration === event.attemptGeneration && snapshot.stateVersion === event.attemptStateVersion &&
      snapshot.phase === event.attemptPhase && snapshot.hostInstanceId === event.hostInstanceId &&
      snapshot.ownerId === event.ownerId && snapshot.ownerNonceHash === event.ownerNonceHash &&
      event.atMs >= snapshot.updatedAtMs, "INTEGRITY");
    return { status: "REPOSITORY_APPEND_ONLY_JOURNAL_VERIFIED", events: Object.freeze([event]) };
  } catch (error) {
    if (error instanceof Error && "errcode" in error) throw error;
    requireAuthority(false, "INTEGRITY");
  }
}
