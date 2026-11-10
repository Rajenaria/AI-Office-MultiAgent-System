import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "./primitives.js";

/** Pure, transport-independent predicates. Supplied evidence is NOT authenticated.
 * A trusted future host must independently source/revalidate every assertion and
 * atomically enforce current state at dispatch/publication. Eligibility is never
 * a capability, clearance, tool permission, OS proof, or permission to execute.
 * Inputs are bounded JSON-like data; no content/credentials belong in this API.
 */
const Ref = ReferenceIdSchema;
const Integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const Positive = Integer.min(1);
const IdentitySchema = z.strictObject({
  projectId: ProjectIdSchema, sessionId: Ref, ownerId: Ref,
  runId: Ref, workerId: Ref, taskScope: Ref,
});
const ScopeSchema = IdentitySchema.pick({ projectId: true, sessionId: true, ownerId: true });
const EvidenceSchema = z.strictObject({
  evidenceId: Ref, identity: IdentitySchema, epoch: Positive, policyVersion: Ref,
  issuedAtMs: Integer, expiresAtMs: Integer,
});
const AssertionSchema = z.strictObject({
  status: z.enum(["VERIFIED", "MISSING", "UNKNOWN", "REVOKED"]),
  evidence: EvidenceSchema.nullable(),
});
const SecurityStopSchema = z.strictObject({
  state: z.enum(["ACTIVE", "UNKNOWN", "INVALID", "CLEARED"]),
  clearance: EvidenceSchema.nullable(),
});
const LifecycleSchema = z.enum([
  "CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED", "APPROVAL_DENIED",
  "LAUNCHING", "RUNNING", "CANCELLATION_REQUESTED", "CANCELLED", "COMPLETED",
  "FAILED", "INTERRUPTED", "UNCERTAIN", "RECONCILIATION_REQUIRED",
]);
const ClassificationSchema = z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
const CommonContextSchema = z.strictObject({
  identity: IdentitySchema, epoch: Positive, policyVersion: Ref, nowMs: Integer,
  lifecycle: LifecycleSchema,
  cancellation: z.enum(["CLEAR", "REQUESTED", "ACKNOWLEDGED", "UNKNOWN"]),
  authorization: AssertionSchema, securityStop: SecurityStopSchema,
});
const AdmissionRequestSchema = z.strictObject({
  requestId: Ref, identity: IdentitySchema, epoch: Positive, policyVersion: Ref,
  workerType: Ref, providerId: Ref.nullable(),
});
const AdmissionContextSchema = CommonContextSchema.extend({
  containment: AssertionSchema, outputFence: AssertionSchema,
  provider: z.strictObject({
    providerId: Ref, permission: AssertionSchema,
    entitlement: AssertionSchema, billing: AssertionSchema,
  }).nullable(),
});
const DestinationSchema = z.strictObject({
  destinationId: Ref, ...ScopeSchema.shape,
  channels: z.array(Ref).min(1).max(32),
  classifications: z.array(ClassificationSchema).min(1).max(4),
});
const SecurityPolicySchema = z.strictObject({
  policyId: Ref, version: Ref, status: z.enum(["ACTIVE", "DISABLED", "UNKNOWN"]),
  validFromMs: Integer, expiresAtMs: Integer, scope: ScopeSchema,
  admission: z.strictObject({
    enabled: z.boolean(), workerTypes: z.array(Ref).max(32), taskScopes: z.array(Ref).max(128),
  }),
  publication: z.strictObject({
    enabled: z.boolean(), sequenceRequired: z.boolean(),
    destinations: z.array(DestinationSchema).max(128),
  }),
  providers: z.array(z.strictObject({
    providerId: Ref, permission: z.enum(["ALLOWED", "DENIED", "UNKNOWN"]),
    entitlementRequired: z.boolean(), billingRequired: z.boolean(),
  })).max(32),
}).superRefine((p, ctx) => {
  // Ambiguous duplicate rules must not acquire authority through array order.
  for (const ids of [p.providers.map(v => v.providerId), p.publication.destinations.map(v => v.destinationId)]) {
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Duplicate rule" });
  }
});
const OutputEnvelopeSchema = z.strictObject({
  outputId: Ref, identity: IdentitySchema, epoch: Positive, policyVersion: Ref,
  destinationId: Ref, channel: Ref, classification: ClassificationSchema,
  sequence: Integer.nullable(),
});
const PublicationContextSchema = CommonContextSchema.extend({
  destinationId: Ref,
  sequence: z.strictObject({
    min: Integer, max: Integer, lastAccepted: Integer.nullable(),
    seenOutputIds: z.array(Ref).max(4096),
  }),
});

export type AdmissionRequest = z.infer<typeof AdmissionRequestSchema>;
export type AdmissionContext = z.infer<typeof AdmissionContextSchema>;
export type SecurityPolicy = z.infer<typeof SecurityPolicySchema>;
export type OutputEnvelope = z.infer<typeof OutputEnvelopeSchema>;
export type PublicationContext = z.infer<typeof PublicationContextSchema>;
export type LifecycleState = z.infer<typeof LifecycleSchema>;
export type SuppliedEvidence = z.infer<typeof EvidenceSchema>;
export type SecurityStop = z.infer<typeof SecurityStopSchema>;
export type DenialReason =
  | "INVALID_REQUEST" | "INVALID_OUTPUT" | "INVALID_CONTEXT" | "INVALID_POLICY"
  | "SECURITY_STOP_ACTIVE" | "SECURITY_STOP_UNKNOWN" | "SECURITY_STOP_INVALID" | "CLEARANCE_INVALID"
  | "POLICY_INACTIVE" | "POLICY_EXPIRED" | "POLICY_VERSION_CONFLICT" | "OWNERSHIP_CONFLICT"
  | "RUN_CONFLICT" | "WORKER_CONFLICT" | "TASK_SCOPE_DENIED" | "STALE_EPOCH"
  | "CANCELLED" | "TERMINAL" | "LIFECYCLE_DENIED" | "AUTHORIZATION_INVALID"
  | "ADMISSION_DISABLED" | "WORKER_TYPE_DENIED" | "CONTAINMENT_INVALID" | "OUTPUT_FENCE_INVALID"
  | "PROVIDER_DENIED" | "ENTITLEMENT_INVALID" | "BILLING_INVALID"
  | "PUBLICATION_DISABLED" | "DESTINATION_DENIED" | "CHANNEL_DENIED" | "CONFIDENTIALITY_DENIED"
  | "SEQUENCE_REQUIRED" | "SEQUENCE_INVALID" | "DUPLICATE_OUTPUT";
export type DecisionResult<Eligible extends string> = Readonly<{
  outcome: "DENIED"; reason: DenialReason; executionAuthority: false;
}> | Readonly<{
  outcome: Eligible; reason: "SUPPLIED_INPUTS_SATISFY_CONTRACT"; executionAuthority: false;
}>;
export type AdmissionDecision = DecisionResult<"ELIGIBLE_FOR_ADMISSION">;
export type PublicationDecision = DecisionResult<"ELIGIBLE_FOR_PUBLICATION">;

type Identity = z.infer<typeof IdentitySchema>;
type Context = z.infer<typeof CommonContextSchema>;
type Assertion = z.infer<typeof AssertionSchema>;
const denied = (reason: DenialReason) => ({ outcome: "DENIED", reason, executionAuthority: false } as const);
const inWindow = (start: number, end: number, now: number): boolean => start <= now && now < end;
function sameScope(a: z.infer<typeof ScopeSchema>, b: z.infer<typeof ScopeSchema>): boolean {
  return a.projectId === b.projectId && a.sessionId === b.sessionId && a.ownerId === b.ownerId;
}
function sameIdentity(a: Identity, b: Identity): boolean {
  return sameScope(a, b) && a.runId === b.runId && a.workerId === b.workerId && a.taskScope === b.taskScope;
}
function evidenceValid(e: SuppliedEvidence | null, c: Context): boolean {
  return e !== null && sameIdentity(e.identity, c.identity) && e.epoch === c.epoch &&
    e.policyVersion === c.policyVersion && inWindow(e.issuedAtMs, e.expiresAtMs, c.nowMs);
}
function assertionValid(a: Assertion, c: Context): boolean {
  return a.status === "VERIFIED" && evidenceValid(a.evidence, c);
}
function commonReason(input: { identity: Identity; epoch: number; policyVersion: string }, c: Context,
  p: SecurityPolicy): DenialReason | null {
  if (c.securityStop.state === "ACTIVE") return "SECURITY_STOP_ACTIVE";
  if (c.securityStop.state === "UNKNOWN") return "SECURITY_STOP_UNKNOWN";
  if (c.securityStop.state === "INVALID") return "SECURITY_STOP_INVALID";
  if (!evidenceValid(c.securityStop.clearance, c)) return "CLEARANCE_INVALID";
  if (p.status !== "ACTIVE") return "POLICY_INACTIVE";
  if (!inWindow(p.validFromMs, p.expiresAtMs, c.nowMs)) return "POLICY_EXPIRED";
  if (p.version !== c.policyVersion || input.policyVersion !== c.policyVersion) return "POLICY_VERSION_CONFLICT";
  if (!sameScope(input.identity, c.identity) || !sameScope(p.scope, c.identity)) return "OWNERSHIP_CONFLICT";
  if (input.identity.runId !== c.identity.runId) return "RUN_CONFLICT";
  if (input.identity.workerId !== c.identity.workerId) return "WORKER_CONFLICT";
  if (input.identity.taskScope !== c.identity.taskScope) return "TASK_SCOPE_DENIED";
  if (input.epoch !== c.epoch) return "STALE_EPOCH";
  if (c.cancellation !== "CLEAR" || c.lifecycle === "CANCELLATION_REQUESTED") return "CANCELLED";
  if (["CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"].includes(c.lifecycle)) return "TERMINAL";
  if (!assertionValid(c.authorization, c)) return "AUTHORIZATION_INVALID";
  return null;
}

/** Unknown/missing fields deny; no parse errors or untrusted values are returned.
 * Exception boundary also withholds hostile accessor/proxy errors. Accessors
 * themselves cannot be sandboxed by JavaScript: supply inert JSON-like data.
 */
export function evaluateWorkerAdmission(request: unknown, context: unknown, policy: unknown): AdmissionDecision {
  try {
    const r = AdmissionRequestSchema.safeParse(request);
    if (!r.success) return denied("INVALID_REQUEST");
    const c = AdmissionContextSchema.safeParse(context);
    if (!c.success) return denied("INVALID_CONTEXT");
    const p = SecurityPolicySchema.safeParse(policy);
    if (!p.success) return denied("INVALID_POLICY");
    const reason = commonReason(r.data, c.data, p.data);
    if (reason) return denied(reason);
    if (c.data.lifecycle !== "APPROVAL_GRANTED") return denied("LIFECYCLE_DENIED");
    if (!p.data.admission.enabled) return denied("ADMISSION_DISABLED");
    if (!p.data.admission.workerTypes.includes(r.data.workerType)) return denied("WORKER_TYPE_DENIED");
    if (!p.data.admission.taskScopes.includes(r.data.identity.taskScope)) return denied("TASK_SCOPE_DENIED");
    if (!assertionValid(c.data.containment, c.data)) return denied("CONTAINMENT_INVALID");
    if (!assertionValid(c.data.outputFence, c.data)) return denied("OUTPUT_FENCE_INVALID");
    if (r.data.providerId !== null) {
      const rule = p.data.providers.find(v => v.providerId === r.data.providerId);
      const supplied = c.data.provider;
      if (!rule || rule.permission !== "ALLOWED" || !supplied || supplied.providerId !== rule.providerId ||
          !assertionValid(supplied.permission, c.data)) return denied("PROVIDER_DENIED");
      if (rule.entitlementRequired && !assertionValid(supplied.entitlement, c.data)) return denied("ENTITLEMENT_INVALID");
      if (rule.billingRequired && !assertionValid(supplied.billing, c.data)) return denied("BILLING_INVALID");
    } else if (c.data.provider !== null) return denied("PROVIDER_DENIED");
    return { outcome: "ELIGIBLE_FOR_ADMISSION", reason: "SUPPLIED_INPUTS_SATISFY_CONTRACT", executionAuthority: false };
  } catch { return denied("INVALID_REQUEST"); }
}

/** Metadata-only output decision; never reads/redacts/releases payload content.
 * Sequence checks use caller-supplied history, NOT durable deduplication or CAS.
 * No terminal-event exception; all terminal output is denied.
 */
export function evaluateOutputPublication(output: unknown, executionContext: unknown, policy: unknown): PublicationDecision {
  try {
    const o = OutputEnvelopeSchema.safeParse(output);
    if (!o.success) return denied("INVALID_OUTPUT");
    const c = PublicationContextSchema.safeParse(executionContext);
    if (!c.success) return denied("INVALID_CONTEXT");
    const p = SecurityPolicySchema.safeParse(policy);
    if (!p.success) return denied("INVALID_POLICY");
    const reason = commonReason(o.data, c.data, p.data);
    if (reason) return denied(reason);
    if (c.data.lifecycle !== "RUNNING") return denied("LIFECYCLE_DENIED");
    if (!p.data.publication.enabled) return denied("PUBLICATION_DISABLED");
    const d = p.data.publication.destinations.find(v => v.destinationId === o.data.destinationId);
    if (!d || c.data.destinationId !== d.destinationId || !sameScope(d, c.data.identity)) return denied("DESTINATION_DENIED");
    if (!d.channels.includes(o.data.channel)) return denied("CHANNEL_DENIED");
    if (!d.classifications.includes(o.data.classification)) return denied("CONFIDENTIALITY_DENIED");
    const s = c.data.sequence;
    if (s.min > s.max || (s.lastAccepted !== null && (s.lastAccepted < s.min || s.lastAccepted > s.max))) return denied("SEQUENCE_INVALID");
    if (s.seenOutputIds.includes(o.data.outputId)) return denied("DUPLICATE_OUTPUT");
    if (p.data.publication.sequenceRequired && o.data.sequence === null) return denied("SEQUENCE_REQUIRED");
    if (o.data.sequence !== null) {
      if (o.data.sequence < s.min || o.data.sequence > s.max ||
          (s.lastAccepted === null ? o.data.sequence !== s.min :
            s.lastAccepted === Number.MAX_SAFE_INTEGER || o.data.sequence !== s.lastAccepted + 1)) return denied("SEQUENCE_INVALID");
    }
    return { outcome: "ELIGIBLE_FOR_PUBLICATION", reason: "SUPPLIED_INPUTS_SATISFY_CONTRACT", executionAuthority: false };
  } catch { return denied("INVALID_OUTPUT"); }
}
