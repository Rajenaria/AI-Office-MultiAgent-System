import { AttemptSchema, ExpectedSchema, PhaseSchema, hash, parse, requireAuthority,
  type Attempt, type Expected, type Phase } from "./contracts.js";

export const isTerminal = (phase: Phase): boolean =>
  ["COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"].includes(phase);
const edges: Record<Phase, readonly Phase[]> = {
  CREATED: ["APPROVAL_PENDING", "INTERRUPTED", "UNCERTAIN"],
  APPROVAL_PENDING: ["APPROVAL_GRANTED", "APPROVAL_DENIED", "INTERRUPTED", "UNCERTAIN"],
  APPROVAL_GRANTED: ["LAUNCHING", "INTERRUPTED", "UNCERTAIN"],
  LAUNCHING: ["RUNNING", "FAILED", "CANCELLATION_REQUESTED", "UNCERTAIN"],
  RUNNING: ["COMPLETED", "FAILED", "CANCELLATION_REQUESTED", "UNCERTAIN"],
  CANCELLATION_REQUESTED: ["INTERRUPTED", "UNCERTAIN"],
  UNCERTAIN: ["RECONCILIATION_REQUIRED"], RECONCILIATION_REQUIRED: ["FAILED", "INTERRUPTED"],
  COMPLETED: [], FAILED: [], INTERRUPTED: [], APPROVAL_DENIED: [],
};
export function assertIdentity(current: Attempt, expected: Pick<Expected,
  "projectId" | "authorityIncarnation" | "taskId" | "attemptId">): void {
  requireAuthority(current.projectId === expected.projectId && current.authorityIncarnation === expected.authorityIncarnation &&
    current.taskId === expected.taskId && current.attemptId === expected.attemptId, "IDENTITY_CONFLICT");
}
export function assertExpected(current: Attempt, expected: Expected): void {
  assertIdentity(current, expected);
  requireAuthority(current.attemptGeneration === expected.attemptGeneration && current.hostInstanceId === expected.hostInstanceId &&
    current.ownerId === expected.ownerId && current.ownerNonceHash === hash(expected.ownerNonce), "STALE_OWNER");
  requireAuthority(current.stateVersion === expected.stateVersion && current.phase === expected.phase, "CONFLICT");
}
export function assertEdge(current: Attempt, target: Phase, fencing = false): void {
  requireAuthority(edges[current.phase].includes(target), "INVALID_TRANSITION");
  requireAuthority((target === "RECONCILIATION_REQUIRED") === fencing, "INVALID_TRANSITION");
  if (current.ownerMode === "RECOVERY") requireAuthority(["FAILED", "INTERRUPTED"].includes(target), "INVALID_TRANSITION");
}
// Pure: no database, clock, filesystem, async operation or production authorization.
export function validateTransition(currentInput: unknown, targetInput: unknown, expectedInput: unknown,
  context: { authorization: "s12-test-only"; fencing?: boolean }): void {
  const current = parse(AttemptSchema, currentInput), expected = parse(ExpectedSchema, expectedInput), target = parse(PhaseSchema, targetInput);
  requireAuthority(context.authorization === "s12-test-only", "VALIDATION");
  assertExpected(current, expected); assertEdge(current, target, context.fencing === true);
}
