import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AttemptSchema, ExpectedSchema, IssueSchema, PhaseSchema, ReceiptSchema, assertOne, hash, nextInteger, parse } from "../../../src/server/attempt-control/contracts.js";
import { validateTransition } from "../../../src/server/attempt-control/state-machine.js";
import { expected, failure, identity, issueCommand, root } from "./helpers.js";

const command = issueCommand({ ...root, databaseToken: randomUUID(), projectId: randomUUID(), authorityIncarnation: randomUUID() });
const { eventId: _event, ownerNonce: _nonce, ...fields } = command;
const current = parse(AttemptSchema, { ...fields, issueDigest: hash("issue"), attemptGeneration: 1, stateVersion: 1,
  phase: "CREATED", ownerNonceHash: hash(command.ownerNonce), ownerMode: "EXECUTION", updatedAtMs: command.createdAtMs,
  conflictHeld: 1, terminalReceiptId: null, terminalDigest: null, terminalPayload: null });
const context = { authorization: "s12-test-only" as const };

describe("contracts", () => {
  it("accepts the existing project UUID grammar and strict synthetic identity", () => {
    expect(parse(IssueSchema, command).projectId).toBe(command.projectId);
    expect(Object.isFrozen(current)).toBe(true);
    expect(PhaseSchema.options).toHaveLength(12);
  });
  it.each(["", "invalid", " "])("rejects invalid project UUID %j", (projectId) => {
    failure(() => parse(IssueSchema, { ...command, projectId }), "VALIDATION");
  });
  it.each(["taskId", "attemptId", "ownerId", "hostInstanceId", "issueRequestId"])("rejects blank %s", (key) => {
    failure(() => parse(IssueSchema, { ...command, [key]: "" }), "VALIDATION");
  });
  it.each([-1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity])("rejects invalid generation/version %s", (value) => {
    failure(() => parse(ExpectedSchema, { ...expected(current, command.ownerNonce), attemptGeneration: value }), "VALIDATION");
    failure(() => parse(ExpectedSchema, { ...expected(current, command.ownerNonce), stateVersion: value }), "VALIDATION");
  });
  it("rejects unknown fields, unknown phases, runtime activation and invalid receipts", () => {
    failure(() => parse(IssueSchema, { ...command, executionMode: "runtime" }), "VALIDATION");
    failure(() => parse(IssueSchema, { ...command, worker: true }), "VALIDATION");
    failure(() => parse(PhaseSchema, "STARTING"), "VALIDATION");
    failure(() => parse(ReceiptSchema, { receiptId: "", reason: "NORMAL", closureDigest: hash("a"), resultDigest: hash("b") }), "VALIDATION");
  });
  it("classifies zero/multiple affected rows and integer overflow", () => {
    assertOne(1); assertOne(1n);
    failure(() => assertOne(0), "CONFLICT"); failure(() => assertOne(0n), "CONFLICT");
    failure(() => assertOne(2), "INTEGRITY"); failure(() => assertOne(2n), "INTEGRITY");
    failure(() => nextInteger(Number.MAX_SAFE_INTEGER), "INTEGRITY");
  });
});
describe("pure state machine", () => {
  it("accepts a legal transition and rejects unsupported edges", () => {
    validateTransition(current, "APPROVAL_PENDING", expected(current, command.ownerNonce), context);
    failure(() => validateTransition(current, "RUNNING", expected(current, command.ownerNonce), context), "INVALID_TRANSITION");
  });
  it.each(["projectId", "attemptId", "taskId", "authorityIncarnation"])("rejects changed %s", (key) => {
    failure(() => validateTransition(current, "APPROVAL_PENDING", { ...expected(current, command.ownerNonce),
      [key]: key === "taskId" ? "different-task" : randomUUID() }, context), "IDENTITY_CONFLICT");
    expect(identity(current)).toEqual(identity(command));
  });
  it("rejects stale version, stale generation and wrong owner possession", () => {
    failure(() => validateTransition(current, "APPROVAL_PENDING", { ...expected(current, command.ownerNonce), stateVersion: 2 }, context), "CONFLICT");
    for (const change of [{ attemptGeneration: 2 }, { ownerId: randomUUID() }, { hostInstanceId: randomUUID() }, { ownerNonce: hash("wrong") }]) {
      failure(() => validateTransition(current, "APPROVAL_PENDING", { ...expected(current, command.ownerNonce), ...change }, context), "STALE_OWNER");
    }
  });
  it.each(["COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"] as const)("does not revive terminal %s", (phase) => {
    const terminal = { ...current, phase };
    for (const target of ["RUNNING", "LAUNCHING", "COMPLETED"] as const)
      failure(() => validateTransition(terminal, target, expected(terminal, command.ownerNonce), context), "INVALID_TRANSITION");
  });
  it("rejects success after stop and requires a distinct fencing operation", () => {
    const stopped = { ...current, phase: "CANCELLATION_REQUESTED" as const };
    failure(() => validateTransition(stopped, "COMPLETED", expected(stopped, command.ownerNonce), context), "INVALID_TRANSITION");
    const uncertain = { ...current, phase: "UNCERTAIN" as const };
    failure(() => validateTransition(uncertain, "RECONCILIATION_REQUIRED", expected(uncertain, command.ownerNonce), context), "INVALID_TRANSITION");
    validateTransition(uncertain, "RECONCILIATION_REQUIRED", expected(uncertain, command.ownerNonce), { ...context, fencing: true });
  });
});
