# M02-02S12 — Transactional Concurrency Gate Matrix

Tanggal:30 Oktober2026 (Asia/Jakarta). Root:D:\Rajendra\AI-Projects\AI-Office. [Foundation report](M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md) memuat exact14-file scope, source inventory, commands dan preservation hashes.

**ACCEPTED — BOUNDED FOUNDATION, ISOLATED SQLITE ONLY. Real coding worker BLOCKED.** Final60/60 targeted tests +127/127 existing contracts +typecheck PASS. No live lease/runtime activation.

## 1. S12-01 through S12-53

Status scope: IMPLEMENTED_TESTED berarti implementation plus bounded executable tests; SOURCE_VERIFIED berarti code/command audit, bukan production runtime verification; HOST_VERIFIED berarti measured local-host/hash/API evidence. S12-43–53 tetap future gates.

| Gate | Requirement | Status | Actual evidence / scope |
|---|---|---|---|
| S12-01 | S11 design reviewed | SOURCE_VERIFIED | S11 report §§9–19,25,29–30 dan gate matrix direview; baseline hashes dipertahankan. |
| S12-02 | Existing source inventory | SOURCE_VERIFIED | Actual paths/symbols pada Report A §3; root terverifikasi; tidak ada AGENTS.md yang berlaku. |
| S12-03 | Existing SQLite adapter compatibility | HOST_VERIFIED | DatabaseSync yang sama; file-backed smoke + persistence PRAGMA/reopen + concurrency real locks. |
| S12-04 | Authorized write scope | SOURCE_VERIFIED | 6 source +6 test/helper/client +2 report baru; 0 existing modified/deleted. |
| S12-05 | Durable contract implementation | IMPLEMENTED_TESTED | contracts.ts; contracts.test.ts 27 cases termasuk pure validator. |
| S12-06 | Immutable attempt identity | IMPLEMENTED_TESTED | Identity checks, immutable SQL trigger, wrong-project/task/attempt negatives. |
| S12-07 | State machine implementation | IMPLEMENTED_TESTED | state-machine.ts; 12 accepted phases, strict S11 stop-success rule. |
| S12-08 | State transition tests | TEST_VERIFIED | contracts.test.ts legal/illegal, terminal revival, stale identity/version/owner. |
| S12-09 | Isolated SQLite schema | IMPLEMENTED_TESTED | test-storage.ts explicit fresh owned initializer; schema.ts four-table subset. |
| S12-10 | Schema version validation | IMPLEMENTED_TESTED | application_id/user_version/profile/meta + exact sqlite_schema catalog; incompatible negatives. |
| S12-11 | DELETE journal configuration | IMPLEMENTED_TESTED | Every test connection reads journalMode=delete; persistent WAL mismatch rejected. |
| S12-12 | EXTRA synchronous configuration | IMPLEMENTED_TESTED | Every test connection reads synchronous=3, set EXTRA independently. |
| S12-13 | Foreign-key enforcement | IMPLEMENTED_TESTED | Every connection reads foreignKeys=1; actual FK error extended787. |
| S12-14 | Transactional issuance | IMPLEMENTED_TESTED | repository.issue BEGIN IMMEDIATE; projection+epoch+event then COMMIT; rollback tests. |
| S12-15 | Durable issuance identity uniqueness | IMPLEMENTED_TESTED | UNIQUE(projectId,taskId,issueRequestId), attempt PK, conservative project conflict hold. |
| S12-16 | Duplicate issuance handling | IMPLEMENTED_TESTED | Same digest replay, changed digest conflict; independent clients/processes. |
| S12-17 | Generation CAS | IMPLEMENTED_TESTED | fenceForTestRecovery UNCERTAIN→RECONCILIATION_REQUIRED; g1→g2, epoch/event atomic; no lease takeover. |
| S12-18 | Version CAS | IMPLEMENTED_TESTED | Full identity/owner/generation/version/phase WHERE; real zero-row CAS rejected. |
| S12-19 | Stale-owner rejection | IMPLEMENTED_TESTED | Old-generation transition and terminal rejected; wrong nonce/host/owner rejected. |
| S12-20 | Wrong-project rejection | IMPLEMENTED_TESTED | Project/incarnation-bound connection; wrong project mutation/receipt rejected. |
| S12-21 | Journal/projection atomicity | IMPLEMENTED_TESTED | verifyHistory inside transaction; 12 projection/event fault placements plus conflict fault. |
| S12-22 | Append-only journal interface | IMPLEMENTED_TESTED | No normal history rewrite/delete API; SQL append-only triggers tested; privileged host caveat. |
| S12-23 | Event identity uniqueness | IMPLEMENTED_TESTED | Actual duplicate event PK error primary19/extended1555; projection rollback. |
| S12-24 | Terminal receipt idempotency | IMPLEMENTED_TESTED | One accepted receipt; semantic replay after reopen creates no event/version. |
| S12-25 | Terminal state immutability | IMPLEMENTED_TESTED | Terminal SQL guard; validator and terminal conflicting receipt tests. |
| S12-26 | Transaction rollback | IMPLEMENTED_TESTED | Controlled faults reopen with no partial row/event/epoch; next valid transaction succeeds. |
| S12-27 | SQLite busy handling | IMPLEMENTED_TESTED | 100ms single acquisition/COMMIT, explicit busy, rollback; real BEGIN and COMMIT busy5. |
| S12-28 | Independent connection concurrency | TEST_VERIFIED | Three independent-connection scenarios, no mocked lock; recorded connection/request IDs. |
| S12-29 | Independent process concurrency | TEST_VERIFIED | Five fixed two-Node-process scenarios; readiness/lock barriers; final10 exits0. |
| S12-30 | Committed state survives reopen | IMPLEMENTED_TESTED | Separate connection reopens committed issue and terminal; no power-loss claim. |
| S12-31 | Controlled fault injection | IMPLEMENTED_TESTED | 13 unique controlled fault configurations per persistence execution; no forced crash. |
| S12-32 | Deterministic targeted tests | TEST_VERIFIED | Final60/60, 4 files; finite scenario15s/client10s/request4s; scheduling identity may vary. |
| S12-33 | Relevant existing regression tests | TEST_VERIFIED | Existing tests/contracts:127/127, 5 files; broad runtime/HTTP/browser excluded explicitly. |
| S12-34 | No production database migration | SOURCE_VERIFIED | Only85 generated synthetic DBs under one new root; default app-data absent; no user DB opened. |
| S12-35 | No active backend wiring | SOURCE_VERIFIED | No existing source edits; no startup/registry/schema/adapter imports of new namespace. |
| S12-36 | No MXC launch | SOURCE_VERIFIED | Source/command audit: no Codex/MXC launch; native SQLite test clients only. |
| S12-37 | No app-server launch | SOURCE_VERIFIED | Source/command audit: no app-server path or invocation. |
| S12-38 | No provider login/inference | SOURCE_VERIFIED | No login, credential reads, provider calls or inference. |
| S12-39 | No paid API/credit fallback | SOURCE_VERIFIED | No billing/provider path added or activated; production cap not verified. |
| S12-40 | Existing source integrity outside write scope | HOST_VERIFIED | 131/131 AI existing,50/50 installed,647/647 Hermes,373/373 historical files unchanged. |
| S12-41 | Test-owned process cleanup | TEST_VERIFIED | Final10 owned clients exit0; rerun10 exit0; initial10 exit1 fixture cleanup defect; all close observed; no forced cleanup. |
| S12-42 | Temporary database ownership | IMPLEMENTED_TESTED | 85 DB files/owner markers; canonical tmp root, tokens, inode, no reparse; exclusive opens85/85; sidecars0. |
| S12-43 | Live durable lease | NOT IMPLEMENTED | Outside S12: no live lease acquisition, renewal or lease timeout authority. |
| S12-44 | Runtime heartbeat | NOT IMPLEMENTED | Outside S12: no heartbeat service or runtime timer in foundation imports. |
| S12-45 | Production cancellation | NOT IMPLEMENTED | Phase rules only; no authenticated stop-intent transport/delivery/ack/closure implementation. |
| S12-46 | Host crash recovery | NOT IMPLEMENTED | Controlled rollback/reopen only; no host crash or startup process reconciliation. |
| S12-47 | Forced process-tree cleanup | NOT VERIFIED | No forced tree-cleanup experiment/production implementation. |
| S12-48 | Physical filesystem fencing | NOT VERIFIED | Database CAS does not remove OS write access from stale workers. |
| S12-49 | Real app-server integration | NOT RUN | No real provider protocol/thread/turn/tool integration. |
| S12-50 | Real credential custody | NOT VERIFIED | Synthetic nonce hashing is not real credential custody verification. |
| S12-51 | Subscription entitlement | NOT VERIFIED | No account, model or subscription eligibility check. |
| S12-52 | Included-only billing protection | NOT VERIFIED | Paid fallback remains OFF; included-only enforced hard cap not verified. |
| S12-53 | Real coding worker activation | BLOCKED | Foundation remains dormant; real coding worker BLOCKED. |

Counts:25 IMPLEMENTED_TESTED,6 TEST_VERIFIED,9 SOURCE_VERIFIED,2 HOST_VERIFIED;4 NOT IMPLEMENTED,5 NOT VERIFIED,1 NOT RUN,1 BLOCKED. Total53 unique gates. Tidak ada remaining FAILED gate setelah authorized fixture-only fix; initial failures tetap tercatat §5.

## 2. Requirement-to-source mapping

| S11 requirement | Actual new source / export | Implemented scope |
|---|---|---|
| §§9,15 immutable identity/current owner tuple | [contracts.ts](../../src/server/attempt-control/contracts.ts): IdentitySchema, ExpectedSchema, AttemptSchema, AuthorityFailure | Reuse ProjectIdSchema/ReferenceIdSchema; strict inputs, safe numeric ranges, host/owner/nonce binding. |
| §11 legal phases | [state-machine.ts](../../src/server/attempt-control/state-machine.ts): validateTransition/assertExpected/assertEdge | Pure validation repeated inside transaction; no terminal revival/success after stop. |
| §10 schema subset | [schema.ts](../../src/server/attempt-control/schema.ts): SCHEMA_STATEMENTS/SCHEMA_DIGEST | Four STRICT tables, PK/UNIQUE/FK/checks/guards; isolated profile/user_version2. |
| §19 settings, ownership, schema compatibility | [test-storage.ts](../../src/server/attempt-control/test-storage.ts): createTestRoot/createTestDatabase/openTestConnection/verifySchema | Explicit fresh owned test initialization, per-connection readbacks and exact catalog check; no production path/migration. |
| §13 issuance, §§15,17 conditional writes | [repository.ts](../../src/server/attempt-control/repository.ts): DurableAttemptRepository.issue/transition/fenceForTestRecovery/commitTerminal | BEGIN IMMEDIATE, full CAS, exactly1 changed row, commit-before-return, fixed faults, rollback; synthetic-only. |
| §18 authoritative append-only journal | [journal.ts](../../src/server/attempt-control/journal.ts): appendEvent/verifyHistory/AuthorityEvent | Bounded payload/hash chain/version reducer/epoch comparison, same transaction projection. |

| Invariant | Requirement | Status | Evidence / limit |
|---|---|---|---|
| I01 | Project UUID immutable | IMPLEMENTED_TESTED | contracts/schema immutable trigger + wrong-project checks; C/P tests. |
| I02 | Task/attempt identity immutable | IMPLEMENTED_TESTED | Identity predicate and SQL guard; pure/repository/direct SQL negatives. |
| I03 | One issuance per issuance identity | IMPLEMENTED_TESTED | UNIQUE tuple; duplicate connections/processes yield one commit plus replay/conflict. |
| I04 | State transition validated | IMPLEMENTED_TESTED | Pure validator repeated inside repository transaction; twelve-phase vocabulary. |
| I05 | Expected version required | IMPLEMENTED_TESTED | Strict ExpectedSchema and WHERE; independent process version race. |
| I06 | Expected generation required | IMPLEMENTED_TESTED | Positive safe integer, current epoch and full owner tuple; SQL predicate. |
| I07 | Zero-row CAS cannot succeed | IMPLEMENTED_TESTED | Real test-owned IGNORE trigger produces0; CONFLICT and no event; helper2 result rejected. |
| I08 | Stale generation cannot mutate | IMPLEMENTED_TESTED | g1→g2 recovery fixture; old transition and terminal fail; no live lease claim. |
| I09 | Terminal cannot reopen | IMPLEMENTED_TESTED | No terminal edge; immutable SQL trigger; current terminal/race tests. |
| I10 | Receipt cannot commit twice | IMPLEMENTED_TESTED | Same semantic receipt replay after reopen leaves count/version unchanged. |
| I11 | Journal/projection atomic | IMPLEMENTED_TESTED | Same transaction; rollback all stages; reducer compares real projection. |
| I12 | Duplicate event identity rejected | IMPLEMENTED_TESTED | Real PK1555 with rollback; event ID global within owned project DB. |
| I13 | Rollback leaves no partials | IMPLEMENTED_TESTED | Fresh checked connection after faults; next valid commit succeeds. |
| I14 | Busy cannot spawn duplicate work | IMPLEMENTED_TESTED | Actual BEGIN/COMMIT busy; no DB authority returned; no worker path exists. External exactly-once remains outside S12. |
| I15 | Wrong project cannot mutate | IMPLEMENTED_TESTED | Connection-bound project/incarnation, immutable identity, mutation/receipt negatives. |
| I16 | Schema mismatch fails closed | IMPLEMENTED_TESTED | Version/appId/profile/catalog checks; actual corrupt/mismatch fixtures rejected. |
| I17 | Import has no runtime side effects | IMPLEMENTED_TESTED | Import test mocks DB/fs/process and spies timers; source review all six modules. |
| I18 | Test setup cannot open production DB | IMPLEMENTED_TESTED | Generated owned root/file identity only; arbitrary/forged/traversal/missing refs rejected. Cooperative-host boundary, no malicious-admin claim. |
| I19 | No real worker dispatch | SOURCE_VERIFIED | No source/startup/provider wiring; fixed host SQLite clients only; production runtime outside S12. |
| I20 | No paid API fallback | SOURCE_VERIFIED | No billing/provider code or calls; production hard cap/entitlement still NOT VERIFIED. |

I01–I18 are bounded foundation statements; I19/I20 are nonactivation source facts. Live lease/process/OS/external-effect assertions are outside S12, not counted as implemented invariants. S11 full seven-table schema and45 proposed tests were references; neither all seven tables nor all45 acceptance cases are claimed implemented/executed.

## 3. Requirement-to-test mapping

| Requirement group | Actual file / executable cases | Final cases |
|---|---|---:|
| Contract identity, strict input, safe numbers, legal/terminal/stale state, CAS result classification | [contracts.test.ts](../../tests/integration/durable-attempt-foundation/contracts.test.ts) |27|
| Import without DB/filesystem/process/timer | [import.test.ts](../../tests/integration/durable-attempt-foundation/import.test.ts) |1|
| Isolated schema/PRAGMA/FK, issue dedup, CAS negatives/zero, epochs, journal corruption detection, receipts, rollback | [persistence.test.ts](../../tests/integration/durable-attempt-foundation/persistence.test.ts) |24|
| BEGIN/COMMIT contention, stale snapshots, five process scenarios | [concurrency.test.ts](../../tests/integration/durable-attempt-foundation/concurrency.test.ts) |8|
| Owned DB fixtures/strict synthetic commands/evidence | [helpers.ts](../../tests/integration/durable-attempt-foundation/helpers.ts) |helper, not a test file|
| Fixed SQLite host client / finite IPC / native TS hook | [child-client.mjs](../../tests/integration/durable-attempt-foundation/child-client.mjs) |fixture, not a coding worker|
| Existing project/policy/capability/knowledge/demo contracts | tests/contracts/*.test.ts, unchanged |127|

## 4. Actual test evidence

Root for every new test DB and JSON evidence: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-wFgzkQ. Inventory: artifact-inventory.json (263 named/hash-listed files, excluding itself;264 total). Summary: final-audit.json. Exactly85 owned authority.db files,85 owner markers, root marker, JSON reports and85 evidence JSONs; final0 sidecars/0 reparse. Database negative fixtures remain retained. Windows exclusive-open verification85/85 passed after handles closed.

| Reporter file | Actual result |
|---|---|
| pure-results.json |28 PASS,0 FAIL,0 SKIP,0 TIMEOUT;2 files|
| persistence-results.json |24 PASS,0 FAIL,0 SKIP,0 TIMEOUT;1 file|
| concurrency-results.json |3 PASS,5 FAIL,0 SKIP,0 TIMEOUT; first cleanup defect|
| concurrency-rerun-results.json |8 PASS,0 FAIL,0 SKIP,0 TIMEOUT|
| final-foundation-results.json |60 PASS,0 FAIL,0 SKIP,0 TIMEOUT;4 files;5.92s|
| regression-contract-results.json |127 PASS,0 FAIL,0 SKIP,0 TIMEOUT;5 files;0.881s|

Final foundation started05:53:24 UTC/12:53:24 WIB. Current unique passing cases187 (60+127), not the sum of repetitions. Typecheck npm run typecheck PASS. Lint NOT RUN because no supported script/config. Browser/full HTTP/process/runtime-security suites NOT RUN; historical300/1 and60 totals remain historical (§19 report A).

| Final scenario evidence | Issuance request identity | PID pair |
|---|---|---|
| evidence-process-changed-issue-18b4a703-6f24-4218-a8ed-88d01be3f0d5.json | b8fdb29a-f350-4918-981a-4cbe7ac75c03 | 16484 / 24048 |
| evidence-process-lock-issue-160510a9-a82b-4be1-96d8-7d51692ec653.json | ed03a4e9-e601-4742-ac91-b3ae0831c4ed | 11484 / 17280 |
| evidence-process-same-issue-03de49dd-4970-4f65-9982-b93c1f3cf641.json | 11e8574e-e18d-4319-9afb-5a52e1cefaac | 21792 / 724 |
| evidence-process-terminal-race-d057f10a-a4a7-4e0d-93f5-f430f142d40a.json | b4ce2d39-02d0-49d1-9f5e-b82e12f605e4 | 20824 / 7556 |
| evidence-process-version-CAS-a9bdaf7b-2b4f-4520-a015-e0e41f10e661.json | cc02bbaa-01f2-4a4e-8ff8-e4f10c90b7f2 | 11936 / 8052 |

Each final scenario file and per-client exit JSON retains actual IPC request IDs, connection IDs, acknowledged start/lock sequence, winner/loser, final rows/events/version, SQLite settings/error codes and close outcomes. File names rather than inferred aggregate counts identify reviewable evidence.

## 5. Passed and failed cases

Initial source typecheck failed readonly Zod .shape access; fixed only new schema.ts to unwrap().shape and typed Attempt keys; subsequent typechecks pass. First concurrency run5 failures were exit assertions: client stop closed SQLite, then disconnect callback called stop again and accessed isTransaction on a closed handle (ERR_INVALID_STATE). DB arbitration assertions were not the failed predicate.

Fix: stopped guard and isOpen guard in new client; startup/request bounds and owned-cleanup evidence in new concurrency test. No existing tests/assertions weakened. Affected8-case concurrency rerun passed, followed by final60-case foundation run. All initial evidence retained; initial ten clients exit1, subsequent20 clients exit0; no forced cleanup. No unresolved authority invariant defect was observed.

Expected negative tests for deliberately altered schema/projection/history and deliberately failing SQL/FaultStage are passing fail-closed assertions. They do not authorize repairing/recreating real project data and are not suppressed unexpected divergences.

## 6. Concurrency winner/loser evidence

| Scenario / final evidence file | PID A / B | Winning connection | Losing/replay connection | Final attempts/events/version | Outcome |
|---|---|---|---|---|---|
| evidence-process-changed-issue-18b4a703-6f24-4218-a8ed-88d01be3f0d5.json | 16484 / 24048 | ad3ed3be-4d71-446c-9c27-ed83035f8853 | c7692981-1082-4d97-aed0-e4e53d51057a | 1/1/1 | One commit + CONFLICT |
| evidence-process-lock-issue-160510a9-a82b-4be1-96d8-7d51692ec653.json | 11484 / 17280 | ebc592d6-62b1-47b5-98a7-6f36cd3e346f | 67a77f15-3c02-4f12-8873-5b239e944220 | 1/1/1 | B BUSY5 → A commit → B replay |
| evidence-process-same-issue-03de49dd-4970-4f65-9982-b93c1f3cf641.json | 21792 / 724 | 7e105544-a45c-4a6c-9873-ce8f8429bff0 | f7d91ff3-785e-4ab2-ae24-00589d8167a0 | 1/1/1 | One commit + one replay |
| evidence-process-terminal-race-d057f10a-a4a7-4e0d-93f5-f430f142d40a.json | 20824 / 7556 | 8a4df15c-421a-4911-a912-b20a08509f13 | eaef899b-29a2-4869-b4a3-283a4482f142 | 1/6/6 | One commit + TERMINAL_CONFLICT |
| evidence-process-version-CAS-a9bdaf7b-2b4f-4520-a015-e0e41f10e661.json | 11936 / 8052 | 0d7b30a2-b330-4fb6-b2b1-2fd3d40be2b0 | bc6a532c-a114-409b-b024-767d76689775 | 1/2/2 | One commit + CONFLICT |

Verified-lock scenario fixes A-acquire → B-BUSY → A-release → A-issue → B-replay using IPC acknowledgements. Four simultaneous-pair scenarios acknowledge both independent opens before issuing two fixed sends; OS scheduling chooses which connection wins, while exact one-authority/replay/conflict assertions are deterministic. No arbitrary sleep chooses an expected winner and no fabricated internal transaction timestamp is reported.

BEGIN acquisition/readers/COMMIT behavior is real SQLite, not mocks. Three same-host connection scenarios additionally prove begin-busy, commit-busy rollback and terminal-state exclusion across stale snapshots. At most two competing test clients per scenario;15s scenario/10s child/4s request/1.5s owned fallback bounds. Final ten client processes exit0/signalnull; fallback never used.

## 7. Database error code classification

| Condition actually exercised | Primary / extended | Repository result / observation |
|---|---|---|
| Writer lock at BEGIN |5 /5|DATABASE_BUSY, no issuance; connection-begin-busy and process-lock-issue evidence|
| Reader blocks COMMIT |5 /5|DATABASE_BUSY; rollback live transaction; reader sees0 rows; later explicit same command commits once|
| Duplicate event primary key |19 /1555|DATABASE_FAILURE with original cause and SQLite codes; projection rolled back|
| Foreign-key violation |19 /787|Raw disposable SQL rejects; epoch/attempt consistency preserved|
| Append-only/identity/terminal direct SQL guards |19 /extended not separately archived by these assertions|Raw SQL test checks primary19; no invented extended value|
| CAS0 / stale expected version |not a SQLite error|CONFLICT; no journal insertion|
| Old generation/owner/nonce |not a SQLite error|STALE_OWNER; no state mutation|
| Wrong project/incarnation/task |not a SQLite error|IDENTITY_CONFLICT; wrong unknown attempt gives CONFLICT|
| Conflicting terminal receipt |not a SQLite error|TERMINAL_CONFLICT|
| Schema/version/catalog/mode mismatch |not necessarily SQLite native error|SCHEMA; no implicit migration/recovery|
| Deliberate controlled stage fault |not SQLite native error|FAULT, rollback|
| Deliberate persisted history/projection corruption |not SQLite native error|INTEGRITY on separate repository open|
| Missing owned DB directory/open failure |filesystem cause|DATABASE_FAILURE, no DB auto-creation|

databaseError retains errcode/errstr through AuthorityFailure.sqlite and cause. BUSY/LOCKED share bounded busy category; actual LOCKED or BUSY_SNAPSHOT variants were NOT RUN. IOERR/FULL/CORRUPT/NOTADB, unknown commit result and rollback-failure paths were not fault-simulated; do not claim those host failures experimentally verified.

## 8. SQLite configuration evidence

Actual Node24.21.0 / SQLite3.53.4. All checked connections read journalMode=delete, synchronous=3, foreignKeys=1, busyTimeout=100, trustedSchema=0, readUncommitted=0. Effective settings are recorded in configuration-reopen and client open replies. Application discriminator0x41494F46, user_version2, runtime schemaRevision1 and isolated profile required.

Fresh creation only sets journal mode; reopen rejects mismatch instead of silently converting it. Existing FULL fixture adapter unchanged. [SQLite PRAGMAs](https://www.sqlite.org/pragma.html) and [transaction rules](https://www.sqlite.org/lang_transaction.html) support selected per-connection checks and commit-busy handling; passing readbacks/rollback is not proof of VFS/hardware crash durability. Local installed Node declarations and actual API tests determine compatibility.

## 9. Journal/projection consistency

Same database + same transaction for projection, matching epoch and one next-version event. Event ID/version/idempotency uniqueness, prior/new version, hash chain, current projection and full owner epochs verified. Version gap/corrupt hash test fails closed after a separate reopen. No projection-only/receipt-only update succeeds through repository; fixed faults rollback all changes.

DDL guards normal writes and interface exposes no history rewrite/delete method. A privileged SQL writer can deliberately drop triggers and forge data; tests intentionally do so only in owned DBs to prove detection. Full malicious-host protection is not established. Exact schema check also rejects unexpected tables/triggers; no application auto-repair exists.

## 10. Stale-owner rejection evidence

Recovery fixture: CREATED/g1/v1 → UNCERTAIN/g1/v2 → test OWNER_FENCED/RECONCILIATION_REQUIRED/g2/v3 → reconciled FAILED/g2/v4. Matching new epoch/event commit atomically. Old generation transition and terminal fail STALE_OWNER. Wrong ownerId, hostInstanceId or nonce likewise fail. Normal transition cannot enter RECONCILIATION_REQUIRED without the dedicated generation-increasing test operation.

Expected generation/version/identity/phase are required in input and UPDATE predicates; CAS0 real SQL path rejects even after initial validation. Pure assertOne2/2n checks invariant classification; no actual multi-row PK update is claimed. No live lease authority or stale OS worker was involved.

## 11. Terminal replay evidence

First synthetic normal receipt terminalizes RUNNING/v5 to COMPLETED/v6. Separate reopen replays same normalized receipt with changed event ID/transport time: same v6,6 events,1 attempt, replay=true. Different receipt ID/payload conflicts; wrong project denied; generic transition cannot terminalize; terminal cannot become RUNNING/LAUNCHING.

Stop-intent-first synthetic path RUNNING → CANCELLATION_REQUESTED prohibits COMPLETED. INTERRUPTED terminal then rejects late success. Two-process conflicting terminal race has one accepted terminal event and one TERMINAL_CONFLICT. Receipt idempotency is database-local, not proof of exactly-once files/network/provider effects.

## 12. Rollback evidence

ATTEMPT_ISSUED, PHASE_CHANGED, OWNER_FENCED and TERMINAL_COMMITTED each tested at beforeProjection, afterProjection and afterEvent; plus issuance conflict-handler fault. Thirteen stage/type configurations, represented by seven parameterized Vitest cases with controlled inner subcases. Every failure closes/reopens a separate checked connection, observes previous consistent projection/journal/epochs, then next valid operation succeeds.

Actual event PK constraint failure and actual COMMIT busy also rollback partial staging. Issuance faults leave0/0/0 attempts/events/epochs; generation faults leave old epoch only; terminal faults leave no terminal event/receipt. No force-kill/crash/power-loss simulation. Corrupted negative DBs retained; they are not silently restored to make checks pass.

## 13. Production activation blockers

Foundation synthetic authorization is not real authenticated backend capability. No production DB migration/task FK or snapshot CAS, registry integration, live lease/clock, cancellation transport, process identity/cleanup, recovery decision service, physical output fencing, app-server bridge, credential custody, entitlement or included-only enforcement. conflictHeld stays1 without real closure; current exclusive ProjectRegistry lock remains unchanged.

Source/command audit records no real project DB opened, no MXC/app-server/coding worker, no auth/inference/billing usage, no Windows security/admin/WSL/PATH/global config change, no dependency install or Git init. Official reference documentation browsing occurred separately from experiments; no application/test network traffic was initiated.

Preservation measured: existing AI131/131, installed Codex50/50, Hermes tracked647/647 and historical373/373 files across11 roots unchanged; final AI145 with14 authorized additions. Explicit hash scopes/limits and key hashes in report A §21; existing Hermes package-lock modification preserved, Google assets not touched.

## 14. Lease/heartbeat gaps

S12-43–44 NOT IMPLEMENTED. No durable expiry/renewal, lease acquisition arbitration, heartbeat sequence service, clock-domain validation/quarantine, host-loss authority transition, background timers or live takeover. Owner generation is persisted/fenced only by explicit synthetic recovery request. Passing owner CAS is not a working lease.

## 15. Cancellation gaps

S12-45 NOT IMPLEMENTED. State graph represents a synthetic stop barrier but no durable authenticated cancellation request table, first-wins reason selection, delivery/ack transport, runtime interrupt, stop/closure deadlines, process scope closure or timeout service. Terminal synthetic closure digest is not process evidence.

## 16. Recovery gaps

S12-46 NOT IMPLEMENTED;47–48 NOT VERIFIED. Controlled rollback/reopen and static reducer checks are not host crash recovery. No startup process enumeration/reconciliation, incarnation restore broker, unknown-process quarantine, evidence-backed conflict hold release, exactly-once retry grant or Windows forced-tree cleanup. Database fencing does not prevent OS-writable stale process effects.

## 17. App-server/credential gaps

S12-49 NOT RUN;50 NOT VERIFIED. No actual Codex app-server protocol/thread/turn/tool/model/approval integration. No credential import/read/auth custody/secret-isolation test. Synthetic ownerNonce hash is a local persistence possession check, not real credential custody. Installed/candidate Codex hashes preserved without executing either.

## 18. Subscription/billing gaps

S12-51–52 NOT VERIFIED. No login/account/model/eligibility or inference query. Subscription-first is policy intent; included-only hard cap and purchased-credit exclusion not verified by SQLite. Paid API and credit fallback remain OFF, no paid/provider implementation added or invoked. These gates cannot be promoted from persistence results.

## 19. Exactly-once side-effect limitations

Durable issuance/receipt identity gives one accepted database authority/terminalization under the checked protocol. It cannot atomically include OS process creation, writable files, network calls, provider use, UI notifications or tool side effects. No launch/retry performed. Unknown external effects require later separately approved reconciliation; database version/epoch alone does not remove filesystem rights.

**DESIGN ACCEPTED != IMPLEMENTATION TESTED.**

**TEST SQLITE DURABILITY != POWER-LOSS VERIFIED.**

**ATOMIC ISSUANCE != EXACTLY-ONCE EXECUTION.**

**DATABASE FENCING != OS FILESYSTEM FENCING.**

**DORMANT FOUNDATION != PRODUCTION WORKER READY.**

## 20. One recommended next milestone

**M02-02S13 — Durable Lease, Heartbeat and Ownership Fencing Implementation.** Recommend only bounded durable lease/clock/renewal/ownership-fencing implementation and synthetic validation after Owner review. No S13/M02-03 work automatically started; process/provider/billing activation requires separate authorization.

**M02-02S12 COMPLETE — BOUNDED DURABLE ATTEMPT AUTHORITY FOUNDATION VERIFIED IN ISOLATED SQLITE TESTS — REAL CODING WORKER BLOCKED — AWAITING OWNER REVIEW.**

