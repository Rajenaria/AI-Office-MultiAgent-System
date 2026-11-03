import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireSecurity, type AttemptContext, type SyntheticContextAuthority } from "./context.js";
import type { EvaluatedOperation } from "./policy.js";

const DecisionSchema = z.strictObject({ requestId: z.uuid(), projectId: z.uuid(), taskId: z.string(),
  attemptId: z.uuid(), attemptGeneration: z.int().positive(), fingerprint: z.string(), decision: z.enum(["ALLOW", "DENY"]) });
export type ApprovalRequest = Readonly<{ requestId: string; projectId: string; taskId: string; attemptId: string;
  attemptGeneration: number; operation: string; path: string; fingerprint: string; expiresAt: string;
  source: "synthetic-trusted-controller" }>;
export type ApprovalController = Readonly<{ source: "synthetic-trusted-controller" }>;
type Entry = { request: ApprovalRequest; state: "PENDING" | "ALLOW" | "DENY" | "CONSUMED" };

export class SyntheticApprovals {
  private readonly entries = new Map<string, Entry>();
  private constructor(private readonly authority: SyntheticContextAuthority, private readonly controller: ApprovalController) {}
  static create(authority: SyntheticContextAuthority) {
    const controller: ApprovalController = Object.freeze({ source: "synthetic-trusted-controller" });
    return { approvals: new SyntheticApprovals(authority, controller), controller };
  }
  async request(context: AttemptContext, operation: EvaluatedOperation, lifetimeMs = 5000): Promise<ApprovalRequest> {
    await this.authority.assert(context);
    requireSecurity(Number.isInteger(lifetimeMs) && lifetimeMs > 0 && lifetimeMs <= 30_000, "INVALID_APPROVAL_LIFETIME");
    const request: ApprovalRequest = Object.freeze({ requestId: randomUUID(), projectId: context.projectId,
      taskId: context.taskId, attemptId: context.attemptId, attemptGeneration: context.attemptGeneration,
      operation: operation.request.operation, path: operation.relativePath, fingerprint: operation.fingerprint,
      expiresAt: new Date(Math.min(this.authority.now() + lifetimeMs, Date.parse(context.expiresAt))).toISOString(),
      source: "synthetic-trusted-controller" });
    this.entries.set(request.requestId, { request, state: "PENDING" }); return request;
  }
  async decide(context: AttemptContext, controller: ApprovalController, input: unknown): Promise<"ALLOW" | "DENY"> {
    requireSecurity(controller === this.controller, "TRUSTED_TEST_CONTROLLER_REQUIRED");
    await this.authority.assert(context);
    const response = DecisionSchema.parse(input), entry = this.entries.get(response.requestId);
    requireSecurity(entry, "UNKNOWN_APPROVAL");
    this.check(context, entry, response.fingerprint);
    requireSecurity(entry.state === "PENDING", "DECISION_ALREADY_FINAL");
    requireSecurity(response.projectId === context.projectId && response.taskId === context.taskId &&
      response.attemptId === context.attemptId && response.attemptGeneration === context.attemptGeneration, "DECISION_SCOPE_MISMATCH");
    entry.state = response.decision; return response.decision;
  }
  private check(context: AttemptContext, entry: Entry, fingerprint: string) {
    const request = entry.request;
    const valid = request.projectId === context.projectId && request.taskId === context.taskId &&
      request.attemptId === context.attemptId && request.attemptGeneration === context.attemptGeneration &&
      request.fingerprint === fingerprint && this.authority.now() < Date.parse(request.expiresAt);
    if (!valid) entry.state = "DENY";
    requireSecurity(valid, "APPROVAL_STALE_OR_SCOPE_MISMATCH");
  }
  async consume(context: AttemptContext, operation: EvaluatedOperation, requestId: string): Promise<void> {
    await this.authority.assert(context);
    const entry = this.entries.get(requestId); requireSecurity(entry, "UNKNOWN_APPROVAL");
    this.check(context, entry, operation.fingerprint);
    requireSecurity(entry.state === "ALLOW", "EXPLICIT_UNUSED_APPROVAL_REQUIRED");
    entry.state = "CONSUMED"; // One shot, including later spawn failure.
  }
  revoke(context: AttemptContext) {
    for (const entry of this.entries.values()) if (entry.request.attemptId === context.attemptId) entry.state = "DENY";
  }
}
