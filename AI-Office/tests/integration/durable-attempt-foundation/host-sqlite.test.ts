import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackendHost, type BackendHostOptions } from "../../../src/server/host.js";
import { ProjectRegistry } from "../../../src/server/workspace/registry.js";
import { createIdentity } from "../../../src/server/workspace/identity.js";
import { validateRoot, isWithin } from "../../../src/server/workspace/paths.js";
import { HostSQLiteProvider, discardHostSQLiteConnection, type HostSQLiteConfig, type SQLiteStorageIdentity } from "../../../src/server/attempt-control/host-sqlite.js";
import { DurableAttemptRepository } from "../../../src/server/attempt-control/repository.js";
import { USER_VERSION } from "../../../src/server/attempt-control/schema.js";
import * as fixtureStorage from "../../../src/server/attempt-control/test-storage.js";
import type { RepositoryTestControl } from "../../../src/server/attempt-control/workspace-repositories.js";
import { expected, evidence, identity, issueCommand, own, root, transitionCommand } from "./helpers.js";

type Host = Awaited<ReturnType<typeof composeBackendHost>>;
const hosts: Host[] = [];
function rawDb(filename: string, readOnly = false) {
  const db = new DatabaseSync(filename, { readOnly });
  own({ close() { if (db.isOpen) db.close(); } }); return db;
}
afterEach(async () => { vi.restoreAllMocks(); for (const host of hosts.splice(0).reverse()) await host.close(); });
async function rejects(operation: Promise<unknown>, reason?: string) {
  let error: unknown; try { await operation; } catch (e) { error = e; }
  expect(error).toBeInstanceOf(Error); if (reason) expect(error).toMatchObject({ reason }); return error;
}
function barrier() {
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>(r => { enter = r; }), gate = new Promise<void>(r => { release = r; });
  return { entered, pause: () => { enter(); return gate; }, release };
}
async function prepare(seed = false) {
  const base = path.join(root.root, "pi07-" + randomUUID()), dataRoot = path.join(base, "registry"), storageRoot = path.join(base, "storage");
  fs.mkdirSync(base); fs.mkdirSync(dataRoot); fs.mkdirSync(storageRoot);
  const projects = [path.join(base, "Project A"), path.join(base, "Project B")];
  const seedRef = seed ? fixtureStorage.createTestDatabase(root) : undefined;
  const bindings = projects.map((workspaceRoot, index) => {
    fs.mkdirSync(workspaceRoot);
    return { workspaceRoot, projectId: index === 0 && seedRef ? seedRef.projectId : randomUUID(),
      authorityIncarnation: index === 0 && seedRef ? seedRef.authorityIncarnation : randomUUID(),
      storageId: randomUUID(), initializationPolicy: "CREATE_NEW" as const };
  });
  const registry = await ProjectRegistry.acquire(dataRoot);
  try {
    for (const binding of bindings) {
      const project = await validateRoot(binding.workspaceRoot), projectIdentity = { schemaVersion: 1 as const,
        projectId: binding.projectId, createdAt: "2026-11-09T00:00:00.000Z" };
      await createIdentity(project, projectIdentity);
      await registry.put({ identity: projectIdentity, canonicalPath: project.canonicalPath, fileKey: project.fileKey, status: "IDENTITY_ATTACHED" });
    }
  } finally { await registry.close(); }
  const config: HostSQLiteConfig = { providerKind: "HOST_SQLITE", providerId: randomUUID(), storageRoot, bindings };
  evidence("pi07-provider", { base, dataRoot, config, seedRef: seedRef ?? null });
  return { base, dataRoot, config, bindings, projects, seedRef };
}
async function attach(prepared: Awaited<ReturnType<typeof prepare>>, control?: RepositoryTestControl, config = prepared.config) {
  const options: BackendHostOptions = { dataRoot: prepared.dataRoot, hostSQLite: config,
    ...(control ? { repositoryTestControl: control } : {}) };
  const host = await composeBackendHost(options); hosts.push(host);
  const opened = await host.manager.open({ path: prepared.projects[0]!, expectedGeneration: 0 });
  if (!("binding" in opened.view)) throw new Error("Attachment required");
  return { ...prepared, host, owner: host.repositories!, options,
    scope: { projectId: prepared.bindings[0]!.projectId, binding: opened.view.binding } };
}
async function build(control?: RepositoryTestControl, seed = false) { return attach(await prepare(seed), control); }
type F = Awaited<ReturnType<typeof build>>;
function filename(f: F, index = 0) {
  const file = path.join(f.config.storageRoot, f.bindings[index]!.storageId, "authority.db");
  if (!isWithin(root.root, file)) throw new Error("Disposable root required"); return file;
}
async function initialized(f: F) {
  const handle = await f.owner.acquire(f.scope), storage = await f.owner.storageIdentity(f.scope);
  return { handle, storage };
}
function reopenConfig(f: F, storage: SQLiteStorageIdentity): HostSQLiteConfig {
  return { ...structuredClone(f.config), bindings: f.config.bindings.map((binding, i) => i === 0 ?
    { ...binding, initializationPolicy: "OPEN_EXISTING" as const, identity: storage } : binding) };
}
async function seeded(state: "UNKNOWN" | "BLOCKED" | "ACTIVE_STOP" | "MISSING" = "UNKNOWN") {
  const f = await build(undefined, true), { handle } = await initialized(f); await handle.close();
  const ref = f.seedRef!, seed = own(DurableAttemptRepository.openForTest(ref));
  const command = { ...issueCommand(ref), bindingId: f.scope.binding.bindingId, bindingGeneration: f.scope.binding.generation };
  let attempt = seed.issue(command).attempt;
  for (const phase of ["APPROVAL_PENDING", "APPROVAL_GRANTED"] as const)
    attempt = seed.transition(transitionCommand(attempt, command.ownerNonce, phase));
  const request = { expected: expected(attempt, command.ownerNonce), securityRevision: state === "ACTIVE_STOP" || state === "BLOCKED" ? 2 : 1 };
  if (state === "ACTIVE_STOP") seed.activateSecurityStop({ expected: request.expected, expectedSecurityRevision: 1,
    operationId: randomUUID(), eventId: randomUUID(), action: "ACTIVATE_STOP", reason: "TEST_SECURITY_CONCERN", atMs: 2000 });
  seed.close();
  // Controlled test data injection, never provider initialization/fallback: both files are newly owned disposable stores.
  const source = fixtureStorage.testDatabaseFilename(ref), target = filename(f), before = fs.statSync(target, { bigint: true }).ino;
  if (!isWithin(root.root, source) || !isWithin(root.root, target)) throw new Error("Disposable seed only");
  fs.writeFileSync(target, fs.readFileSync(source)); expect(fs.statSync(target, { bigint: true }).ino).toBe(before);
  const raw = rawDb(target);
  if (state === "BLOCKED") raw.prepare("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=securityRevision+1").run();
  if (state === "MISSING") raw.prepare("DELETE FROM runtime_execution_security").run();
  return { ...f, request, raw, attempt, command };
}
async function switchB(f: F) {
  const current = await f.host.manager.current(), opened = await f.host.manager.open({ path: f.projects[1]!, expectedGeneration: current.view.generation });
  if (!("binding" in opened.view)) throw new Error("Attachment required");
  return { projectId: f.bindings[1]!.projectId, binding: opened.view.binding };
}

describe("PI07 configuration and real non-fixture initialization", () => {
  it("C01 explicit provider initializes current schema/default UNKNOWN without invoking a fixture factory", async () => {
    const f = await build(), fixture = vi.spyOn(fixtureStorage, "openTestConnection"), init = vi.spyOn(fixtureStorage, "createTestDatabase");
    const { handle, storage } = await initialized(f);
    expect(handle.sourceClass).toBe("HOST_SQLITE"); expect(fixture).not.toHaveBeenCalled(); expect(init).not.toHaveBeenCalled();
    expect(Object.isFrozen(handle)).toBe(true); expect(Object.isFrozen(storage)).toBe(true);
    const raw = rawDb(filename(f), true);
    expect(raw.prepare("PRAGMA user_version").get()?.user_version).toBe(USER_VERSION);
    expect(raw.prepare("PRAGMA journal_mode").get()?.journal_mode).toBe("delete");
    expect(raw.prepare("SELECT * FROM runtime_execution_security").get()).toMatchObject({ securityState: "UNKNOWN", securityRevision: 1, stopJournalHead: null });
    expect(raw.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all()).toHaveLength(18);
    expect(raw.prepare("SELECT * FROM runtime_security_stop_events").all()).toHaveLength(0);
    expect(f.owner.diagnostics()).toMatchObject({ liveConnections: 1, executionAuthority: false, productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" });
    for (const name of ["db", "repository", "connection", "activateSecurityStop", "issue", "transition", "clear", "dispatch", "issueHostContextForTest"])
      expect(name in handle).toBe(false);
  });
  it("C02 missing provider remains unavailable without global storage", async () => {
    const p = await prepare(), h = await composeBackendHost({ dataRoot: p.dataRoot }); hosts.push(h);
    expect(h.repositories).toBeUndefined(); expect(fs.readdirSync(p.config.storageRoot)).toEqual([]);
  });
  it.each(["provider", "policy", "missing-root", "relative", "traversal", "unc", "device", "extra-path", "duplicate-project", "duplicate-store", "case-id", "workspace-alias", "wrong-project", "overlap", "long-path"])(
    "C03 invalid host config %s rejects without creating a database", async kind => {
      const p = await prepare(), config = structuredClone(p.config) as unknown as Record<string, any>;
      if (kind === "provider") config.providerKind = "LOCAL_TEST_FIXTURE";
      if (kind === "policy") config.bindings[0].initializationPolicy = "AUTO";
      if (kind === "missing-root") config.storageRoot = path.join(p.base, "missing");
      if (kind === "relative") config.storageRoot = "./storage";
      if (kind === "traversal") config.storageRoot = p.config.storageRoot + "\\..\\storage";
      if (kind === "unc") config.storageRoot = "\\\\server\\share\\store";
      if (kind === "device") config.storageRoot = "\\\\?\\C:\\store";
      if (kind === "extra-path") config.bindings[0].filename = "caller.db";
      if (kind === "duplicate-project") config.bindings.push({ ...config.bindings[0], storageId: randomUUID() });
      if (kind === "duplicate-store") config.bindings[1].storageId = config.bindings[0].storageId;
      if (kind === "case-id") config.bindings[0].storageId = config.bindings[0].storageId.toUpperCase();
      if (kind === "workspace-alias") config.bindings[0].workspaceRoot = config.bindings[0].workspaceRoot.toLowerCase();
      if (kind === "wrong-project") config.bindings[0].projectId = randomUUID();
      if (kind === "overlap") config.storageRoot = p.projects[0];
      if (kind === "long-path") {
        config.storageRoot = path.join(p.base, "long-" + "x".repeat(110)); fs.mkdirSync(config.storageRoot);
      }
      await rejects(composeBackendHost({ dataRoot: p.dataRoot, hostSQLite: config as HostSQLiteConfig }));
      expect(fs.readdirSync(p.config.storageRoot)).toEqual([]);
      const healthy = await attach(p); expect(healthy.owner).toBeDefined();
    });
  it("C04 host configuration is detached from later caller mutation", async () => {
    const f = await build(); f.config.bindings[0]!.storageId = randomUUID();
    const handle = await f.owner.acquire(f.scope); expect(handle.sourceClass).toBe("HOST_SQLITE");
    expect((await f.owner.storageIdentity(f.scope)).storageId).not.toBe(f.config.bindings[0]!.storageId);
  });
  it.each([undefined, null, {}, { projectId: randomUUID() }, { binding: { trusted: true } }])("C05 missing/unknown scope denies", async scope => {
    const f = await build(); await rejects(f.owner.acquire(scope)); expect(fs.readdirSync(f.config.storageRoot)).toEqual([]);
  });
  it.each(["storageRoot", "filename", "initializationPolicy", "trusted", "callback"])("C06 request field %s cannot configure storage", async field => {
    const f = await build(); await rejects(f.owner.acquire({ ...f.scope, [field]: "caller-value" }));
    expect(fs.readdirSync(f.config.storageRoot)).toEqual([]);
  });
  it.each(["../other", "C:/outside.db", "other\\workspace", "other/workspace", "..\\other/next", randomUUID()])(
    "C07 workspace identifier %s cannot select a path", async id => {
      const f = await build(); await rejects(f.owner.acquire({ ...f.scope, binding: { ...f.scope.binding, bindingId: id } }));
      expect(fs.readdirSync(f.config.storageRoot)).toEqual([]);
    });
  it("C08 stale generation and cross-project scope deny", async () => {
    const f = await build();
    await rejects(f.owner.acquire({ ...f.scope, binding: { ...f.scope.binding, generation: f.scope.binding.generation + 1 } }));
    await rejects(f.owner.acquire({ ...f.scope, projectId: f.bindings[1]!.projectId }));
    expect(fs.readdirSync(f.config.storageRoot)).toEqual([]);
  });
  it("C09 ambiguous fixture/provider config is rejected before ownership acquisition", async () => {
    const p = await prepare(); await rejects(composeBackendHost({ dataRoot: p.dataRoot, hostSQLite: p.config,
      fixtureRepositories: { sourceClass: "LOCAL_TEST_FIXTURE", root, bindings: [] } }), "AMBIGUOUS_REPOSITORY_CONFIGURATION");
  });
});

describe("PI07 initialization, reopen and schema refusal", () => {
  it("I01 unexpected existing file is never overwritten and failed acquisition has no handle", async () => {
    const f = await build(), folder = path.dirname(filename(f)); fs.mkdirSync(folder); fs.writeFileSync(filename(f), "untouched", { flag: "wx" });
    await rejects(f.owner.acquire(f.scope)); expect(fs.readFileSync(filename(f), "utf8")).toBe("untouched");
    expect(f.owner.diagnostics().liveConnections).toBe(0); await rejects(f.owner.acquire(f.scope));
  });
  it.each(["afterSchema", "afterSecurity", "securityWrite"] as const)("I02 initializer %s rolls back and retains quarantined partial store", async initializationFault => {
    const f = await build({ initializationFault }); await rejects(f.owner.acquire(f.scope));
    expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect(fs.existsSync(path.join(path.dirname(filename(f)), "storage.json"))).toBe(false);
    const db = rawDb(filename(f), true);
    expect(db.prepare("PRAGMA user_version").get()?.user_version).toBe(0);
    expect(db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all()).toEqual([]);
    await rejects(f.owner.reopen(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    db.close(); await f.host.close();
    const retry = await attach(f); await rejects(retry.owner.acquire(retry.scope));
  });
  it("I03 explicit OPEN_EXISTING pins identity and leaves schema, revision and bytes unchanged", async () => {
    const f = await build(), { handle, storage } = await initialized(f); await handle.close(); await f.host.close();
    const bytes = fs.readFileSync(filename(f));
    const next = await attach(f, undefined, reopenConfig(f, storage));
    const h = await next.owner.acquire(next.scope); expect(h.sourceClass).toBe("HOST_SQLITE");
    expect(await next.owner.storageIdentity(next.scope)).toEqual(storage); await next.host.close();
    expect(fs.readFileSync(filename(f))).toEqual(bytes);
  });
  it("I04 CREATE_NEW after restart refuses existing store instead of silently reopening", async () => {
    const f = await build(); await initialized(f); await f.host.close();
    const before = fs.readFileSync(filename(f)), next = await attach(f);
    await rejects(next.owner.acquire(next.scope)); expect(fs.readFileSync(filename(f))).toEqual(before);
  });
  it.each(["providerId", "storageId", "projectId", "authorityIncarnation", "rootKey", "workspaceKey", "directoryKey", "databaseKey"])(
    "I05 OPEN_EXISTING identity %s mismatch denies", async field => {
      const f = await build(), { storage } = await initialized(f); await f.host.close();
      const forged = { ...storage, [field]: field.endsWith("Key") ? "1:1" : randomUUID() };
      const config = reopenConfig(f, forged);
      if (["directoryKey", "databaseKey"].includes(field)) {
        const next = await attach(f, undefined, config); await rejects(next.owner.acquire(next.scope));
      } else await rejects(composeBackendHost({ dataRoot: f.dataRoot, hostSQLite: config }));
    });
  it("I06 OPEN_EXISTING without pinned identity is invalid", async () => {
    const p = await prepare(), config = structuredClone(p.config) as unknown as Record<string, any>;
    config.bindings[0].initializationPolicy = "OPEN_EXISTING";
    await rejects(composeBackendHost({ dataRoot: p.dataRoot, hostSQLite: config as HostSQLiteConfig }));
  });
  it.each(["version", "table", "profile", "metadata", "corrupt"])("I07 existing %s corruption denies without migration/repair", async kind => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    if (kind === "corrupt") fs.writeFileSync(filename(f), "not sqlite");
    else {
      const db = rawDb(filename(f));
      if (kind === "version") db.exec("PRAGMA user_version=8");
      if (kind === "table") db.exec("DROP TABLE runtime_security_stop_operations");
      if (kind === "profile" || kind === "metadata") {
        const trigger = db.prepare("SELECT name,sql FROM sqlite_schema WHERE type='trigger' AND tbl_name='runtime_control_meta' AND sql LIKE '%BEFORE UPDATE%'").get()!;
        db.exec(`DROP TRIGGER ${String(trigger.name)}`); db.exec("PRAGMA ignore_check_constraints=ON; PRAGMA foreign_keys=OFF");
        if (kind === "profile") db.exec("UPDATE runtime_control_meta SET profile='unsupported'");
        else db.prepare("UPDATE runtime_control_meta SET authorityIncarnation=?").run(randomUUID());
        db.exec(String(trigger.sql));
      }
      db.close();
    }
    const before = fs.readFileSync(filename(f)); await rejects(f.owner.reopen(f.scope));
    expect(f.owner.diagnostics().liveConnections).toBe(0); expect(fs.readFileSync(filename(f))).toEqual(before);
  });
  it("I08 missing OPEN_EXISTING file is not created", async () => {
    const f = await build(), { storage } = await initialized(f); await f.host.close();
    fs.renameSync(filename(f), filename(f) + ".retained");
    const next = await attach(f, undefined, reopenConfig(f, storage)); await rejects(next.owner.acquire(next.scope));
    expect(fs.existsSync(filename(f))).toBe(false);
  });
  it("I09 forged/consumed host token denies; internal non-fixture repository is physically read-only", async () => {
    const f = await build(); await initialized(f);
    const registry = await ProjectRegistry.acquire(path.join(f.base, "independent-registry"));
    try {
      const registered = await validateRoot(f.projects[0]!);
      const storage = await f.owner.storageIdentity(f.scope), provider = HostSQLiteProvider.create(reopenConfig(f, storage), registry.root.canonicalPath,
        id => ({ identity: { schemaVersion: 1, projectId: id, createdAt: "2026-11-09T00:00:00.000Z" }, canonicalPath: f.bindings.find(b => b.projectId === id)!.workspaceRoot,
          fileKey: id === f.scope.projectId ? registered.fileKey : fileKey(f.projects[1]!), status: "IDENTITY_ATTACHED" }));
      for (const token of [{ sourceClass: "HOST_SQLITE" }, {}, { db: {} }]) expect(() => DurableAttemptRepository.openHostOwnedSQLite(token)).toThrow();
      const token = provider.open(f.scope.projectId), repo = own(DurableAttemptRepository.openHostOwnedSQLite(token));
      expect(() => DurableAttemptRepository.openHostOwnedSQLite(token)).toThrow(); discardHostSQLiteConnection(token);
      const fakeRef = { ...root, databaseToken: randomUUID(), projectId: f.scope.projectId, authorityIncarnation: f.bindings[0]!.authorityIncarnation };
      try { repo.issue(issueCommand(fakeRef)); throw new Error("Expected read-only failure"); }
      catch (error) { expect(error).toMatchObject({ code: "DATABASE_FAILURE", sqlite: { primary: 8 } }); }
      expect(repo.settings.journalMode).toBe("delete");
      repo.close();
    } finally { await registry.close(); }
  });
});

function fileKey(file: string) { const s = fs.lstatSync(file, { bigint: true }); return `${s.dev}:${s.ino}`; }
describe("PI07 filesystem confinement and isolation", () => {
  it.each(["file", "folder", "root", "workspace"])("P01 replaced %s identity denies and preserves retained data", async kind => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    const target = kind === "file" ? filename(f) : kind === "folder" ? path.dirname(filename(f)) : kind === "root" ? f.config.storageRoot : f.projects[0]!;
    if (!isWithin(root.root, target)) throw new Error("Disposable target required");
    fs.renameSync(target, target + ".retained");
    if (kind === "file") fs.copyFileSync(target + ".retained", target, fs.constants.COPYFILE_EXCL);
    else fs.mkdirSync(target);
    await rejects(f.owner.reopen(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect(fs.existsSync(target + ".retained")).toBe(true);
  });
  it("P02 controlled junction redirection is rejected", async () => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    const folder = path.dirname(filename(f)), target = path.join(f.base, "junction-target");
    if (!isWithin(root.root, folder) || !isWithin(root.root, target)) throw new Error("Disposable targets required");
    fs.renameSync(folder, folder + ".retained"); fs.mkdirSync(target); fs.symlinkSync(target, folder, "junction");
    await rejects(f.owner.reopen(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it("P07 hard-linked database file is rejected", async () => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    const link = path.join(f.base, "retained-hardlink.db");
    if (!isWithin(root.root, link)) throw new Error("Disposable link required");
    fs.linkSync(filename(f), link); await rejects(f.owner.reopen(f.scope));
    expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it.each(["-wal", "-shm", "-journal", ".unexpected"])("P03 unexpected sidecar %s denies without replay/removal", async suffix => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    fs.writeFileSync(filename(f) + suffix, "retained", { flag: "wx" });
    await rejects(f.owner.reopen(f.scope)); expect(fs.readFileSync(filename(f) + suffix, "utf8")).toBe("retained");
  });
  it("P04 project switch isolates stores and rejects the stale facade and swapped metadata", async () => {
    const f = await build(), { handle: a, storage: ia } = await initialized(f);
    const scopeB = await switchB(f), b = await f.owner.acquire(scopeB), ib = await f.owner.storageIdentity(scopeB);
    expect(ia.storageId).not.toBe(ib.storageId); expect(ia.databaseKey).not.toBe(ib.databaseKey);
    await rejects(a.assessExecutionReadiness({})); await rejects(f.owner.acquire(f.scope)); await rejects(f.owner.reopen(f.scope));
    await a.close(); expect(f.owner.diagnostics().liveConnections).toBe(1);
    expect((await b.assessExecutionReadiness({})).executionAuthority).toBe(false);
    await rejects(b.inspectAttempt({ projectId: f.scope.projectId, authorityIncarnation: ia.authorityIncarnation, taskId: "test", attemptId: randomUUID() }));
    await b.close();
    fs.writeFileSync(path.join(path.dirname(filename(f, 1)), "storage.json"), JSON.stringify(ia));
    await rejects(f.owner.reopen(scopeB));
  });
  it("P05 detach and reattach reuse cannot revive the old workspace lease", async () => {
    const f = await build(), { handle } = await initialized(f);
    await f.host.manager.detach({ expectedGeneration: f.scope.binding.generation, scope: f.scope });
    await rejects(f.owner.reopen(f.scope)); await rejects(handle.assessExecutionReadiness({}));
    const current = await f.host.manager.current(), opened = await f.host.manager.open({ path: f.projects[0]!, expectedGeneration: current.view.generation });
    if (!("binding" in opened.view)) throw new Error("Binding required");
    const h = await f.owner.acquire({ projectId: f.scope.projectId, binding: opened.view.binding });
    expect(h.binding.bindingId).not.toBe(handle.binding.bindingId); expect((await h.assessExecutionReadiness({})).executionAuthority).toBe(false);
  });
  it("P06 independent hosts acquire concurrently; closing A leaves B owned", async () => {
    const [a, b] = await Promise.all([build(), build()]);
    const [ha, hb] = await Promise.all([a.owner.acquire(a.scope), b.owner.acquire(b.scope)]);
    expect((await a.owner.storageIdentity(a.scope)).databaseKey).not.toBe((await b.owner.storageIdentity(b.scope)).databaseKey);
    await a.host.close(); await rejects(ha.assessExecutionReadiness({}));
    expect((await hb.assessExecutionReadiness({})).executionAuthority).toBe(false); expect(b.owner.diagnostics().liveConnections).toBe(1);
  });
});

describe("PI07 lifecycle and bounded failures", () => {
  it("L01 concurrent acquires share a connection; explicit reopen creates a new resource generation", async () => {
    const f = await build(), [a, b, c] = await Promise.all([f.owner.acquire(f.scope), f.owner.acquire(f.scope), f.owner.acquire(f.scope)]);
    expect(a).toBe(b); expect(b).toBe(c); expect(f.owner.diagnostics().liveConnections).toBe(1);
    await Promise.all([a.close(), b.close(), a.close()]); await rejects(a.assessExecutionReadiness({})); await rejects(f.owner.acquire(f.scope));
    const next = await f.owner.reopen(f.scope); expect(next.resourceGeneration).toBeGreaterThan(a.resourceGeneration);
    expect((await next.assessExecutionReadiness({})).executionAuthority).toBe(false);
  });
  it.each(["beforeOpen", "afterOpen"] as const)("L02 controlled %s error exposes no partial handle and closes resources", async stage => {
    let enabled = true; const f = await build({ stage: current => { if (enabled && current === stage) throw new Error("PI07_OPEN_FAULT"); } });
    await rejects(f.owner.acquire(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(0);
    enabled = false; const h = await f.owner.reopen(f.scope); expect((await h.assessExecutionReadiness({})).executionAuthority).toBe(false);
  });
  it.each(["beforeOpen", "afterOpen"] as const)("L03 shutdown during %s drains and rejects pending acquisition", async stage => {
    const gate = barrier(), f = await build({ stage: current => current === stage ? gate.pause() : undefined });
    const acquiring = f.owner.acquire(f.scope), denied = rejects(acquiring); await gate.entered;
    const closing = f.host.close(); gate.release(); await denied; await closing;
    expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it("L04 shutdown pending operation revokes before SQL and waits for release", async () => {
    const gate = barrier(); let blocked = false;
    const f = await build({ stage: stage => blocked && stage === "beforeOperation" ? gate.pause() : undefined });
    const { handle } = await initialized(f); blocked = true;
    const denied = rejects(handle.assessExecutionReadiness({})); await gate.entered;
    const closing = f.host.close(); gate.release(); await denied; await closing;
    expect(f.owner.diagnostics()).toMatchObject({ liveConnections: 0, executionAuthority: false });
  });
  it("L05 close failure quarantines ownership until explicit cleanup retry", async () => {
    let fail = true; const f = await build({ stage: stage => { if (stage === "beforeClose" && fail) throw new Error("PI07_CLOSE_FAULT"); } });
    const { handle } = await initialized(f); await rejects(handle.close());
    expect(f.owner.diagnostics().liveConnections).toBe(1); await rejects(f.owner.acquire(f.scope)); await rejects(f.owner.reopen(f.scope));
    await rejects(f.host.close()); expect(fs.existsSync(path.join(f.dataRoot, "writer.lock"))).toBe(true);
    fail = false; await f.host.close(); expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect(fs.existsSync(path.join(f.dataRoot, "writer.lock"))).toBe(false);
  });
  it("L06 generation invalidation during acquisition prevents stale success", async () => {
    const gate = barrier(); let enabled = true;
    const f = await build({ stage: stage => enabled && stage === "beforeOpen" ? gate.pause() : undefined });
    const denied = rejects(f.owner.acquire(f.scope)); await gate.entered;
    const bScope = await switchB(f); enabled = false; gate.release(); await denied; await rejects(f.owner.reopen(f.scope));
    const b = await f.owner.acquire(bScope); expect((await b.assessExecutionReadiness({})).executionAuthority).toBe(false);
  });
  it("L07 actual SQLite exclusive lock fails closed then retry remains denied", async () => {
    const f = await seeded(), h = await f.owner.reopen(f.scope); f.raw.exec("BEGIN EXCLUSIVE");
    try { const d = await h.assessExecutionReadiness(f.request); expect(d).toMatchObject({ executionAuthority: false, eligible: false, reason: "STORAGE_UNAVAILABLE" }); }
    finally { f.raw.exec("ROLLBACK"); }
    expect(f.owner.diagnostics().entries[0]!.operations).toBe(0);
    expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
  });
  it("L08 awaited reentrant acquisition rejects while unrelated concurrent callers share opening", async () => {
    const gate = barrier(); let f!: F, enabled = true;
    f = await build({ stage: async stage => { if (enabled && stage === "beforeOpen") { await rejects(f.owner.acquire(f.scope)); await gate.pause(); } } });
    const first = f.owner.acquire(f.scope); await gate.entered; const second = f.owner.acquire(f.scope); enabled = false; gate.release();
    expect(await second).toBe(await first); expect(f.owner.diagnostics().liveConnections).toBe(1);
  });
  it("L09 simultaneous explicit reopen calls share one replacement and cannot orphan a connection", async () => {
    const f = await build(), { handle } = await initialized(f); await handle.close();
    const [a, b, c] = await Promise.all([f.owner.reopen(f.scope), f.owner.reopen(f.scope), f.owner.reopen(f.scope)]);
    expect(a).toBe(b); expect(b).toBe(c); expect(f.owner.diagnostics().liveConnections).toBe(1);
    expect((await a.assessExecutionReadiness({})).executionAuthority).toBe(false);
  });
  it("L10 SQLite close adapter failure retains ownership and fences all operations until retry", async () => {
    const f = await build(), { handle } = await initialized(f), close = vi.spyOn(DatabaseSync.prototype, "close");
    close.mockImplementationOnce(() => { throw new Error("PI07_DRIVER_CLOSE_FAULT"); });
    await rejects(handle.close()); expect(f.owner.diagnostics().liveConnections).toBe(1);
    await rejects(handle.assessExecutionReadiness({})); await rejects(f.owner.acquire(f.scope));
    await handle.close(); expect(f.owner.diagnostics().liveConnections).toBe(0);
  });
  it("L11 initialization plus persistent driver close failure retains unadopted ownership until cleanup retry", async () => {
    const f = await build({ initializationFault: "afterSchema" }), original = DatabaseSync.prototype.close; let fail = true;
    vi.spyOn(DatabaseSync.prototype, "close").mockImplementation(function(this: DatabaseSync) {
      if (fail) throw new Error("PI07_PARTIAL_DRIVER_CLOSE_FAULT"); return original.call(this);
    });
    await rejects(f.owner.acquire(f.scope)); expect(f.owner.diagnostics().liveConnections).toBe(1);
    await rejects(f.owner.acquire(f.scope)); await rejects(f.owner.reopen(f.scope)); await rejects(f.host.close());
    expect(fs.existsSync(path.join(f.dataRoot, "writer.lock"))).toBe(true);
    fail = false; await f.host.close(); expect(f.owner.diagnostics().liveConnections).toBe(0);
    expect(fs.existsSync(path.join(f.dataRoot, "writer.lock"))).toBe(false);
  });
});

describe("PI07 security semantics on non-fixture storage", () => {
  it.each(["UNKNOWN", "BLOCKED", "ACTIVE_STOP", "MISSING"] as const)("S01 %s state remains denied and unchanged across reopen", async state => {
    const f = await seeded(state), before = f.raw.prepare("SELECT * FROM runtime_execution_security").all();
    const h = await f.owner.reopen(f.scope), d = await h.assessExecutionReadiness(f.request);
    expect(d).toMatchObject({ executionAuthority: false, eligible: false });
    if (state === "UNKNOWN") expect(d.reason).toBe("SECURITY_STATE_UNKNOWN");
    if (state === "ACTIVE_STOP") expect(d.reason).toBe("SECURITY_STOP_ACTIVE");
    await h.close(); const next = await f.owner.reopen(f.scope);
    expect((await next.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
    expect(f.raw.prepare("SELECT * FROM runtime_execution_security").all()).toEqual(before);
    expect(await next.inspectAttempt(identity(f.attempt))).toMatchObject({ executionAuthority: false, attemptId: f.attempt.attemptId });
  });
  it("S02 tracked journal corruption denies reopening without backfill", async () => {
    const f = await seeded("ACTIVE_STOP"); f.raw.exec("PRAGMA foreign_keys=OFF; DROP TRIGGER runtime_security_stop_events_no_update");
    f.raw.exec("UPDATE runtime_security_stop_events SET eventDigest='" + "0".repeat(64) + "'");
    // Restore exact canonical DDL while retaining corrupted data, isolating journal validation from schema validation.
    const { SCHEMA_STATEMENTS } = await import("../../../src/server/attempt-control/schema.js");
    f.raw.exec(SCHEMA_STATEMENTS.find(s => s.startsWith("CREATE TRIGGER runtime_security_stop_events_no_update"))!);
    const before = fs.readFileSync(filename(f)); await rejects(f.owner.reopen(f.scope)); expect(fs.readFileSync(filename(f))).toEqual(before);
  });
  it("S03 stale revision/incarnation/epoch and malformed provenance/session never grant authority", async () => {
    const f = await seeded(), h = await f.owner.reopen(f.scope);
    for (const q of [{ ...f.request, securityRevision: 99 }, { ...f.request, expected: { ...f.request.expected, authorityIncarnation: randomUUID() } },
      { ...f.request, expected: { ...f.request.expected, attemptGeneration: 99 } }])
      expect((await h.assessExecutionReadiness(q)).executionAuthority).toBe(false);
    expect((await h.assessProvenanceReadiness({ ...f.request, principalId: randomUUID(), trusted: true })).executionAuthority).toBe(false);
    expect((await h.assessSessionReadiness({ ...f.request, sessionId: "forged" }, { authenticated: true })).executionAuthority).toBe(false);
  });
  it("S04 append-only journal/revision and idempotency records survive host reads and OPEN_EXISTING", async () => {
    const f = await seeded("ACTIVE_STOP"), h = await f.owner.reopen(f.scope), storage = await f.owner.storageIdentity(f.scope);
    const snapshot = () => ["runtime_execution_security", "runtime_security_stop_events", "runtime_security_stop_operations"].map(t => f.raw.prepare(`SELECT * FROM ${t}`).all());
    const before = snapshot(); expect((await h.assessExecutionReadiness(f.request)).executionAuthority).toBe(false);
    expect(() => f.raw.exec("UPDATE runtime_security_stop_events SET reason='INTEGRITY_CONCERN'")).toThrow();
    expect(() => f.raw.exec("DELETE FROM runtime_security_stop_operations")).toThrow();
    await f.host.close(); const next = await attach(f, undefined, reopenConfig(f, storage)), nextHandle = await next.owner.acquire(next.scope);
    // Immutable attempt binding belongs to the old lease, so a new manager cannot adopt it.
    await rejects(nextHandle.inspectAttempt(identity(f.attempt)));
    expect(snapshot()).toEqual(before); expect(before[0]![0]).toMatchObject({ securityRevision: 2, securityState: "ACTIVE_STOP" });
  });
  it("S05 import/composition performs no HTTP, process, credential, provider or publication bootstrap", async () => {
    const net = await import("node:net"), children = await import("node:child_process");
    const listener = vi.spyOn(net.Server.prototype, "listen"), spawn = vi.spyOn(children.default, "spawn"), fetch = vi.spyOn(globalThis, "fetch");
    const f = await build(), { handle } = await initialized(f); await import("../../../src/server/index.js");
    expect((await handle.assessExecutionReadiness({})).executionAuthority).toBe(false);
    expect(listener).not.toHaveBeenCalled(); expect(spawn).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    expect(Object.keys(handle).sort()).toEqual(["sourceClass", "hostInstanceId", "resourceGeneration", "binding", "inspectAttempt",
      "assessExecutionReadiness", "assessProvenanceReadiness", "assessSessionReadiness", "close"].sort());
  });
  it.each(["principal", "policy", "grant", "revoked-policy"])("S06 persisted %s denial uses unchanged provenance evaluator", async kind => {
    const f = await seeded(), ids = { principalId: randomUUID(), policyId: randomUUID(), grantId: randomUUID() };
    const common = { recordVersion: 1, projectId: f.scope.projectId, authorityIncarnation: f.attempt.authorityIncarnation,
      sourceId: "pi03-fixture-source-v1", sourceRevision: 1, sourceClass: "LOCAL_TEST_FIXTURE", status: "ACTIVE", validFromMs: 1000, expiresAtMs: 10000 };
    function insert(table: string, row: object) {
      const keys = Object.keys(row); f.raw.prepare(`INSERT INTO ${table}(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`)
        .run(...Object.values(row) as (string | number)[]);
    }
    insert("runtime_principal_provenance", { ...common, principalId: ids.principalId, principalKind: "HUMAN", revision: 1 });
    insert("runtime_policy_provenance", { ...common, policyId: ids.policyId, revision: 1, policyVersion: 1,
      status: kind === "revoked-policy" ? "REVOKED" : "ACTIVE", action: "attempt.execute", taskId: f.attempt.taskId, destinationId: "fixture-output" });
    insert("runtime_grant_provenance", { ...common, ...ids, authorizationRevision: 1, principalRevision: 1, policyRevision: 1,
      policyVersion: 1, sessionId: "execution:pi07", attemptId: f.attempt.attemptId, attemptGeneration: 1,
      action: "attempt.execute", taskId: f.attempt.taskId, destinationId: "fixture-output" });
    const q = { ...f.request, ...ids, principalRevision: 1, policyRevision: 1, policyVersion: 1, authorizationRevision: 1,
      sourceRevision: 1, sessionId: "execution:pi07", action: "attempt.execute", destinationId: "fixture-output", atMs: 2000 };
    if (kind === "principal") q.principalId = randomUUID();
    if (kind === "policy") q.policyId = randomUUID();
    if (kind === "grant") q.grantId = randomUUID();
    const h = await f.owner.reopen(f.scope), d = await h.assessProvenanceReadiness(q);
    expect(d.executionAuthority).toBe(false);
    expect(d.provenanceReasons).toContain(kind === "revoked-policy" ? "POLICY_REVOKED" : kind.toUpperCase() + "_MISSING");
    const session = await h.assessSessionReadiness({ ...f.request, executionSessionId: "execution:pi07", sessionRevision: 1,
      workspaceBindingId: f.scope.binding.bindingId, workspaceGeneration: f.scope.binding.generation,
      action: "attempt.execute", destinationId: "fixture-output", atMs: 2000 }, { authenticated: true });
    expect(session.executionAuthority).toBe(false); expect(session.sessionReasons).toContain("SESSION_MISSING");
    expect(session.hostAuthority).toBe("PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
  });
  it("S07 malformed security row is refused without reconstructing state", async () => {
    const f = await seeded(); f.raw.exec("DROP TRIGGER runtime_security_guard; PRAGMA ignore_check_constraints=ON");
    f.raw.exec("UPDATE runtime_execution_security SET recordVersion=2");
    const { SCHEMA_STATEMENTS } = await import("../../../src/server/attempt-control/schema.js");
    f.raw.exec(SCHEMA_STATEMENTS.find(s => s.startsWith("CREATE TRIGGER runtime_security_guard"))!);
    await rejects(f.owner.reopen(f.scope)); expect(f.raw.prepare("SELECT recordVersion FROM runtime_execution_security").get()?.recordVersion).toBe(2);
  });
});
