import { describe, expect, it, vi } from "vitest";
import { assessRuntimeCapabilities, REQUIRED_RUNTIME_CAPABILITIES,
  type RuntimeCapabilityDeclaration } from "../../src/contracts/runtime-platform.js";
import { assessHostRuntimeCapabilities } from "../../src/server/attempt-control/platform-capabilities.js";
import { AdmissionRejected, createExecutionAdmissionBoundary, requireExecutionAdmission,
  type AdmissionAuthentication } from "../../src/server/attempt-control/execution-admission.js";
import { createOutputPublicationBoundary, denyOutputPublication } from "../../src/server/attempt-control/output-publication.js";
import { AttemptSchema, ExpectedSchema, hash } from "../../src/server/attempt-control/contracts.js";
import { evaluatePersistedReadiness } from "../../src/server/attempt-control/execution-readiness.js";
import { classifyRecovery, ReconcileSchema } from "../../src/server/attempt-control/recovery.js";

// Synthetic inert data only: no native identities, OS handles, credentials or stores.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const digest = "0".repeat(64);
function attemptFixture() {
  const attempt = AttemptSchema.parse({ projectId: id(1), authorityIncarnation: id(2), taskId: "task:cp02",
    attemptId: id(3), issueRequestId: id(4), issueDigest: digest, bindingId: "workspace:cp02", bindingGeneration: 1,
    scopeDigest: digest, actionDigest: digest, permissionDigest: digest, runtimeRef: "s12-host-only", executionMode: "synthetic",
    createdAtMs: 100, updatedAtMs: 100, attemptGeneration: 1, stateVersion: 1, phase: "APPROVAL_GRANTED",
    hostInstanceId: id(5), ownerId: id(6), ownerNonceHash: hash(digest), ownerMode: "EXECUTION", conflictHeld: 1,
    terminalReceiptId: null, terminalDigest: null, terminalPayload: null });
  const expected = ExpectedSchema.parse({ projectId: attempt.projectId, authorityIncarnation: attempt.authorityIncarnation,
    taskId: attempt.taskId, attemptId: attempt.attemptId, attemptGeneration: attempt.attemptGeneration,
    stateVersion: attempt.stateVersion, phase: attempt.phase, hostInstanceId: attempt.hostInstanceId,
    ownerId: attempt.ownerId, ownerNonce: digest });
  return { attempt, expected };
}
function claimedEnforcement(): RuntimeCapabilityDeclaration {
  return { capabilities: REQUIRED_RUNTIME_CAPABILITIES.map(capability => ({ capability, status: "VERIFIED",
    evidence: { source: "INDEPENDENT_REFERENCE", platform: "win32", architecture: "x64", observedAtMs: 100, validUntilMs: 200 } })),
    securityStop: "CLEARED" };
}
const unsafeClaims = [
  { containmentAuthority: true },
  { processCustody: "EXCLUSIVE_VERIFIED", processId: 123, creationIdentity: "synthetic" },
  { descendantsStopped: true, cleanupComplete: true },
  { jobObjectConfigured: true, killOnClose: true, lastHandleClosed: true },
  { appSandbox: true, processGroup: true, sandboxExec: true },
  { os: "darwin", architecture: "arm64", capabilities: claimedEnforcement() },
  { runtimeSupport: "VERIFIED", isSecure: true, securityStop: "CLEARED" },
];

describe("CP02 actual admission rejects supplied containment/custody authority", () => {
  it.each(unsafeClaims)("untrusted report %j cannot confer process authority", async claim => {
    const boundary = createExecutionAdmissionBoundary(), before = JSON.stringify(claim);
    const denial = await boundary.api.admit(claim, claim);
    expect(denial).toMatchObject({ admitted: false, executionAuthority: false, reasonCode: "ADMISSION_NOT_AUTHORIZED" });
    const audit = boundary.inspectDenial(denial)!;
    expect(audit.reason).toBe("AUTHENTICATION_SOURCE_UNAVAILABLE");
    expect(audit.platformCapabilities).toEqual(assessHostRuntimeCapabilities());
    expect(audit.platformCapabilities.reasons).toEqual(expect.arrayContaining([
      "CONTAINMENT_UNVERIFIED", "SECURITY_STOP_NOT_CLEARED", "INDEPENDENT_AUDIT_MISSING",
      "IDENTITY_AUTHORITY_MISSING", "MEMBERSHIP_AUTHORITY_MISSING", "ACTIVE_RUN_AUTHORITY_MISSING",
    ]));
    expect(audit.workspace).toBe("NOT_EVALUATED"); expect(audit.repository).toBe("NOT_EVALUATED");
    expect(JSON.stringify(claim)).toBe(before);
  });
  it("a claimed independent success from an authentication dependency still cannot supply custody", async () => {
    const boundary = createExecutionAdmissionBoundary({ authenticate: () => ({ status: "AUTHENTICATION_VERIFIED_TRUSTED_SOURCE",
      executionAuthority: true, containmentAuthority: true, custody: "EXCLUSIVE_VERIFIED" }) });
    const denial = await boundary.api.admit(claimedEnforcement(), claimedEnforcement());
    const audit = boundary.inspectDenial(denial)!;
    expect(denial.admitted).toBe(false); expect(audit.reason).toBe("ADMISSION_NOT_AUTHORIZED");
    expect(audit.platformCapabilities.capabilities.find(c => c.capability === "PROCESS_CONTAINMENT"))
      .toEqual({ capability: "PROCESS_CONTAINMENT", status: "UNVERIFIED", evidence: "ABSENT" });
  });
  it.each(["throw", "reject", "missing", "malformed"])("%s auth dependency preserves fixed denial and missing containment", async mode => {
    const secret = "SYNTHETIC_CP02_PRIVATE_DETAIL";
    const auth = mode === "missing" ? {} : { authenticate() {
      if (mode === "throw") throw new Error(secret);
      if (mode === "reject") return Promise.reject(new Error(secret));
      return new Proxy({}, { has() { throw new Error(secret); } });
    } };
    const boundary = createExecutionAdmissionBoundary(auth as AdmissionAuthentication), denial = await boundary.api.admit({}, {});
    const audit = boundary.inspectDenial(denial)!;
    expect(audit.reason).toBe("ADMISSION_DEPENDENCY_UNAVAILABLE");
    expect(audit.platformCapabilities.reasons).toContain("CONTAINMENT_UNVERIFIED");
    expect(JSON.stringify({ denial, audit })).not.toContain(secret);
  });
  it("caller native-enforcement callbacks/getters are not invoked or installed", async () => {
    const touched = vi.fn(() => { throw new Error("UNTRUSTED_NATIVE_CALLBACK"); });
    const input = new Proxy({}, { get: touched, has: touched, ownKeys: touched });
    const boundary = createExecutionAdmissionBoundary(), denial = await boundary.api.admit(input, input);
    expect(denial.admitted).toBe(false); expect(touched).not.toHaveBeenCalled();
  });
  it.each(["close", "invalidate", "abort"] as const)("%s during claimed native verification cannot restore authority", async action => {
    let release!: (value: unknown) => void;
    const pendingEvidence = new Promise<unknown>(resolve => { release = resolve; });
    const boundary = createExecutionAdmissionBoundary({ authenticate: () => pendingEvidence }), controller = new AbortController();
    const pending = boundary.api.admit(claimedEnforcement(), {}, controller.signal);
    if (action === "abort") controller.abort(); else boundary[action]();
    release({ status: "VERIFIED", containmentAuthority: true });
    const denial = await pending, audit = boundary.inspectDenial(denial)!;
    expect(denial.admitted).toBe(false);
    expect(audit.reason).toBe(action === "close" ? "ADMISSION_CLOSED" : action === "invalidate" ? "ADMISSION_INVALIDATED" : "ADMISSION_CANCELLED");
    expect(audit.platformCapabilities.reasons).toContain("CONTAINMENT_UNVERIFIED");
  });
  it("copied capability/audit/guard shapes cannot replace the registered throwing guard", async () => {
    const boundary = createExecutionAdmissionBoundary(), denial = await boundary.api.admit({}, {});
    const forged = vi.fn(() => ({ admitted: true, executionAuthority: true }));
    for (const value of [{ admit: forged }, { ...boundary.api }, { ...boundary.inspectDenial(denial) }])
      await expect(requireExecutionAdmission(value, {}, claimedEnforcement())).rejects.toBeInstanceOf(AdmissionRejected);
    await expect(requireExecutionAdmission(boundary.api, {}, claimedEnforcement())).rejects.toBeInstanceOf(AdmissionRejected);
    expect(forged).not.toHaveBeenCalled();
  });
  it("owned assessments and platform components remain immutable across repeated denial", async () => {
    const boundary = createExecutionAdmissionBoundary(), input = claimedEnforcement();
    const first = await boundary.api.admit(input, input), audit = boundary.inspectDenial(first)!;
    const before = JSON.stringify(audit);
    const second = await boundary.api.admit(input, input);
    expect(second.correlationId).not.toBe(first.correlationId); expect(JSON.stringify(audit)).toBe(before);
    expect(Object.isFrozen(audit)).toBe(true); expect(Object.isFrozen(audit.platformCapabilities)).toBe(true);
    expect(Object.isFrozen(audit.platformCapabilities.enforcementComponents)).toBe(true);
    expect(audit.platformCapabilities.enforcementComponents.every(Object.isFrozen)).toBe(true);
    expect(boundary.inspectDenial({ ...first })).toBeNull();
  });
});

describe("CP02 CP01 diagnostic evidence remains separate from authority", () => {
  it.each(["linux", "freebsd", undefined])("unsupported %s plus all-verified claim still denies", platform => {
    const assessment = assessRuntimeCapabilities(platform, "arm64", claimedEnforcement(), 150);
    expect(assessment.runtimeSupport).toBe("UNSUPPORTED"); expect(assessment.reasons).toContain("PLATFORM_UNSUPPORTED");
    expect(assessment.executionAuthority).toBe(false);
  });
  it("contradictory native platform evidence is unverified and cannot supply custody", () => {
    const assessment = assessRuntimeCapabilities("darwin", "arm64", claimedEnforcement(), 150);
    expect(assessment.reasons).toEqual(expect.arrayContaining([
      "CAPABILITY_EVIDENCE_MISMATCH", "CAPABILITY_EVIDENCE_UNVERIFIED", "DECLARED_VERIFICATION_NOT_TRUSTED", "CONTAINMENT_UNVERIFIED",
    ]));
    expect(assessment.capabilities.every(c => c.evidence === "ABSENT")).toBe(true);
  });
  it.each([200, 500, 99, Number.NaN])("expired, future or unclocked evidence at %s never removes denial", now => {
    const assessment = assessRuntimeCapabilities("win32", "x64", claimedEnforcement(), now);
    expect(assessment.reasons).toContain("CAPABILITY_EVIDENCE_STALE"); expect(assessment.decision).toBe("DENIED");
  });
  it("admission does not forward stale/contradictory caller reports into trusted host assessment", async () => {
    const boundary = createExecutionAdmissionBoundary();
    const denial = await boundary.api.admit({ os: "unsupported", evidenceTime: -1, report: claimedEnforcement() }, claimedEnforcement());
    const host = boundary.inspectDenial(denial)!.platformCapabilities;
    expect(host).toEqual(assessHostRuntimeCapabilities()); expect(host.reasons).toContain("CAPABILITY_EVIDENCE_ABSENT");
    expect(host.reasons).not.toContain("CAPABILITY_EVIDENCE_STALE");
  });
});

describe("CP02 existing pure canonical-row readiness and recovery semantics", () => {
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP"] as const)("%s security row denies despite a matched attempt/owner", state => {
    const { attempt, expected } = attemptFixture();
    const row = { projectId: attempt.projectId, authorityIncarnation: attempt.authorityIncarnation,
      recordVersion: 1, securityRevision: 1, securityState: state, policyVersion: null, stopJournalHead: null };
    const before = JSON.stringify({ attempt, row });
    const result = evaluatePersistedReadiness(attempt, row, { expected, securityRevision: 1 });
    expect(result.eligible).toBe(false); expect(result.executionAuthority).toBe(false);
    expect(result.reasons).toContain(state === "ACTIVE_STOP" ? "SECURITY_STOP_ACTIVE" : state === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STATE_UNKNOWN");
    expect(result.observed?.securityState).toBe(state); expect(JSON.stringify({ attempt, row })).toBe(before);
  });
  it("missing security row and unsupported CLEARED state cannot become a clearance", () => {
    const { attempt, expected } = attemptFixture(), request = { expected, securityRevision: 1 };
    expect(evaluatePersistedReadiness(attempt, undefined, request).reason).toBe("SECURITY_RECORD_MISSING");
    expect(evaluatePersistedReadiness(attempt, { projectId: attempt.projectId, authorityIncarnation: attempt.authorityIncarnation,
      recordVersion: 1, securityRevision: 1, securityState: "CLEARED", policyVersion: null }, request).reason).toBe("SECURITY_RECORD_INVALID");
  });
  it("unknown process evidence produces recovery quarantine and never authorizes retry", () => {
    const { attempt, expected } = attemptFixture();
    const recoveryExpected = { projectId: expected.projectId, authorityIncarnation: expected.authorityIncarnation,
      taskId: expected.taskId, attemptId: expected.attemptId, attemptGeneration: expected.attemptGeneration,
      stateVersion: expected.stateVersion, phase: expected.phase };
    const input = { expected: recoveryExpected, clock: { hostInstanceId: attempt.hostInstanceId,
      clockDomainId: id(7), wallMs: 200, monotonicMs: 200 }, reconciliationId: id(8), decisionId: id(9),
      process: { evidenceId: id(10), status: "UNKNOWN", parent: null, child: null,
        completeScope: false, effectsClassified: false, source: "synthetic-trusted-host" },
      retryRequested: true, authorization: "s12-test-only" };
    expect(() => ReconcileSchema.parse({ ...input, expected })).toThrow();
    const command = ReconcileSchema.parse(input);
    const result = classifyRecovery(attempt, command);
    expect(result).toMatchObject({ classification: "QUARANTINED", processClassification: "UNKNOWN", dispatch: "CLOSED", retryAuthorized: false });
    expect(result.retryEligibility).toBe("RETRY_REQUIRES_RECONCILIATION");
  });
});

describe("CP02 existing publication boundary cannot consume platform observations as output permission", () => {
  it("actual PI09B still denies a real CP01 observation and a forged publisher callback", () => {
    const boundary = createOutputPublicationBoundary(), observation = assessHostRuntimeCapabilities();
    const denial = denyOutputPublication(boundary.api, { containmentReport: observation }, observation);
    expect(denial).toMatchObject({ accepted: false, publicationAuthority: false, executionAuthority: false });
    expect(boundary.inspectDenial(denial)).toMatchObject({ destination: "NOT_EVALUATED", confidentiality: "NOT_EVALUATED" });
    const fake = vi.fn(() => ({ accepted: true, publicationAuthority: true }));
    expect(denyOutputPublication({ evaluate: fake }, {}, observation).accepted).toBe(false); expect(fake).not.toHaveBeenCalled();
  });
});
