import { randomUUID } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { ProjectOperationScopeSchema, ProjectRelativePathSchema, ReferenceIdSchema } from "../../contracts/index.js";
import type { WorkspaceManager } from "../workspace/manager.js";
import type { ProjectRegistry } from "../workspace/registry.js";
import { readIdentity } from "../workspace/identity.js";
import { checkedDescendant, isWithin, revalidateRoot, validateRoot, type Root } from "../workspace/paths.js";

export class SecurityFailure extends Error {
  constructor(readonly code: string) { super(code); }
}
export function requireSecurity(condition: unknown, code: string): asserts condition {
  if (!condition) throw new SecurityFailure(code);
}
export const OperationSchema = z.enum(["READ", "WRITE", "CREATE", "DELETE", "PROBE"]);
export type Operation = z.infer<typeof OperationSchema>;
export const ProbeModeSchema = z.enum(["complete", "wait", "tree", "tree-ignore-cancel", "ignore-cancel", "fail", "output", "canary"]);
export type ProbeMode = z.infer<typeof ProbeModeSchema>;
export const AttemptDescriptorSchema = z.strictObject({
  projectId: z.uuid(), workspaceBindingId: ReferenceIdSchema, taskId: ReferenceIdSchema,
  attemptId: z.uuid(), attemptGeneration: z.int().positive(), policyRef: ReferenceIdSchema,
  projectRoot: z.string(), projectFileKey: z.string(), readScope: z.array(ProjectRelativePathSchema).readonly(),
  writeScope: z.array(ProjectRelativePathSchema).readonly(), operations: z.array(OperationSchema).readonly(),
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(), source: z.literal("synthetic-security-test"),
}).readonly();
export type AttemptContext = z.infer<typeof AttemptDescriptorSchema>;

// A deliberately fixture-only capability issuer, not a production worker lease.
export async function fixtureBoundary(input: string): Promise<Root> {
  const root = await validateRoot(input);
  const parent = await realpath(tmpdir());
  requireSecurity(path.dirname(root.canonicalPath) === parent &&
    path.basename(root.canonicalPath).startsWith("ai-office-m0202-") &&
    !path.basename(root.canonicalPath).startsWith("ai-office-m0202-rollback-"), "OWNED_TEMP_FIXTURE_REQUIRED");
  for (const folder of ["project-a", "project-b", "app-private", "dummy-credentials", "journals"]) {
    const filename = await checkedDescendant(root, folder);
    requireSecurity((await stat(filename)).isDirectory(), "FIXTURE_LAYOUT_REQUIRED");
  }
  return root;
}

const IssueSchema = z.strictObject({
  scope: ProjectOperationScopeSchema, taskId: ReferenceIdSchema, attemptId: z.uuid(),
  attemptGeneration: z.int().positive(), policyRef: ReferenceIdSchema,
  readScope: z.array(ProjectRelativePathSchema).min(1).max(8), writeScope: z.array(ProjectRelativePathSchema).min(1).max(8),
  operations: z.array(OperationSchema).min(1).max(5), lifetimeMs: z.int().min(1).max(60_000),
});

export class SyntheticContextAuthority {
  private readonly reservations = new Map<string, Readonly<{ request: z.infer<typeof IssueSchema>; createdAt: number }>>();
  private readonly issued = new Map<string, AttemptContext>();
  private readonly roots = new WeakMap<AttemptContext, Root>();
  private constructor(readonly boundary: Root, private readonly manager: WorkspaceManager,
    private readonly registry: ProjectRegistry, readonly now: () => number) {}

  static async forFixture(manager: WorkspaceManager, registry: ProjectRegistry, root: string, now = () => Date.now()) {
    const boundary = await fixtureBoundary(root);
    requireSecurity(registry.root.canonicalPath === await checkedDescendant(boundary, "app-private"), "FIXTURE_REGISTRY_REQUIRED");
    return new SyntheticContextAuthority(boundary, manager, registry, now);
  }

  async issue(input: unknown): Promise<AttemptContext> {
    const request = IssueSchema.parse(input);
    requireSecurity(!this.reservations.has(request.attemptId) && !this.issued.has(request.attemptId), "ATTEMPT_ID_ALREADY_ISSUED");
    const reservation = Object.freeze({ request, createdAt: this.now() });
    this.reservations.set(request.attemptId, reservation); // No await between check and reservation.
    try {
      await this.manager.inspect(request.scope); // Genuine binding proof, never caller UUID permission.
    } catch (error) {
      // This stage cannot have constructed/published a context. Only its exact
      // owner may release it, preserving correction of rejected binding input.
      if (this.reservations.get(request.attemptId) === reservation && !this.issued.has(request.attemptId)) {
        this.reservations.delete(request.attemptId);
      }
      throw error;
    }
    // After binding validation, failures retain a tombstone; never retry or transfer.
    await this.registry.verify();
    const entry = this.registry.byProject(request.scope.projectId);
    requireSecurity(entry?.status === "IDENTITY_ATTACHED", "REGISTERED_IDENTITY_REQUIRED");
    const root = await validateRoot(entry.canonicalPath);
    requireSecurity(["project-a", "project-b"].some((folder) =>
      path.join(this.boundary.canonicalPath, folder) === root.canonicalPath), "FIXTURE_PROJECT_REQUIRED");
    requireSecurity(root.fileKey === entry.fileKey, "PROJECT_ROOT_REPLACED");
    for (const relative of [...request.readScope, ...request.writeScope]) {
      requireSecurity(relative.split("/")[0] !== ".ai-office", "AUTHORITY_METADATA_EXCLUDED");
      requireSecurity((await stat(await checkedDescendant(root, relative))).isDirectory(), "DIRECTORY_SCOPE_REQUIRED");
    }
    // Scopes and identities are copied/frozen by Zod, never borrowed from UI state.
    const context = AttemptDescriptorSchema.parse({ projectId: entry.identity.projectId,
      workspaceBindingId: request.scope.binding.bindingId, taskId: request.taskId, attemptId: request.attemptId,
      attemptGeneration: request.attemptGeneration, policyRef: request.policyRef,
      projectRoot: root.canonicalPath, projectFileKey: root.fileKey,
      readScope: request.readScope, writeScope: request.writeScope, operations: request.operations,
      createdAt: new Date(reservation.createdAt).toISOString(), expiresAt: new Date(reservation.createdAt + request.lifetimeMs).toISOString(),
      source: "synthetic-security-test" });
    await this.validateAssociation(context, root);
    requireSecurity(this.reservations.get(request.attemptId) === reservation && !this.issued.has(request.attemptId), "RESERVATION_OWNERSHIP_LOST");
    requireSecurity(this.now() < Date.parse(context.expiresAt), "CONTEXT_EXPIRED");
    // Publication is synchronous and occurs only after all asynchronous checks.
    this.issued.set(context.attemptId, context); this.roots.set(context, root);
    return context;
  }

  async assert(context: AttemptContext): Promise<Root> {
    const root = this.roots.get(context);
    requireSecurity(root && this.issued.get(context.attemptId) === context, "CONTEXT_NOT_ISSUED_OR_REVOKED");
    await this.validateAssociation(context, root);
    requireSecurity(this.roots.get(context) === root && this.issued.get(context.attemptId) === context, "CONTEXT_NOT_ISSUED_OR_REVOKED");
    requireSecurity(this.now() < Date.parse(context.expiresAt), "CONTEXT_EXPIRED");
    return root;
  }

  private async validateAssociation(context: AttemptContext, root: Root): Promise<void> {
    requireSecurity(this.now() < Date.parse(context.expiresAt), "CONTEXT_EXPIRED");
    await revalidateRoot(this.boundary); await revalidateRoot(root); await this.registry.verify();
    const entry = this.registry.byProject(context.projectId);
    requireSecurity(entry && entry.canonicalPath === root.canonicalPath && entry.fileKey === root.fileKey &&
      JSON.stringify(await readIdentity(root)) === JSON.stringify(entry.identity), "PROJECT_ASSOCIATION_CHANGED");
  }

  revoke(context: AttemptContext) {
    // Retain the identity tombstone: the same attempt cannot be reissued.
    this.roots.delete(context);
  }
}

export const newAttemptId = () => randomUUID();
