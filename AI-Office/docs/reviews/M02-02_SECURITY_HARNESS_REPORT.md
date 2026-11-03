# M02-02 — Runtime Security Harness Report

Tanggal: 29 Oktober 2026. Scope: synthetic host harness, tanpa AI runtime.

## 1. Executive summary

Implementasi host selesai dan seluruh 49 tes baru lulus. Baseline akhir: 300 PASS, 1 SKIPPED; browser E2E: 2 PASS. Immutable context, explicit simulated approval, scoped policy, fixed dummy-process supervision, cancellation, duplicate prevention, dan fixture journal memiliki bukti lokal.

**Acceptance: CONDITIONAL — READY FOR OWNER REVIEW.** Dua screenshot lama ditulis ulang oleh E2E wajib, di luar direktori source/report baru. Snapshot awal tidak menyimpan PNG tersebut sehingga byte asli tidak dapat dipulihkan dari snapshot. Dua fixture percobaan restart yang gagal dipertahankan setelah automatic approval review menolak penghapusan rekursif. Tidak ada proses probe/aplikasi uji tersisa. Keduanya bukan kegagalan assertion keamanan akhir, tetapi penyimpangan inventaris/cleanup ini tidak disembunyikan atau dianggap sudah disetujui Owner.

**REAL CODEX WORKER: BLOCKED. OS CONTAINMENT NOT VERIFIED / INSUFFICIENT FOR UNTRUSTED WORKER.** Probe Node dengan user Windows yang sama terbukti dapat membaca canary palsu langsung, meski host policy menolak request ke lokasi itu. Tidak ada OS sandbox independen pada harness ini.

## 2. Environment dan starting baseline

Workspace: `D:\Rajendra\AI-Projects\AI-Office`; PowerShell; Windows 11 build 26300.9711. Node `v24.21.0`, npm `11.19.0`, TypeScript `7.0.2`, Zod `4.6.7`, Vitest `5.0.5`, tsx `4.23.15`, Playwright `1.64.1`. Existing Chrome `156.0.8078.48` digunakan tanpa download. Installed Codex package metadata `0.162.1`, sama dengan audit M02-01; binary tidak dijalankan.

Preflight membaca baseline, roadmap, alignment, bounded plan, M01-07 acceptance/gates, kedua laporan M02-01, contracts, workspace identity/registry/paths/manager, state service/Shared Brain, host policy/HTTP, demo, test helpers/restart tests, package dan konfigurasi. DEC-001–DEC-006 tidak diubah. M01 foreground binding bukan permanent worker lease; authoritative state saat ini tetap DEMO-only. Tidak ditemukan AGENTS.md yang berlaku. Tidak ada Git AI-Office dan tidak dilakukan Git init.

Preflight typecheck PASS. `npm test` pertama, sebelum edit, menghasilkan **297 PASS, 3 FAIL karena timeout 5000 ms, 1 SKIPPED** (21.04 s):

- `tests/integration/state/http.test.ts:43`: validated snapshots / path-SQL selectors, 5400 ms.
- `tests/integration/state/service.test.ts:16`: explicit first-time consent / no open-poll seed, 5754 ms.
- `tests/integration/state/service.test.ts:33`: colliding IDs A/B / stale-forged scopes, 5184 ms.

Focused service rerun: 8 PASS (3.29 s). Focused HTTP rerun: 8 PASS (1.73 s). Full baseline rerun: 300 PASS, 1 SKIPPED (8.83 s). Tidak ada security assertion yang diperlonggar; penyebab timeout tidak dibuktikan dan tidak diklaim diperbaiki. Existing ACL skip `tests/integration/workspace/paths.test.ts:97` tetap **NOT VERIFIED**.

## 3. Files dan change safety

Seluruh source/test baru berada pada scope yang diizinkan:

| Path | Tujuan |
|---|---|
| `src/server/runtime-security/context.ts` | Fixture boundary, immutable backend-issued attempt capability |
| `src/server/runtime-security/policy.ts` | Strict scoped request/path evaluator, tanpa requested mutation |
| `src/server/runtime-security/approval.ts` | Explicit simulated decisions, fingerprint, expiry, one-shot consumption |
| `src/server/runtime-security/journal.ts` | Fixture-only atomic JSON journal, writer lock, reconciliation |
| `src/server/runtime-security/supervisor.ts` | Fixed Node probe ownership, bounded output/cancellation |
| `tests/integration/runtime-security/policy.test.ts` | 16 context/path negative tests |
| `tests/integration/runtime-security/approval.test.ts` | 12 approval/dispatch tests |
| `tests/integration/runtime-security/process.test.ts` | 12 process/cancellation/canary tests |
| `tests/integration/runtime-security/journal.test.ts` | 8 persistence/dedup/fault tests |
| `tests/integration/runtime-security/restart.test.ts` | 1 real separate-process controlled restart test |
| `tests/integration/runtime-security/fixtures/helpers.ts` | Disposable A/B/private/canary roots and backend binding |
| `tests/integration/runtime-security/probes/dummy.mjs` | Fixed non-AI process and cooperative descendant probes |
| `tests/integration/runtime-security/probes/journal-owner.ts` | Fixed journal owner/recovery OS-process helper |
| `docs/reviews/M02-02_SECURITY_HARNESS_REPORT.md` | Hasil, temuan dan batas evidence |
| `docs/reviews/M02-02_RUNTIME_GATE_MATRIX.md` | S01–S15 dan 16 prerequisite gates |

Protected inventory awal: 83 file AI-Office di luar node_modules. Akhir: **81/83 identik**, dua generated PNG berbeda, tidak ada file awal hilang. Total akhir di luar node_modules: 98 (83 awal + 15 baru). Source, contracts, package/lock, config, database schema, HTTP, frontend, old test source dan semua dokumen lama identik.

Penyimpangan generated E2E artifacts:

- `tests/e2e/artifacts/screenshots/shell-mobile.png`: SHA-256 awal `1F83546F81C9322BEA4802D4E7D1DEC06150A79F7AABB709CA96B5C6B4EA8E46`; akhir `C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640`.
- `tests/e2e/artifacts/screenshots/shell-ready.png`: SHA-256 awal `BD7A5E5CB0CB7CBE1D8D876476D14CB7D05D6D74600E255085224A0F9D53C722`; akhir `B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2`.

Tidak mengklaim semua file awal identik atau perubahan PNG termasuk allowed new-source scope. Kedua PNG merupakan side effect existing E2E yang diwajibkan. Tidak ada salinan PNG asli dalam rollback snapshot; tidak mencoba merekonstruksi byte atau mengubah hash baseline.

Rollback snapshot dipertahankan: `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-rollback-2cc814d239934884bd86ad19b78ff7a4`. Berisi salinan package/lock/dua tsconfig dan scope manifest; `original-file-sha256.json` menyimpan pre-edit hash inventory (bukan original bytes). Tidak berisi credentials atau entire project. File konfigurasi tersebut tetap identik sehingga tidak memerlukan restore. Source baru dapat direview terpisah; tidak ada rollback/deletion otomatis lanjutan.

Hermes3D: **647/647 tracked-file hashes identik**, HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`; existing ` M package-lock.json` tetap pre-existing. Tidak ada write ke Hermes3D atau Visual Lab. Visual Lab tidak diaudit checksum; tidak mengklaim sebaliknya.

## 4. Immutable execution context

`SyntheticContextAuthority` hanya menerima fixture temp immediate-child `ai-office-m0202-*` dengan layout yang ditentukan, bukan rollback directory. Issuance memerlukan `WorkspaceManager.inspect` atas genuine M01 scope dan registry association. Canonical project root/file identity berasal dari registry, bukan caller-supplied root/UUID.

Frozen descriptor mengikat projectId, workspaceBindingId (bukti saat issuance), taskId, attemptId, attemptGeneration, policyRef, canonical root/file key, read/write scopes, operations, createdAt/expiresAt, dan literal `synthetic-security-test`. Capability memakai exact issued object/WeakMap, bukan JSON descriptor saja. Duplicate attempt ID tetap ditolak setelah revoke. Expiry/revoke/changed project association gagal tertutup.

Foreground switch A ke B tidak memindahkan ownership A. Ini distinct synthetic attempt capability, **bukan persisted worker lease** atau perpanjangan diam-diam foreground binding. Descriptor di jurnal merupakan evidence, bukan capability yang bisa direhidrasi untuk dispatch. Bukti: `policy.test.ts` dan `journal.test.ts`.

## 5. Host path policy

Strict Zod request mengikat project/task/attempt/generation/binding, operation dan target. WRITE/CREATE memerlukan content digest; PROBE memerlukan fixed mode. Extra executable/command fields ditolak. Reuse M01 `ProjectRelativePathSchema`, `validateLocalPath`, `checkedDescendant`, containment dan identity helpers; tidak ada competing canonicalization service.

Evaluator memeriksa approved read/write directories, target type, actual descendants, existing CREATE parent dan absent target. Ia **tidak melakukan requested read/write/create/delete**; tes hanya melakukan controlled fixture IO. DELETE bisa dimodelkan tetapi tidak diizinkan oleh fixture policy. `.ai-office` authority metadata selalu dikecualikan.

Bukti penolakan: A→B, B→A, app-private, dummy credentials, absolute outside root, traversal, drive-relative, UNC/device, alternate stream, backslash alias, prefix collision, unapproved write/delete, task/generation substitution, missing/forged binding, actual junction escape dan hard link. Approved operation lulus tanpa memutasi target. Junction replacement sesudah approval juga ditolak sebelum spawn (`approval.test.ts`).

**Race limit:** path checks dan spawn/open tidak merupakan satu atomic kernel operation. Reparse/file replacement setelah last check, executable replacement setelah hashing, malicious same-user tampering, dan direct IO tetap mungkin tanpa OS boundary. Tidak ada stronger confinement claim.

## 6. Approval semantics

Default deny: unknown, pending, missing, expired, revoked atau consumed grant tidak bisa mengeksekusi probe. Request memiliki unique ID, scope identity, exact normalized operation/context SHA-256 fingerprint dan deadline yang dibatasi context expiry. Trusted controller adalah object-identity capability khusus tes, berlabel `synthetic-trusted-controller`; tidak ada human decision otomatis atau UI/API baru.

Explicit matching ALLOW dikonsumsi satu kali sebelum durable LAUNCHING; spawn failure tidak mengembalikan grant. DENY terminal, changed parameters membatalkan grant, replay dan field substitution ditolak. Tes juga membuktikan expiry **sesudah** ALLOW dan sebelum dispatch. B tidak dapat memakai approval A. Controller ini bukan boundary terhadap malicious code di process host yang sama; tidak ada Codex approval bridge/protocol proof.

## 7. Dummy supervisor dan cancellation

Hanya fixed test-owned `dummy.mjs` yang dapat difork memakai current `process.execPath`, `execArgv: []`, `windowsHide: true`, explicit cwd, `silent: true`, tanpa shell. Real regular single-link probe diverifikasi dan SHA dipin/rechecked. Caller tidak menentukan binary, args, shell command, `.cmd`/`.bat`/PowerShell atau downloaded executable.

Environment hanya SystemRoot, WINDIR, fixture TEMP/TMP dan synthetic marker; tidak mewarisi host provider/API keys, NODE_OPTIONS atau arbitrary environment. Stdout/stderr masing-masing maksimal 4096 bytes, sisanya tetap didrain. IPC memakai nonce/PID/schema dan message log terbatas. Actual PID/nonce/start time dicatat, durable LAUNCHING disimpan sebelum spawn. Normal completion membutuhkan trusted probe completion observation dan exit code 0; ini hanya completion probe, bukan task acceptance.

Tes mencakup cancellation sebelum start, approval pending, controlled startup gate, aktif, duplikat, sesudah normal completion, failure dan exit race. Graceful IPC diikuti escalation setelah 250 ms; startup deadline 2500 ms; cleanup confirmation timeout 5000 ms. Termination hanya exact still-owned `ChildProcess`, tidak dari generic name, arbitrary PID atau journal. Previous fixed-file side effects tetap ada; no further writes setelah shutdown diamati. Tidak mengklaim rollback.

Actual missing-cwd spawn error diuji dengan memindahkan direktori fixture melalui trusted fault injection, bukan sekadar mock. Controlled startup cancellation tidak menghasilkan PID. Error journaling setelah spawn meminta stop terhadap owned process sebelum propagasi error; corrupt journal tidak dipaksa menjadi success.

## 8. Windows descendant limits

Tes root→child→grandchild memakai fixed trusted script. Graceful tree cancellation dan forced root termination dengan cooperative descendants sama-sama mengobservasi dua descendants tidak lagi hidup; IPC-disconnect handler membantu descendants keluar. Liveness hanya menganggap ESRCH sebagai absence; error lain tidak dianggap proof stop. Tidak ada generic tree kill atau termination unrelated PID.

Ini **PROCESS_LIFECYCLE_VERIFIED untuk fixture**, bukan Windows Job Object atau untrusted tree containment. Tidak menguji detached/hostile/reparented child, PID reuse resistance sebagai kernel guarantee, host hard crash, machine reboot, all handle leaks, network deny atau sandbox escape. Apabila descendants tidak terkonfirmasi berhenti, hasil menjadi UNCERTAIN/RECONCILIATION_REQUIRED. Actual crash/orphan cleanup tetap NOT VERIFIED. Native dependency, ACL, elevation, services, Defender dan firewall tidak diubah.

## 9. Fixture journal dan restart

Small JSON journal bukan production DB/authoritative Project State. Strict schema mencatat stable descriptor, unique attempt/idempotency key, aggregate/per-attempt monotonic versions, ordered transitions, last observed process dan outcome. Exclusive `wx` writer lock memegang random token. Saves menggunakan unique `wx` temporary file, file sync dan same-directory rename, tanpa unlink-destination fallback. Batas: 64 records, 128 history events/record, 2 MiB. Live checksum, root/lock identity, initialization seal dan temporary evidence diperiksa; external change/missing seal/partial store gagal tertutup tanpa overwrite/reset.

Phases: CREATED, APPROVAL_PENDING, APPROVAL_GRANTED/DENIED, LAUNCHING, RUNNING, CANCELLATION_REQUESTED, COMPLETED, FAILED, INTERRUPTED, UNCERTAIN, RECONCILIATION_REQUIRED. Reopen in-flight attempt menambahkan UNCERTAIN lalu RECONCILIATION_REQUIRED; prelaunch unresolved juga memerlukan reconciliation. Tidak restart, tidak menebak completion dari missing PID, tidak memulihkan capability dari disk. Reconcile explicit hanya FAILED/INTERRUPTED, bukan fabricated COMPLETED.

`restart.test.ts` memakai **dua OS processes berbeda** melalui fixed tsx helper yang sudah terpasang. Pertama membuat jurnal, menjalankan probe dan merekam actual RUNNING/PID; controlled interruption menghentikan probe dan melepas lock sambil sengaja menghilangkan terminal journal commit. Proses kedua melihat unresolved evidence, lalu controller secara eksplisit reconcile FAILED. History tetap satu LAUNCHING/satu RUNNING; duplicate identity ditolak. `journal.test.ts` juga membuktikan new harness menolak register/dispatch unresolved identity.

**Batas durability:** controlled interruption bukan abrupt host kill/power loss. File sync/rename tidak membuktikan directory metadata flush atau power-failure durability Windows. Stale writer lock tidak dihapus otomatis dan memerlukan manual review. Jika store dan seal sama-sama dihapus oleh same-user attacker, fixture ini bukan tamper-proof ledger. Tidak ada multi-host coordination, permanent lease, exactly-once side effects, production migration atau automatic retry.

## 10. A/B dan fake credential evidence

Setiap tes membuat temp root random berisi project-a, project-b, app-private, dummy-credentials, journals; actual M01 marker/registry dipakai hanya dalam fixture. Sentinels menunjukkan B/private/canary tidak berubah. Fixed probe direct-canary mode berhasil membaca **fake** canary dan hanya mengirim boolean serta environment key names; nilai canary tidak masuk result stdout/stderr/messages. Tidak membaca real credential caches/keyring/browser cookies.

Host request canary ditolak; direct same-user process read berhasil. Maka **S15 PASS berarti pembedaan host/OS benar**, bukan denied OS read PASS. Credential isolation dan OS-enforced denied reads/writes tetap BLOCKED untuk worker.

## 11. Actual validation

| Tahap/perintah | Hasil akhir | Evidence / limit |
|---|---|---|
| `npm run typecheck` | PASS, exit 0 | Kedua tsconfig, termasuk source/test baru; 1.75 s pada final run |
| `npm test` | 300 PASS, 1 SKIPPED, 22 files, exit 0 | 14:13:10, 8.43 s; ACL skip tetap |
| `npx --no-install vitest run tests/integration/runtime-security` | 49 PASS, 5 files, exit 0 | 14:12:55, 8.22 s; 16 policy + 12 approval + 12 process + 8 journal + 1 restart |
| `npm run test:e2e` | 2 PASS, exit 0 | 25.8 s; existing Chrome, no install; screenshot side effect dicatat |
| Process/listener inspection | PASS untuk owned process teardown | Tidak ada runtime-security probe/server/dev test process atau listener 43123/43124 tersisa |
| Protected inventory | CONDITIONAL | 81/83 original files identik; 2 regenerated PNG berbeda; 647/647 Hermes identik |

`npm test` memakai explicit existing directory list; **tidak otomatis memasukkan suite runtime-security**. Focused command di atas wajib untuk menjalankan 49 tes baru, karena package script tidak diubah. Total unit/integration yang dijalankan di dua command akhir: 349 PASS, 1 SKIPPED; E2E terpisah 2 PASS.

Development failures tidak dihapus dari catatan: first policy+approval run 25 PASS/1 FAIL karena probe membandingkan fixture parent dengan tmpdir di child yang TEMP-nya fixture; fixed probe memvalidasi canonical fixed cwd, sedangkan host tetap memvalidasi actual temp parent. First all-new run 46 PASS/1 FAIL dan focused restart rerun FAIL karena journal-owner TEMP juga menunjuk fixture, bertentangan dengan strict journal boundary. Owner helper kini menerima actual temp parent, menonaktifkan tsx cache, dan restart focused PASS sebelum final 49 PASS. Tidak melonggarkan timeout/assertion/config lama.

## 12. Cleanup dan retained evidence

Successful final fixtures terhapus oleh owned teardown yang memeriksa resolved absolute root sebelum recursive removal. Kedua failed restart fixtures di bawah tidak lagi memiliki proses hidup dan dipertahankan sebagai evidence:

- `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-QHnCi9`
- `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-TLkI1Y`

Automatic approval review menolak attempted PowerShell recursive removal kedua exact fixture targets, meski target-parent/layout checks disertakan; alasan tool: **“blocked by policy”**. Tidak mencoba bypass atau meminta elevation. Tidak mengklaim temp cleanup total. Snapshot rollback juga dipertahankan sengaja. Tidak ada credentials asli pada ketiganya. Dua existing Playwright MCP Node processes ditemukan dan diidentifikasi sebagai tool infrastructure; tidak dihentikan.

## 13. Findings dan blockers

| ID / severity | Temuan | Dampak / tindakan berikutnya |
|---|---|---|
| F01 — HIGH, worker blocker | Same-user direct fake-canary read berhasil; host allowlist bukan OS sandbox | Independently authorized OS/profile boundary denial tests harus lulus sebelum worker; jangan uji real token |
| F02 — HIGH, worker blocker | Cooperative tree teardown tidak menjamin hostile/detached tree atau hard-crash cleanup | Later owned Windows containment/lifetime proof; no broad PID/name kill |
| F03 — MEDIUM, production blocker | Fixture journal bukan power-loss-safe authoritative task service/lease; stale locks fail closed | Separate reviewed contracts/schema/migrations dan failure tests |
| F04 — MEDIUM, validation uncertainty | Tiga pre-edit baseline timeouts; focused/full/final reruns lulus | Root cause belum dibuktikan; tidak mengklaim repeatability defect selesai |
| F05 — LOW, acceptance condition | Required E2E memperbarui dua original PNG; rollback tidak mencakup PNG | Owner review generated-artifact scope variance; original source tetap terlindungi |
| F06 — LOW, cleanup condition | Dua failed synthetic fixture dirs dipertahankan setelah deletion auto-review rejection | Review retained test-only evidence; tidak ada orphan process |

Actual app-server protocol, sandbox config/effective restrictions, auth/account/model entitlement, included-only hard cap, approval events, actual turn cancellation/crash recovery, skills/MCP enforcement dan real audit mapping tetap **NOT VERIFIED/BLOCKED**. Quota/entitlement UNKNOWN. Paid API/key fallback, purchased credits, top-up dan provider auth/inference tidak diaktifkan.

## 14. Future adapter boundary — design only

Mengikuti rekomendasi lokal M02-01, future adapter dapat memakai owned stdio app-server setelah separate approval. Tidak dibuat atau dijalankan di sini. Satu process epoch/lifetime perlu discope ke immutable durable worker lease/project; browser tidak boleh mendapat raw stdio/RPC/auth. Backend harus memetakan actual thread/turn/item/request IDs, ordering, errors dan terminal observations ke authoritative state service, bukan menyalin dummy completion menjadi real task acceptance.

Approval bridge harus memvalidasi actual request/epoch/operation fingerprint, policy dan explicit matching decision; unknown request gagal tertutup. Cancellation harus mengikat actual runtime turn dan membuktikan terminal outcome serta descendant/write cessation; transport close/ack sendiri tidak cukup. Durable dispatch intent dan reconnect reconciliation harus mencegah blind resend; jangan membunuh journal PID tanpa ownership proof.

Environment allowlist ini langkah host saja. Actual credential/profile isolation, sandbox implementation/config/denied read-write/network tests dan account boundaries harus diverifikasi tanpa membuka token asli. Runtime tidak boleh mengakses private DB langsung. Skills/plugins/MCP tetap OFF sebelum enforcement proof; tidak ada API-key/paid-credit fallback. Native billing hard cap tidak boleh dianggap terbukti dari control route lain. Tidak ada handshake atau runtime integration evidence yang diperoleh M02-02.

## 15. Scope dan Owner review

Tidak ada actual Codex invocation, SDK, login/logout/OAuth, session/turn/inference, credential access, paid API, downloaded dependency/browser, skill execution, ACL/admin/firewall/Defender/service/network-security mutation, real task table, production endpoint/adapter/orchestrator atau valuable-project write. Existing DEMO state dan architectural baseline tidak diubah. Harness tidak diimport application entry points.

Host assertions akhir semua PASS. Acceptance tetap **CONDITIONAL** karena original screenshot variance dan retained failed-test fixtures. Owner perlu meninjau dua laporan, generated-artifact exception serta retained evidence. Real worker memerlukan keputusan terpisah setelah seluruh 16 gates pada matrix terpenuhi; review harness tidak memberi izin worker. Tidak meminta izin untuk tindakan runtime pada tahap ini.

**M02-02 HOST HARNESS IMPLEMENTED AND TESTED — ACCEPTANCE CONDITIONAL — REAL CODEX WORKER BLOCKED — AWAITING OWNER REVIEW.**

STOP AFTER M02-02. M02-03 tidak dimulai.
