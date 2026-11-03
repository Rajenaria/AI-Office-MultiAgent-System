import { fork } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { expect } from "vitest";
import type { TestDatabaseRef } from "../../../src/server/attempt-control/test-storage.js";
import { evidence, root } from "./helpers.js";

type Reply = { id: string; ok: boolean; connectionId: string; result?: Record<string, unknown>;
  error?: { code: string; sqlite: { primary: number; extended: number } | null } };
export async function launch(ref: TestDatabaseRef) {
  const executable = realpathSync.native(process.execPath), source = fileURLToPath(new URL("./child-client.mjs", import.meta.url));
  for (const filename of [executable, source]) {
    const info = lstatSync(filename); expect(info.isFile() && !info.isSymbolicLink() && info.nlink === 1).toBe(true);
    expect(realpathSync.native(filename)).toBe(filename);
  }
  const executableHash = createHash("sha256").update(readFileSync(executable)).digest("hex");
  const child = fork(source, [], { execPath: executable, execArgv: [], silent: true, windowsHide: true, detached: false,
    env: { SystemRoot: process.env.SystemRoot ?? "C:\\Windows", TEMP: path.dirname(root.root), TMP: path.dirname(root.root) } });
  const exit = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
    child.once("close", (code, signal) => resolve({ code, signal })));
  let stderr = ""; child.stderr?.on("data", (chunk) => { stderr += String(chunk); }); child.stdout?.resume();
  const trace: unknown[] = [];
  const pending = new Map<string, { resolve(reply: Reply): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
  child.on("message", (reply: Reply) => {
    const request = pending.get(reply.id); if (!request) return;
    clearTimeout(request.timer); pending.delete(reply.id);
    trace.push({ sequence: trace.length + 1, requestId: reply.id, connectionId: reply.connectionId, ok: reply.ok,
      error: reply.error, result: reply.result }); request.resolve(reply);
  });
  child.once("error", (error) => { for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); } pending.clear(); });
  async function request(operation: string, command?: unknown): Promise<Reply> {
    const id = randomUUID(); trace.push({ sequence: trace.length + 1, requestId: id, operation, sent: true });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Fixed client ${operation} deadline: ${stderr}`)); }, 4000);
      pending.set(id, { resolve, reject, timer }); child.send({ id, operation, command });
    });
  }
  async function stop() {
    if (child.connected) await request("stop");
    let forcedOwnedCleanup = false;
    const deadline = setTimeout(() => { if (child.exitCode === null && child.signalCode === null) { forcedOwnedCleanup = true; child.kill(); } }, 1500);
    try {
      const outcome = await exit;
      evidence("client-exit", { ref, pid: child.pid, executable, executableHash, trace, stderr, outcome, forcedOwnedCleanup });
      expect(forcedOwnedCleanup).toBe(false);
      expect(outcome).toEqual({ code: 0, signal: null }); return outcome;
    } finally { clearTimeout(deadline); }
  }
  const startup = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => reject(new Error(`Fixed client startup deadline: ${stderr}`)), 4000);
    child.once("message", () => clearTimeout(timer)); child.once("exit", () => { clearTimeout(timer); reject(new Error(`Fixed client exited during startup: ${stderr}`)); });
  });
  try { await Promise.race([once(child, "message"), startup]); }
  catch (error) { if (child.connected) child.disconnect(); await exit; throw error; }
  try { const opened = await request("open", ref); expect(opened.ok, JSON.stringify(opened)).toBe(true); }
  catch (error) { await stop(); throw error; }
  return { child, request, stop, trace };
}

