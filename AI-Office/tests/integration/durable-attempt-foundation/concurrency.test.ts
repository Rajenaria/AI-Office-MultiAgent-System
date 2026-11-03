import { randomUUID, createHash } from "node:crypto";
import { expect, it } from "vitest";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { openTestConnection } from "../../../src/server/attempt-control/test-storage.js";
import { advance, evidence, failure, fixture, identity, issueCommand, own, terminalCommand, transitionCommand } from "./helpers.js";
import { launch } from "./client-helper.js";

it("independent connections serialize issuance, produce real bounded BEGIN busy and deduplicate after release", () => {
  const { ref, repository } = fixture(), connectionA = randomUUID(), connectionB = randomUUID();
  const lock = own(openTestConnection(ref)), second = own(DurableAttemptRepository.openForTest(ref)), command = issueCommand(ref);
  lock.db.exec("BEGIN IMMEDIATE"); expect(lock.db.isTransaction).toBe(true);
  const before = performance.now(), busy = failure(() => second.issue(command), "DATABASE_BUSY"), elapsedMs = performance.now() - before;
  expect(busy.sqlite).toMatchObject({ primary: 5, extended: 5 }); expect(elapsedMs).toBeLessThan(1500);
  expect(lock.db.prepare("SELECT count(*) AS n FROM runtime_attempts").get()?.n).toBe(0);
  lock.db.exec("ROLLBACK");
  const winner = repository.issue(command), loser = second.issue(command);
  expect(winner.replay).toBe(false); expect(loser).toEqual({ attempt: winner.attempt, replay: true });
  evidence("connection-begin-busy", { ref, connectionA, connectionB, requestId: command.issueRequestId,
    ordering: ["A BEGIN acquired", "B BEGIN busy", "A rollback lock", "A issue committed", "B same-key replay"],
    elapsedMs, sqlite: busy.sqlite, winner: connectionA, loser: connectionB,
    final: { attempts: 1, events: repository.history(identity(winner.attempt)).length, version: winner.attempt.stateVersion } });
});

it("COMMIT busy rolls the same transaction back, never reports success or repeats the body automatically", () => {
  const { ref, repository } = fixture(), command = issueCommand(ref), reader = own(openTestConnection(ref));
  reader.db.exec("BEGIN"); reader.db.prepare("SELECT * FROM runtime_attempts").all();
  const busy = failure(() => repository.issue(command), "DATABASE_BUSY"); expect(busy.sqlite?.extended).toBe(5);
  expect(reader.db.prepare("SELECT count(*) AS n FROM runtime_attempts").get()?.n).toBe(0);
  reader.db.exec("COMMIT");
  const reopened = own(DurableAttemptRepository.openForTest(ref)); const a = reopened.issue(command).attempt;
  expect(reopened.history(identity(a))).toHaveLength(1);
  evidence("connection-commit-busy", { ref, sqlite: busy.sqlite, rolledBack: true, automaticRetries: 0,
    explicitSameCommandAfterReaderRelease: { version: a.stateVersion, events: 1 } });
});

it("two connection snapshots cannot both win one version or mutate after terminalization", () => {
  const { ref, repository } = fixture(), command = issueCommand(ref), a = advance(repository, command);
  const second = own(DurableAttemptRepository.openForTest(ref)); expect(second.read(identity(a))).toEqual(a);
  const terminal = repository.commitTerminal(terminalCommand(a, command.ownerNonce));
  failure(() => second.transition(transitionCommand(a, command.ownerNonce, "CANCELLATION_REQUESTED")), "CONFLICT");
  failure(() => second.commitTerminal(terminalCommand(a, command.ownerNonce, "FAILED")), "TERMINAL_CONFLICT");
  expect(second.read(identity(a))).toEqual(terminal.attempt);
});

it("two fixed Node processes prove lock acquisition, bounded busy, one issue, replay and actual clean exits", async () => {
  const { ref, repository } = fixture(), command = issueCommand(ref); repository.close();
  const clients: Awaited<ReturnType<typeof launch>>[] = [];
  try {
    const a = await launch(ref); clients.push(a); const b = await launch(ref); clients.push(b);
    const locked = await a.request("hold"); expect(locked.result?.transactionAcquired).toBe(true);
    const busy = await b.request("issue", command); expect(busy).toMatchObject({ ok: false, error: { code: "DATABASE_BUSY", sqlite: { primary: 5, extended: 5 } } });
    expect((await a.request("release")).ok).toBe(true);
    const winner = await a.request("issue", command), replay = await b.request("issue", command);
    expect(winner).toMatchObject({ ok: true, result: { replay: false } }); expect(replay).toMatchObject({ ok: true, result: { replay: true } });
    const inspector = own(DurableAttemptRepository.openForTest(ref)), final = inspector.read(identity(command));
    expect(inspector.history(identity(command))).toHaveLength(1); expect(final.stateVersion).toBe(1);
    evidence("process-lock-issue", { ref, requestId: command.issueRequestId, pids: clients.map((c) => c.child.pid),
      ordering: ["both open", "A lock acquired", "B busy", "A release", "A issue commit", "B replay"],
      winner: winner.connectionId, loser: replay.connectionId, sqlite: busy.error?.sqlite,
      final: { attempts: 1, events: 1, version: final.stateVersion } });
  } finally { const results = await Promise.allSettled(clients.map((c) => c.stop())); for (const result of results) if (result.status === "rejected") throw result.reason; }
}, 15_000);

it.each(["same-issue", "changed-issue", "version-CAS", "terminal-race"] as const)("two Node processes arbitrate %s using an explicit ready/start barrier", async (scenario) => {
  const { ref, repository } = fixture(), command = issueCommand(ref);
  const current = scenario === "version-CAS" ? repository.issue(command).attempt : scenario === "terminal-race" ? advance(repository, command) : null;
  repository.close();
  const clients: Awaited<ReturnType<typeof launch>>[] = [];
  try {
    const a = await launch(ref); clients.push(a); const b = await launch(ref); clients.push(b);
    // Both clients acknowledged opening independent connections before these sends.
    const operation = scenario.endsWith("issue") ? "issue" : scenario === "version-CAS" ? "transition" : "terminal";
    const first = scenario.endsWith("issue") ? command : scenario === "version-CAS" ? transitionCommand(current!, command.ownerNonce, "APPROVAL_PENDING") : terminalCommand(current!, command.ownerNonce);
    const second = scenario === "changed-issue" ? { ...command, actionDigest: createHash("sha256").update("different").digest("hex") } :
      scenario === "version-CAS" ? transitionCommand(current!, command.ownerNonce, "APPROVAL_PENDING") :
        scenario === "terminal-race" ? terminalCommand(current!, command.ownerNonce, "FAILED") : command;
    const replies = await Promise.all([a.request(operation, first), b.request(operation, second)]);
    const authoritative = replies.filter((r) => r.ok && (operation === "issue" ? r.result?.replay === false : true));
    expect(authoritative).toHaveLength(1);
    const loser = replies.find((r) => r !== authoritative[0])!;
    if (scenario === "same-issue") expect(loser).toMatchObject({ ok: true, result: { replay: true } });
    else expect(loser).toMatchObject({ ok: false, error: { code: scenario === "terminal-race" ? "TERMINAL_CONFLICT" : "CONFLICT" } });
    const inspector = own(DurableAttemptRepository.openForTest(ref)), final = inspector.read(identity(command)), history = inspector.history(identity(command));
    expect(final.stateVersion).toBe(scenario.endsWith("issue") ? 1 : scenario === "version-CAS" ? 2 : 6);
    expect(history).toHaveLength(final.stateVersion);
    evidence(`process-${scenario}`, { ref, requestId: command.issueRequestId, pids: clients.map((c) => c.child.pid),
      barrier: "two open acknowledgements before two fixed operation sends", replies,
      winner: authoritative[0]!.connectionId, loser: loser.connectionId,
      final: { attempts: 1, events: history.length, version: final.stateVersion, phase: final.phase } });
  } finally { const results = await Promise.allSettled(clients.map((c) => c.stop())); for (const result of results) if (result.status === "rejected") throw result.reason; }
}, 15_000);
