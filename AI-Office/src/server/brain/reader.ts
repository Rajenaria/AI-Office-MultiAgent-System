import { lstat, open } from "node:fs/promises";
import { createHash } from "node:crypto";
import { KnowledgeVersionSchema, type KnowledgeVersion } from "../../contracts/index.js";
import { checkedDescendant, type Root } from "../workspace/paths.js";
import { hasCode, WorkspaceFailure } from "../workspace/errors.js";

export const MARKDOWN_LIMIT = 64 * 1024;
export async function readKnowledge(root: Root, input: KnowledgeVersion) {
  const metadata = KnowledgeVersionSchema.parse(input);
  if (!metadata.relativePath.startsWith(".ai-office/brain/") || !/\.md$/i.test(metadata.relativePath)) {
    throw new WorkspaceFailure("ACCESS_DENIED", "REGISTERED_MARKDOWN_PATH_REQUIRED", 403);
  }
  try {
    const filename = await checkedDescendant(root, metadata.relativePath);
    const before = await lstat(filename, { bigint: true });
    if (!before.isFile() || before.size > BigInt(MARKDOWN_LIMIT)) throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_SIZE_OR_TYPE_INVALID");
    const handle = await open(filename, "r");
    let bytes: Buffer;
    try {
      const opened = await handle.stat({ bigint: true });
      if (opened.ino !== before.ino || opened.dev !== before.dev || opened.nlink !== 1n) throw new WorkspaceFailure("ACCESS_DENIED", "KNOWLEDGE_FILE_CHANGED", 403);
      const buffer = Buffer.alloc(MARKDOWN_LIMIT + 1);
      let total = 0;
      while (total < buffer.length) {
        const read = await handle.read(buffer, total, buffer.length - total, total);
        if (!read.bytesRead) break;
        total += read.bytesRead;
      }
      if (total > MARKDOWN_LIMIT) throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_TOO_LARGE");
      bytes = buffer.subarray(0, total);
      await checkedDescendant(root, metadata.relativePath);
      const after = await lstat(filename, { bigint: true });
      if (after.ino !== opened.ino || after.dev !== opened.dev || after.size !== opened.size || after.mtimeNs !== opened.mtimeNs) {
        throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_CHANGED_DURING_READ");
      }
    } finally { await handle.close(); }
    let content: string;
    try { content = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_INVALID_UTF8"); }
    if (content.includes("\0")) throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_BINARY_CONTENT");
    const actualHash = createHash("sha256").update(bytes).digest("hex");
    const matches = actualHash === metadata.contentHash;
    // Return Markdown as untrusted text, never instructions or executable HTML.
    // On mismatch, withhold content and explicitly override effective approval.
    return Object.freeze({ metadata, integrity: matches ? "VERIFIED" as const : "CHANGED" as const,
      effectiveStatus: matches ? metadata.status : "UNVERIFIED" as const,
      actualHash, content: matches ? content : null, contentType: "text/markdown" as const, trustedAsInstructions: false as const });
  } catch (error) {
    if (hasCode(error, "ENOENT")) throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_FILE_MISSING", 404);
    throw error;
  }
}
