import { closeSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { requireAuthority, databaseError } from "./contracts.js";
import { APPLICATION_ID, PROFILE, SCHEMA_DIGEST, SCHEMA_SQL, USER_VERSION } from "./schema.js";
import { BUSY_TIMEOUT_MS, configure, verifySchema } from "./sqlite-format.js";
import { ExecutionSecuritySchema } from "./execution-readiness.js";
import type { RepositoryConnection } from "./connection.js";
import { isWithin, validateLocalPath } from "../workspace/paths.js";
import type { RegistryEntry } from "../workspace/registry.js";

const Key = z.string().regex(/^\d+:\d+$/), Id = z.uuid().refine(s => s === s.toLowerCase());
const IdentitySchema = z.strictObject({ providerId: Id, storageId: Id, projectId: Id, authorityIncarnation: Id,
  rootKey: Key, directoryKey: Key, databaseKey: Key, workspaceKey: Key });
export type SQLiteStorageIdentity = Readonly<z.infer<typeof IdentitySchema>>;
const Common = { projectId: Id, workspaceRoot: z.string(), storageId: Id, authorityIncarnation: Id };
const BindingSchema = z.discriminatedUnion("initializationPolicy", [
  z.strictObject({ ...Common, initializationPolicy: z.literal("CREATE_NEW") }),
  z.strictObject({ ...Common, initializationPolicy: z.literal("OPEN_EXISTING"), identity: IdentitySchema }),
]);
const ConfigSchema = z.strictObject({ providerKind: z.literal("HOST_SQLITE"), providerId: Id,
  storageRoot: z.string(), bindings: z.array(BindingSchema).min(1).max(1000) });
export type HostSQLiteConfig = Readonly<z.infer<typeof ConfigSchema>>;
export type SQLiteInitializationFault = "afterSchema" | "afterSecurity" | "securityWrite";
export type OwnedHostSQLiteConnection = Readonly<{ sourceClass: "HOST_SQLITE" }>;
const pending = new WeakMap<object, RepositoryConnection>();
export function claimHostSQLiteConnection(input: unknown): RepositoryConnection {
  const owned = typeof input === "object" && input !== null ? pending.get(input) : undefined;
  requireAuthority(owned, "AUTHORITY_INVALID"); pending.delete(input as object); return owned;
}
export function discardHostSQLiteConnection(input: OwnedHostSQLiteConnection): void {
  const owned = pending.get(input); if (owned) { owned.close(); pending.delete(input); }
}
function key(filename: string, directory: boolean): string {
  const info = lstatSync(filename, { bigint: true });
  requireAuthority(!info.isSymbolicLink() && (directory ? info.isDirectory() : info.isFile() && info.nlink === 1n) &&
    realpathSync.native(filename) === filename, "UNSAFE_STORAGE");
  return `${info.dev}:${info.ino}`;
}
// Reject known links/aliases in every existing ancestor. This is not race-free handle-relative IO.
function directory(filename: string): string {
  requireAuthority(validateLocalPath(filename) === filename, "UNSAFE_STORAGE");
  let cursor = path.parse(filename).root;
  for (const part of filename.slice(cursor.length).split(path.sep)) { cursor = path.join(cursor, part); key(cursor, true); }
  return key(filename, true);
}
type Binding = z.infer<typeof BindingSchema>;
type Store = { binding: Binding; workspaceKey: string; identity?: SQLiteStorageIdentity };
const options = { timeout: BUSY_TIMEOUT_MS, allowExtension: false,
  enableDoubleQuotedStringLiterals: false, enableForeignKeyConstraints: true } as const;

// Construct only inside trusted host composition. Shape/UUIDs/markers are not authentication.
// No default root, fixture fallback, migration, asynchronous work or external effect on import.
export class HostSQLiteProvider {
  readonly #stores = new Map<string, Store>();
  readonly #connections = new Map<string, DatabaseSync>();
  readonly #rootKey: string;
  private constructor(private readonly config: HostSQLiteConfig, registryRoot: string,
    lookup: (projectId: string) => RegistryEntry | undefined, private readonly fault?: SQLiteInitializationFault) {
    this.#rootKey = directory(config.storageRoot);
    requireAuthority(!isWithin(config.storageRoot, registryRoot) && !isWithin(registryRoot, config.storageRoot), "UNSAFE_STORAGE");
    const ids = new Set<string>(), roots = new Set<string>();
    for (const binding of config.bindings) {
      validateLocalPath(path.join(config.storageRoot, binding.storageId, "authority.db"));
      const registered = lookup(binding.projectId), workspaceKey = directory(binding.workspaceRoot);
      requireAuthority(registered?.status === "IDENTITY_ATTACHED" && registered.canonicalPath === binding.workspaceRoot &&
        registered.fileKey === workspaceKey, "IDENTITY_CONFLICT");
      requireAuthority(!isWithin(binding.workspaceRoot, config.storageRoot) && !isWithin(config.storageRoot, binding.workspaceRoot), "UNSAFE_STORAGE");
      requireAuthority(!this.#stores.has(binding.projectId) && !ids.has(binding.storageId) &&
        !roots.has(binding.workspaceRoot.toLowerCase()), "IDENTITY_CONFLICT");
      ids.add(binding.storageId); roots.add(binding.workspaceRoot.toLowerCase());
      const store: Store = { binding, workspaceKey };
      if (binding.initializationPolicy === "OPEN_EXISTING") {
        this.assertIdentity(binding, binding.identity, workspaceKey); store.identity = Object.freeze({ ...binding.identity });
      }
      this.#stores.set(binding.projectId, store);
    }
  }
  static create(input: unknown, registryRoot: string, lookup: (projectId: string) => RegistryEntry | undefined,
    fault?: SQLiteInitializationFault): HostSQLiteProvider {
    // Parse creates a detached copy; no mutable caller object is retained.
    const config = ConfigSchema.parse(input);
    return new HostSQLiteProvider(config, registryRoot, lookup, fault);
  }
  private assertIdentity(binding: Binding, identity: SQLiteStorageIdentity, workspaceKey: string) {
    requireAuthority(identity.providerId === this.config.providerId && identity.storageId === binding.storageId &&
      identity.projectId === binding.projectId && identity.authorityIncarnation === binding.authorityIncarnation &&
      identity.rootKey === this.#rootKey && identity.workspaceKey === workspaceKey, "IDENTITY_CONFLICT");
  }
  validate(projectId: string, registered: RegistryEntry): void {
    const store = this.#stores.get(projectId);
    requireAuthority(store && registered.status === "IDENTITY_ATTACHED" && registered.identity.projectId === projectId &&
      registered.canonicalPath === store.binding.workspaceRoot && registered.fileKey === store.workspaceKey &&
      directory(registered.canonicalPath) === store.workspaceKey && directory(this.config.storageRoot) === this.#rootKey, "IDENTITY_CONFLICT");
    if (store.identity) this.validateStore(store, store.identity);
  }
  private filename(store: Store) { return path.join(this.config.storageRoot, store.binding.storageId, "authority.db"); }
  private validateStore(store: Store, identity: SQLiteStorageIdentity): string {
    this.assertIdentity(store.binding, identity, store.workspaceKey);
    requireAuthority(directory(this.config.storageRoot) === this.#rootKey && directory(store.binding.workspaceRoot) === store.workspaceKey, "UNSAFE_STORAGE");
    const filename = this.filename(store), folder = path.dirname(filename), marker = path.join(folder, "storage.json");
    requireAuthority(directory(folder) === identity.directoryKey && key(filename, false) === identity.databaseKey, "UNSAFE_STORAGE");
    key(marker, false);
    requireAuthority(lstatSync(marker).size <= 4096 && readFileSync(marker, "utf8") === JSON.stringify(identity), "IDENTITY_CONFLICT");
    // DELETE journal is required. Any sidecar/hot journal requires separate recovery review; never replay it implicitly.
    requireAuthority(JSON.stringify(readdirSync(folder).sort()) === JSON.stringify(["authority.db", "storage.json"]), "UNSAFE_STORAGE");
    return filename;
  }
  private initialize(store: Store): void {
    const folder = path.dirname(this.filename(store));
    requireAuthority(directory(this.config.storageRoot) === this.#rootKey && directory(store.binding.workspaceRoot) === store.workspaceKey, "UNSAFE_STORAGE");
    // Exclusive directory claim: collisions and partial attempts are retained, never overwritten or auto-repaired.
    mkdirSync(folder, { mode: 0o700 });
    const filename = this.filename(store);
    closeSync(openSync(filename, "wx", 0o600));
    let db: DatabaseSync | undefined;
    try {
      const databaseKey = key(filename, false), directoryKey = directory(folder);
      db = new DatabaseSync(filename, options); this.#connections.set(store.binding.projectId, db);
      db.exec("PRAGMA journal_mode=DELETE"); configure(db);
      requireAuthority(key(filename, false) === databaseKey && directory(folder) === directoryKey, "UNSAFE_STORAGE");
      db.exec("BEGIN IMMEDIATE"); db.exec(SCHEMA_SQL);
      requireAuthority(this.fault !== "afterSchema", "FAULT");
      db.exec(`PRAGMA application_id=${APPLICATION_ID}; PRAGMA user_version=${USER_VERSION}`);
      db.prepare("INSERT INTO runtime_control_meta VALUES(?,?,1,?,?)").run(store.binding.projectId,
        store.binding.authorityIncarnation, PROFILE, SCHEMA_DIGEST);
      if (this.fault === "securityWrite") db.exec("PRAGMA query_only=ON");
      db.prepare("INSERT INTO runtime_execution_security(projectId,authorityIncarnation) VALUES(?,?)")
        .run(store.binding.projectId, store.binding.authorityIncarnation);
      requireAuthority(this.fault !== "afterSecurity", "FAULT");
      db.exec("COMMIT"); verifySchema(db, store.binding); this.cleanup(store.binding.projectId); db = undefined;
      const identity = Object.freeze({ providerId: this.config.providerId, storageId: store.binding.storageId,
        projectId: store.binding.projectId, authorityIncarnation: store.binding.authorityIncarnation,
        rootKey: this.#rootKey, directoryKey, databaseKey, workspaceKey: store.workspaceKey });
      requireAuthority(directory(folder) === directoryKey && key(filename, false) === databaseKey, "UNSAFE_STORAGE");
      writeFileSync(path.join(folder, "storage.json"), JSON.stringify(identity), { flag: "wx", mode: 0o600 });
      this.validateStore(store, identity); store.identity = identity;
    } catch (error) {
      let failure: unknown = error;
      try { if (db?.isTransaction) db.exec("ROLLBACK"); }
      catch (rollbackError) { failure = new AggregateError([error, rollbackError], "HOST_SQLITE_ROLLBACK_FAILED"); }
      return this.failed(store.binding.projectId, failure);
    }
  }
  open(projectId: string): OwnedHostSQLiteConnection {
    const store = this.#stores.get(projectId); requireAuthority(store, "IDENTITY_CONFLICT");
    requireAuthority(!this.#connections.has(projectId), "UNSAFE_STORAGE");
    if (!store.identity) {
      requireAuthority(store.binding.initializationPolicy === "CREATE_NEW", "UNSAFE_STORAGE"); this.initialize(store);
    }
    const filename = this.validateStore(store, store.identity!);
    let db: DatabaseSync | undefined;
    try {
      // OPEN_EXISTING never creates a file and never obtains a writable connection.
      db = new DatabaseSync(filename, { ...options, readOnly: true });
      this.#connections.set(projectId, db);
      const settings = configure(db); db.exec("PRAGMA query_only=ON; BEGIN"); verifySchema(db, store.binding);
      const row = db.prepare("SELECT * FROM runtime_execution_security WHERE projectId=?").get(projectId);
      if (row) {
        const security = ExecutionSecuritySchema.safeParse(row);
        requireAuthority(security.success && security.data.recordVersion === 1 &&
          security.data.authorityIncarnation === store.binding.authorityIncarnation, "INTEGRITY");
      } // Missing state remains diagnostic-only and is denied by the existing evaluator; never backfilled.
      db.exec("COMMIT");
      this.validateStore(store, store.identity!);
      const owned = db;
      const connection: RepositoryConnection = Object.freeze({ db: owned,
        ref: Object.freeze({ projectId, authorityIncarnation: store.binding.authorityIncarnation }), settings,
        close: () => this.release(projectId, owned) });
      const token: OwnedHostSQLiteConnection = Object.freeze({ sourceClass: "HOST_SQLITE" });
      pending.set(token, connection); return token;
    } catch (error) { return this.failed(projectId, error); }
  }
  // Physical close failures retain the resource, including failures before repository adoption.
  cleanup(projectId: string): void {
    const db = this.#connections.get(projectId);
    if (db) this.release(projectId, db);
  }
  private release(projectId: string, db: DatabaseSync): void {
    if (db.isOpen) db.close();
    if (this.#connections.get(projectId) === db) this.#connections.delete(projectId);
  }
  private failed(projectId: string, error: unknown): never {
    try { this.cleanup(projectId); }
    catch (closeError) { throw new AggregateError([error, closeError], "HOST_SQLITE_OPEN_AND_CLOSE_FAILED"); }
    if (error instanceof AggregateError) throw error;
    throw databaseError(error);
  }
  ownedConnections(): number { return this.#connections.size; }
  identity(projectId: string): SQLiteStorageIdentity {
    const store = this.#stores.get(projectId); requireAuthority(store?.identity, "UNSAFE_STORAGE");
    this.validateStore(store, store.identity); return Object.freeze({ ...store.identity });
  }
}
