# M02-02S2 — Redacted MXC Support Evidence Review

Tanggal review dan akses sumber: **29 Oktober 2026, Asia/Jakarta**. Companion: [Support Draft and Decision](M02-02S2_SUPPORT_DRAFT_AND_DECISION.md). Dokumen ini untuk review lokal Owner; bukan lampiran eksternal otomatis.

## 1. Executive summary

**SUPPORT PACKAGE READY — OWNER REVIEW REQUIRED.** Readiness teknis: **READY WITH EXPLICIT EVIDENCE GAPS**. Command, installed-binary identity, receipt exit/stderr, reduced environment, temporary-home warning dan log absence cukup untuk meminta panduan resmi. Exact native API, effective policy dan root cause belum diketahui; gap ini merupakan pertanyaan support, bukan bukti masalah telah diselesaikan.

S2 menjalankan **0 MXC launches, 0 Codex invocations, 0 worker/model sessions** dan tidak membuat execution fixture. Dua laporan S2 adalah satu-satunya file baru. Tidak ada submission, upload atau komunikasi eksternal melalui issue/comment/email. HTTP GET untuk dokumentasi/source/issues publik bukan pengiriman evidence lokal.

Temuan tambahan terhadap S1: ada merged official-repository changes [PR #54027](https://github.com/openai/codex/pull/54027) dan [PR #54069](https://github.com/openai/codex/pull/54069) tentang Windows startup variables/environment filtering. Perubahan itu relevan untuk pertanyaan support, tetapi bukan confirmed fix untuk exact standalone CLI 0.162.1/error-203 case ini. Tidak mengubah atau mengganti CLI untuk mengujinya.

Keputusan berikutnya: **Option A — Official MXC support guidance**, melalui paket tersamarkan yang ditinjau Owner. Bounded remediation hanya setelah applicability dan koreksi didukung bukti serta diotorisasi terpisah. WSL2 tetap kandidat alternatif yang belum dinilai melalui eksekusi. **MXC startup BLOCKED; real worker BLOCKED.**

## 2. Current MXC startup status dan baseline

Satu percobaan aktual pada M02-02S gagal: child exit 1, stdout kosong, tidak ada MXC_OK, durasi 1322 ms. S1 tidak retest; S2 dilarang retest. Tidak ada perubahan hasil runtime baru.

Exact error yang tersimpan:

```text
MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).
```

Command relevan disamarkan, bukan command yang dijalankan S2:

```text
<NATIVE_CODEX> -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- <SYSTEM_CMD> /d /c echo MXC_OK
```

Original command memakai absolute native executable dan absolute system cmd.exe; tidak memakai shell shim. Working directory adalah empty disposable test workspace. Reduced environment berbeda dari normal inheritance dan harus diungkapkan saat support. Tidak ada successful direct filesystem negative test.

Semua 12 laporan yang diminta tersedia; last four menjadi fokus detail. Delapan laporan awal ditinjau untuk fixture-only acceptance, DEC-001–DEC-006, host-vs-OS distinction, R01 one-issuer limitation dan account/runtime gates. Tidak melakukan audit source keseluruhan yang baru atau mengedit laporan historis. Detailed local references:

- [S containment report](M02-02S_WINDOWS_CONTAINMENT_REPORT.md), [S gate matrix](M02-02S_OS_RUNTIME_GATE_MATRIX.md).
- [S1 diagnostic report](M02-02S1_MXC_DIAGNOSTIC_REPORT.md), [S1 decision matrix](M02-02S1_CONTAINMENT_DECISION_MATRIX.md).
- M01-07 acceptance; kedua M02-01 reports; kedua M02-02 reports; kedua M02-02R reports; M02-02R1 atomic issuance report tetap sumber historis.

## 3. Evidence inventory

OBSERVED berarti artifact/metadata benar-benar dibaca S2; bukan pengulangan eksekusi yang direkam. DERIVED FROM SOURCE bukan actual local enforcement. REPORTED BUT NOT RECHECKED tidak dipromosikan menjadi current machine verification.

| Item | Classification | Evidence dan batas |
|---|---|---|
| Original argv | OBSERVED | Retained manifest/compatibility JSON ada; explicit MXC, managed flag, :workspace dan harmless echo konsisten |
| Installed native executable | OBSERVED | Ada, regular non-reparse entry, 333,479,728 bytes; hash ulang cocok |
| Main SHA-256 | OBSERVED | DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A; bukan secret atau machine ID |
| CLI actual version | OBSERVED historical receipt | version.json mencatat exit 0 dan codex-cli 0.162.1 pada S. --version tidak dijalankan ulang |
| Installation/architecture | REPORTED BUT NOT RECHECKED untuk package/PE parsing S1 | npm native win32-x64, PE AMD64; current same main hash mendukung continuity, bukan fresh parsing |
| Main/helper signatures | OBSERVED | Main, command-runner dan sandbox-setup metadata ada; Authenticode Valid. Helper tidak dijalankan |
| Windows edition/build, Node/npm | REPORTED BUT NOT RECHECKED | S/S1: Home Single Language x64, 26300.9711/26H2, Node 24.21.0/npm 11.19.0; tidak menjalankan version discovery baru |
| Exit/stdout/error/duration | OBSERVED historical receipt | Native exit 1; stdout kosong; error 203; 1322 ms. Wrapper recorder exit 0 bukan sandbox success |
| Helper warning | OBSERVED historical receipt | Refusing to create helper binaries under temporary dir; personal paths tidak dipublikasikan |
| Original environment | OBSERVED manifest | Tepat enam key: SystemRoot, WINDIR, PATH, TEMP, TMP, CODEX_HOME; values tidak dibagikan |
| Normal environment comparison | REPORTED BUT NOT RECHECKED untuk S1 allowlist; OBSERVED untuk SystemDrive S2 | SystemDrive sekarang SET, expected drive form, root exists; nilainya disamarkan. Current SET bukan bukti old final-child env |
| Synthetic home/cwd | OBSERVED current existence; preparation REPORTED oleh S | Home/cwd ada; enam file pada tree S; inspected tree tanpa reparse entries. Existence sekarang sendiri tidak membuktikan preparation timing |
| Config/home contents | OBSERVED melalui retained synthetic inventory/config hash | Config ephemeral credential-store saja; no new auth/state files pada tree. Tidak membuka actual home |
| Effective managed config/profile | UNKNOWN | Flags diketahui; effective merged requirements/policy tidak tersedia |
| Sandbox log | MISSING | Exact synthetic home/.sandbox/sandbox.log diperiksa lagi; tidak ada. Tidak mencari di active home |
| Owner/ACL | REPORTED BUT NOT RECHECKED | S mencatat current-user-owned/inherited ACL. Tidak menerbitkan hostname, account name atau SID; bukan restricted identity proof |
| Retention/integrity | OBSERVED | Historical fixtures 22 + 22 file dan S fixture 6 file tetap ada, tanpa write/cleanup; hash comparison dicatat di section 16 |
| WSL2 | OBSERVED historical receipt; live state REPORTED BUT NOT RECHECKED | wsl-list.json merekam Ubuntu/Stopped/2 pada S; tidak menjalankan wsl.exe/distro pada S2 |
| Precise native API/extended_error | MISSING / UNKNOWN | Tidak ada API-specific captured detail dalam receipt S |

Tidak merekonstruksi artifact hilang atau memakai public report sebagai pengganti local evidence.

## 4. Error 203 interpretation

203 / 0xCB adalah standard Win32 **ERROR_ENVVAR_NOT_FOUND**. Artinya konsisten dengan environment-related failure, tetapi exact failing operation dan required environment option belum ditetapkan. [Microsoft mapping](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-).

Pinned SDK `diagnose_create_process_failure` menerima win32_error, lalu generic fallback membuat teks CreateProcessInSandbox untuk error yang tidak cocok dengan heuristik khusus. Karena itu nama dalam teks bukan bukti tunggal API tertentu yang gagal. [Pinned diagnostics](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/launch_diagnostics.rs).

Runner mempunyai API-specific extended_error dan menyimpan detail ke buffered logger; Codex native wrapper hanya mengekspos error_message. Exact API/cwd detail itu tidak terdapat dalam receipt S. Meminta extraction tersanitasi pada maintainer lebih tepat daripada meminta raw buffer. Buffer dapat mengandung command/environment; tidak dibuka atau dicetak. [Pinned runner](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/base_container_runner.rs), [native wrapper](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/mxc-sandbox/src/native.rs).

Source correlation tidak membuktikan exact binary internals. Tidak menyatakan SystemRoot hilang—manifest justru meneruskannya—dan tidak menyatakan 203 membuktikan MXC capability absen atau build tidak didukung.

## 5. Original environment reduction analysis

Windows CreateProcessW memakai caller environment bila lpEnvironment NULL; explicit environment block adalah kontrak berbeda. Itu tidak menyatakan setiap normally-present variable wajib bagi semua subprocess. Original recorder memasok environment eksplisit, lalu Codex masih dapat memfilter/mentransform child environment. Final target environment tidak teramati. [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw).

| Variable/category | Original launcher | Normal metadata | Required-code evidence / classification |
|---|---|---|---|
| SystemRoot | Diteruskan | SET menurut S1 | POSSIBLY RELEVANT; PR54027 memakai host SystemRoot untuk bootstrap original-empty child. Original S tidak empty; bukan missing-key diagnosis |
| WINDIR | Diteruskan | SET menurut S1 | NOT SHOWN TO BE REQUIRED sebagai penyebab 203 di exact path ini; case bukan alasan menganggap hilang |
| PATH | OVERRIDDEN ke Node + System32 | SET menurut S1; values tidak dibagikan | POSSIBLY RELEVANT; target executable absolut; dependency yang hilang belum ditemukan |
| TEMP/TMP | OVERRIDDEN ke owned temp root | SET menurut S1 | POSSIBLY RELEVANT; directories ada dan alias guard menjelaskan warning, bukan error-203 cause |
| CODEX_HOME | OVERRIDDEN ke pre-existing synthetic home | Current-default metadata S1 MISSING; default home tidak dibuka | REQUIRED BY DOCUMENTED CODE PATH untuk existing explicit home; existing-directory requirement terpenuhi menurut preparation evidence |
| CODEX_SQLITE_HOME | Tidak diteruskan | MISSING menurut S1 | NOT SHOWN TO BE REQUIRED; documented default ke CODEX_HOME; actual effective resolution UNKNOWN |
| ComSpec | Tidak diteruskan | SET menurut S1 | NOT SHOWN TO BE REQUIRED; cmd dipilih dengan absolute system path |
| USERPROFILE | Tidak diteruskan | SET menurut S1 | POSSIBLY RELEVANT; tidak ada exact installed failing-path requirement yang dibuktikan |
| LOCALAPPDATA | Tidak diteruskan | SET menurut S1 | REQUIRED BY DOCUMENTED CODE PATH pada perubahan PR54027; applicability terhadap exact old native failure UNKNOWN |
| ProgramData | Tidak diteruskan | SET menurut S1 | POSSIBLY RELEVANT untuk known-folder resolution; current SET tidak membuktikan required forwarding |
| SystemDrive | Tidak diteruskan berdasarkan six-key manifest | **SET / expected form / root exists pada S2**, value REDACTED | REQUIRED BY DOCUMENTED CODE PATH pada PR54027; absent explicit forwarding adalah fakta, causal role pada 203 masih UNKNOWN |

**New source evidence, bukan instruction untuk mengubah environment:** PR54027 merged 14 Oktober 2026, commit `81aee8c86ba2549e53f82ea56f163c3e450fb55a`; transport change membutuhkan nonempty Unicode host SystemDrive/LOCALAPPDATA dan case-insensitive replacement. Reviewed transport pada tag rust-v0.162.1 tidak berisi guard/injection tersebut. Ini perbandingan source file, bukan audit inclusion seluruh release atau jaminan binary upgrade memperbaiki kasus ini. [PR54027](https://github.com/openai/codex/pull/54027), [pinned transport](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/mxc-sandbox/src/transport.rs).

PR54069 merged 14 Oktober 2026, commit `0fd85b075288c4fee50f0df3e4e4f98f80c693fe`, menjaga startup variables pada remote MCP filtering. Original S adalah direct standalone CLI, bukan remote MCP launch; relevansinya partial. [PR54069](https://github.com/openai/codex/pull/54069).

Tidak ada nilai environment diset, full inheritance dicoba, atau specific correction direkomendasikan sebagai established repair. Kedua merged changes memberi target pertanyaan support: apakah kebutuhan itu berlaku pada installed path, dan evidence/retest apa yang aman untuk membedakannya? S1 tidak diedit untuk menyisipkan temuan S2 sebagai pengetahuan sebelumnya.

## 6. Temporary CODEX_HOME analysis

Home/cwd retained masih tersedia; synthetic tree tidak berisi reparse entry. Manifest dan prosedur S mencatat preparation sebelum launch. Tidak memindahkan, menyalin, mengganti environment atau memakai ulang home untuk invocation. Tidak membuka real home, SQLite, auth files, transcript atau .sandbox-secrets.

Official docs mewajibkan existing directory untuk explicit CODEX_HOME dan menjelaskan location defaults. Itu mendukung penolakan hipotesis sederhana home-belum-dibuat, bukan complete startup compatibility. [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables).

Mengganti home atau TEMP agar guard tidak berlaku, menyalin account home, atau meminjam real credentials bukan langkah S2 dan tidak direkomendasikan sebagai workaround.

## 7. Helper alias analysis

Tagged arg0 source menolak helper placement bila CODEX_HOME berada di bawah temp_dir pada release build. Caller menangkap error, mencetak WARNING dan melanjutkan dengan available package path. Ini **nonfatal pada flow alias preparation**; actual version/help S juga berhasil dengan warning tersebut. MXC re-exec memakai current Codex executable, bukan bukti missing apply_patch alias. [arg0](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/arg0/src/lib.rs).

Hubungan warning dengan error 203 tetap **UNKNOWN**. Checked binary/helper presence/signature tidak membuktikan full package integrity atau dependency loading. Tidak membuat alias, menjalankan helper, atau melemahkan guard.

## 8. Official references dan kualitas sumber

Semua sumber diakses 29 Oktober 2026. Versi yang relevan dibedakan dari current product docs.

| Source class | Sumber / versi | Penggunaan dan batas |
|---|---|---|
| Official product docs | [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), current | Compatibility echo/flags dan diagnosis platform; tidak memberi specific error-203 repair untuk kasus ini |
| Official product docs | [Config basics](https://developers.openai.com/codex/config-basic), current | Config layers/managed requirements; tidak membuktikan effective local policy |
| Official product docs | [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables), current | CODEX_HOME/SQLITE_HOME contract |
| Microsoft API/reference | [Errors](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-), [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw) | Error mapping dan normal inheritance contract |
| Official repository source | OpenAI tag rust-v0.162.1: arg0, native.rs, transport.rs, debug_sandbox.rs, Cargo.toml | Source-level guard, error propagation, command path dan dependency pin; bukan runtime trace |
| Official repository source | Microsoft MXC `6cd3d58f05d3447e67109cfb75e042803b843ca4`: launch_diagnostics.rs/base_container_runner.rs | Generic formatter dan available precise field; tidak membaca private native logs |
| Merged repository changes | PR54027/54069, merge commits di section 5 | Accepted source changes; bukan maintainer-confirmed root cause untuk Owner's failure atau deployed fix verification |
| Public user reports | Codex issues 53513/53188, MXC issue1130 | Observed symptoms dan context; bukan official support instructions |
| Own technical inference | Confidence/missing-evidence/option ranking pada laporan ini | Diberi label inference, bukan externally confirmed explanation |

Tag tree page tidak dapat diambil melalui web fetch pada review ini; version-pinned individual files berhasil dibaca melalui GitHub/raw source. Tidak menganggap failed tree-page fetch sebagai code evidence. Tidak menjalankan command yang ditemukan pada dokumentasi atau issue.

## 9. Public issue comparison

Public issue metadata/comments ditinjau read-only melalui GitHub public API; tidak mengirim evidence lokal. Summary berikut meminimalkan unrelated user logs.

| Issue / dates | Runtime dan environment | Symptom/start stage/customization | Maintainer/fix evidence | Similarity |
|---|---|---|---|---|
| [openai/codex #53513](https://github.com/openai/codex/issues/53513), opened 13 Oct 2026; open saat akses | Desktop cloud-delegated CUA/browser; exact OS build/app/CLI version tidak supplied/verified | Error 203 signature sama, kernel exit 1 sebelum browser inventory; normal/reduced environment UNKNOWN; target subprocess startup tidak independently established | 0 comments; tidak ada confirmed root cause/fix pada thread yang tersedia | **PARTIAL**: same signature, different product/path |
| [openai/codex #53188](https://github.com/openai/codex/issues/53188), opened 11 Oct; updated 18 Oct 2026; open | Body: desktop 26.1007.21434, bundled CLI 0.162.0-alpha.17.2, Windows 11 Pro/build26300; comments mempunyai versions/builds lain | Dominan HRESULT0x80070003 sebelum browser inventory; beberapa user trials menyebut203. User reports membandingkan filtered remote environment dan working standalone path | 44 comments fetched; tidak ditemukan explicit maintainer-confirmed repair untuk exact S case. Linked merged PRs diperiksa terpisah; user recovery reports bukan controlled local proof | **PARTIAL**; tidak menyamakan HRESULT lain/remote CUA dengan native CLI S |
| [microsoft/mxc #1130](https://github.com/microsoft/mxc/issues/1130), opened10 Sep; closed14 Sep2026, state_reason completed | SDK0.8.0, Windows11x64/build26200, LPAC/SBOX-oriented request; bukan Codex CLI0.162.1 | User reports203 setelah explicit reduced environment; benign subprocess execution tidak established. Diagnostic sebagian direkonstruksi oleh reporter, bukan raw local artifact kita | 0 comments; closed/completed sendiri tidak menjelaskan root cause atau membuktikan fix. Tidak ada verified supported repair yang dapat dipindahkan ke S | **PARTIAL**: same code/reduced env, different SDK policy/backend/build |

GitHub association pada 53188: satu automated CONTRIBUTOR response, 43 NONE; label/role tidak dianggap root-cause authority. Ada public user suggestions/workarounds dan reports of recovery, tetapi tidak dieksekusi atau diperlakukan sebagai supported remediation. Tidak mengklaim same hexadecimal code berarti same cause; tidak mengklaim duplicate confirmed.

## 10. Evidence confidence classification

| Tingkat | Temuan |
|---|---|
| Confirmed local artifact/metadata | Command receipt203/exit1/no output; six-key manifest; retained home/cwd/files; unchanged main hash; checked signatures; no synthetic sandbox.log |
| Derived from pinned source | Generic diagnostic formatting, nonfatal alias-warning flow, available SDK extended_error, self re-exec path |
| Confirmed repository event | PR54027/54069 merged; perubahan code dapat dibaca |
| Historical reported | Actual Windows/Node/npm discovery dan live WSL status dari S/S1; bukan new S2 runtime observation |
| Plausible technical inference | Reduced Windows environment dapat berkontribusi; merged changes meningkatkan relevansi SystemDrive/LOCALAPPDATA untuk pertanyaan support |
| Unknown | Exact failing API/key, final child environment, effective managed policy, local capability detail, causal alias relationship dan applicability fix |

## 11. Confirmed versus unknown causes

**Root cause exact error203 belum diketahui.** Confirmed mechanisms bukan confirmed causes: environment reduction menjelaskan apa yang dipasok, alias guard menjelaskan warning, formatter menjelaskan bentuk pesan. Tidak ada verified local counterfactual atau API-specific receipt yang membedakan environment, Windows implementation, policy, package-dependency dan launcher hypotheses.

Tidak ditemukan specific officially supported repair untuk **kombinasi exact S command/version/environment** dalam sumber yang ditinjau. Ada accepted upstream environment changes; applicability/released-version guidance perlu ditanyakan, bukan diasumsikan. Tidak menyatakan tidak ada solusi di seluruh internet atau bahwa Windows harus diperbaiki.

## 12. Privacy/redaction matrix

| Data | Perlakuan sebelum sharing |
|---|---|
| Username/full profile/personal folder/project path | Ganti dengan role placeholders; tidak ada placeholder-to-private-path mapping pada draft |
| Hostname, account names, SID, computer identifiers | Omit; tidak diperlukan untuk initial support |
| Email/account/project/workspace/task/attempt/session identifiers | Omit seluruhnya |
| Credentials, .sandbox-secrets, cookies, password-manager data | Tidak dibaca/dilampirkan; tidak ada contoh token |
| Environment/PATH values/private config | Hanya key names dan SET/MISSING/OVERRIDDEN classification; no full dump |
| Private IP/host endpoints | Omit; tidak ada network test atau endpoint lokal diperlukan |
| Source/SQLite/app-data/transcript/screenshot | Tidak dilampirkan; bukan prerequisite memahami startup echo |
| Exact fixture names, PID, precise clock, local manifest | Tidak dimasukkan ke standalone draft; tidak mengirim raw JSON yang berisi path |
| Product version/OS build/flags/error/duration | Pertahankan sebagai minimum relevant technical facts; Owner tetap menyetujui disclosure |
| Binary SHA/signature | Dicatat pada internal review; hash tidak wajib pada initial draft, dapat diminta melalui separately reviewed nonsecret summary |

Support draft section1–12 companion ditulis sebagai blok mandiri. Bagian Owner decision sesudahnya bukan pesan eksternal otomatis. Dokumentasi internal lama dan raw receipts tidak aman dikirim tanpa redaksi baru, meskipun tidak berisi token.

## 13. Missing diagnostic evidence

1. API-specific extended_error/selected native operation dan safe interpretation of captured Win32 code.
2. Effective managed requirements/permission profile untuk invocation lama.
3. Exact launcher-to-target environment transformation; hanya recorder input manifest tersedia.
4. Supported required Windows variables untuk installed version/path, termasuk relevance merged PRs.
5. Safe log/diagnostic mechanism: expected synthetic sandbox.log tidak ada; raw SDK buffer sengaja suppressed.
6. Relevant Windows capability/policy detail yang dapat diperoleh tanpa security changes dan tanpa inference.
7. Maintainer guidance tentang temporary-home warning dan supported ephemeral sandbox-only configuration.

Ini pertanyaan, bukan instruksi untuk mengumpulkan log pada active home. Tidak membuat reproducer baru, menambah instrumentation, mengakses credentials atau melakukan capability probe pada S2.

## 14. Support readiness

**READY WITH EXPLICIT EVIDENCE GAPS**, dan **SUPPORT PACKAGE READY — OWNER REVIEW REQUIRED** untuk initial guidance request. Tidak ada material inconsistency yang membuat request menyesatkan bila gaps dicantumkan: exact receipt/version/hash/argv tersedia, environment customization diungkapkan, no successful reduced reproducer diklaim.

Draft bukan fresh default-environment reproduction. Personal paths diganti; exact error dipertahankan; expected output bukan actual result; S1/S2 no-retest dinyatakan. Official docs mendukung command shape, tidak menjanjikan compatibility pada setiap build. [Compatibility guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox).

## 15. Risks of unstructured retries

Blind retries/penambahan banyak key sekaligus tidak mengisolasi sebab, dapat meneruskan secret environment, mengubah home/config exposure, atau mengaburkan native-vs-fallback behavior. Mengganti binary/home/policy tanpa controlled scope juga merusak reproducer. Berulangnya echo failure bukan izin install/admin/legacy/full-access atau weak isolation.

Tidak menyarankan raw logger dump; source menyebut privacy reason untuk buffer suppression. Future diagnostic harus menentukan exact safe fields, expected effects, limit launch dan stop conditions sebelum eksekusi. Tidak ada kegiatan tersebut dilakukan sekarang.

## 16. Change-safety confirmation

Only writes: dua report S2. Tidak ada new fixture, source/test/config/package/schema/screenshot/prior-report edit. Actual final comparison: **106/106 initial AI-Office hashes unchanged**, inventory akhir **108 files** di luar node_modules. Historical fixtures masing-masing **22/22 hashes unchanged**, S fixture **6/6**, dan Hermes3D tracked **647/647 hashes unchanged**. Semua retained roots dipertahankan, tidak ditulis/dihapus. Tidak melakukan cleanup. Bounded process/listener inspection tidak menemukan task-owned process atau listener uji yang tertinggal; tidak ada proses dihentikan.

Tidak ada MXC/Codex/help/version/helper/WSL/model/app-server launch, provider auth/OAuth/login/logout, paidAPI/creditfallback, installation/upgrade/replacementbinary, globalenv/home/config/managedpolicy/ACL/firewall/Defender/UAC/feature/admin/reboot change, credential/privateconversation/browser-cookie read, Gitinit, Hermes/VisualLab write, externalissue/comment/email/upload. Process inspection hanya metadata; tidak ada proses dihentikan.

Historical tests **300 PASS/1 SKIPPED** dan **60 host security PASS** tidak dijalankan ulang atau dihitung sebagai S2 tests. Hasil S error203 juga historical execution, sekarang hanya receiptnya dibaca. No whole-repository source audit baru; hash comparison digunakan untuk change safety.

## 17. Recommended next bounded action

Pilih **Option A: Official MXC support guidance**. Owner meninjau standalone draft companion dan, bila menyetujui destination/content/disclosure, mengotorisasi submission manual atau task terpisah. Usulan milestone berikut: **M02-02S3 — Owner-Approved MXC Support Submission and Response Triage**; **belum dimulai**. S2 tidak memberikan approval submission atau launch berikutnya.

OptionB hanya setelah exact supported prerequisite/applicability diketahui, rollback test-only ditetapkan, isolation tetap ketat dan retest diotorisasi terpisah. Jangan menafsirkan PR merged sebagai izin upgrade/fix sekarang. OptionC adalah separately authorized documentation-only WSL2 feasibility bila MXC tidak terselesaikan atau support tidak memberi jalan yang layak; actual Linux boundary harus diuji terpisah kelak, bukan dijadikan fallback otomatis.

Host path policy, atomic issuance satu authority, synthetic approvals dan tested supervision tetap **HOST_VERIFIED historis**. OS filesystem/private credentials/hostile tree/actual approvals/cancellation/app-server/durable production lease/cross-process deduplication/billing cap tetap **NOT VERIFIED**, subscription eligibility **UNKNOWN**, real worker **BLOCKED**. DEC-001–DEC-006 tidak diubah.

**M02-02S2 COMPLETE — REDACTED SUPPORT PACKAGE READY — MXC STARTUP BLOCKED — REAL WORKER BLOCKED — AWAITING OWNER REVIEW.**
