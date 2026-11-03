# M02-02S5 — Direct OS Containment Report

Tanggal: 29 Oktober 2026, Asia/Jakarta. Companion: [Containment Gate Matrix](M02-02S5_CONTAINMENT_GATE_MATRIX.md). Semua data probe sintetis; tidak ada AI runtime/inference. `<S5_ROOT>` dan `<S4_CANDIDATE>` adalah redaksi local paths, bukan executable alternatif.

## 1. Executive summary

**CONDITIONAL — POLICY OR EVIDENCE GAP. OS CONTAINMENT EVIDENCE INCOMPLETE. REAL WORKER BLOCKED.**

Satu explicit MXC invocation memakai official retained Codex 0.164.0 dan custom strict profile. Native launcher PID `6260` exit `1`, stderr menunjukkan **Node bootstrap `EPERM`, errno `-4048`, pada `lstat 'C:\'`**. Node gagal sebelum entry point probe: stdout kosong, tidak ada probe receipt, dan **nol F01–F12 operations dieksekusi di sandbox**.

Host baseline sebelumnya berhasil **12/12** direct I/O operations. Sesudah failure, seluruh tujuh protected synthetic files cocok dengan post-baseline hashes. Tidak ada forbidden access yang terbukti sukses dan tidak ada direct negative test yang membuktikan deny. Error loader bukan PASS containment dan bukan confirmed sandbox escape.

Stop condition: strict-profile probe tidak dapat mulai; S5 sections 11/20/27 mengharuskan fail closed. Tidak mengubah profile, memperluas filesystem grants, mengganti runtime, mencoba fallback/system probe, atau mengulang command. Child/network/timing tests tidak dimulai. Budget dipilih **maksimum dua invocation**, lebih ketat dari ceiling tiga milik Owner; aktual **1**, tanpa retry. Sisa budget tidak dipakai sesudah stop.

## 2. Windows and candidate baseline

Host dibaca ulang: Microsoft Windows 11 Home Single Language, 64-bit, `10.0.26300`; registry build `26300.9711`, `26H2`, sama dengan S4. Existing Node adalah `v24.21.0`, executable `C:\Program Files\nodejs\node.exe`, berada dalam platform-readable Program Files; tidak menginstal runtime/dependency.

Retained S4 `candidate/codex-package.json`: layoutVersion `1`, version `0.164.0`, target `x86_64-pc-windows-msvc`, variant `codex`, entrypoint `bin/codex.exe`. Semua **45 candidate files** cocok dengan S4 inventory sebelum pengujian. Main SHA-256:

```text
6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36
```

Authenticode main diperiksa ulang: **Valid**, OpenAI OpCo, LLC. Release provenance/digest dan helper signatures ditopang [S4 report](M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md) dan unchanged bundle; tidak mengunduh candidate baru. Official release tetap [rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0).

Read-only S5 checks memakai synthetic home baru dan reviewed nine-key env:

| Check | UTC | Native PID | Exit | Duration | Result |
|---|---|---:|---:|---:|---|
| `-c cli_auth_credentials_store="ephemeral" --version` | 2026-10-29T12:18:45.577Z | 7068 | 0 | 94 ms | `codex-cli 0.164.0`, stderr kosong. |
| `-c cli_auth_credentials_store="ephemeral" sandbox --help` | 2026-10-29T12:18:45.673Z | 14548 | 0 | 60 ms | Named profile / managed-inclusion flags tersedia; stderr kosong. |

Active global package tetap metadata `0.162.1`, tidak dieksekusi untuk S5. **50/50 installed files unchanged**; old native hash `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`. Active VS Code process PID `21476` distinct dari candidate dan tetap hidup pada accounting check.

## 3. Previous S4 startup evidence

[S4 startup matrix](M02-02S4_STARTUP_GATE_MATRIX.md) mencatat tepat satu harmless `cmd.exe /d /c echo MXC_OK`, built-in `:workspace`, exit `0`, stdout `MXC_OK\r\n`, stderr kosong, `1156 ms`, pada `2026-10-29T10:15:23.927Z`. Ini **historical S4 evidence**, bukan uji ulang di S5 dan bukan direct filesystem containment proof.

S5 memakai strict custom policy dan Node probe. Failure S5 berbeda dari original 0.162.1 error 203: kali ini ada Node loader diagnostic. Root cause error 203 lama tetap tidak ditetapkan. Tidak memodifikasi laporan S/S1/S2/S3/S4.

## 4. New S5 fixture layout

Satu root baru bernama `ai-office-m0202s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8`, immediate child canonical OS-temp; bukan S4 root atau source project. Layout:

```text
<S5_ROOT>/
  project-a/
    input/canary.txt
    output/host-created.txt
    containment-probe.mjs
    s5-manifest.json
    junction-b/ -> ../project-b/   [only intentional junction]
  project-b/
    input/canary.txt
    output/write-target.txt
  app-private/
    fake-project.db
    write-target.txt
  fake-credentials/
    dummy-secret.txt
    write-target.txt
  test-home/
    config.toml
    tmp/arg0-windows/...          [normal CLI initialization]
  staging/temp/
  evidence/
```

Cwd hanya `project-a`. B/private/credentials tidak menjadi additional workspace roots. `fake-project.db` adalah plain synthetic marker, **bukan SQLite database**. Dummy credential bukan token valid dan isinya tidak dicetak. `sandbox-created.txt` direncanakan di A/output tetapi **tidak tercipta**, karena probe tidak mulai.

## 5. Fixture ownership and host baseline

Root dan ancestor metadata/canonical identity diperiksa; root dimiliki current Windows user dan bukan reparse. Satu deliberate junction dibuat tanpa elevation, hanya A/junction-b menuju B dalam owned root; semua reparse lain tidak diizinkan. Manifest mengikat unique fixture UUID, canonical root/A, profile name, read hashes, dan known junction state. Probe menolak arbitrary caller-selected paths/modes/executables.

Sebelum pengujian, `fixture-initial.json` mencatat tujuh canary/write-target canonical paths, sizes, SHA-256, dev/inode, UID dan nlink `1`. Root owner diperiksa sebelum launch; read-only per-file Windows-owner confirmation sesudah attempt juga menunjukkan **7/7 current-user owned dan existing** (`fixture-ownership.json`). Tidak mengubah ACL.

Fixed existing Node dijalankan **di luar MXC** sebagai normal-user control: mode `host-baseline`, start `2026-10-29T12:18:55.019Z`, PID `16236`, exit `0`, stderr kosong, `114 ms`. **Semua 12 operasi berhasil**, termasuk read melalui namespace/relative/junction paths. Read hashes cocok, tanpa mengungkap canary contents.

Baseline write hanya membuat A/output/host-created.txt dan memutasi tiga predesignated B/private/credential write targets. Read canaries tidak ditimpa. Initial/post-baseline metadata disimpan terpisah; perbandingan sesudah sandbox memakai **post-baseline**, sehingga authorized host control writes tidak disamarkan sebagai sandbox side effects.

## 6. Custom permission profile design

Exact profile name: `ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8`. S5 config disimpan hanya di `test-home/config.toml`; tidak menyalin active user config. Redacted equivalent:

```toml
cli_auth_credentials_store = "ephemeral"
default_permissions = "ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8"

[windows]
sandbox = "mxc"

[permissions.ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8]
extends = ":workspace"

[permissions.ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8.filesystem]
":root" = "deny"
":minimal" = "read"
":tmpdir" = "deny"
":slash_tmp" = "deny"
"<S5_ROOT>/project-b" = "deny"
"<S5_ROOT>/app-private" = "deny"
"<S5_ROOT>/fake-credentials" = "deny"
"<S5_ROOT>/test-home" = "deny"
"<S5_ROOT>/evidence" = "deny"

[permissions.ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8.filesystem.":workspace_roots"]
"." = "write"

[permissions.ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8.network]
enabled = false
```

Actual file memakai TOML-escaped canonical Windows paths, bukan placeholders. Tidak ada `sandbox_mode`, `sandbox_workspace_write`, extra profile-defined workspace root atau deny-read glob. Config/probe/manifest/executable hashes dibekukan di preflight dan direvalidasi sebelum native launch. Profile tidak diubah sesudah failure.

Current [permissions documentation](https://learn.chatgpt.com/docs/permissions) ditandingkan dengan tagged source 0.164.0: inheritance menggabungkan parent lalu child; override root-read/temp-write bawaan menjadi deny mempertahankan workspace protected subpaths. Source platform `:minimal` membaca Windows, Program Files, Program Files (x86), ProgramData; tidak mencakup owned Temp siblings. Ini bukan jaminan bahwa semua real credentials di seluruh platform-readable locations terlindungi.

## 7. Effective profile verification

Pinned source yang dibaca: [permissions compiler](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/core/src/config/permissions.rs), [config selection](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/core/src/config/mod.rs), [debug sandbox](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs), [MXC policy](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs). Named `--permission-profile` menjadi CLI `default_permissions` override; pinned config syntax resolver mengenali session profile selection. Tidak meminta legacy mode. Explicit `windows.sandbox=mxc` dipakai, bukan automatic-preference fallback.

Source juga menunjukkan managed allowlist dapat memaksa profile fallback. Oleh karena itu dilakukan read-only preflight berdasarkan [Windows config loader](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/config/src/loader/mod.rs): actual CommonApplicationData dikenal sebagai ProgramData; system config/requirements tidak ada; 64-bit HKLM policy key/RequirementsPath redirect tidak ada; synthetic-home legacy managed file tidak ada. Cloud auth context tidak disediakan. `--include-managed-config` tetap aktif; tidak ada requirements suppression.

Version/help dan source interface review selesai sebelum direct probe invocation. Pinned CLI tidak menyediakan standalone complete effective-policy dump pada interface yang ditinjau; tidak membuka TUI/session atau app-server untuk mendapatkannya. Native command menerima config/argv hingga Node loader berjalan; tidak terlihat parse error/profile-rejection/fallback warning. **Ini belum memverifikasi complete merged policy atau required I/O enforcement.** Root `EPERM` konsisten dengan strict policy, tetapi tidak mengidentifikasi seluruh effective permissions secara independen. S5-04 tetap NOT VERIFIED.

Sumber no-auth: tagged [ephemeral auth storage](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/login/src/auth/storage.rs) dan [cloud-config service](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cloud-config/src/service.rs), ditinjau bersama S4. File dan CLI sama-sama memilih ephemeral; tidak memasok account material/provider secrets. Ini action/source evidence, bukan syscall audit.

## 8. Temporary directory restrictions

Nine native input keys: `SystemRoot`, `WINDIR`, `ComSpec`, `SystemDrive`, `LOCALAPPDATA`, `PATH`, `TEMP`, `TMP`, `CODEX_HOME`. Host startup paths berasal dari existing actual values dan divalidasi; ComSpec canonical identity cocok dengan trusted system cmd. PATH child dibatasi pada S4 candidate codex-path dan Windows System32. Home baru scoped S5; tidak ada full env inheritance, USERPROFILE, NODE_OPTIONS, provider/API/proxy secrets atau S5 opt-in yang diteruskan ke native candidate.

TEMP/TMP child menunjuk `<S5_ROOT>/staging/temp`, **bukan parent seluruh fixture dan bukan ancestor Project A**. Dalam [tagged MXC policy source](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs), `:tmpdir` dimaterialisasi dari filtered TEMP/TMP; `:slash_tmp` dihapus pada Windows. Dengan demikian inherited temp grant ditimpa deny pada staging/temp, sementara root deny tidak memberi general OS-temp access. Tidak memberi explicit read/write ke seluruh Temp atau user profile.

Narrower workspace grant direncanakan memberi akses A meskipun A berada di OS-temp; target input/temp paths tidak saling menjadi ancestor. Source mendukung rancangan, **runtime A access dan sibling exclusion belum terbukti** karena loader failure. Tidak melonggarkan root deny demi memperbaiki `lstat C:\`. S5-05 NOT VERIFIED.

## 9. Exact MXC command executed

Satu actual sandbox invocation; root/candidate personal direduksi, argv asli tersimpan pada exclusive issuance receipt:

```text
"<S4_CANDIDATE>\bin\codex.exe" -c cli_auth_credentials_store="ephemeral" -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile ai-office-s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8 -- "C:\Program Files\nodejs\node.exe" "<S5_ROOT>\project-a\containment-probe.mjs" core
```

Paths ber-spasi diberikan sebagai separate argv entries, tidak melalui shell. Cwd `<S5_ROOT>/project-a`; ignored stdin, captured pipes, hidden window, timeout `10000 ms`, output cap `65536` bytes. Tidak ada model, provider, app-server, `codex exec`, worker atau untrusted project script.

| Actual result | Value |
|---|---|
| Start UTC / WIB | `2026-10-29T12:19:08.614Z` / `19:19:08.614 WIB` |
| Native launcher PID | `6260` |
| Native exit / signal / spawn error | `1` / null / null |
| Duration | `428 ms` |
| Stdout | Empty |
| Stderr | Node loader `EPERM`, errno `-4048`, syscall `lstat`, path `C:\`; Node v24.21.0. |
| Probe receipt | Null; probe entry not reached. |
| Post-baseline protected files | 7/7 unchanged. |

Relevant error excerpt:

```text
Error: EPERM: operation not permitted, lstat 'C:\'
errno: -4048
code: 'EPERM'
syscall: 'lstat'
Node.js v24.21.0
```

Stack menunjuk `realpathSync`, `toRealPath`, module loader `resolveMainPath`, sebelum user probe berjalan. Ini bukan `ENOENT`, tetapi juga bukan permission-related denial pada salah satu target F03–F12. Outer operator recorder exit `0` hanya berarti receipt tersimpan; `core.json` memuat native exit `1` dan `accepted: false`, bukan test PASS.

## 10. Launch count and one-shot controls

Declared ceiling S5 **3**; selected plan **2**: one core, optional one cooperative parent setelah core accepted. Actual **1 core invocation**, **0 child invocation**, **0 timing invocation**, **0 retry/fallback**. Version/help dan one normal-user baseline bukan MXC launches.

Temporary operator harness memerlukan deliberate `AI_OFFICE_S5_OPT_IN` yang cocok fixture ID untuk core/child. Exclusive `attempt-1-core-issued.json` ditulis `wx` **sebelum spawn**; replay ditolak. Child mode memerlukan persisted accepted core dan unchanged inputs/canaries. Failure menyimpan `stopped.json`; seluruh further launches ditolak. Tidak ada ordinary npm/Vitest import yang memanggil MXC. Optional `containment.test.ts` **tidak dibuat**, sehingga tidak ada new test-discovery side effect.

## 11. Direct filesystem access matrix

Semua operasi memakai Node `fs` langsung, **tidak memanggil HostPathPolicy atau AI Office policy evaluator**. Host baseline mengeksekusi matrix berikut; sandbox tidak mencapai satupun operasi.

| ID | Operation / synthetic target | Expected sandbox | Host baseline | Actual sandbox / OS error | Classification |
|---|---|---|---|---|---|
| F01 | Read A/input/canary.txt | ALLOW | Success, matching hash | NOT RUN; no operation error | NOT VERIFIED |
| F02 | Create A/output/sandbox-created.txt | ALLOW | Success on separate host-created.txt | NOT RUN; file absent | NOT VERIFIED |
| F03 | Relative read B/input/canary.txt | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F04 | Write B/output/write-target.txt | DENY | Success on exact designated target | NOT RUN | NOT VERIFIED |
| F05 | Read app-private/fake-project.db | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F06 | Write app-private/write-target.txt | DENY | Success on exact designated target | NOT RUN | NOT VERIFIED |
| F07 | Read fake-credentials/dummy-secret.txt | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F08 | Write fake-credentials/write-target.txt | DENY | Success on exact designated target | NOT RUN | NOT VERIFIED |
| F09 | Canonical absolute B read | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F10 | Controlled relative traversal A → B | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F11 | Extended Windows namespace B read | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |
| F12 | A/junction-b → B read | DENY | Success, matching hash | NOT RUN | NOT VERIFIED |

No unexecuted test promoted to PASS. Probe would recognize only actual EACCES/EPERM on intended forbidden target as denial, distinguish ENOENT/other errors as inconclusive, and stop on first forbidden success. Those branches were **not reached in MXC**.

## 12. Allowed Project A operations

Host A read/hash and controlled A output creation succeeded. Actual sandbox A read/write **NOT RUN**, because Node bootstrap failed. There is no sandbox-created output or structured completion marker. A positive control is therefore absent inside MXC, preventing acceptance of any broader I/O claim.

## 13. Denied Project B operations

B source exists and is host-readable; designated output is host-writable. Post-baseline B input/output hashes remained unchanged. No sandbox B read/write was attempted; unchanged canaries **do not prove denial** when probe never started. B containment remains NOT VERIFIED.

## 14. Fake private-state and credential results

Host read/write controls succeeded against fake targets. Read canaries are unchanged against initial inventory; write targets are unchanged against post-baseline inventory after the sandbox attempt. No actual credential/database was read or copied. Fake marker denies were not exercised, so neither credential nor private-state OS isolation is verified.

Runtime credential custody is a separate future question: sandbox-only synthetic ephemeral startup does not prove that trusted provider credentials are hidden from real tool descendants, logs, argv, IPC, or OS credential stores.

## 15. Path aliases and reparse-point results

F09 canonical absolute, F10 relative traversal, F11 extended namespace, and F12 intentional junction all had successful host read controls. F11 may share Node/Windows normalization behavior with normal absolute paths; it is not claimed as an independent parser bypass. Junction realpath was checked to resolve only to owned B. No symlink pointing to real data was created.

All four **sandbox tests NOT RUN**. Junction retained; no recursive cleanup that could follow it. Root/other directories stayed without unexpected reparse redirection. Ordinary CLI arg0 aliases under S5 test-home were scoped runtime initialization, not global command alias changes or directly executed helpers.

## 16. Cooperative child-process evidence

**NOT RUN.** Core failed, so precondition for optional cooperative-parent invocation was not satisfied. No cooperative child or hostile/detached process was spawned. Fixed probe code contains only one approved self-child mode; its inherited restriction behavior was not executed. `COOPERATIVE_CHILD_VERIFIED` is **not earned**; `HOSTILE_CHILD_NOT_VERIFIED` remains.

## 17. Network-policy observations

Configured profile `network.enabled = false`; tagged MXC translation maps disabled networking to deny ingress/egress/host-loopback absent a managed proxy. This is source/config evidence, **not a runtime network test**. [Windows documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox) describes host-loopback/proxy caveats that must be considered separately.

No test-owned endpoint/listener was created; no public website, provider API, LAN device or unrelated localhost service was contacted as a **test endpoint**. Official documentation/source HTTP GETs were research, not network probes from sandbox. Child inheritance and actual proxy/network enforcement NOT VERIFIED. No firewall modifications.

## 18. Deny-read timing limitations

Chosen policy relies on symbolic root deny, exact sibling directory denies and narrow workspace grant, **not deny-read globs**. The documented process-start glob snapshot caveat therefore is not the primary mechanism proposed for this fixture. Source interpretation cannot establish future-file protection without runtime evidence.

**NEW-FILE TIMING: NOT VERIFIED / NOT RUN.** No process stayed running to synchronize a new canary. Preexisting-canary preservation after bootstrap failure supplies no proof about files created later, directory aliases, or long-running workers.

## 19. Security findings and severity

**S5-FINDING-01 — Strict-profile Node probe bootstrap failure.** Material acceptance blocker; category **configuration/test failure**, not confirmed vulnerability or CVSS-rated escape. Evidence: valid host baseline, selected strict-profile command, native exit 1, Node EPERM/lstat at drive root, no probe receipt and no sandbox operation results.

Observed error is consistent with denied root metadata access needed by Node module-path resolution. The precise sufficiency of individual profile grants and MXC path normalization is not independently traced. Do not assert a confirmed upstream bug or broaden C:\ read access as a fix. Failure is not concealed under a PASS; S5 **CONDITIONAL** follows the explicit acceptance case “probe cannot start within the strict profile.”

No forbidden direct access succeeded in observed evidence. Conversely, **no required OS boundary is established**. Worker remains blocked. Stop was honored before alternate command, second attempt, profile/environment changes or sensitive tests.

## 20. Regression results

| Actual S5 verification | Result |
|---|---|
| `node --check tests/integration/runtime-security/probes/containment-probe.mjs` | PASS, exit 0; syntax only. |
| `node --check <S5_ROOT>/evidence/run-s5.mjs` | PASS, exit 0; syntax only. |
| `npm run typecheck` | PASS, exit 0; `tsc --noEmit && tsc -p tsconfig.web.json`. |
| Normal-user fixed baseline | 12/12 ALLOW observed, exit 0. |
| Explicit MXC core invocation | INCONCLUSIVE, native exit 1; probe operations executed 0. |
| Child/network/timing | NOT RUN after stop. |

`npm test`, focused runtime-security Vitest, and browser E2E were not rerun; no application source changes justified fixture-generating regressions, and screenshots were preserved. Historical M01 **300 PASS, 1 SKIPPED**, host-security **60 PASS**, atomic issuance **11 PASS within the 60**, browser E2E **2 PASS** remain historical, not new S5 results. No double-counting atomic tests.

## 21. Process accounting and retained artifacts

Post-attempt read-only accounting at `2026-10-29T12:20:29.705Z`: native PID `6260` and host baseline PID `16236` absent; no owned candidate/S5-ID process remained; active VS Code PID `21476` present. Probe PID was not captured because entry point was not reached; synchronous foreground completion and no owned remaining process support bounded accounting, not hostile-tree proof. Version/help processes also completed synchronously. No process kill, WSL, app backend/frontend, external listener or child test.

Entire S5 root retained. Exact internal local locator:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8
```

Relative evidence includes `preflight.json`, `protected-baselines.json`, `source-review.json`, `managed-preflight.json`, `fixture-initial.json`, `fixture-ownership.json`, `preflight-checks-issued.json`, `version.json`, `sandbox-help.json`, `baseline-issued.json`, `host-baseline.json`, `post-baseline-files.json`, `attempt-1-core-issued.json`, `core.json`, `stopped.json`, `process-accounting.json`, `regression-results.json`, the fixed `run-s5.mjs`, and final change-safety/inventory records. Synthetic files, manifest, deployed probe, config, known junction and normal home arg0 artifacts retained. Final inventory records all actual relative file paths, sizes and hashes while excluding its own hash; it does not follow the deliberate junction.

No operator deletion, historical cleanup, rollback, unlink-and-retry, or cleanup-policy bypass. Raw protected-baseline paths and local evidence are internal review material; sanitize before external sharing. No support submission occurred.

## 22. Existing source and Codex preservation

Actual pre/post checksum comparisons, including final additions check:

| Scope | Result / limit |
|---|---|
| AI Office original files outside node_modules | **112/112 unchanged**. Final inventory **115 files**, exactly one authorized probe plus two S5 reports added. |
| Runtime-security modules, existing tests/contracts/schema/package/lock/config/screenshots/prior reports | Covered by protected baseline; unchanged. No production SQLite data read. |
| Existing global Codex package | **50/50 unchanged**, old native hash retained. No global npm install/PATH/default changes. |
| Retained S4 root | **61/61 files unchanged**, including all 45 candidate files, archive, S4 home and receipts. |
| Historical QHnCi9 / TLkI1Y / nUSJvQ roots | **22/22, 22/22, 6/6 unchanged**, retained. |
| Hermes3D tracked files | **647/647 hashes unchanged**; HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`, pre-existing ` M package-lock.json` retained. |
| Existing parent PATH | Pre/post fingerprint matches; no raw PATH dump or user/system environment edits. |
| Real auth/config and full Windows/VS Code state | Not copied/modified by task. Not checksum-audited or syscall-traced; no broad forensic preservation claim. |
| External Google AI Studio/Visual Lab assets | No writes; not checksum-audited. |

No Windows ACL/security/firewall/Defender/UAC/features/admin changes, provider login/logout, inference, app-server, paid API/credits, actual worker, new dependency, global upgrade, VS Code update, Git init, arbitrary process kill, or cleanup bypass. These are bounded action/observation claims, not full-host telemetry assertions.

## 23. Actual OS containment conclusion

**NOT VERIFIED.** Current evidence proves host accessibility, official candidate preservation and one strict-profile probe bootstrap failure. It does not prove Project A permit, Project B/private/credential deny, alias/junction resistance, child inheritance or network behavior under MXC.

Acceptance decision **B — CONDITIONAL — POLICY OR EVIDENCE GAP**, rather than OS containment acceptance. Category 2 failure is explicitly recorded; there is no category 1 secure-denial result and no observed category 3 forbidden-success result. Startup/version/hash evidence from S4 and S5 is not substituted for direct enforcement evidence.

## 24. Remaining gates before a real worker

Required filesystem negatives and positive controls remain unexecuted in sandbox. Runtime fake credential tests, cooperative/hostile tree limits, new-file and network behavior remain unverified. No actual app-server protocol, approval/cancellation, runtime skill restriction, durable production lease/recovery/cross-process dedup or production journal validation occurred. Account eligibility/model entitlement UNKNOWN; included-only billing enforcement NOT VERIFIED; paid API/credit fallback prohibited. **M02-03 / real worker BLOCKED.**

## 25. Recommended next bounded stage and Owner review

One precise follow-up: **M02-02S5R — Strict-Profile Probe Bootstrap Compatibility**. First review the Node drive-root canonicalization prerequisite and select a fixed non-AI entry mechanism compatible with the **unchanged strict filesystem/network policy**, without adding broad drive/user/Temp reads. A source-reviewed Node startup mechanism or existing fixed system probe must be concretely reviewed before any new execution; no automatic alternative was run here.

Owner authorization for S5R must specify exact probe/argv, unchanged policy identity, fixture reuse/new-root ownership, one bounded launch allowance if preflight permits, deadlines, stop criteria and retention. This is a proposal, **not started**. If safe bootstrap cannot be established without broadening policy, remain blocked and prepare a redacted upstream compatibility question instead of weakening isolation. No automatic support submission, app-server, M02-03, inference, worker or billing activation.

**M02-02S5 CONDITIONAL — OS CONTAINMENT EVIDENCE INCOMPLETE — REAL WORKER BLOCKED.**
