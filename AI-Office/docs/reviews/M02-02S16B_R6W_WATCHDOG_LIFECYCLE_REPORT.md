# M02-02S16B-R6W — Watchdog Lifecycle Report

2026-11-05. Classification **STATIC_PASS_RUNTIME_BLOCKED**. Gate L/M **NOT RUN**; Gate S **BLOCKED**.

## A. Executive decision

**STATIC_PASS_RUNTIME_BLOCKED**. Separate watchdog implementation/build, source/IL audit, **42 static/regression tests PASS** dan **28 fault scenarios PASS** selesai. Gate keselamatan **SAFETY_REVIEW_INCONCLUSIVE**: belum ada failure-handling contract yang dapat dipertahankan untuk residual reporter lifetime jika watchdog mati ketika reporter masih berjalan/blocked. **R6W_RUNTIME_NOT_AUTHORIZED**; watchdog0, reporter0, J0=0, containment job0.

**ADDITIONAL_CONTAINMENT_AUTHORIZATION_REQUIRED**. Desain Jc pada bagian L konkret tetapi belum diimplementasikan/dijalankan. Gate L/M NOT RUN; Gate S BLOCKED. Ini bukan penghentian karena “OS harus selalu responsif”; ordinary OS progress limits diakui terpisah dari missing watchdog-crash boundary.

## B. R6 checkpoint

R6 STATIC_ONLY_RUNTIME_BLOCKED diverifikasi dari report/matrix, source, API audit,32 historical tests dan manifest29 entries/30 files. Original reporter SHA256 **71B610E575D894C2B2E9390331D01D5385E2350EC0C9AF9776F72BA0B170E2B7** cocok. Manifest R6 **D85DAE0F5E64F54260A3E02B0C373D18855C16C181DD1CA2BB8BB2235755E89B** dan seluruh entries diverifikasi sebelum source baru dibuat.

Original R6 files/binary tetap tidak dieksekusi/diubah. R5 decision C tetap conditional; historical229 R3 tests tidak diulang.32 parser/model tests R6 yang tidak terpengaruh dipertahankan sebagai HISTORICAL_ONLY;4 affected nonce/receipt/scope regressions ditambahkan di build baru.

## C. Watchdog authorization boundary

R6W mengizinkan maksimal satu trusted watchdog session dan satu fixed reporter process, conditional targeted TerminateProcess melalui original process handle, original-handle waits, serta satu empty reporter J0. Tidak mengizinkan job tambahan, assignment, TerminateJobObject, arbitrary PID/name termination, worker/MXC/app-server/inference/auth/paid API atau perubahan produksi/OS.

Fresh root: R6W_ROOT=%TEMP%/ai-office-m0202s16br6w-024f310b-c0a0-4c31-8f45-80e006f30da7. Runtime permits/claims tidak diterbitkan. Compiler/preflight/test-host commands bukan reporter/worker runtime; reflection tests tidak memanggil Main/PInvoke.

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

## D. Original R6 reporter assessment

Model.cs dan NativeProvider.cs disalin byte-identical. Program.cs hanya mengganti fixed invocation nonce dengan nonce R6W baru; menjaga nonce lama dapat membuat korelasi generation/receipt stale. Tidak ada rewrite parser, metadata API, buffer/lifecycle engine atau worker capability.

Copied reporter tetap self OpenProcess0x21000, TOKEN_QUERY0x8, fixed token classes, one-shot unnamed CreateJobObjectW(NULL,NULL), no process creation/assignment/limits/termination/duplication/security mutation/network/credentials. Existing cooperative20s checks tetap ada sebagai early-stop checks; tidak lagi dipromosikan menjadi external lifecycle enforcement. Original binary tidak digunakan sebagai executable R6W.

## E. Watchdog design

Source baru: Lifecycle.cs (states, original-handle model, Authority, Controller, CrashModel), ReporterReceipt.cs (strict invocation/hash/query/resource validation), NativeHost.cs (narrow process APIs), WatchdogProgram.cs (zero-arg fixed-root entry and runtime gates). No production integration/dependencies.

States mencakup NOT_STARTED, LAUNCH_PREPARED, PROCESS_CREATED, IDENTITY_CORRELATED, REPORTER_RUNNING, REPORTER_EXIT_OBSERVED, TIMEOUT_OBSERVED, TERMINATION_REQUESTED, TERMINATION_API_ACCEPTED, TERMINATION_WAIT_PENDING, TERMINATION_EXIT_OBSERVED, EXIT_STATUS_UNKNOWN, RESOURCE_RELEASE_PENDING, RESOURCE_RELEASE_CONFIRMED, SECURITY_STOP. READY disimpan sebagai progress receipt terpisah; creation/REPORTER_RUNNING tidak menyiratkan READY, dan source validator memeriksa READY claim setelah exit tanpa menyebutnya live READY observation.

Controller hanya sekali Run/Create dan maksimal satu stop request. NativeHost tidak mempunyai job creation/control API. Gate file bukan OS security fence; tidak dianggap menangkal malicious same-user writer.

## F. Reporter launch ownership

WatchdogProgram menetapkan sendiri root-relative reporter/build/R6MetadataReporter.exe dan quoted executable-only command, tanpa shell/args/PID input. Reporter hash diperiksa dan read-only file lock dipertahankan selama lifecycle untuk menolak ordinary write/delete replacement. Parent/current environment credentials tidak diteruskan sebagai arbitrary environment; source menyusun minimal SystemRoot/PATH/TEMP/TMP.

CreateProcessW memakai explicit application, NULL process/thread security attributes, bInheritHandles=false, flags0x08000400 (CREATE_NO_WINDOW|CREATE_UNICODE_ENVIRONMENT). Tidak memakai CREATE_SUSPENDED, DETACHED_PROCESS, breakaway, job list atau post-create assignment di R6W. Reporter dapat mulai sebelum identity receipt; crash gap itu tidak disembunyikan.

NativeHost menyimpan original PROCESS_INFORMATION process/thread handles sebelum query identitas. [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw), [PROCESS_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/ns-processthreadsapi-process_information).

## G. Original process-handle custody

Owned model menyimpan opaque handle-key, acquisition/attempt/released/error dan wait dependents; numeric handle tidak diserialisasi. Native values hanya private fields. Required waits menaikkan dependent count, kemudian menurunkannya dalam finally; close saat dependent aktif ditolak. Original thread/process dan reviewed-image-lock punya disposition terpisah.

Invocation record memuat prepared nonce **b2a2fc50-c607-4529-8821-5beb3a257207**, owner generation **7e1e538b-5f64-47a0-b66a-ddbee2502e73**, target alias, hash, returned PID/TID dan creation evidence bila runtime kelak terjadi. Original-handle GetProcessId/GetProcessTimes/image query dan flags harus cocok; GetLongPathNameW mengatasi short/long TEMP spelling secara read-only. Receipt nonce tidak boleh mengubah OS identity. PID reuse/stale generation/closed handle menolak termination; no OpenProcess fallback.

## H. Termination authority

Target hanya private original process handle dari launch invocation yang sama. Authority harus revalidate generation, opaque original handle-key, PID dan creation time sebelum stop. Zero-time original-handle wait menutup race already-exited; jika signaled, tidak mengirim termination. Jika masih timeout dan identity valid, satu TerminateProcess(original,0x52665701), lalu finite same-handle wait.

Terpisah: timeout, API request, API accepted, actual exit, exit code dan reporter user-mode resource receipt. Failed request tetap mencatat error dan wait result tanpa inferensi cleanup. Unknown identity/WAIT_FAILED tidak memicu PID/name/taskkill fallback.

Terminasi proses lain bersifat asynchronous; return success tidak memastikan exit. [TerminateProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess).

## I. Deadline model

Final proposed phase limits ditetapkan sebelum runtime: initialization5s, launch/identity5s, normal wait20s, termination observation5s, final resource accounting5s. Native wait implementation hanya menerima0/5000/20000ms; tidak ada INFINITE atau silent extension. Initialization/creation/identity/file-I/O bounds adalah planning/observation budgets, bukan guaranteed per-call preemption; source tidak membuktikan hard bound untuk watchdog sendiri.

Separate process dapat menunggu/menargetkan reporter yang macet selama watchdog hidup, sebagaimana fake timeout cases. Jika OS menahan teardown/I/O, stop request tetap bisa pending; tidak ada ordinary watchdog guarantee OS progress. Ini bukan alasan menghapus requirement independent lifetime setelah watchdog crash. [WaitForSingleObject](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject).

## J. Independent exit observation

Hanya WAIT_OBJECT_0 pada original handle menetapkan ExitObserved. WAIT_TIMEOUT/WAIT_FAILED tidak dapat menjadi exit. GetExitCodeProcess dipanggil setelah signaled; code259 tidak mengubah signaled receipt menjadi “still running”. CloseHandle tidak membuktikan exit.

Reporter final receipt baru divalidasi setelah exit. Strict validator memerlukan nonce/hash/source manifest, original PID/creation match,15 successful query records dengan7 unique token classes, J0 creation/flags/DACL/zero membership dan resource ledger clear. Exit0 atau summary GateM=PASS saja tidak cukup. Forced stop tidak dianggap successful user-mode release; source M tetap partial jika ada targeted request. [GetExitCodeProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodeprocess), [GetProcessTimes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getprocesstimes).

## K. Watchdog crash-window analysis

Original handle custody bukan automatic parent-death child cleanup. Inferensi desain dari ordinary handle semantics: hilangnya watchdog/control handle dapat membiarkan reporter hidup. No OS crash/termination experiment dilakukan. Semua evidence di bawah source/documentation/fake-model, bukan HOST_ONLY_OS_VERIFIED.

| Case / window | Known identity | Handle owner | Running reporter possible | Reporter resources | Expected OS behavior | Available evidence | Residual process | Required capability | Risk accepted? / Owner decision |
|---|---|---|---|---|---|---|---|---|---|
| C01 Before reporter creation | No reporter identity; only planned nonce/generation | Watchdog owns no child process handles | false | No reporter resources | No reporter exists if no create call entered | Source state NOT_STARTED/LAUNCH_PREPARED; T26/F25, no OS crash test | None | No new containment needed for this window | ACCEPTABLE_NO_REPORTER; Owner=false |
| C02 During CreateProcessW | May not yet receive PID/handles; created status can be unknown | Kernel may have created handles in dying watchdog before managed receipt | true | Reporter may have own process/token resources after it starts | Parent death closes parent handles; does not automatically kill its new process | Creation ordering source; no actual create/crash receipt | Possible unknown-identity reporter | Atomic containment attached at creation or another independent trusted control | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C03 After creation before identity receipt | Original return may exist only in memory; no durable correlated identity | Watchdog original process/thread handles lost on watchdog death | true | Reporter may already execute self-query | Ordinary process handle close is not child termination | Source PROCESS_CREATED; T27 and modeled crash | Possible running reporter, no accepted takeover authority | Independent lifetime boundary active before creation completes | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C04 After reporter READY | In-memory/durable original identity may be available; READY is progress only | Watchdog originals; reporter owns query/J0 handles | true | Reporter may create J0 and block on native call | READY does not bind child lifetime to parent | Source REPORTER_RUNNING and READY/exit separation; fake model only | Possible running reporter | Independent crash-triggered cleanup; READY is insufficient | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C05 During blocking reporter native call | Identity may be correlated on original handle before watchdog dies | Reporter query allocations/handles live; watchdog control handles die | true | User-mode finally may never run until call returns | Live watchdog could request targeted termination; absent watchdog cannot do so | T29 proves fake live-controller path, not OS crash cleanup | Possible blocked reporter with temporary resources | OS-mediated independent trigger such as separately authorized Jc | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C06 Immediately before termination request | Original identity known if prior correlation persisted | Watchdog holds original capability until crash | true | Reporter still owns resources | No stop request exists yet | Source TIMEOUT_OBSERVED; fake timeout sequence | Possible running reporter | Independent containment; finite wait alone cannot survive controller loss | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C07 Immediately after termination request | Original identity known, request result may be lost | Watchdog original handles may close on crash | true | User-mode release may be bypassed; I/O cancellation pending | Accepted request is asynchronous; exit may still be pending | T28/F28 and Microsoft TerminateProcess semantics; no OS observation | Possible reporter pending termination | Independent trigger plus later separate exit evidence; no promise of bounded kernel completion | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C08 Before exit observation | May have identity but no signaled-handle/exit receipt | Original wait authority disappears with watchdog | true | Possibly already released by reporter, but not verified | Absence of wait receipt cannot prove alive or exited | Source ExitObserved invariant; fake failed waits | Exit status unknown | Independent containment; observation/recovery protocol separately scoped | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C09 Watchdog exits while reporter remains alive | May retain sanitized identity receipt, no live original capability after exit | OS closes watchdog handles; reporter has own live handles | true | Reporter resources remain until reporter exits | Closing parent process handle does not terminate child | Source unknown-exit outcome; ordinary close semantics | Possible running reporter | Independent last-handle job cleanup or explicitly changed residual-lifetime contract | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C10 Original process handle closed prematurely | PID/nonce receipt alone cannot restore authority | Original handle no longer usable; no OpenProcess fallback | true | Reporter resources possibly remain | Closed handle cannot safely wait or terminate the original process | T22/T38 source/model checks; no OS close test | Possible running reporter | Prevent invalid close plus independent lifetime boundary; no PID takeover | NOT_ACCEPTED_UNDER_RETAINED_CONTRACT; Owner=true |
| C11 Unbounded reporter native operation | Live watchdog can retain correlated original handle | Separate watchdog wait/control capability if watchdog healthy | true | Reporter finally cannot progress while blocked | Finite watchdog wait allows one scoped stop request; not an OS progress guarantee | T29 fake success path; OS path NOT RUN | Can persist if watchdog fails or termination remains pending | External targeted stop addresses R6 cooperative limit only while watchdog survives; independent crash boundary still needed | CONDITIONAL_LIVE_CONTROLLER_ONLY_NOT_CRASH_SAFE; Owner=true |
| C12 OS does not complete termination within5s | Original identity retained if watchdog still alive | Own handles can be accounted separately from exit | true | Reporter teardown may remain pending in kernel | No ordinary watchdog or job guarantees OS progress/instant exit | T19/F12/F13 and documented asynchronous semantics | TERMINATION_INCONCLUSIVE or FAILED; no retry | Preserve unknown state, no cleanup PASS/broad kill; future Jc gives trigger, not hard OS completion | DOCUMENTED_OS_LIMIT_NOT_WAIVED; Owner=true |


C02-C09 menunjukkan satu root blocker: tidak ada independent residual-lifetime mechanism yang aktif sebelum reporter dapat berjalan. Narrow trusted metadata capability mengurangi impact, tetapi tidak mengubah retained safety contract. C12 adalah separate documented OS limit, bukan guarantee yang dijanjikan Jc.

## L. Additional containment-job feasibility

**DESIGN ONLY — ADDITIONAL_CONTAINMENT_AUTHORIZATION_REQUIRED.** R6W tidak mempunyai native implementation/permit untuk Jc.

Jc: one fresh unnamed job milik watchdog; hanya fixed reporter menjadi member. Watchdog tetap di luar. J0: different reporter-owned empty metadata job, zero members. Jadi proposal future maksimum2 jobs (Jc+J0), bukan R6W current ceiling1 J0/0 Jc. Membuat J0 tidak otomatis membuatnya child job Jc; ambient/nested membership tetap perlu diperiksa.

Exact additional scope yang diminta:

1. Create at most one additional private unnamed Jc
2. Configure Jc only with JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE, optionally fixed ACTIVE_PROCESS_LIMIT1 after specific review; no breakaway/silent-breakaway
3. Use STARTUPINFOEX / PROC_THREAD_ATTRIBUTE_JOB_LIST for assignment at CreateProcessW; no post-create assignment gap
4. If CREATE_SUSPENDED used, authorize ResumeThread exactly once only after identity/membership/limit/handle verification; suspension alone is not crash cleanup
5. Read Jc limits/membership/handle flags and own membership with minimum query rights
6. Close original Jc handle only under verified custody/owned scope; no TerminateJobObject or arbitrary processes

Rights/custody: Creation API returns documented broad original job handle, not independently measured mask. Intended operations need SET_ATTRIBUTES0x2, QUERY0x4, ASSIGN_PROCESS0x1 and READ_CONTROL for descriptor; actual supported rights must be verified from approved APIs/operation receipts. No handle duplication for measuring masks.

Proposed protocol, belum dieksekusi:

1. Review source, actual structure sizes/platform compatibility and binary hashes before any launch; maintain one watchdog/one reporter/no worker/no extra descendant budget.
2. Before creation, establish a defensible custody/access contract for Jc: noninheritable, no export/IPC/dup, no untracked external holder/admission/limit-tamper assumptions silently accepted.
3. Create Jc unnamed with default/non-inheriting construction or separately reviewed stricter initialization; do not modify existing security configuration.
4. Set/read back only approved kill-on-close/limit flags; breakaway flags absent; watchdog outside Jc; Jc initially observed empty.
5. Build/hold attribute buffer and Jc job-list handle until creation is complete; create fixed reporter with atomic job-list assignment, false handle inheritance, no detached/breakaway behavior.
6. Register original process/thread handles before further queries; correlate PID+creation+image hash and generation on original handle; prove membership to Jc before code resumes if suspended.
7. Reporter creates its separate empty J0; J0 remains unassigned and distinct from Jc. Creating J0 is not nested membership by itself; verify ambient parent-job constraints rather than assume MXC compatibility.
8. Retain Jc original handle only in watchdog. On watchdog process death, kernel closes owned handles; a last-close kill trigger requires no other live Jc holders. Existing external/duplicate holders invalidate that premise.
9. Use original process handle for finite live-watchdog waits, single targeted termination and independent exit evidence. Killing/closing Jc is not independent exit confirmation.
10. Crash behavior requires a separately reviewed experiment/observation design and new authorization before any deliberate watchdog crash. Preserve unknowns if OS teardown does not finish; no PID/name fallback or automatic retries.

Last-close kill trigger bersyarat pada sole/known handle ownership; inherited/duplicated external holders atau admission/limit tampering harus menjadi mandatory preflight findings, bukan diasumsikan tidak ada. Job close bukan independent exit receipt dan tidak menjalankan reporter finally. Jc tidak menjanjikan OS teardown selesai dalam5s. Mere CREATE_SUSPENDED/post-create assign tidak menutup C02; gunakan creation-time job list bila proposal terpisah disetujui.

- No absolute OS progress guarantee; pending I/O/termination can outlast observation budget
- Kernel closure does not run reporter user-mode finally; distinguish OS handle release from application release receipts
- Watchdog crash may destroy its original wait authority; separate durable observation may be necessary and is not authorized here
- External malicious same-user duplicate/admission/tamper capability remains unverified; last-handle guarantee is conditional until resolved
- Ambient jobs/nesting, original process identity and crash-trigger acceptance require separate validation; no production/MXC security claim

[Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute), [Job security/rights](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights). Ini requested design, bukan executed capability atau izin menjalankannya.

## M. Disposable source changes

Reporter copy hanya fresh nonce;2 core files byte-identical. Watchdog4 source files dan test DLL source baru; zero repository production changes.

Satu focused source repair setelah initial42+28 PASS: GetLongPathNameW failure belum mempunyai immediate return/error receipt. Perbaikan mencatat actual return length/success, GetLastError hanya pada zero return, tanpa invented error pada insufficient capacity. Initial NativeHost source/binary/build/audit/tests dipertahankan; final rebuilt watchdog dan relevant tests/IL diperiksa ulang. Tidak ada assertion weakening/capability expansion.

Satu verification-helper correction: PowerShell memilih Marshal.SizeOf(object) untuk RuntimeType; pemanggilan diganti explicit SizeOf(Type). Initial finding retained; expected104/24/16/60 tidak diubah. Total focused corrections2 (1 source+1 helper), tidak ada cycle ketiga.

## N. Static test results

Final **42 PASS /0 FAIL /0 SKIP /0 TIMEOUT**, terdiri38 watchdog tests dan4 affected reporter regressions. Initial42 PASS tetap disimpan, final batch mengikat rebuilt watchdog. Historical32 R6 parser cases dan229 R3 tidak diulang. Tests memanggil pure managed/fake methods lewat library, bukan executable Main/native methods.

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


Interop-layout check PASS: x64 STARTUPINFO size104, PROCESS_INFORMATION size24, PID offset16, Startup flags offset60; managed metadata reflection only.

## O. Fault-injection results

Final **28/28 PASS**, terdiri24 lifecycle/output/control fault models dan4 watchdog-crash models. Initial28 PASS juga dipertahankan. Separate scenario-specific transition reconciliation28/28 PASS memeriksa final classifications/state trace; field “termination authorized/requested” di bawah adalah fake-model result, bukan native activity.

| Fault | Initial state | Injected failure | Expected transition | Actual transitions | Term authorized / requested | Exit observed | Another invocation | Final model classification | Check |
|---|---|---|---|---|---|---|---|---|---|
| F01 | NOT_STARTED | CreateFailure | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F02 | NOT_STARTED | MissingHandle | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F03 | NOT_STARTED | IdentityMissing | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F04 | NOT_STARTED | IdentityMismatch | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F05 | NOT_STARTED | GenerationMismatch | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F06 | NOT_STARTED | PidMismatch | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F07 | NOT_STARTED | PidReuse | SECURITY_STOP | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → SECURITY_STOP → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F08 | NOT_STARTED | WaitFailure | EXIT_STATUS_UNKNOWN | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → EXIT_STATUS_UNKNOWN → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F09 | NOT_STARTED | RecheckWaitFailure | EXIT_STATUS_UNKNOWN | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → EXIT_STATUS_UNKNOWN → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F10 | NOT_STARTED | Timeout | TERMINATION_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → TERMINATION_REQUESTED → TERMINATION_API_ACCEPTED → TERMINATION_WAIT_PENDING → TERMINATION_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | true / true | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F11 | NOT_STARTED | TermFailure | EXIT_STATUS_UNKNOWN | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → TERMINATION_REQUESTED → TERMINATION_WAIT_PENDING → EXIT_STATUS_UNKNOWN → RESOURCE_RELEASE_PENDING | true / true | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F12 | NOT_STARTED | TermPending | TERMINATION_WAIT_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → TERMINATION_REQUESTED → TERMINATION_API_ACCEPTED → TERMINATION_WAIT_PENDING → EXIT_STATUS_UNKNOWN → RESOURCE_RELEASE_PENDING | true / true | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F13 | NOT_STARTED | FinalWaitFailure | EXIT_STATUS_UNKNOWN | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → TERMINATION_REQUESTED → TERMINATION_API_ACCEPTED → TERMINATION_WAIT_PENDING → EXIT_STATUS_UNKNOWN → RESOURCE_RELEASE_PENDING | true / true | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F14 | NOT_STARTED | ExitCodeFailure | REPORTER_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | false / false | true | false | RUNTIME_INCONCLUSIVE | PASS |
| F15 | NOT_STARTED | OutputMissing | REPORTER_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | false / false | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F16 | NOT_STARTED | OutputConflict | REPORTER_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | false / false | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F17 | NOT_STARTED | EvidenceWriteFailure | TERMINATION_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → TERMINATION_REQUESTED → TERMINATION_API_ACCEPTED → TERMINATION_WAIT_PENDING → TERMINATION_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | true / true | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F18 | NOT_STARTED | OutputException | REPORTER_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | false / false | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F19 | NOT_STARTED | CloseFailure | RESOURCE_RELEASE_PENDING | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING | false / false | true | false | RUNTIME_INCONCLUSIVE | PASS |
| F20 | NOT_STARTED | PrematureClose | SECURITY_STOP | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → SECURITY_STOP → RESOURCE_RELEASE_PENDING | false / false | false | false | SECURITY_STOP | PASS |
| F21 | NOT_STARTED | ReporterHang | TERMINATION_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → TIMEOUT_OBSERVED → TERMINATION_REQUESTED → TERMINATION_API_ACCEPTED → TERMINATION_WAIT_PENDING → TERMINATION_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | true / true | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F22 | NOT_STARTED | UnknownTarget | NOT_STARTED | NOT_STARTED → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F23 | NOT_STARTED | HashMismatch | NOT_STARTED | NOT_STARTED → RESOURCE_RELEASE_PENDING | false / false | false | false | RUNTIME_INCONCLUSIVE | PASS |
| F24 | NOT_STARTED | ReporterReleaseMissing | REPORTER_EXIT_OBSERVED | NOT_STARTED → LAUNCH_PREPARED → PROCESS_CREATED → IDENTITY_CORRELATED → REPORTER_RUNNING → REPORTER_EXIT_OBSERVED → RESOURCE_RELEASE_PENDING → RESOURCE_RELEASE_CONFIRMED | false / false | true | false | LIFECYCLE_PASS_METADATA_PARTIAL | PASS |
| F25 | LAUNCH_PREPARED | WATCHDOG_CRASH_MODEL_ONLY | NO_REPORTER | LAUNCH_PREPARED → WATCHDOG_ABSENT → NO_REPORTER | false / false | false | false | NO_REPORTER_CREATED | PASS |
| F26 | PROCESS_CREATED | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | PROCESS_CREATED → WATCHDOG_ABSENT → RESIDUAL_REPORTER_POSSIBLE | false / false | false | false | INCONCLUSIVE_RESIDUAL_LIFETIME | PASS |
| F27 | REPORTER_RUNNING | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | REPORTER_RUNNING → WATCHDOG_ABSENT → RESIDUAL_REPORTER_POSSIBLE | false / false | false | false | INCONCLUSIVE_RESIDUAL_LIFETIME | PASS |
| F28 | TERMINATION_REQUESTED | WATCHDOG_CRASH_MODEL_ONLY | RESIDUAL_REPORTER_POSSIBLE | TERMINATION_REQUESTED → WATCHDOG_ABSENT → RESIDUAL_REPORTER_POSSIBLE | false / false | false | false | INCONCLUSIVE_RESIDUAL_LIFETIME | PASS |


No scenario attempts a second runtime launch. Positive model results tidak meniadakan mandatory crash-contract blocker. No actual Win32 error/wait/termination receipt tersedia R6W.

## P. Build and hashes

Existing compiler 14.8.10001.0 built by: bd501acdc000004; current OS metadata Microsoft Windows NT 10.0.26300.0, x64. Reporter compilation1, watchdog compilations2 (initial/final), test-library compilation1; all compiler exit0 and warnings0 (/platform:x64 /optimize+ /warn:4 /warnaserror+). No dependency install. Initial watchdog image retained only as build evidence, not executed.

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


Role-separated final audit: reporter12 imports/625 IL method references; watchdog10 imports/979 references. Zero forbidden finding/calli. Existing .NET runtime trusted, not entire framework disassembled. Added GetLongPathNameW only canonicalizes fixed existing image path.

| Role | Native method | DLL |
|---|---|---|
| Reporter | GetCurrentProcess | kernel32.dll |
| Reporter | GetCurrentProcessId | kernel32.dll |
| Reporter | OpenProcess | kernel32.dll |
| Reporter | OpenProcessToken | advapi32.dll |
| Reporter | GetTokenInformation | advapi32.dll |
| Reporter | GetKernelObjectSecurity | advapi32.dll |
| Reporter | CreateJobObjectW | kernel32.dll |
| Reporter | QueryInformationJobObject | kernel32.dll |
| Reporter | GetHandleInformation | kernel32.dll |
| Reporter | GetProcessTimes | kernel32.dll |
| Reporter | CloseHandle | kernel32.dll |
| Reporter | LookupPrivilegeNameW | advapi32.dll |
| Watchdog | CreateProcessW | kernel32.dll |
| Watchdog | GetProcessId | kernel32.dll |
| Watchdog | GetProcessTimes | kernel32.dll |
| Watchdog | QueryFullProcessImageNameW | kernel32.dll |
| Watchdog | GetHandleInformation | kernel32.dll |
| Watchdog | WaitForSingleObject | kernel32.dll |
| Watchdog | TerminateProcess | kernel32.dll |
| Watchdog | GetExitCodeProcess | kernel32.dll |
| Watchdog | CloseHandle | kernel32.dll |
| Watchdog | GetLongPathNameW | kernel32.dll |


Official reference register (documentation, not OS receipts):

| ID | Official reference |
|---|---|
| D01 | [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw) |
| D02 | [PROCESS_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/ns-processthreadsapi-process_information) |
| D03 | [TerminateProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess) |
| D04 | [WaitForSingleObject](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject) |
| D05 | [GetExitCodeProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodeprocess) |
| D06 | [GetProcessTimes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getprocesstimes) |
| D07 | [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) |
| D08 | [UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute) |
| D09 | [Job extended limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information) |
| D10 | [Job security/access rights](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights) |

## Q. Internal adversarial review

**INTERNAL_ADVERSARIAL_REVIEW — SAFETY_REVIEW_INCONCLUSIVE**. Same agent, distinct final source/evidence pass; not human/external audit. Final source hashes/tests/API audit include the focused repair. IR21 is mandatory blocker;24 other source/design checks do not authorize runtime.

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


R6W §15 prohibits launch without a defensible residual-lifetime failure contract; §16 requires separate authorization for Jc; §21 disallows operational advance when mandatory conditions fail. No guarantee was silently waived.

## R. Runtime preflight

**R6W_RUNTIME_NOT_AUTHORIZED.** W4 not PASS, so W5 cannot authorize W6. Both watchdog authorization and reporter native activation files remain absent, as do runtime claim/identity/final output files. Actual non-elevated launch context, OS identity, native handle flags and execution output are NOT RUN; source no-elevation paths are not runtime token proof.

Known preconditions passed: exact source/binary bindings, compiler, fixed target/interface, static tests, no old binary/dependency/worker/job capability expansion. Unmet: independent residual-lifetime contract for watchdog death and resulting containment authorization. Additional operational checks are not bypassed or assumed PASS. No runtime exception or weakened contract issued.

## S. Reporter experiment or NOT RUN

**NOT RUN.** Watchdog sessions0; reporter creation0; J0=0; Jc=0; native termination0; retries0. New exe assemblies were loaded only for IL/pure test methods; no Main entry or OS target was started. metadata/live process safety uncertainty is absent because no reporter was created, not because a watchdog runtime passed.

## T. Actual process identity

No actual watchdog/reporter PID, creation timestamp, image query, original process/thread handle acquisition, READY or correlated runtime identity. Prepared nonce/generation/source hashes are design/provenance only. Historical PID23376/23644 remain HISTORICAL_PROCESS_IDENTITY_UNRESOLVED, untouched.

## U. Timeout/termination/exit observations

Native wait results, TerminateProcess returns/errors and GetExitCodeProcess values **NOT RUN**. No accepted termination or confirmed exit claimed. Fake errors/timeouts/signaled values remain explicitly model-only. Never interpret absent log, timeout, successful close, API accepted flag or exit0 as complete cleanup/metadata success.

## V. M/J0 metadata results

**NOT RUN**: own process SD, owner/DACL, token integrity/elevation/privileges/restrictions/AppContainer, J0 descriptor/flags/membership and final resource receipt. R5 caller Medium is not copied into R6W results. Source-requested0x21000/TOKEN_QUERY0x8, documented broad job return rights, handle flags and actual granted mask remain separate; no granted-mask dump exists.

## W. Resource accounting

Actual runtime resources acquired/released:0. No runtime handle-close/OS teardown/user-mode-finally proof.

Planned watchdog resources: original process/thread handles, temporary environment HGLOBAL, reviewed-image FileStream lock, bounded evidence file streams. Planned reporter resources: self-query process/token handles, one J0 and bounded metadata HGLOBAL buffers, unchanged R6 custody. Borrowed pseudo-handle never closed. Source release attempts each original handle once and preserves failure; no pending wait handle is closed.

After a real forced stop, kernel handle closure would differ from reporter-authored successful finally receipt; external holders can keep objects alive. After watchdog loss, original wait/control capability can be gone. These are precisely why runtime preflight remains blocked.

## X. Gate L

**NOT RUN.** Original process ownership/identity, independent signaled exit and watchdog release were tested in fakes only. No HOST_ONLY_OS_VERIFIED lifecycle acceptance.

## Y. Gate M

**NOT RUN.** No safe runtime reporter completion or empty-J0 metadata; no metadata PASS/PARTIAL from static outputs.

## Z. Gate S

**BLOCKED.** No actual worker token/malicious same-user isolation/process-tree/crash-recovery/MXC/output-fence acceptance. Boundary B remains conditional; threat model retained.

## AA. Source/system integrity

Final scope: **451 existing AI OFFICE files** unchanged; exactly **2 new R6W reports**, final **453 files**. **128 pre-existing Git entries** retained; final **130**. **24 protected roots /2532 files** unchanged, including original R6=30, R5=24, R4=19, R3=67 and installed active-Codex distribution=50. **Hermes3D647 tracked paths/hashes** preserved. Receipts: evidence/audit/final-integrity.json and inventory/manifest.json.

AI snapshot excludes .git/node_modules directories; protected roots fully hashed; Hermes claim covers tracked baseline. No whole-disk/process/syscall/packet attestation. Existing user work was neither reset nor overwritten. Production source/SQLite/registry/state, historical reports/fixtures, S12-S15 and old bridge artifacts unchanged within inspected scope. Candidate remains absent; no restore/substitute. Old R3 activation/build gates remain absent; negative historical review/prelaunch preserved.

Only fresh disposable source/build/test/evidence files and the two reports were written. No old executable, reporter or watchdog runtime session, job, worker, target, assignment, termination, privilege/elevation/security mutation, install/service/task/WSL, credentials/provider auth/inference/paid API or later milestone was run. File/command evidence supports these scoped counts, not machine-wide activity claims.

Official Microsoft documentation was fetched through the web tool as required by §4. There was no host harness/provider/target network request. Thus literal whole-session “no external network” is not claimed. Hashes cover every final evidence file except the manifest itself, plus external report hashes; no circular report/manifest hash.

## AB. Remaining production blockers

Supervisor-crash cleanup, descendant/process-tree termination, actual pinned MXC/nested-job compatibility, physical output/authority fencing, production supervisor, credential custody, subscription entitlement and included-only billing unresolved. Candidate unavailable; no restore/substitute. Old R3 guarded; S12-S15 unchanged; S16C/S17/real worker not activated.

## AC. Final decision and recommended next step

**STATIC_PASS_RUNTIME_BLOCKED**, category C R6W. All authorized implementation/static work completed and reviewed; runtime stopped at a specific mandatory missing crash-lifetime boundary, not a repeated speculative experiment.

Exactly one next action: **Owner review and separate authorization of the concrete additional Jc atomic-containment protocol in L**, including rights, sole-handle custody, breakaway/ambient-job constraints, any suspend/resume, crash-test budget and independent exit evidence. Additional job/configuration/assignment is outside current R6W authorization and was not created. Authorization still would not waive technical preflight or prove OS progress; no auto-run or identical static-suite rerun.

**M02-02S16B-R6W STATIC_PASS — WATCHDOG DESIGN VERIFIED STATICALLY — RUNTIME NOT AUTHORIZED — REAL WORKER BLOCKED.**

