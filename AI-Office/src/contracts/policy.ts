import { z } from "zod";

// M01 constants, not caller-toggleable production configuration. Contract
// validation does not replace backend permissions or runtime billing gates.
export const FoundationPolicySchema = z.strictObject({
  workersEnabled: z.literal(false),
  paidApiEnabled: z.literal(false),
  providerConnectionsEnabled: z.literal(false),
  skillExecutionEnabled: z.literal(false),
  executionMode: z.literal("demo"),
  quotaStatus: z.literal("UNKNOWN"),
}).readonly();
export type FoundationPolicy = z.infer<typeof FoundationPolicySchema>;

export const FOUNDATION_POLICY: FoundationPolicy = FoundationPolicySchema.parse({
  workersEnabled: false,
  paidApiEnabled: false,
  providerConnectionsEnabled: false,
  skillExecutionEnabled: false,
  executionMode: "demo",
  quotaStatus: "UNKNOWN",
});

// Future implementation gate: before storing valuable work, independently
// verify a minimal safe snapshot/backup path or remain on disposable fixtures.
// Full export/import/backup/restore is M05. Private storage does not make a
// folder-only copy a complete backup, nor does it establish worker isolation.
