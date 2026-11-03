import { fork, type ChildProcess } from "node:child_process";
import { randomBytes, createHash } from "node:crypto";
import { mkdtemp, mkdir, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

const appRoot = fileURLToPath(new URL("../../", import.meta.url));
async function unusedPort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Port allocation failed");
  await new Promise<void>((resolve) => server.close(() => resolve())); return address.port;
}
export async function e2eFixture() {
  const parent = await realpath(tmpdir()); const root = await mkdtemp(path.join(parent, "ai-office-m0105-"));
  const a = path.join(root, "Project A 日本語"), b = path.join(root, "Project B"), dataRoot = path.join(root, "app-data");
  await mkdir(a); await mkdir(b);
  const backendPort = await unusedPort(); let webPort = await unusedPort(); while (webPort === backendPort) webPort = await unusedPort();
  return { root, a, b, dataRoot, backendPort, webPort,
    async cleanup() {
      const resolved = await realpath(root); const relative = path.relative(parent, resolved);
      if (resolved !== root || !relative || path.isAbsolute(relative) || relative.split(path.sep)[0] === ".." || !path.basename(resolved).startsWith("ai-office-m0105-")) throw new Error("Unsafe fixture cleanup target");
      await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } };
}
export type E2EFixture = Awaited<ReturnType<typeof e2eFixture>>;
export function waitMessage(child: ChildProcess, expected: string) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error("Owned launcher message timed out")); }, 20_000);
    const onExit = () => { cleanup(); reject(new Error("Owned launcher exited before readiness")); };
    const onMessage = (message: unknown) => {
      if (typeof message === "object" && message !== null && "type" in message && message.type === expected) { cleanup(); resolve(message as Record<string, unknown>); }
    };
    function cleanup() { clearTimeout(timer); child.off("exit", onExit); child.off("message", onMessage); }
    child.on("message", onMessage); child.once("exit", onExit);
  });
}
export async function launch(f: E2EFixture, demoHttp = true) {
  let secret = randomBytes(32).toString("hex");
  const child = fork(path.join(appRoot, "scripts/dev.mjs"), [], { cwd: appRoot, silent: true, env: { ...process.env,
    AI_OFFICE_FIXTURE_ROOT: f.root, AI_OFFICE_DATA_ROOT: f.dataRoot, AI_OFFICE_PORT: String(f.backendPort), AI_OFFICE_WEB_PORT: String(f.webPort),
    AI_OFFICE_DEMO_HTTP: demoHttp ? "1" : "0" } });
  let output = ""; child.stdout?.on("data", (chunk) => { output += String(chunk); }); child.stderr?.on("data", (chunk) => { output += String(chunk); });
  const exited = new Promise<number | null>((resolve) => child.once("exit", resolve));
  try {
    const ready = waitMessage(child, "ready");
    await waitMessage(child, "credentials-required"); child.send({ type: "credentials", secret });
    const info = await ready;
    let stopped = false;
    return { url: String(info.url), backendUrl: String(info.backendUrl), backendPid: Number(info.backendPid), frontendPid: Number(info.frontendPid),
      get secret() { return secret; }, get output() { return output; },
      async headers() {
        const response = await fetch(String(info.url) + "/api/session", { method: "POST", headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${createHash("sha256").update(secret).digest("hex")}` }, body: "{}" });
        if (!response.ok) throw new Error("Fixture session setup failed");
        const json = await response.json() as { sessionToken: string; csrfNonce: string };
        return { "Content-Type": "application/json", "X-AI-Office-Session": json.sessionToken, "X-AI-Office-Nonce": json.csrfNonce };
      },
      async stopBackend() { const done = waitMessage(child, "backend-stopped"); child.send("stop-backend"); await done; },
      async startBackend() { secret = randomBytes(32).toString("hex"); const done = waitMessage(child, "backend-restarted"); child.send({ type: "start-backend", secret }); return done; },
      async close() {
        if (stopped) return; stopped = true;
        const timer = setTimeout(() => child.kill(), 12_000);
        try { if (child.connected) child.send("shutdown"); const code = await exited; if (code !== 0) throw new Error("Owned launcher did not stop cleanly"); }
        finally { clearTimeout(timer); }
      },
    };
  } catch (error) { child.kill(); await exited; throw error; }
}
