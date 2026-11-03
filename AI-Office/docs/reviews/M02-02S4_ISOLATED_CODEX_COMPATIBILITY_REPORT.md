# M02-02S4 — Isolated Codex Compatibility Report

Tanggal observasi: 29 Oktober 2026, Asia/Jakarta. Scope: satu eksperimen startup sandbox-only, tanpa inference. Matriks keputusan: [Startup Gate Matrix](M02-02S4_STARTUP_GATE_MATRIX.md).

## 1. Executive summary

**STARTUP VERIFIED — TESTED CONFIGURATION ONLY.** Official Codex 0.164.0 Windows x64 berhasil menjalankan satu command harmless melalui pemilihan MXC eksplisit. Native launcher exit `0`, stdout `MXC_OK\r\n`, stderr kosong, durasi `1156 ms`. Tidak ada retry atau fallback; allowance **1/1 telah habis**.

Klasifikasi: **MXC_STARTUP_VERIFIED — CODEX 0.164.0 — TESTED CONFIGURATION ONLY**. Ini tidak memverifikasi OS filesystem isolation, private-state protection, credential isolation, network isolation, hostile child-process confinement, atau worker readiness. **REAL WORKER BLOCKED.** Hanya dua laporan S4 ditambahkan ke AI Office; candidate dan evidence ditahan pada satu owned OS-temp root.

## 2. Previous startup failure

[S report](M02-02S_WINDOWS_CONTAINMENT_REPORT.md), [S1 diagnostic](M02-02S1_MXC_DIAGNOSTIC_REPORT.md), dan [S3 compatibility review](M02-02S3_MXC_VERSION_COMPATIBILITY_REPORT.md) mencatat Codex 0.162.1 exit `1`, stdout kosong, tanpa `MXC_OK`, dengan error:

```text
MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).
```

Attempt lama berlangsung `1322 ms` dan memakai enam environment keys. Tidak ada inference atau direct OS containment test pada attempt tersebut. Root cause error 203 tetap belum terkonfirmasi. Review ini melanjutkan [S3 next decision](M02-02S3_NEXT_CONTAINMENT_DECISION.md), tanpa mengubah laporan sebelumnya.

## 3. Actual environment and preflight

Project aktual: `D:\Rajendra\AI-Projects\AI-Office`. Host yang dibaca pada S4: Microsoft Windows 11 Home Single Language, 64-bit, `10.0.26300`; registry build `26300.9711`, release `26H2`. Ini pembacaan aktual, bukan asumsi dari milestone lama.

Metadata global package yang dibaca ulang: base `0.162.1`, optional Windows package `npm:@openai/codex@0.162.1-win32-x64`. Native executable lama berukuran `333479728` bytes, SHA-256:

```text
DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A
```

Command resolution diperiksa read-only; ordinary PATH tidak dipakai untuk menjalankan candidate. Active Codex VS Code process PID `21476` diidentifikasi terpisah dan tidak disentuh. Seluruh global package tree lama, **50 files**, menjadi baseline hash.

OS-temp berada pada NTFS. Free space awal `7444312064` bytes; Node pre-create `7466397696` bytes, melampaui batas preflight 2 GiB. Root baru disposable, bukan source, active installation/home, retained fixture, Hermes3D, atau cloud project. Path/ownership/reparse review dilakukan sebelum extraction dan execution. Node/npm `24.21.0`/`11.19.0` adalah evidence historis, **tidak dijalankan ulang untuk verifikasi versi pada S4**. System `tar.exe` yang sudah tersedia dipakai; tidak menginstal software.

## 4. Acquisition source and release identity

Satu route dipilih: official GitHub full CLI bundle; tidak memakai npm acquisition atau menggabungkan distribution berbeda. Official release [rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0) diverifikasi ulang melalui metadata `openai/codex`, non-draft, non-prerelease, published `2026-10-23T04:48:10Z`. Tagged source commit: `6aaac694803004a63c6f393d153c96d22521a6b9`.

Exact asset: [codex-package-x86_64-pc-windows-msvc.tar.gz](https://github.com/openai/codex/releases/download/rust-v0.164.0/codex-package-x86_64-pc-windows-msvc.tar.gz), asset ID `667993208`. Download dimulai `2026-10-29T10:08:07.949Z`, durasi `36462 ms`; final download host `release-assets.githubusercontent.com`. Signed redirect query tidak dicatat. Tidak memakai `latest`, mirror, installer, global install, lifecycle scripts, updater, atau build sendiri.

## 5. Package metadata and safe extraction

Published dan downloaded size sama: **167144380 bytes**. Streaming download dibatasi ukuran dan di-hash; exclusive owned `.partial` baru di-rename setelah integrity cocok. Sebelum extraction, system tar listing menampilkan **51 entries**, hanya directories dan regular files. Review menolak absolute paths, traversal/dot segments, target escape, unsafe Windows characters/reserved names/trailing dot-space, duplicate case-fold paths, links dan special files. Candidate destination kosong dan tidak direparse.

Extraction flags: `--no-same-owner --no-same-permissions --no-acls --no-xattrs --no-fflags`. Tidak menerapkan archive ACL/owner/permissions. Post-extraction ditemukan **45 regular files**, total **483688315 bytes**, tanpa symlink, reparse, special file, atau hardlinked file.

`codex-package.json` menyatakan:

```json
{
  "layoutVersion": 1,
  "version": "0.164.0",
  "target": "x86_64-pc-windows-msvc",
  "variant": "codex",
  "entrypoint": "bin/codex.exe",
  "resourcesDir": "codex-resources",
  "pathDir": "codex-path"
}
```

Entrypoint, resource/path directories, `codex-command-runner.exe` dan `codex-windows-sandbox-setup.exe` tersedia. Bundle juga memuat code-mode host, rg dan voice resources; tidak ada yang dijalankan langsung sebagai eksperimen tambahan. **Gate A PASS sebelum candidate execution.**

## 6. Integrity, architecture and Authenticode

Published asset digest dan downloaded archive SHA-256 identik:

```text
700116be3143576d006467af8576f7f4c9dada1feddfdb7f69743bfde0997018
```

Sebelum candidate execution, tiga PE yang relevan diperiksa; semuanya `0x8664` AMD64, PE signature valid, Authenticode **Valid**, signer **OpenAI OpCo, LLC**.

| Relative path dalam candidate | Bytes | SHA-256 |
|---|---:|---|
| `bin/codex.exe` | 354558768 | `6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36` |
| `codex-resources/codex-command-runner.exe` | 8743216 | `30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB` |
| `codex-resources/codex-windows-sandbox-setup.exe` | 18793264 | `2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF` |

Digest membuktikan kecocokan archive dengan metadata release; Authenticode adalah verifikasi signer executable yang terpisah. Keduanya tidak membuktikan seluruh dependency aman atau OS containment efektif. Helpers tidak dijalankan langsung untuk menguji signature atau memperbaiki host.

## 7. Side-by-side isolation

Absolute executable yang digunakan hanya `<S4_ROOT>\candidate\bin\codex.exe`; cwd hanya `<S4_ROOT>\workspace`. Candidate tidak didaftarkan sebagai default, tidak mengganti npm shims/package lama, tidak ditambahkan ke user/system PATH, dan tidak dikonfigurasi untuk VS Code. Tidak ada global upgrade/downgrade, Git initialization, atau source integration.

50/50 hashes global package lama cocok sesudah attempt; native hash lama tetap sama. Parent process PATH fingerprint sebelum/sesudah juga cocok. Ini tidak mengklaim checksum seluruh VS Code installation atau user/machine environment registry; area tersebut tidak dimutasi oleh tindakan task.

## 8. Disposable CODEX_HOME and initialization finding

`<S4_ROOT>\isolated-home` dibuat terlebih dahulu, terpisah dari real Codex home. Config sintetis hanya `cli_auth_credentials_store = "ephemeral"` dengan newline, `41` bytes. Override yang sama diberikan lewat CLI. Tidak menyalin auth, sessions, transcripts, credential caches, `.sandbox-secrets`, skills, atau account config.

Source [ephemeral storage](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/login/src/auth/storage.rs) memakai empty per-process in-memory map, bukan file/keyring backend. Review [cloud-config service](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cloud-config/src/service.rs) menunjukkan no-auth path tidak membentuk authenticated cloud-config request. Ini mendukung desain no-account startup; bukan syscall/network forensic attestation.

**Observed finding:** version/help tidak menghasilkan alias warning, tetapi normal CLI initialization membuat `<home>\tmp\arg0-windows\...` berisi zero-byte `.lock` serta `applypatch.bat` dan `apply_patch.bat`. Keduanya menunjuk candidate, bukan installation aktif, dan **tidak dieksekusi langsung**. Sebelum MXC, execution ditahan untuk read-only review; tidak ada installer/helper tambahan yang dijalankan untuk melanjutkan.

Review [arg0 initialization](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/arg0/src/lib.rs) dan [home-dir resolution](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/utils/home-dir/src/lib.rs) menemukan home canonicalization dan lexical temporary-path comparison. Node OS-temp root memakai 8.3 spelling; long dan short spelling diperiksa memiliki physical dev/inode identik. Perbedaan string ini merupakan **penjelasan yang konsisten dengan source**, bukan runtime trace yang membuktikan cabang guard. Guard tidak diubah, env tidak diganti untuk memaksa hasil, alias tidak dibuat manual, dan tidak ada cleanup bypass. Absennya warning bukan bukti guard diperbaiki atau security meningkat.

Temuan dibatasi pada standard scoped CLI initialization dalam owned home. Final alias directory `codex-arg0m2Ot3R`; directory saat help `codex-arg0gg1uRO` tidak lagi ada setelah normal stale-helper cleanup oleh CLI sendiri. Operator tidak menghapusnya. Canonical-path guard behavior tetap caveat untuk future review.

## 9. Windows environment allowlist and rationale

Input native process menggunakan **tepat sembilan keys**, sama untuk version, help, dan satu MXC attempt. Tidak memakai full `process.env` inheritance atau mencatat raw PATH/profile values.

| Key | Rationale / validation |
|---|---|
| `SystemRoot` | Actual host Windows directory, nonempty, existing directory dan path metadata direview. |
| `WINDIR` | Actual host Windows directory dengan Windows case-insensitive semantics. |
| `ComSpec` | Actual existing host executable; canonical identity cocok dengan trusted system `cmd.exe`. |
| `SystemDrive` | Actual valid existing host drive root; prerequisite parent-native MXC source direview. |
| `LOCALAPPDATA` | Actual nonempty existing host directory, metadata saja; contents tidak ditelusuri. |
| `PATH` | Child-scoped candidate `codex-path` ditambah reviewed Windows System32; tidak memakai ordinary Codex resolution. |
| `TEMP` | Child-scoped owned S4 root; bukan perubahan global TEMP. |
| `TMP` | Child-scoped owned S4 root; bukan perubahan global TMP. |
| `CODEX_HOME` | Pre-created isolated synthetic home di owned root. |

System inputs tidak ditebak. `USERPROFILE`, provider/API keys, proxy credentials, `NODE_OPTIONS`, account/session context, dan unrelated inherited keys tidak diteruskan. Metadata directory/file types dan unexpected redirection diperiksa tanpa environment-value dump. TEMP/TMP menunjuk root S4, bukan child `temp`; output tetap di owned root. Tidak mengubah parent/OS environment untuk memperbaiki hasil.

Ini adalah input env untuk native candidate; effective internal SDK/target environment tidak di-dump. Secret exclusion dari input tidak sama dengan bukti OS menolak pembacaan credential files. **Gate B/C PASS dalam batas tersebut.**

## 10. Managed requirements and permission profile

Command memakai `-c windows.sandbox=mxc`, `--include-managed-config`, `--permission-profile :workspace`. Candidate help mengonfirmasi flags; source sandbox/cloud-config path direview sebelum attempt. Tidak menghapus managed requirements, mengedit global config, mengganti profile ke unrestricted, atau memilih legacy/unelevated/elevated fallback.

`cli_auth_credentials_store="ephemeral"` adalah scoped credential-store override untuk synthetic home; bukan penghapusan managed-security validation. Profile dan include-managed-config diterima tanpa policy-validation error. **Tidak ada effective merged-policy dump atau independent kernel/API trace**. C10 VERIFIED terbatas pada penggunaan flag/validation path dan tidak adanya policy mutation oleh task; seluruh effective restrictions tetap NOT VERIFIED. C11 memverifikasi explicit requested MXC dan keberhasilan command pada documented selection path, bukan seluruh OS enforcement.

## 11. Candidate version/help observations

| Check | Start UTC | Native PID | Exit | Duration | Output |
|---|---|---:|---:|---:|---|
| `-c cli_auth_credentials_store="ephemeral" --version` | 2026-10-29T10:12:03.495Z | 30736 | 0 | 640 ms | `codex-cli 0.164.0\n` |
| `-c cli_auth_credentials_store="ephemeral" sandbox --help` | 2026-10-29T10:12:04.154Z | 9192 | 0 | 51 ms | Sandbox usage dan kedua profile/managed flags tersedia. |

Kedua stderr kosong. Tidak ada auth, installer atau elevation prompt. Normal home alias initialization ditinjau pada section 8 sebelum startup. Tidak ada model turn, update, app-server, atau direct helper invocation. **Gate D PASS setelah review.** Version/help bukan tambahan sandbox attempts.

## 12. Exact permitted startup command

Berikut reproduksi argument vector aktual dengan root personal direduksi menjadi placeholder; **bukan instruksi untuk menjalankan ulang**:

```text
<S4_ROOT>\candidate\bin\codex.exe -c cli_auth_credentials_store="ephemeral" -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- C:\Windows\System32\cmd.exe /d /c echo MXC_OK
```

Executable dan system cmd diberikan sebagai absolute paths dengan argv terpisah; cwd `<S4_ROOT>\workspace`. Native launch menggunakan ignored stdin, captured stdout/stderr, hidden window, timeout `10000 ms`, maxBuffer `65536` bytes. Tidak mengeksekusi script unduhan/project command. Exclusive `mxc-attempt-issued.json` dibuat sebelum spawn, attempt `1`, max `1`, noRetry; historical `mxcAttempts: 0` di preflight adalah keadaan awal, bukan final counter.

## 13. Actual startup observation

| Field | Actual evidence |
|---|---|
| Start UTC / WIB | `2026-10-29T10:15:23.927Z` / `29 Oktober 2026 17:15:23.927 WIB` |
| Candidate | Official 0.164.0; executable SHA-256 pada section 6. |
| Native launcher PID | `31512` |
| Launch count | **1/1; tidak diulang** |
| Exit / signal / error | `0` / `null` / `null` |
| Stdout | `MXC_OK\r\n` |
| Stderr | Empty string |
| Duration | `1156 ms` |
| Cwd / home | Owned synthetic workspace / pre-created isolated home. |
| Sandbox / profile | Explicit `mxc` / `:workspace`, managed inclusion enabled. |

Angka exit `0` di atas milik **native candidate**, bukan semata-mata exit Node recorder. Recorder juga selesai exit `0`. Tidak terjadi timeout, warning, authentication, privilege request, atau fallback yang teramati. Tidak ada sandbox log pada synthetic `<home>\.sandbox\sandbox.log`; active home tidak dicari.

## 14. Startup classification

**Gate E PASS — MXC_STARTUP_VERIFIED — CODEX 0.164.0 — TESTED CONFIGURATION ONLY.** Verified official candidate menghasilkan expected echo dan exit zero dalam satu bounded attempt. Explicit MXC dipilih menurut [official Windows sandbox documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox); tidak ada retry lewat sandbox lain.

Harmless echo tidak mencoba akses file di luar cwd, credential store, database, network, atau hostile descendant. Tidak ada bukti untuk menaikkan broader M02-02S OS security gate ke VERIFIED. Seluruh langkah eksekusi S4 berhenti setelah attempt ini.

## 15. Comparison with 0.162.1

| Dimension | Prior S / 0.162.1 | Actual S4 / 0.164.0 |
|---|---|---|
| Distribution | Existing npm native installation | Fresh official full GitHub CLI bundle, side-by-side. |
| Environment keys | Six: SystemRoot, WINDIR, PATH, TEMP, TMP, CODEX_HOME | Nine; adds validated ComSpec, SystemDrive, LOCALAPPDATA. |
| PATH/home/temp | Prior synthetic fixture | New owned candidate paths/home/temp, OS-temp 8.3 spelling. |
| Credential configuration | Historical synthetic setup | Synthetic ephemeral config plus explicit CLI override. |
| Implementation | Prior MXC implementation | Tagged release includes `mxc-sdk` migration. |
| Result | Exit 1, empty stdout, error 203, 1322 ms | Exit 0, MXC_OK, empty stderr, 1156 ms. |

Ini bukan controlled single-variable experiment. Version, bundle, startup environment, SDK dan path spelling berbeda; hasil hanya menetapkan compatibility kombinasi aktual S4.

## 16. SDK migration interpretation

S3 source ancestry review menempatkan [PR #54027](https://github.com/openai/codex/pull/54027) pada source 0.164.0 dan tidak pada 0.162.1. Perubahan Windows environment ini relevan terhadap parent startup prerequisites. [PR #54069](https://github.com/openai/codex/pull/54069) berkaitan dengan remote MCP filtering dan hanya relevan tidak langsung. [PR #55378](https://github.com/openai/codex/pull/55378) memigrasikan MXC ke SDK; bootstrap/helper/profile behavior juga dapat berbeda.

Success tidak membuktikan PR #54027 sendirian memperbaiki error 203. Tidak dilakukan source build, A/B SDK comparison, second env variation, atau old-version retry untuk mengisolasi sebab.

## 17. Remaining causal uncertainty

Root cause error 203 lama **UNKNOWN**. Efek masing-masing normalization, added environment inputs, SDK migration, helper layout, profile resolution, serta path spelling **tidak diisolasi**. Startup success tidak membuktikan semua Windows builds, alias guards, managed-policy combinations, atau future executions kompatibel.

Tidak ada forensic syscall/kernel trace, complete effective-policy dump, resource-access probes, atau target-process environment dump. No-auth design didukung source review dan no-auth observations; ini tidak merupakan audit seluruh akses OS internal. Paket yang cocok release digest dan valid signatures juga bukan sertifikasi sandbox security.

## 18. Process cleanup and accounting

Read-only process inspection sesudah attempt mengonfirmasi PIDs `30736`, `9192`, dan `31512` telah keluar. Tidak ditemukan owned process dengan command line root ID S4 atau `MXC_OK`. Tidak ditemukan owned candidate/code-host/Node/cmd yang tersisa dari launch. Active VS Code PID `21476` masih ada dan tidak diterminasi. Tidak ada process kill berdasarkan nama atau cleanup arbitrary process.

Foreground cmd PID tidak dicapture terpisah; synchronous candidate completion, expected stdout dan exit `0` mendukung command selesai. Ini bounded process accounting, bukan pembuktian hostile/detached process-tree confinement. Tidak ada listener di ports `43123`/`43124` pada accounting check; task tidak membuat listener/network probe. Tidak menjalankan backend/frontend/WSL.

## 19. Artifact retention and internal local locator

**Seluruh satu owned root dipertahankan; tidak ada operator cleanup/deletion.** Exact local root berikut untuk internal Owner review, jangan bagikan raw evidence tanpa redaction:

```text
C:\Users\USEPRE~1\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW
```

Short/long spelling menunjuk physical root yang sama; ini bukan root kedua. Relative retained artifacts:

| Location | Contents |
|---|---|
| `acquisition/` | Exact official archive, 167144380 bytes. |
| `candidate/` | 45 official files; main CLI, package manifest, helpers/resources/path directory, bundled auxiliary assets. |
| `isolated-home/config.toml` | Synthetic ephemeral-only config. |
| `isolated-home/tmp/arg0-windows/codex-arg0m2Ot3R/` | `.lock`, `applypatch.bat`, `apply_patch.bat` from normal scoped CLI initialization. |
| `workspace/` | Empty synthetic cwd, also empty after attempt. |
| `evidence/preflight.json` | Owned path/host preflight; includes private local metadata, not public support content. |
| `evidence/acquisition.json` | Source, size, digest and successful comparison. |
| `evidence/archive-review.json`, `extraction.json`, `signatures.json` | Member/path/layout/signature review. |
| `evidence/version.json`, `sandbox-help.json` | Read-only candidate checks. |
| `evidence/home-initialization-review.json` | Physical root identity and observed temporary aliases before launch. |
| `evidence/mxc-attempt-issued.json`, `mxc-startup.json` | Single-attempt issuance receipt and actual native result. |
| `evidence/final-inventory.json` | Relative paths, size and SHA-256 for 60 files; excludes itself explicitly. |

Final owned-root count **61 files**, **650859526 bytes** including inventory. Inventory covers **650848025 bytes** excluding its own `11501` bytes. No npm cache/install tree created. Candidate tidak didaftarkan/default PATH dan tidak boleh diluncurkan lagi atas allowance S4. Retention tidak berarti production installation. Future removal memerlukan exact ownership/path validation dan izin yang berlaku; tidak menghapus historical fixtures atau bypass policy.

## 20. Source/system change-safety verification

Hash baseline diambil sebelum acquisition/execution dan dibandingkan sesudah actual launch; final report-addition check memastikan hanya dua nama S4 baru. Batas bukti dibedakan berikut.

| Inspected scope | Result |
|---|---|
| AI Office existing files outside node_modules | **110/110 SHA-256 unchanged**; final inventory **112 files**, tepat dua laporan S4 ditambahkan. |
| Application source, tests, contracts, SQLite schema, package/lockfile, config, prior reports, existing screenshots | Tercakup 110 protected files; tidak berubah, tidak diregenerasi. Tidak mengklaim semua external/live DB files di host di-hash. |
| Existing global Codex package tree | **50/50 SHA-256 unchanged**, executable 0.162.1 hash tetap pada section 3. |
| Historical fixtures QHnCi9 / TLkI1Y / nUSJvQ | **22/22, 22/22, 6/6 hashes unchanged**; semuanya retained. |
| Hermes3D tracked files | **647/647 SHA-256 unchanged**. HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`; existing ` M package-lock.json` tetap pre-existing, tidak diperbaiki. |
| Parent PATH | Pre/post SHA-256 fingerprint cocok; raw value tidak dipublikasikan. Tidak mengedit user/system PATH. |
| Active auth/global config/VS Code installation | Tidak dibaca/copied/mutated oleh operator untuk eksperimen; auth-store avoidance didukung scoped ephemeral source review. Tidak di-hash, sehingga bukan checksum/forensic attestation. |
| External Visual Lab assets | Tidak ditulis; tidak diklaim checksum-audited. |

Ready screenshot baseline SHA-256 `B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2`; mobile `C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640`, keduanya unchanged dalam protected baseline.

Tidak ada npm global install; active config/security/ACL/firewall/feature/admin changes; real credential copying; provider login/logout; app-server; inference; worker; paid API/credit fallback; WSL; unauthorized direct helper execution; Git init; atau cleanup-policy bypass. Pernyataan ini adalah audit tindakan task dan observed startup, bukan full-host mutation telemetry. Source/global installation tidak perlu rollback karena tidak diganti.

Ordinary regression/backend/browser tests **tidak dijalankan ulang**, sesuai no-code-change scope. M01 `300 PASS, 1 SKIPPED`, runtime-security `60 PASS` (termasuk 11 atomic issuance regressions), browser E2E `2 PASS` adalah **historical evidence**, bukan hasil S4.

## 21. Remaining real-worker blockers

C19–C21: direct OS read/write denial, private SQLite/fake credential isolation, network/loopback/proxy controls, junction/new-file boundaries, dan child-process confinement belum diuji. C22: actual app-server protocol, real approvals/cancellation, runtime skill controls, failure recovery, durable leases/cross-process dedup dan auditability belum diverifikasi. C23 subscription entitlement/model availability UNKNOWN; C24 included-only billing enforcement NOT VERIFIED. Paid API dan credit fallback tetap tidak diotorisasi. C25 **REAL WORKER BLOCKED**, termasuk M02-03 runtime integration.

Host-security regression historis dan harmless echo tidak memenuhi gate-gate ini. Tidak mengubah architecture/roadmap/status lama agar terlihat siap.

## 22. Recommended next bounded action and Owner review

Rekomendasi: **M02-02S5 — Bounded Direct OS Containment Validation**, hanya melalui task/authorization terpisah. Rancangan perlu synthetic Project A/B, fake private state/fake credentials tanpa data nyata, baseline host accessibility, explicit effective minimal policy, positive A read/write dan negative B/private read/write, new files/junction boundaries, serta independently bounded network/child-process controls. Profile `:workspace` saat ini tidak otomatis menjamin deny reads di luar A; minimal policy harus ditinjau dahulu.

Owner perlu menyetujui scope probe, disposable paths/data, commands/attempt budget, process deadlines, policy expectations dan evidence retention sebelum pelaksanaan. Credential/billing/account/API/app-server/worker atau global upgrade tidak termasuk persetujuan S4; masing-masing tetap memerlukan scope baru. Tidak mengirim support package atau mengubah S2 draft. S5/M02-03 **belum dimulai** dan tidak dijalankan otomatis setelah success ini.

**M02-02S4 COMPLETE — CODEX 0.164.0 MXC STARTUP VERIFIED — OS CONTAINMENT STILL NOT VERIFIED — REAL WORKER BLOCKED.**
