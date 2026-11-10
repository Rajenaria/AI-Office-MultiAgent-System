import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { closeSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../primitives.js";
import { createScopedCapabilityBoundary, type ScopedReceipt } from "./scoped-capability.js";

/** R9 OFFLINE FIXTURE ONLY. SQLite owns the canonical command journal and its
 * derived R8 projection. Fresh private R8 replay validates inside each DB
 * transaction; no independently mutable live R7/R8 authority is consulted or
 * committed. No runtime/tool/provider/delivery authority. No production export.
 */
const PROFILE = "R9_OFFLINE_DURABLE_MOCK_V1";
const APPLICATION_ID = 0x52394454;
const LIMIT = 256;
const Int = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const Ref = ReferenceIdSchema;
const Root = z.strictObject({ root: z.string().min(1), rootToken: ProjectIdSchema });
const Fixture = Root.extend({ fixtureId: ProjectIdSchema, storeId: ProjectIdSchema });
export type DurableFixtureRoot = z.infer<typeof Root>;
export type DurableFixtureRef = z.infer<typeof Fixture>;
const Header = { operationId: Ref, idempotencyKey: Ref, expectedRevision: Int, action: Ref };
const Operation = z.discriminatedUnion("kind", [
  z.strictObject({ ...Header, kind: z.literal("ADMISSION"), destinationId: Ref, request: z.unknown() }),
  z.strictObject({ ...Header, kind: z.literal("PUBLICATION"), output: z.unknown() }),
]);
export type DurableMockOperation = z.infer<typeof Operation>;
const Control = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("CAPABILITY"), capabilityId: Ref }),
  z.strictObject({ kind: z.enum(["TASK", "DESTINATION", "ACTION"]), value: Ref }),
  z.strictObject({ kind: z.literal("AUTHORITY"), command: z.unknown() }),
]);
const OwnerCommand = z.strictObject({ expectedRevision: Int, control: Control });
type ControlCommand = z.infer<typeof Control>;
export type DurableFault = "BEFORE_BEGIN" | "AFTER_BEGIN" | "AFTER_VALIDATION" | "BEFORE_FIRST_WRITE"
  | "AFTER_CAPABILITY_UPDATE" | "BEFORE_OPERATION_INSERT" | "AFTER_OPERATION_INSERT" | "BEFORE_COMMIT"
  | "CONSTRAINT" | "LOST_ACK" | "STORAGE_READ" | "STORAGE_WRITE" | "RECOVERY_VALIDATION";
const Fault = z.enum(["BEFORE_BEGIN", "AFTER_BEGIN", "AFTER_VALIDATION", "BEFORE_FIRST_WRITE",
  "AFTER_CAPABILITY_UPDATE", "BEFORE_OPERATION_INSERT", "AFTER_OPERATION_INSERT", "BEFORE_COMMIT",
  "CONSTRAINT", "LOST_ACK", "STORAGE_READ", "STORAGE_WRITE", "RECOVERY_VALIDATION"]);
export interface DurableMockReceipt {
  readonly outcome: "MOCK_DURABLE_RECORDED" | "MOCK_DURABLE_ALREADY_RECORDED" | "MOCK_DURABLE_DENIED" | "MOCK_DURABLE_AMBIGUOUS";
  readonly reason: string; readonly operationId: string | null; readonly idempotencyKey: string | null;
  readonly capabilityId: string | null; readonly transactionRevision: number | null;
  readonly acceptedSequence: number | null; readonly binding: NonNullable<ScopedReceipt["innerReceipt"]>["binding"];
  readonly recovery: "COMMITTED" | "LOOKUP_COMMITTED" | "NOT_COMMITTED" | "COMMIT_OUTCOME_UNKNOWN";
  readonly mockOnly: true; readonly executionAuthority: false;
}
class ContractError extends Error { constructor(readonly reason: string) { super(reason); } }
function requireState(ok: unknown, reason: string): asserts ok { if (!ok) throw new ContractError(reason); }
// Inert, bounded, canonical transport. All caller inspection happens before BEGIN.
function copy(input: unknown): unknown {
  let nodes = 0; const seen = new Set<object>();
  function visit(v: unknown, depth: number): unknown {
    requireState(++nodes <= 50000 && depth <= 24, "INVALID_DATA");
    if (v === null || typeof v === "boolean") return v;
    if (typeof v === "number") { requireState(Number.isFinite(v), "INVALID_DATA"); return v; }
    if (typeof v === "string") { requireState(v.length <= 1024, "INVALID_DATA"); return v; }
    requireState(v && typeof v === "object" && !seen.has(v), "INVALID_DATA");
    const array = Array.isArray(v); const proto = Object.getPrototypeOf(v);
    requireState(array ? proto === Array.prototype && v.length <= 4096 : proto === Object.prototype || proto === null, "INVALID_DATA");
    const ds = Object.getOwnPropertyDescriptors(v); const keys = Reflect.ownKeys(ds);
    requireState(!array || keys.length === (v as unknown[]).length + 1, "INVALID_DATA");
    seen.add(v); const result = array ? [] : Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      requireState(typeof key === "string", "INVALID_DATA"); if (array && key === "length") continue;
      const d = ds[key]; requireState(d && d.enumerable && "value" in d && !["__proto__", "constructor", "prototype"].includes(key), "INVALID_DATA");
      requireState(!array || /^(0|[1-9][0-9]*)$/.test(key), "INVALID_DATA");
      Object.defineProperty(result, key, { value: visit(d.value, depth + 1), enumerable: true, writable: true, configurable: true });
    }
    seen.delete(v); return result;
  }
  return visit(input, 0);
}
function json(input: unknown): string {
  function sorted(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(sorted);
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted((v as Record<string, unknown>)[k])]));
    return v;
  }
  return JSON.stringify(sorted(input));
}
function decode(value: unknown): unknown {
  requireState(typeof value === "string" && value.length <= 2_000_000, "RECOVERY_INVALID"); return JSON.parse(value) as unknown;
}
function transportJSON(value: unknown): string {
  const text = json(value); requireState(text.length <= 2_000_000, "CAPACITY_EXCEEDED"); return text;
}
function directory(p: string) { const s = lstatSync(p); requireState(s.isDirectory() && !s.isSymbolicLink() && realpathSync.native(p) === p, "UNSAFE_FIXTURE"); }
function regular(p: string) { const s = lstatSync(p); requireState(s.isFile() && !s.isSymbolicLink() && s.nlink === 1 && realpathSync.native(p) === p, "UNSAFE_FIXTURE"); }
function rootRef(input: unknown): DurableFixtureRoot {
  const r = Root.parse(input); const audit = path.dirname(r.root);
  requireState(path.dirname(audit) === realpathSync.native(tmpdir()) && /^ai-office-r9-of-dt-[0-9a-f-]{36}$/.test(path.basename(audit)) &&
    /^fixtures-[0-9a-f-]{36}$/.test(path.basename(r.root)), "UNSAFE_FIXTURE");
  directory(audit); directory(r.root); const marker = path.join(r.root, "root-owner.json"); regular(marker);
  requireState(readFileSync(marker, "utf8") === json({ profile: PROFILE, ...r }), "UNSAFE_FIXTURE"); return r;
}
export function createDurableMockFixtureRoot(auditRoot: string): DurableFixtureRoot {
  const audit = realpathSync.native(auditRoot); directory(audit);
  requireState(path.dirname(audit) === realpathSync.native(tmpdir()) && /^ai-office-r9-of-dt-[0-9a-f-]{36}$/.test(path.basename(audit)), "UNSAFE_FIXTURE");
  const root = path.join(audit, `fixtures-${randomUUID()}`); mkdirSync(root);
  const ref = { root, rootToken: randomUUID() };
  writeFileSync(path.join(root, "root-owner.json"), json({ profile: PROFILE, ...ref }), { flag: "wx" });
  return Object.freeze(rootRef(ref));
}
/** Test-only storage ref, never an arbitrary database path or producer credential. */
export function durableMockFixtureFilename(input: unknown): string {
  const r = Fixture.parse(input); rootRef({ root: r.root, rootToken: r.rootToken });
  const folder = path.join(r.root, r.fixtureId); directory(folder);
  const filename = path.join(folder, "mock.db"); regular(filename);
  const marker = path.join(folder, "database-owner.json"); regular(marker);
  const s = lstatSync(filename, { bigint: true });
  requireState(readFileSync(marker, "utf8") === json({ profile: PROFILE, ...r, fileKey: `${s.dev}:${s.ino}` }), "UNSAFE_FIXTURE");
  for (const suffix of ["-journal", "-wal", "-shm"]) {
    try { regular(filename + suffix); requireState(suffix === "-journal", "UNSAFE_FIXTURE"); }
    catch (e) { if (!(e instanceof Error && "code" in e && e.code === "ENOENT")) throw e; }
  }
  return filename;
}
const Statements = [
  `CREATE TABLE meta(id INTEGER PRIMARY KEY CHECK(id=1), store_id TEXT NOT NULL, seed TEXT NOT NULL, specs TEXT NOT NULL, projection TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision BETWEEN 0 AND 256)) STRICT`,
  `CREATE TABLE capabilities(capability_id TEXT PRIMARY KEY, grant_json TEXT NOT NULL, single_use INTEGER NOT NULL CHECK(single_use IN(0,1)), used_count INTEGER NOT NULL CHECK(used_count BETWEEN 0 AND 256), consumed INTEGER NOT NULL CHECK(consumed IN(0,1)), UNIQUE(capability_id,single_use), CHECK(single_use=0 AND consumed=0 OR single_use=1 AND used_count=consumed)) STRICT`,
  `CREATE TABLE journal(seq INTEGER PRIMARY KEY CHECK(seq BETWEEN 1 AND 256), kind TEXT NOT NULL CHECK(kind IN('OPERATION','CONTROL')), payload TEXT NOT NULL, receipt TEXT NOT NULL) STRICT`,
  `CREATE TABLE accepted_operations(operation_id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, capability_id TEXT NOT NULL REFERENCES capabilities(capability_id), logical_json TEXT NOT NULL, receipt TEXT NOT NULL, txn_revision INTEGER NOT NULL UNIQUE REFERENCES journal(seq) DEFERRABLE INITIALLY DEFERRED) STRICT`,
  `CREATE TABLE single_use_claims(capability_id TEXT PRIMARY KEY, single_use INTEGER NOT NULL DEFAULT 1 CHECK(single_use=1), operation_id TEXT NOT NULL UNIQUE REFERENCES accepted_operations(operation_id) DEFERRABLE INITIALLY DEFERRED, FOREIGN KEY(capability_id,single_use) REFERENCES capabilities(capability_id,single_use)) STRICT`,
  `CREATE TRIGGER require_claim BEFORE INSERT ON accepted_operations WHEN (SELECT single_use FROM capabilities WHERE capability_id=NEW.capability_id)=1 AND NOT EXISTS(SELECT 1 FROM single_use_claims WHERE capability_id=NEW.capability_id AND operation_id=NEW.operation_id) BEGIN SELECT RAISE(ABORT,'MOCK_CLAIM_REQUIRED'); END`,
];
function connect(ref: DurableFixtureRef): DatabaseSync {
  const db = new DatabaseSync(durableMockFixtureFilename(ref), { timeout: 0, allowExtension: false,
    enableForeignKeyConstraints: true, enableDoubleQuotedStringLiterals: false, defensive: true });
  try { db.exec("PRAGMA foreign_keys=ON; PRAGMA trusted_schema=OFF; PRAGMA synchronous=EXTRA; PRAGMA read_uncommitted=OFF; PRAGMA temp_store=MEMORY; PRAGMA busy_timeout=0; PRAGMA max_page_count=4096");
    requireState(db.prepare("PRAGMA journal_mode").get()?.journal_mode === "delete" && db.prepare("PRAGMA synchronous").get()?.synchronous === 3, "STORAGE_CONFIGURATION");
    return db;
  } catch (e) { db.close(); throw e; }
}
type R8 = ReturnType<typeof createScopedCapabilityBoundary>;
type Projection = ReturnType<R8["boundary"]["snapshot"]>;
interface Rebuilt { r8: R8; handles: Map<string, object>; snapshot: Projection; revision: number;
  operations: { operationId: string; idempotencyKey: string; capabilityId: string; logical: string; receipt: DurableMockReceipt; revision: number }[] }
function initialize(seed: unknown, specs: unknown[]): { r8: R8; handles: Map<string, object> } {
  requireState(specs.length > 0 && specs.length <= 32, "INVALID_FIXTURE");
  const r8 = createScopedCapabilityBoundary(seed); requireState(r8.boundary.snapshot().authority.valid, "INVALID_FIXTURE");
  const handles = new Map<string, object>();
  for (const spec of specs) { const c = r8.owner.issueCapability(spec); requireState(c.outcome === "MOCK_CAPABILITY_ISSUED", "INVALID_FIXTURE"); handles.set(c.capabilityId, c.capability); }
  return { r8, handles };
}
function applyControl(r: R8, handles: Map<string, object>, c: ControlCommand) {
  const result = c.kind === "AUTHORITY" ? r.owner.applyAuthorityChange(c.command) : c.kind === "CAPABILITY" ? r.owner.revokeCapability(handles.get(c.capabilityId))
    : c.kind === "TASK" ? r.owner.revokeTask(c.value) : c.kind === "DESTINATION" ? r.owner.revokeDestination(c.value) : r.owner.revokeAction(c.value);
  requireState(result.outcome === "MOCK_SCOPE_REVOKED" || result.outcome === "FAKE_AUTHORITY_UPDATED", "CONTROL_DENIED"); return result;
}
function logical(op: DurableMockOperation, id: string, snapshot: Projection) {
  const { expectedRevision: _header, ...body } = op;
  return json({ capabilityId: id, binding: snapshot.capabilities.find(c => c.grant.capabilityId === id)?.grant.binding, operation: body });
}
function perform(r8: R8, op: DurableMockOperation, handle: object): ScopedReceipt {
  return op.kind === "ADMISSION" ? r8.boundary.attemptScopedAdmission({ operationId: op.operationId, action: op.action, destinationId: op.destinationId, request: op.request }, handle)
    : r8.boundary.attemptScopedPublication({ operationId: op.operationId, action: op.action, output: op.output }, handle);
}
function accepted(op: DurableMockOperation, id: string, revision: number, inner: ScopedReceipt): DurableMockReceipt {
  return { outcome: "MOCK_DURABLE_RECORDED", reason: inner.reason, operationId: op.operationId, idempotencyKey: op.idempotencyKey,
    capabilityId: id, transactionRevision: revision, acceptedSequence: inner.innerReceipt?.boundaryReceipt?.acceptedSequence ?? null,
    binding: inner.innerReceipt?.binding ?? null, recovery: "COMMITTED", mockOnly: true, executionAuthority: false };
}
function capRows(s: Projection) { return s.capabilities.map(c => ({ capability_id: c.grant.capabilityId, grant_json: json(c.grant),
  single_use: Number(c.grant.usagePolicy === "SINGLE_USE"), used_count: c.uses, consumed: Number(c.consumed) })).sort((a, b) => a.capability_id.localeCompare(b.capability_id)); }
function verify(db: DatabaseSync, ref: DurableFixtureRef): Rebuilt {
  requireState(db.prepare("PRAGMA application_id").get()?.application_id === APPLICATION_ID && db.prepare("PRAGMA user_version").get()?.user_version === 1, "RECOVERY_INVALID");
  const schema = db.prepare("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY sql").all().map(x => x.sql);
  requireState(json(schema) === json([...Statements].sort()) && db.prepare("PRAGMA quick_check(1)").get()?.quick_check === "ok" && db.prepare("PRAGMA foreign_key_check").all().length === 0, "RECOVERY_INVALID");
  const rows = db.prepare("SELECT * FROM meta").all(); const m = rows[0];
  requireState(rows.length === 1 && m?.store_id === ref.storeId, "RECOVERY_INVALID");
  const specs = z.array(z.unknown()).max(32).parse(decode(m.specs)); const seed = decode(m.seed);
  const { r8, handles } = initialize(seed, specs); const operations: Rebuilt["operations"] = [];
  const journal = db.prepare("SELECT * FROM journal ORDER BY seq").all(); requireState(journal.length <= LIMIT && m.revision === journal.length, "RECOVERY_INVALID");
  for (const [index, row] of journal.entries()) {
    requireState(row.seq === index + 1, "RECOVERY_INVALID");
    if (row.kind === "CONTROL") {
      const c = Control.parse(decode(row.payload)); const result = applyControl(r8, handles, c);
      requireState(json(result) === row.receipt, "RECOVERY_INVALID");
    } else {
      requireState(row.kind === "OPERATION", "RECOVERY_INVALID");
      const p = z.strictObject({ operation: Operation, capabilityId: Ref }).parse(decode(row.payload));
      requireState(p.operation.expectedRevision === index, "RECOVERY_INVALID");
      const handle = handles.get(p.capabilityId); requireState(handle, "RECOVERY_INVALID");
      const key = logical(p.operation, p.capabilityId, r8.boundary.snapshot());
      const result = perform(r8, p.operation, handle); requireState(result.outcome === "MOCK_SCOPED_RECORDED", "RECOVERY_INVALID");
      const receipt = accepted(p.operation, p.capabilityId, index + 1, result);
      requireState(json(receipt) === row.receipt && !operations.some(x => x.operationId === p.operation.operationId || x.idempotencyKey === p.operation.idempotencyKey), "RECOVERY_INVALID");
      operations.push({ operationId: p.operation.operationId, idempotencyKey: p.operation.idempotencyKey, capabilityId: p.capabilityId, logical: key, receipt, revision: index + 1 });
    }
  }
  const snapshot = r8.boundary.snapshot(); requireState(json(snapshot) === m.projection, "RECOVERY_INVALID");
  requireState(json(db.prepare("SELECT * FROM capabilities ORDER BY capability_id").all()) === json(capRows(snapshot)), "RECOVERY_INVALID");
  const persisted = db.prepare("SELECT * FROM accepted_operations ORDER BY txn_revision").all();
  requireState(json(persisted) === json(operations.map(x => ({ operation_id: x.operationId, idempotency_key: x.idempotencyKey,
    capability_id: x.capabilityId, logical_json: x.logical, receipt: json(x.receipt), txn_revision: x.revision }))), "RECOVERY_INVALID");
  const claims = db.prepare("SELECT * FROM single_use_claims ORDER BY capability_id").all();
  const expected = operations.filter(x => snapshot.capabilities.find(c => c.grant.capabilityId === x.capabilityId)?.grant.usagePolicy === "SINGLE_USE")
    .map(x => ({ capability_id: x.capabilityId, single_use: 1, operation_id: x.operationId })).sort((a, b) => a.capability_id.localeCompare(b.capability_id));
  requireState(json(claims) === json(expected), "RECOVERY_INVALID");
  return { r8, handles, snapshot, revision: journal.length, operations };
}
export function createDurableMockFixture(rootInput: DurableFixtureRoot, seedInput: unknown, specsInput: unknown[]): DurableFixtureRef {
  const root = rootRef(rootInput); const seed = copy(seedInput); const specs = z.array(z.unknown()).max(32).parse(copy(specsInput));
  const initial = initialize(seed, specs); const snapshot = initial.r8.boundary.snapshot();
  const ref = { ...root, fixtureId: randomUUID(), storeId: randomUUID() }; const folder = path.join(ref.root, ref.fixtureId); mkdirSync(folder);
  const filename = path.join(folder, "mock.db"); closeSync(openSync(filename, "wx")); const s = lstatSync(filename, { bigint: true });
  writeFileSync(path.join(folder, "database-owner.json"), json({ profile: PROFILE, ...ref, fileKey: `${s.dev}:${s.ino}` }), { flag: "wx" });
  const db = connect(ref);
  try {
    db.exec("BEGIN IMMEDIATE"); for (const sql of Statements) db.exec(sql);
    db.exec(`PRAGMA application_id=${APPLICATION_ID}; PRAGMA user_version=1`);
    db.prepare("INSERT INTO meta VALUES(1,?,?,?,?,0)").run(ref.storeId, transportJSON(seed), transportJSON(specs), transportJSON(snapshot));
    for (const c of capRows(snapshot)) db.prepare("INSERT INTO capabilities VALUES(?,?,?,?,?)").run(c.capability_id, c.grant_json, c.single_use, c.used_count, c.consumed);
    db.exec("COMMIT"); db.exec("BEGIN"); verify(db, ref); db.exec("COMMIT"); return Object.freeze(ref);
  } finally { if (db.isTransaction) db.exec("ROLLBACK"); db.close(); }
}
function failure(reason: string, op?: DurableMockOperation, id: string | null = null): DurableMockReceipt {
  return { outcome: "MOCK_DURABLE_DENIED", reason, operationId: op?.operationId ?? null, idempotencyKey: op?.idempotencyKey ?? null,
    capabilityId: id, transactionRevision: null, acceptedSequence: null, binding: null, recovery: "NOT_COMMITTED", mockOnly: true, executionAuthority: false };
}
function storageReason(e: unknown): string {
  if (e instanceof ContractError) return e.reason;
  if (e instanceof Error && "errcode" in e && typeof e.errcode === "number" && (e.errcode & 255) === 5) return "STORE_BUSY";
  return "STORAGE_OR_RECOVERY_FAILURE"; // no path, SQL or raw error data escapes
}
class Store {
  #db: DatabaseSync; #closed = false; #origins = new WeakMap<object, string>(); #fault: DurableFault | null = null;
  constructor(readonly ref: DurableFixtureRef) { this.#db = connect(ref); try { this.read(); } catch { this.close(); throw new ContractError("RECOVERY_INVALID"); } }
  close() { if (!this.#closed) { this.#closed = true; try { if (this.#db.isTransaction) this.#db.exec("ROLLBACK"); } finally { this.#db.close(); } } }
  #hit(point: DurableFault) { if (this.#fault === point) { this.#fault = null; throw new ContractError(point === "RECOVERY_VALIDATION" ? "RECOVERY_INVALID" : `INJECTED_${point}`); } }
  inject(value: unknown) { const p = Fault.safeParse(value); if (!p.success || this.#closed) return false; this.#fault = p.data; return true; }
  read() {
    requireState(!this.#closed, "STORE_CLOSED");
    try { this.#db.exec("BEGIN"); this.#hit("STORAGE_READ"); this.#hit("RECOVERY_VALIDATION"); const r = verify(this.#db, this.ref); this.#db.exec("COMMIT"); return r; }
    catch (e) { if (this.#db.isTransaction) this.#db.exec("ROLLBACK"); throw new ContractError(storageReason(e)); }
  }
  snapshot() { const r = this.read(); return { revision: r.revision, projection: r.snapshot, acceptedOperations: r.operations,
    mockOnly: true as const, executionAuthority: false as const }; }
  reference(idInput: unknown) {
    const id = Ref.parse(idInput); const r = this.read(); requireState(r.handles.has(id), "CAPABILITY_MISSING");
    const handle = Object.freeze({ mockOnly: true, executionAuthority: false }); this.#origins.set(handle, id); return handle;
  }
  attempt(input: unknown, reference: unknown): DurableMockReceipt {
    let op: DurableMockOperation;
    try { op = Operation.parse(copy(input)); } catch { return failure("INVALID_OPERATION"); }
    const id = reference !== null && typeof reference === "object" ? this.#origins.get(reference) : undefined;
    if (!id) return failure("CAPABILITY_REFERENCE_INVALID", op);
    if (this.#closed) return failure("STORE_CLOSED", op, id);
    let commitAttempted = false;
    try {
      this.#hit("BEFORE_BEGIN"); this.#db.exec("BEGIN IMMEDIATE"); this.#hit("AFTER_BEGIN"); this.#hit("STORAGE_READ");
      const state = verify(this.#db, this.ref); const key = logical(op, id, state.snapshot);
      const old = state.operations.find(x => x.idempotencyKey === op.idempotencyKey);
      if (old) {
        requireState(old.logical === key && old.capabilityId === id, "IDEMPOTENCY_CONFLICT");
        const receipt: DurableMockReceipt = { ...old.receipt, outcome: "MOCK_DURABLE_ALREADY_RECORDED", recovery: "LOOKUP_COMMITTED" };
        this.#db.exec("ROLLBACK"); return receipt; // historical result only, never new authorization
      }
      requireState(op.expectedRevision === state.revision, "STALE_STORE_REVISION"); requireState(state.revision < LIMIT, "CAPACITY_EXCEEDED");
      const handle = state.handles.get(id); requireState(handle, "CAPABILITY_MISSING");
      const inner = perform(state.r8, op, handle); requireState(inner.outcome === "MOCK_SCOPED_RECORDED", inner.reason);
      this.#hit("AFTER_VALIDATION"); const next = state.r8.boundary.snapshot();
      const cap = next.capabilities.find(c => c.grant.capabilityId === id)!;
      const receipt = accepted(op, id, state.revision + 1, inner);
      const payloadJSON = transportJSON({ operation: op, capabilityId: id }); const projectionJSON = transportJSON(next);
      const ambiguous: DurableMockReceipt = { ...failure("COMMIT_ACKNOWLEDGMENT_LOST", op, id), outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN" };
      this.#hit("BEFORE_FIRST_WRITE"); this.#hit("STORAGE_WRITE");
      const updated = this.#db.prepare("UPDATE capabilities SET used_count=?,consumed=? WHERE capability_id=? AND used_count=?").run(cap.uses, Number(cap.consumed), id, cap.uses - 1);
      requireState(updated.changes === 1, "CAPABILITY_CAS_FAILED"); this.#hit("AFTER_CAPABILITY_UPDATE");
      if (cap.grant.usagePolicy === "SINGLE_USE") this.#db.prepare("INSERT INTO single_use_claims(capability_id,operation_id) VALUES(?,?)").run(id, op.operationId);
      this.#hit("BEFORE_OPERATION_INSERT");
      this.#db.prepare("INSERT INTO accepted_operations VALUES(?,?,?,?,?,?)").run(op.operationId, op.idempotencyKey, id, key, json(receipt), state.revision + 1);
      this.#hit("AFTER_OPERATION_INSERT");
      this.#db.prepare("INSERT INTO journal VALUES(?,'OPERATION',?,?)").run(state.revision + 1, payloadJSON, json(receipt));
      this.#db.prepare("UPDATE meta SET projection=?,revision=? WHERE id=1").run(projectionJSON, state.revision + 1);
      if (this.#fault === "CONSTRAINT") { this.#fault = null; this.#db.prepare("INSERT INTO single_use_claims(capability_id,operation_id) VALUES(?,?)").run(id, op.operationId); }
      this.#hit("BEFORE_COMMIT");
      const loseAck = this.#fault === "LOST_ACK"; if (loseAck) this.#fault = null;
      commitAttempted = true; this.#db.exec("COMMIT"); return loseAck ? ambiguous : receipt;
    } catch (e) {
      // A failed COMMIT without an active transaction may have committed. Do not
      // classify that as rollback/success; caller must reopen and retry/lookup.
      if (commitAttempted && !this.#db.isTransaction) return { ...failure("COMMIT_OUTCOME_UNKNOWN", op, id), outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN" };
      try { if (this.#db.isTransaction) this.#db.exec("ROLLBACK"); }
      catch { try { this.close(); } catch { /* quarantined; no new effect allowed */ }
        return { ...failure("ROLLBACK_UNCERTAIN_STORE_CLOSED", op, id), outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN" }; }
      return failure(storageReason(e), op, id);
    }
  }
  control(input: unknown) {
    let c: z.infer<typeof OwnerCommand>; try { c = OwnerCommand.parse(copy(input)); } catch { return failure("INVALID_CONTROL"); }
    if (this.#closed) return failure("STORE_CLOSED");
    let commitAttempted = false;
    try {
      this.#db.exec("BEGIN IMMEDIATE"); const s = verify(this.#db, this.ref);
      requireState(c.expectedRevision === s.revision && s.revision < LIMIT, "STALE_STORE_REVISION");
      const receipt = applyControl(s.r8, s.handles, c.control);
      const payloadJSON = transportJSON(c.control); const projectionJSON = transportJSON(s.r8.boundary.snapshot());
      this.#db.prepare("INSERT INTO journal VALUES(?,'CONTROL',?,?)").run(s.revision + 1, payloadJSON, json(receipt));
      this.#db.prepare("UPDATE meta SET projection=?,revision=? WHERE id=1").run(projectionJSON, s.revision + 1);
      const result = { outcome: "MOCK_DURABLE_CONTROL_RECORDED", transactionRevision: s.revision + 1, mockOnly: true, executionAuthority: false } as const;
      commitAttempted = true; this.#db.exec("COMMIT"); return result;
    } catch (e) {
      if (commitAttempted && !this.#db.isTransaction) return { ...failure("CONTROL_COMMIT_OUTCOME_UNKNOWN"), outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN" };
      try { if (this.#db.isTransaction) this.#db.exec("ROLLBACK"); }
      catch { try { this.close(); } catch { /* quarantined */ }
        return { ...failure("CONTROL_ROLLBACK_UNCERTAIN"), outcome: "MOCK_DURABLE_AMBIGUOUS", recovery: "COMMIT_OUTCOME_UNKNOWN" }; }
      return failure(storageReason(e));
    }
  }
}
/** No raw SQL, reference issuer or controls on producer boundary. Reopening
 * creates a new local reference realm. Only trusted owner may resume a grant's
 * durable identity; JSON/old/foreign handles never become new credentials.
 */
export function openDurableMockTransaction(input: DurableFixtureRef) {
  const ref = Fixture.parse(copy(input)); const s = new Store(ref);
  return Object.freeze({ boundary: Object.freeze({ attemptDurableMockOperation: (request: unknown, reference: unknown) => s.attempt(request, reference),
    snapshot: () => s.snapshot(), close: () => s.close() }),
    owner: Object.freeze({ resumeCapabilityReference: (id: unknown) => s.reference(id), applyControl: (command: unknown) => s.control(command),
      injectFailure: (point: unknown) => s.inject(point) }) });
}
