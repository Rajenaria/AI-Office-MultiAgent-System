import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import net from "node:net";
import childProcess from "node:child_process";
import { createMockEnforcementBoundary, type MockFixtureSeed, type MockPreparation,
  type MockReceipt, type MockControl } from "../../src/contracts/testing/mock-enforcement.js";
import { evaluateWorkerAdmission, evaluateOutputPublication,
  type AdmissionRequest, type OutputEnvelope } from "../../src/contracts/execution-fence.js";

function fixture() {
  const identity = { projectId: "11111111-1111-4111-8111-111111111111", sessionId: "session-a",
    ownerId: "owner-a", runId: "run-a", workerId: "worker-a", taskScope: "review" };
  const evidence = () => ({ evidenceId: "dummy-proof", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 });
  const assertion = () => ({ status: "VERIFIED" as const, evidence: evidence() });
  const seed: MockFixtureSeed = {
    context: { identity: { ...identity }, epoch: 2, policyVersion: "v1", nowMs: 150,
      lifecycle: "APPROVAL_GRANTED", cancellation: "CLEAR", authorization: assertion(),
      securityStop: { state: "CLEARED", clearance: evidence() }, containment: assertion(), outputFence: assertion(), provider: null },
    policy: { policyId: "dummy-policy", version: "v1", status: "ACTIVE", validFromMs: 100, expiresAtMs: 200,
      scope: { projectId: identity.projectId, ownerId: identity.ownerId, sessionId: identity.sessionId },
      admission: { enabled: true, workerTypes: ["reviewer"], taskScopes: ["review"] },
      publication: { enabled: true, sequenceRequired: true, destinations: [{ destinationId: "panel-a",
        projectId: identity.projectId, ownerId: identity.ownerId, sessionId: identity.sessionId,
        channels: ["text"], classifications: ["PUBLIC", "INTERNAL"] }] }, providers: [] },
    destinationId: "panel-a", sequence: { min: 1, max: 100, lastAccepted: null, seenOutputIds: [] },
  };
  const request: AdmissionRequest = { requestId: "request-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", workerType: "reviewer", providerId: null };
  const output: OutputEnvelope = { outputId: "event-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", destinationId: "panel-a", channel: "text", classification: "INTERNAL", sequence: 1 };
  return { seed, request, output };
}
function harness(f = fixture()) {
  const { boundary: b, owner } = createMockEnforcementBoundary(f.seed);
  const admission = (operationId = "admit-a") => ({ operationId, expectedStateVersion: b.snapshot().stateVersion,
    request: structuredClone(f.request) });
  const publication = (operationId = "publish-a", output = f.output) => ({ operationId,
    expectedStateVersion: b.snapshot().stateVersion, output: structuredClone(output) });
  const control = (kind: Exclude<MockControl["kind"], "ADVANCE_TIME">, operationId = "control-a") =>
    owner.applyMockControl({ operationId, expectedStateVersion: b.snapshot().stateVersion, kind });
  const start = () => { expect(b.attemptMockAdmission(admission()).outcome).toBe("MOCK_ADMISSION_RECORDED"); };
  return { f, b, owner, admission, publication, control, start };
}
function denied(receipt: MockReceipt, reason: string) {
  expect(receipt.outcome.endsWith("_DENIED")).toBe(true);
  expect(receipt.reason).toBe(reason);
  expect(receipt.executionAuthority).toBe(false);
}
function ticket(preparation: MockReceipt | MockPreparation): object {
  expect(preparation.outcome).toBe("MOCK_PREPARED");
  if (preparation.outcome !== "MOCK_PREPARED") throw new Error("Expected mock preparation");
  return preparation.ticket;
}
function gate() {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  return { wait, release };
}
const foreignProject = "22222222-2222-4222-8222-222222222222";

describe("R6 mock admission", () => {
  it("R6T01 valid synthetic admission reserves once and enters mock RUNNING", () => {
    const h = harness(); const r = h.b.attemptMockAdmission(h.admission());
    expect(r).toMatchObject({ outcome: "MOCK_ADMISSION_RECORDED", evaluatedStateVersion: 0,
      stateVersion: 1, commitOrder: 1, mockOnly: true, executionAuthority: false });
    expect(h.b.snapshot().fixture!.context.lifecycle).toBe("RUNNING");
    expect(h.b.snapshot().admission?.requestId).toBe("request-a");
  });
  const negatives: [string, (f: ReturnType<typeof fixture>) => void, string][] = [
    ["R6T02 active stop", f => { f.seed.context.securityStop.state = "ACTIVE"; }, "SECURITY_STOP_ACTIVE"],
    ["R6T03 unknown stop", f => { f.seed.context.securityStop.state = "UNKNOWN"; }, "SECURITY_STOP_UNKNOWN"],
    ["R6T04 missing stop", f => { Reflect.deleteProperty(f.seed.context, "securityStop"); }, "INVALID_MOCK_STATE"],
    ["R6T05 stale authorization policy version", f => { f.request.policyVersion = "v0"; }, "POLICY_VERSION_CONFLICT"],
    ["R6T10 wrong project ownership", f => { f.request.identity.projectId = foreignProject; }, "OWNERSHIP_CONFLICT"],
    ["R6T11 wrong session ownership", f => { f.request.identity.sessionId = "session-b"; }, "OWNERSHIP_CONFLICT"],
    ["R6T12 missing fence readiness", f => { f.seed.context.outputFence.evidence = null; }, "OUTPUT_FENCE_INVALID"],
    ["R6T13 expired supplied authorization", f => { f.seed.context.authorization.evidence!.expiresAtMs = 150; }, "AUTHORIZATION_INVALID"],
  ];
  it.each(negatives)("%s", (_name, change, reason) => {
    const f = fixture(); change(f); const h = harness(f); const before = h.b.snapshot();
    denied(h.b.attemptMockAdmission(h.admission()), reason); expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T06 revocation before admission", () => {
    const h = harness(); h.control("REVOKE_AUTHORIZATION");
    denied(h.b.attemptMockAdmission(h.admission()), "AUTHORIZATION_INVALID");
  });
  it("R6T07 cancellation before admission", () => {
    const h = harness(); h.control("CANCEL"); denied(h.b.attemptMockAdmission(h.admission()), "CANCELLED");
  });
  it("R6T08 duplicate admission cannot reserve again", () => {
    const h = harness(); h.start(); const before = h.b.snapshot();
    denied(h.b.attemptMockAdmission(h.admission()), "DUPLICATE_OPERATION");
    denied(h.b.attemptMockAdmission(h.admission("admit-b")), "ADMISSION_ALREADY_RECORDED");
    expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T09 concurrently submitted conflicting admissions have one winner", async () => {
    const h = harness(); const a = h.admission(); const b = h.admission("admit-b"); b.request.requestId = "request-b";
    const results = await Promise.all([Promise.resolve().then(() => h.b.attemptMockAdmission(a)),
      Promise.resolve().then(() => h.b.attemptMockAdmission(b))]);
    expect(results[0]!.outcome).toBe("MOCK_ADMISSION_RECORDED"); denied(results[1]!, "STALE_STATE");
    expect(h.b.snapshot().consumedOperationIds).toEqual(["admit-a"]);
  });
  it("R6T14 terminal run cannot reopen through old or fresh request replay", () => {
    const h = harness(); const old = h.admission(); h.control("TERMINATE");
    denied(h.b.attemptMockAdmission(old), "STALE_STATE");
    denied(h.b.attemptMockAdmission(h.admission()), "TERMINAL");
    expect(h.b.snapshot().admission).toBeNull();
  });
  it("R6T15 failed R5 evaluation leaves admission state and keys unchanged", () => {
    const h = harness(); const op = h.admission(); op.request.workerType = "unapproved";
    const before = h.b.snapshot(); denied(h.b.attemptMockAdmission(op), "WORKER_TYPE_DENIED");
    expect(h.b.snapshot()).toEqual(before); expect(h.b.attemptMockAdmission(h.admission()).outcome).toBe("MOCK_ADMISSION_RECORDED");
  });
});

describe("R6 mock publication", () => {
  it("R6T16 valid output appends metadata and sequence/key in one commit", () => {
    const h = harness(); h.start(); const r = h.b.attemptMockPublication(h.publication());
    expect(r).toMatchObject({ outcome: "MOCK_PUBLICATION_RECORDED", acceptedSequence: 1,
      evaluatedStateVersion: 1, stateVersion: 2, commitOrder: 2 });
    expect(h.b.snapshot().publications).toHaveLength(1);
    expect(h.b.snapshot().fixture!.sequence).toMatchObject({ lastAccepted: 1, seenOutputIds: ["event-a"] });
  });
  it("R6T17 duplicate event ID with a fresh operation cannot publish twice", () => {
    const h = harness(); h.start(); h.b.attemptMockPublication(h.publication());
    const before = h.b.snapshot(); denied(h.b.attemptMockPublication(h.publication("publish-b", { ...h.f.output, sequence: 2 })), "DUPLICATE_OUTPUT");
    expect(h.b.snapshot()).toEqual(before);
  });
  const negatives: [string, (f: ReturnType<typeof fixture>) => void, string][] = [
    ["R6T19 out-of-order sequence", f => { f.output.sequence = 0; }, "SEQUENCE_INVALID"],
    ["R6T20 sequence gap", f => { f.output.sequence = 3; }, "SEQUENCE_INVALID"],
    ["R6T21 stale epoch", f => { f.output.epoch = 1; }, "STALE_EPOCH"],
    ["R6T22 wrong producer", f => { f.output.identity.workerId = "worker-b"; }, "WORKER_CONFLICT"],
    ["R6T23 wrong destination", f => { f.output.destinationId = "panel-b"; }, "DESTINATION_DENIED"],
    ["R6T24 cross-project output", f => { f.output.identity.projectId = foreignProject; }, "OWNERSHIP_CONFLICT"],
    ["R6T25 cross-session output", f => { f.output.identity.sessionId = "session-b"; }, "OWNERSHIP_CONFLICT"],
    ["R6T26 missing confidentiality permission", f => { f.output.classification = "RESTRICTED"; }, "CONFIDENTIALITY_DENIED"],
    ["R6T27 unknown output channel", f => { f.output.channel = "shell"; }, "CHANNEL_DENIED"],
  ];
  it.each(negatives)("%s", (_name, change, reason) => {
    const h = harness(); h.start(); change(h.f); const before = h.b.snapshot();
    denied(h.b.attemptMockPublication(h.publication()), reason); expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T18 duplicate sequence with a new ID is denied without advancing history", () => {
    const h = harness(); h.start(); h.b.attemptMockPublication(h.publication());
    const before = h.b.snapshot(); denied(h.b.attemptMockPublication(h.publication("publish-b", { ...h.f.output, outputId: "event-b" })), "SEQUENCE_INVALID");
    expect(h.b.snapshot()).toEqual(before);
  });
  it.each([
    ["R6T28 output after cancellation", "CANCEL", "CANCELLED"],
    ["R6T29 output after termination", "TERMINATE", "TERMINAL"],
    ["R6T30 output after security stop", "ACTIVATE_SECURITY_STOP", "SECURITY_STOP_ACTIVE"],
  ] as const)("%s", (_name, kind, reason) => {
    const h = harness(); h.start(); h.control(kind); const before = h.b.snapshot();
    denied(h.b.attemptMockPublication(h.publication()), reason); expect(h.b.snapshot()).toEqual(before);
  });
});

describe("R6 deterministic ordering and atomic failure", () => {
  it("R6T31 cancellation commits before a gated publication commit", async () => {
    const h = harness(); h.start(); const t = ticket(h.b.prepareMockPublication(h.publication())); const g = gate();
    const pending = g.wait.then(() => h.b.commitMockPublication(t));
    h.control("CANCEL"); g.release(); denied(await pending, "STALE_STATE");
    denied(h.b.attemptMockPublication(h.publication()), "CANCELLED"); expect(h.b.snapshot().publications).toEqual([]);
  });
  it("R6T32 publication commits first; cancellation preserves it and blocks later output", async () => {
    const h = harness(); h.start(); const g = gate();
    const cancel = g.wait.then(() => h.control("CANCEL"));
    expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
    g.release(); expect((await cancel).outcome).toBe("MOCK_CONTROL_RECORDED");
    denied(h.b.attemptMockPublication(h.publication("publish-b", { ...h.f.output, outputId: "event-b", sequence: 2 })), "CANCELLED");
    expect(h.b.snapshot().publications).toHaveLength(1);
  });
  it("R6T33 security stop commits before pending admission", () => {
    const h = harness(); const t = ticket(h.b.prepareMockAdmission(h.admission())); h.control("ACTIVATE_SECURITY_STOP");
    denied(h.b.commitMockAdmission(t), "STALE_STATE"); denied(h.b.attemptMockAdmission(h.admission()), "SECURITY_STOP_ACTIVE");
    expect(h.b.snapshot().admission).toBeNull();
  });
  it("R6T34 admission commits before stop but cannot authorize later publication", () => {
    const h = harness(); h.start(); h.control("ACTIVATE_SECURITY_STOP");
    expect(h.b.snapshot().admission).not.toBeNull(); denied(h.b.attemptMockPublication(h.publication()), "SECURITY_STOP_ACTIVE");
    expect(h.b.snapshot().publications).toHaveLength(0);
  });
  it("R6T35 policy revocation between evaluation and commit invalidates the ticket", () => {
    const h = harness(); const t = ticket(h.b.prepareMockAdmission(h.admission())); h.control("REVOKE_POLICY");
    denied(h.b.commitMockAdmission(t), "STALE_STATE"); denied(h.b.attemptMockAdmission(h.admission()), "POLICY_INACTIVE");
  });
  it("R6T36 concurrent duplicate publications have exactly one append", async () => {
    const h = harness(); h.start(); const op = h.publication();
    const results = await Promise.all([Promise.resolve().then(() => h.b.attemptMockPublication(op)),
      Promise.resolve().then(() => h.b.attemptMockPublication(op))]);
    expect(results.filter(r => r.outcome === "MOCK_PUBLICATION_RECORDED")).toHaveLength(1);
    denied(results[1]!, "STALE_STATE"); expect(h.b.snapshot().publications).toHaveLength(1);
  });
  it("R6T37 two eligible prepared admissions cannot both consume version zero", () => {
    const h = harness(); const a = ticket(h.b.prepareMockAdmission(h.admission()));
    const op = h.admission("admit-b"); op.request.requestId = "request-b";
    const b = ticket(h.b.prepareMockAdmission(op));
    expect(h.b.commitMockAdmission(b).outcome).toBe("MOCK_ADMISSION_RECORDED"); denied(h.b.commitMockAdmission(a), "STALE_STATE");
    expect(h.b.snapshot().admission!.requestId).toBe("request-b");
  });
  it("R6T38 append failure rolls back sink, sequence, version and history", () => {
    const h = harness(); h.start(); const before = h.b.snapshot(); h.owner.injectMockFailure("PUBLICATION_APPEND");
    denied(h.b.attemptMockPublication(h.publication()), "MOCK_COMMIT_FAILED"); expect(h.b.snapshot()).toEqual(before);
    expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
  });
  it("R6T39 failed precommit does not consume idempotency key or leave transaction busy", () => {
    const h = harness(); const op = h.admission(); const before = h.b.snapshot(); h.owner.injectMockFailure("BEFORE_COMMIT");
    denied(h.b.attemptMockAdmission(op), "MOCK_COMMIT_FAILED"); expect(h.b.snapshot()).toEqual(before);
    expect(h.b.attemptMockAdmission(op).outcome).toBe("MOCK_ADMISSION_RECORDED");
  });
  it("R6T40 state changes after snapshot reject old versions and allow fresh re-evaluation", () => {
    const h = harness(); const op = h.admission(); const t = ticket(h.b.prepareMockAdmission(op));
    h.owner.applyMockControl({ operationId: "advance-time", expectedStateVersion: 0, kind: "ADVANCE_TIME", nowMs: 151 });
    const r = h.b.commitMockAdmission(t); denied(r, "STALE_STATE");
    expect(r).toMatchObject({ evaluatedStateVersion: 0, stateVersion: 1, commitOrder: 1 });
    expect(h.b.attemptMockAdmission(h.admission()).outcome).toBe("MOCK_ADMISSION_RECORDED");
  });
});

describe("R6 boundary and R5 compatibility", () => {
  it("R6T41 identical schedules yield identical frozen receipt structures", () => {
    const run = () => { const h = harness(); return [h.b.attemptMockAdmission(h.admission()), h.b.attemptMockPublication(h.publication()), h.control("CANCEL")]; };
    const a = run(); expect(run()).toEqual(a);
    for (const r of a) { expect(Object.isFrozen(r)).toBe(true); expect(Reflect.set(r, "executionAuthority", true)).toBe(false); }
  });
  it("R6T42 seed and nested snapshots cannot mutate private owned state", () => {
    const h = harness(); h.f.seed.context.securityStop.state = "ACTIVE";
    const snap = h.b.snapshot(); snap.fixture!.policy.admission.enabled = false;
    snap.fixture!.context.authorization.evidence = null; snap.consumedOperationIds.push("admit-a");
    h.start(); const p = h.b.snapshot(); p.admission!.requestId = "stolen";
    expect(h.b.snapshot().admission!.requestId).toBe("request-a");
  });
  it("R6T43 fabricated receipts/tickets cannot authorize or commit execution", () => {
    const h = harness(); denied(h.b.commitMockAdmission({ mockOnly: true, executionAuthority: true }), "INVALID_TICKET");
    const r = h.b.attemptMockAdmission(h.admission()); expect(r.executionAuthority).toBe(false);
    denied(h.b.commitMockAdmission(r), "INVALID_TICKET");
    expect(Object.keys(h.b)).not.toContain("dispatch"); expect(Object.keys(h.b)).not.toContain("clearSecurityStop");
  });
  function effectProbe() {
    const h = harness();
    const spies = [vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs.promises, "readFile"),
      vi.spyOn(fs.promises, "writeFile"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(childProcess, "spawn"), vi.spyOn(childProcess, "fork"), vi.spyOn(childProcess, "exec"),
      vi.spyOn(globalThis, "fetch"), vi.spyOn(Date, "now"), vi.spyOn(Math, "random")];
    try {
      const a = h.b.attemptMockAdmission(h.admission()); const p = h.b.attemptMockPublication(h.publication());
      const counts = spies.map(s => s.mock.calls.length); spies.forEach(s => s.mockRestore());
      expect(a.outcome).toBe("MOCK_ADMISSION_RECORDED"); expect(p.outcome).toBe("MOCK_PUBLICATION_RECORDED");
      expect(counts).toEqual(spies.map(() => 0));
    } finally { spies.forEach(s => s.mockRestore()); }
  }
  it("R6T44 publication does not call filesystem APIs", effectProbe);
  it("R6T45 publication does not call network/provider APIs", effectProbe);
  it("R6T46 boundary does not spawn processes", effectProbe);
  it("R6T47 mock has no historical Jc interface or process-control adapter", () => {
    const h = harness(); expect(Object.keys(h.b).sort()).toEqual(["attemptMockAdmission", "attemptMockPublication",
      "commitMockAdmission", "commitMockPublication", "prepareMockAdmission", "prepareMockPublication", "snapshot"].sort());
    expect(Object.keys(h.owner).sort()).toEqual(["applyMockControl", "injectMockFailure"].sort());
  });
  it("R6T48 independent mock instances cannot share state or tickets", () => {
    const a = harness(); const b = harness(); const t = ticket(a.b.prepareMockAdmission(a.admission()));
    denied(b.b.commitMockAdmission(t), "INVALID_TICKET"); a.control("ACTIVATE_SECURITY_STOP");
    b.start(); expect(a.b.snapshot().admission).toBeNull(); expect(b.b.snapshot().stateVersion).toBe(1);
  });
  it("R6T49 malformed, cyclic and accessor inputs fail closed without mutation or secret echo", () => {
    const h = harness(); const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    let getterCalls = 0; const accessor = { get operationId() { getterCalls++; return "DUMMY_SECRET"; } };
    const before = h.b.snapshot();
    for (const bad of [undefined, null, false, [], {}, NaN, Infinity, 1n, cyclic, accessor, { ...h.admission(), secret: "DUMMY_SECRET" }]) {
      for (const r of [h.b.attemptMockAdmission(bad), h.b.attemptMockPublication(bad), h.owner.applyMockControl(bad)]) {
        expect(r.outcome.endsWith("_DENIED")).toBe(true); expect(JSON.stringify(r)).not.toContain("DUMMY_SECRET");
      }
      expect(h.b.snapshot()).toEqual(before);
    }
    expect(getterCalls).toBe(0);
  });
  it("R6T50 actual R5 contract types and evaluator semantics remain compatible", () => {
    const h = harness();
    expect(evaluateWorkerAdmission(h.f.request, h.f.seed.context, h.f.seed.policy).outcome).toBe("ELIGIBLE_FOR_ADMISSION");
    h.start(); const f = h.b.snapshot().fixture!;
    const { containment: _c, outputFence: _f, provider: _p, ...common } = f.context;
    expect(evaluateOutputPublication(h.f.output, { ...common, destinationId: f.destinationId, sequence: f.sequence }, f.policy).outcome).toBe("ELIGIBLE_FOR_PUBLICATION");
    expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
    expect(evaluateWorkerAdmission(h.f.request, h.f.seed.context, h.f.seed.policy).outcome).toBe("ELIGIBLE_FOR_ADMISSION");
  });
});

describe("R6 additional adversarial failures", () => {
  it("R6T51 cancellation during pending admission prevents reservation", () => {
    const h = harness(); const t = ticket(h.b.prepareMockAdmission(h.admission())); h.control("CANCEL");
    denied(h.b.commitMockAdmission(t), "STALE_STATE"); expect(h.b.snapshot().admission).toBeNull();
  });
  it("R6T52 stop during pending publication prevents all partial state", () => {
    const h = harness(); h.start(); const t = ticket(h.b.prepareMockPublication(h.publication())); h.control("ACTIVATE_SECURITY_STOP");
    const before = h.b.snapshot(); denied(h.b.commitMockPublication(t), "STALE_STATE"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T53 authorization revocation after evaluation invalidates pending publication", () => {
    const h = harness(); h.start(); const t = ticket(h.b.prepareMockPublication(h.publication())); h.control("REVOKE_AUTHORIZATION");
    denied(h.b.commitMockPublication(t), "STALE_STATE"); denied(h.b.attemptMockPublication(h.publication()), "AUTHORIZATION_INVALID");
  });
  it("R6T54 prepared data is independent of later caller mutation", () => {
    const h = harness(); const op = h.admission(); const t = ticket(h.b.prepareMockAdmission(op)); op.request.identity.ownerId = "attacker";
    expect(h.b.commitMockAdmission(t).outcome).toBe("MOCK_ADMISSION_RECORDED");
    const pub = h.publication(); const pt = ticket(h.b.prepareMockPublication(pub)); pub.output.identity.projectId = foreignProject;
    expect(h.b.commitMockPublication(pt).outcome).toBe("MOCK_PUBLICATION_RECORDED");
    expect(h.b.snapshot().publications[0]!.output.identity.projectId).not.toBe(foreignProject);
  });
  it("R6T55 prepared ticket is one-shot and wrong-kind use cannot publish", () => {
    const h = harness(); const t = ticket(h.b.prepareMockAdmission(h.admission()));
    denied(h.b.commitMockPublication(t), "INVALID_TICKET"); expect(h.b.commitMockAdmission(t).outcome).toBe("MOCK_ADMISSION_RECORDED");
    denied(h.b.commitMockAdmission(t), "INVALID_TICKET");
  });
  it("R6T56 throwing proxy ingress cannot strand later operations", () => {
    const h = harness(); const proxy = new Proxy({}, { getPrototypeOf() { throw new Error("DUMMY_SECRET"); } });
    denied(h.b.attemptMockAdmission(proxy), "INVALID_OPERATION"); h.start();
    expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
  });
  it("R6T57 accessor cannot reenter owner controls inside the transaction", () => {
    const h = harness(); const op = h.admission(); let calls = 0;
    Object.defineProperty(op, "request", { enumerable: true, get() { calls++; h.control("ACTIVATE_SECURITY_STOP"); return h.f.request; } });
    denied(h.b.attemptMockAdmission(op), "INVALID_OPERATION"); expect(calls).toBe(0); expect(h.b.snapshot().stateVersion).toBe(0); h.start();
  });
  it("R6T58 stale supplied owner control cannot overwrite current state", () => {
    const h = harness(); h.control("CANCEL"); const before = h.b.snapshot();
    denied(h.owner.applyMockControl({ operationId: "stale-control", kind: "ADVANCE_TIME", nowMs: 151, expectedStateVersion: 0 }), "STALE_STATE");
    expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T59 mock time is explicit and cannot move backwards", () => {
    const h = harness(); denied(h.owner.applyMockControl({ operationId: "time", expectedStateVersion: 0, kind: "ADVANCE_TIME", nowMs: 149 }), "TIME_REGRESSION");
    h.owner.applyMockControl({ operationId: "time", expectedStateVersion: 0, kind: "ADVANCE_TIME", nowMs: 200 });
    denied(h.b.attemptMockAdmission(h.admission()), "CLEARANCE_INVALID");
  });
  it("R6T60 publication requires an admission recorded by this instance", () => {
    const f = fixture(); f.seed.context.lifecycle = "RUNNING"; const h = harness(f);
    denied(h.b.attemptMockPublication(h.publication()), "ADMISSION_REQUIRED");
  });
  it("R6T61 sequence failure leaves operation key available for corrected retry", () => {
    const h = harness(); h.start(); const bad = h.publication(); bad.output.sequence = 2;
    denied(h.b.attemptMockPublication(bad), "SEQUENCE_INVALID");
    expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
    const snap = h.b.snapshot(); snap.publications[0]!.output.outputId = "changed";
    expect(h.b.snapshot().publications[0]!.output.outputId).toBe("event-a");
  });
  it("R6T62 failure after snapshot cannot partially publish or consume a ticket twice", () => {
    const h = harness(); h.start(); const t = ticket(h.b.prepareMockPublication(h.publication()));
    h.owner.injectMockFailure("BEFORE_COMMIT"); const before = h.b.snapshot();
    denied(h.b.commitMockPublication(t), "MOCK_COMMIT_FAILED"); expect(h.b.snapshot()).toEqual(before);
    denied(h.b.commitMockPublication(t), "INVALID_TICKET"); expect(h.b.attemptMockPublication(h.publication()).outcome).toBe("MOCK_PUBLICATION_RECORDED");
  });
  it("R6T63 unknown fields cannot smuggle caller-controlled context or evaluator callbacks", () => {
    const h = harness(); let calls = 0;
    denied(h.b.attemptMockAdmission({ ...h.admission(), context: h.f.seed.context }), "INVALID_OPERATION");
    denied(h.b.attemptMockAdmission({ ...h.admission(), evaluator: () => { calls++; return true; } }), "INVALID_OPERATION");
    expect(calls).toBe(0); h.start();
  });
  it("R6T64 caller receipt cannot override newer stop or cancellation state", () => {
    const h = harness(); const receipt = h.b.attemptMockAdmission(h.admission()); h.control("ACTIVATE_SECURITY_STOP");
    denied(h.b.attemptMockPublication({ ...h.publication(), admissionReceipt: receipt }), "INVALID_OPERATION");
    denied(h.b.attemptMockPublication(h.publication()), "SECURITY_STOP_ACTIVE");
  });
  it("R6T65 concurrent prepared publications with different IDs share one sequence winner", () => {
    const h = harness(); h.start(); const a = ticket(h.b.prepareMockPublication(h.publication()));
    const b = ticket(h.b.prepareMockPublication(h.publication("publish-b", { ...h.f.output, outputId: "event-b" })));
    expect(h.b.commitMockPublication(a).outcome).toBe("MOCK_PUBLICATION_RECORDED"); denied(h.b.commitMockPublication(b), "STALE_STATE");
    expect(h.b.snapshot().publications).toHaveLength(1);
  });
  it("R6T66 safety stop remains usable when seen-history capacity is exhausted", () => {
    const f = fixture(); f.seed.sequence.seenOutputIds = Array.from({ length: 4096 }, (_, i) => `old-${i}`);
    const h = harness(f); h.start(); const before = h.b.snapshot();
    denied(h.b.attemptMockPublication(h.publication()), "CAPACITY_EXCEEDED"); expect(h.b.snapshot()).toEqual(before);
    expect(h.control("ACTIVATE_SECURITY_STOP").outcome).toBe("MOCK_CONTROL_RECORDED");
    denied(h.b.attemptMockPublication(h.publication()), "SECURITY_STOP_ACTIVE");
  });
  it("R6T67 terminate then cancel cannot reopen terminal lifecycle", () => {
    const h = harness(); h.control("TERMINATE"); h.control("CANCEL", "cancel-after-terminal");
    expect(h.b.snapshot().fixture!.context.lifecycle).toBe("COMPLETED");
    expect(h.b.attemptMockAdmission(h.admission()).outcome).toBe("MOCK_ADMISSION_DENIED");
    const before = h.b.snapshot(); denied(h.control("TERMINATE", "terminate-again"), "NO_STATE_CHANGE"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R6T68 proxy trap reentry occurs before transaction and stale outer version denies", () => {
    const h = harness(); let calls = 0;
    const proxy = new Proxy(h.admission(), { getPrototypeOf(target) {
      calls++; h.control("ACTIVATE_SECURITY_STOP"); return Object.getPrototypeOf(target);
    } });
    denied(h.b.attemptMockAdmission(proxy), "STALE_STATE"); expect(calls).toBe(1);
    expect(h.b.snapshot().admission).toBeNull(); expect(h.b.snapshot().fixture!.context.securityStop.state).toBe("ACTIVE");
  });
  it("R6T69 sparse and oversized arrays are rejected without iterating huge lengths", () => {
    const h = harness(); const op = h.admission();
    for (const bad of [new Array(1000000000), new Array(3), Array.from({ length: 4097 }, () => 0)]) {
      denied(h.b.attemptMockAdmission({ ...op, request: bad }), "INVALID_OPERATION");
    }
    expect(h.b.snapshot().stateVersion).toBe(0); h.start();
  });
  it("R6T70 wrong run identity cannot reach mock sink", () => {
    const h = harness(); h.start(); const op = h.publication(); op.output.identity.runId = "run-b";
    denied(h.b.attemptMockPublication(op), "RUN_CONFLICT"); expect(h.b.snapshot().publications).toEqual([]);
  });
  it("R6T71 stale authorization proof is denied by unchanged R5 evaluator", () => {
    const f = fixture(); f.seed.context.authorization.evidence!.policyVersion = "v0";
    const h = harness(f); denied(h.b.attemptMockAdmission(h.admission()), "AUTHORIZATION_INVALID");
  });
  it("R6T72 unknown failure plan cannot invoke arbitrary code or grant authority", () => {
    const h = harness(); let calls = 0;
    expect(h.owner.injectMockFailure((() => { calls++; }) as unknown as "BEFORE_COMMIT")).toBe(false);
    expect(calls).toBe(0); h.start(); expect(h.b.attemptMockPublication(h.publication()).executionAuthority).toBe(false);
  });
});
