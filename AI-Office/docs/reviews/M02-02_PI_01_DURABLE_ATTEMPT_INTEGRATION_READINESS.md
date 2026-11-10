# M02-02-PI-01 — DurableAttemptRepository Integration Readiness

## A. Executive Decision

**`PI01_M02_EXIT_CRITERIA_INCOMPLETE + SECURITY_STOP_PRESERVED`.** Inspeksi arsitektur dan desain integrasi dalam scope PI-01 selesai; implementasi dan aktivasi produksi belum diizinkan. Kriteria M02 yang ditemukan sudah direkonsiliasi pada [Document B](M02-02_PI_01_MILESTONE_EXIT_AND_SECURITY_GATE_MATRIX.md), tetapi final PRD/sign-off acceptance baseline yang mengesahkan rincian current M02 tidak ditemukan. Roadmap menyatakan dirinya draft; ini tidak boleh dipromosikan menjadi acceptance contract approved.

Temuan utama: `DurableAttemptRepository` benar-benar ada, tetapi concrete construction hanya `openForTest`, storage berprofil synthetic, dan tidak ada caller pada jalur aplikasi HTTP. Tidak ditemukan production admission controller, output broker, atau sumber SECURITY_STOP otoritatif yang dibaca transaksi repository. Default aplikasi memang mematikan worker/provider/Paid API; ini berbeda dari implementasi security-stop/revocation berversi.

Satu transaksi metadata per authority database **feasible setelah repository contract/schema berubah**. Transaksi lintas demo DB, JSON harness journal, authority DB lain, OS process, provider atau filesystem publikasi tidak terbentuk hanya karena sebagian komponen memakai SQLite. Aktivasi produksi tetap **BLOCKED**. Tidak ada source, schema, database, runtime atau historical evidence diubah oleh PI-01; hanya dua laporan baru.

## B. Historical Checkpoint

R9 manifest SHA-256 `F105CAFEFABC4888B68862C1BBDBC93ADD82EA8E406F73C11BFDED6909B0EF53` cocok; 387 listed evidence files plus self-excluded manifest dan empat repo additions diperiksa. Final R9 run2 JSON mencatat R5=100, R6=72, R7=84, R8=91, R9=91, total **438 PASS**, test/typecheck exits 0. Ini **historical evidence verified by hash**, bukan tes baru PI-01. PI-01 menjalankan **0 tests, 0 typechecks, 0 database opens, 0 application/probe scripts**.

R8-20 dipertahankan: original R8 `evidence/tests-run1.json` tertimpa run2 dan tidak tersedia. Run1 preflight/results/stdout/stderr serta final unique run3 tetap tersedia dan tercakup historical hash verification; R9 carry-forward review juga tersedia. Tidak ada rekonstruksi atau relabeling R8-20 menjadi unqualified PASS. Integritas surviving historical bytes tidak berarti diagnostic completeness atau certification of OS facts.

`SECURITY_STOP_PRESERVED`; real workers BLOCKED; Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; Jc custody/membership NOT_OBSERVABLE; PID24956 provenance INCONCLUSIVE; provider authorization NOT_VERIFIED; archive PENDING_AUTHORIZATION. Option A pada R3 §H berarti **No Action / Preserve Security Stop**, bukan izin worker atau pilihan lokasi database. Latest historical runtime observation tetap `2026-11-09T06:29:44.7514982+07:00`. Tidak ada observasi proses/handle/PID baru. R9 close/reopen bukan abrupt-process/power-loss proof atau production transaction proof.

## C. Repository Baseline

Baseline aktual sebelum laporan: **491 AI Office files**, **165 default Git status entries**, **1,450 available historical files / 22 roots**, **647 tracked Hermes3D files dan tracked path set**. Baseline cocok dengan R9 inventory plus empat additions R9. Semua existing user changes dipertahankan; tidak ada AGENTS.md yang berlaku pada target/ancestor yang ditemukan.

Inventory/hash inspection mengecualikan directory `.git`/`node_modules`, tidak mengikuti reparse points dan membandingkan reparse metadata. Older unavailable 2,209 files / 17 roots tetap NOT_VERIFIED. Tidak membuka valuable/project databases atau credential stores. Perintah yang dijalankan hanya pembacaan source/docs/JSON, `rg`, hashing/traversal, dan Git read-only dengan `--no-optional-locks`; tidak mengimpor atau mengeksekusi modul aplikasi. Baseline disimpan dalam memori sesi; tidak menulis evidence ke historical TEMP atau membuat persistence fixture baru.

Sumber utama dan lokasi konkret:

| Ref | Sumber | Bagian yang menjadi bukti |
| --- | --- | --- |
| S01 | [repository.ts](../../src/server/attempt-control/repository.ts#L19) | Class, openForTest:22, private transaction:33, current:59, issue:77, update:103. |
| S02 | [contracts.ts](../../src/server/attempt-control/contracts.ts#L20) | Identity/Expected/Issue/Attempt; synthetic literals:29/35/43; databaseError:78. |
| S03 | [schema.ts](../../src/server/attempt-control/schema.ts#L3) | USER_VERSION=5, synthetic PROFILE; attempts/epochs/events/constraints/triggers. |
| S04 | [test-storage.ts](../../src/server/attempt-control/test-storage.ts#L32) | S12–S15-only root constructors; storage/connection/pragma/schema ownership. |
| S05 | [state-machine.ts](../../src/server/attempt-control/state-machine.ts#L5) | Lifecycle edges, owner/version assertions, synthetic transition authorization. |
| S06 | [journal.ts](../../src/server/attempt-control/journal.ts#L27) | appendEvent/verifyHistory on caller connection; projection/history consistency. |
| S07 | [lease.ts](../../src/server/attempt-control/lease.ts#L23) | Lease freshness; explicit unleased legacy bypass:36. |
| S08 | [cancellation.ts](../../src/server/attempt-control/cancellation.ts#L8) | WeakMap synthetic HostAuthority and terminal closure requirements. |
| S09 | [recovery.ts](../../src/server/attempt-control/recovery.ts#L8) | Test recovery authority; quarantine, dispatch CLOSED, retryAuthorized false. |
| S10 | [server/index.ts](../../src/server/index.ts#L12) | Actual composition root: registry/state service/manager/HTTP, no attempt repository. |
| S11 | [http.ts](../../src/server/http.ts#L9) | Complete route map; local session checks:79; request dispatch:98. |
| S12 | [workspace/manager.ts](../../src/server/workspace/manager.ts#L90) | Foreground attachment/context, invalidate:55, state delegation:124. |
| S13 | [state/service.ts](../../src/server/state/service.ts#L24) | Fixture-only state, load:68, seedDemo:110, not attempt execution. |
| S14 | [state/database.ts](../../src/server/state/database.ts#L15) | Per-call independent SQLite handles, schema v1, demo record reads. |
| S15 | [state/storage.ts](../../src/server/state/storage.ts#L15) | Initialization ledger; no task/execution authority. |
| S16 | [supervisor.ts](../../src/server/runtime-security/supervisor.ts#L32) | Synthetic harness only; approval consume:91 then JSON transition:92 then fork:103. |
| S17 | [runtime-security/approval.ts](../../src/server/runtime-security/approval.ts#L14) | In-memory approvals/controller identity; consume/revoke:50. |
| S18 | [runtime-security/context.ts](../../src/server/runtime-security/context.ts#L52) | Fixture-only in-memory context issuer, roots and tombstones. |
| S19 | [runtime-security/journal.ts](../../src/server/runtime-security/journal.ts#L39) | Separate JSON fixture journal and writer lock; not S01 SQLite. |
| S20 | [execution-fence.ts](../../src/contracts/execution-fence.ts#L4) | Pure supplied-evidence predicates, no authenticity/execution authority. |
| S21 | [contracts/policy.ts](../../src/contracts/policy.ts#L5) | Immutable foundation flags false, demo mode, quota UNKNOWN. |
| S22 | [web/api.ts](../../src/web/api.ts#L45) | Local UI session credentials and snapshot/brain requests, not provider credentials. |
| S23 | [web/workspace/controller.ts](../../src/web/workspace/controller.ts#L66) | Snapshot binding/version checks, UI state only. |
| S24 | [web/visual/mapper.ts](../../src/web/visual/mapper.ts#L5) | Demo task/event projection to visuals. |
| S25 | [attempt test helpers](../../tests/integration/durable-attempt-foundation/helpers.ts#L14) | Actual factory caller; test-only issue/transition helpers. |
| S26 | [child-client.mjs](../../tests/integration/durable-attempt-foundation/child-client.mjs) | Additional isolated test caller; read, not executed. |
| S27 | [scripts/dev.mjs](../../scripts/dev.mjs#L102) | Backend/frontend development launcher; not worker scheduler. |

References denote source inspection, not current executable behavior verification. Proposed filenames below are explicitly new/design-only.

## D. Actual DurableAttemptRepository Architecture

Concrete class S01 is the only implementation found; no separate production interface/factory/DI binding was located. Constructor owns a private `openTestConnection(ref)` result. `openForTest(TestDatabaseRef, fault?)` verifies existing attempts/history and returns the class. S04 only accepts marked disposable roots named for S12–S15, fixed `authority.db`, matching file identity/schema/profile. S02 requires `runtimeRef: "s12-host-only"`, `executionMode: "synthetic"`, transition authorization literal `"s12-test-only"`. These strings are fixture discriminators, not production identity authentication.

| Component / file | Actual caller | State owner / DB / transaction | Observable effects / failure behavior | Source-backed gap |
| --- | --- | --- | --- | --- |
| DurableAttemptRepository / S01 | S25 fixture factory; S26 and other durable-attempt tests. `src`/`scripts` search finds no application caller. | Private repository connection, SQLite S04 authority.db, each public method starts its own private transaction. | SQL projection/epoch/event writes; schema/history/CAS failure throws; BUSY/LOCKED mapped; no spawn/network. | No production constructor or shared public transaction API. |
| transaction / S01:33 | issue, transition, terminal, lease/cancel/recovery methods. | BEGIN IMMEDIATE for write, BEGIN for read, same connection across internal helpers. | COMMIT or rollback; rollback failure closes repository/throws AggregateError. | Generic database failure does not expose a general accepted-operation ambiguous-commit resolution contract. |
| current/update / S01:59/103 | Repository methods only. | Identity/current row/history; SQL CAS on incarnation/generation/version/phase/host/owner/hash. | Projection + optional owner epoch + journal + verify in one transaction. | No security policy/capability/output-operation records to include yet. |
| ProjectStateService / S13 | S12 via actual HTTP composition S10/S11. | Separate per-project demo DB via S14; private context WeakSet. | Fixture init/demo seed/read/knowledge; binding/hash/schema failures deny. | Does not write/read S01 attempts; no real worker task state. |
| SyntheticSecurityHarness / S16 | Isolated runtime-security tests, not application imports. | Context/approval/run Maps plus S19 JSON journal; async serial queue. | Fixed test probe fork, stream capture, cancel/owned child stop; synthetic evidence only. | Approval consumption + JSON transition + OS fork are separate effects, not S01 transaction. |
| HTTP/UI / S11/S22/S23 | Browser/local launcher. | In-memory bootstrap/session/nonce and foreground bindings; demo snapshot DB. | Request-response JSON/brain content, development stdout; no execution route. | UI/local session is not trusted provider/principal/admission authority. |

Actual request path: `ApiClient.snapshot → POST /api/state/snapshot → WorkspaceManager.projectSnapshot → ProjectStateService.load → useDatabase(readOnly) → readRecords → JSON reply → controller binding/version validation → visual mapper`. Workspace initialization and brain reads use adjacent manager/service methods. **No request-entry-to-DurableAttemptRepository persistence path exists** in the inspected application. This absence is the integration finding, not a guessed missing call.

## E. Production Attempt Lifecycle

Actual repository lifecycle is synthetic durable attempt state, not an active production worker lifecycle:

| Current phase | Allowed outgoing phases in S05 |
| --- | --- |
| CREATED | APPROVAL_PENDING, INTERRUPTED, UNCERTAIN |
| APPROVAL_PENDING | APPROVAL_GRANTED, APPROVAL_DENIED, INTERRUPTED, UNCERTAIN |
| APPROVAL_GRANTED | LAUNCHING, INTERRUPTED, UNCERTAIN |
| LAUNCHING | RUNNING, FAILED, CANCELLATION_REQUESTED, UNCERTAIN |
| RUNNING | COMPLETED, FAILED, CANCELLATION_REQUESTED, UNCERTAIN |
| CANCELLATION_REQUESTED | INTERRUPTED, UNCERTAIN |
| UNCERTAIN | RECONCILIATION_REQUIRED |
| RECONCILIATION_REQUIRED | FAILED, INTERRUPTED |
| COMPLETED / FAILED / INTERRUPTED / APPROVAL_DENIED | None; immutable terminal projection. |

`issue` atomically inserts CREATED attempt + owner epoch + event; stable `(projectId,taskId,issueRequestId)` digest controls replay. `transition` forbids terminal targets, validates Expected/edge/lease/recovery/cancellation; terminal uses `commitTerminal` receipt/digest and idempotency. Lease renewals update sequence/version; concerns quarantine UNCERTAIN. Recovery inventory reports dispatch CLOSED. Reconcile does not resume execution or grant retry.

`authorityIncarnation` identifies database authority, not a provider thread. `attemptId` is a UUID per attempt. `attemptGeneration` fences owner changes, not an automatic run restart; `stateVersion` also increments on lease/cancel events and is not authorizationRevision. Host/owner UUID + ownerNonceHash/possession do not authenticate a human principal. Foreground binding generation is another counter and switching foreground invalidates UI contexts; it cannot be used as a long-lived worker lease.

Important conservative limitation: `conflictHeld` is literal 1 in S02/S03; unique `runtime_project_conflict` applies to every retained row, including terminal rows. `issue` rejects a new same-project attempt once a hold exists. No release/retry issuer exists. Do not bypass it by deleting history or merely seeing a terminal phase; safe release requires verified process/effect closure and separate scope. Legacy nullable leases intentionally skip lease validation (S07:36); production must not inherit that bypass.

## F. Canonical Authority Ownership

| Concern | Actual implemented owner / persistence | Same authority transaction today? | Required future owner / unresolved part |
| --- | --- | --- | --- |
| Durable attempt identity/phase/owner epoch | S01/S03 authority.db, synthetic-only. | Yes within S01 method. | Evolve existing repository under approved production storage constructor; no second attempt DB. |
| Project/root identity | Workspace registry + identity file; binding/contexts in S12 memory. | No, different files/memory from authority.db. | Host validates immutable worker binding; persisted binding revision/digest with freshness contract. |
| Task/UI/project state | S13/S14 demo DB, demo tasks/events only. | No; independent file/handle. | Future official task authority and read-model projection; demo rows never silently become real tasks. |
| SECURITY_STOP | Historical/operator handoff; S21 fixed disabled flags; supplied states only in R5/test fixtures. | No programmable versioned stop row in S01. | Default-deny project security record in same authority transaction; global operator inhibit separately enforced. |
| Admission/approval | No production controller; S17 in-memory synthetic approvals and S18 fixture contexts. | No. | Authenticated host decision/provenance store, policy/authorization revision and scoped grants. |
| Cancellation | S01 requestCancellation and S08 persisted cancellationPayload; test HostAuthority in WeakMap. | Yes for durable synthetic intent/receipts, not OS stop. | Preserve intent ordering; real trusted process receipt correlation remains blocked. |
| Revocation | S17 memory; R7/R8/R9 isolated owner controls. No S01 production permission revocation ledger. | No. | Repository-owned security/grant revisions; same transaction as new acceptance. |
| Output acceptance/sequence/artifact ownership | No production owner; demo events and terminal receipt hashes are not a publication broker. | No. | Accepted operations + output head/immutable manifest pointer + claim within authority.db. |
| Capability consumption | R8 memory / R9 separate fixture SQLite only. | Not in S01. | Normalized scoped grant and claim records under S01 transaction owner. |
| Auth/account/entitlement/billing | Contract/approved policy intent; no source-backed production verifier/client found. | External facts cannot join local SQL transaction. | Trusted bounded attestations + revalidation; UNKNOWN denies execution; no paid fallback. |
| Anti-rollback witness | Not found. Local digests/incarnations are stored with the database. | No independent trust source. | Unsupported restore blocks activation; future protected witness/operator recovery protocol, not checksum. |

Same SQLite engine does not mean same file, connection or transaction. R9 journal is not production authority and must not replace S01 or be imported to instantiate a second canonical owner.

## G. R5–R9 Compatibility Assessment

| Layer | Reusable contract/semantics | Integration rule |
| --- | --- | --- |
| R5 | Pure runtime-shape validation, scope/stop/policy/provider/sequence predicates. | Direct pure import through a repository-owned adapter is viable. Source all trusted context inside transaction; never accept caller `VERIFIED` assertions as authentication. |
| R6 | One accepted effect with state/idempotency/sequence mutation or no mutation. | Adapt semantics to SQL CAS/constraints; do not commit R6 memory then separately insert database rows. |
| R7 | Origin, generation/incarnation, current authorization revision. | Implement actual trusted issuer/record linkage, not fake reference serialization or branded strings. |
| R8 | Independent admission/publication actions, exact task/destination, single-use/revocation. | Production grant/claim rows bound to actual Attempt and principal/session; mock literals and handles do not become production permits. |
| R9 | One SQLite commit, claims/accepted rows/journal, stable retry/ambiguity/recovery checks. | Reuse design/testing lessons within existing repository; do not load R9 fixtures or use replay-based fake authority as live state. |

Exact field mapping and gaps:

| Required field | Existing domain | Proposed resolution; no inferred equivalence |
| --- | --- | --- |
| Project/task/attempt | IdentitySchema: projectId UUID, taskId ReferenceId, attemptId UUID. | Reuse exact fields; R5 runId may represent attemptId only through an explicit adapter. |
| Run incarnation | authorityIncarnation UUID + attemptId identify authority/attempt. | Bind both plus dedicated invocation identity where real processes exist; owner fencing never resurrects invocation. |
| Epoch/version | attemptGeneration, stateVersion, bindingGeneration already distinct. | Check all relevant counters. Do not alias stateVersion to authorizationRevision or assume a generation change authorizes execution. |
| Project/session ownership | Project ID exists; worker session/principal binding does not. | Add durable execution-session binding and authenticated subject; ownerId is host owner identity, not automatically principal/session. |
| Authorization/policy | Digests exist, no policyVersion/auth revision or authentic approval record. | New normalized versioned security/policy/approval records; digests are integrity metadata only. |
| Capability/action/task/destination | No repository capability/claim/destination tables; taskId and scopeDigest exist. | Exact action and task/destination rules in grants; normalized rule data needed to resolve digests. |
| Cancellation/stop | CancellationPayload exists; stop record absent. | Parse pending intent even when phase unchanged; read canonical project stop in same transaction. |
| Idempotency/output | Issue/event/terminal identities exist; no generic output acceptance key/head. | Add stable logical-operation identity/receipt/head; include authority/incarnation/subject/scope in canonical digest. |

## H. Transaction Boundary Design

**Smallest eventual acceptance API — design only, not existing source:** `DurableAttemptRepository.recordAuthorizedOperation(command, trustedHostContext)`. Public code cannot supply a connection or arbitrary callback. Repository alone opens BEGIN IMMEDIATE and constructs a private transaction-scoped view; internal helpers receive that same `db`, cannot escape/await or open another connection. Calling existing public `transition()` from inside it would nest transactions and is prohibited; reuse private `current/update/appendEvent` with the current connection instead.

Proposed input/output shapes use actual domain types; all additions are labelled proposed:

```typescript
// DESIGN ONLY. Types/fields not present today must be introduced explicitly.
type Identity = Pick<Attempt, "projectId" | "authorityIncarnation" | "taskId" | "attemptId">;
type VersionExpectation = Pick<Expected, "attemptGeneration" | "stateVersion" | "phase">;
type CommonCommand = Readonly<{
  operationId: string; idempotencyKey: string; // ProjectIdSchema UUID validation
  identity: Identity; expected: VersionExpectation;
  capabilityId: string; workerSessionRef: string; // ReferenceIdSchema
  expectedAuthorizationRevision: number; expectedPolicyVersion: string;
  taskScope: string; destinationId: string; // exact canonical IDs, not paths
}>;
type AuthorizedOperationCommand =
  | (CommonCommand & { action: "RECORD_ADMISSION_INTENT"; workerType: string; providerId: string | null })
  | (CommonCommand & { action: "ACCEPT_OUTPUT_METADATA"; output: OutputEnvelope;
      immutableArtifactRef: string | null; contentDigest: string | null });
type OperationResult = Readonly<{
  outcome: "DENIED" | "COMMITTED_INTENT" | "EXISTING_COMMIT" | "COMMIT_UNKNOWN";
  operationId: string; reason: string; receiptId: string | null;
  observedIdentity: Identity | null; stateVersion: number | null;
  authorizationRevision: number | null; policyVersion: string | null;
  acceptedSequence: number | null; executionAuthority: false;
}>;
```

`Attempt/Expected` are S02 types; `OutputEnvelope` is S20. Proposed strings above must have the named existing validators/bounds, strict unknown-field rejection and positive safe integer versions; this is not a compiled interface or implementation. TrustedHostContext must be an internal authenticated host capability with principal/session/issuer/owner possession and clock continuity; its factory is **not implemented**. It cannot be constructed from `authorization: "s12-test-only"`, UI session strings or unkeyed digests. Owner nonce is resolved by the host owner subsystem, never accepted from a worker/UI command as an authorization grant.

Wrapper and output identity fields must agree with each other and the canonical record: output runId is the explicitly mapped attemptId, output taskScope/destination/policy/epoch must match the command and trusted bindings. Reject contradictory duplicate fields; never select whichever copy passes. Subject is resolved from authenticated principal binding and is not automatically the current host ownerId.

Transaction order: load canonical attempt/meta/security/policy/grant/session/destination; authenticate provenance and owner possession; validate exact identity/generation/version/cancellation/lease; resolve exact prior key without creating new rights; validate stop/revisions/expiry/scopes; evaluate R5 with trusted data; claim permission; insert acceptance; update attempt version/output head and journal; optionally insert durable delivery intent/outbox; verify invariants; COMMIT. A later external broker still requires separate execution/delivery authority.

| Requirement | Feasibility / exact reason |
| --- | --- |
| TB-01 stale caller assertions | REPOSITORY_CONTRACT_CHANGE_REQUIRED: current Attempt lacks policy/principal/security records; client version fields are expectations only. |
| TB-02 consumption without acceptance | SAME_TRANSACTION_FEASIBLE after schema/API change: claim and accepted row FK/unique in S01-owned transaction. |
| TB-03 acceptance without consumption | SAME_TRANSACTION_FEASIBLE after schema/API change: matching-claim constraint/trigger for required grants. |
| TB-04 rollback preserves both | SAME_TRANSACTION_FEASIBLE only within same authority.db connection; not JSON harness or demo DB. |
| TB-05 duplicate retry | REPOSITORY_CONTRACT_CHANGE_REQUIRED: add generic logical-operation key/receipt; existing issue/terminal replay is narrower. |
| TB-06 revocation ordering | REPOSITORY_CONTRACT_CHANGE_REQUIRED: same-file revision/grant mutations serialize with acceptance; external revocations need freshness protocol. |
| TB-07 security-stop freshness | ATOMICITY_BLOCKED today: no authoritative store. Local project row is feasible; global stop across independent project DBs is CROSS_STORE_CONSISTENCY_REQUIRED. |
| TB-08 version conflict | SAME_TRANSACTION_FEASIBLE for existing Expected/CAS; new security/output revisions require contract changes. |
| TB-09 external effect rollback | CROSS_STORE_CONSISTENCY_REQUIRED: OS/provider/file/network delivery cannot roll back with SQL. |
| TB-10 DB commit is not execution | REPOSITORY_CONTRACT_CHANGE_REQUIRED: explicit committed-intent result with false authority and a separate gated host broker. |

All SAME_TRANSACTION_FEASIBLE labels describe a future implementation, not established production atomicity. No external account/provider check or filesystem mutation runs while holding the database transaction. Such evidence must have a trusted identity, version/fingerprint, validity and revocation strategy; if freshness cannot be established, deny.

## I. Capability Consumption Integration

Proposed additions in the existing authority schema: versioned `runtime_execution_security`, execution-session/destination binding, scoped grant records, `runtime_capability_claims`, `runtime_accepted_operations`, `runtime_output_heads`, and later outbox/audit rows. These are **new schema proposals**, not existing tables or authorized migrations. Use project+authorityIncarnation foreign keys; bind each grant to attemptId/generation, subject/session/worker, policy/auth revision, exact actions/task/destination and validity. SINGLE_USE claim key must be unique per grant; accepted operation/claim linkage and stable key uniqueness must be database constraints.

Grant issuance and revocation require authenticated host decisions; no borrowed R8 handles or new fake-authority service. Consumed grant + exact committed retry may return historical receipt only after authenticated read authorization; it never grants a second launch/publication. Conflicting key/body/subject/incarnation/action/scope rejects. Policy/epoch/session changes invalidate prior grants, not rewrite them. Bound audit metadata excludes secrets/raw provider payload.

Existing S03 event types and S06 reducer do not support same-phase OUTPUT_ACCEPTED: adding an event enum alone is insufficient. Extend schema, typed journal parser, reducer validation and cross-table receipt/sequence checks together. S01 `update` already coordinates projection/epoch/event on one connection and is the eventual extension seam. No public raw-transaction callback/second connection should be exposed to producer code.

## J. Admission Enforcement Integration

No production admission controller exists. Existing `APPROVAL_GRANTED → LAUNCHING` is a synthetic state transition, not proof of principal authentication, stop clearance, provider rights or containment. Future repository acceptance must gate that transition before any launch intent is handed to a broker. Avoid a route-only check: UI/direct task, future PM scheduler, reconnect/resume/retry, background session, provider event and internal API paths must converge on the same host command/policy and repository enforcement boundary.

| Required gate | Current evidence / future enforcement location |
| --- | --- |
| Principal/project/session | S11 authenticates a local browser session, S12 foreground association; neither authenticates provider/worker principal. Future host identity/session binding persisted and read in S01 transaction. |
| Stop/current policy | S21 fixed disabled flags; no S01 stop/policy authority. Missing/UNKNOWN/INVALID/ACTIVE denies; synthetic CLEARED never clears historical stop. |
| Attempt/generation/lease | S01/S05/S07 provide synthetic CAS/owner/lease. Real path must require active trusted clock/host continuity; no legacy unleased bypass. |
| Capability/provenance | No production issuer/ledger. Future grant verification/claim in same transaction; client flags/digests cannot establish permission. |
| Containment | Historical scope/Jc/process limitations remain. Future host broker requires separately verified OS scope and owned process identity; no activation in PI-01. |
| Credentials/entitlement/billing | No live verifiers. Trusted preflight receipt references with exact runtime/account/route/window; UNKNOWN or expired denies, Paid API stays OFF. |
| Output fence | No production fence/broker. Admission remains denied until staging/authority-state protection and trusted output path are ready. |

Alternate paths explicitly reviewed: actual HTTP table has no worker route; development launcher starts backend/frontend only; SyntheticSecurityHarness dispatch forks only a fixed test probe; durable-attempt test child client only exercises repository operations. None was executed. Wiring the synthetic supervisor into HTTP later would bypass the proposed DB fence and is forbidden; this is a **prospective bypass risk**, not a currently reachable production execution exploit.

## K. Output Publication Integration

| Output channel | Current concrete path | Gap and future fence |
| --- | --- | --- |
| Attempt result | S01 commitTerminal stores result/closure digests in synthetic receipt. | Receipt is not an authorized artifact/output publication. Add accepted metadata/manifest linkage under the repository transaction. |
| Agent messages | No production agent-message endpoint/client found. | Route future normalized messages through the same project/session/destination authorization; never relay raw provider text directly. |
| Streaming events | S11 request-response only; S13 demo events, not provider stream transport. | Future streaming adapter quarantines raw events; accepted sequence/idempotency/revision and confidentiality checked before fanout. |
| Tool responses | No production tool executor; HostPathPolicy evaluates fixture requests but does not execute requested IO. | Tool execution requires separate action permission; output permission alone is insufficient. |
| Logs/stdout/stderr | S16 capture limits streams and returns ProbeResult; launcher/backend have development logs. | Test/development sinks are not trusted output brokers. Future sanitization/access policy, bounded audit references and protected diagnostics. |
| Generated artifacts | No production artifact ingestion/ownership store found; contract asset references concern visual packages. | Host copies to immutable owned storage, verifies content hash and references accepted manifest; no raw worker path publication. |
| UI transport | S11 reply → S22 → S23/S24, DEMO snapshots/brain reads only. | Keep demo source distinct; future real snapshot/read projection consumes only accepted output records and checks recipient ownership. |
| Persistent output records | Demo events/tasks in separate state DB; S03 has no accepted output/head table. | Authoritative acceptance/head must be same-file transaction; demo/UI projection is a downstream read model, not an independent acceptance authority. |

Future final publication fence is server-side in S01-owned transaction: current subject/project/session/run/incarnation, policy/revocation/cancellation/terminal state, exact destination/classification/channel, sequence/output ID and idempotency. Capture raw data without making it visible. No terminal/stale output may update authoritative head. Already delivered bytes cannot be retracted by rollback; previously accepted metadata is retained with its version, not reauthorized by retry.

Confirmed gaps are absence of production controller/tables/transport, separate demo/fixture stores, and unguarded synthetic-only output capture relative to this future protocol. It would be speculative to call the current DEMO snapshot or fixed test probe a production publication bypass. Filesystem patch application/Git/canonical writes require a separate host broker and explicit authorization; DB output acceptance does not grant them.

## L. Revocation and Cancellation

S01 requestCancellation validates synthetic HostAuthority/current Expected/lease, stores one intent and event atomically, rejects conflicting request digest and terminal/uncertain states. Before launch it preserves phase with `noLaunch=true`; readers must inspect cancellationPayload rather than phase alone. After launch it uses CANCELLATION_REQUESTED. Ack/exit need matching invocationNonce/generation/host/scope; terminal interruption requires correlated closure/effects-classified data under S08. These are synthetic receipt checks, not independently established process exit facts.

Future revocation/stop/policy commands mutate the same authority security/grant revision under BEGIN IMMEDIATE as acceptance. Control-first denies a stale contender; commit-first retains an historical accepted result but subsequent work/delivery is rechecked. Cancellation/recovery stop authority must never confer resume/launch rights. Current approval revocation in S17 is memory only and cannot coordinate with S01 SQL. Global/operator stop changes across files/processes and external account revocation remain separate consistency/freshness problems.

## M. Persistence and Recovery

S04 authority SQLite uses DELETE journal, synchronous EXTRA, foreign_keys ON, read_uncommitted OFF, busy_timeout 100 ms; source validates schema/profile/application/user version and integrity. S03 is USER_VERSION=5, PROFILE=`s15-isolated-authority-v1`. S14 demo DB uses separate per-call connections, user_version 1, writable DELETE/FULL, 25 ms timeout, 1024 pages/100-record fixture limits. S19 JSON journal is yet another store. No ATTACH/shared transaction or production migration exists. Same engine is not cross-file crash atomicity.

Actual source layouts are S04 `<owned S12–S15 TEMP root>/<databaseToken>/authority.db`, `StateStorage.databasePath` app-root `projects/<projectId>/project.db`, and `ProjectRegistry` app-root `registry.json` with its initialization seal/writer lock. These are source path definitions, not database paths opened/queried by PI-01. The demo state database's shared project ID does not place it on the authority repository's connection.

S01 reads current/history under its transaction; writes use SQL predicates and immutable epochs/events. Generic transition retry conflicts rather than promising replay; issue/terminal/heartbeat/cancel/reconcile have operation-specific replay behavior. Future generic accepted-operation contract needs explicit COMMIT_UNKNOWN and authenticated stable-key lookup, not a fresh operation ID after timeout. Current generic databaseError/BUSY classification does not establish whether a lost commit response was a rollback.

Startup openForTest verifies history but is not a live process reconciler. `recoveryInventory` returns CLOSED and `classifyRecovery` forbids automatic retry; previous host/clock/unknown process/effects remain quarantined. Preserve this before adding any host constructor. Lost acknowledgment, incomplete delivery, pending cancellation, new host, stale grant or reused attempt identity must reconcile committed receipt and invocation evidence before new work. No terminal reset or automatic resend.

No independent monotonic witness was found in source. Local event/hash chains, nonce hashes, file keys, authority incarnation and schema digests can detect inconsistent tampering but cannot detect coordinated restoration of a complete internally consistent old database. Existing S11 design §8/§19 already notes this. Supported restore requires owner-approved quiescent recovery, fresh incarnation/host invalidation and dispatch CLOSED; it is a future protocol, not implemented protection. R9 normal close/reopen does not prove abrupt process crash, hot-journal recovery, filesystem/controller correctness or power loss. PI-01 opens no DB and makes no new durability claim.

## N. External Side-Effect Handling

Use a durable intent/outbox and explicit state machine where delivery is external. Proposed states: PENDING → CLAIMED with broker fencing/lease → DELIVERED, or UNKNOWN/QUARANTINED; attempts to redeliver require provider/recipient idempotency support or reconciliation, not presumed exactly-once execution. Intent and acceptance are committed together; acknowledgment is a separate versioned record. Never perform network/provider/tool/file/OS calls while holding the SQL transaction and call them rolled back after SQL failure.

Broker startup stays closed pending stop/host/process reconciliation. Before delivery, validate current activation/principal/scope/security revision and broker ownership. A check immediately before an OS/file call alone does not remove its race with revocation: physical containment, invocation identity, one-shot launch consumption and conservative uncertainty handling remain required. Stop intent committed first blocks new acceptance/claims; effects already in progress may be irreversible and require real cancellation/closure evidence. Do not claim a local outbox solves all external atomicity.

Prefer publication of a DB manifest pointer to host-owned immutable bytes. Blob creation before transaction can leave an unreferenced orphan, not visible authorized output. Canonical file replacement/patch application, messages delivered and billing events need their own receipts/reconciliation; a rollback cannot undo them. Outbox integration is later scope; no broker, delivery or cleanup was executed.

## O. Credential, Entitlement and Billing Dependencies

DEC-004 remains binding: subscription-first, Paid API OFF, no silent paid fallback, missing quota UNKNOWN. Actual S21 exposes these defaults; S20 can deny supplied missing provider assertions, but does not authenticate them. No production provider adapter/account verifier/credential broker/billing authorizer was found in inspected source. Reading source that handles local launch/session credentials does not load live credentials; none were accessed.

Future trusted evidence must distinguish local UI authentication, provider sign-in, model entitlement, runtime/integration eligibility, usage limits and billing route. Login success, a stored credential reference or an Owner Option A decision cannot establish all of them. Store only sanitized decision IDs/version/fingerprint/window, never credentials in SQL events/prompts/artifacts. Failure/unknown/expiry revokes admission eligibility, not triggers API fallback. Live account/terms checks belong to a separately authorized runtime track after security prerequisites; PI-01 performs no network or provider request.

## P. Current Implementation Gaps

| Finding | Confirmed source fact | Consequence |
| --- | --- | --- |
| F01 | S01 construction/test profile only, no application caller. | Production authority/DI path absent; cannot claim production transaction verified. |
| F02 | No authoritative programmable SECURITY_STOP/policy revision in S01. | Production activation BLOCKED; fixed workers=false is preserved but not a clearance service. |
| F03 | No real principal/session/grant/destination/accepted-output/head schema. | Cannot build trusted R5 context or atomic scoped consumption from digests alone. |
| F04 | S16/S17 memory + S19 JSON and OS fork separate from S01. | Must not reuse harness dispatch as production controller. |
| F05 | S13/S14 demo state uses another file/connection. | Task/UI projection cannot join authority acceptance by nested helper calls. |
| F06 | No provider entitlement/billing/credential broker implementation. | Real admission denied; account checks separately authorized. |
| F07 | No production output broker/outbox/artifact ownership. | No authorized publication path; external effect atomicity unresolved. |
| F08 | No external rollback witness or real crash/host continuity proof. | Old complete restore/uncertain host stays blocked; no automatic resume. |
| F09 | Current roadmap draft; final PRD/sign-off/handoff inputs missing. | Formal M02 exit assessment incomplete, detailed criteria not silently invented. |
| F10 | conflictHeld=1 retained; legacy unleased synthetic paths remain. | Safe retry/new attempt/release/real active-lease admission require explicit additional contracts. |
| F11 | Generic accepted-operation/ambiguous-commit API absent. | Need stable receipt lookup and no blind retry for future external intents. |

These are integration gaps, not claims of exploitable active production workers. Full source inspection did not authorize changing any of them now.

## Q. Recommended Integration Architecture

Evolve S01 into the sole owner of attempt/security/grant/accepted-operation metadata on **one authority.db connection**, under a future approved host storage constructor. Keep R5 pure; use R6–R9 as behavioral/test contracts. Do not add another fake authority or import `contracts/testing` into production startup. A private transaction-scoped adapter sources authenticated current records, invokes pure decisions, claims permission and journals acceptance atomically. Cancellation/revocation uses the same writer boundary. UI/demo state remains a separately versioned read projection until an explicit real task model is introduced.

Project security rows cover project-local metadata ordering. An application-wide operator hold and cross-project stop require a host-wide enforcement protocol; independent project databases cannot promise atomic global stop. Historical SECURITY_STOP and Option A remain independent activation constraints even if a future local project row says CLEARED. External brokers stay disabled until separate runtime/containment/principal/billing/output gates pass.

Next change should establish the missing default-deny repository seam, not another broad review or a mock copy of R9. The dependency-ordered Track A/B backlog in Document B specifies later grant/claim/publication work and restricted runtime verification.

## R. Exact Proposed File Changes

**Single next milestone: M02-02-PI-02 — Repository-owned default-deny execution readiness.** Proposed source implementation only after a separate bounded request; PI-01 does not implement it.

| File | Exact proposed PI-02 change |
| --- | --- |
| `src/server/attempt-control/execution-readiness.ts` (NEW) | Strict readiness/security-record schemas and pure deny decision; no issuer, no clear-stop, no provider/process calls. |
| `src/server/attempt-control/schema.ts` | Propose USER_VERSION 6 and PROFILE `pi02-isolated-readiness-v1`; add `runtime_execution_security` keyed by projectId with authorityIncarnation FK, securityRevision positive, securityStop enum, nullable authorizationRevision/policyVersion/decisionRef. Preserve attempts/epochs/history constraints. |
| `src/server/attempt-control/test-storage.ts` | Initialize UNKNOWN in fresh isolated test DB; verify row/meta/schema. No open-production constructor or migration; reject unsupported prior versions. |
| `src/server/attempt-control/repository.ts` | Add `assessExecutionReadiness({identity, expected:{attemptGeneration,stateVersion,phase}})`; read current/meta/security under its private read transaction, return BLOCKED with observed versions and `executionAuthority:false`. No caller-supplied context/clearance/callback. |
| `tests/integration/durable-attempt-foundation/execution-readiness.test.ts` (NEW) | Missing/UNKNOWN/ACTIVE/INVALID row, identity/revision mismatch, cancellation/recovery/terminal, old schema and unavailable proof negative cases. Test-only SQL corruption stays in fresh fixtures. |
| `tests/integration/durable-attempt-foundation/persistence.test.ts` | Add explicit schema-version/security-row integrity assertions if needed; preserve existing semantics and historical files. |

PI-02 does **not** claim positive admission: even a synthetic CLEARED test row without authentic policy/principal/containment evidence stays BLOCKED. No API to clear actual stop or enable workers. No attempt transition/dispatch activation, no R5–R9 edits, no new HTTP/startup/provider path, no real-data migration. Default UNKNOWN and explicit observed revision make the existing repository boundary enforceably fail closed for future acceptance integration. Later host-authenticated policy/grant issuance is a separate dependency, not a string flag shortcut.

Fresh fixture initialization sets securityRevision=1, securityStop=UNKNOWN and authorizationRevision/policyVersion/decisionRef=NULL. The existing `runtime_control_meta.schemaRevision=1` and project identity schema are separate concepts and need not be silently renumbered with SQLite user_version. Old v5/profile databases are rejected, never auto-migrated or opened from historical evidence roots. These concrete proposed values are not written to source or any database in PI-01.

Definition of Done: fresh isolated tests prove missing/unverifiable state cannot produce readiness/authority; actual Attempt CAS/owner/incarnation/phase remain preserved; schema mismatch rejects without auto-migration; existing repository tests and R5–R9 regressions pass in explicitly safe fixture runners; all receipts false authority; no runtime call or app wiring. Test scope must be inspected before execution because some existing suites launch test processes. No script execution is approved by this design alone.

Later exact likely files: `contracts.ts` for authenticated command/result types, `journal.ts` and `schema.ts` for new events/claims/head invariants, `cancellation.ts`/`recovery.ts` for real authority integration, and proposed new `operation-coordinator.ts`, `execution-policy.ts`, `output-publication.ts`, `delivery-outbox.ts` within `src/server/attempt-control/`. Future app composition would change `server/index.ts`/`http.ts`, state real-event projection and web API/controller; all are **later proposed** changes, not current edit permissions. Native process/provider adapter filenames are not invented as existing components; their scope requires a separate approved design/implementation task.

## S. Offline Integration Test Plan

All rows below are **PROPOSED / NOT_RUN in PI-01**; no planned scenario is counted as PASS. Run only isolated fixture transactions with fixed fault points/no worker/network/provider; actual runtime protocols belong to Track B.

| Test | Proposed setup/assertion | Dependency |
| --- | --- | --- |
| IT-01 Existing attempt compatibility | Existing identity/phase/nonce/version/epoch journal behavior unchanged; old unsupported DB rejected, no auto-migrate. | PI-02 schema/API. |
| IT-02 Stop denial | Missing/UNKNOWN/INVALID/ACTIVE stops deny admission and publication; synthetic clearance alone never sufficient. | Canonical project security record. |
| IT-03 Authorization revision conflict | Current revision changes between request and transaction; old expected grant denies. | Trusted policy/grant records. |
| IT-04 Atomic consumption | Inject after claim/update; no consumed grant or accepted operation survives rollback. | Same-connection claim API. |
| IT-05 Atomic acceptance | Inject after accepted row/head/event; all tables/versions unchanged after reopen. | SQL schema/reducer. |
| IT-06 Duplicate key | Exact retry returns original receipt; changed parameters/subject/capability conflict. | Stable operation identity. |
| IT-07 Wrong task/destination | Exact canonical rules; prefix/wildcard/cross-session/cross-project deny. | Normalized scope records. |
| IT-08 Run reincarnation | Same visible run/task ID under different authorityIncarnation/attemptId/generation cannot replay old grant. | Invocation/binding contract. |
| IT-09 Cancel before commit | Cancellation writer wins; pending acceptance stale/denied; no phase-only shortcut for noLaunch. | Current cancellation rows. |
| IT-10 Revoke before commit | Revision/grant revoke serializes with acceptance; commit-first retained, later uses deny. | Canonical revocation. |
| IT-11 Competing writers | Independent SQLite connections, real lock conflicts and one single-use winner, no JS-only mutex claim. | Safe fixture store. |
| IT-12 Partial writes | Each fixed precommit fault/constraint rollback preserves claims, operation, head, event and state. | Transaction coordinator. |
| IT-13 Lost acknowledgment | Commit response lost → explicit unknown → authenticated key lookup; no new intent/launch. | Receipt/lookup contract. |
| IT-14 Reopen recovery | Current records/history/claims validate; corrupt projection/key/stop row denies; no auto-resume. | Recovery checker. |
| IT-15 Terminal publication | Late output from terminal/cancelled/old owner cannot advance head or UI accepted events. | Output coordinator. |
| IT-16 Tool side-effect denial | Output grant never permits tool/process/provider action; assert no side-effect adapter invoked. | Action separation. |
| IT-17 Credential/entitlement missing | Absent/unknown/expired trusted evidence denies; tests use dummy refs, no live credential read. | Attestation contract. |
| IT-18 Billing missing | Unknown route/expired billing proof denies; Paid API fallback cannot activate. | Billing policy adapter. |
| IT-19 Fence unavailable | Missing containment/output store readiness denies admission before intent/claim. | Trusted fence readiness. |
| IT-20 No authority from fixture | R5 eligibility/R8/R9 handles/synthetic literal/UI session cannot mint production authority. | Host authentication boundary. |

Separate later runtime cases include real handshake/account controls, denied roots/private DB/credential scope, owned tree closure, actual output/channel delivery and crash recovery. This review authorizes none of them.

## T. Adversarial Review

Internal review by the same agent; no independent certification. Twenty challenges and unresolved findings:

| Challenge | Finding / disposition |
| --- | --- |
| Canonical authority mistaken | S01 synthetic owner identified; production owner absent, no R9 replacement claim. |
| False single transaction | Only S01 private same-connection helpers qualify; metadata schema/API changes still required. |
| Independent connections confused | S14 demo DB and S04 authority DB are explicitly separate. |
| Cross-store atomicity | Global stop, account revocation, external delivery remain blocked/require protocols. |
| Stale authorization | Digests/client versions are not permission; current authenticated revisions must be read in transaction. |
| Double consumption | Future SQL unique claim+acceptance linkage, no memory-then-SQL sequence. |
| Retry duplication | Stable logical key, explicit unknown and lookup; no new ID after timeout. |
| Revocation race | Same-store ordering defined; recheck alone cannot fence an external in-flight write. |
| Unsafe transitions | Preserve terminal/recovery/CAS/noLaunch semantics and conservative conflict hold. |
| Unprotected publication | Actual demo/test paths separated from absent production broker; no invented active exploit. |
| Side effects before authorization | Outbox/intent + separately gated broker; SQL cannot undo external calls. |
| Stop bypass | No current authoritative stop service; default disabled flags preserved, production activation BLOCKED. |
| Alternate admission | No HTTP execution route; test supervisor/launcher must not become a bypass during future wiring. |
| Credential/entitlement assumptions | Local UI credentials/synthetic host object do not prove provider account rights. |
| Billing gap | No actual verifier; UNKNOWN blocks, no paid fallback. |
| Recovery overclaim | Historical R9 normal reopen only; no process-crash/power-loss/witness proof. |
| M02 acceptance incomplete | All located current clauses and RT/prerequisites reconciled; final approved PRD/sign-off not found. |
| Mock PASS as production proof | 438 historical test results labelled historical/offline; zero new tests. |
| Accidental approval | PI-02 and Track B are proposals; Option A/D9 remain pending/not authorized. |
| Historical alteration | Hash/path inventory verification before/after; no old evidence writes or archival. |

Unresolved implementation findings F01–F11 remain open. No hypothetical mitigation is represented as implemented enforcement.

## U. Source Integrity

Only the two authorized reports are new. Final traversal/hash comparison records **491 + 2 = 493 AI Office files**, default Git **165 + 2 = 167**; all original rows remain, no old file changed/missing. Protected **1,450 historical files / 22 roots** and **647 tracked Hermes files/path set** have zero drift. Inventory excludes `.git`/`node_modules`; reparse metadata unchanged; older unavailable evidence remains NOT_VERIFIED. `.gitignore`, source/tests/package/config/schema and original reports are untouched.

No test/typecheck/server/runtime/helper/DB migration was executed; no process, OS job, account, billing, provider, live credential or network operation; no Git commit/push/reset/merge/deploy. PI-01 performs only source/metadata inspection and these two documentation writes. No new evidence files are created in historical TEMP. R8-20 remains unresolved and R9 diagnostic evidence remains intact.

## V. Final Readiness Decision

`PI01_M02_EXIT_CRITERIA_INCOMPLETE + SECURITY_STOP_PRESERVED`; `M02_NOT_COMPLETE`. Current draft acceptance is mapped but formal approval/source completeness is not asserted. Metadata integration is **REPOSITORY_CONTRACT_CHANGE_REQUIRED**, same-file transactions are feasible after those changes, production activation **BLOCKED**, and external/global consistency is unresolved.

The single next implementable milestone is **M02-02-PI-02 — Repository-owned default-deny execution readiness**, scoped exactly in R. It is a concrete source/test change to the existing repository, not another broad research review, and grants no worker/clear-stop/publication authority. Separate authorization is required before implementing it; no confirmation is needed to finish the two PI-01 reports.
