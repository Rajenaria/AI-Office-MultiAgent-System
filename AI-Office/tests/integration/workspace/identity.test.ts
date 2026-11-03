import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyFile, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { ProjectIdentitySchema, WorkspaceViewStateSchema } from "../../../src/contracts/index.js";
import { fixture, initialize, scopeOf, type Fixture } from "./helpers.js";

describe("Windows workspace identity and lifecycle", () => {
  let f: Fixture;
  beforeEach(async () => { f = await fixture(); });
  afterEach(async () => { await f.cleanup(); });

  it("does not write metadata on open; requires exact folder consent", async () => {
    const { manager } = await f.start();
    const pending = await manager.open({ path: f.a, expectedGeneration: 0 });
    expect(pending.nextAction?.kind).toBe("INITIALIZATION_REQUIRED");
    expect(await readdir(f.a)).toEqual([]);
    expect(await readdir(f.dataRoot)).toEqual(["writer.lock"]);
    await expect(manager.initialize({ path: f.b, expectedGeneration: 1, consent: true, consentToken: pending.nextAction!.consentToken }))
      .rejects.toMatchObject({ reason: "EXACT_FOLDER_CONSENT_REQUIRED" });
    expect(await readdir(f.b)).toEqual([]);
    await expect(manager.initialize({ path: f.a, expectedGeneration: 1, consent: false, consentToken: pending.nextAction!.consentToken })).rejects.toThrow();
    expect(await readdir(f.a)).toEqual([]);
  });

  it("preserves UUID through reopen/restart and rejects repeated init without new identity", async () => {
    const backend = await f.start();
    const first = await initialize(backend.manager, f.a);
    const markerPath = path.join(f.a, ".ai-office/project.json");
    const marker = await readFile(markerPath, "utf8");
    expect(ProjectIdentitySchema.parse(JSON.parse(marker))).toEqual(first.identity);
    expect(Object.keys(JSON.parse(marker))).toEqual(["schemaVersion", "projectId", "createdAt"]);
    expect(first.view.state).toBe("LOADING");
    expect(first.stateService).toBe("NOT_IMPLEMENTED");
    expect(WorkspaceViewStateSchema.safeParse(first.view).success).toBe(true);
    const second = await backend.manager.open({ path: f.a, expectedGeneration: first.view.generation });
    expect(second.identity).toEqual(first.identity);
    await expect(backend.manager.initialize({ path: f.a, expectedGeneration: second.view.generation, consent: true, consentToken: "a".repeat(64) })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await backend.close();
    const restarted = await f.start();
    expect((await restarted.manager.current()).view.state).toBe("DETACHED");
    const reopened = await restarted.manager.open({ path: f.a, expectedGeneration: 0 });
    expect(reopened.identity).toEqual(first.identity);
    expect(scopeOf(reopened).binding.bindingId).not.toBe(scopeOf(first).binding.bindingId);
    await expect(restarted.manager.inspect(scopeOf(first))).rejects.toMatchObject({ code: "STALE_BINDING" });
    expect(await readFile(markerPath, "utf8")).toBe(marker);
    expect(await readdir(f.a)).toEqual([".ai-office"]);
  });

  it("switches A/B with immutable ownership and rejects late, forged and cross-project scopes", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    const scopeA = scopeOf(a);
    const b = await initialize(manager, f.b);
    const scopeB = scopeOf(b);
    expect(a.identity?.projectId).not.toBe(b.identity?.projectId);
    expect(scopeA.binding.projectId).toBe(a.identity?.projectId);
    expect(Object.isFrozen(scopeA.binding)).toBe(true);
    await expect(manager.inspect(scopeA)).rejects.toMatchObject({ code: "STALE_BINDING" });
    await expect(manager.open({ path: f.a, expectedGeneration: a.view.generation })).rejects.toMatchObject({ code: "STALE_BINDING" });
    await expect(manager.inspect({ projectId: scopeA.projectId, binding: { ...scopeB.binding, projectId: scopeA.projectId } })).rejects.toMatchObject({ code: "SCOPE_MISMATCH" });
    await expect(manager.inspect({ ...scopeB, binding: { ...scopeB.binding, generation: 0 } })).rejects.toMatchObject({ code: "STALE_BINDING" });
    await expect(manager.inspect({ ...scopeB, binding: { ...scopeB.binding, bindingId: "forged" } })).rejects.toMatchObject({ code: "STALE_BINDING" });
    expect((await manager.current()).identity).toEqual(b.identity);
    expect((await manager.inspect(scopeB)).identity).toEqual(b.identity);
  });

  it("serializes competing switches and rejects the late generation", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    const requests = await Promise.allSettled([
      manager.open({ path: f.a, expectedGeneration: a.view.generation }),
      manager.open({ path: f.b, expectedGeneration: a.view.generation }),
    ]);
    expect(requests[0]?.status).toBe("fulfilled");
    expect(requests[1]).toMatchObject({ status: "rejected", reason: { code: "STALE_BINDING" } });
    expect((await manager.current()).identity).toEqual(a.identity);
  });

  it("failed switch invalidates A and never presents it as the new project", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    await expect(manager.open({ path: path.join(f.root, "missing"), expectedGeneration: a.view.generation })).rejects.toMatchObject({ code: "INVALID_ROOT" });
    const current = await manager.current();
    expect(current.view.state).toBe("ERROR"); expect(current.identity).toBeNull();
    expect("binding" in current.view).toBe(false);
    await expect(manager.inspect(scopeOf(a))).rejects.toMatchObject({ code: "STALE_BINDING" });
  });

  it("detach preserves all files and invalidates the binding", async () => {
    const { manager } = await f.start();
    await writeFile(path.join(f.a, "owner.txt"), "fixture content");
    const a = await initialize(manager, f.a);
    const before = await readFile(path.join(f.dataRoot, "registry.json"), "utf8");
    await expect(manager.detach({ expectedGeneration: a.view.generation, scope: null })).rejects.toThrow();
    const result = await manager.detach({ expectedGeneration: a.view.generation, scope: scopeOf(a) });
    expect(result.view.state).toBe("DETACHED"); expect(result.identity).toBeNull();
    expect(await readFile(path.join(f.a, "owner.txt"), "utf8")).toBe("fixture content");
    expect(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).toBe(before);
    await expect(manager.inspect(scopeOf(a))).rejects.toMatchObject({ code: "STALE_BINDING" });
  });

  it("missing/moved root after restart fails and new location requires relink review", async () => {
    const backend = await f.start();
    const a = await initialize(backend.manager, f.a);
    await backend.close();
    const moved = path.join(f.root, "Moved A"); await rename(f.a, moved);
    const restarted = await f.start();
    await expect(restarted.manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code: "INVALID_ROOT" });
    await expect(restarted.manager.open({ path: moved, expectedGeneration: 1 })).rejects.toMatchObject({ code: "IDENTITY_CONFLICT" });
    expect(JSON.parse(await readFile(path.join(moved, ".ai-office/project.json"), "utf8"))).toEqual(a.identity);
    expect((await restarted.manager.current()).identity).toBeNull();
  });

  it("rejects a replacement folder at the same path even with a copied marker", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    const moved = path.join(f.root, "Original A"); await rename(f.a, moved);
    await mkdir(f.a); await mkdir(path.join(f.a, ".ai-office"));
    await copyFile(path.join(moved, ".ai-office/project.json"), path.join(f.a, ".ai-office/project.json"));
    await expect(manager.inspect(scopeOf(a))).rejects.toMatchObject({ reason: "ROOT_REPLACED" });
    await expect(manager.open({ path: f.a, expectedGeneration: a.view.generation })).rejects.toMatchObject({ code: "IDENTITY_CONFLICT" });
    expect((await manager.current()).identity).toBeNull();
  });
});
