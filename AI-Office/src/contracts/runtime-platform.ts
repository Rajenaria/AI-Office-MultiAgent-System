// Capability observations are prerequisites, never grants or runtime permission.
// CP01 has no independent capability-evidence verifier. Declarations cannot mint one.
export const AI_OFFICE_V1_RUNTIME_TARGET = "WINDOWS_AND_MACOS" as const;
export type CapabilityStatus = "UNSUPPORTED" | "NOT_IMPLEMENTED" | "UNVERIFIED" | "OFFLINE_ONLY" | "VERIFIED";
export type RuntimeArchitecture = "X64" | "ARM64" | "UNKNOWN";
export type RuntimePlatform = Readonly<
  { os: "WINDOWS"; target: true; architecture: RuntimeArchitecture } |
  { os: "MACOS"; target: true; architecture: RuntimeArchitecture } |
  { os: "UNSUPPORTED"; target: false; architecture: RuntimeArchitecture }
>;
export const REQUIRED_RUNTIME_CAPABILITIES = Object.freeze([
  "IDENTITY_VERIFICATION", "WORKSPACE_AUTHORIZATION", "ACTIVE_RUN_AUTHORITY",
  "PROCESS_CONTAINMENT", "CAPABILITY_GRANT", "SECURITY_STOP_CLEARANCE", "INDEPENDENT_AUDIT",
] as const);
export type RequiredRuntimeCapability = typeof REQUIRED_RUNTIME_CAPABILITIES[number];
export type PlatformEnforcementComponent = Readonly<{
  component: "WINDOWS_PATH_GUARD" | "JOB_OBJECT_CUSTODY" | "NATIVE_PROCESS_CONTAINMENT";
  availability: "SOURCE_PRESENT" | "HISTORICAL_EVIDENCE_ONLY" | "NOT_IMPLEMENTED";
  verification: "UNVERIFIED";
}>;

// Typed future declarations are intentionally untrusted. An INDEPENDENT_REFERENCE
// is a claimed reference, not independently verified evidence or a principal handle.
export type RuntimeCapabilityDeclaration = Readonly<{
  capabilities: readonly Readonly<{
    capability: RequiredRuntimeCapability;
    status: CapabilityStatus;
    evidence?: Readonly<{ source: "CALLER" | "FIXTURE" | "INDEPENDENT_REFERENCE";
      platform: string; architecture: string; observedAtMs: number; validUntilMs: number }>;
  }>[];
  securityStop?: "UNKNOWN" | "BLOCKED" | "ACTIVE_STOP" | "CLEARED";
}>;
export type RuntimeCapabilityReason =
  "PLATFORM_UNSUPPORTED" | "ARCHITECTURE_UNSUPPORTED" | "IDENTITY_AUTHORITY_MISSING" |
  "MEMBERSHIP_AUTHORITY_MISSING" | "ACTIVE_RUN_AUTHORITY_MISSING" | "CONTAINMENT_UNVERIFIED" |
  "CAPABILITY_GRANT_UNVERIFIED" | "SECURITY_STOP_NOT_CLEARED" | "SECURITY_STOP_ACTIVE" |
  "INDEPENDENT_AUDIT_MISSING" | "CAPABILITY_EVIDENCE_ABSENT" | "CAPABILITY_EVIDENCE_UNVERIFIED" |
  "CAPABILITY_EVIDENCE_STALE" | "CAPABILITY_EVIDENCE_MISMATCH" | "MISSING_REQUIRED_CAPABILITY" |
  "INVALID_CAPABILITY_DECLARATION" | "DECLARED_VERIFICATION_NOT_TRUSTED";
export type RuntimeCapabilityAssessment = Readonly<{
  decision: "DENIED";
  platform: RuntimePlatform;
  runtimeSupport: "UNSUPPORTED" | "NOT_IMPLEMENTED" | "UNVERIFIED";
  capabilities: readonly Readonly<{ capability: RequiredRuntimeCapability;
    status: "NOT_IMPLEMENTED" | "UNVERIFIED"; evidence: "ABSENT" }> [];
  reasons: readonly RuntimeCapabilityReason[];
  executionAuthority: false; publicationAuthority: false; deliveryAuthority: false;
}>;

export function classifyRuntimePlatform(platform: unknown, architecture: unknown): RuntimePlatform {
  const arch: RuntimeArchitecture = architecture === "x64" ? "X64" : architecture === "arm64" ? "ARM64" : "UNKNOWN";
  if (platform === "win32") return Object.freeze({ os: "WINDOWS", target: true, architecture: arch });
  if (platform === "darwin") return Object.freeze({ os: "MACOS", target: true, architecture: arch });
  return Object.freeze({ os: "UNSUPPORTED", target: false, architecture: arch });
}

// Copy only bounded inert data fields; never invoke accessors/coercion or log input.
// Proxy traps inside the trusted JS realm are not an OS security boundary.
function fields(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype)
    throw new Error("INVALID_DECLARATION");
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(descriptors).length > 8) throw new Error("INVALID_DECLARATION");
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!("value" in descriptor) || key === "__proto__" || key === "constructor" || key === "prototype")
      throw new Error("INVALID_DECLARATION");
    result[key] = descriptor.value;
  }
  return result;
}
function entries(value: unknown): unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || Object.getOwnPropertySymbols(value).length)
    throw new Error("INVALID_DECLARATION");
  const descriptors = Object.getOwnPropertyDescriptors(value), size = Object.getOwnPropertyDescriptor(value, "length")?.value as unknown;
  if (typeof size !== "number" || size > REQUIRED_RUNTIME_CAPABILITIES.length || Reflect.ownKeys(descriptors).length !== size + 1)
    throw new Error("INVALID_DECLARATION");
  const result: unknown[] = [];
  for (let index = 0; index < size; index++) {
    const descriptor = descriptors[String(index)];
    if (!descriptor || !("value" in descriptor)) throw new Error("INVALID_DECLARATION");
    result.push(descriptor.value);
  }
  return result;
}
function inspectDeclaration(value: unknown, platform: unknown, architecture: unknown, nowMs: unknown,
  add: (reason: RuntimeCapabilityReason) => void): void {
  if (value === undefined) { add("CAPABILITY_EVIDENCE_ABSENT"); return; }
  try {
    const input = fields(value);
    if (input.securityStop === "ACTIVE_STOP") add("SECURITY_STOP_ACTIVE");
    const seen = new Set<string>();
    for (const item of entries(input.capabilities)) {
      const entry = fields(item);
      if (!REQUIRED_RUNTIME_CAPABILITIES.includes(entry.capability as RequiredRuntimeCapability) ||
        seen.has(entry.capability as string)) throw new Error("INVALID_DECLARATION");
      seen.add(entry.capability as string);
      if (!["UNSUPPORTED", "NOT_IMPLEMENTED", "UNVERIFIED", "OFFLINE_ONLY", "VERIFIED"].includes(entry.status as string))
        throw new Error("INVALID_DECLARATION");
      if (entry.status === "VERIFIED") add("DECLARED_VERIFICATION_NOT_TRUSTED");
      if (entry.evidence === undefined) { add("CAPABILITY_EVIDENCE_ABSENT"); continue; }
      const evidence = fields(entry.evidence);
      add("CAPABILITY_EVIDENCE_UNVERIFIED"); // No evidence-verification authority exists in CP01.
      if (!["CALLER", "FIXTURE", "INDEPENDENT_REFERENCE"].includes(evidence.source as string))
        throw new Error("INVALID_DECLARATION");
      if (evidence.platform !== platform || evidence.architecture !== architecture) add("CAPABILITY_EVIDENCE_MISMATCH");
      const observed = evidence.observedAtMs, expiry = evidence.validUntilMs;
      if (typeof nowMs !== "number" || !Number.isSafeInteger(nowMs) || nowMs < 0 ||
        typeof observed !== "number" || !Number.isSafeInteger(observed) || observed < 0 ||
        typeof expiry !== "number" || !Number.isSafeInteger(expiry) || expiry <= observed ||
        observed > nowMs || expiry <= nowMs) add("CAPABILITY_EVIDENCE_STALE");
    }
    if (seen.size !== REQUIRED_RUNTIME_CAPABILITIES.length) add("MISSING_REQUIRED_CAPABILITY");
  } catch { add("INVALID_CAPABILITY_DECLARATION"); }
}

// Pure denial assessment. Neither a detected platform nor claimed evidence can
// create VERIFIED capability state; timestamps only diagnose untrusted claims.
export function assessRuntimeCapabilities(platform: unknown, architecture: unknown,
  declaration?: unknown, nowMs?: unknown): RuntimeCapabilityAssessment {
  const detected = classifyRuntimePlatform(platform, architecture);
  const reasons = new Set<RuntimeCapabilityReason>();
  if (!detected.target) reasons.add("PLATFORM_UNSUPPORTED");
  if (detected.architecture === "UNKNOWN") reasons.add("ARCHITECTURE_UNSUPPORTED");
  for (const reason of ["IDENTITY_AUTHORITY_MISSING", "MEMBERSHIP_AUTHORITY_MISSING", "ACTIVE_RUN_AUTHORITY_MISSING",
    "CONTAINMENT_UNVERIFIED", "CAPABILITY_GRANT_UNVERIFIED", "SECURITY_STOP_NOT_CLEARED", "INDEPENDENT_AUDIT_MISSING"] as const)
    reasons.add(reason);
  inspectDeclaration(declaration, platform, architecture, nowMs, reason => { reasons.add(reason); });
  const capabilities = Object.freeze(REQUIRED_RUNTIME_CAPABILITIES.map(capability => Object.freeze({ capability,
    status: capability === "PROCESS_CONTAINMENT" || capability === "SECURITY_STOP_CLEARANCE" ?
      "UNVERIFIED" as const : "NOT_IMPLEMENTED" as const, evidence: "ABSENT" as const })));
  return Object.freeze({ decision: "DENIED", platform: detected,
    runtimeSupport: !detected.target || detected.architecture === "UNKNOWN" ? "UNSUPPORTED" :
      detected.os === "MACOS" ? "NOT_IMPLEMENTED" : "UNVERIFIED",
    capabilities, reasons: Object.freeze([...reasons]),
    executionAuthority: false, publicationAuthority: false, deliveryAuthority: false });
}
