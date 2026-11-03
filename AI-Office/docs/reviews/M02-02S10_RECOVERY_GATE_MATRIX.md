# M02-02S10 — Recovery Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Companion: [Lifecycle Feasibility Report](M02-02S10_LIFECYCLE_CANCELLATION_FEASIBILITY_REPORT.md).
Decision: **ACCEPTED for bounded cooperative cancellation and synthetic reconciliation; production worker BLOCKED.**

## 1. S10-01 through S10-52

Status berlaku hanya pada evidence scope yang disebut. SOURCE_VERIFIED tidak berarti production implementation; MXC_VERIFIED hanya fixed workload/selected configuration.

| Gate | Requirement | Status | Evidence / boundary |
|---|---|---|---|
| S10-01 | Existing source inventory | SOURCE_VERIFIED | Actual context/journal/supervisor/approval/policy/schema dan tests dibaca; Report A §3. |
| S10-02 | Atomic attempt issuance audit | SOURCE_VERIFIED | Synchronous reservation/final publication pada satu authority instance; historical R1 tests. |
| S10-03 | Attempt ID/project UUID binding | SOURCE_VERIFIED | Descriptor project/task/attempt/generation/binding/root; canonical association revalidated. |
| S10-04 | Existing journal architecture | SOURCE_VERIFIED | FixtureAttemptJournal wx lock, history/checksum/seal, sync+rename; bukan production journal. |
| S10-05 | Existing cancellation architecture | SOURCE_VERIFIED | SyntheticSecurityHarness.cancel/stopRun, nonce IPC/revoke; no production API. |
| S10-06 | Existing timeout handling | SOURCE_VERIFIED | Startup2500/escalation250/cleanup5000/descendants1200 ms; no universal work timeout. |
| S10-07 | Existing process ownership | SOURCE_VERIFIED | Run ChildProcess/pid/nonce; observed startedAt bukan OS creation time. |
| S10-08 | Existing durable lease | NOT IMPLEMENTED | No production renewable lease/heartbeat/owner epoch; expiresAt fixture capability bukan lease. |
| S10-09 | Existing restart reconciliation | SOURCE_VERIFIED | Fixture reopen unresolved→UNCERTAIN/RECONCILIATION_REQUIRED; stale crash lock remains gap. |
| S10-10 | Existing duplicate-attempt fencing | SOURCE_VERIFIED | Per-instance reservations + fixture journal idempotency; no cross-host/live-effect fence. |
| S10-11 | Official Codex candidate verified | HOST_VERIFIED | 0.164.0 retained SHA/signature/S4 inventory cocok; no upgrade. |
| S10-12 | Active Codex preserved | HOST_VERIFIED | Installed0.162.1 50/50 file hashes unchanged. |
| S10-13 | Node executable verified | HOST_VERIFIED | 24.21.0 metadata/hash/Valid signature. |
| S10-14 | Strict MXC profile preserved | HOST_VERIFIED | Fresh rebind + tighter host-directory denies; root/minimal/A-only/B/private intent preserved. |
| S10-15 | Network disabled | HOST_VERIFIED | enabled=false; no network imports/operations. Bukan general egress proof. |
| S10-16 | Fresh synthetic fixture | HOST_VERIFIED | One canonical owned Temp root, collision/reparse checked, synthetic only. |
| S10-17 | Fixed supervisor reviewed | SOURCE_VERIFIED | Frozen SHA, node --check, exact handles/finite deadlines; no production imports. |
| S10-18 | Fixed parent reviewed | SOURCE_VERIFIED | vm.Script/source review; fs+child_process only, fixed child, self-expiry12s. |
| S10-19 | Fixed child reviewed | SOURCE_VERIFIED | vm.Script/source review; fs only, no spawn, self-expiry9s. |
| S10-20 | One MXC launch ceiling | HOST_VERIFIED | Exclusive issue receipt, actual launches1/max1/retries0. |
| S10-21 | One child ceiling | MXC_VERIFIED | Exactly one observed spawn attempt/PID, no grandchild source or events. |
| S10-22 | Parent bootstrap | MXC_VERIFIED | Parent12592 marker, A/B sanity, READY. |
| S10-23 | Child bootstrap | MXC_VERIFIED | Child4204 marker, A/B sanity, READY. |
| S10-24 | Parent-child ownership | HOST_VERIFIED | Exact parent-owned handle, PID/PPID/nonce/source, live OS executable/creation times. |
| S10-25 | Filesystem sanity | MXC_VERIFIED | Parent+child: A allow/B EPERM -4048 open. Four direct operations. |
| S10-26 | Cancellation request | HOST_VERIFIED | Matching request published inside A after READY+OS ownership validation. |
| S10-27 | Child cancellation acknowledgment | MXC_VERIFIED | One correct request/nonce ack before child exit. |
| S10-28 | Child clean exit | MXC_VERIFIED | Self marker plus parent-owned exit/close0, signal null. |
| S10-29 | Parent cancellation acknowledgment | MXC_VERIFIED | One final ack after child close. |
| S10-30 | Parent clean exit | MXC_VERIFIED | Exit marker0, launcher close0 and post-exit absent. |
| S10-31 | Process accounting | HOST_VERIFIED | Known supervisor/launcher/parent/child/inspector absent; no termination request. |
| S10-32 | Terminal journal receipt | SYNTHETIC_VERIFIED | One INTERRUPTED/CANCELLED receipt after observed exits/absence; hash chain valid. |
| S10-33 | Duplicate terminal replay | SYNTHETIC_VERIFIED | R02 same receipt twice, no additional transition; sequential classifier. |
| S10-34 | Late completion replay | SYNTHETIC_VERIFIED | R04 success quarantined, terminal cancellation bytes unchanged. |
| S10-35 | Stale lease reconciliation | SYNTHETIC_VERIFIED | R03 expired mock/UNKNOWN→RECONCILIATION_REQUIRED; no assumed death/retry. |
| S10-36 | Invalid journal handling | SYNTHETIC_VERIFIED | R05 malformed file parse error/quarantine; no dispatch. |
| S10-37 | No automatic retry | HOST_VERIFIED | Actual issue/spawn1; inspector has no worker commands; R01-R07 no retry. |
| S10-38 | Fixture integrity | HOST_VERIFIED | A/B/profile/binaries/frozen sources unchanged; no forbidden outputs; final inventory. |
| S10-39 | Existing source unchanged | HOST_VERIFIED | 127 pre-existing AI-Office files identical; only2 reports added. |
| S10-40 | No Windows security change | HOST_VERIFIED | No ACL/registry/firewall/Defender/UAC/elevation mutation commands; action audit. |
| S10-41 | No provider login/inference | HOST_VERIFIED | No auth import/model calls/codex exec/app-server/real worker. |
| S10-42 | No paid API/credits | HOST_VERIFIED | No paid/API/credit usage or fallback activation; not cap proof. |
| S10-43 | Forced process-tree termination | NOT VERIFIED | No planned force-kill; emergency paths not exercised; job flags not independently verified. |
| S10-44 | Host crash recovery | NOT VERIFIED | No real crash/power loss; controlled restart/replay only. |
| S10-45 | Production durable lease | NOT IMPLEMENTED | No production owner/renewal/takeover/fencing protocol or schema. |
| S10-46 | Real Codex app-server | NOT RUN | No adapter/protocol/model/tool/thread/turn execution. |
| S10-47 | Runtime approval/cancellation | NOT VERIFIED | File-based synthetic cancellation is not actual provider/runtime interrupt. |
| S10-48 | Actual credential custody | NOT VERIFIED | No real secrets accessed; synthetic denied dirs do not establish custody. |
| S10-49 | Subscription entitlement | NOT VERIFIED | Eligibility UNKNOWN; no account query/login. |
| S10-50 | Included-only billing cap | NOT VERIFIED | No enforceable provider hard-cap/fallback-exclusion proof. |
| S10-51 | Production exactly-once effects | NOT VERIFIED | No stale worker effect fence or unknown external-effect reconciliation. |
| S10-52 | Real worker activation | BLOCKED | Production lifecycle/runtime/state/credential/account/billing gates remain open. |

## 2. Source-level evidence

Actual modules: [context.ts](../../src/server/runtime-security/context.ts), [journal.ts](../../src/server/runtime-security/journal.ts), [supervisor.ts](../../src/server/runtime-security/supervisor.ts), [approval.ts](../../src/server/runtime-security/approval.ts), [policy.ts](../../src/server/runtime-security/policy.ts), [state/schema.ts](../../src/server/state/schema.ts). Table fungsi, tests, durability dan restart gaps ada pada Report A §3. Existing fixture tests/source dibaca; historical R1 runtime-security60 PASS tidak diklaim rerun S10.

## 3. Production-vs-synthetic distinctions

Existing SyntheticContextAuthority/SyntheticSecurityHarness/FixtureAttemptJournal adalah fixture-only. S10 supervisor/parent/child/journal/recovery inspector juga disposable test code, tanpa application imports/integration. Production state/schema tidak berubah.

**SOURCE REVIEW != SYNTHETIC TEST != PRODUCTION IMPLEMENTATION != CRASH RECOVERY VERIFIED.**

## 4. Attempt issuance guarantees

R1 synchronous reservation dan final publish menjamin supported overlapping calls pada satu authority instance. Descriptor mengikat project UUID/task/attempt/generation/root. Separate instance/process Maps tidak shared/durable. Fixture journal membatasi duplicate attempt/idempotency key pada supported writer; bukan global exactly-once execution.

S10 actual MXC issue1/spawn1/child1/retry0. Host-only replays tidak menerbitkan worker. **ATOMIC ISSUANCE != EXACTLY-ONCE EXTERNAL EFFECTS.**

## 5. Owner identity guarantees

Fresh root/attempt/invocation/owner/nonce, frozen executable/source dan exact spawn handles dipadukan dengan live OS executable/creationTime/StartTime ticks/PID/PPID. Child4204 PPID12592 cocok. Supervisor15412 memegang launcher252 handle. Known identity fields disimpan pada evidence/process-identities.json.

Parent reported PPID6596 bukan launcher252; intermediary live path/creationTime tidak diattest dan tidak dijadikan cleanup target. No generic PID-based termination atau full SDK ancestry/job ownership claim. Production durable owner identity belum diimplementasikan.

## 6. Process lifecycle evidence

One fixed parent12592 dan child4204 melalui explicit MXC. Parent/child langsung membaca A dan mendapat EPERM -4048 open pada B; READY masing-masing diobservasi. Native launcher exit0, child/parent exit0; stdout9973/stderr0. Command observation window1796ms termasuk pre-spawn hashing; host observed spawn→close1277.161ms. Semua tested errors/receipts tersimpan pada evidence/runtime-result.json dan result-audit.json.

## 7. Cancellation state transitions

Synthetic journal: CREATED→APPROVAL_PENDING→APPROVAL_GRANTED→LAUNCHING→RUNNING→CANCELLATION_REQUESTED→INTERRUPTED; terminal outcome=CANCELLED. Approval entries hanya synthetic operator gate. Request identity mengikat attempt/nonce/owner/request/version/sequence. Host publishes setelah readiness dan ownership, child ack/exit lebih dulu, lalu parent final ack/exit.

Actual source fixture mengizinkan COMPLETED dari CANCELLATION_REQUESTED; production authority perlu menentukan race semantics. S10 single cancellation path/replays tidak mengubah existing transition table.

## 8. Deadline behavior

Ready5s, child ack4s, child exit wait4s, parent ack4s, child self9s, parent self12s, overall15s/outer20s. Tidak terpicu; source/static configuration diverifikasi, failure-path behavior belum diuji. Deadline exceeded tidak setara dengan observed termination.

[Node child_process](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html) membedakan signal delivery/killed dan exit. S10 tidak memakai Windows SIGTERM sebagai graceful cancellation proof.

## 9. Actual process termination evidence

Child self-exit marker0 + parent-owned exit/close0; parent marker0 + launcher exit/close0; supervisor dan fresh inspector command exit0. Post-exit targeted query pada2026-10-30T00:43:46.2957970Z:15412/252/12592/4204/22712/6596 absent. No forced termination request, unresolved owned process atau unrelated kill.

**COOPERATIVE EXIT != FORCED PROCESS-TREE CLEANUP.** No residual claim untuk seluruh arbitrary system descendants.

## 10. Journal replay outcomes

Fresh host inspector22712 memvalidasi seven-receipt SHA chain/terminal setelah runtime berakhir. R01 CANCELLED—NO RESTART; R02 DUPLICATE_IGNORED; R03 RECONCILIATION_REQUIRED/no assumed death; R04 CONFLICT_QUARANTINED; R05 INVALID_JOURNAL_QUARANTINED; R06 STALE_IDENTITY_REJECTED; R07 wrong-attempt/nonce cancel rejected. All7 accepted, no worker command/retry.

R03/R04/R06/R07 adalah offline synthetic inputs; R05 test-owned malformed file. Tidak mensimulasikan actual OS crash/production provider event.

## 11. Duplicate terminal protection

S10 terminal write memakai exclusive file creation; numbered receipts immutable dan chain-linked, readback diverifikasi. R02 replay same terminal dua kali memberikan0 additional transitions/effects pada classifier; terminal bytes tetap. Tidak ada concurrent multiwriter race atau external action yang diuji. Production terminal CAS/idempotency/transaction policy tetap gap.

## 12. Stale worker fencing

Existing object revocation/expiry/generation bukan kernel atau external-storage fence. R06 hanya rejects mismatching synthetic owner; R03 tidak menganggap UNKNOWN process mati. Old worker perlu ditolak pada actual sensitive writes/actions melalui authoritative epoch/token yang future storage/runtime enforce. **Production stale-worker fencing NOT IMPLEMENTED/NOT VERIFIED**.

## 13. Durable lease gaps

Fixture lock/token + process-local Maps bukan production renewable lease. Stale writer.lock setelah hard crash tidak otomatis direbut; controlled restart tests melepaskan lock secara tertib. No production heartbeat, lease takeover, epoch CAS atau multi-host claim arbitration. Scope S10 tidak menambah production schema.

## 14. Process-tree cleanup gaps

[Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) mendokumentasikan group management/kill-on-close dengan configured flag. [OpenAI Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox) menyebut foreground exit menghentikan remaining children; pinned source launch/wait ditinjau pada Report A §7.

Direct job-handle ownership/flags, launcher hard-kill dan hostile tree teardown tidak diamati. No Job Object implementation/native addon, planned kill, detached/grandchild experiment. Cooperative self-expiration/owned-handle emergency source bukan proof forced tree cleanup.

## 15. Host crash recovery gaps

No real backend kill, host crash atau power failure. File flush/hash integrity/rename tidak membuktikan OS/power-loss durability. Crash sesudah external action tetapi sebelum commit dapat membuat uncertain side effects. Crash sesudah spawn sebelum identity persistence dapat meninggalkan unknown process. Preserve evidence, require reconciliation, no blind retry.

**PRODUCTION EXACTLY-ONCE SIDE EFFECTS: NOT VERIFIED.**

## 16. Credential custody gaps

Tidak membaca actual credentials, private DB, auth store atau .sandbox-secrets. Fake-private/fake-credentials denied pada policy; historical denial bukan real custody proof. Host/backend secrets perlu di luar worker readability, termasuk env/argv/IPC/tools/logs/exports. S9 zero-glob-dependency assessment dan documented future-file limitation tetap berlaku; S10 tidak menambahkan glob atau credential broker.

## 17. Real app-server readiness

**NOT RUN / NOT VERIFIED.** Tidak ada app-server process/adapter/protocol/thread/turn/tool/model integration. CLI sandbox lifecycle tidak memberi actual provider acceptance. Skills execution/discovery/permission bridge juga belum diterima dalam real runtime.

## 18. Actual runtime approval/cancel readiness

**NOT VERIFIED.** Synthetic operator approval entries/file cancellation bukan provider approval/interrupt/cancellation-race handling. Actual runtime authority/state mapping dan terminal acceptance harus diuji terpisah setelah desain dan otorisasi.

## 19. Subscription entitlement

**NOT VERIFIED; account eligibility UNKNOWN.** Tidak ada login/auth import/account/model query/inference. Candidate compatibility dan subscription-first architecture tidak membuktikan current account entitlement.

## 20. Included-only billing protection

**NOT VERIFIED.** Paid API/credits/fallback tetap OFF; no usage atau activation. Tidak ada enforced included-only cap atau fallback-exclusion evidence. Entitlement, authentication, runtime authorization dan billing enforcement adalah gates terpisah.

## 21. Real worker activation decision

**BLOCKED.** Bounded lifecycle dan synthetic recovery accepted, production supervisor/lease/fencing/crash reconciliation/forced-tree cleanup/credential custody/public egress/app-server/approvals/skills/account/billing belum memenuhi acceptance. Tidak ada M02-03 atau real worker execution.

## 22. One recommended next milestone

**M02-02S11 — Durable Attempt Ownership, Cancellation and Recovery Design**. Design-only untuk immutable binding, retained identity, durable owner/lease/epoch, authoritative cancellation, terminal commit, fencing, crash reconciliation dan fail-closed retry; specify separate future tree-cleanup validation. Tidak diimplementasikan/dimulai dalam S10.

## 23. Owner authorization required

Owner dapat mereview completed S10 evidence. Separate authorization diperlukan untuk S11, source/schema changes, additional runtime/forced-tree experiments, real app-server/auth/custody/billing integration atau worker activation. Tidak ada permission tambahan yang diperlukan untuk menyelesaikan S10 yang sudah diotorisasi; tidak ada automatic continuation.

Exact two new repository reports dan owned evidence inventory tercatat pada Report A §26. Historical fixtures/installations/source dipertahankan; no cleanup-policy bypass atau unrelated process termination.

**M02-02S10 COMPLETE — BOUNDED COOPERATIVE CANCELLATION AND SYNTHETIC RECOVERY RECONCILIATION VERIFIED — PRODUCTION WORKER STILL BLOCKED.**

