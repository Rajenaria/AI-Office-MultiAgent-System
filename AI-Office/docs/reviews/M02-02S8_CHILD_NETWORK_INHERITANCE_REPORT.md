# M02-02S8 — Child Network Inheritance Report

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Actual launch UTC29Oct23:59:33 = **30Oct06:59:33 WIB**. Companion: [Network Inheritance Gate Matrix](M02-02S8_NETWORK_INHERITANCE_GATE_MATRIX.md). Internal owned-fixture locator pada section6.

## 1. Executive summary

**ACCEPTED — BOUNDED CHILD LOOPBACK DENIAL INHERITED.**

One normal-user baseline reached **127.0.0.1:29485**, received ACK and closed. One explicit MXC parent retained A-ALLOW/B-DENY filesystem behavior, attempted TCP once, received **EACCES,errno-4092,syscall connect**, then spawned exactly one fixed cooperative child. The child independently passed the same A/B sanity and received the same permission error from one TCP attempt to the same owned listener.

Server accepted **baseline only**, zero parent/child connections or markers, and stayed listening across both attempts. Parent/child PID relationship correlated; child,parent,native launcher and server all exit0. No timeout, interference, fallback, policy widening or termination request. Process/listener cleanup verified with event receipts and Windows metadata.

**BOUNDED COOPERATIVE CHILD LOOPBACK DENIAL VERIFIED — TESTED CONFIGURATION ONLY. PUBLIC EGRESS STILL NOT VERIFIED. REAL CODING WORKER BLOCKED.**

## 2. M02-02S7 network baseline

[S7 report](M02-02S7_NETWORK_ENFORCEMENT_REPORT.md)/[matrix](M02-02S7_NETWORK_GATE_MATRIX.md) establish historical single-process loopback denial: normal-user baseline succeeded; one MXC connect failedEACCES/-4092/connect; no MXC server receipt, clean shutdown. Old endpoint36442 was not reused as a fixed port.

S8 preflight compared **43/43 S7 recorded inventory entries** with no mismatch; full S7 **44/44 files** unchanged across S8. Historical source/config/argv/server/precondition/cleanup receipts were reviewed read-only. No retrospective public-egress or child-network claim added to S7.

## 3. M02-02S6 child-process baseline

[S6 report](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md)/[matrix](M02-02S6_CHILD_PROCESS_GATE_MATRIX.md) establish historical one-parent/one-child filesystem confinement and cooperative cleanup. Its direct spawn/PID/PPID/output/deadline design informed S8, without treating filesystem evidence as network evidence.

S6 recorded38entries match; full **39/39 retained files** unchanged. [S5R2 report](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md)/[matrix](M02-02S5R2_OS_GATE_MATRIX.md), host-security harness/matrix, R1 atomic issuance and S4 provenance were reviewed as context. No architecture rewrite, historical fixture mutation or broad test rerun.

## 4. Windows/Codex/Node versions and hashes

Actual Windows **Microsoft Windows 11 Home Single Language**,10.0.26300,64-bit, build **26300.9711 /26H2**. Existing Node FileVersion **24.21.0**, executable C:\Program Files\nodejs\node.exe. Official retained full Windows x64 **Codex0.164.0**, separate from global **0.162.1**.

| Artifact | Current SHA-256 |
|---|---|
| Candidate main | 6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36 |
| Command runner helper | 30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB |
| Sandbox setup helper | 2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF |
| Node executable | BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32 |

Main and both helpers Authenticode **Valid, OpenAI OpCo, LLC.** No helper directly executed. [Official pinned release](https://github.com/openai/codex/releases/tag/rust-v0.164.0) and [S4 report](M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md) establish retained provenance/version. Current S4 recorded60entries match; full61files including45candidatefiles unchanged. No upgrade/install/download/version/help command. Active IDE Codex22256 retained; full extension not checksummed.

## 5. Official source compatibility considerations

Reviewed [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) and [permissions](https://learn.chatgpt.com/docs/permissions) with OpenAI Docs. Documentation describes child restrictions and configuration-dependent loopback behavior; it does not independently validate this machine.

Pinned0.164.0 [MXC policy source](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) distinguishes disabled/unproxied default deny from proxied loopback allowances. No proxy/allow_local_binding/domain exception introduced. **Inference:** both observed denials are consistent with the disabled strict configuration; this is not a full effective kernel-policy dump.

Exact Node24.21.0 [child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html), [net](https://nodejs.org/download/release/v24.21.0/docs/api/net.html) and [fs](https://nodejs.org/download/release/v24.21.0/docs/api/fs.html) references inform direct argv, literal IPv4, stream/close lifecycle and direct read calls. No file-based sandbox entry or runtime upgrade.

## 6. Fresh S8 fixture

One new canonical owned immediate child of OS Temp, UUID **d265d87f-bbbb-4ec5-a688-2e958b8a9ae8**. Internal Owner locator:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8
```

Layout: project-a/input/marker.txt; empty project-a/output; project-b/input/marker.txt; empty denied app-private/fake-credentials; synthetic test-home/config.toml; temp/config/scripts/evidence. Only two synthetic marker files, no real credential/SQLite/project copy. Root/sibling owner checks match current user, no elevation.

Canonical roots, input existence/sizes/hashes/single-link identity and no-reparse inventory recorded. No junction/symlink created. Normal CLI arg0 aliases/.lock appear only under new owned test-home and were never directly executed.

## 7. Normal-user filesystem baseline

Host direct filesystem baseline **2/2 passed**: A and B readable; SHA-256 matches initial canaries. These ordinary-user reads are controls, not sandbox evidence. B is a sibling outside A, never an approved workspace root.

Minimal sandbox sanity independently repeats the two reads in each process; no whole S5R2 matrix, write test, path escape, credential or future-file experiment. A/B markers unchanged after execution.

## 8. Strict profile semantic comparison

Selected **ai-office-s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8**. S7 original hash **5A621D3FE628D7B8EE862495EE9B0F16A4D6CCADCACFAD4833BCC2726A39C0EF**; new S8 hash **B1D282CB0CBFB88CBFDC9C06CD99F8700B9BC83D34C69F18BDE5FC518D1F5CA5**.

Only profile identity and root literals changed; reverse substitutions reproduce original text exactly. Configs are not byte-identical. Preserved extends:workspace, root deny, minimal read, A-only dot workspace write, exact B/private/credential/home/evidence denies, tmpdir/slash_tmp deny, ephemeral auth and network=false. No broad drive/user/Temp/parent grant, extra workspace, legacy override or child-specific exception.

## 9. Network-disabled and managed configuration evidence

Explicit windows.sandbox=mxc and --include-managed-config retained. Current read-only metadata: no HKLM64 RequirementsPath redirect, system config/requirements or new-home managed_config.toml. Process not elevated, no requirement disabled.

Nine reviewed target-environment keys: SystemRoot,WINDIR,ComSpec,SystemDrive,LOCALAPPDATA,bounded PATH,fresh denied TEMP/TMP,synthetic CODEX_HOME. No USERPROFILE/NODE_OPTIONS/provider/proxy secrets/operator opt-in forwarded. No global config/auth copied/read unnecessarily.

**EFFECTIVE_POLICY_PARTIALLY_VERIFIED.** Config/argv/pinned-source and runtime A/B/network observations support the tested boundary; no complete merged SDK/kernel/proxy policy or secret environment dump claimed.

## 10. Loopback listener design

Fixed host-side Node server, only node:net/node:fs, outside MXC. One listen call, exclusive literal127.0.0.1/port0. Maximum3intended accepted connections: baseline,parent,child; expected accepted count under deny policy is1.

Allowed marker classes only S8_HOST_BASELINE,S8_PARENT,S8_CHILD, each once; ACK S8_ACK. Max message32bytes/ACK7bytes, per-socket3s, listener25s, bounded output. Unknown/duplicate/oversize connections stop as interference, never attributed automatically to a sandbox process. No HTTP/backend/framework/data/admin interface, DNS, wildcard bind or background registration.

## 11. Bound address and assigned port

Actual listening **2026-10-29T23:59:33.026Z**: **127.0.0.1**, family **IPv4**, port **29485**, server PID7376. OS chose port0 assignment; no scan/fixed historical port/rebind/other service contacted.

Parent and child literal endpoint is exactly this owned port. Source construction validates address/family/range/listener readiness before freezing the port-bearing source and launching MXC.

## 12. Listener ownership

Verified Node +fixed server source through exact ChildProcess handle, PID7376, fixture-consistent events and launch window. No shell/detach/unref. Host source SHA checked before start.

Ownership is not inferred from a network marker alone. Server stdout/control pipes remain owned by controller23440; only fixed status/window/stop stdin messages. No unrelated process enumerated broadly or terminated.

## 13. Host TCP baseline

Exactly one normal-user client in controller PID **23440**. Start **23:59:33.031Z**,finish **.036Z**,**5ms**. Client127.0.0.1:29486 →server127.0.0.1:29485; server peer29486 matches.

Connect, S8_HOST_BASELINE17bytes received, fixed ACK7bytes matched, peer end/socket close; no timeout/error/DNS. Server baseline socket closed.036Z, ready for MXC.038Z. Ordinary-user reachability established, not isolation.

## 14. Fixed parent inline source

Parent bootstrap →A read →B deny →net-ready →one TCP attempt →classify →one child only after permission deny →capture/validate child identity/results →wait close →parent summary/exit.

Only node:fs,node:net,node:child_process. A failure/B success stops before network/spawn. Parent connectivity or ambiguous transport failure stops before child. Literal IPv4/family4/autoSelectFamily=false, no retry/endpoint change. Connected path sends at most synthetic S8_PARENT, closes and fails regression gate.

## 15. Fixed child inline source

Child bootstrap →A read →B deny →one TCP to same listener →structured result →cooperative exit. Only node:fs/node:net, no project import/dynamic input code/child_process/grandchild/socket listener. Connected path sends only fixed S8_CHILD and fails the tested requirement.

Common probe text is compiled into both fixed inline sources, not loaded from a project/temp file inside MXC. No normal-user child control or second sandbox invocation.

## 16. Source hashes

| Fixed source | UTF-8 bytes | SHA-256 |
|---|---|---|
| Parent inline | **14620** | **06C3F2B75995A0BB1FDD9D0648F27B6B0490DCFB6CB947203726CDDBA0BB105A** |
| Child inline | **4655** | **CBCD056B7BA2DF41B26F9935FBAABA4F3238D1735C9F3733D2737AE3A5E1B312** |
| Host server | **4277** | **F55095278BCDE3CBDA2BEE80E56609D9E09776D19D89E94F190CC0E27479F216** |
| Host controller | Recorded snapshot | **F5079C886D01CFD619F3B11E073DB35E39F52C7D2E3FD1A04137EE53D7907390** |

Templates/common/controller/server reviewed before listener; parse-only parent/child validation with dummy port did not execute a probe. Exact assigned-port sources frozen at **23:59:33.547Z**, before native start. JSON-quoted parent length15066 <28000 preflight bound. Only validated port and fixed synthetic/runtime data inserted; approved template hashes rechecked. Source snapshots and hashes retained unchanged.

## 17. Exact MXC argv

Executable retained <S4_ROOT>/candidate/bin/codex.exe. Exact absolute executable, complete literal argv/source/environment stored in inert evidence/invocation-spec.json. Sanitized vector:

```json
[
  "-c",
  "cli_auth_credentials_store=\"ephemeral\"",
  "-c",
  "windows.sandbox=mxc",
  "sandbox",
  "--include-managed-config",
  "--permission-profile",
  "ai-office-s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8",
  "--",
  "C:\\Program Files\\nodejs\\node.exe",
  "--eval",
  "<literal scripts/parent-inline.js; SHA-256 06C3F2B75995A0BB1FDD9D0648F27B6B0490DCFB6CB947203726CDDBA0BB105A>"
]
```

Actual separate arguments, no shell/placeholder execution; cwd fresh A, synthetic home, hidden window, ignored stdin, captured pipes, outer native deadline14s. No exec/app-server/model/auth command.

## 18. Exact child spawn configuration

Inside already sandboxed parent: verified C:\Program Files\nodejs\node.exe with argv["--eval",exact frozen child source], cwd same fresh A; shell=false,detached=false,windowsHide=true,stdio=["ignore","pipe","pipe"], explicit reviewed nine-key childEnv.

No additional MXC command or permission change. Parent retains exact ChildProcess handle, observes spawn/exit/close and bounded stdout/stderr. No unref/grandchildren/arbitrary executable/PowerShell/cmd payload.

## 19. MXC launch and child spawn counts

Exactly **1listener,1host baseline,1MXC,1child spawn attempt/created,1parent TCP,1child TCP**. Zero external/LAN/DNS/grandchild/inference/security-change budget consumed.

Exclusive wx experiment/listener/baseline/MXC issuance plus explicit S8 opt-in prevents accidental restart replay. Fixed parent has one non-looping spawn; probes each have one connect call. No ordinary npm/test hook, retry or fallback.

Native launcher **2220**, start **23:59:33.554Z**,finish **23:59:34.020Z**,**466ms**,exit0,signal/error null. Stdout5960bytes/stderr0. Successful execution reports denial, not successful networking. All one-shot allowances exhausted.

## 20. Parent filesystem sanity result

Parent PID15740: **P-F01 A read/content match** at23:59:33.889Z; **P-F02 B read EPERM/-4048/open** at.890Z. Sanity=true before network. Direct fs operations, no HostPathPolicy. No child before parent controls completed.

## 21. Parent TCP result

One attempt **23:59:33.890Z** to127.0.0.1:29485; actual **EACCES/-4092/connect** at.893Z. attempted=true,connected=false,markerSent=false,ackMatch=false,socketClosed=true,timeout=false,lookupObserved=false,statusPERMISSION_DENIED.

Only after this summary did parent attempt child spawn at **.894Z**, observed child12128 at **.903Z**. No parent regression, alternate target or ambiguous transport result.

## 22. Child filesystem sanity result

Child PID12128: **C-F01 A read/content match** at23:59:33.972Z; **C-F02 B read EPERM/-4048/open** at.973Z. Independent sanity=true before child TCP. This does not retest all S6 private/credential/write operations.

## 23. Child TCP result

One attempt **23:59:33.973Z** to same127.0.0.1:29485; **EACCES/-4092/connect** at.975Z. Summary.976Z: attempted=true,connected=false,markerSent=false,ackMatch=false,socketClosed=true,timeout=false,lookupObserved=false,statusPERMISSION_DENIED.

Child summary CHILD_LOOPBACK_DENIED, exit0; no connectivity gain relative to restricted parent. Direct child network call and successful host baseline provide enforcement evidence for this endpoint, not a parent-only inference.

## 24. Actual errors and syscalls

| Process / operation | Actual code | errno | syscall |
|---|---|---|---|
| Parent B read | EPERM | -4048 | open |
| Child B read | EPERM | -4048 | open |
| Parent TCP | EACCES | -4092 | connect |
| Child TCP | EACCES | -4092 | connect |

No ECONNREFUSED/ETIMEDOUT/EHOSTUNREACH, bootstrap failure or missing receipt counted as deny. Exact S7 numeric match was observed, not required by the predicate. Node error metadata, not an independent kernel trace.

## 25. Client/server event correlation

Same owned server listening at **23:59:33.038Z** before native start and **23:59:34.021Z** after native exit; same address/port,zero active sockets,total connection count1. Fixed server has no interval rebind path. Baseline was the sole accepted connection; **zero S8_PARENT/S8_CHILD markers/connections**,zero unexpected clients.

Evidence combines client permission errors, live-server window, baseline endpoint pair, fixed source/target, PID/PPID/handle/fixture identity and ordered timestamps. Absence of server receipt alone or marker class alone would be insufficient.

## 26. PID/PPID relationship evidence

| Process | Identity / observed lifecycle |
|---|---|
| Host controller/baseline |23440; server/native exact handles retained. |
| Host server |7376; fixed Node/source, matching events. |
| Native launcher |2220; host native receipt466ms/exit0. |
| Sandbox parent |15740; reportsPPID9936; bootstrap.886Z,exit.986Z. |
| Sandbox child |12128; reportsPPID15740; parent-observed spawn12128, bootstrap.969Z, self-exit.976Z, parent-observed exit.985Z. |

Child event PID equals parent spawn PID and PPID equals parent PID across all10events. Fixed verified executable/source plus exact handle/launch window/exit correlation supports cooperative ownership. No live CIM child CreationDate captured before quick exit; spawn/marker timestamps are observations, not fabricated OS creation times. Reported9936 not presumed cleanup-owned merely by PPID.

## 27. Timeouts and cleanup

Fixed baseline2s,parent TCP3s,child TCP3s,child process6s,parent12s,outer native14s,host orchestration17s(shortened from recommended18),listener25s. Parent/child stdout16KiB,stderr8KiB. Actual child stdout2399bytes/stderr0; parent/native5960/0; server2081/0. No overflow or deadline extension.

Child exit0 observed.985Z; parent waits close then exits0.986Z. Server stop at23:59:34.024Z,close **.025Z**: listening=false,address=null,activeSockets0; server exit0 by.036Z,1105ms inclusive startup/exit. Both denied sockets closed, baseline closed normally.

At **23:59:57.4480705Z**, exact-port29485 LISTEN query empty; exact7376/2220/15740/12128/9936/23440 PID queries and fixture-scoped Node/Codex query empty. Active IDE22256alive. No kill, unrelated termination or reconnect used for cleanup verification. Normal cooperative cleanup only; timeout/kill escalation/crash/hostile persistence untested.

## 28. Security findings

No forbidden filesystem success, parent connectivity regression, child connectivity gain, unauthorized endpoint, interference, fallback or policy drift observed. No confirmed escape/severity assigned.

Narrow finding: fixed cooperative child retained the tested parent's loopback denial. This is not all-ports/protocols/hostile-code certification and does not authorize removing independent localhost authentication/authorization. General trusted-host or same-user interference resistance not established.

## 29. Fixture and binary integrity

A/B canaries **2/2 unchanged**, canonical roots/profile/source/manifest/budget identities unchanged, no unexpected reparse. project-a/output remains empty; only intended new source/evidence/config/normal CLI home artifacts. No evidence deleted.

Actual task pre/post and final after-report comparisons:

| Protected scope | Result |
|---|---|
| Existing AI OFFICE outside node_modules | **123/123 hashes unchanged**; final **125files**, exactly2authorized reports added. |
| Existing source/security/tests/probes/contracts/schema/package/lock/screenshots/reports | Included in unchanged123; no implementation edits. |
| Global Codex0.162.1 | **50/50 unchanged**. |
| Retained S4 including candidate | **61/61 unchanged**, includes45candidatefiles. |
| Other retained roots |22/22,22/22,6/6,S5 36/36,S5R18/18,S5R2 38/38,S6 39/39,S7 44/44 unchanged. |
| Hermes3D tracked files | **647/647 unchanged**; HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing modified package-lock.json preserved. |
| Parent PATH | Fingerprint unchanged; no user/system mutation. |

Nine retained roots total286files compared; known S5R2 junction identity preserved without traversal. No real auth/credentials/.sandbox-secrets/SQLite/provider login/inference/Paid API/credits/worker/app-server/global config writes/security changes/elevation/WSL/dependencies/Git init/historical cleanup. Google AI Studio not written, not checksum-audited. No whole-host syscall/network/full-extension/globalconfig checksum guarantee.

All new artifacts retained and inventoried, excluding only inventory's own hash. Historical M01 300PASS/1SKIPPED/security60PASS/S5R2/S6/S7 results were not rerun; no browser E2E/typecheck/npm regression required or run for report-only repository changes.

## 30. Public network limitations

**PUBLIC INTERNET EGRESS STILL NOT VERIFIED.** No public/provider/LAN/DNS/IPv6/UDP/proxy test or real AI OFFICE service contact. No documentation IP/unreachable destination substituted as security proof. Official-doc research traffic is separate from experimental command boundary.

Only one IPv4 TCP endpoint and one cooperative parent/child pair tested. Different addresses/ports/protocols/configurations, proxy exceptions or hostile children require separate evidence.

## 31. Remaining worker blockers

Hostile/detached persistence/foreground crash, future-file deny timing, real credential custody, actual app-server/tools/approvals/cancellation/skills, production lease/durable issuance/dispatch/recovery, account entitlement and included-only cap remain NOT VERIFIED; account eligibility UNKNOWN. Nonusage is not billing enforcement.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED. REAL WORKER BLOCKED.**

## 32. Final acceptance decision

**ACCEPTED — BOUNDED CHILD LOOPBACK DENIAL INHERITED.**

Baseline succeeded; strict semantics retained; parent and child independently passed A/B sanity and received permission-related TCP denial to same live owned endpoint; exactly one identified child; server baseline-only; all clean exits,closed sockets/listener,known process absence and preserved files. Full effective policy remains partially observable; evidence supports the tested property only.

## 33. Recommended next bounded milestone

Propose **M02-02S9 — Bounded Future-File Deny Timing Validation**: separately reviewed one fresh synthetic fixture, one fixed MXC probe and explicit host-to-probe timing handshake to test a denied sibling file created after process start. Preserve strict root/directory denial; no real credentials, network, arbitrary watcher, hostile process or implicit profile relaxation. Exact code/targets/budget/deadlines need a new task authorization. **Not started.**

Owner review applies to completed S8 evidence and a separately authorized precise next task, not another S8 launch/child. Do not begin M02-03/app-server/worker/inference/billing, change Windows security or clean historical evidence automatically.

**M02-02S8 COMPLETE — BOUNDED COOPERATIVE CHILD LOOPBACK DENIAL VERIFIED — PUBLIC EGRESS STILL NOT VERIFIED — REAL CODING WORKER BLOCKED.**
