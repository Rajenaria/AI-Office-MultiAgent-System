import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";
import { z } from "zod";
import { ProjectOperationScopeSchema, type WorkspaceBindingRef } from "../../contracts/index.js";
import type { WorkspaceManager } from "../workspace/manager.js";
import { ProjectRegistry } from "../workspace/registry.js";
import { checkedDescendant, isWithin, validateRoot } from "../workspace/paths.js";
import { WorkspaceFailure } from "../workspace/errors.js";
import { AuthorityFailure, IdentitySchema, nextInteger } from "./contracts.js";
import { ReadinessRequestSchema, denyReadiness } from "./execution-readiness.js";
import { ProvenanceRequestSchema, provenanceDecision } from "./provenance.js";
import { SessionReadinessRequestSchema, sessionDecision } from "./host-session.js";
import { DurableAttemptRepository } from "./repository.js";
import { discardUnclaimedFixtureConnection, openOwnedFixtureConnection } from "./connection.js";
import { TestDatabaseRefSchema, verifyTestRoot, type TestRoot, type TestDatabaseRef } from "./test-storage.js";
import { HostSQLiteProvider, discardHostSQLiteConnection, type SQLiteInitializationFault } from "./host-sqlite.js";

const ConfigSchema = z.strictObject({ sourceClass: z.literal("LOCAL_TEST_FIXTURE"), root: z.unknown(),
  bindings: z.array(z.strictObject({ workspaceRoot: z.string(), storage: TestDatabaseRefSchema })).max(1000) });
export type FixtureWorkspaceRepositories = Readonly<{ sourceClass: "LOCAL_TEST_FIXTURE"; root: TestRoot;
  bindings: readonly Readonly<{ workspaceRoot: string; storage: TestDatabaseRef }>[] }>;
export type RepositoryStage = "beforeOpen" | "afterOpen" | "beforeOperation" | "beforeClose";
// Explicit host/test dependency, never request data. Hooks are outside SQLite transactions.
export type RepositoryTestControl = Readonly<{ queryOnly?: boolean; initializationFault?: SQLiteInitializationFault;
  stage?: (stage: RepositoryStage) => void | Promise<void> }>;
type Scope = z.infer<typeof ProjectOperationScopeSchema>;
type Entry = { scope: Scope; generation: number; state: "OPENING" | "OPEN" | "CLOSING" | "CLOSED" | "FAILED";
  revoked: boolean; operations: number; drained: (() => void)[]; repository?: DurableAttemptRepository | undefined;
  opening?: Promise<WorkspaceRepositoryHandle>; closing?: Promise<void> | undefined; handle?: WorkspaceRepositoryHandle };
function rejected(reason: string): never { throw new WorkspaceFailure("ACCESS_DENIED", reason, 403); }
function scopeOf(input: unknown): Scope {
  try { return ProjectOperationScopeSchema.parse(input); } catch { return rejected("INVALID_REPOSITORY_WORKSPACE_SCOPE"); }
}
export type WorkspaceRepositoryHandle = Readonly<{
  sourceClass: "LOCAL_TEST_FIXTURE" | "HOST_SQLITE"; hostInstanceId: string; resourceGeneration: number; binding: WorkspaceBindingRef;
  inspectAttempt(input: unknown): Promise<Readonly<{ attemptId: string; phase: string; stateVersion: number; attemptGeneration: number; executionAuthority: false }>>;
  assessExecutionReadiness(input: unknown): Promise<ReturnType<DurableAttemptRepository["assessExecutionReadiness"]>>;
  assessProvenanceReadiness(input: unknown): Promise<ReturnType<DurableAttemptRepository["assessProvenanceReadiness"]>>;
  assessSessionReadiness(input: unknown, context?: unknown): Promise<ReturnType<DurableAttemptRepository["assessSessionReadiness"]>>;
  close(): Promise<void>;
}>;

export class HostWorkspaceRepositories {
  readonly #hostInstanceId = randomUUID();
  readonly #entries = new Map<string, Entry>();
  readonly #leases = new Map<string, Entry>();
  readonly #reopening = new Map<string, Promise<WorkspaceRepositoryHandle>>();
  readonly #openingContext = new AsyncLocalStorage<Entry>();
  #generation = 0;
  #stopping = false;
  #closing: Promise<void> | undefined;
  private constructor(private readonly manager: WorkspaceManager, private readonly registry: ProjectRegistry,
    private readonly root: TestRoot | undefined, private readonly bindings: ReadonlyMap<string, { workspaceRoot: string; storage: TestDatabaseRef }>,
    private readonly control?: RepositoryTestControl, private readonly provider?: HostSQLiteProvider) {}
  static forHostSQLite(manager: WorkspaceManager, registry: ProjectRegistry, input: unknown, control?: RepositoryTestControl) {
    const provider = HostSQLiteProvider.create(input, registry.root.canonicalPath, id => registry.byProject(id), control?.initializationFault);
    return new HostWorkspaceRepositories(manager, registry, undefined, new Map(), control, provider);
  }
  static async forFixtures(manager: WorkspaceManager, registry: ProjectRegistry, input: unknown, control?: RepositoryTestControl) {
    const config = ConfigSchema.parse(input), root = verifyTestRoot(config.root);
    if (!isWithin(root.root, registry.root.canonicalPath) || root.root === registry.root.canonicalPath) rejected("REGISTRY_OUTSIDE_FIXTURE_OWNER");
    await checkedDescendant(await validateRoot(root.root), path.relative(root.root, registry.root.canonicalPath).replaceAll("\\", "/"));
    const bindings = new Map<string, { workspaceRoot: string; storage: TestDatabaseRef }>(), files = new Set<string>();
    const roots = new Set<string>();
    for (const item of config.bindings) {
      if (item.storage.root !== root.root || item.storage.rootToken !== root.rootToken ||
        !isWithin(root.root, item.workspaceRoot) || item.workspaceRoot === root.root ||
        isWithin(registry.root.canonicalPath, item.workspaceRoot)) rejected("STORAGE_OUTSIDE_FIXTURE_OWNER");
      const workspaceRoot = await checkedDescendant(await validateRoot(root.root), path.relative(root.root, item.workspaceRoot).replaceAll("\\", "/"));
      await validateRoot(workspaceRoot);
      if (bindings.has(item.storage.projectId) || files.has(item.storage.databaseToken) || roots.has(workspaceRoot.toLowerCase()))
        rejected("REPOSITORY_STORAGE_COLLISION");
      bindings.set(item.storage.projectId, Object.freeze({ workspaceRoot, storage: Object.freeze({ ...item.storage }) }));
      files.add(item.storage.databaseToken); roots.add(workspaceRoot.toLowerCase());
    }
    return new HostWorkspaceRepositories(manager, registry, Object.freeze(root), bindings, control);
  }
  private key(scope: Scope) { return scope.binding.bindingId + ":" + scope.binding.generation; }
  private async validate(scope: Scope) {
    if (this.#stopping) rejected("REPOSITORY_HOST_CLOSING");
    if (this.root) verifyTestRoot(this.root);
    const canonical = await this.manager.inspect(scope), config = this.bindings.get(canonical.identity.projectId);
    const registered = this.registry.byProject(canonical.identity.projectId);
    if (this.provider) {
      if (!registered) rejected("REPOSITORY_WORKSPACE_NOT_CONFIGURED");
      this.provider.validate(canonical.identity.projectId, registered);
      if (this.#stopping) rejected("REPOSITORY_HOST_CLOSING");
      return undefined;
    }
    if (!config || !registered || registered.status !== "IDENTITY_ATTACHED" ||
      registered.canonicalPath !== config.workspaceRoot || config.storage.projectId !== scope.projectId)
      rejected("REPOSITORY_WORKSPACE_NOT_CONFIGURED");
    await checkedDescendant(await validateRoot(this.root!.root), path.relative(this.root!.root, registered.canonicalPath).replaceAll("\\", "/"));
    if (this.#stopping) rejected("REPOSITORY_HOST_CLOSING");
    return config;
  }
  async acquire(input: unknown): Promise<WorkspaceRepositoryHandle> {
    const scope = scopeOf(input), key = this.key(scope);
    if (this.#openingContext.getStore() === this.#entries.get(key) && this.#entries.has(key))
      rejected("REENTRANT_REPOSITORY_ACQUIRE");
    const config = await this.validate(scope);
    const existing = this.#entries.get(key);
    if (existing) {
      if (existing.revoked || existing.state === "CLOSED" || existing.state === "FAILED") rejected("REPOSITORY_EXPLICIT_REOPEN_REQUIRED");
      return existing.opening!;
    }
    if (this.#leases.has(scope.projectId)) rejected("PREVIOUS_REPOSITORY_STILL_OWNED");
    this.#generation = nextInteger(this.#generation);
    const entry: Entry = { scope, generation: this.#generation, state: "OPENING", revoked: false, operations: 0, drained: [] };
    this.#entries.set(key, entry); this.#leases.set(scope.projectId, entry);
    entry.opening = (async () => {
      try {
        await this.#openingContext.run(entry, () => this.control?.stage?.("beforeOpen"));
        await this.validate(scope); this.live(entry, false);
        if (this.provider) {
          const token = this.provider.open(scope.projectId);
          try { entry.repository = DurableAttemptRepository.openHostOwnedSQLite(token); }
          finally { discardHostSQLiteConnection(token); }
        } else {
          const token = openOwnedFixtureConnection(config!.storage, this.control?.queryOnly === true);
          try { entry.repository = DurableAttemptRepository.openHostOwnedForFixtures(token); }
          finally { discardUnclaimedFixtureConnection(token); }
        }
        await this.#openingContext.run(entry, () => this.control?.stage?.("afterOpen"));
        await this.validate(scope); this.live(entry, false);
        entry.handle = this.facade(entry); entry.state = "OPEN"; return entry.handle;
      } catch (error) {
        entry.revoked = true; entry.state = "FAILED";
        try { await this.dispose(entry); }
        catch (closeError) { throw new AggregateError([error, closeError], "REPOSITORY_OPEN_AND_CLOSE_FAILED"); }
        throw error;
      }
    })();
    return entry.opening;
  }
  private live(entry: Entry, opened = true) {
    if (this.#stopping || entry.revoked || (opened && entry.state !== "OPEN")) rejected("REPOSITORY_HANDLE_REVOKED");
  }
  private async run<T>(entry: Entry, operation: (repository: DurableAttemptRepository) => T): Promise<T> {
    this.live(entry); entry.operations++;
    try {
      await this.validate(entry.scope); await this.control?.stage?.("beforeOperation");
      await this.validate(entry.scope); this.live(entry);
      return operation(entry.repository!); // Synchronous repository transaction; no await inside SQL.
    } finally {
      entry.operations--;
      if (entry.operations === 0) for (const done of entry.drained.splice(0)) done();
    }
  }
  private scopedAttempt(repository: DurableAttemptRepository, entry: Entry, input: z.infer<typeof IdentitySchema>) {
    if (input.projectId !== entry.scope.projectId) rejected("REPOSITORY_PROJECT_MISMATCH");
    const attempt = repository.read(input);
    if (attempt.bindingId !== entry.scope.binding.bindingId || attempt.bindingGeneration !== entry.scope.binding.generation)
      rejected("REPOSITORY_ATTEMPT_WORKSPACE_MISMATCH");
    return attempt;
  }
  private checkExpected(repository: DurableAttemptRepository, entry: Entry, expected: z.infer<typeof IdentitySchema>) {
    try { this.scopedAttempt(repository, entry, { projectId: expected.projectId, authorityIncarnation: expected.authorityIncarnation,
      taskId: expected.taskId, attemptId: expected.attemptId }); }
    catch (error) { if (!(error instanceof AuthorityFailure)) throw error; } // Existing evaluator returns structured storage/identity denial.
  }
  private facade(entry: Entry): WorkspaceRepositoryHandle {
    return Object.freeze({ sourceClass: this.provider ? "HOST_SQLITE" : "LOCAL_TEST_FIXTURE", hostInstanceId: this.#hostInstanceId,
      resourceGeneration: entry.generation, binding: Object.freeze({ ...entry.scope.binding }),
      inspectAttempt: (input: unknown) => this.run(entry, repository => {
        const attempt = this.scopedAttempt(repository, entry, IdentitySchema.parse(input));
        return Object.freeze({ attemptId: attempt.attemptId, phase: attempt.phase, stateVersion: attempt.stateVersion,
          attemptGeneration: attempt.attemptGeneration, executionAuthority: false as const });
      }),
      assessExecutionReadiness: (input: unknown) => this.run(entry, repository => {
        const q = ReadinessRequestSchema.safeParse(input);
        if (!q.success) return denyReadiness(["INVALID_REQUEST"]);
        this.checkExpected(repository, entry, q.data.expected); return repository.assessExecutionReadiness(q.data);
      }),
      assessProvenanceReadiness: (input: unknown) => this.run(entry, repository => {
        const q = ProvenanceRequestSchema.safeParse(input);
        if (!q.success) return provenanceDecision(denyReadiness(["INVALID_REQUEST"]), ["PROVENANCE_NOT_EVALUATED"]);
        this.checkExpected(repository, entry, q.data.expected); return repository.assessProvenanceReadiness(q.data);
      }),
      assessSessionReadiness: (input: unknown, context?: unknown) => this.run(entry, repository => {
        const q = SessionReadinessRequestSchema.safeParse(input);
        if (!q.success) return sessionDecision(provenanceDecision(denyReadiness(["INVALID_REQUEST"]), ["PROVENANCE_NOT_EVALUATED"]), ["SESSION_NOT_EVALUATED"]);
        this.checkExpected(repository, entry, q.data.expected); return repository.assessSessionReadiness(q.data, context);
      }),
      close: () => this.closeEntry(entry),
    });
  }
  private async dispose(entry: Entry) {
    if (entry.repository) {
      await this.control?.stage?.("beforeClose"); entry.repository.close(); entry.repository = undefined;
    }
    this.provider?.cleanup(entry.scope.projectId);
    entry.state = "CLOSED";
    if (this.#leases.get(entry.scope.projectId) === entry) this.#leases.delete(entry.scope.projectId);
  }
  private closeEntry(entry: Entry): Promise<void> {
    entry.revoked = true;
    if (entry.state === "CLOSED") return Promise.resolve();
    if (entry.closing) return entry.closing;
    entry.state = "CLOSING";
    entry.closing = (async () => {
      await entry.opening?.catch(() => undefined);
      if (entry.operations) await new Promise<void>(resolve => entry.drained.push(resolve));
      await this.dispose(entry);
    })().catch(error => { entry.state = "FAILED"; entry.closing = undefined; throw error; });
    return entry.closing;
  }
  invalidate(): void {
    for (const entry of this.#entries.values()) {
      entry.revoked = true; void this.closeEntry(entry).catch(() => undefined); // Retained in entries/leases; explicit close retries failure.
    }
  }
  async reopen(input: unknown): Promise<WorkspaceRepositoryHandle> {
    const scope = scopeOf(input);
    if (this.#openingContext.getStore() === this.#entries.get(this.key(scope)) && this.#entries.has(this.key(scope)))
      rejected("REENTRANT_REPOSITORY_ACQUIRE");
    const key = this.key(scope), existing = this.#reopening.get(key);
    if (existing) return existing;
    const reopening = (async () => {
      await this.validate(scope);
      const previous = this.#entries.get(key);
      if (previous) await this.closeEntry(previous);
      await this.validate(scope); this.#entries.delete(key); return this.acquire(scope);
    })();
    this.#reopening.set(key, reopening);
    try { return await reopening; } finally { this.#reopening.delete(key); }
  }
  close(): Promise<void> {
    if (this.#openingContext.getStore())
      return Promise.reject(new WorkspaceFailure("ACCESS_DENIED", "REENTRANT_REPOSITORY_CLOSE", 403));
    if (this.#closing) return this.#closing;
    this.#stopping = true;
    this.#closing = Promise.allSettled([...this.#entries.values()].map(entry => this.closeEntry(entry))).then(results => {
      const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map(r => r.reason as unknown);
      if (errors.length) { this.#closing = undefined; throw new AggregateError(errors, "REPOSITORY_HOST_CLOSE_FAILED"); }
      this.#openingContext.disable();
    });
    return this.#closing;
  }
  diagnostics() {
    return Object.freeze({ hostInstanceId: this.#hostInstanceId, stopping: this.#stopping,
      liveConnections: this.provider?.ownedConnections() ?? [...this.#entries.values()].filter(entry => entry.repository !== undefined).length,
      entries: Object.freeze([...this.#entries.values()].map(entry => Object.freeze({ generation: entry.generation,
        state: entry.state, operations: entry.operations, revoked: entry.revoked }))),
      executionAuthority: false as const, productionHostAuthority: "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE" as const });
  }
  // Host provisioning receipt only; no path, SQLite handle, principal or execution permit.
  async storageIdentity(input: unknown) {
    const scope = scopeOf(input); await this.validate(scope);
    if (!this.provider) rejected("HOST_SQLITE_NOT_CONFIGURED");
    return this.provider.identity(scope.projectId);
  }
}
