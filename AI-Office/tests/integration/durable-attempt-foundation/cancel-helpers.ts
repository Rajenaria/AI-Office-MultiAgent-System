import { randomUUID } from "node:crypto";
import { hash, type Attempt } from "../../../src/server/attempt-control/contracts.js";
import { readCancellation } from "../../../src/server/attempt-control/cancellation.js";
import { readLease } from "../../../src/server/attempt-control/lease.js";
import { expected, terminalCommand } from "./helpers.js";
import { clockAt, leasedFixture } from "./lease-helpers.js";
export const nextClock = (a: Attempt) => clockAt(a, a.updatedAtMs + 1 - readLease(a)!.lastWallMs);
export function cancelFixture(running = true) {
  const f = leasedFixture(running), authority = f.repository.authorizeHostForTest(expected(f.attempt, f.command.ownerNonce), nextClock(f.attempt));
  const request = { expected: expected(f.attempt, f.command.ownerNonce), clock: nextClock(f.attempt), eventId: randomUUID(),
    requestId: randomUUID(), decisionId: randomUUID(), reason: "OWNER_CANCELLED" as const, authorization: "s12-test-only" as const };
  return { ...f, authority, request, invocationNonce: randomUUID() };
}
export function ackCommand(f: ReturnType<typeof cancelFixture>, a: Attempt) {
  return { expected: expected(a, f.command.ownerNonce), clock: nextClock(a), eventId: randomUUID(), authorization: "s12-test-only" as const,
    receipt: { ackId: randomUUID(), requestId: readCancellation(a)!.requestId, attemptGeneration: a.attemptGeneration,
      hostInstanceId: a.hostInstanceId, invocationNonce: f.invocationNonce, evidenceDigest: hash("synthetic ack"), source: "synthetic-trusted-host" as const } };
}
export function exitCommand(f: ReturnType<typeof cancelFixture>, a: Attempt, effectsClassified = true) {
  return { expected: expected(a, f.command.ownerNonce), clock: nextClock(a), eventId: randomUUID(), authorization: "s12-test-only" as const,
    receipt: { exitId: randomUUID(), requestId: readCancellation(a)!.requestId, attemptGeneration: a.attemptGeneration,
      hostInstanceId: a.hostInstanceId, invocationNonce: f.invocationNonce, pid: 9001, creationTicks: "123456789",
      executableDigest: hash("fake executable"), scopeDigest: a.scopeDigest, evidenceDigest: hash("synthetic complete scope"),
      completeScope: true as const, effectsClassified, source: "synthetic-trusted-host" as const } };
}
export function cancellationTerminal(f: ReturnType<typeof cancelFixture>, a: Attempt) {
  const clock = nextClock(a), command = terminalCommand(a, f.command.ownerNonce, "INTERRUPTED");
  return { ...command, clock, atMs: clock.wallMs, receipt: { ...command.receipt,
    closureDigest: readCancellation(a)?.exit?.evidenceDigest ?? hash("synthetic no launch") } };
}
export function cancelledWithEvidence(f: ReturnType<typeof cancelFixture>) {
  let a = f.repository.requestCancellation(f.request, f.authority).attempt;
  a = f.repository.recordCancellationAck(ackCommand(f, a), f.authority).attempt;
  return f.repository.recordCancellationExit(exitCommand(f, a), f.authority).attempt;
}
