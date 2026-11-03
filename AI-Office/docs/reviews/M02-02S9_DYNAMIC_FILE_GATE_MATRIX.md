# M02-02S9 — Dynamic File Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Companion: [Future-File Timing Report](M02-02S9_FUTURE_FILE_TIMING_REPORT.md). Decision: **Gate R-A**; no runtime experiment.

## 1. S9-01 through S9-43

`HOST_VERIFIED` di bawah terbatas pada inspected files/source/metadata dan tindakan sesi; bukan kernel atau production-runtime proof. Tidak ada gate baru `OS_VERIFIED` atau `TIMING_VERIFIED` pada S9.

| Gate | Requirement | Status | Evidence / boundary |
|---|---|---|---|
| S9-01 | Existing Codex 0.164.0 identity | HOST_VERIFIED | Retained S4 hash/inventory cocok; main Authenticode Valid/OpenAI. Tidak menjalankan CLI. Report A §9. |
| S9-02 | Active Codex preserved | HOST_VERIFIED | 50 package-file SHA-256 before/after; terpisah dari candidate. Report A §24. |
| S9-03 | Node executable identity | HOST_VERIFIED | Node 24.21.0 metadata; hash dan Valid/OpenJS signature, Report A §9. |
| S9-04 | S8 policy examined | HOST_VERIFIED | Exact retained config, workspace binding, inherited constructor dan managed metadata ditinjau. |
| S9-05 | Actual deny-read glob inventory | HOST_VERIFIED | 10 explicit FS entries: 8 deny/1 minimal read/1 workspace write; 0 glob. Parent constructor tidak menambah deny-read glob; bukan full effective dump. |
| S9-06 | Glob dependency relevance | NOT APPLICABLE | R-A; tidak ada current relevant glob-only dependency pada inspected policy/design. |
| S9-07 | Explicit-directory protections assessed | HOST_VERIFIED | B/private/fake-credentials/home/evidence explicit deny. Future-file behavior tidak diuji. |
| S9-08 | Future credential placement risk assessed | DOCUMENTED_RISK | Future glob-only secrets di readable A tidak dapat dijadikan sole boundary. Custody belum dibuktikan. |
| S9-09 | Runtime experiment necessary | NOT APPLICABLE | Tidak diperlukan; R-A melarang MXC launch dan synthetic glob experiment. |
| S9-10 | Fresh synthetic fixture | NOT APPLICABLE | Tidak ada S9 root atau canary dibuat. |
| S9-11 | Strict profile preserved | HOST_VERIFIED | S8 config SHA-256 tidak berubah; tidak membuat replacement profile. |
| S9-12 | No broad grants added | HOST_VERIFIED | Tidak ada policy/config mutation atau extra workspace/temp grant. |
| S9-13 | Managed configuration preserved | HOST_VERIFIED | Metadata known locations diperiksa tanpa write/disable; tidak ada S9 invocation. Visibility tetap parsial. |
| S9-14 | Network disabled | HOST_VERIFIED | Retained profile enabled=false; tanpa network test. Bukan general egress verification. |
| S9-15 | Normal-user baseline | NOT RUN | Tidak ada S9 runtime controls. |
| S9-16 | Preexisting glob canary validated | NOT APPLICABLE | Tidak ada applicable glob atau P02. |
| S9-17 | Future canaries absent before launch | NOT APPLICABLE | Tidak ada fixture, canary atau launch. |
| S9-18 | One MXC launch ceiling | HOST_VERIFIED | 0 launches, maksimum 1; R-A mengotorisasi 0. Tidak ada retry. |
| S9-19 | Sandbox bootstrap | NOT RUN | Tidak ada MXC/Node sandbox start. |
| S9-20 | Allowed Project A read | NOT RUN | Hasil existing A historical bukan rerun S9. |
| S9-21 | Preexisting glob read denied | NOT RUN | Tidak ada read atau permission error S9. |
| S9-22 | READY before future-file creation | NOT APPLICABLE | Tidak ada READY, creation atau handshake. |
| S9-23 | Host creation order verified | NOT APPLICABLE | Tidak ada host controller atau P03–P05. |
| S9-24 | Future ordinary control read | NOT RUN | Tidak ada P04 read. |
| S9-25 | Future glob-matching file read | NOT RUN | Tidak ada P03 read. Documented risk bukan observed result. |
| S9-26 | Future explicit-denied-directory read | NOT RUN | Tidak ada P05 read; existing B denial tidak membuktikan timing. |
| S9-27 | Timing evidence valid | NOT APPLICABLE | Tidak ada runtime timing claim; audit timestamps bukan sandbox ordering proof. |
| S9-28 | Unexpected broad access absent | HOST_VERIFIED | Terbatas pada unchanged configuration dan tidak adanya S9 access experiment. Tidak membuktikan seluruh OS access space. |
| S9-29 | Process cleanup | NOT APPLICABLE | Tidak membuat experimental process/listener; tidak ada kill/cleanup diperlukan. |
| S9-30 | Fixture integrity | NOT APPLICABLE | Tidak ada S9 fixture. Retained historical integrity diaudit terpisah pada Report A §24. |
| S9-31 | Existing source unchanged | HOST_VERIFIED | Per-path SHA-256 sebelum/sesudah, 125 existing files; hanya 2 report baru. |
| S9-32 | No Windows security modifications | HOST_VERIFIED | Tidak ada ACL/firewall/Defender/UAC/elevation command; bukan exhaustive state attestation. |
| S9-33 | No provider login/inference | HOST_VERIFIED | Tidak ada auth, app-server, codex exec, model call atau worker. |
| S9-34 | No paid API/credits | HOST_VERIFIED | Tidak digunakan/diaktifkan; bukan proof billing hard cap. |
| S9-35 | Credential custody | NOT VERIFIED | Tidak membaca actual secrets; synthetic private paths bukan real custody proof. |
| S9-36 | Hostile process lifecycle | NOT VERIFIED | Tidak menguji detached/hostile descendants, crash atau forced-tree cancellation. |
| S9-37 | Public network egress | NOT VERIFIED | Tidak ada public/DNS/LAN/IPv6/UDP/proxy test; S7/S8 loopback scope saja. |
| S9-38 | Codex app-server readiness | NOT VERIFIED | Tidak ada protocol/adapter/tool/thread/turn integration. |
| S9-39 | Runtime approval/cancellation | NOT VERIFIED | Tidak ada actual approvals/interrupt/cancel-race validation. |
| S9-40 | Durable lease/recovery | NOT VERIFIED | Host fixture authority/atomic issuance bukan production durable lease/recovery. |
| S9-41 | Subscription entitlement | NOT VERIFIED | Account eligibility UNKNOWN; tidak ada account query/login. |
| S9-42 | Included-only billing protection | NOT VERIFIED | Paid API/credits OFF tidak membuktikan provider-enforced cap/fallback exclusion. |
| S9-43 | Real worker activation | BLOCKED | Lifecycle, custody, runtime/state, account dan billing acceptance belum terpenuhi. |

## 2. Actual glob dependency status

**POLICY GLOB DEPENDENCY NOT IDENTIFIED.** Exact selected profile: `ai-office-s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8`. Retained config SHA-256 `B1D282CB0CBFB88CBFDC9C06CD99F8700B9BC83D34C69F18BDE5FC518D1F5CA5`. Source/design audit dan exact path bindings terdapat di Report A §§5–7. Tidak ada invented `*.env` dependency atau actual secret-file discovery.

## 3. Documented upstream behavior

[OpenAI Docs permissions](https://learn.chatgpt.com/docs/permissions) dan [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) mendokumentasikan startup enumeration untuk deny-read globs, dengan kemungkinan file matching baru tetap readable selama process lifetime bila grant lain mengizinkan. [Pinned resolver](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/windows-sandbox-rs/src/deny_read_resolver.rs) dan [MXC policy](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) diperiksa terpisah dari later documentation; lihat Report A §3. Exact denied roots dipisahkan dari expanded existing matches.

**DOCUMENTED LIMITATION != OBSERVED OS FAILURE.** S9 tidak mengamati glob bypass atau exact-directory containment failure.

## 4. Runtime-test relevance

**R-A: NO MXC EXECUTION AUTHORIZED OR NEEDED.** Relevant nonredundant glob di otherwise-readable location tidak ditemukan. R-B tidak terpenuhi. Selected profile dan workspace binding cukup jelas untuk relevance decision; partial effective-policy visibility tetap diakui. Tidak membuat profile/glob untuk memaksa eksperimen. R-C tidak diperlukan untuk scoped conclusion ini.

## 5. Exact tested profile

**Tidak ada profile yang diuji pada S9.** Retained S8: `sandbox="mxc"`, `extends=":workspace"`, root/tmpdir/slash_tmp deny, minimal read, A-only workspace write, B/private/fake-credentials/home/evidence deny, `network.enabled=false`. Config unchanged; tidak ada invocation, unmanaged fallback, additional workspace atau broad user/Temp/drive grant.

## 6. Host baseline and sandbox comparison

**NOT RUN.** Tidak ada P01–P05 atau normal-user versus sandbox read comparison S9. Host hashing/signature checks bukan canary baseline. S8 comparison tetap historical dan tidak dipakai sebagai future-file result.

## 7. Timing confidence

**NOT APPLICABLE** untuk experimental ordering, **NOT VERIFIED** untuk runtime future-file protection. MXC launches 0; READY/GO/creation/read/exit timestamps tidak ada. Tidak ada `TIMING_VERIFIED` atau monotonic timing receipt yang dibuat.

## 8. Explicit-directory enforcement status

Explicit B/private/fake-credential rules **HOST_VERIFIED sebagai policy**. Existing-file denial telah diamati secara terbatas pada S5R2/S6/S8. Future-file creation di explicit-denied subtree **NOT RUN** pada S9. Static subtree intent tidak dinaikkan menjadi `EXPLICIT_DIRECTORY_FUTURE_FILE_DENIAL_OBSERVED`.

## 9. Inconclusive properties

Relevance assessment selesai sebagai R-A, bukan failed/inconclusive runtime experiment. Future-glob read, future ordinary read, future explicit-denied-directory read, lifetime refresh dan full merged policy **belum diverifikasi**. Tidak ada runtime observation untuk diklasifikasikan ALLOW/DENY. Ketiadaan hasil ini tidak disembunyikan sebagai successful timing validation.

## 10. Credential-protection architectural requirements

Real secrets tidak boleh hanya dilindungi filename glob di workspace readable. Credential dan authoritative private state memerlukan host/backend-owned storage di luar worker readability, authorization per project, task-scoped approved inputs, serta eventual broker mediation. Environment, argv, IPC, logs, exports dan transient files termasuk review custody. Jangan menyalin provider auth ke workspace atau menganggap logical `.ai-office` otomatis private. Globs supplementary saja. Ini rekomendasi; S9 tidak mengubah custody atau mengaktifkan broker.

## 11. Filesystem containment status from previous milestones

[S5R2](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md): 12 direct Node filesystem operations, 2 approved allow dan 10 forbidden deny. Bounded existing synthetic paths saja. Host-only [runtime-security harness](M02-02_SECURITY_HARNESS_REPORT.md) memeriksa binding/authorization, bukan kernel enforcement. S9 tidak menjalankan ulang unit tests atau containment probes dan tidak memperluas historical claim ke semua mutation/race/future-file classes.

## 12. Child-process confinement status

[S6](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md): satu cooperative child, 7 scoped FS operations, 2 allow/5 deny. [S8](M02-02S8_CHILD_NETWORK_INHERITANCE_REPORT.md): cooperative child A allow/B `EPERM`, parent/child identity dan normal exit terkorrelasi. Bukan hostile descendant, detached process, persistence atau forced cancellation proof. Tidak ada S9 child/grandchild.

## 13. Network confinement status and limitations

S7 satu parent loopback attempt denied; S8 parent dan cooperative child ditolak pada satu reachable literal IPv4 TCP endpoint. Normal-user baseline mencapai listener. **PUBLIC INTERNET EGRESS STILL NOT VERIFIED.** DNS/LAN/IPv6/UDP/proxy/provider dan production services tidak diuji. S9 tidak membuat listener atau network probe; source-research web retrieval bukan experimental egress result.

## 14. Hostile process lifecycle readiness

**NOT VERIFIED / NOT RUN.** Process ownership, cancellation under race, forced descendant cleanup, orphan prevention, foreground crash dan restart semantics belum memenuhi production acceptance. Historical cooperative exits bukan pengganti. Tidak ada hostile/detached test di S9.

## 15. App-server protocol readiness

**NOT VERIFIED / NOT RUN.** Tidak ada official adapter, thread/turn/tool events, completion acceptance atau app-server startup pada S9. Official sandbox CLI feasibility tidak membuktikan end-to-end coding runtime readiness. Skills discovery/execution dan runtime permission bridge tetap belum diverifikasi.

## 16. Approval/cancellation readiness

**NOT VERIFIED.** Tidak ada actual runtime approval, interrupt, cancel, cancel-completion race atau tool authorization acceptance. Metadata/policy dan normal process exit tidak membuktikan fungsi tersebut.

## 17. Durable attempt lease/recovery

**NOT VERIFIED untuk production.** Fixture-only stable project binding dan atomic synthetic issuance tetap historical. Belum ada proof durable worker lease, dispatch deduplication, state transition atomicity, restart reconciliation atau crash recovery. Tidak ada schema/database/source mutation pada S9.

## 18. Account eligibility

**NOT VERIFIED; eligibility UNKNOWN.** Tidak ada login, authentication-state import, subscription/model entitlement query atau inference. Installed binaries dan subscription-first design tidak membuktikan account access aktual.

## 19. Included-only billing protection

**NOT VERIFIED.** Paid API dan purchased-credit fallback tetap OFF; tidak ada fallback atau provider usage. Zero usage bukan proof included-only hard cap. Entitlement, auth, runtime authorization dan billing enforcement harus diterima terpisah sebelum aktivasi worker.

## 20. Real worker activation decision

**BLOCKED.** S9 menutup relevance question, tidak mengaktifkan coding worker, app-server atau integration. Custody, public egress, lifecycle, approvals/cancellation, durable recovery, skills, account dan billing acceptance tetap terbuka.

**HOST VERIFIED != OS VERIFIED != RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 21. One recommended next technical milestone

**M02-02S10 — Worker Process Lifecycle, Cancellation and Recovery Feasibility.** Usulan non-AI/synthetic untuk ownership, timeouts, graceful/forced cancellation, child accounting, orphan prevention, restart, durable attempts, crash reconciliation dan fail-closed binding. Ini rekomendasi saja; tidak dimulai otomatis dan tidak mengotorisasi production changes.

## 22. Owner authorization requirements

Owner perlu memberi arahan terpisah untuk bounded S10, termasuk process-control mechanism, artifact/write scope dan acceptance criteria. S9 sendiri sudah diotorisasi dan selesai tanpa permintaan permission tambahan. Approval laporan tidak berarti izin M02-03, app-server, provider auth, broker, actual credential handling, paid API/credits atau real coding workers; semuanya memerlukan tahap/otorisasi tersendiri.

Source/artifact preservation, 10 retained-root inventories, candidate/S8 hashes dan exact new-file accounting ada pada Report A §§9,23–24. Tidak ada S9 fixture/process yang perlu cleanup. Tepat dua report ditambahkan; historical evidence dipertahankan.

**M02-02S9 COMPLETE — NO CURRENT GLOB-ONLY SECURITY DEPENDENCY IDENTIFIED — DOCUMENTED FUTURE-FILE LIMITATION RECORDED — NO MXC LAUNCH — REAL WORKER BLOCKED.**
