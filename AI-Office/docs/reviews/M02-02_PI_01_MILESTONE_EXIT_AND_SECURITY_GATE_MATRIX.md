# M02-02-PI-01 — Milestone Exit and Security Gate Matrix

**`PI01_M02_EXIT_CRITERIA_INCOMPLETE + SECURITY_STOP_PRESERVED`; `M02_NOT_COMPLETE`.** Architecture inspection/design complete within PI-01; implementation pending, production activation BLOCKED. Companion: [DurableAttempt integration readiness](M02-02_PI_01_DURABLE_ATTEMPT_INTEGRATION_READINESS.md) (Document A, source registry S01–S27, exact future contract/files and 20 proposed tests).

PI-01 is source/doc/hash inspection only. **Zero tests/typechecks/database opens/application scripts/runtime/provider operations executed.** Historical 438 R5–R9 PASS are verified from sealed R9 output/hashes, not fresh integration proof. No pending test below is counted as an execution.

## 1. Source authority and milestone hierarchy

| Source | Actual authority/status | Effect on this assessment |
| --- | --- | --- |
| [Current Baseline](../AI_OFFICE_CURRENT_BASELINE.md#L5), DEC-001–006 and §L | Six architectural decisions approved; detailed designs/current roadmap await review. | DEC-004 subscription-first/Paid API OFF binding; detail/sign-off not inferred. |
| [Current Roadmap](../roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md#L3), lines 66–76 | DRAFT FOR OWNER REVIEW, proposed milestone/task/gate details; current M02 Codex Runtime Feasibility. | Enumerate every located M02 acceptance clause below. Draft source is not final approved exit contract. |
| [MASTER_SYSTEM](../specifications/MASTER_SYSTEM.md#L1), §0.1, §8.4–8.7, §9 | V4.0 consolidated product/system draft; legacy M02 is visual environment. | Product/runtime requirements remain references where compatible; legacy IDs not substituted for current IDs. |
| [MASTER_DESIGN](../specifications/MASTER_DESIGN.md#L1), Bagian 20 | Design discovery handoff, explicitly not final PRD. | UX scenarios guide future real-state/UI integration; not an approved M02 runtime exit list. |
| [Alignment report](../decisions/M00B_ALIGNMENT_REPORT.md#L59), baseline §L | Records legacy/current mapping and missing source handoffs. | Legacy visual M02 belongs to Visual Lab/current M07 sequencing, not current Codex M02. |
| [M01-07 runtime gates](M01-07_M02_GATE_MATRIX.md#L29) | RT-01–RT-16 explicitly future runtime evidence, original statuses dated M01-07. | Keep original IDs; assess present support separately, no retroactive historical edit. |
| [M02-01 gate plan](M02-01_NEXT_POC_GATE_PLAN.md#L205) | Sixteen prerequisites and recommended M02-01..05 stages; not standalone approval. | Preserve original numbered prerequisites; granular stage plan is recommendation, not invented approved roadmap. |
| [S11 durable attempt design](M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md#L727) | Proposed implementation sequence, authority/restore/output broker limitations. | Distinguish proposed production architecture from actual synthetic repository S12–S15. |
| R9 implementation/matrix and sealed evidence | Completed offline scope only. | Does not establish production atomicity, real account rights or OS recovery. |

**Missing authority:** no separately finalized current PRD, signed/versioned M02 acceptance baseline, or separately approved official M02-02/S16B exit specification was located in the repository. The two expected handoffs `AI_OFFICE_HANDOFF_SUBSCRIPTION_FIRST_2026-10-28.md` and `AI_OFFICE_VISUAL_ASSET_HANDOFF_V1.md` remain absent in file discovery. Do not recreate their contents. This is a formal source/sign-off gap, not permission to invent criteria or invalidate individually authorized historical tasks. Old roadmap PLANNED labels have not been synchronized with every later bounded task report; later task evidence establishes only its own scope.

| Hierarchy / original namespace | Meaning supported by source | What completion would not imply |
| --- | --- | --- |
| current M02 | One official bounded Codex worker feasibility task with all critical gates, current roadmap lines 66–76. | Not complete from mock tests or security-only reviews. |
| M02-01 | Official runtime feasibility/source audit + next gate plan. | No account/inference/worker authorization. |
| M02-02 | Security-only fixture harness and prerequisite verification, M02-01 plan §1/§13. | Not the whole M02 or first real coding task. |
| M02-02S11–S15 | Durable control design, synthetic SQLite authority, lease/cancel/recovery foundations. | No actual host identity/OS closure or production wiring. |
| M02-02S16/S16B | Bounded Windows process-control bridge/security evidence workstream. | Historical Job/custody/output/credential blockers not closed by later source tests. |
| S16B refinements → R6W → JC → CRASH/R1–R9 | Nested engineering/evidence branch, not new top-level roadmap milestones. CRASH/R5–R9 are offline admission/provenance/scope/durability foundations. | Distinct from earlier S16B-R5 access-metadata report; short suffixes alone are ambiguous. |
| M02-02-PI-01 | This read-only integration readiness design. | No source implementation, migration, runtime or approval. |
| Recommended M02-03/04/05 | Plan §13 proposes real bounded account/task PoC, recovery expansion, final acceptance. | Stages remain dependent on exact new authorizations, not automatically queued executable work. |
| Other M02 workstreams | Interface/version/handshake, account/billing/credential isolation, streaming mapping, skill discovery/session availability, worker binding, output verification. | None is completed merely by finishing S16B or R9. |
| legacy V4.0 M02 | MASTER_SYSTEM:521–525 main 2.5D office environment and visual/performance approval. | Not current M02 Codex Runtime Feasibility; never mix their exit criteria. |

## 2. Located current M02 acceptance criteria

Original criterion identifier is **M02**; the roadmap supplies clauses, not individual acceptance IDs. Repeated M02 labels below preserve that fact. Clause labels are descriptions, not invented official IDs. Source `RM` below is [current roadmap lines 66–76](../roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md#L66). Status evaluates overall runtime acceptance, not whether a mock predicate exists. Verification is historical/source-only in PI-01.

| Original ID / clause | Exact milestone intent | Source | Existing implementation/support | Actual available verification | Status | Remaining work | First dependency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M02 / goal | One official Codex interface executes one bounded task under workspace/entitlement/billing/permission. | RM:69 | No production Codex adapter/worker dispatch path found; synthetic harness only. | Earlier feasibility/startup/containment records; no accepted production task E2E. | BLOCKED | Build trusted admission/output integration, then authorized single fixture task. | Stop/containment/account/billing/owner gates. |
| M02 / handshake | “handshake berhasil pada versi tercatat”. | RM:73 | Historical pinned-runtime compatibility/startup work; app HTTP has no Codex session bridge. | Historical source/startup reports are not a current account-backed application handshake. | PARTIAL | Matching official interface/version/protocol and sanitized application handshake. | Restricted B02 after safety. |
| M02 / auth–entitlement–billing | “auth mode/entitlement/billing route terbukti sesuai policy”. | RM:73 | R5 supplied assertions and fixed Paid API OFF only; no real verifier. | R5–R9 tests offline; no account/billing proof. | BLOCKED | Authorized mechanism must establish all distinct account/route rights. | B02 + DEC-004. |
| M02 / no paid fallback | “Paid API OFF dan limit failure tidak memicu fallback”. | RM:73 | FOUNDATION_POLICY false; no fallback/provider execution route. | Static literal defaults; not real quota/auth/limit failure behavior. | PARTIAL | Test actual supported route failure under included-only controls; no paid invocation. | Trusted billing gate + B02. |
| M02 / filesystem scope | “worker hanya mengakses root yang diizinkan”. | RM:73 | HostPathPolicy and bounded historical MXC tests; no production binding/dispatch. | Partial historical filesystem/network/process evidence; limitations retained. | PARTIAL | Full effective worker read/write/state/credential boundary under approved profile. | B01/approved containment. |
| M02 / protected authority | “state/evidence terlindungi”. | RM:73 | Strict fixture DB/root/schema checks; S01 not production connected. | R9 isolated integrity/transaction tests; historical custody/private-state protection incomplete. | PARTIAL | Protected authority/artifact/evidence storage; worker denial and provenance proof. | Storage/OS trust boundary. |
| M02 / approval–cancel–crash | “approval/cancel/crash tidak membuat duplicate attempt”. | RM:73 | Synthetic durable issue/CAS/cancel/quarantine, R9 stable key/rollback; no live process bridge. | Offline historical tests; R9 close/reopen is not process crash/closure. | BLOCKED | Actual approval bridge, bounded cancellation/closure, lost-ack/restart reconciliation; no auto-resend. | A02–A07 and B01/B03. |
| M02 / output verified | “output diverifikasi dengan test relevan”. | RM:73 | Pure output rules and mock accepted metadata; UI consumes demo records. | 438 historical offline tests do not verify output of a real coding task. | PARTIAL | Accepted output → immutable artifact/revision → relevant task tests/review. | A03/A05 and B03. |
| M02 / quota unknown | “Quota tanpa sumber ditampilkan UNKNOWN”. | RM:73 | Foundation policy quotaStatus UNKNOWN; no provider usage/status integration. | Source literal observed; no current provider telemetry/UI end-to-end proof. | PARTIAL | Preserve UNKNOWN in normalized provider UI/reporting; unsupported telemetry disposition. | Provider adapter/report contract. |
| M02 / completion gate | One task E2E passes critical gates; unproven interface/billing/isolation keeps operational execution BLOCKED. | RM:76 | Critical production owners/stop/broker absent. | No M02 E2E acceptance certificate/evidence found. | BLOCKED | Satisfy critical gates and explicit acceptance review; do not expand provider/workers. | All critical A/B dependencies. |

Supporting **scope/evidence requirements**, also original identifier M02, must not disappear from exit reconciliation:

| RM source clause | Implementation and verification currently available | Exit assessment / remaining dependency |
| --- | --- | --- |
| :70 interface/version pin and handshake | Historical feasibility/startup reports only; no app runtime session. | PARTIAL; official pinned bridge proof B02. |
| :70 authentication/entitlement checks, one fixture task | No production verifier or real coding task accepted. | BLOCKED; owner-approved account/route and B03. |
| :70 streaming events | HTTP request-response, demo events; no real event normalizer/session stream. | NOT_VERIFIED; A05/A06 and B03. |
| :70 approval reject/expiry | Synthetic approval memory and R5 expiry tests exist. | PARTIAL; authenticated durable decision + actual protocol checks. |
| :70 file/secret boundaries | Historical partial containment; no live credential access in PI-01. | PARTIAL; approved B01 negative cases, no credential-value evidence. |
| :70 cancellation, inspect/resume, crash recovery, duplicate prevention | Durable synthetic controls and R9 normal recovery; no real lifecycle integration. | PARTIAL/BLOCKED for activation; actual support/unsupported disposition and B03. |
| :70 read-only skill discovery/session availability after gates | Skill metadata enforces UNKNOWN/NOT_VERIFIED; no actual session discovery. | NOT_VERIFIED; keep skill execution OFF; optional feature must be explicitly deferred/unsupported, not silently passed. |
| :72 M01, explicit fixture PoC, current interface/terms, user account, minimum policy/evidence/recovery | M01 historical foundation; later narrow task approvals do not authorize general runtime. | PARTIAL; current official/account verification only under a new permitted scope. |
| :74 sanitized source/handshake/event trace, fixture diff/tests | Offline source/audit artifacts exist; real account-backed traces absent. | PARTIAL; B02/B03; no tokens/credentials in evidence. |
| :74 sibling/junction/dummy credential denials, approval/cancel/restart and skill inventory/limitation | Partial historical probes + contract tests with explicit limits. | PARTIAL; unresolved B01/B03; no invented missing evidence. |

Formal exit completeness is **INCOMPLETE** until an authoritative current PRD/acceptance version/sign-off is identified. All located clauses above are retained; no missing criterion is fabricated. Legacy V4.0 M02 visual approval/performance remains in its own namespace and is not declared satisfied by this runtime review.

## 3. Original prerequisite and runtime-gate reconciliation

The following are original identifiers in the repository's M02 planning/gate documents, not newly approved criteria. Older original statuses remain unchanged in their files. Current columns assess support at PI-01 without runtime rerun.

| Original M02-01 prerequisite # (§12) | Requirement | Current support / missing evidence | Status for real activation |
| --- | --- | --- | --- |
| 1 | Official interface selected | Candidate/pinned compatibility documented historically; production bridge not built/current terms not rechecked. | PARTIAL |
| 2 | Subscription/authorization valid | No account-specific authorization mechanism verified in PI-01. | NOT_VERIFIED |
| 3 | Included-only billing | Foundation OFF default; effective real route/account controls not proven. | BLOCKED |
| 4 | Credentials isolated | Dummy boundary work exists; current credential/process inheritance proof incomplete. | BLOCKED |
| 5 | Disposable project scope | Historical R9 fixtures are disposable, but not approval of a new worker fixture. | PARTIAL |
| 6 | Private DB/unrelated workspace protected | Fixture path/SQL restrictions; full effective worker OS protection incomplete. | PARTIAL |
| 7 | Sandbox tested | Historical bounded tests have explicit remaining custody/containment gaps. | PARTIAL |
| 8 | Approval policy enforced | R5 predicates/synthetic approvals; no live authenticated approval bridge. | PARTIAL |
| 9 | Cancellation adequate | Synthetic durable intent/receipts; whole historical process closure not established. | BLOCKED |
| 10 | Task/attempt identity persisted | S01 synthetic schema/CAS; not real application command/worker path. | PARTIAL |
| 11 | No duplicate after uncertainty | R9 SQL retry proof; production external effects/crash behavior unresolved. | PARTIAL |
| 12 | Actions auditable | Local synthetic journals; real normalized runtime event pipeline absent. | PARTIAL |
| 13 | Immutable worker binding | Foreground binding exists and invalidates on switch; independent real worker lease missing. | PARTIAL |
| 14 | AI Office state authoritative | Demo state and synthetic attempt store separate; production acceptance owner not composed. | PARTIAL |
| 15 | No valuable data | Historical dummy scope preserved; all new runtime paths must receive their own explicit dummy manifest. | PARTIAL |
| 16 | Explicit Owner worker approval | Not granted by PI-01 or Option A. | BLOCKED |

| Original M01-07 gate | Requirement | Existing support / unresolved requirement | Current exit status |
| --- | --- | --- | --- |
| RT-01 | Official integration interface | Prior documented candidate/startup; current application handshake/protocol version proof absent. | PARTIAL |
| RT-02 | Subscription entitlement/applicability | Account-specific proof not supplied/queried; static code cannot establish rights. | NOT_VERIFIED |
| RT-03 | Supported sign-in/session | Browser bootstrap is local UI authentication, not provider identity/session. | NOT_VERIFIED |
| RT-04 | Runtime isolation | Historical bounded negatives do not close all same-user/process/credential/publication risks. | PARTIAL |
| RT-05 | Worker filesystem scope | Host fixture path checks; actual immutable execution lease and effective OS constraints missing. | PARTIAL |
| RT-06 | Windows containment | Jc custody/membership NOT_OBSERVABLE; historical closure/provenance unresolved. | BLOCKED |
| RT-07 | Explicit read/write approvals | Synthetic fixture possession not authenticated runtime approval; revocation must join DB boundary. | PARTIAL |
| RT-08 | Cancellation/process cleanup | No independent closure certificate; no new observation performed. | BLOCKED |
| RT-09 | Crash/restart recovery | Normal DB reopen proven offline; no production process/invocation recovery. | PARTIAL |
| RT-10 | No duplicate execution | Stable synthetic identities and SQL constraints; one-shot external launch/reconcile absent. | PARTIAL |
| RT-11 | Provider quota behavior | UNKNOWN default only; no official telemetry path exercised. | NOT_VERIFIED |
| RT-12 | Billing OFF/no paid fallback | Defaults preserved; real account/adapter limit failure proof absent. | PARTIAL |
| RT-13 | Skill session visibility/enforcement | Metadata remains UNKNOWN/NOT_VERIFIED; no session test or skill execution. | NOT_VERIFIED |
| RT-14 | Binding independent of foreground | S12 foreground capability is revoked on switch; not background worker lease. | PARTIAL |
| RT-15 | Real execution auditability | Demo events/synthetic journals are not real source-tagged events/artifact evidence. | PARTIAL |
| RT-16 | Minimal backup before valuable data | No new backup/restore/archival executed; valuable data remains excluded. | NOT_VERIFIED |

## 4. Completed offline foundations and unpromoted blockers

| Scope | Verified historical result | What remains outside that result |
| --- | --- | --- |
| R5 pure evaluators | 100 PASS in sealed R9 run2. | Inputs are supplied metadata; no authentication or dispatch. |
| R6 in-memory atomic mock | 72 PASS. | No durability or physical side-effect fence. |
| R7 fake authority | 84 PASS. | Private fixture origin, not production principal or signed credential. |
| R8 scoped capability | 91 PASS. | No production grant store; deliberate same-realm reference transfer possible; R8-20 exception retained. |
| R9 SQLite mock transactions | 91 PASS; same-file metadata atomicity and normal close/reopen; total438. | No live R7 cross-system atomicity, abrupt process/power-loss or consistent rollback witness proof. |
| S12–S15 DurableAttemptRepository | Source/tests exist; openForTest/profile synthetic; API/CAS/history inspected. | No fresh S12–S15 tests executed by PI-01 and no production factory/caller. |
| Historical S16B/CRASH process work | Preserved existing reports/evidence only. | Custody/closure/provenance/physical output/credential fencing cannot be inferred from R5–R9. |
| PI-01 | Two reports; source/call-graph/type-shape/hash inspection. | No implementation, migration, test run, worker/provider or runtime authorization. |

No official M02 acceptance row is promoted from offline foundations alone. Runtime disposition D9 remains NOT_AUTHORIZED. Option A in [R3 owner packet §H](M02-02S16B_R6W_JC_CRASH_R3_OWNER_DECISION_PACKET.md#L102) is **No Action / Preserve Security Stop**, pending approval; it is not a storage-location choice, cleanup certificate, or execution approval. No approver/date/signature is invented.

## 5. PI readiness audit gates

An audit PASS means the mapping/design requirement was completed, not that the proposed production component exists. In particular, mapping an absent admission/publication/stop owner does not authorize it.

| Gate | Requirement | Audit result | Evidence / finding | Operational implication |
| --- | --- | --- | --- | --- |
| PI-01 | Historical checkpoint validated | PASS | R9 anchor/listed files/source hashes/final test JSON verified; Document A B/C. | No new runtime evidence. |
| PI-02 | DurableAttemptRepository located | PASS | repository.ts:19, openForTest:22; concrete test callers. | Test-only construction, not production DI. |
| PI-03 | Lifecycle mapped | PASS | state-machine.ts:5; methods and cancellation/recovery documented. | No running worker inferred. |
| PI-04 | Production authority owner identified | PARTIAL | Synthetic attempt owner and demo/UI owners identified; production security/principal/output owner absent. | Production activation BLOCKED. |
| PI-05 | Transaction boundary identified | PASS | private transaction:33, current/update/journal same db; separate demo/JSON stores. | Production contract/schema change required. |
| PI-06 | Consumption integration assessed | PASS | Document A H/I, claims/accepted rows/CAS design. | Not implemented. |
| PI-07 | Admission point identified | PASS | Future repository-owned guard before LAUNCHING; no existing production controller. | No dispatch activation. |
| PI-08 | Publication point identified | PASS | Future accepted metadata/head/manifest in same transaction; actual outputs mapped. | Broker absent; output delivery blocked. |
| PI-09 | SECURITY_STOP mapped | PASS | Historical/operator state vs disabled flags vs missing durable stop authority distinguished. | Missing authoritative enforcement makes production activation BLOCKED. |
| PI-10 | Cancel/revoke mapped | PASS | Actual persisted cancellation + synthetic host WeakMap; future revocation transaction. | Physical stop/real revocation not verified. |
| PI-11 | Idempotency/recovery assessed | PASS | Existing narrow replay, generic acceptance/unknown gap, old-DB witness limitation. | No automatic resume/duplicate launch. |
| PI-12 | External effects assessed | PASS | Document A N outbox/intent/ack/quarantine and race limits. | No exactly-once or rollback claim. |
| PI-13 | Credential/entitlement/billing mapped | PASS | Local UI credentials vs absent provider verifiers; DEC-004. | UNKNOWN denies; no account access. |
| PI-14 | Official M02 exit reconciled | PARTIAL | All located draft clauses/RT/prerequisite IDs mapped; final approved PRD/exit sign-off absent. | Formal exit assessment INCOMPLETE. |
| PI-15 | Ordered backlog created | PASS | Track A/B below, dependencies/files/tests/DoD/authorization. | Proposed, not execution queue. |
| PI-16 | Next source scope defined | PASS | A01 / PI-02, exact six file boundaries in Document A R. | Separate bounded implementation request needed. |
| PI-17 | No runtime/provider execution | PASS | Only read-only source/hash commands and two report writes. | No new process/account observation. |
| PI-18 | Source/evidence preserved | PASS | Actual final493 files; existing491/hash/path baselines and1450historical/647Hermes preserved. | R8-20 unchanged, no archival. |
| PI-19 | Approval status retained | PASS | Option A pending; D9 not authorized; all code/runtime tasks proposed. | No implied approval. |
| PI-20 | No premature M02 completion | PASS | M02_NOT_COMPLETE; primary decision explicit. | No production readiness declaration. |

**Audit total: 18 PASS / 2 PARTIAL.** These counts are document/source audit dispositions, not executed tests or production acceptance results.

## 6. Dependency-ordered implementation backlog

All tasks below are **PROPOSED, NOT_IMPLEMENTED by PI-01**. Track A code/tests can be isolated offline only after their own bounded source/fixture authorization. Track B requires separate exact owner approval plus approved containment/account procedures. No Track B work is executed. Missing final acceptance sign-off remains an owner/source dependency but does not require delaying a separately authorized default-deny code change.

### Track A — Offline implementation

| Task / dependencies | Concrete objective and exact likely files | Transaction contract | Tests / Definition of Done | Authorization/security dependency | Offline sufficient? / Runtime needed? |
| --- | --- | --- | --- | --- | --- |
| A01 = **M02-02-PI-02**, first source slice | Repository-owned default-deny readiness. New `src/server/attempt-control/execution-readiness.ts`, new `tests/integration/durable-attempt-foundation/execution-readiness.test.ts`; modify `attempt-control/schema.ts`, `test-storage.ts`, `repository.ts`, and scoped `tests/integration/durable-attempt-foundation/persistence.test.ts`. | New versioned UNKNOWN security row; read canonical attempt/meta/security under repository read transaction; false authority, no clearance API. | IT-01/02 plus missing row/version/identity/cancel/recovery/terminal tests; unsupported schema denies without migration; prior safe regressions intact. Return BLOCKED even if synthetic CLEARED lacks real proofs. | New bounded code/test request; fresh isolated roots only; no policy enable/clear/runtime source changes. | Yes for this negative readiness seam; no runtime. |
| A02 after A01 | Typed authenticated host/policy/session/grant records and provenance validation. Existing `attempt-control/contracts.ts`, `schema.ts`, `test-storage.ts`; proposed new `attempt-control/execution-policy.ts`, `tests/integration/durable-attempt-foundation/execution-policy.test.ts`. | Policy/auth revision, subject/session/destination/grant exact bindings in same authority DB; no second fake owner. | IT-03/07/08/17/18/20; unknown/forged/replayed/expired rights deny; no provider credentials in records. | Separate source/schema scope; actual principal/issuer trust source must be specified; code cannot manufacture proof from literals. | Offline validates contracts/denial; live account proof deferred B02. |
| A03 after A02 | Same-file accepted-operation transaction. Existing `repository.ts`, `schema.ts`, `journal.ts`, `contracts.ts`; proposed new `operation-coordinator.ts`, `tests/integration/durable-attempt-foundation/operation-coordinator.test.ts`. | Private db-scoped helpers, SQL claims+accepted/head+journal+attempt CAS one transaction; no nested public repository methods. | IT-04/05/06/11/12/13; fixed faults/unique keys, real connection locks, stable unknown/lookup, cross-table reducer checks. | Explicit schema/event API approval, dummy data; executionAuthority false, no external calls. | Yes for DB metadata boundary; not real launch proof. |
| A04 after A03 | Extend real-domain cancellation/recovery ordering and accepted-operation reconciliation. Existing `repository.ts`, `cancellation.ts`, `recovery.ts`, `lease.ts`, `journal.ts`; proposed new `tests/integration/durable-attempt-foundation/acceptance-recovery.test.ts`. | Cancel/revoke/terminal/control and acceptance serialize; current generation/clock/host required, no legacy lease bypass in future real path. | IT-08/09/10/13/14/15; noLaunch intent honored even if phase unchanged; no auto-resend; conflict hold retained until separate verified closure. | Separate source scope; real closure evidence remains B01/B03; no PID queries or hold release from fake receipts. | Offline for logic; runtime closure NOT proved. |
| A05 after A03/A04 | Immutable output metadata/manifest + outbox design implemented in isolated storage. Existing `schema.ts`, `journal.ts`, `repository.ts`; proposed new `output-publication.ts`, `delivery-outbox.ts`, `tests/integration/durable-attempt-foundation/output-publication.test.ts`. | Acceptance/head/outbox same DB; blobs private/immutable before pointer commit; orphan never visible; acknowledgment separate. | IT-07/10/12/15/16/19; classification, scope, sequence, stale broker and no direct canonical file/tool permission. | Bounded file/schema fixture scope; no real publication or artifact cleanup; external broker still disabled. | Offline for metadata/private fixture files; real delivery B03. |
| A06 after A01–A05 plus storage/principal decisions | Approved host construction and disabled application command/read-model integration. Existing `server/index.ts`, `http.ts`, `state/service.ts`, `state/storage.ts`, `state/database.ts`; proposed new `attempt-control/host-storage.ts` and `tests/integration/durable-attempt-foundation/host-composition.test.ts`; later real-event domain additions in `contracts` explicitly scoped. | One canonical authority connection; demo DB downstream read model/outbox, never second acceptance authority. No client-selected DB/connection or fixture-handle promotion. | Static construction/import tests, fake local input without server/worker; all action paths converge; unknown stop stays closed; migration rehearsal only on new disposable DBs. | Separate production source/data/migration design approval; never repoint openForTest at user DB; current FoundationPolicy remains false until later activation authorization. | Offline composition/data compatibility only; activation not covered. |
| A07 after A04/A05/A06 and approved host broker contract | Disabled broker interfaces for execution/delivery and reconciliation. Proposed new `attempt-control/execution-broker.ts` and `tests/integration/durable-attempt-foundation/broker-denial.test.ts`; `runtime-security/supervisor.ts` read as fixture reference, not repurposed. | Claim committed intent with current broker lease/security revision; OS/provider effects outside SQL, UNKNOWN requires reconciliation. | IT-16–20; assert no process/provider/filesystem delivery called when any proof unavailable. No real broker subprocess in Track A tests. | Exact future adapter/native filenames require approved contract, not guessed existing code; historical containment gates remain. | Offline denial/interface tests yes; actual broker behavior B01–B03. |

Paths without full prefixes in A02–A07 are relative to `src/server/attempt-control/` unless explicitly under server/tests. All NEW names are proposed deliverables, not claims of components found in the repository. No changes to historical R5–R9 source/tests are proposed as a shortcut. New storage schema versions must be explicit; old profiles are rejected safely, not auto-migrated or silently reinterpreted. Track A does not authorize broad regression runners that spawn test clients without inspecting and approving their side-effect scope.

### Track B — Restricted runtime verification, not executed

| Task / dependencies | Objective / exact source or evidence boundaries | Transaction and verification requirement | Authorization/security dependency / Definition of Done | Offline sufficient? |
| --- | --- | --- | --- | --- |
| B01 after owner-approved containment/disposition procedure | Resolve or explicitly gate historical custody/provenance/closure and prove effective new allowed containment scope. Existing `tests/integration/runtime-security/process.test.ts`, `probes/containment-probe.mjs` are reference paths only; do not assume they validate private MXC Job custody. Proposed new evidence report `docs/reviews/M02-02_PI_CONTAINMENT_VERIFICATION.md`; exact native helper/binary/path allowlist must be supplied in the separate procedure. | No SQL receipt may stand in for OS ownership/closure; bind native evidence to incarnation/invocation/scope and preserved artifacts. | Separate exact operator authorization; no inference from Option A. Scope known processes/handles and setup; stop on unknown custody. DoD independently adequate containment/state/credential/output fencing and explicit residual disposition, no invented cleanup certificate. | No; requires approved OS/native verification. BLOCKED now. |
| B02 after B01 safety prerequisites and A02/A07 deny paths | Official runtime/account/billing/credential preflight, pinned interface and sanitized handshake. Proposed new adapter filename must be fixed by its own implementation scope; evidence report `docs/reviews/M02-02_PI_ACCOUNT_RUNTIME_PREFLIGHT.md` (NEW). Existing runtime policy source remains a guard, not proof. | External rights cannot join SQL; trusted bounded attestations stored as sanitized references with policy/window; unknown denies. | Separate account/interface/network/model/route authorization; included-only/Paid API OFF; no raw tokens. DoD official permitted route/identity/runtime/model access and failure/no-fallback evidence. | No; requires permitted external/account operations. NOT_AUTHORIZED now. |
| B03 after A01–A07, B01/B02 and explicit worker scope | One disposable real task plus approval reject/expiry, actual stream/output verification, cancel/interrupt/ambiguous-result recovery; then review M02 acceptance. Proposed new report `docs/reviews/M02-02_PI_SINGLE_WORKER_ACCEPTANCE.md` (NEW); exact adapter/test/task files fixed in separate request. | Accepted intent/operation and correlated invocation/delivery receipts; no automatic second spawn after uncertainty. | Explicit owner worker approval and approved roots/tools/network/containment/cleanup rules. DoD every applicable M02 criterion evidenced or noncritical limitation explicitly disposed; no promotion of unresolved critical gates. | No; requires restricted real runtime. BLOCKED now. |

No backlog item is permission to operate on historical resources, run account checks or activate workers. Source/source-sign-off and actual code authorization are distinct from runtime approval; Option A remains a separate historical No Action proposal. Archival requires its own approved destination and permission, not any A/B task here.

## 7. Transaction, recovery and side-effect dependencies

| Boundary | Feasibility | Required change / limitation |
| --- | --- | --- |
| Attempt + local security/policy/grant + claim + accepted metadata + output head | REPOSITORY_CONTRACT_CHANGE_REQUIRED; SAME_TRANSACTION_FEASIBLE after changes. | One S01-owned file/connection/BEGIN IMMEDIATE; database constraints, CAS and extended reducer, no public raw transaction. |
| Demo state DB / workspace registry / JSON harness journal | CROSS_STORE_CONSISTENCY_REQUIRED. | Independent files/handles/memory; use authoritative intent/events and versioned downstream projections, not nested helpers as one transaction. |
| Historical/global SECURITY_STOP | ATOMICITY_BLOCKED today for production enforcement. | No authoritative programmatic source; add default-deny project row first. Global operator inhibition across project DBs requires separate host protocol. |
| Provider entitlement/billing/revocation | CROSS_STORE_CONSISTENCY_REQUIRED. | Trusted current attestation and external freshness strategy; unknown/expired denies. |
| OS launch / tools / external delivery / canonical file writes | CROSS_STORE_CONSISTENCY_REQUIRED. | Outbox/one-shot intent + separately gated broker/ack/reconciliation; SQL rollback cannot undo effects. |
| Abrupt-process/power-loss recovery | NOT_VERIFIED. | R9 normal close/reopen cannot prove it. No new runtime test or OS kill in PI-01. |
| Complete valid older DB restore | NOT_VERIFIED; witness absent. | Local hashes/incarnation can be restored together; unsupported restore/quarantine, fresh reviewed activation, no checksum anti-rollback claim. |

These labels are design/feasibility assessments, not executed integration tests. TB-01–TB-10 are mapped individually in Document A H. IT-01–IT-20 in Document A S remain **PROPOSED / NOT_RUN**, with exact dependencies. Stateful tests and typecheck are not run in this read-only milestone.

## 8. Integrity, exceptions, owner dependencies and M02 status

Actual inventory baseline **491 files**, final **493** after exactly two authorized reports. Default Git rows **165 → 167**; every pre-existing change remains. Original source/tests/config/schema/package/.gitignore/reports unchanged; no missing old file. Historical **1,450 files / 22 available roots** and **647 tracked Hermes files/path set** have zero hash/path drift. `.git/node_modules` excluded; reparse metadata compared; older unavailable 2,209/17 roots NOT_VERIFIED. No new historical TEMP artifact, database fixture or audit rewrite. No Git publication/reset/merge/deploy.

R8-20 remains `PASS_EXISTING_SCOPE_WITH_R8_DIAGNOSTIC_EXCEPTION`, original overwritten R8 JSON not reconstructed; sealed surviving R8 and R9 final evidence preserved. R9's anti-rollback, crash, cross-process and live-authority limitations remain open. Historical time stays 2026-11-09T06:29:44.7514982+07:00; no current liveness/custody claim.

| Owner/security dependency | Status |
| --- | --- |
| Option A — No Action / Preserve Security Stop | PENDING_OWNER_APPROVAL; not execution/storage/cleanup permission. |
| Runtime disposition D9 | NOT_AUTHORIZED. |
| Real worker / provider authorization | BLOCKED / NOT_VERIFIED; no live access. |
| Jc membership/custody and PID24956 | NOT_OBSERVABLE / INCONCLUSIVE, no new queries. |
| Evidence archival | PENDING_AUTHORIZATION; no archive/copy/move/delete. |
| Formal current PRD/M02 acceptance sign-off | NOT_LOCATED; official exit assessment INCOMPLETE. |
| PI-02 and all A/B implementation | PROPOSED; requires separate bounded source/test/runtime authorization as applicable. |
| Overall M02 | M02_NOT_COMPLETE; SECURITY_STOP_PRESERVED. |

Internal adversarial review covers 20 requested challenges in Document A T; same agent, not independent certification. Open findings F01–F11 remain visible. No active production exploit is inferred merely from absent future components, and no completed offline work is discarded.

## 9. Single recommended next engineering milestone

**M02-02-PI-02 — Repository-owned default-deny execution readiness (A01).** Implement the six-file scope in Document A R: canonical UNKNOWN security row in a fresh versioned authority fixture, repository-owned same-transaction readiness read, false authority and no clear-stop/dispatch/provider capability. Prove negative cases and compatibility with safely scoped offline tests. This is a concrete source change to the existing repository; it does not wait on a broad research review and does not authorize production activation or resolve formal M02 exit/sign-off.
