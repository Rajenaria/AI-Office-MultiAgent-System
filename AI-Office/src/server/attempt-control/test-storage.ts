import { randomUUID } from "node:crypto";
import { closeSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { ProjectIdSchema } from "../../contracts/primitives.js";
import { databaseError, parse, requireAuthority } from "./contracts.js";
import { APPLICATION_ID, PROFILE, SCHEMA_DIGEST, SCHEMA_SQL, SCHEMA_STATEMENTS, USER_VERSION } from "./schema.js";

const RootSchema = z.strictObject({ root: z.string().min(1), rootToken: ProjectIdSchema });
export const TestDatabaseRefSchema = RootSchema.extend({ databaseToken: ProjectIdSchema, projectId: ProjectIdSchema,
  authorityIncarnation: ProjectIdSchema });
export type TestRoot = z.infer<typeof RootSchema>;
export type TestDatabaseRef = z.infer<typeof TestDatabaseRefSchema>;
export const BUSY_TIMEOUT_MS = 100;
export type Settings = Readonly<{ sqliteVersion: string; journalMode: string; synchronous: number;
  foreignKeys: number; busyTimeout: number; trustedSchema: number; readUncommitted: number }>;

function regular(filename: string): void {
  const info = lstatSync(filename);
  requireAuthority(info.isFile() && !info.isSymbolicLink() && info.nlink === 1 && realpathSync.native(filename) === filename, "UNSAFE_STORAGE");
}
function directory(filename: string): void {
  const info = lstatSync(filename);
  requireAuthority(info.isDirectory() && !info.isSymbolicLink() && realpathSync.native(filename) === filename, "UNSAFE_STORAGE");
}
function verifyRoot(input: unknown): TestRoot {
  const ref = parse(RootSchema, input), parent = realpathSync.native(tmpdir());
  requireAuthority(path.dirname(ref.root) === parent && /^ai-office-m0202s1[2-5]-[A-Za-z0-9]+$/.test(path.basename(ref.root)), "UNSAFE_STORAGE");
  directory(parent); directory(ref.root);
  const marker = path.join(ref.root, "root-owner.json"); regular(marker);
  requireAuthority(readFileSync(marker, "utf8") === JSON.stringify({ profile: PROFILE, ...ref }), "UNSAFE_STORAGE");
  return ref;
}
// Explicit test initializer. Never receives a user-selected directory or database path.
export function createTestRoot(stage: "s12" | "s13" | "s14" | "s15" = "s12"): TestRoot {
  requireAuthority(["s12", "s13", "s14", "s15"].includes(stage), "VALIDATION");
  const root = realpathSync.native(mkdtempSync(path.join(realpathSync.native(tmpdir()), `ai-office-m0202${stage}-`)));
  const ref = { root, rootToken: randomUUID() };
  writeFileSync(path.join(root, "root-owner.json"), JSON.stringify({ profile: PROFILE, ...ref }), { flag: "wx" });
  return Object.freeze(verifyRoot(ref));
}
export function testDatabaseFilename(input: unknown): string {
  const ref = parse(TestDatabaseRefSchema, input);
  verifyRoot({ root: ref.root, rootToken: ref.rootToken });
  const folder = path.join(ref.root, ref.databaseToken); directory(folder);
  const marker = path.join(folder, "database-owner.json"); regular(marker);
  const filename = path.join(folder, "authority.db"); regular(filename);
  const info = lstatSync(filename, { bigint: true });
  requireAuthority(readFileSync(marker, "utf8") === JSON.stringify({ profile: PROFILE, ...ref,
    fileKey: `${info.dev}:${info.ino}` }), "UNSAFE_STORAGE");
  for (const suffix of ["-journal", "-wal", "-shm"]) {
    const sidecar = `${filename}${suffix}`;
    try { regular(sidecar); requireAuthority(suffix === "-journal", "UNSAFE_STORAGE"); }
    catch (error) { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; }
  }
  return filename;
}
function configure(db: DatabaseSync): Settings {
  db.exec("PRAGMA trusted_schema=OFF; PRAGMA foreign_keys=ON; PRAGMA read_uncommitted=OFF; PRAGMA synchronous=EXTRA; PRAGMA busy_timeout=100");
  // Existing journal mode is verified, never silently changed on reopen.
  const settings: Settings = Object.freeze({ sqliteVersion: String(db.prepare("SELECT sqlite_version() AS v").get()?.v),
    journalMode: String(db.prepare("PRAGMA journal_mode").get()?.journal_mode),
    synchronous: Number(db.prepare("PRAGMA synchronous").get()?.synchronous),
    foreignKeys: Number(db.prepare("PRAGMA foreign_keys").get()?.foreign_keys),
    busyTimeout: Number(db.prepare("PRAGMA busy_timeout").get()?.timeout),
    trustedSchema: Number(db.prepare("PRAGMA trusted_schema").get()?.trusted_schema),
    readUncommitted: Number(db.prepare("PRAGMA read_uncommitted").get()?.read_uncommitted) });
  requireAuthority(settings.journalMode === "delete" && settings.synchronous === 3 && settings.foreignKeys === 1 &&
    settings.busyTimeout === BUSY_TIMEOUT_MS && settings.trustedSchema === 0 && settings.readUncommitted === 0, "SCHEMA");
  return settings;
}
export function verifySchema(db: DatabaseSync, ref: TestDatabaseRef): void {
  requireAuthority(db.prepare("PRAGMA application_id").get()?.application_id === APPLICATION_ID &&
    db.prepare("PRAGMA user_version").get()?.user_version === USER_VERSION, "SCHEMA");
  const actual = db.prepare("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY sql").all().map((row) => row.sql);
  requireAuthority(JSON.stringify(actual) === JSON.stringify([...SCHEMA_STATEMENTS].sort()), "SCHEMA");
  const rows = db.prepare("SELECT * FROM runtime_control_meta").all();
  requireAuthority(rows.length === 1 && rows[0]?.projectId === ref.projectId && rows[0]?.authorityIncarnation === ref.authorityIncarnation &&
    rows[0]?.profile === PROFILE && rows[0]?.schemaRevision === 1 && rows[0]?.schemaDigest === SCHEMA_DIGEST, "SCHEMA");
  requireAuthority(db.prepare("PRAGMA quick_check(1)").get()?.quick_check === "ok" &&
    db.prepare("PRAGMA foreign_key_check").all().length === 0, "INTEGRITY");
}
export function createTestDatabase(rootInput: TestRoot): TestDatabaseRef {
  const root = verifyRoot(rootInput);
  const ref = { ...root, databaseToken: randomUUID(), projectId: randomUUID(), authorityIncarnation: randomUUID() };
  const folder = path.join(ref.root, ref.databaseToken); mkdirSync(folder);
  const filename = path.join(folder, "authority.db"); closeSync(openSync(filename, "wx"));
  const info = lstatSync(filename, { bigint: true });
  writeFileSync(path.join(folder, "database-owner.json"), JSON.stringify({ profile: PROFILE, ...ref,
    fileKey: `${info.dev}:${info.ino}` }), { flag: "wx" });
  let db: DatabaseSync | undefined;
  try {
    db = new DatabaseSync(testDatabaseFilename(ref), { timeout: BUSY_TIMEOUT_MS, allowExtension: false,
      enableDoubleQuotedStringLiterals: false, enableForeignKeyConstraints: true });
    db.exec("PRAGMA journal_mode=DELETE"); configure(db);
    db.exec("BEGIN IMMEDIATE");
    db.exec(SCHEMA_SQL);
    db.exec(`PRAGMA application_id=${APPLICATION_ID}; PRAGMA user_version=${USER_VERSION}`);
    db.prepare("INSERT INTO runtime_control_meta VALUES(?,?,1,?,?)").run(ref.projectId, ref.authorityIncarnation, PROFILE, SCHEMA_DIGEST);
    db.exec("COMMIT"); verifySchema(db, ref);
    return Object.freeze(ref);
  } catch (error) { if (db?.isTransaction) db.exec("ROLLBACK"); throw databaseError(error); }
  finally { db?.close(); }
}
// Raw handle is deliberately test-only. The normal repository never exposes SQL.
export function openTestConnection(input: unknown) {
  let db: DatabaseSync | undefined;
  try {
    const ref = parse(TestDatabaseRefSchema, input), filename = testDatabaseFilename(ref);
    db = new DatabaseSync(filename, { timeout: BUSY_TIMEOUT_MS, allowExtension: false,
      enableDoubleQuotedStringLiterals: false, enableForeignKeyConstraints: true });
    const settings = configure(db); verifySchema(db, ref);
    const owned = db;
    return { db: owned, ref: Object.freeze(ref), settings, close: () => { if (owned.isOpen) owned.close(); } };
  } catch (error) { db?.close(); throw databaseError(error); }
}
