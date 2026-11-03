import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ProjectRegistry } from "../../../../src/server/workspace/registry.js";
import { WorkspaceManager } from "../../../../src/server/workspace/manager.js";
import { isWithin } from "../../../../src/server/workspace/paths.js";
import { SyntheticContextAuthority, requireSecurity, type AttemptContext } from "../../../../src/server/runtime-security/context.js";
import { SyntheticSecurityHarness, probeRequest } from "../../../../src/server/runtime-security/supervisor.js";
import type { ApprovalRequest } from "../../../../src/server/runtime-security/approval.js";
import type { SyntheticRequest } from "../../../../src/server/runtime-security/policy.js";

export async function securityFixture(beforeSpawn?: () => Promise<void>) {
  const parent = await realpath(tmpdir());
  const root = await realpath(await mkdtemp(path.join(parent, "ai-office-m0202-")));
  const a = path.join(root, "project-a"), b = path.join(root, "project-b");
  for (const folder of ["project-a/read", "project-a/work", "project-b/read", "project-b/work", "app-private", "dummy-credentials", "journals"]) await mkdir(path.join(root, folder), { recursive: true });
  await writeFile(path.join(a, "read", "input.txt"), "A_ONLY"); await writeFile(path.join(a, "work", "existing.txt"), "A_WORK");
  await writeFile(path.join(b, "read", "input.txt"), "B_ONLY");
  await writeFile(path.join(root, "app-private", "sentinel.txt"), "PRIVATE_STATE");
  const canary = `FAKE_SECURITY_CANARY_${randomUUID()}`;
  await writeFile(path.join(root, "dummy-credentials", "fake-token.txt"), canary);
  const registry = await ProjectRegistry.acquire(path.join(root, "app-private"));
  const manager = new WorkspaceManager(registry);
  let now = Date.now();
  const authority = await SyntheticContextAuthority.forFixture(manager, registry, root, () => now);
  const harness = await SyntheticSecurityHarness.create(authority, beforeSpawn);
  async function options(project: "a" | "b" = "a") {
    const current = await manager.current();
    let workspace = await manager.open({ path: project === "a" ? a : b, expectedGeneration: current.view.generation });
    if (workspace.nextAction) workspace = await manager.initialize({ path: workspace.nextAction.canonicalPath,
      expectedGeneration: workspace.view.generation, consent: true, consentToken: workspace.nextAction.consentToken });
    requireSecurity("binding" in workspace.view && workspace.identity, "BOUND_FIXTURE_REQUIRED");
    return { scope: { projectId: workspace.identity.projectId, binding: workspace.view.binding },
      taskId: "task:fixture", attemptId: randomUUID(), attemptGeneration: 1, policyRef: "policy:synthetic",
      readScope: ["read", "work"], writeScope: ["work"], operations: ["READ", "WRITE", "CREATE", "PROBE"], lifetimeMs: 60_000 };
  }
  let closed = false;
  return { root, a, b, canary, manager, registry, authority, harness, options,
    advance(ms: number) { now += ms; },
    async issue(project: "a" | "b" = "a", overrides: Record<string, unknown> = {}) {
      const context = await authority.issue({ ...await options(project), ...overrides });
      await harness.register(context, randomUUID()); return context;
    },
    async approve(context: AttemptContext, input = probeRequest(context), decision: "ALLOW" | "DENY" = "ALLOW") {
      const request = await harness.requestApproval(context, input);
      await harness.decide(context, harness.controller, decisionFor(request, decision)); return request;
    },
    async checkSentinels() {
      requireSecurity(await readFile(path.join(b, "read", "input.txt"), "utf8") === "B_ONLY", "B_WAS_MODIFIED");
      requireSecurity(await readFile(path.join(root, "app-private", "sentinel.txt"), "utf8") === "PRIVATE_STATE", "PRIVATE_WAS_MODIFIED");
      requireSecurity(await readFile(path.join(root, "dummy-credentials", "fake-token.txt"), "utf8") === canary, "CANARY_WAS_MODIFIED");
    },
    async cleanup() {
      if (closed) return; closed = true;
      try { await harness.close(); } finally { await manager.close(); }
      const resolved = await realpath(root);
      requireSecurity(resolved === root && isWithin(parent, resolved) && resolved !== parent &&
        path.basename(resolved).startsWith("ai-office-m0202-"), "UNSAFE_FIXTURE_CLEANUP_TARGET");
      await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    },
  };
}
export type SecurityFixture = Awaited<ReturnType<typeof securityFixture>>;
export function decisionFor(request: ApprovalRequest, decision: "ALLOW" | "DENY" = "ALLOW") {
  return { requestId: request.requestId, projectId: request.projectId, taskId: request.taskId,
    attemptId: request.attemptId, attemptGeneration: request.attemptGeneration, fingerprint: request.fingerprint, decision };
}
export function fileRequest(context: AttemptContext, path: string, operation: SyntheticRequest["operation"] = "READ"): SyntheticRequest {
  const { probeMode: _, ...base } = probeRequest(context);
  return { ...base, operation, path, ...(["WRITE", "CREATE"].includes(operation) ? { contentHash: "a".repeat(64) } : {}) };
}
