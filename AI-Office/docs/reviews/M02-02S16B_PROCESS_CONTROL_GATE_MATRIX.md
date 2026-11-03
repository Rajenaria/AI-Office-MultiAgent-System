# M02-02S16B — Process-Control Security Gate Matrix

Tanggal:30Oktober2026, Asia/Jakarta. Companion: [Bridge Report](M02-02S16B_PROCESS_CONTROL_BRIDGE_REPORT.md) (A).

**BLOCKED. Stage C host-only exact membership and complete failure cleanup not accepted; D/E NOT RUN, MXC0. Prototype execution revoked. Original S16 remains conditional; REAL WORKER BLOCKED.**

S16B_ROOT = C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16b-cdd59800-9766-44bb-9038-c8ccbc201b80

## 1. S16B-01 through S16B-64

SOURCE_VERIFIED is code review, STATIC_VERIFIED is static/scope evidence, BUILD_VERIFIED is actual local compilation, HOST_ONLY_VERIFIED is bounded host-only observation, OS_VERIFIED below applies only to the specified basic Win32 component. No host-only result is promoted to MXC or production. NOT RUN means not exercised, not passed by inference.

| Gate | Requirement | Status | Source/test/evidence and boundary |
|---|---|---|---|
| S16B-01 | S16 report reviewed | SOURCE_VERIFIED | A §2; both original S16 reports read; preserved165-file baseline. |
| S16B-02 | Pinned Codex identity verified | STATIC_VERIFIED | A §3; current retained candidate SHA/signature and historical version0.164.0; no Codex execution. |
| S16B-03 | Node identity verified | STATIC_VERIFIED | A §3/§6; Node24.21.0 SHA/signature verified, fixed exact path. |
| S16B-04 | Windows build verified | STATIC_VERIFIED | preflight/stage-a-gate.json + current-supervisor-job.json;26300.9711/26H2. |
| S16B-05 | Existing toolchain available | STATIC_VERIFIED | Signed installed Framework csc14.8.10001.0; offline references; A §6. |
| S16B-06 | Bridge design specified | DESIGN_SPECIFIED | A §4/§5; one disposable C#5 x64 implementation in owned root. |
| S16B-07 | Exact source write scope preserved | STATIC_VERIFIED | A §23; only2 repository reports; bridge source/build remains in temp. |
| S16B-08 | Native API signatures reviewed | STATIC_VERIFIED | Native.cs + source-review.json; x64 layouts observed in audit-result.json. |
| S16B-09 | Handle custody design reviewed | BLOCKED | A §12/§24; failure closes job before every unexpected member has identity/exit handle; approval revoked. |
| S16B-10 | Exclusive test-owned Job Object | OS_VERIFIED | Five fresh unnamed jobs; creator retained noninheritable handles, bridge outside target job. Does not establish exact process set/no hostile duplication. |
| S16B-11 | Kill-on-close configured | OS_VERIFIED | job_created/assignment receipts flag8192 queried back; source does not add breakaway. |
| S16B-12 | Suspended process creation | OS_VERIFIED | Five created_suspended receipts; x64 CreateProcessW flags and ResumeThread previousCount1. |
| S16B-13 | Assignment before resume | OS_VERIFIED | assignment_verified_before_resume + IsProcessInJob + singleton list observed before ResumeThread. |
| S16B-14 | No broad handle inheritance | STATIC_VERIFIED | STARTUPINFOEX HANDLE_LIST contains two NUL handles only; job/process/thread inherit flags0. Source/parameter evidence, no complete child handle-table audit. |
| S16B-15 | Executable path identity | HOST_ONLY_VERIFIED | H1 original retained handle image path/creation/hash; Node pinned read lock; descendant images NOT VERIFIED. |
| S16B-16 | Source compilation verified | BUILD_VERIFIED | build-first.json/build-repair1.json: both exit0, zero warnings, no restore. |
| S16B-17 | Compiled binary integrity | BUILD_VERIFIED | InitialE3038BA6… and repair1 13543059…; exact full hashes in A §9; binary preserved after execution revocation. |
| S16B-18 | Host-only launch verified | HOST_ONLY_VERIFIED | H1 original and repair1 accepted, exit0, job empty, owned handles closed. |
| S16B-19 | Host-only parent membership | HOST_ONLY_VERIFIED | Root assigned/membership verified in all5 target runs; full child group remains failed. |
| S16B-20 | Host-only child membership | INCONCLUSIVE | Repair1 job list includes reported7312, but independent creation/image/retained child handle not captured; complete child identity/membership gate not passed. |
| S16B-21 | Host-only targeted termination | NOT RUN | Zero explicit TerminateJobObject calls. No planned H3 action reached. |
| S16B-22 | Host-only complete exit accounting | FAILED | Three parent-child attempts completeAccounting=false; only original roots independently waited. |
| S16B-23 | Host-only negative tests | INCONCLUSIVE | 17 pure checks pass twice; N18/N24 impact unresolved, OS negative coverage not claimed. |
| S16B-24 | No unrelated process termination | NOT VERIFIED | Zero planned TerminateJobObject/PID/name kills; three failure job closes may affect uncharacterized members. No unrelated-victim identification. |
| S16B-25 | Handle closure accounting | HOST_ONLY_VERIFIED | 25/25 bridge SafeHandles closed,0CloseErrors. Does not cover every child/helper original handle. |
| S16B-26 | Nested-job compatibility assessed | INCONCLUSIVE | Existing inherited-job/root nesting worked; complete Node tree has extra members; MXC nesting NOT RUN. |
| S16B-27 | Codex internal job behavior assessed | SOURCE_VERIFIED | Retained pinned Codex→SDK b21120168d70befe12356411423266bfef168446; A §3/§16. |
| S16B-28 | No breakaway relaxation | STATIC_VERIFIED | Own new jobs flag8192 only; no CREATE_BREAKAWAY_FROM_JOB. Existing ancestor/libuv settings not modified. |
| S16B-29 | MXC preflight completed | BLOCKED | Stage C failed; D cannot advance. No compatibility gate file/pass created. |
| S16B-30 | Strict profile preserved | NOT RUN | No MXC profile/test-home/canaries created; mxc directory contains0files. |
| S16B-31 | One MXC launch ceiling | STATIC_VERIFIED | MXC0; no mxc-issued.json; closed stage gates and revoked build pass. No second invocation. |
| S16B-32 | MXC startup | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-33 | MXC foreground identity | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-34 | MXC child identity | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-35 | Filesystem A/B sanity | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-36 | Outer-job launcher membership | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-37 | Outer-job helper membership | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-38 | Outer-job parent membership | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-39 | Outer-job child membership | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-40 | Complete termination target verified | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-41 | Owned termination issued | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-42 | Launcher exit confirmed | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-43 | Parent exit confirmed | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-44 | Child exit confirmed | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-45 | Helper exit accounted for | NOT RUN | Stage E NOT RUN. No MXC launch or new launcher/helper/foreground/child; host-only data does not satisfy this MXC gate. |
| S16B-46 | No residual test-owned process | INCONCLUSIVE | Ten recorded IDs absent in later read-only checks; unknown initial members and original child/helper exit receipts incomplete. |
| S16B-47 | No unrelated process affected | NOT VERIFIED | Unexpected PIDs23376/23644 have no image/creation/ownership receipts before job close; unrelated impact cannot be attested. |
| S16B-48 | Deadline compliance | HOST_ONLY_VERIFIED | All5 host target runs under25s; watchdog not triggered. Complete group cleanup/deadline guarantee not established; MXC NOT RUN. |
| S16B-49 | Fixture and binary integrity | STATIC_VERIFIED | A §23; source/binary hashes, retained initial build, current revocation and full owned-root inventory. |
| S16B-50 | Existing source unchanged | STATIC_VERIFIED | 165/165 originals unchanged; final167files with exactly2new reports. |
| S16B-51 | No production database change | STATIC_VERIFIED | No SQLite open/migration/write; schema/package/lock/startup/brain unchanged. |
| S16B-52 | No security setting change | STATIC_VERIFIED | No ACL/Defender/firewall/UAC/registry/PATH mutation or elevation; only authorized private-job limits. |
| S16B-53 | No credentials/inference | STATIC_VERIFIED | No actual credentials/auth/model calls; fixed sanitized host env; no real CODEX_HOME read. |
| S16B-54 | No paid API usage | STATIC_VERIFIED | No provider/API/credits; zero usage is not future billing enforcement. |
| S16B-55 | Host-crash cleanup | NOT RUN | Source/custody review only; no hard-crash experiment. |
| S16B-56 | Hostile/detached worker containment | NOT RUN | No hostile/detached or intentional grandchildren tests. Unexpected members remain unattributed. |
| S16B-57 | Production supervisor integration | BLOCKED | No active backend/production process-control wiring; current prototype quarantined. |
| S16B-58 | Physical output fencing | NOT VERIFIED | DB CAS cannot revoke stale OS writes; no publication boundary implemented. |
| S16B-59 | Real Codex app-server | NOT RUN | No app-server launch. |
| S16B-60 | Runtime approvals | NOT RUN | No real runtime/tool approval channel. |
| S16B-61 | Credential custody | NOT VERIFIED | No real credential custody verification. |
| S16B-62 | Subscription entitlement | NOT VERIFIED | No account/subscription inspection. |
| S16B-63 | Included-only billing | NOT VERIFIED | No included-only hard cap verification. |
| S16B-64 | First real coding worker | BLOCKED | Real worker BLOCKED; S16 control blocker remains; no S17. |

Counts64: SOURCE_VERIFIED2; STATIC_VERIFIED15; DESIGN_SPECIFIED1; BLOCKED4; OS_VERIFIED4; HOST_ONLY_VERIFIED5; BUILD_VERIFIED2; INCONCLUSIVE4; NOT RUN20; FAILED1; NOT VERIFIED6. MXC_BEHAVIOR_VERIFIED0. There is no overall PASS.

## 2. Requirement-to-source mapping

| Requirement group | Actual source/artifact | What is and is not established |
|---|---|---|
|Identity/root/program/control |bridge-source/Fixed.cs; Bridge.cs VerifyBase, Select/Argv/EnvironmentFor and Main |Fixed programs/source/nonce/root/control; per-mode issue guard; no arbitrary PID/name/job/executable/shell input. No production project/attempt capability. |
| Native API and x64 layout |Native.cs Win declarations/CheckLayouts; SafeHandle Owned |Correct reviewed signatures/layout audit passed. Unused native APIs such as TerminateJobObject not claimed runtime-tested. |
| Race prevention |Bridge.cs CreateOwned; Guard.CanResume |Actual suspended creation/assignment/OS membership before root resume; failed OS assignment only modeled/source reviewed. |
| Job custody/inheritance |CreateOwned/NonInherited; STARTUPINFOEX HANDLE_LIST |New unnamed job flag8192; two NUL stdio handles only. Handle ownership is separate from complete member set. |
| Membership/identity |JobIds/Identity/CaptureGroup/VerifyGroup |Original root verified. Actual repair1 list4vs2 stops before descendant handle capture. |
| Planned termination/exit |ClaimFor/Guard.Reject/RunWorkload/ObserveExits |Source exists; planned TerminateJobObject0. Failure close +root exit does not prove child/helper closure. |
| Failure/timeout |Run.CloseJob/watchdog/Main finally |Closes private job then captured-handle waits; missing all-member custody on failure is blocking finding. Watchdog not triggered/tested. |
| Negative guards |Guard/Negatives |17 unique pure/model/quoting checks passed; not actual foreign-target/OS failure tests. |
| Dormant DB mapping |src/server/attempt-control/*.ts read-only |Synthetic owner/generation/CAS/cancel/quarantine retained; no integration/migration/DB open. |
| Current execution quarantine |evidence/static-review/build-gate.json +evidence/STOP.json |pass=false/executionRevoked=true; successful repair1 build receipt retained separately. VerifyBase rejects further execution; no runtime retest after quarantine. |

A §5 includes20 native capability findings A01–A20. A §24 includes16 custody/crash cases. Those source/design assessments must not be counted as runtime tests.

## 3. Requirement-to-test mapping and stage PASS/STOP

| Executed stage/test | Actual result | Authoritative artifact |
|---|---|---|
| A baseline/source/capability |PASS bounded architecture;165old AI files baseline, signed compiler, own inherited-job read-only audit |evidence/preflight/stage-a-gate.json, current-supervisor-job.json; five baseline-*.json inventories |
| B initial source/build |Initial source review before compile; build exit0/warnings0 |evidence/static-review/source-review.json, build-first.json; initial-build/ saved source/binary/build gate |
| B repair1 |Diagnostic/fresh host fixture repair1/2; build exit0/warnings0 |repair1-plan.json, repair1-review.json, build-repair1.json, repair1-built-gate.json |
| Native self audit |PASS twice; inheritedJob=true, UI0, x64 layouts checked, no target/job created |evidence/host-only/audit-result.json; repair1/audit-result.json |
| Pure/model guards |17unique checks pass twice; no OS targets/native operations |negative-result.json; repair1/negative-result.json |
| H1 initial |PASS single root23276, normal exit0/job empty/5handles closed |host-launch-result.json |
| H2/H3 initial |FAILED exact membership guard, no planned termination |host-tree-result.json |
| H5 initial |FAILED same guard before planned close validation; failure cleanup closes private job |host-close-result.json |
| H1 repair1 |PASS single root2424, normal exit0/job empty/5handles closed |repair1/host-launch-result.json |
| H2/H3 repair1 |FAILED actual[7312,8196,23376,23644] vs expected[7312,8196] |repair1/host-tree-result.json; exact_member_list_comparison event |
| H5 repair1 |NOT RUN after C hard stop |No executed-result artifact; not fabricated |
| C acceptance |BLOCKED, pass=false |evidence/host-only/stage-c-gate.json |
| D compatibility |NOT RUN/BLOCKED C prerequisite |No stage-d-gate.json/PASS, no compatibility experiment |
| E MXC |NOT RUN;0launch |No mxc-issued.json; mxc directory0files |
| F stop-path closure |Integrity/reporting only; no runtime full acceptance |evidence/final-audit.json, inventory manifest, two reports |

Initial driver did not short-circuit H5 after failed H2/H3 tool result; preserved as procedural finding. No D/E stage advance occurred. Repair1 used separate result inspection and stopped before any H5/MXC. Do not describe initial automation as fully compliant.

## 4. Mandatory negative/security evidence N01–N25

| ID | Requirement | Status | Exact test/scope evidence |
|---|---|---|---|
| N01 | Unknown process identity | STATIC_VERIFIED | Guard rejects UNKNOWN_IDENTITY; pure in-process claim, no OS target. |
| N02 | PID-only termination | STATIC_VERIFIED | Guard rejects PID_ONLY_FORBIDDEN; executable has no PID/name command mode. |
| N03 | Wrong nonce | STATIC_VERIFIED | Guard wrong-nonce case passes; fixed control text and fresh invocation bind. |
| N04 | Wrong executable identity | STATIC_VERIFIED | Guard wrong image passes; actual H1 root image/hash observed. Wrong OS executable not launched. |
| N05 | Wrong creation time | STATIC_VERIFIED | Pure wrong-creation rejection; no PID reuse experiment. |
| N06 | Unknown job handle | STATIC_VERIFIED | Pure wrong job-cookie rejects; no foreign job handle input/API OpenJobObject. |
| N07 | Failed assignment prevents resume | STATIC_VERIFIED | CanResume false + guard model passes; source original-suspended cleanup. Deliberate OS assignment failure NOT RUN. |
| N08 | Unexpected member prevents PASS | HOST_ONLY_VERIFIED | All3 parent-child runs rejected; repair1 logs actual4 vs expected2; accepted=false, planned TerminateJobObject0. |
| N09 | Missing child membership | STATIC_VERIFIED | Pure rejection; no live missing-child/victim test. Existing actual extra members do not prove missing child. |
| N10 | Duplicate termination request | STATIC_VERIFIED | Pure guard rejects. Post-Terminate runtime duplicate path never reached. |
| N11 | Already exited target | STATIC_VERIFIED | Pure ALREADY_EXITED guard; no actual second termination attempt. |
| N12 | Unexpected launcher exit | STATIC_VERIFIED | Source early-root exit check + pure incomplete exit model; MXC launcher test NOT RUN. |
| N13 | Parent exit cannot substitute child | STATIC_VERIFIED | Pure closure model passes; failed runs retain completeAccounting=false despite parent receipt. |
| N14 | API success cannot substitute exit | STATIC_VERIFIED | Pure closure model/source per-handle waits; TerminateJobObject itself never called. |
| N15 | Self-expiry is not forced proof | STATIC_VERIFIED | Pure guard rejects Expiry; no expiry markers; no forced whole-tree acceptance. |
| N16 | No broad process access | STATIC_VERIFIED | OpenProcess code requests only QUERY_LIMITED_INFORMATION|SYNCHRONIZE for private-job IDs; not reached. Original root handles legitimately returned by CreateProcessW. |
| N17 | No breakaway relaxation | STATIC_VERIFIED | Bridge new job8192, no breakaway creation; does not rewrite ancestor/libuv settings. |
| N18 | No unrelated termination | NOT VERIFIED | Failure job close happened with uncharacterized member set. No unrelated-victim proof, but no full no-impact attestation. |
| N19 | No production source modified | STATIC_VERIFIED | 165 original files SHA-256 unchanged; exactly2 report additions. |
| N20 | No real credentials | STATIC_VERIFIED | No auth/store/private DB access; fixed host environment and source-only unused MXC plan. |
| N21 | No test network | STATIC_VERIFIED | No network imports/probes/listeners/provider traffic. Authorized official-document/source research used network separately. |
| N22 | No inference | STATIC_VERIFIED | No model/worker/provider operation. |
| N23 | No paid API/credits | STATIC_VERIFIED | No paid operation; does not prove included-only enforcement. |
| N24 | Active Codex not interfered with | NOT VERIFIED | Active package50files unchanged; no direct targeting, but unknown job members preclude complete process-impact claim. |
| N25 | No second MXC invocation | STATIC_VERIFIED | MXC0; no issuance file/profile; build pass revoked. |

N07-order and QUOTING are additional pure checks, not new mandatory IDs. Initial17 and repaired17 are repeated executions of17 distinct checks, not34 unique test cases. N08 observed rejection is useful; it does not establish safe characterization of failure-close target members.

## 5. Actual process findings and accounting

| Run | Root / child receipts | Relevant observation | Acceptance limit |
|---|---|---|---|
| Initial H1 |23276 /none |Original root image/time; assigned then resumed; exit0; empty job |Singleton verified only. |
| Initial H2/H3 |14832 /21836 |Parent+child nonce/PPID receipts; exact guard failed; root handle exit0 after private job close |Actual list not retained; no child handle/creation/image/exit receipt. |
| Initial H5 |3424 /7500 |Same membership guard failure; root exit0 after failure job close |Planned close experiment not reached; child identity/exit incomplete. |
| Repair1 H1 |2424 /none |Original root exit0 and empty job |Singleton regression passed. |
| Repair1 H2/H3 |8196 /7312 |Native job list[7312,8196,23376,23644], expected2; original root exit0 after failure close |Two additional member identities UNKNOWN; no whole-tree termination proof. |
| MXC |NOT RUN |No launcher/helper/foreground/child |No MXC or nested compatibility result. |

Ten recorded IDs absent in scoped metadata query08:44:27.5014914Z. Unknown entries were queried only for PID/executable/PPID/creation, not command line, and no control handle was acquired. Absence does not reconstruct original identity/exit code or close the initial unlogged member set.

Unknown23376/23644 must not be labeled console hosts, Node helpers, unrelated victims or escaped workers without evidence. Retained Node/libuv source is architectural context, not process attestation.

## 6. Termination and cleanup integrity

No explicit TerminateJobObject or TerminateProcess call executed. Five private jobs created/closed:2normal-empty singleton disposals and3failure closes. Closing KILL_ON_JOB_CLOSE job is itself a lifecycle action that can terminate members; zero explicit API calls must not be represented as zero possible process termination.

25/25 bridge-owned SafeHandles closed,0close errors. This attests tracked handles, not every descendant handle or global handle table. Three failed runs only retained root process handles; missing child/extra exit receipts prevent complete group/no-impact claims.

Code failure path closes job after unexpected-set rejection before all-member identity capture. Current prototype is execution-revoked. A later safe design must reconcile exact membership, all member provenance and failure containment before attempting new group actions.

## 7. Source versus host-only versus MXC distinction

| Evidence category | Established | Not established |
|---|---|---|
| Official API/source |Win32 documented semantics; pinned Codex/SDK internal job behavior |Actual S16B MXC hierarchy/runtime flags/exit. |
| Static source |Fixed commands, SafeHandle, stdio allowlist, intended source guard |Hostile exclusion, external duplication resistance, full error cleanup correctness. |
| Actual build |Two offline builds exit0/zero warnings, actual binary hashes |Safe complete group termination. |
| Host singleton |Root identity/suspended assign-before-resume/normal exit/empty job |Full parent-child membership/forced termination. |
| Host failed groups |Actual guard rejection, repair1 actual4vs2, parent original exit |Child/helper full identities/exits/no unrelated impact. |
| MXC |No execution |All actual MXC evidence gates NOT RUN. |
| Production/account |No integration/login/inference/spend |Supervisor/custody/entitlement/included-only cap. |

Source SDK [UiJobObject](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/job_object.rs) and [runner](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs) use internal job cleanup. [Microsoft job semantics](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) explain handle closure/group operations. Neither substitutes for missing observed member/exit receipts.

## 8. Stage D/MXC and strict-policy disposition

Stage D not entered after C failed. M01–M15 appear in A §16 as retained source/design questions only; no fake D PASS. No Codex/internal job handle duplication/modification, breakaway relaxation or fallback sandbox.

No fresh S16B profile/canaries/CODEX_HOME. Historical strict S8/S10 profiles remain byte-identical; full effective merged policy not newly assessed. mxc-parent.js/mxc-child.js are unused reviewed source, not executed fixture results. MXC0, no retry, no second launch.

## 9. Bridge failure and crash boundaries

A §24 covers16 windows: before/after assignment, MXC startup, live parent/child, leaked/inherited/multiple handles, last close, API failure, already-exited target, parent-first/helper-first/launcher-first exit, original handle loss, restart and PID reuse.

No deliberate hard crash, watchdog trigger, foreign-handle leak, detached/hostile or PID reuse test. CREATE_SUSPENDED prevents pre-assignment execution, but hard death between creation and assignment may leave a suspended orphan; no production crash guarantee. Normal failed-run job close is not a crash test.

## 10. Durable authority and output fencing

S12–S15 untouched/dormant. Future OS receipts must bind project/task/attempt/generation/host/nonce/executable/job custody/member identities/request/receipt IDs and complete-scope exits. Current failed groups cannot produce valid trusted completeScope=true receipts.

UNKNOWN/incomplete effects → quarantine; same execution owner/generation, conflictHeld1, dispatch CLOSED/retryAuthorized=false; no automatic takeover/replacement. Terminal commit requires valid transaction/phase/current authority; process exit/PID absence/job close does not prove effects rollback. Physical staging/publication fencing remains separate unimplemented blocker.

## 11. Source/system integrity and evidence inventory

Before implementation protected baselines were written under evidence/preflight:

| Inventory | Measured scope |
|---|---|
|baseline-ai.json |165original AI OFFICE files outside node_modules. |
|baseline-installed.json |50active npm Codex files. |
|baseline-hermes.json |647tracked Hermes SHA vector, read-only Git list. |
|baseline-retained.json |11roots/373regular files; known S5R2 junction metadata without traversal. |
|baseline-pipeline.json |5additional roots/1796files: original S12 plus4pipeline roots. |

Final result:165/165 AI originals unchanged, final167files with exactly2S16B reports; installed50/50, Hermes647/647, historical2169/2169 unchanged. No source/test/schema/package/lock/startup/brain/old report change. Hermes prior modified package-lock preserved; Google assets untouched/not checksum-audited. No Git init/reset/cleanup.

New bridge source/binaries are confined to S16B_ROOT; current binary13543059D556DAD02A07197F5D438FE4200F8C0C4C56349A247BCF4985B0F9FF; initialE3038BA6AD8DBDE85AEBE528F285EECC5426B2AFC21AB741AD83DD69A62A0560 retained. Current source/build/full artifact inventories below; revocation deliberately changes only test-owned gate, never historical success/failure receipts.

| Current source | SHA-256 |
|---|---|
| Bridge.cs | E9132DB00CD75542406FF16DB9983E389A752F25D3759A09EA16C63D3367A8EC |
| Fixed.cs | A85D57AE7BB77AF1FC80EA65DE3BE35C7E6203B32E8058D9F6419C2CC7E2F234 |
| host-close-child.js | E8B0E2E09E0845162565C7229373768441C647DED93F400FA2E2CC80FA73E635 |
| host-close-parent.js | B18D87DA300A8CA7DE621066D708F1366518D9857E1307FB061C5373C084CD8A |
| host-launch-parent.js | 541D6D634B145CBBF1768F0F4DE46DA2232583607883920D795DC611B880A911 |
| host-tree-child.js | 1F664F15FF8D1EC0E54B3EA6CCDB33AECC0DA524FF7FB8E2E717CE9BF1F6A00E |
| host-tree-parent.js | 99E98F474291D3BEB927EE8C26052CF3CE5ECFD8C4DBB651C5C4B834D707DED2 |
| mxc-child.js | BAE1869E7D83C997A51DB212012BD3B07D74965FAF141723E94E254CE1DA28E4 |
| mxc-parent.js | 07453E52794E83878890F2536D9E956BF8669EBDC68C45AAC3899C3C4899F3D9 |
| Native.cs | EC16833063FA011454ABF771D3286DB51E899D75E04793016544CAA504FACC51 |

| Executed result | SHA-256 |
|---|---|
| evidence/host-only/audit-result.json | 2FF187B5CCDA207012EC44FFBFDD5858E11618FB6CB9B978F6EC46830F83FD1B |
| evidence/host-only/host-close-result.json | 569BEF2DDAB4C61055D70FB1E6AB59BA372DB3CF62BCEDB74C9B0EFD2C6CFA81 |
| evidence/host-only/host-launch-result.json | 0265DFE11CC8569AE050A7E67670396C93A5905A0BA6DCE679B84B851C81DA11 |
| evidence/host-only/host-tree-result.json | 7D24E7763FB25AAFBA4D02C1DC5A3EA535B402CEC8273AF330F286ED624E5169 |
| evidence/host-only/negative-result.json | 36FEC2F1C95069BD15846AE1275ED1055A7584B453FF8E1C05002AA701365020 |
| evidence/host-only/repair1/audit-result.json | C5B1A388E8AF1E04CE3F4EF00F12310ADE1C9BB7E0D7787037DD2AE315C1CB37 |
| evidence/host-only/repair1/host-launch-result.json | 20E4AAA334100CCD9B3922A767ED712F17927CD5205D62FD9F7EF9AC49AB8B33 |
| evidence/host-only/repair1/host-tree-result.json | 0F80FAEA693622E18C9431C52DE4F290663A4EAF5145AB35652EC25012B81AF3 |
| evidence/host-only/repair1/negative-result.json | 0C02BB63C6029646D772712ABF332B99BF09062E048453086A374A8ABBCE3A9F |

Complete temp manifest: evidence/inventory/artifact-inventory.json contains relative path/bytes/SHA256 for all other regular files; excludes itself, preserves reparse accounting. Stop-path final-audit.json records scope comparisons, source/binary/prototype revocation, document checks and limitations. No permanent bridge source/test added to repository.

No real SQLite/auth/credentials/inference/spend/app-server/worker; no installation/service/elevation/WSL/global Codex/PATH/security/registry mutation. Test-owned job setting is authorized scope. Research network for requested official sources is separate from zero build/workload/provider connections. No whole-host/global-process-impact attestation.

## 12. Remaining production blockers and real-worker decision

**BLOCKED:** complete host member provenance/exit/failure cleanup, MXC compatibility and forced tree verification, host-crash recovery, production supervisor integration, physical output publication fencing, real app-server/approvals/skills, credential custody, subscription entitlement, included-only enforced billing. Zero inference/spend does not establish account/billing safety.

Original S16 blocker not resolved; S17 not started or recommended ahead of host-only repair. Prototype existence/partial host-only PASS cannot activate worker.

## 13. Exactly one recommendation and Owner review

One recommendation: **S16B-R — reviewed host-only member-observation and failure-cleanup refinement**. Source/plan review must address capture of every actual member before scope rejection, safe unknown-scope failure behavior and orchestration short-circuit. Do not widen allowed members, add breakaway or launch MXC to explain this failed host test.

Owner review requires a separate bounded follow-up decision after actual unknown-member hard-stop. Current authorization does not permit ignoring the failed gate; unused repair cycle is not permission to bypass safety. No broader privilege/install/production change requested. No further runtime executed after build gate revocation.

Exactly two new repository files:

- docs/reviews/M02-02S16B_PROCESS_CONTROL_BRIDGE_REPORT.md
- docs/reviews/M02-02S16B_PROCESS_CONTROL_GATE_MATRIX.md

Original S16 reports untouched. One new temp root only, with retained source/build/tests/failures/repair/quarantine/inventory. No deletion. Final static document validation covers28report-A sections,64unique gate rows,25mandatory N IDs,20A findings and16custody cases; no application test/typecheck/build rerun required for report-only repository changes.

**M02-02S16B BLOCKED — HOST-ONLY MEMBERSHIP AND FAILURE-CLEANUP ACCEPTANCE FAILED — MXC NOT RUN — S16 CONTROL BLOCKER UNRESOLVED — REAL WORKER BLOCKED.**

