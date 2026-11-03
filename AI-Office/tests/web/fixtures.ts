import { vi } from "vitest";
import { PROJECT_A, PROJECT_B, identityFixture, snapshotFixture } from "../contracts/fixtures.js";
import { SnapshotResponseSchema, WorkspaceResponseSchema, type Scope } from "../../src/web/api.js";
export { PROJECT_A, PROJECT_B };

export function ready(projectId = PROJECT_A) {
  return WorkspaceResponseSchema.parse({ view: { state: "READY", generation: projectId === PROJECT_A ? 1 : 2,
    binding: { bindingId: projectId === PROJECT_A ? "binding:a" : "binding:b", projectId, generation: projectId === PROJECT_A ? 1 : 2 }, identity: identityFixture(projectId) },
    identity: identityFixture(projectId), nextAction: null, stateService: "AVAILABLE_FIXTURE_ONLY", stateInitializationRequired: false });
}
export function snapshot(projectId = PROJECT_A) {
  const workspace = ready(projectId); if (!("binding" in workspace.view)) throw new Error("Fixture binding missing");
  return SnapshotResponseSchema.parse({ identity: identityFixture(projectId), knowledgeContentVerification: "NOT_PERFORMED",
    snapshot: { ...snapshotFixture(projectId), binding: workspace.view.binding } });
}
export function fakeApi() {
  return {
    health: vi.fn(async (_signal?: AbortSignal) => ({ status: "ok" as const, milestone: "M01-04", stateService: "AVAILABLE_FIXTURE_ONLY",
      policy: { workersEnabled: false as const, paidApiEnabled: false as const, providerConnectionsEnabled: false as const,
        skillExecutionEnabled: false as const, executionMode: "demo" as const, quotaStatus: "UNKNOWN" as const } })),
    bootstrap: vi.fn(async (_passphrase: string, _signal?: AbortSignal) => {}), clearSession: vi.fn(),
    current: vi.fn(async (_signal?: AbortSignal) => ready()),
    open: vi.fn(async (_path: string, _generation: number, _signal?: AbortSignal) => ready(PROJECT_B)),
    initializeMetadata: vi.fn(async (_workspace: ReturnType<typeof ready>, _signal?: AbortSignal) => ready()),
    initializeState: vi.fn(async (_workspace: ReturnType<typeof ready>, _signal?: AbortSignal) => ready()),
    detach: vi.fn(async (_workspace: ReturnType<typeof ready>, _signal?: AbortSignal) => WorkspaceResponseSchema.parse({ view: { state: "DETACHED", generation: 3 },
      identity: null, nextAction: null, stateService: "AVAILABLE_FIXTURE_ONLY", stateInitializationRequired: false })),
    snapshot: vi.fn(async (scope: Scope, _signal?: AbortSignal) => snapshot(scope.projectId)),
    knowledge: vi.fn(async (_scope: Scope, _record: ReturnType<typeof snapshot>["snapshot"]["knowledge"][number], _signal?: AbortSignal) => ({
      metadata: snapshot().snapshot.knowledge[0]!, integrity: "CHANGED" as const, effectiveStatus: "UNVERIFIED" as const,
      actualHash: "b".repeat(64), content: null, contentType: "text/markdown" as const, trustedAsInstructions: false as const,
    })),
  };
}
export function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
