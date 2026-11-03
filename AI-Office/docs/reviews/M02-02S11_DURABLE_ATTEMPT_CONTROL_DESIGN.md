# M02-02S11 — Durable Attempt Control Design

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Status: **DESIGN ACCEPTED — implementation-ready specification, awaiting Owner review**. Companion: [Design Gate Matrix](M02-02S11_DESIGN_GATE_MATRIX.md). Semua SQL/pseudocode di bawah **NONEXECUTED PROPOSAL**, bukan migration atau current implementation.

## 1. Executive decision

Pilih **Option A: per-project durable authority dalam backend-owned project SQLite yang sama dengan authoritative Project State**. Proposed DurableAttemptAuthority adalah satu logical authority per project; beberapa future controller connections/processes memakai transaksi database yang sama, bukan beberapa independent truth stores.

Baseline desain: rollback journal **DELETE + synchronous=EXTRA**, short BEGIN IMMEDIATE, version/generation CAS, append-only event plus projection dalam satu commit; satu conflicting attempt per project. Cancellation/timeout intent yang commit lebih dulu menghalangi subsequent success. Lease expiry tidak membuktikan exit. Unknown process/effects tetap quarantine, tanpa automatic worker retry.

Output boundary awal berupa **attempt/generation staging → host-owned immutable artifact → atomic database manifest reference**. Direct writes ke canonical project tidak diotorisasi oleh generation token. Production worker tetap **BLOCKED**. Desain tidak mengimplementasikan authority, schema, OS broker atau adapter.

## 2. Scope and non-goals

S11 hanya source/document review dan dua Markdown reports. Zero MXC/sandbox/worker/app-server launch, simulation, SQL execution, live DB access/write/migration, production source/test/package edit, auth/inference, paid API/credits atau security changes. PowerShell read-only inspection/hashing dan official-document retrieval adalah audit/research, bukan lifecycle/network experiment.

Acceptance ini menyelesaikan desain controller; tidak mengklaim OS crash durability, forced tree cleanup, real custody, runtime approvals, subscription atau billing enforcement. Design decisions dapat direview Owner sebelum implementation; tidak ada perubahan arsitektur irreversible yang dijalankan.

## 3. Current AI OFFICE architecture inventory

Classification: **P** implemented production-oriented foundation; **F** fixture-only implementation; **C** descriptive contract; **D** documented/not implemented; **M** missing runtime capability. P tidak berarti production worker ready.

| Actual path/symbol | Class | Existing evidence / scope | Gap / proposed relationship |
|---|---|---|---|
| [contracts/project.ts](../../src/contracts/project.ts): ProjectIdentitySchema, ProjectOperationScopeSchema, WorkspaceBindingRefSchema | C | UUID portable; binding/generation references; schema validity is not backend issuance. | Resolve through backend, never client root/current UI selection. |
| [workspace/registry.ts](../../src/server/workspace/registry.ts): ProjectRegistry.acquire/verify/byProject/byRoot/close | P | Canonical root/fileKey binding, sealed JSON, exclusive writer.lock; stale lock requires review. | Registry remains identity/location authority, not attempt owner. |
| [workspace/manager.ts](../../src/server/workspace/manager.ts): authorize/attach/stateContext/close | P | Backend-issued foreground-independent operation context, serial lifecycle. | Future runtime uses explicit bound context, not foreground UI. |
| [state/service.ts](../../src/server/state/service.ts): ProjectStateService.forFixtures/issueContext/load/seedDemo | F | WeakSet issued capability, verified registry association, fixture root guard. | No general production state lifecycle yet. |
| [state/storage.ts](../../src/server/state/storage.ts): StateStorage.databasePath/index/begin/complete | F | Backend app-data projects/UUID/project.db; initialization ledger only. Rejects -journal/-wal/-shm. | Needs separately reviewed SQLite sidecar/open lifecycle before concurrent controllers. |
| [state/database.ts](../../src/server/state/database.ts): useDatabase/transaction/verifyDatabase | F | node:sqlite DatabaseSync; timeout25; DELETE/FULL; BEGIN IMMEDIATE; read snapshots; quick_check/FK/version checks. | Current helper resets pragmas per write, masks extended error codes, no durable attempt tables. |
| [state/schema.ts](../../src/server/state/schema.ts): SCHEMA_V1 | F | project_header, knowledge, tasks, events; task/event source must equal demo. | Cannot treat demo task as coding authorization. |
| [contracts/demo.ts](../../src/contracts/demo.ts): DemoTaskSchema/ProjectSnapshotSchema | C | Demo IDs/events/state only. | Production task contract and observation mapping are future dependencies. |
| [runtime-security/context.ts](../../src/server/runtime-security/context.ts): AttemptDescriptorSchema, SyntheticContextAuthority.issue/assert/revoke | F | Immutable scoped descriptor; synchronous reservation and final publication; expiry/revoke checks. | RAM/one authority instance; no cross-process lease. |
| [runtime-security/journal.ts](../../src/server/runtime-security/journal.ts): FixtureAttemptJournal.open/save/transition/reconcile | F | wx writer lock/token, checksums/seal, temp sync/rename, versioned history, fail-closed reopen. | Fixture JSON, no transactional task/attempt coupling, stale crash lock takeover not implemented. |
| [runtime-security/supervisor.ts](../../src/server/runtime-security/supervisor.ts): SyntheticSecurityHarness.dispatch/cancel/finish | F | Fixed probe, nonce/ChildProcess tracking, startup timeout2500ms, cancellation escalation250ms, cleanup bound5000ms. | Not application-imported production supervisor; no overall live-work lease/Job Object authority. |
| [runtime-security/approval.ts](../../src/server/runtime-security/approval.ts): SyntheticApprovals.request/decide/consume/revoke | F | Trusted controller object, scoped fingerprint/expiry/one-shot consume. | No durable Owner authentication/runtime approval bridge. |
| [runtime-security/policy.ts](../../src/server/runtime-security/policy.ts): HostPathPolicy.evaluate | F | Canonical scope/fingerprint and generation checks. | Does not physically stop direct worker I/O. |
| [server/index.ts](../../src/server/index.ts): startBackend/main/close | P/F | Registry acquired before HTTP; state only if fixtureState; owned shutdown closes HTTP/manager; no runtime drain. | Recovery/startup gate must precede future dispatch; do not extend SIGTERM handling into a Windows safety guarantee. |
| [server/policy.ts](../../src/server/policy.ts): SERVER_POLICY | C | Fixed foundation policy, no executable enable route. | Worker remains disabled until all activation gates pass. |
| Runtime adapter, renewable durable lease, actual cancel API, production recovery | D/M | S10 identifies NOT IMPLEMENTED/NOT VERIFIED; no implementation found in inspected modules. | Proposed here only. |

Tests reviewed read-only: tests/integration/runtime-security/{context,journal,restart,process,approval,policy}.test.ts and state/{sqlite,failures,service,process}.test.ts. Existing SQLite tests cover bound SQL/rollback/FK/reopen/BUSY, not this proposed multi-instance protocol. All historical results remain historical; no tests rerun in S11.

## 4. Existing synthetic authority and journal findings

[R1](M02-02R1_ATOMIC_ISSUANCE_REPORT.md) established synchronous check/reserve before await and final owner/expiry check before publish. One authority instance cannot publish competing contexts for the same ID; separate instances have separate Maps. Post-binding failure retains tombstone; pre-binding rejected input may be corrected. Not a shared durable lease.

Fixture journal serializes object-local writes and holds wx writer.lock; validates checksum/history/seal and interrupted .tmp evidence. Reopen converts unresolved work to UNCERTAIN/RECONCILIATION_REQUIRED, with explicit reconcile call. A genuine hard crash can retain the lock; existing controlled restart is not proof of automatic crash takeover.

Existing phases: CREATED, APPROVAL_PENDING, APPROVAL_GRANTED, APPROVAL_DENIED, LAUNCHING, RUNNING, CANCELLATION_REQUESTED, COMPLETED, FAILED, INTERRUPTED, UNCERTAIN, RECONCILIATION_REQUIRED. Cancelled means INTERRUPTED plus reason CANCELLED. Existing CANCELLATION_REQUESTED→COMPLETED edge is **not adopted** for the stricter proposed production cancellation policy (§12); no source changed.

## 5. Production gaps from S10

[S10 report](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md)/[matrix](M02-02S10_RECOVERY_GATE_MATRIX.md): one MXC command/one cooperative child, A allow/B EPERM, ordered file cancellation/clean exits, seven sequential synthetic replays, zero retry. Durable lease, stale-owner fencing, transactional production terminal commit, real runtime cancel, host crash and forced tree cleanup remain gaps.

[M02-02 harness](M02-02_SECURITY_HARNESS_REPORT.md), [runtime gates](M02-02_RUNTIME_GATE_MATRIX.md), [S5R2](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md), [S6](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md), [S8](M02-02S8_CHILD_NETWORK_INHERITANCE_REPORT.md) and [S9](M02-02S9_FUTURE_FILE_TIMING_REPORT.md) were reviewed. Their scoped OS/network/fixture evidence is not upgraded to production recovery. S9 found no current glob-only dependency; future secrets must not rely on filename patterns.

## 6. Authoritative host boundary

**Proposed DurableAttemptAuthority** is a backend service boundary, not a created class/file. It alone writes authority tables through a narrow repository; workers receive no database/storage credential or direct SQL API. Owner identity is authenticated at the host control boundary; model text, a UUID, worker completion or serialized client context cannot grant authority.

Inputs: backend-verified project identity/root/fileKey and opaque binding; immutable task snapshot/version; allowlisted runtime; reviewed permission/action fingerprint; required Owner decisions; host lifetime identity; database incarnation. Before each grant, bind identity again. UI may switch A→B without rebinding an existing A attempt.

Commands: issue, approve, consumeLaunchPermit, renew, acceptStopIntent, observeProcess, commitTerminal, quarantine, reconcile, authorizeRetry. Worker messages are bounded untrusted observations; host correlates invocation/process evidence and validates current tuple before authoritative mutation. Runtime, scopes, billing route and approvals cannot be substituted by a model.

Separate host roles: EXECUTION_OWNER proves current owner tuple/private possession for renew/launch/normal result; OWNER_CONTROL authenticates the human decision for stop/approval/retry independently of the executor's consent; SAFETY_OBSERVER holds authenticated backend/project-binding authority only to record uncertainty/open a case with expected generation/version, never to change owner, release a hold, publish or execute; RECOVERY_OWNER requires the explicit case grant/new fenced epoch. Safety quarantine need not obtain the expired executor's nonce, but still checks current identity/incarnation/old epoch/version. Worker input cannot acquire any of these host roles.

Trusted host components/SQLite integrity are assumptions. This design does not resist an administrator or same-user adversary that can edit backend authority storage. Worker exclusion from private storage is a separate mandatory OS gate.

## 7. Storage topology alternatives

| Option | Benefit | Cost/risk | Decision |
|---|---|---|---|
| A: per-project DB, same Project State database | One transaction for attempt/events/task projection; natural UUID isolation; no cross-DB owner split. | Discover projects, unavailable DB, cross-project scheduling and archive/restore require explicit gates. | **Preferred**. |
| B: separate host runtime authority DB | Central inventory/startup/scheduling. | Attempt ownership and task state cross DB; requires outbox/inbox/dedup/compensation, extra privileged store/backup policy. | Not selected. |
| C: hybrid ownership stores | Can optimize discovery. | Risk dual owner truth and distributed commit complexity. | Not selected. Advisory caches allowed, never grant authority. |

[SQLite WAL](https://www.sqlite.org/wal.html) documents that transactions over attached WAL databases are not atomic as a whole. No ATTACH/cross-database atomicity assumption is used, even though initial journal mode here is rollback.

## 8. Recommended storage topology

One backend-owned project.db per UUID contains tasks plus runtime authority/event tables. Canonical project files are elsewhere; logical .ai-office ownership is not proof that worker can safely access a DB. Current StateStorage app-data placement is a layout reference, not verified production custody.

One host controller may supervise multiple project DBs. Separate instances may arbitrate the **same canonical DB** by SQLite transactions; no global task/attempt owner DB. The registry lists known projects and immutable identity bindings; StateStorage index only records initialization. Cache/UI/global active inventory is advisory and never unlocks a project.

Existing ProjectRegistry exclusive writer.lock still excludes two ordinary startBackend instances using one app-data root. Do not delete/steal it to enable concurrency. Future controller clients must obtain authenticated bound capabilities from the registry-owning backend; after its loss, identity issuance stays blocked pending reviewed recovery. S12 independent process/connection tests use isolated synthetic bindings, not a claim that current full backends are multi-instance enabled.

For missing/corrupt/unregistered DB: project dispatch stays disabled; do not create an empty replacement or trust cache. Other projects can operate only under their own healthy authority and verified independent scopes. Archive/delete first sets durable maintenance flag; active/quarantined conflict holds prevent movement/destruction.

Supported backup/restore is **offline, Owner-approved and quiescent**: close all old process/effect cases, consistent backup, inspect imported state, rotate authority_incarnation, invalidate prior approvals/session grants and generate new host identity. Never resume imported work. An uncontrolled file rollback may be undetectable from DB alone; unsupported restore/uncertain provenance blocks activation. Every new host lifetime starts with dispatch OFF until process/output reconciliation and a fresh activation grant, even if restored rows appear terminal/empty. No liveness promise is made when previous processes cannot be accounted for.

## 9. Attempt identity specification

Stored camelCase retains existing projectId/taskId/attemptId terminology. UUID fields are host-generated, validated; SQL TEXT does not itself prove UUID validity. UTC milliseconds are audit timestamps; monotonic runtime deadlines are separate (§14).

| Fields | Nullability / mutability | Meaning |
|---|---|---|
| projectId, taskId, attemptId, authorityIncarnation, issueRequestId, issueDigest, executionMode | NOT NULL, immutable | Project/task identity; stable request replay; synthetic versus future runtime. |
| bindingId, bindingGeneration, projectFileKey, executionScopeId, runtimeKind, actionDigest | NOT NULL, immutable | Backend-resolved scope/runtime/action snapshot. |
| attemptGeneration | NOT NULL positive, increase only in explicit owner-change transaction | Current authority epoch, not task retry count or workspace-binding generation. |
| hostInstanceId, ownerId, ownerNonceHash, ownerMode | NOT NULL; change together with generation only | Backend lifetime, logical controller, private possession proof; EXECUTION or RECOVERY. Raw nonce not logged. |
| stateVersion, phase, heartbeatSequence | NOT NULL; version increments on each authoritative mutation | CAS and per-attempt total event order. |
| leaseStartedAtMs, leaseDeadlineMs, lastHeartbeatAtMs, clockDomainId | Initial nonnull except lastHeartbeat; fenced renewals only | Durable audit/candidate classification; not proof process alive/stopped. |
| invocationId, invocationNonceHash, launchGeneration | NULL until LAUNCHING, immutable thereafter | One OS/runtime invocation, distinct from owner nonce/generation. |
| launchConsumed | NOT NULL 0→1 once, never reset | At-most-one local launch-permit consumption for this attempt. |
| timeoutPolicyDigest, readyTimeoutMs, maxRuntimeMs, stopGraceMs | NOT NULL, immutable approved limits | Distinct from renewable ownership lease; no silent runtime extension. |
| launchCommittedAtMs, runDeadlineMs, stopDeliveryDeadlineMs, stopClosureDeadlineMs | NULL until launch/stop, then persisted once | Audit/recovery deadlines mapped to local monotonic timers; not OS exit proof. |
| cancelRequestId, stopReason, cancelState | NULL/NONE initially, then monotone | First durable stop intent; cancel request is not terminal. |
| terminalReceiptId, terminalDigest, terminalPayload, outcomeReason | NULL until terminal, write once | Normalized idempotent host commit. |
| conflictHeld, closureDigest, outputManifestDigest | Hold initially1; release only with verified closure | Unknown old work blocks replacement even if terminal. |
| createdAtMs, updatedAtMs | NOT NULL; creation immutable | Audit, not lease authority clock. |

Primary/unique/FK details are §10. Global UUID collision is rejected, not resolved by overwrite. Same issueRequestId+same digest returns prior attempt; same ID/different payload is conflict. Every retry of external work uses **new attemptId/new scope/new invocation**; ownership reassignment of the same attempt only recovers/reconciles and never clears launchConsumed.

Current DemoTaskSchema/source=demo cannot authorize coding. S12 may persist **synthetic** attempts linked to fixture demo task IDs without dispatch or changing demo task states. Future executionMode=runtime requires separately approved production task contract/snapshot integration; absence fails closed. This is a specified dependency, not a hidden migration of demo contracts.

## 10. Proposed SQL schema

**ILLUSTRATIVE, NONEXECUTED DDL.** Assumes existing project_header(projectId UNIQUE) and tasks(projectId,taskId PRIMARY KEY). Seven new conceptual entities; existing tables/contracts remain untouched in S11. Runtime task-projection eligibility is enforced by host contract; DDL linkage is not execution authorization.

~~~sql
CREATE TABLE runtime_control_meta (
  projectId TEXT PRIMARY KEY REFERENCES project_header(projectId),
  authorityIncarnation TEXT NOT NULL,
  controlVersion INTEGER NOT NULL CHECK(controlVersion > 0),
  lifecycle TEXT NOT NULL CHECK(lifecycle IN ('OPEN','ARCHIVING','QUARANTINED')),
  schemaRevision INTEGER NOT NULL CHECK(schemaRevision = 1)
) STRICT;

CREATE TABLE runtime_attempts (
  attemptId TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  taskId TEXT NOT NULL,
  authorityIncarnation TEXT NOT NULL,
  issueRequestId TEXT NOT NULL,
  issueDigest TEXT NOT NULL CHECK(length(issueDigest)=64),
  executionMode TEXT NOT NULL CHECK(executionMode IN ('synthetic','runtime')),
  bindingId TEXT NOT NULL,
  bindingGeneration INTEGER NOT NULL CHECK(bindingGeneration > 0),
  projectFileKey TEXT NOT NULL,
  executionScopeId TEXT NOT NULL UNIQUE,
  runtimeKind TEXT NOT NULL,
  actionDigest TEXT NOT NULL CHECK(length(actionDigest)=64),
  timeoutPolicyDigest TEXT NOT NULL CHECK(length(timeoutPolicyDigest)=64),
  readyTimeoutMs INTEGER NOT NULL CHECK(readyTimeoutMs > 0),
  maxRuntimeMs INTEGER NOT NULL CHECK(maxRuntimeMs > 0),
  stopGraceMs INTEGER NOT NULL CHECK(stopGraceMs > 0),
  launchCommittedAtMs INTEGER,
  runDeadlineMs INTEGER,
  stopDeliveryDeadlineMs INTEGER,
  stopClosureDeadlineMs INTEGER,
  attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration > 0),
  hostInstanceId TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  ownerNonceHash TEXT NOT NULL CHECK(length(ownerNonceHash)=64),
  ownerMode TEXT NOT NULL CHECK(ownerMode IN ('EXECUTION','RECOVERY')),
  phase TEXT NOT NULL CHECK(phase IN (
    'CREATED','APPROVAL_PENDING','APPROVAL_GRANTED','APPROVAL_DENIED',
    'LAUNCHING','RUNNING','CANCELLATION_REQUESTED','COMPLETED','FAILED',
    'INTERRUPTED','UNCERTAIN','RECONCILIATION_REQUIRED')),
  stateVersion INTEGER NOT NULL CHECK(stateVersion > 0),
  leaseStartedAtMs INTEGER NOT NULL,
  leaseDeadlineMs INTEGER NOT NULL,
  lastHeartbeatAtMs INTEGER,
  heartbeatSequence INTEGER NOT NULL CHECK(heartbeatSequence >= 0),
  clockDomainId TEXT NOT NULL,
  invocationId TEXT UNIQUE,
  invocationNonceHash TEXT,
  launchGeneration INTEGER,
  launchConsumed INTEGER NOT NULL DEFAULT 0 CHECK(launchConsumed IN (0,1)),
  cancelRequestId TEXT UNIQUE,
  stopReason TEXT CHECK(stopReason IN ('OWNER_CANCELLED','TIMED_OUT')),
  cancelState TEXT NOT NULL DEFAULT 'NONE' CHECK(cancelState IN (
    'NONE','INTENT_COMMITTED','DELIVERY_OBSERVED','ACK_OBSERVED',
    'EXIT_CONFIRMED','FINALIZED')),
  terminalReceiptId TEXT UNIQUE,
  terminalDigest TEXT,
  terminalPayload TEXT,
  outcomeReason TEXT,
  conflictHeld INTEGER NOT NULL DEFAULT 1 CHECK(conflictHeld IN (0,1)),
  closureDigest TEXT,
  outputManifestDigest TEXT,
  createdAtMs INTEGER NOT NULL,
  updatedAtMs INTEGER NOT NULL,
  UNIQUE(projectId,attemptId),
  UNIQUE(projectId,taskId,issueRequestId),
  UNIQUE(projectId,attemptId,invocationId),
  FOREIGN KEY(projectId,taskId) REFERENCES tasks(projectId,taskId),
  FOREIGN KEY(projectId) REFERENCES runtime_control_meta(projectId),
  FOREIGN KEY(projectId,attemptId,attemptGeneration)
    REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK(leaseDeadlineMs >= leaseStartedAtMs),
  CHECK((launchConsumed=0 AND invocationId IS NULL
         AND invocationNonceHash IS NULL AND launchGeneration IS NULL)
     OR (launchConsumed=1 AND invocationId IS NOT NULL
         AND invocationNonceHash IS NOT NULL AND launchGeneration IS NOT NULL)),
  CHECK((cancelRequestId IS NULL AND stopReason IS NULL AND cancelState='NONE')
     OR (cancelRequestId IS NOT NULL AND stopReason IS NOT NULL AND cancelState<>'NONE')),
  CHECK((phase IN ('COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED')
         AND terminalReceiptId IS NOT NULL AND terminalDigest IS NOT NULL
         AND terminalPayload IS NOT NULL AND outcomeReason IS NOT NULL)
     OR (phase NOT IN ('COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED')
         AND terminalReceiptId IS NULL AND terminalDigest IS NULL
         AND terminalPayload IS NULL AND outcomeReason IS NULL)),
  CHECK(phase<>'COMPLETED' OR
        (cancelRequestId IS NULL AND outputManifestDigest IS NOT NULL)),
  CHECK(conflictHeld=1 OR
        (closureDigest IS NOT NULL AND
         phase IN ('COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED')))
) STRICT;
CREATE UNIQUE INDEX runtime_project_conflict
  ON runtime_attempts(projectId) WHERE conflictHeld=1;
CREATE INDEX runtime_attempt_recovery
  ON runtime_attempts(projectId,phase,leaseDeadlineMs);

CREATE TABLE runtime_owner_epochs (
  projectId TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration > 0),
  hostInstanceId TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  ownerNonceHash TEXT NOT NULL,
  ownerMode TEXT NOT NULL CHECK(ownerMode IN ('EXECUTION','RECOVERY')),
  acquiredAtMs INTEGER NOT NULL,
  PRIMARY KEY(projectId,attemptId,attemptGeneration),
  FOREIGN KEY(projectId,attemptId)
    REFERENCES runtime_attempts(projectId,attemptId)
) STRICT;

CREATE TABLE runtime_attempt_events (
  eventId TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  attemptGeneration INTEGER NOT NULL,
  priorVersion INTEGER NOT NULL CHECK(priorVersion >= 0),
  newVersion INTEGER NOT NULL CHECK(newVersion=priorVersion+1),
  eventType TEXT NOT NULL,
  payloadVersion INTEGER NOT NULL CHECK(payloadVersion=1),
  writerHostInstanceId TEXT NOT NULL,
  idempotencyKey TEXT NOT NULL,
  atMs INTEGER NOT NULL,
  payload TEXT NOT NULL,
  payloadDigest TEXT NOT NULL CHECK(length(payloadDigest)=64),
  previousEventDigest TEXT,
  eventDigest TEXT NOT NULL CHECK(length(eventDigest)=64),
  UNIQUE(projectId,attemptId,newVersion),
  UNIQUE(projectId,attemptId,idempotencyKey),
  FOREIGN KEY(projectId,attemptId,attemptGeneration)
    REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration)
) STRICT;

CREATE TABLE runtime_cancel_requests (
  requestId TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  intentGeneration INTEGER NOT NULL,
  issuerDecisionId TEXT NOT NULL,
  requestDigest TEXT NOT NULL,
  reason TEXT NOT NULL CHECK(reason IN ('OWNER_CANCELLED','TIMED_OUT')),
  authorizedAtMs INTEGER NOT NULL,
  UNIQUE(projectId,attemptId),
  FOREIGN KEY(projectId,attemptId,intentGeneration)
    REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration)
) STRICT;

CREATE TABLE runtime_process_receipts (
  receiptId TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  invocationId TEXT NOT NULL,
  launchGeneration INTEGER NOT NULL,
  observerGeneration INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('LAUNCHER','PARENT','CHILD','SCOPE')),
  observationSequence INTEGER NOT NULL CHECK(observationSequence > 0),
  processKey TEXT NOT NULL,
  pid INTEGER,
  creationTicks TEXT,
  executableDigest TEXT,
  observedState TEXT NOT NULL CHECK(observedState IN (
    'CREATED','RUNNING','EXITED','NOT_OBSERVABLE','IDENTITY_MISMATCH','SCOPE_CLOSED')),
  evidenceDigest TEXT NOT NULL,
  observedAtMs INTEGER NOT NULL,
  UNIQUE(projectId,attemptId,processKey,observationSequence),
  FOREIGN KEY(projectId,attemptId,invocationId)
    REFERENCES runtime_attempts(projectId,attemptId,invocationId),
  FOREIGN KEY(projectId,attemptId,launchGeneration)
    REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration),
  FOREIGN KEY(projectId,attemptId,observerGeneration)
    REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration)
) STRICT;

CREATE TABLE runtime_recovery_cases (
  caseId TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  stateVersion INTEGER NOT NULL CHECK(stateVersion > 0),
  reason TEXT NOT NULL,
  classification TEXT NOT NULL,
  openedAtMs INTEGER NOT NULL,
  closedAtMs INTEGER,
  closureEvidenceDigest TEXT,
  ownerDecisionId TEXT,
  recoveryGrantDigest TEXT,
  recoveryGrantExpiresAtMs INTEGER,
  retryDecisionId TEXT UNIQUE,
  retryAttemptId TEXT UNIQUE,
  retryConsumedAtMs INTEGER,
  FOREIGN KEY(projectId,attemptId)
    REFERENCES runtime_attempts(projectId,attemptId),
  FOREIGN KEY(projectId,retryAttemptId)
    REFERENCES runtime_attempts(projectId,attemptId)
) STRICT;
CREATE UNIQUE INDEX runtime_one_open_recovery_case
  ON runtime_recovery_cases(projectId,attemptId) WHERE closedAtMs IS NULL;
~~~

The circular attempt→current epoch FK is deferred; insert attempt then epoch then event **in one transaction**. Do not commit a missing epoch. Epoch identity must exactly match the current attempt tuple; repository assertions plus migration-reviewed guards enforce it. Cancel pointer consistency with its immutable request and event chain is a repository commit invariant; terminal rows cannot have an unpaired request.

| Entity | Authority / updates / indexes | Retention and sensitivity |
|---|---|---|
| control_meta | One project incarnation/lifecycle; maintenance CAS controlVersion. | Host-private; retain identity/restore audit. |
| attempts | Current projection; immutable identity; CAS mutable phase/lease/version/current owner. Partial unique project conflict barrier. | Retain terminal/idempotency tombstones and unresolved holds; no live-row deletion to retry. |
| owner_epochs | Append-only owner history; PK epoch and FK attempt. | Nonce hash, host identity; no raw secrets/handles. |
| attempt_events | Append-only; version/idempotency uniqueness and payload/hash validation. | Bounded sanitized payload, no prompts/auth/secret env; retain unresolved and terminal lineage. |
| cancel_requests | Immutable one canonical stop request per attempt, survives epoch change. | Authenticated issuer decision reference; not model text. |
| process_receipts | Append-only host observations, PK/dedup index; index attempt/role/time added if profiling justifies. | Private process/path references and evidence digest; no raw auth argv/handle numbers. |
| recovery_cases | Version-CAS case decision; retry grant consumed once with new attempt. | Retain unresolved indefinitely; delete/archive only explicit retention procedure after evidence closure. |

No SQL FK enforces host authentication, real process exit, hash authenticity or OS fencing. Required migration guards: immutable identity tuple; generation cannot decrease or change without matching new epoch; launchConsumed cannot decrease; terminal phase/receipt/digest cannot change; events/epochs/cancel/process observations append-only. Metadata-only events after terminal may release a proven conflict hold while keeping terminal identity/outcome unchanged. All such changes still append exactly one next-version event atomically.

## 11. State-machine specification

**Proposed policy**, reusing existing names; not current fixture edge behavior. For every row: expected project/incarnation/version/current epoch required; execution-owner mutations additionally require live lease/clock/nonce. Recovery actor requires authenticated recovery grant and CAS. All transitions append event and projection update in one transaction.

| From → To | Actor / prerequisites | Event / deadline / terminal / retry |
|---|---|---|
| absent→CREATED | Host issue; validated task/binding, free conflict slot, unique request; gen1/EXECUTION owner. | ATTEMPT_ISSUED; v1; nonterminal; no spawn. |
| CREATED→APPROVAL_PENDING | Current owner; frozen action/permission digest. | APPROVAL_REQUESTED; expiry bounded; no retry action. |
| APPROVAL_PENDING→APPROVAL_GRANTED | Host validates explicit Owner decision/action/epoch/expiry. | APPROVAL_GRANTED; no spawn yet. |
| APPROVAL_PENDING→APPROVAL_DENIED | Host valid DENY; launchConsumed0/absence guaranteed. | Terminal APPROVAL_DENIED receipt; closure hold release; new approval/new attempt required later. |
| APPROVAL_GRANTED→LAUNCHING | Current owner, fresh approval/launch gates; launchConsumed0 CAS→1, immutable invocation attached. | LAUNCH_PERMIT_CONSUMED; persisted before OS call; readiness deadline. |
| LAUNCHING→RUNNING | Host-owned process handshake/OS scope evidence; approval/action unchanged, no stop intent. | PROCESS_READY; never inferred from PID alone. |
| LAUNCHING→FAILED | Definitive broker proof no process created/side effect, start failed. | Terminal START_FAILED; missing receipt instead→UNCERTAIN. |
| RUNNING→COMPLETED | No stop intent; all required process/scope exits and result validation; immutable artifacts ready. | Terminal NORMAL; manifest pointer/eligible task CAS same transaction. |
| RUNNING→FAILED | No prior stop intent; proven failed exit and classified effects/scope closure. | Terminal UNEXPECTED or validated failure reason; no auto retry. |
| CREATED/PENDING/GRANTED→INTERRUPTED | Valid stop intent plus unconsumed launch permit; same transaction excludes later launch CAS. | Stop request + terminal event/receipt; no runtime ack needed because no spawn possible. |
| LAUNCHING/RUNNING→CANCELLATION_REQUESTED | First valid Owner cancel or timeout intent commits. | STOP_INTENT_COMMITTED; success now prohibited; delivery/exit deadlines. |
| CANCELLATION_REQUESTED→INTERRUPTED | Complete host process/scope closure and effects classification. | Terminal CANCELLED/TIMED_OUT (proposed reason); ack alone insufficient. |
| Any unresolved nonterminal→UNCERTAIN | Expired/lost lease, clock anomaly, broken identity/protocol or unknown effects. | UNCERTAINTY_RECORDED; preserve hold/stop intent; no replacement. |
| UNCERTAIN→RECONCILIATION_REQUIRED | Recovery grant; CAS fence to new RECOVERY epoch; never grant launch permit. | OWNER_FENCED + recovery event, separately versioned if two mutations. |
| RECONCILIATION_REQUIRED→FAILED/INTERRUPTED | Explicit Owner reconciliation + verified scope/effect closure. | CONTROLLER_RECONCILED receipt; no automatic success or worker retry. |
| terminal→same terminal metadata | Authorized hold-release/retention audit only; receipt unchanged. | CONFLICT_HOLD_RELEASED; no terminal→running or terminal outcome rewrite. |

APPROVAL_PENDING/APPROVAL_GRANTED are shortened as PENDING/GRANTED only in table text. Self-phase heartbeat/observation events increment version; they do not invent state names. No ISSUED/STARTING/SUCCEEDED/CANCELLED/TIMED_OUT phase is added. TIMED_OUT is a **proposed outcome reason**, distinct from existing OutcomeSchema; timeout may coexist with unknown live process, so remains nonterminal until closure. Reconciliation never upgrades unreviewed late success to COMPLETED.

## 12. Cancellation-state specification

Proposed cancelState facts: NONE→INTENT_COMMITTED→DELIVERY_OBSERVED→ACK_OBSERVED→EXIT_CONFIRMED→FINALIZED. These are evidence facts, not mandatory observations: verified exit may skip missing delivery/ack facts, with explicit absent-ack payload. ACK without exit never permits FINALIZED. Recovery preserves original request/stopReason even when current generation advances.

Owner sends attempt/project/current generation/requestId/decision proof; host authenticates issuer, verifies target/scope and commits immutable canonical request plus projection/event. Duplicate same ID/digest returns existing result; different ID for same already-stopping attempt returns canonical request/no new intent, after authorization. Same ID/different target/payload conflicts. First stopReason wins; later timeout/cancel is audit information, not primary-reason overwrite.

**Serialization rule:** terminal success committed first→cancel returns ALREADY_TERMINAL without rewriting. Stop intent committed first→subsequent COMPLETED CAS cannot match; preserve/quarantine late result. Concurrent process exit is evidence, not race authority. All known exits + classified effects allow INTERRUPTED even if ack lost; unknown child/launcher/handle visibility keeps quarantine. Host crash after intent→startup finds request and does not resume normal work.

Stop request in UNCERTAIN/RECONCILIATION_REQUIRED attaches durable intent but does not erase quarantine. If timeout wins before Owner cancel, outcome TIMED_OUT; if Owner cancel wins, CANCELLED. Runtime delivery happens **after COMMIT**, using attempt/invocation-specific channel and exact process ownership. New recovery owner may redeliver only through a verified broker for the original invocation; an old-generation callback cannot become an authoritative new-owner acknowledgment merely by changing fields.

Database unavailable/BUSY exhaustion: report STOP_INTENT_NOT_COMMITTED, never claim accepted cancellation. Trusted safety controller may stop its exact still-owned process as emergency containment, preserving evidence; that does not fabricate durable intent/terminal state or authorize a replacement.

**Proposed finite workload policy:** readiness5s, total command budget300s by default, stop-delivery4s and complete owned-scope closure8s from committed stop intent. The approved action may choose another explicit finite maxRuntimeMs, capped initially at1800s; material changes require fresh fingerprint/approval before launch. Persist timeoutPolicyDigest and limits at issue, set launchCommittedAtMs/runDeadlineMs in LAUNCHING and stop deadlines in the first stop-intent transaction. Local monotonic budget starts around launch-permit consumption and is rechecked before OS call; a consumed-but-expired permit is not reused. Parent/child/runtime-specific supervision may use stricter bounds, never extend these implicitly.

Host detects readiness/total-work deadline independently of lease heartbeats. If no definitive no-spawn proof exists, expiry records TIMED_OUT stop intent and supervises closure, not terminal failure/exit. Missed delivery/closure deadline records UNCERTAIN and preserves the original stopReason/hold; future emergency teardown requires its own verified mechanism. Before accepting a success, check work deadline/clock again; an expired budget must take timeout-intent/recovery path rather than accept a late success merely because its lease was renewed. Stored wall deadlines after restart only guide classification; they do not recreate monotonic timers or authorize a resumed worker. Exact instantaneous OS deadline guarantees are not claimed.

## 13. Transactional issuance protocol

No process-local mutex substitutes for SQL arbitration. Proposed parameters are prevalidated by host; all mutations repeat identity/incarnation/task-version checks inside the same short write transaction. Constraint conflict rolls back, never “upserts” a new owner over an old attempt.

~~~text
issue(command):
  verify Owner/session, backend binding, task eligibility and stable action digest
  BEGIN IMMEDIATE
    verify control_meta(projectId, incarnation, lifecycle=OPEN)
    verify task(projectId,taskId,expectedTaskVersion)
    lookup (projectId,taskId,issueRequestId)
    if found: require issueDigest identical; COMMIT read-only decision; return prior ID
    require no conflictHeld=1 row for project
    INSERT attempt(CREATED,v1,g1,owner tuple,lease,scope,launchConsumed0)
    INSERT owner_epoch(g1, matching tuple)
    INSERT event(ATTEMPT_ISSUED,prior0,new1,same request digest)
    assert all FK/identity/version/event invariants
  COMMIT                         -- only now return issued authority
  no spawn performed by issue()
~~~

SQL shape for an **explicit recovery ownership acquisition/generation increment**, not takeover of live execution or permission to spawn:

~~~sql
BEGIN IMMEDIATE;
UPDATE runtime_attempts
SET attemptGeneration=attemptGeneration+1,
    hostInstanceId=:newHost, ownerId=:newOwner,
    ownerNonceHash=:newNonceHash, ownerMode='RECOVERY',
    phase='RECONCILIATION_REQUIRED', stateVersion=stateVersion+1,
    heartbeatSequence=0, leaseStartedAtMs=:now,
    leaseDeadlineMs=:recoveryDeadline, lastHeartbeatAtMs=NULL,
    clockDomainId=:newClockDomain, updatedAtMs=:now
WHERE projectId=:p AND attemptId=:a
  AND authorityIncarnation=:incarnation
  AND attemptGeneration=:oldGeneration AND stateVersion=:expectedVersion
  AND phase='UNCERTAIN' AND conflictHeld=1
RETURNING attemptGeneration,stateVersion;
-- HOST: require exactly one returned row; otherwise ROLLBACK/CONFLICT.
-- INSERT matching new runtime_owner_epochs row using returned generation.
-- INSERT matching event with priorVersion=:expectedVersion/newVersion=returned.
-- Verify authenticated recovery grant/current meta; COMMIT or rollback all.
COMMIT;
~~~

[SQLite transactions](https://www.sqlite.org/lang_transaction.html) supports one writer and BEGIN IMMEDIATE contention; [RETURNING](https://sqlite.org/lang_returning.html) returns changed rows **before transaction durability**, so a row result is not success until COMMIT. Consume/finalize its cursor before event insertion/commit. No PostgreSQL-style data-modifying CTE is assumed.

On failure before commit, no attempt authority/no external launch. Commit outcome unknown→fresh authenticated lookup by issueRequestId+digest; do not mint another ID or spawn. Ownership assignment after issuance is recovery-only; re-execution always requires a new attempt with explicit retry grant. launchConsumed is a one-shot persisted permit: crash before or after OS call cannot automatically replay it.

## 14. Durable lease and heartbeat

Proposed baseline: lease20s, heartbeat every5s, renewal before10s without confirmation; no silent extensions. Owner liveness is conditional on current tuple and successful commit, not a worker's claimed heartbeat. Host records last verified process observation separately from host lease renewal.

Renew requires p/a/incarnation/hostInstance/owner/nonce/generation/expected phase/version, next heartbeatSequence, nonterminal nonquarantined state, unchanged stop policy and valid local monotonic deadline/clock domain. Same heartbeat ID+digest is idempotent; lower/stale sequence rejected. New recovery generation resets sequence0 with explicit epoch event.

~~~sql
BEGIN IMMEDIATE;
UPDATE runtime_attempts
SET heartbeatSequence=:nextSequence,lastHeartbeatAtMs=:wallNow,
    leaseDeadlineMs=:newDeadline,stateVersion=stateVersion+1,
    updatedAtMs=:wallNow
WHERE projectId=:p AND attemptId=:a AND authorityIncarnation=:incarnation
  AND hostInstanceId=:host AND ownerId=:owner AND ownerNonceHash=:nonceHash
  AND attemptGeneration=:g AND stateVersion=:v
  AND clockDomainId=:clockDomain
  AND ownerMode=:mode AND phase=:expectedPhase
  AND phase NOT IN ('COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED',
                    'UNCERTAIN','RECONCILIATION_REQUIRED')
  AND heartbeatSequence=:previousSequence AND leaseDeadlineMs>:wallNow
RETURNING stateVersion;
-- exactly1 row + next sequence=previous+1 + matching heartbeat event; COMMIT.
COMMIT;
~~~

The example is EXECUTION renewal. RECOVERY renewal is a separate conditional command: BEGIN IMMEDIATE; verify current caseId/caseVersion, open case, authenticated ownerDecisionId/recoveryGrantDigest and unexpired recoveryGrantExpiresAtMs; match full p/a/incarnation/host/owner/nonce/g/version/clock tuple, ownerMode=RECOVERY and phase=RECONCILIATION_REQUIRED; require next heartbeatSequence and unexpired lease; UPDATE exactly1 row plus matching event, COMMIT. Same20s lease/5s heartbeat, capped by an absolute5-minute recovery grant; extending that grant requires a fresh Owner decision, not automatic renewal. Expiry leaves the case open/held; a later recovery owner must acquire a new fenced epoch. No recovery grant allows execution.

Leases do not silently lengthen on DB retry. Validate local monotonic/clock guards after obtaining the write transaction and again before COMMIT; reserve the remaining database budget before accepting a mutation. If insufficient, rollback/quarantine. A suspended/blocking OS commit cannot provide an instantaneous real-time cutoff guarantee: its outcome must be resolved by receipt readback. Safety against competing owners comes from serialized epoch/version commits and the retained conflict hold, not a claim that SQLite time and Windows process time are atomic.

Clock policy: UTC wall deadlines are durable audit/candidate signals, not portable monotonic authority. Each host lifetime has random hostInstanceId/clockDomainId and in-memory monotonic renew deadline; these cannot be restored from SQL. Track deltaWall versus deltaMono; backward/forward mismatch>2s, missed renew window, sleep/resume or boot discontinuity invalidates EXECUTION grants. Require fresh reconciliation, not time correction. Even when both clocks appear normal, explicit resume/boot-continuity signals must be integrated/validated before runtime activation; unavailable signal→fail closed.

Another host seeing expired wall time may CAS record uncertainty; it may not conclude death or issue a replacement. Competing renewal/expiry uses expected version/deadline: committed renewal makes old expiration CAS stale; committed quarantine makes renewal ineligible. False quarantine on clock anomaly sacrifices availability, not isolation.

## 15. Ownership generation and fencing

Mutation key is **(projectId,authorityIncarnation,attemptId,attemptGeneration,hostInstanceId,ownerId,ownerNonceHash,stateVersion)**. Check meta incarnation and immutable binding. Every owner change increments generation, inserts immutable epoch and journal event atomically. Current tuple is the only authoritative owner; owner history does not grant rights.

Raw ownerNonce remains host-private; only its digest is persisted and it is never forwarded as a worker capability. Worker invocationNonce is a separate limited correlation value, not permission to renew or commit. Canonical command/receipt digest uses a versioned strict schema, fixed field order/UTF-8 serialization, normalized bounded strings and safe integer encodings; transport timestamps/retry counters are excluded from semantic idempotency identity. Unknown fields/nonfinite or unsafe integers are rejected. Generation/version/sequence arithmetic must reject overflow above the chosen Node-safe integer boundary; Windows creationTicks stay exact decimal TEXT. Decisions/events preserve the original semantic digest on replay.

Reject old heartbeat/renewal, completion, cancellation-ack authorization, task update and output-manifest commit. Exact terminal duplicate is a read-only idempotency response, not a new stale-owner commit. Worker message generation never comes from mutable current UI state.

Process invocation identity is separate: invocationId/invocationNonceHash/launchGeneration stay frozen. After recovery fencing, old process observations can be collected by a **current authenticated recovery observer** and correlated to that original invocation; raw old-owner messages do not regain authority. Original durable stop intent is retained. No resumed execution/second spawn under a recovery generation.

Database state fencing and host API authorization cannot revoke a still-writable OS handle. Conflict hold remains1 while previous process/effects are unknown; replacement is prohibited even if new generation exists (§26).

## 16. Process identity and lifecycle

[Windows process handles](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers) and [PROCESS_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/ns-processthreadsapi-process_information) distinguish handles from recyclable IDs. Persist host/invocation/launch-generation, launcher/parent/child PID, creationTicks, executable path reference+hash, relationship evidence, observation sequence/time and scope membership/exit evidence. Persist **no numeric handle as a reusable capability**; live original handles remain volatile supervisor-owned objects.

On live callbacks correlate original handle + fixed executable/source + invocation nonce + creation time + expected role/relationship. After restart, open a targeted candidate handle only for query; compare creation/executable/invocation/process-scope evidence before any action. Access-denied/not-observable is UNKNOWN, not dead. PID reuse→IDENTITY_MISMATCH; never terminate new unrelated process. Matching filename alone is insufficient.

Parent exited/child unknown, launcher exited/parent unknown, lost handle or ambiguous descendants→quarantine scope. Two hosts observing same PID do not both own it; DB epoch selects current observation authority, original handle evidence does not authorize stale database commits. Reacquisition of **termination** rights requires separately validated Windows broker/process-tree integration; do not infer direct MXC Job Object access.

[Node child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html) warns that killed is not exit confirmation and Windows signals can be abrupt. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) can group processes when configured; [OpenAI Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) documents foreground-child behavior. Neither establishes AI OFFICE-owned kill-on-close handles or hostile teardown. Future OS integration/forced-tree tests remain separate authorization gates.

For initial future app-server integration, choose a dedicated per-attempt runtime/session/process scope; do not share one persistent execution server across projects/attempts under this protocol. Required attempt-owned processes must be exited/scope-closed before terminalization; the trusted host supervisor is not itself an attempt worker. Persistent shared-server reuse requires a later reviewed task-scope closure/authorization design and independent runtime evidence, not an exception inferred from a completion event.

## 17. Terminal commit protocol

Normal owner commit needs live lease/clock, matching full tuple and version, legal predecessor, normalized validated result, all required process/scope exit/effect evidence and frozen host-owned artifact manifest. Raw worker success is never a task update. Recovery commits require explicit Owner recovery decision/closure proof, may produce FAILED/INTERRUPTED only.

~~~text
commitTerminal(receipt):
  authenticate host authority; validate bounded schema and immutable receipt digest
  BEGIN IMMEDIATE
    resolve exact project/incarnation/attempt
    if terminal:
      if receiptId+normalizedDigest+identity match stored receipt:
        return prior result after closing transaction, no event/task effect
      else reject/quarantine conflicting receipt
    require current epoch/owner/version/lease/phase and closure proof
    require no durable stop intent if target=COMPLETED
    conditional UPDATE runtime_attempts => terminal, receipt, digest, v+1
    require exactly1 row
    INSERT event(priorVersion,newVersion,same terminalReceiptId,digest)
    if executionMode=runtime:
      CAS production task snapshotVersion/eligible state in this same DB
      require exactly1 row; else rollback whole terminal+event, open conflict case
    if synthetic: do not mutate DemoTaskSchema records
    assert journal/projection consistency and FK invariants
  COMMIT
  only now publish UI notification/return durable success
~~~

Illustrative success predicate:

~~~sql
UPDATE runtime_attempts
SET phase='COMPLETED', terminalReceiptId=:rid,terminalDigest=:digest,
    terminalPayload=:normalizedPayload,outcomeReason='NORMAL',
    outputManifestDigest=:manifest,closureDigest=:closure,conflictHeld=0,
    stateVersion=stateVersion+1,updatedAtMs=:now
WHERE projectId=:p AND attemptId=:a AND authorityIncarnation=:incarnation
  AND attemptGeneration=:g AND hostInstanceId=:host
  AND ownerId=:owner AND ownerNonceHash=:nonceHash
  AND stateVersion=:v AND phase='RUNNING'
  AND clockDomainId=:clockDomain
  AND ownerMode='EXECUTION' AND leaseDeadlineMs>:now
  AND runDeadlineMs>:now
  AND cancelRequestId IS NULL AND terminalReceiptId IS NULL
RETURNING stateVersion;
-- Inside BEGIN IMMEDIATE; require1 + same transaction event/eligible task update.
~~~

Zero rows means conflict/stale/cancelled/expired; do not fabricate success. Duplicate ID with a different digest is conflict, even if phase matches. Stop-intent-first rejects late success; cancellation terminal cannot be overwritten. Busy during commit: bounded transaction handling (§19), no external replay. Crash just after successful commit: re-read receipt/event/projection, return same committed result; UI notification may be repeated with dedup ID. Unknown commit outcome blocks another external action.

## 18. Journal/event model

Use **both append-only events and current-state projection**, same project DB/same transaction. Authority repository is the sole writer; worker messages are not database events. Per-attempt stateVersion increments once for every accepted mutation; event newVersion unique and priorVersion=newVersion-1. Heartbeat/observation use same-phase events. No separate cross-project total ordering or wall-clock ordering assumption.

Required event fields in §10: event/attempt/project/generation/type/payloadVersion/prior+new version/time/writer/idempotency/digests. Allowlisted event types include issue, approval, launch permit, process observation, heartbeat, stop intent/delivery/ack, uncertainty/fence, recovery decision, terminal and hold release. Unknown type/version, missing sequence/hash link, truncated/invalid payload, terminal disagreement or duplicate key with changed digest→integrity failure/quarantine; never repair by blindly replaying worker input.

Pure reducer replay validates legal phase/owner-generation/cancel facts and must equal materialized projection at a stable read snapshot. Mismatch blocks dispatch; repair requires explicit audited maintenance, not inventing events. Hashes detect corruption, not malicious host forgery. Rows, projection, cancellation and epoch changes commit together; journal is never edited by worker. No SQL UPSERT owner replacement: [SQLite UPSERT](https://www.sqlite.org/lang_upsert.html) resolves uniqueness into update/no-op and is unsuitable for silently taking ownership. Narrow DO NOTHING may only accompany explicit identical-payload readback, never convert CAS0 into success.

## 19. SQLite durability and contention

**Proposed baseline, unchanged live configuration:** local backend-owned NTFS storage, journal_mode=DELETE, synchronous=EXTRA, foreign_keys=ON per connection, trusted_schema=OFF, read_uncommitted=OFF, no shared cache/extension/worker SQL. Strict schema/parameter binding, application_id plus user_version and runtime schemaRevision must be verified by future migration code. Directory, DB and journal share approved private local scope; network shares/cloud-synchronized live DBs are unsupported.

Proposed first authority database revision uses user_version=2, runtime schemaRevision=1 and local application_id=0x41494F46 (an application discriminator, not a globally registered identity claim). Portable ProjectIdentitySchema.schemaVersion and project_header.schemaVersion remain1; they describe identity, not this database migration version. Legacy verifyDatabase accepts only user_version1 and must reject the new revision rather than silently read it. Version-aware storage-v2 adapter/migration tests are required; no PRAGMA or identity marker is changed in S11.

| Choice | Assessment / selected behavior |
|---|---|
| DELETE rollback | Fits small bounded authority transactions/current layout; readers/writers can contend. Selected initially. |
| WAL | More reader concurrency, still one writer, adds wal/shm/checkpoint/backup lifecycle. Deferred until measured need, safe adapter/SQLite version validation; never enable by incidental connection open. |
| FULL versus NORMAL | Critical authority cannot accept NORMAL power-loss rollback tradeoff. Current fixture FULL remains unchanged. |
| EXTRA with DELETE | Preferred future baseline adds rollback-journal deletion sync discipline; avoid calling current DELETE/FULL universally power-loss durable. |
| Busy / transaction duration | Per-connection busy_timeout100ms; max4 acquisition attempts with delays25/75/150ms, total≤1000ms and remaining lease budget. In-memory scheduler yields between retries. Target short SQL-only txn; no process/files/network/UI wait inside it. |
| Read cursor/checkpoint | Close snapshots/cursors promptly. Initial mode has no WAL checkpoint. Future WAL path uses bounded PASSIVE maintenance, monitors growth, never deletes sidecars to force progress. |

[SQLite PRAGMA](https://www.sqlite.org/pragma.html) distinguishes EXTRA/FULL/NORMAL durability: EXTRA adds DELETE journal directory synchronization; WAL/FULL has a different persistence model. Hardware/VFS/filesystem flush correctness is still an assumption, not an S11 power-loss result. [WAL reference](https://www.sqlite.org/wal.html) explains reader concurrency, one writer, sidecars and checkpoints; this design does not activate WAL.

**Five separate properties:** atomicity=all-or-none transaction; consistency=checked invariants; isolation=independent connection serialization; application-crash persistence=committed SQLite state reopened correctly; OS/power-loss persistence=requires chosen sync/VFS/hardware behavior and later evidence. None makes OS spawn, worker files, Git/provider calls, UI or inference part of a SQL transaction.

Error policy:

| Condition | Required handling |
|---|---|
| SQLITE_BUSY before BEGIN | Retry same command/idempotency key within stated budget; no new attempt/OS action. Exhausted→DATABASE_BUSY/no success. |
| BUSY at COMMIT in rollback mode | Transaction may remain active: finalize cursors; retry **that COMMIT** within remaining budget. Do not rerun transaction body while it is active. If safely rollback, re-read/revalidate before same-command retry. |
| SQLITE_BUSY_SNAPSHOT | Not expected with selected IMMEDIATE path; future WAL stale snapshot→rollback entire stale read transaction/re-read. Never use stale version or upgrade to execution retry. |
| Constraint/CAS0 | ROLLBACK all related event/projection changes; classify duplicate only by identical identity+digest readback, otherwise conflict. |
| IOERR/FULL/CORRUPT/NOTADB/schema unsupported | Stop authority mutations/dispatch for project; preserve DB/sidecars; controlled integrity review. No empty DB recreation/downgrade fallback. |
| Unknown COMMIT/connection failure | Fresh checked connection resolves command/receipt identity; unknown remains quarantine. Do not claim failed commit means external operation never happened. |

Current databaseFailure masks SQLite errcode to primary code; future adapter must preserve extended code **internally** without leaking DB contents. Current useDatabase forcibly sets DELETE/FULL and StateStorage rejects any sidecar; **do not reuse unchanged** for concurrent authority. Replace fixture-only assumptions in separately approved v2 adapter: let SQLite handle recognized hot journals in owned storage, validate canonical files/locks/DB identity, never unlink sidecars. Current fixture behavior/tests remain intact until that explicit migration.

Also do not inherit current fixture max_page_count1024,4MiB databasePath size ceiling, or100-record demo read limits as a production runtime policy. Proposed authority soft budget64MiB, warning/admission stop at80%, bounded event payload16KiB and paginated history; never discard unresolved/terminal idempotency lineage to free space. A separately reviewed storage-v2 capacity/retention migration is required before live integration. Disk-full still follows fail-closed handling above; capacity policy is not a guarantee that emergency cancellation will always commit.

Startup quick_check and foreign_key_check precede grant; full integrity_check under maintenance after abnormal termination/suspected corruption, plus event/projection reducer validation. Corruption is not auto-repaired. Backups use supported consistent SQLite backup under quiescent host maintenance, integrity/reopen checks and include authority/task/events together. No raw hot DB-only copy. No journal-mode migration, pragma, DB connection or backup command ran in S11.

## 20. Backend startup reconciliation

Proposed sequence, before dispatch or user-triggered launch:

1. New hostInstanceId/clockDomainId; in-memory dispatch gate CLOSED for every project. Recover registry ownership through existing allowed procedure; stale writer.lock is not stolen.
2. Discover registered project UUIDs/DB locators from backend registry/initialization ledger. Cache cannot prove absence; missing/unavailable DB blocks that project.
3. Open checked connection, verify schema/settings/FK/integrity and identity/incarnation. Unsupported version means read-only review.
4. Validate append-only event sequence/reducer against current projections in a stable snapshot. No silent projection rebuild.
5. Enumerate all nonterminal attempts, pending stop requests, open recovery cases and **terminal conflictHeld1** rows. Healthy other-host lease is not seized.
6. Correlate persisted invocation/process evidence with trusted supervision broker. A saved PID/heartbeat absence is insufficient. When no validated continuity exists, classify UNKNOWN.
7. With authenticated recovery grant, CAS unresolved row→UNCERTAIN and fence into new RECOVERY epoch→RECONCILIATION_REQUIRED; preserve launchConsumed, original invocation/stop intent and conflict barrier. Commit every state/event pair atomically.
8. Collect current host observations, preserve raw provenance and classify process/effects. No worker dispatch/restore of an old launch permit.
9. Known no-spawn or complete scope exit+effect classification may be presented to Owner for explicit FAILED/INTERRUPTED reconciliation and hold release. Unknown cases remain quarantined.
10. Publish recovery status/read-only UI. Issue new attempts only after verified closure, task eligibility, required fresh approval and activation grant tied to this new host lifetime. No automatic retries/restarts.

If recovery host crashes mid-step, database transactions leave either previous or next consistent version; new recovery session re-reads case/command IDs, never replays external actions. Shutdown closes launch gate first, records stop intent while DB healthy, observes owned scopes, then closes HTTP/state/registry resources. Deadline/DB failure during drain→unresolved recovery evidence, not fake terminal success.

## 21. Unknown-process quarantine

Quarantine is an authoritative **barrier**, not permission to kill or assume dead. Attempt stays UNCERTAIN/RECONCILIATION_REQUIRED; conflictHeld=1 and open recovery case retain project scope. Mark private operator view with reason, verified observations, missing evidence, last identity and allowed read-only actions.

| Observation | Classification / allowed action | Prohibited |
|---|---|---|
| Original waitable handle signaled plus complete known scope accounted | EXIT_CONFIRMED candidate; inspect staged effects/receipts. | Assume successful task solely from exit0. |
| Parent exited, child unknown | UNKNOWN_DESCENDANTS; query verified broker and preserve hold. | Replacement in same scope. |
| Launcher exited, parent unknown | UNKNOWN_FOREGROUND_SCOPE. | Infer command tree gone from launcher PID. |
| Saved PID absent | ORIGINAL_PID_ABSENT, scope/effects still unresolved. | Death/exactly-once claim from PID absence alone. |
| PID exists with different creationTicks | PID_REUSED/IDENTITY_MISMATCH; leave unrelated process untouched. | Kill by PID/name. |
| Access denied, missing handle/job interface | NOT_OBSERVABLE. | Treat query failure as exit. |
| Backend crash with possible continued child | HOST_CONTINUITY_LOST. | Adopt worker as current generation or reset launchConsumed. |
| DB unavailable/corrupt/restore provenance unknown | STORAGE_OR_HISTORY_UNCERTAIN; fail closed. | New database/new owner from cache. |

Case closure requires authenticated Owner decision referencing **specific current case version/evidence digest** and verified process/effect closure. Consent cannot turn unknown into known; unresolved evidence keeps hold even after user asks retry. Emergency termination requires independent current ownership proof/authorized mechanism and observed exits; no generic process-name kill.

## 22. Retry authorization

“Retry DB transaction” and “retry worker” are separate operations. Worker retry is **never automatic** in this design.

| Category | Evidence / actor | Identity/generation/approvals and safety |
|---|---|---|
| Transient DB contention before issue | No transaction committed; repository retries bounded same command. | Same issueRequestId/attempt proposal; no OS call/no new worker approval consumed. |
| Issue committed, launch permit never consumed | Current no-launch proof; Owner may abandon/cancel. | Existing attempt terminalized; Owner-authorized re-execution uses new ID/scope, generation1/new nonce/approval. |
| Launch consumed, definitive no-process-created receipt | Trusted broker confirms spawn failure; classify no effects. | FAILED START_FAILED; explicit Owner retry/new ID; never reset consumed permit. |
| Confirmed process failure, no unreviewed effects | Complete scope exits and input/output inventory. | Fresh task snapshot/fingerprint/approval; source attempt closure/hold release. |
| Interrupted/unknown side effects | Reconciliation case, unknown work/output quarantine. | No retry until verified closure; inspect canonical files if old adapter could write them. |
| Explicit approved retry | Owner grant binds prior attempt/case/task/version/fingerprint and expiry. | Consume retryDecisionId once with new attempt insert and old hold release in same DB txn. |
| Expiry/restart/missing heartbeat/PID alone | Insufficient evidence. | Retry prohibited, even if new generation assigned. |

New attempt generation starts1; it is a different attempt. Old attempt's generation advances only if its ownership actually changes; a recovery fence does not migrate external work. Revalidate task dependencies, project binding, billing/runtime gates, no-conflicting-scope hold and fresh per-generation approval. Stable command key prevents lost-ACK retry grant from creating a second new attempt. Owner cannot approve away unresolved OS/effect evidence.

## 23. Concurrency race matrix

All rows are **DESIGN SPECIFIED / NOT RUN**. Shared primitives: B=BEGIN IMMEDIATE+same DB; V=expected stateVersion; G=full generation/owner/incarnation check; H=conflictHeld unique barrier. Proposed tests §30. Each row states actors/precondition, ordering/unsafe outcome, preventing mechanism, durable/recovery result.

| ID | Actors / precondition | Ordering and unsafe outcome | Invariant / transaction mechanism | Durable result and recovery | Test |
|---|---|---|---|---|---|
| C01 | H1/H2 issue same eligible task | Both read free→duplicate attempts. | B+issue uniqueness+H; no local-lock reliance. | One issue; loser conflict or identical-key prior result; no spawn from loser. | T08 |
| C02 | Two recovery owners claim UNCERTAIN row | Both select old epoch→dual owner. | B+V/G; epoch+event same commit. | One new RECOVERY generation; loser re-reads, no authority. | T38 |
| C03 | Owner heartbeat/expiry classifier | Renewal before stale expiry read or expiry before renew. | B+V+expected deadline; expiry does not release H. | Renew wins→stale expiry0; quarantine wins→renew0; no replacement. | T09 |
| C04 | Old owner renews after g changes | Stale lease revival. | G+phase+sequence CAS. |0 rows, no heartbeat event; remain fenced. | T04/T44 |
| C05 | Owner cancel/host completion | Two transaction orders could allow late success. | B+V; success requires cancelRequestId NULL. | Success-first unchanged terminal; stop-first success rejected. | T10 |
| C06 | Timeout observer/Owner cancel | Both want primary stop reason. | First canonical request unique per attempt. | First reason immutable; other sees same stop, no duplicate finalization. | T11 |
| C07 | Child exit/ack delivery | Lost ack mistaken as live/dead. | Correlated host process receipts, no ack→exit inference. | Exit evidence can finish stop if whole scope/effects safe; else quarantine. | T26 |
| C08 | Launcher close/unknown child | New attempt writes beside old child. | H retained; scope closure prerequisite. | UNKNOWN_DESCENDANTS, no replacement. | T27 |
| C09 | New host/old active owner | Restart steals healthy/unobserved work. | Startup gate CLOSED; B/G recovery-only after classification. | No auto resume; valid owner continues only with its own lease; ambiguous scope quarantined. | T14 |
| C10 | Recovery fence/old completion | Stale success updates task. | G plus current meta+V. | Stale result rejected; task/event unchanged. | T17 |
| C11 | Two different terminal receipts | Both commit, double task effect. | B+V+terminal uniqueness. | One terminal; conflicting other quarantined, no rewrite. | T12 |
| C12 | Same terminal delivered twice | Duplicate event/effect. | Receipt ID+digest readback; event idempotency. | Identical prior result, zero extra transition. | T13 |
| C13 | Old worker success after recovery | Process nonce incorrectly grants current epoch. | Separate launch identity/current owner G. | Observation only under recovery collector; no success promotion. | T17/T44 |
| C14 | Archive command/active attempt | DB moved/deleted while executing. | Maintenance controlVersion CAS+B+H. | ARCHIVING blocks issue; active hold blocks destructive archive; manual close first. | T43 |
| C15 | Registry/root binding replacement | Task A accidentally executes B. | Immutable binding/fileKey/incarnation; backend revalidation before grant. | Identity conflict→quarantine; no rebind existing attempt. | T30/T31 |
| C16 | Busy writer/cancel request | UI falsely shows accepted cancellation. | Bounded DB budget; no ACK before COMMIT. | STOP_INTENT_NOT_COMMITTED or committed intent; emergency stop not synthetic terminal. | T06/T23 |
| C17 | Clock step/renew or completion | Wall jump revives lease/early takeover. | Local mono+delta/continuity gate; B/V. | Clock anomaly→quarantine; no replacement from wall expiry. | T37 |
| C18 | Sleep/resume/queued messages | Worker resumes with obsolete grant. | Resume invalidates local execution grant; G check on every host action. | Stale inputs rejected, scope remains held until reconcile. | T37 |
| C19 | PID reuse/new recovery observer | Unrelated process killed. | Creation/executable/invocation match plus verified handle; query-only when unknown. | IDENTITY_MISMATCH; unrelated process untouched. | T28 |
| C20 | Old worker output/replacement proposal | Shared files corrupted despite DB fence. | H + per-attempt staging + immutable host artifact/pointer CAS. | Old private output not published; no conflicting launch. | T35/T42 |

## 24. Crash-window matrix

All scenarios are **proposed, unexecuted**. “Owner” means explicit review/decision after evidence; no row authorizes automatic worker restart.

| ID | Durable state / possible external effect | Evidence after restart | Safe classification / allowed action | Prohibited action | Owner review |
|---|---|---|---|---|---|
| W01 before issue txn | No attempt; no launch allowed. | No command key row/event. | Bounded same-command issue request after normal authorization. | Spawn without committed grant. | Normal issuance approval. |
| W02 during issue | Uncommitted/rolled-back tuple or full committed tuple. | SQLite recovery + key/chain/projection readback. | Resolve atomic state; no external action until known. | Assume partial row grants launch. | If integrity uncertain. |
| W03 issue committed/pre-spawn | CREATED/GRANTED or consumed LAUNCHING. | launchConsumed and original invocation receipts. |0→no-launch candidate;1→possible spawn quarantine unless definitive broker proof. | Replay consumed launch permit. | Yes for re-execution. |
| W04 spawned/PID not durable | LAUNCHING/consumed1; process may be alive. | Missing receipt is not no-spawn proof. | UNKNOWN_PROCESS; preserve H, verified broker inquiry. | New attempt from missing PID. | Yes, closure evidence first. |
| W05 running before heartbeat | Durable intent/process receipt may exist; actions possible. | Identity/scope observations. | RECOVERY_REQUIRED, no resume. | Reuse old host/nonce grant. | Yes. |
| W06 interrupted heartbeat | Old or new committed lease/version. | Key/sequence/event+projection. | Re-read current epoch; no external work while ambiguous. | Extend lease from failed write. | If continuity lost. |
| W07 lease expires alive | RUNNING old owner/process still writable. | Stale lease plus possible live scope. | Fence DB/recovery quarantine, keep H. | Replacement solely from expiry. | Yes. |
| W08 stop committed/not delivered | CANCELLATION_REQUESTED and canonical request. | Pending intent+process evidence. | Current authorized broker may redeliver bounded stop. | Treat intent as exit. | For unresolved scope. |
| W09 delivered/ack lost | Intent; process may still run/exit. | Host exit/closure receipts or UNKNOWN. | Proven closure→reconcile; else quarantine. | Assume ack loss means stopped. | For uncertain effects. |
| W10 child exits/parent alive | Child EXITED receipt; active parent. | Parent handle/creation identity. | Continue authorized stop supervision; hold. | Terminal from child alone. | If deadline/visibility fails. |
| W11 parent exits/launcher unknown | Partial scope closure. | Launcher/sandbox-scope receipts. | UNKNOWN_SCOPE until verified. | Terminal/new worker from parent0 alone. | Yes if cannot close. |
| W12 worker file effect/pre-terminal | RUNNING/intent; effects may exist. | Staging snapshots/immutable blobs/project audit. | Quarantine/classify; harmless orphan blob unreferenced. | Exactly-once claim or blind redo. | Yes. |
| W13 receipt received/pre-commit | Row remains prior state unless txn committed. | Read terminalReceiptId/digest/event. | Resolve receipt; unknown result stays recovery. | Re-run external action to recreate receipt. | If outcome unresolvable. |
| W14 terminal committed/UI not notified | Terminal+event+task/pointer atomic. | Exact same receipt. | Resend deduplicated notification/read model only. | Second terminal/task/external effect. | No new execution approval. |
| W15 during startup reconcile | Before/after consistent case/epoch transaction. | Versions/idempotency/case fields. | Repeat classification against fresh state, no execution. | Clear H on partial inspection. | To close case. |
| W16 DB unavailable/cancel | Intent may not commit; process may continue. | Original handle and eventual DB readback. | Stop-intent unconfirmed; owned emergency containment if independently safe. | Fake accepted/terminal result or fallback DB. | Yes. |
| W17 OS failure during commit | Commit may be lost or recovered per VFS/sync/hardware. | Integrity+key/chain, process/effect audit. | No runtime activation until continuity restored. | Claim tested power-loss/exactly-once. | Yes if uncertain. |
| W18 backup restore | Snapshot may omit newer owners/actions. | Approved restore provenance and all-scope quiescence. | Offline maintenance, fresh incarnation/session; imported work not resumed. | Live DB swap/implicit old approval reuse. | Mandatory. |
| W19 corruption | Projection/events unreliable. | Integrity/reducer failures. | Block project, preserve files, controlled backup review. | Auto reset/repair/attempt creation. | Mandatory. |
| W20 retry before prior stop proof | Prior H1/case unresolved; process/effects possible. | No complete closure digest. | Retry rejected, case remains open. | New conflicting staging/canonical writer. | Consent alone insufficient. |

## 25. Security invariants

All **proposed enforcement**, not current runtime verification. For every invariant, violations fail closed and append authorized audit evidence only if database integrity permits.

| ID | Machine-testable expression | Enforcer / persistence | Failure classification | Test |
|---|---|---|---|---|
| I01 | update.projectId = issued.projectId | Immutable DB guard + backend binding. | IDENTITY_CONFLICT. | T30/T40 |
| I02 | attemptId never changes; retry.newId ≠ priorId | PK/immutability + retry repository. | ATTEMPT_ID_CONFLICT. | T02/T41 |
| I03 | current epoch count=1; owner change⇒g'=g+1 | Current projection/deferred FK/epoch txn. | OWNERSHIP_CONFLICT. | T38 |
| I04 | renew.g/owner/nonce/host = current | SQL CAS/current phase/clock. | STALE_OWNER. | T04/T44 |
| I05 | terminal/task commit requires current G,V | One DB transaction. | STALE_RESULT. | T04/T17 |
| I06 | terminal phase cannot change or return RUNNING | Repository+DB terminal guard. | TERMINAL_IMMUTABLE. | T40 |
| I07 | count(terminal commit per attempt)=1 | Receipt uniqueness+digest/idempotency. | TERMINAL_CONFLICT. | T12/T13 |
| I08 | stop target=(project,attempt,intentGeneration) validated | Immutable cancel row + host issuer auth. | INVALID_STOP_TARGET. | T32 |
| I09 | duplicate stop does not add intent/terminal/version | Canonical request readback. | IDEMPOTENCY_CONFLICT if digest differs. | T11/T32 |
| I10 | leaseExpired never implies replacementEligible | Recovery rules+H. | RECOVERY_REQUIRED. | T16/T41 |
| I11 | unknown scope⇒conflictHeld1 and no replacement | Unique project hold + dispatch gate. | UNKNOWN_PROCESS. | T27/T41 |
| I12 | termination requires ownership proof beyond PID | Trusted Windows broker/handle evidence. | NOT_OBSERVABLE; no kill. | T28/T29 |
| I13 | reducer(events at v)=projection(v); one event per mutation | Same txn+version uniqueness/reducer. | JOURNAL_INTEGRITY_FAILURE. | T05/T18 |
| I14 | A worker permission set excludes B/private/auth roots | Host profile validation + future OS acceptance. | SCOPE_VIOLATION; block launch. | T24/T30 |
| I15 | new external attempt needs fresh host/Owner authorization | Retry grant consumed once in issue transaction. | RETRY_NOT_AUTHORIZED. | T41 |
| I16 | approval.issuer cannot be model output/worker assertion | Auth boundary; durable decision binding. | APPROVAL_INVALID. | T33 |
| I17 | manifest publish requires current G and immutable blob | Broker copy verification + pointer commit. | STALE_PUBLICATION. | T35/T42 |
| I18 | every mutation checks incarnation/generation/version | Repository CAS, not client field trust. | FENCED_OPERATION. | T03/T04 |
| I19 | databaseBusy⇒spawnCount does not increase | SQL retry layer cannot invoke spawn. | DATABASE_BUSY only. | T06/T19 |
| I20 | corrupt/unknown event/recovery cannot trigger execution | Startup/reducer gates CLOSED. | STORAGE_QUARANTINED. | T18/T20 |

## 26. Physical output-fencing limitations

**DATABASE FENCING != PHYSICAL FILESYSTEM FENCING.** DB rejects old commits, host API rejects stale requests, process supervisor may stop an owned process, OS profile confines paths, publication makes approved output authoritative; none is interchangeable.

Proposed initial runtime policy: canonical project inputs read-only snapshot; unique per-attempt/per-launch-generation writable staging, no writable alias/junction/hardlink back to canonical project or another attempt. Private authority/artifact store denied to worker. Full project conflictHeld barrier stays until process scope **and** effects are classified; no assumption current MXC A-write tests prove safe concurrent same-project attempts.

Host copies validated output using safe path/handle/reparse rules into **host-owned immutable content-addressed artifacts** outside worker readability/writability. Verify complete bytes/hash/size and input provenance; worker cannot mutate copied artifact. Never publish a reference to a mutable worker-owned path. Blob creation occurs outside DB; if fenced/crash before commit, blob is an unreferenced orphan, not project output. Reference publication and terminal/task projection share current-generation SQL transaction. Garbage collection only after reference/recovery-retention proof, never while uncertainty could need evidence.

Initial publication changes a **DB manifest pointer**, not in-place project files. Actual patch application/Git/canonical writes require a separately specified, Owner-approved host publication broker with workspace exclusion, immutable inputs, intent/receipt, stale-broker fencing and crash reconciliation. A generation recheck immediately before a file write alone still has a check-to-use race. Until that independent protocol/OS protection is accepted, direct canonical writes and such promotion stay BLOCKED. Arbitrary tools with direct write grants cannot be claimed physically fenced or exactly-once.

## 27. Approval and security integration

Reuse intent of existing SyntheticApprovals/HostPathPolicy but do not expose fixture capability classes as production APIs. Proposed durable approval proof binds projectId/taskId/attemptId/generation/incarnation, runtime identity/version, bindingId/generation/root fileKey, executionScopeId, permission profile canonical digest, exact action fingerprint, input snapshot digest, issuer identity, decisionId and expiry. Host stores sanitized decision reference within authoritative events/projection binding; actual authenticated decision store/transport is a later prerequisite.

Changed command/path/runtime/profile/input scope or generation invalidates prior launch approval; require a new decision. One-shot consume recorded in the same LAUNCHING transaction; material action change after consume requires abandoning attempt/new authorization, not editing its fingerprint. Recovery stop authority is distinct from permission to resume execution. Model/worker text cannot generate approval, and Owner consent cannot waive unknown process/effect safety.

Credential custody remains separate: no real auth in workspace/env/prompt/logs/fixtures; host-owned broker only with independently proven boundaries. S9 glob limitation remains supplementary-defense guidance. No blanket user-drive/Temp grants and no networking/paid route enablement introduced by this design.

## 28. Subscription-first and billing constraints

RuntimeKind is allowlisted and immutable. Failed/expired/cancelled/blocked attempts never switch to paid API, purchased credits, other provider, new account or less restrictive sandbox automatically. Retry eligibility is not provider/billing authorization. Future launch requires separate verified entitlement and enforced included-only route/cap plus credentials/security gates; unknown entitlement blocks.

S11 authenticates no provider, reads no real credential, performs no inference/account query/spend. Worker/model cannot edit billing flags. These are design constraints, not provider-enforced cap evidence.

## 29. Implementation sequence

All stages **future, separately authorized**. Dependency graph (text, no tool-generated diagram): **contracts→SQLite foundation→lease/fencing→cancellation→recovery→process broker→real runtime readiness**. Production task contract/storage-v2 and private storage custody are explicit parallel dependencies before any runtime activation; initial S12 is host-only.

| Stage | Scope / proposed write boundary | Prerequisites / tests | Rollback / security gate / Owner |
|---|---|---|---|
|1 Contracts | Proposed new src/server/attempt-control/** and related contracts/tests; do not rename existing fixture symbols. | This design; typed phases/commands/CAS/reducer and synthetic-only API; T01–05/T40. | Revert new modules, leave fixture source intact; no dispatch; explicit source scope approval. |
|2 SQLite foundation | New authority repository/schema proposal under that new namespace; isolated test DBs. Later reviewed changes to actual state/database.ts/storage.ts/schema.ts only when authorized. | Stage1; schema/FK/version/idempotency/sidecar/extended-error tests; T01–08/T19. | No live downgrade/drop; offline backup/reopen/migration rollback procedure; migration must not auto-run against real data. Owner-approved file/data scope. |
|3 Lease/fencing | New authority command/clock layer and host-only two-process DB tests. | Stage2; T04/T09/T37/T38/T44; generation/renew/clock invariants. | Keep launch gate closed; retain ownership journal; explicit clock/lease review. |
|4 Cancellation | Durable authenticated stop-intent commands/decision mapping, no provider integration yet. | Stage3 + Owner auth contract; T10–13/T23/T32–34. | Disable API, preserve intent history, never erase accepted cancellation; separate authorization. |
|5 Restart recovery | Startup gate, cases, quarantine/retry grants and registry/state lifecycle integration. | Stages2–4; T14–23/T41/T43/T45. | Read-only quarantine mode; no automatic reissue; Owner-approved recovery procedures. |
|6 Process integration | Separately reviewed Windows supervisor/broker and synthetic containment harness; actual path/write scope decided in its request. | All above + OS storage/profile/fencing acceptance; T24–29/T35/T42. | Targeted owned cleanup + retained evidence; forced-tree experiments separately approved; no real workers. |
|7 Runtime readiness | Official app-server adapter/protocol/approvals/skills/custody/account/billing integration. | Production task contract/snapshot; all OS/process/runtime/security/account gates. | Disable adapter/dispatch, preserve state; no billing fallback; explicit activation authorization. |

S12 recommendation combines Stage1/2 foundation scope and generation/version CAS persistence only. Do not implement live lease timers, cancellation/process orchestration, app-server or coding workers in that first stage. Schema may represent later fields, but no active authority integration with demo task execution. Existing node:sqlite can be evaluated under authorized fixture tests; no dependency installation assumed.

## 30. Acceptance test plan

**NOT RUN in S11.** Every test below is a future specification. Common pass condition: expected durable row/event/projection and stated negative assertion both hold after independent reopen; failure of either is FAIL, not waived. Evidence: bound input identities, deterministic interleaving/barrier log, returned row counts/errors, sanitized command/receipt IDs, before/after SQL snapshots and integrity/reducer result tagged by test ID. No actual secret/provider.

Fixtures: **D** isolated disposable DB with proposed schema/synthetic project+task; **C** independent connections; **P** two independent host Node processes against the same D, never MXC; **K** injectable clocks; **O** owned synthetic Windows processes only with separate process authorization. These are proposed test fixtures, not files or processes created in S11.

| Test | Fixture / initial state | Stimulus | Expected durable result | Negative assertion / evidence focus |
|---|---|---|---|---|
| T01 unique issuance | D, eligible task/no hold. | Issue one fixed key. | One CREATED/g1/v1, epoch and event; FK valid. | No process/extra owner; key readback. |
| T02 duplicate issuance | D, issued key. | Repeat same and changed digest. | Identical returns prior; changed conflicts. | No new ID/version/epoch. |
| T03 expected version | C, same old v. | Two conditional updates. | Exactly one wins+one event. | CAS0 has no projection/event change. |
| T04 stale generation | D, g2 current. | Renew/complete/task mutate from g1. | All rejected. | No heartbeat/terminal/task effect; owner tuple snapshot. |
| T05 journal/projection atomicity | D, RUNNING. | Fault between row update/event then rollback. | Both old or both committed only. | No silent divergence; reducer snapshot. |
| T06 BUSY handling | C, writer/read lock as appropriate. | Issue/cancel/terminal budget exhaustion; COMMIT busy. | DATABASE_BUSY or single committed command; active COMMIT retried correctly. | No second body/spawn; bounded duration log. |
| T07 two connections | C, same free task. | Barrier-synchronized issue. | One hold/attempt owner. | Loser cannot silently acquire; reopen result. |
| T08 two OS hosts | P, same D/key and distinct keys. | Independent concurrent issue. | One project conflict holder; identical key dedup. | No process-local-mutex assumption/extra attempt. |
| T09 heartbeat/expiration | C+K, near deadline. | Exercise both commit orders. | New heartbeat invalidates old expiry, or quarantine blocks renewal. | Expiry never releases hold/reissues. |
| T10 cancel/completion | C, RUNNING. | Execute both serialization orders. | Completion-first terminal unchanged; stop-first late success rejected. | No COMPLETED+cancel intent contradictory row. |
| T11 cancel/timeout/duplicate | C+K, RUNNING. | Compete first reasons/new IDs/repeated ID. | One canonical stop, first reason preserved. | No duplicate finalization; changed payload conflict. |
| T12 competing terminals | P, one eligible attempt. | Two different receipt IDs simultaneously. | One terminal/event/task effect. | Other cannot overwrite; receipt/digest log. |
| T13 exact terminal replay | D, terminal. | Same ID/digest twice; same ID/different payload. | Same result0 extra events; conflict otherwise. | No external/task effect repeated. |
| T14 restart RUNNING | P, saved RUNNING then controller exits under owned test protocol. | Fresh recovery session. | Gate closed; uncertain/case/recovery-only epoch. | No launch/reuse of old grants. |
| T15 restart stop intent | D, committed undelivered cancellation. | New host reconciliation. | Original intent retained; bounded verified broker delivery candidate. | No resume/success bypass. |
| T16 stale lease UNKNOWN | D+K, expired owner/process unknown. | Recovery classification. | Case+hold, no assumed death. | No replacement despite deadline. |
| T17 late result after fencing | D, g2 recovery. | g1 completion/cancel ack. | Stale rejected or host-correlated observation only. | No current-generation promotion from raw old callback. |
| T18 corrupt event history | D snapshots with gap/unknown type/hash/terminal mismatch. | Fresh checked reopen/reducer. | Project blocked/quarantined. | No auto repair/dispatch/reset. |
| T19 interrupted/unknown commit | D, staged issue/terminal transaction. | Controlled connection/statement fault, future process fault with approved scope. | Atomic readback by command ID. | No duplicate issuance/spawn/body; no power-loss claim. |
| T20 malformed receipt | D, RUNNING. | Truncated/wrong schema result/recovery input. | Rejected/quarantined. | No terminal or new attempt. |
| T21 restore/incarnation | D, approved offline backup with closed scopes. | Restore under maintenance, rotate incarnation. | Old grants rejected/new host gate closed. | No imported work resume; unsupported live swap blocked. |
| T22 recovery host interruption | P, open case. | Stop recovery before/after CAS commit; fresh inspector. | Idempotent consistent case/epoch. | No two case owners/auto retry. |
| T23 DB unavailable cancellation | D/O only if separately approved. | Deny DB access/BUSY during stop. | STOP_INTENT_NOT_COMMITTED or resolved real commit. | Emergency observation cannot fabricate accepted/terminal state. |
| T24 cooperative cancellation | O, approved profile/known A-B canaries. | One scoped request after READY/ownership. | Ack/exits then terminal; A allow/B deny. | No assumed exit from ack; no real services. |
| T25 deadline expiration | O+K, fixed self-expiring workload. | Miss deadline under owned test bounds. | Timeout intent/unknown status separated from exit. | No terminal before verified closure/forced-tree claim. |
| T26 exit without ack | O, valid intent, ack lost. | Correlated complete scope exit. | Explicit missing-ack observation; reconciled terminal if effects safe. | No dependence on worker self-report alone. |
| T27 partial process tree | D/O, parent or launcher exited/child unknown. | Reconcile partial receipts. | UNKNOWN_SCOPE/hold retained. | No conflicting attempt. |
| T28 PID reuse | K/O metadata model; never target unrelated live process. | Same PID/different creation identity. | IDENTITY_MISMATCH. | No terminate-by-name/PID operation. |
| T29 forced tree cleanup | O, separately approved exact owned topology. | Future emergency/tree test. | Actual verified owned descendant exits with evidence. | Cooperative exit is not PASS for this gate. |
| T30 project mismatch | D/C, genuine A task/binding. | Inject B UUID/root/reference. | Identity/scope rejection. | No B DB/task/read/write grant. |
| T31 binding change | D with backend registry snapshot. | Replace fileKey/binding generation/archive status. | Quarantine/no new grant. | Existing attempt cannot rebind. |
| T32 invalid stop target | D, current g/intent. | Wrong project/generation/request ID/digest. | Reject; canonical request stable. | No accepted cancellation from untrusted source. |
| T33 missing approval | D, pending/no decision. | Consume launch grant/model-written ALLOW. | Dispatch denied. | launchConsumed stays0; no OS. |
| T34 action fingerprint change | D, approved action. | Modify runtime/path/profile/input/epoch. | Approval invalid; require new decision. | Old grant not reusable. |
| T35 stale output publication | D+artifact model, fenced owner. | Old owner publishes manifest. | CAS rejected; orphan blob unreferenced. | No canonical file or task projection change. |
| T36 billing fallback | D, subscription route unavailable. | Failure/retry suggests paid route/provider switch. | Blocked unchanged immutable route. | No API/credit/account call. |
| T37 clock/sleep/reboot | K, active lease. | ±wall step, late mono, sleep/resume, new domain. | Grant invalid/quarantine; no takeover from timestamp. | No lease revival/auto restart. |
| T38 ownership acquisition | P, UNCERTAIN old epoch. | Competing recovery claims. | One g+1 matching owner_epoch/event. | No EXECUTION mode/launch reset on takeover. |
| T39 task-version conflict | D, task changed after attempt input. | Terminal attempt+task CAS. | Whole terminal/event rollback, case opened separately. | No event COMPLETED while task CAS failed. |
| T40 schema/immutable guards | D. | Mutate identity/g decrease/terminal rewrite/cancel pointer or missing epoch. | Constraint/repository invariant rejection. | No invalid commit after independent reopen. |
| T41 retry grant | D, unresolved then closed case. | Retry before closure; then duplicate approved grant. | First rejected; later at most one new attempt and grant consumed atomically. | No automatic retry/reused ID or permit. |
| T42 blob/pointer crash | D+host artifact model. | Stage mutates during copy; crash/fence before pointer commit. | Reject mutable copy or retain unreferenced immutable blob. | No mutable worker path published/canonical patch applied. |
| T43 archive/unavailable project | C, active hold or missing DB. | Archive/delete/issue using cache. | Maintenance/hold rejection; no empty DB fallback. | No active DB moved/destroyed. |
| T44 heartbeat/ack dedup | D, known g/seq. | Duplicate seq+same/different digest; old nonce ack. | Idempotent identical or stale/conflict rejection. | No owner revival or duplicate event. |
| T45 registry lifecycle | Isolated registry fixture, no real app root. | Two startBackend/controller clients and stale lock. | Existing exclusion preserved; authenticated future controller tickets only. | No lock deletion/claim of current multi-backend support. |

No result row above is currently PASS. Future fault injection must use owned disposable databases/processes with explicit authorization; no real backend kill or power failure is implied.

## 31. Unresolved decisions and risks

No safety-critical topology/ordering choice is left ambiguous: Option A; DELETE/EXTRA; one project conflict holder; first stop commit wins; no automatic worker retry; recovery-only takeover; immutable artifact pointer publication; offline restore/new host gate. These are **proposal decisions awaiting Owner acceptance**, not executed changes.

Implementation-validation dependencies remain: production task contract/snapshot separate from demo; storage-v2 sidecar/extended-error adapter; proven private DB/artifact custody; trusted Windows process/scope broker, clock resume/boot observation and forced-tree cleanup; actual approval/auth/runtime/account/billing gates. Each has a fail-closed path above and a staged test; none is silently assumed implemented.

Physical direct-project promotion/irreversible tools remain blocked, with no exactly-once promise. Uncontrolled privileged DB rollback or host storage tampering is outside supported operation and cannot be cured by a generation counter inside that same restored file. Unknown provenance requires manual global scope/effect review before activation.

Baseline read-only selesai pada **2026-10-30 05:01:00 UTC**; comparison sesudah penulisan kedua reports pada **2026-10-30 05:23:55 UTC**. Actual per-path SHA-256: **AI-Office129→131 files** outside node_modules, seluruh129 existing hashes cocok,0 modified/deleted; hanya dua report S11 ditambahkan. Installed Codex **50/50**, Hermes3D **647/647 tracked files**, dan **373/373 regular files pada11 retained roots** termasuk43-file S10 cocok. Retained reparse records sama dan tidak diikuti. Hermes HEAD **beb76292747b816ef317aa6f9a3992e0014f81d9**, pre-existing modified package-lock.json dipertahankan. Tidak mengklaim hash audit node_modules, untracked Hermes atau external Google AI Studio; area tersebut tidak ditulis.

| Protected source | SHA-256 unchanged before/after |
|---|---|
| src/server/runtime-security/context.ts | 709E004A7E74D9F25C7F86F2D8AB502258B6DF9F9EC9DE2F503338B185E17781 |
| src/server/runtime-security/journal.ts | F17233CB87AD11B443F6D9A218316D837DA0B57EA6B64CA785C33965EFEB7248 |
| src/server/runtime-security/supervisor.ts | CBDBF309F30101A41F144EF6B676080BE2A1678D4B5FF457A233B4892EA1DF03 |
| src/server/state/database.ts | 30533EDC54C7297B9B0F6BDFF3CD88374DA8F00DBF2FFE7B041F84A0A69EF127 |
| src/server/state/storage.ts | 8F0CA87764D6252A0C72442829A1CA1B69618AF156961022E692DD1758682C62 |
| src/server/state/schema.ts | FE2A7BAFAE61B54971F702870A1AD0D28CA49B4828505FAE6829EE5990820790 |
| src/server/workspace/registry.ts | D7E267AAF035413759EF6A1DF4CFE9707582CC66BAC4F06803658727F6CCB33A |
| src/server/index.ts | BD44650661805CA4737115726DAD38AB896DF397CA4AB3B4B55B87F722F0A186 |
| src/contracts/demo.ts | B913A5AFC42A78C1B917DDE4BCB0AD4A68FAD75CFC1EF3C47634F0D8A5EDDC2F |

Pemeriksaan Markdown: report A33 sections; report B10 sections/52 ordered unique gates/22 D-deliverables; A mempunyai20 C-races,20 W-windows,20 I-invariants,45 T-tests,7 proposed CREATE TABLE blocks. Local links valid, fences seimbang, status vocabulary sesuai. Ini pemeriksaan dokumen, bukan SQL syntax execution atau state-machine simulation. Semua baseline/comparison berada di memori sesi; tidak ada S11 manifest/temp file baru.

Actual SQLite files are never opened through a database engine; historical synthetic evidence is hash-read only. No S11 fixture/temp/evidence file is created.

## 32. Recommended next milestone

**M02-02S12 — Durable Attempt Authority Foundation Implementation**: state/identity/command contracts, isolated SQLite schema/repository, transactional issue, generation/version CAS, event/projection consistency and host-only independent-connection/process concurrency tests. New source namespace and exact file boundaries require its own request; no authorization inferred from this design.

First stage has **zero MXC, cancellation/process integration, real project migration, app-server, auth/inference or worker activation**. Synthetic-only fixture persistence establishes foundation without promoting demo data to runtime authority. Later live-data migration/dependency integration needs separate review.

## 33. Owner approval requirements

Owner reviews Option A storage authority, conservative one-project conflict policy, stricter cancellation ordering, DELETE/EXTRA durability baseline, immutable artifact publication and fail-closed manual recovery. No further decision is required to finish S11 documentation; implementation/source/schema writes require explicit separate authorization. No S12/M02-03/runtime process started.

**SOURCE VERIFIED != DESIGN SPECIFIED != IMPLEMENTED != RUNTIME VERIFIED.**
**DURABLE JOURNAL != EXACTLY-ONCE EXTERNAL EFFECTS.**
**LEASE EXPIRY != PROCESS TERMINATION.**
**DATABASE FENCING != PHYSICAL FILESYSTEM FENCING.**
**SYNTHETIC RECONCILIATION != PRODUCTION CRASH RECOVERY.**

**M02-02S11 COMPLETE — IMPLEMENTATION-READY DURABLE ATTEMPT CONTROL DESIGN ACCEPTED — PRODUCTION WORKER BLOCKED — AWAITING OWNER REVIEW.**

