import { z } from "zod";
import { ProjectIdSchema, ReferenceIdSchema } from "../primitives.js";
import { createMockEnforcementBoundary, type MockFixtureSeed, type MockReceipt,
  type MockReason, type MockFailurePoint } from "./mock-enforcement.js";

/** OFFLINE FAKE AUTHORITY ONLY. References prove private object origin within
 * this instance, never real owner/provider/OS authorization or a signature.
 * The R6 controller/owner remain private: all authority changes and inner commits
 * share this synchronous outer boundary, without await or caller callbacks.
 */
const Int = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const Positive = Int.min(1);
const Ref = ReferenceIdSchema;
const Evidence = z.strictObject({
  evidenceId: Ref, authorityInstanceId: Ref, authorityGeneration: Positive,
  subjectId: Ref, projectId: ProjectIdSchema, sessionId: Ref, workerId: Ref, runId: Ref,
  incarnationId: Ref, executionEpoch: Positive, policyVersion: Ref,
  authorizationRevision: Positive, issuedAtMs: Int, expiresAtMs: Int,
});
export type FakeEvidenceReference = Readonly<z.infer<typeof Evidence>>;
export interface AuthoritySeed { authorityInstanceId: string; nowMs: number; fixture: MockFixtureSeed | null }
const Seed = z.strictObject({ authorityInstanceId: Ref, nowMs: Int, fixture: z.unknown().nullable() });
const Admission = z.strictObject({ operationId: Ref, request: z.unknown() });
const Publication = z.strictObject({ operationId: Ref, output: z.unknown() });
const Header = { expectedAuthorityRevision: Int };
const Change = z.discriminatedUnion("kind", [
  z.strictObject({ ...Header, kind: z.enum(["REVOKE_AUTHORIZATION", "CANCEL", "ACTIVATE_SECURITY_STOP", "TERMINATE", "DELETE_RECORD", "RESET_AUTHORITY"]) }),
  z.strictObject({ ...Header, kind: z.literal("ADVANCE_TIME"), nowMs: Int }),
  z.strictObject({ ...Header, kind: z.literal("REVISE_POLICY"), policyVersion: Ref }),
  z.strictObject({ ...Header, kind: z.literal("ADVANCE_EPOCH"), executionEpoch: Positive }),
  z.strictObject({ ...Header, kind: z.literal("TRANSFER_SESSION"), sessionId: Ref }),
  z.strictObject({ ...Header, kind: z.enum(["RECREATE_RECORD", "REINCARNATE_RUN"]), fixture: z.unknown() }),
]);
export type FakeAuthorityChange = z.infer<typeof Change>;
export type AuthorityReason = MockReason | "INVALID_AUTHORITY_STATE" | "AUTHORITY_RECORD_MISSING"
  | "MISSING_EVIDENCE" | "INVALID_EVIDENCE" | "UNKNOWN_AUTHORITY" | "AUTHORITY_GENERATION_MISMATCH"
  | "UNRECOGNIZED_EVIDENCE" | "SUBJECT_CONFLICT" | "INCARNATION_MISMATCH" | "AUTHORIZATION_REVISION_MISMATCH"
  | "EVIDENCE_EXPIRED" | "AUTHORIZATION_REVOKED" | "BINDING_REFRESH_REQUIRED" | "STALE_AUTHORITY"
  | "INVALID_AUTHORITY_CHANGE" | "EPOCH_ROLLBACK" | "AUTHORITY_UPDATED";
type Kind = "ADMISSION" | "PUBLICATION";
export interface AuthorityBinding {
  authorityInstanceId: string; authorityGeneration: number; authorityRevision: number;
  subjectId: string; projectId: string; sessionId: string; workerId: string; runId: string;
  incarnationId: string; executionEpoch: number; policyVersion: string; authorizationRevision: number;
}
export interface AuthorityReceipt {
  readonly outcome: "MOCK_AUTHORITY_RECORDED" | "MOCK_AUTHORITY_DENIED";
  readonly kind: Kind; readonly reason: AuthorityReason; readonly operationId: string | null;
  readonly binding: Readonly<AuthorityBinding> | null;
  readonly consumedAuthorityRevision: number | null;
  readonly provenance: "FAKE_AUTHORITY_PROVENANCE_VERIFIED" | "NOT_VERIFIED";
  readonly boundaryReceipt: MockReceipt | null;
  readonly mockOnly: true; readonly executionAuthority: false;
}
export interface AuthorityPreparation {
  readonly outcome: "FAKE_AUTHORITY_PREPARED"; readonly ticket: object;
  readonly binding: Readonly<AuthorityBinding>; readonly mockOnly: true; readonly executionAuthority: false;
}
type Inner = ReturnType<typeof createMockEnforcementBoundary>;
interface RecordState { inner: Inner; incarnationId: string; authorizationRevision: number;
  window: { issuedAtMs: number; expiresAtMs: number }; heldFixture: MockFixtureSeed | null }
interface State { generation: number; revision: number; nowMs: number; serial: number;
  authorizationRevision: number; stopLatched: boolean; record: RecordState | null; retired: RecordState[] }
interface Pending { kind: Kind; operationId: string; reference: unknown; authorityRevision: number;
  record: RecordState; innerTicket: object }

// R6's ingress copier is deliberately private. This separate bounded copier is
// needed before the outer lock too; no existing source/export is changed.
function copyData(input: unknown): unknown {
  const ancestors = new Set<object>(); let nodes = 0;
  function copy(v: unknown, depth: number): unknown {
    if (++nodes > 50000 || depth > 24) throw new Error("INVALID_DATA");
    if (v === null || typeof v === "boolean") return v;
    if (typeof v === "string" && v.length <= 1024) return v;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v !== "object" || v === null || ancestors.has(v)) throw new Error("INVALID_DATA");
    const array = Array.isArray(v); const proto = Object.getPrototypeOf(v);
    if (array ? proto !== Array.prototype || (v as unknown[]).length > 4096 : proto !== Object.prototype && proto !== null) throw new Error("INVALID_DATA");
    const ds = Object.getOwnPropertyDescriptors(v); const keys = Reflect.ownKeys(ds);
    if (array && keys.length !== (v as unknown[]).length + 1) throw new Error("INVALID_DATA");
    const result = array ? [] : Object.create(null) as Record<string, unknown>;
    ancestors.add(v);
    for (const key of keys) {
      if (typeof key !== "string") throw new Error("INVALID_DATA");
      if (array && key === "length") continue;
      const d = ds[key];
      if (!d || !d.enumerable || !("value" in d) || ["__proto__", "constructor", "prototype"].includes(key) ||
        (array && !/^(0|[1-9][0-9]*)$/.test(key))) throw new Error("INVALID_DATA");
      Object.defineProperty(result, key, { value: copy(d.value, depth + 1), enumerable: true, writable: true, configurable: true });
    }
    ancestors.delete(v); return result;
  }
  return copy(input, 0);
}

class FakeAuthority {
  #id = "invalid-authority";
  #valid = false;
  #busy = false;
  #state: State = { generation: 1, revision: 0, nowMs: 0, serial: 0,
    authorizationRevision: 0, stopLatched: false, record: null, retired: [] };
  #evidence = new Map<string, FakeEvidenceReference>();
  #origins = new WeakMap<object, string>();
  #evidenceSerial = 0;
  #tickets = new WeakMap<object, Pending>();
  constructor(seed: unknown) {
    try {
      const p = Seed.safeParse(copyData(seed)); if (!p.success) return;
      this.#id = p.data.authorityInstanceId;
      this.#state.nowMs = p.data.nowMs;
      if (p.data.fixture !== null) {
        const r = this.#makeRecord(p.data.fixture, 1, 1, p.data.nowMs, false);
        if (!r) return;
        this.#state.record = r; this.#state.serial = 1; this.#state.authorizationRevision = 1;
        this.#state.stopLatched = this.#fixture(r).context.securityStop.state === "ACTIVE";
      }
      this.#valid = true;
    } catch { /* invalid fixture stays unusable; no raw input/error escapes */ }
  }
  #fixture(r: RecordState): MockFixtureSeed {
    return r.heldFixture ? structuredClone(r.heldFixture) : r.inner.boundary.snapshot().fixture!;
  }
  #makeRecord(input: unknown, serial: number, revision: number, nowMs: number, stop: boolean): RecordState | null {
    const initial = createMockEnforcementBoundary(input).boundary.snapshot();
    if (!initial.valid || !initial.fixture) return null;
    const fixture = initial.fixture; fixture.context.nowMs = nowMs;
    if (stop) fixture.context.securityStop = { state: "ACTIVE", clearance: null };
    const inner = createMockEnforcementBoundary(fixture);
    if (!inner.boundary.snapshot().valid) return null;
    return { inner, incarnationId: `fake-incarnation:${serial}`, authorizationRevision: revision,
      window: { issuedAtMs: fixture.context.authorization.evidence?.issuedAtMs ?? 0,
        expiresAtMs: fixture.context.authorization.evidence?.expiresAtMs ?? 0 }, heldFixture: null };
  }
  #binding(): AuthorityBinding | null {
    const s = this.#state; if (!s.record) return null;
    const f = this.#fixture(s.record); const i = f.context.identity;
    return { authorityInstanceId: this.#id, authorityGeneration: s.generation, authorityRevision: s.revision,
      subjectId: i.ownerId, projectId: i.projectId, sessionId: i.sessionId, workerId: i.workerId, runId: i.runId,
      incarnationId: s.record.incarnationId, executionEpoch: f.context.epoch, policyVersion: f.policy.version,
      authorizationRevision: s.record.authorizationRevision };
  }
  snapshot() {
    return { valid: this.#valid, authorityInstanceId: this.#id, authorityGeneration: this.#state.generation,
      authorityRevision: this.#state.revision, nowMs: this.#state.nowMs, binding: this.#binding(),
      requiresRecreation: this.#state.record?.heldFixture !== null && this.#state.record !== null,
      active: this.#state.record?.inner.boundary.snapshot() ?? null,
      currentFixture: this.#state.record ? this.#fixture(this.#state.record) : null,
      retired: this.#state.retired.map(r => ({ incarnationId: r.incarnationId, snapshot: r.inner.boundary.snapshot() })) };
  }
  #receipt(kind: Kind, operationId: string | null, reason: AuthorityReason,
    verified = false): AuthorityReceipt {
    return { outcome: "MOCK_AUTHORITY_DENIED", kind, operationId, reason, binding: this.#binding(),
      consumedAuthorityRevision: null, provenance: verified ? "FAKE_AUTHORITY_PROVENANCE_VERIFIED" : "NOT_VERIFIED",
      boundaryReceipt: null, mockOnly: true, executionAuthority: false };
  }
  #referenceReason(original: unknown, value: unknown): AuthorityReason | null {
    if (!this.#valid) return "INVALID_AUTHORITY_STATE";
    if (original === null || original === undefined) return "MISSING_EVIDENCE";
    const p = Evidence.safeParse(value); if (!p.success) return "INVALID_EVIDENCE";
    const e = p.data; const s = this.#state;
    if (e.authorityInstanceId !== this.#id) return "UNKNOWN_AUTHORITY";
    if (e.authorityGeneration !== s.generation) return "AUTHORITY_GENERATION_MISMATCH";
    if (!s.record) return "AUTHORITY_RECORD_MISSING";
    const b = this.#binding()!;
    if (e.subjectId !== b.subjectId) return "SUBJECT_CONFLICT";
    if (e.projectId !== b.projectId || e.sessionId !== b.sessionId) return "OWNERSHIP_CONFLICT";
    if (e.runId !== b.runId) return "RUN_CONFLICT";
    if (e.workerId !== b.workerId) return "WORKER_CONFLICT";
    if (e.incarnationId !== b.incarnationId) return "INCARNATION_MISMATCH";
    if (e.executionEpoch !== b.executionEpoch) return "STALE_EPOCH";
    if (e.policyVersion !== b.policyVersion) return "POLICY_VERSION_CONFLICT";
    // Runtime origin check: an identical serialized/branded/hashed object from
    // another caller/instance is NOT one of this authority's issued references.
    if (typeof original !== "object" || this.#origins.get(original) !== e.evidenceId || this.#evidence.get(e.evidenceId) !== original) return "UNRECOGNIZED_EVIDENCE";
    const f = this.#fixture(s.record);
    if (f.context.authorization.status === "REVOKED") return "AUTHORIZATION_REVOKED";
    if (s.nowMs < e.issuedAtMs || s.nowMs >= e.expiresAtMs) return "EVIDENCE_EXPIRED";
    if (e.authorizationRevision !== b.authorizationRevision) return "AUTHORIZATION_REVISION_MISMATCH";
    if (s.record.heldFixture) return "BINDING_REFRESH_REQUIRED";
    return null;
  }
  issueEvidence(): FakeEvidenceReference | null {
    if (!this.#valid || this.#busy || !this.#state.record || this.#evidence.size >= 4096 ||
      this.#state.revision >= Number.MAX_SAFE_INTEGER || this.#evidenceSerial >= Number.MAX_SAFE_INTEGER) return null;
    this.#busy = true;
    try {
      const b = this.#binding()!; const w = this.#state.record.window;
      const { authorityRevision: _revision, ...fields } = b;
      const evidence: FakeEvidenceReference = Object.freeze({ ...fields, evidenceId: `fake-evidence:${this.#evidenceSerial + 1}`,
        issuedAtMs: this.#state.nowMs, expiresAtMs: w.expiresAtMs });
      if (this.#state.nowMs < w.issuedAtMs || this.#state.nowMs >= w.expiresAtMs) return null;
      this.#evidence.set(evidence.evidenceId, evidence); this.#origins.set(evidence, evidence.evidenceId);
      this.#evidenceSerial++; this.#state = { ...this.#state, revision: this.#state.revision + 1 };
      return evidence;
    } finally { this.#busy = false; }
  }
  prepare(kind: Kind, input: unknown, reference: unknown): AuthorityPreparation | AuthorityReceipt {
    let operationId: string; let envelope: unknown; let refData: unknown;
    try {
      const p = (kind === "ADMISSION" ? Admission : Publication).safeParse(copyData(input));
      if (!p.success || p.data.operationId.startsWith("r7-control:")) return this.#receipt(kind, null, "INVALID_OPERATION");
      operationId = p.data.operationId;
      envelope = "request" in p.data ? p.data.request : p.data.output;
      refData = reference === undefined || reference === null ? null : copyData(reference);
    } catch { return this.#receipt(kind, null, "INVALID_OPERATION"); }
    if (this.#busy) return this.#receipt(kind, operationId, "REENTRANCY_DENIED");
    this.#busy = true;
    try {
      const reason = this.#referenceReason(reference, refData);
      if (reason) return this.#receipt(kind, operationId, reason);
      const r = this.#state.record!; const version = r.inner.boundary.snapshot().stateVersion;
      const inner = kind === "ADMISSION"
        ? r.inner.boundary.prepareMockAdmission({ operationId, expectedStateVersion: version, request: envelope })
        : r.inner.boundary.prepareMockPublication({ operationId, expectedStateVersion: version, output: envelope });
      if (inner.outcome !== "MOCK_PREPARED") {
        const receipt = this.#receipt(kind, operationId, inner.reason, true);
        return { ...receipt, boundaryReceipt: inner };
      }
      const ticket = Object.freeze({ mockOnly: true, executionAuthority: false });
      this.#tickets.set(ticket, { kind, operationId, reference, authorityRevision: this.#state.revision, record: r, innerTicket: inner.ticket });
      return Object.freeze({ outcome: "FAKE_AUTHORITY_PREPARED", ticket, binding: Object.freeze(this.#binding()!), mockOnly: true, executionAuthority: false });
    } catch { return this.#receipt(kind, operationId, "MOCK_COMMIT_FAILED"); }
    finally { this.#busy = false; }
  }
  commit(kind: Kind, ticket: unknown): AuthorityReceipt {
    if (this.#busy) return this.#receipt(kind, null, "REENTRANCY_DENIED");
    const p = ticket !== null && typeof ticket === "object" ? this.#tickets.get(ticket) : undefined;
    if (!p || p.kind !== kind) return this.#receipt(kind, null, "INVALID_TICKET");
    this.#tickets.delete(ticket as object); this.#busy = true;
    try {
      if (p.authorityRevision !== this.#state.revision || p.record !== this.#state.record) return this.#receipt(kind, p.operationId, "STALE_AUTHORITY");
      // Owned issued references are frozen inert objects: no caller accessor is
      // executed by revalidation while the shared outer transaction is held.
      const reason = this.#referenceReason(p.reference, p.reference);
      if (reason) return this.#receipt(kind, p.operationId, reason);
      // Preallocate the entire outer receipt before the inner linearization.
      // After R6 returns, only ordinary writes to this unexposed plain object
      // remain. No fallible audit append/clone/freeze/callback follows commit.
      const result = { ...this.#receipt(kind, p.operationId, "MOCK_RECORDED", true),
        consumedAuthorityRevision: this.#state.revision as number | null };
      const inner = kind === "ADMISSION" ? p.record.inner.boundary.commitMockAdmission(p.innerTicket)
        : p.record.inner.boundary.commitMockPublication(p.innerTicket);
      result.boundaryReceipt = inner; result.reason = inner.reason;
      result.outcome = inner.outcome.endsWith("_RECORDED") ? "MOCK_AUTHORITY_RECORDED" : "MOCK_AUTHORITY_DENIED";
      if (result.outcome === "MOCK_AUTHORITY_DENIED") result.consumedAuthorityRevision = null;
      return result;
    } finally { this.#busy = false; }
  }
  attempt(kind: Kind, input: unknown, reference: unknown): AuthorityReceipt {
    const p = this.prepare(kind, input, reference);
    return p.outcome === "FAKE_AUTHORITY_PREPARED" ? this.commit(kind, p.ticket) : p;
  }
  change(input: unknown) {
    let c: FakeAuthorityChange;
    try { const p = Change.safeParse(copyData(input)); if (!p.success) return this.#ownerResult("INVALID_AUTHORITY_CHANGE"); c = p.data; }
    catch { return this.#ownerResult("INVALID_AUTHORITY_CHANGE"); }
    if (this.#busy) return this.#ownerResult("REENTRANCY_DENIED");
    this.#busy = true;
    try {
      const s = this.#state;
      if (!this.#valid) return this.#ownerResult("INVALID_AUTHORITY_STATE");
      if (c.expectedAuthorityRevision !== s.revision) return this.#ownerResult("STALE_AUTHORITY");
      if ([s.revision, s.generation, s.serial, s.authorizationRevision].some(v => v >= Number.MAX_SAFE_INTEGER)) return this.#ownerResult("VERSION_EXHAUSTED");
      const next: State = { ...s, revision: s.revision + 1 };
      let control: "REVOKE_AUTHORIZATION" | "CANCEL" | "ACTIVATE_SECURITY_STOP" | "TERMINATE" | "ADVANCE_TIME" | null = null;
      if (c.kind === "RESET_AUTHORITY" || c.kind === "DELETE_RECORD") {
        if (s.record) next.retired = [...s.retired, s.record];
        next.record = null; next.authorizationRevision++;
        if (c.kind === "RESET_AUTHORITY") next.generation++;
      } else if (c.kind === "RECREATE_RECORD" || c.kind === "REINCARNATE_RUN") {
        const r = this.#makeRecord(c.fixture, s.serial + 1, s.authorizationRevision + 1, s.nowMs, s.stopLatched);
        if (!r) return this.#ownerResult("INVALID_AUTHORITY_CHANGE");
        if (s.record) next.retired = [...s.retired, s.record];
        next.record = r; next.serial++; next.authorizationRevision++;
        next.stopLatched = s.stopLatched || this.#fixture(r).context.securityStop.state === "ACTIVE";
      } else if (c.kind === "ADVANCE_TIME") {
        if (c.nowMs < s.nowMs) return this.#ownerResult("TIME_REGRESSION");
        next.nowMs = c.nowMs; if (s.record) control = "ADVANCE_TIME";
        if (s.record?.heldFixture) next.record = { ...s.record, heldFixture: { ...this.#fixture(s.record),
          context: { ...this.#fixture(s.record).context, nowMs: c.nowMs } } };
      } else {
        if (!s.record) return this.#ownerResult("AUTHORITY_RECORD_MISSING");
        next.authorizationRevision++; next.record = { ...s.record, authorizationRevision: next.authorizationRevision };
        if (c.kind === "REVISE_POLICY" || c.kind === "ADVANCE_EPOCH" || c.kind === "TRANSFER_SESSION") {
          // R6 intentionally has no policy/identity/epoch mutation API. Hold this
          // binding until owner supplies a fresh fixture/new incarnation. Never
          // reset its sink or silently reuse its old admission under new policy.
          const f = this.#fixture(s.record);
          if (c.kind === "REVISE_POLICY") { f.policy.version = c.policyVersion; f.context.policyVersion = c.policyVersion; }
          if (c.kind === "ADVANCE_EPOCH") {
            if (c.executionEpoch <= f.context.epoch) return this.#ownerResult("EPOCH_ROLLBACK");
            f.context.epoch = c.executionEpoch;
          }
          if (c.kind === "TRANSFER_SESSION") f.context.identity.sessionId = c.sessionId;
          next.record.heldFixture = f;
        } else { control = c.kind; }
        if (c.kind === "ACTIVATE_SECURITY_STOP") next.stopLatched = true;
      }
      if (control && next.record?.heldFixture) {
        const f = structuredClone(next.record.heldFixture);
        if (control === "REVOKE_AUTHORIZATION") f.context.authorization = { status: "REVOKED", evidence: null };
        if (control === "ACTIVATE_SECURITY_STOP") f.context.securityStop = { state: "ACTIVE", clearance: null };
        if (control === "CANCEL") {
          f.context.cancellation = "REQUESTED";
          if (!["CANCELLED", "COMPLETED", "FAILED", "INTERRUPTED", "APPROVAL_DENIED"].includes(f.context.lifecycle)) f.context.lifecycle = "CANCELLATION_REQUESTED";
        }
        if (control === "TERMINATE") f.context.lifecycle = "COMPLETED";
        if (control === "ADVANCE_TIME") f.context.nowMs = next.nowMs;
        next.record = { ...next.record, heldFixture: f };
      }
      const result = { outcome: "FAKE_AUTHORITY_UPDATED" as "FAKE_AUTHORITY_UPDATED" | "FAKE_AUTHORITY_CHANGE_DENIED",
        reason: "AUTHORITY_UPDATED" as AuthorityReason, authorityRevision: next.revision, mockOnly: true as const, executionAuthority: false as const };
      if (control && s.record) {
        const b = s.record.inner.boundary.snapshot();
        const command = { operationId: `r7-control:${next.revision}`, expectedStateVersion: b.stateVersion, kind: control };
        const r = s.record.inner.owner.applyMockControl(control === "ADVANCE_TIME" ? { ...command, nowMs: next.nowMs } : command);
        if (r.outcome !== "MOCK_CONTROL_RECORDED") return this.#ownerResult(r.reason);
      }
      this.#state = next;
      return result;
    } finally { this.#busy = false; }
  }
  #ownerResult(reason: AuthorityReason) {
    return { outcome: "FAKE_AUTHORITY_CHANGE_DENIED" as const, reason, authorityRevision: this.#state.revision,
      mockOnly: true as const, executionAuthority: false as const };
  }
  injectFailure(point: MockFailurePoint): boolean {
    return !this.#busy && this.#state.record !== null && this.#state.record.inner.owner.injectMockFailure(point);
  }
}

/** Only owner holds seed mutation/issuance controls. Adapter exposes no R6 facade
 * or policy setter. Snapshot/reference copies do not acquire runtime provenance.
 */
export function createFakeAuthorityAdapter(seed: unknown) {
  const state = new FakeAuthority(seed);
  return Object.freeze({
    adapter: Object.freeze({
      snapshot: () => state.snapshot(),
      attemptAuthorityBackedMockAdmission: (request: unknown, reference: unknown) => state.attempt("ADMISSION", request, reference),
      attemptAuthorityBackedMockPublication: (output: unknown, reference: unknown) => state.attempt("PUBLICATION", output, reference),
      prepareAdmission: (request: unknown, reference: unknown) => state.prepare("ADMISSION", request, reference),
      preparePublication: (output: unknown, reference: unknown) => state.prepare("PUBLICATION", output, reference),
      commitAdmission: (ticket: unknown) => state.commit("ADMISSION", ticket),
      commitPublication: (ticket: unknown) => state.commit("PUBLICATION", ticket),
    }),
    owner: Object.freeze({ issueEvidence: () => state.issueEvidence(), applyChange: (change: unknown) => state.change(change),
      injectMockFailure: (point: MockFailurePoint) => state.injectFailure(point) }),
  });
}
