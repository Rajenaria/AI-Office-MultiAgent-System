# M02-02R — OS Containment Test Plan

Tanggal: 29 Oktober 2026. **DOCUMENTATION-ONLY PROPOSAL**, bukan authorization atau implementation. Companion: [Security Closeout](M02-02R_SECURITY_CLOSEOUT.md).

## 1. Executive recommendation

Usulkan **M02-02S — Windows OS Containment Validation**, memakai ordinary direct IO dari fixed non-AI probe. **Jangan mulai sekarang.** Priority sebelumnya adalah bounded **M02-02R1 — Atomic Synthetic Attempt Issuance**, karena source finding R01 membuat host acceptance tetap CONDITIONAL.

Setelah R1 direview, candidate pertama yang layak dinilai adalah explicit native MXC **hanya jika sudah tersedia**, tanpa install/elevation/setup dan tanpa fallback. Ini bukan kesimpulan bahwa MXC tersedia atau cukup aman di mesin Owner. Jika capability, denied-read/private-state/network boundary atau owned-tree guarantee tidak dapat dibuktikan dengan aman, hentikan dan minta separately scoped alternative. Tidak menurunkan acceptance criteria agar candidate lulus.

AI Office tetap aplikasi personal-local standalone. VM/container, bila kelak dipilih, hanya optional worker security boundary; frontend, state authority dan arsitektur aplikasi tidak dipindahkan ke Hermes3D/framework lain.

## 2. Actual Windows prerequisites

Read-only audit: Windows 11 **Home Single Language**, x64, build `26300.9711`, DisplayVersion `26H2`; RAM ~7.33 GiB, hypervisor present dan firmware virtualization terlapor aktif. Build number dan hypervisor presence **tidak membuktikan MXC support**, installed sandbox tooling, effective policy atau ability to create an isolated process. Native binaries/features/profile access belum diuji. Tidak memeriksa account credentials atau mengubah optional features.

Windows Sandbox tidak didukung pada Home; native Hyper-V role juga tidak tersedia pada Windows Home. Maka keduanya bukan immediate no-change path pada edisi teramati. Jangan melakukan edition workaround, registry bypass, feature installation atau elevation dalam S tanpa permission terpisah. [Windows Sandbox requirements](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/), [Hyper-V requirements](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-hyper-v).

## 3. Current official evidence

Sumber diakses 29 Oktober 2026; official documentation adalah documented capability, bukan local verification. URLs lama `developers.openai.com/codex/...` saat audit mengarah ke ChatGPT Learn; existing reports tidak ditulis ulang untuk redirect ini.

Dokumentasi Codex membedakan `mxc`, legacy `elevated`, dan `unelevated`. MXC memerlukan native capability; explicit selection gagal bila unavailable/policy-blocked, sedangkan preference dapat fallback. Legacy elevated memerlukan administrator setup; unelevated tidak mendukung denied reads. MXC mempunyai caveat host loopback dan child lifetime; deny-read glob matching mengikuti process-start snapshot. **Jangan menyamakan build tinggi dengan support atau profile preference dengan enforcement yang pasti.** [Official Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox).

Permission profile menentukan filesystem/network scope; approval policy merupakan kontrol tersendiri. Scope readable/writable/denied harus dipastikan efektif, termasuk files baru sesudah start. Host approval revoke tidak otomatis mencabut kernel rights/handles yang sudah dimiliki process. [Permissions](https://learn.chatgpt.com/docs/permissions), [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security).

Official app-server menyediakan stdio JSONL sebagai default. Itu hanya dasar proposal transport future adapter; tidak membuktikan bahwa adapter, full trusted runtime process, authentication atau tools telah terisolasi. [App-server transport](https://learn.chatgpt.com/docs/app-server).

Microsoft AppContainer membatasi resource menurut identity/capabilities, tetapi broad read restrictions perlu dirancang; launching Win32 AppContainer/LPAC memerlukan native process attributes/token/profile handling. Ini bukan kemampuan yang otomatis didapat dari Node `fork`. [AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation), [AppContainer launch](https://learn.microsoft.com/en-us/windows/win32/secauthz/implementing-an-appcontainer).

Job Objects dapat mengikat lifetime melalui kill-on-last-handle-close; breakaway/nesting/handle inheritance menentukan cakupan. Job sendiri bukan read/write/network sandbox. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [Nested Jobs](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs).

## 4. Candidate comparison — documented vs proposed

Semua local enforcement cells di bawah **NOT VERIFIED**. Operational/compatibility conclusions berlabel inference/design, bukan hasil eksperimen.

| Candidate | Availability / setup | Read/write/network capability | Process / credential limitation |
|---|---|---|---|
| Official Codex Windows sandbox | Existing installed package pada M02-02 dilaporkan 0.162.1; support/capability belum diperiksa. Explicit candidate gate, no setup now | Lihat official profile/implementation distinctions di section 3; actual denial matrix wajib | Tool-command boundary tidak otomatis mengisolasi trusted app-server/auth process; probe harus memakai empty synthetic profile dan no credentials |
| Windows Sandbox isolated environment | Home tidak supported; supported edition/feature provisioning would need separate approval | Separate guest; map hanya fixture input RO dan explicit output RW; disable network/clipboard/device sharing menurut approved config | Host mappings adalah exposure; guest disposal bukan rollback output host. No host credential/profile mappings |
| Dedicated restricted identity + AppContainer/LPAC + lifetime control | No identity/native launcher provisioned or verified. Account/profile/ACL/policy/native tooling changes need separate approval | Different user saja tidak menjamin denial terhadap broadly readable files; SID/DACL/capabilities dan network rules harus tested | Inherited handles/tokens/brokers bisa membuka akses. Child restrictions dan kernel ownership harus verified, bukan hanya reduced privilege label |
| Dedicated local VM | Existing VM availability unknown. Native Hyper-V role unsupported on observed Home; other virtualization stack tidak dipilih/diinstall | Design: guest-only disposable disks, no host shared profile/drives, controlled exports, disconnected network awal | Full guest boundary lebih berat; shared folders/clipboard/guest-agent channels tetap exposure. Host/guest lifecycle perlu owned accounting |
| Containers, bila supported | Windows container host requirements menyebut Pro/Enterprise/Server; observed Home bukan verified supported native host | Process isolation berbeda dari hypervisor isolation; mounts/network config menentukan akses | Jangan pakai label container sebagai proof hostile-code boundary; runtime/engine/admin service dan image provenance tambahan |

Windows Sandbox configuration mengatur networking dan read-only mapped folders; default networking/clipboard sharing perlu ditinjau eksplisit. [Sandbox configuration](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file).

Windows access control memakai identity/SID dan permissions/inheritance; ordinary different account perlu actual denied-read/write proof. [Access control](https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/access-control).

Windows container host/platform prerequisites dan Hyper-V role harus dipenuhi; Microsoft membedakan shared-kernel process isolation dari hypervisor boundary untuk hostile workloads. [Container requirements](https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/system-requirements), [Container security](https://learn.microsoft.com/en-us/virtualization/windowscontainers/manage-containers/container-security).

### Operational comparison — design inference

| Candidate | App-server / event observation | Private SQLite / identity protection | Cost, performance dan recovery |
|---|---|---|---|
| Native sandbox | Future owned stdio mungkin paling sedikit bridge; no handshake now | Pin project/attempt/epoch; trusted host state tetap di luar tool scope; runtime's own privilege tetap separate question | Lowest expected integration overhead, belum benchmark; inspect observed terminal/tree state and reconcile, no blind resend |
| Windows Sandbox | Would need approved narrow event transport/export; no native cross-guest stdio claim | Never map real DB/credentials; canonical host project identity map ke guest fixture ref | Guest startup/resource cost; ephemeral state must export journal evidence before disposal |
| Restricted identity/AppContainer | Native helper must preserve pipe ACLs and avoid inherited privileged handles | Host owns UUID→approved-root mapping; worker cannot open DB or approval store | Low expected steady-state overhead, highest token/ACL/native integration burden; persist host intent, reconcile by verified owned lifetime |
| VM | Controlled broker/channel rather than exposed generic remote shell | Only sanitized fixture snapshot in guest; state authority stays host; never trust guest-supplied root/UUID | Higher memory/disk/boot costs on ~7.33 GiB host; stop guest and retain output as untrusted evidence, not accepted task success |
| Container | Approved pipes/broker and pinned image needed; app-server compatibility unknown | Minimal mounts only; no engine socket/host profile/DB mount | Engine/image overhead and version compatibility; container stop must prove all owned scope ended; no automatic relaunch of uncertain attempt |

Tidak ada recommendation membeli edition/VM/container product dari audit ini. Home limitation tidak menjadi alasan menonaktifkan security atau beralih ke full access. Semua alternative perlu Owner decision dan appropriate setup authorization sebelum test.

## 5. Proposed M02-02S scope and authorization boundary

S hanya boleh dimulai lewat task Owner terpisah setelah R1 dan plan direview. Default proposal:

- Fresh named temp root `ai-office-m0202s-<random>` yang dipilih saat implementation, explicit manifest exact canonical paths, owned-root file identities dan hashes. Jangan memakai dua retained roots M02-02.
- New isolated test/probe source hanya di proposed `tests/integration/os-containment/**`; hasil/effective config/transcripts hanya di fixture-owned evidence directory dan proposed `docs/reviews/M02-02S_OS_CONTAINMENT_REPORT.md`. Final allowed paths masih harus disebut Owner pada authorization S.
- Fixed current Node executable dan pinned native containment launcher, exact versions/hashes/argv; no shell, arbitrary executable atau project-provided hook. Tidak ada production adapter/route/schema/package edit.
- Existing no-install capability check/read-only metadata dahulu. Candidate yang membutuhkan install, admin, local account/ACL/firewall/policy/security mutation: **STOP BEFORE ACTION** untuk scope terpisah.
- Jika Owner secara eksplisit memilih documented Codex sandbox CLI sebagai **non-AI launcher**, scope hanya sandbox subcommand + fixed Node probe, bukan app-server/exec/login. Sebelum launch harus terbukti tidak memerlukan/membaca actual auth store: empty fixture `CODEX_HOME`, sanitized env dan pinned startup-path review. Jika tidak dapat memastikan no-credential behavior, STOP; jangan menjalankannya untuk mencari tahu lewat real profile.

Forbidden: actual provider credentials/cookies/keyring, actual auth/account requests, inference, real coding task, paid API/credit fallback/top-up, skills/MCP/plugins/project hooks, new network listeners outside owned fixture test scope, system security changes, installations, valuable data, arbitrary process/PID kill, retained-fixture deletion, and full-access fallback. Tidak ada operasi tersebut dilakukan pada R.

## 6. Disposable fixture and source/state protection

Proposed layout, path dipilih kemudian:

```text
<owned-temp>/ai-office-m0202s-<random>/
  project-a/input/
  project-a/allowed-output/
  project-b/
  app-private/
  fake-credentials/
  allowed-output/
  denied-output/
  host-evidence/
  empty-runtime-profile/
```

Pre-create random synthetic sentinels dan fake private-state/SQLite stand-ins. Tidak copy actual DB/token/source project. Worker hanya mendapat minimal Node executable/runtime dependencies, fixed probe source, A input RO dan approved output RW. B/private/credentials/denied-output/evidence/profile controls harus unreadable/unwritable sesuai manifest, bukan hanya tidak ditampilkan UI. Empty runtime profile bukan actual user's profile; no inherited auth env or native credential access.

Host menyimpan authoritative project/task/attempt/generation/policy/runtime-version refs dan root file identities; boundary-side paths tidak boleh mengganti authority. Host evidence dan allowed-output dipisahkan supaya probe tidak dapat memalsukan official outcome/approval. Semua allowed writes dibatasi bytes/count, snapshot hashes sebelum/sesudah; new files di denied trees juga diperiksa. Tidak mengubah actual AI Office schema atau membawa state DB ke guest/container.

Junction/symlink/hard-link test objects hanya mengarah ke dummy roots sendiri. Periksa ancestor/reparse/identity sebelum membuat atau membersihkan. System paths yang diperlukan loader harus explicit readable; tidak ada broad user-profile read grant. Tidak hardcode actual credential directory dalam probe atau mencoba membaca credential asli bila denial gagal.

## 7. Probe contract and proof standard

Fixed non-AI program melakukan ordinary `fs.open/readFile/writeFile` secara langsung, **tanpa memanggil HostPathPolicy**. Minimal trusted protocol: caseId, attempt/epoch/nonce, reported process identity, operation enum, fixture-relative target reference dan bounded result/error. Jangan menerima executable, arbitrary path, arbitrary command atau fallback mode dari project content.

Catat effective containment implementation/token/profile/version, mapping dan network policy; parent/child identities; canonical allowed/denied target refs; raw OS error code tersanitasi; before/after hashes dan file-existence delta. Canary value tidak boleh dicetak. Hasil child dianggap untrusted observation; trusted host memvalidasi scope/outcome dan output artifacts, tidak menerima string PASS sebagai sole proof.

Negative OS result harus berasal dari process yang **berhasil start dan berhasil melakukan positive control**, terhadap target yang host tahu ada. Gagal karena file tidak ada, probe crash, malformed request, missing Node dependency atau policy evaluator DENY bukan proof denied OS read. Untuk intentionally unmapped guest resources, buktikan mount namespace exclusion dengan outside positive control; jangan mengklaim DACL denial dari ENOENT saja.

Enforcement labels per case:

- **HOST_POLICY**: request validation/decision/dispatch blocking.
- **OS_ENFORCED**: independent direct process IO/socket/lifetime restriction terbukti dalam exact config.
- **RUNTIME_ENFORCED**: actual runtime-specific restriction; tidak diberikan dari model-free generic Node proof. Launcher-specific OS boundary boleh OS_ENFORCED tanpa CODEX_RUNTIME_VERIFIED.
- **NOT VERIFIED**: missing/unsupported/unreliable evidence, termasuk case yang dilewati. Mandatory NOT VERIFIED menahan gate.

## 8. Negative-test acceptance matrix

Semua status awal **NOT RUN / NOT VERIFIED**; tabel adalah acceptance proposal, bukan results.

| Case | Direct non-AI action | Required observation | Enforcement to establish |
|---|---|---|---|
| OS01 | Read existing A input | Exact synthetic bytes/hash; positive control succeeds | OS_ENFORCED allowed scope |
| OS02 | Create/write bounded A allowed-output | Only expected output delta, content/size match | OS_ENFORCED allowed scope |
| OS03 | Read B; create/overwrite/delete B sentinel | Denied; original hash unchanged, no new files | OS_ENFORCED |
| OS04 | Read/write fake-credentials | Denied both; no canary bytes in logs/output | OS_ENFORCED |
| OS05 | Read/write fake app-private DB/approval/journal | Denied both; exact state bytes unchanged | OS_ENFORCED |
| OS06 | Write denied-output or host-evidence | Denied; no forged host evidence | OS_ENFORCED |
| OS07 | Read/write via actual owned junction/symlink to B/private/canary | Same denial as canonical target; target unchanged | OS_ENFORCED; unsupported link case explicitly NOT VERIFIED |
| OS08 | Case/8.3/relative/drive-relative/extended-local/ADS/hard-link aliases to owned denied targets | No bypass; exact resolved identity documented | OS_ENFORCED; host syntax rejection separately HOST_POLICY |
| OS09 | Revoke approval before dispatch; try direct IO after active permission revoked | No new dispatch; active scope stopped or independent rights revoked, no further side effects | HOST_POLICY plus independently verified OS lifetime/rights behavior |
| OS10 | Child and grandchild perform same denied operations | Restrictions inherited; no broader access/secret env/handle inheritance | OS_ENFORCED |
| OS11 | Controlled stubborn child ignores graceful cancel | Verified owned kernel/tree termination, all writes cease before safety TTL | OS_ENFORCED process lifetime |
| OS12 | Root exits/owned transport disconnects while child remains active | All owned descendants stop or outcome stays uncertain and next launch blocked | OS_ENFORCED; no completion from missing root PID |
| OS13 | Direct socket to owned loopback listener | Required network denial demonstrable despite working outside positive control | OS_ENFORCED network; environment/proxy-only block insufficient |
| OS14 | Direct socket to separately approved disposable non-loopback endpoint | Denial with known-reachable positive control and policy evidence | OS_ENFORCED; otherwise NOT VERIFIED, no arbitrary internet probe |
| OS15 | Explicit requested implementation unavailable/policy rejected | Fail launch; no unelevated/full-access/alternative provider retry | HOST_POLICY and observed launcher failure |
| OS16 | Create new denied-file match after long-lived probe starts | Continued direct denial or boundary cannot meet requirement | OS_ENFORCED; catches process-start glob snapshot limitations |
| OS17 | Leave earlier permitted output, then interrupt/reopen journal | Earlier output retained as side effect; unresolved needs reconciliation, no auto resend | HOST_POLICY recovery; not exactly-once |
| OS18 | Forge process message/scope/terminal PASS | Host rejects wrong nonce/epoch/identity and preserves truthful state | HOST_POLICY; not equivalent to OS boundary |

Aliases/UNC: gunakan only verified local fixture targets; jangan membuat network share, menyentuh remote SMB path atau arbitrary machine directory. Bila alternate form memerlukan new OS setup/privilege yang tidak diotorisasi, mark NOT VERIFIED dan stop gate terkait, bukan bypass. OS08 tidak mengizinkan probing real system/user data.

Revocation: filesystem rights/open handles tidak diasumsikan mutable. Safe default adalah revoke new grants dan terminate **seluruh owned isolated scope** sebelum menyatakan revocation effective; observe write cessation dan deny later dispatch. Jika alive child tetap bisa menulis, FAIL; request denial saja tidak lulus OS09.

## 9. Process-tree safety prerequisites

Sebelum stubborn-child case, buktikan ownership/lifetime mechanism dengan cooperative fixtures. Satu parent PID/list dari child bukan secure ownership inventory. Binding native processes ke lifetime boundary harus terjadi sebelum child dapat membuat untracked descendants; bila membutuhkan native Job Object bridge, toolchain/helper itu memerlukan explicit approved source/setup scope dahulu. Jangan mengimpor dependency atau menjalankan arbitrary P/Invoke script dalam R.

Verified job/container handle/creation epoch harus dimiliki trusted supervisor; prevent breakaway dan leaking controlling handles. Graceful IPC boleh tahap awal, tetapi acceptance noncooperative tidak mengandalkan child disconnect handler. Catat exact root/descendant identity dan authoritative boundary accounting sebelum/sesudah; jangan kill generic name atau journal PID. Bila mekanisme tidak bisa menjamin bounded cleanup, **jangan buat detached persistent process**; stop pada feasibility gate.

Fixed probe memiliki safety TTL sebagai last resort, tetapi exit karena TTL **bukan** containment cleanup PASS. Expected termination harus terjadi sebelum TTL melalui owned mechanism; outcome unknown tetap UNCERTAIN/RECONCILIATION_REQUIRED, future dispatch blocked. Tidak menguji arbitrary hostile persistence atau machine hard crash pada bounded S awal.

## 10. Network and credential constraints

Network test pertama hanya fixture-owned loopback server pada ephemeral port, nonce sintetis, bounded connection count, no real AI Office endpoint. Positive control host membuktikan listener reachable; isolated probe mencoba ordinary socket tanpa bergantung proxy env. Loopback/private destinations wajib dinilai terpisah dari outbound domain rules. Jika candidate mengizinkan koneksi yang threat model mensyaratkan ditolak, FAIL; jangan menutupi dengan menyebutnya offline.

Non-loopback endpoint hanya jika separately approved dan disposable; no DNS-only failure dianggap network boundary. Tanpa endpoint aman dan effective OS policy evidence, OS14 NOT VERIFIED. Tidak memanggil provider, telemetry/auth/model endpoints sebagai network test. Real credentials, host browser/native keyring dan actual profile tidak dibuka meskipun policy bermaksud deny.

## 11. Exact stop conditions

STOP, preserve scoped evidence dan block worker jika:

1. Root/ancestor/file identity atau ownership tidak pasti; unexpected reparse, real data/secret atau retained historical fixture tersentuh.
2. Capability/setup memerlukan install/admin/ACL/user/firewall/Defender/policy change yang belum disetujui.
3. Actual credential-store startup behavior tidak dapat dikecualikan; real login/account/inference/paid request hendak terjadi.
4. Effective implementation/profile tidak dapat diidentifikasi, requested explicit implementation fallback, atau denied read/write/network succeeds.
5. B/private/canary/evidence bytes berubah atau canary value masuk output.
6. Child mendapat hak lebih luas, ownership scope tidak lengkap, breakaway dapat terjadi, cleanup melebihi deadline, atau proses tak terhitung tersisa.
7. Unexpected exit dipetakan COMPLETED, approval stale/revoked masih grant, uncertainty memicu blind retry atau duplicate execution.
8. Test membutuhkan source/config/DB changes di luar approved manifest, security downgrade atau broad host mount.
9. Mandatory case unsupported/unreproducible; catat NOT VERIFIED dan tahan gate, jangan mengubah acceptance agar lulus.
10. Cleanup action ditolak policy; jangan mengganti command/shell/permission untuk bypass.

No automatic retry/fallback, no destructive reset. Kegagalan direct fake-canary read denial adalah evidence candidate tidak memenuhi boundary, bukan alasan mencoba actual token. Safe earlier output tidak dianggap rolled back.

## 12. Evidence and future worker activation

S report harus memuat exact OS/edition/capability/launcher hash/version/argv, sanitized effective profile, fixture manifests/hashes, case-level positive/negative OS evidence, process/handle lifetime observations, output/network limits, errors, unexpected deltas, journal uncertainty/reconciliation, cleanup account dan protected-file comparison. OS_VERIFIED hanya untuk mechanism/config/cases yang benar-benar lulus; coverage general atau actual Codex enforcement tidak diasumsikan.

Bahkan setelah S lulus, actual worker masih memerlukan independent gates: official interface/pinned compatibility; applicable subscription/authorization/model entitlement; included-only billing hard stop tanpa paid fallback; trusted runtime credential separation; actual approval events/permission envelope; runtime turn cancellation dan owned children; durable production Project State lease/journal; reconnect/crash dedup/reconcile; sanitized real-event audit trail dan artifact validation; explicit Owner one-task execution approval. Skills tetap OFF; enforcement proof required sebelum enablement.

## 13. Owner decisions and subsequent progression

Urutan rekomendasi, bukan execution authorization:

1. Review R closeout; separately authorize exact R1 atomic issuance correction/regression, lalu verify hasil tanpa PNG overwrite/retained cleanup.
2. Decide S candidate dan exact no-change feasibility scope. MXC availability bukan presumed PASS. Jika perlu different account/AppContainer/native helper/VM/container/edition/setup, review scope baru sebelum tindakan.
3. Authorize S exact disposable paths, executable hashes, allowed IO/network/process tree, evidence retention/cleanup dan mandatory stops. No account/provider work di scope ini.
4. Setelah safety evidence cukup, review separate official account/billing/protocol preflight scope; tidak otomatis mengikuti S. Coding M02-03 hanya setelah gates wajib dan explicit bounded worker approval.
5. M02-04 dapat memperluas actual cancellation/crash/reconnect; M02-05 acceptance menilai real evidence. Minimum safe cancel/dedup tidak ditunda sampai setelah first coding task.

Owner tidak diminta menyetujui bahwa unknown capability sudah bekerja. Pertama pilih izin pengujian yang terbatas; technical pass/fail harus dibuktikan. Review ini sendiri tidak memberi izin setup, cleanup retained fixtures, R1, S, actual Codex session atau paid usage.

**PROPOSED M02-02S ONLY — NOT EXECUTED. HOST CLOSEOUT REMAINS CONDITIONAL ON R01. REAL CODEX WORKER REMAINS BLOCKED.**
