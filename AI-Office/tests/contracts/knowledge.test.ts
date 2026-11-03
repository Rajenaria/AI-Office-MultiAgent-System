import { describe, expect, it } from "vitest";
import { KnowledgeVersionSchema } from "../../src/contracts/index.js";
import { knowledgeFixture } from "./fixtures.js";

describe("versioned project knowledge reference", () => {
  it("preserves explicit fixture/candidate provenance without promotion", () => {
    const parsed = KnowledgeVersionSchema.parse(knowledgeFixture());
    expect(parsed.source).toBe("fixture");
    expect(parsed.status).toBe("CANDIDATE");
    expect(Object.isFrozen(parsed)).toBe(true);
  });

  it.each([
    "../other-project.md", "brain/../secret.md", "/absolute.md", "C:/absolute.md",
    "C:drive-relative.md", "\\\\server\\share\\doc.md", "brain\\doc.md",
    "brain//doc.md", "brain/./doc.md", "brain/%2e%2e/secret.md", "brain/file.md:stream",
    "brain/NUL.txt", "brain/doc.md.", "brain/doc.md ", "brain/secret\u0000.md",
  ])("rejects unsafe portable path %j", (relativePath) => {
    expect(KnowledgeVersionSchema.safeParse({ ...knowledgeFixture(), relativePath }).success).toBe(false);
  });

  it("accepts a Unicode project-relative filename without altering it", () => {
    const relativePath = ".ai-office/brain/Catatan proyek 日本語.md";
    expect(KnowledgeVersionSchema.parse({ ...knowledgeFixture(), relativePath }).relativePath).toBe(relativePath);
  });

  it.each([
    { ...knowledgeFixture(), projectId: undefined },
    { ...knowledgeFixture(), version: 0 },
    { ...knowledgeFixture(), version: 1.25 },
    { ...knowledgeFixture(), version: "1" },
    { ...knowledgeFixture(), contentHash: "not-a-hash" },
    { ...knowledgeFixture(), contentHash: "g".repeat(64) },
    { ...knowledgeFixture(), source: "automatic-truth" },
    { ...knowledgeFixture(), status: undefined },
    { ...knowledgeFixture(), status: "AUTO_APPROVED" },
  ])("rejects invalid scope/version/provenance %#", (input) => {
    expect(KnowledgeVersionSchema.safeParse(input).success).toBe(false);
  });
});
