# M02-02-CP02-R1 — Canonical Path Correction and Offline Verification

2026-11-13 · Asia/Jakarta · Bounded correction/verification; no production runtime implementation.

## A. Executive Decision

**CP02_OFFLINE_CONTAINMENT_BOUNDARY_VERIFIED**, limited to the existing denial boundaries and pure contract behavior. Final accepted execution: **33 focused CP02 tests +145 freshly rerun CP01 regressions =178 PASS /0 FAIL /0 SKIP /0 TODO**. Seven files ran separately under the reviewed guarded harness. Final scoped TypeScript7.0.2 check: **exit0**.

An earlier focused attempt returned32PASS/1FAIL because the new test supplied owner fields forbidden by the strict recovery-input schema. The schema correctly rejected them. Only that fixture was corrected, with an additional assertion retaining rejection of the original oversized expected object. Initial bytes, failed result and correction diff are preserved; the earlier32 passes are not counted twice. No production schema, guard or authority was changed.

This completes the bounded offline CP02 verification after the owner-authorized path correction. It does not verify native Windows/macOS containment, independently authenticated process ownership or positive runtime authority.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.**

## B. Canonical Repository and Path Verification

Git root: `/Users/rajenaria/Documents/Projects/AI-Projects`.

Application: `/Users/rajenaria/Documents/Projects/AI-Projects/AI-Office`.

HEAD remains **30db668ea3196e1b337cf41ef31de5c114e2cdfc**. At R1 start, the only untracked files were the historical CP02 blocked report and the canonical containment-safety test. All3,798 tracked baseline paths and SHA-256 values matched the pre-CP02 inventory; no subsequent tracked change needed an exception.

At R1 start, `AI-Office/tests/contracts/containment-safety.test.ts` existed with the exact requested SHA-256:

`c5fbb883811ad2a02deae0e132be6f2d7560f297d27e708d6f33f2e0b28ce6ce`.

`AI-Office/AI-Office/tests/contracts/containment-safety.test.ts` was absent. Its empty parent directories remained and were not deleted. The correction had already occurred before R1 inspection; R1 performed no file relocation and makes no claim to have independently observed the earlier move operation.

The fixture correction during verification changes the final canonical test hash to:

`fabd5e7a0de49775ebc0ff3f875f597ae4c0530afcd1466a004a12e9120de2b5`.

The original requested hash was verified before editing and its complete bytes archived in the new audit. This is a documented test-only correction after verification, not a claim that the final test still has the original hash.

## C. Historical Baseline Preservation

The [original CP02 blocked report](M02-02_CP_02_CROSS_PLATFORM_CONTAINMENT_SAFETY.md) remains byte-for-byte unchanged, including its historical CP02_SECURITY_BLOCKED/NOT_RUN statements. Its claims describe that earlier stopped checkpoint; this separate report records the continuation.

The [CP01 accepted report](M02-02_CP_01_CROSS_PLATFORM_RUNTIME_BOUNDARY.md), actual result JSON, command outcomes and evidence were read/verified. Its sealed manifest matched `bcc5891bcef05922b68c56cc3c85e60b9d24c1d82a81d6a650b50e9f02135426`; all101 inventoried evidence files matched. The original CP02 manifest also matched its recorded seal `ba5e23769d62a81fcf2e0f89ca0d266bb4a594d2e731b16931deda6887100870` and all inventoried bytes remained intact.

Historical CP01:145PASS, final scoped typecheck0,48 other files NOT_RUN. Historical MAC02:90PASS in five files. Historical Windows:1,295PASS, **not rerun**. R1's fresh145 regressions are new execution of the same six-file CP01 scope; they do not rewrite historical reports or promote Windows/native evidence.

## D. Source and Import Audit

The corrected test's conservative relative-import closure contains22 files. External imports are only existing `node:crypto`, Vitest and Zod. It imports the actual CP01 capability contract/host metadata adapter, PI09A admission, PI09B publication and pure attempt/readiness/recovery contracts.

Manual review found no test filesystem API, network API, subprocess call, listener, database construction, native containment API, host/supervisor import, application bootstrap or dynamic source import. Its attempt and recovery inputs are inert synthetic schema data. No fixture database helper or historical process suite is used.

The new file's33 cases cover18 actual admission negatives,9 capability/evidence cases,5 pure readiness/recovery cases and1 actual publication-boundary negative. A pure recovery helper call is not execution of the restricted recovery process suite. Literal positive-looking claims in adversarial inputs/dependency returns are deliberately untrusted and rejected; no trusted positive runtime context, capability, identity issuer or native custody authority is minted.

`test-import-audit.json` records the seven selected closures, hashes and external imports; `import-review-correction.json` records that the fixture correction added no imports or effects. The scan conservatively includes type-only imports; it is not an exhaustive call graph or hostile-code proof.

## E. Harness Suitability and Explicit Allowlist

R1 uses a new sibling copy of the reviewed CP01/MAC02 harness. Exactly one test file, `tests/contracts/containment-safety.test.ts`, was added to the existing six-file explicit selection in config, reporter and launcher. The review was recorded **before** amendment. There is no widened test-discovery glob, test-name filter, assertion removal or additional runner permission.

The MAC02 preload guard bytes, thread guard, setup validation and reviewed addon policy are unchanged. Original MAC02/CP01 harnesses, source copies and dependencies retain their captured hashes. No installation/package script/default npm test was used.

Vitest config remains explicit/native-loaded, Node environment, envDir:false, no application plugins/global setup/watch/UI/listening API/HMR/WS/cache, one isolated framework thread and one file per invocation. The reporter checks resolved config, actual selected file and absence of a listening HTTP server.

The launcher now records full source/config hashes before and after every command and returns failure on runner failure, timeout or source mismatch. This adds verification; it changes no application guard. Detailed amendment hashes and scope are in `harness-amendment.json`.

## F. Fresh Isolated Snapshot

Workspace prefix `W`:

`/Users/rajenaria/Documents/AI-Office-Mac-Dev/MAC-01-C1CBE95A-F050-463F-9F32-AA7B04E83E9B`

Fresh source copy: `W/cp02-r1-project`.

Fresh harness: `W/cp02-r1-offline-harness`.

The canonical src/tests trees, package/lock and tsconfig were copied afresh;144 source/test files were compared against the canonical application. Existing isolated node_modules is referenced without modifying/reinstalling it. No old cp01-project source is used as the intended current source snapshot.

Initial and corrected snapshots are recorded separately. The initial test bytes remain archived; only the reviewed fixture correction was synchronized into the new source copy before final tests/typecheck. Final per-command fingerprints match the final canonical source/config bytes. Every completed command reported sourceIntegrityMatched:true; all3,798 tracked files remain unchanged.

## G. Focused Test Failure and Bounded Correction

`run-31-r1-focused`: **32PASS/1FAIL/0SKIP**, exit1, no timeout, source-integrity match. The failing case was “unknown process evidence produces recovery quarantine and never authorizes retry.” It failed in `ReconcileSchema.parse`, before `classifyRecovery` was reached.

The fixture reused `ExpectedSchema`, which includes hostInstanceId/ownerId/ownerNonce. Actual `RecoveryExpectedSchema` deliberately permits only identity, attempt generation, state version and phase. Strict rejection of those extra owner fields was correct and exposed no unexpected source/security change.

Correction: explicitly project the permitted recovery expected fields; assert the original full owner-bearing object still throws; retain quarantine, dispatch:CLOSED, retryAuthorized:false and retry-requires-reconciliation assertions. No production schema was relaxed and no test was skipped. `fixture-correction.diff`, original full test bytes and `focused-fixture-diagnosis.json` retain the failure and rationale.

`run-40-r1-focused-corrected`: **33PASS/0FAIL/0SKIP**, exit0. Its before/after source hashes match. The corrected test passed its original negative-path intent with the source contract's real input shape.

## H. Fresh Regression Results

| File | Actual invocation | PASS | FAIL | SKIP | Exit |
|---|---|---:|---:|---:|---:|
| containment-safety.test.ts | run-40-r1-focused-corrected |33|0|0|0|
| runtime-platform.test.ts | run-41-r1-cp01 |55|0|0|0|
| policy.test.ts | run-42-r1-policy |12|0|0|0|
| project.test.ts | run-43-r1-project |34|0|0|0|
| knowledge.test.ts | run-44-r1-knowledge |26|0|0|0|
| capabilities.test.ts | run-45-r1-capabilities |17|0|0|0|
| durable-attempt-foundation/import.test.ts | run-46-r1-import |1|0|0|0|
| **Final accepted scope** | **33 focused +145 regressions** |**178**|**0**|**0**|**0 each**|

No final TODO, command timeout or source mismatch. All selected files ran in full, separately and sequentially. The earlier failed attempt is retained separately and is not summed into the final accepted total.48 other test files remain NOT_RUN; their unexecuted case count is unknown. No historical Windows test result is claimed as a fresh R1 execution.

## I. Exact Test Commands

`H` denotes the absolute harness directory in F. Exact expanded Node argv, clean environment, cwd, source/config/harness hashes and actual exits are retained in each command-preflight.json/command-result.json.

```sh
python3 "$H/run-command.py" run-30-r1-guard guard
python3 "$H/run-command.py" run-31-r1-focused cp02
python3 "$H/run-command.py" run-40-r1-focused-corrected cp02
python3 "$H/run-command.py" run-41-r1-cp01 cp01
python3 "$H/run-command.py" run-42-r1-policy policy
python3 "$H/run-command.py" run-43-r1-project project
python3 "$H/run-command.py" run-44-r1-knowledge knowledge
python3 "$H/run-command.py" run-45-r1-capabilities capabilities
python3 "$H/run-command.py" run-46-r1-import import
```

Guard probe exit0; the initial focused command exit1; corrected focused and all regression commands exit0. Numeric label order is not a chronological claim; retained timestamps and command records identify execution order. The compiler's initial label38 ran before the focused attempt, and final label47 after correction/regressions.

## J. Scoped Typecheck

Native compiler version **7.0.2**, SHA-256 `a82f731365ad69d5c4c15f5e18fba4584bf3b7b839960172a76c3462b5114bf2`.

Command, with `W` expanded in retained preflight:

```text
W/project/node_modules/@typescript/typescript-darwin-arm64/lib/tsc
-p W/cp02-r1-project/tsconfig.cp02-r1-offline.json --noEmit --incremental false
```

Initial `run-38-r1-typecheck`: exit0 for the initial test version. Final `run-47-r1-typecheck-final`: **exit0** for the corrected final test, empty stdout/stderr and matching before/after source hashes.

Scope includes src/contracts, src/server, src/demo and six selected contract test files, including containment-safety and runtime-platform. The foundation import regression is executed but is not included in this scoped compiler config. Web/e2e and full integration suites are not typechecked. Compiling backend definitions does not execute them or establish runtime safety.

## K. Effect Guard Evidence and Limits

Actual guard logs record Node **v24.22.3**. The dedicated probe validates100 patched effect entrypoints in the main runner and its permitted framework thread. During tests, runner/worker preload and worker setup validate the same guard. Native child-process permission is absent; filesystem permissions restrict allowed roots and fresh write directories. Hash-checked reviewed addons/framework threads remain necessary tooling allowances.

Across the seven accepted test commands,14 contexts validated100 entrypoints each. The earlier failed attempt's two contexts also had no unexpected effect event. Each parent observed its framework thread exit and recorded the actual process exit with zero unexpected blocks. A Vitest-terminated thread need not run a process-exit callback; only actual available records are credited.

No application subprocess/worker, network/DNS/provider request, HTTP listener, database open or native containment operation was attempted according to the reviewed imports and guard logs. The test runner/compiler processes and Vitest framework thread are development tools, not AI workers. Guards probe their already replaced denial functions; no original native effect is invoked merely to test a block.

Node warnings about allowed addons/framework threads are preserved. JS hooks/Node permissions are not a hostile same-realm/native sandbox or independent OS-wide observer. They do not prove Mac containment. API-token home lookup is confined to fresh private runner directories; token values/private runner-home files were not copied into evidence or used by an API listener.

## L. Actual Boundary Coverage

Executed actual PI09A `createExecutionAdmissionBoundary`, `api.admit`, owner-only `inspectDenial` and registered `requireExecutionAdmission` reject forged containment/custody/cleanup/Job/Sandbox claims, missing/unusable authentication, stale caller reports, lifecycle invalidation/cancellation and copied guards. Native metadata remains unverified and caller reports are not forwarded into trusted host detection.

Executed actual pure readiness checks reject UNKNOWN/BLOCKED/ACTIVE_STOP rows, missing security records and unsupported CLEARED state over synthetic in-memory fixtures. Actual pure recovery classification retains quarantine/closed dispatch/no retry on unknown process evidence. Actual PI09B rejects a CP01 observation as publication permission and does not invoke a forged publisher callback.

These are real source functions, not a disconnected mock adapter. Fixtures do not establish production principals, canonical database observations, real process ownership or native closure. No host composition, supervisor method, repository transaction, HELD writer/revalidation or transport was invoked. No production source modification was justified or made.

## M. Security Invariants and Historical Preservation

All3,798 tracked files retain their hashes and path set. All2,741 previously captured isolated source/harness/dependency files retain their hashes. Windows guards, identity/provenance/run contracts, stop/journals, supervisor/custody/crash behavior, schema/repository, publication/HELD/outbox and prior reports are unchanged. No security record was cleared and no user production database was read.

The old CP02 blocked report and both historical audit seals remain intact. Original nested parent directories are retained. No commit/push/reset/checkout, package installation or historical cleanup occurred.

**executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.** Platform target approval remains WINDOWS_AND_MACOS; deployment mode and identity D2–D5 are still pending. Fixture claims cannot substitute for those decisions.

## N. Changes in R1

| Canonical path | Disposition |
|---|---|
| tests/contracts/containment-safety.test.ts | Existing corrected-path file; only recovery fixture projection and strict extra-field rejection assertion changed after the initial failed test |
| docs/reviews/M02-02_CP_02_R1_CANONICAL_PATH_CORRECTION_OFFLINE_VERIFICATION.md | New separate completion report |
| docs/reviews/M02-02_CP_02_CROSS_PLATFORM_CONTAINMENT_SAFETY.md | Preserved historical blocked report, unchanged |

No tracked source/test/config/dependency/guard file changed. Outside Git, new source/harness/runtime/audit directories implement the authorized isolated verification. Initial source snapshot, original test, failure logs and final source/version fingerprints remain available.

## O. Persistent Evidence

Unique audit directory:

`/Users/rajenaria/Documents/AI-Office-Audits/M02-02-CP-02-R1-2026-11-13-01`

It retains baseline/path/hash/HEAD checks, historical seal verification, original isolated hashes, import/allowlist review, fresh initial/corrected snapshots, harness amendment, probe/test/compiler command preflights/results/stdout/stderr/config/guard logs, failure diagnosis/original test/correction diff, test summary, excluded files, final source/harness/report snapshots and preservation checks.

`manifest.json` inventories evidence hashes; `SHA256SUMS.txt` seals it after final capture. Recursive self-hashing is excluded explicitly. Private runner-home/token state is outside the audit and not copied. Local digests demonstrate compared byte consistency, not independent trust, rollback resistance or native containment certification.

## P. NOT_RUN and Unsupported Functionality

48 test files remain excluded and individually listed in excluded-tests.json. The historical concurrency/lease/cancellation/recovery process suites, native Windows Jobs/MXC/crash/watchdog experiments, Mac containment experiments, live HTTP/UI/E2E, provider and worker behavior remain NOT_RUN. The one pure recovery helper test does not change those suite statuses.

No independent identity/membership/current-run authority, protected native process scope, external monotonic witness, destination/classification authority, positive execution/publication/delivery or product completion is verified. Full native Windows/macOS runtime remains blocked/unverified as documented in CP01/CP02.

## Q. Future Native Acceptance Boundary

The original CP02 report's proposed shared invariants and separately authorizable native acceptance plan remain the design reference: named supported host/OS/architecture, exact enforcement implementation, independent observer, protected evidence custody, negative escape/resource/closure cases, recovery/cleanup guarantees and security-review approval before any native test.

R1 executes none of those experiments. It does not approve App Sandbox/XPC/EndpointSecurity/rlimit primitives as a complete solution, map POSIX groups to Jobs or reinterpret unresolved Windows custody as PASS. Native acceptance requires fresh platform-specific authorization/evidence.

## R. Remaining Owner and Product Decisions

The canonical-path blocker is resolved by the correction already present at R1 start. No further permission is needed for this completed offline slice. Identity D2–D5, deployment mode, native implementation/test hosts/effects and product acceptance remain separate unresolved decisions.

**M02_EXIT_CONTRACT_NOT_VERIFIED · M02_NOT_COMPLETE.** No positive authority, identity provisioning, native activation or final M02 sign-off follows from offline test success.

## S. Final Acceptance Decision

**CP02_OFFLINE_CONTAINMENT_BOUNDARY_VERIFIED** for the corrected canonical test and actual offline denial/pure-contract verification: final33 focused +145 regressions =178PASS,0FAIL,0SKIP; final scoped TypeScript exit0. Initial32PASS/1FAIL fixture result remains recorded and does not contribute duplicate passes.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.** No native runtime security or worker execution authority is claimed.
