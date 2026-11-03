# M02-02 — Runtime Gate Matrix

Tanggal: 29 Oktober 2026. Companion: [Security Harness Report](M02-02_SECURITY_HARNESS_REPORT.md).

**Host tests: PASS. Acceptance: CONDITIONAL** karena dua regenerated original E2E screenshots dan dua retained failed-test fixture directories (automatic deletion review rejected). Real Codex worker tetap **BLOCKED**.

## Evidence labels

- **HOST_VERIFIED**: actual local synthetic assertion, terbatas pada fixture/host boundary.
- **PROCESS_LIFECYCLE_VERIFIED**: actual non-AI process observation; tidak mengimplikasikan OS confinement.
- **OS_VERIFIED**: membutuhkan independently enforced OS denial/containment proof. Tidak diperoleh di M02-02.
- **CODEX_RUNTIME_VERIFIED**: membutuhkan authorized actual runtime evidence. Tidak diperoleh di M02-02.
- **ACCOUNT_VERIFIED**: membutuhkan authorized applicable account/billing/entitlement proof. Tidak diperoleh di M02-02.
- **NOT VERIFIED**: evidence belum tersedia. **BLOCKED**: execution tidak boleh berlanjut pada gate terkait.

Tidak ada blanket runtime PASS dari keberhasilan host.

## Level 1 — S01–S15 host evidence

Semua test paths di bawah relatif `tests/integration/runtime-security/`. Final focused run: **49 PASS**, 5 files, 8.22 s, exit 0.

| ID | Requirement | Evidence | Result | Limitation | Blocking impact / next authorized test |
|---|---|---|---|---|---|
| S01 | Valid A context dan approved operation | `policy.test.ts`: genuine registry/binding, read/write/create evaluator | HOST_VERIFIED | Synthetic capability; no requested arbitrary mutation | Host gate satisfied; real durable worker lease belum |
| S02 | A→B dan B→A rejection | `policy.test.ts`: sibling absolute paths dan swapped scope | HOST_VERIFIED | Direct same-user IO tidak dimediasi | OS project-boundary deny test masih required |
| S03 | Private-state rejection | `policy.test.ts`: app-private sentinel target denied, unchanged | HOST_VERIFIED | Bukan actual OS denied read | Actual worker/private DB denial BLOCKED |
| S04 | Dummy credential request rejection | `policy.test.ts`, `process.test.ts` host evaluator | HOST_VERIFIED | Direct probe canary read justru berhasil | Credential isolation BLOCKED; independent OS/profile boundary |
| S05 | Traversal/alias/link rejection | `policy.test.ts`: traversal, UNC/device, drive-relative, stream, prefix, actual junction/hard link; `approval.test.ts` junction replacement | HOST_VERIFIED | Postcheck TOCTOU tetap ada | Later kernel-enforced denied IO proof |
| S06 | Immutable task/attempt ownership | `policy.test.ts`: frozen object/arrays, wrong/missing binding, copy/rebind/reuse/revoke/expiry | HOST_VERIFIED | Foreground-independent synthetic lease, not persisted real lease | Production lease contract/persistence review |
| S07 | Explicit decision, default deny | `approval.test.ts`: missing/pending/unknown/fake controller, DENY terminal | HOST_VERIFIED | Simulated trusted controller, no UI/runtime protocol | Actual approval bridge/event test BLOCKED |
| S08 | Replay/expiry rejection | `approval.test.ts`: consumed grant, expiry before decision and after grant, duplicate dispatch | HOST_VERIFIED | In-process synthetic engine | Actual epoch/reconnect/expiry test required |
| S09 | Scope/operation substitution rejection | `approval.test.ts`: project/task/attempt/generation/fingerprint changes, changed mode, A grant to B | HOST_VERIFIED | No actual runtime IDs | Actual thread/turn/item/request binding required |
| S10 | One fixed owned process | `process.test.ts`: actual PID, fixed Node script, bounded stdout/stderr, normal exit, missing-cwd start error | PROCESS_LIFECYCLE_VERIFIED | Not a general command runner or Codex | Runtime launch/stdio compatibility remains BLOCKED |
| S11 | Cancellation and bounded stop | `process.test.ts`: prestart/startup/active/pending/duplicate/late/failure/race; stubborn escalation | PROCESS_LIFECYCLE_VERIFIED | Cooperative fixed probe; prior side effects remain | Actual runtime interrupt + no remaining writes proof |
| S12 | Owned descendant cleanup | `process.test.ts`: root-child-grandchild graceful and forced-root/cooperative-descendant exit | PROCESS_LIFECYCLE_VERIFIED | No hostile/detached/reparented tree, Job Object or hard crash proof | Untrusted tree containment NOT VERIFIED/BLOCKED |
| S13 | Duplicate dispatch/identity prevention | `approval.test.ts`, `journal.test.ts`: concurrent duplicate, unique attempt/key, fresh harness refusal | HOST_VERIFIED | No exactly-once side-effect guarantee | Production unique dispatch lease + reconnect tests |
| S14 | Journal reopen and uncertainty | `journal.test.ts`, `restart.test.ts`: real separate OS processes, actual RUNNING PID, explicit FAILED reconcile, injected atomic-write fault/tamper | HOST_VERIFIED + PROCESS_LIFECYCLE_VERIFIED | Controlled safe interruption, not abrupt power/host loss | Real runtime crash recovery/durable Project State journal BLOCKED |
| S15 | Host vs OS distinction | `process.test.ts`: host denies fake-canary path, direct same-user probe reads it; boolean only | HOST_VERIFIED (distinction) | **OS CONTAINMENT NOT VERIFIED / INSUFFICIENT FOR UNTRUSTED WORKER** | OS gate fails readiness; no real worker |

## Level 2 — reconciliation of all 16 M02-01 prerequisites

Names/order mengikuti `M02-01_NEXT_POC_GATE_PLAN.md` section 12. Host progress tidak menghapus real-runtime gate.

| Gate | Requirement | M02-02 evidence / result | Limitation | Blocking impact | Required next authorized test/decision |
|---|---|---|---|---|---|
| P01 | Official interface dipilih | Prior owned stdio app-server recommendation; installed metadata 0.162.1 unchanged | No binary/handshake/protocol test; CODEX_RUNTIME_VERIFIED absent | BLOCKED actual adapter | Owner select/pin executable/interface; later bounded compatibility proof |
| P02 | Subscription/authorization valid | No account requests/auth; ACCOUNT_VERIFIED absent | Identity, deployment eligibility, plan/model scope UNKNOWN | BLOCKED | Separately authorized official permitted-use/account mechanism; no cache extraction |
| P03 | Included-only billing | Paid API/key/credit fallback tidak digunakan | Applicable included-only hard cap NOT VERIFIED; quota UNKNOWN | BLOCKED | Prove actual route's effective saved stop controls; no inference until safe; no route substitution assumptions |
| P04 | Credentials isolated | HOST_VERIFIED deny + sanitized env; direct fake-canary read succeeds | OS/profile credential isolation insufficient; no actual token read | BLOCKED | Independent safe dummy-store/identity/profile boundary proof; never test failure against real secrets |
| P05 | Disposable project scope | HOST_VERIFIED canonical A/B fixture and cleanup bounds | Two failed fixture dirs retained; no future real-worker manifest | Future worker scope BLOCKED | Owner approve later exact disposable roots/manifest after review |
| P06 | Private DB/unrelated workspace protected | HOST_VERIFIED cross-project/private negative tests | Direct worker/OS denied IO NOT VERIFIED | BLOCKED | Independent denied read/write boundary against safe stand-ins |
| P07 | Sandbox tested | S15 explicitly demonstrates no independent OS confinement | OS_VERIFIED absent; no native Codex sandbox test | BLOCKED | Separate authorized containment setup/test, exact effective implementation, network/reparse negatives |
| P08 | Approval policy enforced | HOST_VERIFIED S07–S09 | Actual runtime events, permission envelope and unsupported requests NOT VERIFIED | BLOCKED | Reviewed actual protocol bridge and bounded event-denial proof |
| P09 | Cancellation adequate | PROCESS_LIFECYCLE_VERIFIED S11/S12 | Cooperative synthetic tree only; actual turn/hostile descendants NOT VERIFIED | BLOCKED | Authorized actual interrupt + owned-tree/write cessation proof before coding |
| P10 | Task/attempt identity persisted | HOST_VERIFIED fixture journal, sequences/idempotency | No real authoritative journal, worker lease, schema or migration | BLOCKED | Separate approved state contracts/schema/journal design and implementation |
| P11 | No duplicate after uncertainty | HOST_VERIFIED controlled restart, no auto dispatch, explicit reconciliation | No real transport reconnect/hard crash or exactly-once guarantee | BLOCKED | Actual runtime uncertain-send/reconnect/reconcile tests with ownership proof |
| P12 | Actions auditable | Synthetic PID/nonce/phase/exit and bounded output evidence | Real event mapping/terminal verification/task acceptance not implemented | BLOCKED | Sanitize/map real IDs, ordering, error/terminal observations and artifact validation |
| P13 | Worker binding immutable | HOST_VERIFIED A survives UI B switch; exact issued capability | Synthetic attempt only; no durable production lease/account/epoch | BLOCKED | Persist/validate real worker lease; delayed cross-project event tests |
| P14 | AI Office state authoritative | Existing M01 state source unchanged; harness has no production routes/DB writes | Fixture JSON is deliberately nonauthoritative; runtime bridge absent | BLOCKED integration | Reviewed observation-to-state commit boundary, no direct runtime DB access |
| P15 | No valuable data | HOST_VERIFIED synthetic files only; no valuable project writes | Does not authorize later arbitrary root selection | Restriction remains mandatory | Owner approve future dummy-only manifest; preserve no valuable data condition |
| P16 | Explicit Owner worker approval | This prompt authorizes M02-02 host work only | No M02-03/worker approval; acceptance itself CONDITIONAL | BLOCKED | Review reports/exceptions, then separate bounded authorization only after required safety/account/billing gates |

## Validation and acceptance gates

| ID | Requirement | Evidence | Result | Limitation / impact | Next action |
|---|---|---|---|---|---|
| V01 | Existing foundation intact | Final typecheck PASS; existing tests 300 PASS/1 SKIPPED; E2E 2 PASS | HOST_VERIFIED for regression assertions | Initial 3 pre-edit timeout failures, reruns PASS, cause unknown | No claim of timeout root-cause fix |
| V02 | Windows ACL proof | Existing `workspace/paths.test.ts:97` skipped | NOT VERIFIED | Cannot infer OS security from foundation tests | Separate authorized independent test |
| V03 | Protected inventory | 81/83 AI-Office originals identical; all existing source/contracts/config/docs identical; 647/647 Hermes identical | CONDITIONAL | Two E2E PNG outputs regenerated, absent original rollback copies | Owner review scope variance; no assertion of full byte identity |
| V04 | Safe teardown | No owned dummy/server/dev process or listeners 43123/43124 left; no generic kill | PROCESS_LIFECYCLE_VERIFIED | Not all OS handles audited | Keep actual crash/untrusted tree gate NOT VERIFIED |
| V05 | Temporary cleanup | Successful fixtures removed; rollback + two failed synthetic fixtures retained | CONDITIONAL | Recursive deletion auto-review rejected “blocked by policy” | Review retained paths in companion report; no bypass attempted |
| V06 | No unauthorized runtime/account action | No Codex command/adapter, auth, inference, paid API, skills, OS setup, installs or credentials read | Scope respected | Absence of execution is not runtime enforcement proof | Preserve blocks; stop after M02-02 |

## Readiness decision

**HOST SECURITY ASSERTIONS: PASS. M02-02 ACCEPTANCE: CONDITIONAL / READY FOR OWNER REVIEW.** No critical host assertion is being waived. Generated-artifact scope variance and retained cleanup evidence remain visible review items.

**OS_VERIFIED: NOT VERIFIED. CODEX_RUNTIME_VERIFIED: NOT VERIFIED. ACCOUNT_VERIFIED: NOT VERIFIED. REAL WORKER: BLOCKED.**

Owner review may accept/request disposition of generated PNGs and retained fake-data fixture evidence. It does not approve account/authentication, OS changes, runtime launch or M02-03. Those need separate explicit scope after unresolved gates are satisfied. No automatic next milestone.
