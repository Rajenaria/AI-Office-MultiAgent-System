# AI OFFICE — Current Architecture Baseline

Tanggal: 28 Oktober 2026. Versi: M00B-1.1.

Status: enam keputusan arsitektur **APPROVED BY OWNER**; penjabaran desain dan roadmap menunggu review. Dokumen ini tidak mengizinkan implementasi M01/M02.

Refinement M00B-1.1 mencatat klarifikasi intent Owner tentang Hybrid Task Control, early frontend preview, portability, serta gate M01/M02. Detail ini berstatus **PROPOSED DESIGN — documented Owner intent, pending final baseline sign-off**; tidak menambah atau mengubah DEC-001–DEC-006.

Kategori pernyataan:

- **APPROVED DECISION:** arah yang disetujui Owner dalam instruksi M00B.
- **VERIFIED SOURCE FINDING:** fakta dari file yang diperiksa; bukan bukti fungsi berjalan.
- **PROPOSED DESIGN:** penjabaran/rekomendasi yang belum menjadi keputusan Owner.
- **UNVERIFIED / REQUIRES POC:** dependensi atau kemampuan yang belum dibuktikan.

Rujukan: [roadmap saat ini](roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md) dan [laporan penyelarasan](decisions/M00B_ALIGNMENT_REPORT.md). Persetujuan enam keputusan tidak otomatis mengesahkan setiap detail dalam tiga dokumen ini.

## A. Project Identity and Product Vision

**APPROVED DECISION — DEC-001, DEC-003, DEC-005.** AI Office adalah aplikasi mandiri, local-first, Windows-first, workspace-based untuk pengembangan software oleh tim AI, dengan kantor 3D real-time. Nilai produk mencakup pemahaman spesifikasi, perencanaan, eksekusi, handoff, pengujian, dan hasil yang dapat ditelusuri. Kantor merepresentasikan aktivitas operasional; keberhasilan produk membutuhkan alur kerja nyata, bukan hanya tampilan status.

**PROPOSED DESIGN.** Satu kantor dan identitas tim permanen mengikuti kebutuhan yang masih relevan pada [MASTER_SYSTEM V4.0](specifications/MASTER_SYSTEM.md), bagian 2.2. Task, percakapan, izin, dan session tetap terpisah per proyek. Rendering dapat dihentikan tanpa menjadi sinyal pembatalan pekerjaan backend.

**PROPOSED DESIGN — documented Owner intent M00B-1.1.** Pengembangan memakai vertical slices agar Owner dapat mengevaluasi frontend lebih awal ketika kontrak dan dependensi memungkinkan. Implementasi frontend dengan mock/fixture application data adalah hasil coding nyata bila dikerjakan worker nyata; status backend integration, perilaku yang belum diverifikasi, dan hasil test/acceptance ditampilkan terpisah. Preview frontend tidak menandakan seluruh fitur selesai. M01 hanya menyediakan workspace foundation dan basic UI shell; full preview infrastructure bukan scope M01.

**VERIFIED SOURCE FINDING.** Sebelum M00B, `D:\Rajendra\AI-Projects\AI-Office` hanya berisi dua spesifikasi di `docs/specifications/`, tanpa `.git` atau implementasi aplikasi. Dokumen baru ini adalah baseline keputusan, bukan laporan fitur selesai.

## B. Approved Architectural Decisions

Sumber persetujuan: instruksi Human Owner M00B dalam percakapan tanggal 28 Oktober 2026. Pernyataan, scope, dan constraints di bawah mempertahankan substansinya. Rasional dan konsekuensi adalah penjelasan arsitektural, bukan tambahan izin implementasi.

<a id="dec-001"></a>

### DEC-001 — Standalone AI Office + Selective Hermes3D Reuse

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** AI Office aplikasi independen; Hermes3D menjadi reference repository dan sumber komponen yang dipilih. Jangan memakai fork seluruh aplikasinya sebagai fondasi atau mengubah repository aslinya.
- **Rasional:** menjaga domain AI Office mandiri sambil mempertahankan manfaat komponen yang sesuai.
- **Scope:** strategi aplikasi/repository dan kandidat reuse renderer, kamera, interaksi, atau utilitas.
- **Constraints:** ekstraksi renderer belum terbukti; jangan menyalin credential, cache, atau dependensi mesin. Pertahankan lisensi/notices kode yang diambil; provenance aset diperiksa terpisah.
- **Konsekuensi:** lakukan spike ekstraksi terbatas sebelum menetapkan komponen yang dipakai. Pilihan strategi disetujui; keberhasilan ekstraksinya **UNVERIFIED / REQUIRES POC**.

<a id="dec-002"></a>

### DEC-002 — LangGraph.js + Custom Lightweight Orchestrator

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** LangGraph.js untuk reasoning CEO/PM. Orchestrator deterministik memiliki task DAG resmi, dependency scheduling, worker ownership/execution, retry/recovery, Git worktree coordination, quality gates, dan transisi execution state.
- **Rasional:** memisahkan usulan AI dari pengendalian pekerjaan yang dapat diaudit.
- **Scope:** workflow reasoning dan execution control.
- **Constraints:** database task resmi tidak diduplikasi di LangGraph. CrewAI/framework orchestration pesaing membutuhkan bukti baru dan persetujuan Owner.
- **Konsekuensi:** checkpoint reasoning merujuk state resmi; scheduler dan retry eksekusi hanya mempunyai satu pemilik. Driver persistence/checkpointer masih **PROPOSED DESIGN**.

<a id="dec-003"></a>

### DEC-003 — Workspace-Based Project Isolation

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** memilih proyek membuka folder lokal sebenarnya. Setiap proyek memiliki identity, Shared Brain, requirements/decisions, task state, agent sessions, conversation history, checkpoints, dan artifacts sendiri.
- **Rasional:** menjaga konteks dan operasi tetap berada pada proyek yang dituju.
- **Scope:** filesystem, memory, state, session, dan workspace lifecycle.
- **Constraints:** switching tidak boleh diam-diam mengganti folder worker. Enforcement melalui backend/runtime, bukan prompt saja. `.ai-office/` merupakan model kepemilikan logis yang dipilih; lokasi database otoritatif dapat berubah jika tidak bisa dilindungi dari worker.
- **Konsekuensi:** binding session wajib stabil; Git worktree tidak menggantikan sandbox. Lokasi fisik state dan kebijakan background execution belum ditetapkan.

<a id="dec-004"></a>

### DEC-004 — Subscription-First, Codex Runtime PoC First

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** prioritaskan subscription existing dan antarmuka yang diizinkan resmi; Codex menjadi kandidat PoC runtime pertama. **Paid API OFF secara default; tidak ada silent API-billing fallback.**
- **Rasional:** menguji jalur akses dan biaya sebelum menggantungkan produk pada runtime.
- **Scope:** provider/runtime adapter, inference CEO/PM, billing, dan usage monitoring.
- **Constraints:** authentication, model entitlement, coding runtime access, dan usage limits adalah pemeriksaan berbeda. Kuota yang tidak diketahui ditampilkan **UNKNOWN**. Antigravity, Claude, dan Gemini memerlukan verifikasi interface dan eligibility masing-masing; subscription tidak membuktikan hak otomasi pihak ketiga.
- **Konsekuensi:** kemampuan dan akses akun tetap **UNVERIFIED / REQUIRES POC**. Memperluas provider bukan jalan pintas untuk melewati gate Codex atau billing.

<a id="dec-005"></a>

### DEC-005 — Visual Lab Runs in Parallel

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** Owner memproduksi room, character, animation, dan aset melalui prototipe Google AI Studio Build terpisah: Modular Room Lab, Character Lab, PM & Strategy Room sebagai golden visual reference saat ini, serta Living PM Room visual simulation.
- **Rasional:** memungkinkan produksi visual dan fondasi sistem berkembang melalui batas import yang jelas.
- **Scope:** kepemilikan produksi visual, penyerahan paket, dan integrasi aplikasi utama.
- **Constraints:** prototipe visual tidak membuktikan backend berjalan. System Development tidak membuat ulang aset tersebut dan tidak menghasilkan aset visual baru; aplikasi mengimpor paket approved/validated beserta original source archive saat tersedia.
- **Konsekuensi:** uji import dimulai segera setelah satu paket terverifikasi tersedia, tanpa menunggu M07. Detail art direction dan schema final tetap memerlukan sumber nyata.

<a id="dec-006"></a>

### DEC-006 — Include Agent Skill Manager

- **Kategori/status:** APPROVED DECISION — **APPROVED BY OWNER**.
- **Keputusan:** sediakan discovery dan penggunaan skill kompatibel yang telah terpasang pada coding runtime yang didukung, termasuk kandidat Codex, Claude Code, dan Gemini CLI setelah dukungannya dibuktikan.
- **Rasional:** menggunakan kemampuan existing tanpa menganggap semua runtime memiliki format dan izin yang sama.
- **Scope:** runtime discovery; global/project scope; per-agent assignment; compatibility; enable/disable policy; penanganan external GitHub skills yang aman.
- **Constraints:** Agent Skills berbeda dari tools, model, dan provider connection. Tidak ada marketplace M01, interpreter skill kustom, penyalinan semua skill ke setiap proyek, atau asumsi kompatibilitas lintas runtime. Instruksi/script tidak tepercaya tidak mendapat izin eksekusi tanpa batas.
- **Konsekuensi:** assignment di registry bukan bukti enforcement. Ketersediaan dan pembatasan harus diverifikasi dalam worker session sebenarnya.

## C. Core System Boundaries

**PROPOSED DESIGN — penjabaran DEC-001–DEC-006.** Deployment awal berupa modular monolith lokal; nama Service/Manager menunjukkan modul tanggung jawab, bukan microservice atau proses tersendiri. Stack React/Next.js/TypeScript, R3F/Three.js, Node/TypeScript, SQLite + Markdown tetap kandidat teknis dari M00, bukan enam keputusan Owner tambahan.

| Komponen | Tanggung jawab dan batas |
|---|---|
| Human Owner | Otoritas strategi, scope, biaya, izin sensitif, dan approval final; dapat meminta PM merencanakan atau mengirim direct task ke role agent melalui command/policy yang sama |
| CEO Agent | Diskusi strategis, brainstorming, laporan eksekutif, proposal, monitoring lintas proyek yang diizinkan; tidak mengubah requirement resmi dari percakapan saja |
| PM Agent | Analisis spesifikasi, milestone/task/DAG proposals termasuk vertical slices, assignment/replan proposals dan review; mengetahui direct assignments melalui state/events, tanpa approval reasoning wajib untuk setiap task rutin |
| Specialized Workers | Melaksanakan task PM maupun direct Owner yang telah diregistrasi/divalidasi dalam session/workspace terikat; mengirim hasil/evidence, bukan menetapkan completion resmi; karakter adalah UI role, bukan bukti model permanen aktif |
| LangGraph workflows | State reasoning CEO/PM, human interruption, checkpoint percakapan; bukan database task atau enforcement approval |
| Execution Orchestrator | Satu pemilik task DAG, ownership, scheduling untuk task PM/direct Owner, worker lifecycle, retry/recovery, worktree coordination, quality gate dan execution transitions sesuai DEC-002 |
| Workspace Manager | Membuka dan memvalidasi root, project identity, session binding, switching/detach dan state pemulihan |
| Project State Service | Jalur transaksi, versioning, dan persistence resmi per proyek; menegakkan command yang sah dari pemilik domain |
| Shared Brain | Retrieval/provenance/version/approval knowledge sesuai scope; bukan perantara wajib melalui CEO |
| AI Engine Manager | Modul deterministik untuk connection status, capability, entitlement, runtime/model assignment dan billing/limit policy; tidak memerlukan LLM permanen |
| Runtime Adapter Layer | Menerjemahkan kontrak aplikasi ke interface runtime resmi; melaporkan kemampuan, error, session, dan event |
| Agent Skill Manager | Registry metadata/provenance, compatibility, scope, assignment policy, dan session availability; tidak memberi permission proses |
| Approval/Policy Service | Command ingress bersama untuk task PM/direct Owner; validasi aktor, scope, action fingerprint, expiry/revoke dan izin; menahan tindakan yang belum sah |
| Quality/Integration Service | Mengumpulkan/memverifikasi evidence, review dan integrasi; orchestrator menerapkan gate dan transisi |
| Event/Notification Service | Event persisten, deduplication/replay cursor, notification outbox; alert kritis tidak bergantung CEO LLM |
| Visual Renderer | Memetakan snapshot/event ke scene dan animasi; tidak menentukan keberhasilan eksekusi |
| Telegram Adapter | Transport status, ide, command, dan approval ke layanan yang sama dengan UI; pesan tidak diteruskan menjadi shell |

**PROPOSED DESIGN.** Orchestrator adalah pemilik semantik task state; Project State Service adalah jalur persistence tunggal, bukan scheduler kedua. Worker, UI, Telegram, dan LangGraph tidak menulis status task secara langsung. Project knowledge memiliki lifecycle sendiri melalui Shared Brain dan policy yang sama.

**PROPOSED DESIGN — Hybrid Task Control, documented Owner intent M00B-1.1.** Dua jalur memakai task system yang sama:

- `Owner → PM → Validated Task Proposal → Orchestrator → Worker`.
- `Owner → Selected Agent / Direct Task Command → Policy + Task Validation → Orchestrator → Worker`.

Jalur langsung tidak memerlukan PM reasoning call terpisah untuk setiap instruksi. Command/Policy Service tetap memvalidasi identitas Owner, project/workspace binding, task registration, resource/file/worktree ownership dan konflik, dependencies, security permissions, applicable approvals, quality gates, serta official event/task persistence sebelum eksekusi. Service ini adalah tanggung jawab modul command/policy existing, bukan subsistem atau scheduler baru. Instruksi yang ambigu atau bertentangan harus diblokir, diantrekan, atau dimintakan resolusi sesuai policy; pekerjaan aktif tidak ditimpa diam-diam.

**PROPOSED DESIGN.** PM mendapat informasi direct assignments dari state/event resmi sesuai project scope dan dapat mengusulkan impact analysis/replanning. Notifikasi PM bukan syarat persetujuan setiap direct task rutin dan tidak menahan dispatch hanya karena PM LLM belum tersedia. Perubahan scope/prioritas yang material tetap mengikuti policy/approval yang berlaku, bukan kewajiban PM call universal. Agent role, runtime session dan model assignment tetap identitas berbeda.

**PROPOSED DESIGN — early frontend preview.** PM dapat memecah fitur User Account Dashboard menjadi minimum UI/data/API contract berversi → frontend preview dengan contract-aligned fixture → backend endpoint/database tasks sesuai dependency → QA → integration mengganti fixture dengan backend nyata. Frontend/backend boleh paralel setelah kontrak yang diperlukan siap dan file/resource ownership aman; tidak ada syarat backend/database final selesai untuk memulai semua task frontend. Perubahan kontrak memicu review/invalidation pada task, mock fixture, acceptance dan evidence yang terdampak sebelum pekerjaan/integrasi dilanjutkan.

**PROPOSED DESIGN.** Checkpoint LangGraph menyimpan conversation/reasoning state dan referensi `projectId`, `taskId`, serta versi state. Resume membaca ulang task/approval resmi. Retry reasoning dibatasi pada langkah yang aman; retry task hanya dimiliki orchestrator. Adapter hanya memulihkan transport jika aman dan tidak diam-diam mengirim ulang pekerjaan. Side effect menggunakan command/attempt identity dan rekonsiliasi, bukan asumsi exactly-once.

## D. Project Isolation Model

**APPROVED DECISION — DEC-003.** Open Project berarti membuka folder lokal nyata dan memuat identity, knowledge, task, chat, session, checkpoint, serta artifact milik proyek itu. Pemilihan fokus untuk portfolio/monitoring tidak menjadi otoritas mengubah workspace worker.

**PROPOSED DESIGN.** Alur: validasi canonical root dan hak akses → baca/buat identity melalui operasi yang diizinkan → buka state proyek → muat konteks sesuai scope → bind session baru → beralih foreground setelah attach berhasil. Jika attach gagal, tampilkan kegagalan dan jangan mengirim task menggunakan root proyek sebelumnya.

- `projectId` stabil dipisahkan dari nama/path; relink atau clone tidak otomatis dianggap proyek baru/sama tanpa pemeriksaan identity.
- Session/attempt mengikat `projectId`, `workspaceId`, canonical root/worktree, `taskId`, runtime session reference, dan policy version. Switching UI tidak mengubah binding.
- Database, documents, conversations, retrieval index/cache, checkpoints, dan artifacts dipartisi per proyek. Cross-project sharing membutuhkan izin eksplisit dan provenance.
- Backend memvalidasi path dan runtime menegakkan batas baca/tulis/proses. Periksa traversal, junction/symlink, alias path Windows, credential exposure, dan network access sesuai task.
- Worker tidak boleh mengubah database, approval, checkpoint otoritatif, atau evidence store. Jangan menganggap izin tulis pada root proyek otomatis melindungi `.ai-office/`.
- Worktree adalah ruang kerja attempt dalam proyek yang sama; state resmi tidak digandakan ke setiap worktree. Worktree bukan sandbox OS.
- Folder non-Git boleh menjadi workspace; pembuatan Git/worktree membutuhkan izin dan bukan efek samping membuka folder.

**PROPOSED DESIGN — RECOMMENDATION, BELUM APPROVED.** Default awal yang disarankan adalah safe-pause ketika berpindah foreground bila belum ada izin background execution. Pause berarti berhenti dispatch langkah baru pada titik aman, menyimpan checkpoint dan menampilkan status aktual; bukan menjanjikan setiap subprocess dapat dibekukan. Jika titik aman tidak tersedia, tawarkan tindakan yang benar-benar didukung. Resume memeriksa ulang binding, lease, approval, dan state runtime. Kebijakan continue/pause final memerlukan keputusan Owner; sebelum ditetapkan, worker background tidak diaktifkan.

**PROPOSED DESIGN.** `.ai-office/brain`, `checkpoints`, `artifacts`, dan `project.db` adalah layout logis ilustratif untuk ownership proyek dan portable metadata. Lokasi fisik SQLite/state sensitif boleh berada di protected project directory hanya jika enforcement terbukti; jika exclusion gagal, private application-managed storage yang dipetakan ke `projectId` menjadi alternatif untuk direview. Tidak ada lokasi database final yang diputuskan oleh M00B-1.1. Worker tidak mendapat akses tulis langsung ke database otoritatif pada kedua pilihan.

**PROPOSED DESIGN.** SQLite + Markdown tetap kandidat persistence: satu writer aplikasi, transaksi singkat, schema/version checks, backup konsisten dan restore test. Database/log/checkpoint privat dikecualikan dari Git; hanya dokumen approved yang dipilih untuk version control. Locking, filesystem lokal/network/sync, dan driver Windows memerlukan validasi sebelum database operasional. M01 mendefinisikan storage ownership contract, membangun binding/state foundation dan menguji identity/restart/A-B isolation; full backup/restore/migration/relink diimplementasikan dan diuji pada M05.

**PROPOSED DESIGN — Project Brain portability, documented Owner intent M00B-1.1.** Kontrak proses: `Project Identity → Consistent Snapshot / Export → Move / Backup → Import / Relink → Identity Validation → State Restoration`.

1. Snapshot/export melalui layanan tepercaya menyatukan SQLite backup konsisten dengan documents, task/session/conversation/knowledge records, checkpoints, artifacts dan referensi versinya. Jangan menyalin database aktif secara unsafe. Manifest export mencatat project identity, schema/version, file inventory dan checksum/integrity reference.
2. Portable bundle mengecualikan credential, authentication token, machine-specific secret dan unsafe runtime session credentials, termasuk yang dapat tertanam pada log/checkpoint. Session history yang aman dapat dipertahankan sebagai catatan, bukan credential atau janji live provider-session migration. Jika format tidak dapat disanitasi dengan aman, jangan ekspor payload tersebut; catat omission tanpa membocorkan secret.
3. Move/backup tidak mengubah `projectId`. Private app storage membutuhkan mekanisme export/import atau backup eksplisit; menyalin folder proyek saja **bukan complete backup** bila state otoritatif ada di luar folder. Backup tidak dianggap lengkap bila artifact wajib hanya direferensikan ke lokasi eksternal yang tidak disertakan.
4. Import/relink memvalidasi schema compatibility, checksum/integrity, identity dan root tujuan sebelum restore. Path artifact project-local diremap terhadap root tervalidasi; absolute machine-specific paths dan referensi keluar root memerlukan review, bukan dipercaya otomatis. Restore tidak menimpa state existing sebelum konflik diselesaikan.
5. Jika identity sama ditemukan pada clone/dua lokasi aktif, tahan attach/restore yang ambigu; Owner memilih relink proyek yang sama atau clone sebagai proyek baru dengan identity baru. Jangan otomatis menggabungkan history atau memuat state A sebagai B. Policy resolusi detail dan migrasi schema memerlukan PoC.
6. Folder hilang/berpindah menghasilkan status workspace unavailable; tahan dispatch, pertahankan history dan minta relink yang divalidasi. Worker existing tidak direbind atau disalin diam-diam. Restore memeriksa ulang state/approval/runtime, meminta reauthentication bila perlu, dan memulai/resume hanya jika interface mendukung dan policy mengizinkan; jangan mengulang side effect hanya karena restore.

## E. Memory and Knowledge Model

**PROPOSED DESIGN — penjabaran DEC-003 dan kebutuhan knowledge pada MASTER_DESIGN bagian 12.**

| Scope | Isi dan izin |
|---|---|
| Organization Brain | Preferensi/rules yang eksplisit diizinkan lintas proyek; tidak menampung data proyek secara otomatis |
| Project Brain | Requirements, kontrak, keputusan, hasil dan evidence resmi proyek dengan provenance/version |
| Agent Working Context | Konteks sementara per task/session; tidak otomatis approved atau dibagi ke agent lain |
| CEO Discussion Memory | Brainstorming eksploratif; akses/scope percakapan eksplisit, terpisah dari keputusan proyek |

**PROPOSED DESIGN.** Promosi: `Exploration → Candidate → PM Reviewed → Approved`, dengan cabang `Rejected`, `Postponed`, `Superseded`. Otoritas promosi mengikuti policy Owner; persetujuan scope/requirement tidak dapat digantikan oleh rangkuman CEO atau checkpoint graph. Simpan sumber, hash/version, author, waktu, scope, reviewer/approver, dan versi yang digantikan.

**PROPOSED DESIGN.** Retrieval dimulai dari metadata/pencarian teks dengan filter izin sebelum hasil dikirim ke model. Context packet berisi tujuan, acceptance criteria, kontrak, keputusan approved, dan cuplikan sumber relevan. Cache memakai project/version/permission key. Tidak perlu knowledge graph atau vector database awal. Perubahan Markdown eksternal menjadi candidate revision; index/database tidak boleh diam-diam menganggapnya keputusan approved.

**PROPOSED DESIGN.** Project Brain tetap milik identity proyek meskipun physical authoritative storage berada di direktori aplikasi privat. Setiap knowledge record, conversation, task, session dan checkpoint mempunyai project scope eksplisit. Export/restore mengikuti kontrak portability bagian D dan membangun ulang retrieval/cache dengan scope/permission yang benar; Organization Brain atau CEO discussion scope lain tidak disertakan sebagai knowledge proyek secara otomatis.

## F. Runtime and Billing Policy

**APPROVED DECISION — DEC-004.** Codex Runtime PoC dilakukan pertama. Subscription-first; **Paid API OFF secara default; tidak ada silent API-billing fallback**. Kuota/limit tanpa sumber sah adalah **UNKNOWN**, bukan nol, unlimited, atau countdown buatan.

**PROPOSED DESIGN.** Adapter memisahkan status authentication, entitlement model, hak menggunakan coding runtime/third-party integration, usage limit, dan billing route. Setiap kemampuan berstatus `supported`, `unsupported`, atau `unknown`, dengan runtime/version/source/observedAt. Runtime connection berbeda dari model selection dan skill installation.

**PROPOSED DESIGN — klarifikasi intent Owner M00B-1.1; subscription handoff MISSING.** Provider adalah layanan/account connection, model adalah pilihan inference, coding runtime adalah harness/tools/session eksekusi, dan agent role adalah identitas tanggung jawab; satu tidak membuktikan akses ke yang lain. Worker coding execution dibedakan dari CEO/PM model inference, subscription entitlement dan API billing route. LangGraph tidak menyediakan inference entitlement.

Jangan menganggap Google AI Pro memasukkan Gemini API billing, Antigravity consumer subscription boleh dibungkus orchestrator pihak ketiga, atau Claude Code subscription memberi izin unsupported third-party SDK automation. Interface resmi, entitlement dan permission harus diverifikasi terpisah untuk penggunaan yang dimaksud; ini batas normatif, bukan klaim validasi ulang terms/provider atau PoC lulus. Handoff tidak tersedia, sehingga cross-check detail sumber tersebut tetap pending. Sequencing provider/visual historis tidak mengalahkan DEC-004–DEC-005 dan current M00–M07.

**PROPOSED DESIGN.** Kontrak minimum: capability/auth status tanpa secret; session creation dan binding workspace; submission dengan task/attempt identity; streaming events; approval bridge; inspect/cancel/resume sesuai kemampuan; pengumpulan artifact/evidence; error/limit reporting; billing preflight. Billing route yang tidak terbukti sesuai policy ditahan. Jangan mewariskan API credential environment tanpa sengaja atau membeli kredit/top-up secara otomatis.

**PROPOSED DESIGN.** Model/runtime switching melalui handoff eksplisit: simpan checkpoint aplikasi dan artifact/revision, pertahankan `taskId`/project binding, hentikan atau rekonsiliasi attempt aktif, periksa kemampuan/entitlement/billing/approval tujuan, lalu lanjutkan dengan attempt/session reference yang sesuai. Jangan menjalankan dua attempt akibat switch atau menganggap native provider session dapat dipindahkan lintas runtime. Data limit/usage tetap UNKNOWN bila sumbernya tidak tersedia.

**UNVERIFIED / REQUIRES POC.** Interface dan versi Codex yang akan dipakai, account entitlement, Windows sandbox, cancellation/resume dan penggunaan limit belum diuji dalam proyek. Inference CEO/PM juga memerlukan akses resmi; LangGraph tidak menyediakan subscription atau model entitlement. Temuan provider pada M00 adalah laporan audit sebelumnya, bukan validasi ulang M00B atau bukti akun pengguna. Antigravity/Claude/Gemini hanya dapat ditambahkan setelah interface dan eligibility masing-masing diverifikasi; tidak ada janji dukungan semua kandidat.

## G. Agent Skill Manager

**APPROVED DECISION — DEC-006.** Prioritas adalah skill existing pada runtime yang benar-benar didukung, global/project scope, per-agent assignment policy, compatibility, dan external skill safety. Discovery tidak memberi permission eksekusi.

**PROPOSED DESIGN.** Pipeline ringan:

`Runtime Adapter → Discover available runtime skills → Validate metadata/provenance → Register capability/scope → Assign allowed skills to agent roles → Verify availability in actual worker session`.

Registry minimum: `skillId`, nama/description, runtime/version, installation scope, project association jika ada, source path/reference, upstream provenance dan revision/hash, compatibility, review/trust status, policy enable/disable, assignment, dan hasil session verification. Tampilkan metadata seperlunya; jangan memuat seluruh skill ke prompt hanya untuk menampilkan daftar. Nama sama pada runtime/scope berbeda tidak otomatis menjadi skill yang sama.

**PROPOSED DESIGN.** Discovery read-only menggunakan mekanisme resmi runtime ketika tersedia; lokasi filesystem hanya dibaca melalui adapter dan scope yang diizinkan. Instalasi lewat terminal tidak membuktikan visibility pada provider atau session lain. `assigned`, `available`, `enabled by policy`, dan `enforced` adalah status berbeda.

**PROPOSED DESIGN.** Global skill mungkin terlihat oleh beberapa session. Assignment per-agent tidak menjamin skill yang tidak ditugaskan tersembunyi. Uji mekanisme runtime-supported allowlist/disable/config/session scope. Bila enforcement tidak tersedia, laporkan limitation; jangan mengklaim isolasi atau mengizinkan eksekusi skill yang membutuhkan pembatasan tersebut. Pembatasan file, proses, network dan credential tetap dimiliki Policy Service + runtime/OS, bukan teks skill.

**PROPOSED DESIGN.** External GitHub skill memerlukan provenance, revision yang dipin, license dan review konten/script sebelum adopsi. Discovery tidak menjalankan installer/hook/script. Perubahan hash membatalkan verifikasi/review lama sesuai policy. Skill dianggap untrusted input, tidak boleh menaikkan permission atau menulis state/requirement resmi sendiri. Tidak ada bulk copying, custom interpreter, marketplace M01, auto-update GitHub, eksekusi installer tanpa review, dependency solver kompleks, atau universal translation.

**VERIFIED SOURCE FINDING.** Hermes3D memiliki [skill metadata dan gateway calls](../../Hermes3D/src/lib/skills/types.ts) serta [per-agent allowlist wrapper](../../Hermes3D/src/lib/skills/agentAccess.ts). Implementasinya bergantung pada gateway Hermes. Ini referensi sumber, bukan bukti discovery atau enforcement Codex/Claude/Gemini bekerja.

**PROPOSED DESIGN.** M01 hanya menyiapkan metadata/policy model dan tampilan availability `UNKNOWN/NOT VERIFIED`; tidak memindai host secara luas atau menjalankan skill. M02 menguji discovery read-only dan visibility pada session Codex setelah gate aksesnya lulus. Penggunaan skill nyata menunggu assignment, trust dan permission terbukti; runtime lain menunggu PoC terpisah.

## H. Visual Asset Integration

**APPROVED DECISION — DEC-005.** Owner mengendalikan visual production. System Development hanya menerima/mengintegrasikan paket approved dan validated; tidak membuat ulang room, character, animation, atau aset baru. Golden reference saat ini adalah PM & Strategy Room; Living PM Room tetap simulasi visual.

**UNVERIFIED / REQUIRES POC.** Handoff visual dan paket asli belum ditemukan pada workspace M00B; pencarian ulang M00B-1.1 juga menghasilkan MISSING, termasuk belum adanya `docs/handoffs/`. Arah pixel/voxel hybrid disebut dalam instruksi M00 sebelumnya; MASTER_DESIGN memuat Clean Modern 2.5D. DEC-005 menetapkan pemilik dan reference, bukan persetujuan otomatis atas semua detail palet/topologi/rig. Rekonsiliasi detail menunggu reference/version yang disetujui Owner.

**PROPOSED DESIGN — documented Owner intent M00B-1.1.** Dua deliverable terpisah wajib dipertahankan: **Production Asset Pack** untuk import aplikasi dan **Full Source Project** untuk preservasi/perbaikan. Import contract berikut ilustratif, belum schema final:

| Paket | Kontrak yang perlu diuji |
|---|---|
| Production Asset Pack — GLB / glTF 2.0 | Room dan character GLB terpisah; model, unit/axis/pivot/bounds, material/texture dan ekstensi yang digunakan |
| Production Asset Pack — JSON manifest | Asset/schema/version, hash, file references, provenance/license dan compatibility |
| Production Asset Pack — room anchors/connectors | ID, transform/facing, waypoint, seat/workstation/entry roles, collision/navigation footprint |
| Production Asset Pack — character behavior | Semantic state/animation mapping, rig/node binding, clip names, controller ID/version |
| Production Asset Pack — animation | Embedded clips, procedural controller mapping, atau hybrid; unsupported state dan fallback eksplisit |
| Production Asset Pack — preview/README | PNG, langkah import dan batasan yang diketahui |
| Full Source Project | Original React/Three.js/source ZIP atau equivalent repository; procedural animation controllers, geometry generator jika digunakan, exporter logic/dependencies, supporting configuration dan README; ditautkan ke versi paket |

**PROPOSED DESIGN.** Intake memvalidasi path/file reference, metadata dan checksum sebelum registry versioned. Loader Three.js/R3F adalah kandidat reuse, bukan komitmen ekstraksi yang sudah lulus. Manifest tidak menjalankan script arbitrary. Controller prosedural harus berupa integrasi kode yang direview; GLB saja tidak diasumsikan mempertahankan logika prosedural. Source archive asli dipertahankan tanpa perubahan. Uji import satu paket dimulai saat siap; full integration tetap M07.

**PROPOSED DESIGN — convention candidates dari instruksi Owner M00B-1.1, belum diverifikasi terhadap handoff/aset.** Evaluasi Y-up, character origin pada feet/floor, modular room origin sesuai room grid, GLB room/character terpisah, serta anchor/connector orientation eksplisit. Footprint PM Room sekitar 8×8 world units, floor Y=0, grid 1 unit, wall height sekitar 3.2 unit, dan connector EAST/SOUTH hanya prototype measurements/candidates yang dilaporkan Owner. Jangan mengunci angka, orientation atau schema final sebelum source/asset verification.

**PROPOSED DESIGN.** Compatibility gate mencakup stable ID/version/provenance; export/import independent round-trip verification; material/texture/scale/orientation; inventory embedded clips; preservasi source/controller prosedural; anchor/waypoint validity; unsupported animation mapping; serta DEMO/real dan Stale/Unknown handling. Embedded clip, controller browser prosedural, dan unsupported state dilaporkan terpisah. Animasi yang tidak tersedia menggunakan fallback jujur, bukan klaim aktivitas yang tidak dibuktikan.

## I. State and Event Integrity

**PROPOSED DESIGN — mempertahankan kebutuhan sumber MASTER_SYSTEM bagian 7 dan MASTER_DESIGN bagian 7.** Alur: `Real Runtime Event → Validated Project/Task State → Visual State Mapping → Character/Room Animation`. Event fixture selalu `source=demo` dan berlabel **DEMO** pada UI serta evidence; tidak masuk state operasional sebagai hasil nyata.

**PROPOSED DESIGN — early frontend preview integrity.** Sumber eksekusi coding dan sumber data aplikasi adalah dimensi berbeda. Worker nyata dapat menghasilkan frontend nyata yang memakai `applicationDataSource=mock/fixture` sesuai kontrak; event pekerjaan tetap `source=real`. Fixture/simulasi runtime AI Office tetap `source=demo`, meskipun UI aplikasi yang ditampilkan tampak berfungsi. Catat terpisah: implemented frontend revision, mock/real data source dan contract version, real backend integration status, unverified behaviors, serta tested/accepted scope. Jangan mengubah event worker nyata menjadi DEMO hanya karena preview memakai mock data, atau mengklaim backend selesai dari keberhasilan preview.

**PROPOSED DESIGN.** Envelope minimum: event/schema ID, project/task/attempt/session/agent reference, source, type, waktu asal jika tersedia, waktu diterima, sequence/cursor jika tersedia, state version dan evidence reference. Backend memvalidasi binding terhadap session registry, bukan percaya `projectId` dari payload. Deduplicate dan tangani event terlambat/out-of-order; reconnect mengambil snapshot dan cursor yang konsisten.

**PROPOSED DESIGN.** Pisahkan task state (`Running`, `Validating`, `Completed`), activity (`Coding`, `Testing`, generic working), dan freshness (`Unknown`, `Stale`, `Disconnected`). `Running` tidak membuktikan coding; jawaban model selesai tidak membuktikan task completed. Persentase hanya dari denominator acceptance criteria yang sah. Animasi idle kosmetik tidak dicatat sebagai pekerjaan. Berjalan ke ruangan atau akhir animasi tidak menjadi prasyarat komunikasi backend, handoff, maupun completion.

## J. Quality, Approval and Recovery

**APPROVED DECISION — DEC-002–DEC-004.** Orchestrator memiliki quality gates, bounded retry/recovery dan execution transitions; filesystem dan billing policy tidak boleh bergantung pada kepatuhan prompt.

**PROPOSED DESIGN.** Pisahkan worker claim/output dari `Validating`, review, `Ready to Integrate`, dan `Completed`. Completion memerlukan acceptance criteria, evidence test yang relevan, review, serta integrasi bila task memerlukannya. Evidence mencakup command, cwd, exit code, waktu, revision/tree hash yang diuji dan artifact/log yang disanitasi. Perubahan setelah test menuntut penilaian ulang evidence.

**PROPOSED DESIGN.** Gate yang sama berlaku untuk task PM dan direct Owner; pemberi instruksi tidak mengubah syarat quality/integration. Task frontend-preview dapat diterima terhadap acceptance scope-nya sendiri sementara parent feature tetap belum integrated/completed. Evidence preview mencantumkan kontrak/mock-data version, revision, cara menjalankan preview dalam scope yang diizinkan, hasil UI/QA dan batas perilaku yang belum diuji. Perubahan kontrak memicu review/invalidation evidence dan task yang terdampak. Parent feature baru completed setelah integration nyata dan acceptance/tests yang diperlukan terbukti.

**PROPOSED DESIGN — future acceptance scenarios.** (1) Owner memilih Frontend Agent pada proyek A lalu mengirim direct task ketika file target sedang dimiliki task lain: satu task resmi terdaftar di A, PM menerima event sesuai scope tanpa approval-call rutin, orchestrator queue/block sesuai konflik, tidak mengubah root saat foreground pindah ke B, dan quality gate tetap berlaku. (2) PM memecah Account Dashboard menjadi kontrak + preview frontend + backend/database + integration: preview revision terlihat sebelum backend final, mock mengikuti kontrak, perubahan kontrak menandai affected tasks/evidence untuk review, dan parent feature belum completed sampai real integration test lulus. Kriteria ini diuji pada M03–M05, bukan M00B-1.1 atau tambahan preview platform M01.

**PROPOSED DESIGN.** Approval mengikat actor, project/task/attempt, action/resource fingerprint, policy version dan expiry; invalidasi jika scope berubah/revoke. Keputusan approval tidak membuktikan aksi berhasil. Transaksi task claim, lease/fencing dan idempotency key mencegah duplicate dispatch; hasil side effect yang ambigu direkonsiliasi sebelum retry. Crash/disconnection menjadi recovering/unknown/needs-review sampai runtime dan artifact diperiksa. Cancellation menunggu hasil yang terkonfirmasi; resume tidak otomatis memulai task kedua.

**PROPOSED DESIGN.** UI dan Telegram memakai command dan state otoritatif yang sama. Telegram memerlukan pairing, allowlist numeric user/chat ID, deduplication command/update, expiry approval, audit, dan redaction. Natural language diinterpretasikan menjadi intent lalu divalidasi, bukan dieksekusi sebagai shell. Alert completion/error/limit/security yang deterministik tetap tersedia tanpa CEO LLM. Host offline dilaporkan sebagai offline/last-known, bukan progress aktif.

## K. Future Multi-Office Compatibility

**PROPOSED DESIGN.** Shared platform core memiliki workspace, identity, policy, runtime/skill adapters, state, brain, event dan evidence. Office module memiliki role/workflow LangGraph, task/artifact types, quality rules dan visual mapping. Mulai dengan Development Office; simpan `officeType` dan kontrak sempit bila diperlukan. Creative Studio masa depan tidak berbagi knowledge proyek secara otomatis. Tidak membangun plugin platform atau marketplace sekarang.

## L. Document Authority

**APPROVED DECISION — instruksi precedence M00B.** Urutan otoritas:

1. Keputusan eksplisit Owner, termasuk DEC-001–DEC-006.
2. Handoff visual/subscription terbaru yang tersedia dan terverifikasi; rekomendasi di dalamnya tetap perlu approval bila belum disetujui.
3. Evidence dan temuan audit M00, dibedakan dari kesimpulan yang belum diuji.
4. [MASTER_SYSTEM](specifications/MASTER_SYSTEM.md) dan [MASTER_DESIGN](specifications/MASTER_DESIGN.md).
5. Rekomendasi baru berstatus PROPOSED DESIGN.

**VERIFIED SOURCE FINDING.** MASTER_SYSTEM V4.0 masih bertanda draft; MASTER_DESIGN V1 adalah design discovery handoff tanggal 22 Oktober 2026. Keduanya dipertahankan utuh. Bagian yang bertentangan tentang full fork, produksi visual oleh System Development, sequencing visual-first M00–M16, dan switching hanya sebagai filter tidak lagi menjadi arah pelaksanaan saat ini. Kebutuhan yang tidak bertentangan tetap menjadi referensi dengan status asalnya; baseline ini tidak otomatis mengesahkan seluruh draft lama.

**PROPOSED DESIGN.** Baca baseline ini untuk keputusan berlaku, roadmap untuk rencana/gate, dan alignment report untuk provenance/konflik. ID milestone lama tetap disebut sebagai `legacy V4.0 Mxx`; ID roadmap sekarang memakai namespace `current Mxx`. Tidak ada milestone implementasi yang diklaim selesai akibat pemetaan ulang. Detail roadmap tetap draft; penulisan dokumen M00B tidak memberi izin M01. Klarifikasi Hybrid Task Control M00B-1.1 memperbarui interpretasi MASTER_DESIGN bagian 8.4/9.1 yang dapat dibaca sebagai PM reasoning wajib bagi semua penugasan: kedua jalur kini didokumentasikan melalui command/policy/task system yang sama, pending final baseline sign-off dan tanpa DEC baru.

**VERIFIED SOURCE FINDING.** Laporan lengkap M00 tersedia sebagai respons percakapan sebelumnya, tetapi tidak ditemukan sebagai file lokal. Pencarian ulang seluruh AI-Office pada M00B-1.1 mengonfirmasi dua handoff tetap **MISSING**: `AI_OFFICE_HANDOFF_SUBSCRIPTION_FIRST_2026-10-28.md` dan `AI_OFFICE_VISUAL_ASSET_HANDOFF_V1.md`; `docs/handoffs/` belum ada. Tidak ada isi, excerpt atau path sumber lokal yang direkonstruksi. Detail subscription/visual di refinement berasal dari instruksi Owner, bukan pembacaan handoff; source cross-check tetap pending. Inventaris dan matriks tersedia di [alignment report](decisions/M00B_ALIGNMENT_REPORT.md).

## M. Unverified Dependencies

**UNVERIFIED / REQUIRES POC.** Hal berikut tetap terbuka; persetujuan arah bukan bukti implementasi:

1. Ekstraksi renderer Hermes3D, biaya coupling, provenance aset dan performa pada hardware target.
2. Codex interface/version/handshake, account entitlement, model/runtime access dan billing route yang sesuai subscription-first.
3. Enforcement baca/tulis Windows, sibling project/junction escape, secret boundaries, serta perlindungan state otoritatif.
4. SQLite driver/checkpointer, locking, consistent export/import/backup/restore, credential exclusion, path remapping, missing-root/relink/duplicate identity handling dan lokasi fisik database jika exclusion gagal; portability tests M05, bukan full backup M01.
5. Session cancel/resume/recovery, deduplication dan rekonsiliasi side effect; belum ada bukti end-to-end runtime.
6. Retrieval/cache/task/chat isolation lintas proyek dan promosi knowledge sesuai otoritas.
7. Akses inference CEO/PM melalui jalur resmi yang memenuhi billing policy; checkpoint LangGraph tanpa task store kedua.
8. Skill discovery, precedence global/project, compatibility, disable/assignment enforcement dan visibility dalam session sebenarnya.
9. Paket visual/source asli, final asset schema/rig/controller dan reference art direction yang disetujui.
10. Kebijakan background execution, launcher/packaging final, provider tambahan dan autentikasi Telegram.
11. Bukti kedua jalur task memakai satu scheduler/policy, PM direct-task awareness tanpa bottleneck, dan preview-before-backend dengan versioned contracts serta integration evidence terpisah.

Kriteria pembuktian dan kebutuhan review Owner dijabarkan dalam [technical gates dan readiness](decisions/M00B_ALIGNMENT_REPORT.md).
