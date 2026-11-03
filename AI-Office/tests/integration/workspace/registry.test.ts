import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { chmod, copyFile, mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { startBackend } from "../../../src/server/index.js";
import { fixture, initialize, type Fixture } from "./helpers.js";

describe("registry integrity and interrupted initialization", () => {
  let f: Fixture;
  beforeEach(async () => { f = await fixture(); });
  afterEach(async () => { await f.cleanup(); });

  it("rejects a second writer and preserves a stale crash lock for review", async () => {
    const backend = await f.start();
    await expect(startBackend({ dataRoot: f.dataRoot, port: 0 })).rejects.toMatchObject({ reason: "WRITER_LOCK_REVIEW_REQUIRED" });
    await backend.close();
    await writeFile(path.join(f.dataRoot, "writer.lock"), "stale fixture lock");
    await expect(f.start()).rejects.toMatchObject({ reason: "WRITER_LOCK_REVIEW_REQUIRED" });
    expect(await readFile(path.join(f.dataRoot, "writer.lock"), "utf8")).toBe("stale fixture lock");
  });

  it("does not reset a corrupted registry on startup", async () => {
    await mkdir(f.dataRoot); await writeFile(path.join(f.dataRoot, "registry.json"), "{broken");
    await expect(f.start()).rejects.toMatchObject({ reason: "CORRUPT_REGISTRY_REVIEW_REQUIRED" });
    expect(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).toBe("{broken");
    expect(await readdir(f.dataRoot)).toEqual(["registry.json"]);
  });

  it("detects external registry corruption/deletion before overwriting", async () => {
    const { manager } = await f.start(); await initialize(manager, f.a);
    const filename = path.join(f.dataRoot, "registry.json");
    await writeFile(filename, "corrupted by fixture");
    await expect(manager.current()).rejects.toMatchObject({ reason: "REGISTRY_CHANGED_EXTERNALLY" });
    expect(await readFile(filename, "utf8")).toBe("corrupted by fixture");
  });

  it("rejects deletion of a previously known registry", async () => {
    const { manager } = await f.start(); await initialize(manager, f.a);
    await unlink(path.join(f.dataRoot, "registry.json"));
    await expect(manager.current()).rejects.toMatchObject({ reason: "REGISTRY_CHANGED_EXTERNALLY" });
    expect(await readdir(f.dataRoot)).toEqual(["registry.initialized", "writer.lock"]);
  });

  it("detects a missing registry across restart instead of silently starting fresh", async () => {
    const backend = await f.start(); await initialize(backend.manager, f.a);
    await backend.close(); await unlink(path.join(f.dataRoot, "registry.json"));
    await expect(f.start()).rejects.toMatchObject({ reason: "REGISTRY_MISSING_OR_INCOMPLETE_REVIEW_REQUIRED" });
    expect(await readdir(f.dataRoot)).toEqual(["registry.initialized"]);
  });

  it("rejects corrupt marker without replacing existing bytes", async () => {
    await mkdir(path.join(f.a, ".ai-office"));
    const filename = path.join(f.a, ".ai-office/project.json"); await writeFile(filename, "{broken");
    const { manager } = await f.start();
    await expect(manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ reason: "CORRUPT_OR_UNSUPPORTED_MARKER" });
    expect(await readFile(filename, "utf8")).toBe("{broken");
  });

  it("rejects marker/registry mismatch and missing registered marker", async () => {
    const { manager } = await f.start(); const a = await initialize(manager, f.a);
    const filename = path.join(f.a, ".ai-office/project.json");
    await writeFile(filename, JSON.stringify({ ...a.identity, projectId: randomUUID() }));
    await expect(manager.open({ path: f.a, expectedGeneration: a.view.generation })).rejects.toMatchObject({ reason: "MARKER_REGISTRY_MISMATCH" });
    await unlink(filename);
    await expect(manager.open({ path: f.a, expectedGeneration: a.view.generation + 1 })).rejects.toMatchObject({ reason: "REGISTERED_MARKER_MISSING" });
  });

  it("rejects duplicate project UUID on a different root", async () => {
    const { manager } = await f.start(); const a = await initialize(manager, f.a);
    await mkdir(path.join(f.b, ".ai-office"));
    await copyFile(path.join(f.a, ".ai-office/project.json"), path.join(f.b, ".ai-office/project.json"));
    await expect(manager.open({ path: f.b, expectedGeneration: a.view.generation })).rejects.toMatchObject({ reason: "DUPLICATE_ID_OR_RELINK_REQUIRED" });
    expect(JSON.parse(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).entries).toHaveLength(1);
  });

  it("requires confirmation before registering an existing unknown marker", async () => {
    await mkdir(path.join(f.a, ".ai-office"));
    const identity = { schemaVersion: 1, projectId: randomUUID(), createdAt: new Date().toISOString() };
    const marker = JSON.stringify(identity); await writeFile(path.join(f.a, ".ai-office/project.json"), marker);
    const { manager } = await f.start();
    const pending = await manager.open({ path: f.a, expectedGeneration: 0 });
    expect(pending.nextAction?.kind).toBe("REGISTRATION_REQUIRED");
    expect(await readdir(f.dataRoot)).toEqual(["writer.lock"]);
    const result = await manager.initialize({ path: f.a, expectedGeneration: 1, consent: true, consentToken: pending.nextAction!.consentToken });
    expect(result.identity).toEqual(identity);
    expect(await readFile(path.join(f.a, ".ai-office/project.json"), "utf8")).toBe(marker);
  });

  it("preserves PREPARING identity after failure before marker; requires human review", async () => {
    const backend = await f.start((stage) => { if (stage === "afterPreparing") throw new Error("injected crash boundary"); });
    await expect(initialize(backend.manager, f.a)).rejects.toMatchObject({ code: "STATE_UNAVAILABLE" });
    const before = await readFile(path.join(f.dataRoot, "registry.json"), "utf8");
    expect(JSON.parse(before).entries[0].status).toBe("PREPARING");
    expect(await readdir(f.a)).toEqual([]);
    await backend.close();
    const restarted = await f.start();
    await expect(restarted.manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ reason: "PARTIAL_INITIALIZATION_REVIEW_REQUIRED" });
    expect(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).toBe(before);
  });

  it("recovers matching PREPARING marker after explicit consent with the same UUID", async () => {
    const backend = await f.start((stage) => { if (stage === "afterMarker") throw new Error("injected crash boundary"); });
    await expect(initialize(backend.manager, f.a)).rejects.toMatchObject({ code: "STATE_UNAVAILABLE" });
    const marker = await readFile(path.join(f.a, ".ai-office/project.json"), "utf8");
    await backend.close();
    const restarted = await f.start();
    const pending = await restarted.manager.open({ path: f.a, expectedGeneration: 0 });
    expect(pending.nextAction?.kind).toBe("RECOVERY_REQUIRED");
    const result = await restarted.manager.initialize({ path: f.a, expectedGeneration: 1, consent: true, consentToken: pending.nextAction!.consentToken });
    expect(result.identity).toEqual(JSON.parse(marker));
    expect(await readFile(path.join(f.a, ".ai-office/project.json"), "utf8")).toBe(marker);
    const registry = JSON.parse(await readFile(path.join(f.dataRoot, "registry.json"), "utf8"));
    expect(registry.entries).toHaveLength(1); expect(registry.entries[0].status).toBe("IDENTITY_ATTACHED");
  });

  it("preserves an existing marker if another initializer wins after PREPARING", async () => {
    const winner = JSON.stringify({ schemaVersion: 1, projectId: randomUUID(), createdAt: new Date().toISOString() });
    const backend = await f.start(async (stage) => {
      if (stage === "afterPreparing") {
        await mkdir(path.join(f.a, ".ai-office"));
        await writeFile(path.join(f.a, ".ai-office/project.json"), winner, { flag: "wx" });
      }
    });
    await expect(initialize(backend.manager, f.a)).rejects.toMatchObject({ code: "STATE_UNAVAILABLE" });
    expect(await readFile(path.join(f.a, ".ai-office/project.json"), "utf8")).toBe(winner);
  });

  it("keeps original registry and temp evidence on injected atomic replacement failure", async () => {
    let fail = false;
    const backend = await f.start((stage) => {
      if (fail && stage === "beforeRegistryRename") throw Object.assign(new Error("fixture rename denial"), { code: "EPERM" });
    });
    const a = await initialize(backend.manager, f.a);
    const original = await readFile(path.join(f.dataRoot, "registry.json"), "utf8"); fail = true;
    await expect(backend.manager.open({ path: f.a, expectedGeneration: a.view.generation })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).toBe(original);
    expect((await readdir(f.dataRoot)).some((name) => name.endsWith(".tmp"))).toBe(true);
    await backend.close();
    await expect(f.start()).rejects.toMatchObject({ reason: "INTERRUPTED_REGISTRY_WRITE_REVIEW_REQUIRED" });
  });

  it("handles real Windows read-only registry replacement failure without unlink fallback", async () => {
    const backend = await f.start(); const a = await initialize(backend.manager, f.a);
    const filename = path.join(f.dataRoot, "registry.json"); const original = await readFile(filename, "utf8");
    await chmod(filename, 0o444);
    try {
      await expect(backend.manager.open({ path: f.a, expectedGeneration: a.view.generation })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      expect(await readFile(filename, "utf8")).toBe(original);
    } finally { await chmod(filename, 0o600); }
  });
});
