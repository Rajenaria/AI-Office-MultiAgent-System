import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShellController } from "../../src/web/workspace/controller.js";
import { ApiFailure, WorkspaceResponseSchema } from "../../src/web/api.js";
import { deferred, fakeApi, PROJECT_A, PROJECT_B, ready, snapshot } from "./fixtures.js";

describe("ephemeral shell state and request ownership", () => {
  const controllers: ShellController[] = [];
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-29T00:00:00.000Z")); });
  afterEach(() => { for (const controller of controllers) controller.stop(); controllers.length = 0; vi.useRealTimers(); });
  function setup() { const api = fakeApi(); const controller = new ShellController(api); controllers.push(controller); return { api, controller }; }

  it("begins UNKNOWN, checks real transport availability and requires a session", async () => {
    const { controller } = setup(); expect(controller.getState().connection).toBe("UNKNOWN"); expect(controller.getState().freshness).toBe("unknown");
    await controller.checkHealth(); expect(controller.getState().connection).toBe("CONNECTED"); expect(controller.getState().sessionReady).toBe(false);
  });
  it("publishes READY only from the backend and loads its snapshot", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    expect(controller.getState().workspace?.view.state).toBe("READY"); expect(controller.getState().snapshot?.snapshot.projectId).toBe(PROJECT_A);
    expect(api.snapshot).toHaveBeenCalledOnce(); expect(controller.getState().lastSuccessAt).not.toBeNull();
  });
  it("clears A immediately and ignores a late A snapshot even if transport ignores abort", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    const delayed = deferred<ReturnType<typeof snapshot>>(); api.snapshot.mockImplementationOnce(() => delayed.promise);
    await vi.advanceTimersByTimeAsync(2000);
    const opened = controller.open("B fixture"); expect(controller.getState().snapshot).toBeNull(); expect(controller.getState().knowledge).toBeNull();
    await opened; expect(controller.getState().snapshot?.snapshot.projectId).toBe(PROJECT_B);
    delayed.resolve(snapshot(PROJECT_A)); await Promise.resolve(); await Promise.resolve();
    expect(controller.getState().snapshot?.snapshot.projectId).toBe(PROJECT_B);
    expect(api.open.mock.calls[0]?.[1]).toBe(1); // Backend generation, separate from UI epoch.
  });
  it("ignores late knowledge after switching and restores A through backend open", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    const delayed = deferred<Awaited<ReturnType<typeof api.knowledge>>>(); api.knowledge.mockImplementationOnce(() => delayed.promise);
    const read = controller.readKnowledge(snapshot().snapshot.knowledge[0]!);
    await controller.open("B fixture"); delayed.resolve({ metadata: snapshot().snapshot.knowledge[0]!, integrity: "CHANGED", effectiveStatus: "UNVERIFIED",
      actualHash: "b".repeat(64), content: null, contentType: "text/markdown", trustedAsInstructions: false });
    await read; expect(controller.getState().knowledge).toBeNull();
    api.open.mockResolvedValueOnce(ready(PROJECT_A)); await controller.open("A fixture"); expect(controller.getState().snapshot?.snapshot.projectId).toBe(PROJECT_A);
  });
  it("rejects mismatched snapshot bindings instead of displaying other data", async () => {
    const { api, controller } = setup(); api.snapshot.mockResolvedValueOnce(snapshot(PROJECT_B));
    await controller.connect("synthetic-test-input"); expect(controller.getState().snapshot).toBeNull();
    expect(controller.getState().error?.reason).toBe("RESPONSE_BINDING_MISMATCH");
  });
  it("failed B attach cannot retain A data or initialize a replacement automatically", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    api.open.mockRejectedValueOnce(new ApiFailure("TYPED", "PREVIOUS_STATE_MISSING", "DATABASE_UNAVAILABLE")); await controller.open("B fixture");
    expect(controller.getState().snapshot).toBeNull(); expect(controller.getState().workspace).toBeNull();
    expect(controller.getState().error?.code).toBe("DATABASE_UNAVAILABLE"); expect(api.initializeState).not.toHaveBeenCalled();
  });
  it("keeps metadata and state initialization as separate explicit commands", async () => {
    const { api, controller } = setup();
    const pending = WorkspaceResponseSchema.parse({ view: { state: "ERROR", generation: 1, error: { code: "STATE_UNAVAILABLE" } }, identity: null,
      nextAction: { kind: "INITIALIZATION_REQUIRED", consentToken: "a".repeat(64), canonicalPath: "C:\\fixture", expiresAt: "2026-10-29T01:00:00.000Z" },
      stateService: "AVAILABLE_FIXTURE_ONLY", stateInitializationRequired: false });
    api.open.mockResolvedValueOnce(pending); await controller.connect("synthetic-test-input"); await controller.open("fixture");
    expect(controller.getState().workspace?.nextAction?.kind).toBe("INITIALIZATION_REQUIRED");
    expect(api.initializeMetadata).not.toHaveBeenCalled(); expect(api.initializeState).not.toHaveBeenCalled();
    const a = ready(); if (!("binding" in a.view)) throw new Error("Binding required");
    const loading = WorkspaceResponseSchema.parse({ ...a, view: { state: "LOADING", generation: 1, binding: a.view.binding }, stateInitializationRequired: true });
    api.initializeMetadata.mockResolvedValueOnce(loading); await controller.initializeMetadata();
    expect(controller.getState().workspace?.view.state).toBe("LOADING"); expect(api.initializeState).not.toHaveBeenCalled();
    await controller.initializeState(); expect(controller.getState().workspace?.view.state).toBe("READY");
  });
  it("shows CHANGED/UNVERIFIED without promoting knowledge", async () => {
    const { controller } = setup(); await controller.connect("synthetic-test-input"); await controller.readKnowledge(snapshot().snapshot.knowledge[0]!);
    expect(controller.getState().knowledge?.integrity).toBe("CHANGED"); expect(controller.getState().knowledge?.effectiveStatus).toBe("UNVERIFIED");
    expect(controller.getState().knowledge?.content).toBeNull();
  });
  it("retains labelled last-known state and moves STALE to DISCONNECTED without replaying mutations", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    api.snapshot.mockRejectedValue(new ApiFailure("NETWORK", "BACKEND_UNAVAILABLE"));
    await vi.advanceTimersByTimeAsync(2000); expect(controller.getState().freshness).toBe("stale");
    await vi.advanceTimersByTimeAsync(4000); expect(controller.getState().freshness).toBe("disconnected");
    expect(controller.getState().snapshot?.snapshot.projectId).toBe(PROJECT_A); expect(api.open).not.toHaveBeenCalled();
    expect(api.initializeState).not.toHaveBeenCalled(); expect(api.initializeMetadata).not.toHaveBeenCalled();
  });
  it("stops polling on invalid session until an explicit new bootstrap", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input");
    api.snapshot.mockRejectedValueOnce(new ApiFailure("AUTH", "LOCAL_SESSION_REQUIRED"));
    await vi.advanceTimersByTimeAsync(2000); const count = api.snapshot.mock.calls.length;
    expect(controller.getState().connection).toBe("SESSION_INVALID"); expect(controller.getState().sessionReady).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000); expect(api.snapshot).toHaveBeenCalledTimes(count);
    await controller.connect("new-synthetic-test-input"); expect(controller.getState().sessionReady).toBe(true);
  });
  it("detach clears project content and stops polling", async () => {
    const { api, controller } = setup(); await controller.connect("synthetic-test-input"); await controller.detach();
    const count = api.snapshot.mock.calls.length; await vi.advanceTimersByTimeAsync(6000);
    expect(api.snapshot).toHaveBeenCalledTimes(count); expect(controller.getState().workspace?.view.state).toBe("DETACHED"); expect(controller.getState().snapshot).toBeNull();
  });
});
