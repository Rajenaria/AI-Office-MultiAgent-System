# M02-02S5R2 — OS Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Evidence: [Inline Containment Report](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md) dan owned `<S5R2_ROOT>/evidence/` receipts. **HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 1. R2-01 through R2-35

**ACCEPTED — BOUNDED DIRECT OS FILESYSTEM CONTAINMENT — TESTED CONFIGURATION ONLY.** Actual single MXC batch: native exit 0, 1024 ms, bootstrap/fs-ready markers, 12 attempted operations, two ALLOW and ten EPERM denies. No second launch.

| Gate | Requirement | Status | Exact evidence / boundary |
|---|---|---|---|
| R2-01 | Official 0.164.0 candidate | HOST_VERIFIED | S4 retained bundle, matching main SHA-256/signature, 61 S4 files/45 candidate files unchanged; no acquisition/update. |
| R2-02 | Active Codex preserved | HOST_VERIFIED | 50/50 global package files unchanged, metadata 0.162.1; active VS Code 22256 untouched. |
| R2-03 | Node verified | HOST_VERIFIED | Existing 24.21.0 FileVersion, SHA-256 matches S5R; no runtime installation. |
| R2-04 | Fresh fixture | HOST_VERIFIED | Unique owned canonical root; four synthetic read inputs, absent sandbox targets, fresh inspected A→B junction only. |
| R2-05 | Strict semantics preserved | HOST_VERIFIED | Only profile name/fresh-root substitution; normalized config identical. New hash `6149E00A832BEA0AD6701A789C137DEE11BF0E5736D3678981CACF213EC68D99`; unchanged post-run. No full merged-policy dump claimed. |
| R2-06 | No broad Temp/drive grant | HOST_VERIFIED | Root/temp deny retained, no parent grant, minimal runtime exception reviewed. Exact sibling denials observed; not every Temp path probed. |
| R2-07 | A-only workspace roots | HOST_VERIFIED | Actual cwd fresh A, no profile-defined extra roots or inherited session env; pinned config/cwd source reviewed, actual A permit vs sibling deny. |
| R2-08 | Managed configuration | HOST_VERIFIED | --include-managed-config preserved; current system/registry/new-home managed preflight safe; no suppression/fallback. |
| R2-09 | Network disabled in profile | HOST_VERIFIED | Config network.enabled=false; network enforcement not exercised. |
| R2-10 | Host baseline | HOST_VERIFIED | 12/12 success, matching canary reads/path variants and distinct baseline output writes; exact sandbox targets absent. |
| R2-11 | Fixed source reviewed | VERIFIED | 5742-byte fixed source SHA-256 `C4BD06974DF16E0F0718626E26A46D9D4243B1045EFFB2A41674B4B40636FD25`; parse-only syntax validation and manual approval before spawn. |
| R2-12 | One-launch ceiling | VERIFIED | Immutable max1 budget, exclusive mxc-issued before spawn, explicit opt-in, actual one invocation/no retry. |
| R2-13 | Inline bootstrap | MXC_BOOTSTRAP_VERIFIED | Marker S5R2_BOOTSTRAP_OK, Node 23224; native launcher 23604 exit 0, empty stderr, 1024 ms. |
| R2-14 | node:fs loaded | VERIFIED | S5R2_FS_READY followed by actual direct fs events; only required module node:fs. |
| R2-15 | A read | OS_VERIFIED | F01 success/contentMatch=true against existing synthetic input. |
| R2-16 | A write | OS_VERIFIED | F02 exclusive create/write success; post A output 67 bytes, expected/actual marker hash equal. |
| R2-17 | B read denied | OS_VERIFIED | F03 relative direct read failed EPERM/-4048/open after successful host control. |
| R2-18 | B write denied | OS_VERIFIED | F04 exclusive create failed EPERM/-4048/open; target absent before/after. Scope: new-file create. |
| R2-19 | Fake private state read/write denied | OS_VERIFIED | F05 read and F06 create both EPERM/-4048/open; source canary unchanged/output absent. Synthetic marker, not real DB. |
| R2-20 | Fake credentials read/write denied | OS_VERIFIED | F07 read and F08 create both EPERM/-4048/open; source unchanged/output absent. No real credential tested. |
| R2-21 | Absolute/traversal deny | OS_VERIFIED | F09 canonical B read and F10 controlled traversal read both EPERM/-4048/open; host controls succeeded. |
| R2-22 | Optional path/junction | OS_VERIFIED | F11 extended namespace read and F12 fresh owned junction read denied EPERM/-4048/open. Limited to these read forms, not every reparse operation. |
| R2-23 | Canaries unchanged | HOST_VERIFIED | 4/4 input hashes unchanged; three forbidden outputs absent; A output marker hash verified. |
| R2-24 | Process accounting | HOST_VERIFIED | Launcher23604/Node23224/reportedPPID5068 absent; no matching owned process/listener; VS Code22256 present; no kills. Not hostile-tree proof. |
| R2-25 | No Windows security changes | HOST_VERIFIED | Metadata reads only, no ACL/registry/firewall/Defender/UAC/features/elevation/WSL changes. |
| R2-26 | No auth/inference | HOST_VERIFIED | Synthetic ephemeral home, nine-key input, fixed direct fs only; no login/provider/model/app-server/exec/worker command. Task-action scope, not syscall attestation. |
| R2-27 | No paid API/credits | HOST_VERIFIED | No provider inference/account/paid API/credit activation; does not establish provider billing controls. |
| R2-28 | Existing source integrity | HOST_VERIFIED | 117/117 AI Office files unchanged, final119 only two reports; old test probe/schema/package/screenshots preserved. |
| R2-29 | Network/child confinement | NOT VERIFIED | Tests NOT RUN; no listeners/child experiment authorized. Simple process exit is not confinement certification. |
| R2-30 | New-file timing | NOT VERIFIED | NOT RUN; no future-file/snapshot/race guarantee from existing-canary tests. |
| R2-31 | App-server readiness | NOT VERIFIED | NOT RUN; no adapter/protocol or real runtime enforcement test. |
| R2-32 | Production lease/recovery | NOT VERIFIED | No production authority, durable lease/crash recovery/cross-process dedup/journal validation. |
| R2-33 | Subscription/model entitlement | NOT VERIFIED | Account-specific UNKNOWN; no login/account/model query. |
| R2-34 | Included-only billing hard cap | NOT VERIFIED | No billing enforcement/account cap evidence; paid API/credits remain prohibited. |
| R2-35 | Real worker activation | BLOCKED | Remaining OS-process/runtime/approval/recovery/skill/account gates unresolved; user explicitly prohibits worker/M02-03. |

## 2. Positive and negative filesystem evidence

Host baseline 12/12 succeeded. Sandbox F01/F02 succeeded; F03–F12 all attempted and denied with actual EPERM, errno -4048, syscall open. Summary planned=12/attempted=12, requiredComplete=true, unattempted empty. Native exit0 is supported by structured operations and post-state, not merely a harmless marker.

## 3. Exact tested profile

`ai-office-s5r2-750b18c5-47be-4d0c-bbf8-b7736e9ba4a1`: inherited workspace safeguards, root deny, minimal runtime read, fresh A-only workspace write, exact fresh B/private/fake-credential/home/evidence denies, tmpdir/slash_tmp deny, network=false. Explicit mxc and managed inclusion. Original/new config hashes and semantic path/name-only diff in primary report section6; full effective-policy dump absent, not fabricated.

## 4. Host baseline comparison

Direct host reads match recorded input hashes, including all tested path forms. Four host writes use host-baseline-output.txt; exact sandbox outputs remain absent before launch. Read canaries not overwritten. No ACL repair, backend policy checks or real data. Write-denial comparison is controlled same-parent accessibility using distinct absent names, not a claim that baseline created forbidden sandbox targets.

## 5. Sandbox error classifications

Actual permission errors on intended fs operations, combined with host controls and existing sources, support OS_VERIFIED for the listed exact properties. No ENOENT, EINVAL, unknown error, syntax/bootstrap/manifest failure was counted as deny. `open` is actual Node error metadata, not an invented kernel trace. Exclusive create denial does not independently prove overwrite/rename/delete restrictions.

## 6. Security failures

None observed: zero forbidden success/create, no weaker fallback, no policy repair. Fail-fast code would stop after first forbidden success or positive failure; neither occurred. Do not generalize absence of this batch's findings to arbitrary MXC policies or hostile workers.

## 7. Inconclusive and unexecuted operations

No F01–F12 operation was skipped or inconclusive in this run. Source-level static validation and native result are separate evidence. Network, children, hostile/detached processes, new-file timing and actual runtime/account gates remain unexecuted/unverified. Historical S5 F01–F12 remain NOT RUN in that milestone; current results belong only to S5R2.

## 8. Alternate path/junction limits

F11 extended namespace and F12 fresh A→B junction both had successful host controls and denied sandbox reads. Namespace normalization may share the ordinary absolute path route; no claim of independent parser coverage. Junction-write, symlink/hardlink races, other volumes and every alias form untested. Old S5 missing junction not modified; current fresh alias target stayed inside fixture and unchanged.

## 9. Network and process limits

Network policy configured OFF, but no connectivity/listener test. Probe creates no child process. Known launcher/Node/reported parent absent and no owned listener afterward supports bounded accounting only. No cooperative/hostile child inheritance, detached tree, PID reuse resilience or hard-crash cleanup verification.

## 10. New-file timing

Policy uses root/exact directory denies, not deny-read globs; no claim that this removes every runtime timing risk. No file-after-start test, long-running process, watcher or alias replacement test occurred. New output denial concerns explicitly attempted exclusive creations, not all future files or snapshots.

## 11. Credential/private-state caveats

Fake marker reads/creates denied as tested. Actual auth caches/keyrings, real SQLite state, provider tokens, environment/argv/log/IPC custody and trusted-process/untrusted-tool separation remain unverified. No real credential copied/read/probed. Minimal platform runtime readable areas are not automatically classified safe for every future secret.

## 12. Codex app-server prerequisites

Actual stdio protocol, adapter/version behavior, launch/cancel lifecycle and enforcement across real runtime tools remain NOT VERIFIED. No app-server started or integration code added. Filesystem results do not authorize M02-03.

## 13. Actual approval/cancellation prerequisites

Historical host-security approvals/supervisor tests are distinct from runtime approvals, interrupt/termination, races and reconciliation. S5R2 contains no actual Codex turn/cancel/approval interaction. These gates remain NOT VERIFIED.

## 14. Production durable lease/recovery

One-shot wx issuance protects this bounded test from replay; it is not a production worker lease, durable cross-process dedup or machine-crash recovery mechanism. No authoritative Project State or production journal modified. Historical 60 host regressions including 11 atomic cases are not new production acceptance evidence.

## 15. Account entitlement and billing

Subscription/model access UNKNOWN, included-only hard cap NOT VERIFIED. No login/account query, paid API, purchased credits or model inference. Absence of spend is not provider-enforced billing protection.

## 16. Runtime skill enforcement

No real runtime skill discovery/execution/permission test. Existing metadata/host policies remain unchanged. Runtime skills cannot be assumed restricted based on one fixed fs probe.

## 17. Worker activation

**BLOCKED.** Exact filesystem verification is accepted, but network/process/runtime/approval/recovery/skills/account/billing gates remain open. No real worker, model turn, production lease or orchestration started.

## 18. Recommended next technical task

One proposal: **M02-02S6 — Bounded Cooperative Child-Process Confinement Validation**. One fixed non-AI parent/one fixed cooperative child, synthetic allowed A and denied B/fake-credential operations, same strict semantics, bounded ownership/deadline verification, proposed one outer MXC launch. No detached/hostile/network/new-file timing scope. **Not started.**

## 19. Required Owner authorization

Next task must explicitly authorize exact parent/child code/argv, owned fixture/new path bindings, controlled baseline outputs, outer/child budget, timeout/termination ownership, evidence retention and stop criteria. S5R2 allowance **1/1 exhausted**. Do not run another command, begin S6/M02-03, start app-server/inference/worker, change Windows security or enable paid API/credits automatically.

**M02-02S5R2 COMPLETE — BOUNDED DIRECT MXC FILESYSTEM CONTAINMENT VERIFIED — REAL CODING WORKER STILL BLOCKED — AWAITING OWNER REVIEW.**
