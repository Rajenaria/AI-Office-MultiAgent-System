import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { ContentHashSchema, ProjectIdSchema } from "../../contracts/primitives.js";
import { AttemptSchema, ReceiptSchema, SafePositive, SafeTime, hash, issuanceDigest, nextInteger, parse,
  requireAuthority, semanticDigest, type Attempt } from "./contracts.js";
import { assertEdge, isTerminal } from "./state-machine.js";
import { validateLeaseHistory } from "./lease.js";
import { validateCancellationHistory } from "./cancellation.js";
import { readRecovery, validateRecoveryHistory } from "./recovery.js";

const PayloadSchema = z.strictObject({ snapshot: AttemptSchema, decisionId: ProjectIdSchema.nullable() });
const EventSchema = z.strictObject({ eventId: ProjectIdSchema, projectId: ProjectIdSchema, attemptId: ProjectIdSchema,
  attemptGeneration: SafePositive, priorVersion: SafeTime, newVersion: SafePositive,
  eventType: z.enum(["ATTEMPT_ISSUED", "PHASE_CHANGED", "OWNER_FENCED", "TERMINAL_COMMITTED", "LEASE_RENEWED", "LEASE_QUARANTINED", "CANCEL_INTENT", "CANCEL_ACK", "CANCEL_EXIT", "RECOVERY_CLASSIFIED"]),
  payloadVersion: z.literal(1), writerHostInstanceId: ProjectIdSchema, idempotencyKey: ProjectIdSchema,
  atMs: SafeTime, payload: z.string().max(16384), payloadDigest: ContentHashSchema,
  previousEventDigest: ContentHashSchema.nullable(), eventDigest: ContentHashSchema });
export type AuthorityEvent = z.infer<typeof EventSchema>;
export type EventType = AuthorityEvent["eventType"];
const eventHash = (event: Omit<AuthorityEvent, "eventDigest">): string => semanticDigest([event.eventId, event.projectId,
  event.attemptId, event.attemptGeneration, event.priorVersion, event.newVersion, event.eventType, event.payloadVersion,
  event.writerHostInstanceId, event.idempotencyKey, event.atMs, event.payloadDigest, event.previousEventDigest]);
const immutable = ["projectId", "authorityIncarnation", "taskId", "attemptId", "issueRequestId", "issueDigest", "bindingId",
  "bindingGeneration", "scopeDigest", "actionDigest", "permissionDigest", "runtimeRef", "executionMode", "createdAtMs"] as const;
const owner = ["hostInstanceId", "ownerId", "ownerNonceHash", "ownerMode"] as const;

export function appendEvent(db: DatabaseSync, snapshot: Attempt, eventId: string, eventType: EventType,
  idempotencyKey: string, decisionId: string | null): void {
  const prior = db.prepare("SELECT eventDigest FROM runtime_attempt_events WHERE projectId=? AND attemptId=? ORDER BY newVersion DESC LIMIT 1")
    .get(snapshot.projectId, snapshot.attemptId);
  const payload = JSON.stringify({ snapshot, decisionId });
  requireAuthority(Buffer.byteLength(payload, "utf8") <= 16384, "VALIDATION");
  const writerHostInstanceId = eventType === "RECOVERY_CLASSIFIED" ? readRecovery(snapshot)?.inspectorHostInstanceId : snapshot.hostInstanceId;
  requireAuthority(writerHostInstanceId, "INTEGRITY");
  const event: AuthorityEvent = { eventId, projectId: snapshot.projectId, attemptId: snapshot.attemptId,
    attemptGeneration: snapshot.attemptGeneration, priorVersion: snapshot.stateVersion - 1, newVersion: snapshot.stateVersion,
    eventType, payloadVersion: 1, writerHostInstanceId, idempotencyKey, atMs: snapshot.updatedAtMs,
    payload, payloadDigest: hash(payload), previousEventDigest: prior ? String(prior.eventDigest) : null, eventDigest: "" };
  event.eventDigest = eventHash(event);
  const keys = Object.keys(EventSchema.shape) as (keyof AuthorityEvent)[];
  db.prepare(`INSERT INTO runtime_attempt_events(${keys.join(",")}) VALUES(${keys.map(() => "?").join(",")})`)
    .run(...keys.map((key) => event[key]));
}
// Runs inside the caller's read/write transaction, so events and projection share a snapshot.
export function verifyHistory(db: DatabaseSync, current: Attempt): readonly AuthorityEvent[] {
  try {
    const events = db.prepare("SELECT * FROM runtime_attempt_events WHERE projectId=? AND attemptId=? ORDER BY newVersion")
      .all(current.projectId, current.attemptId).map((row) => parse(EventSchema, row));
    requireAuthority(events.length === current.stateVersion && events.length > 0, "INTEGRITY");
    let previous: Attempt | undefined, previousDigest: string | null = null;
    const epochs = new Map<number, Attempt>();
    for (let i = 0; i < events.length; i++) {
      const event = events[i]!, payload = parse(PayloadSchema, JSON.parse(event.payload)), next = payload.snapshot;
      requireAuthority(event.priorVersion === i && event.newVersion === i + 1 && next.stateVersion === i + 1 &&
        event.previousEventDigest === previousDigest && event.payloadDigest === hash(event.payload) &&
        event.eventDigest === eventHash(event) && event.payload === JSON.stringify(payload) &&
        event.projectId === current.projectId && event.attemptId === current.attemptId &&
        next.projectId === event.projectId && next.attemptId === event.attemptId &&
        next.attemptGeneration === event.attemptGeneration &&
        (event.eventType === "RECOVERY_CLASSIFIED" ? readRecovery(next)?.inspectorHostInstanceId === event.writerHostInstanceId :
          next.hostInstanceId === event.writerHostInstanceId) &&
        next.updatedAtMs === event.atMs, "INTEGRITY");
      if (!previous) {
        requireAuthority(event.eventType === "ATTEMPT_ISSUED" && next.phase === "CREATED" && next.attemptGeneration === 1 &&
          next.ownerMode === "EXECUTION" && next.createdAtMs === next.updatedAtMs && next.issueDigest === issuanceDigest(next) &&
          event.idempotencyKey === next.issueRequestId && payload.decisionId === next.issueRequestId, "INTEGRITY");
      } else {
        requireAuthority(immutable.every((key) => next[key] === previous![key]) && next.updatedAtMs >= previous.updatedAtMs, "INTEGRITY");
        const fencing = event.eventType === "OWNER_FENCED";
        if (["LEASE_RENEWED", "CANCEL_ACK", "CANCEL_EXIT"].includes(event.eventType) || (["CANCEL_INTENT", "RECOVERY_CLASSIFIED"].includes(event.eventType) && next.phase === previous.phase)) requireAuthority(next.phase === previous.phase && !isTerminal(previous.phase), "INTEGRITY");
        else assertEdge(previous, next.phase, fencing);
        requireAuthority(next.attemptGeneration === (fencing ? nextInteger(previous.attemptGeneration) : previous.attemptGeneration), "INTEGRITY");
        if (fencing) requireAuthority(next.ownerMode === "RECOVERY" && payload.decisionId !== null, "INTEGRITY");
        else requireAuthority(owner.every((key) => next[key] === previous![key]), "INTEGRITY");
        requireAuthority(fencing || ["LEASE_RENEWED", "LEASE_QUARANTINED", "CANCEL_INTENT", "CANCEL_ACK", "CANCEL_EXIT", "RECOVERY_CLASSIFIED"].includes(event.eventType) || event.eventType === (isTerminal(next.phase) ? "TERMINAL_COMMITTED" : "PHASE_CHANGED"), "INTEGRITY");
      }
      requireAuthority(isTerminal(next.phase) === (next.terminalReceiptId !== null) &&
        (isTerminal(next.phase) || (next.terminalDigest === null && next.terminalPayload === null)), "INTEGRITY");
      if (isTerminal(next.phase)) {
        requireAuthority(next.terminalPayload !== null && hash(next.terminalPayload) === next.terminalDigest, "INTEGRITY");
        const receipt = JSON.parse(next.terminalPayload!) as { receipt?: unknown };
        requireAuthority(parse(ReceiptSchema, receipt.receipt).receiptId === next.terminalReceiptId &&
          event.idempotencyKey === next.terminalReceiptId, "INTEGRITY");
      }
      validateLeaseHistory(previous, next, event.eventType);
      validateCancellationHistory(previous, next, event.eventType);
      validateRecoveryHistory(previous, next, event.eventType);
      if (!epochs.has(next.attemptGeneration)) epochs.set(next.attemptGeneration, next);
      previous = next; previousDigest = event.eventDigest;
    }
    requireAuthority(JSON.stringify(previous) === JSON.stringify(current), "INTEGRITY");
    const projection = parse(AttemptSchema, db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?")
      .get(current.projectId, current.attemptId));
    requireAuthority(JSON.stringify(projection) === JSON.stringify(current), "INTEGRITY");
    const rows = db.prepare("SELECT * FROM runtime_owner_epochs WHERE projectId=? AND attemptId=? ORDER BY attemptGeneration")
      .all(current.projectId, current.attemptId);
    requireAuthority(rows.length === epochs.size && rows.every((row) => {
      const snapshot = epochs.get(Number(row.attemptGeneration));
      return snapshot && owner.every((key) => row[key] === snapshot[key]) && row.acquiredAtMs === snapshot.updatedAtMs;
    }), "INTEGRITY");
    return events;
  } catch (error) {
    if (error instanceof Error && "errcode" in error) throw error;
    // A persisted contract/JSON/transition failure is corruption, not bad caller input.
    requireAuthority(false, "INTEGRITY");
  }
}
