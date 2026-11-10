# M02-02S16B-R6W-JC-M — Token Query Repair & J0 Metadata Baseline

Tanggal pengguna: **2026-11-07 Asia/Jakarta**. Timestamps evidence memakai UTC. Keputusan **SECURITY_STOP**; Gate C/L PASS, Gate M FAILED, Gate S BLOCKED.

R6W_JC_M_ROOT=%TEMP%/ai-office-m0202s16br6wjcm-604a801d-ab8b-4e28-8cde-d009ba751191. Source/build/evidence paths berikut relatif terhadap root ini; repository hanya menerima dua report yang disebut di AD.

## A. Executive decision

TokenElevation class20 diperbaiki dan terverifikasi pada satu runtime: owned4-byte query, native success, ReturnLength4, normalized error0, Value=false. Target empty-J0 baseline **belum tercapai**: class21 TokenHasRestrictions menghasilkan native success dengan ReturnLength1 dan ditolak guard minimum/exact4 sebelum payload parsing.
Reporter mencatat SecurityStop=true, Completed=false, TOKEN_SAFETY_INVARIANT dan exit40. Semua8 resource reporter dilepas, independent reporter/watchdog exit teramati, Jc kembali kosong dan ditutup. Milestone memakai **SECURITY_STOP**, tidak mempromosikan raw watchdog metadata-partial label menjadi safe metadata completion. Tidak ada memory corruption atau out-of-bounds read teramati; ini fail-closed validation stop.
Runtime tidak diulang, source/binary tidak diubah setelah runtime, J0=0, no crash/hang injection. Tidak ada MXC, worker, inference, credential/provider, paid API atau production integration.

## B. R6W-JC checkpoint

Baseline CONTAINMENT_PASS_METADATA_PARTIAL:89 historical tests PASS/1 SUPERSEDED,31 faults, Jc admission/normal lifecycle verified, J0=0. Actual checkpoint manifest77 entries/78 files dan dua report hashes cocok. Historical watchdog568F03631ABBD5868B32A09BA626EA0FA6B23AADC8C27383CB06714F21CE5C20; reporterAE172C219229331D938C33A14A8A32062CDE582C54176E49E30787395C99582E. Binary lama tidak dieksekusi.
Read-only forensics mencakup JC containment/matrix dan R6 M/J0 metadata report, old failed receipt, exact source/declarations/buffers dan prior policy. Existing455 AI files/132 git entries dibaseline;9 retained protected roots449 files dan647 Hermes tracked files. Earlier2209 historical TEMP files/17 absent roots tetap tidak diklaim tersedia atau verified.
PID23376/23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED. Historical JC PID26344/22920 bukan cleanup targets; tidak di-query sebagai proses saat ini. Candidate tetap MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; active Codex tidak dijalankan/disubstitusi.

## C. Actual failed token-query evidence

Old E006 GetTokenInformation/M-token/class20: Ok=false, Error24, ProbeError24. Source memanggil IntPtr.Zero/length0 lewat generic Variable; belum ada output allocation untuk field ini. ReturnLength tidak direkam, sehingga tidak dibuat nilai retrospektif.
Old E007 TokenPrivileges berhasil sesudah E006. Engine Failure INVALID_BUFFER_LENGTH muncul kemudian, sebelum J0. Urutan source menunjuk next class21, tetapi old class21 native parameters/ReturnLength tidak teramati; class21-specific explanation pada checkpoint lama tetap inference. Current class21 receipt1 tidak dipindahkan ke sejarah.

| Root-cause item | Actual evidence / limitation | Classification |
| --- | --- | --- |
| Native call site | source/reporter/NativeProvider.cs Token -> Variable -> GetTokenInformation; source matches historical binary/source manifest | SOURCE_VERIFIED |
| Information class | TokenElevation=20; old source numeric20 correct, no enum or TOKEN_ELEVATION declaration | SOURCE_VERIFIED |
| Input buffer | IntPtr.Zero sizing probe; no allocation for class20 | SOURCE_VERIFIED |
| Requested length | 0 bytes from the sole probe path for class20 | SOURCE_VERIFIED |
| ReturnLength | NOT RECORDED in old receipt; no historical value reconstructed | NOT VERIFIED |
| API result | false: E006.Ok=false / Error24 / ProbeError24; source captures error immediately after false | HOST_ONLY_OS_VERIFIED_HISTORICAL |
| Win32 error | 24 ERROR_BAD_LENGTH, distinct from122 ERROR_INSUFFICIENT_BUFFER | HOST_ONLY_OS_VERIFIED_HISTORICAL |
| Internal error | Engine Failure INVALID_BUFFER_LENGTH is an application exception, not error24. E007 TokenPrivileges succeeds after E006; next class21 path inferred, missing actual class21 native parameters/length | SOURCE_INFERENCE_WITH_RECEIPT_BOUNDARY |
| Expected structure | TOKEN_ELEVATION DWORD4 bytes, nonzero means elevated, not pointer-size8 | OS_DOCUMENTED_EXPECTATION |
| Owned resources | Token TOKEN_QUERY0x8 and process read-only handle;6 acquired/released resources, RemainingOwnedResources0; J0 attempts0 | HOST_ONLY_OS_VERIFIED_HISTORICAL |
| Root cause | Generic variable-size NULL/zero sizing strategy applied to fixed DWORD classes; class20 native24 rejected rather than queried with valid4-byte buffer. Separate class21 size-validation failure mechanism is inferred, exact old ReturnLength unavailable. No evidence of wrong DLL/ABI or Windows bug | SOURCE_AND_HISTORICAL_RECEIPT_SUPPORTED |


## D. Root cause investigation

Caller mengaplikasikan generic variable-size NULL/zero sizing pattern ke fixed DWORD token fields dan mengasumsikan hanya122 sebagai sizing response. Pada host terdahulu class20 menghasilkan24; helper langsung mengembalikan failed field tanpa mencoba documented4-byte output. Current direct4 success dengan signature/rights yang sama mengonfirmasi query-strategy repair untuk TokenElevation.
Tidak ada bukti enum20/DLL/ABI salah, Windows bug, atau corrupted handle. Alasan kernel spesifik untuk old24 dan old returned length tidak diketahui. Internal INVALID_BUFFER_LENGTH bukan native error24; current diagnostic membuktikan blocker baru terpisah pada class21 returnLength1.
Root cause scope: **TOKEN_ELEVATION_STRATEGY_REPAIRED_OS_OBSERVED; TOKEN_HAS_RESTRICTIONS_SIZE_UNSUPPORTED_FAIL_CLOSED**. Seluruh token family belum dinyatakan compatible.

## E. GetTokenInformation interop analysis

PInvoke tetap identik: Advapi32.dll, default CallingConvention.Winapi, SetLastError=true, BOOL MarshalAs(UnmanagedType.Bool), IntPtr token/data, Int32 information class, UInt32 requested bytes dan writable out UInt32 ReturnLength. Token hanya self primary process token melalui OpenProcessToken(GetCurrentProcess(),TOKEN_QUERY0x8); tidak ada privilege enable atau token mutation.
TokenNative.Read memanggil API lalu langsung mengambil Marshal.GetLastWin32Error hanya saat false. Source dan own-IL diinspeksi; tidak ada PInvoke lain sebelum capture. Tidak menambahkan native import. [GetTokenInformation](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-gettokeninformation), [OpenProcessToken](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocesstoken).

## F. TokenElevation structure analysis

Enum TokenElevation=20 eksplisit. TokenElevation struct berisi UInt32 TokenIsElevated, sequential size4 pada x64; DWORD4 berbeda dari pointer8. Parse memakai nonzero=true, sesuai kontrak, bukan strict only0/1. Existing Parse.Bool untuk parser historis tidak dilemahkan.
Direct query meminta4 bytes dari owned HGLOBAL, menginisialisasi fixed DWORD tersebut sebelum call dan tidak membaca payload sampai native success serta ReturnLength4. [TOKEN_ELEVATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-token_elevation), [TOKEN_INFORMATION_CLASS](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_information_class).

## G. Buffer sizing and ReturnLength

Class20/21/29 memakai direct4 dengan exact returned-size validation; variable classes1/25/3/6 memakai at most one probe dan one fill, bounded4..65536. Tidak ada resize/retry loop. Pointer fields dinormalisasi ke checked offsets sebelum native allocation dilepas; payload/raw handle/SID tidak diserialisasi.
Current TokenElevation requested4/returned4 success. Current TokenHasRestrictions requested4/returned1 success/error0. Dokumentasi menyebut DWORD untuk class21, namun actual receipt memuat1 byte length; ini gap kompatibilitas yang belum diinterpretasi sebagai value. Guard menolak sebelum Marshal.Copy/parse; valid allocated4 tidak berarti empat byte output valid.
Tidak ada silent lowering seluruh minimum length menjadi1. No post-runtime patch/retest/native retry. Evidence exact8 native calls pada U.

## H. Win32 error 24 versus 122

ERROR_BAD_LENGTH24 dan ERROR_INSUFFICIENT_BUFFER122 dibedakan.122 diterima hanya sebagai expected variable sizing probe dengan bounded ReturnLength;24 tidak diubah menjadi expected122. Current class20 tidak melakukan probe dan sukses; current class21 bukan failure native24/122: nativeSuccess=true/error normalized0, tetapi validation gagal.
[System Error Codes](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-). Native error dan application validation adalah dua fakta berbeda.

## I. Native error capture

Setiap token call menghasilkan api/informationClass/value, buffer classification(NULL/OWNED_BUFFER), allocated/requestedBytes, returnLength, nativeSuccess, win32Error, internalValidation dan finalStatus. Numeric pointer tidak dicatat. Pending adapter exception membiarkan return/error/length null, bukan fabricated OS result.
Success memakai win32Error0 sebagai normalization, bukan klaim bahwa GetLastError pada successful call dibaca atau bernilai0. Expected probe122 tetap dipertahankan walau subsequent fill sukses. Receipt raw tersimpan pada reporter-result.json; flattened view pada diagnostics/token-native-calls.json.

## J. Internal validation findings

INVALID_QUERY_RETURN_LENGTH adalah status aplikasi. Untuk actual class21: native success/error0/length1, Query.Ok=false, SafetyCritical=true. Engine langsung mencatat TOKEN_SAFETY_INVARIANT, berhenti sebelum class29/6/J0 dan tetap menjalankan Finish.
Safety stop adalah conservative policy response atas unsupported result shape; tidak ada bukti pointer escape, memory corruption, buffer overrun, atau unsafe DWORD read terjadi. Tests membuktikan jalur penolakan short/zero/oversized results, tetapi tidak menjamin semua field OS akan sesuai asumsi.
Reporter OSVersion projection pada E001 adalah Microsoft Windows NT6.2.9200.0, sedangkan manifested host preflight melaporkan10.0.26300.0. Kedua nilai dicatat apa adanya; tidak dijadikan bukti OS downgrade atau alasan error. Tidak mengubah manifest/environment untuk memaksakan query success.

## K. Exact reporter patch

NativeProvider.Token memakai bounded TokenReader; token pointer-normalization dipindahkan dari old Variable ke NormalizeToken tanpa mengubah algorithm bounds. Existing Variable tetap melayani self-relative SD; descriptor/J0 APIs tidak diganti. TokenQuery.cs menambah enum/4-byte structure/native receipt/helper tanpa import baru.
Model.Engine hanya menambah fatal SafetyCritical check; required successful TokenElevation=false sebelum J0 tetap sama. Program.cs hanya fresh invocation dan added TokenQuery.cs source hash binding. Tidak ada further patch sesudah sole runtime.

| File | Diff status | Exact scope | Old SHA-256 | New SHA-256 |
| --- | --- | --- | --- | --- |
| source/reporter/Model.cs | CHANGED | Only fatal SafetyCritical query check before any subsequent field/J0; required TokenElevation=false guard unchanged | 597C9B0D94F6EE7855B78BA971CCF683CED7DCCB57CBAEE7F4C23AB634157791 | BC2B8571250C98ED1B0B1274528F6CB5D607C7B7C1931BBD5E01A0327C43A65F |
| source/reporter/NativeProvider.cs | CHANGED | Token path delegates to bounded reader; pointer normalizer moved verbatim; original PInvoke signature/rights and J0 methods preserved | 0584F45DE80F009CAA7A0895FFBC3EF4D78B5D949D734AB3757945EF9B1BD6F5 | 10905ED21278DAB57D5D3C0D89A0EC1757A688BBEC8AC6272536A17257461EE7 |
| source/reporter/Program.cs | CHANGED | Fresh invocation and TokenQuery.cs source-hash binding only | 78D8483B69D98C19C92E8939DF7A3810D13744500DF47D8CAF5DAE02BD09BC56 | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 |
| source/reporter/TokenQuery.cs | NEW | Fixed DWORD query4, bounded variable probe/fill, exact native diagnostics, local failure isolation; no new native import |  | A5CCD0ABA98F382FD6305EB17380F046D3BAC39AC2F05471B579A61D64A941D3 |
| source/watchdog/Lifecycle.cs | UNCHANGED | No implementation changes | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/NativeHost.cs | UNCHANGED | No implementation changes | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 |
| source/watchdog/PrivateContainmentJob.cs | UNCHANGED | No implementation changes | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B |
| source/watchdog/ReporterReceipt.cs | UNCHANGED | No implementation changes | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/watchdog/WatchdogProgram.cs | CHANGED | Fresh invocation/generation and TokenQuery.cs source-hash binding only | 92E3CD075152FB387902F888490AF18B037EA9509900A875E8650695C3FF62BA | 6839B473E8B93A09D9DE6AEF1E25C51B362BA7CF351D659A01B02B6070C5AB0A |
| source/tests/JCTests.cs | UNCHANGED | No implementation changes | A89A9670D1953B69DC4573E3709582AB787852D552C79B63A1DFC6FBCAAC0226 | A89A9670D1953B69DC4573E3709582AB787852D552C79B63A1DFC6FBCAAC0226 |
| source/tests/MetadataTests.cs | NEW | New46 focused tests and25 fake faults |  | C4FB013A644A2B71912DD52137947EE6AD6C413981AECF3A2385D86DEA38C5AF |
| source/tests/R6WRegressions.cs | CHANGED | Expected fresh invocation nonce only | 493DE98D88B09FBB2A50D9CAB5737AB7F3F34FAA18A99A190E028D81DCCA2885 | A2429CC8B626F223F6FAC324E9BEEA6A71B0848F0E7BE74C70ED48100A983EE5 |


## L. Watchdog/Jc preservation

Lifecycle.cs, NativeHost.cs, PrivateContainmentJob.cs, ReporterReceipt.cs byte-identical. WatchdogProgram.cs normalized comparison sama setelah nonce/generation dan fourth reporter source-binding substitution. Rebuild diperlukan untuk fixed invocation/hash contract, bukan token repair yang mengubah process control.
Private unnamed Jc, kill0x2000, JOB_LIST atomic admission, CREATE_SUSPENDED, original handles, identity/membership-before-resume, no inheritance/duplication/breakaway, finite waits, targeted timeout protocol, independent exit dan emergency SECURITY_STOP_HOLD contract tetap tidak berubah. Tidak ada post-create AssignProcess fallback.

## M. Metadata error-isolation decision

TokenElevation adalah required safety field: query harus sukses dan false sebelum J0. Tidak diubah menjadi optional warning. Ordinary safely returned failures pada field opsional, misalnya native AccessDenied5 pada class21, boleh membuat metadata partial sambil melanjutkan independent J0 collection.
Invalid token ownership, unsafe bounds, pointer normalization/parse exception, untrusted return shape atau cleanup failure tetap fatal. Actual class21 length1 terkena rule fatal saat ini; tidak ada J0 dan tidak dilabel harmless warning secara retrospektif.
Smallest proposed future change adalah field-specific class21 optional NOT OBSERVED tanpa DWORD parsing ketika exact native receipt length1 masih within owned allocation, dengan failure severity yang direview. Itu belum diimplementasikan di milestone ini dan tidak mengizinkan general short reads atau melemahkan TokenElevation4.

## N. Static tests

**135 active PASS /0 FAIL /0 TIMEOUT;1 SUPERSEDED**:46 focused M +48 Jc +41 active R6W. First batch lolos, focused repair cycles0. Static/fake tests tidak menjalankan native process/job/token API; allocator fake boleh memakai local Marshal.AllocHGlobal/FreeHGlobal. Hasil awal disimpan immutable.
Passing source/static review tidak menjamin native metadata complete. Actual short class21 output kemudian memicu fail-closed guard sebagaimana source; tidak ada later PASS yang menghapus runtime failure.

| Focused test | Requirement | Result |
| --- | --- | --- |
| M-T01 | TokenElevation enum20 | PASS |
| M-T02 | TOKEN_ELEVATION layout4 | PASS |
| M-T03 | DWORD is UInt32 not pointer | PASS |
| M-T04 | GetTokenInformation PInvoke contract | PASS |
| M-T05 | Fixed direct4 no NULL probe | PASS |
| M-T06 | Bounded variable probe then fill | PASS |
| M-T07 | Expected122 sizing not fatal | PASS |
| M-T08 | Error24 distinct from122, no retry | PASS |
| M-T09 | Zero return length rejected before parse | PASS |
| M-T10 | Short return length rejected | PASS |
| M-T11 | Return length above allocation rejected | PASS |
| M-T12 | Invalid owned handle no native call | PASS |
| M-T13 | Access denied preserved | PASS |
| M-T14 | Elevation DWORD0 false | PASS |
| M-T15 | Any nonzero elevation DWORD true | PASS |
| M-T16 | Immediate native failure error capture source | PASS |
| M-T17 | Success does not report stale error | PASS |
| M-T18 | Validation remains separate from native status | PASS |
| M-T19 | Ordinary optional field failure isolated | PASS |
| M-T20 | Safety-critical field blocks J0 | PASS |
| M-T21 | Untrusted pointer/normalizer failure rejected | PASS |
| M-T22 | No unbounded native retry | PASS |
| M-T23 | Partial never fabricated metadata PASS | PASS |
| M-T24 | Failed token query releases buffer | PASS |
| M-T25 | Successful token query permits J0 | PASS |
| M-T26 | Optional failure permits J0; required elevation failure does not | PASS |
| M-T27 | One J0 guard | PASS |
| M-T28 | Unnamed J0 source and fake receipt | PASS |
| M-T29 | Empty J0 membership | PASS |
| M-T30 | No process assignment API | PASS |
| M-T31 | No termination/limit setting API in reporter | PASS |
| M-T32 | DACL sanitized parsing | PASS |
| M-T33 | DACL failure partial with cleanup | PASS |
| M-T34 | Handle flags parsing | PASS |
| M-T35 | Unexpected J0 member stops | PASS |
| M-T36 | J0 close failure recorded | PASS |
| M-T37 | Jc before reporter preserved | PASS |
| M-T38 | Kill-on-close retained | PASS |
| M-T39 | Atomic admission retained | PASS |
| M-T40 | No uncontained fallback | PASS |
| M-T41 | Membership before resume | PASS |
| M-T42 | Original custody retained | PASS |
| M-T43 | Independent exit unchanged | PASS |
| M-T44 | No second reporter | PASS |
| M-T45 | No retry after uncertainty | PASS |
| M-T46 | Crash not reported runtime verified | PASS |


| Affected JC/R6W regression | Requirement | Result | Note |
| --- | --- | --- | --- |
| JC-T01 | Private unnamed current-invocation Jc | PASS |  |
| JC-T02 | No named/shared job parameter | PASS |  |
| JC-T03 | Create Jc denial | PASS |  |
| JC-T04 | Existing job rejected without speculative close | PASS |  |
| JC-T05 | Owned Jc no transferred control | PASS |  |
| JC-T06 | Kill flag set before attributes/create | PASS |  |
| JC-T07 | Configure denial blocks process | PASS |  |
| JC-T08 | Incorrect flags reject | PASS |  |
| JC-T09 | Breakaway flags reject | PASS |  |
| JC-T10 | Limit query failure blocks launch | PASS |  |
| JC-T11 | Job list update consumes owned pointer | PASS |  |
| JC-T12 | Invalid attributes reject before create | PASS |  |
| JC-T13 | Allocation failure releases Jc | PASS |  |
| JC-T14 | Attribute update failure frees both buffers | PASS |  |
| JC-T15 | Process failure no execution | PASS |  |
| JC-T16 | No create-then-assign capability | PASS |  |
| JC-T17 | Suspended execution gate precedes resume | PASS |  |
| JC-T18 | No resume when membership unavailable | PASS |  |
| JC-T19 | Attribute storage live throughout create then released | PASS |  |
| JC-T20 | x64 layouts 64/48/144/104/112/24 | PASS |  |
| JC-T21 | Exact reporter membership | PASS |  |
| JC-T22 | Membership query failure no resume | PASS |  |
| JC-T23 | Unexpected member suppresses close and resume | PASS |  |
| JC-T24 | Identity mismatch no resume | PASS |  |
| JC-T25 | No original handle no targeted stop or exit claim | PASS |  |
| JC-T26 | PID reuse cannot authorize stop | PASS |  |
| JC-T27 | Inherited Jc rejected | PASS |  |
| JC-T28 | Known duplicate invalidates exclusive custody | PASS |  |
| JC-T29 | Transferred/borrowed handle cannot authorize close | PASS |  |
| JC-T30 | No double job close | PASS |  |
| JC-T31 | Last-handle uncertainty does not become crash-exit observation | PASS |  |
| JC-T32 | Prelaunch failure releases initialized allocation | PASS |  |
| JC-T33 | Crash before Jc no reporter | PASS |  |
| JC-T34 | Crash after config source invariant OS expectation | PASS |  |
| JC-T35 | Atomic create crash has configured Jc if process exists | PASS |  |
| JC-T36 | Suspended reporter crash follows conditional last-close rule | PASS |  |
| JC-T37 | Running reporter crash expectation no exit receipt | PASS |  |
| JC-T38 | Termination request alone cannot prove exit | PASS |  |
| JC-T39 | Job close failure holds without retry | PASS |  |
| JC-T40 | Cleanup exception cannot pass | PASS |  |
| JC-T41 | Normal exit independent original wait | PASS |  |
| JC-T42 | Timeout targeted bounded stop | PASS |  |
| JC-T43 | Failed termination separate from post-Jc exit | PASS |  |
| JC-T44 | Jc close is not an independent exit | PASS |  |
| JC-T45 | Accepted stop pending I/O remains unknown | PASS |  |
| JC-T46 | Reporter J0 has no assignment/kill/limits | PASS |  |
| JC-T47 | No second reporter after uncertainty | PASS |  |
| JC-T48 | No worker, network or process enumeration path | PASS |  |
| T01 | Fixed target accepted | PASS |  |
| T02 | Unknown executable rejected before create | PASS |  |
| T03 | Hash mismatch rejected | PASS |  |
| T04 | Creation failure no retry | PASS |  |
| T05 | Missing original process handle blocks control | PASS |  |
| T06 | Original handle retained through waits | PASS |  |
| T07 | Creation identity mismatch | PASS |  |
| T08 | Owner generation mismatch | PASS |  |
| T09 | PID reuse cannot authorize termination | PASS |  |
| T10 | Already exited in timeout race no terminate | PASS |  |
| T11 | Normal exit independently observed | PASS |  |
| T12 | Exit code read after signaled | PASS |  |
| T13 | Missing output does not erase exit or fabricate metadata | PASS |  |
| T14 | Conflicting nonce output rejected | PASS |  |
| T15 | Timeout distinct from termination and exit | PASS |  |
| T16 | WAIT_FAILED cannot become exit | PASS |  |
| T17 | Targeted termination accepted then wait exit | PASS |  |
| T18 | Termination failure retained | PASS |  |
| T19 | Accepted termination not exit proof | PASS |  |
| T20 | Close failure cannot pass resource gate | PASS |  |
| T21 | Double close prevented | PASS |  |
| T22 | Premature original close blocks termination | PASS |  |
| T23 | No watchdog OpenProcess fallback | PASS |  |
| T24 | No name-wide killer interface | PASS |  |
| T25 | No automatic second run | PASS |  |
| T26 | Crash before creation no reporter residue | PASS |  |
| T27 | Crash after creation residue remains | PASS |  |
| T28 | Crash after termination request not cleanup | PASS |  |
| T29 | Reporter hang can be stopped only by live owned watchdog | PASS |  |
| T30 | Metadata failed but exit observed | PASS |  |
| T31 | Zero exit not metadata PASS | PASS |  |
| T32 | Cleanup cannot PASS without exit | PASS |  |
| T33 | Watchdog no containment job native capability | SUPERSEDED | R6W-JC explicitly authorizes private Jc; replaced by JC-T01/T06/T11/T16 |
| T34 | No shell entry | PASS |  |
| T35 | Reporter no process creation/termination/assignment | PASS |  |
| T36 | No production integration reference | PASS |  |
| T37 | Signaled process with exit259 is not relabeled alive | PASS |  |
| T38 | Wait dependency blocks handle close | PASS |  |
| R01 | Fresh copied reporter nonce equals watchdog protocol | PASS |  |
| R02 | Reporter observation scope retained | PASS |  |
| R03 | Stale reporter nonce rejected by actual receipt parser | PASS |  |
| R04 | Actual receipt parser requires queries and release not summary alone | PASS |  |


## O. Fault injection

25 fake scenarios PASS. Token failures menguji actual TokenReader; metadata fake menguji actual Engine; preserved fake IHost/IJobApi menguji unchanged Controller/Jc. Tidak ada deliberate native crash/timeout/hang injection. Cleanup uncertainty dan second invocation rejection tetap tercakup.

| Fault | Initial | Injection | Expected | Actual | Cleanup | Evidence class | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M-F01 | NOT_STARTED | ElevationSizingFailure | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | NOT OBSERVED; PROBE_NATIVE_FAILURE; nativeError=24 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F02 | NOT_STARTED | BadLength | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | TOKEN_ELEVATION_NOT_OBSERVED; QUERY_NATIVE_FAILURE; nativeError=24 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F03 | NOT_STARTED | Insufficient | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | TOKEN_ELEVATION_NOT_OBSERVED; QUERY_NATIVE_FAILURE; nativeError=122 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F04 | NOT_STARTED | ShortLength | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; INVALID_QUERY_RETURN_LENGTH; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F05 | NOT_STARTED | ZeroLength | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; INVALID_QUERY_RETURN_LENGTH; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F06 | NOT_STARTED | HugeLength | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; INVALID_QUERY_RETURN_LENGTH; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F07 | NOT_STARTED | NullBuffer | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; NULL_OWNED_OUTPUT_BUFFER; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F08 | NOT_STARTED | InvalidHandle | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; OWNED_TOKEN_HANDLE_REQUIRED; nativeError=6 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F09 | NOT_STARTED | Throws | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; INTERNAL_OR_RESOURCE_EXCEPTION_InvalidOperationException; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F10 | NOT_STARTED | CleanupFailure | No success fabrication; native24/122 separate, unsafe bounds/exception/ownership/cleanup fatal; no retry | SAFETY_CRITICAL_FAILURE; INTERNAL_OR_RESOURCE_EXCEPTION_IOException; nativeError=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F11 | NOT_STARTED | LaterField | Safe partial metadata with bounded one-shot J0 or recorded creation failure | GateM=INCONCLUSIVE; SecurityStop=False; J0=1; Failure= | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F12 | NOT_STARTED | Optional | Safe partial metadata with bounded one-shot J0 or recorded creation failure | GateM=INCONCLUSIVE; SecurityStop=False; J0=1; Failure= | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F13 | NOT_STARTED | Critical | SECURITY_STOP / no metadata PASS | GateM=FAILED; SecurityStop=True; J0=0; Failure=TOKEN_SAFETY_INVARIANT | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F14 | NOT_STARTED | J0Failure | Safe partial metadata with bounded one-shot J0 or recorded creation failure | GateM=INCONCLUSIVE; SecurityStop=False; J0=1; Failure=JOB_CREATION_FAILED_NO_RETRY | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F15 | NOT_STARTED | DaclFailure | Safe partial metadata with bounded one-shot J0 or recorded creation failure | GateM=INCONCLUSIVE; SecurityStop=False; J0=1; Failure= | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F16 | NOT_STARTED | MembershipFailure | Safe partial metadata with bounded one-shot J0 or recorded creation failure | GateM=INCONCLUSIVE; SecurityStop=False; J0=1; Failure= | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F17 | NOT_STARTED | UnexpectedMember | SECURITY_STOP / no metadata PASS | GateM=FAILED; SecurityStop=True; J0=1; Failure=UNEXPECTED_JOB_MEMBER | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F18 | NOT_STARTED | J0CloseFailure | SECURITY_STOP / no metadata PASS | GateM=FAILED; SecurityStop=True; J0=1; Failure= | FAKE_UNCERTAIN_OR_HOLD | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F19 | NOT_STARTED | MissingReceipt | Preserved watchdog fake-provider lifecycle; metadata receipt cannot create exit evidence | LIFECYCLE_PASS_METADATA_PARTIAL; Exit=True; Terms=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F20 | NOT_STARTED | ConflictReceipt | Preserved watchdog fake-provider lifecycle; metadata receipt cannot create exit evidence | LIFECYCLE_PASS_METADATA_PARTIAL; Exit=True; Terms=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F21 | NOT_STARTED | WaitFailure | Preserved watchdog fake-provider lifecycle; metadata receipt cannot create exit evidence | RUNTIME_INCONCLUSIVE; Exit=False; Terms=0 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F22 | NOT_STARTED | Timeout | Preserved watchdog fake-provider lifecycle; metadata receipt cannot create exit evidence | LIFECYCLE_PASS_METADATA_PARTIAL; Exit=True; Terms=1 | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F23 | NOT_STARTED | MissingJcMembership | No resume when Jc membership missing | SECURITY_STOP; Resume=0; Hold=False | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F24 | NOT_STARTED | SecondReporter | Second invocation denied after exit uncertainty | RUNTIME_INCONCLUSIVE; Resume=1; Hold=False | FAKE_RELEASE_CONFIRMED | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |
| M-F25 | NOT_STARTED | JcCloseUncertainty | Preserved SECURITY_STOP_HOLD, no automatic cleanup | SECURITY_STOP; Resume=1; Hold=True | FAKE_UNCERTAIN_OR_HOLD | STATIC_TEST_VERIFIED_FAKE_PROVIDER | PASS |


## P. Superseded regression reconciliation

Old **R6W-T33 Watchdog no containment job native capability** tetap SUPERSEDED karena Owner JC mengizinkan satu private Jc. Tidak dihitung PASS atau dibuang diam-diam. Invariant yang dipertahankan: melarang unowned/unscoped/arbitrary process control serta uncontained fallback.
Replacement: JC-T01 private/unnamed owner, JC-T06 kill flag before create, JC-T11 owned JOB_LIST, JC-T16 no AssignProcessToJobObject; M-T37–M-T46 mempertahankan custody/exit/no retry/crash scope. Semua relevant replacements PASS.

## Q. Build and SHA-256

Existing signed Microsoft .NET Framework64 csc, x64 optimized warn4/warnaserror; compiler exits0/0/0 dan warning0. Tidak ada dependencies diinstall. New binaries saja yang dieksekusi; test DLL terpisah, tidak linked ke reporter.

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| Reporter | build/reporter/R6MetadataReporter.exe | 750499493C9CBCE2BB62C6DE6CD9559E976ABBF05DD92D8D08817E69E685395B |
| Watchdog | build/watchdog/JCWatchdog.exe | C528E7EBC01F0F6C5589A3D6E89084F8C1E9B1C42EEAF5068E64821BB9FF9389 |
| Tests | build/tests/JC.Tests.dll | C371346D5EDE883BF87726191BC0343433E309AF0575ED7E8D3D9285FBC63F41 |
| Reporter source manifest | build/reporter/source-manifest.json | 6CC695875E389A532DB6C2309F096E3BB1269C7A2076A8979B5BCE55F8B1BAA9 |
| Compiler | %WINDIR%/Microsoft.NET/Framework64/v4.0.30319/csc.exe | ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3 |


| Source | Bytes | SHA-256 |
| --- | --- | --- |
| source/reporter/Model.cs | 8608 | BC2B8571250C98ED1B0B1274528F6CB5D607C7B7C1931BBD5E01A0327C43A65F |
| source/reporter/NativeProvider.cs | 10936 | 10905ED21278DAB57D5D3C0D89A0EC1757A688BBEC8AC6272536A17257461EE7 |
| source/reporter/TokenQuery.cs | 5899 | A5CCD0ABA98F382FD6305EB17380F046D3BAC39AC2F05471B579A61D64A941D3 |
| source/reporter/Program.cs | 3849 | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 |
| source/watchdog/Lifecycle.cs | 11584 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/ReporterReceipt.cs | 3575 | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/watchdog/NativeHost.cs | 13348 | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 |
| source/watchdog/PrivateContainmentJob.cs | 12715 | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B |
| source/watchdog/WatchdogProgram.cs | 4472 | 6839B473E8B93A09D9DE6AEF1E25C51B362BA7CF351D659A01B02B6070C5AB0A |

Own-assembly audit: reporter12 imports/704 method references; watchdog19 imports/1516 references. Semua own methods/constructors decoded; forbidden calls/calli/dynamic native loads/network/shell/mutation absent. Framework dipercaya, tidak seluruhnya disassemble.

## R. Internal adversarial review

**INTERNAL_ADVERSARIAL_REVIEW — SAFETY_REVIEW_PASS**,30/30 sebelum runtime. Distinct second-pass oleh agent yang sama; bukan independent human verification. Root-cause evidence limits, field-specific severity, source scope dan OS crash limitations dinyatakan sebelum permit.

| Review | Question | Evidence | Finding | Outcome |
| --- | --- | --- | --- | --- |
| IR01 | Was the original failure actually diagnosed? | root-cause-initial.json; historical E006/NativeProvider.Variable | Actual NULL/0 class20 native24 identified; old ReturnLength unavailable. Later class21 internal-length origin remains explicit inference, no invented old value | PASS |
| IR02 | Is the fix supported by actual source evidence? | source-diff-inventory.json; NativeProvider.Token + TokenQuery.cs | Fixed DWORD direct4 replaces invalid generic sizing assumption; no claim of broken Windows DLL/ABI | PASS |
| IR03 | Is information class 20 correctly represented? | M-T01/T04; TokenInformationClass enum | TokenElevation20 retained and explicitly named | PASS |
| IR04 | Is `TOKEN_ELEVATION` correctly marshalled? | M-T02/T03/T14/T15 | TOKEN_ELEVATION UInt32 size4; any nonzero elevated; no pointer-sized boolean | PASS |
| IR05 | Are input and output buffer lengths correct? | M-T05-T11/T21 | Owned bounded allocation, fixed exact4, variable probe then single fill, length checked before copy/normalize | PASS |
| IR06 | Are Win32 errors captured correctly? | M-T16-T18; TokenNative.Read source + IL | PInvoke return then immediate failed-call GetLastError; success error0; validation text distinct | PASS |
| IR07 | Is `ERROR_BAD_LENGTH` distinguished from `ERROR_INSUFFICIENT_BUFFER`? | M-T07/T08; M-F01-F03 | 24 remains24,122 expected only for variable sizing; no silent reinterpretation | PASS |
| IR08 | Could a failed query cause unsafe memory access? | M-T09-T12/T20/T21 | Failed or malformed result never parsed; null handle/pointer/bounds/exception fatal | PASS |
| IR09 | Are optional metadata failures safely isolated? | M-T19/T26; M-F11/F12 | Ordinary optional metadata failure can proceed safely; TokenElevation is required and cannot be bypassed | PASS |
| IR10 | Are safety-critical failures still fatal? | M-T20/T21; Engine SafetyCritical | Invalid buffers/ownership/exception/cleanup failures stop before J0; required elevation=false guard unchanged | PASS |
| IR11 | Can J0 be created more than once? | M-T27; NativeProvider.Once | At most one J0 attempt, no retry | PASS |
| IR12 | Can the reporter assign a process to J0? | M-T30; reporter12 import allowlist | No AssignProcessToJobObject or other assignment capability | PASS |
| IR13 | Can the reporter modify Jc? | M-T31; Private Jc handle never exported | Reporter cannot access/mutate Jc through intended API/source surface | PASS |
| IR14 | Can the reporter create another process? | M-T30/T31; API/IL audit | Reporter has no process creation/shell/network capability | PASS |
| IR15 | Is the Jc containment code unchanged? | source-diff inventory4 identical watchdog control files | No Jc cleanup/control-flow semantics changed; watchdog entry normalized equality after binding substitution | PASS |
| IR16 | Is atomic admission preserved? | M-T39/T40; JC-T11/T16 | JOB_LIST atomic suspended creation unchanged, no fallback | PASS |
| IR17 | Is original-process-handle custody preserved? | M-T42; R6W custody regressions | Retained original process/thread handles; no PID reopen | PASS |
| IR18 | Is Jc membership checked before resume? | M-T41; JC-T18/T21 | Membership check before resume unchanged | PASS |
| IR19 | Are watchdog waits finite? | M-T43/M-F21/F22; unchanged NativeHost.Wait | Wait allowlist0/5000/20000ms; native/IO hard-preemption not guaranteed | PASS |
| IR20 | Is the targeted termination path unchanged? | unchanged Lifecycle.StopOwned and NativeHost.Terminate | Targeted original-handle timeout protocol byte-identical | PASS |
| IR21 | Can a second reporter launch after uncertainty? | M-T44/T45; M-F24/F25 | No automatic second invocation after uncertain exit/disposition | PASS |
| IR22 | Are resource ownership and disposal complete? | M-T24/T36; TokenReader + NativeProvider.Buffer/Finish | Buffers finally released; cleanup failure critical; own-handle ledger retained | PASS |
| IR23 | Is J0 metadata separated from process containment? | M-T27-T31; J0 CreateJob(NULL,NULL) | Separate empty J0, no kill flag/assignment; creation is not nested membership | PASS |
| IR24 | Does the code avoid fabricating metadata success? | M-T23/T33; unchanged strict ReporterReceipt | Metadata PASS requires query success plus identity/release; optional errors remain partial | PASS |
| IR25 | Does the code avoid claiming watchdog-crash recovery? | M-T46; unchanged ContainmentCrashContract | Only OS_DOCUMENTED_EXPECTATION conditional on last holder; no deliberate crash or recovery proof | PASS |
| IR26 | Are source/binary hashes correct? | build-provenance.json; compiler0/0/0 | Source/binary hashes verified, current compiler signature checked, no quarantined executable reused | PASS |
| IR27 | Is previous test coverage preserved? | 46 focused +48 JC +41 active R6W; superseded-regression.json | 135 active PASS,1 explicit SUPERSEDED adequately replaced; historical failed evidence untouched | PASS |
| IR28 | Are all changes disposable? | fresh R6W_JC_M_ROOT; repository baseline455 | Implementation only disposable; exactly2 new repo reports authorized | PASS |
| IR29 | Are existing user files preserved? | baseline-ai/git/protected/hermes inventories | Existing changes preserved; previous missing2209 TEMP files remain disclosed, not restored | PASS |
| IR30 | Does the revised reporter remain within the authorized capability boundary? | API/IL audited reporter12 imports | Query-only primary process token TOKEN_QUERY; no mutation/credential/provider/worker capability. Class29 is observation of primary token, not proof of worker sandbox | PASS |


## S. Runtime preflight

**R6W_JC_M_RUNTIME_AUTHORIZED** pada27 prerequisites PASS: checkpoint/source/binary integrity, narrow patch,135 tests/25 faults, adequate SUPERSEDED replacements, source/IL/review, unchanged Jc/atomic/original-custody/cleanup, fresh nonce/budget, fixed no-child/no-mutation reporter dan self current token non-admin/non-SYSTEM.
Izin hanya satu normal experiment; no crash/reporter crash/hang injection/retry. Existing documented/source last-handle contract tetap conditional dan tidak memerlukan crash experiment baru sebelum normal run. Gate S BLOCKED, bukan alasan untuk memalsukan metadata success.

## T. Runtime invocation or NOT RUN

Actual Invocation dcc9189e-1604-4e08-a441-7ba5893d35fc; Generation 6f21bb32-02b3-4bf6-8c3b-1a10601e211b. Reporter creation UTC 2026-11-06T20:11:35.5954201Z. Client date2026-11-07 Asia/Jakarta; raw timestamps UTC.

| Resource/action | Maximum | Actual |
| --- | --- | --- |
| Watchdog | 1 | 1 |
| Jc | 1 | 1 |
| Reporter | 1 | 1 |
| J0 | 1 | 0 |
| Reporter children | 0 | 0 |
| Retries / crash / hang injection | 0 | 0 |
| Targeted termination requests | At most1 if naturally needed | 0 |
| Unrelated targets / MXC / app-server / worker / inference / paid API | 0 | 0 |

No-retry.json menutup anggaran consumed. Compiler/PowerShell tool processes terpisah dari fixed runtime experiment, tidak dipakai sebagai cleanup helper. Tidak ada global process census atau arbitrary historical PID query.

## U. Reporter token results

**TokenElevation repair verified:** E006 class20/allocated4/requested4/returned4/native success/error0/Value=false. TokenIntegrityLevel MEDIUM teramati. TokenUser dan TokenPrivileges queries berhasil. Class21 E008 nativeSuccess=true/requested4/returned1/error0 tetapi validation failed dan tidak ada parsed Value.
Class29 dan TokenDefaultDacl6 tidak dijalankan sesudah stop.8 actual native token calls terdiri dari probes/fills classes1/25/3 serta direct20/21; jangan menghitung probe122 sebagai failed metadata field bila fill sukses.

| Record | Class | Value | Input | Allocated | Requested | ReturnLength | Native success | Error | Validation | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E004 | TokenUser | 1 | NULL | 0 | 0 | 44 | False | 122 | EXPECTED_INSUFFICIENT_BUFFER | EXPECTED_SIZE_PROBE |
| E004 | TokenUser | 1 | OWNED_BUFFER | 44 | 44 | 44 | True | 0 | VALIDATED | OS_METADATA_VERIFIED |
| E005 | TokenIntegrityLevel | 25 | NULL | 0 | 0 | 28 | False | 122 | EXPECTED_INSUFFICIENT_BUFFER | EXPECTED_SIZE_PROBE |
| E005 | TokenIntegrityLevel | 25 | OWNED_BUFFER | 28 | 28 | 28 | True | 0 | VALIDATED | OS_METADATA_VERIFIED |
| E006 | TokenElevation | 20 | OWNED_BUFFER | 4 | 4 | 4 | True | 0 | VALIDATED | OS_METADATA_VERIFIED |
| E007 | TokenPrivileges | 3 | NULL | 0 | 0 | 64 | False | 122 | EXPECTED_INSUFFICIENT_BUFFER | EXPECTED_SIZE_PROBE |
| E007 | TokenPrivileges | 3 | OWNED_BUFFER | 64 | 64 | 64 | True | 0 | VALIDATED | OS_METADATA_VERIFIED |
| E008 | TokenHasRestrictions | 21 | OWNED_BUFFER | 4 | 4 | 1 | True | 0 | INVALID_QUERY_RETURN_LENGTH | SAFETY_CRITICAL_FAILURE |

Seluruh query stream9 records:8 OK/1 failed application validation. E009 release sukses. Raw results tidak diubah untuk menutupi reporter SafetyCritical=true.

## V. J0 creation and metadata

**NOT RUN: J0=0.** Stop terjadi sebelum CreateJob; tidak ada J0 handle yang harus ditutup. Self M descriptor/flags bukan pengganti J0 observations. Tidak ada DACL, owner, ACE, empty-membership atau J0-close receipt yang dibuat dari asumsi.

| Item | Required observation | Status | Evidence boundary |
| --- | --- | --- | --- |
| J01 | Creation result | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J02 | Owner classification | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J03 | Effective object DACL query | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J04 | DACL present/absent | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J05 | Sanitized relevant ACEs | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J06 | Inherit flag | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J07 | Protect-from-close flag | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J08 | Membership query | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J09 | Assigned count | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J10 | Unexpected membership | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J11 | J0 handle close | NOT RUN | J0 never acquired; reporter-owned resources separately verified |
| J12 | J0 final resource disposition | NOT RUN | J0 never acquired; reporter-owned resources separately verified |

J0 source tetap CreateJobObjectW(NULL,NULL), no assignment/limits/kill configuration, own metadata-only job. Existing GetKernelObjectSecurity(OWNER|DACL0x5) memakai caller HGLOBAL/self-relative SD; LocalFree NOT_APPLICABLE, bukan leak. Tidak perlu mengganti dengan GetSecurityInfo untuk token repair. Creating empty J0 tidak otomatis nested membership. [CreateJobObjectW](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-createjobobjectw), [QueryInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-queryinformationjobobject), [GetSecurityInfo](https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo).

## W. Jc containment results

Private Jc created once, default unnamed attributes; class9/144 bytes set/query8192=0x2000. Atomic JOB_LIST0x2000d + STARTUPINFOEX112 + flags0x08080404. Original reporterPID15336, creation/image/generation/key matched; IsProcessInJob true dan exact singleton before ResumeThread previous count1.
Membership0→[15336]→0. Original reporter wait signaled sebelum final query/owned-Jc close success. Process/thread flags0; no intentional inherited/duplicated/exported Jc handles, no breakaway. Actual global last holder tidak dibuktikan; normal close pada empty job tidak menguji kill-on-close termination trigger atau crash recovery.

## X. Reporter and watchdog exit accounting

Reporter PID15336 original WaitForSingleObject(20000)=WAIT_OBJECT_0(0), error0; GetExitCodeProcess=40. WatchdogPID12932 original outer WaitForExit(60000)=true/code30. Timeout=false, targeted TerminateProcess0. Kedua exit teramati, tidak ada unresolved process pada invocation ini.
Raw unchanged watchdog melaporkan GateC/L PASS, GateM INCONCLUSIVE dan LIFECYCLE_PASS_METADATA_PARTIAL karena Controller tidak mempropagasikan reporter SecurityStop ke lifecycle classification. Raw reporter memuat SecurityStop=true/Completed=false/exit40. Auditor mempertahankan fakta tersebut dan memilih milestone SECURITY_STOP; tidak melakukan unauthorized watchdog redesign untuk mengubah label.

## Y. Resource accounting

Reporter E009 merekam8 acquired resources, seluruhnya ReleaseAttempted/Released=true, Dependents0, RemainingOwnedResources0:2 query handles dan6 HGLOBAL. Tidak ada J0 acquisition. Independent audit mengkorelasikan nonce/binary/source/selfPID/time sebelum menerima narrower release receipt.
Watchdog owned Jc/process/thread close success; environment, attribute list/array, image lock dilepas sesuai source/event ledger. Membership scratch buffers source-finally FreeHGlobal; tidak ada whole-system heap/handle telemetry. Own handle close bukan exit proof.
Controller masih memberi REPORTER_USER_MODE_RELEASE_NOT_VERIFIED karena label terikat full MetadataPass. Raw JSON dipertahankan; verified E009 resource receipt dilaporkan terpisah, bukan full metadata PASS. No-retry closure menyatakan source/binaries frozen sesudah runtime.

| Resource | Kind | Acquired | Release attempted | Released | Dependents | Error |
| --- | --- | --- | --- | --- | --- | --- |
| M-process | HANDLE | True | True | True | 0 | 0 |
| M-token | HANDLE | True | True | True | 0 | 0 |
| SD-M-1 | HGLOBAL | True | True | True | 0 | 0 |
| Token1-2 | HGLOBAL | True | True | True | 0 | 0 |
| Token25-3 | HGLOBAL | True | True | True | 0 | 0 |
| Token20-4 | HGLOBAL | True | True | True | 0 | 0 |
| Token3-5 | HGLOBAL | True | True | True | 0 | 0 |
| Token21-6 | HGLOBAL | True | True | True | 0 | 0 |


## Z. Gate C/L/M/S


| Gate | Decision | Exact scope |
| --- | --- | --- |
| C | PASS | Actual private Jc configuration and atomic suspended admission verified |
| L | PASS | Original reporter abort exit40/watchdog exit30 and owned cleanup independently observed |
| M | FAILED | Token20 success, but Token21 unsupported returnLength1 triggers SafetyCritical; J0 not created |
| S | BLOCKED | No crash/hostile-holder/real tree/MXC/fencing/credential/provider/billing guarantees |


## AA. Remaining security limitations

No watchdog/reporter crash tests, no unreviewed native hang/timeout injection, no hostile same-user/global-handle census, no real process-tree cleanup, MXC compatibility, worker restrictions, physical output fencing, production supervisor, credential custody, subscription entitlement atau included-only billing enforcement.
Metadata blocker baru konkret: class21 returned1, bukan kelas20 yang sudah diperbaiki. Optional class21 bukan sumber authority Jc atau syarat non-elevation, tetapi current guard menghentikan J0. Safe field-specific classification bisa dinilai statis dalam scope terpisah; tidak otomatis mengizinkan crash study atau new runtime.

## AB. Source/system integrity

455 pre-existing AI files/source/reviews unchanged; exactly2 reports baru menjadi457. Git132 old entries dipertahankan, +2 menjadi134. Existing repository snapshot berisi0 actual SQLite files; tidak ada DB write, tidak mengklaim audit seluruh appdata DB.
9 retained roots449 files verified, termasuk JC78, R3/R6/R6W source/evidence dan active Codex50 termasuk nested dependency files;647 Hermes tracked hashes/path set unchanged. Earlier2209 unavailable historical TEMP files/17 absent roots tetap disclosed, tidak restored atau claimed verified.
R3 native guard tetap closed, missing Codex candidate tetap unavailable, active Codex0.162.1 tidak dieksekusi/substitusi. No dependency install/elevation/ACL/SD/token/security/registry/Defender/firewall/UAC/service/task changes. Authorized Jc local limit tetap original baseline, bukan OS-wide security-setting mutation.
Source/command scope menunjukkan no harness/provider network, credentials, inference atau paid API. Official Microsoft reference browsing dilakukan terpisah; sesi keseluruhan tidak diklaim zero web requests. Scope hash excludes AI node_modules/.git, protected roots sesuai recorded exclusions, Hermes tracked647 saja; tidak whole-system telemetry.
Final evidence: evidence/audit/final-integrity.json dan inventory/manifest.json. Manifest mencakup disposable files dan SHA dua report, mengecualikan dirinya sendiri. Source/binary hashes cocok dengan sole runtime dan tidak diubah setelahnya.

## AC. Final classification

**SECURITY_STOP.** Ini bukan FULL_METADATA_PASS, bukan successful J0 baseline, dan bukan RuntimeInconclusive exit: exit/containment/cleanup terverifikasi, tetapi reporter secara eksplisit menghentikan unsafe-to-interpret shape.
Tidak ada klaim bahwa actual memory-safety violation/corruption terjadi. Conservative guard bekerja dengan menolak read/parse dan menutup resource. Native TokenElevation repair tetap observed success; tidak digunakan untuk menghapus failure class21 atau menaikkan Gate M.

## AD. One recommended next step

Satu tindakan terbatas: **static-only field-specific TokenHasRestrictions returnLength1 remediation review** memakai captured receipt replay. Smallest proposed correction adalah mempertahankan native success/length1, tidak membaca DWORD, mengklasifikasikan optional unsupported metadata sebagai NOT OBSERVED hanya jika ownership/buffer guarantees utuh; tetap strict4/false untuk TokenElevation dan fatal untuk bounds/ownership/cleanup failures.
Belum diimplementasikan atau dijalankan. New native reporter experiment memerlukan otorisasi Owner baru; budget milestone ini consumed dan tidak di-retry. Controlled watchdog-crash validation tidak dimulai atau direkomendasikan sebagai tindakan kedua sebelum metadata decision ini diselesaikan.
Exactly repository writes: docs/reviews/M02-02S16B_R6W_JC_M_TOKEN_QUERY_REPAIR_REPORT.md dan docs/reviews/M02-02S16B_R6W_JC_M_SECURITY_GATE_MATRIX.md. Implementasi/evidence hanya R6W_JC_M_ROOT. Tidak ada approval rutin tertunda; keputusan Owner tambahan hanya untuk scope/runtime baru.

**M02-02S16B-R6W-JC-M SECURITY_STOP — TOKEN_ELEVATION VERIFIED — TOKEN_HAS_RESTRICTIONS RETURN_LENGTH 1 REJECTED — J0 NOT CREATED — NO RETRY — REAL WORKER BLOCKED.**
