import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { classifyLease, readLease } from "../../../src/server/attempt-control/lease.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { openTestConnection } from "../../../src/server/attempt-control/test-storage.js";
import { evidence, expected, failure, identity, own, terminalCommand, transitionCommand } from "./helpers.js";
import { clockAt, leasedFixture } from "./lease-helpers.js";
import { launch } from "./client-helper.js";

function heartbeat(f: ReturnType<typeof leasedFixture>) {
  return { expected: expected(f.attempt, f.command.ownerNonce), clock: clockAt(f.attempt), heartbeatId: randomUUID(),
    previousSequence: 0, authorization: "s12-test-only" as const };
}
it("L01 valid persistent lease initialization", () => { const f = leasedFixture(); expect(readLease(f.attempt)).toMatchObject({
  heartbeatSequence: 0, deadlineWallMs: 21000, deadlineMonoMs: 20100, status: "ACTIVE" }); });
it("L02 matching owner explicitly renews", () => { const f = leasedFixture(); const a = f.repository.renewLease(heartbeat(f));
  expect(a.replay).toBe(false); expect(readLease(a.attempt)?.deadlineWallMs).toBe(22000); });
it("L03 heartbeat increments sequence and projection/event version once", () => { const f = leasedFixture();
  const a = f.repository.renewLease(heartbeat(f)).attempt; expect(readLease(a)?.heartbeatSequence).toBe(1); expect(a.stateVersion).toBe(2);
  expect(f.repository.history(identity(a))).toHaveLength(2); });
it("L04 identical heartbeat replays and changed duplicate conflicts", () => { const f = leasedFixture(), h = heartbeat(f);
  const a = f.repository.renewLease(h); expect(f.repository.renewLease(h)).toEqual({ attempt: a.attempt, replay: true });
  failure(() => f.repository.renewLease({ ...h, clock: { ...h.clock, wallMs: 2100 } }), "CONFLICT"); });
it.each([["L05", "ownerId"], ["L06", "ownerNonce"], ["L07", "hostInstanceId"], ["L08", "attemptGeneration"],
  ["L09", "stateVersion"], ["L10", "projectId"]])("%s rejects changed %s", (id, field) => {
  const f = leasedFixture(), h = heartbeat(f), value = field === "ownerNonce" ? hash("wrong") :
    ["stateVersion", "attemptGeneration"].includes(field!) ? 2 : randomUUID();
  failure(() => f.repository.renewLease({ ...h, expected: { ...h.expected, [field!]: value } }),
    id === "L09" ? "CONFLICT" : id === "L10" ? "IDENTITY_CONFLICT" : "STALE_OWNER");
  expect(f.repository.history(identity(f.attempt))).toHaveLength(1);
});
it("L11 terminal renewal rejected", () => { const f = leasedFixture(); const clock = clockAt(f.attempt, 1);
  const pending = f.repository.transition({ ...transitionCommand(f.attempt, f.command.ownerNonce, "APPROVAL_PENDING"), clock });
  const a = f.repository.commitTerminal({ ...terminalCommand(pending, f.command.ownerNonce, "APPROVAL_DENIED"), clock: clockAt(pending, 2) }).attempt;
  failure(() => f.repository.renewLease({ ...heartbeat(f), expected: expected(a, f.command.ownerNonce) }), "LEASE_INVALID"); });
it("L12 deadline equality/exceeded is expired, renewal rejected", () => { const f = leasedFixture();
  expect(classifyLease(f.attempt, clockAt(f.attempt, 20000))).toBe("EXPIRED");
  failure(() => f.repository.renewLease({ ...heartbeat(f), clock: clockAt(f.attempt, 20000) }), "LEASE_INVALID"); });
it("L13 expiry quarantines without owner transfer, replacement or worker", () => { const f = leasedFixture();
  const a = f.repository.recordLeaseConcern({ expected: expected(f.attempt, f.command.ownerNonce), clock: clockAt(f.attempt, 20000),
    eventId: randomUUID(), authorization: "s12-test-only" });
  expect(a).toMatchObject({ phase: "UNCERTAIN", attemptGeneration: 1, ownerId: f.attempt.ownerId, conflictHeld: 1 });
  failure(() => f.repository.fenceForTestRecovery({ expected: expected(a, f.command.ownerNonce), newOwner: {
    hostInstanceId: randomUUID(), ownerId: randomUUID(), ownerNonce: hash("new") }, eventId: randomUUID(), atMs: a.updatedAtMs + 1,
    testRecoveryGrantId: randomUUID(), authorization: "s12-test-only" }), "LEASE_INVALID");
});
it.each([["L14", "backward"], ["L15", "forward"], ["L16", "sleep"]])("%s %s anomaly fails closed and records quarantine", (_id, mode) => {
  const f = leasedFixture(); const clock = mode === "sleep" ? clockAt(f.attempt, 16000) :
    { ...clockAt(f.attempt), wallMs: mode === "backward" ? 999 : 40000 };
  expect(classifyLease(f.attempt, clock)).toBe("CLOCK_UNTRUSTED");
  failure(() => f.repository.renewLease({ ...heartbeat(f), clock }), "LEASE_INVALID");
  const a = f.repository.recordLeaseConcern({ expected: expected(f.attempt, f.command.ownerNonce), clock,
    eventId: randomUUID(), authorization: "s12-test-only" });
  expect(readLease(a)?.status).toBe("QUARANTINED"); expect(a.attemptGeneration).toBe(1);
});
it("L17 two independent connections cannot both renew one version", () => { const f = leasedFixture(), second = own(DurableAttemptRepository.openForTest(f.ref)), h = heartbeat(f);
  const winner = f.repository.renewLease(h); failure(() => second.renewLease({ ...h, heartbeatId: randomUUID() }), "CONFLICT");
  expect(second.read(identity(f.attempt))).toEqual(winner.attempt); });
it("L18 two fixed host processes compete for one lease CAS", async () => {
  const f = leasedFixture(), h = heartbeat(f); f.repository.close(); const clients: Awaited<ReturnType<typeof launch>>[] = [];
  try { const a = await launch(f.ref); clients.push(a); const b = await launch(f.ref); clients.push(b);
    const replies = await Promise.all([a.request("heartbeat", h), b.request("heartbeat", { ...h, heartbeatId: randomUUID() })]);
    expect(replies.filter((r) => r.ok)).toHaveLength(1); expect(replies.find((r) => !r.ok)?.error?.code).toBe("CONFLICT");
    const r = own(DurableAttemptRepository.openForTest(f.ref)), final = r.read(identity(f.attempt));
    expect(final.stateVersion).toBe(2); expect(readLease(final)?.heartbeatSequence).toBe(1);
    evidence("L18", { ref: f.ref, replies, final, events: r.history(identity(final)).length });
  } finally { for (const c of clients) await c.stop(); }
}, 15000);
it("L19 actual SQLite busy and controlled rollback leave lease unchanged", () => { const f = leasedFixture(), h = heartbeat(f), c = own(openTestConnection(f.ref));
  c.db.exec("BEGIN IMMEDIATE"); const err = failure(() => f.repository.renewLease(h), "DATABASE_BUSY"); c.db.exec("ROLLBACK");
  expect(err.sqlite).toMatchObject({ primary: 5, extended: 5 }); f.repository.close();
  const faulty = own(DurableAttemptRepository.openForTest(f.ref, { stage: "afterEvent", eventType: "LEASE_RENEWED" }));
  failure(() => faulty.renewLease(h), "FAULT"); faulty.close(); const r = own(DurableAttemptRepository.openForTest(f.ref));
  expect(r.read(identity(f.attempt))).toEqual(f.attempt); expect(r.renewLease(h).attempt.stateVersion).toBe(2);
  evidence("L19", { ref: f.ref, sqlite: err.sqlite, rollback: true });
});
it("L20 committed lease survives reopen; new host cannot compare old monotonic domain", () => { const f = leasedFixture();
  const a = f.repository.renewLease(heartbeat(f)).attempt; f.repository.close(); const r = own(DurableAttemptRepository.openForTest(f.ref));
  expect(r.read(identity(a))).toEqual(a); expect(classifyLease(a, { ...clockAt(a), hostInstanceId: randomUUID(), monotonicMs: 0 })).toBe("PREVIOUS_HOST"); });
it("L21 stale heartbeat cannot append event or advance sequence", () => { const f = leasedFixture(), h = heartbeat(f);
  const a = f.repository.renewLease(h).attempt; failure(() => f.repository.renewLease({ ...h, heartbeatId: randomUUID() }), "CONFLICT");
  expect(f.repository.history(identity(a))).toHaveLength(2); });
it("L22 lease methods create no timer/dispatch and legacy mutation cannot bypass lease", () => { const f = leasedFixture();
  failure(() => f.repository.transition(transitionCommand(f.attempt, f.command.ownerNonce, "APPROVAL_PENDING")), "VALIDATION");
  expect(f.repository.read(identity(f.attempt))).toEqual(f.attempt);
});
it("lease fault points before/after projection/event all rollback", () => {
  for (const eventType of ["LEASE_RENEWED", "LEASE_QUARANTINED"] as const) for (const stage of ["beforeProjection", "afterProjection", "afterEvent"] as const) {
    const f = leasedFixture(), h = heartbeat(f); f.repository.close(); const faulty = own(DurableAttemptRepository.openForTest(f.ref, { stage, eventType }));
    const concern = { expected: h.expected, clock: clockAt(f.attempt, 20000), eventId: randomUUID(), authorization: "s12-test-only" };
    failure(() => eventType === "LEASE_RENEWED" ? faulty.renewLease(h) : faulty.recordLeaseConcern(concern), "FAULT"); faulty.close();
    const r = own(DurableAttemptRepository.openForTest(f.ref)); expect(r.read(identity(f.attempt))).toEqual(f.attempt);
  }
});
