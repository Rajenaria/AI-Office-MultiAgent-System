import { describe, expect, it } from "vitest";
import {
  ProjectIdentitySchema, ProjectOperationScopeSchema, WorkspaceBindingRefSchema,
  WorkspaceBindingSchema, WorkspaceViewStateSchema,
} from "../../src/contracts/index.js";
import { bindingRefFixture, EVENT_TIME, identityFixture, PROJECT_A, PROJECT_B } from "./fixtures.js";

describe("portable project identity", () => {
  it("accepts explicit UUID, schema version and UTC timestamp", () => {
    expect(ProjectIdentitySchema.parse(identityFixture())).toEqual(identityFixture());
  });

  it.each([
    { schemaVersion: 1, createdAt: EVENT_TIME },
    { ...identityFixture(), projectId: "folder-name" },
    { ...identityFixture(), schemaVersion: 2 },
    { ...identityFixture(), schemaVersion: "1" },
    { ...identityFixture(), createdAt: "2026-10-28" },
    { ...identityFixture(), createdAt: "2026-10-28T12:00:00.000" },
    { ...identityFixture(), createdAt: "2026-02-30T12:00:00.000Z" },
    { ...identityFixture(), createdAt: new Date(EVENT_TIME) },
    { ...identityFixture(), databasePath: "C:/private/project.db" },
    { ...identityFixture(), providerToken: "synthetic-not-a-credential" },
  ])("rejects malformed, unsupported or nonportable identity %#", (input) => {
    expect(ProjectIdentitySchema.safeParse(input).success).toBe(false);
  });
});

describe("backend-issued immutable workspace references", () => {
  it("carries an opaque root reference and freezes parsed bindings", () => {
    const parsed = WorkspaceBindingSchema.parse({ ...bindingRefFixture(), canonicalRootRef: "root:fixture" });
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Reflect.set(parsed, "projectId", PROJECT_B)).toBe(false);
    expect(parsed.projectId).toBe(PROJECT_A);
  });

  it.each([-1, 0.5, "1", Number.NaN, Number.MAX_SAFE_INTEGER + 1])("rejects invalid generation %s", (generation) => {
    expect(WorkspaceBindingRefSchema.safeParse({ ...bindingRefFixture(), generation }).success).toBe(false);
  });

  it("keeps internal roots out of the UI reference DTO", () => {
    expect(WorkspaceBindingRefSchema.safeParse({ ...bindingRefFixture(), canonicalRootRef: "root:fixture" }).success).toBe(false);
  });

  it("keeps operations on A valid independently of foreground B", () => {
    const foregroundB = WorkspaceViewStateSchema.parse({
      state: "READY", generation: 1, binding: bindingRefFixture(PROJECT_B), identity: identityFixture(PROJECT_B),
    });
    if (foregroundB.state !== "READY") throw new Error("Expected a READY foreground fixture");
    const scopeA = ProjectOperationScopeSchema.parse({ projectId: PROJECT_A, binding: bindingRefFixture(PROJECT_A) });
    expect(scopeA.projectId).not.toBe(foregroundB.identity.projectId);
    expect(scopeA.binding.projectId).toBe(PROJECT_A);
  });

  it("rejects an operation whose binding belongs to another project", () => {
    expect(ProjectOperationScopeSchema.safeParse({ projectId: PROJECT_A, binding: bindingRefFixture(PROJECT_B) }).success).toBe(false);
  });
});

describe("workspace lifecycle combinations", () => {
  it.each([
    { state: "DETACHED", generation: 0 },
    { state: "OPENING", generation: 1 },
    { state: "LOADING", generation: 1, binding: bindingRefFixture() },
    { state: "READY", generation: 1, binding: bindingRefFixture(), identity: identityFixture() },
    { state: "DETACHING", generation: 1, binding: bindingRefFixture() },
    { state: "ERROR", generation: 1, error: { code: "DATABASE_BUSY" } },
  ])("accepts a valid $state view", (input) => {
    expect(WorkspaceViewStateSchema.safeParse(input).success).toBe(true);
  });

  it.each([
    { state: "READY", generation: 1, identity: identityFixture() },
    { state: "READY", generation: 1, binding: bindingRefFixture() },
    { state: "READY", generation: 1, binding: bindingRefFixture(), identity: identityFixture(PROJECT_B) },
    { state: "DETACHED", generation: 1, binding: bindingRefFixture() },
    { state: "LOADING", generation: 2, binding: bindingRefFixture() },
    { state: "ERROR", generation: 1 },
    { state: "ERROR", generation: 1, error: { code: "UNRECOGNIZED_ERROR" } },
    { state: "ERROR", generation: 1, error: { code: "INVALID_ROOT", token: "not-a-credential" } },
  ])("rejects an inconsistent lifecycle view %#", (input) => {
    expect(WorkspaceViewStateSchema.safeParse(input).success).toBe(false);
  });
});
