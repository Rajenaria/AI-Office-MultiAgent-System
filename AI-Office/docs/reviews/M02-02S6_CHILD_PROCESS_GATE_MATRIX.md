# M02-02S6 — Child Process Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Primary: [Cooperative Child Confinement Report](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md). Evidence prefix `<S6_ROOT>/evidence/`; locator di primary section4.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 1. S6-01 through S6-43

**ACCEPTED — BOUNDED COOPERATIVE CHILD CONFINEMENT — TESTED CONFIGURATION ONLY.** Single outer launch442ms/native exit0, parent2968/child23824, direct child7/7 expected results. Future unverified gates do not authorize further launches.

| Gate | Requirement | Status | Evidence / boundary |
|---|---|---|---|
| S6-01 | Official candidate identity verified | HOST_VERIFIED | Main hash/signature Valid OpenAI; S4 recorded60entries match;61retained files including45candidatefiles unchanged. |
| S6-02 | Active Codex installation preserved | HOST_VERIFIED | Global0.162.1 package50/50 unchanged; separate0.164.0 path; VS Code22256 left alive. |
| S6-03 | Node executable verified | HOST_VERIFIED | Existing24.21.0 FileVersion, matching BA4E6D11…6C32 SHA-256; no runtime change. |
| S6-04 | Fresh synthetic fixture verified | HOST_VERIFIED | New UUID OS-temp immediate child, owner matches, canonical roots/inputs, no reparse. |
| S6-05 | Strict S5R2-equivalent policy | HOST_VERIFIED | Name/root literals only; reverse-substitution text equality; config BB41FFDF…338A7 unchanged. |
| S6-06 | No broad drive/Temp/user grants | HOST_VERIFIED | Root/temp denial and minimal runtime read retained; no fixture-parent/user/drive grant added. Not all host paths probed. |
| S6-07 | Project A-only workspace roots | HOST_VERIFIED | Fresh A cwd; only dot workspace write; no extra roots/session inherited; B sibling explicitly denied. |
| S6-08 | Managed configuration retained | HOST_VERIFIED | --include-managed-config; current registry/system/new-home managed preflight safe; no suppression. |
| S6-09 | Network disabled in profile | HOST_VERIFIED | network.enabled=false unchanged; enforcement not tested. |
| S6-10 | Host baseline successful | HOST_VERIFIED | 7/7:4matching reads+3distinct exclusive output writes; all sandbox targets absent. |
| S6-11 | Fixed parent source reviewed | VERIFIED | 10613bytes, SHA72CFA924…8492; syntax/manual approval before launch; onlyfs/child_process. |
| S6-12 | Fixed child source reviewed | VERIFIED | 3525bytes, SHADC4D4942…D58A; syntax/manual approval; onlyfs, finite7ops, no spawn/network. |
| S6-13 | One MXC launch ceiling | VERIFIED | Exclusive mxc-issued before spawn, max1, opt-in, actual1/no retry. |
| S6-14 | One child spawn ceiling | VERIFIED | One fixed spawn call; one attempted and one created event; no loop/fallback. |
| S6-15 | Parent bootstrap succeeds | MXC_BOOTSTRAP_VERIFIED | S6_PARENT_BOOTSTRAP_OK, PID2968, consistent fixture/role identity. |
| S6-16 | Parent allowed A read | OS_VERIFIED | P-F01 success/contentMatch; read before child spawn. |
| S6-17 | Parent denied B read | OS_VERIFIED | P-F02 direct read EPERM/-4048/open; host B control success. |
| S6-18 | Child process successfully created | OS_VERIFIED | Parent-owned ChildProcess spawn event, actual child23824; subsequent own bootstrap/I/O/exit. |
| S6-19 | Parent-child identity correlated | VERIFIED | Parent spawn PID23824=child PID; child PPID2968=parent; fixed executable/handle/launch window/exit; no live CIM CreationDate sample. |
| S6-20 | Child bootstrap succeeds | MXC_BOOTSTRAP_VERIFIED | S6_CHILD_BOOTSTRAP_OK +S6_CHILD_FS_READY; actual child23824. |
| S6-21 | Child A read permitted | OS_VERIFIED | C-F01 direct read success/contentMatch=true. |
| S6-22 | Child A write permitted | OS_VERIFIED | C-F02 wx/create/write success; host post63bytes/exact expected SHA-256. |
| S6-23 | Child B read denied | OS_VERIFIED | C-F03 EPERM/-4048/open against existing synthetic file and successful host control. |
| S6-24 | Child B create/write denied | OS_VERIFIED | C-F04 wx open EPERM/-4048/open; created=false and exact target absent. New-file creation scope only. |
| S6-25 | Child private-state read denied | OS_VERIFIED | C-F05 EPERM/-4048/open; fake marker unchanged; not an actual SQLite/real-state test. |
| S6-26 | Child dummy-credential read denied | OS_VERIFIED | C-F06 EPERM/-4048/open; synthetic marker unchanged, contents not logged. |
| S6-27 | Child dummy-credential create denied | OS_VERIFIED | C-F07 wx open EPERM/-4048/open; created=false and target absent. |
| S6-28 | Child clean exit | VERIFIED | Self exit0 .641Z, parent exit event0 .649Z and stream-close validation; no signal/stderr. |
| S6-29 | Parent clean exit | VERIFIED | Parent exit event0 .650Z after child close, native Codex exit0 .683Z. |
| S6-30 | Deadline and process cleanup | HOST_VERIFIED | 5s/10s/15s configured; zero timeouts/kills; known PIDs/fixture-ID owned query absent23:18:52.742Z. Cooperative only. |
| S6-31 | Forbidden fixture integrity | HOST_VERIFIED | 4/4 canaries unchanged,2/2 forbidden outputs absent; no unexpected reparse/outputs. |
| S6-32 | No Windows security changes | HOST_VERIFIED | Task actions: read-only metadata; no ACL/firewall/Defender/UAC/registry/features/elevation/WSL changes. |
| S6-33 | No provider login/inference | HOST_VERIFIED | Only fixed non-AI inline payloads; ephemeral synthetic home; no auth/model/app-server/worker command or real credentials. |
| S6-34 | No paid API/credit fallback | HOST_VERIFIED | No provider/model/account call or billing activation; task non-usage only, not billing-cap proof. |
| S6-35 | Existing source integrity | HOST_VERIFIED | 119/119 existing AI files unchanged; final121 only2reports; installed50/Hermes647/oldfixture hashes unchanged. |
| S6-36 | Network enforcement | NOT VERIFIED | NOT RUN; network=false configuration alone; no listener/DNS/loopback/provider/LAN experiment. |
| S6-37 | Hostile/detached child confinement | NOT VERIFIED | Hostile NOT VERIFIED, detached NOT TESTED; one cooperative child supplies no arbitrary-tree guarantee. |
| S6-38 | Future-file timing | NOT VERIFIED | NOT RUN; no watcher/new-denied-file timing/race. Existing marker and exclusive-create tests only. |
| S6-39 | Real app-server readiness | NOT VERIFIED | NOT RUN; no protocol/adapter/runtime tool/approval/cancellation test. |
| S6-40 | Production worker lease/recovery | NOT VERIFIED | No durable production lease, host/machine crash, cross-process dispatch/dedup/recovery evidence. |
| S6-41 | Subscription entitlement | NOT VERIFIED | Account eligibility UNKNOWN; no account/auth/subscription/model query. |
| S6-42 | Included-only billing protection | NOT VERIFIED | No included-only hard cap/credit-exclusion enforcement test; paid API/credits remain OFF. |
| S6-43 | Real worker activation | BLOCKED | Unresolved OS/runtime/state/account/billing gates; explicitly prohibited by S6. |

## 2. Evidence for verified gates

Identity/config/source: preflight.json, execution-preconditions.json, managed-preflight.json, syntax-review.json, source-review-approved.json, fixture-manifest.json, launch-budget.json, config/semantic-diff.json. Exact complete argv and source: invocation-spec.json plus fixed source snapshots. No placeholder or file-entry script executed.

Execution: exclusive mxc-issued.json; mxc-result.json contains sanitized NDJSON/parsed parent/child events and native PID/exit/times. Verification: result-verification.json, post-test-integrity.json, process-accounting.json, change-safety.json, final-verification.json, final-inventory.json. Inventory excludes itself and follows no reparse.

These are experimental receipts, not production authority/leases or independent kernel-policy attestation. Static source review alone does not pass OS_VERIFIED gates.

## 3. Direct child filesystem results

| ID | Direct API / resource | Actual | Interpretation |
|---|---|---|---|
| C-F01 | readFileSync /A input | success/contentMatch=true | Approved read worked. |
| C-F02 | openSync(wx),writeSync,closeSync /A output | success/created=true |63bytes, expected hash confirmed post-test. |
| C-F03 | readFileSync /B canary | EPERM,-4048,open | Existing B read denied. |
| C-F04 | openSync(wx) /B output | EPERM,-4048,open; created=false | New-file create denied. |
| C-F05 | readFileSync /fake private marker | EPERM,-4048,open | Synthetic private read denied. |
| C-F06 | readFileSync /dummy credential | EPERM,-4048,open | Synthetic credential read denied. |
| C-F07 | openSync(wx) /dummy output | EPERM,-4048,open; created=false | New-file create denied. |

**7attempted/7planned**,2ALLOW/5DENY, zero skipped/inconclusive/unexpected success. Direct child fs evidence, no HostPathPolicy. Canaries4/4 unchanged, forbidden outputs2/2 absent. A output SHA-256 **8D4921F7AF296AF4D58ED12C14891989CA9491950185AC42C8E4172514722BB3**.

## 4. Parent/child PID correlation

Native launcher22444. Parent2968/PPID8108. Parent-owned spawn object reports child23824; all child events report23824/PPID2968 and matching fixture ID. Fixed absolute verified executable, literal source hash, launch window and child exit/close support cooperative ownership. No arbitrary PID/name kill;8108 not presumed cleanup-owned from PPID alone.

No live CIM child CreationDate/executable sample captured before fast completion. Spawn/marker timestamps are observations; fixed executable/handle plus PID/PPID is available evidence. No hostile PID-reuse/ancestry certification.

## 5. Process lifecycle observations

Actual UTC2026-10-29 (WIB30Oct06:18):

- Outer start23:18:38.241Z; native finish.683Z,442ms,exit0.
- Parent bootstrap.563Z; P-F01/P-F02.566Z.
- Child attempt.566Z; parent observes spawned.578Z.
- Child bootstrap.635Z; operations.638–.640Z; summary/self-exit0.641Z.
- Parent observes child exit0.649Z, validates close/protocol, exits0.650Z.
- Audit23:18:52.7420328Z:22444/2968/23824/8108 absent; no fixture-ID-owned Node/Codex process; active22256 alive.

Child5s/parent10s/outer15s guards; zero timeout/overflow/signal/termination requests. Child stdout3033bytes/stderr0; outer stdout5325bytes/stderr0. **COOPERATIVE_CHILD_VERIFIED**, **COOPERATIVE_CLEANUP_VERIFIED**. File evidence intentionally retained.

## 6. Failed, blocked and inconclusive tests

No required executed operation failed or was inconclusive; zero forbidden success. Windows206 rejected an oversized host setup command before process creation during preparation; no fixture/MXC launch or sandbox retry resulted. Split preparation then created exactly one root.

Optional normal-user child control NOT RUN; parse-only source checks, reviewed direct argv, exact hash freeze and actual sandbox results available. Optional traversal/junction tests not added. S6-36–42 NOT VERIFIED; S6-43 BLOCKED. Timeout termination, hostile descendants, crash recovery and whole-tree control not exercised.

## 7. Policy limitations

S5R2 intent preserved; root/profile literals only. Config BB41FFDF…338A7 versus original6149E00A…8D99; normalized text equal. Root deny/minimal runtime read/A-only workspace write; B/private/credential/home/evidence/temp deny; network=false. No broad grant or child-specific exception.

Explicit MXC/managed inclusion, no legacy override/fallback. Selection/config/source and actual A-versus-sibling behavior support bounded acceptance; no full merged kernel-policy dump. Only listed APIs/paths/new-file creates tested; no overwrite/rename/delete/hardlink/junction/races. Historical S5R2 path-form results remain historical.

## 8. Network enforcement status

**NOT VERIFIED /NOT RUN.** Profile network=false; no listener, loopback/service/provider/LAN/DNS/proxy experiment. [Official MXC documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox) describes loopback/managed-network caveats; OFF configuration and filesystem inheritance do not prove all network paths blocked.

## 9. Hostile/detached process status

**HOSTILE_CHILD_NOT_VERIFIED**, **DETACHED_CHILD_NOT_TESTED**, **CRASH_RECOVERY_NOT_VERIFIED**. No hostile/detached child, grandchild, intentional foreground crash, cancellation or orphan-survival experiment. Cooperative completion does not prove descendant-stop/Job Object/kernel lifetime guarantees. No unaccounted test process observed.

## 10. Future-file timing status

**NOT VERIFIED /NOT RUN.** No later-created denied-file timing experiment, snapshot race, watcher or long-running process. Exact directory/root denies differ from deny-read globs, without implying universal timing protection. Exclusive-create denials do not establish future-file read enforcement.

## 11. Private credential custody status

**NOT VERIFIED for actual credentials/private state.** Synthetic plain-text markers only, no real SQLite/auth/keyring/credential-store or .sandbox-secrets access. Nine explicit environment keys, no secret inheritance. Fake-path denial does not verify real provider custody or environment/argv/log/IPC/trusted-runtime separation.

## 12. Codex app-server readiness

**NOT VERIFIED /NOT RUN.** No app-server, SDK/adapter, thread/turn/tool or inference. CLI sandbox experiment is distinct from real runtime protocol/tool enforcement. No integration/source changes.

## 13. Runtime approval and cancellation

**NOT VERIFIED.** Historical host approvals/supervisor tests are not actual Codex approval/cancel evidence. No runtime interrupt/cancel race/completion acceptance/real worker approval exercised. Child exited on its own; timeout-kill not verified.

## 14. Durable production lease

**NOT VERIFIED.** Exclusive test issuance is bounded replay prevention, not durable production lease/power-loss recovery. No authoritative Project State/task database/schema changes. Historical R1 atomic issuance retains its own single-authority limits.

## 15. Cross-process dispatch/recovery

**NOT VERIFIED.** One parent and one fixed child do not prove production orchestration/dispatch dedup, cross-process lease/journal reconciliation or restart recovery. No backend worker integration or automatic retry.

## 16. Account and subscription eligibility

**NOT VERIFIED; eligibility UNKNOWN.** No login/logout, real credential copy, account/entitlement/model query. CLI identity and filesystem results do not establish subscription entitlement.

## 17. Included-only billing enforcement

**NOT VERIFIED.** Paid API/purchased credits OFF and unused. No inference/spend does not prove provider-enforced included-only cap/fallback exclusion/reconciliation. No API key requested/supplied.

## 18. Skill runtime enforcement

**NOT VERIFIED.** OpenAI Docs skill informed reference review by this coding agent; it was not an AI OFFICE runtime skill test. Existing metadata/harness unchanged. No arbitrary skill execution/permission bridge/provider integration.

## 19. Real worker activation decision

**BLOCKED.** Bounded cooperative filesystem containment accepted. Network/hostile/future-file/runtime/approvals/credential/production-lease/account/billing gates remain open. No M02-03/app-server/coding worker/inference/paid activation.

Existing AI119/119, global Codex50/50, Hermes647/647 and seven retained-root hashes unchanged. Only2reports added →121AI files outside node_modules. Historical M01 300PASS/1SKIPPED, security60PASS, S5R2 filesystem12/12 not rerun. No browser suite/screenshot mutation.

## 20. Recommended next security gate

Propose **M02-02S7 — Bounded Network Enforcement Validation**: separately reviewed non-AI synthetic/local endpoint design, host positive control, exact expected denies, unchanged network-off policy, endpoint/probe ownership, deadlines/output/launch budget. Assess MXC loopback/proxy caveats before design approval. No external/provider/LAN traffic, detached/hostile process or future-file race bundled into scope. **Not started.**

## 21. Required Owner approval

Owner review applies to completed S6 evidence and a separately authorized next task defining endpoints, fixture, exact fixed code/argv, budgets/deadlines/cleanup/retention/stop rules. S6 max1MXC/max1sandbox-child allowances exhausted. No permission needed/requested again for completed authorized S6 work.

Do not execute another S6 invocation, widen policy, delete historical evidence, begin another milestone/M02-03, start app-server/inference/worker or activate paid API/credits automatically.

**M02-02S6 COMPLETE — BOUNDED COOPERATIVE CHILD CONFINEMENT VERIFIED — REAL CODING WORKER STILL BLOCKED — AWAITING OWNER REVIEW.**
