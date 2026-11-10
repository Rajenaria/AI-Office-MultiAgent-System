import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";
import { SafePositive, SafeTime, type Attempt } from "./contracts.js";
import { ReadinessRequestSchema } from "./execution-readiness.js";
import { type ProvenanceDecision } from "./provenance.js";

const Source = z.enum(["UNVERIFIED", "LOCAL_TEST_FIXTURE", "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE"]);
const common = { recordVersion: SafePositive, projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema,
  principalId: ProjectIdSchema, principalRevision: SafePositive, sourceKind: Source,
  status: z.enum(["UNKNOWN", "ACTIVE", "REVOKED"]), validFromMs: SafeTime, expiresAtMs: SafeTime };
export const ApplicationSessionBindingSchema = z.strictObject({ ...common,
  applicationSessionId: ReferenceIdSchema, generation: SafePositive, revision: SafePositive }).readonly();
export const ExecutionSessionSchema = z.strictObject({ ...common,
  executionSessionId: ReferenceIdSchema, bindingRevision: SafePositive,
  applicationSessionId: ReferenceIdSchema, applicationGeneration: SafePositive,
  attemptId: ProjectIdSchema, attemptGeneration: SafePositive,
  policyId: ProjectIdSchema, policyVersion: SafePositive, policyRevision: SafePositive,
  grantId: ProjectIdSchema, authorizationRevision: SafePositive, provenanceSourceRevision: SafePositive,
  hostIssuerId: ProjectIdSchema.nullable(), hostIssuerGeneration: SafePositive.nullable(), hostContextRevision: SafePositive,
}).readonly();
export const SessionReadinessRequestSchema = ReadinessRequestSchema.extend({
  executionSessionId: ReferenceIdSchema, sessionRevision: SafePositive,
  workspaceBindingId: ReferenceIdSchema, workspaceGeneration: SafePositive,
  action: ReferenceIdSchema, destinationId: ReferenceIdSchema, atMs: SafeTime,
});
export type SessionReadinessRequest = z.infer<typeof SessionReadinessRequestSchema>;
export type ApplicationSessionBinding = z.infer<typeof ApplicationSessionBindingSchema>;
export type ExecutionSession = z.infer<typeof ExecutionSessionSchema>;
export type SessionReason = "SESSION_MISSING" | "SESSION_RECORD_INVALID" | "APPLICATION_SESSION_MISSING" |
  "APPLICATION_SESSION_INVALID" | "SESSION_SCHEMA_UNSUPPORTED" | "SESSION_UNKNOWN" | "SESSION_REVOKED" |
  "APPLICATION_SESSION_UNKNOWN" | "APPLICATION_SESSION_REVOKED" | "SESSION_EXPIRED" | "SESSION_NOT_EFFECTIVE" |
  "SESSION_SOURCE_UNSUPPORTED" | "SESSION_PROJECT_MISMATCH" | "SESSION_INCARNATION_MISMATCH" |
  "SESSION_PRINCIPAL_MISMATCH" | "SESSION_APPLICATION_MISMATCH" | "SESSION_APPLICATION_GENERATION_MISMATCH" |
  "SESSION_PRINCIPAL_REVISION_MISMATCH" | "SESSION_ATTEMPT_MISMATCH" | "SESSION_EPOCH_MISMATCH" |
  "SESSION_REVISION_MISMATCH" | "SESSION_WORKSPACE_MISMATCH" | "HOST_BINDING_MISSING" |
  "HOST_ISSUER_MISMATCH" | "HOST_ISSUER_GENERATION_MISMATCH" | "HOST_CONTEXT_REVISION_MISMATCH" |
  "HOST_CONTEXT_MISSING" | "HOST_CONTEXT_INVALID" | "HOST_CONTEXT_EXPIRED" | "HOST_CONTEXT_NOT_EFFECTIVE" |
  "HOST_CONTEXT_BINDING_MISMATCH" | "HOST_CONTEXT_ISSUER_CLOSED" | "SESSION_NOT_EVALUATED";
export type SessionDecision = Readonly<Omit<ProvenanceDecision, "reasons"> & {
  reasons: readonly (ProvenanceDecision["reasons"][number] | SessionReason | "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE")[];
  sessionReasons: readonly SessionReason[];
  sessionStatus: "FIXTURE_SESSION_BINDING_CONSISTENT" | "SESSION_BINDING_DENIED";
  hostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE";
}>;
export function sessionDecision(base: ProvenanceDecision, issues: readonly SessionReason[]): SessionDecision {
  return Object.freeze({ ...base, eligible: false, executionAuthority: false,
    reasons: Object.freeze([...base.reasons, ...issues, "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" as const]),
    sessionReasons: Object.freeze([...new Set(issues)]),
    sessionStatus: issues.length === 0 && base.provenanceReasons.length === 0 ? "FIXTURE_SESSION_BINDING_CONSISTENT" : "SESSION_BINDING_DENIED",
    hostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" });
}
export type HostIssuerDescriptor = Readonly<{ issuerId: string; generation: number; contextRevision: number;
  sourceKind: "LOCAL_TEST_FIXTURE" }>;
export type HostBindingSnapshot = Readonly<{
  projectId: string; authorityIncarnation: string; principalId: string; principalRevision: number;
  applicationSessionId: string; applicationGeneration: number; applicationRevision: number;
  executionSessionId: string; bindingRevision: number; attemptId: string; attemptGeneration: number;
  attemptStateVersion: number; attemptPhase: string;
  workspaceBindingId: string; workspaceGeneration: number; policyId: string; policyRevision: number;
  policyVersion: number; grantId: string; authorizationRevision: number; provenanceSourceRevision: number;
  action: string; destinationId: string; issuedAtMs: number; expiresAtMs: number;
}>;
export type FixtureHostContext = Readonly<{ sourceKind: "LOCAL_TEST_FIXTURE"; executionAuthority: false }>;
export const FIXTURE_HOST_CONTEXT_LIFETIME_MS = 1000;
const issued = new WeakMap<object, { owner: object; snapshot: HostBindingSnapshot }>();
// Per-repository, private object membership. Public labels/brands/JSON never establish membership.
// A different factory instance can create only its own fixture handles, never this issuer's handles.
export function createHostIssuerForTest() {
  const owner = Object.freeze({}), descriptor: HostIssuerDescriptor = Object.freeze({ issuerId: randomUUID(),
    generation: 1, contextRevision: 1, sourceKind: "LOCAL_TEST_FIXTURE" });
  let closed = false;
  return Object.freeze({ descriptor,
    issue(snapshot: HostBindingSnapshot): FixtureHostContext {
      if (closed) throw new Error("HOST_CONTEXT_ISSUER_CLOSED");
      const handle: FixtureHostContext = Object.freeze({ sourceKind: "LOCAL_TEST_FIXTURE", executionAuthority: false });
      issued.set(handle, { owner, snapshot: Object.freeze({ ...snapshot }) }); return handle;
    },
    read(handle: unknown, atMs: number): { snapshot: HostBindingSnapshot | null; issues: readonly SessionReason[] } {
      if (handle === undefined || handle === null) return { snapshot: null, issues: ["HOST_CONTEXT_MISSING"] };
      if (typeof handle !== "object") return { snapshot: null, issues: ["HOST_CONTEXT_INVALID"] };
      const entry = issued.get(handle);
      if (!entry) return { snapshot: null, issues: ["HOST_CONTEXT_INVALID"] };
      if (entry.owner !== owner) return { snapshot: null, issues: ["HOST_ISSUER_MISMATCH"] };
      if (closed) return { snapshot: null, issues: ["HOST_CONTEXT_ISSUER_CLOSED"] };
      const issues: SessionReason[] = [];
      if (atMs < entry.snapshot.issuedAtMs) issues.push("HOST_CONTEXT_NOT_EFFECTIVE");
      if (atMs >= entry.snapshot.expiresAtMs) issues.push("HOST_CONTEXT_EXPIRED");
      return { snapshot: entry.snapshot, issues };
    },
    close(): void { closed = true; },
  });
}

export function evaluateSessionBinding(attempt: Attempt, request: SessionReadinessRequest,
  execution: ExecutionSession, application: ApplicationSessionBinding | null,
  issuer: HostIssuerDescriptor): readonly SessionReason[] {
  const issues: SessionReason[] = [];
  if (execution.recordVersion !== 1 || (application && application.recordVersion !== 1)) issues.push("SESSION_SCHEMA_UNSUPPORTED");
  if (execution.status === "UNKNOWN") issues.push("SESSION_UNKNOWN");
  if (execution.status === "REVOKED") issues.push("SESSION_REVOKED");
  if (execution.bindingRevision !== request.sessionRevision) issues.push("SESSION_REVISION_MISMATCH");
  if (execution.projectId !== attempt.projectId || (application && application.projectId !== attempt.projectId)) issues.push("SESSION_PROJECT_MISMATCH");
  if (execution.authorityIncarnation !== attempt.authorityIncarnation ||
    (application && application.authorityIncarnation !== attempt.authorityIncarnation)) issues.push("SESSION_INCARNATION_MISMATCH");
  if (execution.attemptId !== attempt.attemptId || execution.executionSessionId !== request.executionSessionId) issues.push("SESSION_ATTEMPT_MISMATCH");
  if (execution.attemptGeneration !== attempt.attemptGeneration) issues.push("SESSION_EPOCH_MISMATCH");
  if (request.workspaceBindingId !== attempt.bindingId || request.workspaceGeneration !== attempt.bindingGeneration) issues.push("SESSION_WORKSPACE_MISMATCH");
  if (execution.hostIssuerId === null || execution.hostIssuerGeneration === null) issues.push("HOST_BINDING_MISSING");
  else {
    if (execution.hostIssuerId !== issuer.issuerId) issues.push("HOST_ISSUER_MISMATCH");
    if (execution.hostIssuerGeneration !== issuer.generation) issues.push("HOST_ISSUER_GENERATION_MISMATCH");
  }
  if (execution.hostContextRevision !== issuer.contextRevision) issues.push("HOST_CONTEXT_REVISION_MISMATCH");
  for (const row of application ? [execution, application] : [execution]) {
    if (row.sourceKind !== "LOCAL_TEST_FIXTURE") issues.push("SESSION_SOURCE_UNSUPPORTED");
    if (row.expiresAtMs <= row.validFromMs) issues.push("SESSION_RECORD_INVALID");
    if (request.atMs < row.validFromMs) issues.push("SESSION_NOT_EFFECTIVE");
    if (request.atMs >= row.expiresAtMs) issues.push("SESSION_EXPIRED");
  }
  if (!application) issues.push("APPLICATION_SESSION_MISSING");
  else {
    if (application.status === "UNKNOWN") issues.push("APPLICATION_SESSION_UNKNOWN");
    if (application.status === "REVOKED") issues.push("APPLICATION_SESSION_REVOKED");
    if (application.applicationSessionId !== execution.applicationSessionId) issues.push("SESSION_APPLICATION_MISMATCH");
    if (application.generation !== execution.applicationGeneration) issues.push("SESSION_APPLICATION_GENERATION_MISMATCH");
    if (application.principalId !== execution.principalId) issues.push("SESSION_PRINCIPAL_MISMATCH");
    if (application.principalRevision !== execution.principalRevision) issues.push("SESSION_PRINCIPAL_REVISION_MISMATCH");
  }
  return Object.freeze([...new Set(issues)]);
}
export function compareHostSnapshot(current: HostBindingSnapshot, previous: HostBindingSnapshot): readonly SessionReason[] {
  // issuedAt/expiresAt are private context lifetime, not mutable caller/canonical equality fields.
  const keys = Object.keys(current).filter(key => key !== "issuedAtMs" && key !== "expiresAtMs") as (keyof HostBindingSnapshot)[];
  return keys.some(key => current[key] !== previous[key]) ? ["HOST_CONTEXT_BINDING_MISMATCH"] : [];
}
