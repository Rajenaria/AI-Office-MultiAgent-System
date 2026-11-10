# M02-02-PI-03 — Principal, Policy & Grant Provenance Implementation

## A. Executive Decision

**PI03_PROVENANCE_CONTRACT_IMPLEMENTED_OFFLINE_VERIFIED + SECURITY_STOP_PRESERVED. M02_NOT_COMPLETE.**

Repository-owned principal/policy/grant records, relationship validation, revision/expiry/revocation checks and same-transaction reads implemented in the actual DurableAttemptRepository. No standalone fake-authority owner was added. All results remain eligible:false/executionAuthority:false; production principal authenticity is always PRODUCTION_PRINCIPAL_UNVERIFIED.

Final fresh verification: **622 PASS /0 failed /0 skipped /0 timeout, 11 files; scoped typecheck exit0**. This consists of81 new PI-03 cases and541 freshly repeated regressions, not the historical541 counted as new without running. PI03 gates22 PASS in this bounded offline scope; prior **PI02-19 remains PARTIAL**. No historical gate or production authorization is promoted.

## B. Historical Checkpoint

Read PI-01 [integration report](M02-02_PI_01_DURABLE_ATTEMPT_INTEGRATION_READINESS.md), [exit matrix](M02-02_PI_01_MILESTONE_EXIT_AND_SECURITY_GATE_MATRIX.md), PI-02 [implementation](M02-02_PI_02_REPOSITORY_EXECUTION_READINESS_IMPLEMENTATION.md) and [gate matrix](M02-02_PI_02_SECURITY_GATE_MATRIX.md). Actual source/checkpoint verified before edits: schema6, six PI-02 implementation/test files,497 files,175 Git entries, historical541 PASS/typecheck0 and21 PASS/1 PARTIAL.

PI-02 manifest SHA-256 E8089840E6512A7CD63CDFED9E2219C78C5E5EA1A4188C87B0595AAF612F4BFC and its802 listed audit/fixture files verified without opening its databases. Historical source hashes remain time-of-checkpoint evidence; PI-03 explicitly changes three of those source/test files with new tested hashes rather than rewriting the old manifest/reports.

R8-20 remains **PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION**. Original overwritten diagnostic JSON is not reconstructed. No CRASH/containment/process investigation repeated. Option A = No Action / Preserve Security Stop: PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; workers BLOCKED; Jc NOT_OBSERVABLE; PID24956 INCONCLUSIVE; archive PENDING_AUTHORIZATION. Latest historical runtime observation remains2026-11-09T06:29:44.7514982+07:00.

## C. Repository Baseline

Before source edits: actual **497 AI Office files /175 existing Git entries**. Available protected history now **2,253 files/46 roots**: prior1,450/22 plus PI-02's803 files/24 roots including self-excluded manifest. Hermes647 tracked files and tracked path set retained. Older unavailable2,209/17 historical roots remain NOT_VERIFIED. No applicable AGENTS.md found in target/ancestors.

Read actual repository factory, contracts, fixture schema/versioning, private transactions, PI-02 readiness, journal/history, lease/cancellation/recovery, fixture helpers, composition/scripts and transitive test imports. Current architecture has no real principal/session/issuer/grant authentication or production repository constructor. Existing host ownerId/nonce possession is not human authentication.

New unique audit root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi03-1794218423502-offline`. baseline.json stores exact baseline inventory/hashes; scope.json documents the concrete bounded source plan. Inventory excludes .git/node_modules and never follows reparse points; reparse metadata is compared. Production credentials/databases were not opened.

## D. Source Changes

Actual footprint **five source/test files**; no count-driven additions:

| Operation | File | Final tested SHA-256 |
| --- | --- | --- |
| MODIFIED | `src/server/attempt-control/repository.ts` | `1EDC0D625C5B54ED1113BF9F9DC8036F772E9EEC833316042BBB0287768BCF1A` |
| MODIFIED | `src/server/attempt-control/schema.ts` | `CF91A9DA4832C31049FBB4DD6111DA27565C0637AE129DFF1D89D34D65A7D330` |
| MODIFIED | `tests/integration/durable-attempt-foundation/execution-readiness.test.ts` | `4562D3B188DDB4C34303419FDF61933169213F1856A2734539F45FA3E0492841` |
| ADDED | `src/server/attempt-control/provenance.ts` | `5D007C7449993A75087CB36623F372874B00D4D82D5E654F511D0FD1C3729F55` |
| ADDED | `tests/integration/durable-attempt-foundation/provenance.test.ts` | `775FF2576B320F2D8CBC8C75EBA3A8543729E4A96C1C52D5E70E1F7122043ADD` |

Necessary PI-02 compatibility changes are limited to repository.ts (imports plus complementary method), schema.ts (fresh version/profile and additive tables/guards), and one exact table-list assertion in execution-readiness.test.ts (five tables →eight). That assertion still proves no launch/acceptance table appears. PI-02 assessExecutionReadiness and execution-readiness.ts behavior/contract are unchanged. test-storage.ts already transactionally initializes imported schema and supplies fixed faults; it did not need editing. PI-02 persistence.test.ts also unchanged.

Exactly two new reports are added. No changes to production HTTP/WS/provider/dispatcher, other domain contracts, .gitignore, package/dependencies/config, R5–R9, old reports/evidence or unrelated user files.

## E. Principal Provenance Contract

PrincipalProvenanceSchema uses existing UUID/reference/safe-number utilities and strict unknown-field rejection. Fields: principalId, principalKind HUMAN/SYSTEM, projectId, authorityIncarnation, recordVersion, revision, sourceId/sourceRevision/sourceClass, status, validFromMs/expiresAtMs.

Missing row, UNKNOWN status, revoked state, expiry equality/past, not-yet-effective evidence, unsupported source, malformed metadata, stale principal/source revision or wrong project/incarnation all deny. Principal-to-grant equality is checked independently of successful ID lookup. A copied UUID or internally consistent row never authenticates a caller.

There is no verified-at assertion claiming an identity-provider check, credentials column, login/authentication endpoint or principal issuance API. The constant principalAuthenticity is PRODUCTION_PRINCIPAL_UNVERIFIED even for malformed input/storage failure.

## F. Policy Provenance Contract

PolicyProvenanceSchema adds policyId, revision, positive numeric policyVersion, exact action, canonical taskId and destinationId to the common provenance envelope. Fixture policy format version1 is the only internally recognized version; this is not an approved production policy.

Missing/UNKNOWN/revoked/expired/not-effective/unsupported issuer, stale revision/version and scope mismatch produce explicit diagnostics. SQL prohibits revision rollback, sourceRevision rollback, and policyVersion downgrade. Direct caller policy objects are rejected by the request schema. There is no permissive default or ALLOW_ALL policy/factory.

Both policy and grant are still unverified claims for production. Policy consistency cannot remove the existing UNKNOWN/BLOCKED/ACTIVE_STOP denial or clear historical SECURITY_STOP.

## G. Grant Provenance Contract

GrantProvenanceSchema stores grantId, authorizationRevision, principalId/principalRevision, policyId/policyRevision/policyVersion, project/incarnation, sessionId, attemptId/attemptGeneration, action, taskId, destinationId and common provenance/window/status fields.

Checks bind the selected principal/policy, their current revisions/version, actual attempt/project/incarnation/generation/task, and requested session/action/destination. A grant cannot outlive or begin before its principal/policy validity windows. Authorization revision is distinct from attempt stateVersion, generation and source revision.

This is persisted provenance metadata, not a cryptographic capability or real permission. There is no public grant issuance/consumption API and no executable launch intent. Test SQL inserts explicitly labeled fixture claims solely to exercise repository reads.

## H. Identity and Scope Binding

Existing Expected remains the canonical attempt/owner/CAS expectation. New request IDs select repository-owned rows and are checked as expectations; none is authentication. Principal ID is not equated to the synthetic host ownerId. Request cannot replace source metadata with principal/policy/grant objects, a TRUSTED flag, credentials or callbacks.

SessionId is an opaque expected reference compared to the stored grant binding. The actual repository has no authenticated execution-session registry; PI-03 does not fabricate one. Task matches canonical Attempt.taskId; destination/action compare both policy and grant scope. Destination/session/action consistency does not authenticate external output routing or tool permission.

Cross-project/incarnation FKs prevent normal invalid inserts; verifySchema foreign_key_check rejects relationships corrupted by privileged fixture tampering. R12 reuses the same attempt UUID in a fresh project/incarnation database and proves old rows cannot be inherited.

## I. Authority Source Classification

Allowed classifications: UNVERIFIED, LOCAL_TEST_FIXTURE, PRODUCTION_AUTHORITY_UNAVAILABLE, REVOKED, INVALID. All deny production authority. SQL defaults are UNKNOWN/UNVERIFIED with sourceId unavailable; fresh authority initialization creates no principal/policy/grant rows.

For internal consistency only, recognized fixture sourceId is pi03-fixture-source-v1 and class LOCAL_TEST_FIXTURE; all three source revisions must equal the requested expected revision. This recognizable label/counter is not a secret, signature, issuer attestation or trust root. Raw SQL fixture ownership can create matching claims; those remain unverified production identity.

A complete internally consistent set reports FIXTURE_PROVENANCE_CONSISTENT; otherwise PROVENANCE_DENIED. This status describes provenance relationships independently of eligibility. It may remain consistent while the canonical attempt is canceled or SECURITY_STOP active; the separate readiness decision is still false.

## J. Repository Readiness Integration

New complementary method:
`assessProvenanceReadiness(input: unknown): ProvenanceDecision`.

Strict request extends the PI-02 request with principal/policy/grant IDs, expected principal/policy/auth/source revisions, policyVersion, sessionId, action, destinationId and atMs. Request data is parsed/copied before entering the transaction; malformed/getter-throwing input returns structured INVALID_REQUEST.

Within the transaction: validate current fixture schema/meta; enforce connection project/incarnation; load canonical attempt and verify journal/epochs; read security row; run unchanged PI-02 evaluator; load selected principal/policy/grant rows; evaluate relationships and construct frozen result. No nested public readiness transaction.

Output retains PI-02 primary reason and observed canonical security/attempt snapshot, adds immutable provenanceReasons/provenanceStatus and constant principalAuthenticity. reasons always also includes PRODUCTION_PRINCIPAL_UNVERIFIED and PRODUCTION_AUTHORITY_UNAVAILABLE. PI-02 PRINCIPAL_UNAVAILABLE/GRANT_UNAVAILABLE blockers continue to mean unavailable authoritative production proof, even when fixture rows exist.

Missing attempt/scope errors and schema/storage/integrity failures return sanitized false decisions. No raw SQL error, path or credential content appears in a receipt.

## K. Transaction Consistency

All canonical attempt/security/provenance reads run on the existing private repository READ transaction connection. First meta read acquires the snapshot; verifySchema, verifyHistory and related SQL queries use that same snapshot. The evaluator performs no await, external callback, provider lookup, side effect or live R6–R9 authority query.

X02 uses two independent repository readers while a third SQLite connection holds uncommitted grant revocation: both see the prior internally consistent fixture snapshot, always false; after writer COMMIT both see revoked metadata and deny. X03 exclusive lock returns STORAGE_UNAVAILABLE, then retry remains false after rollback. X01 policy revision change invalidates old grant references even if caller updates its expected policy revision.

This establishes bounded same-file snapshot semantics, not parallel worker-process admission, distributed atomicity or current external issuer/revocation truth. Synchronous method bodies do not overlap in one thread. No result is a reusable permit after COMMIT.

## L. Schema Compatibility

New persisted normalized tables justify **SQLite user_version7** and **pi03-isolated-provenance-v1**. Meta schemaRevision1, recordVersion1 and fixture policyVersion1 are separate version domains. Three tables: runtime_principal_provenance, runtime_policy_provenance, runtime_grant_provenance.

Composite project/incarnation FKs bind principal/policy to the authority and grant to both selected entities; grant also references the canonical attempt. Guards require entity revision+1 (authorizationRevision for grant), immutable ownership/source labels and grant bindings, no source-version rollback, no policy-version downgrade, irreversible REVOKED status and no deletion.

Existing schema.ts is a fresh fixture definition, not a numbered migration-history file. Only additive provenance tables/triggers plus explicit new profile/version/digest were added; existing attempt/epoch/event/security contracts remain. No migration runner was introduced and no historical migration file rewritten.

createTestDatabase already creates all imported DDL/meta/security in its existing transaction, defaulting execution security UNKNOWN and provenance absence. R05 creates a v6-shaped new isolated fixture lacking provenance tables and proves repeated open fails without changing bytes/attempt data. It is not an in-place migration success or a historical v6 database opened for validation. R06 unsupported version and R09 invalid persisted metadata deny. Existing initializer rollback tests are freshly repeated against schema7. Production migration execution remains absent.

## M. Revocation and Expiry

Every row's current status/window is checked during the repository transaction. Unknown, revoked, future-effective or expired-at-equality evidence denies. Grant window must fit both parents. R07 actually updates each entity to REVOKED, rejects UPDATE-to-ACTIVE/delete, closes/reopens and observes persisted revocation.

atMs is an explicitly supplied deterministic **fixture observation**, not a trusted production clock. Backdating supplied time cannot grant execution because all results remain false; real freshness needs an authenticated host/clock boundary. sourceRevision is also a local expectation/counter, not external revocation verification.

X04 injects actual SQLITE_READONLY primary8 during a fixture grant insert after principal/policy inserts; rollback removes all preceding partial claim writes. This is a raw isolated fixture setup transaction, not a production repository grant writer. X05 exercises actual repository lifecycle-validation failure/rollback and verifies no claim consumption/change. Existing initializer/phase/terminal/fence fault cases remain passing.

No new OS crash, power loss, driver IOERR or rollback-engine failure was tested. Full restoration of a valid older database is not detectable from local counters/hashes alone. Current-row guards are not a cryptographic audit trail or external anti-rollback witness.

## N. Actual Test Execution Results

| Invocation | Receipt timestamp UTC | Exit | Result |
| --- | --- | --- | --- |
| PI03-typecheck-run1 | 2026-11-09T10:08:09.2920011Z | 0 | Scoped noEmit PASS |
| PI03-tests-run1 | 2026-11-09T10:08:53.9154991Z | 0 | 620 PASS,79 PI-03 +541 regression,0 failed/skipped/timeout |
| PI03-typecheck-run2 | 2026-11-09T10:10:19.2203081Z | 0 | Final scoped noEmit PASS |
| PI03-tests-run2 | 2026-11-09T10:11:39.0708120Z | 0 | **622 PASS**,81 PI-03 +541 regression,0 failed/skipped/timeout; duration22.42s |

Second run follows source review correcting wrong-task diagnostic classification and adding R11/R12. No assertion failure occurred in either run; the diagnostic finding came from source inspection. Run1 and run2 artifacts, fixture roots and logs are separate and retained. Counts are final unique Vitest cases, not loop/assertion/specification counts or totals added across reruns.

Exact final commands, workdir D:/Rajendra/AI-Projects/AI-Office:

```powershell
& 'D:/Rajendra/AI-Projects/AI-Office/node_modules/@typescript/typescript-win32-x64/lib/tsc.exe' -p 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi03-1794218423502-offline/tsconfig.json' --noEmit
node --require 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi03-1794218423502-offline/offline-guard.cjs' 'D:/Rajendra/AI-Projects/AI-Office/node_modules/vitest/vitest.mjs' run --config 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi03-1794218423502-offline/vitest-run2.config.mjs' --configLoader native --no-cache --no-fs-module-cache --no-file-parallelism
```

Run1 test command differs only by vitest-run1.config.mjs; full command/timestamp/exit is stored for every invocation in respective *.result.json. Pre-invocation input hashes: tests-run{1,2}.preflight.json and typecheck-run{1,2}.preflight.json. Output paths: tests-run{1,2}.json plus tests-run{1,2}.stdout.log/.stderr.log; typecheck-run{1,2}.stdout.log/.stderr.log. No failed assertion, skip or timeout is hidden.

| Final suite | PASS |
| --- | --- |
| durable-mock-transaction.test.ts | 91 |
| execution-fence.test.ts | 100 |
| fake-authority-adapter.test.ts | 84 |
| mock-enforcement.test.ts | 72 |
| scoped-capability.test.ts | 91 |
| contracts.test.ts | 27 |
| execution-readiness.test.ts | 36 |
| import.test.ts | 1 |
| persistence.test.ts | 37 |
| pipeline.test.ts | 2 |
| provenance.test.ts | 81 |
| Total | **622** |

Runner preflight inspects actual imports/helpers/bootstrap scripts; only11 allowlisted files run. No npm test/dev/global application setup. envDir:false, explicit tsconfig, no application plugins, no HTTP/WS/HMR/listening server, node environment, thread pool maxWorkers1, watch/API/UI/cache/coverage disabled. Local Vitest threads are test infrastructure, not AI workers. Preload guard on coordinator and thread blocks child-process spawn/fork/exec, sockets/listen/DNS/TLS/dgram and fetch before side effects. Native compiler directly invoked, no dependency installation.

Every test database is fresh marker-verified TEMP storage. Setup writes only process-local AI_OFFICE_S12_ROOT fixture ref, never production env/config. Across runs,22 new S15-prefix roots/337 authority.db files retained; two new R9-shape sibling roots required by unchanged R9 path guard each hold88 mock.db/177 files. Roots: C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-r9-of-dt-f187ce85-a267-4879-aead-28c8e4897031 and C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-r9-of-dt-70eab485-d0e2-4f21-8cb4-c2b74249537c. New S15 roots mapped in unique fixture-root-run*.json; no cleanup/archive.

Relevant hashes relative to the audit root:

| Artifact | SHA-256 |
| --- | --- |
| baseline.json | `1C553D17BD5B25A04ADCF9C3C083F1F0F3CB137668371FA8D02BFF4EBA695E9B` |
| scope.json | `30E13D9CC26B0CB85A0C025EFEDE3A9D917F7E4A3D729F4770C7722BC9646729` |
| tests-run1.json | `8FD6E888A3FA1DEEF0400672B6F2C7CB1A6B78ED9739300C414FC10E6511E7C0` |
| tests-run2.json | `BC35CF9927CC9A9E55B9683FB248BA4574BAF67C77243B95936F3C0C267615F0` |
| tests-run2.preflight.json | `2108C76A8469B834C70F7C2DA16E14C2361D172E3B167C654B892188091737F9` |
| typecheck-run2.preflight.json | `30E7550855BB5808F02218822BF5FCF74E7CD3A48FFACBFB40989E81DDDDAE48` |
| tests-run2.result.json | `F81A2943DCBE3D79839DD731D4E1AB04FF131074C25828EA9BF1B29B4A81CDCC` |
| typecheck-run2.result.json | `F07EB50F59ABB3CD716F4027C9DE5FA97B024B829F9AE6B3F944718FC54E1115` |
| offline-guard.cjs | `79BC089D77C6DC34D2906D10E291B0FDC6BF92169993A64D531FD7D4FEB2924D` |
| vitest-run2.config.mjs | `28670890F855B0C3CDA2764206B61D5801A0E7AEAEB5E9A6C5BC62FA1D1F0553` |

Final final-snapshot.json/integrity-result.json/manifest.json record repository/evidence integrity; manifest self-excludes its own bytes and hashes new fixtures without reopening DBs.

## O. Regression Results

**541 prior cases freshly executed again**, including R5=100, R6=72, R7=84, R8=91, R9=91 (total438), PI-02 readiness36/persistence13 and prior repository54. No R5–R9 code/test changes or live fake-authority import in production repository. PI-02 pure evaluator/schema security defaults preserved.

The exact PI-02 T01 table-name expectation is extended for three new provenance tables; no runtime authorization assertion weakened. Remaining PI-02 six-file changes are precisely documented in D. Other PI-02 files and reports/evidence preserved.

Four suites remain **NOT_RUN as whole files**: concurrency.test.ts, lease.test.ts, cancellation.test.ts, recovery.test.ts under tests/integration/durable-attempt-foundation. Their client-helper.launch forks processes; not authorized in PI-03. They are not counted as skipped/pass cases. **PI02-19 PARTIAL is carried forward unchanged**, notwithstanding fresh passing safe regressions.

## P. Security Gate Matrix

[PI-03 Security Gate Matrix](M02-02_PI_03_SECURITY_GATE_MATRIX.md) maps all22 PI03 gates, PR-01–12, PO-01–12, GR-01–16, PT-01–10 and60 requested test specifications to actual evidence. All22 new gates PASS within offline deny-only scope; none clears the prior PI02-19 PARTIAL or any production/historical runtime gate.

## Q. Remaining Production Authority Gaps

No production trust root/authenticated principal issuer, verified policy source, trusted clock/revocation witness, authenticated execution-session registry or real grant issuance/consumption boundary. Fixture source labels and raw local SQL ownership are not authentication.

No production authority storage factory/in-place migrator, host composition/caller integration, accepted-operation coordinator, output broker/outbox, provider credential/entitlement/billing verification, real worker dispatch or externally verified containment/custody. Cross-store/OS/provider atomicity is unverified; current-row SQLite guards cannot prove externally current permissions or detect complete valid DB rollback.

A production activation request would require its own trust-source, containment, owner/runtime/provider and acceptance approvals. PI-03 supplies data consistency groundwork only.

## R. Adversarial Review

Internal self-review by the implementing agent, not independent certification:

| Challenge | Finding / evidence |
| --- | --- |
| 1 Caller-forged principal metadata | X06 strict rejection and unchanged snapshot. |
| 2 Row mistaken for authentication | P00/P04 remain PRODUCTION_PRINCIPAL_UNVERIFIED despite complete/copyable rows. |
| 3 Fake authority treated as IdP | No R6–R9 owner imports; fixture source label is explicitly unauthenticated. |
| 4 Unverified policy trusted | O01/P02, production authority always unavailable. |
| 5 Scope escalation | G01/G03–G06 policy/principal/task/destination/session/FK checks. |
| 6 Stale auth revision | G01 authorization revision and X01 parent revisions. |
| 7 Policy rollback | O03 revision/source/version guards; whole valid DB restore remains unwitnessed. |
| 8 Cross-project confusion | P06/G03/R03 root/FK/row bindings. |
| 9 Cross-session confusion | G01 stored grant vs expected session, no session authentication claimed. |
| 10 Run/incarnation reuse | R10 plus real fresh-authority reuse R12. |
| 11 Expired evidence | P03/O01/G01 expiry equality, future windows and parent-window containment. |
| 12 Revoked grant restored on reopen | R07 persisted statuses, irreversible update/delete guards. |
| 13 UNKNOWN becomes READY | SQL defaults P02 and unchanged PI-02 security enum; no positive branch. |
| 14 SECURITY_STOP bypass | R01/R02 primary PI-02 security reason always retained. |
| 15 Incorrect transaction consistency | Same private connection/READ transaction, X01–X03; no cross-process/issuer claim. |
| 16 Migration defects | R05/R06 old/unsupported rejection without writes; no production migrator exists. |
| 17 Production dispatch connected | Exact source scope and X08/X09/import regression/guard; no production wiring. |
| 18 Tests claimed as runtime proof | Only SQLite/thread test infrastructure; runtime NOT_PERFORMED. |
| 19 Evidence overwritten | Unique per-run preflight/result/log/config/root paths; historical2253 hashes checked. |
| 20 Prior PARTIAL promoted | PI02-19 still PARTIAL; all four fork suites NOT_RUN. |
| 21 M02 criteria invented | Official final PRD/sign-off not found; OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE. |
| 22 Owner approval inferred | Option A pending, D9 not authorized; source request is not runtime permission. |

Actual implementation finding resolved before final run: using current(...caller taskId) would label a wrong task as persisted corruption. New method now loads canonical attempt independently, verifies history, and lets the PI-02 identity evaluator classify the mismatch; R11 proves IDENTITY_MISMATCH without mutation. R12 also strengthens reused UUID/incarnation coverage.

Remaining limits: source/clock/session values are fixture claims or expectations; arbitrary same-realm caller code is not sandboxed by TypeScript/Zod; local storage admin can replace an entire valid DB. No signature/IdP verification, immutable provenance event journal or positive execution permit is implemented.

## S. Source Integrity

Actual final **501 AI Office files /179 Git status entries**:3 baseline files modified,4 additions (module/test/two reports), zero removed. All175 existing Git rows preserved; every unrelated baseline file/path/hash retained, including .gitignore, R5–R9, PI-01/PI-02 reports, PI-02 test-storage/execution-readiness/persistence and Hermes647 tracked hashes/path set.

Protected history2,253 files/46 roots retains hashes/path/reparse metadata. Tested final source inputs match tests-run2/typecheck-run2 preflight. scope.json describes necessary compatibility changes; final inventories/results and manifest provide exact byte hashes. No source publication/reset/clean, dependency install, production mutation, process query, Job manipulation, archival or deployment.

No previous source hash is rewritten to pretend PI-03 code was tested by PI-02. Historical manifests remain unchanged; current changed code has new PI-03 evidence.

## T. M02 Completion Status

**OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE. M02_NOT_COMPLETE. SECURITY_STOP_PRESERVED.**

PI-03 advances the repository provenance/consistency implementation prerequisite. It does not establish a production principal, policy authority, grant issuance, worker admission, broker, MXC/containment result, provider authorization, historical cleanup or any unresolved official M02 runtime criterion. Existing roadmap/design still carries draft/pending sign-off labels; no final approved milestone definition or new sign-off was located in inspected source.

Option A PENDING_OWNER_APPROVAL, D9 NOT_AUTHORIZED, workers BLOCKED, Jc NOT_OBSERVABLE, PID24956 INCONCLUSIVE and archive PENDING_AUTHORIZATION remain unchanged.

## U. Recommended Next Engineering Milestone

Exactly one: **M02-02-PI-04 — Disabled trusted-host context and canonical execution-session binding for DurableAttemptRepository.** Implement the actual host-to-repository command boundary with persisted session/principal/issuer bindings and a private context constructor that refuses unverified provenance. Specify an approved authentication/trust source first; never derive trust from fixture labels, UI-supplied IDs or owner nonce alone. Keep executionAuthority:false and dispatch disabled. This targets the missing authenticated host/session integration, not another standalone mock authority.
