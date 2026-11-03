# M02-02S16 — Process-Tree Security Gate Matrix

Tanggal: 30 Oktober 2026, Asia/Jakarta. Companion: [Process-Tree Supervision Report](M02-02S16_PROCESS_TREE_SUPERVISION_REPORT.md) (A). Classification: **CONDITIONAL; Gate C NOT FEASIBLE / NOT RUN; REAL WORKER BLOCKED.**

## 1. S16-01 through S16-56

Status menunjukkan evidence untuk requirement tersebut, bukan overall PASS. SOURCE_VERIFIED = inspected code; DOCUMENTED = official description; DESIGN_SPECIFIED = proposed contract; HOST_VERIFIED = scoped metadata/file/activity verification. MXC_BEHAVIOR_VERIFIED/OS_VERIFIED memerlukan actual relevant runtime evidence. NOT RUN tidak dipromosikan oleh historical results.

| Gate | Requirement | Status | Exact evidence / limit |
|---|---|---|---|
| S16-01 | Existing source reviewed | SOURCE_VERIFIED | A §3, §7; src/server/runtime-security/supervisor.ts dan sembilan attempt-control modules dibaca. |
| S16-02 | S10 process evidence reviewed | HOST_VERIFIED | E03; S10 supervisor.mjs, parent/child-inline.cjs, process-identities.json, process-final.json. Historical, tidak diulang. |
| S16-03 | S13–S15 authority reviewed | SOURCE_VERIFIED | E04; lease.ts, cancellation.ts, recovery.ts, repository.ts, journal.ts; schema user_version5. |
| S16-04 | Pinned Codex identity | HOST_VERIFIED | E05; S4 version.json + current candidate SHA-256/signature; A §4. |
| S16-05 | Node identity | HOST_VERIFIED | E05; current Node ProductVersion24.21.0, SHA-256/signature; A §4. |
| S16-06 | Active Codex preserved | HOST_VERIFIED | E08; seluruh50 global package files identik; package.json0.162.1, path terpisah. |
| S16-07 | Actual MXC process path assessed | SOURCE_VERIFIED | E01; debug_sandbox.rs → sandboxing/manager.rs → same-executable MXC helper → windows/native.rs → pinned SDK. S10 PPID6596 belum attested. |
| S16-08 | Process topology defined | DESIGN_SPECIFIED | A §9; tree usulan dan reported intermediary historis dibedakan. Tidak ada tree S16. |
| S16-09 | Launcher ownership | DESIGN_SPECIFIED | A §7/§9; existing host owns spawned launcher only; new S16 launch NOT RUN. |
| S16-10 | Foreground ownership | DESIGN_SPECIFIED | A §9; SDK owns foreground process handle menurut source; tidak ada current host-held foreground handle. |
| S16-11 | Child identity correlation | DESIGN_SPECIFIED | A §10/§18; historical nonce/executable/creation/PID/PPID; future child must be independently observed. |
| S16-12 | Process creation-time handling | DESIGN_SPECIFIED | A §8/§10; OS creationTicks terpisah dari host timestamp; no fresh S16 process sample. |
| S16-13 | PID reuse risk addressed | DESIGN_SPECIFIED | A §10, P04/P19; retained handle + creation/nonce correlation; no PID-only targeting. |
| S16-14 | Process handle capabilities | SOURCE_VERIFIED | E02/E03/E06; SDK handles internal; S10 metadata opens then disposes handles; no host-owned job bridge. |
| S16-15 | Job Object usage assessed | SOURCE_VERIFIED | E01/E02; Cargo.toml/lock pin SDK b21120168d70befe12356411423266bfef168446; UiJobObject::new/assign_process. |
| S16-16 | Job membership evidence | NOT VERIFIED | A §11; no actual host job handle/member enumeration. Source expectation bukan membership receipt. |
| S16-17 | Nested-job compatibility | NOT VERIFIED | E07 nested-jobs; OS supports conditional hierarchy, selected MXC/host compatibility not tested. |
| S16-18 | Breakaway behavior assessed | SOURCE_VERIFIED | E02 job_object.rs constructor sets only KILL_ON_JOB_CLOSE; runner CREATE_SUSPENDED, no breakaway flag in reviewed creation path; runtime untested. |
| S16-19 | Kill-on-close ownership assessed | SOURCE_VERIFIED | E02; unnamed job owned by MXC helper, SDK RAII; last-handle-close semantics E07; host ownership unproven. |
| S16-20 | Safe cleanup capability | BLOCKED | A §13; no reviewed independent cleanup of surviving child/helper after foreground exits; FEASIBLE_A and B fail. |
| S16-21 | No unrelated process risk | HOST_VERIFIED | E09; no control target or termination action created. Future membership exclusions still required. |
| S16-22 | Strict profile preserved | SOURCE_VERIFIED | E03; retained S8/S10 profiles hashed unchanged. No S16 effective policy or profile execution. |
| S16-23 | Network remains disabled | HOST_VERIFIED | E03 network.enabled=false; E09 zero sandbox/test connections. Official-reference retrieval used research network. |
| S16-24 | Test fixture ownership | NOT APPLICABLE | A §15; no new S16 root/fixture; historical fixtures only read/hash. |
| S16-25 | Gate C feasibility | BLOCKED | A §13; NOT FEASIBLE; preconditions do not authorize Gate C. |
| S16-26 | One MXC invocation ceiling | HOST_VERIFIED | E09; MXC0/1; additional sandbox0; no support-discovery launch. |
| S16-27 | Parent bootstrap | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-28 | Child bootstrap | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-29 | Filesystem A/B sanity | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-30 | Parent-child identity | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-31 | Child alive before selected action | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-32 | Foreground exit observation | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-33 | Owned termination request, if applicable | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-34 | Job membership verified, if applicable | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-35 | Parent exit confirmed | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-36 | Child exit confirmed | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-37 | Launcher exit confirmed | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-38 | Complete test-tree accounting | NOT RUN | A §14–§20; no Gate C invocation. Fresh S16 runtime evidence NOT RUN; S10 tidak dipromosikan. |
| S16-39 | No unrelated process termination | HOST_VERIFIED | E09; zero termination requests/actions, no process-name/PID/tree kill. |
| S16-40 | Deadline and cleanup integrity | NOT RUN | A §21; no running experiment, no deadline result or emergency action. Proposed bounds are design only. |
| S16-41 | Fixture/hash integrity | HOST_VERIFIED | E08; all2169 historical fixture files hashed unchanged; no new fixture. |
| S16-42 | No production source changes | HOST_VERIFIED | E08; all163 original AI OFFICE files unchanged, exactly2 report additions. |
| S16-43 | No real database migration | HOST_VERIFIED | E08/E09; schema.ts unchanged, no SQLite connection/open/migration or production DB write. |
| S16-44 | No model inference | HOST_VERIFIED | E09; no provider/model/runtime invocation. |
| S16-45 | No paid API/credits | HOST_VERIFIED | E09; no paid API/credit request. Does not verify future billing enforcement. |
| S16-46 | No Windows security modification | HOST_VERIFIED | E09; no ACL/firewall/Defender/UAC/registry/PATH write or elevation. No whole-host security-state attestation. |
| S16-47 | Forced tree cleanup capability | NOT VERIFIED | A §6/§7/§13; internal SDK kill exists, no verified host-owned group-control boundary. |
| S16-48 | Host crash cleanup | NOT RUN | A §6, P05–P07/P12/P19; no forced crash experiment or durable handle custody. |
| S16-49 | Hostile/detached process containment | NOT RUN | A §26; hostile/detached/grandchildren excluded, never launched. |
| S16-50 | Production supervisor integration | BLOCKED | E06; startBackend has no attempt-control dispatch/OS integration; production not activated. |
| S16-51 | Production output fencing | NOT VERIFIED | A §23/§26; DB CAS cannot revoke existing OS write access. |
| S16-52 | Real app-server | NOT RUN | E09; no app-server launch/integration test. |
| S16-53 | Credential custody | NOT VERIFIED | A §26; no real credentials accessed; custody implementation not established. |
| S16-54 | Subscription entitlement | NOT VERIFIED | A §26; account eligibility/entitlement not inspected. |
| S16-55 | Included-only billing | NOT VERIFIED | A §26; zero spend is not included-only enforcement. |
| S16-56 | Real worker activation | BLOCKED | A §27; missing supervision, physical fencing, app-server/custody/account/billing gates. |

Total56: SOURCE_VERIFIED8; HOST_VERIFIED14; DESIGN_SPECIFIED6; NOT VERIFIED7; BLOCKED4; NOT APPLICABLE1; NOT RUN16. Fresh MXC_BEHAVIOR_VERIFIED0, OS_VERIFIED0. Tidak menghitung desain atau jumlah gate sebagai bukti forced cleanup.

## 2. Exact evidence for each gate

Setiap gate pada §1 memiliki locator A-section/E-code yang spesifik. E01–E09 register di bawah; §3 menjelaskan source-vs-runtime. Source/local files dibaca, references fetched; tidak menjalankan historical scripts atau membuka historical DB.

- E01 — Pinned Codex source: [release rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0), [debug_sandbox.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs), [sandboxing/manager.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/sandboxing/src/manager.rs), [mxc-sandbox/lib.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs), [windows.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/windows.rs), [native.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/native.rs), [policy.rs](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs), [Cargo.toml](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/Cargo.toml), [Cargo.lock](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/Cargo.lock). Tidak memakai main.
- E02 — Native dependency yang dipatok E01: microsoft/mxc commit b21120168d70befe12356411423266bfef168446, mxc-sdk1.0.0. [base_container_runner.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs), [job_object.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/job_object.rs), [sandbox_process.rs](https://github.com/microsoft/mxc/blob/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/core/mxc_common/sandbox_process.rs). Ini source review, bukan SDK API execution.
- E03 — Retained S10 root: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s10-2817f368-351c-41d1-8a73-f38005a3c08c. Dibaca: supervisor/supervisor.mjs, parent-inline.cjs, child-inline.cjs; evidence/process-identities.json, process-final.json; config/semantic-diff.json dan test-home/config.toml. S6 root dan S8 profile pada §25 juga diperiksa. Historical files tidak dieksekusi ulang.
- E04 — [S13–S15 pipeline summary](M02-02S13_S15_PIPELINE_SUMMARY.md), tiga stage reports/matrices, serta actual src/server/attempt-control/{contracts,state-machine,schema,test-storage,journal,repository,lease,cancellation,recovery}.ts.
- E05 — Current read-only SHA-256, PE metadata, Authenticode dan OS metadata; historical S4 evidence/version.json sebagai versi candidate. Tidak menjalankan codex --version/help, SDK support probe, sandbox atau Node workload.
- E06 — Actual src/server/index.ts; src/server/runtime-security/supervisor.ts; scripts/dev.mjs; tests/integration/durable-attempt-foundation/client-helper.ts dan package.json. Pencarian source/scripts/tests untuk Job APIs/native bridge; package dependencies diperiksa.
- E07 — [Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [Nested Jobs](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs), [Process Handles and Identifiers](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers), [Process Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights), [JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information); [Node v24.21.0 child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html); [OpenAI Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox). Current documentation bukan runtime attestation pada pinned binary.
- E08 — Scoped before/after file-hash comparisons, §25 dan companion §2. AI OFFICE163, installed Codex50, Hermes tracked647, historical fixtures2169 regular files. No-follow fixture walk; reparse metadata dibandingkan terpisah.
- E09 — S16 action ledger: attachment/source/artifact reads, metadata/hash/signature queries, official-reference retrieval, dua report writes dan static document validation. MXC0, sandbox parent0, child0, test root0, termination0, SQL connections0, inference0. Reference browsing/HTTP source retrieval adalah research traffic yang diminta; zero network di sini berarti zero sandbox/test/provider connections, bukan zero seluruh aktivitas network host.

Current measurements memakai Get-FileHash SHA256, Get-AuthenticodeSignature, PE ProductVersion, Get-CimInstance Win32_OperatingSystem dan registry read-only Windows CurrentVersion untuk CurrentBuild/UBR/DisplayVersion. No-follow retained-root walk membandingkan relative path/bytes/SHA256 dan reparse metadata. Seluruh original files compared before/after; hanya dua review reports ditambah. Action ledger tidak mengklaim whole-host syscall/security attestation.

### Current source and binary evidence

Candidate main6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36; command-runner30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB; setup2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF; NodeBA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32. Current signatures Valid; exact absolute paths/versions A §4. S4 version.json is historical version evidence, not new execution.

Fetched source text SHA-256 below hashes UTF-8 encoding of the HTTP response text obtained in memory on30Oct2026. Tidak ada downloaded source cache/binary/report ke third file. Digest mengidentifikasi inspected text; tidak menyatakan binary reproducible build attestation. SDK URLs pinned commit, Codex URLs pinned rust-v0.164.0.

| Source URL | SHA-256 fetched text |
|---|---|
| [common/base_container_runner.rs](https://raw.githubusercontent.com/microsoft/mxc/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/base_container_runner.rs) | 4CA25D357A01550D3E16049B0EE0453F7DBDA97DFE5AA56ADC2F60773A6B0229 |
| [common/job_object.rs](https://raw.githubusercontent.com/microsoft/mxc/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/backends/process_container/common/job_object.rs) | A36FB16B95F3EFCE5CF500AD6525D5EC4A7F1F06B6F03074BB656A94705B281E |
| [mxc_common/sandbox_process.rs](https://raw.githubusercontent.com/microsoft/mxc/b21120168d70befe12356411423266bfef168446/src/mxc-sdk/src/core/mxc_common/sandbox_process.rs) | 40FDB880EC0E0CE1DB86DF8B457953337667ACABAB812B6139F3D9B9EB262381 |
| [src/debug_sandbox.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs) | 9D0D45513CAE0A63926E9880B485E4B364E41C65169EDE93E85C40D71C37C3FD |
| [src/lib.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs) | 89F0BAC707752EACEE22B6D4FDA530E82DB1E66B2D0BB67758849F94B7170319 |
| [src/native.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/mxc-sandbox/src/native.rs) | 83448C95931CF00F6010638D2ACBA346E40844B4370F2257005EBC41268417E9 |
| [src/windows.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/mxc-sandbox/src/windows.rs) | 7F67B89F0B68EDE6716DF95581D377D80C10DAF16FEA3861BE106818797F8836 |
| [codex-rs/Cargo.toml](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/Cargo.toml) | 11CE75D44B3FDC2CF92770BA0DD9E642A214DBF230FB2EF609D0805049F0887F |
| [codex-rs/Cargo.lock](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/Cargo.lock) | 7EC2BFABF3B967C00409B85489076F8DF3849745D3E469473D88288322ADEB4A |
| [src/lib.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/sandboxing/src/lib.rs) | AD4980E99953CAB69CF1689C3B0D450160E1093071BF5ED0BF7199ECEC5D34CA |
| [src/windows_mxc.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/sandboxing/src/windows_mxc.rs) | EAD70B95933E176801AC9059BBBDEFC8803106F453E284EBB81A1168ED3F9735 |
| [src/manager.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/sandboxing/src/manager.rs) | 8ABE2A5F66F8101A669DD0C1571FB7C5EDBAB9EFF2E80C8D13D9064BC5BC175D |
| [src/policy.rs](https://raw.githubusercontent.com/openai/codex/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) | DB99365DB23327FD992EBF62E673AF40F908B55FF3049D7316329A7AF9EFECA1 |

Source-sensitive anchors: debug_sandbox.rs selected MXC branch/current_exe/spawn_debug_sandbox_child; manager.rs SandboxType::WindowsMxc transform; mxc lib.rs internal argument; native.rs launch/spawn/wait. SDK base_container_runner.rs spawn_base/suspended assignment/from_child/kill_process_tree/wait/Drop; job_object.rs UiJobObject::new/assign_process/wait_for_empty/Drop. Full pinned source tidak menyatakan actual S16 member IDs karena tidak ada launch.

### Exact historical artifact locators

All paths below relative to E03 S10 root (A §4/§18 specify binary identities separately).

| Artifact | SHA-256 unchanged |
|---|---|
| config/semantic-diff.json | 42D7D455D2AED72AD5496FCE13F391AFF457AD18F7D0E89BB7047F9B057A3688 |
| evidence/process-final.json | A3044254FA30D70D0C52EC978677A28E22526A92B6308EAAAFA5C629794BA419 |
| evidence/process-identities.json | 58F48F0DBD880BDC082E664CDC65879C8B730DDFACC848C85EBFF3E024FAEAB7 |
| supervisor/child-inline.cjs | 20370658391092ED7896F4863701162F28681639C8BF9AF2D7CCF86200E1CC8F |
| supervisor/inspect-recovery.mjs | 6A4259CD36F60A16C412C5E47B760FA02CC1CDE561453208F811AFFC19199C91 |
| supervisor/parent-inline.cjs | C7C117D00377EFB41094557C6F71B97247C015FA1E1DAF5CB793E833F3F8B9C3 |
| supervisor/supervisor.mjs | F6502C43D3A5BC42A41374C2268AF417068D0C0DBDB5A1AC5C55A3234EDD0AC6 |
| test-home/config.toml | CE67FF9E1C4E2C61AD2F7A9197639C1F0BDBF0F668EC05E7DFA1085F537642C5 |

S8 profile absolute root: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8\test-home\config.toml; SHA B1D282CB0CBFB88CBFDC9C06CD99F8700B9BC83D34C69F18BDE5FC518D1F5CA5. S6 source: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s6-e9804b6f-3d37-4f9f-aa65-afab7414d021\config\parent-inline.js dan evidence/run-s6.mjs, included retained hashes.

### Historical fixture inventory

| Exact root | Unchanged regular files | Reparse entries |
|---|---|---|
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-QHnCi9 | 22 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202-TLkI1Y | 22 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s-nUSJvQ | 6 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW | 61 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s5-f0236e92-e7f0-4262-a89d-0fb9042b87f8 | 36 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s5r-dfb250cf-cc9f-4059-914d-9115312bce2b | 18 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s5r2-750b18c5-47be-4d0c-bbf8-b7736e9ba4a1 | 38 | 1 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s6-e9804b6f-3d37-4f9f-aa65-afab7414d021 | 39 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s7-16b2965d-aafd-42b2-ad34-62ce08a424b1 | 44 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s8-d265d87f-bbbb-4ec5-a688-2e958b8a9ae8 | 44 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s10-2817f368-351c-41d1-8a73-f38005a3c08c | 43 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-vKEa73 | 113 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s13-LaSdyf | 174 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s14-ITbdkM | 246 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s15-O9ZIZ9 | 999 | 0 |
| C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s12-wFgzkQ | 264 | 0 |

Totals16roots/2169files; known S5R2 junction relative project-a\junction-b → same root\project-b preserved, not traversed. Five S12–S15 extra roots have zero reparse. No S16 root. Whole installed Codex50/50 files and Hermes647/647 tracked hashes compare equal; Hermes HEAD beb76292747b816ef317aa6f9a3992e0014f81d9, pre-existing package-lock modification preserved.

Pipeline artifact-inventory.json digests (include manifest files themselves in S16 before/after comparisons):

| Root basename | Manifest SHA-256 |
|---|---|
| ai-office-m0202s12-vKEa73 | A74930F78788D35948B06F60E574B82A56F2E6EEAC7DB94BAF098700D48FB657 |
| ai-office-m0202s13-LaSdyf | B860E698211785E98368992FF0667D03A82B9C2B5D93D7926701CCF4D937B382 |
| ai-office-m0202s14-ITbdkM | 43B7D45CACFB9E1EF080016E728C38E5C12B4C30CE7E975938C959C19D468EDF |
| ai-office-m0202s15-O9ZIZ9 | 75A3291DF4C213DFCEC55B95D9BD79A29FB47C00B3A0F56BFC477EB086D59ED5 |
| ai-office-m0202s12-wFgzkQ | EEF6181A7D57FEE09E36F96F6E9DDF27FE4D67B590A938378F17811D735BDA6C |

### AI OFFICE protected baseline inventory

Seluruh163 file berikut dibandingkan dengan final current bytes. Final total165, dengan exactly two authorized report additions; baseline file deletions0/changes0. node_modules di luar baseline. Hash report S16 sendiri tidak dimasukkan agar tidak menciptakan self-referential checksum; kedua file paths di §18 dan final completion response.

<details>
<summary>163 original relative paths and SHA-256 (all unchanged)</summary>

| File | SHA-256 |
|---|---|
| docs/AI_OFFICE_CURRENT_BASELINE.md | 3B23F3F93BBA9E94532E684E51CD904C6145AE200F4FEBB91196B855F8E72E2D |
| docs/decisions/M00B_ALIGNMENT_REPORT.md | DC93AE4D8C34E6604BEBE60967B407D3A5856231E4D8BF49ECA05BB6522F0D58 |
| docs/plans/M01-01_BOUNDED_FOUNDATION_PLAN.md | 9DB892592633FC872133D8FBDE04FFB77B89417E725F8BE044143F6C95DF4623 |
| docs/reviews/M01-07_FOUNDATION_ACCEPTANCE_REPORT.md | 92F65D94F1632D4A8AF1A66E1B44CFE2B701DC9CCE706BEF67F3778E1921AAC5 |
| docs/reviews/M01-07_M02_GATE_MATRIX.md | BF4C2FF8DFE9FE1357D6A38B89452F2E4957BA835430F925EE3641E0FC863FD8 |
| docs/reviews/M02-01_CODEX_RUNTIME_FEASIBILITY.md | 8AD5A0CB7ED9191D12108DD0A4BE1318CDA9B263994B66EC6A6CD7A6F4EAB440 |
| docs/reviews/M02-01_NEXT_POC_GATE_PLAN.md | FDC857339941D5BF9950FCCAFBEC9F9F38B8826DB7C03A38B7E5D2EFA5DD9C09 |
| docs/reviews/M02-02_RUNTIME_GATE_MATRIX.md | D272BA94F4DB501BDF3EAD9D242B32D82D199002811ACE0CEEDECDD8A98E2C55 |
| docs/reviews/M02-02_SECURITY_HARNESS_REPORT.md | A99005942A287B228916EE57E15564602521C438FB0CD2059806B6E5A3D4B0FF |
| docs/reviews/M02-02R_OS_CONTAINMENT_TEST_PLAN.md | AD2808F4FC30533E384078D2F2E3F84CB284EBBBDE3019ED74CA944DFC72A9E7 |
| docs/reviews/M02-02R_SECURITY_CLOSEOUT.md | 8C15230A838F8A7C073357D4494588B54A3061A0579781E31BC336B97A9E6FB6 |
| docs/reviews/M02-02R1_ATOMIC_ISSUANCE_REPORT.md | DA7E33E3BE3D1173A210B1532B41E38CD816EE45967BE56937A4D5C967B9B14E |
| docs/reviews/M02-02S_OS_RUNTIME_GATE_MATRIX.md | 5CAC99F9A32906C754E3DE4C80AA69205AE1CFFE2464EA90748DFE9471947D6C |
| docs/reviews/M02-02S_WINDOWS_CONTAINMENT_REPORT.md | E9ED07402E279BEF9EF9BCF5E6624423466CD66BFED7D4F51BAA61A981C1F170 |
| docs/reviews/M02-02S1_CONTAINMENT_DECISION_MATRIX.md | 0BC91CA318E8C72F523B08EED0C9EAED237C1BAEE1835BEA0FACE9BCC0030152 |
| docs/reviews/M02-02S1_MXC_DIAGNOSTIC_REPORT.md | 94576D02576B8BB87F2501F79F59C7AB97DB048986107B747F6CB0E0EC3F7261 |
| docs/reviews/M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md | 9C7651F938EC6A92242296B6C064300E3965AB3285C1819B7624DECF14047258 |
| docs/reviews/M02-02S10_RECOVERY_GATE_MATRIX.md | 482FE2F709ECF557BAA0D1FCD2B925D6A3207E8841D50271979E7680E8A951BC |
| docs/reviews/M02-02S11_DESIGN_GATE_MATRIX.md | E121434877AEA80054B7D26863D733EDC083D138B62EFD982C4829655370512D |
| docs/reviews/M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md | FE264E333CD27DEE822B7DF2A83D07A75CC48625D71A547BFDDE4E518DF31E0E |
| docs/reviews/M02-02S12_DURABLE_AUTHORITY_FOUNDATION_REPORT.md | 8D63FC8F5377D1689D497DFECCC2B45D451A35396E51F75B5EB36E00A3E4DD49 |
| docs/reviews/M02-02S12_TRANSACTIONAL_CONCURRENCY_GATE_MATRIX.md | 1B7252515B771AD8FD9816732F69D3AAE14C03A3050978FAEBBDE835BD64A689 |
| docs/reviews/M02-02S13_DURABLE_LEASE_REPORT.md | 91159320ADACFCD5A24CB2B96F6FE0E8181B13A87D3C8D6665A4D158145F91A6 |
| docs/reviews/M02-02S13_LEASE_GATE_MATRIX.md | B8F02009E7DAAFD169D69B05CE48E48957B10A18618B9A6F900EE58E6D117EFC |
| docs/reviews/M02-02S13_S15_PIPELINE_SUMMARY.md | A0FC3E1FFD058678382729A01AF1AC6B82EDE556CFF625A81E7653DD24B25D6B |
| docs/reviews/M02-02S14_CANCELLATION_AUTHORITY_REPORT.md | 2ECC2892E037971EAB11B837D2EC4AB83620A4D922FED7CBD484F3A232709F9E |
| docs/reviews/M02-02S14_CANCELLATION_GATE_MATRIX.md | 828A8DAD0D361152DD237FC8614F70B77B104BEB0DD856A63B4C87C86193A535 |
| docs/reviews/M02-02S15_RECOVERY_GATE_MATRIX.md | 1DA6CA235102F3CF6E196801C92CB35EC366DAA1AD20C50E17D30D1FCCE699D1 |
| docs/reviews/M02-02S15_RECOVERY_QUARANTINE_REPORT.md | 62E8AB065C8EDC42AA661A4013ED3ACEF2688CDA9474BC50C848F1ED20FD270F |
| docs/reviews/M02-02S2_REDACTED_SUPPORT_EVIDENCE_REVIEW.md | 0BC6426159C7D9F367E88501FF97DC27901169E1D387BB12C112794CBB6EC4B6 |
| docs/reviews/M02-02S2_SUPPORT_DRAFT_AND_DECISION.md | BFE4188107733070684A0DB232C8012C5BF9E7F2E2CBF695AC81023F7793A67B |
| docs/reviews/M02-02S3_MXC_VERSION_COMPATIBILITY_REPORT.md | A883F3345E03A56E5C30D847018B169CB2572AB3DE0F1571AE3D22546E4C81DA |
| docs/reviews/M02-02S3_NEXT_CONTAINMENT_DECISION.md | E5FE480B8FABF898006BC02756FC689F3207A9888D6D407A8B154BB8E21AF46F |
| docs/reviews/M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md | FBE413B2DE615C1F9F0B03B33F555879E77E50DE3FC0A805C0B5A767A0902CB5 |
| docs/reviews/M02-02S4_STARTUP_GATE_MATRIX.md | 5616FD4C954B8F122C2F3A11366152C442A4EC9F236DFF04E591C7D762ED61FD |
| docs/reviews/M02-02S5_CONTAINMENT_GATE_MATRIX.md | 43943723428A37276CE046F378B28D61B5B2B59786FD2BB66F218E5F5E6ADB52 |
| docs/reviews/M02-02S5_DIRECT_OS_CONTAINMENT_REPORT.md | A147093DCA3962FC083822355E050A0969B5FA6164C562EC14B01E68394F6EA1 |
| docs/reviews/M02-02S5R_BOOTSTRAP_COMPATIBILITY_REPORT.md | DB79171EC2A127576E11ADD3E5A727A4B18AF8AAFC88E0C61DD7A84304ADD54B |
| docs/reviews/M02-02S5R_NEXT_CONTAINMENT_DECISION.md | ECFCBE260CD059A5F5CA8A216061A7A9B056AB7753AE7E3F9BAF80F74A0357EB |
| docs/reviews/M02-02S5R2_INLINE_CONTAINMENT_REPORT.md | 3BB9271490162C225806F01DA3118F12BDAE280BF7A814ED2DB73BEEB55925C8 |
| docs/reviews/M02-02S5R2_OS_GATE_MATRIX.md | 33FCB3C73856A9F609F208FA3D0787B0AF5D9B3A77961671CF42BF6C2885679C |
| docs/reviews/M02-02S6_CHILD_PROCESS_GATE_MATRIX.md | 45926B684F9554021B863AC0B9EF18C230735AC5E328E9BAF7E15A8D5A438DFE |
| docs/reviews/M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md | B5B1CB304900BCE0977D1719BEF06F3CAF7A075551447002E49C7BA3C272EBAD |
| docs/reviews/M02-02S7_NETWORK_ENFORCEMENT_REPORT.md | A20E16FEB8CB4418293BF035B47EAEBDFA0B7211EB70C98E9C8FF47E3AAD07C7 |
| docs/reviews/M02-02S7_NETWORK_GATE_MATRIX.md | D544800BDE90E56638C15F181E5BEEC42856D10A0B254DEB724F84359324E1DE |
| docs/reviews/M02-02S8_CHILD_NETWORK_INHERITANCE_REPORT.md | 040B91A34FA1670EFA0E49FAAD4389045BCB2C037235857A690290CE4BE20931 |
| docs/reviews/M02-02S8_NETWORK_INHERITANCE_GATE_MATRIX.md | E1EB5F6F8451913E4AB347B6BF307E820AB428B681A481767C17CE7822CA94B9 |
| docs/reviews/M02-02S9_DYNAMIC_FILE_GATE_MATRIX.md | 69A0573BEE5195D0DB30F29AC4DCA7F468BBB8C20572050B0D02132DC5B42F26 |
| docs/reviews/M02-02S9_FUTURE_FILE_TIMING_REPORT.md | 620E18401B49E425C103F4A62B9715CE160A0F66E04FB3CE471E2078669DDB78 |
| docs/roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md | 5A2846287BD067EBB71ED523C2138B553D430E11CF47DCE693E0B76706BAA333 |
| docs/specifications/MASTER_DESIGN.md | 58D551C5C31D2DEB163BC9F228A6A7590F94B8ABE9DE40543128F2A1A2E4393D |
| docs/specifications/MASTER_SYSTEM.md | 4174E436497459ED0AD40466EDF07B5377E9AD42FFAD21D56874B3EDE22B4247 |
| index.html | AB747FB832E1E80D0C6002EB15FF4DEDF44F222D02D648ED1475393FDE60A97F |
| package-lock.json | B1AE0F2D54B7DF3C303B3C442E2854E8A5EAECAF2C0FB2D719303D0A4B5A1926 |
| package.json | E173A3B93F9619D5269DE8E3E1822145A6B918BFE08A51519966681C2230104B |
| scripts/dev.mjs | 0AEC9440673E60B5CCA567C10676568D6000EA68705718D901C62BD75A569DA2 |
| src/contracts/capabilities.ts | 0BC98CCDB4DBCCB3AC7A5F1529A700BCF16E8A757A8B0D6470C1F7C07DCA099D |
| src/contracts/demo.ts | B913A5AFC42A78C1B917DDE4BCB0AD4A68FAD75CFC1EF3C47634F0D8A5EDDC2F |
| src/contracts/index.ts | 8274D9BAE0E5955DBDE6D6497661D5E413CDF8437E581CA1DF795892EC91044A |
| src/contracts/knowledge.ts | 5607D2C4409A2C8BA6AAFE1BC78AF06C8FA54937963F256F41B5621345020A3E |
| src/contracts/policy.ts | D7FE14BF0FA1840FA745110818A0C4AC317071F86E73BAAB2737484A3310217D |
| src/contracts/primitives.ts | 05D7D15264EDCC7FAF3C1F221165D60E90058EEC80D4B50227F46DE1EF917179 |
| src/contracts/project.ts | 432B34815B9F7D16419C105C0FD35AB21AE001C01D8B75F9DE7FAEA6EEC0D122 |
| src/demo/fixture.ts | CC4D0EDDD943C6B6B3BA1BAFDD9218736D965E3F6EB63061E62A23D19EFA37AF |
| src/server/attempt-control/cancellation.ts | 2A4F8C0FD41EC510F9E1CCE040ABA25DC9127592A9A0FF2EDF381A455442511E |
| src/server/attempt-control/contracts.ts | 9015135411E12B1EFC4DA3A9C396EAF6F8036A14C9685BFC8785E48636870E76 |
| src/server/attempt-control/journal.ts | 4BF8583AB0EF0FB669E3C75A102FB143C1F3EDAE2BA3F19FB3C11A1CB592A183 |
| src/server/attempt-control/lease.ts | 5A8B026E643D0DE6061A544CC5956EEFDAED18C9C4AB73BE80036F73C74B744B |
| src/server/attempt-control/recovery.ts | 6A96F837BA8F04B8E29511B5884BF618205B53329546ABF309FEDE7F93D635DF |
| src/server/attempt-control/repository.ts | BE70998E2650456859217336A87646EA8619AAF32FDAD4A1C6AD3D78E365F1D3 |
| src/server/attempt-control/schema.ts | 5F0C9914B24D1DD21AC4995DC96427E0754DC43A822D98EF1D7469C481FE14B3 |
| src/server/attempt-control/state-machine.ts | BD35CB4B67DA61404972D58415B1E4ED9B14F95EEF51104A6A8AA7734EF6AB0A |
| src/server/attempt-control/test-storage.ts | 0B7D184C101D9A0231CAE013656415A3864438FF73AE2F14539454FF83A7D111 |
| src/server/brain/reader.ts | 2A63BDEDC978A592AFAC16FE695BEF40C7E7FBD808BFEE5AED3A5ECD6583B89A |
| src/server/http.ts | 4B10E968A3FE541684BF0A563515474963C7C81DAA63486425F0DBF02DD89081 |
| src/server/index.ts | BD44650661805CA4737115726DAD38AB896DF397CA4AB3B4B55B87F722F0A186 |
| src/server/policy.ts | D48ECE07F657A291A0A87F9C54579CD688D2C4EDF1B389560BB499A6E5B1CE2A |
| src/server/runtime-security/approval.ts | 0677EE8BDEE46331AB0EBB1C0FEA4DE127EC37DDE22B6D1F1827A6AD1D9E67D1 |
| src/server/runtime-security/context.ts | 709E004A7E74D9F25C7F86F2D8AB502258B6DF9F9EC9DE2F503338B185E17781 |
| src/server/runtime-security/journal.ts | F17233CB87AD11B443F6D9A218316D837DA0B57EA6B64CA785C33965EFEB7248 |
| src/server/runtime-security/policy.ts | 7337CB042A264D8F01293FD081E85FBA37A70F4E5468F4B38494DB6B8BDB2663 |
| src/server/runtime-security/supervisor.ts | CBDBF309F30101A41F144EF6B676080BE2A1678D4B5FF457A233B4892EA1DF03 |
| src/server/state/database.ts | 30533EDC54C7297B9B0F6BDFF3CD88374DA8F00DBF2FFE7B041F84A0A69EF127 |
| src/server/state/schema.ts | FE2A7BAFAE61B54971F702870A1AD0D28CA49B4828505FAE6829EE5990820790 |
| src/server/state/service.ts | BD70BD262CB38DA2D7669B074DE3080508D419753143D7CAB0DDE38F9C6BDC6E |
| src/server/state/storage.ts | 8F0CA87764D6252A0C72442829A1CA1B69618AF156961022E692DD1758682C62 |
| src/server/workspace/errors.ts | 1EF465F385742627881BE6BEC874EC98B40AB147FD8843F71DAA849C5EB576D0 |
| src/server/workspace/identity.ts | 36F11786641408547CCE0924A6AEFE3622E717F17A031CD82D9EB21DDA547A7A |
| src/server/workspace/manager.ts | 52D21042421169293449835F0A2E3B3BE1A79620EF54803E92BFECBECE8D2158 |
| src/server/workspace/paths.ts | 773EBC65FC001C03606104007DFE99505B037B8A4C1FD03AEA7210DA938DEA0E |
| src/server/workspace/registry.ts | D7E267AAF035413759EF6A1DF4CFE9707582CC66BAC4F06803658727F6CCB33A |
| src/web/api.ts | 9461C2C2612105044237BF63BE3F0AEB5585F90432C7E5622E4417A1B20ABB31 |
| src/web/App.tsx | 698099A557212FD79BE1255ABD916022F2B8F3914E0ECFDFA0364FB9331BC7CD |
| src/web/components/ProjectPanels.tsx | 0B873AA8F2E6659BC76C015EDE18E1A455ED01F456756701DB65ABD656F23B47 |
| src/web/components/SkillMetadataPanel.tsx | 2DD08E220A019D5CC78C7CC7CD0906B05E28FC0A2BBBA70CBA75F1F1974C0F39 |
| src/web/main.tsx | 0B12AA84CDAE670B44276D14E497331FA6701F495A90C002DF725447EDA423D5 |
| src/web/skills/projection.ts | 1E8B443487A162AC75E0CEE8AA6720A9CF1EB537CDC1169DB82E458746615C1F |
| src/web/styles.css | CA9BA2FA73D6DF071A0D31AB0760E6B43C16A16AB5100B5BBD50147F2F6981E5 |
| src/web/visual/mapper.ts | 12D0D01C5CC7B846764939888D6CE2491583E180D94214A87B65D034CD5E9579 |
| src/web/workspace/controller.ts | 72A3942C249AA1ADA8DDAAD6723FFF03435D65302D73D2E82CCB4043EC5E4B61 |
| tests/contracts/capabilities.test.ts | 89F6DDE1E498715140900D2DFC507BC50EB565B8245C9C51861C575EBB87AD7A |
| tests/contracts/demo.test.ts | 297127759BA4AD8F1FCBB62F60BDA52DB090760111B26EB4D1A503CAA160588A |
| tests/contracts/fixtures.ts | 1AAF62C7296FAA0A90AB600E5B65C4DC7A05532B509BFE7973A2AC5A09FB3ED4 |
| tests/contracts/knowledge.test.ts | 5D4BCDA76ACA149B8605217A3405D4100242A5FDC6C265C7B89B06D46988295A |
| tests/contracts/policy.test.ts | 3B9442F375650E6A0C18D84D0F08D1CBA8F78E907EF2B50FB51559E2857419D0 |
| tests/contracts/project.test.ts | E80263F0A3673E7D98F6DEF5B8B00AFE36A2905CB636A368B9ED64EF9265C97E |
| tests/e2e/artifacts/build/assets/index-O39fen6Z.css | 6E326E97788590D9246603E16910448186CF62E46FB83E552E0AED57F8493B48 |
| tests/e2e/artifacts/build/assets/index-zs81Xxl0.js | 1C7EA7A50A9AE89BE9176B6E3D6DD9E771FC9EC18BEDDB350CF8AEE1E2A99754 |
| tests/e2e/artifacts/build/index.html | 808A015D53946FEC0DBD1A0AD0B56B41576D739A60151514F8EEB0D44AFFA7D4 |
| tests/e2e/artifacts/results/.last-run.json | 91D1C43004802CD49950D78EB11C8FA7D05DA8FFFFE219A8B13B2F561BC00903 |
| tests/e2e/artifacts/screenshots/shell-mobile.png | C50EC036F63EF1C0CBEB242FFE9E47D318EBEDB4E381D10FD5F3C2D4061E0640 |
| tests/e2e/artifacts/screenshots/shell-ready.png | B381F48F5C20B623F60500805DBAB32D1D63E7CE93AD32630259DDD6DCCAEEF2 |
| tests/e2e/helpers.ts | 0E86B209ACFA7CA0035A16E4A984BFE3249B35C3858E73D4929EB1363CEA7800 |
| tests/e2e/playwright.config.ts | 3458E983513749DEFCE8F7203F67A5BF796BFBF13960FB53421796F652BB4C75 |
| tests/e2e/shell.spec.ts | 8380CF0C563AE26B76A33FB70A28D3487863D9D88A785912BBBCF6F209804C9F |
| tests/integration/durable-attempt-foundation/cancel-helpers.ts | E775766F3C116FA57270D22859481B74D7D1B84AD0C6060159C0B126DBE06AA1 |
| tests/integration/durable-attempt-foundation/cancellation.test.ts | CB467E20793F7770A9F406A96DF2439D6D3DD064467C50AE27B9E222ECE0964F |
| tests/integration/durable-attempt-foundation/child-client.mjs | F71671A61A902A9732046E6F46BD490FF02F29C0C13E913B0130565A509071C0 |
| tests/integration/durable-attempt-foundation/client-helper.ts | 54E6872D67472D72FD853DE3F19D10A78B964502F92EE48B0C082EF4C6B847AA |
| tests/integration/durable-attempt-foundation/concurrency.test.ts | E743BF0D7EC798E7A198D87C0B114032DDADC562EFB1CA8E1EAC050B01FE069E |
| tests/integration/durable-attempt-foundation/contracts.test.ts | 19F6A26208D57447595085FA150AB630181151EC5B55A6E2968F5F461D0DC7FB |
| tests/integration/durable-attempt-foundation/helpers.ts | BE31CF4FAAB31BE7A26D00FC12AE9CD71CD2B4401656FC7D0F796DA264C62CAE |
| tests/integration/durable-attempt-foundation/import.test.ts | 81B21C4607340A7646E967D4B9BCB84F22550362D8DC7AC0EF20670E0710F621 |
| tests/integration/durable-attempt-foundation/lease-helpers.ts | 818A1068B7928DFDA9C60792A857311A2F8864139020AD4525A7216F0E06C209 |
| tests/integration/durable-attempt-foundation/lease.test.ts | 76AD6171303B2CC4730077D85FD3CE0D1F5E2A0596E486FC5BF97F4A110BAEC1 |
| tests/integration/durable-attempt-foundation/persistence.test.ts | 7CBFD2B4F7F3133250C28884F938C361E85FA9FFDE831D712F8572639EE62785 |
| tests/integration/durable-attempt-foundation/pipeline.test.ts | 11B81A9F3CB4CF50A07524129E631275D6F228E739B970544C1E9188ED149419 |
| tests/integration/durable-attempt-foundation/recovery-helpers.ts | 0D6180CFFDB92659A2573CFC448549EAB216856D066EF27E3CBB3F89FEA2D14F |
| tests/integration/durable-attempt-foundation/recovery.test.ts | 675AFACC065CB4CA8C875F2BF65B9465F42D7586FAB17E95FF5A68206DC72DED |
| tests/integration/runtime-security/approval.test.ts | AECEEDBB291DC69182AC52738B9D49BD4B507055889C5F5F104FC39C1A60D646 |
| tests/integration/runtime-security/context.test.ts | 9536E90820C3145DEAA1B6A08D15878CA136EE7BDC07119295221E2C21F5E972 |
| tests/integration/runtime-security/fixtures/helpers.ts | AB2CCA312106A1756B2C06A67C78E1619E8CDAB50A8E3036A8EE9BAF3E6A490A |
| tests/integration/runtime-security/journal.test.ts | D6E72C365EF8B57C7F3A042DA36C4A5A80D7137C222475DF9B451D788C8A3971 |
| tests/integration/runtime-security/policy.test.ts | 189AEAB0C87133F8D4422B5EBDB0773042928EDEE56122E75C8B9D983A754AD6 |
| tests/integration/runtime-security/probes/containment-probe.mjs | BD9A5EB01A4FDE9012CFD2AF8D2EF82BEE4C427DF0018D7FEB3292EF22009F57 |
| tests/integration/runtime-security/probes/dummy.mjs | 8537B5C0CB43FF02D865AFCD2B98A209CE79A1BFAB4F70056639E4BD803F0DD7 |
| tests/integration/runtime-security/probes/journal-owner.ts | 3726CF8EB73F7554460225F95C5B02BB07177D2E0043A2B6996D17D149405D4D |
| tests/integration/runtime-security/process.test.ts | B516D56EA5223E15A13A83D06F82F3C99304B7BFD29D13D2C32602681C9AE909 |
| tests/integration/runtime-security/restart.test.ts | 6467013735C48BFA8870E39C5C728CA302EB4963AB24AD6C5D832E968900451E |
| tests/integration/state/brain.test.ts | D154620D29C168BB214970038294881B7D342CFE7AA3A15DE9231CF90E2DAD91 |
| tests/integration/state/failures.test.ts | E7B7B751C2960B8C692095BE446FA95F682D9D3E2ADE2D88624D098EB02CB9FE |
| tests/integration/state/helpers.ts | E2B176B5C14BBF5C7CF9F3B7355C2B6AC8CF9143CBF51AC0262E12E82AF69E0E |
| tests/integration/state/http.test.ts | 938013567C49E94D6712DAAF6592184F1E03B2DC09B2A4193347CED80274AEAE |
| tests/integration/state/process.test.ts | 7244841C96D4666EDA30E64F0D75DF60B943E92FCB8CE888FF60809679970806 |
| tests/integration/state/service.test.ts | F89A1DCBF99A1E778599A016D621F0F48F39572BDB8019E97E095ADEE39E2F76 |
| tests/integration/state/sqlite.test.ts | 20F0F68D64574EA6859960543300DCB9CD9C996C45FA200A5DE290504A7607D0 |
| tests/integration/workspace/helpers.ts | E65DD83CC1361DEEEEBDA740E7E644D08ECC4EAE5B738C93112A5EF956253416 |
| tests/integration/workspace/http.test.ts | 402390BAFEC69490070638BEB2A347420DE69BF45D7683A83A2F8947D66BF4F6 |
| tests/integration/workspace/identity.test.ts | 52E439E206C7E91B433EBB2B567A6856D007E49D4D19BB931EEB7EBB58550501 |
| tests/integration/workspace/paths.test.ts | 2B7A1807EFD86074C7C5BA9C7B88916B32A855672018BA92416730C176C9AC75 |
| tests/integration/workspace/process.test.ts | BCC4965616F209E5BA80F8948F2D75BD53EFC2CE1831A4319E95E600C1A7606E |
| tests/integration/workspace/registry.test.ts | F02D77DD9D1FCD132D73312637EE81DEE3A2B072B6B94E49CAA1BA0158442EDF |
| tests/web/api.test.ts | D238FACFA38D20758741A831C62A0587A091E144624653E09BC7839DC07C5275 |
| tests/web/backend-security.test.ts | E4185FB13FF4D62D46BDFF76C7BF0EE206A3AD7A75B7FC337D0370B340CD1BCD |
| tests/web/controller.test.ts | 87085FE113D837CF7F2CFE038BF7E8D3AB860785024B008BCFC900B8AC370D5E |
| tests/web/fixtures.ts | F450B0BCD7EEAA9152891D049E1038F8FD13681EABD8EE1E601733DDE02283AC |
| tests/web/mapper.test.ts | 44FE31A0AD8694C70CD64A9FA2B19319F7AD1BB8394AE725912390C514294319 |
| tests/web/skills/fixtures.ts | 5861EE1A6BA6A64E53D2AA6B22B8496475B4BE980042F3A682AF5EBF1957A8EC |
| tests/web/skills/panel.test.ts | 13BCB25687D068EFD039E73407FD049D0CCB31467CDECAC640289D62CAFFDA79 |
| tests/web/skills/projection.test.ts | 1CF4875B87650C2DCECB3CF957C530BA59C0CCF8AFEC8A69BC5F6F73835F58BC |
| tsconfig.json | D390BB67899204E7CDB8A5C6C336ADEAE87F038EA325BCFD8CB91DC90D40F662 |
| tsconfig.web.json | B017C054CE31A29E63B10D5F6328A36A087B11AF04D0FF8F46646DFFE9D3E43B |
| vite.config.ts | FD650B54D81B889CC2494789F09F06FCD07E5CDCF4539537235232BBC93395FF |

</details>

## 3. Source versus runtime evidence distinction

E01/E02 menetapkan intended pinned implementation, termasuk internal Job Object, suspended assignment dan foreground teardown path. E07 adalah current official API/documentation. E03 adalah retained **historical cooperative** observations. E05/E08 adalah current read-only metadata/hash evidence. Tidak satu pun merupakan actual S16 launch, Job Object member query, forced termination atau crash test.

S16 memiliki source audit/design completion dan scoped integrity verification saja. No runtime gate memakai MXC_BEHAVIOR_VERIFIED/OS_VERIFIED. Internal SDK kill API berada pada Rust-owned object di helper, tidak di-export ke live AI OFFICE/test host melalui current integration. OS support atau binary signature tidak menggantikan host custody.

SDK drain-warning path dapat melanjutkan walau active count belum nol; root reap exceptional path memakai unbounded wait. Maka outer exit0, empty pipe atau missing heartbeat tidak membuktikan all-descendants-accounted. A §5–§6 memisahkan source intent dari actual independent receipt.

## 4. Actual parent/child accounting

**S16:** host supervisor/launcher/parent/child IDs, nonce, handles, creation times, exit code dan ordering = NOT RUN. No test-owned process tree dibuat; tidak ada residual dari S16, tetapi S16-38 tetap NOT RUN, bukan vacuous runtime PASS.

**Historical S10:**15412host →252launcher; parent12592 melaporkan6596 sebagai PPID, child4204 PPID12592. Process-identities.json memuat current-at-that-time executable/creation ticks/nonce. Parent observes child exit/close0 pada00:42:35.725Z, parent marker.728Z, launcher exit/close.768Z. Process-final.json mencatat known IDs absent00:43:46.2957970Z.6596 tidak memiliki image/creation/job attestation; tidak pernah menjadi target cleanup S16.

## 5. Cleanup and Job Object verification status

J01–J20 A §11 lengkap. Source verifies unnamed job internal, KILL_ON_JOB_CLOSE, assignment-before-resume, terminate+accounting path. Actual handle ownership/member set/outer nesting/breakaway chain/least-rights operation/crash cleanup pada S16 **NOT VERIFIED/NOT RUN**.

Test host belum memiliki original retained child/helper handles atau job query/terminate capability. Parent owns child handle dan dapat hilang pada C-A. S10 metadata observer opens then disposes handles; launcher-only kill tidak membuktikan helper/job teardown. No terminate/CloseHandle/AssignProcessToJobObject action dilakukan. Exact-member exclusion tidak diuji dengan menarget unknown job.

## 6. Selected experiment branch

**NOT FEASIBLE; no branch selected.** FEASIBLE_A gagal independent safe surviving-child/helper cleanup dan reviewed retained exit observer; FEASIBLE_B gagal existing verified host-owned job/member/custody/termination capability. A §13 menguraikan semua preconditions.

Prasyarat itu berasal dari attachment §15/§22, bukan approval block tambahan atau interpretasi skill. S16 mengharuskan no MXC ketika capability belum tersedia; no new native integration allowed automatically. Tidak menjalankan dua strategi, retry atau support-discovery invocation.

## 7. Unexecuted runtime gates

S16-27…38,40,48,49,52 = **NOT RUN**. Itu mencakup bootstrap, filesystem A/B, new parent/child identities, child alive-before-action, foreground exit, request/membership, actual exits/accounting, deadlines, host crash, hostile/detached dan real app-server. S16-24 NOT APPLICABLE karena fixture tidak dibuat.

S16-16/17/47/51/53/54/55 = NOT VERIFIED, masing-masing membership/nesting/forced capability/output fencing/custody/entitlement/billing. S16-20/25/50/56 BLOCKED. Tidak ada source success yang mempromosikan gate runtime tersebut.

## 8. Process ownership limitations

PID/PPID/nama/executable digest/nonce masing-masing tidak cukup sendiri. Future original OS object custody + creation time + authenticated launch identity + verified complete job scope diperlukan (A §8–§10). Raw HANDLE number bukan durable capability dan tidak dipindahkan lewat receipt JSON seolah-olah masih valid setelah restart.

Actual helper/ancestor chain belum attested; source topology tidak mengizinkan termination terhadap reported6596 atau active Codex/VS Code. Existing .NET/PowerShell APIs mungkin membantu future integration, tetapi availability bukan reviewed owned-tree mechanism. Tidak ada claim bahwa Windows/.NET inherently incapable.

## 9. Force-termination limitations

No S16 force request atau actual forced exit. Cooperative S10 child-first exit bukan arbitrary parent-death cleanup. Internal SDK kill function tidak membuktikan host dapat memanggilnya terhadap exclusive known group. No direct PID kill, process-name sweep, taskkill, arbitrary job close atau generic parent-process kill.

S14 terminal cancellation currently memerlukan ack+trusted complete-scope exit/effects; forced termination tanpa ack tidak otomatis memenuhi phase gate. Future integration perlu disposition/reconciliation terpisah, tanpa bypass source sekarang.

## 10. Host-crash limitations

No crash test. SDK owner lives in internal helper, bukan otomatis outer test host. Outer process forced death tidak menjalankan Rust Drop secara universal atau membuktikan final job handle ditutup. Duplicated/leaked handles dapat mempertahankan lifetime; unnamed job tidak direopen by name after restart.

P05–P07/P12–P13/P19 pada A §22 adalah DESIGN_SPECIFIED, tidak experimentally verified. Unknown status → quarantine; tidak ada general promise bahwa20s supervisor bound dapat memaksa semua kernel member exit.

## 11. Stale-owner and recovery limitations

Existing dormant S15 source mengikat inspector/current generation/version, retains execution owner/generation dan conflictHeld1. UNKNOWN/incomplete scope → UNCERTAIN atau retained RECONCILIATION_REQUIRED, dispatch CLOSED, retryAuthorized=false. Lease expiry tidak revoke OS handles/write access dan tidak authorize replacement.

20 process-specific P cases dan25 invariants pada A §22/§24 mencakup nonce mismatch/PID reuse/late success/lost receipt/unknown descendants. All20 runtime cases NOT RUN. S13–S15 previous262PASS adalah historical synthetic transaction tests, bukan proof Windows kill/custody/physical output fencing.

## 12. Real app-server readiness

**NOT RUN/BLOCKED.** Tidak menjalankan codex app-server, thread/turn, tools/approvals/skills channel, production runtime adapter/backend atau integration tests. Current backend tidak diwire ke dormant authority. Tidak memulai M02-03/S17.

## 13. Credential custody

**NOT VERIFIED.** Tidak membuka real credentials, auth stores, .sandbox-secrets atau provider login; tidak membuat synthetic credential fixture karena Gate C absent. Historical fake-credential denial bukan production custody/credential-channel proof. Future bridge tidak boleh memperluas worker-readable roots.

## 14. Subscription entitlement

**NOT VERIFIED.** Tidak memeriksa akun/subscription/entitlement dan tidak menjalankan inference untuk menebak eligibility. Candidate CLI signature/version tidak membuktikan account use rights. Real worker tetap diblokir.

## 15. Included-only billing enforcement

**NOT VERIFIED.** No provider/API/credit spend pada S16; paid fallback tidak diaktifkan. Zero usage bukan hard included-only cap. Auth/custody, subscription eligibility dan billing enforcement adalah independent gates.

## 16. Production worker activation decision

**BLOCKED.** Tidak ada production dispatch/activation. CONDITIONAL menyelesaikan bounded audit/design S16, bukan worker-ready. Blockers: reviewed host-owned process scope/membership/termination/exit/crash receipt capability, physical fencing, production authority/custody/integration, app-server dan account/billing gates. Tidak ada automatic retry/replacement/generation takeover.

## 17. One recommended follow-up

Satu follow-up: **Bounded test-only Windows process-control bridge implementation and review**, dengan separate explicit authorization. Acceptance minimum: legitimate handle custody, verified member identities/exclusive scope, compatible nesting, targeted terminate request, independent all-member exits dan bounded emergency containment/unknown-state quarantine. Tidak menjalankan MXC/worker/inference atau mengubah production source secara otomatis. Lihat A §28.

## 18. Required Owner authorization

Pekerjaan S16 yang diminta selesai tanpa routine permission request. Owner review hasil CONDITIONAL dan missing capability; authorization terpisah diperlukan sebelum implementing bridge/helper/native addon/dependency, actual job configuration/production source/broader OS capability change. Detail sempit ada pada A §28–§29; belum dilakukan atau dianggap approved.

Exactly two new repository files:

- docs/reviews/M02-02S16_PROCESS_TREE_SUPERVISION_REPORT.md
- docs/reviews/M02-02S16_PROCESS_TREE_SECURITY_GATE_MATRIX.md

New S16 temp roots/artifacts: **none**. No runtime action/cleanup, no historical deletion, no later milestone. All measured pre-existing files retained. Static verification checks exactly29/18 numbered report sections,56 unique gates,20 unique process races,25 unique invariants, valid statuses, references and write scope; no application test/build run.

**M02-02S16 CONDITIONAL — PROCESS-TREE CONTROL DESIGN COMPLETED — SAFE TERMINATION EXPERIMENT NOT AUTHORIZED BY PRECONDITIONS — REAL WORKER BLOCKED.**

