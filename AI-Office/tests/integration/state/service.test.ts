import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fixture, initialize } from "../workspace/helpers.js";
import { ProjectSnapshotSchema } from "../../../src/contracts/index.js";
import { ProjectStateService } from "../../../src/server/state/service.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { stateFixture, initialized, seeded, scope, dbPath, type StateFixture } from "./helpers.js";

describe("project-scoped state and DEMO persistence", () => {
  let f: StateFixture;
  beforeEach(async () => { f = await stateFixture(); });
  afterEach(async () => { await f.cleanup(); });

  it("requires explicit first-time consent and never seeds on open/poll", async () => {
    const { manager } = await f.stateStart();
    const identity = await initialize(manager, f.a);
    expect(identity.view.state).toBe("LOADING"); expect(identity.stateInitializationRequired).toBe(true);
    expect(await readdir(f.dataRoot)).not.toContain("projects");
    await manager.current(); expect(await readdir(f.dataRoot)).not.toContain("projects");
    expect(() => manager.initializeState({ scope: scope(identity), consent: false })).toThrow();
    const ready = await manager.initializeState({ scope: scope(identity), consent: true });
    expect(ready.view.state).toBe("READY"); expect(ready.identity).toEqual(identity.identity);
    const result = await manager.projectSnapshot(scope(ready));
    expect(ProjectSnapshotSchema.safeParse(result.snapshot).success).toBe(true);
    expect(result.snapshot.tasks).toEqual([]); expect(result.snapshot.events).toEqual([]); expect(result.snapshot.knowledge).toEqual([]);
    const again = await manager.initializeState({ scope: scope(ready), consent: true });
    expect(again.view).toEqual(ready.view);
    expect((await manager.projectSnapshot(scope(again))).snapshot.snapshotVersion).toBe(1);
  });

  it("keeps colliding record IDs separate for A/B and rejects stale and forged scopes", async () => {
    const { manager } = await f.stateStart();
    const a = await seeded(manager, f.a, "A_ONLY");
    expect((await manager.knowledge({ scope: a.owner, knowledgeId: "knowledge:fixture", version: 1 })).content).toBe("A_ONLY");
    const b = await seeded(manager, f.b, "B_ONLY");
    expect(b.owner.projectId).not.toBe(a.owner.projectId);
    expect(dbPath(f, a.owner.projectId)).not.toBe(dbPath(f, b.owner.projectId));
    expect(a.snapshot.tasks[0]?.taskId).toBe(b.snapshot.tasks[0]?.taskId);
    expect(JSON.stringify(b.snapshot)).not.toContain(a.owner.projectId);
    expect(JSON.stringify(b.snapshot)).not.toContain("A_ONLY");
    expect((await manager.knowledge({ scope: b.owner, knowledgeId: "knowledge:fixture", version: 1 })).content).toBe("B_ONLY");
    await expect(manager.projectSnapshot(a.owner)).rejects.toMatchObject({ code: "STALE_BINDING" });
    await expect(manager.knowledge({ scope: a.owner, knowledgeId: "knowledge:fixture", version: 1 })).rejects.toMatchObject({ code: "STALE_BINDING" });
    const wrong = { projectId: a.owner.projectId, binding: { ...b.owner.binding, projectId: a.owner.projectId } };
    await expect(manager.projectSnapshot(wrong)).rejects.toMatchObject({ code: "SCOPE_MISMATCH" });
    const reopened = await manager.open({ path: f.a.toUpperCase(), expectedGeneration: b.ready.view.generation });
    expect(reopened.identity?.projectId).toBe(a.owner.projectId); expect(reopened.view.state).toBe("READY");
    expect((await manager.projectSnapshot(scope(reopened))).snapshot.tasks).toEqual(a.snapshot.tasks);
  });

  it("persists idempotent DEMO records and historical timestamps without invented activity", async () => {
    const { manager } = await f.stateStart(); const a = await seeded(manager, f.a, "A_ONLY");
    const repeated = await manager.seedDemo({ scope: a.owner, fixture: a.seed });
    expect(repeated.snapshotVersion).toBe(a.snapshot.snapshotVersion);
    expect(repeated.events).toEqual(a.snapshot.events); expect(repeated.tasks).toEqual(a.snapshot.tasks);
    const polled = (await manager.projectSnapshot(a.owner)).snapshot;
    expect(polled.freshness.status).toBe("fresh"); expect(polled.source).toBe("demo");
    expect(polled.events[0]?.occurredAt).toBe("2026-10-28T12:00:00.000Z");
    expect(polled.tasks[0]?.state).toBe("IDLE"); expect(polled.events).toHaveLength(1);
    await expect(manager.seedDemo({ scope: a.owner, fixture: { ...a.seed, task: { ...a.seed.task, source: "real" } } })).rejects.toThrow();
    await expect(manager.seedDemo({ scope: a.owner, fixture: { ...a.seed, task: { ...a.seed.task, command: "execute" } } })).rejects.toThrow();
    await expect(manager.seedDemo({ scope: a.owner, fixture: { ...a.seed, task: { ...a.seed.task, title: "changed" } } })).rejects.toMatchObject({ reason: "DEMO_SEED_CONFLICT" });
    expect((await manager.projectSnapshot(a.owner)).snapshot.events).toEqual(a.snapshot.events);
  });

  it("detach revokes reads, closes handles and preserves database bytes", async () => {
    const { manager } = await f.stateStart(); const a = await seeded(manager, f.a, "A_ONLY");
    const before = await readFile(dbPath(f, a.owner.projectId));
    await manager.detach({ expectedGeneration: a.ready.view.generation, scope: a.owner });
    await expect(manager.projectSnapshot(a.owner)).rejects.toMatchObject({ code: "STALE_BINDING" });
    expect(await readFile(dbPath(f, a.owner.projectId))).toEqual(before);
    const db = new DatabaseSync(dbPath(f, a.owner.projectId));
    try { db.exec("BEGIN EXCLUSIVE; ROLLBACK"); } finally { db.close(); }
  });

  it("rolls back all DEMO inserts when an injected failure follows task insert", async () => {
    let fail = true;
    const { manager } = await f.stateStart({ fault: (stage) => { if (stage === "afterDemoTask" && fail) throw new Error("fixture failure"); } });
    const ready = await initialized(manager, f.a); const owner = scope(ready);
    const { markdown } = await import("./helpers.js"); const { demoFixture } = await import("../../../src/demo/fixture.js");
    await markdown(f.a, "A_ONLY"); const seed = demoFixture(owner.projectId, "A_ONLY", "A_ONLY");
    await expect(manager.seedDemo({ scope: owner, fixture: seed })).rejects.toMatchObject({ code: "DATABASE_UNAVAILABLE" });
    const empty = (await manager.projectSnapshot(owner)).snapshot;
    expect(empty.tasks).toEqual([]); expect(empty.knowledge).toEqual([]); expect(empty.events).toEqual([]); expect(empty.snapshotVersion).toBe(1);
    fail = false;
    expect((await manager.seedDemo({ scope: owner, fixture: seed })).events).toHaveLength(1);
  });

  it("does not accept a caller-shaped context as state authorization", async () => {
    const registry = await ProjectRegistry.acquire(f.dataRoot);
    try {
      const service = await ProjectStateService.forFixtures(registry, f.root);
      await expect(service.snapshot({} as never)).rejects.toMatchObject({ reason: "STATE_CONTEXT_NOT_ISSUED_OR_REVOKED" });
    } finally { await registry.close(); }
    expect(await readdir(f.a)).toEqual([]);
  });

  it("never changes the marker or registry during state initialization", async () => {
    const { manager } = await f.stateStart(); const identity = await initialize(manager, f.a);
    const marker = path.join(f.a, ".ai-office/project.json"), registry = path.join(f.dataRoot, "registry.json");
    const beforeMarker = await readFile(marker), beforeRegistry = await readFile(registry);
    await manager.initializeState({ scope: scope(identity), consent: true });
    expect(await readFile(marker)).toEqual(beforeMarker); expect(await readFile(registry)).toEqual(beforeRegistry);
  });

  it("rejects a folder outside the configured fixture boundary before offering metadata writes", async () => {
    const other = await fixture();
    try {
      const { manager } = await f.stateStart();
      await expect(manager.open({ path: other.a, expectedGeneration: 0 })).rejects.toMatchObject({ reason: "DISPOSABLE_PROJECT_BOUNDARY_REQUIRED" });
      expect(await readdir(other.a)).toEqual([]);
      expect((await manager.current()).nextAction).toBeNull();
    } finally { await other.cleanup(); }
  });
});
