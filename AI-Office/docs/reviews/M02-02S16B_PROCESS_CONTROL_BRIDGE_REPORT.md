# M02-02S16B — Complete Windows Process-Control Bridge Report

Tanggal: 30 Oktober 2026, Asia/Jakarta. Workspace: D:\Rajendra\AI-Projects\AI-Office. Companion: [Process-Control Gate Matrix](M02-02S16B_PROCESS_CONTROL_GATE_MATRIX.md).

S16B_ROOT = C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16b-cdd59800-9766-44bb-9038-c8ccbc201b80

## 1. Executive decision

**BLOCKED — mandatory host-only membership and failure-cleanup gates did not pass. MXC NOT RUN. REAL WORKER BLOCKED.**

Satu disposable C#5/x64 bridge berhasil dikompilasi offline dari source yang ditinjau. H1 singleton launch lulus pada initial dan repair1: original handle identity, suspended assignment-before-resume, normal exit0, empty job dan balanced handle closure. Namun semua tiga parent-child attempts gagal pada exact membership guard. Pada repair1, actual private-job PIDs **[7312,8196,23376,23644]**, expected **[7312,8196]**. Parent8196 dan child7312 memiliki fixed nonce receipts; dua additional members23376/23644 tidak memiliki executable/creation/retained-handle receipts.

Tidak ada planned TerminateJobObject call. Failure handler menutup job privat dan mengamati original parent exit saja. Ini **tidak memenuhi** independently observed child/helper exit atau no-unrelated-impact acceptance. Current build gate diubah menjadi pass=false/executionRevoked=true; executable/source/failure receipts tetap dipertahankan. Tidak ada further runtime setelah quarantine.

| Stage | Actual outcome |
|---|---|
| S16B-A | PASS: bounded architecture/toolchain/native read-only preflight. |
| S16B-B | Two offline builds PASS,0warnings. Initial source safety approval later revoked by C findings; BUILD_VERIFIED is not execution approval now. |
| S16B-C | BLOCKED. H1 and pure guards pass; H2/H3 and initial H5 fail complete-scope acceptance. |
| S16B-D | NOT RUN; prerequisite C did not pass. |
| S16B-E | NOT RUN; MXC0, no Codex launcher/helper/foreground. |
| S16B-F | Stop-path source/system/evidence/report audit completed; no full runtime/S16 closure acceptance. |

Repair cycles **1/2**. Cycle1 added actual/expected membership diagnostics, fresh fixture paths/nonces and bound the fixed control request ID. Membership assertions, API rights, job flags and termination conditions were not weakened. It did not resolve actual extra membership, so no second speculative repair/runtime attempt was made.

## 2. Previous S16 blocker

Original [S16 report](M02-02S16_PROCESS_TREE_SUPERVISION_REPORT.md) dan [matrix](M02-02S16_PROCESS_TREE_SECURITY_GATE_MATRIX.md) adalah CONDITIONAL: host lacked independently verified owned group control, complete membership dan surviving-child/helper exit/cleanup capability. No S16 runtime experiment occurred; historical source/evidence tidak ditulis ulang.

[S10](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md), [S10 matrix](M02-02S10_RECOVERY_GATE_MATRIX.md), [S11](M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md), [S12](M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md), [S13–S15 summary](M02-02S13_S15_PIPELINE_SUMMARY.md) serta actual nine attempt-control modules dibaca. Previous262PASS/typecheck adalah historical synthetic DB evidence, bukan S16B rerun atau OS group control.

S16B menghasilkan prototype dan singleton host-only evidence. Ia **belum menyediakan verified whole parent-child/MXC capability** yang hilang pada S16. Source existence atau compiler exit0 tidak menutup blocker.

## 3. Pinned source and runtime identity

| Item | Verified identity / limit |
|---|---|
| Windows |26300.9711/26H2, x64; read-only registry/CIM. |
| Node |C:\Program Files\nodejs\node.exe; ProductVersion24.21.0; Valid OpenJS signature; SHA BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32. |
| Candidate |C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW\candidate\bin\codex.exe; Valid OpenAI signature; SHA6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36. Version0.164.0 from retained S4 version.json/current matching files; no current Codex --version/help execution. |
| Active Codex |0.162.1 npm tree,50files preserved; not replaced, reconfigured or directly targeted. File preservation does not attest every active process remained unaffected by unknown member cleanup. |
| Codex source |[rust-v0.164.0 release](https://github.com/openai/codex/releases/tag/rust-v0.164.0); selected MXC path uses same-executable internal helper, BaseContainerRunner::spawn then wait. |
| SDK source |Codex Cargo.toml/lock pin microsoft/mxc b21120168d70befe12356411423266bfef168446; source review retained from S16, no main substitution. |
| Bridge runtime |Existing .NET Framework4.8, CLR4.0.30319.42000, C#5/x64; no new dependency/install. |

Pinned source references and fetched-text digests are inventoried in evidence/preflight/reference-register.json. [Codex native.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/native.rs) and [pinned SDK runner](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs) support internal launch/wait/job teardown, not fresh S16B runtime behavior.

## 4. Bridge architecture

Exactly one process-control implementation: bridge-build/bridge.exe from Native.cs, Fixed.cs, Bridge.cs. It accepts only fixed modes audit, negative, host-launch, host-tree, host-close, mxc; no executable/path/PID/job-handle/shell command supplied by caller.

Fixed.cs embeds approved programs, argv source, fixture root/owner, per-mode nonce and control text. Source files must match embedded strings; current build-gate digests must match all10 source files and executable. Assembly location is restricted to this temp root. Per-mode exclusive issuance prevents replay in the same run folder. No backend imports, production DB or real project context.

Bridge owns one new unnamed noninheritable job, creates the fixed root suspended, assigns and verifies singleton membership before resume. Process/thread/job handles use SafeHandle ownership. Only inherited stdio handles are two NUL handles via STARTUPINFOEX HANDLE_LIST. A25s watchdog closes only that private job; bounded waits then record captured process exits.

**Discovered architecture gap:** exact-set rejection happens before all actual job members get independent identity/wait handles; failure automatically closes the job. This closes a known private job but leaves unexpected-member provenance/exit and unrelated-impact assertions unproven. Prototype is quarantined rather than credited as a safe complete-tree controller.

## 5. Win32 API design

[CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw), [AssignProcessToJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject), [IsProcessInJob](https://learn.microsoft.com/en-us/windows/win32/api/jobapi/nf-jobapi-isprocessinjob), [QueryInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-queryinformationjobobject) dan [TerminateJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-terminatejobobject) reviewed against official signatures. Assignment requires legitimate original process rights; future member OpenProcess request is query-limited+synchronize only, not blanket process termination.

Additional justified APIs: CreateFileW for NUL stdio; Initialize/Update/DeleteProcThreadAttributeList for exact inheritance; GetHandleInformation for inherit flags; GetProcessId for retained object binding; GetCurrentProcess/Id for own identity; TerminateProcess **only for original still-suspended test-created target if assignment fails**. That failure operation was never exercised. No OpenJobObject/DuplicateHandle/process-name/PID termination interface.

| Finding | Topic | Actual conclusion |
|---|---|---|
| A01 | API availability | Documented kernel32 APIs; invoked subset observed. OpenProcess/TerminateJobObject availability/behavior not runtime-proven by unused imports. |
| A02 | Access rights | New-process original handles returned by CreateProcessW; descendant design QUERY_LIMITED_INFORMATION|SYNCHRONIZE only; no PROCESS_ALL_ACCESS request or blanket enumeration. |
| A03 | Handle ownership | New unnamed job and original process/thread handles retained through SafeHandle;25owned handles closed. Missing unexpected-member handles is unresolved. |
| A04 | Inheritance | Job/process/thread handle inherit flags0; only2NUL stdio handles on STARTUPINFOEX allowlist. No broad ambient inheritance. |
| A05 | Creation mode | Private unnamed CreateJobObjectW with NULL security attributes; no OpenJobObject or name reuse. |
| A06 | Kill-on-close | 8192 configured/read back. Failure close occurred, but complete multi-member exit proof missing. |
| A07 | Creation race | CREATE_SUSPENDED → assign → IsProcessInJob +singleton list → ResumeThread; verified for5root launches; hard-crash-before-assign orphan window remains untested. |
| A08 | Nesting | Supervisor/bridge inherit existing job, UI0; root assignment worked. Exact parent-child full scope failed; MXC compatibility NOT RUN. |
| A09 | Breakaway | Own job no breakaway; no CREATE_BREAKAWAY_FROM_JOB. Existing ancestor flags10240 and Node internal defaults not changed. |
| A10 | Membership | H1 singleton verified. Repair1 actual[7312,8196,23376,23644] vs expected[7312,8196]; no source inference replaces this failure. |
| A11 | Identity | Original5root handles have image/creation/PID. Child/extra members lack independent handle image/creation receipts. |
| A12 | Exact scope | No planned termination reached. Failure closes private job with uncharacterized actual members; no no-impact attestation. |
| A13 | Exit | Root original handles signaled/exit0, H1 job empty. Child/extra exits not independently captured. |
| A14 | Close semantics | SafeHandle counters25/25,error0. Closing job is not evidence all descendants independently observed. |
| A15 | Failure cleanup | Known private job close +bounded captured-handle waits implemented; insufficient capture before unexpected-set failure. Build execution revoked. |
| A16 | Crash | Watchdog code exists, never fired. No hard crash/kill-owner/leaked-handle simulation. |
| A17 | MXC helper | Pinned SDK internal job source retained from S16; no actual launcher/helper MXC run in S16B. |
| A18 | Windows | 26300.9711/26H2, x64; immediate inherited UI0; build compatibility for basic host launch observed only. |
| A19 | Toolchain | Installed signed Framework csc14.8.10001.0/C#5 and4BCL references;2offline builds exit0/warnings0. |
| A20 | Test-only lifecycle | All source/build/binaries/fixtures in one new owned temp root; no deployment/PATH/service/backend/DB integration. Current build gate revoked. |

A01–A20 are component findings, not20 runtime tests. Full stage acceptance must include membership and complete exit proof.

## 6. Compiler/toolchain verification

Installed compiler C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe, PE ProductVersion14.8.10001.0; SHA ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3; Valid Microsoft Windows signature. Existing offline Framework equivalent is permitted by S16B; no dotnet SDK/NuGet/install was introduced.

The read-only /version probe produced the compiler banner and **CS2007 Unrecognized option '/version'**. Version comes from banner/file metadata, not a fabricated successful option. This was not compilation or a repair cycle. Both actual builds later exited0 with no warnings.

Explicit references: mscorlib.dll, System.dll, System.Core.dll, System.Web.Extensions.dll from that same Framework directory; current hashes/signatures verified. System.Management.dll was found/signed but **not referenced or used** by bridge. No WMI, network package restore or service component in executable.

Native read-only preflight used an in-memory Reflection.Emit Run-only assembly exposing only own-process/job queries; script in scripts/preflight-native-audit.ps1. It created no job/target and no assembly file. It is an audit utility, not a second supervision implementation. PID5240 reported inherited job=true, limit flags10240, UI0; compiled audit PID2016 confirmed same immediate-job properties. No ancestor-job mutation, close or process enumeration.

## 7. Bridge source inventory

All paths relative to S16B_ROOT; initial originals preserved under evidence/static-review/initial-build/.

| Current source | SHA-256 |
|---|---|
| Bridge.cs | E9132DB00CD75542406FF16DB9983E389A752F25D3759A09EA16C63D3367A8EC |
| Fixed.cs | A85D57AE7BB77AF1FC80EA65DE3BE35C7E6203B32E8058D9F6419C2CC7E2F234 |
| host-close-child.js | E8B0E2E09E0845162565C7229373768441C647DED93F400FA2E2CC80FA73E635 |
| host-close-parent.js | B18D87DA300A8CA7DE621066D708F1366518D9857E1307FB061C5373C084CD8A |
| host-launch-parent.js | 541D6D634B145CBBF1768F0F4DE46DA2232583607883920D795DC611B880A911 |
| host-tree-child.js | 1F664F15FF8D1EC0E54B3EA6CCDB33AECC0DA524FF7FB8E2E717CE9BF1F6A00E |
| host-tree-parent.js | 99E98F474291D3BEB927EE8C26052CF3CE5ECFD8C4DBB651C5C4B834D707DED2 |
| mxc-child.js | BAE1869E7D83C997A51DB212012BD3B07D74965FAF141723E94E254CE1DA28E4 |
| mxc-parent.js | 07453E52794E83878890F2536D9E956BF8669EBDC68C45AAC3899C3C4899F3D9 |
| Native.cs | EC16833063FA011454ABF771D3286DB51E899D75E04793016544CAA504FACC51 |

Native.cs unchanged across two builds. Repair1 Bridge.cs adds exact-member diagnostics and fresh evidence paths; Fixed.cs/host JS/control text rebind fresh nonces/directories. Initial C#/JS/control/source/build records and executable remain byte-preserved. Unused MXC JS is source only; no MXC profile, canary or CODEX_HOME was created.

## 8. Static security review

Reviewed P/Invoke Unicode names, Win32 BOOL, SIZE_T/ULONG_PTR, error capture, mutable command buffers, environment double-NUL termination, pointer lifetimes, SafeHandle, locks/watchdog, timeout bounds, disposal and double-close accounting. Runtime layout audit matched BasicLimits64, ExtendedLimits144, Startup104, StartupEx112, ProcessInfo24, SecurityAttributes24; key offsets16/80.

CRT-compatible quoting is explicit; exact application path and fixed argv, cwd, minimal environment; no shell. Pure vectors cover spaces, embedded quotes, trailing backslash and empty argument. Parent/child JS fixed; child never intentionally spawns/detaches/connects network. New job HANDLE is not on stdio allowlist and is noninheritable.

Initial source review passed before first compilation; initial interop corrections were completed before build, not counted as runtime repair. Post-runtime review found failure-path accounting insufficient and a driver sequencing issue (§13/§24). **Current execution approval revoked.** Initial source-review.json/build receipt remain historical; current build-gate.pass=false is authoritative for prototype execution.

Unknown additional PIDs are not classified as conhost, libuv helper, unrelated victim or sandbox escape without evidence. Do not widen member allowance merely to make the existing guard pass.

## 9. Build evidence

Historical compiler argv, in order: /nologo /noconfig /nostdlib+ /target:exe /platform:x64 /checked+ /optimize+ /warn:4 /warnaserror+; /out:<S16B_ROOT>\bridge-build\bridge.exe; four explicit /reference paths from §6; then Native.cs, Fixed.cs, Bridge.cs. Exact structured arrays and output in build-first.json and build-repair1.json. No restore, internet access, external package or global write during build.

| Build | Result | Executable SHA-256 |
|---|---|---|
| Initial |exit0,warnings0 |E3038BA6AD8DBDE85AEBE528F285EECC5426B2AFC21AB741AD83DD69A62A0560 |
| Repair1 |exit0,warnings0 |13543059D556DAD02A07197F5D438FE4200F8C0C4C56349A247BCF4985B0F9FF |

Initial binary copied to evidence/static-review/initial-build/bridge.exe before replacement. Successful repair1 gate preserved as repair1-built-gate.json; current build-gate.json is revoked. No code-signing/global installation performed. Build success remains BUILD_VERIFIED, not host/MXC/production PASS.

## 10. Job Object configuration

CreateJobObjectW(NULL,NULL) creates new unnamed private job; no named foreign object/reopen. SetInformationJobObject ExtendedLimits uses exactly **8192/JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE**; Query readback verifies. No breakaway/UI/process-limit change applied to any existing job. Creator stays outside target job; IsCurrentInOwnedJob verifies that before launch.

Supervisor inherited immediate job flags **10240**, UI0. This existing flag combination was not changed or relied on to enable escape. Source review of [Node v24.21.0 libuv process.c](https://github.com/nodejs/node/blob/v24.21.0/deps/uv/src/win/process.c) shows its own global job initialization/parent assignment and breakaway-related defaults. That source does **not identify** observed extra members or establish their cause. Bridge did not change Node's internal job.

A private owned job handle and an exact characterized process target set are different properties. The handle was created/retained by bridge; exact parent-child set did not match expectations.

## 11. Process assignment protocol

Five root launches followed actual observed sequence: CreateProcessW suspended → original handles retained → AssignProcessToJobObject → IsProcessInJob true + singleton PID list → root OS creation/image check → ResumeThread previousCount1. No root execution before assignment was observed.

Primary thread closed after successful resume. On assignment failure, source prevents resume and cleans only the original still-suspended process handle; no guessed PID. Deliberate OS assignment-failure injection NOT RUN; pure decision guard tested.

No CREATE_BREAKAWAY_FROM_JOB, detached flags, unrestricted command, alternate executable input or broader permission fallback. Current failure is later full-membership characterization, not an observed root assignment race.

## 12. Handle custody

Each runtime root attempt opens5 bridge-owned SafeHandles before full-member capture: private job, original root process, primary thread, NUL stdin, NUL stdout/stderr. All5 close in each attempt: total25/25, CloseErrors0. Original root handles retained until observed exit; NULL security attributes make root/thread handles noninheritable. Native memory allocations are deterministically freed by reviewed finally blocks.

No descendant query handles were opened because exact member check failed first. Therefore balanced25 host handles **does not establish** child/helper original-handle custody or exit closure. Source code for minimum-rights OpenProcess was not reached.

Failure handler closes job before obtaining all unexpected-member handles. This is the unresolved scope/accounting safety gap. Closing a known private job is an actual lifecycle action and may terminate its members even though explicit TerminateJobObject count is0; do not describe failure cleanup as “no termination happened.”

## 13. Host-only process test results

Recorded duration below is timestamp in result receipt, before final console-summary serialization; console elapsed can be slightly larger. H1 normal2s workload; parent/child self-expiration18s; readiness≤6s host-only, planned MXC combined≤10s, assignment≤3s, shared exit observation≤5s, overall watchdog25s. No target run reached watchdog/deadline.

| Result artifact | Acceptance | Root PID | Recorded ms | Handles opened/closed | Explicit TerminateJobObject |
|---|---|---|---|---|---|
| evidence/host-only/audit-result.json | accepted=true | — | 65.450 | 0/0 | 0 |
| evidence/host-only/host-close-result.json | accepted=false | 3424 | 408.388 | 5/5 | 0 |
| evidence/host-only/host-launch-result.json | accepted=true | 23276 | 2375.351 | 5/5 | 0 |
| evidence/host-only/host-tree-result.json | accepted=false | 14832 | 386.499 | 5/5 | 0 |
| evidence/host-only/negative-result.json | accepted=true | — | 46.478 | 0/0 | 0 |
| evidence/host-only/repair1/audit-result.json | accepted=true | — | 82.944 | 0/0 | 0 |
| evidence/host-only/repair1/host-launch-result.json | accepted=true | 2424 | 2513.073 | 5/5 | 0 |
| evidence/host-only/repair1/host-tree-result.json | accepted=false | 8196 | 577.335 | 5/5 | 0 |
| evidence/host-only/repair1/negative-result.json | accepted=true | — | 64.289 | 0/0 | 0 |

H1 verified own singleton launch, natural exit0, job empty and closure twice. H2/H3 initial and repair1 failed before planned termination. Initial H5 failed the same guard before reaching its planned last-handle-close validation. **Repair1 H5 NOT RUN.**

Procedural finding: initial orchestrator issued H5 after the previous tool returned failed H2/H3, because the outer tool driver did not short-circuit on returned exit_code. This stayed within host-only stage C, with no D/E advance, but did not honor immediate-stop discipline. It is retained as a finding, not hidden or recast as passing automation. Repair1 used separate inspection before further runtime and stopped at repeated failure.

## 14. Negative security tests

17 unique pure checks (N01–N15, additional N07 ordering and quoting vectors) passed in each build. They do not prove OS enforcement, crash behavior or real negative-target safety. No unrelated victim, PID reuse, foreign job or intentionally uncontained process was created. Scope/impact evidence N16–N25 is separate; whole negative acceptance remains incomplete.

| ID | Requirement | Status | Evidence and limit |
|---|---|---|---|
| N01 | Unknown process identity | STATIC_VERIFIED | Guard rejects UNKNOWN_IDENTITY; pure in-process claim, no OS target. |
| N02 | PID-only termination | STATIC_VERIFIED | Guard rejects PID_ONLY_FORBIDDEN; executable has no PID/name command mode. |
| N03 | Wrong nonce | STATIC_VERIFIED | Guard wrong-nonce case passes; fixed control text and fresh invocation bind. |
| N04 | Wrong executable identity | STATIC_VERIFIED | Guard wrong image passes; actual H1 root image/hash observed. Wrong OS executable not launched. |
| N05 | Wrong creation time | STATIC_VERIFIED | Pure wrong-creation rejection; no PID reuse experiment. |
| N06 | Unknown job handle | STATIC_VERIFIED | Pure wrong job-cookie rejects; no foreign job handle input/API OpenJobObject. |
| N07 | Failed assignment prevents resume | STATIC_VERIFIED | CanResume false + guard model passes; source original-suspended cleanup. Deliberate OS assignment failure NOT RUN. |
| N08 | Unexpected member prevents PASS | HOST_ONLY_VERIFIED | All3 parent-child runs rejected; repair1 logs actual4 vs expected2; accepted=false, planned TerminateJobObject0. |
| N09 | Missing child membership | STATIC_VERIFIED | Pure rejection; no live missing-child/victim test. Existing actual extra members do not prove missing child. |
| N10 | Duplicate termination request | STATIC_VERIFIED | Pure guard rejects. Post-Terminate runtime duplicate path never reached. |
| N11 | Already exited target | STATIC_VERIFIED | Pure ALREADY_EXITED guard; no actual second termination attempt. |
| N12 | Unexpected launcher exit | STATIC_VERIFIED | Source early-root exit check + pure incomplete exit model; MXC launcher test NOT RUN. |
| N13 | Parent exit cannot substitute child | STATIC_VERIFIED | Pure closure model passes; failed runs retain completeAccounting=false despite parent receipt. |
| N14 | API success cannot substitute exit | STATIC_VERIFIED | Pure closure model/source per-handle waits; TerminateJobObject itself never called. |
| N15 | Self-expiry is not forced proof | STATIC_VERIFIED | Pure guard rejects Expiry; no expiry markers; no forced whole-tree acceptance. |
| N16 | No broad process access | STATIC_VERIFIED | OpenProcess code requests only QUERY_LIMITED_INFORMATION|SYNCHRONIZE for private-job IDs; not reached. Original root handles legitimately returned by CreateProcessW. |
| N17 | No breakaway relaxation | STATIC_VERIFIED | Bridge new job8192, no breakaway creation; does not rewrite ancestor/libuv settings. |
| N18 | No unrelated termination | NOT VERIFIED | Failure job close happened with uncharacterized member set. No unrelated-victim proof, but no full no-impact attestation. |
| N19 | No production source modified | STATIC_VERIFIED | 165 original files SHA-256 unchanged; exactly2 report additions. |
| N20 | No real credentials | STATIC_VERIFIED | No auth/store/private DB access; fixed host environment and source-only unused MXC plan. |
| N21 | No test network | STATIC_VERIFIED | No network imports/probes/listeners/provider traffic. Authorized official-document/source research used network separately. |
| N22 | No inference | STATIC_VERIFIED | No model/worker/provider operation. |
| N23 | No paid API/credits | STATIC_VERIFIED | No paid operation; does not prove included-only enforcement. |
| N24 | Active Codex not interfered with | NOT VERIFIED | Active package50files unchanged; no direct targeting, but unknown job members preclude complete process-impact claim. |
| N25 | No second MXC invocation | STATIC_VERIFIED | MXC0; no issuance file/profile; build pass revoked. |

## 15. Host-only termination evidence

**Explicit TerminateJobObject requests:0.** TerminateProcess fallback:0. No planned H3 group action passed the exact target guard. No successful bounded parent-child group termination may be claimed.

Three failure-path private job closes occurred. Original parent process handles subsequently signaled with exitCode0. For repair1: parent8196 created08:41:08.4082206Z; readiness receipts parent/child received08:41:08.664–.680Z; actual/expected list comparison.683Z; rejection.684Z; job close.685Z; original parent exit observed.701Z. Child7312 and additional23376/23644 had no independent exit handles/creation/image receipts. No expiry marker; this does not repair missing evidence or prove each death mechanism.

Later read-only exact-PID accounting found all10 recorded IDs absent. No process-control handle or kill was acquired during that accounting. No fabricated individual child/helper exit code or OS creation time.

## 16. Nested-job compatibility analysis

[Microsoft Nested Jobs](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs) describes conditional hierarchy/UI/assignment constraints; [PID-list documentation](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_process_id_list) includes nested-job members. Basic root assignment into new job succeeded in an already-jobbed environment. This does not validate exact descendants or MXC nesting.

Actual repair1 member list exceeded two expected workload PIDs. Additional process identities and origin remain UNKNOWN; job hierarchy/Node/libuv/Windows console explanations are hypotheses, not conclusions. No adding breakaway, changing internal jobs, broad privileges or substituting process-name cleanup.

M01–M15 below carry retained source/design context only. **Stage D compatibility preflight NOT RUN** because stage C failed; these are not a fabricated D execution report.

| Question | Retained context / unresolved result | Evidence boundary |
|---|---|---|
| M01 | Launcher assignability under MXC NOT RUN; Node host roots assignable, not transferable evidence. | NOT RUN — stage D blocked; retained source/design information only |
| M02 | Retained pinned Codex source confirms SDK UiJobObject; not new S16B runtime. | NOT RUN — stage D blocked; retained source/design information only |
| M03 | Conditional nested-job rules documented; actual MXC chain not tested. | NOT RUN — stage D blocked; retained source/design information only |
| M04 | Pinned reviewed constructor uses kill-on-close; no actual effective MXC-job flags query. | NOT RUN — stage D blocked; retained source/design information only |
| M05 | Bridge no breakaway. Ancestor and Node/libuv internal flags known at source/own-read-only level, not rewritten. | NOT RUN — stage D blocked; retained source/design information only |
| M06 | Internal helper containment/escape NOT RUN; do not infer from hypothetical hierarchy. | NOT RUN — stage D blocked; retained source/design information only |
| M07 | Foreground outer-job membership NOT RUN. | NOT RUN — stage D blocked; retained source/design information only |
| M08 | Child outer-job membership NOT RUN. | NOT RUN — stage D blocked; retained source/design information only |
| M09 | Bridge designed query-only member handles, but host failure occurred before obtaining them; no MXC receipt. | NOT RUN — stage D blocked; retained source/design information only |
| M10 | No internal Codex handle access/modification performed or authorized to force success. | NOT RUN — stage D blocked; retained source/design information only |
| M11 | Exclusive intended scope required; host extra members prevented planned termination. MXC NOT RUN. | NOT RUN — stage D blocked; retained source/design information only |
| M12 | Independent root exits observed host-only; full descendant accounting failed; MXC NOT RUN. | NOT RUN — stage D blocked; retained source/design information only |
| M13 | Read-only supervisor5240 and compiled audit2016 inherited job=true,flags10240,UI0; full existing hierarchy not enumerated. | NOT RUN — stage D blocked; retained source/design information only |
| M14 | No sandbox/security relaxation. Selected MXC compatibility has not passed because prerequisite C failed. | NOT RUN — stage D blocked; retained source/design information only |
| M15 | Host-only emergency group closure not independently verified for every member; prerequisite failed, NO MXC. | NOT RUN — stage D blocked; retained source/design information only |

## 17. MXC preflight

**NOT RUN/BLOCKED by host-only acceptance.** No stage-d-gate.json/PASS; no fresh strict profile or managed-policy evaluation, runtime nesting attempt or native SDK capability probe. No private Codex job handle accessed/duplicated/modified.

Unused fixed MXC source expresses intended S8/S10 strict policy targets, but there is no applied S16B profile. Historical root/minimal/A-only/B/private/fake-credential/temp denies, network=false, managed inclusion and explicit MXC intent remain historical source context. Full effective policy is not newly established.

## 18. MXC execution or NOT RUN

**NOT RUN; actual MXC0/1.** No launcher/helper/Node foreground/child under MXC, inference, app-server, provider auth, listener or test network. No invocation argv/env/profile was executed. The mxc directory remains empty; no mxc-issued.json/control-mxc.json exists.

Exact intended Codex CLI structure in fixed source is unused. It is not a command to replay. Historical bridge argv was only [absolute bridge.exe, fixed mode] as listed §13; exact root-target argv/env is in each launch_attempted receipt. Do not execute quarantined prototype.

## 19. Parent/child/helper membership

| Attempt | Original root | Reported child | Actual queried set | Independent descendant identities |
|---|---|---|---|---|
| H1 initial |23276 |none |singleton before resume; empty after exit |Not applicable; fixed source no child. |
| H2/H3 initial |14832 |21836 |Exact-set guard failed; list not retained |Not acquired. |
| H5 initial |3424 |7500 |Exact-set guard failed; list not retained |Not acquired. |
| H1 repair1 |2424 |none |singleton before resume; empty after exit |Not applicable. |
| H2/H3 repair1 |8196 |7312 |[7312,8196,23376,23644] |No child/extra original handle, image or creation receipt. |
| MXC |NOT RUN |NOT RUN |NOT RUN |NOT RUN |

Fixed Node receipts include nonce and child PPID=parent; these are protocol observations. OS job list independently includes both reported repair1 PIDs plus two extra. This is useful partial correlation, not full member identity/custody/no-unrelated proof.

## 20. Targeted termination evidence

No planned group termination was issued. The code requires exact expected set, all-live original/member handles, current nonce/request, image/creation match and margin before self-expiration. Exact-set guard rejected the workload first. Do not infer force control from source method existence or singleton normal exit.

Implicit kill-on-close cleanup on failure is recorded as lifecycle action, with original parent exit only. Its complete target characterization did not meet the requirement. Current prototype execution revoked to prevent reuse.

## 21. Exit and descendant accounting

Original5 root handles: exit independently observed, exitCode0; two H1 jobs empty after completion. Three failed groups completeAccounting=false; child/helper exit facts unresolved. Total25 bridge SafeHandles closed, error0, but unacquired handles are not covered by that count.

At08:44:27.5014914Z, per-recorded-PID CIM metadata showed23276/14832/21836/3424/7500/2424/8196/7312/23376/23644 absent. Queries used no command line for the unknown entries and acquired no process-control rights. This is residual diagnostic evidence; not original-object exit receipts, identity reconstruction or proof that every member of the initial failed groups was known.

No remaining recorded PID was observed, but **complete original test-tree exit accounting is INCONCLUSIVE**. No clean teardown/no unrelated process impact certification.

## 22. Timing and cleanup results

All5 root attempts completed within25s; result durations0.386–2.513s. Assignment ordering observed before resume; no timeout extension/watchdog trigger. Natural H1 exits were intentional, not termination evidence. Parent/child18s self-expiry never produced a marker; all explicit group termination subtests remain unverified.

Failure cleanup closes the private job and waits only captured handles. That limitation is visible in receipts with completeTreeNotClaimed=true. Timer source does not make prototype production crash-safe or repair missing child/helper ownership. No further cleanup, arbitrary PID/name kill, taskkill or security relaxation performed. Evidence retained; no deletion.

## 23. Source and fixture integrity

Before/after SHA-256 protects **165 original AI OFFICE files**, including original S16 reports, all source/tests/schema/package/lock/startup/brain reader; final167files with exactly two authorized S16B report additions. All existing165 hashes unchanged, no deletion.

Installed Codex50/50, Hermes3D647/647 tracked files and16historical fixture roots/2169regular files unchanged. Hermes HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing package-lock modification preserved. Historical known S5R2 junction metadata unchanged, no traversal; other retained reparse observations compared. Scope excludes node_modules/tool caches/untracked Hermes/global whole-system state/Google assets. Google AI Studio not written or checksum-audited.

All new bridge files remain under one root. Baseline-ai/installed/hermes/retained/pipeline.json files contain full measured inventories. Current/initial source and binaries, compile gates, failed runtime results and repair logs preserved. final-audit.json and evidence/inventory/artifact-inventory.json record the stop-path integrity outcome and hashes; inventory excludes its own hash to avoid self-reference.

No SQLite opened/migrated/written; no production schema modification, dependency install, global helper/service/PATH/config change, ACL/Defender/firewall/UAC/registry mutation, elevation, WSL, provider login/inference/paid call. Authorized job limits are test-owned and separate from global Windows security changes.

Official-reference/source retrieval used research network as requested; build and workload source used no network/proxy/listener/provider connection. Zero total-host-network or whole-host syscall/process-impact attestation is not claimed.

## 24. Remaining crash/hostile limitations

| Case | Failure/custody window | Finding / required recovery | Evidence level |
|---|---|---|---|
| C01 | Bridge exits before assignment | Normal exception uses original still-suspended handle for termination; hard death before assignment can leave suspended orphan. No crash test. | SOURCE/DESIGN; NOT RUN |
| C02 | Bridge exits after assignment | Last owned job handle should close according to Windows semantics; no exact all-member crash receipt established. | SOURCE; NOT RUN |
| C03 | Bridge exits during MXC startup | Outer job design intended contain launcher/helper; actual MXC startup never ran. | DESIGN; NOT RUN |
| C04 | Bridge exits while parent/child alive | Failure job close occurred after guard rejection; root exit observed, child/extra identities not held. Not a hard-crash test. | HOST partial / INCONCLUSIVE |
| C05 | Job handle leaked | Exclusive in-process wrapper/no duplication/inheritance source; external duplicate/leak resistance not tested. | STATIC; NOT RUN leak test |
| C06 | Job handle inherited unexpectedly | GetHandleInformation flags0 +explicit stdio-only allowlist; no child handle-table introspection. | STATIC + scoped OS flags |
| C07 | Multiple handles to same job | Bridge creates one job handle, no DuplicateHandle/OpenJobObject. External privileged duplication outside test proof. | SOURCE/DESIGN |
| C08 | Last handle closure | Five job handle closes observed;2empty H1jobs,3failure closes. Whole multi-process kill-on-close acceptance not established. | HOST partial |
| C09 | TerminateJobObject error | Source records API error then failure cleanup; actual API not called, no deliberate failure injection. | SOURCE; NOT RUN |
| C10 | Target already exited | Pure guard rejects ALREADY_EXITED; runtime post-termination guard never reached. | STATIC only |
| C11 | Parent exits before child | Model cannot accept missing child exit; failed runs completeAccounting=false. No reliable original child exit receipt. | STATIC / INCONCLUSIVE |
| C12 | Internal MXC helper exits first | Source discussion only; MXC NOT RUN. | DESIGN |
| C13 | Launcher exits before child receipt | Ready loop checks original launcher alive; no actual MXC launcher test. | SOURCE/DESIGN |
| C14 | Original process handle lost | SafeHandle custody while healthy; lost-handle recovery not implemented, must quarantine. | DESIGN |
| C15 | Host restart cannot recover job custody | Raw HANDLE number not durable/reopenable; private unnamed job not a recoverable authority token. | DESIGN |
| C16 | PID reuse after restart | No PID-only operation allowed; current per-recorded-PID absence queries diagnostic only, no process-control authority. | STATIC/DESIGN; reuse NOT RUN |

Additional findings: F01 unexpected actual member set; F02 failure close before complete member identity/exit custody; F03 initial driver did not short-circuit before H5; F04 initial exact-list diagnostics missing, repaired but actual mismatch persisted. Build quarantined. No asserted Windows/MXC sandbox escape, hostile code, confirmed unrelated victim or safe whole-tree forced termination.

## 25. Durable S13–S15 integration design

Existing source stays dormant/test-only: schema user_version5/profile s15-isolated-authority-v1, four STRICT tables, CAS/events/lease/cancellation/recovery. Bridge does not implement production project/task/attempt binding or touch any DB. Fixture ID/nonce/owner are synthetic test identifiers, not real DurableAttemptAuthority capabilities.

Future receipt binding must include project UUID, task ID, attempt ID/generation, host lifetime/domain, invocation nonce, runtime executable digest, job owner custody identity, process creation/object identities, termination request/receipt IDs, complete-scope member exits, effects disposition, quarantine and explicit retry authorization. Raw numeric job/process HANDLE is not durable authority.

requestCancellation records durable intent before OS request; ack is not exit. recordCancellationExit requires trusted host/evidence digest/creation/image/scope, completeScope=true; current prototype cannot provide that for failed groups. Reconcile UNKNOWN/incomplete scope with completeScope=false/effectsClassified=false; preserve execution owner/generation, conflictHeld1, dispatch CLOSED/retryAuthorized=false. Inspector provenance remains distinct; no generation takeover on lease expiry.

Successful OS termination would not rollback external artifacts or authorize final success alone. S14 launched cancellation terminalization still requires valid ack/exit/effects; forced exit without ack needs separately reviewed reconciliation, no bypass. Missing heartbeat/PID absence not closure. Physical attempt staging/publication fencing remains separate production blocker; stale OS write access is not revoked by DB CAS. No production integration or automatic retry.

## 26. Final S16 closure decision

| Closure question | Answer |
|---|---|
| Original S16 classification |CONDITIONAL; original evidence preserved. |
| Missing capability |Verified host-owned scope, complete membership/exit/cleanup under MXC. |
| S16B provided it? |Prototype built; complete capability **not verified**. |
| Host-only verification |Singleton launch/assignment/identity/normal exit verified; full parent-child control failed. |
| MXC verification |NOT RUN. |
| Actual owned termination |No explicit TerminateJobObject; failure job closes observed, complete group attribution not established. |
| All descendants accounted? |No; original child/extra identity/exit receipts incomplete. |
| Unrelated safety established? |No complete no-impact attestation; no confirmed unrelated victim either. |
| Still unverified |Unknown members/cleanup, crashes/hostile, MXC, production supervision/fencing/app-server/custody/account/billing. |
| Recommend S17 now? |No; recommend only bounded host-only membership/custody/cleanup follow-up after review. No automatic S17. |

S16 remains conditional. S16B has a blocking host-only safety/observability result; it does not amend historical S16 into PASS. Real worker remains BLOCKED.

## 27. Recommended next milestone

Exactly one follow-up: **S16B-R — reviewed host-only member-observation and failure-cleanup refinement**. First review how every job-listed process can get provenance/identity/exit custody before an expected-role mismatch is handled; explicitly address safe failure behavior and driver short-circuiting. New runtime must not proceed from an ambiguous target set or by relaxing assertions/adding breakaway. Do not begin with MXC.

This is a recommendation, not an executed repair2/S17. No install, broader privileges, production integration, account/provider operation or worker activation proposed.

## 28. Owner decisions

Review BLOCKED result, unexpected PIDs and quarantined prototype. No routine S16B approval was requested; read-only/build/fixed host tests used the given authorization. Further runtime after hard-stop requires a new bounded follow-up decision under S16B stop conditions; unused repair budget is not authorization to ignore actual unknown members.

Do not approve broad PID/name termination, new Windows privileges, security changes, foreign/internal Codex handle access or unreviewed helper deployment. Existing prototype must remain evidence-only and execution-revoked until a separate reviewed plan resolves scope/custody/cleanup.

**M02-02S16B BLOCKED — HOST-ONLY MEMBERSHIP AND FAILURE-CLEANUP ACCEPTANCE FAILED — MXC NOT RUN — S16 CONTROL BLOCKER UNRESOLVED — REAL WORKER BLOCKED.**

