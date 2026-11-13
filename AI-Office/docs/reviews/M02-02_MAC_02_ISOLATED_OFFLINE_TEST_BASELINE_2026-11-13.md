# M02-02-MAC-02 — Isolated Offline Test Baseline

2026-11-13 · Asia/Jakarta · first bounded macOS contract/import baseline.

## A. Executive Decision

**MAC02_OFFLINE_BASELINE_VERIFIED**, scoped to the five proposed files, run individually and sequentially: **90 PASS / 0 FAIL / 0 SKIP / 0 TODO / 0 test-case timeouts**, five successful commands, exit0 each. All five proposed files executed; none remains NOT_RUN. Another **48 discovered test files remain NOT_RUN**; their unexecuted case count was not determined.

This establishes a narrow Mac development baseline, not a full regression, production identity, SQLite integration, containment or worker-readiness result. **SECURITY_STOP_PRESERVED. M02_NOT_COMPLETE.** No application execution/publication/delivery authority is enabled.

## B. Checkpoint Preservation

Original root `/Users/rajenaria/Documents/Projects/AI-Projects`, branch `main`, HEAD and peeled `checkpoint-m02-pi11b-20261110` remain **b7f80cdc93927bd2db000c60101bf19ce13ee0a0**. Before/after checks cover all **3,789 tracked files**, both pre-existing uncommitted Mac reports, the isolated source copy and installed dependencies. No reset, branch switch, history modification, commit or push.

The [MAC-01 report](M02-02_MAC_01_MACOS_DEVELOPMENT_READINESS_2026-11-13.md) describes its earlier inspection time; it is preserved rather than rewritten after the owner's subsequent setup. The [PI11B report](M02-02_PI_11B_HELD_OUTPUT_REVALIDATION_IMPLEMENTATION.md) remains the historical bounded engineering checkpoint.

## C. Toolchain Verification

Owner-prepared isolated workspace:

`/Users/rajenaria/Documents/AI-Office-Mac-Dev/MAC-01-C1CBE95A-F050-463F-9F32-AA7B04E83E9B`

Fresh runtime query: **Node v24.22.3, darwin arm64, bundled SQLite 3.54.1**; querying the version did not open a database. Bundled npm manifest and retained owner version output agree on **11.19.1**. Native compiler query reports **TypeScript 7.0.2**. Installed metadata: **Vitest5.0.5, Vite8.3.5, Rolldown1.2.15, Zod4.6.7**. Tests use absolute isolated tool paths; global PATH still need not expose Node/npm. No installation occurred in MAC-02.

## D. Dependency Assessment

The isolated source-copy inventory matches the original tracked source. Manifests/lockfiles and the **2,449 installed regular dependency files** retain captured hashes. The original tracked Windows dependency tree is untouched. Application scripts were inspected but none of default test/dev/backend/build/e2e scripts was run.

Vitest/Vite require their own loader/transform modules and the Darwin Rolldown addon. The harness checks permitted addon file hashes at load; the accepted runs loaded Rolldown. Native fsevents stays blocked and is explicitly disabled at its optional module boundary. No esbuild postinstall/service, browser download, provider adapter or package installation is needed for these checks.

Node's native TypeScript wrapper can replace/spawn a compiler process; the scoped check invokes the native compiler directly. No application subprocess or historical process suite is launched.

## E. Test Import Audit

Each selected test was inspected independently, including its conservative relative-import closure and installed dependency entrypoints. Closure sizes: policy8, project9, knowledge9, capabilities9, import30 files; hashes/path lists are in `test-import-audit.json`. This scan includes erased type-only imports and is not a complete JavaScript call-graph proof.

The four contract files import schema/policy modules, synthetic plain fixtures and Zod. Module initialization creates validators/immutable constants; tests validate data, portable lexical references and false capability defaults. They do not bootstrap a server, access workspace data, open SQLite, start processes or contact providers.

`import.test.ts` dynamically imports DurableAttemptRepository with filesystem/SQLite/child-process mocks and spies on timer activation. Its transitive graph includes Windows path/storage **definitions**, not a Windows runtime launch. It invokes no workspace validation/storage constructor. The test asserts the listed APIs remain unused during import; the broader guard/native permissions provide additional restrictions. Passing it is not proof that every possible filesystem/native side effect is impossible.

## F. Harness Design

New harness directory: `<isolated-workspace>/mac02-offline-harness/`. It contains a native `.mjs` Vitest configuration, CommonJS preload guard, framework-thread probe, setup validation, audit reporter, captured settings and a Python command launcher. Final bytes are copied to persistent `harness-final/` evidence. No application code/test was edited.

Resolved configuration was captured and asserted: explicit configFile and `--configLoader native`; `envDir:false`; no application plugins or global setup; watch/UI/API listening/HMR/WebSocket disabled; middleware-only transforms; `cache:false`, `fsModuleCache:false`, dependency discovery disabled; Node environment; `maxWorkers:1`, `fileParallelism:false`, `isolate:true`; exact five-file allowlist. Vitest/Vite's internal transform plugins remain necessary and are recorded; application React/local-boundary plugins are absent. No disk cache directory appeared, and source/dependency inventories stayed unchanged.

**One file per invocation is required.** Installed Vitest5 begins terminating isolated threads without awaiting complete exit before scheduling a replacement. The harness refused that overlap. Separate commands retain per-file isolation and guarantee complete process/thread shutdown before the next command. The audit reporter rejects a multi-file selection.

Two test-only loader adaptations preserve narrow filesystem permissions: an empty `pnpm-workspace.yaml` at the isolated root terminates Vite's unconditional ancestor search; an empty public directory avoids Vite8 probing the empty path produced by publicDir:false. Neither changes the application's package manager/manifest, dependencies or source. No assets are served.

Vitest5 also unconditionally initializes internal API-token storage even with API disabled. The guard redirects **os.homedir()**, only inside each test process, to a newly owned private runtime directory. Existing user token/config stores stay outside native read permissions. No HOME variable/system setting is changed. New runner-only token state remains under `<isolated-workspace>/tmp/mac02-run-*/runner-home/`; its value is never logged/copied into the durable audit or used by a listening API. It is neither provider credentials nor application identity authority.

## G. Side-Effect Guard Validation

The guard is supplied through Node `--require` before the runner's relevant package/loader imports. Installed Vitest replaces inherited worker arguments, so the guarded Worker constructor prepends the same preload and native permission flags to the one permitted framework-thread entrypoint. Nested/arbitrary threads are denied. Worker setup independently confirms the guard and synchronized CommonJS/ESM builtin exports before test-module execution.

In each accepted runner and test-thread context, **100 patched entrypoints** were checked, plus an arbitrary-thread denial. Validation calls only already-verified replacement functions; no original effect is called to see whether it succeeds. It covers subprocess APIs/execve/kill/cluster, TCP/TLS/HTTP/HTTP2/UDP connections and listeners, callback/promise/resolver DNS, fetch/WebSocket, SQLite-open and filesystem watchers. Unexpected attempts throw and create a sticky failure record. Accepted runs contain **zero unexpected guard blocks**, one framework thread each and its exit event.

Node permissions additionally disallow child processes and filesystem reads/writes outside the specified isolated read roots and fresh command output/runtime write roots. An outside-scope synthetic file read was denied natively in both contexts; no real user file was used as a probe. Clean launch environments contain only reviewed test variables; macOS-injected `__CF_USER_TEXT_ENCODING` was identified by name and allowed as OS encoding metadata. No inherited provider/token environment or .env loading.

**Limits:** Node warns that allowing addons/framework threads weakens its permission model; those warnings are retained. Hash-matched native transform code is trusted, and JavaScript hooks/Node permissions do not contain malicious same-realm/native code or independently observe every OS/network action. This is bounded no-effect evidence for the reviewed imports/tests, not comprehensive process/network isolation or a substitute for Windows/macOS containment design.

## H. Test Allowlist

| File | Accepted invocation | Cases |
|---|---|---:|
| tests/contracts/policy.test.ts | run-12-policy | 12 |
| tests/contracts/project.test.ts | run-13-project | 34 |
| tests/contracts/knowledge.test.ts | run-14-knowledge | 26 |
| tests/contracts/capabilities.test.ts | run-15-capabilities | 17 |
| tests/integration/durable-attempt-foundation/import.test.ts | run-16-import | 1 |

All file contents match the checkpoint/captured copy. No name-pattern filtering, assertion weakening, test removal or added skip was used.

## I. Actual Test Results

Accepted baseline: **90 passed, 0 failed, 0 skipped, 0 todo, 0 case timeouts; five exit0 commands; no command timeout or unhandled error.** NOT_RUN: zero proposed files; 48 other discovered `.test.ts/.spec.ts` files, enumerated in `excluded-tests.json`. Unexecuted case counts remain unknown. Do not subtract90 from the historical1,295: the selected scopes differ and are not interchangeable.

Actual wrapper commands, sequential, using `H=<isolated-workspace>/mac02-offline-harness`:

```sh
python3 "$H/run-command.py" run-12-policy policy
python3 "$H/run-command.py" run-13-project project
python3 "$H/run-command.py" run-14-knowledge knowledge
python3 "$H/run-command.py" run-15-capabilities capabilities
python3 "$H/run-command.py" run-16-import import
```

Each `command-preflight.json` retains the exact absolute Node argv, cwd, clean environment and harness-input hashes. Node executes `vitest/vitest.mjs run --config <explicit-config> --configLoader native --no-cache --no-fs-module-cache --no-file-parallelism <one-approved-file>`, with explicit preload/native permission flags. The wrapper reports the actual child runner exit in command-result.json; its own Python exit is not the success criterion. No npm script is invoked.

Earlier attempts are preserved, not added to the accepted totals:

| Invocation | Actual disposition |
|---|---|
| 00–01 | Guard exit1 before application tests: unreviewed environment; diagnostic recorded only variable names and identified macOS encoding metadata |
| 02 | Guard probe exit0, main + framework thread,100 entrypoint checks each |
| 03 | Exit77 before test collection: fsevents native load denied; fixed by explicitly disabling optional watcher-module import while retaining direct addon denial |
| 04 | Updated guard probe exit0 |
| 05–06 | Startup exit1: native permissions rejected Vite ancestor workspace search, including after explicit server.fs.allow; discovery is unconditional in this version |
| 07 | Startup exit1: Vitest attempted user/fallback API-token storage; native permissions denied access before existing token contents could be read |
| 08 | Guard probe exit1: worker tried to create an already-created fresh runner-home directory; worker now validates the main process's owned directory |
| 09 | Final guard probe exit0 in both contexts |
| 10 | Startup exit1: Vite's disabled publicDir became an empty-path filesystem probe; replaced with an explicitly empty private directory |
| 11 | Exit1:34 project tests passed, four framework errors, four remaining files NOT_RUN; four teardown-timeout diagnostics, no outer command timeout. Strict thread guard rejected replacement-thread overlap |
| 12–16 | Final five single-file commands:90 unique PASS, all exit0, no skips/errors/timeouts |
| 17 | Scoped native TypeScript command exit0 |

The34 earlier project passes are not counted twice. Failed startup/guard invocations are infrastructure outcomes, not invented failed application test cases. Initial standalone full-source copies of every early recipe variant were not captured; their preflight hashes/errors remain, and final executed harness bytes are retained. No missing earlier recipe is reconstructed as an original.

## J. Scoped Typecheck Results

The owner reported an earlier successful scoped check. One fresh rerun was necessary to preserve exact reproducibility metadata for this baseline: **run-17-scoped-typecheck, exit0**, native compiler Version7.0.2, no output/timeouts.

```sh
<isolated-workspace>/project/node_modules/@typescript/typescript-darwin-arm64/lib/tsc \
  -p <isolated-workspace>/project/tsconfig.macos-offline.json --noEmit --incremental false
```

This displayed path abbreviation is explanatory; the recorded actual argv uses full resolved paths. Scope: src/contracts, src/server, src/demo and the four pure contract files. **import.test.ts, web/e2e and the restricted integration suites are not included by that explicit scoped config.** Compilation does not execute server code, verify a database, establish authentication or imply a full repository typecheck. Neither config nor source was changed to obtain exit0.

## K. macOS Compatibility Findings

The five existing files can run unmodified with the isolated native toolchain and this guarded per-file harness. Portable lexical path contracts work on Mac without changing Windows workspace authorization. Native TypeScript and Rolldown are usable in the inspected scope. Import-only repository coverage succeeds without calling Windows validators or opening storage.

The demonstrated adaptations belong to test infrastructure: guard propagation, optional watcher exclusion, bounded workspace discovery, private per-command runner state, an empty public directory and avoiding overlapping thread teardown. They do not port Windows application/security behavior. No lockfile/package/business-logic fix was needed.

## L. Windows-Only Tests

The four restricted foundation suites **concurrency.test.ts, lease.test.ts, cancellation.test.ts, recovery.test.ts remain NOT_RUN**. No process/runtime-security/MXC/Jobs/watchdog/crash/containment experiment was attempted. State/workspace HTTP/process suites, UI/e2e, real worker/provider/transport suites and all non-allowlisted files are excluded.

Full PI11A output-metadata H03 and PI11B output-revalidation H01 invoke Windows-only validateRoot/HostSQLiteProvider. They were not run, skipped or rewritten. PI08/09 host-storage/admission/publication suites are not promoted by these five checks. A new bounded SQLite subset would require fresh ownership fixtures and independent review; the current harness deliberately denies DatabaseSync.

## M. Security Boundary Verification

Before/after source hashes preserve Windows guards, security-stop/provenance/session logic, HELD-only schema10/output contracts and deny-only principal/admission/publication boundaries. ExecutionAuthority, publicationAuthority and deliveryAuthority remain false in application contracts. No database, real credential/provider session, output delivery or application worker was activated. Test-framework threads are not AI/application workers.

Preserved: **SECURITY_STOP_PRESERVED, M02_NOT_COMPLETE, OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE, PRODUCTION_HOST_AUTHORITY_UNAVAILABLE**. Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; historical archival PENDING_AUTHORIZATION; workers and output delivery BLOCKED. Historical R8-20 exception, Jc NOT_OBSERVABLE, PID24956 INCONCLUSIVE and external witness NOT_IMPLEMENTED remain unchanged.

## N. Evidence Directory and Checksums

New persistent evidence:

`/Users/rajenaria/Documents/AI-Office-Audits/M02-02-MAC-02-2026-11-13-01/`

Retained: before inventories, import/exclusion audit, installed tool metadata,18 uniquely named invocation directories, exact commands/exits/stdout/stderr, resolved config/actual file selections, all runner JSON outputs, per-context guard logs, accepted-baseline.json, final harness bytes and final integrity verification. No prior audit/log/manifest was overwritten. New private runner-only token files stay outside this audit and are not copied or logged.

`accepted-baseline.json` supplies each accepted JSON result SHA-256; per-run preflights hash the executed harness. `manifest.json` seals the new audit/report/harness inventory, excluding itself and its checksum file; **SHA256SUMS.txt contains its separately recorded SHA-256**. This avoids a self-referential report/manifest hash. Post-seal verification checks covered bytes. Local hashes are neither signatures nor independent OS/rollback witnesses; second-device backup remains unverified.

## O. Source Changes

Original repository: **one new report only**, this file. All tracked files and both earlier uncommitted Mac reports are preserved. Isolated project source/config/manifest/lock files: **137 regular files unchanged**; dependencies: **2,449 unchanged**, with no added/deleted regular files. New harness files, empty-public directory, isolated workspace-discovery marker and private per-command runtime state are outside Git. No dependency, test assertion or application security/business logic was modified.

## P. Remaining Blockers

This harness is approved only for the reviewed five-file offline scope; it cannot run the full historical suite under its SQLite/process denies. Additional repository/schema10 fixtures need a separately bounded design and allowlist. Windows host/storage/containment paths still require a supported verification host or an independently authorized Mac security design. No production identity source, trusted workspace membership/current-run authority, destination/classification authority, worker/provider/billing proof or official M02 sign-off has been established.

## Q. PI-11B Coverage Gaps

PI11B's **101 revalidation cases, PI11A's106 held-output cases and the historical1,295-test selection were NOT rerun**. Schema10 is a source fact here, not a fresh storage result. Historical PI11B26 PASS/2 PARTIAL remain historical: authoritative latest active run and independent live workspace membership remain unavailable. The repository import test supplies no revalidation, persistence, atomicity, production authentication or delivery-time evidence.

Missing Windows TEMP/raw manifests/backups are not repaired by fresh Mac test logs. Earlier historical failures and security uncertainty are retained.

## R. Recommended Next Engineering Step

Use this fixed, per-file harness as the source-development baseline. The next **production dependency** remains **Owner-Authorized Independent Identity Trust-Root Provisioning & Integration**: owner-approved operating model, independently provisioned authority/protocol/custody, workspace membership ownership, freshness/revocation and accepted integration scope. This milestone has not begun;90 tests and scoped compilation do not select or authorize an identity model.

If additional offline assurance is requested while that decision is pending, define a bounded repository/SQLite fixture test scope first; do not automatically broaden this allowlist or queue PI11C. Keep the mandatory Windows-only cases explicit and preserve denied authority.

## S. Final Status

**MAC02_OFFLINE_BASELINE_VERIFIED — 90 PASS, five files, scoped typecheck exit0.** Only the stated offline baseline is verified; no full1,295-test Mac regression or production runtime readiness is claimed. All earlier failed harness diagnostics remain available.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.**
