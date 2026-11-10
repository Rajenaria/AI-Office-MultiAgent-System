# M02-02-PI-11A — Security Gate Matrix

**PI11A_HELD_OUTPUT_ATOMIC_OUTBOX_IMPLEMENTED_OFFLINE_VERIFIED**; **SECURITY_STOP_PRESERVED**.

The scope is real disposable SQLite persistence of inert metadata. Production acceptance, authentication and delivery remain unavailable. Every receipt carries productionAccepted:false, executionAuthority:false, publicationAuthority:false and deliveryAuthority:false.

## PI-11A Acceptance Gates

**27 PASS / 0 FAIL**, scoped to the current fixture foundation. These are acceptance findings supported by source/tests; they are not 27 additional automated tests or promotions of historical production gates.

| Gate | Requirement | Result | Evidence and limits |
|---|---|---|---|
| PI11A-01 | PI-10 checkpoint verified | PASS | PI10 manifest/baseline/history verified; no historical runtime rerun. |
| PI11A-02 | PI-10 file plan reconciled | PASS | Eight planned code/test paths plus one documented table-list assertion amendment; exactly two reports. |
| PI11A-03 | Canonical repository reused | PASS | Existing DurableAttemptRepository and owned connection/transaction; no separate authority/database. |
| PI11A-04 | Held-only schema implemented | PASS | S01/D01; schema10 exact DDL, six new STRICT tables, no delivery fields. |
| PI11A-05 | Synthetic metadata contract implemented | PASS | S02–S07, private fixture origin, OFFLINE_CONTRACT_ONLY. |
| PI11A-06 | NULL payload reference enforced | PASS | S03/D02; NULL SQL constraint and strict API, zero bytes. |
| PI11A-07 | Canonical sequence enforced | PASS | I03/I04/S06/F01, CAS, unique keys, contiguous verification. |
| PI11A-08 | Durable idempotency enforced | PASS | I01/I03/F05, original receipt and no extra rows. |
| PI11A-09 | Conflicting retries rejected | PASS | I02/I04/I05, scoped immutable key/digest checks. |
| PI11A-10 | Immutable binding snapshot enforced | PASS | D03/R01/R03, internally derived snapshot and retention/verification. |
| PI11A-11 | Metadata/outbox/audit atomic transaction | PASS | S02/F01/F07, same BEGIN IMMEDIATE/connection, deferred tuple FKs. |
| PI11A-12 | Rollback and SQLite errors verified | PASS | F01–F06: actual READONLY, BEGIN BUSY, COMMIT BUSY; injected lost ack/cleanup refusal. |
| PI11A-13 | Concurrent operation conflicts verified | PASS | I04/F02/F03, two owned SQLite connections in one process; no multiprocess claim. |
| PI11A-14 | Reopen and recovery verified | PASS | I03/F05/F06/R03/R04, explicit reopen/reconcile; no OS crash claim. |
| PI11A-15 | Corruption/schema mismatch fail closed | PASS | R01/R02/R04/H03, warm denial and cold rejection without repair. |
| PI11A-16 | Outbox remains HELD | PASS | D01/D03/H05; only HELD with immutable row/event revision1. |
| PI11A-17 | No active delivery API or lease | PASS | S01/D01/H03 + source inventory; no sender/dispatcher/delivery tables. |
| PI11A-18 | Existing security-stop preserved | PASS | H01/H05/H07, 93 security-stop regressions; no clearance. |
| PI11A-19 | Host/fixture authority isolated | PASS | H02/H03, private WeakSet, actual HOST_SQLITE rejects writer/lookup. |
| PI11A-20 | No production output acceptance | PASS | All result flags false; PI09B 72 selected regressions. |
| PI11A-21 | No worker/model provider/external publication | PASS | Preloaded process/network/listener guards; H04 and import inventory. Local storage adapter fixtures only. |
| PI11A-22 | Relevant regression suites executed | PASS | Final tests-run5: 1,088 prior tests PASS; four process suites explicitly NOT_RUN. |
| PI11A-23 | Scoped typecheck passed | PASS | typecheck-run6 exit0; failed typecheck-run2 retained. |
| PI11A-24 | Source/evidence integrity preserved | PASS | Six modifications/five additions/no deletions; final inventory/seal/history checks. |
| PI11A-25 | Historical PARTIAL/BLOCKED retained | PASS | Explicit historical status table below; no promotions. |
| PI11A-26 | Official M02 acceptance gaps retained | PASS | M02_NOT_COMPLETE; OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE. |
| PI11A-27 | Next actual integration blocker identified | PASS | One next milestone PI11B, persisted eligibility revalidation permanently deny-only. |

## All 49 Planned PI-10 Scenarios

Source: PI10 architecture report section U. **33 PASS / 7 PARTIAL / 9 NOT_RUN** in PI11A. In PI10 every row was NOT_RUN. Future restricted cases remain NOT_RUN, never inferred from HELD defaults. PASS for a negative/no-effect requirement can combine executed guard/regression evidence and explicit static inventory; it does not imply live transport testing.

The current user instruction overrides PI10 O07: no HELD-to-CANCELLED state exists. PI11A records remain HELD even when safety controls deny future operations. No future behavior was enabled to satisfy the old plan.

| PI10 ID | Planned scenario | Current outcome | Actual mapping / remaining dependency |
|---|---|---|---|
| A01 | Valid synthetic held-metadata contract | PASS | S02: actual commit; six linked tables, optional claim exercised I01/F01. |
| A02 | Missing production authority | PASS | H02/H03/H04 and PI08/PI09B regressions: production/fake receiver denies, no host writer. |
| A03 | SECURITY_STOP denies | PASS | H01/H05; UNKNOWN remains production denial, only owned fixture metadata allowed; no clearance. |
| A04 | Invalid owner | PASS | S05/H06; wrong owner/incarnation/session/epoch rejects, no changes. |
| A05 | Cancelled run | PASS | H01/H07: actual noLaunch cancellation and terminal new-write denial; no runtime cancellation claim. |
| A06 | Wrong destination | PASS | S05; canonical destination mismatch/invalid channel rejects; I03 allows separate fixture channel namespace. |
| A07 | Atomic metadata/outbox | PASS | S02/F01/F07, one transaction and deferred tuple links. |
| A08 | Rollback every stage | PASS | F01 nine precommit stages including real audit write/constraint errors, healthy retries after rollback. |
| A09 | Duplicate idempotency key | PASS | I01/I03/F05: exact replay, including reopen, retains identities/rows. |
| A10 | Conflicting idempotency key | PASS | I02/I05/S03/S05; conflict or invalid payload/scope denies, no overwrite. |
| A11 | Concurrent sequence claim | PASS | I04/F02/F03: actual two-connection competition/locks, CAS and bounded explicit retry. |
| A12 | Missing outbox detection | PASS | R01 missing-outbox corruption: warm denial and cold rejection, no backfill. |
| O01 | Non-deliverable default | PASS | S01/D01/D03: only HELD; unsupported delivery states/fields absent. |
| O02 | Unauthorized delivery claim | PASS | H02/H03, strict API and source shape; no delivery claim method or lease structure to invoke. |
| O03 | Lease conflict | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| O04 | Expired lease | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| O05 | Concurrent delivery claim | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| O06 | Revoked delivery | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| O07 | Cancelled delivery | PARTIAL | Current stricter PI11A requires HELD even after cancellation. H01/H05/H07 deny new output; D01 denies CANCELLED. Live cancellation/send race NOT_RUN. |
| O08 | Stop activation | PARTIAL | H05 plus stop regressions PASS for fixture stop/history; future delivery-phase stop revalidation NOT_IMPLEMENTED/NOT_RUN. |
| O09 | Wrong destination | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| O10 | Wrong epoch | PARTIAL | S05 epoch rejection PASS; authenticated future delivery epoch/claim/send validation NOT_RUN. |
| O11 | Stale policy | PARTIAL | R03 current revision mismatch denial and immutable historical replay PASS; live authoritative policy refresh/delivery NOT_RUN. |
| O12 | Retry failure | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| R01 | Reopen committed metadata | PASS | I03/R03/F05: actual close/reopen and stable HELD/sequence/receipt. |
| R02 | Reopen rollback | PASS | F06 reopened quarantined cleanup and healthy retry show zero partial rows; F01 proves normal rollback. |
| R03 | Lost acceptance receipt | PASS | F05: actual successful COMMIT, fixed lost-ack hook, unknown receipt and explicit same-op reconciliation. |
| R04 | Lost delivery acknowledgment | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| R05 | Corrupt outbox | PASS | R01/R02: state/head/digest/link/counter inconsistencies rejected on warm/cold verification. |
| R06 | Missing accepted metadata | PASS | R01 orphan-outbox/missing-accepted corruption rejected; no repair. |
| R07 | Duplicate delivery operation | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| R08 | Expired claim on restart | NOT_RUN | FUTURE_RESTRICTED: no authorized delivery broker/service identity/transport/lease/recipient protocol exists; no positive test fabricated. |
| R09 | Old consistent snapshot | PARTIAL | Database-only whole consistent restore limitation documented/static reviewed. No independent witness or restoration experiment; future anti-rollback proof NOT_RUN. |
| R10 | Host invalidation | PASS | Host-composition regressions (63), H02/H03 and closed repository safety; no live writer reacquisition or historical process probe. |
| S01 | No network | PASS | Preloaded network/listener/DNS/fetch guard on runner/threads; H04; no sends/listeners. |
| S02 | No worker | PASS | Preloaded child-process guard; selected imports contain no process execution helper; no worker launch. |
| S03 | No provider | PASS | No model-provider client/import/credential load; only local disposable SQLite storage adapter exercised. |
| S04 | No public endpoint | PASS | Final source hashes show HTTP/host modules unchanged; actual host facade tests deny exposure. Live HTTP NOT_RUN. |
| S05 | No fixture authority promotion | PASS | H02/H03: fake flags/token/prototype fail, actual HOST_SQLITE cannot write fixture metadata. |
| S06 | No clearance | PASS | H01/H05, PI05 regressions, source inventory: no state/action granting clearance. |
| S07 | No unauthorized payload persistence | PASS | S03/S07/D02: payload fields/digests rejected, references NULL/bytes0. Classification never authoritative. |
| S08 | No raw denial logging | PASS | S07 and safe frozen denial shape; no getter/raw input/SQL error logging; synthetic marker not stored. |
| S09 | No external delivery | PASS | S01/D01 and offline guard/source review: no executable delivery structure/API. |
| S10 | All authority false | PASS | flags() validates all four false flags on committed/replay/denied/unknown; PI09B denial unchanged. |
| F01 | READONLY/BUSY | PASS | F02/F03/F04 actual BEGIN BUSY/COMMIT BUSY/query_only errors; no partial writes. |
| F02 | Commit uncertainty | PASS | F05/F06; observed commit phase, unknown/quarantine and explicit lookup, no blind retry. |
| F03 | Grant claim partial failure | PASS | F01 with optional inert claim plus constraint/audit errors rolls claim and operation back together. |
| F04 | Sequence gap/order/capacity | PARTIAL | S06/I03/I04/F01/R02 prove invalid/gap/conflict/rollback/counter checks. Limits implemented 128 streams/4096 outputs; exact saturation NOT_RUN. PI10 future 256-event limit is inapplicable to current one-event-only ledger. |
| F05 | Safety control independent | PARTIAL | 93 stop tests, direct noLaunch cancellation and source-preserved PI09B finish withholding PASS. Four child-process lifecycle suites/runtime finish behavior NOT_RUN. |

## Metadata, Idempotency, Outbox and Transaction Invariants

All **36** invariants below PASS within the supported repository/owned fixture boundary, with the stated trust limits. No SQL trigger or hash is a security boundary against arbitrary privileged code/native filesystem access.

| Invariant | Requirement | Result | Evidence |
|---|---|---|---|
| HM-01 | Missing required identity denies | PASS | S04/S05; strict command/schema. |
| HM-02 | Invalid scope binding denies | PASS | S05/H06; canonical association/owner checks. |
| HM-03 | Wrong attempt incarnation denies | PASS | S05 incarnation parameter, H06 replay. |
| HM-04 | Invalid execution epoch denies | PASS | S05 generation parameter and I04 stale assignment. |
| HM-05 | Unsupported metadata schema denies | PASS | S07/R01 version corruption. |
| HM-06 | Raw payload cannot pass PI11A APIs | PASS | S03/S07; strict fields, accessor rejection. |
| HM-07 | Payload reference must be NULL | PASS | D02/S02 and SQL NULL CHECK. |
| HM-08 | Committed bindings immutable | PASS | D03/R01/R03; retention and digest/link verification. |
| HM-09 | Synthetic metadata is not production authority | PASS | H02/H03/H04, all receipt flags false. |
| HM-10 | Every output remains HELD | PASS | D01/D03/H05, no transition API. |
| ID-01 | Operation ID is not credential | PASS | H06 owner/scope checks on replay/lookup. |
| ID-02 | Replay cannot bypass scope | PASS | H06 and S05; current repository ownership required. |
| ID-03 | Exact retry idempotent | PASS | I01/I03/F05; original rows and receipt. |
| ID-04 | Conflicting retry denies | PASS | I02/I04/I05, immutable key/digest fields. |
| ID-05 | Idempotency survives reopen | PASS | I03/F05/R03. |
| ID-06 | Success never grants delivery authority | PASS | flags() on committed/replay results, no delivery code. |
| OB-01 | Outbox references canonical metadata | PASS | S02/F07; tuple FKs and verifier. |
| OB-02 | No orphan deliverable operation | PASS | F07/R01; only HELD exists. |
| OB-03 | No executable delivery lease | PASS | S01 + exact DDL/source inventory. |
| OB-04 | No raw output payload | PASS | S03/D02, NULL/zero bytes, metadata digest only. |
| OB-05 | No supported HELD promotion | PASS | D01/D03; no state-changing API. |
| OB-06 | Reopen preserves HELD | PASS | I03/F05/R03. |
| OB-07 | Metadata and outbox atomic | PASS | F01/F07/S02. |
| OB-08 | Persistence cannot grant publication | PASS | All false flags; PI09B full regression. |
| OB-09 | SECURITY_STOP cannot be bypassed | PASS | H01/H05/H07 + security-stop suite. |
| OB-10 | No polling/scheduling/delivery | PASS | Source inventory and preloaded effect guards. |
| AT-01 | No metadata-only partial commit | PASS | F01 afterMetadata rollback; deferred outbox pair. |
| AT-02 | No outbox-only partial commit | PASS | F01 afterOutbox, F07 and R01 orphan detection. |
| AT-03 | No claim without committed operation | PASS | F01 with claim; deferred reciprocal tuple FKs. |
| AT-04 | Rollback never advances sequence | PASS | F01/F03; empty stream and healthy seq1 retry. |
| AT-05 | No false success after failed COMMIT | PASS | F03 real COMMIT BUSY; F05 unknown on lost ack. |
| AT-06 | Duplicate op cannot create second outbox | PASS | I01/I03/F05. |
| AT-07 | Writers respect SQLite isolation | PASS | I04/F02/F03; actual independent connections. |
| AT-08 | Commit grants no external effects | PASS | All authority flags false, no delivery method. |
| AT-09 | One database in atomic boundary | PASS | Same existing repository connection/helpers, source inventory. |
| AT-10 | All results held-only/non-executable | PASS | flags()/D01, including failed and ambiguous results. |

Sequence next-value is derived from retained counter and validated against expectations, then advanced by same-transaction CAS. Stable operation/digest/key/event uniqueness and retry lookups retain original allocation. Exact 128-stream/4096-output saturation is implemented but not exercised; no anti-exhaustion production claim is made. One event per outbox replaces PI10's future multi-event/delivery ledger; there is no event truncation or archive operation.

## Required 55 Offline Specifications

These rows map the user's 55 specifications; **they are not 55 additional test executions**. Automated case count is 106 new, with parameterized rows counted by the runner. Static-only surface exclusions are labelled in their evidence; live endpoints/processes/providers remain NOT_RUN.

| Specification | Requirement | Result within PI11A | Actual evidence |
|---|---|---|---|
| 1 | Fresh held-only schema | PASS | S01/S02 |
| 2 | Required tables/constraints | PASS | S01/D01–D03/F07 |
| 3 | Unsupported schema rejection | PASS | H03 + host-composition/provider regressions |
| 4 | Legacy schema rejection | PASS | R04/H03, actual disposable v9 rejected unchanged |
| 5 | NULL payload reference | PASS | S02/D02 |
| 6 | HELD-only state | PASS | D01/D03 |
| 7 | Missing identity | PASS | S04 |
| 8 | Wrong scope | PASS | S05/H06 |
| 9 | Invalid binding digest | PASS | R01 |
| 10 | Unsupported metadata | PASS | S07/R01 |
| 11 | First valid fixture operation | PASS | S02 |
| 12 | Exact retry | PASS | I01 |
| 13 | Conflicting retry | PASS | I02 |
| 14 | Duplicate operation ID | PASS | I01/I02 |
| 15 | Duplicate sequence | PASS | I04/I05 |
| 16 | Concurrent sequence allocation | PASS | I04/F02/F03, two connections, no multiprocess test |
| 17 | Sequence rollback | PASS | F01/F03 |
| 18 | Reopen sequence | PASS | I03 |
| 19 | Retry after reopen | PASS | I03/F05/R03 |
| 20 | Overflow/invalid sequence | PASS | S06 |
| 21 | Metadata/outbox together | PASS | S02/F01 |
| 22 | Audit/operation claim together | PASS | I01/F01/F07 |
| 23 | Failure before metadata | PASS | F01 afterSequence/Operation/Claim |
| 24 | Failure after metadata | PASS | F01 afterMetadata |
| 25 | Failure after outbox | PASS | F01 afterOutbox |
| 26 | Audit insertion failure | PASS | F01 auditWrite uses actual query_only error |
| 27 | Constraint rollback | PASS | F01 constraint, F07 |
| 28 | SQLite READONLY | PASS | F04 |
| 29 | SQLite BUSY | PASS | F02/F03 |
| 30 | Ambiguous commit reconciliation | PASS | F05 |
| 31 | Valid reopen | PASS | I03/F05/R03 |
| 32 | HELD persists | PASS | I03/F05 |
| 33 | Idempotency receipt persists | PASS | I03/F05 |
| 34 | Missing metadata detection | PASS | R01 orphan outbox |
| 35 | Orphaned outbox detection | PASS | R01 |
| 36 | Corrupt binding snapshot | PASS | R01 binding shape/digest |
| 37 | Invalid audit reference | PASS | R01 audit head/digest/missing event |
| 38 | Unsupported record version | PASS | S07/R01 |
| 39 | Incomplete transaction rollback | PASS | F01/F06/F07 |
| 40 | No automatic repair | PASS | R01/R02/R04; snapshots unchanged on rejection |
| 41 | Fixture cannot authenticate production | PASS | H02/H03/H04, existing PI08 regressions |
| 42 | Caller cannot use fixture persistence | PASS | H02/H03; no host facade writer |
| 43 | No raw stdout/stderr stored | PASS | S03/S07/D02 |
| 44 | No public publication endpoint | PASS | Static final HTTP/host hash comparison + host facade regression; live HTTP NOT_RUN |
| 45 | No delivery lease | PASS | S01/DDL |
| 46 | No active dispatcher | PASS | Static source inventory + runtime effect guard |
| 47 | No worker execution | PASS | Process preloader guard + import inventory; H04 |
| 48 | No model-provider call | PASS | Provider import/source inventory + network guard; disposable local storage provider is not model provider |
| 49 | No external delivery | PASS | Effect guard/H04/DDL |
| 50 | SECURITY_STOP preserved | PASS | H01/H05/H07 + 93 stop regressions |
| 51 | Execution false | PASS | flags() and PI09A/PI08 tests |
| 52 | Publication false | PASS | flags() and 72 PI09B tests |
| 53 | Delivery false | PASS | flags() for every result kind |
| 54 | PI09B denial intact | PASS | 72 publication regressions/H04 |
| 55 | PI09A denial intact | PASS | 47 admission regressions |

## Actual Test Commands and Outcomes

Evidence: C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi11a-1794294407965-offline.

Final tests-run5.json: **1,194 PASS / 0 FAIL / 0 SKIP / 0 timeout, 19 files**, exit0; **106 new + 1,088 prior tests freshly rerun**. Final typecheck-run6 exit0. Exact commands, timestamps, source SHA-256 inputs, isolated config and root descriptors are in tests-run5.preflight.json and typecheck-run6.preflight.json; stdout/stderr, JSON results and result.json retain outcomes. The implementation report reproduces both final commands.

| Final selected file | Actual PASS |
|---|---:|
| output-metadata.test.ts (new) | 106 |
| durable-mock-transaction.test.ts | 91 |
| execution-fence.test.ts | 100 |
| fake-authority-adapter.test.ts | 84 |
| mock-enforcement.test.ts | 72 |
| scoped-capability.test.ts | 91 |
| contracts.test.ts | 27 |
| execution-admission.test.ts | 47 |
| execution-readiness.test.ts | 36 |
| host-composition.test.ts | 63 |
| host-principal.test.ts | 22 |
| host-session.test.ts | 72 |
| host-sqlite.test.ts | 97 |
| import.test.ts | 1 |
| output-publication.test.ts | 72 |
| persistence.test.ts | 37 |
| pipeline.test.ts | 2 |
| provenance.test.ts | 81 |
| security-stop.test.ts | 93 |
| Total | 1,194 |

Failure history retained: typecheck-run2 exit1 (fake receiver cast); tests-run2 1,130PASS/56FAIL (strict identity projection and stale table assertions); debug-S02 9PASS/1FAIL/1,176 filtered SKIP (name pattern also matched older S02 cases); tests-run3 91PASS/7FAIL (OutputFailure normalization); tests-run4 105PASS/1FAIL (additional fixture lease clock). Final corrections are described in the implementation report. No failed run contributes to final PASS count; no earlier logs/results are overwritten. tests-run1 itself was NOT_RUN after failed compile, and its unused setup root is retained.

Preloaded guards deny network/listeners/DNS/fetch/child-process calls in the runner and test threads. Config disables env loading/plugins/global setup/cache/watch/UI/API/server/HMR. No credentials, model APIs, worker dispatch, probe, OS process lifecycle test or historical runtime script is invoked. Existing HostSQLiteProvider is a local storage adapter tested only on new disposable directories; it is not an AI provider.

## Atomicity and Recovery Evidence Boundaries

| Condition | Evidence | Interpretation |
|---|---|---|
| Successful commit | S02/I01 | One stream/op/metadata/outbox/event and optional claim; prior authority rows unchanged |
| Precommit faults | F01 nine stages | Same transaction rollback; zero output rows/counter increment; same-key healthy retry |
| BEGIN BUSY | F02 | Real second SQLite connection holds writer lock; no automatic retry |
| COMMIT BUSY | F03 | Real reader lock; failed COMMIT followed by proven rollback; not success/unknown when rollback known |
| READONLY | F04 | Actual query_only owned connection; no mode weakening or partial writes |
| After-COMMIT lost ack | F05 | Real commit persists; unknown/quarantine; new owned connection retrieves original identities |
| Rollback refusal hook | F06 | Injected cleanup refusal, unknown/quarantine; implicit close rollback verified on reopen; not an actual SQLite engine ROLLBACK failure |
| Incomplete tuple pair | F07 | Actual deferred-FK COMMIT failure rejects orphan operation |
| Inconsistent stored rows | R01/R02 | Warm operations and cold open fail closed, no repair |
| Legitimate later policy revision | R03 | Historical snapshot preserved, new stale expectations deny |
| Whole consistent old DB | Static limitation, R09 PARTIAL | Local DB cannot know it is restored; external witness NOT_IMPLEMENTED; no positive restore experiment |
| External delivery / receiver / OS crash | NOT_RUN | Outside this metadata transaction and authorization |

All output row references are NULL, payload bytes zero; classificationDigest NULL. Internally computed payloadDigest is explicitly synthetic metadata digest, not raw bytes. bindingDigest/eventDigest establish local consistency only. A privileged consistent rewrite/recomputed hash or complete older consistent copy can evade database-only checks; no signature or monotonic witness is fabricated.

## Internal Adversarial Review — 32 Challenges

Internal review, not independent certification. Findings include actual fixed implementation/test bugs; none were dismissed by weakening safety assertions.

| Challenge | Risk | Finding / mitigation / limit |
|---|---|---|
| 1 | HELD promotion | D01/D03/H05 reject promotion; no state/control API. |
| 2 | Future delivery state enabled | Six-state SQL negatives plus exact schema; no delivery fields/tables. |
| 3 | Metadata without outbox | Deferred reciprocal tuple FKs, F01/F07, verifier. |
| 4 | Outbox without metadata | F01/R01, FK/count consistency; no orphan allowed through supported path. |
| 5 | Missing audit after commit | F01 auditWrite/afterAudit and R01 missing-event detection. |
| 6 | Duplicate logical output | I01/I02/I05; stable identity plus immutable digest. |
| 7 | Duplicate sequence | I04 actual two-connection competition; stream CAS/unique sequence. |
| 8 | Conflict mistaken for retry | I02/I05 now retain safe OUTPUT_CONFLICT after transaction error normalization fix. |
| 9 | Wrong session/destination/channel | S05 and strict allowlist/current canonical binding. |
| 10 | Wrong run incarnation | S05 session/incarnation and H06; run is existing execution session, not runtime authentication. |
| 11 | Stale epoch | S05, I04; attemptGeneration cannot silently move streams. |
| 12 | Forged fixture provenance | H02; private origin marker, no flag-based authority. |
| 13 | Production facade exposes fixture writer | H03 plus 63 host-composition/97 storage-provider regressions; host source unchanged. |
| 14 | Raw output persisted | S03/S07/D02; extra fields/digests rejected, bytes0. |
| 15 | Payload reference nonnull | SQL/API NULL checks D02/S02. |
| 16 | Sensitive audit leakage | Safe codes/IDs/digests, no raw exception/input logging. No semantic secret classifier claimed; use synthetic IDs. |
| 17 | Partial transaction | F01 all nine stages with claim, same-transaction audit; rollback snapshots. |
| 18 | COMMIT BUSY false success | F03 actual shared reader lock forces COMMIT BUSY; rollback counts captured before healthy retry. |
| 19 | Lost acknowledgment duplicates | F05 successful real COMMIT then hook loss, unknown/quarantine and original operation lookup. |
| 20 | Reopen changes HELD | I03/F05/R03; no scheduler or state transition. |
| 21 | Corrupt binding digest accepted | R01 warm/cold fail-closed; no repair. |
| 22 | Old snapshot assumed detectably rolled back | Explicit DB-only limitation; R09 PARTIAL; no witness/restore proof. |
| 23 | Hash advertised tamper-proof | Hashes detect compared inconsistent changes only; privileged consistent rewrite remains outside boundary. |
| 24 | Ownership inferred authentication | H02/H03, four false flags and no positive principal/service credential. |
| 25 | Stop bypass | H01/H05/H07 and stop regressions; historical receipt after stop is not new acceptance. |
| 26 | Publication weakened | Publication source unchanged, 72 actual regressions. |
| 27 | Admission bypass | Admission source unchanged, 47 actual regressions. |
| 28 | Imports invoke provider/worker | Selected import inspection and preloaded effect guards; no model client, no listener/process helper. Local disposable storage adapter only. |
| 29 | Earlier evidence overwritten | Unique invocation files, original scope preserved, failures and unused roots retained; sealed history hash checks. |
| 30 | Historical PARTIAL promoted | Explicit unchanged status table; fixture gates do not replace prior production gates. |
| 31 | Plan counted as tests | Final runner106+1088 only; 49 mappings and55 specs are requirements, not additional executions. |
| 32 | Premature M02 completion | M02_NOT_COMPLETE and official exit incomplete; no completion checkpoint. |

## Historical Gates and Owner Limits — Unchanged

| Gate / dependency | Preserved status | Scope limit |
|---|---|---|
| PI09B-08 owner/current session-run mapping | PARTIAL | Persisted fixture associations do not authenticate a live producer |
| PI09B-11 incarnation/current epoch | PARTIAL | Existing aliases and local CAS are not independent runtime identity |
| PI09B-12 destination/channel | PARTIAL | Fixture allowlist, no authoritative production destination registry |
| PI09B-13 content/confidentiality | PARTIAL | No raw payload store or authoritative classifier |
| PI09B-18 HTTP/UI non-execution | PARTIAL | Source/facade tests; live endpoint/UI testing NOT_RUN |
| PI09A-18 | PARTIAL | Earlier admission scope unchanged; no actual runtime launch |
| PI02-19 | PARTIAL | Original acceptance/runtime boundary not completed |
| PI06-08 | PARTIAL | Existing path/filesystem guarantees not strengthened by SQLite |
| PI07-08 filesystem | PARTIAL | Path-based checks do not provide stronger native filesystem containment |
| PI08 identity trust root | BLOCKED / NOT_VERIFIED | Source independence, issuer/audience, trusted clock, rotation/revocation and membership unavailable |
| PI08 historical total | 17 PASS / 2 PARTIAL / 5 BLOCKED retained | No production identity inferred |
| Four child-process suites | NOT_RUN | concurrency.test.ts, lease.test.ts, cancellation.test.ts, recovery.test.ts |
| Historical runtime-security process suites | NOT_RUN | No historical process-oriented run imported or repeated |
| R8-20 exception | PRESERVED | Historical diagnostic evidence exception not rewritten |
| Jc | NOT_OBSERVABLE | No new crash/Job observation |
| Historical PID24956 | INCONCLUSIVE | No new process probe or cleanup |
| External monotonic witness | NOT_IMPLEMENTED | No whole-snapshot anti-rollback proof |
| Option A | PENDING_OWNER_APPROVAL | No owner approval inferred |
| D9 | NOT_AUTHORIZED | No process/destructive action authorized |
| Evidence archival | PENDING_AUTHORIZATION | No cleanup/move/deletion/archival |
| Worker / production dispatcher | BLOCKED / NOT_IMPLEMENTED | No worker execution or active broker |
| Production publication atomicity | NOT_VERIFIED | Only same-database inert metadata atomicity tested |
| M02 | M02_NOT_COMPLETE | No completion checkpoint |
| Official M02 criteria | OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE | No signed final criteria/handshake/account/task evidence invented |

## Source and Evidence Integrity

Baseline 534 files/216 Git rows; final 539/221. Six existing files modified, five added, no deletion. The one extension beyond PI10's eight code/test paths is the execution-readiness table-list compatibility assertion. Original scope and explicit amendment remain. Exactly two new reports; no previous report changed.

Historical protected set 26,143 files/307 roots and Hermes3D647 tracked hashes/path set remain consistent. Older unavailable 2,209 files/17 roots remain NOT_VERIFIED. All newly created fixture roots, diagnostic failures and unused setup roots are retained. The manifest seals audit/fixture/source inventories; final post-seal verification and manifest SHA-256 are reported separately to avoid circular report hashing.

Hashes are local integrity checks, not independent security certification. No pre-existing user changes are removed or attributed to this slice.

## Single Next Milestone

**PI11B — Repository-Level Held Output Eligibility Revalidation, Deny-Only.** Read-only assessment of the actual retained operation/snapshot/HELD outbox against current canonical scope/policy/cancellation/stop, permanently false authority flags, only fresh offline tests. No dispatcher, lease, sender, positive authentication/acceptance or real database use.

Positive production acceptance/delivery additionally depends on external identity/destination/policy sources and explicit owner authorization, all still unavailable. This recommendation authorizes no activation.

