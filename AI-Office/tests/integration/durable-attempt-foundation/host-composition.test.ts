import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { mkdir, lstat } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackendHost, createBackendShutdown, type BackendHostOptions } from "../../../src/server/host.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { createIdentity } from "../../../src/server/workspace/identity.js";
import { isWithin, validateRoot } from "../../../src/server/workspace/paths.js";
import { WorkspaceFailure } from "../../../src/server/workspace/errors.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { USER_VERSION } from "../../../src/server/attempt-control/schema.js";
import { openOwnedFixtureConnection, discardUnclaimedFixtureConnection } from "../../../src/server/attempt-control/connection.js";
import { createTestDatabase, openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { type FixtureWorkspaceRepositories, type RepositoryTestControl, HostWorkspaceRepositories } from "../../../src/server/attempt-control/workspace-repositories.js";
import { type ProvenanceRequest } from "../../../src/server/attempt-control/provenance.js";
import { type SessionReadinessRequest } from "../../../src/server/attempt-control/host-session.js";
import { expected, evidence, failure, identity, issueCommand, own, root, transitionCommand } from "./helpers.js";

type Host = Awaited<ReturnType<typeof composeBackendHost>>;
const hosts: Host[] = [];
afterEach(async () => { for (const h of hosts.splice(0).reverse()) await h.close(); });
async function build(control?: RepositoryTestControl) {
  const base = path.join(root.root, "host-" + randomUUID()), dataRoot = path.join(base, "registry");
  const a = path.join(base, "Project A"), b = path.join(base, "Project B");
  await mkdir(dataRoot, { recursive: true }); await mkdir(a); await mkdir(b);
  const refs = [createTestDatabase(root), createTestDatabase(root)] as const;
  const registry = await ProjectRegistry.acquire(dataRoot);
  try {
    for (const [index, folder] of [a, b].entries()) {
      const project = await validateRoot(folder), projectIdentity = { schemaVersion: 1 as const, projectId: refs[index]!.projectId, createdAt: "2026-11-09T00:00:00.000Z" };
      await createIdentity(project, projectIdentity);
      await registry.put({ identity: projectIdentity, canonicalPath: project.canonicalPath, fileKey: project.fileKey, status: "IDENTITY_ATTACHED" });
    }
  } finally { await registry.close(); }
  const config: FixtureWorkspaceRepositories = { sourceClass: "LOCAL_TEST_FIXTURE", root,
    bindings: [{ workspaceRoot: a, storage: refs[0] }, { workspaceRoot: b, storage: refs[1] }] };
  const options: BackendHostOptions = { dataRoot, fixtureRepositories: config, ...(control ? { repositoryTestControl: control } : {}) };
  const host = await composeBackendHost(options); hosts.push(host);
  const opened = await host.manager.open({ path: a, expectedGeneration: 0 });
  if (!("binding" in opened.view)) throw new Error("Canonical workspace attachment required");
  const scope = { projectId: refs[0].projectId, binding: opened.view.binding };
  const seed = own(DurableAttemptRepository.openForTest(refs[0]));
  const command = { ...issueCommand(refs[0]), bindingId: scope.binding.bindingId, bindingGeneration: scope.binding.generation };
  let attempt = seed.issue(command).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = seed.transition(transitionCommand(attempt, command.ownerNonce, phase));
  const request = { expected: expected(attempt, command.ownerNonce), securityRevision: 1 };
  const raw = own(openTestConnection(refs[0]));
  evidence("pi06-host", { base, dataRoot, a, b, refs, scope });
  return { host, owner: host.repositories!, config, options, scope, a, b, dataRoot, refs, seed, command, attempt, request, raw };
}
type F = Awaited<ReturnType<typeof build>>;
async function rejects(p: Promise<unknown>, reason?: string) {
  try { await p; throw new Error("Expected rejection"); }
  catch (error) {
    expect(error).toBeInstanceOf(Error);
    if (reason) expect(error).toMatchObject({ reason });
    else expect((error as Error).message).not.toBe("Expected rejection");
    return error;
  }
}
function barrier() {
  let entered!: () => void, release!: () => void;
  const waiting = new Promise<void>(r => { entered = r; }), gate = new Promise<void>(r => { release = r; });
  return { entered: waiting, pause: () => { entered(); return gate; }, release };
}
function insert(f: F, table: string, row: object) {
  const keys = Object.keys(row);
  f.raw.db.prepare(`INSERT INTO ${table}(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`)
    .run(...Object.values(row) as (string | number | null)[]);
}
function provenance(f: F) {
  const common = { recordVersion: 1, projectId: f.scope.projectId, authorityIncarnation: f.attempt.authorityIncarnation,
    sourceId: "pi03-fixture-source-v1", sourceRevision: 1, sourceClass: "LOCAL_TEST_FIXTURE", status: "ACTIVE", validFromMs: 1000, expiresAtMs: 10000 };
  const principalId = randomUUID(), policyId = randomUUID(), grantId = randomUUID(), sessionId = "execution:" + randomUUID();
  insert(f, "runtime_principal_provenance", { ...common, principalId, principalKind: "HUMAN", revision: 1 });
  insert(f, "runtime_policy_provenance", { ...common, policyId, revision: 1, policyVersion: 1, action: "attempt.execute",
    taskId: f.attempt.taskId, destinationId: "fixture-output" });
  insert(f, "runtime_grant_provenance", { ...common, grantId, authorizationRevision: 1, principalId, principalRevision: 1,
    policyId, policyRevision: 1, policyVersion: 1, sessionId, attemptId: f.attempt.attemptId, attemptGeneration: 1,
    action: "attempt.execute", taskId: f.attempt.taskId, destinationId: "fixture-output" });
  const q: ProvenanceRequest = { ...f.request, principalId, principalRevision: 1, policyId, policyRevision: 1, policyVersion: 1,
    grantId, authorizationRevision: 1, sourceRevision: 1, sessionId, action: "attempt.execute", destinationId: "fixture-output", atMs: 2000 };
  return q;
}
async function switchB(f: F) {
  const current = await f.host.manager.current(), opened = await f.host.manager.open({ path: f.b, expectedGeneration: current.view.generation });
  if (!("binding" in opened.view)) throw new Error("Attachment required");
  return { projectId: f.refs[1].projectId, binding: opened.view.binding };
}

describe("PI06 owned construction and canonical workspace", () => {
  it("H01 actual listener-free host acquires one narrow frozen repository facade", async () => {
    const f = await build(), handle = await f.owner.acquire(f.scope);
    expect(Object.isFrozen(handle)).toBe(true); expect(f.owner.diagnostics().liveConnections).toBe(1);
    expect(await handle.inspectAttempt(identity(f.attempt))).toMatchObject({ attemptId: f.attempt.attemptId, executionAuthority: false });
    expect(await handle.assessExecutionReadiness(f.request)).toMatchObject({ reason: "SECURITY_STATE_UNKNOWN", executionAuthority: false, eligible: false });
    for (const key of ["db", "connection", "repository", "activateSecurityStop", "issue", "transition", "issueHostContextForTest", "claimGrant"])
      expect(key in handle).toBe(false);
    expect(f.owner.diagnostics().productionHostAuthority).toBe("PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
  });
  it.each([undefined, null, {}, { projectId: randomUUID() }, { sourceClass: "AUTHENTICATED", trusted: true }])(
    "H02 missing/forged host context denies", async input => {
      const f = await build(); await rejects(f.owner.acquire(input)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    });
  it.each(["unknown", "stale", "cross-project", "traversal", "absolute", "separator"])("H03 %s workspace scope denies before database acquisition", async kind => {
    const f = await build();
    const binding = { ...f.scope.binding };
    if (kind === "stale") binding.generation++;
    else if (kind === "cross-project") binding.projectId = f.refs[1].projectId;
    else binding.bindingId = kind === "traversal" ? "../authority.db" : kind === "absolute" ? "C:/external/authority.db" :
      kind === "separator" ? "workspace/other" : randomUUID();
    await rejects(f.owner.acquire({ projectId: binding.projectId, binding })); expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it("H04 repeated/concurrent initialization shares one handle and connection", async () => {
    const f = await build(), [a, b, c] = await Promise.all([f.owner.acquire(f.scope), f.owner.acquire(f.scope), f.owner.acquire(f.scope)]);
    expect(a).toBe(b); expect(b).toBe(c); expect(f.owner.diagnostics().liveConnections).toBe(1);
  });
  it("H05 forged/serialized/consumed connection tokens cannot adopt raw SQLite", async () => {
    const f = await build(), token = openOwnedFixtureConnection(f.refs[0]);
    for (const forged of [{}, { sourceClass: "LOCAL_TEST_FIXTURE" }, JSON.parse(JSON.stringify(token)), { db: f.raw.db }])
      failure(() => DurableAttemptRepository.openHostOwnedForFixtures(forged), "AUTHORITY_INVALID");
    const owned = own(DurableAttemptRepository.openHostOwnedForFixtures(token));
    failure(() => DurableAttemptRepository.openHostOwnedForFixtures(token), "AUTHORITY_INVALID"); owned.close();
    discardUnclaimedFixtureConnection(token);
  });
  it("H06 no configured repository means unavailable, without implicit fixture/global fallback", async () => {
    const f = await build(); await f.host.close();
    const h = await composeBackendHost({ dataRoot: f.dataRoot }); hosts.push(h); expect(h.repositories).toBeUndefined();
    await rejects(composeBackendHost({ dataRoot: f.dataRoot, repositoryTestControl: {} }), "REPOSITORY_FIXTURE_CONTROL_REQUIRES_CONFIGURATION");
  });
  it.each(["source", "path-field", "outside-root", "duplicate", "wrong-storage-root", "missing-root"])(
    "H07 invalid host configuration %s fails and releases registry lock", async kind => {
      const f = await build(); await f.host.close();
      const config = structuredClone(f.config) as unknown as Record<string, unknown>;
      if (kind === "source") config.sourceClass = "PRODUCTION_AUTHENTICATED";
      else if (kind === "missing-root") delete config.root;
      else {
        const bindings = config.bindings as { workspaceRoot: string; storage: Record<string, unknown>; filename?: string }[];
        if (kind === "path-field") bindings[0]!.filename = "C:/outside.db";
        if (kind === "outside-root") bindings[0]!.workspaceRoot = "C:/outside";
        if (kind === "duplicate") bindings.push(bindings[0]!);
        if (kind === "wrong-storage-root") bindings[0]!.storage.root = "C:/outside";
      }
      await rejects(composeBackendHost({ ...f.options, fixtureRepositories: config as unknown as FixtureWorkspaceRepositories }));
      const healthy = await composeBackendHost(f.options); hosts.push(healthy); expect(healthy.repositories).toBeDefined();
    });
});

describe("PI06 lifecycle, acquisition races and disposal", () => {
  it("L01 close/double-close blocks stale handles; explicit reopen revalidates and creates a new generation", async () => {
    const f = await build(), first = await f.owner.acquire(f.scope);
    await Promise.all([first.close(), first.close()]); expect(f.owner.diagnostics().liveConnections).toBe(0);
    await rejects(first.assessExecutionReadiness(f.request), "REPOSITORY_HANDLE_REVOKED");
    await rejects(f.owner.acquire(f.scope), "REPOSITORY_EXPLICIT_REOPEN_REQUIRED");
    const next = await f.owner.reopen(f.scope); expect(next.resourceGeneration).toBeGreaterThan(first.resourceGeneration);
    expect(next).not.toBe(first); expect((await next.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it("L02 detach and identifier reuse cannot revive the previous binding", async () => {
    const f = await build(), first = await f.owner.acquire(f.scope), current = await f.host.manager.current();
    await f.host.manager.detach({ expectedGeneration: current.view.generation, scope: f.scope });
    await rejects(first.assessExecutionReadiness(f.request)); await rejects(f.owner.reopen(f.scope));
    const detached = await f.host.manager.current(), opened = await f.host.manager.open({ path: f.a, expectedGeneration: detached.view.generation });
    if (!("binding" in opened.view)) throw new Error("Expected binding");
    expect(opened.view.binding.bindingId).not.toBe(f.scope.binding.bindingId);
    const fresh = await f.owner.acquire({ projectId: f.scope.projectId, binding: opened.view.binding });
    await rejects(fresh.inspectAttempt(identity(f.attempt)), "REPOSITORY_ATTEMPT_WORKSPACE_MISMATCH");
  });
  it("L03 switching A to B revokes A; closing A never closes B's independent database", async () => {
    const f = await build(), a = await f.owner.acquire(f.scope), bScope = await switchB(f), b = await f.owner.acquire(bScope);
    await rejects(a.inspectAttempt(identity(f.attempt))); await a.close();
    expect(f.owner.diagnostics().liveConnections).toBe(1);
    await rejects(b.inspectAttempt(identity(f.attempt)), "REPOSITORY_PROJECT_MISMATCH");
    expect((await b.assessExecutionReadiness({ ...f.request, expected: { ...f.request.expected, projectId: f.refs[1].projectId,
      authorityIncarnation: f.refs[1].authorityIncarnation } })).executionAuthority).toBe(false);
    expect(testDatabaseFilename(f.refs[0])).not.toBe(testDatabaseFilename(f.refs[1]));
  });
  it("L04 two host/workspace owners acquire independently and isolate one owner's close", async () => {
    const a = await build(), b = await build(), [ha, hb] = await Promise.all([a.owner.acquire(a.scope), b.owner.acquire(b.scope)]);
    await a.host.close(); expect(a.owner.diagnostics().liveConnections).toBe(0); expect(b.owner.diagnostics().liveConnections).toBe(1);
    expect((await hb.assessExecutionReadiness(b.request)).executionAuthority).toBe(false);
    await rejects(ha.assessExecutionReadiness(a.request)); await rejects(hb.inspectAttempt(identity(a.attempt)));
  });
  it.each(["beforeOpen", "afterOpen"] as const)("L05 %s failure exposes no handle and cleans partial resources", async stage => {
    let once = true;
    const f = await build({ stage: observed => { if (once && observed === stage) { once = false; throw new Error("controlled open failure"); } } });
    await rejects(f.owner.acquire(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect((await (await f.owner.reopen(f.scope)).assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it.each(["beforeOpen", "afterOpen"] as const)("L06 shutdown pending %s acquisition rejects and disposes after barrier", async stage => {
    const gate = barrier(); let once = true;
    const f = await build({ stage: observed => { if (once && observed === stage) { once = false; return gate.pause(); } } });
    const acquiring = f.owner.acquire(f.scope).catch(error => error as unknown); await gate.entered;
    const closing = f.host.close(); gate.release();
    expect(await acquiring).toBeInstanceOf(Error); await closing; expect(f.owner.diagnostics().liveConnections).toBe(0);
    await rejects(f.owner.acquire(f.scope));
  });
  it("L07 close during a gated operation revokes immediately, drains, then disposes without a successful stale result", async () => {
    const gate = barrier(); let once = true;
    const f = await build({ stage: stage => { if (once && stage === "beforeOperation") { once = false; return gate.pause(); } } });
    const h = await f.owner.acquire(f.scope), reading = h.assessExecutionReadiness(f.request).catch(error => error as unknown);
    await gate.entered; const closing = h.close(); gate.release();
    expect(await reading).toBeInstanceOf(Error); await closing; expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect(f.owner.diagnostics().entries[0]?.operations).toBe(0);
  });
  it("L08 a close failure quarantines ownership, retains registry lock, and explicit shutdown retry releases it", async () => {
    let failing = true;
    const f = await build({ stage: stage => { if (stage === "beforeClose" && failing) throw new Error("controlled close failure"); } });
    const h = await f.owner.acquire(f.scope); await rejects(h.close()); expect(f.owner.diagnostics().liveConnections).toBe(1);
    await rejects(h.assessExecutionReadiness(f.request)); await rejects(f.host.close());
    await expect(lstat(path.join(f.dataRoot, "writer.lock"))).resolves.toBeDefined();
    failing = false; await f.host.close(); expect(f.owner.diagnostics().liveConnections).toBe(0);
    await expect(lstat(path.join(f.dataRoot, "writer.lock"))).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("L09 awaited reentrant acquire/reopen/shutdown reject instead of waiting on their own opening promise", async () => {
    let f!: F, once = true;
    f = await build({ stage: async stage => {
      if (once && stage === "beforeOpen") {
        once = false;
        await rejects(f.owner.acquire(f.scope), "REENTRANT_REPOSITORY_ACQUIRE");
        await rejects(f.owner.reopen(f.scope), "REENTRANT_REPOSITORY_ACQUIRE");
        await rejects(f.owner.close(), "REENTRANT_REPOSITORY_CLOSE");
      }
    } });
    const h = await f.owner.acquire(f.scope); expect(f.owner.diagnostics().liveConnections).toBe(1);
    expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it("L10 pending acquisition cannot survive workspace generation change", async () => {
    const gate = barrier(); let once = true;
    const f = await build({ stage: stage => { if (once && stage === "beforeOpen") { once = false; return gate.pause(); } } });
    const acquiring = f.owner.acquire(f.scope).catch(error => error as unknown); await gate.entered;
    await switchB(f); gate.release(); expect(await acquiring).toBeInstanceOf(Error);
    expect(f.owner.diagnostics().liveConnections).toBe(0); await rejects(f.owner.reopen(f.scope));
  });
  it("L11 externally concurrent acquisition during a controlled pending open shares the same ownership", async () => {
    const gate = barrier(); let once = true;
    const f = await build({ stage: stage => { if (once && stage === "beforeOpen") { once = false; return gate.pause(); } } });
    const first = f.owner.acquire(f.scope); await gate.entered;
    const second = f.owner.acquire(f.scope);
    await f.host.manager.current(); expect(f.owner.diagnostics().liveConnections).toBe(0);
    gate.release(); const [a, b] = await Promise.all([first, second]);
    expect(a).toBe(b); expect(f.owner.diagnostics().liveConnections).toBe(1);
  });
});

describe("PI06 storage boundaries and security compatibility", () => {
  it("P01 unsupported DB open fails without fallback; explicit repaired fixture reopen revalidates", async () => {
    const f = await build(); f.raw.db.exec("PRAGMA user_version=99");
    await rejects(f.owner.acquire(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    f.raw.db.exec(`PRAGMA user_version=${USER_VERSION}`); const h = await f.owner.reopen(f.scope);
    expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it("P02 wrong workspace DB reference cannot silently select another project", async () => {
    const f = await build(); await f.host.close();
    const wrong = { ...f.config, bindings: [{ workspaceRoot: f.a, storage: f.refs[1] }] };
    const h = await composeBackendHost({ ...f.options, fixtureRepositories: wrong }); hosts.push(h);
    const opened = await h.manager.open({ path: f.a, expectedGeneration: 0 });
    if (!("binding" in opened.view)) throw new Error("Expected binding");
    await rejects(h.repositories!.acquire({ projectId: f.refs[0].projectId, binding: opened.view.binding }), "REPOSITORY_WORKSPACE_NOT_CONFIGURED");
    expect(h.repositories!.diagnostics().liveConnections).toBe(0);
  });
  it("P03 database file replacement fails marker/file-key validation and never falls back", async () => {
    const f = await build(), filename = testDatabaseFilename(f.refs[0]);
    f.seed.close(); f.raw.close(); fs.renameSync(filename, filename + ".retained");
    fs.writeFileSync(filename, fs.readFileSync(filename + ".retained"), { flag: "wx" });
    await rejects(f.owner.acquire(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it("P04 query-only owned connection reads safely; no mutation/activation interface is available", async () => {
    const f = await build({ queryOnly: true }), h = await f.owner.acquire(f.scope);
    expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
    expect("activateSecurityStop" in h).toBe(false); expect("transaction" in h).toBe(false);
  });
  it("P05 a junction redirect within the new fixture is rejected without opening another workspace file", async () => {
    const f = await build(); await f.host.close();
    const retained = f.a + ".retained";
    if (fs.realpathSync.native(f.a) !== f.a || !isWithin(root.root, f.a) || !isWithin(root.root, retained) || !isWithin(root.root, f.b))
      throw new Error("Unsafe fixture redirection target");
    fs.renameSync(f.a, retained); fs.symlinkSync(f.b, f.a, "junction");
    await rejects(composeBackendHost(f.options));
  });
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP", "MISSING"] as const)("S01 composed %s state denies", async state => {
    const f = await build();
    if (state === "MISSING") f.raw.db.exec("DELETE FROM runtime_execution_security");
    else if (state !== "UNKNOWN") f.raw.db.prepare("UPDATE runtime_execution_security SET securityState=?,securityRevision=2").run(state);
    const h = await f.owner.acquire(f.scope), d = await h.assessExecutionReadiness({ ...f.request, securityRevision: state === "UNKNOWN" ? 1 : 2 });
    expect(d).toMatchObject({ eligible: false, executionAuthority: false });
    expect(d.reason).toBe(state === "MISSING" ? "SECURITY_RECORD_MISSING" : state === "ACTIVE_STOP" ? "SECURITY_STOP_ACTIVE" :
      state === "BLOCKED" ? "SECURITY_STATE_BLOCKED" : "SECURITY_STATE_UNKNOWN");
  });
  it.each([["principalId", "PRINCIPAL_MISSING"], ["policyId", "POLICY_MISSING"], ["grantId", "GRANT_MISSING"]] as const)(
    "S02 composed invalid %s retains provenance denial", async (key, issue) => {
      const f = await build(), q = provenance(f), h = await f.owner.acquire(f.scope);
      const d = await h.assessProvenanceReadiness({ ...q, [key]: randomUUID() });
      expect(d.provenanceReasons).toContain(issue); expect(d.executionAuthority).toBe(false);
    });
  it("S03 valid fixture provenance remains unverified; session/context cannot be fabricated by composition", async () => {
    const f = await build(), q = provenance(f), h = await f.owner.acquire(f.scope);
    const p = await h.assessProvenanceReadiness(q);
    expect(p).toMatchObject({ provenanceStatus: "FIXTURE_PROVENANCE_CONSISTENT", principalAuthenticity: "PRODUCTION_PRINCIPAL_UNVERIFIED", executionAuthority: false });
    const session: SessionReadinessRequest = { ...f.request, executionSessionId: q.sessionId, sessionRevision: 1,
      workspaceBindingId: f.scope.binding.bindingId, workspaceGeneration: f.scope.binding.generation,
      action: q.action, destinationId: q.destinationId, atMs: q.atMs };
    const d = await h.assessSessionReadiness(session, { sourceKind: "LOCAL_TEST_FIXTURE", trusted: true });
    expect(d).toMatchObject({ executionAuthority: false, hostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" });
    expect(d.sessionReasons).toContain("HOST_CONTEXT_INVALID"); expect(d.sessionReasons).toContain("SESSION_MISSING");
  });
  it.each(["authorityIncarnation", "attemptGeneration", "stateVersion"] as const)("S04 stale %s remains deny-only", async key => {
    const f = await build(), h = await f.owner.acquire(f.scope);
    const d = await h.assessExecutionReadiness({ ...f.request, expected: { ...f.request.expected, [key]: key === "authorityIncarnation" ? randomUUID() : 99 } });
    expect(d.executionAuthority).toBe(false); expect(d.reason).toBe(key === "authorityIncarnation" ? "INCARNATION_MISMATCH" :
      key === "attemptGeneration" ? "EPOCH_MISMATCH" : "STALE_ATTEMPT_REVISION");
  });
  it("S05 PI05 activation/CAS/idempotency/journal remain private and composed reads retain the committed stop", async () => {
    const f = await build(), q = { expected: f.request.expected, expectedSecurityRevision: 1, operationId: randomUUID(), eventId: randomUUID(),
      action: "ACTIVATE_STOP", reason: "TEST_SECURITY_CONCERN", atMs: 2000 };
    const r = f.seed.activateSecurityStop(q), before = f.seed.securityStopHistory(), h = await f.owner.acquire(f.scope);
    expect((await h.assessExecutionReadiness({ ...f.request, securityRevision: 2 })).reason).toBe("SECURITY_STOP_ACTIVE");
    expect(f.seed.activateSecurityStop(q)).toEqual({ ...r, replay: true }); expect(f.seed.securityStopHistory()).toEqual(before);
    failure(() => f.seed.activateSecurityStop({ ...q, operationId: randomUUID(), eventId: randomUUID() }), "SECURITY_REVISION_CONFLICT");
    expect("activateSecurityStop" in h).toBe(false); await h.close();
    const reopened = await f.owner.reopen(f.scope); expect((await reopened.assessExecutionReadiness({ ...f.request, securityRevision: 2 })).executionAuthority).toBe(false);
  });
  it("S06 SQLite BUSY is a deny-only result and operation leases are released", async () => {
    const f = await build(), h = await f.owner.acquire(f.scope); f.raw.db.exec("BEGIN EXCLUSIVE");
    try { expect(await h.assessExecutionReadiness(f.request)).toMatchObject({ reason: "STORAGE_UNAVAILABLE", executionAuthority: false }); }
    finally { f.raw.db.exec("ROLLBACK"); }
    expect(f.owner.diagnostics().entries[0]?.operations).toBe(0);
    expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it("S07 host composition/imports never start HTTP, workers, provider clients or credentials", async () => {
    const spies = [vi.spyOn(net.Server.prototype, "listen"), vi.spyOn(net, "createServer"), vi.spyOn(children, "fork"),
      vi.spyOn(children, "spawn"), vi.spyOn(children, "exec"), vi.spyOn(globalThis, "fetch")];
    try {
      await import("../../../src/server/index.js");
      const f = await build(), h = await f.owner.acquire(f.scope); expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally { for (const spy of spies) spy.mockRestore(); }
  });
  it.each(["databasePath", "filename", "credentials", "callback", "trusted", "executionAuthority"])("S08 ordinary input %s cannot create paths/authority", async key => {
    const f = await build(), h = await f.owner.acquire(f.scope), d = await h.assessExecutionReadiness({ ...f.request, [key]: "dummy-only" });
    expect(d).toMatchObject({ reason: "INVALID_REQUEST", executionAuthority: false });
  });
});

describe("PI06 actual backend shutdown composition without listeners", () => {
  it("B01 concurrent shutdown shares one promise and stops ingress before host resources", async () => {
    const gate = barrier(), order: string[] = [];
    const close = createBackendShutdown(async () => { order.push("ingress"); await gate.pause(); }, async () => { order.push("host"); });
    const first = close(); await gate.entered; const second = close(); expect(first).toBe(second); gate.release();
    await Promise.all([first, second]); await close(); expect(order).toEqual(["ingress", "host"]);
  });
  it("B02 ingress stop failure still disposes host resources and permits explicit retry", async () => {
    let once = true; const order: string[] = [];
    const close = createBackendShutdown(async () => { order.push("ingress"); if (once) { once = false; throw new Error("ingress fault"); } },
      async () => { order.push("host"); });
    await rejects(close()); expect(order).toEqual(["ingress", "host"]); await close();
    expect(order).toEqual(["ingress", "host", "ingress", "host"]);
  });
  it("B03 resource close failure retries cleanup without stopping already stopped ingress again", async () => {
    let once = true; const order: string[] = [];
    const close = createBackendShutdown(async () => { order.push("ingress"); }, async () => {
      order.push("host"); if (once) { once = false; throw new Error("resource fault"); }
    });
    await rejects(close()); await close(); expect(order).toEqual(["ingress", "host", "host"]);
  });
  it("B04 both shutdown failures are preserved; no false-success cleanup receipt", async () => {
    const close = createBackendShutdown(async () => { throw new Error("ingress fault"); }, async () => { throw new Error("host fault"); });
    const error = await rejects(close()); expect(error).toBeInstanceOf(AggregateError);
    expect((error as AggregateError).errors).toHaveLength(2);
  });
});
