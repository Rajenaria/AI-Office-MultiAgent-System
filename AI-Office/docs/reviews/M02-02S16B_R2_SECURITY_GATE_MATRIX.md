# M02-02S16B-R2 — Security Gate Matrix

Tanggal acuan: **5 November 2026, Asia/Jakarta**. [Containment Report](M02-02S16B_R2_CONTAINMENT_VALIDATION_REPORT.md) = A.

**PARTIAL_PASS_STOPPED.** Managed suite152PASS; mandatory safety review INCONCLUSIVE. HOST_ONLY_RUNTIME_NOT_AUTHORIZED; Test1/Test2 NOT RUN; target/job/native-control count0. Real worker BLOCKED.

S16BR2_ROOT:

    C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br2-fa830fa4-586e-49e8-9139-379252d11b2c

Paths below are relative to this root. SOURCE_VERIFIED is inspected source/document/scoped actions. STATIC_TEST_VERIFIED means managed/fake assertions or actual compilation. No HOST_ONLY_VERIFIED result is claimed.

## 1. Requirements, source, tests, evidence and status

| Gate | Requirement | Status | Source/test/evidence and limit |
|---|---|---|---|
| S16BR2-01 | Checkpoint source verified | SOURCE_VERIFIED | R2-A checkpoint.json; actual copied source/baseline; prior84,18faults,17legacy coverage inspected. |
| S16BR2-02 | Historical evidence preserved | SOURCE_VERIFIED | S16BR54/S16B79-file full snapshots; original reports/manifests/quarantine unchanged; final audit. |
| S16BR2-03 | Quarantined binary not executed | SOURCE_VERIFIED | Only freshly built s16br2-static.exe invoked; old revoked build gate/hash unchanged. |
| S16BR2-04 | Historical PID cases documented | HISTORICAL_ONLY | checkpoint.json cases23376/23644; current numeric lookups empty; historical identity/exit unresolved. |
| S16BR2-05 | Missing candidate reconciled | SOURCE_VERIFIED | historical-path-reconciliation.json: exact relative-path missing set matches prior45; candidate absent; no substitution. |
| S16BR2-06 | Strategy A analyzed | DESIGN_SPECIFIED | strategy-decision.json; A§F/H; JOB_LIST at creation contract, source/managed evidence only. |
| S16BR2-07 | Strategy B analyzed | DESIGN_SPECIFIED | A§G/I; legacy normal cleanup model vs unresolved hard-crash gap; native path forbidden. |
| S16BR2-08 | Pre-assignment gap identified | SOURCE_VERIFIED | AtomicProtocol.Create atomic flag vs legacy-assign; P03/P10/F13; separate post-create receipt window F26. |
| S16BR2-09 | Atomic job-list capability assessed | SOURCE_VERIFIED | Official Windows docs/header enum13/input0x20000; NativeAtomicPlatform.Create; no native invocation. |
| S16BR2-10 | STARTUPINFOEX interop | STATIC_TEST_VERIFIED | NativeDeclarations.cs:StartupEx; A02 size112, pointer offset104; basic cb set to extended size in dormant code. |
| S16BR2-11 | Attribute-list lifecycle | STATIC_TEST_VERIFIED | A01/A06/A07/F03/F04; native source initialize/update/delete/free ordering; native API NOT RUN. |
| S16BR2-12 | Pointer/structure layout | STATIC_TEST_VERIFIED | A02–A04/priorX05; x64 IntPtr/UIntPtr, ProcessInfo24, ExtendedLimits144. |
| S16BR2-13 | Private Job Object creation | SOURCE_VERIFIED | NativeAtomicPlatform.Step create-job uses NULL unnamed job; guarded before API; actual creation NOT RUN. |
| S16BR2-14 | Job limit configuration | STATIC_TEST_VERIFIED | LaunchSpec.LimitFlags0x2008, active limit1; J09/F02; native set/query NOT RUN. |
| S16BR2-15 | Inheritance prevention | STATIC_TEST_VERIFIED | A08/F20 and false bInheritHandles; source checks GetHandleInformation; actual child inheritance NOT RUN. |
| S16BR2-16 | Original process custody | STATIC_TEST_VERIFIED | OriginalCapability; P02/P05/P06/F06/F26; missing-capability native recovery not complete. |
| S16BR2-17 | Original thread custody | STATIC_TEST_VERIFIED | OriginalCapability.ThreadOpen; F07; native post-create recovery remains incomplete. |
| S16BR2-18 | Suspended handling | STATIC_TEST_VERIFIED | CreationFlags/A09/P04; fake Create receipt; actual thread state NOT RUN. |
| S16BR2-19 | No unauthorized resume | STATIC_TEST_VERIFIED | A10/P04/F08–F13; resume callback absent after failed scope/identity; native guard denies all. |
| S16BR2-20 | Identity correlation | STATIC_TEST_VERIFIED | P05/P06/F11/F12/F24; invocation/token/image/digest/creation/generation; no actual OS identity. |
| S16BR2-21 | Membership verification | STATIC_TEST_VERIFIED | Unchanged Core.Membership; priorM01–M15; AtomicProtocol exact singleton/every-observed check. |
| S16BR2-22 | Truncation handling | STATIC_TEST_VERIFIED | PriorM03/M04/M14 and R2-F09/J03; incomplete data cannot authorize resume/group action. |
| S16BR2-23 | Unexpected membership rejection | STATIC_TEST_VERIFIED | R2-F10/J02/J08; no group termination or last-close; incomplete lifetime is separately blocked. |
| S16BR2-24 | Pre-assignment cleanup design | DESIGN_SPECIFIED | P03/P04/X03 fake original-only cleanup without job-membership requirement; no crash safety claim. |
| S16BR2-25 | Post-assignment cleanup design | DESIGN_SPECIFIED | AtomicProtocol normal path/request/wait/empty/close; unknown/partial native lifetime unresolved; A§N/S. |
| S16BR2-26 | Original-handle termination design | STATIC_TEST_VERIFIED | P02–P09/F15/X03; capability reference/token/creation/phase; no OpenProcess/PID fallback. |
| S16BR2-27 | Targeted job termination design | STATIC_TEST_VERIFIED | J01–J08/F16; exact scope before group request; no real TerminateJobObject call. |
| S16BR2-28 | Independent exit observation | STATIC_TEST_VERIFIED | ProvesExit/WaitPolicy; P07–P09/J04/J07/F17/F18/F22/X04; fake waits not OS receipts. |
| S16BR2-29 | KILL_ON_JOB_CLOSE semantics | SOURCE_VERIFIED | Official BasicLimitInformation docs; A§K/O; retained handle death/unknown-scope problem not solved by CloseHandle. |
| S16BR2-30 | Supervisor crash analysis | DESIGN_SPECIFIED | supervisor-crash-model.json C01–C20; A§O; every case NOT RUNTIME VERIFIED. |
| S16BR2-31 | No unbounded wait | SOURCE_VERIFIED | Native Wait5000/READY5000/operation25000; fixture secondary30000, never executed; no syscall-preemption guarantee. |
| S16BR2-32 | Fail-closed orchestration | STATIC_TEST_VERIFIED | Copied GateEngine; R2-O01–O07/F23; failed mandatory review blocks Test1/Test2. |
| S16BR2-33 | Negative preservation | STATIC_TEST_VERIFIED | All84 prior assertions rerun,17 LEGACY checks unchanged; source/baseline + prior84-run3.json. |
| S16BR2-34 | Fault injection | STATIC_TEST_VERIFIED | New R2-F01–F26 allPASS; plus18 prior faults; fake providers only. |
| S16BR2-35 | Local C# build | STATIC_TEST_VERIFIED | build1/2/3.json: three exit0/zero warnings; source/ref/argv hashes; repair budget2/2. |
| S16BR2-36 | Static tests | STATIC_TEST_VERIFIED | r2-run3.json:152PASS,0FAIL/SKIP/TIMEOUT; prior84+new68; test3-gate.json. |
| S16BR2-37 | Independent safety review | INCONCLUSIVE | independent-safety-review-final.json:20questions, native lifetime/partial-initialization gaps remain. |
| S16BR2-38 | Runtime feasibility decision | BLOCKED | runtime/feasibility.json:HOST_ONLY_RUNTIME_NOT_AUTHORIZED; final native denial proof; no override. |
| S16BR2-39 | Host-only Test1 | NOT RUN | 0attempts; no job/process/suspended cleanup observations. |
| S16BR2-40 | Host-only Test2 | NOT RUN | 0attempts; predecessor Test1 PASS absent; no retry. |
| S16BR2-41 | Runtime membership | NOT VERIFIED | No live job query or bounded target; static snapshot vectors not runtime evidence. |
| S16BR2-42 | Runtime original handle | NOT VERIFIED | No OS original target handle; capability records fake only. |
| S16BR2-43 | Runtime cleanup observation | NOT VERIFIED | No real terminate/last-close action; resource recovery still incomplete. |
| S16BR2-44 | Runtime exit confirmation | NOT VERIFIED | No target exit receipt; no CLEANUP_CONFIRMED claim. |
| S16BR2-45 | No unrelated target affected | SOURCE_VERIFIED | R2 scoped actions: native guard before APIs, target0/control calls0; not historical impact attestation. |
| S16BR2-46 | All test processes accounted | NOT RUN | Synthetic target0; compiler/managed harness completion distinct; no vacuous runtime exit PASS. |
| S16BR2-47 | No MXC | SOURCE_VERIFIED | MXC0; no Codex invocation; missing candidate neither restored nor substituted. |
| S16BR2-48 | No app-server | SOURCE_VERIFIED | No app-server entry, command, integration or provider operation. |
| S16BR2-49 | No real worker | SOURCE_VERIFIED | No worker launch or production wiring; readiness remains BLOCKED. |
| S16BR2-50 | No production DB migration | SOURCE_VERIFIED | No SQLite connection/migration; existing project authority/startup files unchanged. |
| S16BR2-51 | No production source changes | SOURCE_VERIFIED | AI417 original hashes unchanged; only two R2 reports added; initial oldR untracked work retained. |
| S16BR2-52 | No Windows security modification | SOURCE_VERIFIED | No ACL/Defender/firewall/UAC/registry/PATH/service/task/elevation change; no native job created. |
| S16BR2-53 | No paid API/inference | SOURCE_VERIFIED | No auth/provider/inference/credit fallback call; research network separate. |
| S16BR2-54 | Source integrity | SOURCE_VERIFIED | Final scoped comparisons AI417, R54, B79, Codex50, Hermes647, fixture2124; missing45 explicitly excluded. |
| S16BR2-55 | Artifact inventory | SOURCE_VERIFIED | inventory/artifact-inventory.json hashes all other current files, excludes itself; final-audit.json. |
| S16BR2-56 | Host-crash runtime cleanup | NOT VERIFIED | No deliberate crash/orphan test; source last-close semantics not runtime proof. |
| S16BR2-57 | MXC nested-job compatibility | NOT RUN | MXC forbidden; pinned candidate baseline unavailable; no compatibility promotion. |
| S16BR2-58 | Arbitrary descendants | NOT VERIFIED | Fixed one-target design only, no descendant execution; limit1 not universal hostile containment. |
| S16BR2-59 | Production supervisor | BLOCKED | No native-safe complete recovery or backend integration; test-only source. |
| S16BR2-60 | Physical output fencing | NOT VERIFIED | No production staging/publication/effects fencing; OS exit would not roll back side effects. |
| S16BR2-61 | Credential custody | NOT VERIFIED | No real credentials/authentication used or production custody proof. |
| S16BR2-62 | Subscription entitlement | NOT VERIFIED | No account/subscription eligibility check; CLI installation is not entitlement. |
| S16BR2-63 | Included-only billing | NOT VERIFIED | No enforced billing boundary/purchased-credit fallback test; zero spend not enforcement. |
| S16BR2-64 | Real coding worker readiness | BLOCKED | Critical host-native/MXC/supervisor/effects/account gaps; no S16C/S17/worker. |

## 2. Checkpoint and precise source mapping

| Source | Main responsibilities and gate ranges |
|---|---|
| source/Core.cs:28 |Unchanged membership parser/observation →21–23. |
| source/Core.cs:173 |Copied sticky GateEngine →19,32–34,38–40. |
| source/AtomicProtocol.cs:7 |LaunchSpec constants/identity →09,14–15,18. |
| source/AtomicProtocol.cs:14 |OriginalCapability/ProvesExit →16–20,24,26,28. |
| source/AtomicProtocol.cs:36 |Unconditional RuntimeAuthority deny →37–40,45–49. |
| source/AtomicProtocol.cs:41 |WaitPolicy →28,31; raw wait handling, no fabricated skipped API event. |
| source/AtomicProtocol.cs:45 |Provider-driven ordering, cleanup/failure receipts →11,18–28,32. |
| source/NativeDeclarations.cs:20 |StartupEx and native ABI declarations →09–12. |
| source/NativeAtomicPlatform.cs:16 |Dormant atomic native wiring; per-entry deny first →09–31; **not callable runtime capability**. |
| source/SyntheticFixture.cs |Fixed READY source/secondary expiry, compiled into harness but no target exe emitted/started. |
| source/LegacyRegression.cs |Original17 checks retained →33. |
| static-tests/PriorTests.cs |Full previous84 assertions, root/output names only changed →33,36. |
| static-tests/R2Tests.cs |A10/P10/J10/O8/F26/X4 new assertions →10–36. |

Native wrappers do not become verified APIs because declarations compile. No source/test production changes. All9 compilation inputs have exact hashes in build3.json/build3-gate.json and A§Q.

## 3. Actual evidence and levels

R2-A checkpoint.json verifies source/previous suite/manifests before bridge writes. Strategy record is DESIGN_SPECIFIED. Native source is inspected but denied. Static suite uses FakeQuery/FakeControl/AtomicFake. Destructive faults never create live processes.

Reflection-only native-denial-proof-final.json verifies the compiled unconditional throw and seven native operational method entries. It does not invoke native methods or prove an eligible runtime actuator. No separate human/sub-agent audit is claimed: independent means a second source/evidence review pass independent of the suite's PASS flag.

## 4. Static test and build results

| Run | Static suite | Build | Change |
|---|---|---|---|
| Initial |150PASS |exit0,zero warnings |84 previous +66 new |
| Repair1 |151PASS |exit0,zero warnings |F26 post-success/pre-capability creation accounting |
| Repair2 final |152PASS |exit0,zero warnings |X04 wait/exit-code receipt correctness |

Final84+10A+10P+10J+8O+26F+4X=152. Actual suite FAIL/SKIP/TIMEOUT0. Injected timeout is expected rejection. Three repeated executions do not create453 unique tests.

Existing compiler/framework only; no restore/install/download. All argv/reference/source/output hashes retained. Two focused static repair cycles used from ceiling2; source/test/binary states cycle0/cycle1 preserved. No hidden failed run or native retry.

## 5. New fault injection matrix

| Fault | Injection | Expected managed evidence |
|---|---|---|
| F01 |Job creation fails |JOB_CREATE_FAILED, no target |
| F02 |Limits fail |LIMIT_CONFIG_FAILED, no target |
| F03 |Attribute init fails |ATTRIBUTE_INIT_FAILED, no target |
| F04 |JOB_LIST update fails |JOB_LIST_UPDATE_FAILED, no target |
| F05 |Process creation fails |PROCESS_CREATE_FAILED, no fabricated exit |
| F06 |Original process handle absent |ORIGINAL_PROCESS_UNAVAILABLE, no resume/PASS |
| F07 |Original thread absent |ORIGINAL_THREAD_UNAVAILABLE, no resume/PASS |
| F08 |Membership API fails |MEMBERSHIP_UNVERIFIED, no group action |
| F09 |Membership partial |MEMBERSHIP_UNVERIFIED, no complete-scope claim |
| F10 |Unexpected member |MEMBERSHIP_UNVERIFIED, no job close |
| F11 |Identity mismatch |IDENTITY_OR_CREATION_MISMATCH, no resume |
| F12 |Creation mismatch |IDENTITY_OR_CREATION_MISMATCH, no identity-based exit fiction |
| F13 |Legacy assignment fails |LEGACY_ASSIGN_FAILED; only matching original-handle modeled cleanup |
| F14 |Resume fails |RESUME_FAILED preserved |
| F15 |TerminateProcess fails |TERMINATION_REJECTED; no retry/exit claim |
| F16 |TerminateJobObject fails |TERMINATION_REJECTED; no retry/exit claim |
| F17 |Wait timeout |EXIT_UNVERIFIED, no false cleanup |
| F18 |Wait failed |EXIT_UNVERIFIED, no false cleanup |
| F19 |Close fails |THREAD_CLOSE_FAILED retained |
| F20 |Inherited handle |UNEXPECTED_INHERITANCE, no creation |
| F21 |Job owner mismatch |JOB_OWNER_MISMATCH, no creation |
| F22 |Missing exit receipt |EXIT_UNVERIFIED |
| F23 |Failed predecessor then next request |Downstream callback count0 |
| F24 |Historical PID identity mismatch |No original exit/authority inferred |
| F25 |Missing candidate |No substitute/restore/execute |
| F26 |Create succeeds before capability failure |Created=true, no resume/false exit/empty-job close |

All26PASS; first25 mandatory cases retained. Per-case actual result fields, failure, phase, fake receipts, operations, modeled create attempts and zero native count are in static-tests/r2-run3.json. Model errors are not new OS incidents.

## 6. Failure details and remaining safety evidence

Mandatory gaps are not converted to SKIP/PASS:

- Unknown membership prevents legitimate group termination/last-handle close. Retaining kill-on-close handles indefinitely is not cleanup; eventual supervisor exit also closes them.
- Missing original process/thread handles or post-create identity receipt failure lacks a completed safe native resource-disposition protocol.
- ActiveProcessLimit1 constrains simultaneous membership; it is not a complete historical identity/admission proof.
- Documented atomic creation semantics/layout tests do not prove local native assignment, inheritance, wait, or exit behavior.
- Native operation deadlines are source checks/finite waits, not a verified supervisor-crash deadline.

These are source/runtime capability gaps, not live residuals created by R2. Native APIs are denied before entry. Independent review stays INCONCLUSIVE, so Test1 cannot run.

## 7. Unverified limitations and strategies

A supplies JOB_LIST during CreateProcessW and removes the separate assignment call in the selected contract. B leaves an unassigned suspended-process hard-crash window and is not runtime eligible.

C01–C20 crash cases appear in A§O and supervisor-crash-model.json, with resources/boundary/live-user-code/allowed/prohibited cleanup/evidence/outcome/runtime status. Every crash case is NOT RUNTIME VERIFIED. No deliberate crash-orphan experiment, foreign handle duplication, hostile descendants or breakaway trial.

No STATUS or fake receipt can authorize native execution: RuntimeAuthority.DemandNative is unconditional in the final binary. Removing that guard requires completing and reviewing the missing safety protocol, not editing a JSON PASS field.

## 8. Runtime launch count and prerequisites

| Quantity | Ceiling | Actual |
|---|---:|---:|
| Synthetic target creations |2 |0 |
| Concurrent targets |1 |0 |
| Target-created descendants |0 |0 |
| Detached targets |0 |0 |
| Native private jobs |One per target invocation |0 |
| MXC invocations |0 |0 |
| Runtime retries after failure |0 |0 |

Runtime feasibility HOST_ONLY_RUNTIME_NOT_AUTHORIZED. Test1 NOT RUN; Test2 NOT RUN because Test1 has no PASS. Setup/membership/READY/exit/final accounting planned5s each; no native timing result. Compiler/static harness invocations completed directly and do not count as the two synthetic target experiments.

## 9. Process/handle/exit accounting and invariants

Zero new original target/thread/job control handles, terminate requests, last-job-handle closes or OS target exit receipts. Managed fake tokens must not be consumed by production authority services. Zero target is not a vacuous HOST_ONLY_VERIFIED exit result.

| Runtime invariant | Evidence level in R2 |
|---|---|
| I01 atomic creation |NOT RUN |
| I02 target identity |NOT RUN |
| I03 original handle retained |NOT RUN |
| I04 suspended condition |NOT RUN |
| I05 membership before resume |NOT RUN |
| I06 no unauthorized resume |STATIC_TEST_VERIFIED only |
| I07 no descendants |NOT RUN |
| I08 no unexplained member |NOT RUN |
| I09 owned-scope request |NOT RUN |
| I10 actual API result |NOT RUN |
| I11 independent exit |NOT RUN |
| I12 no PID-only kill |SOURCE_VERIFIED |
| I13 no process-name kill |SOURCE_VERIFIED |
| I14 no inherited handles |NOT RUN |
| I15 actual handle accounting |NOT RUN |
| I16 no unrelated runtime target |NOT RUN; no target created |
| I17 no false cleanup |STATIC_TEST_VERIFIED only |
| I18 no retry after mandatory fail |STATIC_TEST_VERIFIED |
| I19 no MXC |SOURCE_VERIFIED |
| I20 no production integration |SOURCE_VERIFIED |

Machine-readable records: evidence/runtime/invariants.json. No API success/CloseHandle/PID disappearance substitutes for observed original-process exit.

## 10. Historical inventories and working-tree preservation

417 current AI OFFICE baseline files unchanged; only the two R2 reports added, final419. Initial status already contained the two S16BR reports as untracked; those were preserved, not committed/cleaned/reclassified as R2 changes.

Full snapshots protect S16BR54, S16B79, installed Codex50, Hermes647 tracked and16 historical fixture roots/2124 accessible files. Reparse metadata compared without traversal. General AI snapshot excludes node_modules/.git; package/fixture/evidence scopes are separately explicit. No whole-OS/global-process/whole-credential checksum audit.

Exact path reconciliation confirms same45 S4 missing files as the S16BR incident; none newly missing, changed, added, or restored. Old2169 vs currently2124 is not described as2169 unchanged. PIDs23376/23644 remain unresolved; numeric absence is not historical exit.

## 11. MXC blocker

MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE: old pinned0.164.0 executable absent. Active0.162.1 is not equivalent or substituted. No repair/download/extraction/install/execute. Host-only denial here is independently caused by native safety gaps, not missing Codex.

No MXC nested-job/owned-internal-job/helper/termination evidence. No S16C or S17 execution.

## 12. Production worker blocker

Native-safe complete containment/cleanup/identity/custody remains incomplete. Host crash, arbitrary descendants, physical output fencing, app-server/approvals, credential custody, subscription entitlement and included-only billing are not proven by managed PASS.

No source/database/backend wiring, auth/credentials/inference/spend or worker activation. Original S12–S15 conflict/generation/completeScope/effects/retry rules remain untouched. Zero spend is not included-only enforcement.

## 13. Artifact inventory and final audit

inventory/artifact-inventory.json records all other disposable regular files with relative path/bytes/SHA256 and excludes itself. evidence/audit/final-audit.json binds final binary/source hashes, tests, document checks, baseline comparisons, runtime denial, classifications and limits.

All source/test/build/run states retained; no historical binary executed or artifact normalized/deleted. Three compiler outputs and three suites are clearly separated. No new dependency, service, scheduled task, elevation, global PATH/security/ACL/firewall/Defender/UAC/registry change, WSL or broad cleanup.

Requested official-document research used network. No test/provider/network experiment or whole-host zero-network attestation. No routine approval block from a skill/plugin was introduced.

## 14. Final decision and one next recommendation

**PARTIAL_PASS_STOPPED.** All static assertions passed, but a mandatory safety prerequisite is incomplete. This does not satisfy design/code-complete STATIC_PASS_RUNTIME_BLOCKED or runtime HOST_ONLY_PASS criteria.

Exactly one recommendation: **complete the private-job admission/custody and failure-lifetime disposition for unknown membership/missing original-handle evidence before enabling the atomic native adapter**. Preserve this concrete blocker rather than adding roadmap stages to rename it.

Current authorized remediation/reporting stops here. No routine permission is pending; any separately assigned continuation must not simply bypass the native denial guard or proceed to MXC/app-server/worker.

**M02-02S16B-R2 PARTIAL — MANDATORY CONTAINMENT OR CLEANUP EVIDENCE INCOMPLETE — REAL WORKER BLOCKED.**

