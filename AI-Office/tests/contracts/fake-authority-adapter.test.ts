import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import net from "node:net";
import childProcess from "node:child_process";
import { createFakeAuthorityAdapter, type AuthoritySeed, type AuthorityPreparation,
  type AuthorityReceipt, type FakeEvidenceReference } from "../../src/contracts/testing/fake-authority-adapter.js";
import { createMockEnforcementBoundary, type MockFixtureSeed } from "../../src/contracts/testing/mock-enforcement.js";
import { evaluateWorkerAdmission, type AdmissionRequest, type OutputEnvelope } from "../../src/contracts/execution-fence.js";

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
function harness(f = fixture()) {
  const { adapter: a, owner } = createFakeAuthorityAdapter(f.seed);
  const fresh = () => { const r = owner.issueEvidence(); expect(r).not.toBeNull(); return r!; };
  const ref = owner.issueEvidence();
  const admission = (operationId = "admit-a") => ({ operationId, request: structuredClone(f.request) });
  const publication = (operationId = "publish-a", output = f.output) => ({ operationId, output: structuredClone(output) });
  const update = (command: Record<string, unknown>) => owner.applyChange({ expectedAuthorityRevision: a.snapshot().authorityRevision, ...command });
  const start = () => { const r = a.attemptAuthorityBackedMockAdmission(admission(), ref); expect(r.outcome).toBe("MOCK_AUTHORITY_RECORDED"); return r; };
  return { f, a, owner, fresh, ref, admission, publication, update, start };
}
function denied(r: AuthorityReceipt, reason?: string) {
  expect(r.outcome).toBe("MOCK_AUTHORITY_DENIED"); if (reason) expect(r.reason).toBe(reason);
  expect(r.executionAuthority).toBe(false); expect(r.consumedAuthorityRevision).toBeNull();
}
function ticket(p: AuthorityReceipt | AuthorityPreparation) {
  expect(p.outcome).toBe("FAKE_AUTHORITY_PREPARED");
  if (p.outcome !== "FAKE_AUTHORITY_PREPARED") throw new Error("Expected fake preparation");
  return p.ticket;
}
function gate() { let release!: () => void; const wait = new Promise<void>(r => { release = r; }); return { wait, release }; }
const foreignProject = "22222222-2222-4222-8222-222222222222";

describe("R7 fake authority records", () => {
  it("R7T01 valid owned record and reference identify exact synthetic revisions", () => {
    const h = harness(); expect(h.a.snapshot()).toMatchObject({ valid: true, authorityGeneration: 1, authorityRevision: 1 });
    expect(h.ref).toMatchObject({ authorityInstanceId: "authority-a", authorityGeneration: 1,
      subjectId: "owner-a", incarnationId: "fake-incarnation:1", authorizationRevision: 1, issuedAtMs: 150, expiresAtMs: 200 });
  });
  it("R7T02 missing authority record denies lookup", () => {
    const f = fixture(); const ref = harness().ref; f.seed.fixture = null; const h = harness(f);
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), ref), "AUTHORITY_RECORD_MISSING");
  });
  it("R7T03 unknown authority instance denies", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, authorityInstanceId: "unknown" }), "UNKNOWN_AUTHORITY");
  });
  it("R7T04 wrong authority generation denies", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, authorityGeneration: 2 }), "AUTHORITY_GENERATION_MISMATCH");
  });
  it("R7T05 revoked record denies despite previously genuine reference", () => {
    const h = harness(); h.update({ kind: "REVOKE_AUTHORIZATION" }); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORIZATION_REVOKED");
  });
  it("R7T06 expired reference at exact end denies", () => {
    const h = harness(); h.update({ kind: "ADVANCE_TIME", nowMs: 200 }); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "EVIDENCE_EXPIRED");
  });
  it("R7T07 invalid policy version reference denies", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, policyVersion: "v0" }), "POLICY_VERSION_CONFLICT");
  });
  it("R7T08 stale authorization revision denies even when policy label is identical", () => {
    const h = harness(); h.update({ kind: "REVISE_POLICY", policyVersion: "v1" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORIZATION_REVISION_MISMATCH");
  });
  it("R7T09 cross-project request cannot override current authority", () => {
    const h = harness(); const op = h.admission(); op.request.identity.projectId = foreignProject;
    denied(h.a.attemptAuthorityBackedMockAdmission(op, h.ref), "OWNERSHIP_CONFLICT");
  });
  it("R7T10 cross-session request denies", () => {
    const h = harness(); const op = h.admission(); op.request.identity.sessionId = "other-session";
    denied(h.a.attemptAuthorityBackedMockAdmission(op, h.ref), "OWNERSHIP_CONFLICT");
  });
  it("R7T11 seed and nested snapshots are defensive copies", () => {
    const h = harness(); h.f.mock.context.securityStop.state = "ACTIVE";
    const s = h.a.snapshot(); s.currentFixture!.context.authorization.evidence = null;
    s.active!.fixture!.policy.admission.enabled = false; s.binding!.authorizationRevision = 999;
    h.start(); expect(h.a.snapshot().binding!.authorizationRevision).toBe(1);
  });
  it("R7T12 invalid record structure stays fail closed", () => {
    const h = createFakeAuthorityAdapter({ authorityInstanceId: "authority-a", nowMs: 150, fixture: {} });
    expect(h.adapter.snapshot().valid).toBe(false); expect(h.owner.issueEvidence()).toBeNull();
    denied(h.adapter.attemptAuthorityBackedMockAdmission({ operationId: "a", request: {} }, harness().ref), "INVALID_AUTHORITY_STATE");
  });
});

describe("R7 fake evidence provenance", () => {
  it("R7T13 genuine synthetic reference verifies origin and binding inside simulation", () => {
    const h = harness(); const r = h.start(); expect(r.provenance).toBe("FAKE_AUTHORITY_PROVENANCE_VERIFIED");
    expect(r.consumedAuthorityRevision).toBe(r.binding!.authorityRevision);
  });
  it("R7T14 forged instance metadata is rejected", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, authorityInstanceId: "forged-authority" }), "UNKNOWN_AUTHORITY");
  });
  it("R7T15 conflicting subject is rejected", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, subjectId: "other-owner" }), "SUBJECT_CONFLICT");
  });
  it("R7T16 conflicting run is rejected", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, runId: "other-run" }), "RUN_CONFLICT");
  });
  it("R7T17 stale incarnation cannot authorize reused run identity", () => {
    const h = harness(); h.update({ kind: "REINCARNATE_RUN", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "INCARNATION_MISMATCH");
  });
  it("R7T18 older execution epoch reference is rejected", () => {
    const h = harness(); h.update({ kind: "ADVANCE_EPOCH", executionEpoch: 3 });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "STALE_EPOCH");
  });
  it("R7T19 reset invalidates prior evidence before and after record reconstruction", () => {
    const h = harness(); h.update({ kind: "RESET_AUTHORITY" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORITY_GENERATION_MISMATCH");
    h.update({ kind: "RECREATE_RECORD", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORITY_GENERATION_MISMATCH");
    expect(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
  it("R7T20 deleted record cannot be revived by evidence replay", () => {
    const h = harness(); h.update({ kind: "DELETE_RECORD" }); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORITY_RECORD_MISSING");
  });
  it("R7T21 another instance with identical public identifiers cannot supply provenance", () => {
    const a = harness(); const b = harness(); expect(a.ref).toEqual(b.ref);
    denied(a.a.attemptAuthorityBackedMockAdmission(a.admission(), b.ref), "UNRECOGNIZED_EVIDENCE");
  });
  it("R7T22 caller authority claims cannot overwrite owned state", () => {
    const h = harness(); const before = h.a.snapshot();
    denied(h.a.attemptAuthorityBackedMockAdmission({ ...h.admission(), authority: h.a.snapshot() }, h.ref), "INVALID_OPERATION");
    denied(h.a.attemptAuthorityBackedMockAdmission({ ...h.admission(), policy: h.f.mock.policy, clearance: "CLEARED" }, h.ref), "INVALID_OPERATION");
    expect(h.a.snapshot()).toEqual(before);
  });
});

describe("R7 authority backed admission", () => {
  it("R7T23 valid admission consumes current authority and R6 version", () => {
    const h = harness(); const r = h.start(); expect(r.boundaryReceipt).toMatchObject({ outcome: "MOCK_ADMISSION_RECORDED", evaluatedStateVersion: 0, stateVersion: 1 });
    expect(r.binding).toMatchObject({ incarnationId: "fake-incarnation:1", authorizationRevision: 1, authorityRevision: 1 });
  });
  it("R7T24 missing evidence denies", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), null), "MISSING_EVIDENCE");
  });
  it.each([["R7T25 active stop admission", "ACTIVE", "SECURITY_STOP_ACTIVE"],
    ["R7T26 unknown stop admission", "UNKNOWN", "SECURITY_STOP_UNKNOWN"]] as const)("%s", (_name, state, reason) => {
    const f = fixture(); f.mock.context.securityStop.state = state; const h = harness(f);
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), reason);
  });
  it("R7T27 revocation before admission denies old and freshly issued references", () => {
    const h = harness(); h.update({ kind: "REVOKE_AUTHORIZATION" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORIZATION_REVOKED");
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "AUTHORIZATION_REVOKED");
  });
  it("R7T28 policy revision retires binding usability without rewriting R6 policy", () => {
    const h = harness(); h.update({ kind: "REVISE_POLICY", policyVersion: "v2" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "POLICY_VERSION_CONFLICT");
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "BINDING_REFRESH_REQUIRED");
    expect(h.a.snapshot().active!.fixture!.policy.version).toBe("v1"); expect(h.a.snapshot().currentFixture!.policy.version).toBe("v2");
  });
  it("R7T29 expiry before admission uses explicit fake clock", () => {
    const h = harness(); h.update({ kind: "ADVANCE_TIME", nowMs: 201 });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "EVIDENCE_EXPIRED"); expect(h.owner.issueEvidence()).toBeNull();
  });
  it("R7T30 duplicate admission preserves R6 denial and single reservation", () => {
    const h = harness(); h.start(); const before = h.a.snapshot();
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "DUPLICATE_OPERATION"); expect(h.a.snapshot()).toEqual(before);
  });
  it("R7T31 terminated run ID reused with new incarnation needs fresh evidence and admission", () => {
    const h = harness(); h.start(); h.update({ kind: "TERMINATE" });
    h.update({ kind: "REINCARNATE_RUN", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "INCARNATION_MISMATCH");
    const r = h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()); expect(r.outcome).toBe("MOCK_AUTHORITY_RECORDED");
    expect(r.binding!.runId).toBe("run-a"); expect(r.binding!.incarnationId).toBe("fake-incarnation:2");
    expect(h.a.snapshot().retired[0]!.snapshot.fixture!.context.lifecycle).toBe("COMPLETED");
  });
  it("R7T32 pending admission ticket cannot survive authority reset", () => {
    const h = harness(); const t = ticket(h.a.prepareAdmission(h.admission(), h.ref)); h.update({ kind: "RESET_AUTHORITY" });
    denied(h.a.commitAdmission(t), "STALE_AUTHORITY"); expect(h.a.snapshot().retired[0]!.snapshot.admission).toBeNull();
  });
});

describe("R7 authority backed publication", () => {
  it("R7T33 valid publication records only metadata in existing R6 sink", () => {
    const h = harness(); h.start(); const r = h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref);
    expect(r.outcome).toBe("MOCK_AUTHORITY_RECORDED"); expect(r.boundaryReceipt!.outcome).toBe("MOCK_PUBLICATION_RECORDED");
    expect(h.a.snapshot().active!.publications[0]!.output).toEqual(h.f.output);
  });
  it("R7T34 wrong output owner is rejected by R5 through R6", () => {
    const h = harness(); h.start(); const p = h.publication(); p.output.identity.ownerId = "other-owner";
    denied(h.a.attemptAuthorityBackedMockPublication(p, h.ref), "OWNERSHIP_CONFLICT");
  });
  it("R7T35 wrong destination is denied", () => {
    const h = harness(); h.start(); const p = h.publication(); p.output.destinationId = "other-panel";
    denied(h.a.attemptAuthorityBackedMockPublication(p, h.ref), "DESTINATION_DENIED");
  });
  it("R7T36 wrong incarnation reference cannot reach publication", () => {
    const h = harness(); h.start(); denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), { ...h.ref, incarnationId: "fake-incarnation:99" }), "INCARNATION_MISMATCH");
  });
  it("R7T37 stale output epoch is rejected by existing contract", () => {
    const h = harness(); h.start(); const p = h.publication(); p.output.epoch = 1;
    denied(h.a.attemptAuthorityBackedMockPublication(p, h.ref), "STALE_EPOCH");
  });
  it("R7T38 authorization revocation before publication denies", () => {
    const h = harness(); h.start(); h.update({ kind: "REVOKE_AUTHORIZATION" });
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref), "AUTHORIZATION_REVOKED");
  });
  it("R7T39 cancellation invalidates old evidence and R6 denies freshly bound output", () => {
    const h = harness(); h.start(); h.update({ kind: "CANCEL" });
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref), "AUTHORIZATION_REVISION_MISMATCH");
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.fresh()), "CANCELLED");
  });
  it("R7T40 security stop denies publication under old or fresh reference", () => {
    const h = harness(); h.start(); h.update({ kind: "ACTIVATE_SECURITY_STOP" });
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref));
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.fresh()), "SECURITY_STOP_ACTIVE");
  });
  it("R7T41 duplicate publication cannot append twice", () => {
    const h = harness(); h.start(); h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref); const before = h.a.snapshot();
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref), "DUPLICATE_OPERATION"); expect(h.a.snapshot()).toEqual(before);
  });
  it("R7T42 sequence replay with different event ID is denied", () => {
    const h = harness(); h.start(); h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref);
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication("publish-b", { ...h.f.output, outputId: "event-b" }), h.ref), "SEQUENCE_INVALID");
  });
});

describe("R7 deterministic consistency and failure", () => {
  it("R7T43 current authority change before commit invalidates prepared snapshot", () => {
    const h = harness(); const t = ticket(h.a.prepareAdmission(h.admission(), h.ref)); h.update({ kind: "ADVANCE_TIME", nowMs: 151 });
    denied(h.a.commitAdmission(t), "STALE_AUTHORITY"); expect(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
  it("R7T44 authority revision conflict is explicit and cannot overwrite current state", () => {
    const h = harness(); const before = h.a.snapshot();
    expect(h.owner.applyChange({ kind: "REVOKE_AUTHORIZATION", expectedAuthorityRevision: 0 }).reason).toBe("STALE_AUTHORITY");
    expect(h.a.snapshot()).toEqual(before); h.start();
  });
  it("R7T45 revocation wins before gated admission commit", async () => {
    const h = harness(); const t = ticket(h.a.prepareAdmission(h.admission(), h.ref)); const g = gate();
    const pending = g.wait.then(() => h.a.commitAdmission(t)); h.update({ kind: "REVOKE_AUTHORIZATION" }); g.release();
    denied(await pending, "STALE_AUTHORITY"); expect(h.a.snapshot().active!.admission).toBeNull();
  });
  it("R7T46 cancellation wins before gated publication commit", async () => {
    const h = harness(); h.start(); const t = ticket(h.a.preparePublication(h.publication(), h.ref)); const g = gate();
    const pending = g.wait.then(() => h.a.commitPublication(t)); h.update({ kind: "CANCEL" }); g.release();
    denied(await pending, "STALE_AUTHORITY"); expect(h.a.snapshot().active!.publications).toEqual([]);
  });
  it("R7T47 reset wins before gated pending operation", async () => {
    const h = harness(); const t = ticket(h.a.prepareAdmission(h.admission(), h.ref)); const g = gate();
    const pending = g.wait.then(() => h.a.commitAdmission(t)); h.update({ kind: "RESET_AUTHORITY" }); g.release();
    denied(await pending, "STALE_AUTHORITY"); expect(h.a.snapshot().active).toBeNull();
  });
  it("R7T48 failed validation leaves authority and inner state unchanged", () => {
    const h = harness(); const before = h.a.snapshot(); const bad = h.admission(); bad.request.workerType = "shell";
    denied(h.a.attemptAuthorityBackedMockAdmission(bad, h.ref), "WORKER_TYPE_DENIED"); expect(h.a.snapshot()).toEqual(before);
  });
  it("R7T49 failed commit does not consume reusable provenance or operation key", () => {
    const h = harness(); const before = h.a.snapshot(); h.owner.injectMockFailure("BEFORE_COMMIT");
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "MOCK_COMMIT_FAILED"); expect(h.a.snapshot()).toEqual(before); h.start();
  });
  it("R7T50 append failure leaves no partial sink or sequence and retry succeeds", () => {
    const h = harness(); h.start(); const before = h.a.snapshot(); h.owner.injectMockFailure("PUBLICATION_APPEND");
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref), "MOCK_COMMIT_FAILED"); expect(h.a.snapshot()).toEqual(before);
    expect(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
});

describe("R7 general offline boundaries", () => {
  it("R7T51 fake receipts and references provide no execution authority", () => {
    const h = harness(); const r = h.start(); expect(r.executionAuthority).toBe(false); expect(r.mockOnly).toBe(true);
    denied(h.a.commitAdmission(r), "INVALID_TICKET"); denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), r), "INVALID_EVIDENCE");
  });
  function effectProbe() {
    const f = fixture();
    const spies = [vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs.promises, "readFile"),
      vi.spyOn(fs.promises, "writeFile"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(childProcess, "spawn"), vi.spyOn(childProcess, "fork"), vi.spyOn(globalThis, "fetch"),
      vi.spyOn(Date, "now"), vi.spyOn(Math, "random")];
    try {
      const h = createFakeAuthorityAdapter(f.seed); const ref = h.owner.issueEvidence();
      const a = h.adapter.attemptAuthorityBackedMockAdmission({ operationId: "a", request: f.request }, ref);
      const p = h.adapter.attemptAuthorityBackedMockPublication({ operationId: "p", output: f.output }, ref);
      const counts = spies.map(s => s.mock.calls.length); spies.forEach(s => s.mockRestore());
      expect(a.outcome).toBe("MOCK_AUTHORITY_RECORDED"); expect(p.outcome).toBe("MOCK_AUTHORITY_RECORDED");
      expect(counts).toEqual(spies.map(() => 0));
    } finally { spies.forEach(s => s.mockRestore()); }
  }
  it("R7T52 no credential-store, clock, random or effect API calls in fake operations", effectProbe);
  it("R7T53 public adapter exposes neither production adapters nor inner R6 owner", () => {
    const h = harness(); expect(Object.keys(h.a).sort()).toEqual(["snapshot", "attemptAuthorityBackedMockAdmission", "attemptAuthorityBackedMockPublication",
      "prepareAdmission", "preparePublication", "commitAdmission", "commitPublication"].sort());
    expect(Object.keys(h.owner).sort()).toEqual(["issueEvidence", "applyChange", "injectMockFailure"].sort());
  });
  it("R7T54 fake publication invokes no external delivery API", effectProbe);
  it("R7T55 independent authority state, sinks and tickets remain isolated", () => {
    const a = harness(); const b = harness(); const t = ticket(a.a.prepareAdmission(a.admission(), a.ref));
    denied(b.a.commitAdmission(t), "INVALID_TICKET"); a.update({ kind: "ACTIVATE_SECURITY_STOP" }); b.start();
    expect(a.a.snapshot().active!.admission).toBeNull(); expect(b.a.snapshot().active!.admission).not.toBeNull();
  });
  it("R7T56 actual R5 and R6 contracts are reused unchanged", () => {
    const h = harness(); expect(evaluateWorkerAdmission(h.f.request, h.f.mock.context, h.f.mock.policy).outcome).toBe("ELIGIBLE_FOR_ADMISSION");
    const direct = createMockEnforcementBoundary(h.f.mock).boundary.attemptMockAdmission({ operationId: "admit-a", expectedStateVersion: 0, request: h.f.request });
    expect(h.start().boundaryReceipt).toEqual(direct);
  });
});

describe("R7 additional ABA and adversarial cases", () => {
  it("R7T57 policy ABA label v1-v2-v1 does not revive original evidence", () => {
    const h = harness(); h.update({ kind: "REVISE_POLICY", policyVersion: "v2" }); h.update({ kind: "REVISE_POLICY", policyVersion: "v1" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "AUTHORIZATION_REVISION_MISMATCH");
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "BINDING_REFRESH_REQUIRED");
  });
  it("R7T58 revoked and recreated authorization gets a distinct incarnation and revision", () => {
    const h = harness(); h.update({ kind: "REVOKE_AUTHORIZATION" }); h.update({ kind: "RECREATE_RECORD", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "INCARNATION_MISMATCH");
    const fresh = h.fresh(); expect(fresh.authorizationRevision).toBeGreaterThan(h.ref!.authorizationRevision);
    expect(h.a.attemptAuthorityBackedMockAdmission(h.admission(), fresh).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
  it("R7T59 deletion and reconstruction preserve visible ID but not authority", () => {
    const h = harness(); h.update({ kind: "DELETE_RECORD" }); h.update({ kind: "RECREATE_RECORD", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "INCARNATION_MISMATCH");
    expect(h.a.snapshot().binding!.runId).toBe(h.ref!.runId);
  });
  it("R7T60 newly constructed authority with the same label rejects old instance reference", () => {
    const a = harness(); const b = harness(); denied(b.a.attemptAuthorityBackedMockAdmission(b.admission(), a.ref), "UNRECOGNIZED_EVIDENCE");
  });
  it("R7T61 session transfer invalidates old evidence and holds mismatched R6 binding", () => {
    const h = harness(); h.update({ kind: "TRANSFER_SESSION", sessionId: "session-b" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "OWNERSHIP_CONFLICT");
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "BINDING_REFRESH_REQUIRED");
  });
  it("R7T62 epoch rollback and public revision injection cannot lower trusted versions", () => {
    const h = harness(); const before = h.a.snapshot(); expect(h.update({ kind: "ADVANCE_EPOCH", executionEpoch: 1 }).reason).toBe("EPOCH_ROLLBACK");
    denied(h.a.attemptAuthorityBackedMockAdmission({ ...h.admission(), authorizationRevision: 0 }, h.ref), "INVALID_OPERATION");
    expect(h.a.snapshot()).toEqual(before);
  });
  it("R7T63 retired and active snapshots never leak mutable internal records", () => {
    const h = harness(); h.start(); h.update({ kind: "REINCARNATE_RUN", fixture: fixture().mock });
    const s = h.a.snapshot(); s.retired[0]!.snapshot.admission!.workerId = "other";
    s.currentFixture!.context.identity.ownerId = "other"; expect(h.a.snapshot().retired[0]!.snapshot.admission!.workerId).toBe("worker-a");
    expect(h.a.snapshot().binding!.subjectId).toBe("owner-a");
  });
  it("R7T64 provenance reference is reusable but never bypasses R6 idempotency", () => {
    const h = harness(); h.start(); expect(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref).outcome).toBe("MOCK_AUTHORITY_RECORDED");
    const r = h.a.attemptAuthorityBackedMockPublication(h.publication("p2", { ...h.f.output, outputId: "event-b", sequence: 2 }), h.ref);
    expect(r.outcome).toBe("MOCK_AUTHORITY_RECORDED"); expect(h.a.snapshot().active!.publications).toHaveLength(2);
  });
  it("R7T65 same authority revision still requires current R6 version for competing commits", () => {
    const h = harness(); h.start(); const a = ticket(h.a.preparePublication(h.publication(), h.ref));
    const b = ticket(h.a.preparePublication(h.publication("p2", { ...h.f.output, outputId: "event-b" }), h.ref));
    expect(h.a.commitPublication(a).outcome).toBe("MOCK_AUTHORITY_RECORDED"); denied(h.a.commitPublication(b), "STALE_STATE");
    expect(h.a.snapshot().active!.publications).toHaveLength(1);
  });
  it("R7T66 evidence issuance changes authority revision and invalidates pending ticket conservatively", () => {
    const h = harness(); const t = ticket(h.a.prepareAdmission(h.admission(), h.ref)); h.fresh();
    denied(h.a.commitAdmission(t), "STALE_AUTHORITY"); h.start();
  });
  it("R7T67 identical JSON metadata or a TypeScript cast is not runtime provenance", () => {
    const h = harness(); const forged = JSON.parse(JSON.stringify(h.ref)) as FakeEvidenceReference;
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), forged), "UNRECOGNIZED_EVIDENCE");
  });
  it("R7T68 fake stop remains latched through reset and record reconstruction", () => {
    const h = harness(); h.update({ kind: "ACTIVATE_SECURITY_STOP" }); h.update({ kind: "RESET_AUTHORITY" });
    h.update({ kind: "RECREATE_RECORD", fixture: fixture().mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "SECURITY_STOP_ACTIVE");
  });
  it("R7T69 barriers update held authority view and cannot release a stale binding", () => {
    const h = harness(); h.update({ kind: "REVISE_POLICY", policyVersion: "v2" }); h.update({ kind: "ACTIVATE_SECURITY_STOP" });
    expect(h.a.snapshot().currentFixture!.context.securityStop.state).toBe("ACTIVE");
    h.update({ kind: "REVOKE_AUTHORIZATION" }); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "AUTHORIZATION_REVOKED");
  });
  it("R7T70 callers cannot occupy the reserved R6 control operation namespace", () => {
    const h = harness(); denied(h.a.attemptAuthorityBackedMockAdmission(h.admission("r7-control:2"), h.ref), "INVALID_OPERATION");
    expect(h.update({ kind: "ACTIVATE_SECURITY_STOP" }).outcome).toBe("FAKE_AUTHORITY_UPDATED");
  });
  it("R7T71 accessor input never executes caller code inside authority boundary", () => {
    const h = harness(); let calls = 0; const op = { get operationId() { calls++; return "DUMMY_SECRET"; } };
    denied(h.a.attemptAuthorityBackedMockAdmission(op, h.ref), "INVALID_OPERATION"); expect(calls).toBe(0); h.start();
  });
  it("R7T72 issued references are frozen and field mutation cannot change authority", () => {
    const h = harness(); expect(Object.isFrozen(h.ref)).toBe(true); expect(Reflect.set(h.ref!, "authorizationRevision", 0)).toBe(false); h.start();
  });
  it("R7T73 returned receipt metadata is not internal authority and cannot be replayed", () => {
    const h = harness(); const r = h.start(); Reflect.set(r, "executionAuthority", true); Reflect.set(r.binding!, "authorizationRevision", 999);
    expect(h.a.snapshot().binding!.authorizationRevision).toBe(1); denied(h.a.commitPublication(r), "INVALID_TICKET");
  });
  it("R7T74 preparation exposes only an outer ticket, not the R6 controller or inner ticket", () => {
    const h = harness(); const p = h.a.prepareAdmission(h.admission(), h.ref); const t = ticket(p);
    expect(Object.keys(t).sort()).toEqual(["executionAuthority", "mockOnly"]);
    denied(h.a.commitPublication(t), "INVALID_TICKET"); expect(h.a.commitAdmission(t).outcome).toBe("MOCK_AUTHORITY_RECORDED");
    denied(h.a.commitAdmission(t), "INVALID_TICKET");
  });
  it("R7T75 failure injection cannot execute supplied callbacks", () => {
    const h = harness(); let calls = 0;
    expect(h.owner.injectMockFailure((() => { calls++; }) as unknown as "BEFORE_COMMIT")).toBe(false);
    expect(calls).toBe(0); h.start();
  });
  it("R7T76 malformed and throwing proxy data do not strand the authority", () => {
    const h = harness(); const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    const bad = new Proxy({}, { getPrototypeOf() { throw new Error("DUMMY_SECRET"); } }); const before = h.a.snapshot();
    for (const value of [undefined, null, false, {}, [], cyclic, bad, new Array(10000000)]) {
      const r = h.a.attemptAuthorityBackedMockAdmission(value, h.ref); denied(r); expect(JSON.stringify(r)).not.toContain("DUMMY_SECRET");
      expect(h.a.snapshot()).toEqual(before);
    }
    h.start();
  });
  it("R7T77 missing or unknown generation cannot become a permissive default", () => {
    const h = harness(); for (const authorityGeneration of [undefined, null, "UNKNOWN", 0, -1, Infinity]) {
      denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), { ...h.ref, authorityGeneration }));
    }
    expect(h.a.snapshot().active!.admission).toBeNull();
  });
  it("R7T78 stale owner update and revision override fields cannot reset version", () => {
    const h = harness(); const before = h.a.snapshot();
    expect(h.owner.applyChange({ kind: "RESET_AUTHORITY", expectedAuthorityRevision: 0 }).reason).toBe("STALE_AUTHORITY");
    expect(h.update({ kind: "RECREATE_RECORD", fixture: fixture().mock, authorityGeneration: 1 }).reason).toBe("INVALID_AUTHORITY_CHANGE");
    expect(h.a.snapshot()).toEqual(before);
  });
  it("R7T79 reincarnation preserves previous R6 sink and requires new admission", () => {
    const h = harness(); h.start(); h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref);
    h.update({ kind: "REINCARNATE_RUN", fixture: fixture().mock }); const fresh = h.fresh();
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication(), fresh), "ADMISSION_REQUIRED");
    expect(h.a.snapshot().retired[0]!.snapshot.publications).toHaveLength(1); expect(h.a.snapshot().active!.publications).toEqual([]);
  });
  it("R7T80 invalid issue window and malformed seed cannot mint usable references", () => {
    const f = fixture(); f.seed.nowMs = 99; const h = harness(f); expect(h.ref).toBeNull();
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref), "MISSING_EVIDENCE");
    const invalid = createFakeAuthorityAdapter({ ...fixture().seed, authorityInstanceId: "invalid id" });
    expect(invalid.adapter.snapshot().valid).toBe(false); expect(invalid.owner.issueEvidence()).toBeNull();
  });
  it("R7T81 ingress proxy reentry commits before authority lookup and cannot hide revocation", () => {
    const h = harness(); let calls = 0;
    const op = new Proxy(h.admission(), { getPrototypeOf(target) {
      calls++; h.update({ kind: "REVOKE_AUTHORIZATION" }); return Object.getPrototypeOf(target);
    } });
    denied(h.a.attemptAuthorityBackedMockAdmission(op, h.ref), "AUTHORIZATION_REVOKED");
    expect(calls).toBe(1); expect(h.a.snapshot().active!.admission).toBeNull();
  });
  it("R7T82 publication commits before revocation; history stays while future effects deny", () => {
    const h = harness(); h.start(); expect(h.a.attemptAuthorityBackedMockPublication(h.publication(), h.ref).outcome).toBe("MOCK_AUTHORITY_RECORDED");
    h.update({ kind: "REVOKE_AUTHORIZATION" }); const before = h.a.snapshot();
    denied(h.a.attemptAuthorityBackedMockPublication(h.publication("p2", { ...h.f.output, outputId: "event-b", sequence: 2 }), h.fresh()), "AUTHORIZATION_REVOKED");
    expect(h.a.snapshot().active).toEqual(before.active); expect(h.a.snapshot().active!.publications).toHaveLength(1);
  });
  it("R7T83 revised policy becomes usable only with explicit fresh owner fixture and incarnation", () => {
    const h = harness(); h.update({ kind: "REVISE_POLICY", policyVersion: "v2" });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.fresh()), "BINDING_REFRESH_REQUIRED");
    const f = fixture(); f.mock.policy.version = "v2"; f.mock.context.policyVersion = "v2";
    for (const e of [f.mock.context.authorization.evidence!, f.mock.context.containment.evidence!,
      f.mock.context.outputFence.evidence!, f.mock.context.securityStop.clearance!]) e.policyVersion = "v2";
    h.update({ kind: "REINCARNATE_RUN", fixture: f.mock }); const ref = h.fresh();
    const a = h.a.attemptAuthorityBackedMockAdmission({ operationId: "a-v2", request: { ...f.request, policyVersion: "v2" } }, ref);
    expect(a.outcome).toBe("MOCK_AUTHORITY_RECORDED"); expect(a.binding!.incarnationId).toBe("fake-incarnation:2");
    expect(h.a.attemptAuthorityBackedMockPublication({ operationId: "p-v2", output: { ...f.output, policyVersion: "v2" } }, ref).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
  it("R7T84 fresh epoch and session require new proofs and incarnation, not old reference reuse", () => {
    const h = harness(); h.update({ kind: "ADVANCE_EPOCH", executionEpoch: 3 }); h.update({ kind: "TRANSFER_SESSION", sessionId: "session-b" });
    const f = fixture(); f.mock.context.epoch = 3; f.mock.context.identity.sessionId = "session-b";
    f.mock.policy.scope.sessionId = "session-b"; f.mock.policy.publication.destinations[0]!.sessionId = "session-b";
    for (const e of [f.mock.context.authorization.evidence!, f.mock.context.containment.evidence!,
      f.mock.context.outputFence.evidence!, f.mock.context.securityStop.clearance!]) { e.epoch = 3; e.identity.sessionId = "session-b"; }
    h.update({ kind: "RECREATE_RECORD", fixture: f.mock });
    denied(h.a.attemptAuthorityBackedMockAdmission(h.admission(), h.ref));
    expect(h.a.attemptAuthorityBackedMockAdmission({ operationId: "new-session", request: { ...f.request,
      epoch: 3, identity: { ...f.request.identity, sessionId: "session-b" } } }, h.fresh()).outcome).toBe("MOCK_AUTHORITY_RECORDED");
  });
});
