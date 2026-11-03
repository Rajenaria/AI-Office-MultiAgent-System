# M02-02S1 — Safe MXC Launch Diagnostics

Tanggal: 29 Oktober 2026, Asia/Jakarta. Root aplikasi: `D:\Rajendra\AI-Projects\AI-Office`. Companion: [Containment Decision Matrix](M02-02S1_CONTAINMENT_DECISION_MATRIX.md).

## 1. Executive summary

**DIAGNOSTIC COMPLETE — MXC STARTUP STILL BLOCKED.** Pemeriksaan read-only menemukan asal pesan diagnostik generik, menjelaskan helper alias rejection, memverifikasi binary/package metadata dan keadaan fixture, serta mengonfirmasi bahwa environment percobaan sebelumnya sengaja dipangkas. Belum ada bukti yang mengidentifikasi variabel wajib yang hilang atau koreksi test-only yang cukup spesifik untuk membedakan penyebab kegagalan.

**RETEST NOT RUN — UNSATISFIED SAFETY PRECONDITION.** Jumlah tambahan MXC launch pada S1: **0** dari maksimum 1. Tidak ada invocation Codex baru, tidak ada fixture baru, tidak ada perubahan environment/config, dan tidak ada fallback. Prasyarat retest nomor 1 belum terpenuhi pada tingkat yang diperlukan untuk mengubah environment: perubahan yang jelas dan didukung bukti belum ditemukan. Hipotesis environment tetap PLAUSIBLE, bukan dasar menebak nilai baru. Diagnosis selesai dengan ketidakpastian yang tercatat; root cause belum CONFIRMED.

Temuan utama: kalimat `CreateProcessInSandbox failed with error code ...` adalah generic fallback formatter dalam dependency MXC. Code path tersebut menerima Win32 error; nama di pesan bukan bukti tunggal bahwa fungsi bernama Experimental_CreateProcessInSandbox yang gagal. Perbedaan ini memperjelas laporan S sebelumnya tanpa mengedit evidence historis.

Real worker **BLOCKED**. Startup MXC, filesystem containment, app-server, account/billing, dan production recovery tetap belum terbukti. Tidak memulai S2 atau M02-03.

## 2. Baseline dan reported M02-02S failure

Dokumen berikut ditinjau sebagai evidence historis, dengan fokus pada batas acceptance dan runtime gates:

- `M01-07_FOUNDATION_ACCEPTANCE_REPORT.md`.
- `M02-01_CODEX_RUNTIME_FEASIBILITY.md` dan `M02-01_NEXT_POC_GATE_PLAN.md`.
- `M02-02_SECURITY_HARNESS_REPORT.md` dan `M02-02_RUNTIME_GATE_MATRIX.md`.
- `M02-02R_SECURITY_CLOSEOUT.md` dan `M02-02R_OS_CONTAINMENT_TEST_PLAN.md`.
- `M02-02R1_ATOMIC_ISSUANCE_REPORT.md`.
- `M02-02S_WINDOWS_CONTAINMENT_REPORT.md` dan `M02-02S_OS_RUNTIME_GATE_MATRIX.md`.

Source context/R01 dan package scripts juga ditinjau. Seluruh 104 file awal AI-Office di luar node_modules di-hash sebelum penulisan laporan. Semua 102 file protected sebelum S masih cocok dengan baseline hash yang tersedia; dua laporan S ikut menjadi protected baseline S1. Tidak ada `.git` di AI-Office dan tidak diinisialisasi.

Evidence S yang benar-benar dibaca: manifest, compatibility JSON, sandbox help JSON, metadata/inventory enam file. Command lama, setelah executable native absolut yang dipin:

```text
-c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- C:\Windows\System32\cmd.exe /d /c echo MXC_OK
```

| Item | Evidence lama yang dipertahankan |
|---|---|
| Start | `2026-10-29T08:38:57.949Z` / 15:38:57 WIB |
| Cwd | `%TEMP%\ai-office-m0202s-nUSJvQ\project-a`, kosong dan disposable |
| CODEX_HOME | `%TEMP%\ai-office-m0202s-nUSJvQ\empty-codex-home` |
| Native process | PID 29852, exit **1**, signal null, 1322 ms |
| Stdout | Kosong; tidak ada MXC_OK |
| Stderr relevan | `MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).` |
| Wrapper | Node recorder exit 0 tidak mengubah native child exit 1 menjadi PASS |
| Batas | Timeout 10 s / output 65,536 bytes pada S; bukan retest S1 |

PID historis tidak digunakan sebagai alasan membunuh proses sekarang. Tidak ada replay percobaan ini pada S1.

## 3. Windows dan CLI environment yang diverifikasi

| Komponen | Observasi S1 |
|---|---|
| Windows CIM | Microsoft Windows 11 Home Single Language, 64-bit, 10.0.26300 |
| Registry metadata | CoreSingleLanguage, 26H2, build **26300.9711** |
| Node / npm | `node --version`: v24.21.0; `npm --version`: 11.19.0 |
| Distribusi Codex | Global npm base package 0.162.1, platform package 0.162.1-win32-x64 |
| Version identity | Metadata package/layout 0.162.1; cocok dengan `codex-cli 0.162.1` yang benar-benar dijalankan pada S |
| Actual --version pada S1 | **NOT RUN**; executable bytes identik dengan binary S, bukan klaim menjalankan ulang |
| Binary | Native regular PE, machine **0x8664 / AMD64**, PE signature 0x4550 |
| Ukuran | 333,479,728 bytes |
| SHA-256 | `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A` |
| Authenticode | **Valid**, signer OpenAI OpCo, LLC, menurut pemeriksaan Windows saat ini |
| FileVersion resource | Tidak tersedia; tidak menggantikan package/actual historical version evidence |
| WSL | Evidence S: Ubuntu WSL2, Stopped; tidak menjalankan wsl.exe atau distro pada S1 |

Path executable yang disamarkan untuk laporan manusia:

```text
%APPDATA%\npm\node_modules\@openai\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\bin\codex.exe
```

Path absolut asli tetap ada pada manifest S lokal. Binary dipilih langsung, bukan alias atau npm shell shim. Tidak memakai binary VS Code, binary alternatif, update, download executable, atau installer. Signature Valid dan hash cocok membuktikan observasi identitas yang diperiksa; bukan complete supply-chain attestation atau pembuktian seluruh dependency runtime.

## 4. Package dan helper inspection

`codex-package.json` menunjukkan layoutVersion 1, target x86_64-pc-windows-msvc, variant codex, entrypoint bin/codex.exe, resourcesDir codex-resources, pathDir codex-path. Ketiga lokasi ada. Metadata bukan standalone installer cache; instalasi yang dipakai adalah npm platform bundle.

| Relative package file | Hasil metadata S1 |
|---|---|
| bin/codex.exe | Ada; hash di section 3; signature Valid |
| codex-resources/codex-command-runner.exe | Ada, 8,209,704 bytes; signature Valid; SHA-256 `4B1F3369CF4F9A1FD6ECEBB8C7CAEF0D6A33A4A3AF77650C277525D3B4E34C76` |
| codex-resources/codex-windows-sandbox-setup.exe | Ada, 17,723,696 bytes; signature Valid; SHA-256 `B30EC190AC0B43C6E4A7C26FBC533F5321674B57FE85BB7306872641BC0BD40B` |
| Other package metadata | Code-mode host, rg, voice resources dan packaged manifests terdaftar; tidak dieksekusi |

Tidak ada helper yang dijalankan langsung, disalin, diganti, diberi alias, atau diunduh. Full package completeness/dependency loading tetap **NOT VERIFIED**: tidak ada original signed inventory pembanding untuk setiap file dan tidak ada runtime load trace. Tidak ditemukan helper terpilih yang hilang pada metadata yang diperiksa.

## 5. Environment-variable diagnostic matrix

Hanya allowlist yang diminta diperiksa. Tidak mengeluarkan entire environment, nilai PATH, token, atau nama variabel lain. Metadata read access berbeda dari write access. Pemeriksaan reparse berikut hanya pada path variable itu sendiri, bukan seluruh ancestor filesystem atau isi profile.

| Variable | Current diagnostic process | Failed S launcher | Penafsiran |
|---|---|---|---|
| SystemRoot | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | Disalin dari host | Tidak ada bukti missing |
| windir | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | Disalin sebagai WINDIR | Windows variable names case-insensitive; tidak menyimpulkan missing dari kapitalisasi |
| ComSpec | SET, FILE EXISTS, metadata readable, bukan reparse entry | **Tidak diteruskan** | Perbedaan CONFIRMED; kewajiban pada failing native API UNKNOWN; target cmd lama memakai path absolut |
| PATH | SET; 28/28 entries ada; values REDACTED | OVERRIDDEN: Node directory + System32 | Pengurangan CONFIRMED; missing dependency yang relevan belum diidentifikasi |
| TEMP | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | OVERRIDDEN ke fixture S | Root fixture ada; penulisan S sudah menghasilkan evidence |
| TMP | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | OVERRIDDEN ke fixture S | Sama; tidak ada write probe tambahan |
| USERPROFILE | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | **Tidak diteruskan** | Perbedaan CONFIRMED; required-variable diagnosis belum terbukti |
| LOCALAPPDATA | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | **Tidak diteruskan** | Sama; profile tidak ditelusuri |
| ProgramData | SET, DIRECTORY EXISTS, metadata readable, bukan reparse entry | **Tidak diteruskan** | Sama; metadata tidak membuktikan requirement resolution |
| CODEX_HOME | MISSING pada current process | OVERRIDDEN ke existing synthetic home | Current default home tidak dibuka dan CLI tidak dijalankan dengan default tersebut |
| CODEX_SQLITE_HOME | MISSING pada current process | Tidak diteruskan | Tidak ada override pada synthetic config |

Writable pada path Windows/profile: **NOT VERIFIED**, karena tidak dibuat write probe. Cwd/home S terbukti dipakai untuk membuat evidence/config pada S, bukan pembuktian writable oleh sandbox.

Failed launcher tidak mewarisi seluruh environment. Manifest membatasi tepat enam key: SystemRoot, WINDIR, PATH, TEMP, TMP, CODEX_HOME. Tidak mengasumsikan inilah seluruh environment yang diterima cmd: Codex dapat memfilter/mengubah environment saat transform dan menambahkan transport state. Actual final target environment tidak teramati karena startup gagal.

Tidak ada variabel baru ditebak atau diset pada S1. Full inheritance juga tidak dicoba karena dapat meneruskan nilai sensitif atau mengubah beberapa faktor sekaligus tanpa menjelaskan requirement yang gagal. Ini bukan klaim bahwa enam-key environment sudah benar atau cukup.

## 6. Temporary CODEX_HOME

Root S adalah immediate child dari canonical OS temp menurut evidence S. S1 menginspeksi root dan setiap descendant tanpa mengikuti reparse point; tidak ada reparse entry ditemukan. Home dan cwd masih ada. Owner/default ACL sebelumnya dicatat pada S; S1 tidak mengubah ACL atau melakukan provisioning identity. Bukti sebelum-invocation berasal dari manifest/prosedur S, bukan filesystem timestamp yang dianggap membuktikan urutan sendiri.

Isi home hanya config sintetik:

```toml
cli_auth_credentials_store = "ephemeral"
```

Tidak ada auth/session/SQLite file yang dihasilkan di home tersebut. Tidak membaca real token, credential database, native keyring, .sandbox-secrets, .env akun aktif, atau transcript. Tidak memanggil Codex dengan real/default home.

Directory exists requirement terpenuhi berdasarkan evidence preparation S dan keadaan sekarang; karena itu hipotesis sederhana “CODEX_HOME belum dibuat” **NOT SUPPORTED**. Validitas penuh seluruh startup prerequisite belum terbukti. Temporary path memang memicu guard alias yang dibahas terpisah; bukan directory-not-found failure.

Official environment docs menyatakan CODEX_HOME eksplisit harus sudah ada. CODEX_SQLITE_HOME default ke CODEX_HOME; sqlite_home config memiliki precedence lebih tinggi, relative path resolve dari cwd. [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables).

## 7. CODEX_SQLITE_HOME findings

Tidak ada key tersebut pada environment lama atau current process; synthetic config tidak berisi sqlite_home. Berdasarkan documented default, tidak ada test override yang mengarahkan SQLite ke lokasi akun nyata. Tidak membuka SQLite untuk membuktikan resolusi aktual dan tidak ada state DB dalam fixture. Effective runtime storage resolution tetap **NOT VERIFIED**, bukan alasan menambahkan override baru.

## 8. Helper alias rejection

Failure JSON menyimpan warning relevan berikut, dengan personal path disamarkan:

```text
WARNING: proceeding, even though we could not create PATH aliases:
Refusing to create helper binaries under temporary dir "<S_FIXTURE>"
(codex_home: <S_FIXTURE>\empty-codex-home)
```

Source resmi pada tag rust-v0.162.1 menjelaskan release-build guard: helper alias preparation menolak CODEX_HOME yang berada di bawah std::env::temp_dir(). Pada S, TEMP/TMP menunjuk root S dan CODEX_HOME adalah descendant-nya. Kesesuaian guard dan warning **CONFIRMED sebagai penjelasan warning**. [arg0 source](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/arg0/src/lib.rs).

Hubungan warning dengan error 203 **UNKNOWN**. Tagged source juga mendispatch MXC melalui current Codex executable/hidden re-exec argument sebelum ordinary alias setup; debug_sandbox memakai current_exe sebagai wrapper. Tidak ada bukti MXC membutuhkan apply_patch alias untuk echo ini. Warning yang sama juga muncul ketika version/help S berhasil. Karena itu warning bukan bukti otomatis missing native MXC helper.

Tidak memindah CODEX_HOME keluar temp, mengubah TEMP agar guard lolos, membuat symlink/batch alias, atau menonaktifkan guard. Tindakan tersebut akan menghindari pembatasan yang secara eksplisit harus dihormati.

## 9. Managed configuration dan permission profile

Exact argv lama memakai explicit windows.sandbox=mxc, --include-managed-config, dan :workspace. Installed help yang ditangkap pada S mendukung flags tersebut. Dokumentasi saat ini masih memberikan compatibility command itu untuk CLI >=0.162.0; tidak ditemukan perubahan syntax yang menuntut upgrade. [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox).

Tagged debug_sandbox::ManagedRequirementsMode::for_profile_invocation mengikutsertakan managed requirements ketika flag diberikan. Ini **source-level intent**, bukan effective config dump dari percobaan S. Config resolution dapat melibatkan layer di luar home; empty synthetic home tidak membuktikan semua managed policy absent. [debug sandbox source](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/debug_sandbox.rs), [config basics](https://developers.openai.com/codex/config-basic).

Tidak ada policy-rejection message spesifik dalam captured stderr; ini tidak membuktikan tidak ada collision. Effective merged requirements, selected policy details dan support seluruh policy feature **NOT VERIFIED**. Tidak membaca/mengubah global config atau requirements, menonaktifkan managed config, atau memakai profile unrestricted. :workspace adalah profile compatibility, bukan bukti minimal deny-read isolation.

## 10. Sandbox log dan error 203 analysis

`<S_FIXTURE>\empty-codex-home\.sandbox\sandbox.log`: **MISSING** saat S1. Walker menemukan tepat enam file, tanpa tambahan sandbox log. Tidak mencari log di home aktif, .sandbox-secrets, atau raw session transcripts. Missing log tidak membuktikan semua OS telemetry tidak ada; hanya lokasi sintetik yang diizinkan diperiksa.

Microsoft memetakan 203 / 0xCB ke **ERROR_ENVVAR_NOT_FOUND**. Ini nama kategori error, bukan identifikasi variabel. [Win32 error mapping](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-).

Untuk menelusuri pesan, dibaca source Codex tag rust-v0.162.1 dan dependency microsoft/mxc revision **6cd3d58f05d3447e67109cfb75e042803b843ca4**, sesuai Cargo.toml tag tersebut. Tidak clone/install/build atau menjalankan remote code.

Alur source yang relevan:

1. Codex native launcher mengembalikan error_message dari SDK dan mencetak prefix MXC launcher. Buffer diagnostik SDK sengaja tidak dicetak karena dapat berisi command/environment sensitif. [Native wrapper](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/mxc-sandbox/src/native.rs).
2. SDK launch-failure path mengambil Win32 last error dan meneruskannya ke diagnose_create_process_failure. SDK memiliki extended_error yang menyertakan API/cwd, tetapi field itu tidak muncul pada stderr S. Alur ini mendukung asal kategori Win32, bukan asumsi bahwa Codex baru saja memanggil GetEnvironmentVariable untuk key tertentu. [Pinned runner](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/base_container_runner.rs).
3. Fallback formatter menggunakan teks CreateProcessInSandbox secara generik untuk kode yang tidak dikenali heuristik khusus. Pesan tersebut tidak cukup untuk membedakan exact API/faktor gagal. [Pinned diagnostics](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/launch_diagnostics.rs).

Ini source correlation, bukan binary-level trace atau reproducible-build attestation. Exact API, validitas last-error capture pada installed build, missing key, feature/policy interaction dan internal Windows precondition tetap **UNKNOWN**. Tidak mengekstrak SDK buffer, menjalankan debugger, patch launcher, atau mengubah logging untuk mengatasi keterbatasan.

Public issue [#53513](https://github.com/openai/codex/issues/53513) memuat gejala serupa pada konteks browser discovery. Itu laporan pengguna lain, bukan bukti root cause mesin ini atau pembenaran menjalankan administrator/browser/worker. Tidak ada issue/comment/upload yang dibuat.

## 11. Root-cause hypothesis matrix

Confidence di bawah berlaku pada hipotesis penyebab error 203, kecuali bila dinyatakan sebagai fakta observasi.

| Hipotesis | Evidence yang mendukung/menentang | Confidence / keputusan |
|---|---|---|
| Required environment option hilang | Pengurangan enam-key CONFIRMED; beberapa Windows variables sekarang SET tetapi dahulu tidak diteruskan. Tidak ada exact required key pada error atau source path yang diperiksa | **PLAUSIBLE** sebagai penyebab; tidak CONFIRMED |
| Temporary CODEX_HOME tidak ada/tidak canonical | Preparation S dan current no-reparse inventory/cwd/home mendukung existing owned directory | **NOT SUPPORTED** untuk simple missing/redirected home; full startup validity NOT VERIFIED |
| Invalid CODEX_SQLITE_HOME | Key tidak diteruskan, synthetic sqlite_home override tidak ada, DB tidak dihasilkan | **NOT SUPPORTED** untuk invalid explicit test override; actual effective resolution UNKNOWN |
| Missing package/helper | Entry point/resources/path directory ada; tiga checked executable signatures Valid; same main hash | **NOT SUPPORTED** untuk checked missing files; full dependency completeness **UNKNOWN** |
| Helper alias restriction menyebabkan 203 | Guard menjelaskan warning; warning juga menyertai successful version/help; MXC memakai self re-exec | Warning mechanism **CONFIRMED**; causal link **UNKNOWN** |
| Managed config conflict | Flag mempertahankan requirements; tidak ada specific policy error; effective merged policy tidak teramati | **UNKNOWN** |
| Cwd invalid | Existing empty disposable cwd, canonical checks S dan current no-reparse inspection | **NOT SUPPORTED** untuk missing/redirected cwd; sandbox-side access NOT VERIFIED |
| Windows build incompatibility | Build/edition diketahui; build tinggi sendiri tidak membuktikan native capability. Tidak ada explicit unavailable diagnostic pada S | **UNKNOWN**; tidak menyatakan MXC UNSUPPORTED |
| MXC launcher/OS defect | Generic Win32 launch failure dan public similar symptom; supported prerequisites belum dapat dipastikan seluruhnya | **PLAUSIBLE**, bukan diagnosis defect CONFIRMED |

Tidak ada kandidat root cause berstatus CONFIRMED/STRONGLY SUPPORTED. Fakta altered environment dan helper guard tidak dipromosikan menjadi kesimpulan sebab.

## 12. Exact controlled-retest preconditions

| Prasyarat user | Review S1 |
|---|---|
| 1. Concrete evidence-backed hypothesis untuk perubahan | **UNSATISFIED** pada tingkat actionable adjustment: belum ada required key/invalid path atau discriminator spesifik; hanya competing hypotheses |
| 2. Perubahan test-only yang dapat dijelaskan | Belum dipilih; tidak menebak environment atau menghindari alias guard |
| 3. Binary sebelumnya tetap sama | VERIFIED hash/metadata/signature |
| 4–7. Tanpa install, admin, global config, credentials | Dapat menjadi batas wajib; tidak ada tindakan tersebut dilakukan |
| 8. Prepared disposable home | Home S valid sebagai retained evidence; tidak digunakan ulang untuk invocation. New retest home **NOT CREATED** karena gate 1 gagal |
| 9–11. Explicit MXC, bounded profile, managed restrictions | Command S dapat direview, tetapi belum menjadi approved executable retest plan; tidak dinonaktifkan |
| 12–14. Non-inference, fixed harmless echo, command reviewed | Hanya conceptual existing command direview; tidak ada payload lain dipertimbangkan |
| 15. Secret-safe result capture | Sanitized evidence saja; raw SDK buffer tidak disetujui. Tidak membuat retest recorder baru |

Keputusan: **RETEST NOT RUN — UNSATISFIED SAFETY PRECONDITION**. Jatah maksimal satu bukan kewajiban mencoba. Tidak mencoba full inheritance, penambahan ComSpec/USERPROFILE/LOCALAPPDATA/ProgramData, perubahan home/TEMP, binary lain, profile lain, maupun command yang sama tanpa perubahan.

## 13. Actual S1 execution dan hasil

Operasi aktual: pembacaan laporan/source/package metadata/fixture, narrow environment metadata, SHA-256, PE header, Authenticode, CIM/registry version metadata, Node/npm version, process/listener inventory, Git read-only Hermes, dan pengambilan official docs/source melalui HTTP GET. Source remote hanya dibaca, tidak dieksekusi atau dipersist sebagai replacement/helper.

**Additional sandbox launches: 0. Codex version/help launches: 0. Retest exit/stdout/stderr/duration: NOT APPLICABLE karena NOT RUN.** Tidak ada S1 timestamp/PID sandbox atau MXC_OK yang dapat dilaporkan. S timestamp/PID/exit tetap historical evidence.

Tidak ada suite regresi yang dijalankan ulang: source tidak diubah dan tidak ditemukan source discrepancy yang memerlukan tes. Hasil S/R1 **historis**: typecheck PASS, 300 PASS/1 SKIPPED, runtime-security 60 PASS termasuk 11 R01. Existing ACL skip tetap NOT VERIFIED. Browser E2E/build tidak dijalankan; accepted screenshots tetap dipertahankan.

## 14. OS/runtime status dan WSL2 alternative

Tidak ada direct positive/negative filesystem test pada S1. A/B isolation, private state, fake credentials, alias/junction, new-file timing, child tree dan network tetap **NOT RUN / NOT VERIFIED**. Source explanation tidak menambah enforcement proof. Tidak ada real app-server/account/billing evidence baru.

WSL2 hanya dinilai dari evidence S dan dokumentasi. Automount dan interoperability memungkinkan host-drive/Windows-program access; availability bukan isolasi. [WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config), [cross-filesystem behavior](https://learn.microsoft.com/en-us/windows/wsl/filesystems).

Pertanyaan tahap WSL mendatang: mount /mnt/c dan drive lain; interop/Windows process launching; exposure credentials; filesystem ownership/cross-project paths; descendants dan cancellation; network restrictions; app-server compatibility; broker Project State yang tetap authoritative di host. Actual settings distro **UNKNOWN** karena tidak dimulai/dibaca/dimodifikasi. Tidak mengubah wsl.conf, mount, package atau VM setting. WSL bukan fallback otomatis S1.

## 15. Safety dan perubahan

Hanya dua file baru yang ditulis di repository:

1. `docs/reviews/M02-02S1_MXC_DIAGNOSTIC_REPORT.md`.
2. `docs/reviews/M02-02S1_CONTAINMENT_DECISION_MATRIX.md`.

Tidak ada new disposable fixture atau evidence file S1. Actual final comparison: **104/104 initial AI-Office hashes unchanged**, inventory akhir **106 file** di luar node_modules; hanya dua report S1 baru. Kedua historical roots masing-masing **22/22 hashes unchanged**, dan root S **6/6 hashes unchanged**; semuanya retained. Hermes3D **647/647 tracked hashes unchanged**, HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`, pre-existing ` M package-lock.json` dipertahankan. Pemeriksaan akhir tidak menemukan task-owned process atau listener port 43123/43124. Tidak ada proses dihentikan. Detail batas hash dan accepted screenshot hashes tersedia pada companion section E.

Tidak ada application/contract/SQLite schema/security harness/package/lock/config/test/screenshot/prior-report edit. Tidak ada credentials/token/.sandbox-secrets/session read, auth/login/logout/model/provider/API-key/paid-credit fallback, app-server/SDK worker, global environment/config/requirements change, helper execution, security setting/ACL/group/firewall/Defender/UAC/feature/install/reboot/elevation, distro startup, valuable project write atau cleanup bypass. Tidak ada proses dihentikan. Google AI Studio/Visual Lab tidak dimodifikasi; external assets tidak checksum-audited.

Read-only diagnostic shell mengandung beberapa query yang diperbaiki (output terlalu panjang, salah path pencarian dan satu metadata expression typo); query tersebut tidak meluncurkan Codex atau menulis data. Metadata/hash/package checks yang dipakai untuk kesimpulan berasal dari command yang berhasil, bukan dari exit status shell yang menutupi error sebelumnya.

## 16. Support-evidence checklist dan redacted issue draft

**Draft lokal saja; belum dikirim.**

> Judul usulan: Native Codex 0.162.1 MXC compatibility echo fails with Win32 203 under isolated synthetic home.
>
> Windows 11 Home Single Language x64, build 26300.9711/26H2. Installed npm win32-x64 native CLI 0.162.1, main executable SHA-256 DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A; Authenticode Valid. Satu documented explicit-MXC compatibility echo, --include-managed-config dan :workspace, dari empty disposable cwd. Child exit 1 setelah 1322 ms, stdout kosong; stderr generic MXC CreateProcessInSandbox error 203. Synthetic home telah dibuat, ephemeral credential-store config saja. Launcher environment dibatasi enam key; no auth/model operation. Helper alias guard warning juga muncul; tidak dibypass. Synthetic sandbox.log tidak ada. Tidak ada retest S1.
>
> Pertanyaan: apakah ada documented nonsecret Windows environment prerequisites untuk jalur ini? Bagaimana memperoleh API-specific extended_error yang tersanitasi tanpa membuka SDK environment buffer, active Codex home, credentials, atau mengubah security? Apakah build/policy ini mempunyai known compatibility requirement?

Sebelum submission, Owner harus mereview edition/build/version/hash, command/path redaction, sanitized relevant stderr, environment SET/MISSING classification, config sintetik, log MISSING, jumlah launch dan ketidakpastian. Jangan melampirkan full environment, raw SDK buffer, personal absolute paths, .sandbox-secrets, auth files, transcript, real profile atau unrelated project files. Public issue 53513 hanya similar symptom; jangan mengklaim duplicate confirmed. Tidak ada upload, issue/comment, email atau external submission diotorisasi pada S1.

## 17. Next bounded action dan acceptance

Satu rekomendasi: **M02-02S2 — Redacted MXC Support Evidence Review**, task usulan **read-only**, belum dimulai. Owner meninjau draft dan evidence checklist lokal; selanjutnya minta official guidance untuk exact nonsecret prerequisite atau sanitized API-specific diagnostic. External submission memerlukan izin eksplisit terpisah; tidak dianggap bagian otomatis dari task. Retest/fix/upgrade/instrumentation/OS remediation tidak diotorisasi oleh rekomendasi ini.

Jika official guidance memberi koreksi test-only yang konkret, ajukan scoped experiment berikutnya dengan preserved required Windows inheritance, isolated existing test-owned home, explicit MXC, managed requirements, dan fixed harmless echo. Tidak ada izin sekarang untuk melakukan eksperimen itu. Jika kebutuhan menyentuh OS/security/global profile/install/admin, berhenti sebelum perubahan dan ajukan scope terpisah. Tidak menyarankan weakening sandbox.

**M02-02S1 DIAGNOSTICS COMPLETE — MXC STARTUP BLOCKED — REAL WORKER BLOCKED.**
