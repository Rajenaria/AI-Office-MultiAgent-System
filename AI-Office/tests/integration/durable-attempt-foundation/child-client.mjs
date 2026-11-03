// Fixed host-only SQLite test client. Native in-process TypeScript transformation;
// no tsx/esbuild service, shell, child_process API, grandchildren or worker code.
import { registerHooks, stripTypeScriptTypes } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const source = new URL("../../../src/", import.meta.url);
const files = ["contracts/primitives.ts", ...["contracts", "state-machine", "schema", "test-storage", "journal", "repository", "lease", "cancellation", "recovery"]
  .map((name) => `server/attempt-control/${name}.ts`)];
const allowed = new Set(files.map((name) => new URL(name, source).href));
registerHooks({
  resolve(specifier, context, next) {
    if (allowed.has(context.parentURL) && specifier.startsWith(".") && specifier.endsWith(".js")) {
      const target = new URL(specifier.replace(/\.js$/, ".ts"), context.parentURL).href;
      if (!allowed.has(target)) throw new Error("Unapproved test-client import");
      return next(target, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (!allowed.has(url)) return next(url, context);
    return { format: "module", shortCircuit: true, source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), "utf8"),
      { mode: "transform", sourceUrl: url }) };
  },
});
const { DurableAttemptRepository } = await import(new URL("server/attempt-control/repository.ts", source).href);
const { openTestConnection } = await import(new URL("server/attempt-control/test-storage.ts", source).href);
let repository, raw, stopped = false;
const connectionId = randomUUID();
function stop() {
  if (stopped) return;
  stopped = true;
  clearTimeout(deadline);
  if (raw?.db.isOpen && raw.db.isTransaction) raw.db.exec("ROLLBACK");
  raw?.close(); repository?.close();
  if (process.connected) process.disconnect();
}
const deadline = setTimeout(() => { process.exitCode = 2; stop(); }, 10_000);
process.once("disconnect", stop);
process.on("message", (message) => {
  if (!message || typeof message !== "object" || typeof message.id !== "string") return;
  const { id, operation, command } = message;
  try {
    let result;
    if (operation === "open" && !repository) {
      repository = DurableAttemptRepository.openForTest(command); raw = openTestConnection(command);
      result = { settings: repository.settings, connectionId, pid: process.pid };
    } else if (operation === "stop") { process.send?.({ id, ok: true, connectionId }); stop(); return; }
    else if (!repository || !raw) throw new Error("Open required");
    else if (operation === "hold") { raw.db.exec("BEGIN IMMEDIATE"); result = { transactionAcquired: raw.db.isTransaction }; }
    else if (operation === "release") { raw.db.exec("ROLLBACK"); result = { released: !raw.db.isTransaction }; }
    else if (operation === "issue") result = repository.issue(command);
    else if (operation === "transition") result = repository.transition(command);
    else if (operation === "terminal") result = repository.commitTerminal(command,
      command.clock ? repository.authorizeHostForTest(command.expected, command.clock) : undefined);
    else if (operation === "heartbeat") result = repository.renewLease(command);
    else if (operation === "cancel") result = repository.requestCancellation(command, repository.authorizeHostForTest(command.expected, command.clock));
    else if (operation === "reconcile") result = repository.reconcile(command, repository.openRecoveryForTest({
      hostInstanceId: command.clock.hostInstanceId, clockDomainId: command.clock.clockDomainId, decisionId: command.decisionId }));
    else if (operation === "read") result = repository.read(command);
    else throw new Error("Fixed operation required");
    process.send?.({ id, ok: true, connectionId, result });
  } catch (error) {
    process.send?.({ id, ok: false, connectionId, error: { code: error.code ?? "UNEXPECTED",
      sqlite: error.sqlite ?? (Number.isInteger(error.errcode) ? { primary: error.errcode & 255, extended: error.errcode } : null) } });
  }
});
process.send?.({ type: "ready", connectionId, pid: process.pid });
