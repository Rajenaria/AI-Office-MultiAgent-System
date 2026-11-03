# M02-02S5 — Containment Gate Matrix

Tanggal: 29 Oktober 2026, Asia/Jakarta. Primary evidence: [Direct OS Containment Report](M02-02S5_DIRECT_OS_CONTAINMENT_REPORT.md). `<S5_ROOT>/evidence/` berisi bounded local receipts; exact root ada pada report section 21. **HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 1. S5-01 through S5-27

**Decision: CONDITIONAL — POLICY OR EVIDENCE GAP.** One strict-profile invocation reached Node loader, native exit `1`, `EPERM`/`-4048`/`lstat C:\`, no stdout/probe receipt. Host baseline 12/12 succeeded; sandbox F01–F12 executed **0**. No retry or policy weakening.

| Gate | Requirement | Status | Evidence and precise boundary |
|---|---|---|---|
| S5-01 | Official isolated 0.164.0 candidate | HOST_VERIFIED | Retained official S4 bundle, 45/45 candidate hashes unchanged; S5 version `codex-cli 0.164.0` exit 0, main Authenticode Valid OpenAI OpCo, LLC. Main SHA-256 `6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36`. |
| S5-02 | Active Codex preserved | HOST_VERIFIED | 50/50 installed global package files unchanged, metadata 0.162.1, old native digest retained; VS Code PID 21476 untouched; no PATH/global update. |
| S5-03 | Disposable fixture identity | HOST_VERIFIED | One fresh canonical UUID root; current-user owner; seven synthetic files with paths/sizes/hashes/dev/inode/UID/nlink; only intentional A→B junction. |
| S5-04 | Effective custom profile | NOT VERIFIED | Named strict profile source/syntax/CLI selection reviewed; managed file/registry fallback sources absent; native command reached Node without parse/fallback diagnostic. No full effective-policy dump or functioning direct probe. |
| S5-05 | Temp grants adequately restricted | NOT VERIFIED | Config root deny, tmpdir/slash_tmp deny, TEMP/TMP only staging/temp sibling, A narrow write, exact sibling denies. Source supports intent; runtime A/B behavior untested. |
| S5-06 | Host negative-test baseline | HOST_VERIFIED | `host-baseline.json`, PID 16236, exit 0, 12/12 ALLOW observed, read hashes match. Designated write targets accessible under ordinary account. |
| S5-07 | A allowed read | NOT RUN | F01 sandbox probe entry never reached. Host success is not OS permission evidence. |
| S5-08 | A allowed write | NOT RUN | F02 never reached; sandbox-created.txt absent. Host-created.txt is controlled baseline output only. |
| S5-09 | B direct read denied | NOT RUN | F03 never reached; no target-specific sandbox error. |
| S5-10 | B direct write denied | NOT RUN | F04 never reached. Unchanged post-baseline target alone is insufficient. |
| S5-11 | Fake private state read/write denied | NOT RUN | F05/F06 never reached; fake data host-accessible and retained unchanged after attempt. |
| S5-12 | Fake credentials read/write denied | NOT RUN | F07/F08 never reached. No real credential probe/copy. |
| S5-13 | Absolute/traversal bypass denied | NOT RUN | F09/F10/F11 host controls succeeded; sandbox operations never reached. |
| S5-14 | Junction/symlink bypass tested | NOT RUN | F12 host read succeeded through owned junction; sandbox deny not exercised. No privileged symlink setup. |
| S5-15 | Cooperative child confinement | NOT RUN | Core not accepted; optional second launch blocked by harness. No child spawned; hostile containment NOT VERIFIED. |
| S5-16 | Network behavior classified | NOT VERIFIED | Config network=false and pinned translation reviewed; no runtime network test/listener/external endpoint. |
| S5-17 | New-file timing classified | NOT VERIFIED | Policy uses exact directories/root deny, no globs; timing test NOT RUN. No future-file guarantee inferred. |
| S5-18 | Owned process cleanup | HOST_VERIFIED | Native PID 6260 and host PID 16236 absent; no S5/candidate owned process remained; active VS Code kept. No kills. Target entry PID unavailable; bounded accounting, not hostile-tree proof. |
| S5-19 | No global Windows security changes | HOST_VERIFIED | Read-only OS/registry/ACL metadata; no ACL mutation, elevation, firewall/Defender/UAC/features/install/WSL actions. Task-action scope. |
| S5-20 | No provider login/inference | HOST_VERIFIED | Fresh home, file+CLI ephemeral store, explicit nine-key input without provider secrets; only version/help/baseline/sandbox command. No model/auth/app-server path invoked. Not syscall attestation. |
| S5-21 | No paid API/credit fallback | HOST_VERIFIED | No provider/model/account call or paid API activation by task; no fallback. This is absence of task usage, not proof of billing enforcement. |
| S5-22 | No real worker | HOST_VERIFIED | Only fixed synthetic probe; no coding task, runtime thread/turn, production lease or orchestrator. |
| S5-23 | Existing AI Office integrity | HOST_VERIFIED | 112/112 baseline files unchanged; final 115 files, only authorized probe and two S5 reports added. Existing code/tests/schema/package/screenshots/prior reports unchanged. |
| S5-24 | Codex app-server readiness | NOT RUN | No server/protocol/real approval/cancel/skill integration test. |
| S5-25 | Account eligibility/included-only billing | NOT VERIFIED | No account inspection/login/entitlement query; eligibility UNKNOWN, included-only cap NOT VERIFIED. |
| S5-26 | Production durable lease/recovery | NOT VERIFIED | Historical synthetic journal/atomic issuance is not production lease/crash recovery/cross-process dedup evidence. |
| S5-27 | Worker activation gate | BLOCKED | Required direct OS/runtime/account/production lifecycle gates unresolved; S5 explicitly prohibits worker/M02-03. |

## 2. Exact positive evidence

Version PID 7068 exit 0 at 12:18:45.577Z; sandbox-help PID 14548 exit 0 at 12:18:45.673Z. Baseline at 12:18:55.019Z, 114 ms, 12/12 operations success. Root/file identity verified and no real data used. Package/source/fixture checksum results are in report section 22 and local protected baselines/change-safety receipts. These earn **HOST_VERIFIED only**.

No gate earns **OS_VERIFIED** or **CODEX_SANDBOX_VERIFIED** for a direct access boundary. One official sandbox invocation and a Node root-metadata denial do not establish A/B or credential enforcement.

## 3. Failed and inconclusive tests

`core.json`: native PID 6260, start 2026-10-29T12:19:08.614Z, exit 1, duration 428 ms, stdout empty, Node EPERM errno -4048 at lstat drive root, receipt null, `accepted: false`. Operator recorder exit 0 means evidence persisted, not containment PASS. `stopped.json` blocks further launch.

This is **INCONCLUSIVE / configuration-test failure**, corresponding to acceptance B. No forbidden direct access succeeded, so there is no observed escape finding; absence of executed negatives also prevents acceptance. F01–F12 are NOT RUN in sandbox, not FAILED assertions and not secure denials. Child/network/timing intentionally skipped after stop; no weaker retry.

## 4. Effective permission-profile status

Profile `ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8`: root deny, minimal read, workspace A write, exact B/private/fake-credential/home/evidence denies, temp deny, network=false. Explicit `mxc`, `--include-managed-config`, named profile retained. No legacy sandbox settings or additional workspace roots. Config/probe/manifest hashes fixed; policy not modified after failure.

Read-only managed preflight found no system config/requirements, RequirementsPath registry redirect or synthetic legacy managed file. Source selection reviewed; no active user config/auth copied. No complete effective merged-policy inspection claimed. Native parse/loader arrival is narrower evidence than runtime enforcement.

## 5. OS filesystem enforcement

**NOT VERIFIED.** Direct Node fs probe does not use host path-policy checks, but it never reached its I/O matrix. Host all-access control and unchanged canaries do not substitute for sandbox attempted operations. `EPERM lstat C:\` is a loader error, not F03/F05/F07 deny evidence.

## 6. Windows temporary directory caveats

S5 overrides inherited temp grants; filtered TEMP/TMP map only staging/temp, not all fixture siblings. Narrow A grant is separate from that denied temporary directory. `:minimal` platform-readable directories do not include owned Temp siblings according to pinned source; actual enforcement and A usability remain unverified. No whole-Temp/user/drive grant was added to make Node run.

## 7. Child-process inheritance

**NOT RUN.** Optional cooperative launch requires accepted core and unchanged canaries; neither a child receipt nor second issuance exists. Cooperative/hostile confinement NOT VERIFIED. All known owned foreground processes exited; no unrelated process terminated.

## 8. Network-policy evidence

Config/source only: networking disabled. Runtime network containment **NOT VERIFIED**. No test-owned listener, loopback/external probe, public/provider/LAN test endpoint or firewall change. Official-source research HTTP GETs are not sandbox network tests. MXC loopback/proxy caveats must be evaluated in a future authorized test.

## 9. Runtime credential isolation limitations

Only unmistakably fake data, never real auth caches/credentials/.sandbox-secrets. Explicit native env has nine reviewed keys; S5 opt-in/provider keys are not forwarded. No account context supplied, synthetic ephemeral home. This protects experimental inputs by construction; it does not verify OS fake credential denies or trusted credential separation from future untrusted descendants.

## 10. Codex app-server readiness

**NOT RUN / NOT VERIFIED.** No app-server start, stdio protocol, adapter, task, thread or turn. Documentation/source review alone cannot pass this gate.

## 11. Actual approval/cancellation readiness

**NOT VERIFIED.** Historical host approval/supervisor tests do not prove actual Codex approval, cancellation, teardown, race or recovery semantics. S5 stopped before functional probe; no new runtime lifecycle capability added.

## 12. Production attempt-journal readiness

**NOT VERIFIED.** S5 exclusive wx issuance and sticky stop provide bounded test replay prevention, not production durable lease/recovery guarantees. No production authority/state mutation. Historical 11 atomic regressions remain part of historical 60 host tests, not new production acceptance.

## 13. Account subscription eligibility

**UNKNOWN.** No login, real credential read, subscription/entitlement/model-availability query. Existing CLI access or startup does not establish future AI Office account eligibility.

## 14. Included-only billing enforcement

**NOT VERIFIED.** No inference/paid API/credits used by this task. Included-only cap and purchased-credit exclusion remain unresolved runtime/account gates; no worker activation allowed.

## 15. Skill runtime enforcement

**NOT VERIFIED.** No real runtime skill discovery/permission enforcement. Existing metadata and host tests unchanged; no skill integration or unrestricted script capability introduced.

## 16. Real worker authorization

**BLOCKED.** S5 does not authorize any AI coding worker, model inference, M02-03 or production lease. No combination of HOST_VERIFIED rows overrides unexecuted OS/runtime/account gates.

## 17. Recommended next technical gate

**M02-02S5R — Strict-Profile Probe Bootstrap Compatibility**, one bounded follow-up. Review Node main-path canonicalization and a fixed non-AI bootstrap compatible with the **same strict policy**, without broadening filesystem access. Then propose exact argv and at most one new authorized launch after preflight. Do not rerun core/child or use remaining S5 budget after stop. If no safe approach exists, stay blocked and prepare a redacted upstream compatibility question.

## 18. Owner decisions required

S5 completed as a conditional validation with evidence preserved. A separate S5R task must authorize exact probe/argv/policy identity, disposable paths, process/attempt limits and retention. No automatic support submission, package upgrade, security change, app-server, inference, paid API/credit fallback or worker. S5R and M02-03 **not started**.

**M02-02S5 CONDITIONAL — OS CONTAINMENT EVIDENCE INCOMPLETE — REAL WORKER BLOCKED.**
