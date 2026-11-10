import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackendHost, type BackendHostOptions } from "../../../src/server/host.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { createIdentity } from "../../../src/server/workspace/identity.js";
import { validateRoot } from "../../../src/server/workspace/paths.js";
import { createHostIssuerForTest, type HostBindingSnapshot } from "../../../src/server/attempt-control/host-session.js";
import type { AuthenticationDenial } from "../../../src/server/attempt-control/host-principal.js";
import type { RepositoryTestControl } from "../../../src/server/attempt-control/workspace-repositories.js";
import { evidence, root } from "./helpers.js";

type Host = Awaited<ReturnType<typeof composeBackendHost>>;
const hosts: Host[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const host of hosts.splice(0).reverse()) await host.close(); });
async function build(storage = false, control?: RepositoryTestControl) {
  const base = path.join(root.root, "pi08-" + randomUUID()), dataRoot = path.join(base, "registry"); fs.mkdirSync(base);
  const project = path.join(base, "project"), storageRoot = path.join(base, "storage"), projectId = randomUUID();
  fs.mkdirSync(dataRoot);
  if (storage) {
    fs.mkdirSync(project); fs.mkdirSync(storageRoot);
    const registry = await ProjectRegistry.acquire(dataRoot), canonical = await validateRoot(project);
    try {
      const identity = { schemaVersion: 1 as const, projectId, createdAt: "2026-11-10T00:00:00.000Z" };
      await createIdentity(canonical, identity);
      await registry.put({ identity, canonicalPath: canonical.canonicalPath, fileKey: canonical.fileKey, status: "IDENTITY_ATTACHED" });
    } finally { await registry.close(); }
  }
  const options: BackendHostOptions = { dataRoot, ...(storage ? { hostSQLite: { providerKind: "HOST_SQLITE" as const,
    providerId: randomUUID(), storageRoot, bindings: [{ projectId, workspaceRoot: project, storageId: randomUUID(),
      authorityIncarnation: randomUUID(), initializationPolicy: "CREATE_NEW" as const }] } } : {}),
    ...(control ? { repositoryTestControl: control } : {}) };
  const host = await composeBackendHost(options); hosts.push(host);
  let scope: unknown;
  if (storage) {
    const opened = await host.manager.open({ path: project, expectedGeneration: 0 });
    if (!("binding" in opened.view)) throw new Error("Canonical binding required");
    scope = { projectId, binding: opened.view.binding };
  }
  evidence("pi08-host", { base, dataRoot, project: storage ? project : null, storageRoot: storage ? storageRoot : null,
    configuration: storage ? options.hostSQLite : null, source: "NOT_VERIFIED", strategy: "C" });
  return { host, options, base, dataRoot, project, projectId, storageRoot, scope };
}
function denied(d: AuthenticationDenial) {
  expect(d).toMatchObject({ status: "AUTHENTICATION_DENIED", principal: null, context: null,
    sourceClassification: "NOT_VERIFIED", executionAuthority: false });
  expect(Object.isFrozen(d)).toBe(true);
}
async function rejects(operation: Promise<unknown>, reason?: string) {
  let error: unknown; try { await operation; } catch (e) { error = e; }
  expect(error).toBeInstanceOf(Error); if (reason) expect(error).toMatchObject({ reason }); return error;
}
function gate() {
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>(r => { enter = r; }), pending = new Promise<void>(r => { release = r; });
  return { entered, pause: () => { enter(); return pending; }, release };
}
function fixtureSnapshot(): HostBindingSnapshot {
  return { projectId: randomUUID(), authorityIncarnation: randomUUID(), principalId: randomUUID(), principalRevision: 1,
    applicationSessionId: "app:fixture", applicationGeneration: 1, applicationRevision: 1, executionSessionId: "exec:fixture",
    bindingRevision: 1, attemptId: randomUUID(), attemptGeneration: 1, attemptStateVersion: 3, attemptPhase: "APPROVAL_GRANTED",
    workspaceBindingId: "workspace:fixture", workspaceGeneration: 1, policyId: randomUUID(), policyRevision: 1,
    policyVersion: 1, grantId: randomUUID(), authorizationRevision: 1, provenanceSourceRevision: 1,
    action: "attempt.execute", destinationId: "fixture-output", issuedAtMs: 1000, expiresAtMs: 2000 };
}

describe("PI08 Strategy C fail-closed host boundary", () => {
  it("A01 absent authority is explicit; host creates no authenticated principal/context", async () => {
    const f = await build(), api = f.host.authentication;
    expect(api.inspect()).toMatchObject({ strategy: "C", status: "UNAVAILABLE", productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE", executionAuthority: false });
    expect(Object.isFrozen(api)).toBe(true);
    denied(api.authenticate()); expect(api.authenticate().reason).toBe("IDENTITY_EVIDENCE_MISSING");
    denied(api.authenticate(null)); expect(api.authenticate(null).reason).toBe("IDENTITY_EVIDENCE_MISSING");
    expect(f.host.repositories).toBeUndefined();
  });
  it("A02 explicit UNPROVISIONED config has no implicit fixture or transport fallback", async () => {
    const f = await build(); await f.host.close();
    const h = await composeBackendHost({ dataRoot: f.dataRoot, identityVerification: { mode: "UNPROVISIONED" } }); hosts.push(h);
    const input = { sessionToken: "synthetic-local-token", csrfNonce: "synthetic-nonce", authenticated: true, principalId: randomUUID() };
    denied(h.authentication.authenticate(input)); expect(h.authentication.authenticate(input).reason).toBe("PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
  });
  it.each([
    { mode: "AUTHENTICATED_EXTERNAL_AUTHORITY" }, { mode: "LOCAL_TEST_FIXTURE" }, { mode: "UNPROVISIONED", publicKey: "caller-key" },
    { mode: "UNPROVISIONED", issuer: "caller-issuer", audience: "caller-audience" },
    { mode: "UNPROVISIONED", verify: () => ({ authenticated: true }) }, { mode: "UNPROVISIONED", clock: () => 1000 }, null,
  ])("A03 unsupported trust configuration cannot install authority or cause storage IO", async config => {
    const dataRoot = path.join(root.root, "pi08-invalid-" + randomUUID());
    await rejects(composeBackendHost({ dataRoot, identityVerification: config as NonNullable<BackendHostOptions["identityVerification"]> }), "UNSUPPORTED_HOST_IDENTITY_CONFIGURATION");
    expect(fs.existsSync(dataRoot)).toBe(false);
  });
  it("A04 evidence flags, keys, signed-looking strings and malformed objects cannot become authority", async () => {
    const f = await build();
    // These are opaque unverified inputs, not cryptographic signature/expiry tests.
    for (const input of ["opaque.signed-looking.evidence", "unsigned", { authenticated: true, verified: true },
      { issuer: "unknown", audience: "other", publicKey: "injected", algorithm: "none" },
      { principalId: randomUUID(), applicationSessionId: "caller", expiresAt: -1, authenticationRevision: 99 },
      { sourceKind: "PRODUCTION_AUTHENTICATED", trustAnchorGeneration: 1 }, new Uint8Array([0, 255]), 42])
      denied(f.host.authentication.authenticate(input));
    const deniedOutput = f.host.authentication.authenticate("opaque");
    denied(f.host.authentication.authenticate(deniedOutput)); denied(f.host.authentication.authenticate(JSON.parse(JSON.stringify(deniedOutput))));
  });
  it("A05 evidence is never interpreted, serialized, invoked or copied into a decision", async () => {
    const f = await build(), touched = vi.fn(() => { throw new Error("EVIDENCE_MUST_NOT_BE_READ"); });
    const evidenceInput = new Proxy({}, { get: touched, ownKeys: touched, getPrototypeOf: touched });
    const output = f.host.authentication.authenticate(evidenceInput); denied(output); expect(touched).not.toHaveBeenCalled();
    expect(JSON.stringify(output)).not.toContain("EVIDENCE_MUST_NOT_BE_READ"); expect("evidence" in output).toBe(false);
  });
  it("A06 valid PI04 fixture object and its copies are not a production authentication path", async () => {
    const f = await build(), issuer = createHostIssuerForTest(), snapshot = fixtureSnapshot(), context = issuer.issue(snapshot);
    expect(issuer.read(context, 1500)).toEqual({ snapshot, issues: [] });
    for (const candidate of [context, { ...context }, structuredClone(context), JSON.parse(JSON.stringify(context))])
      denied(f.host.authentication.authenticate(candidate));
    issuer.close(); denied(f.host.authentication.authenticate(context));
  });
  it("A07 authentication denial composes existing session contracts without reading scope/request/storage", async () => {
    const f = await build(true), acquire = vi.spyOn(f.host.repositories!, "acquire"), inspect = vi.spyOn(f.host.manager, "inspect");
    const touched = vi.fn(() => { throw new Error("UNAUTHENTICATED_REQUEST_MUST_NOT_BE_READ"); });
    const untrusted = new Proxy({}, { get: touched, ownKeys: touched, getPrototypeOf: touched });
    const d = f.host.authentication.assessSessionReadiness(untrusted, untrusted, { authenticated: true });
    expect(d).toMatchObject({ eligible: false, executionAuthority: false, reason: "PRINCIPAL_UNAVAILABLE",
      principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED", hostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE",
      workspaceAccess: "NOT_EVALUATED", repositoryReadiness: "NOT_EVALUATED", observed: null });
    expect(d.sessionReasons).toEqual(["SESSION_NOT_EVALUATED"]); expect(d.provenanceReasons).toEqual(["PROVENANCE_NOT_EVALUATED"]);
    denied(d.authentication); expect(touched).not.toHaveBeenCalled(); expect(acquire).not.toHaveBeenCalled(); expect(inspect).not.toHaveBeenCalled();
    expect(f.host.repositories!.diagnostics().liveConnections).toBe(0); expect(fs.readdirSync(f.storageRoot)).toEqual([]);
    expect(Object.isFrozen(d)).toBe(true); expect(Object.isFrozen(d.reasons)).toBe(true);
  });
  it("A08 current canonical workspace possession does not authenticate or create membership", async () => {
    const f = await build(true), canonical = await f.host.manager.inspect(f.scope);
    const d = f.host.authentication.assessSessionReadiness(f.scope, { principalId: f.projectId }, { ...canonical, authenticated: true });
    denied(d.authentication); expect(d.workspaceAccess).toBe("NOT_EVALUATED"); expect(fs.readdirSync(f.storageRoot)).toEqual([]);
  });
  it("A09 two host boundaries reject cross-host, session and principal claim substitution", async () => {
    const [a, b] = await Promise.all([build(), build()]), claim = { principalId: randomUUID(), applicationSessionId: "reused", authenticated: true };
    denied(a.host.authentication.authenticate(claim)); denied(b.host.authentication.authenticate(claim));
    claim.principalId = randomUUID(); claim.applicationSessionId = "different";
    denied(a.host.authentication.authenticate(claim)); denied(b.host.authentication.authenticate(claim));
  });
  it("A10 workspace invalidation changes boundary generation without issuing or reviving a context", async () => {
    const f = await build(true), prior = f.host.authentication.inspect();
    const current = await f.host.manager.current();
    await f.host.manager.detach({ expectedGeneration: current.view.generation, scope: f.scope });
    expect(f.host.authentication.inspect().boundaryGeneration).toBeGreaterThan(prior.boundaryGeneration);
    denied(f.host.authentication.authenticate(prior));
    const d = f.host.authentication.assessSessionReadiness(f.scope, {}, { authenticated: true });
    expect(d.workspaceAccess).toBe("NOT_EVALUATED"); expect(d.executionAuthority).toBe(false);
  });
  it("A11 close immediately fences authentication; direct manager close and repeated host close remain safe", async () => {
    const a = await build(), closing = a.host.close();
    expect(a.host.authentication.authenticate("claim").reason).toBe("HOST_AUTHENTICATION_CLOSED"); await closing;
    await a.host.close(); expect(a.host.authentication.inspect().status).toBe("CLOSED");
    const b = await build(); await b.host.manager.close();
    expect(b.host.authentication.authenticate("claim").reason).toBe("HOST_AUTHENTICATION_CLOSED");
  });
  it("A12 pending repository acquisition cannot keep authentication alive during shutdown", async () => {
    const paused = gate(), f = await build(true, { stage: s => s === "beforeOpen" ? paused.pause() : undefined });
    const acquisition = rejects(f.host.repositories!.acquire(f.scope)); await paused.entered;
    const close = f.host.close();
    expect(f.host.authentication.authenticate("claim").reason).toBe("HOST_AUTHENTICATION_CLOSED");
    paused.release(); await acquisition; await close; expect(f.host.repositories!.diagnostics().liveConnections).toBe(0);
  });
  it("A13 repository quarantine cannot turn authentication back on during failed shutdown/retry", async () => {
    let fail = true; const f = await build(true, { stage: s => { if (s === "beforeClose" && fail) throw new Error("PI08_CLOSE_FAULT"); } });
    await f.host.repositories!.acquire(f.scope); await rejects(f.host.close());
    expect(f.host.authentication.authenticate("claim").reason).toBe("HOST_AUTHENTICATION_CLOSED");
    expect(f.host.repositories!.diagnostics().liveConnections).toBe(1);
    fail = false; await f.host.close(); expect(f.host.repositories!.diagnostics().liveConnections).toBe(0);
  });
  it("A14 existing host-owned diagnostic repository remains narrow and deny-only", async () => {
    const f = await build(true), handle = await f.host.repositories!.acquire(f.scope);
    expect(handle.sourceClass).toBe("HOST_SQLITE");
    expect((await handle.assessSessionReadiness({})).executionAuthority).toBe(false);
    const d = f.host.authentication.assessSessionReadiness(f.scope, {}, handle); denied(d.authentication);
    expect(d.repositoryReadiness).toBe("NOT_EVALUATED");
    for (const key of ["db", "repository", "activateSecurityStop", "clear", "dispatch", "issue", "transition"])
      expect(key in handle).toBe(false);
    expect(Object.keys(f.host.authentication).sort()).toEqual(["authenticate", "assessSessionReadiness", "inspect"].sort());
  });
  it("A15 denied metadata mutation cannot modify future authentication state", async () => {
    const f = await build(), d = f.host.authentication.authenticate("claim"), mutable = structuredClone(d) as unknown as Record<string, unknown>;
    mutable.status = "AUTHENTICATION_VERIFIED_TRUSTED_SOURCE"; mutable.principal = { principalId: randomUUID() }; mutable.executionAuthority = true;
    denied(f.host.authentication.authenticate(mutable)); expect(f.host.authentication.inspect().status).toBe("UNAVAILABLE");
  });
  it("A16 import and denial path perform no listener/process/network/credential or database IO", async () => {
    const f = await build(), listener = vi.spyOn(net.Server.prototype, "listen"), spawn = vi.spyOn(children, "spawn"), fetch = vi.spyOn(globalThis, "fetch"), read = vi.spyOn(fs, "readFileSync");
    f.host.authentication.assessSessionReadiness({}, {}, { authenticated: true });
    expect(read).not.toHaveBeenCalled(); expect(listener).not.toHaveBeenCalled(); expect(spawn).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    vi.restoreAllMocks(); await import("../../../src/server/index.js");
  });
});
