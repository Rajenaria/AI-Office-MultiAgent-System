import { access, lstat, open, realpath, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { ProjectRelativePathSchema } from "../../contracts/index.js";
import { hasCode, WorkspaceFailure } from "./errors.js";

export type Root = Readonly<{ canonicalPath: string; fileKey: string; aliasDetected: boolean }>;

export function validateLocalPath(input: string): string {
  if (process.platform !== "win32" || !/^[A-Za-z]:[\\/]/.test(input) || input.length > 240) {
    throw new WorkspaceFailure("INVALID_ROOT", "ABSOLUTE_LOCAL_WINDOWS_PATH_REQUIRED", 400);
  }
  const normalized = input.replaceAll("/", "\\").replace(/\\$/, "");
  const parts = normalized.slice(3).split("\\");
  if (normalized.length <= 3 || parts.some((part) =>
    !ProjectRelativePathSchema.safeParse(part).success || part.includes("/"))) {
    throw new WorkspaceFailure("INVALID_ROOT", "UNSAFE_PATH_OR_DRIVE_ROOT", 400);
  }
  return normalized;
}

// Component comparison, not string prefix; realpath/stat still required for IO.
export function isWithin(root: string, candidate: string): boolean {
  const relative = path.win32.relative(root, candidate);
  return relative === "" || (!path.win32.isAbsolute(relative) &&
    relative.split(/[\\/]/)[0] !== "..");
}

export async function validateRoot(input: string): Promise<Root> {
  const requested = validateLocalPath(input);
  let canonicalPath: string;
  try { canonicalPath = await realpath(requested); }
  catch (error) {
    if (hasCode(error, "ENOENT") || hasCode(error, "ENOTDIR")) {
      throw new WorkspaceFailure("INVALID_ROOT", "DIRECTORY_MISSING", 400);
    }
    throw error;
  }
  validateLocalPath(canonicalPath); // Reject canonical UNC/device destinations too.
  const info = await stat(canonicalPath, { bigint: true });
  if (!info.isDirectory()) throw new WorkspaceFailure("INVALID_ROOT", "DIRECTORY_REQUIRED", 400);
  await access(canonicalPath, constants.R_OK);
  return Object.freeze({ canonicalPath, fileKey: `${info.dev}:${info.ino}`,
    aliasDetected: requested !== canonicalPath });
}

export async function revalidateRoot(root: Root): Promise<void> {
  const current = await validateRoot(root.canonicalPath);
  if (current.canonicalPath !== root.canonicalPath || current.fileKey !== root.fileKey) {
    throw new WorkspaceFailure("IDENTITY_CONFLICT", "ROOT_REPLACED");
  }
}

// Existing descendants only; no contents are read. Future knowledge IO must use
// its own scoped authorization and handle checks. No knowledge HTTP route exists.
// Reject links even when their current target is inside the root.
export async function checkedDescendant(root: Root, relative: string): Promise<string> {
  const parsed = ProjectRelativePathSchema.safeParse(relative);
  if (!parsed.success) throw new WorkspaceFailure("INVALID_ROOT", "UNSAFE_REFERENCE", 400);
  await revalidateRoot(root);
  let cursor = root.canonicalPath;
  for (const part of parsed.data.split("/")) {
    cursor = path.join(cursor, part);
    const info = await lstat(cursor);
    if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile()) ||
        (info.isFile() && info.nlink !== 1)) {
      throw new WorkspaceFailure("ACCESS_DENIED", "LINK_OR_SPECIAL_FILE_REJECTED", 403);
    }
    const resolved = await realpath(cursor);
    if (!isWithin(root.canonicalPath, resolved) || path.relative(cursor, resolved) !== "") {
      throw new WorkspaceFailure("ACCESS_DENIED", "REFERENCE_ESCAPE", 403);
    }
  }
  return cursor;
}

export async function readSmallFile(filename: string, limit: number): Promise<string> {
  const before = await lstat(filename, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1n || before.size > BigInt(limit)) {
    throw new WorkspaceFailure("STATE_UNAVAILABLE", "UNSAFE_METADATA_FILE");
  }
  const handle = await open(filename, "r");
  try {
    const actual = await handle.stat({ bigint: true });
    if (actual.dev !== before.dev || actual.ino !== before.ino || actual.nlink !== 1n) {
      throw new WorkspaceFailure("STATE_UNAVAILABLE", "METADATA_CHANGED");
    }
    const buffer = Buffer.alloc(limit + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > limit) throw new WorkspaceFailure("STATE_UNAVAILABLE", "METADATA_TOO_LARGE");
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally { await handle.close(); }
}

// These checks reduce ordinary alias/escape errors. Node path-based operations
// are NOT a Windows handle-relative sandbox: concurrent reparse replacement,
// unusual reparse tags, mapped drives and same-user attackers remain M02 gates.
