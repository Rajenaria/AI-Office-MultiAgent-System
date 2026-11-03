// Fixed non-AI fixture probe. No shell, arbitrary executable, network or provider.
import { fork } from "node:child_process";
import { readFile, realpath, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

let settings, timer, stopped = false, descendant;
const self = fileURLToPath(import.meta.url);
const send = (type, extra = {}) => { if (process.connected) process.send({ type, nonce: settings.nonce, pid: process.pid, ...extra }); };
async function stop(reason = "cancelled") {
  if (stopped) return; stopped = true; clearInterval(timer);
  if (descendant) {
    const child = descendant;
    const exit = new Promise((resolve) => child.once("close", resolve));
    if (child.connected) child.send({ type: "cancel", nonce: settings.nonce }, () => undefined);
    const killTimer = setTimeout(() => { if (child.exitCode === null && child.signalCode === null) child.kill(); }, 150);
    await exit; clearTimeout(killTimer); send("descendant-exited", { pid: child.pid });
  }
  send(reason);
  if (process.connected) process.disconnect();
}
process.on("disconnect", () => { void stop(); });
process.on("message", (message) => {
  if (message?.type === "cancel" && settings && message.nonce === settings.nonce) {
    if (!["ignore-cancel", "tree-ignore-cancel"].includes(settings.mode)) void stop();
    return;
  }
  if (message?.type !== "start" || settings) return;
  void start(message).catch(() => { process.exitCode = 23; if (process.connected) process.disconnect(); });
});
async function start(message) {
  const root = await realpath(message.fixtureRoot), cwd = await realpath(process.cwd());
  // The supervisor already validates the OS temp parent. TEMP/TMP in this child
  // intentionally point inside the fixture, so tmpdir() is not that parent.
  if (!["project-a", "project-b"].some((project) => path.join(root, project, "work") === cwd) ||
      !path.basename(root).startsWith("ai-office-m0202-") ||
      process.env.AI_OFFICE_SYNTHETIC_PROBE !== "1") throw new Error("Fixture required");
  settings = message;
  if (["tree", "tree-ignore-cancel"].includes(message.mode) && (message.depth ?? 0) < 2) {
    const child = fork(self, [], { execPath: process.execPath, execArgv: [], windowsHide: true, silent: true, env: process.env });
    descendant = child;
    child.stdout.resume(); child.stderr.resume();
    child.on("message", (event) => {
      if (event?.nonce !== settings.nonce) return;
      if (event.type === "descendant" || event.type === "descendant-exited") {
        if (process.connected) process.send(event);
      }
    });
    const ready = new Promise((resolve) => child.on("message", (event) => { if (event?.type === "ready" && event.nonce === settings.nonce) resolve(); }));
    child.send({ ...message, mode: "tree", depth: (message.depth ?? 0) + 1 });
    await ready; send("descendant", { pid: child.pid });
  }
  send("ready");
  if (message.mode === "canary") {
    let canaryReadable = false;
    try { canaryReadable = (await readFile(path.join(root, "dummy-credentials", "fake-token.txt"), "utf8")).startsWith("FAKE_SECURITY_CANARY_"); } catch {}
    send("canary", { canaryReadable, environmentKeys: Object.keys(process.env).sort() });
  }
  if (["complete", "canary", "output"].includes(message.mode)) {
    if (message.mode === "output") { process.stdout.write("o".repeat(32768)); process.stderr.write("e".repeat(32768)); }
    await stop("completed"); return;
  }
  if (message.mode === "fail") { process.stderr.write("SYNTHETIC_PROBE_FAILURE"); process.exitCode = 7; process.disconnect(); return; }
  timer = setInterval(() => { void appendFile(path.join(process.cwd(), "pulse.txt"), ".").catch(() => undefined); }, 20);
}
