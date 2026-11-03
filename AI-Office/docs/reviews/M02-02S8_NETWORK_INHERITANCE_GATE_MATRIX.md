# M02-02S8 — Network Inheritance Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Primary: [Child Network Inheritance Report](M02-02S8_CHILD_NETWORK_INHERITANCE_REPORT.md). Evidence berada di <S8_ROOT>/evidence/; internal locator pada primary section 6.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 1. S8-01 through S8-52

**ACCEPTED — BOUNDED CHILD LOOPBACK DENIAL INHERITED.** Parent dan satu cooperative child sama-sama ditolak dengan EACCES/-4092/connect pada 127.0.0.1:29485. Host baseline berhasil; server hanya menerima baseline. Seluruh one-shot allowance sudah terpakai.

| Gate | Requirement | Status | Evidence / boundary |
|---|---|---|---|
| S8-01 | Official Codex candidate verified | HOST_VERIFIED | Hash dan signature main/helpers cocok; recorded inventory S4 cocok, seluruh 61 file S4 tetap sama. |
| S8-02 | Existing Codex preserved | HOST_VERIFIED | 50 file global Codex 0.162.1 tidak berubah; candidate terpisah, proses IDE 22256 tidak disentuh. |
| S8-03 | Node identity verified | HOST_VERIFIED | Node 24.21.0 dan SHA-256 cocok dengan baseline; tidak ada upgrade/install. |
| S8-04 | Fresh synthetic fixture | HOST_VERIFIED | Satu root Temp baru, canonical dan dimiliki user; marker A/B sintetis, tanpa reparse. |
| S8-05 | Strict filesystem semantics retained | HOST_VERIFIED | Hanya nama profile dan root berubah; normalized text sama, config hash B1D282CB…F5CA5 tetap. |
| S8-06 | Network-disabled profile retained | HOST_VERIFIED | network.enabled=false dipertahankan; selected named profile dan explicit MXC tercatat. |
| S8-07 | No new proxy/loopback exceptions | HOST_VERIFIED | Tidak menambah proxy, domain atau allow_local_binding; effective policy tetap partially observable. |
| S8-08 | Managed configuration preserved | HOST_VERIFIED | --include-managed-config dipakai; tidak ada managed redirect/file pada metadata yang diperiksa. |
| S8-09 | Project A-only workspace | HOST_VERIFIED | Cwd hanya A; B sibling denied, tanpa workspace tambahan atau broad parent/drive/Temp grant. |
| S8-10 | Host filesystem baseline | HOST_VERIFIED | A dan B dapat dibaca normal; 2/2 hash marker cocok. |
| S8-11 | Test listener bound to 127.0.0.1 | HOST_VERIFIED | Satu exclusive listen, actual address 127.0.0.1 dan family IPv4. |
| S8-12 | Ephemeral port verified | HOST_VERIFIED | Port 0 menghasilkan 29485; parent/child memakai port yang sama, tanpa scan atau fixed historical port. |
| S8-13 | Listener ownership | HOST_VERIFIED | Fixed Node/source, exact ChildProcess handle, PID 7376 dan event fixture konsisten. |
| S8-14 | Normal-user TCP baseline | HOST_VERIFIED | Host PID 23440, 5 ms, peer 29486→29485; marker/ACK serta close dikonfirmasi kedua sisi. |
| S8-15 | Parent source reviewed | VERIFIED | Source 14620 bytes, SHA 06C3F2B7…105A; template direview, literal source frozen sebelum launch. |
| S8-16 | Child source reviewed | VERIFIED | Source 4655 bytes, SHA CBCD056B…B312; hanya fs/net, tanpa child_process atau grandchild. |
| S8-17 | One MXC launch ceiling | VERIFIED | Exclusive wx issuance dan opt-in; actual 1/max1, tanpa retry/fallback. |
| S8-18 | One child spawn ceiling | VERIFIED | Satu spawn call setelah parent mendapat permission denial; 1 attempt dan 1 child created. |
| S8-19 | Parent bootstrap | MXC_BEHAVIOR_VERIFIED | S8_PARENT_BOOTSTRAP_OK dengan PID 15740/PPID 9936 dan fixture ID konsisten. |
| S8-20 | Parent Project A allowed | OS_VERIFIED | P-F01 direct read berhasil dan content match sebelum TCP. |
| S8-21 | Parent Project B denied | OS_VERIFIED | P-F02 gagal EPERM/-4048/open setelah normal-user control berhasil. |
| S8-22 | Parent TCP actually attempted | MXC_BEHAVIOR_VERIFIED | Satu direct socket.connect ke 127.0.0.1:29485 pada 23:59:33.890Z. |
| S8-23 | Parent TCP denied | OS_VERIFIED | EACCES/-4092/connect pada .893Z; socket closed, listener live, host baseline berhasil. |
| S8-24 | Child process successfully created | MXC_BEHAVIOR_VERIFIED | Parent mengamati spawn PID 12128, kemudian child mengirim bootstrap, fs/TCP dan exit receipts. |
| S8-25 | Parent-child relationship correlated | VERIFIED | Observed PID 12128 sama dengan child PID; child PPID 15740 sama dengan parent; fixed handle/source/window. |
| S8-26 | Child bootstrap | MXC_BEHAVIOR_VERIFIED | S8_CHILD_BOOTSTRAP_OK pada .969Z; semua child events berkorelasi. |
| S8-27 | Child Project A allowed | OS_VERIFIED | C-F01 direct read berhasil dan content match pada .972Z. |
| S8-28 | Child Project B denied | OS_VERIFIED | C-F02 gagal EPERM/-4048/open pada .973Z; child sanity=true. |
| S8-29 | Child TCP actually attempted | MXC_BEHAVIOR_VERIFIED | Satu direct socket.connect ke endpoint 29485 yang sama pada .973Z, tanpa lookup/fallback. |
| S8-30 | Child TCP denied | OS_VERIFIED | EACCES/-4092/connect pada .975Z; socket closed tanpa timeout atau ACK. |
| S8-31 | Server did not accept prohibited connections | HOST_VERIFIED | Server hanya menerima baseline, connection count=1; tidak ada parent/child marker atau connection. |
| S8-32 | Client/server observations consistent | VERIFIED | Actual permission errors, listener window dan baseline endpoint pair konsisten; interference=false. |
| S8-33 | Parent clean exit | VERIFIED | Parent exit0 pada .986Z setelah child close; native exit0 pada 23:59:34.020Z. |
| S8-34 | Child clean exit | VERIFIED | Child self-exit0 pada .976Z, parent observed exit0 pada .985Z, stdio close/protocol valid. |
| S8-35 | Deadlines respected | HOST_VERIFIED | Batas 2s/3s/6s/12s/14s/17s/25s tercatat; tidak ada timeout, overflow atau termination request. |
| S8-36 | Listener and process cleanup | HOST_VERIFIED | Close event mencatat address=null dan activeSockets=0; exact-port LISTEN dan known-PID queries kosong. |
| S8-37 | Fixture integrity | HOST_VERIFIED | Canary 2/2 unchanged, canonical roots dan frozen inputs cocok; tanpa unexpected reparse/output. |
| S8-38 | No Windows security modifications | HOST_VERIFIED | Hanya read-only metadata; tidak ada ACL/firewall/Defender/registry/UAC/elevation/WSL mutation. |
| S8-39 | No login or inference | HOST_VERIFIED | Tidak ada real credential/session/.sandbox-secrets, provider auth, model, app-server atau worker command. |
| S8-40 | No paid API/credits | HOST_VERIFIED | Tidak ada API/billing/inference action; absence of spend bukan bukti billing cap. |
| S8-41 | Existing source preserved | HOST_VERIFIED | 123 file lama AI unchanged; final125 hanya 2 laporan. Global50, Hermes647, historical286 file unchanged. |
| S8-42 | Public internet egress | NOT VERIFIED | NOT RUN; satu endpoint loopback tidak membuktikan public internet egress confinement. |
| S8-43 | DNS/LAN/IPv6/UDP | NOT VERIFIED | NOT RUN; hanya literal IPv4/TCP, tanpa DNS/LAN/gateway/UDP/IPv6 test. |
| S8-44 | Hostile/detached child network confinement | NOT VERIFIED | NOT RUN; fixed cooperative child saja, tanpa hostile/detached/crash/persistence proof. |
| S8-45 | Future-file deny timing | NOT VERIFIED | NOT RUN; existing-marker reads saja, tanpa after-start file/race/watcher. |
| S8-46 | Real credential custody | NOT VERIFIED | Tidak menggunakan actual credential/private DB; historical fake-path denial bukan real custody proof. |
| S8-47 | Codex app-server readiness | NOT VERIFIED | NOT RUN; tidak ada protocol/adapter/tools/thread/turn readiness test. |
| S8-48 | Real approvals/cancellation | NOT VERIFIED | NOT RUN; normal exit bukan runtime approval/cancel/interrupt-race evidence. |
| S8-49 | Durable production worker recovery | NOT VERIFIED | Belum menguji production lease/journal/issuance/dispatch/recovery atau power-loss safety. |
| S8-50 | Subscription entitlement | NOT VERIFIED | Eligibility UNKNOWN; tidak ada account/auth/model-availability query. |
| S8-51 | Included-only billing enforcement | NOT VERIFIED | Tidak ada hard cap atau fallback exclusion proof; Paid API dan purchased credits tetap OFF. |
| S8-52 | Real worker activation | BLOCKED | Remaining OS/runtime/state/account/billing gates terbuka; S8 tidak mengotorisasi worker. |

## 2. Direct parent/child observations

| Process | A read | B read | TCP attempt | TCP result | Exit |
|---|---|---|---|---|---|
| Parent15740 | Content match | EPERM/-4048/open | 1, endpoint29485 | EACCES/-4092/connect; socket closed | 0 |
| Child12128 | Content match | EPERM/-4048/open | 1, endpoint sama | EACCES/-4092/connect; socket closed | 0 |

Child dibuat sesudah parent denial. Bukti berasal dari direct fs/net calls di masing-masing proses, tanpa HostPathPolicy. Keduanya tidak mengirim marker/menerima ACK; tidak ada timeout, lookup atau protocol failure. Child self-exit dan parent-observed exit/close cocok.

## 3. Requested versus effective policy evidence

S7 hash5A621D3F…9C0EF menjadi S8 hashB1D282CB…F5CA5 karena substitusi nama/root saja; normalized text sama. Root/temp deny, minimal read, A-only workspace write, sibling denies, network=false, ephemeral home, explicit MXC dan managed inclusion dipertahankan.

**EFFECTIVE_POLICY_PARTIALLY_VERIFIED.** Tidak ada full merged SDK/kernel/proxy dump. Config, exact argv, metadata, source selection dan actual A/B/network contrast mendukung tested boundary, tanpa complete-policy attestation.

[Tagged0.164.0 policy](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) membedakan disabled/unproxied denial dari proxied loopback allowance. Hasil ini konsisten dengan unchanged intent; source review sendiri bukan runtime proof.

## 4. TCP connect error classification

Parent dan child menghasilkan actual **EACCES, errno-4092, syscall connect**. Endpoint yang sama dapat dicapai host baseline dan server tetap listening selama MXC invocation.

Tidak ada ECONNREFUSED/ETIMEDOUT/EHOSTUNREACH, missing receipt atau bootstrap failure yang dihitung sebagai permission denial. OS_VERIFIED terbatas pada actual operation/configuration ini. Exit0 berarti probe selesai mencatat expected denial, bukan berhasil connect. Node error metadata bukan kernel trace independen.

## 5. Host server connection evidence

Fixed host server PID7376, exclusive127.0.0.1/IPv4/port0→29485. Listening pada23:59:33.026Z; baseline peer29486 pada.033Z, marker17bytes pada.034Z, ACK7bytes, socket closed.036Z.

Window-ready.038Z dan status setelah native exit pada23:59:34.021Z sama-sama menunjukkan listener aktif, address/port sama, activeSockets0 dan connectionCount1. Tidak ada interval rebind path, parent/child connection atau interference. Marker class saja tidak dipakai sebagai authenticated sender identity.

## 6. Parent/child identity and process evidence

Host controller/baseline23440, server7376, launcher2220, parent15740/reportingPPID9936, child12128/reportingPPID15740. Exact handle, verified Node/source, fixture/role, observed spawn PID, PPID dan lifecycle window berkorelasi.

Parent bootstrap.886Z →parent deny.893Z →spawn attempt.894Z →observed child.903Z →child bootstrap.969Z →child deny.975Z →child self-exit0.976Z →parent-observed exit0.985Z →parent exit0.986Z. Native exit0 selesai23:59:34.020Z.

Tidak ada live child CIM CreationDate sample sebelum proses cepat selesai. Timestamp tersebut adalah observations, bukan invented OS creation time. PPID9936 tidak dianggap termination authority. Tidak ada proses dibunuh.

## 7. Incomplete or unexecuted tests

Tidak ada required executed operation yang gagal/inconclusive. Tidak ada retry, listener/MXC/child kedua, grandchild atau endpoint variation.

S8-42–51 tetap NOT VERIFIED; S8-52 BLOCKED. Public/DNS/LAN/IPv6/UDP/proxy, hostile/detached/crash/cancellation, full filesystem matrix dan real credential tests tidak dijalankan. Historical M01/security/S5R2/S6/S7 results tidak diklaim sebagai rerun.

## 8. Network loophole or exception findings

Tidak ditemukan parent regression, child connectivity gain, filesystem escape, unexpected proxy/fallback, endpoint atau policy change. Tidak ada confirmed exploit/severity yang diberikan.

[Current MXC guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox) menjelaskan configuration-dependent loopback/managed-network caveats. Hasil ini tidak membuktikan semua konfigurasi MXC menolak localhost atau menyangkal exception yang didokumentasikan. Localhost services tetap memerlukan autentikasi/otorisasi independen.

## 9. Hostile/detached child limitations

**NOT VERIFIED /NOT RUN.** Fixed cooperative child saja; shell=false, detached=false, tanpa unref/grandchild. Tidak menguji hostile code, daemon/persistence, foreground crash, PID reuse attack, Job Object atau forced-tree cleanup.

Cooperative cleanup didukung socket close, server address=null/zero active sockets, empty exact-port LISTEN query dan known-PID absence. Timeout/kill escalation hanya direview, tidak dieksekusi.

## 10. Public egress limitations

**PUBLIC INTERNET EGRESS STILL NOT VERIFIED.** Tidak ada public/provider/documentation-IP, LAN/DNS/IPv6/UDP/proxy test atau actual backend contact. Hanya satu IPv4 TCP endpoint dan satu parent/child pair.

Official documentation research terpisah dari command network experiment. Profile network=false ditambah local denial tidak dapat menjadi runtime-wide outbound certification.

## 11. Future-file timing limitations

**NOT VERIFIED /NOT RUN.** Pre-existing A/B marker reads saja, tanpa after-start creation, snapshot/glob race, watcher, alias replacement atau long-running probe. Root/directory-deny intent tidak otomatis membuktikan setiap future-file behavior.

## 12. Credential custody limitations

**NOT VERIFIED.** Tidak membaca/menyalin actual auth, keyring, provider credentials, .sandbox-secrets atau SQLite. Empty denied private/credential directories menjaga semantic design, bukan bukti custody baru. Explicit nine-key environment adalah input hygiene; runtime env/argv/log/IPC/tool custody tetap terpisah.

## 13. App-server protocol readiness

**NOT VERIFIED /NOT RUN.** Tidak ada app-server, adapter, SDK, thread/turn/tool/model integration. CLI sandbox dan fixed Node child tidak membuktikan real Codex runtime acceptance.

## 14. Approval/cancellation readiness

**NOT VERIFIED /NOT RUN.** Tidak ada actual Codex approval, interrupt, cancellation race atau completion acceptance. Historical host-only tests tetap historical. Normal child exit dan server stop tidak membuktikan runtime cancellation.

## 15. Production durable lease/recovery

**NOT VERIFIED.** Exclusive wx experiment records mencegah accidental replay pada fixture ini; bukan production durable lease, cross-process issuance/dispatch dedup, reconciliation atau power-loss recovery. Authoritative Project State/schema/database tidak diubah.

## 16. Account and billing enforcement

**NOT VERIFIED; entitlement UNKNOWN.** Tidak ada login/account/subscription/model query, inference, API spend atau purchased credits. Paid API/fallback tetap OFF. Zero experimental spend bukan provider-enforced included-only hard cap.

## 17. Skill execution boundaries

**NOT VERIFIED untuk AI OFFICE runtime.** OpenAI Docs dipakai coding agent untuk reference review; tidak menguji AI OFFICE skill discovery/execution/permission bridge. Existing metadata/harness unchanged; tidak ada arbitrary worker/skill code yang diotorisasi.

## 18. Real worker activation decision

**BLOCKED.** OutcomeA hanya menerima bounded cooperative child loopback denial. OS/runtime/credential/state/account/billing gates tetap terbuka; tidak ada M02-03/app-server/inference/worker authorization.

Measured preservation: AI123/123 unchanged→125 hanya2reports; global Codex50/50, Hermes647/647, historical9roots286files unchanged; known junction tidak diikuti. Marker2/2 unchanged, canonical roots/frozen inputs cocok, output kosong. External Google AI Studio tidak ditulis dan tidak checksum-audited.

Server close pada23:59:34.025Z; audit23:59:57.4480705Z tidak menemukan listener29485 atau known/fixture process. ActiveIDE22256 hidup. Evidence files dipertahankan; tidak ada security/PATH/globalconfig mutation atau cleanup bypass.

## 19. One recommended next milestone

Propose **M02-02S9 — Bounded Future-File Deny Timing Validation**: fresh synthetic fixture, satu fixed MXC probe, bounded host/probe handshake untuk membuat denied-sibling file setelah process start, strict root/directory policy tetap. Tanpa real credential, network, hostile child, arbitrary watcher atau profile widening. **Belum dimulai.**

## 20. Owner approval needed

Owner dapat mereview completed S8 evidence dan memberikan task baru yang menetapkan fixed code/argv, owned targets/timing, budgets, deadlines, ownership/cleanup/retention serta stop rules. Tidak perlu meminta ulang izin untuk authorized S8 work yang selesai.

S8 listener/baseline/MXC/child/parentTCP/childTCP allowance sudah habis. Jangan mengulang, menambah endpoint, melonggarkan profile/proxy/local binding, menghapus historical evidence, memulai milestone lain/M02-03/app-server/worker/model/auth/billing atau mengubah security otomatis.

**M02-02S8 COMPLETE — BOUNDED COOPERATIVE CHILD LOOPBACK DENIAL VERIFIED — PUBLIC EGRESS STILL NOT VERIFIED — REAL CODING WORKER BLOCKED.**
