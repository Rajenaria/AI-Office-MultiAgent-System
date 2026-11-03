# M02-02S — Windows OS Containment Validation

Tanggal: 29 Oktober 2026, Asia/Jakarta. Companion: [OS Runtime Gate Matrix](M02-02S_OS_RUNTIME_GATE_MATRIX.md).

## 1. Executive decision

**CONDITIONAL — CAPABILITY OR POLICY GAP.** Satu authorized explicit MXC sandbox-only compatibility command dijalankan, tetapi exit **1** dengan `MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).` Tidak ada output `MXC_OK`. Candidate dihentikan tanpa retry/fallback, setup atau perubahan Windows security.

Ini actual launcher failure dalam exact isolated test environment, **bukan bukti bahwa Windows Home tidak mendukung MXC, bahwa MXC secara umum UNSUPPORTED, atau bahwa denied read/write berhasil**. Penyebab spesifik belum diketahui. Minimal environment allowlist dan temporary CODEX_HOME/helper-alias constraint merupakan possible contributors, belum root cause yang dibuktikan.

**OS containment NOT VERIFIED; CODEX_SANDBOX_COMMAND_VERIFIED tidak diberikan. Real Codex worker BLOCKED.** Direct filesystem/child/network/race tests M02-02S **NOT RUN** karena successful startup/effective policy prerequisites belum terpenuhi. Ini negative/incomplete capability evidence yang sah untuk bounded task, bukan OS acceptance.

Existing foundation tetap green: typecheck PASS; M01 **300 PASS/1 SKIPPED**; runtime-security **60 PASS**, termasuk 11 R01 cases. Tidak menambah placeholder skipped tests atau mengubah source untuk mendapatkan PASS.

## 2. Actual machine environment

| Item | Actual observation |
|---|---|
| Application root | `D:\Rajendra\AI-Projects\AI-Office`, ordinary directory, no `.git` |
| Windows | CIM: `Microsoft Windows 11 Home Single Language`, x64, `10.0.26300` |
| Edition/build | Registry EditionID `CoreSingleLanguage`, DisplayVersion `26H2`, build `26300.9711` |
| Hardware metadata | HypervisorPresent=true; VirtualizationFirmwareEnabled=true; RAM 7,866,445,824 bytes (~7.33 GiB) |
| Other CPU flags | VMMonitorModeExtensions/SLAT CIM flags false in observed hypervisor-active state; not treated as definitive unsupported-hardware proof |
| Node/npm | `v24.21.0` / `11.19.0` |
| Selected Codex installation | Existing global npm `@openai/codex` metadata `0.162.1`; platform package `0.162.1-win32-x64` |
| Actual native CLI | `--version` exit 0, stdout `codex-cli 0.162.1` |
| WSL | System32 `wsl.exe` present; `--list --verbose` exit 0: Ubuntu, Stopped, VERSION 2 |

An additional VS Code extension Codex executable was discovered by command metadata, but not selected or invoked. npm `.ps1`/`.cmd` shims were inspected via installed dispatcher metadata, not used as an inference entry point. Selected native executable:

`C:\Users\USEP REZA USAMAH\AppData\Roaming\npm\node_modules\@openai\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\bin\codex.exe`

Regular installed file, 333,479,728 bytes. SHA-256 pinned before invocation and rechecked: `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`. Package metadata matches actual version; no upgrade/download/install. This is local executable identity evidence, not a fresh supply-chain attestation.

No optional feature was enabled/disabled, no distro started, no virtualization setting changed. Presence of a hypervisor or recent build alone does not prove usable MXC capability.

## 3. Source baseline reviewed

Relevant evidence reviewed from all required existing reports: M01-07 acceptance; both M02-01 reports; both M02-02 reports; both M02-02R reports; M02-02R1 atomic issuance report. Relevant current context/policy/approval/journal/supervisor and runtime-security tests/helpers/probes were inspected. R01 reservation/publication checks remain present; no actual adapter/worker route was added.

Before test work, **102 existing AI-Office files** outside node_modules and **647 Hermes3D tracked files** were inventoried/hashed. Required source/report files were present. Current module constraints remain fixture-only; policy evaluator cannot confine direct IO. Existing tests use new disposable roots and do not reopen/delete historical retained roots. Existing E2E explicitly writes accepted repository screenshot paths, so it was not run.

## 4. Official documentation and candidate selection

Current sources accessed 29 Oktober 2026:

| Reference | Evidence used / local limit |
|---|---|
| [Codex Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) | Explicit MXC compatibility command for CLI ≥0.162.0; selection must fail rather than silently fallback. Local command failed, not accepted |
| [Codex permissions](https://learn.chatgpt.com/docs/permissions) | Built-ins/custom profiles; legacy settings compatibility; separate filesystem/network controls. `:workspace` is not a deny-all-outside read profile |
| [Developer commands](https://learn.chatgpt.com/docs/developer-commands) | Sandbox helper syntax and `--permission-profile`, `--include-managed-config`, `--cd`; corroborated by installed CLI help |
| [Windows Sandbox](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/) | Microsoft Windows Sandbox unsupported on Home; distinct from MXC |
| [WSL FAQ](https://learn.microsoft.com/en-us/windows/wsl/faq) | WSL host-drive integration means distro availability alone is not host isolation |
| [Codex app-server](https://developers.openai.com/codex/app-server) | Future interface reference only; no handshake/app-server executed |
| [Authentication](https://learn.chatgpt.com/docs/auth), [environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables) | Fixture CODEX_HOME and ephemeral credential storage; no real auth state copied/read |
| [Win32 error codes](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-) | 203/0xCB = ERROR_ENVVAR_NOT_FOUND; identifies error category, not the missing variable or exact launcher root cause |

**Selected: native MXC, explicitly requested.** No reliance on preference-based selection. Elevated provisioning, legacy unelevated denied-read limitations and full-access fallback are outside this experiment. Their use was not attempted.

Candidate 2: existing WSL2 Ubuntu is available but stopped. It was not started, configured, mounted or used. Existing host-drive mounts, interop, credentials and test-data isolation are NOT VERIFIED; no safe fallback claim is made. Microsoft Windows Sandbox is **UNSUPPORTED on observed Home edition**. Other identities/AppContainer/VM/container capabilities remain documentation-only alternatives; no setup or account/security mutation was performed. MXC itself is **NOT VERIFIED**, not labeled UNSUPPORTED from this error.

## 5. Fixture ownership and execution environment

One new minimal compatibility fixture was created with mkdtemp under canonical OS temp:

`C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s-nUSJvQ`

Root is immediate child of the real temp parent; identity/realpath and no-symlink checks were performed before execution. Final tree inspection rejected ReparsePoint entries before descent and found none. Layout:

```text
ai-office-m0202s-nUSJvQ/
  project-a/                 # empty compatibility cwd
  empty-codex-home/
    config.toml             # synthetic config only, no auth/session
  probe-results/
    manifest.json
    version.json
    sandbox-help.json
    mxc-compatibility.json
    wsl-list.json
```

This is **not** the full A/B/private/canary fixture: those files were deliberately not created because no usable sandbox had started. Consequently no fabricated canary hashes or denied-IO results are supplied. Host creation/write of this test root proves test-output access, not OS containment.

Native Codex invocations used only these explicit child environment keys:

`SystemRoot`, `WINDIR`, `PATH`, `TEMP`, `TMP`, `CODEX_HOME`.

PATH contained current Node directory and Windows System32; TEMP/TMP and CODEX_HOME pointed inside the new fixture. Provider/API tokens, NODE_OPTIONS and arbitrary inherited environment were not passed. No HOME variable was repurposed. Temporary config contained only:

```toml
cli_auth_credentials_store = "ephemeral"
```

No actual auth/profile was copied or opened, and no login method/session was changed. Ephemeral configuration is a precaution for this model-free helper, not credential-isolation proof for actual runtime code. CODEX_HOME final inventory contains only this synthetic config; no auth/session file was generated there. Global owner configuration was not read or overwritten by our tools.

Default root ACL was read, not modified: current user owns the root; access rules are inherited, including current user/SYSTEM/Administrators and pre-existing sandbox-related principals. This is not a newly created restricted-user boundary; no user/group membership was changed. Existing inherited grants are not evidence of sandbox enforcement.

## 6. Commands actually executed

All native Codex commands used the pinned absolute executable directly with `windowsHide`, explicit cwd/environment, bounded output and timeout, without npm shell shims or arbitrary project commands.

| Command / purpose | Actual result |
|---|---|
| `<pinned-codex.exe> --version` | Exit 0, `codex-cli 0.162.1`; metadata only |
| `<pinned-codex.exe> sandbox --help` | Exit 0; installed help accepts requested profile/managed-config flags and Windows command arguments |
| Explicit MXC compatibility command below | Exit **1**, PID **29852**, 1322 ms; stdout empty; error 203 |
| `C:\Windows\System32\wsl.exe --list --verbose` | Exit 0; Ubuntu / Stopped / 2; read-only listing, no distro execution |

Exact compatibility argv, after the absolute pinned executable:

```text
-c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- C:\Windows\System32\cmd.exe /d /c echo MXC_OK
```

Cwd: fixture `project-a`. Start: `2026-10-29T08:38:57.949Z` (15:38:57 WIB). Timeout: 10,000 ms, output bound 65,536 bytes; deadline was not reached. Trusted system cmd.exe was used only for the fixed documented `echo MXC_OK`, with `/d` disabling AutoRun. No untrusted shell payload, model prompt, app-server, exec, thread, turn, OAuth or SDK operation was supplied.

Key stderr:

```text
MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).
```

CLI startup also warned that it refused to create PATH helper aliases under temporary CODEX_HOME. That warning appeared on version/help/compatibility startup; it is recorded separately from the final MXC failure. We did not relocate CODEX_HOME outside the approved temp boundary or enable helpers by changing security settings. `version.json` records stdout/exit; its stderr warning was observed in the tool transcript rather than captured in that JSON. Help/compatibility JSON contain captured stderr.

The Node orchestration command itself exited 0 after recording the result; **sandbox child exit was 1**. Do not interpret the wrapper exit as compatibility PASS. No `MXC_OK`, successful sandbox process identity or effective policy dump was observed. No automatic second sandbox launch or weaker fallback occurred.

## 7. Failure interpretation

The native launcher reported an environment-option error category. It did not identify which variable, API precondition or runtime component was responsible. The six-key allowlist intentionally omits many usual Windows environment variables; that may contribute, but it was not diagnosed. Temporary helper-alias refusal is another observed startup constraint, not a proven causal explanation.

Therefore this result establishes only **failed startup under the exact recorded environment/profile**. It does not prove absent MXC OS capability, general Windows incompatibility, a denied filesystem read, a paid/authentication restriction or a required administrator setup. No escalation/setup or trial-and-error env expansion was attempted to manufacture success. Failed candidate testing stopped as instructed.

## 8. Direct filesystem test results

| ID | Required direct sandbox IO | Result / evidence |
|---|---|---|
| S01 | Allowed A read | NOT RUN / NOT VERIFIED — no started sandbox |
| S02 | Allowed A output write | NOT RUN / NOT VERIFIED |
| S03 | B direct read denied | NOT RUN / NOT VERIFIED |
| S04 | B direct write denied | NOT RUN / NOT VERIFIED |
| S05 | Fake private DB read denied | NOT RUN / NOT VERIFIED |
| S06 | Fake private state write denied | NOT RUN / NOT VERIFIED |
| S07 | Fake credential direct read denied | NOT RUN / NOT VERIFIED |
| S08 | Fake credential overwrite denied | NOT RUN / NOT VERIFIED |
| S09 | Fixture alias/traversal enforcement | NOT RUN / NOT VERIFIED |
| S10 | Fixture-owned junction/symlink escape | NOT RUN / NOT VERIFIED; no links created for S |

Neither `containment-probe.mjs` nor `containment.test.ts` was created: a fixed IO probe/test was unnecessary once the prerequisite compatibility launch failed. No placeholder PASS/skip is added to Vitest. Existing unrestricted fake-canary regression remains HOST_VERIFIED evidence of a host-vs-OS limitation, **not** S03–S10 OS proof.

## 9. Effective permission profile

`:workspace` was explicitly requested only for documented compatibility startup. No `sandbox_mode`, `sandbox_workspace_write`, `--sandbox` or full-access setting was mixed into the synthetic config. Actual resolved/effective permission enforcement was **NOT VERIFIED** because startup failed. The requested string is not an effective-policy attestation.

Built-in workspace access does not establish denied reads outside A. A later successful compatibility probe would still require a documented custom minimal-read/specific-write profile, actual effective-policy evidence, positive IO controls, baseline host access and direct denied IO. No custom policy was deployed or global config edited here. Permission-profile compatibility with managed requirements remains a later test gate. [Permission-profile guidance](https://learn.chatgpt.com/docs/permissions).

## 10. Child process and cleanup observations

No cooperative child test or persistent sandboxed Node process was started. Candidate launcher PID 29852 had exited with status 1; process/listener inspections found no task-owned compatibility/probe/backend/dev processes left. This is bounded failed-launch accounting, not whole hostile-tree termination proof.

S classification: cooperative child inheritance **NOT VERIFIED**; **HOSTILE_CHILD_NOT_VERIFIED**. The existing host suite still verifies fixed cooperative dummy lifecycle separately. No hostile/detached process, uncontrolled background server, process-name-wide kill or stale PID termination was used.

## 11. Network and timing limitations

No S network endpoint/listener was created; no provider/LAN/external network test was attempted. Effective proxy, direct socket denial, DNS, child network inheritance and loopback behavior remain **NETWORK CONTAINMENT: NOT VERIFIED / POLICY DEPENDENT**. Documentation notes MXC loopback allowances under some policies, so hypothetical loopback success would require policy-specific interpretation, not blanket sandbox failure. [Native network caveats](https://learn.chatgpt.com/docs/windows/windows-sandbox).

Deny-read glob process-start snapshots, newly created private files, long-lived processes, reparse replacement and TOCTOU were reviewed, not tested. Future evidence must cover preexisting and newly created denied files and scoped parent subtrees; one static canary is insufficient. Prefer actual minimal readable roots, deny protected subtrees and verify new-file behavior instead of relying only on secret-name globs. Restarting a process only to refresh a deny snapshot must not blindly redispatch an uncertain task. [Permissions timing/enforcement](https://learn.chatgpt.com/docs/permissions).

## 12. Regression validation

Reviewed existing commands only; sequential execution, no test/config changes or installs:

| Exact command | Result | Time |
|---|---|---|
| `npm run typecheck` | Exit 0 / PASS | 2.17 s shell |
| `npm test` | Exit 0 / **300 PASS, 1 SKIPPED**, 22 files | 15:40:39; 11.05 s |
| `npx --no-install vitest run tests/integration/runtime-security` | Exit 0 / **60 PASS**, 6 files | 15:41:22; 10.34 s |
| Containment-focused suite | NOT RUN; optional file not created | Sandbox startup prerequisite failed |
| Browser E2E / build | NOT RUN | Existing accepted artifacts would be overwritten; unnecessary for this task |

60 includes all 11 R01 concurrency regressions. `npm test` still excludes runtime-security through explicit path filters; focused command was actually run. Final unique host cases: 360 PASS + 1 SKIPPED. Existing Windows ACL test at `tests/integration/workspace/paths.test.ts:97` remains NOT VERIFIED. No historical browser result is represented as executed now.

## 13. Findings

| ID / severity | Finding / evidence | Impact / next action |
|---|---|---|
| S-F01 / P2 validation blocker | Explicit MXC CreateProcessInSandbox failure 203; no MXC_OK | Startup/effective policy/direct IO evidence incomplete. Diagnose exact no-secret startup requirements before another authorized same-mode probe |
| S-F02 / P2 evidence limit | Minimal environment and temp helper-alias warning may influence launch; cause not proved | Do not blame OS edition or claim MXC UNSUPPORTED. Preserve exact env/config/argv and raw failure |
| S-F03 / P1 worker gate | Host-only policy still does not establish independent process isolation | Real worker stays BLOCKED until direct denied-read/write/private-state proof |
| S-F04 / P1 worker gate | No actual child/network/new-file boundary evidence | Do not promote old cooperative host tests or static documentation into OS_VERIFIED |
| S-F05 / P2 alternative gap | WSL2 Ubuntu installed but host mount/interop/credential boundary unknown | No fallback into existing user distro or installation; need separately scoped design/verification |

No new critical host regression or R01 recurrence was observed. Failure of the compatibility probe was retained as an actual failure, not converted into a skipped success.

## 14. Artifacts, cleanup and change safety

Only two authorized reports added in AI-Office; optional probe/test paths remain absent. Final SHA-256 comparison: **102/102 existing AI-Office files unchanged**, including all application/security modules, R1 source/tests, contracts, DB schema, package/lock/config, prior reports/build artifacts and both screenshots. Final inventory outside node_modules: **104 files**.

Accepted screenshots remain:

- `shell-ready.png`: `B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2`.
- `shell-mobile.png`: `C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640`.

The new S fixture is **intentionally retained as failed compatibility evidence**, not reported as deleted. Six files are listed in section 5; manifest/help/version/compatibility/WSL results and synthetic config contain no real tokens. No recursive deletion was attempted on it. Successful existing host-regression fixtures were cleaned by their established owned-root helpers.

Historical roots `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-QHnCi9` and `...\ai-office-m0202-TLkI1Y`: each **22/22 hashes unchanged**, matching prior verified inventories and current pre/post checks. They were never reopened as a journal writer or deleted. Earlier cleanup rejection remains respected; no bypass attempted. Existing rollback snapshots also remain.

Hermes3D: **647/647 tracked hashes unchanged**, HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`; pre-existing ` M package-lock.json` preserved. No Visual Lab write; external assets not checksum-audited. No Git init, account/group/ACL/firewall/Defender/UAC/feature/registry-security change, reboot, install, valuable-project write or real credential-store read by our tools. No provider authentication/inference or paid fallback operation invoked. This is action/file evidence, not an exhaustive forensic audit of every OS syscall/handle.

## 15. Overall decision and next bounded stage

**CONDITIONAL — CONTAINMENT EVIDENCE INCOMPLETE.** A candidate and documented command exist, but this exact native launch failed. Safe OS containment was not established. Do not label the error as definitive capability absence or promote host tests into OS proof.

One minimal follow-up proposal: **M02-02S1 — Safe MXC Launch Diagnostics**. Scope: review pinned 0.162.1 launcher/official startup requirements and error 203 without credentials; identify required non-secret Windows environment variables and temporary helper/profile constraints; propose one explicitly approved same-MXC, sandbox-only retry only after its expected effects are understood. Keep isolated ephemeral auth storage, exact disposable cwd, no global config/security changes, no install/elevation/legacy/full-access fallback. If evidence demands broader setup, stop before it and submit that separate scope. No such retry or diagnostic mechanism is executed automatically now.

Before real worker activation remain mandatory: actual app-server compatibility/permission mapping; trusted process and credential boundary; subscription eligibility/model authorization and included-only billing hard stop; actual approvals/cancellation; durable authoritative attempt journal/cross-process leases; uncertain outcome reconciliation/dedup; real audit trail/A-B isolation; explicit Owner authorization. S compatibility, even if it later succeeds, does not complete those gates.

**M02-02S VALIDATION CONDITIONAL — CONTAINMENT EVIDENCE INCOMPLETE — REAL CODEX WORKER BLOCKED.**
