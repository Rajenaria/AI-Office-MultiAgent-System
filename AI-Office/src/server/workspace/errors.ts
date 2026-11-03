import type { WorkspaceError } from "../../contracts/index.js";

export class WorkspaceFailure extends Error {
  readonly code: WorkspaceError["code"];
  readonly reason: string;
  readonly status: number;

  constructor(code: WorkspaceError["code"], reason: string, status = 409) {
    super(reason);
    this.code = code;
    this.reason = reason;
    this.status = status;
  }
}

export function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

// Never return OS messages, paths, stack traces or Zod input to HTTP callers.
export function safeFailure(error: unknown): WorkspaceFailure {
  if (error instanceof WorkspaceFailure) return error;
  if (hasCode(error, "EACCES") || hasCode(error, "EPERM") || hasCode(error, "EROFS")) {
    return new WorkspaceFailure("ACCESS_DENIED", "FILESYSTEM_ACCESS_DENIED", 403);
  }
  return new WorkspaceFailure("STATE_UNAVAILABLE", "FILESYSTEM_OR_STATE_FAILURE", 503);
}
