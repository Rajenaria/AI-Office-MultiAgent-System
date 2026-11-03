# M02-02S16 — Windows Process-Tree Supervision, Ownership & Cleanup Report

Tanggal: 30 Oktober 2026, Asia/Jakarta. Workspace: D:\Rajendra\AI-Projects\AI-Office. Companion: [Security Gate Matrix](M02-02S16_PROCESS_TREE_SECURITY_GATE_MATRIX.md).

## 1. Executive decision

**CONDITIONAL. Gate A selesai, Gate B selesai sebagai desain. Gate C: NOT FEASIBLE / NOT RUN.** Tidak ada MXC invocation, foreground parent, child, test fixture, Job Object action atau forced termination S16.

Pinned MXC memiliki internal job-based cleanup menurut source yang ditelusuri sampai native dependency. AI OFFICE belum memiliki reviewed host capability untuk memegang boundary itu, membuktikan complete membership dan membersihkan child/helper yang tetap hidup setelah foreground parent keluar. S10 hanya memegang launcher di outer host; child handle dimiliki parent yang pada cabang C-A justru akan keluar. Metadata observer S10 menutup Process handle setelah membaca metadata. Self-expiration bukan independent emergency containment.

Prasyarat FEASIBLE_A dan FEASIBLE_B tidak terpenuhi; tidak ada izin kondisional untuk meluncurkan Gate C. Ini hasil fail-closed yang diminta, bukan eksperimen gagal, bukan sandbox escape dan bukan bukti OS tidak mendukung Job Objects.

| Pertanyaan | Jawaban dan tingkat bukti |
|---|---|
| Q1 — Actual hierarchy? | Historical S10: host15412 → launcher252; foreground12592 melaporkan PPID6596; child4204 PPID12592. Source memprediksi same-executable MXC helper di antara launcher dan foreground. Identitas6596 tidak di-attest; hierarchy actual S16 NOT RUN (§5/§9/§18). |
| Q2 — Ownership? | Outer host owns launcher ChildProcess; internal helper owns SDK foreground/job; foreground parent owns child ChildProcess. Physical handle custody bukan PPID relationship (§9). |
| Q3 — Beyond PID? | S10 mengorelasikan executable/hash, creation ticks, nonce dan PID/PPID. Host tidak mempertahankan independent child wait/control handle; future contract mensyaratkannya (§8/§10). |
| Q4 — Lifecycle facts distinct? | Launch attempt/success, reported READY, OS alive, cancel intent, terminate request, root exit, descendant exit dan complete accounting dipisahkan dalam desain (§12); tidak ada fakta runtime S16. |
| Q5 — Foreground guarantee? | Documentation menyatakan remaining children stop. Pinned SDK wait melakukan job termination/drain lalu root reap; nonfatal drain warning berarti launcher exit0 tidak cukup untuk host complete-tree claim (§5/§6). |
| Q6 — Safe one-parent/one-child test? | Tidak dengan capability yang saat ini ditinjau. Independent surviving-child/helper cleanup dan custody belum tersedia; timer saja tidak cukup (§13). |
| Q7 — Existing whole-tree mechanism? | SDK internal UiJobObject ada (SOURCE_VERIFIED). Reviewed AI OFFICE/test-host-owned membership+termination interface tidak ada (§6/§7). |
| Q8 — Every owned descendant safely contained? | NOT VERIFIED untuk host-controlled experiment. Source job inheritance bukan actual exclusive membership proof (§11). |
| Q9 — Durable uncertainty? | Existing dormant S15 dapat quarantine UNKNOWN tanpa mengubah old owner/generation, hold1/dispatch CLOSED/retryAuthorized=false (§23). |
| Q10 — Before real dispatch? | Owned OS boundary, reliable closure/effects custody, crash recovery, physical output fencing, app-server, credentials, entitlement dan billing enforcement masih dibutuhkan (§26). |

## 2. Scope and safety boundaries

Hanya dua file baru pada docs/reviews yang ditulis. Tidak ada perubahan application source, tests, schemas, S12–S15, package/lockfile, startup, brain reader, architecture/roadmap, historical reports atau fixtures. Tidak membuka SQLite apa pun, termasuk historical test DBs; hash membaca raw file bytes saja. Tidak menjalankan test suite/typecheck/build karena repository change hanya dokumentasi dan Gate C tidak diotorisasi oleh prasyarat.

Tidak menjalankan Codex version/help/support-discovery, native helpers, backend/app-server/worker, model inference, login/provider call, paid API/credits, network probe/listener, detached process atau test grandchild. Tidak membuat/memodifikasi Job Object, menjalankan native Add-Type/PInvoke build, memasang dependency, elevasi, WSL atau mengubah ACL/security/firewall/Defender/UAC/registry/PATH. Tidak ada process-name kill, PID kill, taskkill atau cleanup historical assets. Hermes3D hanya tracked-file hash dan read-only Git status/HEAD; Google AI Studio tidak disentuh dan tidak checksum-audited.

Hard budget vs actual: MXC1/0; parent1/0; child1/0; grandchildren0/0; additional sandbox0/0; test/provider connections0/0; real workers0/0; inference0/0; production DB writes0/0; dependencies0/0; unauthorized termination0/0. Angka kiri ceiling, kanan actual. Official-source research network terpisah dan diperbolehkan request, tidak dijadikan network-enforcement test.

## 3. Previous S10/S13–S15 baseline

[S10 report](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md) dan [matrix](M02-02S10_RECOVERY_GATE_MATRIX.md): one cooperative cancellation, child exit/close0 dahulu, parent final ack/exit marker0 sesudahnya, launcher exit/close0. Semua emergency termination paths tidak dipakai. S10 parent menunggu child closed, sehingga tidak menguji parent-exits-while-child-alive.

Actual S10 sources dibaca: host metadata memakai Get-CimInstance Win32_Process dan System.Diagnostics.Process.GetProcessById; membuka Handle/StartTime/HasExited lalu Dispose. Host owns exact launcher ChildProcess; parent owns child. Historical evidence tidak menunjukkan durable child handle atau exported job membership. Reported intermediary6596 bukan target yang sah.

S6 memakai fixed inline parent spawn one child lalu menunggu close; timeout fallback parent c.kill hanya milik child itu, tidak menguji host-owned group. S8 membuktikan bounded child loopback denial terhadap endpoint yang diuji, bukan public egress atau hostile/crash cleanup. S5R2 adalah bounded direct filesystem evidence; S7 bounded loopback; S9 no-glob-dependency branch tanpa runtime test. Hasil ini dibaca, tidak diulang atau dipromosikan.

[S11 design](M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md), [S12 foundation](M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md) dan E04 ditinjau read-only. S13–S15 final repaired pipeline **262 PASS,0 FAIL/SKIP/TIMEOUT,13 test files**, typecheck PASS adalah evidence historis. S15 writer provenance repair1/2 membedakan inspector host dari old execution owner pada RECOVERY_CLASSIFIED. S16 tidak mengklaim rerun. Database authority tetap dormant/test-only; tidak memberikan physical kill/fencing.

## 4. Windows/Codex/Node versions

Current read-only metadata: Windows11 Home Single Language; Win32_OperatingSystem version10.0.26300; registry CurrentBuild26300, UBR9711, DisplayVersion26H2 → **26300.9711 /26H2**. PowerShell5.1.26100.9711. Query UTC2026-10-30T07:38:00.2319302Z; ini bukan runtime launch timestamp.

S4_ROOT = C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW. Candidate version **0.164.0** berasal dari retained evidence/version.json: codex-cli0.164.0, historical exit0, dan current identical artifact hashes. ProductVersion candidate/helpers kosong; tidak difabrikasi sebagai current --version observation.

| Executable | Current SHA-256 | Signature |
|---|---|---|
| S4_ROOT\candidate\bin\codex.exe | 6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36 | Valid, OpenAI OpCo, LLC |
| S4_ROOT\candidate\codex-resources\codex-command-runner.exe | 30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB | Valid, OpenAI OpCo, LLC |
| S4_ROOT\candidate\codex-resources\codex-windows-sandbox-setup.exe | 2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF | Valid, OpenAI OpCo, LLC |
| C:\Program Files\nodejs\node.exe | BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32 | Valid, OpenJS Foundation; ProductVersion24.21.0 |

Keempat file bukan reparse point. Signature/hash membuktikan measured identity, tidak membuktikan containment. Active npm Codex **0.162.1** berada di C:\Users\USEP REZA USAMAH\AppData\Roaming\npm\node_modules\@openai\codex, package.json dibaca; seluruh50 files dipertahankan. Candidate61-file retained S4 root terpisah; tidak diaktifkan/global PATH/VS Code tidak diubah.

## 5. Pinned MXC source analysis

Gate A menelusuri E01 terlebih dahulu, lalu exact dependency E02. debug_sandbox.rs selected WindowsMxc branch memakai current_exe sebagai wrapper executable. SandboxManager::transform membuat same-executable command melalui create_command_args; lib.rs memakai internal --__codex-windows-mxc entry. windows.rs memvalidasi availability, decode filtered environment/build policy; native.rs memanggil BaseContainerRunner::spawn dengan StdioMode::Inherit lalu child.wait. Tidak melalui legacy elevated/unelevated runner path pada selected MXC branch. Legacy helper binaries yang ada pada bundle bukan bukti bahwa path tersebut dipakai.

Cargo.toml dan Cargo.lock menunjuk microsoft/mxc **b21120168d70befe12356411423266bfef168446**, mxc-sdk1.0.0. SDK BaseContainerRunner membuat foreground dengan CREATE_SUSPENDED, membentuk UiJobObject, assigns pi.hProcess, lalu ResumeThread. Setup failure menolak spawn, mencoba terminate/reap foreground, bukan meneruskan uncontained command. Handle ownership dipindah BaseChild ke BaseContainerSandboxProcess. Ini SOURCE_VERIFIED, tidak ada fresh runtime membership evidence.

wait menunggu foreground, lalu terminate_and_reap sebelum enforcement teardown. kill_process_tree memanggil TerminateJobObject dan wait_for_empty; Drop juga mencoba cleanup. Ini memperkuat source basis untuk documented foreground-exit behavior. **Tidak membuktikan outer-host crash, forced launcher death, actual helper identity, actual flags atau complete accounting pada mesin ini.** kill_on_drop(true) pada outer Tokio child bukan jaminan Rust destructor berjalan ketika proses outer launcher di-force-kill.

## 6. Native Job Object and process-control analysis

UiJobObject::new membuat unnamed job, menyimpan private HANDLE dan memasang JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE; Drop menutupnya. assign_process meminjam original process handle. Constructor tidak mengaktifkan breakaway flags. Internal kill/timeout memakai job; expected member foreground dan future inherited descendants. Creator/helper sendiri tidak otomatis member.

Important source limit: wait_for_empty polls JobObjectBasicAccountingInformation.ActiveProcesses, ceiling5s/poll10ms. Pada BaseContainerSandboxProcess::kill_process_tree, drain failure ditulis sebagai warning lalu melanjutkan; TerminateJobObject failure tetap error. terminate_and_reap menunggu root handle dengan u32::MAX. Maka SDK wait/outer exit0 **tidak cukup** sebagai per-member exit atau all-descendants-accounted receipt, dan bukan bukti whole supervision path selalu selesai dalam20s. Ini desain observability gap, bukan observed persistent process.

Microsoft E07 menjelaskan group termination, inherited membership dan kill-on-last-handle-close; tambahan handle dapat menunda final-close cleanup. Windows mendukung nested jobs dengan constraint hierarchy/assignment/UI; tidak otomatis membuktikan compatibility konfigurasi ini. Dibutuhkan owned handle dan verified member set, bukan semata OS build atau parent-child PPID.

Node v24.21.0 E07: subprocess.kill mengirim termination request, subprocess.killed tidak menandakan actual exit, dan Windows signal semantics bersifat abrupt. ChildProcess reference bukan public API untuk seluruh descendant/job scope. Process identity/handles dan rights harus ditinjau terpisah; S16 tidak memakai PID-based OpenProcess/Kill untuk mengisi gap.

## 7. Current AI OFFICE process-control capability inventory

| Capability aktual | Evidence/provenance | Batas untuk S16 |
|---|---|---|
| Active backend startup | E06 src/server/index.ts: registry/workspace, optional fixture state, HTTP | Tidak mengimpor dormant attempt-control atau OS job supervisor; tidak dijalankan. |
| SyntheticSecurityHarness | E06 supervisor.ts: fixed probe fork, nonce, RAM run map, IPC cancel,250ms own-child.kill fallback | Bukan MXC launcher atau host-owned job bridge. Descendants dilaporkan probe dan checked dengan process.kill(pid,0); tidak memberi original descendant handles atau membership proof. |
| S10 host supervisor | E03 spawn candidate, retains launcher ChildProcess; metadata CIM/GetProcessById | Child handle berada dalam sandbox parent; observer menutup handles. Launcher-only emergency path tidak membuktikan helper/job/child cleanup. |
| S6 parent | E03 historical config/parent-inline.js dan evidence/run-s6.mjs | Parent waits child close; timeout kill owned child only. Tidak tersedia setelah parent keluar. |
| S13–S15 fixed client helper | E06 client-helper.ts: exact fork/no shell/no detach; owned-child fallback | Mengelola satu test client tanpa grandchildren; tidak memberi native job capability. Fallback historis tidak digunakan. |
| Dormant authority | E04 issue/lease/cancel/reconcile/CAS/events | Menerima synthetic trusted receipts; tidak memperoleh/memverifikasi OS handle. |
| Existing host APIs | Get-CimInstance1.0.0.0/CimCmdlets dan Get-Process3.1.0.0/Microsoft.PowerShell.Management; System.Diagnostics dipakai metadata S10 | API availability bukan reviewed complete-tree controller. Belum ada retained custody/member accounting/cleanup contract yang memenuhi Gate C. Tidak mengklaim managed/native implementation mustahil. |
| Bundled helper executables | S4 candidate list/hash dan package dependencies | Tidak ada documented/exported test-host Job API ditemukan; helpers tidak dijalankan sebagai discovery/control. |
| Reviewed host job integration | Source/scripts/tests search untuk CreateJobObject/AssignProcessToJobObject/TerminateJobObject/QueryInformationJobObject/IsProcessInJob/native interop | Tidak ditemukan dalam inspected integration; tidak ada approved addon/dependency. SDK internal Rust implementation tidak di-export ke Node host. |

Tidak memindai seluruh disk/semua installed utilities untuk mencari kill tool. Inventory dibatasi actual project/runtime artifacts; alat OS lain yang mungkin tersedia tidak dianggap approved owned-scope capability.

## 8. Proposed process-supervision contract

**DESIGN_SPECIFIED saja; tidak ada class/API/source/schema baru.** Future operations:

| Operation | Preconditions dan receipt |
|---|---|
| launchOwnedAttempt | Current project UUID/binding, attempt/generation/CAS, trusted host lifetime dan fresh invocation nonce; exclusive launch budget; valid strict profile; independent cleanup capability ready sebelum launch. Return ownership receipt, bukan READY. |
| observeProcessIdentity | Original retained process handle; OS creation time/executable digest; correlate nonce/current invocation dan parent relation. Pisahkan worker-reported dari host/OS observations. |
| verifyInvocationOwnership | Host custody proof + expected per-invocation members/relationship/nonce dan exact verified job scope; jangan menerima PPID-only scope. |
| cooperativeCancel | Durable intent committed dahulu; authenticated attempt/generation/nonce/request-bound local channel, bounded ack; ack tidak menutup scope. |
| observeExit / descendantExit | Wait original object identity, actual exit code/time/source, per-member identity; parent/launcher receipt tidak menggantikan child/helper. |
| unknownDescendants | Missing member/custody/exit/relationship → PROCESS_STATUS_UNKNOWN, no completeScope. |
| ownedTreeTerminate | Hanya verified owned job/legitimate retained handles dengan exact target set dan least rights; log request ID/mechanism/actor/result, stop sebelum action jika ambigu. |
| terminationReceipt | Request result dan independent exit/member accounting terpisah; idempotency digest dan provenance; no invented success on lost receipt. |
| quarantine | Preserve owner/generation/hold; dispatch CLOSED/retry false sampai explicit reconciliation. OS observation tidak mengubah epoch sendiri. |

| Identity field | Proposed authority/provenance | Current evidence |
|---|---|---|
| Project UUID, attempt ID, generation, binding/scope digest | Backend/durable authority, authenticated context | S12–S15 synthetic DB source; no production wiring. |
| Host lifetime ID + clock domain | Trusted host startup custody, bukan UI/worker input | Existing synthetic clock/host test fields only. |
| Invocation nonce | Mint trusted host once, bind launch/receipts | S10 fixed synthetic nonce; S16 nonce tidak dibuat. |
| Executable digest/path | Host read-only verified binary + process object correlation | Current binary hashes; S10 OS path historical. |
| Original process handle | In-memory OS capability owned by live supervisor; ownership transfer explicit | Launcher historical only; no S16 handle. |
| PID + OS creation time | OS query on same retained object; PID diagnostic index only | S10 historical snapshots; no current experiment. |
| Parent relation | OS/live creation correlation plus fixed launch receipt | S10 child PPID; intermediary6596 only reported. |
| Verified job membership | Owner-held query/custody evidence; no hidden broad scope | NOT VERIFIED, current bridge missing. |
| Exit/termination receipts | Trusted host observer, bounded immutable evidence digest | S10 cooperative observations; no forced receipt. |

Persist serializable identity/provenance/intent/receipt digests; keep live HANDLE capability hanya di host memory. Raw numeric HANDLE tidak durable/reacquirable pada host lain. Jangan menganggap reopened PID atau arbitrary job name mengembalikan old ownership. Receipt custody dan tamper protection masih desain.

## 9. Process ownership matrix

Topology usulan: test host → pinned outer Codex launcher → same-executable internal MXC helper → fixed Node foreground parent → one cooperative child. Helper adalah bagian runtime boundary, bukan izin menambah test workload/grandchild. Actual helper identity dan job membership tetap perlu dibuktikan.

| Process/category | Starter / original handle owner | Executable / creation / PID-PPID | Job / descendants | Cancel / exit observer / termination actor | Crash uncertainty |
|---|---|---|---|---|---|
| Conceptual AI OFFICE host | Future trusted launcher; self lifetime | Backend image/host ID belum wired; no S16 PID | Future per-attempt scope belum ada | Future authenticated cancel; OS supervisor observer/owned actor | Restart kehilangan RAM handles; quarantine. |
| Test-owned host supervisor | Fixed reviewed test launcher; owns direct spawned outer launcher | S10 Node15412 created00:42:33.4050300Z; S16 absent | Bukan otomatis member internal job | Host filesystem cancel; observes launcher; no current whole-tree actor | Host crash tidak otomatis menutup helper-owned job. |
| Pinned Codex outer launcher | Test host; host ChildProcess | S10 candidate252/PPID15412 created00:42:34.4766740Z | Source starts internal helper; job creator bukan outer launcher | CLI waits helper; host owns only outer handle | Forced outer death bukan demonstrated helper/child exit. |
| MXC foreground parent | SDK CreateProcessW; internal helper owns original process handle | S10 Node12592/PPID6596 created00:42:34.7116560Z | Source assigned before resume; actual job not queried | S10 reads cancel, owns child; SDK waits parent; no S16 host handle | Parent exit dapat mendahului child; internal teardown source vs observed berbeda. |
| Cooperative child | Foreground parent; parent ChildProcess | S10 Node4204/PPID12592 created00:42:34.8014730Z | Inheritance expected; actual membership unknown | Cooperative filesystem cancel; parent observes child; parent fallback ownership does not survive parent exit | Host lacks retained independent control/exit handle. |
| Internal helper / possible runtime helpers | Source outer launcher starts same codex internal entry; helper owns SDK job/foreground handles | S10 reported6596 has no captured executable/creation attestation | Job creator belum tentu member; other helper membership unknown | SDK wait/Drop/job termination internal; not host-callable | Unknown/leaked handle/helper persistence invalidates closure. |
| Unrelated active Codex / VS Code | User/IDE/service launcher, unrelated ownership | Tidak di-enumerasi/ditarget/control oleh S16 | Tidak boleh masuk test-owned scope | Tidak ada cancellation/termination authority | Jangan infer ownership karena nama/path sama; no targeting. |

Semua PID/time di tabel adalah **historical S10**, tidak di-query ulang atau digunakan untuk action S16. PPID tree bukan Job Object membership.

## 10. PID/creation-time/handle limitations

PID valid selama process hidup dan dapat dipakai ulang sesudahnya; PPID dapat mengacu predecessor yang sudah keluar. Executable path/hash mengidentifikasi image, bukan invocation. Nonce yang dilaporkan worker adalah correlation data, bukan independent authority. Harus mengikat seluruhnya ke original object/creation/custody.

S10 startedAt/journal timestamps bukan OS creation time. process-identities.json menyimpan creationTime dan StartTime ticks, namun metadata PowerShell Process object di-Dispose sebelum experiment berlanjut. Numeric tick/PID yang tersimpan tidak mengembalikan handle itu.

Future child observer perlu retain actual handle sebelum parent exit dan mempertahankan legitimate rights/custody. A fresh GetProcessById/OpenProcess setelah race bukan pengganti original process object tanpa identity revalidation. Wait/exit receipt harus diambil dari object yang sama; missing stdout, heartbeat, empty pipe, process-name/PID absence tidak cukup untuk complete-tree/effects claim.

.NET/PowerShell metadata APIs mungkin menjadi bagian implementasi masa depan, tetapi tidak ada reviewed existing complete-scope integration yang dapat dipakai sekarang. S16 tidak membuat bridge baru secara diam-diam untuk memenuhi prasyarat.

## 11. Job membership and breakaway analysis

Berikut jawaban J01–J20. SOURCE_VERIFIED menjelaskan intended pinned path; actual membership, flags dan handles tidak diperoleh pada S16.

| ID | Question | Finding |
|---|---|---|
| J01 | MXC menggunakan Job Object? | SOURCE_VERIFIED: BaseContainerRunner memakai UiJobObject untuk successful spawn. |
| J02 | Didukung pinned source? | Ya, Codex Cargo.toml/lock → exact SDK commit E02; tidak menganggap source sama dengan OS observation. |
| J03 | Komponen pencipta? | UiJobObject::new dalam SDK BaseContainerRunner::spawn_base, dieksekusi MXC helper. |
| J04 | Pemilik handle? | Unnamed private HANDLE dalam UiJobObject; dipindah BaseChild → BaseContainerSandboxProcess, internal helper. |
| J05 | Kill-on-close? | Constructor source memasang JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE; actual current flags tidak di-query. |
| J06 | Actual parent+child member? | NOT VERIFIED. Source assigns foreground suspended; default descendants expected inherit, tetapi tidak ada S16 runtime membership. |
| J07 | Helper termasuk? | Tidak dibuktikan. Job dibuat helper dan foreground assigned; creator/outer launcher tidak otomatis menjadi member. |
| J08 | Unrelated excluded? | Fresh unnamed job memberi intended narrow scope menurut source; actual member set belum dibuktikan. Tidak ada S16 termination. |
| J09 | Breakaway? | Constructor tidak memasang BREAKAWAY_OK/SILENT_BREAKAWAY_OK; selected root creation tidak meminta CREATE_BREAKAWAY_FROM_JOB. Seluruh actual ancestor chain/hostile behavior belum diverifikasi. |
| J10 | Nested compatible? | Windows mendukung conditional nesting; selected MXC + proposed outer job belum diuji. |
| J11 | Additional host job conflict? | UNKNOWN. Existing hierarchy, assignment ordering/UI constraints harus diperiksa sebelum merancang assignment; S16 tidak mengubah job. |
| J12 | Least privilege termination? | Future owned-job JOB_OBJECT_TERMINATE plus QUERY; process QUERY_LIMITED_INFORMATION/SYNCHRONIZE, PROCESS_TERMINATE hanya jika required. Assignment needs appropriate process rights. Tidak meminta PROCESS_ALL_ACCESS/debug privilege. |
| J13 | Semua descendants accounted? | NOT VERIFIED. SDK accounting active-count bukan host-held per-member receipt; warning drain dapat nonfatal. |
| J14 | Outer host crash? | Outer host bukan job owner. Rust Drop tidak dijamin pada forced process death; helper bisa tetap hidup. Source last-handle-close bergantung final owner handle closure. |
| J15 | Handle bocor? | Extra inherited/duplicated reference dapat menunda final-close cleanup; custody inventory diperlukan. |
| J16 | Ownership hilang? | Jangan reacquire/terminate berdasarkan angka; PROCESS_STATUS_UNKNOWN → quarantine. |
| J17 | Risiko active session? | Generic process-name/PID sweep/unknown parent job berisiko dan dilarang. Tidak digunakan; exact owned boundary wajib sebelum future action. |
| J18 | Recovery uncertain job? | S15 classify UNKNOWN/QUARANTINED, same owner/generation, hold1/dispatch CLOSED/retryAuthorized=false; tidak membunuh OS process. |
| J19 | Reviewed native integration tersedia? | Tidak ditemukan host bridge dalam current app/harness/scripts/dependencies yang expose owned job membership/termination/exit receipts. SDK internal bukan host bridge. |
| J20 | Perlu komponen baru? | Capability tambahan diperlukan untuk host-owned scope/custody/exit/cleanup. Implementasi bridge/helper/native addon/dependency atau job reconfiguration belum diotorisasi. S16 berhenti sebelum itu; tidak membangun/install apa pun. |

Unnamed private job tidak dapat direopen dengan OpenJobObject menggunakan nama yang tidak ada. Duplicating/closing handle milik MXC tanpa kontrak transfer/custody sah dilarang. Query per-member original identity, membership completeness, ancestor jobs dan handle inheritance diperlukan sebelum termination claims. Tidak membuat outer job/assign test process untuk mencoba nesting pada audit ini.

## 12. Cleanup state-machine design

State berikut adalah conceptual supervisor facts, **bukan tambahan enum phase produksi**. Fakta dapat bertumpang tindih; misalnya exit bisa mendahului ack. Jangan memaksa urutan ack-before-exit jika actual OS evidence berbeda.

| Conceptual state/fact | Required evidence / rule |
|---|---|
| Launch attempted | Durable exclusive intent sebelum spawn; belum membuktikan process ada. |
| Launch succeeded | Original process handle/spawn result; belum READY. |
| Child reported READY | Valid nonce/generation-bound protocol; belum independent OS-alive/membership. |
| RUNNING | READY + host OS-alive identity/custody validated. |
| CANCEL_REQUESTED | Current owner-authorized durable request; tidak berarti ack/exit. |
| CANCEL_ACKNOWLEDGED | Correlated cooperative ack; tidak berarti termination. |
| EXIT_OBSERVED | Foreground original object exited; child/helper masih terpisah. |
| FORCE_TERMINATION_REQUESTED | One scoped request recorded dengan exact target; bukan exit. |
| FORCE_TERMINATION_OBSERVED | Actual requested target exits independently observed; bukan otomatis complete scope. |
| DESCENDANT_EXIT_CONFIRMED | Each expected child/helper identity has reliable independent exit evidence. |
| PROCESS_TREE_ACCOUNTED | Verified complete member set + all exits + custody closure; no unknown member/residual. |
| PROCESS_STATUS_UNKNOWN | Lost identity/handle/membership/result, mismatch, timeout atau incomplete closure. |
| RECOVERY_REQUIRED | Unknown triggers quarantine, closed dispatch/no automatic retry; separate effects review. |

Normal path: launch facts → RUNNING → optional CANCEL_REQUESTED/ACK → root/descendant exits → PROCESS_TREE_ACCOUNTED. Owned terminate path memisahkan request, each observed result dan complete accounting. Any missing evidence → UNKNOWN → RECOVERY_REQUIRED. Parent exit tidak pernah meloncat langsung ke accounted. Late receipts tidak memulihkan expired ownership; terminalization tetap separate DB transaction.

## 13. Gate C feasibility decision

**NOT FEASIBLE. Gate A complete sebelum Gate B; Gate B contract, ownership, job dan crash/race design complete. Kedua strategi ditolak sebelum fixture atau launch.**

| Prasyarat | FEASIBLE_A | FEASIBLE_B |
|---|---|---|
| Exact binary; fixed synthetic design; no privilege/security change | Identity HOST_VERIFIED; fixed workload hanya design | Identity HOST_VERIFIED; tidak ada native component dijalankan |
| Invocation ownership | Direct launcher pattern tersedia; actual S16 invocation tidak dibuat | Test-host-owned job handle tidak tersedia |
| Independent surviving-child exit observer | S10 observer disposes handle; parent is child observer, akan keluar pada C-A. Reviewed retained-host method belum ada | Member handles dan membership query receipts tidak tersedia |
| Independent safe cleanup jika child/helper unresponsive | Launcher-only kill/parent-owned child kill + child timer tidak memenuhi requirement setelah parent exit | Tidak ada existing reviewed owned-job exclusive termination + fallback |
| Complete tree / unrelated exclusion | Actual helper/job boundary belum verified | Actual member set/nesting/handle custody belum verified |
| Timing distinguish teardown vs self-expiry | Bisa dispesifikasi, belum diuji; tidak memperbaiki missing cleanup | Tidak relevan tanpa legitimate owned job |
| Decision | Preconditions gagal → NO LAUNCH | Preconditions gagal → NO LAUNCH |

Stop rule berasal dari attachment S16 §15/§22: “If neither branch has all necessary safety prerequisites: DO NOT LAUNCH MXC” dan “A self-expiration timer alone is not sufficient evidence of guaranteed cleanup if the process could become unresponsive.” SDK internal termination support tidak memberikan host-callable capability. Current native integration gap tidak diselesaikan dengan new helper/addon/dependency, broader rights atau job modification dalam S16.

## 14. Experiment branch selected or NOT RUN

**NOT RUN.** Tidak memilih C-A maupun C-B. Actual MXC0, parent0, child0, additional sandbox0, retries0. Tidak menjalankan harmless discovery sandbox sebagai pengganti experiment. Tidak ada runtime failure/timeout/exit code yang bisa dilaporkan.

## 15. Test fixture, if created

**NOT APPLICABLE: no S16 root created.** Tidak ada canary/control/output/observation directory, ownership manifest, synthetic CODEX_HOME atau profile baru. Historical roots dibaca/hash dengan no-follow walk dan tidak dipakai writable. Tidak ada file fixture yang perlu dihapus/cleanup.

## 16. Strict profile semantic comparison, if executed

**S16 execution/effective-profile comparison: NOT RUN.** Read-only baseline: S8 profile has8deny/1minimal read/1workspace write; S10 mempertahankan root/minimal/tmpdir/slash_tmp, Project A-only workspace write dan explicit B/fake-private/fake-credentials/test-home/evidence denies, menambah denies config/supervisor/journal; network.enabled=false, ephemeral auth store, explicit windows.sandbox=mxc, --include-managed-config pada historical invocation.

S8 SHA B1D282CB0CBFB88CBFDC9C06CD99F8700B9BC83D34C69F18BDE5FC518D1F5CA5; S10 SHA CE67FF9E1C4E2C61AD2F7A9197639C1F0BDBF0F668EC05E7DFA1085F537642C5. Hashes preserved. No globs added, no drive/profile-wide grants, no temp permission broadening, no networking coordination. S16 tidak membaca actual credentials atau active global configuration untuk mencari permission bypass. Full effective merged-policy visibility tidak diklaim.

## 17. Exact sanitized invocation, if executed

**NOT RUN; S16 argv/cwd/env = none.** Tidak ada actionable launch command S16 yang dibuat atau dijalankan.

Historical S10 argv, for audit only: pinned codex.exe; -c cli_auth_credentials_store="ephemeral"; -c windows.sandbox=mxc; sandbox; --include-managed-config; --permission-profile ai-office-s10-2817f368-351c-41d1-8a73-f38005a3c08c; --; C:\Program Files\nodejs\node.exe; --eval; fixed historical parent text. Exact historical array berada di E03 evidence/invocation-spec.json. Tidak disalin sebagai izin menjalankan ulang atau direbind ke new fixture.

## 18. Parent and child identities, if executed

**No S16 process identity:** supervisor PID, launcher PID, parent PID, child PID, creation times, nonce, handles, exit codes semuanya NOT RUN, bukan fabricated zero/exit0.

Historical S10 independent metadata correlation: parent12592 startTicks639289177547116569, child4204 startTicks639289177548014730; both Node path pada §4, nonceInCommand=true. Launcher252 startTicks639289177544766746, same pinned candidate path, nonce present. Invocation nonce8a969039-fdb1-4788-a461-6d7c23c0b834 adalah public synthetic historical ID, tidak dipakai kembali. Host15412 nonceInCommand=false expected. Child PPID12592 matched; parent PPID6596 bukan launcher252. Missing intermediary image/creation/job receipt tetap UNKNOWN.

## 19. Termination/exit observations, if executed

**S16 termination request0; exit observations NOT RUN.** Tidak ada ownedTreeTerminate, cooperative cancel, emergency action, signal/kill/request/close-job atau actual target set.

Historical S10 ordering UTC: child+parent READY00:42:34.874; host ownership validated00:42:35.702; cancellation published.713; child ack.715; parent observes child exit/close.725; parent final ack/exit marker.728; launcher exit/close.768. Ini membuktikan child keluar sebelum parent pada workload kooperatif. Tidak menguji child alive setelah foreground exit, forced tree termination, job membership atau host crash.

## 20. Process-tree accounting

S16 membuat **zero test-owned runtime processes**, maka tidak ada fresh test tree/residual yang perlu diaccount. Ini bukan PROCESS_TREE_ACCOUNTED runtime receipt dan tidak menghasilkan PASS pada S16-38. Ordinary read-only tooling processes bukan sandbox test topology/control experiment.

Historical E03 process-final.json pada00:43:46.2957970Z mencatat host15412/launcher252/parent12592/child4204/inspector22712/reported6596 absent. Pembacaan file ini bukan re-query old PIDs sekarang, bukan exhaustive kernel descendant inventory, dan tidak memberi license menarget PID itu.

All-descendant closure pada future experiment harus membuktikan exact legitimate member set termasuk helper yang relevan, retained object identities, per-member exit dan accounting scope. Jika satu member unknown/residual, clean acceptance ditolak; no automatic replacement/retry.

## 21. Deadline and cleanup results

Actual timers/experiment duration/emergency cleanup: **NOT RUN**. Tidak ada deadline exceeded atau silent extension karena tidak ada experiment.

Design-only candidate ceilings untuk future separately authorized preflight: bootstrap≤5s sejak launch; child READY≤5s sejak parent bootstrap, masih dibatasi overall; branch observation≤5s; child independent self-expiration10s sejak child READY; parent finite deadline≤15s sejak parent startup; overall supervisor20s sejak issuance dan post-test accounting≤5s sesudah bounded stop. Parent exit target≤1s setelah independently observed child alive, supaya ada separation sebelum child self-expiry; actual observer/latency feasibility wajib direview sebelum launch. Failing internal/host bound tidak boleh menambah waktu diam-diam.

Emergency plan harus independent dari parent dan child event loops: verified host-owned scope/handles dengan exit observation. Timer saja tidak cukup; launcher-only kill tidak diterima sebagai guaranteed whole tree cleanup. SDK root wait dapat unbounded pada exceptional path dan5s job drain warning bukan guaranteed20s host completion. Karena emergency capability belum ada, design ceilings ini **tidak mengizinkan execution**.

## 22. Concurrency/crash-window analysis

Seluruh P01–P20 berikut **DESIGN_SPECIFIED / runtime NOT RUN**. “Available OS evidence” berarti jenis bukti yang diperlukan/bisa diminta pada desain; availability actual untuk S16 tetap sebagaimana §7/§13. Automatic retry **FORBIDDEN pada seluruh20 skenario**, termasuk jika candidate eligibility kelak dinilai setelah reconciliation.

| ID | Actors / race window | Unsafe outcome | Invariant / prevention | Required OS evidence | Durable classification | Recovery |
|---|---|---|---|---|---|---|
| P01 | Host cancel ↔ child exit | Cancel dan exit bersamaan; terminal success bisa menang salah. | I05/I07/I25; serialize receipt/stop intent, jangan samakan ack dan exit. | Original child wait/exit + request sequence, nonce, generation. | Pending cancel atau UNKNOWN → UNCERTAIN; INTERRUPTED hanya dengan closure/effects sah. | Reconcile intent/receipt idempotently; jangan menulis ulang terminal. |
| P02 | Parent ↔ child | Parent keluar dahulu; orphan dianggap selesai. | I06/I07/I08; child diamati independen. | Retained child handle signaled/exit code + membership accounting. | UNKNOWN/QUARANTINED sampai scope lengkap. | Observe child; hanya cleanup capability terverifikasi. |
| P03 | Launcher ↔ host | Launcher exit sebelum child receipt; bootstrap dianggap tak pernah terjadi. | I04/I08; unknown launch outcome bukan noLaunch. | Original launcher handle + incomplete child identity/ownership manifest. | UNCERTAIN, dispatch CLOSED; noLaunch tidak boleh ditebak. | Reconstruct owned scope; evidence kurang tetap quarantine. |
| P04 | Old child ↔ PID successor | PID dipakai ulang; cleanup membunuh proses baru. | I01/I02/I03; original handle dan creation/nonce harus cocok. | Original handle, creationTicks, digest; PID/PPID snapshot bukan otorisasi. | IDENTITY_MISMATCH/UNKNOWN, hold dipertahankan. | Jangan reopen/kill PID untuk melengkapi bukti yang hilang. |
| P05 | Host crash ↔ live tree | Controller mati, helper/child tetap hidup. | I08/I11/I13; crash cleanup harus didukung owned boundary. | Source kill-on-close hanya bila final handle owner benar-benar tutup; no live crash evidence. | PREVIOUS_HOST/UNKNOWN → quarantine; owner/generation tetap. | Inspector baru read/classify; no handle restoration by number. |
| P06 | Host crash setelah terminate request | Request durable tetapi outcome OS belum tersimpan. | I05; requested bukan observed. | Request ID + actual wait/exit bila masih sah tersedia. | UNKNOWN, dispatch CLOSED. | Independent exit/closure reconciliation; no blind resend. |
| P07 | OS termination ↔ receipt loss | Semua mati tetapi receipt hilang; retry menduplikasi efek. | I05/I25; absence bukan closure/effects proof. | Original wait receipt bila ada; tidak ada receipt berarti uncertainty. | UNKNOWN/EXIT_REPORTED; no automatic retry. | Reconcile artifacts dan OS scope terpisah, retain audit. |
| P08 | Parent gone ↔ surviving child | Exit root dipakai menghapus hold saat child menulis. | I06/I07/I22; residual blocks acceptance. | Live verified child handle + job accounting. | QUARANTINED; child alive/unknown bukan success. | Prevalidated scoped cleanup saja; jika tidak ada, stop/retain. |
| P09 | Child exited ↔ parent alive | Child exit dianggap tree closed; parent masih aktif. | I08; setiap scope member wajib exit. | Parent original handle + launcher/helper observations. | UNKNOWN sampai root/helper lengkap. | Observe parent, cooperative cancel bila otoritas masih sah. |
| P10 | Lease expires ↔ OS alive | Epoch diganti saat worker lama masih menulis. | I10/I25; lease expiry tidak membunuh proses. | Lease clock classification + independent process evidence. | LEASE_EXPIRED → UNCERTAIN/hold1; no generation takeover. | Quarantine melalui recordLeaseConcern/reconcile; no new dispatch. |
| P11 | New generation ↔ old incomplete scope | Replacement start berbarengan old child. | I08/I10/I22; project hold tidak boleh dilepas. | Current g/v/CAS + incomplete membership/exit evidence. | Replacement conflict; dispatch CLOSED, retryAuthorized=false. | Reconcile old scope dan effects; no silent hold release. |
| P12 | Owner ↔ leaked job handle | Last-handle-close tidak terjadi; cleanup saat crash tertunda. | I13/I14; handle custody/noninheritance harus diaudit. | Duplicate/inherit custody receipt dan owned-job member evidence; belum tersedia. | PROCESS_STATUS_UNKNOWN/RECOVERY_REQUIRED. | Tidak menutup handle asing; separate custody review. |
| P13 | Unexpected owned job close | Kill-on-close mematikan anggota sebelum receipt; kehilangan outcome. | I05/I13; handle lifecycle eksplisit. | Close provenance + independent member exit receipts. | UNKNOWN sampai evidence lengkap; jangan success by close. | Idempotent reconciliation; jangan menebak exit code. |
| P14 | Unexpected job member | Group termination bisa mengenai unrelated process. | I02/I03/I12; exact target set wajib diketahui. | Verified membership plus handle-bound identities. | BLOCK termination, quarantine scope. | Stop sebelum aksi; no broad cleanup; Owner review scope. |
| P15 | SDK/host job assignment fails | Process lolos containment atau status launch ambigu. | I04/I12/I13; no resume before assignment. | SDK source fail-closed, assign result, root handle exit; S16 NOT RUN. | NoLaunch hanya jika positively established; lainnya UNKNOWN. | Retain setup failure; no retry/new native patch in S16. |
| P16 | Outer job ↔ MXC nested job | Assign konflik, rules berubah atau launch gagal. | I13/I14/I15; nesting bukan asumsi OS-version. | Actual job hierarchy/UI/limits/assignment receipt; unavailable. | UNKNOWN/BLOCKED launch; no policy weakening. | Separate compatibility review; no outer-job experiment here. |
| P17 | Cancel ack ↔ no exit | Worker ack tetapi terus berjalan. | I05/I07; ack bukan exit receipt. | Ack nonce/request plus missing wait/complete scope. | Pending cancellation; quarantine jika deadline/continuity gagal. | Observe/approved scoped termination; no automatic terminal. |
| P18 | Artifacts write ↔ missing DB terminal | Worker keluar sesudah side effect, SQL belum commit. | I25; DB dan filesystem bukan satu transaksi. | OS exit, output provenance/hash, separate effects reconciliation. | UNKNOWN effects → quarantine; terminal gate tidak terpenuhi. | Review staging/promote protocol; no automatic replay. |
| P19 | Restart ↔ unreopenable job | Old raw numeric HANDLE/PID dipakai proses host baru. | I01/I11/I13; handle bukan durable identifier. | New host ID/domain; unnamed internal job tidak bisa OpenJobObject by name. | PREVIOUS_HOST/UNKNOWN; no reacquired capability. | Inspector classify only; separately designed broker/custody needed. |
| P20 | Stale success ↔ quarantine | Late success memulihkan old owner atau menutup attempt. | I10/I11/I25; stale g/v/nonce ditolak. | Current CAS/lease status + receipt identity + inspector provenance. | STALE_OWNER/LEASE_INVALID/CONFLICT; quarantine tetap. | Retain late observation as evidence; no revival/automatic retry. |

## 23. Durable S13–S15 integration design

Read-only actual source tetap schema user_version5, profile s15-isolated-authority-v1, four STRICT tables. S16 tidak memigrasi/membuka DB atau menambah OS states pada PhaseSchema.

Project UUID/attempt/generation/owner/host lifetime/nonce/scope digest mengikat future launch ownership receipt. Durable cancel intent melalui requestCancellation mendahului cooperative channel. recordCancellationAck hanya ack; recordCancellationExit memerlukan trusted-host receipt dengan creationTicks, executableDigest, invocationNonce, scopeDigest dan completeScope=true. EvidenceDigest/closureDigest mengikat evidence; **source literal synthetic-trusted-host bukan authentication OS dengan sendirinya**. Factory WeakMap capability adalah test custody, belum production observer.

Unknown process identity atau incomplete members harus diklasifikasi UNKNOWN, completeScope=false, effectsClassified=false pada recovery evidence. Existing processClassification akan UNKNOWN untuk status/parent/child/scope yang kurang; missing creation/digest atau mismatched generation/host memberi IDENTITY_MISMATCH. Uncorrelated exit menjadi EXIT_REPORTED; correlated synthetic cancellation exit dapat MATCHED_SYNTHETIC_EXIT. Jangan mengubah trusted receipt fields untuk memaksa completeScope=true.

reconcile memakai current generation/version/phase CAS dan inspector capability, nonterminal → UNCERTAIN (atau tetap RECONCILIATION_REQUIRED), persist recovery decision/event; **owner/host execution lama dan generation dipertahankan**, conflictHeld1, dispatch CLOSED, retryAuthorized=false. RECOVERY_CLASSIFIED writerHostInstanceId adalah inspector baru, berbeda dari execution owner; journal provenance binding tetap dipertahankan. Terminal classification read-only/immutable. recordLeaseConcern menandai expired/bad-clock/previous-host sebagai quarantine; tidak membuat replacement.

Confirmed owned exit dapat dicatat hanya oleh future trusted observer; terminal commit tetap valid phase/lease/current-authority transaction. S14 current cancellation terminalization memerlukan ack+exit dan effectsClassified untuk launched attempt. **Forced exit tanpa ack tidak otomatis memenuhi kontrak itu**; kasusnya masuk uncertainty/reconciliation sampai future separately reviewed integration menentukan disposition. Tidak mengubah S14 atau menciptakan bypass di S16.

Tidak ada SQL transaction yang membuat Windows kill/filesystem effect atomic. OS generation fencing tidak menghapus handle write stale worker. Physical staging/promotion/output fencing, authenticated receipt custody, host restart broker dan effects reconciliation masih diperlukan. Candidate retry class bukan authorization; semua paths tetap retryAuthorized=false/hold1.

## 24. Security findings

| ID | Finding / evidence level | Implication / disposition |
|---|---|---|
| F01 | Missing independent host-owned surviving-child/helper cleanup; SOURCE_VERIFIED integration gap | Gate C BLOCKED; no runtime. S10 timer/parent handle tidak memenuhi new branch. |
| F02 | Internal SDK job exists, private unnamed handle; SOURCE_VERIFIED | Bukan absennya Windows group control; host custody/membership bridge missing. No handle stealing or native build. |
| F03 | SDK job drain can warn-and-continue; root reap wait can be unbounded; SOURCE_VERIFIED | Outer exit0 bukan complete-tree receipt; future host needs independent accounting/deadline strategy. Tidak ada observed leak/timeout S16. |
| F04 | Historical intermediary6596 only reported PPID; HOST_VERIFIED retained evidence | Actual helper identity/member closure incomplete untuk stronger claims. Tidak query/kill old PID. |
| F05 | Dormant receipt trust/DB CAS bukan OS proof/fencing; SOURCE_VERIFIED | Preserve quarantine and production block. No source fix in report-only scope. |
| F06 | No actual policy conflict/forbidden access/unintended termination observed | Tidak ada S16 runtime, maka tidak boleh disimpulkan OS containment PASS atau vulnerability/escape. |

Required invariants, dengan status dibatasi evidence aktual:

| ID | Invariant | Status | Evidence / limit |
|---|---|---|---|
| I01 | Identity melebihi PID | DESIGN_SPECIFIED | §8/§10; S10 historical correlation bukan retained host child authority. |
| I02 | Hanya verified test-owned target | DESIGN_SPECIFIED | §8/§11; S16 tidak membuat target. |
| I03 | Tidak terminate unrelated process | HOST_VERIFIED | Zero termination action; bukan stress-test exclusion. |
| I04 | Launch berbeda dari READY | DESIGN_SPECIFIED | §12 event model; historical S10 menyimpan keduanya. |
| I05 | Termination requested berbeda dari exit | DESIGN_SPECIFIED | §12/P06/P17; no S16 terminate. |
| I06 | Parent exit berbeda dari child exit | DESIGN_SPECIFIED | §12/P02/P08. |
| I07 | Child exit diamati independen | DESIGN_SPECIFIED | §10/§12; S16 runtime NOT RUN. |
| I08 | Unknown tree tidak dianggap accounted | DESIGN_SPECIFIED | §12/§20; no runtime scope created. |
| I09 | Tidak kill by process name | HOST_VERIFIED | Tidak ada kill/control command. |
| I10 | No replacement setelah lease expiry | SOURCE_VERIFIED | lease/repository/recovery hold1, dispatch CLOSED; historical tests only. |
| I11 | Unknown → quarantine | SOURCE_VERIFIED | recovery.ts classifyRecovery; §23. |
| I12 | Membership sebelum job claims | DESIGN_SPECIFIED | §11/§13; runtime membership NOT VERIFIED. |
| I13 | Job ownership sebelum termination | DESIGN_SPECIFIED | §9/§11; SDK internal handle bukan host capability. |
| I14 | Breakaway assumptions eksplisit | DESIGN_SPECIFIED | §6/§11; source flags vs actual chain dipisahkan. |
| I15 | Tidak melemahkan strict policy | HOST_VERIFIED | S8/S10 config hashes unchanged; no S16 policy/run. |
| I16 | Tidak elevation | HOST_VERIFIED | No privilege request or privileged helper execution. |
| I17 | Tidak detached/grandchild test | HOST_VERIFIED | No sandbox/test tree launched. |
| I18 | Tidak production DB mutation | HOST_VERIFIED | No SQL open/write; schema/files hash unchanged. |
| I19 | Tidak real worker | HOST_VERIFIED | No worker/app-server command. |
| I20 | Tidak inference/paid API | HOST_VERIFIED | No provider call/auth; future enforcement unverified. |
| I21 | Tidak mulai S17 | HOST_VERIFIED | Hanya dua reports S16; no later milestone actions. |
| I22 | Residual blocks clean acceptance | DESIGN_SPECIFIED | §12/§20; no runtime PASS. |
| I23 | OS support bukan host job capability | DESIGN_SPECIFIED | §6/§7/§13. |
| I24 | Foreground cleanup bukan arbitrary forced cleanup | DESIGN_SPECIFIED | §5/§6; neither experimentally verified in S16. |
| I25 | DB fencing bukan OS kill | SOURCE_VERIFIED | No child_process/Job APIs in attempt-control; §23. |

## 25. Source/fixture integrity

E08 before baseline cocok dengan final S13–S15 inventory:163 AI OFFICE files,50 installed Codex,647 Hermes tracked,11 historical roots373files; additional original S12 root264 +pipeline roots1532. Final comparison membatasi changes pada dua report baru, **163/163 original hashes unchanged,165 total**. Tidak ada deletion, source/test/schema/package/historical report change.

| Protected scope | Measured unchanged files | Boundary |
|---|---|---|
| AI OFFICE outside node_modules | 163/163 | Termasuk brain/reader.ts, nine attempt-control files, all existing tests/docs/packages. |
| Installed Codex0.162.1 | 50/50 | Package tree saja; bukan whole VS Code extension/config audit. |
| Historical11 roots | 373/373 | Includes S4 candidate61files, S10 evidence43files. Existing S5R2 junction metadata preserved without traversal. |
| Original S12 wFgzkQ | 264/264 | Raw file hashes; no DB open. |
| Pipeline fresh S12 vKEa73 | 113/113 | Includes artifact-inventory.json. |
| Pipeline S13 LaSdyf | 174/174 | Includes artifact-inventory.json. |
| Pipeline S14 ITbdkM | 246/246 | Includes artifact-inventory.json. |
| Pipeline S15 O9ZIZ9 | 999/999 | Includes provenance repro/repair/final-audit/reporters/manifests. |
| Hermes3D tracked | 647/647 | HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing modified package-lock.json unchanged. |

Historical fixture total **2169 regular files across16 roots**. Additional five roots have0reparse; historical11 have one known S5R2 junction whose relative/target metadata match. No traversal of its target during no-follow inventory. node_modules/tool caches/untracked Hermes/global security/config/Google assets di luar measured hashes; tidak mengklaim full-disk/system unchanged.

Existing pipeline manifests retain detailed fixture inventories. Companion §2 mencatat exact source/baseline hashes, remote-source text hashes, root list dan key artifacts; laporan ini tidak membuat third evidence file. New S16 fixture/source hash inventory empty karena tidak ada fixture.

Tidak ada credential/provider auth access, inference/spend, SQL write, security setting change atau process-control action menurut scoped action ledger. Ini activity/scope verification, bukan global syscall/registry/network forensic trace. Semua historical evidence retained, tidak dihapus/direwrite. Active sessions tidak ditarget; tidak memerlukan broad process enumeration.

## 26. Unverified production properties

Forced whole-tree termination; bounded host-crash cleanup; helper ownership and exclusive membership; nested-job compatibility; leaked-handle recovery; hostile/detached/breakaway/arbitrary grandchildren; reliable production receipt custody; physical stale-worker output fencing; real app-server thread/turn/tools/approval/skills/cancellation; credential custody; current account subscription entitlement; included-only hard billing enforcement; production authority migration/task eligibility/backend wiring: **NOT VERIFIED/BLOCKED sebagaimana matrix**.

No model/provider usage pada S16 tidak membuktikan subscription eligibility atau spend cap. No network test bukan egress certification. Historical loopback denial tidak menutup public egress gate. Database test PASS tidak membuktikan Windows supervisor production-ready.

## 27. Final classification

**M02-02S16 CONDITIONAL — PROCESS-TREE CONTROL DESIGN COMPLETED — SAFE TERMINATION EXPERIMENT NOT AUTHORIZED BY PRECONDITIONS — REAL WORKER BLOCKED.**

Gate A/B audit/design selesai; Gate C NOT RUN karena NOT FEASIBLE. Gate D scoped integrity completed untuk documentation-only branch. Gate E CONDITIONAL, bukan FULL/LIMITED runtime acceptance. S16-01…56 ada di companion; zero MXC_BEHAVIOR_VERIFIED/OS_VERIFIED claim untuk fresh runtime.

## 28. Recommended next bounded milestone

Satu follow-up: **Bounded test-only Windows process-control bridge implementation and review**, hanya setelah otorisasi terpisah. Scope minimum: trusted live host custody atas per-invocation process/group handles; original identity/creation correlation; exact membership query termasuk helpers; targeted terminate request + independent member exit receipts; bounded failure cleanup dan explicit nesting/last-handle/crash semantics. Sediakan reviewable mechanism sebelum ada MXC experiment baru.

Tidak mengubah production backend/DB atau custody/billing, tidak menjalankan worker/inference, tidak memilih dependency/security elevation otomatis. S16 tidak memulai S17/follow-up tersebut. Hasil sekarang tidak mengotorisasi second experiment atau native build.

## 29. Owner decisions required

Tidak diperlukan approval rutin untuk pekerjaan S16 yang selesai. Owner perlu menilai dua laporan dan memutuskan apakah mengotorisasi **separate test-only process-control bridge implementation/review** dengan kebutuhan §28. Specific missing capability adalah independent legitimate host-held scope control + membership/exit/cleanup ketika parent hilang; bukan izin terminate arbitrary process atau full access.

Implementasi native helper/DLL/addon/dependency, perubahan actual job configuration/production source atau broader OS rights memerlukan otorisasi baru menurut attachment §14/§34; belum diberikan dan belum dilakukan. Design tidak mensyaratkan harus native: jika future reviewed existing managed mechanism memenuhi custody/identity/scope/bounds, itu perlu dibuktikan sebelum dipakai. Tidak meminta perubahan Windows security atau active Codex.

Evidence register:

- E01 — Pinned Codex source: [release rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0), [debug_sandbox.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs), [sandboxing/manager.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/sandboxing/src/manager.rs), [mxc-sandbox/lib.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs), [windows.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/windows.rs), [native.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/native.rs), [policy.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs), [Cargo.toml](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/Cargo.toml), [Cargo.lock](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/Cargo.lock). Tidak memakai main.
- E02 — Native dependency yang dipatok E01: microsoft/mxc commit b21120168d70befe12356411423266bfef168446, mxc-sdk1.0.0. [base_container_runner.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs), [job_object.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/job_object.rs), [sandbox_process.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/core/mxc_common/sandbox_process.rs). Ini source review, bukan SDK API execution.
- E03 — Retained S10 root: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s10-2817f368-351c-41d1-8a73-f38005a3c08c. Dibaca: supervisor/supervisor.mjs, parent-inline.cjs, child-inline.cjs; evidence/process-identities.json, process-final.json; config/semantic-diff.json dan test-home/config.toml. S6 root dan S8 profile pada §25 juga diperiksa. Historical files tidak dieksekusi ulang.
- E04 — [S13–S15 pipeline summary](M02-02S13_S15_PIPELINE_SUMMARY.md), tiga stage reports/matrices, serta actual src/server/attempt-control/{contracts,state-machine,schema,test-storage,journal,repository,lease,cancellation,recovery}.ts.
- E05 — Current read-only SHA-256, PE metadata, Authenticode dan OS metadata; historical S4 evidence/version.json sebagai versi candidate. Tidak menjalankan codex --version/help, SDK support probe, sandbox atau Node workload.
- E06 — Actual src/server/index.ts; src/server/runtime-security/supervisor.ts; scripts/dev.mjs; tests/integration/durable-attempt-foundation/client-helper.ts dan package.json. Pencarian source/scripts/tests untuk Job APIs/native bridge; package dependencies diperiksa.
- E07 — [Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [Nested Jobs](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs), [Process Handles and Identifiers](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers), [Process Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights), [JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information); [Node v24.21.0 child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html); [OpenAI Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox). Current documentation bukan runtime attestation pada pinned binary.
- E08 — Scoped before/after file-hash comparisons, §25 dan companion §2. AI OFFICE163, installed Codex50, Hermes tracked647, historical fixtures2169 regular files. No-follow fixture walk; reparse metadata dibandingkan terpisah.
- E09 — S16 action ledger: attachment/source/artifact reads, metadata/hash/signature queries, official-reference retrieval, dua report writes dan static document validation. MXC0, sandbox parent0, child0, test root0, termination0, SQL connections0, inference0. Reference browsing/HTTP source retrieval adalah research traffic yang diminta; zero network di sini berarti zero sandbox/test/provider connections, bukan zero seluruh aktivitas network host.
