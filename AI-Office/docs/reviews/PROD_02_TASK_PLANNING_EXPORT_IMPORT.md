# PROD-02 — Validated Local Task Planning Export/Import

Client date: 2026-11-14 · Asia/Jakarta

## A. Executive Decision

**PROD02_EXPORT_IMPORT_IMPLEMENTED_VERIFIED**, bounded to the implemented planning model, transfer actions/controller, React server rendering, scoped typechecks and production build. **299 PASS, 0 FAIL, 0 SKIP** in the final accepted test runs. Browser interaction, actual file saving/selection and visual layout remain **NOT_VERIFIED** because the browser access host is unavailable. This decision does not certify native runtime containment or deployment readiness.

Users can export the selected local board, reload the frontend, explicitly select a temporary context, preview a saved JSON plan and confirm replacement. Import cannot create an attached workspace, authorize execution or merge records ambiguously.

Persistent evidence: `/Users/rajenaria/Documents/AI-Office-Audits/PROD-02-2026-11-14-01` (abbreviated **A** below). Historical reports and evidence are preserved.

## B. Git Baseline

Canonical Git root: `/Users/rajenaria/Documents/Projects/AI-Projects`; application root: its `AI-Office` directory. Initial and final HEAD: `30db668ea3196e1b337cf41ef31de5c114e2cdfc`, branch `main`.

CP02/PROD-01 changes were already uncommitted: tracked `App.tsx`/`styles.css` modifications and seven untracked files, including the prior reports, planning model/panel/tests and containment test. This condition was reported and retained. No reset, cleanup, commit or push occurred.

Compared with actual working bytes captured at PROD-02 start, **3,797 of 3,798 tracked files remain identical**. The sole authorized tracked extension is `styles.css`. Of seven pre-existing untracked files, only `planning/model.ts` and `TaskPlanningPanel.tsx` were extended; the other five remain identical. `App.tsx` remains byte-identical to the PROD-02 starting version. Security guards, server/runtime sources, dependency manifests and locks remain unchanged.

The original PROD-01 manifest SHA-256 remains `ba139dafdfb54e257f7d03b4f1a9e16ff672e8bf993d1a2b737a90aca45bf762`; all **205** files listed in it remain identical. The canonical PROD-01 report remains `33dac0e9fe0dd818082c2c8462167cad5e0092a47c5bfb3a12264beb48a789b7`. Historical source copies are retained even where current planning source was legitimately extended. All **2,755** protected original isolated artifacts checked in `isolated-before.json` remain identical. See `baseline.json` and `static-security-and-preservation.json`.

## C. Existing PROD-01 Integration

Read the PROD-01 report, existing planning source and applicable contract/specification material before implementation. Reuse the existing `PlanningScopeSchema`, `TaskPlanSchema`, role list, immutable boards, version checks, Draft/Planned transitions and `attachedPlanningScope` checks. No parallel task backend, second task board or disconnected page was introduced.

`restorePlanningBoard` validates scope, task schemas, task/project agreement, unique IDs and the 100-task ceiling. It reconstructs an immutable local board with empty session change history. `TaskPlanSchema` now explicitly requires a proposed role for PLANNED, matching the existing state transition. The existing `TaskPlanningPanel` mounts `PlanTransferPanel` under the active scope key and replaces only that board after successful confirmation. Scope changes unmount the transfer session. Existing workspace freshness and binding requirements still determine whether an attached scope is available.

## D. Export Schema

The strict root has exactly `format`, `schemaVersion`, `scope`, `tasks`. Version 1 uses `format: "ai-office.task-plans"` and numeric `schemaVersion: 1`. The authoritative executable schema is `PlanningExportSchema` plus `restorePlanningBoard`; the latter supplies cross-record checks.

| Field | Version 1 rule |
| --- | --- |
| scope | TEMPORARY: kind/projectId/label; ATTACHED additionally requires binding containing bindingId/projectId/generation |
| projectId | Existing UUID schema; attached binding project must agree |
| binding | Existing strict workspace binding reference; nonnegative integer generation |
| label/title | Existing nonblank, unpadded short text, 1–200 characters |
| tasks | 1–100 actual task plans, unique taskId; every task project agrees with source scope |
| task fields | projectId, taskId, title, version, updatedAt, description, proposedAgentRole, state, source |
| taskId | Existing portable reference syntax, 1–128 characters |
| version/updatedAt | Positive integer / explicit UTC timestamp with millisecond precision, using existing contracts |
| description | String, at most 2,000 characters |
| proposedAgentRole | null or one of agent:pm/frontend/backend/design/database/research/qa/devops |
| state/source | DRAFT or PLANNED; PLANNED requires role; source exactly client_planning |
| size | Serialized UTF-8 at most 1 MiB |

Serialization validates current records, preserves order, uses two-space JSON indentation and a trailing newline. No dynamic export timestamp is added, so the same board yields the same bytes. Fixed portable filename: `ai-office-task-plans-v1.json`. Empty boards produce an actionable error before download. Unsupported versions are rejected; no implicit migration exists.

Credentials, security grants, process metadata, runtime authority and session history are absent. Strict extra-field rejection applies at root, scope, binding and task levels, including authority fields set to false. Task identity, title, notes, proposed role, status, version and timestamp are preserved. Temporary project-reference reassociation is explicitly described in F. Export is planning data, not proof of project registration or completed work.

## E. Import Validation

Only a user-selected local file is read. Filename must be at most 255 characters, contain no path separator and end in `.json` (case-insensitive). MIME may be empty, application/json or text/json, including an optional charset suffix. File size must be a positive safe integer at most 1 MiB **before** `text()` is called; actual decoded UTF-8 bytes are bounded again before JSON parsing.

Validation rejects invalid JSON, unsupported/non-numeric schema versions, missing/extra fields, contradictory scopes, empty/over-limit task arrays, duplicate task IDs, foreign project references, unknown roles, invalid states, PLANNED without role, malformed IDs/versions/timestamps and unexpected execution/authority metadata. Standard JSON.parse object-key semantics apply; duplicate task identities are separately rejected. No eval, script execution or HTML interpretation occurs.

Parsing/preview produce no parent-board mutation. Only one validated immutable replacement can be applied. All failed validation paths leave the current board unchanged. File metadata is a format hint, never an identity or authorization assertion.

## F. Scope Isolation

Exports receive only the selected board, not the panel's map of other boards. TEMPORARY and ATTACHED kinds cannot cross-import. For attached plans the current project UUID, binding ID and binding generation must match exactly. Existing current workspace/binding consistency checks remain in force; imported claims never establish that current context. Import does not register a workspace or write canonical task/run/security/audit stores.

For temporary plans, the user first selects or creates the destination temporary context. The source tasks must agree with the file's source scope. Preview explicitly warns when project references will be reassociated with the selected temporary UUID. Task IDs, versions, title/notes, role, state and timestamps survive. Destination scope/label remain current; files never create a scope automatically. Same-scope round trips preserve task records exactly. Reassociation supports reload without impersonating an attached identity.

## G. Confirmation/Replace Semantics

Preview shows schema version, incoming count, source kind/label/UUID, selected destination, existing task count, warnings and replacement effect. A clearly labeled checkbox defaults to false; Confirm is disabled until checked. Application also checks the explicit replacement token, independently of disabled-button rendering. No automatic overwrite or merge is supported.

A private WeakMap links the actual preview object to its validated replacement, target scope key and original board-content fingerprint. Apply rechecks current scope and content; edited boards, changed scopes, copied/serialized previews, cancelled previews and already-consumed previews are rejected. The fingerprint is local equality, not an authenticated digest or runtime authority. Replacement discards existing tasks and restarts local session history empty, as preview states.

Cancel invalidates preview and pending-read generation. Superseded reads, scope changes, unmount/re-activation and late file results cannot apply an obsolete import. Cancelling ignores late results; it does not claim to abort operating-system file reading. Failed apply never invokes the parent replacement callback.

## H. UI Integration

The real planning panel now includes **Export plan** and **Import plan**, an accessible local-file picker, preview, confirmation and Cancel controls. Export calls the same `exportPlanFile` action exercised by tests, validates first, creates a JSON Blob and requests download through an anchor with a fixed filename. The anchor is removed and its object URL is released. Browser API work occurs only inside the user action, not during module import.

Import reads through `PlanTransferSession`, which the React component subscribes to directly. The current board ref prevents stale render closures; the parent scope key disposes the session when changing contexts. Input value resets so a file can be selected again. Existing wrapping action styles are reused; added checkbox/focusable hidden-input styles support the workflow. Task text uses existing React text rendering. Narrow-screen behavior still needs the visual check in P.

## I. Error Handling

Fixed safe messages cover empty export, wrong file type/size, invalid JSON/document, unsupported version, mismatched scope, missing confirmation, stale preview, read failure and serialization/download failure. Raw JSON, Zod diagnostics and private exception text are not displayed. Export feedback says **download requested**, because application code cannot establish that the browser saved a file. Import feedback distinguishes reading, validated preview, confirmation, cancellation and successful replacement. No local history is labeled durable audit evidence.

## J. Domain Tests

The new transfer suite has **54 passing tests**. It covers deterministic serialization; selected-scope export; Draft/Planned reconstruction; preserved fields; empty boards; version/type/structure failures; UTF-8 limits; record/count/role/state/version/time constraints; duplicate IDs; authority/credential/process/history fields; temporary reassociation; exact attached project/binding/generation checks; atomic rejection; replacement confirmation; stale/cancelled/copied/consumed previews; blocked execution state; file metadata checks before reading; fixed errors; cancellation/disposal/supersession races; confirmation reset; and the actual export action rejecting invalid/empty boards before any download effect.

The prior 20 planning tests were rerun against the final model. No fake positive runtime authority was introduced.

## K. Frontend Tests

Tests exercise the actual transfer session used by React, exported UI download action through an inert test port, real JSON Blob/filename/release behavior, and server rendering of the real transfer and preview components. They check visible controls, initially disabled confirmation, replacement wording and escaped task text. Existing controller, mapper, skill panel and skill projection regressions were rerun. These are genuine model/action/controller/SSR checks; they do not simulate browser clicks or prove picker/download integration in a browser.

## L. Security Regression

Before execution, the imports and side effects were reviewed (`test-import-review.json`). The closure uses existing contracts/model/API helpers, React/server rendering, Zod and Vitest; browser-only functions are inert at import and download tests inject a no-effect port. No new network, child process, native containment, database or provider dependency exists in the transfer code.

A fresh isolated source snapshot was established at `/Users/rajenaria/Documents/AI-Office-Mac-Dev/MAC-01-C1CBE95A-F050-463F-9F32-AA7B04E83E9B/prod02-project`. Its 151 source/test files match canonical final source byte-for-byte. Every final command's preflight source hashes also match this snapshot. The reviewed PROD-01/MAC-02 harness was copied into `prod02-offline-harness`; only the reviewed transfer test was added to the existing 12-file allowlist, with scoped paths/configuration updated. Original harnesses remain unchanged.

The MAC-02 guard bytes remain `76e7c425cd00f2fa72a68bb10fee6059f73ea3dd2a4d507d2fecafe4729ae6c9`. Guard verification passed; all 13 final test invocations report 100 checks in the main context and 100 in the single permitted Vitest framework thread, with no unexpected blocked effects. Framework threads are test infrastructure, not application agent workers. Arbitrary threads, child processes, network/DNS/listeners, SQLite and watchers remain denied; native loaders are restricted to reviewed dependencies. Source hashes are checked before/after commands. Existing same-realm and native-addon limitations remain: offline guards/tests do not establish native containment security.

No application worker/provider launch, identity provisioning, production database write, listener, native containment experiment, guard bypass, dependency installation or automatic Git action was performed.

## M. Actual Test Results

Final accepted runs only; earlier successful runs are retained but not double-counted:

| Run | Scope | PASS | FAIL | SKIP | Exit |
| --- | --- | ---: | ---: | ---: | ---: |
| 20 | New planning transfer | 54 | 0 | 0 | 0 |
| 21 | Existing planning | 20 | 0 | 0 | 0 |
| 22 | Workspace controller | 11 | 0 | 0 | 0 |
| 23 | Mapper | 5 | 0 | 0 | 0 |
| 24 | Skill panel | 6 | 0 | 0 | 0 |
| 25 | Skill projection | 25 | 0 | 0 | 0 |
| 26 | CP02 containment safety | 33 | 0 | 0 | 0 |
| 27 | CP01 runtime boundary | 55 | 0 | 0 | 0 |
| 28 | Policy | 12 | 0 | 0 | 0 |
| 29 | Project | 34 | 0 | 0 | 0 |
| 30 | Knowledge | 26 | 0 | 0 | 0 |
| 31 | Capabilities | 17 | 0 | 0 | 0 |
| 32 | Import | 1 | 0 | 0 | 0 |
| **Total** | **54 new + 245 fresh regressions** | **299** | **0** | **0** | **0** |

All accepted commands report `sourceIntegrityMatched: true`, with no timeout. The 44 other main test files are **NOT_RUN**, listed individually in `excluded-tests.json`; this includes browser E2E and broader runtime/database integrations. Asset3D tests and Windows-native suites were not run. Historical Windows results are not represented as freshly verified here.

`exact-commands.json` preserves executable argv, shell-quoted command, cwd, environment and exit code for every final test, compiler check and build. Each run directory preserves its original command-preflight/result, stdout/stderr, guard logs and test JSON. These exact records are the reproducibility reference; unrestricted package scripts were not executed. Initial run 03 web typecheck exited 1 for TS2532 on a known nonempty test fixture; the fixture access was corrected with a non-null assertion. Initial 53-test and intermediate runs are retained. Final counts above include the added export-action safety test and exclude all preliminary runs.

## N. Typecheck Results

Final core run 33 and web run 34 both exited **0**, without emission or incremental cache, using the existing native TypeScript compiler v7.0.2 and fresh snapshot configurations. Core covers the implemented contract/server/demo typing and selected contract tests; web covers web/contracts, web tests, types and Vite configuration, excluding E2E. Compilation does not execute server/runtime imports.

Exact argv are in each `command-preflight.json`. Both use the existing compiler at `project/node_modules/@typescript/typescript-darwin-arm64/lib/tsc` under the isolated MAC-01 directory, with `-p <fresh-snapshot>/tsconfig.prod02-core.json` or `tsconfig.prod02-web.json`, followed by `--noEmit --incremental false`. Initial diagnostic evidence remains available; both final source-integrity checks passed.

## O. Production Build

Final run 35 exited **0**: Vite 8.3.5 transformed **130 modules**, producing JS **356,616 bytes**, CSS **3,852 bytes** and HTML **471 bytes**. The build used the actual existing production React/local-boundary configuration through the audited offline build runner; configureServer was not called. Environment loading, public input and output/cache locations were constrained. No preview/backend listener started.

`run-35-prod02-build-final/build-receipt.json` records asset hashes. `standalone-preview.html` in the same directory contains the actual built application bundle and CSS, with artifact-only CSP `connect-src none` and no backend. It is available for manual inspection, not an observed browser result. Its restrictive CSP is an audit-artifact property, not a claim of changed application runtime security.

## P. Browser/Manual QA Status

**NOT_VERIFIED**. CUA inventory reported no browsers and `browser access host unavailable`. No browser page, click, upload, download, screenshot or layout outcome was observed. SSR/build results do not substitute for these checks. `browser-verification.json` records this limitation.

All following manual checks are **NOT_RUN**; use a safely opened frontend/build artifact without starting workers/providers:

1. Create/select a temporary context; create a titled plan with notes and a proposed role. Edit it and mark it Planned; note task ID, status, version and timestamp. Create another context/board to check isolation.
2. Select the first board and click Export plan. Verify download-request feedback and inspect the saved v1 JSON: only selected tasks, exact fields, no authority/history data, portable filename. Confirm an empty board gives an error without a download.
3. Reload the frontend. Verify memory is cleared. Explicitly create/select a new temporary destination context, including an existing draft to make replacement visible.
4. Click Import plan and select the saved file. Before applying, verify schema 1, count, source/destination labels and UUIDs, temporary reassociation warning, replacement count and no board mutation. Checkbox must be unchecked and Confirm disabled.
5. Check the replacement checkbox and confirm. Verify old draft removal and reconstructed task IDs, titles, notes, roles, states, versions and timestamps; destination context is retained, task project references are reassociated and local history restarts empty. No execution action becomes enabled.
6. Import malformed JSON and then an unsupported-version or extra-authority file. Verify specific feedback and byte-equivalent current board state. Check oversized/non-JSON files also leave it unchanged.
7. Cancel a preview; verify unchanged tasks. Reselect the same file and confirm it can preview again. If a slow read can be induced safely, cancel while reading; its eventual result must not apply or reopen preview.
8. Change the board after preview and then try to apply; require a fresh preview. Switch scope away and back while reading/previewing; no stale preview may apply.
9. From a temporary context, try an attached-kind file and verify rejection. If a safe existing attached context is available, test a different project UUID, binding ID and generation separately; all must reject without mutation. Do not provision an identity/backend merely for this check.
10. At a narrow viewport (approximately 375 CSS pixels), inspect picker/actions, long scope UUIDs, preview warnings, checkbox label, confirmation/Cancel buttons and visible focus. Check text wrapping and usability without clipped controls. Verify task titles/notes containing markup render as text.

## Q. Changed Files and Evidence

PROD-02 extends existing `src/web/planning/model.ts`, `src/web/components/TaskPlanningPanel.tsx` and `src/web/styles.css`. It adds `src/web/planning/transfer.ts`, `src/web/planning/download.ts`, `src/web/components/PlanTransferPanel.tsx`, `tests/web/planning-transfer.test.ts` and this report. All are under the canonical application root. Git still also displays pre-existing CP02/PROD-01 changes; those are not newly attributed to PROD-02.

Evidence A contains baseline/preservation inventories; pre-execution import review; fresh snapshot/harness records; initial diagnostics; all exact commands and run logs; final 299-test summary; excluded test list; final source hashes; documented schema/sample; browser/manual-QA limitation; final source diff; deliverable copies and a SHA-256 manifest/seal. Hashes in the manifest are integrity records, not signed authority or trusted timestamps. The manifest excludes itself and its checksum file to avoid recursive hashing. No historical directory was cleaned up.

## R. Remaining Product Gaps

Browser download/picker behavior, end-to-end reload workflow and responsive visual QA still require P. A browser may decline a requested download; the UI does not assert durable saving. File exports contain the user's plain planning text, not encrypted storage or authenticated provenance. No automatic persistence, merge, migration or canonical audit history is implemented. Reattached projects with a different binding/generation intentionally cannot reuse attached exports without a future explicit migration policy. User-supplied future timestamps can trigger the existing clock-regression edit guard; timestamps are validated format, not trusted time assertions.

The next useful product milestone is task-board search/filter by proposed role and Draft/Planned state, reusing the same model and scope isolation. Browser QA should be completed when a safe browser becomes available. Neither suggestion expands this milestone into production runtime execution.

## S. Final Acceptance Decision

**PROD02_EXPORT_IMPORT_IMPLEMENTED_VERIFIED** within the explicit offline model/action/controller/SSR, compiler and build evidence. Browser/manual QA remains **NOT_VERIFIED**; excluded suites remain **NOT_RUN**. No native runtime security verification is claimed.

`SECURITY_STOP_PRESERVED`

`M02_NOT_COMPLETE`

`executionAuthority: false`

`publicationAuthority: false`

`deliveryAuthority: false`
