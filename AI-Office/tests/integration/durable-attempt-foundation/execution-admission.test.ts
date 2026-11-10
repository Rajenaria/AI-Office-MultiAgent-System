import { randomUUID, createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackendHost, type BackendHostOptions } from "../../../src/server/host.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { createIdentity } from "../../../src/server/workspace/identity.js";
import { validateRoot, isWithin } from "../../../src/server/workspace/paths.js";
import { createExecutionAdmissionBoundary, requireExecutionAdmission, AdmissionRejected,
  type AdmissionAuthentication, type AdmissionDenial } from "../../../src/server/attempt-control/execution-admission.js";
import { createHostPrincipalBoundary } from "../../../src/server/attempt-control/host-principal.js";
import { createHostIssuerForTest, type HostBindingSnapshot } from "../../../src/server/attempt-control/host-session.js";
import { SyntheticSecurityHarness } from "../../../src/server/runtime-security/supervisor.js";
import { AttemptDescriptorSchema, type AttemptContext } from "../../../src/server/runtime-security/context.js";
import { openTestConnection } from "../../../src/server/attempt-control/test-storage.js";
import { expected, evidence, fixture, issueCommand, own, root, transitionCommand } from "./helpers.js";

type Host = Awaited<ReturnType<typeof composeBackendHost>>;
const hosts: Host[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const h of hosts.splice(0).reverse()) await h.close(); });
function denied(d: AdmissionDenial) {
  expect(d).toMatchObject({ admitted: false, executionAuthority: false, reasonCode: "ADMISSION_NOT_AUTHORIZED" });
  expect(d.correlationId).toMatch(/^[0-9a-f-]{36}$/); expect(Object.isFrozen(d)).toBe(true);
  expect(Object.keys(d).sort()).toEqual(["admitted", "executionAuthority", "reasonCode", "correlationId"].sort());
}
async function rejected(promise: Promise<unknown>): Promise<AdmissionRejected> {
  let error: unknown; try { await promise; } catch (e) { error = e; }
  expect(error).toBeInstanceOf(AdmissionRejected); denied((error as AdmissionRejected).denial);
  expect((error as Error).message).toBe("ADMISSION_NOT_AUTHORIZED"); return error as AdmissionRejected;
}
function gate() {
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>(r => { enter = r; }), waiting = new Promise<void>(r => { release = r; });
  return { entered, pause: () => { enter(); return waiting; }, release };
}
async function hostFixture(storage = false) {
  const base = path.join(root.root, "pi09a-" + randomUUID()), dataRoot = path.join(base, "registry"), project = path.join(base, "project"), storageRoot = path.join(base, "storage");
  fs.mkdirSync(base); fs.mkdirSync(dataRoot); fs.mkdirSync(project); fs.mkdirSync(storageRoot);
  const projectId = randomUUID(), storageId = randomUUID();
  if (storage) {
    const registry = await ProjectRegistry.acquire(dataRoot), canonical = await validateRoot(project);
    try {
      const identity = { schemaVersion: 1 as const, projectId, createdAt: "2026-11-10T00:00:00.000Z" };
      await createIdentity(canonical, identity);
      await registry.put({ identity, canonicalPath: canonical.canonicalPath, fileKey: canonical.fileKey, status: "IDENTITY_ATTACHED" });
    } finally { await registry.close(); }
  }
  const options: BackendHostOptions = { dataRoot, ...(storage ? { hostSQLite: { providerKind: "HOST_SQLITE" as const,
    providerId: randomUUID(), storageRoot, bindings: [{ projectId, workspaceRoot: project, storageId,
      authorityIncarnation: randomUUID(), initializationPolicy: "CREATE_NEW" as const }] } } : {}) };
  const host = await composeBackendHost(options); hosts.push(host);
  let scope: unknown;
  if (storage) {
    const opened = await host.manager.open({ path: project, expectedGeneration: 0 });
    if (!("binding" in opened.view)) throw new Error("Actual workspace attachment required");
    scope = { projectId, binding: opened.view.binding };
  }
  evidence("pi09a-host", { base, dataRoot, project, storageRoot, configuration: options.hostSQLite ?? null });
  return { host, options, base, dataRoot, project, storageRoot, storageId, scope };
}
function context(): AttemptContext {
  return AttemptDescriptorSchema.parse({ projectId: randomUUID(), workspaceBindingId: "workspace:fixture", taskId: "task:fixture",
    attemptId: randomUUID(), attemptGeneration: 1, policyRef: "policy:fixture", projectRoot: root.root, projectFileKey: "1:1",
    readScope: ["read"], writeScope: ["work"], operations: ["PROBE"], createdAt: "2026-11-10T00:00:00.000Z",
    expiresAt: "2026-11-10T00:01:00.000Z", source: "synthetic-security-test" });
}
function harness(admission?: unknown) {
  const fail = () => { throw new Error("SIDE_EFFECT_BEFORE_ADMISSION"); };
  const authority = { assert: vi.fn(fail), now: vi.fn(fail) };
  const journal = { create: vi.fn(fail), read: vi.fn(fail), transition: vi.fn(fail), close: vi.fn(fail) };
  const beforeSpawn = vi.fn(async () => fail());
  // Actual private constructor used only for in-process DI. It allocates maps/policy/approvals,
  // never IO. Do NOT call create/hashProbe/FixtureAttemptJournal.open or historical fixture helpers.
  const h = Reflect.construct(SyntheticSecurityHarness, [authority, journal, "unused-no-probe-read", beforeSpawn, admission]) as SyntheticSecurityHarness;
  const serial = vi.spyOn(h as unknown as { serial(): never }, "serial").mockImplementation(fail);
  const evaluate = vi.spyOn(h.policy, "evaluate").mockImplementation(async () => fail());
  const consume = vi.spyOn(h.approvals, "consume").mockImplementation(async () => fail());
  const request = vi.spyOn(h.approvals, "request").mockImplementation(async () => fail());
  const decide = vi.spyOn(h.approvals, "decide").mockImplementation(async () => fail());
  const fork = vi.spyOn(children, "fork"), spawn = vi.spyOn(children, "spawn"), listener = vi.spyOn(net.Server.prototype, "listen"), fetch = vi.spyOn(globalThis, "fetch");
  const effects = [authority.assert, authority.now, ...Object.values(journal), beforeSpawn, serial, evaluate, consume, request, decide, fork, spawn, listener, fetch];
  return { h, effects, untouched() {
    for (const spy of effects) expect(spy).not.toHaveBeenCalled();
    expect((Reflect.get(h, "contexts") as Map<string, unknown>).size).toBe(0);
    expect((Reflect.get(h, "runs") as Map<string, unknown>).size).toBe(0);
  } };
}
const methods = ["register", "requestApproval", "decide", "dispatch"] as const;
function invoke(h: SyntheticSecurityHarness, method: typeof methods[number], c = context(), input: unknown = {}) {
  if (method === "register") return h.register(c, randomUUID());
  if (method === "requestApproval") return h.requestApproval(c, input);
  if (method === "decide") return h.decide(c, h.controller, input);
  return h.dispatch(c, input, randomUUID());
}

describe("PI09A shared admission denies before any continuation", () => {
  it("A01 actual PI08 missing/unverified evidence selects owner-only audit, safe caller denial", async () => {
    const b = createExecutionAdmissionBoundary(createHostPrincipalBoundary().api);
    const absent = await b.api.admit({ principalId: randomUUID() }), unverified = await b.api.admit({}, { authenticated: true });
    denied(absent); denied(unverified);
    expect(b.inspectDenial(absent)).toMatchObject({ reason: "AUTHENTICATION_REQUIRED", workspace: "NOT_EVALUATED", repository: "NOT_EVALUATED" });
    expect(b.inspectDenial(unverified)?.reason).toBe("AUTHENTICATION_SOURCE_UNAVAILABLE");
    expect(b.inspectDenial({ ...absent })).toBeNull(); expect("inspectDenial" in b.api).toBe(false);
  });
  it.each(["principal", "session", "launcher", "host", "issuer", "workspace", "grant", "policy", "attempt", "schema"])(
    "A02 forged %s input cannot reach a later gate or install authority", async field => {
      const b = createExecutionAdmissionBoundary();
      const input = { [field]: "untrusted", authenticated: true, executionAuthority: true, correlationId: "C:/private.db" };
      const d = await b.api.admit(input, input); denied(d);
      expect(b.inspectDenial(d)?.reason).toBe("AUTHENTICATION_SOURCE_UNAVAILABLE");
      expect(JSON.stringify(d)).not.toContain("private.db");
    });
  it("A03 request/evidence getter traps cannot run before PI08 denial", async () => {
    const touched = vi.fn(() => { throw new Error("UNTRUSTED_GETTER"); }), value = new Proxy({}, { get: touched, ownKeys: touched, has: touched });
    const b = createExecutionAdmissionBoundary(), d = await b.api.admit(value, value); denied(d); expect(touched).not.toHaveBeenCalled();
  });
  it.each(["throw", "reject", "missing", "malformed", "positive"])("A04 %s dependency still yields sanitized denial, never a positive path", async mode => {
    const secret = "SYNTHETIC_PRIVATE_DETAIL_C:/private.db";
    const auth = mode === "missing" ? {} : { authenticate: () => {
      if (mode === "throw") throw new Error(secret);
      if (mode === "reject") return Promise.reject(new Error(secret));
      if (mode === "malformed") return new Proxy({}, { has() { throw new Error(secret); } });
      return { status: "AUTHENTICATION_VERIFIED_TRUSTED_SOURCE", executionAuthority: true };
    } };
    const b = createExecutionAdmissionBoundary(auth as AdmissionAuthentication), d = await b.api.admit({}, {}); denied(d);
    expect(b.inspectDenial(d)?.reason).toBe(mode === "positive" ? "ADMISSION_NOT_AUTHORIZED" : "ADMISSION_DEPENDENCY_UNAVAILABLE");
    expect(JSON.stringify(d)).not.toContain(secret);
  });
  it("A05 dependency result promises cannot survive close or generation invalidation as authority", async () => {
    for (const action of ["close", "invalidate"] as const) {
      const paused = gate(), b = createExecutionAdmissionBoundary({ authenticate: async () => { await paused.pause(); return { authenticated: true }; } });
      const pending = b.api.admit({}, {}); await paused.entered; b[action](); paused.release();
      const d = await pending; denied(d); expect(b.inspectDenial(d)?.reason).toBe(action === "close" ? "ADMISSION_CLOSED" : "ADMISSION_INVALIDATED");
    }
  });
  it("A06 cancellation before and during admission has no side-effect continuation", async () => {
    const controller = new AbortController(), authenticate = vi.fn(); controller.abort();
    const b = createExecutionAdmissionBoundary({ authenticate }), d = await b.api.admit({}, {}, controller.signal);
    denied(d); expect(b.inspectDenial(d)?.reason).toBe("ADMISSION_CANCELLED"); expect(authenticate).not.toHaveBeenCalled();
    const paused = gate(), current = new AbortController(), c = createExecutionAdmissionBoundary({ authenticate: async () => { await paused.pause(); return {}; } });
    const pending = c.api.admit({}, {}, current.signal); await paused.entered; current.abort(); paused.release();
    const deniedResult = await pending; denied(deniedResult); expect(c.inspectDenial(deniedResult)?.reason).toBe("ADMISSION_CANCELLED");
  });
  it("A07 duplicate concurrent requests and retry remain denial-only with host-issued correlations", async () => {
    const b = createExecutionAdmissionBoundary(), input = { attemptId: randomUUID(), operationId: randomUUID() };
    const rows = await Promise.all(Array.from({ length: 32 }, () => b.api.admit(input, {})));
    for (const d of rows) denied(d); expect(new Set(rows.map(d => d.correlationId)).size).toBe(32);
    denied(await b.api.admit(input, {}));
  });
  it("A08 forged/copied guard object cannot replace the private registered admission closure", async () => {
    const fakeAdmit = vi.fn(() => ({ admitted: true, executionAuthority: true })), b = createExecutionAdmissionBoundary();
    for (const candidate of [undefined, null, {}, { admit: fakeAdmit }, { ...b.api }, new Proxy(b.api, {})])
      await rejected(requireExecutionAdmission(candidate, {}, {}));
    expect(fakeAdmit).not.toHaveBeenCalled(); await rejected(requireExecutionAdmission(b.api, {}, {}));
  });
  it("A09 a real PI04 fixture issuer context still reaches authentication-source denial", async () => {
    const issuer = createHostIssuerForTest(), b = createExecutionAdmissionBoundary();
    const snapshot: HostBindingSnapshot = { projectId: randomUUID(), authorityIncarnation: randomUUID(), principalId: randomUUID(), principalRevision: 1,
      applicationSessionId: "app:fixture", applicationGeneration: 1, applicationRevision: 1, executionSessionId: "exec:fixture", bindingRevision: 1,
      attemptId: randomUUID(), attemptGeneration: 1, attemptStateVersion: 3, attemptPhase: "APPROVAL_GRANTED", workspaceBindingId: "workspace:fixture",
      workspaceGeneration: 1, policyId: randomUUID(), policyRevision: 1, policyVersion: 1, grantId: randomUUID(), authorizationRevision: 1,
      provenanceSourceRevision: 1, action: "attempt.execute", destinationId: "fixture-output", issuedAtMs: 1000, expiresAtMs: 2000 };
    const local = issuer.issue(snapshot); expect(issuer.read(local, 1500).issues).toEqual([]);
    const d = await b.api.admit({}, local); denied(d); expect(b.inspectDenial(d)?.reason).toBe("AUTHENTICATION_SOURCE_UNAVAILABLE"); issuer.close();
  });
});

describe("PI09A actual fixture request-entry guards, no probe orchestration", () => {
  it.each(methods)("E01 %s denies before serial queue, journal, approval, process or provider", async method => {
    const f = harness(); await rejected(invoke(f.h, method)); f.untouched();
  });
  it.each(methods)("E02 %s uses the actual host PI08-bound admission object", async method => {
    const owner = await hostFixture(), f = harness(owner.host.admission);
    await rejected(invoke(f.h, method)); f.untouched();
  });
  it.each(methods)("E03 %s cannot bypass through an injected forged positive guard", async method => {
    const positive = vi.fn(() => ({ admitted: true, executionAuthority: true })), f = harness({ admit: positive });
    await rejected(invoke(f.h, method)); expect(positive).not.toHaveBeenCalled(); f.untouched();
  });
  it("E04 a canonical-shaped synthetic context/request and retry cannot consume approval or persist launch intent", async () => {
    const f = harness(), c = context(), input = { projectId: c.projectId, taskId: c.taskId, attemptId: c.attemptId,
      attemptGeneration: 1, workspaceBindingId: c.workspaceBindingId, operation: "PROBE", path: "work", probeMode: "complete" };
    await rejected(f.h.dispatch(c, input, randomUUID())); await rejected(f.h.dispatch(c, input, randomUUID())); f.untouched();
  });
  it("E05 malicious context/request accessors are not evaluated by the request handler before denial", async () => {
    const f = harness(), touched = vi.fn(() => { throw new Error("SENSITIVE_CONTEXT_ACCESS"); }), value = new Proxy({}, { get: touched, has: touched, ownKeys: touched });
    for (const method of methods) await rejected(invoke(f.h, method, value as AttemptContext, value));
    expect(touched).not.toHaveBeenCalled(); f.untouched();
  });
  it("E06 dependency failures through the real dispatcher remain sanitized and effect-free", async () => {
    const b = createExecutionAdmissionBoundary({ authenticate() { throw new Error("SYNTHETIC_SECRET /private.db"); } }), f = harness(b.api);
    const error = await rejected(f.h.dispatch(context(), {}, randomUUID()));
    expect(JSON.stringify(error)).not.toContain("SYNTHETIC_SECRET"); expect("cause" in error).toBe(false); f.untouched();
  });
});

describe("PI09A existing host and repository compatibility", () => {
  it("H01 actual HOST_SQLITE canonical workspace does not bypass authentication or cause connection acquisition", async () => {
    const f = await hostFixture(true), inspect = vi.spyOn(f.host.manager, "inspect"), acquire = vi.spyOn(f.host.repositories!, "acquire");
    denied(await f.host.admission.admit({ scope: f.scope }, { authenticated: true }));
    expect(inspect).not.toHaveBeenCalled(); expect(acquire).not.toHaveBeenCalled(); expect(fs.readdirSync(f.storageRoot)).toEqual([]);
    expect(f.host.repositories!.diagnostics().liveConnections).toBe(0);
  });
  it("H02 denial leaves existing actual disposable SQLite metadata and journals byte-for-byte unchanged", async () => {
    const f = await hostFixture(true), handle = await f.host.repositories!.acquire(f.scope);
    const filename = path.join(f.storageRoot, f.storageId, "authority.db"); if (!isWithin(root.root, filename)) throw new Error("Disposable DB required");
    const digest = () => createHash("sha256").update(fs.readFileSync(filename)).digest("hex"), before = digest();
    const raw = new DatabaseSync(filename, { readOnly: true });
    try {
      for (let n = 0; n < 3; n++) denied(await f.host.admission.admit({ scope: f.scope, attemptId: randomUUID() }, {}));
      expect(raw.prepare("SELECT count(*) AS n FROM runtime_attempts").get()?.n).toBe(0);
      expect(raw.prepare("SELECT count(*) AS n FROM runtime_attempt_events").get()?.n).toBe(0);
      expect(raw.prepare("SELECT count(*) AS n FROM runtime_security_stop_events").get()?.n).toBe(0);
      expect(raw.prepare("SELECT securityState,securityRevision FROM runtime_execution_security").get()).toMatchObject({ securityState: "UNKNOWN", securityRevision: 1 });
      expect(digest()).toBe(before);
    } finally { raw.close(); }
    await handle.close(); denied(await f.host.admission.admit({ scope: f.scope }, handle));
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP", "MISSING"])("H03 %s repository state is preserved when admission denies first", async state => {
    const f = fixture(), command = issueCommand(f.ref); let attempt = f.repository.issue(command).attempt;
    for (const target of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const) attempt = f.repository.transition(transitionCommand(attempt, command.ownerNonce, target));
    const raw = own(openTestConnection(f.ref));
    if (state === "BLOCKED") raw.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=securityRevision+1");
    if (state === "MISSING") raw.db.exec("DELETE FROM runtime_execution_security");
    if (state === "ACTIVE_STOP") f.repository.activateSecurityStop({ expected: expected(attempt, command.ownerNonce), expectedSecurityRevision: 1,
      operationId: randomUUID(), eventId: randomUUID(), action: "ACTIVATE_STOP", reason: "TEST_SECURITY_CONCERN", atMs: 2000 });
    const tables = ["runtime_attempts", "runtime_attempt_events", "runtime_owner_epochs", "runtime_execution_security", "runtime_security_stop_events", "runtime_security_stop_operations"];
    const snapshot = () => tables.map(t => raw.db.prepare(`SELECT * FROM ${t}`).all()), before = snapshot();
    const b = createExecutionAdmissionBoundary(), d = await b.api.admit({ expected: expected(attempt, command.ownerNonce), state }, {}); denied(d);
    expect(b.inspectDenial(d)?.repository).toBe("NOT_EVALUATED"); expect(snapshot()).toEqual(before);
  });
  it("H04 harmless workspace metadata flow remains usable instead of a global denial handler", async () => {
    const f = await hostFixture(); expect((await f.host.manager.current()).view.state).toBe("DETACHED");
    const opened = await f.host.manager.open({ path: f.project, expectedGeneration: 0 });
    expect(opened.nextAction?.kind).toBe("INITIALIZATION_REQUIRED");
    const attached = await f.host.manager.initialize({ path: opened.nextAction!.canonicalPath, expectedGeneration: opened.view.generation,
      consent: true, consentToken: opened.nextAction!.consentToken });
    expect(attached.identity?.projectId).toBeTruthy(); expect("binding" in attached.view).toBe(true);
    denied(await f.host.admission.admit({}, {}));
  });
  it("H05 pending actual host admission remains denied across shutdown and direct manager close", async () => {
    const f = await hostFixture(), pending = f.host.admission.admit({}, {}), closing = f.host.close();
    denied(await pending); await closing; denied(await f.host.admission.admit({}, {}));
    const other = await hostFixture(); await other.host.manager.close(); denied(await other.host.admission.admit({}, {}));
  });
  it("H06 actual workspace detach/revocation cannot produce an admission permit", async () => {
    const f = await hostFixture(true), current = await f.host.manager.current();
    const pending = f.host.admission.admit({ scope: f.scope }, {});
    await f.host.manager.detach({ expectedGeneration: current.view.generation, scope: f.scope });
    denied(await pending); denied(await f.host.admission.admit({ scope: f.scope }, {})); expect(fs.readdirSync(f.storageRoot)).toEqual([]);
  });
  it("H07 denial has no filesystem write, listener, process, provider or credential callback", async () => {
    const f = await hostFixture(), write = vi.spyOn(fs, "writeFileSync"), read = vi.spyOn(fs, "readFileSync"), fetch = vi.spyOn(globalThis, "fetch"), fork = vi.spyOn(children, "fork"), listener = vi.spyOn(net.Server.prototype, "listen");
    denied(await f.host.admission.admit({}, { token: "synthetic-local-capability" }));
    for (const spy of [write, read, fetch, fork, listener]) expect(spy).not.toHaveBeenCalled();
    vi.restoreAllMocks(); await import("../../../src/server/index.js");
  });
});
