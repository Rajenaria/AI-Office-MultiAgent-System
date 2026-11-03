import { createHash } from "node:crypto";
import { lstat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { ProjectRelativePathSchema, ReferenceIdSchema } from "../../contracts/index.js";
import { checkedDescendant, isWithin, validateLocalPath } from "../workspace/paths.js";
import { hasCode } from "../workspace/errors.js";
import { OperationSchema, ProbeModeSchema, requireSecurity, type AttemptContext, type SyntheticContextAuthority } from "./context.js";

export const RequestSchema = z.strictObject({
  projectId: z.uuid(), taskId: ReferenceIdSchema, attemptId: z.uuid(), attemptGeneration: z.int().positive(),
  workspaceBindingId: ReferenceIdSchema, operation: OperationSchema, path: z.string().min(1).max(240),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/).optional(), probeMode: ProbeModeSchema.optional(),
});
export type SyntheticRequest = z.infer<typeof RequestSchema>;
export type EvaluatedOperation = Readonly<{ request: SyntheticRequest; relativePath: string; canonicalPath: string; fingerprint: string }>;

// Authorization decision only. This evaluator does not perform requested IO.
export class HostPathPolicy {
  constructor(private readonly authority: SyntheticContextAuthority) {}
  async evaluate(context: AttemptContext, input: unknown): Promise<EvaluatedOperation> {
    const request = RequestSchema.parse(input), root = await this.authority.assert(context);
    requireSecurity(request.projectId === context.projectId && request.taskId === context.taskId &&
      request.attemptId === context.attemptId && request.attemptGeneration === context.attemptGeneration &&
      request.workspaceBindingId === context.workspaceBindingId, "REQUEST_SCOPE_MISMATCH");
    requireSecurity(context.operations.includes(request.operation), "OPERATION_NOT_PERMITTED");
    let relative = request.path;
    if (path.win32.isAbsolute(relative)) {
      const absolute = validateLocalPath(relative);
      requireSecurity(isWithin(root.canonicalPath, absolute), "PATH_OUTSIDE_PROJECT");
      relative = path.win32.relative(root.canonicalPath, absolute).replaceAll("\\", "/");
    }
    relative = ProjectRelativePathSchema.parse(relative);
    requireSecurity(relative.split("/")[0] !== ".ai-office", "AUTHORITY_METADATA_EXCLUDED");
    const target = path.join(root.canonicalPath, relative);
    const scopes = request.operation === "READ" ? context.readScope : context.writeScope;
    requireSecurity(scopes.some((scope) => isWithin(path.join(root.canonicalPath, scope), target)), "PATH_OUTSIDE_APPROVED_SCOPE");
    requireSecurity((request.operation === "WRITE" || request.operation === "CREATE") === (request.contentHash !== undefined), "CONTENT_FINGERPRINT_REQUIRED_OR_UNEXPECTED");
    requireSecurity((request.operation === "PROBE") === (request.probeMode !== undefined), "PROBE_PROFILE_REQUIRED_OR_UNEXPECTED");
    if (request.operation === "CREATE") {
      const parent = path.posix.dirname(relative);
      requireSecurity(parent !== ".", "SCOPED_PARENT_REQUIRED");
      await checkedDescendant(root, parent);
      let absent = false;
      try { await lstat(target); } catch (error) { if (hasCode(error, "ENOENT")) absent = true; else throw error; }
      requireSecurity(absent, "CREATE_TARGET_EXISTS");
    } else {
      await checkedDescendant(root, relative);
      const info = await lstat(target);
      requireSecurity(request.operation === "PROBE" ? info.isDirectory() : info.isFile(), "OPERATION_TARGET_TYPE_MISMATCH");
    }
    const normalized = RequestSchema.parse({ ...request, path: relative });
    const fingerprint = createHash("sha256").update(JSON.stringify({ context, request: normalized })).digest("hex");
    return Object.freeze({ request: Object.freeze(normalized), relativePath: relative, canonicalPath: target, fingerprint });
  }
}
