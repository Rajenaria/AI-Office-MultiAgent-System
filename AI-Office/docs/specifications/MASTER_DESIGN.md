# AI OFFICE — MASTER DESIGN & UI/UX IMPLEMENTATION HANDOFF V1

> **Dokumen handoff untuk chat utama AI Office**  
> Fokus: **Visual Design, UI/UX, interaction design, serta kebutuhan produk yang terkait langsung dengan pengalaman pengguna**  
> Status: **Design discovery handoff — bukan PRD final, bukan instruksi langsung melakukan development besar**  
> Bahasa antarmuka yang direncanakan: **Bahasa Indonesia**  
> Versi: **V1 · 22 Oktober 2026**

---

## PENTING — BACA SEBELUM MELAKUKAN APA PUN

Saya ingin menyinkronkan hasil eksplorasi **Visual Design & UI/UX Discovery AI Office** dari chat khusus desain ke chat utama pembangunan.

Gunakan dokumen ini sebagai referensi desain dan kebutuhan pengalaman pengguna. **Jangan menganggapnya sebagai instruksi untuk membuang arsitektur, kode, keputusan, atau pekerjaan yang sudah ada.**

Urutan pertama yang wajib dilakukan oleh chat utama:

1. Pahami keputusan desain dan bedakan statusnya.
2. Sinkronkan dengan konteks proyek dan arsitektur yang sudah ada.
3. Periksa progres development dan pekerjaan yang sudah berjalan (jika akses repository tersedia).
4. Identifikasi fitur yang sudah didukung, perlu penyesuaian, dan belum tersedia.
5. Susun **gap analysis** dan rencana integrasi bertahap yang aman.
6. Jelaskan trade-off, konflik, dependensi, serta risiko.
7. **Jangan** melakukan refactor besar, perubahan destruktif, atau implementasi di luar scope yang disepakati tanpa izin yang sesuai.

Tujuan akhirnya adalah AI Office yang **berfungsi sungguhan**, menarik, responsif, aman, modular, dan berpotensi didistribusikan sebagai produk software. Keputusan teknis yang sudah disepakati di chat utama tetap menjadi acuan selama tidak bertentangan dengan kebutuhan desain serta keamanan di sini.

---

# BAGIAN 1 — PRODUCT VISION

## 1.1 Apa itu AI Office?

AI Office adalah aplikasi desktop dengan lingkungan **kantor virtual 2.5D/3D** untuk membangun, menjalankan, dan memantau organisasi AI yang mengerjakan berbagai proyek. Pengguna berinteraksi dengan AI Agent seperti berinteraksi dengan anggota tim kerja.

Contoh divisi dan fungsi:

- **PM & Strategy:** PM Agent mengoordinasikan pekerjaan, prioritas, perubahan, dan keputusan.
- **Development:** Developer Agent menangani implementasi dan pekerjaan kode.
- **Design Studio:** Design Agent menangani UI/UX dan artefak desain.
- **QA & Review:** QA Agent melakukan pengujian, evaluasi, dan review.
- **Shared Brain:** Agent/layanan knowledge mengelola konteks dan pengetahuan yang diizinkan.
- **AI Engine Hub:** Pusat pemantauan resource dan status engine.
- **Central Collaboration Hub:** Area visual untuk kolaborasi nyata antaragent.

Pengguna dapat:

- Melihat kantor dan aktivitas agent secara visual.
- Mengeklik serta berbicara dengan agent.
- Memberikan tugas, ide, dan revisi kepada PM.
- Memantau tugas, milestone, hasil pekerjaan, review, dan approval.
- Menangani banyak proyek melalui satu kantor.
- Memantau AI engine, availability, dan usage yang terverifikasi.
- Mengakses perkembangan dan mengirim arahan via HP (opsional).
- Mengustomisasi karakter, kantor, dan preferensi aplikasi.

**Posisi produk:** aplikasi produktivitas dengan pengalaman seperti game simulasi kantor; **bukan** game dekoratif dengan dashboard AI tambahan.

## 1.2 Visi distribusi produk jangka panjang

Rancang agar AI Office tidak bergantung pada satu komputer atau pengguna saja. Target perencanaan:

- Windows, macOS, dan Linux sejauh didukung secara teknis.
- Paket aplikasi/installer yang sesuai setiap OS.
- Pengguna dapat melakukan setup mandiri.
- AI engine dapat dihubungkan sesuai akses dan izin pengguna.
- Organisasi, karakter, divisi, dan proyek dapat dikonfigurasi pengguna.
- Local-first dengan remote access opsional.
- Backup, restore, update, diagnostic, serta manajemen data.

Bangun dan stabilkan produk inti dahulu; **jangan mengejar seluruh fitur komersial sekaligus**.

---

# BAGIAN 2 — KEPUTUSAN DESAIN DAN TINGKAT KEPASTIAN

**Penting:** Bedakan `Approved` (arah disetujui), `Selected / Temporary Preference` (preferensi sementara), dan `Proposal / Needs Validation` (masih perlu diuji). Jangan menaikkan usulan menjadi persyaratan final secara diam-diam.

| Area | Arah | Status |
|---|---|---|
| Art direction | **Clean Modern 2.5D Hybrid — Balanced & Cozy** | **Approved** |
| Office topology | **Central Hub Modular Expandable** | Kandidat utama |
| Pembatas ruangan | **Hybrid Cutaway** | Preferensi terpilih |
| Kepadatan | **Balanced & Cozy** | Preferensi terpilih |
| Bentuk karakter | **Mini Stylized Human** | Preferensi terpilih |
| Karakterisasi | Gender presentation, wajah, kulit, rambut, pakaian, aksesori | Kebutuhan desain disetujui |
| Animasi | **Event-driven**, mempresentasikan pekerjaan nyata | Prinsip disepakati |
| Main UX | **Adaptive Hybrid**: Office + Workspace | Arah terpilih |
| Sidebar | **Live Project Monitor**, slide-out, edge handle | Arah terpilih |
| Focus Mode | Kantor dominan; sidebar dapat disembunyikan/dibuka | Arah terpilih |
| PM interaction | PM Character + PM Command Center + global New Idea | Arah terpilih |
| Multi-project | **Soft Focus**, one office/shared team | Preferensi terpilih |
| Shared Brain | **Smart Hybrid** + provenance/history/permission | Preferensi sementara |
| Engine policy | **Conditional Auto Engine Switching** | Preferensi sementara |
| Onboarding | **Explore First** | Preferensi sementara |
| Graphic quality | Auto, FPS limit 60, animasi/shadow/background rendering aktif | Preferensi sementara |
| Notifications / Mobile | Desktop system alerts + suara; Telegram + dashboard HP sebagai kandidat | Proposal |
| Commercial package | Cross-platform dan self-setup | Visi jangka panjang |

## 2.1 Approved visual language

**Clean Modern 2.5D Hybrid — Balanced & Cozy**:

- Kantor miniatur isometrik bergaya stylized.
- Modern, clean, cozy, fun, tetapi profesional.
- Putih, ivory, krem, warm oak wood, sage green, dan aksen pastel yang lembut.
- Natural daylight dan soft shadows.
- Glass partitions, furnitur modern, tanaman secukupnya.
- Karakter mini manusia stylized, bukan robot futuristik.
- UI SaaS terang yang rapi dan tidak menutupi kantor.

**Hindari:** cyberpunk, neon berlebihan, ruang kendali gelap, hologram sci-fi tanpa fungsi, robot mascot sebagai gaya utama, Minecraft voxel murni, pixel art kasar, admin dashboard generik, dekorasi berlebihan.

> **Referensi visual:** sertakan gambar desain Clean Modern 2.5D Hybrid yang telah disetujui pada chat desain jika tersedia. Dokumen Markdown ini tidak menggantikan gambar referensi dan chat utama tidak boleh mengklaim sudah melihat gambar yang belum dilampirkan.

---

# BAGIAN 3 — ARSITEKTUR VISUAL KANTOR

## 3.1 One persistent office

**Satu kantor virtual permanen untuk seluruh proyek**, tidak membuat kantor baru per proyek. Project Switcher hanya mengubah konteks tampilan; karakter, kantor, dan divisi tetap konsisten. Project lain tidak berhenti ketika pengguna memfokuskan satu proyek.

## 3.2 Central Hub Modular Expandable

Susunan awal: satu lantai, **Central Collaboration Hub** di tengah dan ruangan-ruangan utama di sekelilingnya; sirkulasi antarruang jelas; ekspansi modular ke samping/klaster secara bertahap. Ruangan tidak harus identik atau terikat grid kaku.

Ruangan utama:

1. PM & Strategy.
2. Development.
3. Design Studio.
4. QA & Review.
5. Shared Brain / Knowledge Library.
6. AI Engine Hub.
7. Central Collaboration Hub.

**Proporsi awal untuk eksplorasi** (area fungsional, bukan ukuran bangunan final):

| Area | Persentase konsep |
|---|---:|
| Development | 22% |
| Central Collaboration Hub | 18% |
| Design Studio | 14% |
| QA & Review | 12% |
| PM & Strategy | 12% |
| Shared Brain | 12% |
| AI Engine Hub | 10% |

Persentase tidak memasukkan sirkulasi/dinding secara teknis; boleh direvisi setelah uji visual.

## 3.3 Hybrid Cutaway architecture

- Dinding belakang utuh atau sedang.
- Dinding depan rendah atau transparan agar interior terbaca.
- Sekat kaca pada ruang terpilih.
- Jalur terbuka dan susunan meja terlihat dari kamera isometrik.
- Variasi elevasi kecil/diorama platform; hindari multi-level kompleks pada awal.
- Antarruangan tetap terasa sebagai satu kantor koheren, bukan modul yang melayang terpisah.

## 3.4 Fungsi visual tiap ruangan

| Ruangan | Elemen lingkungan & interaksi |
|---|---|
| PM & Strategy | Meja PM, planning board, area konsultasi, akses PM Command Center |
| Development | Meja coding, monitor, workstation agent, akses development activity |
| Design Studio | Creative desks, desain board, hasil mockup |
| QA & Review | Testing station, review board, status quality |
| Shared Brain | Perpustakaan/knowledge hub modern; pencarian pengetahuan di UI 2D |
| AI Engine Hub | Monitor teknis ringan; status engine dan usage |
| Central Hub | Meeting table, diskusi lintas divisi, kolaborasi berbasis event nyata |

Objek 3D adalah titik masuk interaksi; **jangan menaruh semua dokumen dan log panjang sebagai teks di dunia 3D**. Detail berada di dashboard 2D.

## 3.5 Ekspansi

- Menambah workstation/divisi secara modular.
- Memungkinkan area baru: Research, Security, QA Extension, dan sebagainya.
- **Ekspansi visual tidak otomatis menciptakan agent atau tugas baru.**
- Ketika agent banyak, prioritaskan keterbacaan, kamera fokus, dan pengelompokan; bukan hanya memperbesar kantor.
- Pisahkan kapasitas agent aktual dari jumlah representasi karakter yang harus terlihat sekaligus.

## 3.6 Hermes3D / frontend candidate

Hermes3D adalah **kandidat** fondasi dengan pendekatan selective fork dan visual redesign; belum otomatis menjadi keputusan final. Evaluasi:

- Struktur repository dan kualitas codebase.
- Lisensi, atribusi, dan hak redistribusi/komersialisasi.
- Renderer, camera, picking/selection, scene architecture.
- Kemudahan mengganti visual asset dan UX.
- Performa serta batas platform.
- Risiko adaptasi dibanding alternatif lebih sederhana.

Jangan mengambil keputusan refactor frontend besar tanpa audit.

---

# BAGIAN 4 — MAIN OFFICE UI LAYOUT

## 4.1 Office-centric adaptive layout

Struktur layar desktop:

1. **Top Bar** — AI Office, Project Switcher, New Idea, notifikasi, Focus Mode, Settings.
2. **Live Project Monitor Sidebar** — informasi utama, milestone, aktivitas dan hasil divisi, quick navigation.
3. **Main Office View** — kantor 2.5D sebagai centerpiece.
4. **Right Context Inspector** — muncul saat agent, task, divisi atau objek dipilih.
5. **Mini Status Bar** — status utama walau sidebar tersembunyi.
6. **Notification Drawer** — alert terstruktur, tidak spam.
7. **Workspace navigation** — detail operasional saat dibutuhkan.

Referensi uji layout desktop **1440 × 900**, tetapi tetap responsif. Jangan mengunci ukuran viewport.

## 4.2 Top Bar

- Branding AI Office.
- Global Office / Project Switcher.
- Indikator tampilan saat ini.
- **+ New Idea** tersedia global.
- Notification badge.
- Toggle Focus Mode.
- Settings.
- Status sistem seperlunya.

Tampilan ringan, terang, minimal; hindari terlalu banyak tombol permanen.

## 4.3 Live Project Monitor Sidebar

Ini **bukan hanya menu navigasi**; sidebar menjadi ringkasan operasional live yang selalu dapat diakses.

### A. Overall Project Progress

- Nama/konteks proyek.
- Progres keseluruhan jika dapat dihitung sah.
- Milestone selesai dan status proyek.

### B. Active Milestone

- Nama milestone.
- Acceptance criteria terverifikasi.
- Status, progres terukur atau `Unknown`.

### C. Department Activity

Untuk tiap divisi:

- Nama divisi dan jumlah agent aktif.
- Tugas saat ini.
- Status aktual.
- Tahap/progres yang terukur.
- **Hasil kerja terbaru**, misalnya dokumen, test result, atau perubahan yang telah diverifikasi.
- Blocker/perlu approval bila ada.
- Timestamp pembaruan.

### D. Quick Navigation

Office Overview, PM Command Center, Task Board, Agent Dashboard, Department Dashboard, Approval Center, Shared Brain, Engine Usage Monitor, Portfolio Dashboard.

### Ringkas dan dapat diperluas

Tampilkan info paling penting, expandable per divisi, jangan menduplikasi seluruh Task Board. Klik membawa pengguna ke konteks yang tepat.

## 4.4 Slide-out sidebar dan Focus Mode

- Sidebar dapat slide keluar ke kiri.
- Sisakan **edge handle** kecil sekitar 28–36 px (usulan ukuran UI; validasi saat prototype).
- Klik handle untuk membuka; di Focus Mode dapat muncul sebagai overlay agar kantor tidak mengecil.
- Opsi Pin Sidebar boleh dipertimbangkan.
- Mini status dan alarm penting tetap terlihat.
- Ketika Focus Mode keluar, pulihkan layout sebelumnya jika sesuai.

## 4.5 Mini Status Bar

Ringkas: proyek aktif, milestone, agent aktif, approval pending, alert penting. Klik indikator membuka konteks yang bersangkutan.

## 4.6 Right Context Inspector

Muncul **on demand** ketika pengguna memilih agent, divisi, task, workstation, approval, atau knowledge record. Dapat ditutup, diubah lebar jika praktis, serta diperluas menjadi Workspace Mode.

---

# BAGIAN 5 — ADAPTIVE HYBRID NAVIGATION

## 5.1 Office Mode

Fokus: menikmati/memantau kantor 2.5D, melihat agent dan divisi, interaksi cepat, sapaan, status, dan New Idea.

## 5.2 Workspace Mode

Fokus: membaca/mengelola informasi panjang — Task Board, PM Center, Agent Workspace, Approval, Shared Brain, AI Engine Monitor, Global Portfolio, log, file, hasil test.

Kedua mode menggunakan **satu sumber data/status yang sama**.

## 5.3 Context preservation

Pertahankan:

- Proyek yang sedang dipilih.
- Agent dan task yang sedang diinspeksi.
- Riwayat navigasi relevan.
- Posisi/fokus kamera bila masuk akal.
- Input/pesan yang belum dikirim dan konteks percakapan.

Contoh alur: `Office → klik Alex → Agent Inspector → detail task di Workspace → Back to Alex`.

## 5.4 Office Focus Mode

Bukan mode aplikasi baru terpisah: menyederhanakan UI saat pengguna ingin melihat kantor lebih luas. Edge handle, status kritis, pengaturan kamera, dan jalan kembali tetap dapat diakses.

## 5.5 Pemetaan klik yang konsisten

| Objek | Respons UX |
|---|---|
| Karakter AI | Greeting + Agent Inspector |
| Workstation/meja | Task/pekerjaan aktif agent |
| Ruangan divisi | Department Dashboard |
| Karakter PM | Chat PM dan quick actions |
| Ruangan PM | PM Command Center |
| Planning board | Roadmap / Task Board |
| Shared Brain room | Knowledge Workspace |
| AI Engine Hub | Usage Monitor |
| Notification | Buka event/approval yang tepat |

---

# BAGIAN 6 — CHARACTER DESIGN & CUSTOMIZATION

## 6.1 Character direction

**Mini Stylized Human**, dengan kepala sedikit besar, tubuh compact, wajah ramah, detail mudah dibaca dari sudut isometrik, gaya casual-professional. Bukan robot mascot utama.

## 6.2 Identitas permanen

Setiap agent memiliki ID unik, nama, peran, divisi, identitas visual, dan riwayat tugas. Identitas visual tidak berubah karena project atau engine berganti.

## 6.3 Character Editor

Pilihan kustomisasi:

- Nama.
- Presentasi gender: pria, wanita, netral.
- Warna kulit dengan palet beragam.
- Bentuk wajah yang berbeda.
- Mata dan alis.
- Model/warna rambut.
- Pakaian: kaos, kemeja, hoodie, blazer, dan lain-lain.
- Palet warna pakaian.
- Aksesori: kacamata, headset, pin, dan sebagainya.
- Badge atau aksen divisi.

**Pakaian tidak dikunci oleh gender.** Variasi wajah dan karakter harus terlihat berbeda meskipun model tetap low detail.

## 6.4 Default visual per divisi

| Divisi | Inspirasi outfit default |
|---|---|
| PM & Strategy | Smart casual, blazer/kemeja |
| Development | Hoodie, kaos, headset |
| Design Studio | Pakaian kreatif, pastel |
| QA & Review | Casual rapi dan aksesori teknis |
| Shared Brain | Smart casual/kacamata opsional |
| AI Engine Hub | Casual-professional teknis |

Default **tidak mengunci** pilihan personalisasi. Identitas divisi juga hadir pada label, badge, dan ruang.

## 6.5 Safe customization

Preview perubahan langsung jika praktis. Ganti penampilan **tidak boleh** mengubah ID, permission, memori, pekerjaan, atau data agent.

---

# BAGIAN 7 — EVENT-DRIVEN ANIMATION

**Aturan non-negotiable:** karakter harus menggambarkan pekerjaan berdasarkan event/state nyata, **bukan pura-pura sibuk**.

## 7.1 Sumber kebenaran

`Actual Agent Event → Validated Agent State → UI State → Visual Animation`.

Visual tidak mengendalikan tugas. Rendering dapat dijeda tanpa menghentikan agent.

## 7.2 State-to-animation mapping

| Status terverifikasi | Animasi / representasi visual |
|---|---|
| Idle | Duduk santai, berdiri, idle subtle |
| Coding / Working | Bekerja di workstation, typing stylized bila relevan |
| Researching | Membaca dokumen / melihat layar riset |
| Designing | Menggunakan meja/design board |
| Testing | Memeriksa layar QA/test |
| Reviewing | Meninjau dokumen/hasil kode |
| Collaborating | Bergabung di Central Hub ketika ada event kolaborasi nyata |
| Waiting Approval | Animasi kerja tertahan; approval badge |
| Blocked | Aktivitas terhenti; indikator blocked |
| Completed | Gesture kecil lalu idle/antrean berikutnya |
| Error | Alert dan status error tanpa animasi kerja palsu |
| Unknown / Stale | Indikator ketidakpastian/koneksi, bukan terus mengklaim sedang bekerja |

Jika sistem hanya tahu task `Running`, jangan mengklaim tindakan spesifik (mis. sedang menjalankan tes tertentu) tanpa bukti.

## 7.3 Kosmetik vs faktual

Animasi melambaikan tangan, menoleh, minum kopi, breathing, dan ekspresi kecil boleh menjadi kosmetik. Mereka **bukan event pekerjaan**, tidak boleh masuk ke activity log sebagai pekerjaan aktual.

## 7.4 Timeliness & accuracy

Tampilkan sumber/time last update, dan status `Stale`/`Unknown` jika event tidak diperbarui. Kegagalan komunikasi tidak boleh terlihat seperti aktivitas real-time yang masih berjalan.

## 7.5 Efisiensi

Animasi untuk agent jauh atau tidak terlihat dapat dikurangi. Mode grafis harus bisa mematikan efek tanpa menghapus status penting di UI.

---

# BAGIAN 8 — AGENT INTERACTION SYSTEM

## 8.1 Tiga tingkatan

**Level 1 — Quick Interaction:** klik karakter, highlight, kamera mendekat lembut, greeting singkat, ringkasan status.

**Level 2 — Agent Inspector:** panel kanan berisi identitas, task, progress, status, event, riwayat, chat.

**Level 3 — Agent Workspace:** halaman penuh untuk diskusi panjang, file changes, test results, log, review, dan task management.

## 8.2 Dynamic greeting

Sapaan natural sesuai kondisi, bukan selalu sama, contohnya:

- Idle: “Halo bos! Ada tugas baru?”
- Working: “Aku sedang mengerjakan Authentication API. Mau lihat progresnya?”
- Waiting Approval: “Aku membutuhkan keputusan supaya bisa melanjutkan.”

Jangan menampilkan greeting berulang tanpa perlu. Sapaan faktual harus sesuai state aktual.

## 8.3 Agent Inspector

Informasi:

- Avatar, nama, role, divisi, project aktif.
- AI engine yang digunakan **jika dapat diverifikasi**.
- State dan last update.
- Tugas dan milestone.
- Checklist/progres terukur.
- Activity Feed dengan event source/timestamp.
- Latest outputs, deliverables, test status.
- History per proyek.
- Input prompt/chat.

Tab awal: `Activity`, `History`, `Chat`.

## 8.4 Chat dan tugas

Pengguna bisa tanya progres, membaca hasil, atau mengusulkan task. Untuk pesan yang **mengubah scope/prioritas/pekerjaan**, koordinasikan melalui PM sesuai batas kewenangan. Tanya jawab informatif bisa langsung ke agent.

## 8.5 Watch Agent Work / Work Replay

Konsep lanjutan:

- **Watch Agent Work:** kamera mengikuti agent dan aktivitas log nyata.
- **Work Replay:** timeline event dan artefak, **bukan** rekaman visual palsu.
- **Agent Needs You:** indikator terkait permintaan approval.

---

# BAGIAN 9 — PM AGENT & CHANGE MANAGEMENT

## 9.1 PM sebagai pusat perubahan

Semua request perubahan scope/prioritas dan penugasan diselaraskan oleh **PM Agent**. Pengguna bebas menyampaikan ide lewat:

- Tombol global `+ New Idea`.
- Chat PM.
- Chat agent tertentu (diteruskan ke koordinasi PM bila mengubah pekerjaan).

## 9.2 Dua titik interaksi PM

**PM Character:** sapaan, pertanyaan, diskusi cepat, new idea, ringkasan kondisi dan rekomendasi.

**PM Office / Command Center:** Overview, Idea Inbox, Change Requests, Team Coordination, Decision Queue, analisis lengkap.

Bukan dua PM berbeda; keduanya menggunakan sumber data yang sama.

## 9.3 Skenario perubahan mendadak

Saat semua agent sedang bekerja, pengguna tetap bisa menyampaikan ide tanpa menghentikan semuanya.

Alur:

1. Ide diterima dengan konteks proyek.
2. Disimpan sebagai ide/change request; belum otomatis dieksekusi.
3. PM mengevaluasi dampak terhadap task, agent, dependensi, milestone, dan risiko.
4. PM merekomendasikan penanganan.
5. Pengguna/aturan yang berwenang memilih tindakan.
6. PM menjadwalkan task di titik aman, mengoordinasikan pekerjaan terdampak.
7. Sidebar, Task Board, dan agent status memantulkan update dari sistem nyata.

## 9.4 Tiga tindakan

- **Save Idea:** catat tanpa mengganggu pekerjaan.
- **Schedule Revision:** jadwalkan pada checkpoint aman.
- **Prioritize Now:** telaah reprioritisasi segera dengan kontrol konflik, permission, dan approval.

Prioritize Now **bukan** izin otomatis membatalkan semua task.

## 9.5 Change Impact Summary

Berisi:

- Apa yang berubah dan mengapa.
- Proyek yang terkena.
- Task/agent/divisi terdampak.
- Dependensi dan risiko.
- Dampak terhadap milestone.
- Strategi checkpoint dan rekomendasi.
- Approval yang dibutuhkan.
- Hal yang belum diketahui.

Jangan mengarang ETA atau persentase keberhasilan tanpa dasar.

## 9.6 Safe checkpoints

Task yang tidak terdampak tetap berjalan. Pekerjaan terdampak diselesaikan sampai checkpoint, dijeda, dijadwalkan ulang, atau dibatalkan **secara terkontrol**. Artefak relevan tidak dibuang tanpa evaluasi. Coding agent menggunakan isolated Git worktree dan controlled integration sesuai ketentuan chat utama.

---

# BAGIAN 10 — TASK BOARD & TASK INSPECTOR

## 10.1 Board

Kanban modern dengan kolom/kondisi yang dipertimbangkan:

- Backlog.
- Ready / Scheduled.
- In Progress.
- In Review.
- Changes Requested.
- Ready to Integrate.
- Completed.

`Blocked` dan `Waiting Approval` harus ditampilkan jelas, baik sebagai state maupun overlay indicator yang semantik.

## 10.2 Task Card

Title, project, milestone, assigned agent/division, priority, state, dependensi relevan, dan progres *jika terukur*.

## 10.3 Task Inspector

Detail task, acceptance criteria, event history, deliverables, file changes, Git worktree reference, test results, review, quality gates, integration status, dan link ke agent/proyek.

## 10.4 Progress yang dapat dipercaya

Jangan tampilkan “90%” semata-mata karena agent sudah lama bekerja. Progres berasal dari acceptance criteria/checklist terverifikasi/milestone gates. Jika tidak ada dasar, gunakan `In Progress` atau `Unknown`.

## 10.5 Controlled integration state

UI membedakan:

1. Work started / changes being written.
2. Review/testing ongoing.
3. Changes requested.
4. Ready to integrate setelah gate terpenuhi.
5. Integrated/Completed setelah syarat selesai.

Penulisan kode selesai **tidak sama** dengan kode sudah terintegrasi.

## 10.6 Navigasi dua arah

Dari Task Board → `View in Office` mengarah ke karakter/divisi terkait; dari karakter/workstation → task aktif. Restore context saat kembali.

---

# BAGIAN 11 — MULTI-PROJECT EXPERIENCE

## 11.1 Shared team

Satu organisasi AI mengerjakan beberapa proyek. Identitas agent tetap, assignment bergantung pada PM. Jangan menduplikasi karakter yang sama menjadi satu per proyek.

## 11.2 Global Office vs Project Focus

**Global Office:** pantau seluruh proyek, agent aktif, milestone, blocker, approvals.

**Project Focus:** filter informasi dan tonjolkan agent/pekerjaan proyek yang dipilih tanpa menghentikan proyek lain.

## 11.3 Soft Focus

- Agent proyek aktif tampak lebih menonjol.
- Agent proyek lain tetap hadir dan animasinya tetap sesuai state.
- Label/efek sekunder lebih kalem, tidak disembunyikan/menjadi “hantu”.
- Warna pakaian dan arsitektur tetap identitas yang permanen.
- Alert penting dari proyek lain tetap terlihat dengan label proyek.

## 11.4 Project switching adalah perubahan tampilan

Tidak otomatis pause, cancel, reassign, reset progress, atau mengubah workspace aktif yang dikerjakan agent.

## 11.5 Context safety

Setiap ide, chat, task, knowledge record, dan approval harus menyimpan project scope. Dari Global View, jika proyek tujuan tidak jelas, PM meminta klarifikasi daripada salah mengirim instruksi.

## 11.6 Global Portfolio Dashboard

Sajikan daftar proyek, milestone, kondisi, blocker, workload, latest deliverables, pending decisions, dan progres terverifikasi. Jangan agregasikan persentase dengan metode yang menyesatkan.

## 11.7 Cross-project scheduling

Baseline UX: satu tugas eksekusi utama aktif per agent pada suatu waktu, dengan queue. PM mempertimbangkan priority/deadline/dependensi/checkpoint sebelum mengubah assignment. Paralelisme agent tambahan dievaluasi terpisah apabila aman.

---

# BAGIAN 12 — SHARED BRAIN & MEMORY UX

## 12.1 Smart Hybrid

Informasi faktual relevan boleh dicatat otomatis dengan sumber dan status; keputusan permanen, perubahan kebijakan, dan promosi ke shared knowledge harus melewati review sesuai kewenangan.

## 12.2 Tiga scope

1. **Organization Brain:** pedoman organisasi, standar umum, quality gates, kebijakan keamanan yang berlaku lintas proyek.
2. **Project Brain:** requirements, keputusan, arsitektur, desain, change requests, task outputs, hasil riset dan milestone khusus proyek.
3. **Agent Working Context:** catatan task aktif, investigasi, dan hasil sementara; tidak otomatis menjadi kebenaran permanen.

## 12.3 Knowledge Library UI

Di kantor berupa ruangan perpustakaan modern; klik membuka Knowledge Workspace 2D dengan:

- Search/filter scope/category.
- Ask Shared Brain.
- Decision Timeline.
- Knowledge detail.
- Source/provenance.
- Version/history.
- Linked tasks/artifacts.
- Status verification.
- Permission indicators.

Jika jawaban tidak punya sumber cukup, UI/agent menyatakan ketidakpastian.

## 12.4 Knowledge lifecycle

`Source/Agent Result → Knowledge Candidate → Review/Validation → Project/Organization Brain`.

Catat sumber, owner, waktu, scope, status, dan version. Ketika keputusan baru menggantikan yang lama, versi dan alasan sebelumnya tetap dapat dilacak; terkait task/dokumen ditandai untuk re-evaluation.

## 12.5 Permission boundary

Informasi spesifik satu proyek tidak otomatis masuk proyek lain atau Organization Brain; jangan mempromosikan secrets ke shared knowledge. Terapkan aturan izin dan audit yang sesuai.

---

# BAGIAN 13 — APPROVAL CENTER & NOTIFICATION SYSTEM

## 13.1 Satu approval, banyak titik akses

Permintaan yang sama dapat terlihat pada karakter agent, PM Office, Live Sidebar, Notification Drawer, Approval Center, dan remote mobile. Jangan membuat keputusan atau status terduplikasi/tidak sinkron.

## 13.2 Approval detail

Tampilkan: proyek, requester, tindakan dan scope izin, alasan, risiko, potensi dampak, rekomendasi PM, bukti/test, opsi keputusan dan confirmation.

Opsi desain dasar:

- **Approve Once** sesuai scope.
- **Request Changes**.
- **Reject**.

Persetujuan tingkat lebih luas hanya bila kebijakan mendukung dan jelas. Tindakan berisiko tinggi **tidak auto-approved**.

## 13.3 Notification tiers

| Tingkat | Contoh | Presentasi |
|---|---|---|
| Informational | Task update, result ready | Feed / ringkasan tenang |
| Action Required | Approval, blocker, PM decision | Badge + drawer |
| Critical | Security risk, operasi berbahaya, system failure penting | Peringatan menonjol; tahan tindakan berisiko |

Kelompokkan event terkait agar tidak spam. Notifikasi harus dapat membawa pengguna ke konteks/task/proyek yang tepat.

## 13.4 Desktop notifications & sound

Rencanakan notifikasi sistem sesuai OS dengan izin pengguna. Pengguna ingin tahu ketika membuka aplikasi/tab lain. Sediakan suara opsional, kategori alert, Quiet/Balanced/Active, dan pengaturan sesuai kemampuan OS. Jangan menjanjikan notifikasi ketika app/proses sudah berhenti jika infrastrukturnya tidak mendukung.

## 13.5 Decision history

Catat aktor, keputusan, waktu, scope, proyek, dan outcome. Approval tidak otomatis berarti tindakan berhasil.

---

# BAGIAN 14 — REMOTE COMMAND & MOBILE EXPERIENCE

## 14.1 Tujuan

Pemilik AI Office dapat melihat progres dan mengambil keputusan dari HP melalui kanal aman saat jauh dari komputer host.

Fungsi: summary proyek, milestone, aktivitas divisi, hasil terbaru, error alert, pending approval, PM chat, New Idea, dan perintah yang diizinkan.

## 14.2 Kandidat platform

1. **Telegram Bot** — komunikasi cepat, alert, PM summary, input ide.
2. **Mobile Web/PWA Dashboard** — monitoring terstruktur dan approval yang lebih aman.
3. **WhatsApp Business integration** — opsional masa depan karena aturan dan biaya lebih kompleks.

Validasi API, biaya, TOS, dan dukungan resmi pada saat implementasi. Jangan menyatakan semuanya pasti gratis.

## 14.3 Telegram interaction

Contoh:

- “PM, bagaimana progres semua proyek?”
- “Apa error terbaru dari QA?”
- “Tambahkan ide Google Login ke Project Alpha.”
- “Buka permintaan approval yang menunggu.”

Chat dan instruksi tetap mengikuti policy PM dan proyek yang benar. Untuk approval sensitif, rencanakan redirect ke halaman aman.

## 14.4 Mobile dashboard scope

Prioritaskan 2D mobile-first: portfolio ringkas, progress/milestones, live department summary, alerts, approvals, PM chat, notification history. **Tidak wajib** menampilkan kantor 3D penuh di HP.

## 14.5 Security remote

- Pairing perangkat/akun yang terverifikasi.
- Identity dan authorization.
- Secure transport.
- Session expiry, revoke, dan audit.
- Permission scoping per proyek/aksi.
- Perlindungan tokens/secrets.
- Pencegahan replay/command spoofing.
- Konfirmasi tambahan tindakan sensitif.

Jangan menganggap username/nomor Telegram cukup untuk memberi hak admin. Pesan bot bukan tempat menyebarkan kredensial atau secret.

## 14.6 Host availability

Jika komputer host tidur/offline, agent lokal mungkin berhenti. Mobile menampilkan `Connected`, `Reconnecting`, `Offline`, `Last-known`, `Stale`; jangan mengklaim agent terus bekerja. Komponen always-on adalah opsi infrastruktur masa depan, bukan fitur yang otomatis tersedia.

---

# BAGIAN 15 — AI ENGINE USAGE & RESOURCE MANAGEMENT

## 15.1 Konsep

AI Engine Hub dapat dibuka dari kantor, sidebar, Agent Inspector, PM Dashboard, dan mobile. Kandidat engine termasuk Codex dan Antigravity sesuai integrasi resmi/yang sah.

## 15.2 Data yang diharapkan jika tersedia

- Status engine: Available, Busy, Limited, Offline, Unknown.
- Agent/task yang memakai engine.
- **Multiple usage windows** bila didukung.
- Amount/remaining quota bila terverifikasi.
- Reset timer bila diketahui.
- Rate-limit/error events.
- Data source dan last update.

## 15.3 Kualitas data

- **Verified:** terverifikasi dari sumber yang relevan.
- **Estimated:** estimasi, dengan label/metodologi yang jelas.
- **Unknown:** data tidak tersedia/tidak dapat dipercaya.

Jangan mengarang angka usage, quota, atau waktu reset. Setiap provider mungkin menyediakan data berbeda.

## 15.4 Conditional Auto Engine Switching

PM dapat mengganti engine secara otomatis **hanya** dalam batas yang sudah disetujui: daftar engine, biaya, permission, kemampuan task, kualitas, kompatibilitas, state pekerjaan, dan quality gates. Jika ragu atau risiko tinggi, rekomendasikan atau minta keputusan. Hindari pergantian di tengah tugas tanpa checkpoint dan penanganan konteks yang benar.

## 15.5 Strategi resource (konsep)

- Balanced (default kandidat).
- Quality First.
- Quota Saver.

Perubahan strategi tidak menembus permission atau quality gates.

---

# BAGIAN 16 — GRAPHICS & PERFORMANCE UX

## 16.1 Graphic Settings

Preset: `Auto`, `Low`, `Medium`, `High`, `Custom`.

FPS limit yang dapat dipertimbangkan: `30`, `60`, `120` bila didukung, dan `Auto`. Pilihan awal pengguna: **Auto quality, limit 60 FPS, animasi agent aktif, shadows aktif, background rendering aktif**.

Opsi tambahan: render resolution, lighting detail, camera behavior, UI density, reduced motion, background throttling, efek dekorasi.

## 16.2 Background rendering aktif ≠ tanpa batas

Tetap hormati keadaan jendela foreground, tab tersembunyi, jendela minimize, daya/baterai, serta kebijakan OS. **Rendering boleh dibatasi/dijeda** tanpa memengaruhi agent/orchestration.

## 16.3 Performance first

Target desain diuji, bukan dijanjikan:

- Kantor responsif dengan smooth camera/selection.
- 60 FPS sebagai target pada perangkat memadai; fallback 30 bila perlu.
- Feedback interaksi segera.
- Dashboard 2D tetap responsif ketika scene berat.
- Rendering dan kerja agent terisolasi secara arsitektural.

## 16.4 Kandidat optimasi untuk evaluasi teknis

Low-poly geometry, batching/instancing, shared materials, baked lighting jika cocok, limited dynamic shadow, culling/LOD, animation throttling, adaptive quality. Jangan mengunci teknik renderer tanpa audit.

---

# BAGIAN 17 — FIRST-RUN, ONBOARDING & SETTINGS

## 17.1 Explore First

Pengguna baru bisa masuk kantor **Demo Mode** sebelum menghubungkan engine. Semua aktivitas/angka jelas ditandai **simulasi**. Jangan menganggap pekerjaan AI real sedang berjalan.

## 17.2 Setup path

Contoh tahapan wizard:

1. Welcome & Device Check.
2. AI Engine Connection.
3. Workspace & Security.
4. Create Your AI Team.
5. Remote & Notifications (optional).
6. Office Readiness & Enter Office.

Pengguna dapat menunda opsi non-esensial, melanjutkan setup, dan mengubah pengaturan nanti.

## 17.3 Guided Office Tour & PM greeting

PM menyapa secara natural dan memberi pilihan Create Project / Import Project / Explore Office. Tur singkat, dapat dilewati dan diulang. Jika engine belum siap, sampaikan keterbatasan nyata.

## 17.4 System Readiness

Tampilkan `Ready`, `Needs Setup`, `Unavailable`, `Optional`, atau status sejenis untuk renderer, engine, workspace, security, remote. Jangan menyatakan sistem siap ketika izin/integrasi inti belum terpenuhi.

## 17.5 Unified Settings Center

Kategori:

- Office & Graphics.
- AI Team & PM.
- AI Engines.
- Projects & Workspace.
- Security & Approvals.
- Notifications & Remote.
- Data & System.

Perubahan kosmetik bisa langsung diperlihatkan. Perubahan berisiko (engine, workspace, izin) harus diperiksa dampaknya dan meminta konfirmasi yang sesuai.

## 17.6 Backup & migration UX

Rancang konsep Backup & Restore, import/export, migrasi versi, perangkat baru, perlindungan secrets, dan konsistensi identity/task/project history. Ini kebutuhan kesiapan produk, implementasi dapat bertahap.

---

# BAGIAN 18 — PRODUCT DISTRIBUTION READINESS

Rancang sejak awal agar produk dapat kelak dipaketkan untuk orang lain:

- Cross-platform architecture dan packaging.
- Self-service setup dan device capability detection.
- Pengaturan engine yang fleksibel dan tidak mengikat akun pembuat.
- Local data ownership dan remote optional.
- Backup/restore/update/diagnostics.
- Documented permissions dan audit.
- Dependency/asset licensing compliance.
- Support untuk environment berbeda dan status belum dikonfigurasi.

**Jangan mengasumsikan** Hermes3D, Codex, Antigravity, model, aset, dan layanan pihak ketiga boleh disertakan atau dijual ulang tanpa pemeriksaan lisensi/terms. Installer AI Office bisa menyediakan integrasi sambil meminta pengguna menyediakan akses legal sendiri.

---

# BAGIAN 19 — REKOMENDASI PRIORITAS PEMBANGUNAN

**Ini adalah urutan usulan desain, bukan perintah melakukan development sekarang.** Urutan akhir tergantung audit existing codebase dan dependensi nyata.

| Phase | Fokus | Deliverable orientasi |
|---|---|---|
| A — Foundation Alignment | Audit repository/renderer/orchestration/state/security | Gap analysis dan keputusan kompatibilitas |
| B — Main Office Visual | Scene 2.5D, Central Hub, cutaway, UI shell, kamera, sidebar, Focus | Kantor utama koheren |
| C — Agent Interaction | Character selection, Inspector, greeting, history, chat, event state | Agent benar-benar bisa diinspeksi |
| D — PM & Change | PM Center, New Idea, Impact, change lifecycle, safe scheduling | Revisi aman dan terstruktur |
| E — Task & Monitoring | Task Board, Inspector, milestone, division results, gates, worktree state | Progres/hasil dapat ditelusuri |
| F — Multi-Project | Project Switcher, Soft Focus, Portfolio, PM queue/context | Satu kantor banyak proyek tanpa konflik |
| G — Brain & Engine | Knowledge/provenance/permission; usage/Unknown/switch policy | Knowledge/resource UX terpercaya |
| H — Notifications/Mobile/Product | Native alerts, Telegram/mobile assessment, secure remote, onboarding, packaging | Pengalaman lintas perangkat dan kesiapan distribusi |

Gunakan **incremental vertical slices** dan uji UI terhadap event nyata sedini mungkin; jangan membangun UI palsu yang lama-lama dianggap implementasi sesungguhnya.

---

# BAGIAN 20 — UX ACCEPTANCE SCENARIOS

## Scenario 1: Open & monitor

Saat membuka AI Office, pengguna bisa memahami proyek, milestone, progres terukur, divisi aktif, tugas, hasil terbaru, dan keputusan tertunda **tanpa berputar di banyak halaman**.

## Scenario 2: Click agent

Klik Developer → greeting sesuai state, current task, aktivitas terverifikasi, progress jika ada, history, chat, navigasi kembali.

## Scenario 3: Sudden idea while agents work

Kirim New Idea → PM memeriksa scope/dependensi → menyarankan Save/Schedule/Prioritize → pekerjaan tak terdampak tetap berjalan → keputusan tercatat.

## Scenario 4: Switch project

Alpha → Beta → sidebar dan Task Board berganti konteks; agent Alpha tetap bekerja; alert Alpha tetap bisa ditinjau; tidak terjadi pencampuran data/proyek.

## Scenario 5: Focus Mode

Office membesar; sidebar slide-out, edge handle, mini status bar, critical alert tetap tersedia; restore layout saat keluar.

## Scenario 6: Approval

Permintaan izin teridentifikasi dan terikat ke proyek/aksi; pengguna melihat alasan, bukti, dan risiko; tindakan wajib approval tetap tertahan sampai keputusan yang sah.

## Scenario 7: Unknown engine usage

Tidak ada sumber kuota → status `Unknown`, **tidak** ada angka/reset palsu; PM memperhitungkan ketidakpastian.

## Scenario 8: Mobile remote

Pengguna dapat melihat keadaan terkini atau last-known state, chat PM dengan autentikasi tepat, dan meninjau approval; jika host offline, UI mengatakannya.

## Scenario 9: Performance degradation

Ketika render berat, kualitas bisa diturunkan dan UI operasional tetap digunakan; pekerjaan agent tidak terhenti.

## Scenario 10: New user

Explore Demo → pahami perbedaan demo vs real → setup engine/workspace/izin → PM onboarding → mulai proyek pertama.

## Scenario 11: Traceability

Dari klaim “task selesai”, pengguna dapat membuka hasil, pengujian, review, siapa mengerjakan, dan apakah perubahan sudah terintegrasi.

## Scenario 12: Context loss / stale event

Koneksi event terputus → status berubah menjadi Unknown/Stale; karakter tidak terus menampilkan klaim real-time yang tidak terverifikasi.

---

# BAGIAN 21 — NON-NEGOTIABLE PRINCIPLES

1. **One Persistent Office:** satu kantor untuk semua proyek.
2. **Shared AI Team:** karakter dan identitas agent permanen.
3. **PM-Centered Coordination:** perubahan pekerjaan melewati PM.
4. **Event-Driven Visualization:** animasi mengikuti state nyata.
5. **No Fake Progress:** progres berasal dari kriteria terverifikasi.
6. **Verified Resource Data:** usage dan reset tidak dikarang.
7. **Adaptive Hybrid UX:** Office ↔ Workspace mempertahankan konteks.
8. **Soft Focus Multi-Project:** proyek lain tetap bekerja.
9. **Smart Hybrid Knowledge:** provenance, versi, scope, permission.
10. **Safe Approval:** high-risk actions tidak auto-approved.
11. **Controlled Code Integration:** isolated worktrees, review, quality gates.
12. **Performance First:** renderer tidak boleh menghambat agent.
13. **Cross-Platform Mindset:** jangan mengunci satu OS/perangkat.
14. **Remote Optional:** pengguna dapat local-first.
15. **Product-Ready by Design:** pikirkan distribusi, setup, update dan licensing.
16. **No Silent Destructive Changes:** tidak menghapus/merombak pekerjaan tanpa alasan dan izin.
17. **Clear Demo vs Real:** contoh simulasi tidak diklaim sebagai sistem aktif.
18. **One Source of Truth:** panel, kantor, PM, dan remote merefleksikan state konsisten.
19. **Security by Design:** permissions dan audit berlaku lintas kanal.
20. **Accessibility & Comfort:** support reduced motion, pengaturan alert, readability, dan penggunaan lama.

---

# BAGIAN 22 — INSTRUKSI UNTUK CHAT UTAMA SEKARANG

**Jangan langsung melakukan development besar.** Kerjakan penilaian/penyelarasan berikut secara berurutan.

## STEP 1 — Context Synchronization

Rangkum kebutuhan desain, pisahkan `Approved`, `Selected/Temporary`, dan `Proposal/Needs Validation`. Sebutkan perbedaan dengan keputusan existing jika ada.

## STEP 2 — Current Project Assessment

Periksa repository dan konteks project yang memang tersedia. Identifikasi fitur ada, parsial, belum ada, serta risiko. Jika akses repository belum tersedia, sebutkan apa yang belum bisa diverifikasi — jangan mengarang progres.

## STEP 3 — Design-to-Implementation Mapping

Peta UI ke fungsi aktual:

- Office 2.5D → renderer/scene/camera.
- Agent Inspector → agent state, tasks, events, chat.
- Live Sidebar → project/milestone/department summaries.
- PM Command Center → orchestration/change requests.
- Task Board → task state/acceptance criteria/worktree/integration.
- Approval → permissions, risk, audit.
- Shared Brain → knowledge scopes/provenance/history.
- Usage Monitor → engine sources/windows/status.
- Mobile → secure remote gateway.

Tekankan pemisahan tampilan visual dan sumber kebenaran operasional.

## STEP 4 — Architecture Compatibility Review

Audit Hermes3D candidate, selective fork, event synchronization, rendering/performance, OS support, security, PM orchestration, Git worktree, serta integrasi engine; bahas trade-off sebenarnya.

## STEP 5 — Prioritized Roadmap

Susun milestone dengan scope, dependensi, risiko, success criteria, serta fitur yang ditunda. Hindari pembangunan monolitik sekaligus.

## STEP 6 — First Vertical Slice Recommendation

Kandidat awal: **Main Office UI Shell + Live Monitor Sidebar + Agent Inspector yang dihubungkan ke event/state nyata**. Sesuaikan urutan jika fondasi teknis belum siap.

## STEP 7 — Approval Before Major Changes

Sebelum refactor besar, migrasi, operasi destruktif, atau perubahan arsitektur penting: jelaskan komponen terdampak, alasan, dampak, risiko, cara verifikasi, rollback/checkpoint, dan minta persetujuan yang sesuai.

---

# BAGIAN 23 — CARA CHAT UTAMA HARUS BERKOLABORASI

Bertindak sebagai **technical architect, product engineer, dan UX implementation partner** yang kritis dan profesional.

Jangan sekadar mengiyakan seluruh ide. Jika sesuatu terlalu berat, mahal, berisiko, tidak didukung API resmi, menghambat performa, tidak aman, atau bentrok arsitektur, jelaskan dan tawarkan alternatif yang mempertahankan nilai UX.

Untuk setiap fitur, nilai apakah:

- Wajib pada produk inti.
- Bisa dimulai dari versi sederhana.
- Layak menjadi fitur lanjutan.
- Butuh validasi desain/riset teknis.
- Butuh perubahan arsitektur.

Utamakan keandalan, integritas data, keamanan, kualitas UX, dan kemampuan tumbuh menjadi produk.

---

# FINAL OBJECTIVE

Bangun arah AI Office menjadi **virtual AI workspace yang hidup, profesional, modern, nyaman, dan benar-benar berguna**.

Kantor 2.5D bukan dekorasi. Setiap karakter merepresentasikan agent nyata; animasi mempresentasikan aktivitas terverifikasi; progres dan hasil dapat ditelusuri; PM mengoordinasikan tugas dan revisi; beberapa proyek hidup dalam satu kantor; keputusan penting aman; usage dipantau jujur; dan konfigurasi fleksibel untuk berbagai perangkat serta calon pengguna produk.

**PERMINTAAN LANGSUNG KEPADA CHAT UTAMA:**

> Sinkronkan Master Design & UI/UX Handoff ini dengan keadaan proyek AI Office yang sudah ada. **Mulai dengan context synchronization, gap analysis, compatibility review, dan rekomendasi langkah pembangunan berikutnya.** Jangan langsung mengerjakan refactor atau development besar sebelum scope dan risiko dinilai.

---

## Catatan penggunaan dokumen

- Gunakan file `.md` ini sebagai dokumen handoff desain ke chat utama.
- Lampirkan juga **gambar referensi Clean Modern 2.5D Hybrid yang telah disetujui**, jika tersedia.
- Jika sebuah fitur masih berstatus proposal/preferensi sementara, validasi sebelum mengunci keputusan implementasi.
- Perubahan desain selanjutnya dapat dicatat sebagai versi V1.1/V2 disertai changelog, bukan diam-diam menimpa keputusan terdahulu.
