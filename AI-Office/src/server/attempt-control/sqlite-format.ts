import type { DatabaseSync } from "node:sqlite";
import { requireAuthority } from "./contracts.js";
import { APPLICATION_ID, PROFILE, SCHEMA_DIGEST, SCHEMA_STATEMENTS, USER_VERSION } from "./schema.js";
// Shared format validation, not fixture provenance or production authentication.
export const BUSY_TIMEOUT_MS = 100;
export type Settings = Readonly<{ sqliteVersion: string; journalMode: string; synchronous: number;
  foreignKeys: number; busyTimeout: number; trustedSchema: number; readUncommitted: number }>;

export function configure(db: DatabaseSync): Settings {
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
export function verifySchema(db: DatabaseSync, ref: Readonly<{ projectId: string; authorityIncarnation: string }>): void {
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
