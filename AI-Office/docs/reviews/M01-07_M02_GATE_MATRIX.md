# M01-07 M02 Gate Matrix

Tanggal: 29 Oktober 2026 (Asia/Jakarta). Baseline: M00B-1.1. Root: `D:/Rajendra/AI-Projects/AI-Office`.

**M01: ACCEPTED — FIXTURE FOUNDATION. M02: READY FOR BOUNDED M02 PLANNING ONLY.**

Dokumen ini menilai readiness dari source dan existing tests yang dijalankan dalam M01-07. Dokumen ini tidak memberi izin worker, login provider, paid API, discovery/eksekusi skill, atau akses data proyek berharga. Evidence lengkap, findings F01–F08, dan protected-file SHA-256 terdapat di [Foundation Acceptance Report](M01-07_FOUNDATION_ACCEPTANCE_REPORT.md).

Status: **PASS** berarti tes terkait benar-benar dijalankan berhasil dalam scope tertulis; **NOT RUN** berarti operasi tidak dijalankan; **NOT VERIFIED** berarti bukti tidak cukup/tes dilewati; **FAIL** berarti tes gagal; **NOT APPLICABLE** berarti di luar objek pengujian saat ini. Gate execution “tertahan” menyatakan kondisi untuk tahap masa depan, bukan test FAIL M01.

## 1. Verified foundation readiness

| Gate | Kemampuan M01 | Status / actual evidence | Batas untuk M02 |
|---|---|---|---|
| FND-01 | Domain contracts | PASS: lima contract test files dalam kedua `npm test`; strict UUID/schema/version/project refs/readonly data; `src/contracts/` | Tidak memodelkan seluruh real worker command/attempt/approval lifecycle |
| FND-02 | Workspace identity/binding | PASS: `workspace/identity.test.ts`, `registry.test.ts`, `paths.test.ts`; exact consent, UUID restart, root replacement/duplicate/stale denial | Foreground UI lease saja; OS enforcement terpisah |
| FND-03 | Project-scoped persistence | PASS: actual node:sqlite, private per-project DB/header, transactions/FK/integrity/error tests; missing DB tidak reset | Bukan backup, power-loss atau multi-process hostile concurrency proof |
| FND-04 | Shared Brain | PASS: registered version lookup, byte hash, UTF-8/size/link checks, changed APPROVED → effective UNVERIFIED/content null; `state/brain.test.ts` | Untrusted Markdown bukan execution instructions; hash verified saat read saja |
| FND-05 | UI/backend integration | PASS: typecheck/build dan dua real Chrome E2E; explicit metadata/state confirmation, backend-derived READY, real Brain/activity, desktop/mobile screenshots dibuka | Diagnostic fixture shell; bukan office final/preview platform |
| FND-06 | A/B isolation + restart | PASS: `state/service.test.ts`, `state/http.test.ts`, actual new-process `state/process.test.ts`, browser `shell.spec.ts`; colliding IDs terpisah, stale/forged denied, late A ignored, records unchanged | Tidak membuktikan background worker binding, runtime restart atau duplicate real execution |
| FND-07 | Session/local API boundary | PASS: Host/Origin/session/nonce/expiry/body/method/error/proxy negative tests; no execution routes | Localhost guard bukan OS sandbox; browser session bukan provider sign-in |
| FND-08 | DEMO provenance/OFF policy | PASS: source literal demo, historical events/counts stable, UNKNOWN quota, workers/providers/paid/skills false | Tidak membuktikan provider quota/billing behavior nyata |
| FND-09 | Skill metadata boundaries | PASS: pure projection/31 skill web tests, global/project separation, assignment ≠ availability ≠ permission ≠ enforcement, honest ordinary empty inventory; no skill endpoint | Inventory/provenance/session proof tidak tersedia; fixture metadata bukan runtime observation |

Command evidence independen: `npm run typecheck` PASS; `npm run build` PASS; `npm test` dua kali berurutan masing-masing **300 PASS / 1 SKIPPED / 0 FAIL**, 22 files (9.59 s, 14.58 s); `npx --no-install vitest run tests/integration/state/failures.test.ts` **14 PASS**, 5.26 s; `npm run test:e2e` **2 PASS**, 28.2 s, 1 worker/retries 0. Hitungan focused tests merupakan pengulangan subset, bukan tambahan test cases baru.

Windows directory ACL test `tests/integration/workspace/paths.test.ts:97` tetap **SKIPPED / NOT VERIFIED**. Timeout historis case missing DB: **NOT REPRODUCED under the tested execution conditions.** Penyebab belum dibuktikan/diperbaiki; variasi durasi dan dua run tidak menghapus potensi flakiness.

## 2. Runtime gates: belum memberikan bukti M02

Seluruh operasi runtime di bawah **NOT RUN** pada M01-07. M01 fixtures hanya menyediakan prasyarat aplikasi. Bukti harus diperoleh melalui task/PoC terpisah dengan scope yang disetujui; beberapa penolakan/handshake terkontrol memang memerlukan bounded runtime preflight. Kelulusan kontrol tidak boleh diasumsikan sebelum memberi task coding atau akses proyek.

| Gate | Requirement / status kini | Evidence minimum yang diperlukan | Dampak execution / keputusan |
|---|---|---|---|
| RT-01 | Official permitted Codex integration interface — NOT RUN / NOT VERIFIED | Dokumentasi resmi terkini yang sesuai tujuan integrasi, pinned interface/version, constraints dan sanitized handshake; tidak mengasumsikan wrapper/account access mengizinkan otomasi | Tertahan sebelum integration execution; Owner menyetujui interface/scope yang terbukti |
| RT-02 | Subscription entitlement / usage applicability — NOT RUN / NOT VERIFIED | Hak akun/subscription untuk interface/model/runtime dan tujuan penggunaan tersebut; bedakan login, model access, runtime access, usage limits dan billing route | Tertahan; subscription-first wajib, tidak membuat klaim entitlement dari M01 |
| RT-03 | Supported sign-in/session mechanism — NOT RUN | Jalur sign-in resmi yang diizinkan Owner, secret handling/re-auth/session invalidation dan expiry proof tersanitasi | Tidak login pada audit ini; jangan memakai session browser M01 sebagai provider session |
| RT-04 | Runtime isolation — NOT RUN / NOT VERIFIED | Pilihan containment, threat model, denial tests akses state/credentials/network/process sesuai izin, termasuk proses turunan dan same-user risk | Tertahan sebelum worker coding; folder separation/worktree bukan pembuktian |
| RT-05 | Worker filesystem scope — NOT RUN | Immutable canonical project/worktree/root binding; allowlisted read/write paths, sibling/cross-project/dummy secret escape denial dan tested reparse handling | Tertahan sebelum filesystem access worker |
| RT-06 | Windows sandbox/equivalent containment — NOT RUN / NOT VERIFIED | Existing ACL skip tetap dicatat; proof proteksi worker efektif tanpa merusak proyek/ACL pengguna, termasuk authoritative DB/evidence store | Tertahan untuk worker; schema/path checks M01 tidak cukup (F02) |
| RT-07 | Explicit read/write approvals — NOT RUN | Policy/version, command/task/attempt/project/revision-bound approval; reject, expiry, revoke, escalation/extra-path denial; no replay | Metadata/state consent M01 bukan persetujuan worker; perlu scope Owner terpisah |
| RT-08 | Cancellation/process cleanup — NOT RUN | Cancel request dan acknowledgement actual, process tree ownership, bounded stop, child cleanup, lease/approval revoke dan no continued writes | Tertahan; graceful launcher close M01 tidak membuktikan worker cancellation |
| RT-09 | Crash/restart recovery — NOT RUN | Actual runtime interrupted attempt reconciliation, inspect/resume bila supported, ambiguous outcomes, preserved evidence, fail-closed stale lock/state handling | Tertahan; OS backend restart fixture bukan real task recovery (F04) |
| RT-10 | No duplicate task execution — NOT RUN | Durable command/task/attempt identities, repeated/retried command and restart tests, side-effect reconciliation; satu authority/orchestrator | Tertahan; idempotent demo seed tidak memenuhi gate real execution |
| RT-11 | Provider quota behavior — NOT RUN / NOT VERIFIED | Sumber usage/limit resmi bila tersedia dan blocked/unknown behavior yang diuji tanpa fabrikasi nilai | UNKNOWN tetap dipertahankan; policy harus aman saat data tidak tersedia |
| RT-12 | Billing OFF / no silent paid fallback — NOT RUN untuk runtime | Controlled proof jalur API billing tidak dipilih/diaktifkan saat quota/auth/runtime gagal; hard policy + adapter deny path, sanitized evidence | Tertahan sebelum runtime; M01 literal false hanya foundation proof |
| RT-13 | Runtime skill availability/enforcement — NOT RUN / NOT VERIFIED | Bounded read-only discovery bila diizinkan, provenance/revision/license/trust, actual session visibility dan allowed/denied enforcement proof terikat policy/session | Skill activation tertahan; jika PoC awal tidak membutuhkan skill, tetap OFF dan jangan klaim PASS (F06) |
| RT-14 | Worker binding independent of foreground — NOT RUN | Separate backend-owned immutable worker lease/task/attempt; A worker tetap A atau safe pause sesuai approved policy saat UI B; cross-project denial | Tertahan; UI foreground binding M01 sengaja dicabut saat switch, bukan background worker lease |
| RT-15 | Auditability of real execution — NOT RUN | Source=real event contract, project/task/attempt/runtime/revision refs, timestamps/order, output/artifact/test evidence dan sanitization; DEMO dipisah | Tertahan; event demo tidak dapat dipromosikan menjadi runtime proof |
| RT-16 | Minimal safe backup before valuable data — NOT RUN / NOT VERIFIED | Consistent SQLite + documents/artifacts snapshot, manifest/checksum/schema validation, secret exclusions, restore drill, stable identity/conflict denial | **Data berharga tertahan.** Disposable-only PoC dapat direncanakan tanpa production portability (F01) |

Gate pendukung tambahan:

| Gate | Status dan tindakan berikut |
|---|---|
| AUX-01 Fixture configuration | Source containment + executed outside-root denial PASS. Nilai/disposability root adalah trusted operator input, bukan sertifikasi otomatis. Tetapkan absolute approved project/data paths dan dummy content untuk tiap PoC; jangan pakai root luas atau proyek berharga (F03) |
| AUX-02 Source handoffs | Subscription-first dan visual handoffs tetap MISSING di AI-Office. Sumber resmi runtime/account tetap wajib; dokumen yang hilang tidak membatalkan DEC dan tidak boleh diinvent. Visual intake menunggu original approved pack/source; bukan dependency circular foundation (F05) |
| AUX-03 Dataset/concurrency/durability | Synchronous small fixture DB, max 4 MiB/100 records per table/25 ms busy timeout; load besar, power-loss dan hostile multi-process safety NOT VERIFIED. Perlu scope terpisah bila tujuan PoC melampaui batas |
| AUX-04 Visual assets | Tidak mengintegrasikan aset/3D pada M01-07; external package validation NOT RUN. Jangan membuat replacement PM Room/Boss PM untuk membuka gate runtime |
| AUX-05 Stability monitoring | F07 tidak memblokir planning saat ini. Bila timeout berulang serius, rekam kondisi dan lakukan bounded remediation/reverification sebelum acceptance tahap terkait |

## 3. Blockers dan batas penggunaan

Tidak ada critical foundation blocker yang ditemukan pada scope M01 disposable. **Eksekusi M02 belum dapat dinyatakan siap**, karena RT-01–RT-15 belum dibuktikan/diotorisasi untuk scope nyata. Gate skill hanya berlaku ketika skill ingin diaktifkan; OFF bukan PASS enforcement. RT-16 berlaku sebelum data berharga, tanpa memaksakan seluruh M05 portability ke awal M02.

Batas fixture yang sudah ada:

- Launcher membutuhkan `AI_OFFICE_FIXTURE_ROOT` dan `AI_OFFICE_DATA_ROOT`; backend memvalidasi canonical containment dan project/data overlap. Browser tidak dapat mengganti konfigurasi itu.
- Ordinary backend tanpa fixtureState hanya identity metadata mode; `/api/state/initialize` menghasilkan 503 dan tidak membuat DB. Metadata dapat dibuat di folder lokal setelah exact-folder consent; mode ini bukan backup/production authorization.
- Configured “fixture” root masih bisa salah dipilih operator. Future plan harus menentukan root disposable eksplisit, bukan sekadar menamai env var. Audit hanya menggunakan fresh temp roots existing harness.
- Snapshot API adalah read projection, bukan consistent durable backup. Marker/Markdown berada di folder proyek, DB di private app-data; folder-only copy tidak lengkap.
- Corrupt/missing/partial state, duplicate IDs, moved roots dan stale writer locks ditahan untuk review. Jangan menghapus lock/ledger/DB atau membuat identity baru otomatis untuk melewati gate.

## 4. Subscription-first dan execution restrictions

DEC-004 tetap berlaku: Codex kandidat PoC pertama, interface harus resmi dan diizinkan untuk penggunaan yang dimaksud; quota UNKNOWN tanpa evidence sah; **Paid API OFF** dan **tidak ada silent API-billing fallback**. Login bukan entitlement, entitlement model bukan hak automation/runtime, dan subscription bukan bukti billing route. M01-07 tidak membaca ulang provider terms/account atau melakukan sign-in; statusnya NOT RUN / NOT VERIFIED.

DEC-002/003 tetap berlaku: satu Project State authoritative dan future deterministic execution controller; future LangGraph reasoning tidak memiliki scheduler/task DB sendiri. Worker perlu lease independen UI, serta explicit approved background/safe-pause policy. Tidak menyalakan parallel workers untuk membuktikan foundation.

DEC-006 tetap berlaku: metadata assignment/policy bukan runtime permission; global scope bukan filesystem permission. Tanpa provenance/session/enforcement evidence, jangan discovery luas, install, menjalankan script skill, atau mengubah UNKNOWN menjadi AVAILABLE.

DEC-005 tetap berlaku: Owner Visual Lab memegang golden assets. Runtime readiness tidak membutuhkan menggambar room/character baru atau mengubah Google AI Studio.

## 5. Recommended bounded next step

**Usulan tahap berikut hanya rencana/preflight M02 terpisah**, menunggu Owner review M01-07 dan instruksi scope berikutnya:

1. Tentukan pertanyaan feasibility, official interface/version candidate dan evidence yang harus diperoleh, termasuk current official documentation/account applicability. Jangan mengasumsikan compatibility dari nama Codex saja.
2. Tetapkan root disposable/dummy data, app-data, satu bounded task bila akhirnya diizinkan, allowed paths/tools/process/network, authoritative-state protection, evidence outputs dan retention/cleanup.
3. Rancang fail-closed approval/billing/OFF policy, cancellation/process tree cleanup, crash reconciliation, no duplicate execution dan worker binding yang tidak mengikuti UI foreground.
4. Nyatakan gate mana dapat dinilai read-only dan mana perlu separately authorized runtime preflight. Pisahkan task planning dari first execution; jangan memanggil provider pada tahap audit ini.
5. Tetapkan acceptance/stop conditions serta sanitized evidence per gate. Data berharga tetap dilarang sampai minimum backup/restore proof; skill tetap OFF bila tidak dibutuhkan PoC pertama.

Tidak ada implementation plan baru yang dieksekusi, source fix, task dispatch, runtime session atau login di dalam M01-07.

## 6. Owner decisions sebelum real execution

Owner review diperlukan terhadap rekomendasi acceptance dan scope PoC berikutnya. Persetujuan harus menyebut interface/account yang boleh digunakan; disposable project/data roots; permission boundary; satu task/attempt dan maximum scope; billing OFF/no fallback; approval/cancel/stop/recovery policy; kebijakan foreground/background; skill OFF atau discovery-only scope terpisah; serta evidence yang boleh disimpan tanpa secrets.

Membaca/menyetujui dua laporan ini tidak otomatis memberi semua izin tersebut. Approval scope pertama dan bukti gate terkait harus diperoleh sebelum real coding task diberi akses.

**M01-07 FOUNDATION VERIFICATION COMPLETE — M01 ACCEPTED FOR FIXTURE DEVELOPMENT — AWAITING OWNER REVIEW.**

