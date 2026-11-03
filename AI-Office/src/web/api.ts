import { z } from "zod";
import { FoundationPolicySchema, KnowledgeVersionSchema, ProjectIdentitySchema, ProjectSnapshotSchema,
  WorkspaceViewStateSchema, WorkspaceErrorSchema, type WorkspaceBindingRef, type KnowledgeVersion } from "../contracts/index.js";

export const WorkspaceResponseSchema = z.strictObject({ view: WorkspaceViewStateSchema, identity: ProjectIdentitySchema.nullable(),
  nextAction: z.strictObject({ kind: z.enum(["INITIALIZATION_REQUIRED", "REGISTRATION_REQUIRED", "RECOVERY_REQUIRED"]),
    consentToken: z.string().regex(/^[a-f0-9]{64}$/), canonicalPath: z.string(), expiresAt: z.iso.datetime() }).nullable(),
  stateService: z.enum(["NOT_IMPLEMENTED", "AVAILABLE_FIXTURE_ONLY"]), stateInitializationRequired: z.boolean().optional(),
}).superRefine((result, context) => {
  if ("binding" in result.view && result.identity?.projectId !== result.view.binding.projectId) context.addIssue({ code: "custom", message: "Workspace identity mismatch" });
  if (result.view.state === "READY" && JSON.stringify(result.identity) !== JSON.stringify(result.view.identity)) context.addIssue({ code: "custom", message: "Ready identity mismatch" });
});
export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>;
export const SnapshotResponseSchema = z.strictObject({ identity: ProjectIdentitySchema, snapshot: ProjectSnapshotSchema,
  knowledgeContentVerification: z.literal("NOT_PERFORMED") }).refine((result) => result.identity.projectId === result.snapshot.projectId);
export type SnapshotResponse = z.infer<typeof SnapshotResponseSchema>;
export const KnowledgeResponseSchema = z.strictObject({ metadata: KnowledgeVersionSchema,
  integrity: z.enum(["VERIFIED", "CHANGED"]), effectiveStatus: KnowledgeVersionSchema.unwrap().shape.status,
  actualHash: z.string().regex(/^[a-f0-9]{64}$/), content: z.string().nullable(),
  contentType: z.literal("text/markdown"), trustedAsInstructions: z.literal(false),
}).refine((result) => result.integrity === "CHANGED" ? result.content === null && result.effectiveStatus === "UNVERIFIED" :
  result.content !== null && result.actualHash === result.metadata.contentHash && result.effectiveStatus === result.metadata.status);
export type KnowledgeResponse = z.infer<typeof KnowledgeResponseSchema>;
export type Scope = { projectId: string; binding: WorkspaceBindingRef };
export function boundScope(workspace: WorkspaceResponse): Scope {
  if (!("binding" in workspace.view) || !workspace.identity) throw new ApiFailure("INVALID_RESPONSE", "BOUND_WORKSPACE_REQUIRED");
  return { projectId: workspace.identity.projectId, binding: workspace.view.binding };
}
export function assertBinding(actual: WorkspaceBindingRef, expected: WorkspaceBindingRef): void {
  if (actual.bindingId !== expected.bindingId || actual.projectId !== expected.projectId || actual.generation !== expected.generation) {
    throw new ApiFailure("INVALID_RESPONSE", "RESPONSE_BINDING_MISMATCH");
  }
}

export class ApiFailure extends Error {
  constructor(readonly kind: "NETWORK" | "AUTH" | "TYPED" | "INVALID_RESPONSE", readonly reason: string,
    readonly code?: string) { super(reason); }
}
export async function capabilityHash(passphrase: string): Promise<string> {
  const bytes = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(passphrase));
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

export class ApiClient {
  private credentials: { sessionToken: string; csrfNonce: string } | null = null;
  private credentialEpoch = 0;
  clearSession() { this.credentials = null; this.credentialEpoch++; }

  private async request(route: string, method: "GET" | "POST", body?: unknown, signal?: AbortSignal, capability?: string): Promise<unknown> {
    if (signal?.aborted) throw new ApiFailure("NETWORK", "REQUEST_CANCELLED");
    const credentialEpoch = this.credentialEpoch;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (capability) headers.Authorization = `Bearer ${capability}`;
    else if (this.credentials) { headers["X-AI-Office-Session"] = this.credentials.sessionToken; headers["X-AI-Office-Nonce"] = this.credentials.csrfNonce; }
    let response: Response;
    try {
      response = await fetch(route, { method, headers, cache: "no-store", credentials: "omit", redirect: "error", referrerPolicy: "no-referrer",
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(5000)]) : AbortSignal.timeout(5000),
        ...(method === "POST" ? { body: JSON.stringify(body) } : {}) });
    } catch { throw new ApiFailure("NETWORK", "BACKEND_UNAVAILABLE"); }
    let json: unknown;
    try { json = await response.json(); }
    catch { throw new ApiFailure(response.status >= 500 ? "NETWORK" : "INVALID_RESPONSE", "BACKEND_RESPONSE_UNAVAILABLE"); }
    if (!response.ok) {
      const error = z.strictObject({ error: WorkspaceErrorSchema, reason: z.string().regex(/^[A-Z_]+$/) }).safeParse(json);
      if (!error.success) throw new ApiFailure("INVALID_RESPONSE", "INVALID_ERROR_RESPONSE");
      if (error.data.reason === "LOCAL_SESSION_REQUIRED") {
        if (credentialEpoch === this.credentialEpoch) this.clearSession();
        throw new ApiFailure("AUTH", "LOCAL_SESSION_REQUIRED", error.data.error.code);
      }
      throw new ApiFailure("TYPED", error.data.reason, error.data.error.code);
    }
    return json;
  }
  private parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new ApiFailure("INVALID_RESPONSE", "RESPONSE_CONTRACT_MISMATCH");
    return parsed.data;
  }
  async health(signal?: AbortSignal) {
    return this.parse(z.strictObject({ status: z.literal("ok"), milestone: z.string(), stateService: z.string(), policy: FoundationPolicySchema }),
      await this.request("/api/health", "GET", undefined, signal));
  }
  async bootstrap(passphrase: string, signal?: AbortSignal) {
    this.clearSession();
    const credentialEpoch = this.credentialEpoch;
    const capability = await capabilityHash(passphrase);
    if (credentialEpoch !== this.credentialEpoch || signal?.aborted) throw new ApiFailure("AUTH", "SESSION_REQUEST_SUPERSEDED");
    const credentials = this.parse(z.strictObject({ sessionToken: z.string().regex(/^[a-f0-9]{64}$/), csrfNonce: z.string().regex(/^[a-f0-9]{64}$/) }),
      await this.request("/api/session", "POST", {}, signal, capability));
    if (credentialEpoch !== this.credentialEpoch || signal?.aborted) throw new ApiFailure("AUTH", "SESSION_REQUEST_SUPERSEDED");
    this.credentials = credentials;
  }
  async current(signal?: AbortSignal) { return this.parse(WorkspaceResponseSchema, await this.request("/api/workspace", "GET", undefined, signal)); }
  async open(path: string, expectedGeneration: number, signal?: AbortSignal) {
    return this.parse(WorkspaceResponseSchema, await this.request("/api/workspace/open", "POST", { path, expectedGeneration }, signal));
  }
  async initializeMetadata(workspace: WorkspaceResponse, signal?: AbortSignal) {
    if (!workspace.nextAction) throw new ApiFailure("INVALID_RESPONSE", "INITIALIZATION_CHALLENGE_REQUIRED");
    return this.parse(WorkspaceResponseSchema, await this.request("/api/workspace/initialize", "POST", {
      path: workspace.nextAction.canonicalPath, consentToken: workspace.nextAction.consentToken, consent: true, expectedGeneration: workspace.view.generation,
    }, signal));
  }
  async initializeState(workspace: WorkspaceResponse, signal?: AbortSignal) {
    return this.parse(WorkspaceResponseSchema, await this.request("/api/state/initialize", "POST", { scope: boundScope(workspace), consent: true }, signal));
  }
  async detach(workspace: WorkspaceResponse, signal?: AbortSignal) {
    return this.parse(WorkspaceResponseSchema, await this.request("/api/workspace/detach", "POST", {
      expectedGeneration: workspace.view.generation, scope: "binding" in workspace.view ? boundScope(workspace) : null,
    }, signal));
  }
  async snapshot(scope: Scope, signal?: AbortSignal) {
    const response = this.parse(SnapshotResponseSchema, await this.request("/api/state/snapshot", "POST", scope, signal));
    assertBinding(response.snapshot.binding, scope.binding);
    if (response.identity.projectId !== scope.projectId) throw new ApiFailure("INVALID_RESPONSE", "SNAPSHOT_PROJECT_MISMATCH");
    return response;
  }
  async knowledge(scope: Scope, record: KnowledgeVersion, signal?: AbortSignal) {
    const response = this.parse(KnowledgeResponseSchema, await this.request("/api/brain/read", "POST", {
      scope, knowledgeId: record.knowledgeId, version: record.version,
    }, signal));
    if (response.metadata.projectId !== scope.projectId || response.metadata.knowledgeId !== record.knowledgeId || response.metadata.version !== record.version) {
      throw new ApiFailure("INVALID_RESPONSE", "KNOWLEDGE_PROJECT_OR_VERSION_MISMATCH");
    }
    return response;
  }
}
export type ShellApi = Pick<ApiClient, "health" | "bootstrap" | "clearSession" | "current" | "open" | "initializeMetadata" | "initializeState" | "detach" | "snapshot" | "knowledge">;
