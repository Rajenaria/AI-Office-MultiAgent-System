# M02-02S — OS Runtime Gate Matrix

Tanggal: 29 Oktober 2026. Evidence: [Windows Containment Report](M02-02S_WINDOWS_CONTAINMENT_REPORT.md).

**Decision: CONDITIONAL — CAPABILITY OR POLICY GAP. Real worker: BLOCKED.** One explicit MXC compatibility launch exited 1 with CreateProcessInSandbox error 203; no MXC_OK or direct contained IO result. This failure is not proof MXC is unsupported on the machine.

## 1. Status meanings

- `HOST_VERIFIED`: actual host metadata, source/assertion or action accounting within recorded scope; not independent OS restriction.
- `OS_VERIFIED`: direct independent OS enforcement for an exact tested operation/profile. **None awarded here.**
- `CODEX_SANDBOX_COMMAND_VERIFIED`: successful sandbox command startup. **Not awarded**; version/help exit 0 is insufficient.
- `CODEX_APP_SERVER_NOT_VERIFIED`: no adapter/handshake/thread/turn performed.
- `ACCOUNT_NOT_VERIFIED`: no account/entitlement/billing access performed.
- `NOT VERIFIED`: evidence absent/incomplete, including NOT RUN cases. `UNSUPPORTED` used only where evidence establishes platform incompatibility. `BLOCKED` means activation must not proceed.

## 2. W01–W20 acceptance results

| Gate | Requirement | Evidence / result | Limitation and blocking impact |
|---|---|---|---|
| W01 | Windows build/edition | **HOST_VERIFIED**: Windows 11 Home Single Language x64, 26300.9711/26H2; Node 24.21.0/npm 11.19.0 | Build/virtualization flags do not prove MXC support |
| W02 | Candidate identified | **HOST_VERIFIED** identification: explicit MXC, pinned native Codex 0.162.1; WSL2 Ubuntu installed/stopped | Candidate availability/enforcement not verified from package presence |
| W03 | Native sandbox starts without inference | **NOT VERIFIED**: actual attempt exit **1**, PID 29852, 1322 ms, stdout empty, error 203 | CODEX_SANDBOX_COMMAND_VERIFIED not awarded; no retry/fallback |
| W04 | Effective permission profile | **NOT VERIFIED**: `:workspace` requested with `--include-managed-config`; no successful effective profile evidence | Not an outside-workspace deny-read proof; custom profile not deployed |
| W05 | Allowed A direct read | **NOT VERIFIED / NOT RUN** | No contained probe started |
| W06 | Allowed A direct write | **NOT VERIFIED / NOT RUN** | Host fixture creation does not satisfy this gate |
| W07 | B direct read denied | **NOT VERIFIED / NOT RUN** | Existing host evaluator denial is not OS denial |
| W08 | B direct write denied | **NOT VERIFIED / NOT RUN** | No synthetic B direct write attempted in S |
| W09 | Fake private state protected | **NOT VERIFIED / NOT RUN** | Full private-state fixture deferred after launch failure |
| W10 | Fake credentials protected | **NOT VERIFIED / NOT RUN** | No contained canary IO; old unrestricted canary read remains limitation evidence |
| W11 | Alias/junction escape blocked | **NOT VERIFIED / NOT RUN** | No S reparse links created; prior host checks do not grant OS proof |
| W12 | Cooperative child scope | **NOT VERIFIED / NOT RUN** | COOPERATIVE_CHILD_VERIFIED not awarded for S; HOSTILE_CHILD_NOT_VERIFIED |
| W13 | Bounded process cleanup | **HOST_VERIFIED, limited**: failed launcher exited before 10 s deadline; no task-owned processes/listeners remained; existing host lifecycle tests PASS | No started sandbox child/tree, so no OS tree lifetime proof |
| W14 | Network policy behavior | **NOT VERIFIED / POLICY DEPENDENT** | No endpoint/socket/DNS/child-network test; documented loopback caveat only |
| W15 | Newly created denied files | **NOT VERIFIED**: snapshot/race limitation reviewed and future controls identified | No long-running process/new-file/reparse enforcement experiment |
| W16 | No unauthorized OS changes | **HOST_VERIFIED action scope**: only read-only metadata and sandbox-only helper command; temp files only | No ACL/group/firewall/feature/install/elevation commands; not whole-machine forensic certification |
| W17 | Existing host regressions | **HOST_VERIFIED**: typecheck PASS; 300 PASS/1 SKIPPED; 60 security PASS including 11 R01 tests | ACL skip NOT VERIFIED; focused suite still separate from npm test |
| W18 | No real worker/inference | **HOST_VERIFIED action scope**: version/help/fixed sandbox echo only; no app-server/exec/SDK/model/session/auth operation | CODEX_APP_SERVER_NOT_VERIFIED remains; no actual runtime enforcement claim |
| W19 | Account/billing restrictions | **ACCOUNT_NOT_VERIFIED**; eligibility/quota UNKNOWN, included-only cap NOT VERIFIED; no paid/key/credit fallback used | **BLOCKED** for worker until separate applicable official account/billing proof |
| W20 | Next gate identified | **HOST_VERIFIED** evidence-based proposal: S1 same-MXC launch diagnostics before direct IO/protocol/account stages | No M02-03 authorization or automatic progression |

No W05–W12 result is marked OS_VERIFIED. Failed launch is not a denied-read test. No skipped new test is counted as PASS; optional containment test/probe files were not created.

## 3. Host evidence vs OS evidence

| Evidence layer | Actual status |
|---|---|
| Immutable synthetic context/R01, scope/path checks, simulated approvals | HOST_VERIFIED in 60 existing security cases; source unchanged |
| Owned fixed dummy cancellation/cooperative descendants/journal recovery | Host fixture assertions PASS; no hostile or production runtime guarantee |
| Unrestricted fake-canary direct read | Existing regression PASS means same-user access is possible, not credential confinement |
| Explicit MXC command startup | Attempted and failed; NOT VERIFIED |
| Actual contained positive/negative file IO | NOT RUN / NOT VERIFIED |
| Native containment process-tree/network/new-file enforcement | NOT RUN / NOT VERIFIED |
| Actual app-server protocol/approval/interrupt/recovery | CODEX_APP_SERVER_NOT_VERIFIED / BLOCKED |
| Account eligibility/model/included-only usage | ACCOUNT_NOT_VERIFIED / BLOCKED |

## 4. Command and artifact evidence

Pinned binary SHA-256: `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`.

Compatibility argv:

```text
-c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- C:\Windows\System32\cmd.exe /d /c echo MXC_OK
```

Temporary cwd/profile/evidence root: `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s-nUSJvQ`. CODEX_HOME used only synthetic config with `cli_auth_credentials_store="ephemeral"`. Native invocation environment had only SystemRoot/WINDIR/PATH/TEMP/TMP/CODEX_HOME. Help/version succeeded; compatibility exit 1 was recorded separately from the successful Node result-recording wrapper. The minimal environment may influence error 203; exact cause remains unknown. No actual auth profile was inspected.

Six task-owned files retained for review: config plus manifest, version, sandbox-help, mxc-compatibility and wsl-list JSON. No actual canary/DB/user data in S fixture. No cleanup bypass. Both historical retained roots remain 22/22 hashes unchanged. All **102 initial AI-Office files** and **647 Hermes3D tracked hashes** remain unchanged; only the two allowed reports added.

## 5. Candidate alternatives and architecture

Preferred future architecture remains Owner → Policy Gateway → deterministic orchestration → verified runtime security boundary → official adapter → worker. AI Office remains personal-local and authoritative state stays outside worker access; no adapter/schema/durable lease change here.

| Candidate | Current evidence / disposition |
|---|---|
| Native MXC | Selected explicitly; observed launch failure in exact isolated environment. Diagnose without downgrade; not labeled generally UNSUPPORTED |
| Existing WSL2 Ubuntu | Installed version 2, stopped; host mounts/interop/profile separation NOT VERIFIED. Not started as fallback |
| Microsoft Windows Sandbox | **UNSUPPORTED on observed Home edition**, distinct from MXC; no feature/edition change attempted |
| Restricted identity/AppContainer/native lifetime helper | No verified provisioned test boundary; would need separately reviewed implementation/setup scope |
| VM/container | No mechanism installed/created/started or security assumptions accepted; optional future runtime boundary only |

Official bases: [Codex Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [permissions](https://learn.chatgpt.com/docs/permissions), [Windows Sandbox requirements](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/), [WSL FAQ](https://learn.microsoft.com/en-us/windows/wsl/faq). Documentation is not local enforcement proof.

## 6. Remaining activation gates

Real worker remains **BLOCKED** until independent evidence covers:

1. Successful startup of exact containment mechanism/effective minimal profile; direct A positive/B-private-canary negative IO, aliases/reparse and newly created files.
2. Trusted runtime process/credential separation, child lifetime and policy-specific network behavior.
3. Official app-server compatibility and actual permission/approval/interrupt mapping, with sanitized real-event audit trail.
4. Authoritative production attempt journal, cross-process lease/ownership, crash reconciliation and no blind duplicate dispatch.
5. Applicable subscription/account/model eligibility and included-only billing hard stop; no API-key/paid-credit fallback.
6. Explicit Owner authorization for the exact bounded runtime task after mandatory gates. Skills remain OFF; enforcement proof required before any enablement.

## 7. Exact next bounded proposal and Owner gate

**Proposed M02-02S1 — Safe MXC Launch Diagnostics**, not executed: review exact installed 0.162.1 startup requirements/error 203 and temporary helper/profile constraint without reading credentials; identify required non-secret environment inputs; review one same-MXC sandbox-only compatibility retry in a fresh isolated fixture. No global profile/security mutation, no legacy/full-access fallback, no installation/elevation/account/provider session. If remedy requires those actions, stop and submit a separate setup scope first.

Owner review should accept/request correction of this incomplete evidence and decide that minimal diagnostic scope. A later S1 launch success would still require direct IO/effective-policy tests before OS acceptance; it does not approve M02-03. Retained evidence/old fixtures do not need to be deleted to continue review. Any later cleanup must honor exact ownership and effective policy.

**M02-02S VALIDATION CONDITIONAL — CONTAINMENT EVIDENCE INCOMPLETE — REAL CODEX WORKER BLOCKED.**
