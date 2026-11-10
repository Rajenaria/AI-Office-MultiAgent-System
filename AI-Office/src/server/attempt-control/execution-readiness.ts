import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";
import { ExpectedSchema, SafePositive, hash, type Attempt } from "./contracts.js";
import { isTerminal } from "./state-machine.js";

export const SecurityStateSchema = z.enum(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"]);
export const ExecutionSecuritySchema = z.strictObject({
  projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema,
  recordVersion: SafePositive, securityRevision: SafePositive, securityState: SecurityStateSchema,
  policyVersion: ReferenceIdSchema.nullable(),
  stopJournalHead: ProjectIdSchema.nullable().default(null),
});
export const ReadinessRequestSchema = z.strictObject({ expected: ExpectedSchema, securityRevision: SafePositive });
export type ReadinessRequest = z.infer<typeof ReadinessRequestSchema>;
export type ReadinessReason = "INVALID_REQUEST" | "ATTEMPT_NOT_FOUND" | "IDENTITY_MISMATCH" |
  "INCARNATION_MISMATCH" | "OWNER_MISMATCH" | "EPOCH_MISMATCH" | "STALE_ATTEMPT_REVISION" |
  "STALE_SECURITY_REVISION" | "ATTEMPT_CANCELLED" | "ATTEMPT_TERMINAL" | "LIFECYCLE_NOT_ADMISSIBLE" |
  "SECURITY_RECORD_MISSING" | "SECURITY_RECORD_INVALID" | "SECURITY_STATE_UNKNOWN" |
  "SECURITY_STATE_BLOCKED" | "SECURITY_STOP_ACTIVE" | "POLICY_UNAVAILABLE" | "POLICY_UNSUPPORTED" |
  "PRINCIPAL_UNAVAILABLE" | "GRANT_UNAVAILABLE" | "SCHEMA_UNSUPPORTED" | "PERSISTED_STATE_INVALID" |
  "STORAGE_UNAVAILABLE";
export type ExecutionReadiness = Readonly<{
  eligible: false; executionAuthority: false; reason: ReadinessReason; reasons: readonly ReadinessReason[];
  observed: Readonly<{ attemptGeneration: number; stateVersion: number; securityRevision: number;
    securityState: z.infer<typeof SecurityStateSchema> }> | null;
}>;
export function denyReadiness(reasons: readonly [ReadinessReason, ...ReadinessReason[]],
  observed: ExecutionReadiness["observed"] = null): ExecutionReadiness {
  return Object.freeze({ eligible: false, executionAuthority: false, reason: reasons[0],
    reasons: Object.freeze([...reasons]), observed: observed === null ? null : Object.freeze({ ...observed }) });
}
// Internal policy helper: the repository supplies verified rows from its own transaction.
// No principal/session/grant authority exists yet; caller assertions cannot fill those gaps.
export function evaluatePersistedReadiness(attempt: Attempt, row: unknown, request: ReadinessRequest): ExecutionReadiness {
  if (row === undefined) return denyReadiness(["SECURITY_RECORD_MISSING"]);
  const parsed = ExecutionSecuritySchema.safeParse(row);
  if (!parsed.success) return denyReadiness(["SECURITY_RECORD_INVALID"]);
  const security = parsed.data, e = request.expected;
  const reasons: ReadinessReason[] = [];
  if (security.recordVersion !== 1) reasons.push("SCHEMA_UNSUPPORTED");
  if (security.projectId !== attempt.projectId || e.projectId !== attempt.projectId ||
    e.taskId !== attempt.taskId || e.attemptId !== attempt.attemptId) reasons.push("IDENTITY_MISMATCH");
  if (security.authorityIncarnation !== attempt.authorityIncarnation || e.authorityIncarnation !== attempt.authorityIncarnation)
    reasons.push("INCARNATION_MISMATCH");
  if (e.attemptGeneration !== attempt.attemptGeneration) reasons.push("EPOCH_MISMATCH");
  if (e.hostInstanceId !== attempt.hostInstanceId || e.ownerId !== attempt.ownerId || hash(e.ownerNonce) !== attempt.ownerNonceHash)
    reasons.push("OWNER_MISMATCH");
  if (e.stateVersion !== attempt.stateVersion || e.phase !== attempt.phase) reasons.push("STALE_ATTEMPT_REVISION");
  if (request.securityRevision !== security.securityRevision) reasons.push("STALE_SECURITY_REVISION");
  // noLaunch cancellation can retain APPROVAL_GRANTED: phase alone is insufficient.
  if (attempt.cancellationPayload !== null || attempt.phase === "CANCELLATION_REQUESTED") reasons.push("ATTEMPT_CANCELLED");
  if (isTerminal(attempt.phase) || attempt.terminalReceiptId !== null) reasons.push("ATTEMPT_TERMINAL");
  reasons.push(security.securityState === "UNKNOWN" ? "SECURITY_STATE_UNKNOWN" :
    security.securityState === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STOP_ACTIVE");
  if (attempt.phase !== "APPROVAL_GRANTED" || attempt.ownerMode !== "EXECUTION" || attempt.recoveryPayload !== null)
    reasons.push("LIFECYCLE_NOT_ADMISSIBLE");
  reasons.push(security.policyVersion === null ? "POLICY_UNAVAILABLE" : "POLICY_UNSUPPORTED",
    "PRINCIPAL_UNAVAILABLE", "GRANT_UNAVAILABLE");
  // Deliberately no positive branch, grant resolver, clearance mutator or execution token.
  return denyReadiness(reasons as [ReadinessReason, ...ReadinessReason[]], {
    attemptGeneration: attempt.attemptGeneration, stateVersion: attempt.stateVersion,
    securityRevision: security.securityRevision, securityState: security.securityState,
  });
}
