import { mkdir, open, readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { ProjectIdentitySchema } from "../../contracts/index.js";
import { isWithin, readSmallFile, revalidateRoot, validateLocalPath, validateRoot, type Root } from "./paths.js";
import { hasCode, WorkspaceFailure } from "./errors.js";

const EntrySchema = z.strictObject({
  identity: ProjectIdentitySchema,
  canonicalPath: z.string().refine((value) => {
    try { return validateLocalPath(value) === value; } catch { return false; }
  }),
  fileKey: z.string().regex(/^\d+:\d+$/),
  status: z.enum(["PREPARING", "IDENTITY_ATTACHED"]),
}).readonly();
const RegistrySchema = z.strictObject({
  schemaVersion: z.literal(1), entries: z.array(EntrySchema).max(1000),
  // This is last identity selection, explicitly NOT last fully READY state.
  lastAttachedProjectId: z.uuid().nullable(),
}).superRefine((value, ctx) => {
  const ids = new Set<string>(), paths = new Set<string>(), keys = new Set<string>();
  for (const entry of value.entries) {
    if (ids.has(entry.identity.projectId) || paths.has(entry.canonicalPath.toLowerCase()) || keys.has(entry.fileKey)) {
      ctx.addIssue({ code: "custom", message: "Conflicting registry mappings" });
    }
    ids.add(entry.identity.projectId); paths.add(entry.canonicalPath.toLowerCase()); keys.add(entry.fileKey);
  }
  if (value.lastAttachedProjectId !== null && !value.entries.some((entry) =>
    entry.identity.projectId === value.lastAttachedProjectId && entry.status === "IDENTITY_ATTACHED")) {
    ctx.addIssue({ code: "custom", message: "Invalid last attachment" });
  }
});
export type RegistryEntry = z.infer<typeof EntrySchema>;
type RegistryData = z.infer<typeof RegistrySchema>;
export type FaultStage = "beforeRegistryRename" | "afterPreparing" | "afterMarker";
export type FaultHook = (stage: FaultStage) => void | Promise<void>;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const registrySeal = "ai-office-registry-v1\n";
const sourceRoot = fileURLToPath(new URL("../../../", import.meta.url));

export class ProjectRegistry {
  private data: RegistryData = { schemaVersion: 1, entries: [], lastAttachedProjectId: null };
  private checksum: string | null = null;
  private closed = false;
  private poisoned = false;
  private readonly lockToken = randomUUID();

  private constructor(readonly root: Root, private readonly fault?: FaultHook) {}

  static async acquire(dataRoot: string, fault?: FaultHook): Promise<ProjectRegistry> {
    const requested = validateLocalPath(dataRoot);
    if (isWithin(sourceRoot, requested)) throw new WorkspaceFailure("ACCESS_DENIED", "REGISTRY_INSIDE_SOURCE_REJECTED");
    await mkdir(requested, { recursive: true, mode: 0o700 });
    const root = await validateRoot(requested);
    if (isWithin(sourceRoot, root.canonicalPath)) throw new WorkspaceFailure("ACCESS_DENIED", "REGISTRY_INSIDE_SOURCE_REJECTED");
    const registry = new ProjectRegistry(root, fault);
    const lock = path.join(root.canonicalPath, "writer.lock");
    let handle;
    try { handle = await open(lock, "wx", 0o600); }
    catch (error) {
      if (hasCode(error, "EEXIST")) throw new WorkspaceFailure("STATE_UNAVAILABLE", "WRITER_LOCK_REVIEW_REQUIRED");
      throw error;
    }
    try {
      await handle.writeFile(registry.lockToken); await handle.sync(); await handle.close();
      const names = await readdir(root.canonicalPath);
      if (names.some((name) => /^registry-.*\.tmp$/i.test(name))) {
        throw new WorkspaceFailure("STATE_UNAVAILABLE", "INTERRUPTED_REGISTRY_WRITE_REVIEW_REQUIRED");
      }
      const raw = await registry.readDisk();
      if (raw !== null) {
        try { registry.data = RegistrySchema.parse(JSON.parse(raw)); }
        catch { throw new WorkspaceFailure("STATE_UNAVAILABLE", "CORRUPT_REGISTRY_REVIEW_REQUIRED"); }
        registry.checksum = digest(raw);
      }
      let seal: string | null = null;
      try { seal = await readSmallFile(path.join(root.canonicalPath, "registry.initialized"), 128); }
      catch (error) { if (!hasCode(error, "ENOENT")) throw error; }
      if ((raw !== null && seal !== registrySeal) || (raw === null && seal !== null)) {
        throw new WorkspaceFailure("STATE_UNAVAILABLE", "REGISTRY_MISSING_OR_INCOMPLETE_REVIEW_REQUIRED");
      }
      return registry;
    } catch (error) {
      await handle.close().catch(() => undefined);
      await registry.close();
      throw error;
    }
  }

  private async readDisk(): Promise<string | null> {
    try { return await readSmallFile(path.join(this.root.canonicalPath, "registry.json"), 1024 * 1024); }
    catch (error) { if (hasCode(error, "ENOENT")) return null; throw error; }
  }

  async verify(): Promise<void> {
    if (this.closed || this.poisoned) throw new WorkspaceFailure("STATE_UNAVAILABLE", "REGISTRY_RESTART_REVIEW_REQUIRED");
    await revalidateRoot(this.root);
    if (await readSmallFile(path.join(this.root.canonicalPath, "writer.lock"), 128) !== this.lockToken) {
      this.poisoned = true;
      throw new WorkspaceFailure("STATE_UNAVAILABLE", "WRITER_OWNERSHIP_LOST");
    }
    const raw = await this.readDisk();
    if ((raw === null ? null : digest(raw)) !== this.checksum) {
      this.poisoned = true;
      throw new WorkspaceFailure("STATE_UNAVAILABLE", "REGISTRY_CHANGED_EXTERNALLY");
    }
  }

  // Only explicit project ownership lookups, never a mutable currentProject.
  byProject(projectId: string): RegistryEntry | undefined {
    return this.data.entries.find((entry) => entry.identity.projectId === projectId);
  }

  byRoot(root: Root): RegistryEntry | undefined {
    const entry = this.data.entries.find((item) => item.canonicalPath.toLowerCase() === root.canonicalPath.toLowerCase() || item.fileKey === root.fileKey);
    if (entry && (entry.fileKey !== root.fileKey || entry.canonicalPath.toLowerCase() !== root.canonicalPath.toLowerCase())) {
      throw new WorkspaceFailure("IDENTITY_CONFLICT", "ROOT_REPLACED_OR_UNSUPPORTED_ALIAS");
    }
    return entry;
  }

  async put(entry: RegistryEntry, select = false): Promise<void> {
    await this.verify();
    const next = RegistrySchema.parse({ ...this.data,
      entries: [...this.data.entries.filter((item) => item.identity.projectId !== entry.identity.projectId), entry],
      lastAttachedProjectId: select ? entry.identity.projectId : this.data.lastAttachedProjectId });
    const contents = JSON.stringify(next, null, 2) + "\n";
    if (Buffer.byteLength(contents) > 1024 * 1024) throw new WorkspaceFailure("STATE_UNAVAILABLE", "REGISTRY_CAPACITY_REACHED");
    const temporary = path.join(this.root.canonicalPath, `registry-${randomUUID()}.tmp`);
    try {
      if (this.checksum === null) {
        // A small presence seal, not a second mapping store: detects registry
        // deletion across restart and interrupted very first initialization.
        const seal = await open(path.join(this.root.canonicalPath, "registry.initialized"), "wx", 0o600);
        try { await seal.writeFile(registrySeal); await seal.sync(); }
        finally { await seal.close(); }
      }
      const handle = await open(temporary, "wx", 0o600);
      try { await handle.writeFile(contents, "utf8"); await handle.sync(); }
      finally { await handle.close(); }
      await this.fault?.("beforeRegistryRename");
      await this.verify();
      // Same-directory atomic replacement attempt; no unlink-then-rename fallback.
      await rename(temporary, path.join(this.root.canonicalPath, "registry.json"));
      this.data = next; this.checksum = digest(contents);
    } catch (error) {
      // Leave the temp file as evidence; restart requires review, never silent reset.
      this.poisoned = true;
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await revalidateRoot(this.root);
    const filename = path.join(this.root.canonicalPath, "writer.lock");
    if (await readSmallFile(filename, 128) !== this.lockToken) {
      throw new WorkspaceFailure("STATE_UNAVAILABLE", "WRITER_OWNERSHIP_LOST");
    }
    await unlink(filename); // Own lock only; no registry or project cleanup.
  }
}
