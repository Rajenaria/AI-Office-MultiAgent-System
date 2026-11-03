import { z } from "zod";
import {
  ContentHashSchema, PositiveVersionSchema, ProjectIdSchema,
  ProjectRelativePathSchema, ReferenceIdSchema, TimestampSchema,
} from "./primitives.js";

// Required source/status fields never promote a record by default.
// Even an APPROVED-shaped record is not evidence of an authorized approval;
// the future Shared Brain/policy service must verify provenance and authority.
export const KnowledgeVersionSchema = z.strictObject({
  projectId: ProjectIdSchema,
  knowledgeId: ReferenceIdSchema,
  version: PositiveVersionSchema,
  relativePath: ProjectRelativePathSchema,
  contentHash: ContentHashSchema,
  source: z.enum(["owner", "document", "agent", "fixture"]),
  status: z.enum([
    "UNVERIFIED", "CANDIDATE", "PM_REVIEWED", "APPROVED",
    "REJECTED", "POSTPONED", "SUPERSEDED",
  ]),
  createdAt: TimestampSchema,
}).readonly();
export type KnowledgeVersion = z.infer<typeof KnowledgeVersionSchema>;
