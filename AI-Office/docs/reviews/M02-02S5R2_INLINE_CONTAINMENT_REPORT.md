# M02-02S5R2 — Inline Direct OS Filesystem Containment Report

Tanggal review: **30 Oktober 2026, Asia/Jakarta**. Actual timestamps dalam UTC; `2026-10-29T22:51Z` adalah **30 Oktober 2026 05:51 WIB**. Companion: [OS Gate Matrix](M02-02S5R2_OS_GATE_MATRIX.md).

## 1. Executive summary

**ACCEPTED — BOUNDED DIRECT OS FILESYSTEM CONTAINMENT — TESTED CONFIGURATION ONLY.** Satu explicit MXC invocation memakai retained official Codex 0.164.0, Node 24.21.0, fresh synthetic fixture dan strict S5-equivalent profile. Inline bootstrap dan `node:fs` berhasil. Seluruh **12 operasi** dieksekusi: **2 approved A operations berhasil**, **10 forbidden operations ditolak** dengan actual `EPERM`, errno `-4048`, syscall `open`. Required F01–F10 serta optional F11–F12 memiliki structured attempted results.

Native launcher PID **23604**, Node probe PID **23224**, native exit **0**, stderr kosong, **1024 ms**. Host baseline sebelumnya **12/12 berhasil**, memakai output filenames berbeda; empat sandbox output targets absent tepat sebelum launch. Read canaries **4/4 unchanged**, A output terverifikasi 67 bytes dan hash sesuai marker yang direncanakan; forbidden output targets **3/3 tetap absent**. Fresh junction tetap mengarah ke owned B. Tidak ada retry/profile repair/fallback.

Klasifikasi: **BOUNDED DIRECT OS FILESYSTEM CONTAINMENT VERIFIED — TESTED CONFIGURATION**. Ini direct OS evidence untuk operasi dan policy yang diuji, bukan comprehensive sandbox certification. Network, child inheritance/hostile descendants, new-file timing, real credentials, app-server dan production worker readiness tetap **NOT VERIFIED**. **REAL CODING WORKER BLOCKED.**

## 2. Previous S5/S5R findings

[S5](M02-02S5_DIRECT_OS_CONTAINMENT_REPORT.md) memiliki successful normal-user 12/12 baseline, tetapi file-entry Node gagal sebelum intended I/O dengan `EPERM lstat C:\`. F01–F12 pada S5 tetap historical NOT RUN; tidak dipromosikan ke PASS secara retrospektif.

[S5R](M02-02S5R_BOOTSTRAP_COMPATIBILITY_REPORT.md) membuktikan satu fixed `node --eval` stdout marker berhasil dalam strict setup. Itu belum memuat `node:fs` atau direct target access. S5R juga menemukan old S5 junction sudah absent; cause UNKNOWN. S5R2 tidak merepair/recreate old alias dan tidak memakai old fixture untuk I/O. Fresh owned topology dibuat hanya di new S5R2 root.

Required prior host harness/gate, atomic issuance, initial S/S1 diagnostics, S3 compatibility, S4 startup dan S5/S5R reports menjadi context; existing probe source ditinjau read-only. Tidak mengulang architecture audit atau mengubah source/earlier reports.

## 3. Candidate and Node identity

Actual OS tetap Microsoft Windows 11 Home Single Language, 64-bit, `10.0.26300`, build **26300.9711**, `26H2`. Existing Node FileVersion **24.21.0** dan executable `C:\Program Files\nodejs\node.exe` cocok dengan S5R hash. Official [Codex release rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0) candidate tetap full Windows x64 CLI bundle yang diperoleh pada S4; tidak ada download/install/upgrade.

| Artifact | Actual SHA-256 / identity |
|---|---|
| Codex candidate main | `6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36`; Authenticode Valid, OpenAI OpCo, LLC. |
| Existing Node | `BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32`; 24.21.0. |
| Active global Codex | Package metadata 0.162.1; distinct installation, 50/50 hashes unchanged. |

Preflight compared S4 60 recorded inventory entries, S5 35, S5R 17 (each inventory excludes itself): no mismatch. Full task pre/post snapshots include **61/36/18 files** respectively, and all 45 candidate files remain unchanged. Metadata/hash identity reused successful version evidence; no extra version/help/sandbox compatibility command was needed.

## 4. S5R2 fixture layout

One new canonical OS-temp immediate child, owned by current user, unique ID **750b18c5-47be-4d0c-bbf8-b7736e9ba4a1**. Node reported **20974075904 free bytes** before fixture creation; bounded fixture/one-launch resources sufficient. No valuable workspace, real database or actual credential copied.

```text
<S5R2_ROOT>/
  project-a/input/canary.txt
  project-a/output/host-baseline-output.txt
  project-a/output/sandbox-output.txt       [created by successful F02]
  project-a/junction-b/ -> ../project-b/    [fresh owned junction]
  project-b/input/canary.txt
  project-b/output/host-baseline-output.txt
  app-private/fake-project.db
  app-private/output/host-baseline-output.txt
  fake-credentials/dummy-canary.txt
  fake-credentials/output/host-baseline-output.txt
  test-home/config.toml
  temp/
  config/
  evidence/
```

All four inputs contain unmistakably synthetic markers. Fake DB is plain marker text, not SQLite data; fake credential is not a real/realistic token. B/private/credential `output/sandbox-output.txt` are distinct predesignated targets that remained absent. Manifest records canonical roots/targets, hashes/sizes/dev/inode/nlink, output absence and controlled path variants. No fixture path escapes root. Only intentional reparse is fresh A→B junction, created without elevation.

## 5. Normal-user baseline

One explicit host baseline completed **12/12**: eight reads (A/B/private/fake credential and planned path variants) plus four controlled writes. All read hashes matched recorded canaries. Writes created **host-baseline-output.txt**, never the exact sandbox output targets. Baseline source uses direct Node fs APIs outside MXC, not HostPathPolicy.

`host-baseline.json` records each operation ID/action/path class/success/content match. Four read canaries were not overwritten. All four sandbox output targets were still absent at baseline completion and checked again immediately before native spawn. Root/input-file Windows owner checks matched current user; no ACL change. If baseline or canonical safety had failed, no MXC launch was permitted.

Ordinary permissions therefore allowed the resources/parent output directories; the subsequent direct permission denials are not attributed merely to pre-existing Windows ACL refusal. Writes intentionally compare distinct absent names in the same controlled directory, as required to avoid baseline contamination.

## 6. Strict profile semantic comparison

Selected profile: **`ai-office-s5r2-750b18c5-47be-4d0c-bbf8-b7736e9ba4a1`**. Original S5 profile/config was read-only. Only fixture root binding and profile identity were substituted; reversing those substitutions reproduces exact original config text. No permissions value or inheritance changed.

| Config | SHA-256 |
|---|---|
| Original S5/S5R | `DF084E7E33C274F9754438F17BC44DAD54EB113F631089D580F0CAC87F70D4B9` |
| Fresh S5R2 | `6149E00A832BEA0AD6701A789C137DEE11BF0E5736D3678981CACF213EC68D99` |

**Not byte-identical**: absolute fixture paths and profile name differ. Sanitized semantic diff (`config/semantic-diff.json`):

- Preserved `extends = ":workspace"`, `:root = deny`, `:minimal = read`, `:tmpdir = deny`, `:slash_tmp = deny`.
- Preserved `filesystem.":workspace_roots"."." = write`, with only fresh Project A as runtime cwd/root; no profile-defined additional roots.
- Exact B/private/fake-credential/home/evidence denies now bind to the corresponding fresh siblings.
- Networking stays disabled; ephemeral auth storage retained; explicit MXC and managed inclusion remain in argv.

Profile contents frozen before launch, hash unchanged afterward. No broad drive/user/Temp grant, legacy sandbox_mode, unrestricted profile, fallback or post-failure tuning. Custom profile selection is not replaced with built-in `:workspace`; that name is only the inherited parent already used by S5.

## 7. Effective workspace-root analysis

Native cwd was exact fresh `<S5R2_ROOT>/project-a`, not the agent workspace, old S5 A, whole fixture or Temp parent. Config has no active profile-defined additional workspace roots. Explicit `--permission-profile` selects the unique fresh profile. Nine-key environment excludes unrelated Codex/session context. Standalone candidate invocation does not inherit the current editing session's D: workspace as its runtime cwd.

Pinned [debug sandbox source](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs) uses loaded config cwd for sandbox command/policy cwd and passes effective permissions to the MXC transform. [Pinned config selection](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/core/src/config/mod.rs) was reviewed against current [permissions documentation](https://learn.chatgpt.com/docs/permissions). Current managed preflight found no Windows RequirementsPath override/system requirements/system config/new-home legacy managed file. `--include-managed-config` was retained, not bypassed.

No supported complete effective merged-policy dump was obtained. Selection/source/config evidence and the actual A-permit/B/private/credential-deny contrast sufficiently establish the **tested boundary**, without claiming complete kernel policy introspection. If parent workspace broadening had appeared, the launch would have stopped.

## 8. Temporary directory permissions

Child TEMP/TMP point only to `<S5R2_ROOT>/temp`, a denied sibling, not the entire fixture or Project A ancestor. CODEX_HOME is fresh test-home. Native input keys exactly: `SystemRoot`, `WINDIR`, `ComSpec`, `SystemDrive`, `LOCALAPPDATA`, `PATH`, `TEMP`, `TMP`, `CODEX_HOME`. Host startup paths exist and were checked; child PATH contains reviewed candidate codex-path and System32. No NODE_OPTIONS, provider keys, proxy secrets, USERPROFILE or operator opt-in forwarded; no raw environment dump.

[Tagged MXC policy](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) materializes `:tmpdir` from filtered TEMP/TMP and omits `/tmp` on Windows. Root deny and overridden temp deny prevent an intended broad Temp grant; narrow A allowance remains usable, demonstrated by F01/F02. Explicit sibling denies were effective in the observed tests. No dedicated temp-access probe was added; no claim of testing every Temp path.

`:minimal` platform runtime exceptions were reviewed against pinned source/S5 evidence and do not include fresh synthetic siblings under user Temp. General real-secret safety in all platform-readable directories remains unverified.

## 9. Fixed inline probe design

Reviewed fixed source **5742 bytes**, SHA-256:

```text
C4BD06974DF16E0F0718626E26A46D9D4243B1045EFFB2A41674B4B40636FD25
```

The host saved exact source text at `config/inline-probe.js` for audit; the sandbox did **not** load that file as an entry point. Its literal UTF-8 source was passed as one `--eval` argument. `vm.Script` parsed it outside MXC without executing the full probe. Manifest literals are prevalidated fixed fixture paths, not arbitrary input code.

Protocol: bootstrap marker → require **only `node:fs`** → module-ready marker → synchronous operations → per-operation NDJSON → final summary. Markers record Node PID/PPID for ownership. Positive A read validates expected content without printing it; A exclusive create writes the fixed marker and closes the handle. Forbidden write tests use **`fs.openSync(target, "wx")`**: a successful create alone would be a security failure, with no further payload write needed. [Exact Node fs documentation](https://nodejs.org/download/release/v24.21.0/docs/api/fs.html) supports synchronous direct APIs and exclusive creation.

Each result records attempted=true, actual success/create/content-match/error code/errno/syscall, path classification and observed classification. No fs recursion, deletion, child_process, network, arbitrary shell, inner eval, project import, environment dump or host policy evaluator. First positive failure or any forbidden success stops subsequent tests. ENOENT/EINVAL/unknown errors are inconclusive, never secure denials.

## 10. Exact sandbox argv

Executable: exact retained `<S4_CANDIDATE>/bin/codex.exe`. Literal argv prefix and final source binding:

```text
-c
cli_auth_credentials_store="ephemeral"
-c
windows.sandbox=mxc
sandbox
--include-managed-config
--permission-profile
ai-office-s5r2-750b18c5-47be-4d0c-bbf8-b7736e9ba4a1
--
C:\Program Files\nodejs\node.exe
--eval
<literal UTF-8 contents of config/inline-probe.js; SHA-256 C4BD06974DF16E0F0718626E26A46D9D4243B1045EFFB2A41674B4B40636FD25>
```

The final notation is a report redaction, **not a filename or placeholder executed by Node**. Exact source bytes plus manifest/native prefix in retained evidence fully specify actual argv. `mxc-issued.json` binds the source hash before spawn. Actual execution used separate arguments, `shell: false`, cwd fresh A, hidden window, ignored stdin, timeout **10000 ms**, maxBuffer **65536 bytes**. Argument length was checked below 24000 characters. No shell quoting/reconstruction of user data.

## 11. Actual MXC launch count

**1/1**, zero retries/fallback/second troubleshooting command. Immutable `launch-budget.json` hash checked before launch; exclusive `mxc-issued.json` persisted `wx` before spawn. Operator opt-in had to match fixture ID. Accepted host baseline, reviewed source hash, unchanged profile/manifest/runtime, absent outputs, owned paths and managed preflight all gated launch. No automatic npm/Vitest discovery or persistent test-runner changes.

## 12. Bootstrap result

Start UTC **2026-10-29T22:51:42.431Z** = **30 Oktober 2026 05:51:42.431 WIB**. Native launcher PID **23604**, exit **0**, signal null, spawn error null, duration **1024 ms**. `S5R2_BOOTSTRAP_OK` marker came from Node PID **23224**, reported PPID **5068**. Stderr empty; no timeout, parse/profile-rejection/auth/elevation/fallback diagnostic.

Recorder exit was also 0; it is not substituted for native exit. Original source/config hashes and output verification independently support structured result completeness.

## 13. node:fs loading result

`S5R2_FS_READY` marker was emitted by the same Node PID after successful `require("node:fs")`. It was followed by **12 actual operation events**, not merely a ready signal. Final summary `CORE_VERIFIED`, attempted=12, planned=12, requiredComplete=true, unattempted=[]; host protocol validation succeeded.

## 14. F01–F10 direct outcomes

All host controls below succeeded. For write controls, a **different baseline filename** in the same verified parent directory was used, and exact sandbox targets remained absent before launch.

| ID | Direct sandbox operation | Expected | Actual result | Actual code / errno / syscall | Classification |
|---|---|---|---|---|---|
| F01 | Read A/input/canary.txt | ALLOW | Success, contentMatch=true | null | OS_VERIFIED — allowed read |
| F02 | Exclusive create/write A/output/sandbox-output.txt | ALLOW | Success, created=true, marker verified | null | OS_VERIFIED — allowed create/write |
| F03 | Relative B input read | DENY | Attempted; success=false | EPERM / -4048 / open | OS_VERIFIED — denied read |
| F04 | Exclusive create B output | DENY | Attempted; created=false | EPERM / -4048 / open | OS_VERIFIED — denied create |
| F05 | Read fake-project.db marker | DENY | Attempted; success=false | EPERM / -4048 / open | OS_VERIFIED — denied read |
| F06 | Exclusive create private-state output | DENY | Attempted; created=false | EPERM / -4048 / open | OS_VERIFIED — denied create |
| F07 | Read dummy credential marker | DENY | Attempted; success=false | EPERM / -4048 / open | OS_VERIFIED — denied read |
| F08 | Exclusive create fake-credential output | DENY | Attempted; created=false | EPERM / -4048 / open | OS_VERIFIED — denied create |
| F09 | Canonical absolute B read | DENY | Attempted; success=false | EPERM / -4048 / open | OS_VERIFIED — tested absolute read denied |
| F10 | Controlled A→B relative traversal read | DENY | Attempted; success=false | EPERM / -4048 / open | OS_VERIFIED — tested traversal read denied |

No missing-file/syntax/manifest/bootstrap errors were counted as denies. Denied writes establish **exclusive new-file creation denial**, not every overwrite/rename/delete operation. These are exact property scopes for this batch.

## 15. Optional F11–F12 outcomes

| ID | Prerequisite/control | Sandbox attempt | Evidence scope |
|---|---|---|---|
| F11 | Extended Windows namespace path resolves to owned B canary; host read/hash success. | Direct read denied: EPERM / -4048 / open. | OS_VERIFIED for this path form; Node/Windows may normalize it to the same underlying path. |
| F12 | Fresh owned A/junction-b points only to fresh B; host read/hash success, no elevation. | Direct junction read denied: EPERM / -4048 / open. | OS_VERIFIED for this junction read, not all junction writes/symlinks/hardlinks or races. |

Both ran within the **same** core batch, not extra MXC launches. No optional test was skipped; no old S5 junction was used.

## 16. Direct OS denial evidence

Evidence chain for each denial: fixture target/read exists or intended output parent exists; normal-user control succeeds; selected strict profile/source supports denial; direct Node fs operation actually attempted; actual permission-related error recorded; post-state preserved. Probe never calls AI Office host policy, backend, approvals evaluator or project-state service. This supplies additional OS-process restriction evidence beyond historical host-side validation.

This is behavioral OS enforcement evidence, not a syscall tracer identifying individual kernel internals. `error.syscall = "open"` is the actual Node error field. We do not invent a native API trace or infer every filesystem object is inaccessible.

## 17. Unexpected allowed accesses

**None observed among attempted forbidden operations.** All ten negatives failed permission-related; no `SECURITY_FAILURE`, unexpected success, created forbidden target, insecure fallback or policy mutation. The fail-fast branch remained armed but was not triggered. This does not prove absence of untested escape classes.

## 18. Canaries and forbidden-output integrity

Post-check **4/4 read hashes unchanged**: A, B, fake private-state and fake credentials. No contents disclosed. A sandbox output is **67 bytes**, SHA-256:

```text
310E386FDDB0D17BDBC17A231971121241E30CDC3D2B2CD406CF7C2823A134E1
```

Independently computed expected marker hash matches actual file. Forbidden B/private/credential sandbox outputs **3/3 absent**. Baseline output files remain separate evidence, not attributed to sandbox. No canary overwrite, operator cleanup, restore or evidence deletion.

## 19. Path topology and junction status

All four synthetic roots re-resolve to unchanged canonical paths. New junction exists after the batch and still resolves only to owned B; no unexpected reparse was introduced. Initial manifest, baseline path validation and post-integrity receipt distinguish F12 from the **historical missing S5 alias**, which stayed absent and untouched. No privileged symlink setup or real-directory link.

Future file creation, alias replacement/races, hardlinks, other volumes, directory enumeration, rename/delete and all junction-write forms were not tested. Existing-canary denial does not prove long-running future-file protection.

## 20. Process accounting

At **2026-10-29T22:52:53.820Z**, launcher PID **23604**, Node PID **23224**, and reported parent PID **5068** were absent in read-only process observations. No owned candidate/fixture-ID process remained. No listening TCP socket on known test PIDs. Active VS Code Codex PID **22256** remained present. No process was killed; existing unrelated processes were left alone.

Reported PPID alone was not treated as authority to terminate a host process. Bounded foreground/known-PID accounting does not prove hostile/detached descendant confinement. No child-process experiment, network listener/probe, backend/frontend, WSL or actual worker started.

## 21. Source/system unchanged-file verification and retained artifacts

Actual entry/final comparisons:

| Protected scope | Result |
|---|---|
| AI Office files outside node_modules | **117/117 existing hashes unchanged**; final **119 files**, exactly two new authorized S5R2 reports. Existing source/tests/probe/contracts/schema/package/lock/screenshots/prior reports preserved. |
| Installed global Codex | **50/50 unchanged**, metadata 0.162.1; no global install/default/extension/PATH update. |
| S4 evidence/candidate | **61/61 unchanged**, including all 45 candidate files. |
| S5 / S5R evidence | **36/36 and 18/18 unchanged**; old S5 junction already absent at entry, still absent; no historical-topology repair. |
| Older retained roots QHnCi9 / TLkI1Y / nUSJvQ | **22/22, 22/22, 6/6 unchanged** within inspected task scope. |
| Hermes3D tracked files | **647/647 unchanged**; HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`, pre-existing ` M package-lock.json` retained. |
| Parent PATH | Pre/post fingerprint matches; no raw value dump or permanent environment modification. |
| Global auth/config/security / full VS Code / external Visual Lab | No task mutations/real credential access; not full-host checksum or syscall audited. Visual assets not written. |

No production source/test-source/dependency/SQLite-schema changes, inference/auth/app-server/worker/paid API/credits, ACL/firewall/Defender/UAC/registry writes/elevation/WSL, external network probe, hostile/child experiment, browser E2E, Git init or cleanup bypass. Official-source HTTP research is distinct from sandbox network testing.

One fresh owned fixture retained; exact internal Owner locator:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s5r2-750b18c5-47be-4d0c-bbf8-b7736e9ba4a1
```

Includes synthetic inputs/outputs, known junction, exact config/semantic diff, manifest/budget, source template and fixed literal source, static/manual review, baseline, immutable issuance, actual NDJSON/result/integrity/process receipts, protected baselines and final relative hash inventory. Inventory does not traverse junction or hash itself. Raw local path manifests remain internal review material. No automatic deletion/support submission.

No regressions rerun because source did not change. Historical M01 300 PASS/1 SKIPPED, runtime-security 60 PASS (11 atomic tests included), S5 baseline 12/12 and S5R marker PASS are **historical**, not new R2 results. New R2 evidence is static syntax review, 12 host controls and one 12-operation MXC batch.

## 22. Remaining enforcement gaps

Network/loopback/proxy behavior, cooperative/hostile child inheritance, detached cleanup, new-file deny timing and long-running changes remain NOT RUN/NOT VERIFIED. Policy uses exact directory denies/root denial, no deny-read glob, but no future-file guarantee is inferred. Real credential custody, actual SQLite private-state boundaries, app-server runtime, real approvals/cancellation, skill enforcement, durable lease/recovery/cross-process dedup and provider account/billing remain unverified.

## 23. Security findings and severity

No confirmed security failure in this bounded batch. Required positives passed and every forbidden attempt returned a permission error. No actionable escape finding/severity is assigned without an observed exploit. Scope limitation is material: this result covers existing synthetic reads, exclusive output creates and specified path forms, not arbitrary hostile code or every filesystem operation.

Original file-entry Node bootstrap limitation and historical S5 alias discrepancy remain documented; successful inline I/O does not erase or diagnose their root causes. Do not weaken profile, rerun or silently fix old evidence after acceptance.

## 24. Final containment decision

**ACCEPTED — BOUNDED DIRECT OS FILESYSTEM CONTAINMENT.** Strict semantics and available selection evidence maintained; official candidate executed through explicit MXC; fs module and A read/write worked; required B/private/fake-credential and path-negative attempts were denied against successful host controls; no forbidden output; process/source preservation verified. Optional F11/F12 also denied as narrowly scoped above.

Acceptance applies only to this exact tested environment, fixture, operations and policy. **HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.** Real coding worker is still blocked; no M02-03/app-server/model integration authorized.

## 25. Recommended next bounded milestone

Recommend **M02-02S6 — Bounded Cooperative Child-Process Confinement Validation** as a proposed task, not a roadmap change or started milestone. Use one fixed non-AI parent and one fixed cooperative child with synthetic A-positive/B/fake-credential-negative controls, preserved strict semantics, explicit process deadlines and no detached/hostile/network experiment. Proposed ceiling: one outer MXC launch and one cooperative child after preflight, with persisted opt-in/no-retry issuance.

Owner must authorize exact parent/child code/argv, fresh or explicitly permitted fixture scope, policy/path bindings, baseline outputs, process budget/deadlines and retention. No automatic further testing. Network/new-file/runtime/account gates remain separate. **STOP after S5R2.**

**M02-02S5R2 COMPLETE — BOUNDED DIRECT MXC FILESYSTEM CONTAINMENT VERIFIED — REAL CODING WORKER STILL BLOCKED — AWAITING OWNER REVIEW.**
