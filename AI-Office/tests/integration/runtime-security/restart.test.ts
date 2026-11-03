import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { expect, it } from "vitest";
import { securityFixture } from "./fixtures/helpers.js";
import { FixtureAttemptJournal } from "../../../src/server/runtime-security/journal.js";

function launch(root: string) {
  const child = fork(fileURLToPath(new URL("./probes/journal-owner.ts", import.meta.url)), [], {
    execPath: process.execPath, execArgv: ["--import", "tsx"], silent: true, windowsHide: true,
    env: { SystemRoot: process.env.SystemRoot ?? "C:\\Windows", TEMP: path.dirname(root), TMP: path.dirname(root), TSX_DISABLE_CACHE: "1" } });
  const exit = new Promise<number | null>((resolve) => child.once("close", resolve));
  let stderr = ""; child.stderr?.on("data", (chunk) => { stderr += String(chunk); }); child.stdout?.resume();
  return { child, exit,
    message(type: string) { return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => { cleanup(); reject(new Error("Owned journal process timeout")); }, 6000);
      const error = () => { cleanup(); reject(new Error(`Owned journal process failed: ${stderr}`)); };
      const receive = (value: unknown) => { if (typeof value === "object" && value !== null && "type" in value && value.type === type) {
        cleanup(); resolve(value as Record<string, unknown>);
      } };
      function cleanup() { clearTimeout(timer); child.off("message", receive); child.off("error", error); child.off("exit", error); }
      child.on("message", receive); child.once("error", error); child.once("exit", error);
    }); },
    async stop() {
      if (child.exitCode === null && child.signalCode === null && child.connected) child.send("interrupt");
      const timer = setTimeout(() => { if (child.exitCode === null && child.signalCode === null) child.kill(); }, 2000);
      try { expect(await exit, stderr).toBe(0); expect(stderr).toBe(""); } finally { clearTimeout(timer); }
    },
  };
}

it("S14 reopens a running journal in a new OS process, refuses blind retry and explicitly reconciles", async () => {
  const f = await securityFixture(); const owners: ReturnType<typeof launch>[] = [];
  try {
    const context = await f.authority.issue(await f.options()); await f.harness.close();
    const first = launch(f.root); owners.push(first);
    const ready = first.message("running"); first.child.send({ type: "record", root: f.root, context, key: randomUUID() });
    const running = await ready; expect(running.probePid).toBeGreaterThan(0);
    await first.stop();
    expect(() => process.kill(Number(running.probePid), 0)).toThrow();
    const second = launch(f.root); owners.push(second);
    const response = second.message("recovered"); second.child.send({ type: "recover", root: f.root, attemptId: context.attemptId });
    const recovered = await response;
    expect(second.child.pid).not.toBe(first.child.pid);
    expect(recovered.before).toMatchObject({ phase: "RECONCILIATION_REQUIRED", outcome: null, lastProcess: { pid: running.probePid } });
    expect(recovered.after).toMatchObject({ phase: "FAILED", outcome: { reason: "CONTROLLER_RECONCILED" } });
    await second.stop();
    const journal = await FixtureAttemptJournal.open(f.root);
    try {
      const record = await journal.read(context.attemptId);
      expect(record.history.filter((event) => event.phase === "LAUNCHING")).toHaveLength(1);
      expect(record.history.filter((event) => event.phase === "RUNNING")).toHaveLength(1);
      expect(record.history.slice(-3).map((event) => event.phase)).toEqual(["UNCERTAIN", "RECONCILIATION_REQUIRED", "FAILED"]);
      await expect(journal.create(context, randomUUID())).rejects.toThrow("DUPLICATE_ATTEMPT");
    } finally { await journal.close(); }
  } finally {
    const stopped = await Promise.allSettled(owners.toReversed().map((owner) => owner.stop()));
    await f.cleanup();
    for (const result of stopped) if (result.status === "rejected") throw result.reason;
  }
}, 15_000);
