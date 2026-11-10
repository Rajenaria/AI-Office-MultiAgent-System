# M02-02S16B-R6W-JC-CRASH-R1 Read-Only Provenance & Residual Custody Report

Evidence root: <TEMP>/ai-office-m0202s16br6wjccrashr1-4f77134b-3717-4ddd-9255-fb113ebc1f66. Semua path evidence ringkas relatif ke evidence/; CRASH/ merujuk preserved previous root ai-office-m0202s16br6wjccrash-13297220-b3fb-4b2a-ac08-2dada411505b. Audit date2026-11-07 Asia/Jakarta; exact observation UTC below.

## A. Executive decision

RESIDUAL_ACTIVE_ACTION_REQUIRED. Watchdog10036 cocok creationFILETIME134384829523445415, exact image path dan diskSHA5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051. Pada2026-11-07T00:29:14.2340052Z wait0=258, ExitFILETIME0, GetExitCode259: verified historical watchdog belum signaled exit pada observasi tersebut. Tidak ada control/mutation/cleanup. Provenance PID24956 tetap INCONCLUSIVE; original CRASH SECURITY_STOP tidak berubah.


## B. CRASH checkpoint

CRASH SECURITY_STOP verified sebelum livequery: manifestSHA256CD4C02650617F7376365F0317E5D082E17E711399DEB3A3713DB370B154ECF0B,85entries/86files; two existingreport hashes matched. Historical56static/34fake/35review/32prelaunchPASS retained, notrerun or elevated intoOSproof. Hardstop0,recovery0,retry0. Coordinator rawRUNTIME_INCONCLUSIVE remainsraw; WDHOLD establishes originalSECURITY_STOP.


## C. Read-only authorization boundary

Satu sesi query read-only nonadmin/nonSYSTEM: CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS2), Process32FirstW/NextW; OpenProcess0x00101000 untuk tiga kandidat,0x00001000 untuk relevantparent9820; GetProcessTimes, QueryFullProcessImageNameW, GetExitCodeProcess, WaitForSingleObject0, CloseHandle hanya handle query/snapshot milik auditor. Satu snapshot complete,297entries transiently scanned, hanyaWD row disimpan; bukan full inventory. Tidak ada polling/background monitoring, processmemory/modules/handle enumeration, Jcquery, mutation, elevation, privilege enabling, atau historicalbinary execution. csc/PowerShell audit tooling memang meluncurkan ordinary audit processes; bukan zero OS processes launched.


## D. Source and evidence provenance

All historical13source/4binary hashes matchCRASHmanifest. No historicalbinary executed. NewReadOnlyQuery.dll is only a read-only audit helper, not watchdog/reporter/target; reviewed9imports plus source and nonadmin check. Compilation x64/warn4/warnaserror+,exit0/0warnings; compiler existingtrustedFramework64. File-hash integrity does not imply authenticated OS event history.

| Artifact | SHA-256 |
| --- | --- |
| ReadOnlyQuery.cs | 0917EF74821F47A3E47F6B28B86A1519FE46229BC917074C1F8A77DEA422CD3A |
| ReadOnlyQuery.dll | 2B99343CC4BECC388E084CFD19C0370EED5130CD1FC3343E5F9D5B694C4CD1D9 |
| Compiler | ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3 |

| Historical source | SHA-256 |
| --- | --- |
| source/coordinator/CrashPolicy.cs | C0B9217E3A7E3FA75B8181A55A65A455089AA7D29FAE4EA8DC5372C234D539E1 |
| source/coordinator/Native.cs | 36208DC200BC0678A80F69E1F990622229EEDF17736CAEF858D03842BD724932 |
| source/coordinator/Observer.cs | FFE7A8ECE833EB9B407C95A9E65EE98EBA6622010C46FEA87EDC7D5E66FF937B |
| source/coordinator/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| source/watchdog/CrashWatchdog.cs | 129CA1D7D395EDE1979EFB126DCA12286A7D502D6CB79D0B33CCF7A2DB0A4947 |
| source/watchdog/Lifecycle.cs | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/NativeHost.cs | DB797883179ABF8C5BB8B487881FB7772D15F3863E1CE067BC96440366C173B2 |
| source/watchdog/PrivateContainmentJob.cs | 93AC5984A67F18705B052BC27BA57DE58E968113291D63EA044563070FC86855 |
| source/watchdog/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| source/watchdog/ReporterReceipt.cs | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/synthetic-target/Program.cs | A6EEBB60C3E632ECD26C981AD982003E299D4473F0909617C39345073017246F |
| source/synthetic-target/Protocol.cs | 5803A8DE160EBA6B288F861EE975F31759788968507EB70ED985503BE45116B0 |
| source/tests/CrashTests.cs | A4A52FB49571373F9CADED2F174BD71B02E2614B12A68340D59D6F9F87A0DC57 |


## E. Historical experiment timeline

Jc create/empty0 -> configure/readback0x2000 -> observeroutside -> atomic suspendedtarget -> identity/membership1 -> resume -> targetREADY -> membership2 -> failure/HOLD -> coordinatorabort/wait258/close -> coordinatorexit40 -> targetselfreceipt. ResourceEvents and JobEvents are separate arrays, not one timestampednative stream; cross-array ordering is source-supported. UTC, FILETIME100ns and QPC-derived milliseconds are kept separate.

| Receipt | Clock fields | SHA-256 |
| --- | --- | --- |
| CRASH/evidence/ownership/coordinator.json | {"Creation":134384829519795274,"QpcMs":220608781} | 6247842BB2B508542741C4802AF2933298943A7B85269ECD7F4D84D0F3301457 |
| CRASH/evidence/ownership/watchdog-original.json | {"Creation":134384829523445415,"QpcMs":220609004} | 85F92FF9CA14932E008AC81FB523076340B6F04078CFF84225BC8DD38E871C9F |
| CRASH/evidence/job-configuration/configured.json | {"QpcMs":220609150,"WatchdogCreation":134384829523445415} | 2239874E1A6E776463577E56DE669BBF86FC30D149F40F5B8DF4376B5B27256C |
| CRASH/evidence/ownership/observer-outside.json | {"Creation":134384829519795274,"QpcMs":220609147} | 2D54A19460AEB435600CEC26358DD92E97A52ECD2894E0005B60BF77EBF39845 |
| CRASH/evidence/ownership/target-original.json | {"QpcMs":220609259,"TargetCreation":134384829525959601} | D2B5DDEF24A493D258C95B64CCF689F3165E251EBCA551579030A546296A42BC |
| CRASH/evidence/readiness/target-ready.json | {"DeadlineQpcMs":220699318,"StartedQpcMs":220609318,"Utc":"2026-11-06T23:55:52.7329794Z","ReadyQpcMs":220609379,"TargetCreation":134384829525959601} | FE4B880EC8EEACBD38ADA76044B08D05C8DAA393E24EB4BA399BA8565431363C |
| CRASH/evidence/runtime/watchdog-failure.json | {"QpcMs":220609397} | 38C2B7BD64AC517FDB2E50B47D8BFDAC68AE226BAB9C0CEBC665A3C399F9265D |
| CRASH/evidence/runtime/prearm-abort.json | {"QpcMs":220618793} | CDFF3FEE2EB625EA91F2FFF9C4DC115FF0D98C19469945FB3F2172C408DDE93B |
| CRASH/evidence/exit-observation/final.json | {"CompletedQpcMs":220623826,"Utc":"2026-11-06T23:56:07.1809609Z"} | 15B28277C29DFDE7A1C755A81BD1BDC931626D79DDDFBD154DD1BB329FA3BDB9 |
| CRASH/evidence/exit-observation/outer-result.json | {} | 2BE724D3C7444243A160651B1A6E2B1AD3A2FFE8205A6E43B5E48288603A189C |
| CRASH/evidence/readiness/target-self-exit.json | {"ExitQpcMs":220699331} | 80489419CF5062E36C609487205C408425DA70667DEB606C38510B1CBFCFC1EB |


## F. Raw membership query

Preserved receipts contain parsed Assigned/Ids and combinedwrapper Success/Win32Error. They are not raw native buffers. Each of fourqueries was made by historicalwatchdog10036 through JobApi.Members class3. Raw returnlength/count/alignment/timestamp not retained; successful source path conditionally implies assigned==count, not independently preservedactualcount.

| Event index | Query | Assigned | Serialized IDs | Returnedcount / n | Complete raw proof |
| --- | --- | --- | --- | --- | --- |
| 3 | QueryInformationJobObject(initial members) | 0 |  | NOT_RECORDED / NOT_RECORDED | UNAVAILABLE; source-conditional only |
| 15 | QueryInformationJobObject(admission members) | 1 | 32684 | NOT_RECORDED / NOT_RECORDED | UNAVAILABLE; source-conditional only |
| 18 | QueryInformationJobObject(admission members) | 2 | 32684,24956 | NOT_RECORDED / NOT_RECORDED | UNAVAILABLE; source-conditional only |
| 19 | QueryInformationJobObject(final members) | 2 | 32684,24956 | NOT_RECORDED / NOT_RECORDED | UNAVAILABLE; source-conditional only |


## G. Membership parser validation

JobApi.Members source memakai QueryInformationJobObject class3,4096-byte fresh HGlobal, DWORD offsets0/4, x64 ULONG_PTR offset8 stride8. Layouts mensyaratkan IntPtr.Size8; n8..4096,count<=511,8+count*8<=n,assigned==count,PID1..uint.MaxValue; foreach singleton admission rejects extraPID. Tidak ditemukan demonstrated layout/bounds defect yang menjelaskan24956. Header dibaca sebelum n>=8 diperiksa; short n tetap tidak dapat diterima. Error native dan parser rejection tidak dipisahkan sehingga error saat parserfalse dapat stale. Rawbuffer,independent returnedcount,n,actual pointeralignment dan per-query timestamps tidak tersimpan: historical binary hash/source supports interpretation, bukan independent raw replay. Tidak mengoreksi historicalmembership atau mengubahsource.

| Topic | Implementation | Finding |
| --- | --- | --- |
| Information class | 3 JobObjectBasicProcessIdList | Correct source call31-37 |
| DWORDs | offset0 assigned,offset4 returnedcount;32bit unsigned | Correct source; reads before n>=8 validation but cannot accept short n |
| ULONG_PTR | offset8,stride8,readInt64 | Correct x64-only path; Layouts blocks non8 pointer width |
| Allocation | 4096 bytes per query | Fresh buffer/free finally; raw initialization/alignment not recorded |
| Count bounds | n8..4096,count<=511,8+count*8<=n,assigned==count | Fail-closed incomplete list; no retry/fallback |
| Zero members | n>=8,count0,assigned0 | Accepted source; historical initial wrapper accepted0 |
| PID conversion | v>0 and<=uint.MaxValue | Reject invalid/truncated range; runtime identifiers are DWORD |
| Loop bounds | k<ids.Length=count | No detected off-by-one in supported x64 path |
| Receipts | Assigned and Ids only | Returnedcount/ReturnLength/raw bytes/per-query timestamp omitted; independent replay impossible |
| API error | wrapperfalse logs api.Error later | Possible stale error after native success+parse rejection or finally; no explicit parse error separate from native failure |
| Duplicate IDs | not explicitly rejected in generic Members | Singleton Verify rejects count>1; no evidence explaining24956 by duplicates |
| Global correctness | No demonstrated offset/bounds defect producing24956 | Missing raw buffer prevents excluding every artifact; do not erase historical entry |

| Source | Line | Call site |
| --- | --- | --- |
| source/watchdog/PrivateContainmentJob.cs | 20 | bool Members(IntPtr job,out uint[] ids,out uint assigned); |
| source/watchdog/PrivateContainmentJob.cs | 34 | public bool Members(IntPtr h,out uint[] ids,out uint assigned){ |
| source/watchdog/PrivateContainmentJob.cs | 36 | try{uint n;bool ok=JobNative.QueryMembers(h,3,p,4096,out n);if(!ok)return false; |
| source/watchdog/PrivateContainmentJob.cs | 52 | [DllImport("kernel32.dll",EntryPoint="QueryInformationJobObject",ExactSpelling=true,SetLastError=true)][return:MarshalAs(UnmanagedType.Bool)]internal static extern bool QueryMembers(IntPtr job,int cls,IntPtr data,uint length,out uint returned); |
| source/watchdog/PrivateContainmentJob.cs | 70 | internal bool HoldRequired{get{return custody.Acquired&&!closed&&(contradiction//transfer//closeAttempted);}} |
| source/watchdog/PrivateContainmentJob.cs | 76 | private void Log(string name,bool ok,object data){Events.Add(new{Api=name,Success=ok,Win32Error=ok?0:api.Error,Data=data});} |
| source/watchdog/PrivateContainmentJob.cs | 77 | internal static bool Layouts(){return IntPtr.Size==8&&Marshal.SizeOf(typeof(BasicLimits))==64&&Marshal.SizeOf(typeof(IoCounters))==48&&Marshal.SizeOf(typeof(ExtendedLimits))==144&&Marshal.SizeOf(typeof(Startup))==104&&Marshal.SizeOf(typeof(StartupEx))==112&&Marshal.SizeOf(typeof(ProcessInfo))==24;} |
| source/watchdog/PrivateContainmentJob.cs | 79 | if(attempted)throw new InvalidOperationException("SECOND_JC_DENIED");attempted=true;if(!Layouts())return false; |
| source/watchdog/PrivateContainmentJob.cs | 83 | uint flags;bool flagsOk=api.Flags(job,out flags);Log("GetHandleInformation(Jc)",flagsOk,new{Flags=flags}); |
| source/watchdog/PrivateContainmentJob.cs | 85 | uint[] ids;uint assigned;bool empty=api.Members(job,out ids,out assigned);Log("QueryInformationJobObject(initial members)",empty,new{Assigned=assigned,Ids=ids}); |
| source/watchdog/PrivateContainmentJob.cs | 87 | bool inJob;bool member=api.Member(new IntPtr(-1),job,out inJob);Log("IsProcessInJob(watchdog,Jc)",member,new{Member=inJob}); |
| source/watchdog/PrivateContainmentJob.cs | 90 | bool set=api.Set(job,ref limits);Log("SetInformationJobObject(class9)",set,new{Flags="0x2000",Size=144});if(!set)return false; |
| source/watchdog/PrivateContainmentJob.cs | 91 | ExtendedLimits actual;bool query=api.Limits(job,out actual);Log("QueryInformationJobObject(class9)",query,new{Flags=actual.Basic.Flags,Size=144}); |
| source/watchdog/PrivateContainmentJob.cs | 98 | Log("InitializeProcThreadAttributeList(size)",!probe&&error==122,new{Bytes=size.ToUInt64(),ExpectedError=122}); |
| source/watchdog/PrivateContainmentJob.cs | 101 | bool initialized=api.Initialize(attributes,ref size);Log("InitializeProcThreadAttributeList",initialized,null);if(!initialized)throw new InvalidOperationException("ATTRIBUTE_INITIALIZATION_FAILED");attrsInitialized=true; |
| source/watchdog/PrivateContainmentJob.cs | 103 | bool updated=api.Update(attributes,values);Log("UpdateProcThreadAttribute(JOB_LIST)",updated,new{Attribute="0x2000d",HandleCount=1,ValueBytes=IntPtr.Size}); |
| source/watchdog/PrivateContainmentJob.cs | 110 | uint flags;bool flagsOk=api.Flags(job,out flags);Log("GetHandleInformation(Jc before resume)",flagsOk,new{Flags=flags}); |
| source/watchdog/PrivateContainmentJob.cs | 112 | bool member;bool ok=api.Member(original,job,out member);Log("IsProcessInJob(reporter,Jc)",ok,new{Member=member,PID=pid});if(!ok//!member)return false; |
| source/watchdog/PrivateContainmentJob.cs | 113 | uint[] ids;uint assigned;bool q=api.Members(job,out ids,out assigned);Log("QueryInformationJobObject(admission members)",q,new{Assigned=assigned,Ids=ids}); |
| source/watchdog/PrivateContainmentJob.cs | 122 | bool member;bool ok=api.Member(observer,job,out member);Log("IsProcessInJob(observer,Jc)",ok,new{Member=member});return ok&&!member; |
| source/watchdog/PrivateContainmentJob.cs | 131 | uint[] ids;uint assigned;bool q=api.Members(job,out ids,out assigned); |
| source/watchdog/PrivateContainmentJob.cs | 132 | Log("QueryInformationJobObject(final members)",q,new{ExitIndependentlyObserved=exited,Assigned=assigned,Ids=ids}); |
| source/watchdog/PrivateContainmentJob.cs | 135 | if(!MayClose){Log("JC_SECURITY_STOP_HOLD_NO_AUTOMATIC_EXIT",false,new{Contradiction=contradiction,TransferUncertain=transfer});return false;} |
| source/watchdog/PrivateContainmentJob.cs | 137 | closed=custody.Release(()=>api.Close(job));Log("CloseHandle(owned Jc)",closed,new{OwnerHandleKey=custody.Key,NoIntentionalTransfer=true,LastGlobalHandle="NOT_INDEPENDENTLY_PROVEN",ExitReceipt=false}); |
| source/watchdog/PrivateContainmentJob.cs | 141 | if(attributes!=IntPtr.Zero){if(attrsInitialized){api.Delete(attributes);attrsInitialized=false;}memory.Free(attributes);attributes=IntPtr.Zero;Log("attribute-list release",true,null);} |
| source/watchdog/PrivateContainmentJob.cs | 142 | if(values!=IntPtr.Zero){memory.Free(values);values=IntPtr.Zero;Log("job-handle-array release",true,null);} |


## H. Initial Jc membership

InitialemptyreceiptAssigned0; firstadmissionreceiptAssigned1/serializedIDs[32684]. Source verifies originaltarget IsProcessInJob, singletonlist and noinheritance beforeResumeThread(previouscount1). No native rawbuffer replay available.


## I. Unexpected member observation

Secondadmission and finaldisposition receiptsAssigned2/[32684,24956]. Source setsstickycontradiction foranydifferentID orAssigned>1; nofullWDREADY/noarm. Unexpected PID is historicalreceipt evidence, not a verified historicalidentity or origin. No correctedlist fabricated.


## J. Candidate provenance hypotheses

H1-H7 evaluated independently. No originverified. NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE is not CONTRADICTED or impossible; sourceabsence is not runtimeexclusion.

| ID | Hypothesis | Classification | Evidence |
| --- | --- | --- | --- |
| H1 | Synthetic target descendant | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | No child launch in Program/Protocol; creation/image/parent24956 absent. Source absence does not prove actual descendants0. |
| H2 | Watchdog-created helper | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | Reviewed WD launch path fixed target once; no helper receipt/call. Framework indirect behavior not exhaustively excluded. |
| H3 | Runtime/infrastructure helper | INCONCLUSIVE | No historical image/time/parent for24956 and no current lookup. No inference from framework name. |
| H4 | Nested child-job membership | INCONCLUSIVE | API permits aggregated child-job PIDs; WD ambient-job Membertrue historical receipt, but ambient job is not proof child of private Jc. No child-job creation evidence. |
| H5 | Membership parser defect | INCONCLUSIVE | Supported x64 layout/guards appear consistent; offline fixtures pass. Missing raw buffer/count/n blocks native replay. Observability defects confirmed, not origin-producing defect. |
| H6 | External assignment/unrelated process | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | No external access/assignment receipt. Intentional sole custody is not global exclusivity proof. No malicious attribution. |
| H7 | PID reuse/stale evidence confusion | INCONCLUSIVE | Current WD creation/image/hash match;24956 historical identity unknown and absent now. Same invocation sequence/hash reduces obvious stale mixing, cannot establish24956 origin. |


## K. Synthetic target source analysis

Program.Main startsProtocol/ownidentity, emitscurrentREADY, sleeps20ms until90sQPCdeadline, emitsSELFreceipt thenreturnsunique0x43525301. SharedProtocol validates ownfiles/currentinvocation, reads selfPID/starttime andhash. No directCreateProcess/Process.Start/job/network/provider path in inspectedtargetsource; trustedframework internals not fullytraced, no actualzero-descendant assertion.


## L. Watchdog source analysis

NativeHost.Create launchesfixedtarget once, atomicallysuspended. CrashWatchdog verifiesmembership before andafterresume. SecondVerify failurebecomesTARGET_NOT_LIVE_MEMBER; finallyskips targettermination ifHoldRequired, callsDispose which rechecksfinalmembers thenretainsstickycontradiction. SECURITY_STOP_HOLD writesreceipt and Sleep60000 loop. CurrentWDactive doesnot prove programcounter or threadstate; debugger/memory inspection notperformed.


## M. Coordinator source analysis

Observer launchesfixedWD withoriginalPROCESS_INFORMATION, verifiesidentity. MissingfullWDREADY leadsINVALID_RECEIPT_FILE before independenttargetquery/recoveryhandleacquisition. Cleanup writesabortfile, waitsoriginalWD5000=258, closesoriginalWDthread/process andimagelocks. No watchdoghardstop. RawCleanupClosed onlycoordinatorresourceclaim, not Jc destruction.


## N. Historical process identities

HistoricalWD:10036/creation134384829523445415/fixedimage+SHA. Historicaltarget:32684/creation134384829525959601/fixedimage+SHA. Historical24956:PIDonly,creation/image/origin unavailable. PID23376 dan23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED, bukan lookup/control candidates. Semua current queries adalah observation, bukan process-control authority.


## O. Current read-only process observations

One snapshot/session 2026-11-07T00:29:14.1835607Z to 2026-11-07T00:29:14.2340052Z. EntryWsize568,IntPtr8; enumerationterminal18 ERROR_NO_MORE_FILES after297entries; fullinventorynotpersisted. OnlyhistoricalWD rowpresent, parentPID9820. Querytargetobject may succeed despite absence fromprocesssnapshot; this happened and wasnot mislabeledabsence.

| PID | Snapshot | Open error | Creation | Image outcome | Wait0 | Query handle closed |
| --- | --- | --- | --- | --- | --- | --- |
| 10036 | True | 0 | 134384829523445415 | <USERPROFILE>\AppData\Local\Temp\ai-office-m0202s16br6wjccrash-13297220-b3fb-4b2a-ac08-2dada411505b\build\watchdog\CrashWatchdog.exe | 258 | True |
| 32684 | False | 0 | 134384829525959601 | UNAVAILABLE error31 | 0 | True |
| 24956 | False | 87 |  | UNAVAILABLE error |  | NOT_ACQUIRED |
| 9820 | False | 87 |  | UNAVAILABLE error |  | NOT_ACQUIRED |


## P. Creation-time correlation

WDFILETIME134384829523445415 exactmatch andtarget134384829525959601 exactmatch. Historical24956 creationmissing. TargetnewexitFILETIME134384830426947753 givesUTC2026-11-06T23:57:22.6947753Z; unlikeQPCselfreceipt itisOSqueryexitdata. Noexact24956 timingorder canbe established.


## Q. Executable identity correlation

WD exactcanonicalimage anddiskhash matchhistorical fixedbinary; currentin-memoryimagebytes notread, diskhashnotmemoryattestation. Snapshot tidak memuat32684, tetapi OpenProcess berhasil: process object tersisa masih dapat di-query. CreationFILETIME134384829525959601 cocok historicaltarget; wait0=0 WAIT_OBJECT_0, exitCode1129468673/0x43525301, exitFILETIME134384830426947753 (2026-11-06T23:57:22.6947753Z). Ini independent current query atas signaled object, lebih kuat daripada oldselfreceipt. QueryFullProcessImageNameW gagal31 ERROR_GEN_FAILURE; CURRENT_IDENTITY_NOT_VERIFIABLE untuk full two-dimension continuity, creation correlation PARTIAL. Tidak ada klaim current image terverifikasi, crash-causedexit, Jccleanup atau absence berarti historicalcleanexit.


## R. Parent-process correlation

SnapshotWDparentPID9820 agreeswith historicalcoordinatorlaunchreceipts/source, but currentparentOpenProcess87 and no currentcreationtime available. Thus currentparentPID alone notstrongidentityproof. No24956parent/image/time records. Security4688 searchUTC23:55:45..23:56:15 (max128) returnedNoMatchingEventsFound; SysmonOperational logNoMatchingLogsFound. Neither means auditingwasdisabled or no historicalcreation; no configurationchanged.


## S. PID reuse analysis

WD twoidentitydimensionsplusdiskhashruleout observedWD PIDreuse at query. Targetexactcreation supportsmatchingobject but imageunavailable =>CURRENT_IDENTITY_NOT_VERIFIABLE/fullcontinuitypartial.24956no currentownerandnohistoricalcreation means historicalreusecannotbe resolved. No actualCURRENT_PID_REUSED_DIFFERENT_IDENTITY observed; fixtures prove mismatchhandlingonly.

| PID | Identity contract | Evidence limitation |
| --- | --- | --- |
| 10036 | CURRENT_PID_MATCHES_HISTORICAL_IDENTITY | Creation, exact image path and disk image hash match; wait0=258 at recorded observation only |
| 32684 | CURRENT_IDENTITY_NOT_VERIFIABLE | Exact creationFILETIME; independently signaled process object with exitCode0x43525301, but current image unavailable ERROR_GEN_FAILURE31; full identity continuity not claimed |
| 24956 | NO_CURRENT_PROCESS_WITH_PID | No historical creation/image; no current PID observed; historical exit/provenance unknown |


## T. Nested-job interpretation

JOBOBJECT_BASIC_PROCESS_ID_LIST can include processes in childjobs. HistoricalIsProcessInJob(watchdog,anyjob)=true onlyprovesanambientassociation then; itdoesnotestablish that a nestedchildjobexistsbeneathprivateJc or caused24956. Source createsoneJc/nochildjob. H4INCONCLUSIVE; no directcurrentJcquery authorized.


## U. Residual watchdog custody

Jc private unnamed, auditor tidak mempunyai handle valid untuk historicalJc. CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE. Tidak membuat substitutejob, memakaiNULL untukcallerjob, membuka namedjob lain, menduplikasiWDhandle, enumerasihandletable, membaca processmemory atau mengirim perintah keWD. HistoricalHOLD menunjukkan retainedJc dan targethandles; liveWD+sourceHOLD konsisten dengan custody yang masih relevan, tetapi bukan currenthandle-table proof. ObjectJc destruction/last-global-handle event dan currentmembers belum diketahui.


## V. Original handle closure interpretation

Coordinator closeditsown originalWDprocess/thread handles afterwait258. ThisdidnotcloseWD-ownedJc or proveWDexit. NewR1 queryhandle openedwithread-onlyrights andclosed; itdoesnotrestoreoriginalcontrolauthority. SourcehistoricHOLD retainsoriginaltargethandles andimagelock; currentholderidentity notenumerated.


## W. Current Jc visibility limitations

CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE. No valid authorizedhistoricalJchandle. No nulljobquery, substitutejob, externalhandleacquisition, debugattach or forcedWDstatechange. No presentmembershipcount, lastglobalhandleproof or destructionclaim.


## X. Residual process-state matrix

Per-object states below describe observationtimeonly, not indefinite currentliveness. ActiveWDrequiresseparateOwnerdispositionreview; R1staysread-only.

| Object | Historical identity | Current candidate | Current state | Historical exit proof | Custody | Jc relationship | Risk | Required action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Watchdog10036 | Creation134384829523445415;fixedWDimage/hash | MATCH creation+image+diskSHA | NotSignaled at00:29:14.2340052Z | Missing | Jc/targethandles held at last historicalreceipt; currenthandle table notobservable | Historicalowner; currentcustody inferredonly | Active known residual; last-handle action may affectunknownmembers | Owner dispositionreview |
| Target32684 | Creation134384829525959601;fixedtargetimage/hash | PARTIAL: exactcreation; currentimagefailed31 | Signaledobject,exitcode0x43525301;notinprocesssnapshot | No oldindependentreceipt; newcurrentexitFILETIME134384830426947753 | Objectaccessible despiteabsentsnapshot; holderidentity notinspected | Historicalmember; currentmembershipnotqueryable | Exitobservedforcreation-matchedobject, noJccausality | Includeidentitylimitationindispositionreview |
| Unexpected24956 | PIDonly; noimage/time/parent | Absent snapshot/OpenProcess87 | No currentPIDobserved | Missing | Unknown | Historicalserializedentry; currentunknown | Origin/exitunproven; cannotassumeharmlesscleanup | Unknownmembersmustbeaddressedbeforeanyaction |
| PrivateJc | Unnamed0x2000,lastreceiptWDcustody | No validR1Jchandle | CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE | No last-handleclose/destructionreceipt | Not directlyobservable | Historicalobjectonly | Do not triggerlast-handleclosewhilemembersunknown | SeparateOwnerreview; no mutationinR1 |


## Y. Static validation

25PASS/0FAIL/0SKIP/0TIMEOUT. Managedfixturesx64/count/bounds only, notrawhistoricalbuffers andnot Windowsprocesscontrolexperiments. Correlate functionextractedfromactualAnalyze.ps1AST; policyEvidenceDecision isexplicitoffline model. Wrongpointer,shortheader,truncatedlist,assigned!=count,invalidPID exercised; originalsourceunchanged.

| ID | Test | Result | Class |
| --- | --- | --- | --- |
| T01 | Historical watchdog PID is non-authoritative | PASS | STATIC_PARSER_TEST |
| T02 | Historical target PID is non-authoritative | PASS | STATIC_PARSER_TEST |
| T03 | Unexpected member PID is non-authoritative | PASS | STATIC_PARSER_TEST |
| T04 | Different creation time rejected | PASS | STATIC_PARSER_TEST |
| T05 | Different executable rejected | PASS | STATIC_PARSER_TEST |
| T06 | Incomplete identity UNKNOWN | PASS | STATIC_PARSER_TEST |
| T07 | Missing PID not historical exit proof | PASS | STATIC_PARSER_TEST |
| T08 | Access denied distinct from absence | PASS | STATIC_PARSER_TEST |
| T09 | Parent PID alone insufficient | PASS | STATIC_PARSER_TEST |
| T10 | Pointer width validates | PASS | STATIC_PARSER_TEST |
| T11 | Assigned and returned count differ | PASS | STATIC_PARSER_TEST |
| T12 | Incomplete list detected | PASS | STATIC_PARSER_TEST |
| T13 | Raw buffer bounds validated | PASS | STATIC_PARSER_TEST |
| T14 | Stale receipt cannot prove current state | PASS | STATIC_PARSER_TEST |
| T15 | Self-exit receipt not independent exit | PASS | STATIC_PARSER_TEST |
| T16 | Historical watchdog timeout not present liveness | PASS | STATIC_PARSER_TEST |
| T17 | Coordinator closure not watchdog exit | PASS | STATIC_PARSER_TEST |
| T18 | No Jc handle no direct current Jc query | PASS | STATIC_PARSER_TEST |
| T19 | Nested-job explanation requires evidence | PASS | STATIC_PARSER_TEST |
| T20 | No direct child call not no descendants proof | PASS | STATIC_PARSER_TEST |
| T21 | External custody remains unknown | PASS | STATIC_PARSER_TEST |
| T22 | No PID-only termination path in auditor | PASS | STATIC_PARSER_TEST |
| T23 | No process mutation path | PASS | STATIC_PARSER_TEST |
| T24 | No second crash experiment can start | PASS | STATIC_PARSER_TEST |
| T25 | No cleanup PASS without proof | PASS | STATIC_PARSER_TEST |


## Z. Internal adversarial review

INTERNAL_ADVERSARIAL_REVIEW:SAFETY_REVIEW_PASS,30PASS/0FAIL, sameagent separatepass, notindependenthuman. Scopeismethodology/rights/evidencehonesty, notcrashcontainment. CurrentWDactiveconditionrecordedwithnoactions; finalintegritysealrequired.

| ID | Question | Evidence | Result |
| --- | --- | --- | --- |
| R01 | Were historical and current PID identities kept separate? | Historical receipt and current snapshot serialized separately; time-stamped correlation.json | PASS |
| R02 | Could PID reuse invalidate any conclusion? | PID10036 exact creation+path+SHA match;32684 partial;24956 absent nohistoricalimage/time; no assumedcontinuity | PASS |
| R03 | Were creation times used where available? | GetProcessTimes outcomes preserved; target creation exact but current imagefailed31 | PASS |
| R04 | Were executable identities verified? | WD current path and diskSHA match; target unavailableimage explicitly NOT_VERIFIABLE | PASS |
| R05 | Were current queries restricted to minimum read rights? | Candidate0x00101000, relevantparent0x1000; fixed9query-only imports | PASS |
| R06 | Was privilege elevation avoided? | ObserveOnce rejects admin/SYSTEM; no elevation/debug/token modification | PASS |
| R07 | Was termination prohibited? | No terminate import/path; no processcontrol in read-only helper | PASS |
| R08 | Was suspension prohibited? | No SuspendThread or equivalent | PASS |
| R09 | Was resume prohibited? | No ResumeThread or equivalent | PASS |
| R10 | Was Job Object creation prohibited? | No JobAPI imports/current Jc query; no object created | PASS |
| R11 | Was handle duplication prohibited? | No DuplicateHandle/control-rights acquisition | PASS |
| R12 | Was any existing Jc handle closed? | Only own snapshot/processquery handles closed; no existing Jc handle obtained | PASS |
| R13 | Was the historical membership list parsed correctly? | x64 offset8/stride8 checks consistent; raw buffer/count/n missing; no claim of independent historical replay | PASS |
| R14 | Were nested-job semantics represented accurately? | Documented childjob PID aggregation; historical ambient jobtrue != provenchildjobofJc | PASS |
| R15 | Was the unexpected member's origin supported by actual evidence? | H1-H7 not asserted origin; GateP INCONCLUSIVE | PASS |
| R16 | Was process ancestry inferred from parent PID alone? | WDparent9820 snapshot context only; parent candidateabsent;24956 no parent evidence | PASS |
| R17 | Was an absent PID mistaken for confirmed historical exit? | Absent24956/parent9820 not historical exit proof | PASS |
| R18 | Was target self-exit mistaken for independent exit? | Historical selfreceipt not independentexit; new signaled object evidence distinct, image limitation preserved | PASS |
| R19 | Was watchdog WAIT_TIMEOUT mistaken for current liveness? | Historical wait258 notcurrentliveness; newwait0=258 current timestamp only | PASS |
| R20 | Was coordinator handle closure mistaken for Jc cleanup? | Coordinator closing itsWDhandle != WDexit/Jcclose; independent currentWDactive | PASS |
| R21 | Was current Jc membership claimed without a Jc handle? | CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE; no access to originalprivateJc | PASS |
| R22 | Were all source claims grounded in inspected files? | Exact sourcepaths/line references/hashes and preserved source call graph | PASS |
| R23 | Were unavailable historical artifacts identified? | No raw native membership buffers, n/count/timestamps,24956 image/time/parent/exit; unavailableolderTEMPdisclosed | PASS |
| R24 | Were queried process identities sanitized? | Only relevant PID metadata and sanitizedUSERPROFILE paths, no commandlines/SIDs | PASS |
| R25 | Were unrelated process details excluded? | Full processinventory transientonly; persisted onlyWD10036 row and candidate/directparent query outcomes | PASS |
| R26 | Was production source preserved? | Baseline463AI files compare; production SQLite/history included; final2reportgate required | PASS |
| R27 | Was any process-control experiment executed? | No newwatchdog/target/Jc/crash/termination; compiler+PowerShell are ordinaryaudittoolprocesses | PASS |
| R28 | Were all new evidence files inventoried? | Current evidence inventoried; finalseal includes allauditfiles and2reports, excludesmanifestself | PASS |
| R29 | Are residual safety uncertainties explicit? | ActiveWD current only; unknowncurrentJc/heldhandles and provenance explicit; no containmentPASS | PASS |
| R30 | Is the next recommendation separately authorized and bounded? | Exactlyone recommendation: separately authorized Residual Process Disposition Review, planbeforeanyaction | PASS |


## AA. Gate H/P/R/S

H PASS: availablehistoryreconstructedandgapsclassified. P PROVENANCE_INCONCLUSIVE. R RESIDUAL_CURRENTLY_ACTIVE_VERIFIED forWD atobservation; targetimagepartial,24956absent,currentJcnotobservable. S BLOCKED. PreviousCRASH CFAILED/DNOT_RUN/KNOT_VERIFIED/SBLOCKED notpromoted.


## AB. Source/system integrity

FinalSeal memverifikasi463existing AI files tetap byte-identical, tepat2newreports =>465final;140oldgitstatusentries dipertahankan =>142. HistoricalCRASH86files ditambah12protectedroots668files =13historicalroots754files, dalam exclusions/inventory yang dicatat; M3 82files dan activeCodex50 included. Hermes647tracked hashes/pathset only. AI excludes.git/node_modules; protected per-root exclusions preserved. ProductionSQLite/history included dalam existingAI hashscope; no privileged global security census. Historical unavailable2209files/17roots tidak diklaim verified. R3native guards remainabsent, pinnedcandidate tetapabsent: MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE. Source/binary/helper/report hashes dan seluruh new evidence disegel dalam audit/manifest.json; selfmanifest excluded.


## AC. Remaining security uncertainties

Unexpected24956 origin/image/time/parent/exit tetapunknown; currentabsence bukan evidencehistoricalcleanup. CurrentJc/foreignhandles/nestedchildjob state tidakobservable. External hostile same-user access, realprocess-tree cleanup, worker nestedjobs/MXC, filesystem/outputfencing, credentialcustody, providerentitlement dan billingenforcement tidakdivalidasi. NoMXC/app-server/realworker/inference/paidAPI/providercontact. PublicMicrosoftdocs browsing sesuai instruksi dicatat; bukan klaim zeroexternalnetwork. No Windows token/ACL/registry/firewall/Defender/UAC/services/tasks/auditing changes.


## AD. Final classification

RESIDUAL_ACTIVE_ACTION_REQUIRED. Watchdog10036 cocok creationFILETIME134384829523445415, exact image path dan diskSHA5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051. Pada2026-11-07T00:29:14.2340052Z wait0=258, ExitFILETIME0, GetExitCode259: verified historical watchdog belum signaled exit pada observasi tersebut. Tidak ada control/mutation/cleanup. Provenance PID24956 tetap INCONCLUSIVE; original CRASH SECURITY_STOP tidak berubah. Dimensionlabelscoexist: VERIFIED_HISTORICAL_PROCESS_CURRENTLY_ACTIVE(WD),PROVENANCE_INCONCLUSIVE(24956),SECURITY_HANDOFF_REQUIRED(disposition),CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE. No newR1authorizationviolationdetected; originalCRASHSECURITY_STOPretained.


## AE. Exactly one recommended next action

Tepat satu rekomendasi: Separately Authorized Residual Process Disposition Review. Review tersebut harus menyusun rencana, memvalidasi identitas pada saat tindakan akan diputuskan, memperhitungkan semua kemungkinan anggotaJc dan konsekuensi last-handle closure, serta menentukan bukti dan otorisasi tindakan eksplisit. R1 tidak mengizinkan termination, force-exit, handle manipulation, retry, parserfix atau process-tree milestone.

Referensi resmi yang dibaca (parafrasa, bukan bukti aktual run):

- [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): Grouped process lifetime and job hierarchy contract; not proof of actual crash cleanup.
- [JOBOBJECT_BASIC_PROCESS_ID_LIST](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_process_id_list): Two DWORD counts followed by ULONG_PTR array; child-job processes can be included; incomplete returned count is not absence.
- [QueryInformationJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-queryinformationjobobject): Correct historical job handle required; NULL can select caller-associated job, not private historical Jc.
- [CreateToolhelp32Snapshot](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-createtoolhelp32snapshot): One point-in-time process snapshot, process flag only; no event history or arbitrary module/memory data.
- [Process32First](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-process32first): Initialize entry size and preserve first-entry outcomes.
- [Process32Next](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-process32next): Enumeration completes with ERROR_NO_MORE_FILES; bounded incomplete enumeration must not assert full absence.
- [PROCESSENTRY32](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/ns-tlhelp32-processentry32): Parent PID is context, not parent process instance identity.
- [OpenProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess): Read-only access rights; failed open is classified by error, not treated automatically as exit.
- [GetProcessTimes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getprocesstimes): Creation and exit FILETIME from query handle support instance/time correlation.
- [QueryFullProcessImageNameW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-queryfullprocessimagenamew): Image path through query-limited handle; inaccessible image remains explicit limitation.
- [GetExitCodeProcess](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodeprocess): STILL_ACTIVE alone is not sufficient; pair with independent handle wait and identity.
- [WaitForSingleObject](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject): SYNCHRONIZE and wait0 distinguish signaled from timeout at observation only.

M02-02S16B-R6W-JC-CRASH-R1 RESIDUAL_ACTIVE — VERIFIED EXPERIMENT PROCESS STILL OBSERVABLE — SEPARATE OWNER DISPOSITION REQUIRED — REAL WORKER BLOCKED.
