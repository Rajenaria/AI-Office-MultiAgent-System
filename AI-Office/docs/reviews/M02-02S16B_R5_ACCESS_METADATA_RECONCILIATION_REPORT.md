# M02-02S16B-R5 — Access Metadata Reconciliation Report

Tanggal: 2026-11-05. Milestone keputusan audit, bukan penyelesaian S16. Primary decision tunggal: **C — CONTROLLED_RUNTIME_EVIDENCE_REQUIRED**.

## A. Executive decision

R4 INCONCLUSIVE direkonsiliasi menjadi keputusan C. Ada bukti baru tentang caller audit sendiri, tetapi tidak ada actual host/job/worker descriptor atau granted access mask yang boleh dinyatakan terverifikasi. Boundary B tetap desain bersyarat dengan malicious same-user actor dalam scope. Tidak ditemukan bukti OS yang membuktikan perubahan arsitektur wajib ataupun boundary aman. Real coding worker tetap **BLOCKED**.

Satu langkah berikut: review Owner dan otorisasi terpisah atas protokol R6 metadata M/J0 pada bagian T. Seluruh preflight harus dipenuhi sebelum tindakan yang bergantung padanya; R6, S16C, dan S17 tidak dimulai oleh R5.

## B. R4 checkpoint baseline

R3 manifest: 1DB222FAA164B640EBA72192597C5BD11CCC93AF602B0FF457E37C98D3606059 (67 files / 66 manifest entries). R4 manifest: FE93BBA5CF374CC4C0ADD234C059A14581824E065EC18786CEC503247E33993D (19 files / 18 entries). R4 report A SHA256 06DB69DE9360B0F563A899A9252DD7E0BBD5F29ECDF9BEA8B7B835B96919AAEF; report B SHA256 22197D41EBF9D6279E4B5867EC960BE01ACCAD7DFA6EA9501187CC9533F38DBE.

R3 229 PASS adalah hasil historis model/deterministik: 25 new-fault, 26 R2-fault, 152 prior, 17 legacy. Tidak ada pengulangan. H1/H2 native tetap NOT RUN; authorization/build gate tidak diterbitkan. Source binding tercatat dalam preflight.json, termasuk R3Native, AdmissionLifetime, NativeDeclarations, AtomicProtocol dan not-run.json. R4 source/attack/control register dipakai sebagai baseline, tidak diulang pencarian massal atas 506 metadata lama yang tidak memuat descriptor.

## C. Read-only execution scope

Preflight snapshot dilakukan sebelum query metadata. Observasi baru terbatas pada caller self-token melalui WindowsIdentity.GetCurrent(TokenAccessLevels.Query), dua perintah Microsoft whoami yang sudah ada, dan inspeksi ketersediaan public PowerShell/.NET accessor. Query commands adalah fasilitas metadata, bukan synthetic targets. Tidak ada native build/Add-Type, raw interop, GetSecurityInfo, GetHandleInformation, DuplicateHandle, job creation, control/termination, token/ACL/IL/privilege modification, elevation, install, MXC, app-server, worker, inference, paid API atau credential query.

Raw output CLI hanya diproses dalam memori. Identitas privat dan handle numerik tidak disimpan. R5 tidak mengklaim seluruh sesi tanpa network: riset dokumentasi Microsoft melalui web tool dilakukan sesuai instruksi reference baseline. Tidak ada host metadata/harness/provider network command atau request.

## D. Actual evidence inventory

Root baru: R5_AUDIT_ROOT = %TEMP%/ai-office-m0202s16br5-audit-39f936cc-3b71-4a26-88ee-bb951255e47e. Artifact final dan SHA256 masing-masing tercantum dalam manifest.json di root itu; manifest mengecualikan dirinya. Path Windows privat diganti alias/environment variable.

| Evidence | Isi / batas klaim |
|---|---|
| baseline-ai.json / baseline-protected.json / baseline-hermes.json | 447 existing AI files; 22 protected roots /2478 files; 647 tracked Hermes files, masing-masing path relatif/bytes/SHA256 |
| preflight.json | R4 hash, R3 source bindings, guards, candidate absent, git baseline124; pass sebelum query |
| QueryMetadata.ps1 / audit-caller-dotnet.json | AC01 existing .NET explicit TOKEN_QUERY; one wrapper disposed |
| audit-caller-whoami.json | AC02 existing signed Microsoft whoami /all; original wrapper, natural exit0; selected privileges |
| QueryGroups.ps1 / audit-caller-groups.json | AC03 one focused /groups query; image hash matched; Medium/admin deny-only; natural exit0 |
| metadata-parser-limitation.json | AC02 CSV group SID column mismatch; original receipt not overwritten; AC03 distinct |
| metadata-interpretation.json | Context separation and timestamp limitations; no merged token or fabricated sample instant |
| observation-facilities.json / query-disposition.json | No reviewed available process SD accessor used; no denied API result; first-stage disposition predates AC03 |
| consolidated-inventory.json / gate-matrix.json | 52 items and69 gates, distinct allowed evidence vocabularies |
| decision-and-protocol.json / reference-register.json | One C decision; three root blockers; Q01-Q20; design-only20-point protocol; official refs |
| independent-review.json | Separate second-pass challenges; decision scope only, not OS boundary acceptance |
| final-integrity.json / manifest.json | Final baseline comparisons, final report hashes and sanitized evidence hashes; no circular manifest/report hash |


AC01: PID12540, creation 2026-11-05T04:21:24.3600991Z; query receipt 04:21:25.0400721Z. AC02: PID20600, creation 04:21:25.3580218Z; AC03: PID18640, creation 04:22:22.9892652Z. These are original owned query identities at observation, not authority to re-query those numbers now. AC02/AC03 observedUtc was initialized before Process.Start; it means query-start metadata, not exact token-sampling time. Completion wall-clock was not recorded; both exit0 observations precede receipt publication. AC02 elapsed112ms is its own stopwatch scope, not time since observedUtc. No completion instant is fabricated.

Official references below are semantic documentation, never local OS observations.

| ID | Primary official reference | Use |
|---|---|---|
| D01 | [GetTokenInformation](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-gettokeninformation) | TOKEN_QUERY classes; actual values require queries |
| D02 | [GetSecurityInfo](https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo) | Object owner/group/DACL; READ_CONTROL; DWORD result; LocalFree |
| D03 | [Job Object Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights) | Creator default descriptor; original creation handle; separate job rights |
| D04 | [Process Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights) | Creator token/default descriptor; operation-specific process rights |
| D05 | [Mandatory Integrity Control](https://learn.microsoft.com/en-us/windows/win32/secauthz/mandatory-integrity-control) | Token/object labels and policy, not same-user isolation |
| D06 | [DuplicateHandle](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle) | Source/target process duplication rights; capability transfer |
| D07 | [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) | Job starts empty; assignment and termination distinct |
| D08 | [Handle Inheritance](https://learn.microsoft.com/en-us/windows/win32/sysinfo/handle-inheritance) | Transfer model, not effective-mask measurement |
| D09 | [WindowsIdentity.GetCurrent](https://learn.microsoft.com/en-us/dotnet/api/system.security.principal.windowsidentity.getcurrent?view=netframework-4.8.1) | Explicit desired TokenAccessLevels overload |
| D10 | [GetHandleInformation](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-gethandleinformation) | Flags only; not granted mask |
| D11 | [whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami) | Current command token reports /all /groups /priv CSV |
| D12 | [OpenProcessToken](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocesstoken) | Process query access and separately requested token rights |
| D13 | [SECURITY_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/secauthz/security-information) | LABEL read uses READ_CONTROL, distinct from full SACL privilege |


## E. V01 security descriptor findings

No actual process/job SD was read. The inspected public Process API has no GetAccessControl/GetSecurityDescriptor accessor; PowerShell has no Process provider, Get-ProcessSecurity/Get-ProcessAccess or accesschk command available in inspected command resolution. Get-Acl being available does not supply a process provider. This is **OBSERVATION_METHOD_UNAVAILABLE** for own process, not QUERY_DENIED and not proof that Windows cannot read process SDs.

A future approved GetSecurityInfo reader needs READ_CONTROL for owner/group/DACL; LABEL_SECURITY_INFORMATION also uses READ_CONTROL even though the label resides in the SACL. Full SACL collection is excluded; no SeSecurity/SeDebug activation is proposed. [GetSecurityInfo](https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo), [SECURITY_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/secauthz/security-information).

R3 supplies NULL child process/thread attributes and NULL job attributes. This is **SOURCE_DERIVED_DEFAULT_SECURITY_MODEL**, not measured descriptor bytes; it describes child/job construction and says nothing about the supervisor object's actual DACL. A creator token's TokenDefaultDacl is a template, not an observed actual object DACL. [Process security](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights), [Job security](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights).

## F. V01 current-object availability

| Subject | Existence at permitted scope | Authorization/method | Result |
|---|---|---|---|
| Current authenticated AI OFFICE host | UNKNOWN outside audit | No authenticated PID/creation/image/ownership supplied; no broad scan/OpenProcess | HOST_PROCESS_OBJECT_NOT_AVAILABLE to audit; not OBJECT_NOT_RUNNING |
| AC01 caller process | YES during observation | Self metadata allowed; SD accessor unavailable | Actual process owner/group/DACL unavailable; OBJECT_INTEGRITY_LABEL_NOT_OBSERVED |
| Audited R3 operational supervisor | NO scoped invocation | Issuance/runtime guards remain locked | OBJECT_NOT_CREATED, not inferred from stale numeric PID |
| Audited private R3 job | NO scoped invocation | Never created for this invocation | PRIVATE_JOB_RUNTIME_DESCRIPTOR_NOT_AVAILABLE |
| Future production supervisor/MXC worker/worker child | NO future invocation | No runtime launch authorized | OBJECT_NOT_CREATED; no descriptors invented |


## G. V01 missing private Job Object descriptor

There is no job handle to query. Every missing job owner/group/DACL/label/flags value shares RB1, rather than separate repeated-audit blockers. Its unnamed design neither creates a current object nor excludes future duplication. Actual job creation is necessary for its actual SD, but R5 forbids it. J0 in proposed R6 is a gated, empty, non-actuating measurement object; it does not reopen or execute R3 and cannot start without external-capability and cleanup prerequisites.

## H. V02 token context findings

| Context | Subject | Availability | Token status | Observed limit |
|---|---|---|---|---|
| T01 | AC01 PowerShell; AC02 /all; AC03 /groups | Observed separately, created for authorized metadata; naturally completed commands | TOKEN_CURRENTLY_OBSERVED for selected fields only; no TokenId equivalence | AC01 user/owner/impersonation; AC02 privileges; AC03 Medium/admin deny-only |
| T02 | Current AI OFFICE host | Identity unavailable; global existence UNKNOWN; no authenticated permitted PID | TOKEN_OBJECT_NOT_AVAILABLE to audit; query not authorized for arbitrary PID | Host SD/token never queried |
| T03 | Prior C# R3 supervisor | Audited operational invocation OBJECT_NOT_CREATED | TOKEN_OBJECT_NOT_AVAILABLE; TOKEN_RUNTIME_NOT_VERIFIED | Stored executable/source != live supervisor |
| T04 | Future production supervisor | Future invocation OBJECT_NOT_CREATED | TOKEN_OBJECT_NOT_AVAILABLE | No production bridge wiring; caller proxy prohibited |
| T05 | Future MXC worker | OBJECT_NOT_CREATED; pinned candidate absent | TOKEN_OBJECT_NOT_AVAILABLE; TOKEN_RUNTIME_NOT_VERIFIED | No assumed Low/restricted/AppContainer context |
| T06 | Future worker child | OBJECT_NOT_CREATED, distinct from query commands | TOKEN_OBJECT_NOT_AVAILABLE | No child-token inheritance proof |
| T07 | Hypothetical malicious equal-user actor | UNKNOWN; not selected or targeted | TOKEN_RUNTIME_NOT_VERIFIED; no actor query | Threat retained; equal user/IL does not imply equivalent rights or automatic isolation |


AC01 successfully requested TOKEN_QUERY (0x00000008), read sanitized non-system user category, token-owner equals token-user and impersonation level None; its wrapper was disposed. This success establishes selected query capability, not an independently measured full granted mask. WindowsIdentity's explicit access overload was used; no WindowsPrincipal/role-query path that could duplicate a token was used. [WindowsIdentity.GetCurrent](https://learn.microsoft.com/en-us/dotnet/api/system.security.principal.windowsidentity.getcurrent?view=netframework-4.8.1).

AC02 reports SeChangeNotifyPrivilege ENABLED, with SeShutdownPrivilege, SeUndockPrivilege, SeIncreaseWorkingSetPrivilege and SeTimeZonePrivilege DISABLED. These are observed pre-existing states; the audit enabled none. Original AC02 integrity/admin parsing was unsuccessful and remains NOT_OBSERVED. AC03 separately reports integrity MEDIUM (public RID8192) and administrator-group DENY_ONLY_REPORTED. Neither is a direct TokenElevation query. No complete restriction/AppContainer/mandatory/default-DACL state was observed for these contexts. whoami reports its command's current context, not a remote host token. [whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami).

## I. V02 worker token limitations

Actual selected MXC worker token is unavailable, not permission-denied. No Low IL, restricted SID/AppContainer or mandatory policy is assumed. R4 pinned SDK source at b21120168d70befe12356411423266bfef168446 describes conditional paths: job_object.rs214, base_container_runner.rs770/830 and secenv.rs169/231. Those remain TOKEN_SOURCE_DERIVED, not runtime observations. The R3 plain cooperative fixture is not a restricted MXC worker. AC01/02/03 cannot substitute for any production supervisor, worker or worker child.

No direct GetTokenInformation calls for TokenElevation, TokenRestrictedSids, TokenIsAppContainer, TokenMandatoryPolicy or TokenDefaultDacl were made; absence of a parsed group indicator is not proof of an unrestricted/non-AppContainer token. [GetTokenInformation](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-gettokeninformation).

## J. V03 handle provenance

| Class | Exact subject | Creation/source | Owner / authority | Lifecycle | Intended/requested rights | Actual granted | Flags | Transfer / duplicates | Close effects / unknowns | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| H01 | Supervisor process control capability | Future actor opens host or already holds it; no audited R3 process | Trusted host owns self, untrusted grants not known | Original process lifetime; reopening separate authorization | DUP_HANDLE/VM_WRITE/CREATE_THREAD/TERMINATE dangerous, not requested R5 | NOT_OBSERVED | NOT_OBSERVED | External dup/inheritance unverified | Closing ordinary process handle is not termination; retained wait evidence needed | V01-01/06; V03-01/19 |
| H02 | Original private job | R3 CreateJobObjectW NULL,NULL; not executed | NativeJobSession invocation-local ledger | Setup through owned disposal | API documented broad creation return; query/set/assign/terminate usages distinct | NOT_OBSERVED | INHERITANCE_SOURCE_RESTRICTED only | No local transfer in source; external holders unverified | Kill-enabled last close is actuation; no actual close here | V01-07; V03-02/14/15 |
| H03 | Original child process | PROCESS_INFORMATION from fixed atomic creation; not executed | Creating invocation original capability | Register before identity queries; wait through exit then close | Source QUERY/SYNCHRONIZE/TERMINATE; no independent full mask | NOT_OBSERVED | Source assertion only | Not worker-reported PID; actual transfer unverified | Close doesn't prove exit; original wait+creation+exit required | V03-03; R3Native88-105 |
| H04 | Original child primary thread | PROCESS_INFORMATION; no thread created | Same invocation local ledger | Register before errors; potential resume; dispose | Resume usage; broad return contract not measured | NOT_OBSERVED | Source assertion only | No source export; runtime transfer unknown | Thread-handle close not thread/process exit receipt | V03-04 |
| H05 | Duplicated job | Potential external DuplicateHandle, none created R5 | Unknown future holder; not local ledger ownership proof | Can outlive creator's local close | Actual source-handle rights carried/reduced under API; no measured grant | NOT_OBSERVED | NOT_OBSERVED | No local DuplicateHandle call != external denial | May extend lifetime, prevent last-close or acquire control | V03-05/19; D06 |
| H06 | Inherited job | Potential inheritable capability; no object/child R5 | Future child if transfer occurs | May persist after original host closes | Actual inherited rights not measured | NOT_OBSERVED | Source false/default noninheritability, no runtime flag | Already-held handles are not revoked by later source setting | May extend lifetime/authority; no actual event observed | V03-06/12 |
| H07 | Temporary query token | AC01 WindowsIdentity.GetCurrent(Query) | Current audit caller query-only purpose | Acquire, selected queries, Dispose in finally | TOKEN_QUERY explicitly 0x00000008 | GRANTED_ACCESS_MASK_NOT_OBSERVED | NOT_OBSERVED | No audit duplicate/export; no raw handle logged | Wrapper disposed; no explicit raw CloseHandle receipt claimed | V03-07/10/11; AC01 |
| H08 | Cancellation IPC/control | Future production channel; current durable synthetic contracts only | Host authority must authenticate invocation | Issue, cancel, acknowledge, recover not instantiated here | Future channel-specific least rights; no live IPC mask | NOT_OBSERVED | NOT_OBSERVED | Worker must not forge/replay; external access unknown | IPC close is not process exit/cancel completion | V03-08; backend source register |
| H09 | Future worker-owned handles | Future selected MXC worker inheritance/broker creation | Worker own resources only, host capability exclusion required | Actual worker/child lifetime not created | Explicit future allowlist; dangerous host/job/token rights excluded by proof | NOT_OBSERVED | NOT_OBSERVED | No pinned runtime or actual handle census/provenance | Worker close must not hold/release host kill authority; unverified | V03-09; V02-16..21 |


The existing backend synthetic supervisor is source evidence only: worker-reported descendants/completion at supervisor.ts122-131 cannot establish actual native tree identity; retained ChildProcess kill at163 is not arbitrary worker-PID authority; reported-PID liveness at173 is not production exit proof. attempt-control/recovery.ts9/18/31/46 and repository189/212 keep dispatch closed/quarantine/retryfalse without actual OS takeover. server/index.ts does not wire a production native supervisor.

## K. V03 requested vs granted access

All complete granted masks are **GRANTED_ACCESS_MASK_NOT_OBSERVED**. GetHandleInformation returns handle flags, not a granted mask. No undocumented NT query, global handle table, handle duplication or all-access probe was introduced. [GetHandleInformation](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-gethandleinformation).

R3 creation calls do not carry an OpenProcess desired-access parameter; documented original creation returns and subsequent operation-specific rights must be distinguished from explicit requests. Broad original trusted capabilities may be necessary for lifecycle operations, but their safe custody is unproved. Query success proves the particular used capability, not a full-mask measurement or denial to an untrusted actor.

## L. V03 inheritance and duplication

R3 source supplies bInheritHandles=false and null job security attributes, checks bit1 through GetHandleInformation, and uses JOB_LIST for atomic assignment; none was run R5. Thus **INHERITANCE_SOURCE_RESTRICTED** and runtime flags NOT_OBSERVED. JOB_LIST assignment is not itself child handle export. Already-held/inherited handles and external duplication remain separate risks.

An actor with required process duplication capabilities may copy an existing object handle even for an unnamed job. Same-user identity alone establishes neither that access nor its denial. A local ledger can count known handles but cannot discover unknown external holders; a duplicate can extend job lifetime. A later DACL change must not be treated as revocation of previously granted capabilities. [DuplicateHandle](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle).

## M. V01–V03 consolidated matrix

Closed item inventory: **52 items: V01=12, V02=21, V03=19**. Each has one primary evidence status and exactly one security consequence. Complete14-column matrix (existence, observation/auth, required access, method, source, value, runtime dependency and next action) is in the companion [decision matrix](M02-02S16B_R5_SECURITY_BOUNDARY_DECISION_MATRIX.md) and consolidated-inventory.json. Compact reconciliation follows; multiple unobserved fields of one absent object do not increase the three root-blocker count.

| ID | Exact subject | Primary evidence status | Single consequence |
|---|---|---|---|
| V01-01 | Authenticated AI OFFICE host process DACL | NOT_VERIFIED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-02 | Authenticated host process owner/group | NOT_VERIFIED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-03 | AC01 process-object DACL | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-04 | AC01 process-object owner/group | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-05 | AC01 process-object mandatory label | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-06 | Audited R3 operational supervisor process SD | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-07 | Audited private R3 Job Object SD | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V01-08 | R3 CreateJobObjectW null attributes | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V01-09 | R3 child process/thread null attributes | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V01-10 | Future production supervisor process SD | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V01-11 | Future MXC worker process SD | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V01-12 | Token default DACL versus actual object SD | DOCUMENTED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-01 | T01 / AC01 current audit token user | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-02 | T01 / AC01 token owner | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-03 | T01 / AC01 impersonation metadata | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-04 | T01 / AC01 integrity | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-05 | T01 / AC02 whoami privileges | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-06 | T01 / AC03 whoami integrity | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-07 | T01 / AC03 admin group attributes | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V02-08 | T01 / AC03 TokenElevation | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-09 | T01 / AC01 restriction state | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-10 | T01 / AC01 AppContainer | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-11 | T01 / AC01 mandatory policy | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-12 | T01 / AC01 token default DACL | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-13 | T02 / existing AI OFFICE host token | QUERY_NOT_AUTHORIZED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-14 | T03 / prior C# operational supervisor token | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V02-15 | T04 / future production supervisor token | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V02-16 | T05 / future MXC worker token | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V02-17 | T05 / worker integrity/object policy | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V02-18 | T05 / worker restricted/AppContainer policy | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V02-19 | T06 / future worker child token | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V02-20 | T07 / hypothetical malicious same-user actor | NOT_VERIFIED | REMAINS_WORKER_BLOCKER |
| V02-21 | Pinned SDK token/security alternatives | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-01 | H01 / supervisor process control access | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V03-02 | H02 / original private job handle | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V03-03 | H03 / original child process handle | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V03-04 | H04 / original child primary-thread handle | OBJECT_NOT_CREATED | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V03-05 | H05 / duplicated private-job handles | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V03-06 | H06 / inherited private-job handles | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V03-07 | H07 / AC01 temporary token-query handle | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-08 | H08 / cancellation IPC / control channel | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V03-09 | H09 / future worker-owned handle set | OBJECT_NOT_CREATED | REMAINS_WORKER_BLOCKER |
| V03-10 | AC01 H07 independently observed granted mask | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V03-11 | AC01 H07 handle flags | OBSERVATION_METHOD_UNAVAILABLE | REQUIRES_CONTROLLED_RUNTIME_VALIDATION |
| V03-12 | R3 native source non-inheritance constraints | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-13 | GetHandleInformation contract | DOCUMENTED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-14 | R3 custody / tracked last-close model | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-15 | Current R3 last-job-handle close event | NOT_APPLICABLE | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-16 | Historical R3 229 deterministic checks | HISTORICALLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-17 | R3 original job/process creation rights semantics | SOURCE_VERIFIED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-18 | AC02/AC03 original query Process wrappers | CURRENTLY_OBSERVED | SUFFICIENT_FOR_STATIC_DESIGN |
| V03-19 | Future external same-user process-control capability | NOT_VERIFIED | REMAINS_WORKER_BLOCKER |


## N. Unavailable runtime objects

OBJECT_NOT_CREATED applies only to the scoped never-issued R3 and future invocations. It does not assert there are no other host processes/jobs on the machine. Current AI host remains UNKNOWN/not authenticated to audit; selecting an arbitrary PID is QUERY_NOT_AUTHORIZED. No API returned a metadata access denial; QUERY_DENIED/TOKEN_QUERY_DENIED are not assigned. Available caller fields are point-in-time CURRENTLY_OBSERVED; commands have already naturally exited.

No approved process SD accessor and no reliable independent granted-mask observer were available in the inspected facilities. These method gaps differ from missing runtime objects and absent authority. Legacy results remain HISTORICALLY_OBSERVED. Documented semantics and SOURCE_VERIFIED flags are not effective runtime access proof.

## O. Existing versus future security guarantees

Existing facts: current caller selected metadata and resource disposal; historical source-model checks; unchanged guards and source custody requirements. No actual control-bearing process/job security boundary, last-close guarantee, host-only H1/H2 containment, independent target exit or crash recovery was observed.

Future requirements include worker-equivalent access denial, exclusive admission, handle lifetime/exit evidence, protected control/output roots and actual pinned MXC behavior. TerminateJobObject success and job-empty snapshots are not independent original-process exit receipts. A job without process token/object protections does not itself establish an isolation boundary. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects).

## P. Boundary B evaluation

Boundary B remains a **conditional coherent design**, not an accepted runtime protection: trusted control-plane retains original capabilities; actual untrusted worker and malicious same-user actors must be denied dangerous process/token/job/control-file rights. Boundary A was not adopted. Boundary C's malicious same-user actor is retained; no silent narrowing to cooperative actors or own caller.

| Control | Required behavior | Minimum evidence | Root cause | Current acceptance |
|---|---|---|---|---|
| C01 | Authenticate exact invocation and original capability identity | PID+creation+image hash from original creation, creator/logon/token, durable host-issued nonce; never bare reported PIDs | RB1 | NOT_VERIFIED |
| C02 | Protect supervisor/control objects against worker and malicious same-user actor | Actual SD/label/token and effective dangerous process/token rights denied or safely isolated; pre-existing capability paths considered | RB3 | NOT_VERIFIED |
| C03 | Prevent external job admission/limit/control/handle transfer | Owned unnamed creation is insufficient; deny external DUP_HANDLE, ASSIGN/SET/TERMINATE and write/control paths; no already-inherited capability | RB3 | NOT_VERIFIED |
| C04 | Bind private admission and containment before target executes | Exact job-list/creator/target original handle plus independently established protection; active count1 is not exclusive admission proof | RB1/RB3 | SOURCE_ONLY |
| C05 | Track capability lifetime and independent exit | Owned close accounting; external duplicates affect last-close; original wait/exit+creation correlation independent of termination return or empty job | RB3 | SOURCE_ONLY |
| C06 | Physically protect authority/evidence/output roots | Untrusted actor cannot overwrite control JSON/build gates/receipts or publish unapproved output; hashes alone do not fence writers | RB3 | NOT_VERIFIED |
| C07 | Fail closed on unknown ownership/identity/observation | No dispatch/retry/takeover/cleanup by PID; quarantine and preserve uncertainty | RB1/RB3 | SOURCE_ONLY |
| C08 | Separate runtime readiness from audit and provider readiness | Pinned MXC/nested-job validation, real supervisor, crash, credentials/entitlement/billing separately accepted | RB1/RB3 | BLOCKED |


## Q. Same-user malicious actor limitations

Equal user, Medium IL, no local DuplicateHandle call and an unnamed job do not independently isolate actors. Actual token groups/deny-only/restrictions, object labels/DACLs, privileges, existing handles and code/control-file access determine reachability. Potential injection/tampering can undermine local JSON/hash issuance even if job handles were not deliberately exported. R5 measured no malicious grant and no denial; no absence-of-exploit proof is asserted.

Worker-equivalent restrictions must be observed on the actual selected runtime, and arbitrary equal-user actors remain in the threat model. If enforcing the required denials is impossible within the selected environment, the next decision must change the architecture/environment rather than reclassify malicious actors as trusted.

## R. Concrete security control gaps

| Root blocker | Cause / evidence | Consequence | Minimum resolution | Source change | Runtime | Owner authority | Acceptance |
|---|---|---|---|---|---|---|---|
| RB1 | Exact security objects and authenticated runtime context unavailable; V01-01/02,06/07,10/11; V02-13 through19; H01-H06/H08/H09 | Cannot state effective host/job/worker descriptors, tokens or existing granted handles | Owned identity-bound reporter; conditionally create one empty metadata-only job; actual worker needs separate pinned validation | No production change proved necessary; future disposable measurement entry requires separate reviewed implementation | true | Explicit new diagnostic process/API/job scope; never implicit R5 authorization | Actual object-bound SD/token/flags receipts with provenance and missing-field honesty; worker still blocked |
| RB2 | Approved field observer unavailable in permitted R5 facilities; observation-facilities; AC01 unobserved class fields; all independent granted masks absent | No descriptor denial, grant, complete mask, token-default ACL or full restriction inference allowed | Review minimal documented query-only observer; record API-specific outcomes and flags; if full masks not reliably observable leave unobserved and scope claims to particular used rights | Future diagnostic source may be needed; no new native component allowed R5; no production change implied | true | Reviewed source/build/hash activation separately authorized; no installs/privilege activation | READ_CONTROL/TOKEN_QUERY receipts, SD field separation, flags-only semantics, no fabricated masks/errors |
| RB3 | Effective actor boundary and pre-existing capability custody unverified; V02-16 through21; V03-05/06/14/19; R4 Boundary B conditional | No guarantee against malicious same-user process duplication, write/control, job admission, lifetime extension or receipt tampering | Prove prelaunch safe environment and denial of dangerous grants/transfers before job/control-bearing process experiment; later worker-equivalent negatives and physical fences | Architecture change only if required denial cannot be established; options explicit SD/token separation/protected broker or isolated execution boundary; none selected/implemented R5 | true | Any new actor test, isolated environment or architecture revision needs separate scope; threat model not relaxed | Actor-specific deny/allowed-operation evidence and custody; no target before containment; no exit proof inferred from termination return |


There are exactly three root causes; missing job token/SD/flags are correlated manifestations, not more independent blockers. C01-C08 are obligations, not evidence of enforcement.

## S. Architecture-change requirements

No architecture change is demonstrated mandatory by current effective-access evidence. Conversely, source-only restrictions cannot certify existing Boundary B. If actual accepted actor capabilities permit host duplication/write/control, job admission/limit change/termination, receipt tampering or uncontrolled lifetime extension, architecture/environment change is required before control-bearing execution. Candidate options include explicit object security and effective restricted-token separation, protected broker/custody, or an independent isolation boundary. These are conditional design branches, not selected changes or security configuration actions R5.

Denying process creation or reducing visible descendants alone does not close control-handle/file tampering paths. Minimal source changes cannot be selected honestly until actual object/token/capability evidence exists. The fresh query-only observer is measurement tooling proposed for later, not another process-control bridge.

## T. Controlled runtime verification requirements

**Design only — NOT AUTHORIZED.** Proposed M02-02S16B-R6 — Controlled Host-Owned Security Metadata & Containment Validation. Initial acceptance is limited to a zero-target M/J0 metadata tranche. No H1/H2, worker-equivalent target or control experiment is included. Metadata cannot prove full Boundary B. This is a new observation method and actual object capture, not repetition of the R4 read-only absence search.

Mandatory preflight:

| Gate | Required before dependent action | R5 state |
|---|---|---|
| PF01 | Explicit future authorization names M entry/build/API rights and conditional J0; no R3 native permit issuance | NOT_MET_R5 |
| PF02 | Reviewed minimal query source, exact binary hashes/toolchain, protected input/evidence root; no mutable untrusted authority | NOT_MET_R5 |
| PF03 | Original launcher/creator identity and exact M context known; no required privilege/elevation/security modification | NOT_MET_R5 |
| PF04 | Safe M diagnostic execution and hang/crash disposition independently reviewed BEFORE launching M; no test target | NOT_MET_R5 |
| PF05 | Before J0, independently demonstrate no unsafe external existing/new duplicate/admission/limit-change or M-tamper capability; snapshot alone cannot prove this | NOT_MET_R5 |
| PF06 | Original resource ownership, non-actuating cleanup conditions, query disposal/LocalFree accounting and failure quarantine approved | NOT_MET_R5 |
| PF07 | Finite resource/time budgets and stop-before-next-creation behavior accepted; blocked API cannot be forcibly preempted under this protocol | DESIGN_SPECIFIED_NOT_ACCEPTED |
| PF08 | Acceptance explicitly limited to exact M/J0 metadata; no worker/control/crash boundary PASS; if gate impossible route architecture/environment decision rather than repeat static audit | DESIGN_SPECIFIED_NOT_ACCEPTED |


| Protocol item | Topic | Requirement / stop boundary |
|---|---|---|
| P01 | Exact objects | M: one trusted metadata reporter's own process/token, original query wrappers; J0: at most one fresh unnamed empty job, only after separate pre-creation gate. No existing AI host target, no worker, no target/child/thread control objects. |
| P02 | Creators | Owner-approved trusted launcher starts M only after its own prelaunch review. M alone may create J0 after gate. No job name/reopen, foreign assignment, worker-produced authority or R3 native entry. |
| P03 | Process/token | Exact M creator/logon/IL/restrictions/privileges/default DACL must be bound; query M's actual token. AC01/02/03 are historical caller samples, not M equivalence. No privilege/elevation/token changes. |
| P04 | Provenance | Before future execution, review fresh minimal disposable diagnostic source and exact binary hashes/compiler inputs and safe root. Old R3 guard/issuance remains locked; no quarantined binary reuse or candidate substitution. Build/entry implementation is not authorized by R5. |
| P05 | OS rights | Own process SD READ_CONTROL, own token TOKEN_QUERY; query classes explicit. No ACCESS_SYSTEM_SECURITY, SeSecurity/SeDebug, DUP_HANDLE, VM_WRITE, CREATE_THREAD, TERMINATE requests. CreateJobObject's documented original ALL_ACCESS is a broad returned capability, not a minimal query handle: retain in M only, gate against exposure before creation. |
| P06 | New processes | Exactly one newly launched M requires fresh authorization plus independently reviewed safe execution before its code starts. No secondary metadata helper, synthetic worker/target, MXC, app-server or provider. If prelaunch safety cannot be demonstrated, do not launch M. |
| P07 | Job need | A real created object is needed to obtain its actual descriptor; maximum one J0. M self-metadata first; J0 creation forbidden unless dangerous external access/capability exposure, code/root tampering and cleanup hazards are independently excluded by reviewed evidence. A DACL snapshot alone is insufficient. Otherwise stop before creation with explicit architecture/environment decision; do not retry an identical audit. |
| P08 | Descriptors | Capture M and J0 owner/group/DACL plus mandatory label via separate LABEL_SECURITY_INFORMATION. Query actual TokenDefaultDacl separately. READ_CONTROL suffices for label query; full SACL is excluded. Never treat defaults as object bytes. |
| P09 | Rights and results | Record exact requested masks, successful operations, API status and valid lengths. Independent granted masks only from a separately approved reliable observer, otherwise GRANTED_ACCESS_MASK_NOT_OBSERVED. GetSecurityInfo returns a DWORD error code; BOOL APIs need immediate GetLastError on failure. No fabricated error5 or rights. |
| P10 | Inheritance | GetHandleInformation on original owned handles only; record INHERIT and PROTECT_FROM_CLOSE. No child creation or transfer experiment in this tranche, so actual child-inheritance denial remains unverified. Do not invoke DuplicateHandle, including for measurement. |
| P11 | External duplication | No unrelated process opening, global handle table, token/control duplication or attack probe. Evaluate M's object SD/token plus validated custody/execution boundary and pre-existing-capability assumptions. These cannot prove malicious-worker denial; any unresolved unsafe capability blocks J0 and all control-bearing stages. |
| P12 | Preexecution containment | Required before launching M: independently reviewed immutable/protected diagnostic provenance, exact permitted identity, no untrusted code/inputs, bounded query-only entry and containment/cleanup reasoning for this zero-target diagnostic scope. Before J0 require effective protection against external duplicate/assign/limit-change and M tamper; no assumption that unnamed or same-user means safe. Never set KILL_ON_JOB_CLOSE or other limits, assign a process, resume/terminate a process, or run R3 H1/H2. This tranche does not test worker confinement. |
| P13 | Identity | Record invocation nonce, original launcher binding, original M PID+creation time+image hash, exact creator-token metadata and opaque resource IDs; no bare PID reopening. Record query-start, process-created and query-completed timestamps separately, sanitize private identifiers, persist provenance/hashes before dependent claims. |
| P14 | Cleanup | Only known original owned query resources; token wrapper disposal, LocalFree SD buffers, close J0 only under pre-approved non-actuating ordinary-close custody conditions. Zero assign/limit changes; unexpected membership/limits/identity/holders means STOP and quarantine, no broad cleanup/kill or rights escalation. Last-close safety cannot be assumed if external SET_ATTRIBUTES/ASSIGN access was not excluded before creation. |
| P15 | Exit confirmation | Original M wrapper observes natural exit and exit code with bounded wait. This confirms only M, not a job tree. If M hangs/crashes, record uncertainty; no PID kill/reopen/takeover. No target exit is expected because target budget is zero; no termination/empty snapshot substitution. |
| P16 | Crash limits | M crash can lose unpublished metadata or leak temporary evidence. No claim of supervisor-crash recovery, durable kill authority or exit receipts. No kill-enabled job or managed target exists. A separately scoped controller/control-stage requires its own proof; R6 metadata cannot close S16 crash blocker. |
| P17 | Process/resource budget | One M; zero workers/targets/descendants; zero existing unrelated process queries; at most one unnamed empty J0 and one token-query wrapper; no control duplicate, no security writes. Execution attempts one; failed preflight means zero launch/zero job. |
| P18 | Timeouts | Design: 5 seconds per query/phase observation, 20 seconds metadata budget, 25 seconds outer natural-exit observation; stop scheduling new work on overrun. These are observation budgets, not a guarantee of preempting a blocked native call. No forceful cleanup fallback; Owner must accept unresolved reporter-only hang risk before authorization. |
| P19 | Stop conditions | No explicit authorization; unknown/elevated creator or privilege need; changed source/hash/root; unverifiable safe prelaunch; any external capability/custody uncertainty before J0; unexpected security state/membership/limits; invalid length/API result; required observation unavailable; query timeout; partial creation; unexpected child; candidate-dependent action. Preserve receipts and fail closed, no auto retry. |
| P20 | Owner authorization and acceptance | Separate authorization must enumerate M launch, reviewed disposable query component/build, exact query rights and conditional one-job scope plus environment, crash/hang disposition and deadlines. R5 grants none. Acceptance: actual M SD/token and, only if gate permits, actual J0 SD/flags/default-limit/empty-membership observations with balanced query resource accounting and honest unobserved fields; one decision if blocked before J0. Never runtime Boundary B PASS or real-worker activation. |


The M launch itself is a future process and must pass safe prelaunch review; calling it metadata does not exempt it. J0 gets its own stricter gate because the original returned job capability is broad: no external admission/limit-changing/duplication/tamper exposure may be assumed away. No KILL_ON_JOB_CLOSE or AssignProcessToJobObject is allowed in this tranche. Snapshot emptiness alone cannot authorize close if an attacker could alter limits/admit members. If that gate cannot be independently satisfied, stop before J0 with explicit architecture/environment disposition, not another unchanged audit.

## U. Independent adversarial review

**INDEPENDENT_REVIEW_PASS**, scoped to decision C and evidence accuracy only. Separate second pass by the same agent after primary-analysis-draft.md was persisted; not an independent third-party/second-agent attestation and not runtime Boundary B PASS or authorization.

Two limitations were explicitly reconciled without changing original evidence: AC02 CSV parsing did not produce integrity/admin attributes, and AC02/03 observedUtc is query initialization before process creation, not sample/completion time. AC03 is a distinct focused query. Mandatory contradictions after this pass:0. Mandatory safety/runtime prerequisites remain unresolved; therefore no positive design-readiness or worker acceptance.

| Challenge | Question | Review finding | Evidence / safeguard | Residual blocker |
|---|---|---|---|---|
| IR01 | Caller confused with actual supervisor? | NO mandatory contradiction | AC01/02/03 identity scopes and no TokenId correlation explicitly preserved; T02/T04 unavailable | No host or worker token acceptance |
| IR02 | Descriptor inferred for nonexistent job? | NO mandatory contradiction | V01-07 OBJECT_NOT_CREATED; source default model distinguished | Actual job SD still missing |
| IR03 | Token default DACL confused with process SD? | NO mandatory contradiction | V01-12, H/I, separate READ_CONTROL and TOKEN_QUERY obligations | No actual template or process SD observed |
| IR04 | DACL access confused with already granted handle rights? | NO mandatory contradiction | K/L/Q preserve pre-existing capabilities and no retroactive revocation assumption | External existing holders unverified |
| IR05 | GetHandleInformation claimed to expose masks? | NO mandatory contradiction | V03-10/13 and K explicit flags only; API never invoked | Full masks remain NOT_OBSERVED |
| IR06 | Low IL assumed? | NO mandatory contradiction | Only AC03 Medium directly reported; AC01/02 unknown retained | Worker IL unknown |
| IR07 | Restricted worker assumed? | NO mandatory contradiction | T05/I; source alternatives not selected runtime token | Worker token blockade retained |
| IR08 | Unnamed job assumed unreachable by duplication? | NO mandatory contradiction | H05/L and PF05 expressly require external capability evidence | No actual deny proof |
| IR09 | Source bInheritHandles=false treated as runtime proof? | NO mandatory contradiction | V03-12 SOURCE_VERIFIED; flags not observed | No child-transfer test authorized |
| IR10 | Already inherited handles ignored? | NO mandatory contradiction | H06, L and controls C02/C03 include prior capabilities | Future allowlist/custody required |
| IR11 | PROCESS_DUP_HANDLE ignored? | NO mandatory contradiction | Q12/Q13, C02/C03, D06 source/target rights considered | No duplication probe R5 |
| IR12 | All same-user tokens assumed equivalent? | NO mandatory contradiction | Context separation plus attributes/restrictions/privileges considered | Actual malicious actor token unknown |
| IR13 | Same-user automatic isolation assumed? | NO mandatory contradiction | Q and Boundary B conditional with malicious actor in scope | Denied effective rights must be proven |
| IR14 | No exploit observed treated as denial? | NO mandatory contradiction | Q13 and V03-19 state no hostile grant and no denial; zero QUERY_DENIED | No positive OS boundary acceptance |
| IR15 | Handle lifetime extension ignored? | NO mandatory contradiction | H05/H06/H14 and local-versus-external ledger limits | Last-close guarantee unverified |
| IR16 | Job termination equated with independent exit? | NO mandatory contradiction | O and C05 require original wait/exit/creation correlation; no target created | Crash/exit runtime gates blocked |
| IR17 | Test recommended without safe cleanup precondition? | NO mandatory contradiction | P06/P07/P12/P14 and PF04-PF06 gate M/J0 before creation; no kill/assign/targets; unresolved capability stops J0 | Preflight not established; A design-ready explicitly rejected |
| IR18 | Pinned candidate restored/substituted? | NO mandatory contradiction | Candidate absent; future metadata independent; pinned worker blocked | Final integrity must confirm absence |
| IR19 | Threat model narrowed without Owner approval? | NO mandatory contradiction | B conditional, A not adopted, C malicious same-user retained | Any future architecture/environment revision separate decision |
| IR20 | Identical read-only audit recommended? | NO mandatory contradiction | One R6 new approved query observer plus actual M/J0 metadata under new authorization; no historical rerun or absence search | No automatic R6 activation; if safe creation impossible route explicit architecture/environment decision |


## V. Missing Codex candidate status

**MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE**. The historical candidate location is CANDIDATE_ROOT/candidate/bin/codex.exe under the preserved S4 evidence root; it is absent and not restored/substituted. Forty-five previously missing artifacts remain historical R2 reconciliation, not silently repaired R5. Candidate absence does not prevent an independently authorized M/J0 host-only metadata diagnostic, but blocks actual pinned MXC token/nested-job/worker validation.

## W. Historical PID limitations

PID23376 and PID23644 remain **HISTORICAL_PROCESS_IDENTITY_UNRESOLVED**. They were not queried, duplicated, reopened, killed or treated as current identities R5. AC01/02/03 are separately newly observed metadata identities; their successful exits resolve no historical PID uncertainty.

## X. Source/system integrity

Final comparison receipts: final-integrity.json. Existing **447 AI OFFICE files** unchanged byte-for-byte within baseline scope; exactly **2 new repository reports**, final **449 files**. Git scope **124 pre-existing entries preserved**, final **126** with only the two report additions. Protected **22 roots /2478 files** preserved, including R3=67, R4=19 and installed active-Codex distribution=50. R3/R4 manifests and all previous reports/bridge files unchanged. **Hermes3D647 tracked files** retained their hashes and path set. AI snapshot excludes directories named .git and node_modules; protected roots are fully hashed; Hermes claim covers its tracked baseline. Existing user work was neither reset nor overwritten. No whole-disk/whole-process assertion is made.

Pinned candidate remains absent; R3 authorization.json and build-gate.json remain absent. Existing historical independent-review.json remains SAFETY_REVIEW_INCONCLUSIVE/runtimeAuthorized=false; existing prelaunch.json remains pass=false/HOST_ONLY_RUNTIME_NOT_AUTHORIZED. Their presence is not runtime issuance. Final report hashes are in final-integrity.json and manifest.json. New evidence manifest hashes all other new audit files and excludes itself. One explicit TOKEN_QUERY wrapper disposed; two metadata-only whoami commands naturally exited0 and their original Process wrappers were disposed. Zero synthetic targets/jobs/control-handle duplications/terminations. These receipt counts do not count the orchestration shell processes as synthetic targets. Source/system claims are final hash comparisons plus the R5 command record, not global kernel monitoring.

No new native binary, quarantined binary execution, job, synthetic target/worker, MXC/app-server/real worker, token/DACL/IL change, privilege activation/elevation, control duplication, process termination, dependency install, security/global configuration change, inference/paid API or credential access was performed. These are scoped R5 action receipts and unchanged-hash comparisons, not a machine-wide syscall monitor.

Official-documentation browsing is explicitly disclosed. There was no host metadata/harness/provider external-network action; the literal whole-session “no external network activity” claim is not made because documentation was fetched.

## Y. Final decision

**C — CONTROLLED_RUNTIME_EVIDENCE_REQUIRED**, exactly one selected.

| Option | Selected? | Reason |
|---|---|---|
| A CONTROLLED_VALIDATION_DESIGN_READY | NO | Safe prelaunch/actor boundary, approved observer and custody prerequisites are not independently established; protocol specification is not readiness |
| B ARCHITECTURE_DECISION_REQUIRED | NO | No measured unavoidable dangerous grant demonstrates mandatory redesign |
| C CONTROLLED_RUNTIME_EVIDENCE_REQUIRED | YES | Missing exact objects and approved field observer require bounded fresh OS evidence; safe gates remain explicit |
| D BOUNDARY_INSUFFICIENT | NO | No actual unavoidable boundary failure demonstrated |
| E EVIDENCE_BLOCKED | NO | Accessible checkpoint/source/caller evidence permits classification and one concrete action |


Explicit Q01-Q20 answers:

| Question | Answer | Evidence level | Evidence |
|---|---|---|---|
| Q01 Current host metadata available? | No authenticated current host object available to this audit; global existence UNKNOWN. No scan or old PID reuse. | NOT_VERIFIED | V01-01/02 |
| Q02 Direct observations? | AC01 sanitized user/token-owner/impersonation + TOKEN_QUERY success/disposal; AC02 privileges and natural exit; AC03 Medium integrity/admin deny-only and natural exit. Descriptors/masks not observed. | CURRENTLY_OBSERVED | V02-01/02/03/05/06/07; V03-07/18 |
| Q03 Caller representative of supervisor? | No identity/token correlation established; three caller contexts are separate and none is a production supervisor. | NOT_VERIFIED | AC01/02/03; preflight |
| Q04 Private job currently exists? | The audited R3 invocation never created its job. No global claim about unrelated jobs. | OBJECT_NOT_CREATED | V01-07 |
| Q05 Can effective job DACL be read now? | No object exists for this invocation; no descriptor query was attempted. | OBJECT_NOT_CREATED | V01-07 |
| Q06 Future worker token observable? | Not created and pinned runtime unavailable; not a permission denial. | OBJECT_NOT_CREATED | V02-16 |
| Q07 Worker IL known? | No; AC03 Medium is not worker IL and no Low inference is allowed. | NOT_VERIFIED | V02-17 |
| Q08 Worker restrictions known? | No actual worker restriction/AppContainer/mandatory-policy query; source alternatives do not select a runtime token. | NOT_VERIFIED | V02-18/21 |
| Q09 Effective control masks available? | No independently measured complete granted masks, including query wrapper; no control objects created. | OBSERVATION_METHOD_UNAVAILABLE | V03-01 through11 |
| Q10 Rights only requested/source-modelled? | TOKEN_QUERY explicitly requested and selected operations succeeded AC01; R3 creation yields documented broad original handles; job QUERY/SET/ASSIGN/TERMINATE, process QUERY/SYNCHRONIZE/TERMINATE and thread RESUME are source usages, not measured runtime masks. | SOURCE_VERIFIED | V03-02/03/04/07/17 |
| Q11 Inheritance settings source verified? | Null attributes/default noninheritable job and bInheritHandles=false; GetHandleInformation bit1 assertions in source. Not executed and no live flag receipt. | SOURCE_VERIFIED | V03-06/12 |
| Q12 Duplication risks hypothetical? | External actor obtaining DUP_HANDLE then copying job/control capability, delaying last-close or setting/admitting members. No current exploit/denial observed; unnamed/source noDuplicateHandle does not exclude it. | DOCUMENTED | V03-05/19; D06 |
| Q13 Risks supported by current evidence? | Source has broad creation capabilities/default descriptors and local ledger; actual actor grants unknown. R5 observes no hostile grant. Safe admission cannot rely on absent local duplication call or local JSON hash gates. | SOURCE_VERIFIED | R3Native73/88; AdmissionLifetime; RB3 |
| Q14 Boundary B defensible without narrowing? | Coherent conditional design only: actual worker restrictions plus denial of dangerous host/job/receipt rights must be proven; malicious same-user actor remains. Not accepted as OS boundary. | INFERRED | RB3; controls C01-C08 |
| Q15 Architecture change demonstrated? | No unavoidable unsafe effective grant proved. Source-control improvements/isolated broker may be required if future evidence fails; no production redesign selected now. | NOT_VERIFIED | RB1-RB3 |
| Q16 Next evidence requires OS experiment? | Yes: actual object SD/token/flags cannot be recovered from absent instances/source alone; new minimally scoped measurement entry needs fresh authority. | INFERRED | V01-03/07; RB2; protocol |
| Q17 Bounded safe prelaunch protocol possible? | A gated zero-target metadata protocol can be specified. Safety not yet demonstrated or authorized; M and optional J0 each have independent stop-before-creation prerequisites. No target experiment is ready. | DESIGN_SPECIFIED | P01-P20 |
| Q18 Missing safety prerequisites? | Reviewed query entry/binary/root; exact creator identity/token and pre-existing capability/custody boundary; trusted prelaunch containment; authorized cleanup/hang policy; effective external denial before J0. No claim these are already met. | NOT_VERIFIED | Protocol preflight PF01-PF08 |
| Q19 Missing candidate affects host-only next? | Not required for M/J0 diagnostic; blocks pinned MXC worker/nested-job validation. No restore/substitute. | CURRENTLY_OBSERVED | preflight; V/W; protocol |
| Q20 One next action? | Owner review and separately authorize the bounded R6 M/J0 metadata protocol including mandatory preflight and acceptance; do not start it automatically. | REQUIRES_OWNER_DECISION | Protocol P20; decision C |


## Z. One recommended next action

Owner review and separately authorize **only the bounded R6 M/J0 metadata protocol in T**, including its mandatory preflight, zero-target budget, no-actuation cleanup and stop conditions. Acceptance is new identity-bound process/token and conditional empty-job metadata with honest mask limitations, or an explicit stop-before-creation architecture/environment decision if safety fails. This is not authorization to begin R6, S16C/S17, H1/H2 or production integration.

Real coding worker remains **BLOCKED**. R5 completion is a decision milestone, not S16 completion or runtime containment acceptance.

