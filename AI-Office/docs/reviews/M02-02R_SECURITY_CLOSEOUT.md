# M02-02R — Security Harness Closeout

Tanggal audit: 29 Oktober 2026, Asia/Jakarta. Mode: audit source dan existing tests; hanya dua laporan baru diizinkan. Companion: [OS Containment Test Plan](M02-02R_OS_CONTAINMENT_TEST_PLAN.md).

## 1. Executive decision

**CONDITIONAL — CLOSEOUT REMEDIATION REQUIRED.** Seluruh existing tests yang dijalankan lulus, dua screenshot dapat diterima sebagai current artifacts, dan kedua retained fixtures terverifikasi sintetis serta dipertahankan. Namun review source menemukan **R01/P2: attempt-ID uniqueness saat concurrent context issuance tidak atomic**. Ini menyentuh invariant identity M02-02 dan belum dicakup oleh 49 tes. Tidak mengubah source atau menambahkan tes untuk menutupi gap tersebut.

Tidak ditemukan bukti arbitrary command execution atau cross-project authorization bypass melalui dispatch yang diuji. Journal tetap menahan duplicate registration/dispatch. R01 bukan bukti second worker berhasil berjalan dan bukan alasan memberi label critical host compromise. Temuan tetap memerlukan bounded correction sebelum unconditional host acceptance.

**OS CONTAINMENT INSUFFICIENT FOR AN UNTRUSTED SAME-USER WORKER UNDER THE TESTED CONFIGURATION.** OS, actual Codex runtime dan account/billing gates tetap NOT VERIFIED/BLOCKED. Tidak ada sandbox experiment, Codex binary invocation, adapter, login, inference atau worker baru pada audit ini.

## 2. Current baseline dan change control

Root nyata: `D:\Rajendra\AI-Projects\AI-Office`, ordinary directory tanpa root reparse redirection atau `.git`. Node `v24.21.0`, npm `11.19.0`. Existing package toolchain: TypeScript `7.0.2`, Zod `4.6.7`, Vitest `5.0.5`, tsx `4.23.15`, Playwright `1.64.1`. Tidak reinstall atau mengubah package.

Read-only OS metadata: `Microsoft Windows 11 Home Single Language`, x64, version `10.0.26300`, registry DisplayVersion `26H2`, build `26300.9711`, EditionID `CoreSingleLanguage`. Registry ProductName masih menyebut Windows 10; CIM Caption/build dicatat agar tidak salah menyimpulkan edisi Pro. RAM terlapor 7,866,445,824 bytes (~7.33 GiB). `HypervisorPresent=true`, `VirtualizationFirmwareEnabled=true`; VM-monitor/SLAT CIM flags false pada kondisi hypervisor aktif tidak diperlakukan sebagai sertifikasi hardware incompatibility. Optional feature state, MXC capability dan admin rights tidak diuji.

Sebelum test pertama: inventaris dan SHA-256 **98 existing AI-Office files** di luar node_modules, termasuk source/config/tests/reports/screenshots, diambil. Inventaris sama dengan akhir M02-02 dalam sesi ini: tidak ada discrepancy tambahan pada awal M02-02R. Pre-existing M02-02 screenshot replacement tetap historical fact, bukan perubahan baru audit ini. **647 tracked Hermes3D hashes** diambil terpisah. Tidak ada destructive reset, Git init atau cleanup tambahan.

Required source documents dibaca: `docs/AI_OFFICE_CURRENT_BASELINE.md`, `docs/roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md`, `docs/decisions/M00B_ALIGNMENT_REPORT.md`, `docs/reviews/M01-07_FOUNDATION_ACCEPTANCE_REPORT.md`, `M01-07_M02_GATE_MATRIX.md`, `M02-01_CODEX_RUNTIME_FEASIBILITY.md`, `M02-01_NEXT_POC_GATE_PLAN.md`, `M02-02_SECURITY_HARNESS_REPORT.md`, `M02-02_RUNTIME_GATE_MATRIX.md`. DEC-001–DEC-006, standalone architecture, authoritative Project State dan subscription-first constraints dipertahankan; historical report PASS tidak dianggap execution baru.

## 3. Source audit evidence

Line references berlaku pada source yang di-hash untuk audit ini. Related M01 helpers, `workspace/paths.ts`, registry/manager, state/database, HTTP close path, process tests, seluruh runtime-security tests/probes, package/tsconfigs, `vite.config.ts`, serta `tests/e2e/shell.spec.ts`, `helpers.ts`, `playwright.config.ts` diperiksa.

| Module / source evidence | Kesimpulan | Batas / finding |
|---|---|---|
| `src/server/runtime-security/context.ts:58`–`:99` | Issuance memerlukan actual manager scope, registry identity dan canonical fixture project root; frozen descriptor/arrays, exact object capability, expiry dan revoke; foreground B tidak otomatis mengubah A | Distinct synthetic capability, bukan durable lease. Sequential duplicate guard ada; concurrent uniqueness bermasalah, R01 |
| `src/server/runtime-security/policy.ts:21`–`:54` | Strict project/task/attempt/generation/binding request; operation scopes; read/write separation; payload/mode fingerprint; M01 canonical descendant/link validation; authority metadata excluded | Evaluator tidak memediasi direct process IO. Reparse/file replacement antara check dan IO/spawn tetap TOCTOU. PROBE bukan arbitrary file command |
| `src/server/runtime-security/approval.ts:17`–`:58` | Exact synthetic controller identity; pending/unknown/default denial; exact fingerprint/scope/deadline; explicit ALLOW consumed sekali, DENY/replay/substitution fail closed | Controller sengaja tersedia bagi trusted test host, bukan authorization terhadap malicious code dalam process host; tidak ada human UI/Codex protocol bridge |
| `src/server/runtime-security/journal.ts:26`–`:165` | Strict phase graph, unique attempt/key, version/history validation, writer ownership/checksum/seal, fsync temp + rename; unresolved reopen memerlukan reconciliation tanpa retry | Fixture-only JSON, bukan production Project State journal. Stale lock fail closed; power loss, hostile store deletion/multiwriter dan production generation lifecycle belum terbukti |
| `src/server/runtime-security/supervisor.ts:47`–`:153`, `:163`–`:223` | Fixed checked/hashed probe, current Node executable, no shell/client command, env allowlist, bounded buffers, scoped serialized dispatch/journal, owned ChildProcess cancellation/escalation | Tidak ada kernel job ownership. IPC descendant list berasal dari trusted probe. Bound berlaku pada tested stop/wait paths, bukan jaminan semua disk/hung injected-hook paths selalu bounded |

### R01 — concurrent issuance uniqueness

`context.ts:66` memeriksa `!this.issued.has(attemptId)`, kemudian `await manager.inspect` pada `:67` dan beberapa filesystem awaits. `issued.set` baru terjadi pada `:87`. Tidak ada reservation atau issuer queue di antara keduanya. `assert` memeriksa map pada `:94` sebelum awaits berikutnya dan tidak mengulangi uniqueness check saat selesai.

Source interleaving yang dimungkinkan:

1. Caller X dan Y memakai genuine scope A serta attempt ID sama, task berbeda.
2. Keduanya melewati `has` sebelum salah satunya memasukkan map.
3. X memasukkan context X dan mulai assert; Y kemudian memasukkan context Y dan mulai assert.
4. Kedua issuance dapat selesai; map terakhir menggantikan association pertama. Context lama dapat terinvalidasi secara tak terduga.

Ini **source-confirmed check/await/set race**, bukan timeout hypothesis. Tidak dijalankan sebagai custom reproduction dalam audit existing-tests-only ini. `policy.test.ts` test **“requires genuine backend binding and rejects wrong identity”** hanya melakukan issuance/reuse dengan `await` berurutan. Concurrent `dispatch` test tidak mencakup concurrent `authority.issue`.

Mitigasi saat ini: `supervisor.ts:59`–`:63` mendaftarkan context lewat serialized journal create; `journal.ts:138` menolak repeated attempt/idempotency key; request/dispatch mengecek exact registered capability. Karena itu **tidak ada claim duplicate execution atau A→B authorization berhasil**. Namun uniqueness issuance yang dijanjikan belum utuh, sehingga final host acceptance tetap CONDITIONAL.

## 4. Discovery dan 49-test coverage

**INTENTIONAL SEPARATION — DOCUMENTED.** `package.json` secara eksplisit mendefinisikan:

```text
vitest run tests/contracts tests/integration/workspace tests/integration/state tests/web
```

Direktori `tests/integration/runtime-security` tidak cocok dengan empat positional path filters tersebut. Existing `vite.config.ts` tidak memiliki test include/exclude override dan tidak ditemukan separate Vitest config. Installed Vitest defaults (`node_modules/vitest/dist/chunks/defaults.B1FCaFfh.js:5`) memakai `**/*.{test,spec}.?(c|m)[jt]s?(x)`; exclude mencakup node_modules dan .git. Lima `*.test.ts` keamanan cocok dengan naming discovery; bukan naming defect atau exclude baru. `M02-02_SECURITY_HARNESS_REPORT.md` section 11 secara eksplisit menyatakan focused command wajib karena package script dilarang diubah pada milestone itu.

| Suite | Files / cases | Cara masuk workflow |
|---|---|---|
| Original M01 | 22 files; 300 PASS + 1 ACL SKIPPED | `npm test` |
| M02-02 | `policy.test.ts` 16; `approval.test.ts` 12; `process.test.ts` 12; `journal.test.ts` 8; `restart.test.ts` 1 | Focused runtime-security command, total 49 |
| Browser | 2 Playwright cases | Separate E2E command; tidak dijalankan audit ini |

49 tes bukan tambahan yang diam-diam masuk 300. Typecheck mencakup server dan `tests/integration/**/*.ts`; compile inclusion bukan test execution. Tidak ditemukan CI/aggregate script yang otomatis mewajibkan focused suite. Future regression yang hanya menjalankan `npm test` **tidak** menjalankan 49 tes tersebut. Separation sah untuk bounded milestone, tetapi invocation kedua wajib pada security acceptance; tidak menyebut exclusion sebagai accidental bug.

Runtime-security fixtures memakai Windows-local path validation, actual junction/hard links, child processes dan Windows lifecycle observations; portability non-Windows tidak dibuktikan. Probe dan journal-owner berlabel fixed synthetic/non-AI. Setiap test membuat root baru, sehingga existing retained roots tidak dipakai ulang. Cleanup successful fixtures berada dalam helper dengan resolved containment check; failure sebelum teardown bisa meninggalkan evidence, sebagaimana dua retained roots historis.

Exact future verification sequence dari root aplikasi:

```powershell
npm run typecheck
npm test
npx --no-install vitest run tests/integration/runtime-security
```

Browser stage: `npm run test:e2e` **hanya** setelah artifact regeneration disetujui secara terpisah atau supported isolation untuk explicit screenshot/build paths tersedia. Saat syarat itu tidak terpenuhi: NOT RUN, static review seperti audit ini. `--output` Playwright saja tidak mengalihkan explicit `page.screenshot({path: ...})` di source.

Minimal future workflow convenience yang dapat direview terpisah: satu script `test:security` berisi focused command yang sama dan acceptance/CI harus memanggilnya sesudah `npm test`. Tidak perlu mengubah default M01 scope secara diam-diam. Tidak ada package/config edit dalam M02-02R. R01 concurrency regression membutuhkan separate source/test change, bukan script convenience ini.

## 5. Screenshot findings

Kedua file dibuka langsung, tanpa regenerate. PNG signature, semua chunk CRC, IDAT inflate length dan IEND valid; 8-bit RGB/noninterlaced, hanya IHDR/IDAT/IEND, tanpa textual metadata chunks.

| Exact path | Ukuran / bytes | SHA-256 kini = recorded M02-02 | Classification |
|---|---|---|---|
| `tests/e2e/artifacts/screenshots/shell-ready.png` | 1280×1729; 122,055 | `B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2` | **ACCEPT AS CURRENT TEST ARTIFACT** |
| `tests/e2e/artifacts/screenshots/shell-mobile.png` | 390×2856; 114,323 | `C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640` | **ACCEPT AS CURRENT TEST ARTIFACT** |

Desktop menampilkan two-column diagnostic shell; mobile stacked layout masih terbaca tanpa obvious overlap/broken panels. Label FIXTURE/DEMO, A_ONLY, historical IDLE, UNKNOWN quota, workers/providers/paid/skill execution OFF sesuai expected shell. Tidak tampak token, password, bootstrap passphrase atau valuable project content. `Session: authenticated` adalah status, bukan credential. Username/local temp path dan synthetic project UUID tampak; dapat diterima untuk personal-local review artifact, bukan janji anonim untuk publikasi.

Original pre-regeneration bytes/visuals tidak tersedia. Tidak mengklaim before/after visual parity atau byte restoration. Historical replacement accounted for; tidak dianggap otomatis product defect. Source E2E `shell.spec.ts:122`–`:125` menulis dua PNG ke explicit repository paths; configuration output directory tidak mengubah itu. Karena tidak ada supported isolation override yang ditemukan, **E2E NOT RUN — SAFETY CONSTRAINT**; build yang menulis existing artifacts juga tidak dijalankan.

## 6. Retained fixture review dan policy compliance

Exact roots diambil dari M02-02 report, bukan pencarian arbitrary machine data. Canonical temp parent diverifikasi lewat realpath (environment TEMP memiliki short-name alias); initial string comparison berhenti karena alias, kemudian read-only canonical check membuktikan parent yang sama. Ancestor/root/entry traversal memeriksa ReparsePoint sebelum descent; regular content read juga memeriksa type/nlink/size. Tidak mengikuti link, membuka journal writer, melepas lock, atau menjalankan cached code.

| Exact retained directory | Inventory | Findings / classification |
|---|---|---|
| `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-QHnCi9` | 22 files, 58,997 bytes | **VERIFIED SYNTHETIC — RETAINED** |
| `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-TLkI1Y` | 22 files, 59,048 bytes | **VERIFIED SYNTHETIC — RETAINED** |

Keduanya memiliki expected A/B/read/work/private/canary/journals layout; A_ONLY/A_WORK/B_ONLY/private sentinel cocok dengan helper. Canary cocok dengan fake prefix + generated UUID; nilainya tidak dicetak. Registry hanya menunjuk project-a dalam root sendiri, marker UUID/timestamp sesuai registry. Masing-masing memiliki 13 JSON tsx caches dengan code/source maps yang menunjuk source AI-Office contracts/workspace/context/journal dan test-owned journal-owner. Ini source compilation cache, bukan user document atau provider cache. Journal directory kosong; retained fixtures bukan bukti terminal/running attempt recovery. Registry writer.lock berisi synthetic UUID; tidak dilepas hanya karena tidak ada process yang teramati.

Tidak ada reparse entry atau live Node probe/journal-owner/backend command line yang terkait fixture pada pemeriksaan. Ini bukan exhaustive proof seluruh system handles; tidak diperlukan mutation untuk mengklasifikasi retained test evidence. Safe to retain untuk review personal lokal; tetap synthetic source/metadata yang tidak perlu dipublikasikan. File count/size/hash/last-write inventory diambil sebelum reruns dan dibandingkan kembali di akhir; isi tidak berubah.

**Cleanup belum complete dan tidak diklaim complete.** Tidak ada deletion/rename/permission change terhadap dua roots ini. Historical automatic approval rejection **“blocked by policy”** diperlakukan sebagai boundary, bukan error yang dicoba melalui command lain. Tidak ada rejection baru karena cleanup tidak dicoba pada M02-02R.

Future bounded cleanup memerlukan separate Owner authorization **dan** izin effective tool policy: exact dua canonical roots saja; inventory/hash/layout/ownership ulang, reject reparse/alias mismatch dan active process/uncertain handles, review dry-run inventory, lalu hanya approved cleanup entry point. Jika policy menolak, berhenti dan pertahankan; jangan ganti shell/tool untuk bypass. Tidak menyertakan executable recursive-delete command di laporan ini. Existing rollback snapshot `...\ai-office-m0202-rollback-2cc814d239934884bd86ad19b78ff7a4` juga dipertahankan, bukan cleanup target audit.

## 7. Timeout investigation

Historical evidence tidak disatukan tanpa alasan:

- M01-06, sebagaimana direkam M01-07: parameter **missing** pada `tests/integration/state/failures.test.ts`, **“rejects %s DB after restart without reset”**, timeout 5000 ms saat beberapa validation commands pernah berjalan bersamaan. Dua full M01-07 runs dan focused 14 cases kemudian PASS. Original stage timing/stack trace tidak tersedia sebagai standalone raw artifact; report provenance dipertahankan.
- M02-02 preflight sebelum edit: `state/http.test.ts:43` **“returns validated snapshots without DB paths and denies client path/SQL selectors”** 5400 ms; `state/service.test.ts:16` **“requires explicit first-time consent and never seeds on open/poll”** 5754 ms; `:33` **“keeps colliding record IDs separate for A/B and rejects stale and forged scopes”** 5184 ms. First full result 297 PASS/3 timeout FAIL/1 SKIPPED, lalu focused/full reruns PASS.

Source review: masing-masing helper membuat fresh random temp root/registry/private DB, bukan shared DB antartest. `state/database.ts:17` memakai synchronous SQLite dengan 25 ms lock timeout dan closes in finally; explicit exclusive-lock test memeriksa DATABASE_BUSY, bukan hang 5 detik. Registry exclusive lock fails rather than endlessly retrying. Temporary IO/fsync, scheduling/worker load, HTTP socket close dan process teardown adalah potential contributors, tetapi tidak ada per-stage historical trace yang menetapkan penyebab. HTTP close menunggu `server.close`; socket timeout 5 detik tidak membuktikan itulah penyebab test timeout. Tidak ditemukan bukti cukup untuk menyatakan shared-database race atau menyamakan R01 dengan timeout historis.

Commands audit dijalankan berurutan, tanpa concurrent full suites. Focused historical files memakai `--no-file-parallelism` secara eksplisit; ordinary `npm test` tetap memakai konfigurasi biasa. Tidak mengubah timeout/retry/assertion atau melakukan stress loops.

**Conclusion: NOT REPRODUCED UNDER TESTED CONDITIONS.** Ketiga affected files 30 PASS; normal suite 300 PASS/1 SKIPPED; security suite 49 PASS. Akar penyebab belum dibuktikan atau diperbaiki. Jika kembali terjadi, rekomendasi terpisah: instrumentasi stage startup/registry/SQLite/HTTP close/cleanup dan resource observations, bukan menaikkan threshold terlebih dahulu.

## 8. Process lifecycle dan direct-access interpretation

Actual rerun mendukung fixed root ChildProcess/PID, normal exit + completion marker, bounded stdout/stderr 4096 bytes/channel, actual missing-cwd spawn failure, cancel prestart/pending/startup/active/duplicate/late/failure/exit race, graceful and forced-root cooperative-tree shutdown. Test **“cancels during startup before spawn using a controlled gate”** adalah pre-spawn fault gate; tidak mengklaim coverage semua post-spawn/pre-ready scheduling interleavings. Cancellation race test menerima defined observed terminal alternatives, bukan proof setiap possible race dijelajahi.

`dummy.mjs` membangun child/grandchild dari fixed self script; descendants di-report melalui IPC dan cooperation/disconnect handlers. Supervisor hanya mengirim termination pada exact owned ChildProcess; numeric descendant PIDs hanya dipakai untuk liveness observation. Tidak ada `taskkill /IM`, generic Node kill atau stale-journal PID kill. Native root handle, kernel assignment, process creation identity dan descendant inventory belum menjadi secure hostile-tree mechanism.

**HOSTILE PROCESS-TREE CLEANUP: NOT VERIFIED.** Forced root termination + cooperative descendants bukan hostile cleanup proof. Hard crash/reboot, detached/reparented/unreported children, inherited-handle leaks dan adversarial IPC tidak diuji. Journal reopen test memakai safe owner interruption yang sengaja menghilangkan terminal commit, kemudian explicit reconcile; bukan arbitrary crash cleanup. Missing PID tidak menjadi COMPLETED, dan earlier pulse bytes tidak diklaim rollback.

S15 rerun **“blocks canary requests through policy but demonstrates unrestricted same-user direct read”** menegaskan evaluator DENY, tetapi direct ordinary child `readFile` berhasil pada fake canary. Env-secret inheritance disaring; OS user privilege tidak otomatis disaring oleh env allowlist/cwd/fingerprint. Menjalankan dummy process tidak membuktikan Codex sandbox, worker/private SQLite isolation, entitlement atau billing.

## 9. Commands executed dan effects

| Exact command | Exit / result | Timing |
|---|---|---|
| `npm run typecheck` | 0 / PASS; both configs noEmit | 1.95 s shell |
| `npx --no-install vitest run tests/integration/state/failures.test.ts tests/integration/state/service.test.ts tests/integration/state/http.test.ts --no-file-parallelism` | 0 / 30 PASS, 3 files | 14:45:53; 8.75 s |
| `npm test` | 0 / 300 PASS, 1 SKIPPED, 22 files | 14:46:24; 8.42 s |
| `npx --no-install vitest run tests/integration/runtime-security` | 0 / 49 PASS, 5 files | 14:46:42; 8.08 s |
| `npm run test:e2e` | **NOT RUN — SAFETY CONSTRAINT** | Explicit screenshot destinations have no safe override |
| `npm run build` | NOT RUN | Unnecessary; overwrites existing build artifacts |

30 focused cases adalah pengulangan subset, bukan additional unique tests. Unique executed original+security cases: **349 PASS + 1 SKIPPED**. Historical browser 2 PASS tetap historical M02-02 result, bukan audit rerun. ACL test `tests/integration/workspace/paths.test.ts:97` tetap skipped/NOT VERIFIED.

Read-only metadata/source/hash/image commands juga dilakukan. Satu initial fixture-parent check berhenti karena TEMP short alias; setelah canonical verification, inspection aman. Beberapa `rg` patterns yang memakai wildcard literal Windows dan satu PowerShell enumeration parse error diperbaiki sebagai read-only queries; bukan application test failures atau permission changes. Tidak ada mutation dari command yang gagal tersebut.

Successful rerun fixtures dibersihkan existing helpers dalam fresh roots. Pemeriksaan akhir menunjukkan nol owned runtime-security probe/journal-owner/backend/dev processes dan nol listeners 43123/43124; temp ai-office roots yang tersisa hanya dua retained fixtures dan rollback snapshot historis. Tidak menghentikan unrelated tool infrastructure. Tidak mengklaim audit seluruh OS process/handle/network security.

## 10. Findings register

| ID / severity | Evidence | Scope dan impact | Disposition |
|---|---|---|---|
| R01 / **P2** | `context.ts:66,67,87,94`; sequential-only identity reuse test | Async issuance permits concurrent check/set race; significant identity/coverage gap, not demonstrated duplicate dispatch | **OPEN — blocks unconditional host closeout**; exact R1 remediation di bawah |
| R02 / P1 worker gate | S15 direct fake-canary read succeeds despite host DENY | Same-user unrestricted IO can reach protected stand-ins | OPEN for worker; not new P1 defect in deliberately host-only probe use case |
| R03 / P1 worker gate | IPC-reported cooperative descendants, no kernel tree assignment | Hostile/detached/hard-crash tree cleanup unknown | OPEN for worker; no dangerous tree test performed |
| R04 / P2 future state gate | Fixture journal lock/seal/temp/rename design | No authoritative production lease/journal or power-loss proof | OPEN before runtime integration; fixture scope correctly labeled |
| R05 / P2 monitoring | Four historical timeout cases; clean current reruns | Cause unknown; no trace establishing resource/DB/race root cause | NOT REPRODUCED; no threshold change |
| R06 / P3 workflow | Explicit package path filters; separate suite documented | `npm test` alone omits 49 cases | Intentional separation; require focused command at acceptance |
| R07 / P3 artifact | PNG validation, visual review, exact recorded hashes | Prior regenerated originals lack original bytes | ACCOUNTED FOR; accept current artifacts, no parity claim |
| R08 / P3 retention | Exact-root metadata/content/hash inspection | Two harmless synthetic failed fixtures remain | VERIFIED SYNTHETIC — RETAINED; cleanup not complete, policy honored |

## 11. Reconciled host and runtime matrix

| Gate | Evidence/status now | Remaining boundary / execution impact |
|---|---|---|
| S01 valid context / S02 cross-project | HOST_VERIFIED in exercised sequential scenarios | R01 issuance concurrency exception separately recorded |
| S03 private / S04 dummy credential host requests | HOST_VERIFIED | OS direct access not denied |
| S05 paths/aliases/links | HOST_VERIFIED | TOCTOU/OS boundary NOT VERIFIED |
| S06 immutable task/attempt | HOST_VERIFIED for freeze/expiry/revoke/foreground/sequential reuse; **concurrent uniqueness NOT VERIFIED by tests, source R01 open** | Host acceptance CONDITIONAL |
| S07–S09 explicit decisions/replay/expiry/substitution | HOST_VERIFIED | Synthetic controller only; actual protocol BLOCKED |
| S10–S12 owned probe/cancel/cooperative descendants | PROCESS_LIFECYCLE_VERIFIED | HOSTILE PROCESS-TREE CLEANUP NOT VERIFIED |
| S13 journal/dispatch dedup | HOST_VERIFIED | Does not repair concurrent issuer guard or guarantee exactly-once effects |
| S14 controlled restart/reconcile | HOST_VERIFIED + PROCESS_LIFECYCLE_VERIFIED | Actual runtime crash/reconnect NOT VERIFIED |
| S15 host vs direct IO distinction | HOST_VERIFIED | OS containment insufficient; worker BLOCKED |
| V01 foundation regression | HOST_VERIFIED; final 300 PASS/1 SKIPPED | Historic timeout cause unknown |
| V02 ACL | NOT VERIFIED | Existing skip not promoted |
| V03 screenshot/inventory | Current artifacts accepted; all 98 initial files unchanged in audit | No historical PNG restoration claim |
| V04 teardown | PROCESS_LIFECYCLE_VERIFIED for owned test processes | No exhaustive OS handle audit |
| V05 retained roots | VERIFIED SYNTHETIC — RETAINED | Policy-compliant preservation, not deleted |
| V06 forbidden actions | No additional runtime/account/OS setup invoked | Absence of execution is not enforcement proof |

All sixteen M02-01 prerequisites remain visible:

| ID | Requirement | Final evidence level | Worker gate / next evidence |
|---|---|---|---|
| P01 | Official interface | Documentation only; CODEX_RUNTIME_VERIFIED absent | BLOCKED; separately pin/interface compatibility |
| P02 | Subscription/authorization | ACCOUNT_VERIFIED absent, eligibility UNKNOWN | BLOCKED; separate official account scope |
| P03 | Included-only billing | NOT VERIFIED; no API/key/credit fallback used | BLOCKED; applicable hard cap proof |
| P04 | Credential isolation | HOST_VERIFIED env/policy; direct fake canary readable | BLOCKED; independent OS boundary |
| P05 | Disposable scope | HOST_VERIFIED current fresh/retained synthetic roots | New worker manifest/authorization still required |
| P06 | Private DB/unrelated projects | HOST_VERIFIED evaluator negatives | BLOCKED direct worker IO |
| P07 | Sandbox | OS_VERIFIED absent | BLOCKED; proposed S plan not execution |
| P08 | Approval enforcement | HOST_VERIFIED synthetic engine | BLOCKED real protocol/permission envelope |
| P09 | Cancellation | PROCESS_LIFECYCLE_VERIFIED dummy | BLOCKED hostile tree/actual runtime |
| P10 | Persisted identity | HOST_VERIFIED fixture journal | BLOCKED production lease/schema/journal |
| P11 | No duplicate uncertainty | HOST_VERIFIED controlled dedup/reconcile | BLOCKED real transport/crash scenarios |
| P12 | Auditability | HOST_VERIFIED synthetic history only | BLOCKED real event mapping/acceptance |
| P13 | Immutable worker binding | HOST_VERIFIED tested A→foreground B; R01 open | BLOCKED real durable lease; host correction required |
| P14 | AI Office state authority | Existing state source unchanged; fixture JSON nonauthoritative | BLOCKED runtime-to-state integration |
| P15 | No valuable data | HOST_VERIFIED tested synthetic scope | Mandatory future restriction; no valuable data authorization |
| P16 | Owner worker approval | NOT GIVEN | BLOCKED; closeout review is not worker approval |

Skill execution: OFF; enforcement **NOT APPLICABLE to current disabled fixture feature**, **NOT VERIFIED/BLOCKED before future enablement**. Provider connections/real worker/paid API OFF; quota/entitlement UNKNOWN. No OS_VERIFIED, CODEX_RUNTIME_VERIFIED or ACCOUNT_VERIFIED state is granted.

## 12. Change safety and protected hashes

Final comparison: **98/98 existing AI-Office files unchanged**, zero missing; only the two authorized M02-02R Markdown reports added (100 total outside node_modules). Thus application/contracts/backend policy/schema/package/lock/tests/old reports/build artifacts/screenshots unchanged by this task. Fresh temporary test outputs and Vitest tool caches are not application edits. Both retained fixture inventories/hashes unchanged; rollback snapshot left alone.

Hermes3D: **647/647 tracked hashes unchanged**, HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`; pre-existing ` M package-lock.json` remains. No write to Visual Lab/assets; external Visual Lab contents not checksum-audited. No valuable user project was used.

Selected pre-test SHA-256 values, verified unchanged at completion:

| File | SHA-256 |
|---|---|
| `src/server/runtime-security/context.ts` | `D291B686487DF871F1DFF2811D450924AA6C38E43DD2CECFB050D57835432345` |
| `src/server/runtime-security/policy.ts` | `7337CB042A264D8F01293FD081E85FBA37A70F4E5468F4B38494DB6B8BDB2663` |
| `src/server/runtime-security/approval.ts` | `0677EE8BDEE46331AB0EBB1C0FEA4DE127EC37DDE22B6D1F1827A6AD1D9E67D1` |
| `src/server/runtime-security/journal.ts` | `F17233CB87AD11B443F6D9A218316D837DA0B57EA6B64CA785C33965EFEB7248` |
| `src/server/runtime-security/supervisor.ts` | `CBDBF309F30101A41F144EF6B676080BE2A1678D4B5FF457A233B4892EA1DF03` |
| `package.json` | `E173A3B93F9619D5269DE8E3E1822145A6B918BFE08A51519966681C2230104B` |
| `package-lock.json` | `B1AE0F2D54B7DF3C303B3C442E2854E8A5EAECAF2C0FB2D719303D0A4B5A1926` |
| `tsconfig.json` | `D390BB67899204E7CDB8A5C6C336ADEAE87F038EA325BCFD8CB91DC90D40F662` |
| `tsconfig.web.json` | `B017C054CE31A29E63B10D5F6328A36A087B11AF04D0FF8F46646DFFE9D3E43B` |

Hash source documents/reports yang direview, juga tetap identik:

| File | SHA-256 |
|---|---|
| `docs/AI_OFFICE_CURRENT_BASELINE.md` | `3B23F3F93BBA9E94532E684E51CD904C6145AE200F4FEBB91196B855F8E72E2D` |
| `docs/roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md` | `5A2846287BD067EBB71ED523C2138B553D430E11CF47DCE693E0B76706BAA333` |
| `docs/decisions/M00B_ALIGNMENT_REPORT.md` | `DC93AE4D8C34E6604BEBE60967B407D3A5856231E4D8BF49ECA05BB6522F0D58` |
| `docs/reviews/M01-07_FOUNDATION_ACCEPTANCE_REPORT.md` | `92F65D94F1632D4A8AF1A66E1B44CFE2B701DC9CCE706BEF67F3778E1921AAC5` |
| `docs/reviews/M01-07_M02_GATE_MATRIX.md` | `BF4C2FF8DFE9FE1357D6A38B89452F2E4957BA835430F925EE3641E0FC863FD8` |
| `docs/reviews/M02-01_CODEX_RUNTIME_FEASIBILITY.md` | `8AD5A0CB7ED9191D12108DD0A4BE1318CDA9B263994B66EC6A6CD7A6F4EAB440` |
| `docs/reviews/M02-01_NEXT_POC_GATE_PLAN.md` | `FDC857339941D5BF9950FCCAFBEC9F9F38B8826DB7C03A38B7E5D2EFA5DD9C09` |
| `docs/reviews/M02-02_SECURITY_HARNESS_REPORT.md` | `A99005942A287B228916EE57E15564602521C438FB0CD2059806B6E5A3D4B0FF` |
| `docs/reviews/M02-02_RUNTIME_GATE_MATRIX.md` | `D272BA94F4DB501BDF3EAD9D242B32D82D199002811ACE0CEEDECDD8A98E2C55` |

## 13. Exact bounded remediation and Owner review

Recommend **M02-02R1 — Atomic Synthetic Attempt Issuance**, before executing the proposed M02-02S. Proposed change scope only `src/server/runtime-security/context.ts` and `tests/integration/runtime-security/policy.test.ts`, plus a separately approved evidence report. No production integration, package/config change, OS setup or new executable.

Implement synchronous attempt-ID reservation before the first await, retaining a fail-closed tombstone on issuance failure/revoke. Add one meaningful concurrency regression: two simultaneous `issue()` calls using genuine same-project scope and same attempt ID but different task IDs must yield exactly one issued capability and one duplicate rejection; losing call cannot replace/invalidate the winner; registration remains single. Existing sequential/expiry/revoke/foreground and journal tests must remain green. Run typecheck, existing M01 suite and focused security suite sequentially; keep screenshots/retained fixtures unchanged. This is a recommendation, **not an implemented fix or an approval to edit source now**.

Owner review items: approve/request the exact R1 correction scope; acknowledge accepted current screenshots and safe fixture retention; separately decide any later cleanup permission and containment candidate. No further technical approval is requested to finish the already-authorized audit reports. No cleanup, R1, S or M02-03 action starts automatically.

**M02-02R AUDIT COMPLETE — HOST ACCEPTANCE CONDITIONAL ON R01 REMEDIATION — REAL CODEX WORKER REMAINS BLOCKED — AWAITING OWNER REVIEW.**
