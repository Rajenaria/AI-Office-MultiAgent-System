# M02-02S16B-R6W-JC — Private Containment Job & Crash-Lifetime Resolution

2026-11-06. Keputusan: **CONTAINMENT_HOST_ONLY_PASS_METADATA_PARTIAL** / **CONTAINMENT_PASS_METADATA_PARTIAL**. Gate C/L PASS; M INCONCLUSIVE; S BLOCKED.

R6W_JC_ROOT=%TEMP%/ai-office-m0202s16br6wjc-b153a84f-fef0-42af-81e6-01b2127f1496. Semua path evidence/source berikut relatif terhadap root tersebut, kecuali path repository yang disebut eksplisit.

## A. Executive decision

Satu runtime normal membuktikan private Jc, kill-on-close configuration, atomic suspended admission, identity/membership sebelum resume, independent reporter exit dan owned-Jc disposition. Reporter exit30 karena metadata parsial; tidak ada retry. Ini bukan HOST_ONLY_PASS lengkap: J0 tidak dibuat dan metadata belum selesai.
Classification tidak dipromosikan menjadi watchdog-crash recovery. Tidak ada deliberate crash, real worker, MXC, app-server, inference, credentials atau paid API.

## B. R6W checkpoint

Dilanjutkan dari STATIC_PASS_RUNTIME_BLOCKED: original-handle custody saja tidak mengikat umur reporter ke kematian watchdog. Dua laporan R6W, manifest47 entries/48 files dan executable hashes diverifikasi read-only; historical42 static/28 faults/28 model checks tetap historical. Hanya41 affected regressions dijalankan pada salinan baru; larangan Jc lama diganti secara eksplisit oleh otorisasi baru.
R6W manifest SHA256 E9A30D8513E056ADD8D3C86023471A9B8D9B7FAC635EFB113FEC8220ED1814A8. Historical watchdog72C5CDD813851E3CD5033EDA09522188818ECB9F4278E6CE0E69B0C28CB483DD; reporter221520634B65CCF72CC4C782965BE5BFE707F9A64237C0A81484B029BB158DA0. Keduanya tidak dieksekusi.
Ketersediaan historical TEMP berubah sebelum JC-A: dari24 root/2532 files,323 file masih tersedia/hash-match dan2209 sudah hilang, termasuk17 root sepenuhnya hilang dan6 legacy source pada satu root. Tidak ada file hilang dipulihkan. R3/R4/R5/R6/R6W yang dibutuhkan tersedia; missing evidence bukan dinyatakan telah diverifikasi.

## C. Exact Owner authorization

Owner mengizinkan satu fresh disposable root, satu watchdog/Jc/reporter, maksimal satu empty J0; Configure KILL_ON_JOB_CLOSE sebelum creation, atomic JOB_LIST + CREATE_SUSPENDED, original-handle targeted stop bila perlu, owned exclusive Jc close dan finite independent wait. Build/static/fake tests/review/conditional auto-advance diizinkan tanpa konfirmasi ulang.
Tidak mengizinkan deliberate watchdog crash, retries, production integration, arbitrary/PID/name-wide cleanup, uncontained fallback, intentional inheritance/duplication/breakaway, ACL/SD/token/system changes, dependencies atau provider use. Exactly dua repository report di bagian AE; seluruh implementasi di disposable root.

## D. R6W proposal reconciliation

Proposal Jc yang sebelumnya memerlukan izin kini diimplementasikan dalam PrivateContainmentJob.cs dan NativeHost.cs. Job dikonfigurasi sebelum satu CreateProcessW. STARTUPINFOEXW/JOB_LIST menjadi satu-satunya admission path; reporter tidak dieksekusi sebelum original identity dan singleton membership diterima. Tidak ada post-create AssignProcessToJobObject fallback.
Tidak menambahkan active-process cap atau mengubah ambient-job limits. Lifetime yang baru adalah conditional OS last-handle rule, bukan bukti bahwa hostile same-user actor tidak mungkin memperoleh handle.

## E. Jc/J0 topology

Trusted watchdog → private Jc → fixed reporter M. Reporter boleh membuat J0 sebagai object metadata terpisah dengan membership0. Job object yang dibuat oleh proses anggota Jc tidak otomatis menjadi nested child job.
Aktual: watchdog1, Jc1, reporter1; J0=0. Reporter berhenti sebelum CreateJob. Karena itu topology dua job simultan dan J0 metadata hanya SOURCE_VERIFIED, bukan runtime observed. [Nested Jobs](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs).

## F. Jc creation and ownership

JobApi.Create memakai CreateJobObjectW(NULL,NULL), satu attempt, current-owner opaque key. NULL name mencegah reuse named external object. Handle API-defined JOB_OBJECT_ALL_ACCESS, bukan minimum-rights handle; default SD tidak dimodifikasi. Own flags0 dan initial PID list kosong teramati.
Ledger menyimpan acquisition, release attempt/result, query dependencies, configuration, known-transfer/contradiction dan attribute borrowed lifetime. Numeric native handle tidak diserialisasi. [CreateJobObjectW](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-createjobobjectw).

## G. Kill-on-close configuration

SetInformationJobObject class9 dengan JOBOBJECT_EXTENDED_LIMIT_INFORMATION144 bytes, Basic64, Io48. Flags tepat0x2000. Set dan query efektif success; queried8192. Tidak ada BREAKAWAY_OK0x800, SILENT_BREAKAWAY_OK0x1000, cap atau relaxation pada parent job.
Trigger kill memerlukan actual last handle close; normal run menutup Jc setelah reporter sudah exit dan job kosong, sehingga tidak menguji kill trigger. [Basic limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information), [Extended limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information), [SetInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-setinformationjobobject).

## H. Atomic admission

AttributeCount1; JOB_LIST0x2000d; one IntPtr/8byte array. Runtime size probe menghasilkan48 bytes; attribute initialization/update success. STARTUPINFOEXW112/cb112, STARTUPINFO104, PROCESS_INFORMATION24. Flags0x08080404 = CREATE_NO_WINDOW / CREATE_UNICODE_ENVIRONMENT / EXTENDED_STARTUPINFO_PRESENT / CREATE_SUSPENDED.
CreateProcessW memakai fixed explicit application, executable-only quoted command, NULL process/thread attrs, inherit=false dan minimal SystemRoot/PATH/TEMP/TMP environment. Array/list tetap valid sepanjang syscall, lalu DeleteProcThreadAttributeList dan FreeHGlobal. Tidak ada alternate executable/assignment/launch fallback. [UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute), [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw).

## I. Process identity and membership

Invocation 82896f70-5b68-44cf-b6c9-2cf23a3711dc; Generation 318ddbf9-3a99-4b85-8a2f-77cbebc945ee. ReporterPID26344, creationFileTime134384471636141970, UTC 2026-11-06T13:59:23.6141970Z.
Original PROCESS_INFORMATION di-register sebelum query. GetProcessId/GetProcessTimes/image path/GetHandleInformation diverifikasi; GetLongPathNameW menyamakan TEMP short/long spelling. Generation/opaque original key dan creation floor/ceiling turut dikorelasikan.
IsProcessInJob(reporter,Jc)=true, PID list tepat[26344], assigned1. ResumeThread pada original primary thread menghasilkan previous suspend count1. Urutan before-resume dijamin reviewed call path plus receipts; native resource logs digabung per komponen, bukan independent timestamped kernel trace.

## J. Original-handle custody

Process/thread IntPtr hanya field private. Demand menolak borrowed/closed/generation mismatch. Wait increments dependency dan finally decrements; close saat dependency aktif ditolak. Targeted termination, jika diperlukan, hanya original retained process handle setelah Authority revalidation. Tidak ada watchdog OpenProcess atau PID/name fallback.
Pada run ini original process/thread flags0, keduanya ditutup success sesudah original wait exit. Outer launcher menyimpan original Process object watchdogPID22920 dan mengamati exit tanpa kill. PID historical23376/23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED, tidak di-query atau ditarget.

## K. Handle inheritance and duplication risk

Jc non-inheritable teramati sebelum creation dan resume; CreateProcessW inherit=false. Tidak ada DuplicateHandle, handle IPC/export atau intended transfer. Attribute array meminjam handle hanya untuk creation syscall, bukan mewariskan handle ke reporter.
Source ini tidak membuktikan global last-handle uniqueness atau penolakan malicious same-user access. Default SD dan broad rights tidak ditafsirkan sebagai security fence. [Job Object Security](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights).

## L. Parent-job and nested-job implications

Self IsProcessInJob(watchdog,NULL)=true; watchdog IsProcessInJob(watchdog,Jc)=false. Atomic admission reporter berhasil dalam ambient host yang aktual. Ambient job handles/limits tidak dibuka atau diubah; unsupported hierarchy harus membuat creation gagal tertutup. Ini hanya current normal metadata case, bukan MXC/nested-worker compatibility.
J0 belum dibuat, sehingga tidak ada actual two-job topology observation. Empty J0 creation secara desain tidak mengassign reporter dan tidak otomatis membentuk hierarchy.

## M. Normal lifecycle

Fixed hash gate → Jc create → empty/own flags/self exclusion → set/query kill flag → attributes → atomic suspended Create → original identity → exact membership → record identity → Resume(previous1) → WaitForSingleObject(original,20000)=0 → exitCode30 → validate partial receipt → final Jc members0 → Jc close → original handles/image lock release.
Reporter tidak timeout dan tidak menerima TerminateProcess. Metadata partial tidak membatalkan independent OS exit, serta exit tidak menaikkan Gate M menjadi PASS.

## N. Timeout and termination lifecycle

Source wait allowlist0/5000/20000ms. Setelah timeout: revalidate original identity, verify recheck wait, at most one targeted TerminateProcess, independent5s wait; safe owned Jc disposition, lalu original5s post-Jc wait bila exit belum teramati. Request/accepted/close tidak pernah langsung menetapkan exit.
Actual timeout/termination/failure cleanup NOT RUN; diuji fake-provider saja. Synchronous initialization/file/native calls tidak dijamin hard-preemptible; pending I/O dapat menunda termination. [TerminateProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess), [WaitForSingleObject](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject).

## O. Watchdog crash windows

16 windows berikut adalah source/static model + conditional OS documentation. Semua CRASH_RUNTIME_NOT_TESTED; untuk process yang belum independent exit, EXIT_NOT_INDEPENDENTLY_OBSERVED. Full crash observation bukan syarat tambahan sebelum normal run yang telah diizinkan.
Kontrak memerlukan Jc configured, membership established, actual last relevant holder closes, tidak ada unintended transfer/breakaway dan OS progress. Atomic-create interruption/unwind serta pending I/O tidak dinyatakan telah diuji. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects).

| Case | Window | Conclusion | Evidence level |
| --- | --- | --- | --- |
| C01 | Before Jc creation | No reporter: configuration/attribute prerequisites precede the sole CreateProcessW | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; NO_REPORTER_CREATED |
| C02 | After Jc before configuration | No reporter: configuration/attribute prerequisites precede the sole CreateProcessW | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; NO_REPORTER_CREATED |
| C03 | After configuration | No reporter: configuration/attribute prerequisites precede the sole CreateProcessW | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; NO_REPORTER_CREATED |
| C04 | During attribute initialization | No reporter: configuration/attribute prerequisites precede the sole CreateProcessW | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; NO_REPORTER_CREATED |
| C05 | During atomic CreateProcessW | If process creation commits, JOB_LIST atomically associates Jc; interrupted syscall/unwind behavior is not runtime tested; no source path creates uncontained reporter | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C06 | After create before identity | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C07 | While suspended | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C08 | After resume | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C09 | Inside blocking native call | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C10 | After timeout | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C11 | After targeted termination request | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C12 | Before independent exit observation | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C13 | During Jc disposal | Configured Jc plus atomic membership plus actual last-handle closure implies documented member termination expectation; not an observed exit | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C14 | External Jc holder | Another handle may prevent last-handle trigger; no guaranteed reporter death | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C15 | Unexpected inherited Jc | Another handle may prevent last-handle trigger; no guaranteed reporter death | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |
| C16 | Pending I/O termination | Termination can remain pending for I/O cancellation; no bounded OS-exit guarantee | SOURCE_INVARIANT_VERIFIED; STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; OS_DOCUMENTED_EXPECTATION; EXIT_NOT_INDEPENDENTLY_OBSERVED |


## P. Failure-disposition matrix

Seluruh26 case menyimpan phase/resources/process-existence/execution possibility/original handle/Jc owner/scope/authorized/prohibited/observations/classification pada evidence/admission/failure-disposition.json. Tabel ringkas berikut harus dibaca bersama fields lengkap pada JSON.
**Emergency rule:** scope contradiction, known transfer/inheritance/duplication atau failed Jc close → SECURITY_STOP_HOLD. Jangan resume/close job atau otomatis keluar dari watchdog karena exit sendiri dapat memicu collateral kill-on-close. Main finally menahan invocation; original handles dipertahankan. Ini unbounded emergency retention yang dinyatakan eksplisit, **bukan PASS** atau successful bounded cleanup. Memerlukan Owner disposition hanya jika benar-benar terpicu; tidak terpicu pada run ini. Tidak mengubah kill flag/ACL atau menarget PID lain.

| Case | Failure | Phase | Resources | Reporter possibility | Original handle | Scope | Disposition | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | Jc creation fails | JC_CONFIGURATION | Image lock; no Jc/reporter | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F02 | Jc configuration fails | JC_CONFIGURATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F03 | Job limit query fails | JC_CONFIGURATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F04 | Attribute-list allocation fails | ATTRIBUTE_PREPARATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F05 | Attribute-list initialization fails | ATTRIBUTE_PREPARATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F06 | Job-list update fails | ATTRIBUTE_PREPARATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F07 | Creation fails without process | ATOMIC_CREATION | Owned empty Jc, image lock, zero or partial attribute/environment buffers | exist=False; execute=False | NOT CREATED | Source-exclusive fixed atomic admission; no claim against hostile external actors | Release initialized buffers; close only newly owned empty Jc once; release image lock | PRELAUNCH_STOP; RUNTIME_INCONCLUSIVE |
| F08 | Ambiguous process creation | ATOMIC_CREATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=False | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F09 | Original process handle invalid | ATOMIC_CREATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=False | UNAVAILABLE | Source-exclusive fixed atomic admission; no claim against hostile external actors | No targeted termination without original handle; source-exclusive owned-Jc close only; exit remains unobserved | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F10 | Identity mismatch | SUSPENDED_VERIFICATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=False | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | SECURITY_STOP; exit observation separately possible |
| F11 | Membership query fails | SUSPENDED_VERIFICATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=False | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | SECURITY_STOP; exit observation separately possible |
| F12 | Unexpected member | SUSPENDED_VERIFICATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=False | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | CONTRADICTED: unexpected member | SECURITY_STOP_HOLD: no automatic Jc close, no automatic watchdog return/exit; retain original handles; no launch; Owner disposition required | SECURITY_STOP |
| F13 | Resume fails | RESUME | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F14 | READY receipt missing | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | LIFECYCLE_PASS_METADATA_PARTIAL only if C/L and cleanup independently pass |
| F15 | Metadata query fails | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | LIFECYCLE_PASS_METADATA_PARTIAL only if C/L and cleanup independently pass |
| F16 | Reporter timeout | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F17 | Targeted termination fails | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F18 | Exit wait timeout | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F19 | Exit wait fails | REPORTER_EXECUTION_OR_EXIT_OBSERVATION | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F20 | Jc close fails | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | SECURITY_STOP_HOLD: no automatic Jc close, no automatic watchdog return/exit; retain original handles; no launch; Owner disposition required | SECURITY_STOP |
| F21 | Last-holder unknown | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive intended scope only; global last holder NOT PROVEN | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F22 | Unexpected inheritance | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | CUSTODY_TRANSFER_UNCERTAIN | SECURITY_STOP_HOLD: no automatic Jc close, no automatic watchdog return/exit; retain original handles; no launch; Owner disposition required | SECURITY_STOP |
| F23 | Unexpected duplication | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | CUSTODY_TRANSFER_UNCERTAIN | SECURITY_STOP_HOLD: no automatic Jc close, no automatic watchdog return/exit; retain original handles; no launch; Owner disposition required | SECURITY_STOP |
| F24 | Cleanup exception | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F25 | Evidence write fails | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | RUNTIME_INCONCLUSIVE unless exact independent observations support narrower facts |
| F26 | Early reporter exit | CUSTODY_OR_CLEANUP | Fresh configured Jc; possible reporter; original handles if valid; image lock; partial buffers if creation ambiguous | exist=True; execute=True | Original PROCESS_INFORMATION handle if acquired; never reopen by PID | Source-exclusive fixed atomic admission; no claim against hostile external actors | No resume on failed admission; original-handle stop only after Authority revalidation; source-exclusive Jc close once; independent original-handle wait5000; release resources when no contradiction | LIFECYCLE_PASS_METADATA_PARTIAL only if C/L and cleanup independently pass |

Semua case: owner hanya current watchdog jika fresh NULL-name creation berhasil; no PID/name/arbitrary cleanup, no limit relaxation/reassignment/retry. Observation wajib API return/error dan original-handle WAIT_OBJECT_0 terpisah dari acceptance/close. F21 global last-holder tidak diketahui secara universal; tidak dipromosikan menjadi containment proof. Known contradictory transfer berbeda dari residual malicious-access threat yang belum diuji.

## Q. Disposable implementation changes

Salinan R6W Lifecycle.cs menambahkan Configure/Admission/Resume/Dispose/Hold protocol dan Gate C; PrivateContainmentJob.cs menambahkan interop, custody dan crash classification; NativeHost.cs menambahkan narrow native adapter; WatchdogProgram.cs memperbarui fixed permits/layout serta no-implicit-exit emergency hold. Reporter Model.cs/NativeProvider.cs byte-identical; Program.cs hanya nonce dan fixed root-relative source/build/evidence paths.
ReporterReceipt.cs tetap strict; ditambah Controller READY requirement. Build/test/source/IL/design/fault/runtime/audit scripts hanya berada pada R6W_JC_ROOT. Tidak ada reusable production launcher, dependency atau source/DB integration.

## R. Static test outcomes

Final reviewed build: **48 focused PASS +41 active affected regressions PASS =89 PASS;1 SUPERSEDED;0 FAIL;0 TIMEOUT**. R6W-T33 melarang seluruh watchdog Job APIs dan secara eksplisit SUPERSEDED oleh otorisasi JC, tidak dihitung PASS. Initial focused46 PASS/2 FAIL disimpan; assertions JC-T13/T32 tidak dilemahkan.
Repair1 memperbaiki fake membership setelah creation yang tidak pernah terjadi. Repair2 menambah explicit ambient-self observation, tanpa mengubah parent constraints. Build reviewed diulang setelah perubahan. Total focused repair cycles2. Audit-helper PowerShell precedence diperbaiki terpisah tanpa source/binary/runtime repair; diagnostic disimpan.

| Focused test | Requirement | Result |
| --- | --- | --- |
| JC-T01 | Private unnamed current-invocation Jc | PASS |
| JC-T02 | No named/shared job parameter | PASS |
| JC-T03 | Create Jc denial | PASS |
| JC-T04 | Existing job rejected without speculative close | PASS |
| JC-T05 | Owned Jc no transferred control | PASS |
| JC-T06 | Kill flag set before attributes/create | PASS |
| JC-T07 | Configure denial blocks process | PASS |
| JC-T08 | Incorrect flags reject | PASS |
| JC-T09 | Breakaway flags reject | PASS |
| JC-T10 | Limit query failure blocks launch | PASS |
| JC-T11 | Job list update consumes owned pointer | PASS |
| JC-T12 | Invalid attributes reject before create | PASS |
| JC-T13 | Allocation failure releases Jc | PASS |
| JC-T14 | Attribute update failure frees both buffers | PASS |
| JC-T15 | Process failure no execution | PASS |
| JC-T16 | No create-then-assign capability | PASS |
| JC-T17 | Suspended execution gate precedes resume | PASS |
| JC-T18 | No resume when membership unavailable | PASS |
| JC-T19 | Attribute storage live throughout create then released | PASS |
| JC-T20 | x64 layouts 64/48/144/104/112/24 | PASS |
| JC-T21 | Exact reporter membership | PASS |
| JC-T22 | Membership query failure no resume | PASS |
| JC-T23 | Unexpected member suppresses close and resume | PASS |
| JC-T24 | Identity mismatch no resume | PASS |
| JC-T25 | No original handle no targeted stop or exit claim | PASS |
| JC-T26 | PID reuse cannot authorize stop | PASS |
| JC-T27 | Inherited Jc rejected | PASS |
| JC-T28 | Known duplicate invalidates exclusive custody | PASS |
| JC-T29 | Transferred/borrowed handle cannot authorize close | PASS |
| JC-T30 | No double job close | PASS |
| JC-T31 | Last-handle uncertainty does not become crash-exit observation | PASS |
| JC-T32 | Prelaunch failure releases initialized allocation | PASS |
| JC-T33 | Crash before Jc no reporter | PASS |
| JC-T34 | Crash after config source invariant OS expectation | PASS |
| JC-T35 | Atomic create crash has configured Jc if process exists | PASS |
| JC-T36 | Suspended reporter crash follows conditional last-close rule | PASS |
| JC-T37 | Running reporter crash expectation no exit receipt | PASS |
| JC-T38 | Termination request alone cannot prove exit | PASS |
| JC-T39 | Job close failure holds without retry | PASS |
| JC-T40 | Cleanup exception cannot pass | PASS |
| JC-T41 | Normal exit independent original wait | PASS |
| JC-T42 | Timeout targeted bounded stop | PASS |
| JC-T43 | Failed termination separate from post-Jc exit | PASS |
| JC-T44 | Jc close is not an independent exit | PASS |
| JC-T45 | Accepted stop pending I/O remains unknown | PASS |
| JC-T46 | Reporter J0 has no assignment/kill/limits | PASS |
| JC-T47 | No second reporter after uncertainty | PASS |
| JC-T48 | No worker, network or process enumeration path | PASS |


| Affected regression | Requirement | Result | Note |
| --- | --- | --- | --- |
| R6W-T01 | Fixed target accepted | PASS |  |
| R6W-T02 | Unknown executable rejected before create | PASS |  |
| R6W-T03 | Hash mismatch rejected | PASS |  |
| R6W-T04 | Creation failure no retry | PASS |  |
| R6W-T05 | Missing original process handle blocks control | PASS |  |
| R6W-T06 | Original handle retained through waits | PASS |  |
| R6W-T07 | Creation identity mismatch | PASS |  |
| R6W-T08 | Owner generation mismatch | PASS |  |
| R6W-T09 | PID reuse cannot authorize termination | PASS |  |
| R6W-T10 | Already exited in timeout race no terminate | PASS |  |
| R6W-T11 | Normal exit independently observed | PASS |  |
| R6W-T12 | Exit code read after signaled | PASS |  |
| R6W-T13 | Missing output does not erase exit or fabricate metadata | PASS |  |
| R6W-T14 | Conflicting nonce output rejected | PASS |  |
| R6W-T15 | Timeout distinct from termination and exit | PASS |  |
| R6W-T16 | WAIT_FAILED cannot become exit | PASS |  |
| R6W-T17 | Targeted termination accepted then wait exit | PASS |  |
| R6W-T18 | Termination failure retained | PASS |  |
| R6W-T19 | Accepted termination not exit proof | PASS |  |
| R6W-T20 | Close failure cannot pass resource gate | PASS |  |
| R6W-T21 | Double close prevented | PASS |  |
| R6W-T22 | Premature original close blocks termination | PASS |  |
| R6W-T23 | No watchdog OpenProcess fallback | PASS |  |
| R6W-T24 | No name-wide killer interface | PASS |  |
| R6W-T25 | No automatic second run | PASS |  |
| R6W-T26 | Crash before creation no reporter residue | PASS |  |
| R6W-T27 | Crash after creation residue remains | PASS |  |
| R6W-T28 | Crash after termination request not cleanup | PASS |  |
| R6W-T29 | Reporter hang can be stopped only by live owned watchdog | PASS |  |
| R6W-T30 | Metadata failed but exit observed | PASS |  |
| R6W-T31 | Zero exit not metadata PASS | PASS |  |
| R6W-T32 | Cleanup cannot PASS without exit | PASS |  |
| R6W-T33 | Watchdog no containment job native capability | SUPERSEDED | R6W-JC explicitly authorizes private Jc; replaced by JC-T01/T06/T11/T16 |
| R6W-T34 | No shell entry | PASS |  |
| R6W-T35 | Reporter no process creation/termination/assignment | PASS |  |
| R6W-T36 | No production integration reference | PASS |  |
| R6W-T37 | Signaled process with exit259 is not relabeled alive | PASS |  |
| R6W-T38 | Wait dependency blocks handle close | PASS |  |
| R6W-R01 | Fresh copied reporter nonce equals watchdog protocol | PASS |  |
| R6W-R02 | Reporter observation scope retained | PASS |  |
| R6W-R03 | Stale reporter nonce rejected by actual receipt parser | PASS |  |
| R6W-R04 | Actual receipt parser requires queries and release not summary alone | PASS |  |


## S. Fault-injection outcomes

31 deterministic fake-provider scenarios PASS; tidak ada native process/job/token API atau crash injection. Fake memory allocator memakai Marshal.AllocHGlobal/FreeHGlobal untuk disposable test buffers. Fake IJobApi menjalankan actual PrivateContainmentJob logic; fake IJobMemory menyuntik allocation failure; fake IHost menjalankan actual Controller. FI21-FI23 memakai ContainmentCrashContract sebagai model dokumentasi, tidak membuktikan OS crash. FI25 menolak second launch sesudah exit uncertainty.

| Case | Injection | Initial | Expected | Actual | Cleanup authority | Fake process count | Exit evidence | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JC-FI01 | JobDenied | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; CONTAINMENT_CONFIGURATION_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI02 | SetDenied | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; CONTAINMENT_CONFIGURATION_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI03 | WrongFlags | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; CONTAINMENT_CONFIGURATION_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI04 | AllocationFailure | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; OutOfMemoryException | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI05 | InitializeFailure | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; ATTRIBUTE_INITIALIZATION_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI06 | UpdateFailure | NOT_STARTED | NO_PROCESS_NO_RESUME | RUNTIME_INCONCLUSIVE; JOB_LIST_UPDATE_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI07 | CreateFailure | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | RUNTIME_INCONCLUSIVE; CREATION_OR_ORIGINAL_HANDLE_MISSING | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI08 | AmbiguousCreate | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | RUNTIME_INCONCLUSIVE; CREATION_OR_ORIGINAL_HANDLE_MISSING | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI09 | OriginalMissing | NOT_STARTED | NO_ORIGINAL_NO_EXIT_CLAIM | RUNTIME_INCONCLUSIVE; CREATION_OR_ORIGINAL_HANDLE_MISSING | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI10 | IdentityMismatch | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | SECURITY_STOP; CREATION_IDENTITY_MISMATCH | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI11 | MembershipMissing | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | SECURITY_STOP; ATOMIC_ADMISSION_NOT_VERIFIED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI12 | UnexpectedMember | NOT_STARTED | SECURITY_STOP_HOLD | SECURITY_STOP; ATOMIC_ADMISSION_NOT_VERIFIED | NO_JOB_CLOSE_NO_AUTOMATIC_EXIT | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI13 | ResumeFailure | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | RUNTIME_INCONCLUSIVE; RESUME_NOT_VERIFIED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI14 | Timeout | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | LIFECYCLE_PASS_METADATA_PARTIAL;  | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI15 | TerminationFailure | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | LIFECYCLE_PASS_METADATA_PARTIAL; TERMINATION_FAILED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI16 | TerminationPending | NOT_STARTED | NO_CLEAN_PASS | RUNTIME_INCONCLUSIVE; PROCESS_EXIT_INCONCLUSIVE | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI17 | WaitFailure | NOT_STARTED | NO_CLEAN_PASS | RUNTIME_INCONCLUSIVE; PROCESS_EXIT_INCONCLUSIVE | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI18 | JobCloseFailure | NOT_STARTED | SECURITY_STOP_HOLD | SECURITY_STOP;  | NO_JOB_CLOSE_NO_AUTOMATIC_EXIT | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI19 | Inherited | NOT_STARTED | NO_PROCESS_NO_RESUME | SECURITY_STOP; CONTAINMENT_CONFIGURATION_FAILED | NO_JOB_CLOSE_NO_AUTOMATIC_EXIT | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI20 | Duplicate | NOT_STARTED | SECURITY_STOP_HOLD | SECURITY_STOP; ATOMIC_ADMISSION_NOT_VERIFIED | NO_JOB_CLOSE_NO_AUTOMATIC_EXIT | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI21 | CRASH_ADMISSION | NOT_STARTED | OS_DOCUMENTED_EXPECTATION conditional on last handle, never independent exit | STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; EXIT_NOT_INDEPENDENTLY_OBSERVED | OS last-owned-handle close expectation only; no crash/native experiment | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI22 | CRASH_RUNNING | NOT_STARTED | OS_DOCUMENTED_EXPECTATION conditional on last handle, never independent exit | STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; EXIT_NOT_INDEPENDENTLY_OBSERVED | OS last-owned-handle close expectation only; no crash/native experiment | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI23 | CRASH_CLEANUP | NOT_STARTED | OS_DOCUMENTED_EXPECTATION conditional on last handle, never independent exit | STATIC_FAILURE_MODEL_VERIFIED; CRASH_RUNTIME_NOT_TESTED; EXIT_NOT_INDEPENDENTLY_OBSERVED | OS last-owned-handle close expectation only; no crash/native experiment | 0 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI24 | EvidenceCorrupt | NOT_STARTED | EXIT_SEPARATE_FROM_METADATA | LIFECYCLE_PASS_METADATA_PARTIAL;  | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI25 | SECOND_AFTER_UNCERTAINTY | NOT_STARTED | NO_CLEAN_PASS | RUNTIME_INCONCLUSIVE; PROCESS_EXIT_INCONCLUSIVE; SECOND_LAUNCH_REJECTED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | EXIT_NOT_INDEPENDENTLY_OBSERVED | PASS |
| JC-FI26 | ReadyMissing | NOT_STARTED | EXIT_SEPARATE_FROM_METADATA | LIFECYCLE_PASS_METADATA_PARTIAL;  | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI27 | MetadataFailed | NOT_STARTED | EXIT_SEPARATE_FROM_METADATA | LIFECYCLE_PASS_METADATA_PARTIAL;  | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI28 | EvidenceWriteFailure | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | RUNTIME_INCONCLUSIVE; IOException | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI29 | EarlyExit | NOT_STARTED | EXIT_SEPARATE_FROM_METADATA | LIFECYCLE_PASS_METADATA_PARTIAL;  | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI30 | MembershipQueryFailure | NOT_STARTED | ONE_FIXED_ATTEMPT_SCOPED_DISPOSITION | SECURITY_STOP; ATOMIC_ADMISSION_NOT_VERIFIED | FRESH_PRIVATE_ATOMIC_SCOPE_JC_CLOSE; original-handle wait only | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |
| JC-FI31 | CleanupException | NOT_STARTED | NO_CLEAN_PASS | RUNTIME_INCONCLUSIVE; JC_DISPOSITION_IOException | NO_UNPROVEN_CLEANUP | 1 | FAKE_ORIGINAL_WAIT_SIGNALED | PASS |


## T. Build provenance and SHA-256

Existing signed-valid .NET Framework64 csc14.8.10001.0, x64 optimized, warning4/warnaserror; reporter/watchdog/tests exit0 dan warning0. Tidak ada dependency install. Source/hash manifests dan compiler outputs disimpan dalam evidence/audit/build-provenance.json dan evidence/static/build-*-reviewed.json.

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| Watchdog executable | build/watchdog/JCWatchdog.exe | 568F03631ABBD5868B32A09BA626EA0FA6B23AADC8C27383CB06714F21CE5C20 |
| Reporter executable | build/reporter/R6MetadataReporter.exe | AE172C219229331D938C33A14A8A32062CDE582C54176E49E30787395C99582E |
| Test DLL | build/tests/JC.Tests.dll | 3D199D85025BAECD91AC8CAF912C58F0313C150C06AB5ACC511AF687FD9899A9 |
| Reporter source manifest | build/reporter/source-manifest.json | 4DF7A42DA9977030739109B0725EE168CBAA65AE8188409EC27665BF535C18B7 |
| Compiler | %WINDIR%/Microsoft.NET/Framework64/v4.0.30319/csc.exe | ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3 |


| Source | Bytes | SHA-256 |
| --- | --- | --- |
| source/watchdog/Lifecycle.cs | 11584 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/ReporterReceipt.cs | 3575 | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/watchdog/NativeHost.cs | 13348 | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 |
| source/watchdog/PrivateContainmentJob.cs | 12715 | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B |
| source/watchdog/WatchdogProgram.cs | 4456 | 92E3CD075152FB387902F888490AF18B037EA9509900A875E8650695C3FF62BA |
| source/reporter/Model.cs | 8441 | 597C9B0D94F6EE7855B78BA971CCF683CED7DCCB57CBAEE7F4C23AB634157791 |
| source/reporter/NativeProvider.cs | 11101 | 0584F45DE80F009CAA7A0895FFBC3EF4D78B5D949D734AB3757945EF9B1BD6F5 |
| source/reporter/Program.cs | 3833 | 78D8483B69D98C19C92E8939DF7A3810D13744500DF47D8CAF5DAE02BD09BC56 |

Own-assembly audit: reporter12 imports/625 IL method references; watchdog19 imports/1516 references. All own methods/constructors decoded; forbidden APIs/calli/dynamic loading/network/process helpers absent. Existing framework dipercaya, tidak seluruh framework di-disassemble. Source constraints20 dan six x64 layout checks PASS.

## U. Internal adversarial review

**INTERNAL_ADVERSARIAL_REVIEW — SAFETY_REVIEW_PASS**, 30/30 mandatory checks. Distinct second-pass oleh agent yang sama; bukan independent human audit. Dilakukan sebelum permit/runtime, dengan limitations external-holder/pending-I/O/crash dan HOLD yang dinyatakan eksplisit.

| Review | Question | Evidence | Finding | Outcome |
| --- | --- | --- | --- | --- |
| IR01 | Jc private unnamed | PrivateContainmentJob.cs Configure/JobApi.Create; JC-T01/T02 | NULL attributes/name fixed, no caller naming channel | PASS |
| IR02 | Current watchdog creates Jc | Configure + one-attempt ledger; JC-T05 | One owner key, no opened external job | PASS |
| IR03 | Configuration before creation | Controller.ConfigureContainment before Create; JC-T06/T07 | Creation unreachable when configure/query fails | PASS |
| IR04 | Kill-on-close actually configured | ExtendedLimits flags0x2000/class9/size144; JC-T06 | Set plus query exact flags; documentation is not runtime evidence | PASS |
| IR05 | No breakaway | Exact flags0x2000 and Create flags0x08080404; JC-T09 | No BREAKAWAY_OK/SILENT_BREAKAWAY_OK/CREATE_BREAKAWAY_FROM_JOB | PASS |
| IR06 | No arbitrary process assignment | 19-import watchdog allowlist; JC-T16 | Only JOB_LIST creation of fixed reporter; no AssignProcessToJobObject | PASS |
| IR07 | No uncontained fallback | NativeHost.Create single CreateProcessW site; JC-T16 | Atomic failure stops; no alternate launch | PASS |
| IR08 | Correct job-list attribute | 0x2000d, count1, IntPtr bytes; JC-T11/T19/T20 | Pointer storage remains alive through creation syscall | PASS |
| IR09 | Starts suspended | 0x08080404, StartupEx112; JC-T17 | Source and interop reviewed; actual not yet run at review | PASS |
| IR10 | Independent identity correlation | GetProcessId/Times/Image, generation/key/floor/ceiling; JC-T24/T26 | Same original process handle; canonical long image path | PASS |
| IR11 | Membership before resume | PrivateJob.Verify exact PID set; JC-T18/T21/T22/T23 | IsProcessInJob plus PID list; any contradiction suppresses resume | PASS |
| IR12 | Original process handle retained | NativeHost private process + Demand + Owned; R6W-T06/T22 | No reopen by PID | PASS |
| IR13 | Original thread accounted | Private thread, ResumeThread once, separate release; R6W-T06 | Previous suspend count must equal1 | PASS |
| IR14 | No intentional inheritance | NULL security attrs, bInheritHandles=false, Jc/process/thread flags checks; JC-T27 | Not a hostile same-user resistance proof | PASS |
| IR15 | No intentional duplicate | No DuplicateHandle in source or IL; JC-T28 | Known transfer marks HOLD; external holders unresolved | PASS |
| IR16 | No control-handle export | Private IntPtr, sanitized opaque keys; source/IL audit | Job array only to kernel creation attribute; no IPC/shared handle | PASS |
| IR17 | Jc and J0 distinct | Unchanged reporter NativeProvider + watchdog layer; JC-T46 | Creating empty J0 does not establish nested membership | PASS |
| IR18 | J0 stays empty | Reporter never assigns; strict receipt requires zero PID count; R6W-R04 | One-shot metadata job, no limits or termination configuration | PASS |
| IR19 | Reporter no arbitrary descendants | Reporter12imports, no process/shell/network API; R6W-T35/JC-T48 | Reviewed metadata executable only, no untrusted worker | PASS |
| IR20 | Timeout not exit | Controller.Wait values separate; JC-T42/T44 | 258 is timeout, not termination or release receipt | PASS |
| IR21 | Termination request not exit | StopOwned + finite original wait; JC-T43/T45 | Success may be pending; wait failure remains inconclusive | PASS |
| IR22 | Job close not exit | Dispose then independent original Wait5000; JC-T44 | Close return never directly sets ExitObserved | PASS |
| IR23 | Crash assumptions explicit | C01-C16 and ContainmentCrashContract; JC-T33-T38 | Conditional OS expectation only; no deliberate crash; pending I/O caveat | PASS |
| IR24 | Parent constraints considered | Self any-job query + atomic Create; nested-jobs docs | No parent-job handle inspection/limits changes; unsupported hierarchy fails creation | PASS |
| IR25 | Malicious same-user threat unresolved | Custody design/global last holder; JC-T31 | Gate S BLOCKED; not imposed as new prerequisite for this trusted normal observation | PASS |
| IR26 | No arbitrary PID kill | No watchdog OpenProcess/enum APIs; R6W-T23/JC-T26 | Target only retained original process handle | PASS |
| IR27 | No name-wide kill | No shell/process enumeration/managed Process calls in compiled binaries; R6W-T24 | Wrapper only starts fixed new watchdog, never kills it | PASS |
| IR28 | No production integration | Assembly refs/paths/source inventory; R6W-T36 | Repository writes restricted to two reports | PASS |
| IR29 | Disposable changes only | Fresh root, baseline453 repo files, protected324; checkpoint | Older missing TEMP evidence explicitly disclosed; no restoration or alteration | PASS |
| IR30 | Risk justified for narrow reporter | Fixed hash/nonce, no descendants/provider/network; source and all tests | HOLD is an explicit SECURITY_STOP exception, never claimed bounded success; normal runtime risk justified by documented Jc mechanism | PASS |


## V. Runtime preflight

**R6W_JC_RUNTIME_AUTHORIZED**. 23 mandatory prerequisites lolos, hashes/source/permits exact nonce, fixed path, unused one-shot claims, fresh dirs non-reparse, compiler/layout/source/tests/review, non-admin/non-SYSTEM current token, finite waits dan documented lifetime contract.
residualLifetimeContractVerified pada inherited permit berarti defensible SOURCE_INVARIANT_VERIFIED + OS_DOCUMENTED_EXPECTATION; bukan verified crash runtime. Permit mencatat crashRuntimeVerified=false dan Gate S BLOCKED. Tidak meminta bukti crash sebelum normal observation dan tidak mengubah Gate S menjadi alasan baru menolak normal run.

## W. Runtime execution or NOT RUN

Aktual satu experiment pada2026-11-06T13:59:23Z. WatchdogPID22920 dan reporterPID26344, keduanya original-handle exit observed, code30. Anggaran consumed satu kali; tidak ada second launch/retry/crash/forced termination.

| Resource/action | Maximum | Actual |
| --- | --- | --- |
| Watchdog | 1 | 1 |
| Jc | 1 | 1 |
| Reporter | 1 | 1 |
| J0 | 1 | 0 |
| Reporter-created children | 0 | 0 |
| MXC / app-server / real worker | 0 | 0 |
| Retries / deliberate watchdog crash | 0 | 0 |
| Targeted termination requests | At most1 if needed | 0 |
| Unrelated process targets / paid API | 0 | 0 |

Compiler/PowerShell tooling tidak dihitung sebagai metadata-runtime reporter/worker; mereka tercatat pada scripts/provenance dan tidak dipakai sebagai cleanup helper. Actual counts untuk owned experiment, bukan global system process census.

## X. Jc OS observations

CreateJobObjectW success/NULL/NULL; Jc flags0; initial members0; watchdog outside Jc; Set class9 success/query8192; JOB_LIST update success; atomic Create success; IsProcessInJob reporter=true; singleton membership26344; Resume previous1. Final members0 setelah reporter wait0, lalu CloseHandle(owned Jc)=success.
Tidak ada runtime kill-on-close termination trigger, global-handle census, Jc descriptor inspection atau forced admission/close failure. Source/IL+receipts membuktikan intended normal custody, bukan same-user malicious resistance.

## Y. J0 OS observations

**NOT RUN — J0=0.** Reporter tidak mencapai CreateJob. Tidak ada J0 owner/DACL/flags/membership receipt. Yang benar-benar ada: self-process PID/creation/descriptor/handle flags, TokenUser class1, TokenIntegrityLevel25=MEDIUM dan TokenPrivileges3.
E006 GetTokenInformation class20 / TokenElevation gagal, Win32Error24, ProbeError24. Reporter kemudian mencatat INVALID_BUFFER_LENGTH, Completed=false, JobAttempts0. Berdasarkan urutan source, next request sesudah E007 adalah class21 dan length validation dapat melempar sebelum Query dibuat. Exact returned length/OS cause tidak direkam: ini source inference, bukan fabricated OS observation. Tidak ada repair atau runtime kedua setelah hasil ini.

| Record | API | Object | Token class | OK | Error | Status |
| --- | --- | --- | --- | --- | --- | --- |
| E001 | OpenProcess(self)+OpenProcessToken(self) | M |  | True | 0 | OS_METADATA_VERIFIED |
| E002 | GetKernelObjectSecurity | M |  | True | 0 | OS_METADATA_VERIFIED |
| E003 | GetHandleInformation | M |  | True | 0 | OS_METADATA_VERIFIED |
| E004 | GetTokenInformation | M-token | 1 | True | 0 | OS_METADATA_VERIFIED |
| E005 | GetTokenInformation | M-token | 25 | True | 0 | OS_METADATA_VERIFIED |
| E006 | GetTokenInformation | M-token | 20 | False | 24 | NOT OBSERVED |
| E007 | GetTokenInformation | M-token | 3 | True | 0 | OS_METADATA_VERIFIED |
| E008 | owned resource disposition | M/J0 |  | True | 0 | OS_METADATA_VERIFIED |


## Z. Process-exit accounting

Reporter original WaitForSingleObject(20000)=WAIT_OBJECT_0(0), Win32Error0; GetExitCodeProcess success/code30. Outer original watchdog Process.WaitForExit(60000)=true/code30. Tidak ada timeout atau TerminateProcess request; Jc close terjadi setelah exit teramati dan final members0.
Process object handles dilepas terpisah dari proses exit. Tidak ada PID-only lookup, name-wide kill, taskkill atau unrelated job targeting. Historical23376/23644 tetap unresolved dan tidak diinspeksi.

## AA. Resource disposition

Watchdog Jc/process/thread handles masing-masing closed success once; reviewed-image stream, environment block, attribute list dan job-handle array release dicatat. Three QueryMembers scratch buffers memakai source finally FreeHGlobal; tidak ada independent heap telemetry untuk membuktikan setiap allocation OS-wide.
Reporter E008 memuat6 acquired resources, semuanya ReleaseAttempted/Released=true dan Dependents0; RemainingOwnedResources0. Dua handles M-process/M-token dan empat HGLOBAL; J0 tidak pernah acquired. Independent audit mengkorelasikan self PID/time/nonce/hash dan receipt ini meski full metadata tidak PASS.
Inherited Controller field tetap REPORTER_USER_MODE_RELEASE_NOT_VERIFIED karena labelnya terikat ke full MetadataPass. Raw evidence tidak diubah. Post-run runtime-reconciliation.json menyajikan narrower verified resource receipt secara terpisah; tidak mengklaim full metadata PASS.

| Reporter resource | Kind | Acquired | Release attempted | Released | Dependents | Error |
| --- | --- | --- | --- | --- | --- | --- |
| M-process | HANDLE | True | True | True | 0 | 0 |
| M-token | HANDLE | True | True | True | 0 | 0 |
| SD-M-1 | HGLOBAL | True | True | True | 0 | 0 |
| Token1-2 | HGLOBAL | True | True | True | 0 | 0 |
| Token25-3 | HGLOBAL | True | True | True | 0 | 0 |
| Token3-4 | HGLOBAL | True | True | True | 0 | 0 |


## AB. Gate C/L/M/S


| Gate | Result | Scope |
| --- | --- | --- |
| C | PASS | HOST_ONLY_OS_VERIFIED: configured Jc, atomic admission, own flags, membership before resume |
| L | PASS | HOST_ONLY_OS_VERIFIED: original identity, normal execution, independent exit, owned disposition |
| M | INCONCLUSIVE / PARTIAL | 8 query records:7 OK/1 error24; engine INVALID_BUFFER_LENGTH; J0 not created |
| S | BLOCKED | No hostile worker, malicious same-user, real tree/crash/MXC/fencing/credential/entitlement/billing validation |


## AC. Remaining security limitations

Watchdog crash, external handle acquisition/global last holder, real descendant containment/cleanup, full recovery, MXC nested compatibility, physical output fencing, credential custody, subscription entitlement dan included-only billing enforcement belum diverifikasi. Normal exit tidak menutup gap tersebut.
Metadata blocker konkret: class20 probe error24 dan INVALID_BUFFER_LENGTH sebelum J0. Reporter tetap salinan source lama; scope milestone ini tidak memperbaiki parser/provider, tidak mengulang runtime. Emergency HOLD tidak terpicu; bila suatu saat terpicu diperlukan Owner disposition, bukan automatic broad cleanup.

## AD. Source/system integrity

Final scoped audit mempertahankan453 pre-existing AI files; exactly2 report baru menjadi455 files. Git status130 pre-existing entries menjadi132 setelah dua report, seluruh old entries identik. Tidak ada existing repository file/source/database/report berubah. Snapshot repository tidak memuat SQLite file aktual (0); tidak melakukan database write di luar scope.
Retained protected scope:8 root/371 files, mencakup installed Codex50 dan R6W48;647 Hermes tracked path/hash match. Initial current snapshot324 melewatkan47 nested node_modules files pada installed Codex; seluruh50 sudah match historical hashes di JC-A dan dilengkapi kembali dalam baseline-protected-complete.json. Tidak ada old baseline/evidence diubah.
Historical missing2209 files/17 absent roots sudah terjadi sebelum task, tidak diklaim preserved/hash-verified. R3 runtime/build guards tetap absent/closed, candidate tetap MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE, Codex0.162.1 tidak dieksekusi/disubstitusi. Tidak ada dependency/system-security/config/token/ACL/SD/registry/Defender/firewall/UAC change atau credential/inference/billing action.
Claims perubahan sistem didukung source/IL/command scope, bukan comprehensive OS telemetry. Harness tidak memiliki network/provider capability dan tidak melakukan network call. Official Microsoft documentation diakses melalui browser tool sebagai reference; karena itu sesi keseluruhan tidak diklaim memiliki zero external web requests.
Exclusions: node_modules/.git untuk AI dan historical roots sesuai manifest; installed Codex hanya .git dikecualikan; Hermes tracked647 saja, bukan seluruh untracked files. Manifest mengecualikan dirinya sendiri dan mengikat semua disposable artifacts plus SHA dua report. Final evidence: evidence/audit/final-integrity.json dan inventory/manifest.json.

## AE. Final decision and next step

**CONTAINMENT_HOST_ONLY_PASS_METADATA_PARTIAL.** Tidak ada runtime uncertainty pada original reporter exit/Jc disposition; metadata tetap parsial dan J0 belum teramati.
Satu langkah yang direkomendasikan: **bounded controlled watchdog-crash containment validation dengan otorisasi terpisah**, terhadap target tetap yang ditinjau dan menunggu kooperatif. Ini menjawab process-supervision guarantee paling material; tidak dijalankan di sini dan tidak mengizinkan real worker.
Exactly repository writes: docs/reviews/M02-02S16B_R6W_JC_CONTAINMENT_REPORT.md dan docs/reviews/M02-02S16B_R6W_JC_SECURITY_GATE_MATRIX.md. Native artifacts hanya R6W_JC_ROOT. Owner review tambahan hanya untuk deliberate crash validation atau emergency HOLD jika kelak terpicu; tidak ada approval rutin yang masih menunggu.

**M02-02S16B-R6W-JC CONTAINMENT_PASS — REPORTER EXIT VERIFIED — METADATA PARTIAL — REAL WORKER BLOCKED.**
