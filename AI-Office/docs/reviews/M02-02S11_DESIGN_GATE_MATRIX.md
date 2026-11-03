# M02-02S11 — Design Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Companion: [Durable Attempt Control Design](M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md) (“A” below).
Status: **DESIGN ACCEPTED for Owner review; no production implementation/runtime verification**.

## 1. S11-01 through S11-52

DESIGN_ACCEPTED berarti proposal telah dinilai konsisten/siap untuk bounded implementation, **bukan Owner approval atau executable implementation**. SOURCE_VERIFIED terbatas pada inspected source/hashes; NOT RUN menyatakan action budget0, bukan missing design content.

| Gate | Requirement | Status | Evidence | Current | Proposed / remaining work | Test / dependency | Risk / Owner |
|---|---|---|---|---|---|---|---|
| S11-01 | Existing source inventory | SOURCE_VERIFIED | A§3; actual paths/tests | Foundation+fixtures+contracts classified | Preserve production/fixture distinction | Stage1; T40/T45 | Risk: fixture promoted; Owner reviews scope |
| S11-02 | Synthetic-versus-production separation | SOURCE_VERIFIED | A§3–5; S10 report | Synthetic only lifecycle evidence | Never count S10 as production recovery | All stages keep launch gates | Risk false readiness; no waiver |
| S11-03 | Project UUID authority | DESIGN_SPECIFIED | A§6,8; contracts/project.ts | Backend registry binding exists | Immutable UUID/fileKey/incarnation checks | Stage1/5; T30/T31 | Registry recovery dependency; Owner identity review |
| S11-04 | Attempt identity | DESIGN_SPECIFIED | A§9–10; context.ts | Fixture descriptor only | Stable issue/attempt/invocation/epoch tuple | Stage1/2; T01/T02/T40 | ID reuse; approve contract |
| S11-05 | Single authoritative owner | DESIGN_SPECIFIED | A§6,13,15 | One-instance RAM guarantee | Current DB tuple+immutable epoch history | Stage2/3; T38 | Split-brain; no secondary owner store |
| S11-06 | Storage topology selected | DESIGN_ACCEPTED | A§7–8 | Per-project fixture DB exists | Option A; same project DB for authority/task/events | Stage2; T05/T21 | Proposal accepted for review; Owner approves implementation |
| S11-07 | Multi-instance consistency model | DESIGN_SPECIFIED | A§8,13,23 | Registry lock excludes ordinary second backend | Same canonical DB B+CAS; registry clients separately gated | Stage2/5; T07/T08/T45 | Do not steal registry lock |
| S11-08 | SQLite transaction strategy | DESIGN_SPECIFIED | A§13,17,19; database.ts | Existing fixture BEGIN IMMEDIATE | Short SQL-only tx; exact1 row; no spawn within | Stage2; T03/T05/T06 | Commit≠external atomicity |
| S11-09 | Database durability configuration | DESIGN_SPECIFIED | A§19; SQLite PRAGMA | Current DELETE/FULL fixture | Proposed DELETE/EXTRA; WAL deferred | Stage2; T19/T21 | VFS/power loss unverified; Owner accepts baseline |
| S11-10 | Proposed schema and constraints | DESIGN_SPECIFIED | A§10; SCHEMA_V1 | No runtime tables; demo-only tasks | Seven entities/FKs/uniqueness/guards; synthetic foundation | Stage1/2; T40 | Production task contract needed before runtime |
| S11-11 | Attempt state machine | DESIGN_SPECIFIED | A§11; PhaseSchema | Existing fixture vocabulary | Complete stricter transitions/actors/CAS/events | Stage1; T03/T10/T40 | Do not reuse fixture cancel→success edge |
| S11-12 | Terminal-state semantics | DESIGN_SPECIFIED | A§11,17 | Fixture terminal guard | Write-once receipt; same txn projection/event | Stage2; T12/T13/T39 | Task/attempt divergence prohibited |
| S11-13 | Cancellation state machine | DESIGN_SPECIFIED | A§12 | Fixture IPC/file cancellation | Intent/delivery/ack/exit/finalized separate | Stage4; T11/T15/T26 | Ack is not exit |
| S11-14 | Cancellation/completion race | DESIGN_SPECIFIED | A§12,17; S10 gap | No production serialization rule | First stop commit blocks later COMPLETED | Stage4; T10 | Owner approves semantics; no retroactive rewrite |
| S11-15 | Durable lease specification | DESIGN_SPECIFIED | A§14 | Not implemented production | 20s lease/5s heartbeat, conditional renewal | Stage3; T09/T16 | Expiry never replacement |
| S11-16 | Lease clock semantics | DESIGN_SPECIFIED | A§14,20 | Date.now fixture expiry | Local mono/domain+UTC audit, anomaly quarantine | Stage3/6; T37 | Resume/boot observation dependency |
| S11-17 | Generation fencing | DESIGN_SPECIFIED | A§13,15 | Fixture generation not OS fence | Increment on owner change; recovery-only takeover | Stage3; T04/T38 | Old process may remain writable |
| S11-18 | Heartbeat fencing | DESIGN_SPECIFIED | A§14 | No durable heartbeat | Owner/epoch/phase/version/seq CAS | Stage3; T09/T44 | No renewal from stale domain |
| S11-19 | Stale terminal rejection | DESIGN_SPECIFIED | A§15,17 | Fixture rejection/replays only | Reject obsolete epoch and old owner; no task change | Stage2/3; T04/T17 | Raw process nonce not current authority |
| S11-20 | Journal/projection atomicity | DESIGN_SPECIFIED | A§17–19 | JSON journal separate from task state | Same DB event+projection+eligible task transaction | Stage2; T05/T39 | No silent reducer mismatch |
| S11-21 | Duplicate terminal idempotency | DESIGN_SPECIFIED | A§17–18 | Sequential S10 synthetic proof only | Same receipt+digest returns prior; changed conflicts | Stage2; T12/T13 | Not exactly-once effects |
| S11-22 | Process identity model | DESIGN_SPECIFIED | A§16; S10 identities | Live creation-time scoped S10 evidence | Persist invocation/creation/exe/scope provenance, no handle reuse | Stage6; T26/T27 | Broker interface not implemented |
| S11-23 | PID reuse protection | DESIGN_SPECIFIED | A§16,21; PROCESS_INFORMATION | Not hostile/runtime verified | Query/compare exact object identity; unknown no termination | Stage6; T28 | No PID/name-only kill |
| S11-24 | Unknown process quarantine | DESIGN_SPECIFIED | A§21 | S10 mock UNKNOWN classification | Conflict hold+case, no consent-only release | Stage5; T16/T27/T41 | Availability sacrificed for safety |
| S11-25 | Restart reconciliation | DESIGN_SPECIFIED | A§20–21 | Controlled fixture reopen only | New-host gate closed; validate DB/scope before issue | Stage5; T14/T15/T22 | No auto resume from saved rows |
| S11-26 | Retry authorization | DESIGN_SPECIFIED | A§22 | No worker retry authorized | New ID/scope/approval; one-time Owner grant with issue | Stage5; T41 | DB retry is not worker retry |
| S11-27 | External side-effect limitations | DESIGN_SPECIFIED | A§24–26 | Not verified production | Unknown effect quarantine/no exactly-once promise | Stages5–7; T19/T42 | Direct Git/API/file effects remain gated |
| S11-28 | Filesystem output fencing | DESIGN_SPECIFIED | A§26 | Historical A/B profile scope only | Staging→immutable host blob→DB pointer; canonical writes blocked | Stage6; T35/T42 | OS separation/publication broker required |
| S11-29 | Approval authority integration | DESIGN_SPECIFIED | A§27; approval.ts | Trusted synthetic controller object | Authenticated Owner decision, epoch/action/expiry bound | Stage4/7; T33 | Model cannot grant authority |
| S11-30 | Action fingerprint binding | DESIGN_SPECIFIED | A§9,27; policy.ts | Fixture context/request fingerprint | Include runtime/profile/scope/input and decision identity | Stage1/4; T34 | Changed material action invalidates approval |
| S11-31 | Concurrency race matrix | DESIGN_SPECIFIED | A§23 C01–C20 | No S11 execution | 20 actor/order/invariant/transaction/recovery scenarios | Stages2–6; mapped T IDs | Every row unverified proposal |
| S11-32 | Crash-window matrix | DESIGN_SPECIFIED | A§24 W01–W20 | S10 synthetic only | 20 durable/external/evidence/allowed/prohibited decisions | Stages2–6; T14–23/T41 | No arbitrary power-loss promise |
| S11-33 | Security invariants | DESIGN_SPECIFIED | A§25 I01–I20 | Existing fixture subset only | 20 expressions/enforcer/persistence/failure/tests | All stages; mapped T IDs | No approval waiver for unknown evidence |
| S11-34 | Database failure handling | DESIGN_SPECIFIED | A§19,21 | Primary BUSY mapping; sidecar rejection | Extended codes/bounded contention/quarantine/no reset | Stage2/5; T06/T18/T23 | Never enable WAL through old helper |
| S11-35 | Implementation dependency graph | DESIGN_SPECIFIED | A§29 | Production pipeline missing | 7 staged contracts→runtime graph with rollback/gates | Separate requests per stage | Owner authorizes exact write/data scope |
| S11-36 | Acceptance test plan | DESIGN_SPECIFIED | A§30 T01–T45 | Existing unrelated historical tests | 45 future fixtures/stimuli/durable/negative/evidence checks | Tests NOT RUN in S11 | No synthetic PASS presented |
| S11-37 | Source integrity | SOURCE_VERIFIED | B§10; actual SHA baseline | 129 files + protected scopes | Only2 report additions, old bytes same | Final read-only comparison | Scoped claim only |
| S11-38 | No runtime execution | NOT RUN | S11 action audit; A§2 | No S11 worker/experiment | Budget0 MXC/Node worker/app-server/process experiment | No new fixture/test execution | Read-only shell utilities only |
| S11-39 | No database migration | NOT RUN | S11 action audit; A§10,19 | SQL in Markdown only | No database engine open/DDL/PRAGMA executed | No SQL validation via execution | No live state access |
| S11-40 | No authentication/inference | NOT RUN | S11 action audit; A§28 | No account/credential request | Provider actions stay disabled | Separate future gate | No account proof |
| S11-41 | No paid API/credits | NOT RUN | S11 action audit; A§28 | No paid action/credit fallback | Immutable subscription route, default block | Separate future billing tests | No enforced cap proof |
| S11-42 | Forced process-tree cleanup | NOT VERIFIED | S10 matrix; A§16,21 | Cooperative exits only | Future broker/OS validation required | Stage6/T29 separately authorized | Cannot waive by design |
| S11-43 | Production durable lease implemented | NOT IMPLEMENTED | context.ts; S10; A§14 | No production lease | Design only | Stage3 after foundation | Worker remains blocked |
| S11-44 | Production fencing implemented | NOT IMPLEMENTED | S10; A§15,26 | No production effect fence | Design DB/API/output boundaries only | Stages3/6 | Token alone cannot stop writes |
| S11-45 | Production recovery implemented | NOT IMPLEMENTED | S10; A§20 | Fixture reopen/mock replay only | Conservative production protocol specified | Stage5 | Not crash verified |
| S11-46 | Official Codex app-server integrated | NOT IMPLEMENTED | index.ts/policy.ts; S10 | No application adapter | Future stage7 | Separate protocol integration | No app-server launch |
| S11-47 | Actual runtime approvals/cancellation | NOT VERIFIED | S10; A§27 | Synthetic only | Future official runtime mapping required | Stage7 | File cancel not provider interrupt |
| S11-48 | Credential custody verified | NOT VERIFIED | S9/S10; A§27 | Actual secrets not accessed | Private host storage/broker proof required | Stages6/7 | No real custody attestation |
| S11-49 | Subscription entitlement verified | NOT VERIFIED | S10; A§28 | Eligibility UNKNOWN | Future explicit account gate | Stage7, separate auth scope | No inference/account calls |
| S11-50 | Included-only billing enforced | NOT VERIFIED | S10; A§28 | OFF policy/no spend only | Hard cap/fallback exclusion separate acceptance | Stage7 | No autonomous paid route |
| S11-51 | Exactly-once external side effects | NOT VERIFIED | A§24–26 | No such guarantee | Document unresolved side-effect windows | Future broker/tool-specific protocols | Never infer from journal |
| S11-52 | Real worker activation | BLOCKED | A§1,28,32–33 | Disabled | All independent gates must pass | Separate explicit activation | S11/S12 do not authorize workers |

## 2. Evidence source for each gate

A§3 links actual symbols/paths; A§4–5 links historical [R1](M02-02R1_ATOMIC_ISSUANCE_REPORT.md), [harness](M02-02_SECURITY_HARNESS_REPORT.md), [runtime matrix](M02-02_RUNTIME_GATE_MATRIX.md), [S5R2](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md), [S6](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md), [S8](M02-02S8_CHILD_NETWORK_INHERITANCE_REPORT.md), [S9](M02-02S9_FUTURE_FILE_TIMING_REPORT.md), [S10 design inputs](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md) dan [S10 gates](M02-02S10_RECOVERY_GATE_MATRIX.md).

Official research consulted: [SQLite transactions](https://www.sqlite.org/lang_transaction.html), [isolation](https://www.sqlite.org/isolation.html), [WAL](https://www.sqlite.org/wal.html), [PRAGMA](https://www.sqlite.org/pragma.html), [UPSERT](https://www.sqlite.org/lang_upsert.html), [RETURNING](https://sqlite.org/lang_returning.html), [Windows handles](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers), [PROCESS_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/ns-processthreadsapi-process_information), [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [Node24.21 child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html), [Codex Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox). Applied facts/limits cited near protocols in A, not treated as local verification.

## 3. Current implemented state

| Existing capability | Actual classification | Evidence / limit |
|---|---|---|
| Project UUID/binding | Foundation implementation + descriptive contracts. | ProjectRegistry/WorkspaceManager, not client-schema trust. |
| Project SQLite/Shared Brain | Implemented fixture-only service plus project-scoped storage layout. | ProjectStateService.forFixtures, SCHEMA_V1 demo-only. |
| Atomic issuance | Fixture-only single authority instance. | R1 synchronous reservation; cross-instance Maps independent. |
| Journal/restart | Fixture JSON persisted and controlled reopen. | FixtureAttemptJournal; not production lease/hard crash. |
| Cancellation/process tracking | Fixed probe/S10 cooperative evidence. | ChildProcess handle, nonce/PID observations; no hostile tree proof. |
| Approvals/policy | Trusted synthetic controller and canonical evaluator. | No authenticated production runtime bridge. |
| Production task/runtime adapter | Documented/missing production capability. | DemoTaskSchema cannot authorize coding. |
| Multi-backend access | Current registry excludes competing ordinary writers. | Exclusive writer.lock; no permission to steal it. |

No source renamed, generalized or activated to make the proposal appear implemented.

## 4. Proposed design state

All D-deliverables are **specified proposals**, mapped below; existing implementation evidence remains in A§3 and §5.

| Deliverable | Authoritative design location | Proposed decision |
|---|---|---|
| D01 current inventory | A§3–5 | Actual P/F/C/D/M classification. |
| D02 authority boundary | A§6 | Backend authority, worker untrusted. |
| D03 storage topology | A§7–8 | Option A, per-project same DB; no host owner DB. |
| D04 identity/schema | A§9–10 | Stable identities,7 entities/FKs/constraints. |
| D05 attempt state | A§11 | Existing vocabulary, explicit proposed stricter edges. |
| D06 cancellation state | A§12 | Durable intent versus delivery/ack/closure. |
| D07 lease | A§14 | Conditional20s/5s renewal; clocks fail closed. |
| D08 generation/fencing | A§15 | Epoch changes/recovery-only reassignment. |
| D09 issuance | A§13 | Transaction+unique request+project hold. |
| D10 heartbeat | A§14 | Owner/version/sequence/clock CAS. |
| D11 process identity | A§16 | Handle provenance/creation/invocation; unknown no kill. |
| D12 terminal commit | A§17 | Receipt/event/projection/task in one DB txn. |
| D13 events | A§18 | Append-only + validated projection/reducer. |
| D14 startup recovery | A§20 | Gate closed, no automatic reissue. |
| D15 quarantine | A§21 | Hold retained until evidence closure. |
| D16 retry/idempotency | A§22 | Explicit grant/new attempt; DB retry distinct. |
| D17 concurrency | A§23 C01–C20 |20 specified interleavings, not executed. |
| D18 crash windows | A§24 W01–W20 |20 evidence/conservative recovery cases. |
| D19 invariants | A§25 I01–I20 |20 machine-testable proposed assertions. |
| D20 dependency graph | A§29 | Seven stages plus explicit storage/task/OS prerequisites. |
| D21 acceptance | A§30 T01–T45 |45 future tests, none run. |
| D22 activation blockers | A§28,31–33; S11-42–52 | Workers stay blocked. |

## 5. Remaining implementation requirement

Scope of first future implementation: proposed new attempt-control namespace/contracts/repository and isolated SQLite fixtures. Preserve existing synthetic harness/domain semantics. S12 may implement schema/CAS/event foundation **without real project migration, lease timers, cancellation/process integration or provider calls**.

Later prerequisites: storage-v2 handles legitimate journal lifecycle/extended errors; production task contract separates coding from demo; private storage/output broker security; real approval/auth; Windows ownership/clock/process-tree integration. Existing single-writer registry must be preserved or redesigned by explicit separate authorization, not bypassed.

## 6. Test requirement

A§30 defines fixture, initial state, stimulus, durable result, negative assertion, artifact and pass/fail rule for T01–T45. Matrix rows map to these cases. Minimum implementation acceptance: two independent connections **and** two independent Node processes against same isolated DB; transaction rollback/unknown commit; exact-row-count CAS; receipt/hash/reducer consistency; clock anomalies; cancel/complete both orders; unknown process/effects never reissued.

Process/broker tests require their own bounded scope. Forced tree cleanup needs actual independently observed exits; cooperative normal exit cannot satisfy it. No simulations/test execution/SQLite syntax execution were performed in S11.

## 7. Security risk

| Risk | Designed conservative response | Still unverified |
|---|---|---|
| Two authorities/owners | One per-project DB/current tuple; transaction CAS/unique project hold. | Actual multi-process production implementation. |
| Clock/restart lease revival | Domain-local monotonic gate, UTC audit, quarantine on discontinuity. | OS resume/boot observation integration. |
| Cancel bypassed by late success | First committed intent excludes COMPLETED; write-once terminal. | Real provider interrupt/race mapping. |
| Database fenced process still writes | Separate staging/immutable host artifact/pointer commit; canonical writes blocked. | Physical OS isolation and publication broker. |
| Backup rollback/history loss | Offline Owner procedure/new incarnation/new-host dispatch gate; unsupported provenance blocked. | Arbitrary privileged rollback detection not promised. |
| Hot journal/DB failure | New reviewed adapter, preserve sidecars, no empty reset. | Target VFS/power-loss behavior. |
| Missing credential/account/billing gate | Default block, no provider/paid fallback. | Actual custody/entitlement/enforced cap. |

No documented limitation is recast as an observed failure; no polished design is used to waive unresolved runtime safety evidence.

## 8. Owner decision required

Proposal review items: Option A same project DB; one conflicting attempt per project; first-committed stop semantics; proposed DELETE/EXTRA; recovery-only ownership transfer; immutable artifact reference publication; offline restore/new-host activation gate.

These decisions are concrete recommendations, **not an unresolved design contradiction or a request to stop authorized S11 documentation**. Owner acceptance and a separate S12 request are required before production source/schema edits. No current configuration or task contract was changed to enforce them.

## 9. Dependencies

Ordered foundation path: contracts→SQLite repository/events→lease/fencing→cancel authority→restart/quarantine→Windows process/output broker→official runtime readiness.

Cross-cutting dependencies: authenticated Owner control, backend registry binding, production task contract/snapshot, storage-v2 sidecar compatibility, verified private storage, independent OS scope/clock proofs and subscription/billing controls. Missing dependency blocks its integration/activation stage; it does not permit broad grants, weaker sandbox or billing fallback.

Recommended next **M02-02S12 — Durable Attempt Authority Foundation Implementation**, scoped to host-only persistence/contracts/CAS/events/concurrency tests. No runtime launch or automatic implementation from S11.

## 10. Milestone boundary and safety audit

Exactly two authorized reports are the only repository additions. All source/tests/contracts/schema/package/lockfile/screenshot/historical reports remain unchanged within the measured scope. No S11 temp fixture/evidence/migration file created. SQL/pseudocode remain Markdown; no engine/database opened to test them.

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

No MXC, sandbox, Node worker, app-server, lifecycle/termination experiment, model/auth/account call, paid/credit fallback, real credential/private DB read, Windows security/global config/PATH change, dependency install, WSL or Git initialization. Historical synthetic roots hash-read without following reparse points. Official research retrieval is not experimental network traffic. Existing node_modules/untracked Hermes/external Google AI Studio assets are outside hash scope and were not write targets.

**SOURCE VERIFIED != DESIGN SPECIFIED != IMPLEMENTED != RUNTIME VERIFIED.**
**DURABLE JOURNAL != EXACTLY-ONCE EXTERNAL EFFECTS.**
**LEASE EXPIRY != PROCESS TERMINATION.**
**DATABASE FENCING != PHYSICAL FILESYSTEM FENCING.**
**SYNTHETIC RECONCILIATION != PRODUCTION CRASH RECOVERY.**

**M02-02S11 COMPLETE — IMPLEMENTATION-READY DURABLE ATTEMPT CONTROL DESIGN ACCEPTED — PRODUCTION WORKER BLOCKED — AWAITING OWNER REVIEW.**

