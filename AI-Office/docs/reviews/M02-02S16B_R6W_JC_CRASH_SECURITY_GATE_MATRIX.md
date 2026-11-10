# M02-02S16B-R6W-JC-CRASH Security Gate Matrix

Final: SECURITY_STOP. Bukti source, deterministic fake, historical checkpoint dan current-host OS dibedakan per gate. SOURCE_VERIFIED/STATIC_PASS bukan current OS containment PASS. Partial, NOT_RUN, NOT_VERIFIED, FAILED dan BLOCKED tidak dihitung verified.

Evidence root: <TEMP>/ai-office-m0202s16br6wjccrash-13297220-b3fb-4b2a-ac08-2dada411505b. Path ringkas audit/, runtime/, ownership/, readiness/, static/, fault-injection/ dan safety-review/ berada di evidence/.

Satu sesi runtime dimulai; prelaunch32/32 PASS bukan izin crash otomatis. Membership sebelum resume Assigned1 [32684], sesudah resume Assigned2 [32684,24956]. Target READY ada; full watchdog READY tidak diterbitkan. Watchdog gagal TARGET_NOT_LIVE_MEMBER lalu SECURITY_STOP_HOLD. Coordinator gagal INVALID_RECEIPT_FILE, mengirim abort-file sebelum arm, wait watchdog5000ms mengembalikan258 WAIT_TIMEOUT, kemudian keluar40; outer observer mengonfirmasi exit coordinator. Tidak ada crash-armed receipt, hard-stop0, recovery0, retry0.

Raw coordinator menyimpan RUNTIME_INCONCLUSIVE, SecurityStop=false dan ResourcesClosed=true untuk resource coordinator sendiri. Ketiga field mentah dipertahankan, bukan bukti scope aman. Auditor menetapkan SECURITY_STOP berdasarkan unexpected membership dan watchdog HOLD. Runtime telah dimulai sehingga STATIC_PASS_RUNTIME_BLOCKED juga tidak tepat. Tidak ada bukti watchdog death, target independent exit, atau kill-on-close sukses.

| Gate | Requirement | Status | Actual source / receipt | Tests | Faults | Actual observation |
| --- | --- | --- | --- | --- | --- | --- |
| CR-01 | M3 checkpoint verified | SOURCE_VERIFIED | checkpoint/preflight.json; M3 manifest | T51 | - | M3 actual82 files/81 manifest entries and report hashes verified; old binaries not run |
| CR-02 | Historical evidence preserved | SOURCE_VERIFIED | baseline-protected.json; audit/final-integrity.json | T51 | - | 12 retained roots668 files preserved, unavailable history disclosed |
| CR-03 | Watchdog source provenance | SOURCE_VERIFIED | audit/source-preservation.json; watchdog-exact.diff | T11-T21 | - | Two controls byte-identical; two adapted controls normalized equality after narrow additions |
| CR-04 | Target source provenance | SOURCE_VERIFIED | audit/build-provenance.json synthetic-target sources | T26,T27,T55 | - | New fixed pure idle target; no direct process/job/network API |
| CR-05 | Observer source provenance | SOURCE_VERIFIED | audit/build-provenance.json coordinator sources | T01-T10,T28-T50 | - | New role-scoped observer;11 allowed imports,0 job imports |
| CR-06 | Fixed watchdog executable | HOST_ONLY_OS_VERIFIED | ownership/watchdog-original.json; observer-native identity | T01-T03 | F02 | Fixed watchdog10036/hash/image/time matched |
| CR-07 | Fixed target executable | HOST_ONLY_OS_VERIFIED | ownership/target-original.json; target-ready.json | T04,T05 | F09 | Fixed target32684/hash/image/time verified by original WD handle |
| CR-08 | Executable hashes | SOURCE_VERIFIED | audit/build-provenance.json; runtime authorization | T03,T05 | F02 | Final source/executable hashes match actual artifacts |
| CR-09 | Invocation identity | HOST_ONLY_OS_VERIFIED | component claims; runtime-reconciliation.json | T06 | F14 | Current invocation/generation/nonce correlate all receipts |
| CR-10 | Stale receipt rejection | STATIC_TEST_VERIFIED | Protocol.Current; readiness contract; CrashPolicy | T06,T23 | F14,F31 | Stale nonce/age rejected in fake tests; runtime full WD readiness absent |
| CR-11 | Coordinator original watchdog handle | HOST_ONLY_OS_VERIFIED | ownership/watchdog-original; observer-native create/close | T29 | F04 | Original watchdog PROCESS_INFORMATION retained until cleanup then closed |
| CR-12 | Watchdog process identity | HOST_ONLY_OS_VERIFIED | observer-native identity; watchdog-original.json | T07,T30 | F04 | PID10036/creation134384829523445415/image/hash matched |
| CR-13 | Observer outside Jc | HOST_ONLY_OS_VERIFIED | ownership/observer-outside.json | T09 | F17 | Observer9820 verified outside experiment Jc; ambient job untouched |
| CR-14 | Observer holds no Jc handle | SOURCE_VERIFIED | coordinator IL no Job imports; observer-outside receipt | T10 | F17 | Observer0 intentional Jc handles; no global handle census |
| CR-15 | Private Jc creation | HOST_ONLY_OS_VERIFIED | job-configuration/configured.json; WD hold job events | T11 | F05 | One private unnamed Jc Create success/error0 |
| CR-16 | Kill-on-close configured | HOST_ONLY_OS_VERIFIED | WD hold SetInformationJobObject(class9) event | T12 | F06 | 0x2000 configured before target create |
| CR-17 | Effective Jc limit flags | HOST_ONLY_OS_VERIFIED | WD hold QueryInformationJobObject(class9) event | T13 | F06 | Readback flags8192,size144 |
| CR-18 | No intentional Jc duplication | SOURCE_VERIFIED | PrivateContainmentJob.cs; audit IL; duplicates0 event | T18 | F18 | No intentional Jc duplication/export |
| CR-19 | No Jc handle inheritance | HOST_ONLY_OS_VERIFIED | Jc flags0; CreateProcessW InheritHandlesfalse | T17 | - | Reviewed direct target creation noninheriting; no claim about unknown PID handle table |
| CR-20 | No intentional breakaway | SOURCE_VERIFIED | NativeHost.Create0x08080404; Jc flags0x2000 | T16 | - | No requested breakaway flags |
| CR-21 | No known additional Jc holder | INCONCLUSIVE | watchdog-security-hold.json; runtime-reconciliation.json | T19 | F18 | Sole intentional holder WD, but unexpected member origin/custody unknown; crash cannot arm |
| CR-22 | Atomic target admission | HOST_ONLY_OS_VERIFIED | WD create/JOB_LIST/admission events | T14 | F07 | Initial target atomically admitted |
| CR-23 | No create-then-assign fallback | SOURCE_VERIFIED | NativeHost.Create; IL no AssignProcessToJobObject | T15 | F07 | No create-then-assign/uncontained fallback |
| CR-24 | Target suspended before verification | HOST_ONLY_OS_VERIFIED | CreateProcessW flags; ResumeThread previous count1 | T21 | F12 | Target created suspended, checked before resume |
| CR-25 | Target identity verification | HOST_ONLY_OS_VERIFIED | target-original.json; WD identity queries | T07 | F08,F09 | Original target handle PID32684/time/image matched |
| CR-26 | Target Jc membership | PARTIAL | WD admission queries before and after resume | T21 | F10 | First assigned1[32684]; post-resume assigned2[32684,24956] |
| CR-27 | No unexpected Jc member | FAILED | watchdog-security-hold.json JobEvents | T20 | F11 | Unexpected member PID24956 observed; origin/identity NOT_VERIFIED |
| CR-28 | Target resume | HOST_ONLY_OS_VERIFIED | WD ResumeThread(original) event | T21 | F12 | Resume previous suspend count1/error0 |
| CR-29 | Target READY | HOST_ONLY_OS_VERIFIED | readiness/target-ready.json; original target identity | T22 | F13,F14 | Target READY current nonce/time/hash; WD containment-ready never emitted |
| CR-30 | Target finite self-exit | PARTIAL | target source; target-self-exit.json | T25,T26 | F27 | 90s monotonic self-exit receipt observed; actual process exit not independently waited |
| CR-31 | No target children | NOT_VERIFIED | WD last members2; source/IL target0 direct creator calls | T27 | F11 | PID24956 not assumed child or unrelated; no zero-descendant runtime claim |
| CR-32 | Observer target handle acquisition | NOT_RUN | observer-native TargetPID0/no target OpenProcess calls | T43 | F15 | Observer never reached target handle acquisition |
| CR-33 | Observer target identity | NOT_VERIFIED | ownership/target-observer.json ABSENT | T07,T08 | F16 | No independent observer target identity verified |
| CR-34 | Observer target creation time | NOT_VERIFIED | target-observer handle stage NOT_REACHED | T07 | F08 | Original WD creation known, observer independent creation check not reached |
| CR-35 | Observer target executable identity | NOT_VERIFIED | target-observer handle stage NOT_REACHED | T04,T05 | F09 | Original WD image known; observer independent check not reached |
| CR-36 | Target alive before crash | NOT_RUN | no crash-armed.json; coordinator final Armedfalse | T24 | F20 | No immediately-pre-hard-stop target sample because crash not armed |
| CR-37 | Watchdog alive before crash | PARTIAL | observer-native watchdog wait0/cleanup wait5000 | T30 | F19 | WD alive during preparation; no crash stage reached |
| CR-38 | Crash-arm preconditions | BLOCKED | WD hold + missing watchdog-ready.json | T28 | F11,F13 | Membership contradiction blocks dynamic crash arm |
| CR-39 | Watchdog termination authority | BLOCKED | owner-disposition-required.json; original WD handle close | T29,T30 | F04 | No armed authority; original coordinator WD handle now closed |
| CR-40 | One deliberate hard-stop maximum | SOURCE_VERIFIED | NativeHardStopRequests0; exclusive claims | T31 | F32 | At most1 enforced; actual0, session consumed |
| CR-41 | Watchdog termination request | NOT_RUN | hardstop receipt ABSENT; native calls no Terminate | T32 | F22 | Deliberate watchdog termination request0 |
| CR-42 | Watchdog independent exit wait | PARTIAL | observer-native WaitForSingleObject(original watchdog) | T33-T35 | F23,F24 | Abort cleanup wait5000 returned258, not exit |
| CR-43 | Watchdog exit status | NOT_VERIFIED | observer-native no watchdog GetExitCode success record | T34,T35 | F23,F24 | Watchdog exit status unknown |
| CR-44 | Target independent exit wait | NOT_RUN | observer-native no target wait handle | T36-T40 | F25,F26 | Independent target exit wait not reached |
| CR-45 | Target exit status | NOT_VERIFIED | target-self-exit.json only | T36,T41 | F27 | Self-exit code receipt not independent process exit status |
| CR-46 | Target exit timing | NOT_VERIFIED | target self deadline receipt only | T36,T41 | F27 | No post-WD-death target exit timing |
| CR-47 | Self-exit confounder excluded | FAILED | target-self-exit.json + hardstop0 | T41 | F27 | Cooperative deadline action observed; no Jc cleanup attribution possible |
| CR-48 | Recovery termination count | HOST_ONLY_OS_VERIFIED | observer-native NativeRecoveryRequests0 | T42,T46 | F28-F30 | Recovery not used |
| CR-49 | Recovery identity authorization | NOT_VERIFIED | no verified observer target handle; owner disposition | T43-T49 | F28 | Recovery identity precondition never established dynamically |
| CR-50 | Recovery exit accounting | NOT_RUN | recovery request/exit receipts ABSENT | T47,T48 | F29,F30 | No recovery exit/accounting claim |
| CR-51 | No false PASS after recovery | STATIC_TEST_VERIFIED | CrashPolicy recovery branch | T39,T42 | F26 | Fake recovery cannot produce controlled-crash PASS |
| CR-52 | No PID-only kill | SOURCE_VERIFIED | coordinator hidden role handles; no Terminate calls actual | T44 | F34 | No PID-only termination |
| CR-53 | No name-wide kill | SOURCE_VERIFIED | source/IL no enumeration/name-kill | T45 | - | No process-name-wide termination |
| CR-54 | No unrelated termination | SOURCE_VERIFIED | all reviewed term counters0; WD HOLD prevented job close | T30,T44,T45 | F11 | No intentional unrelated termination; unknown member not queried or acted on |
| CR-55 | No runtime retry | SOURCE_VERIFIED | exclusive claims; no-retry.json | T31,T50 | F32 | No second run; remaining sessions0 |
| CR-56 | Coordinator failure model | SOURCE_VERIFIED | safety-review/coordinator-failure-model.json | T50 | F01,F33 | C01-C10 design scope only; preserved exceptional HOLD actually reached |
| CR-57 | Static tests | STATIC_TEST_VERIFIED | static/results-initial.json; summary-initial.json | T01-T56 | - | 56 PASS,0 FAIL/SKIP/TIMEOUT; cannot override runtime failure |
| CR-58 | Fault injection | STATIC_TEST_VERIFIED | fault-injection/results-initial.json | - | F01-F34 | 34 PASS,0 FAIL/SKIP/TIMEOUT; models not OS proof |
| CR-59 | Source/IL audit | SOURCE_VERIFIED | audit/api-il-audit.json | R01-R35 | - | Coordinator11 imports1359 refs; WD20/2069; target0/284; test0/646 |
| CR-60 | Builds and SHA-256 | SOURCE_VERIFIED | audit/build-provenance.json; inventory/manifest.json | R32 | - | 9 compiler exits0/0warnings,1 static repair; final artifacts frozen after runtime |
| CR-61 | Internal adversarial review | SOURCE_VERIFIED | safety-review/internal-review.json | R01-R35 | - | Pre-run same-agent review35/35 PASS, does not supersede runtime stop |
| CR-62 | Runtime preflight | PARTIAL | runtime/prelaunch-decision.json; crash arm absent | PF01-PF32 | F11 | 32 prelaunch PASS; actual readiness/membership crash-arm gate FAILED |
| CR-63 | Runtime budget | PARTIAL | runtime-reconciliation Counts; WD member2 | T31,T46 | F11,F32 | 1 coordinator/WD/intended target/Jc,J00,stop0,recovery0; one extra job member unresolved |
| CR-64 | Actual OS watchdog death | NOT_VERIFIED | WD original wait258/security HOLD | T33-T35 | F23,F24 | No actual watchdog death confirmed |
| CR-65 | Actual OS target exit | NOT_VERIFIED | no independent target handle; self receipt only | T36-T41 | F27 | No actual independent target exit confirmation |
| CR-66 | Source/system integrity | SOURCE_VERIFIED | audit/final-integrity.json; baseline snapshots | T51 | - | Scoped files preserved, runtime resource disposition INCOMPLETE |
| CR-67 | Gate C | FAILED | runtime-reconciliation GateC | T11-T21 | F11 | Gate C FAILED: unexpected member |
| CR-68 | Gate D | NOT_RUN | runtime-reconciliation GateD | T28-T35 | F22-F24 | Gate D NOT_RUN: no hard-stop/no verified WD exit |
| CR-69 | Gate K | NOT_VERIFIED | runtime-reconciliation GateK | T36-T49 | F25-F30 | Gate K NOT_VERIFIED: no crash, no independent target exit |
| CR-70 | Gate S | BLOCKED | runtime-reconciliation GateS | - | - | Real-worker security BLOCKED |
| CR-71 | No MXC | SOURCE_VERIFIED | fixed binaries/source/command audit | T53 | - | No MXC invocation; candidate not restored |
| CR-72 | No app-server | SOURCE_VERIFIED | source/IL/command audit | T54 | - | No app-server invocation |
| CR-73 | No real worker | SOURCE_VERIFIED | fixed synthetic-only reviewed launch paths | T52 | - | No worker activated by reviewed experiment; unknown member activity not inferred |
| CR-74 | No inference/paid API | SOURCE_VERIFIED | source/IL/command audit; references.json | T55 | - | No inference/provider auth/paidAPI by experiment; public docs browsing only |
| CR-75 | No production source/DB change | SOURCE_VERIFIED | baseline-ai/final-integrity.json | T51 | - | 461 existing files unchanged; exactly2 new reports |
| CR-76 | External malicious handles | NOT_VERIFIED | Report A AE | - | - | Malicious same-user/external-handle access not tested |
| CR-77 | Real process-tree cleanup | NOT_VERIFIED | Report A AE; extra member unresolved | - | - | Process-tree cleanup not tested; extra PID not assumed descendant |
| CR-78 | MXC nested-job compatibility | BLOCKED | missing candidate record | T53 | - | MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE |
| CR-79 | Physical output and credential fencing | NOT_VERIFIED | Report A AE | - | - | Physical output/credential fencing unverified |
| CR-80 | Real worker readiness | BLOCKED | GateS/owner disposition required | - | - | Real worker readiness BLOCKED |


## Source mappings and actual test evidence

coordinator/{Observer.cs,Native.cs,CrashPolicy.cs,Protocol.cs}: native custody/readiness/once-controller. watchdog/{CrashWatchdog.cs,NativeHost.cs,PrivateContainmentJob.cs,Lifecycle.cs,ReporterReceipt.cs,Protocol.cs}: atomic admission/private Jc/unsafe HOLD. synthetic-target/{Program.cs,Protocol.cs}: finite idle-only target. tests/CrashTests.cs: deterministic controller/fault tests. All actual source hashes below. T01-T56 final56PASS, F01-F34 final34PASS,0FAIL/SKIP/TIMEOUT; detail each row in companion report U/V dan JSON receipts. Test strings are not runtime observations; T27 no-child-source does not establish actual descendant count.

| Role | Source | SHA-256 |
| --- | --- | --- |
| coordinator | source/coordinator/CrashPolicy.cs | C0B9217E3A7E3FA75B8181A55A65A455089AA7D29FAE4EA8DC5372C234D539E1 |
| coordinator | source/coordinator/Native.cs | 36208DC200BC0678A80F69E1F990622229EEDF17736CAEF858D03842BD724932 |
| coordinator | source/coordinator/Observer.cs | FFE7A8ECE833EB9B407C95A9E65EE98EBA6622010C46FEA87EDC7D5E66FF937B |
| coordinator | source/coordinator/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| watchdog | source/watchdog/CrashWatchdog.cs | 129CA1D7D395EDE1979EFB126DCA12286A7D502D6CB79D0B33CCF7A2DB0A4947 |
| watchdog | source/watchdog/Lifecycle.cs | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| watchdog | source/watchdog/NativeHost.cs | DB797883179ABF8C5BB8B487881FB7772D15F3863E1CE067BC96440366C173B2 |
| watchdog | source/watchdog/PrivateContainmentJob.cs | 93AC5984A67F18705B052BC27BA57DE58E968113291D63EA044563070FC86855 |
| watchdog | source/watchdog/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| watchdog | source/watchdog/ReporterReceipt.cs | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| synthetic-target | source/synthetic-target/Program.cs | A6EEBB60C3E632ECD26C981AD982003E299D4473F0909617C39345073017246F |
| synthetic-target | source/synthetic-target/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| tests | source/tests/CrashTests.cs | A4A52FB49571373F9CADED2F174BD71B02E2614B12A68340D59D6F9F87A0DC57 |


## Executable provenance

9 successful compiler invocations,0warnings,1static repair. IL imports coordinator11, watchdog20,target0,tests0; review35PASS and prelaunch32PASS only before native dynamic gate.

| Role | Binary | SHA-256 |
| --- | --- | --- |
| coordinator | build/coordinator/ExternalObserver.exe | E53297347FEC050B60D93611B4FDB4DED4E742F1EA81B9715DBE5A1F646803FC |
| watchdog | build/watchdog/CrashWatchdog.exe | 5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051 |
| synthetic-target | build/synthetic-target/SyntheticTarget.exe | D37BE09BC8B13F8C61FD25891C1D7D216B4CFA532B649162EDDA31A4D696133A |
| tests | build/tests/Crash.Tests.dll | 25053DA4682189DDE799C83FC44DBA405DFE3D63CBC0ED577A13D3D298EC4475 |


## Identities, Jc and membership

Coordinator PID9820, creationUTC2026-11-06T23:55:51.9795274Z, FILETIME134384829519795274; watchdog PID10036 FILETIME134384829523445415; target PID32684 FILETIME134384829525959601. PID24956 tidak memiliki creation/image/origin yang direkam; tidak diasumsikan child/helper/unrelated. PID adalah label evidence, bukan otoritas kontrol. Jc NULL-name/noninherit flags0, kill-on-close0x2000 readback before create. Initial membership1 [32684]; subsequent2 [32684,24956]. Intentional Jc handle remains with WD; observer outside receipt true, intentional Jc handles0. No global handle-exclusivity proof.


## Readiness, arm, termination and independent exits

Target READY present; full WD READY absent. Crash-arm rejected; WDhard-stop0. WD independent wait258 timeout, death/code unverified. Target observer handle not acquired, independent wait NOT_RUN. Cooperative self-exit receipt QPC220699331/deadline220699318/code0x43525301 cannot prove actual exit or containment. Recovery0. Raw observer TargetPID0 means stage not reached. Coordinator independently exited40.


## Resources and residual ownership

Coordinator menutup original watchdog process/thread handles dan dua image-file locks miliknya. Observer target query/recovery handles tidak pernah diperoleh. Receipt terakhir watchdog menyatakan SECURITY_STOP_HOLD: Jc serta original target process/thread handles ditahan; tidak ada release proof. Buffer admission ditelusuri dalam watchdog-native resources; tidak ada klaim seluruh eksperimen sudah bersih. Global Jc handle census tidak dilakukan. Current watchdog liveness tidak di-query ulang.


## Acceptance gates and last-handle limits

CFAILED / DNOT_RUN / KNOT_VERIFIED / SBLOCKED. Intended exclusive handle custody cannot prove absence of hostile same-user handles. Kill-on-last-close contract is not evidence last close occurred. Unexpected membership is not attributed to a parent/child relation; real process-tree readiness remains unverified. CR-76 through80 never VERIFIED.


## Source and system integrity

Baseline461 file AI-Office dipertahankan byte-for-byte; final463 dengan tepat dua laporan baru. Git status138 entri awal menjadi140, entri lama dipertahankan. Protected12 roots/668 files, M3 82files/81manifest entries, active Codex50 files, Hermes3D647 tracked files/pathset diverifikasi sesuai inventory. Scope AI mengecualikan .git/node_modules; exclusions setiap protected root dipertahankan; Hermes hanya tracked. Riwayat2209 files/17roots yang tidak tersedia menurut record sebelumnya tidak diklaim verified. Pinned candidate tetap hilang: MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE. Final pembuktian: evidence/audit/final-integrity.json dan manifest.json. External malicious same-user handle access, global last-handle exclusivity, real descendant/process-tree cleanup, breakaway/nested jobs, physical output/credential fencing, provider entitlement dan billing belum diverifikasi. Tidak ada J0, MXC, app-server, real worker, inference, paid API, atau provider authentication dalam eksperimen. Tidak ada privilege/token/ACL/registry/Defender/firewall/UAC/service/task mutation dalam kode/command yang diaudit; bukan global system-state census. Public Microsoft documentation browsing memang dilakukan sesuai instruksi; tidak boleh dilabeli zero seluruh external network. Aktivitas PID tak terduga tidak diketahui.


## Historical safety and unavailable runtime

PID23376/23644 HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; old watchdog/reporter PIDs historical only. M3 and prior manifests/reports preserved. MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; candidate not restored; active global Codex not substituted or modified.


## One next action

Satu langkah berikut yang direkomendasikan: audit read-only, dengan otorisasi terpisah, atas provenance anggota Jc tak terduga dan custody watchdog residual. Ini bukan izin termination, penutupan Jc, retry, atau validasi process-tree. PID saat ini tidak membuktikan identitas historis PID24956.

