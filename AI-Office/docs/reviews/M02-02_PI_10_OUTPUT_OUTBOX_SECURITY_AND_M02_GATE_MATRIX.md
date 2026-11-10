# M02-02-PI-10 — Output/Outbox Security and M02 Gate Matrix

`PI10_DURABLE_OUTPUT_OUTBOX_DESIGN_COMPLETE_IMPLEMENTATION_PENDING` + `SECURITY_STOP_PRESERVED`. Architecture and implementation plan only. **No code/schema/database change, DDL or application tests.** Current production publication/execution authority false, host authority unavailable, production atomicity not verified.

## PI10 Architecture Gates

**23 PASS / 2 PARTIAL / 0 FAIL** architecture-readiness findings. PI10-15/-16 are PARTIAL for the full future production profile/proof/delivery protocol; the PI11A six-table held-only schema/commands/file plan are sufficiently precise for the next bounded implementation. Architecture PASS is not implementation/test/runtime PASS.

| Gate | Requirement | Architecture status | Evidence / limit |
|---|---|---|---|
| PI10-01 | PI09B checkpoint verified | PASS | Actual532/214 baseline and sealed PI09B manifest E52080822365125145ECDB28FFD2E9DC7AECD903462E6B00530771408B787A97 verified; prior1088 tests historical only. |
| PI10-02 | Existing schema inspected | PASS | USER_VERSION9, profile pi05-isolated-security-stop-v1, 12 current tables, exact-DDL validator/PRAGMAs/read-only host inspected. |
| PI10-03 | Actual output paths mapped | PASS | 14 checkpoint surface groups reconciled with current fixture finish/HTTP/metadata/source paths; no production broker. |
| PI10-04 | Canonical metadata owner identified | PASS | Same DurableAttemptRepository and owned SQLite connection; no independent output authority/DB/sequence owner. |
| PI10-05 | Acceptance contract specified | PASS | AO01–12 mapped; PI11A fixture metadata forced offline-held, production acceptance remains denied. |
| PI10-06 | Sequence/idempotency specified | PASS | Per session/attempt-generation/destination/channel stream, unique seq/event/operation/key; epoch aliases existing attemptGeneration. |
| PI10-07 | Atomic metadata/outbox transaction designed | PASS | One BEGIN IMMEDIATE, canonical validation, seq/op/claim/accepted/outbox/audit, deferred tuple FKs, ambiguity classification, no network transaction. |
| PI10-08 | Outbox lifecycle defined | PASS | Full future transition table, HELD-only current/default, no deliverable state in PI11A DDL. |
| PI10-09 | Delivery-time revalidation specified | PASS | Independent service identity/current ownership/policy/classification/stop/lease rechecked, accepted record never permit. |
| PI10-10 | Cancellation/revocation specified | PASS | CancellationPayload checked even if phase APPROVAL_GRANTED; revoked/terminal/stale output held, unavoidable send race explicit. |
| PI10-11 | SECURITY_STOP semantics preserved | PASS | All existing UNKNOWN/BLOCKED/ACTIVE_STOP deny; no CLEARED state, relaxation, stop API or clearance designed into PI11A. |
| PI10-12 | Payload/confidentiality assessed | PASS | PRODUCTION_OUTPUT_CLASSIFICATION_UNVERIFIED; no payload store/encryption authority/secret classifier; PI11A reference NULL. |
| PI10-13 | Ack/retry/recovery defined | PASS | 10 crash/restart scenarios, transport vs recipient/consumption, stable key, no blind ambiguous retries, restore/witness limit. |
| PI10-14 | External effect limits documented | PASS | Metadata DB-only atomicity; no rollback of delivered data/exactly-once/OS proof. |
| PI10-15 | Schema implementation-ready | PARTIAL | PI11A fresh v10 six-table held-only DDL is precise, NOT_EXECUTED. Future two delivery tables specified but authorized production profile/security/identity model cannot be finalized before actual external authority. |
| PI10-16 | Repository API implementation-ready | PARTIAL | Exact PI11A methods/commands/errors/owner restrictions specified. Positive accept/claim/send/ack protocol handles remain design-only, blocked on independent source and destination protocol; no implementation-ready production proof format invented. |
| PI10-17 | Offline test matrix defined | PASS | 49 future cases classified PI11A or restricted/deferred; all NOT_RUN in PI10, no inflated PASS. |
| PI10-18 | Exact file plan produced | PASS | Verified existing/proposed paths, ten responsibility/compatibility/security/DoD dimensions; no publisher/host route plan in PI11A. |
| PI10-19 | Production trust-root dependency retained | PASS | PI08 unavailable source retained; current local session/provenance/ForTest handles never production authentication. |
| PI10-20 | No positive publication activated | PASS | Docs only, source/schema/DB unchanged; both authority flags false. |
| PI10-21 | No runtime/provider execution | PASS | No tests/typecheck/DDL/DB open/listener/worker/provider/tool/runtime/containment execution. |
| PI10-22 | Source/evidence integrity preserved | PASS | Two additions/no modifications/deletions; source register/hash/old Git rows/history/Hermes and final seal verification. |
| PI10-23 | Historical statuses retained | PASS | PI09B five PARTIAL, PI09A-18/PI02-19/PI06-08/PI07-08, PI08 blockers, R8-20/four suites retained. |
| PI10-24 | Official M02 acceptance gap retained | PASS | PI01 matrix/current roadmap inspected; MASTER_DESIGN says not final PRD; no signed final criteria located; official exit incomplete. |
| PI10-25 | Single next implementation milestone | PASS | Only PI11A—Repository-Owned Held Output Metadata & Atomic Outbox Foundation; no delivery activation or second fake issuer. |

## Actual Output-Surface Coverage

| Surface | Actual source / symbol | Current behavior / scope |
|---|---|---|
| OP01 | src/server/runtime-security/supervisor.ts; SyntheticSecurityHarness.capture | COLLECTION_ONLY_UNCHANGED; Buffer.concat into owned Run only |
| OP02 | src/server/runtime-security/supervisor.ts; SyntheticSecurityHarness.finish ->run.resolve(ProbeResult) | TARGET_EXISTING_FIXTURE_RELEASE; Resolves result containing stdout/stderr; not external transport |
| OP03 | src/server/runtime-security/supervisor.ts; child.on(message), stopRun, cancel, close | SAFETY_CONTROL_UNCHANGED; Bounded messages and cancel IPC; owned kill only if actually running |
| OP04 | src/contracts/execution-fence.ts; evaluateOutputPublication | PURE_CONTRACT_UNCHANGED; None; no state commit or send |
| OP05 | src/contracts/testing/mock-enforcement.ts;src/contracts/testing/fake-authority-adapter.ts;src/contracts/testing/scoped-capability.ts; attemptMockPublication/prepareMockPublication/commitMockPublication; preparePublication/commitPublication; attemptScopedPublication | MOCK_ONLY_UNCHANGED; Updates fixture publications/sequence/mock single-use claims |
| OP06 | src/contracts/testing/durable-mock-transaction.ts; Store.attempt via openDurableMockTransaction.boundary.attemptDurableMockOperation | MOCK_ONLY_UNCHANGED; Writes accepted_operations and claims atomically in mock DB |
| OP07 | src/server/attempt-control/repository.ts;src/server/runtime-security/journal.ts; DurableAttemptRepository.commitTerminal/requestCancellation;FixtureAttemptJournal.transition/reconcile | SAFETY_AND_METADATA_UNCHANGED; Owned metadata transaction / journal append |
| OP08 | src/server/http.ts; reply/listenHttp route switch | NON_EXECUTION_UNCHANGED; response.writeHead/end(JSON.stringify) |
| OP09 | src/server/brain/reader.ts;src/web/components/ProjectPanels.tsx; readKnowledge/BrainPanel | NON_EXECUTION_UNCHANGED; Read existing scoped file and return JSON/display |
| OP10 | src/server/state/service.ts;src/contracts/demo.ts;src/web/workspace/controller.ts;src/web/visual/mapper.ts; ProjectStateService.snapshot/seedDemo;ShellController;mapVisualAgents | NON_EXECUTION_UNCHANGED; Owned demo DB seed/read and state rendering |
| OP11 | src/server/index.ts;scripts/dev.mjs;src/server/workspace/errors.ts; main/launcher stdout and IPC;safeFailure | NON_EXECUTION_NOT_RUN; Console and own-process IPC only if launched |
| OP12 | Asset_3D_Model/src/export/RoomExporter.ts; downloadRoomAssetPackZip/downloadRoomManifestAndAnchors/downloadRoomPreviewPng | UNRELATED_NOT_MODIFIED; Browser Blob/download |
| OP13 | docs/reviews/M02-02S11_DURABLE_ATTEMPT_CONTROL_DESIGN.md; Staging ->immutable blob ->current DB pointer (design only) | PRODUCTION_NOT_IMPLEMENTED; No production publication operation |
| OP14 | src/server/http.ts;src/server/index.ts (absence search); No production provider/tool/WS/SSE/event/output queue broker | NOT_APPLICABLE; None found |

Current fixture producer-to-consumer call graph remains capture ->private buffers ->finish lifecycle journal ->denyOutputPublication(actual registered PI08 boundary) ->run.resolve(empty stdout/stderr plus minimal type/nonce/pid controls). Host publication.evaluate denies before workspace/repository acquisition. No production output sink or accepted-output/outbox exists. HTTP/brain/demo/launcher/VisualLab are distinct non-execution surfaces; no global output denial or endpoint change.

No new source interface here: accepted metadata, outbox, sequence, lease/attempt/ack classes are **proposed**. Fake in-memory/durable R6–R9 acceptance is not production output ownership; existing mock internals remain untouched.

## Current versus Proposed Components

| Component | Classification | Current evidence / limitation | Planned boundary |
|---|---|---|---|
| Raw fixture capture/result | IMPLEMENTED | PI09B private bounded capture, empty consumer text/minimal controls | Unchanged; future real producer not implemented |
| PI08/PI09A/PI09B guard | IMPLEMENTED deny-only | Every runtime authority false, deeper validation NOT_EVALUATED | Unchanged, no synthetic positive source |
| Owned SQLite/CAS/stop/history/session | IMPLEMENTED_OFFLINE_ONLY mutation; IMPLEMENTED host diagnostic storage | Actual schema9/read-only HOST_SQLITE; no positive state | Reuse original repository/connection |
| R5 evaluator | IMPLEMENTED pure contract | Supplied metadata eligibility, not IO/auth | Reuse later only with actual trusted snapshot; inert compatibility tests separate |
| R9 durable accepted mock | IMPLEMENTED_OFFLINE_ONLY | Mock capabilities/accepted_operations/claims/journal, no network | Semantics reference only; never import fake authority as provider |
| Output stream/op/claim/accepted/outbox/events | DESIGNED_NOT_IMPLEMENTED | Six fresh held-only tables in A.R | PI11A earliest implementation, all metadata offline-only |
| Payload classification/store/encryption | NOT_VERIFIED | No content classifier/keys/store; caller labels untrusted | NULL payloadReference now; production acceptance blocked |
| Positive accepted/delivery authority | BLOCKED_EXTERNAL_AUTHORITY | Current PI08 and security enum deny; writable host output absent | Future reviewed authentic-source/profile evolution, not PI11A |
| Delivery attempts/ACK/broker/recipient | DESIGNED_NOT_IMPLEMENTED / BLOCKED_EXTERNAL_AUTHORITY | Two future table specifications, no actual service/protocol | No delivery code/schema activation in PI11A |
| Monotonic witness/restore freshness | NOT_VERIFIED | NOT_IMPLEMENTED, local hashes can be rolled back together | No automatic delivery resume after uncertain restore |

Actual source anchors and hashes are in Report A.D / source-register.json plus source-register-followup.json (39 files). Full proposed DDL, field ownership/mutability/version/constraint table and exact repository/file/test contract are in Report A.F–U. Every new file path/table/API there is labeled PROPOSED, not an existing implementation.

## AO / SQ / OB Design Invariants

All rows are **specified design**, NOT_IMPLEMENTED/NOT_EXECUTED, not positive production acceptance. The first seven AO downstream checks remain NOT_EVALUATED by the current PI08-denied host path.

| Invariant | Requirement | Design enforcement / dependency |
|---|---|---|
| AO-01 | Missing producer denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-02 | Wrong project/session denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-03 | Wrong attempt/incarnation denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-04 | Stale epoch denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-05 | Missing authorization denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-06 | Wrong destination/channel denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-07 | Unsupported confidentiality denies | Future trusted state required; current PI08 denies. PI11A fixture relationships are metadata-only, not authentication. |
| AO-08 | Duplicate accepted output cannot duplicate logical publication | Operation/output/event/stream-key uniqueness + request digest exact replay. |
| AO-09 | Acceptance coupled atomically to outbox | One writer transaction, cyclic deferred tuple FKs and precommit/reopen semantic verification. |
| AO-10 | Failed acceptance leaves no deliverable outbox | One writer transaction, cyclic deferred tuple FKs and precommit/reopen semantic verification. |
| AO-11 | Current deny-only creates no production accepted row | PI11A OFFLINE_CONTRACT_ONLY/HELD; private fixture factory; host denial before acquisition. |
| AO-12 | Accepted row cannot authorize external delivery | Record and receipt false authorities; separate delivery gate. |
| SQ-01 | Duplicate sequence cannot double-accept | UNIQUE(streamId,sequence) plus expected-revision CAS under writer lock. |
| SQ-02 | Stale epoch cannot reuse active sequence | executionEpoch aliases canonical attemptGeneration, not caller counter. |
| SQ-03 | Old run cannot publish into new run | runIncarnation aliases executionSessionId; new immutable stream key. |
| SQ-04 | Failed transaction does not advance sequence | Counter/claim/accepted/outbox/event share rollback/commit. |
| SQ-05 | Retry resolves original committed operation | Same stable op/key/digest lookup, COMMIT_UNKNOWN reconciled not blindly repeated. |
| SQ-06 | Conflict cannot reorder confidential output | Next sequence exactly last+1; gap/conflict denies, no auto sorting. |
| SQ-07 | Cancellation invalidates eligibility | Current cancellationPayload/terminal check and future revalidation; no rewind. |
| SQ-08 | Sequence consistent after restart | Exact DDL/history/counter/linked record validation; consistent restore still lacks witness. |
| OB-01 | No outbox intent without authorized accepted metadata | Deferred mutual accepted/outbox links plus same transaction; PI11A inert fixture metadata only, production authorization absent. |
| OB-02 | No accepted transaction without required outbox | Deferred mutual accepted/outbox links plus same transaction; PI11A inert fixture metadata only, production authorization absent. |
| OB-03 | Failure commits neither side | Deferred mutual accepted/outbox links plus same transaction; PI11A inert fixture metadata only, production authorization absent. |
| OB-04 | Outbox row not permit | Committed intent/lease/receipt not capability. |
| OB-05 | Current authority rechecked before delivery | Full current host/service/producer/run/stop/policy/content/destination checks at claim and send; unavailable ->hold. |
| OB-06 | Revocation blocks undelivered output | Full current host/service/producer/run/stop/policy/content/destination checks at claim and send; unavailable ->hold. |
| OB-07 | Cancellation blocks undelivered output | Full current host/service/producer/run/stop/policy/content/destination checks at claim and send; unavailable ->hold. |
| OB-08 | SECURITY_STOP blocks ordinary delivery | Full current host/service/producer/run/stop/policy/content/destination checks at claim and send; unavailable ->hold. |
| OB-09 | Expired lease cannot grant indefinite ownership | Lease host/domain/generation/nonce hash and trusted deadline; uncertainty ->reconcile. |
| OB-10 | Reclaimed delivery logically idempotent | Same stable outbox destination key+digest; no old lease resurrection. |
| OB-11 | DB idempotency distinct from recipient idempotency | Recipient dedup/ack/consumption separate from local unique operation transaction. |
| OB-12 | No exactly-once claim without end-to-end protocol evidence | No local DB/normal reopen/mock test establishes exactly-once external effects. |

## Atomic Transaction Assumptions and Corrections

One project/incarnation owned SQLite DB/connection supports metadata atomicity in principle. Existing writer uses BEGIN IMMEDIATE; PRAGMA source contract is DELETE/EXTRA/FK ON/trusted_schema OFF/read_uncommitted OFF/100ms BUSY. No DB or PRAGMA was executed in PI10.

Exact six-table transaction: validate factory ownership/input ->BEGIN IMMEDIATE ->exact schema/current scope/history ->historical op replay or conflict ->new-write owner/session/security/cancel/state checks ->stream CAS ->op and optional inert claim ->accepted binding snapshot ->outbox HELD ->audit head/event ->semantic verification ->COMMIT ->receipt. Deferred pair FKs enforce op/accepted/outbox and optional claim links plus output event head. Attempt phase/security projection not mutated merely to accept output metadata.

**Source gap corrected in plan:** current transaction wrapper does not expose COMMIT outcome phases. Add private phase observation to existing engine for the output adapter; preserve legacy behavior and regression checks. Never classify no receipt/generic DATABASE_FAILURE as proven rollback. Ambiguous COMMIT/rollback failure quarantines and requires original operation lookup. No blind new key/body retry.

No distributed atomicity across independent policy/auth databases, filesystem payload store, network, recipient or consumption. Local writer lock serializes same-DB stop/cancel changes, not remote revocation. Historical binding snapshot/digest remains immutable; source row updates can invalidate future delivery while leaving historical metadata valid. Reopen must not treat every newer policy/session revision as corruption.

## Confidentiality and Payload Gaps

`PRODUCTION_OUTPUT_CLASSIFICATION_UNVERIFIED`. R5 classifications are supplied metadata. No independent classifier/content inspection/immutable store/encryption/key authority found. PI11A reference NULL, raw bytes never in command/store/audit; synthetic digest/size/UNVERIFIED labels do not prove safe content.

Metadata IDs/destinations/digests may also be sensitive. Public denials contain safe code/correlation only; detailed diagnostic views scoped to owner, no existence oracle for unauthorized callers. Payload custody prior to metadata is a separate future external operation; orphan/missing/mismatched blobs held, cleanup/archive requires independent approved policy. No automatic evidence deletion or permissive PUBLIC default.

## Delivery, Retry and Revalidation Risks

Current and PI11A cannot deliver: no broker, positive guard, PENDING transition, active lease or positive receipt. Future intent is not permit; fresh independent service+principal+producer/membership, canonical run/epoch, destination/channel/classification/custody, cancellation/terminal/stop, policy/grant/source revisions/expiry and fenced lease required at claim and again before send intent.

Claim lease is not network authorization. Expiry/new host/clock mismatch is not proof previous send never happened. Persist DELIVERING send intent/immutable attempt before external call, commit, then transport; no network in SQL transaction. A change after last local check races with external effect; recipient fencing/protocol evidence is a missing dependency. No DB rollback can retract bytes.

Stable destination operation=outboxId, bound scope/digest, new attempt number and lease generation per transport attempt. Recipient durable dedup/status horizon must cover retry horizon; absent protocol, ambiguous delivery is held with no automatic resend. Current retry maximum zero (not implemented); future policy must explicitly supply trusted bounded retry/expiry semantics. TRANSPORT_ACCEPTED, RECIPIENT_DURABLE_ACCEPTED and RECIPIENT_CONSUMED are distinct; only verified appropriate recipient receipt may support DELIVERED. Late acknowledgment never reauthorizes cancelled/revoked output.

## Recovery Scenarios

| Crash/restart case | Required outcome | Limit |
|---|---|---|
| Before acceptance COMMIT | Proven rollback ->no rows/claim/sequence; unclear COMMIT ->quarantine+lookup | No receipt =not proof of rollback |
| After COMMIT before acceptance receipt | Lookup same operation/idempotency+digest under owned scope; return historical receipt false authority | Do not create different operation/output/sequence |
| Before delivery claim | HELD stays HELD, future PENDING requires new current authorization | Never start a dispatcher from existence of row |
| After CLAIMED before send | Owner restart/unknown clock ->HELD/reconciliation with event; no blind lease steal | Absence of send receipt doesn't prove absence of send |
| After send before ack | RECONCILIATION_REQUIRED, query trusted recipient by stable outbox key+digest if protocol available | Without recipient dedup/status proof no automatic resend |
| Ack received before local update | Persist/replay authentic receipt after reopening; local ack commit ambiguity ->lookup | Transport receipt not recipient consumption |
| Restart expired delivery lease | New host/domain invalidates prior lease; retain generation history and unknown attempts | Wall expiry alone not proof prior worker stopped/no delivery |
| Revocation while pending | Current grant/policy/session/auth source check holds/cancels undelivered output | If send already crossed boundary, record uncertainty; no retraction claim |
| Cancellation while pending | Check cancellationPayload not just phase; cancel pending rows, don't rewind sequence | Safety ack/journal remain usable, no ordinary payload in control |
| Older consistent DB restoration | Independent monotonic witness unavailable ->freshness NOT_VERIFIED and delivery remains held | Schema/hash/chains/UUIDs all can be restored together; no DB-only anti-rollback proof |

`PRODUCTION_PUBLICATION_ATOMICITY_NOT_VERIFIED`. External monotonic witness NOT_IMPLEMENTED; restored consistent DB/profile/UUID/hash chain can look healthy. Missing independent freshness disposition means no automatic production delivery resume. Normal fixture close/reopen is not crash/OS/process recovery proof.

## Safety-Control Separation

Existing security-stop activation, cancel acknowledgments, cleanup/termination/failure/incident metadata and journals remain independent of ordinary output. Minimal typed enums/IDs/status only; no model payload promoted by control-event labels. PI09B existing fixture control result still works by source checkpoint; no fresh process/control test in PI10.

PI11A only held metadata controls HELD->HELD/CANCELLED with same-DB audit/CAS. No clearance, unblock, retry-authorized recovery, or payload forwarding. Existing RecoveryAuthority.dispatch CLOSED/retryAuthorized false and fixture issuer are not broker service identity.

## Proposed PI11A and Restricted Future Tests

**49 cases specified in Report A.U; all NOT_RUN in PI10.** Category totals and individual future dependency labels are design inventory, not PASS counts.

| Group | Required coverage | Execution status |
|---|---|---|
| A01–A12 | Inert valid held record, missing authority, stop/owner/cancel/scope, atomic links/rollback, replay/conflict/sequence/missing outbox | NOT_RUN, PI11A proposal |
| O01–O12 | Held default/denied claim in PI11A; live lease/revoke/receiver/retry cases restricted future only | NOT_RUN; no future delivery activation |
| R01–R10 | Owned normal reopen/rollback/lost metadata receipt/tamper/host checks; live delivery/expired-lease/restore evidence dependencies separate | NOT_RUN |
| S01–S10 | No network/worker/provider/endpoint/fixture promotion/clearance/raw persistence/log leak/external delivery; authorities false | NOT_RUN |
| F01–F05 | READONLY/BUSY, COMMIT uncertainty, inert claim rollback, gap/order/capacity and safety controls | NOT_RUN |

PI09B **1,088 PASS historical only**, including 72 new and1,016 regressions then; two typecheck exit0 historical only. PI10 new tests0, regressions0, typecheck NOT_RUN, SQL NOT_EXECUTED. Document/hash review is not test execution. No failure diagnostics reconstructed.

## Exact PI11A Acceptance Criteria

All criteria below must be demonstrated by the later implemented source and actual scoped test evidence, not a design PASS:

1. **PI11A-AC01** — Only the concrete eight-file PI11A source/test change map in A.T plus its separately requested reports/evidence; no host/security/provider/route refactor.

2. **PI11A-AC02** — Fresh disposable proposed schema10/profile exact DDL/digest; existing v9 rejected unchanged; no real DB migration/backfill.

3. **PI11A-AC03** — Private fixture factory origin required before SQL on recordHeldOutputForTest; HOST_SQLITE remains readOnly/query_only and cannot invoke writer.

4. **PI11A-AC04** — No independent fake authority factory. Existing owned fixture storage and canonical session/provenance setup reused as metadata, no production issuer.

5. **PI11A-AC05** — recordClass OFFLINE_CONTRACT_ONLY, productionAccepted:false, both authorities false; payloadReference NULL; no raw payload/path/URL/credentials stored.

6. **PI11A-AC06** — Default HELD; SQL/API reject PENDING/CLAIMED/DELIVERING/DELIVERED, any lease owner/nonce/deadline, attempt counter or retry wakeup.

7. **PI11A-AC07** — One existing repository connection/BEGIN IMMEDIATE; stream/op/optional inert claim/accepted/outbox/event linked and verified within one transaction; no nested public transactions.

8. **PI11A-AC08** — Unique keys/seq/event and stable digest enforce exact replay or explicit conflict; failed transaction never advances sequence or consumes claim.

9. **PI11A-AC09** — Expected/current scope/session/owner/attempt/security revisions validated; cancellationPayload/terminal/recovery, BLOCKED/ACTIVE_STOP/missing/corrupt fixture new-write deny.

10. **PI11A-AC10** — COMMIT phase observation preserves legacy behavior; output returns unknown on ambiguous commit/rollback uncertainty, quarantines and requires same-key lookup; no automatic body retry.

11. **PI11A-AC11** — Reopen/each output read/write verifies profile, links, immutable snapshot and event chain, contiguous sequence, bounded limits; legitimate newer current revisions mean stale-for-delivery, not history corruption.

12. **PI11A-AC12** — Retained metadata has no arbitrary deletion/repair/archive. Whole consistent old snapshot limitation and missing witness explicitly recorded, never called anti-rollback proof.

13. **PI11A-AC13** — Actual held cancellation/audit remain minimal and usable; existing stop activation/cancel/cleanup/PI09B text withholding preserved; no clearance or output forwarding.

14. **PI11A-AC14** — Tests import/command safety preflight, disposable roots, process/network/listener guards and unique evidence; run only relevant safe suite and scoped typecheck after future authorization.

15. **PI11A-AC15** — Publish actual new/regression counts and failures; current1088 historical baseline becomes fresh only if rerun. Keep four child-process suites and runtime/listener/prod cases NOT_RUN.

16. **PI11A-AC16** — Definition of Done never implies production accepted output, delivery/recipient consumption, OS/MXC containment, owner approval or M02 completion.

Concrete future code scope: modify schema.ts/repository.ts/host-sqlite.test.ts/host-composition.test.ts/security-stop.test.ts; add output-metadata.ts/output-journal.ts/output-metadata.test.ts. All paths under src/server/attempt-control or tests/integration/durable-attempt-foundation as specified in A.T. No production delivery tables/broker/host writer/endpoint/authentication implementation. Schema10 is proposed next fresh format derived from current9, not an in-place migration or actual applied version. Full authorized profile and opaque authority/recipient protocol stay blocked; do not add a fake issuer to satisfy tests.

## Historical Security Gates

SECURITY_STOP_PRESERVED; PRODUCTION_HOST_AUTHORITY_UNAVAILABLE; PRODUCTION_PUBLICATION_ATOMICITY_NOT_VERIFIED; M02_NOT_COMPLETE; OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE. PI09B-08/-11/-12/-13/-18 remain PARTIAL, as do PI09A-18, PI02-19, PI06-08 and PI07-08 (filesystem). PI08 production trust-root/issuer-audience/clock/rotation-revocation/membership blockers remain BLOCKED/NOT_VERIFIED; its prior 17 PASS / 2 PARTIAL / 5 BLOCKED are not promoted. Four historical child-process suites NOT_RUN; historical runtime-security process-oriented suites NOT_RUN; R8-20 diagnostic evidence exception PRESERVED. External monotonic witness NOT_IMPLEMENTED; Jc NOT_OBSERVABLE and historical PID 24956 INCONCLUSIVE. Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; evidence archival PENDING_AUTHORIZATION. Workers BLOCKED; production worker dispatcher/output broker NOT_IMPLEMENTED.

PI09B's five PARTIAL gates are specifically ownership/current session-run mapping (-08), explicit incarnation/current epoch (-11), destination/channel registry (-12), authoritative content/confidentiality (-13) and non-execution HTTP/UI live verification (-18). PI10 documents dependencies, does not resolve/promote any. PI07-08/PI06-08 path-based filesystem limitations remain; source markers/digests/DB FKs not OS containment. R8-20 exception preserved. Four blocked child-process suites remain NOT_RUN.

## M02 Integration and Original Criteria

Source: docs/reviews/M02-02_PI_01_MILESTONE_EXIT_AND_SECURITY_GATE_MATRIX.md and docs/roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md lines66–76. MASTER_DESIGN.md line5 explicitly says discovery handoff, not final PRD. Filename/content discovery located no approved final PRD/version/sign-off; missing historical handoffs not recreated.

| Existing draft M02 clause | Outbox design relevance | What remains unverified |
|---|---|---|
| State/evidence protected | Owned repository snapshots/retained intent/audit support custody | Actual protected production storage, worker/OS access and independent provenance |
| Approval/cancel/crash do not duplicate attempt | Stable operation/atomic metadata/reconciliation avoids duplicate output bookkeeping | Actual approval/protocol/process cancellation/crash/side-effect evidence; output idempotency is not attempt execution proof |
| Output verified by relevant tests | Durable output identity/digest could bind task artifact and later test/review | No real coding task/output/artifact or relevant task tests run; fixture contract not M02 result |
| Interface/version handshake | No outbox substitute | Current official/account-backed application handshake/protocol evidence |
| Auth mode/entitlement/billing; Paid API OFF/no limit fallback | No output schema grants account/billing rights | Independent authorized account/route verification and real failure behavior |
| Worker only allowed root | Payload reference may support future protected artifacts | Full filesystem/state/credential/containment scope, not Node path/schema proof |
| Quota without source UNKNOWN | No sequence/outbox count used as quota source | Provider telemetry/UI proof or explicit unsupported disposition |
| One task E2E critical gate | Design is a supporting engineering dependency only | No accepted real task E2E or final official M02 sign-off |

The draft does **not** name a signed “durable outbox” criterion. This design supports existing output/state/recovery concerns, not an invented approval requirement or automatic satisfaction of the PRD.

Critical dependency disposition:

| Dependency | Current status | Evidence / limit | Next required authority/work |
|---|---|---|---|
| Production host authentication | BLOCKED_EXTERNAL_AUTHORITY | PI08 actual source unavailable; IDs/fixture contexts not authentication | Selected independent authority/protocol/keys/audience/session/revocation/clock |
| Trusted workspace membership | BLOCKED_EXTERNAL_AUTHORITY | PI04 canonical local associations do not authenticate external membership | Independently established subject/project/session membership source |
| Positive operation admission | DESIGNED_NOT_IMPLEMENTED / BLOCKED_EXTERNAL_AUTHORITY | PI09A all false; current stop states/readiness deny | Auth, current scope/policy/stop model and approved runtime prerequisites |
| Output acceptance authorization | BLOCKED_EXTERNAL_AUTHORITY | PI09B all false; future authorized schema/API PARTIAL | Independent producer/grant/classifier/destination, writable protected store |
| Durable accepted-output metadata | DESIGNED_NOT_IMPLEMENTED | PI11A held fixture slice ready in Report A, no current tables | PI11A code/tests only; not positive production authority |
| Durable outbox | DESIGNED_NOT_IMPLEMENTED | Six-table held-only design; current production broker absent | PI11A atomic metadata foundation; restricted delivery later |
| Delivery broker | DESIGNED_NOT_IMPLEMENTED / BLOCKED_OWNER_APPROVAL | No publisher/queue/WS/SSE/provider output path exists | Approved service identity, destination protocol, current permission and effect reconciliation |
| Cancellation/revocation enforcement | IMPLEMENTED_OFFLINE_ONLY / NOT_VERIFIED production | Existing metadata/control checks; delivery race/current sources not verified | Future revalidation protocol; no rollback of delivered bytes |
| OS containment/runtime verification | NOT_VERIFIED / BLOCKED_OWNER_APPROVAL | Historical partial MXC/handle/process/witness results retained; D9 not authorized | Separately scoped explicitly authorized runtime evidence |
| Provider entitlement/billing/interface | BLOCKED_EXTERNAL_AUTHORITY / NOT_VERIFIED | No current account-backed app handshake/permission/billing-route proof | Official supported interface/current account/entitlement/no-paid-fallback verification under authorized scope |
| Official M02 sign-off | BLOCKED_OWNER_APPROVAL / NOT_VERIFIED | MASTER_DESIGN not final PRD, roadmap current draft, PI01 exit matrix incomplete | Actual final approved criteria/version/sign-off; do not invent |
| Owner Option A / archive | BLOCKED_OWNER_APPROVAL | OptionA PENDING_OWNER_APPROVAL, D9 NOT_AUTHORIZED, archival PENDING_AUTHORIZATION | Owner/external disposition; no implication from design PASS |

## Thirty Adversarial Architecture Challenges

Internal self-review, not independent certification, executable exploit test or production acceptance:

| # | Challenge | Finding / design correction |
|---|---|---|
| 1 | Acceptance before authorization | Production branch unreachable: actual PI08 denies and every current security state denies. PI11A only private-factory fixture HELD metadata, productionAccepted:false; cannot be used as future authority. |
| 2 | Outbox without accepted metadata | Accepted↔outbox mutually required deferred tuple FKs plus full semantic verification before COMMIT/open. |
| 3 | Accepted metadata without outbox | Same mutual FKs plus operation and initial audit head; no partial success receipt; six-table transaction. |
| 4 | Capability claim without operation | Optional claim↔operation pair cyclic FK, grant scope/revision cross-check; real single-use semantics absent and not inferred from R8. Claim failure rolls back sequence/metadata/outbox. |
| 5 | Retry double acceptance | Exact operation/key/output/event/digest lookup resolves original receipt before new-write CAS for authorized historical scope; no rewrite/new sequence. |
| 6 | Duplicate sequence | Unique stream+sequence, writer lock and expected stream revision CAS; bounded monotone seq, failed transaction cannot advance. |
| 7 | Conflicting idempotency | Changed logical fields or different stable identity with reused key ->explicit conflict; no digest-only coalescing/reorder. |
| 8 | Stale incarnation | Run identity aliases canonical executionSessionId; new run never resets old stream. Current session snapshot rechecked before future positive acceptance/delivery; missing independent mapping blocks. |
| 9 | Stale epoch | Output epoch aliases attemptGeneration; no second counter or caller epoch authority; archived old owner epoch remains history only. |
| 10 | Cross-project leakage | One project/incarnation connection scope, stream composite FK, session scope trigger and semantic joins; raw routing destinations forbidden. |
| 11 | Cross-session leakage | Execution-session/application/principal snapshots validated; rebind/revocation invalidates delivery, historical metadata remains valid audit not fresh authorization. |
| 12 | Destination override | Bound destination+channel in immutable stream key; registry source unavailable now, so no positive destination selection or automatic URL send. |
| 13 | Untrusted confidentiality | No default PUBLIC. PI11A UNVERIFIED/OFFLINE_SUPPLIED always HELD; actual classifier/encryption/store absent. Reference/digest not safety proof. |
| 14 | Secret-bearing logs | Bounded typed reason/digest/correlation metadata only; no raw bytes/token/nonce/paths in audit or errors. Sensitive identifiers require scoped diagnostics. |
| 15 | Delivery after cancellation | Fresh cancellationPayload check, not phase alone, at acceptance/claim/send intent. Eager hold not sole gate. No rollback of externally sent output. |
| 16 | Delivery after revocation | Current principal/session/grant/policy/source revisions and expiry rechecked; authority changed after final local check still distributed race, destination protocol required. |
| 17 | Delivery after stop | Current security state/journal checked before every future phase; all existing states deny, sticky stop cannot be cleared by design. PI11A held metadata never deliverable. |
| 18 | Lease takeover race | Lease row CAS plus generation/owner/nonce/domain and bounded trusted deadlines; expiry/new host ->reconcile, not proof send did not occur. |
| 19 | Acknowledgment loss | Stable outbox destination operation key and immutable attempt/ack evidence; query authentic recipient state, otherwise hold; no blind resend. |
| 20 | Crash after send | DELIVERING send intent persisted before network; crash/timeout ambiguous ->RECONCILIATION_REQUIRED. SQL transaction never covers network. |
| 21 | Exactly-once claim | Only local metadata atomicity specified; destination dedup/recipient consumption separate, no exactly-once claim. |
| 22 | Restore/anti-rollback | DB digests/triggers cannot detect a whole consistent old snapshot; external monotonic witness missing. Hold after uncertain restore; no invented anti-rollback proof. |
| 23 | Test authority promoted | Private construction provenance from actual fixture ownership transfer only; no boolean caller/config or R7/R8 issuer. Connection type currently erases source, so explicit internal origin bit planned. |
| 24 | Dispatcher before trust root | PI11A outbox CHECK restricts HELD/CANCELLED and zero/null delivery fields; no broker code/method/host facade; future profile requires separate security/authority review. |
| 25 | Safety-control suppressed | Minimal typed internal cancellation/stop/incident metadata kept separate. No raw payload attached to 'control' labels; no ordinary external control-event publisher added. |
| 26 | Alternate publisher bypass | Actual fixture release stays PI09B guarded, HTTP/brain/demo non-execution unchanged; no production sink presently. Future all-sink integration remains dependency, not automatic coverage. |
| 27 | Journal/audit inconsistency | Same-db output ledger head/revision/digest/tuple/counter validation. Historical binding snapshot is immutable; legitimate later source revisions mark stale-for-delivery, not audit corruption. No unsupported event types appended to attempt journal. |
| 28 | Historical evidence overwritten | Only two new reports; baseline/source/Git/history/Hermes hashes compared, new audit unique; no old diagnostics reconstructed. |
| 29 | Prior gates promoted | PI09B five PARTIAL, PI09A-18/PI02-19/PI06-08/PI07-08, PI08 blockers/four suites/R8-20 retained; design PASS not implementation PASS. |
| 30 | Premature M02 completion | MASTER_DESIGN explicitly not final PRD, roadmap current draft and PI01 matrix incomplete. Outbox supports listed output/state/recovery clauses; no new official criterion/sign-off invented. |

## Source and Evidence Integrity

Actual PI09B baseline: **532 AI Office files / 214 default Git porcelain rows**, sealed manifest SHA-256 **E52080822365125145ECDB28FFD2E9DC7AECD903462E6B00530771408B787A97** verified before design. Final inventory is independently compared with that baseline: **534 files / 216 rows, two new reports, zero existing files modified or deleted**, all old hashes and Git rows retained. Counts exclude node_modules/.git and record reparse entries without following them; Git uses default collapsed untracked-directory rows.

Protected-history recheck PASS (2026-11-10T06:30:13.3956602Z): **26,134 files / 306 roots**. **647 Hermes3D tracked files and tracked path set** unchanged. Older unavailable 2,209 files / 17 roots remain NOT_VERIFIED; no diagnostics reconstructed or archives created.

Unique design evidence: `C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-pi10-1794291516944-design`. baseline.json, source-register.json plus source-register-followup.json (39 actual sources/reports with exact line anchors and hashes), scope.json, protected-integrity.json, design-review.json, final-snapshot.json, integrity-result.json and self-excluded manifest.json document custody and source comparison. The completion response gives the new manifest SHA-256/read-only post-seal result, avoiding a self-referential hash in sealed documents. Only these two new review documents were added to the repository. No source/schema/config/previous report/test/dependency modification; no DB connection/DDL/migration, credential access, application/listener/worker/provider/tool/containment/Job action or Git commit/push/reset/merge/deployment.

**PI10 application tests 0; fresh regression tests 0; typecheck NOT_RUN; SQL NOT_EXECUTED.** Historical PI09B 1,088 PASS (72+1,016) and two typecheck exit0 records remain historical, not freshly executed. Documentation/static hash checks are not application tests or SQLite syntax/transaction/runtime proof.

## Single Next Scoped Implementation

**PI11A — Repository-Owned Held Output Metadata & Atomic Outbox Foundation.** Implement only the six-table fresh disposable schema, original-repository private fixture-only HELD metadata transaction/read/control/history methods, explicit COMMIT-uncertainty handling and scoped offline tests specified here. No production acceptance, publisher/dispatcher, positive authority, real payload store, live DB/migration, new host writer façade or endpoint. Production guards and HOST_SQLITE read-only behavior remain unchanged. All receipts productionAccepted:false, publicationAuthority:false, executionAuthority:false; no delivery states or nonnull leases. This is the single earliest feasible code milestone, NOT_STARTED in PI10. Full authorized acceptance/delivery is a later restricted dependency, not a second recommendation or an implied approval.

`M02_NOT_COMPLETE`; `OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE`. No final M02 checkpoint or owner approval inferred.
