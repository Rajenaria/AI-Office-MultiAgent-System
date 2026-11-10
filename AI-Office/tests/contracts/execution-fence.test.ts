import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import net from "node:net";
import childProcess from "node:child_process";
import {
  evaluateWorkerAdmission as admit, evaluateOutputPublication as publish,
  type AdmissionRequest, type AdmissionContext, type SecurityPolicy,
  type OutputEnvelope, type PublicationContext, type DenialReason,
} from "../../src/contracts/execution-fence.js";

// Dummy, explicitly supplied assertions. These fixtures create no real clearance.
function fixtures() {
  const identity = { projectId: "11111111-1111-4111-8111-111111111111", sessionId: "session-a",
    ownerId: "owner-a", runId: "run-a", workerId: "worker-a", taskScope: "review" };
  const proof = { evidenceId: "dummy-proof", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 };
  const assertion = () => ({ status: "VERIFIED" as const, evidence: structuredClone(proof) });
  const base = { identity: { ...identity }, epoch: 2, policyVersion: "v1", nowMs: 150,
    cancellation: "CLEAR" as const, authorization: assertion(),
    securityStop: { state: "CLEARED" as const, clearance: structuredClone(proof) } };
  const request: AdmissionRequest = { requestId: "request-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", workerType: "reviewer", providerId: "dummy-provider" };
  const admission: AdmissionContext = { ...structuredClone(base), lifecycle: "APPROVAL_GRANTED",
    containment: assertion(), outputFence: assertion(), provider: { providerId: "dummy-provider",
      permission: assertion(), entitlement: assertion(), billing: assertion() } };
  const policy: SecurityPolicy = { policyId: "policy-a", version: "v1", status: "ACTIVE",
    validFromMs: 100, expiresAtMs: 200,
    scope: { projectId: identity.projectId, sessionId: identity.sessionId, ownerId: identity.ownerId },
    admission: { enabled: true, workerTypes: ["reviewer"], taskScopes: ["review"] },
    publication: { enabled: true, sequenceRequired: true, destinations: [{ destinationId: "panel-a",
      projectId: identity.projectId, sessionId: identity.sessionId, ownerId: identity.ownerId,
      channels: ["text"], classifications: ["PUBLIC", "INTERNAL"] }] },
    providers: [{ providerId: "dummy-provider", permission: "ALLOWED", entitlementRequired: true, billingRequired: true }] };
  const output: OutputEnvelope = { outputId: "output-a", identity: { ...identity }, epoch: 2,
    policyVersion: "v1", destinationId: "panel-a", channel: "text", classification: "INTERNAL", sequence: 4 };
  const publication: PublicationContext = { ...structuredClone(base), lifecycle: "RUNNING",
    destinationId: "panel-a", sequence: { min: 1, max: 10, lastAccepted: 3, seenOutputIds: [] } };
  return { request, admission, policy, output, publication };
}
type Fixture = ReturnType<typeof fixtures>;
const deny = (reason: DenialReason) => ({ outcome: "DENIED", reason, executionAuthority: false });
const eligibleAdmission = { outcome: "ELIGIBLE_FOR_ADMISSION", reason: "SUPPLIED_INPUTS_SATISFY_CONTRACT", executionAuthority: false };
const eligiblePublication = { outcome: "ELIGIBLE_FOR_PUBLICATION", reason: "SUPPLIED_INPUTS_SATISFY_CONTRACT", executionAuthority: false };
function remove(obj: object, key: string) { Reflect.deleteProperty(obj, key); }
const otherProject = "22222222-2222-4222-8222-222222222222";

describe("pure admission contract", () => {
  it("T01 valid synthetic inputs are eligible without execution authority", () => {
    const f = fixtures(); expect(admit(f.request, f.admission, f.policy)).toEqual(eligibleAdmission);
  });
  const cases: [string, (f: Fixture) => void, DenialReason][] = [
    ["T02 missing request ID", f => remove(f.request, "requestId"), "INVALID_REQUEST"],
    ["T03 missing project ID", f => remove(f.request.identity, "projectId"), "INVALID_REQUEST"],
    ["T04 incorrect owner", f => { f.request.identity.ownerId = "owner-b"; }, "OWNERSHIP_CONFLICT"],
    ["T05 active stop", f => { f.admission.securityStop.state = "ACTIVE"; }, "SECURITY_STOP_ACTIVE"],
    ["T06 unknown stop", f => { f.admission.securityStop.state = "UNKNOWN"; }, "SECURITY_STOP_UNKNOWN"],
    ["T07 invalid stop", f => { f.admission.securityStop.state = "INVALID"; }, "SECURITY_STOP_INVALID"],
    ["T08 expired authorization at exact boundary", f => { f.admission.authorization.evidence!.expiresAtMs = 150; }, "AUTHORIZATION_INVALID"],
    ["T09 missing containment", f => { f.admission.containment.evidence = null; }, "CONTAINMENT_INVALID"],
    ["T10 missing fence", f => { f.admission.outputFence.status = "UNKNOWN"; }, "OUTPUT_FENCE_INVALID"],
    ["T11 unauthorized worker type", f => { f.request.workerType = "shell"; }, "WORKER_TYPE_DENIED"],
    ["T12 missing entitlement", f => { f.admission.provider!.entitlement.evidence = null; }, "ENTITLEMENT_INVALID"],
    ["T13 missing billing", f => { f.admission.provider!.billing.status = "MISSING"; }, "BILLING_INVALID"],
    ["T14 cancellation", f => { f.admission.cancellation = "REQUESTED"; }, "CANCELLED"],
    ["T15 terminal admission", f => { f.admission.lifecycle = "COMPLETED"; }, "TERMINAL"],
    ["T36 missing context", f => { f.admission = undefined as unknown as AdmissionContext; }, "INVALID_CONTEXT"],
    ["T37 missing stop", f => remove(f.admission, "securityStop"), "INVALID_CONTEXT"],
    ["T38 cleared without evidence", f => { f.admission.securityStop.clearance = null; }, "CLEARANCE_INVALID"],
    ["T39 stale clearance epoch", f => { f.admission.securityStop.clearance!.epoch = 1; }, "CLEARANCE_INVALID"],
    ["T40 expired policy boundary", f => { f.policy.expiresAtMs = 150; }, "POLICY_EXPIRED"],
    ["T41 not yet valid policy", f => { f.policy.validFromMs = 151; }, "POLICY_EXPIRED"],
    ["T42 conflicting policy version", f => { f.policy.version = "v2"; }, "POLICY_VERSION_CONFLICT"],
    ["T43 unknown policy status", f => { f.policy.status = "UNKNOWN"; }, "POLICY_INACTIVE"],
    ["T44 disabled admission", f => { f.policy.admission.enabled = false; }, "ADMISSION_DISABLED"],
    ["T45 denied provider rule", f => { f.policy.providers[0]!.permission = "DENIED"; }, "PROVIDER_DENIED"],
    ["T46 missing provider rule", f => { f.policy.providers = []; }, "PROVIDER_DENIED"],
    ["T47 mismatched provider evidence", f => { f.admission.provider!.providerId = "provider-b"; }, "PROVIDER_DENIED"],
    ["T48 provider permission revoked", f => { f.admission.provider!.permission.status = "REVOKED"; }, "PROVIDER_DENIED"],
    ["T49 out of scope task", f => { f.policy.admission.taskScopes = []; }, "TASK_SCOPE_DENIED"],
    ["T50 foreign session", f => { f.request.identity.sessionId = "session-b"; }, "OWNERSHIP_CONFLICT"],
    ["T51 foreign policy owner", f => { f.policy.scope.ownerId = "owner-b"; }, "OWNERSHIP_CONFLICT"],
    ["T52 stale admission epoch", f => { f.request.epoch = 1; }, "STALE_EPOCH"],
    ["T53 already running cannot be admitted twice", f => { f.admission.lifecycle = "RUNNING"; }, "LIFECYCLE_DENIED"],
    ["T54 ambiguous duplicate provider rule", f => { f.policy.providers.push(structuredClone(f.policy.providers[0]!)); }, "INVALID_POLICY"],
    ["T55 future authorization", f => { f.admission.authorization.evidence!.issuedAtMs = 151; }, "AUTHORIZATION_INVALID"],
    ["T56 foreign containment proof", f => { f.admission.containment.evidence!.identity.runId = "other-run"; }, "CONTAINMENT_INVALID"],
    ["T57 stale fence proof policy", f => { f.admission.outputFence.evidence!.policyVersion = "v0"; }, "OUTPUT_FENCE_INVALID"],
  ];
  it.each(cases)("%s", (_name, change, reason) => {
    const f = fixtures(); change(f); expect(admit(f.request, f.admission, f.policy)).toEqual(deny(reason));
  });
  it("T58 non-provider admission requires explicit absence on both sides", () => {
    const f = fixtures(); f.request.providerId = null; f.admission.provider = null;
    expect(admit(f.request, f.admission, f.policy)).toEqual(eligibleAdmission);
    f.admission = fixtures().admission;
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("PROVIDER_DENIED"));
  });
  it("T59 optional entitlement and billing follow explicit policy only", () => {
    const f = fixtures(); f.policy.providers[0]!.entitlementRequired = false; f.policy.providers[0]!.billingRequired = false;
    f.admission.provider!.entitlement = { status: "MISSING", evidence: null };
    f.admission.provider!.billing = { status: "MISSING", evidence: null };
    expect(admit(f.request, f.admission, f.policy)).toEqual(eligibleAdmission);
    remove(f.policy.providers[0]!, "billingRequired");
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("INVALID_POLICY"));
  });
});

describe("pure output contract", () => {
  it("T16 valid synthetic output is eligible without publishing", () => {
    const f = fixtures(); expect(publish(f.output, f.publication, f.policy)).toEqual(eligiblePublication);
  });
  const cases: [string, (f: Fixture) => void, DenialReason][] = [
    ["T17 missing owner", f => remove(f.output.identity, "ownerId"), "INVALID_OUTPUT"],
    ["T18 cross-project output", f => { f.output.identity.projectId = otherProject; }, "OWNERSHIP_CONFLICT"],
    ["T19 cross-session output", f => { f.output.identity.sessionId = "session-b"; }, "OWNERSHIP_CONFLICT"],
    ["T20 wrong run", f => { f.output.identity.runId = "run-b"; }, "RUN_CONFLICT"],
    ["T21 output after cancellation", f => { f.publication.cancellation = "ACKNOWLEDGED"; }, "CANCELLED"],
    ["T22 output after terminal", f => { f.publication.lifecycle = "COMPLETED"; }, "TERMINAL"],
    ["T23 unknown channel", f => { f.output.channel = "shell-command"; }, "CHANNEL_DENIED"],
    ["T24 restricted destination", f => { f.output.classification = "RESTRICTED"; }, "CONFIDENTIALITY_DENIED"],
    ["T25 missing required sequence", f => { f.output.sequence = null; }, "SEQUENCE_REQUIRED"],
    ["T26 invalid sequence", f => { f.output.sequence = -1; }, "INVALID_OUTPUT"],
    ["T27 stale epoch", f => { f.output.epoch = 1; }, "STALE_EPOCH"],
    ["T28 missing publication policy", f => remove(f.policy, "publication"), "INVALID_POLICY"],
    ["T29 active stop output", f => { f.publication.securityStop.state = "ACTIVE"; }, "SECURITY_STOP_ACTIVE"],
    ["T30 unknown security state output", f => { f.publication.securityStop.state = "UNKNOWN"; }, "SECURITY_STOP_UNKNOWN"],
    ["T60 invalid security state output", f => { f.publication.securityStop.state = "INVALID"; }, "SECURITY_STOP_INVALID"],
    ["T61 missing security state output", f => remove(f.publication.securityStop, "state"), "INVALID_CONTEXT"],
    ["T62 missing output clearance proof", f => { f.publication.securityStop.clearance = null; }, "CLEARANCE_INVALID"],
    ["T63 wrong producer", f => { f.output.identity.workerId = "worker-b"; }, "WORKER_CONFLICT"],
    ["T64 foreign destination project", f => { f.policy.publication.destinations[0]!.projectId = otherProject; }, "DESTINATION_DENIED"],
    ["T65 foreign destination session", f => { f.policy.publication.destinations[0]!.sessionId = "session-b"; }, "DESTINATION_DENIED"],
    ["T66 foreign destination owner", f => { f.policy.publication.destinations[0]!.ownerId = "owner-b"; }, "DESTINATION_DENIED"],
    ["T67 context destination mismatch", f => { f.publication.destinationId = "panel-b"; }, "DESTINATION_DENIED"],
    ["T68 unknown destination", f => { f.output.destinationId = "panel-b"; }, "DESTINATION_DENIED"],
    ["T69 duplicate output ID", f => { f.publication.sequence.seenOutputIds = [f.output.outputId]; }, "DUPLICATE_OUTPUT"],
    ["T70 sequence replay", f => { f.output.sequence = 3; }, "SEQUENCE_INVALID"],
    ["T71 sequence gap", f => { f.output.sequence = 5; }, "SEQUENCE_INVALID"],
    ["T72 outside sequence bounds", f => { f.publication.sequence.max = 3; }, "SEQUENCE_INVALID"],
    ["T73 contradictory sequence bounds", f => { f.publication.sequence.min = 11; }, "SEQUENCE_INVALID"],
    ["T74 stale output policy", f => { f.output.policyVersion = "v0"; }, "POLICY_VERSION_CONFLICT"],
    ["T75 expired output authorization", f => { f.publication.authorization.evidence!.expiresAtMs = 149; }, "AUTHORIZATION_INVALID"],
    ["T76 disabled publication", f => { f.policy.publication.enabled = false; }, "PUBLICATION_DISABLED"],
    ["T77 unknown lifecycle", f => { Reflect.set(f.publication, "lifecycle", "UNRECOGNIZED"); }, "INVALID_CONTEXT"],
    ["T78 unknown cancellation", f => { f.publication.cancellation = "UNKNOWN"; }, "CANCELLED"],
    ["T79 ambiguous destination rule", f => { f.policy.publication.destinations.push(structuredClone(f.policy.publication.destinations[0]!)); }, "INVALID_POLICY"],
    ["T80 foreign output task", f => { f.output.identity.taskScope = "execute"; }, "TASK_SCOPE_DENIED"],
  ];
  it.each(cases)("%s", (_name, change, reason) => {
    const f = fixtures(); change(f); expect(publish(f.output, f.publication, f.policy)).toEqual(deny(reason));
  });
  it("T81 first sequence starts at supplied minimum", () => {
    const f = fixtures(); f.publication.sequence.lastAccepted = null; f.output.sequence = 1;
    expect(publish(f.output, f.publication, f.policy)).toEqual(eligiblePublication);
    f.output.sequence = 2; expect(publish(f.output, f.publication, f.policy)).toEqual(deny("SEQUENCE_INVALID"));
  });
  it("T82 counter exhaustion cannot wrap", () => {
    const f = fixtures(); f.publication.sequence.max = Number.MAX_SAFE_INTEGER;
    f.publication.sequence.lastAccepted = Number.MAX_SAFE_INTEGER; f.output.sequence = Number.MAX_SAFE_INTEGER;
    expect(publish(f.output, f.publication, f.policy)).toEqual(deny("SEQUENCE_INVALID"));
  });
  it("T83 optional sequence is explicitly policy-controlled", () => {
    const f = fixtures(); f.policy.publication.sequenceRequired = false; f.output.sequence = null;
    expect(publish(f.output, f.publication, f.policy)).toEqual(eligiblePublication);
    f.output.sequence = 9; expect(publish(f.output, f.publication, f.policy)).toEqual(deny("SEQUENCE_INVALID"));
  });
});

describe("shared boundary properties", () => {
  it("T31 deterministic inputs yield deterministic results including denial priority", () => {
    const f = fixtures();
    for (let i = 0; i < 5; i++) {
      expect(admit(structuredClone(f.request), structuredClone(f.admission), structuredClone(f.policy))).toEqual(eligibleAdmission);
      expect(publish(f.output, f.publication, f.policy)).toEqual(eligiblePublication);
    }
    f.admission.securityStop.state = "ACTIVE"; f.admission.cancellation = "REQUESTED";
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("SECURITY_STOP_ACTIVE"));
  });
  it("T32 recursively frozen inputs remain unchanged for success and denial", () => {
    const freeze = (value: unknown): void => {
      if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
    };
    const f = fixtures(); const before = JSON.stringify(f); freeze(f);
    expect(admit(f.request, f.admission, f.policy)).toEqual(eligibleAdmission);
    expect(publish(f.output, f.publication, f.policy)).toEqual(eligiblePublication);
    expect(publish({ ...f.output, epoch: 1 }, f.publication, f.policy)).toEqual(deny("STALE_EPOCH"));
    expect(JSON.stringify(f)).toBe(before);
  });
  it("T33 malformed values deny without unexpected exceptions or coercion in every argument", () => {
    const f = fixtures();
    const malformed: unknown[] = [undefined, null, false, 0, "CLEARED", [], {}, NaN, Infinity, 1n,
      { securityStop: { state: "CLEARED" } }, new Proxy({}, { ownKeys() { throw new Error("dummy-secret"); } })];
    for (const bad of malformed) {
      for (const args of [[bad, f.admission, f.policy], [f.request, bad, f.policy], [f.request, f.admission, bad]]) {
        expect(admit(...args as [unknown, unknown, unknown]).outcome).toBe("DENIED");
      }
      for (const args of [[bad, f.publication, f.policy], [f.output, bad, f.policy], [f.output, f.publication, bad]]) {
        expect(publish(...args as [unknown, unknown, unknown]).outcome).toBe("DENIED");
      }
    }
    for (const n of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "2"]) {
      expect(admit({ ...f.request, epoch: n }, f.admission, f.policy).outcome).toBe("DENIED");
      expect(publish({ ...f.output, sequence: n }, f.publication, f.policy).outcome).toBe("DENIED");
    }
  });
  it("T34 decisions contain only constant fields, never dummy secrets or raw input", () => {
    const f = fixtures(); const secret = "DUMMY_SECRET_DO_NOT_ECHO";
    const decisions = [admit({ ...f.request, credential: secret }, f.admission, f.policy),
      publish({ ...f.output, payload: secret }, f.publication, f.policy),
      admit({ ...f.request, requestId: secret }, f.admission, f.policy)];
    for (const decision of decisions) {
      expect(JSON.stringify(decision)).not.toContain(secret);
      expect(Object.keys(decision).sort()).toEqual(["executionAuthority", "outcome", "reason"]);
      expect(decision.executionAuthority).toBe(false);
    }
  });
  it("T35 evaluation does not call effect APIs, clocks, randomness or logging", () => {
    const f = fixtures();
    const spies = [vi.spyOn(Date, "now"), vi.spyOn(Math, "random"), vi.spyOn(globalThis, "fetch"),
      vi.spyOn(fs, "readFileSync"), vi.spyOn(fs, "writeFileSync"), vi.spyOn(fs.promises, "readFile"),
      vi.spyOn(fs.promises, "writeFile"), vi.spyOn(net, "connect"), vi.spyOn(net, "createServer"),
      vi.spyOn(childProcess, "spawn"), vi.spyOn(childProcess, "fork"), vi.spyOn(console, "log"), vi.spyOn(console, "error")];
    try {
      const a = admit(f.request, f.admission, f.policy); const p = publish(f.output, f.publication, f.policy);
      const counts = spies.map(spy => spy.mock.calls.length);
      spies.forEach(spy => spy.mockRestore());
      expect(a).toEqual(eligibleAdmission); expect(p).toEqual(eligiblePublication);
      expect(counts).toEqual(spies.map(() => 0));
    } finally { spies.forEach(spy => spy.mockRestore()); }
  });
  it.each(["CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"] as const)(
    "T84 terminal state %s cannot regain eligibility through fresh evidence", lifecycle => {
      const f = fixtures(); f.admission.lifecycle = lifecycle; f.publication.lifecycle = lifecycle;
      expect(admit(f.request, f.admission, f.policy)).toEqual(deny("TERMINAL"));
      expect(publish(f.output, f.publication, f.policy)).toEqual(deny("TERMINAL"));
    });
  it.each(["UNCERTAIN", "RECONCILIATION_REQUIRED", "CREATED", "APPROVAL_PENDING", "LAUNCHING"] as const)(
    "T85 non-ready lifecycle %s denies both paths", lifecycle => {
      const f = fixtures(); f.admission.lifecycle = lifecycle; f.publication.lifecycle = lifecycle;
      expect(admit(f.request, f.admission, f.policy)).toEqual(deny("LIFECYCLE_DENIED"));
      expect(publish(f.output, f.publication, f.policy)).toEqual(deny("LIFECYCLE_DENIED"));
    });
  it("T86 unrecognized fields and unknown stop strings cannot default to clear", () => {
    const f = fixtures(); Reflect.set(f.admission.securityStop, "state", "false");
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("INVALID_CONTEXT"));
    expect(publish(f.output, f.publication, { ...f.policy, defaultAllow: true })).toEqual(deny("INVALID_POLICY"));
  });
  it("T87 expired, future, cross-owner and stale clearance proofs deny both paths", () => {
    for (const patch of [{ expiresAtMs: 150 }, { issuedAtMs: 151 }, { epoch: 1 }, { policyVersion: "old" },
      { identity: { ...fixtures().request.identity, ownerId: "foreign-owner" } }]) {
      const f = fixtures(); Object.assign(f.admission.securityStop.clearance!, patch); Object.assign(f.publication.securityStop.clearance!, patch);
      expect(admit(f.request, f.admission, f.policy)).toEqual(deny("CLEARANCE_INVALID"));
      expect(publish(f.output, f.publication, f.policy)).toEqual(deny("CLEARANCE_INVALID"));
    }
  });
  it("T88 supplied eligible snapshots do not reserve sequence or mint a one-shot grant", () => {
    const f = fixtures(); const first = publish(f.output, f.publication, f.policy);
    expect(publish(f.output, f.publication, f.policy)).toEqual(first);
    expect(first).toEqual(eligiblePublication);
    f.publication.sequence.seenOutputIds.push(f.output.outputId);
    expect(publish(f.output, f.publication, f.policy)).toEqual(deny("DUPLICATE_OUTPUT"));
  });
  it("T89 throwing accessors are withheld without exposing exception text", () => {
    const f = fixtures();
    const hostile = new Proxy(f.request, { get() { throw new Error("DUMMY_SECRET_ACCESSOR"); } });
    expect(admit(hostile, f.admission, f.policy)).toEqual(deny("INVALID_REQUEST"));
    expect(publish(hostile, f.publication, f.policy)).toEqual(deny("INVALID_OUTPUT"));
  });
  it("T90 cancellation phase rejects even with a stale clear marker", () => {
    const f = fixtures(); f.admission.lifecycle = "CANCELLATION_REQUESTED"; f.publication.lifecycle = "CANCELLATION_REQUESTED";
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("CANCELLED"));
    expect(publish(f.output, f.publication, f.policy)).toEqual(deny("CANCELLED"));
  });
  it("T91 unknown entitlement requirement cannot silently become optional", () => {
    const f = fixtures(); Reflect.set(f.policy.providers[0]!, "entitlementRequired", "UNKNOWN");
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("INVALID_POLICY"));
  });
  it("T92 invalid current time and evidence version deny both paths", () => {
    const f = fixtures(); f.admission.nowMs = Infinity; f.publication.nowMs = Infinity;
    expect(admit(f.request, f.admission, f.policy)).toEqual(deny("INVALID_CONTEXT"));
    expect(publish(f.output, f.publication, f.policy)).toEqual(deny("INVALID_CONTEXT"));
    const g = fixtures(); g.admission.authorization.evidence!.policyVersion = "v0";
    g.publication.authorization.evidence!.identity.workerId = "foreign-worker";
    expect(admit(g.request, g.admission, g.policy)).toEqual(deny("AUTHORIZATION_INVALID"));
    expect(publish(g.output, g.publication, g.policy)).toEqual(deny("AUTHORIZATION_INVALID"));
  });
});
