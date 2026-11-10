# M02-02S16B-R6W-JC-M2 TokenHasRestrictions Compatibility Report

Tanggal: 2026-11-07 Asia/Jakarta. Continuation dari M SECURITY_STOP; seluruh hasil baru STATIC ONLY.

## A. Executive decision

**STATIC_COMPATIBILITY_PASS. Gate P STATIC PASS; Gate J STATIC/DESIGN PASS; Gate S BLOCKED.**

Class21 ReturnLength=1 diakui sebagai bentuk kompatibilitas diagnostik dan tetap NOT_OBSERVED. Tidak ada decoder Boolean yang diaktifkan. Ownership, liveness, alignment, kapasitas, ukuran request dan penyelesaian native call wajib utuh sebelum ketidakpastian dianggap opsional. Semua kegagalan safety tetap fatal.

Hasil final: 40 targeted tests PASS, 25 fake faults PASS, 3 replay PASS, internal review 30/30 PASS; 0 final FAIL/SKIP/TIMEOUT. Dua repair cycles dipakai. Reporter/watchdog/Jc/J0 runtime invocation masing-masing ZERO. Ini bukan bukti Windows runtime atau kesiapan worker.

## B. Previous checkpoint

Checkpoint M tetap SECURITY_STOP, bukan diubah menjadi runtime PASS. Historical counts: 135 static PASS, 25 fault PASS, 1 SUPERSEDED; counts lama tidak ditambahkan ke hasil M2.

Historical invocation dcc9189e-1604-4e08-a441-7ba5893d35fc, generation 6f21bb32-02b3-4bf6-8c3b-1a10601e211b. Reporter PID15336 exit40; watchdog PID12932 exit30. Jc flags0x2000, membership0 ->15336 ->0, atomic admission before resume, original-handle exit observation. J0=0, retries=0, crashes=0. E009 mencatat8 resources released, remaining0. Hash historical reporter 750499493C9CBCE2BB62C6DE6CD9559E976ABBF05DD92D8D08817E69E685395B; watchdog C528E7EBC01F0F6C5589A3D6E89084F8C1E9B1C42EEAF5068E64821BB9FF9389. Keduanya tersedia dan hash cocok; tidak dieksekusi.

M report/matrix, JC report/matrix, source reporter/watchdog, receipt, cleanup dan supersession record dibaca. Source yang diperlukan tersedia; tidak direkonstruksi dari asumsi.

## C. Exact class-21 native receipt

evidence/checkpoint/reporter-result.json, Result.Queries E008, memuat Api=GetTokenInformation, class21/TokenHasRestrictions, input OWNED_BUFFER, requestedBytes4, allocatedBytes4, nativeSuccess=true, win32Error0, returnLength1. Internal validation INVALID_QUERY_RETURN_LENGTH; finalStatus SAFETY_CRITICAL_FAILURE; SafetyCritical=true; Query.Ok=false; Query.Error=0. Engine.Failure=TOKEN_SAFETY_INVARIANT; JobAttempts0.

evidence/checkpoint/token-native-calls.json menyimpan diagnostic mapping yang sama. historical-fact-verification.json mencocokkan kedua file dengan assertions host. Native success tidak diubah menjadi native failure; penghentian berasal dari validasi internal.

## D. Historical evidence limitations

Tidak ada output-byte class21 atau numeric pointer/alignment dalam receipt M. allocatedBytes4 adalah kapasitas yang dicatat oleh aplikasi, bukan pengukuran ulang. Label OWNED_BUFFER dan E009 ledger tidak merekonstruksi alignment/payload runtime. Replay B mempertahankan UNKNOWN dan tidak memberikan continuation authority.

Raw watchdog melaporkan LIFECYCLE_PASS_METADATA_PARTIAL / GateM INCONCLUSIVE / watchdog SecurityStop=false, sedangkan reporter SecurityStop=true. Auditor M memilih SECURITY_STOP berdasarkan reporter. Ketidaksamaan label tetap dicatat; tidak ada koreksi receipt historis atau perubahan watchdog.

M menyatakan tidak ada memory corruption yang teramati. Itu bukan pembuktian tidak adanya semua jenis corruption. Sebanyak2209 historical TEMP files/17 roots sebelumnya tidak tersedia menurut inventori M; M2 tidak memulihkan atau mengklaim file tersebut terverifikasi.

## E. Published Windows contract

[GetTokenInformation](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-gettokeninformation) membedakan jenis struktur berdasarkan class, menerima kapasitas byte dan ReturnLength, serta memerlukan pemeriksaan last error saat gagal. [TOKEN_INFORMATION_CLASS](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_information_class) masih mendeskripsikan class21 sebagai DWORD untuk riwayat token pernah difilter.

[TOKEN_ELEVATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-token_elevation) berisi satu DWORD TokenIsElevated. [IsTokenRestricted](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-istokenrestricted) hanya memeriksa restricting-SID list; tidak dipakai sebagai pengganti class21 atau bukti sandbox. [System error codes](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-) dipakai untuk membedakan0/5/6/122. Tidak ada API referensi yang dieksekusi.

Referensi dibaca melalui browser pada tanggal laporan. Temuan dan hierarki bukti tersimpan di evidence/diagnostics/references.json.

## F. Public compatibility clarification

Pada [win32metadata discussion2308](https://github.com/microsoft/win32metadata/discussions/2308), Jevan Saks pada15 September2026 menyampaikan hasil diskusi internal: payload BOOLEAN dengan pointer DWORD-aligned. Follow-up menyetujui interpretasi first-byte dan memperkirakan konsistensi antarversi; ia menganggap ketidaksesuaian sebagai masalah dokumentasi. [Profil publiknya](https://github.com/jevansaks) mengidentifikasi peran Microsoft/Windows architect. Ini klarifikasi publik, bukan jaminan ABI formal yang sudah diuji untuk seluruh versi/arsitektur.

[Microsoft Q&A reproduction](https://learn.microsoft.com/en-us/answers/questions/6000453/gettokeninformation-tokenhasrestrictions-21-return), oleh Taki Ly, berlabel Microsoft External Staff/Moderator, melaporkan x64 build26200.9168 dengan response1 dan hanya first byte berubah. Bukti komunitas ini menguatkan adanya perbedaan kontrak; tidak membuktikan keadaan buffer AI OFFICE.

Urutan evidensi: published contract, public maintainer clarification, community reproduction, historical local receipt, source, fake simulation, engineering inference, future compatibility unverified. M2 memilih tidak mendecode payload.

## G. Class-20 versus class-21 distinction

Class20=TokenElevation menggunakan struct uint berukuran4, request4 dan successful ReturnLength tepat4. Nilai unknown, query gagal atau elevated=true tidak memenuhi guard NON_ELEVATED_CONTEXT_NOT_ESTABLISHED sebelum J0.

Class21=TokenHasRestrictions memiliki branch khusus sebelum Copy. Kapasitas tetap minimum4 dan DWORD alignment wajib, namun semua response aman0/1/2/3/4 tetap unknown. Class29 dan variable classes mempertahankan aturan panjang sebelumnya. T24 memeriksa class29 dan variable class3 short response; pengecualian1 byte tidak digeneralisasi.

## H. Root cause and internal validation

M TokenReader.Scalar memasukkan20/21/29, lalu memakai aturan umum length<4 atau scalar length!=4. Akibatnya successful length1 class21 ditolak sebelum parsing. Tidak ada native error yang membuktikan kegagalan GetTokenInformation.

M2 TokenReader.Read menempatkan branch21 setelah validasi ownership/lifetime/alignment/bounds dan completed-call receipt, tetapi sebelum Copy. NativeToken.Read dan deklarasi P/Invoke tetap sama. immediate GetLastWin32Error hanya pada native failure; error0 pada success mengabaikan stale error. Internal diagnostic tidak disamakan dengan Win32 error.

## I. Buffer alignment and capacity

TokenQuery.cs TokenHandleLease.Demand memeriksa owned/live ledger dan handle non-null/non-invalid. TokenBufferLease.Demand memeriksa owned/live pointer, kapasitas>=request, maksimum65536, serta pointer modulo4 untuk scalar. Pemeriksaan dilakukan sebelum initialization, sebelum call dan setelah call; token ledger juga dicek ulang. NativeProvider.TokenStorage memasok descriptor dari allocation/lifetime ledger aktual dan melepas buffer dalam finally.

ReturnLength tidak boleh melebihi actual capacity ATAU requested bytes. T24 mencakup capacity8/request4/return5: fatal. Exactly-one allocator callback, completed native receipt dan larangan fabricated byte result21 dijaga. Bypass/repeat/forge adapter ditolak sebelum optional acceptance. Size calculations dibatasi dan conversion memakai checked.

Ini verifikasi source/ledger dan fake faults. Tidak ada dereference pointer palsu, native allocation dalam tes, atau klaim mendeteksi seluruh kerusakan heap native yang tidak dilaporkan.

## J. Class-21 compatibility policy

| Class | Native result | ReturnLength | Disposition |
| --- | --- | --- | --- |
| 20 | success | 4 | Exact structure accepted; Value decoded from4 bytes |
| 20 | success | 0/1/2/3 | Fatal invalid structure; no J0 |
| 20 | failure | bounded | Actual error; required non-elevation unavailable, no J0 |
| 21 | success | 1 | TOKEN_HAS_RESTRICTIONS_COMPAT_RETURN1; NOT_OBSERVED |
| 21 | success | 4 | TOKEN_HAS_RESTRICTIONS_DWORD_SHAPE_NOT_DECODED; NOT_OBSERVED |
| 21 | success | 0/2/3 | OPTIONAL_METADATA_NOT_OBSERVED; no bytes read |
| 21 | failure | within request/capacity | Actual error; optional only with valid buffer/handle/resource state; error6 or error0-on-failure fatal |
| any queried class | any | exceeds request/capacity | Fatal safety invariant; no continuation |

Semua baris optional mensyaratkan valid live owned handle/buffer, aligned storage, bounded capacity, completed call dan berhasil keluar dari allocation/disposal adapter. Tidak ada1-byte decoder, fallback query atau retry. Kebijakan length4 sengaja konservatif: published shape dikenali, initialized-byte semantics/value tidak diambil.

## K. NOT_OBSERVED classification

Class21 aman menghasilkan Query.Ok=false, Status=NOT_OBSERVED, MetadataValue=NOT_OBSERVED, MetadataSeverity=OPTIONAL_UNCERTAINTY, SafetyCritical=false, DecodedBytes=0, SecurityAuthority=false. Key Value tidak ada. trace.internalValidation dan finalStatus sesuai query; nativeSuccess/error/length tetap tersimpan.

Tidak ada asumsi false, true, restricted, unrestricted, AppContainer atau worker-safe. NativeProvider.Token langsung kembali ketika Bytes=null; case21 dihapus dari switch Boolean. TokenReader tidak boleh menerima byte result21 yang dipalsukan allocator.

## L. Metadata severity model

| Severity role | Field or invariant | Policy |
| --- | --- | --- |
| REQUIRED_FOR_MEMORY_SAFETY | Ownership, initialized/live pointer, alignment, capacity/request bounds | Fatal TOKEN_SAFETY_INVARIANT jika dilanggar |
| REQUIRED_FOR_RESOURCE_SAFETY | Owned token/buffer lifetime, single use, allocation/disposition | Fatal; resource uncertainty cannot be downgraded |
| REQUIRED_FOR_CONTAINMENT | Watchdog Jc atomic admission/custody/membership | Unchanged; class21 is not enforcement input |
| REQUIRED_FOR_METADATA_COMPLETENESS | Every Query.Ok and full receipt validation | Unknown21 keeps PARTIAL; no FULL_METADATA_PASS |
| OPTIONAL_DIAGNOSTIC | Class21 safe shape/native query uncertainty | OPTIONAL_UNCERTAINTY; independent metadata may continue |

FieldPolicy/MetadataSeverity disimpan pada query; tabel menjelaskan peran safety, bukan hierarki izin runtime. ResourceSafety=PRESERVED hanya menggambarkan ledger pada jalur query aman; Finish tetap dapat melaporkan kegagalan berikutnya secara terpisah.

## M. Fail-closed safety invariants

Invalid/null/freed/unowned/misaligned pointer, invalid handle ownership, oversized/corrupted allocation metadata, return length di luar request/capacity, missing initialization, missing native receipt, callback bypass/repeat, fabricated class21 bytes, allocation/release exceptions dan error6 tetap fatal. Double-release dicegah Lifetime; first failed disposition tidak ditutupi sebagai sukses.

Engine membaca SafetyCritical sebelum field berikut/J0; fatal query menghasilkan SecurityStop=true, Failure=TOKEN_SAFETY_INVARIANT, GateM FAILED, J0attempt0. Cleanup failure yang baru diketahui setelah fake J0 juga menetapkan SecurityStop; tidak menghapus fakta J0 sudah dicoba. Fatal label menyatakan safety tidak dapat ditetapkan, bukan klaim bahwa memory corruption sudah terukur.

## N. Safe J0 continuation design

Engine.Run melanjutkan safe unknown21 setelah strict class20=false terverifikasi, lalu satu J0 metadata stage: CreateJob, flags, descriptor, members, Finish. NativeProvider.CreateJob dan Once tetap utuh: unnamed J0, NULL attributes, no assignment, max1 attempt per provider; source J0/Finish byte-identical.

Safe optional21 + successful fake J0 menghasilkan Completed=true, SecurityStop=false, GateM PARTIAL, GateS BLOCKED. Fake J0 create failure terpisah JOB_CREATION_FAILED_NO_RETRY/INCONCLUSIVE. Owner/DACL unavailable membuat completeness partial; unexpected member atau closure failure fatal. J0 tidak mewarisi peran enforcement Jc.

Tidak ada automatic retry dalam Engine/Program. F25 memakai test-only Once untuk menolak permintaan retry simulasi dan memeriksa satu Engine invocation; itu tidak membuktikan penolakan arbitrary trusted caller reentry ke public APIs. Boundary izin runtime tetap di luar class21 dan tidak diaktifkan.

## O. Watchdog/Jc preservation

| Copied reference | SHA-256 | M2 scope |
| --- | --- | --- |
| source/watchdog-reference/Lifecycle.cs | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 | BYTE_IDENTICAL / NOT BUILT / NOT RUN |
| source/watchdog-reference/NativeHost.cs | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 | BYTE_IDENTICAL / NOT BUILT / NOT RUN |
| source/watchdog-reference/PrivateContainmentJob.cs | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B | BYTE_IDENTICAL / NOT BUILT / NOT RUN |
| source/watchdog-reference/ReporterReceipt.cs | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B | BYTE_IDENTICAL / NOT BUILT / NOT RUN |
| source/watchdog-reference/WatchdogProgram.cs | 6839B473E8B93A09D9DE6AEF1E25C51B362BA7CF351D659A01B02B6070C5AB0A | BYTE_IDENTICAL / NOT BUILT / NOT RUN |

Private unnamed Jc, KILL_ON_JOB_CLOSE0x2000, fixed JOB_LIST atomic admission, original process/thread custody, verified resume, original-handle wait, no uncontained fallback dan timeout/termination authority tetap sama. Source references disalin untuk pembandingan; watchdog tidak dibangun. Hash mempertahankan source semantics, bukan pengujian OS baru.

## P. Exact disposable source diff

| File | Status | Previous SHA-256 | M2 SHA-256 |
| --- | --- | --- | --- |
| source/reporter/Model.cs | CHANGED | BC2B8571250C98ED1B0B1274528F6CB5D607C7B7C1931BBD5E01A0327C43A65F | 4C329673F5B101FF9EAB6F7CF3B583858D7115ACC6093012DB24FC356F2365B4 |
| source/reporter/NativeProvider.cs | CHANGED | 10905ED21278DAB57D5D3C0D89A0EC1757A688BBEC8AC6272536A17257461EE7 | B4809A667B49FAC36562E5BF18A3E9B87380CC782037AC631AEEAA906F1E1E4D |
| source/reporter/Program.cs | UNCHANGED | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 |
| source/reporter/TokenQuery.cs | CHANGED | A5CCD0ABA98F382FD6305EB17380F046D3BAC39AC2F05471B579A61D64A941D3 | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 |

TokenQuery.cs: class21 conservative branch, live handle/storage descriptors, scalar bounds and adapter contract, optional severity/unknown schema. NativeProvider.cs: token-specific allocation bridge and exclusion21 from Boolean parsing. Model.cs: completed partial classification when class21 unknown. Program.cs: byte-identical, including historical invocation constant and pre-native authorization guard.

Exact unified diff: evidence/audit/reporter-exact.diff. Native imports/existing Buffer prefix dan seluruh source dari Subject sampai J0/Finish dibandingkan byte-identical. Lima watchdog references utuh. source/tests/M2Tests.cs adalah targeted suite baru, bukan perubahan produksi. Frozen Main nonce bukan binding runtime baru; source/binary memerlukan review/binding baru dalam milestone terpisah sebelum peluncuran apa pun.

## Q. Historical receipt replay

A PASS: explicit synthetic owned/live/aligned capacity4, native-shaped success/error0/return1; diagnostic COMPAT_RETURN1, value unknown, zero decoded bytes, SecurityStop=false, J0 stage allowed, completeness PARTIAL.

B PASS classification-only: real E008 facts diverifikasi oleh historical-fact-verification.json; output NOT_RECORDED, alignment UNKNOWN. requested/allocated4 tetap label receipt, tidak diubah menjadi independent memory proof. Tidak ada continuation/runtime safety authority dari receipt tidak lengkap.

C PASS: synthetic misaligned storage menghasilkan fatal SecurityStop=true, fake J0blocked/GateM FAILED. T16/T17 dan F06-F08 juga mencakup invalid pointer/ownership/bounds. Semua ada dalam evidence/receipt-replay/results.json. Replay A/C bukan eksekusi API Windows.

## R. Focused unit tests

| ID | Target | Final result | Assertions |
| --- | --- | --- | --- |
| T01 | Class20 enum | PASS | All assertions satisfied |
| T02 | TOKEN_ELEVATION size4 | PASS | All assertions satisfied |
| T03 | Class20 success len4 | PASS | All assertions satisfied |
| T04 | Class20 len1 rejected | PASS | All assertions satisfied |
| T05 | Class20 len0 rejected | PASS | All assertions satisfied |
| T06 | Incorrect capacity rejected | PASS | All assertions satisfied |
| T07 | Native error preserved | PASS | All assertions satisfied |
| T08 | Successful native ignores stale error | PASS | All assertions satisfied |
| T09 | Class21 enum | PASS | All assertions satisfied |
| T10 | Length1 recognized | PASS | All assertions satisfied |
| T11 | Length1 unknown | PASS | All assertions satisfied |
| T12 | No unsupported DWORD read | PASS | All assertions satisfied |
| T13 | Trailing bytes not consumed | PASS | All assertions satisfied |
| T14 | Aligned capacity4 modeled | PASS | All assertions satisfied |
| T15 | Misalignment rejected | PASS | All assertions satisfied |
| T16 | Null invalid freed or unowned buffer rejected | PASS | All assertions satisfied |
| T17 | ReturnLength exceeds capacity rejected | PASS | All assertions satisfied |
| T18 | Length0 unknown | PASS | All assertions satisfied |
| T19 | Length2 and3 unknown | PASS | All assertions satisfied |
| T20 | Length4 specific no decode policy | PASS | All assertions satisfied |
| T21 | Class21 failure error preserved | PASS | All assertions satisfied |
| T22 | No Boolean fabricated | PASS | All assertions satisfied |
| T23 | Safe uncertainty nonfatal | PASS | All assertions satisfied |
| T24 | Fatal memory invariants | PASS | All assertions satisfied |
| T25 | Resource failures fatal | PASS | All assertions satisfied |
| T26 | Unknown no worker authority | PASS | All assertions satisfied |
| T27 | Unknown no Gate S pass | PASS | All assertions satisfied |
| T28 | Safe uncertainty permits J0 | PASS | All assertions satisfied |
| T29 | Fatal blocks J0 including elevation | PASS | All assertions satisfied |
| T30 | Completeness PARTIAL | PASS | All assertions satisfied |
| T31 | J0 outcome independent and single attempt | PASS | All assertions satisfied |
| T32 | No automatic reporter retry | PASS | All assertions satisfied |
| T33 | Private Jc owner unchanged | PASS | All assertions satisfied |
| T34 | Kill on close unchanged | PASS | All assertions satisfied |
| T35 | Atomic admission unchanged | PASS | All assertions satisfied |
| T36 | Original handle custody unchanged | PASS | All assertions satisfied |
| T37 | No uncontained fallback | PASS | All assertions satisfied |
| T38 | No PID-only kill | PASS | All assertions satisfied |
| T39 | No process name kill | PASS | All assertions satisfied |
| T40 | No worker launch pathway | PASS | All assertions satisfied |

Final40 PASS,0 FAIL,0 SKIP,0 TIMEOUT. Txx adalah identifier aktual suite M2; label M2-Txx pada mapping supersession menunjuk Txx yang sama. Tidak ada suite135/48 historis dijalankan ulang atau ditambahkan ke count.

Initial: T03/T35 FAIL,38 PASS; faults F15 FAIL,24 PASS. initial-results.json dan initial-summary.json, initial source/DLL serta compiler logs tetap ada. Cycle1 memperbaiki fake class20 yang menulis tailAA sehingga dianggap elevated, serta assertion atomic yang mencari helper di file salah; assertion tetap memeriksa byte equality dan helper/caller aktual. Ditambahkan guard variable class3.

Cycle1 hasil40/25/3 PASS disimpan sebagai repair1-*. Cycle2 menutup request-bound dan allocator-completion findings, menambah assertions di T24; seluruh40/25/3 final PASS. Tidak ada cycle3. Host reflection pertama gagal PSObject-to-String sebelum Runner entry; diagnostic terpisah, diperbaiki cast tanpa native/test execution pada upaya gagal itu.

## S. Fault-injection results

| ID | Initial | Injection | Expected | Actual | Buffer safety | Resource safety | SecurityStop | J0 stage entered | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | SYNTHETIC_OWNED_METADATA_SESSION | class21 success len1 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F02 | SYNTHETIC_OWNED_METADATA_SESSION | class21 success len4 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F03 | SYNTHETIC_OWNED_METADATA_SESSION | class21 success len0 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F04 | SYNTHETIC_OWNED_METADATA_SESSION | class21 success len2 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F05 | SYNTHETIC_OWNED_METADATA_SESSION | class21 success len3 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F06 | SYNTHETIC_OWNED_METADATA_SESSION | return length exceeds capacity | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F07 | SYNTHETIC_OWNED_METADATA_SESSION | invalid pointer | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F08 | SYNTHETIC_OWNED_METADATA_SESSION | misaligned pointer | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F09 | SYNTHETIC_OWNED_METADATA_SESSION | AccessDenied | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F10 | SYNTHETIC_OWNED_METADATA_SESSION | unexpected native failure error87 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F11 | SYNTHETIC_OWNED_METADATA_SESSION | stale error5 after success | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F12 | SYNTHETIC_OWNED_METADATA_SESSION | invalid token ownership | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F13 | SYNTHETIC_OWNED_METADATA_SESSION | allocation failure | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F14 | SYNTHETIC_OWNED_METADATA_SESSION | release failure | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F15 | SYNTHETIC_OWNED_METADATA_SESSION | valid class20 len4 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F16 | SYNTHETIC_OWNED_METADATA_SESSION | invalid class20 len1 | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F17 | SYNTHETIC_OWNED_METADATA_SESSION | safe optional then J0 | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F18 | SYNTHETIC_OWNED_METADATA_SESSION | fatal class21 then no J0 | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |
| F19 | SYNTHETIC_OWNED_METADATA_SESSION | J0 create failure | SecurityStop=False;J0=1;GateM=INCONCLUSIVE | SecurityStop=False;J0=1;GateM=INCONCLUSIVE | PRESERVED | PRESERVED | False | True | PASS |
| F20 | SYNTHETIC_OWNED_METADATA_SESSION | J0 DACL metadata failure | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F21 | SAFE_OPTIONAL_THEN_FAKE_J0 | unexpected member | SecurityStop;J0attempt1;FAILED | UNEXPECTED_JOB_MEMBER | PRESERVED | PRESERVED | True | True | PASS |
| F22 | SAFE_OPTIONAL_THEN_FAKE_J0 | J0 close failure | SecurityStop;J0attempt1;FAILED | CLEANUP_FAILURE | PRESERVED | NOT_ESTABLISHED | True | True | PASS |
| F23 | SYNTHETIC_OWNED_METADATA_SESSION | attempt unknown token authorization | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F24 | SYNTHETIC_OWNED_METADATA_SESSION | attempt partial to full promotion | SecurityStop=False;J0=1;GateM=PARTIAL | SecurityStop=False;J0=1;GateM=PARTIAL | PRESERVED | PRESERVED | False | True | PASS |
| F25 | SYNTHETIC_OWNED_METADATA_SESSION | attempt retry after fatal; test-only one-shot controller | SecurityStop=True;J0=0;GateM=FAILED | SecurityStop=True;J0=0;GateM=FAILED | NOT_ESTABLISHED | NOT_ESTABLISHED | True | False | PASS |

25 PASS,0 FAIL/SKIP/TIMEOUT. Initial/expected/actual/safety/disposition lengkap ada pada evidence/fault-injection/results.json. PRESERVED/NOT_ESTABLISHED adalah status fixture/ledger, bukan observasi OS. Pada F21/F22 J0 stage sudah dimasuki sebelum member/close failure; SecurityStop tetap true. F23/F24 menguji bahwa authorization/completeness escalation yang diminta tidak muncul pada output aktual; tidak ada worker authorizer yang diaktifkan. F25 one-shot controller hanya test-only; tidak ada native retry.

## T. Superseded regression reconciliation

R6W-T33 tetap SUPERSEDED. Tujuan awalnya melarang seluruh native Job Object capability pada watchdog sebelum private Jc diotorisasi. Setelah JC mengizinkan private containment job, blanket absence tidak lagi merepresentasikan invariant yang benar.

Historical replacement: JC-T01/T06/T11/T16 dan M-T37..T46. M2 replacement: T33 private ownership, T34 kill flags, T35 atomic JOB_LIST, T36 custody, T37 no fallback, T38/T39 no unscoped termination, T40 no worker launch; lima hashes dan IL allowlist mendukung cakupan. Invariant: tidak ada unowned/unscoped/uncontained control. Patch21 tidak mengubah source control tersebut. Old suites tidak rerun; tidak ada klaim fresh native verification.

## U. Build and hashes

| Artifact | Bytes | SHA-256 |
| --- | --- | --- |
| source/reporter/Model.cs | 8780 | 4C329673F5B101FF9EAB6F7CF3B583858D7115ACC6093012DB24FC356F2365B4 |
| source/reporter/NativeProvider.cs | 11747 | B4809A667B49FAC36562E5BF18A3E9B87380CC782037AC631AEEAA906F1E1E4D |
| source/reporter/Program.cs | 3849 | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 |
| source/reporter/TokenQuery.cs | 8951 | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 |
| build/reporter/R6MetadataReporter.exe | 44544 | F668C723C4B5FFC7E77871219CC2E94121B08C85BF770AE5C5B3E2B04F400C39 |
| build/tests/JC.Tests.dll | 50688 | 720F7E7EAC7DC363D94C8CD9AD75462C5530D2AF70578B85E52AC70B66DC6145 |
| source/tests/M2Tests.cs | 19620 | 11336A436B671239E83F522F924BF819A6821045EF815F31BCD171F83F796BAD |

Compiler: existing Microsoft .NET Framework64 csc14.8.10001.0, signature Valid; SHA256 ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3. x64 optimize+, warn4/warnaserror+. Reporter2 builds, test3 builds, five exit0, zero warnings. Watchdog0 builds. Final source manifest di build/reporter/source-manifest.json; provenance di evidence/audit/build-provenance.json. EXE hanya dikompilasi dan dimuat sebagai assembly untuk resolve managed test references; Main tidak dipanggil. Final manifest mencatat seluruh source/binary/intermediate/evidence/report hashes dan tidak menyertakan hash dirinya.

## V. Source/IL audit

Reporter12 P/Invoke declarations tetap identik: GetCurrentProcess, GetCurrentProcessId, OpenProcess, OpenProcessToken, GetTokenInformation, GetKernelObjectSecurity, CreateJobObjectW, QueryInformationJobObject, GetHandleInformation, GetProcessTimes, CloseHandle, LookupPrivilegeNameW. Reporter765 own-method IL references diaudit; test1042 references,0 imports. Tidak ada test call ke Native, NativeProvider, TokenNative atau Marshal Read/Write/Alloc/Free/Copy. Tes memakai managed byte arrays dan pointer angka sebagai model; tidak didereference.

Tidak ada tambahan AssignProcessToJobObject/TerminateJobObject/DuplicateHandle/security setters/token setters/privilege changes/CreateProcess/TerminateProcess/network/shell/reflection-dispatch/calli. Semua own methods/constructors dan import diaudit; framework tidak disassemble menyeluruh. IL call inventory disertai branch review source untuk memastikan class21 return sebelum Copy.

Dataflow: TokenReader -> NativeProvider.Token -> Engine completeness -> Program exit -> ReporterReceipt.Validate. Diagnostic21 tidak dipakai untuk process admission, worker privileges, runtime authorization atau sandbox acceptance. AI-Office/src tidak memiliki class21 consumer. Watchdog receipt mensyaratkan semua Query.Ok dan GateM PASS; partial21 tidak dapat menjadi MetadataPass. GateS tetap BLOCKED.

## W. Internal adversarial review

| ID | Question | Result | Evidence / scope |
| --- | --- | --- | --- |
| R01 | Was the actual class-21 failure correctly identified? | PASS | checkpoint/reporter-result E008 + token-native-calls; success/error0/len1 distinct from internal reject |
| R02 | Does the repair remain class-specific? | PASS | TokenQuery.Read class21 branch before Copy; no exception for20/29/variable classes |
| R03 | Is class-20 strictness preserved? | PASS | TokenElevation layout size4; exact len4; T01-T08/T24/T29 |
| R04 | Is the published DWORD contract distinguished from observed one-byte behavior? | PASS | Official enum DWORD versus historical ReturnLength1 explicitly separated in references/report |
| R05 | Is the maintainer clarification represented accurately? | PASS | Jevan Saks Sep15 original and follow-up reviewed; public clarification, not universal ABI guarantee |
| R06 | Does the code avoid reading unsupported bytes? | PASS | Class21 returns before Copy; T12/T13/T20/T22, zero read counters; no byte decoder |
| R07 | Is buffer alignment addressed? | PASS | TokenBufferLease.Demand pointer DWORD alignment pre/post native; T14-T16 |
| R08 | Is capacity validated? | PASS | Capacity/request/Parse.Max bounds checked; T06/T17/T24 including capacity8/request4/length5 |
| R09 | Is ReturnLength validated without generalized weakening? | PASS | Short compatibility branch exclusively21; T04/T05/T24 for20/29/variable3 |
| R10 | Are native and internal errors separated? | PASS | TokenNative immediate last-error-on-failure, nativeSuccess/error separate internalValidation; T07/T08/T21 |
| R11 | Are fatal safety failures still fatal? | PASS | Critical exceptions and overflow/invalid metadata before optional branch; T24/T25/T29; F06-F08/F12-F14/F18 |
| R12 | Are optional failures genuinely independent of J0 safety? | PASS | Engine class20 false required; Jc enforcement unchanged; token buffer disposed before returning to Engine |
| R13 | Is the class-21 value marked unknown where not interpreted? | PASS | No Value member21; MetadataValue NOT_OBSERVED; T11/T18-T22; replayB lacks historical bytes |
| R14 | Can unknown token metadata grant authorization? | PASS | SecurityAuthority=false, no production consumer, GateS BLOCKED; T26/T27/F23 |
| R15 | Can optional uncertainty incorrectly produce FULL_METADATA_PASS? | PASS | Ok=false and completed partial rule; unchanged receipt requires all Ok/GateM PASS; T30/F24 |
| R16 | Can genuine memory corruption be downgraded? | PASS | Reported invalid liveness/bounds cannot reach optional branch; T24. Arbitrary undetected native heap corruption not proved absent |
| R17 | Can invalid resource ownership be downgraded? | PASS | TokenHandleLease ledger rechecked; owned/live buffer; T16/T25/F12; not proof against external kernel interference |
| R18 | Are all allocations released in tested paths? | PASS | Fake successful allocations have one finally disposition; failure remains fatal; T25/F13/F14. Actual Windows cleanup NOT RUN |
| R19 | Can a second J0 be created unexpectedly? | PASS | NativeProvider.CreateJob Once unchanged; fake T31 denies second attempt. Per-provider/trusted caller scope, no worker authority |
| R20 | Can a reporter launch occur in this static milestone? | PASS | No Main invoke; runtime dir absent; test IL no Native/NativeProvider calls; T40; zero-runtime.json |
| R21 | Can a watchdog launch occur? | PASS | No watchdog binary built/invoked; only5 source references copied; zero-runtime.json |
| R22 | Are watchdog/Jc control files unchanged? | PASS | Five exact byte-identical hashes in source-diff.json; originals in protected snapshot |
| R23 | Is atomic admission preserved? | PASS | NativeHost.Create + PrivateContainmentJob.PrepareAttributes unchanged; T35 hashes plus source call chain |
| R24 | Is original process-handle custody preserved? | PASS | NativeHost original process/thread fields and lifecycle unchanged; T36/hash checks |
| R25 | Is no-uncontained-fallback preserved? | PASS | No postlaunch assignment API or fallback introduced; T37; IL allowlist unchanged |
| R26 | Are fake-provider observations labeled correctly? | PASS | All new test/fault/replay evidence explicitly FAKE_PROVIDER or SOURCE_STATIC; no new OS labels used as result claims |
| R27 | Are historical runtime claims kept historical? | PASS | Historical invocation/reporter15336/WD12932/Jc preserved; old receipt label discrepancy retained; no new PID control |
| R28 | Is the superseded safety regression adequately covered? | PASS | R6W-T33 superseded purpose recorded; M2-T33..T40/source hashes replace blanket job API ban |
| R29 | Are production files unchanged? | PASS | Pre-report 457 file hashes and git state, SQLite included; final check must allow only2 reports |
| R30 | Does the report refrain from claiming a new OS result? | PASS | GateP/J static only, GateS BLOCKED, zero native invocation counts; final manifest/hash review required |

INTERNAL_ADVERSARIAL_REVIEW: SAFETY_REVIEW_PASS,30/30 PASS. Same-agent separate second pass; bukan independent human review. Findings request-bound dan adapter contract diperbaiki cycle2 dan direview ulang. Batas test-only retry controller, global-corruption detection dan literal network wording dicatat terbuka. Review ini tidak memberikan runtime authority.

## X. Gate P/J/S

Gate P: STATIC PASS. Class-specific unknown21, exact20, no unsupported read, bounded ownership/resource validation dan targeted cases lulus.

Gate J: STATIC/DESIGN PASS. Safe optional uncertainty dapat menuju satu independent fake J0 stage; fatal query tidak. Metadata tetap partial dan failure J0 terpisah. Tidak ada native J0.

Gate S: BLOCKED. Semua tuntutan worker security di luar bukti ini tetap belum terverifikasi. Matriks72 gate memisahkan SOURCE_VERIFIED, STATIC_TEST_VERIFIED, DOCUMENTED, DESIGN_SPECIFIED, HISTORICAL_ONLY, NOT RUN, NOT VERIFIED dan BLOCKED. PASS pada pemeriksaan dokumentasi berarti dokumentasi cocok, bukan keberhasilan enforcement OS.

## Y. Actual runtime invocation count: zero

Reporter0; watchdog0; native Jc0; native J0=0; target process0; targeted termination0; live control-handle duplication0; deliberate crash0; runtime retry0; real worker0; MXC0; app-server0; inference0; provider authentication0; paid API0. Tidak ada authorization/permit/claim runtime baru dan tidak ada evidence/runtime directory.

Eksekusi yang dilakukan: PowerShell audit/file hash, compiler lokal, managed Runner.Run pada test DLL via reflection. Tidak ada reporter Main/watchdog Main, native metadata atau process-control experiment.

Browser membaca public documentation/discussion/Q&A sesuai instruksi eksplisit. Karena itu klaim literal "no network use" tidak dibuat; tidak ada probe network, komunikasi provider, upload source, credential access atau API berbayar.

## Z. Source/system integrity

Pre-report dan final audit:457 existing AI-Office file hashes sama; final459 =457+dua laporan ini. Git134 entries tetap, final136. Scope AI-Office mengecualikan .git/node_modules, mencakup production source, SQLite, historical reports. Tidak ada production edit atau DB command.

Protected10 roots/512 files identik terhadap baseline, termasuk seluruh63 file M checkpoint dan active Codex50 files (nested node_modules termasuk). Source R3 guard dan absence operational authorization/build gate tetap sama; missing candidate tidak dipulihkan. Hermes647 tracked hashes dan tracked path set cocok; untracked/ignored Hermes di luar scope.

Root disposable <TEMP>/ai-office-m0202s16br6wjcm2-abbcec9e-c88b-4d36-96b1-16c040bea4f2; final 74 files termasuk inventory/manifest.json, 73 manifest entries (self excluded). FinalAuditM2 memverifikasi jumlah dan setiap hash setelah manifest; tidak ada penulisan sesudah sealing. Evidence baseline, intermediate builds/failed tests, final results, references, exact diff, IL, review dan reports semuanya diinventarisasi.

No dependency installation, elevation, Windows SD/token/privilege/config mutation, credential read, candidate restoration, historical PID control atau later milestone. Bukti system-integrity bersifat scoped hash/command audit, bukan whole-system ACL/heap/process census. 2209 missing historical files/17 roots hanya historical unavailable record, bukan files verified. User changes dipertahankan.

## AA. Remaining security blockers

Actual J0 owner/DACL/flags/member/resource observation belum ada. Watchdog-crash cleanup, hostile same-user/external handles, real process-tree cleanup dan worker token enforcement belum diuji. Physical output fencing, credential custody, subscription entitlement dan included-only billing belum terverifikasi. Actual MXC compatibility BLOCKED karena MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; candidate tidak direstore/disubstitusi.

PID23376 dan PID23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED. Historical reporter/watchdog PIDs hanya receipt references, tidak menjadi query/termination target. Source-hash equality mempertahankan desain, bukan bukti empiris ancaman hostile yang belum diuji.

## AB. Final classification

M02-02S16B-R6W-JC-M2 STATIC_COMPATIBILITY_PASS — CLASS-21 OPTIONAL METADATA POLICY VERIFIED STATICALLY — J0 RUNTIME NOT TESTED — REAL WORKER BLOCKED.

Scope penerimaan: source/parser/fake-provider policy dan desain continuation. Full metadata completeness dan real-worker security tetap tidak dinyatakan PASS.

## AC. One recommended next action

M02-02S16B-R6W-JC-M3 - J0 Metadata Completion Verification, hanya setelah otorisasi terpisah: satu reviewed watchdog, satu private Jc, satu fixed/hash-bound reporter, at most satu J0; no crash, no retry, no worker. Harus menjaga original-handle custody, atomic membership before resume, controlled release, independent exit observation, actual J0 owner/DACL/handle/member observations, dan optional unknown21 tetap partial. Future launch memerlukan fresh reviewed binding/authorization, bukan reuse historical nonce/permit.

M3 tidak dimulai. Tidak ada keputusan Owner yang diperlukan untuk menyelesaikan M2 statis; otorisasi baru hanya diperlukan bila Owner hendak melaksanakan satu tindakan runtime terbatas tersebut.

