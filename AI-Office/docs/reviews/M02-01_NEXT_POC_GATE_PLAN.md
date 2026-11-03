# M02-01 — Next PoC Gate Plan

Tanggal: **29 Oktober 2026 (Asia/Jakarta)**. Status: **RECOMMENDATION — OWNER REVIEW REQUIRED**. Parent baseline: M00B-1.1, M01-07 fixture acceptance. [Feasibility report](M02-01_CODEX_RUNTIME_FEASIBILITY.md) memuat source registry, klasifikasi, comparison dan hashes.

**Audit M02-01 COMPLETE. M02-02 belum diotorisasi/dimulai. Actual worker execution BLOCKED.** Unknown/belum diuji bukan test PASS, dan future gate tidak dianggap existing M01 defect.

## 1. Recommended M02-02 scope

Usulkan **security-only fixture harness**, tanpa model inference, provider login/connection, OAuth registration atau real coding worker. Tujuan: membuktikan prerequisite containment dan host control dengan deterministic non-AI test processes serta synthetic protocol fixtures.

Candidate runtime: pinned official Codex app-server via **owned stdio**, bukan raw WebSocket listener. Documentation mencakup product lifecycle tetapi memperingatkan experimental/production limitations; compatibility harus dievaluasi sebagai bounded development PoC. Fallback CLI exec tetap memerlukan semua safety/billing gates; **tidak menjalankan exec coding pada M02-02**. [Official protocol](https://learn.chatgpt.com/docs/app-server), [integration-layer guidance](https://developers.openai.com/blog/codex-as-a-platform).

Scope yang perlu Owner approve terpisah:

- Test-only supervisor/lease/approval/attempt-journal prototype, typed synthetic protocol fixtures dan denial tests.
- Non-inference sandbox probes hanya jika executable/mode/effective policy dikenal dan seluruh automatic write locations dapat dibatasi ke disposable roots.
- Application/provider execution flag tetap OFF; tidak menambah public execution/file/shell endpoint.
- Existing M01 source/contract/schema changes, bila dibutuhkan, harus disebut per file dan direncanakan sebelum implementasi; gunakan fixture-only prototype terlebih dahulu. Rekomendasi ini tidak memberi broad edit authorization.
- Capture sanitized evidence dan hash inventory; teardown hanya owned processes dan validated roots.

**M02-02 readiness: siap untuk Owner review scope security-only, bukan siap worker.** Jika sandbox probe memerlukan admin setup, ACL/firewall/account change, package install atau global config mutation, stop dan usulkan scope baru. Jangan melakukan setup sebagai efek samping “tes”.

## 2. Allowed/forbidden operations untuk future bounded task

Ini proposed scope; **tidak dijalankan sekarang**.

| Proposed allowed setelah explicit approval M02-02 | Forbidden dalam scope awal M02-02 |
|---|---|
| Source review, pinned binary/schema metadata, effective nonsecret policy review | Reading credential values/store, cookies atau current provider sessions |
| Membuat dummy project/data/profile roots di parent temporary khusus yang disetujui | Memakai root proyek berharga, existing auth/config/data root atau Hermes/Visual Lab |
| Non-AI deterministic scripts/probes memakai tools existing | Coding turn, codex exec prompt, Responses inference, provider connection/login/logout/OAuth registration |
| Sandbox command-only probe tanpa inference, jika write scope dan mode dapat dibuktikan | Sandbox setup yang mengubah ACL, users, firewall, machine policy; privilege escalation |
| Synthetic app-server request/notification/restart/error tests | Menganggap mock handshake/account/approval sebagai genuine runtime/account proof |
| Test-owned journal/config/artifacts dalam isolated fixture root | Public task-execution APIs, production scheduler, parallel agents, provider routing |
| Owned process-tree cancel/teardown dan validated cleanup | kill-by-name/global port cleanup, auto-remove stale lock/DB evidence |
| Future explicit tests terhadap agreed dummy credentials/network canaries | Actual access to token files/keyring, internet exfiltration, real purchased-credit exhaustion test |

Jika app-server harus dijalankan untuk non-model protocol verification, Owner scope harus mengizinkannya secara khusus, dengan empty isolated profile, no auth, no external network, no turn/start, no thread auto-resume/tool startup. Jika startup side effects atau outbound initialization tidak dapat dibatasi, gunakan synthetic peer saja dan laporkan actual protocol sebagai NOT VERIFIED.

## 3. Dependencies dan implementation boundaries

| Dependency | Existing evidence / perubahan masa depan |
|---|---|
| M01 baseline/docs | Enam DEC, hybrid direct/PM route, fixture-only storage, independent visual ownership; pertahankan roadmap existing |
| Workspace ownership | `src/contracts/project.ts`; `workspace/manager.ts:55,87,226`; UI binding revoked saat switch; worker perlu lease issuance terpisah |
| State authority | `state/service.ts:34,52,68`, `state/database.ts:45,68`, `state/schema.ts`; no raw path/SQL client selector |
| Events/contracts | `contracts/demo.ts` saat ini literal demo. Real worker, attempt/policy/approval records perlu separate contract review sebelum coding; jangan cast/loosen DEMO schema untuk melewati validator |
| Policy/API | `contracts/policy.ts`, `server/policy.ts`, `server/http.ts:9`; tetap OFF/no execution endpoints |
| Process lifecycle | `scripts/dev.mjs` membuktikan dev-child lifecycle, belum worker sandbox/secret supervisor; jangan menyalin environment inheritance untuk untrusted tools |
| Skill boundary | `contracts/capabilities.ts`, `web/skills/projection.ts`; projection bukan runtime permission |
| Runtime pin | Local npm metadata 0.162.1, binary hash di feasibility report; actual version/help/handshake belum dipanggil. Verify candidate absolut dan version-specific protocol sebelum probes |
| Account/billing | Belum ada account-specific evidence. Account settings verification memerlukan separate authorization, tidak digabung diam-diam ke offline security tests |
| Backup | Valuable data blocked sampai minimal consistent snapshot/restore proof; full M05 portability tidak diperlukan untuk fresh disposable security fixtures |

Baca ulang official docs dan version-specific types sebelum implementation. Documentation/source drift yang ditemukan: retired untrusted approval masih ada di SDK union; current docs memiliki additional experimental fields. “Ada di tipe” bukan berarti aman/accepted pada selected executable. [SDK options](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/threadOptions.ts), [approval guide](https://learn.chatgpt.com/docs/agent-approvals-security).

## 4. Disposable fixture plan

**DESIGN PROPOSAL**, belum membuat directory/metadata apa pun:

| Logical root | Isi/permission yang dimaksud |
|---|---|
| Owned outer temp root | Dibuat sekali melalui mkdtemp, resolved absolute, owner consent, cleanup manifest |
| Project-A | Hanya source dummy/no valuable data; writable allowed subtree; stable backend project identity jika integration fixture diotorisasi |
| Project-B | Sibling dummy project dan sentinel; tidak readable/writable oleh A worker |
| Private-state | Dummy DB/registry/journal/approval evidence di luar worker-visible project; app trusted writer only |
| Credential-canary | Dummy access/refresh/session-like markers, bukan credential asli; denied read/write untuk tools |
| Runtime-profile | Empty isolated runtime config/home/sessions/cache/log path; milik trusted host, bukan shared Codex/IDE profile |
| Tool/system allowlist | Minimal existing shell/runtime binaries + required libraries; readonly, tidak broad user-home read |
| Output/evidence | Host-managed sanitized results, stdout/stderr bounded, per-case expected denial dan before/after hashes |

Semua dapat berada di satu outer disposable parent demi cleanup, tetapi **worker tidak mendapat write/read grant ke parent tersebut**; exact project subtree dan allowlisted system paths saja. Jika state/data berada di dalam root yang diizinkan worker, test harus FAIL/BLOCK.

Capture absolute resolved root/file IDs dan before hashes. Tidak menggunakan path string prefix sebagai authorization. Cleanup hanya setelah owned process tree berhenti; resolved path harus sama, di bawah parent yang disetujui, bukan parent/root itu sendiri, dan cocok manifest. Partial failure mempertahankan evidence yang diperlukan; cleanup tidak menghapus valuable/external paths. Tidak membuat Git di application repo; dummy Git fixture hanya jika terpisah diotorisasi, atau pilih documented non-Git behavior setelah review.

## 5. Windows sandbox negative test matrix

Semua baris **NOT RUN / NOT VERIFIED** saat M02-01. Uji dengan **non-AI processes** dahulu; actual worker belum boleh dijalankan. Simpan outcome/error class + expected denied assertion dan hash sentinel unchanged. Jangan membaca actual credential material bahkan sebagai negative test.

Official basis: [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [Permissions](https://learn.chatgpt.com/docs/permissions), [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security). Declared settings bukan isolation proof. Current OS build 26300.9711 tidak membuktikan MXC capabilities.

| ID | Case / expected result | Evidence dan stop condition |
|---|---|---|
| SEC-01 | Pilih exact MXC/mode + effective policy; mode unavailable/unsupported harus fail closed | Catat executable hash, OS, actual implementation, effective requirements; fallback tak disetujui → STOP |
| SEC-02 | Allowed Project-A dummy read/write berhasil hanya pada approved paths | Positive control agar semua denial bukan sekadar broken test harness |
| SEC-03 | Read/write Project-B dan unrelated sibling ditolak | Tidak ada bytes/sentinel B terungkap; hash B unchanged |
| SEC-04 | Read/write private DB/registry/journal/approval evidence ditolak | Tool tidak boleh mengubah authoritative state atau membaca state B |
| SEC-05 | Credential-canary read/write, env/argv/log leakage, spawned-child inheritance ditolak | Raw secret tidak dicetak; aggregate leak count/boolean saja |
| SEC-06 | Traversal/prefix collision/alternate casing/drive-relative/UNC/device/ADS boundary probes ditolak | Sesuai scope local Windows M01; runtime yang mendukung UNC tidak otomatis membuatnya allowed oleh AI Office |
| SEC-07 | Project-A junction/symlink/hardlink ke B/private/canary tidak membuka escape | Buat hanya test-owned links tanpa OS policy change; unavailable symlink permission → NOT VERIFIED, jangan escalate |
| SEC-08 | Replace directory/reparse target setelah validation dan selama subprocess berjalan tidak membuka akses | Race schedule terkontrol, no valuable files; jika tidak bisa establish safe invariant → BLOCK |
| SEC-09 | Newly created sensitive file sesudah long-running child start tetap protected oleh approved exact-root policy | Jangan hanya mengandalkan snapshot deny-glob; sentinel baru di denied subtree harus tidak terbaca |
| SEC-10 | Tool outbound TCP/DNS/HTTP/proxy env/direct-IP path diblokir sesuai policy | Gunakan test-owned listeners/fake routes, bukan external inference/exfiltration; tidak ada global-network-policy claim dari command proxy saja |
| SEC-11 | Host loopback control plane tidak dapat membaca/mutasi state tanpa auth; backend capability tidak tersedia pada tools | MXC dapat mengizinkan loopback connection. Catat raw reachability terpisah dari unauthorized API denial; jika policy membutuhkan TCP loopback denial, MXC sendiri tidak cukup → outer isolation/BLOCK |
| SEC-12 | Child/grandchild/background process tidak lolos scope; cancel/exit menghentikan seluruh owned tree | Sentinel tidak bertambah setelah stop; PID/process ownership, handles dan ports released |
| SEC-13 | Direct tool/file path dan shell write sama-sama dibatasi | Jangan menguji shell saja lalu menyatakan semua native file tools aman |
| SEC-14 | Tampering config/rules/skills/hooks/plugin/MCP/extra roots tidak memperluas permissions | Tidak memuat user-global project code/plugins; failure to exclude unauthorized capability → STOP |
| SEC-15 | Lost parent/transport, timeout/start failure menyisakan safe evidence tanpa orphan tool | Partial IO tidak diulang otomatis; no ad hoc state/lock reset |

Native unelevated tidak cocok untuk mandatory denied-read requirement yang didokumentasikan tidak didukung. Elevated memerlukan setup di luar proposed no-admin scope; tidak “mencoba sampai pass”. MXC punya caveat loopback/child lifetime/deny-glob timing. Jika native requirement gagal, alternatif **RECOMMENDATION**: bounded WSL2 atau VM/equivalent yang sudah tersedia dan secara terpisah disetujui, dengan host mounts/profile/credentials/network disabled atau allowlisted dan negative matrix sama. Tidak install atau mematikan sandbox otomatis.

## 6. Credential isolation strategy

Tidak menyalin private Codex credential files; tidak memakai browser cookies atau membagikan token ke workers. Native runtime dapat mengelola sign-in/refresh sendiri; independent eligible OAuth memerlukan trusted app token custody. [Native auth](https://learn.chatgpt.com/docs/auth), [SIWC sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions).

Future M02-02 memakai **dummy credentials saja**, dengan dua boundary terpisah:

1. Trusted parent/runtime boleh membaca canary yang dibutuhkan untuk simulated model transport.
2. Untrusted tool, child/grandchild, project script dan frontend tidak boleh mendapat canary melalui env, stdin, argv, cwd, files, logs, URL atau API capability.

Use allowlisted environment, absolute executable paths dan protected profile/data roots; jangan `...process.env` ke tool process. Native/SDK inherited env, project config, shell profiles dan optional connectors harus diperhitungkan. Documented OAuth ACCESS_TOKEN env_key setup **bukan proof secret tidak diwarisi descendants**. [Official OAuth runtime setup](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server).

Dummy profile tests membuktikan mekanisme, bukan otomatis proteksi actual keyring/native credential locations. Effective policy harus memetakan protected actual roots tanpa membaca isinya; keyring-specific separation perlu isolated dummy store/identity atau proof yang disetujui. Jika bukti actual relevant boundary tidak dapat didapat dengan aman, gate tetap NOT VERIFIED/BLOCKED. Jangan menjalankan test yang bisa membocorkan actual token jika denial gagal.

No actual account/session mutation pada tahap ini. Later account switch harus menghentikan dispatch, invalidate approvals/leases terkait auth context, lalu validate identity/registration sebelum aktivasi kembali. Jangan mengubah shared Codex profile sehingga IDE logout. Logout/revocation perlu separate authorization dan lifecycle yang resmi.

## 7. Approval dan cancellation prerequisites

### Approval

Synthetic protocol tests memakai exact pinned request names [ServerRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerRequest.ts), dan [decision types](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/CommandExecutionApprovalDecision.ts). Ini test interface host; belum runtime approval enforcement.

Required assertions: correct project/task/attempt/thread/turn/item/request/process epoch; canonical target/command digest; current policy/permission envelope; explicit nonexpired decision; reject stale/cross-project/tampered response; default deny on timeout/revocation/unsupported request. Do not auto-accept session grants, rules amendment, network permissions atau capability expansion. Unknown request bukan approval.

`on-request` bukan prompt untuk setiap allowed operation. Owner harus menyetujui bounded in-sandbox autonomous actions atau meminta stricter execution-policy gating yang kompatibel dan diuji. Observed item/started tidak boleh diperlakukan sebagai approval request apabila runtime sudah berhak menjalankannya. No auto-review/model reviewer untuk security-only stage.

### Cancellation

Non-AI supervisor test: graceful stop signal/IPC, bounded wait, owned process-tree termination jika diperlukan, no writes setelah acknowledgement, ports/handles release, pending approvals revoked, state remains reconciliable. Jangan kill all node/codex by name.

Later actual runtime: [turn/interrupt params](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/TurnInterruptParams.ts) mengikat thread/turn; wait terminal interrupted/completed/failed, reconcile side effects. API acknowledgement/transport closure sendiri tidak menjamin shell children sudah berhenti. Minimum cancellation proof wajib sebelum first coding task; M02-04 memperluas coverage.

## 8. Entitlement dan billing verification plan

M02-02 security-only **tidak melakukan login, client registration, account requests, setting changes atau inference**. Rencana berikut adalah gate untuk later explicitly authorized preflight, bukan perintah menjalankannya.

| Gate | Required evidence / safe behavior |
|---|---|
| Deployment eligibility | Konfirmasi apakah AI Office personal-local, proprietary distributable, paid atau hosted. Official cookbook menyebut personal-local, quickstart selected private clients; jangan menyimpulkan semua private clients approved |
| Native vs independent grant | Native Codex sign-in terpisah dari SIWC identity/plan grant. Jangan menggunakan private cache sebagai source host credentials |
| Account selection | Official metadata/granted permissions dan intended workspace, disanitasi; Owner Pro report sendiri tidak memberi model/usage proof |
| Included-only policy | API-key fallback/provider substitution OFF; purchased-credit use/auto purchase tidak diotorisasi |
| Eligible SIWC candidate control | Authorized app registration benar, saved app limit <100%, credit sharing OFF, auto reload OFF; verify actual control berlaku pada route itu |
| Native route | Cari official account-level included-only stop untuk native client dan buktikan applicability; tidak memakai SIWC app limit sebagai substitute |
| Missing control/evidence | **INCLUDED-ONLY HARD CAP: NOT VERIFIED**; keep execution BLOCKED. Warning, saldo snapshot, remaining quota estimate atau app false constant bukan hard stop |
| Model entitlement | Catalog adalah pilihan, bukan authorized inference. Manual selection; later explicitly approved minimal noncoding request setelah semua safety/billing gates, sebelum filesystem coding task |
| Usage failure | Limit → PAUSE; missing scope/eligibility/auth → BLOCK; no automatic billing/model/provider change |
| Unexpected auth mode/config | Jangan login/logout current session untuk memperbaiki. Stop dan minta separate bounded authorization |

Official references: [SIWC eligibility](https://developers.openai.com/siwc/quickstart), [personal-local statement](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt), [account/app credit controls](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites), [purchased credits](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-personal-plans). Documented lower app cap adalah real candidate enforcement, bukan sekadar warning; **penerapannya pada AI Office/Owner belum verified**. Tidak perlu sengaja menghabiskan allowance/credits asli untuk test; gunakan approved provider-control proof dan synthetic failure tests tanpa biaya tambahan.

## 9. Project A/B, backend dan UI boundary

Future command routing: Owner→PM proposal atau Owner→specialist direct → common validation/policy/orchestrator → adapter → Codex. PM inference tidak menjadi prerequisite setiap direct task. Tidak implement di M02-01.

Required synthetic/non-AI cases:

- Allocate A from backend-issued validated root. Freeze taskId/attemptId/policy/account/billing/path scope; UI switch B tidak mengganti cwd/root/permissions/model/account A.
- Wrong project ID/binding/lease/generation, stale approval, replayed command, runtime thread mismatch dan delayed A response ditolak atau dirutekan hanya ke A.
- UI B tidak menampilkan A sebagai B. A status bisa dipantau lewat correctly scoped view; background continue/safe-pause menunggu approved policy.
- Runtime events adalah observations; orchestrator yang memvalidasi dan mengubah official state melalui Project State Service. Runtime rollout history bukan second authoritative task database.
- Real events tidak dimasukkan ke current DEMO-only schema. Schema extension, task/attempt persistence, state transitions dan version/migration strategy harus direview sebelum actual coding.
- Browser tidak menerima raw app-server transport, fs/command/auth RPC, tokens atau provider-login capability. Sanitized evidence refs dan scoped status saja. No new execution endpoint dalam initial security scope.
- Skills fixture metadata tidak dipakai sebagai actual session authorization. Skills/MCP/plugins/child-agent spawning OFF atau excluded sesuai effective profile; first PoC tidak membutuhkannya.

## 10. Error handling, recovery dan dedup design

**DESIGN PROPOSAL**, belum implemented:

| Failure | Required host behavior / evidence |
|---|---|
| Startup/handshake timeout | Jangan mengirim turn; terminate owned processes, preserve scoped error, no alternative binary/provider fallback |
| Credential missing/expired/revoked/account switched | Block new work, revoke pending approvals; official renewal hanya setelah separate authorization |
| Missing scope or user not eligible | No inference/repeated OAuth loop; display exact sanitized restriction |
| Usage limit | Pause new requests; link Manage usage; no purchase/reload/API fallback |
| Availability service error | UNKNOWN; bounded diagnostic backoff bila aman, tidak otomatis retry task dispatch |
| Stream error/incomplete/disconnect | Nonterminal task; reconciliation required; no success dari partial text/exit |
| Duplicate command/reconnect | Same logical command/attempt identity; unique dispatch lease; return existing status, jangan start second task |
| Approval response uncertain | Journal decision intent + connection epoch; inspect outcome; no blind resend untuk unrelated request |
| Host/runtime crash | Mark unknown/nonterminal attempt RECONCILIATION_REQUIRED; inspect persisted history/owned processes/allowed diff before approved continuation |
| Child still active after cancel | STOP acceptance; preserve evidence, deny next turn/cleanup until safe; do not call cancelled=success |
| Runtime terminal success | ValidationRequired; verify intended artifact/tests/allowed diff before authoritative task acceptance |

[Official SIWC errors](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery) membedakan admission failures dan structured errors. Contoh stable codes: `subscription_sharing_user_not_eligible`, `subscription_sharing_usage_limit_exceeded`, `subscription_sharing_usage_unavailable`. Error body tidak selalu API error object; diagnostic text bukan stable code. Jika inference stream sudah dibuka, terminal event tetap wajib diperiksa. [Models/inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference).

Future attempt journal dikelola domain/state service AI Office: durable intent sebelum send, native IDs setelah returned, scoped events/decisions, terminal outcome dan validation. Tidak menyimpan secrets. Idempotency keys host tidak membuat arbitrary shell exactly-once; uncertain command effects perlu rekonsiliasi. Conversation resume tidak otomatis resubmit original task. Reconciliation boleh berakhir manual stop.

## 11. Mandatory stop conditions

Stop/block stage terkait apabila:

- Root/data/profile tidak terbukti disposable/resolved atau cleanup target keluar owned root.
- Sandbox unsupported, fallback tidak disetujui, denied read/write berhasil, credential canary bocor, child lolos atau unauthorized loopback API berhasil.
- Test membutuhkan actual credentials/privilege/OS security mutation/install yang tidak diotorisasi.
- Actual provider/login/OAuth/inference terpanggil pada security-only stage.
- Mode auth/billing/provider/account tidak cocok; included-only control tidak bisa dibuktikan.
- Foreground switch me-rebind worker, Project B terakses, raw runtime RPC terbuka ke browser, atau runtime menulis DB langsung.
- Approval stale/timeout memberi grant, cancel tidak menghentikan scope proses, uncertain restart mengulang side effect.
- Source real dipalsukan dari DEMO/synthetic events, output secrets masuk logs, atau actual runtime status tidak dikenal.
- Skill/plugin/MCP/project hooks/extra roots tidak dapat dibatasi sesuai scope.
- Critical evidence hanya simulated tetapi dilabeli actual runtime PASS.

Catat command/case/version/conditions dan sanitized evidence; jangan “memperbaiki” dengan disable security, menaikkan permission, menghapus state atau menambah paid fallback.

## 12. Sixteen prerequisites sebelum first real coding worker

Status di bawah adalah **saat M02-01**, bukan kelulusan M02-02.

| # | Prerequisite | Status kini | Required gate sebelum coding |
|---|---|---|---|
| 1 | Official interface dipilih | OFFICIALLY DOCUMENTED + RECOMMENDATION C; local compatibility NOT VERIFIED | Owner select/pin executable + matching protocol |
| 2 | Subscription/authorization valid | ACCOUNT-SPECIFIC UNKNOWN | Permitted-use/identity/plan scope/account evidence via authorized official mechanism |
| 3 | Included-only billing | NOT VERIFIED; candidate SIWC account control documented | Applicable saved controls terbukti; otherwise BLOCK |
| 4 | Credentials isolated | NOT VERIFIED / BLOCKED | Canary + effective profile/process boundary proof; no token to tools |
| 5 | Disposable project scope | DESIGN PROPOSAL; no roots created | Explicit approved paths/manifest |
| 6 | Private DB/unrelated workspace protected | NOT VERIFIED for worker | Denied read/write negative tests |
| 7 | Sandbox tested | NOT RUN / BLOCKED | Exact effective implementation + SEC negative cases pass |
| 8 | Approval policy enforced | NOT RUN / BLOCKED | Host stale/denial tests + approved action envelope, then bounded actual protocol proof |
| 9 | Cancellation adequate | NOT RUN / BLOCKED | Non-AI whole-tree stop/write cessation; later actual turn check |
| 10 | Task/attempt identity persisted | NOT IMPLEMENTED for real execution | Approved durable journal/unique command dispatch |
| 11 | No duplicate after uncertainty | NOT RUN / BLOCKED | Crash/replay/reconcile tests; no automatic resend |
| 12 | Actions auditable | Real-event model NOT IMPLEMENTED | Sanitized event mapping, IDs, ordering, terminal/error evidence + validation |
| 13 | Worker binding immutable | M01 foreground only | Separate backend worker lease/A→B test |
| 14 | AI Office state authoritative | LOCALLY OBSERVED current foundation | Controlled runtime observations/state commit boundary, no direct DB access |
| 15 | No valuable data | Restriction active | Approved dummy roots and absence of valuable content |
| 16 | Explicit Owner worker approval | NOT GIVEN | Separate bounded M02-03 execution authorization after evidence review |

Tidak ada runtime PASS dari M01 automated tests. Account/model access yang memerlukan actual inference hanya boleh diperiksa pada separately authorized minimal preflight **sesudah safety/billing gates**, sebelum task coding. Readiness metadata bukan model access proof.

## 13. Recommended stage sequence

Semua subtask structure berikut **RECOMMENDATION**, bukan rewrite roadmap atau izin eksekusi:

| Stage | Proposed outcome / critical limit |
|---|---|
| M02-01 — selesai sekarang | Official feasibility + security plan; no runtime execution |
| M02-02 — setelah Owner approval | Offline/non-AI containment, credential-canary, supervisor/approval/journal/dedup minimum tests. Account/inference tetap excluded kecuali separate revised scope |
| M02-03 — separate explicit approval | Authorized official account/billing preflight; minimal noncoding entitlement check bila diperlukan setelah safety gates; lalu satu disposable coding task dengan immutable lease/records/tests |
| M02-04 — expansion | Actual interruption/restart/crash/ambiguous outcome matrix. Minimum cancel/dedup sudah required sebelum M02-03 |
| M02-05 — acceptance | Review actual security, entitlement, included-only behavior, event integrity/isolation/quality before more workers/providers |

Jika account/control gate masih unknown setelah M02-02, tahap itu boleh lulus security scope sambil **worker tetap BLOCKED**. Tidak mengubah unknown menjadi accepted supaya jadwal berjalan.

## 14. Exact Owner approval gate

Review dua laporan M02-01 tidak otomatis memberi izin M02-02. Proposed approval statement untuk **security-only task** harus mengidentifikasi:

- M02-02 scope dan allowed source/test/report files yang boleh dibuat/diubah;
- temporary parent/project/data/profile/output paths dan exact executable/version;
- non-AI sandbox probes yang boleh dijalankan, no auth/inference, no real credential/data read;
- permitted OS setup (default **tidak ada admin/ACL/firewall/user changes/install**);
- process/network restrictions, cleanup/preserved-evidence policy, test acceptance dan mandatory stops.

**Real worker memerlukan approval kedua yang terpisah**, menyebut official interface/auth/account/model, verified included-only controls, satu task/attempt, scope read/write/tools/network, immutable binding, policy/approvals, cancel/recovery/dedup, evidence outputs dan seluruh mandatory prerequisite. Jika salah satu belum terpenuhi, tidak merekomendasikan eksekusi worker.

Owner juga perlu menetapkan apakah AI Office tetap personal-only local atau akan didistribusikan/hosted, karena eligibility/permitted auth route dapat berubah. Tidak meminta publication source sebagai syarat yang belum dibuktikan. Skills tetap OFF; background continue/pause tidak diaktifkan tanpa keputusan eksplisit.

## 15. Current audit safety dan recommendation

M02-01 hanya membaca local source/metadata dan public official documentation, lalu menulis dua laporan. Tidak membuat fixture roots, project marker/SQLite/journal, tidak memanggil CLI native untuk help/version/sandbox, tidak login/logout/register client, tidak menjalankan model/worker/paid request/skill script, tidak mengubah ACL atau source/dependencies/config/tests/roadmap.

Baseline SHA-256 81 existing AI-Office files dan 647 Hermes tracked files digunakan untuk final comparison. Prior artifacts/reports juga harus identik; hanya dua M02-01 reports ditambahkan. Scope external Visual Lab tidak diaudit checksum; tidak ada tool/write ke proyek tersebut.

**Final comparison teramati:** 81/81 existing AI-Office files dan 647/647 Hermes tracked files tetap identik; hanya dua approved reports ditambahkan (83 file total di luar node_modules). Git HEAD/status Hermes tetap, AI-Office tidak memiliki .git.

**Readiness recommendation: READY FOR OWNER REVIEW OF BOUNDED M02-02 SECURITY-ONLY SCOPE. Real coding worker tetap BLOCKED sampai mandatory gates lulus dan separate execution authorization diberikan.**

**M02-01 FEASIBILITY COMPLETE — READY FOR OWNER REVIEW OF M02-02 SECURITY GATES.**

