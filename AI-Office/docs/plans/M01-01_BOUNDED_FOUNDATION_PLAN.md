# AI OFFICE — M01-01 Bounded Foundation Implementation Plan

Tanggal: 28 Oktober 2026. Versi rencana: M01-01-1. Baseline: **M00B-1.1**.

Status: **PROPOSED IMPLEMENTATION PLAN — AWAITING OWNER REVIEW**. M01-01 hanya membuat dokumen ini. Tidak ada izin memulai M01-02, membuat source/config, memasang dependencies, menjalankan layanan/worker, atau mengubah repository lain.

Kategori: **APPROVED CONSTRAINT** = DEC-001–DEC-006; **DOCUMENTED REQUIREMENT** = intent Owner/baseline M00B-1.1; **VERIFIED SOURCE FINDING** = file atau dokumentasi resmi yang diperiksa; **RECOMMENDATION** = pilihan teknis untuk scope terbatas; **UNVERIFIED / REQUIRES PROOF** = belum diuji. Rekomendasi tidak menjadi keputusan Owner secara otomatis.

## A. Executive Recommendation

**RECOMMENDATION.** Pilih **Vite + React + TypeScript**, backend lokal **Node.js + TypeScript** berumur panjang, SQLite melalui **`node:sqlite`**, Markdown untuk isi knowledge, dan **HTTP command API + snapshot polling** untuk M01. Gunakan satu package/dependency graph, tanpa monorepo framework, ORM, Docker, cloud database, atau desktop wrapper. Backend memiliki lifecycle sendiri; tab/UI dapat reload atau ditutup tanpa menjadi sinyal penghentian backend.

**RECOMMENDATION.** Satu vertical slice membuktikan: buka folder A nyata → persistent identity → baca knowledge v1/state A → tampilkan satu task/agent **DEMO** → buka folder B nyata → data A tidak terbawa → restart aplikasi → B lalu A tetap mempunyai identity/state asli. Tidak membutuhkan LLM, backend proyek yang dikerjakan agent, atau GLB final.

**RECOMMENDATION.** Untuk development M01, pakai metadata identity project-local dan **private application-managed state sementara**, dengan path resolver yang dapat diganti. Ini pilihan development yang memerlukan persetujuan, bukan penetapan database produksi atau bukti sandbox. Folder terpisah/ACL pengguna biasa belum melindungi database dari worker dengan akun OS yang sama. Aktivasi worker tetap tertahan sampai gate M02 membuktikan proteksi baca/tulis dan state.

**APPROVED CONSTRAINT / DOCUMENTED REQUIREMENT.** Pertahankan seluruh arah berikut:

| Keputusan | Dampak pada M01 |
|---|---|
| [DEC-001](../AI_OFFICE_CURRENT_BASELINE.md#dec-001) | Aplikasi mandiri; selective reuse; tanpa full fork atau perubahan Hermes3D |
| [DEC-002](../AI_OFFICE_CURRENT_BASELINE.md#dec-002) | Kontrak state untuk orchestrator masa depan; belum membangun LangGraph, scheduler, retry engine atau worktree automation |
| [DEC-003](../AI_OFFICE_CURRENT_BASELINE.md#dec-003) | Root folder nyata; identity dan state/knowledge/session scope eksplisit; worker binding tidak bergantung foreground |
| [DEC-004](../AI_OFFICE_CURRENT_BASELINE.md#dec-004) | Codex PoC pertama pada M02; **Paid API OFF**, tanpa silent paid fallback; quota **UNKNOWN** |
| [DEC-005](../AI_OFFICE_CURRENT_BASELINE.md#dec-005) | Visual Lab Owner independen/paralel; M01 cukup visual mapper tanpa room/character baru |
| [DEC-006](../AI_OFFICE_CURRENT_BASELINE.md#dec-006) | Metadata/policy skill saja; discovery dan actual-session proof menunggu M02 |

**DOCUMENTED REQUIREMENT.** Hybrid Task Control tetap dua jalur menuju task system/orchestrator yang sama, dengan PM informed tanpa mandatory reasoning call untuk setiap direct task. Early frontend preview tetap contract-aware, dan project memory tetap portable secara konseptual. M01 menyediakan scope/identity/source fields dan batas integrasinya; tidak mengaktifkan task assignment nyata, preview platform, export/import production, atau background execution.

## B. Verified Environment & Source Inputs

**VERIFIED SOURCE FINDING.** Root aktual `D:\Rajendra\AI-Projects` berisi `AI-Office/` dan `Hermes3D/`. Sebelum rencana ini dibuat, AI-Office berisi lima Markdown, tanpa `.git`, package manifest atau application source. Node yang dilaporkan shell `v24.21.0`, npm `11.19.0`. Tidak ada aplikasi AI Office yang dijalankan atau dependency compatibility test dalam M01-01.

| Sumber yang dibaca | Bukti yang digunakan / batasnya |
|---|---|
| [Current Baseline](../AI_OFFICE_CURRENT_BASELINE.md) | Metadata M00B-1.1; enam keputusan, boundaries C–J, authority dan unverified dependencies |
| [Current Roadmap](../roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md) | Metadata M00B-1.1; scope/gate M01/M02 dan urutan M01-02–M01-07 |
| [Alignment Report](../decisions/M00B_ALIGNMENT_REPORT.md) | Metadata M00B-1.1; open decisions, missing sources, historical/current documentation checks; runtime tests tetap NOT RUN |
| [MASTER_SYSTEM](../specifications/MASTER_SYSTEM.md) | Historical V4.0; bagian reasoning/execution, Git, storage, event, runtime, security dan portability; bukan otoritas milestone terbaru |
| [MASTER_DESIGN](../specifications/MASTER_DESIGN.md) | Historical V1; project focus/switching, knowledge scope dan task interaction; dibaca sesuai klarifikasi M00B-1.1 |
| [Hermes3D package.json](../../../Hermes3D/package.json) | Next 16.1.7, React 19.2.3, R3F/Drei/Three, TypeScript dan test tooling dideklarasikan; bukan paket yang sudah dipasang pada AI Office |
| [cameraLighting.tsx](../../../Hermes3D/src/features/retro-office/systems/cameraLighting.tsx) | R3F/Three dan dependency scene lokal; ada helper `orthoZoomToDistance` yang relatif kecil |
| [SceneErrorBoundary.tsx](../../../Hermes3D/src/features/retro-office/systems/SceneErrorBoundary.tsx), [AGENTS.md](../../../Hermes3D/AGENTS.md) | Kandidat renderer boundary dan batas frontend/proxy/gateway; tanpa ekstraksi/perubahan saat ini |

**VERIFIED SOURCE FINDING.** Dua handoff tetap **MISSING** pada inventaris/pencarian AI-Office: `AI_OFFICE_HANDOFF_SUBSCRIPTION_FIRST_2026-10-28.md` dan `AI_OFFICE_VISUAL_ASSET_HANDOFF_V1.md`; `docs/handoffs/` belum ada. Tidak ada kutipan/isi handoff yang direkonstruksi. Rencana foundation tidak bergantung pada keduanya. Paket visual, provider entitlement, OS sandbox dan runtime PoC **UNVERIFIED**.

**VERIFIED SOURCE FINDING.** Hermes3D tetap HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`, dengan perubahan existing `package-lock.json` sebelum task. Rencana ini tidak mengadopsi lockfile, konfigurasi, credential atau state Hermes.

**VERIFIED SOURCE FINDING — dokumentasi eksternal, diakses 28 Oktober 2026.** Dokumentasi resmi Vite/Next, Node SQLite, Zod dan SQLite dirujuk pada C/F. Itu bukti interface/dokumentasi, bukan keberhasilan implementasi lokal. Exact patch dependencies dan kecocokan `node:sqlite` pada executable terpasang perlu dibuktikan setelah task implementasi diizinkan.

## C. Stack & Local Development Lifecycle

### C1. Stack yang dipilih untuk diusulkan

| Area | Rekomendasi bounded | Alasan dan proof yang diperlukan |
|---|---|---|
| UI | Vite, React, TypeScript; CSS sederhana | M01 client UI tidak memerlukan SSR/SEO/server components; pisahkan file/browser logic dari backend. React memungkinkan selective R3F reuse nanti; tidak menyalin Next-specific imports |
| Backend | Node 24.x yang dipin + TypeScript; `node:http` untuk sedikit routes | Satu long-lived backend modular; tidak perlu HTTP framework tambahan untuk scope ini. Validasi JSON/body/error/route dilakukan eksplisit |
| Runtime validation | Zod untuk shared contracts + inferred TS types | Satu definisi validation untuk boundary UI/server dan test, tanpa schema orchestrator lengkap |
| Persistence | `node:sqlite` di module state; Markdown project-local | Tidak perlu native npm addon terpisah; bungkus akses SQL agar driver/lokasi bisa dievaluasi ulang tanpa mengganti domain |
| Development tooling | npm, TypeScript, tsx, Vite React plugin | Satu root package; pin versi kompatibel dan lockfile AI Office sendiri saat diizinkan; tanpa menyalin node_modules Hermes |
| Tests | Vitest untuk contracts/services; Playwright untuk satu alur UI A/B/restart | Fixture lokal disposable; checks menguji invariant, bukan jumlah komponen |
| Realtime M01 | HTTP POST commands dan GET snapshot polling | Satu snapshot resmi; tidak perlu broker/event streaming server penuh |
| Future 3D | Kontrak visual projection/asset refs saja | R3F/Three/Drei baru ditambahkan ketika import/spike benar-benar memerlukannya |

**VERIFIED SOURCE FINDING.** Vite mendokumentasikan template React/TypeScript, development HMR dan kebutuhan Node; Node 24 yang terdeteksi memenuhi batas versi dasarnya, tetapi template/dependency compatibility belum diuji. [Vite guide](https://vite.dev/guide/). Zod menyediakan schema validation dan static type inference. [Zod documentation](https://zod.dev/).

**VERIFIED SOURCE FINDING.** Dokumentasi lini Node 24 menyatakan `node:sqlite` **Stability 1.2 — Release candidate**, dengan `DatabaseSync` yang synchronous. Ini risiko material, bukan API yang diklaim stabil penuh. Halaman official exact v24.21.0 tidak berhasil diambil; rujukan yang tersedia adalah v24.22.1 lini 24. Gunakan subset API dasar dan uji executable yang dipin, bukan fitur patch lebih baru. [Node 24 SQLite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html).

**RECOMMENDATION.** Terima kandidat driver tersebut hanya untuk development foundation setelah smoke test open/transaction/close/reopen pada M01-04. Batasi query kecil; synchronous DB tidak dipakai untuk kerja panjang. Jika API/locking gagal, hentikan task dan ajukan penggantian driver pada repository boundary yang sama; jangan mengganti diam-diam. Tidak perlu connection pool, worker-thread DB atau ORM sekarang.

### C2. Alternatif serius dan trade-off

1. **Next.js + React/TypeScript, backend Node terpisah:** alternatif jika reuse route/UI Next ternyata bernilai besar. Tetap tidak boleh menaruh scheduler pada request handler. Untuk M01, SSR dan server/client conventions menambah permukaan yang belum diperlukan, sehingga Vite dipilih. Next memang dapat memakai backend existing tanpa custom server. [Next custom-server guide](https://nextjs.org/docs/app/guides/custom-server).
2. **SQLite melalui `better-sqlite3`:** alternatif driver bila Owner tidak menerima RC atau smoke test builtin gagal. Native addon menambah dependency/Windows binary compatibility yang perlu dibuktikan; tidak dipilih default, tidak dipasang atau diuji pada task ini. Pilihan ini hanya fallback yang memerlukan review berbasis bukti, bukan dual-driver implementation. Dokumentasi maintainer menjelaskan supported Node dan prebuilt binaries; itu tidak membuktikan binary kompatibel sudah tersedia di mesin ini. [better-sqlite3 maintainer documentation](https://github.com/WiseLibs/better-sqlite3).

**RECOMMENDATION — transport.** Poll snapshot misalnya setiap 2 detik hanya saat workspace READY; refresh segera setelah command. Polling dipilih atas SSE/WebSocket karena belum ada worker stream. SSE sesuai stream satu arah saat M02 memerlukan event; WebSocket dipertimbangkan jika komunikasi bidirectional membutuhkannya. Pergantian transport memakai envelope/snapshot yang sama, bukan task store baru. Interval/freshness adalah parameter aplikasi usulan, bukan kuota provider; initial UNKNOWN lalu STALE jika polling gagal, dengan last-known label dan project ID tetap benar.

### C3. Startup/shutdown lokal

**RECOMMENDATION.** Development launcher berupa script Node di root aplikasi, ditambahkan hanya dalam task implementasi yang diizinkan. Ia menjalankan backend dan Vite sebagai child processes terpisah menggunakan executable Node dan argv; tidak merangkai shell command dari path proyek. Di Windows jangan bergantung Bash/WSL atau asumsi `.cmd` dapat dieksekusi seperti binary lintas OS.

- Backend bind **127.0.0.1** pada port tetap yang tersedia; Vite bind loopback dengan strict port. Port clash adalah error eksplisit, bukan membuka port publik atau mengambil alih proses lain.
- Mulai backend → tunggu health readiness → mulai Vite dengan `/api` proxy ke backend → tampilkan URL UI tanpa credential. Browser dapat dibuka manual. Vite mendukung proxy dan explicit allowed hosts; jangan gunakan wildcard host/allowedHosts. [Vite server options](https://vite.dev/config/server-options).
- UI reload/close tidak mematikan backend. Lifecycle dikendalikan launcher/operator; tidak memasang Windows service atau always-on startup.
- Backend unavailable ditampilkan sebagai disconnected/error, tanpa fallback data proyek lain atau klaim live worker. Retry hanya reconnect/read, bukan replay command mutasi otomatis.
- Ctrl+C/stop launcher: hentikan command baru, batalkan poll, tunggu operasi/transaksi singkat selesai atau rollback, tutup statement/DB handles, flush registry secara aman, lalu hentikan child miliknya. Shutdown timeout menjadi failure report; tidak membunuh proses Node lain dengan pencarian nama.
- Satu backend per application data root. Gunakan single-instance claim; claim yang tertinggal setelah crash harus menghasilkan recovery-needed, bukan dihapus otomatis berdasarkan PID saja. Uji stale-claim handling pada fixture; production recovery lengkap M05.
- Backend crash tidak otomatis menjalankan ulang command. UI menampilkan offline; restart membaca identity/state dan memerlukan attach baru. Vite HMR hanya UI; restart backend development tidak menghapus state atau menghidupkan worker.

**DEFERRED.** Electron/Tauri/installer/service, native notifications, full preview infrastructure, background-worker policy dan remote access bukan kebutuhan M01. Browser-hosted UI adalah jalur development aplikasi lokal; backend/command boundary tetap dapat dipanggil desktop shell kelak.

## D. Minimal Module / Folder Structure

**RECOMMENDATION — ilustrasi future files, belum dibuat.** Pertahankan lima Markdown existing. Satu root package cukup; tidak membuat semua modul roadmap sebagai direktori kosong.

```text
AI-Office/
  docs/                         # existing; tidak diubah oleh task planning ini
  package.json                  # hanya setelah izin M01-02
  tsconfig*.json
  vite.config.ts
  index.html
  scripts/dev.mjs                # launcher bertahap M01-03/M01-05
  src/
    contracts/                  # project/workspace, knowledge, demo/events,
                                # policy dan capability refs; tidak impor Node/React
    server/
      index.ts                  # lifecycle, shutdown dan instance claim
      http.ts                   # allowlisted API, body limit, session/CSRF guard
      policy.ts                 # workers/API disabled; project-scope checks
      workspace/                # path validation, identity, registry, bindings
      state/                    # DB location resolver, schema v1, scoped repository
      brain/                    # version/hash + authorized Markdown read
    web/
      App.tsx                   # minimal shell
      api.ts                    # transport dan request-generation checks
      workspace/                # open/loading/error/ready + project panel
      visual/mapper.ts          # state projection; tanpa asset loader aktif
    demo/                       # fixture definitions; hanya eksplisit, source=demo
  tests/
    contracts/
    integration/                # path/identity/state/API fixture tests
    e2e/                        # satu acceptance flow UI
```

**RECOMMENDATION.** Config/testing files hanya ditambah saat task yang memerlukannya mendapat izin, bukan seluruh tree sekaligus. Skill metadata dan future runtime/asset references cukup pada contracts; belum ada `runtimes/codex/`, LangGraph, CEO, PM, Telegram, DevOps atau multi-office implementation folders. Test evidence dapat dikembalikan dalam task report; dokumen baru di luar scope perlu izin tersendiri.

**DOCUMENTED REQUIREMENT.** User project root berbeda dari source aplikasi. Folder temporary test projects dan test app-data dibuat di temporary directory terisolasi saat testing nanti, bukan menyimpan semua database pengguna dalam repository AI Office. Tidak ada user project atau data directory yang dibuat pada M01-01.

## E. Workspace Manager Design

### E1. Pemilihan root dan identity

**RECOMMENDATION.** UI awal Open Project menerima absolute Windows folder path yang dipilih Owner, misalnya melalui Copy as path di Explorer. Ini membuka directory sebenarnya melalui backend, bukan mengganti filter dashboard. Native folder dialog ditunda sampai launcher memerlukannya; browser upload/directory handle tidak diperlakukan sebagai canonical host path.

1. Server menerima open request melalui local session guard, memvalidasi ukuran/format, absolute path dan directory existence/read access. Tolak NUL, relative/drive-relative path, device namespace, drive root dan jalur network/UNC pada scope M01; read-only/inaccessible root menghasilkan error yang dapat ditindaklanjuti.
2. Resolve canonical path menggunakan filesystem, bukan string prefix. Unicode/spaces didukung tanpa shell interpolation. Identifikasi alias/junction; validasi real containment untuk metadata/Markdown. `.ai-office/` atau isi brain yang mengarah keluar root ditolak. Alias root yang sama tidak boleh menghasilkan identity baru; tidak mengandalkan lowercasing string sebagai satu-satunya validasi.
3. Baca marker `.ai-office/project.json` terbatas pada schema v1: `projectId`, `createdAt`, `schemaVersion`; nama tampilan bukan identity. Marker adalah input tidak tepercaya; cocokkan ID/canonical root terhadap registry dan header state.
4. Jika marker belum ada, tampilkan **Initialize AI Office metadata** dengan daftar lokasi yang akan ditulis. Hanya setelah konfirmasi Owner/izin task, buat identity UUID dan marker secara exclusive; jangan menulis Git/config existing atau membuat `.git`. Membuka root saja tidak membuat skill, brain content atau demo records tanpa operasi eksplisit yang diizinkan.
5. Jika ID sama terdaftar pada root berbeda, root/ID/header tidak cocok, marker rusak, atau state existing hilang, tahan attach dengan error `IDENTITY_CONFLICT`/`STATE_UNAVAILABLE`. M01 mendeteksi dan menolak; tidak mengimplementasikan automatic clone/merge/production relink.
6. Registry privat menyimpan mapping project ID ke root yang tervalidasi serta last-ready project. Tidak menerima DB path dari client/marker dan tidak berisi task/knowledge kedua. First-time attach/import marker yang belum dikenal membutuhkan konfirmasi; path proyek lain tidak ditebak dari ID.

**RECOMMENDATION.** Identity initialization lintas marker/registry/database tidak diasumsikan satu transaksi. Simpan fase initialization terbatas, tulis marker secara exclusive dan registry secara aman, lalu hanya beri READY setelah semua reference yang diperlukan konsisten. Retry attach tidak membuat UUID/demo kedua. Partial initialization setelah crash menghasilkan recovery-needed; hanya lanjutkan ID yang sama jika seluruh referensi cocok, selain itu tahan untuk review. Jangan mengganti marker/DB yang ada dengan seed baru.

### E2. Kepemilikan state dan transisi

| State | Pemilik dan isi |
|---|---|
| Foreground workspace | UI session: selected binding, request generation, lifecycle, error dan panel; bukan pemilik task state |
| Project registry | Backend: mapping ID/root/private-state reference, initialization status, last-ready selection; bukan brain/task store |
| Project identity | ID stabil pada marker dan header DB, dibuat eksplisit, tidak berubah karena nama/fokus/restart |
| Workspace binding | Backend: opaque binding ID → project ID, canonical root, generation; immutable selama attach |
| Future worker session | Akan mengikat project/workspace/task/attempt/runtime/policy sendiri; tidak memakai mutable foreground root sebagai cwd |

**RECOMMENDATION.** State machine minimum:

| Dari | Trigger → tujuan | Aturan |
|---|---|---|
| DETACHED | Open → OPENING | Generation baru, cancel poll lama, hapus data panel sebelumnya |
| OPENING | Valid root/identity → LOADING | Init yang diperlukan menunggu konfirmasi eksplisit; load hanya scope binding baru |
| LOADING | State konsisten → READY | Publikasikan satu snapshot/binding dan persist last-ready selection |
| OPENING/LOADING | Validation/load failure → ERROR | Tidak menampilkan data A sebagai B; error menyimpan attempted-root reference yang aman |
| READY | Switch/Close → DETACHING | Serialkan attach; invalidate binding foreground lama, abaikan response tertunda, tutup handle setelah operasi selesai |
| DETACHING | Detach selesai → DETACHED | Switch dapat memulai OPENING target; failure detach ditahan, bukan memaksa READY |
| ERROR | Retry/Open valid → OPENING | Validasi ulang; tidak diam-diam membuat state kosong atau fallback root lama |

**RECOMMENDATION.** Untuk M01 satu foreground UI dan satu active project DB handle cukup. Switch A→B melepaskan A lalu attach B; bila B gagal, tidak auto-mengaktifkan A di bawah label B. UI dapat membuka A kembali secara eksplisit. Semua response membawa binding/project/generation; response A yang selesai setelah switch tidak boleh dirender. Request ke binding detached/stale ditolak.

**DOCUMENTED REQUIREMENT.** Tidak ada real worker dalam M01. Tidak menerapkan pause/continue policy yang belum approved. Simpan batas immutable binding agar kelak foreground detach tidak rebind worker; backend session registry masa depan dapat mempertahankan worker di proyek asal tanpa bergantung state UI.

**RECOMMENDATION.** Restart membaca last-ready selection sebagai kandidat reopen; resolve ulang folder, marker dan state, buat binding baru. Missing/moved folder menampilkan unavailable dan mempertahankan history/mapping lama; jangan menganggap folder baru dengan nama sama sebagai proyek lama. Full relink/migration menjadi M05; M01 cukup fail-safe dan petunjuk bahwa recovery belum tersedia.

## F. Project State & Shared Brain

### F1. Lokasi state: keputusan development sementara

| Pilihan | Manfaat | Risiko/batas |
|---|---|---|
| A — protected project-local `.ai-office/project.db` | Ownership mudah dilihat; state dekat folder | Aman hanya jika worker benar-benar tidak dapat menulis authority files; mengubah ACL user biasa bisa memblokir aplikasi sendiri tanpa membatasi worker akun sama |
| B — private application-managed store per project ID | Tidak perlu mengasumsikan root writable sudah aman; data aplikasi terpisah dari source pengguna | Folder separation bukan sandbox; perlu export/import eksplisit dan backup di luar folder proyek; akses worker akun sama tetap harus dibuktikan |

**RECOMMENDATION.** Pilih **B sementara untuk fixture/development M01**, jika Owner menyetujui. Ilustrasi: `%LOCALAPPDATA%/AI-Office/registry.json` dan `projects/<validated-projectId>/project.db`; marker dan Markdown tetap di root proyek. Gunakan resolver tunggal, data-root override khusus tests ke temporary directory, dan validasi project ID sebelum pembentukan path. Tidak menaruh database pengguna dalam repository aplikasi. Alternatif A tetap terbuka setelah isolation proof; tidak ada dual-authority store.

**DOCUMENTED REQUIREMENT.** Project memory secara logis milik proyek, meskipun database fisik privat. **Copy folder proyek saja bukan complete backup** bila state otoritatif di luar folder. Tidak mengklaim storage B melindungi database dari coding worker; real worker OFF sampai M02. Tidak membuat perubahan ACL/akun OS atau menentukan lokasi produksi pada M01-01.

### F2. Data minimum dan single authority

**RECOMMENDATION.** Satu DB per project, schema version 1. Registry hanya index lokasi; semua fixture task/event dan knowledge metadata resmi berada pada DB yang dipilih oleh binding server.

| Record minimum | Essential fields / constraint |
|---|---|
| Project header | `projectId`, `schemaVersion`, `displayName`, `createdAt`; satu identity header, harus cocok marker dan registry |
| Knowledge version | `projectId`, `knowledgeId`, `version`, `relativePath`, `contentHash`, `source`, `status`, `createdAt`; unique `(projectId, knowledgeId, version)` |
| Demo task fixture | `projectId`, `taskId`, `demoAgentId`, `title`, `state`, `source=demo`, `version`, `updatedAt`; bukan production task DAG |
| Demo event | `projectId`, `eventId`, `taskId`, `agentId`, `sequence`, `source=demo`, `type`, `occurredAt`, `payloadVersion`; unique event identity per project |

**RECOMMENDATION.** Setiap query/mutasi memerlukan binding tervalidasi. Repository selalu memakai project ID dari server binding, menolak expected-project mismatch, dan mengecek header DB; bukan membuka file berdasarkan client-supplied project ID/path. Foreign keys/composite constraints menjaga task/event/knowledge scope; query tidak boleh mengandalkan ID global saja. Conversations dan worker sessions belum memiliki tabel implementasi; kontrak scope-nya disiapkan tanpa store kosong.

**RECOMMENDATION.** Minimal satu Markdown knowledge v1 dibuat hanya dalam test fixture atau explicit demo initialization. UI menampilkannya sebagai fixture/candidate sesuai provenance, bukan requirement approved. DB menyimpan relative path/hash/version/status; backend membaca file dalam canonical project root dengan size limit dan containment check. Jika konten berubah tetapi hash tidak cocok, tampilkan changed/unverified dan jangan menganggap versi approved lama masih valid. Tidak ada broad repo ingestion, full memory retrieval, embedding, vector database atau knowledge graph. Retrieval cukup lookup/list knowledge metadata milik project aktif.

**RECOMMENDATION.** DEMO initializer bersifat eksplisit dan idempotent: tidak berjalan setiap poll/open, tidak overwrite project state, dan tidak membuat event/task duplikat setelah restart. `demoAgentId` memakai namespace demo; identitas agent produksi tidak dibuat. Fixture event persisted tidak diberi timestamp baru untuk mengesankan ada coding live.

### F3. Locking, shutdown, schema dan portability

**RECOMMENDATION.** Satu writer backend, satu connection foreground, prepared statements, foreign keys ON, transaksi singkat, timeout lock terbatas dan rollback saat error. Mulai rollback-journal/FULL untuk dataset kecil satu handle; WAL bukan requirement M01. Database busy/corrupt/versi lebih baru menghasilkan error, bukan penggantian DB dengan seed. Tutup handles saat detach/shutdown; serialization command lokal mencegah concurrent initialization. Tidak ada automatic destructive migration: fresh schema v1 dibuat eksplisit; unsupported version ditolak dan dilaporkan.

**VERIFIED SOURCE FINDING.** WAL tetap hanya mempunyai satu writer dan memerlukan host/filesystem yang sesuai; bukan solusi izin atau concurrent worker otomatis. [SQLite WAL](https://sqlite.org/wal.html). Backup aktif memerlukan snapshot konsisten, bukan copy file sembarang. [SQLite Backup API](https://sqlite.org/backup.html).

**RECOMMENDATION.** Registry JSON memakai single-writer/atomic replace yang diuji pada Windows; initialization multi-file membutuhkan consistency check seperti E1. Jangan membuka dua instance ke data root yang sama atau menganggap rename/crash tidak pernah gagal. DB/log/checkpoint privat berada di luar Git; `.ai-office` marker/brain hanya boleh di-version-control berdasarkan pilihan Owner. Tidak mengedit `.gitignore` proyek pengguna otomatis; tampilkan daftar metadata yang akan dibuat dan risiko bila kelak state pindah ke project-local.

**DOCUMENTED REQUIREMENT.** M01 menetapkan ownership/version/scope, relative artifact references dan no-secret export rule. Proses `Identity → Consistent Snapshot/Export → Move/Backup → Import/Relink → Identity Validation → Restore`, checksum/schema validation, duplicate-ID reconciliation, path remap dan reauthentication menjadi implementasi/test M05. M01 menolak konflik identity/missing state tanpa merge/auto-regeneration. Credential, machine-specific secrets dan unsafe provider session credentials tidak boleh menjadi isi marker/knowledge fixture atau portable bundle. Desain private store harus tetap memiliki jalur export/backup kelak; production backup tidak dipaksakan masuk M01.

## G. Minimal Interface Contracts

**RECOMMENDATION.** Gunakan schema kecil dengan stable IDs dan explicit project scope; tidak membuat complete production orchestrator schema. Semua nama berikut adalah proposal, belum source file/API yang tersedia.

| Contract / purpose | Essential fields | Owner | Validation / status M01 |
|---|---|---|---|
| `ProjectIdentity` | `schemaVersion`, UUID `projectId`, `createdAt`, display metadata terpisah | Workspace Manager | Implement M01-02/03; nama/path bukan ID; marker-registry-header harus cocok |
| `WorkspaceBinding` | opaque `bindingId`, `projectId`, `canonicalRoot`, `generation` | Workspace Manager | Implement M01-02/03; hanya backend membuat/resolves; expose hanya data path yang diperlukan Owner |
| `WorkspaceViewState` | lifecycle, `bindingId?`, `projectId?`, `generation`, typed error | Backend lifecycle + UI projection | Implement M01-02/03/05; READY membutuhkan binding/snapshot konsisten; stale responses ditolak |
| `KnowledgeVersion` | project/knowledge IDs, version, relative path, hash, source/status/time | Shared Brain + state repository | Implement M01-02/04; scope required, hash mismatch menjadi unverified, path escape ditolak |
| `DemoTask` | project/task/agent IDs, title/state/version, literal `source=demo` | Demo fixture via Project State Service | Implement M01-02/04; tidak menerima `source=real` untuk fixture; tidak mempunyai dispatch capability |
| `EventEnvelope` dan `ProjectSnapshot` | schema/event ID, project/task/agent ref, source, sequence, occurredAt/receivedAt, stateVersion; snapshot binding/generation | Project State Service; UI hanya membaca | Implement subset DEMO M01-02/04/05; dedup IDs, per-project ordering; belum worker attempts/native streaming |
| `Freshness` | `unknown/fresh/stale/disconnected`, snapshot observedAt, lastEventAt | UI transport projection | Implement M01-02/05; snapshot fresh tidak mengubah event lama menjadi coding live; threshold awal 6 detik setelah poll gagal adalah usulan UX |
| `FoundationPolicy` | `workersEnabled=false`, `paidApiEnabled=false`, `providerConnectionsEnabled=false`, `skillExecutionEnabled=false`, mode `demo`; quota `UNKNOWN` | Backend policy | Implement M01-02/03; server authoritative/read-only di UI; tidak ada route untuk mengaktifkan provider |
| `SkillMetadata` | skill/runtime ref, installation scope, project association, proposed agent assignment, status fields pada I | Skill metadata boundary | Implement schema/mock view M01-02/06; semua actual discovery/session proof unknown |
| `AssetPackageRef` | asset ID/version/kind, provenance/manifest/source reference, validation `unverified` | Future asset registry; M01 visual mapper | Hanya nullable data contract M01-02; belum loader, schema final, executable controller atau GLB requirement |

**DOCUMENTED REQUIREMENT.** Runtime events nyata kelak tetap berbeda dari `applicationDataSource=mock/fixture` pada frontend proyek yang dikerjakan agent. M01 task/agent events adalah DEMO karena tidak ada worker. Real coding worker yang menghasilkan UI dengan mock data pada milestone berikutnya tetap dapat menghasilkan runtime event real. Jangan menggabungkan kedua source dimensions.

**RECOMMENDATION — command/read API minimum.** Bootstrap local session guard; `POST open` (path + explicit init consent bila diperlukan), `POST detach`, `GET snapshot(bindingId, expectedProjectId)`, `GET knowledge(bindingId, knowledgeId, version)` dan explicit demo-initialize dalam scope yang diizinkan. `GET health` hanya health umum. Mutasi membaca resource/project identity dari backend mapping; tidak menyediakan arbitrary SQL, filesystem read, shell, execute-task atau arbitrary-runtime-method endpoints. Route errors terstruktur: invalid root, access denied, identity conflict, state unavailable, scope mismatch, stale binding, unsupported schema, database busy, backend unavailable. Exact route names ditetapkan saat contracts task.

**DEFERRED.** Runtime Adapter implementation, Codex process/session, LangGraph graph/checkpointer, production DAG/attempt/retry schema, approval workflow engine, Telegram, skill execution dan asset loader tidak dibuat dalam M01. Kontrak binding/source/policy yang sama menjadi batas untuk fitur tersebut kelak; tidak perlu fake runtime adapter untuk menyamar sebagai integrasi.

## H. UI Shell & Visual Adapter Plan

**RECOMMENDATION.** Satu layar: Open Project absolute-path input, initialize-metadata confirmation, current project ID/name/root, loading/error/retry/close, knowledge preview v1 dengan source/hash status, serta satu DEMO task/agent card. Tampilkan backend availability, freshness/last update dan tulisan **DEMO — tidak ada coding worker aktif**. Jangan memakai angka quota/progress tanpa sumber.

**RECOMMENDATION.** React state/context sederhana cukup. `api.ts` mengelola generation, cancel requests/poll, dan error; tidak menyimpan authoritative task state pada localStorage. Open B membersihkan selection/content A sebelum response B dipasang. Render raw text/Markdown aman tanpa raw HTML atau eksekusi script. Backend/transport error tidak menampilkan stale A di bawah current project B.

**RECOMMENDATION.** Visual boundary minimum berupa pure projection `ProjectSnapshot → VisualAgentState` dengan project/agent/source/activity/freshness/asset refs. M01 menampilkan projection sebagai card/badge 2D; tidak membutuhkan canvas, dummy room atau karakter pengganti. Future route tetap `Runtime State/Event → Validated State → Visual Mapping → Approved Asset Instance`. Mapper tidak menulis task state dan tidak mengirim task-completed saat animasi selesai.

**DOCUMENTED REQUIREMENT.** Owner tetap memproduksi Modular Room Lab, Character Lab, PM & Strategy Room golden reference dan Living PM Room simulation. Production Asset Pack dan Full Source Project diimpor setelah tersedia/approved; embedded clips, procedural controllers dan unsupported states dibedakan. Tidak membuat room, character, animation atau texture pada M01.

**RECOMMENDATION — satu kandidat spike reversibel, tidak wajib M01.** Bila early asset import kemudian membutuhkan kamera, ekstrak hanya helper `orthoZoomToDistance` dari [cameraLighting.tsx](../../../Hermes3D/src/features/retro-office/systems/cameraLighting.tsx) beserta test input/output dan notice lisensi yang relevan. Jangan membawa scene presets/district/navigation/GatewayClient; hentikan jika dependency meluas. Karena M01 memakai card 2D, ekstraksi itu belum mengurangi pekerjaan, sehingga ditunda dari critical path dan memerlukan bounded izin tersendiri. Tidak ada full renderer copy/refactor Hermes3D atau R3F dependency yang diwajibkan untuk acceptance foundation.

## I. Agent Skill Manager Boundary

**APPROVED CONSTRAINT — DEC-006 / RECOMMENDATION M01.** Siapkan schema metadata dan policy projection, bukan runtime discovery. `skillId` dibedakan berdasarkan runtime/scope/provenance; project-scoped record wajib project ID. Global skill tidak otomatis di-copy ke proyek, dan proposed assignment tidak menjadi bukti keterbatasan akses.

| Status terpisah | Arti dan nilai awal M01 |
|---|---|
| Installed | Berkas terpasang pada environment runtime tertentu; actual status UNKNOWN |
| Discovered | Ditemukan melalui adapter runtime resmi; NOT_RUN/UNKNOWN |
| Assigned | Usulan assignment skill ke agent role/project; dapat ditampilkan sebagai metadata demo, bukan active permission |
| Available in runtime session | Skill benar-benar terlihat dalam session tertentu; UNKNOWN, tanpa session |
| Compatible | Cocok runtime/version/platform/dependencies; UNKNOWN sampai diuji |
| Allowed by policy | Izin usulan berscope; execution tetap disabled pada foundation |
| Actually enforced | Runtime/OS benar-benar membatasi visibility/use; NOT_VERIFIED, bukan turunan dari assigned/allowed |

**RECOMMENDATION.** Metadata memuat runtime ref/version jika diketahui, `scope=global/project`, optional project ID sesuai scope, provenance/hash jika ada, proposed role assignment, compatibility/availability/sessionVerification dan policy/enforcement status. UI boleh empty/UNKNOWN; contoh metadata hanya fixture berlabel DEMO, tidak mengaku terpasang pada host.

**DOCUMENTED REQUIREMENT.** Tidak scan host filesystem, install, menjalankan installer/GitHub script, interpreter kustom atau marketplace. Tidak menganggap skill Codex/Claude/Gemini CLI interchangeable. Discovery read-only dan actual Codex session verification adalah M02; permission tetap milik backend/runtime/OS. Skill text tidak dapat mengaktifkan worker atau paid API.

## J. Security & Billing Boundaries

**RECOMMENDATION — threat scope M01.** Lindungi local web command boundary, scope data dan fixture writes. Ini bukan klaim isolasi OS dari aplikasi lokal berbahaya atau coding worker dengan akun yang sama.

| M01 control yang akan dibangun/diuji | Acceptance fixture | Gate lanjutan |
|---|---|---|
| Loopback-only API/UI, explicit Host/Origin checks, deny broad CORS | Foreign-origin/host dan unauthorized mutation ditolak; GET tidak memutasi metadata | Remote auth/TLS/Telegram belum ada |
| Per-run local session + anti-CSRF nonce di memory UI; jangan di URL/log/localStorage | Same-origin bootstrap JSON, size/content-type/method guard; mutasi tanpa nonce ditolak | Tidak dianggap autentikasi kuat melawan local OS process; izin runtime M02 terpisah |
| Allowlisted command routes, strict schema/body limits | Unknown route/action, malformed payload, arbitrary SQL/path/shell ditolak | Direct/PM runtime task dispatch belum dibuat |
| Canonical root + binding/project verification | Wrong-project request, detached binding, junction escape dan late A response ditolak | Baca/tulis sandbox proses, race/junction attack runtime dan secret isolation harus dibuktikan M02 |
| Protected-state design, DB header/scope, instance/handle control | Scope mismatch/busy/partial init gagal aman, state tidak di-reset | Private path bukan sandbox; authority-store write denial wajib M02 |
| No automatic Git, skill/provider execution | Membuka fixture tidak menghasilkan `.git`, installs, runtime sessions atau network provider calls | Worktrees/discovery/provider eligibility diuji sesuai izin milestone |
| Secret minimization dan sanitized errors | Dummy token tidak dipantulkan ke UI/log; tidak membaca `.env`/auth cache sebagai knowledge | Credential broker/provider secret access proof M02 |
| DEMO source + freshness | Source real ditolak pada fixture; stale/disconnected jujur; event persisted tidak dianggap live | Real coding/source integrity M02 dan integration M05 |
| Paid API OFF, worker/provider/skill execution OFF | Server tidak menyediakan route untuk mengaktifkannya; limit/usage UNKNOWN | Subscription entitlement dan actual billing-route enforcement wajib M02 |

**RECOMMENDATION.** Session bootstrap hanya untuk same-origin local UI; nonce tidak menampilkan secret provider dan tidak diberi ke situs lain. Validasi Host/Origin juga berlaku pada proxy; Vite filesystem serving dibatasi source/public aplikasi, bukan seluruh parent workspace atau proyek pengguna. Non-browser/local process yang meniru header tidak dianggap sudah diatasi; risiko tersebut harus ditangani bersama runtime/OS boundary sebelum worker. Jangan memperluas allowed hosts/CORS untuk mengatasi error development tanpa review.

**DOCUMENTED REQUIREMENT.** Codex tetap first official-runtime PoC. Provider authentication, model entitlement, coding runtime access, CEO/PM inference entitlement dan API billing route diperiksa terpisah; LangGraph tidak memberi entitlement. Tidak ada provider SDK, automatic fallback, akun terhubung, pembelian kredit atau quota/reset buatan dalam M01. Antigravity/Claude/Gemini bukan dependency foundation.

**RECOMMENDATION.** M01-07 hanya dapat menyatakan foundation fixture protections lulus sesuai evidence. Sebelum worker M02 aktif tetap perlu official-interface/entitlement proof, read/write sibling/secret/state-denial tests, permission/approval validity, cancellation/recovery dan no-duplicate execution. Tidak menunda safety minimum ke M05 dan tidak mensyaratkan tests komponen M01 sudah lulus sebelum komponen itu dibangun.

## K. M01-02 to M01-07 Implementation Tasks

**RECOMMENDATION.** Urutan default serial. Nama file/module adalah perkiraan scope untuk task yang kelak diizinkan; bukan daftar file yang telah dibuat. Tidak ada giant coding prompt atau izin otomatis melanjutkan task berikutnya. Existing master/baseline/roadmap/alignment dan Hermes3D tetap di luar write scope.

### M01-02 — Domain and Policy Contracts

- **Objective:** menetapkan kontrak minimum dan tooling yang diperlukan untuk memeriksa kontrak tersebut.
- **Likely files/modules:** root package/lockfile dan TypeScript/test configuration minimum; `src/contracts/*`, `tests/contracts/*`. Vite/UI config ditambahkan ketika dibutuhkan M01-05, bukan scaffold seluruh tree.
- **Permitted future change scope:** setelah izin eksplisit, bootstrap dependency graph/typecheck/test tooling dan schema sesuai G; tidak Git init atau mengubah dependency Hermes.
- **Dependencies:** review rencana ini, persetujuan bounded stack/setup dan scope task. Tidak bergantung workspace/SQLite fixture tests yang belum mungkin dijalankan.
- **Deliverables:** ID/binding/lifecycle/knowledge/DEMO envelope/snapshot/freshness/policy dan skill/asset-reference schemas; daftar error; aturan readonly backend policy.
- **Acceptance criteria:** positive/negative schemas sesuai project scope; fixture source real dan project scope hilang ditolak; billing/workers defaults OFF; assigned tidak otomatis available/enforced; tanpa complete runtime/orchestrator interface.
- **Minimum test/evidence:** typecheck dan contract tests berisi wrong-project fields, invalid UUID/version, DEMO source, lifecycle READY requirements dan policy defaults; catat exact versions/commands/results.
- **Explicit exclusions:** aplikasi berjalan, DB, provider/LLM, root filesystem writes, asset loader/3D, LangGraph, skill scripts.
- **Completion gate:** kontrak/tooling minimal terverifikasi dan direview; Owner menyetujui task berikutnya secara terpisah.

### M01-03 — Workspace Identity

- **Objective:** membuka root nyata, menyimpan identity dan membangun lifecycle/binding yang fail-safe.
- **Likely files/modules:** `src/server/index.ts`, `http.ts`, `policy.ts`, `workspace/*`, launcher backend-only dan `tests/integration/workspace*`; package script hanya yang sudah memiliki target file.
- **Permitted future change scope:** API health/session/open/detach dan registry/marker operations pada temporary fixtures atau root yang dipilih/diizinkan; tanpa perubahan Git/metadata unrelated.
- **Dependencies:** M01-02; preliminary storage-root strategy; izin writes marker/private registry fixture. State loader dapat belum-tersedia secara eksplisit sampai M01-04, bukan pura-pura full READY foundation.
- **Deliverables:** validated canonical root, exclusive marker, ID/root registry, binding/generation, lifecycle/error codes dan controlled shutdown/instance guard.
- **Acceptance criteria:** A/B UUID berbeda dan stabil reopen; alias root tidak menduplikasi ID; invalid/missing/escape/duplicate identity ditahan; explicit metadata confirmation; tidak membuat `.git`; tidak memakai folder name saja.
- **Minimum test/evidence:** temp-root/API tests, restart registry/marker, denied origin/nonce, read-only root failure, Unicode/spaces, root alias/junction containment dan partial initialization; tanpa claim OS sandbox worker.
- **Explicit exclusions:** live worker/background policy, database/knowledge retrieval penuh, duplicate-ID reconciliation/production relink, broad filesystem picker service.
- **Completion gate:** identity/lifecycle fixture proof lulus; limitations dan write locations direview sebelum state task.

### M01-04 — Project State and Brain

- **Objective:** menyimpan dan memuat minimal state/knowledge DEMO per identity dengan restart consistency.
- **Likely files/modules:** `state/*`, `brain/*`, `src/demo/*`, scoped snapshot/read endpoints dan `tests/integration/state*`.
- **Permitted future change scope:** schema v1/repository, hash-based Markdown fixture read, explicit idempotent demo init, private fixture DB; tidak auto-ingest source pengguna.
- **Dependencies:** M01-03; persetujuan provisional private development store; Node SQLite compatibility smoke test dijalankan sebagai bagian task ini, bukan dependency M01-01 yang diklaim selesai.
- **Deliverables:** per-project DB/header, one knowledge v1, one DEMO task/agent/event, one snapshot, resolver storage dan close/rollback handling.
- **Acceptance criteria:** registry-marker-DB match; A cannot read B dan sebaliknya; same record IDs pada dua DB tidak menyebabkan leak; hash mismatch jadi unverified; restart tidak membuat fixture duplikat; busy/corrupt/newer-schema tidak di-reset.
- **Minimum test/evidence:** open/transaction failure rollback/close/reopen pada pinned Node; A/B scoped repository/API tests, wrong-header, path escape, hash mutation, repeated-init/restart, busy/multiple-handle failure dan schema rejection fixtures.
- **Explicit exclusions:** backup/export/import production, embeddings, full conversation memory, real task transitions/retry, real runtime session, approval engine.
- **Completion gate:** state/brain fixture integrity terbukti; driver failure menghentikan task untuk review, tidak silent fallback.

### M01-05 — Basic Shell and Visual Adapter

- **Objective:** membuat acceptance path bisa dilihat Owner melalui UI sederhana.
- **Likely files/modules:** `index.html`, Vite/config CSS, `src/web/*`, `visual/mapper.ts`, complete UI+backend dev launcher dan `tests/e2e/foundation*`.
- **Permitted future change scope:** browser shell, API proxy/poll, project/knowledge/DEMO card dan visual mapping; tanpa scene/room/character atau full preview infrastructure.
- **Dependencies:** M01-02–M01-04; exact API/error contract. Tidak memerlukan GLB, provider atau CEO/PM inference.
- **Deliverables:** Open/Confirm/Current/Loading/Error/Close UI, project-scoped knowledge preview, DEMO agent/task/freshness dan launch/stop flow.
- **Acceptance criteria:** root change benar-benar memanggil workspace attach; A panel hilang saat switch; late response A tidak tampil di B; backend down/reconnect/restart jujur; label DEMO/UNKNOWN/stale jelas; mapper tidak memutasi task.
- **Minimum test/evidence:** Playwright A/B flow dan delayed-response/backend-unavailable tests; screenshot/manual review initialization confirmation, identity/labels, error text dan Windows startup/shutdown.
- **Explicit exclusions:** 3D assets/camera extraction tanpa izin spike tersendiri, realtime streaming server, production task assignment, OAuth/native desktop packaging.
- **Completion gate:** UI menunjukkan foundation slice dengan evidence nyata dan tanpa fake worker activity; keterbatasan tercatat.

### M01-06 — Skill Policy Metadata

- **Objective:** menyiapkan boundary DEC-006 tanpa mengklaim runtime support.
- **Likely files/modules:** skill/capability contracts existing, small metadata projection pada web, targeted contract/component tests; tidak membuat adapter runtime kosong.
- **Permitted future change scope:** proposed skill assignments dan status fixture/UNKNOWN; tidak host scan atau credential reads.
- **Dependencies:** M01-02; UI integration setelah M01-05. Metadata-only task tidak bergantung Codex installed/login.
- **Deliverables:** global/project scope, runtime association dan status distinction pada I; empty/unknown state yang jujur.
- **Acceptance criteria:** installed/discovered/assigned/available/allowed/enforced tidak disamakan; global fixture tidak dipromosikan ke project state lain; skill execution tetap disabled.
- **Minimum test/evidence:** scope/status schema cases, assigned-but-unavailable dan allowed-but-not-enforced views; pastikan tidak ada scan/install/execute route.
- **Explicit exclusions:** marketplace, installer/update, script execution, compatibility translation, provider discovery/session proof.
- **Completion gate:** metadata boundary direview; runtime statuses tetap NOT VERIFIED sampai M02.

### M01-07 — Foundation Verification and Handoff

- **Objective:** membuktikan satu A/B/restart slice dan merekam actual readiness menuju bounded M02 proposal.
- **Likely files/modules:** acceptance test pada L, fixture helpers dan perbaikan minimum pada implementation modules; hasil disampaikan dalam task report.
- **Permitted future change scope:** tests/regression fixes langsung terkait foundation dengan izin task; test data/report artifacts hanya disposable test scope. Dokumen tambahan atau protected doc edits tidak otomatis diizinkan.
- **Dependencies:** M01-03–M01-06 terverifikasi; fixture-only app data, startup/shutdown mechanism dan expected outcomes disepakati.
- **Deliverables:** actual checks PASS/FAIL/NOT RUN, artifact references, observed versions/risks, unchanged-input confirmation dan M02 preflight gap list.
- **Acceptance criteria:** seluruh L primary cases lulus, no-cross-project leak dan no-duplicate fixture, identity/state restart benar; no provider/worker/paid route; tidak mengklaim M02 sandbox lulus dari tests M01.
- **Minimum test/evidence:** relevant typecheck/contracts/service tests, satu automated browser flow dengan actual backend stop/start, manual Windows UI/lifecycle check; rerun hanya jika fix/failure memerlukannya.
- **Explicit exclusions:** membuka real worker, provider auth, M02 execution, production backup/relink, full orchestration dan visual assets.
- **Completion gate:** foundation evidence direview Owner; M01 completion tidak mengizinkan M02 otomatis.

**RECOMMENDATION — independent work.** Contract test cases, pure visual mapper design, dan skill metadata schema dapat dipersiapkan setelah M01-02 tanpa SQLite implementation. UI network fixture dapat memakai contract-aligned fixture yang jelas, tetapi final acceptance harus backend nyata. Default tetap satu pelaksana/task serial; tidak membutuhkan parallel-agent execution atau worktree infrastructure sebelum tersedia.

## L. First Vertical Slice Acceptance Test

**RECOMMENDATION — test specification, belum dijalankan.** Harness kelak membuat `Project A`, `Project B` dan `App Data` pada satu temporary test root dengan ownership yang diketahui, berbeda dari workspace production/source AI Office/Hermes3D. Catat canonical paths dan IDs sebagai test evidence; cleanup hanya target fixture yang sudah diverifikasi. Gunakan dummy data, tanpa akun/model/secret production.

Fixtures: A mempunyai knowledge body `A_ONLY:<runId>` v1 dan task `A_DEMO`; B berisi `B_ONLY:<runId>` v1 dan task `B_DEMO`. Agar query scope benar-benar diuji, gunakan knowledge ID yang sama pada A/B dan buat versi tambahan hanya pada A untuk negative retrieval; UUID proyek tetap berbeda. Event/task source semuanya DEMO. Initialization melalui command/fixture harness yang diizinkan, bukan manual mutation data production.

| Langkah | Aksi dan expected result | Automation / manual evidence |
|---|---|---|
| 1 | Jalankan backend/UI pada isolated app-data; buka root A nyata; konfirmasi init jika belum ada; simpan ID A dan binding A | Playwright + API/filesystem assertion; manual konfirmasi daftar write locations |
| 2 | Baca knowledge/state A; body hanya A_ONLY; tampil project ID/root A dan knowledge v1/hash | Automated response/UI assertion |
| 3 | Tampilkan A_DEMO/agent DEMO dan source label; tidak ada provider/usage/progress live yang dikarang | Automated text/source assertion + screenshot review |
| 4 | Masukkan path B nyata dan Open; binding/generation berubah; canonical root benar; ID B berbeda | Automated backend/UI assertion, bukan dashboard filter |
| 5 | B knowledge/task/event tidak mengandung A_ONLY/A_DEMO; response A yang sengaja ditunda tidak dapat mengisi UI B | API/UI tests dengan delayed response; manual loading/error glance |
| 6 | Tutup UI dan stop backend secara terkontrol; restart keduanya dengan App Data yang sama | Automated supervisor/harness actual process restart; manual Ctrl+C/Windows handle check |
| 7 | Reopen B melalui registry selection tervalidasi; ID B/data/version/task/event counts sama; binding baru sah | Automated persistence assertion; refresh halaman saja tidak dihitung process restart |
| 8 | Reopen A; ID A dan original state/version tetap; task/event seed tidak terduplikasi | Automated A/B/hash/count comparison |
| 9 | Open relative/nonexistent/missing/inaccessible root; tampil typed error, tidak init Git/overwrite state atau memuat proyek dengan nama serupa | API fixture tests + UI error screenshot |
| 10 | Dengan binding B minta expected project A atau knowledge version yang hanya ada pada A; server menolak scope mismatch/not-found tanpa mengungkap body A | Service/API negative tests; UI cache tidak digunakan sebagai security control |

**RECOMMENDATION — focused negative tests.** Tambahkan alias/junction containment, corrupt marker/DB identity mismatch, duplicate marker pada root kedua (reject, bukan reconcile), newer schema, SQLite busy/transaction rollback, same-origin guard/nonce, repeated init, stale binding dan backend disconnect. Missing/moved root cukup ditolak dengan history tidak dihapus; migration/relink yang sebenarnya tetap M05. Test fixtures harus menghindari sumber produksi dan tidak membutuhkan worker LLM.

**RECOMMENDATION — success evidence.** Simpan exact command/versions, fixture project IDs, assertions/exit codes, relevant sanitized logs, screenshot primary UI dan daftar residual risks. State yang diperiksa sesudah restart harus berasal dari disk yang sama, bukan reseed/localStorage. Observed request generation/canonical root membuktikan switching; absence of foreign IDs/body pada query dan late-response scenario membuktikan scope dalam batas M01. Semua tests di bagian ini saat M01-01 berstatus **NOT RUN**.

## M. Risks & Decision Register

**APPROVED CONSTRAINT.** DEC-001–DEC-006 tidak diubah; tidak ada DEC baru. M00B-1.1 dipakai sebagai working baseline rencana ini sesuai instruksi Owner, tanpa menganggap izin planning sebagai izin implementasi.

| Jenis / prioritas | Hal yang harus diputuskan/dibuktikan | Kapan dan dampaknya |
|---|---|---|
| Owner — sebelum M01-02 | Setujui bounded Vite/React/TS + Node development approach, single package, contracts/tooling task scope dan izin perubahan/install yang spesifik | Planning saja belum mengizinkan package/config/source/dependency changes; git init tetap di luar scope |
| Owner — sebelum state implementation | Terima provisional private application storage untuk development M01, project-local identity/Markdown dan folder-only backup limitation | Bukan final physical database decision; tidak perlu memutuskan production location sebelum proof |
| Technical proof — P0 | `node:sqlite` RC subset pada Node terpasang, Windows lock/close/restart, partial initialization dan registry persistence | Smoke/fixture M01-03/04; kegagalan driver menghentikan scope untuk review |
| Technical proof — P0 | Path/identity/project-scope checks, stale responses dan local API boundary | Fixture M01; OS runtime isolation belum dibuktikan |
| Technical proof — P0 sebelum worker | Official Codex runtime/entitlement/billing + secret/root/state read/write isolation, approval/cancel/recovery/no duplicate | M02; tidak boleh diwakili mock/UI tests atau diatasi dengan provider berbayar fallback |
| Technical proof — P1 | Alias/junction/race semantics dan untrusted marker handling | M01 basic denial; adversarial runtime enforcement M02; jangan klaim complete sandbox |
| Deferred design — P1 | Background pause/continue, final DB location, export/import/backup/relink/migration dan identity collision resolution | Background policy dipilih Owner sebelum aktivasi; production portability M05; bukan blocker contracts M01-02 |
| Missing input — P1 | Dua handoff dan approved visual package/source | Source comparison/asset schema pending; tidak memblokir basic shell/persistence; early import saat paket siap dengan izin |
| Deferred choice — P2 | Exact patch dependencies, final HTTP route names/poll thresholds dan visual package coordinate details | Pin/test saat task terkait; prototype ukuran/connector bukan schema final |
| Deferred choice — P2 | Native folder dialog, Electron/Tauri/installer/service | Tidak diperlukan untuk acceptance M01; launcher lifecycle diuji lebih dahulu |

**RECOMMENDATION.** Keputusan Owner yang diperlukan sekarang hanya persetujuan rencana/setup dan bounded M01-02 write/install scope. Storage development perlu persetujuan sebelum M01-04; background policy, provider tambahan, packaging final dan asset schema tidak dimintakan keputusan dini untuk task kontrak. Tidak menjadikan missing handoff atau runtime tests yang belum mungkin dijalankan sebagai dependency melingkar M01.

## N. M01-02 Readiness

**Verdict: CONDITIONAL — rencana siap untuk Owner review, belum implementation approval.**

- **VERIFIED SOURCE FINDING:** tiga dokumen sumber metadata M00B-1.1 tersedia, scope M01 dan task numbering sesuai, host Node/npm diketahui, kandidat stack dan batas source Hermes diperiksa read-only. Lima dokumen existing tidak diubah.
- **RECOMMENDATION:** setelah Owner menyetujui bounded stack/setup dan M01-02 scope, kontrak/tooling dapat diimplementasikan tanpa GLB/handoff final, CEO/PM inference, full backup, background policy atau runtime session. Exact dependency compatibility diverifikasi dalam task yang diizinkan; SQLite fixture validation menjadi M01-04, bukan prasyarat rencana.
- **UNVERIFIED / REQUIRES PROOF:** belum ada application build/tests/runtime/sandbox/driver PoC yang dijalankan dalam M01-01. Gate M02 tetap wajib dan real worker belum siap diaktifkan.
- **STOP:** selesai pada satu dokumen rencana dan validasi dokumentasinya. Tidak memulai M01-02, Git initialization, provider authentication, source/config generation, skill execution atau produksi aset.

**VERIFIED SOURCE FINDING — documentation validation: PASS.** Pemeriksaan read-only mengonfirmasi bagian A–N, enam ID keputusan yang sama, task M01-02–M01-07 dengan sembilan field wajib per task, 16 local file/anchor links valid, code fence tertutup dan tanpa trailing whitespace. Inventaris AI-Office bertambah tepat satu Markdown ini; hash kelima dokumen existing sama dengan sebelum task. Hermes3D HEAD/status/lockfile hash tidak berubah dan tidak ada Git initialization. Validasi ini hanya membuktikan struktur/referensi/write scope dokumentasi; acceptance test L, builds, application tests, driver smoke, runtime dan sandbox proof tetap **NOT RUN**. Referensi eksternal di C/F diperiksa melalui dokumentasi resmi/maintainer; tidak ada dependency yang dipasang atau interface lokal yang dieksekusi.
