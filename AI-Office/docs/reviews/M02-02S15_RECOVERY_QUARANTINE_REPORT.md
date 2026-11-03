# M02-02S15 — Recovery Quarantine Report

## 1. Entry and decision

**PASS — conservative synthetic recovery foundation only.** S13 gate83/83 and S14 gate106/106, typechecks, mandatory mappings, source/fixture audits and stage reports persisted before entry. S15 first run259/259 (132 durable +127 existing contracts); all24 mandatory R cases pass; initial gate repair cycles0/2; final audit reopened S15 and used1/2 cycle. Final cross-stage audit still required after this stage decision.

## 2. Actual changes

- src/server/attempt-control/contracts.ts
- src/server/attempt-control/journal.ts
- src/server/attempt-control/recovery.ts
- src/server/attempt-control/repository.ts
- src/server/attempt-control/schema.ts
- tests/integration/durable-attempt-foundation/child-client.mjs
- tests/integration/durable-attempt-foundation/recovery-helpers.ts
- tests/integration/durable-attempt-foundation/recovery.test.ts

Added recovery.ts/recovery-helpers.ts/recovery.test.ts. Extended dormant contracts/schema/repository/journal and fixed client allowlist/op. No application integration. Schema user_version5/profile s15-isolated-authority-v1, same four STRICT tables with bounded nullable recoveryPayload JSON and RECOVERY_CLASSIFIED events. Canonical catalog/version/markers checked; only fresh owned fixtures created. Earlier S12/S13/S14 DBs are never migrated.

## 3. Recovery entry and authority

openRecoveryForTest returns frozen WeakMap-bound RecoveryAuthority for project/incarnation and synthetic inspector host/domain/decision. dispatch is always CLOSED. recoveryInventory validates journal/projection and enumerates all attempts including nonterminal, pending cancellation and held terminal rows. No backend startup import or service is activated.

Inspector capability is a trusted test-host grant, not real Owner/session authentication. Shape-forged capability rejected. Reconciliation checks exact immutable identity, expected generation/version/phase and bound inspector clock/decision in BEGIN IMMEDIATE. Lost prior owner nonce is not fabricated: this separate quarantine-only path uses the actual persisted owner hash in its SQL predicate after checked inspector authority. It preserves owner/host/generation and never acquires execution rights.

## 4. Classification and persistence

Pure classifyRecovery combines lease status, original/inspector lifetime, cancellation facts and strict synthetic process evidence. Unknown/missing receipts, mismatched PID creation/executable/nonce/host/generation and uncorrelated full-looking exits never establish prior scope safety. Parent/child nonce/host/generation continuity is checked. Only an exit correlated to persisted cancellation exit is MATCHED_SYNTHETIC_EXIT; even that nonterminal remains quarantined pending explicit reconciliation.

Nonterminal classification writes UNCERTAIN (or preserves existing RECONCILIATION_REQUIRED), recovery record, version+1 and event atomically. It never changes generation/owner/lease or clears conflictHeld/cancellation. Journal replays classification generation/version/barrier alongside unchanged lease/cancel/terminal data. Terminal attempts are read-only TERMINAL_RETAINED classifications: no projection/event/version rewrite or persisted terminal metadata update. Original SQL terminal immutability remains.

Same reconciliation ID+digest returns stored result without event/version mutation; changed or superseded stale classifications conflict. Repeated new authorized inspections can add next-version quarantine evidence, not lift it. No barrier-clear/dispatch/retry API was added. Owner mutations cannot use a quarantined row to gain authority.

## 5. Retry eligibility

Three classifications: RETRY_FORBIDDEN (completed), RETRY_REQUIRES_RECONCILIATION (unknown/nonterminal/effects unresolved), RETRY_CANDIDATE_PENDING_APPROVAL (known prelaunch terminal or fully correlated terminal synthetic evidence). Every result has retryAuthorized=false and dispatch=CLOSED. Candidate is informational, never a grant; conflictHeld remains1. No replacement attempt, automatic retry, launch or new generation is created.

## 6. Restart simulation and negative cases

Tests commit synthetic state, close handles, create new host/domain and reopen independent checked connections or fixed inspectors. They do not kill a backend, inspect arbitrary Windows PIDs, use Job Objects or force process-tree cleanup. PID/creation/executable/nonce/host/generation/source values are synthetic. R02/R03 distinguish expired same-domain sample from apparently valid previous-host lease; old monotonic domains are never compared as continuity.

R01 terminal retained;R04–06 unknown/identity mismatch quarantine;R07–09 pending cancel/ack/exit facts preserved without auto-terminalization;R10/R14 deliberately corrupted projection/journal reject on fresh open;R15 incompatible schema rejects;R16 real BUSY5 no mutation;R17 three controlled transaction-fault placements roll back and later valid command succeeds;R18 idempotency/stale classification conflict;R19 two inspectors race one version;R20–24 no unsafe retry/clock/project/effects/dispatch. Extra tests forged capability/malformed evidence and pending-approval prelaunch candidate remain closed.

## 7. Actual tests and evidence

First full stage run **259 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,12 files;8.21s. Durable suites:60 S12 +23 lease +23 cancellation +26 recovery =132; unchanged existing contracts127. Typecheck PASS. Mandatory R01–R24 each matches one actual passing assertion; no unexecuted future-stage result claimed. Evidence C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s15-O9ZIZ9\s15-first.json and gate.json; L18/C16/R19 process evidence and client exits retained. Overall runner90s, clients10s, scenarios15s, requests4s.

## 8. Process/fixture configuration

At this gate:128 synthetic DBs, all128 exclusively reopened/closed after test handles;16 client processes all exit0;forced cleanup0;sidecars0. All under separate S15 root C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s15-O9ZIZ9. Node24.21.0/SQLite3.53.4, DELETE/EXTRA3/FK1/busy100ms/trusted_schema0/read_uncommitted0 verified on checked connections. Earlier stage roots preserved. Additional final audit fixtures will be inventoried separately from this gate accounting.

## 9. Source/data integrity

133 baseline protected AI files unchanged; installed Codex50/50, Hermes tracked647/647,373 historical regular files/11 roots and original S12 fixture264/264 unchanged. Package/locks/startup/registry/active state adapter/schema/historical reviews unmodified. No real project DB opened, no provider/credential/inference/network test/billing/MXC/app-server/real worker, no Windows security/global setting/install/WSL/Git initialization. Reference browsing limited to specified official technical documents.

## 10. Limits and final-audit eligibility

Controlled transaction rollback/reopen is not real host crash recovery; unknown OS descendants remain unverified; database fencing cannot stop physical writes. Full production storage migration, authenticated recovery grants/clock sampling, real process supervision, closure/effects verification, retry grant consumption and runtime/provider/account/billing integration remain blocked. Gate PASS permits only the required cross-stage audit and synthetic chains. S16 and actual coding worker remain NOT STARTED/BLOCKED.

## 11. Final audit repair and re-verification

Final source audit found recovery event writerHostInstanceId incorrectly inherited the retained execution owner host, while payload inspectorHostInstanceId correctly identified the new writer. State/version/generation/owner CAS and projection history were consistent; this was writer provenance metadata, not a stale-owner or wrong-project commit. S15 gate was reopened as REPAIRABLE_FAILURE, never auto-advanced beyond final audit.

A new dedicated provenance assertion plus strengthened P02 reproduced **27 PASS /2 FAIL /0 SKIP /0 TIMEOUT** in29 cases (provenance-reproducer.json). Fixed appendEvent to use the recovery inspector host only for RECOVERY_CLASSIFIED, and strengthened verifyHistory to validate that header against the recovery record. Other event writers still match execution owner. No ownership/lease/generation checks weakened.

One repair cycle used. Full impacted S12–S15 +chains +existing contracts reverified **262 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,13 files;typecheck PASS; evidence pipeline-repair1-final.json. Recovery suite now27 cases including provenance; final durable135 +existing127. Earlier259/261 PASS reporters and failing reproducer, pre-repair documents/gate and all pre-fix DBs retained. Old incorrect writer records are not silently repaired; current validator rejects such bad provenance. No real DB touched. Final S15 gate PASS restored after integrity/cleanup audit; final S15 root420 DBs closed and50/50 clients exit0,forced0,sidecars0. Full-run repair counts include reproduced/new regression fixtures, not only the original128 DBs/16 clients.

