import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { session } from "../workspace/helpers.js";
import { demoFixture } from "../../../src/demo/fixture.js";
import { ProjectSnapshotSchema } from "../../../src/contracts/index.js";
import { stateFixture, markdown, StateViewSchema, SnapshotResponseSchema, dbPath, type StateFixture } from "./helpers.js";

async function launch(f: StateFixture) {
  const child = fork(fileURLToPath(new URL("../../../src/server/index.ts", import.meta.url)), [], {
    execArgv: ["--import", "tsx"], silent: true,
    env: { ...process.env, AI_OFFICE_DATA_ROOT: f.dataRoot, AI_OFFICE_PORT: "0", AI_OFFICE_FIXTURE_ROOT: f.root, AI_OFFICE_DEMO_HTTP: "1" },
  });
  let stderr = ""; child.stderr?.on("data", (chunk) => { stderr += String(chunk); }); child.stdout?.resume();
  const exited = new Promise<number | null>((resolve) => child.once("exit", resolve));
  const info = await new Promise<{ url: string; bootstrapToken: string }>((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error("Owned state backend startup timed out")); }, 10_000);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error(`Backend startup failed: ${stderr}`)); });
    child.once("message", (message) => {
      clearTimeout(timer);
      const parsed = z.strictObject({ type: z.literal("started"), url: z.url(), bootstrapToken: z.string().length(64) }).safeParse(message);
      if (parsed.success) resolve(parsed.data); else { child.kill(); reject(new Error("Invalid startup envelope")); }
    });
  });
  const headers = await session(info);
  let stopped = false;
  return { ...info, pid: child.pid, headers,
    async post(route: string, body: unknown) {
      return fetch(info.url + route, { method: "POST", headers, body: JSON.stringify(body) });
    },
    async view() { return StateViewSchema.parse(await (await fetch(info.url + "/api/workspace", { headers })).json()); },
    async close() {
      if (stopped) return; stopped = true; child.send("shutdown");
      const timer = setTimeout(() => child.kill(), 10_000);
      try { expect(await exited).toBe(0); expect(stderr).toBe(""); }
      finally { clearTimeout(timer); }
    },
  };
}

describe("actual backend state restart", () => {
  let f: StateFixture;
  const children: Awaited<ReturnType<typeof launch>>[] = [];
  beforeEach(async () => { f = await stateFixture(); });
  afterEach(async () => { for (const child of children.toReversed()) await child.close(); children.length = 0; await f.cleanup(); });

  it("persists A/B state across new OS process, no seed on reopen, old bindings denied", async () => {
    const first = await launch(f); children.push(first);
    const setup = async (folder: string, text: string) => {
      const current = await first.view();
      const opened = StateViewSchema.parse(await (await first.post("/api/workspace/open", { path: folder, expectedGeneration: current.view.generation })).json());
      const identity = StateViewSchema.parse(await (await first.post("/api/workspace/initialize", { path: opened.nextAction!.canonicalPath,
        consent: true, consentToken: opened.nextAction!.consentToken, expectedGeneration: opened.view.generation })).json());
      expect(identity.view.state).toBe("LOADING"); expect(identity.stateInitializationRequired).toBe(true);
      if (identity.view.state !== "LOADING" || !identity.identity) throw new Error("Expected identity binding");
      const owner = { projectId: identity.identity.projectId, binding: identity.view.binding };
      const ready = StateViewSchema.parse(await (await first.post("/api/state/initialize", { scope: owner, consent: true })).json());
      expect(ready.view.state).toBe("READY");
      await markdown(folder, text);
      const seed = demoFixture(owner.projectId, text, text);
      const snapshot = ProjectSnapshotSchema.parse(await (await first.post("/api/dev/demo/initialize", { scope: owner, fixture: seed })).json());
      expect(snapshot.events).toHaveLength(1); return { owner, snapshot, seed };
    };
    const a = await setup(f.a, "A_ONLY"), b = await setup(f.b, "B_ONLY");
    await first.close(); expect(await readdir(f.dataRoot)).not.toContain("writer.lock");
    await expect(fetch(first.url + "/api/health")).rejects.toThrow();
    const originalA = await readFile(dbPath(f, a.owner.projectId)), originalB = await readFile(dbPath(f, b.owner.projectId));
    const second = await launch(f); children.push(second);
    expect(second.pid).not.toBe(first.pid);
    expect((await fetch(second.url + "/api/workspace", { headers: first.headers })).status).toBe(403);
    expect((await second.view()).view.state).toBe("DETACHED");
    for (const [folder, original, text] of [[f.a, a, "A_ONLY"], [f.b, b, "B_ONLY"]] as const) {
      const current = await second.view();
      const reopened = StateViewSchema.parse(await (await second.post("/api/workspace/open", { path: folder, expectedGeneration: current.view.generation })).json());
      expect(reopened.view.state).toBe("READY"); expect(reopened.identity?.projectId).toBe(original.owner.projectId);
      if (reopened.view.state !== "READY") throw new Error("Expected READY");
      const owner = { projectId: reopened.identity!.projectId, binding: reopened.view.binding };
      expect(owner.binding.bindingId).not.toBe(original.owner.binding.bindingId);
      const snapshot = SnapshotResponseSchema.parse(await (await second.post("/api/state/snapshot", owner)).json()).snapshot;
      expect(snapshot.tasks).toEqual(original.snapshot.tasks); expect(snapshot.events).toEqual(original.snapshot.events);
      expect(snapshot.knowledge).toEqual(original.snapshot.knowledge); expect(snapshot.snapshotVersion).toBe(original.snapshot.snapshotVersion);
      const knowledge = await second.post("/api/brain/read", { scope: owner, knowledgeId: "knowledge:fixture", version: 1 });
      expect(await knowledge.json()).toMatchObject({ content: text, integrity: "VERIFIED" });
      expect((await second.post("/api/state/snapshot", original.owner)).status).toBe(409);
    }
    await second.close(); expect(await readdir(f.dataRoot)).not.toContain("writer.lock");
    await expect(fetch(second.url + "/api/health")).rejects.toThrow();
    expect(await readFile(dbPath(f, a.owner.projectId))).toEqual(originalA);
    expect(await readFile(dbPath(f, b.owner.projectId))).toEqual(originalB);
  }, 30_000);
});
