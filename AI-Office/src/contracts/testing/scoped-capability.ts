import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../primitives.js";
import { createFakeAuthorityAdapter, type AuthorityReceipt, type AuthorityReason,
  type FakeEvidenceReference } from "./fake-authority-adapter.js";

/** OFFLINE MOCK ACTIONS ONLY. No dispatch, tools, providers, artifact writes or
 * user delivery. All inner authority/enforcement facades stay private to this
 * synchronous owner. No real execution authority is issued or consumed here.
 */
const Int = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const Positive = Int.min(1);
const Ref = ReferenceIdSchema;
const Actions = z.enum(["MOCK_ADMISSION_RECORD", "MOCK_PUBLICATION_RECORD"]);
export type MockAction = z.infer<typeof Actions>;
const Binding = z.strictObject({ authorityInstanceId: Ref, authorityGeneration: Positive, authorityRevision: Int,
  subjectId: Ref, projectId: ProjectIdSchema, sessionId: Ref, workerId: Ref, runId: Ref,
  incarnationId: Ref, executionEpoch: Positive, policyVersion: Ref, authorizationRevision: Positive });
const Identity = z.strictObject({ projectId: ProjectIdSchema, sessionId: Ref, ownerId: Ref,
  workerId: Ref, runId: Ref, taskScope: Ref });
const ActionList = z.array(Actions).min(1).max(2).refine(a => new Set(a).size === a.length);
const Grant = z.strictObject({ capabilityId: Ref, binding: Binding, allowedActions: ActionList,
  taskScope: Ref, destinationScope: Ref, issuedAtMs: Int, expiresAtMs: Int,
  usagePolicy: z.enum(["SINGLE_USE", "REUSABLE"]) });
export type MockScopedCapability = z.infer<typeof Grant>;
const EntryState = z.strictObject({ grant: Grant, revoked: z.boolean(), consumed: z.boolean(), uses: Int });
export type ScopedCapabilityState = z.infer<typeof EntryState>;
const ActionRequest = z.strictObject({ action: Ref, identity: Identity, epoch: Positive, policyVersion: Ref, destinationId: Ref });
const Current = z.strictObject({ valid: z.boolean(), binding: Binding.nullable(), nowMs: Int, requiresRecreation: z.boolean(),
  taskScope: Ref.nullable(), destination: z.strictObject({ destinationId: Ref, projectId: ProjectIdSchema,
    sessionId: Ref, ownerId: Ref }).nullable(),
  securityStop: z.enum(["ACTIVE", "UNKNOWN", "INVALID", "CLEARED"]).nullable(),
  authorizationStatus: z.enum(["VERIFIED", "MISSING", "UNKNOWN", "REVOKED"]).nullable(),
  cancellation: z.enum(["CLEAR", "REQUESTED", "ACKNOWLEDGED", "UNKNOWN"]).nullable(),
  lifecycle: z.enum(["CREATED", "APPROVAL_PENDING", "APPROVAL_GRANTED", "APPROVAL_DENIED", "LAUNCHING", "RUNNING",
    "CANCELLATION_REQUESTED", "CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "UNCERTAIN", "RECONCILIATION_REQUIRED"]).nullable(),
  policyActive: z.boolean(), revokedTasks: z.array(Ref).max(4096), revokedDestinations: z.array(Ref).max(4096),
  revokedActions: z.array(Actions).max(2) });
export type ScopedAuthorityState = z.infer<typeof Current>;
export type ScopedReason = AuthorityReason | "CAPABILITY_MISSING" | "CAPABILITY_INVALID" | "INVALID_ACTION_REQUEST"
  | "UNKNOWN_ACTION" | "ACTION_NOT_ALLOWED" | "ACTION_MISMATCH" | "TASK_SCOPE_MISMATCH" | "DESTINATION_SCOPE_MISMATCH"
  | "SUBJECT_MISMATCH" | "AUTHORITY_MISMATCH" | "EPOCH_STALE" | "POLICY_VERSION_STALE"
  | "AUTHORIZATION_EXPIRED" | "CAPABILITY_ALREADY_CONSUMED" | "TASK_REVOKED" | "DESTINATION_REVOKED" | "ACTION_REVOKED"
  | "INVALID_ISSUANCE" | "ISSUER_UNAVAILABLE" | "STALE_SCOPE" | "CAPABILITY_CONSUMPTION_FAILED" | "SCOPE_ELIGIBLE";
export type ScopedActionDecision = Readonly<{ outcome: "MOCK_ACTION_ELIGIBLE" | "MOCK_ACTION_DENIED";
  reason: ScopedReason; mockOnly: true; executionAuthority: false }>;
const decision = (reason: ScopedReason, eligible = false): ScopedActionDecision => ({
  outcome: eligible ? "MOCK_ACTION_ELIGIBLE" : "MOCK_ACTION_DENIED", reason, mockOnly: true, executionAuthority: false });

/** Pure predicate over supplied metadata, NOT evidence authenticity or authority.
 * Only the private owner below may combine eligibility with genuine origin and
 * current R7/R6 state. No mutation, clock, random, IO, logging or token signing.
 */
export function evaluateScopedActionAuthorization(request: unknown, capability: unknown, currentAuthorityState: unknown): ScopedActionDecision {
  try {
    if (capability === null || capability === undefined) return decision("CAPABILITY_MISSING");
    const r = ActionRequest.safeParse(request); if (!r.success) return decision("INVALID_ACTION_REQUEST");
    const action = Actions.safeParse(r.data.action); if (!action.success) return decision("UNKNOWN_ACTION");
    const c = EntryState.safeParse(capability); if (!c.success) return decision("CAPABILITY_INVALID");
    const s = Current.safeParse(currentAuthorityState); if (!s.success || !s.data.valid) return decision("INVALID_AUTHORITY_STATE");
    const b = s.data.binding; if (!b) return decision("AUTHORITY_RECORD_MISSING");
    const g = c.data.grant; const x = g.binding; const i = r.data.identity;
    if (s.data.securityStop !== "CLEARED") return decision(s.data.securityStop === "ACTIVE" ? "SECURITY_STOP_ACTIVE" : "SECURITY_STOP_UNKNOWN");
    if (c.data.revoked || s.data.authorizationStatus !== "VERIFIED") return decision("AUTHORIZATION_REVOKED");
    if (c.data.consumed) return decision("CAPABILITY_ALREADY_CONSUMED");
    if (g.issuedAtMs > s.data.nowMs || s.data.nowMs >= g.expiresAtMs) return decision("AUTHORIZATION_EXPIRED");
    if (x.authorityInstanceId !== b.authorityInstanceId || x.authorityGeneration !== b.authorityGeneration) return decision("AUTHORITY_MISMATCH");
    if (x.subjectId !== b.subjectId || i.ownerId !== b.subjectId) return decision("SUBJECT_MISMATCH");
    if (x.projectId !== b.projectId || i.projectId !== b.projectId || x.sessionId !== b.sessionId || i.sessionId !== b.sessionId) return decision("OWNERSHIP_CONFLICT");
    if (x.runId !== b.runId || i.runId !== b.runId) return decision("RUN_CONFLICT");
    if (x.workerId !== b.workerId || i.workerId !== b.workerId) return decision("WORKER_CONFLICT");
    if (x.incarnationId !== b.incarnationId) return decision("INCARNATION_MISMATCH");
    if (x.executionEpoch !== b.executionEpoch || r.data.epoch !== b.executionEpoch) return decision("EPOCH_STALE");
    if (x.policyVersion !== b.policyVersion || r.data.policyVersion !== b.policyVersion || !s.data.policyActive) return decision("POLICY_VERSION_STALE");
    if (x.authorizationRevision !== b.authorizationRevision) return decision("AUTHORIZATION_REVISION_MISMATCH");
    if (s.data.requiresRecreation) return decision("BINDING_REFRESH_REQUIRED");
    if (s.data.cancellation !== "CLEAR" || s.data.lifecycle === "CANCELLATION_REQUESTED") return decision("CANCELLED");
    if (["CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"].includes(s.data.lifecycle ?? "")) return decision("TERMINAL");
    if (!g.allowedActions.includes(action.data)) return decision("ACTION_NOT_ALLOWED");
    if (s.data.revokedActions.includes(action.data)) return decision("ACTION_REVOKED");
    if (g.taskScope !== i.taskScope || g.taskScope !== s.data.taskScope) return decision("TASK_SCOPE_MISMATCH");
    if (s.data.revokedTasks.includes(g.taskScope)) return decision("TASK_REVOKED");
    const d = s.data.destination;
    if (!d || g.destinationScope !== r.data.destinationId || g.destinationScope !== d.destinationId) return decision("DESTINATION_SCOPE_MISMATCH");
    if (d.projectId !== b.projectId || d.sessionId !== b.sessionId || d.ownerId !== b.subjectId) return decision("DESTINATION_SCOPE_MISMATCH");
    if (s.data.revokedDestinations.includes(g.destinationScope)) return decision("DESTINATION_REVOKED");
    return decision("SCOPE_ELIGIBLE", true); // predicate only, no usage reserved
  } catch { return decision("INVALID_ACTION_REQUEST"); }
}

const Issuance = z.strictObject({ allowedActions: ActionList, taskScope: Ref, destinationScope: Ref,
  expiresAtMs: Int, usagePolicy: z.enum(["SINGLE_USE", "REUSABLE"]) });
const AdmissionOp = z.strictObject({ operationId: Ref, action: z.unknown(), destinationId: Ref, request: z.unknown() });
const PublicationOp = z.strictObject({ operationId: Ref, action: z.unknown(), output: z.unknown() });
type Kind = "ADMISSION" | "PUBLICATION";
type Inner = ReturnType<typeof createFakeAuthorityAdapter>;
interface Entry extends ScopedCapabilityState { reference: FakeEvidenceReference }
interface State { revision: number; serial: number; entries: Map<string, Entry>;
  tasks: Set<string>; destinations: Set<string>; actions: Set<MockAction> }
interface Pending { kind: Kind; operationId: string; id: string; revision: number; actionRequest: unknown; innerTicket: object }
export interface ScopedReceipt {
  readonly outcome: "MOCK_SCOPED_RECORDED" | "MOCK_SCOPED_DENIED";
  readonly reason: ScopedReason; readonly operationId: string | null; readonly capabilityId: string | null;
  readonly scopeRevision: number; readonly consumedByThisOperation: boolean; readonly innerReceipt: AuthorityReceipt | null;
  readonly mockOnly: true; readonly executionAuthority: false;
}
export interface ScopedPreparation { readonly outcome: "MOCK_SCOPED_PREPARED"; readonly ticket: object;
  readonly scopeRevision: number; readonly mockOnly: true; readonly executionAuthority: false }

// All ingress inspection precedes the critical section. R7/R6 ingress helpers
// are private, so this bounded local copier avoids changing existing exports.
function copyData(input: unknown): unknown {
  let count = 0; const ancestors = new Set<object>();
  function copy(v: unknown, depth: number): unknown {
    if (++count > 50000 || depth > 24) throw new Error("INVALID_DATA");
    if (v === null || typeof v === "boolean") return v;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.length <= 1024) return v;
    if (!v || typeof v !== "object" || ancestors.has(v)) throw new Error("INVALID_DATA");
    const array = Array.isArray(v); const p = Object.getPrototypeOf(v);
    if (array ? p !== Array.prototype || (v as unknown[]).length > 4096 : p !== Object.prototype && p !== null) throw new Error("INVALID_DATA");
    const ds = Object.getOwnPropertyDescriptors(v); const keys = Reflect.ownKeys(ds);
    if (array && keys.length !== (v as unknown[]).length + 1) throw new Error("INVALID_DATA");
    ancestors.add(v); const result = array ? [] : Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      if (typeof key !== "string") throw new Error("INVALID_DATA");
      if (array && key === "length") continue;
      const d = ds[key];
      if (!d || !d.enumerable || !("value" in d) || ["__proto__", "constructor", "prototype"].includes(key) ||
        (array && !/^(0|[1-9][0-9]*)$/.test(key))) throw new Error("INVALID_DATA");
      Object.defineProperty(result, key, { value: copy(d.value, depth + 1), writable: true, enumerable: true, configurable: true });
    }
    ancestors.delete(v); return result;
  }
  return copy(input, 0);
}

class ScopedOwner {
  #inner: Inner;
  #busy = false;
  #state: State = { revision: 0, serial: 0, entries: new Map(), tasks: new Set(), destinations: new Set(), actions: new Set() };
  #origins = new WeakMap<object, string>();
  #tickets = new WeakMap<object, Pending>();
  #failConsumption = false;
  constructor(seed: unknown) { this.#inner = createFakeAuthorityAdapter(seed); }
  #current(): ScopedAuthorityState {
    const s = this.#inner.adapter.snapshot(); const f = s.currentFixture;
    const d = f?.policy.publication.destinations.find(x => x.destinationId === f.destinationId);
    return { valid: s.valid, binding: s.binding, nowMs: s.nowMs, requiresRecreation: s.requiresRecreation,
      taskScope: f?.context.identity.taskScope ?? null,
      destination: d ? { destinationId: d.destinationId, projectId: d.projectId, sessionId: d.sessionId, ownerId: d.ownerId } : null,
      securityStop: f?.context.securityStop.state ?? null, authorizationStatus: f?.context.authorization.status ?? null,
      cancellation: f?.context.cancellation ?? null, lifecycle: f?.context.lifecycle ?? null,
      policyActive: f?.policy.status === "ACTIVE", revokedTasks: [...this.#state.tasks],
      revokedDestinations: [...this.#state.destinations], revokedActions: [...this.#state.actions] };
  }
  snapshot() {
    return { scopeRevision: this.#state.revision, current: this.#current(), authority: this.#inner.adapter.snapshot(),
      capabilities: [...this.#state.entries.values()].map(({ reference: _r, ...e }) => structuredClone(e)) };
  }
  #receipt(reason: ScopedReason, operationId: string | null = null, id: string | null = null): ScopedReceipt {
    return { outcome: "MOCK_SCOPED_DENIED", reason, operationId, capabilityId: id, scopeRevision: this.#state.revision,
      consumedByThisOperation: false, innerReceipt: null, mockOnly: true, executionAuthority: false };
  }
  #ownerResult(reason: ScopedReason) {
    return { outcome: "MOCK_SCOPE_CHANGE_DENIED" as const, reason, scopeRevision: this.#state.revision, mockOnly: true as const, executionAuthority: false as const };
  }
  issue(input: unknown) {
    let spec: z.infer<typeof Issuance>;
    try { const p = Issuance.safeParse(copyData(input)); if (!p.success) return this.#ownerResult("INVALID_ISSUANCE"); spec = p.data; }
    catch { return this.#ownerResult("INVALID_ISSUANCE"); }
    if (this.#busy) return this.#ownerResult("REENTRANCY_DENIED");
    this.#busy = true;
    try {
      const current = this.#current(); const s = this.#inner.adapter.snapshot(); const f = s.currentFixture;
      if (!s.valid || !current.binding || !f) return this.#ownerResult("ISSUER_UNAVAILABLE");
      if (this.#state.entries.size >= 4096 || this.#state.revision >= Number.MAX_SAFE_INTEGER || this.#state.serial >= Number.MAX_SAFE_INTEGER) return this.#ownerResult("CAPACITY_EXCEEDED");
      if (spec.expiresAtMs <= s.nowMs || spec.expiresAtMs > Math.min(f.context.authorization.evidence?.expiresAtMs ?? 0, f.policy.expiresAtMs)) return this.#ownerResult("AUTHORIZATION_EXPIRED");
      const grant: MockScopedCapability = { capabilityId: `mock-capability:${this.#state.serial + 1}`, binding: current.binding,
        ...spec, issuedAtMs: s.nowMs };
      const request = { action: spec.allowedActions[0], identity: f.context.identity, epoch: f.context.epoch,
        policyVersion: f.context.policyVersion, destinationId: spec.destinationScope };
      const check = evaluateScopedActionAuthorization(request, { grant, revoked: false, consumed: false, uses: 0 }, current);
      if (check.outcome !== "MOCK_ACTION_ELIGIBLE") return this.#ownerResult(check.reason);
      if (spec.allowedActions.some(a => current.revokedActions.includes(a))) return this.#ownerResult("ACTION_REVOKED");
      if (spec.allowedActions.includes("MOCK_ADMISSION_RECORD") && !f.policy.admission.enabled ||
        spec.allowedActions.includes("MOCK_PUBLICATION_RECORD") && !f.policy.publication.enabled) return this.#ownerResult("ACTION_NOT_ALLOWED");
      const reference = this.#inner.owner.issueEvidence();
      if (!reference) return this.#ownerResult("ISSUER_UNAVAILABLE");
      // Issuance has no effect commit; genuine R7 reference stays private.
      const handle = Object.freeze({ mockOnly: true, executionAuthority: false });
      const next: State = { ...this.#state, revision: this.#state.revision + 1, serial: this.#state.serial + 1, entries: new Map(this.#state.entries) };
      next.entries.set(grant.capabilityId, { grant: structuredClone(grant), revoked: false, consumed: false, uses: 0, reference });
      this.#origins.set(handle, grant.capabilityId); this.#state = next;
      return Object.freeze({ outcome: "MOCK_CAPABILITY_ISSUED" as const, capability: handle, capabilityId: grant.capabilityId,
        mockOnly: true as const, executionAuthority: false as const });
    } finally { this.#busy = false; }
  }
  prepare(kind: Kind, input: unknown, capability: unknown): ScopedPreparation | ScopedReceipt {
    let p: z.infer<typeof AdmissionOp> | z.infer<typeof PublicationOp>; let actionRequest: unknown;
    try {
      const parsed = (kind === "ADMISSION" ? AdmissionOp : PublicationOp).safeParse(copyData(input));
      if (!parsed.success) return this.#receipt("INVALID_ACTION_REQUEST"); p = parsed.data;
      const body = ("request" in p ? p.request : p.output) as { identity?: unknown; epoch?: unknown; policyVersion?: unknown; destinationId?: unknown } | null;
      actionRequest = { action: p.action, identity: body?.identity, epoch: body?.epoch, policyVersion: body?.policyVersion,
        destinationId: "destinationId" in p ? p.destinationId : body?.destinationId };
    } catch { return this.#receipt("INVALID_ACTION_REQUEST"); }
    if (this.#busy) return this.#receipt("REENTRANCY_DENIED", p.operationId);
    this.#busy = true;
    try {
      if (capability === undefined || capability === null) return this.#receipt("CAPABILITY_MISSING", p.operationId);
      const id = typeof capability === "object" ? this.#origins.get(capability) : undefined;
      const entry = id ? this.#state.entries.get(id) : undefined;
      if (!id || !entry) return this.#receipt("CAPABILITY_INVALID", p.operationId);
      const { reference, ...state } = entry;
      const result = evaluateScopedActionAuthorization(actionRequest, state, this.#current());
      if (result.outcome !== "MOCK_ACTION_ELIGIBLE") return this.#receipt(result.reason, p.operationId, id);
      if (p.action !== (kind === "ADMISSION" ? "MOCK_ADMISSION_RECORD" : "MOCK_PUBLICATION_RECORD")) return this.#receipt("ACTION_MISMATCH", p.operationId, id);
      const inner = kind === "ADMISSION" ? this.#inner.adapter.prepareAdmission({ operationId: p.operationId, request: "request" in p ? p.request : null }, reference)
        : this.#inner.adapter.preparePublication({ operationId: p.operationId, output: "output" in p ? p.output : null }, reference);
      if (inner.outcome !== "FAKE_AUTHORITY_PREPARED") return { ...this.#receipt(inner.reason, p.operationId, id), innerReceipt: inner };
      const ticket = Object.freeze({ mockOnly: true, executionAuthority: false });
      this.#tickets.set(ticket, { kind, operationId: p.operationId, id, revision: this.#state.revision, actionRequest, innerTicket: inner.ticket });
      return Object.freeze({ outcome: "MOCK_SCOPED_PREPARED", ticket, scopeRevision: this.#state.revision, mockOnly: true, executionAuthority: false });
    } finally { this.#busy = false; }
  }
  commit(kind: Kind, ticket: unknown): ScopedReceipt {
    if (this.#busy) return this.#receipt("REENTRANCY_DENIED");
    const p = ticket !== null && typeof ticket === "object" ? this.#tickets.get(ticket) : undefined;
    if (!p || p.kind !== kind) return this.#receipt("INVALID_TICKET");
    this.#tickets.delete(ticket as object); this.#busy = true;
    try {
      if (p.revision !== this.#state.revision) return this.#receipt("STALE_SCOPE", p.operationId, p.id);
      const entry = this.#state.entries.get(p.id); if (!entry) return this.#receipt("CAPABILITY_INVALID", p.operationId, p.id);
      const { reference: _r, ...state } = entry;
      const check = evaluateScopedActionAuthorization(p.actionRequest, state, this.#current());
      if (check.outcome !== "MOCK_ACTION_ELIGIBLE") return this.#receipt(check.reason, p.operationId, p.id);
      if (entry.uses >= Number.MAX_SAFE_INTEGER || this.#state.revision >= Number.MAX_SAFE_INTEGER) return this.#receipt("VERSION_EXHAUSTED", p.operationId, p.id);
      const consumed = entry.grant.usagePolicy === "SINGLE_USE";
      const next: State = { ...this.#state, revision: this.#state.revision + 1, entries: new Map(this.#state.entries) };
      next.entries.set(p.id, { ...entry, consumed, uses: entry.uses + 1 });
      const result = { ...this.#receipt("MOCK_RECORDED", p.operationId, p.id) };
      if (this.#failConsumption) { this.#failConsumption = false; return this.#receipt("CAPABILITY_CONSUMPTION_FAILED", p.operationId, p.id); }
      const inner = kind === "ADMISSION" ? this.#inner.adapter.commitAdmission(p.innerTicket) : this.#inner.adapter.commitPublication(p.innerTicket);
      result.innerReceipt = inner; result.reason = inner.reason;
      if (inner.outcome === "MOCK_AUTHORITY_RECORDED") {
        // Unified observable commit under the private outer lock: after R7/R6
        // success only nonfallible ordinary assignments remain; no Map.set,
        // allocation, freeze, audit append or caller callback follows it.
        this.#state = next; result.outcome = "MOCK_SCOPED_RECORDED";
        result.scopeRevision = next.revision; result.consumedByThisOperation = consumed;
      }
      return result;
    } finally { this.#busy = false; }
  }
  attempt(kind: Kind, input: unknown, capability: unknown): ScopedReceipt {
    const p = this.prepare(kind, input, capability);
    return p.outcome === "MOCK_SCOPED_PREPARED" ? this.commit(kind, p.ticket) : p;
  }
  revoke(kind: "CAPABILITY" | "TASK" | "DESTINATION" | "ACTION", value: unknown) {
    let key: string | undefined;
    if (kind === "CAPABILITY") key = value !== null && typeof value === "object" ? this.#origins.get(value) : undefined;
    else { const p = (kind === "ACTION" ? Actions : Ref).safeParse(value); if (p.success) key = p.data; }
    if (!key) return this.#ownerResult("CAPABILITY_INVALID");
    if (this.#busy) return this.#ownerResult("REENTRANCY_DENIED");
    this.#busy = true;
    try {
      if (this.#state.revision >= Number.MAX_SAFE_INTEGER) return this.#ownerResult("VERSION_EXHAUSTED");
      const next: State = { ...this.#state, revision: this.#state.revision + 1 };
      if (kind === "CAPABILITY") {
        const e = this.#state.entries.get(key); if (!e) return this.#ownerResult("CAPABILITY_INVALID");
        next.entries = new Map(this.#state.entries); next.entries.set(key, { ...e, revoked: true });
      } else {
        const field = kind === "TASK" ? "tasks" : kind === "DESTINATION" ? "destinations" : "actions";
        if (this.#state[field].size >= 4096) return this.#ownerResult("CAPACITY_EXCEEDED");
        if (field === "actions") { next.actions = new Set(this.#state.actions); next.actions.add(key as MockAction); }
        else { next[field] = new Set(this.#state[field]); next[field].add(key); }
      }
      this.#state = next;
      return { outcome: "MOCK_SCOPE_REVOKED" as const, scopeRevision: next.revision, mockOnly: true as const, executionAuthority: false as const };
    } finally { this.#busy = false; }
  }
  authorityChange(input: unknown) {
    let command: unknown; try { command = copyData(input); } catch { return this.#ownerResult("INVALID_AUTHORITY_CHANGE"); }
    if (this.#busy) return this.#ownerResult("REENTRANCY_DENIED");
    this.#busy = true;
    try {
      if (this.#state.revision >= Number.MAX_SAFE_INTEGER) return this.#ownerResult("VERSION_EXHAUSTED");
      const next = { ...this.#state, revision: this.#state.revision + 1 };
      const r = this.#inner.owner.applyChange(command);
      if (r.outcome === "FAKE_AUTHORITY_UPDATED") this.#state = next;
      return r;
    } finally { this.#busy = false; }
  }
  inject(point: unknown): boolean {
    if (this.#busy) return false;
    if (point === "CAPABILITY_CONSUMPTION") { this.#failConsumption = true; return true; }
    return (point === "BEFORE_COMMIT" || point === "PUBLICATION_APPEND") && this.#inner.owner.injectMockFailure(point);
  }
}

/** Dedicated private scope owner composes the canonical R7 authority. Neither
 * R7 nor R6 facades/evidence escape, so scopes cannot change independently of
 * this transaction boundary. Reference identity is local, transferable by a
 * holder, and never cryptographic authentication or a production credential.
 */
export function createScopedCapabilityBoundary(seed: unknown) {
  const s = new ScopedOwner(seed);
  return Object.freeze({
    boundary: Object.freeze({ snapshot: () => s.snapshot(),
      attemptScopedAdmission: (request: unknown, capability: unknown) => s.attempt("ADMISSION", request, capability),
      attemptScopedPublication: (output: unknown, capability: unknown) => s.attempt("PUBLICATION", output, capability),
      prepareAdmission: (request: unknown, capability: unknown) => s.prepare("ADMISSION", request, capability),
      preparePublication: (output: unknown, capability: unknown) => s.prepare("PUBLICATION", output, capability),
      commitAdmission: (ticket: unknown) => s.commit("ADMISSION", ticket), commitPublication: (ticket: unknown) => s.commit("PUBLICATION", ticket) }),
    owner: Object.freeze({ issueCapability: (spec: unknown) => s.issue(spec),
      revokeCapability: (capability: unknown) => s.revoke("CAPABILITY", capability),
      revokeTask: (task: unknown) => s.revoke("TASK", task), revokeDestination: (destination: unknown) => s.revoke("DESTINATION", destination),
      revokeAction: (action: unknown) => s.revoke("ACTION", action), applyAuthorityChange: (change: unknown) => s.authorityChange(change),
      injectFailure: (point: unknown) => s.inject(point) }),
  });
}
