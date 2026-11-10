import { z } from "zod";
import type { DatabaseSync } from "node:sqlite";
import { ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";
import { AttemptSchema, ExpectedSchema, SafePositive, SafeTime, hash } from "./contracts.js";
import { AcceptedSchema, OperationSchema, OutboxSchema, StreamSchema, OutputChannelSchema } from "./output-metadata.js";
import { outputRow, readOutputBinding, verifyOutputHistory } from "./output-journal.js";
import { verifyHistory } from "./journal.js";
import { verifySchema } from "./sqlite-format.js";
import { ExecutionSecuritySchema } from "./execution-readiness.js";
import { verifySecurityStopJournal } from "./security-stop.js";
import { evaluateProvenanceRows, PolicyProvenanceSchema, GrantProvenanceSchema } from "./provenance.js";
import { ApplicationSessionBindingSchema, ExecutionSessionSchema, evaluateSessionBinding,
  type HostIssuerDescriptor } from "./host-session.js";
import { isTerminal } from "./state-machine.js";

export const HeldOutputRevalidationSchema = z.strictObject({
  expected: ExpectedSchema, outputId: ProjectIdSchema, operationId: ProjectIdSchema, outboxId: ProjectIdSchema,
  executionSessionId: ReferenceIdSchema, applicationSessionId: ReferenceIdSchema,
  workspaceBindingId: ReferenceIdSchema, workspaceGeneration: SafePositive,
  producerId: ProjectIdSchema, producerEventId: ReferenceIdSchema, idempotencyKey: ReferenceIdSchema,
  destinationId: ReferenceIdSchema, channel: OutputChannelSchema, sequence: SafePositive,
  securityRevision: SafePositive, atMs: SafeTime,
});
export type HeldOutputRevalidationRequest = z.infer<typeof HeldOutputRevalidationSchema>;
type Status = "VERIFIED" | "INVALID" | "NOT_EVALUATED";
export type RevalidationChecks = Readonly<{
  metadata: Status; attempt: Status; session: Status; provenance: Status;
  security: "UNKNOWN" | "BLOCKED" | "ACTIVE_STOP" | "INVALID" | "NOT_EVALUATED";
  productionAuthentication: "UNAVAILABLE";
  productionAuthorization: "NOT_EVALUATED"; destinationAuthorization: "NOT_EVALUATED";
  classificationAuthority: "NOT_EVALUATED"; delivery: "NOT_EVALUATED";
}>;
type Observation = Readonly<{ attemptVersion: number; executionEpoch: number; securityRevision: number;
  policyRevision: number | null; authorizationRevision: number | null }>;
export type HeldOutputRevalidationResult = Readonly<{
  outputId: string | null; held: true | null;
  consistency: "FIXTURE_METADATA_CONSISTENT" | "FIXTURE_METADATA_INVALID" | "NOT_EVALUATED";
  decision: "DENIED"; reasonCode: string; reasons: readonly string[];
  productionAccepted: false; executionAuthority: false; publicationAuthority: false; deliveryAuthority: false;
  checks: RevalidationChecks; observed: Observation | null;
}>;
export function revalidationDenied(reasonCode: string,
  details: Partial<Pick<HeldOutputRevalidationResult, "outputId" | "held" | "consistency" | "observed">> = {},
  checks: Partial<RevalidationChecks> = {}, reasons: readonly string[] = [reasonCode]): HeldOutputRevalidationResult {
  return Object.freeze({
    outputId: details.outputId ?? null, held: details.held ?? null,
    consistency: details.consistency ?? "NOT_EVALUATED", decision: "DENIED" as const, reasonCode,
    reasons: Object.freeze([...new Set(reasons)]),
    productionAccepted: false as const, executionAuthority: false as const, publicationAuthority: false as const,
    deliveryAuthority: false as const,
    checks: Object.freeze({ metadata: "NOT_EVALUATED", attempt: "NOT_EVALUATED", session: "NOT_EVALUATED",
      provenance: "NOT_EVALUATED", security: "NOT_EVALUATED", ...checks,
      productionAuthentication: "UNAVAILABLE", productionAuthorization: "NOT_EVALUATED",
      destinationAuthorization: "NOT_EVALUATED", classificationAuthority: "NOT_EVALUATED", delivery: "NOT_EVALUATED" }),
    observed: details.observed ? Object.freeze({ ...details.observed }) : null,
  });
}

// Internal database reader only. The repository owns acquisition and the surrounding BEGIN/COMMIT.
// No connection open, write, clock lookup, callback, issuer creation or external effect occurs here.
export function inspectHeldOutputSnapshot(db: DatabaseSync,
  ref: Readonly<{ projectId: string; authorityIncarnation: string }>,
  issuer: HostIssuerDescriptor, q: HeldOutputRevalidationRequest): HeldOutputRevalidationResult {
  const bad = (reason: string) => revalidationDenied(reason, { consistency: "FIXTURE_METADATA_INVALID" });
  if (q.expected.projectId !== ref.projectId || q.expected.authorityIncarnation !== ref.authorityIncarnation)
    return bad("OUTPUT_SCOPE_MISMATCH");
  verifySchema(db, ref);
  verifySecurityStopJournal(db, ref);
  verifyOutputHistory(db, ref);
  const raw = db.prepare("SELECT * FROM runtime_accepted_outputs WHERE outputId=?").get(q.outputId);
  if (!raw) return bad("OUTPUT_NOT_FOUND");
  const a = outputRow(AcceptedSchema, raw);
  const s = outputRow(StreamSchema, db.prepare("SELECT * FROM runtime_output_streams WHERE streamId=?").get(a.streamId));
  const opRaw = db.prepare("SELECT * FROM runtime_output_operations WHERE operationId=?").get(q.operationId);
  if (!opRaw) return bad("OUTPUT_OPERATION_NOT_FOUND");
  const op = outputRow(OperationSchema, opRaw);
  const o = outputRow(OutboxSchema, db.prepare("SELECT * FROM runtime_output_outbox WHERE outboxId=?").get(a.outboxId));
  const b = readOutputBinding(a.bindingSnapshot);
  if (s.projectId !== q.expected.projectId || s.authorityIncarnation !== q.expected.authorityIncarnation ||
      s.attemptId !== q.expected.attemptId || s.attemptGeneration !== q.expected.attemptGeneration ||
      b.applicationSessionId !== q.applicationSessionId || b.executionSessionId !== q.executionSessionId ||
      b.workspaceBindingId !== q.workspaceBindingId || b.workspaceGeneration !== q.workspaceGeneration ||
      b.producerId !== q.producerId || s.destinationId !== q.destinationId || s.channel !== q.channel)
    return bad("OUTPUT_BINDING_MISMATCH");
  if (op.operationId !== a.operationId || op.outputId !== a.outputId || op.streamId !== s.streamId ||
      op.idempotencyKey !== q.idempotencyKey || a.producerEventId !== q.producerEventId ||
      a.sequence !== q.sequence || o.outboxId !== q.outboxId || o.outputId !== a.outputId)
    return bad("OUTPUT_OPERATION_MISMATCH");

  const row = db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?").get(s.projectId, s.attemptId);
  if (!row) return bad("ATTEMPT_MISSING");
  const attempt = outputRow(AttemptSchema, row);
  verifyHistory(db, attempt);
  const e = q.expected;
  if (attempt.taskId !== e.taskId || attempt.authorityIncarnation !== e.authorityIncarnation ||
      attempt.bindingId !== q.workspaceBindingId || attempt.bindingGeneration !== q.workspaceGeneration)
    return bad("ATTEMPT_BINDING_MISMATCH");
  if (attempt.attemptGeneration !== e.attemptGeneration || attempt.attemptGeneration !== s.attemptGeneration)
    return bad("ATTEMPT_EPOCH_STALE");
  if (attempt.hostInstanceId !== e.hostInstanceId || attempt.ownerId !== e.ownerId ||
      attempt.ownerNonceHash !== hash(e.ownerNonce) || attempt.ownerId !== a.producerId)
    return bad("ATTEMPT_OWNER_MISMATCH");

  const issues: string[] = [];
  const checks: { -readonly [K in keyof RevalidationChecks]?: RevalidationChecks[K] } = { metadata: "VERIFIED", attempt: "VERIFIED" };
  if (attempt.cancellationPayload !== null || attempt.phase === "CANCELLATION_REQUESTED") issues.push("ATTEMPT_CANCELLED");
  if (isTerminal(attempt.phase) || attempt.terminalReceiptId !== null) issues.push("ATTEMPT_TERMINAL");
  if (attempt.stateVersion !== e.stateVersion || attempt.phase !== e.phase ||
      attempt.stateVersion !== b.attemptStateVersion || attempt.phase !== b.attemptPhase) issues.push("ATTEMPT_REVISION_STALE");
  if (attempt.ownerMode !== "EXECUTION" || attempt.recoveryPayload !== null || attempt.leasePayload !== null ||
      !["APPROVAL_GRANTED", "RUNNING"].includes(attempt.phase)) issues.push("ATTEMPT_LIFECYCLE_DENIED");
  if (q.atMs < a.createdAtMs || q.atMs < attempt.updatedAtMs || q.atMs >= b.expiresAtMs) issues.push("OUTPUT_BINDING_TIME_INVALID");
  if (issues.length) checks.attempt = "INVALID";

  const securityRow = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(ref.projectId);
  if (!securityRow) return revalidationDenied("SECURITY_RECORD_MISSING",
    { outputId: a.outputId, held: true, consistency: "FIXTURE_METADATA_INVALID" }, { ...checks, security: "INVALID" });
  const securityParsed = ExecutionSecuritySchema.safeParse(securityRow);
  if (!securityParsed.success || securityParsed.data.recordVersion !== 1 ||
      securityParsed.data.projectId !== ref.projectId || securityParsed.data.authorityIncarnation !== ref.authorityIncarnation)
    return revalidationDenied("SECURITY_RECORD_INVALID",
      { outputId: a.outputId, held: true, consistency: "FIXTURE_METADATA_INVALID" }, { ...checks, security: "INVALID" });
  const security = securityParsed.data;
  checks.security = security.securityState;
  if (security.securityState === "ACTIVE_STOP") issues.push("SECURITY_STOP_ACTIVE");
  if (security.securityState === "BLOCKED") issues.push("SECURITY_STATE_BLOCKED");
  if (security.securityRevision !== q.securityRevision || security.securityRevision !== a.securityRevision)
    issues.push("SECURITY_REVISION_STALE");

  const execution = ExecutionSessionSchema.safeParse(
    db.prepare("SELECT * FROM runtime_execution_sessions WHERE executionSessionId=?").get(s.executionSessionId));
  const application = ApplicationSessionBindingSchema.safeParse(
    db.prepare("SELECT * FROM runtime_application_session_bindings WHERE applicationSessionId=?").get(b.applicationSessionId));
  checks.session = "INVALID";
  if (!execution.success || !application.success) issues.push("SESSION_RECORD_INVALID");
  else {
    const sessionIssues = evaluateSessionBinding(attempt, {
      expected: e, securityRevision: q.securityRevision, executionSessionId: s.executionSessionId,
      sessionRevision: b.bindingRevision, workspaceBindingId: b.workspaceBindingId, workspaceGeneration: b.workspaceGeneration,
      action: b.action, destinationId: b.destinationId, atMs: q.atMs,
    }, execution.data, application.data, issuer);
    issues.push(...sessionIssues);
    if (application.data.generation !== b.applicationGeneration || application.data.revision !== b.applicationRevision ||
        application.data.principalId !== b.principalId || application.data.principalRevision !== b.principalRevision)
      issues.push("APPLICATION_BINDING_STALE");
    if (execution.data.bindingRevision !== b.bindingRevision) issues.push("SESSION_BINDING_STALE");
    if (sessionIssues.length === 0 && application.data.generation === b.applicationGeneration &&
        application.data.revision === b.applicationRevision && execution.data.bindingRevision === b.bindingRevision)
      checks.session = "VERIFIED";
  }
  const principal = db.prepare("SELECT * FROM runtime_principal_provenance WHERE principalId=?").get(b.principalId);
  const policy = db.prepare("SELECT * FROM runtime_policy_provenance WHERE policyId=?").get(b.policyId);
  const grant = db.prepare("SELECT * FROM runtime_grant_provenance WHERE grantId=?").get(b.grantId);
  const provenanceIssues = evaluateProvenanceRows(attempt, {
    expected: e, securityRevision: q.securityRevision, principalId: b.principalId, principalRevision: b.principalRevision,
    policyId: b.policyId, policyVersion: b.policyVersion, policyRevision: b.policyRevision, grantId: b.grantId,
    authorizationRevision: b.authorizationRevision, sourceRevision: b.provenanceSourceRevision,
    sessionId: b.executionSessionId, action: b.action, destinationId: b.destinationId, atMs: q.atMs,
  }, { principal, policy, grant });
  checks.provenance = provenanceIssues.length === 0 ? "VERIFIED" : "INVALID";
  issues.push(...provenanceIssues);
  const pol = PolicyProvenanceSchema.safeParse(policy), g = GrantProvenanceSchema.safeParse(grant);
  const reason = issues[0] ?? "SECURITY_STATE_UNKNOWN";
  return revalidationDenied(reason, {
    outputId: a.outputId, held: true, consistency: issues.length ? "FIXTURE_METADATA_INVALID" : "FIXTURE_METADATA_CONSISTENT",
    observed: { attemptVersion: attempt.stateVersion, executionEpoch: attempt.attemptGeneration,
      securityRevision: security.securityRevision, policyRevision: pol.success ? pol.data.revision : null,
      authorizationRevision: g.success ? g.data.authorizationRevision : null },
  }, checks, [...issues, "SECURITY_STATE_" + security.securityState, "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE"]);
}

