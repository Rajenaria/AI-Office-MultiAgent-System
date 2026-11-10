import { z } from "zod";
import { ReferenceIdSchema } from "../primitives.js";
import {
  evaluateWorkerAdmission, evaluateOutputPublication,
  type AdmissionContext, type AdmissionRequest, type DenialReason,
  type OutputEnvelope, type PublicationContext, type SecurityPolicy,
} from "../execution-fence.js";

/** OFFLINE TEST SIMULATION ONLY. No production clearance, IO or dispatcher.
 * One instance owns one mock run. Only fixture owners receive owner controls.
 * Synchronous transactions never await or invoke caller callbacks. Every commit
 * replaces one private state pointer; this is not a distributed/durable fence.
 */
export interface MockFixtureSeed {
  policy: SecurityPolicy;
  context: AdmissionContext;
  destinationId: string;
  sequence: PublicationContext["sequence"];
}
export interface MockAdmissionOperation {
  operationId: string; expectedStateVersion: number; request: AdmissionRequest;
}
export interface MockPublicationOperation {
  operationId: string; expectedStateVersion: number; output: OutputEnvelope;
}
export type MockReason = DenialReason | "MOCK_RECORDED" | "INVALID_OPERATION" | "INVALID_MOCK_STATE"
  | "STALE_STATE" | "DUPLICATE_OPERATION" | "ADMISSION_ALREADY_RECORDED" | "ADMISSION_REQUIRED"
  | "INVALID_TICKET" | "MOCK_COMMIT_FAILED" | "REENTRANCY_DENIED" | "CAPACITY_EXCEEDED"
  | "VERSION_EXHAUSTED" | "NO_STATE_CHANGE" | "TIME_REGRESSION";
type Kind = "ADMISSION" | "PUBLICATION" | "CONTROL";
export interface MockReceipt {
  readonly outcome: `MOCK_${Kind}_DENIED` | `MOCK_${Kind}_RECORDED`;
  readonly reason: MockReason;
  readonly operationId: string | null;
  readonly runId: string | null;
  readonly policyVersion: string | null;
  readonly epoch: number | null;
  readonly acceptedSequence: number | null;
  readonly evaluatedStateVersion: number | null;
  readonly stateVersion: number;
  /** Commit order of the state observed, not a unique order for denied attempts. */
  readonly commitOrder: number;
  readonly mockOnly: true;
  readonly executionAuthority: false;
}
export interface MockPreparation {
  readonly outcome: "MOCK_PREPARED";
  readonly ticket: object;
  readonly stateVersion: number;
  readonly mockOnly: true;
  readonly executionAuthority: false;
}
export interface MockPublicationRecord {
  operationId: string; output: OutputEnvelope; stateVersion: number; commitOrder: number;
}
export interface MockSnapshot {
  valid: boolean; stateVersion: number; commitOrder: number;
  fixture: MockFixtureSeed | null;
  admission: { operationId: string; requestId: string; workerId: string } | null;
  publications: MockPublicationRecord[];
  consumedOperationIds: string[];
}
const Int = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const Ref = ReferenceIdSchema;
const Sequence = z.strictObject({ min: Int, max: Int, lastAccepted: Int.nullable(),
  seenOutputIds: z.array(Ref).max(4096) });
const Seed = z.strictObject({ policy: z.unknown(), context: z.unknown(), destinationId: Ref, sequence: Sequence });
const Admission = z.strictObject({ operationId: Ref, expectedStateVersion: Int, request: z.unknown() });
const Publication = z.strictObject({ operationId: Ref, expectedStateVersion: Int, output: z.unknown() });
const Header = { operationId: Ref, expectedStateVersion: Int };
const Control = z.discriminatedUnion("kind", [
  z.strictObject({ ...Header, kind: z.enum(["CANCEL", "REVOKE_AUTHORIZATION", "REVOKE_POLICY", "ACTIVATE_SECURITY_STOP", "TERMINATE"]) }),
  z.strictObject({ ...Header, kind: z.literal("ADVANCE_TIME"), nowMs: Int }),
]);
export type MockControl = z.infer<typeof Control>;
export type MockFailurePoint = "BEFORE_COMMIT" | "PUBLICATION_APPEND";
interface State extends MockSnapshot { fixture: MockFixtureSeed; valid: true }
interface Pending {
  kind: "ADMISSION" | "PUBLICATION";
  operationId: string; expectedStateVersion: number; input: AdmissionRequest | OutputEnvelope;
}
const invalidShape = new Set<DenialReason>(["INVALID_REQUEST", "INVALID_OUTPUT", "INVALID_CONTEXT", "INVALID_POLICY"]);
const terminal = new Set(["CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"]);

/** Copy ingress before entering any transaction. Accessors, functions, symbols,
 * non-plain objects and cycles are rejected, rather than called/coerced. Proxy
 * traps cannot be sandboxed in JS; any such traps occur OUTSIDE the transaction.
 * A bounded inert-data transport remains necessary in a future trusted host.
 */
function inertCopy(input: unknown): unknown {
  const ancestors = new Set<object>();
  let nodes = 0;
  function copy(value: unknown, depth: number): unknown {
    if (++nodes > 50000 || depth > 24) throw new Error("INVALID_DATA");
    if (value === null || typeof value === "boolean") return value;
    if (typeof value === "string" && value.length <= 1024) return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "object" || value === null || ancestors.has(value)) throw new Error("INVALID_DATA");
    const array = Array.isArray(value);
    const proto = Object.getPrototypeOf(value);
    if (array ? proto !== Array.prototype : proto !== Object.prototype && proto !== null) throw new Error("INVALID_DATA");
    if (array && (value as unknown[]).length > 4096) throw new Error("INVALID_DATA");
    ancestors.add(value);
    const result: Record<string, unknown> | unknown[] = array ? [] : Object.create(null) as Record<string, unknown>;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (array && Reflect.ownKeys(descriptors).length !== (value as unknown[]).length + 1) throw new Error("INVALID_DATA");
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string") throw new Error("INVALID_DATA");
      if (array && key === "length") continue;
      const d = descriptors[key];
      if (!d || !d.enumerable || !("value" in d) || key === "__proto__" || key === "constructor" || key === "prototype") throw new Error("INVALID_DATA");
      if (array && !/^(0|[1-9][0-9]*)$/.test(key)) throw new Error("INVALID_DATA");
      Object.defineProperty(result, key, { value: copy(d.value, depth + 1), enumerable: true, writable: true, configurable: true });
    }
    if (array && (value as unknown[]).length !== (result as unknown[]).length) throw new Error("INVALID_DATA");
    ancestors.delete(value);
    return result;
  }
  return copy(input, 0);
}
function publicationContext(f: MockFixtureSeed): PublicationContext {
  const { containment: _containment, outputFence: _outputFence, provider: _provider, ...common } = f.context;
  return { ...common, destinationId: f.destinationId, sequence: f.sequence };
}
function fixtureFrom(input: unknown): MockFixtureSeed | null {
  try {
    const s = Seed.safeParse(inertCopy(input));
    if (!s.success) return null;
    // R5 owns validation of its actual full contracts. Shape probes do not grant
    // eligibility or modify lifecycle; malformed fixture state stays unusable.
    const f = s.data as MockFixtureSeed;
    const c = f.context;
    const request = { requestId: "mock-shape-probe", identity: c.identity, epoch: c.epoch,
      policyVersion: c.policyVersion, workerType: "mock-shape-probe", providerId: null };
    const admission = evaluateWorkerAdmission(request, c, f.policy);
    if (admission.outcome === "DENIED" && invalidShape.has(admission.reason)) return null;
    const output = { outputId: "mock-shape-probe", identity: c.identity, epoch: c.epoch,
      policyVersion: c.policyVersion, destinationId: f.destinationId, channel: "mock-shape-probe", classification: "PUBLIC", sequence: null };
    const publication = evaluateOutputPublication(output, publicationContext(f), f.policy);
    if (publication.outcome === "DENIED" && invalidShape.has(publication.reason)) return null;
    if (f.sequence.min > f.sequence.max || (f.sequence.lastAccepted !== null &&
        (f.sequence.lastAccepted < f.sequence.min || f.sequence.lastAccepted > f.sequence.max))) return null;
    return structuredClone(f);
  } catch { return null; }
}

class MockStateOwner {
  #state: State | null;
  #busy = false;
  #tickets = new WeakMap<object, Pending>();
  #failure: MockFailurePoint | null = null;
  constructor(seed: unknown) {
    const fixture = fixtureFrom(seed);
    this.#state = fixture ? { valid: true, stateVersion: 0, commitOrder: 0, fixture,
      admission: null, publications: [], consumedOperationIds: [] } : null;
  }
  snapshot(): MockSnapshot {
    return structuredClone(this.#state ?? { valid: false, stateVersion: 0, commitOrder: 0,
      fixture: null, admission: null, publications: [], consumedOperationIds: [] });
  }
  #receipt(kind: Kind, operationId: string | null, reason: MockReason,
    evaluatedStateVersion: number | null = null, recorded = false): MockReceipt {
    const s = this.#state;
    return Object.freeze({ outcome: `MOCK_${kind}_${recorded ? "RECORDED" : "DENIED"}`,
      operationId, reason, runId: s?.fixture.context.identity.runId ?? null,
      policyVersion: s?.fixture.policy.version ?? null, epoch: s?.fixture.context.epoch ?? null,
      acceptedSequence: s?.fixture.sequence.lastAccepted ?? null, evaluatedStateVersion,
      stateVersion: s?.stateVersion ?? 0, commitOrder: s?.commitOrder ?? 0,
      mockOnly: true, executionAuthority: false });
  }
  #evaluate(p: Pending, s: State): MockReason | null {
    if (s.consumedOperationIds.includes(p.operationId)) return "DUPLICATE_OPERATION";
    if (p.kind === "ADMISSION" && s.admission) return "ADMISSION_ALREADY_RECORDED";
    if (p.kind === "PUBLICATION" && !s.admission) return "ADMISSION_REQUIRED";
    const result = p.kind === "ADMISSION"
      ? evaluateWorkerAdmission(p.input, s.fixture.context, s.fixture.policy)
      : evaluateOutputPublication(p.input, publicationContext(s.fixture), s.fixture.policy);
    return result.outcome === "DENIED" ? result.reason : null;
  }
  prepare(kind: "ADMISSION" | "PUBLICATION", input: unknown): MockPreparation | MockReceipt {
    let pending: Pending;
    try {
      const value = inertCopy(input);
      if (kind === "ADMISSION") {
        const p = Admission.safeParse(value);
        if (!p.success) return this.#receipt(kind, null, "INVALID_OPERATION");
        pending = { kind, operationId: p.data.operationId, expectedStateVersion: p.data.expectedStateVersion,
          input: p.data.request as AdmissionRequest };
      } else {
        const p = Publication.safeParse(value);
        if (!p.success) return this.#receipt(kind, null, "INVALID_OPERATION");
        pending = { kind, operationId: p.data.operationId, expectedStateVersion: p.data.expectedStateVersion,
          input: p.data.output as OutputEnvelope };
      }
    } catch { return this.#receipt(kind, null, "INVALID_OPERATION"); }
    if (this.#busy) return this.#receipt(kind, pending.operationId, "REENTRANCY_DENIED");
    this.#busy = true;
    try {
      const s = this.#state;
      if (!s) return this.#receipt(kind, pending.operationId, "INVALID_MOCK_STATE");
      if (pending.expectedStateVersion !== s.stateVersion) return this.#receipt(kind, pending.operationId, "STALE_STATE");
      const reason = this.#evaluate(pending, s);
      if (reason) return this.#receipt(kind, pending.operationId, reason, s.stateVersion);
      const ticket = Object.freeze({ mockOnly: true, executionAuthority: false });
      this.#tickets.set(ticket, pending);
      return Object.freeze({ outcome: "MOCK_PREPARED", ticket, stateVersion: s.stateVersion,
        mockOnly: true, executionAuthority: false });
    } catch { return this.#receipt(kind, pending.operationId, "MOCK_COMMIT_FAILED"); }
    finally { this.#busy = false; }
  }
  commit(kind: "ADMISSION" | "PUBLICATION", ticket: unknown): MockReceipt {
    if (this.#busy) return this.#receipt(kind, null, "REENTRANCY_DENIED");
    const p = typeof ticket === "object" && ticket !== null ? this.#tickets.get(ticket) : undefined;
    if (!p || p.kind !== kind) return this.#receipt(kind, null, "INVALID_TICKET");
    this.#tickets.delete(ticket as object); // attempt-scoped only; not an idempotency reservation
    this.#busy = true;
    try {
      const s = this.#state;
      if (!s) return this.#receipt(kind, p.operationId, "INVALID_MOCK_STATE");
      if (p.expectedStateVersion !== s.stateVersion) return this.#receipt(kind, p.operationId, "STALE_STATE", p.expectedStateVersion);
      // Always invoke the R5 decision again against the current owned state.
      const reason = this.#evaluate(p, s);
      if (reason) return this.#receipt(kind, p.operationId, reason, s.stateVersion);
      if (s.stateVersion === Number.MAX_SAFE_INTEGER || s.commitOrder === Number.MAX_SAFE_INTEGER) return this.#receipt(kind, p.operationId, "VERSION_EXHAUSTED", s.stateVersion);
      if (s.consumedOperationIds.length >= 4096 || (kind === "PUBLICATION" && s.fixture.sequence.seenOutputIds.length >= 4096)) return this.#receipt(kind, p.operationId, "CAPACITY_EXCEEDED", s.stateVersion);
      const next = structuredClone(s);
      next.stateVersion++; next.commitOrder++;
      next.consumedOperationIds.push(p.operationId);
      if (this.#failure === "BEFORE_COMMIT") { this.#failure = null; throw new Error("MOCK_FAILURE"); }
      if (kind === "ADMISSION") {
        const r = p.input as AdmissionRequest;
        next.admission = { operationId: p.operationId, requestId: r.requestId, workerId: r.identity.workerId };
        next.fixture.context.lifecycle = "RUNNING"; // simulation transition, never process launch
      } else {
        const output = p.input as OutputEnvelope;
        next.fixture.sequence.lastAccepted = output.sequence ?? next.fixture.sequence.lastAccepted;
        next.fixture.sequence.seenOutputIds.push(output.outputId);
        if (this.#failure === "PUBLICATION_APPEND") { this.#failure = null; throw new Error("MOCK_FAILURE"); }
        next.publications.push({ operationId: p.operationId, output: structuredClone(output),
          stateVersion: next.stateVersion, commitOrder: next.commitOrder });
      }
      // Construct the successful receipt before changing the state pointer. No
      // fallible append, allocation or callback remains after linearization.
      const receipt: MockReceipt = Object.freeze({ outcome: `MOCK_${kind}_RECORDED`, reason: "MOCK_RECORDED",
        operationId: p.operationId, runId: next.fixture.context.identity.runId,
        policyVersion: next.fixture.policy.version, epoch: next.fixture.context.epoch,
        acceptedSequence: next.fixture.sequence.lastAccepted, evaluatedStateVersion: s.stateVersion,
        stateVersion: next.stateVersion, commitOrder: next.commitOrder, mockOnly: true, executionAuthority: false });
      this.#state = next; // LINEARIZATION POINT: reservation/sink/history/version together
      return receipt;
    } catch { return this.#receipt(kind, p.operationId, "MOCK_COMMIT_FAILED", p.expectedStateVersion); }
    finally { this.#busy = false; }
  }
  attempt(kind: "ADMISSION" | "PUBLICATION", input: unknown): MockReceipt {
    const p = this.prepare(kind, input);
    return p.outcome === "MOCK_PREPARED" ? this.commit(kind, p.ticket) : p;
  }
  control(input: unknown): MockReceipt {
    let command: MockControl;
    try {
      const c = Control.safeParse(inertCopy(input));
      if (!c.success) return this.#receipt("CONTROL", null, "INVALID_OPERATION");
      command = c.data;
    } catch { return this.#receipt("CONTROL", null, "INVALID_OPERATION"); }
    if (this.#busy) return this.#receipt("CONTROL", command.operationId, "REENTRANCY_DENIED");
    this.#busy = true;
    try {
      const s = this.#state;
      if (!s) return this.#receipt("CONTROL", command.operationId, "INVALID_MOCK_STATE");
      if (command.expectedStateVersion !== s.stateVersion) return this.#receipt("CONTROL", command.operationId, "STALE_STATE");
      if (s.consumedOperationIds.includes(command.operationId)) return this.#receipt("CONTROL", command.operationId, "DUPLICATE_OPERATION", s.stateVersion);
      if (s.stateVersion === Number.MAX_SAFE_INTEGER || s.commitOrder === Number.MAX_SAFE_INTEGER) return this.#receipt("CONTROL", command.operationId, "VERSION_EXHAUSTED", s.stateVersion);
      // Safety barriers remain available even if publication/idempotency capacity
      // is exhausted; unlike effect operations they need not consume a key.
      const next = structuredClone(s);
      switch (command.kind) {
        case "CANCEL":
          next.fixture.context.cancellation = "REQUESTED";
          if (!terminal.has(next.fixture.context.lifecycle)) next.fixture.context.lifecycle = "CANCELLATION_REQUESTED";
          break;
        case "REVOKE_AUTHORIZATION": next.fixture.context.authorization = { status: "REVOKED", evidence: null }; break;
        case "REVOKE_POLICY": next.fixture.policy.status = "DISABLED"; break;
        case "ACTIVATE_SECURITY_STOP": next.fixture.context.securityStop = { state: "ACTIVE", clearance: null }; break;
        case "TERMINATE":
          if (terminal.has(next.fixture.context.lifecycle)) return this.#receipt("CONTROL", command.operationId, "NO_STATE_CHANGE", s.stateVersion);
          next.fixture.context.lifecycle = "COMPLETED"; break;
        case "ADVANCE_TIME":
          if (command.nowMs < next.fixture.context.nowMs) return this.#receipt("CONTROL", command.operationId, "TIME_REGRESSION", s.stateVersion);
          next.fixture.context.nowMs = command.nowMs; break;
      }
      next.stateVersion++; next.commitOrder++;
      const receipt: MockReceipt = Object.freeze({ outcome: "MOCK_CONTROL_RECORDED", reason: "MOCK_RECORDED",
        operationId: command.operationId, runId: next.fixture.context.identity.runId,
        policyVersion: next.fixture.policy.version, epoch: next.fixture.context.epoch,
        acceptedSequence: next.fixture.sequence.lastAccepted, evaluatedStateVersion: s.stateVersion,
        stateVersion: next.stateVersion, commitOrder: next.commitOrder, mockOnly: true, executionAuthority: false });
      this.#state = next; // same linearization model as admission/publication
      return receipt;
    } catch { return this.#receipt("CONTROL", command.operationId, "MOCK_COMMIT_FAILED"); }
    finally { this.#busy = false; }
  }
  injectFailure(point: MockFailurePoint): boolean {
    if (point !== "BEFORE_COMMIT" && point !== "PUBLICATION_APPEND") return false;
    this.#failure = point; // trusted diagnostic plan only, never authority state
    return true;
  }
}

/** Explicitly instantiate fixture-local authority; no singleton or app export.
 * Do not hand the owner facade to simulated untrusted request producers.
 * No API clears stop, restores revoked authorization, or reopens a terminal run.
 */
export function createMockEnforcementBoundary(seed: unknown) {
  const state = new MockStateOwner(seed);
  return Object.freeze({
    boundary: Object.freeze({
      attemptMockAdmission: (request: unknown) => state.attempt("ADMISSION", request),
      attemptMockPublication: (output: unknown) => state.attempt("PUBLICATION", output),
      prepareMockAdmission: (request: unknown) => state.prepare("ADMISSION", request),
      prepareMockPublication: (output: unknown) => state.prepare("PUBLICATION", output),
      commitMockAdmission: (ticket: unknown) => state.commit("ADMISSION", ticket),
      commitMockPublication: (ticket: unknown) => state.commit("PUBLICATION", ticket),
      snapshot: () => state.snapshot(),
    }),
    owner: Object.freeze({
      applyMockControl: (command: unknown) => state.control(command),
      injectMockFailure: (point: MockFailurePoint) => state.injectFailure(point),
    }),
  });
}
