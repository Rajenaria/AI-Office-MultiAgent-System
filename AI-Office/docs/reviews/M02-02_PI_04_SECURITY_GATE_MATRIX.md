# M02-02-PI-04 — Security Gate Matrix

Decision: **PI04_HOST_SESSION_BINDING_IMPLEMENTED_OFFLINE_VERIFIED**. **SECURITY_STOP_PRESERVED**. **M02_NOT_COMPLETE**.

PASS below is restricted to the implemented offline repository contract and observed tests. Production host integration remains BLOCKED with PRODUCTION_HOST_AUTHORITY_UNAVAILABLE; principal authenticity remains PRODUCTION_PRINCIPAL_UNVERIFIED. All decisions retain eligible:false and executionAuthority:false. No production authentication, authorization, containment, dispatch or M02 acceptance is certified.

## PI-04 acceptance gates

| Gate | Requirement | Status | Evidence and scope |
| --- | --- | --- | --- |
| PI04-01 | PI-03 baseline verified | PASS | baseline.json; 501 files / 179 Git rows; PI03 manifest verified; historical reports retained |
| PI04-02 | Existing host identity sources inspected | PASS | Implementation E; HTTP/index/web/workspace/state/runtime-security source inspection only |
| PI04-03 | Trust classifications established | PASS | Implementation F; caller, host observation, authenticated subject, canonical binding and authority separated |
| PI04-04 | Host-context provenance contract implemented | PASS | host-session.ts private WeakMap; repository #hostIssuer; H01–H09 |
| PI04-05 | Caller-forged context rejected | PASS | H02–H05/H10/R14; forged labels, symbols, copies, proxy and foreign genuine issuer deny |
| PI04-06 | Canonical session binding implemented | PASS | schema v8; existing grant.sessionId reused; S01/S04/S08/R01 |
| PI04-07 | Principal/session ownership enforced | PASS | S02–S05/S08/S09/A07/A12; canonical captures and generation checks |
| PI04-08 | Attempt incarnation binding enforced | PASS | S06/S10; PI03 R10/R12; no ID-string-only inheritance |
| PI04-09 | Execution epoch binding enforced | PASS | S08/A01; unchanged PI02 current-owner/CAS validation |
| PI04-10 | Policy/grant revisions enforced | PASS | A04–A08/A11; PI03 O01/G01/X01; current provenance checks |
| PI04-11 | Expiry/revocation enforced | PASS | H07/S08/S09/A08/R03; expiry at equality and persisted irreversible revocation |
| PI04-12 | Repository transaction consistency verified | PASS | R08–R11; one readTransaction and private same-connection snapshot; no distributed atomicity claim |
| PI04-13 | Legacy and malformed state denied | PASS | R01/R04–R07/R14; exact schema + typed records + FK integrity; no automatic legacy mapping |
| PI04-14 | SQLite reopen behavior verified | PASS | R02–R04; retained rows/revocation, old issuer/context denied, explicit fixture-only repin |
| PI04-15 | Relevant regressions passed | PASS | Run4: 622 previous safe cases rerun, plus 72 new; 694 PASS; typecheck 0 |
| PI04-16 | Production trust-root limitations documented | PASS | PRODUCTION_HOST_AUTHORITY_UNAVAILABLE; authenticated integration BLOCKED; implementation Q/R |
| PI04-17 | No real execution authority | PASS | All fixture decisions eligible:false/executionAuthority:false; H01/R13/R14 and denied() assertions |
| PI04-18 | No dispatch or provider wiring | PASS | R12, import safety, test guard and exact source footprint; production routes unchanged |
| PI04-19 | Historical SECURITY_STOP preserved | PASS | A09–A10; baseline/history equality; SECURITY_STOP_PRESERVED |
| PI04-20 | Scope and source integrity verified | PASS | Exact four modified/four added/zero removed; final-snapshot/integrity/manifest; tested hash recheck |
| PI04-21 | Previous PARTIAL gates carried forward | PASS | PI02-19 PARTIAL; R8-20 exception; four suites NOT_RUN; no retrospective promotion |
| PI04-22 | M02 completion assessed accurately | PASS | OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE; M02_NOT_COMPLETE; no final checkpoint |

PI04-16 passes documentation of the limitation, not authenticated host integration. PI04-12 covers one local SQLite snapshot and deterministic writer interleavings, not distributed atomicity. PI04-20 is backed by final hash/path verification in the sealed integrity artifacts.

## Execution-session invariants

| Invariant | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| ES-01 | Missing canonical session denies | PASS | S01/R01; no row manufacture |
| ES-02 | Unknown session denies | PASS | S01 unknown execution ID |
| ES-03 | Principal mismatch denies | PASS | S03/S08/A07; PI03 P05/G04 |
| ES-04 | Application-session mismatch denies | PASS | S04/A12/R06; immutable association or FK integrity |
| ES-05 | Project/workspace mismatch denies | PASS | S06/S07 |
| ES-06 | Attempt/session binding mismatch denies | PASS | S06/A11; PI03 G01/G03/G06 |
| ES-07 | Run incarnation mismatch denies | PASS | S06/S10; PI03 R10/R12 |
| ES-08 | Execution epoch mismatch denies | PASS | S08/A01 |
| ES-09 | Stale policy revision denies | PASS | A04; PI03 O01/X01 |
| ES-10 | Stale authorization revision denies | PASS | A04/A08; PI03 G01/X01 |
| ES-11 | Expired host context denies | PASS | H07; bounded private fixture lifetime |
| ES-12 | Revoked session denies | PASS | S08/S09/R03 |
| ES-13 | Canceled attempt denies | PASS | A02 noLaunch cancellation |
| ES-14 | Terminal attempt denies | PASS | A03 |
| ES-15 | Reused session ID cannot inherit binding | PASS | S05/S10/S11/R02; generations/incarnation/private issuer |
| ES-16 | Untrusted metadata cannot replace ownership | PASS | H03/H10/S04/R14 |
| ES-17 | Missing production authentication stays explicit | PASS | H01/denied(); unavailable host and unverified principal |
| ES-18 | Session consistency cannot override SECURITY_STOP | PASS | A09/A10 |
| ES-19 | Fixture-valid session never grants authority | PASS | H01/R13 |
| ES-20 | Every result keeps executionAuthority:false | PASS | sessionDecision/denySession and all new decision assertions + regressions |

Consistency can coexist with PI02 SECURITY_STOP/cancellation/terminal denial. It never means eligible. Reopen requires a fresh local fixture issuer; metadata cannot restore private membership. Explicit fixture atMs is not trusted production time. Genuine object references remain reusable within their unchanged bounded fixture window, not as one-time permits.

## Host/transaction invariants

| Invariant | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| HT-01 | Missing host binding denies | PASS | H02/S08/R01 |
| HT-02 | Missing canonical session denies | PASS | S01/A12/R06 |
| HT-03 | Identity mismatch denies | PASS | S03/S06/S07/A07 |
| HT-04 | Stale revisions deny | PASS | H06/H08/S08/S11/A04/R09 |
| HT-05 | Revocation denies | PASS | S08/S09/A08/R03 |
| HT-06 | Failed validation creates no launch intent | PASS | H10/R08/R11/R13/R14; before/after snapshots |
| HT-07 | Failed evaluation does not consume a grant | PASS | H01/R08/R11/R13 |
| HT-08 | Concurrent binding changes cannot authorize | PASS | R09 separate-connection uncommitted/committed interleaving, always false |
| HT-09 | Reopen preserves deny semantics | PASS | R02–R04 |
| HT-10 | No external side effect occurs | PASS | R12 spies + runner guard; no dispatch/provider/output path |
| HT-11 | No real authority is returned | PASS | All new results and false literals |
| HT-12 | Transaction success is not authentication | PASS | H01/R13; production blockers remain |

HT-06/07 compare stored attempt/event/epoch/security/provenance/application/execution rows. No execution-intent or grant-consuming path is called. This read-only diagnostic must not be reused as a production dispatch permit.

## Sixty requested negative-authorization test specifications

Mappings refer to actual final run4 assertions, not 60 assumed or additional tests. H/S/A/R labels identify cases in [host-session.test.ts](../../tests/integration/durable-attempt-foundation/host-session.test.ts); PI03 labels refer to [provenance.test.ts](../../tests/integration/durable-attempt-foundation/provenance.test.ts). A specification can map to several assertions and vice versa.

| # | Specification | Status | Actual test evidence | Observed scope |
| --- | --- | --- | --- | --- |
| 1 | Valid synthetic host context | PASS | H01 | Fixture binding consistent; authority false |
| 2 | Missing host context | PASS | H02 | HOST_CONTEXT_MISSING |
| 3 | Caller-forged context | PASS | H03 | HOST_CONTEXT_INVALID |
| 4 | Serialized context copy | PASS | H04 json/clone/spread/proxy | Membership lost; denial |
| 5 | Wrong issuer | PASS | H05 | Genuine foreign handle denied |
| 6 | Stale issuer generation | PASS | H06 | Persisted issuer generation mismatch; mint denied |
| 7 | Expired context | PASS | H07 | Expiry at equality; canonical sessions still active |
| 8 | Invalid source revision | PASS | H08 + A04 source revision | Unsupported host-context revision and stale provenance source revision denied |
| 9 | Unknown source type | PASS | H03/H09/S09 | Unknown handle/source and UNVERIFIED canonical source denied |
| 10 | Caller replaces principal identity | PASS | H10 | Strict request INVALID_REQUEST, no writes |
| 11 | Valid synthetic principal/session association | PASS | H01/S10 | Consistency only; no authentication |
| 12 | Missing principal | PASS | S02/A05 principal | FK/integrity denial; PI03 P01 also missing-row denial |
| 13 | Wrong principal | PASS | S03/A07 | Ownership mismatch with valid principal FK |
| 14 | Missing application session | PASS | A12/R06 | Deleted/missing target triggers integrity denial |
| 15 | Wrong application session | PASS | S04/R06 | Rebind trigger rejects; forged handle/orphan denied |
| 16 | Missing execution session | PASS | S01 | SESSION_MISSING |
| 17 | Wrong execution session | PASS | S01/H05 | Unknown ID/foreign context cannot establish binding |
| 18 | Cross-project identity | PASS | S06 projectId; PI03 P06 | Expected identity denied; scoped FK/tampering denied |
| 19 | Cross-workspace identity | PASS | S07 | ID and generation tested separately |
| 20 | Session ownership change | PASS | S03 | Requires new app generation; old execution/context invalid |
| 21 | Valid fixture attempt binding | PASS | H01 | Canonical attempt/epoch/workspace match; still false |
| 22 | Wrong attempt | PASS | S06 attemptId; A11 | Unknown expected attempt/redirected grant denied |
| 23 | Wrong incarnation | PASS | S06 authorityIncarnation; S10 | Different incarnation denies reused strings |
| 24 | Stale execution epoch | PASS | S08 epoch/A01 | Actual canonical epoch advancement invalidates old binding |
| 25 | Reused attempt ID | PASS | S10; PI03 R10/R12 | Fresh authority cannot inherit old context/provenance |
| 26 | Reused session ID | PASS | S05/S10/S11 | Generation/unique/no-delete/private issuer prevent inheritance |
| 27 | Canceled attempt | PASS | A02 | Canonical noLaunch cancellation denied |
| 28 | Terminal attempt | PASS | A03 | Terminal readiness and new issuance denied |
| 29 | Revoked session | PASS | S08/S09/R03 | Execution and application revocation + reopen |
| 30 | Stale binding revision | PASS | S08 revision/S11/R09 | Stale request and old private snapshot denied |
| 31 | Missing policy | PASS | A05 policy; PI03 O02 | Missing/orphan provenance denied |
| 32 | Stale policy revision | PASS | A04 policyRevision; PI03 O01/X01 | Captured/current revisions must agree |
| 33 | Missing grant | PASS | A05 grant; PI03 G02 | Missing/orphan provenance denied |
| 34 | Grant/principal mismatch | PASS | A07; PI03 G04 | Existing other principal FK does not satisfy ownership |
| 35 | Grant/session mismatch | PASS | A06 | Current grant redirected to other session denied |
| 36 | Grant/attempt mismatch | PASS | A11; PI03 G01/G03/G06 | Unknown target integrity denial; existing PI03 binding matcher regression |
| 37 | Grant revoked | PASS | A08; PI03 R07 | Current revoke invalidates issuance/context; persisted retention |
| 38 | Unknown host authority | PASS | H02/H03/S08/R01 | Missing/unrecognized private source/pins denied |
| 39 | Existing PI03 provenance denial | PASS | A04–A08 + 81-case provenance regression | Unchanged evaluator reused under same snapshot |
| 40 | Consistent fixture provenance denies authority | PASS | H01/R13 | Principal/host production blockers unconditional |
| 41 | Fresh fixture binding | PASS | H01/R01 | Explicit fixture SQL only; defaults cannot create trust |
| 42 | Reopen valid fixture | PASS | R02 | Rows retained; old handles/pins rejected; explicit fixture repin only |
| 43 | Reopen revoked binding | PASS | R03 execution/application | Revocation persists; restoration/delete rejected |
| 44 | Legacy record without binding | PASS | R04; PI02/PI03 legacy regressions | v7/v6/v5 unsupported; no automatic identity/migration |
| 45 | Unsupported schema | PASS | R05; PI03 R06 | Already-open connection rechecks user_version |
| 46 | Corrupted binding record | PASS | R07 | SQL-accepted invalid issuer UUID rejected by strict schema |
| 47 | Orphaned foreign-key reference | PASS | R06/A05/A11/A12 | Exact schema restored; foreign_key_check denies |
| 48 | Transaction rollback | PASS | R08/R11; persistence controlled faults | Real SQLITE_READONLY + invalid transition rollback; no authority |
| 49 | Storage read error | PASS | R10 | Exclusive-lock denial; retry stays false |
| 50 | Binding revision conflict | PASS | S11/R09 | Uncommitted vs committed revision and stale snapshot |
| 51 | UNKNOWN security denies | PASS | A09 UNKNOWN | SECURITY_STATE_UNKNOWN primary reason |
| 52 | BLOCKED security denies | PASS | A09 BLOCKED | SECURITY_STATE_BLOCKED primary reason |
| 53 | ACTIVE_STOP denies | PASS | A09 ACTIVE_STOP | SECURITY_STOP_ACTIVE primary reason |
| 54 | Missing production authentication denies | PASS | H01/denied() helper | PRODUCTION_HOST_AUTHORITY_UNAVAILABLE; no authenticated principal |
| 55 | No launch intent created | PASS | H01/R11/R13/H10 | Read-only snapshots; no new event/intent |
| 56 | No grant consumption | PASS | H01/R08/R11/R13 | Grant rows unchanged; no consuming API called |
| 57 | No worker dispatch | PASS | R12 + guard + source scope | Process APIs blocked/spied; no dispatch import |
| 58 | No provider invocation | PASS | R12 + guard + source scope | Network/fetch blocked/spied; no provider wiring |
| 59 | No external output delivery | PASS | R12 + source scope | No output broker/delivery; fs/network effects absent inside operation |
| 60 | Every result executionAuthority:false | PASS | All new denied() checks; R13/R14; regressions | Frozen false decision; genuine fixture cannot alter it |

All 60 specifications are covered within offline scope. When FK integrity stops evaluation before a semantic relationship check (A05/A11/A12/R06), evidence establishes denial, not execution of an unreachable reason branch. No production migrator, real IdP/logout, trusted clock rollback witness or cross-process authentication was tested.

## Source evidence

| Source | Role |
| --- | --- |
| [host-session.ts](../../src/server/attempt-control/host-session.ts) | Strict schemas, private fixture issuer provenance, explicit unavailable production authority, binding/expiry comparisons. |
| [repository.ts](../../src/server/attempt-control/repository.ts) | #hostIssuer, issueHostContextForTest and assessSessionReadiness; private same-transaction canonical snapshot. |
| [schema.ts](../../src/server/attempt-control/schema.ts) | Fresh v8 application/execution association tables with guarded ownership/revision/revocation. |
| [execution-readiness.ts](../../src/server/attempt-control/execution-readiness.ts) | Unchanged PI02 security/lifecycle/current-owner default-deny evaluator. |
| [provenance.ts](../../src/server/attempt-control/provenance.ts) | Unchanged PI03 provenance/source/revision relationship evaluator. |
| [test-storage.ts](../../src/server/attempt-control/test-storage.ts) | Unchanged fixture boundary, atomic initializer, exact schema/digest/profile/integrity verifier. |
| [implementation report](M02-02_PI_04_HOST_CONTEXT_SESSION_BINDING_IMPLEMENTATION.md) | A–V source/host inventory, trust classification, limitations, tests and 25-challenge internal review. |

HTTP/bootstrap/web/workspace/state/runtime-security sources were inspected only, not modified or run. Existing HTTP session/CSRF capability, workspace issuance maps and synthetic context membership do not establish authenticated principal-to-execution-session binding. Grant.sessionId is reused as executionSessionId; no competing ID or raw HTTP token storage is introduced.

## Actual execution and evidence

Evidence root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi04-1794221377559-offline`.

Final run4 began **2026-11-09T11:11:30.3400000Z**; command completed **2026-11-09T11:12:01.6747311Z**, exit 0. **694 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT**, 12 explicit files: **72 new PI04** plus **622 fresh regressions**. Scoped final typecheck exit 0. Exact commands/timestamps are retained in result/preflight files and implementation O.

Regression counts: PI03 provenance 81; DAR/PI02 execution-readiness 36, persistence 37, contracts 27, pipeline 2, import 1; R5 execution-fence 100, R6 mock-enforcement 72, R7 fake-authority-adapter 84, R8 scoped-capability 91, R9 durable-mock-transaction 91. These are offline contract suites, not historical runtime/containment experiments.

Run1: 601 PASS, no failed assertions but one R9 setup suite failed because its new parent directory was absent; exit 1. Run2 and run3: each 693 PASS / 1 FAIL / 0 SKIP, exit 1, from the added A11 fixture's second issue under retained conflict custody. Final A11 tests redirected unknown-attempt integrity denial, A12 tests deleted application binding; no repository conflict rule was weakened. Run4 passes. All four scoped typechecks exit 0. Run2 typecheck's displayed command has doubled quotes; final actual command metadata is correct. Earlier diagnostics are retained verbatim.

| Artifact relative to evidence root | SHA-256 |
| --- | --- |
| `baseline.json` | `6BA34964AF12CDEF71A34F2B5AB54FCCA75EC025FE5F69AD811EE98B317C791E` |
| `tests-run1.json` | `79495F67BE13C5DDCA0B8BC4AD70855EAC70F6DC6A27FE7D67F0866D739F5481` |
| `tests-run2.json` | `E42F39C39D8709175B3043054D31ED200AACECFF44433B40577C0257146D4D48` |
| `tests-run3.json` | `8DC991AD0434708946914B065089CC8DF84F79173F2EE5DB4B3EC2F9A854DABB` |
| `tests-run4.json` | `73950498D18F61BF671EC5F04273048600F0D81925F5326A81E1622A4B62EF6A` |
| `tests-run4.preflight.json` | `38B7BFFE1A0AEFA6B04156A17022E33B89BA8ACB934C609C4B952E49DDD80A65` |
| `tests-run4.result.json` | `6A856BC90F5BF5717A1A6B713A5CA30E8A22F49A5305ED052340BEEA89FD6ED4` |
| `typecheck-run4.preflight.json` | `B8E3C2BAC785A721933C3FA04858D8C4814C309E2612F00D99BC332B578AB7CB` |
| `typecheck-run4.result.json` | `7A0D39E101A6119708D8BD4E5714B64F91FBF706E7A0AD017C56EBA76E516508` |
| `vitest-run4.config.mjs` | `A7A0B5AAEA76A76987617680F51163578CDF2BD8327C08A6FBAE789BA1955A85` |
| `fixture-setup-run4.ts` | `11C17052B3EE0C1AE096D020B9FD96CED654976206F2BBC725CF75C97698FAC7` |
| `offline-guard.cjs` | `06981DA58EB153EBBA8ADC04CEC5063EB42858451FA3CCD031114F6DD55D1954` |

fixture-root-runN-UUID.json records fresh per-file S15-prefix TEMP root descriptors. Database paths are those roots plus databaseToken. Fresh R9 roots for runs2/3/4 are recorded in tests-runN.preflight.json and implementation O; absent run1 parent was not reconstructed. manifest.json seals all new audit/fixture files except itself. final-snapshot.json and integrity-result.json record source/history equality. Manifest hash is returned outside this sealed report to avoid circular hashing.

The runner uses a single node test thread, required offline guard, explicit includes, fresh roots, envDir false and no plugins/global setup/server/HMR/watch/UI/cache/coverage. Main and thread guards block child-process spawn/fork/exec, sockets/listeners/DNS/TLS/datagram/fetch. No credential/provider/billing/entitlement service was accessed.

## Explicit NOT_RUN and production limits

| Boundary | Status | Reason |
| --- | --- | --- |
| durable-attempt-foundation/concurrency.test.ts | BLOCKED | NOT_RUN: transitive client-helper.launch forks; prohibited. |
| durable-attempt-foundation/lease.test.ts | BLOCKED | NOT_RUN: same child-process path. |
| durable-attempt-foundation/cancellation.test.ts | BLOCKED | NOT_RUN: same child-process path. |
| durable-attempt-foundation/recovery.test.ts | BLOCKED | NOT_RUN: same child-process path. |
| Production authenticated host adapter | BLOCKED | No verified authenticated subject source/mapping; PRODUCTION_HOST_AUTHORITY_UNAVAILABLE. |
| Durable/cross-process issuer continuity | BLOCKED | Private identity is realm/issuer-local; reopen rejects old handles/pins. |
| Production authorization/admission | BLOCKED | No consuming grant/intent/dispatch; every decision false. |
| Production migration | NOT_APPLICABLE | Fresh isolated fixtures only; no migrator or production DB execution. |
| Distributed atomicity / complete valid DB rollback witness | NOT_VERIFIED | One local read snapshot; revisions do not attest full external rollback. |
| Trusted clock / live revocation provider | NOT_VERIFIED | Explicit fixture atMs and persisted status only. |
| Windows MXC/Job/process/provider/output readiness | NOT_VERIFIED | No runtime probes/worker/provider/output operations performed. |
| Independent certification | NOT_VERIFIED | 25-challenge internal review only. |

Blocked suites are not reported as SKIP or PASS. Safe pipeline and helper-based repository lease/cancellation/recovery checks do not fork. No full application/server/watchdog/worker/containment command, dependency installation, production migration, cleanup, publication or Git mutation was executed.

## Historical carry-forward and owner state

| Item | Status / retained meaning | PI04 effect |
| --- | --- | --- |
| PI02-19 | PARTIAL | No promotion; session work is not production admission. |
| R8-20 | PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION | Original run1 JSON remains historically overwritten/unavailable; surviving evidence preserved. |
| SECURITY_STOP | SECURITY_STOP_PRESERVED | No clearance, relaxed state, permit or worker admission. |
| Option A | PENDING_OWNER_APPROVAL | NoAction/PreserveSecurityStop; no inferred storage/cleanup/execution approval. |
| D9 | NOT_AUTHORIZED | No execution action. |
| Evidence archival | PENDING_AUTHORIZATION | No archive/delete/cleanup; TEMP evidence retained. |
| Real workers | BLOCKED | No real or synthetic AI worker launched. |
| Historical Jc custody | NOT_OBSERVABLE | No process/Job query. |
| PID24956 provenance | INCONCLUSIVE | No historical process investigation. |
| Provider integration | NOT_VERIFIED | No provider requests. |
| Unavailable historical material | NOT_VERIFIED | 2209 files / 17 roots unavailable; no reconstruction. |

Baseline verified 501 AI Office files / 179 Git rows; final 505 / 183. Authorized delta: four modifications, four additions (module, test and exactly two reports), zero deletions. Other baseline files/user changes, 647 Hermes3D tracked hashes/path set and 3399 accessible historical files / 71 roots remain unchanged. Full comparisons and final tested-source rechecks are in integrity-result.json. No earlier milestone was retrospectively promoted.

## M02 acceptance and single next milestone

**OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE**. **M02_NOT_COMPLETE**. The roadmap draft/architecture decisions are not a verified final M02 acceptance/signoff checklist. Production authentication, authoritative security-stop mutation/history, production storage/authorization/containment/output integration, historical restrictions and owner decisions remain dependencies. No MXC success, cleanup completion, entitlement or production output readiness is claimed.

The single recommendation is **M02-02-PI-05 — Repository-Owned Security-Stop Activation CAS & Immutable Journal**: extend existing repository.ts/schema.ts with an activation-only BEGIN IMMEDIATE transition, expected securityRevision compare-and-swap, idempotent request digest/event identity and atomic immutable stop-event history. Proposed security-stop.ts and isolated security-stop.test.ts remain narrow; no clearance, dispatch, production migration or owner approval. This addresses an actual enforcement gap rather than adding another mock identity layer. It is recommended only; details in implementation V.
