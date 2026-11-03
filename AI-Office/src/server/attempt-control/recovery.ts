import { z } from "zod";
import { ContentHashSchema, ProjectIdSchema } from "../../contracts/primitives.js";
import { ClockSchema, IdentitySchema, PhaseSchema, SafePositive, SafeTime, parse, requireAuthority, semanticDigest, type Attempt } from "./contracts.js";
import { classifyLease } from "./lease.js";
import { readCancellation } from "./cancellation.js";
import { isTerminal } from "./state-machine.js";

export const InspectorSchema = z.strictObject({ hostInstanceId: ProjectIdSchema, clockDomainId: ProjectIdSchema, decisionId: ProjectIdSchema });
export type RecoveryAuthority = Readonly<{ dispatch: "CLOSED"; source: "synthetic-trusted-recovery" }>;
const inspectors = new WeakMap<RecoveryAuthority, { projectId: string; incarnation: string; inspector: z.infer<typeof InspectorSchema> }>();
export function createRecoveryAuthorityForTest(projectId: string, incarnation: string, input: unknown): RecoveryAuthority {
  const inspector = parse(InspectorSchema, input), authority = Object.freeze({ dispatch: "CLOSED" as const, source: "synthetic-trusted-recovery" as const });
  inspectors.set(authority, { projectId, incarnation, inspector }); return authority;
}
export const ProcessIdentitySchema = z.strictObject({ pid: SafePositive, creationTicks: z.string().regex(/^[1-9][0-9]{0,19}$/).nullable(),
  executableDigest: ContentHashSchema.nullable(), invocationNonce: ProjectIdSchema, hostInstanceId: ProjectIdSchema,
  attemptGeneration: SafePositive, source: z.literal("synthetic-trusted-host") });
export const ProcessEvidenceSchema = z.strictObject({ evidenceId: ProjectIdSchema, status: z.enum(["UNKNOWN", "EXIT_OBSERVED"]),
  parent: ProcessIdentitySchema.nullable(), child: ProcessIdentitySchema.nullable(), completeScope: z.boolean(), effectsClassified: z.boolean(),
  source: z.literal("synthetic-trusted-host") });
export const RecoveryExpectedSchema = IdentitySchema.extend({ attemptGeneration: SafePositive, stateVersion: SafePositive, phase: PhaseSchema });
export const ReconcileSchema = z.strictObject({ expected: RecoveryExpectedSchema, clock: ClockSchema, reconciliationId: ProjectIdSchema,
  decisionId: ProjectIdSchema, process: ProcessEvidenceSchema, retryRequested: z.boolean(), authorization: z.literal("s12-test-only") });
export const RecoveryRecordSchema = z.strictObject({ reconciliationId: ProjectIdSchema, requestDigest: ContentHashSchema,
  inspectorHostInstanceId: ProjectIdSchema, clockDomainId: ProjectIdSchema, decisionId: ProjectIdSchema, observedVersion: SafePositive,
  currentGeneration: SafePositive, atWallMs: SafeTime, classification: z.enum(["QUARANTINED", "TERMINAL_RETAINED"]),
  leaseClassification: z.enum(["UNLEASED", "TERMINAL", "ACTIVE", "EXPIRED", "PREVIOUS_HOST", "CLOCK_UNTRUSTED", "QUARANTINED"]),
  processClassification: z.enum(["UNKNOWN", "IDENTITY_MISMATCH", "EXIT_REPORTED", "MATCHED_SYNTHETIC_EXIT"]),
  reason: z.enum(["TERMINAL_RETAINED", "CLOCK_OR_HOST_CONTINUITY", "LEASE_EXPIRED", "PENDING_CANCELLATION", "PROCESS_OR_EFFECTS_UNKNOWN"]),
  pendingCancellation: z.boolean(), retryEligibility: z.enum(["RETRY_FORBIDDEN", "RETRY_REQUIRES_RECONCILIATION", "RETRY_CANDIDATE_PENDING_APPROVAL"]),
  dispatch: z.literal("CLOSED"), retryAuthorized: z.literal(false), process: ProcessEvidenceSchema });
export function readRecovery(a: Attempt) { return a.recoveryPayload === null ? null : parse(RecoveryRecordSchema, JSON.parse(a.recoveryPayload)); }
export function assertRecoveryAuthority(current: Attempt, command: z.infer<typeof ReconcileSchema>, authority: RecoveryAuthority): void {
  const entry = inspectors.get(authority);
  requireAuthority(entry && entry.projectId === current.projectId && entry.incarnation === current.authorityIncarnation &&
    entry.inspector.hostInstanceId === command.clock.hostInstanceId && entry.inspector.clockDomainId === command.clock.clockDomainId &&
    entry.inspector.decisionId === command.decisionId, "AUTHORITY_INVALID");
  requireAuthority(current.attemptGeneration === command.expected.attemptGeneration, "STALE_OWNER");
}
export function recoveryDigest(command: z.infer<typeof ReconcileSchema>): string {
  const e = command.expected, c = command.clock, p = command.process;
  return semanticDigest([e.projectId, e.authorityIncarnation, e.taskId, e.attemptId, e.attemptGeneration, e.stateVersion,
    e.phase, c.hostInstanceId, c.clockDomainId, c.wallMs, c.monotonicMs, command.reconciliationId, command.decisionId,
    p, command.retryRequested]);
}
export function processClassification(current: Attempt, process: z.infer<typeof ProcessEvidenceSchema>): "UNKNOWN" | "IDENTITY_MISMATCH" | "EXIT_REPORTED" | "MATCHED_SYNTHETIC_EXIT" {
  const { parent, child } = process;
  if (process.status !== "EXIT_OBSERVED" || !parent || !child || !process.completeScope) return "UNKNOWN";
  if (!parent.creationTicks || !child.creationTicks || !parent.executableDigest || !child.executableDigest ||
    parent.invocationNonce !== child.invocationNonce || parent.hostInstanceId !== current.hostInstanceId ||
    child.hostInstanceId !== current.hostInstanceId || parent.attemptGeneration !== current.attemptGeneration ||
    child.attemptGeneration !== current.attemptGeneration) return "IDENTITY_MISMATCH";
  const exit = readCancellation(current)?.exit;
  if (exit && exit.pid === parent.pid && exit.creationTicks === parent.creationTicks && exit.executableDigest === parent.executableDigest &&
    exit.invocationNonce === parent.invocationNonce && exit.scopeDigest === current.scopeDigest) return "MATCHED_SYNTHETIC_EXIT";
  return "EXIT_REPORTED"; // Uncorrelated receipt is not proof of previously owned scope closure.
}
export function classifyRecovery(current: Attempt, command: z.infer<typeof ReconcileSchema>) {
  const lease = classifyLease(current, command.clock), process = processClassification(current, command.process), cancellation = readCancellation(current);
  const terminal = isTerminal(current.phase), pending = cancellation !== null && !terminal;
  const retry = current.phase === "COMPLETED" ? "RETRY_FORBIDDEN" : terminal &&
    (current.phase === "APPROVAL_DENIED" || cancellation?.noLaunch ||
      (process === "MATCHED_SYNTHETIC_EXIT" && cancellation?.exit?.effectsClassified && command.process.effectsClassified)) ?
      "RETRY_CANDIDATE_PENDING_APPROVAL" : "RETRY_REQUIRES_RECONCILIATION";
  return parse(RecoveryRecordSchema, { reconciliationId: command.reconciliationId, requestDigest: recoveryDigest(command),
    inspectorHostInstanceId: command.clock.hostInstanceId, clockDomainId: command.clock.clockDomainId, decisionId: command.decisionId,
    observedVersion: current.stateVersion, currentGeneration: current.attemptGeneration, atWallMs: command.clock.wallMs,
    classification: terminal ? "TERMINAL_RETAINED" : "QUARANTINED", leaseClassification: lease, processClassification: process,
    reason: terminal ? "TERMINAL_RETAINED" : ["CLOCK_UNTRUSTED", "PREVIOUS_HOST"].includes(lease) ? "CLOCK_OR_HOST_CONTINUITY" :
      lease === "EXPIRED" ? "LEASE_EXPIRED" : pending ? "PENDING_CANCELLATION" : "PROCESS_OR_EFFECTS_UNKNOWN",
    pendingCancellation: pending, retryEligibility: retry, dispatch: "CLOSED", retryAuthorized: false, process: command.process });
}
export function validateRecoveryHistory(previous: Attempt | undefined, next: Attempt, eventType: string): void {
  const record = readRecovery(next);
  if (!previous) { requireAuthority(record === null, "INTEGRITY"); return; }
  if (eventType === "RECOVERY_CLASSIFIED") {
    requireAuthority(record && !isTerminal(previous.phase) && next.attemptGeneration === previous.attemptGeneration &&
      record.observedVersion === previous.stateVersion && record.currentGeneration === next.attemptGeneration &&
      record.classification === "QUARANTINED" && record.retryEligibility === "RETRY_REQUIRES_RECONCILIATION" &&
      next.phase === (previous.phase === "RECONCILIATION_REQUIRED" ? previous.phase : "UNCERTAIN"), "INTEGRITY");
  } else requireAuthority(next.recoveryPayload === previous.recoveryPayload, "INTEGRITY");
}
