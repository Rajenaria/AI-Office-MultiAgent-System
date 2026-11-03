import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { readLease } from "../../../src/server/attempt-control/lease.js";
import { readCancellation } from "../../../src/server/attempt-control/cancellation.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { evidence, expected, failure, identity, own } from "./helpers.js";
import { ackCommand, cancelFixture, cancellationTerminal, exitCommand, nextClock } from "./cancel-helpers.js";
import { leasedFixture } from "./lease-helpers.js";
import { inspector, recoveryCommand } from "./recovery-helpers.js";

it("P01 persisted issue/owner/heartbeat/cancel/ack/exit/terminal/reopen chain never retries", () => {
  const f = cancelFixture(); expect(f.attempt.attemptGeneration).toBe(1);
  let a = f.repository.renewLease({ expected: expected(f.attempt, f.command.ownerNonce), clock: nextClock(f.attempt),
    heartbeatId: randomUUID(), previousSequence: 0, authorization: "s12-test-only" }).attempt;
  expect(readLease(a)?.heartbeatSequence).toBe(1);
  a = f.repository.requestCancellation({ ...f.request, expected: expected(a, f.command.ownerNonce), clock: nextClock(a) }, f.authority).attempt;
  expect(readCancellation(a)?.ack).toBeNull();
  a = f.repository.recordCancellationAck(ackCommand(f, a), f.authority).attempt;
  a = f.repository.recordCancellationExit(exitCommand(f, a), f.authority).attempt;
  const receipt = cancellationTerminal(f, a); a = f.repository.commitTerminal(receipt, f.authority).attempt;
  expect(a).toMatchObject({ phase: "INTERRUPTED", stateVersion: 10, attemptGeneration: 1 });
  f.repository.close(); const fresh = own(DurableAttemptRepository.openForTest(f.ref)), command = recoveryCommand(a);
  expect(command.clock.hostInstanceId).not.toBe(a.hostInstanceId);
  const result = fresh.reconcile(command, inspector(fresh, command));
  expect(result.attempt).toEqual(a); expect(result.recovery).toMatchObject({ classification: "TERMINAL_RETAINED", retryAuthorized: false, dispatch: "CLOSED" });
  failure(() => fresh.renewLease({ expected: expected(a, f.command.ownerNonce), clock: nextClock(a),
    heartbeatId: randomUUID(), previousSequence: 1, authorization: "s12-test-only" }), "LEASE_INVALID");
  const cap = fresh.authorizeHostForTest(expected(a, f.command.ownerNonce), command.clock);
  expect(fresh.commitTerminal(receipt, cap)).toEqual({ attempt: a, replay: true });
  expect(fresh.history(identity(a))).toHaveLength(10); expect(fresh.recoveryInventory().attempts).toHaveLength(1);
  evidence("P01-complete-chain", { ref: f.ref, final: a, recovery: result.recovery,
    events: fresh.history(identity(a)).map((e) => ({ type: e.eventType, version: e.newVersion })), workerDispatches: 0 });
}, 15000);

it("P02 expired previous-host active attempt stays quarantined with no takeover/retry", () => {
  const f = leasedFixture(true); f.repository.close(); const fresh = own(DurableAttemptRepository.openForTest(f.ref));
  const command = recoveryCommand(f.attempt); command.clock.wallMs = readLease(f.attempt)!.deadlineWallMs + 1;
  expect(command.clock.hostInstanceId).not.toBe(f.attempt.hostInstanceId);
  const result = fresh.reconcile({ ...command, retryRequested: true }, inspector(fresh, command));
  expect(result.attempt).toMatchObject({ phase: "UNCERTAIN", attemptGeneration: 1, ownerId: f.attempt.ownerId,
    hostInstanceId: f.attempt.hostInstanceId, conflictHeld: 1 });
  expect(result.recovery).toMatchObject({ processClassification: "UNKNOWN", classification: "QUARANTINED",
    retryEligibility: "RETRY_REQUIRES_RECONCILIATION", dispatch: "CLOSED", retryAuthorized: false });
  failure(() => fresh.renewLease({ expected: expected(f.attempt, f.command.ownerNonce), clock: nextClock(f.attempt),
    heartbeatId: randomUUID(), previousSequence: 0, authorization: "s12-test-only" }), "CONFLICT");
  failure(() => fresh.issue({ ...f.command, attemptId: randomUUID(), issueRequestId: randomUUID(), eventId: randomUUID() }), "CONFLICT");
  expect(fresh.recoveryInventory().attempts).toHaveLength(1);
  expect(fresh.history(identity(result.attempt)).at(-1)?.writerHostInstanceId).toBe(command.clock.hostInstanceId);
  evidence("P02-ambiguous-chain", { ref: f.ref, before: f.attempt, after: result.attempt, recovery: result.recovery, workerDispatches: 0 });
}, 15000);
