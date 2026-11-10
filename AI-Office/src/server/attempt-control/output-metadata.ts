import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema, ContentHashSchema } from "../../contracts/primitives.js";
import { ExpectedSchema, PhaseSchema, SafePositive, SafeTime, semanticDigest } from "./contracts.js";

const Id = ProjectIdSchema.refine(v => v === v.toLowerCase());
export const OUTPUT_LIMITS = Object.freeze({ streams: 128, outputsPerStream: 4096 });
export const OutputChannelSchema = z.enum(["fixture.metadata", "fixture.diagnostic"]);
const Classification = z.enum(["UNVERIFIED", "PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
export const HeldOutputCommandSchema = z.strictObject({
  recordVersion: z.literal(1), expected: ExpectedSchema, expectedSecurityRevision: SafePositive,
  executionSessionId: ReferenceIdSchema, expectedBindingRevision: SafePositive,
  expectedApplicationGeneration: SafePositive, expectedApplicationRevision: SafePositive,
  expectedPrincipalRevision: SafePositive, policyId: Id, policyVersion: SafePositive, policyRevision: SafePositive,
  grantId: Id, authorizationRevision: SafePositive, provenanceSourceRevision: SafePositive,
  expectedStream: z.strictObject({ streamId: Id.nullable(), revision: SafeTime, lastAccepted: SafeTime }),
  operationId: Id, idempotencyKey: ReferenceIdSchema, outputId: Id, producerId: Id, producerEventId: ReferenceIdSchema,
  destinationId: ReferenceIdSchema, channel: OutputChannelSchema, sequence: SafePositive,
  confidentiality: Classification,
  claim: z.strictObject({ claimKey: ContentHashSchema, grantId: Id, authorizationRevision: SafePositive }).nullable(),
  atMs: SafeTime,
});
export type HeldOutputCommand = z.infer<typeof HeldOutputCommandSchema>;
export const OutputLookupSchema = z.strictObject({ expected: ExpectedSchema, operationId: Id });
export const BindingSchema = z.strictObject({
  projectId: Id, authorityIncarnation: Id, principalId: Id, principalRevision: SafePositive,
  applicationSessionId: ReferenceIdSchema, applicationGeneration: SafePositive, applicationRevision: SafePositive,
  executionSessionId: ReferenceIdSchema, bindingRevision: SafePositive, attemptId: Id, attemptGeneration: SafePositive,
  attemptStateVersion: SafePositive, attemptPhase: PhaseSchema, workspaceBindingId: ReferenceIdSchema, workspaceGeneration: SafePositive,
  policyId: Id, policyRevision: SafePositive, policyVersion: SafePositive, grantId: Id, authorizationRevision: SafePositive,
  provenanceSourceRevision: SafePositive, action: ReferenceIdSchema, destinationId: ReferenceIdSchema,
  issuedAtMs: SafeTime, expiresAtMs: SafeTime, producerId: Id, channel: OutputChannelSchema,
}).readonly();
export type OutputBinding = z.infer<typeof BindingSchema>;
const bindingKeys = ["projectId","authorityIncarnation","principalId","principalRevision","applicationSessionId",
  "applicationGeneration","applicationRevision","executionSessionId","bindingRevision","attemptId","attemptGeneration",
  "attemptStateVersion","attemptPhase","workspaceBindingId","workspaceGeneration","policyId","policyRevision","policyVersion",
  "grantId","authorizationRevision","provenanceSourceRevision","action","destinationId","issuedAtMs","expiresAtMs","producerId","channel"] as const;
export const bindingDigest = (b: OutputBinding) => semanticDigest(bindingKeys.map(k => b[k]));
export const StreamSchema = z.strictObject({
  streamId: Id, projectId: Id, authorityIncarnation: Id, attemptId: Id, attemptGeneration: SafePositive,
  executionSessionId: ReferenceIdSchema, destinationId: ReferenceIdSchema, channel: OutputChannelSchema,
  lastAccepted: SafeTime, revision: SafeTime, createdAtMs: SafeTime,
});
export type OutputStream = z.infer<typeof StreamSchema>;
export const AcceptedSchema = z.strictObject({
  outputId: Id, operationId: Id, outboxId: Id, streamId: Id, recordVersion: z.literal(1), sequence: SafePositive,
  producerId: Id, producerEventId: ReferenceIdSchema, recordClass: z.literal("OFFLINE_CONTRACT_ONLY"),
  confidentiality: Classification, classificationSource: z.enum(["UNVERIFIED","OFFLINE_SUPPLIED"]), classificationDigest: z.null(),
  bindingSnapshot: z.string().max(16384), bindingDigest: ContentHashSchema,
  payloadReference: z.null(), payloadDigest: ContentHashSchema, payloadByteLength: z.literal(0),
  attemptStateVersion: SafePositive, securityRevision: SafePositive, principalRevision: SafePositive,
  applicationGeneration: SafePositive, applicationRevision: SafePositive, sessionBindingRevision: SafePositive,
  policyId: Id, policyVersion: SafePositive, policyRevision: SafePositive, grantId: Id,
  authorizationRevision: SafePositive, provenanceSourceRevision: SafePositive, createdAtMs: SafeTime,
});
export type HeldAccepted = z.infer<typeof AcceptedSchema>;
export const OperationSchema = z.strictObject({
  operationId: Id, streamId: Id, idempotencyKey: ReferenceIdSchema, requestDigest: ContentHashSchema,
  outputId: Id, claimKey: ContentHashSchema.nullable(), createdAtMs: SafeTime,
});
export const ClaimSchema = z.strictObject({ claimKey: ContentHashSchema, operationId: Id, grantId: Id,
  authorizationRevision: SafePositive, claimedAtMs: SafeTime });
export const OutboxSchema = z.strictObject({
  outboxId: Id, outputId: Id, state: z.literal("HELD"), rowRevision: z.literal(1), lastEventId: Id,
  holdReason: z.literal("AUTHORITY_UNAVAILABLE"), createdAtMs: SafeTime, updatedAtMs: SafeTime,
});
export type HeldOutbox = z.infer<typeof OutboxSchema>;
export const EventSchema = z.strictObject({
  eventId: Id, outboxId: Id, rowRevision: z.literal(1), eventType: z.literal("OFFLINE_HELD_RECORDED"),
  priorState: z.null(), newState: z.literal("HELD"), reasonCode: z.literal("AUTHORITY_UNAVAILABLE"),
  atMs: SafeTime, snapshotDigest: ContentHashSchema, previousEventId: z.null(), previousDigest: z.null(), eventDigest: ContentHashSchema,
});
export type OutputEvent = z.infer<typeof EventSchema>;
type LogicalFields = Pick<HeldAccepted, "outputId"|"producerId"|"producerEventId"|"sequence"|"confidentiality"|
  "principalRevision"|"applicationGeneration"|"applicationRevision"|"sessionBindingRevision"|"policyId"|"policyVersion"|
  "policyRevision"|"grantId"|"authorizationRevision"|"provenanceSourceRevision">;
export function logicalFields(q: HeldOutputCommand): LogicalFields {
  return { outputId:q.outputId, producerId:q.producerId, producerEventId:q.producerEventId, sequence:q.sequence,
    confidentiality:q.confidentiality, principalRevision:q.expectedPrincipalRevision, applicationGeneration:q.expectedApplicationGeneration,
    applicationRevision:q.expectedApplicationRevision, sessionBindingRevision:q.expectedBindingRevision,
    policyId:q.policyId, policyVersion:q.policyVersion, policyRevision:q.policyRevision, grantId:q.grantId,
    authorizationRevision:q.authorizationRevision, provenanceSourceRevision:q.provenanceSourceRevision };
}
// Caller raw bytes/digests/references are not accepted. This encodes non-sensitive fixture metadata only.
export function outputRequestDigest(s: Pick<OutputStream,"projectId"|"authorityIncarnation"|"attemptId"|"attemptGeneration"|
  "executionSessionId"|"destinationId"|"channel">, f: LogicalFields, b: OutputBinding, claimKey: string | null): string {
  return semanticDigest(["OFFLINE_HELD_OUTPUT_V1",s.projectId,s.authorityIncarnation,s.attemptId,s.attemptGeneration,
    s.executionSessionId,s.destinationId,s.channel,f.outputId,f.producerId,f.producerEventId,f.sequence,f.confidentiality,
    f.confidentiality==="UNVERIFIED"?"UNVERIFIED":"OFFLINE_SUPPLIED",null,
    b.principalId,f.principalRevision,b.applicationSessionId,f.applicationGeneration,f.applicationRevision,
    f.sessionBindingRevision,f.policyId,f.policyVersion,f.policyRevision,f.grantId,f.authorizationRevision,
    f.provenanceSourceRevision,claimKey]);
}
export const metadataDigest = (requestDigest: string) => semanticDigest(["FIXTURE_METADATA_V1",requestDigest]);
export const projectionDigest = (o: HeldOutbox, a: HeldAccepted, requestDigest: string) =>
  semanticDigest(["HELD_PROJECTION_V1",o.outboxId,o.outputId,o.state,o.rowRevision,o.holdReason,o.createdAtMs,o.updatedAtMs,a.bindingDigest,requestDigest]);
export const outputEventDigest = (e: Omit<OutputEvent,"eventDigest">) =>
  semanticDigest([e.eventId,e.outboxId,e.rowRevision,e.eventType,e.priorState,e.newState,e.reasonCode,e.atMs,e.snapshotDigest,e.previousEventId,e.previousDigest]);
export const OUTPUT_TABLES = ["runtime_output_streams","runtime_output_operations","runtime_output_grant_claims",
  "runtime_accepted_outputs","runtime_output_outbox","runtime_output_events"] as const;
export type OutputTable = typeof OUTPUT_TABLES[number];
export type OutputFaultStage = "none"|"afterSequence"|"afterOperation"|"afterClaim"|"afterMetadata"|"afterOutbox"|"auditWrite"|
  "afterAudit"|"constraint"|"beforeCommit"|"afterCommit"|"rollbackFailure";
export type TransactionObservation = { commitAttempted: boolean; committed: boolean; rolledBack: boolean };
export class OutputFailure extends Error {
  constructor(readonly code: "OUTPUT_INVALID_REQUEST"|"OUTPUT_FIXTURE_REQUIRED"|"OUTPUT_CONFLICT"|"OUTPUT_SCOPE_DENIED"|
    "OUTPUT_INTEGRITY"|"OUTPUT_LIMIT"|"OUTPUT_SECURITY_DENIED"|"OUTPUT_CANCELLED") { super(code); }
}
export function outputRequire(ok: unknown, code: ConstructorParameters<typeof OutputFailure>[0]): asserts ok {
  if (!ok) throw new OutputFailure(code);
}
// Reject accessors instead of invoking them during parsing. Not a sandbox for hostile same-realm Proxy traps.
export function inertOutputInput(input: unknown): unknown {
  let nodes=0; const seen=new Set<object>();
  function copy(v: unknown, depth: number): unknown {
    if(++nodes>256 || depth>6) throw new OutputFailure("OUTPUT_INVALID_REQUEST");
    if(v===null || typeof v==="string" && v.length<=256 || typeof v==="boolean" || typeof v==="number" && Number.isSafeInteger(v)) return v;
    if(typeof v!=="object" || seen.has(v) || (Object.getPrototypeOf(v)!==Object.prototype && Object.getPrototypeOf(v)!==null)) throw new OutputFailure("OUTPUT_INVALID_REQUEST");
    seen.add(v); const result: Record<string,unknown>={};
    for(const [key,d] of Object.entries(Object.getOwnPropertyDescriptors(v))){
      if(!("value" in d) || key==="__proto__" || key.length>128) throw new OutputFailure("OUTPUT_INVALID_REQUEST");
      Object.defineProperty(result,key,{value:copy(d.value,depth+1),enumerable:true});
    }
    return result;
  }
  return copy(input,0);
}
const flags = { productionAccepted:false, executionAuthority:false, publicationAuthority:false, deliveryAuthority:false } as const;
export const outputDenied = (reasonCode: string, unknownCommit=false) => Object.freeze({
  ...flags, outcome: unknownCommit?"COMMIT_OUTCOME_UNKNOWN" as const:"OUTPUT_DENIED" as const, reasonCode,
});
export function heldReceipt(a: HeldAccepted,s: OutputStream, replay:boolean) {
  return Object.freeze({ ...flags, outcome: replay?"FIXTURE_HELD_METADATA_REPLAY" as const:"FIXTURE_HELD_METADATA_COMMITTED" as const,
    recordClass:a.recordClass, recordVersion:1 as const,state:"HELD" as const,payloadReference:null,
    operationId:a.operationId,outputId:a.outputId,outboxId:a.outboxId,streamId:a.streamId,sequence:a.sequence,
    executionEpoch:s.attemptGeneration,runIncarnationId:s.executionSessionId,bindingDigest:a.bindingDigest,metadataDigest:a.payloadDigest });
}
export type HeldOutputResult = ReturnType<typeof heldReceipt> | ReturnType<typeof outputDenied>;
