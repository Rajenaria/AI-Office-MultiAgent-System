import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { emitKeypressEvents } from "node:readline";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const thisFile = fileURLToPath(import.meta.url);
const port = (value, fallback) => {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) throw new Error("INVALID_FIXED_LOOPBACK_PORT");
  return number;
};
const validSecret = (secret) => typeof secret === "string" && secret.length >= 20 && secret.length <= 256;

async function hiddenPassphrase() {
  if (process.send) {
    return new Promise((resolve, reject) => {
      process.once("message", (message) => {
        if (message?.type === "credentials" && validSecret(message.secret)) resolve(message.secret);
        else reject(new Error("INVALID_LAUNCH_PASSPHRASE"));
      });
      process.send({ type: "credentials-required" });
    });
  }
  if (!process.stdin.isTTY) throw new Error("INTERACTIVE_TERMINAL_REQUIRED");
  process.stdout.write("Enter a private launch passphrase (20–256 characters; input hidden): ");
  emitKeypressEvents(process.stdin); process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let secret = "";
    const finish = (error) => {
      process.stdin.off("keypress", onKey); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n");
      if (error) reject(error); else resolve(secret);
    };
    const onKey = (text, key) => {
      if (key?.ctrl && key.name === "c") finish(new Error("LAUNCH_CANCELLED"));
      else if (key?.name === "return") finish(validSecret(secret) ? null : new Error("INVALID_LAUNCH_PASSPHRASE"));
      else if (key?.name === "backspace") secret = secret.slice(0, -1);
      else if (text && !key?.ctrl && !/[\x00-\x1f\x7f]/.test(text) && secret.length + text.length <= 256) secret += text;
    };
    process.stdin.on("keypress", onKey);
  });
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exit = new Promise((resolve) => child.once("exit", resolve));
  const timer = setTimeout(() => child.kill(), 6000); // This launcher's child only.
  try { if (child.connected) child.send("shutdown"); else child.kill(); await exit; }
  finally { clearTimeout(timer); }
}

async function viteChild() {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.join(appRoot, "vite.config.ts"), logLevel: "silent" });
  await server.listen();
  let stopping = false;
  const stop = () => {
    if (stopping) return; stopping = true;
    void server.close().then(() => { if (process.connected) process.disconnect(); });
  };
  process.on("message", (message) => { if (message === "shutdown") stop(); });
  process.once("disconnect", stop); process.once("SIGINT", stop); process.once("SIGTERM", stop);
  process.send?.({ type: "frontend-ready", url: `http://127.0.0.1:${port(process.env.AI_OFFICE_WEB_PORT, 43124)}` });
}

async function launcher() {
  if (!process.env.AI_OFFICE_FIXTURE_ROOT || !process.env.AI_OFFICE_DATA_ROOT) throw new Error("EXPLICIT_FIXTURE_ROOT_AND_APP_DATA_REQUIRED");
  const fixtureRoot = await realpath(process.env.AI_OFFICE_FIXTURE_ROOT);
  const dataRoot = path.resolve(process.env.AI_OFFICE_DATA_ROOT);
  const relative = path.relative(fixtureRoot, dataRoot);
  if (!relative || path.isAbsolute(relative) || relative.split(path.sep)[0] === "..") throw new Error("APP_DATA_MUST_BE_INSIDE_FIXTURE_ROOT");
  const backendPort = port(process.env.AI_OFFICE_PORT, 43123), webPort = port(process.env.AI_OFFICE_WEB_PORT, 43124);
  if (backendPort === webPort) throw new Error("SEPARATE_FRONTEND_BACKEND_PORTS_REQUIRED");
  const url = `http://127.0.0.1:${webPort}`, backendUrl = `http://127.0.0.1:${backendPort}`;
  const owned = new Set();
  let backend, frontend, stopping = false;
  const stop = async () => {
    if (stopping) return; stopping = true;
    for (const child of [...owned].reverse()) await stopChild(child);
    if (process.connected) process.disconnect();
  };
  process.once("SIGINT", () => { void stop(); }); process.once("SIGTERM", () => { void stop(); });
  process.once("disconnect", () => { void stop(); });
  const environment = { ...process.env, AI_OFFICE_FIXTURE_ROOT: fixtureRoot, AI_OFFICE_DATA_ROOT: dataRoot,
    AI_OFFICE_PORT: String(backendPort), AI_OFFICE_WEB_PORT: String(webPort), AI_OFFICE_DEV_ORIGIN: url };

  const waitFor = (child, type, token) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("CHILD_STARTUP_TIMEOUT")), 15_000);
    child.stdout?.resume(); child.stderr?.resume(); // Never echo capabilities or raw child output.
    child.once("error", () => { clearTimeout(timer); reject(new Error("CHILD_STARTUP_FAILED")); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error("CHILD_EXITED_DURING_STARTUP_CHECK_PORT_OR_CONFIGURATION")); });
    child.on("message", (message) => {
      if (message?.type === "bootstrap-required" && token) child.send({ type: "bootstrap", token });
      if (message?.type === type) { clearTimeout(timer); resolve(); }
    });
  });
  const startBackend = async (secret) => {
    if (!validSecret(secret)) throw new Error("INVALID_LAUNCH_PASSPHRASE");
    const token = createHash("sha256").update(secret, "utf8").digest("hex");
    backend = fork(path.join(appRoot, "src/server/index.ts"), [], { cwd: appRoot, execArgv: ["--import", "tsx"],
      silent: true, env: { ...environment, AI_OFFICE_LAUNCHER: "1" } });
    owned.add(backend); await waitFor(backend, "started", token);
    const health = await fetch(backendUrl + "/api/health", { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!health.ok) throw new Error("BACKEND_HEALTH_NOT_READY");
  };
  try {
    await startBackend(await hiddenPassphrase());
    frontend = fork(thisFile, ["--vite-child"], { cwd: appRoot, silent: true, env: environment });
    owned.add(frontend); await waitFor(frontend, "frontend-ready");
    const health = await fetch(url + "/api/health", { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!health.ok) throw new Error("FRONTEND_PROXY_NOT_READY");
    if (process.send) process.send({ type: "ready", url, backendUrl, backendPid: backend.pid, frontendPid: frontend.pid });
    else process.stdout.write(`AI Office fixture shell: ${url}\nUse your private passphrase in the browser. Ctrl+C stops owned child processes.\n`);
    // Test parent IPC only. No restart or process-control HTTP endpoint exists.
    let commands = Promise.resolve();
    process.on("message", (message) => {
      commands = commands.then(async () => {
        if (message === "shutdown") await stop();
        else if (message === "stop-backend") { await stopChild(backend); backend = undefined; process.send?.({ type: "backend-stopped" }); }
        else if (message?.type === "start-backend" && !backend) {
          await startBackend(message.secret); process.send?.({ type: "backend-restarted", backendPid: backend.pid });
        }
      }).catch(async () => { process.stderr.write("LAUNCHER_COMMAND_FAILED\n"); process.exitCode = 1; await stop(); });
    });
  } catch (error) { await stop(); throw error; }
}

const run = process.argv.includes("--vite-child") ? viteChild : launcher;
void run().catch((error) => { process.stderr.write(`${/^[A-Z_]+$/.test(error.message) ? error.message : "LOCAL_DEVELOPMENT_STARTUP_FAILED"}\n`); process.exitCode = 1; if (process.connected) process.disconnect(); });
