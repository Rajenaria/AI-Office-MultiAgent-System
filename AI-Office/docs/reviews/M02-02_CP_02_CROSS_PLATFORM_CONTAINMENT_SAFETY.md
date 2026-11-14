# M02-02-CP02 — Cross-Platform Containment Safety

2026-11-13 · Asia/Jakarta · Offline inspection; canonical-path STOP condition encountered before testing.

## A. Executive Decision

**CP02_SECURITY_BLOCKED.** CP01 was verified in the canonical application and its retained evidence matched. During subsequent CP02 test authoring, the coding agent accidentally added the new test under `AI-Office/AI-Office/tests/contracts/containment-safety.test.ts`. This nested directory did not exist at initial verification. It was introduced by the CP02 patch, not by CP01.

Implementation and test execution stopped immediately when the mistake was recognized, following the owner's section2 instruction. No file was moved, overwritten or deleted to conceal/correct the discrepancy automatically. The intended canonical test does not exist. The misplaced test is unexecuted and is not accepted implementation evidence.

All **3,798 baseline tracked files remain byte-identical**, including production source, CP01 tests/report and prior security reports. No CP02 test, compiler, harness or native experiment was run. This report records the verified baseline, inspection findings, proposed requirements and exact blocker; it does not declare the requested offline milestone complete.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.**

## B. Git and Workspace Verification

Verified at the beginning of CP02:

| Item | Actual location/state |
|---|---|
| Git root / working directory | `/Users/rajenaria/Documents/Projects/AI-Projects` |
| Canonical application | `/Users/rajenaria/Documents/Projects/AI-Projects/AI-Office` |
| HEAD | `30db668ea3196e1b337cf41ef31de5c114e2cdfc` |
| Current commit subject | feat(ai-office): add cross-platform capability denial boundary (CP01) |
| Starting working tree | Clean |
| CP01 report | [AI-Office/docs/reviews/M02-02_CP_01_CROSS_PLATFORM_RUNTIME_BOUNDARY.md](M02-02_CP_01_CROSS_PLATFORM_RUNTIME_BOUNDARY.md) |
| CP01 implementation | Canonical `src/contracts/runtime-platform.ts`, `src/server/attempt-control/platform-capabilities.ts`, `src/server/attempt-control/execution-admission.ts` and `tests/contracts/runtime-platform.test.ts` |
| Duplicate directory at initial verification | Absent |

The previous conversational CP01 link erroneously repeated `AI-Office`; the actual CP01 files were correctly placed. No repair of CP01 was necessary. The later new CP02 patch independently made a real nested-path error. These two facts must not be conflated.

Wrong new file: `AI-Office/AI-Office/tests/contracts/containment-safety.test.ts`, 13,982 bytes, SHA-256 `c5fbb883811ad2a02deae0e132be6f2d7560f297d27e708d6f33f2e0b28ce6ce`.

Intended file: `AI-Office/tests/contracts/containment-safety.test.ts`, absent. No copy/move/delete operation was attempted. Required report path is canonical and is the location of this document.

## C. CP01 Baseline

The retained CP01 manifest SHA-256 matched `bcc5891bcef05922b68c56cc3c85e60b9d24c1d82a81d6a650b50e9f02135426`. All101 inventoried evidence files and all five recorded deliverables matched their hashes, including the canonical source/test/report bytes now committed at the newer HEAD.

Retained actual test-result JSON and command outcomes confirm **145 PASS /0 FAIL /0 SKIP**:55 CP01 cases plus90 regressions in five original files. Final scoped compiler result is exit0;48 other files remain NOT_RUN. These are **verified historical CP01 artifacts, not freshly executed CP02 tests**. Historical Windows1,295 results were not rerun or reconstructed.

The CP01 report correctly limits integration to the actual PI09A owned-denial assessment/audit seam. No Windows/macOS native containment, authenticated membership/run authority or positive execution was established by it.

## D. Windows Enforcement Findings

The canonical TypeScript application contains Windows-only path validation and a synthetic supervisor with admission before process-capable code. The CP01 Windows metadata accurately reports Job Object custody as HISTORICAL_EVIDENCE_ONLY/UNVERIFIED. No current native production Job adapter was found in the inspected application source.

The [historical Job admission/lifetime report](M02-02S16B_R3_JOB_ADMISSION_LIFETIME_REPORT.md), sectionsD–M, describes guarded candidate interfaces: unnamed owned jobs, atomic suspended CreateProcess/STARTUPINFOEX job-list attributes, exact limits, returned-handle custody, identity/membership before resume and no create-then-assign fallback. It explicitly retains EXTERNAL_ADMISSION_ACCESS_BOUNDARY_UNPROVEN. Its fake/static checks do not mint native permits. Candidate C# source/build artifacts were recorded under historical disposable Windows evidence roots; they are not newly accessible native implementation proof here.

The [controlled watchdog-crash report](M02-02S16B_R6W_JC_CRASH_CONTAINMENT_REPORT.md), sectionsA/H–Q, records configured kill-on-close, unexpected membership, sticky HOLD, absent crash-arm authorization and unverified independent exits. Configuring a Job Object, closing a process handle, a cleanup request and independently observed complete exit are distinct. Last-handle and foreign-admission assumptions remain unresolved. No old PID was inspected or used as a control target.

No Windows guard, watchdog/crash behavior, custody rule or historical stop was modified. No native experiment was repeated.

## E. macOS Enforcement Findings

Offline primary-source inspection used installed Apple SDK headers under `/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk`. Header presence establishes API/design information, not runtime support on the running OS or accepted containment. No external network access, native client creation, entitlement request, SDK compilation or OS probe occurred.

| Candidate native mechanism | Technically relevant role and retained limit |
|---|---|
| Signed App Sandbox helper | Candidate OS-enforced filesystem/network restriction layer to investigate. The local sandbox.h directs developers toward App Sandbox and deprecates sandbox_init. A signed helper's exact entitlements, allowed resources, descendants and compatibility with a coding runtime require independent design and native evidence. Sandbox presence alone does not prove complete custody/termination/resource enforcement. |
| Authenticated XPC control boundary | xpc/connection.h exposes peer code-signing/entitlement requirements. Candidate protection for an administrative controller/helper channel, with version/identity/authorization review. Authenticated IPC is not process-tree isolation or a kill guarantee. |
| EndpointSecurity observer / scoped policy | ESClient/ESTypes headers expose AUTH_EXEC and NOTIFY_FORK and document entitlement, TCC and privilege requirements. Execution authorization events and fork notifications have different semantics; observing fork is not preventing all process creation. Event muting, ordering/deadlines, availability and observer failure require review. Do not assume arbitrary user access or unmute global policy. No ES client was created. |
| libproc identity/observation | Headers expose enumeration and audit-token-associated operations. Useful candidates for independent observation and incarnation checking, not automatic ownership, race-free descendant discovery or permission to control arbitrary PIDs. None was called. |
| getrlimit/setrlimit | sys/resource.h defines resource categories, including per-process CPU and other limits. Candidate component only; inheritance, privilege, aggregate-tree budgets and actual enforcement must be measured. No rlimit was read or changed. |

These are proposed building blocks, not a selected/proven complete Mac adapter. Process groups, cooperative cancellation, simple signals, shell termination and JavaScript interception cannot establish the required whole-tree guarantee. No mechanism is accepted as equivalent to Windows Jobs. If a complete independently enforced boundary cannot be demonstrated, Mac runtime must remain blocked.

## F. Shared Security Requirements

The following is a proposed acceptance contract, not a permission or new policy engine:

| Invariant | Existing implementation/evidence | Remaining requirement |
|---|---|---|
| Every process attributable | Stored attempt/epoch/session associations and synthetic receipt schemas exist | Independently authenticated invocation, native incarnation and owned scope; no PID/name/worker-JSON authority |
| Enforceable child/descendant custody | Historical Windows guarded candidates; CP01 missing containment always denies | Complete native scope and escape/foreign-admission proof on each platform |
| Unauthorized creation denied | Actual PI09A requireExecutionAdmission always rejects before supervisor queue/fork path | Native prevention for any later authorized path, including helper/grandchild escape |
| Cancellation leaves no uncontrolled descendants | Synthetic cancellation/history checks exist | Independent whole-scope closure, bounded emergency disposition and unknown-scope stop |
| Verifiable resource limits | Historical Job configuration; SDK resource API declarations | Actual enforcement/aggregate boundaries, readback and independent observer evidence |
| Bounded filesystem/network | Windows path validation and policy exist with documented race limits | Independently enforced read/write/network restrictions that protect credentials and canonical stores |
| Recovery never silently restores authority | Existing recovery contract uses dispatch:CLOSED/retryAuthorized:false | Native recovery/observer loss/host migration semantics and independent exit evidence |
| Trustworthy persistent audit | Local journals and external audit files provide scoped consistency | Protected writer/custody/ordering, failure handling and independent witness limits |
| Unverified enforcement denies | CP01 and current admission are denial-only | Preserve this barrier until separate platform/security/identity acceptance |

No successful compiler run, declared capability report, synthetic fixture or locally consistent hash may satisfy a native evidence requirement.

## G. Process Custody Requirements

Future contracts must bind each native process and scope to deployment, approved principal, workspace registration, task/attempt/run incarnation/epoch, controller generation and executable identity. Ownership comes from an independently established creation/custody path, not matching a submitted PID.

Retain a protected resource ledger: creation/transfer/borrowed status, inheritable/duplicated handles or rights, pending waits, disposal attempts and unresolved outcomes. Reject unowned/broad control; do not close speculative shared scopes or guess that unknown members are harmless. A compromised/unknown scope remains unsafe even if a later identity field looks valid.

Before future execution, prove no unauthorized interval between creation and enclosure, no breakaway/untracked helper route, observer continuity and independently verifiable closure. Cancellation acknowledgement, signal/API success, parent exit and a worker self-report do not individually prove descendant termination. Unknown custody forbids a new launch and requires an owner-approved safe disposition, not a destructive automatic retry.

## H. Resource Isolation Requirements

Future acceptance must define exact CPU/memory/process-count/file-descriptor/output limits and whether they apply per process, user or complete invocation scope. Readback and negative-path observation must prove enforcement rather than settings alone.

Filesystem scope must include reads, secrets, canonical state/audit stores, symlink/reparse/hardlink replacement and inherited descriptors. Network scope must cover TCP/UDP/DNS/loopback/proxy and helper inheritance. Evidence sinks, identity custody and controllers must be outside worker write authority. SDK/API availability and fixture monkeypatch guards do not provide these OS guarantees.

No new numeric runtime policy or permission is approved here. The Windows model is preserved; Mac restrictions must be independently engineered and tested.

## I. Admission Integration

Source audit identified the actual safe seam as [execution-admission.ts](../../src/server/attempt-control/execution-admission.ts), createExecutionAdmissionBoundary/requireExecutionAdmission, with CP01's platform assessment attached to owned denials. Existing host composition consumes it. The synthetic supervisor calls its registered throwing guard before process-capable continuation.

No genuine positive-authority gap was found in that inspected denial-only path. Therefore no production safeguard/adapter abstraction was justified. The planned CP02 work was focused negative regression coverage against that actual seam and the existing pure readiness/recovery/publication contracts. It was not a new authorization engine.

The new test was authored in the wrong nested location and **was not executed**. No CP02 integration coverage is credited. Full host composition, supervisor calls, repositories/native adapters, HTTP and output transport were not invoked. The planned publication regression would use the actual denial boundary only, not change HELD/outbox guarantees.

## J. SECURITY_STOP Preservation

Existing readiness allows only UNKNOWN/BLOCKED/ACTIVE_STOP security states, all denying. No CLEARED state or clearance mutator is introduced. CP01 always reports missing stop clearance, and the host identity boundary remains UNPROVISIONED.

All stop/readiness/repository/cancellation/recovery/publication/outbox files retain starting hashes. No canonical user database was opened, so this report claims source/evidence preservation, not a newly observed live security-record value. Historical HOLD/unknown custody, D9 NOT_AUTHORIZED, archival pending and four restricted process suites remain unchanged.

## K. Source Changes

Production source changed: **none**. Existing tests changed: **none**. New repository files at this stopped checkpoint:

| File | State |
|---|---|
| `AI-Office/AI-Office/tests/contracts/containment-safety.test.ts` | Newly authored, wrong location, unexecuted, not accepted; retained untouched pending owner direction |
| `AI-Office/docs/reviews/M02-02_CP_02_CROSS_PLATFORM_CONTAINMENT_SAFETY.md` | Canonical blocked-status report |

The wrong-path test contains proposed negatives for forged native/custody claims, stale/contradictory CP01 evidence, admission dependency failures/lifecycle races, stop-row denial, recovery quarantine and publication denial. It does not implement containment or establish trust. No production/source/config/dependency/guard/native adapter change accompanied it.

## L. Focused Test Results

**CP02 focused tests: NOT_RUN.** No pass/fail/skip case count is invented from an unexecuted file. The canonical-path STOP condition occurred before harness preparation, import-closure review completion or any test invocation.

The new file must not be treated as accepted merely because it was authored. Any authorized continuation must first resolve its path, audit imports/effects, then select it explicitly in a fresh copy of the reviewed MAC02 harness with unchanged guards. No test allowlist was expanded in this stopped milestone.

## M. Regression Results

**CP02 fresh regressions: NOT_RUN.** The145-pass CP01 baseline was verified from retained sealed artifacts, not rerun. The original90 Mac cases and Windows1,295 results remain historical in their documented scopes. The48 previously excluded files and historical restricted process/containment/crash suites remain NOT_RUN.

No default npm test, application bootstrap, provider, network, listener, native process-control or live worker behavior occurred.

## N. Typecheck Result

**CP02 typecheck: NOT_RUN.** No new compiler version/exit0 result is claimed. The verified CP01 evidence retains native TypeScript7.0.2 and final exit0; that result is not transferred to the unexecuted/mislocated CP02 test.

No compiler/harness process was launched for CP02. Shell/Python inspection and evidence hashing are inspection tooling, not application process execution or containment tests.

## O. Evidence Location

Fresh persistent audit outside Git:

`/Users/rajenaria/Documents/AI-Office-Audits/M02-02-CP-02-2026-11-13-01`

It records canonical/HEAD/clean-start verification, matched CP01 manifest/results/deliverables, all3,798 tracked baseline hashes,2,741 selected original isolated source/harness/dependency hashes, the new wrong-path stop receipt and final report/status/hash checks. No historical manifest is edited.

`canonical-path-stop.json` records the accidental file's exact path/hash/size, absent intended file, unchanged tracked set and NOT_RUN decisions. The evidence manifest/checksum seal is generated after final report capture and excludes recursive self-hashing. Local hashes prove compared consistency, not independent native trust or anti-rollback protection. No tokens, keys, private user stores or runner-home state were collected.

## P. Remaining Platform Blockers

Immediate CP02 blocker: the explicitly prohibited nested-path discrepancy. No implementation/testing continuation occurs without owner direction permitting correction of that newly created test.

Underlying blockers remain: Windows exclusive custody/foreign admission/last-handle/independent closure; complete Mac enforcement design and native proof; protected filesystem/network/state/audit boundaries; independent identity, membership and current-run sources; grants/revocation/freshness; approved supported native test hosts; real bounded E2E and official M02 acceptance contract.

## Q. Required Native Acceptance Tests

**PROPOSED_NOT_RUN; requires a separate explicit authorization.** No native test is authorized by this report or the CP02 prompt.

| Requirement | Windows future plan | macOS future plan |
|---|---|---|
| Host | Named supported Windows build/edition, architecture and patch state; disposable owned environment | Named supported macOS version/build/architecture, matching SDK and signing/entitlement prerequisites; disposable owned environment |
| Implementation | Exact reviewed native Job/custody adapter and binaries, no fallback weakening | Exact separately reviewed complete native boundary, explicit primitive gaps, no Job-equivalence assumption |
| Observer | Named independent observer outside controlled scope with authenticated process-incarnation/exit evidence | Named independent observer outside worker authority; event-loss/identity/closure guarantees explicitly tested |
| Evidence custody | Protected persistent sink, immutable source/binary/config hashes, monotonic correlation and bounded receipts | Same; approved audit/observer APIs and actual privileges, no secret collection |
| Negative tests | Denied creation, foreign/duplicate/inherited handle, unexpected member, breakaway, reused PID, stale epoch, observer loss, partial initialization | Denied helper/fork/exec routes, descendant escape/reparenting, stale incarnation, observer/event loss, unauthorized FS/network, partial initialization |
| Recovery | Preapproved bounded crash/observer-loss cases; missing exit never becomes cleanup success or automatic resume | Same; termination and descendant closure must be independent of cooperative self-exit; uncertain scope remains stopped |
| Cleanup | Only proven owned resources/scopes; explicit failure disposition; no historical PID/name targeting or broad kill | Only proven owned resources; no user-wide kill, PID guessing, privilege/entitlement rollback without approved plan |
| Approval | Named security reviewer signs exact bounded test plan, effects, stop thresholds, evidence and permitted cleanup before launch | Same; separate approval for any signing, privilege, TCC, service/system-extension or native installation change |

Resource exhaustion, network/filesystem escape and controlled crash tests require their own safe budgets/fixtures and separately authorized effects. Passing pure TS tests or an SDK build cannot substitute for these acceptance rows.

## R. Owner Decisions Required

For the present path blocker, the concrete corrective action would be to relocate **only** the newly created, untracked wrong-path test into the absent canonical `AI-Office/tests/contracts/containment-safety.test.ts`, then resume offline import review/harness preparation/testing. No such action has been taken. The owner explicitly prohibited automatic move/overwrite/delete on this discrepancy.

Beyond that correction: deployment mode and D2–D5 remain pending; Windows-and-Mac product direction stays approved. No real identity/keys/credentials or production trust root is requested or provisioned here. Future native implementation/experiments, observers/hosts/custody/recovery/cleanup plans and security-review acceptance require separately bounded approval. The official PRD/M02 exit contract remains unverified and is not replaced with these proposed tests.

## S. Final Status

**CP02_SECURITY_BLOCKED** by the canonical-path stop condition introduced during CP02 test authoring. CP01's canonical implementation and sealed145-pass baseline are verified and unchanged. CP02 focused/regression tests and compiler are NOT_RUN. No native runtime or production milestone is completed.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.** No historical evidence mutation, production identity provisioning, worker/provider/listener launch, containment activation, commit/push, file relocation or cleanup occurred.
