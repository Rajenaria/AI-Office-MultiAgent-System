# M02-02S16B-R6W-JC-M3 J0 Metadata Completion Report

Tanggal2026-11-07 Asia/Jakarta. Checkpoint-aware continuation M2. Scope: one bounded normal Windows experiment, no crash/retry/worker.

## A. Executive decision

**J0_OS_PASS_WITH_TOKEN_PARTIAL.** Gate C PASS; Gate L PASS; Gate J0 PASS; Gate T PARTIAL; Gate S BLOCKED.

Satu watchdog, satu Jc, satu reporter, satu J0. J0 owner/DACL query status0, raw flags0, membership0/0, buffer dan handle released. Class20 native success4,false; class21 native success1 tetap NOT_OBSERVED tanpa decoder. Reporter dan watchdog keluar dengan exit30, konsisten metadata partial. Independent original-handle exit observation berhasil.

45 focused tests PASS,25 fake faults PASS,30/30 internal review PASS;0 final FAIL/SKIP/TIMEOUT. Satu focused static repair sebelum runtime. Tidak ada reporter/watchdog source atau executable repair setelah runtime. Crash/hostile-handle/process-tree/worker-security acceptance tidak dinyatakan PASS.

## B. M2 checkpoint

M2 STATIC_COMPATIBILITY_PASS diverifikasi melalui73 manifest entries dan kedua repository-report hashes. M2 root74 files, manifest SHA2568459B42341882A4FC360835D5D36C8CFB9D9982A9088D7599AD26CFFA28A4BC9. Reporter F668C723C4B5FFC7E77871219CC2E94121B08C85BF770AE5C5B3E2B04F400C39; test DLL720F7E7EAC7DC363D94C8CD9AD75462C5530D2AF70578B85E52AC70B66DC6145. Semua tersedia, hash cocok, tidak dieksekusi.

M2 class20/class21 source dibaca; TokenQuery.cs byte-identical dalam M3. M2 report dan full72-gate matrix, historical JC containment serta M runtime report dibaca. Historical M tetap SECURITY_STOP, J0=0. M2 static40/25/replay3/review30 tidak dihitung ulang sebagai hasil M3. Historical2209 files/17 roots tidak tersedia menurut M record; tidak direkonstruksi atau diklaim terverifikasi.

## C. Authorization boundary

Owner mengotorisasi conditional one-shot M3 setelah mandatory gates PASS: fresh source/root, binding, static/fake tests, review, preflight, satu normal watchdog/Jc/reporter dan maksimal satu J0. Tidak ada penggunaan budget lama. Otorisasi aktual disimpan secara eksklusif pada preflight/runtime-decision.json dan runtime authorization files dengan source/binary/nonce binding.

Dilarang dan tidak dilakukan: production/SQLite/ProjectState/S12-S15/R3 edits; ACL/SD/token/privilege/registry/Defender/firewall/UAC mutation; elevation/dependencies; arbitrary target; PID/name-wide kill; live duplication; MXC/app-server/worker/inference/provider authentication/paidAPI; crash/hang/retry; later milestone. Jc limit configuration0x2000 hanya untuk freshly owned object sesuai otorisasi. Public-reference browsing dilakukan sebagaimana diminta, bukan traffic eksperimen/provider.

## D. Reporter source and binary provenance

| M3 source | Change | M2 SHA-256 | M3 SHA-256 |
| --- | --- | --- | --- |
| source/reporter/JobSecurity.cs | NEW |  | F79C5855EE2C942905E39A631DDF1EC6EC7A8AA99009F34F981E7EB7C5A2F8E2 |
| source/reporter/Model.cs | CHANGED | 4C329673F5B101FF9EAB6F7CF3B583858D7115ACC6093012DB24FC356F2365B4 | F553F9870403D57848BABEF5E5CF112996D254867F644715C131A4095994CF6A |
| source/reporter/NativeProvider.cs | CHANGED | B4809A667B49FAC36562E5BF18A3E9B87380CC782037AC631AEEAA906F1E1E4D | 899F49663C6854752CE4E04C3EDF61A64CAA8C9855D4CB07C36AE01C60CC8AC5 |
| source/reporter/Program.cs | CHANGED | F852724E4691B3375374C0ABCD9E17D4F77041CE00F4B4276E1A2C75DD672619 | 4D0A71581A43CFA10AC5290A9BD92F1374CDECB0E27E34ECF69640B076928797 |
| source/reporter/TokenQuery.cs | UNCHANGED | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 |

TokenQuery.cs tetap M2. NativeProvider.cs menambah read-only J0 security query bridge dan raw flag/member diagnostic fields. JobSecurity.cs baru menyediakan status-code query dan allocator-specific release. Model.cs menambah narrow fatal guard untuk descriptor safety. Program.cs hanya fresh invocation dan source-manifest list. SourceManifestSHA256 6DB0D0165E547E7C77D4937F11F088B29B2127916ABBE83FFC898D6C1117F305. Final reporter 6F194E67053DA5F7C3C4FADC0CC40745DB6C2A78E36F5AB7C7F6FC6FEA075572. Binary dibangun dari actual source tersebut, dipakai pada satu runtime, dan hash dicek ulang setelah exit.

## E. Watchdog rebinding

Invocation 93a544d8-8f10-4501-9cc4-d74cc1822b0b; Generation 260e8f6b-e22c-48a0-bd09-89a3758e6b86. Fixed path tetap build/reporter/R6MetadataReporter.exe di root baru. Fresh reporter hash 6F194E67053DA5F7C3C4FADC0CC40745DB6C2A78E36F5AB7C7F6FC6FEA075572 di exclusive permit diverifikasi WatchdogProgram sebelum Controller; NativeHost.Prepare membuka image FileShare.Read dan menghitung ulang hash locked image.

Watchdog hash 10CF97D4D8E72FB046C9361547A22CB026DCE231CB5AB8E5C0326A2339E76D62. Nonce/source/manifest/binary bindings reporter terpisah tetap wajib. Tidak ada arguments atau substitute executable. Obsolete hash, unknown path, stale receipt/generation dan locked-image replacement diuji melalui fake/static path. runtime/watchdog-claim dan outer claim dibuat eksklusif satu kali.

## F. Exact watchdog diff

INVOCATION_IDENTITY: hanya Invocation/Generation constants diganti fresh GUID.

BUILD_COMPATIBILITY: JobSecurity.cs ditambahkan ke reporter source-gate filename list. REPORTER_PATH_BINDING: root-relative fixed path tidak berubah; root M3 baru menentukan lokasi aktual. REPORTER_HASH_BINDING: final SHA256 baru masuk permit, bukan perubahan controller.

Lifecycle.cs, NativeHost.cs, PrivateContainmentJob.cs, ReporterReceipt.cs byte-identical terhadap M2 references. WatchdogProgram.cs sama persis setelah normalisasi dua GUID dan tambahan filename tersebut. Exact old/new hashes dan unified diff ada pada binding/source-diff.json serta binding/exact-source.diff. Tidak ada perubahan timeout, authority, admission, membership, resume, exit atau failure disposition.

## G. Jc preservation

Jc private unnamed dibuat watchdog. Flags KILL_ON_JOB_CLOSE0x2000 dikonfigurasi dan dibaca balik sebelum process creation. Fixed JOB_LIST digunakan pada STARTUPINFOEXW, backing storage hidup selama CreateProcessW; reporter dibuat suspended. Identity dan exact membership wajib sebelum resume. Original process/thread custody, finite waits, original-handle stop dan no-fallback tetap utuh.

Tidak ada breakaway, intentional duplication/export atau inheritance. Emergency HOLD saat scope kontradiktif tetap dipertahankan, bukan klaim seluruh failure selalu selesai dalam bounded OS time. Last-global-handle exclusivity dan actual crash cleanup belum terbukti. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) dan [UpdateProcThreadAttribute](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute) adalah documented expectations yang dibedakan dari receipt normal-run.

## H. TokenElevation validation

TokenQuery M2 tetap exact class20, sizeof(TokenElevation)=4, requested4, successful return4; error hanya dibaca saat native failure. Unknown/invalid/elevated tetap menghalangi J0. T09-T11/F05/F06 menjaga guard tersebut.

Current E006: nativeSuccess=true, win32Error0, allocated/requested4, return4, Value=false. Current integrity E005 MEDIUM. Ini reporter self token, bukan worker/MXC token. Struktur published [TOKEN_ELEVATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-token_elevation) dan [GetTokenInformation](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-gettokeninformation) tidak dilonggarkan.

## I. Class-21 compatibility handling

E008 nativeSuccess=true/error0, allocated/requested4, ReturnLength1. Diagnostic TOKEN_HAS_RESTRICTIONS_COMPAT_RETURN1, Status/MetadataValue NOT_OBSERVED, MetadataSeverity OPTIONAL_UNCERTAINTY, SafetyCriticalfalse, DecodedBytes0, SecurityAuthorityfalse; Value Boolean tidak ada.

Published [TOKEN_INFORMATION_CLASS](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_information_class) masih DWORD; [public maintainer clarification](https://github.com/microsoft/win32metadata/discussions/2308) mengenai BOOLEAN dengan DWORD alignment bukan universal compatibility guarantee. M3 memakai branch konservatif M2 tanpa decode.

Numeric pointer/alignment tidak dipersist; runtime receipt menyatakan safety ledger preserved setelah source Demand checks. Ini bukan independent raw-address/alignment measurement atau jaminan tidak adanya semua jenis native heap corruption.

## J. Optional metadata classification

Safe class21 unknown tidak menghentikan independent J0 collection. Engine Completedtrue, SecurityStopfalse, Failure=null, JobAttempts1 dan GateM PARTIAL. Tidak ada FULL_METADATA_PASS atau worker authorization.

Fatal token bounds/liveness/ownership/allocation/release tetap fatal. J0 descriptor safety yang malformed/invalid-handle/release-failed juga fatal, dipropagasikan Model guard. Query metadata gagal secara aman seperti AccessDenied tetap tercatat partial, bukan dibuat sukses. Native status/error tidak disamakan dengan internal validation.

Unchanged watchdog mensyaratkan full query completeness dan exit0 sehingga Raw GateM INCONCLUSIVE / LIFECYCLE_PASS_METADATA_PARTIAL tetap benar. Auditor M3 mengevaluasi J0 dan release secara terpisah; tidak mengubah raw receipt atau watchdog semantics.

## K. Jc/J0 topology

Outer audit runner memegang original Process object watchdog. Watchdog memegang private Jc dan original reporter process/thread handles. Reporter anggota Jc, tetapi tidak diberi control handle Jc. Reporter sendiri membuat J0 terpisah untuk metadata; J0 tidak diberi intended members, kill limits atau workload.

J0 tidak dianggap nested containment hanya karena pembuatnya anggota Jc. Jc membership dan J0 membership dikumpulkan terpisah. Tidak ada AssignProcessToJobObject pada reporter atau create-then-assign fallback watchdog.

## L. J0 creation logic

NativeProvider.CreateJob memakai Once.Demand lalu CreateJobObjectW(NULL,NULL), satu attempt saja. NULL name/attributes tercatat pada construction source dan E011; successful fresh handle disimpan sebagai J0 Lifetime. Tidak ada fallback atau create kedua.

E011 Oktrue,Error0,UnnamedByConstructiontrue,SecurityAttributesNULL,IntentionallyAssignedProcesses0. Unnamed status didasarkan pada fixed successful API arguments, bukan object-namespace enumeration. JOB_OBJECT_ALL_ACCESS adalah [documented return rights](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-createjobobjectw), bukan granted-mask measurement.

## M. J0 owner/DACL query

JobSecurityApi.Get memakai GetSecurityInfo(original live owned J0,SE_KERNEL_OBJECT6,OWNER_SECURITY_INFORMATION|DACL_SECURITY_INFORMATION5). Semua optional owner/group/DACL/SACL pointer outputs dibuat NULL; returned SD membawa requested owner/DACL. Tidak ada SACL request atau privileges.

GetSecurityInfo bertipe DWORD status, bukan Boolean. Status0 wajib sebelum pointer dipercaya sebagai API-owned allocation. GetSecurityDescriptorLength hanya pada successful returned descriptor; bound20..65536, bounded copy dan Parse.Descriptor self-relative validation sebelum sanitized output. Failed call dengan unexpected pointer/invalid owned handle fatal. [GetSecurityInfo](https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo), [length contract](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-getsecuritydescriptorlength), [LocalFree](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-localfree) ditinjau.

Current E013: NativeStatus0,Error0,140 descriptor bytes, owner REDACTED_PRINCIPAL, DACL Presenttrue/NullDaclfalse,3 ACE. ControlFlags DiscretionaryAclPresent,SelfRelative. Group NO_SID karena tidak diminta. Seluruh identitas pribadi di-redact; ACE bukan effective-access verdict.

## N. J0 handle flags

Current E012 GetHandleInformation Oktrue,Error0,RawFlags0,Inheritfalse,ProtectFromClosefalse. GrantedMask tetap GRANTED_ACCESS_MASK_NOT_OBSERVED.

[GetHandleInformation](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-gethandleinformation) mengungkap flags tertentu, bukan complete access mask. Tidak ada perubahan flags/security descriptor untuk memaksa hasil.

## O. J0 membership

Current E014 QueryInformationJobObject class3 JobObjectBasicProcessIdList sukses/error0. BufferCapacity4096,ReturnLength8,PointerSize8. NumberOfAssignedProcesses0,NumberOfProcessIdsInList0,UnexpectedMemberfalse.

Parser memvalidasi minimum8 bytes, counts dan pointer-width list bounds. Zero adalah hasil query aktual, bukan asumsi job baru. CleanupProoffalse sengaja memisahkan membership dari termination proof. [QueryInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-queryinformationjobobject) dijadikan documented contract. Unexpected member akan SecurityStop tanpa assignment atau targeted member termination.

## P. J0 buffer/handle cleanup

GetSecurityInfo buffer ditambahkan ke global reporter resource ledger sebagai LOCAL_ALLOC J0-SD. Dependents dijaga selama length/copy/parse; finally memanggil LocalFree tepat sekali untuk acquired output. LocalFree failure native error diperiksa dan menjadi fatal, bukan retry atau double free.

E013 LocalFreeReleasedtrue, DescriptorResource acquired/releaseAttempted/releasedtrue,dependents0,error0. E015 juga menunjukkan J0 handle releasedtrue/error0. Self-process/token/member caller-allocated buffers memakai FreeHGlobal; allocator tidak dicampur. Descriptor output tidak dibaca setelah release. Hanya allocation dari successful GetSecurityInfo yang dilepas; contradictory failed-call pointer tidak dibebaskan sembarang.

## Q. Static test results

| ID | Target | Result | Evidence |
| --- | --- | --- | --- |
| T01 | Revised reporter hash accepted | PASS | Assertions satisfied |
| T02 | Obsolete reporter hash rejected | PASS | Assertions satisfied |
| T03 | Unknown executable rejected | PASS | Assertions satisfied |
| T04 | Fixed executable path preserved | PASS | Assertions satisfied |
| T05 | Hash mismatch prevents launch | PASS | Assertions satisfied |
| T06 | Fresh invocation and generation | PASS | Assertions satisfied |
| T07 | Stale receipt rejected | PASS | Assertions satisfied |
| T08 | Image replacement lock and rehash | PASS | Assertions satisfied |
| T09 | Class20 exact4 | PASS | Assertions satisfied |
| T10 | Class20 invalid lengths | PASS | Assertions satisfied |
| T11 | Class20 unknown and elevated block J0 | PASS | Assertions satisfied |
| T12 | Class21 len1 recognized | PASS | Assertions satisfied |
| T13 | Class21 unknown only | PASS | Assertions satisfied |
| T14 | No class21 read | PASS | Assertions satisfied |
| T15 | Safe optional uncertainty continues | PASS | Assertions satisfied |
| T16 | Fatal query blocks J0 | PASS | Assertions satisfied |
| T17 | Ownership enforced | PASS | Assertions satisfied |
| T18 | Native/internal errors separate | PASS | Assertions satisfied |
| T19 | One J0 maximum | PASS | Assertions satisfied |
| T20 | J0 unnamed | PASS | Assertions satisfied |
| T21 | J0 reviewed attributes | PASS | Assertions satisfied |
| T22 | J0 empty via bounded member parser | PASS | Assertions satisfied |
| T23 | J0 owner query | PASS | Assertions satisfied |
| T24 | J0 DACL query and LocalFree | PASS | Assertions satisfied |
| T25 | DACL failure preserved | PASS | Assertions satisfied |
| T26 | Handle flags parser | PASS | Assertions satisfied |
| T27 | Unexpected J0 member fatal | PASS | Assertions satisfied |
| T28 | J0 close accounting | PASS | Assertions satisfied |
| T29 | No reporter assignment API | PASS | Assertions satisfied |
| T30 | No reporter termination configuration | PASS | Assertions satisfied |
| T31 | Private Jc unchanged | PASS | Assertions satisfied |
| T32 | Kill on close before create | PASS | Assertions satisfied |
| T33 | Atomic admission | PASS | Assertions satisfied |
| T34 | No fallback | PASS | Assertions satisfied |
| T35 | Suspended until identity | PASS | Assertions satisfied |
| T36 | Membership before resume | PASS | Assertions satisfied |
| T37 | Original process retained | PASS | Assertions satisfied |
| T38 | Original thread accounted | PASS | Assertions satisfied |
| T39 | No Jc inheritance | PASS | Assertions satisfied |
| T40 | No intentional duplication | PASS | Assertions satisfied |
| T41 | Timeout not exit; original termination | PASS | Assertions satisfied |
| T42 | Wait failure cannot become pass | PASS | Assertions satisfied |
| T43 | No PID-only termination | PASS | Assertions satisfied |
| T44 | No process-name kill | PASS | Assertions satisfied |
| T45 | No second runtime launch | PASS | Assertions satisfied |

Final45 PASS,0 FAIL/SKIP/TIMEOUT. Field RepairCycles pada raw summary-initial.json adalah constant harness0, bukan repair ledger; build-provenance.json mencatat actual1 repair. Raw outputs tidak diubah. Initial45/25 juga PASS dan evidence before-repair1-* disimpan. Distinct source review menemukan new J0 helper masih perlu memperlakukan ERROR_INVALID_HANDLE6 sebagai fatal; satu repair cycle menutupnya, menambah T25 invalid-handle fatal assertion dan rerun45/25 PASS. TokenQuery/Jc tidak diubah. Tidak ada assertion dilemahkan atau historical broad suite dijalankan.

T28 juga menguji LocalFree failure/null-success descriptor dan exactly-one release. Test DLL menjalankan managed fake providers; Jc fixture hanya memakai local HGLOBAL sebagai storage palsu. Tidak ada native process/job/token/SD API calls dari test. Compiler executable dan managed fake library adalah authorized tooling, bukan tambahan target runtime.

## R. Fault-injection results

| ID | Initial | Injection | Expected | Actual | SecurityStop | Resource disposition | Runtime launch authorization | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | FAKE_SESSION_ONLY | Incorrect binary hash | Hash mismatch blocks fake launch before process creation | FIXED_TARGET_OR_HASH_REJECTED | False | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F02 | FAKE_SESSION_ONLY | Missing executable | Missing image blocks fake launch before Jc/reporter creation | FIXED_TARGET_OR_HASH_REJECTED | False | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F03 | FAKE_SESSION_ONLY | Stale generation | Stale generation fails correlation, no resume and SecurityStop | CREATION_IDENTITY_MISMATCH | True | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F04 | FAKE_SESSION_ONLY | Invalid receipt | Invalid/stale receipt rejects MetadataPass | REJECTED | False | NO_NATIVE_RESOURCE | NONE: fake only; real launch depends on M3 preflight | PASS |
| F05 | FAKE_SESSION_ONLY | Class20 incorrect length | Class20 invalid length fatal; J0attempt0 | TOKEN_SAFETY_INVARIANT | True | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F06 | FAKE_SESSION_ONLY | Class20 prohibited elevation | Elevated20 fails required policy; J0attempt0, cleanup occurs | NON_ELEVATED_CONTEXT_NOT_ESTABLISHED | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F07 | FAKE_SESSION_ONLY | Class21 success length1 | Class21 native success1 stays unknown, J0attempt1 and partial | PARTIAL | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F08 | FAKE_SESSION_ONLY | Class21 native failure5 | Class21 native error5 preserved as optional if safe; J0attempt1 | PARTIAL | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F09 | FAKE_SESSION_ONLY | Class21 invalid memory | Misaligned class21 fatal, no J0 | TOKEN_SAFETY_INVARIANT | True | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F10 | FAKE_SESSION_ONLY | Safe optional uncertainty | Safe class21 unknown permits J0 but cannot full-pass/authorize | PARTIAL_NO_AUTHORITY | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F11 | FAKE_SESSION_ONLY | J0 create failure | J0 create failure recorded, no second attempt | JOB_CREATION_FAILED_NO_RETRY | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F12 | FAKE_SESSION_ONLY | J0 owner query AccessDenied | GetSecurityInfo owner failure status5 preserved, no SD acquired | ERROR5_PRESERVED | False | NO_SD_ACQUIRED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F13 | FAKE_SESSION_ONLY | J0 DACL query status87 | GetSecurityInfo DACL failure status87 preserved, no SD acquired | ERROR87_PRESERVED | False | NO_SD_ACQUIRED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F14 | FAKE_SESSION_ONLY | Malformed SD | Malformed SD triggers SecurityStop, owned SD still freed once | J0_DESCRIPTOR_SAFETY_INVARIANT | True | SD_RELEASED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F15 | FAKE_SESSION_ONLY | J0 flags query failure | J0 flag query failure keeps metadata PARTIAL, no invented flags | PARTIAL | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F16 | FAKE_SESSION_ONLY | J0 membership query failure | J0 member query failure keeps metadata PARTIAL, no invented empty list | PARTIAL | False | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F17 | FAKE_SESSION_ONLY | Unexpected J0 member | Unexpected J0 member triggers SecurityStop; no member termination | UNEXPECTED_JOB_MEMBER | True | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F18 | FAKE_SESSION_ONLY | J0 handle release failure | J0 handle close failure triggers SecurityStop; Finish attempted | FAILED | True | FINISH_ATTEMPTED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F19 | FAKE_SESSION_ONLY | Jc configuration failure | Jc configuration failure prevents reporter creation; owned Jc disposed | CONTAINMENT_CONFIGURATION_FAILED | False | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F20 | FAKE_SESSION_ONLY | Jc membership contradiction | Unexpected Jc member prevents resume/termination; uncertainty HOLD | ATOMIC_ADMISSION_NOT_VERIFIED | True | UNKNOWN_OR_HOLD | NONE: fake only; real launch depends on M3 preflight | PASS |
| F21 | FAKE_SESSION_ONLY | Reporter identity mismatch | Identity mismatch prevents resume/targeted termination; SecurityStop | CREATION_IDENTITY_MISMATCH | True | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F22 | FAKE_SESSION_ONLY | Reporter timeout | Timeout requests at most1 original-handle termination then observes exit separately | OWNED_TARGET_TERMINATED_AND_WAITED | False | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F23 | FAKE_SESSION_ONLY | Exit wait failure | Wait failure cannot become exit PASS; no PID fallback | EXIT_UNVERIFIED | False | NO_PID_FALLBACK | NONE: fake only; real launch depends on M3 preflight | PASS |
| F24 | FAKE_SESSION_ONLY | Missing final receipt | Missing final receipt cannot full-pass metadata | NO_METADATA_PASS | False | CLOSED | NONE: fake only; real launch depends on M3 preflight | PASS |
| F25 | FAKE_SESSION_ONLY | Second launch after uncertainty | Second Controller.Run after uncertainty denied, fake Creates remains1 | SECOND_LAUNCH_DENIED | False | NO_SECOND_PROCESS | NONE: fake only; real launch depends on M3 preflight | PASS |

25 PASS,0 FAIL/SKIP/TIMEOUT. Raw results-initial.json tidak diubah. reconciled-results.json hanya memperjelas expected behaviors dari assertions existing; tidak ada test atau runtime rerun setelah experiment. Semua FAKE_PROVIDER_ONLY. F20 HOLD/F23 unknown tidak diklaim resource/exit PASS; F22 termination hanya fake dan tidak menjadi termination pada experiment aktual.

## S. Superseded regression coverage

R6W-T33 tetap SUPERSEDED. Blanket absence of watchdog Job Object APIs tidak lagi tepat setelah private Jc diotorisasi. Invariant asli: tidak ada unowned/unscoped/uncontained process control.

M2 replacement T33-T40 dipertahankan melalui source provenance. M3 T31-T45 menguji private ownership,kill flags,atomic list,no fallback,suspension,identity,membership,custody,thread release,no inheritance/duplication,finite timeout/wait,PID/name restrictions dan no second Controller launch. Empat watchdog control hashes identik dan IL allowlist mendukung mapping; old test tidak diam-diam menjadi PASS atau dihitung ulang.

## T. Build and SHA-256

| Source / binary | Bytes | SHA-256 |
| --- | --- | --- |
| source/reporter/JobSecurity.cs | 4031 | F79C5855EE2C942905E39A631DDF1EC6EC7A8AA99009F34F981E7EB7C5A2F8E2 |
| source/reporter/Model.cs | 8988 | F553F9870403D57848BABEF5E5CF112996D254867F644715C131A4095994CF6A |
| source/reporter/NativeProvider.cs | 12090 | 899F49663C6854752CE4E04C3EDF61A64CAA8C9855D4CB07C36AE01C60CC8AC5 |
| source/reporter/Program.cs | 3866 | 4D0A71581A43CFA10AC5290A9BD92F1374CDECB0E27E34ECF69640B076928797 |
| source/reporter/TokenQuery.cs | 8951 | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 |
| source/watchdog/Lifecycle.cs | 11584 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/NativeHost.cs | 13348 | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 |
| source/watchdog/PrivateContainmentJob.cs | 12715 | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B |
| source/watchdog/ReporterReceipt.cs | 3575 | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/watchdog/WatchdogProgram.cs | 4489 | 949A3FD0E28B7E019B337DB757A12BA6195F5F13D95FA9CDB20CE5D3416F40CC |
| build/reporter/R6MetadataReporter.exe | 48640 | 6F194E67053DA5F7C3C4FADC0CC40745DB6C2A78E36F5AB7C7F6FC6FEA075572 |
| build/watchdog/JCWatchdog.exe | 75776 | 10CF97D4D8E72FB046C9361547A22CB026DCE231CB5AB8E5C0326A2339E76D62 |
| build/tests/JC.Tests.dll | 49664 | 19B53A905C5F12A8E3C0BAD38CEDB2C29707936B23334D5A5DC6984E744346F4 |

Existing Microsoft .NET Framework64 csc14.8.10001.0, signature Valid, SHA256 ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3. x64 optimize+,warn4/warnaserror+. Six compiler exits0,zero warnings: reporter2 builds,watchdog1,test3. Satu static repair. Final source/binary hashes direcheck sebelum dan sesudah satu runtime; tidak ada post-runtime reporter/watchdog/test source atau binary change. Intermediate reviewed artifacts tetap disimpan. inventory/manifest.json menginventarisasi seluruh new artifact dan dua repository report, self excluded.

## U. Source/IL audit

Reporter15 imports/837 own-method references; watchdog19 imports/1516 references; tests0 imports. Test call inventory tidak merujuk native providers/control APIs. New imports hanya GetSecurityInfo,GetSecurityDescriptorLength,LocalFree untuk explicit authorized read-only J0 metadata dan matching allocator release. P/Invoke GetSecurityInfo status uint, SE_KERNEL_OBJECT6, information5; LocalFree pointer-null-success. Existing token interop unchanged.

Tidak ada reporter CreateProcess/Assign/Terminate/security setters/token setters/privilege enable/Duplicate/network/shell/inference capability. Watchdog CreateProcess fixed path/hash/image-lock, original-handle termination hanya setelah revalidation; control source identik. Semua own methods/constructors/imports decoded; framework tidak didisassemble seluruhnya. Source branch review melengkapi IL inventory; successful compilation saja bukan proof of Windows behavior.

## V. Internal adversarial review

| ID | Question | Result | Evidence / scope |
| --- | --- | --- | --- |
| R01 | Is the revised reporter hash correctly bound? | PASS | Fixed-target/build-provenance actual reporter hash; WatchdogProgram and NativeHost locked rehash; T01/T05/T08 |
| R02 | Is the executable identity fixed? | PASS | Unchanged root-relative exact path check; no arguments; T03/T04 |
| R03 | Can an obsolete binary be launched? | PASS | Spec.Accept rejects obsolete hash and permit binds final actual hash; T02/T05 |
| R04 | Is the reporter source genuinely based on M2? | PASS | M2 source manifest73 entries verified; TokenQuery byte-identical; narrow J0 helper additions recorded |
| R05 | Is class-20 strictness unchanged? | PASS | TokenQuery unchanged; T09-T11; required false before J0 |
| R06 | Is class-21 compatibility handling unchanged? | PASS | TokenQuery unchanged; T12-T18; no21 read/Boolean |
| R07 | Can unknown class-21 metadata grant security authority? | PASS | No Value21/SecurityAuthorityfalse/GateSBLOCKED; no worker or admission consumer |
| R08 | Can unsafe memory conditions be downgraded? | PASS | Token lease and descriptor malformed/cleanup errors fatal; T16/T17/T28/F09/F14/F18 |
| R09 | Does optional uncertainty preserve metadata PARTIAL? | PASS | Engine completed with unknown21 remains PARTIAL; strict watchdog receipt never full pass |
| R10 | Does J0 remain independent from Jc? | PASS | Watchdog Jc vs reporter J0; no handle transfer, no assignment/import |
| R11 | Is J0 limited to one? | PASS | NativeProvider.Once unchanged; T19/F11; no fallback second J0 |
| R12 | Is J0 guaranteed not to receive intended members? | PASS | No AssignProcessToJobObject import/call, J0 members observed separately; T22/T29 |
| R13 | Is J0 handle cleanup specified? | PASS | J0 CloseHandle and GetSecurityInfo LocalFree ledger/finally, partial query/fatal release tested |
| R14 | Is Jc created and configured first? | PASS | Controller configure before Create unchanged; Jc fake ordering T32 |
| R15 | Is kill-on-close preserved? | PASS | PrivateContainmentJob flags0x2000 readback/empty membership source unchanged |
| R16 | Is atomic admission preserved? | PASS | JOB_LIST at suspended creation, live attr storage and no fallback source byte-identical |
| R17 | Is there any uncontained launch fallback? | PASS | T34/IL forbid AssignProcessToJobObject; no alternative launcher |
| R18 | Is reporter identity checked before resume? | PASS | Controller correlation and VerifyAdmission before Resume; T35/T36; NativeHost unchanged |
| R19 | Is original process-handle custody preserved? | PASS | Original PROCESS_INFORMATION custody, Demand guard and finite waits unchanged; T37 |
| R20 | Can termination target an unrelated process? | PASS | Termination original handle only with revalidated correlation; T43/F21/F22, no PID kill |
| R21 | Is process exit observed independently? | PASS | WaitForSingleObject and GetExitCodeProcess source, external original watchdog Process object observer planned |
| R22 | Are timeout and exit distinct states? | PASS | Timeout258 vs wait0 and termination accepted vs exit; T41/T42/F22/F23 |
| R23 | Is watchdog-crash behavior still unverified? | PASS | Crash not requested/performed; kill-on-close last-handle only documented expectation |
| R24 | Is external handle exclusivity still unverified? | PASS | No hostile external handle tests or global last-handle proof; remain NOT_VERIFIED |
| R25 | Are all changes disposable? | PASS | Three narrow reporter metadata files/entry changes; watchdog binding only; no repo writes except2 reports |
| R26 | Are runtime attempts bounded? | PASS | Fresh budget1, exclusive claims, Controller and NativeHost one-shot, J0Once |
| R27 | Can a second reporter start after a failure? | PASS | Controller reuse T45/F25 denied after uncertainty; exclusive outer claim prevents second invocation |
| R28 | Are source/binary hashes correct? | PASS | All source/binary hashes and IL allowlists recorded; preflight must recheck immediately before launch |
| R29 | Is historical evidence preserved? | PASS | 11 protected roots including complete M2, production/SQLite/history baseline preserved |
| R30 | Is real worker activation impossible through this milestone? | PASS | No worker/network/process-creation capability in reporter; fixed watchdog target only; GateS BLOCKED |

INTERNAL_ADVERSARIAL_REVIEW: SAFETY_REVIEW_PASS30/30. Reviewer agent yang sama pada second pass, bukan independent human. New descriptor invalid-handle finding diperbaiki sebelum preflight, final review dibuat ulang. Earlier review artifact disimpan; final acceptance memakai final source/build/45tests/25faults. Review tidak menyatakan worker-safe atau crash containment terbukti.

## W. Runtime preflight

| ID | Mandatory prerequisite | Actual decision |
| --- | --- | --- |
| PF01 | M2 actual source and complete manifest verified | PASS |
| PF02 | M2 source provenance preserved | PASS |
| PF03 | Latest reporter executable hash verified | PASS |
| PF04 | Watchdog fresh fixed path/hash binding reviewed | PASS |
| PF05 | Watchdog executable hash verified | PASS |
| PF06 | No quarantined executable reused | PASS |
| PF07 | Reporter15 imports allowlisted; no worker/network/process control | PASS |
| PF08 | Watchdog4 controls byte-identical, entry binding only | PASS |
| PF09 | 45 focused static tests PASS | PASS |
| PF10 | 25 fake faults PASS | PASS |
| PF11 | Source/IL audit PASS | PASS |
| PF12 | Internal review30 PASS | PASS |
| PF13 | Private Jc create/kill flag readback unchanged | PASS |
| PF14 | Atomic JOB_LIST admission reviewed | PASS |
| PF15 | No create-then-assign fallback | PASS |
| PF16 | CREATE_SUSPENDED unchanged | PASS |
| PF17 | Identity and membership required before resume | PASS |
| PF18 | Original process/thread custody retained | PASS |
| PF19 | No intentional handle inheritance | PASS |
| PF20 | No intentional Jc duplication | PASS |
| PF21 | Fixed asInvoker reporter; current host non-admin/non-SYSTEM, exact class20=false required before J0 | PASS |
| PF22 | Reporter no child-create API | PASS |
| PF23 | J0 Once max1 | PASS |
| PF24 | J0 owner/DACL read-only GetSecurityInfo, no SACL | PASS |
| PF25 | M2 token reader byte-identical; native/internal errors separate | PASS |
| PF26 | Owned buffers disposed, LocalFree/CloseHandle ledger valid | PASS |
| PF27 | Finite original-handle timeout/owned-stop unchanged | PASS |
| PF28 | Watchdog crash/external last-handle proof NOT VERIFIED | PASS |
| PF29 | Fresh unique M3 invocation, no prior M3 claim or launch in this root | PASS |
| PF30 | Evidence directories exist/no reparse | PASS |
| PF31 | Attempt counter0; exclusive claims required | PASS |
| PF32 | No mandatory contradiction; ERROR_INVALID_HANDLE SD path fixed and tested | PASS |

32 PASS -> M3_RUNTIME_AUTHORIZED. Current host x64/non-admin/non-SYSTEM; fixed reporter default asInvoker, exact self class20 check wajib sebelum J0. Preflight tidak mengaku sudah mengukur TokenElevation reporter; pengukuran aktual kemudian ada di E006. Snapshot AI/protected/source/binary cocok, no reparse, exclusive claims belum ada sebelum permit. Satu-shot budgets WD/Jc/reporter/J0<=1,crash/retry0. Known crash/hostile-last-handle limits dicatat, bukan silently skipped.

## X. Runtime experiment or NOT RUN

RUN exactly once. Invocation 93a544d8-8f10-4501-9cc4-d74cc1822b0b, Generation 260e8f6b-e22c-48a0-bd09-89a3758e6b86. WatchdogPID11116, reporterPID1612. Original watchdog Process-object retained; reporter original PROCESS_INFORMATION process/thread handles retained. Watchdog membuat Jc/configure/query limits lalu atomic suspended reporter, verifies/resumes. Reporter menghasilkan E001-E015 dan exit normal30; watchdog exit30. No timeout,termination request,crash/retry,child-target,worker,MXC,app-server,inference,paidAPI.

Outer WaitForExit budget60000ms, watchdog original reporter wait20000ms plus reviewed owned-stop waits if needed. Actual completion sekitar satu detik; tidak ada failure-path runtime injection. no-retry.json menutup sisa runtime budget0. Scripts audit receipt selanjutnya hanya membaca hasil; koreksi host PSCustomObject property-check tidak menyentuh reporter/watchdog source/binary atau mengulang experiment.

## Y. Reporter token observations

E001 reporter self PID1612 creationUTC2026-11-06T23:04:14.9329333Z, x64. E004 principal REDACTED; E005 MEDIUM IL; E006 class20 native success4,false; E007 privilege summaries read-only; E008 class21 success1,unknown; E009 class29 query berhasil; E010 default-DACL template dibaca sebagai template, bukan actual object DACL.

14 dari15 query Oktrue; E008 unknown sengaja Okfalse. Engine Completedtrue,SecurityStopfalse,Failure null,GateM PARTIAL. No worker/supervisor/MXC token observation. Reporter Environment.OSVersion6.2.9200 adalah compatibility projection pada .NET executable, bukan bukti host downgrade; actual host version disimpan preflight.

## Z. Actual J0 observations

| ACE type | Flags | Mask | Principal | Limit |
| --- | --- | --- | --- | --- |
| AccessAllowed | None | 0x001F003F | REDACTED_PRINCIPAL | ACE metadata, not an effective-access decision |
| AccessAllowed | None | 0x001F003F | LOCAL_SYSTEM | ACE metadata, not an effective-access decision |
| AccessAllowed | None | 0x00120004 | REDACTED_PRINCIPAL | ACE metadata, not an effective-access decision |

E011 CreateJobObjectW successful,error0,one unnamed-by-construction J0. E012 rawflags0/error0. E013 GetSecurityInfo status0,140-byte owner/DACL descriptor; ownerREDACTED_PRINCIPAL,presenttrue,nullfalse,3ACE. Dua allow masks0x001F003F, satu0x00120004; ini ACL metadata, bukan measured granted mask/effective access. SACLnotrequested. E014 class3ReturnLength8/cap4096/ptr8,assigned0/listed0. E015 J0/SD resources released. GateJ0PASS berdasarkan actual query receipts, tidak berdasarkan newly-created assumption.

## AA. Jc containment observations

One Jc CreateJobObjectW success,error0,NULL name/attributes. Initial flags0 dan members0; watchdog bukan anggota Jc. SetInformationJobObject class9 flags0x2000 dan query readback8192,size144.

InitializeProcThreadAttributeList size48, reviewed x64 layouts, JOB_LIST0x2000d/one handle/valuebytes8. CreateProcessW flags0x08080404/InheritHandlesfalse/AtomicJobListtrue. Original PID/time/image matched; Jc flags0, IsProcessInJob(reporter,Jc)true, assigned1/IDs[1612] before ResumeThread returns previous suspend count1. Final query assigned0/IDs[] after observed exit, owned Jc CloseHandle success/error0.

Watchdog memiliki ambient job saat runtime, tetapi private Jc terkonfigurasi dan reporter admission sukses. Tidak ada ambient-job changes atau klaim MXC nested-job compatibility.

## AB. Reporter and watchdog exit evidence

Reporter original process handle WaitForSingleObject(20000)success/WAIT_OBJECT_0=0; GetExitCodeProcesssuccess/value30/error0. Creation time/PID/image/HandleKey/generation correlated; no timeout dan TerminationRequests0.

Outer retained Process object watchdogPID11116 creation/time/hash/nonce bound, WaitForExittrue,ExitCode30,EmergencyHoldPossiblefalse. Jc close dilakukan setelah reporter exit dan bukan dipakai sebagai exit receipt. No unaccounted new experimental process untuk invocation ini; tidak ada claim global process census.

Exit30 pada reporter berarti completed metadata PARTIAL; watchdog raw LIFECYCLE_PASS_METADATA_PARTIAL/GateC PASS/GateL PASS/GateM INCONCLUSIVE dipertahankan. Normal exit bukan watchdog-crash proof.

## AC. Resource accounting

| Reporter resource | Allocator/type | Acquired | Release attempted | Released | Dependents | Error |
| --- | --- | --- | --- | --- | --- | --- |
| M-process | HANDLE | True | True | True | 0 | 0 |
| M-token | HANDLE | True | True | True | 0 | 0 |
| SD-M-1 | HGLOBAL | True | True | True | 0 | 0 |
| Token1-2 | HGLOBAL | True | True | True | 0 | 0 |
| Token25-3 | HGLOBAL | True | True | True | 0 | 0 |
| Token20-4 | HGLOBAL | True | True | True | 0 | 0 |
| Token3-5 | HGLOBAL | True | True | True | 0 | 0 |
| Token21-6 | HGLOBAL | True | True | True | 0 | 0 |
| Token29-7 | HGLOBAL | True | True | True | 0 | 0 |
| Token6-8 | HGLOBAL | True | True | True | 0 | 0 |
| J0 | HANDLE | True | True | True | 0 | 0 |
| J0-SD | LOCAL_ALLOC | True | True | True | 0 | 0 |
| JobMembers-9 | HGLOBAL | True | True | True | 0 | 0 |

13 acquired/13 released/remaining0:3 HANDLE,9HGLOBAL,1LOCAL_ALLOC. J0-SD LocalFree dan J0 CloseHandle tercatat. Borrowed pseudo-handle tidak ditutup. Watchdog original-thread/original-process CloseHandle success, privateJcClose success, image lock/environment/attribute-list/job-handle-array released.

Raw watchdog ReporterResourceDisposition=REPORTER_USER_MODE_RELEASE_NOT_VERIFIED karena label diikat ke full MetadataPass. Auditor memverifikasi E015 dengan actual nonce/hash/PID/time serta13 individual resource entries; raw label tidak diubah. Ini API/ledger receipt, bukan whole-system heap census atau global handle-exclusivity proof.

## AD. Gates C/L/J0/T/S

C PASS: private Jc,kill flags,atomic admission,identity,membership before resume,no fallback; current host normal run.

L PASS: original custody,actual reporter wait/exit,watchdog independent exit,resources closed,correlated invocation.

J0 PASS: exactly one unnamed-by-construction J0; owner/DACL query success; raw flags; actual zero members; SD and handle released.

T PARTIAL: exact class20=false valid; class21 native shape observed, semantic restriction value NOT_OBSERVED; no unsafe result classified optional.

S BLOCKED: no full worker-security acceptance. J0 success cannot promote worker token/MXC/filesystem/billing safety. These gates are independent; report completeness is not security verification.

## AE. Remaining security limitations

Actual deliberate watchdog crash, hostile same-user/external handle acquisition and global last-handle custody belum diuji. Real process-tree cleanup, worker token sandboxing, production supervisor dan MXC nested jobs belum terverifikasi. Physical output fencing, credential custody, subscription entitlement dan included-only billing belum terbukti.

MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE tetap; candidate0.164.0 tidak direstore/disubstitusi dengan active Codex. PID23376 dan23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED. Historical/current PIDs hanya receipt identifiers, bukan target speculative cleanup.

No child-creation capability pada reporter adalah source/IL evidence; tidak ada descendant census. Local API checks/receipts bukan jaminan seluruh heap/kernel corruption atau OS progress. Source-exclusive custody bukan proof malicious external holders must fail. GateS dan real worker tetap BLOCKED.

## AF. Source/system integrity

Scoped final integrity:459 preexisting AI-Office files unchanged;461 final =459+exactly2 new reports. Git136->138, unrelated user changes tetap. Scope excludes .git/node_modules, includes production source,SQLite,ProjectState/S12-S15/history. Protected11 roots586 files preserve M2 root74/M root63/older evidence and activeCodex50 files including nested node_modules. Hermes647 tracked hashes/pathset unchanged; untracked/ignored outside inspected scope.

Fresh disposable <TEMP>/ai-office-m0202s16br6wjcm3-ec787404-0ad7-46e4-95e7-4f39da23e131 contains 82 final files, 81 manifest entries excluding itself. FinalAudit verifies each hash/report/count after sealing; no writes after manifest. Original source/runtime receipts and both new reports included in inventory linkage. R3 guard/source unchanged, operational permits remain absent in R3. Missing candidate absent. Old unavailable2209files/17roots not claimed verified.

No dependency install,elevation,token/security-descriptor/ACL/globalOS changes,credentials,inference,paidAPI,MXC,app-server,real worker,crash/retry,broad/PID kill or later milestone. Public docs browsing explicitly occurred; literal no external network use is not claimed. Runtime has no network/provider traffic. Source/command/file audit is scoped, not whole-machine security telemetry. audit/final-integrity.json contains all44 requested integrity items and actual limitations.

## AG. Final classification

M02-02S16B-R6W-JC-M3 J0_OS_PASS_WITH_TOKEN_PARTIAL — EMPTY JOB METADATA VERIFIED — TOKEN RESTRICTION VALUE NOT OBSERVED — CONTAINMENT AND NORMAL LIFECYCLE VERIFIED — REAL WORKER BLOCKED.

Accepted only for this reviewed host/invocation, source+binary binding and normal lifecycle. Full token restriction semantics, hostile containment and real worker readiness are not accepted.

## AH. One recommended next step

M02-02S16B-R6W-JC-CRASH - Controlled Watchdog-Crash Containment Validation, hanya dengan otorisasi terpisah. Batasi satu controlled synthetic target, trusted external observer, exact watchdog/target identity, Jc membership before crash,last-handle custody,bounded failure trigger,independent target-exit observation,no uncontrolled descendants/no PID-wide kill,finite fallback/disposition serta explicit failure outcomes. No MXC atau real worker.

Tidak dijalankan dari M3. M3 sudah selesai; hanya keputusan menjalankan milestone crash tersebut yang membutuhkan otorisasi baru.

