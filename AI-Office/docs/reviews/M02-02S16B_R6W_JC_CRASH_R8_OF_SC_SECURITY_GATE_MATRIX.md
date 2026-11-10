# M02-02S16B-R6W-JC-CRASH-R8-OF-SC — Security Gate Matrix

Decision: `R8_OF_SC_IMPLEMENTATION_COMPLETE_OFFLINE_VERIFIED + SECURITY_STOP_PRESERVED`; `M02_NOT_COMPLETE`.

Scope: deterministic in-memory mock authorization. 19 PASS_OFFLINE_BOUNDED; R8-20 PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION. These are offline implementation gates, not runtime containment, owner approval or production authorization gates.

Source: [scoped-capability.ts](../../src/contracts/testing/scoped-capability.ts). Tests: [scoped-capability.test.ts](../../tests/contracts/scoped-capability.test.ts). Architecture, actual commands and audit exception: [implementation report](M02-02S16B_R6W_JC_CRASH_R8_OF_SC_IMPLEMENTATION_REPORT.md).

Authoritative evidence root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-r8-of-sc-a9c2e09b-f714-48a7-82fd-56de94b10e87`. Test references below are actual passed cases from `evidence/tests-run3.json`, not expected outcomes or invented results. `evidence/test-inventory.json` preserves every actual test name/status.

## Offline security gates

| Gate | Requirement | Actual result | Source/test evidence | Limit/dependency |
| --- | --- | --- | --- | --- |
| R8-01 | R7 checkpoint verified | PASS_OFFLINE_BOUNDED | baseline.json; R7 manifest hash and listed additions match | No historical runtime rerun |
| R8-02 | Existing R5/R6/R7 reused | PASS_OFFLINE_BOUNDED | Actual imports/commit inspection; R8T11/60; 256 fresh regressions | No previous foundation edits |
| R8-03 | Private capability owner | PASS_OFFLINE_BOUNDED | ScopedOwner private fields; R8T03/53/55/77 | Owner facade trusted; no human authentication |
| R8-04 | Least-privilege actions | PASS_OFFLINE_BOUNDED | Actions/Issuance/evaluator/prepare; R8T04/05/13-18/75/76 | Only two mock record actions |
| R8-05 | Task scope | PASS_OFFLINE_BOUNDED | Canonical task equality; R8T21-28/65/66/80 | One current task; sticky revocation |
| R8-06 | Destination scope | PASS_OFFLINE_BOUNDED | Canonical destination ownership/exact equality; R8T29-36/65/66 | No wildcard or filesystem access |
| R8-07 | Subject/owner binding | PASS_OFFLINE_BOUNDED | Binding comparison; R8T20/24/28/32/33/35/83 | Bearer transfer possible; caller identity not authenticated |
| R8-08 | Incarnation/epoch binding | PASS_OFFLINE_BOUNDED | Current R7 binding; R8T27/36/44/82 | Fresh incarnation needed after structural changes |
| R8-09 | Policy/auth revision | PASS_OFFLINE_BOUNDED | Current binding checks; R8T19/43/73/74 | Issuance authorityRevision metadata differs from current ticket CAS |
| R8-10 | Expiry | PASS_OFFLINE_BOUNDED | Explicit canonical time; R8T08/10/72/78 | Half-open lifetime; no wall clock |
| R8-11 | Revocation | PASS_OFFLINE_BOUNDED | Owner revoke APIs/R7 controls; R8T18/45-50/65 | No retraction of already committed effects |
| R8-12 | Single-use consumption | PASS_OFFLINE_BOUNDED | Owned ledger; R8T37-39/41/51/76 | One instance lifetime; no durable replay ledger |
| R8-13 | Atomic mock consumption | PASS_OFFLINE_BOUNDED | Pre-staged ledger/receipt plus private R7/R6; R8T39/41/51/52/61 | Trusted synchronous realm only; crash/OOM excluded |
| R8-14 | Replay rejection | PASS_OFFLINE_BOUNDED | Private origin/revisions/consumption and R6 keys; R8T38/42-44/63/69/73/81/82 | Not distributed or persistent replay resistance |
| R8-15 | SECURITY_STOP denial | PASS_OFFLINE_BOUNDED | Current stop check and R7 stop latch; R8T49 | Dummy CLEARED fixture never clears historical/application stop |
| R8-16 | Failure atomicity | PASS_OFFLINE_BOUNDED | Full snapshot equality and exact retry; R8T40/52/61-66 | Fixed synthetic faults; no OS failure injection |
| R8-17 | R5/R6/R7 regression | PASS_OFFLINE_BOUNDED | tests-run3.json: R5=100, R6=72, R7=84 PASS; exits 0 | Only four selected contract files executed |
| R8-18 | No production wiring | PASS_OFFLINE_BOUNDED | Three import whitelist; R8T59/77; full existing-file hash comparison | Test-only module not exported by app/barrel |
| R8-19 | No real authority | PASS_OFFLINE_BOUNDED | False flags; R8T56-58; no runtime/provider imports or calls | No tool/process/provider/file/user-delivery permission |
| R8-20 | Source/evidence integrity | PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION | final-integrity.json; 483 old files, 1015 historical files, 647 Hermes tracked hashes/path set preserved | R8-owned original run1 JSON overwritten by runner error; run3 unique output authoritative; see runner-correction.json |

## Capability invariants

| Invariant | Requirement | Actual result | Passed tests |
| --- | --- | --- | --- |
| SC-01 | Default deny | PASS_OFFLINE_BOUNDED | R8T03-R8T08,R8T79 |
| SC-02 | Missing capability | PASS_OFFLINE_BOUNDED | R8T79 |
| SC-03 | Unknown action | PASS_OFFLINE_BOUNDED | R8T04,R8T15,R8T17 |
| SC-04 | Caller cannot expand scope | PASS_OFFLINE_BOUNDED | R8T09,R8T10,R8T53,R8T77 |
| SC-05 | Provenance alone is no action permission | PASS_OFFLINE_BOUNDED | R8T54,R8T68,R8T75 |
| SC-06 | Admission is not publication permission | PASS_OFFLINE_BOUNDED | R8T13 |
| SC-07 | Publication is not admission permission | PASS_OFFLINE_BOUNDED | R8T14,R8T75 |
| SC-08 | Current task | PASS_OFFLINE_BOUNDED | R8T21-R8T28,R8T65,R8T66 |
| SC-09 | Exact destination | PASS_OFFLINE_BOUNDED | R8T29-R8T36,R8T65,R8T66 |
| SC-10 | Project and session ownership | PASS_OFFLINE_BOUNDED | R8T24,R8T32,R8T33,R8T83 |
| SC-11 | Incarnation and epoch | PASS_OFFLINE_BOUNDED | R8T27,R8T36,R8T44,R8T82 |
| SC-12 | Expiry and revocation | PASS_OFFLINE_BOUNDED | R8T10,R8T18,R8T45-R8T50,R8T65,R8T72,R8T78 |
| SC-13 | Current authorization revision | PASS_OFFLINE_BOUNDED | R8T73,R8T74 |
| SC-14 | At most one single-use success | PASS_OFFLINE_BOUNDED | R8T37-R8T39,R8T51,R8T76 |
| SC-15 | Atomic in-memory integration | PASS_OFFLINE_BOUNDED | R8T40,R8T41,R8T52,R8T61-R8T66 |
| SC-16 | No actual execution authority | PASS_OFFLINE_BOUNDED | R8T56-R8T60,R8T77 |

## Required 60 scenarios: actual executed cases

All sixty minimum IDs have a distinct executed case. Some scenarios also use supplied-state predicate checks; authenticity and ownership enforcement are separately exercised through the real private owner. No test launches a worker, provider or historical process probe.

| ID | Actual test title | Result |
| --- | --- | --- |
| R8T01 | valid owner issues opaque bounded capability | PASS |
| R8T02 | missing issuer record denies issuance | PASS |
| R8T03 | untrusted boundary has no issuer and fabricated owner input denies | PASS |
| R8T04 | invalid action set denies without state change | PASS |
| R8T05 | empty action set denies without state change | PASS |
| R8T06 | missing task denies without state change | PASS |
| R8T07 | missing destination denies without state change | PASS |
| R8T08 | invalid expiry denies without state change | PASS |
| R8T09 | caller cannot expand actions through snapshot or cloned handle | PASS |
| R8T10 | caller cannot extend expiry through metadata | PASS |
| R8T11 | correct admission records R7 R6 receipt | PASS |
| R8T12 | correct publication records permitted sink entry | PASS |
| R8T13 | admission permission denies publication | PASS |
| R8T14 | publication permission denies admission | PASS |
| R8T15 | unsupported action denies | PASS |
| R8T16 | missing action denies | PASS |
| R8T17 | caller action array cannot smuggle additional authority | PASS |
| R8T18 | revoked action denies future operations and issuance | PASS |
| R8T19 | stale request policy denies | PASS |
| R8T20 | wrong subject denies genuine transferred handle | PASS |
| R8T21 | exact canonical task is eligible without mutation | PASS |
| R8T22 | wrong task denies | PASS |
| R8T23 | missing task denies | PASS |
| R8T24 | cross project task denies | PASS |
| R8T25 | cancelled task denies | PASS |
| R8T26 | terminal task denies | PASS |
| R8T27 | reused task with new incarnation rejects old capability | PASS |
| R8T28 | canonical owner change rejects old subject binding | PASS |
| R8T29 | exact destination is accepted | PASS |
| R8T30 | wrong destination denies | PASS |
| R8T31 | missing destination denies | PASS |
| R8T32 | cross project destination denies canonical mismatch | PASS |
| R8T33 | cross session destination denies canonical mismatch | PASS |
| R8T34 | destination prefix gives no permission | PASS |
| R8T35 | reassigned destination denies canonical mismatch | PASS |
| R8T36 | destination reuse under new epoch denies | PASS |
| R8T37 | first single use consumption records once | PASS |
| R8T38 | duplicate use cannot change sink or sequence | PASS |
| R8T39 | gated competing admissions consume at most once | PASS |
| R8T40 | R5 rejected worker does not consume | PASS |
| R8T41 | success consumes alongside R6 admission | PASS |
| R8T42 | reset and fresh record cannot replay former capability | PASS |
| R8T43 | policy revision rejects stale capability | PASS |
| R8T44 | record recreation invalidates capability incarnation | PASS |
| R8T45 | revoke before pending admission denies without effect | PASS |
| R8T46 | revoke before pending publication denies without effect | PASS |
| R8T47 | admission before revocation remains recorded | PASS |
| R8T48 | publication before revocation remains recorded | PASS |
| R8T49 | security stop invalidates pending use and latches across recreation | PASS |
| R8T50 | cancellation before pending consumption rejects | PASS |
| R8T51 | gated publications using one capability commit at most once | PASS |
| R8T52 | consume failure prevents R6 commit and permits exact retry | PASS |
| R8T53 | forged capability metadata cannot authorize | PASS |
| R8T54 | serialized R7 authority reference alone grants no action | PASS |
| R8T55 | foreign instance handle with identical public bindings denies | PASS |
| R8T56 | every public receipt retains executionAuthority false | PASS |
| R8T57 | no provider or process call occurs during capability operations | PASS |
| R8T58 | mock publication does not write files or deliver messages | PASS |
| R8T59 | production source has no import or export of test capability module | PASS |
| R8T60 | actual R5 R6 R7 APIs retain their distinct outcomes | PASS |

## Additional adversarial and failure paths

| Actual IDs | Cases | Evidence/result |
| --- | ---: | --- |
| R8T61 | 2 | BEFORE_COMMIT and PUBLICATION_APPEND; unchanged full committed snapshot, successful exact retry. |
| R8T62-R8T64 | 3 | Scope-eligible/R6 denial, duplicate operation key and pending version invalidation. |
| R8T65 | 3 | Pending task/destination/action revocation wins; no consumption or sink change. |
| R8T66 | 2 | Canonical task/destination change via owner recreation; stale ticket and old grant deny. |
| R8T67-R8T77 | 11 | Reusable accounting, pure eligibility vs origin, JSON handle, accessors/proxy ingress, expiry/auth revision, method relabeling, combined single-use actions and private facade boundaries. |
| R8T78 | 5 | Expiry at now, beyond parent window, unsafe integer, NaN and Infinity. |
| R8T79-R8T83 | 5 | Default deny, empty/wildcard/duplicate issuance, forged/replayed tickets, epoch rollback and deliberate handle transfer with wrong bindings. |
| Total additional | 31 | PASS. Sixty minimum plus 31 additional = 91 R8 cases, 83 distinct ID labels. |

## Fresh regression and typecheck evidence

| Selected suite | Actual PASS | FAIL | SKIP | TIMEOUT | NOT_RUN |
| --- | ---: | ---: | ---: | ---: | ---: |
| R8 | 91 | 0 | 0 | 0 | 0 |
| R7 | 84 | 0 | 0 | 0 | 0 |
| R6 | 72 | 0 | 0 | 0 | 0 |
| R5 | 100 | 0 | 0 | 0 | 0 |
| Total | 347 | 0 | 0 | 0 | 0 |

Actual Vitest and scoped strict typecheck exits: 0 and 0. Scope excludes application/runtime/integration suites. Exact commands/config/source hashes: `evidence/preflight-run3.json`; actual JSON/stdout/stderr: `tests-run3.json`, `test-run3.stdout.txt`, `test-run3.stderr.txt`; typecheck logs/results: `type-run3.*`, `results-run3.json`. No dependencies installed, no production imports/startup.

Run1 had 345 PASS/2 FAIL caused by two new assertions using an incorrect R6 outcome literal. Those assertions were corrected to actual MOCK_ADMISSION_RECORDED; foundation code unchanged. Run2 passed 347, but a runner argument mistake reused config run1 and overwrote new R8 `tests-run1.json`. Original run1 stdout/stderr/preflight/results survive; overwritten JSON is not original evidence. `runner-correction.json` records this exception. Unique run3 output and matching tested-source hashes are the final basis. Historical evidence was not rewritten. Gate R8-20 explicitly retains this audit limitation.

## Atomicity and authorization limits

Scope/usage ledger is staged before private R7/R6 commit under one synchronous owner. After inner success, R8 performs only ordinary assignments to preallocated private objects. R5 denial, R7/R6 CAS rejection or fixed injected faults leave capability consumption, sink, sequence, seen IDs and operation keys unchanged. Tickets/fault plans are diagnostic metadata and may be consumed on a failed attempt. Competing operations are ordered deterministically through prepared tickets and promise gates; no arbitrary sleeps.

There are two state pointer assignments with no observable callback gap under the trusted-realm model, not a durable database transaction. Process death, host crash, OOM, hostile patched intrinsics, cross-process/distributed writers and restart recovery are excluded. Genuine handles are transferable by a holder in the same realm; bindings still apply but caller identity is not authenticated. Object identity is not cryptographic authenticity. The pure predicate authenticates nothing and cannot consume or commit. Owner facade is trusted test authority and must not be given to an untrusted producer.

Only MOCK_ADMISSION_RECORD / MOCK_PUBLICATION_RECORD exist. Permission to record output metadata does not permit tool/process/provider/file actions or real delivery. All relevant mock receipts carry executionAuthority:false. No attenuation/delegation/token exchange API is exposed; permission attenuation remains a future design consideration, not an implicit capability expansion.

## Historical restrictions and unresolved dependencies

| Area | Preserved status / unresolved dependency |
| --- | --- |
| SECURITY_STOP | SECURITY_STOP_PRESERVED; no clear operation added; private dummy fixtures do not authorize application execution. |
| Real workers | BLOCKED; no application worker/probe/watchdog/process-control/Job Object action. |
| Runtime / OS containment / MXC | NOT_PERFORMED; no new containment claim. |
| Option A | PENDING_OWNER_APPROVAL; owner approval not inferred. |
| D9 | NOT_AUTHORIZED. |
| Historical archive/cleanup | PENDING_AUTHORIZATION; no move, archive, copy or delete of historical evidence. |
| Jc custody | NOT_OBSERVABLE. |
| PID24956 | INCONCLUSIVE provenance; no new process observation. |
| Latest historical runtime observation | 2026-11-09T06:29:44.7514982+07:00, unchanged. |
| Historical D gates | D0,D2,D6,D7,D8 PASS; D1,D3,D4 PARTIAL; D5 BLOCKED; no promotion from mock tests. |
| Available integrity scope | 483 original AI Office files + exactly 4 additions = 487; 159 original default Git rows + 3 = 162; 1015 historical files/20 roots and 647 tracked Hermes files/path set preserved by hash checks. |
| Inventory limits | .git/node_modules excluded; reparse metadata compared; older unavailable 2209 files/17 roots NOT_VERIFIED. |
| Production capability gaps | Principal authentication, secure transport, cryptographic/durable credentials, durable atomic consumption/restart recovery, distributed revocation, protected owner lifecycle and actual side-effect authorization absent. |
| M02 | M02_NOT_COMPLETE. |

Separate same-agent internal adversarial review covers all 22 requested challenges in `evidence/adversarial-review.json` and report S; not independent certification. It found the assertion mistakes and the runner audit exception above; no additional defect in the bounded inspected/tested contract paths. Final manifest seals surviving R8 evidence and four additions; SHA-256 is integrity metadata, not authorization.
