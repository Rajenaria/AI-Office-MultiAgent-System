import { randomUUID } from "node:crypto";
import { createHostPrincipalBoundary } from "./host-principal.js";

export type PublicationDenial = Readonly<{ accepted: false; publicationAuthority: false; executionAuthority: false;
  reasonCode: "PUBLICATION_NOT_AUTHORIZED"; correlationId: string }>;
type Reason = "PUBLICATION_AUTHENTICATION_REQUIRED" | "PUBLICATION_AUTHORITY_UNAVAILABLE" | "HOST_CONTEXT_INVALID" |
  "PUBLICATION_DEPENDENCY_UNAVAILABLE" | "PUBLICATION_NOT_AUTHORIZED" | "PUBLICATION_INVALIDATED" | "PUBLICATION_CLOSED" | "OUTPUT_CANCELLED";
export type PublicationAudit = Readonly<{ correlationId: string; reason: Reason; boundaryGeneration: number;
  workspace: "NOT_EVALUATED"; repository: "NOT_EVALUATED"; outputContract: "NOT_EVALUATED";
  ownership: "NOT_EVALUATED"; destination: "NOT_EVALUATED"; confidentiality: "NOT_EVALUATED"; sequence: "NOT_EVALUATED";
  publicationAuthority: false; executionAuthority: false }>;
// Actual PI08 authentication is synchronous. Unknown/thenable results are never awaited or accepted.
// Trusted composition dependency only; caller input cannot install this dependency.
export type PublicationAuthentication = Readonly<{ authenticate(evidence?: unknown): unknown }>;
export type OutputPublication = Readonly<{
  evaluate(envelope: unknown, evidence?: unknown, signal?: AbortSignal): PublicationDenial;
}>;
type Evaluate = OutputPublication["evaluate"];
const owned = new WeakMap<object, Evaluate>();
function safeDenial(): PublicationDenial {
  return Object.freeze({ accepted: false, publicationAuthority: false, executionAuthority: false,
    reasonCode: "PUBLICATION_NOT_AUTHORIZED", correlationId: randomUUID() });
}

// No sink/queue/payload/sequence/repository callbacks are accepted. In particular, R5's supplied
// metadata eligibility cannot substitute for independently authenticated current host state.
// Its deeper predicates remain NOT_EVALUATED here while actual PI08 authentication denies.
export function createOutputPublicationBoundary(authentication: PublicationAuthentication = createHostPrincipalBoundary().api) {
  let closed = false, generation = 1;
  const audits = new WeakMap<object, PublicationAudit>();
  const deny = (reason: Reason): PublicationDenial => {
    const denial = safeDenial();
    audits.set(denial, Object.freeze({ correlationId: denial.correlationId, reason, boundaryGeneration: generation,
      workspace: "NOT_EVALUATED", repository: "NOT_EVALUATED", outputContract: "NOT_EVALUATED",
      ownership: "NOT_EVALUATED", destination: "NOT_EVALUATED", confidentiality: "NOT_EVALUATED", sequence: "NOT_EVALUATED",
      publicationAuthority: false, executionAuthority: false }));
    return denial;
  };
  const evaluate: Evaluate = (_envelope, evidence, signal) => {
    const started = generation;
    try {
      if (closed) return deny("PUBLICATION_CLOSED");
      if (signal?.aborted) return deny("OUTPUT_CANCELLED");
      const result = authentication.authenticate(evidence);
      if (closed) return deny("PUBLICATION_CLOSED");
      if (generation !== started) return deny("PUBLICATION_INVALIDATED");
      if (signal?.aborted) return deny("OUTPUT_CANCELLED");
      if (typeof result === "object" && result !== null && "status" in result && result.status === "AUTHENTICATION_DENIED") {
        const reason = "reason" in result ? result.reason : undefined;
        return deny(reason === "IDENTITY_EVIDENCE_MISSING" ? "PUBLICATION_AUTHENTICATION_REQUIRED" :
          reason === "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" ? "PUBLICATION_AUTHORITY_UNAVAILABLE" :
          reason === "HOST_AUTHENTICATION_CLOSED" ? "HOST_CONTEXT_INVALID" : "PUBLICATION_NOT_AUTHORIZED");
      }
      return deny("PUBLICATION_NOT_AUTHORIZED"); // Even an unexpected positive dependency result denies.
    } catch { return deny(closed ? "PUBLICATION_CLOSED" : "PUBLICATION_DEPENDENCY_UNAVAILABLE"); }
  };
  const api: OutputPublication = Object.freeze({ evaluate }); owned.set(api, evaluate);
  return Object.freeze({ api,
    inspectDenial(input: unknown): PublicationAudit | null {
      return typeof input === "object" && input !== null ? audits.get(input) ?? null : null;
    },
    invalidate() { if (!closed) { if (generation === Number.MAX_SAFE_INTEGER) closed = true; else generation++; } },
    close() { closed = true; },
  });
}

// Never invoke a caller-shaped evaluate callback. Denial is a value, not a thrown payload,
// so fixture lifecycle completion and safety-control acknowledgment remain independent.
export function denyOutputPublication(boundary: unknown, envelope: unknown, evidence?: unknown): PublicationDenial {
  const evaluate = typeof boundary === "object" && boundary !== null ? owned.get(boundary) : undefined;
  return evaluate ? evaluate(envelope, evidence) : safeDenial();
}
