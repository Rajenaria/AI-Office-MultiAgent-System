import { randomUUID } from "node:crypto";
import { hash, type Attempt, type Clock } from "../../../src/server/attempt-control/contracts.js";
import { readCancellation } from "../../../src/server/attempt-control/cancellation.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { identity, own } from "./helpers.js";
export function recoveryCommand(a: Attempt, suppliedClock?: Clock) {
  return { expected: { ...identity(a), attemptGeneration: a.attemptGeneration, stateVersion: a.stateVersion, phase: a.phase },
    clock: suppliedClock ?? { hostInstanceId: randomUUID(), clockDomainId: randomUUID(), wallMs: a.updatedAtMs + 1000, monotonicMs: 0 },
    reconciliationId: randomUUID(), decisionId: randomUUID(), retryRequested: false, authorization: "s12-test-only" as const,
    process: { evidenceId: randomUUID(), status: "UNKNOWN" as "UNKNOWN" | "EXIT_OBSERVED", parent: null as ReturnType<typeof processExit>["parent"] | null,
      child: null as ReturnType<typeof processExit>["child"] | null, completeScope: false, effectsClassified: false,
      source: "synthetic-trusted-host" as const } };
}
export function processExit(a: Attempt, effectsClassified = false) {
  const exit = readCancellation(a)?.exit;
  const parent = { pid: exit?.pid ?? 9001, creationTicks: (exit?.creationTicks ?? "123456789") as string | null,
    executableDigest: (exit?.executableDigest ?? hash("fake executable")) as string | null,
    invocationNonce: exit?.invocationNonce ?? randomUUID(), hostInstanceId: a.hostInstanceId,
    attemptGeneration: a.attemptGeneration, source: "synthetic-trusted-host" as const };
  return { evidenceId: randomUUID(), status: "EXIT_OBSERVED" as const, parent,
    child: { ...parent, pid: 9002, creationTicks: "123456790" as string | null }, completeScope: true, effectsClassified,
    source: "synthetic-trusted-host" as const };
}
export function inspector(r: DurableAttemptRepository, command: ReturnType<typeof recoveryCommand>) {
  return r.openRecoveryForTest({ hostInstanceId: command.clock.hostInstanceId, clockDomainId: command.clock.clockDomainId, decisionId: command.decisionId });
}
export function reopened(f: { ref: Parameters<typeof DurableAttemptRepository.openForTest>[0]; repository: DurableAttemptRepository }, a: Attempt) {
  f.repository.close(); const repository = own(DurableAttemptRepository.openForTest(f.ref)), command = recoveryCommand(a);
  return { repository, command, authority: inspector(repository, command) };
}
