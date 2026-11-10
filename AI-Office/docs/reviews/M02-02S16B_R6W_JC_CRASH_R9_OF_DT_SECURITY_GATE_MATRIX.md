# M02-02S16B-R6W-JC-CRASH-R9-OF-DT — Security Gate Matrix

`R9_OF_DT_IMPLEMENTATION_COMPLETE_OFFLINE_VERIFIED + SECURITY_STOP_PRESERVED`; `M02_NOT_COMPLETE`.

All 20 R9 gates PASS within the defined isolated SQLite mock scope. PASS does not imply power-loss durability, abrupt-process crash recovery, production readiness, live external authority consistency or resolution of R8-20. Those claims are separately classified below.

Source: [durable-mock-transaction.ts](../../src/contracts/testing/durable-mock-transaction.ts). Tests: [durable-mock-transaction.test.ts](../../tests/contracts/durable-mock-transaction.test.ts). Full architecture/commands/limits: [implementation report](M02-02S16B_R6W_JC_CRASH_R9_OF_DT_IMPLEMENTATION_REPORT.md).

Evidence root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-r9-of-dt-42ec1a9a-27f9-4d10-abb2-7c02117722c3`. Actual final validation is run2; `evidence/tests-run2.json`, `preflight-run2.json`, `results-run2.json`, stdout/stderr, typecheck logs and final manifest substantiate results. Test scenarios below are executed cases, not specifications counted as PASS.

## Acceptance gates

| Gate | Requirement | Result | Actual implementation/test evidence | Scope/limit |
| --- | --- | --- | --- | --- |
| R9-01 | R8 checkpoint verified | PASS | R8 manifest anchor/listed hashes, surviving final run3 JSON/exits/source hashes verified | No historical runtime rerun |
| R9-02 | R8-20 exception carried forward | PASS | r8-exception-review.json; reports exception section | Original overwritten R8 tests-run1.json remains unavailable; no reconstruction |
| R9-03 | Suitable storage backend verified | PASS | Installed node:sqlite / SQLite 3.53.4; backend probe and actual 91 R9 tests | Experimental Node API; platform/power-loss bounds remain |
| R9-04 | Atomic transaction contract defined | PASS | SQLite schema/coordinator; DT-01 through DT-12 mapping | Mock records only |
| R9-05 | Consumption and acceptance atomic | PASS | R9T01,R9T04-R9T06,R9T42,R9T43,R9T68; same DB transaction | No external execution or live in-memory authority commit |
| R9-06 | Rollback demonstrated | PASS | R9T04-R9T06,R9T12,R9T41-R9T44,R9T81,R9T82 | Logical rollback/normal close, not OS crash |
| R9-07 | Idempotent retry demonstrated | PASS | R9T08,R9T15,R9T32,R9T45 | Historical receipt lookup never new authorization |
| R9-08 | Single-use replay rejected | PASS | R9T07,R9T13,R9T31; unique DB claims | Within persistent store identity; owner references are test-only |
| R9-09 | Restart recovery demonstrated | PASS | R9T11-R9T20,R9T82-R9T85 | Close/reopen instances, not process termination/power loss |
| R9-10 | Ambiguous commit handled | PASS | R9T15,R9T45 lost ACK + exact-key lookup; real commit busy R9T81 | Lost acknowledgment simulated; arbitrary device I/O ambiguity not physically injected |
| R9-11 | Authority consistency limits documented | PASS | Canonical transactional command journal and reconstructed R8; stale partial restores R9T83/84 | No live authority sync; whole consistent rollback requires external witness |
| R9-12 | Concurrent consumption controlled | PASS | R9T31-R9T40,R9T81; independent connections and SQLite locks | Ordered same-process clients; cross-OS-process test NOT_VERIFIED |
| R9-13 | Revocation semantics verified | PASS | R9T23,R9T35,R9T36,R9T66,R9T67 | Transactional fixture authority only |
| R9-14 | SECURITY_STOP preserved | PASS | R9T21/22/62/63/78/86; historical hashes unchanged | Synthetic clearance never actual stop clearance |
| R9-15 | Storage faults fail closed | PASS | R9T41-R9T50,R9T69,R9T76/77,R9T81-R9T85 | Fixed injected faults + real SQL constraint/BUSY, not exhaustive disk-fault emulation |
| R9-16 | No actual execution authority | PASS | R9T55-R9T60; all durable receipts false | No worker/tool/provider/file delivery permission |
| R9-17 | No production wiring | PASS | R9T59/static-review.json and existing-file hash comparison | Source in contracts/testing only |
| R9-18 | R5-R8 regressions evaluated | PASS | Fresh final: R5 100,R6 72,R7 84,R8 91; total347 PASS; scoped typecheck0 | Other application/runtime/integration suites excluded |
| R9-19 | Repository integrity preserved | PASS | final-integrity.json: 487 original files,1062 historical files/21 roots,647 Hermes tracked paths/hashes | Git/node_modules excluded, older unavailable 2209 files/17 roots NOT_VERIFIED |
| R9-20 | Durability claims bounded by evidence | PASS | Reports recovery/isolation/durability limits; actual final run2 JSON | No power-loss, hot-journal, exactly-once external effect or production readiness claim |

## Durable transaction invariants

| Invariant | Requirement | Result in fixture scope | Actual evidence |
| --- | --- | --- | --- |
| DT-01 | Atomic consumption | PASS | R9T01,R9T04-R9T06,R9T42,R9T43 |
| DT-02 | Rollback | PASS | R9T04-R9T06,R9T12,R9T41-R9T44,R9T81,R9T82 |
| DT-03 | Idempotency | PASS | R9T08,R9T09,R9T32,R9T33,R9T75 |
| DT-04 | Single-use uniqueness | PASS | R9T06,R9T07,R9T13,R9T31 |
| DT-05 | Current revision/incarnation/epoch | PASS | R9T19,R9T20,R9T30,R9T37,R9T64,R9T65,R9T83,R9T84 |
| DT-06 | Fail closed on missing/corrupt state | PASS | R9T10,R9T18,R9T48,R9T49,R9T63,R9T69,R9T76,R9T77,R9T85 |
| DT-07 | Restart recovery | PASS | R9T11-R9T20,R9T82 |
| DT-08 | No partial success | PASS | R9T04-R9T06,R9T41-R9T50,R9T81 |
| DT-09 | Ambiguous acknowledgment resolution | PASS | R9T15,R9T45 |
| DT-10 | Security-stop continuity | PASS | R9T21,R9T22,R9T62,R9T63,R9T78,R9T86 |
| DT-11 | Accepted-record provenance | PASS | R9T01; persisted receipt binding plus deterministic R8 replay |
| DT-12 | No real authority | PASS | R9T55-R9T60,R9T77 |

## Minimum 60 scenarios: actual final test titles

| ID | Actual executed scenario | Result |
| --- | --- | --- |
| R9T01 | valid transaction persists consumption operation and journal together | PASS |
| R9T02 | failed capability validation makes no write | PASS |
| R9T03 | failed actual R5 operation validation makes no write | PASS |
| R9T04 | rollback after capability update survives reopen | PASS |
| R9T05 | rollback before operation insertion preserves single-use claim | PASS |
| R9T06 | actual SQL constraint violation rolls back every table | PASS |
| R9T07 | single-use duplicate with new operation identity denies | PASS |
| R9T08 | exact idempotent retry returns recorded receipt without second effect | PASS |
| R9T09 | conflicting idempotency key denies | PASS |
| R9T10 | missing authority record denies after persisted deletion | PASS |
| R9T11 | committed data is observable after close and reopen | PASS |
| R9T12 | rolled-back data remains absent after reopen | PASS |
| R9T13 | consumed capability cannot replay after reopen | PASS |
| R9T14 | unused capability remains usable after reopen | PASS |
| R9T15 | lost acknowledgment resolves by exact committed lookup after reopen | PASS |
| R9T16 | precommit failure retry succeeds after reopen | PASS |
| R9T17 | accepted operation ordering and output sequence recover | PASS |
| R9T18 | inconsistent persisted operation record fails recovery | PASS |
| R9T19 | stale incarnation after reopen denies | PASS |
| R9T20 | stale authority generation after reopen denies | PASS |
| R9T21 | persisted ACTIVE security stop denies and remains latched | PASS |
| R9T22 | UNKNOWN security state denies | PASS |
| R9T23 | revoked capability remains revoked after reopen | PASS |
| R9T24 | expired capability denies | PASS |
| R9T25 | wrong action denies | PASS |
| R9T26 | wrong task denies | PASS |
| R9T27 | wrong destination denies | PASS |
| R9T28 | cross-project access denies | PASS |
| R9T29 | cross-session access denies | PASS |
| R9T30 | wrong epoch denies | PASS |
| R9T31 | two consumers cannot claim one single-use capability | PASS |
| R9T32 | duplicate idempotency key across clients returns one result | PASS |
| R9T33 | conflicting parameters across clients deny key reuse | PASS |
| R9T34 | publication sequence conflict cannot consume another capability | PASS |
| R9T35 | revocation before competing consumer denies across connections | PASS |
| R9T36 | cancellation before competing publication denies | PASS |
| R9T37 | stale persisted store revision rejects | PASS |
| R9T38 | actual independent writer lock fails closed without process mutex | PASS |
| R9T39 | another reader cannot see uncommitted capability change | PASS |
| R9T40 | independent transactions succeed in database order | PASS |
| R9T41 | failure before first write rolls back | PASS |
| R9T42 | failure after publication capability update rolls back | PASS |
| R9T43 | failure after accepted insertion rolls back | PASS |
| R9T44 | failure before COMMIT rolls back complete draft | PASS |
| R9T45 | simulated lost acknowledgment reports ambiguity not false failure | PASS |
| R9T46 | simulated storage read error fails closed | PASS |
| R9T47 | simulated storage write error fails closed | PASS |
| R9T48 | corrupted fixture record blocks new writes | PASS |
| R9T49 | failed recovery validation prevents opening store | PASS |
| R9T50 | safe retry succeeds after bounded recoverable fault | PASS |
| R9T51 | actual R5 predicate remains eligible only | PASS |
| R9T52 | actual R6 admission still uses private in-memory state | PASS |
| R9T53 | actual R7 provenance still rejects cloned reference | PASS |
| R9T54 | actual R8 admission scope does not authorize publication | PASS |
| R9T55 | persistence transaction does not spawn workers | PASS |
| R9T56 | publication is metadata inside isolated SQLite only | PASS |
| R9T57 | module has no production credential or environment import | PASS |
| R9T58 | no network access occurs during transaction | PASS |
| R9T59 | production code has no R9 import or Jc interaction | PASS |
| R9T60 | success denial duplicate and ambiguity all retain false execution authority | PASS |

## Additional executed adversarial cases

| Actual IDs | Case count | Verified behavior |
| --- | ---: | --- |
| R9T61 | 2 | BEFORE_BEGIN / AFTER_BEGIN faults preserve unused grant and reopen/retry behavior. |
| R9T62 | 2 | Synthetic INVALID/UNKNOWN stop deny. |
| R9T63-R9T65 | 3 | Missing status corrupts recovery; stale policy and equal-label/new authorization revision deny. |
| R9T66 | 3 | Task/destination/action revocation survives clients/reopen. |
| R9T67-R9T80 | 14 | Effect-first historical lookup vs new denial, rollback, inconsistent claims, old/JSON/foreign references, unsafe fixture path, snapshot copy, getter rejection, key/capability mismatch, schema/receipt tampering, stop continuity, recovery fault and closed-store denial. |
| R9T81-R9T87 | 7 | Actual reader-lock COMMIT BUSY rollback/retry; uncommitted connection close; stale projection/revision; truncated journal; producer stop-field injection; operation ID replay with new key. |
| Additional total | 31 | 60 minimum + 31 additional = 91 actual R9 cases / 87 distinct ID labels. |

## Fresh execution results

| Selected suite | Actual executed | PASS | FAIL | SKIP | TIMEOUT | NOT_RUN selected |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| R9 | 91 | 91 | 0 | 0 | 0 | 0 |
| R8 | 91 | 91 | 0 | 0 | 0 | 0 |
| R7 | 84 | 84 | 0 | 0 | 0 | 0 |
| R6 | 72 | 72 | 0 | 0 | 0 | 0 |
| R5 | 100 | 100 | 0 | 0 | 0 | 0 |
| Total | 438 | 438 | 0 | 0 | 0 | 0 |

Final Vitest exit 0; scoped strict typecheck exit 0. Exactly five contract files executed; unrelated application/runtime/integration/provider/containment suites NOT_RUN intentionally. Initial run1 had 431 PASS and a TS2339 typecheck error in new R9 control-union narrowing. Only new R9 code/tests were adjusted; final run2 has fresh unique artifacts. All run1 logs/JSON remain. Backend probe and 169 retained test database files are separate artifacts, not additional tests.

## Actual transaction and recovery boundary

Installed Node v24.21.0 built-in node:sqlite, SQLite 3.53.4, DELETE journal, synchronous=EXTRA, foreign keys ON, read_uncommitted OFF, busy_timeout=0. No dependency installation or custom crash-safe file engine. Each fresh fixture lives beneath one of the unique R9 `fixtures-UUID` roots in `evidence/fixture-inventory.json`; separate backend probe is `backend-fixture/assessment.db`. No production or historical database path is opened. Markers/canonical paths/file identity checks are test storage controls, not an OS sandbox or cryptographic authentication.

The transactional journal contains initial fixture seed/specs and ordered owner controls/accepted operations. A fresh private actual R8 instance reconstructs R7/R6 and invokes R5 within each SQLite transaction. It is discarded if the transaction rolls back. Capability update/claim, accepted operation, journal and projection share one COMMIT, with unique keys, claim trigger and deferred FKs. No second independently mutable live R8 authority is committed outside SQLite. Current versions are checked after acquiring BEGIN IMMEDIATE. Owner controls share the same database transaction order.

Exact idempotency retries retrieve the recorded historical result without a new effect, even after later revocation. Conflicting parameters/capability deny. LOST_ACK returns explicit ambiguity, then exact-key authoritative lookup resolves the original committed operation after reopen. This is not exactly-once external execution. Genuine local references must be resumed by trusted owner after recovery; serialized/old/foreign references cannot grant authority. All receipts retain executionAuthority:false.

Actual independent SQLite connections demonstrate writer lock contention, no dirty reads and COMMIT failure while a SHARED reader lock is held. Contenders are deterministically ordered, not arbitrary sleeps or OS-process race tests. No JS mutex is relied on for database uniqueness. Normal close/reopen and closing an uncommitted connection are recovery tests, not machine crash evidence.

## Claims deliberately not promoted

| Claim / dependency | Status | Why |
| --- | --- | --- |
| Abrupt OS-process/hot-journal recovery | NOT_VERIFIED | No OS processes killed or hot/torn journal injected. |
| Filesystem/storage-controller correctness | NOT_VERIFIED | SQLite synchronous mode observed, not hardware verification. |
| Machine power-loss durability | NOT_VERIFIED | Normal close/reopen does not establish power-loss behavior. |
| Separate OS-process simultaneous writers | NOT_VERIFIED | Independent connections and real locks tested in one process. |
| Distributed/multi-host atomicity | NOT_VERIFIED | No distributed store or external coordinator. |
| Atomicity with independently mutable live R7/production authority | BLOCKED | Only transactional fake-authority projection exists in R9; shared production consistency boundary absent. |
| Detection of complete internally consistent old-store rollback | NOT_VERIFIED | External trusted monotonic witness absent; partial stale restores do deny. |
| Cryptographic persisted-record or caller authentication | NOT_APPLICABLE | Fixture owner/runtime/filesystem trusted; object origin/markers/hashes are not production credentials. |
| Exactly-once external execution | NOT_APPLICABLE | No external execution or output publication. |
| Production wiring/readiness | BLOCKED | No route/storage/dispatcher/provider changes; separate approvals and dependencies remain. |

## R8-20 exception carry-forward

| Item | Verified disposition |
| --- | --- |
| Overwritten artifact | R8 `evidence/tests-run1.json` replaced by run2; original JSON unavailable and not reconstructed. |
| Original evidence that remains | R8 run1 preflight/results/stdout/stderr; hashes verified against sealed R8 manifest. |
| Independently traceable surviving final R8 result | Unique run3 JSON, preflight/source hashes, stdout/typecheck logs and result exits; 347 historical PASS. No external certification claim. |
| Earlier historical integrity | All sealed surviving R8 and earlier available files match; no R9 writes to historical roots. |
| Diagnostic completeness | Original run1 JSON still unavailable; R8-20 remains PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION. |
| R9-02 PASS meaning | Carry-forward/check is complete; it does not resolve R8-20 or relabel R8-20 unqualified PASS. |
| R9 artifacts | Distinct run1/run2 output names; no diagnostic overwrite. |

## Historical restrictions and repository integrity

| Area | Preserved state |
| --- | --- |
| SECURITY_STOP | SECURITY_STOP_PRESERVED; synthetic fixture stop/clearance never changes application policy. |
| Real workers | BLOCKED; no AI worker/probe/watchdog/process-control or Job Object interaction. |
| Option A | PENDING_OWNER_APPROVAL, not inferred. |
| D9 | NOT_AUTHORIZED. |
| Historical Jc / PID24956 | NOT_OBSERVABLE / INCONCLUSIVE. |
| Archival/cleanup | PENDING_AUTHORIZATION; historical evidence untouched; R9 fixtures/evidence retained. |
| Latest historical runtime observation | 2026-11-09T06:29:44.7514982+07:00, unchanged. |
| Actual inventory | 487 original AI Office files + exactly four additions = 491; default Git rows 162 + 3 = 165, all prior changes preserved. |
| Historical inventory | 1062 files / 21 available roots and 647 tracked Hermes files/path set preserved. |
| Inventory limits | .git/node_modules excluded, reparse metadata compared, older unavailable 2209 files/17 roots NOT_VERIFIED. |
| Source scope | Existing R5-R8/modules/tests/reports/.gitignore/package/config/production files unchanged; no production imports of R9. |
| Git publication | NONE: no commit, push, merge, reset or deployment. |
| M02 | M02_NOT_COMPLETE. |

Internal adversarial self-review covers all 22 requested challenges; same agent, not independent external certification. See report S and `evidence/adversarial-review.json`. Final manifest seals surviving R9 files, retained SQLite fixtures and four repo additions; SHA-256 is integrity metadata, not security-stop clearance, grant authentication or an anti-rollback witness.
