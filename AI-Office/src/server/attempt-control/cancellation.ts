import { z } from "zod";
import { ContentHashSchema, ProjectIdSchema } from "../../contracts/primitives.js";
import { ClockSchema, ExpectedSchema, SafePositive, SafeTime, hash, parse, requireAuthority, semanticDigest,
  type Attempt, type Expected } from "./contracts.js";
import { assertExpected, isTerminal } from "./state-machine.js";
import { assertLeaseActive } from "./lease.js";

export type HostAuthority = Readonly<{ source: "synthetic-trusted-host" }>;
const authorities = new WeakMap<HostAuthority, string>();
function ownerKey(a: Attempt): string { return semanticDigest([a.projectId, a.authorityIncarnation, a.taskId, a.attemptId,
  a.attemptGeneration, a.hostInstanceId, a.ownerId, a.ownerNonceHash]); }
// Host-test possession capability only. Caller must know the current owner nonce;
// every repository mutation repeats owner/CAS checks against persisted state.
export function mintHostAuthorityForTest(current: Attempt, expected: Expected, clock: unknown): HostAuthority {
  assertExpected(current, expected);
  if (!isTerminal(current.phase)) assertLeaseActive(current, clock, parse(ClockSchema, clock).wallMs);
  requireAuthority(current.leasePayload !== null, "AUTHORITY_INVALID");
  const capability = Object.freeze({ source: "synthetic-trusted-host" as const });
  authorities.set(capability, ownerKey(current)); return capability;
}
export function assertHostAuthority(current: Attempt, expected: Expected, authority: HostAuthority | undefined): void {
  requireAuthority(authority && authorities.get(authority) === ownerKey(current), "AUTHORITY_INVALID");
  assertExpected(current, { ...expected, stateVersion: current.stateVersion, phase: current.phase });
}
export const CancellationRequestSchema = z.strictObject({ expected: ExpectedSchema, clock: ClockSchema,
  eventId: ProjectIdSchema, requestId: ProjectIdSchema, decisionId: ProjectIdSchema,
  reason: z.enum(["OWNER_CANCELLED", "TIMED_OUT"]), authorization: z.literal("s12-test-only") });
export const AckSchema = z.strictObject({ ackId: ProjectIdSchema, requestId: ProjectIdSchema, attemptGeneration: SafePositive,
  hostInstanceId: ProjectIdSchema, invocationNonce: ProjectIdSchema, evidenceDigest: ContentHashSchema,
  source: z.literal("synthetic-trusted-host") });
export const ExitSchema = z.strictObject({ exitId: ProjectIdSchema, requestId: ProjectIdSchema, attemptGeneration: SafePositive,
  hostInstanceId: ProjectIdSchema, invocationNonce: ProjectIdSchema, pid: SafePositive,
  creationTicks: z.string().regex(/^[1-9][0-9]{0,19}$/), executableDigest: ContentHashSchema, scopeDigest: ContentHashSchema,
  evidenceDigest: ContentHashSchema, completeScope: z.literal(true), effectsClassified: z.boolean(),
  source: z.literal("synthetic-trusted-host") });
export const CancellationSchema = z.strictObject({ requestId: ProjectIdSchema, decisionId: ProjectIdSchema,
  intentGeneration: SafePositive, reason: z.enum(["OWNER_CANCELLED", "TIMED_OUT"]), requestDigest: ContentHashSchema,
  requestedAtMs: SafeTime, noLaunch: z.boolean(), ack: AckSchema.nullable(), exit: ExitSchema.nullable() });
export const AckCommandSchema = z.strictObject({ expected: ExpectedSchema, clock: ClockSchema,
  eventId: ProjectIdSchema, receipt: AckSchema, authorization: z.literal("s12-test-only") });
export const ExitCommandSchema = z.strictObject({ expected: ExpectedSchema, clock: ClockSchema,
  eventId: ProjectIdSchema, receipt: ExitSchema, authorization: z.literal("s12-test-only") });
export function readCancellation(current: Attempt) {
  return current.cancellationPayload === null ? null : parse(CancellationSchema, JSON.parse(current.cancellationPayload));
}
export function cancellationDigest(command: z.infer<typeof CancellationRequestSchema>): string {
  const e = command.expected;
  return semanticDigest([e.projectId, e.authorityIncarnation, e.taskId, e.attemptId, e.attemptGeneration,
    e.stateVersion, e.phase, e.hostInstanceId, e.ownerId, hash(e.ownerNonce), command.requestId, command.decisionId, command.reason]);
}
export function assertCancellationTerminal(current: Attempt, target: string, receipt: { reason: string; closureDigest: string },
  expected: Expected, authority?: HostAuthority): void {
  if (current.leasePayload === null) return;
  const cancel = readCancellation(current);
  if (!cancel) { requireAuthority(target !== "INTERRUPTED", "CANCELLATION_INVALID"); return; }
  assertHostAuthority(current, expected, authority);
  requireAuthority(target === "INTERRUPTED" && receipt.reason === (cancel.reason === "TIMED_OUT" ? "TIMED_OUT" : "CANCELLED"), "CANCELLATION_INVALID");
  if (!cancel.noLaunch) requireAuthority(cancel.ack && cancel.exit && cancel.exit.effectsClassified &&
    cancel.ack.invocationNonce === cancel.exit.invocationNonce && receipt.closureDigest === cancel.exit.evidenceDigest, "CANCELLATION_INVALID");
}
export function validateCancellationHistory(previous: Attempt | undefined, next: Attempt, eventType: string): void {
  const cancel = readCancellation(next), prior = previous ? readCancellation(previous) : null;
  if (!previous) { requireAuthority(cancel === null, "INTEGRITY"); return; }
  if (eventType === "CANCEL_INTENT") {
    requireAuthority(!prior && cancel && !isTerminal(previous.phase) && cancel.intentGeneration === previous.attemptGeneration &&
      cancel.requestedAtMs === next.updatedAtMs && cancel.ack === null && cancel.exit === null, "INTEGRITY");
    const noLaunch = ["CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED"].includes(previous.phase);
    requireAuthority(cancel.noLaunch === noLaunch && next.phase === (noLaunch ? previous.phase : "CANCELLATION_REQUESTED"), "INTEGRITY");
  } else if (eventType === "CANCEL_ACK" || eventType === "CANCEL_EXIT") {
    requireAuthority(prior && cancel && !prior.noLaunch && next.phase === previous.phase && !isTerminal(next.phase), "INTEGRITY");
    const key = eventType === "CANCEL_ACK" ? "ack" : "exit", value = cancel[key];
    requireAuthority(prior[key] === null && value && value.requestId === cancel.requestId &&
      value.attemptGeneration === next.attemptGeneration && value.hostInstanceId === next.hostInstanceId &&
      next.cancellationPayload === JSON.stringify({ ...prior, [key]: value }), "INTEGRITY");
    if (cancel.ack && cancel.exit) requireAuthority(cancel.ack.invocationNonce === cancel.exit.invocationNonce, "INTEGRITY");
    if (cancel.exit) requireAuthority(cancel.exit.scopeDigest === next.scopeDigest, "INTEGRITY");
  } else requireAuthority(next.cancellationPayload === previous.cancellationPayload, "INTEGRITY");
  if (prior && eventType === "TERMINAL_COMMITTED") {
    requireAuthority(next.phase === "INTERRUPTED", "INTEGRITY");
    if (!prior.noLaunch) requireAuthority(prior.ack && prior.exit?.effectsClassified && prior.ack.invocationNonce === prior.exit.invocationNonce, "INTEGRITY");
  }
}
