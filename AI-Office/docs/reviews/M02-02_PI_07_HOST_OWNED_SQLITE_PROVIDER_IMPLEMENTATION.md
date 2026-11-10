# M02-02-PI-07 — Host-Owned SQLite Provider Implementation

## A. Executive Decision

**PI07_HOST_SQLITE_PROVIDER_IMPLEMENTED_OFFLINE_VERIFIED + SECURITY_STOP_PRESERVED. M02_NOT_COMPLETE.**

The existing listener-free host now supports an explicitly configured HOST_SQLITE provider without using the fixture factory as its storage implementation. CREATE_NEW initializes the unchanged canonical schema9 in a newly claimed store; OPEN_EXISTING requires a pinned storage identity and uses a genuinely read-only SQLite connection. The existing DurableAttemptRepository and PI06 lifecycle remain the sole repository implementation.

Final actual result: **947 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,15 test files: **97 new PI07 +850 freshly rerun regressions**. Scoped typecheck exit0. All execution/readiness results remain executionAuthority:false; no production deployment, authentication, worker admission, provider access or output publication is established.

## B. Historical Checkpoint

Continued PI06_HOST_WORKSPACE_COMPOSITION_IMPLEMENTED_OFFLINE_VERIFIED directly, without repeating CRASH/R1–R9 runtime experiments or PI01–PI06 implementation. Read the PI05 [implementation](M02-02_PI_05_SECURITY_STOP_ACTIVATION_JOURNAL_IMPLEMENTATION.md)/[matrix](M02-02_PI_05_SECURITY_GATE_MATRIX.md) and PI06 [implementation](M02-02_PI_06_HOST_WORKSPACE_REPOSITORY_COMPOSITION_IMPLEMENTATION.md)/[matrix](M02-02_PI_06_SECURITY_GATE_MATRIX.md). Verified PI06 sealed manifest SHA256 D377A7E00EB7C2B96954A16D84FF3D3FE79361382E18758860A72DA4C3560D5B and actual source/file inventory.

Carry forward PI02-19 PARTIAL, PI06-08 PARTIAL, four historical fork suites NOT_RUN, R8-20 PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION (overwritten original run1 JSON remains unavailable), and all earlier failure diagnostics. Older unavailable2209 files/17 roots remain NOT_VERIFIED. No process/Job/PID observation was refreshed.

## C. Repository Preflight

Actual pre-edit baseline **515 AI Office files /196 Git rows**, matching PI06 final checkpoint. Verified **11423 historical files /184 roots**: earlier7038/138 plus PI06 audit85files+manifest and4299 fixture files/45roots. Hermes3D647 tracked hashes and tracked path set match. No applicable ancestor/target AGENTS.md was found; Hermes3D instructions are outside the changed scope.

Inspected actual host/index composition, WorkspaceManager issuance/generation/revocation, ProjectRegistry identity/root keys, workspace paths/identity, repository constructors and openForTest usages, connection disposal, test fixtures, exact schema and transitive imports. Actual canonical constants are USER_VERSION9, PROFILE pi05-isolated-security-stop-v1, twelve tables; journal DELETE, synchronous EXTRA, FK ON, timeout100ms, trusted_schema OFF, read_uncommitted OFF. No schema/migration assumptions were inferred from earlier prose.

New audit root: `C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi07-1794240814074-offline`. baseline.json and scope.json record hashes and authorized paths. Preflight comparison attempts failed on manifest row ordering and Git -uall directory expansion (199 versus196), not established file changes. Corrections sorted rows and used the checkpoint's default Git representation; both diagnostics are retained. Protected verification later PASS. No skill, plugin, dependency installation or external service was needed.

## D. Source Changes

| Operation | Path | Purpose |
| --- | --- | --- |
| Modified | src/server/host.ts | Optional explicit hostSQLite composition; mutually exclusive fixture/provider config; no default path. |
| Modified | src/server/attempt-control/workspace-repositories.ts | Reuses lifecycle/facade with provider branch, canonical validation, host storage receipt, pre-adoption cleanup, concurrent reopen coalescing. |
| Modified | src/server/attempt-control/repository.ts | New opaque host-SQLite adoption method delegates to the same private constructor/validation; fixture constructor preserved. |
| Modified | src/server/attempt-control/test-storage.ts | Moves unchanged SQLite settings/format validation to shared module and re-exports compatibility symbols; fixture path/marker/initializer semantics retained. |
| Added | src/server/attempt-control/sqlite-format.ts | Shared settings and exact canonical schema validation; no fixture provenance or identity authority. |
| Added | src/server/attempt-control/host-sqlite.ts | Distinct non-fixture configuration, binding, initialization, pinned reopen and physical connection ownership. |
| Added | tests/integration/durable-attempt-foundation/host-sqlite.test.ts | 97 actual new integration cases. |

Exactly two new engineering reports: this report and [security matrix](M02-02_PI_07_SECURITY_GATE_MATRIX.md). Final scope **four baseline files modified/five added/zero removed**. Schema.ts, connection.ts, manager.ts, index.ts, PI03/04/05 contract modules, previous tests/reports, routes, .gitignore, dependency/config/UI/assets and worker/provider/output code remain unchanged from the checkpoint.

## E. Existing Storage Architecture

PI06 host.ts owns registry/manager/repository factory lifetime; actual index.ts already calls that composition. WorkspaceManager remains the sole issuer of current workspace bindings and foreground revocation. ProjectRegistry remains the sole project/root mapping. DurableAttemptRepository keeps all existing transactions, attempt/history/security/provenance/session/CAS/journal behavior.

PI06 fixtureRepositories remains explicitly LOCAL_TEST_FIXTURE and retains its marker-constrained adapter. The new provider does not call openForTest, createTestDatabase or openTestConnection. Shared SQLite format code has been extracted, not reimplemented as a second repository/security database. The separate demo project-state database is not merged or opened by this provider.

## F. Host-Owned Provider Design

HostWorkspaceRepositories.forHostSQLite constructs HostSQLiteProvider from host programmatic configuration and actual registry lookups. It delegates acquisition to the provider only after manager.inspect and current registry/root checks. The provider issues an opaque HOST_SQLITE token with private WeakMap membership; DurableAttemptRepository.openHostOwnedSQLite consumes it exactly once. Forged, serialized-equivalent labels and reused tokens cannot adopt a connection.

The factory returns the existing frozen inspection/readiness facade: inspectAttempt, three assess*Readiness methods, close, binding and resource metadata. No raw connection/repository, write, activation, clearance, issuer, grant or dispatch method is exposed. sourceClass HOST_SQLITE is storage origin, never principal provenance. The internal repository connection is readOnly:true and query_only=ON after initialization, further preventing writes even through trusted internal repository methods (I09 verifies actual SQLITE_READONLY primary8).

## G. Storage Configuration Trust Boundary

Strict configuration: providerKind HOST_SQLITE, lowercase canonical UUID providerId, explicit existing canonical storageRoot, and bounded per-project bindings containing projectId/workspaceRoot/storageId/authorityIncarnation plus discriminated initializationPolicy. CREATE_NEW accepts no existing identity; OPEN_EXISTING requires the complete expected storage identity. Unknown/extra fields, provider/policy types, duplicate project/store mappings, path aliases, overlap and unregistered project roots reject.

Parsing detaches caller objects before asynchronous use. Configuration is accepted only at trusted host construction, never through a new request/environment/route adapter. Ordinary repository requests retain strict ProjectOperationScope; added storageRoot/filename/policy/trusted/callback fields reject. No global path, fixture fallback or production default is installed. Missing config leaves repositories undefined; invalid config returns no usable handle.

This programmatic boundary assumes trusted host code/config provisioning. An interface, UUID, file marker, local transport token, workspace possession or object label is **not authentication**. Same-realm malicious JavaScript holding internal module objects is outside the request-data boundary. PRODUCTION_HOST_AUTHORITY_UNAVAILABLE remains explicit. No actual production config/root was supplied during PI07.

## H. Workspace and Project Isolation

Binding dimensions are composed rather than replaced: factory hostInstanceId; actual manager-issued workspace binding/generation; registry project/root/file key; providerId/storageId; authority incarnation; pinned root/directory/database/workspace keys; repository instance and resourceGeneration. No caller field can substitute for canonical registry identity.

Each acquire/reopen/operation validates the manager lease, configured project association, current workspace and storage keys/marker. Old handles close over revoked entries and cannot revive. Reattaching/restarting a manager issues a new binding; immutable prior attempt binding is not automatically adopted (S04). P04 uses one provider and separate A/B files; switching foreground revokes A. P06 acquires independent actual host/workspace owners concurrently. This preserves the current UI lease model, without inventing background workspace authorization or cross-process identity coordination.

storageIdentity(scope) is an internal host provisioning receipt with IDs/file keys and no filename/raw DB/principal/permit. It is returned only after current canonical scope/storage validation; OPEN_EXISTING must explicitly receive that expected identity from trusted configuration on a subsequent host construction.

## I. Database Path Security

The host chooses an existing canonical local Windows drive path. Existing ancestors are checked with lstat/realpath; known symlink/junction aliases and non-file/non-directory objects reject. Regular files require nlink1. Canonical path casing and lowercase storage UUIDs prevent the tested alias/collision cases. Storage and registry/project roots cannot overlap. Database filenames are fixed: storageRoot/storageId/authority.db, plus storage.json; request workspace IDs never become filenames.

CREATE_NEW exclusively claims the directory and file; unexpected files/directories are not overwritten. Reopen pins the root, directory, database and workspace file keys to expected host configuration; the exact bounded storage marker must agree. Every operation revalidates; ordinary replacement of DB/directory/storage root/project root, actual disposable Windows junction redirection, hard links and unexpected sidecars are rejected. Any -journal/-wal/-shm or other unexpected store entry requires separate recovery review; no hot-journal replay/removal is attempted. Paths are length-checked before new store creation.

**PI07-08 PARTIAL; historical PI06-08 remains PARTIAL.** Node path-based validation/open does not provide a race-free Windows handle-relative sandbox. Concurrent reparse/file substitution between checks/open, unusual reparse tags, mapped/remote volumes behind drive names, file-key reuse, ACL ownership/permissions and host-conflicting attackers are not certified. The observed supported envelope is these disposable Windows local-path fixtures with no concurrent hostile filesystem writer; lexical UNC/device/relative/traversal paths fail closed. A fully restored internally consistent older DB remains undetectable without an external monotonic witness. Markers and unkeyed hashes are not tamper-proof identity.

Actual OS EACCES/EROFS/CANTOPEN, disk IOERR/power loss, exotic filesystem providers and arbitrary reparse variants were NOT_VERIFIED. Tests exercise actual query-only READONLY and held-lock BUSY, guarded path failure, invalid SQLite/schema and injected driver-close errors; these are not relabeled as OS fault coverage or OS containment.

## J. Initialization Policy

CREATE_NEW runs only on newly authorized disposable locations in this execution. Exclusive mkdir and wx file creation refuse all existing/partial stores. A single BEGIN IMMEDIATE transaction creates the unchanged canonical schema, application/user version, metadata and default UNKNOWN/revision1/null-head security row. No principal/policy/grant/session/attempt/activation event or executable state is fabricated. COMMIT and format checks complete before writing an exclusive storage identity marker. The writer closes before opening the read-only repository connection.

afterSchema/afterSecurity/securityWrite fixed faults demonstrate rollback: no tables and user_version0, no valid marker/handle. Partial directories/files remain quarantined evidence; a later acquire requires explicit reopen and still refuses incomplete storage. There is no automatic cleanup-delete, repair, replacement, backfill or fresh fallback. A different trusted provisioning decision/new storage identity would be necessary; that is not done automatically. Close failure before repository adoption retains actual connection ownership until successful retry.

## K. Reopen and Schema Validation

OPEN_EXISTING requires explicitly supplied expected provider/store/project/incarnation/root/directory/database/workspace identity, not discovery/adoption of an arbitrary file. SQLite uses readOnly:true (no implicit creation) and query_only=ON; setting connection PRAGMAs does not change the persisted journal mode. A read transaction checks exact DDL, metadata/profile/digest/version, integrity/FKs and the canonical security record's supported version/incarnation when present. DurableAttemptRepository then performs its existing metadata/journal and all attempt-history checks.

Missing security state is allowed only as diagnostic storage, denied by the existing evaluator and never backfilled. Present malformed security state rejects at this provider boundary (S07). Exact-DDL-restored journal digest corruption rejects (S02). Unsupported version8, missing tables, wrong metadata/profile and non-SQLite bytes reject without migration or file-byte repair. Readiness on an already-open handle retains the existing fail-closed validators.

Schema9's historical pi05-isolated-security-stop-v1 format label and LOCAL_TEST_FIXTURE event/provenance restrictions are deliberately unchanged compatibility data, **not a claim that production provenance is supported**. Production activation/issuance/authentication is not enabled. There is no schema change or production migration.

## L. Connection Lifecycle

One host-owned cached connection per active project entry; operation leases are released in finally. Host close/invalidation revokes before draining pending opens/operations and disposing. Concurrent close coalesces; successful close is idempotent. Closed/failed entries require explicit reopen and current canonical ownership, with a new resource generation. No timers, polling, OS child processes or uncontrolled background workers were added.

Provider ownership begins immediately after DatabaseSync construction, including initialization/validation failures before token adoption. Physical close uses the captured database instance; successful close removes only the matching owned connection. Failed close retains the resource and factory lease; diagnostics include unadopted resources. Factory disposal retries provider cleanup even if repository construction never returned. Registry ownership is retained on unsuccessful host shutdown. L05/L10/L11 verify controlled pre-close, driver-method and pre-adoption persistent close faults; only successful explicit retry releases ownership.

## M. Concurrent Acquisition

PI06 pending-entry reservation/coalescing and AsyncLocalStorage self-reentrancy checks are retained. L01/L08 verify same-scope pending callers share one connection and awaited self-opening rejects without deadlock. Review found concurrent explicit reopen calls could race through entry replacement; a per-scope pending-reopen map now coalesces them. L09 verifies one replacement/handle/connection and no orphaned resource. P06 covers independent host/workspace concurrency. SQLite contention remains bounded, with no transaction-body automatic retries or execution permit.

## N. Failure Injection and Quarantine

| Failure | Actual evidence / result |
| --- | --- |
| Invalid/missing/unauthorized config/path | C03/C05–C08; no usable repository or implicit fallback; registry composition cleanup verified. |
| Existing file/partial store | I01/I02/I04; no overwrite, incomplete store retained. |
| Invalid DB/schema/open path | I07/I08/P01–P03/P07; no valid handle, migration, sidecar replay or false success. |
| Initialization error/READONLY | I02 transaction rollback; securityWrite actual SQL READONLY; I09 true read-only provider connection refuses repository writes. |
| SQLite BUSY | L07 actual BEGIN EXCLUSIVE on independent disposable connection; false STORAGE_UNAVAILABLE result, operation count returns0; retry remains deny-only. |
| Partial acquisition | L02 beforeOpen/afterOpen; no facade; owned connections disposed. |
| Close/driver-boundary failure | L05/L10/L11; quarantined resource/lease/registry lock, retry after fault removal closes; no healthy reuse. |
| Shutdown pending acquisition/operation | L03/L04 deterministic barriers; revoked completion, drained cleanup. |
| Generation invalidation | L06/P05; stale acquisition/reopen/handle rejected. |
| File/root/project/junction replacement | P01/P02; paths verified inside fresh root before mutation, originals retained. |
| Journal/security corruption | S02/S07; no backfill/promotion; tracked corruption refuses reopen. |

Injected driver-method exceptions are controlled adapter failures, not proof of actual SQLite internal close/OS I/O failures. No destructive test outside new owned roots; no process/crash/power-loss experiment.

## O. Security-Stop Preservation

UNKNOWN/BLOCKED/ACTIVE_STOP/missing security all deny on the real non-fixture path (S01). Invalid state/journal denies (S02/S07). No READY/CLEARED/FORCE_ADMIT/BYPASS_STOP or equivalent executable state/API exists. Facades cannot activate/clear stop; internal provider connections cannot write. Every execution decision retains false, and historical SECURITY_STOP custody is untouched.

S01–S04/S06 test compatible canonical attempt/provenance/session/security data using **explicit test-only injection**: a separately owned fixture repository creates synthetic history with the provider's configured project/incarnation and actual workspace binding; after all involved host/seed handles close, bytes are copied only into the already-new disposable target while retaining its file identity. Test-owned raw connections perform bounded corruption/provenance cases. This injection is not provider initialization, fixture fallback, production data loading or authentication. It is documented so a seeded fixture is not misreported as live production authority.

## P. Existing Repository Contract Compatibility

Same schema, metadata, security revision, CAS/transaction bodies, attempt epoch/history, principal/policy/grant provenance, canonical app/execution sessions, stop journal and idempotency rows are reused. No previous module/test expectation was weakened. S04 retains ACTIVE_STOP/revision2/events/operations across host reads and OPEN_EXISTING; append-only triggers reject mutation. PI05's93 cases freshly verify CAS/idempotency/atomicity on its separate writable fixtures; the new host provider intentionally exposes no mutation capability.

S06 uses valid provenance requests for missing principal/policy/grant and revoked policy; session evaluation reports SESSION_MISSING/forged-host denial with production host unavailable. Existing81 PI03 and72 PI04 tests rerun. A consistent local dataset does not authenticate a production issuer or repin old application/session authority.

## Q. Actual Test Execution Results

| Invocation | Actual result | Correction / meaning |
| --- | --- | --- |
| typecheck-run1/run2/run3/run4 | exit0 each | Final run4 corresponds to final tested source. |
| tests-run1 |838 PASS/8 FAIL,846 instantiated cases;2 top-level files failed | R9 setup refused malformed fresh root name; new tests had native raw-close double cleanup, protected-row corruption setup and missing security revision increment. All retained. |
| tests-run2 |938 PASS/1 FAIL,939 cases | R9 root format fixed; one metadata corruption setup needed FK OFF on its disposable raw connection. |
| tests-run3 |945 PASS/1 FAIL,946 cases | S07 found malformed present security row was only denied by repository evaluation, not rejected at provider open. Provider now checks the existing security contract at read-only opening; missing diagnostic state remains supported. |
| tests-run4 (final) |**947 PASS/0 FAIL/0 SKIP/0 TIMEOUT**,15 files,exit0 |97 new+850 rerun regressions, after supported path-length validation and all fixes. |

Run4 start UTC **2026-11-09T16:30:40.546Z**, command completion **2026-11-09T16:31:56.5443459Z**. Final typecheck exit0 at **2026-11-09T16:30:51.0784524Z**. Exact commands, cwd D:/Rajendra/AI-Projects/AI-Office:

```powershell
& 'D:/Rajendra/AI-Projects/AI-Office/node_modules/@typescript/typescript-win32-x64/lib/tsc.exe' -p 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi07-1794240814074-offline/tsconfig.json' --noEmit
node --require 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi07-1794240814074-offline/offline-guard.cjs' 'D:/Rajendra/AI-Projects/AI-Office/node_modules/vitest/vitest.mjs' run --config 'C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-pi07-1794240814074-offline/vitest-run4.config.mjs' --configLoader native --no-cache --no-fs-module-cache --no-file-parallelism
```

Every invocation has unique stdout/stderr/JSON/preflight/result/config/setup names; test preflights record source/test input hashes and R9 root. No test evidence was overwritten. Run4 preparation initially referenced an unavailable old run4 template; it stopped before creating test-run artifacts or running tests. Its diagnostic remains run4-preparation-failure.txt; corrected preparation read only the old run3 template. Other read-only command/parser/orchestration corrections caused no source/evidence mutation and are recorded separately in the audit execution notes.

Runner includes exactly15 safe files, no plugins/global setup/env loading/server/HMR/watch/API/UI/cache/coverage, node thread pool maxWorkers1/fileParallelism:false. Offline guard in coordinator/test threads blocks child-process APIs, sockets/listeners/DNS/TLS/datagrams/fetch. Test threads are test infrastructure, not AI workers. No npm full test/build/dev/startBackend execution.

Each test file receives a new S15-prefix owned TEMP root, recorded in fixture-root-runN-UUID.json; provider projects/registries/storage UUIDs/seed refs appear in evidence-pi07-provider-UUID.json beneath those roots. Each run uses a fresh R9 sibling directory; run1's rejected empty malformed-name directory remains preserved. Final R9 root:
C:/Users/USEP REZA USAMAH/AppData/Local/Temp/ai-office-r9-of-dt-4245036d-3b0e-43a1-850d-2981843843d4.
All roots/fixtures are retained and sealed, not archived/deleted.

| Artifact | SHA256 |
| --- | --- |
| baseline.json | FF6E975F32ADCAFD5E0618EEDCC4D0E67F993BF90C2E6D3843EA25D3CA06C7F1 |
| tests-run1.json | 787B534536B0306E5617CC92C759768CB01515B428ED432B7AEAF18930F1613A |
| tests-run2.json | 7365ED61289EEA4DD7FEDCD96F5D0447A951EB86C7BEE0BD77043357B0C6F433 |
| tests-run3.json | C9B1220AA6A46FCC1A41DF98C50FD564426BB77AC2E61D0A67C4AF5BB990607C |
| tests-run4.json | F17541672E9037F37FE5E0D8C0B219EA9CBCDE574517903E74E91D28BB5511DD |
| tests-run4.preflight.json | 0E6D797259F7C242497478EB7AADE66310EA07DCDF6077396739AAA7D1965497 |
| typecheck-run4.result.json | 47C62A2BF786C3621189C5076CB9313DE0A95C24D211AAEE91D8740CF011BA6B |
| offline-guard.cjs | 3E9D7A456EEE1F20F889138A9F617299323D2809FB54B5F941D558B6B6E833B0 |
| protected-integrity.json | 4EF99C821EF78056573B3864FF0955C2B19352BBFEB62DFF43FBD22D57529431 |

Manifest seals complete final source/report/audit/fixture hashes; its own SHA is returned outside the sealed reports to avoid circularity.

## R. Regression Results

| Final fresh suite | PASS |
| --- | --- |
| host-sqlite.test.ts (PI07 new) |97|
| host-composition.test.ts (PI06) |63|
| security-stop.test.ts (PI05) |93|
| host-session.test.ts (PI04) |72|
| provenance.test.ts (PI03) |81|
| execution-readiness.test.ts |36|
| persistence.test.ts |37|
| contracts.test.ts |27|
| pipeline.test.ts |2|
| import.test.ts |1|
| durable-mock-transaction.test.ts |91|
| execution-fence.test.ts |100|
| fake-authority-adapter.test.ts |84|
| mock-enforcement.test.ts |72|
| scoped-capability.test.ts |91|

850 prior cases actually rerun:63PI06+93PI05+72PI04+81PI03+103earlierDAR/PI02+438R5–R9. Counts refer to final invocation, never sums across runs. Four entire child-client suites concurrency.test.ts/lease.test.ts/cancellation.test.ts/recovery.test.ts remain NOT_RUN. HTTP/process suites/full application startup NOT_RUN. PI02-19 and PI06-08 stay PARTIAL.

## S. Production Storage Limitations

Only implementation and disposable-store verification are complete. No actual production database location/configuration, deployment, authorization, migration, credential or principal was selected/tested. Host config provisioning/receipt custody is not authenticated by these objects. Positive production provenance/session/activation contracts remain unavailable; on-disk fixture-era schema format has not been promoted to production authority.

Node filesystem race/ACL/volume/reparse limits, OS IO/crash failures and cross-process application ownership remain unverified. Partial/hot-journal stores require a separately authorized recovery/provisioning action; automatic repair is intentionally absent. EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED remains. Production worker admission, runtime-wide enforcement, provider entitlement and output broker remain unimplemented/blocked. The normal launcher installs no hostSQLite config/default path; existing composition can accept trusted explicit config, without new route/env wiring.

## T. Security Gate Matrix

[Security matrix](M02-02_PI_07_SECURITY_GATE_MATRIX.md): **23 PASS/1 PARTIAL (PI07-08)**. It maps all24 gates, HC01–12/SB01–10/LC01–15, all80 requested specifications, actual supported-model tests, NOT_VERIFIED scenarios and historical restrictions. Specification rows describe bounded observed behavior, not80 additional test counts or global OS certification.

## U. Adversarial Review

Separate internal self-review, not independent certification:

| # | Challenge | Evidence | Finding / fix / residual |
| --- | --- | --- | --- |
|1|Caller-controlled database paths|C06/C07|Strict scopes cannot configure storage; host config only.|
|2|Caller-controlled initialization policy|C03/C06|Per-binding discriminated host config; no request override.|
|3|Fixture fallback|C01/C09/I09|Distinct token provenance and explicit provider branch; spies show no fixture calls.|
|4|Workspace ID as authorization|C05/C08|Manager-issued canonical binding/generation required; UUID alone insufficient.|
|5|Cross-project acquisition|C08/P04/I05|Registry/project/workspace/storage identity must agree.|
|6|Workspace identifier reuse|P05/S04|Old facade revoked; old attempt binding not rewritten.|
|7|Storage-root escape|C03/P01|Local canonical root/file keys checked; no default root.|
|8|Junction/symlink redirection|P02/P07|Observed junction/hard-link reject; all OS reparse variants not certified.|
|9|Replacement after validation|P01|Ordinary replacement rejects on next validation; malicious concurrent swap remains residual.|
|10|TOCTOU open|Source path review|Node path-based open remains a race; PI07-08 and historical PI06-08 PARTIAL.|
|11|Unexpected DB overwrite|I01/I04|Exclusive directory/file creation; collisions/partial stores retained.|
|12|Invalid schema acceptance|I07|Exact existing shared format validation; no fallback.|
|13|Legacy silent upgrade|I07 version|Reject version8 without bytes changing; no migration.|
|14|Connection ownership confusion|I09/L10/L11|Single-transfer token, captured DB close, provider tracks pre-adoption resources. Review fixed partial-close ownership gap.|
|15|Double close|L01|Coalesced/idempotent cleanup.|
|16|Stale handles|P05/L06|Revocation persists through explicit reopen.|
|17|Failed cleanup reused as healthy|L05/L10/L11|Quarantined entry/connection/registry ownership retained until retry.|
|18|SQLite BUSY succeeds|L07|Actual lock returns storage denial; no retry-as-permit.|
|19|Stop ignored on reopen|S01/S04|All states deny; stop revision/journal unchanged.|
|20|Journal bypass|S02/S04|Existing validator/triggers unchanged; corruption rejected.|
|21|Raw connection exposed|C01/S05/I09|Facade exact read surface. Internal module consumers are trusted same-realm code, not a JS sandbox.|
|22|Activation facade exposed|C01/S05|No activation/clearance method; internal provider repository is read-only.|
|23|HTTP import listener|S05/import regression|Imports safe under listener guard; live HTTP startup NOT_RUN.|
|24|Worker dispatch activated|S05/offline guard|No dispatch surface/process calls.|
|25|Provider client initialized|S05/source closure|No AI provider client path; network blocked.|
|26|Production authentication inferred|C01/S06/source|HOST_SQLITE denotes storage origin only; schema profile/UUID/marker/transport possession are not identity authority.|
|27|Real DB accessed|Fixture records/preflight|Every run points only at fresh owned TEMP stores; no production path exercised.|
|28|Historical evidence overwritten|Protected/final integrity|11423 files/184 roots and old diagnostic failures match. Run1–3/new preparation failures preserved.|
|29|PARTIAL promoted|Matrix carry-forward|PI02-19/PI06-08 remain PARTIAL; four process suites NOT_RUN.|
|30|M02 prematurely complete|This report W|No final acceptance/owner authority; M02_NOT_COMPLETE.|

Review corrections include concurrent reopen coalescing, tracked pre-adoption physical resources, captured-instance close ownership, malformed present security validation, explicit path-length checking and stronger failure/provenance cases. All final source changes were followed by the final passing15-file run and scoped typecheck. No prior successful test was weakened to hide a defect.

## V. Source Integrity

Final inventory **520 AI Office files /201 Git rows**, compared with515/196 baseline. Four modified baseline files, five additions (two source modules, one test, exactly two reports), zero removals. All196 pre-existing status rows and every other baseline source/user hash/path/reparse inventory retained. No Git commit/push/reset/clean/merge/publication/deployment.

Protected-integrity PASS at2026-11-09T16:34:02.7987771Z:11423 historical files/184roots and647 Hermes3D tracked files/path set unchanged. Final snapshot/input verification repeats scope/hash checks after report creation and confirms final tested source/test hashes. Historical manifests/reports/diagnostics are never rewritten. Snapshot traversal records reparse points without following them; node_modules/.git excluded from source inventory. New evidence is sealed in place, not archived. Final manifest excludes itself; read-only post-seal verification is required and its external SHA closes the evidence chain.

## W. M02 Completion Status

**M02_NOT_COMPLETE. OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE. SECURITY_STOP_PRESERVED.** Provider implementation and disposable tests are within PI07; production deployment/identity authority/admission/output/containment/final acceptance are not complete. No final authoritative M02 signoff or completion checkpoint is created.

Real workers BLOCKED; Option A PENDING_OWNER_APPROVAL (NoAction/PreserveSecurityStop), D9 NOT_AUTHORIZED, evidence archival PENDING_AUTHORIZATION, Jc NOT_OBSERVABLE, PID24956 INCONCLUSIVE, provider/entitlement runtime NOT_VERIFIED. No owner approval inferred and no historical incident/OS containment/MXC success claimed.

## X. Recommended Next Implementation Milestone

Exactly one: **PI08 — Authenticated Host/Principal Trust-Root Integration, Deny-Only.** Actual blocker: repository host-session.ts still creates only private fixture issuers and provenance.ts recognizes fixture consistency rather than an authenticated production principal; host.ts supplies no independently authenticated source. Storage ownership cannot resolve that dependency.

Implement the explicit trusted host/principal issuer composition boundary against a separately provisioned authoritative source, with canonical application/execution-session association, revision/expiry/revocation and fail-closed unavailability. Keep storage facade read-only and unavailable-source decisions false; do not infer identity from the local HTTP bootstrap token/config labels or silently repin prior sessions. Definition of Done: actual host composition receives independently established identity evidence through that boundary and tests substitution/revocation/reopen/default-deny without workers/providers/clearance/publication. If no authoritative source is provisioned, preserve the production-authentication blocker rather than inventing another mock claim. Production admission/output remain downstream and disabled. PI08 is recommended only, not executed here.

