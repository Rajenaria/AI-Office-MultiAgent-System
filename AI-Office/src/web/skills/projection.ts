import { FOUNDATION_POLICY, SkillMetadataSchema } from "../../contracts/index.js";
import { assertBinding, SnapshotResponseSchema, WorkspaceResponseSchema } from "../api.js";
import type { ShellState } from "../workspace/controller.js";

export type SkillViewContext = Pick<ShellState, "workspace" | "snapshot" | "connection" | "sessionReady" | "busy" | "freshness">;

function activeProject(context: SkillViewContext): string | null {
  if (context.busy || !context.sessionReady || context.connection !== "CONNECTED" || context.freshness !== "fresh") return null;
  const workspace = WorkspaceResponseSchema.safeParse(context.workspace);
  const snapshot = SnapshotResponseSchema.safeParse(context.snapshot);
  if (!workspace.success || !snapshot.success || workspace.data.view.state !== "READY") return null;
  try { assertBinding(snapshot.data.snapshot.binding, workspace.data.view.binding); }
  catch { return null; }
  return workspace.data.view.identity.projectId === snapshot.data.identity.projectId ? snapshot.data.identity.projectId : null;
}

// Pure read-only projection, never a runtime inventory or policy authority.
// Metadata is the existing inferred contract type; no parallel skill schema.
export function projectSkillMetadata(input: readonly unknown[], context: SkillViewContext) {
  const projectId = activeProject(context);
  const keys = new Set<string>();
  const records = input.map((value) => {
    const parsed = SkillMetadataSchema.safeParse(value);
    if (!parsed.success) throw new Error("INVALID_SKILL_METADATA");
    const metadata = parsed.data;
    const key = JSON.stringify([metadata.scope, metadata.scope === "project" ? metadata.projectId : null,
      metadata.runtime.runtimeId, metadata.runtime.version ?? null, metadata.skillId]);
    if (keys.has(key)) throw new Error("DUPLICATE_SKILL_METADATA");
    keys.add(key);
    return Object.freeze({ key, metadata });
  });
  return Object.freeze({ activeProjectId: projectId,
    global: Object.freeze(records.filter((record) => record.metadata.scope === "global")),
    project: Object.freeze(records.filter((record) => record.metadata.scope === "project" && record.metadata.projectId === projectId)),
    executionEnabled: FOUNDATION_POLICY.skillExecutionEnabled,
  });
}
