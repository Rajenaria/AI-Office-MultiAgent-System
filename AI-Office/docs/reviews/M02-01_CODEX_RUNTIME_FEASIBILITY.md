# M02-01 — Official Codex Runtime & Subscription-First Feasibility

Tanggal akses/audit: **29 Oktober 2026, Asia/Jakarta**. Root: `D:/Rajendra/AI-Projects/AI-Office`. Status: **AUDIT AND DESIGN ONLY — COMPLETE**. Seluruh desain berikut adalah **RECOMMENDATION**, belum authorization implementasi.

## 1. Executive conclusion

**Rekomendasi utama: Option C, Codex app-server melalui owned stdio process**, untuk lifecycle produk AI Office. **Option D adalah jalur authentication/plan usage, bukan pengganti coding runtime**; pertimbangkan C + eligible Sign in with ChatGPT untuk integrasi baru setelah eligibility, credential isolation dan billing controls terbukti. **Fallback terbatas: Option A, CLI exec JSONL** untuk satu disposable task setelah gate yang sama lulus. Option B TypeScript SDK cocok untuk automation Node yang lebih sederhana, tetapi callback approval produk tidak boleh diasumsikan dari SDK tersebut. Dasar pemilihan lapisan: [Codex platform guidance](https://developers.openai.com/blog/codex-as-a-platform), [SDK](https://learn.chatgpt.com/docs/codex-sdk), [app-server](https://learn.chatgpt.com/docs/app-server).

Confidence: **tinggi untuk documented capability/fit**, **sedang untuk technical feasibility pada mesin ini**, **ACCOUNT-SPECIFIC UNKNOWN** untuk eligibility/entitlement/control akun. **Actual worker execution: BLOCKED** sampai prerequisite dibuktikan. Audit dapat selesai dengan future gates yang belum lulus.

Temuan penentu:

- Dokumentasi mengakui personal projects yang berjalan lokal, bukan hanya public OSS. Namun quickstart menyebut selected private clients. AI Office Owner-only lokal merupakan kandidat kategori personal-local, **bukan approval otomatis untuk private proprietary/commercial/hosted distribution**. Eligibility spesifik tetap **UNKNOWN / REQUIRES CONFIRMATION**. [Cookbook](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt), [quickstart](https://developers.openai.com/siwc/quickstart).
- Ada documented credit-use controls untuk eligible participating apps. Itu tidak otomatis berlaku pada native Codex session. **INCLUDED-ONLY HARD CAP: NOT VERIFIED untuk AI Office/akun Owner/jalur yang dipilih**. Ini tidak berarti dokumentasi tidak menyediakan kandidat kontrol; detail dan gate ada di bagian 7.
- Installed package metadata menunjukkan Codex `0.162.1`, bukan bukti binary/protocol behavior telah dijalankan. Windows MXC dan secret isolation **NOT VERIFIED**. Tidak ada inference, login, app-server start, sandbox command atau account read dalam audit ini.
- Fondasi M01 tetap fixture-only. Contract/DB sekarang menolak source real; future runtime memerlukan separately approved contract/state evolution, bukan menyelipkan real events ke DEMO schema.

Lihat [Next PoC Gate Plan](M02-01_NEXT_POC_GATE_PLAN.md) untuk scope security-only yang direkomendasikan. **M02-02 tidak dimulai.**

## 2. Evidence classification

| Label | Makna dalam audit |
|---|---|
| OFFICIALLY DOCUMENTED | Capability atau batas tertulis pada sumber resmi yang benar-benar dibuka; bukan tes account/local |
| LOCALLY OBSERVED | Source, manifest, file metadata/hash atau OS information dibaca saat audit |
| INFERRED / DESIGN PROPOSAL | Rekomendasi desain dari evidence; belum implemented/approved |
| ACCOUNT-SPECIFIC UNKNOWN | Status Owner/client/workspace/model/credits tidak diperiksa melalui mekanisme resmi yang diizinkan |
| NOT VERIFIED | Evidence behavior/isolation/reliability belum cukup; termasuk NOT RUN |
| UNSUPPORTED | Surface/behavior dinyatakan unsupported atau tidak disediakan oleh interface yang diperiksa; absence of proof saja tidak disebut unsupported |
| BLOCKED | Eksekusi terkait tidak boleh dilanjutkan sebelum mandatory gate lulus |

PASS pada laporan M01-07 tetap historical/current handoff evidence dari audit tersebut. **Tidak ada M01 tests yang diulang di M02-01**, karena tidak ada temuan yang memerlukan rerun. Tidak mengklaim counts lama sebagai test run baru.

## 3. Local baseline dan installed runtime observations

Dokumen lokal dibaca pada bagian keputusan/gate/boundary: Current Baseline, Current Roadmap, M00B Alignment, M01-01 Plan, kedua laporan M01-07. Source relevan diperiksa kembali: contracts, workspace manager/path/registry, state service/schema/database, server policy/HTTP allowlist, skill projection, launcher dan package manifest.

| Observation | Evidence / batas |
|---|---|
| Node/npm | `v24.21.0` / `11.19.0`, command version read-only |
| OS | CIM: Microsoft Windows 11 Home Single Language, `10.0.26300`, x64; registry DisplayVersion `26H2`, UBR `9711` |
| OS branding discrepancy | Registry ProductName masih “Windows 10 Home Single Language”; CIM Caption Windows 11. Catat actual fields; jangan simpulkan MXC dari branding/build number saja |
| npm CLI | `Get-Command codex -All` menemukan npm shim di `%APPDATA%/npm`; `@openai/codex/package.json` version `0.162.1`; optional platform package `0.162.1-win32-x64`, Apache-2.0 metadata |
| Runtime candidate | npm platform binary ditemukan di `@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe` |
| Binary SHA-256 | `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`; identitas file lokal, bukan publisher signature validation |
| Other binary | IDE extension `openai.chatgpt-26.51007.21434-win32-x64/bin/windows-x86_64/codex.exe` juga ditemukan. Jangan menganggapnya versi/behavior sama |
| Local execution | **NOT RUN:** codex --version/help, exec, app-server, sandbox, login/status/logout. Versi berasal dari installed manifests; harmlessness startup native binary belum diaudit sehingga binary tidak dipanggil |
| Configuration | Struktur konfigurasi dipelajari dari dokumentasi/pinned public source. Tidak membaca actual user config, auth.json, credential store, browser cookies, env values atau session files |
| AI Office | `ai-office@0.1.0`; React 19.3.1/Zod 4.6.7; tidak mempunyai Codex SDK/provider dependency atau execution route |
| M01 handoff | ACCEPTED — FIXTURE FOUNDATION; 300 PASS/1 ACL SKIPPED, 2 E2E PASS dilaporkan/dibuktikan M01-07, bukan dijalankan ulang |
| Inventory/Git | 81 existing AI-Office files di luar node_modules; no .git. Hermes 647 tracked hashes captured; HEAD `beb76292747b816ef317aa6f9a3992e0014f81d9`, pre-existing modified package-lock.json |
| Missing sources | Kedua expected subscription/visual handoffs tetap tidak ada dalam inventory; isi tidak direkonstruksi |

Tidak menginstal package, mengubah runtime installation/config, atau mencoba binary alternatif. Future PoC harus memilih executable absolut + version/hash/protocol schema yang cocok, bukan PATH resolution ambigu.

## 4. Official source register

Semua URL berikut **diakses 2026-10-29**. H = confidence tinggi terhadap isi yang didokumentasikan, bukan local/account proof. Beberapa requested `developers.openai.com/codex/*` mengarah ke canonical `learn.chatgpt.com/docs/*`; judul dan target aktual dicatat. Markdown public pages dibaca di memory ketika web reader menolak content-type markdown; tidak menyimpan cache file atau menjalankan contoh.

| ID | Official title / URL | Documented capability / limitation | Confidence dan validasi tersisa |
|---|---|---|---|
| S01 | [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk) | TS start/run/resume; server-side Node ≥18; detail kontrol pada source SDK. | H; local SDK/account belum diuji |
| S02 | [Codex App Server](https://learn.chatgpt.com/docs/app-server) | Protocol, lifecycle, approvals, auth; beberapa API/transport experimental; bukan OS isolation. | H untuk dokumentasi; kompatibilitas lokal belum diuji |
| S03 | [Authentication](https://learn.chatgpt.com/docs/auth) | Native ChatGPT vs API key; runtime-managed refresh/keyring; config login restriction dapat logout jika mismatch. | H; actual account/config tidak dibaca |
| S04 | [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform) | Panduan memilih exec/SDK/app-server; harness OSS terpisah dari model access. | H; publikasi 19 Agustus 2026 |
| S05 | [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) | Native client subscription access dan usage dashboard; limits bukan unlimited. | H; account eligibility tetap UNKNOWN |
| S06 | [Sign in with ChatGPT — Quickstart](https://developers.openai.com/siwc/quickstart) | Identity berbeda dari plan use; private clients terpilih, commercial limited trial. | H; specific AI Office eligibility belum ditetapkan |
| S07 | [ChatGPT plan usage — Overview](https://developers.openai.com/siwc/token-sharing-open-source) | OSS/locally hosted apps, client vs stable host ID; paid/remote apps diarahkan ke interest flow. | H; definisi deployment harus dicocokkan |
| S08 | [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in) | Dynamic public-client registration, PKCE, identity/scope validation, protected storage. | H; tidak ada registrasi/login dijalankan |
| S09 | [Codex app-server — ChatGPT plan OAuth](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) | OAuth bearer melalui Responses provider, stdio; host refresh; catalog bukan entitlement proof. | H; example bukan bukti akses akun |
| S10 | [Preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) | HTTP/SSE store:false stream:true; limited fields/tools; local history/resume; env-token renewal restart. | H; gate version/provider compatibility |
| S11 | [Errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery) | Consent/eligibility/usage/refresh errors; no silent switch oleh OpenAI. | H; host tetap harus menolak fallback |
| S12 | [Accounts and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions) | Separate registrations, serialized rotating refresh, revocation dan protected tokens. | H; credential isolation lokal NOT VERIFIED |
| S13 | [Models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference) | Account catalog/current auth context; terminal response success; bukan sekadar stream terbuka. | H; inference tidak dijalankan |
| S14 | [UI/UX guidelines](https://developers.openai.com/siwc/ui-ux-guidelines) | Usage visibility dan Manage usage; UI pemberitahuan bukan billing enforcement. | H; tidak membuat UI |
| S15 | [Using Credits for Flexible Usage in ChatGPT (Personal plans)](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-personal-plans) | Included allowance vs purchased credits vs auto reload; credits bukan Platform API credits. | H; saldo/settings Owner tidak diperiksa |
| S16 | [Using your ChatGPT plan in other apps and sites](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites) | Credit sharing opt-in terpisah; app limit <100% mencegah credit use; bukan pool tambahan. | H dokumentasi; binding ke AI Office/Owner NOT VERIFIED |
| S17 | [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) | MXC/elevated/unelevated, read/network/child-process caveats; build saja tidak membuktikan MXC. | H; no sandbox probe |
| S18 | [Permissions](https://learn.chatgpt.com/docs/permissions) | Filesystem/read/write/network scope, exact denies/glob timing, capability-specific network controls. | H; effective policy lokal tidak diperiksa |
| S19 | [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security) | Sandbox berbeda dari approval; on-request bukan setiap command; retired untrusted; WSL2 alternative. | H; operation coverage perlu PoC |
| S20 | [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) | exec JSONL/structured output, saved native auth, resume, Git check; full-auto retired. | H; command flags lokal tidak dieksekusi |
| S21 | [Build skills](https://learn.chatgpt.com/docs/build-skills) | SKILL.md, project/user/admin/system discovery, explicit/implicit invocation dan disable config. | H; actual discovery NOT RUN |
| S22 | [Integrating Sign in with ChatGPT in your Opensource App](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) | Secara eksplisit menyebut personal projects that run locally; contoh bukan approval AI Office. | H kategori tertulis; publikasi 28 September 2026 |

Supplemental **official openai/codex source**, tag **rust-v0.162.1**, juga diakses 2026-10-29. Ini source inspection, bukan local runtime test atau jaminan bahwa hosted docs selalu identik dengan installed build:

| Source/title | Capability yang diperiksa | Confidence / limitation |
|---|---|---|
| [TypeScript SDK README](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/README.md) | CLI wrapper, runStreamed, outputSchema, resumeThread, workingDirectory/env | H source; package tidak dipasang di AI Office |
| [ThreadOptions](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/threadOptions.ts), [TurnOptions](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/turnOptions.ts) | model/cwd/sandbox/network/approval/additionalDirectories; AbortSignal | H declared API; string union tidak menjamin accepted runtime config |
| [SDK exec implementation](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/exec.ts), [SDK events](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/events.ts) | spawn CLI/JSONL/env/signal/nonzero exit handling; dotted events | H source; tidak menyediakan product-side bidirectional approval handler dalam surface ini |
| [App-server README](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server/README.md) | Release-specific additions, provider requirements/trust behavior | H source; bukan complete protocol guide |
| [ClientRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts), [ServerRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerRequest.ts), [ServerNotification](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerNotification.ts) | Exact RPC/request/notification names yang dipakai mapping | H schema; public method bukan izin mengeksposnya ke frontend |
| [ThreadStartParams](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/ThreadStartParams.ts), [Turn](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/Turn.ts), [TurnInterruptParams](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/TurnInterruptParams.ts) | model/provider/cwd/policy, terminal status, threadId/turnId interruption | H schema; resume bukan exactly-once |
| [ApprovalDecision](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/CommandExecutionApprovalDecision.ts) | accept/session/amendment/decline/cancel decisions | H schema; proposed host policy memakai keputusan tersempit |
| [GetAccountResponse](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/GetAccountResponse.ts), [RateLimitSnapshot](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/RateLimitSnapshot.ts) | account/provider requirement distinction; nullable quota/credits/spend-control fields | H schema; null bukan zero atau no-spend proof |
| [SkillsListParams](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/SkillsListParams.ts), [SkillsConfigWriteParams](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/SkillsConfigWriteParams.ts) | cwd-scoped listing/cache refresh; path/name enable setting | H schema; no actual discovery/enforcement |

Version drift nyata: current docs mendeskripsikan tambahan parameter skills dan named permissions yang tidak semuanya ada di pinned generated types; SDK approval union masih memuat retired `untrusted`, sementara current [approval docs](https://learn.chatgpt.com/docs/agent-approvals-security) melarang explicit setting tersebut. Future PoC wajib schema/version compatibility checks dan fail closed; jangan mengaktifkan experimental API atau menyalin flag contoh tanpa verifikasi. Code license metadata tidak memberikan entitlement model, subscription sharing, izin hosted service atau hak aset.

## 5. Four-option technical comparison

**A/B/C adalah runtime integration surfaces; D adalah auth/usage route** yang bisa dipakai bersama runtime jika eligible. Berikut documented capabilities (D = documented, U = unknown/needs validation); penilaian fit adalah DESIGN PROPOSAL.

| Criterion | A — CLI / exec | B — TypeScript SDK | C — app-server | D — eligible Sign in with ChatGPT |
|---|---|---|---|---|
| Official status | Official OSS CLI | Official TS package | Official product integration protocol; version-sensitive/experimental surfaces | Official auth/plan-use flow; eligibility limited |
| Local Windows | Native binary tersedia; isolation needs test | Node/server-side, spawns local CLI | Owned native process candidate | Local loopback auth candidate; bukan executor |
| Subscription first | Saved native ChatGPT auth D | Native CLI path tanpa apiKey candidate; verify effective mode | Native-managed auth atau eligible separate OAuth provider | Plan permission D; actual account U |
| Separate API-key billing | Tidak inherent wajib | Tidak inherent wajib; apiKey option ada | Tidak inherent wajib; provider/auth menentukan | Tidak memerlukan Platform API key jika authorized plan route |
| Auth ownership | Official runtime cache/refresh | Delegasi CLI; host dapat inject env/key | Native runtime-managed atau explicit external route | AI Office trusted auth broker owns its registration/tokens |
| Complexity | Rendah process + JSONL | Rendah–sedang Node API | Lebih tinggi bidirectional RPC/lifecycle | Tinggi OAuth/profile/security/renewal |
| Structured events | D JSONL + final schema | D async stream + schema | D notifications/server requests | Responses stream via eligible route; bukan coding events sendiri |
| Approvals | Preset runtime policy; bukan rich callback channel | Exposes policy; host approval callback tidak ada pada API yang diperiksa | Server request/decision channel D | Tidak menyediakan tool approval |
| Cancellation | Host-owned process stop; turn semantics perlu test | AbortSignal D; child-tree stop belum terbukti | turn/interrupt D + host process supervisor | Request cancellation tidak rollback tool effects |
| Resume/recovery | exec resume/session ID D | resumeThread D | thread/resume/history D | Token/session renewal; runtime history tetap terpisah |
| Sandbox settings | Explicit sandbox/config | cwd/sandbox/network/approval/additionalDirectories | Thread/turn settings/config | Tidak menyediakan filesystem isolation |
| Project scoping | Explicit cwd dari host | workingDirectory dari host | Immutable host mapping + per-thread cwd | Client/account/host scope bukan project/task ownership |
| Skills evidence | Native skills documented; untested | Delegates runtime; untested | skills/list/schema documented; untested | Tidak membuat skills compatible/enforced |
| Model/usage | Model selection + JSONL usage | model option/usage fields | model/list + account/rate-limit/usage RPC | Account catalog + error/usage settings; no assumed entitlement |
| Long-running product | Process-per-job, supervision needed | Repeated thread API; lifecycle abstraction | Strongest product fit; direct event/approval integration | Auth lifecycle enabling runtime, not scheduler |
| Initial one-task PoC | Paling kecil jika approvals preset cukup | Kecil tetapi adds package/version coupling | Sedang; preferred jika testing product approvals | Bukan quickest; eligibility/custody/credit gate dahulu |
| Deterministic orchestrator fit | Adapter observes job result | Adapter wraps SDK stream | Best event/control boundary | Auth broker dependency, no competing task authority |
| Important limit | Exit code saja bukan task acceptance | Tidak menyelesaikan child isolation/interactive approval | Bukan OS security boundary; stdio dipilih, hindari unsupported WS deployment | Private eligibility, credit controls, host token isolation unresolved |

A: [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) mendokumentasikan JSONL, output schema, default read-only, cwd/Git guard/resume. `--full-auto` sudah retired. Structured JSON success tidak membuktikan acceptance aplikasi. `exec` memerlukan Git check secara default; future disposable non-Git task boleh mengusulkan documented skip hanya dengan scope Owner, tanpa menjalankan git init.

B: [SDK README](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/README.md) dan [options](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/threadOptions.ts) mendukung `startThread`, `run`, `runStreamed`, `resumeThread`, cwd dan policy options. [Implementation](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/exec.ts) menggunakan child spawn/signal dan JSONL; failure/kill handling bukan proof Windows process-tree containment. Tidak menyamakan TS SDK ini dengan Agents SDK, OpenAI API SDK, atau Python app-server SDK.

C: Current protocol guide juga memperingatkan app-server command dan WebSocket transport sebagai experimental/unsupported untuk production workloads. Rekomendasi ini adalah bounded development evaluation, bukan production sign-off. [App-server protocol](https://learn.chatgpt.com/docs/app-server) memberi stdio JSONL bidirectional JSON-RPC (wire tanpa jsonrpc header), initialize/initialized, thread/turn lifecycle. Pilih satu owned stdio child, bukan membuka raw WebSocket/RPC ke browser. Pinned [request schema](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts) memuat banyak administrative/file/auth methods; host mesti allowlist, tidak pass-through.

D: [OAuth app-server integration](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) mengonfigurasi Responses provider dengan authorized OAuth bearer. Ini tetap Responses HTTP endpoint tetapi **bukan otomatis API-key billing**. App owns refresh; documented env_key setup perlu process restart untuk token baru. Jangan mencampurnya dengan experimental native `chatgptAuthTokens` RPC; compatibility kedua token contract tidak diasumsikan.

## 6. Authentication, eligibility dan credential custody

### 6.1 Native runtime vs independent OAuth

[Native authentication](https://learn.chatgpt.com/docs/auth) membedakan ChatGPT subscription dan API key usage-based. Runtime dapat menyimpan/refresh login sendiri; keyring, file, auto-fallback dan ephemeral storage tersedia. AI Office tidak perlu membaca atau mengekspor native credentials untuk berkomunikasi dengan runtime. Tidak mengusulkan copy/parse auth.json, cookie extraction, unofficial exchange atau sharing satu token ke banyak workers. Actual saved session/mode Owner **UNKNOWN**.

[App-server auth guidance](https://learn.chatgpt.com/docs/app-server#auth-endpoints) mengizinkan continuation untuk existing local/OSS embeddings dan menyarankan migrasi SIWC; native app-server authentication tidak diizinkan untuk commercial/hosted services. Ini tidak dipakai sebagai blanket approval untuk distribusi private/commercial baru. Untuk AI Office Owner-only lokal, permitted-use classification perlu konfirmasi sebelum memilih native path; jangan mengubah model distribusi diam-diam.

Independent OAuth identity scopes `openid profile email` hanya sign-in. Plan use memerlukan permission terpisah `offline_access resource.invoke chatgpt.tokens.use.direct`, PKCE/state/nonce dan validated identity/granted scopes. Direct registration memakai `dynamic_agent_client` sebagai entrypoint, kemudian issued client ID disimpan; stable host ID bukan credential. Flow tetap mendaftarkan client saat sign-in, bukan tanpa registration. Tidak ada client secret/partner API key pada direct public-client procedure. [Registration](https://developers.openai.com/siwc/token-sharing-open-source/sign-in).

Personal-local category memang [disebut resmi](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt); overview mencakup [locally hosted apps](https://developers.openai.com/siwc/token-sharing-open-source), sedangkan quickstart membatasi [selected private clients](https://developers.openai.com/siwc/quickstart). Tidak ditemukan statement bahwa setiap proprietary Owner-only app otomatis eligible tanpa additional approval. Tidak ditemukan juga kewajiban universal mempublikasikan source untuk kategori personal-local. Kesimpulan spesifik: **ACCOUNT-SPECIFIC UNKNOWN / REQUIRES CONFIRMATION**, bukan “harus OSS” atau “semua private diperbolehkan”.

### 6.2 Proposed trusted boundary — belum implemented

Trusted backend/auth broker → trusted official runtime process → separately contained untrusted shell/tools. Browser hanya menerima sanitized account/auth/usage status. Worker project code tidak boleh menerima bearer/refresh token, browser session, AI Office API nonce atau database paths/capabilities. Runtime sendiri memerlukan model access; tool process tidak.

Untuk native path, future isolated runtime profile/auth setup harus Owner-approved dan tidak mengubah shared IDE/CLI session. Jangan menerapkan forced_login_method pada current shared profile sebagai audit check: mismatch dapat logout. Untuk OAuth, token custody di protected host storage dengan registration separation, serialized refresh rotation, revocation/expiry/account-switch handling. [Accounts and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions).

Documented OAuth env_key contoh memberi access token ke app-server child. **Jangan menganggap child environment otomatis aman dari shell descendants**. M02-02 harus memakai dummy canary dan menguji env/argv/log/file/IPC exposure. Jika trusted harness dan untrusted descendants tidak dapat dipisahkan, credential gate **BLOCKED**; pilih isolation/broker architecture lain yang resmi dan diuji, bukan membagikan token.

## 7. Subscription, purchased credits dan included-only policy

Owner melaporkan ChatGPT Pro. Audit tidak memeriksa akun dan tidak menyimpulkan quota tersisa, model access, unlimited usage, subscription sharing eligibility, purchased balance atau approval kredit. [Codex plan documentation](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) menjelaskan native usage; ini bukan bukti account-specific.

| Route / biaya | Documented distinction | Current AI Office status |
|---|---|---|
| Native CLI/IDE ChatGPT | Subscription route; allowance/credits sesuai akun | ACCOUNT-SPECIFIC UNKNOWN; no existing account/session inspection |
| SDK/app-server native | Memakai official runtime auth bila applicable | Mode/permitted embedding/isolated profile perlu bukti |
| Independently authorized SIWC | Separate client grant + plan scope, account/app settings | Eligibility/registration/consent NOT RUN |
| Platform API key | Usage-based Platform billing, terpisah dari plan | **OFF / prohibited fallback** |
| Purchased ChatGPT credits | Dapat melanjutkan supported activity setelah included allowance; bukan Platform API credits | Penggunaan tidak diotorisasi |
| Auto reload | Dapat membeli credits otomatis bila diaktifkan | Tidak diperiksa/diubah; tidak diaktifkan |

[Credits guide](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-personal-plans) menjelaskan included-first, credit balance continuation, dan automatic purchases. Tidak ada API-key fallback tidak sama dengan tidak ada credit spending. Saldo nol snapshot atau polling threshold juga bukan hard cap untuk request yang sedang berjalan/concurrent activity.

**Kontrol yang benar-benar terdokumentasi:** [Using your ChatGPT plan in other apps and sites](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites) menyatakan credit sharing terpisah, off secara default, memerlukan explicit opt-in; saved app limit **di bawah 100%** mencegah app memakai credits. Setting 100% sendiri tidak mengaktifkan credit use. Control credit-use berbeda dari auto purchases, dan persentase cap bukan pool tambahan/reservasi usage.

**INCLUDED-ONLY HARD CAP: NOT VERIFIED untuk deployment AI Office/akun Owner.** Untuk C + eligible D, ada kandidat server/account control yang nyata di atas; perlu bukti authorized app registration tercakup, saved cap <100%, credit sharing OFF, auto reload OFF dan applicable admission/limit behavior. Audit tidak mengubah setting atau membuat request guna membuktikannya. Tidak mengklaim kontrol ini absen; tidak menganggap berlaku pada native Codex route yang tidak mempunyai app registration tersebut.

Fail-closed proposal:

1. Before inference, pilih satu provider/auth route eksplisit; API-key/env-key alternatif, provider substitution, paid model/billing fallback dan credit purchase path ditolak.
2. Eligible D: verify applicable saved account/app controls, dengan lower app cap dan credit sharing OFF. Jika binding/policy tidak observable, pause pending Owner/official confirmation; screenshot warning saja bukan enforcement.
3. Native route: butuh account-level included-only control yang berlaku dan terdokumentasi/terverifikasi; app-specific SIWC cap tidak dapat dipinjam sebagai proof. Jika tidak ada bukti, **jangan jalankan task**, meski quota tampak masih ada.
4. Limit reached → PAUSE new turns; auth/entitlement/permission failure → BLOCK. Tidak retry side-effectful task untuk melewati limit atau membeli credits. Never auto top-up.
5. Internal OFF flag adalah application policy, bukan guaranteed provider billing stop. Selama hard cap belum terbukti, real worker tetap **BLOCKED**.

## 8. Model selection, usage dan quota representation

Manual provider/model selection untuk PoC pertama. SDK `model` option dan app-server `model/list`/thread model fields terdokumentasi. [Pinned ThreadStartParams](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/ThreadStartParams.ts). Tidak hardcode daftar model atau entitlement Pro.

[SIWC models guide](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference) menyediakan account-specific catalog; app-server catalog dapat bundled/cached dan **bukan entitlement check**. Refresh choices ketika account berganti. Hanya authorized completed request membuktikan access untuk request tersebut; tidak mencoba inference pada audit ini.

[RateLimitSnapshot](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/RateLimitSnapshot.ts) mempunyai nullable windows/credits/individualLimit/spendControlReached. [ClientRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts) mendefinisikan account limit/usage reads. Data yang tidak dikembalikan tetap UNKNOWN; token usage bukan persentase remaining allowance atau bukti included-vs-credit billing. Tidak menginfer zero, unlimited, reset time atau real spend dari null/catalog.

Future UI menampilkan model dipilih, verified auth route, observedAt, meter scope dan freshness. Jangan menggabungkan account cap, app cap, token count dan credit balance menjadi satu invented percentage. Missing entitlement → BLOCK; limit → PAUSE; missing quota → UNKNOWN, dan missing safety/billing proof tetap BLOCK. Provider-side reroute observation harus ditampilkan/review jika melanggar allowed model policy; jangan menyamakannya dengan host yang boleh mengganti billing.

## 9. Windows security feasibility

**OFFICIALLY DOCUMENTED**, bukan tested di mesin ini: [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) menyediakan MXC, elevated dan unelevated. MXC direkomendasikan pada compatible device; documented capability rollout mencantumkan 24H2 build 26100.9278 dan 25H2 26200.9278 serta CLI ≥0.162.0 untuk probe. Mesin teramati build 26300.9711/26H2; itu tidak membuktikan required capability/policy atau active implementation. **MXC NOT VERIFIED; probe NOT RUN.**

Windows caveats yang relevan: unelevated tidak mendukung denied-read paths dan network isolation lebih lemah; elevated perlu administrator-approved provisioning. MXC mengizinkan host loopback dan mempunyai child-process lifetime behavior yang perlu diuji. Tidak fallback diam-diam ke unelevated atau full access bila requirements tidak terpenuhi.

[Permissions](https://learn.chatgpt.com/docs/permissions) membedakan read/write/network. Deny-read globs pada MXC/elevated/Linux/WSL dievaluasi saat setiap sandboxed process mulai; newly created matches tidak otomatis diblokir untuk proses yang masih berjalan. Gunakan exact protected roots/subtrees + bounded read allowlist; jangan mengandalkan glob .env sebagai satu-satunya batas. Command proxy bukan global policy untuk model/auth traffic, web search, MCP/apps/browser.

[Approval/security guide](https://learn.chatgpt.com/docs/agent-approvals-security) memisahkan sandbox dari approval. `on-request` mengizinkan tindakan in-sandbox tanpa prompt; **bukan approval setiap command**. Future scope harus menyebut envelope tindakan yang memang sudah disetujui, denied escalation, dan kategori yang memerlukan per-operation consent.

**Host responsibilities (DESIGN PROPOSAL):** protect DB/registry/journal/credentials dan unrelated projects dari read/write; allowlist tool/system paths minimal; block outbound tool traffic, host loopback control API, unauthorized processes, global inherited tools/config/plugins/hooks; track entire owned process tree. Native sandbox tidak otomatis mengisolasi trusted app-server code atau memberikan approved threat model terhadap hostile host user.

M02-02 hanya setelah izin: non-AI disposable denial probes untuk A/B/private roots/canary credentials/junction/hardlink/reparse/children/network, approval protocol tests dan process cleanup. Jika MXC tidak tersedia/adequate, hentikan dan usulkan separately scoped WSL2/VM atau equivalent existing isolated environment. Jangan disable sandbox, mengubah ACL/akun/firewall, install VM/software, atau menambahkan host mounts tanpa approval terpisah. WSL2/container juga harus lulus denied host-mount/secret/network tests; bukan otomatis aman.

## 10. Project binding dan single state authority

**LOCALLY OBSERVED boundaries:**

| Existing component | Evidence / future integration constraint |
|---|---|
| Identity/operation scope | `src/contracts/project.ts:10,25,37`: UUID/schema1/backend ref + generation; schema validity bukan issued capability |
| Workspace manager | `src/server/workspace/manager.ts:55,87,226`: issued immutable attachment; switch/detach revoke foreground bindings |
| State contexts | `src/server/state/service.ts:34,42,52,68`: backend issued WeakSet capability, registry/root/marker/project association; no ambient current DB |
| Storage | `state/storage.ts`, `state/database.ts:45,68`: server-owned UUID DB resolution/header and project-bound queries; no client filename/SQL |
| Current state schema | `state/schema.ts`, `contracts/demo.ts:29,49`: DEMO source/agent/event types; belum real command/attempt/approval journal |
| OFF policy/API | `contracts/policy.ts`, `server/policy.ts`, `server/http.ts:9`: false defaults dan no execution endpoint |
| Launcher | `scripts/dev.mjs:68,86`: fixture-only roots, owned dev processes; inherits environment, bukan future worker secret-sanitizing supervisor |
| Skills | `web/skills/projection.ts`: display filter fresh READY scope; bukan auth/discovery/permission |

**DESIGN PROPOSAL:** kedua route Owner→PM dan Owner→specialist direct command melewati **Command Validation → Policy Gate → Deterministic Orchestrator → Runtime Adapter → Official Codex Runtime**. Direct route tidak memerlukan PM inference rutin. Reasoning tidak memiliki DB/scheduler tandingan.

Future immutable worker lease memuat `projectId, workspaceBindingId, canonicalRoot/worktree ref, taskId, attemptId, commandId, executionPolicyVersion, approvedFilesystemScope, runtimeVersion/hash, account-registration ref, model, billing route`; runtime thread/turn IDs dipetakan sesudah diterbitkan. Tidak berisi credential. Scope dibuat dari root/identity tervalidasi backend, bukan frontend current selection atau runtime-returned path.

Foreground lease M01 **tidak boleh langsung dipakai sebagai worker background lease**, karena sengaja dicabut saat switch. Perlu explicit backend worker-lease issuance/revocation dan scoped state-service access yang direview terpisah; jangan bypass issued-map/WeakSet dengan client-shaped copies. A worker tetap A saat UI B; continue/pause policy harus diputuskan Owner sebelum background dipakai.

Project State Service tetap persistence authority. Runtime rollout/thread history menyimpan conversational context, bukan task acceptance/approval authority kedua. Orchestrator menilai observations lalu commits authoritative transitions/journal melalui state boundary. Contract/schema evolution untuk real events/task attempts adalah prerequisite separately approved sebelum coding; **tidak mengubah DEMO source menjadi real secara paksa**. Markdown Brain tetap untrusted data, approval promotion mengikuti policy, portability/backup gate tetap berlaku.

## 11. Proposed worker lifecycle/event mapping

Nama pada kolom AI Office di bawah adalah **DESIGN PROPOSAL**, bukan contract/API yang sudah ada. RPC names dicek terhadap pinned [ServerNotification](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerNotification.ts), [ServerRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerRequest.ts), [ClientRequest](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts). Terminal payload juga dicek pada [Turn](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/Turn.ts). Semua rows NOT RUN locally.

| Observation / official wire | Proposed AI Office event | Ownership / meaning |
|---|---|---|
| Tidak ada runtime allocation event; host commits attempt | WorkerAllocated | Host synthesis, setelah policy+lease+journal |
| Host spawn/owned PID | RuntimeProcessStarting | Host observation; spawn bukan session ready |
| initialize result lalu initialized; thread/started | RuntimeSessionEstablished / RuntimeThreadBound | Host memverifikasi handshake/thread mapping |
| turn/started | WorkerTurnStarted | Runtime observation terikat thread/turn/attempt |
| item/started, type commandExecution | CommandObserved | Pending/proposed/action observation; bukan izin universal |
| item/commandExecution/requestApproval | ApprovalRequested | Server request; host scope/digest/policy validation |
| item/fileChange/requestApproval | FileApprovalRequested | Server request; validasi target path/changes |
| item/permissions/requestApproval | PermissionEscalationRequested | Host menolak out-of-envelope; izin tidak otomatis |
| Host decision response; serverRequest/resolved | ApprovalGranted / ApprovalDenied / ApprovalResolved | Granted/denied dari host journal; resolved sendiri tidak membuktikan granted |
| item/completed, type fileChange + status | FilesystemChangeObserved | Periksa outcome; tidak mencakup semua writes oleh shell |
| item/agentMessage/delta; item/commandExecution/outputDelta | WorkerOutputObserved | Untrusted streamed text/output, disanitasi |
| turn/completed, status completed | WorkerTurnSucceeded / ValidationRequired | Belum task accepted; perlu output/tests/allowed diff |
| turn/completed, status failed; error | WorkerTurnFailed | Simpan sanitized typed failure; no fallback |
| turn/completed, status interrupted | WorkerTurnInterrupted | Bukan rollback shell side effects |
| Host cancel command; turn/interrupt request | CancellationRequested | Request ≠ acknowledgement semua descendants berhenti |
| Host process exit / owned-tree termination result | RuntimeProcessTerminated | Exit ≠ successful task; unexpected exit memicu reconcile |
| Transport lost / terminal evidence absent | ReconciliationRequired | Host synthesis; jangan auto-dispatch attempt baru |
| thread/resume result | RuntimeContextRestored | Restore context, bukan proof command belum pernah berjalan |

CLI/SDK memakai dotted event names seperti `turn.completed`, berbeda dari app-server `turn/completed`; parse dengan adapter/version-specific schema. Jangan mengarang protocol `task.completed` atau menganggap item/command exit 0 sebagai task completion. [SDK event definitions](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/sdk/typescript/src/events.ts).

Normalized envelope proposal: project/task/attempt/lease/thread/turn/item/request IDs, source, native method/status, runtime version, policy version, observedAt, available occurredAt, ordering/dedup reference, sanitized evidence ref. `source=real` hanya untuk observations runtime yang benar-benar dijalankan; host synthesis ditandai separately. Synthetic protocol tests bukan real execution. Worker yang membuat frontend memakai applicationDataSource=mock tetap real worker event; current persisted DEMO events tetap demo.

## 12. Approval, cancellation dan recovery

Per-operation command/file decision channels documented pada [request schema](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/ServerRequest.ts) dan [approval decisions](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/CommandExecutionApprovalDecision.ts). Host proposal memakai single-operation accept atau decline/cancel, menolak session-wide grants/policy amendments/network expansion yang tidak berada pada approved envelope. Tidak auto-approve dari UI state, PM prose, timeout atau reconnect. Kebijakan native mungkin tidak meminta setiap action; test coverage wajib membuktikan kategori yang dipersyaratkan.

Future minimum approval record: request ID + process/connection epoch, immutable attempt/thread/turn/item refs, canonical target/command digest, policy version, expiry dan decision. Timeout/late response/account switch/attempt cancel → revoke/deny. Persist intent sebelum response; jika response lost sesudah send, reconcile, jangan kirim decision lintas request lain. Evidence output tidak memuat token atau unrestricted command payload.

[Interrupt params](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/TurnInterruptParams.ts) mengikat threadId dan turnId. Graceful interrupt ditunggu sampai terminal status, lalu bounded owned process-tree teardown jika perlu. Stdio EOF/child kill bukan proof subprocess tidak menulis lagi; cancellation effectiveness perlu non-AI canary/process tests dan later actual turn test. Tidak ada generic shutdown RPC yang diasumsikan; documented turn interrupt ditambah host-owned lifecycle.

Recovery proposal: durable attempt intent → runtime thread/turn mapping → observations/decisions → terminal result → validation/acceptance. Unique command/attempt IDs dan dispatcher lease mencegah start ulang; runtime IDs bukan idempotency key untuk arbitrary shell side effect. Setelah crash, nonterminal/unknown attempts masuk RECONCILIATION_REQUIRED, baca history/inspect allowed files, verifikasi subprocess cleanup dan side-effect ledger sebelum Owner-approved resume/new attempt. Resume conversation tidak membuktikan command terputus belum berjalan. Tidak ada klaim exactly-once runtime.

Minimal cancel/uncertain-failure/dedup protection harus ada **sebelum** first coding task. M02-04 boleh memperluas fault matrix, tetapi tidak menunda keselamatan minimum sampai sesudah PoC.

## 13. Skill feasibility dan enforcement boundary

[Build skills](https://learn.chatgpt.com/docs/build-skills) mendokumentasikan SKILL.md dengan name/description, optional scripts/references/agents metadata, explicit/implicit invocation, project .agents/skills dan user/admin/system roots. Codex dapat mengikuti symlink skill folder; M01 Brain/marker symlink rejection bukan global policy skill runtime. `allow_implicit_invocation=false` tidak memblokir explicit invocation.

[skills/list params](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/SkillsListParams.ts) mendukung cwds/forceReload; [skills config write](https://raw.githubusercontent.com/openai/codex/rust-v0.162.1/codex-rs/app-server-protocol/schema/typescript/v2/SkillsConfigWriteParams.ts) menyediakan path/name enable setting. List/cache signal hanya discovery evidence; current docs/schema drift harus diverifikasi pada chosen build. Disable configuration bukan bukti file/script tidak dapat dibaca/dijalankan lewat shell lain.

M01 `SkillMetadata` belum menyimpan provenance/revision/license/descriptions atau actual session proof, dan session availability/enforcement literal UNKNOWN/NOT_VERIFIED. **Assigned != Installed != Discovered != Compatible != Available != Allowed != Enforced.** Tidak ada documented AI Office per-agent assignment enforcement otomatis. Usulkan dedicated bounded skill roots/deny unwanted scripts dan runtime/OS policy, bukan prompt-only allowlist. Per-agent session-level enforcement **NOT VERIFIED**; tidak mengklaim unsupported total jika documented controls hanya belum diuji.

PoC pertama direkomendasikan **skills OFF**, termasuk implicit discovery dari global/project configuration yang tidak diotorisasi; kemampuan menonaktifkan entire effective skill exposure perlu dibuktikan, jangan berasumsi empty metadata panel berarti runtime empty. No discovery/installation/execution dalam audit.

## 14. Recommendations, unresolved conditions dan Owner decisions

**Primary:** C owned stdio product boundary; prefer eligible D jika personal-local eligibility dan server/account included-only controls dapat dibuktikan. Native-managed ChatGPT auth hanya kandidat jika official permitted-use dan billing isolation sesuai deployment; jangan memakai shared IDE login sebagai workaround.

**Fallback:** A exec JSONL untuk satu approved task dengan preset permissions, same billing/credential/containment gates dan owned process supervisor. B adalah alternatif ergonomi Node, bukan cara melewati approval/security gates. Tidak ada fallback ke API key, provider lain, unsupported WebSocket hosting, dangerous full-access atau proprietary OAuth token extraction.

| Condition | Current classification / effect |
|---|---|
| Official runtime surface tersedia | OFFICIALLY DOCUMENTED; local handshake/protocol NOT VERIFIED |
| Owner Pro/remaining quota/models | ACCOUNT-SPECIFIC UNKNOWN |
| Personal-local/private SIWC classification | Kategori documented; AI Office eligibility UNKNOWN / REQUIRES CONFIRMATION |
| Commercial/hosted use native app-server auth | UNSUPPORTED / explicitly not permitted by auth guidance; do not generalize Owner-only app into hosted product |
| API key / purchased credit fallback / auto top-up | BLOCKED by Owner policy |
| Included-only actual deployment hard stop | NOT VERIFIED; real worker BLOCKED |
| Credential isolation and Windows negative tests | NOT VERIFIED; real worker BLOCKED |
| Real event/journal/worker lease/cancel/dedup | NOT IMPLEMENTED / NOT RUN; prerequisite separate bounded changes |
| Skill execution/enforcement | NOT VERIFIED; keep OFF |
| Valuable data and backup | BLOCKED; remain disposable |
| Full multi-provider/parallel/3D | Outside scope, not a solution to blocked gates |

Owner decisions next: confirm personal-only local vs distribution intent without assuming publication; select runtime candidate/version and auth route to investigate; approve precisely bounded M02-02 security-only tests/paths/output changes; decide whether separate OS environment is permitted if native containment fails; later authorize account/settings verification separately. Tidak perlu membuka account secrets untuk menyelesaikan laporan ini.

## 15. Change safety dan handoff

Initial hashes mencakup **81 existing AI-Office files di luar node_modules**, termasuk seluruh source/config/tests/lockfile, prior reports dan artifacts; 647 Hermes tracked files di-hash terpisah. Pemeriksaan akhir harus mempertahankan semuanya dan hanya menambahkan dua approved reports (final inventory 83). Selected baseline SHA-256 di bawah; comparison dilakukan per absolute path/hash untuk seluruh 81, bukan hanya selection.

**Hasil final comparison:** 81/81 existing AI-Office files identik; inventory 81 → 83, dengan hanya dua laporan M02-01 baru. Seluruh 647/647 Hermes tracked hashes identik, HEAD/status Git tetap sama, dan AI-Office .git tetap tidak ada. Tidak ada artifact/test/source changes.

| Existing file | SHA-256 baseline / unchanged |
|---|---|
| `package.json` | `E173A3B93F9619D5269DE8E3E1822145A6B918BFE08A51519966681C2230104B` |
| `package-lock.json` | `B1AE0F2D54B7DF3C303B3C442E2854E8A5EAECAF2C0FB2D719303D0A4B5A1926` |
| `src/contracts/project.ts` | `432B34815B9F7D16419C105C0FD35AB21AE001C01D8B75F9DE7FAEA6EEC0D122` |
| `src/contracts/policy.ts` | `D7FE14BF0FA1840FA745110818A0C4AC317071F86E73BAAB2737484A3310217D` |
| `src/contracts/demo.ts` | `B913A5AFC42A78C1B917DDE4BCB0AD4A68FAD75CFC1EF3C47634F0D8A5EDDC2F` |
| `src/contracts/capabilities.ts` | `0BC98CCDB4DBCCB3AC7A5F1529A700BCF16E8A757A8B0D6470C1F7C07DCA099D` |
| `src/server/workspace/manager.ts` | `52D21042421169293449835F0A2E3B3BE1A79620EF54803E92BFECBECE8D2158` |
| `src/server/state/service.ts` | `BD70BD262CB38DA2D7669B074DE3080508D419753143D7CAB0DDE38F9C6BDC6E` |
| `src/server/state/schema.ts` | `FE2A7BAFAE61B54971F702870A1AD0D28CA49B4828505FAE6829EE5990820790` |
| `src/server/http.ts` | `4B10E968A3FE541684BF0A563515474963C7C81DAA63486425F0DBF02DD89081` |
| `src/server/policy.ts` | `D48ECE07F657A291A0A87F9C54579CD688D2C4EDF1B389560BB499A6E5B1CE2A` |
| `scripts/dev.mjs` | `0AEC9440673E60B5CCA567C10676568D6000EA68705718D901C62BD75A569DA2` |
| `docs/AI_OFFICE_CURRENT_BASELINE.md` | `3B23F3F93BBA9E94532E684E51CD904C6145AE200F4FEBB91196B855F8E72E2D` |
| `docs/roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md` | `5A2846287BD067EBB71ED523C2138B553D430E11CF47DCE693E0B76706BAA333` |
| `docs/reviews/M01-07_FOUNDATION_ACCEPTANCE_REPORT.md` | `92F65D94F1632D4A8AF1A66E1B44CFE2B701DC9CCE706BEF67F3778E1921AAC5` |
| `docs/reviews/M01-07_M02_GATE_MATRIX.md` | `BF4C2FF8DFE9FE1357D6A38B89452F2E4957BA835430F925EE3641E0FC863FD8` |

Hermes pre-existing modified lockfile dipertahankan; hash `7D34B1EE8CE3B260292AB45A53C27BEAF2741E2EED8CEBC53E064E94271BCB27`. Scope verifikasi Hermes hanya tracked contents + HEAD/status; tidak mengklaim hash node_modules/untracked/.git atau external Visual Lab cloud.

Tidak mengubah source/contracts/routes/dependencies/lockfiles/approved documents/ACL; tidak initialize project state/Git; tidak menjalankan provider login/logout/OAuth registration, additional inference/worker, paid calls atau installed skill scripts. Public documentation GET requests bukan provider connection untuk execution. Tidak membaca tokens, credential stores, cookies, existing sessions atau valuable user project content. Tidak memanggil Visual Lab. Normal audit session ini bukan additional AI Office-controlled runtime.

Outputs hanya laporan ini dan [Next PoC Gate Plan](M02-01_NEXT_POC_GATE_PLAN.md). M02-02 tetap menunggu Owner review dan scope terpisah.

**M02-01 FEASIBILITY COMPLETE — READY FOR OWNER REVIEW OF M02-02 SECURITY GATES.**

