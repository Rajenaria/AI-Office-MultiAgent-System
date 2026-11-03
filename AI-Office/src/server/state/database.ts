import { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { DemoEventSchema, DemoTaskSchema, KnowledgeVersionSchema, ProjectIdentitySchema,
  type ProjectIdentity } from "../../contracts/index.js";
import { WorkspaceFailure } from "../workspace/errors.js";
import { SCHEMA_V1 } from "./schema.js";

export function databaseFailure(error: unknown): never {
  if (error instanceof WorkspaceFailure) throw error;
  const code = error instanceof Error && "errcode" in error ? Number(error.errcode) & 255 : 0;
  if (code === 5 || code === 6) throw new WorkspaceFailure("DATABASE_BUSY", "STATE_DATABASE_BUSY", 503);
  throw new WorkspaceFailure("DATABASE_UNAVAILABLE", "STATE_DATABASE_INVALID_OR_UNAVAILABLE", 503);
}

export function useDatabase<T>(filename: string, readOnly: boolean, operation: (db: DatabaseSync) => T): T {
  let db: DatabaseSync | undefined;
  try {
    db = new DatabaseSync(filename, { readOnly, timeout: 25, enableForeignKeyConstraints: true,
      enableDoubleQuotedStringLiterals: false, allowExtension: false });
    db.exec("PRAGMA trusted_schema=OFF; PRAGMA foreign_keys=ON");
    if (!readOnly) db.exec("PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; PRAGMA max_page_count=1024");
    // Keep header/version/records in one read snapshot, including if another
    // local process holds a writer. This does not authorize external writers.
    if (readOnly) db.exec("BEGIN");
    const result = operation(db);
    if (readOnly) db.exec("COMMIT");
    return result;
  } catch (error) { return databaseFailure(error); }
  finally { db?.close(); }
}

export function transaction<T>(db: DatabaseSync, operation: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const result = operation(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}

export function initializeDatabase(filename: string, identity: ProjectIdentity): void {
  useDatabase(filename, false, (db) => transaction(db, () => {
    db.exec(SCHEMA_V1);
    db.prepare("INSERT INTO project_header VALUES (1, ?, 1, ?, 1, NULL)").run(identity.projectId, identity.createdAt);
  }));
}

export function verifyDatabase(db: DatabaseSync, identity: ProjectIdentity) {
  const version = db.prepare("PRAGMA user_version").get()?.user_version;
  if (version !== 1) throw new WorkspaceFailure("UNSUPPORTED_SCHEMA", "STATE_SCHEMA_UNSUPPORTED");
  if (db.prepare("PRAGMA quick_check(1)").get()?.quick_check !== "ok" || db.prepare("PRAGMA foreign_key_check").all().length) {
    throw new WorkspaceFailure("DATABASE_UNAVAILABLE", "STATE_INTEGRITY_CHECK_FAILED");
  }
  const rows = db.prepare("SELECT projectId, schemaVersion, createdAt, snapshotVersion, seedHash FROM project_header").all();
  if (rows.length !== 1) throw new WorkspaceFailure("IDENTITY_CONFLICT", "STATE_HEADER_INVALID");
  const header = z.strictObject({ projectId: z.uuid(), schemaVersion: z.literal(1), createdAt: z.iso.datetime({ precision: 3 }),
    snapshotVersion: z.int().positive(), seedHash: z.string().regex(/^[a-f0-9]{64}$/).nullable() }).parse(rows[0]);
  if (JSON.stringify(ProjectIdentitySchema.parse({ projectId: header.projectId, schemaVersion: header.schemaVersion, createdAt: header.createdAt })) !==
      JSON.stringify(ProjectIdentitySchema.parse(identity))) {
    throw new WorkspaceFailure("IDENTITY_CONFLICT", "STATE_HEADER_PROJECT_MISMATCH");
  }
  for (const table of ["knowledge", "tasks", "events"]) {
    const counts = db.prepare(`SELECT count(*) AS n, sum(projectId != ?) AS foreignRows FROM ${table}`).get(identity.projectId);
    if (Number(counts?.n) > 100 || Number(counts?.foreignRows) > 0) {
      throw new WorkspaceFailure("SCOPE_MISMATCH", "STATE_FOREIGN_OR_EXCESSIVE_RECORDS");
    }
  }
  return header;
}

export function readRecords(db: DatabaseSync, identity: ProjectIdentity) {
  const header = verifyDatabase(db, identity);
  const project = identity.projectId;
  return { header,
    knowledge: db.prepare("SELECT * FROM knowledge WHERE projectId=? ORDER BY knowledgeId,version LIMIT 101").all(project).map((row) => KnowledgeVersionSchema.parse(row)),
    tasks: db.prepare("SELECT * FROM tasks WHERE projectId=? ORDER BY taskId LIMIT 101").all(project).map((row) => DemoTaskSchema.parse(row)),
    events: db.prepare("SELECT * FROM events WHERE projectId=? ORDER BY sequence LIMIT 101").all(project).map((row) => DemoEventSchema.parse(row)),
  };
}
