import { z } from "zod";
import { WorkspaceFailure } from "../workspace/errors.js";
import { denyReadiness } from "./execution-readiness.js";
import { provenanceDecision } from "./provenance.js";
import { sessionDecision, type SessionDecision } from "./host-session.js";

// Strategy C: no independently provisioned authority/protocol exists in this application.
// This configuration cannot install an issuer, verification key, callback or fixture fallback.
const ConfigurationSchema = z.strictObject({ mode: z.literal("UNPROVISIONED") });
export type HostPrincipalConfiguration = Readonly<z.infer<typeof ConfigurationSchema>>;
export type AuthenticationDenial = Readonly<{
  status: "AUTHENTICATION_DENIED";
  reason: "IDENTITY_EVIDENCE_MISSING" | "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" | "HOST_AUTHENTICATION_CLOSED";
  principal: null; context: null; executionAuthority: false;
  sourceClassification: "NOT_VERIFIED"; boundaryGeneration: number;
}>;
export type PrincipalSessionDenial = Readonly<SessionDecision & {
  authentication: AuthenticationDenial;
  workspaceAccess: "NOT_EVALUATED"; repositoryReadiness: "NOT_EVALUATED";
}>;
export type HostPrincipalVerification = Readonly<{
  authenticate(evidence?: unknown): AuthenticationDenial;
  assessSessionReadiness(scope: unknown, request: unknown, evidence?: unknown): PrincipalSessionDenial;
  inspect(): Readonly<{ strategy: "C"; status: "UNAVAILABLE" | "CLOSED"; boundaryGeneration: number;
    productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE"; executionAuthority: false }>;
}>;

// Only the host retains lifecycle controls. The public face cannot install trust or mint contexts.
// No evidence is parsed, logged, persisted, forwarded to PI04 or accepted as an authenticated subject.
// A future protocol-specific verifier needs an independently established source; this is not JWT/OIDC.
export function createHostPrincipalBoundary(input?: unknown) {
  try { ConfigurationSchema.parse(input === undefined ? { mode: "UNPROVISIONED" } : input); }
  catch { throw new WorkspaceFailure("ACCESS_DENIED", "UNSUPPORTED_HOST_IDENTITY_CONFIGURATION", 403); }
  let closed = false, generation = 1;
  const authenticate = (evidence?: unknown): AuthenticationDenial => Object.freeze({
    status: "AUTHENTICATION_DENIED", reason: closed ? "HOST_AUTHENTICATION_CLOSED" :
      evidence === undefined || evidence === null ? "IDENTITY_EVIDENCE_MISSING" : "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE",
    principal: null, context: null, sourceClassification: "NOT_VERIFIED", boundaryGeneration: generation,
    executionAuthority: false,
  });
  const api: HostPrincipalVerification = Object.freeze({
    authenticate,
    assessSessionReadiness: (_scope: unknown, _request: unknown, evidence?: unknown): PrincipalSessionDenial => {
      const authentication = authenticate(evidence);
      // Authentication failure short-circuits before workspace, connection acquisition or SQL.
      // The result reuses canonical PI02/03/04 denial contracts; it does not claim repository evaluation.
      return Object.freeze({ ...sessionDecision(provenanceDecision(denyReadiness(["PRINCIPAL_UNAVAILABLE"]),
        ["PROVENANCE_NOT_EVALUATED"]), ["SESSION_NOT_EVALUATED"]), authentication,
        workspaceAccess: "NOT_EVALUATED", repositoryReadiness: "NOT_EVALUATED" });
    },
    inspect: () => Object.freeze({ strategy: "C", status: closed ? "CLOSED" : "UNAVAILABLE",
      boundaryGeneration: generation, productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE", executionAuthority: false }),
  });
  return Object.freeze({ api,
    invalidate() { if (!closed) { if (generation === Number.MAX_SAFE_INTEGER) closed = true; else generation++; } },
    close() { closed = true; },
  });
}
