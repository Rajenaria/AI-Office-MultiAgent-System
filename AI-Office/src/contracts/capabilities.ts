import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema, ShortTextSchema } from "./primitives.js";

const skillFields = {
  skillId: ReferenceIdSchema,
  runtime: z.strictObject({
    runtimeId: ReferenceIdSchema,
    version: ShortTextSchema.optional(),
  }).readonly(),
  proposedAgentRole: ReferenceIdSchema.optional(),
  installationStatus: z.enum(["UNKNOWN", "INSTALLED", "NOT_INSTALLED"]),
  discoveryStatus: z.enum(["NOT_VERIFIED", "DISCOVERED", "NOT_DISCOVERED"]),
  compatibilityStatus: z.enum(["UNKNOWN", "COMPATIBLE", "INCOMPATIBLE"]),
  // No actual session exists in M01. M02 must explicitly evolve these fields
  // with session evidence before an available/enforced claim is representable.
  sessionAvailability: z.literal("UNKNOWN"),
  sessionVerification: z.literal("NOT_VERIFIED"),
  allowedByPolicy: z.enum(["UNKNOWN", "ALLOWED", "DENIED"]),
  enforcementVerification: z.literal("NOT_VERIFIED"),
};

// Scope describes metadata ownership, not filesystem or execution permission.
// Installation/discovery/assignment/compatibility/permission stay independent.
export const SkillMetadataSchema = z.discriminatedUnion("scope", [
  z.strictObject({ ...skillFields, scope: z.literal("global") }),
  z.strictObject({ ...skillFields, scope: z.literal("project"), projectId: ProjectIdSchema }),
]).readonly();
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

// Owner Visual Lab is the visual source of truth. References are opaque IDs,
// not an executable manifest, approved schema, file permission or loader.
export const AssetPackageReferenceSchema = z.strictObject({
  assetId: ReferenceIdSchema,
  assetVersion: ShortTextSchema,
  assetKind: z.enum(["room", "character"]),
  manifestRef: ReferenceIdSchema.optional(),
  sourceArchiveRef: ReferenceIdSchema.optional(),
  provenance: z.enum(["owner_visual_lab", "unknown"]),
  validationStatus: z.literal("UNVERIFIED"),
}).readonly();
export const AssetPackageRefSchema = AssetPackageReferenceSchema.nullable().optional();
export type AssetPackageRef = z.infer<typeof AssetPackageRefSchema>;
