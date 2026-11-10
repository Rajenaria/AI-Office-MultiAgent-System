# M02-02S16B-R6W-JC-CRASH Controlled Watchdog-Crash Containment Report

Evidence root: <TEMP>/ai-office-m0202s16br6wjccrash-13297220-b3fb-4b2a-ac08-2dada411505b. Semua receipt paths berikut relatif terhadap evidence/ kecuali source/, build/, inventory/.
Invocation bd489e2b-c337-43dd-a9fb-2c06f169ebd0; generation552c4ecd-f335-44e1-80ff-376c1f2a8430; nonce93739331-a14b-415f-b915-a1666f621db8. Audit date2026-11-07 Asia/Jakarta; runtime UTC2026-11-06.

## A. Executive decision

SECURITY_STOP. Satu sesi runtime dimulai; prelaunch32/32 PASS bukan izin crash otomatis. Membership sebelum resume Assigned1 [32684], sesudah resume Assigned2 [32684,24956]. Target READY ada; full watchdog READY tidak diterbitkan. Watchdog gagal TARGET_NOT_LIVE_MEMBER lalu SECURITY_STOP_HOLD. Coordinator gagal INVALID_RECEIPT_FILE, mengirim abort-file sebelum arm, wait watchdog5000ms mengembalikan258 WAIT_TIMEOUT, kemudian keluar40; outer observer mengonfirmasi exit coordinator. Tidak ada crash-armed receipt, hard-stop0, recovery0, retry0. Raw coordinator menyimpan RUNTIME_INCONCLUSIVE, SecurityStop=false dan ResourcesClosed=true untuk resource coordinator sendiri. Ketiga field mentah dipertahankan, bukan bukti scope aman. Auditor menetapkan SECURITY_STOP berdasarkan unexpected membership dan watchdog HOLD. Runtime telah dimulai sehingga STATIC_PASS_RUNTIME_BLOCKED juga tidak tepat. Tidak ada bukti watchdog death, target independent exit, atau kill-on-close sukses.


## B. M3 checkpoint

Dilanjutkan dari M3, bukan investigasi ulang S16. M3 manifestSHA256 1A663E1832A8021C462B37917C74B26AB6D54264697181A60F73732AB33F6DDD; completion6D98D5784B3CA86DE50F3773C2B09FA101B6502FEA964AEFF5AB027C4ED7CD17; matrix133CA39220412FA8184EF6F22EBF2198E4B6D8845661E01F96EB21EC4063D1AD. Gate historis C/L/J0 PASS, Tpartial, SBLOCKED; normal exit M3 bukan controlled-crash proof. PID23376 dan23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; PID M3 juga hanya evidence historis, tidak digunakan sebagai control targets.


## C. Owner authorization

Prompt mengizinkan satu bounded session dengan observer, watchdog, target dan Jc; hard-stop hanya melalui original watchdog handle setelah seluruh dynamic gates terpenuhi, target recovery paling banyak sekali setelah verified handle. Prelaunch AUTHORIZED; crash-arm NOT AUTHORIZED karena membership contradiction. Sesi sudah dikonsumsi; tidak ada retry atau proses kontrol tambahan. Otorisasi lama tidak bisa direkonstruksi dengan PID.


## D. Experiment topology

External PowerShell launcher memegang coordinator Process object untuk bounded outer wait. Coordinator/external observer membuat satu disposable watchdog; watchdog di luar private Jc memiliki Jc dan original handles target. Target saja yang dimaksud masuk Jc secara atomik. Observer tidak memegang Jc. Hasil aktual memiliki satu anggota tambahan tak teridentifikasi; topology yang dimaksud tidak dianggap membuktikan topology lengkap aktual.


## E. Coordinator/observer architecture

Fixed executable/hash/role; original watchdog process/thread handles; no job imports. Target query handle0x00101000 baru dapat dibuka setelah WD READY sah, lalu independent recovery handle0x00101001 setelah identity/alive check; stage ini tidak tercapai. No ALL_ACCESS, memory rights, PID-only authority, shell kill atau name matching. Image files dikunci read-share. QPC monotonic, exclusive role/run claims, minimal environment dan bounded fresh receipts.


## F. Synthetic target design

Target baru hanya init, self identity, READY, idle Sleep20ms, dan cooperative90s deadline. Tidak ada native imports, Process.Start, network/provider/job API atau worker capability. Nol direct process-create call bukan bukti nol actual descendants: unexpected member membuat descendants NOT_VERIFIED. Cooperative deadline bukan absolute OS progress guarantee.


## G. Watchdog source preservation

Lifecycle.cs dan ReporterReceipt.cs identik dengan M3. NativeHost.cs hanya mengganti target tetap dan menambahkan ObserverOutside/Capture; PrivateContainmentJob.cs hanya menambah query outside. Normalized comparison menghapus tambahan sempit itu dan menormalkan newline, tanpa mengubah critical admission/custody/stop/disposition. CrashWatchdog.cs adalah adapter entry baru; tidak menjalankan reporter/J0. Sticky unsafe-membership HOLD M3 dipertahankan. Exact diff dan SHA tersedia di audit/source-preservation.json serta watchdog-exact.diff.


## H. Jc configuration

Satu CreateJobObjectW dengan NULL name/security attrs, noninheritable handle flags0. JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE0x2000/8192 ditetapkan dan dibaca ulang sebelum target dibuat. J0 nol. Konfigurasi terbukti melalui job-configuration/configured.json; penutupan last handle dan efek death tidak diuji karena HOLD.


## I. Atomic admission

CreateProcessW suspended+extended startup, PROC_THREAD_ATTRIBUTE_JOB_LIST0x2000d, flags0x08080404. Tidak ada create-then-assign fallback atau intentional breakaway. Identity dan membership1 diverifikasi sebelum ResumeThread(previouscount1). Query setelah resume menemukan membership2 dan langsung membatalkan readiness/crash.


## J. Handle inheritance and custody

No intentional DuplicateHandle, target bInheritHandles=false, private Jc bukan exported control handle. Observer query outside ditutup. Custody intensional hanya watchdog tidak membuktikan malicious same-user tidak dapat memperoleh handle. Unknown membership melarang penutupan Jc spekulatif karena kill-on-close dapat mengenai proses yang asalnya belum diketahui.


## K. Exact process identity

Coordinator PID9820, creationUTC2026-11-06T23:55:51.9795274Z, FILETIME134384829519795274; watchdog PID10036 FILETIME134384829523445415; target PID32684 FILETIME134384829525959601. PID24956 tidak memiliki creation/image/origin yang direkam; tidak diasumsikan child/helper/unrelated. PID adalah label evidence, bukan otoritas kontrol.


## L. Target readiness

readiness/target-ready.json terikat invocation/generation/nonce, target PID/time/hash dan QPC. Start220609318; READY220609379; deadline220699318; frequency10000000. READY target bukan full readiness. Full watchdog-ready absent setelah query membership gagal; observer target handle/pre-crash alive/identity stage tidak dijalankan.


## M. Crash-arm preflight

Static/fake/review dan prelaunch PASS, tetapi dynamic singleton membership, current observer target handle, fresh alive/identity, sufficient deadline margins dan complete watchdog READY wajib sebelum arm. Tidak ada crash-armed.json. Tidak ada otorisasi deliberate termination yang diterbitkan.


## N. Watchdog hard-stop

NOT_RUN. Native hard-stop requests0. Tidak ada TerminateProcess watchdog request/result atau receipt. Code memiliki once guard dan revalidasi original handle, tetapi itu evidence source/fake saja.


## O. Watchdog exit verification

Independent observer wait atas original watchdog process handle: WAIT_TIMEOUT258 setelah5000ms. Exit watchdog tidak teramati; exit code NOT_VERIFIED. Handle asli kemudian ditutup oleh coordinator. Current liveness tidak diperiksa ulang; last recorded state SECURITY_STOP_HOLD, bukan klaim status hidup saat laporan.


## P. Target independent exit observation

NOT_RUN: observer target handle tidak pernah diperoleh. Tidak ada wait confirmation, target actual exitFILETIME atau actual OS exit code. Raw observer TargetPID0 berarti stage belum dicapai, bukan target tidak dibuat; identitas WD mencatat32684.


## Q. Kill-on-close interpretation

NOT_VERIFIED. Jc configured0x2000 berbeda dengan membuktikan last handle closed, watchdog dead, target dead atau hubungan sebab-akibat. Tidak ada crash; Jc sengaja ditahan setelah contradiction. Recovery maupun cooperative self-exit tidak dapat dihitung sebagai cleanup Jc.


## R. Self-exit confounder analysis

Target menulis target-self-exit.json pada QPC220699331,13ms setelah cooperative deadline220699318, planned code1129468673/0x43525301. Ini receipt dari target sebelum return, bukan independent wait/GetExitCodeProcess proof. Tidak dapat mengesampingkan self-exit confounder; tidak membuktikan Jc cleanup atau OS death.


## S. Recovery path, if used

NOT USED. Recovery requests0 dan verified independent target recovery handle tidak tersedia. Source/fake mensyaratkan query/time/image/liveness dan maxone request, accepted bukan exit, recovery tidak boleh PASS. Tidak ada reopen-by-PID untuk meneruskan otoritas. recovery/owner-disposition-required.json mencatat pending audit.


## T. Coordinator failure analysis

Sepuluh design-only windows, bukan runtime crash injection. WD cooperative45s dan target90s merupakan safety backstop normal; unsafe-scope HOLD sengaja tidak memiliki automatic kill deadline. Coordinator yang telah mati tidak dapat recovery tanpa persistent supervisor. Hold ini membatasi klaim bounded keseluruhan lifecycle.

| ID | Window | Safeguard | Limitation |
| --- | --- | --- | --- |
| C01 | Before WD creation | No created child or Jc | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C02 | After WD creation before Jc | WD observer check may abort; otherwise WD45s/target90s safety deadlines | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C03 | After target creation before READY | WD original custody/Jc45s normal cleanup; target90s; contradictory scope uses explicit HOLD | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C04 | After target observation handle acquired | Coordinator death closes process handles, which do not keep process running; WD owns Jc | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C05 | Immediately before hard-stop | No hard-stop by dead coordinator; WD45s cleanup and target90s, result cannot PASS | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C06 | Immediately after request | Accepted is not exit, no survivor observer can complete evidence; no retry | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C07 | After WD exit before target observation | Jc behavior only documented expectation until independent evidence; target90s defense | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C08 | During recovery | One request possibly in flight; no second attempt or persistent supervisor | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C09 | After target exit before final receipt | Missing finalized evidence remains INCONCLUSIVE | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |
| C10 | During handle cleanup | Observer0Jc handles; native close failures recorded; OS teardown only documented expectation | Cooperative deadlines are not absolute OS lifetime guarantee; coordinator cannot recover after own crash without persistent supervisor |


## U. Static tests

56PASS,0FAIL,0SKIP,0TIMEOUT, deterministic fake/source evidence. Hasil awal56/34 dan pre-repair source/binaries disimpan; satu static repair cycle sebelum runtime menambah final recheck, physical exit ordering/T38, serta membetulkan F32 expected/actual label tanpa mengurangi assertions. Semua56 test berikut adalah hasil final; nama test tidak boleh dipromosikan menjadi OS observations.

| ID | Test | Result | Evidence class |
| --- | --- | --- | --- |
| T01 | Fixed watchdog executable | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T02 | Unknown watchdog rejected | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T03 | Watchdog hash mismatch | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T04 | Fixed target | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T05 | Target hash mismatch | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T06 | Stale nonce rejected | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T07 | Creation mismatch rejected | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T08 | PID reuse cannot authorize | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T09 | Observer outside Jc required | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T10 | Observer no Jc required | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T11 | Private unnamed Jc | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T12 | Kill configured | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T13 | Effective flags readback | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T14 | Atomic admission | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T15 | No create assign fallback | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T16 | No breakaway | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T17 | No inheritance | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T18 | No Jc duplication | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T19 | Unknown or extra holder blocks | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T20 | Unexpected member blocks | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T21 | Membership before resume | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T22 | Correct readiness | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T23 | Stale readiness rejected | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T24 | Target alive required | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T25 | Target deadline distant | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T26 | Finite target deadline | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T27 | Target no children | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T28 | All gates before arm | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T29 | Original watchdog required | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T30 | Watchdog identity mismatch | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T31 | Single request maximum | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T32 | Terminate failure preserved | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T33 | Accepted not exit | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T34 | Watchdog timeout | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T35 | Watchdog wait failure | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T36 | Target observation after watchdog | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T37 | Pre-stop target exit rejected | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T38 | Early target exit or no watchdog confirmation cannot pass | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T39 | Target timeout uses recovery | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T40 | Target wait failure no pass | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T41 | Self-exit confounder | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T42 | Recovery never Jc pass | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T43 | Recovery requires verified handle | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T44 | No PID-only recovery | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T45 | No name kill | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T46 | Recovery once | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T47 | Recovery failure | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T48 | Recovery acceptance not exit | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T49 | Unknown identity blocks recovery | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T50 | No retry after cleanup uncertainty | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T51 | Production source snapshot untouched | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T52 | No worker path | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T53 | No MXC invocation | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T54 | No app-server | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T55 | No provider/network | PASS | DETERMINISTIC_FAKE_OR_SOURCE |
| T56 | No extra job creators | PASS | DETERMINISTIC_FAKE_OR_SOURCE |


## V. Fault injection

34PASS,0FAIL,0SKIP,0TIMEOUT. Semua FAKE_PROVIDER_ONLY, initial stateFAKE_ONLY_NOT_STARTED. Kolom ExitW/T adalah fake observation. Resource disposition tiap row FAKE_HANDLES_CLOSED; detail lengkap termasuk false/failed transitions pada fault-injection/results-initial.json. Tidak ada native fault retry.

| ID | Injection | Expected | Actual | Arm | WD requests | WD exit | Target exit | Recovery | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | Init | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F02 | BadWatchdogHash | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F03 | CreateFailure | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F04 | OriginalLost | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F05 | JcCreate | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F06 | JcSet | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F07 | AtomicFailure | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F08 | TargetIdentity | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F09 | TargetImage | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F10 | MemberFailure | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F11 | UnexpectedMember | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F12 | ResumeFailure | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F13 | ReadyTimeout | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F14 | StaleNonce | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F15 | OpenDenied | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F16 | ObserverIdentity | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F17 | ObserverOwnsJc | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F18 | OtherHolder | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F19 | WatchdogExited | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F20 | TargetExited | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F21 | LateArm | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F22 | TerminateFail | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | True | True | 0 | PASS |
| F23 | WatchdogWaitFail | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | False | False | 0 | PASS |
| F24 | WatchdogTimeout | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | False | False | 0 | PASS |
| F25 | Normal | CONTROLLED_CRASH_CONTAINMENT_PASS | CONTROLLED_CRASH_CONTAINMENT_PASS | True | 1 | True | True | 0 | PASS |
| F26 | TargetTimeout | RECOVERY_REQUIRED_CONTAINMENT_NOT_VERIFIED | RECOVERY_REQUIRED_CONTAINMENT_NOT_VERIFIED | True | 1 | True | True | 1 | PASS |
| F27 | SelfExit | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | True | True | 0 | PASS |
| F28 | RecoveryUnavailable | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F29 | RecoveryFail | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | True | False | 1 | PASS |
| F30 | RecoveryWaitFail | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | True | False | 1 | PASS |
| F31 | EvidenceCorrupt | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | False | 0 | False | False | 0 | PASS |
| F32 | SecondRun | SECOND_RUNTIME_DENIED | SECOND_RUNTIME_DENIED | True | 1 | True | True | 0 | PASS |
| F33 | CleanupFail | NO_CONTROLLED_CRASH_PASS | RUNTIME_INCONCLUSIVE | True | 1 | True | True | 0 | PASS |
| F34 | IdentityLost | SECURITY_STOP | SECURITY_STOP | True | 1 | True | False | 0 | PASS |


## W. Source/IL audit

Coordinator11 imports/1359own-IL references; watchdog20/2069; target0/284; tests0/646. Coordinator tidak memiliki Job APIs; target/test tidak memiliki native imports. Allowlist memblokir shell/other launch, token/privilege/ACL changes, native job assignment fallback, duplication, networking, dynamic calli. Initial falsepositives dipertahankan: custom IExperiment.Exit adalah query exitcode bukan Environment.Exit; test-only Assembly.GetTypes adalah metadata read; Process API hanya self GetCurrentProcess/Id/StartTime. Framework internals tidak seluruhnya didisassemble. audit/api-il-audit.json dan initial-il-findings.json.


## X. Builds and hashes

CompilerFramework64 csc14.8.10001.0, Authenticode MicrosoftValid, SHA256ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3. x64 optimize+/warn4/warnaserror+,9 compiler exits0,0warnings,1static repair. Build-provenance RuntimeBudgetUnused=true adalah snapshot pra-runtime historis; reconciliation menyatakan budget consumed. Sources/binaries dibekukan setelah runtime, perubahan0.

| Role | Path | Bytes | SHA-256 |
| --- | --- | --- | --- |
| coordinator | build/coordinator/ExternalObserver.exe | 61952 | E53297347FEC050B60D93611B4FDB4DED4E742F1EA81B9715DBE5A1F646803FC |
| watchdog | build/watchdog/CrashWatchdog.exe | 95232 | 5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051 |
| synthetic-target | build/synthetic-target/SyntheticTarget.exe | 16384 | D37BE09BC8B13F8C61FD25891C1D7D216B4CFA532B649162EDDA31A4D696133A |
| tests | build/tests/Crash.Tests.dll | 33280 | 25053DA4682189DDE799C83FC44DBA405DFE3D63CBC0ED577A13D3D298EC4475 |

| Role | Source | Bytes | SHA-256 |
| --- | --- | --- | --- |
| coordinator | source/coordinator/CrashPolicy.cs | 7213 | C0B9217E3A7E3FA75B8181A55A65A455089AA7D29FAE4EA8DC5372C234D539E1 |
| coordinator | source/coordinator/Native.cs | 2701 | 36208DC200BC0678A80F69E1F990622229EEDF17736CAEF858D03842BD724932 |
| coordinator | source/coordinator/Observer.cs | 16515 | FFE7A8ECE833EB9B407C95A9E65EE98EBA6622010C46FEA87EDC7D5E66FF937B |
| coordinator | source/coordinator/Protocol.cs | 4030 | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| watchdog | source/watchdog/CrashWatchdog.cs | 7380 | 129CA1D7D395EDE1979EFB126DCA12286A7D502D6CB79D0B33CCF7A2DB0A4947 |
| watchdog | source/watchdog/Lifecycle.cs | 11584 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| watchdog | source/watchdog/NativeHost.cs | 13592 | DB797883179ABF8C5BB8B487881FB7772D15F3863E1CE067BC96440366C173B2 |
| watchdog | source/watchdog/PrivateContainmentJob.cs | 12975 | 93AC5984A67F18705B052BC27BA57DE58E968113291D63EA044563070FC86855 |
| watchdog | source/watchdog/Protocol.cs | 4030 | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| watchdog | source/watchdog/ReporterReceipt.cs | 3575 | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| synthetic-target | source/synthetic-target/Program.cs | 1103 | A6EEBB60C3E632ECD26C981AD982003E299D4473F0909617C39345073017246F |
| synthetic-target | source/synthetic-target/Protocol.cs | 4030 | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| tests | source/tests/CrashTests.cs | 14140 | A4A52FB49571373F9CADED2F174BD71B02E2614B12A68340D59D6F9F87A0DC57 |


## Y. Internal adversarial review

35/35 PASS pra-run, second pass oleh agent yang sama, bukan independent human review. Hasil menilai implementasi dan failure model, bukan menjamin singleton OS membership. Actual HOLD/SECURITY_STOP mengalahkan klaim kesiapan yang lebih luas. Tidak ada perbaikan source pasca-runtime.

| ID | Question | Evidence | Pre-run result |
| --- | --- | --- | --- |
| R01 | Is the target truly synthetic and non-worker? | SyntheticTarget pure init/READY/idle/finite exit, not worker | PASS |
| R02 | Can it create children? | Target0 native imports/no Process.Start; T27 | PASS |
| R03 | Does it have a finite self-exit deadline? | Target90000ms monotonic loop and unique SELF_CODE; T26 | PASS |
| R04 | Does it access production project files? | Protocol.PathOf bounds all writes to fresh root; T51 | PASS |
| R05 | Does it access credentials? | No credentials/provider code, only SystemRoot launch env read; T55 | PASS |
| R06 | Does it access the network? | No System.Net or network/provider calls; IL and T55 | PASS |
| R07 | Is watchdog creation fixed and hash-verified? | Fixed WD path/hash/share-read lock; T01-T03 | PASS |
| R08 | Is target creation fixed and hash-verified? | M3 NativeHost fixed target/hash lock; T04-T05 | PASS |
| R09 | Is Jc private? | PrivateContainmentJob source equality except observer read-only query; T11 | PASS |
| R10 | Is kill-on-close configured before admission? | Configure0x2000/readback before Create unchanged; T12/T13 | PASS |
| R11 | Is atomic admission preserved? | JOB_LIST atomic suspended path unchanged; T14/T15 | PASS |
| R12 | Is target membership verified before resume? | VerifyAdmission/identity before Resume; T21 | PASS |
| R13 | Is observer outside Jc? | WD identity-checks observer process and IsProcessInJob false; observer cannot getJc | PASS |
| R14 | Does observer hold any Jc handle? | Coordinator0 Job imports,0 Jc handle exports; T10 | PASS |
| R15 | Can Jc handles be inherited? | NULL job attrs,flag checks,CreateProcess inheritfalse; T17 | PASS |
| R16 | Are intentional Jc duplicates prohibited? | No DuplicateHandle/export path; T18 | PASS |
| R17 | Can unknown Jc handle custody be ignored? | NoOtherJcHolder required; known unknowns rejectT19; global malicious holders unverified | PASS |
| R18 | Can stale readiness authorize termination? | Nonce/generation,age<=3s,hash/PID/time,3-way receipt matching; T06/T23 | PASS |
| R19 | Can PID reuse target unrelated processes? | Query handle first, creation/image then recovery handle revalidated; T07/T08 | PASS |
| R20 | Does deliberate hard-stop require original watchdog handle? | Original WD PROCESS_INFORMATION private field revalidated; T29/T30 | PASS |
| R21 | Can the coordinator terminate an arbitrary process? | No PID/name CLI, bool role hidden fixed handles; T43-T45 | PASS |
| R22 | Can watchdog termination acceptance be mistaken for exit? | Native request and wait/GetExitCode separate; T32-T35 | PASS |
| R23 | Can target exit before watchdog death be mistaken for cleanup? | WD confirmed before target observation; FILETIME ordering guard and T37/T38 | PASS |
| R24 | Can target self-exit be mistaken for Jc cleanup? | Target deadline margin>60s,SELF_CODE/receipt exclusion and QPC freq check; T25/T41 | PASS |
| R25 | Can recovery termination produce a false PASS? | Recovery never GateK PASS; T39/T42 | PASS |
| R26 | Does recovery require verified exact target identity? | 0x101000 query first then0x101001 verified recovery; T43/T49 | PASS |
| R27 | Are all waits finite? | Ordinary waits bounded; exceptional copied HOLD explicit Owner condition, C01-C10 | PASS |
| R28 | Is one-shot runtime enforcement present? | Exclusive outer/component claims and attempted/termination guards; T31/T46/T50 | PASS |
| R29 | Does any failure permit a second launch? | Second Run after uncertainty denied; F32 and claims | PASS |
| R30 | Is coordinator failure disposition addressed? | C01-C10 documented as design only; no absolute OS-progress/coordinator crash recovery claim | PASS |
| R31 | Are all created handles accounted for? | Native process/thread/candidate/recovery handle cleanup with recorded errors; not global heap census | PASS |
| R32 | Are source and binary hashes recorded? | Source/binary SHA256 and IL inventory, preflight recheck required | PASS |
| R33 | Is production source unchanged? | Actual461 baseline file SHA comparison before fake suite; final2 reports only | PASS |
| R34 | Is hostile same-user access still an acknowledged limitation? | No global same-user handle exclusion claim; GateS BLOCKED | PASS |
| R35 | Is real worker activation impossible? | Fixed synthetic-only target, no AI/network/process-child capability | PASS |


## Z. Runtime preflight

32/32 prerequisite PASS, nonadmin/nonSYSTEM, x64, QPC high-resolution10000000. Authorize one launch only; full dynamic crash preconditions tetap wajib. Static repairs maksimum2, actual1. Final source/binary hash gate sebelum launch PASS.

| ID | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| PF01 | M3 checkpoint verified. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF02 | Latest Jc watchdog source verified. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF03 | Synthetic target source audited. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF04 | Observer source audited. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF05 | All executables built successfully. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF06 | All executable hashes verified. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF07 | Static tests PASS. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF08 | Fault injection PASS. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF09 | Source/IL audit PASS. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF10 | Internal adversarial review PASS. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF11 | No quarantined binary reused. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF12 | Fixed executable paths. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF13 | No arbitrary process launch. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF14 | Private Jc configuration preserved. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF15 | Kill-on-close configuration verified in source. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF16 | Atomic admission retained. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF17 | No uncontained fallback. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF18 | Target membership verified before resume by design. | PASS | SOURCE_DESIGN_PASS; actual handles/membership/outside/identity must additionally pass runtime readiness and crash-arm gates before hard-stop |
| PF19 | Observer does not hold Jc. | PASS | SOURCE_DESIGN_PASS; actual handles/membership/outside/identity must additionally pass runtime readiness and crash-arm gates before hard-stop |
| PF20 | Coordinator original watchdog-handle custody valid. | PASS | SOURCE_DESIGN_PASS; actual handles/membership/outside/identity must additionally pass runtime readiness and crash-arm gates before hard-stop |
| PF21 | Target independent observation design valid. | PASS | SOURCE_DESIGN_PASS; actual handles/membership/outside/identity must additionally pass runtime readiness and crash-arm gates before hard-stop |
| PF22 | Recovery target identity enforcement valid. | PASS | SOURCE_DESIGN_PASS; actual handles/membership/outside/identity must additionally pass runtime readiness and crash-arm gates before hard-stop |
| PF23 | Finite target self-exit available. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF24 | No target children. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF25 | Finite observer waits. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF26 | No deliberate OS security modification. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF27 | No unrelated process termination path. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF28 | No production integrations. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF29 | No prior unresolved current test process. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF30 | Runtime budget unused. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF31 | Evidence root available. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |
| PF32 | No mandatory safety contradiction remains. | PASS | SOURCE_STATIC_HASH_COMMAND_SCOPE_PASS |


## AA. Runtime experiment or NOT RUN

Satu sesi runtime dimulai; prelaunch32/32 PASS bukan izin crash otomatis. Membership sebelum resume Assigned1 [32684], sesudah resume Assigned2 [32684,24956]. Target READY ada; full watchdog READY tidak diterbitkan. Watchdog gagal TARGET_NOT_LIVE_MEMBER lalu SECURITY_STOP_HOLD. Coordinator gagal INVALID_RECEIPT_FILE, mengirim abort-file sebelum arm, wait watchdog5000ms mengembalikan258 WAIT_TIMEOUT, kemudian keluar40; outer observer mengonfirmasi exit coordinator. Tidak ada crash-armed receipt, hard-stop0, recovery0, retry0.


## AB. Actual OS observations

Coordinator PID9820, creationUTC2026-11-06T23:55:51.9795274Z, FILETIME134384829519795274; watchdog PID10036 FILETIME134384829523445415; target PID32684 FILETIME134384829525959601. PID24956 tidak memiliki creation/image/origin yang direkam; tidak diasumsikan child/helper/unrelated. PID adalah label evidence, bukan otoritas kontrol. Evidence: ownership/original receipts; job-configuration/configured.json; watchdog runtime failure/HOLD; exit-observation/outer-result.json; audit/runtime-reconciliation.json. Exactly one coordinator, one intended WD and one intended target creation, one Jc,0J0. ObservedUnexpectedJcMembers1; actual TargetDescendants NOT_VERIFIED. No extra native diagnostic setelah stop.


## AC. Resource accounting

Coordinator menutup original watchdog process/thread handles dan dua image-file locks miliknya. Observer target query/recovery handles tidak pernah diperoleh. Receipt terakhir watchdog menyatakan SECURITY_STOP_HOLD: Jc serta original target process/thread handles ditahan; tidak ada release proof. Buffer admission ditelusuri dalam watchdog-native resources; tidak ada klaim seluruh eksperimen sudah bersih. Global Jc handle census tidak dilakukan. Current watchdog liveness tidak di-query ulang.

| Resource | Owner | Actual disposition |
| --- | --- | --- |
| Coordinator process object | outer launcher | Independent wait success; exit40; disposed |
| Original WD process/thread | coordinator | Closed after wait258; authority cannot be reused |
| Fixed executable read locks x2 | coordinator | Closed by own finally |
| Target query/recovery handles | coordinator | Never acquired |
| Observer outside query | watchdog | Closed after identity/outside check |
| Jc and original target process/thread | watchdog | HELD_AT_LAST_RECEIPT; no close proof |
| Admission attrlist/buffers | watchdog | Per-resource native receipt; scoped cleanup does not release HOLD |
| Unexpected PID24956 | unknown | Creation/image/origin/current state NOT_VERIFIED |


## AD. Gates C/D/K/S

C FAILED: singleton membership prerequisite contradicted. D NOT_RUN: no deliberate watchdog crash. K NOT_VERIFIED: no independent exits/causal last-handle proof. S BLOCKED: real worker not ready. Historical M3 acceptance gates remain historical only.


## AE. Remaining security limitations

External malicious same-user handle access, global last-handle exclusivity, real descendant/process-tree cleanup, breakaway/nested jobs, physical output/credential fencing, provider entitlement dan billing belum diverifikasi. Tidak ada J0, MXC, app-server, real worker, inference, paid API, atau provider authentication dalam eksperimen. Tidak ada privilege/token/ACL/registry/Defender/firewall/UAC/service/task mutation dalam kode/command yang diaudit; bukan global system-state census. Public Microsoft documentation browsing memang dilakukan sesuai instruksi; tidak boleh dilabeli zero seluruh external network. Aktivitas PID tak terduga tidak diketahui.


## AF. Source/system integrity

Baseline461 file AI-Office dipertahankan byte-for-byte; final463 dengan tepat dua laporan baru. Git status138 entri awal menjadi140, entri lama dipertahankan. Protected12 roots/668 files, M3 82files/81manifest entries, active Codex50 files, Hermes3D647 tracked files/pathset diverifikasi sesuai inventory. Scope AI mengecualikan .git/node_modules; exclusions setiap protected root dipertahankan; Hermes hanya tracked. Riwayat2209 files/17roots yang tidak tersedia menurut record sebelumnya tidak diklaim verified. Pinned candidate tetap hilang: MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE. Final pembuktian: evidence/audit/final-integrity.json dan manifest.json.


## AG. Final classification

Raw coordinator menyimpan RUNTIME_INCONCLUSIVE, SecurityStop=false dan ResourcesClosed=true untuk resource coordinator sendiri. Ketiga field mentah dipertahankan, bukan bukti scope aman. Auditor menetapkan SECURITY_STOP berdasarkan unexpected membership dan watchdog HOLD. Runtime telah dimulai sehingga STATIC_PASS_RUNTIME_BLOCKED juga tidak tepat. Tidak ada bukti watchdog death, target independent exit, atau kill-on-close sukses.


## AH. One recommended next step

Satu langkah berikut yang direkomendasikan: audit read-only, dengan otorisasi terpisah, atas provenance anggota Jc tak terduga dan custody watchdog residual. Ini bukan izin termination, penutupan Jc, retry, atau validasi process-tree. PID saat ini tidak membuktikan identitas historis PID24956.

Known safety gap untuk peninjauan mendatang: fake singleton rejection belum memvalidasi end-to-end perubahan anggota sesudah resume serta propagasi WD HOLD menjadi coordinator SECURITY_STOP. Tidak dilakukan patch, rebuild, native diagnostic atau retry setelah stop.

Referensi kontrak publik (bukan OS proof dari run ini):

- [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): Job process lifetime/unit controls documented; no inference of process-tree or hostile-holder proof.
- [Job limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information): KILL_ON_JOB_CLOSE concerns last job handle closure. Source exclusive intentional custody is not global handle-exclusivity proof.
- [CreateJobObjectW](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-createjobobjectw): NULL name creates unnamed job; NULL attributes yield noninheritable handle. Observe effective flags and membership rather than assume.
- [SetInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-setinformationjobobject): Class9 extended limits configure only newly owned Jc, flags0x2000.
- [UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute): JOB_LIST attribute storage must remain valid during process creation; no create-then-assign fallback.
- [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw): Returned original PROCESS_INFORMATION process/thread ownership retained. Fixed path, suspended target, inheritfalse.
- [TerminateProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess): Asynchronous request; success is not independently observed exit. No request actually made in this stopped experiment.
- [WaitForSingleObject](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject): Process signal indicates exit;258 timeout is not exit; never close while wait dependent. Observer recorded WD wait258, not exit.
- [GetProcessTimes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getprocesstimes): Creation FILETIME identity; exit time only meaningful after process exit. Unknown member has no recorded creation identity.
- [OpenProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess): PID lookup only candidate handle, must identity-verify. No PID-only termination authority; no actual target recovery handle reached.
- [Process access rights](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights): Query limited0x1000/synchronize0x100000/terminate1; target recovery rights0x101001 only after query-only identity0x101000.
- [IsProcessInJob](https://learn.microsoft.com/en-us/windows/win32/api/jobapi/nf-jobapi-isprocessinjob): Watchdog may check coordinator read-only process handle against its own Jc. Observer itself never receives job handle.
- [Monotonic timestamps](https://learn.microsoft.com/en-us/windows/win32/sysinfo/acquiring-high-resolution-time-stamps): Stopwatch uses QPC; same-system interval measurement independent of wall clock. All receipts require matching QPC frequency.

M02-02S16B-R6W-JC-CRASH SECURITY_STOP - UNEXPECTED JC MEMBER OBSERVED - WATCHDOG HARD-STOP NOT PERFORMED - EXIT AND DISPOSITION NOT VERIFIED - REAL WORKER BLOCKED.
