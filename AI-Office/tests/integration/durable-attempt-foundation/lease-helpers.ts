import { randomUUID } from "node:crypto";
import type { Attempt } from "../../../src/server/attempt-control/contracts.js";
import { readLease } from "../../../src/server/attempt-control/lease.js";
import { fixture, issueCommand, transitionCommand } from "./helpers.js";
export function clockAt(attempt: Attempt, elapsed = 1000) {
  const lease = readLease(attempt)!;
  return { hostInstanceId: lease.hostInstanceId, clockDomainId: lease.clockDomainId,
    wallMs: lease.lastWallMs + elapsed, monotonicMs: lease.lastMonoMs + elapsed };
}
export function leasedFixture(running = false) {
  const f = fixture(), command = issueCommand(f.ref);
  const leaseClock = { hostInstanceId: command.hostInstanceId, clockDomainId: randomUUID(), wallMs: command.createdAtMs, monotonicMs: 100 };
  const issue = { ...command, leaseClock };
  let attempt = f.repository.issue(issue).attempt;
  if (running) for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED", "LAUNCHING", "RUNNING"] as const) {
    const clock = clockAt(attempt, attempt.updatedAtMs + 1 - leaseClock.wallMs);
    attempt = f.repository.transition({ ...transitionCommand(attempt, issue.ownerNonce, phase), clock });
  }
  return { ...f, command: issue, attempt };
}
