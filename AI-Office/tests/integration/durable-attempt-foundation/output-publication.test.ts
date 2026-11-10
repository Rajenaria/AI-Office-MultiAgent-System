import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackendHost } from "../../../src/server/host.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { createIdentity } from "../../../src/server/workspace/identity.js";
import { validateRoot } from "../../../src/server/workspace/paths.js";
import { createOutputPublicationBoundary, denyOutputPublication, type PublicationDenial } from "../../../src/server/attempt-control/output-publication.js";
import { createHostPrincipalBoundary } from "../../../src/server/attempt-control/host-principal.js";
import { SyntheticSecurityHarness, type ProbeResult } from "../../../src/server/runtime-security/supervisor.js";
import { AttemptDescriptorSchema, type AttemptContext } from "../../../src/server/runtime-security/context.js";
import { openTestConnection } from "../../../src/server/attempt-control/test-storage.js";
import { evaluateOutputPublication, type OutputEnvelope, type PublicationContext, type SecurityPolicy } from "../../../src/contracts/execution-fence.js";
import { evidence, expected, fixture, issueCommand, own, root, transitionCommand } from "./helpers.js";

const hosts: Awaited<ReturnType<typeof composeBackendHost>>[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const h of hosts.splice(0).reverse()) await h.close(); });
function denied(d: PublicationDenial) {
  expect(d).toMatchObject({ accepted: false, publicationAuthority: false, executionAuthority: false, reasonCode: "PUBLICATION_NOT_AUTHORIZED" });
  expect(Object.isFrozen(d)).toBe(true);
  expect(Object.keys(d).sort()).toEqual(["accepted", "publicationAuthority", "executionAuthority", "reasonCode", "correlationId"].sort());
  expect(d.correlationId).toMatch(/^[0-9a-f-]{36}$/);
}
async function hostFixture(storage = false) {
  const base = path.join(root.root, "pi09b-" + randomUUID()), dataRoot = path.join(base, "registry"), project = path.join(base, "project"), storageRoot = path.join(base, "storage");
  for (const p of [base, dataRoot, project, storageRoot]) fs.mkdirSync(p);
  const projectId = randomUUID(), storageId = randomUUID();
  if (storage) {
    const registry = await ProjectRegistry.acquire(dataRoot), canonical = await validateRoot(project);
    try {
      const identity = { schemaVersion: 1 as const, projectId, createdAt: "2026-11-10T00:00:00.000Z" };
      await createIdentity(canonical, identity);
      await registry.put({ identity, canonicalPath: canonical.canonicalPath, fileKey: canonical.fileKey, status: "IDENTITY_ATTACHED" });
    } finally { await registry.close(); }
  }
  const host = await composeBackendHost({ dataRoot, ...(storage ? { hostSQLite: { providerKind: "HOST_SQLITE" as const,
    providerId: randomUUID(), storageRoot, bindings: [{ projectId, workspaceRoot: project, storageId,
      authorityIncarnation: randomUUID(), initializationPolicy: "CREATE_NEW" as const }] } } : {}) });
  hosts.push(host);
  let scope: unknown;
  if (storage) {
    const opened = await host.manager.open({ path: project, expectedGeneration: 0 });
    if (!("binding" in opened.view)) throw new Error("Fixture workspace attachment required");
    scope = { projectId, binding: opened.view.binding };
  }
  evidence("pi09b-host", { base, dataRoot, project, storageRoot });
  return { host, project, storageRoot, scope };
}
function context(): AttemptContext {
  return AttemptDescriptorSchema.parse({ projectId: randomUUID(), workspaceBindingId: "workspace:fixture", taskId: "task:fixture",
    attemptId: randomUUID(), attemptGeneration: 1, policyRef: "policy:fixture", projectRoot: root.root, projectFileKey: "1:1",
    readScope: ["read"], writeScope: ["work"], operations: ["PROBE"], createdAt: "2026-11-10T00:00:00.000Z",
    expiresAt: "2026-11-10T00:01:00.000Z", source: "synthetic-security-test" });
}
function harness(publication?: unknown) {
  // Actual constructor and finish/capture/cancel methods, in-process DI only.
  // No create(), hashProbe(), historical journal opener, child, PID lookup or timer.
  const authority = { assert: vi.fn(async () => { throw new Error("NO_AUTHORITY_IO"); }) };
  let phase = "RUNNING";
  const journal = { read: vi.fn(async () => ({ phase })), transition: vi.fn(async (_id: string, next: string) => { phase = next; return { phase }; }),
    close: vi.fn(async () => undefined) };
  const h = Reflect.construct(SyntheticSecurityHarness, [authority, journal, "unused", undefined, undefined, publication]) as SyntheticSecurityHarness;
  const internals = h as unknown as { capture(run: unknown, channel: "stdout" | "stderr", bytes: Buffer): void;
    finish(run: unknown, code: number | null, signal: NodeJS.Signals | null): Promise<void>;
    contexts: Map<string, AttemptContext> };
  const c = context(), resolve = vi.fn();
  const run = { context: c, child: { connected: false, send: vi.fn(), kill: vi.fn() }, nonce: randomUUID(), pid: null,
    ready: true, closed: true, cancelled: false, cancellationAck: false, completed: true, forced: false, startupFailed: false,
    stdout: Buffer.from("SYNTHETIC_PRIVATE_STDOUT"), stderr: Buffer.from("SYNTHETIC_PRIVATE_STDERR"), truncated: false,
    descendants: new Set<number>(), messages: [{ type: "completed", nonce: randomUUID(), pid: 1, environmentKeys: ["SYNTHETIC_DIAGNOSTIC"], canaryReadable: true }],
    resolve, reject: vi.fn() };
  return { h, internals, journal, run, resolve, c, setPhase(value: string) { phase = value; } };
}
// Pure controlled supplied-data fixture only. Never supplied to a real repository or identity issuer.
function contractFixture() {
  const identity = { projectId: "11111111-1111-4111-8111-111111111111", sessionId: "session-a", ownerId: "owner-a",
    runId: "run-a", workerId: "worker-a", taskScope: "review" };
  const proof = { evidenceId: "dummy-proof", identity: { ...identity }, epoch: 2, policyVersion: "v1", issuedAtMs: 100, expiresAtMs: 200 };
  const output: OutputEnvelope = { outputId: "output-a", identity: { ...identity }, epoch: 2, policyVersion: "v1",
    destinationId: "panel-a", channel: "text", classification: "INTERNAL", sequence: 4 };
  const current: PublicationContext = { identity: { ...identity }, epoch: 2, policyVersion: "v1", nowMs: 150, lifecycle: "RUNNING", cancellation: "CLEAR",
    authorization: { status: "VERIFIED", evidence: structuredClone(proof) }, securityStop: { state: "CLEARED", clearance: structuredClone(proof) },
    destinationId: "panel-a", sequence: { min: 1, max: 10, lastAccepted: 3, seenOutputIds: [] } };
  const policy: SecurityPolicy = { policyId: "policy-a", version: "v1", status: "ACTIVE", validFromMs: 100, expiresAtMs: 200,
    scope: { projectId: identity.projectId, sessionId: identity.sessionId, ownerId: identity.ownerId },
    admission: { enabled: false, workerTypes: [], taskScopes: [] }, providers: [],
    publication: { enabled: true, sequenceRequired: true, destinations: [{ destinationId: "panel-a", projectId: identity.projectId,
      sessionId: identity.sessionId, ownerId: identity.ownerId, channels: ["text"], classifications: ["INTERNAL"] }] } };
  return { output, current, policy };
}
type ContractFixture = ReturnType<typeof contractFixture>;

describe("PI09B host-owned publication denial", () => {
  it("P01 actual PI08 returns missing/source denial with safe owner-only audit", () => {
    const b = createOutputPublicationBoundary(createHostPrincipalBoundary().api);
    for (const e of [undefined, { authenticated: true }]) {
      const d = b.api.evaluate({}, e); denied(d);
      expect(b.inspectDenial(d)).toMatchObject({ reason: e ? "PUBLICATION_AUTHORITY_UNAVAILABLE" : "PUBLICATION_AUTHENTICATION_REQUIRED",
        outputContract: "NOT_EVALUATED", ownership: "NOT_EVALUATED", repository: "NOT_EVALUATED", sequence: "NOT_EVALUATED" });
      expect(b.inspectDenial({ ...d })).toBeNull();
    }
    expect(Object.keys(b.api)).toEqual(["evaluate"]);
  });
  it.each(["principalId", "authenticated", "projectId", "sessionId", "executionSession", "producerId", "runId", "incarnation",
    "epoch", "destinationId", "channel", "classification", "grant", "policy", "launcherCapability", "fixtureContext"])(
    "P02 forged %s never installs publication authority", field => {
      const b = createOutputPublicationBoundary(), input = Object.freeze({ [field]: true, payload: "SYNTHETIC_PRIVATE" });
      denied(b.api.evaluate(input, input)); expect(b.inspectDenial(b.api.evaluate(input, input))?.ownership).toBe("NOT_EVALUATED");
    });
  it("P03 no raw payload/accessor/serialization input reaches receipt or owner audit", () => {
    const touched = vi.fn(() => { throw new Error("SYNTHETIC_PRIVATE"); });
    const input = new Proxy({}, { get: touched, has: touched, ownKeys: touched });
    const b = createOutputPublicationBoundary(), d = b.api.evaluate(input, input); denied(d);
    expect(touched).not.toHaveBeenCalled();
    expect(JSON.stringify([d, b.inspectDenial(d)])).not.toContain("SYNTHETIC_PRIVATE");
  });
  it.each(["missing", "throw", "positive", "malformed", "accessor", "thenable"])("P04 %s dependency cannot authorize or leak", mode => {
    const then = vi.fn();
    const auth = mode === "missing" ? {} : { authenticate() {
      if (mode === "throw") throw new Error("SYNTHETIC_PRIVATE_PATH");
      if (mode === "positive") return { status: "AUTHENTICATED", authenticated: true, publicationAuthority: true };
      if (mode === "accessor") return new Proxy({}, { has() { throw new Error("SYNTHETIC_PRIVATE_PATH"); } });
      if (mode === "thenable") return { then };
      return null;
    } };
    const b = createOutputPublicationBoundary(auth as { authenticate(): unknown }), d = b.api.evaluate({}, {}); denied(d);
    expect(JSON.stringify([d, b.inspectDenial(d)])).not.toContain("SYNTHETIC_PRIVATE_PATH"); expect(then).not.toHaveBeenCalled();
  });
  it("P05 reentrant close/invalidation/cancellation while authenticating remains denial", () => {
    for (const action of ["close", "invalidate", "cancel"] as const) {
      const controller = new AbortController();
      const b = createOutputPublicationBoundary({ authenticate() { if (action === "cancel") controller.abort(); else b[action](); return {}; } });
      const d = b.api.evaluate({}, {}, controller.signal); denied(d);
      expect(b.inspectDenial(d)?.reason).toBe(action === "close" ? "PUBLICATION_CLOSED" : action === "invalidate" ? "PUBLICATION_INVALIDATED" : "OUTPUT_CANCELLED");
    }
  });
  it("P06 prior cancellation avoids authentication entirely", () => {
    const authenticate = vi.fn(), b = createOutputPublicationBoundary({ authenticate }), c = new AbortController(); c.abort();
    denied(b.api.evaluate({}, {}, c.signal)); expect(authenticate).not.toHaveBeenCalled();
  });
  it("P07 forged/copied/proxy boundary never invokes caller sink or evaluate", () => {
    const evaluate = vi.fn(() => ({ accepted: true })), real = createOutputPublicationBoundary();
    for (const fake of [undefined, { evaluate }, { ...real.api }, new Proxy(real.api, {})]) denied(denyOutputPublication(fake, {}, {}));
    expect(evaluate).not.toHaveBeenCalled();
  });
  it("P08 concurrent duplicate/retry receipts cannot consume or mutate caller sequence state", async () => {
    const f = contractFixture(), before = structuredClone(f), b = createOutputPublicationBoundary();
    const rows = await Promise.all(Array.from({ length: 32 }, async () => b.api.evaluate(f.output, {})));
    for (const d of rows) denied(d); expect(new Set(rows.map(r => r.correlationId)).size).toBe(32);
    denied(b.api.evaluate(f.output, {})); expect(f).toEqual(before);
  });
});

describe("PI09B actual fixture producer-to-consumer release", () => {
  it("F01 actual finish withholds raw stdout/stderr while resolving lifecycle metadata", async () => {
    const f = harness(), decodeOut = vi.spyOn(f.run.stdout, "toString"), decodeErr = vi.spyOn(f.run.stderr, "toString");
    await f.internals.finish(f.run, 0, null);
    expect(f.resolve).toHaveBeenCalledTimes(1);
    const r = f.resolve.mock.calls[0]![0] as ProbeResult;
    denied(r.publication); expect(r.stdout).toBe(""); expect(r.stderr).toBe(""); expect(r.record.phase).toBe("COMPLETED");
    expect(decodeOut).not.toHaveBeenCalled(); expect(decodeErr).not.toHaveBeenCalled();
    expect(JSON.stringify(r)).not.toMatch(/SYNTHETIC_PRIVATE|SYNTHETIC_DIAGNOSTIC/);
    expect(f.journal.transition).toHaveBeenCalledWith(f.c.attemptId, "COMPLETED", undefined, expect.any(Object));
  });
  it.each(["cancelled", "failed", "startupFailed", "uncertain"])("F02 %s finish keeps control result and denies text", async mode => {
    const f = harness(); f.run.completed = false;
    if (mode === "cancelled") { f.run.cancelled = true; f.run.cancellationAck = true; }
    if (mode === "startupFailed") f.run.startupFailed = true;
    await f.internals.finish(f.run, mode === "failed" ? 1 : 0, null);
    const r = f.resolve.mock.calls[0]![0] as ProbeResult; denied(r.publication); expect(r.stdout).toBe(""); expect(r.stderr).toBe("");
    expect(r.record.phase).toBe(mode === "cancelled" ? "INTERRUPTED" : mode === "failed" || mode === "startupFailed" ? "FAILED" : "RECONCILIATION_REQUIRED");
    expect(f.run.child.send).not.toHaveBeenCalled(); expect(f.run.child.kill).not.toHaveBeenCalled();
  });
  it("F03 actual capture remains bounded collection, not an authorized sink", async () => {
    const f = harness(); f.run.stdout = Buffer.alloc(0); f.run.stderr = Buffer.alloc(0); f.run.cancelled = true;
    f.internals.capture(f.run, "stdout", Buffer.alloc(5000, 65)); f.internals.capture(f.run, "stderr", Buffer.from("SYNTHETIC_PRIVATE"));
    expect(f.run.stdout.length).toBe(4096); expect(f.run.truncated).toBe(true);
    await f.internals.finish(f.run, 0, null); const r = f.resolve.mock.calls[0]![0] as ProbeResult;
    denied(r.publication); expect(r.stdout).toBe(""); expect(r.stderr).toBe(""); expect(r.outputTruncated).toBe(true);
  });
  it("F04 diagnostic payload fields are not touched or copied into minimal control messages", async () => {
    const f = harness(), payload = vi.fn(() => { throw new Error("SYNTHETIC_PRIVATE"); });
    Object.defineProperty(f.run.messages[0]!, "environmentKeys", { get: payload });
    Object.defineProperty(f.run.messages[0]!, "canaryReadable", { get: payload });
    await f.internals.finish(f.run, 0, null); const r = f.resolve.mock.calls[0]![0] as ProbeResult;
    expect(r.messages).toEqual([{ type: "completed", nonce: f.run.messages[0]!.nonce, pid: 1 }]);
    expect(payload).not.toHaveBeenCalled(); expect(Object.isFrozen(r.messages)).toBe(true); expect(Object.isFrozen(r.messages[0])).toBe(true);
  });
  it.each(["fake", "throw", "positive"])("F05 %s injected dependency cannot publish or suppress completion", async mode => {
    const evaluate = vi.fn(() => ({ accepted: true }));
    const b = createOutputPublicationBoundary({ authenticate() { if (mode === "throw") throw new Error("SYNTHETIC_PRIVATE"); return { status: "AUTHENTICATED" }; } });
    const f = harness(mode === "fake" ? { evaluate } : b.api); await f.internals.finish(f.run, 0, null);
    const r = f.resolve.mock.calls[0]![0] as ProbeResult; denied(r.publication); expect(r.stdout).toBe(""); expect(evaluate).not.toHaveBeenCalled();
  });
  it("F06 actual host-owned boundary is used by existing finish", async () => {
    const host = await hostFixture(), f = harness(host.host.publication);
    await host.host.close(); await f.internals.finish(f.run, 0, null);
    denied((f.resolve.mock.calls[0]![0] as ProbeResult).publication); expect(f.journal.transition).toHaveBeenCalled();
  });
  it("F07 cancel and close remain functional without output authorization", async () => {
    const f = harness({ evaluate() { throw new Error("MUST_NOT_GATE_CLEANUP"); } });
    f.setPhase("CREATED"); f.internals.contexts.set(f.c.attemptId, f.c);
    const revoke = vi.spyOn(f.h.approvals, "revoke");
    expect((await f.h.cancel(f.c)).phase).toBe("INTERRUPTED"); expect(revoke).toHaveBeenCalledWith(f.c);
    await f.h.close(); expect(f.journal.close).toHaveBeenCalledOnce(); expect(f.resolve).not.toHaveBeenCalled();
  });
});

describe("PI09B controlled R5 compatibility, not authenticated production validation", () => {
  it("R01 supplied-valid R5 envelope remains metadata eligibility and cannot authorize actual host", async () => {
    const f = contractFixture(), result = evaluateOutputPublication(f.output, f.current, f.policy);
    expect(result).toMatchObject({ outcome: "ELIGIBLE_FOR_PUBLICATION", executionAuthority: false });
    const host = await hostFixture(); denied(host.host.publication.evaluate(f.output, f.current));
  });
  const cases: [string, (f: ContractFixture) => void, string][] = [
    ["wrong project", f => { f.output.identity.projectId = randomUUID(); }, "OWNERSHIP_CONFLICT"],
    ["wrong session", f => { f.output.identity.sessionId = "other"; }, "OWNERSHIP_CONFLICT"],
    ["wrong run", f => { f.output.identity.runId = "other"; }, "RUN_CONFLICT"],
    ["wrong producer", f => { f.output.identity.workerId = "other"; }, "WORKER_CONFLICT"],
    ["stale epoch", f => { f.output.epoch = 1; }, "STALE_EPOCH"],
    ["wrong destination", f => { f.output.destinationId = "other"; }, "DESTINATION_DENIED"],
    ["wrong channel", f => { f.output.channel = "other"; }, "CHANNEL_DENIED"],
    ["confidentiality mismatch", f => { f.output.classification = "RESTRICTED"; }, "CONFIDENTIALITY_DENIED"],
    ["missing classification", f => { Reflect.deleteProperty(f.output, "classification"); }, "INVALID_OUTPUT"],
    ["unsupported classification", f => { Reflect.set(f.output, "classification", "UNKNOWN"); }, "INVALID_OUTPUT"],
    ["unverified public marker", f => { f.output.classification = "PUBLIC"; }, "CONFIDENTIALITY_DENIED"],
    ["cancelled", f => { f.current.cancellation = "REQUESTED"; }, "CANCELLED"],
    ["terminal", f => { f.current.lifecycle = "COMPLETED"; }, "TERMINAL"],
    ["security stop", f => { f.current.securityStop.state = "ACTIVE"; }, "SECURITY_STOP_ACTIVE"],
    ["unknown security", f => { f.current.securityStop.state = "UNKNOWN"; }, "SECURITY_STOP_UNKNOWN"],
    ["revoked authorization", f => { f.current.authorization.status = "REVOKED"; }, "AUTHORIZATION_INVALID"],
    ["missing grant", f => { f.current.authorization.evidence = null; }, "AUTHORIZATION_INVALID"],
    ["stale policy", f => { f.output.policyVersion = "v0"; }, "POLICY_VERSION_CONFLICT"],
    ["duplicate event", f => { f.current.sequence.seenOutputIds = ["output-a"]; }, "DUPLICATE_OUTPUT"],
    ["duplicate sequence", f => { f.output.sequence = 3; }, "SEQUENCE_INVALID"],
    ["sequence gap", f => { f.output.sequence = 5; }, "SEQUENCE_INVALID"],
    ["sequence order", f => { f.output.sequence = 2; }, "SEQUENCE_INVALID"],
  ];
  it.each(cases)("R02 %s uses existing R5 predicate only, host deeper gates remain NOT_EVALUATED", (_name, change, reason) => {
    const f = contractFixture(); change(f); const before = structuredClone(f);
    expect(evaluateOutputPublication(f.output, f.current, f.policy)).toEqual({ outcome: "DENIED", reason, executionAuthority: false });
    const b = createOutputPublicationBoundary(), d = b.api.evaluate(f.output, f.current); denied(d);
    expect(b.inspectDenial(d)?.outputContract).toBe("NOT_EVALUATED"); expect(f).toEqual(before);
  });
});

describe("PI09B actual host and repository separation", () => {
  it("H01 actual HOST_SQLITE workspace does not authorize or acquire a publication handle", async () => {
    const f = await hostFixture(true), inspect = vi.spyOn(f.host.manager, "inspect"), acquire = vi.spyOn(f.host.repositories!, "acquire");
    denied(f.host.publication.evaluate({ scope: f.scope, payload: "SYNTHETIC_PRIVATE" }, { authenticated: true }));
    expect(inspect).not.toHaveBeenCalled(); expect(acquire).not.toHaveBeenCalled();
    expect(fs.readdirSync(f.storageRoot)).toEqual([]); expect(f.host.repositories!.diagnostics().liveConnections).toBe(0);
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP", "MISSING"])("H02 %s deny preserves fixture tables and safety-stop metadata", state => {
    const f = fixture(), command = issueCommand(f.ref); let attempt = f.repository.issue(command).attempt;
    for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const) attempt = f.repository.transition(transitionCommand(attempt, command.ownerNonce, phase));
    const raw = own(openTestConnection(f.ref));
    if (state === "BLOCKED") raw.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=securityRevision+1");
    if (state === "MISSING") raw.db.exec("DELETE FROM runtime_execution_security");
    if (state === "ACTIVE_STOP") f.repository.activateSecurityStop({ expected: expected(attempt, command.ownerNonce), expectedSecurityRevision: 1,
      operationId: randomUUID(), eventId: randomUUID(), action: "ACTIVATE_STOP", reason: "TEST_SECURITY_CONCERN", atMs: 2000 });
    const tables = ["runtime_attempts", "runtime_attempt_events", "runtime_owner_epochs", "runtime_execution_security", "runtime_security_stop_events", "runtime_security_stop_operations"];
    const snapshot = () => tables.map(t => raw.db.prepare(`SELECT * FROM ${t}`).all()), before = snapshot();
    const b = createOutputPublicationBoundary(), d = b.api.evaluate({ state, attempt }, {}); denied(d);
    expect(b.inspectDenial(d)?.repository).toBe("NOT_EVALUATED"); expect(snapshot()).toEqual(before);
  });
  it("H03 host close and direct manager close revoke publication API", async () => {
    const f = await hostFixture(); await f.host.close(); denied(f.host.publication.evaluate({}, {}));
    const g = await hostFixture(); await g.host.manager.close(); denied(g.host.publication.evaluate({}, {}));
    expect(g.host.authentication.inspect().status).toBe("CLOSED");
  });
  it("H04 workspace detach changes canonical generation and keeps publication denied", async () => {
    const f = await hostFixture(true), before = (await f.host.manager.current()).view.generation;
    await f.host.manager.detach({ expectedGeneration: before, scope: f.scope });
    expect((await f.host.manager.current()).view.generation).toBeGreaterThan(before);
    denied(f.host.publication.evaluate({ scope: f.scope }, {}));
  });
  it("H05 harmless workspace flow and safe auditing stay available", async () => {
    const f = await hostFixture(), opened = await f.host.manager.open({ path: f.project, expectedGeneration: 0 });
    const attached = await f.host.manager.initialize({ path: opened.nextAction!.canonicalPath, expectedGeneration: opened.view.generation,
      consent: true, consentToken: opened.nextAction!.consentToken });
    expect(attached.identity?.projectId).toBeTruthy();
    const b = createOutputPublicationBoundary(), d = b.api.evaluate({ payload: "SYNTHETIC_PRIVATE" }, {});
    expect(b.inspectDenial(d)?.reason).toBe("PUBLICATION_AUTHORITY_UNAVAILABLE"); denied(d);
    expect(JSON.stringify(b.inspectDenial(d))).not.toContain("SYNTHETIC_PRIVATE");
  });
  it("H06 request window has no filesystem, provider/network, process or listener effects", async () => {
    const f = await hostFixture(), write = vi.spyOn(fs, "writeFileSync"), read = vi.spyOn(fs, "readFileSync"),
      fetch = vi.spyOn(globalThis, "fetch"), fork = vi.spyOn(children, "fork"), listen = vi.spyOn(net.Server.prototype, "listen");
    denied(f.host.publication.evaluate({}, {})); for (const spy of [write, read, fetch, fork, listen]) expect(spy).not.toHaveBeenCalled();
  });
});
