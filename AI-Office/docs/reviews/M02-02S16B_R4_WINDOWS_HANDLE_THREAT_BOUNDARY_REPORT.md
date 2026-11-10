# M02-02S16B-R4 - Windows Handle Access Threat Boundary & Runtime Safety Decision

Tanggal: 2026-11-05. Audit-only. Root metadata audit: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br4-audit-c0d7b634-c593-48a5-980b-7a27c7e7b007. Tidak berisi executable, bridge baru atau runtime-test artifacts. S/P/D references didefinisikan di bagian C/D. Tidak ada runtime authorization.

## A. Executive decision

**INCONCLUSIVE.** Hak yang menentukan external handle access telah dipetakan, tetapi effective security descriptors, worker token/PSEC restrictions dan actual granted-handle population yang relevan belum tersedia. R4 tidak menyimpulkan bahwa semua same-user processes boleh mengakses supervisor; juga tidak menyimpulkan bahwa akses tersebut ditolak. API availability bukan exploit atau capability grant.

Boundary B (host dengan untrusted sandboxed worker) tetap kandidat yang diperlukan. Boundary C (malicious same-user/equal-privilege actor) tetap risiko eksplisit yang belum diselesaikan, bukan dikeluarkan diam-diam. Boundary A yang mengandalkan cooperation tidak diadopsi. Tidak ada bukti teknis untuk menyatakan solusi mustahil atau memerlukan administrator/service secara otomatis.

Separate adversarial review: **INCONCLUSIVE** untuk adequacy boundary/runtime safety. Tidak ada mandatory unknown yang diubah menjadi PASS. Native guard tetap tertutup. Runtime experiments0, jobs0, synthetic workers0, builds0, tests rerun0, security mutations0. Real worker BLOCKED.

## B. Latest S16B-R3 checkpoint

Checkpoint **STATIC_PASS_RUNTIME_BLOCKED**. R3 merekam229 static PASS,25 new faults dan26 R2 faults revalidated,152 regressions retained,3 successful builds, H1/H2 NOT RUN. Angka itu **HISTORICAL_ONLY** pada R4; tidak ada rerun karena source tidak berubah.

R3 manifest66 entries/root67 file diverifikasi dengan SHA256 anchor 1DB222FAA164B640EBA72192597C5BD11CCC93AF602B0FF457E37C98D3606059. R3 independent-review/prelaunch tetap INCONCLUSIVE/NOT_AUTHORIZED, authorization.json dan build-gate.json tetap absent.10 report/matrix checkpoint diperiksa bersama relevant original C# source dan source backend. Older S16B memiliki failed runtime/unknown-member history; R4 tidak menghapus atau memperbaikinya.

## C. Actual source and evidence inventory

S01-S09 adalah source R3 di root prior yang tidak diubah. S10-S14 adalah source repository. Line anchors dan SHA256 mengikat temuan ke file aktual. Duplikasi satu file pada beberapa S reference berarti beberapa simbol, bukan beberapa file. P01-P03 adalah Microsoft MXC source pada commit b21120168d70befe12356411423266bfef168446 yang dibaca melalui web; bukan attestation binary yang hilang.10 historical report hashes berikut dipertahankan.

Enam kelas klaim digunakan sepanjang laporan: **Documentation** (D refs), **Source** (S/P refs), **Historical observation** (receipt lama), **Current observation** (hash/availability/source inspection R4), **Inference** (analisis bersyarat), **Unverified** (effective access/runtime outcome belum diketahui). SOURCE_VERIFIED tidak berarti API dijalankan. Tidak ada current observation berupa process/token/DACL query.

Pencarian terarah506 file metadata/evidence lama tidak menemukan receipt dengan indikator DACL/TokenIntegrityLevel/TokenMandatoryPolicy/TokenRestrictedSids/TokenIsAppContainer/PROCESS_DUP_HANDLE/GetSecurityInfo/IsTokenRestricted. Search index/pattern tersimpan di metadata-search.json; ini scoped absence, bukan bukti seluruh disk tidak punya metadata tersebut. Tidak ada token/credential value dibaca atau diekspos.

| Source ID | Exact local reference | Symbol/context | SHA256 |
| --- | --- | --- | --- |
| S01 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 15 | NativeRuntimePermit.Load | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S02 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 33 | NativeAdmissionEvidence.Verify | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S03 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 71 | NativeJobSession.Setup | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S04 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 85 | NativeJobSession.Create | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S05 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 117 | NativeJobSession.Terminate | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S06 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\R3Native.cs | : | 127 | DisposeOwned | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| S07 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\NativeDeclarations.cs | : | 23 | Native Win32 declarations | BDC210C8979EFBC2B9BCBA693764940DF9BA28E9BDE1E3E695CA5048D78F996D |
| S08 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\AdmissionLifetime.cs | : | 59 | DispositionInput/FailureDisposition and custody | 3F9CC0E7B5C2B03A47DAD8798404DFB49E860D8E990F161BFA8BB924C8BC190B |
| S09 | C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1\source\AtomicProtocol.cs | : | 39 | RuntimeAuthority.DemandNative | 72D1F4CF2E83E76EFE2C39EF352BE413B0E9EF936C5518BEBE3D4C92EBCDE997 |
| S10 | D:\Rajendra\AI-Projects\AI-Office\src\server\runtime-security\supervisor.ts | : | 122 | SyntheticSecurityHarness worker-reported messages; stopRun:163; finish:173 | CBDBF309F30101A41F144EF6B676080BE2A1678D4B5FF457A233B4892EA1DF03 |
| S11 | D:\Rajendra\AI-Projects\AI-Office\src\server\attempt-control\recovery.ts | : | 9 | RecoveryAuthority; ProcessEvidenceSchema:18; dispatch/retry:31 | 6A96F837BA8F04B8E29511B5884BF618205B53329546ABF309FEDE7F93D635DF |
| S12 | D:\Rajendra\AI-Projects\AI-Office\src\server\attempt-control\repository.ts | : | 189 | Dormant reconciliation; inspector quarantine:212 | BE70998E2650456859217336A87646EA8619AAF32FDAD4A1C6AD3D78E365F1D3 |
| S13 | D:\Rajendra\AI-Projects\AI-Office\src\server\index.ts | : | 12 | startBackend, no native supervisor integration | BD44650661805CA4737115726DAD38AB896DF397CA4AB3B4B55B87F722F0A186 |
| S14 | D:\Rajendra\AI-Projects\AI-Office\src\server\http.ts | : | 1 | HTTP imports/routes; no production OS authority bridge | 4B10E968A3FE541684BF0A563515474963C7C81DAA63486425F0DBF02DD89081 |

| Checkpoint report | SHA256 | Class |
| --- | --- | --- |
| M02-02S16_PROCESS_TREE_SECURITY_GATE_MATRIX.md | 9346C8B819604DD85F516DC281AF0BA1819601F8998DA8B19708A75B1BC76F8E | HISTORICAL_ONLY |
| M02-02S16_PROCESS_TREE_SUPERVISION_REPORT.md | 04AAAD6C576CA46D332F9B21F47EA8FFA38A0419D141FDB24DA95CE2C9320F71 | HISTORICAL_ONLY |
| M02-02S16B_PROCESS_CONTROL_BRIDGE_REPORT.md | A3390CB842433AB5BEDDF2E95D60AC742C7362ED66BCFEC63990B1BE1BEDC37A | HISTORICAL_ONLY |
| M02-02S16B_PROCESS_CONTROL_GATE_MATRIX.md | 6D1E31C5433DCB40FD5EDC250965A4A8E842888CFD37BCEB20433B7902158277 | HISTORICAL_ONLY |
| M02-02S16B_R_MEMBERSHIP_CLEANUP_REMEDIATION_REPORT.md | 0730D14A1E188BA8E0DF7AB4C989D3E6B85338D9EA3BDFA8EBF5EABC6FA24058 | HISTORICAL_ONLY |
| M02-02S16B_R_SECURITY_GATE_MATRIX.md | CDE6CE8C2D3309E554632C358C379DABF5F0840583A970C4D3D7DC28F485F247 | HISTORICAL_ONLY |
| M02-02S16B_R2_CONTAINMENT_VALIDATION_REPORT.md | CA685063EA209EE168ADFC533D01E329DEC2B8D4C1D91DF904E2D8737E0D3CAD | HISTORICAL_ONLY |
| M02-02S16B_R2_SECURITY_GATE_MATRIX.md | FBC1C9D575BE602B00E2EF26DA84D76F3B4629EC01F2DADED67A4593C346C804 | HISTORICAL_ONLY |
| M02-02S16B_R3_JOB_ADMISSION_LIFETIME_REPORT.md | E3D040D1242C1FBA850AC2A30B1262CDDD6937113FC87B0706B3E87006EAB918 | HISTORICAL_ONLY |
| M02-02S16B_R3_SECURITY_GATE_MATRIX.md | 20CF842981B2147BB3D20B0C7E676A2982AAEE851E9B9A7BF7DF825FF385FA1B | HISTORICAL_ONLY |

## D. Windows security model

**Documentation/Inference:** akses adalah hubungan actor-token, requested mask, object descriptor/mandatory policy, existing granted capabilities dan privileges yang benar-benar applicable. Nama proses, SID user yang sama, PID, nonce dan application CAS bukan OS isolation boundary. DACL job, DACL supervisor dan DACL child adalah objek berbeda. Handle slot bukan objek dengan DACL terpisah; granted mask melekat pada capability yang merujuk objek.

NULL SECURITY_ATTRIBUTES/default descriptor tidak sama dengan explicit NULL DACL. Default berasal dari konteks creator; allowed/denied principals efektif harus dibaca, bukan ditebak. MIC menambah mandatory policy sebelum discretionary checking; effective labels/token belum diukur. Current metadata tidak memenuhi predicate aman maupun predicate exploit.

Reference register berikut menunjuk primary documentation/source yang benar-benar ditinjau. Claims dibatasi pada API contract atau source intent; modern docs tidak membuktikan konfigurasi pinned runtime.

| ID | Primary reference | Evidence scope |
| --- | --- | --- |
| D01 | [ | Access Control Model | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/access-control-model | ) | Microsoft documentation, not runtime receipt |
| D02 | [ | Process Security and Access Rights | ]( | https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights | ) | Microsoft documentation, not runtime receipt |
| D03 | [ | Job Object Security and Access Rights | ]( | https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights | ) | Microsoft documentation, not runtime receipt |
| D04 | [ | DuplicateHandle | ]( | https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle | ) | Microsoft documentation, not runtime receipt |
| D05 | [ | Handle Inheritance | ]( | https://learn.microsoft.com/en-us/windows/win32/sysinfo/handle-inheritance | ) | Microsoft documentation, not runtime receipt |
| D06 | [ | Mandatory Integrity Control | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/mandatory-integrity-control | ) | Microsoft documentation, not runtime receipt |
| D07 | [ | GetSecurityInfo | ]( | https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo | ) | Microsoft documentation, not runtime receipt |
| D08 | [ | UpdateProcThreadAttribute | ]( | https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute | ) | Microsoft documentation, not runtime receipt |
| D09 | [ | Job Objects | ]( | https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects | ) | Microsoft documentation, not runtime receipt |
| D10 | [ | Nested Jobs | ]( | https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs | ) | Microsoft documentation, not runtime receipt |
| D11 | [ | Restricted Tokens | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/restricted-tokens | ) | Microsoft documentation, not runtime receipt |
| D12 | [ | OpenProcess | ]( | https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess | ) | Microsoft documentation, not runtime receipt |
| D13 | [ | How AccessCheck Works | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/how-dacls-control-access-to-an-object | ) | Microsoft documentation, not runtime receipt |
| D14 | [ | CreateProcessW | ]( | https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw | ) | Microsoft documentation, not runtime receipt |
| D15 | [ | AppContainer isolation | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation | ) | Microsoft documentation, not runtime receipt |
| D16 | [ | SECURITY_INFORMATION | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/security-information | ) | Microsoft documentation, not runtime receipt |
| D17 | [ | Access Rights and Access Masks | ]( | https://learn.microsoft.com/en-us/windows/win32/secauthz/access-rights-and-access-masks | ) | Microsoft documentation, not runtime receipt |
| D18 | [ | Owner Rights SID | ]( | https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers | ) | Microsoft documentation, not runtime receipt |
| D19 | [ | SECURITY_ATTRIBUTES | ]( | https://learn.microsoft.com/en-us/windows/win32/api/wtypesbase/ns-wtypesbase-security_attributes | ) | Microsoft documentation, not runtime receipt |
| D20 | [ | AssignProcessToJobObject | ]( | https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject | ) | Microsoft documentation, not runtime receipt |
| P01 | [ | Pinned UiJobObject source:214,382 | ]( | https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/job_object.rs#L214 | ) | Pinned Microsoft source, not runtime receipt |
| P02 | [ | Pinned BaseContainerRunner source:770,830 | ]( | https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs#L770 | ) | Pinned Microsoft source, not runtime receipt |
| P03 | [ | Pinned SecurityEnvironmentStartupInfo source:169,231 | ]( | https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/secenv.rs#L169 | ) | Pinned Microsoft source, not runtime receipt |

## E. Protected objects and handle ownership

O01-O16 berikut adalah ownership/source model. Tidak ada new native object R4. Owner OS SID tidak difabrikasi; current-invocation logical owner berbeda dari security-descriptor owner. Semua actual meaningful worker-control permissions pada tabel kedua **NOT VERIFIED**.

| ID | Object | Creator/owner | Token context | Descriptor source | Relevant rights | Handle acquisition |
| --- | --- | --- | --- | --- | --- | --- |
| O01 | Backend process | Future host launcher / host | Creator context not measured | Supervisor/backend process SD not set by R3 child attributes | PROCESS_DUP_HANDLE/TERMINATE/VM_*/WRITE_DAC | Legitimate launcher/self or permitted OpenProcess |
| O02 | Test supervisor process | Trusted launcher / invocation | R3 binary not running | Own process SD comes from its launcher, not R3 Create(child) | PROCESS_DUP_HANDLE/CREATE_PROCESS/VM_*/WRITE_DAC | Own pseudo handle; external open only if permitted |
| O03 | Production supervisor | Future host / future supervisor | Not implemented/wired | Must specify creation-time process SD | Dangerous process rights plus SYNCHRONIZE for observer | Future original/self capabilities only |
| O04 | Private Job Object | R3 NativeJobSession.Setup / invocation | Creator token details unknown | CreateJobObjectW(NULL,NULL) -> default SD; not a NULL DACL claim | ASSIGN/TERMINATE/QUERY/SET_ATTRIBUTES/WRITE_DAC | Original CreateJobObject; unnamed has no named-open route |
| O05 | Job handle | Current invocation / CreateJobObject | Process-local capability | No independent handle DACL; underlying job SD | Granted mask returned by API; no attenuation source | Original handle stored privately |
| O06 | Original child process handle | Invocation / CreateProcessW return | Child creator context source-known, effective token unknown | Child process attrs NULL -> default descriptor | Query/wait/terminate; documented creation handle broad | Original PROCESS_INFORMATION; never worker PID reopen |
| O07 | Primary thread handle | Invocation / CreateProcessW return | Child thread context unmeasured | Thread attrs NULL -> default | THREAD_SUSPEND_RESUME; relevant thread control/SD rights | Original returned thread handle |
| O08 | Duplicated handle | Duplication caller / destination holder | Depends on source/destination authority | Underlying object SD, individual granted mask | Source+destination process DUP rights; per-object capability | DuplicateHandle if prerequisites actually granted |
| O09 | Inherited handle | Parent-created / child holder | Child creation context | Underlying object SD; inherited granted access | Potential copied host-control rights | Inheritance flags and actual creation configuration |
| O10 | Access token | OS/creator / owning process | No actual token read in R4 | Token object SD distinct from process/job | TOKEN_QUERY for future metadata; do not leak raw token | Future host-owned query only; no duplication/impersonation authority |
| O11 | Job security descriptor | OS from creator defaults / job owner | Creator primary/impersonation relationship unknown | No explicit SD policy or readback in R3 | READ_CONTROL/WRITE_DAC/WRITE_OWNER | Future GetSecurityInfo on owned job only |
| O12 | Process security descriptor | OS/launcher / process owner | Creator relationship unmeasured | Supervisor SD != child SD != job SD | READ_CONTROL/WRITE_DAC/WRITE_OWNER | Future owned-process GetSecurityInfo only |
| O13 | Supervisor handle-containing memory | Supervisor / trusted runtime | Same supervisor process | Process access protections + MIC/sandbox, not job DACL | VM_READ/WRITE/OPERATION/CREATE_THREAD and DUP routes | Own memory; external read/write requires capabilities |
| O14 | Process attribute list | Supervisor / allocator | Trusted supervisor process context | Heap memory; process SD boundary | Memory access plus launch authority | Private allocation, fixed job-list source |
| O15 | Cancellation channel | Future host / trusted endpoint | Must authenticate caller and attempt | Future pipe/IPC SD and granted handles | Endpoint read/write/impersonation/handle-transfer permissions | Explicit host-created channel only |
| O16 | Termination authority | Host supervisor / authorized launcher | Host authorization plus OS capability | Underlies process/job/IPC protections; not one standalone object | PROCESS_TERMINATE/JOB_OBJECT_TERMINATE and original custody | Retained trusted capabilities, not worker claims |

| ID | Inheritance/duplication | Actual access | Worker control | Missing evidence |
| --- | --- | --- | --- | --- |
| O01 | No source promise for backend handle export; future IPC must reject | NOT VERIFIED | Conditional on granted rights; no exploit observed | No backend process-object descriptor/label receipt |
| O02 | R3 does not intentionally send supervisor handle | NOT VERIFIED | Conditional on granted rights; no exploit observed | Actual supervisor SD/token/granted masks absent |
| O03 | No worker control export permitted by design | NOT VERIFIED | Conditional on granted rights; no exploit observed | No implementation or actual object |
| O04 | No intended inheritance/export; external duplication not excluded | NOT VERIFIED | Conditional on granted rights; no exploit observed | Effective SD/label and access outcomes absent; no job exists |
| O05 | Noninherited intended; any holder may retain lifetime | NOT VERIFIED | Conditional on granted rights; no exploit observed | Actual flags/mask/population not measured |
| O06 | Intended noninheritance; duplication requires custody | NOT VERIFIED | Conditional on granted rights; no exploit observed | No actual child/handle; least-right attenuation absent |
| O07 | Noninheritance source check; no export | NOT VERIFIED | Conditional on granted rights; no exploit observed | Actual thread SD/flags/mask absent |
| O08 | New ownership and close record mandatory | NOT VERIFIED | Conditional on granted rights; no exploit observed | No local duplication operation; external capability unmeasured |
| O09 | Explicit minimal handle list if IPC later required | NOT VERIFIED | Conditional on granted rights; no exploit observed | R3 intended false inheritance; runtime handle population absent |
| O10 | Never worker-visible privileged token capability | NOT VERIFIED | Conditional on granted rights; no exploit observed | IL/restricting SIDs/privileges/AppContainer/PSEC facts absent |
| O11 | Descriptor itself is metadata, not process-local handle | NOT VERIFIED | Conditional on granted rights; no exploit observed | Actual owner/DACL/mandatory label absent |
| O12 | No descriptor patch allowed in R4 | NOT VERIFIED | Conditional on granted rights; no exploit observed | Need host, supervisor and worker SDs separately |
| O13 | IPC must not expose host addresses/control authority | NOT VERIFIED | Conditional on granted rights; no exploit observed | Actual deny outcomes and gate-file write exclusion absent |
| O14 | JOB_LIST assigns membership; it is not HANDLE_LIST inheritance | NOT VERIFIED | Conditional on granted rights; no exploit observed | No external memory boundary measured |
| O15 | Never accept worker handle/PID as new authority | NOT VERIFIED | Conditional on granted rights; no exploit observed | No production cancellation channel security verified |
| O16 | No onward grant to worker | NOT VERIFIED | Conditional on granted rights; no exploit observed | Native termination/exit and external-authority exclusion not verified |

## F. Process security descriptor review

**Source:** R3Native.Create:88 memberikan NULL process/thread security attributes untuk **child**. Itu tidak mengatur DACL **supervisor** yang dibuat launcher sebelumnya. S13 tidak memasang production native supervisor; tidak ada descriptor/token receipt untuk process backend/supervisor/worker. Audit shell/current user environment bukan proxy konfigurasi target tersebut.

**Documentation D02/D12/D13/D14/D17/D18; Inference:** OpenProcess mengevaluasi requested access terhadap security context/descriptor. Rights yang perlu dibedakan:

| Right | Mask | Security significance |
| --- | --- | --- |
| PROCESS_DUP_HANDLE | 0x0040 | Duplicate capability pada process sumber/tujuan; bukan query-only |
| PROCESS_TERMINATE | 0x0001 | Dapat menghentikan process object yang dituju |
| PROCESS_CREATE_PROCESS | 0x0080 | Penggunaan sebagai parent via PARENT_PROCESS attribute |
| PROCESS_SET_INFORMATION | 0x0200 | Mengubah informasi proses yang sesuai |
| PROCESS_QUERY_INFORMATION | 0x0400 | Query metadata lebih luas; bukan DUP/terminate |
| PROCESS_QUERY_LIMITED_INFORMATION | 0x1000 | Query terbatas; bukan host-control capability |
| PROCESS_VM_READ/WRITE/OPERATION | 0x0010/0x0020/0x0008 | Memory exposure/mutation routes perlu dicegah |
| PROCESS_CREATE_THREAD | 0x0002 | Remote execution/control concern |
| READ_CONTROL | 0x00020000 | Baca owner/group/DACL; label query spesifik lihat D16 |
| WRITE_DAC | 0x00040000 | Mengubah discretionary policy |
| WRITE_OWNER | 0x00080000 | Mengubah ownership sesuai aturan OS |
| SYNCHRONIZE | 0x00100000 | Wait, bukan izin terminasi atau duplication |

SeDebugPrivilege tidak selalu diperlukan bila requested rights sudah diberikan melalui access check biasa. Bila privilege kuat tersedia/enabled dan applicable, ordinary-process protections mungkin dapat dilewati; R4 tidak mengaktifkan/mengasumsikan privilege itu. Query-only handle tidak otomatis memberi DUP. PROCESS_DUP_HANDLE sendiri berbahaya: D02 memperingatkan pseudo-handle duplication dapat memperoleh process capability yang lebih luas.

Deny/grant berdasarkan nama executable tidak memisahkan dua actor dengan SID sama. Owner-implicit READ_CONTROL/WRITE_DAC dan OWNER RIGHTS SID (S-1-3-4, D18) harus dipertimbangkan; bukan resep deny-ACE yang langsung diterapkan. Restricted/PSEC access semantics tetap perlu actual evidence. Tidak ada SD/ACE proposal literal yang diadopsi.

## G. Job Object security descriptor review

**Source S03/P01:** job unnamed, default attributes, creator menyimpan original handle. R3 tidak membaca DACL/owner/mandatory label. P01 juga memakai default security attributes; source comment tentang abandoned sandbox tidak membuktikan tiadanya external holder.

**Documentation D03/D07/D09/D10:** unnamed menutup name-based reopen untuk objek itu; tidak menghapus duplication/inheritance atau broker routes. Existing holder dengan rights relevan bisa mempunyai authority berbeda dari actor yang mencoba reopen. Job SD bukan supervisor process SD. Source logical owner tidak menetapkan actual owner SID/DACL.

J01 current invocation creates; J02 unnamed; J03/J04 default descriptor dari creator context, actual ACEs unknown; J05 principals efektif NOT VERIFIED; J06 no name for direct named-open; J07 duplication conditional; J08 intended noninheritance; J09 useful same-user supervisor access unknown. J10-J12 depend ASSIGN/TERMINATE/SET rights; J13/J14 extra holders affect lifetime; J15 false inheritance source; J16 no local R3 duplication operation; J17 no explicit rights attenuation; J18 defaults relied on; J19 different IL may alter mandatory policy, not measured; J20 nested hierarchy and access effects must be scoped, not inferred from PPID.

## H. PROCESS_DUP_HANDLE access analysis

**Documentation D04/D12; Inference:** ordinary duplication path memerlukan usable source-process handle dengan PROCESS_DUP_HANDLE dan destination-process capability yang sesuai; self-destination dapat memakai valid self capability. Source handle/pseudo-handle juga harus valid dalam context sumber. R4 tidak memperoleh/mencoba capability tersebut.

Access mungkin berasal dari permitted OpenProcess, inherited handle atau existing broker-supplied capability. Sudah memegang capability berarti tidak selalu perlu reopen; future DACL tightening tidak boleh dianggap retroactively mencabutnya. Actual granting actor pada mesin ini tidak diketahui. No local DuplicateHandle API pada R3 hanya Source finding, bukan denial terhadap caller lain.

No live-handle duplication, pseudo-handle amplification attempt, global handle-table scan atau privilege enabling dilakukan. Temuan external access R3 dipertajam menjadi predicate izin yang perlu dibuktikan, bukan klaim bahwa semua same-user actor pasti dapat menyerang.

## I. Job Object rights analysis

**Documentation D03/D20; Inference:** rights berikut berbeda dan tidak saling disamakan.

| Right | Mask | Authority/risk |
| --- | --- | --- |
| JOB_OBJECT_ASSIGN_PROCESS | 0x0001 | Admission; process-side rights dan hierarchy restrictions juga diperlukan |
| JOB_OBJECT_TERMINATE | 0x0008 | Terminasi associated scope |
| JOB_OBJECT_QUERY | 0x0004 | Query tanpa mutation, tetapi handle retention tetap relevan |
| JOB_OBJECT_SET_ATTRIBUTES | 0x0002 | Mutasi limits; dapat merusak intended cleanup policy |
| JOB_OBJECT_ALL_ACCESS | 0x001F001F | Documented creation handle, bukan explicit attenuation R3 |
| READ_CONTROL | 0x00020000 | Descriptor inspection pada owned object bila diotorisasi |
| WRITE_DAC | 0x00040000 | Dapat mengubah grants untuk akses berikutnya |
| WRITE_OWNER | 0x00080000 | Ownership policy concern |

Original creation APIs secara documented mengembalikan broad process/job handles; source tidak memanggil OpenProcess(ALL_ACCESS) untuk worker target. Memegang original handle di host tepercaya dapat diperlukan; bahaya adalah pemberian/duplikasi kepada actor tak tepercaya. ActiveProcessLimit1 membatasi concurrency, bukan membuktikan siapa yang boleh assign atau siapa pemilik setiap member. Job-list assignment bukan transfer handle kepada child.

Query-only job handle tidak memberi assign/terminate; namun lifetime last-close tetap dapat dipengaruhi holder tersebut. Karena itu admission exclusivity dan complete last-handle accounting adalah dua proof obligations berbeda.

## J. DuplicateHandle threat assessment

E03/E04/E10/E17/E24 memisahkan API prerequisites, effective grants dan hypothetical impact. No-duplication source path tidak membuktikan external impossibility. Host control memory dan gate artifacts juga harus tidak writable oleh worker; nonce/hash bukan isolasi terhadap actor yang benar-benar memiliki equivalent write/VM capabilities.

Temuan source berikut dicatat tanpa memperbaiki source atau menjalankan exploit. F01/F02 conditional gaps pada candidate yang masih locked, bukan observed breach; F03/F04 adalah batas penggunaan synthetic authority.

| ID | Source | Class | Finding | Risk | Disposition |
| --- | --- | --- | --- | --- | --- |
| F01 | S02 R3Native.cs:33-46; S08 FromNative:25 | SOURCE_VERIFIED | Dormant candidate mints exclusive native proof from local creation/limits/empty-query/flags plus structural assumptions; no effective process/job access-control verification | Unsuitable to unlock while external authority unproven | Record only, guard stays closed; prior source unchanged |
| F02 | S01 R3Native.cs:15-27 | ANALYSIS_SUPPORTED | Local hash/JSON gates detect drift but source does not establish worker inability to rewrite control artifacts or supervisor memory | Equal-capability attacker with actual write/VM access could undermine application gates; capability not observed | Require OS control-file/memory fencing and actual capability evidence; no exploit or modification |
| F03 | S10 supervisor.ts:122-131,173-189 | SOURCE_VERIFIED | Fixed synthetic harness uses reported descendant PIDs/completion and PID-liveness checks for synthetic outcomes | Cannot reuse as untrusted production complete-scope/exit authority | No worker-supplied PID used to choose native termination/job admission in reviewed path; stopRun uses retained ChildProcess. No fix in R4 |
| F04 | S11 recovery.ts:14-31; S12 repository.ts:189-232 | SOURCE_VERIFIED | Synthetic trusted-host labels/schemas are not OS attestations; recovery stays dispatch CLOSED/retry false | Caller must remain authenticated trusted host in any future wiring | Retain quarantine and old owner/generation; no DB action |

## K. Handle inheritance review

**Source S03/S04/S07; P02/P03:** R3 job/process/thread attrs NULL, bInheritHandles=false, intended handle-flag checks, CREATE_NO_WINDOW dan tidak ada stdio/pipe setup dalam candidate ini. Tidak ada PROC_THREAD_ATTRIBUTE_HANDLE_LIST di R3 karena intended inheritance kosong. JOB_LIST bukan HANDLE_LIST; membership assignment tidak memberi child authority atas control handle.

Pinned SDK pipe branch membentuk list stdin/stdout/stderr dan SecurityEnvironmentStartupInfo memasang HANDLE_LIST jika ada. D08 mewajibkan bInheritHandles=true untuk explicit inherited handle list; itu berbeda dari mode R3 yang false. Selected actual MXC stdio mode, granted masks, synchronization handles dan full handle population belum diukur. Console/pipe handles tidak boleh digeneralisasi menjadi izin mewariskan supervisor/job handles.

| ID | Invariant | Finding | Source | Status |
| --- | --- | --- | --- | --- |
| H01 | Private job noninherited | R3 Setup/Verify and false inheritance; intended only | S02/S03 | SOURCE_VERIFIED |
| H02 | Supervisor process handle not supplied | No job/supervisor handle exported by new candidate | S03/S04 | SOURCE_VERIFIED |
| H03 | Only authorized worker handles | R3 fixed fixture inherits none; future actual worker population unknown | S04/P03 | NOT VERIFIED |
| H04 | No unnecessary inheritance | R3 false; pinned MXC pipe branch uses bounded HANDLE_LIST | S04/P02/P03 | SOURCE_VERIFIED |
| H05 | Required inheritable handles documented | R3 none; SDK pipe handles source-listed, masks/effective selected branch unknown | P02/P03 | SOURCE_VERIFIED |
| H06 | Explicit duplicate ownership | Ledger design; no local duplicate operation; external unproven | S08 | DESIGN_SPECIFIED |
| H07 | No omitted duplicate job handles | Required invariant, external population not measured | S08 | NOT VERIFIED |
| H08 | No false last-close claim | Model distinguishes SOLE/ADDITIONAL/UNKNOWN; native proof incomplete | S08 | SOURCE_VERIFIED |
| H09 | IPC must not convey host authority | No R3 generic worker IPC/admission path; future production IPC unverified | S04/S10 | DESIGN_SPECIFIED |
| H10 | Inheritance != duplication | Separate access routes/mitigations | D04/D05 | ANALYSIS_SUPPORTED |

## L. Existing-handle and last-handle risk

**Inference from D04/D09/D17:** actual handles yang telah diberikan harus dianalisis sebagai capabilities tersendiri. Mengganti future access policy tidak boleh dianggap menutup external handles yang sudah ada. R4 tidak menutup handle milik proses lain.

R3 Case B tetap valid secara conditional: independent exclusive termination scope dapat mengizinkan emergency job cleanup meskipun identities belum lengkap. Jika additional holder hanya QUERY dan tidak bisa assign/modify policy, admission scope belum tentu hilang, tetapi last-close timing tetap tidak assured. Proven foreign admission memaksa Case C. TerminateJobObject success tetap bukan independent all-member exit receipt.

| ID | Lifetime scenario | Rule | Limit | Class |
| --- | --- | --- | --- | --- |
| L01 | No duplicate | A sole handle only if independently established | Local absence of DuplicateHandle is insufficient to prove external absence | ANALYSIS_SUPPORTED |
| L02 | Trusted internal duplicate | Track holder/mask/transfer/close exactly | All trusted handles must actually close; scope may remain exclusive | ANALYSIS_SUPPORTED |
| L03 | Worker inherits job handle | Untrusted lifetime/control capability | Rights decide admission risk; any retained job handle affects final close | ANALYSIS_SUPPORTED |
| L04 | Unauthorized duplicate | Scope and lifetime reassessed separately | ASSIGN/SET rights threaten scope; QUERY-only still threatens last-close timing | ANALYSIS_SUPPORTED |
| L05 | Supervisor normal exit | Own handles closed by OS | No claim that external holders closed or every member exit observed | ANALYSIS_SUPPORTED |
| L06 | Supervisor crash | Conditional last-close OS expectation | No surviving receipt writer; quarantine unresolved | ANALYSIS_SUPPORTED |
| L07 | Actual last handle closes | Configured kill-on-close effect documented | Still require independent target exit accounting for cleanup PASS | ANALYSIS_SUPPORTED |
| L08 | Last close uncertain | No kill-on-close guarantee | Do not retain forever merely due unknown identity; no invented broad cleanup | ANALYSIS_SUPPORTED |
| L09 | KILL_ON_JOB_CLOSE configured | Only actual final handle triggers documented effect | Configuration/readback currently source-only | ANALYSIS_SUPPORTED |
| L10 | Exit receipts unavailable | Request/close results retained separately | Final process accounting unresolved | ANALYSIS_SUPPORTED |
| L11 | Some identities unknown | Identity uncertainty alone does not revoke independently proven scope | Case B emergency owned-job action allowed conditionally; INCONCLUSIVE accounting | ANALYSIS_SUPPORTED |
| L12 | Termination scope independently proven | Scoped TerminateJob can be allowed despite partial identity | Still require receipts; extra query-only holders need not imply foreign admission | ANALYSIS_SUPPORTED |
| L13 | Scope unknown | No broad job termination/implicit kill-on-close assumption | Only independent original capability; deny launch before target exists | ANALYSIS_SUPPORTED |
| L14 | Unauthorized membership attempted | Evaluate actual granted ASSIGN/SET capability and provenance | Proven foreign admission compromises scope; no PID guessing | ANALYSIS_SUPPORTED |
| L15 | External duplicate retained | Job lifetime may exceed supervisor lifetime | No sole-handle claim, no automatic retry/takeover | ANALYSIS_SUPPORTED |

## M. Worker token/integrity model

**Unverified:** WORKER_TOKEN_RUNTIME_NOT_VERIFIED. Host/worker token IL, process/job mandatory labels, TokenMandatoryPolicy, restricting SIDs, deny-only groups, enabled privileges, AppContainer/capability facts dan PSEC effective policy tidak mempunyai relevant current receipt. Tidak diasumsikan worker IL < host IL. Ordinary R3 CreateProcess fixture bukan sandboxed-worker implementation.

**Documentation D06/D11/D15/D16:** MIC menambah mandatory restrictions, tidak menggantikan DACL/granted capabilities. Equal IL tidak mengisolasi proses. Lower IL dapat membatasi up-access sesuai policy; default no-write-up bukan no-read-up atau path allowlist. Restricted-token restricting-SID access checks berbeda dari sekadar membuang satu privilege. AppContainer adalah mekanisme distinct; PSEC source branch tidak otomatis membuktikan exact token flags atau process-access denials.

Worker yang sudah memegang host capability harus ditolak sebelum admission; changing its future token/descriptor tidak diasumsikan menghapus existing grants. Tidak ada token query/mutation/IL change/elevation dilakukan R4.

## N. Sandbox enforcement evidence

**Source P02/P03:** pinned SDK memiliki CreateProcessSecurityEnvironment/PSEC attachment dan conditional stdio HANDLE_LIST. P01 memiliki UI Job Object. Ini menambah source intent yang relevan, tetapi tidak membuktikan actual effective supervisor/worker DACL, labels, privileges atau handle rights pada pinned configuration.

**Historical observation:** S5/S6/S7/S8/S9 menguji bounded filesystem/network/cooperative-child behavior; source/policy dan hasil itu tidak menguji worker OpenProcess(PROCESS_DUP_HANDLE) terhadap supervisor. Future-file timing dan process-lifecycle gaps tetap historis. Tidak ada transplantasi PASS lama menjadi process-object isolation.

**Current observation:** pinned Codex executable absent; R4 tidak menjalankan versi lain. Actual selected backend/policy, inherited handles dan worker token tetap NOT VERIFIED. Jadi belum dapat disimpulkan existing MXC sudah cukup atau pasti gagal mengisolasi handles.

## O. Same-user malicious process analysis

**Analysis:** same account bukan otomatis trusted dan bukan otomatis full access. Effective SID/group attributes, object owner/DACL, MIC, sandbox restrictions, requested mask, privileges dan existing grants menentukan kemampuan. Equal IL saja tidak memberi mandatory separation. Dangerous rights bisa diberikan melalui ordinary access check tanpa SeDebug; sebaliknya API existence tidak membuktikan grant.

Plain cooperative supervisor tidak merupakan boundary terhadap equivalent-capability attacker yang benar-benar dapat menulis host memory/control files atau memperoleh DUP/WRITE_DAC. Kemampuan itu sendiri belum dibuktikan bagi actor aktual. Owner-right paths perlu dievaluasi; sekadar application nonce/encryption/CAS tidak menutupnya.

T10 tetap explicit unresolved threat. T13/T14 tidak memperoleh ordinary-app resistance guarantee; tidak dianggap selesai/out-of-scope untuk menaikkan gate. Bila objective menuntut resistance terhadap stronger actor itu, perlu architecture/security decision tersendiri. Tidak ada administrator/service/VM dipilih secara default.

## P. Threat actor matrix

Tidak ada actor dihapus untuk memperoleh PASS. Boundary labels adalah klasifikasi analisis, bukan bukti effective privilege.

| Actor | Description | Trust/threat classification | Required invariant | Class |
| --- | --- | --- | --- | --- |
| T01 | Trusted host | Trusted control-plane; backend/startup not active-worker integration | Host-owned issuance, publication and receipts; process/token boundary still needs OS proof | SOURCE_VERIFIED |
| T02 | Trusted test supervisor | Trusted fixed R3 candidate, not executed | Custody logic exists; actual descriptor/token unknown | SOURCE_VERIFIED |
| T03 | Untrusted sandboxed coding worker | Required adversary, not voluntarily cooperative | Must not acquire host control capabilities; actual permissions NOT VERIFIED | ANALYSIS_SUPPORTED |
| T04 | Worker child | Same adversarial treatment as worker | No parent/PPID shortcut; descendants need same confinement | ANALYSIS_SUPPORTED |
| T05 | Worker seeking supervisor handles | In scope | Effective process access check required | ANALYSIS_SUPPORTED |
| T06 | Worker inheriting/duplicating handles | In scope | Inheritance and duplication separately constrained | ANALYSIS_SUPPORTED |
| T07 | Worker changing job membership | In scope | ASSIGN/SET_ATTRIBUTES/WRITE_DAC paths must be blocked | ANALYSIS_SUPPORTED |
| T08 | Worker escaping filesystem scope | In scope | Physical filesystem enforcement required independently of CAS | ANALYSIS_SUPPORTED |
| T09 | Cooperative same-user application | Cooperative behavior assumption only, not security isolation | Not automatically trusted with control handles | ANALYSIS_SUPPORTED |
| T10 | Malicious same-user application | Explicit unresolved adversary; not silently excluded | Same account neither proves access nor isolation | ANALYSIS_SUPPORTED |
| T11 | Lower-integrity process | Adversarial if untrusted | MIC policy/labels must be checked; no assumed worker IL | ANALYSIS_SUPPORTED |
| T12 | Equal-integrity process | Adversarial if untrusted | Equal IL does not isolate; evaluate token/DACL/existing rights | ANALYSIS_SUPPORTED |
| T13 | Elevated/debug-capable actor | No ordinary-app resistance established; no automatic scope exemption | Separate architecture/threat decision if stronger guarantee required; no elevation proposed | ANALYSIS_SUPPORTED |
| T14 | Compromised kernel/OS | TCB failure; no user-mode containment guarantee established | No exclusion adopted to pass a gate; system-security architecture decision separate | ANALYSIS_SUPPORTED |

## Q. External handle attack matrix E01-E25

Seluruh scenarios berikut hypothetical/documented capability analysis, bukan observed exploit. Actual attacker capability **NOT VERIFIED** pada semua25; E04/E05 memiliki documented-route conclusion saja. Current evidence S/P/historical, tidak ada access experiment. Tabel pertama menyatakan prasyarat/impact; tabel kedua existing mitigation/gap/future verification. Kedua tabel digabung berdasarkan E ID.

| ID | Scenario | Attacker | Target | Required capability | Actually granted | Impact | Docs/source | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Worker inherits Job handle | worker | job handle | Inheritable job handle + actual inherited creation | NOT VERIFIED | Lifetime retention; rights may allow assign/terminate | D05/D19; S03/S04 | NOT VERIFIED |
| E02 | Worker inherits supervisor handle | worker | supervisor process | Inheritable supervisor handle + creation path | NOT VERIFIED | Host rights dependent on granted mask | D05/D08; S04 | NOT VERIFIED |
| E03 | Worker obtains supervisor DUP handle | worker | supervisor process | PROCESS_DUP_HANDLE granted to source process, useful source handle and permitted destination | NOT VERIFIED | Control handle duplication or process capability amplification | D02/D04/D12; S02 | NOT VERIFIED |
| E04 | DuplicateHandle without process rights | worker | supervisor handles | Missing required PROCESS_DUP_HANDLE means duplication cannot proceed by this API | NOT VERIFIED | Expected denial, not observed enforcement | D04; S02 | ANALYSIS_SUPPORTED |
| E05 | Open unnamed job by name | worker | private job | Name-based reopening requires named object | NOT VERIFIED | No direct named-open path for this unnamed job | D09; S03 | ANALYSIS_SUPPORTED |
| E06 | Job handle through exposed IPC | worker | host IPC/control broker | Authorized/broken broker transfers or uses job capability | NOT VERIFIED | Confused-deputy assignment/termination | D01/D08; S04/S10 | NOT VERIFIED |
| E07 | Query-only job capability | worker | job | Granted JOB_OBJECT_QUERY; no mutation rights assumed | NOT VERIFIED | Can observe; holding even read-only job handle can delay last close | D03/D09; S08 | NOT VERIFIED |
| E08 | Worker assigns to job | worker | job membership | JOB_OBJECT_ASSIGN_PROCESS plus legitimate process assignment rights/constraints | NOT VERIFIED | Foreign membership defeats exclusive termination scope | D03/D20; S03/S04 | NOT VERIFIED |
| E09 | Worker terminates job | worker | job scope | JOB_OBJECT_TERMINATE granted | NOT VERIFIED | Unauthorized DoS/early exit, receipts become uncertain | D03; S05 | NOT VERIFIED |
| E10 | Worker duplicates and retains job | worker | job lifetime | Usable DUP capabilities/source handle; any retained job handle | NOT VERIFIED | KILL_ON_JOB_CLOSE delayed; stronger rights may alter scope | D04/D09; S08 | NOT VERIFIED |
| E11 | Excessive inherited rights | worker | host control objects | Unexpected inherited high-rights handle | NOT VERIFIED | Bypasses need to reopen restricted object | D05/D08; S03/S04 | NOT VERIFIED |
| E12 | Same-user opens supervisor | same-user malicious process | supervisor | Token/SD/MIC/privilege access check actually grants requested mask | NOT VERIFIED | Depends on exact mask; not automatic access | D12/D13; S02 | NOT VERIFIED |
| E13 | Equal-integrity same-user actor | same-user malicious process | host | Equal IL alone is not a granted handle | NOT VERIFIED | No MIC separation; DACL/restriction/existing handles decisive | D06/D13/D18; S02 | NOT VERIFIED |
| E14 | Lower-IL attacks medium host | worker | host | Relevant token/object labels, mandatory policy, access mapping | NOT VERIFIED | MIC may block prohibited up-access; not universal secrecy guarantee | D06/D16; S02 | NOT VERIFIED |
| E15 | Elevated attacks non-elevated host | elevated actor | host | Applicable enabled privileges/access rights, not elevation name alone | NOT VERIFIED | Ordinary host may not resist | D12; S02 | NOT VERIFIED |
| E16 | Enabled powerful/debug privilege | privileged actor | host process/handles | Actual privilege available/enabled and applicable object protections | NOT VERIFIED | May bypass discretionary checks for ordinary processes | D12/D02; S02 | NOT VERIFIED |
| E17 | Existing handle after policy change | existing capability holder | process/job handle | Previously granted usable handle | NOT VERIFIED | New DACL alone not assumed to revoke old capability | D17/D04; S08 | NOT VERIFIED |
| E18 | Inherited handle prevents final close | worker | job lifetime | Any unaccounted inherited job handle remains open | NOT VERIFIED | Supervisor close need not trigger kill-on-close | D05/D09; S08 | NOT VERIFIED |
| E19 | Nested job access reaches descendants | holder of ancestor job capability | nested jobs | Applicable ancestor handle rights and actual hierarchy | NOT VERIFIED | Broader control/accounting scope than parent PID tree | D03/D10; P01 | NOT VERIFIED |
| E20 | Escape expected process hierarchy | worker/child | cleanup scope | Launch/breakaway/broker route bypasses expected tree | NOT VERIFIED | PID/PPID traversal misses scope or external effects | D09/D10; S04 | NOT VERIFIED |
| E21 | Supervisor closes, external holder remains | external holder | job lifetime | Valid retained job handle | NOT VERIFIED | No last-close guarantee; explicit scoped termination is separate | D09; S08 | NOT VERIFIED |
| E22 | Crash without independent observer | supervisor failure | target exits/receipt store | Supervisor dead or receipt missing | NOT VERIFIED | Conditional OS cleanup expectation; exit status unresolved | D09; S08/S11 | NOT VERIFIED |
| E23 | Unauthorized supervisor DACL mutation | worker/equal-privilege actor | supervisor SD | WRITE_DAC or relevant owner/privilege path actually usable | NOT VERIFIED | Can grant dangerous access then duplicate/terminate | D13/D18; S02 | NOT VERIFIED |
| E24 | Host-process handle but no job handle | worker | supervisor/process capability | Mask-dependent: QUERY-only not DUP; DUP can expose handles/pseudo-handle route | NOT VERIFIED | No blanket escalation from any handle; DUP is critical | D02/D04; S02 | NOT VERIFIED |
| E25 | Real worker token unmeasured | real worker | entire host/worker boundary | Unknown actual PSEC/token/restrictions/IL/handles | NOT VERIFIED | Cannot claim denied control or safe cleanup | D06/D11/D15; P02/P03 | NOT VERIFIED |

| ID | Existing mitigation/evidence | Missing mitigation / required future verification | Current evidence limit |
| --- | --- | --- | --- |
| E01 | R3 false inheritance; no job export | Inspect actual worker handle allowlist/flags | Source/historical only; no runtime access experiment |
| E02 | No intentional export in R3 | Verify worker receives no dangerous host handles | Source/historical only; no runtime access experiment |
| E03 | No external-access proof | Verify access denial for exact worker token and original SD | Source/historical only; no runtime access experiment |
| E04 | Documented required rights only | Future scoped denial outcome, error + zero duplicate | Source/historical only; no runtime access experiment |
| E05 | CreateJobObject name=NULL | Ensure future source never introduces shared name; no live open in R4 | Source/historical only; no runtime access experiment |
| E06 | R3 no worker-controlled admission interface | Review future endpoint SD, authorization and handle transfer | Source/historical only; no runtime access experiment |
| E07 | Rights separation documented | Query != assign/terminate; account for lifetime of every holder | Source/historical only; no runtime access experiment |
| E08 | Fixed local route, intended active limit1 only | Deny worker assignment; prove access and membership provenance | Source/historical only; no runtime access experiment |
| E09 | No export intent | Exact deny result and authenticated host-only cleanup authority | Source/historical only; no runtime access experiment |
| E10 | Ledger model only | Track trusted duplicates; exclude unauthorized retention | Source/historical only; no runtime access experiment |
| E11 | R3 bInheritHandles=false source | Audit explicit IPC/stdio handle masks in actual selected path | Source/historical only; no runtime access experiment |
| E12 | No current descriptor evidence | Read exact access evidence, no blanket same-user assumption | Source/historical only; no runtime access experiment |
| E13 | No equivalent-privilege exclusion proven | Evaluate principal/owner/rights relationships | Source/historical only; no runtime access experiment |
| E14 | Actual host/worker IL unknown | Measure exact labels/policy and operation outcomes | Source/historical only; no runtime access experiment |
| E15 | No ordinary-app privileged-adversary guarantee | Separate stronger-isolation decision if required | Source/historical only; no runtime access experiment |
| E16 | No SeDebug enable/query/experiment in R4 | Do not promise resistance or assume every admin has it enabled | Source/historical only; no runtime access experiment |
| E17 | No retroactive revocation claim | Prove no pre-granted dangerous handles before admission | Source/historical only; no runtime access experiment |
| E18 | R3 intended no inheritance, not observed | Inspect worker handle set and record authorized holders | Source/historical only; no runtime access experiment |
| E19 | No MXC hierarchy measured | Verify rights, hierarchy and exclusive subtree ownership | Source/historical only; no runtime access experiment |
| E20 | R3 fixed no-child fixture; no arbitrary-worker proof | Verify full sandbox admission/descendant and filesystem enforcement | Source/historical only; no runtime access experiment |
| E21 | Model distinguishes close from exit | Prevent/custody-account holders before launch | Source/historical only; no runtime access experiment |
| E22 | R3 crash design only; S15 quarantine | No deliberate crash R4; separate future crash acceptance | Source/historical only; no runtime access experiment |
| E23 | No explicit process-SD hardening/readback | Evaluate owner rights as well as named deny ACEs | Source/historical only; no runtime access experiment |
| E24 | No source export, actual grants unknown | Obtain actual granted mask, distinguish each requested right | Source/historical only; no runtime access experiment |
| E25 | Pinned source intent + limited historical probes | Bind effective token/SD/handle evidence to exact runtime/image/invocation | Source/historical only; no runtime access experiment |

## R. Boundary A/B/C comparison

| Boundary | Supported now | Required security meaning | Remaining issue | Owner implication |
|---|---|---|---|---|
| A - cooperative same-user host | Source cooperative fixture intent only; no R3 OS test | Trust other components not to steal capabilities | Not a malicious worker/equal-privilege isolation guarantee | Excluding previously in-scope malicious same-user actor requires explicit Owner approval; not adopted |
| B - host plus sandboxed untrusted worker | Desired candidate; PSEC/allowlist source intent, actual controls NOT VERIFIED | OS denies worker/children host-control handles, unauthorized filesystem/control-plane access | Exact token/SD/granted-mask/access outcomes absent | Existing security objective retained; implementation/runtime changes require separate authorization |
| C - malicious equal-privilege same-user actor | No effective isolation proof; retained unresolved | Must resist applicable same-user capability/owner/memory/access attacks | May need independently enforced token/principal/capability isolation; no verified solution selected | Material TCB/architecture or threat-scope change needs separate decision, not silently accepted |

B adalah minimum worker isolation candidate, bukan alasan menutup C. Current evidence mendukung source-local custody intent; tidak cukup menerima B atau C sebagai enforced boundary. Existing project host-owned authority objective dan prompt R4 melarang voluntary worker enforcement; tidak otomatis memberi persetujuan menghapus T10. Tidak ada material boundary change diadopsi pada R4.

## S. Proposed AI OFFICE trust boundary

**DESIGN_SPECIFIED, conditional:** host dan trusted supervisor memegang authority issuance/launch/job creation/admission/termination/cancellation/terminal receipts/recovery/output publication. Worker dan seluruh children adversarial; hanya boleh mendapat bounded I/O/task data serta melaporkan observations. Worker-supplied PID, handle value, nonce/source label atau completion claim tidak menciptakan authority. Worker boleh berhenti sendiri; larangan dangerous rights diarahkan ke host/control objects/other attempts, bukan janji mencegah self-exit.

Predicate sebelum real worker: actual worker context tidak dapat memperoleh host DUP/terminate/memory-mutation/SD-mutation control, tidak menerima exposed dangerous capability, tidak bisa mengubah job admission/cleanup policy/control artifacts atau melewati physical filesystem scope. Host harus tetap punya original cleanup/observation handles. Semua broker paths dan descendants tercakup. Actual deny outcomes belum tersedia.

Source audit: S10 worker messages memengaruhi synthetic readiness/completion/descendant observations, tetapi tidak memilih native terminate/job-admit target; stopRun memakai retained ChildProcess. Ini bukan production complete-scope proof. S11/S12 synthetic labels dan durable CAS juga tidak menjadi OS attestation. Production integration absent di S13/S14. Tidak ada source diperbaiki.

Kemungkinan existing PSEC memenuhi predicate tanpa global OS changes tetap terbuka; belum ada bukti menerima/menolak. Jika tidak memenuhi, kontrol per-object/token pun membutuhkan authorization baru dan compatibility analysis; R4 tidak menerapkannya.

## T. Required OS controls

C01-C15 dievaluasi design-only. Core blockers memerlukan **hasil kontrol** (deny dangerous actor capabilities + safe custody/lifetime), bukan wajib menginstal semua opsi sekaligus. C04/C05/C06/C07/C08 adalah alternatif/complement yang harus dipilih berdasarkan effective evidence; tidak ada least-privilege recipe yang dijamin untuk token yang belum diketahui.

Minimal assessment order: verify actual existing OS enforcement; audit explicit no-inherit/least rights/broker route; jika grants terlalu luas, ajukan smallest per-object/worker-capability design secara terpisah. Jangan default ke administrator/service atau melemahkan sandbox. Application encryption/nonce tidak menggantikan process-object protection.

| ID | Control option | Threats | OS/application mechanism | Privileges needed | Complexity | Actual blocker addressed |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | Strict noninheritance | E01/E02/E11/E18 | bInheritHandles=false or exact HANDLE_LIST; verify flags | Own creation; no elevation | Low | Closes inheritance route, not external DUP |
| C02 | Minimal handle rights | E07/E08/E09/E24 | Grant only required masks; retain host original capability privately | API-dependent own-handle management | Medium | Limits leaked authority; does not remove DUP process threat |
| C03 | Worker-visible allowlist | E01/E02/E06/E11 | Explicit minimal stdio/IPC list, not job control | Own process creation | Medium | Controls inheritance only |
| C04 | Supervisor process SD | E03/E12/E23/E24 | Creation-time SD + owner rights + deny dangerous worker access | Creation authority/WRITE_DAC for owned object if allowed | High | Directly addresses supervisor DUP/VM/terminate rights |
| C05 | Job Object SD | E08/E09/E19 | Explicit least-capability descriptor and readback | Owned creation/WRITE_DAC if later changed | Medium | Protects new access; not substitute for process SD |
| C06 | Restricted worker token | E03/E12/E23/E25 | Restricting SIDs, privileges/deny-only groups; actual access checks | Exact launch requirements must be verified; no SeDebug assumption | High | Potential actor capability separation, not measured |
| C07 | Worker integrity separation | E13/E14 | Exact token IL/object labels/mandatory policy | No host elevation assumed; lowering/launch requirements unverified | Medium | Supplement DACL; alone insufficient |
| C08 | Host/worker identity separation | E12/E13/E15/E16 | Distinct security principal/sandbox capability or stronger isolation | Depends on chosen architecture; no service/admin default | High | Stronger same-user threat separation, not yet demonstrated |
| C09 | Independent trusted lifecycle observer | E21/E22 | Host-owned observer with verified scope/custody/finite cleanup | No elevation assumed | High | Crash observation aid; not own proof of exclusivity |
| C10 | Authenticated private IPC | E06/E11/E23 | Endpoint SD + authenticated attempt/owner/generation; no raw handle grants | Own endpoints; impersonation not assumed | Medium | Message authority only in combination with OS controls |
| C11 | Host-owned output staging | E20/E25 | OS-enforced worker denies for production/DB/control/evidence + host publication | Chosen sandbox mechanism requirements unknown | High | Prevents direct effects bypassing authoritative publication |
| C12 | Recovery quarantine | E17/E22/E25 | Preserve owner/generation; dispatch CLOSED; retryAuthorized=false | Application authority, not OS privilege | Low | Limits restart/takeover damage; not access isolation |
| C13 | Controlled atomic admission | E08/E19/E20 | Fixed job list before resume + deny alternative/broker routes | Own target creation/job assignment capability | Medium | Admission continuity; needs actor/handle-access boundary |
| C14 | Independent termination receipts | E09/E21/E22 | Original handle identity, bounded signal/code, member accounting | Legitimate retained query/wait/termination rights | High | Observability/cleanup proof, not permission denial |
| C15 | Custody ledger | E10/E17/E18/E21 | Explicit owner/transfers/rights/dependencies/one close attempt | Application memory; trusted process boundary | Medium | Necessary local accounting; not external exclusion |

| ID | Architecture/pinned MXC compatibility | Operational risk | System change | Separate authorization | Class |
| --- | --- | --- | --- | --- | --- |
| C01 | R3 source intent; MXC selected stdio mode still needs measurement | Future IPC may require small inherited set | No machine-wide change | Future implementation/experiment only | DESIGN_SPECIFIED |
| C02 | Current creation APIs return broad handles; no attenuation in R3 | Rights attenuation must preserve atomic admission/wait/cleanup | No machine-wide change | Separate source/native authorization | DESIGN_SPECIFIED |
| C03 | P03 has source allowlist; R3 currently inherits none | Codex stdio/IPC compatibility unverified | No machine-wide change | Separate implementation/runtime authorization | DESIGN_SPECIFIED |
| C04 | Not specified/read back in R3; pinned actual context unknown | Same-user SID/owner cannot be separated merely by process name | Object security change; prohibited in R4 | Explicit separate approval for any SD change | DESIGN_SPECIFIED |
| C05 | R3/P01 use defaults; no effective DACL receipt | Does not revoke a previously duplicated all-access handle | Object security change; prohibited in R4 | Explicit separate approval | DESIGN_SPECIFIED |
| C06 | PSEC path is not proved equivalent to measured restricted token | Toolchain/IPC/filesystem compatibility unknown | Token mutation; prohibited in R4 | Explicit separate approval | DESIGN_SPECIFIED |
| C07 | No worker<host relation established | MIC not filesystem path policy or confidentiality proof | Token/label mutation prohibited in R4 | Explicit separate approval | DESIGN_SPECIFIED |
| C08 | Potential Boundary B/C design; pinned compatibility unknown | Changes TCB/deployment may be material | May require new OS capabilities/config; not performed | Material architecture decision before adoption | DESIGN_SPECIFIED |
| C09 | No production integration; MXC helper ownership differs | Observer must itself be protected; cannot manufacture lost exits | No service/task default | Separate topology/runtime authorization | DESIGN_SPECIFIED |
| C10 | Synthetic nonce exists; production channel unverified | Cannot stop equal-privilege memory/control-file compromise alone | Endpoint SD change prohibited in R4 | Separate implementation/security authorization | DESIGN_SPECIFIED |
| C11 | Future design; DB CAS alone is not physical fence | Pinned future-file timing gaps remain relevant | No actual FS/ACL change | Separate enforcement/runtime authorization | DESIGN_SPECIFIED |
| C12 | S15 source already dormant/test-only | Cannot kill a live process or undo writes | None in this audit | Production integration separate | DESIGN_SPECIFIED |
| C13 | R3 source path only; SDK internal assign path distinct | MXC nesting/limits not verified | No global change | Separate runtime authorization | DESIGN_SPECIFIED |
| C14 | R3 models; no R3 native receipt | Success request != every exit; crash may lose observer | None in audit | Separate runtime authorization | DESIGN_SPECIFIED |
| C15 | R3 source exists; external holders cannot be wished into ledger | No global handle population attestation | None in audit | Implementation/runtime validation separate | DESIGN_SPECIFIED |

## U. Future runtime verification plan

**BLOCKED; not an execution proposal approved by R4.** Minimum additional package berikut harus bound ke exact executable/source/policy/invocation, bukan generic same-user shell. Actual absent objects tetap NOT CREATED/NOT VERIFIED.

| ID | Minimum evidence / gated future verification |
|---|---|
| V01 | Exact host/supervisor process SD owner/DACL/mandatory label; intended job SD and child/thread SD separately. GetSecurityInfo on owned authorized objects only. READ_CONTROL for owner/group/DACL and LABEL_SECURITY_INFORMATION (D07/D16); full SACL query is different and privilege enabling forbidden. No job created just to fill this field in R4. |
| V02 | Exact creator/worker primary or effective impersonation token metadata: user/owner relationship, enabled/deny-only/restricting SID attributes, IL/mandatory policy, privileges, AppContainer/capabilities/PSEC configuration and provenance. Future OpenProcessToken(TOKEN_QUERY)/GetTokenInformation only if separately authorized; no raw token/credentials, no token modification. Source policy alone not runtime token. |
| V03 | Original process/thread/job handle granted masks, inheritance flags, intended/actual allowed holders and custody transfers, existing-capability provenance; actual nested hierarchy. No global invasive handle scan or duplication of unrelated/live handles. Known QUERY-only extra holder distinguished from ASSIGN-capable actor. |
| V04 | Only after independently safe containment/cleanup and separate Owner authorization: scoped access-denial observations for dangerous masks from exact worker-equivalent context to test-owned supervisor/control objects. No inference from one mixed-mask failure; each right distinguished. No live duplication/termination against unrelated applications. |
| V05 | Separately authorized original-handle identity/exit and owned job membership/cleanup evidence; request acceptance separate from exits. Crash and arbitrary descendants remain separate gates. |
| V06 | Separately authorized physical filesystem/IPC/control-artifact fences and host-owned publication; DB CAS is not an OS write deny. |

Untuk next evidence-only step, topology **0 workers/0 children/0 test jobs**; hanya relevant existing owner-controlled metadata atau intended exact configuration yang dapat dibaca aman. Jika actual object/token belum ada, stop dengan missing-field inventory, jangan launch. Obtaining relevant nonexisting objects/token memerlukan scoped authorization baru; R4 tidak memperpanjang izin tersebut.

Future process-control experiment belum layak dijadwalkan: topology/custody observer/target/last-close scope serta finite failure cleanup harus ditetapkan sesudah V01-V03 memadai. Tidak ada R5 process budget atau launch permission yang disahkan di sini. No retry/takeover after unknown results. Stop pada privilege need, unowned object, unexpected holder, candidate mismatch, altered evidence atau unresolved cleanup.

G01-G20 berikut readiness checklist pada design level, bukan runtime authorization bahkan bila semuanya suatu hari terpenuhi.

| ID | Readiness requirement | Status | Finding | Runtime |
| --- | --- | --- | --- | --- |
| G01 | Private-job architecture reviewed | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G02 | Job-handle source ownership | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G03 | Original process-handle source ownership | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G04 | Unintended inheritance path | NOT VERIFIED | R3 source intent known; actual worker handle population not verified | NOT AUTHORIZED |
| G05 | DuplicateHandle threat | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G06 | Process-DACL requirements | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G07 | Job-DACL requirements | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G08 | Integrity boundary assessed | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G09 | Worker-token assumptions classified | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G10 | Same-user threat classified | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G11 | Unnamed job limitation | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G12 | Last-handle uncertainty | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G13 | Admission scope defined | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G14 | Synthetic termination scope defined | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G15 | Unknown membership disposition | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G16 | Crash limits | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G17 | Required future evidence | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G18 | Security-control changes identified | DESIGN_SPECIFIED | Analysis/design complete; see source/control/attack matrices; not OS acceptance | NOT AUTHORIZED |
| G19 | No unresolved safety-precondition contradiction | INCONCLUSIVE | Effective access boundary and independently safe runtime cleanup not established | NOT AUTHORIZED |
| G20 | No unapproved threat-model relaxation | SOURCE_VERIFIED | A not adopted; B conditional; C unresolved, not excluded | NOT AUTHORIZED |

## V. Independent adversarial review

Separate second pass setelah technical matrices selesai. Reviewer adalah agent yang sama pada pass terpisah, bukan klaim external human atau delegated auditor. Review menantang seluruh20 pertanyaan yang diminta terhadap source/register/tables, bukan memakai previous test count sebagai oracle.

**INCONCLUSIVE** untuk defensibility actual boundary/runtime readiness: essential SD/token/grant/holder facts absent. PASS pada individual reasoning checks berarti tidak ditemukan asumsi salah pada argumen terbatas itu; bukan actual OS test atau keseluruhan safety PASS. Tidak ada unknown mandatory assumption diterima untuk menaikkan final decision.

| No | Adversarial challenge | Result | Answer/limit |
| --- | --- | --- | --- |
| 1 | No malicious same-user actor assumed absent? | PASS | Tidak diasumsikan absent: T10 tetap unresolved di A O/R/S; Boundary A tidak diadopsi. D12/D13 tidak memberi blanket same-user grant. |
| 2 | Worker-token properties not invented? | INCONCLUSIVE | S03/S04 tidak mengukur token; P02/P03 hanya PSEC source intent. V02 diperlukan dan WORKER_TOKEN_RUNTIME_NOT_VERIFIED tetap. |
| 3 | Job DACL separated from supervisor process DACL? | PASS | A F/G/E memisahkan supervisor launcher SD, child NULL attributes S04:88, job NULL attributes S03:73 dan handle slot. |
| 4 | Already granted handles considered? | PASS | E17/L02-L04/V03 menganalisis existing grants; future DACL tightening tidak diklaim mencabut external handles. |
| 5 | Inheritance separated from duplication? | PASS | H01-H10/E01-E04 memisahkan inherited capability dan external DUP route; false inheritance bukan proof denied duplication. |
| 6 | Unnamed job not treated as unduplicable? | PASS | A G/H dan E05 membatasi unnamed claim pada named-open route; E03/E10 mempertahankan conditional duplication path. |
| 7 | Equal IL not assumed isolation? | PASS | T12/E13/A M/O tidak menganggap equal IL sebagai isolation. Effective DACL/token/capabilities tetap diperlukan. |
| 8 | MIC not replacing DACL? | PASS | A M/V01 memakai MIC sebagai tambahan; no-write-up bukan universal no-read/path fence dan LABEL query bukan full SACL. |
| 9 | Default DACL not presumed sufficient? | INCONCLUSIVE | S03/S04 default descriptors terbukti source saja. Actual ACEs, owner rights dan labels tidak tersedia; tidak diasumsikan aman. |
| 10 | DUP capability neither presumed denied nor granted? | INCONCLUSIVE | E03/E04/E12/E24 memisahkan requested rights dan granted capability. No OpenProcess/DUP test; actual grant/deny unknown. |
| 11 | Own close not assumed actual final close? | INCONCLUSIVE | E07/E21/L07-L09 membedakan own close dari actual last close. Additional QUERY-only holder juga dapat menunda trigger; holders unmeasured. |
| 12 | Duplicate/inherited holders considered? | INCONCLUSIVE | H06-H08/L02-L04/E10/E18 mencakup trusted/untrusted inherited/duplicated holders; actual population tidak diattest. |
| 13 | Ownership receipt not treated as all exits? | PASS | A L/T dan R3 Case B tidak mengubah ownership/termination request menjadi all-member exit evidence; receipts native tetap NOT RUN. |
| 14 | Source intent separated from runtime? | PASS | C/D/N dan source register membatasi S/P ke source intent; old229 tests HISTORICAL_ONLY, no source-to-OS promotion. |
| 15 | No unauthorized threat narrowing? | PASS | A R/Z dan R4-46/49/50 mengidentifikasi A sebagai conditional Owner decision, bukan adopted narrowing. C tetap unresolved. |
| 16 | Physical effects separated from DB fencing? | PASS | T08/C11/V06 memisahkan physical writes dari CAS/quarantine. Control artifacts/memory F02 memerlukan OS boundary. |
| 17 | No runtime without independent cleanup? | INCONCLUSIVE | G19/V04-V05/R4-53 tetap blocked. Tidak ada future process-control launch yang layak diotorisasi tanpa independent safe cleanup. |
| 18 | Missing candidate not treated as verified? | PASS | Current candidate absent; P01-P03 source pin bukan binary/runtime/token proof. Tidak restore/substitute/global Codex run. |
| 19 | No unauthorized administrator dependency? | PASS | Tidak ada SeDebug/elevation/security mutation. C06-C08 hanya options; kebutuhan privilege exact future launch tetap belum diverifikasi. |
| 20 | Real worker remains blocked? | PASS | R4-61-R4-69 NOT RUN/NOT VERIFIED/BLOCKED; real worker/app-server/MXC tidak diaktifkan. |

## W. Pinned Codex candidate limitation

Current availability read-only: candidate C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW\candidate\bin\codex.exe absent. Status **MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE**.45 previously missing files were reconciled by R2; no restore/download/reinstall/substitute/alternative runtime/global Codex invocation.

Pinned Microsoft source commit and historical source-register hashes are not current binary/token/permission verification. WORKER_TOKEN_RUNTIME_NOT_VERIFIED remains. Future pinned runtime validation needs separately authorized provenance restoration first, but that is not the next experiment started by R4.

## X. Historical process identity limitations

PID23376 dan23644 tetap **HISTORICAL_PROCESS_IDENTITY_UNRESOLVED**. Tidak dibuka/diterminasi/di-query untuk menyelesaikan uncertainty. Tidak menganggap current absence sebagai historical exit. R4 tidak memperbaiki older S16B cleanup accounting atau mengklaim semua unknown members sudah mati.

## Y. Source/system integrity

R4 baseline:445 existing AI files,122 preexisting git-status entries; user Asset_3D_Model work dan all old reports tetap dipertahankan. Exactly2 new reports membuat final expected447 files/124 git entries. Final audit membandingkan existing content hashes/bytes/reparse metadata serta allowed additions; actual values tersimpan di final-audit.json.

Protected scope: prior R3=67 files ditambah20 protected roots2392 files (R2/R/B/installed Codex/16 fixtures):21 roots2459 files. Hermes3D647 tracked paths/hash preserved. AI excludes .git/directories named node_modules; protected roots fully hashed. No whole-disk/OS attestation or runtime-process-impact claim.

Audit actions only: no native bridge/job/worker/experiment/build/test invocation; no process termination/live handle duplication/invasive OpenProcess; no token/security/IL/SeDebug/elevation/ACL/registry/Defender/UAC/firewall/PATH/service/task/WSL/dependency/DB/state/source mutation. Microsoft documentation/pinned-source web reads occurred; no provider authentication/inference/paid API/credential access. Research traffic is not claimed zero network globally.

Audit-only metadata, source inventories, matrices and reporting scripts are outside repository in the fresh audit root; none is an executable/native bridge/runtime fixture. inventory-manifest.json records actual SHA256 of audit metadata, excluding itself; report hashes/final comparisons in final-audit.json. Historical sources/binaries/fixtures untouched. No destructive cleanup.

## Z. Final classification, next milestone and Owner decisions

**INCONCLUSIVE** karena effective access-control evidence essential belum lengkap. B required candidate; A not adopted; C not silently excluded. No affirmative runtime safety claim and no impossibility claim. R4-01 through69 individually evaluated in companion report; R4-61 through69 remain NOT RUN/NOT VERIFIED/BLOCKED.

**Exactly one next bounded step:** access-control evidence package reconciliation (V01-V03), scoped to relevant existing host-owned metadata/exact intended configuration, with zero worker/process-control experiments. Minimum gaps: supervisor and job effective owner/DACL/labels, relevant worker/PSEC token facts, granted handle masks/holders/inheritance and object provenance. If obtaining them requires creating an object/process/token, stop and obtain separate scope authorization before that future activity. Do not repeat229 tests unless materially relevant source changes.

No routine Owner approval is pending for this completed audit. A decision is needed only if proposing to exclude T10, weaken guarantees, change TCB/isolation architecture, mutate SD/token/IL or authorize runtime. Alternatives: retain full objective and obtain evidence; separately propose stronger per-process isolation if needed; or explicitly request narrower cooperation guarantee with lost protections clearly stated. None adopted. R5/S16C/S17 not started; real worker remains BLOCKED.

**M02-02S16B-R4 INCONCLUSIVE — REQUIRED ACCESS-CONTROL EVIDENCE INCOMPLETE — RUNTIME BLOCKED.**

