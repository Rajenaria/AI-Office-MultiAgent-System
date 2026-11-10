# M02-02S16B-R6W — Security Gate Matrix

2026-11-05. **STATIC_PASS_RUNTIME_BLOCKED**, internal review **SAFETY_REVIEW_INCONCLUSIVE**, runtime **R6W_RUNTIME_NOT_AUTHORIZED**. Companion [watchdog lifecycle report](M02-02S16B_R6W_WATCHDOG_LIFECYCLE_REPORT.md). Gate L/M **NOT RUN**, S **BLOCKED**.

## 1. R6W-01 through R6W-69

Allowed evidence statuses are kept separate from final lifecycle classifications. SOURCE_VERIFIED/STATIC_TEST_VERIFIED do not imply HOST_ONLY_OS_VERIFIED. No mandatory failed invariant is overridden by fake success or build exit0.

| Gate | Requirement | Status | Evidence | Actual result / limitation | Runtime blocked | Next action |
|---|---|---|---|---|---|---|
| R6W-01 | R6 checkpoint verified | SOURCE_VERIFIED | checkpoint/baseline + final-integrity | R6 manifest/binary and reports verified; retain STATIC_ONLY baseline | false | Preserve scoped source/test/provenance; no production activation |
| R6W-02 | Historical evidence preserved | SOURCE_VERIFIED | checkpoint/baseline + final-integrity | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-03 | Reporter source reviewed | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-04 | Reporter executable provenance | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-05 | Watchdog source reviewed | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-06 | Watchdog executable provenance | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-07 | No quarantined binary execution | NOT RUN | R6W command record; runtime/not-run.json | No such executable/provider action in this milestone | false | Preserve scoped source/test/provenance; no production activation |
| R6W-08 | Fixed reporter launch target | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Zero-argument entry builds fixed reporter path and fixed quoted no-argument command; no shell/PID/name interface | false | Preserve scoped source/test/provenance; no production activation |
| R6W-09 | No arbitrary executable path | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Zero-argument entry builds fixed reporter path and fixed quoted no-argument command; no shell/PID/name interface | false | Preserve scoped source/test/provenance; no production activation |
| R6W-10 | No shell-based launch | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Zero-argument entry builds fixed reporter path and fixed quoted no-argument command; no shell/PID/name interface | false | Preserve scoped source/test/provenance; no production activation |
| R6W-11 | Original process handle custody | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Original PROCESS_INFORMATION stored before identity queries; one-shot owned release; no PID reopen | false | Preserve scoped source/test/provenance; no production activation |
| R6W-12 | Original thread handle custody | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Original PROCESS_INFORMATION stored before identity queries; one-shot owned release; no PID reopen | false | Preserve scoped source/test/provenance; no production activation |
| R6W-13 | Process identity correlation | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-14 | Invocation identity | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Fresh nonce and generation bound to fixed sources; stale output rejected | false | Preserve scoped source/test/provenance; no production activation |
| R6W-15 | Executable hash verification | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-16 | Handle inheritance restriction | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | bInheritHandles=false; intended original-handle flags checked; actual flags NOT RUN | false | Preserve scoped source/test/provenance; no production activation |
| R6W-17 | No arbitrary OpenProcess kill | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Watchdog has no OpenProcess, PID/name-wide cleanup or taskkill fallback | false | Preserve scoped source/test/provenance; no production activation |
| R6W-18 | No PID-only termination | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Watchdog has no OpenProcess, PID/name-wide cleanup or taskkill fallback | false | Preserve scoped source/test/provenance; no production activation |
| R6W-19 | No process-name-wide termination | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Watchdog has no OpenProcess, PID/name-wide cleanup or taskkill fallback | false | Preserve scoped source/test/provenance; no production activation |
| R6W-20 | Targeted termination authorization | DESIGN_SPECIFIED | Owner R6W authorization + Authority/Controller | At most one TerminateProcess(original) conditionally authorized after verified identity; actual request0 | false | Preserve scoped source/test/provenance; no production activation |
| R6W-21 | Finite wait | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Source wait allowlist0/5000/20000ms, no INFINITE; no absolute OS-progress promise | false | Preserve scoped source/test/provenance; no production activation |
| R6W-22 | Timeout classification | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-23 | Termination request classification | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-24 | Independent exit observation | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-25 | Exit-code observation | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-26 | Failed-wait classification | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-27 | Handle release | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-28 | Double close prevention | STATIC_TEST_VERIFIED | tests/static/results-final.json | Managed fake/model invariant verified, not an OS lifecycle receipt | false | Preserve scoped source/test/provenance; no production activation |
| R6W-29 | Watchdog crash analysis | DESIGN_SPECIFIED | crash-matrix C01-C12; fake crash tests | 12 windows assessed; ordinary parent handle close cannot enforce reporter death | false | Preserve scoped source/test/provenance; no production activation |
| R6W-30 | Residual reporter risk assessed | INCONCLUSIVE | internal-review IR21; C02-C09; optional Jc design | Residual lifetime after watchdog crash not defensible under retained contract | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-31 | No silent safety-contract relaxation | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No launch after review INCONCLUSIVE; independent guarantee not silently waived | false | Preserve scoped source/test/provenance; no production activation |
| R6W-32 | No unauthorized containment job | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No watchdog job imports or creation; additional Jc strictly design-only and unauthorized | false | Preserve scoped source/test/provenance; no production activation |
| R6W-33 | Reporter native API allowlist | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | Reporter12 imports/625 IL references; unchanged metadata capability surface | false | Preserve scoped source/test/provenance; no production activation |
| R6W-34 | Reporter process creation prohibited | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-35 | Reporter termination API prohibited | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-36 | At most one reporter J0 | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-37 | No job assignment | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-38 | No security mutation | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-39 | No privilege escalation | SOURCE_VERIFIED | source + evidence/source-review/api-il-audit.json | No prohibited capability in reporter; watchdog limited to original reporter lifecycle, no security/elevation mutation | false | Preserve scoped source/test/provenance; no production activation |
| R6W-40 | Static tests | STATIC_TEST_VERIFIED | tests/static/results-final.json | 42 PASS:38 watchdog tests +4 affected reporter regressions | false | Preserve scoped source/test/provenance; no production activation |
| R6W-41 | Fault-injection tests | STATIC_TEST_VERIFIED | tests/fault-injection/results-final.json | 28 fake-provider fault/crash scenarios PASS; no native control | false | Preserve scoped source/test/provenance; no production activation |
| R6W-42 | Local compiler build | SOURCE_VERIFIED | build-provenance + reporter-copy + source review | Reporter/watchdog/test DLL compile exit0, warning0; existing compiler | false | Preserve scoped source/test/provenance; no production activation |
| R6W-43 | Internal adversarial review | INCONCLUSIVE | internal-review.json 25 questions | SAFETY_REVIEW_INCONCLUSIVE, IR21 mandatory blocker | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-44 | Runtime preflight | BLOCKED | prelaunch-decision.json | R6W_RUNTIME_NOT_AUTHORIZED; no runtime activation artifacts | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-45 | Watchdog runtime invocation | NOT RUN | runtime/not-run.json | 0 watchdog runtime sessions | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-46 | Reporter runtime invocation | NOT RUN | runtime/not-run.json | 0 reporter runtime invocations/creations | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-47 | Actual process identity | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-48 | Actual process exit | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-49 | Actual timeout/termination result | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-50 | J0 owner/DACL metadata | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-51 | J0 handle flags | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-52 | J0 empty membership | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-53 | Reporter token metadata | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-54 | Reporter process metadata | NOT RUN | runtime/not-run.json | No actual OS process/metadata/wait/termination/exit observation | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-55 | Resource accounting | NOT RUN | runtime/not-run.json | 0 original runtime handles/query buffers acquired; no runtime closure claim | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-56 | Gate L | NOT RUN | runtime/not-run.json | Gate L NOT RUN | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-57 | Gate M | NOT RUN | runtime/not-run.json | Gate M NOT RUN | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-58 | Gate S | BLOCKED | retained Gate S; crash analysis and not-run decision | Gate S BLOCKED; tests do not prove worker security | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-59 | No MXC | NOT RUN | R6W command record; runtime/not-run.json | No such executable/provider action in this milestone | false | Preserve scoped source/test/provenance; no production activation |
| R6W-60 | No app-server | NOT RUN | R6W command record; runtime/not-run.json | No such executable/provider action in this milestone | false | Preserve scoped source/test/provenance; no production activation |
| R6W-61 | No real worker | NOT RUN | R6W command record; runtime/not-run.json | No such executable/provider action in this milestone | false | Preserve scoped source/test/provenance; no production activation |
| R6W-62 | No production source/DB change | SOURCE_VERIFIED | checkpoint/baseline + final-integrity | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-63 | No inference/paid API | NOT RUN | R6W command record; runtime/not-run.json | No such executable/provider action in this milestone | false | Preserve scoped source/test/provenance; no production activation |
| R6W-64 | Source/system integrity | SOURCE_VERIFIED | checkpoint/baseline + final-integrity | Source/hash binding and scoped integrity evidence | false | Preserve scoped source/test/provenance; no production activation |
| R6W-65 | Historical PID uncertainty | HISTORICAL_ONLY | prior checkpoints + W0 | 23376/23644 HISTORICAL_PROCESS_IDENTITY_UNRESOLVED, not queried or controlled | false | Preserve scoped source/test/provenance; no production activation |
| R6W-66 | Missing pinned Codex candidate | SOURCE_VERIFIED | checkpoint/baseline + final-integrity | MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; no restore/substitute | false | Preserve scoped source/test/provenance; no production activation |
| R6W-67 | Supervisor crash recovery | BLOCKED | retained Gate S; crash analysis and not-run decision | No supervisor-crash/process-tree/production-worker acceptance | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-68 | Process-tree cleanup | BLOCKED | retained Gate S; crash analysis and not-run decision | No supervisor-crash/process-tree/production-worker acceptance | true | Owner review of specific additional Jc containment design; no automatic runtime |
| R6W-69 | Production worker readiness | BLOCKED | retained Gate S; crash analysis and not-run decision | No supervisor-crash/process-tree/production-worker acceptance | true | Owner review of specific additional Jc containment design; no automatic runtime |


## 2. Pipeline decisions and stop gates

| Stage | Inputs | Preconditions | Actions | Tests | Evidence | Decision | Stop conditions |
|---|---|---|---|---|---|---|---|
| W0 | R6/R5 reports, original source, inventories | Read/checkpoint scope | Hash/baseline/compile availability; copy reviewed source, fresh nonce | R6 manifest and guard comparisons | evidence/checkpoint | PASS | Any identity/hash/scope drift |
| W1 | Source checkpoint and scope | W0 PASS | Design original-handle controller, deadlines, crash and optional Jc analysis | C01-C12 / policy model | source-review design artifacts | DESIGN_COMPLETE | Do not assume crash independence |
| W2 | Fixed design and reviewed reporter | W0/W1 scope | New watchdog + minimal nonce-only copy; build disposable components | Compiler warnaserror | build-provenance | PASS | Unreviewed capability/production change |
| W3 | Built components | Source/build available | Pure fake-provider tests and role-separated API/IL audit | 42 static +28 faults | tests + API-IL audit | PASS | Any failed mandatory invariant;max2 repair cycles |
| W4 | Source/tests/API/crash evidence | W3 PASS | Distinct internal adversarial review | 25 challenges | internal-review.json | INCONCLUSIVE | IR21 residual lifetime not defensible |
| W5 | W4 result and prelaunch conditions | W4 PASS required | Evaluate gate; issue no activation artifact | Negative authorization check | prelaunch-decision.json | BLOCKED | Review not PASS / additional Jc unauthorized |
| W6 | Runtime permit | All mandatory safety gates PASS | No runtime action taken | NOT RUN | runtime/not-run.json | NOT RUN | No launch without gate; no retries |
| W7 | All artifacts and baseline | Allowed closeout even when runtime blocked | Exactly2 reports + final hashes/integrity | Final scoped comparisons | final-integrity + manifest | FINAL_AUDIT | Any drift/private data/unsupported observation |


W0-W3 completed. W4 IR21 remains INCONCLUSIVE; W5 operational gate is BLOCKED and W6 NOT RUN. W7 closeout/integrity is allowed regardless of blocked runtime. No activation files issued and no old blocked reporter trial run.

## 3. Source/build provenance and capabilities

| Artifact | SHA256 |
|---|---|
| Existing compiler | ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3 |
| reporter/source/Model.cs | 597C9B0D94F6EE7855B78BA971CCF683CED7DCCB57CBAEE7F4C23AB634157791 |
| reporter/source/NativeProvider.cs | 0584F45DE80F009CAA7A0895FFBC3EF4D78B5D949D734AB3757945EF9B1BD6F5 |
| reporter/source/Program.cs | 74C18062428D6CDE5547E9B8184F510F7DBC34A71EA61CAA6C3803DB46B17AD9 |
| watchdog/source/Lifecycle.cs | 9D23C9CB6F8EBE2537EF2E523ACF62B6CB8737D14652E2BF193FFEADE2EB08FC |
| watchdog/source/ReporterReceipt.cs | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| watchdog/source/NativeHost.cs | 37ECF77C39EE18FF968AA2C1C5D27808292EF19DD20D473D705E07D3954F5246 |
| watchdog/source/WatchdogProgram.cs | BE378C6FE37D84626BD3E70CB862EC78330770B93199BF3E58E4A21CEA2158A3 |
| Reporter exe | 221520634B65CCF72CC4C782965BE5BFE707F9A64237C0A81484B029BB158DA0 |
| Watchdog exe | 72C5CDD813851E3CD5033EDA09522188818ECB9F4278E6CE0E69B0C28CB483DD |
| Reporter source manifest | 2E06B294658581B51156C0B8DF1611049A276CB9766E633204D1076EDFE2D06C |
| WatchdogTests.cs | 9FF125D7A09EDFF7A1F14935F6B109623A46AEED16A76F036CC5D970F7651C1A |
| Test DLL | 8DA5FDA29075BFDFD3700E2F877162F4CE0297EE059239EDAD975C933A81BC8A |


Reporter Model/NativeProvider are byte-identical to R6; Program changes fresh nonce only. Original R6 executable never launched. Local Microsoft Framework64 compiler used without dependencies; reporter build1, watchdog builds2 (initial/final), test DLL build1; warning0/exit0. Initial watchdog image/source/tests/audit retained. Test DLL has no process entry.

Role-separated final source/IL: reporter12 imports/625 method references; watchdog10/979, no forbidden findings/calli. No watchdog OpenProcess, job APIs, shell, arbitrary path/PID/name interface. Source Main accepts zero args and internally chooses only reviewed reporter path; file hash lock and original-handle PID/creation/image checks bind identity. GetLongPathNameW is a local read-only normalization query for the fixed image, not arbitrary process inspection. Expected layout104/24/16/60 verified through managed metadata, no native process calls.

Reporter cannot create/terminate/assign/mutate/duplicate/network. Its J0 is unnamed/default-attributes and one-shot, with no member assignment or limits. Watchdog alone has fixed CreateProcessW/TerminateProcess path; cannot create extra Jc. Trusted framework transitive code is not wholly disassembled.

## 4. Actual static tests and fault results

Final **42 PASS /0 FAIL /0 SKIP /0 TIMEOUT**:38 watchdog tests plus4 affected reporter regressions. Historical32 R6 and229 R3 not rerun. Initial and final batches both retained; tests load fresh assemblies only for pure/fake methods, never Main/PInvoke.

| Test | Behavior | Final result |
|---|---|---|
| T01 | Fixed target accepted | PASS |
| T02 | Unknown executable rejected before create | PASS |
| T03 | Hash mismatch rejected | PASS |
| T04 | Creation failure no retry | PASS |
| T05 | Missing original process handle blocks control | PASS |
| T06 | Original handle retained through waits | PASS |
| T07 | Creation identity mismatch | PASS |
| T08 | Owner generation mismatch | PASS |
| T09 | PID reuse cannot authorize termination | PASS |
| T10 | Already exited in timeout race no terminate | PASS |
| T11 | Normal exit independently observed | PASS |
| T12 | Exit code read after signaled | PASS |
| T13 | Missing output does not erase exit or fabricate metadata | PASS |
| T14 | Conflicting nonce output rejected | PASS |
| T15 | Timeout distinct from termination and exit | PASS |
| T16 | WAIT_FAILED cannot become exit | PASS |
| T17 | Targeted termination accepted then wait exit | PASS |
| T18 | Termination failure retained | PASS |
| T19 | Accepted termination not exit proof | PASS |
| T20 | Close failure cannot pass resource gate | PASS |
| T21 | Double close prevented | PASS |
| T22 | Premature original close blocks termination | PASS |
| T23 | No watchdog OpenProcess fallback | PASS |
| T24 | No name-wide killer interface | PASS |
| T25 | No automatic second run | PASS |
| T26 | Crash before creation no reporter residue | PASS |
| T27 | Crash after creation residue remains | PASS |
| T28 | Crash after termination request not cleanup | PASS |
| T29 | Reporter hang can be stopped only by live owned watchdog | PASS |
| T30 | Metadata failed but exit observed | PASS |
| T31 | Zero exit not metadata PASS | PASS |
| T32 | Cleanup cannot PASS without exit | PASS |
| T33 | Watchdog no containment job native capability | PASS |
| T34 | No shell entry | PASS |
| T35 | Reporter no process creation/termination/assignment | PASS |
| T36 | No production integration reference | PASS |
| T37 | Signaled process with exit259 is not relabeled alive | PASS |
| T38 | Wait dependency blocks handle close | PASS |
| R01 | Fresh copied reporter nonce equals watchdog protocol | PASS |
| R02 | Reporter observation scope retained | PASS |
| R03 | Stale reporter nonce rejected by actual receipt parser | PASS |
| R04 | Actual receipt parser requires queries and release not summary alone | PASS |


Final **28 fault-model PASS**, initial28 PASS retained. Independent scenario-specific transition/classification reconciliation28/28 PASS. Full nine-field scenario receipts and actual transition traces are in report O and transition-reconciliation.json. Compact results:

| Fault | Injected model fault | Expected transition | Actual model classification | Termination authorized/requested | Exit observed | Another invocation | Check |
|---|---|---|---|---|---|---|---|
| F01 | CreateFailure | RESOURCE_RELEASE_PENDING | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F02 | MissingHandle | RESOURCE_RELEASE_PENDING | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F03 | IdentityMissing | RESOURCE_RELEASE_PENDING | SECURITY_STOP | false/false | false | false | PASS |
| F04 | IdentityMismatch | RESOURCE_RELEASE_PENDING | SECURITY_STOP | false/false | false | false | PASS |
| F05 | GenerationMismatch | RESOURCE_RELEASE_PENDING | SECURITY_STOP | false/false | false | false | PASS |
| F06 | PidMismatch | RESOURCE_RELEASE_PENDING | SECURITY_STOP | false/false | false | false | PASS |
| F07 | PidReuse | SECURITY_STOP | SECURITY_STOP | false/false | false | false | PASS |
| F08 | WaitFailure | EXIT_STATUS_UNKNOWN | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F09 | RecheckWaitFailure | EXIT_STATUS_UNKNOWN | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F10 | Timeout | TERMINATION_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | true/true | true | false | PASS |
| F11 | TermFailure | EXIT_STATUS_UNKNOWN | RUNTIME_INCONCLUSIVE | true/true | false | false | PASS |
| F12 | TermPending | TERMINATION_WAIT_PENDING | RUNTIME_INCONCLUSIVE | true/true | false | false | PASS |
| F13 | FinalWaitFailure | EXIT_STATUS_UNKNOWN | RUNTIME_INCONCLUSIVE | true/true | false | false | PASS |
| F14 | ExitCodeFailure | REPORTER_EXIT_OBSERVED | RUNTIME_INCONCLUSIVE | false/false | true | false | PASS |
| F15 | OutputMissing | REPORTER_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | false/false | true | false | PASS |
| F16 | OutputConflict | REPORTER_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | false/false | true | false | PASS |
| F17 | EvidenceWriteFailure | TERMINATION_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | true/true | true | false | PASS |
| F18 | OutputException | REPORTER_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | false/false | true | false | PASS |
| F19 | CloseFailure | RESOURCE_RELEASE_PENDING | RUNTIME_INCONCLUSIVE | false/false | true | false | PASS |
| F20 | PrematureClose | SECURITY_STOP | SECURITY_STOP | false/false | false | false | PASS |
| F21 | ReporterHang | TERMINATION_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | true/true | true | false | PASS |
| F22 | UnknownTarget | NOT_STARTED | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F23 | HashMismatch | NOT_STARTED | RUNTIME_INCONCLUSIVE | false/false | false | false | PASS |
| F24 | ReporterReleaseMissing | REPORTER_EXIT_OBSERVED | LIFECYCLE_PASS_METADATA_PARTIAL | false/false | true | false | PASS |
| F25 | WATCHDOG_CRASH_MODEL_ONLY | NO_REPORTER | NO_REPORTER_CREATED | false/false | false | false | PASS |
| F26 | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | INCONCLUSIVE_RESIDUAL_LIFETIME | false/false | false | false | PASS |
| F27 | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | INCONCLUSIVE_RESIDUAL_LIFETIME | false/false | false | false | PASS |
| F28 | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | INCONCLUSIVE_RESIDUAL_LIFETIME | false/false | false | false | PASS |


One focused watchdog source repair captures actual GetLongPathNameW return/error immediately on failure. One verification-helper correction selects SizeOf(Type) rather than wrong object overload; layout assertions unchanged. Total focused corrections2, no third cycle, no assertion weakening. Positive tests do not solve the crash-lifetime requirement.

## 5. Internal adversarial review and actual runtime authorization

**INTERNAL_ADVERSARIAL_REVIEW**, same agent distinct final evidence/source pass, not external/human audit.

| Review | Challenge | Result | Evidence / residual |
|---|---|---|---|
| IR01 | Fixed reviewed reporter launch | PASS | Main zero args, fixed root-relative target, reviewed hash plus file read lock. |
| IR02 | No process-name targeting | PASS | No name search/list/process killer; imports constrained. |
| IR03 | No PID-only termination | PASS | TerminateProcess receives private original process handle only. |
| IR04 | No OpenProcess fallback | PASS | Watchdog imports no OpenProcess; original control capability never reconstructed. |
| IR05 | Original handle custody | PASS | Register before identity query; dependent wait increments/decrements; one-shot close. |
| IR06 | Executable identity | PASS | Fixed binary hash lock and original-handle PID/time/image canonicalization; source/model proof. |
| IR07 | Creation flags reviewed | PASS | 0x08000400 no detached/breakaway/suspend; startup sizes reviewed; this has a crash window. |
| IR08 | Inheritance restricted | PASS | bInheritHandles=false; original process/thread flags queried in intended path; no runtime flags claim. |
| IR09 | Reporter cannot create worker children | PASS | Reporter12-import/625-reference audit; no creation path. |
| IR10 | Reporter cannot terminate | PASS | Reporter lacks termination APIs; watchdog target-only authority separate. |
| IR11 | Reporter at most one empty J0 | PASS | Unchanged Once guard and no assignment/limits. |
| IR12 | No watchdog containment job | PASS | Watchdog10 imports include no job APIs; Jc design only. |
| IR13 | Finite waits | PASS | Only0/5000/20000ms; no infinite wait; source checks and fake waits. |
| IR14 | Timeout distinct from exit | PASS | TIMEOUT_OBSERVED separate; observed exit only signaled result. |
| IR15 | Termination request distinct from exit | PASS | Accepted API has separate state then finite original-handle wait. |
| IR16 | WAIT_FAILED not success | PASS | Failed/unknown wait cannot set ExitObserved; tests cover. |
| IR17 | No fake cleanup after watchdog crash | PASS | Crash model shows residual; never turns model result into OS receipt. |
| IR18 | Unknown identity blocks termination | PASS | Authority.Correlated/Revalidated and original object generation; mismatch tests no term. |
| IR19 | No retry | PASS | Controller/native creation guard and one termination ceiling; static tests. |
| IR20 | Evidence matches source | PASS | Both assembly/source hashes, role-separated API/IL and fake/test labeling. |
| IR21 | Runtime risk contract defensible | INCONCLUSIVE | Narrow trusted reporter reduces impact but does not satisfy retained residual-lifetime requirement if watchdog dies while reporter is blocked (C02-C09). |
| IR22 | Missing independent containment identified | PASS | Additional Jc atomic job design and exact separate authorization documented; not created. |
| IR23 | No silent safety relaxation | PASS | Stop before W5/W6; no acceptance of orphan reporter risk or use of OS-wide progress guarantee as excuse. |
| IR24 | No real worker entry | PASS | Fixed reviewed metadata executable only; no production integration. |
| IR25 | No unrelated process intentional target | PASS | Original launch handle scope/identity/generation; no arbitrary PID/path CLI. |


Source/review/tests match final hashes. Mandatory blocker: original-handle termination depends on a live watchdog. A watchdog crash during/after CreateProcessW can leave the reporter alive while ordinary parent handles close. The retained residual-lifetime contract is not established, even assuming OS otherwise responsive. It is not silently waived because this is a small trusted metadata program.

R6W §15/16/21 requires stop here. **ADDITIONAL_CONTAINMENT_AUTHORIZATION_REQUIRED**. Planned non-elevated runtime context, actual identity/flags/READY/waits/output are NOT RUN; source intentions are not operational verification. No unrelated process inspected for a workaround; no runtime retry or process-name/PID cleanup.

## 6. Actual execution, original-handle and exit evidence

| Runtime resource / observation | Maximum authorized | Actual |
|---|---|---|
| Watchdog sessions | 1 | 0 |
| Reporter launches | 1 | 0 |
| Reporter metadata J0 | 1 | 0 |
| Additional containment job | 0 | 0 |
| Worker/descendants/MXC/inference | 0 | 0 |
| Scoped TerminateProcess requests | At most1 if gates PASS | 0 |
| PID/name/unrelated process kills | 0 | 0 |
| Runtime retries | 0 | 0 |
| Original process/thread handles | One pair if launch | 0 /0 |
| OS waits/exit receipts | Only original handle | NOT RUN |
| Reporter process/token/J0 metadata | One conditional invocation | NOT RUN |


No original runtime process/thread handles acquired; no native wait/timeout/termination/exit code exists. Source retains original creation handles before queries, revalidates handle-key/generation/PID/creation, does zero-time race check, permits at most one original-handle stop, then5s wait. A request return, code0, handle close or missing log cannot prove exit. WAIT_FAILED cannot set ExitObserved. Tests prove managed model invariants only.

Budget guards: one Controller.Run, one NativeHost.Create, one NativeHost.Terminate; fixed0/5000/20000ms waits. No INFINITE, fallback open, taskkill, broad kill or hidden later launch. Actual watchdog and reporter invocation counts both0, not simulated model counters.

## 7. M/J0 metadata and resource accounting

Gate M **NOT RUN**: no actual reporter process SD/owner/DACL, token IL/elevation/privileges/restrictions/AppContainer, J0 descriptor/handle flags/membership/resource receipt. R5 caller metadata is not substituted.

ReporterReceipt parser requires matching nonce/binary/source manifest and original PID/creation;15 successful query records,7 token classes, J0 valid flags/DACL/zero-membership and resource ledger clear. Successful process exit/summary GateM string alone cannot yield metadata PASS. Forced stop lacks verified user-mode finally even if OS exit later observed. GetHandleInformation does not provide a granted mask; no mask dump claimed.

Actual runtime allocations/releases0. Planned watchdog owns original process/thread, environment allocation and image/evidence file resources; reporter owns only self-query/J0 handles and buffers. Borrowed pseudo-handle not closed. Close is one-shot with dependency checks. Process exit, kernel handle closure, object destruction, reporter finally and watchdog resource release remain distinct. Unknown exit never becomes cleanup PASS.

## 8. Watchdog crash windows and independent boundary

Full C01-C12 matrix with identity/owner/resources/OS behavior/evidence/risk/authorization is in report K and crash-matrix.json.

| Crash case | Window | Reporter residual possible | Acceptance | Owner decision |
|---|---|---|---|---|
| C01 | Before reporter creation | false | ACCEPTABLE_NO_REPORTER | false |
| C02 | During CreateProcessW | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C03 | After creation before identity receipt | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C04 | After reporter READY | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C05 | During blocking reporter native call | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C06 | Immediately before termination request | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C07 | Immediately after termination request | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C08 | Before exit observation | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C09 | Watchdog exits while reporter remains alive | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C10 | Original process handle closed prematurely | true | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT | true |
| C11 | Unbounded reporter native operation | true | CONDITIONAL_LIVE_CONTROLLER_ONLY_NOT_CRASH_SAFE | true |
| C12 | OS does not complete termination within5s | true | DOCUMENTED_OS_LIMIT_NOT_WAIVED | true |


C02-C09 share a missing independent residual-lifetime mechanism, not multiple unrelated root blockers. Creation flags/suspension/original handles do not provide parent-death cleanup. No OS crash test or live reporter hang was induced. C12 OS non-progress is documented separately; even Jc would not guarantee teardown by5s.

## 9. Exact additional containment design — not authorized

**ADDITIONAL_CONTAINMENT_AUTHORIZATION_REQUIRED**, design only:

- One new unnamed watchdog-owned containment Jc contains exactly the fixed reporter; watchdog remains outside.
- The reporter's separate empty metadata J0 stays unassigned; future total job ceiling becomes2, current R6W ceiling is0 Jc/1 J0.
- Configure Jc with KILL_ON_JOB_CLOSE and only separately approved fixed limits, no breakaway/silent-breakaway.
- Use STARTUPINFOEX/PROC_THREAD_ATTRIBUTE_JOB_LIST for creation-time admission. No post-create assignment gap; optional CREATE_SUSPENDED/one ResumeThread requires explicit new authority and proof before resume.
- Retain Jc original handle solely in watchdog, noninheritable/no export/dup. Existing external holders/admission/limit tamper assumptions must be resolved before accepting last-close behavior.
- Intended operation rights: SET_ATTRIBUTES/QUERY/ASSIGN_PROCESS and READ_CONTROL where queried; documented broad creation return is not measured minimum-rights mask.
- Review ambient/nested-job compatibility, limits, membership, breakaway, exact original reporter identity and independent exit evidence.
- No TerminateJobObject, arbitrary target, privilege/token/ACL changes or worker. Any deliberate watchdog-crash validation and observer mechanism need separately bounded authorization.

The concrete ordered protocol and residual limitations are in report L and additional-containment-design.json. Last-close trigger is conditional on handle custody; it does not prove immediate OS exit or reporter user-mode release. No additional job/configuration/import was implemented.

## 10. Acceptance L/M/S and remaining blockers

**L NOT RUN, M NOT RUN, S BLOCKED.** Final classification **STATIC_PASS_RUNTIME_BLOCKED**. No lifecycle/metadata PASS or runtime SECURITY_STOP inferred from static outcomes. Source/managed failure tests cannot validate supervisor-crash recovery/process-tree cleanup or production-worker readiness; gates67-69 remain BLOCKED.

Malicious same-user access, existing inherited/duplicated capabilities and physical evidence/control/output fencing remain unverified. Boundary B conditional, no threat-model narrowing. Production supervisor, MXC/nested jobs, credential custody, entitlement and included-only billing unresolved. S16C/S17/real worker remain blocked.

PID23376/23644 remain HISTORICAL_PROCESS_IDENTITY_UNRESOLVED and untouched. Pinned candidate remains MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE, not restored/substituted; original R3 activation/build gates unchanged.

## 11. Source/system integrity

Final scope: **451 existing AI OFFICE files** unchanged; exactly **2 new R6W reports**, final **453 files**. **128 pre-existing Git entries** retained; final **130**. **24 protected roots /2532 files** unchanged, including original R6=30, R5=24, R4=19, R3=67 and installed active-Codex distribution=50. **Hermes3D647 tracked paths/hashes** preserved. Receipts: evidence/audit/final-integrity.json and inventory/manifest.json.

AI snapshot excludes .git/node_modules directories; protected roots fully hashed; Hermes claim covers tracked baseline. No whole-disk/process/syscall/packet attestation. Existing user work was neither reset nor overwritten. Production source/SQLite/registry/state, historical reports/fixtures, S12-S15 and old bridge artifacts unchanged within inspected scope. Candidate remains absent; no restore/substitute. Old R3 activation/build gates remain absent; negative historical review/prelaunch preserved.

Only fresh disposable source/build/test/evidence files and the two reports were written. No old executable, reporter or watchdog runtime session, job, worker, target, assignment, termination, privilege/elevation/security mutation, install/service/task/WSL, credentials/provider auth/inference/paid API or later milestone was run. File/command evidence supports these scoped counts, not machine-wide activity claims.

Official Microsoft documentation was fetched through the web tool as required by §4. There was no host harness/provider/target network request. Thus literal whole-session “no external network” is not claimed. Hashes cover every final evidence file except the manifest itself, plus external report hashes; no circular report/manifest hash.

## 12. One next action and Owner review

Exactly one action: **Owner review and separate authorization of the concrete Jc atomic-containment protocol**, including scope/rights/membership/sole-handle lifetime, any suspend/resume, crash-test budget and independent exit observation. Current R6W explicitly excludes creating/configuring that extra job. No automatic execution, no identical speculative experiment/static-suite rerun.

Official Microsoft reference links are in report P/references.json; they provide semantics, not OS test evidence. Documentation browsing is disclosed separately from zero host harness/provider network activity.

**M02-02S16B-R6W STATIC_PASS — WATCHDOG DESIGN VERIFIED STATICALLY — RUNTIME NOT AUTHORIZED — REAL WORKER BLOCKED.**

