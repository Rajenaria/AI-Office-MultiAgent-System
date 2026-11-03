import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SkillMetadataPanel } from "../../../src/web/components/SkillMetadataPanel.js";
import { ShellController } from "../../../src/web/workspace/controller.js";
import { projectSkillMetadata } from "../../../src/web/skills/projection.js";
import { deferred, fakeApi, snapshot } from "../fixtures.js";
import { globalSkill, projectSkill, PROJECT_A, PROJECT_B, view } from "./fixtures.js";

afterEach(() => { vi.useRealTimers(); });
const render = (state = view(), records?: readonly unknown[]) => renderToStaticMarkup(createElement(SkillMetadataPanel,
  { state, ...(records ? { fixtureMetadata: records } : {}) }));

describe("read-only skill diagnostic panel", () => {
  it("ordinary mode is honestly empty, not a fabricated installed inventory", () => {
    const html = render();
    expect(html).toContain("No verified skill inventory is available"); expect(html).toContain("Runtime discovery and session verification have not yet been performed");
    expect(html).toContain("Inventory absence does not establish whether skills are installed");
    expect(html).not.toContain('data-testid="skill-record"'); expect(html).not.toContain("test:A_ONLY");
  });
  it("labels all fixture records DEMO/TEST and keeps assignment/policy distinct from execution", () => {
    const html = render(view(), [{ ...globalSkill(), proposedAgentRole: "agent:frontend", allowedByPolicy: "ALLOWED" }]);
    expect(html).toContain("DEMO / TEST METADATA"); expect(html).toContain("not runtime observations"); expect(html).toContain("agent:frontend (PROPOSED)");
    expect(html).toContain("ALLOWED"); expect(html).toContain("UNKNOWN"); expect(html).toContain("NOT_VERIFIED"); expect(html).toContain("Foundation skill execution: OFF");
    expect(html).not.toMatch(/<(button|input|select|textarea|form|a)\b/); expect(html).not.toContain("ENABLED");
  });
  it("represents absent runtime version and role without inventing configuration", () => {
    const html = render(view(), [globalSkill()]); expect(html).toContain("NOT CONFIGURED"); expect(html).toContain("UNKNOWN");
  });
  it("renders supported untrusted text inertly and rejects unsupported descriptions/URLs", () => {
    const malicious = '<img src=x onerror="fixture()"><script>fixture()</script>';
    const html = render(view(), [{ ...globalSkill(), runtime: { runtimeId: "runtime:test", version: malicious } }]);
    expect(html).toContain("&lt;img"); expect(html).toContain("&lt;script&gt;"); expect(html).not.toContain("<script>"); expect(html).not.toContain("<img");
    const rejected = render(view(), [{ ...globalSkill(), description: malicious, sourceUrl: "javascript:fixture()" }]);
    expect(rejected).toContain("Skill metadata rejected"); expect(rejected).not.toContain(malicious);
  });
  it("does not claim project verification when disconnected or without a project", () => {
    const html = render({ ...view(), connection: "DISCONNECTED" }, [globalSkill(), projectSkill()]);
    expect(html).not.toContain("test:A_ONLY"); expect(html).toContain("NOT VERIFIED"); expect(html).toContain("test:global");
    expect(render({ ...view(), workspace: null, snapshot: null })).toContain("No verified skill inventory");
  });
  it("consumes existing controller switching and ignores late A without new selection authority", async () => {
    vi.useFakeTimers();
    const api = fakeApi(), controller = new ShellController(api); const records = [projectSkill(PROJECT_A), projectSkill(PROJECT_B)];
    try {
      await controller.connect("synthetic-test-input"); expect(render(controller.getState(), records)).toContain("test:A_ONLY");
      const late = deferred<ReturnType<typeof snapshot>>(); api.snapshot.mockImplementationOnce(() => late.promise);
      await vi.advanceTimersByTimeAsync(2000);
      const switching = controller.open("B fixture"); expect(render(controller.getState(), records)).not.toContain("test:A_ONLY");
      expect(projectSkillMetadata(records, controller.getState()).project).toEqual([]);
      await switching; expect(render(controller.getState(), records)).toContain("test:B_ONLY");
      late.resolve(snapshot(PROJECT_A)); await Promise.resolve(); await Promise.resolve();
      const html = render(controller.getState(), records); expect(html).toContain("test:B_ONLY"); expect(html).not.toContain("test:A_ONLY");
    } finally { controller.stop(); }
  });
});
