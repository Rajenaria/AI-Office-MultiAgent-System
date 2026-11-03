import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, expect } from "vitest";
import { AuthorityFailure, hash, type Attempt, type Expected, type Issue, type Phase } from "../../../src/server/attempt-control/contracts.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { createTestDatabase, type TestDatabaseRef, type TestRoot } from "../../../src/server/attempt-control/test-storage.js";

export const root = JSON.parse(process.env.AI_OFFICE_S12_ROOT ?? "null") as TestRoot;
if (!root) throw new Error("Explicit S12 test-owned root required");
const handles: { close(): void }[] = [];
export function own<T extends { close(): void }>(handle: T): T { handles.push(handle); return handle; }
afterEach(() => { for (const handle of handles.splice(0).reverse()) handle.close(); });
export function fixture() { const ref = createTestDatabase(root); return { ref, repository: own(DurableAttemptRepository.openForTest(ref)) }; }
export function issueCommand(ref: TestDatabaseRef): Issue {
  return { projectId: ref.projectId, authorityIncarnation: ref.authorityIncarnation, taskId: `s12:${randomUUID()}`,
    attemptId: randomUUID(), issueRequestId: randomUUID(), eventId: randomUUID(), bindingId: `s12:${randomUUID()}`,
    bindingGeneration: 1, scopeDigest: hash("synthetic-scope"), actionDigest: hash("synthetic-action"),
    permissionDigest: hash("synthetic-permission"), runtimeRef: "s12-host-only", executionMode: "synthetic",
    createdAtMs: 1_000, hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash(randomUUID()) };
}
export function identity(attempt: Pick<Attempt, "projectId" | "authorityIncarnation" | "taskId" | "attemptId">) {
  return { projectId: attempt.projectId, authorityIncarnation: attempt.authorityIncarnation, taskId: attempt.taskId, attemptId: attempt.attemptId };
}
export function expected(attempt: Attempt, ownerNonce: string): Expected {
  return { ...identity(attempt), attemptGeneration: attempt.attemptGeneration, stateVersion: attempt.stateVersion,
    phase: attempt.phase, hostInstanceId: attempt.hostInstanceId, ownerId: attempt.ownerId, ownerNonce };
}
export function transitionCommand(attempt: Attempt, nonce: string, target: Phase) {
  return { expected: expected(attempt, nonce), target, eventId: randomUUID(), atMs: attempt.updatedAtMs + 1,
    authorization: "s12-test-only" as const };
}
export function terminalCommand(attempt: Attempt, nonce: string, target: Phase = "COMPLETED") {
  return { ...transitionCommand(attempt, nonce, target), receipt: { receiptId: randomUUID(),
    reason: (target === "COMPLETED" ? "NORMAL" : target === "APPROVAL_DENIED" ? "DENIED" :
      attempt.ownerMode === "RECOVERY" ? "CONTROLLER_RECONCILED" : target === "INTERRUPTED" ? "CANCELLED" :
        attempt.phase === "LAUNCHING" ? "START_FAILED" : "UNEXPECTED") as "NORMAL" | "DENIED" | "CONTROLLER_RECONCILED" | "CANCELLED" | "START_FAILED" | "UNEXPECTED",
    closureDigest: hash("synthetic-closure-only"), resultDigest: hash("synthetic-result-only") } };
}
export function advance(repository: DurableAttemptRepository, command: Issue, target: "RUNNING" | "UNCERTAIN" = "RUNNING"): Attempt {
  let attempt = repository.issue(command).attempt;
  const phases: Phase[] = target === "UNCERTAIN" ? ["UNCERTAIN"] : ["APPROVAL_PENDING", "APPROVAL_GRANTED", "LAUNCHING", "RUNNING"];
  for (const phase of phases) attempt = repository.transition(transitionCommand(attempt, command.ownerNonce, phase));
  return attempt;
}
export function failure(operation: () => unknown, code: string): AuthorityFailure {
  try { operation(); throw new Error("Expected failure"); }
  catch (error) { expect(error).toBeInstanceOf(AuthorityFailure); expect(error).toMatchObject({ code }); return error as AuthorityFailure; }
}
export function evidence(label: string, data: unknown): void {
  writeFileSync(path.join(root.root, `evidence-${label}-${randomUUID()}.json`), JSON.stringify(data, null, 2), { flag: "wx" });
}
