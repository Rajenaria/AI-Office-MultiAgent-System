# M02-02S13–S15 — Pipeline Summary

## A. Pipeline decision

**FULL_PASS — S13 PASS → S14 PASS → S15 PASS → FINAL CROSS-STAGE AUDIT PASS.** Semua tahap dikerjakan berurutan di bawah satu otorisasi pipeline. Tidak ada tahap dilewati; masing-masing gate/report disimpan sebelum source tahap berikutnya dimulai. Repair budget: S13 0/2, S14 0/2, S15 1/2 after the final audit reopened its gate for writer provenance. Tidak ada mandatory failure/skipped/timeout yang diabaikan.

**Final262 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,13 test files; typecheck PASS. Hasil hanya foundation dormant dan synthetic file-backed SQLite. Real coding worker tetap **BLOCKED**. S16–S19 tidak dimulai.

## B. Initial S12 baseline

Preflight membaca source/tests aktual, S11 design/gates, S12 report/matrix, S10 dan R1; bukan mengandalkan ringkasan lama. Working tree AI-Office tidak memiliki .git dan tidak diinisialisasi. Baseline145 files outside node_modules dihash sebelum perubahan. Source cocok dengan snapshot yang dilaporkan; tidak ada overlapping user modification yang perlu ditimpa. Hermes3D tetap memiliki pre-existing modified package-lock.json; hash tersebut dipertahankan.

Fresh S12 preflight run **60/60 PASS** dan typecheck PASS sebelum S13 edit. Evidence baseline.json di preflight root yang baru, bukan original historical S12 root. Actual node:sqlite API file-backed, independent connection/transactions/prepared bound statements/changes/errors/close-reopen verified again. Current Node24.21.0 dan actual SQLite3.53.4. No dependency installation needed; no active importer of attempt-control discovered.

## C. Authorized scope and actual write inventory

Only src/server/attempt-control/, tests/integration/durable-attempt-foundation/ dan tujuh review reports yang ditentukan. Final **7 existing files modified +18 new files**, **0 existing files deleted**;145→163 outside node_modules. Existing modified:5 dormant source +2 foundation test/client; additions:3 source +8 test/helper files +7 reports. All138 other pre-existing file hashes match; specifically133 files outside the allowed source/test subtree unchanged.

Lease/cancellation/recovery modules extend the existing shared repository/transaction/update/history mechanisms. No duplicate global repository or independent global authority store. No change to active startup, registry, StateStorage, ProjectStateService, existing active SQLite schema/adapter, brain reader, frontend, package/lockfiles or scripts.

| File | Action / final SHA-256 |
|---|---|
| [src/server/attempt-control/contracts.ts](../../src/server/attempt-control/contracts.ts) | MODIFIED; 9015135411E12B1EFC4DA3A9C396EAF6F8036A14C9685BFC8785E48636870E76 |
| [src/server/attempt-control/journal.ts](../../src/server/attempt-control/journal.ts) | MODIFIED; 4BF8583AB0EF0FB669E3C75A102FB143C1F3EDAE2BA3F19FB3C11A1CB592A183 |
| [src/server/attempt-control/repository.ts](../../src/server/attempt-control/repository.ts) | MODIFIED; BE70998E2650456859217336A87646EA8619AAF32FDAD4A1C6AD3D78E365F1D3 |
| [src/server/attempt-control/schema.ts](../../src/server/attempt-control/schema.ts) | MODIFIED; 5F0C9914B24D1DD21AC4995DC96427E0754DC43A822D98EF1D7469C481FE14B3 |
| [src/server/attempt-control/test-storage.ts](../../src/server/attempt-control/test-storage.ts) | MODIFIED; 0B7D184C101D9A0231CAE013656415A3864438FF73AE2F14539454FF83A7D111 |
| [tests/integration/durable-attempt-foundation/child-client.mjs](../../tests/integration/durable-attempt-foundation/child-client.mjs) | MODIFIED; F71671A61A902A9732046E6F46BD490FF02F29C0C13E913B0130565A509071C0 |
| [tests/integration/durable-attempt-foundation/concurrency.test.ts](../../tests/integration/durable-attempt-foundation/concurrency.test.ts) | MODIFIED; E743BF0D7EC798E7A198D87C0B114032DDADC562EFB1CA8E1EAC050B01FE069E |
| [docs/reviews/M02-02S13_DURABLE_LEASE_REPORT.md](../../docs/reviews/M02-02S13_DURABLE_LEASE_REPORT.md) | NEW; digest in final-audit.json |
| [docs/reviews/M02-02S13_LEASE_GATE_MATRIX.md](../../docs/reviews/M02-02S13_LEASE_GATE_MATRIX.md) | NEW; digest in final-audit.json |
| [docs/reviews/M02-02S14_CANCELLATION_AUTHORITY_REPORT.md](../../docs/reviews/M02-02S14_CANCELLATION_AUTHORITY_REPORT.md) | NEW; digest in final-audit.json |
| [docs/reviews/M02-02S14_CANCELLATION_GATE_MATRIX.md](../../docs/reviews/M02-02S14_CANCELLATION_GATE_MATRIX.md) | NEW; digest in final-audit.json |
| [docs/reviews/M02-02S15_RECOVERY_GATE_MATRIX.md](../../docs/reviews/M02-02S15_RECOVERY_GATE_MATRIX.md) | NEW; digest in final-audit.json |
| [docs/reviews/M02-02S15_RECOVERY_QUARANTINE_REPORT.md](../../docs/reviews/M02-02S15_RECOVERY_QUARANTINE_REPORT.md) | NEW; digest in final-audit.json |
| [src/server/attempt-control/cancellation.ts](../../src/server/attempt-control/cancellation.ts) | NEW; 2A4F8C0FD41EC510F9E1CCE040ABA25DC9127592A9A0FF2EDF381A455442511E |
| [src/server/attempt-control/lease.ts](../../src/server/attempt-control/lease.ts) | NEW; 5A8B026E643D0DE6061A544CC5956EEFDAED18C9C4AB73BE80036F73C74B744B |
| [src/server/attempt-control/recovery.ts](../../src/server/attempt-control/recovery.ts) | NEW; 6A96F837BA8F04B8E29511B5884BF618205B53329546ABF309FEDE7F93D635DF |
| [tests/integration/durable-attempt-foundation/cancel-helpers.ts](../../tests/integration/durable-attempt-foundation/cancel-helpers.ts) | NEW; E775766F3C116FA57270D22859481B74D7D1B84AD0C6060159C0B126DBE06AA1 |
| [tests/integration/durable-attempt-foundation/cancellation.test.ts](../../tests/integration/durable-attempt-foundation/cancellation.test.ts) | NEW; CB467E20793F7770A9F406A96DF2439D6D3DD064467C50AE27B9E222ECE0964F |
| [tests/integration/durable-attempt-foundation/client-helper.ts](../../tests/integration/durable-attempt-foundation/client-helper.ts) | NEW; 54E6872D67472D72FD853DE3F19D10A78B964502F92EE48B0C082EF4C6B847AA |
| [tests/integration/durable-attempt-foundation/lease-helpers.ts](../../tests/integration/durable-attempt-foundation/lease-helpers.ts) | NEW; 818A1068B7928DFDA9C60792A857311A2F8864139020AD4525A7216F0E06C209 |
| [tests/integration/durable-attempt-foundation/lease.test.ts](../../tests/integration/durable-attempt-foundation/lease.test.ts) | NEW; 76AD6171303B2CC4730077D85FD3CE0D1F5E2A0596E486FC5BF97F4A110BAEC1 |
| [tests/integration/durable-attempt-foundation/pipeline.test.ts](../../tests/integration/durable-attempt-foundation/pipeline.test.ts) | NEW; 11B81A9F3CB4CF50A07524129E631275D6F228E739B970544C1E9188ED149419 |
| [tests/integration/durable-attempt-foundation/recovery-helpers.ts](../../tests/integration/durable-attempt-foundation/recovery-helpers.ts) | NEW; 0D6180CFFDB92659A2573CFC448549EAB216856D066EF27E3CBB3F89FEA2D14F |
| [tests/integration/durable-attempt-foundation/recovery.test.ts](../../tests/integration/durable-attempt-foundation/recovery.test.ts) | NEW; 675AFACC065CB4CA8C875F2BF65B9465F42D7586FAB17E95FF5A68206DC72DED |

[This pipeline summary](M02-02S13_S15_PIPELINE_SUMMARY.md) adalah new report ketujuh yang melengkapi inventory di atas; digest diri sendiri tidak dimasukkan ke isi dokumen. Exact final repository hashes and original baseline hashes are in final-audit.json under S15 root. No unspecified report added.

## D. S13 implementation and result

Explicit lease initialization in issue transaction; positive safe generation/version; host lifetime/domain/owner/nonce binding;20s duration and5s heartbeat design defaults. Strict clock samples and persisted sequence/deadlines. Pure classification differentiates ACTIVE/EXPIRED/PREVIOUS_HOST/CLOCK_UNTRUSTED/QUARANTINED/TERMINAL/UNLEASED. Explicit renewal uses full owner/gen/version/phase CAS and previous sequence. Same heartbeat digest replays without event/sequence advance; changed/stale input rejects.

Backward clock, divergent forward jump, long sleep-style gap and foreign monotonic lifetime fail closed. recordLeaseConcern persists UNCERTAIN/quarantine while retaining owner/gen/hold. Expiry never means process exit or replacement. No heartbeat daemon/timer. Leased mutations cannot use legacy clockless path. First run83/83 (60 S12 +23 lease), typecheck/integrity/66 DB closes/12 client exits allPASS. L01–L22 mapped individually in lease matrix. S13 gate persisted before S14.

## E. S14 implementation and result

HostAuthority is frozen WeakMap-backed synthetic possession capability. Shape forgery or wrong identity/owner/nonce/generation fails. requestCancellation atomically persists request/decision/reason/digest/generation, phase/version and event; same semantic request replays, changed/different request conflicts. Running intent enters existing CANCELLATION_REQUESTED; prelaunch intent blocks launch and uses no-launch terminal path.

Ack and exit are distinct strict synthetic receipts bound to request/host/generation/invocation. Ack alone is not exit; missing ack stays conservative; exit without effect classification cannot finalize. Terminal cancellation needs valid owner/lease/context and corresponding closure evidence. Success-first cannot be rewritten; intent-first blocks later success. No actual cancellation channel exists. First run106/106 (prior83 +23 cancellation), typecheck/integrity/100 DB closes/14 client exits allPASS. C01–C22 individually mapped. S14 gate persisted before S15.

## F. S15 implementation and result

Recovery entry always dispatch=CLOSED; validated inventory enumerates nonterminal/pending-cancel/held-terminal attempts. New-host inspector capability is explicitly synthetic and project/incarnation/decision/clock-bound. Generation/version/phase/current-owner predicates guard quarantine mutation. Lost old owner nonce is not guessed: recovery-only SQL uses the checked persisted owner hash after inspector authorization. It never acquires execution ownership or increments generation.

Nonterminal results persist UNCERTAIN (or retain RECONCILIATION_REQUIRED), recovery decision/version/event; terminal results remain read-only and immutable. Same decision digest replays, changed or superseded stale results conflict. PID alone/missing reliable creation time/nonce mismatch/unknown children/effects cannot authorize retry. Three retry classes implemented; all return retryAuthorized=false and never clear conflictHeld. No auto retry or restart.

First run259/259 (132 durable +127 existing contracts), typecheck/integrity/128 DB closes/16 client exits allPASS. Final provenance audit later reopened S15; one repair cycle restored PASS with262/262 and stronger provenance/P02 assertions. R01–R24 individually mapped; two extra tests cover forged inspector/malformed data and candidate-pending-approval without launch. Gate saved before final synthetic chain test file was added.

## G. Stage-by-stage quality gates

| Stage | Outcome | Actual tests | Evidence | Auto-advance |
|---|---|---|---|---|
| S13 | PASS |83 PASS;0 FAIL/SKIP/TIMEOUT;5 files |s13-first.json;L01–L22;S13 gate.json +two reports |YES→S14|
| S14 | PASS |106 PASS;0 FAIL/SKIP/TIMEOUT;6 files |s14-first.json;C01–C22;S14 gate.json +two reports |YES→S15|
| S15 | PASS after repair1/2 |Initial259 PASS; repaired full262 PASS |s15-first.json;provenance-reproducer.json;pipeline-repair1-final.json;gate.json |FINAL AUDIT ONLY|
| Final audit | PASS |262 PASS;0 FAIL/SKIP/TIMEOUT;13 files |pipeline-repair1-final.json;P01/P02;final-audit.json |END;S16 NOT RUN|

Every gate combines actual targeted/negative test results, prior-stage regression, typecheck, authority/journal invariants, scope hashes, owned process exits and DB closes. No score averaging. Initial full stage suites passed, but source audit found an uncovered provenance defect. S15 PASS was suspended, the new assertions reproduced27 PASS/2 FAIL, and one authorized repair restored full PASS. No dependencies installed or expected results relaxed.

| ID | Invariant | Executable/source evidence | Status |
|---|---|---|---|
| I01 | Project UUID immutable | S12 contracts/persistence wrong-project and SQL guard | IMPLEMENTED_TESTED |
| I02 | Attempt ID immutable | S12 pure/repository/direct SQL negatives | IMPLEMENTED_TESTED |
| I03 | One issuance identity | S12 duplicate connection/process tests | IMPLEMENTED_TESTED |
| I04 | Version CAS required | S12 CAS0;L17/L18;C16;R19 | IMPLEMENTED_TESTED |
| I05 | Generation CAS required | S12 fence;L08;C03;R22 | IMPLEMENTED_TESTED |
| I06 | Stale owner cannot commit | L05/L08/L21;C13;R12/R13;P02 | IMPLEMENTED_TESTED |
| I07 | Wrong nonce rejected | L06 +S12 owner possession negatives | IMPLEMENTED_TESTED |
| I08 | Wrong lifetime rejected | L07/L20;R03 | IMPLEMENTED_TESTED |
| I09 | Wrong-project mutation rejected | L10;C02;R22 | IMPLEMENTED_TESTED |
| I10 | Terminal cannot revive | S12 terminal guards;C07/C09;R01 | IMPLEMENTED_TESTED |
| I11 | Receipt cannot duplicate commit | S12 replay;C10;R11;P01 | IMPLEMENTED_TESTED |
| I12 | Projection/journal atomic | S12 faults13;S13 faults6;C18 faults12;R17 faults3 | IMPLEMENTED_TESTED |
| I13 | Expiry is not exit | L12/L13;R02/R04/P02 | IMPLEMENTED_TESTED |
| I14 | Expiry is not takeover | L13;R03/R19;P02 unchanged owner/gen | IMPLEMENTED_TESTED |
| I15 | Duplicate heartbeat no advance | L04/L21 | IMPLEMENTED_TESTED |
| I16 | Clock anomaly closed | L14–L16/L20;R21 | IMPLEMENTED_TESTED |
| I17 | Cancel requires authority | C02–C04;unbranded capability negative | IMPLEMENTED_TESTED |
| I18 | Cancel intent is not exit | C01/C11/C12;R07/R08 | IMPLEMENTED_TESTED |
| I19 | Duplicate cancel idempotent | C05/C15/C20 | IMPLEMENTED_TESTED |
| I20 | Cancellation/success ordering | C07/C08/C16 | IMPLEMENTED_TESTED |
| I21 | Late success cannot replace cancel terminal | C09/C10 | IMPLEMENTED_TESTED |
| I22 | Recovery no automatic worker | R20/R24;P01/P02;no runtime API | IMPLEMENTED_TESTED |
| I23 | Unknown process quarantine | R04–R09/R23;P02 | IMPLEMENTED_TESTED |
| I24 | PID alone no termination authority | R05/R06 classify only;no production termination API | SOURCE_VERIFIED |
| I25 | Stale recovery result cannot overwrite | R18/R19/R22 | IMPLEMENTED_TESTED |
| I26 | No retry with uncertain effects | R20/R23/R24;P02 | IMPLEMENTED_TESTED |
| I27 | No claim DB fencing stops OS writes | Explicit reports/limitations;no physical fencing test | SOURCE_VERIFIED |
| I28 | No production DB accessed | Owned-root negative tests/inventories +source/command audit | SOURCE_VERIFIED |
| I29 | No runtime activation | Protected startup hashes,import purity,namespace import audit | SOURCE_VERIFIED |
| I30 | No paid fallback activated | No provider/billing paths;existing policy contract regressions | SOURCE_VERIFIED |

These30 rows distinguish executable implementation from source nonactivation statements. I24 does not verify Windows termination rights; I27 explicitly leaves physical fencing unverified. I28 is cooperative test-owned storage isolation, not defense against a privileged same-user writer who can forge markers/code/SQLite. None clears production runtime gates.

## H. Cross-stage integration results

Only after S15 PASS, pipeline.test.ts added and final full relevant suites/typecheck ran. **P01:** issue/owner g1 → running → renewal seq1 → intent → synthetic ack → synthetic complete-scope/effects receipt → INTERRUPTED/v10 → close → new host/domain reopen → terminal retained, no new event/version or retry. Duplicate terminal receipt remains replay; old heartbeat rejected. **P02:** active attempt with deadline exceeded → close/new host → unknown process → QUARANTINED/UNCERTAIN/v6, same old host/owner/g1, hold1, dispatch closed, no retry/new attempt. Stale heartbeat and replacement issuance both reject.

P01 evidence evidence-P01-complete-chain-da4a9959-0b13-42a5-a812-f6af21916d0e.json; P02 evidence evidence-P02-ambiguous-chain-e661da15-eb98-4f90-9a18-ad80808ce91e.json. Both assert persisted rows/history from fresh checked connections. They do not launch workers or reproduce an actual Windows host crash. Terminal classification is deliberately read-only; nonterminal quarantine persistence is transactional.

Cross-stage audit also checks unknown schema and corrupt history fail closed; separate clock domains never imply monotonic continuity; cancellation facts remain immutable through renewal/recovery; current generation retained; no old launch authority restored; no physical filesystem or provider effects claimed atomic with SQL.

## I. Test summary

| Run | PASS | FAIL | SKIP | TIMEOUT | Files |
|---|---:|---:|---:|---:|---:|
| Initial S12 baseline |60|0|0|0|4|
| S13 first relevant |83|0|0|0|5|
| S14 first relevant |106|0|0|0|6|
| S15 first relevant incl contracts |259|0|0|0|12|
| Initial cross-stage run before provenance audit |261|0|0|0|13|
| New provenance/P02 reproducer on pre-fix source |27|**2**|0|0|2|
| Final repaired full relevant run |**262**|**0**|**0**|**0**|**13**|

Final262 distinct cases comprise60 S12,23 lease,23 cancellation,27 recovery,2 chains and127 unchanged existing contract regressions. Counts are not accumulated across repeated runs. Final start2026-10-30 07:13:13 UTC/14:13:13 WIB;duration7.52s. Typecheck PASS after source fix. No configured lint; HTTP/browser/E2E and runtime-security lifecycle suites excluded as unrelated to dormant code; historical totals not counted.

Final source review found RECOVERY_CLASSIFIED header writerHostInstanceId incorrectly inherited retained execution owner, while payload inspectorHostInstanceId was correct. This was attribution metadata; no incorrect state/owner/generation/CAS commit or projection version divergence occurred. S15 gate reopened REPAIRABLE_FAILURE. Added independent header-vs-inspector regression and P02 assertion, reproduced2 failures, then changed appendEvent and verifyHistory to use/validate inspector host specifically for recovery events. Existing event types retain owner-host binding. No authority check was relaxed.

One S15 repair cycle used (1/2). Full impacted S12–S15, chains and contracts now262/262. Initial PASS reporters, failing reproducer, pre-repair summary/report/matrix/gate snapshots and pre-fix DB records retained. No silent historical DB rewriting; current replay rejects bad writer provenance. Final outcome restored only after test/integrity/cleanup evidence. Evidence: provenance-reproducer.json and pipeline-repair1-final.json.

Installed Vitest runs through current Node with spawnSync(shell:false, timeout90000); JSON reporters target owned roots. Scenario15s/client10s/request4s/owned-fallback1.5s bounds retained; no forced cleanup. Native in-process test client hooks are fixed allowlist, no child transpilation service.

## J. Concurrency and fault-injection evidence

| Scenario | Final evidence file | Winner connection | Loser connection /result | Final version /phase |
|---|---|---|---|---|
| L18 | evidence-L18-50bc8b6a-6b43-4795-8f42-aa416184b539.json | dc640dd7-63e7-4a67-9e85-d2570faaa352 | 6494223f-8fef-4f9d-b18b-67e62e509176 /CONFLICT | 2 /CREATED |
| C16 | evidence-C16-1a65a933-fe02-4947-a154-6fba1065412c.json | e1e8c168-c65f-4ec4-bfa6-86801e38dd90 | 978015d3-cd74-45ec-b2da-d3665fa9b3c1 /CONFLICT | 6 /CANCELLATION_REQUESTED |
| R19 | evidence-R19-ca6f552d-1be7-4bc0-a94c-fc71037c08a5.json | 92cdbd77-ef13-411e-9034-f354900cce06 | 99701efa-14ed-432c-8ee1-18372f437528 /CONFLICT | 6 /UNCERTAIN |

Each file holds actual IPC request IDs, connection IDs, replies and final rows/events/version. L18 finalseq1/v2/event2;C16 finalintent/v6/event6;R19 finalquarantine/v6/event6 with unchanged owner/generation. Both clients acknowledge independent DB opens before competing sends; verified-lock test additionally signals BEGIN acquisition before contender. Scheduler winner may vary; asserted one-authority outcome does not.

Actual BUSY primary/extended5 tested at BEGIN, COMMIT and stage lease/cancel/recovery mutations; no automatic retry/body/worker replay. PK1555 and FK787 retained in foundation constraint tests. Database commit-busy rolls back staged state; explicit later same command can succeed. Conditional CAS0 remains conflict, never success.

Controlled fault configurations:13 existing foundation (four mutations ×three placements +conflict handler),6 lease/quarantine,12 cancellation intent/ack/exit/terminal,3 recovery classification. These are34 defined placements, not34 additional Vitest cases. They prove rollback/reopen under controlled throws; no power-loss/forced-crash experiment. Initial/final per-client traces, code5 evidence and stage reporters remain retained.

## K. Source/database integrity

Final measured repository inventory163 outside node_modules, with7 authorized modifications and18 additions, no old deletion. All138 other original hashes match. Within that, all133 original files outside source/test scope unchanged; packages/lockfiles/startup/registry/production adapter/schema/brain reader/historical reviews unchanged.

Installed Codex50/50 unchanged; Hermes3D647/647 tracked-file hashes unchanged, HEAD beb76292747b816ef317aa6f9a3992e0014f81d9, prior modified package-lock.json preserved. Historical11 roots373/373 regular-file hashes/reparse metadata unchanged, original S12 root264/264 files unchanged. No writes to Google AI Studio artifacts. node_modules/tool caches, untracked Hermes and external assets are outside measured hashes; no whole-machine claim.

Schema evolution confined to new fixtures: baselinev2→S13v3→S14v4→S15v5; four-table project-scoped authority with bounded lease/cancel/recovery JSON columns and events. Old profile/catalog/version mismatch rejects rather than auto-migrates. Existing production schema_v1 untouched. Every new connection verifies DELETE/EXTRA3/FK1/busy100/trusted_schema0/read_uncommitted0 and SQLite version. No real project database opened or data migration applied.

Source audit: SQL values bound, identifiers from static allowlists, BEGIN IMMEDIATE and commit-before-return shared, affected row checks preserved; no arbitrary callback/await in repository transaction; error cause/extended codes retained; no unsafe UPSERT owner replacement, worker/process/network/provider API in source, or active importer outside namespace. Full journal replay is data-bounded in fixtures; production pagination/capacity/performance not established.

## L. Process/fixture cleanup

| Fixture | Root | DB closed/exclusive | Client exits0 /total | Forced /sidecars /reparse |
|---|---|---|---|---|
| Preflight S12 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-vKEa73 | 38/38 | 10/10 | 0/0/0 |
| S13 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s13-LaSdyf | 66/66 | 12/12 | 0/0/0 |
| S14 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s14-ITbdkM | 100/100 | 14/14 | 0/0/0 |
| S15 +final +repair | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s15-O9ZIZ9 | 420/420 | 50/50 | 0/0/0 |

Totals **624 owned DBs closed/exclusive-open verified**, **86/86 fixed client exits0**, **0 forced cleanup**, **0 sidecars/reparse**. Counts include fresh preflight, stage suites, and final repeated regression fixtures; S15 gate had128 DBs/16 clients, final S15 root has420/50 including provenance reproduction and repair. No unrelated PID enumeration/kill. Existing fixed test fallback targets only an owned ChildProcess handle; it was never exercised. No real forced-tree termination.

All four new roots retained. Each artifact-inventory.json lists every other regular file with relative name/bytes/SHA-256 and excludes itself; root manifests include reporters, client/scenario evidence, stage gate.json and S15 final-audit.json. Original historical evidence never overwritten/deleted. No recursive delete/cleanup-policy bypass.

## M. Security limitations

Injected clock samples and synthetic grant/receipt factories are trusted host-test inputs, not production authorization/clock custody. No real-time atomic SQLite/OS deadline cutoff, actual power-loss durability, complete Windows crash reconstruction or malicious-privileged-writer defense is claimed. Historical/full journal scans require later production capacity/retention review. Same host/nonce/hash CAS does not revoke OS-writable stale worker files.

Primary references reviewed: [SQLite transactions](https://www.sqlite.org/lang_transaction.html), [PRAGMAs](https://www.sqlite.org/pragma.html), [atomic commit](https://www.sqlite.org/atomiccommit.html), [isolation](https://www.sqlite.org/isolation.html), [rollback locking](https://www.sqlite.org/lockingv3.html). Their durability/locking rules motivate explicit readbacks and rollback; experiments remain controlled local-host evidence. [Node SQLite](https://nodejs.org/api/sqlite.html) and [child_process](https://nodejs.org/api/child_process.html) pages currently describe newer Node; local v24 declarations and actual execution determine available APIs. [Windows process identities](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers) informs PID limitations; no Windows process-rights test was performed. Only these authorized reference reads used research browsing; no application/test network operation or provider request.

**LEASE EXPIRY != PROCESS EXIT. DATABASE FENCING != OS FILESYSTEM FENCING. SYNTHETIC REOPEN != PRODUCTION CRASH RECOVERY. DATABASE IDEMPOTENCY != EXACTLY-ONCE EXTERNAL EFFECTS.**

## N. Remaining production worker blockers

Real Windows process ownership/forced tree cleanup; host-crash reconciliation; reliable scope/effects receipt custody; worker output staging/physical fencing; actual Codex app-server/thread/turn/tool/approval/skills integration; real credentials; account subscription eligibility; included-only enforced billing cap; production DB migration/task eligibility and active backend integration. Paid API/purchased-credit fallback OFF; no login/inference/account/billing access. None of these gates is promoted by FULL_PASS.

## O. Recommended next milestone

Separate **S16 — Windows Process-Tree Supervision and Cleanup** design/feasibility and authorization review. Actual OS-level rights, forced cleanup and process containment experiments need a new bounded Owner instruction. Future S17 real app-server may cross provider/auth/runtime boundaries; S18 custody/entitlement/billing requires actual account permission; S19 integrated E2E may need production wiring/migration authorization. Do not assume they can all be bundled or that S16 approval grants later stages. No S16–S19 work started.

## P. Owner decisions

No Owner decision was needed to finish this authorized pipeline. No routine stage approval requested. Review the completed bounded implementation/evidence; any next OS/provider/account/production integration task needs separate explicit authorization. The current session stops at completed S13–S15.

## Q. Exact report/source/test locations

Source: src/server/attempt-control/{contracts,state-machine,schema,test-storage,journal,repository,lease,cancellation,recovery}.ts. Tests/helpers: tests/integration/durable-attempt-foundation/; exact changed files/digests in §C, plus this report. Artifact roots and machine gate/results in §L. Source hash snapshots are retained in each stage gate.json; baseline/final hashes and final audit are in S15 final-audit.json.

- [S13 implementation](M02-02S13_DURABLE_LEASE_REPORT.md) and [S13 matrix](M02-02S13_LEASE_GATE_MATRIX.md).
- [S14 implementation](M02-02S14_CANCELLATION_AUTHORITY_REPORT.md) and [S14 matrix](M02-02S14_CANCELLATION_GATE_MATRIX.md).
- [S15 implementation](M02-02S15_RECOVERY_QUARANTINE_REPORT.md) and [S15 matrix](M02-02S15_RECOVERY_GATE_MATRIX.md).
- [Pipeline summary](M02-02S13_S15_PIPELINE_SUMMARY.md).

**M02-02S13–S15 COMPLETE — DURABLE LEASE, CANCELLATION AUTHORITY AND SYNTHETIC RECOVERY FOUNDATION VERIFIED — REAL CODING WORKER BLOCKED.**

