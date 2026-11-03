# M02-02S1 — Containment Decision Matrix

Tanggal: 29 Oktober 2026, Asia/Jakarta. Evidence utama: [MXC Diagnostic Report](M02-02S1_MXC_DIAGNOSTIC_REPORT.md). Identifiers dan status berbahasa Inggris; penjelasan berbahasa Indonesia.

**DIAGNOSTIC COMPLETE — MXC STARTUP STILL BLOCKED.** S1 menjalankan **0 additional MXC launches**. **RETEST NOT RUN — UNSATISFIED SAFETY PRECONDITION**: belum ada actionable environment/path correction yang didukung bukti spesifik. Real worker **BLOCKED**. S1 tidak mengulang error 203; error tersebut tetap evidence actual dari S.

## A. Diagnostic status

Status VERIFIED di sini dibatasi pada observasi yang disebut, bukan pembuktian OS containment. UNKNOWN berarti penyebab/keadaan belum diketahui; NOT VERIFIED berarti bukti belum cukup; NOT RUN berarti tindakan tidak dijalankan; FAILED adalah kegagalan aktual historis yang dirujuk.

| Objek | Status | Evidence dan batas |
|---|---|---|
| Windows/Node/npm | VERIFIED metadata | Home Single Language x64, 26300.9711/26H2; Node 24.21.0/npm 11.19.0 |
| Binary identity | VERIFIED | Main SHA-256 DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A, sama dengan S; 333,479,728 bytes, PE AMD64, signature Valid |
| CLI version | VERIFIED package/historical version correlation | Base/layout 0.162.1, platform 0.162.1-win32-x64; same binary dengan actual --version S. --version S1 NOT RUN |
| Error 203 mapping | VERIFIED reference | ERROR_ENVVAR_NOT_FOUND; exact key/root cause UNKNOWN |
| Origin of error text | VERIFIED source correlation | Pinned SDK generic formatter menerima Win32 launch-error code; teks tidak membuktikan exact native API |
| Actual native failure/API internals | UNKNOWN | Tidak ada API trace/extended_error pada captured stderr. Source bukan binary runtime trace |
| Current environment metadata | VERIFIED dalam narrow allowlist | Windows path candidates SET dan metadata-readable; PATH 28/28 entries ada; current CODEX_HOME/CODEX_SQLITE_HOME MISSING; values tidak diterbitkan |
| Failed environment reduction | VERIFIED dari S manifest | Enam key eksplisit, bukan full inheritance; actual final target environment NOT VERIFIED |
| Required missing environment key | UNKNOWN | Omission beberapa key terkonfirmasi, kewajibannya tidak teridentifikasi; tidak ditebak |
| Temporary home/cwd existence | VERIFIED metadata + historical preparation | Existing owned S root, home/cwd ada; inspected tree tanpa reparse entries |
| Complete home/startup validity | NOT VERIFIED | Existing directory tidak menjamin semua launcher requirements; warning alias tetap ada pada S |
| CODEX_SQLITE_HOME override | VERIFIED absence pada launcher/current metadata | Tidak ada explicit key atau synthetic sqlite_home option; actual effective storage NOT VERIFIED |
| Helper/resource metadata | VERIFIED untuk checked files | Entrypoint/resources/path dirs ada; command-runner dan sandbox-setup files ada, signatures Valid; tidak dieksekusi |
| Complete package/runtime dependency integrity | NOT VERIFIED | Tidak ada full reference inventory/load trace; tidak menginstal atau menjalankan helper |
| Alias guard mechanism | VERIFIED source/warning correlation | Temporary CODEX_HOME sesuai release guard; sebab error 203 UNKNOWN; guard tidak dibypass |
| Managed config flags | VERIFIED historical argv/source intent | --include-managed-config dan :workspace dipakai; tidak dimatikan |
| Effective merged policy | NOT VERIFIED | Tidak ada successful effective-profile output; global config/requirements tidak dibuka/diubah |
| Synthetic sandbox.log | VERIFIED MISSING | Exact allowed home path diperiksa; tidak mencari log pada home aktif |
| MXC compatibility attempt S | FAILED | Exit 1/error 203, 1322 ms, stdout kosong; no MXC_OK |
| S1 controlled retest | NOT RUN | 0/1; actionable-adjustment precondition belum terpenuhi; tidak ada exit/stdout/stderr baru |

Dasar referensi: [Win32 errors](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-), [environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables), [pinned MXC diagnostics](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/launch_diagnostics.rs). Fakta dokumentasi tidak dihitung sebagai local enforcement PASS.

## B. Sandbox status

| Gate | Status | Bukti/batas |
|---|---|---|
| MXC startup | FAILED / BLOCKED | Actual S command gagal; S1 tidak menambah launch |
| Effective bounded permission profile | NOT VERIFIED | Requested :workspace bukan effective attestation atau deny-read proof |
| Direct allowed Project A read/write | NOT RUN | Tidak ada sandbox yang berhasil menjalankan fixed probe |
| Direct read isolation | NOT VERIFIED | Tidak ada actual denied IO |
| Direct write isolation | NOT VERIFIED | Tidak ada actual denied IO |
| Project A/B isolation oleh OS | NOT VERIFIED | Host policy evidence tidak menggantikan sandbox enforcement |
| Private state protection | NOT VERIFIED | Full containment fixture tidak dibuat/diuji |
| Credential isolation | NOT VERIFIED | Empty synthetic home membantu menghindari auth startup; tidak membuktikan hostile credential boundary |
| Alias/junction/reparse escape | NOT RUN | Metadata no-reparse fixture bukan negative escape test |
| Cooperative descendants | NOT RUN pada S/S1 | Existing host cooperative tests tetap historical, bukan MXC proof |
| Hostile/detached descendants | NOT VERIFIED | Tidak ada hostile process test |
| Network restrictions | NOT VERIFIED | Tidak ada socket/DNS/loopback probe; implementation/policy dependent |
| File-creation timing | NOT VERIFIED | New denied files/snapshot/race belum diuji |
| Failed-launch cleanup | VERIFIED terbatas pada host accounting | Tidak ada task-owned process/listener aktif pada pemeriksaan; bukan whole sandbox tree proof |

Tidak ada OS FILESYSTEM CONTAINMENT VERIFIED. Bahkan startup echo sukses pada masa depan hanya akan memenuhi startup gate, bukan seluruh tabel.

## C. Runtime gates

| Gate | Status | Kebutuhan sebelum worker |
|---|---|---|
| Codex app-server compatibility | NOT RUN / BLOCKED | Official protocol/pinned interface/permission mapping; tidak memulai app-server pada S1 |
| Runtime approval | NOT VERIFIED | Actual approval events dan scope enforcement, bukan simulated host response |
| Cancellation | NOT VERIFIED untuk real runtime | Actual interrupt/owned process lifetime dan uncertain outcome |
| Durable lease | NOT VERIFIED | Production cross-process authoritative ownership/lease |
| Crash recovery | NOT VERIFIED | Durable journal dan reconciliation setelah crash/reconnect |
| No duplicate execution | NOT VERIFIED | R01 historical fix hanya satu in-process SyntheticContextAuthority; bukan global durable dispatch dedup |
| Provider account eligibility | UNKNOWN / BLOCKED | Tidak membaca akun/auth atau menghubungi provider |
| Included-only billing control | NOT VERIFIED / BLOCKED | Enforce applicable limits tanpa API-key/paid-credit fallback |
| Skill enforcement | NOT VERIFIED / BLOCKED | Skills tetap OFF; metadata bukan execution enforcement |
| Worker auditability | NOT VERIFIED | Sanitized real runtime events/artifact validation; tidak ada real worker pada S1 |
| Worker activation | BLOCKED | Wajib seluruh gate yang berlaku serta otorisasi Owner atas task spesifik |

Personal-local architecture tetap: Owner → Policy Gateway → deterministic orchestration → verified runtime security boundary → official adapter → worker. Project State tetap authoritative di trusted host. Tidak ada adapter/API/schema/lease baru diimplementasikan.

## D. Recommendations dan approval boundaries

| Opsi | Status / keputusan |
|---|---|
| Continue MXC validation sekarang | BLOCKED; no additional launch pada S1, tidak ada blind retry |
| Seek official support | REQUIRES OWNER APPROVAL untuk submission; redacted draft/checklist lokal sudah tersedia di report section 16; belum dikirim |
| Bounded environment remediation | REQUIRES OWNER APPROVAL pada task berikutnya setelah exact prerequisite didukung bukti; tidak ada fix yang teridentifikasi sekarang |
| Evaluate WSL2 | Dokumentasi/evidence lama saja; actual distro boundary NOT VERIFIED. Distro tidak dimulai; eksperimen membutuhkan task terpisah |
| Remain BLOCKED | Keputusan saat ini untuk real worker, direct containment progression dan actual provider runtime |

**Satu next bounded task usulan: M02-02S2 — Redacted MXC Support Evidence Review (read-only).** Owner mereview draft lokal dan pertanyaan kepada maintainer tentang required nonsecret environment dan sanitized API-specific diagnostic. Tidak mulai task tersebut sekarang; external posting/upload, instrumentation, environment change, test launch, binary upgrade atau OS setup tidak termasuk izin implisit.

WSL2 kelak harus membuktikan mounts/interop/Windows process access, credential separation, cross-project ownership, descendant cleanup, network, app-server compatibility dan trusted Project State transport. [WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config). Availability Ubuntu WSL2 pada S bukan containment PASS.

## E. Change safety dan final comparison

Actual comparison pre/post S1:

| Objek | Hasil |
|---|---|
| AI-Office initial files di luar node_modules | **104/104 hashes unchanged**; inventory akhir 106 file, hanya dua report S1 baru |
| Source/contracts/SQLite schema/security harness/tests/package/config | Tidak berubah, tercakup baseline hash di atas |
| Accepted screenshots | Tidak berubah; shell-ready SHA-256 B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2; shell-mobile C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640 |
| Historical fixture ai-office-m0202-QHnCi9 | **22/22 hashes unchanged**; retained |
| Historical fixture ai-office-m0202-TLkI1Y | **22/22 hashes unchanged**; retained |
| S fixture ai-office-m0202s-nUSJvQ | **6/6 hashes unchanged**; retained, no log baru |
| Hermes3D tracked scope | **647/647 hashes unchanged**; HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing ` M package-lock.json` tetap |
| Process/listener accounting | Tidak ada task-owned process aktif atau listener port 43123/43124; tidak ada Codex/helper/child baru yang diluncurkan oleh S1 |
| Regresi S1 | NOT RUN; historical S/R1 typecheck PASS, 300 PASS/1 SKIPPED dan 60 security PASS tidak diklaim rerun |
| Writes | Hanya dua Markdown report S1; tidak ada new temp fixture/copy/downloaded executable |

Hash verification tidak mencakup node_modules seluruhnya, seluruh OS/global profile, semua untracked Hermes files atau external Google AI Studio assets. Tidak ada write ke area tersebut oleh task. No actual credentials/auth/model/paid API/app-server, no WSL startup/install/elevation/security mutation/global config change/cleanup bypass. Tidak ada unrelated process yang dihentikan.

## F. Owner review dan stop

Owner perlu menilai incomplete diagnostic conclusion dan next read-only support-review scope. External submission atau eksperimen berikutnya membutuhkan otorisasi eksplisit sesuai instruksi M02-02S1 sections 16/22/24. Tidak meminta izin ulang untuk pekerjaan S1; pekerjaan yang diotorisasi sudah ditutup melalui dua laporan ini.

**M02-02S1 DIAGNOSTICS COMPLETE — MXC STARTUP BLOCKED — REAL WORKER BLOCKED.**
