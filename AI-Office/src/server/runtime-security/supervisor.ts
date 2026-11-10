import { fork, type ChildProcess } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { SyntheticApprovals, type ApprovalController, type ApprovalRequest } from "./approval.js";
import { requireSecurity, SecurityFailure, type AttemptContext, type SyntheticContextAuthority } from "./context.js";
import { FixtureAttemptJournal, isTerminal, type AttemptRecord, type ObservedOutcome } from "./journal.js";
import { HostPathPolicy, type SyntheticRequest } from "./policy.js";
import { createExecutionAdmissionBoundary, requireExecutionAdmission, type ExecutionAdmission } from "../attempt-control/execution-admission.js";
import { createOutputPublicationBoundary, denyOutputPublication, type OutputPublication, type PublicationDenial } from "../attempt-control/output-publication.js";

const probePath = fileURLToPath(new URL("../../../tests/integration/runtime-security/probes/dummy.mjs", import.meta.url));
const MessageSchema = z.strictObject({ type: z.enum(["ready", "completed", "cancelled", "descendant", "descendant-exited", "canary"]),
  nonce: z.uuid(), pid: z.int().positive(), canaryReadable: z.boolean().optional(), environmentKeys: z.array(z.string().max(100)).max(32).optional() });
export type ProbeMessage = z.infer<typeof MessageSchema>;
export type ProbeResult = Readonly<{ record: AttemptRecord; pid: number | null; stdout: string; stderr: string;
  publication: PublicationDenial;
  outputTruncated: boolean; forced: boolean; descendants: readonly number[]; descendantsStopped: boolean;
  messages: readonly ProbeMessage[] }>;
type Run = {
  context: AttemptContext; child: ChildProcess; nonce: string; pid: number | null;
  ready: boolean; closed: boolean; cancelled: boolean; cancellationAck: boolean; completed: boolean;
  forced: boolean; startupFailed: boolean; stdout: Buffer; stderr: Buffer; truncated: boolean;
  descendants: Set<number>; messages: ProbeMessage[]; timer?: ReturnType<typeof setTimeout>;
  done: Promise<ProbeResult>; resolve: (value: ProbeResult) => void; reject: (error: unknown) => void;
};
const OUTPUT_LIMIT = 4096;
function alive(pid: number) {
  try { process.kill(pid, 0); return true; }
  catch (error) { return !(typeof error === "object" && error !== null && "code" in error && error.code === "ESRCH"); }
}

// Not imported by the application. Only a fixed, test-owned Node probe can run.
export class SyntheticSecurityHarness {
  readonly policy: HostPathPolicy;
  readonly approvals: SyntheticApprovals;
  readonly controller: ApprovalController;
  private readonly contexts = new Map<string, AttemptContext>();
  private readonly runs = new Map<string, Run>();
  private readonly cancelled = new Set<string>();
  private queue: Promise<unknown> = Promise.resolve();
  private closing = false;
  private constructor(readonly authority: SyntheticContextAuthority, readonly journal: FixtureAttemptJournal,
    private readonly probeHash: string, private readonly beforeSpawn?: () => Promise<void>,
    private readonly admission: ExecutionAdmission = createExecutionAdmissionBoundary().api,
    private readonly publication: OutputPublication = createOutputPublicationBoundary().api) {
    this.policy = new HostPathPolicy(authority);
    const pair = SyntheticApprovals.create(authority); this.approvals = pair.approvals; this.controller = pair.controller;
  }
  static async create(authority: SyntheticContextAuthority, beforeSpawn?: () => Promise<void>, admission?: ExecutionAdmission, publication?: OutputPublication) {
    const hash = await SyntheticSecurityHarness.hashProbe();
    return new SyntheticSecurityHarness(authority, await FixtureAttemptJournal.open(authority.boundary.canonicalPath), hash, beforeSpawn, admission, publication);
  }
  private static async hashProbe() {
    const info = await lstat(probePath);
    requireSecurity(info.isFile() && !info.isSymbolicLink() && info.nlink === 1 && await realpath(probePath) === probePath, "TRUSTED_FIXED_PROBE_REQUIRED");
    return createHash("sha256").update(await readFile(probePath)).digest("hex");
  }
  private serial<T>(fn: () => Promise<T>) {
    const task = this.queue.then(fn); this.queue = task.catch(() => undefined); return task;
  }
  async register(context: AttemptContext, idempotencyKey: string) {
    await requireExecutionAdmission(this.admission, undefined, context);
    return this.serial(async () => {
      requireSecurity(!this.closing, "HARNESS_CLOSING"); await this.authority.assert(context);
      const record = await this.journal.create(context, idempotencyKey);
      this.contexts.set(context.attemptId, context); return record;
    });
  }
  private owns(context: AttemptContext) { requireSecurity(this.contexts.get(context.attemptId) === context, "REGISTERED_CONTEXT_REQUIRED"); }
  async requestApproval(context: AttemptContext, input: unknown, lifetimeMs?: number): Promise<ApprovalRequest> {
    await requireExecutionAdmission(this.admission, input, context);
    return this.serial(async () => {
      this.owns(context); requireSecurity(!this.closing && !this.cancelled.has(context.attemptId), "ATTEMPT_CANCELLED_OR_CLOSING");
      requireSecurity((await this.journal.read(context.attemptId)).phase === "CREATED", "ATTEMPT_NOT_FRESH");
      const operation = await this.policy.evaluate(context, input);
      const request = await this.approvals.request(context, operation, lifetimeMs);
      await this.journal.transition(context.attemptId, "APPROVAL_PENDING"); return request;
    });
  }
  async decide(context: AttemptContext, controller: ApprovalController, response: unknown) {
    await requireExecutionAdmission(this.admission, response, context);
    return this.serial(async () => {
      this.owns(context); requireSecurity(!this.closing && !this.cancelled.has(context.attemptId), "ATTEMPT_CANCELLED_OR_CLOSING");
      requireSecurity((await this.journal.read(context.attemptId)).phase === "APPROVAL_PENDING", "NO_PENDING_APPROVAL");
      const decision = await this.approvals.decide(context, controller, response);
      return this.journal.transition(context.attemptId, decision === "ALLOW" ? "APPROVAL_GRANTED" : "APPROVAL_DENIED");
    });
  }

  async dispatch(context: AttemptContext, input: unknown, requestId: string) {
    await requireExecutionAdmission(this.admission, input, context);
    return this.serial(async () => {
      this.owns(context); requireSecurity(!this.closing && !this.cancelled.has(context.attemptId), "ATTEMPT_CANCELLED_OR_CLOSING");
      requireSecurity(!this.runs.has(context.attemptId) && (await this.journal.read(context.attemptId)).phase === "APPROVAL_GRANTED", "DUPLICATE_OR_UNAPPROVED_DISPATCH");
      const operation = await this.policy.evaluate(context, input);
      requireSecurity(operation.request.operation === "PROBE", "FIXED_PROBE_OPERATION_REQUIRED");
      await this.approvals.consume(context, operation, requestId);
      await this.journal.transition(context.attemptId, "LAUNCHING"); // Durable intent before OS spawn.
      try {
        requireSecurity(await SyntheticSecurityHarness.hashProbe() === this.probeHash, "PROBE_CHANGED");
        await this.authority.assert(context);
        await this.policy.evaluate(context, operation.request); // Recheck scope/links after consent.
        await this.beforeSpawn?.(); // Explicit controlled fixture fault injection only.
        if (this.cancelled.has(context.attemptId)) {
          await this.journal.transition(context.attemptId, "CANCELLATION_REQUESTED");
          await this.journal.transition(context.attemptId, "INTERRUPTED", undefined, { code: null, signal: null, reason: "CANCELLED" });
          throw new SecurityFailure("CANCELLED_BEFORE_SPAWN");
        }
        const child = fork(probePath, [], { execPath: process.execPath, execArgv: [], cwd: operation.canonicalPath,
          windowsHide: true, silent: true, env: {
            SystemRoot: process.env.SystemRoot ?? "C:\\Windows", WINDIR: process.env.WINDIR ?? "C:\\Windows",
            TEMP: this.authority.boundary.canonicalPath, TMP: this.authority.boundary.canonicalPath,
            AI_OFFICE_SYNTHETIC_PROBE: "1",
          } });
        let resolve!: Run["resolve"], reject!: Run["reject"];
        const done = new Promise<ProbeResult>((yes, no) => { resolve = yes; reject = no; });
        void done.catch(() => undefined); // Callers still receive the original rejection.
        const run: Run = { context, child, nonce: randomUUID(), pid: child.pid ?? null, ready: false, closed: false,
          cancelled: this.cancelled.has(context.attemptId), cancellationAck: false, completed: false,
          forced: false, startupFailed: false, stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), truncated: false,
          descendants: new Set(), messages: [], done, resolve, reject };
        this.runs.set(context.attemptId, run);
        let readyResolve!: () => void;
        const started = new Promise<void>((yes) => { readyResolve = yes; });
        const startupTimer = setTimeout(() => { run.startupFailed = true; this.stopRun(run); readyResolve(); }, 2500);
        child.stdout?.on("data", (chunk: Buffer) => this.capture(run, "stdout", chunk));
        child.stderr?.on("data", (chunk: Buffer) => this.capture(run, "stderr", chunk));
        child.on("message", (input) => {
          const result = MessageSchema.safeParse(input);
          if (!result.success || result.data.nonce !== run.nonce) return;
          const message = result.data;
          if (message.type === "descendant") run.descendants.add(message.pid);
          if (message.pid !== run.pid && !["descendant", "descendant-exited"].includes(message.type)) return;
          if (run.messages.length < 32) run.messages.push(message);
          if (message.type === "ready") { run.ready = true; clearTimeout(startupTimer); readyResolve(); }
          if (message.type === "completed" && !run.cancelled) run.completed = true;
          if (message.type === "cancelled") run.cancellationAck = true;
        });
        child.once("spawn", () => { child.send({ type: "start", nonce: run.nonce, mode: operation.request.probeMode,
          fixtureRoot: this.authority.boundary.canonicalPath }, (error) => { if (error) { run.startupFailed = true; this.stopRun(run); } }); });
        child.once("error", () => { run.startupFailed = true; readyResolve(); });
        child.once("close", (code, signal) => {
          run.closed = true; clearTimeout(startupTimer); clearTimeout(run.timer); readyResolve();
          void this.serial(() => this.finish(run, code, signal)).catch(run.reject);
        });
        await started;
        if (run.ready) {
          await this.journal.transition(context.attemptId, "RUNNING", { pid: run.pid!, nonce: run.nonce, startedAt: new Date().toISOString() });
          if (run.cancelled || this.cancelled.has(context.attemptId)) {
            run.cancelled = true; await this.journal.transition(context.attemptId, "CANCELLATION_REQUESTED"); this.stopRun(run);
          }
        }
        return Object.freeze({ pid: run.pid, attemptId: context.attemptId, done });
      } catch (error) {
        const owned = this.runs.get(context.attemptId);
        if (owned && !owned.closed) this.stopRun(owned);
        const record = await this.journal.read(context.attemptId);
        if (record.phase === "LAUNCHING") await this.journal.transition(context.attemptId, "FAILED", undefined,
          { code: null, signal: null, reason: "START_FAILED" });
        throw error;
      }
    });
  }
  private capture(run: Run, channel: "stdout" | "stderr", bytes: Buffer) {
    const remaining = OUTPUT_LIMIT - run[channel].length;
    if (bytes.length > remaining) run.truncated = true;
    if (remaining > 0) run[channel] = Buffer.concat([run[channel], bytes.subarray(0, remaining)]);
  }
  private stopRun(run: Run) {
    if (run.closed || run.timer) return;
    if (run.child.connected) run.child.send({ type: "cancel", nonce: run.nonce }, () => undefined);
    run.timer = setTimeout(() => {
      if (!run.closed && run.child.exitCode === null && run.child.signalCode === null) {
        // Only this still-owned ChildProcess handle. Never journal PIDs or kill-by-name.
        run.forced = run.child.kill();
      }
    }, 250);
  }
  private async finish(run: Run, code: number | null, signal: NodeJS.Signals | null) {
    const deadline = Date.now() + 1200;
    while ([...run.descendants].some(alive) && Date.now() < deadline) await delay(20);
    const descendantsStopped = ![...run.descendants].some(alive);
    let record = await this.journal.read(run.context.attemptId);
    const outcome: ObservedOutcome = { code, signal, reason: run.startupFailed ? "START_FAILED" : run.completed && code === 0 ? "NORMAL" :
      run.forced ? "FORCED" : run.cancelled ? "CANCELLED" : run.completed ? "NORMAL" : "UNEXPECTED" };
    if (run.startupFailed) record = await this.journal.transition(run.context.attemptId, "FAILED", undefined, outcome);
    else if (!descendantsStopped || (!run.completed && !(run.cancelled && (run.cancellationAck || run.forced)) && (code === 0 || code === null))) {
      record = await this.journal.transition(run.context.attemptId, "UNCERTAIN", undefined, outcome);
      record = await this.journal.transition(run.context.attemptId, "RECONCILIATION_REQUIRED");
    } else {
      if (run.cancelled && record.phase === "RUNNING") record = await this.journal.transition(run.context.attemptId, "CANCELLATION_REQUESTED");
      const phase = run.completed && code === 0 ? "COMPLETED" : code !== 0 && !run.forced ? "FAILED" : "INTERRUPTED";
      record = await this.journal.transition(run.context.attemptId, phase, undefined, outcome);
    }
    // Collection and lifecycle journaling are internal diagnostics/safety, not publication.
    // Fence the existing producer-to-caller release without decoding or forwarding denied text.
    const publication = denyOutputPublication(this.publication, undefined, run.context);
    const messages = Object.freeze(run.messages.map(({ type, nonce, pid }) => Object.freeze({ type, nonce, pid })));
    run.resolve(Object.freeze({ record, pid: run.pid, stdout: "", stderr: "", publication,
      outputTruncated: run.truncated, forced: run.forced, descendants: Object.freeze([...run.descendants]), descendantsStopped,
      messages }));
  }
  async cancel(context: AttemptContext): Promise<AttemptRecord> {
    this.owns(context); this.cancelled.add(context.attemptId); this.approvals.revoke(context);
    const run = this.runs.get(context.attemptId);
    if (run && !run.closed) { run.cancelled = true; this.stopRun(run); }
    const task = this.serial(async () => {
      const record = await this.journal.read(context.attemptId);
      if (isTerminal(record.phase) || record.phase === "RECONCILIATION_REQUIRED") return record;
      const current = this.runs.get(context.attemptId);
      if (current) {
        if (!current.closed && record.phase !== "CANCELLATION_REQUESTED") await this.journal.transition(context.attemptId, "CANCELLATION_REQUESTED");
        return null;
      }
      return this.journal.transition(context.attemptId, "INTERRUPTED", undefined, { code: null, signal: null, reason: "CANCELLED" });
    });
    const record = await task;
    if (record) return record;
    const current = this.runs.get(context.attemptId)!;
    return (await this.bounded(current.done)).record;
  }
  private async bounded<T>(promise: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try { return await Promise.race([promise, new Promise<never>((_, no) => { timer = setTimeout(() => no(new SecurityFailure("OWNED_PROCESS_CLEANUP_NOT_CONFIRMED")), 5000); })]); }
    finally { clearTimeout(timer); }
  }
  async close() {
    if (this.closing) return; this.closing = true;
    const results = await Promise.allSettled([...this.contexts.values()].map((context) => this.cancel(context)));
    await this.queue;
    for (const run of this.runs.values()) await this.bounded(run.done);
    await this.journal.close();
    requireSecurity(results.every((result) => result.status === "fulfilled"), "HARNESS_CLEANUP_FAILED");
  }
}

export function probeRequest(context: AttemptContext, mode: SyntheticRequest["probeMode"] = "complete"): SyntheticRequest {
  return { projectId: context.projectId, taskId: context.taskId, attemptId: context.attemptId,
    attemptGeneration: context.attemptGeneration, workspaceBindingId: context.workspaceBindingId,
    operation: "PROBE", path: "work", probeMode: mode! };
}
