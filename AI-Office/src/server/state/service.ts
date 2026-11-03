import { createHash } from "node:crypto";
import { z } from "zod";
import { ProjectSnapshotSchema, WorkspaceBindingRefSchema, ReferenceIdSchema, PositiveVersionSchema,
  type ProjectIdentity, type WorkspaceBinding, type ProjectSnapshot } from "../../contracts/index.js";
import { DemoSeedSchema } from "../../demo/fixture.js";
import { readKnowledge } from "../brain/reader.js";
import { readIdentity } from "../workspace/identity.js";
import { checkedDescendant, isWithin, revalidateRoot, validateRoot, type Root } from "../workspace/paths.js";
import { ProjectRegistry } from "../workspace/registry.js";
import { WorkspaceFailure } from "../workspace/errors.js";
import { initializeDatabase, readRecords, transaction, useDatabase } from "./database.js";
import { StateStorage, type StateFault } from "./storage.js";

export type ProjectContext = Readonly<{ identity: ProjectIdentity; binding: WorkspaceBinding; root: Root }>;
export const KnowledgeRequestSchema = z.strictObject({ knowledgeId: ReferenceIdSchema, version: PositiveVersionSchema });

export class ProjectStateService {
  private readonly contexts = new WeakSet<ProjectContext>();
  private readonly storage: StateStorage;
  private constructor(private readonly registry: ProjectRegistry, private readonly fixtureRoot: Root, private readonly fault?: StateFault) {
    this.storage = new StateStorage(registry.root);
  }

  static async forFixtures(registry: ProjectRegistry, fixtureRoot: string, fault?: StateFault) {
    const root = await validateRoot(fixtureRoot);
    if (root.canonicalPath === registry.root.canonicalPath || !isWithin(root.canonicalPath, registry.root.canonicalPath)) {
      throw new WorkspaceFailure("ACCESS_DENIED", "FIXTURE_APP_DATA_BOUNDARY_REQUIRED", 403);
    }
    return new ProjectStateService(registry, root, fault);
  }

  // Called by WorkspaceManager only after backend binding issuance/validation.
  // The object identity is a capability; client-shaped copies are not accepted.
  async issueContext(attachment: ProjectContext): Promise<ProjectContext> {
    const context = Object.freeze({ ...attachment });
    await this.verifyAssociation(context);
    this.contexts.add(context);
    return context;
  }
  revoke(context: ProjectContext): void { this.contexts.delete(context); }

  async validateFixtureProject(root: Root): Promise<void> {
    await revalidateRoot(this.fixtureRoot); await revalidateRoot(root);
    if (!isWithin(this.fixtureRoot.canonicalPath, root.canonicalPath) || root.canonicalPath === this.fixtureRoot.canonicalPath ||
        isWithin(this.registry.root.canonicalPath, root.canonicalPath) || isWithin(root.canonicalPath, this.registry.root.canonicalPath)) {
      throw new WorkspaceFailure("ACCESS_DENIED", "DISPOSABLE_PROJECT_BOUNDARY_REQUIRED", 403);
    }
    const relative = root.canonicalPath.slice(this.fixtureRoot.canonicalPath.length + 1).replaceAll("\\", "/");
    await checkedDescendant(this.fixtureRoot, relative);
  }

  private async verifyAssociation(context: ProjectContext): Promise<void> {
    await this.registry.verify(); await this.validateFixtureProject(context.root);
    const entry = this.registry.byProject(context.identity.projectId);
    if (!entry || entry !== this.registry.byRoot(context.root) || entry.status !== "IDENTITY_ATTACHED" ||
        context.binding.projectId !== context.identity.projectId ||
        JSON.stringify(entry.identity) !== JSON.stringify(context.identity) ||
        JSON.stringify(await readIdentity(context.root)) !== JSON.stringify(context.identity)) {
      throw new WorkspaceFailure("IDENTITY_CONFLICT", "STATE_CONTEXT_IDENTITY_MISMATCH");
    }
  }
  private async check(context: ProjectContext): Promise<void> {
    if (!this.contexts.has(context)) throw new WorkspaceFailure("STALE_BINDING", "STATE_CONTEXT_NOT_ISSUED_OR_REVOKED");
    await this.verifyAssociation(context);
    if (!this.contexts.has(context)) throw new WorkspaceFailure("STALE_BINDING", "STATE_CONTEXT_REVOKED");
  }

  async load(context: ProjectContext): Promise<ProjectSnapshot | null> {
    await this.check(context);
    if (await this.storage.status(context.identity.projectId) === "NEVER_INITIALIZED") return null;
    const filename = await this.storage.databasePath(context.identity.projectId);
    return useDatabase(filename, true, (db) => {
      const records = readRecords(db, context.identity);
      return ProjectSnapshotSchema.parse({ schemaVersion: 1, projectId: context.identity.projectId,
        binding: WorkspaceBindingRefSchema.parse({ bindingId: context.binding.bindingId, projectId: context.binding.projectId, generation: context.binding.generation }),
        snapshotVersion: records.header.snapshotVersion, tasks: records.tasks, events: records.events, knowledge: records.knowledge,
        observedAt: new Date().toISOString(), source: "demo", freshness: { status: "fresh", lastEventAt: records.events.at(-1)?.occurredAt ?? null } });
    });
  }

  async initialize(context: ProjectContext): Promise<ProjectSnapshot> {
    const existing = await this.load(context);
    if (existing) return existing; // Idempotent; never reset an existing DB.
    const filename = await this.storage.begin(context.identity.projectId);
    this.fault?.("afterStateIntent");
    initializeDatabase(filename, context.identity);
    this.fault?.("afterStateSchema");
    // Check schema/header/records before committing the initialization ledger.
    useDatabase(filename, true, (db) => readRecords(db, context.identity));
    await this.storage.complete(context.identity.projectId);
    return (await this.load(context))!;
  }

  async snapshot(context: ProjectContext): Promise<ProjectSnapshot> {
    const result = await this.load(context);
    if (!result) throw new WorkspaceFailure("STATE_UNAVAILABLE", "STATE_INITIALIZATION_REQUIRED");
    return result;
  }

  async knowledge(context: ProjectContext, input: unknown) {
    const request = KnowledgeRequestSchema.parse(input);
    const snapshot = await this.snapshot(context);
    const record = snapshot.knowledge.find((item) => item.knowledgeId === request.knowledgeId && item.version === request.version);
    if (!record) throw new WorkspaceFailure("STATE_UNAVAILABLE", "KNOWLEDGE_VERSION_NOT_FOUND", 404);
    const result = await readKnowledge(context.root, record);
    await this.check(context);
    return result;
  }

  async seedDemo(context: ProjectContext, input: unknown): Promise<ProjectSnapshot> {
    const seed = DemoSeedSchema.parse(input);
    await this.snapshot(context);
    // Reuse composition validation to enforce project/task/agent relationships.
    ProjectSnapshotSchema.parse({ schemaVersion: 1, projectId: context.identity.projectId,
      binding: { bindingId: context.binding.bindingId, projectId: context.binding.projectId, generation: context.binding.generation },
      snapshotVersion: 1, tasks: [seed.task], events: [seed.event], knowledge: [seed.knowledge],
      observedAt: new Date().toISOString(), source: "demo", freshness: { status: "unknown", lastEventAt: null } });
    const knowledge = await readKnowledge(context.root, seed.knowledge);
    if (knowledge.integrity !== "VERIFIED") throw new WorkspaceFailure("STATE_UNAVAILABLE", "DEMO_KNOWLEDGE_HASH_MISMATCH");
    await this.check(context);
    const filename = await this.storage.databasePath(context.identity.projectId);
    const fingerprint = createHash("sha256").update(JSON.stringify(seed)).digest("hex");
    useDatabase(filename, false, (db) => transaction(db, () => {
      const records = readRecords(db, context.identity);
      if (records.header.seedHash !== null) {
        if (records.header.seedHash !== fingerprint || records.knowledge.length !== 1 || records.tasks.length !== 1 || records.events.length !== 1 ||
            JSON.stringify({ knowledge: records.knowledge[0], task: records.tasks[0], event: records.events[0] }) !== JSON.stringify(seed)) {
          throw new WorkspaceFailure("STATE_UNAVAILABLE", "DEMO_SEED_CONFLICT");
        }
        return;
      }
      if (records.knowledge.length || records.tasks.length || records.events.length) throw new WorkspaceFailure("STATE_UNAVAILABLE", "DEMO_REQUIRES_EMPTY_STATE");
      const k = seed.knowledge, t = seed.task, e = seed.event;
      db.prepare("INSERT INTO knowledge VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(k.projectId, k.knowledgeId, k.version, k.relativePath, k.contentHash, k.source, k.status, k.createdAt);
      db.prepare("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(t.projectId, t.taskId, t.demoAgentId, t.title, t.state, t.version, t.updatedAt, t.source);
      this.fault?.("afterDemoTask");
      db.prepare("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(e.projectId, e.eventId, e.taskId, e.agentId, e.sequence, e.type, e.occurredAt, e.payloadVersion, e.source);
      db.prepare("UPDATE project_header SET seedHash=?, snapshotVersion=snapshotVersion+1 WHERE projectId=?").run(fingerprint, context.identity.projectId);
    }));
    return this.snapshot(context);
  }
  // Every operation closes its own short-lived handle in finally. No ambient
  // current database, open handles at detach, worker sessions or background IO.
}
