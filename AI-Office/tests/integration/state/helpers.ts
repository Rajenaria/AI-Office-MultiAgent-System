import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { ProjectIdentitySchema, ProjectSnapshotSchema, WorkspaceViewStateSchema } from "../../../src/contracts/index.js";
import { demoFixture } from "../../../src/demo/fixture.js";
import { startBackend } from "../../../src/server/index.js";
import type { StateFault } from "../../../src/server/state/storage.js";
import { fixture, initialize } from "../workspace/helpers.js";

export async function stateFixture() {
  const base = await fixture();
  const backends: Awaited<ReturnType<typeof startBackend>>[] = [];
  return { ...base,
    async stateStart(options: { fault?: StateFault; demoHttp?: boolean } = {}) {
      const backend = await startBackend({ dataRoot: base.dataRoot, port: 0, fixtureState: { root: base.root, ...options } });
      backends.push(backend); return backend;
    },
    async cleanup() { for (const backend of backends.toReversed()) await backend.close(); await base.cleanup(); },
  };
}
export type StateFixture = Awaited<ReturnType<typeof stateFixture>>;
export type Manager = Awaited<ReturnType<StateFixture["stateStart"]>>["manager"];
export function scope(result: Awaited<ReturnType<Manager["current"]>>) {
  if ((result.view.state !== "LOADING" && result.view.state !== "READY") || !result.identity) throw new Error("Expected bound identity");
  return { projectId: result.identity.projectId, binding: result.view.binding };
}
export async function initialized(manager: Manager, folder: string) {
  const identity = await initialize(manager, folder);
  return manager.initializeState({ scope: scope(identity), consent: true });
}
export async function markdown(folder: string, text: string) {
  await mkdir(path.join(folder, ".ai-office/brain"), { recursive: true });
  await writeFile(path.join(folder, ".ai-office/brain/fixture.md"), text, "utf8");
}
export async function seeded(manager: Manager, folder: string, text: string) {
  const ready = await initialized(manager, folder);
  const owner = scope(ready);
  await markdown(folder, text);
  const seed = demoFixture(owner.projectId, text, text);
  const snapshot = await manager.seedDemo({ scope: owner, fixture: seed });
  return { owner, seed, snapshot, ready };
}
export const dbPath = (f: StateFixture, projectId: string) => path.join(f.dataRoot, "projects", projectId, "project.db");
export const StateViewSchema = z.strictObject({ view: WorkspaceViewStateSchema, identity: ProjectIdentitySchema.nullable(),
  nextAction: z.strictObject({ kind: z.string(), consentToken: z.string(), canonicalPath: z.string(), expiresAt: z.string() }).nullable(),
  stateService: z.literal("AVAILABLE_FIXTURE_ONLY"), stateInitializationRequired: z.boolean() });
export const SnapshotResponseSchema = z.strictObject({ identity: ProjectIdentitySchema, snapshot: ProjectSnapshotSchema,
  knowledgeContentVerification: z.literal("NOT_PERFORMED") });
