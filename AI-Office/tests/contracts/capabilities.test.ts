import { describe, expect, it } from "vitest";
import { AssetPackageRefSchema, SkillMetadataSchema } from "../../src/contracts/index.js";
import { PROJECT_A, skillFixture } from "./fixtures.js";

describe("skill metadata without runtime discovery or permission inference", () => {
  it("accepts global metadata without a project or verified runtime claims", () => {
    const parsed = SkillMetadataSchema.parse(skillFixture());
    expect(parsed.scope).toBe("global");
    expect("projectId" in parsed).toBe(false);
    expect(parsed.enforcementVerification).toBe("NOT_VERIFIED");
  });

  it("requires explicit project identity for project scope", () => {
    expect(SkillMetadataSchema.safeParse({ ...skillFixture(), scope: "project", projectId: PROJECT_A }).success).toBe(true);
    expect(SkillMetadataSchema.safeParse({ ...skillFixture(), scope: "project" }).success).toBe(false);
    expect(SkillMetadataSchema.safeParse({ ...skillFixture(), scope: "project", projectId: "folder" }).success).toBe(false);
  });

  it("rejects a global skill silently carrying project ownership", () => {
    expect(SkillMetadataSchema.safeParse({ ...skillFixture(), projectId: PROJECT_A }).success).toBe(false);
  });

  it("does not infer session availability from assignment", () => {
    const parsed = SkillMetadataSchema.parse({ ...skillFixture(), proposedAgentRole: "frontend" });
    expect(parsed.proposedAgentRole).toBe("frontend");
    expect(parsed.sessionAvailability).toBe("UNKNOWN");
    expect(parsed.sessionVerification).toBe("NOT_VERIFIED");
  });

  it("does not infer enforcement from allowed policy", () => {
    const parsed = SkillMetadataSchema.parse({ ...skillFixture(), allowedByPolicy: "ALLOWED" });
    expect(parsed.allowedByPolicy).toBe("ALLOWED");
    expect(parsed.enforcementVerification).toBe("NOT_VERIFIED");
  });

  it("does not infer compatibility/discovery from installation", () => {
    const parsed = SkillMetadataSchema.parse({ ...skillFixture(), installationStatus: "INSTALLED" });
    expect(parsed.discoveryStatus).toBe("NOT_VERIFIED");
    expect(parsed.compatibilityStatus).toBe("UNKNOWN");
  });

  it.each([
    { ...skillFixture(), runtime: { runtimeId: "" } },
    { ...skillFixture(), installationStatus: "ASSIGNED" },
    { ...skillFixture(), sessionAvailability: "AVAILABLE" },
    { ...skillFixture(), sessionVerification: "VERIFIED" },
    { ...skillFixture(), enforcementVerification: "VERIFIED" },
    { ...skillFixture(), executeScript: "unreviewed-script" },
  ])("rejects unsupported foundation skill claims %#", (input) => {
    expect(SkillMetadataSchema.safeParse(input).success).toBe(false);
  });
});

describe("optional unverified Owner Visual Lab package references", () => {
  const reference = {
    assetId: "asset:pm-room", assetVersion: "prototype-1", assetKind: "room",
    manifestRef: "manifest:pending", sourceArchiveRef: "archive:pending",
    provenance: "owner_visual_lab", validationStatus: "UNVERIFIED",
  };

  it("permits absent assets so contracts do not depend on a final GLB", () => {
    expect(AssetPackageRefSchema.parse(undefined)).toBeUndefined();
    expect(AssetPackageRefSchema.parse(null)).toBeNull();
    expect(AssetPackageRefSchema.safeParse(reference).success).toBe(true);
  });

  it.each([
    { ...reference, validationStatus: "APPROVED" },
    { ...reference, assetKind: "replacement-office" },
    { ...reference, controllerScript: "unreviewed-script" },
    { ...reference, filePath: "C:/arbitrary/asset.glb" },
  ])("rejects verification, execution or filesystem authority claims %#", (input) => {
    expect(AssetPackageRefSchema.safeParse(input).success).toBe(false);
  });
});
