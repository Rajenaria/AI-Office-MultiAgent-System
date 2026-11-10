import { createHash } from "node:crypto";
import { z } from "zod";
import { ContentHashSchema, ProjectIdSchema, ReferenceIdSchema } from "../../contracts/primitives.js";

export const PhaseSchema = z.enum(["CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED", "APPROVAL_DENIED",
  "LAUNCHING", "RUNNING", "CANCELLATION_REQUESTED", "COMPLETED", "FAILED", "INTERRUPTED",
  "UNCERTAIN", "RECONCILIATION_REQUIRED"]);
export type Phase = z.infer<typeof PhaseSchema>;
export const SafePositive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const SafeTime = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const ClockSchema = z.strictObject({ hostInstanceId: ProjectIdSchema, clockDomainId: ProjectIdSchema,
  wallMs: SafeTime, monotonicMs: SafeTime });
export type Clock = z.infer<typeof ClockSchema>;
export const LeaseSchema = z.strictObject({ hostInstanceId: ProjectIdSchema, clockDomainId: ProjectIdSchema,
  startedWallMs: SafeTime, startedMonoMs: SafeTime, lastWallMs: SafeTime, lastMonoMs: SafeTime,
  deadlineWallMs: SafeTime, deadlineMonoMs: SafeTime, heartbeatSequence: SafeTime,
  lastHeartbeatId: ProjectIdSchema.nullable(), lastHeartbeatDigest: ContentHashSchema.nullable(),
  status: z.enum(["ACTIVE", "QUARANTINED"]), concern: z.string().max(64).nullable() });
export type Lease = z.infer<typeof LeaseSchema>;
export const OwnerSchema = z.strictObject({ hostInstanceId: ProjectIdSchema, ownerId: ProjectIdSchema,
  ownerNonce: ContentHashSchema });
export const IdentitySchema = z.strictObject({ projectId: ProjectIdSchema, authorityIncarnation: ProjectIdSchema,
  taskId: ReferenceIdSchema, attemptId: ProjectIdSchema });
export const ExpectedSchema = IdentitySchema.extend({ attemptGeneration: SafePositive, stateVersion: SafePositive,
  phase: PhaseSchema, ...OwnerSchema.shape });
export const IssueSchema = IdentitySchema.extend({ issueRequestId: ProjectIdSchema, eventId: ProjectIdSchema,
  bindingId: ReferenceIdSchema, bindingGeneration: SafePositive, scopeDigest: ContentHashSchema,
  actionDigest: ContentHashSchema, permissionDigest: ContentHashSchema,
  runtimeRef: z.literal("s12-host-only"), executionMode: z.literal("synthetic"),
  createdAtMs: SafeTime, leaseClock: ClockSchema.optional(), ...OwnerSchema.shape });
export const ReceiptSchema = z.strictObject({ receiptId: ProjectIdSchema,
  reason: z.enum(["NORMAL", "CANCELLED", "TIMED_OUT", "START_FAILED", "UNEXPECTED", "CONTROLLER_RECONCILED", "DENIED"]),
  closureDigest: ContentHashSchema, resultDigest: ContentHashSchema });
export const TransitionSchema = z.strictObject({ expected: ExpectedSchema, target: PhaseSchema,
  eventId: ProjectIdSchema, atMs: SafeTime, clock: ClockSchema.optional(), authorization: z.literal("s12-test-only") });
export const TerminalSchema = TransitionSchema.extend({ receipt: ReceiptSchema });
export const FenceSchema = z.strictObject({ expected: ExpectedSchema, newOwner: OwnerSchema,
  eventId: ProjectIdSchema, atMs: SafeTime, testRecoveryGrantId: ProjectIdSchema,
  authorization: z.literal("s12-test-only") });
export const AttemptSchema = IdentitySchema.extend({ issueRequestId: ProjectIdSchema, issueDigest: ContentHashSchema,
  bindingId: ReferenceIdSchema, bindingGeneration: SafePositive, scopeDigest: ContentHashSchema,
  actionDigest: ContentHashSchema, permissionDigest: ContentHashSchema, runtimeRef: z.literal("s12-host-only"),
  executionMode: z.literal("synthetic"), createdAtMs: SafeTime, updatedAtMs: SafeTime,
  attemptGeneration: SafePositive, stateVersion: SafePositive, phase: PhaseSchema,
  hostInstanceId: ProjectIdSchema, ownerId: ProjectIdSchema, ownerNonceHash: ContentHashSchema,
  ownerMode: z.enum(["EXECUTION", "RECOVERY"]), conflictHeld: z.literal(1),
  terminalReceiptId: ProjectIdSchema.nullable(), terminalDigest: ContentHashSchema.nullable(),
  terminalPayload: z.string().max(4096).nullable(), leasePayload: z.string().max(4096).nullable().default(null),
  cancellationPayload: z.string().max(8192).nullable().default(null),
  recoveryPayload: z.string().max(8192).nullable().default(null) }).readonly();
export type Attempt = z.infer<typeof AttemptSchema>;
export type Expected = z.infer<typeof ExpectedSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Terminal = z.infer<typeof TerminalSchema>;
export type Fence = z.infer<typeof FenceSchema>;
export type FailureCode = "VALIDATION" | "IDENTITY_CONFLICT" | "CONFLICT" | "STALE_OWNER" |
  "INVALID_TRANSITION" | "TERMINAL_CONFLICT" | "INTEGRITY" | "SCHEMA" | "UNSAFE_STORAGE" |
  "DATABASE_BUSY" | "DATABASE_FAILURE" | "FAULT" | "LEASE_INVALID" | "AUTHORITY_INVALID" | "CANCELLATION_INVALID" | "RECOVERY_REQUIRED" |
  "SECURITY_REVISION_CONFLICT" | "SECURITY_IDEMPOTENCY_CONFLICT" | "SECURITY_STOP_ALREADY_ACTIVE";
export class AuthorityFailure extends Error {
  readonly sqlite: { primary: number; extended: number; description: string } | null;
  constructor(readonly code: FailureCode, options?: ErrorOptions) {
    super(code, options); this.name = "AuthorityFailure";
    const cause = options?.cause;
    const extended = cause instanceof Error && "errcode" in cause ? Number(cause.errcode) : NaN;
    this.sqlite = Number.isInteger(extended) ? { primary: extended & 255, extended,
      description: cause instanceof Error && "errstr" in cause ? String(cause.errstr) : "" } : null;
  }
}
export function requireAuthority(ok: unknown, code: FailureCode): asserts ok {
  if (!ok) throw new AuthorityFailure(code);
}
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AuthorityFailure("VALIDATION");
  return result.data;
}
export function databaseError(error: unknown): AuthorityFailure {
  if (error instanceof AuthorityFailure) return error;
  const code = error instanceof Error && "errcode" in error ? Number(error.errcode) & 255 : 0;
  return new AuthorityFailure(code === 5 || code === 6 ? "DATABASE_BUSY" : "DATABASE_FAILURE", { cause: error });
}
export const hash = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");
// Fixed-order array encodings are versioned; callers provide only schema-parsed fields.
export const semanticDigest = (parts: readonly unknown[]): string => hash(JSON.stringify([1, ...parts]));
export function assertOne(changes: number | bigint): void {
  requireAuthority(changes !== 0 && changes !== 0n, "CONFLICT");
  requireAuthority(changes === 1 || changes === 1n, "INTEGRITY");
}
export const nextInteger = (n: number): number => { requireAuthority(n < Number.MAX_SAFE_INTEGER, "INTEGRITY"); return n + 1; };
export function issuanceDigest(input: Omit<Issue, "eventId" | "createdAtMs" | "ownerNonce"> & { ownerNonceHash: string; leasePayload?: string | null }): string {
  const lease = input.leasePayload ? parse(LeaseSchema, JSON.parse(input.leasePayload)) : null;
  const origin = input.leaseClock ? [input.leaseClock.hostInstanceId, input.leaseClock.clockDomainId, input.leaseClock.wallMs, input.leaseClock.monotonicMs] :
    lease ? [lease.hostInstanceId, lease.clockDomainId, lease.startedWallMs, lease.startedMonoMs] : null;
  return semanticDigest([input.projectId, input.authorityIncarnation, input.taskId, input.attemptId, input.issueRequestId,
    input.bindingId, input.bindingGeneration, input.scopeDigest, input.actionDigest, input.permissionDigest,
    input.runtimeRef, input.executionMode, input.hostInstanceId, input.ownerId, input.ownerNonceHash, origin]);
}
