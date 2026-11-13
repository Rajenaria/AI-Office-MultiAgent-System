import { randomUUID } from "node:crypto";
import { createHostPrincipalBoundary } from "./host-principal.js";
import { assessHostRuntimeCapabilities, type HostRuntimeCapabilityAssessment } from "./platform-capabilities.js";

export type AdmissionDenial = Readonly<{ admitted: false; executionAuthority: false;
  reasonCode: "ADMISSION_NOT_AUTHORIZED"; correlationId: string }>;
type AuditReason = "AUTHENTICATION_REQUIRED" | "AUTHENTICATION_SOURCE_UNAVAILABLE" | "HOST_CONTEXT_INVALID" |
  "ADMISSION_DEPENDENCY_UNAVAILABLE" | "ADMISSION_NOT_AUTHORIZED" | "ADMISSION_INVALIDATED" | "ADMISSION_CLOSED" | "ADMISSION_CANCELLED";
export type AdmissionAudit = Readonly<{ correlationId: string; reason: AuditReason; boundaryGeneration: number;
  workspace: "NOT_EVALUATED"; repository: "NOT_EVALUATED"; executionAuthority: false;
  platformCapabilities: HostRuntimeCapabilityAssessment }>;
// Trusted composition dependency only. Unknown results/throws cannot create a positive path.
export type AdmissionAuthentication = Readonly<{ authenticate(evidence?: unknown): unknown }>;
export type ExecutionAdmission = Readonly<{
  admit(request: unknown, evidence?: unknown, signal?: AbortSignal): Promise<AdmissionDenial>;
}>;
type Admit = ExecutionAdmission["admit"];
const owned = new WeakMap<object, Admit>();
function publicDenial(): AdmissionDenial {
  return Object.freeze({ admitted: false, executionAuthority: false, reasonCode: "ADMISSION_NOT_AUTHORIZED", correlationId: randomUUID() });
}
export class AdmissionRejected extends Error {
  constructor(readonly denial: AdmissionDenial) {
    super("ADMISSION_NOT_AUTHORIZED"); this.name = "AdmissionRejected"; Object.freeze(this);
  }
}

// No continuations, repository callbacks, dispatchers or other side-effect dependencies are accepted.
// Authentication can select a denial reason only; even an unexpected positive result remains denied.
export function createExecutionAdmissionBoundary(authentication: AdmissionAuthentication = createHostPrincipalBoundary().api) {
  const audits = new WeakMap<object, AdmissionAudit>();
  let closed = false, generation = 1;
  // Existing admission already denies all paths. Every owned denial now assesses
  // host platform prerequisites as well; original caller shape/reasons and PI08
  // lifecycle ordering stay intact. This does not instantiate native enforcement.
  const deny = (reason: AuditReason): AdmissionDenial => {
    const denial = publicDenial();
    audits.set(denial, Object.freeze({ correlationId: denial.correlationId, reason, boundaryGeneration: generation,
      workspace: "NOT_EVALUATED", repository: "NOT_EVALUATED", executionAuthority: false,
      platformCapabilities: assessHostRuntimeCapabilities() }));
    return denial;
  };
  const admit: Admit = async (_request, evidence, signal) => {
    const startedGeneration = generation;
    try {
      if (closed) return deny("ADMISSION_CLOSED");
      if (signal?.aborted) return deny("ADMISSION_CANCELLED");
      const result: unknown = await authentication.authenticate(evidence);
      if (closed) return deny("ADMISSION_CLOSED");
      if (generation !== startedGeneration) return deny("ADMISSION_INVALIDATED");
      if (signal?.aborted) return deny("ADMISSION_CANCELLED");
      if (typeof result === "object" && result !== null && "status" in result && result.status === "AUTHENTICATION_DENIED") {
        const reason = "reason" in result ? result.reason : undefined;
        return deny(reason === "IDENTITY_EVIDENCE_MISSING" ? "AUTHENTICATION_REQUIRED" :
          reason === "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" ? "AUTHENTICATION_SOURCE_UNAVAILABLE" :
          reason === "HOST_AUTHENTICATION_CLOSED" ? "HOST_CONTEXT_INVALID" : "ADMISSION_NOT_AUTHORIZED");
      }
      return deny("ADMISSION_NOT_AUTHORIZED"); // No positive admission, including test-supplied dependency results.
    } catch { return deny(closed ? "ADMISSION_CLOSED" : "ADMISSION_DEPENDENCY_UNAVAILABLE"); }
  };
  const api: ExecutionAdmission = Object.freeze({ admit }); owned.set(api, admit);
  return Object.freeze({ api,
    inspectDenial(input: unknown): AdmissionAudit | null {
      return typeof input === "object" && input !== null ? audits.get(input) ?? null : null;
    },
    invalidate() { if (!closed) { if (generation === Number.MAX_SAFE_INTEGER) closed = true; else generation++; } },
    close() { closed = true; },
  });
}

// Actual request handlers call this before even entering their mutation queue.
// Use private membership/closure, never a caller-provided admit/require function or trusted flag.
export async function requireExecutionAdmission(boundary: unknown, request: unknown, evidence?: unknown): Promise<never> {
  const admit = typeof boundary === "object" && boundary !== null ? owned.get(boundary) : undefined;
  throw new AdmissionRejected(admit ? await admit(request, evidence) : publicDenial());
}
