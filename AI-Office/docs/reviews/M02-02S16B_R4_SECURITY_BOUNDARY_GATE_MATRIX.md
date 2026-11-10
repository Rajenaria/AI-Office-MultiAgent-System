# M02-02S16B-R4 - Security Boundary Gate Matrix

Tanggal: 2026-11-05. Decision **INCONCLUSIVE**. Audit-only metadata root: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br4-audit-c0d7b634-c593-48a5-980b-7a27c7e7b007. Runtime/worker authorization: NONE. Tidak ada current OS process experiment, new bridge, build atau static-test rerun.

## 1. Evidence classification and decision rule

Allowed actual gate statuses: DOCUMENTED, SOURCE_VERIFIED, HISTORICAL_ONLY, DESIGN_SPECIFIED, ANALYSIS_SUPPORTED, NOT VERIFIED, NOT RUN, INCONCLUSIVE, REQUIRES_OWNER_DECISION, FAILED, BLOCKED. Tidak menggunakan HOST_ONLY_OS_VERIFIED.

Documentation D refs hanya API contract; Source S/P refs hanya inspected code intent; Historical observation hanya receipt lama; Current observation hanya R4 file/hash/availability inspection; Inference adalah reasoning bersyarat; Unverified berarti actual token/descriptor/grants belum diketahui. No current token/DACL/process query dilakukan. No observed exploit/denial claim.

S/P references resolved di bagian2; D refs resolved di bagian3. C controls dan E scenarios resolved di report A T/Q dan JSON audit. V01-V06/G01-G20 resolved di report A U. Semua row menahan runtime/MXC/worker BLOCKED regardless positive documentation/source statuses. REQUIRES_OWNER_DECISION pada R4-46 berlaku hanya jika proposal A hendak diadopsi, bukan boundary change yang telah dilakukan atau routine permission yang ditunggu.

## 2. Exact source references and hashes

S01-S09 berada di prior R3 root yang tidak diubah; S10-S14 source repository. Baris di bawah mengikat source ID ke exact file/line/symbol/hash. Full source/claim analysis dan10 historical report hashes di report A C. Hash preservation bukan effective OS access proof.

| ID | Exact path:line | Symbol | SHA256 |
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

## 3. Official documentation and pinned source references

Seluruh D refs Microsoft documentation; P refs Microsoft SDK source pinned commit b21120168d70befe12356411423266bfef168446. Tidak ada main-branch claim, binary verification atau current worker-token attestation. Raw pinned source dibaca melalui web; no candidate restore/download/execution.

| ID | Primary reference | Evidence limit |
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

## 4. Individually evaluated R4-01 through R4-69

Tabel utama memberi exact source/docs/status/actual evidence/threat implication. Tabel5 memberi required mitigation/future OS evidence/Owner boundary per gate. Join berdasarkan Gate ID; tidak ada gate disembunyikan di aggregate PASS. Status positive berarti requirement analisis/source selesai, bukan access denial proven.

| Gate | Requirement | Source/evidence reference | Official refs | Actual status | Actual evidence and threat implication |
| --- | --- | --- | --- | --- | --- |
| R4-01 | S16B-R3 checkpoint reviewed | S01/S08; R3 manifest and reports | D01 | SOURCE_VERIFIED | 229 tests/build receipts historical only; no rerun |
| R4-02 | Existing evidence preserved | Audit baseline R3+protected | D01 | SOURCE_VERIFIED | Read-only hash comparison |
| R4-03 | Native runtime guard remains closed | S01/S09 | D01 | SOURCE_VERIFIED | No activation artifacts, no source edits |
| R4-04 | No runtime process launched | Audit action record | D01 | SOURCE_VERIFIED | Zero experiment/target/native bridge invocation |
| R4-05 | Supervisor process object identified | S01 R3Native.cs:11; S13 | D02 | SOURCE_VERIFIED | Candidate image identified; no actual supervisor process object exists |
| R4-06 | Private Job Object identified conceptually | S03 R3Native.cs:73 | D03/D09 | DESIGN_SPECIFIED | Current-invocation unnamed job design; not created |
| R4-07 | Process DACL source reviewed | S04:88; S13 | D02/D14 | SOURCE_VERIFIED | Child attributes NULL; supervisor launcher SD remains unknown |
| R4-08 | Job DACL source reviewed | S03:73; P01:214 | D03/D19 | SOURCE_VERIFIED | NULL attrs use defaults; actual DACL unread |
| R4-09 | Default descriptor implications | S03/S04 | D13/D19 | ANALYSIS_SUPPORTED | Default is not proof of permissive or restrictive ACL |
| R4-10 | PROCESS_DUP_HANDLE analyzed | S02; O02/O13 | D02/D04 | ANALYSIS_SUPPORTED | 0x0040 grant decisive, not automatic same-user right |
| R4-11 | PROCESS_TERMINATE analyzed | S05; O01/O02 | D02 | ANALYSIS_SUPPORTED | 0x0001 can undermine supervisor liveness if granted |
| R4-12 | PROCESS_QUERY_INFORMATION analyzed | O01/O02; S04 | D02 | ANALYSIS_SUPPORTED | 0x0400 distinct from LIMITED0x1000, DUP and TERMINATE |
| R4-13 | JOB_OBJECT_ASSIGN_PROCESS analyzed | S03/S04 | D03/D20 | ANALYSIS_SUPPORTED | 0x1 capability plus process-side assignment requirements |
| R4-14 | JOB_OBJECT_TERMINATE analyzed | S05 | D03 | ANALYSIS_SUPPORTED | 0x8 controls whole associated scope |
| R4-15 | JOB_OBJECT_QUERY analyzed | S02; E07 | D03/D09 | ANALYSIS_SUPPORTED | 0x4 is not mutation; any retained job handle can affect final close |
| R4-16 | Job attribute modification rights | S03:75 | D03 | ANALYSIS_SUPPORTED | SET_ATTRIBUTES0x2; WRITE_DAC/OWNER can alter access policy |
| R4-17 | DuplicateHandle prerequisites | E03/E04/E24 | D04/D02 | ANALYSIS_SUPPORTED | Source/destination process rights and usable source handle; pseudo-handle amplification noted |
| R4-18 | Existing-handle implications | O08/O09; L02/L04 | D17/D04 | ANALYSIS_SUPPORTED | Tightening a future DACL not assumed to revoke existing granted capability |
| R4-19 | Handle inheritance analyzed | S03/S04/P03 | D05/D08 | SOURCE_VERIFIED | R3 false; SDK stdio allowlist source; actual worker population unknown |
| R4-20 | Handle duplication analyzed | S02/S08; E03/E10 | D04 | ANALYSIS_SUPPORTED | No local duplicate call is not external denial proof |
| R4-21 | Unnamed job limitations | S03:73 | D09 | ANALYSIS_SUPPORTED | No name-based reopen; duplicable if prerequisites granted |
| R4-22 | Last-handle semantics | S08; L07/L08 | D09 | ANALYSIS_SUPPORTED | Own close != actual final handle != independent exits |
| R4-23 | Duplicate lifetime risk | S08; E07/E10/E21 | D04/D09 | ANALYSIS_SUPPORTED | QUERY-only holder can delay final close without admission mutation |
| R4-24 | Supervisor token assumptions | O02/O10; metadata search506 | D06/D11 | NOT VERIFIED | No exact supervisor token/label/privilege receipt |
| R4-25 | Worker token assumptions | P02/P03; E25 | D06/D11/D15 | NOT VERIFIED | WORKER_TOKEN_RUNTIME_NOT_VERIFIED |
| R4-26 | Integrity implications | O10/O12; T11/T12 | D06/D16 | ANALYSIS_SUPPORTED | MIC before DACL; equal IL not isolation; actual labels unknown |
| R4-27 | Restricted-token implications | P02/P03 | D11/D15 | ANALYSIS_SUPPORTED | Restricting SIDs differ from dropping privileges; PSEC not measured token claim |
| R4-28 | Sandbox enforcement evidence | P01-P03; historical S5-S9 | D15/D09 | NOT VERIFIED | Historical FS/network probes not process-object access tests |
| R4-29 | Same-user cooperative actor | T09; Boundary A | D12/D13 | ANALYSIS_SUPPORTED | Cooperation not OS guarantee |
| R4-30 | Same-user malicious actor | T10/T12; Boundary C | D12/D13/D18 | ANALYSIS_SUPPORTED | Neither automatically omnipotent nor isolated; retained as unresolved threat |
| R4-31 | Elevated attacker classification | T13/T14 | D12/D02 | ANALYSIS_SUPPORTED | No ordinary-app privileged/kernel resistance established |
| R4-32 | Worker-to-host boundary | S02/P02/P03 | D02/D06/D11 | NOT VERIFIED | Exact effective worker-to-supervisor access unknown |
| R4-33 | Child-to-host boundary | T04/S04/P03 | D05/D09 | NOT VERIFIED | Children cannot be treated as inherently trusted; no measured inherited access |
| R4-34 | Worker inheritance attack | S04/P03; E01/E02/E11 | D05/D08 | ANALYSIS_SUPPORTED | Intended handle restriction source verified; actual worker handles not |
| R4-35 | Worker duplication attack | S02; E03/E04 | D04/D12 | NOT VERIFIED | Capability prerequisites known; actual deny/grant missing |
| R4-36 | Unauthorized job assignment | S03/S04; E08 | D03/D20 | NOT VERIFIED | No local arbitrary route; external ASSIGN capability unknown |
| R4-37 | Unauthorized job termination | S05; E09 | D03 | NOT VERIFIED | Host-only intent not OS denial receipt |
| R4-38 | Unauthorized job attribute mutation | S03; E23 | D03/D18 | NOT VERIFIED | No proof external SET/WRITE_DAC paths denied |
| R4-39 | External handle retention | S08; E10/E18/E21 | D04/D09 | NOT VERIFIED | No assertion all external holders absent |
| R4-40 | Supervisor-crash implications | S08; R3 crash-windows.json | D09 | ANALYSIS_SUPPORTED | Conditional OS effect; missing observer/receipt quarantined |
| R4-41 | Job scope versus member identity | S08 AdmissionLifetime.cs:59 | D09 | SOURCE_VERIFIED | Case B conditional authority retained; lifetime uncertainty separate |
| R4-42 | Unknown process quarantine | S11:18,31,46; S12:212 | D01 | SOURCE_VERIFIED | S15 dormant source preserves UNKNOWN/hold/dispatch CLOSED |
| R4-43 | No automatic takeover | S11/S12 | D01 | SOURCE_VERIFIED | Owner/generation preserved on quarantine |
| R4-44 | No automatic worker retry | S11:31; S12:37 | D01 | SOURCE_VERIFIED | retryAuthorized=false; no command-body retry |
| R4-45 | Proposed trust boundary | Boundary A/B/C; S01-S13 | D01/D06/D11 | DESIGN_SPECIFIED | B required candidate, C unresolved; A not adopted |
| R4-46 | Boundary A evaluated | T09/T10; A comparison | D12/D13 | REQUIRES_OWNER_DECISION | Adopting exclusion of malicious same-user actor would narrow scope |
| R4-47 | Boundary B evaluated | T03-T08; P02/P03 | D06/D11/D15 | DESIGN_SPECIFIED | Desired untrusted-worker boundary, not implemented/proven by plain R3 fixture |
| R4-48 | Boundary C evaluated | T10/T12/T13; C comparison | D02/D12/D18 | NOT VERIFIED | No effective equal-privilege isolation/owner-right proof |
| R4-49 | Threat-model narrowing identified | A/B/C decision | D01 | ANALYSIS_SUPPORTED | A would narrow; B does not automatically discharge C |
| R4-50 | Owner approval classified | Owner decision table | D01 | ANALYSIS_SUPPORTED | R4 audit authorized; runtime/ACL/token/TCB/scope changes separate |
| R4-51 | Minimal control options | C01-C15 | D01-D20 | DESIGN_SPECIFIED | 15 controls assessed without applying |
| R4-52 | Controls mapped to threats | C01-C15/E01-E25 | D01-D20 | DESIGN_SPECIFIED | Mappings, privileges, compatibility, complexity and residuals explicit |
| R4-53 | Future host-only preconditions | G01-G20; S01 | D07/D16 | BLOCKED | G19 unresolved; no independently safe native launch yet |
| R4-54 | Independent decision review | Adversarial review20 | D01-D20 | INCONCLUSIVE | No unsupported allowance/adversary exclusion accepted; essential effective data missing |
| R4-55 | S16B-R4 final decision | Report A A/Z; review20 | D01-D20 | INCONCLUSIVE | Actual SD/token evidence essential and absent; not proof of impossibility |
| R4-56 | Pinned Codex candidate | Preflight and final Test-Path | P01-P03 | SOURCE_VERIFIED | MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; source != binary/runtime |
| R4-57 | No Windows security changes | Audit action log | D01 | SOURCE_VERIFIED | No ACL/token/IL/privilege/elevation/service/task mutation |
| R4-58 | No production source changes | AI baseline445; final snapshot | D01 | SOURCE_VERIFIED | Only two new reports permitted |
| R4-59 | Protected evidence integrity | R3 67 + prior20 roots2392; Hermes647 | D01 | SOURCE_VERIFIED | Scoped hash preservation, no whole-OS attestation |
| R4-60 | Exactly two review reports | Report A/B; final git delta | D01 | SOURCE_VERIFIED | Required two .md additions only |
| R4-61 | MXC compatibility | P01-P03; missing binary | D10 | NOT RUN | Pinned source reviewed, no compatibility execution |
| R4-62 | Host-only runtime containment | R3 not-run.json; R4 actions | D09 | NOT RUN | No new H1/H2/native experiment |
| R4-63 | Host-crash cleanup | L06/E22 | D09 | NOT RUN | No deliberate crash or exit proof |
| R4-64 | Physical filesystem fencing | T08/S11; historical limited probes | D15 | NOT VERIFIED | DB CAS/quarantine cannot revoke OS file writes |
| R4-65 | Production supervisor integration | S13; S01 | D01 | NOT RUN | No bridge wired into production |
| R4-66 | Credential custody | R4 action scope | D15 | NOT VERIFIED | No real credential access; no custody verification |
| R4-67 | Subscription entitlement | R4 action scope | D01 | NOT VERIFIED | No provider auth/entitlement check |
| R4-68 | Included-only billing enforcement | R4 action scope | D01 | NOT VERIFIED | Zero paid calls does not prove enforcement |
| R4-69 | Real worker activation | S01/S13; R4 decision | D01-D20 | BLOCKED | Unverified access boundary plus downstream gates |

## 5. Required mitigation, future OS verification and Owner authorization per gate

Runtime column selalu BLOCKED pada R4. R4 tidak mengotorisasi V04-V06, new objects/token/process, handle duplication/termination atau SD modification. V01-V03 berarti relevant metadata saja; nonexisting object/token tetap missing dan tidak dibuat. Any future experiment membutuhkan separate authorization dan independent safe cleanup terlebih dahulu.

| Gate | Required mitigation / retained invariant | Required future OS evidence | Owner approval classification | Runtime / MXC / worker |
| --- | --- | --- | --- | --- |
| R4-01 | Preserve checkpoint, do not promote static evidence | V01-V03 | No scope change | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-02 | Preserve 21 protected roots and prior reports | Final scoped hashes | None for audit | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-03 | Keep guard closed | No runtime in R4 | Runtime needs separate authorization | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-04 | No probes/build/tests in R4 | Final action audit | R4 prohibits runtime | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-05 | Do not substitute audit shell descriptor | V01/V02 | Metadata acquisition scoped separately | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-06 | C05/C13 | V01/V03 | Job creation prohibited R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-07 | C04; distinguish supervisor vs child SD | V01/V02 | Any SD change separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-08 | C05, no NULL-DACL inference | V01 | Any SD change separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-09 | Read actual owner/DACL/labels | V01/V02 | No changes in audit | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-10 | C04/C06/C08 | V02-V04 | Dangerous-right test separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-11 | C04 | V02/V04 | No termination allowed | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-12 | C02/C04 | V03/V04 | Read-only rights not mutation grant | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-13 | C05/C13 | V03/V04 | No assignment experiment R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-14 | C05/C14 | V03/V05 | No terminate in R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-15 | C02/C15 | V03 | No new job query handle R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-16 | C05 | V01/V03/V04 | No limit/ACL mutation R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-17 | C04/C06 | V02-V04 | No live duplication | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-18 | C02/C03/C15 | V03 | No forced external close | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-19 | C01/C03 | V03 | Runtime enumeration separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-20 | C04/C15 | V02-V04 | No live DUP test | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-21 | C04/C05 | V01/V03 | No weaker threat model | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-22 | C14/C15 | V03/V05 | No kill-on-close experiment | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-23 | C02/C15 | V03/V05 | No external handle manipulation | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-24 | C04, no audit-shell substitution | V02 | No token mutation/query invasive actors | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-25 | C06/C07/C08 | V02 | No worker creation R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-26 | C07 plus DACL, not MIC alone | V01/V02/V04 | No IL changes | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-27 | C06/C08 | V02/V04 | Token creation/change separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-28 | C04/C06/C11 | V02/V04/V06 | No weakened sandbox | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-29 | No assumed authority for same-user apps | V02 | A adoption may need scope decision | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-30 | C04/C08 | V01-V04 | Do not silently exclude | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-31 | Stronger architecture if guarantee required | No privileged experiments proposed | Material TCB/scope decision only if proposed | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-32 | C04/C06/C08 | V01-V04 | No runtime activation | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-33 | C01/C03/C06 | V02-V04 | No child experiments | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-34 | C01/C03 | V03 | Separate IPC/runtime authorization | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-35 | C04/C06 | V02/V04 | No actual duplication | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-36 | C04/C05/C13 | V03/V04 | No assignment probe | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-37 | C04/C05 | V03/V04 | No termination | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-38 | C04/C05 | V01/V04 | No mutation | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-39 | C01/C04/C15 | V03 | No global invasive handle scan | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-40 | C09/C12/C14 | V05 later, not R4 | Crash experiment separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-41 | Keep R3 policy, do not infer scope from PIDs | V03/V05 | No model weakening | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-42 | C12 | Future OS receipts required | No DB write | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-43 | C12 | Review durable integration later | No takeover authorization | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-44 | C12 | Integration still dormant | No retry | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-45 | C01-C15 conditional design | V01-V06 | No boundary change adopted | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-46 | Do not adopt A for PASS | No OS claim from cooperation | Only if proposed adoption; no decision demanded now | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-47 | C04/C06/C08/C11 | V01-V06 | Implementation/runtime separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-48 | C04/C08, no default service/admin | V01-V04 | Fundamental architecture change needs Owner | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-49 | Retain all unresolved threats | No false runtime readiness | No narrowing performed | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-50 | Finish reviewable report first | No runtime within R4 | No routine approval pending | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-51 | Prefer verified existing sandbox before new privileged architecture | V01-V06 | Any implementation/security change separate | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-52 | Avoid claiming nonce/CAS protects OS handles | V01-V06 | Design only | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-53 | Metadata package first; no R5 execution | V01-V03 prerequisite, V04/V05 gated | Separate future authorization mandatory | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-54 | Preserve unknowns; do not promote design | V01-V03 | No override | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-55 | Minimum evidence package specified | V01-V03 | No boundary adoption pending | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-56 | No restoration/substitution | Separate authorized provenance restoration only if later needed | Not authorized R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-57 | Keep audit read-only | Scoped action audit | No change requested | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-58 | Preserve all user changes/source/DB | Final hashes | Authorized reports only | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-59 | No old source/fixture/binary edits | Final hashes | No destructive cleanup | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-60 | Audit metadata outside repo, no executable/test artifacts | Final inventory | Already authorized | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-61 | Keep blocked | Separate pinned runtime verification | No MXC R4 | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-62 | Keep guard closed | Safe prerequisite before future experiment | Not authorized | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-63 | C09/C12/C14 | Separate crash plan | Not authorized | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-64 | C11 | V06 after permissions established | No file/ACL enforcement mutation | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-65 | Independent implementation review later | Separate integration evidence | No production changes | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-66 | Host broker/custody design later | Separate authorized fake-data-first validation | No credential access | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-67 | Keep worker blocked | Separate authorization | Not performed | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-68 | Paid API/credit fallback OFF | Separate enforcement proof | Not performed | BLOCKED / MXC BLOCKED / WORKER BLOCKED |
| R4-69 | No worker activation | All mandatory future gates | Not authorized | BLOCKED / MXC BLOCKED / WORKER BLOCKED |

## 6. Threat-model and handle-access implications

T01-T14 actors dan O01-O16 protected objects lengkap di report A P/E; E01-E25 attack analysis lengkap di report A Q. Actual attacker grants NOT VERIFIED untuk semua25 scenarios. E04 missing-DUP-right denial dan E05 no-name-open adalah documented-route reasoning, bukan attempted API observations.

Boundary A cooperative model tidak diadopsi; mengecualikan T10 demi PASS akan memerlukan material Owner decision. Boundary B adalah desired untrusted worker boundary tetapi actual PSEC/token/access facts belum terbukti. Boundary C malicious same-user/equal-privilege actor tetap unresolved, tidak silently out-of-scope. Privileged/kernel adversaries tidak diberi ordinary-app resistance guarantee atau dianggap selesai melalui default assumption.

Process SD berbeda dari job SD; child NULL attributes tidak membuktikan supervisor DACL. Existing handles berbeda dari new open attempts; DACL change tidak diasumsikan mencabut granted capabilities. Inheritance berbeda dari duplication. Unnamed job mengurangi named-open exposure; bukan exclusion terhadap every access mechanism. Query-only job capability tidak memberi mutation rights tetapi dapat mempertahankan lifetime. Last-own-close bukan actual last close, dan termination success bukan all-member exits.

R3 local source memegang control handles dan memakai intended noninheritance. Native proof F01 masih bergantung structural assumptions tanpa actual external access proof; F02 JSON/hash gate authenticity membutuhkan OS control-file/memory protection. Tidak ada exploit dilakukan dan prior source tidak diubah. F03 fixed synthetic worker reports tidak boleh dipromosikan jadi production complete-scope authority; actual termination path reviewed memakai owned ChildProcess, bukan worker PID. F04 synthetic labels/DB CAS tidak menciptakan OS access proof.

## 7. Mandatory future-readiness checklist G01-G20

Design-level review tidak mengotorisasi runtime bahkan bila semua checklist item lengkap. G04 actual inheritance population dan G19 independent safety prerequisites belum terpenuhi. V01-V03 package dan proposed20-question review tidak membuat OS grants diketahui dengan sendirinya.

| ID | Requirement | Status | Finding | Runtime |
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

## 8. Independent security decision review

Distinct adversarial second pass oleh agent yang sama; no external human/delegation claim.20 requested questions dijawab di report A V dan independent-review-final.json. Overall **INCONCLUSIVE**: effective token/DACL/holder facts belum diketahui. Individual PASS adalah batas argumen yang tidak mengasumsikan kondisi salah, bukan OS result. Mandatory unknown tetap blocker.

Kesimpulan diuji terhadap: no silent same-user exclusion, no imagined worker IL/restrictions, no job/process SD confusion, no ignored existing grant, no inheritance=duplication shortcut, no named-job shortcut, no MIC=DACL shortcut, no default-DACL sufficiency assumption, no SeDebug dependency, no false last-close/exit proof, no source-to-runtime promotion, no physical-fence-from-CAS assumption, no candidate substitution, no premature worker readiness. Tidak ada override dari229 historical test count.

## 9. Source, historical evidence and system-integrity scope

R4 initial baseline445 existing AI files/122 git entries. Final expected447 files/124 entries: tepat2 authorized report additions. All existing source, .gitignore, registry/state/attempt code/databases, historical reviews dan preexisting Asset_3D_Model work dipertahankan. No reset/cleanup/source patch.

Protected: prior R3 root67 +20 older/installed/fixture roots2392 =21 roots2459 files; Hermes3D647 tracked paths. AI hash snapshot excludes .git/directories named node_modules; protected snapshots full. Scoped preservation, bukan whole-disk/Windows attestation. Existing metadata subset506 files searched, no relevant token/SD receipt found; not universal absence proof.

Final-audit.json mencatat actual comparisons/report hashes/allowed git delta/actions. inventory-manifest.json actual SHA256 audit metadata, excludes itself. Fresh audit root hanya inventories/matrices/reporting scripts, no executable/test fixture/native build. No runtime experiment/new Job Object/worker/compile/test invocation, live duplication, termination, invasive process open, credential access, auth, inference, paid API, privilege/ACL/token/IL/elevation/security/config/service/task/WSL/install change. Microsoft documentation/source web research occurred; no zero-network-global claim.

## 10. Runtime, MXC and production blockers

Native R3 guard remains closed: existing source hashes unchanged; no authorization/build-gate/H1/H2 issuance artifacts created. R4-61 through69 appropriately NOT RUN/NOT VERIFIED/BLOCKED. No H1/H2/native adapter/MXC/app-server/real worker launched.

MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE preserved; pinned0.164.0 candidate absent,45 historical missing paths not restored. WORKER_TOKEN_RUNTIME_NOT_VERIFIED remains. Installed Codex unchanged in checked scope; no substitute runtime executed. PID23376/23644 HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; not queried/opened/terminated.

Host-only/native exits, host crash, arbitrary descendants, production supervisor, filesystem fencing, credentials, entitlement and included-only billing unverified. No spending is not billing-enforcement proof. Quarantine/closed dispatch/no auto takeover/no retry source intent preserved; not a physical process-kill or filesystem-revocation guarantee.

## 11. One recommended next bounded milestone and Owner review

**Exactly one next step:** reconcile access-control evidence package V01-V03 for relevant existing host-owned objects/exact intended configuration, without workers or process-control experiments. Need effective supervisor/job owner/DACL/labels, worker/PSEC token context and actual granted handle masks/holders/inheritance/provenance. Zero worker/child/test-job budget for this evidence-only step. If relevant object/token does not exist, record NOT CREATED/NOT VERIFIED and stop; future creation requires separate explicit scope authorization.

Do not repeat229 tests without materially relevant source changes. Do not start R5/S16C/S17. Do not choose A, restore candidate, implement SD/token changes or promise B/C enforcement.

No routine Owner approval pending for this completed audit. Only a proposed material threat relaxation/TCB/isolation change, security mutation or runtime activity needs separate decision. Alternatives and loss/gain must be concrete before asking; none adopted here. Current final category INCONCLUSIVE, not OWNER_BOUNDARY_DECISION_REQUIRED, because no narrower boundary is being adopted as the sole route to progress.

**M02-02S16B-R4 INCONCLUSIVE — REQUIRED ACCESS-CONTROL EVIDENCE INCOMPLETE — RUNTIME BLOCKED.**

