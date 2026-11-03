import { createHash, randomUUID } from "node:crypto";
import { open, readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { checkedDescendant, readSmallFile, revalidateRoot, validateRoot, type Root } from "../workspace/paths.js";
import { hasCode } from "../workspace/errors.js";
import { AttemptDescriptorSchema, fixtureBoundary, requireSecurity, type AttemptContext } from "./context.js";

export const PhaseSchema = z.enum(["CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED", "APPROVAL_DENIED", "LAUNCHING",
  "RUNNING", "CANCELLATION_REQUESTED", "COMPLETED", "FAILED", "INTERRUPTED", "UNCERTAIN", "RECONCILIATION_REQUIRED"]);
export type Phase = z.infer<typeof PhaseSchema>;
const ProcessSchema = z.strictObject({ pid: z.int().positive(), nonce: z.uuid(), startedAt: z.iso.datetime() });
const OutcomeSchema = z.strictObject({ code: z.int().nullable(), signal: z.string().max(40).nullable(),
  reason: z.enum(["NORMAL", "CANCELLED", "FORCED", "START_FAILED", "UNEXPECTED", "CONTROLLER_RECONCILED"]) });
export type ObservedProcess = z.infer<typeof ProcessSchema>;
export type ObservedOutcome = z.infer<typeof OutcomeSchema>;
const EventSchema = z.strictObject({ sequence: z.int().positive(), phase: PhaseSchema, at: z.iso.datetime() });
const RecordSchema = z.strictObject({ context: AttemptDescriptorSchema, idempotencyKey: z.uuid(), phase: PhaseSchema,
  version: z.int().positive(), history: z.array(EventSchema).min(1).max(128),
  lastProcess: ProcessSchema.nullable(), outcome: OutcomeSchema.nullable() });
export type AttemptRecord = z.infer<typeof RecordSchema>;
const StoreSchema = z.strictObject({ schemaVersion: z.literal(1), source: z.literal("synthetic-security-test"),
  version: z.int().nonnegative(), records: z.array(RecordSchema).max(64) });
type Store = z.infer<typeof StoreSchema>;
const terminal = new Set<Phase>(["COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"]);
const transitions: Record<Phase, readonly Phase[]> = {
  CREATED: ["APPROVAL_PENDING", "INTERRUPTED", "RECONCILIATION_REQUIRED"],
  APPROVAL_PENDING: ["APPROVAL_GRANTED", "APPROVAL_DENIED", "INTERRUPTED", "RECONCILIATION_REQUIRED"],
  APPROVAL_GRANTED: ["LAUNCHING", "FAILED", "INTERRUPTED", "RECONCILIATION_REQUIRED"],
  APPROVAL_DENIED: [], LAUNCHING: ["RUNNING", "FAILED", "CANCELLATION_REQUESTED", "UNCERTAIN"],
  RUNNING: ["COMPLETED", "FAILED", "CANCELLATION_REQUESTED", "UNCERTAIN"],
  CANCELLATION_REQUESTED: ["INTERRUPTED", "COMPLETED", "FAILED", "UNCERTAIN"],
  COMPLETED: [], FAILED: [], INTERRUPTED: [], UNCERTAIN: ["RECONCILIATION_REQUIRED"],
  RECONCILIATION_REQUIRED: ["FAILED", "INTERRUPTED"],
};
const digest = (raw: string) => createHash("sha256").update(raw).digest("hex");
export const isTerminal = (phase: Phase) => terminal.has(phase);

// Small JSON fixture journal; no production state, migration, retry or scheduler.
export class FixtureAttemptJournal {
  private data: Store = { schemaVersion: 1, source: "synthetic-security-test", version: 0, records: [] };
  private checksum: string | null = null;
  private readonly token = randomUUID();
  private queue: Promise<unknown> = Promise.resolve();
  private closed = false;
  private poisoned = false;
  private constructor(readonly root: Root, private readonly boundary: Root,
    private readonly fault?: () => void) {}

  static async open(fixtureRoot: string, fault?: () => void): Promise<FixtureAttemptJournal> {
    const boundary = await fixtureBoundary(fixtureRoot);
    const root = await validateRoot(await checkedDescendant(boundary, "journals"));
    const journal = new FixtureAttemptJournal(root, boundary, fault);
    const lock = await open(path.join(root.canonicalPath, "writer.lock"), "wx");
    try { await lock.writeFile(journal.token); await lock.sync(); } finally { await lock.close(); }
    try {
      await journal.checkFiles();
      const raw = await journal.optional("attempts.json"), seal = await journal.optional("initialized");
      requireSecurity((raw === null && seal === null) || (raw !== null && seal === "synthetic-security-test-v1\n"), "JOURNAL_MISSING_OR_PARTIAL");
      if (raw !== null) {
        journal.data = journal.validate(JSON.parse(raw)); journal.checksum = digest(raw);
        const next = structuredClone(journal.data);
        for (const record of next.records) if (!isTerminal(record.phase) && record.phase !== "RECONCILIATION_REQUIRED") {
          if (["LAUNCHING", "RUNNING", "CANCELLATION_REQUESTED"].includes(record.phase)) journal.append(next, record, "UNCERTAIN");
          journal.append(next, record, "RECONCILIATION_REQUIRED");
        }
        if (next.version !== journal.data.version) await journal.save(next);
      }
      return journal;
    } catch (error) { await journal.close(); throw error; }
  }

  private validate(input: unknown): Store {
    const data = StoreSchema.parse(input);
    requireSecurity(new Set(data.records.map((r) => r.context.attemptId)).size === data.records.length &&
      new Set(data.records.map((r) => r.idempotencyKey)).size === data.records.length, "JOURNAL_DUPLICATE_IDENTITIES");
    let versions = 0;
    for (const record of data.records) {
      requireSecurity(record.version === record.history.length && record.phase === record.history.at(-1)?.phase &&
        record.history[0]?.phase === "CREATED", "JOURNAL_HISTORY_INVALID");
      for (let i = 0; i < record.history.length; i++) {
        const event = record.history[i]!;
        requireSecurity(event.sequence === i + 1 && (i === 0 || transitions[record.history[i - 1]!.phase].includes(event.phase)), "JOURNAL_SEQUENCE_OR_TRANSITION_INVALID");
      }
      versions += record.version;
    }
    requireSecurity(versions === data.version, "JOURNAL_VERSION_INVALID"); return data;
  }
  private async optional(relative: string) {
    try { return await readSmallFile(await checkedDescendant(this.root, relative), 2 * 1024 * 1024); }
    catch (error) { if (hasCode(error, "ENOENT")) return null; throw error; }
  }
  private async checkFiles() {
    await revalidateRoot(this.boundary); await revalidateRoot(this.root);
    requireSecurity(!(await readdir(this.root.canonicalPath)).some((name) => name.endsWith(".tmp")), "JOURNAL_INTERRUPTED_REVIEW_REQUIRED");
    requireSecurity(await this.optional("writer.lock") === this.token, "JOURNAL_WRITER_OWNERSHIP_LOST");
  }
  private async verify() {
    requireSecurity(!this.closed && !this.poisoned, "JOURNAL_CLOSED_OR_POISONED");
    await this.checkFiles();
    const raw = await this.optional("attempts.json");
    requireSecurity((raw === null ? null : digest(raw)) === this.checksum, "JOURNAL_CHANGED_EXTERNALLY");
    requireSecurity(await this.optional("initialized") === (this.checksum === null ? null : "synthetic-security-test-v1\n"), "JOURNAL_SEAL_CHANGED_OR_MISSING");
  }
  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const task = this.queue.then(fn); this.queue = task.catch(() => undefined); return task;
  }
  private append(data: Store, record: AttemptRecord, phase: Phase) {
    requireSecurity(transitions[record.phase].includes(phase), "INVALID_ATTEMPT_TRANSITION");
    record.phase = phase; record.version++; data.version++;
    record.history.push({ sequence: record.version, phase, at: new Date().toISOString() });
  }
  private async save(input: Store) {
    await this.verify();
    const next = this.validate(input), raw = JSON.stringify(next);
    requireSecurity(Buffer.byteLength(raw) <= 2 * 1024 * 1024, "JOURNAL_CAPACITY_REACHED");
    try {
      if (await this.optional("initialized") === null) {
        const seal = await open(path.join(this.root.canonicalPath, "initialized"), "wx");
        try { await seal.writeFile("synthetic-security-test-v1\n"); await seal.sync(); } finally { await seal.close(); }
      }
      const temporary = path.join(this.root.canonicalPath, `${randomUUID()}.tmp`);
      const handle = await open(temporary, "wx");
      try { await handle.writeFile(raw); await handle.sync(); } finally { await handle.close(); }
      this.fault?.();
      // No unlink-then-rename fallback. A failed write leaves reviewable evidence.
      await rename(temporary, path.join(this.root.canonicalPath, "attempts.json"));
      this.data = next; this.checksum = digest(raw);
    } catch (error) { this.poisoned = true; throw error; }
  }
  async read(attemptId: string): Promise<AttemptRecord> {
    return this.serial(async () => { await this.verify(); const record = this.data.records.find((r) => r.context.attemptId === attemptId);
      requireSecurity(record, "ATTEMPT_NOT_REGISTERED"); return structuredClone(record); });
  }
  async create(context: AttemptContext, idempotencyKey: string) {
    return this.serial(async () => {
      await this.verify(); const descriptor = AttemptDescriptorSchema.parse(context); z.uuid().parse(idempotencyKey);
      requireSecurity(!this.data.records.some((r) => r.context.attemptId === context.attemptId || r.idempotencyKey === idempotencyKey), "DUPLICATE_ATTEMPT_OR_COMMAND");
      const next = structuredClone(this.data);
      next.records.push({ context: descriptor, idempotencyKey, phase: "CREATED", version: 1,
        history: [{ sequence: 1, phase: "CREATED", at: new Date().toISOString() }], lastProcess: null, outcome: null });
      next.version++; await this.save(next); return structuredClone(next.records.at(-1)!);
    });
  }
  async transition(attemptId: string, phase: Phase, process?: ObservedProcess, outcome?: ObservedOutcome) {
    return this.serial(async () => {
      await this.verify(); const next = structuredClone(this.data), record = next.records.find((r) => r.context.attemptId === attemptId);
      requireSecurity(record, "ATTEMPT_NOT_REGISTERED");
      this.append(next, record, phase);
      if (process) record.lastProcess = ProcessSchema.parse(process);
      if (outcome) record.outcome = OutcomeSchema.parse(outcome);
      await this.save(next); return structuredClone(record);
    });
  }
  async reconcile(attemptId: string, decision: "FAILED" | "INTERRUPTED") {
    const record = await this.read(attemptId);
    requireSecurity(record.phase === "RECONCILIATION_REQUIRED", "EXPLICIT_RECONCILIATION_REQUIRED");
    return this.transition(attemptId, decision, undefined, { code: null, signal: null, reason: "CONTROLLER_RECONCILED" });
  }
  async close() {
    await this.queue;
    if (this.closed) return; this.closed = true;
    await revalidateRoot(this.root);
    requireSecurity(await this.optional("writer.lock") === this.token, "JOURNAL_WRITER_OWNERSHIP_LOST");
    await unlink(path.join(this.root.canonicalPath, "writer.lock"));
  }
}
