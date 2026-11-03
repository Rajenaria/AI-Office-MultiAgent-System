# M02-02S6 — Cooperative Child-Process Confinement Report

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Actual launch UTC 29 Oktober 23:18:38 = **30 Oktober 06:18:38 WIB**. Companion: [Child Process Gate Matrix](M02-02S6_CHILD_PROCESS_GATE_MATRIX.md). Evidence disimpan pada satu owned `<S6_ROOT>/evidence/`; locator di section 4.

## 1. Executive summary

**ACCEPTED — BOUNDED COOPERATIVE CHILD CONFINEMENT — TESTED CONFIGURATION ONLY.**

Satu explicit MXC invocation menjalankan satu fixed inline parent dan tepat satu fixed cooperative Node child. Parent membaca Project A dengan content match dan gagal membaca B dengan actual permission error. Child menjalankan **7/7 direct filesystem operations**: A read dan exclusive create/write berhasil; B read/create, fake private-state read, dummy-credential read/create seluruhnya ditolak dengan **EPERM, errno -4048, syscall open**.

Host baseline **7/7 berhasil** memakai output names berbeda. Native launcher exit **0**, parent exit **0**, child exit **0**, durasi outer **442 ms**. Tidak ada retry, fallback, timeout, termination request atau forbidden output. PID/PPID dan fixed ChildProcess handle berkorelasi; post-audit tidak menemukan proses uji tersisa. **REAL CODING WORKER STILL BLOCKED.**

## 2. Windows, Codex and Node baseline

Actual Windows: **Microsoft Windows 11 Home Single Language**, 64-bit, `10.0.26300`, build **26300.9711**, **26H2**. Retained official full Windows x64 Codex bundle **0.164.0**, terpisah dari global package **0.162.1**. Existing Node FileVersion **24.21.0**, `C:\Program Files\nodejs\node.exe`. Tidak ada install, upgrade atau version/help launch tambahan.

| Artifact | Current SHA-256 | Identity evidence |
|---|---|---|
| Candidate main | `6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36` | Authenticode Valid; OpenAI OpCo, LLC. |
| Command runner helper | `30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB` | Authenticode Valid; same signer; not directly executed. |
| Sandbox setup helper | `2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF` | Authenticode Valid; same signer; not directly executed. |
| Node executable | `BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32` | Matches prior runtime hash and current FileVersion. |

[Official pinned release](https://github.com/openai/codex/releases/tag/rust-v0.164.0) and [S4 provenance](M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md) establish retained version/package history. S4 recorded inventory **60/60 entries** still match; full task pre/post S4 **61/61 files**, including **45 candidate files**, unchanged. Global installation **50/50 files** unchanged. Whole VS Code extension was not checksummed; active Codex PID 22256 was observed and left untouched.

## 3. S5R2 containment baseline

[S5R2 primary report](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md) and [matrix](M02-02S5R2_OS_GATE_MATRIX.md) establish the preceding single-process filesystem result: 12 operations, 2 ALLOW, 10 EPERM denies, host baseline 12/12. S6 does not rewrite that milestone or reuse its writable fixture.

Required host-harness report/matrix, R1 atomic issuance, S4 report/matrix, S5 report/matrix and S5R bootstrap report were reviewed as historical context. Host policy and durable synthetic journal are distinct from OS confinement and production leases. S5 file-entry failure remains historical; inline execution avoids requiring a file entry, without asserting its underlying root cause was fixed.

S5R2 **37/37 recorded inventory entries** match at S6 preflight. Full retained S5R2 **38/38 file hashes** and its single known junction remain unchanged across S6. Its old PIDs were absent before execution. Historical network, hostile/detached process, future-file timing and real credential limitations stay open.

## 4. New S6 fixture and ownership

Exactly one new canonical owned immediate child of the OS Temp directory:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s6-e9804b6f-3d37-4f9f-aa65-afab7414d021
```

Fixture ID: **e9804b6f-3d37-4f9f-aa65-afab7414d021**. Root and A/B/private/credential/home/temp owner metadata match the current user; no elevation. Canonical paths, sizes, hashes, single-link input identities, absent outputs and operation manifest are recorded. No junction/symlink created; no unexpected reparse before or after.

```text
<S6_ROOT>/
  project-a/input/canary.txt
  project-a/output/{host-baseline-output.txt,child-output.txt}
  project-a/output/parent-output.txt                [reserved, absent, unused]
  project-b/input/canary.txt
  project-b/output/host-baseline-output.txt
  project-b/output/child-denied-output.txt          [absent]
  app-private/fake-project.db                       [synthetic plain text]
  fake-credentials/dummy-canary.txt                 [synthetic, value not logged]
  fake-credentials/output/host-baseline-output.txt
  fake-credentials/output/child-denied-output.txt    [absent]
  test-home/config.toml
  test-home/tmp/arg0-windows/...                    [normal CLI aliases]
  temp/
  config/
  evidence/
```

All artifacts are synthetic disposable data or bounded evidence. No actual SQLite database or credential material copied. Parent-only target was reserved as requested, remained absent, and was not an additional test operation. All evidence retained; no operator deletion or cleanup bypass.

## 5. Normal-user host controls

One host baseline: **4 reads +3 exclusive create/writes =7/7 success**. Reads cover A, B, fake private state, dummy credentials; hashes match initial canaries. Writes cover A/B/credential output directories using distinct **host-baseline-output.txt**. The four sandbox target names remained absent after baseline and immediately before launch.

Baseline uses direct Node filesystem APIs outside MXC, no HostPathPolicy. Ordinary Windows permissions therefore permit the target reads and output directories. The exact forbidden output files were not pre-created. Optional normal-user child control: **NOT RUN**; source was parse-validated and direct argv construction reviewed. No failed normal-user child startup was ignored.

## 6. Strict profile semantic comparison

Selected profile **ai-office-s6-e9804b6f-3d37-4f9f-aa65-afab7414d021**.

| Configuration | SHA-256 |
|---|---|
| S5R2 original, read-only | `6149E00A832BEA0AD6701A789C137DEE11BF0E5736D3678981CACF213EC68D99` |
| Fresh S6 | `BB41FFDFD0FA12A15BC8B277442A59449F41634054606BCCD2EAC824963338A7` |

Only profile name and absolute fixture-root literals changed. Reverse substitution reproduces exact S5R2 text; **not byte-identical configs**, but no permission value/inheritance change. `config/semantic-diff.json` records the comparison.

Preserved: `extends=":workspace"`, `:root=deny`, `:minimal=read`, `:tmpdir=deny`, `:slash_tmp=deny`; explicit B/private/credential/home/evidence denies; `filesystem.":workspace_roots"` contains only `"."="write"`; network disabled; ephemeral credential store; explicit MXC. No extra child grant, unrestricted profile, broad drive/user/Temp/fixture-parent grant, legacy sandbox setting or policy repair.

## 7. Effective workspace-root analysis

Actual cwd is fresh **Project A**; no additional workspace-root setting/session inherited. Named strict profile is selected explicitly, while built-in `:workspace` remains its reviewed parent. B/private/credentials are siblings outside A, not workspace roots. TEMP/TMP point to denied sibling temp, not fixture parent. New CODEX_HOME is another denied sibling.

Managed requirements preserved with `--include-managed-config`. Current read-only preflight found no HKLM64 RequirementsPath override, system config/requirements or synthetic-home legacy managed file. No global config/auth read/copy. No complete merged-kernel-policy dump is claimed; config/argv, prior pinned-source review and actual positive/negative operations support this narrow result.

Current [permissions](https://learn.chatgpt.com/docs/permissions) and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) inform selection/precedence. These documents do not independently certify this machine.

## 8. Parent probe design

Fixed Node `--eval`, only `node:fs` and `node:child_process`. Emits bootstrap with PID/PPID; validates A read; attempts B read. It proceeds to one fixed spawn only when A matches and B returns EPERM/EACCES. Success reading B stops before any child spawn.

Single non-looping spawn call, fixed absolute Node executable, literal child source, A cwd, exact reviewed environment, no shell/detach/unref. Parent captures bounded child pipes, validates operation order, fixture ID, PID/PPID, summaries and exits, waits for child `close`, then summarizes and exits naturally. Spawn/startup/protocol failure cannot pass as confinement.

## 9. Child probe design

Fixed inline source requires only `node:fs`. Finite manifest executes C-F01–C-F07 in order. Actual calls are `fs.readFileSync`, `fs.openSync("wx")`, `fs.writeSync`, `fs.closeSync`. No application source, host policy evaluator, external package, env dump, process spawning, asynchronous background work, sockets or data-content logging.

A positives run first. Approved failure, unknown error or forbidden success stops remaining operations. Forbidden create success would be recorded immediately and preserved, without writing a payload into that resource. ENOENT/EINVAL/unknown failures do not count as permission denies. Exclusive creates test new-file creation only; overwrite/rename/delete were not tested.

## 10. Fixed source hashes

| Source | UTF-8 bytes | SHA-256 |
|---|---|---|
| `config/parent-inline.js` | **10613** | `72CFA924ED2C571992685582713E58EE1C87D22DEF7389C2E0957C6EE8A18492` |
| `config/child-inline.js` | **3525** | `DC4D4942CA1A08B0844E578F6601D5C451D45051DF176241EA8138B451B1D58A` |

Both parse-validated without probe execution, manually reviewed before launch and rechecked against approved hashes. Parent embeds the exact child literal. Templates are retained for construction review; neither snapshot is loaded as a sandbox file entry. Internal line-split control checked NDJSON parsing without spawning a process.

One oversized host preparation command was rejected by Windows **206 before process creation**; no fixture or MXC resulted. Preparation was split before creating the one root. It was not an executed sandbox failure or retry.

## 11. Exact command and child spawn parameters

Exact executable:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW\candidate\bin\codex.exe
```

Actual argument vector, with the large final element referenced by its fixed snapshot rather than shell-quoted:

```text
["-c", "cli_auth_credentials_store=\"ephemeral\"",
 "-c", "windows.sandbox=mxc",
 "sandbox", "--include-managed-config", "--permission-profile",
 "ai-office-s6-e9804b6f-3d37-4f9f-aa65-afab7414d021", "--",
 "C:\\Program Files\\nodejs\\node.exe", "--eval",
 <literal UTF-8 contents of config/parent-inline.js; SHA-256 in section 10>]
```

**Exact complete executable/argv/source/environment values** are preserved in internal `evidence/invocation-spec.json`, an inert record written from frozen inputs, and checked against issued source hashes. No placeholder path was executed; no shell command-string construction. Cwd fresh A; hidden window; ignored stdin; captured pipes; outer timeout15000ms/maxBuffer65536.

Parent child call uses absolute same Node, `["--eval", exactChildSource]`, cwd A, `shell:false, detached:false, windowsHide:true, stdio:["ignore","pipe","pipe"]`. No grandchildren. Reviewed explicit nine-key environment for both launch and child: SystemRoot, WINDIR, ComSpec, SystemDrive, LOCALAPPDATA, bounded PATH, fresh TEMP/TMP and CODEX_HOME. ComSpec points to trusted system cmd as a startup variable only; cmd was not the payload. No NODE_OPTIONS, USERPROFILE, provider/API/proxy secrets or operator opt-in forwarded.

[Node 24.21.0 spawn documentation](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html#child_processspawncommand-args-options) supports these options; `close` follows process exit and stdio closure. Requested latest-v24 fs page currently documents24.22.2; [exact24.21.0 filesystem documentation](https://nodejs.org/download/release/v24.21.0/docs/api/fs.html) matches the unchanged runtime.

## 12. Actual MXC launch count

**1 invocation / max1**, persisted exclusive `mxc-issued.json` before native spawn, explicit matching S6 opt-in. Start **2026-10-29T23:18:38.241Z**, finished **23:18:38.683Z**, native PID **22444**, exit **0**, signal/error null, **442ms**.

Native stdout **5325bytes**, stderr **0bytes**. No fallback/profile/auth/elevation warning. Issuance is consumed even on failure; no retry, second environment variation or launch after this result. S6 budget **exhausted**.

## 13. Actual child spawn count

Exactly **1 attempted /1 created /max1** in sandbox parent. Spawn attempt at **23:18:38.566Z**; parent observed spawned child **23824** at **23:18:38.578Z**. One `ChildProcess` object retained through exit/close. No host normal-user child control, detached child or grandchild. Host evidence controller and MXC internal launcher mechanics are not additional test child payloads.

## 14. Parent test outcomes

| ID | Direct operation | Actual | Status |
|---|---|---|---|
| P-F01 | A input read, expected ALLOW | Success/content match, no error | OS_VERIFIED |
| P-F02 | B canary read, expected DENY | EPERM/-4048/open | OS_VERIFIED |

Bootstrap marker **S6_PARENT_BOOTSTRAP_OK**, PID2968. Both operations completed before the spawn attempt. Parent reads do not substitute for child proof; child independently executed its own matrix.

## 15. Child filesystem test outcomes

| ID | Operation | Expected | Actual result | Status |
|---|---|---|---|---|
| C-F01 | A input read | ALLOW | Success/contentMatch=true | OS_VERIFIED |
| C-F02 | A output exclusive create/write | ALLOW | Success/created=true; content/hash confirmed | OS_VERIFIED |
| C-F03 | B canary read | DENY | EPERM/-4048/open | OS_VERIFIED |
| C-F04 | B output exclusive create | DENY | EPERM/-4048/open; created=false | OS_VERIFIED |
| C-F05 | Fake private-state read | DENY | EPERM/-4048/open | OS_VERIFIED |
| C-F06 | Dummy-credential read | DENY | EPERM/-4048/open | OS_VERIFIED |
| C-F07 | Dummy-credential exclusive create | DENY | EPERM/-4048/open; created=false | OS_VERIFIED |

Actual child bootstrap **S6_CHILD_BOOTSTRAP_OK**, fs-ready marker, seven operation events, final CHILD_FS_VERIFIED, planned7/attempted7/unattempted[]. **2 ALLOW /5 DENY**, zero skipped/inconclusive/unexpected successes. Child stdout **3033bytes**, stderr **0bytes**, no output-limit truncation.

## 16. Exact permission errors

Parent P-F02 and all child C-F03–C-F07: actual **code=EPERM, errno=-4048, syscall=open**. Direct target operations produced the errors after successful normal-user controls. No ENOENT, bootstrap error, unknown error, missing output alone or host policy rejection was counted as OS deny. Error metadata is Node-reported; no kernel syscall trace was collected.

## 17. PID and process relationship evidence

| Process | PID / relationship | Evidence |
|---|---|---|
| Native Codex launcher |22444| Host spawn result, native exit0. |
| Fixed sandbox parent Node |2968; reports PPID8108| Bootstrap and all parent events consistent. |
| Fixed child Node |23824; reports PPID2968| Parent-observed spawn PID equals every child event PID; PPID equals parent2968. |
| Reported parent-of-parent |8108| Recorded only; not presumed cleanup-owned by PPID alone. |
| Active VS Code Codex |22256| Observed alive after test; untouched. |

Child executable was fixed/hashed before spawn; actual parent-owned process handle, launch window, child PID/PPID, exit0 and stream closure establish cooperative identity. No live child CIM creation-time sample was captured because it completed quickly. Recorded spawn/marker times are observations, not invented OS CreationDate or independent kernel ancestry attestation. No uncertain PID was terminated.

## 18. Parent/child deadlines

Fixed budgets: **child5000ms**, **parent10000ms**, **outer15000ms**. Child active guard begins immediately after spawn call; parent guard is established just before spawn after finite parent controls. No deadline extension. A timeout/output overflow would fail the result, request stop only using the exact spawned child handle, and preserve evidence.

Child reported batch ran23:18:38.635–.641Z; parent observed child exit at.649Z; parent exit at.650Z. No timeout or signal request. Timeout cleanup, kill escalation, foreground crash and crash recovery are **NOT VERIFIED** by this cooperative run.

## 19. Exit and cleanup results

Child self-exit0 at**23:18:38.641Z**, parent observed exit0 at**.649Z**, parent exit0 at**.650Z**, native launcher exit0 by**.683Z**. Parent waited for child exit/stdio close before successful summary. Zero termination requests, no process killed.

At **2026-10-29T23:18:52.7420328Z**, exact PID queries22444/2968/23824/8108 returned absent; fixture-ID-scoped Node/Codex query returned no owned match; active22256 remained present. No process-name-wide termination or broad unrelated-process inventory.

Statuses: **COOPERATIVE_CHILD_VERIFIED**, **COOPERATIVE_CLEANUP_VERIFIED**, **HOSTILE_CHILD_NOT_VERIFIED**, **DETACHED_CHILD_NOT_TESTED**, **CRASH_RECOVERY_NOT_VERIFIED**. File evidence is intentionally retained, separate from process cleanup.

## 20. Fixture integrity

Four input canaries **4/4 unchanged**, including fake private marker and credential marker. Child A output **63bytes**, SHA-256 **8D4921F7AF296AF4D58ED12C14891989CA9491950185AC42C8E4172514722BB3**, matching the expected marker hash and size. Contents of denied canaries are not exposed.

B/credential forbidden targets **2/2 absent**; reserved parent target remains absent/unused. Distinct host baseline outputs retained. Canonical roots/profile unchanged; no unexpected reparse or fixture-path escape. Observed new CLI files are only normal owned-home arg0 aliases/.lock; never directly executed. Final relative inventory hashes every retained file except its own inventory record, never follows a reparse.

## 21. Security findings and severity

No forbidden access succeeded, no observed sandbox escape, no actionable security finding/severity assigned. Direct child denials under the same strict policy establish **bounded cooperative filesystem inheritance** for these targets and APIs. Missing hostile/network/runtime/account coverage remains a material limitation, not silently a PASS or a fabricated vulnerability.

One Windows206 host transport rejection occurred before process creation during preparation (section10); no sandbox retry or security relaxation resulted.

## 22. Source and binary preservation

Actual pre/post comparisons, completed again after report creation:

| Protected scope | Result |
|---|---|
| Existing AI OFFICE files outside node_modules | **119/119 hashes unchanged**; final**121files**, only these two authorized reports added. |
| Application/source/tests/probes/contracts/schema/package/lock/screenshots/prior reports | All included in unchanged119; no implementation changes. |
| Global Codex0.162.1 package | **50/50 hashes unchanged**. |
| Retained S4 evidence/candidate | **61/61 unchanged**, including45candidatefiles. |
| Historical QHnCi9/TLkI1Y/nUSJvQ | **22/22,22/22,6/6 unchanged**. |
| S5 /S5R /S5R2 | **36/36,18/18,38/38 unchanged**; known S5R2 junction identity preserved. |
| Hermes3D tracked files | **647/647 unchanged**; HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing modified package-lock.json preserved. |
| Parent PATH | Fingerprint unchanged; no user/system PATH mutation. |

No Windows ACL/firewall/Defender/registry/UAC/features changes, admin elevation, WSL, install, Git init, existing fixture cleanup, real credential access, login/logout, inference, app-server, worker, Paid API or purchased credits. Registry/owner checks were read-only metadata. Official-source documentation requests are separate from sandbox network experiments.

Global auth/config, full extension and external Google AI Studio/Visual Lab were not checksum-audited or syscall-audited; no task writes. Protected-scope hash claims do not extend to the whole host. Historical M01**300PASS/1SKIPPED**, runtime-security**60PASS**, S5R2**12/12** were **not rerun**. No npm/Vitest/typecheck/browser E2E/screenshot regeneration required or run for this report-only repository change.

## 23. Network and hostile-child limitations

[Current official Windows sandbox documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox) describes filesystem/network restrictions applying to commands and their children, foreground-lifetime behavior, and deny-read glob timing. This test supplies local evidence only for the fixed cooperative filesystem case.

**Network enforcement NOT VERIFIED**, although profile network=false. No listener, localhost/provider/LAN/DNS/proxy test. **Future-file timing NOT VERIFIED**; pre-existing canary denies and exclusive create failures do not prove all later-created-file behavior. Hostile/detached/persistent descendants, grandchildren, cancellation/foreground-crash cleanup, PID reuse and all handle leaks remain untested. No path variants/junction matrix repeated in S6.

## 24. Remaining worker blockers

Actual app-server protocol/adapter, runtime approvals/cancellation, credential custody, arbitrary tool/skill enforcement, network, hostile lifecycle, future-file behavior, durable production lease/crash recovery/cross-process dispatch/reconciliation, account/subscription entitlement and included-only billing remain **NOT VERIFIED**. No account inspection was performed; eligibility UNKNOWN. No-spend experiment is not an enforced billing cap.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.** Real worker remains **BLOCKED**, including M02-03 activation.

## 25. Final containment decision

**BOUNDED COOPERATIVE CHILD-PROCESS FILESYSTEM CONFINEMENT VERIFIED.**

Acceptance A: explicit MXC, semantically preserved strict profile, parent A-positive/B-deny, exactly one identified child, independent child7/7 direct-I/O matrix, successful ordinary-user controls, output/canary integrity, clean child/parent/native exits and bounded final process accounting. Applies only to tested environment, cooperative code, exact operations and policy. No runtime/worker authorization inferred.

## 26. Recommended next bounded milestone

Propose **M02-02S7 — Bounded Network Enforcement Validation**. Prepare a separately authorized non-AI synthetic endpoint design, exact local destination/expected deny controls, strict unchanged network-off policy, explicit endpoint/probe ownership, output/deadline/launch budget and no external/provider/LAN traffic. Review MXC loopback/proxy caveats before deciding whether that design can yield interpretable enforcement evidence. Do not start a listener or network probe as part of S6.

Owner review is for this completed concrete result and a new bounded S7 request defining endpoints, positive baseline, exact code/argv, synthetic fixture, budgets, cleanup and stop conditions. No extra S6 launch, M02-03, app-server, inference, worker or billing activation. All new S6 artifacts retained; exact final inventory and change-safety receipts are available internally.

**M02-02S6 COMPLETE — BOUNDED COOPERATIVE CHILD CONFINEMENT VERIFIED — REAL CODING WORKER STILL BLOCKED — AWAITING OWNER REVIEW.**
