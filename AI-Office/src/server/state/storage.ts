import { lstat, mkdir, open, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ProjectIdSchema } from "../../contracts/index.js";
import { checkedDescendant, readSmallFile, type Root } from "../workspace/paths.js";
import { hasCode, WorkspaceFailure } from "../workspace/errors.js";

const IndexSchema = z.strictObject({ schemaVersion: z.literal(1), entries: z.array(z.strictObject({
  projectId: ProjectIdSchema, phase: z.enum(["PREPARING", "INITIALIZED"]),
})).max(1000) }).refine((data) => new Set(data.entries.map((entry) => entry.projectId)).size === data.entries.length);
type Index = z.infer<typeof IndexSchema>;
export type StateFault = (stage: "afterStateIntent" | "afterStateSchema" | "afterDemoTask") => void;

// Initialization ledger only; official project/root identity remains in the
// Workspace registry. No task, knowledge or execution authority lives here.
export class StateStorage {
  constructor(private readonly appRoot: Root) {}

  private async optionalFile(relative: string, limit: number): Promise<string | null> {
    try { return await readSmallFile(await checkedDescendant(this.appRoot, relative), limit); }
    catch (error) { if (hasCode(error, "ENOENT")) return null; throw error; }
  }
  private async index(): Promise<Index> {
    const files = await readdir(this.appRoot.canonicalPath);
    if (files.some((file) => file.startsWith("state-index-") && file.endsWith(".tmp"))) {
      throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INDEX_INTERRUPTED_REVIEW_REQUIRED");
    }
    const raw = await this.optionalFile("state-index.json", 128 * 1024);
    const seal = await this.optionalFile("state-index.initialized", 128);
    if (raw === null && seal === null) {
      if (files.includes("projects")) throw new WorkspaceFailure("STATE_UNAVAILABLE", "ORPHAN_STATE_REVIEW_REQUIRED");
      return { schemaVersion: 1, entries: [] };
    }
    if (raw === null || seal !== "ai-office-state-v1\n") throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INDEX_MISSING_REVIEW_REQUIRED");
    try { return IndexSchema.parse(JSON.parse(raw)); }
    catch { throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INDEX_CORRUPT_REVIEW_REQUIRED"); }
  }

  private async save(index: Index): Promise<void> {
    const seal = path.join(this.appRoot.canonicalPath, "state-index.initialized");
    if (await this.optionalFile("state-index.initialized", 128) === null) {
      const handle = await open(seal, "wx", 0o600);
      try { await handle.writeFile("ai-office-state-v1\n"); await handle.sync(); } finally { await handle.close(); }
    }
    const temporary = path.join(this.appRoot.canonicalPath, `state-index-${randomUUID()}.tmp`);
    const handle = await open(temporary, "wx", 0o600);
    try { await handle.writeFile(JSON.stringify(IndexSchema.parse(index))); await handle.sync(); } finally { await handle.close(); }
    // Failure leaves the ledger/temp as evidence. Never unlink destination first.
    await rename(temporary, path.join(this.appRoot.canonicalPath, "state-index.json"));
  }

  async status(projectId: string): Promise<"NEVER_INITIALIZED" | "INITIALIZED"> {
    ProjectIdSchema.parse(projectId);
    const index = await this.index();
    const entry = index.entries.find((item) => item.projectId === projectId);
    if (entry?.phase === "PREPARING") throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INITIALIZATION_INTERRUPTED_REVIEW_REQUIRED");
    if (!entry) {
      try {
        await checkedDescendant(this.appRoot, `projects/${projectId}`);
        throw new WorkspaceFailure("STATE_UNAVAILABLE", "ORPHAN_PROJECT_STATE_REVIEW_REQUIRED");
      } catch (error) { if (!hasCode(error, "ENOENT")) throw error; }
      return "NEVER_INITIALIZED";
    }
    await this.databasePath(projectId);
    return "INITIALIZED";
  }

  async databasePath(projectId: string): Promise<string> {
    ProjectIdSchema.parse(projectId);
    try {
      const filename = await checkedDescendant(this.appRoot, `projects/${projectId}/project.db`);
      const info = await lstat(filename);
      if (!info.isFile() || info.size === 0 || info.size > 4 * 1024 * 1024) throw new WorkspaceFailure("DATABASE_UNAVAILABLE", "STATE_DATABASE_SIZE_INVALID");
      for (const suffix of ["-journal", "-wal", "-shm"]) {
        try {
          await checkedDescendant(this.appRoot, `projects/${projectId}/project.db${suffix}`);
          throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_JOURNAL_REVIEW_REQUIRED");
        } catch (error) { if (!hasCode(error, "ENOENT")) throw error; }
      }
      return filename;
    } catch (error) {
      if (hasCode(error, "ENOENT")) throw new WorkspaceFailure("DATABASE_UNAVAILABLE", "PREVIOUS_STATE_MISSING");
      throw error;
    }
  }

  async begin(projectId: string): Promise<string> {
    if (await this.status(projectId) !== "NEVER_INITIALIZED") throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_ALREADY_INITIALIZED");
    const index = await this.index();
    index.entries.push({ projectId, phase: "PREPARING" }); await this.save(index);
    for (const relative of ["projects", `projects/${projectId}`]) {
      try { await mkdir(path.join(this.appRoot.canonicalPath, relative), { mode: 0o700 }); }
      catch (error) { if (!hasCode(error, "EEXIST")) throw error; }
      await checkedDescendant(this.appRoot, relative);
    }
    const filename = path.join(this.appRoot.canonicalPath, "projects", projectId, "project.db");
    const handle = await open(filename, "wx", 0o600); await handle.close();
    return filename;
  }

  async complete(projectId: string): Promise<void> {
    const index = await this.index();
    const entry = index.entries.find((item) => item.projectId === projectId);
    if (entry?.phase !== "PREPARING") throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INITIALIZATION_INTENT_LOST");
    entry.phase = "INITIALIZED"; await this.save(index);
  }
}
