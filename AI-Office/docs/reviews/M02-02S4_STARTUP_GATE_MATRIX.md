# M02-02S4 — Startup Gate Matrix

Tanggal: 29 Oktober 2026, Asia/Jakarta. Evidence lengkap: [Isolated Codex Compatibility Report](M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md). Local evidence prefix `<S4_ROOT>/evidence/`; exact owned-root locator ada di report section 19. Matriks ini membedakan startup compatibility dari OS enforcement dan real runtime readiness.

## 1. Executive decision

**STARTUP VERIFIED — TESTED CONFIGURATION ONLY.** Official Codex 0.164.0 menghasilkan stdout `MXC_OK\r\n`, stderr kosong dan native exit `0` pada satu explicit MXC launch, `1156 ms`, `2026-10-29T10:15:23.927Z`. Allowance **1/1 habis**. Tidak ada retry/fallback. **OS CONTAINMENT NOT VERIFIED; REAL WORKER BLOCKED.**

## 2. C01–C25 outcomes

| Gate | Requirement | Status | Exact evidence and boundary |
|---|---|---|---|
| C01 | Official 0.164.0 release identified | VERIFIED | Official openai/codex `rust-v0.164.0`, non-draft/non-prerelease, published 2026-10-23T04:48:10Z; report section 4. |
| C02 | Exact Windows x64 artifact available | VERIFIED | Asset ID 667993208, `codex-package-x86_64-pc-windows-msvc.tar.gz`, 167144380 bytes; matching target/variant/layout in `extraction.json`. |
| C03 | Package integrity/provenance | VERIFIED | `acquisition.json`: official digest/downloaded SHA-256 `700116be3143576d006467af8576f7f4c9dada1feddfdb7f69743bfde0997018`; `archive-review.json` safe paths; `signatures.json` main+two helpers Valid OpenAI OpCo, LLC / AMD64. Not an all-dependency security certification. |
| C04 | Candidate executable version | VERIFIED | `version.json`: PID 30736, exit 0, `codex-cli 0.164.0\n`; main binary SHA-256 `6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36`. |
| C05 | Existing Codex unchanged | VERIFIED | 50/50 installed global package hashes unchanged, old native SHA-256 `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`; no upgrade/default registration. Active VS Code process untouched; whole extension not checksummed. |
| C06 | Isolated CODEX_HOME | VERIFIED | Pre-created owned `isolated-home`, 41-byte ephemeral-only config; no real home copy. `home-initialization-review.json` and final inventory account for standard temporary arg0 aliases; report section 8 explains path-spelling caveat. |
| C07 | Disposable working directory | VERIFIED | Owned `workspace`, initially empty and empty after attempt; not valuable source/project cwd. |
| C08 | Windows startup environment | VERIFIED | Nine explicitly reviewed input keys, valid host SystemRoot/WINDIR/ComSpec/SystemDrive/LOCALAPPDATA metadata, bounded child PATH/home/temp; input validation only, not complete internal SDK environment trace. |
| C09 | Secrets excluded from child environment | VERIFIED | Explicit nine-key input allowlist, no full env inheritance, provider keys/proxy credentials/USERPROFILE/NODE_OPTIONS excluded, no secret-value dump. Does not establish OS denial of credential-file access. |
| C10 | Managed restrictions preserved | VERIFIED | `sandbox-help.json` confirms flags; `mxc-startup.json` includes `--include-managed-config --permission-profile :workspace`, accepted without validation error; no managed policy edits/disablement. Full effective merged policy and enforcement NOT VERIFIED; no policy dump/independent trace. |
| C11 | Explicit MXC selected | VERIFIED | Actual argv `-c windows.sandbox=mxc`, documented explicit-selection path and successful echo; no legacy/unrestricted fallback. Does not verify all OS restrictions. |
| C12 | One harmless sandbox command | VERIFIED | Exclusive `mxc-attempt-issued.json`: attempt 1/max1/noRetry; `mxc-startup.json`: one fixed trusted `cmd.exe /d /c echo MXC_OK`. Version/help are separate non-sandbox checks. |
| C13 | Expected MXC_OK | VERIFIED | Actual native stdout exactly `MXC_OK\r\n`, stderr empty; `mxc-startup.json`. |
| C14 | Exit zero | VERIFIED | Native PID 31512 exit 0, signal/error null, duration 1156 ms; not merely Node recorder exit. |
| C15 | No authentication or inference | VERIFIED | Synthetic ephemeral file+CLI override, source-reviewed memory-only/no-auth config path; no login/model/app-server command, auth prompt or account material supplied. Action/source/observation scope, not forensic network/syscall proof. |
| C16 | No Windows security modification | VERIFIED | No install/elevation/security/ACL/firewall/features/admin/WSL operations performed; no such request observed. Audit of task actions, not global host telemetry. |
| C17 | Test processes accounted for | VERIFIED | Post-attempt PIDs 30736/9192/31512 absent; no owned S4-root/MXC_OK process remained, active VS Code PID 21476 retained; no process killed. Target cmd PID not separately captured; synchronous completion supports exit. Hostile descendant confinement NOT VERIFIED. |
| C18 | Existing project source unchanged | VERIFIED | 110/110 existing AI Office hashes unchanged; final inventory 112 files, only two authorized S4 reports added; packages/tests/schema/screenshots/prior reports preserved. Historical fixtures 22/22+22/22+6/6 and Hermes tracked 647/647 unchanged. |
| C19 | OS direct read/write containment | NOT RUN | No synthetic A/B positive/negative read/write, junction/new-file or direct bypass probes. OS enforcement NOT VERIFIED. |
| C20 | Credential/private-state isolation | NOT RUN | No fake credential/private SQLite probes; actual credentials never used as probe material. File/keyring OS denial NOT VERIFIED. |
| C21 | Network and child-process containment | NOT RUN | No network/loopback/proxy or hostile/detached child probes. Bounded launcher accounting is insufficient for confinement verification. |
| C22 | Real app-server protocol readiness | NOT RUN | No app-server, real adapter, worker, runtime approval/cancel/recovery/skill integration. Readiness NOT VERIFIED. |
| C23 | Subscription entitlement | UNKNOWN | No account/auth/entitlement/model-availability query. Harmless local echo supplies no entitlement evidence. |
| C24 | Included-only billing protection | NOT VERIFIED | No actual account limit, billing cap or credit-fallback enforcement evidence; no inference/paid API activated. |
| C25 | Real worker authorization | BLOCKED | C19–C24 and production lifecycle controls unresolved; S4 explicitly prohibits worker/M02-03/inference. |

## 3. Acquisition and startup gates A–E

| Gate | Decision | Basis |
|---|---|---|
| A — Official acquisition | PASS | Exact official bundle/digest, safe extraction, layout, architecture and signatures checked before execution. |
| B — Side-by-side isolation | PASS | Absolute candidate, one owned root, separate pre-created home/cwd, unchanged active package. |
| C — Windows environment | PASS | Actual Windows prerequisites reviewed; narrowly constructed nine-key input, no unrelated secrets. |
| D — Candidate read-only checks | PASS | Version/help exit 0; normal scoped alias initialization reviewed before MXC, no auth/elevation/update. |
| E — One MXC startup | PASS | One native launch exit 0, MXC_OK, empty stderr. Tested configuration only. |

Tidak ada executed startup gate yang FAILED. C19–C22 sengaja NOT RUN sesuai batas S4; C23 UNKNOWN, C24 NOT VERIFIED dan C25 BLOCKED tidak dipromosikan ke PASS. Tidak ada second attempt atau fallback untuk memperbaiki hasil.

## 4. Active CLI and process/artifact preservation

Active global CLI tetap 0.162.1 berdasarkan package metadata dan unchanged bytes; tidak dijalankan ulang untuk membuktikan preservation. Candidate 0.164.0 tidak mengganti shims, PATH, extension, config atau default installation. Parent PATH fingerprint cocok; user/system PATH tidak diedit.

61 owned files/650859526 bytes dipertahankan pada satu S4 root. `final-inventory.json` meng-hash 60 files dan secara eksplisit mengecualikan dirinya sendiri. Archive, candidate, synthetic config/aliases dan bounded receipts semuanya accounted; workspace kosong. Tidak ada operator deletion, historical fixture cleanup atau policy bypass. Runtime normal arg0 stale-file cleanup dibedakan dari operator cleanup.

No arbitrary process kill; no owned test process ditemukan tersisa pada post-attempt accounting. Ini tidak membuktikan hostile-tree behavior. Global config/auth tidak di-hash atau dibuka untuk perbandingan; no-mutation claim dibatasi tindakan task dan source-reviewed ephemeral startup. External Visual Lab tidak ditulis dan tidak checksum-audited.

## 5. OS, credential, runtime and account boundaries

OS isolation **NOT VERIFIED**. Credential/private-state isolation **NOT VERIFIED** meskipun no credentials intentionally forwarded. Permission `:workspace` bukan bukti bahwa semua reads di luar A ditolak. Sukses echo tidak mengukur file permissions, kernel enforcement, network deny, canary integrity atau child inheritance.

Actual app-server/runtime **NOT VERIFIED**; production approval/cancel, durable recovery/lease, cross-process dedup dan authoritative audit tetap belum diuji. Account/subscription/model availability **UNKNOWN**, included-only billing guard **NOT VERIFIED**. Paid API/credit fallback tetap tidak diotorisasi. **Tidak ada real worker, inference, auth/login/logout, app-server atau paid API yang dijalankan pada S4.**

Historical M01 300 PASS/1 SKIPPED, runtime-security 60 PASS dan browser E2E 2 PASS bukan hasil test S4 dan tidak memenuhi OS/account/runtime gates. Tidak menjalankan ulang suite atau meregenerasi screenshot.

## 6. Required next tests and recommended milestone

Rekomendasi setelah startup success: **M02-02S5 — Bounded Direct OS Containment Validation**. **Belum dimulai.** Rancangan task berikut harus menetapkan:

1. Synthetic A/B dan fake private state/credentials; host-access positive controls; tidak menyentuh data akun nyata.
2. Effective minimal permissions dan managed restrictions; positive A read/write, negative B/private read/write, baseline/new files dan junction/alias boundaries.
3. Explicit bounded process lifecycle dan safe network/loopback/proxy controls, masing-masing dengan expected permit/deny dan cleanup ownership.
4. Exact attempt budget, evidence, deadlines, stop conditions dan unchanged-canary/source checks.

App-server integration, actual credential handling, account entitlement, billing limits dan worker authorization memerlukan gate/scope terpisah sesudah OS evidence; tidak termasuk rekomendasi auto-run. Error 203 lama tetap tanpa confirmed root cause karena versi, environment, distribution, SDK dan path spelling berubah bersamaan.

## 7. Owner approval requirements and stop

S4 selesai dalam otorisasi yang sudah diberikan. Owner perlu memberikan **otorisasi task baru** untuk direct OS containment probes/S5, dengan fixture/commands/policy/attempt/process/retention scope yang konkret. Tidak memulai S5/M02-03, menghubungkan app-server, mengganti active CLI, melakukan login/inference, mengaktifkan paid API/credits atau mengirim support evidence secara otomatis. Single-launch allowance S4 tidak dapat digunakan kembali.

**M02-02S4 COMPLETE — CODEX 0.164.0 MXC STARTUP VERIFIED — OS CONTAINMENT STILL NOT VERIFIED — REAL WORKER BLOCKED.**
