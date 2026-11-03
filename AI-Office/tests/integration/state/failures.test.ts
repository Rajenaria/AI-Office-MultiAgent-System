import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { readFile, readdir, unlink, writeFile, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import { initialize } from "../workspace/helpers.js";
import { stateFixture, initialized, seeded, scope, dbPath, type StateFixture } from "./helpers.js";

describe("state failure never becomes new empty state", () => {
  let f: StateFixture;
  beforeEach(async () => { f = await stateFixture(); });
  afterEach(async () => { await f.cleanup(); });

  it.each(["missing", "corrupt", "unsupported", "wrong-header", "wrong-createdAt"])("rejects %s DB after restart without reset", async (failure) => {
    const first = await f.stateStart(); const ready = await initialized(first.manager, f.a);
    const owner = scope(ready); const filename = dbPath(f, owner.projectId);
    const marker = await readFile(path.join(f.a, ".ai-office/project.json")); await first.close();
    if (failure === "missing") await unlink(filename);
    else if (failure === "corrupt") await writeFile(filename, "not a sqlite database - fixture evidence");
    else {
      const db = new DatabaseSync(filename);
      try {
        if (failure === "unsupported") db.exec("PRAGMA user_version=2");
        else if (failure === "wrong-header") db.prepare("UPDATE project_header SET projectId=?").run(randomUUID());
        else db.prepare("UPDATE project_header SET createdAt=?").run("2025-01-01T00:00:00.000Z");
      } finally { db.close(); }
    }
    const before = failure === "missing" ? null : await readFile(filename);
    const restarted = await f.stateStart();
    const code = failure === "unsupported" ? "UNSUPPORTED_SCHEMA" : failure.startsWith("wrong") ? "IDENTITY_CONFLICT" : "DATABASE_UNAVAILABLE";
    await expect(restarted.manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code });
    const view = await restarted.manager.current(); expect(view.view.state).toBe("ERROR"); expect(view.identity).toBeNull();
    if (before) expect(await readFile(filename)).toEqual(before);
    else expect(await readdir(path.dirname(filename))).not.toContain("project.db");
    expect(await readFile(path.join(f.a, ".ai-office/project.json"))).toEqual(marker);
  });

  it.each(["afterStateIntent", "afterStateSchema"] as const)("retains interrupted initialization at %s for review", async (stageToFail) => {
    const backend = await f.stateStart({ fault: (stage) => { if (stage === stageToFail) throw new Error("fixture init failure"); } });
    const identity = await initialize(backend.manager, f.a); const owner = scope(identity);
    await expect(backend.manager.initializeState({ scope: owner, consent: true })).rejects.toThrow();
    const ledger = await readFile(path.join(f.dataRoot, "state-index.json"), "utf8");
    expect(JSON.parse(ledger).entries).toEqual([{ projectId: owner.projectId, phase: "PREPARING" }]);
    await backend.close(); const next = await f.stateStart();
    await expect(next.manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ reason: "STATE_INITIALIZATION_INTERRUPTED_REVIEW_REQUIRED" });
    expect(await readFile(path.join(f.dataRoot, "state-index.json"), "utf8")).toBe(ledger);
    expect(JSON.parse(await readFile(path.join(f.a, ".ai-office/project.json"), "utf8")).projectId).toBe(owner.projectId);
  });

  it.each(["missing", "corrupt"])("detects %s initialization ledger across restart", async (kind) => {
    const backend = await f.stateStart(); const a = await seeded(backend.manager, f.a, "A_ONLY"); await backend.close();
    const filename = path.join(f.dataRoot, "state-index.json"), beforeDB = await readFile(dbPath(f, a.owner.projectId));
    if (kind === "missing") await unlink(filename); else await writeFile(filename, "{broken");
    const next = await f.stateStart();
    await expect(next.manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code: "STATE_UNAVAILABLE" });
    expect(await readFile(dbPath(f, a.owner.projectId))).toEqual(beforeDB);
    if (kind === "corrupt") expect(await readFile(filename, "utf8")).toBe("{broken");
    else expect(await readdir(f.dataRoot)).not.toContain("state-index.json");
  });

  it("reports an actual exclusive SQLite lock and releases all reader handles", async () => {
    const { manager } = await f.stateStart(); const a = await seeded(manager, f.a, "A_ONLY");
    const lock = new DatabaseSync(dbPath(f, a.owner.projectId));
    try {
      lock.exec("BEGIN EXCLUSIVE");
      await expect(manager.projectSnapshot(a.owner)).rejects.toMatchObject({ code: "DATABASE_BUSY" });
      lock.exec("ROLLBACK");
    } finally { lock.close(); }
    expect((await manager.current()).view.state).toBe("ERROR");
    const reopened = await manager.open({ path: f.a, expectedGeneration: a.ready.view.generation });
    expect(reopened.view.state).toBe("READY");
    expect((await manager.projectSnapshot(scope(reopened))).snapshot.events).toEqual(a.snapshot.events);
  });

  it("rejects foreign records inserted with SQLite FK enforcement bypassed", async () => {
    const { manager } = await f.stateStart(); const a = await seeded(manager, f.a, "A_ONLY");
    const db = new DatabaseSync(dbPath(f, a.owner.projectId));
    try { db.exec("PRAGMA foreign_keys=OFF"); db.prepare("UPDATE knowledge SET projectId=?").run(randomUUID()); }
    finally { db.close(); }
    await expect(manager.projectSnapshot(a.owner)).rejects.toMatchObject({ reason: "STATE_INTEGRITY_CHECK_FAILED" });
    expect((await manager.current()).view.state).toBe("ERROR");
  });

  it("keeps DB-level event and version uniqueness and FK constraints", async () => {
    const { manager } = await f.stateStart(); const a = await seeded(manager, f.a, "A_ONLY");
    const db = new DatabaseSync(dbPath(f, a.owner.projectId));
    try {
      expect(() => db.exec("INSERT INTO events SELECT * FROM events")).toThrow();
      expect(() => db.exec("INSERT INTO knowledge SELECT * FROM knowledge")).toThrow();
      expect(() => db.prepare("UPDATE events SET taskId=?").run("task:absent")).toThrow();
    } finally { db.close(); }
    expect((await manager.projectSnapshot(a.owner)).snapshot.events).toHaveLength(1);
  });

  it("rejects private-storage junction escape before writing a database", async () => {
    const { manager } = await f.stateStart(); const identity = await initialize(manager, f.a);
    await symlink(f.b, path.join(f.dataRoot, "projects"), "junction");
    await expect(manager.initializeState({ scope: scope(identity), consent: true })).rejects.toThrow();
    expect(await readdir(f.b)).toEqual([]);
  });

  it("does not adopt or overwrite an orphan database", async () => {
    const { manager } = await f.stateStart(); const identity = await initialize(manager, f.a); const owner = scope(identity);
    const filename = dbPath(f, owner.projectId); await mkdir(path.dirname(filename), { recursive: true }); await writeFile(filename, "orphan evidence");
    await expect(manager.initializeState({ scope: owner, consent: true })).rejects.toMatchObject({ reason: "ORPHAN_STATE_REVIEW_REQUIRED" });
    expect(await readFile(filename, "utf8")).toBe("orphan evidence");
  });
});
