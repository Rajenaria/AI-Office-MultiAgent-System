import { SkillMetadataSchema } from "../../../src/contracts/index.js";
import { skillFixture } from "../../contracts/fixtures.js";
import { PROJECT_A, PROJECT_B, ready, snapshot } from "../fixtures.js";
import type { SkillViewContext } from "../../../src/web/skills/projection.js";
export { PROJECT_A, PROJECT_B };

export const globalSkill = () => SkillMetadataSchema.parse({ ...skillFixture(), skillId: "test:global" });
export const projectSkill = (projectId = PROJECT_A) => SkillMetadataSchema.parse({ ...skillFixture(),
  skillId: projectId === PROJECT_A ? "test:A_ONLY" : "test:B_ONLY", scope: "project", projectId });
export function view(projectId = PROJECT_A): SkillViewContext {
  return { workspace: ready(projectId), snapshot: snapshot(projectId), connection: "CONNECTED", sessionReady: true, busy: false, freshness: "fresh" };
}
