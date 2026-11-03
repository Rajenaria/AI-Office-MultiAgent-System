import { describe, expect, it } from "vitest";
import { projectSkillMetadata } from "../../../src/web/skills/projection.js";
import { globalSkill, projectSkill, PROJECT_A, PROJECT_B, view } from "./fixtures.js";
import { ready, snapshot } from "../fixtures.js";

describe("independent skill metadata states", () => {
  it("assignment does not imply session availability or execution", () => {
    const result = projectSkillMetadata([{ ...globalSkill(), proposedAgentRole: "agent:frontend" }], view());
    expect(result.global[0]?.metadata.proposedAgentRole).toBe("agent:frontend");
    expect(result.global[0]?.metadata.sessionAvailability).toBe("UNKNOWN"); expect(result.executionEnabled).toBe(false);
    expect(result.global[0]?.metadata.enforcementVerification).toBe("NOT_VERIFIED");
  });
  it("allowed policy does not imply enforced permission", () => {
    const result = projectSkillMetadata([{ ...globalSkill(), allowedByPolicy: "ALLOWED" }], view());
    expect(result.global[0]?.metadata.allowedByPolicy).toBe("ALLOWED"); expect(result.executionEnabled).toBe(false);
    expect(result.global[0]?.metadata.enforcementVerification).toBe("NOT_VERIFIED");
  });
  it("installed does not imply discovery or session availability", () => {
    const result = projectSkillMetadata([{ ...globalSkill(), installationStatus: "INSTALLED" }], view()).global[0]!.metadata;
    expect(result.installationStatus).toBe("INSTALLED"); expect(result.discoveryStatus).toBe("NOT_VERIFIED"); expect(result.sessionAvailability).toBe("UNKNOWN");
  });
  it("discovery does not imply runtime compatibility", () => {
    const result = projectSkillMetadata([{ ...globalSkill(), discoveryStatus: "DISCOVERED" }], view()).global[0]!.metadata;
    expect(result.discoveryStatus).toBe("DISCOVERED"); expect(result.compatibilityStatus).toBe("UNKNOWN");
  });
  it("compatibility does not imply policy permission", () => {
    const result = projectSkillMetadata([{ ...globalSkill(), compatibilityStatus: "COMPATIBLE" }], view()).global[0]!.metadata;
    expect(result.compatibilityStatus).toBe("COMPATIBLE"); expect(result.allowedByPolicy).toBe("UNKNOWN");
  });
  it("preserves UNKNOWN and optional missing values without fabricated evidence", () => {
    const result = projectSkillMetadata([globalSkill()], view()).global[0]!.metadata;
    expect(result).toEqual(globalSkill()); expect(result.runtime.version).toBeUndefined(); expect(result.proposedAgentRole).toBeUndefined();
    expect(result.sessionVerification).toBe("NOT_VERIFIED"); expect(result.sessionAvailability).toBe("UNKNOWN");
  });
});

describe("validated workspace scope and immutable projection", () => {
  const records = () => [globalSkill(), projectSkill(PROJECT_A), projectSkill(PROJECT_B)];
  it("keeps global metadata global and does not merge project ownership", () => {
    const result = projectSkillMetadata(records(), view(PROJECT_A));
    expect(result.activeProjectId).toBe(PROJECT_A); expect(result.global.map((item) => item.metadata.scope)).toEqual(["global"]);
    expect(result.project.map((item) => item.metadata.skillId)).toEqual(["test:A_ONLY"]);
    expect("projectId" in result.global[0]!.metadata).toBe(false);
    expect(projectSkillMetadata(records(), view(PROJECT_B)).project.map((item) => item.metadata.skillId)).toEqual(["test:B_ONLY"]);
  });
  it("keeps same skill ID in different runtimes distinct", () => {
    const first = globalSkill(); const second = { ...first, runtime: { runtimeId: "runtime:other", version: "test-only" } };
    const result = projectSkillMetadata([first, second], view());
    expect(result.global).toHaveLength(2); expect(result.global[0]?.key).not.toBe(result.global[1]?.key);
  });
  it("rejects duplicate identities rather than merging conflicting assignments", () => {
    expect(() => projectSkillMetadata([globalSkill(), { ...globalSkill(), proposedAgentRole: "agent:qa" }], view())).toThrow("DUPLICATE_SKILL_METADATA");
  });
  it.each([
    { ...globalSkill(), scope: "project" },
    { ...globalSkill(), scope: "project", projectId: "folder-name" },
    { ...globalSkill(), projectId: PROJECT_A },
    { ...globalSkill(), sessionAvailability: "AVAILABLE" },
    { ...globalSkill(), enforcementVerification: "VERIFIED" },
    { ...globalSkill(), sourceUrl: "javascript:fixture()" },
  ])("rejects unsupported scope, claims or extra executable metadata %#", (record) => {
    expect(() => projectSkillMetadata([record], view())).toThrow("INVALID_SKILL_METADATA");
  });
  it.each(["stale", "disconnected", "unknown"] as const)("hides project records for %s transport", (freshness) => {
    const result = projectSkillMetadata(records(), { ...view(), freshness });
    expect(result.project).toEqual([]); expect(result.activeProjectId).toBeNull(); expect(result.global).toHaveLength(1);
  });
  it.each(["DISCONNECTED", "SESSION_INVALID", "CONNECTING", "UNKNOWN"] as const)("hides project records for %s connection", (connection) => {
    expect(projectSkillMetadata(records(), { ...view(), connection }).project).toEqual([]);
  });
  it("hides records immediately during switching or when session is invalid", () => {
    expect(projectSkillMetadata(records(), { ...view(), busy: true }).project).toEqual([]);
    expect(projectSkillMetadata(records(), { ...view(), sessionReady: false }).project).toEqual([]);
    expect(projectSkillMetadata(records(), { ...view(), workspace: null, snapshot: null }).project).toEqual([]);
  });
  it("rejects stale binding/generation and mixed A/B context for display", () => {
    expect(projectSkillMetadata(records(), { ...view(), workspace: ready(PROJECT_B) }).project).toEqual([]);
    const old = snapshot(); const stale = { ...old, snapshot: { ...old.snapshot, binding: { ...old.snapshot.binding, bindingId: "binding:retired" } } };
    expect(projectSkillMetadata(records(), { ...view(), snapshot: stale }).project).toEqual([]);
    const staleGeneration = { ...old, snapshot: { ...old.snapshot, binding: { ...old.snapshot.binding, generation: 0 } } };
    expect(projectSkillMetadata(records(), { ...view(), snapshot: staleGeneration }).project).toEqual([]);
  });
  it("does not mutate metadata or workspace and freezes the resulting view", () => {
    const input = records(), context = view(), before = JSON.stringify({ input, context });
    const result = projectSkillMetadata(input, context);
    expect(JSON.stringify({ input, context })).toBe(before); expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.global)).toBe(true); expect(Object.isFrozen(result.global[0]?.metadata.runtime)).toBe(true);
  });
});
