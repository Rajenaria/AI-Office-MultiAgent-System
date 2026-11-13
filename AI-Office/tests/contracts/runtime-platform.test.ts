import { describe, expect, it, vi } from "vitest";
import { AI_OFFICE_V1_RUNTIME_TARGET, REQUIRED_RUNTIME_CAPABILITIES, assessRuntimeCapabilities,
  classifyRuntimePlatform, type RuntimeCapabilityDeclaration } from "../../src/contracts/runtime-platform.js";
import { assessHostRuntimeCapabilities, assessPlatformRuntimeCapabilities } from "../../src/server/attempt-control/platform-capabilities.js";
import { AdmissionRejected, createExecutionAdmissionBoundary,
  requireExecutionAdmission } from "../../src/server/attempt-control/execution-admission.js";

function declaration(source: "FIXTURE" | "INDEPENDENT_REFERENCE" = "FIXTURE"): RuntimeCapabilityDeclaration {
  return { capabilities: REQUIRED_RUNTIME_CAPABILITIES.map(capability => ({ capability, status: "VERIFIED",
    evidence: { source, platform: "darwin", architecture: "arm64", observedAtMs: 100, validUntilMs: 200 } })),
    securityStop: "CLEARED" };
}
function noAuthority(value: { executionAuthority: false; publicationAuthority: false; deliveryAuthority: false }) {
  expect(value).toMatchObject({ executionAuthority: false, publicationAuthority: false, deliveryAuthority: false });
}

describe("CP01 deterministic target classification and metadata adapters", () => {
  it("records the owner-selected product target without selecting deployment mode", () => {
    expect(AI_OFFICE_V1_RUNTIME_TARGET).toBe("WINDOWS_AND_MACOS");
  });
  it.each(["x64", "arm64"])("classifies Windows %s without verifying production runtime", arch => {
    const value = assessPlatformRuntimeCapabilities("win32", arch);
    expect(value.platform).toMatchObject({ os: "WINDOWS", target: true });
    expect(value.runtimeSupport).toBe("UNVERIFIED");
    expect(value.enforcementComponents).toContainEqual({ component: "JOB_OBJECT_CUSTODY",
      availability: "HISTORICAL_EVIDENCE_ONLY", verification: "UNVERIFIED" });
    expect(value.decision).toBe("DENIED"); noAuthority(value);
  });
  it.each(["x64", "arm64"])("classifies macOS %s with no native containment implementation", arch => {
    const value = assessPlatformRuntimeCapabilities("darwin", arch);
    expect(value.platform).toMatchObject({ os: "MACOS", target: true });
    expect(value.runtimeSupport).toBe("NOT_IMPLEMENTED");
    expect(value.enforcementComponents).toEqual([{ component: "NATIVE_PROCESS_CONTAINMENT",
      availability: "NOT_IMPLEMENTED", verification: "UNVERIFIED" }]);
    noAuthority(value);
  });
  it.each(["linux", "freebsd", "Windows", "macOS", "", undefined, null, 1])("unsupported platform %s fails closed", platform => {
    const value = assessPlatformRuntimeCapabilities(platform, "arm64");
    expect(value.platform).toMatchObject({ os: "UNSUPPORTED", target: false });
    expect(value.runtimeSupport).toBe("UNSUPPORTED"); expect(value.reasons).toContain("PLATFORM_UNSUPPORTED");
    expect(value.enforcementComponents).toEqual([]); noAuthority(value);
  });
  it.each(["ia32", "arm", "ARM64", "", undefined, null, {}])("unknown architecture %s fails closed", arch => {
    const value = assessRuntimeCapabilities("darwin", arch);
    expect(value.platform.architecture).toBe("UNKNOWN"); expect(value.runtimeSupport).toBe("UNSUPPORTED");
    expect(value.reasons).toContain("ARCHITECTURE_UNSUPPORTED"); noAuthority(value);
  });
  it("uses only host detection for the actual adapter", () => {
    const actual = assessHostRuntimeCapabilities();
    expect(actual.platform).toEqual(classifyRuntimePlatform(process.platform, process.arch));
    expect(actual.decision).toBe("DENIED"); noAuthority(actual);
  });
});

describe("CP01 required capabilities and untrusted evidence", () => {
  it.each([
    "IDENTITY_AUTHORITY_MISSING", "MEMBERSHIP_AUTHORITY_MISSING", "ACTIVE_RUN_AUTHORITY_MISSING",
    "CONTAINMENT_UNVERIFIED", "CAPABILITY_GRANT_UNVERIFIED", "SECURITY_STOP_NOT_CLEARED", "INDEPENDENT_AUDIT_MISSING",
  ])("denies explicitly for %s", reason => {
    expect(assessRuntimeCapabilities("darwin", "arm64").reasons).toContain(reason);
  });
  it("requires every capability even when all submitted statuses say VERIFIED", () => {
    const claims = declaration();
    const value = assessRuntimeCapabilities("darwin", "arm64", { ...claims, capabilities: claims.capabilities.slice(1) }, 150);
    expect(value.reasons).toContain("MISSING_REQUIRED_CAPABILITY"); expect(value.decision).toBe("DENIED");
  });
  it("unverified declaration cannot create permission or verified state", () => {
    const value = assessRuntimeCapabilities("win32", "x64", { capabilities: [{ capability: "PROCESS_CONTAINMENT", status: "UNVERIFIED" }] });
    expect(value.reasons).toContain("CONTAINMENT_UNVERIFIED"); noAuthority(value);
  });
  it("an ACTIVE_STOP claim adds denial; a CLEARED claim cannot remove the existing stop barrier", () => {
    expect(assessRuntimeCapabilities("darwin", "arm64", { ...declaration(), securityStop: "ACTIVE_STOP" }, 150).reasons)
      .toContain("SECURITY_STOP_ACTIVE");
    expect(assessRuntimeCapabilities("darwin", "arm64", declaration(), 150).reasons).toContain("SECURITY_STOP_NOT_CLEARED");
  });
  it.each(["FIXTURE", "INDEPENDENT_REFERENCE"] as const)("%s is never independently verified evidence", source => {
    const value = assessRuntimeCapabilities("darwin", "arm64", declaration(source), 150);
    expect(value.reasons).toContain("DECLARED_VERIFICATION_NOT_TRUSTED");
    expect(value.reasons).toContain("CAPABILITY_EVIDENCE_UNVERIFIED");
    expect(value.capabilities.every(capability => capability.status !== ("VERIFIED" as string))).toBe(true);
    expect(value.capabilities.every(capability => capability.evidence === "ABSENT")).toBe(true); noAuthority(value);
  });
  it("declared evidence for another platform/architecture is mismatched", () => {
    const value = assessRuntimeCapabilities("win32", "x64", declaration(), 150);
    expect(value.reasons).toContain("CAPABILITY_EVIDENCE_MISMATCH");
  });
  it.each([200, 201, 99, undefined, NaN])("stale, future or unclocked evidence at %s denies", now => {
    expect(assessRuntimeCapabilities("darwin", "arm64", declaration(), now).reasons).toContain("CAPABILITY_EVIDENCE_STALE");
  });
  it("absent evidence is explicitly unavailable", () => {
    expect(assessRuntimeCapabilities("darwin", "arm64").reasons).toContain("CAPABILITY_EVIDENCE_ABSENT");
  });
  it.each([null, [], { capabilities: "all" }, { capabilities: [{ capability: "UNKNOWN", status: "VERIFIED" }] }])(
    "invalid declaration %s denies without reflecting input", value => {
      const result = assessRuntimeCapabilities("darwin", "arm64", value, 150);
      expect(result.reasons).toContain("INVALID_CAPABILITY_DECLARATION"); noAuthority(result);
    });
  it("duplicate capabilities cannot substitute for missing capabilities", () => {
    const claims = declaration();
    expect(assessRuntimeCapabilities("darwin", "arm64", { capabilities: [claims.capabilities[0], claims.capabilities[0]] }, 150).reasons)
      .toContain("INVALID_CAPABILITY_DECLARATION");
  });
  it("does not execute object or array element accessors", () => {
    const getter = vi.fn(() => { throw new Error("SYNTHETIC_PRIVATE_INPUT"); });
    const object = Object.defineProperty({}, "capabilities", { get: getter });
    const array = Object.defineProperty([], "0", { get: getter });
    for (const input of [object, { capabilities: array }])
      expect(assessRuntimeCapabilities("darwin", "arm64", input).reasons).toContain("INVALID_CAPABILITY_DECLARATION");
    expect(getter).not.toHaveBeenCalled();
  });
  it("repeated evaluations do not mutate inputs, constants or earlier snapshots", () => {
    const input = declaration(), before = JSON.stringify(input), initial = assessRuntimeCapabilities("darwin", "arm64", input, 150);
    for (let index = 0; index < 10; index++) expect(assessRuntimeCapabilities("darwin", "arm64", input, 150)).toEqual(initial);
    expect(JSON.stringify(input)).toBe(before); expect(Object.isFrozen(REQUIRED_RUNTIME_CAPABILITIES)).toBe(true);
    expect(Object.isFrozen(initial)).toBe(true); expect(Object.isFrozen(initial.platform)).toBe(true);
    expect(Object.isFrozen(initial.reasons)).toBe(true); expect(Object.isFrozen(initial.capabilities)).toBe(true);
    expect(initial.capabilities.every(Object.isFrozen)).toBe(true);
  });
});

describe("CP01 actual PI09A admission integration; no host/storage/process bootstrap", () => {
  it("actual missing identity path retains original caller shape/reason and owns platform assessment", async () => {
    const boundary = createExecutionAdmissionBoundary();
    const denied = await boundary.api.admit({ platform: "win32", capabilityStatus: "VERIFIED" });
    expect(Object.keys(denied).sort()).toEqual(["admitted", "executionAuthority", "reasonCode", "correlationId"].sort());
    expect(denied).toMatchObject({ admitted: false, executionAuthority: false, reasonCode: "ADMISSION_NOT_AUTHORIZED" });
    const audit = boundary.inspectDenial(denied)!;
    expect(audit.reason).toBe("AUTHENTICATION_REQUIRED");
    expect(audit.platformCapabilities).toEqual(assessHostRuntimeCapabilities());
    expect(audit.workspace).toBe("NOT_EVALUATED"); expect(audit.repository).toBe("NOT_EVALUATED");
    noAuthority(audit.platformCapabilities); expect(boundary.inspectDenial({ ...denied })).toBeNull();
  });
  it("unverified identity keeps existing source-unavailable denial", async () => {
    const boundary = createExecutionAdmissionBoundary(), denial = await boundary.api.admit({}, { authenticated: true });
    expect(boundary.inspectDenial(denial)?.reason).toBe("AUTHENTICATION_SOURCE_UNAVAILABLE");
  });
  it("even a positive-looking authentication dependency cannot bypass platform/domain denial", async () => {
    const boundary = createExecutionAdmissionBoundary({ authenticate: () => ({ status: "VERIFIED", executionAuthority: true }) });
    const denial = await boundary.api.admit({ capabilities: declaration() }, declaration());
    expect(denial.admitted).toBe(false); expect(boundary.inspectDenial(denial)?.reason).toBe("ADMISSION_NOT_AUTHORIZED");
    expect(boundary.inspectDenial(denial)?.platformCapabilities.reasons).toContain("CONTAINMENT_UNVERIFIED");
  });
  it.each(["close", "invalidate"] as const)("%s across authentication await preserves denial", async action => {
    let release!: (value: unknown) => void;
    const waiting = new Promise<unknown>(resolve => { release = resolve; });
    const boundary = createExecutionAdmissionBoundary({ authenticate: () => waiting });
    const pending = boundary.api.admit({}, {}); boundary[action](); release({ status: "VERIFIED" });
    const denial = await pending;
    expect(boundary.inspectDenial(denial)?.reason).toBe(action === "close" ? "ADMISSION_CLOSED" : "ADMISSION_INVALIDATED");
    expect(boundary.inspectDenial(denial)?.platformCapabilities.decision).toBe("DENIED");
  });
  it("cancellation remains ahead of authentication and platform assessment cannot unlock it", async () => {
    const authenticate = vi.fn(), boundary = createExecutionAdmissionBoundary({ authenticate });
    const controller = new AbortController(); controller.abort();
    const denial = await boundary.api.admit({}, {}, controller.signal);
    expect(boundary.inspectDenial(denial)?.reason).toBe("ADMISSION_CANCELLED"); expect(authenticate).not.toHaveBeenCalled();
  });
  it("requireExecutionAdmission still throws and forged guards are never invoked", async () => {
    const boundary = createExecutionAdmissionBoundary(), fake = vi.fn(() => ({ admitted: true }));
    await expect(requireExecutionAdmission(boundary.api, {}, declaration())).rejects.toBeInstanceOf(AdmissionRejected);
    await expect(requireExecutionAdmission({ admit: fake }, {}, {})).rejects.toBeInstanceOf(AdmissionRejected);
    expect(fake).not.toHaveBeenCalled();
  });
  it("admission does not read caller platform/evidence getters before PI08 denial", async () => {
    const get = vi.fn(() => { throw new Error("UNTRUSTED_GETTER"); });
    const input = new Proxy({}, { get, ownKeys: get, has: get });
    const boundary = createExecutionAdmissionBoundary(), denial = await boundary.api.admit(input, input);
    expect(denial.admitted).toBe(false); expect(get).not.toHaveBeenCalled();
  });
});
