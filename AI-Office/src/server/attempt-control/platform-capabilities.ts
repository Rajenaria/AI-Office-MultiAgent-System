import { assessRuntimeCapabilities, type RuntimeCapabilityAssessment,
  type PlatformEnforcementComponent } from "../../contracts/runtime-platform.js";

export type HostRuntimeCapabilityAssessment = Readonly<RuntimeCapabilityAssessment & {
  enforcementComponents: readonly PlatformEnforcementComponent[];
}>;

// Metadata adapters only. No native enforcement component is instantiated/probed.
// Windows path guards and historical Job/MXC evidence are distinct from a verified
// production runtime adapter. macOS intentionally supplies no containment substitute.
export const PLATFORM_ENFORCEMENT_BOUNDARIES = Object.freeze({
  WINDOWS: Object.freeze([
    Object.freeze({ component: "WINDOWS_PATH_GUARD", availability: "SOURCE_PRESENT", verification: "UNVERIFIED" }),
    Object.freeze({ component: "JOB_OBJECT_CUSTODY", availability: "HISTORICAL_EVIDENCE_ONLY", verification: "UNVERIFIED" }),
  ] as const),
  MACOS: Object.freeze([
    Object.freeze({ component: "NATIVE_PROCESS_CONTAINMENT", availability: "NOT_IMPLEMENTED", verification: "UNVERIFIED" }),
  ] as const),
  UNSUPPORTED: Object.freeze([]),
});

// Actual admission uses only host detection; request data cannot select a platform,
// install an adapter/verifier, supply time or override capability readiness.
export function assessPlatformRuntimeCapabilities(platform: unknown, architecture: unknown): HostRuntimeCapabilityAssessment {
  const assessment = assessRuntimeCapabilities(platform, architecture);
  return Object.freeze({ ...assessment, enforcementComponents: PLATFORM_ENFORCEMENT_BOUNDARIES[assessment.platform.os] });
}
export function assessHostRuntimeCapabilities(): HostRuntimeCapabilityAssessment {
  return assessPlatformRuntimeCapabilities(process.platform, process.arch);
}
