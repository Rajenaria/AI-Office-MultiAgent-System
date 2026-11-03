import { mkdtemp, mkdir, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "vitest";
import { z } from "zod";
import { ProjectIdentitySchema, WorkspaceViewStateSchema } from "../../../src/contracts/index.js";
import { startBackend } from "../../../src/server/index.js";
import type { WorkspaceManager } from "../../../src/server/workspace/manager.js";
import type { FaultHook } from "../../../src/server/workspace/registry.js";
import { isWithin } from "../../../src/server/workspace/paths.js";

export async function fixture() {
  const parent = await realpath(tmpdir());
  const root = await mkdtemp(path.join(parent, "ai-office-m0103-"));
  const a = path.join(root, "Project A 日本語");
  const b = path.join(root, "Project B");
  const dataRoot = path.join(root, "private-data");
  await mkdir(a); await mkdir(b);
  const backends: Awaited<ReturnType<typeof startBackend>>[] = [];
  return {
    root, a, b, dataRoot,
    async start(fault?: FaultHook) {
      const backend = await startBackend({ dataRoot, port: 0, ...(fault ? { fault } : {}) });
      backends.push(backend); return backend;
    },
    async cleanup() {
      for (const backend of backends.toReversed()) await backend.close();
      // The only recursive removal in this milestone is this owned fixture root.
      // Verify absolute target and resolved containment before deleting on Windows.
      const resolved = await realpath(root);
      if (resolved !== root || !isWithin(parent, resolved) || resolved === parent ||
          !path.basename(resolved).startsWith("ai-office-m0103-")) throw new Error("Unsafe fixture cleanup target");
      await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    },
  };
}
export type Fixture = Awaited<ReturnType<typeof fixture>>;

const ResponseSchema = z.strictObject({
  view: WorkspaceViewStateSchema, identity: ProjectIdentitySchema.nullable(),
  stateService: z.literal("NOT_IMPLEMENTED"),
  nextAction: z.strictObject({ kind: z.enum(["INITIALIZATION_REQUIRED", "REGISTRATION_REQUIRED", "RECOVERY_REQUIRED"]),
    consentToken: z.string(), canonicalPath: z.string(), expiresAt: z.iso.datetime() }).nullable(),
});
export async function readWorkspace(response: Response) { return ResponseSchema.parse(await response.json()); }

export async function initialize(manager: WorkspaceManager, folder: string) {
  const current = await manager.current();
  const opened = await manager.open({ path: folder, expectedGeneration: current.view.generation });
  expect(opened.nextAction).not.toBeNull();
  if (!opened.nextAction) throw new Error("Consent challenge expected");
  return manager.initialize({ path: opened.nextAction.canonicalPath, expectedGeneration: opened.view.generation,
    consentToken: opened.nextAction.consentToken, consent: true });
}

export function scopeOf(result: Awaited<ReturnType<WorkspaceManager["current"]>>) {
  if (result.view.state !== "LOADING" || !result.identity) throw new Error("Identity attachment expected");
  return { projectId: result.identity.projectId, binding: result.view.binding };
}

export async function session(backend: { url: string; bootstrapToken: string }) {
  const response = await fetch(`${backend.url}/api/session`, { method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${backend.bootstrapToken}` }, body: "{}" });
  expect(response.status).toBe(200);
  const result = await response.json() as { sessionToken: string; csrfNonce: string };
  return { "Content-Type": "application/json", "X-AI-Office-Session": result.sessionToken, "X-AI-Office-Nonce": result.csrfNonce };
}
