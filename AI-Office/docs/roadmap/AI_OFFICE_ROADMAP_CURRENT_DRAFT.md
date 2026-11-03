# AI OFFICE — Roadmap Current Draft

Tanggal: 28 Oktober 2026. Versi: M00B-1.1. Status: **DRAFT FOR OWNER REVIEW; NOT AUTHORIZED FOR IMPLEMENTATION**.

Otoritas keputusan: [Current Baseline](../AI_OFFICE_CURRENT_BASELINE.md). Provenance/konflik: [M00B Alignment Report](../decisions/M00B_ALIGNMENT_REPORT.md).

**APPROVED DECISION.** DEC-001–DEC-006 mengikat arah arsitektur. Struktur milestone M00–M07 berasal dari instruksi M00B; task, acceptance criteria, dependency dan gate di bawah merupakan **PROPOSED DESIGN**. Tidak ada izin menjalankan M01/M02 atau tanggal selesai yang dijanjikan.

**PROPOSED DESIGN — documented Owner intent M00B-1.1, pending final baseline sign-off.** Refinement mengintegrasikan Hybrid Task Control, early frontend preview, Project Brain portability dan gate foundation. Tidak ada keputusan bernomor baru, framework tambahan, atau milestone baru. Kedua handoff tetap MISSING pada pencarian ulang AI-Office; rincian dari instruksi Owner dicatat sebagai intent/candidate, bukan handoff terverifikasi.

Kategori: **APPROVED DECISION**, **VERIFIED SOURCE FINDING**, **PROPOSED DESIGN**, **UNVERIFIED / REQUIRES POC** mengikuti baseline. Semua milestone implementasi berstatus **PLANNED** sampai evidence dan gate review terpenuhi.

## A. Decision Traceability and Sequencing

| Keputusan | Arah yang dipertahankan | Milestone terkait |
|---|---|---|
| [DEC-001](../AI_OFFICE_CURRENT_BASELINE.md#dec-001) | Standalone AI Office + selective Hermes3D reuse; original tidak diubah | M01, early import spike, M07 |
| [DEC-002](../AI_OFFICE_CURRENT_BASELINE.md#dec-002) | LangGraph CEO/PM; custom deterministic orchestrator memiliki task DAG resmi | M01 kontrak, M03 reasoning, M04 execution, M05 hardening |
| [DEC-003](../AI_OFFICE_CURRENT_BASELINE.md#dec-003) | Real workspace; isolasi memory/task/session/filesystem | M01–M05 |
| [DEC-004](../AI_OFFICE_CURRENT_BASELINE.md#dec-004) | Codex Runtime PoC pertama; Paid API OFF default; tanpa silent API-billing fallback; kuota UNKNOWN bila tidak tersedia | M01 policy, M02 bukti, M03 inference, M06 monitoring |
| [DEC-005](../AI_OFFICE_CURRENT_BASELINE.md#dec-005) | Visual Lab independen/paralel; System Development hanya integrasi paket approved | Track visual, early import, M07 |
| [DEC-006](../AI_OFFICE_CURRENT_BASELINE.md#dec-006) | Agent Skill Manager: discovery, assignment/scope, compatibility dan session verification | M01 model metadata, M02 Codex discovery, M04 enforcement, M06 reporting |

**PROPOSED DESIGN.** M01 menyiapkan fondasi tanpa worker nyata. M02 memakai satu worker terbatas; M03 menambah reasoning dan M04 membuka paralelisme bertahap. Quality, approval, isolasi, evidence, cancellation dan recovery minimum wajib ada sebelum eksekusi M02; M05 memperluas pengujian/hardening, bukan menunda safety sampai akhir. M06 menambah remote/engine monitoring; billing enforcement tetap berlaku sejak M02. M07 menuntaskan integrasi visual, bukan awal pertama uji aset.

## B. Milestone Definitions

### M00 — Foundation Audit

- **Status/kategori:** selesai sebagai audit dokumen/sumber, dilaporkan dalam percakapan M00 dan dikonfirmasi Owner dalam instruksi M00B. File laporan lokal tidak ditemukan.
- **Goal:** mengetahui workspace, repository, kontradiksi dan risiko fondasi.
- **Scope:** inspeksi dokumen dan sumber; rekomendasi reuse, batas sistem, runtime dan visual contracts.
- **Non-goals:** coding, build, provider login, runtime end-to-end atau klaim fitur berfungsi.
- **Dependencies:** dokumen dan repository yang tersedia pada audit.
- **Acceptance criteria:** temuan membedakan verified, documented, recommendation dan unverified; batas read-only dijaga.
- **Evidence required:** respons M00 dalam percakapan; file sumber yang benar-benar tersedia. M00B tidak membuat salinan audit rekaan.
- **Risks:** dua handoff hilang; sebagian temuan M00 belum diperiksa ulang atau diuji.
- **Completion gate:** audit/source inspection selesai; readiness yang dilaporkan M00 adalah CONDITIONAL, bukan aplikasi selesai.

### M00B — Architecture Alignment

- **Status/kategori:** dokumentasi disusun untuk Owner review; tidak ada implementation approval baru.
- **Goal:** menyatukan enam keputusan, draft lama, dan batas evidence.
- **Scope:** tepat tiga dokumen Markdown: baseline, roadmap, alignment report; internal link dan consistency checks. Refinement M00B-1.1 merevisi ketiganya, mempertahankan evidence M00B-1 dan menambah current validation record terpisah.
- **Non-goals:** perubahan dua master, Hermes3D, kode/config, aset, Git init, dependency install, layanan dan skill script.
- **Dependencies:** keputusan DEC-001–DEC-006; sumber yang ditemukan; laporan M00 dalam percakapan.
- **Acceptance criteria:** semua keputusan terlacak; konflik dan usulan terbuka eksplisit; roadmap visual/system terpisah; tidak ada klaim test runtime lulus.
- **Evidence required:** tiga file, inventaris perubahan, validasi link/struktur/status dan hash sumber yang dilindungi.
- **Risks:** detail rekomendasi dianggap approved; hilangnya provenance dokumen yang tidak tersedia.
- **Completion gate:** pemeriksaan dokumentasi selesai; review Owner atas baseline/detail draft tetap pending.

### M01 — Core Foundation

- **Status/kategori:** PLANNED — PROPOSED DESIGN.
- **Goal:** satu alur kecil membuka workspace nyata, memuat knowledge/state proyek, dan menampilkan state melalui shell aplikasi serta visual adapter skeleton.
- **Scope:** implementasi Workspace Manager, stable project identity, Project State Service dan storage ownership contract, project-scoped Shared Brain minimal, kontrak task/session/approval/event/runtime/skill/asset, basic UI shell dan visual adapter skeleton dengan provider DEMO terpisah. Persistence/retrieval/isolation fixtures, failure handling dan restart verification dilakukan selama M01.
- **Non-goals:** worker nyata, multi-agent parallel execution, CEO/PM LLM aktif, full scheduler/worktree automation, provider auth, Telegram live, marketplace/installer skill, produksi visual, full preview infrastructure, atau production-grade backup/restore/migration.
- **Dependencies:** sebelum implementasi: Owner review/authorization atas baseline dan bounded task scope, initial setup/stack strategy, preliminary security/storage design serta source/documentation inputs yang diketahui. Hasil test komponen M01 bukan prasyarat untuk mulai membangun komponen itu; aset/handoff final bukan prasyarat foundation yang tidak bergantung padanya.
- **Acceptance criteria:** buka A lalu B dari folder nyata; task/knowledge/chat/session refs tetap project-scoped; identity bertahan restart; invalid/missing root gagal tanpa mengambil state proyek lain; tidak ada silent rebinding; storage ownership contract menjelaskan protected project storage vs private app storage tanpa mengunci lokasi final, serta keterbatasan folder-only backup; DEMO/UNKNOWN tampil benar; skill assignment berbeda dari availability tanpa eksekusi.
- **Evidence required:** hasil fixture A/B/restart/invalid/missing-path/retrieval isolation selama M01, pemeriksaan write scope dan preliminary protection findings, storage/portability contract review, shell review, serta dokumentasi actual checks setelah izin. Tidak mengklaim OS/runtime sandbox terbukti dari fixture foundation saja.
- **Risks:** database bisa ditulis worker, kontrak terlalu besar, shell mengasumsikan aset final atau dukungan runtime.
- **Completion gate:** vertical slice foundation terverifikasi dan direview, identity/state restart serta A/B isolation terbukti dalam scope fixture; keterbatasan proteksi dilaporkan; worker controls nonaktif sampai gate M02. Full portability tests ditunda ke M05.

**PROPOSED DESIGN — pemisahan dependency/gate.** Sebelum M01: izin, scope, setup, preliminary design dan input sumber. Selama M01: membangun workspace/identity/state, menguji retrieval/isolation/failure/restart dan mencatat hasil. Sebelum mengaktifkan coding worker nyata M02: buktikan filesystem/authoritative-state protection, billing enforcement, interface resmi Codex dan entitlement, approval/cancellation/recovery serta duplicate-execution prevention melalui bounded fixture validation. Hasil itu tidak menjadi dependency melingkar untuk implementasi M01 dan tidak boleh dilewati untuk kerja nyata.

### M02 — Codex Runtime Feasibility

- **Status/kategori:** PLANNED — UNVERIFIED / REQUIRES POC.
- **Goal:** membuktikan satu interface resmi Codex dapat menjalankan satu bounded worker task sesuai workspace, entitlement, billing dan permission.
- **Scope:** interface/version pin dan handshake; authentication/entitlement checks; satu fixture task; streaming events; approval reject/expiry; file/secret boundaries; cancellation, inspect/resume, crash recovery dan duplicate prevention. Discovery skill existing secara read-only dan availability pada session Codex diuji setelah izin dan gate terkait lulus.
- **Non-goals:** provider tambahan, parallel workers, kerja production tanpa gate, hidden API fallback, skill installation/execution yang belum direview, atau menjanjikan semua telemetry tersedia.
- **Dependencies:** M01; persetujuan PoC terikat fixture; interface/terms terkini; runtime/account milik pengguna; minimum policy/evidence/recovery tersedia. Mulai dengan preflight dan kontrol pada lingkungan fixture/data dummy: verifikasi billing/interface/entitlement, proteksi root/state, approval, cancellation/recovery dan duplicate prevention sebelum worker diberi task coding nyata atau akses proyek pengguna. Pengujian runtime terbatas yang diperlukan untuk membuktikan kontrol hanya dalam scope PoC yang diizinkan; tidak membuka worker umum.
- **Acceptance criteria:** handshake berhasil pada versi tercatat; auth mode/entitlement/billing route terbukti sesuai policy; Paid API OFF dan limit failure tidak memicu fallback; worker hanya mengakses root yang diizinkan; state/evidence terlindungi; approval/cancel/crash tidak membuat duplicate attempt; output diverifikasi dengan test relevan. Quota tanpa sumber ditampilkan UNKNOWN.
- **Evidence required:** versi/interface/source resmi yang ditinjau, sanitized handshake dan event trace, fixture diff/test result, denial tests sibling root/junction/credential dummy, approval/cancel/restart traces, session skill inventory atau limitation yang jujur. Token/credential tidak masuk evidence.
- **Risks:** consumer entitlement tidak mencakup integrasi; sandbox melindungi tulis tetapi membocorkan baca; cancellation hanya memutus transport; retry mengulang side effect; global skill terlihat di session yang tidak ditugaskan.
- **Completion gate:** satu task end-to-end lulus gate kritis. Jika interface, billing atau isolation tidak terbukti, operational execution tetap BLOCKED; jangan melompati ke multi-provider. Capability nonkritis yang tidak tersedia dicatat UNSUPPORTED/UNKNOWN.

### M03 — CEO and PM Intelligence

- **Status/kategori:** PLANNED — PROPOSED DESIGN.
- **Goal:** CEO/PM menghasilkan percakapan/proposal terstruktur; PM merencanakan vertical slices dan mengetahui direct Owner tasks tanpa wajib memberi approval reasoning pada setiap task rutin.
- **Scope:** LangGraph CEO brainstorming/summary dan candidate proposals; PM specification analysis, contract-aware vertical-slice task/DAG proposals, coordination/review; direct-task awareness dari official state/events; context retrieval, human interruption dan checkpoint reasoning. Rencana preview dapat memakai contract-aligned mock application data sebelum backend/database final siap.
- **Non-goals:** LangGraph sebagai database task kedua, permission melalui prompt, unrestricted tools, automatic requirement promotion, parallel execution, atau CEO sebagai mandatory retrieval gateway.
- **Dependencies:** M01 dan hasil M02 yang relevan; jalur inference CEO/PM resmi sesuai subscription/billing; kontrak proposal/review/promotion.
- **Acceptance criteria:** brainstorming tetap Exploration/Candidate; PM memecah satu fitur menjadi UI/data/API contract berversi, frontend preview, backend/database, QA dan real integration sesuai dependencies; mock mengikuti kontrak, task preview tidak menunggu backend final bila aman, contract changes menandai task/evidence terdampak untuk review. Direct task terdaftar di state PM tanpa mandatory PM approval-call rutin; reasoning outage tidak menjadi gate dispatch rutin. Approval terpisah; resume membaca state terbaru; retry graph tidak menduplikasi task/side effect; knowledge A tidak bocor ke B.
- **Evidence required:** structured feature/DAG proposal yang menunjukkan preview-before-backend, contract/mock version dan affected-task review, direct-task event projection untuk PM serta absence of mandatory PM reasoning dependency; trace proposal → review → approval/reject, stale-version/resume/cross-project tests, checkpoint refs dan billing preflight. Eksekusi paralel dibuktikan M04.
- **Risks:** prompt injection, context berlebihan, state reasoning dianggap resmi, inference backend tidak memenuhi akses subscription.
- **Completion gate:** workflow reasoning dan promotion terverifikasi; orchestrator/state service tetap otoritas eksekusi dan persistence.

### M04 — Parallel Execution Orchestrator

- **Status/kategori:** PLANNED — PROPOSED DESIGN.
- **Goal:** menjalankan task PM maupun direct Owner melalui satu scheduler, serta task independen secara paralel terbatas agar frontend preview dapat tersedia lebih awal sesuai dependencies.
- **Scope:** Hybrid Task Control melalui shared Command/Policy + task validation → satu official DAG/orchestrator; resource/worker ownership, dependency blocks, leases/fencing, task-specific Git worktrees yang diizinkan, contract-aware frontend/backend concurrency, integrasi diserialisasi, skill assignment/enforcement pada session yang didukung.
- **Non-goals:** scheduler/task database kedua untuk direct tasks, bypass approval/permission/quality, silent override pekerjaan aktif, arbitrary concurrency, worktree sebagai sandbox OS, shared writable task DB oleh worker, provider baru tanpa PoC, atau penghapusan worktree/hasil tanpa izin.
- **Dependencies:** M02 single-worker safety/recovery; M03 plan proposals; task/quality contracts; permission Git dan kebijakan background untuk skenario yang akan diaktifkan.
- **Acceptance criteria:** Owner mengirim direct task ke Frontend Agent proyek A; task diregistrasi pada sistem yang sama, binding A tetap, PM melihat authoritative event tanpa approval-call rutin, konflik file/resource diqueue/block/request-resolution dan pekerjaan aktif tidak ditimpa. Kedua route memakai dependency/permission/approval/quality/persistence yang sama. Pada satu fitur berkontrak berversi, frontend preview dengan mock contract-aligned tersedia sebelum backend final; frontend/backend berjalan paralel hanya jika dependency/resource aman. Contract changes memicu review/invalidation task terdampak; duplicate dispatch ditolak; foreground switch tidak rebind worker; merge conflict memblokir integration; skill enforcement tidak diklaim sebelum session test.
- **Evidence required:** direct/PM route trace menuju satu task registry/scheduler, PM notification/event dan conflict resolution evidence, preview revision/availability sebelum backend completion, contract/mock version, dua-worktree fixture, dependency/lease-expiry/duplicate-command tests, artifact/evidence revision binding serta skill visibility/enforcement result. Runtime event nyata dibedakan dari mock application data.
- **Risks:** file ownership overlap, perubahan Owner di main workspace, stale lease, cross-project context, global skill loading.
- **Completion gate:** concurrency terbatas lulus safety dan integration checks; perluasan jumlah worker ditentukan dari evidence dan izin, bukan kapasitas visual.

### M05 — Quality and Reliability

- **Status/kategori:** PLANNED — PROPOSED DESIGN.
- **Goal:** memperluas reliability dan pembuktian completion di atas kontrol minimum M02/M04.
- **Scope:** acceptance/test/review dan real integration gates termasuk mock-to-real frontend handoff; fault injection, checkpoint/resume, bounded retries, ambiguous outcome reconciliation; consistent snapshot/export/import/backup/restore, migration/relink dan portability consistency checks.
- **Non-goals:** menganggap safety baru berlaku pada M05, menjanjikan exactly-once side effect eksternal, atau menganggap klaim worker sebagai test evidence.
- **Dependencies:** M01–M04; fixture failure/recovery; evidence schema dan storage yang terlindungi.
- **Acceptance criteria:** worker output tidak langsung completed; frontend-preview task dapat accepted untuk scope UI dengan mock data sementara parent feature belum integrated; real backend replacement dan integration tests wajib sebelum parent completed. Evidence mengikuti revision/contract; contract changes memicu review/invalidation. Restart tidak mengulang side effect; approval revoked tetap ditahan. Consistent export/restore mempertahankan project identity dan task/session/conversation/brain/checkpoint/artifact history yang aman, memverifikasi schema/checksum dan path remapping, mengecualikan secrets/unsafe session credentials, serta memerlukan reauth bila relevan. Missing/moved root dan duplicate identity ditahan untuk relink/resolution; tidak ada accidental cross-project merge. Private storage memiliki export/import/backup eksplisit dan folder-only copy tidak dilabeli complete backup.
- **Evidence required:** preview-vs-feature acceptance matrix, mock/real data-source dan real/DEMO runtime-source metadata terpisah, contract-change review, real integration results; fault matrix/interrupted-task/retry logs; backup/restore/migration/relink drills dari protected-project maupun private-store fixtures, bundle inventory/secret-exclusion test dengan dummy credentials, checksum/schema/path-remap failure, missing-root dan duplicate-ID/wrong-project rejection.
- **Risks:** evidence stale, error disembunyikan, partial backup, test hanya mengulang implementasi tanpa menguji invariants.
- **Completion gate:** skenario reliability kritis lulus; residual defects dan keterbatasan pemulihan disetujui untuk scope operasional berikutnya.

### M06 — Remote Control and Engine Management

- **Status/kategori:** PLANNED — PROPOSED DESIGN.
- **Goal:** status dan kendali eksekutif jarak jauh menggunakan state/approval yang sama dengan UI.
- **Scope:** Telegram reports/status/brainstorming/proposal/approval routing, pause/resume yang didukung, deterministic notifications, engine health/capability/subscription-limit monitoring dan skill compatibility reporting.
- **Non-goals:** raw shell dari pesan, alert kritis bergantung CEO LLM, paid API auto-enable, otomatisasi account rotation, semua provider wajib tersedia, atau host selalu online.
- **Dependencies:** M02–M05; pairing/authorization, remote approval policy, secret storage, deduplication/outbox; akses bot yang diizinkan saat implementasi.
- **Acceptance criteria:** pesan unauthorized/replay/expired approval ditolak; task/UI/Telegram konsisten; CEO unavailable tidak mematikan alert; ambiguity proyek diklarifikasi; host offline/limit unknown ditampilkan jujur; route berbayar tetap ditahan.
- **Evidence required:** numeric identity authorization, update/command replay, approval expiry dan audit tests; same-task state comparison; CEO outage dan reconnect tests; telemetry source/time atau UNKNOWN.
- **Risks:** command spoofing, payload/log membocorkan credential, Telegram retry menghasilkan aksi ganda, stale status dianggap realtime.
- **Completion gate:** remote control terbatas lulus authorization/replay/audit; provider tambahan hanya jika PoC terpisah disetujui dan lulus.

### M07 — Full Visual Integration

- **Status/kategori:** PLANNED — PROPOSED DESIGN, mengikuti DEC-005.
- **Goal:** menghubungkan paket visual approved ke aktivitas runtime nyata dan menyelesaikan integration tests.
- **Scope:** import dua deliverable approved Room Lab/Character Lab: Production Asset Pack (room/character GLB terpisah, versioned JSON, anchors/connectors/behavior mapping, PNG/README) dan Full Source Project (original source ZIP/repository, procedural controller, geometry generator bila dipakai, exporter/dependencies/config/README); camera/selection, normalized event mapping, performance/accessibility dan end-to-end verification.
- **Non-goals:** produksi ulang room/character/animation oleh System Development, mengganti golden reference tanpa approval, memakai demo sebagai runtime evidence, atau menjadikan posisi karakter syarat backend.
- **Dependencies:** paket approved/validated; hasil early import; state/event kontrak M01 dan runtime/quality evidence M02–M05. M06 diperlukan hanya untuk skenario remote yang diuji.
- **Acceptance criteria:** independent export/import round-trip, material/texture/scale/orientation serta anchor/waypoint sesuai paket tervalidasi; clip inventory membedakan embedded/procedural/unsupported states. Coding/Testing/WaitingApproval/Failed/Unknown/Stale/Completed sesuai evidence; fallback jujur; animasi selesai/render pause tidak mengubah task state; Full Source Project/controller/exporter tidak hilang. Y-up/feet-origin/grid-origin dan ukuran/connector prototype pada baseline H tetap candidate sampai source/asset verification; target performa diukur pada hardware tercatat.
- **Evidence required:** kedua deliverable dengan asset ID/version/hash/provenance/license/source inventory, independent round-trip/material/texture/scale/orientation/anchor/waypoint/clip/controller checks, real runtime → state → UI/3D trace, DEMO separation/Unknown/Stale tests, recording/screenshots dan benchmark terukur. Handoff/source cross-check yang belum tersedia dilaporkan pending.
- **Risks:** rig/schema tidak cocok, GLB kehilangan procedural logic, scope redesign, mismatch reference art direction, render blocking UI.
- **Completion gate:** Owner menerima integrasi visual pada reference/version yang jelas dan end-to-end checks lulus; tidak menyatakan produk siap distribusi hanya karena M07 selesai.

## C. M01 Task Breakdown

**PROPOSED DESIGN.** Urutan berikut adalah rencana task reviewable, bukan coding prompts. Batas perubahan dan perintah implementasi baru disusun setelah Owner menyetujui task terkait.

| Task | Tujuan dan deliverable | Dependency | Acceptance/evidence minimum |
|---|---|---|---|
| M01-01 — Bounded foundation plan | Tetapkan scope vertical slice, kandidat stack/launcher development, preliminary security/storage strategy dan izin setup | Review/authorization M00B-1.1 dan bounded scope; bukan hasil fixture yang belum dibangun | Rencana terbatas disetujui; belum memilih installer/distribution final atau mengunci lokasi database |
| M01-02 — Domain and policy contracts | Project identity/logical ownership, task/session binding, knowledge/version/promotion, portability export exclusions, event/freshness, runtime/billing, skill metadata dan asset import refs | M01-01 | Contract review membedakan approved/proposed; Paid API OFF; real/DEMO execution berbeda dari mock application data; LangGraph tidak punya task DB; tanpa implementasi backup/preview platform |
| M01-03 — Workspace identity | Buka folder fixture nyata, canonical path, stable ID, attach/switch dan missing-root failure handling | M01-02 | A/B/restart/invalid/missing root dan junction-boundary fixture diuji selama task; tanpa provider/Git side effect atau klaim OS sandbox runtime lulus |
| M01-04 — Project State and Brain | Persistence per proyek, source/version/status/permissions, retrieval minimal dan storage ownership contract | M01-03 | State/identity bertahan restart; A tidak mengambil knowledge/task/chat/session B; protected/private storage dibedakan, kebutuhan export/import privat dan folder-only backup limitation tercatat; full restore M05 |
| M01-05 — Basic shell and visual adapter skeleton | Buka A/B, tampilkan project/knowledge/task refs dan satu state DEMO/UNKNOWN melalui adapter | M01-02–M01-04 | Scenario label jelas; switching tidak mengubah session binding; tidak perlu menghasilkan aset |
| M01-06 — Skill policy metadata | Global/project scope, runtime compatibility, proposed per-agent assignment dan session verification state | M01-02; integrasi M01-05 | Assigned berbeda dari available/enforced; UNKNOWN/NOT VERIFIED terlihat; tanpa host scan luas, install atau script |
| M01-07 — Foundation verification and handoff | Periksa kontrak, path/retrieval isolation, restart, DEMO/stale, failure dan dokumentasi actual checks | M01-03–M01-06 | Evidence review, residual risks dan bounded M02 proposal; tanpa menyalakan worker |

**PROPOSED DESIGN.** First vertical slice: buka folder A → baca satu knowledge record/version → tampilkan satu task fixture **DEMO** melalui shell/visual adapter → buka B → buktikan data A tidak ikut terbawa → restart → identity dan state B pulih. Scene lengkap, skill execution, percakapan LLM, dan paralelisme tidak diperlukan untuk membuktikan slice ini.

## D. Independent Visual Track and Early Import

**APPROVED DECISION — DEC-005.** Modular Room Lab dan Character Lab tetap jalur produksi milik Owner yang berjalan independen/paralel terhadap M01–M06. PM & Strategy Room adalah current golden reference; Living PM Room merupakan visual simulation.

**PROPOSED DESIGN.** Saat satu paket approved tersedia: inventaris Production Asset Pack dan Full Source Project → validasi ID/version/provenance/metadata → independent export/import round-trip dan material/texture/scale/orientation/anchor/waypoint/clip/procedural compatibility → catat perubahan schema kontrak seperlunya → Owner review. Full Source Project mencakup source/controller, generator jika dipakai, exporter/dependencies/config/README; browser procedural animation tidak diasumsikan berada dalam GLB. Coordinate/measurement candidates mengikuti baseline H dan tidak dikunci sebelum verifikasi. Lakukan pada milestone sistem yang sedang berjalan setelah scope import disetujui; tidak menunggu M07 dan tidak mengizinkan regenerasi atau penggantian aset approved. Bila paket belum ada, foundation dan runtime fixture tests tetap dapat berjalan tanpa mengklaim visual integration selesai. Production track ini berbeda dari early frontend preview pada proyek software yang dikerjakan worker (M03–M05).

## E. Historical Roadmap and Stop Gates

**VERIFIED SOURCE FINDING.** [MASTER_SYSTEM V4.0](../specifications/MASTER_SYSTEM.md), bagian 9, memuat legacy M00–M16; [MASTER_DESIGN](../specifications/MASTER_DESIGN.md), bagian 19, memiliki urutan visual dominan. Keduanya tidak diedit. M00B menyediakan current roadmap baru; tidak ada bukti milestone implementasi lama selesai.

**PROPOSED DESIGN.** Pemetaan orientasi: legacy M01–M08 visual ditangani Visual Lab + early import/current M07; legacy M09–M11 foundation/runtime menjadi current M01–M02; legacy M12 reasoning/execution menjadi current M03–M04; legacy M13–M15 event/memory/engine/recovery tersebar pada current M01–M07. Hardening/distribution legacy M16 tetap pekerjaan lanjutan yang belum dijadwalkan rinci. Gunakan prefix legacy/current saat membahas ID agar tidak mengubah history.

**PROPOSED DESIGN.** Setiap milestone berhenti pada completion gate untuk review scope berikutnya. Dokumen ini tidak memicu coding, provider connection, Git mutation, skill execution, instalasi, atau background service. Verdict readiness sekarang dan keputusan yang belum approved terdapat pada [alignment report](../decisions/M00B_ALIGNMENT_REPORT.md).
