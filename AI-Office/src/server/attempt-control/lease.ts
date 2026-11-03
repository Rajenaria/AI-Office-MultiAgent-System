import { z } from "zod";
import { ProjectIdSchema } from "../../contracts/primitives.js";
import { ClockSchema, ExpectedSchema, LeaseSchema, SafeTime, hash, nextInteger, parse, requireAuthority, semanticDigest,
  type Attempt, type Clock, type Lease } from "./contracts.js";
import { isTerminal } from "./state-machine.js";

export const LEASE_DURATION_MS = 20_000;
export const HEARTBEAT_INTERVAL_MS = 5_000;
export const HeartbeatSchema = z.strictObject({ expected: ExpectedSchema, clock: ClockSchema,
  heartbeatId: ProjectIdSchema, previousSequence: SafeTime, authorization: z.literal("s12-test-only") });
export const ConcernSchema = z.strictObject({ expected: ExpectedSchema, clock: ClockSchema,
  eventId: ProjectIdSchema, authorization: z.literal("s12-test-only") });
export function initialLease(clock: Clock, hostInstanceId: string, createdAtMs: number): string {
  requireAuthority(clock.hostInstanceId === hostInstanceId && clock.wallMs === createdAtMs, "LEASE_INVALID");
  return JSON.stringify(parse(LeaseSchema, { hostInstanceId, clockDomainId: clock.clockDomainId,
    startedWallMs: clock.wallMs, startedMonoMs: clock.monotonicMs, lastWallMs: clock.wallMs, lastMonoMs: clock.monotonicMs,
    deadlineWallMs: clock.wallMs + LEASE_DURATION_MS, deadlineMonoMs: clock.monotonicMs + LEASE_DURATION_MS,
    heartbeatSequence: 0, lastHeartbeatId: null, lastHeartbeatDigest: null, status: "ACTIVE", concern: null }));
}
export function readLease(attempt: Attempt): Lease | null {
  return attempt.leasePayload === null ? null : parse(LeaseSchema, JSON.parse(attempt.leasePayload));
}
export function classifyLease(attempt: Attempt, input: unknown): "UNLEASED" | "TERMINAL" | "ACTIVE" | "EXPIRED" | "PREVIOUS_HOST" | "CLOCK_UNTRUSTED" | "QUARANTINED" {
  const clock = parse(ClockSchema, input), lease = readLease(attempt);
  if (isTerminal(attempt.phase)) return "TERMINAL";
  if (!lease) return "UNLEASED";
  if (lease.status === "QUARANTINED" || ["UNCERTAIN", "RECONCILIATION_REQUIRED"].includes(attempt.phase)) return "QUARANTINED";
  if (clock.hostInstanceId !== lease.hostInstanceId || clock.clockDomainId !== lease.clockDomainId) return "PREVIOUS_HOST";
  const wall = clock.wallMs - lease.lastWallMs, mono = clock.monotonicMs - lease.lastMonoMs;
  if (wall < 0 || mono < 0 || Math.abs(wall - mono) > 1000) return "CLOCK_UNTRUSTED";
  if (clock.wallMs >= lease.deadlineWallMs || clock.monotonicMs >= lease.deadlineMonoMs) return "EXPIRED";
  if (mono > 15_000) return "CLOCK_UNTRUSTED";
  return "ACTIVE";
}
export function assertLeaseActive(attempt: Attempt, input: unknown, atMs: number): void {
  if (attempt.leasePayload === null) return; // Explicit legacy S12 synthetic profile only.
  const clock = parse(ClockSchema, input);
  requireAuthority(clock.wallMs === atMs && classifyLease(attempt, clock) === "ACTIVE", "LEASE_INVALID");
}
export function heartbeatDigest(attempt: Attempt, clock: Clock, heartbeatId: string, previousSequence: number): string {
  return semanticDigest([attempt.projectId, attempt.authorityIncarnation, attempt.taskId, attempt.attemptId,
    attempt.attemptGeneration, attempt.stateVersion, attempt.phase, attempt.hostInstanceId, attempt.ownerId,
    attempt.ownerNonceHash, heartbeatId, previousSequence, clock.hostInstanceId, clock.clockDomainId, clock.wallMs, clock.monotonicMs]);
}
export function renewedLease(attempt: Attempt, clock: Clock, heartbeatId: string, digest: string): string {
  const lease = readLease(attempt); requireAuthority(lease, "LEASE_INVALID");
  assertLeaseActive(attempt, clock, clock.wallMs);
  return JSON.stringify(parse(LeaseSchema, { ...lease, lastWallMs: clock.wallMs, lastMonoMs: clock.monotonicMs,
    deadlineWallMs: clock.wallMs + LEASE_DURATION_MS, deadlineMonoMs: clock.monotonicMs + LEASE_DURATION_MS,
    heartbeatSequence: nextInteger(lease.heartbeatSequence), lastHeartbeatId: heartbeatId, lastHeartbeatDigest: digest }));
}
export function validateLeaseHistory(previous: Attempt | undefined, next: Attempt, eventType: string): void {
  const lease = readLease(next);
  if (!previous) {
    if (lease) requireAuthority(lease.hostInstanceId === next.hostInstanceId && lease.heartbeatSequence === 0 &&
      lease.lastHeartbeatId === null && lease.lastHeartbeatDigest === null && lease.status === "ACTIVE" && lease.concern === null &&
      next.leasePayload === initialLease({ hostInstanceId: lease.hostInstanceId, clockDomainId: lease.clockDomainId,
        wallMs: lease.startedWallMs, monotonicMs: lease.startedMonoMs }, next.hostInstanceId, next.createdAtMs), "INTEGRITY");
    return;
  }
  const prior = readLease(previous);
  if (eventType === "LEASE_RENEWED") {
    requireAuthority(lease && prior && next.phase === previous.phase && !isTerminal(next.phase), "INTEGRITY");
    const clock = { hostInstanceId: lease.hostInstanceId, clockDomainId: lease.clockDomainId, wallMs: lease.lastWallMs, monotonicMs: lease.lastMonoMs };
    requireAuthority(lease.lastHeartbeatId && lease.lastHeartbeatDigest === heartbeatDigest(previous, clock, lease.lastHeartbeatId, prior.heartbeatSequence) &&
      next.leasePayload === renewedLease(previous, clock, lease.lastHeartbeatId, lease.lastHeartbeatDigest), "INTEGRITY");
  } else if (eventType === "LEASE_QUARANTINED") {
    requireAuthority(prior && lease && lease.status === "QUARANTINED" && next.phase === "UNCERTAIN" &&
      ["EXPIRED", "CLOCK_UNTRUSTED", "PREVIOUS_HOST"].includes(lease.concern ?? "") &&
      next.leasePayload === JSON.stringify({ ...prior, status: "QUARANTINED", concern: lease.concern }), "INTEGRITY");
  } else requireAuthority(next.leasePayload === previous.leasePayload, "INTEGRITY");
}
