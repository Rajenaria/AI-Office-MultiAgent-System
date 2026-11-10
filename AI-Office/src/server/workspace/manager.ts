import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  GenerationSchema, ProjectIdentitySchema, ProjectOperationScopeSchema,
  WorkspaceBindingRefSchema, WorkspaceBindingSchema, WorkspaceViewStateSchema,
  type ProjectIdentity, type WorkspaceBinding, type WorkspaceViewState,
} from "../../contracts/index.js";
import { createIdentity, readIdentity } from "./identity.js";
import { isWithin, revalidateRoot, validateRoot, type Root } from "./paths.js";
import { ProjectRegistry, type FaultHook, type RegistryEntry } from "./registry.js";
import { safeFailure, WorkspaceFailure } from "./errors.js";
import { ProjectStateService, type ProjectContext } from "../state/service.js";

export const OpenRequestSchema = z.strictObject({ path: z.string().min(1).max(240), expectedGeneration: GenerationSchema });
export const InitializeRequestSchema = OpenRequestSchema.extend({ consent: z.literal(true), consentToken: z.string().length(64) });
export const DetachRequestSchema = z.strictObject({ expectedGeneration: GenerationSchema, scope: ProjectOperationScopeSchema.nullable() });
type Consent = Readonly<{
  kind: "INITIALIZATION_REQUIRED" | "REGISTRATION_REQUIRED" | "RECOVERY_REQUIRED";
  consentToken: string; canonicalPath: string; expiresAt: string;
}>;
type Attachment = Readonly<{ binding: WorkspaceBinding; identity: ProjectIdentity; root: Root }>;
export type WorkspaceRepositoryLifecycle = Readonly<{ invalidate(): void; close(): Promise<void> }>;

export class WorkspaceManager {
  private view: WorkspaceViewState = WorkspaceViewStateSchema.parse({ state: "DETACHED", generation: 0 });
  private foreground: Attachment | null = null;
  private issued = new Map<string, Attachment>();
  private pending: { consent: Consent; root: Root; identity: ProjectIdentity | null } | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private closed = false;
  private closePromise: Promise<void> | undefined;
  private readonly stateContexts = new Map<string, ProjectContext>();
  private stateInitializationRequired = false;

  constructor(private readonly registry: ProjectRegistry, private readonly fault?: FaultHook,
    private readonly stateService?: ProjectStateService, private readonly repositories?: WorkspaceRepositoryLifecycle) {}

  get stateServiceStatus() { return this.stateService ? "AVAILABLE_FIXTURE_ONLY" as const : "NOT_IMPLEMENTED" as const; }

  private serial<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new WorkspaceFailure("BACKEND_UNAVAILABLE", "BACKEND_CLOSING", 503));
    const result = this.queue.then(operation);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private snapshot() {
    return Object.freeze({ view: this.view, identity: this.foreground?.identity ?? null,
      nextAction: this.pending?.consent ?? null, stateService: this.stateServiceStatus,
      ...(this.stateService ? { stateInitializationRequired: this.stateInitializationRequired } : {}) });
  }

  private setView(value: unknown): void { this.view = WorkspaceViewStateSchema.parse(value); }
  private expectGeneration(generation: number): void {
    if (generation !== this.view.generation) throw new WorkspaceFailure("STALE_BINDING", "STALE_FOREGROUND_GENERATION");
  }
  private invalidate(): void {
    this.repositories?.invalidate();
    for (const context of this.stateContexts.values()) this.stateService?.revoke(context);
    this.stateContexts.clear(); this.stateInitializationRequired = false;
    this.issued.clear(); this.foreground = null; this.pending = null;
  }
  private fail(error: unknown): never {
    const failure = safeFailure(error);
    this.invalidate();
    this.setView({ state: "ERROR", generation: this.view.generation, error: { code: failure.code } });
    throw failure;
  }
  private async checkLocation(root: Root): Promise<void> {
    if (isWithin(root.canonicalPath, this.registry.root.canonicalPath) || isWithin(this.registry.root.canonicalPath, root.canonicalPath)) {
      throw new WorkspaceFailure("ACCESS_DENIED", "PROJECT_REGISTRY_OVERLAP", 403);
    }
    // Fixture mode must reject other roots before offering marker initialization.
    await this.stateService?.validateFixtureProject(root);
  }

  private consistent(root: Root, identity: ProjectIdentity | null): RegistryEntry | undefined {
    const entry = this.registry.byRoot(root);
    if (entry && identity && JSON.stringify(entry.identity) !== JSON.stringify(identity)) {
      throw new WorkspaceFailure("IDENTITY_CONFLICT", "MARKER_REGISTRY_MISMATCH");
    }
    if (entry && !identity) {
      throw new WorkspaceFailure("STATE_UNAVAILABLE", entry.status === "PREPARING" ?
        "PARTIAL_INITIALIZATION_REVIEW_REQUIRED" : "REGISTERED_MARKER_MISSING");
    }
    if (identity) {
      const owner = this.registry.byProject(identity.projectId);
      if (owner && owner !== entry) throw new WorkspaceFailure("IDENTITY_CONFLICT", "DUPLICATE_ID_OR_RELINK_REQUIRED");
    }
    return entry;
  }

  private async attach(root: Root, identity: ProjectIdentity): Promise<void> {
    await revalidateRoot(root);
    const entry = this.consistent(root, await readIdentity(root));
    if (!entry || entry.identity.projectId !== identity.projectId) throw new WorkspaceFailure("IDENTITY_CONFLICT", "UNREGISTERED_IDENTITY");
    await this.registry.put({ ...entry, status: "IDENTITY_ATTACHED" }, true);
    const binding = WorkspaceBindingSchema.parse({ bindingId: randomUUID(), canonicalRootRef: randomUUID(),
      projectId: identity.projectId, generation: this.view.generation });
    const attachment = Object.freeze({ binding, identity, root });
    this.issued.set(binding.bindingId, attachment);
    this.foreground = attachment;
    // Identity is attached; M01-04 must load state before full READY.
    this.setView({ state: "LOADING", generation: binding.generation,
      binding: WorkspaceBindingRefSchema.parse({ bindingId: binding.bindingId, projectId: binding.projectId, generation: binding.generation }) });
    if (this.stateService) {
      this.stateContexts.set(binding.bindingId, await this.stateService.issueContext(attachment));
      await this.refreshState(attachment);
    }
  }

  private stateContext(attachment: Attachment) {
    const context = this.stateContexts.get(attachment.binding.bindingId);
    if (!this.stateService || !context) throw new WorkspaceFailure("STATE_UNAVAILABLE", "FIXTURE_STATE_SERVICE_NOT_ENABLED", 503);
    return { service: this.stateService, context };
  }

  private async refreshState(attachment: Attachment) {
    const { service, context } = this.stateContext(attachment);
    const snapshot = await service.load(context);
    this.stateInitializationRequired = snapshot === null;
    if (snapshot) this.setView({ state: "READY", generation: attachment.binding.generation,
      binding: snapshot.binding, identity: attachment.identity });
    return snapshot;
  }

  initializeState(input: unknown) {
    const request = z.strictObject({ scope: ProjectOperationScopeSchema, consent: z.literal(true) }).parse(input);
    return this.serial(async () => {
      const attachment = this.authorize(request.scope);
      const { service, context } = this.stateContext(attachment);
      try {
        await service.initialize(context); await this.refreshState(attachment);
        return this.snapshot();
      } catch (error) { return this.fail(error); }
    });
  }

  projectSnapshot(input: unknown) {
    return this.serial(async () => {
      const attachment = this.authorize(input);
      try {
        const snapshot = await this.refreshState(attachment);
        if (!snapshot) throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INITIALIZATION_REQUIRED");
        return { identity: attachment.identity, snapshot, knowledgeContentVerification: "NOT_PERFORMED" as const };
      } catch (error) { return this.fail(error); }
    });
  }

  knowledge(input: unknown) {
    const request = z.strictObject({ scope: ProjectOperationScopeSchema, knowledgeId: z.string(), version: z.number() }).parse(input);
    return this.serial(async () => {
      const attachment = this.authorize(request.scope);
      const { service, context } = this.stateContext(attachment);
      try { await this.refreshState(attachment); } catch (error) { return this.fail(error); }
      return service.knowledge(context, { knowledgeId: request.knowledgeId, version: request.version });
    });
  }

  seedDemo(input: unknown) {
    const request = z.strictObject({ scope: ProjectOperationScopeSchema, fixture: z.unknown() }).parse(input);
    return this.serial(async () => {
      const attachment = this.authorize(request.scope);
      const { service, context } = this.stateContext(attachment);
      try { await this.refreshState(attachment); } catch (error) { return this.fail(error); }
      return service.seedDemo(context, request.fixture);
    });
  }

  async open(input: unknown) {
    const request = OpenRequestSchema.parse(input);
    return this.serial(async () => {
      this.expectGeneration(request.expectedGeneration);
      this.invalidate();
      this.setView({ state: "OPENING", generation: this.view.generation + 1 });
      try {
        await this.registry.verify();
        const root = await validateRoot(request.path);
        await this.checkLocation(root);
        const identity = await readIdentity(root);
        const entry = this.consistent(root, identity);
        if (identity && entry?.status === "IDENTITY_ATTACHED") await this.attach(root, identity);
        else {
          const kind = entry ? "RECOVERY_REQUIRED" : identity ? "REGISTRATION_REQUIRED" : "INITIALIZATION_REQUIRED";
          const consent = Object.freeze({ kind, canonicalPath: root.canonicalPath,
            consentToken: randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() + 300_000).toISOString() });
          this.pending = { root, identity, consent };
          this.setView({ state: "ERROR", generation: this.view.generation, error: { code: "STATE_UNAVAILABLE" } });
        }
        return this.snapshot();
      } catch (error) { return this.fail(error); }
    });
  }

  async initialize(input: unknown) {
    const request = InitializeRequestSchema.parse(input);
    return this.serial(async () => {
      this.expectGeneration(request.expectedGeneration);
      const pending = this.pending;
      if (!pending || pending.consent.consentToken !== request.consentToken ||
          request.path !== pending.consent.canonicalPath || Date.parse(pending.consent.expiresAt) < Date.now()) {
        throw new WorkspaceFailure("ACCESS_DENIED", "EXACT_FOLDER_CONSENT_REQUIRED", 403);
      }
      this.pending = null; // One use, including failure. Re-open to inspect/reconfirm.
      this.setView({ state: "OPENING", generation: this.view.generation + 1 });
      try {
        await this.registry.verify(); await revalidateRoot(pending.root);
        const observed = await readIdentity(pending.root);
        if (JSON.stringify(observed) !== JSON.stringify(pending.identity)) {
          throw new WorkspaceFailure("IDENTITY_CONFLICT", "MARKER_CHANGED_AFTER_CONSENT");
        }
        const existing = this.consistent(pending.root, observed);
        const identity = observed ?? ProjectIdentitySchema.parse({ schemaVersion: 1, projectId: randomUUID(), createdAt: new Date().toISOString() });
        if (!existing) {
          await this.registry.put({ identity, canonicalPath: pending.root.canonicalPath, fileKey: pending.root.fileKey, status: "PREPARING" });
          await this.fault?.("afterPreparing");
        }
        if (!observed) await createIdentity(pending.root, identity);
        await this.fault?.("afterMarker");
        await this.attach(pending.root, identity);
        return this.snapshot();
      } catch (error) { return this.fail(error); }
    });
  }

  // Authorization is scoped to the explicitly issued binding. Foreground is only
  // a revocation policy for this UI lease; it never supplies project ownership.
  // Future workers require separate leases and explicit background authorization.
  private authorize(input: unknown): Attachment {
    const scope = ProjectOperationScopeSchema.parse(input);
    const attachment = this.issued.get(scope.binding.bindingId);
    if (!attachment || attachment.binding.generation !== scope.binding.generation) {
      throw new WorkspaceFailure("STALE_BINDING", "BINDING_REVOKED_OR_UNKNOWN");
    }
    if (scope.projectId !== attachment.identity.projectId || scope.binding.projectId !== attachment.binding.projectId) {
      throw new WorkspaceFailure("SCOPE_MISMATCH", "BINDING_PROJECT_MISMATCH", 403);
    }
    return attachment;
  }

  inspect(input: unknown) {
    return this.serial(async () => {
      const attachment = this.authorize(input);
      try {
        await this.registry.verify(); await revalidateRoot(attachment.root);
        this.consistent(attachment.root, await readIdentity(attachment.root));
        return Object.freeze({ identity: attachment.identity, binding: WorkspaceBindingRefSchema.parse({
          bindingId: attachment.binding.bindingId, projectId: attachment.binding.projectId,
          generation: attachment.binding.generation,
        }) });
      } catch (error) { return this.fail(error); }
    });
  }

  current() {
    return this.serial(async () => {
      try {
        await this.registry.verify();
        if (this.foreground) {
          await revalidateRoot(this.foreground.root);
          this.consistent(this.foreground.root, await readIdentity(this.foreground.root));
          if (this.stateService) await this.refreshState(this.foreground);
        }
      } catch (error) { this.fail(error); }
      return this.snapshot();
    });
  }

  async detach(input: unknown) {
    const request = DetachRequestSchema.parse(input);
    return this.serial(async () => {
      this.expectGeneration(request.expectedGeneration);
      if (this.foreground) {
        const attachment = this.authorize(request.scope);
        this.setView({ state: "DETACHING", generation: this.view.generation,
          binding: { bindingId: attachment.binding.bindingId, projectId: attachment.binding.projectId, generation: attachment.binding.generation } });
      } else if (request.scope !== null) throw new WorkspaceFailure("STALE_BINDING", "NO_FOREGROUND_BINDING");
      this.invalidate();
      this.setView({ state: "DETACHED", generation: this.view.generation + 1 });
      return this.snapshot();
    });
  }

  close(): Promise<void> {
    if (this.closePromise) return this.closePromise;
    this.closed = true;
    this.closePromise = (async () => {
      await this.queue;
      this.invalidate();
      // Retain registry ownership if resource disposal fails; a later explicit close can retry.
      await this.repositories?.close();
      await this.registry.close();
    })().catch(error => { this.closePromise = undefined; throw error; });
    return this.closePromise;
  }
}
