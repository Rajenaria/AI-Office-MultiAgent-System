import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import net from "node:net";
import childProcess from "node:child_process";
import { createScopedCapabilityBoundary, evaluateScopedActionAuthorization, type MockAction,
  type ScopedReceipt, type ScopedPreparation } from "../../src/contracts/testing/scoped-capability.js";
import { createFakeAuthorityAdapter, type AuthoritySeed } from "../../src/contracts/testing/fake-authority-adapter.js";
import { createMockEnforcementBoundary, type MockFixtureSeed } from "../../src/contracts/testing/mock-enforcement.js";
import { evaluateWorkerAdmission, type AdmissionRequest, type OutputEnvelope } from "../../src/contracts/execution-fence.js";

const ADMIT = "MOCK_ADMISSION_RECORD";
const PUB = "MOCK_PUBLICATION_RECORD";
const foreignProject = "22222222-2222-4222-8222-222222222222";
function fixture() {
  const identity = { projectId: "11111111-1111-4111-8111-111111111111", sessionId: "session-a",
    ownerId: "owner-a", runId: "run-a", workerId: "worker-a", taskScope: "review" };
  const proof = () => ({ evidenceId: "dummy-proof", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 });
  const assertion = () => ({ status: "VERIFIED" as const, evidence: proof() });
  const mock: MockFixtureSeed = {
    context: { identity: { ...identity }, epoch: 2, policyVersion: "v1", nowMs: 150,
      lifecycle: "APPROVAL_GRANTED", cancellation: "CLEAR", authorization: assertion(),
      securityStop: { state: "CLEARED", clearance: proof() }, containment: assertion(), outputFence: assertion(), provider: null },
    policy: { policyId: "dummy-policy", version: "v1", status: "ACTIVE", validFromMs: 100, expiresAtMs: 200,
      scope: { projectId: identity.projectId, ownerId: identity.ownerId, sessionId: identity.sessionId },
      admission: { enabled: true, workerTypes: ["reviewer"], taskScopes: ["review"] },
      publication: { enabled: true, sequenceRequired: true, destinations: [{ destinationId: "panel-a",
        projectId: identity.projectId, ownerId: identity.ownerId, sessionId: identity.sessionId,
        channels: ["text"], classifications: ["PUBLIC", "INTERNAL"] }] }, providers: [] },
    destinationId: "panel-a", sequence: { min: 1, max: 100, lastAccepted: null, seenOutputIds: [] },
  };
  const seed: AuthoritySeed = { authorityInstanceId: "authority-a", nowMs: 150, fixture: mock };
  const request: AdmissionRequest = { requestId: "request-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", workerType: "reviewer", providerId: null };
  const output: OutputEnvelope = { outputId: "event-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", destinationId: "panel-a", channel: "text", classification: "INTERNAL", sequence: 1 };
  return { seed, mock, request, output };
}
const spec = (actions: MockAction[] = [ADMIT], usagePolicy: "SINGLE_USE" | "REUSABLE" = "SINGLE_USE") =>
  ({ allowedActions: actions, taskScope: "review", destinationScope: "panel-a", expiresAtMs: 190, usagePolicy });
function harness(f = fixture()) {
  const { boundary: b, owner: o } = createScopedCapabilityBoundary(f.seed);
  const issue = (s = spec()) => { const r = o.issueCapability(s); expect(r.outcome).toBe("MOCK_CAPABILITY_ISSUED");
    if (r.outcome !== "MOCK_CAPABILITY_ISSUED") throw new Error("Expected mock capability"); return r.capability; };
  const admit = (operationId = "admit-a") => ({ operationId, action: ADMIT, destinationId: "panel-a", request: structuredClone(f.request) });
  const pub = (operationId = "publish-a", output = f.output) => ({ operationId, action: PUB, output: structuredClone(output) });
  const change = (c: Record<string, unknown>) => o.applyAuthorityChange({ expectedAuthorityRevision: b.snapshot().authority.authorityRevision, ...c });
  const caps = () => b.snapshot().capabilities;
  return { f, b, o, issue, admit, pub, change, caps };
}
function publication(usage: "SINGLE_USE" | "REUSABLE" = "SINGLE_USE") {
  const h = harness(); const a = h.issue(); const c = h.issue(spec([PUB], usage));
  expect(h.b.attemptScopedAdmission(h.admit(), a).outcome).toBe("MOCK_SCOPED_RECORDED"); return { ...h, c };
}
function denied(r: ScopedReceipt, reason?: string) {
  expect(r.outcome).toBe("MOCK_SCOPED_DENIED"); if (reason) expect(r.reason).toBe(reason);
  expect(r.executionAuthority).toBe(false); expect(r.consumedByThisOperation).toBe(false);
}
function ticket(p: ScopedReceipt | ScopedPreparation) {
  expect(p.outcome).toBe("MOCK_SCOPED_PREPARED");
  if (p.outcome !== "MOCK_SCOPED_PREPARED") throw new Error("Expected preparation"); return p.ticket;
}
function gate() { let release!: () => void; const wait = new Promise<void>(r => { release = r; }); return { wait, release }; }
function pure() { const h = harness(); h.issue(); const s = h.b.snapshot(); return { h, c: s.capabilities[0]!, s: s.current,
  r: { action: ADMIT, identity: structuredClone(h.f.request.identity), epoch: 2, policyVersion: "v1", destinationId: "panel-a" } }; }

describe("R8 scoped issuance", () => {
  it("R8T01 valid owner issues opaque bounded capability", () => {
    const h = harness(); const c = h.issue(); expect(Object.isFrozen(c)).toBe(true);
    expect(Object.keys(c)).toEqual(["mockOnly", "executionAuthority"]);
    expect(h.caps()[0]).toMatchObject({ consumed: false, uses: 0, grant: { taskScope: "review", destinationScope: "panel-a",
      allowedActions: [ADMIT], issuedAtMs: 150, expiresAtMs: 190, binding: { authorityGeneration: 1, authorizationRevision: 1 } } });
  });
  it("R8T02 missing issuer record denies issuance", () => {
    const f = fixture(); f.seed.fixture = null; const h = harness(f);
    expect(h.o.issueCapability(spec())).toMatchObject({ outcome: "MOCK_SCOPE_CHANGE_DENIED", reason: "ISSUER_UNAVAILABLE" });
  });
  it("R8T03 untrusted boundary has no issuer and fabricated owner input denies", () => {
    const h = harness(); expect(h.b).not.toHaveProperty("issueCapability");
    expect(h.o.issueCapability({ ...spec(), issuer: "owner-a" }).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED"); expect(h.caps()).toEqual([]);
  });
  it.each([
    ["R8T04 invalid action set", { ...spec(), allowedActions: ["EXECUTE_TOOL"] }],
    ["R8T05 empty action set", { ...spec(), allowedActions: [] }],
    ["R8T06 missing task", { allowedActions: [ADMIT], destinationScope: "panel-a", expiresAtMs: 190, usagePolicy: "SINGLE_USE" }],
    ["R8T07 missing destination", { allowedActions: [ADMIT], taskScope: "review", expiresAtMs: 190, usagePolicy: "SINGLE_USE" }],
    ["R8T08 invalid expiry", { ...spec(), expiresAtMs: -1 }],
  ])("%s denies without state change", (_name, input) => {
    const h = harness(); const before = h.b.snapshot();
    expect(h.o.issueCapability(input).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T09 caller cannot expand actions through snapshot or cloned handle", () => {
    const h = publication(); const s = h.b.snapshot(); s.capabilities[1]!.grant.allowedActions.push(ADMIT);
    denied(h.b.attemptScopedAdmission(h.admit("other"), h.c), "ACTION_NOT_ALLOWED");
    denied(h.b.attemptScopedAdmission(h.admit("other"), { ...h.c, allowedActions: [ADMIT] }), "CAPABILITY_INVALID");
  });
  it("R8T10 caller cannot extend expiry through metadata", () => {
    const h = harness(); const c = h.issue(); h.caps()[0]!.grant.expiresAtMs = 9999;
    h.change({ kind: "ADVANCE_TIME", nowMs: 190 }); denied(h.b.attemptScopedAdmission(h.admit(), c), "AUTHORIZATION_EXPIRED");
  });
});

describe("R8 actions and task", () => {
  it("R8T11 correct admission records R7 R6 receipt", () => {
    const h = harness(); const c = h.issue(); const r = h.b.attemptScopedAdmission(h.admit(), c);
    expect(r.outcome).toBe("MOCK_SCOPED_RECORDED"); expect(r.innerReceipt?.provenance).toBe("FAKE_AUTHORITY_PROVENANCE_VERIFIED");
    expect(r.innerReceipt?.boundaryReceipt?.outcome).toBe("MOCK_ADMISSION_RECORDED");
  });
  it("R8T12 correct publication records permitted sink entry", () => {
    const h = publication(); expect(h.b.attemptScopedPublication(h.pub(), h.c).outcome).toBe("MOCK_SCOPED_RECORDED");
    expect(h.b.snapshot().authority.active!.publications).toHaveLength(1);
  });
  it("R8T13 admission permission denies publication", () => {
    const h = harness(); denied(h.b.attemptScopedPublication(h.pub(), h.issue()), "ACTION_NOT_ALLOWED");
  });
  it("R8T14 publication permission denies admission", () => {
    const h = harness(); denied(h.b.attemptScopedAdmission(h.admit(), h.issue(spec([PUB]))), "ACTION_NOT_ALLOWED");
  });
  it("R8T15 unsupported action denies", () => {
    const h = harness(); denied(h.b.attemptScopedAdmission({ ...h.admit(), action: "PROVIDER_INVOKE" }, h.issue()), "UNKNOWN_ACTION");
  });
  it("R8T16 missing action denies", () => {
    const h = harness(); const { action: _a, ...op } = h.admit(); denied(h.b.attemptScopedAdmission(op, h.issue()));
  });
  it("R8T17 caller action array cannot smuggle additional authority", () => {
    const h = harness(); denied(h.b.attemptScopedAdmission({ ...h.admit(), action: [ADMIT, PUB] }, h.issue()), "INVALID_ACTION_REQUEST");
  });
  it("R8T18 revoked action denies future operations and issuance", () => {
    const h = harness(); const c = h.issue(); h.o.revokeAction(ADMIT);
    denied(h.b.attemptScopedAdmission(h.admit(), c), "ACTION_REVOKED"); expect(h.o.issueCapability(spec()).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED");
  });
  it("R8T19 stale request policy denies", () => {
    const h = harness(); const op = h.admit(); op.request.policyVersion = "v0";
    denied(h.b.attemptScopedAdmission(op, h.issue()), "POLICY_VERSION_STALE");
  });
  it("R8T20 wrong subject denies genuine transferred handle", () => {
    const h = harness(); const c = h.issue(); const op = h.admit(); op.request.identity.ownerId = "other-owner";
    denied(h.b.attemptScopedAdmission(op, c), "SUBJECT_MISMATCH");
  });
  it("R8T21 exact canonical task is eligible without mutation", () => {
    const p = pure(); const before = structuredClone([p.r, p.c, p.s]);
    expect(evaluateScopedActionAuthorization(p.r, p.c, p.s)).toMatchObject({ outcome: "MOCK_ACTION_ELIGIBLE", reason: "SCOPE_ELIGIBLE", executionAuthority: false });
    expect([p.r, p.c, p.s]).toEqual(before);
  });
  it("R8T22 wrong task denies", () => {
    const h = harness(); const op = h.admit(); op.request.identity.taskScope = "review-other";
    denied(h.b.attemptScopedAdmission(op, h.issue()), "TASK_SCOPE_MISMATCH");
  });
  it("R8T23 missing task denies", () => {
    const h = harness(); const op = h.admit(); const { taskScope: _t, ...identity } = op.request.identity;
    denied(h.b.attemptScopedAdmission({ ...op, request: { ...op.request, identity } }, h.issue()), "INVALID_ACTION_REQUEST");
  });
  it("R8T24 cross project task denies", () => {
    const h = harness(); const op = h.admit(); op.request.identity.projectId = foreignProject;
    denied(h.b.attemptScopedAdmission(op, h.issue()), "OWNERSHIP_CONFLICT");
  });
  it("R8T25 cancelled task denies", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "CANCEL" }); denied(h.b.attemptScopedAdmission(h.admit(), c));
    expect(h.b.snapshot().authority.active!.admission).toBeNull();
  });
  it("R8T26 terminal task denies", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "TERMINATE" }); denied(h.b.attemptScopedAdmission(h.admit(), c));
  });
  it("R8T27 reused task with new incarnation rejects old capability", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "REINCARNATE_RUN", fixture: h.f.mock });
    denied(h.b.attemptScopedAdmission(h.admit(), c), "INCARNATION_MISMATCH");
    expect(h.b.attemptScopedAdmission(h.admit(), h.issue()).outcome).toBe("MOCK_SCOPED_RECORDED");
  });
  it("R8T28 canonical owner change rejects old subject binding", () => {
    const p = pure(); p.s.binding!.subjectId = "new-owner";
    expect(evaluateScopedActionAuthorization(p.r, p.c, p.s).reason).toBe("SUBJECT_MISMATCH");
  });
});

describe("R8 exact destination binding", () => {
  it("R8T29 exact destination is accepted", () => {
    const h = publication(); expect(h.b.attemptScopedPublication(h.pub(), h.c).outcome).toBe("MOCK_SCOPED_RECORDED");
  });
  it("R8T30 wrong destination denies", () => {
    const h = publication(); const op = h.pub(); op.output.destinationId = "panel-b";
    denied(h.b.attemptScopedPublication(op, h.c), "DESTINATION_SCOPE_MISMATCH");
  });
  it("R8T31 missing destination denies", () => {
    const h = publication(); const op = h.pub(); const { destinationId: _d, ...output } = op.output;
    denied(h.b.attemptScopedPublication({ ...op, output }, h.c), "INVALID_ACTION_REQUEST");
  });
  it.each([
    ["R8T32 cross project destination", "projectId", foreignProject],
    ["R8T33 cross session destination", "sessionId", "other-session"],
    ["R8T35 reassigned destination", "ownerId", "other-owner"],
  ])("%s denies canonical mismatch", (_name, field, value) => {
    const p = pure(); Object.assign(p.s.destination!, { [field]: value });
    expect(evaluateScopedActionAuthorization(p.r, p.c, p.s).reason).toBe("DESTINATION_SCOPE_MISMATCH");
    const f = fixture(); Object.assign(f.mock.policy.publication.destinations[0]!, { [field]: value }); const h = harness(f);
    expect(h.o.issueCapability(spec()).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED");
  });
  it("R8T34 destination prefix gives no permission", () => {
    const h = publication(); const op = h.pub(); op.output.destinationId = "panel-a-extra";
    denied(h.b.attemptScopedPublication(op, h.c), "DESTINATION_SCOPE_MISMATCH");
  });
  it("R8T36 destination reuse under new epoch denies", () => {
    const h = publication(); h.change({ kind: "ADVANCE_EPOCH", executionEpoch: 3 });
    denied(h.b.attemptScopedPublication(h.pub(), h.c), "EPOCH_STALE");
  });
});

describe("R8 consumption and ordered barriers", () => {
  it("R8T37 first single use consumption records once", () => {
    const h = publication(); expect(h.b.attemptScopedPublication(h.pub(), h.c)).toMatchObject({ outcome: "MOCK_SCOPED_RECORDED", consumedByThisOperation: true });
    expect(h.caps()[1]).toMatchObject({ consumed: true, uses: 1 });
  });
  it("R8T38 duplicate use cannot change sink or sequence", () => {
    const h = publication(); h.b.attemptScopedPublication(h.pub(), h.c); const before = h.b.snapshot();
    denied(h.b.attemptScopedPublication(h.pub("second", { ...h.f.output, outputId: "event-b", sequence: 2 }), h.c), "CAPABILITY_ALREADY_CONSUMED");
    expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T39 gated competing admissions consume at most once", async () => {
    const h = harness(); const c = h.issue(); const a = ticket(h.b.prepareAdmission(h.admit("a"), c));
    const b = ticket(h.b.prepareAdmission(h.admit("b"), c)); const g = gate();
    const pending = g.wait.then(() => h.b.commitAdmission(b)); const first = h.b.commitAdmission(a); g.release();
    expect(first.outcome).toBe("MOCK_SCOPED_RECORDED"); denied(await pending, "STALE_SCOPE");
    expect(h.caps()[0]!.uses).toBe(1); expect(h.b.snapshot().authority.active!.consumedOperationIds).toEqual(["a"]);
  });
  it("R8T40 R5 rejected worker does not consume", () => {
    const h = harness(); const c = h.issue(); const before = h.b.snapshot(); const op = h.admit(); op.request.workerType = "other";
    denied(h.b.attemptScopedAdmission(op, c)); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T41 success consumes alongside R6 admission", () => {
    const h = harness(); const c = h.issue(); h.b.attemptScopedAdmission(h.admit(), c); const s = h.b.snapshot();
    expect(s.capabilities[0]).toMatchObject({ consumed: true, uses: 1 }); expect(s.authority.active!.admission?.operationId).toBe("admit-a");
  });
  it("R8T42 reset and fresh record cannot replay former capability", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "RESET_AUTHORITY" }); h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock });
    denied(h.b.attemptScopedAdmission(h.admit(), c), "AUTHORITY_MISMATCH");
    h.issue(); expect(h.caps()[0]!.grant.capabilityId).not.toBe(h.caps()[1]!.grant.capabilityId);
  });
  it("R8T43 policy revision rejects stale capability", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "REVISE_POLICY", policyVersion: "v2" });
    denied(h.b.attemptScopedAdmission(h.admit(), c), "POLICY_VERSION_STALE");
  });
  it("R8T44 record recreation invalidates capability incarnation", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock });
    denied(h.b.attemptScopedAdmission(h.admit(), c), "INCARNATION_MISMATCH");
  });
  it("R8T45 revoke before pending admission denies without effect", () => {
    const h = harness(); const c = h.issue(); const t = ticket(h.b.prepareAdmission(h.admit(), c)); h.o.revokeCapability(c);
    const before = h.b.snapshot(); denied(h.b.commitAdmission(t), "STALE_SCOPE"); expect(h.b.snapshot()).toEqual(before);
    denied(h.b.attemptScopedAdmission(h.admit(), c), "AUTHORIZATION_REVOKED");
  });
  it("R8T46 revoke before pending publication denies without effect", () => {
    const h = publication(); const t = ticket(h.b.preparePublication(h.pub(), h.c)); h.o.revokeCapability(h.c);
    const before = h.b.snapshot(); denied(h.b.commitPublication(t), "STALE_SCOPE"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T47 admission before revocation remains recorded", () => {
    const h = harness(); const c = h.issue(spec([ADMIT], "REUSABLE")); h.b.attemptScopedAdmission(h.admit(), c); h.o.revokeCapability(c);
    expect(h.b.snapshot().authority.active!.admission).not.toBeNull(); denied(h.b.attemptScopedAdmission(h.admit("b"), c), "AUTHORIZATION_REVOKED");
  });
  it("R8T48 publication before revocation remains recorded", () => {
    const h = publication("REUSABLE"); h.b.attemptScopedPublication(h.pub(), h.c); h.o.revokeCapability(h.c);
    denied(h.b.attemptScopedPublication(h.pub("b", { ...h.f.output, outputId: "b", sequence: 2 }), h.c), "AUTHORIZATION_REVOKED");
    expect(h.b.snapshot().authority.active!.publications).toHaveLength(1);
  });
  it("R8T49 security stop invalidates pending use and latches across recreation", () => {
    const h = publication(); const t = ticket(h.b.preparePublication(h.pub(), h.c)); h.change({ kind: "ACTIVATE_SECURITY_STOP" });
    denied(h.b.commitPublication(t), "STALE_SCOPE"); denied(h.b.attemptScopedPublication(h.pub(), h.c), "SECURITY_STOP_ACTIVE");
    h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock }); expect(h.o.issueCapability(spec()).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED");
  });
  it("R8T50 cancellation before pending consumption rejects", () => {
    const h = publication(); const t = ticket(h.b.preparePublication(h.pub(), h.c)); h.change({ kind: "CANCEL" });
    const before = h.b.snapshot(); denied(h.b.commitPublication(t), "STALE_SCOPE"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T51 gated publications using one capability commit at most once", async () => {
    const h = publication(); const t1 = ticket(h.b.preparePublication(h.pub("a"), h.c));
    const t2 = ticket(h.b.preparePublication(h.pub("b", { ...h.f.output, outputId: "event-b" }), h.c));
    const g = gate(); const pending = g.wait.then(() => h.b.commitPublication(t2));
    expect(h.b.commitPublication(t1).outcome).toBe("MOCK_SCOPED_RECORDED"); g.release(); denied(await pending, "STALE_SCOPE");
    const s = h.b.snapshot(); expect(s.authority.active!.publications).toHaveLength(1); expect(s.capabilities[1]!.uses).toBe(1);
    expect(s.authority.active!.fixture!.sequence.lastAccepted).toBe(1);
  });
  it("R8T52 consume failure prevents R6 commit and permits exact retry", () => {
    const h = publication(); const before = h.b.snapshot(); h.o.injectFailure("CAPABILITY_CONSUMPTION");
    denied(h.b.attemptScopedPublication(h.pub(), h.c), "CAPABILITY_CONSUMPTION_FAILED"); expect(h.b.snapshot()).toEqual(before);
    expect(h.b.attemptScopedPublication(h.pub(), h.c).outcome).toBe("MOCK_SCOPED_RECORDED");
  });
});

describe("R8 authenticity and integration boundaries", () => {
  it("R8T53 forged capability metadata cannot authorize", () => {
    const h = harness(); h.issue(); denied(h.b.attemptScopedAdmission(h.admit(), h.caps()[0]), "CAPABILITY_INVALID");
  });
  it("R8T54 serialized R7 authority reference alone grants no action", () => {
    const h = harness(); const ref = createFakeAuthorityAdapter(h.f.seed).owner.issueEvidence();
    denied(h.b.attemptScopedAdmission(h.admit(), JSON.parse(JSON.stringify(ref))), "CAPABILITY_INVALID");
  });
  it("R8T55 foreign instance handle with identical public bindings denies", () => {
    const h = harness(); denied(h.b.attemptScopedAdmission(h.admit(), harness().issue()), "CAPABILITY_INVALID");
  });
  it("R8T56 every public receipt retains executionAuthority false", () => {
    const h = harness(); const c = h.issue(); const p = h.b.prepareAdmission(h.admit(), c);
    expect(p.executionAuthority).toBe(false); const r = h.b.commitAdmission(ticket(p));
    expect([c.executionAuthority, r.executionAuthority, r.innerReceipt!.executionAuthority, r.innerReceipt!.boundaryReceipt!.executionAuthority]).toEqual([false, false, false, false]);
    expect(h.o.revokeCapability(c).executionAuthority).toBe(false);
  });
  it("R8T57 no provider or process call occurs during capability operations", () => {
    const f = fixture(); const blocked = () => { throw new Error("Unexpected side effect"); };
    const spies = [vi.spyOn(globalThis, "fetch").mockImplementation(blocked), vi.spyOn(childProcess, "spawn").mockImplementation(blocked),
      vi.spyOn(net, "connect").mockImplementation(blocked), vi.spyOn(Date, "now").mockImplementation(blocked), vi.spyOn(Math, "random").mockImplementation(blocked)];
    let result: ScopedReceipt | undefined;
    try { const h = harness(f); result = h.b.attemptScopedAdmission(h.admit(), h.issue()); }
    finally { for (const spy of spies) spy.mockRestore(); }
    expect(result?.outcome).toBe("MOCK_SCOPED_RECORDED");
  });
  it("R8T58 mock publication does not write files or deliver messages", () => {
    const h = publication(); const spies = [vi.spyOn(fs, "writeFileSync").mockImplementation(() => { throw new Error("Unexpected IO"); }),
      vi.spyOn(globalThis, "fetch").mockImplementation(() => { throw new Error("Unexpected delivery"); })];
    let r: ScopedReceipt | undefined;
    try { r = h.b.attemptScopedPublication(h.pub(), h.c); } finally { for (const spy of spies) spy.mockRestore(); }
    expect(r?.outcome).toBe("MOCK_SCOPED_RECORDED"); expect(h.b.snapshot().authority.active!.publications).toHaveLength(1);
  });
  it("R8T59 production source has no import or export of test capability module", () => {
    // Read-only static inspection; no application imports or startup.
    const root = new URL("../../src/", import.meta.url); const files = fs.readdirSync(root, { recursive: true, withFileTypes: true });
    const hits: string[] = [];
    for (const file of files) {
      if (!file.isFile() || !/\.[cm]?[jt]sx?$/.test(file.name)) continue;
      const path = `${file.parentPath}/${file.name}`;
      if (path.replaceAll("\\", "/").includes("/contracts/testing/")) continue;
      if (fs.readFileSync(path, "utf8").includes("scoped-capability")) hits.push(path);
    }
    expect(hits).toEqual([]);
  });
  it("R8T60 actual R5 R6 R7 APIs retain their distinct outcomes", () => {
    const f = fixture(); expect(evaluateWorkerAdmission(f.request, f.mock.context, f.mock.policy).outcome).toBe("ELIGIBLE_FOR_ADMISSION");
    expect(createMockEnforcementBoundary(f.mock).boundary.attemptMockAdmission({ operationId: "a", expectedStateVersion: 0, request: f.request }).outcome).toBe("MOCK_ADMISSION_RECORDED");
    const r7 = createFakeAuthorityAdapter(f.seed);
    expect(r7.adapter.attemptAuthorityBackedMockAdmission({ operationId: "a", request: f.request }, r7.owner.issueEvidence()).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
});

describe("R8 adversarial and failure atomicity", () => {
  it.each(["BEFORE_COMMIT", "PUBLICATION_APPEND"] as const)("R8T61 %s failure preserves consumption sink sequence seen IDs and keys", point => {
    const h = publication(); const before = h.b.snapshot(); expect(h.o.injectFailure(point)).toBe(true);
    denied(h.b.attemptScopedPublication(h.pub(), h.c)); expect(h.b.snapshot()).toEqual(before);
    expect(h.b.attemptScopedPublication(h.pub(), h.c).outcome).toBe("MOCK_SCOPED_RECORDED");
  });
  it("R8T62 R6 denies publication without recorded admission after scope eligibility", () => {
    const h = harness(); const c = h.issue(spec([PUB])); const before = h.b.snapshot();
    denied(h.b.attemptScopedPublication(h.pub(), c)); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T63 duplicate operation key cannot consume fresh capability", () => {
    const h = publication(); const c2 = h.issue(spec([PUB])); h.b.attemptScopedPublication(h.pub(), h.c); const before = h.b.snapshot();
    denied(h.b.attemptScopedPublication(h.pub("publish-a", { ...h.f.output, outputId: "event-b", sequence: 2 }), c2));
    expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T64 new issuance invalidates pending ticket without consumption", () => {
    const h = harness(); const c = h.issue(); const t = ticket(h.b.prepareAdmission(h.admit(), c)); h.issue(); const before = h.b.snapshot();
    denied(h.b.commitAdmission(t), "STALE_SCOPE"); expect(h.b.snapshot()).toEqual(before);
  });
  it.each(["task", "destination", "action"] as const)("R8T65 pending %s revocation wins", kind => {
    const h = publication(); const t = ticket(h.b.preparePublication(h.pub(), h.c));
    if (kind === "task") h.o.revokeTask("review"); else if (kind === "destination") h.o.revokeDestination("panel-a"); else h.o.revokeAction(PUB);
    const before = h.b.snapshot(); denied(h.b.commitPublication(t), "STALE_SCOPE"); denied(h.b.attemptScopedPublication(h.pub(), h.c)); expect(h.b.snapshot()).toEqual(before);
  });
  it.each(["task", "destination"] as const)("R8T66 canonical %s change while pending denies old ticket and handle", kind => {
    const h = publication(); const t = ticket(h.b.preparePublication(h.pub(), h.c)); const f = structuredClone(h.f.mock);
    if (kind === "task") f.context.identity.taskScope = "new-task";
    else { f.destinationId = "new-panel"; f.policy.publication.destinations[0]!.destinationId = "new-panel"; }
    expect(h.change({ kind: "RECREATE_RECORD", fixture: f }).outcome).toBe("FAKE_AUTHORITY_UPDATED"); const before = h.b.snapshot();
    denied(h.b.commitPublication(t), "STALE_SCOPE"); denied(h.b.attemptScopedPublication(h.pub(), h.c)); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T67 reusable permission increments use count only on accepted publications", () => {
    const h = publication("REUSABLE"); h.b.attemptScopedPublication(h.pub(), h.c);
    expect(h.b.attemptScopedPublication(h.pub("b", { ...h.f.output, outputId: "event-b", sequence: 2 }), h.c)).toMatchObject({ outcome: "MOCK_SCOPED_RECORDED", consumedByThisOperation: false });
    expect(h.caps()[1]).toMatchObject({ consumed: false, uses: 2 });
  });
  it("R8T68 pure supplied metadata eligibility is no authenticity proof", () => {
    const p = pure(); expect(evaluateScopedActionAuthorization(p.r, structuredClone(p.c), p.s).outcome).toBe("MOCK_ACTION_ELIGIBLE");
    denied(p.h.b.attemptScopedAdmission(p.h.admit(), structuredClone(p.c)), "CAPABILITY_INVALID");
  });
  it("R8T69 serialized genuine handle loses private origin", () => {
    const h = harness(); const c = h.issue(); denied(h.b.attemptScopedAdmission(h.admit(), JSON.parse(JSON.stringify(c))), "CAPABILITY_INVALID");
  });
  it("R8T70 ingress getter is rejected without invocation or leakage", () => {
    const h = harness(); const c = h.issue(); const before = h.b.snapshot(); let invoked = false;
    const op = { ...h.admit(), get action() { invoked = true; throw new Error("SECRET_SENTINEL"); } };
    const r = h.b.attemptScopedAdmission(op, c); denied(r, "INVALID_ACTION_REQUEST"); expect(invoked).toBe(false);
    expect(JSON.stringify(r)).not.toContain("SECRET_SENTINEL"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T71 proxy-triggered revocation during ingress precedes validation", () => {
    const h = harness(); const c = h.issue(); let once = false;
    const op = new Proxy(h.admit(), { ownKeys(target) { if (!once) { once = true; h.o.revokeCapability(c); } return Reflect.ownKeys(target); } });
    denied(h.b.attemptScopedAdmission(op, c), "AUTHORIZATION_REVOKED"); expect(h.caps()[0]!.uses).toBe(0);
  });
  it("R8T72 exact expiry boundary rejects with no clock dependency", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "ADVANCE_TIME", nowMs: 190 }); const before = h.b.snapshot();
    denied(h.b.attemptScopedAdmission(h.admit(), c), "AUTHORIZATION_EXPIRED"); expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T73 unchanged policy label with newer authorization revision rejects", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "REVISE_POLICY", policyVersion: "v1" });
    denied(h.b.attemptScopedAdmission(h.admit(), c), "AUTHORIZATION_REVISION_MISMATCH");
  });
  it("R8T74 pure expiry revocation and current revision deny independently", () => {
    const p = pure(); p.c.revoked = true; expect(evaluateScopedActionAuthorization(p.r, p.c, p.s).reason).toBe("AUTHORIZATION_REVOKED");
    p.c.revoked = false; p.s.binding!.authorizationRevision++; expect(evaluateScopedActionAuthorization(p.r, p.c, p.s).reason).toBe("AUTHORIZATION_REVISION_MISMATCH");
  });
  it("R8T75 method relabeling cannot turn publication permission into admission", () => {
    const h = harness(); const c = h.issue(spec([PUB])); denied(h.b.attemptScopedAdmission({ ...h.admit(), action: PUB }, c), "ACTION_MISMATCH");
  });
  it("R8T76 one single use with both actions still permits only one commit", () => {
    const h = harness(); const c = h.issue(spec([ADMIT, PUB])); h.b.attemptScopedAdmission(h.admit(), c);
    denied(h.b.attemptScopedPublication(h.pub(), c), "CAPABILITY_ALREADY_CONSUMED");
  });
  it("R8T77 no attenuation delegation owner handle or inner facade leaks", () => {
    const h = harness(); const c = h.issue(); expect(h.b).not.toHaveProperty("owner"); expect(h.b).not.toHaveProperty("adapter");
    expect(h.o).not.toHaveProperty("issueEvidence"); expect(h.o).not.toHaveProperty("delegate");
    expect(h.caps()[0]).not.toHaveProperty("reference"); expect(h.b.snapshot()).not.toHaveProperty("capability");
    expect(Reflect.set(c, "allowedActions", [PUB])).toBe(false);
  });
  it.each([150, 201, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity])("R8T78 unsafe or out-of-window expiry %s denies", expiresAtMs => {
    const h = harness(); const before = h.b.snapshot(); expect(h.o.issueCapability({ ...spec(), expiresAtMs }).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED");
    expect(h.b.snapshot()).toEqual(before);
  });
  it("R8T79 missing capability and invalid current state default deny", () => {
    const p = pure(); expect(evaluateScopedActionAuthorization(p.r, null, p.s).reason).toBe("CAPABILITY_MISSING");
    expect(evaluateScopedActionAuthorization(p.r, p.c, {}).reason).toBe("INVALID_AUTHORITY_STATE");
    denied(p.h.b.attemptScopedAdmission(p.h.admit(), null), "CAPABILITY_MISSING");
  });
  it("R8T80 empty task wildcard destination and duplicate actions cannot issue", () => {
    const h = harness(); for (const s of [{ ...spec(), taskScope: "" }, { ...spec(), destinationScope: "*" }, { ...spec(), allowedActions: [ADMIT, ADMIT] }]) {
      expect(h.o.issueCapability(s).outcome).toBe("MOCK_SCOPE_CHANGE_DENIED");
    } expect(h.caps()).toEqual([]);
  });
  it("R8T81 forged consumed ticket and wrong method cannot commit", () => {
    const h = harness(); const c = h.issue(); const t = ticket(h.b.prepareAdmission(h.admit(), c));
    denied(h.b.commitAdmission({ ...t }), "INVALID_TICKET"); denied(h.b.commitPublication(t), "INVALID_TICKET");
    expect(h.b.commitAdmission(t).outcome).toBe("MOCK_SCOPED_RECORDED"); denied(h.b.commitAdmission(t), "INVALID_TICKET");
  });
  it("R8T82 epoch rollback cannot restore capability or modify state", () => {
    const h = harness(); const c = h.issue(); h.change({ kind: "ADVANCE_EPOCH", executionEpoch: 3 }); const before = h.b.snapshot();
    expect(h.change({ kind: "ADVANCE_EPOCH", executionEpoch: 2 }).outcome).toBe("FAKE_AUTHORITY_CHANGE_DENIED");
    expect(h.b.snapshot()).toEqual(before); denied(h.b.attemptScopedAdmission(h.admit(), c), "EPOCH_STALE");
  });
  it("R8T83 same-realm reference transfer retains all binding checks", () => {
    const h = publication(); const transferred = h.c; const op = h.pub(); op.output.identity.runId = "other-run";
    denied(h.b.attemptScopedPublication(op, transferred), "RUN_CONFLICT"); op.output.identity.runId = h.f.output.identity.runId;
    op.output.identity.sessionId = "other-session"; denied(h.b.attemptScopedPublication(op, transferred), "OWNERSHIP_CONFLICT");
  });
});
