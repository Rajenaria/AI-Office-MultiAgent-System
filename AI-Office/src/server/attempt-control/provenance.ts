import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";
import { SafePositive, SafeTime, type Attempt } from "./contracts.js";
import { ReadinessRequestSchema, type ExecutionReadiness, type ReadinessReason } from "./execution-readiness.js";

export const ProvenanceSourceSchema = z.enum(["UNVERIFIED", "LOCAL_TEST_FIXTURE",
  "PRODUCTION_AUTHORITY_UNAVAILABLE", "REVOKED", "INVALID"]);
const Status = z.enum(["UNKNOWN", "ACTIVE", "REVOKED"]);
const common = {
  recordVersion: SafePositive, projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema,
  sourceId: ReferenceIdSchema, sourceRevision: SafePositive, sourceClass: ProvenanceSourceSchema,
  status: Status, validFromMs: SafeTime, expiresAtMs: SafeTime,
};
export const PrincipalProvenanceSchema = z.strictObject({ ...common, principalId: ProjectIdSchema,
  principalKind: z.enum(["HUMAN", "SYSTEM"]), revision: SafePositive }).readonly();
export const PolicyProvenanceSchema = z.strictObject({ ...common, policyId: ProjectIdSchema,
  revision: SafePositive, policyVersion: SafePositive, action: ReferenceIdSchema,
  taskId: ReferenceIdSchema, destinationId: ReferenceIdSchema }).readonly();
export const GrantProvenanceSchema = z.strictObject({ ...common, grantId: ProjectIdSchema,
  authorizationRevision: SafePositive, principalId: ProjectIdSchema, principalRevision: SafePositive,
  policyId: ProjectIdSchema, policyRevision: SafePositive, policyVersion: SafePositive,
  sessionId: ReferenceIdSchema, attemptId: ProjectIdSchema, attemptGeneration: SafePositive,
  action: ReferenceIdSchema, taskId: ReferenceIdSchema, destinationId: ReferenceIdSchema }).readonly();
export type PrincipalProvenance = z.infer<typeof PrincipalProvenanceSchema>;
export type PolicyProvenance = z.infer<typeof PolicyProvenanceSchema>;
export type GrantProvenance = z.infer<typeof GrantProvenanceSchema>;
// IDs, versions and time below are caller expectations/fixture observations, never authentication.
export const ProvenanceRequestSchema = ReadinessRequestSchema.extend({
  principalId: ProjectIdSchema, principalRevision: SafePositive,
  policyId: ProjectIdSchema, policyVersion: SafePositive, policyRevision: SafePositive,
  grantId: ProjectIdSchema, authorizationRevision: SafePositive, sourceRevision: SafePositive,
  sessionId: ReferenceIdSchema, action: ReferenceIdSchema, destinationId: ReferenceIdSchema, atMs: SafeTime,
});
export type ProvenanceRequest = z.infer<typeof ProvenanceRequestSchema>;
type Entity = "PRINCIPAL" | "POLICY" | "GRANT";
export type ProvenanceReason = `${Entity}_${"MISSING" | "RECORD_INVALID" | "UNKNOWN" | "REVOKED" |
  "EXPIRED" | "NOT_EFFECTIVE" | "SOURCE_UNSUPPORTED" | "SOURCE_REVISION_MISMATCH" |
  "PROJECT_MISMATCH" | "INCARNATION_MISMATCH" | "REVISION_MISMATCH" | "SCHEMA_UNSUPPORTED"}` |
  "PRINCIPAL_BINDING_MISMATCH" | "POLICY_BINDING_MISMATCH" | "POLICY_VERSION_UNSUPPORTED" |
  "POLICY_VERSION_MISMATCH" | "POLICY_ACTION_MISMATCH" | "POLICY_TASK_MISMATCH" |
  "POLICY_DESTINATION_MISMATCH" | "GRANT_SESSION_MISMATCH" | "GRANT_ATTEMPT_MISMATCH" |
  "GRANT_EPOCH_MISMATCH" | "GRANT_ACTION_MISMATCH" | "GRANT_TASK_MISMATCH" |
  "GRANT_DESTINATION_MISMATCH" | "GRANT_PRINCIPAL_REVISION_MISMATCH" |
  "GRANT_POLICY_REVISION_MISMATCH" | "GRANT_POLICY_VERSION_MISMATCH" |
  "GRANT_IDENTITY_MISMATCH" | "GRANT_VALIDITY_MISMATCH" |
  "PERSISTED_PROVENANCE_INVALID" | "PROVENANCE_NOT_EVALUATED";
export type ProvenanceDecision = Readonly<Omit<ExecutionReadiness, "reasons"> & {
  reasons: readonly (ReadinessReason | ProvenanceReason | "PRODUCTION_PRINCIPAL_UNVERIFIED" | "PRODUCTION_AUTHORITY_UNAVAILABLE")[];
  provenanceReasons: readonly ProvenanceReason[];
  provenanceStatus: "FIXTURE_PROVENANCE_CONSISTENT" | "PROVENANCE_DENIED";
  principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED";
}>;
export function provenanceDecision(base: ExecutionReadiness, issues: readonly ProvenanceReason[]): ProvenanceDecision {
  return Object.freeze({ ...base, eligible: false, executionAuthority: false,
    reasons: Object.freeze([...base.reasons, ...issues, "PRODUCTION_PRINCIPAL_UNVERIFIED" as const,
      "PRODUCTION_AUTHORITY_UNAVAILABLE" as const]),
    provenanceReasons: Object.freeze([...issues]),
    provenanceStatus: issues.length === 0 ? "FIXTURE_PROVENANCE_CONSISTENT" : "PROVENANCE_DENIED",
    principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED" });
}

// Pure internal consistency checks over repository-read rows. No issuance/resolver/production trust root.
export function evaluateProvenanceRows(attempt: Attempt, request: ProvenanceRequest,
  rows: { principal: unknown; policy: unknown; grant: unknown }): readonly ProvenanceReason[] {
  const issues: ProvenanceReason[] = [];
  function decode<T>(schema: z.ZodType<T>, row: unknown, name: Entity): T | null {
    if (row === undefined) { issues.push(`${name}_MISSING`); return null; }
    const value = schema.safeParse(row);
    if (!value.success) { issues.push(`${name}_RECORD_INVALID`); return null; }
    return value.data;
  }
  function check(r: z.infer<z.ZodObject<typeof common>>, name: Entity): void {
    if (r.recordVersion !== 1) issues.push(`${name}_SCHEMA_UNSUPPORTED`);
    if (r.projectId !== attempt.projectId) issues.push(`${name}_PROJECT_MISMATCH`);
    if (r.authorityIncarnation !== attempt.authorityIncarnation) issues.push(`${name}_INCARNATION_MISMATCH`);
    if (r.sourceClass !== "LOCAL_TEST_FIXTURE" || r.sourceId !== "pi03-fixture-source-v1")
      issues.push(`${name}_SOURCE_UNSUPPORTED`);
    if (r.sourceRevision !== request.sourceRevision) issues.push(`${name}_SOURCE_REVISION_MISMATCH`);
    if (r.status === "UNKNOWN") issues.push(`${name}_UNKNOWN`);
    if (r.status === "REVOKED" || r.sourceClass === "REVOKED") issues.push(`${name}_REVOKED`);
    if (r.expiresAtMs <= r.validFromMs) issues.push(`${name}_RECORD_INVALID`);
    if (request.atMs < r.validFromMs) issues.push(`${name}_NOT_EFFECTIVE`);
    if (request.atMs >= r.expiresAtMs) issues.push(`${name}_EXPIRED`);
  }
  const p = decode(PrincipalProvenanceSchema, rows.principal, "PRINCIPAL");
  const policy = decode(PolicyProvenanceSchema, rows.policy, "POLICY");
  const grant = decode(GrantProvenanceSchema, rows.grant, "GRANT");
  if (p) {
    check(p, "PRINCIPAL");
    if (p.principalId !== request.principalId) issues.push("PRINCIPAL_BINDING_MISMATCH");
    if (p.revision !== request.principalRevision) issues.push("PRINCIPAL_REVISION_MISMATCH");
  }
  if (policy) {
    check(policy, "POLICY");
    if (policy.policyId !== request.policyId) issues.push("POLICY_BINDING_MISMATCH");
    if (policy.policyVersion !== 1) issues.push("POLICY_VERSION_UNSUPPORTED");
    if (policy.policyVersion !== request.policyVersion) issues.push("POLICY_VERSION_MISMATCH");
    if (policy.revision !== request.policyRevision) issues.push("POLICY_REVISION_MISMATCH");
    if (policy.action !== request.action) issues.push("POLICY_ACTION_MISMATCH");
    if (policy.taskId !== attempt.taskId) issues.push("POLICY_TASK_MISMATCH");
    if (policy.destinationId !== request.destinationId) issues.push("POLICY_DESTINATION_MISMATCH");
  }
  if (grant) {
    check(grant, "GRANT");
    if (grant.grantId !== request.grantId) issues.push("GRANT_IDENTITY_MISMATCH");
    if (grant.principalId !== request.principalId || (p && grant.principalId !== p.principalId)) issues.push("PRINCIPAL_BINDING_MISMATCH");
    if (grant.policyId !== request.policyId || (policy && grant.policyId !== policy.policyId)) issues.push("POLICY_BINDING_MISMATCH");
    if (p && grant.principalRevision !== p.revision) issues.push("GRANT_PRINCIPAL_REVISION_MISMATCH");
    if (policy && grant.policyRevision !== policy.revision) issues.push("GRANT_POLICY_REVISION_MISMATCH");
    if (policy && grant.policyVersion !== policy.policyVersion) issues.push("GRANT_POLICY_VERSION_MISMATCH");
    if ((p && (grant.validFromMs < p.validFromMs || grant.expiresAtMs > p.expiresAtMs)) ||
      (policy && (grant.validFromMs < policy.validFromMs || grant.expiresAtMs > policy.expiresAtMs)))
      issues.push("GRANT_VALIDITY_MISMATCH");
    if (grant.authorizationRevision !== request.authorizationRevision) issues.push("GRANT_REVISION_MISMATCH");
    if (grant.sessionId !== request.sessionId) issues.push("GRANT_SESSION_MISMATCH");
    if (grant.attemptId !== attempt.attemptId) issues.push("GRANT_ATTEMPT_MISMATCH");
    if (grant.attemptGeneration !== attempt.attemptGeneration) issues.push("GRANT_EPOCH_MISMATCH");
    if (grant.action !== request.action) issues.push("GRANT_ACTION_MISMATCH");
    if (grant.taskId !== attempt.taskId) issues.push("GRANT_TASK_MISMATCH");
    if (grant.destinationId !== request.destinationId) issues.push("GRANT_DESTINATION_MISMATCH");
  }
  return Object.freeze([...new Set(issues)]);
}
