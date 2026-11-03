import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { fixture, readWorkspace, session, type Fixture } from "./helpers.js";

async function launch(dataRoot: string) {
  const child = fork(fileURLToPath(new URL("../../../src/server/index.ts", import.meta.url)), [], {
    execArgv: ["--import", "tsx"], silent: true,
    env: { ...process.env, AI_OFFICE_DATA_ROOT: dataRoot, AI_OFFICE_PORT: "0" },
  });
  let stderr = "";
  child.stderr?.on("data", (chunk) => { stderr += String(chunk); });
  child.stdout?.resume(); // No secret echo from IPC test startup.
  const exited = new Promise<number | null>((resolve) => child.once("exit", resolve));
  const info = await new Promise<{ url: string; bootstrapToken: string }>((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error("Owned test backend startup timed out")); }, 10_000);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error(`Backend startup failed: ${stderr}`)); });
    child.once("message", (message) => {
      clearTimeout(timer);
      const parsed = z.strictObject({ type: z.literal("started"), url: z.url(), bootstrapToken: z.string().length(64) }).safeParse(message);
      if (!parsed.success) { child.kill(); reject(new Error("Invalid backend startup envelope")); }
      else resolve(parsed.data);
    });
  });
  let stopped = false;
  return { ...info, pid: child.pid,
    async close() {
      if (stopped) return;
      stopped = true;
      child.send("shutdown");
      const timer = setTimeout(() => child.kill(), 10_000); // Only this test's child.
      try { expect(await exited).toBe(0); expect(stderr).toBe(""); }
      finally { clearTimeout(timer); }
    },
  };
}

describe("actual separate backend process restart", () => {
  let f: Fixture;
  const children: Awaited<ReturnType<typeof launch>>[] = [];
  beforeEach(async () => { f = await fixture(); });
  afterEach(async () => { for (const child of children.toReversed()) await child.close(); children.length = 0; await f.cleanup(); });

  it("persists identity, rotates session/binding and cleanly stops both owned processes", async () => {
    const first = await launch(f.dataRoot); children.push(first);
    const headers = await session(first);
    const post = (url: string, route: string, body: unknown, auth = headers) => fetch(url + route, { method: "POST", headers: auth, body: JSON.stringify(body) });
    const pending = await readWorkspace(await post(first.url, "/api/workspace/open", { path: f.a, expectedGeneration: 0 }));
    const attached = await readWorkspace(await post(first.url, "/api/workspace/initialize", { path: pending.nextAction!.canonicalPath,
      expectedGeneration: pending.view.generation, consent: true, consentToken: pending.nextAction!.consentToken }));
    expect(attached.view.state).toBe("LOADING");
    if (attached.view.state !== "LOADING" || !attached.identity) throw new Error("Missing attached identity");
    const oldBinding = attached.view.binding;
    await first.close();
    expect(await readdir(f.dataRoot)).not.toContain("writer.lock");
    await expect(fetch(first.url + "/api/health")).rejects.toThrow();
    const second = await launch(f.dataRoot); children.push(second);
    expect(second.pid).not.toBe(first.pid);
    expect(second.bootstrapToken).not.toBe(first.bootstrapToken);
    expect((await fetch(second.url + "/api/workspace", { headers })).status).toBe(403);
    const nextHeaders = await session(second);
    const before = await readWorkspace(await fetch(second.url + "/api/workspace", { headers: nextHeaders }));
    expect(before.view.state).toBe("DETACHED");
    const reopened = await readWorkspace(await post(second.url, "/api/workspace/open", { path: f.a, expectedGeneration: 0 }, nextHeaders));
    expect(reopened.identity).toEqual(attached.identity);
    if (reopened.view.state !== "LOADING") throw new Error("Expected identity LOADING");
    expect(reopened.view.binding.bindingId).not.toBe(oldBinding.bindingId);
    const stale = await post(second.url, "/api/workspace/inspect", { projectId: attached.identity.projectId, binding: oldBinding }, nextHeaders);
    expect(stale.status).toBe(409); expect(await stale.json()).toMatchObject({ error: { code: "STALE_BINDING" } });
    await second.close();
    expect(await readdir(f.dataRoot)).not.toContain("writer.lock");
    await expect(fetch(second.url + "/api/health")).rejects.toThrow();
  }, 30_000);
});
