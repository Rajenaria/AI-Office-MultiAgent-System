# M02-02-PI-03 — Security Gate Matrix

## 1. Decision, checkpoint and evidence

**PI03_PROVENANCE_CONTRACT_IMPLEMENTED_OFFLINE_VERIFIED + SECURITY_STOP_PRESERVED. M02_NOT_COMPLETE.**
[Implementation report](M02-02_PI_03_PRINCIPAL_POLICY_GRANT_PROVENANCE_IMPLEMENTATION.md) documents exact source/schema/API/transaction and evidence commands/hashes.

Baseline497 files/175 Git entries, SQLite fixture6, PI-02 historical541 PASS/typecheck0 and21 PASS/1 PARTIAL verified before implementation. Final schema7 is required by three new persisted provenance tables. Final source footprint3 modifications +2 source/test additions +2 reports; no production path changed.

Audit root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi03-1794218423502-offline`.
Fresh final PI03-tests-run2: **622 PASS**,81 new PI-03 +541 repeated safe regressions;11 files,0 failed/skipped/timeout, exit0. Final typecheck-run2 exit0. Run1 had620 PASS (79 new cases), no failures; source review then corrected wrong-task diagnostics and added R11/R12. Each invocation has unique preflight/result/log/config/fixture paths; no old evidence overwritten.

Deny-only results always include PRODUCTION_PRINCIPAL_UNVERIFIED and unavailable production authority. FIXTURE_PROVENANCE_CONSISTENT means relationships among stored fixture claims agree, not authentication, policy approval, grant issuance or executable authorization.

## 2. PI-03 gates

| Gate | Requirement | Result | Concrete evidence / bounded meaning |
| --- | --- | --- | --- |
| PI03-01 | PI-02 checkpoint verified | PASS | Baseline497/175, prior source/evidence manifest and historical541 verified before edits; report B/C. |
| PI03-02 | Repository contract inspected | PASS | Actual openForTest/private transaction, schema6, readiness/history/lease/cancel/recovery/import closure inspected. |
| PI03-03 | Principal provenance implemented | PASS | PrincipalProvenanceSchema, persisted table, repository reads; P00–P06/R07/R08/R09. |
| PI03-04 | Policy provenance implemented | PASS | PolicyProvenanceSchema/table/current version/revision/scope; O01–O04/X01. |
| PI03-05 | Grant provenance implemented | PASS | GrantProvenanceSchema/table/FKs/current bindings; G01–G06. No production issuance API. |
| PI03-06 | Identity bindings validated | PASS | P05/P06/G03–G06/R03/R10–R12; session is expected stored binding, not authenticated login. |
| PI03-07 | Policy/grant revisions validated | PASS | O01/O03/G01/X01 current revisions and grant-parent revision/version relationships. |
| PI03-08 | Revocation and expiry enforced | PASS | P03/O01/G01/R07 status/window checks, equality expiry and irreversible local revocation. Fixture atMs only. |
| PI03-09 | Task/destination scope validated | PASS | O01/G01 exact action/task/destination, canonical Attempt.taskId; R11 wrong caller task. |
| PI03-10 | Default-deny preserved | PASS | R01/R02/P00/X09 plus freshly repeated PI-02 tests; every result false. |
| PI03-11 | Transaction consistency established | PASS | Private repository readTransaction, schema/history/all records one connection/snapshot; X01–X03 bounded real SQLite interleaving. Not external issuer/distributed consistency. |
| PI03-12 | Legacy/unsupported denied | PASS | R05 v6-shaped fixture repeated rejection without byte changes; R06/R09 unsupported schema/corruption. |
| PI03-13 | Recovery/reopen verified | PASS | R07 all three revoked entities persist after normal reopen; existing PI-02 reopen/pipeline regressions PASS. No crash/power-loss proof. |
| PI03-14 | Negative tests executed | PASS | New provenance.test.ts81 PASS;60 specifications mapped below, no declaration/count inflation. |
| PI03-15 | Relevant regressions evaluated | PASS |541 safe prior cases freshly PASS; scope excludes four prohibited fork suites and retains their uncertainty. |
| PI03-16 | No production authority created | PASS | SourceClass labels are claims; principalAuthenticity always PRODUCTION_PRINCIPAL_UNVERIFIED; no verifier/issuer/production factory. |
| PI03-17 | No dispatch/provider wiring | PASS | Exact source changes only, X08/X09/import regression/preload guard; production routes/adapters unchanged. |
| PI03-18 | No real execution authority | PASS | Literal false flags, no positive readiness state or reusable token; frozen receipts X09. |
| PI03-19 | Source integrity preserved | PASS | Exactly3 baseline modifications/4 additions/0 deletions, all175 pre-existing Git entries and unrelated hashes preserved; final tested-input hashes match. |
| PI03-20 | Historical security preserved | PASS |2,253 protected historical files/46 roots unchanged; SECURITY_STOP and R8-20/owner restrictions retained. |
| PI03-21 | Prior PI-02 PARTIAL retained | PASS | PI02-19 explicitly still PARTIAL; four child-process suites NOT_RUN, no historical gate promotion. |
| PI03-22 | M02 truthfully assessed | PASS | OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE /M02_NOT_COMPLETE; no new approved PRD/sign-off invented. |

**22 PASS applies only to these offline implementation gates.** Prior PI02-19 PARTIAL, runtime BLOCKED and production-authority gaps are unchanged. A PASS for carrying an unresolved restriction is not clearance of that restriction.

## 3. Principal invariants

| Invariant | Enforced contract / actual evidence |
| --- | --- |
| PR-01 | Missing row: P01/P04, PRINCIPAL_MISSING. |
| PR-02 | UNKNOWN row/source: P02/P03; unknown requested ID P04. |
| PR-03 | Principal vs grant/request binding: P05/G04; no host ownerId-to-human identity inference. |
| PR-04 | Project/incarnation FK and row checks: P06/G03/R03/R12. |
| PR-05 | Revoked status/source denies: P03/R07. |
| PR-06 | Expiry equality/past/future-effective rejects: P03; fixture atMs is not authenticated production time. |
| PR-07 | Unsupported source label/issuer denies: P03; recognizable fixture source still unverified production identity. |
| PR-08 | Strict record metadata: R08 malformed reference/R09 corrupt version/TRUSTED enum. |
| PR-09 | Caller cannot overwrite provenance: X06 strict extra-field rejection and snapshot equality. |
| PR-10 | Copied ID/request never authenticates: P04/P00, principalAuthenticity remains unverified. |
| PR-11 | Internally consistent synthetic rows remain insufficient: P00/R01/X09. |
| PR-12 | Every receipt false including errors: shared denied assertions, literal ProvenanceDecision construction, X07/X10. |

## 4. Policy invariants

| Invariant | Enforced contract / actual evidence |
| --- | --- |
| PO-01 | Missing row: O02/P01. |
| PO-02 | Unsupported/unknown policy version: O01; expected version mismatch O02. |
| PO-03 | Unsupported issuer/source: O01; no production resolver. |
| PO-04 | Expired/not-effective policy: O01 including expiry equality. |
| PO-05 | Revoked policy: O01/R07 after reopen. |
| PO-06 | Current policy revision: O01/X01; updating caller expectation cannot repair stale grant reference. |
| PO-07 | Project FK/common binding plus exact action/task/destination: O01/G03/R03. |
| PO-08 | Caller policy objects rejected: X06, no writer API. |
| PO-09 | Revision/source/version rollback rejected by SQL: O03; full valid-file rollback remains unwitnessed. |
| PO-10 | Local policy never production authorization: P00/R01 and constant production authority blockers. |
| PO-11 | Active stop remains primary denial despite consistent policy: R01; no consistency-to-eligibility promotion. |
| PO-12 | No clearance API/state: unchanged PI-02 security model/S07 regression, R01/X09. |

## 5. Grant invariants

| Invariant | Enforced contract / actual evidence |
| --- | --- |
| GR-01 | Missing grant: G02/P01. |
| GR-02 | Unknown grant ID/status: G02/G01. |
| GR-03 | Revoked grant/current source: G01/R07/X02. |
| GR-04 | Expiry/current window and parent-window containment: G01. |
| GR-05 | Principal ID/revision relationship: G04/P05/G01; successful FK alone is insufficient. |
| GR-06 | Policy ID/revision/version relationship: G05/O04/G01. |
| GR-07 | Project/incarnation FKs plus stored session binding: G03/G01/R03. |
| GR-08 | Canonical attempt FK and row binding: G03/G06/R03/R12. |
| GR-09 | Incarnation/root binding: G03/R10/R12; no old-record inheritance. |
| GR-10 | Attempt generation vs grant epoch: G01; existing PI-02 fencing regression also repeated. |
| GR-11 | Exact requested action vs policy/grant: G01/O01. |
| GR-12 | Task equals canonical Attempt.taskId: G01/O01/R11. |
| GR-13 | Destination equals policy/grant expected scope: G01/O01. |
| GR-14 | Current authorization revision and parent/source revisions: G01/X01. |
| GR-15 | Fixture claim never production authority: P00 and immutable false receipt construction/X09. |
| GR-16 | No launch intent/tool/provider/output permission: X08/X09 and PI-02 exact eight-table expectation, no acceptance table/API. |

Session is an opaque expected value, not a current authenticated session record. Destination consistency is not proof of an authorized external destination. These remain production integration blockers.

## 6. Provenance transaction invariants

| Invariant | Enforced behavior / actual evidence |
| --- | --- |
| PT-01 | Attempt/security/principal/policy/grant/history read on existing repository snapshot: X02/source; no nested public call. |
| PT-02 | Missing referenced rows deny: P01/O02/G02; normal FK violation prevented G03 and corrupted relationship rejected G06. |
| PT-03 | Expected/current and parent revision mismatch: P03/O01/G01/X01. |
| PT-04 | Conflicting ownership/scope: P05/P06/G03–G06/R03/R11/R12. |
| PT-05 | Evaluation creates no intent: X05/X09 snapshots, existing PI-02 T01 expanded only for three provenance tables. |
| PT-06 | No grant consumption: read-only API and X09 grant rows unchanged; no consumed/usage counter invented. |
| PT-07 | Concurrent metadata change cannot authorize: X02 uncommitted/committed revocation always false, X03 lock denial. |
| PT-08 | Reopen never restores revoked permission: R07 irreversible status/update/delete guards. |
| PT-09 | Fixture COMMIT has no external permission: X08 guarded no IO; no production broker or provider integration. |
| PT-10 | All results executionAuthority:false: literal type/runtime result plus shared assertions and frozen receipt X09. |

Same-process independent SQLite handles exercise lock/snapshot behavior. No simultaneous subprocess method bodies, live IdP/source revocation, distributed transaction, OS side-effect rollback or power-loss guarantee is claimed.

## 7. Requested negative test specifications 1–60

VERIFIED refers to actual appropriate bounded assertions/source-integrity evidence, not60 separate invented cases. New test file has81 actual Vitest cases, with parameterization for distinct entity contracts, scopes, constraints and failure modes.

| Spec | Actual evidence | Result / scope |
| --- | --- | --- |
| 1 Missing principal | P01 | VERIFIED |
| 2 Unknown principal | P03 UNKNOWN status/P04 unknown ID | VERIFIED |
| 3 Wrong principal | P05/G04 | VERIFIED |
| 4 Cross-project principal | P06 FK rejection and corrupted row denial | VERIFIED |
| 5 Revoked principal | P03/R07 | VERIFIED |
| 6 Expired provenance | P03 expiry equality | VERIFIED with fixture observation time |
| 7 Invalid authority source | P03 unsupported issuer/source | VERIFIED |
| 8 Spoofed principal metadata | X06/R09 | VERIFIED strict request and persisted invalid-class handling |
| 9 Missing policy | P01/O02 | VERIFIED |
| 10 Unknown policy | O01/O02 | VERIFIED |
| 11 Stale policy version | O02 expected mismatch/O01 unsupported version | VERIFIED |
| 12 Revoked policy | O01/R07 | VERIFIED |
| 13 Expired policy | O01 | VERIFIED |
| 14 Policy scope mismatch | O01 task/action/destination | VERIFIED |
| 15 Unsupported policy source | O01 | VERIFIED |
| 16 Policy rollback | O03 actual SQL UPDATE rejection | VERIFIED; not external full-file restore detection |
| 17 Missing grant | G02/P01 | VERIFIED |
| 18 Unknown grant | G02 unknown ID/G01 UNKNOWN status | VERIFIED |
| 19 Revoked grant | G01/R07/X02 | VERIFIED |
| 20 Expired grant | G01 | VERIFIED |
| 21 Wrong principal binding | G04/P05 | VERIFIED |
| 22 Wrong policy binding | G05/O04 | VERIFIED |
| 23 Wrong project/session | G03/R03 and G01 session | VERIFIED; session binding check is not authentication |
| 24 Wrong attempt | G03/G06/R03 | VERIFIED normal FK and corrupted relationship fail-closed |
| 25 Wrong incarnation | G03/R10/R12 | VERIFIED |
| 26 Stale execution epoch | G01 grant generation mismatch | VERIFIED; prior fencing tests also freshly repeated |
| 27 Stale authorization revision | G01 | VERIFIED |
| 28 Unauthorized action | G01/O01 | VERIFIED exact record scopes |
| 29 Wrong task | G01/O01/R11 | VERIFIED canonical task and caller diagnostic |
| 30 Wrong destination | G01/O01 | VERIFIED |
| 31 Missing security row | R02 | VERIFIED |
| 32 UNKNOWN security | R01/P00 | VERIFIED |
| 33 BLOCKED security | R01 | VERIFIED |
| 34 ACTIVE_STOP | R01 | VERIFIED |
| 35 Canceled attempt | R04 noLaunch retains APPROVAL_GRANTED | VERIFIED |
| 36 Terminal attempt | R04 | VERIFIED |
| 37 Legacy fixture | R05 v6-shaped isolated rejection | VERIFIED denial; no in-place migration |
| 38 Unsupported schema | R06/R09 | VERIFIED |
| 39 Corrupt relationship | G06 restores exact DDL guard then FK check denies | VERIFIED |
| 40 Reopen preserves denial | R07 all three revoked entities; PI-02 reopen regressions | VERIFIED normal close/reopen only |
| 41 Principal revocation before evaluation | R07 principal update/reopen and P03 | VERIFIED |
| 42 Policy revision before evaluation | X01 actual current revision update | VERIFIED |
| 43 Grant revocation before evaluation | X02 committed revocation/R07 | VERIFIED |
| 44 Competing repository transactions | X02 independent readers under writer; X03 exclusive lock | VERIFIED bounded same-process interleaving, no process concurrency claim |
| 45 Storage read failure | X03 real SQLite busy read/X10 closed repository | VERIFIED; no hardware IOERR injection |
| 46 Storage write failure | X04 actual SQLITE_READONLY during grant fixture INSERT | VERIFIED rollback of preceding fixture writes; not production grant-writer proof |
| 47 Rollback after validation | X05 existing repository transition fails validation inside transaction | VERIFIED no attempt/provenance changes |
| 48 Inconsistent source revision | P03/O01/G01 | VERIFIED record vs expected source revisions |
| 49 Caller replaces provenance | X06 | VERIFIED strict rejection without writes |
| 50 Reused attempt ID/new incarnation | R10/R12 fresh authority and FK/no inheritance | VERIFIED |
| 51 No worker | X08/import regression and preload subprocess guard | VERIFIED scoped run |
| 52 No provider | X08/fetch guard, no provider imports | VERIFIED |
| 53 No network | X08 and socket/listen/DNS/TLS/dgram/fetch guard | VERIFIED scoped runner |
| 54 No real credentials | X08 no file read/open during assessment; fixture-only import/data paths, envDir:false | VERIFIED no real credential store read |
| 55 No production migration | Fixture-only factory/path guards and R05; source scope | VERIFIED no production DB opened/migrator executed |
| 56 No actual grant issuance | X09 no issuer API; source pure evaluator/read-only repository queries | VERIFIED test SQL creates fixture claims only |
| 57 No stop clearance | R01/X09, unchanged security guard and PI-02 regressions | VERIFIED |
| 58 No executable intent | X09/PI-02 T01/source scope | VERIFIED |
| 59 Every decision false | Literal result constructor/shared denied assertions including errors | VERIFIED |
| 60 PI-02 denials preserved | Fresh PI-02 readiness/persistence and other selected regressions | VERIFIED bounded safe cases; prior PARTIAL unchanged |

No whole-suite process-excluded cases are counted as passing or skipped. No new migration runner exists, so legacy coverage proves rejection/byte retention, not a successful production upgrade. Actual principal/policy/grant authentication remains unavailable.

## 8. PI-02 PARTIAL carry-forward and prohibited suites

**PI02-19 remains PARTIAL.** The following files remain NOT_RUN:

- tests/integration/durable-attempt-foundation/concurrency.test.ts
- tests/integration/durable-attempt-foundation/lease.test.ts
- tests/integration/durable-attempt-foundation/cancellation.test.ts
- tests/integration/durable-attempt-foundation/recovery.test.ts

They import client-helper.ts, whose launch function calls node:child_process.fork. PI-03 explicitly excludes these clients. Safe pipeline/new tests exercise affected metadata paths without spawning processes; that does not establish complete original cross-process compatibility or promote the old gate.

PI03-15 PASS means relevant authorized regressions were evaluated and these exclusions recorded. PI03-21 PASS means the old restriction was preserved, not resolved.

## 9. Production blockers, owner status and acceptance dependencies

| Dependency | Status / implication |
| --- | --- |
| Production principal trust root and issuer authentication | UNAVAILABLE /PRODUCTION_PRINCIPAL_UNVERIFIED |
| Approved authoritative policy source and current source revision | UNAVAILABLE; local fixture labels/counters are not proof |
| Authenticated host/session and trusted time source | NOT_IMPLEMENTED; expected session/atMs remain fixture claims |
| Real grant issuance/consumption and current revocation witness | NOT_IMPLEMENTED; no executable grant |
| Production authority DB factory/in-place migration | NOT_IMPLEMENTED; openForTest remains only factory |
| Accepted-operation coordinator/output broker/dispatch | NOT_IMPLEMENTED /BLOCKED |
| Provider credential/entitlement/billing verification | NOT_VERIFIED; no network/account access |
| Cross-store/physical atomicity and whole-DB anti-rollback witness | NOT_VERIFIED |
| Process concurrency/abrupt crash/power loss | NOT_RUN in PI-03 |
| Historical Jc/PID24956 | NOT_OBSERVABLE /INCONCLUSIVE; no new queries |
| Option A — No Action / Preserve Security Stop | PENDING_OWNER_APPROVAL |
| Runtime disposition D9 | NOT_AUTHORIZED |
| Evidence archive | PENDING_AUTHORIZATION; no archive/cleanup |
| Historical/security operator decision | SECURITY_STOP_PRESERVED; no promotion/clearance |
| Official final M02 PRD/acceptance sign-off | Not located; OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE |
| Overall M02 | M02_NOT_COMPLETE |

Exactly one next milestone: **PI-04 — Disabled trusted-host context and canonical execution-session binding for DurableAttemptRepository**. Define an approved trust source, implement private host-context construction and persisted session/principal/issuer bindings at the existing repository boundary, rejecting unverified input. Keep executionAuthority:false/no dispatch. This advances the missing actual host integration rather than adding a separate fake-authority system.

## 10. Source/evidence integrity and historical exception

Final inventory501 files/179 Git entries, compared to497/175 baseline. Modified exactly repository.ts, schema.ts and PI-02 execution-readiness.test.ts table-set expectation. Added provenance.ts, provenance.test.ts and exactly two PI-03 reports. No deletions; all pre-existing Git changes retained. test-storage.ts, PI-02 pure readiness module and persistence tests unchanged.

All other original AI Office files and Hermes647 tracked hashes/path set preserved. Protected history2,253 files/46 roots unchanged, including complete available PI-02 audit/fixtures and all old reports. Older unavailable2,209/17 remain NOT_VERIFIED. New final tested source hashes match preflight; final-snapshot.json/integrity-result.json/manifest.json record actual comparisons.

**R8-20 remains PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION.** No original overwritten R8 JSON is reconstructed, relabeled complete or substituted by PI-03 evidence. Historical manifests are immutable checkpoint evidence, not claims that current PI-03 source still equals old tested bytes.

No workers/app servers/watchdogs/Jobs/PID/native experiments, no credential/provider/network service, no production route/storage/migration change, no package install, no Git commit/push/reset/merge/clean/deploy, no automatic Option A approval or archive action. Internal review in implementation report R is not independent certification.
