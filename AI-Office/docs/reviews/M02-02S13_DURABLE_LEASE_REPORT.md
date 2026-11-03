# M02-02S13 — Durable Lease Report

## 1. Decision and stage entry

**PASS — synthetic test-owned persistence only.** S12 preflight rerun60/60 and typecheck passed before changes. Current source matched measured prior145-file inventory; AI-Office has no Git repository. Existing Hermes3D package-lock modification preserved. S11/S12 reports, actual contracts/state machine/schema/repository/journal and required technical references reviewed. No production wiring or new dependency needed.

## 2. Scope and actual changes

- src/server/attempt-control/contracts.ts
- src/server/attempt-control/journal.ts
- src/server/attempt-control/lease.ts
- src/server/attempt-control/repository.ts
- src/server/attempt-control/schema.ts
- src/server/attempt-control/test-storage.ts
- tests/integration/durable-attempt-foundation/child-client.mjs
- tests/integration/durable-attempt-foundation/client-helper.ts
- tests/integration/durable-attempt-foundation/concurrency.test.ts
- tests/integration/durable-attempt-foundation/lease-helpers.ts
- tests/integration/durable-attempt-foundation/lease.test.ts

Only attempt-control source and durable-attempt tests changed. Existing fixed process launch code moved into client-helper.ts for reuse; no worker launcher added. Native in-process client hook allowlist extended to lease.ts. No frontend, startup, registry, active Project State/schema/adapter, package/lock or historical reviews edited.

## 3. Schema and compatibility

Fresh fixtures use user_version3, profile s13-isolated-authority-v1, four existing STRICT tables plus nullable bounded leasePayload JSON in attempt projection. Events add LEASE_RENEWED and LEASE_QUARANTINED. Full catalog/profile checks remain. Old S12 DBs are not migrated/reopened; source contract defaults leasePayload=null preserve legacy unleased synthetic tests on newly created fixtures. This is not permission to use unleased records in production.

## 4. APIs and protocols

IssueSchema.leaseClock explicitly creates lease atomically with initial projection/epoch/event. readLease/classifyLease are pure. renewLease validates current owner host/id/nonce/generation/version/phase, expected sequence and injected clock in BEGIN IMMEDIATE, advances one sequence/version/deadline and appends event; COMMIT precedes return. Same heartbeat ID+digest returns prior result without sequence advance; changed duplicate/stale command conflicts. Generic leased transitions/terminal commits require valid clock too. Existing leased attempt cannot use legacy test recovery fence.

recordLeaseConcern explicitly records EXPIRED/CLOCK_UNTRUSTED/PREVIOUS_HOST as UNCERTAIN plus quarantined lease/event, retaining owner/generation/conflict hold. Classification alone does not write, transfer, infer exit or dispatch. No daemon/timer/service or automatic renewal/takeover.

## 5. Clock policy

Defaults duration20s/heartbeat interval5s are initial test/design parameters. Clock samples bind host lifetime and clock domain; previous-host samples are not compared as monotonic continuity. Negative wall/monotonic delta, wall-vs-monotonic divergence>1000ms, or unexpired elapsed gap>15s fail closed. Both comparable deadlines use strict expiry at equality. Samples are deterministic trusted synthetic inputs, not proof of production OS sleep/clock behavior. No cross-restart monotonic assumption.

## 6. Transactions, journal and errors

Bound values and full identity/version/generation/phase/owner conditional UPDATE remain. Exactly1 affected row required. Lease snapshot initialization/renewal/sequence/hash/deadline and quarantine evolution replay-validated by journal alongside real projection. Same transaction includes projection+event; fixed fault stages before/after projection/event rollback. Actual SQLITE_BUSY primary/extended5 is retained; no automatic body retry, no external action. Capacity/power-loss/IOERR/crash correctness are not claimed.

## 7. Executed tests and evidence

First full relevant run **83 PASS /0 FAIL /0 SKIP /0 TIMEOUT**,5 files: S12 tests60 +lease23 (L01–L22 plus six-placement fault test). Evidence s13-first.json in C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s13-LaSdyf. Typecheck PASS. Repair cycles0/2. No tests removed, skipped or weakened. L22 includes rejection of missing-clock legacy mutation; import-purity test loads the new lease module and checks no timer/DB/filesystem/process activation.

Independent connections reject competing expected version. Two fixed Node processes L18 produce one renewal winner and one CONFLICT, final version2/sequence1/two events. L19 real lock reports BUSY5 and no event; later controlled afterEvent fault rolls back and next valid renewal succeeds. Six fixed renewal/quarantine fault placements checked on separate reopen.

## 8. Configuration and cleanup

Node24.21.0/SQLite3.53.4; per-connection DELETE/EXTRA(3)/FK1/busy100ms/trusted_schema0/read_uncommitted0 verified by rerun foundation/client evidence. Stage root C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s13-LaSdyf. Actual66 DBs all closed and pass Windows exclusive FileShare.None open;12 clients all exit0;forced cleanup0;sidecars0. Client bounds10s/request4s/scenario15s; overall Vitest parent timeout90s. Root/markers/canonical inode/no-reparse checks retained. No old fixture overwrites.

## 9. Integrity and security audit

133 protected baseline AI files outside allowed source/test scope unchanged, installed Codex50/50, Hermes tracked647/647, historical373 files/11 roots and original S12 root264/264 unchanged. Source/command audit: no worker/MXC/app-server/auth/inference/provider/paid fallback, production DB access, security settings change, install, OS process identity experiment, global config or active integration. Only owned SQLite clients ran. Reference browsing limited to task-specified official docs; no application/test network calls.

## 10. Limitations and advancement

Lease persistence/CAS is tested, not live supervision, physical fencing, process termination, crash recovery, credential custody or billing enforcement. Injected clock is a host-test trust input; no real heartbeat daemon or automatic actor exists. Stage gate checks all22 mandatory assertions plus S12 regressions, typecheck, integrity, cleanup and scope. All PASS; S14 entry authorized by original pipeline instruction. Gate/report written before S14 source work. No redundant Owner approval requested.
