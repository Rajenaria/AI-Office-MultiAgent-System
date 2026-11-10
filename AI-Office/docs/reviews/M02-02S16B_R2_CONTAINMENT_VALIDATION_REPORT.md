# M02-02S16B-R2 — Pre-Launch Containment Validation Report

Tanggal acuan: **5 November 2026, Asia/Jakarta**. Pendamping: [Security Gate Matrix](M02-02S16B_R2_SECURITY_GATE_MATRIX.md).

Evidence level: SOURCE_VERIFIED = source/document/metadata inspection; STATIC_TEST_VERIFIED = managed/fake assertions; DESIGN_SPECIFIED = intended protocol; NOT RUN/NOT VERIFIED = no OS acceptance. No HOST_ONLY_VERIFIED result is claimed.

S16BR2_ROOT:

    C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br2-fa830fa4-586e-49e8-9139-379252d11b2c

Relative paths below refer to this root. All code/evidence stays disposable; only this report and its companion are new repository files.

## A. Executive decision

**PARTIAL_PASS_STOPPED.** Final managed suite **152PASS,0FAIL,0SKIP,0TIMEOUT**, including all84 previous tests and26 new fault injections. Three offline builds pass with zero warnings; two focused static repair cycles used, matching the authorized ceiling.

Mandatory independent safety review remains **SAFETY_REVIEW_INCONCLUSIVE**. Unknown-member kill-on-close handle lifetime and partial original-handle initialization do not have a complete safe native recovery disposition. Consequently **HOST_ONLY_RUNTIME_NOT_AUTHORIZED**, Test1/Test2 NOT RUN, target creations0, new Job Objects0, native process-control calls0, MXC0, worker0.

This is not STATIC_PASS_RUNTIME_BLOCKED: that category requires design/code completed. Native failure recovery is still incomplete, so this report does not promote passing rejection tests into completed containment/cleanup capability. The bounded milestone stops and reports as instructed.

## B. S16B-R checkpoint

[Original S16](M02-02S16_PROCESS_TREE_SUPERVISION_REPORT.md) remains CONDITIONAL. [S16B](M02-02S16B_PROCESS_CONTROL_BRIDGE_REPORT.md) remains BLOCKED. [S16B-R](M02-02S16B_R_MEMBERSHIP_CLEANUP_REMEDIATION_REPORT.md) remains STATIC_REPAIR_PASS/runtime unauthorized. Their matrices and reports were inspected and preserved.

R2 uses actual accessible Core.cs, LifecycleModel.cs, NativeDeclarations.cs, LegacyRegression.cs and Tests.cs; no old executable is run. Baseline source copies remain in source/baseline. Core membership/correlation/HandleLease/GateEngine and all84 assertions are retained. PriorTests changes only disposable root/executable/output names, not assertions.

R2-A passed before source was copied or written. R2-B selected atomic Strategy A for source implementation. R2-C/R2-D built and tested managed logic. Mandatory review did not PASS; R2-E records denial, followed by final audit. No routine approval was requested and no forbidden downstream stage was executed.

## C. Historical evidence status

Original S16B manifest's78 entries plus manifest = **79 files**; original S16B-R manifest's53 entries plus manifest = **54 files**. Both full roots remain unchanged. Their original/repair sources, binaries, failure events, final audits, manifests and native-denial evidence are not overwritten.

S16B initial/repair1 binaries remain quarantined. Previous three failure closes with KILL_ON_JOB_CLOSE may have terminated associated members; zero explicit TerminateJobObject is not zero possible termination. Original root exits and25 handle closes do not establish all child/helper exits.

All prior152-or84 references remain tied to the actual milestone/run: historical S16BR84, R2 initial150, repair1 151, repair2 final152. Counts are not combined into unique test totals.

## D. Historical PID reconciliation

23376 and23644 remain **HISTORICAL_PROCESS_IDENTITY_UNRESOLVED**. R2-A retained each incident, queried only ProcessId/CreationDate/ExecutablePath/ParentProcessId for the documented numeric PID, and found no current entries. No command lines, control handles or termination were used.

Original creation/image/nonce/exit receipts are still missing. Present PID absence is not historical identity or exit proof. S16B initial failed runs also lack complete actual-member lists. No positive matching live residual was established; full historical residual closure is not certified. New static success cannot close these incidents.

## E. Missing Codex candidate reconciliation

**MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE.** Exact candidate path remains absent:

    C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW\candidate\bin\codex.exe

R2 compared the original per-root relative-path inventories in S16B evidence/preflight/baseline-retained.json and baseline-pipeline.json against S16B-R evidence/baseline-fixtures.json and its historical-fixture-reconciliation.json, then the actual current paths. **The missing relative-path sets are exactly the same45 files**, not merely equal counts.

Across16 historical roots: old2169, S16BR2124, R2 accessible2124. S4 alone old61/current16; no newly missing/changed/added accessible fixture file. Full path-level rows are in evidence/preflight/historical-path-reconciliation.json. No download/extraction/replacement/rebuild or active-Codex substitution occurred. Installed0.162.1 remains distinct and unchanged. Missing pinned runtime does not itself block managed work, but blocks future pinned MXC validation.

## F. Strategy A — atomic job-list analysis

SOURCE/DESIGN: use STARTUPINFOEXW and PROC_THREAD_ATTRIBUTE_JOB_LIST in CreateProcessW, with CREATE_SUSPENDED and EXTENDED_STARTUPINFO_PRESENT. This removes the separate create-then-assign step in the selected contract. It does not establish a sandbox or prove the local native implementation.

[Microsoft UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute) documents the ordered job list and value-memory lifetime. [STARTUPINFOEXW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-startupinfoexw) requires cb for the extended structure. [Official Microsoft header](https://raw.githubusercontent.com/microsoft/win32metadata/main/generation/WinSDK/RecompiledIdlHeaders/um/WinBase.h) supplies attribute13/input-bit encoding0x2000D.

Implementation uses existing Framework C#5 P/Invoke, IntPtr/UIntPtr and unmanaged buffers. No new dependency. Local ABI layouts and argument construction pass managed tests. Native API/job assignment behavior remains NOT RUN.

## G. Strategy B — suspended create then assignment

SOURCE/DESIGN comparison only. Original process/thread handles can support ordinary exception cleanup after assignment failure, followed by a finite original-handle wait and exit-code read. P03/P04 and F13 model this branch without native processes.

Hard supervisor death between CreateProcess(CREATE_SUSPENDED) and AssignProcessToJobObject can leave a suspended process outside the intended job. An exception handler does not run after every hard death. Strategy B is not equivalent to atomic assignment and is not eligible for runtime here. No easier legacy path is silently substituted.

## H. Chosen containment architecture

A is selected for disposable source, **not granted native execution authority**.

| Dimension | Strategy A | Strategy B |
|---|---|---|
| API availability |Documented Windows10+; current Windows26300 fits documented platform |Documented APIs available in source |
| Compiler |Framework C#5 build PASS |Existing declarations/model compile |
| Handle owner |New private job, original PI handles, invocation capability |Original handles, later job association |
| Assignment timing |Supplied within process creation |Separate post-creation call |
| Pre-assignment exposure |No separate assignment step in contract; local OS result unverified |Explicit gap |
| Supervisor crash |Kill-on-close design; duplication/lifetime/receipt gaps remain |Additional unassigned-orphan risk |
| Leakage/duplication |No intentional duplicate; exclusion not empirically established |Same plus assignment gap |
| Inheritance |bInheritHandles=false; handle flags checked in dormant source |Would require equivalent review |
| Breakaway |Fixed flags and job limits exclude breakaway |Not enabled as fallback |
| Nesting |No ancestor-job mutation; actual nested behavior NOT RUN |Not used to change hierarchy |
| Known cleanup |Original-handle or exact verified private-job request + wait |Original-handle exception branch modeled |
| Unknown cleanup |Refuse group action/last close; full lifetime disposition incomplete |Same unresolved ownership constraints |
| Runtime eligibility |Denied by mandatory review |Denied, no independent gap mechanism |
| Production |No integration, crash/descendant/MXC guarantees |Not selected |

A maximum-one-active-process job is a concurrency constraint, not proof that all historical/current member identities are legitimate. It is not used to excuse unknown members.

## I. Pre-assignment crash window

The preferred source has no separate AssignProcessToJobObject operation after creation; its legacy branch is fake-only. Actual atomic assignment has not been observed locally.

A separate window exists between successful kernel creation and completion of user-space identity/capability receipt. Repair1 adds provider HasCreatedProcess/Original state so an exception there cannot be reported as no process created. F26 demonstrates Created=true, no resume, no fabricated exit and no empty-job close.

Accounting for creation is not cleanup. Missing original handles/creation evidence still prevents native recovery acceptance. R2 does not equate eliminating one launch gap with solving every supervisor-failure gap.

## J. Original process-handle custody

AtomicProtocol.OriginalCapability binds the same LaunchSpec object, invocation/owner, original process/thread tokens, PID and creation evidence. Matching token/phase/open-state is required before modeled cleanup; no PID reopening or substitute handle.

ProvesExit checks original provenance, invocation, owner, generation, executable/digest, PID/creation, signaled wait, successful exit-code read and no pending wait. It does **not** require job membership for a legitimate unassigned original process; X03 verifies that distinction. This is necessary for Strategy B analysis but does not authorize its native launch.

Native source retains raw PI handles. Recovery after a missing handle or evidence-query exception is incomplete. Current authority denial prevents such a live resource from being created. Fake custody is not native ownership evidence.

## K. Private Job Object custody

Dormant native source creates one unnamed job with null security attributes, configures 0x2008 = KILL_ON_JOB_CLOSE | ACTIVE_PROCESS_LIMIT1, and checks configuration and noninherit flags. No named shared job, old job reuse, OpenJobObject, DuplicateHandle or unrelated assignment. bInheritHandles=false.

There is no automatic job SafeHandle/finalizer pretending unknown-scope disposal is harmless. Close-empty-job requires observed empty membership and appropriate exit state. This avoids deliberately issuing an unknown-scope group close, but **does not complete lifetime recovery**: keeping a handle forever is invalid, and process death eventually closes retained handles. That unresolved consequence blocks native launch.

## L. Process creation and membership protocol

Core parser is unchanged from S16BR: header/count/length/pointer/PID/duplicate validation, bounded capacity256 and4queries, stable complete snapshots, every-observed ledger. No truncation or unexpected member is silently discarded.

NativeAtomicPlatform source prepares an opaque attribute list, retains the pointer-sized job-list value until deletion, pins the fixed executable through a read file lock/hash comparison, and calls the extended Unicode creation overload with flags0x08080404 and no handle inheritance. It verifies image/creation/IsProcessInJob/original handle flags before a modeled resume.

AtomicProtocol records operations and outcomes. NativeAuthority.DemandNative unconditionally throws before any native adapter entry; no CLI or JSON can turn review failure into PASS. SyntheticFixture source is compiled into the static assembly but **no separate synthetic-fixture.exe is emitted or launched**.

## M. Cleanup before resume

Static normal path: exact original capability → TerminateProcess request → recorded API result → finite wait → identity-bound exit receipt → empty job → thread/process/job closure. Request success is distinct from exit.

Pre-assignment legacy failure uses original-handle cleanup only; no group assumption. Wrong invocation/token, closed original handle, missing thread, missing creation evidence and wrong phase reject authority. Cases that cannot prove exit/resource accounting remain INCONCLUSIVE, not CLEANUP_CONFIRMED.

[TerminateProcess documentation](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess) describes asynchronous termination and separate wait requirement. No actual call occurred in R2.

## N. Cleanup after resume

Modeled job request requires private custody and exact complete membership. Unknown or truncated membership rejects group action and resume as applicable. On an earlier verification failure, only a legitimate original-handle action may be modeled; no retry after failed termination.

Accepted API request does not complete cleanup. Per-original exit, final empty membership and ordered handle closes are required. Close failure remains failure. Native partial-initialization/unknown-scope resource disposition is not yet complete, so post-resume native testing is also denied.

## O. Supervisor crash handling design

All cases below are DESIGN_SPECIFIED/NOT RUNTIME VERIFIED. Full per-case owned resources, containment boundary, potential live process/user code, permitted/prohibited cleanup and evidence are in evidence/supervisor-crash-model.json. No deliberate crash/orphan experiment occurred.

| Case | Owned state / exposure | Fail-closed disposition |
|---|---|---|
| C01 before job |No owned OS resources/target |No target exit claim |
| C02 after job |Empty private job |Close only proven empty owned job |
| C03 attribute init |Job/list/value buffers; no target |Delete only initialized list, free owned buffers |
| C04 create fails |No successful process receipt |Do not invent process or exit |
| C05 create succeeds before receipts |PI handles/job may exist; not resumed |Retain Created=true; missing capability remains unresolved |
| C06 membership fails |Original handles plus uncertain list |No resume/group close; original-only permission if valid |
| C07 crash before resume |Atomic membership intended; suspended target |Last-close behavior is design, not exit receipt |
| C08 crash after resume |Possibly running target/job |No independent post-crash exit proof |
| C09 crash during termination |Request plus original handles |Do not equate request with completion |
| C10 crash before receipt |API result without observer |No fabricated complete receipt |
| C11 unexpected last close |Kill-on-close may act |Separate close event, trigger and observed exit |
| C12 duplicate job handle |Last-close may be delayed |Reject uncertain custody; no death guarantee |
| C13 inherited handle |Lifetime uncertain |Deny on detected inheritance |
| C14 breakaway attempt |Fixed flags disallow; not hostile proof |Reject config drift; no breakaway relaxation |
| C15 unexpected member |Unknown identity/scope |No unknown group action; lifetime prerequisite unresolved |
| C16 truncated query |Incomplete evidence |Bounded growth, no complete receipt |
| C17 exits during query |Changing membership/retained handles |Disappearance not exit |
| C18 WAIT_TIMEOUT |Exit unconfirmed |Stop downstream; no retry/PID fallback |
| C19 WAIT_FAILED |API/identity evidence incomplete |Preserve error; do not fabricate exit |
| C20 not all accounted |Incomplete identities/exits/handles |No PASS or next launch |

All cases prohibit PID/name kill, broad taskkill, unrelated targeting or silent clean shutdown. Process-only normal/fake exit does not verify supervisor crash cleanup.

## P. Win32 interop implementation

NativeDeclarations adds StartupEx, Initialize/Update/DeleteProcThreadAttributeList, extended CreateProcessAtomic, TerminateProcess and GetHandleInformation to copied declarations. Unicode W methods, Win32 BOOL marshaling, IntPtr/UIntPtr widths, Sequential layouts and SetLastError metadata are retained.

Managed checks: x64 STARTUPINFOEX112, attribute pointer offset104, STARTUPINFO104, PROCESS_INFORMATION24, ExtendedLimits144. Job-list buffer holds one pointer-sized handle; opaque sizing is bounded before allocation. Initialized list is deleted before value/buffer free. Real attribute-list API behavior was not tested.

Native waits use5000ms and record raw wait values; WAIT_TIMEOUT has no invented Win32 last error. GetExitCodeProcess is called/logged only after signaled wait. Repair2 fixed an earlier dormant source branch that would have logged a failed GetExitCodeProcess receipt even when short-circuit evaluation skipped that API call. X04 covers the corrected policy. No fake OS receipt was ever emitted because native authority stayed denied.

## Q. Static tests and builds

| Group | Final count | Result |
|---|---:|---|
| Entire S16BR suite |84 |PASS, includes original17 negatives and18 old faults |
| R2 A01–A10 |10 |PASS |
| R2 P01–P10 |10 |PASS |
| R2 J01–J10 |10 |PASS |
| R2 O01–O08 |8 |PASS |
| R2 F01–F26 |26 |PASS |
| R2 X01–X04 |4 |PASS |
| Total |152 |0FAIL/0SKIP/0TIMEOUT |

Injected timeout/failure is a passing rejection case, not actual suite timeout. PriorTests/Main and R2Tests never launch native child processes. Managed allocation/metadata tests are not OS containment tests.

Runs: initial150PASS; repair1 151PASS; repair2 final152PASS. All receipts and cycle0/cycle1 source/test/binary copies retained. Two authorized focused static repair cycles used; no further source repair/retest or runtime retry is inferred.

Compiler: C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe; Valid signature; product14.8.10001.0. SHA256 ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3. Three builds exit0/zero warnings; explicit installed framework references, no restore/install/download. Full argv/reference/source evidence in evidence/static/build1.json through build3.json.

Final build/s16br2-static.exe SHA256:

    6405977841A2C121DAF914775B89814B80C195EFDD3109C120862857B2152A47

| Compiled source | Final SHA256 |
|---|---|
| source/AtomicProtocol.cs |72D1F4CF2E83E76EFE2C39EF352BE413B0E9EF936C5518BEBE3D4C92EBCDE997 |
| source/Core.cs |599625D3FE42D15E2583AC67B68FE6AA72F90762C52B62CB080E6D377A331C07 |
| source/LegacyRegression.cs |FBEE7C76B9F1CA0F6913E997D7C53E4B19DCE75B040E8288F432F4802561F763 |
| source/LifecycleModel.cs |E84F9581A1EE3E7EA8393F471D0C8E34E01EDDB9D11711792BD67BC342786364 |
| source/NativeAtomicPlatform.cs |544DC3B3D393D87271D0035E0F84942D9C1C6CA5FA082839DD9397E06599974D |
| source/NativeDeclarations.cs |D9BF743243E09A3BAA6B6B8338E5A6C0F18538DB87B94CBCC13CD5EBCDD2B5F1 |
| source/SyntheticFixture.cs |1900F20D28209FB1F74A78E3A4614A643030DC5D98E0799BF0A895542AA4CBC7 |
| static-tests/PriorTests.cs |62B3E501F039D5E00891C542BBF794A53726E3BE0D8400F854BFE937ED16C2E4 |
| static-tests/R2Tests.cs |029D172BC9F8C2504F45E9FB30395EF3199838BAA15DAD26FD774BFEE9113DAD |

## R. Fault injection

All required new F01–F25 plus added F26 PASS using fake providers. Actual per-case failure, phase, operations, API-like fake receipts, modeled creation attempts and no-native count are retained in static-tests/r2-run3.json.

F01–F05: job/limits/attribute init/job-list update/process-create failures. F06–F07: unavailable original process/thread. F08–F12: query/partial/extra member/image/creation mismatch. F13: legacy assignment failure. F14: resume failure. F15–F16: original/job termination rejection. F17–F18: timeout/failed wait. F19: close failure. F20: inherited handle. F21: owner mismatch. F22: missing exit. F23: failed predecessor. F24: historical PID uncertainty. F25: missing candidate/no substitute. F26: success-before-capability exception.

Assertions check exact failure classification, no unauthorized resume, no unknown group close, no false exit/cleanup, and no hidden repeat request. O02/O03/O04 independently assert all downstream callback counts0 after membership/identity/cleanup failures. Destructive failure paths are never injected into live Windows processes.

## S. Independent safety review

**SAFETY_REVIEW_INCONCLUSIVE.** This agent performed a second source/evidence pass independent of the implementation's test PASS flag; no separate human/sub-agent reviewer is claimed. All20 required questions and answers are in evidence/static/independent-safety-review-final.json.

The review accepts API/source construction and passing managed rejection logic, but cannot approve unknown-member handle lifetime, original-handle loss/partial initialization recovery or actual native behavior. Limit1 does not establish a complete admission/identity ledger. Keeping real handles forever or relying on eventual process death is not accepted cleanup.

Reflection-only verification of the final binary shows RuntimeAuthority.DemandNative is an unconditional exception throw, and seven native operational entries call the denial guard before APIs. evidence/static/native-denial-proof-final.json. This proves **current denial**, not that removing the guard is safe.

## T. Runtime feasibility decision

**HOST_ONLY_RUNTIME_NOT_AUTHORIZED.** No manual override, source-flag promotion or soft PASS. Native entry stays locked; separate target executable is not built. Strategy B is not selected to work around this gate.

Planned bounds: setup/membership/READY/exit/final-accounting5s phases, operation-level total25s; at most2 creations, one target at a time, no descendants/retry. Only source has5000ms waits/READY and25000ms operation checks; native syscall preemption and complete phase deadline implementation are not proven. No runtime timing acceptance is claimed.

The pinned Codex absence is a separate MXC blocker, not the reason host-only launch is denied. The failed prerequisite is safe native ownership/lifetime recovery.

## U. Host-only Test 1

**NOT RUN;0 attempts.** No job initialization, suspended process, membership query, original-handle native termination or exit receipt. Atomic-before-resume is not marked verified merely because the static executable exited0.

## V. Host-only Test 2

**NOT RUN;0 attempts.** Required Test1 PASS does not exist. No target resumed, READY observed, private-job termination, descendant or residual workload created. No automatic retry.

## W. Termination and exit accounting

R2 real targets0/new private jobs0/real process-thread-job handles0/TerminateProcess0/TerminateJobObject0/last-job-handle closes0. Compiler and managed test-harness processes completed through direct tools; they are not the two synthetic target experiments.

No current target exit exists to be verified, and no OS CLEANUP_CONFIRMED receipt is fabricated. Runtime invariants I01–I20 have explicit source/static/NOT RUN evidence in evidence/runtime/invariants.json; actual atomic assignment/identity/suspension/membership/exit gates remain unexecuted.

Historical unaccounted process identities are not silently closed by zero new targets. No no-unrelated-impact claim is made about old S16B failure closes.

## X. Source/system integrity

R2-A baseline, post-static comparison and R2-F final comparison protect actual accessible scope. No source/test/schema/package/lock/.gitignore/startup/registry/database connection or migration. Raw file hashing is not a SQLite connection.

| Scope | Actual comparison |
|---|---|
| AI OFFICE |417 pre-existing regular files unchanged; only2 new R2 reports, final419; includes both untracked S16BR reports from initial working tree |
| S16BR evidence |54/54 unchanged |
| S16B evidence |79/79 unchanged, old gate still revoked |
| Active Codex0.162.1 |50/50 files unchanged, nested package included |
| Hermes3D |647 tracked files unchanged |
| Historical fixtures |2124 accessible regular files on16 roots unchanged;45 pre-existing missing paths remain missing |

General repository snapshot excludes directory names node_modules/.git and does not traverse reparse points; installed-Codex and historical/evidence snapshots use their explicit full scope. Known junction metadata is compared without target traversal. Whole OS/global configuration, untracked Hermes and global process effects are not independently checksum-audited.

No new dependency, privileges, ACL/firewall/Defender/UAC/registry/PATH/service/task/WSL change, credential access, provider auth, inference, paid API, app-server, worker, MXC, arbitrary PID/name kill or destructive cleanup. Official-document research uses network; build/test/provider network connections were not initiated. Zero whole-host network traffic is not claimed.

inventory/artifact-inventory.json records all other disposable regular files with relative path/bytes/SHA256, excluding itself. evidence/audit/final-audit.json records final exact added paths, hashes, scopes and limitations. No old fixture is deleted, normalized or restored.

## Y. Remaining production limitations

Atomic local runtime behavior, complete native failure cleanup, supervisor crash/last-close receipts, arbitrary descendants, nested MXC, production supervisor, physical output fencing, app-server/approvals, credential custody, subscription entitlement and included-only billing remain unverified. No production wiring or source change. Zero usage does not prove entitlement/billing enforcement.

S12–S15 authority is untouched; PID/handle absence does not authorize recovery takeover or success/effects commit. S16's bounded MXC control blocker remains unresolved. No S16C/S17 starts.

## Z. Final classification and one recommendation

**PARTIAL_PASS_STOPPED**, despite152 managed PASS: mandatory containment/cleanup safety evidence remains incomplete. Current executable is safe only for the guarded managed suite; it has no granted native launch authority.

Exactly one bounded recommendation: **complete the private-job admission/custody and failure-lifetime disposition for unknown membership and missing original-handle evidence before enabling the atomic native adapter**. Keep the same concrete blocker; do not create further roadmap stages solely to rename this design gap. No MXC/app-server/production launch or candidate restoration is proposed.

Current authorization was used for source/static remediation and reports. No routine approval is pending. Any follow-up after this stop must stay separately bounded and cannot simply remove the native denial guard.

**M02-02S16B-R2 PARTIAL — MANDATORY CONTAINMENT OR CLEANUP EVIDENCE INCOMPLETE — REAL WORKER BLOCKED.**

