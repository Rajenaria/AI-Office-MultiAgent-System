import { mkdir, open } from "node:fs/promises";
import path from "node:path";
import { ProjectIdentitySchema, type ProjectIdentity } from "../../contracts/index.js";
import { checkedDescendant, readSmallFile, revalidateRoot, type Root } from "./paths.js";
import { hasCode, WorkspaceFailure } from "./errors.js";

export async function readIdentity(root: Root): Promise<ProjectIdentity | null> {
  let marker: string;
  try { marker = await checkedDescendant(root, ".ai-office/project.json"); }
  catch (error) { if (hasCode(error, "ENOENT")) return null; throw error; }
  const raw = await readSmallFile(marker, 4096);
  try { return ProjectIdentitySchema.parse(JSON.parse(raw)); }
  catch { throw new WorkspaceFailure("IDENTITY_CONFLICT", "CORRUPT_OR_UNSUPPORTED_MARKER"); }
}

export async function createIdentity(root: Root, identity: ProjectIdentity): Promise<void> {
  await revalidateRoot(root);
  try { await mkdir(path.join(root.canonicalPath, ".ai-office")); }
  catch (error) { if (!hasCode(error, "EEXIST")) throw error; }
  await checkedDescendant(root, ".ai-office");
  const marker = path.join(root.canonicalPath, ".ai-office", "project.json");
  // A registry PREPARING record is persisted before entering here. Never delete
  // partial output on failure; retry cannot silently generate a second identity.
  const handle = await open(marker, "wx", 0o600);
  try { await handle.writeFile(JSON.stringify(identity) + "\n", "utf8"); await handle.sync(); }
  finally { await handle.close(); }
  const actual = await readIdentity(root);
  if (JSON.stringify(actual) !== JSON.stringify(identity)) {
    throw new WorkspaceFailure("IDENTITY_CONFLICT", "MARKER_WRITE_MISMATCH");
  }
}
