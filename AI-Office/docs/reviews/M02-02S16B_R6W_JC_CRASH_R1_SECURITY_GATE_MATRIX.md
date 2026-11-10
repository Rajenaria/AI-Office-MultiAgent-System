# M02-02S16B-R6W-JC-CRASH-R1 Security Gate Matrix

RESIDUAL_ACTIVE_ACTION_REQUIRED. Watchdog10036 cocok creationFILETIME134384829523445415, exact image path dan diskSHA5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051. Pada2026-11-07T00:29:14.2340052Z wait0=258, ExitFILETIME0, GetExitCode259: verified historical watchdog belum signaled exit pada observasi tersebut. Tidak ada control/mutation/cleanup. Provenance PID24956 tetap INCONCLUSIVE; original CRASH SECURITY_STOP tidak berubah.

Evidence root: <TEMP>/ai-office-m0202s16br6wjccrashr1-4f77134b-3717-4ddd-9255-fb113ebc1f66. Evidencepathsrelativeevidence/; sourcepathsresolvehistoricalCRASHroot unlessReadOnlyQuery.cs named. SOURCE/STATIC/HISTORICAL/CURRENT statusesarenotinterchangeable. NOT_OBSERVABLE/PARTIAL/INCONCLUSIVE notPASS.

| Gate | Requirement | Status | Exact evidence | Source/tests | Actual finding |
| --- | --- | --- | --- | --- | --- |
| R1-01 | CRASH checkpoint verified | VERIFIED | checkpoint/verified.json; CRASH/evidence/audit/manifest.json | Initialize.ps1;T14 | CRASH manifest85 entries/86files plus2 report hashes verified before currentOS query |
| R1-02 | Historical reports preserved | VERIFIED | inventory/baseline-ai.json; audit/final-integrity.json | Initialize/FinalSeal | 463existing files including old reports preserved |
| R1-03 | Historical manifests reviewed | VERIFIED | checkpoint/verified.json; inventory/baseline-protected.json | Initialize/FinalSeal | CRASH and availableM3/prior manifests/hashes reviewed; unavailableolder scope disclosed |
| R1-04 | Historical receipts located | VERIFIED | historical-membership/timeline.json | Analyze.ps1 | Ownership/READY/HOLD/wait/closure/self-exit receipts located; missing exit/raw fields listed |
| R1-05 | Source hashes reviewed | VERIFIED | CRASH/evidence/audit/build-provenance.json | 13source hashes | Historical sources/binaries match manifest; not executed |
| R1-06 | Historical PID identities recorded | VERIFIED | identity-correlation/correlation.json | T01-T08 | WDcreation/image/hash;targetcreation/image historical;24956 onlyPID |
| R1-07 | Jc creation receipt | HISTORICAL_OS_RECEIPT | CRASH/evidence/runtime/watchdog-security-hold.json#/Data/JobEvents/0 | PrivateContainmentJob.cs:81 | CreateJobObjectW success NULL-name,NULLattrs; ownerkey recorded |
| R1-08 | Kill-on-close configuration | HISTORICAL_OS_RECEIPT | CRASH/evidence/job-configuration/configured.json | Configure;T18 | Set/readback0x2000 before targetcreation |
| R1-09 | Atomic target admission receipt | HISTORICAL_OS_RECEIPT | CRASH/evidence/runtime/watchdog-security-hold.json#/Data/ResourceEvents | NativeHost.Create | JOB_LIST suspended atomic creation0x08080404 |
| R1-10 | Initial membership `[32684]` | HISTORICAL_OS_RECEIPT | historical-membership/reconstruction.json Query2 | Verify;T10 | Assigned1 serialized[32684]; native rawcount/n unavailable |
| R1-11 | Later membership `[32684,24956]` | HISTORICAL_OS_RECEIPT | historical-membership/reconstruction.json Query3 | Verify;T11-T13 | Assigned2 serialized[32684,24956]; native rawcount/n unavailable |
| R1-12 | Membership timestamp ordering | PARTIAL | historical-membership/timeline.json | CrashWatchdog sequence | Partial ordering source/receipt bounds; no per-query native timestamp |
| R1-13 | Membership query API result | PARTIAL | historical-membership/reconstruction.json | JobApi.Members | Recorded combined wrapperSuccess/error0; separate native boolean not retained |
| R1-14 | Assigned process count | HISTORICAL_OS_RECEIPT | historical-membership/reconstruction.json | T11 | Assigned0,1,2,2 recorded |
| R1-15 | Returned PID count | SOURCE_CONDITIONAL | source-inspection/parser-findings.json | Members;T11 | Returnedcount not separately stored; accepted source requires equality withAssigned |
| R1-16 | Buffer completeness | NOT_INDEPENDENTLY_VERIFIABLE | historical-membership/reconstruction.json | T12,T13 | Rawbuffer/n/count missing; accepted source guards only |
| R1-17 | x64 layout validation | SOURCE_VALIDATED | source-inspection/parser-findings.json | Layouts/Members;T10 | x64 offset8 stride8 DWORD32 ULONG_PTR64; buildx64 |
| R1-18 | Parser bounds validation | STATIC_PARSER_TEST | review/static-tests.json | T10-T13 | Managed fixtures reject truncated/mismatched/wrongwidth/invalidPID; not native replay |
| R1-19 | Nested-job possibility evaluated | INCONCLUSIVE | hypotheses/matrix.json H4 | T19 | Nestedchild-job aggregation documented; actualchildjobs not evidenced |
| R1-20 | Unexpected PID evidence provenance | PROVENANCE_INCONCLUSIVE | hypotheses/matrix.json | T03,T19,T20 | 24956 historical image/time/parent unavailable; absent current lookup |
| R1-21 | Synthetic target source reviewed | HISTORICAL_SOURCE_EVIDENCE | source-inspection/parser-findings.json TargetSites | Program.cs/Protocol.cs;T20 | Idle/selfidentity/finite deadline; no directlaunch; not proofno descendants |
| R1-22 | Watchdog source reviewed | HISTORICAL_SOURCE_EVIDENCE | source-inspection/parser-findings.json | NativeHost/PrivateContainmentJob/CrashWatchdog | Fixedtargetlaunch/privateJc/stickyHOLD reviewed |
| R1-23 | Coordinator source reviewed | HISTORICAL_SOURCE_EVIDENCE | source-inspection/parser-findings.json CoordinatorSites | Observer.cs | OriginalWDhandle closure; targetquery stage notreached |
| R1-24 | Security-stop transition reviewed | HISTORICAL_SOURCE_EVIDENCE | CRASH/evidence/runtime/watchdog-failure.json | CrashWatchdog.cs:47,65 | Second VerifyAdmission failure triggersTARGET_NOT_LIVE_MEMBER thenHOLD |
| R1-25 | HOLD resource custody reviewed | HISTORICAL_OS_RECEIPT | CRASH/evidence/runtime/watchdog-security-hold.json | HoldRequired/Release | Lastreceipt retainedJc/originaltargethandles; currenthandle table notqueried |
| R1-26 | Original watchdog handle closure reviewed | HISTORICAL_OS_RECEIPT | historical-membership/timeline.json OriginalWatchdogWaitClosure | Observer.Cleanup;T17 | OriginalWDthread/processhandles closed after5000mswait258 |
| R1-27 | Historical watchdog exit evidence | NOT_OBSERVED | CRASH/evidence/exit-observation/observer-native.json | T16,T17 | Historicalwait258; no finalWDexitreceipt. Newquery separate |
| R1-28 | Historical target exit evidence | PARTIAL_NEW_CURRENT_EVIDENCE | identity-correlation/correlation.json PID32684 | T15 | Historicalselfreceipt only; R1queried signaledobject exactcreation/code, imagefailed31 |
| R1-29 | Historical unexpected-member exit evidence | NOT_OBSERVED | historical-membership/reconstruction.json | T07 | No24956 historicalexitreceipt |
| R1-30 | Current read-only process snapshot | CURRENT_OS_IDENTITY_OBSERVATION | current-process-snapshot/observation.json | ReadOnlyQuery.RunOnce | One complete snapshot,297entries scanned transiently,onlyWDrow persisted |
| R1-31 | Current watchdog candidate lookup | CURRENT_PID_MATCHES_HISTORICAL_IDENTITY | identity-correlation/correlation.json PID10036 | Correlate;T04,T05 | Creation134384829523445415/path/SHA match,wait0=258 |
| R1-32 | Current target candidate lookup | CURRENT_IDENTITY_NOT_VERIFIABLE | identity-correlation/correlation.json PID32684 | Correlate;T06 | Creation134384829525959601 exact; imagefailed31; signaledobject wait0 |
| R1-33 | Current unexpected-member candidate lookup | NO_CURRENT_PROCESS_WITH_PID | current-process-snapshot/observation.json PID24956 | T03,T07 | Absent snapshot; OpenProcess87. Not historicalexit/provenance proof |
| R1-34 | Process creation-time correlation | PARTIAL | identity-correlation/correlation.json | T04,T06 | WD and target FILETIMEs exact;24956 no historicalcreation |
| R1-35 | Executable identity correlation | PARTIAL | identity-correlation/correlation.json | T05,T06 | WD image/hashmatch; target currentimagefailed31;24956 unavailable |
| R1-36 | Parent-process correlation | PARTIAL | current-process-snapshot/observation.json Rows | T09 | WDparentPID9820 recorded, parentabsent query87; no24956 parent |
| R1-37 | PID reuse classification | NO_REUSE_DEMONSTRATED | identity-correlation/correlation.json | T04,T05 | No creation mismatch forWD/target;24956 unknown, no currentowner |
| R1-38 | Access-denied classification | CLASSIFICATION_VALIDATED_NOT_OBSERVED | review/static-tests.json T08; observation.json | Correlate | Actualqueries noAccessDenied; ERROR31 and87 notmisclassified5 |
| R1-39 | Current process-state observation | CURRENT_OS_PROCESS_STATE | current-process-snapshot/observation.json | Wait0/GetExitCode/GetProcessTimes | WDnotSignaled;targetobjectSignaled;24956absent; timestampbound |
| R1-40 | No PID-only control | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T22 | PID onlylookup, no controlauthority |
| R1-41 | No process termination | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T22,T23 | No terminate imports/path;0termination |
| R1-42 | No process suspension | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T23 | No suspension |
| R1-43 | No process resume | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T23 | No resume |
| R1-44 | No Job Object creation | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T18,T24 | No JobAPI/creation |
| R1-45 | No Job Object mutation | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T18,T23 | No assignment/limits/Jcquery |
| R1-46 | No Jc handle duplication | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T23 | No DuplicateHandle |
| R1-47 | No existing Jc handle closure | VERIFIED_READ_ONLY_SCOPE | current-process-snapshot/observation.json Calls | T18,T23 | Closed onlyaudit snapshot/processqueryhandles; neverownedJc |
| R1-48 | No debug privilege | VERIFIED_COMMAND_SCOPE | source-inspection/query-helper-review.json | ObserveOnce.ps1 | No debugprivilege enabling; no token mutation |
| R1-49 | No elevation | VERIFIED_COMMAND_SCOPE | source-inspection/query-helper-review.json | ObserveOnce.ps1 | Nonadmin/nonSYSTEM precondition; no elevation |
| R1-50 | No code injection | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T23 | No injection APIs |
| R1-51 | No process memory reading | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T23 | No processmemory read |
| R1-52 | No new containment experiment | VERIFIED_READ_ONLY_SCOPE | source-inspection/binary-import-audit.json | T24 | No target/watchdog/Jc/crash launch; auditcompiler/shell are toolingprocesses |
| R1-53 | Child-process hypothesis | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | hypotheses/matrix.json H1 | T20 | No historicalcreation/parent24956; directsourceabsence notexclusion |
| R1-54 | Watchdog-helper hypothesis | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | hypotheses/matrix.json H2 | WDcallgraph | Fixedtargetonce; no helperlaunchreceipt |
| R1-55 | Runtime-helper hypothesis | INCONCLUSIVE | hypotheses/matrix.json H3 | Source/runtimegap | No runtimehelper image/time/launch record |
| R1-56 | Nested-job hypothesis | INCONCLUSIVE | hypotheses/matrix.json H4 | T19 | Noactualnestedchildjob evidence; ambientjobtrue notsufficient |
| R1-57 | Parser-defect hypothesis | INCONCLUSIVE | hypotheses/matrix.json H5; parser-findings.json | T10-T13 | No demonstrated origin-producing parserdefect; rawbuffer missing; observabilitygapconfirmed |
| R1-58 | External-assignment hypothesis | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | hypotheses/matrix.json H6 | T21 | No externalassignment/hostilehandle evidence |
| R1-59 | Receipt/PID-reuse hypothesis | INCONCLUSIVE | hypotheses/matrix.json H7 | T04-T08,T14 | Invocation sequence verified;24956 reuse/origin unprovable |
| R1-60 | Gate H | PASS | custody/disposition.json | GateH | Evidence reconstructed to limits, missingfields explicit |
| R1-61 | Gate P | PROVENANCE_INCONCLUSIVE | custody/disposition.json | GateP | Unexpectedmember originunproven |
| R1-62 | Gate R | RESIDUAL_CURRENTLY_ACTIVE_VERIFIED | custody/disposition.json | GateR | VerifiedWDactive at2026-11-07T00:29:14Z |
| R1-63 | Gate S | BLOCKED | custody/disposition.json | GateS | No promotionofcrash/tree/MXC/fencing/providersecurity |
| R1-64 | Internal adversarial review | SAFETY_REVIEW_PASS | review/internal-adversarial-review.json | R01-R30 | Sameagent separatepass30/30; methodologyonly |
| R1-65 | Source/system integrity | SCOPED_FILE_INTEGRITY_PASS | audit/final-integrity.json | FinalSeal.ps1 | 463existingAI preserved+2reports;13historicalroots754files;Hermes647tracked |
| R1-66 | No MXC | VERIFIED_COMMAND_SCOPE | source-inspection/binary-import-audit.json | T24 | NoMXC; missingcandidate notrestored |
| R1-67 | No app-server | VERIFIED_COMMAND_SCOPE | source-inspection/binary-import-audit.json | T24 | Noapp-server |
| R1-68 | No real worker | VERIFIED_COMMAND_SCOPE | source-inspection/binary-import-audit.json | T24 | Norealworker |
| R1-69 | No inference/paid API | VERIFIED_COMMAND_SCOPE | source-inspection/binary-import-audit.json | Reviewedcommands/source | Noinference/paidAPI/providercontact; publicMicrosoftdocs browsingonly |
| R1-70 | Separate disposition decision | OWNER_DECISION_REQUIRED | custody/disposition.json | NextAction | SeparatelyAuthorizedResidualProcessDispositionReview only; noactionauthorizationinR1 |


## Current process-query outcomes and correlation

Satu sesi query read-only nonadmin/nonSYSTEM: CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS2), Process32FirstW/NextW; OpenProcess0x00101000 untuk tiga kandidat,0x00001000 untuk relevantparent9820; GetProcessTimes, QueryFullProcessImageNameW, GetExitCodeProcess, WaitForSingleObject0, CloseHandle hanya handle query/snapshot milik auditor. Satu snapshot complete,297entries transiently scanned, hanyaWD row disimpan; bukan full inventory. Tidak ada polling/background monitoring, processmemory/modules/handle enumeration, Jcquery, mutation, elevation, privilege enabling, atau historicalbinary execution. csc/PowerShell audit tooling memang meluncurkan ordinary audit processes; bukan zero OS processes launched.

| PID | Identity contract | Creation | Image | Wait | Evidence |
| --- | --- | --- | --- | --- | --- |
| 10036 | CURRENT_PID_MATCHES_HISTORICAL_IDENTITY | 134384829523445415 | <USERPROFILE>\AppData\Local\Temp\ai-office-m0202s16br6wjccrash-13297220-b3fb-4b2a-ac08-2dada411505b\build\watchdog\CrashWatchdog.exe | 258 | Creation, exact image path and disk image hash match; wait0=258 at recorded observation only |
| 32684 | CURRENT_IDENTITY_NOT_VERIFIABLE | 134384829525959601 |  | 0 | Exact creationFILETIME; independently signaled process object with exitCode0x43525301, but current image unavailable ERROR_GEN_FAILURE31; full identity continuity not claimed |
| 24956 | NO_CURRENT_PROCESS_WITH_PID |  |  |  | No historical creation/image; no current PID observed; historical exit/provenance unknown |


## Historical query/parser evidence

JobApi.Members source memakai QueryInformationJobObject class3,4096-byte fresh HGlobal, DWORD offsets0/4, x64 ULONG_PTR offset8 stride8. Layouts mensyaratkan IntPtr.Size8; n8..4096,count<=511,8+count*8<=n,assigned==count,PID1..uint.MaxValue; foreach singleton admission rejects extraPID. Tidak ditemukan demonstrated layout/bounds defect yang menjelaskan24956. Header dibaca sebelum n>=8 diperiksa; short n tetap tidak dapat diterima. Error native dan parser rejection tidak dipisahkan sehingga error saat parserfalse dapat stale. Rawbuffer,independent returnedcount,n,actual pointeralignment dan per-query timestamps tidak tersimpan: historical binary hash/source supports interpretation, bukan independent raw replay. Tidak mengoreksi historicalmembership atau mengubahsource.

| Query event | Assigned | Serialized IDs | Native raw count/n | Completeness |
| --- | --- | --- | --- | --- |
| 3 | 0 |  | NOT_RECORDED | Source-conditional only; not independently replayable |
| 15 | 1 | 32684 | NOT_RECORDED | Source-conditional only; not independently replayable |
| 18 | 2 | 32684,24956 | NOT_RECORDED | Source-conditional only; not independently replayable |
| 19 | 2 | 32684,24956 | NOT_RECORDED | Source-conditional only; not independently replayable |


## Hypothesis matrix

Nooriginestablished. Negativeavailableevidenceisnotexclusion.

| ID | Hypothesis | Classification | Evidence |
| --- | --- | --- | --- |
| H1 | Synthetic target descendant | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | No child launch in Program/Protocol; creation/image/parent24956 absent. Source absence does not prove actual descendants0. |
| H2 | Watchdog-created helper | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | Reviewed WD launch path fixed target once; no helper receipt/call. Framework indirect behavior not exhaustively excluded. |
| H3 | Runtime/infrastructure helper | INCONCLUSIVE | No historical image/time/parent for24956 and no current lookup. No inference from framework name. |
| H4 | Nested child-job membership | INCONCLUSIVE | API permits aggregated child-job PIDs; WD ambient-job Membertrue historical receipt, but ambient job is not proof child of private Jc. No child-job creation evidence. |
| H5 | Membership parser defect | INCONCLUSIVE | Supported x64 layout/guards appear consistent; offline fixtures pass. Missing raw buffer/count/n blocks native replay. Observability defects confirmed, not origin-producing defect. |
| H6 | External assignment/unrelated process | NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE | No external access/assignment receipt. Intentional sole custody is not global exclusivity proof. No malicious attribution. |
| H7 | PID reuse/stale evidence confusion | INCONCLUSIVE | Current WD creation/image/hash match;24956 historical identity unknown and absent now. Same invocation sequence/hash reduces obvious stale mixing, cannot establish24956 origin. |


## Residual custody matrix

Jc private unnamed, auditor tidak mempunyai handle valid untuk historicalJc. CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE. Tidak membuat substitutejob, memakaiNULL untukcallerjob, membuka namedjob lain, menduplikasiWDhandle, enumerasihandletable, membaca processmemory atau mengirim perintah keWD. HistoricalHOLD menunjukkan retainedJc dan targethandles; liveWD+sourceHOLD konsisten dengan custody yang masih relevan, tetapi bukan currenthandle-table proof. ObjectJc destruction/last-global-handle event dan currentmembers belum diketahui.

| Object | Current identity/state | Custody | Historical exit evidence | Required action |
| --- | --- | --- | --- | --- |
| Watchdog10036 | MATCH creation+image+diskSHA;NotSignaled at00:29:14.2340052Z | Jc/targethandles held at last historicalreceipt; currenthandle table notobservable | Missing | Owner dispositionreview |
| Target32684 | PARTIAL: exactcreation; currentimagefailed31;Signaledobject,exitcode0x43525301;notinprocesssnapshot | Objectaccessible despiteabsentsnapshot; holderidentity notinspected | No oldindependentreceipt; newcurrentexitFILETIME134384830426947753 | Includeidentitylimitationindispositionreview |
| Unexpected24956 | Absent snapshot/OpenProcess87;No currentPIDobserved | Unknown | Missing | Unknownmembersmustbeaddressedbeforeanyaction |
| PrivateJc | No validR1Jchandle;CURRENT_JC_MEMBERSHIP_NOT_OBSERVABLE | Not directlyobservable | No last-handleclose/destructionreceipt | SeparateOwnerreview; no mutationinR1 |


## Source mappings and historical binary provenance

Historical13sources/4binarieshashverifiedagainstCRASHmanifest. Keyactualsource-line references follow. Sourceisdesign evidence; nohistoricalbinaryexecuted. Newaudithelper9PInvokeimportsverifiedinbinarymetadata. All25static testsand30reviewquestionsPASS, fullrowsincompanionreportY/ZandJSON.

| Source | Line | Call |
| --- | --- | --- |
| source/watchdog/CrashWatchdog.cs | 40 | if(!host.VerifyAdmission(launch).Ok)throw new InvalidOperationException("MEMBERSHIP_NOT_VERIFIED"); |
| source/watchdog/CrashWatchdog.cs | 42 | var resumed=host.Resume(launch);if(!resumed.Ok//resumed.Value!=1)throw new InvalidOperationException("RESUME_FAILED"); |
| source/watchdog/CrashWatchdog.cs | 47 | var running=host.Wait(0);if(!host.VerifyAdmission(launch).Ok//!running.Ok//running.Value!=258)throw new InvalidOperationException("TARGET_NOT_LIVE_MEMBER"); |
| source/watchdog/CrashWatchdog.cs | 69 | if(host.HoldRequired){try{Protocol.New("evidence/runtime/watchdog-security-hold.json",new{Protocol.Invocation,Protocol.Generation,Protocol.Nonce,State="SECURITY_STOP_HOLD",Data=host.Capture()});}catch(Exception){}while(true)Thread.Sleep(60000);} |

| Source | Line | Call |
| --- | --- | --- |
| source/coordinator/Observer.cs | 44 | wdCreated=Native.CreateProcessW(wdPath,new StringBuilder("\""+wdPath+"\""),IntPtr.Zero,IntPtr.Zero,false,0x08000400,environment,Protocol.Root,ref startup,out pi); |
| source/coordinator/Observer.cs | 46 | watchdog=pi.Process;thread=pi.Thread;watchdogPid=pi.Pid;Log("CreateProcessW(fixed watchdog)",wdCreated,error,new{PID=watchdogPid,OriginalProcessHandle=Valid(watchdog),OriginalThreadHandle=Valid(thread),InheritHandles=false,CreationFlags="0x08000400"}); |
| source/coordinator/Observer.cs | 61 | IntPtr candidate=Native.OpenProcess(0x00101000,false,targetPid);int ce=Valid(candidate)?0:Marshal.GetLastWin32Error(); |
| source/coordinator/Observer.cs | 62 | Log("OpenProcess(target query candidate)",Valid(candidate),ce,new{PID=targetPid,RequestedAccess="0x00101000",NoTerminateRight=true}); |
| source/coordinator/Observer.cs | 66 | target=Native.OpenProcess(0x00101001,false,targetPid);int re=Valid(target)?0:Marshal.GetLastWin32Error(); |
| source/coordinator/Observer.cs | 67 | Log("OpenProcess(target recovery after verified query)",Valid(target),re,new{PID=targetPid,RequestedAccess="0x00101001",PrerequisiteIdentityVerified=true}); |
| source/coordinator/Observer.cs | 72 | Protocol.New("evidence/ownership/target-observer.json",new{Protocol.Invocation,Protocol.Generation,Protocol.Nonce,PID=targetPid,Creation=targetCreation,RequestedAccess="0x00101001",PreliminaryQueryVerified=true,IdentityVerified=targetVerified,IndependentProcessHandle=true,ObserverJcHandles=0,ImageHash=Protocol.BinaryHash("synthetic-target"),RelativePath="build/synthetic-target/SyntheticTarget.exe",QpcMs=Now}); |
| source/coordinator/Observer.cs | 118 | public bool Cleanup(Outcome outcome){ |
| source/coordinator/Observer.cs | 120 | if(!File.Exists(Protocol.PathOf("evidence/runtime/prearm-abort.json")))Protocol.New("evidence/runtime/prearm-abort.json",new{Protocol.Invocation,Protocol.Generation,Protocol.Nonce,Reason="NO_ADDITIONAL_HARDSTOP_NORMAL_OWNED_CLEANUP",QpcMs=Now}); |
| source/coordinator/Observer.cs | 121 | var wait=Wait(false,5000);if(wait.Ok&&wait.Value==0){outcome.WatchdogExitObserved=true;Exit(false);} |
| source/coordinator/Observer.cs | 130 | bool all=true;all&=Close(ref target,"observer target recovery");all&=Close(ref thread,"original watchdog thread");all&=Close(ref watchdog,"original watchdog process"); |

| Binary | SHA-256 |
| --- | --- |
| build/coordinator/ExternalObserver.exe | E53297347FEC050B60D93611B4FDB4DED4E742F1EA81B9715DBE5A1F646803FC |
| build/watchdog/CrashWatchdog.exe | 5357A8E8C326417CF10EB954DB10D6074025F1AA244746B8AA8A59594431E051 |
| build/synthetic-target/SyntheticTarget.exe | D37BE09BC8B13F8C61FD25891C1D7D216B4CFA532B649162EDDA31A4D696133A |
| build/tests/Crash.Tests.dll | 25053DA4682189DDE799C83FC44DBA405DFE3D63CBC0ED577A13D3D298EC4475 |

| Audit artifact | SHA-256 |
| --- | --- |
| ReadOnlyQuery.cs | 0917EF74821F47A3E47F6B28B86A1519FE46229BC917074C1F8A77DEA422CD3A |
| ReadOnlyQuery.dll | 2B99343CC4BECC388E084CFD19C0370EED5130CD1FC3343E5F9D5B694C4CD1D9 |


## Creation events and ancestry

Oneprocesssnapshotcurrentnotcreationhistory. ParentWD9820 contextonly, currentparentOpenProcess87. Security4688 bounded30secondwindow noMatchingEvents; SysmonOperational noMatchingLog. No historical24956 parent/time/image. No auditconfigurationenabled/changed.


## Gates H/P/R/S and internal review

H PASS/P PROVENANCE_INCONCLUSIVE/R RESIDUAL_CURRENTLY_ACTIVE_VERIFIED/S BLOCKED. SAFETY_REVIEW_PASS30/30 onlyread-onlymethodology. Currenttargetsignaledobjectandselfcode supportexitevidencebutimageunavailable; fullidentitycontractNOT_VERIFIABLE; notJccrashproof.


## Source/system integrity

FinalSeal memverifikasi463existing AI files tetap byte-identical, tepat2newreports =>465final;140oldgitstatusentries dipertahankan =>142. HistoricalCRASH86files ditambah12protectedroots668files =13historicalroots754files, dalam exclusions/inventory yang dicatat; M3 82files dan activeCodex50 included. Hermes647tracked hashes/pathset only. AI excludes.git/node_modules; protected per-root exclusions preserved. ProductionSQLite/history included dalam existingAI hashscope; no privileged global security census. Historical unavailable2209files/17roots tidak diklaim verified. R3native guards remainabsent, pinnedcandidate tetapabsent: MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE. Source/binary/helper/report hashes dan seluruh new evidence disegel dalam audit/manifest.json; selfmanifest excluded. Unexpected24956 origin/image/time/parent/exit tetapunknown; currentabsence bukan evidencehistoricalcleanup. CurrentJc/foreignhandles/nestedchildjob state tidakobservable. External hostile same-user access, realprocess-tree cleanup, worker nestedjobs/MXC, filesystem/outputfencing, credentialcustody, providerentitlement dan billingenforcement tidakdivalidasi. NoMXC/app-server/realworker/inference/paidAPI/providercontact. PublicMicrosoftdocs browsing sesuai instruksi dicatat; bukan klaim zeroexternalnetwork. No Windows token/ACL/registry/firewall/Defender/UAC/services/tasks/auditing changes.


## Missing evidence and Owner decision

Rawhistoricalbuffers/n/count/perquerytimestamps,24956identity/parent/exit,correctcurrentJchandle,currentinternalcustody andlast-global-handleevent unavailable. Tepat satu rekomendasi: Separately Authorized Residual Process Disposition Review. Review tersebut harus menyusun rencana, memvalidasi identitas pada saat tindakan akan diputuskan, memperhitungkan semua kemungkinan anggotaJc dan konsekuensi last-handle closure, serta menentukan bukti dan otorisasi tindakan eksplisit. R1 tidak mengizinkan termination, force-exit, handle manipulation, retry, parserfix atau process-tree milestone.

