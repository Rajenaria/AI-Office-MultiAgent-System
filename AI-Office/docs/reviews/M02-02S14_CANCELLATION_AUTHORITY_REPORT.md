# M02-02S14 — Cancellation Authority Report

## 1. Entry and decision

**PASS — database/state authority in synthetic fixtures only.** Entry required recorded S13 PASS:83/83 tests, typecheck, owner/clock negatives, scope/hash and cleanup audits. Its two reports and gate.json existed before S14 source work. No intermediate Owner approval was requested or needed.

## 2. Source scope

- src/server/attempt-control/cancellation.ts
- src/server/attempt-control/contracts.ts
- src/server/attempt-control/journal.ts
- src/server/attempt-control/repository.ts
- src/server/attempt-control/schema.ts
- tests/integration/durable-attempt-foundation/cancel-helpers.ts
- tests/integration/durable-attempt-foundation/cancellation.test.ts
- tests/integration/durable-attempt-foundation/child-client.mjs
- tests/integration/durable-attempt-foundation/lease.test.ts

Added cancellation.ts, cancel-helpers.ts, cancellation.test.ts; extended dormant contracts/repository/journal/schema and fixed client. S13 L11 fixture now reaches terminal via valid APPROVAL_DENIED, retaining the same terminal-renewal rejection assertion; it does not bypass new cancellation evidence requirements. No test deleted/skipped, no existing core/backend/package/lock edited.

## 3. Schema and durable representation

Fresh test schema user_version4/profile s14-isolated-authority-v1. Four STRICT tables retained; bounded canonical cancellationPayload JSON embeds immutable intent plus separately staged ack/exit evidence in projection; append-only journal retains every revision. Unique request-ID expression index supplements request/event uniqueness. This preserves S11 per-project authority, one transaction and current-owner model without a global store. It is a bounded representation of the proposed cancellation entity, not production migration or seven-table completion. Old S12/S13 fixture DBs are untouched.

## 4. Authority context

authorizeHostForTest verifies persisted expected project/incarnation/task/attempt/generation/owner/host/nonce/version and valid lease before minting frozen WeakMap-backed HostAuthority. Each cancel/observation/terminal mutation repeats current tuple and capability binding in transaction. Shape-equivalent objects, wrong owner/nonce/host/generation/project are rejected. Capability is host-test-only; no HTTP auth endpoint, fake production login or real Owner approval system. No actual credential access.

## 5. APIs and transaction protocol

requestCancellation: BEGIN IMMEDIATE → checked current/history → verified capability/current owner → same-ID digest replay or conflict → expected version/lease → intent +version +CANCEL_INTENT event → verified projection/history → COMMIT. Stable semantic digest binds original expected identity/version/phase/owner and request/decision/reason; transport clock/event ID excluded. Identical prior intent returns replay without mutation, even if original version is stale; changed/different intent conflicts.

recordCancellationAck and recordCancellationExit use strict generation/host/request/invocation-bound synthetic receipts, CAS and lease, distinct events/versions. Duplicate identical observation replays without new event; conflicting receipt is rejected. completeScope/effects classification and scope digest are separate from acknowledgment. Process receipt fields are synthetic PID/creationTicks/executable identity/nonce/host/generation/source; no live process is queried.

## 6. State and terminal rules

Running/launching intent enters existing CANCELLATION_REQUESTED. Prelaunch CREATED/PENDING/GRANTED intent retains phase but blocks launch; subsequent authorized INTERRUPTED uses no-launch proof and requires no fictional runtime ack. Intent alone never proves exit. Ack alone cannot terminalize; exit without ack remains conservatively nonterminal; full-scope exit with unknown effects remains blocked.

Terminal cancellation requires matching HostAuthority, valid current lease/version/owner, cancellation reason and matching synthetic closure evidence. Generic leased transition cannot bypass intent creation or continue after intent. Same terminal receipt is read-only idempotency; changed terminal conflicts. Success-first preserves success; intent-first rejects stale/current-version success; late success after INTERRUPTED is rejected. No OS cancellation/delivery/interrupt command exists.

## 7. Executed tests

First full relevant run **106 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,6 files:60 S12 +23 S13 +23 S14. Mandatory C01–C22 each has a passing assertion; extra case covers effect-unknown exit and mismatched invocation. Typecheck PASS. Repair cycles0/2. Evidence C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s14-ITbdkM\s14-first.json.

C15 independent connections yield one intent plus identical replay/different-ID conflict. C16 two fixed host Node clients race cancellation vs success: exactly one committed version6/event6 outcome; loser CONFLICT. Both sequential orders covered independently in C07/C08; PID scheduler winner is not presumed. C17 actual BUSY5 leaves no intent, later explicit same-command call succeeds.

## 8. Fault and consistency evidence

C18 tests four event types (intent/ack/exit/terminal) at three projection/event fault points =12 controlled placements. Each closes/reopens a separate checked connection and proves prior projection/journal unchanged. C19 checks exact cancellation event suffix and terminal version9. C20 close/reopen preserves intent and replay. Prior S12 constraint/rollback/reopen and S13 six fault placements remain passing. No power-loss/host crash simulated.

## 9. Configuration, process and fixtures

Node24.21.0 /SQLite3.53.4; per-connection DELETE/EXTRA3/FK1/busy100ms/trusted_schema0/read_uncommitted0. Separate S14 root C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s14-ITbdkM. Actual100 DBs closed/exclusive-open100/100,14 clients exit0/14,forced0,sidecars0. Finite runner90s/client10s/scenario15s/request4s; no detached client/grandchild/shell/worker. Per-client IPC and scenario C16 evidence retained.

## 10. Integrity/security audit

133 original protected AI files unchanged; installed50/50, Hermes647/647, historical373/373 across11 roots and original S12 fixture264/264 unchanged. Scope limited to authorized subsystem/tests/new reports. No production data open/migration, startup wiring, dependency install, Windows settings, provider login/inference/credits, MXC/app-server, actual cancellation or process-tree termination. Official docs were reference research; no application/test networking.

## 11. Limitations and next-stage eligibility

Capabilities/receipts are trusted synthetic host inputs, not production authentication or reliable OS scope observation. Ack+synthetic exit does not establish real Windows termination or exactly-once effects. No live delivery, background service, billing/custody or active integration. Unknown evidence never releases conflictHeld. All mandatory categories PASS; S15 auto-advance authorized under pipeline contract. S15 not started until this report, matrix and gate were persisted.
