import { z } from "zod";
import {
  GenerationSchema,
  ProjectIdSchema,
  ReferenceIdSchema,
  TimestampSchema,
} from "./primitives.js";

// Identity is portable: neither a display name, a root path nor a DB location.
export const ProjectIdentitySchema = z.strictObject({
  schemaVersion: z.literal(1),
  projectId: ProjectIdSchema,
  createdAt: TimestampSchema,
}).readonly();
export type ProjectIdentity = z.infer<typeof ProjectIdentitySchema>;

const bindingReference = z.strictObject({
  bindingId: ReferenceIdSchema,
  projectId: ProjectIdSchema,
  generation: GenerationSchema,
});

// Backend-issued references only. Schema validity proves neither issuance nor
// authentication. The backend must resolve the opaque root reference itself.
export const WorkspaceBindingSchema = bindingReference.extend({
  canonicalRootRef: ReferenceIdSchema,
}).readonly();
export type WorkspaceBinding = z.infer<typeof WorkspaceBindingSchema>;

// UI-facing references carry no internal root or database path.
export const WorkspaceBindingRefSchema = bindingReference.readonly();
export type WorkspaceBindingRef = z.infer<typeof WorkspaceBindingRefSchema>;

// An operation's owner is explicit and independent of foreground selection.
// A valid scope can continue to refer to A while the UI displays B, subject to
// future authorization/background policy; these contracts do not enable it.
export const ProjectOperationScopeSchema = z.strictObject({
  projectId: ProjectIdSchema,
  binding: WorkspaceBindingRefSchema,
}).refine((scope) => scope.projectId === scope.binding.projectId, {
  path: ["binding", "projectId"],
  message: "Binding must belong to the operation's project",
}).readonly();
export type ProjectOperationScope = z.infer<typeof ProjectOperationScopeSchema>;

export const WorkspaceErrorCodeSchema = z.enum([
  "INVALID_ROOT", "ACCESS_DENIED", "IDENTITY_CONFLICT", "STATE_UNAVAILABLE",
  "SCOPE_MISMATCH", "STALE_BINDING", "UNSUPPORTED_SCHEMA",
  "DATABASE_UNAVAILABLE", "DATABASE_BUSY", "BACKEND_UNAVAILABLE",
]);
export const WorkspaceErrorSchema = z.strictObject({
  code: WorkspaceErrorCodeSchema,
}).readonly();
export type WorkspaceError = z.infer<typeof WorkspaceErrorSchema>;

export const WorkspaceViewStateSchema = z.discriminatedUnion("state", [
  z.strictObject({ state: z.literal("DETACHED"), generation: GenerationSchema }),
  z.strictObject({ state: z.literal("OPENING"), generation: GenerationSchema }),
  z.strictObject({
    state: z.literal("LOADING"), generation: GenerationSchema,
    binding: WorkspaceBindingRefSchema,
  }),
  z.strictObject({
    state: z.literal("READY"), generation: GenerationSchema,
    binding: WorkspaceBindingRefSchema, identity: ProjectIdentitySchema,
  }),
  z.strictObject({
    state: z.literal("DETACHING"), generation: GenerationSchema,
    binding: WorkspaceBindingRefSchema,
  }),
  z.strictObject({
    state: z.literal("ERROR"), generation: GenerationSchema,
    error: WorkspaceErrorSchema,
  }),
]).superRefine((view, ctx) => {
  if ("binding" in view && view.generation !== view.binding.generation) {
    ctx.addIssue({ code: "custom", path: ["binding", "generation"], message: "Generation mismatch" });
  }
  if (view.state === "READY" && view.identity.projectId !== view.binding.projectId) {
    ctx.addIssue({ code: "custom", path: ["identity", "projectId"], message: "Project mismatch" });
  }
}).readonly();
export type WorkspaceViewState = z.infer<typeof WorkspaceViewStateSchema>;
