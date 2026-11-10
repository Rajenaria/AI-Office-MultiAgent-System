import { afterEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import childProcess from "node:child_process";
import net from "node:net";
import { createDurableMockFixtureRoot, createDurableMockFixture, durableMockFixtureFilename, openDurableMockTransaction,
  type DurableMockOperation, type DurableMockReceipt, type DurableFault } from "../../src/contracts/testing/durable-mock-transaction.js";
import { createScopedCapabilityBoundary } from "../../src/contracts/testing/scoped-capability.js";
import { createFakeAuthorityAdapter, type AuthoritySeed } from "../../src/contracts/testing/fake-authority-adapter.js";
import { createMockEnforcementBoundary, type MockFixtureSeed } from "../../src/contracts/testing/mock-enforcement.js";
import { evaluateWorkerAdmission, type AdmissionRequest, type OutputEnvelope } from "../../src/contracts/execution-fence.js";

declare const R9_AUDIT_ROOT: string; // fixed TEMP path injected by isolated config; no environment/credential lookup
const root = createDurableMockFixtureRoot(R9_AUDIT_ROOT);
const stores: ReturnType<typeof openDurableMockTransaction>[] = [];
const rawConnections: DatabaseSync[] = [];
afterEach(() => { for (const c of rawConnections.splice(0)) if (c.isOpen) { if (c.isTransaction) c.exec("ROLLBACK"); c.close(); }
  for (const s of stores.splice(0)) s.boundary.close(); }); // retain every database, marker and audit artifact
const ADMIT = "MOCK_ADMISSION_RECORD";
const PUB = "MOCK_PUBLICATION_RECORD";
function fixture() {
  const identity = { projectId: "11111111-1111-4111-8111-111111111111", sessionId: "session-a", ownerId: "owner-a", runId: "run-a", workerId: "worker-a", taskScope: "review" };
  const proof = () => ({ evidenceId: "dummy-proof", identity: { ...identity }, epoch: 2, policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 });
  const assertion = () => ({ status: "VERIFIED" as const, evidence: proof() });
  const mock: MockFixtureSeed = { context: { identity: { ...identity }, epoch: 2, policyVersion: "v1", nowMs: 150, lifecycle: "APPROVAL_GRANTED",
    cancellation: "CLEAR", authorization: assertion(), securityStop: { state: "CLEARED", clearance: proof() }, containment: assertion(), outputFence: assertion(), provider: null },
    policy: { policyId: "dummy-policy", version: "v1", status: "ACTIVE", validFromMs: 100, expiresAtMs: 200,
      scope: { projectId: identity.projectId, sessionId: identity.sessionId, ownerId: identity.ownerId },
      admission: { enabled: true, workerTypes: ["reviewer"], taskScopes: ["review"] },
      publication: { enabled: true, sequenceRequired: true, destinations: [{ destinationId: "panel-a", ...{ projectId: identity.projectId, sessionId: identity.sessionId, ownerId: identity.ownerId }, channels: ["text"], classifications: ["PUBLIC", "INTERNAL"] }] }, providers: [] },
    destinationId: "panel-a", sequence: { min: 1, max: 100, lastAccepted: null, seenOutputIds: [] } };
  const seed: AuthoritySeed = { authorityInstanceId: "authority-a", nowMs: 150, fixture: mock };
  const request: AdmissionRequest = { requestId: "request-a", identity: { ...identity }, epoch: 2, policyVersion: "v1", workerType: "reviewer", providerId: null };
  const output: OutputEnvelope = { outputId: "event-a", identity: { ...identity }, epoch: 2, policyVersion: "v1", destinationId: "panel-a", channel: "text", classification: "INTERNAL", sequence: 1 };
  return { seed, mock, request, output };
}
function harness(reusable = false) {
  const f = fixture(); const grant = (action: string, reuse = false) => ({ allowedActions: [action], taskScope: "review", destinationScope: "panel-a", expiresAtMs: 190, usagePolicy: reuse ? "REUSABLE" : "SINGLE_USE" });
  const specs = [grant(ADMIT), grant(PUB, reusable), grant(PUB)];
  const ref = createDurableMockFixture(root, f.seed, specs);
  const open = () => { const s = openDurableMockTransaction(ref); stores.push(s); return s; };
  let current = open();
  const snapshot = () => current.boundary.snapshot();
  const cap = (n = 1) => current.owner.resumeCapabilityReference(`mock-capability:${n}`);
  const admit = (operationId = "admit-a", idempotencyKey = operationId): DurableMockOperation => ({ kind: "ADMISSION", operationId, idempotencyKey, expectedRevision: snapshot().revision, action: ADMIT, destinationId: "panel-a", request: structuredClone(f.request) });
  const pub = (operationId = "publish-a", output = f.output, idempotencyKey = operationId): DurableMockOperation => ({ kind: "PUBLICATION", operationId, idempotencyKey, expectedRevision: snapshot().revision, action: PUB, output: structuredClone(output) });
  const attempt = (op: DurableMockOperation, n = op.kind === "ADMISSION" ? 1 : 2) => current.boundary.attemptDurableMockOperation(op, cap(n));
  const start = () => { const r = attempt(admit()); expect(r.outcome).toBe("MOCK_DURABLE_RECORDED"); return r; };
  const control = (control: Record<string, unknown>) => current.owner.applyControl({ expectedRevision: snapshot().revision, control });
  const change = (command: Record<string, unknown>) => control({ kind: "AUTHORITY", command: { expectedAuthorityRevision: snapshot().projection.authority.authorityRevision, ...command } });
  const raw = () => { const db = new DatabaseSync(durableMockFixtureFilename(ref), { timeout: 0, enableForeignKeyConstraints: true }); rawConnections.push(db); return db; };
  return { f, ref, specs, open, snapshot, cap, admit, pub, attempt, start, control, change, raw,
    get s() { return current; }, reopen() { current.boundary.close(); current = open(); return current; } };
}
function denied(r: DurableMockReceipt, reason?: string) { expect(r.outcome).toBe("MOCK_DURABLE_DENIED"); if (reason) expect(r.reason).toBe(reason);
  expect(r.recovery).toBe("NOT_COMMITTED"); expect(r.executionAuthority).toBe(false); }
function faultRollback(point: DurableFault, publication = false) {
  const h = harness(); if (publication) h.start(); const op = publication ? h.pub() : h.admit(); const before = h.snapshot();
  h.s.owner.injectFailure(point); denied(h.attempt(op)); expect(h.snapshot()).toEqual(before);
  h.reopen(); expect(h.snapshot()).toEqual(before); expect(h.attempt(op).outcome).toBe("MOCK_DURABLE_RECORDED");
}
function gate() { let release!: () => void; const wait = new Promise<void>(r => { release = r; }); return { wait, release }; }

describe("R9 transaction correctness", () => {
  it("R9T01 valid transaction persists consumption operation and journal together", () => {
    const h = harness(); const r = h.start(); expect(r).toMatchObject({ transactionRevision: 1, executionAuthority: false, binding: { authorityGeneration: 1, authorizationRevision: 1, incarnationId: "fake-incarnation:1" } });
    const s = h.snapshot(); expect(s.projection.capabilities[0]).toMatchObject({ consumed: true, uses: 1 }); expect(s.acceptedOperations).toHaveLength(1);
    const db = h.raw(); expect(db.prepare("SELECT count(*) AS n FROM single_use_claims").get()?.n).toBe(1); expect(db.prepare("SELECT count(*) AS n FROM journal").get()?.n).toBe(1);
  });
  it("R9T02 failed capability validation makes no write", () => {
    const h = harness(); const before = h.snapshot(); denied(h.s.boundary.attemptDurableMockOperation(h.admit(), { ...h.cap() }), "CAPABILITY_REFERENCE_INVALID"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T03 failed actual R5 operation validation makes no write", () => {
    const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") (op.request as AdmissionRequest).workerType = "unknown";
    const before = h.snapshot(); denied(h.attempt(op)); expect(h.snapshot()).toEqual(before);
  });
  it("R9T04 rollback after capability update survives reopen", () => faultRollback("AFTER_CAPABILITY_UPDATE"));
  it("R9T05 rollback before operation insertion preserves single-use claim", () => faultRollback("BEFORE_OPERATION_INSERT"));
  it("R9T06 actual SQL constraint violation rolls back every table", () => {
    faultRollback("CONSTRAINT"); const h = harness(); const db = h.raw(); db.exec("BEGIN IMMEDIATE");
    expect(() => db.prepare("INSERT INTO accepted_operations VALUES('forged','forged','mock-capability:1','{}','{}',1)").run()).toThrow("MOCK_CLAIM_REQUIRED");
    db.exec("ROLLBACK"); expect(h.snapshot().acceptedOperations).toEqual([]);
  });
  it("R9T07 single-use duplicate with new operation identity denies", () => {
    const h = harness(); h.start(); const before = h.snapshot(); denied(h.attempt(h.admit("other")), "CAPABILITY_ALREADY_CONSUMED"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T08 exact idempotent retry returns recorded receipt without second effect", () => {
    const h = harness(); const op = h.admit(); const first = h.attempt(op); const before = h.snapshot(); const retry = h.attempt(op);
    expect(retry).toMatchObject({ ...first, outcome: "MOCK_DURABLE_ALREADY_RECORDED", recovery: "LOOKUP_COMMITTED" }); expect(h.snapshot()).toEqual(before);
  });
  it("R9T09 conflicting idempotency key denies", () => {
    const h = harness(); h.start(); const before = h.snapshot(); denied(h.attempt(h.admit("other", "admit-a")), "IDEMPOTENCY_CONFLICT"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T10 missing authority record denies after persisted deletion", () => {
    const h = harness(); expect(h.change({ kind: "DELETE_RECORD" }).outcome).toBe("MOCK_DURABLE_CONTROL_RECORDED"); h.reopen(); denied(h.attempt(h.admit()), "AUTHORITY_RECORD_MISSING");
  });
});
describe("R9 restart recovery", () => {
  it("R9T11 committed data is observable after close and reopen", () => { const h = harness(); h.start(); const s = h.snapshot(); h.reopen(); expect(h.snapshot()).toEqual(s); });
  it("R9T12 rolled-back data remains absent after reopen", () => faultRollback("BEFORE_COMMIT"));
  it("R9T13 consumed capability cannot replay after reopen", () => { const h = harness(); h.start(); h.reopen(); denied(h.attempt(h.admit("new")), "CAPABILITY_ALREADY_CONSUMED"); });
  it("R9T14 unused capability remains usable after reopen", () => { const h = harness(); h.reopen(); expect(h.start().outcome).toBe("MOCK_DURABLE_RECORDED"); });
  it("R9T15 lost acknowledgment resolves by exact committed lookup after reopen", () => {
    const h = harness(); const op = h.admit(); h.s.owner.injectFailure("LOST_ACK"); const r = h.attempt(op);
    expect(r).toMatchObject({ outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN", executionAuthority: false });
    h.reopen(); expect(h.attempt(op)).toMatchObject({ outcome: "MOCK_DURABLE_ALREADY_RECORDED", transactionRevision: 1 }); expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T16 precommit failure retry succeeds after reopen", () => faultRollback("AFTER_OPERATION_INSERT"));
  it("R9T17 accepted operation ordering and output sequence recover", () => {
    const h = harness(true); h.start(); h.attempt(h.pub()); h.attempt(h.pub("pub-b", { ...h.f.output, outputId: "event-b", sequence: 2 }));
    h.reopen(); const s = h.snapshot(); expect(s.acceptedOperations.map(o => o.revision)).toEqual([1, 2, 3]);
    expect(s.projection.authority.active!.fixture!.sequence).toMatchObject({ lastAccepted: 2, seenOutputIds: ["event-a", "event-b"] });
  });
  it("R9T18 inconsistent persisted operation record fails recovery", () => {
    const h = harness(); h.start(); h.s.boundary.close(); h.raw().prepare("UPDATE accepted_operations SET receipt='{}'").run();
    expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T19 stale incarnation after reopen denies", () => { const h = harness(); h.change({ kind: "REINCARNATE_RUN", fixture: h.f.mock }); h.reopen(); denied(h.attempt(h.admit()), "INCARNATION_MISMATCH"); });
  it("R9T20 stale authority generation after reopen denies", () => {
    const h = harness(); h.change({ kind: "RESET_AUTHORITY" }); h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock }); h.reopen(); denied(h.attempt(h.admit()), "AUTHORITY_MISMATCH");
  });
});
describe("R9 scoped security", () => {
  it("R9T21 persisted ACTIVE security stop denies and remains latched", () => {
    const h = harness(); h.change({ kind: "ACTIVATE_SECURITY_STOP" }); h.reopen(); denied(h.attempt(h.admit()), "SECURITY_STOP_ACTIVE");
    h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock }); denied(h.attempt(h.admit()), "SECURITY_STOP_ACTIVE");
  });
  it("R9T22 UNKNOWN security state denies", () => {
    const h = harness(); const f = structuredClone(h.f.mock); f.context.securityStop = { state: "UNKNOWN", clearance: null };
    h.change({ kind: "RECREATE_RECORD", fixture: f }); h.reopen(); denied(h.attempt(h.admit()), "SECURITY_STOP_UNKNOWN");
  });
  it("R9T23 revoked capability remains revoked after reopen", () => {
    const h = harness(); h.control({ kind: "CAPABILITY", capabilityId: "mock-capability:1" }); h.reopen(); denied(h.attempt(h.admit()), "AUTHORIZATION_REVOKED");
  });
  it("R9T24 expired capability denies", () => { const h = harness(); h.change({ kind: "ADVANCE_TIME", nowMs: 190 }); h.reopen(); denied(h.attempt(h.admit()), "AUTHORIZATION_EXPIRED"); });
  it("R9T25 wrong action denies", () => { const h = harness(); denied(h.attempt({ ...h.admit(), action: PUB }), "ACTION_NOT_ALLOWED"); });
  it("R9T26 wrong task denies", () => { const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") (op.request as AdmissionRequest).identity.taskScope = "other-task"; denied(h.attempt(op), "TASK_SCOPE_MISMATCH"); });
  it("R9T27 wrong destination denies", () => { const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") op.destinationId = "panel-a-extra"; denied(h.attempt(op), "DESTINATION_SCOPE_MISMATCH"); });
  it("R9T28 cross-project access denies", () => { const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") (op.request as AdmissionRequest).identity.projectId = "22222222-2222-4222-8222-222222222222"; denied(h.attempt(op), "OWNERSHIP_CONFLICT"); });
  it("R9T29 cross-session access denies", () => { const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") (op.request as AdmissionRequest).identity.sessionId = "session-b"; denied(h.attempt(op), "OWNERSHIP_CONFLICT"); });
  it("R9T30 wrong epoch denies", () => { const h = harness(); const op = h.admit(); if (op.kind === "ADMISSION") (op.request as AdmissionRequest).epoch = 1; denied(h.attempt(op), "EPOCH_STALE"); });
});
describe("R9 independent SQLite connections and ordered contenders", () => {
  it("R9T31 two consumers cannot claim one single-use capability", async () => {
    const h = harness(); const second = h.open(); const a = h.admit(); const b = { ...a, operationId: "b", idempotencyKey: "b" }; const c = second.owner.resumeCapabilityReference("mock-capability:1");
    const g = gate(); const pending = g.wait.then(() => second.boundary.attemptDurableMockOperation(b, c));
    expect(h.attempt(a).outcome).toBe("MOCK_DURABLE_RECORDED"); g.release(); denied(await pending, "STALE_STORE_REVISION");
    denied(second.boundary.attemptDurableMockOperation({ ...b, expectedRevision: 1 }, c), "CAPABILITY_ALREADY_CONSUMED");
    expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T32 duplicate idempotency key across clients returns one result", () => {
    const h = harness(); const second = h.open(); const op = h.admit(); const c = second.owner.resumeCapabilityReference("mock-capability:1");
    h.attempt(op); expect(second.boundary.attemptDurableMockOperation(op, c).outcome).toBe("MOCK_DURABLE_ALREADY_RECORDED"); expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T33 conflicting parameters across clients deny key reuse", () => {
    const h = harness(); const second = h.open(); const op = h.admit(); const c = second.owner.resumeCapabilityReference("mock-capability:1"); h.attempt(op);
    denied(second.boundary.attemptDurableMockOperation({ ...op, destinationId: "other" }, c), "IDEMPOTENCY_CONFLICT");
  });
  it("R9T34 publication sequence conflict cannot consume another capability", () => {
    const h = harness(); h.start(); h.attempt(h.pub()); const before = h.snapshot();
    denied(h.attempt(h.pub("other", { ...h.f.output, outputId: "other-event" }), 3)); expect(h.snapshot()).toEqual(before);
  });
  it("R9T35 revocation before competing consumer denies across connections", () => {
    const h = harness(); const second = h.open(); const c = second.owner.resumeCapabilityReference("mock-capability:1"); const op = h.admit();
    h.control({ kind: "CAPABILITY", capabilityId: "mock-capability:1" }); denied(second.boundary.attemptDurableMockOperation(op, c), "STALE_STORE_REVISION");
    denied(second.boundary.attemptDurableMockOperation({ ...op, expectedRevision: 1 }, c), "AUTHORIZATION_REVOKED");
  });
  it("R9T36 cancellation before competing publication denies", () => {
    const h = harness(); h.start(); const second = h.open(); const c = second.owner.resumeCapabilityReference("mock-capability:2"); const op = h.pub();
    h.change({ kind: "CANCEL" }); denied(second.boundary.attemptDurableMockOperation(op, c), "STALE_STORE_REVISION");
    denied(second.boundary.attemptDurableMockOperation({ ...op, expectedRevision: 2 }, c)); expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T37 stale persisted store revision rejects", () => {
    const h = harness(); const op = h.admit(); h.change({ kind: "ADVANCE_TIME", nowMs: 151 }); const before = h.snapshot(); denied(h.attempt(op), "STALE_STORE_REVISION"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T38 actual independent writer lock fails closed without process mutex", () => {
    const h = harness(); const second = h.open(); const op = h.admit(); const c = second.owner.resumeCapabilityReference("mock-capability:1"); const db = h.raw();
    db.exec("BEGIN IMMEDIATE"); denied(second.boundary.attemptDurableMockOperation(op, c), "STORE_BUSY"); db.exec("ROLLBACK");
    expect(second.boundary.attemptDurableMockOperation(op, c).outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T39 another reader cannot see uncommitted capability change", () => {
    const h = harness(); const second = h.open(); const before = second.boundary.snapshot(); const db = h.raw(); db.exec("BEGIN IMMEDIATE");
    db.exec("UPDATE capabilities SET used_count=1,consumed=1 WHERE capability_id='mock-capability:1'");
    expect(second.boundary.snapshot()).toEqual(before); db.exec("ROLLBACK"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T40 independent transactions succeed in database order", () => {
    const h = harness(); const second = h.open(); h.start(); const op = h.pub(); const c = second.owner.resumeCapabilityReference("mock-capability:2");
    expect(second.boundary.attemptDurableMockOperation(op, c).outcome).toBe("MOCK_DURABLE_RECORDED"); expect(h.snapshot().acceptedOperations.map(o => o.revision)).toEqual([1, 2]);
  });
});
describe("R9 deterministic persistence faults", () => {
  it("R9T41 failure before first write rolls back", () => faultRollback("BEFORE_FIRST_WRITE"));
  it("R9T42 failure after publication capability update rolls back", () => faultRollback("AFTER_CAPABILITY_UPDATE", true));
  it("R9T43 failure after accepted insertion rolls back", () => faultRollback("AFTER_OPERATION_INSERT", true));
  it("R9T44 failure before COMMIT rolls back complete draft", () => faultRollback("BEFORE_COMMIT", true));
  it("R9T45 simulated lost acknowledgment reports ambiguity not false failure", () => {
    const h = harness(); h.s.owner.injectFailure("LOST_ACK"); const op = h.admit(); const r = h.attempt(op);
    expect(r.outcome).toBe("MOCK_DURABLE_AMBIGUOUS"); expect(h.attempt(op).outcome).toBe("MOCK_DURABLE_ALREADY_RECORDED"); expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T46 simulated storage read error fails closed", () => {
    const h = harness(); const op = h.admit(); const c = h.cap(); const before = h.snapshot(); h.s.owner.injectFailure("STORAGE_READ");
    denied(h.s.boundary.attemptDurableMockOperation(op, c), "INJECTED_STORAGE_READ"); expect(h.snapshot()).toEqual(before);
  });
  it("R9T47 simulated storage write error fails closed", () => faultRollback("STORAGE_WRITE"));
  it("R9T48 corrupted fixture record blocks new writes", () => {
    const h = harness(); const op = h.admit(); const c = h.cap(); h.raw().prepare("UPDATE meta SET projection='{}'").run();
    denied(h.s.boundary.attemptDurableMockOperation(op, c), "RECOVERY_INVALID"); expect(h.raw().prepare("SELECT count(*) AS n FROM accepted_operations").get()?.n).toBe(0);
  });
  it("R9T49 failed recovery validation prevents opening store", () => {
    const h = harness(); h.s.boundary.close(); h.raw().exec("PRAGMA user_version=99"); expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T50 safe retry succeeds after bounded recoverable fault", () => faultRollback("AFTER_VALIDATION"));
});
describe("R9 foundation and execution boundaries", () => {
  it("R9T51 actual R5 predicate remains eligible only", () => {
    const f = fixture(); expect(evaluateWorkerAdmission(f.request, f.mock.context, f.mock.policy)).toMatchObject({ outcome: "ELIGIBLE_FOR_ADMISSION", executionAuthority: false });
  });
  it("R9T52 actual R6 admission still uses private in-memory state", () => {
    const f = fixture(); const b = createMockEnforcementBoundary(f.mock); expect(b.boundary.attemptMockAdmission({ operationId: "a", expectedStateVersion: 0, request: f.request }).outcome).toBe("MOCK_ADMISSION_RECORDED");
  });
  it("R9T53 actual R7 provenance still rejects cloned reference", () => {
    const f = fixture(); const r = createFakeAuthorityAdapter(f.seed); expect(r.adapter.attemptAuthorityBackedMockAdmission({ operationId: "a", request: f.request }, { ...r.owner.issueEvidence() }).outcome).toBe("MOCK_AUTHORITY_DENIED");
  });
  it("R9T54 actual R8 admission scope does not authorize publication", () => {
    const f = fixture(); const r = createScopedCapabilityBoundary(f.seed); const grant = { allowedActions: [ADMIT], taskScope: "review", destinationScope: "panel-a", expiresAtMs: 190, usagePolicy: "SINGLE_USE" };
    const c = r.owner.issueCapability(grant); expect(c.outcome).toBe("MOCK_CAPABILITY_ISSUED"); if (c.outcome !== "MOCK_CAPABILITY_ISSUED") throw new Error("fixture");
    expect(r.boundary.attemptScopedPublication({ operationId: "a", action: PUB, output: f.output }, c.capability).reason).toBe("ACTION_NOT_ALLOWED");
  });
  it("R9T55 persistence transaction does not spawn workers", () => {
    const h = harness(); const op = h.admit(); const c = h.cap(); const spy = vi.spyOn(childProcess, "spawn").mockImplementation(() => { throw new Error("No workers"); });
    let r: DurableMockReceipt; try { r = h.s.boundary.attemptDurableMockOperation(op, c); } finally { spy.mockRestore(); }
    expect(r.outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T56 publication is metadata inside isolated SQLite only", () => {
    const h = harness(); h.start(); const op = h.pub(); const c = h.cap(2); const spy = vi.spyOn(globalThis, "fetch").mockImplementation(() => { throw new Error("No delivery"); });
    let r: DurableMockReceipt; try { r = h.s.boundary.attemptDurableMockOperation(op, c); } finally { spy.mockRestore(); }
    expect(r.outcome).toBe("MOCK_DURABLE_RECORDED"); expect(durableMockFixtureFilename(h.ref).startsWith(root.root)).toBe(true);
  });
  it("R9T57 module has no production credential or environment import", () => {
    const source = fs.readFileSync(new URL("../../src/contracts/testing/durable-mock-transaction.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/process\.env|\.\.\/\.\.\/server|from .*credential|node:child_process|node:net|node:http/);
    expect(harness().s.boundary).not.toHaveProperty("owner");
  });
  it("R9T58 no network access occurs during transaction", () => {
    const h = harness(); const op = h.admit(); const c = h.cap(); const spy = vi.spyOn(net, "connect").mockImplementation(() => { throw new Error("No network"); });
    let r: DurableMockReceipt; try { r = h.s.boundary.attemptDurableMockOperation(op, c); } finally { spy.mockRestore(); } expect(r.outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T59 production code has no R9 import or Jc interaction", () => {
    const hits: string[] = []; const files = fs.readdirSync(new URL("../../src/", import.meta.url), { recursive: true, withFileTypes: true });
    for (const f of files) { if (!f.isFile() || !/\.[cm]?[jt]sx?$/.test(f.name)) continue; const p = `${f.parentPath}/${f.name}`;
      if (!p.replaceAll("\\", "/").includes("/contracts/testing/") && fs.readFileSync(p, "utf8").includes("durable-mock-transaction")) hits.push(p); }
    expect(hits).toEqual([]);
    const src = fs.readFileSync(new URL("../../src/contracts/testing/durable-mock-transaction.ts", import.meta.url), "utf8"); expect(src).not.toMatch(/JobObject|taskkill|Get-Process|OpenProcess|24956/);
  });
  it("R9T60 success denial duplicate and ambiguity all retain false execution authority", () => {
    const h = harness(); const op = h.admit(); const r = h.attempt(op); const dup = h.attempt(op); const deny = h.attempt(h.admit("other")); h.s.owner.injectFailure("LOST_ACK"); const ambiguous = h.attempt(h.pub());
    expect([r, dup, deny, ambiguous].map(x => x.executionAuthority)).toEqual([false, false, false, false]);
    expect(h.snapshot().acceptedOperations.every(x => x.receipt.executionAuthority === false)).toBe(true);
  });
});
describe("R9 recovery and authority adversarial cases", () => {
  it.each(["BEFORE_BEGIN", "AFTER_BEGIN"] as const)("R9T61 %s fault leaves unused capability after reopen", point => faultRollback(point));
  it.each(["INVALID", "UNKNOWN"] as const)("R9T62 synthetic %s security state cannot grant acceptance", state => {
    const h = harness(); const f = structuredClone(h.f.mock); f.context.securityStop = { state, clearance: null }; h.change({ kind: "RECREATE_RECORD", fixture: f }); denied(h.attempt(h.admit()), "SECURITY_STOP_UNKNOWN");
  });
  it("R9T63 missing security status corrupts recovery rather than clears stop", () => {
    const h = harness(); const c = h.cap(); const op = h.admit(); const db = h.raw(); const row = db.prepare("SELECT seed FROM meta").get()!;
    const seed = JSON.parse(String(row.seed)) as { fixture: { context: { securityStop?: unknown } } }; delete seed.fixture.context.securityStop;
    db.prepare("UPDATE meta SET seed=?").run(JSON.stringify(seed)); denied(h.s.boundary.attemptDurableMockOperation(op, c));
  });
  it("R9T64 policy revision survives reopen and rejects old grant", () => { const h = harness(); h.change({ kind: "REVISE_POLICY", policyVersion: "v2" }); h.reopen(); denied(h.attempt(h.admit()), "POLICY_VERSION_STALE"); });
  it("R9T65 equal policy label with newer auth revision denies", () => { const h = harness(); h.change({ kind: "REVISE_POLICY", policyVersion: "v1" }); h.reopen(); denied(h.attempt(h.admit()), "AUTHORIZATION_REVISION_MISMATCH"); });
  it.each(["TASK", "DESTINATION", "ACTION"] as const)("R9T66 %s revocation persists across clients and reopen", kind => {
    const h = harness(); h.control({ kind, value: kind === "TASK" ? "review" : kind === "DESTINATION" ? "panel-a" : ADMIT }); h.reopen(); denied(h.attempt(h.admit()));
  });
  it("R9T67 acceptance before revoke remains historical result without new authority", () => {
    const h = harness(); const op = h.admit(); h.attempt(op); h.control({ kind: "CAPABILITY", capabilityId: "mock-capability:1" }); h.reopen();
    expect(h.attempt(op).outcome).toBe("MOCK_DURABLE_ALREADY_RECORDED"); denied(h.attempt(h.admit("new")), "AUTHORIZATION_REVOKED"); expect(h.snapshot().acceptedOperations).toHaveLength(1);
  });
  it("R9T68 rollback cannot leave consumed capability without operation", () => {
    const h = harness(); const db = h.raw(); db.exec("BEGIN IMMEDIATE; UPDATE capabilities SET used_count=1,consumed=1 WHERE capability_id='mock-capability:1'; ROLLBACK");
    h.reopen(); expect(h.snapshot().projection.capabilities[0]!.consumed).toBe(false); expect(h.start().outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T69 committed inconsistent claim record is rejected on reopen", () => {
    const h = harness(); h.start(); h.s.boundary.close(); h.raw().exec("DELETE FROM single_use_claims"); expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T70 old instance and serialized references cannot resume authority", () => {
    const h = harness(); const c = h.cap(); h.reopen(); denied(h.s.boundary.attemptDurableMockOperation(h.admit(), c), "CAPABILITY_REFERENCE_INVALID");
    denied(h.s.boundary.attemptDurableMockOperation(h.admit(), JSON.parse(JSON.stringify(h.cap()))), "CAPABILITY_REFERENCE_INVALID");
  });
  it("R9T71 foreign store reference with matching public flags denies", () => { const h = harness(); const other = harness(); denied(h.s.boundary.attemptDurableMockOperation(h.admit(), other.cap()), "CAPABILITY_REFERENCE_INVALID"); });
  it("R9T72 forged fixture path cannot open a production or arbitrary database", () => { const h = harness(); expect(() => openDurableMockTransaction({ ...h.ref, root: "D:\\Rajendra\\AI-Projects\\AI-Office" })).toThrow(); });
  it("R9T73 persisted snapshot mutation is only a defensive copy", () => { const h = harness(); const s = h.snapshot(); s.projection.capabilities[0]!.consumed = true; expect(h.start().outcome).toBe("MOCK_DURABLE_RECORDED"); });
  it("R9T74 malformed ingress getter cannot execute inside transaction", () => {
    const h = harness(); const c = h.cap(); let invoked = false; const op = { ...h.admit(), get action() { invoked = true; throw new Error("SECRET_SENTINEL"); } };
    const r = h.s.boundary.attemptDurableMockOperation(op, c); denied(r, "INVALID_OPERATION"); expect(invoked).toBe(false); expect(JSON.stringify(r)).not.toContain("SECRET_SENTINEL");
  });
  it("R9T75 reuse key with another capability denies even identical task", () => {
    const h = harness(); h.start(); const op = h.pub(); h.attempt(op, 2); denied(h.attempt(op, 3), "IDEMPOTENCY_CONFLICT");
  });
  it("R9T76 storage schema tampering blocks recovery", () => { const h = harness(); h.s.boundary.close(); h.raw().exec("DROP TRIGGER require_claim"); expect(() => h.open()).toThrow("RECOVERY_INVALID"); });
  it("R9T77 persisted false execution authority is checked during recovery", () => {
    const h = harness(); h.start(); h.s.boundary.close(); h.raw().exec("UPDATE accepted_operations SET receipt=replace(receipt,'\"executionAuthority\":false','\"executionAuthority\":true')"); expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T78 security stop cannot be cleared by fresh fixture command", () => {
    const h = harness(); h.change({ kind: "ACTIVATE_SECURITY_STOP" }); h.change({ kind: "RESET_AUTHORITY" }); h.change({ kind: "RECREATE_RECORD", fixture: h.f.mock }); h.reopen();
    expect(h.snapshot().projection.current.securityStop).toBe("ACTIVE"); denied(h.attempt(h.admit()), "SECURITY_STOP_ACTIVE");
  });
  it("R9T79 injected recovery validation fails inspection without pretending acceptance", () => {
    const h = harness(); h.s.owner.injectFailure("RECOVERY_VALIDATION"); expect(() => h.snapshot()).toThrow("RECOVERY_INVALID"); expect(h.snapshot().acceptedOperations).toEqual([]);
  });
  it("R9T80 closed store fails closed and cannot resume references", () => {
    const h = harness(); const c = h.cap(); const op = h.admit(); h.s.boundary.close(); denied(h.s.boundary.attemptDurableMockOperation(op, c), "STORE_CLOSED"); expect(() => h.cap()).toThrow("STORE_CLOSED");
  });
  it("R9T81 actual COMMIT busy error rolls back before successful retry", () => {
    const h = harness(); const op = h.admit(); const c = h.cap(); const before = h.snapshot(); const reader = h.raw();
    reader.exec("BEGIN"); reader.prepare("SELECT * FROM meta").get(); // retain a real SQLite SHARED reader lock
    denied(h.s.boundary.attemptDurableMockOperation(op, c), "STORE_BUSY"); reader.exec("ROLLBACK");
    expect(h.snapshot()).toEqual(before); expect(h.s.boundary.attemptDurableMockOperation(op, c).outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T82 close with an uncommitted draft recovers only committed data", () => {
    const h = harness(); const before = h.snapshot(); const db = h.raw();
    db.exec("BEGIN IMMEDIATE; UPDATE capabilities SET used_count=1,consumed=1 WHERE capability_id='mock-capability:1'"); db.close();
    h.reopen(); expect(h.snapshot()).toEqual(before); expect(h.start().outcome).toBe("MOCK_DURABLE_RECORDED");
  });
  it("R9T83 restored stale projection is inconsistent with committed journal", () => {
    const h = harness(); const db = h.raw(); const old = db.prepare("SELECT projection FROM meta").get()!.projection;
    h.start(); h.s.boundary.close(); db.prepare("UPDATE meta SET projection=?").run(String(old)); expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T84 stale revision restored alone cannot authorize after restart", () => {
    const h = harness(); h.change({ kind: "REVISE_POLICY", policyVersion: "v1" }); h.s.boundary.close(); h.raw().exec("UPDATE meta SET revision=0");
    expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T85 truncated journal with surviving accepted operation fails recovery", () => {
    const h = harness(); h.start(); h.s.boundary.close(); const db = h.raw(); db.exec("PRAGMA foreign_keys=OFF; DELETE FROM journal; PRAGMA foreign_keys=ON");
    expect(() => h.open()).toThrow("RECOVERY_INVALID");
  });
  it("R9T86 missing stop status in request cannot bypass canonical authority", () => {
    const h = harness(); h.change({ kind: "ACTIVATE_SECURITY_STOP" }); const op = h.admit();
    denied(h.s.boundary.attemptDurableMockOperation({ ...op, securityStop: { state: "CLEARED" } }, h.cap()), "INVALID_OPERATION");
    denied(h.attempt(op), "SECURITY_STOP_ACTIVE");
  });
  it("R9T87 duplicate operation ID with different key cannot consume new grant", () => {
    const h = harness(); h.start(); h.attempt(h.pub()); const before = h.snapshot();
    denied(h.attempt(h.pub("publish-a", { ...h.f.output, outputId: "event-b", sequence: 2 }, "different-key"), 3)); expect(h.snapshot()).toEqual(before);
  });
});
