# M02-02S12 — Durable Attempt Authority Foundation Report

Tanggal: 30 Oktober 2026 (Asia/Jakarta). Root: D:\Rajendra\AI-Projects\AI-Office. Companion: [Transactional Concurrency Gate Matrix](M02-02S12_TRANSACTIONAL_CONCURRENCY_GATE_MATRIX.md).

## 1. Executive decision

**ACCEPTED — BOUNDED DURABLE ATTEMPT AUTHORITY FOUNDATION VERIFIED — ISOLATED SQLITE TESTS ONLY.** Enam modul dormant, empat file tes dan dua helper/client baru menyediakan contracts, pure state validation, fresh test-only SQLite, atomic issuance, generation/version CAS, append-only journal, terminal receipt idempotency dan fail-closed contention.

Final targeted run: **60 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT**, empat test files. Existing contract regressions: **127 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT**, lima files. Typecheck PASS. Initial concurrency run mengalami lima kegagalan cleanup fixture; perbaikannya dan evidence awal dipertahankan (§18). Tidak ada unresolved foundation test failure.

Real coding worker tetap BLOCKED. Persistence tests tidak memberi production lease, runtime ownership, OS filesystem fencing, crash recovery, credential custody atau included-only billing protection.

## 2. S11 design baseline

Reviewed: [S11 design](M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md), [S11 gates](M02-02S11_DESIGN_GATE_MATRIX.md), [R1 atomic issuance](M02-02R1_ATOMIC_ISSUANCE_REPORT.md), [S10 lifecycle report](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md), dan [S10 recovery gates](M02-02S10_RECOVERY_GATE_MATRIX.md). S10/R1 runtime results tetap historical, tidak dihitung sebagai S12 rerun.

Preserved decisions: Option A/per-project authority; immutable project/task/attempt; one projection/event transaction; current owner epoch + expected version; conservative project conflict hold; S11 phase vocabulary; no success after authoritative stop; retained issuance/terminal identities. R1 instance-local reservation tetap tidak diubah.

Bounded S12 profile sengaja berbeda dari future production migration: empat dari tujuh conceptual tables; synthetic-only runtimeRef; generated project identities; tidak ada project_header/tasks fixture reuse, task eligibility FK, live lease/clock, launch permit, cancellation table, process receipts atau recovery-case transport. Tidak ada task execution authority di sini.

S11 retry ceiling empat acquisitions adalah desain maksimum. S12 memilih kebijakan lebih sempit yang diizinkan task: satu acquisition/COMMIT attempt dengan busy timeout100ms, tanpa automatic retries. Busy menghasilkan typed failure setelah rollback; explicit same-command retry diuji. Full lease-budget-aware retry scheduling belum diimplementasikan.

## 3. Actual source inventory

| Existing source / actual symbol | Finding and insertion consequence |
|---|---|
| src/contracts/primitives.ts — ProjectIdSchema, ReferenceIdSchema | Existing z.uuid() dan reference grammar direuse; tidak menciptakan UUID grammar baru. |
| src/server/runtime-security/context.ts — SyntheticContextAuthority.issue/assert | Synchronous reservation sebelum awaits, backend association, final expiry/revocation checks; per-instance fixture capability. |
| src/server/runtime-security/journal.ts — FixtureAttemptJournal, PhaseSchema | JSON journal dengan seal/checksum/serialized writes; vocabulary12 phases dipertahankan, old fixture edges tidak diedit. |
| src/server/runtime-security/supervisor.ts — SyntheticSecurityHarness | Fixed fixture process lifecycle; tidak dipakai oleh S12. |
| src/server/runtime-security/approval.ts — SyntheticApprovals | Object-identity trusted test controller; bukan production approval bridge. |
| src/server/state/database.ts — useDatabase, transaction, initializeDatabase | DatabaseSync; bound statements; BEGIN IMMEDIATE; DELETE/FULL existing behavior tetap utuh. |
| src/server/state/schema.ts — SCHEMA_V1 | user_version1, demo tasks/events; tidak dimigrasikan atau diedit. |
| src/server/state/storage.ts — StateStorage.databasePath/begin | appRoot/projects/<projectId>/project.db; existing sidecar/size rules tidak cocok direuse tanpa v2 review. |
| src/server/state/service.ts — ProjectStateService.forFixtures/issueContext | Explicit fixture-only state with backend-issued association; tidak dihubungkan ke new repository. |
| src/server/workspace/registry.ts — ProjectRegistry.acquire | Existing writer.lock dan UUID/root mappings tidak diubah/direbut. |
| src/server/index.ts — startBackend/main | Registry → optional fixture state → HTTP; tidak mengimpor attempt-control. |

Root/cwd benar. AI-Office tidak mempunyai .git; git status menyatakan bukan Git repository. Tidak ada Git init. Tidak ditemukan AGENTS.md yang berlaku di AI-Office/ancestors; Hermes3D instructions tidak dipakai untuk mengubah proyek ini. Baseline131 files outside node_modules disimpan sebelum source edit. Default app-data C:\Users\USEP REZA USAMAH\AppData\Local\AI-Office tidak ada pada metadata check. Layout DB diketahui dari source; tidak membuka real project DB, registry contents atau credentials.

## 4. Existing adapter compatibility

Node v24.21.0, installed @types/node24.19.2, TypeScript7.0.2, Vitest5.0.5 dan existing zod4.6.7 digunakan tanpa install. Actual SQLite library **3.53.4**, bukan diasumsikan dari Node version. Verified executable C:\Program Files\nodejs\node.exe; SHA-256 BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32; Authenticode Valid/OpenJS Foundation.

| Capability | Actual evidence |
|---|---|
| File-backed / independent connections | Initial owned smoke DB, two handles; subsequent connection/process tests against one owned file. |
| Explicit short synchronous transaction | BEGIN IMMEDIATE/COMMIT/ROLLBACK; normal repository callbacks synchronous and internal. |
| Prepared / bound parameters | All repository data values bound with prepare(...).run/get/all. |
| Errors / extended codes | Real BUSY5, constraint PK1555 and FK787 retained with primary codes. |
| Affected rows | Statement.run().changes; real ignored UPDATE gives CAS0 conflict; pure helper rejects changes2 and unsafe arithmetic. |
| Close/reopen | Separate checked connection observes committed issue/terminal; every handle closes. |

Existing state/database.ts helper forces FULL and fixture-specific limits, so it is not called or modified. New isolated connector uses the same installed node:sqlite DatabaseSync primitive with its own DELETE/EXTRA policy. No dependency or storage-stack replacement. Current official [Node SQLite reference](https://nodejs.org/api/sqlite.html) was consulted as supplementary API context; that page currently describes v26, so local v24 API declarations and executed smoke/tests are the compatibility evidence. Version-specific online URL was unavailable; no untested v26-only API was adopted.

## 5. Exact files created/modified

- NEW source: [src/server/attempt-control/contracts.ts](../../src/server/attempt-control/contracts.ts)
- NEW source: [src/server/attempt-control/state-machine.ts](../../src/server/attempt-control/state-machine.ts)
- NEW source: [src/server/attempt-control/schema.ts](../../src/server/attempt-control/schema.ts)
- NEW source: [src/server/attempt-control/test-storage.ts](../../src/server/attempt-control/test-storage.ts)
- NEW source: [src/server/attempt-control/journal.ts](../../src/server/attempt-control/journal.ts)
- NEW source: [src/server/attempt-control/repository.ts](../../src/server/attempt-control/repository.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/helpers.ts](../../tests/integration/durable-attempt-foundation/helpers.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/contracts.test.ts](../../tests/integration/durable-attempt-foundation/contracts.test.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/import.test.ts](../../tests/integration/durable-attempt-foundation/import.test.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/persistence.test.ts](../../tests/integration/durable-attempt-foundation/persistence.test.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/concurrency.test.ts](../../tests/integration/durable-attempt-foundation/concurrency.test.ts)
- NEW test/helper/client: [tests/integration/durable-attempt-foundation/child-client.mjs](../../tests/integration/durable-attempt-foundation/child-client.mjs)
- NEW report A: [docs/reviews/M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md](../../docs/reviews/M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md)
- NEW report B: [docs/reviews/M02-02S12_TRANSACTIONAL_CONCURRENCY_GATE_MATRIX.md](../../docs/reviews/M02-02S12_TRANSACTIONAL_CONCURRENCY_GATE_MATRIX.md)

Total **14 new repository files:6 source +6 tests/helpers/client +2 reports**. **0 existing files modified or deleted.** No backward-compatible exception or existing export/interface edit was necessary. package.json, package-lock.json, tsconfigs, scripts, startup, existing tests/reviews and source remain unchanged.

## 6. Contract implementation

Contract freeze occurred before implementation: namespace src/server/attempt-control; six focused modules; strict typed inputs; explicit synthetic-only setup; SQL-only transactions; typed errors; no live integration. Actual exports map to S11:

| Export / entry point | S11 mapping / validation |
|---|---|
| PhaseSchema, AttemptSchema, IdentitySchema, ExpectedSchema; Attempt/Expected | §§9–11,15: UUID/incarnation/task/attempt immutable; positive safe generation/version; owner host/id/nonce possession and expected phase. |
| IssueSchema / Issue; DurableAttemptRepository.issue | §13: stable issueRequestId+canonical digest, g1/v1/CREATED, frozen scope/action/permission/binding metadata. |
| TransitionSchema / Transition; validateTransition; repository.transition | §11: legal edge, matching identity/current tuple/version; terminal targets use separate receipt API. |
| FenceSchema / Fence; fenceForTestRecovery | §§13,15: explicit test grant reference, UNCERTAIN→RECOVERY epoch, g+1/v+1; no runtime takeover. |
| ReceiptSchema, TerminalSchema / Terminal; commitTerminal | §17: UUID receipt, outcome reason, synthetic closure/result digests, unique commit and normalized replay. |
| AuthorityEvent, appendEvent, verifyHistory | §18: ordered version/hash chain, bounded payload and projection comparison within one snapshot. |
| TestRoot/TestDatabaseRef, createTestRoot/createTestDatabase/openTestConnection | §§10,19: explicitly owned isolated profile, no production path API. |
| AuthorityFailure, assertOne, nextInteger, databaseError | §§15,19: typed conflict, safe arithmetic, original SQLite cause/primary/extended code. |

Errors: VALIDATION, IDENTITY_CONFLICT, CONFLICT, STALE_OWNER, INVALID_TRANSITION, TERMINAL_CONFLICT, INTEGRITY, SCHEMA, UNSAFE_STORAGE, DATABASE_BUSY, DATABASE_FAILURE, FAULT. Raw ownerNonce tidak disimpan dalam DB/events/receipts; hanya SHA-256. Test evidence berisi synthetic references/hash, bukan actual secrets. Synthetic authorization literal/grant ID adalah fixture marker, bukan authenticated production Owner permission.

## 7. State machine implementation

Vocabulary persis12 phases: CREATED, APPROVAL_PENDING, APPROVAL_GRANTED, APPROVAL_DENIED, LAUNCHING, RUNNING, CANCELLATION_REQUESTED, COMPLETED, FAILED, INTERRUPTED, UNCERTAIN, RECONCILIATION_REQUIRED.

| From | Allowed S12 edges |
|---|---|
| CREATED | APPROVAL_PENDING, INTERRUPTED, UNCERTAIN |
| APPROVAL_PENDING | APPROVAL_GRANTED, APPROVAL_DENIED, INTERRUPTED, UNCERTAIN |
| APPROVAL_GRANTED | LAUNCHING, INTERRUPTED, UNCERTAIN |
| LAUNCHING | RUNNING, FAILED, CANCELLATION_REQUESTED, UNCERTAIN |
| RUNNING | COMPLETED, FAILED, CANCELLATION_REQUESTED, UNCERTAIN |
| CANCELLATION_REQUESTED | INTERRUPTED, UNCERTAIN |
| UNCERTAIN | RECONCILIATION_REQUIRED, exclusively through test fencing with generation advance |
| RECONCILIATION_REQUIRED | FAILED, INTERRUPTED; RECOVERY owner only reconciles |
| COMPLETED / FAILED / INTERRUPTED / APPROVAL_DENIED | None; only identical terminal receipt readback |

validateTransition is pure: current snapshot, requested target, expected identity/version/generation and synthetic context; returns normally or typed failure. Repository repeats it after BEGIN IMMEDIATE and validated current projection/history. No terminal revival, terminal-to-LAUNCHING, cancellation-to-COMPLETED, recovery-to-COMPLETED or unknown phase. Actual approvals/process starts remain absent even when a synthetic phase is named LAUNCHING/RUNNING.

## 8. SQLite schema implementation

Four STRICT tables: runtime_control_meta, runtime_attempts, runtime_owner_epochs, runtime_attempt_events. Schema subset identity: application_id0x41494F46, user_version2, schemaRevision1, profile s12-isolated-authority-v1, source DDL digest. This is an isolated schema profile, not a migrated production v2 DB or a change to portable project schemaVersion1.

Attempt PK; UNIQUE(projectId,attemptId), UNIQUE(projectId,taskId,issueRequestId), unique terminalReceiptId; partial unique project conflictHeld index. Deferred current-owner composite FK matches project/attempt/generation/host/owner/nonceHash/mode to an epoch; epochs reference attempts; events reference epochs and uniquely identify event ID, next version and idempotency key. Initial projection+epoch+event commit together. Integer CHECKs stay within JavaScript safe bounds.

Identity/version/terminal and retained/append-only SQL triggers guard normal writes. Reopen compares exact sqlite_schema SQL catalog as well as version/application/profile/meta/digest, quick_check and foreign_key_check; no CREATE IF NOT EXISTS shortcut. Deliberately changed schema/version/mode and damaged projection/history are preserved as negative fixtures and rejected.

conflictHeld remains1, including terminal records. S12 does not fabricate verified OS closure or release a project for execution. No UNIQUE(taskId)-forever rule was added; future new-attempt admission needs the separately implemented closure/hold-release protocol. No task table/FK is fabricated from DemoTaskSchema.

## 9. SQLite PRAGMA readbacks

| Setting | Observed on checked test connections |
|---|---|
| SELECT sqlite_version() | 3.53.4 |
| journal_mode | delete |
| synchronous | 3 (EXTRA) |
| foreign_keys | 1 |
| busy_timeout | 100ms |
| trusted_schema | 0 |
| read_uncommitted | 0 |

Fresh schema setup sets DELETE; reopening verifies persisted journal mode without silently switching it. Connection-specific settings are configured/read back on every connection. Unexpected WAL fails SCHEMA. No existing adapter defaults changed. [SQLite PRAGMA documentation](https://www.sqlite.org/pragma.html) provides the rationale for reading effective settings; EXTRA/DELETE selection is configuration evidence, not a power-loss experiment.

## 10. Test-only database isolation

Single new root: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-wFgzkQ. createTestRoot chooses mkdtemp under canonical tmpdir; callers cannot supply arbitrary target paths. Every generated database has a UUID directory, fixed authority.db filename, generated project/incarnation, root/database owner markers and inode/device identity. Creation uses wx; opening refuses missing/forged markers, unexpected properties/path traversal, mismatched project or non-owned path.

Canonical parent/root/directory/file checks, lstat/no-symlink, nlink1, exact realpath and ownership marker precede DatabaseSync. Recognized regular DELETE journal is left to SQLite; unexpected WAL/SHM or reparse files are rejected. Trust boundary is cooperative backend/test-owned storage: a privileged same-user actor capable of replacing code/markers/DB can forge evidence; no OS custody guarantee is asserted.

Final retained inventory: **264 regular files**, **85 authority.db files**, **0 sidecars**, **0 reparse entries**. artifact-inventory.json lists263 other files with relative path/bytes/SHA-256 and explicitly excludes itself. final-audit.json records actual results, initial failures, hashes and final concurrency IDs. All85 DBs passed Windows exclusive FileShare.None open/close after tests, supporting that test DB handles are closed. No user data is read by that check.

DB allocation accounting:1 smoke +30 first persistence +8 first concurrency +8 affected concurrency rerun +30 final persistence +8 final concurrency =85. Invalid-schema/history negative databases remain retained, not silently recreated/repaired. No historical fixture cleanup or deletion occurred.

## 11. Atomic issuance implementation

issue parses strict command and computes a versioned fixed-order semantic digest from immutable request/binding/scope/action/permission/runtime and initial owner tuple. Raw nonce is hashed; retry event ID and transport creation timestamp are excluded from semantic dedup identity. Original creation metadata remains immutable.

BEGIN IMMEDIATE → validate project/incarnation meta → existing request lookup → same digest returns prior snapshot, changed digest conflicts → conservative project hold check → insert CREATED/g1/v1 projection → matching epoch → ATTEMPT_ISSUED event → verify history/projection/epoch → COMMIT → return. There is no async boundary, process creation, filesystem call, network call or Owner wait in the authority transaction. Inputs/DDL identifiers are static allowlists; values use bound statements. No UPSERT owner replacement.

Two same-key requests produce one committed issuance plus replay. Different payload produces one issuance plus conflict. No automatic new attempt or worker retry. Returning result happens only after COMMIT; no use of RETURNING is required.

## 12. Generation/version CAS

Every update checks project/incarnation/task/attempt, expected generation/version/phase, hostInstanceId, ownerId and nonce hash inside transaction and conditional WHERE. assertOne accepts exactly1; actual CAS0 via test-owned RAISE(IGNORE) trigger returns CONFLICT with no event. Multiple-row result is impossible for the PK-scoped SQL; helper classification for2/2n is pure-tested, not claimed as a multi-row database race.

fenceForTestRecovery accepts only UNCERTAIN with matching prior owner/version and explicit synthetic grant; new nonce required. It atomically writes RECOVERY/RECONCILIATION_REQUIRED, generation+1, version+1, matching epoch and OWNER_FENCED event. Actual test: g1/v2 → g2/v3 → reconciled FAILED/v4; old-generation transition and terminal rejected. There is no lease expiry, renewal, automatic takeover or launch authority.

## 13. Journal/projection transactions

Each successful mutation adds exactly one next-version event and updates projection in the same transaction. Event payload is a strict snapshot envelope with decision reference, bounded16KiB UTF-8; payload and ordered event digests link to prior event digest. Per-attempt version sequence begins1 and has no gaps. Immutable fields, legal edges, generation changes, owner epochs, terminal receipt and final materialized projection are compared by verifyHistory at a stable read/write snapshot.

No normal API rewrites/deletes events; SQL append-only triggers add defense in depth. Tests prove projection-only mutation and tampered payload hash are detected on fresh repository open. Such deliberately injected corruption is expected-negative evidence, not successful committed repository divergence. An administrator with raw SQLite/code access can remove triggers/recompute hashes; hashes are corruption detection, not authentication.

## 14. Terminal receipt idempotency

commitTerminal requires legal terminal target, valid receipt UUID/reason/closure/result digests, matching current tuple/version and synthetic context. Terminal projection and TERMINAL_COMMITTED event commit together. Canonical receipt payload binds identity/generation/predecessor/version/host/owner nonce hash/target/receipt; transport timestamp and event ID are excluded.

First valid receipt commits once. Same identity+receipt ID+normalized digest after reopen returns replay=true, no extra event/version; changed receipt ID/content/target conflicts. Wrong-project receipt fails identity binding; stale owner cannot first-commit; late success after stop is rejected; conflicting terminal state cannot be overwritten. SQL trigger also rejects terminal rewrite.

All receipts are synthetic; closure/result digests do not prove real OS exit, validated real artifacts, eligible task CAS or provider success. Current task/demo rows are never updated.

## 15. Busy handling

Actual BEGIN contention: A holds verified write lock, B receives DATABASE_BUSY primary5/extended5 after bounded100ms. A releases; same-command issuance commits once; B replay returns same identity. Actual COMMIT contention: an independent reader pins a snapshot; writer begins/stages projection/epoch/event but COMMIT returns busy. Repository rolls back the still-active transaction and reports busy; reader sees zero attempts. After reader release, explicit same-command call succeeds once.

Policy: one acquisition and one COMMIT attempt, no automatic retries, no async wait inside authority transaction, no fallback to unlocked write. ROLLBACK errors close the repository and retain original failure in AggregateError. Unknown commit/IO failure is not translated into permission to execute external work. [SQLite transaction documentation](https://www.sqlite.org/lang_transaction.html) explains why COMMIT-busy needs explicit transaction handling; tested implementation chooses rollback rather than rerunning a live body.

## 16. Fault injection

TestFault accepts a fixed event type and enum stage, never an arbitrary callback. Thirteen configurations per persistence execution: four mutation types × beforeProjection/afterProjection/afterEvent =12, plus conflict-handler fault. Controlled failure rolls back all projected rows/events/new owner epochs. Failing handle closes, separate checked connection confirms prior committed state (or zero issue rows), then a valid transaction succeeds.

Duplicate event PK failure additionally rolls back projection with original extended code. Failed terminal writes leave no partial receipt/event. No power failure, forced process crash, I/O corruption of user files or OS termination experiment. Direct SQL corruption tests are confined to disposable databases and fail closed at reopen.

## 17. Concurrency testing

Three connection tests: real BEGIN busy + dedup; real COMMIT busy + rollback; two read snapshots competing against terminalization. Five two-process scenarios: verified lock/BUSY, identical issuance, changed-payload issuance, same-version CAS, conflicting terminal receipts. Both client opens are acknowledged before concurrent sends; lock scenario explicitly confirms BEGIN acquisition before B's command. Other scenarios have a synchronized start, not instrumentation claiming every internal BEGIN timestamp.

Client is fixed child-client.mjs launched by fork with canonical verified process.execPath, no shell, no arbitrary executable/source arguments, no detached mode and at most two competing clients per scenario. Native registerHooks/stripTypeScriptTypes transforms only seven allowlisted source files in-process; client imports no child_process and creates no grandchildren. Node experimental transform warning is retained in stderr evidence; it is not suppressed or treated as failure.

Per scenario15s; client deadline10s; startup/request4s; stop fallback1.5s only targets that owned ChildProcess handle. No fallback was used. Raw fixture lock-holder waiting for a release barrier is deliberately separate from a repository authority transaction; normal mutations never await IPC or arbitrary work in a transaction.

| Scenario / final evidence file | PID A / B | Winning connection | Losing/replay connection | Final attempts/events/version | Outcome |
|---|---|---|---|---|---|
| evidence-process-changed-issue-18b4a703-6f24-4218-a8ed-88d01be3f0d5.json | 16484 / 24048 | ad3ed3be-4d71-446c-9c27-ed83035f8853 | c7692981-1082-4d97-aed0-e4e53d51057a | 1/1/1 | One commit + CONFLICT |
| evidence-process-lock-issue-160510a9-a82b-4be1-96d8-7d51692ec653.json | 11484 / 17280 | ebc592d6-62b1-47b5-98a7-6f36cd3e346f | 67a77f15-3c02-4f12-8873-5b239e944220 | 1/1/1 | B BUSY5 → A commit → B replay |
| evidence-process-same-issue-03de49dd-4970-4f65-9982-b93c1f3cf641.json | 21792 / 724 | 7e105544-a45c-4a6c-9873-ce8f8429bff0 | f7d91ff3-785e-4ab2-ae24-00589d8167a0 | 1/1/1 | One commit + one replay |
| evidence-process-terminal-race-d057f10a-a4a7-4e0d-93f5-f430f142d40a.json | 20824 / 7556 | 8a4df15c-421a-4911-a912-b20a08509f13 | eaef899b-29a2-4869-b4a3-283a4482f142 | 1/6/6 | One commit + TERMINAL_CONFLICT |
| evidence-process-version-CAS-a9bdaf7b-2b4f-4520-a015-e0e41f10e661.json | 11936 / 8052 | 0d7b30a2-b330-4fb6-b2b1-2fd3d40be2b0 | bc6a532c-a114-409b-b024-767d76689775 | 1/2/2 | One commit + CONFLICT |

Actual per-client IPC request IDs, connection IDs, result ordering, settings, SQLite codes and exit outcomes are in evidence-client-exit-*.json and scenario files. Winner identity for simultaneous starts can vary by scheduler; deterministic assertion is one committed authority and the defined replay/conflict loser. Final ten clients all exit0; total20 exit0 across rerun/final plus ten initial exit1 due solely to cleanup defect. All30 close outcomes observed; no unrelated PID lookup/termination.

## 18. Test results with actual counts

| Execution | PASS | FAIL | SKIP | TIMEOUT | Evidence / result |
|---|---:|---:|---:|---:|---|
| First source typecheck | — | 1 command | — | 0 | readonly Zod schema .shape access compile error; fixed via unwrap().shape; no test execution yet |
| Typecheck after fix and final | command PASS | 0 | — | 0 | npm run typecheck: backend/tests and web tsconfigs both pass |
| Pure contracts + import | 28 | 0 | 0 | 0 | pure-results.json;2 files |
| First persistence | 24 | 0 | 0 | 0 | persistence-results.json;1 file |
| First concurrency | 3 | 5 | 0 | 0 | concurrency-results.json; DB assertions completed but child exit check failed |
| Affected concurrency rerun | 8 | 0 | 0 | 0 | concurrency-rerun-results.json;1 file |
| Final complete foundation | **60** | **0** | **0** | **0** | final-foundation-results.json;4 files;5.92s |
| Relevant existing contracts | **127** | **0** | **0** | **0** | regression-contract-results.json;5 files;0.881s |

Final foundation start 2026-10-30 05:53:24 UTC /12:53:24 WIB. Four files: import1, contracts27, persistence24, concurrency8. Vitest numTotalTestSuites includes describe blocks; reported file counts use actual test files, not that JSON field. The187 final passing cases are60 new +127 existing, not cumulative passes from repeated executions.

Initial process fixture bug: stop closed raw DB, IPC disconnect called stop again, isTransaction on closed handle threw ERR_INVALID_STATE; ten clients exited1 and five tests failed exit assertion. Fix only new client cleanup: idempotent stopped flag + isOpen guard. Added bounded startup/error handling and explicit forcedCleanup evidence. Reran affected concurrency subset8/8, then final full targeted run after changes. Initial JSON/logs and DBs retained. No safety assertion weakened. Two early PowerShell preflight command quoting/parser failures were corrected before their intended reads; no source/storage effect from those failed commands.

Commands: npm run typecheck; npx --no-install vitest run tests/integration/durable-attempt-foundation/import.test.ts tests/integration/durable-attempt-foundation/contracts.test.ts; dedicated persistence/concurrency commands; final npx --no-install vitest run tests/integration/durable-attempt-foundation; npx --no-install vitest run tests/contracts. JSON reporters target only the owned root. Test env AI_OFFICE_S12_ROOT holds the generated root reference. No lint script/config exists; lint NOT RUN, no package/config install.

## 19. Relevant regression results

Existing tests/contracts unchanged: project34, policy12, capabilities17, knowledge26, demo38 =127 PASS. These verify UUID/reference compatibility, policy invariants and unchanged domain contracts imported by foundation. Full typecheck also covers all existing integration source and web code.

Full npm test, workspace/state HTTP/process suites, runtime-security process/restart suites and browser E2E NOT RUN. They would launch servers/network/lifecycle fixtures unnecessary for this dormant insertion and outside the bounded S12 experiment. Existing source preservation plus relevant contracts/typecheck is the compatibility evidence. Historical M01 300 PASS/1 SKIPPED and runtime-security60 PASS remain historical and are not added to current counts.

## 20. Source change-safety review

| Review area | Result / limit |
|---|---|
| SQL injection | Values bound; dynamic column lists derive only from static schemas; DDL identifiers static. No caller SQL API in repository. |
| Transaction and CAS | Validation inside write transaction; affected rows checked; commit-before-return; failures rollback; no UPSERT owner takeover. |
| Journal/terminal | Hash/version/owner replay checked; terminal target requires separate receipt API; no normal history delete/rewrite. |
| Storage | No arbitrary path initializer; markers, canonical paths/file identity, schema/PRAGMA checks; no silent recreation/migration. |
| Activation | Import purity test covers six modules; no production importer; no source timers/process/network/provider APIs. |
| Concurrency bounds | Short synchronous mutations; fixed finite fixture clients; data-backed replay loops only; no background/retry loop. |
| Sensitive data | No actual credential/env/prompt reads; owner raw nonce absent from DB; client environment whitelists SystemRoot/TEMP/TMP. |
| Existing behavior | Zero existing edits; active registry/startup/adapter/schema/policy/frontend/package untouched. |

No MXC/Codex exec/app-server, real/synthetic coding worker, provider login/inference, paid/credit usage, auth import, .sandbox-secrets read, ACL/firewall/Defender change, admin/WSL, PATH/global config change, dependency install, Git init or historical deletion. Test clients are host SQLite clients, not synthetic workers. No application/test network operations. Official Node/SQLite documentation was retrieved through the research tool; this was reference browsing, not a network enforcement experiment or provider call.

## 21. Existing-file hash preservation

Per-path SHA-256 baseline before edits and final comparison: **131/131 pre-existing AI-Office files unchanged**, no deletion; final145 files outside node_modules, exactly14 authorized additions. **50/50 installed Codex files**, **647/647 Hermes3D tracked files**, **373/373 regular files across11 retained historical roots** unchanged; retained reparse metadata same and links not followed. Installed/candidate binaries and historical reports/fixtures preserved.

Hermes HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing modified package-lock.json remains same hash. No writes to Google AI Studio assets. node_modules, untracked Hermes files and external Google assets are outside the measured hash comparison; no claim of exhaustive whole-machine hashing. Baseline/new-source hashes plus comparison summary are retained in final-audit.json. Both reports added after source/test integrity comparison, then final inventory rechecked.

| Existing protected path | SHA-256 before = after |
|---|---|
| src/server/runtime-security/context.ts | 709E004A7E74D9F25C7F86F2D8AB502258B6DF9F9EC9DE2F503338B185E17781 |
| src/server/runtime-security/journal.ts | F17233CB87AD11B443F6D9A218316D837DA0B57EA6B64CA785C33965EFEB7248 |
| src/server/runtime-security/supervisor.ts | CBDBF309F30101A41F144EF6B676080BE2A1678D4B5FF457A233B4892EA1DF03 |
| src/server/state/database.ts | 30533EDC54C7297B9B0F6BDFF3CD88374DA8F00DBF2FFE7B041F84A0A69EF127 |
| src/server/state/storage.ts | 8F0CA87764D6252A0C72442829A1CA1B69618AF156961022E692DD1758682C62 |
| src/server/state/schema.ts | FE2A7BAFAE61B54971F702870A1AD0D28CA49B4828505FAE6829EE5990820790 |
| src/server/workspace/registry.ts | D7E267AAF035413759EF6A1DF4CFE9707582CC66BAC4F06803658727F6CCB33A |
| src/server/index.ts | BD44650661805CA4737115726DAD38AB896DF397CA4AB3B4B55B87F722F0A186 |
| package.json | E173A3B93F9619D5269DE8E3E1822145A6B918BFE08A51519966681C2230104B |
| package-lock.json | B1AE0F2D54B7DF3C303B3C442E2854E8A5EAECAF2C0FB2D719303D0A4B5A1926 |

Owned temporary artifact inventory is retained at C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-wFgzkQ\artifact-inventory.json; no recursive deletion or cleanup bypass. All historical root inventories compare equal.

## 22. SQLite limitations

Close/reopen verifies committed persistence; controlled rollback verifies atomicity under injected faults; independent connections/processes verify single-writer arbitration on this local host. No experiment proves physical power-loss safety, disk/controller flush correctness, arbitrary I/O failure recovery, network filesystem behavior, backup/restore incarnation handling, WAL operations or multi-host recovery.

Current profile is synthetic-only and has no live migration, authenticated binding/task eligibility, capacity/retention/paginated journal policy, production approval/lease/clock handling or project hold release. Repository open/reducer scans full history in these bounded fixtures; production scaling/performance is unverified. SQL triggers and digests cannot constrain a malicious privileged raw writer. All are explicit activation blockers, not relaxed by passing tests.

## 23. Unimplemented lease/cancellation/recovery

Live lease/renewal/heartbeat, lease expiry/clock quarantine, durable authenticated cancellation request/delivery/ack/deadline, OS scope closure, startup reconciliation, unknown-process quarantine, automatic retry, forced-tree cleanup and physical output staging/commit are NOT IMPLEMENTED here. Synthetic phase/owner-epoch representation is not runtime proof.

## 24. Remaining worker blockers

Need separately reviewed production storage/task/binding integration and migration; authenticated lease/ownership/clock/nonce protocols; cancellation/reconciliation with reliable OS scope identity and closure; process-tree cleanup validation; immutable output fencing; actual Codex app-server/approval/tool/skill protocol; credential custody; account entitlement and included-only billing protection. Paid API/purchased-credit fallback remains OFF. No account eligibility inferred.

## 25. Final acceptance classification

**ACCEPTED**, limited to the authorized foundation in isolated SQLite tests. Gate S12-01–42 satisfied at their stated source/host/test level:25 IMPLEMENTED_TESTED,6 TEST_VERIFIED,9 SOURCE_VERIFIED,2 HOST_VERIFIED. S12-43–46 NOT IMPLEMENTED;47–48/50–52 NOT VERIFIED;49 NOT RUN;53 BLOCKED.

Applicable I01–I18 implemented/tested at the bounded foundation level; I14 means busy cannot duplicate database authority and source contains no worker path, not exactly-once execution. I17 also source-reviewed. I18 is owned test setup safety under cooperative host trust, not malicious same-user protection. I19/I20 source-verified nonactivation, with production dispatch/billing enforcement outside S12. Full20-invariant mapping is in companion §2.

## 26. Recommended next bounded milestone

**M02-02S13 — Durable Lease, Heartbeat and Ownership Fencing Implementation.** Scope recommendation only: durable lease/clock renewal/current-owner fencing with bounded synthetic tests; no implied approval for process/provider integration. Do not begin S13 or M02-03 in S12.

## 27. Owner authorization required

Owner review dapat menilai14 new repository files dan retained test evidence. Tidak ada permission tambahan yang diperlukan untuk menyelesaikan S12 yang sudah diotorisasi. Separate explicit authorization diperlukan sebelum S13, production migration/wiring, lifecycle/termination experiments, real app-server/auth/credential/billing work atau coding worker activation. Pengerjaan berhenti setelah S12.

**DESIGN ACCEPTED != IMPLEMENTATION TESTED.**

**TEST SQLITE DURABILITY != POWER-LOSS VERIFIED.**

**ATOMIC ISSUANCE != EXACTLY-ONCE EXECUTION.**

**DATABASE FENCING != OS FILESYSTEM FENCING.**

**DORMANT FOUNDATION != PRODUCTION WORKER READY.**

**M02-02S12 COMPLETE — BOUNDED DURABLE ATTEMPT AUTHORITY FOUNDATION VERIFIED IN ISOLATED SQLITE TESTS — REAL CODING WORKER BLOCKED — AWAITING OWNER REVIEW.**

