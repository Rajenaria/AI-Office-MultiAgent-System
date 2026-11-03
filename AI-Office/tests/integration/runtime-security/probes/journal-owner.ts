// Real OS-process restart fixture. No provider, model, shell or arbitrary runner.
import { fork, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { AttemptDescriptorSchema } from "../../../../src/server/runtime-security/context.js";
import { FixtureAttemptJournal } from "../../../../src/server/runtime-security/journal.js";

const InputSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("record"), root: z.string(), context: AttemptDescriptorSchema, key: z.uuid() }),
  z.strictObject({ type: z.literal("recover"), root: z.string(), attemptId: z.uuid() }),
]);
let journal: FixtureAttemptJournal | undefined, probe: ChildProcess | undefined;
let nonce: string, exiting = false, started = false;
let probeExit: Promise<number | null> | undefined;
function send(message: unknown) { if (process.connected) process.send!(message); }
async function shutdown() {
  if (exiting) return; exiting = true;
  if (probe && probe.exitCode === null && probe.signalCode === null) {
    if (probe.connected) probe.send({ type: "cancel", nonce }, () => undefined);
    const timer = setTimeout(() => { if (probe?.exitCode === null && probe.signalCode === null) probe.kill(); }, 300);
    await probeExit; clearTimeout(timer);
  }
  await journal?.close(); send({ type: "stopped" });
  if (process.connected) process.disconnect();
}
process.once("disconnect", () => { void shutdown(); });
process.on("message", (message) => {
  if (message === "interrupt") { void shutdown(); return; }
  if (started) return; started = true;
  void main(message).catch(async (error: unknown) => { console.error(error); process.exitCode = 1; await shutdown(); });
});
async function main(input: unknown) {
  const request = InputSchema.parse(input); journal = await FixtureAttemptJournal.open(request.root);
  if (request.type === "recover") {
    const unresolved = await journal.read(request.attemptId);
    const resolved = await journal.reconcile(request.attemptId, "FAILED");
    send({ type: "recovered", pid: process.pid, before: unresolved, after: resolved });
    await shutdown(); return;
  }
  await journal.create(request.context, request.key);
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED", "LAUNCHING"] as const) await journal.transition(request.context.attemptId, phase);
  nonce = randomUUID();
  probe = fork(fileURLToPath(new URL("./dummy.mjs", import.meta.url)), [], { execPath: process.execPath, execArgv: [],
    cwd: path.join(request.context.projectRoot, "work"), silent: true, windowsHide: true,
    env: { SystemRoot: process.env.SystemRoot ?? "C:\\Windows", WINDIR: process.env.WINDIR ?? "C:\\Windows",
      TEMP: request.root, TMP: request.root, AI_OFFICE_SYNTHETIC_PROBE: "1" } });
  const child = probe;
  probeExit = new Promise((resolve) => child.once("close", resolve)); child.stdout?.resume(); child.stderr?.resume();
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Owned probe startup timeout")), 2500);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("message", (event) => {
      if (typeof event === "object" && event !== null && "type" in event && "nonce" in event && event.type === "ready" && event.nonce === nonce) {
        clearTimeout(timer); resolve();
      }
    });
    child.send({ type: "start", mode: "wait", nonce, fixtureRoot: request.root });
  });
  await journal.transition(request.context.attemptId, "RUNNING", { pid: child.pid!, nonce, startedAt: new Date().toISOString() });
  send({ type: "running", pid: process.pid, probePid: child.pid });
  // On interrupt, teardown the owned probe but deliberately omit its terminal
  // journal commit. The next process must reconcile rather than retry/succeed.
}
