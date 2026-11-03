# M02-02S2 — Support Draft and Decision

Review: 29 Oktober 2026. Internal evidence review: [Redacted Support Evidence Review](M02-02S2_REDACTED_SUPPORT_EVIDENCE_REVIEW.md).

**DRAFT ONLY — NOT SUBMITTED — REQUIRES OWNER APPROVAL.**

Bagian1–12 di antara penanda berikut adalah draft mandiri untuk disalin dan ditinjau manual. Tidak menyertakan pemetaan placeholder ke private paths. Bagian13–16 adalah keputusan Owner lokal. Tidak ada issue/email/upload yang dibuat.

<!-- BEGIN STANDALONE SUPPORT DRAFT -->

## 1. Sanitized support issue title

**Codex CLI 0.162.1 — Windows MXC sandbox-only startup fails with error 203**

**DRAFT ONLY — NOT SUBMITTED — REQUIRES OWNER APPROVAL.**

## 2. Short issue summary

Satu invocation documented MXC compatibility echo melalui installed native Codex CLI gagal sebelum expected output, menggunakan synthetic disposable workspace dan pre-created synthetic CODEX_HOME. Launcher environment sengaja dibatasi ke enam forwarded keys; ini **bukan normal inherited-environment reproducer**. Tidak ada model turn, provider login atau inference. Tidak ada retest setelah percobaan tersebut.

Kami meminta supported diagnostic guidance, bukan insecure workaround atau kesimpulan bahwa MXC secara umum unsupported.

## 3. Environment

- Windows 11 Home Single Language x64, build26300.9711 /26H2, berdasarkan discovery saat diagnosis sebelumnya.
- Codex CLI0.162.1, native win32-x64 npm installation; actual --version receipt tersedia dan installed main binary hash tetap cocok saat read-only review.
- Native executable dipilih langsung; tidak memakai npm shell shim.
- Explicit `windows.sandbox=mxc`, `--permission-profile :workspace`, `--include-managed-config`.
- Empty disposable test workspace, pre-created synthetic home, config hanya ephemeral credential-store setting.
- No model turn, authentication, runtime worker atau system-security modification.

## 4. Expected behavior

Compatibility command yang didokumentasikan memulai harmless cmd.exe echo dan mengembalikan `MXC_OK` dengan exit0. Dokumentasi menyediakan bentuk command; keberhasilan pada exact restricted environment ini belum established. [Official Windows sandbox guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox).

## 5. Actual behavior

Native launcher process exit **1** setelah **1322ms**. Stdout kosong; tidak ada MXC_OK. Relevant stderr:

```text
MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).
```

CLI juga mengeluarkan nonfatal helper-alias warning; personal paths telah diganti:

```text
WARNING: proceeding, even though we could not create PATH aliases:
Refusing to create helper binaries under temporary dir "<TEST_TEMP_ROOT>"
(codex_home: <SYNTHETIC_CODEX_HOME>)
```

Warning block di atas tersamarkan dan line-wrapped, bukan raw stderr penuh. Hubungannya dengan error203 tidak diketahui.

## 6. Sanitized reproduction steps

Ini **historical invocation shape**, bukan new executed reduced reproducer atau instruksi mengulangi eksperimen tanpa scope review.

1. Native Codex CLI terpasang dan dipilih langsung; synthetic home dan empty disposable cwd sudah dibuat sebelum invocation lama.
2. CODEX_HOME menunjuk `<SYNTHETIC_CODEX_HOME>` di bawah `<TEST_TEMP_ROOT>`. Synthetic config hanya `cli_auth_credentials_store = "ephemeral"`; tidak menyalin credentials/state akun nyata.
3. Recorder meneruskan hanya `SystemRoot`, `WINDIR`, `PATH`, `TEMP`, `TMP`, `CODEX_HOME`. PATH dibatasi ke current Node directory dan Windows System32; TEMP/TMP menunjuk test root. Key/value lain tidak diwariskan oleh recorder. Tidak menyatakan ini exact final target environment setelah transform Codex.
4. Cwd adalah `<TEST_WORKSPACE>`. `<NATIVE_CODEX>` dan `<SYSTEM_CMD>` mewakili absolute installed native CLI dan trusted system cmd.exe; tidak ada private path mapping dalam draft ini.
5. Command konseptual yang merepresentasikan argv lama:

```text
<NATIVE_CODEX> -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- <SYSTEM_CMD> /d /c echo MXC_OK
```

`/d` menonaktifkan cmd AutoRun. Original recorder memakai 10s timeout dan bounded output; timeout tidak tercapai. Tidak mencoba legacy/elevated/unelevated/full-access fallback, binary lain, full environment inheritance atau perubahan home untuk mendapat keberhasilan. S1 dan S2 menambah **0 MXC launches**.

## 7. Confirmed diagnostics

- Retained command/manifest/version/help/compatibility receipts masih tersedia untuk local review; exit/error/flags konsisten. Tidak melampirkan raw receipts karena mengandung personal paths.
- Installed main binary hash tetap sama; main/checked helper signatures Valid dan checked helper files ada. Ini bukan full runtime dependency attestation.
- Temporary home/cwd masih ada, inspected synthetic tree tidak mengandung reparse entries. Tidak ada auth/session/state file baru pada tree tersebut.
- Synthetic `CODEX_HOME/.sandbox/sandbox.log` tidak ditemukan. Tidak membuka log dari active account home.
- SystemDrive/LOCALAPPDATA tidak termasuk six forwarded keys. Normal-environment metadata menunjukkan keduanya SET pada inspeksi masing-masing; values tidak dibagikan. Omission tidak membuktikan keduanya menyebabkan203.
- Standard Win32 name203 adalah ERROR_ENVVAR_NOT_FOUND. Pinned SDK text adalah generic diagnostic formatter, bukan identifikasi exact native API. [Win32 mapping](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-), [pinned diagnostics](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/launch_diagnostics.rs).
- Tagged Codex arg0 source menjelaskan temp-home alias guard dan continuation setelah warning; causal relationship ke203 belum ditetapkan. [Tagged arg0](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/arg0/src/lib.rs).

## 8. Known unknowns

Exact failing native API, required environment option, effective merged managed configuration/profile, final launcher-to-child environment, Windows capability detail, dan causal helper-warning relationship belum diketahui. Tidak ada successful default-environment comparison atau direct filesystem containment evidence.

Source review menemukan merged [PR54027](https://github.com/openai/codex/pull/54027) untuk host startup variables dan [PR54069](https://github.com/openai/codex/pull/54069) untuk remote MCP environment. Reviewed rust-v0.162.1 transport berbeda dari PR54027 change. Apakah perubahan tersebut berlaku pada installed CLI failure ini atau release mana yang supported belum ditetapkan. Original invocation adalah direct CLI, bukan remote MCP/CUA.

Public [issue53513](https://github.com/openai/codex/issues/53513) mempunyai error signature serupa pada desktop browser startup; kami tidak mengklaim duplicate atau shared confirmed cause. Tidak ada specific confirmed repair untuk reproducer ini dari sumber yang ditinjau.

## 9. Questions for maintainers

1. Variabel Windows apa yang diwajibkan documented explicit-MXC compatibility path pada CLI0.162.1, dan pada lapisan host/launcher/child mana?
2. Apakah forwarding hanya enam key tersebut diketahui dapat menimbulkan203? Apakah SystemDrive/LOCALAPPDATA requirement pada PR54027 berlaku untuk kasus ini?
3. Diagnostic field apa yang dapat mengidentifikasi failing native operation dan selected launch contract secara tepat?
4. Apakah temp CODEX_HOME alias warning memang nonfatal untuk sandbox-only echo ini, atau ada additional prerequisite yang didokumentasikan?
5. Apa supported restrictions bagi sandbox-only use dengan pre-created ephemeral home tanpa credentials?
6. Adakah supported safe procedure untuk memperoleh API-specific extended_error tanpa raw SDK/environment buffer, active profile, credentials atau security changes?
7. Adakah known compatibility requirement atau supported fixed release yang relevan dengan Windows build/version dan standalone CLI ini? Apakah PR54027/54069 applicable atau unrelated?
8. Berdasarkan evidence ini, minimal safe remediation atau bounded compatibility retest apa yang disarankan, dengan explicit MXC dan managed requirements tetap berlaku?

Kami tidak meminta disable-sandbox, unrestricted permissions, credential copying, administrator/security changes, atau fallback sebagai workaround.

## 10. Suggested nonsecret attachments

**Tidak ada attachment otomatis.** Bila maintainer memerlukan dan Owner menyetujui:

- Manually reviewed plain-text summary versi/installation/Windows build, binary hash dan signature status.
- Sanitized argv dan relevant short stderr di atas.
- Environment key-only SET/MISSING/OVERRIDDEN matrix tanpa values.
- Synthetic config snippet, log-MISSING statement, source URLs/versions dan explicit evidence gaps.

Semua attachment tambahan memerlukan review baru; tidak ada file attachment terpisah dibuat oleh milestone ini.

## 11. Explicitly prohibited attachments

Jangan lampirkan full environment/PATH, raw SDK buffer, raw local JSON receipts atau sandbox logs yang belum direview, auth/token/keyring/.sandbox-secrets contents, sessions/transcripts/browser cookies, active Codex home, private config/app-data/SQLite, actual project source, screenshots, username/hostname/email/account/task/session/project IDs, personal paths, private addresses atau unrelated files. Tidak menyertakan mapping placeholder ke private paths.

## 12. External submission approval status

**DRAFT ONLY — NOT SUBMITTED — REQUIRES OWNER APPROVAL.**

Belum ada GitHub issue/comment, support email, upload atau kontak maintainer. Owner harus menyetujui final content dan destination sebelum pengiriman manual atau submission task terpisah. Persiapan draft ini tidak mengotorisasi pengumpulan diagnostics tambahan maupun retest.

<!-- END STANDALONE SUPPORT DRAFT -->

## 13. MXC continuation criteria — Owner decision

Technical readiness: **READY WITH EXPLICIT EVIDENCE GAPS**. Final S2 category: **SUPPORT PACKAGE READY — OWNER REVIEW REQUIRED**. Root cause tidak harus diketahui untuk meminta guidance; gap native API/effective policy/final environment dinyatakan jelas.

Kelanjutan eksperimen hanya setelah:

1. Guidance atau code-path evidence mengidentifikasi prerequisite/diagnostic yang applicable pada exact installed path, bukan sekadar same error code.
2. Scope baru menetapkan no-credential disposable context, supported bounded permissions, explicit MXC dan retained managed requirements.
3. Koreksi test-only, jumlah launch, capture fields, ownership, rollback/retention dan stop conditions disetujui terpisah.
4. Bila remedy memerlukan upgrade/install/admin/globalenv/config/security change, tidak dieksekusi berdasarkan S2; ajukan separate scope terlebih dahulu.
5. Startup success kelak hanya startup gate; direct A/B/private/credentials/new-file/child/network evidence tetap wajib sebelum OS acceptance.

Tidak ada blanket recommendation menambahkan semua normal Windows variables, memakai active home, memodifikasi helper guard, atau mengupgrade ke versi yang belum dibuktikan applicable.

## 14. WSL2 alternative evaluation criteria

Ubuntu WSL2 tersedia menurut historical S receipt, tetapi tidak dimulai pada S/S1/S2. Live current distro state tidak diverifikasi ulang. [WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config) menjelaskan automount/interop; virtualized Linux sendiri tidak membuktikan sandbox aman.

Future separately approved documentation-only feasibility harus merancang:

- `/mnt/c`, `/mnt/d` dan host mounts lain; interop serta Windows program launching.
- Dedicated identity/permissions, credential separation, cross-project filesystem access dan Windows/Linux path/ACL/casing differences.
- Authoritative Project State tetap di trusted host; worker memakai narrow broker, tidak memegang raw DB/private paths.
- Process ownership/descendants/cancellation, network policy dan actual app-server compatibility.
- Direct positive/negative non-AI acceptance tests dengan owned fixtures sebelum security claims.

Tidak mengubah wsl.conf, mount, distro packages, networking, Hyper-V atau optional features. WSL2 tidak dipilih sebagai immediate fallback.

## 15. Next-step decision matrix

| Opsi | Manfaat | Batas/prasyarat | Keputusan S2 |
|---|---|---|---|
| A — Official MXC support guidance | Mempertahankan native Windows direction; pertanyaan spesifik tersedia, tanpa blind probing | Response time/fix tidak diketahui; submission perlu Owner approval; OS proof tetap terpisah | **RECOMMENDED NEXT** |
| B — Bounded MXC remediation setelah evidence | Dapat menguji exact prerequisite secara terkontrol | Specific applicable correction, bounded scope/rollback/new approval; no weakening | **CONDITIONAL / NOT AUTHORIZED NOW** |
| C — WSL2 feasibility | Dapat menilai alternatif boundary bila MXC tidak layak | Documentation-only scope terpisah dahulu; mounts/interop/credentials/process/network belum terbukti | **ALTERNATIVE LATER / NOT STARTED** |

Satu next milestone usulan: **M02-02S3 — Owner-Approved MXC Support Submission and Response Triage**. Owner memilih destination dan final draft yang boleh dikirim. Jika Owner memilih pengiriman manual, tidak diperlukan agent posting. Tidak memulai S3 sekarang dan tidak menjanjikan support reply, fix, atau jadwal resolution.

Jika support tidak memberi evidence-backed path atau cost investigasi menjadi tidak layak, ajukan WSL2 documentation-only feasibility sebagai pilihan berikutnya, bukan menjalankan distro atau memperlemah isolation.

Current gates tetap:

| Gate | Status |
|---|---|
| Host path policy / synthetic approvals | HOST_VERIFIED historis |
| Atomic issuance | HOST_VERIFIED dalam satu issuer authority |
| Synthetic process supervision | HOST_VERIFIED untuk tested processes |
| MXC startup | FAILED pada S; no S1/S2 retest |
| OS filesystem/private credential isolation/hostile tree | NOT VERIFIED |
| Actual app-server/approval/cancellation | NOT VERIFIED |
| Durable production lease/crash recovery/cross-process dedup | NOT VERIFIED |
| ChatGPT subscription eligibility | UNKNOWN |
| Included-only billing hard cap/skill enforcement | NOT VERIFIED; Paid API/skills OFF |
| Real AI worker | **BLOCKED** |

Historical 300 PASS/1 SKIPPED dan60 host-security PASS tidak dijalankan ulang pada S2. Support documents/merged code/comments tidak menaikkan gate.

## 16. Owner authorization dan safety closeout

Specific decisions: review draft; approve/redact necessary technical disclosure; choose official destination dan manual-vs-agent submission; separately approve any later diagnostics/remediation/retest atau WSL2 feasibility. S2 hanya drafting. Ketentuan ini berasal dari S2 sections6/7/9/22/23; bukan permintaan izin ulang untuk pekerjaan review yang sudah diotorisasi.

Final actual comparison: **106/106 initial AI-Office hashes unchanged**, inventory akhir108 files di luar node_modules; dua report S2 baru saja. Historical fixtures **22/22 +22/22**, S fixture **6/6**, dan Hermes3D tracked **647/647 hashes unchanged**. Semua fixture retained. Existing screenshots, source/contracts/security harness/tests/package/schema/config dan prior reports tercakup baseline unchanged. Hermes pre-existing modified package-lock tetap dipertahankan; external Visual Lab assets tidak checksum-audited.

Tidak ada execution fixture baru atau process termination. Tidak ada task-owned process/listener uji pada final bounded inspection. Tidak ada sandbox/Codex/helper/WSL/model/app-server invocation, credential/provider access, paid fallback, environment/home/globalconfig/security/install/Gitinit/Hermes/VisualLab write atau external submission. Detail evidence/status/source tersedia di companion; tidak ada full-repository source audit baru.

**M02-02S2 COMPLETE — REDACTED SUPPORT PACKAGE READY — MXC STARTUP BLOCKED — REAL WORKER BLOCKED — AWAITING OWNER REVIEW.**
