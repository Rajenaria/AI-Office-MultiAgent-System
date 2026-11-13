# M02-02-MAC-01 — macOS Development Readiness

2026-11-13 · Asia/Jakarta · scoped environment inspection and source verification.

## A. Executive Decision

**MACOS_TOOLCHAIN_PARTIAL.** Homebrew and Xcode Command Line Tools are available. Node/npm are missing, retained native dependencies target Windows, and safe application verification cannot yet execute. No installation approval was supplied; the prompt's sections 2 and 5 explicitly require approval or exact commands for owner execution. The latter alternative is delivered below.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE.** Execution/publication/delivery authority remain false. This assessment establishes a concrete setup plan and test eligibility findings, not offline-test or production-runtime readiness.

## B. Checkpoint Verification

Git root `/Users/rajenaria/Documents/Projects/AI-Projects`; branch `main`; HEAD and peeled `checkpoint-m02-pi11b-20261110` both **b7f80cdc93927bd2db000c60101bf19ce13ee0a0**. Git fsck exit0; no deleted tracked files. All **3,789 tracked files** freshly match their Git blob hashes. The pre-existing uncommitted [macOS resume report](M02-02_MACOS_POST_MIGRATION_RESUME_2026-11-13.md) remains unchanged, SHA-256 `06d8d99050e8a09ba316f4192cf77737815c09366ba69a2c1d203beb848e1c4b`.

## C. macOS System Information

macOS **27.2.1**, build **26B131**; Darwin **arm64**, Apple **M1 Pro**; Git **2.50.1 (Apple Git-155)**. Xcode selected directory `/Library/Developer/CommandLineTools`; CLT package **26.6.0.0.1781586589**; Apple clang **21.0.0**, target arm64-apple-darwin27.2.0. No full Xcode installation is required by the proposed prebuilt-tool plan.

## D. Toolchain Requirements

`AI-Office/package.json` requires **Node ^24.0.0**; it does not pin an exact patch, npm or Bun. Proposed native patch: **Node24.22.3 Darwin arm64**, from the inspected [official Node24 listing](https://nodejs.org/dist/latest-v24.x/). Its tagged [bundled npm manifest](https://raw.githubusercontent.com/nodejs/node/v24.22.3/deps/npm/package.json) reports **11.19.1**; confirm actual archive contents after setup. This is a deliberate compatible patch proposal, not an invented repository pin.

Locked development tools: TypeScript **7.0.2**, Vite **8.3.5**, Vitest **5.0.5**, tsx **4.23.15**, Playwright **1.64.1**. Built-in `node:sqlite` supplies SQLite; no application npm SQLite driver/rebuild is needed. The actual bundled SQLite version remains unqueried until Node is available.

## E. Toolchain Availability

| Tool | Installed/observed |
|---|---|
| Node / npm / Bun | Not on PATH; absent from the usual inspected Homebrew, user-local and application-bundled candidate paths |
| Homebrew | `/opt/homebrew/bin/brew`, **7.0.13** |
| CLT / clang / Git / Python3 | Available; system inspection/static audit can run |
| Native Mac app dependencies | Not installed in the preserved checkout |

Only selected environment-variable **presence** was recorded. AI_OFFICE_DATA_ROOT, AI_OFFICE_FIXTURE_ROOT, AI_OFFICE_S12_ROOT, LOCALAPPDATA, NODE_OPTIONS and NODE_PATH are unset; TMPDIR and HOMEBREW_PREFIX are set. No values/credentials or provider stores were logged/read.

## F. Package Manager Assessment

No root package.json/npm workspace; AI-Office, Hermes3D and Asset_3D_Model are separate packages. AI-Office/Hermes npm lockfiles are version3, **123/767 entries**, with matching manifest root dependency/engine maps; neither declares packageManager/workspaces. All inspected resolved URLs use registry.npmjs.org.

The visualization **bun.lock remains 0 bytes**, with no npm lock or Bun version constraint. Do not regenerate it. Bun, Hermes setup and visualization dependencies are unnecessary for initial offline checks. Hermes lacks node_modules and has a separate Node/Next/gateway stack; no gateway/server is started.

## G. Native Dependency Compatibility

| Retained Windows payload | Locked Mac alternative | Role / action |
|---|---|---|
| TypeScript win32-x64 tsc.exe 7.0.2 | @typescript/typescript-darwin-arm64 7.0.2 | Native compiler; install matching optional package only in approved isolated environment |
| esbuild win32-x64 .exe 0.28.2 | @esbuild/darwin-arm64 0.28.2 | Development transformer; no application-source port implied |
| Rolldown win32-x64 .node 1.2.15 | @rolldown/binding-darwin-arm64 1.2.15 | Vite/Vitest tooling binding; exact locked variant |
| Lightning CSS win32-x64 .node 1.33.0 | lightningcss-darwin-arm64 1.33.0 | CSS/build tooling; unnecessary to exercise pure domain behavior directly |

All four alternatives are already represented in the lock. Windows PE/x64 binaries cannot be treated as Mac executables; chmod/Rosetta is not the remedy. These packages are development tooling, **not Windows containment enforcement**. Preserve all 2,612 tracked node_modules files. `npm ci` removes an existing node_modules tree, so use a separate source copy; npm documents that behavior and lock preservation in its [ci reference](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

Application install-script markers: esbuild and optional fsevents. Retained esbuild postinstall explicitly invokes child-process version checks and may launch npm/download fallback binaries; it is not activated. Hermes additionally marks sharp/unrs-resolver and separate fsevents versions; their script bodies are not available locally and are not approved. Optional file watchers, browser downloads and source builds are unnecessary for the first no-watch checks. No Rust/Rosetta/additional native build prerequisite was demonstrated.

## H. Platform Security Boundary

The intended boundary remains **Mac source development/offline tests where verified; runtime execution blocked**. No Windows-only guard, fail-closed result, security-stop transition, admission rule or authority flag was modified. No POSIX/no-op replacement for Jobs/MXC is accepted. Successful compilation would not establish containment, authentication or runtime readiness.

## I. Windows-Only Components

**WINDOWS_ONLY:** workspace `validateLocalPath` explicitly rejects non-win32 and requires a drive-root path; `isWithin` uses path.win32. HostSQLiteProvider, registry/workspace composition and corresponding integration cases inherit that boundary. LOCALAPPDATA defaults, supervisor SystemRoot/WINDIR assumptions, Windows bridge/MXC/Jobs and historical PowerShell/.exe recipes remain preserved.

**MACOS_SECURITY_DESIGN_REQUIRED:** any future Mac worker launch, process custody/closure, protected state/credentials, physical output fencing or containment. Separate architecture, authorization and adversarial evidence are required; no such implementation begins here.

## J. Safe Cross-Platform Components

| Candidate / priority | Classification and eligibility finding |
|---|---|
| Scoped noEmit compiler check | UNVERIFIED; first command after approved native setup. Compile source only, without app bootstrap. |
| Pure policy/project/knowledge/capabilities contract tests | UNVERIFIED Mac-offline candidates. Inspected relative import closures contain no SQLite, child-process or Windows-guard imports; installed runner/Zod dependencies still need review. |
| Foundation import.test.ts | UNVERIFIED import-only candidate: mocks filesystem/SQLite/process effects; does not call Windows path validation. Requires isolated guarded runner. |
| Repository persistence/schema10 metadata cases | UNVERIFIED; require fresh owned canonical TEMP fixtures and explicit AI_OFFICE_S12_ROOT. Transitive Windows source imports alone do not prove the guard is called; inspect selected case paths. |
| PI11A output-metadata / PI11B output-revalidation | Full suites BLOCKED on Mac: H03/H01 respectively call validateRoot/HostSQLiteProvider. Do not remove or soften those cases. |
| PI08 / PI09A / PI09B | Mixed denial-only and Windows host-storage cases; full suites NOT_RUN. Supervisor imports include real fork-capable code; later negative tests need effect guards even when intended to deny before use. |

No application component is newly labelled **CROSS_PLATFORM_VERIFIED** or **MACOS_OFFLINE_SUPPORTED**: none was executed on this Mac. Those labels are reserved for appropriate executed evidence. The four historical process suites and all HTTP/listener/runtime/probe/worker/provider suites remain excluded. No test filters/skips or source changes were used to manufacture portability.

## K. Installation Actions Performed or Deferred

**Installed: nothing.** Read-only inspection found available prerequisites. One Homebrew inventory command unexpectedly printed an API metadata download despite HOMEBREW_NO_AUTO_UPDATE=1. That metadata/cache refresh is recorded; no package installation was requested/performed, and no further Homebrew inventory/API query followed. Official release checksums and documentation were retrieved; no Node archive/package was downloaded.

Prepared [exact owner commands](/Users/rajenaria/Documents/AI-Office-Audits/M02-02-MAC-01-2026-11-13-01/OWNER_COMMANDS.md) and an [owner setup recipe](/Users/rajenaria/Documents/AI-Office-Audits/M02-02-MAC-01-2026-11-13-01/owner-setup.zsh), **not executed**:

```sh
/bin/zsh /Users/rajenaria/Documents/AI-Office-Audits/M02-02-MAC-01-2026-11-13-01/owner-setup.zsh
```

Run only after owner review/authorization. The recipe uses a unique private directory, pinned official arm64 Node archive/checksum, unchanged source/test/config copies, clean environment/empty npm credential configs and `npm ci --ignore-scripts --no-audit --no-fund --include=dev --include=optional`. It retains logs/exit code, checks source/lock hashes and avoids system/profile changes. Network scope: nodejs.org and registry.npmjs.org; no providers. Its zsh syntax check passed; installation/functionality is **UNVERIFIED**. Checksum signature verification was not performed.

## L. Source Changes

**Zero application source/test/security/config/lock changes.** No safe-development defect requiring a source correction was demonstrated: missing tools/packages need setup; explicit Windows rejection is a preserved security boundary. Only this new report is added inside Git's working tree. The setup/static-inspection artifacts are outside the repository. The earlier uncommitted report and all historical evidence are preserved.

## M. Actual Test Commands and Outcomes

| Command/check actually executed | Outcome / limit |
|---|---|
| Git root/branch/HEAD/tag/status/deleted/fsck | Exit0; checkpoint matches; source integrity only |
| sw_vers, uname, CPU, Git, xcode-select, pkgutil, clang, brew --version | Exit0 in fresh captured inspection; system/tool metadata only |
| `python3 …/audit_mac01.py` | Exit0; 3,789 matching tracked blobs; manifest/lock and conservative transitive-import inspection |
| `/bin/zsh -n …/owner-setup.zsh` | Exit0; syntax only, no setup executed |
| Clean-environment curl of official SHASUMS256.txt | Exit0; pinned archive checksum retained, no binary download/signature verification |
| Scoped TypeScript check | NOT_RUN: Node/native compiler unavailable |
| Application test commands | NOT_RUN: dependencies/guarded runner unavailable |

**Executed application cases: none. No fresh PASS/FAIL/SKIP/TIMEOUT results claimed.** Exact captured argv/exits are in the new audit commands.json. Prospective direct native noEmit command/config and initial five-file test allowlist are in OWNER_COMMANDS.md. A guarded Vitest recipe still needs review; default npm test/Vite config discovery is not substituted.

## N. PI-11A/PI-11B Regression Results

PI11A's **1,194** and PI11B's **1,295** passes/typecheck0 remain historical report results. New Mac PI11A/PI11B regressions: **NOT_RUN**. Schema10 and permanently false authority/HELD-only contracts were inspected, not exercised against a database. PI11B's **26 PASS / 2 PARTIAL** remain historical; active-run authority and live workspace membership gaps remain unresolved. No production identity or fixture authentication was invented.

## O. Remaining macOS Blockers

Node/npm installation approval and actual native setup; locked Darwin packages; a reviewed isolated runner/effect guard and fresh fixture setup; executed scoped typecheck/pure tests/SQLite stages; and disposition of Windows-only integration coverage. Existing strict canonical-path, ownership, link and TEMP constraints must remain intact. No identity implementation may begin while its environment/authority prerequisites are unestablished.

## P. Historical Evidence Limitations

Windows TEMP was cleared per owner report. Retained Git reports/digest references are not recovered raw artifacts; the missing external kit/old manifests/backups remain unavailable/unverified. No historical result was changed or re-created. New evidence uses persistent `/Users/rajenaria/Documents/AI-Office-Audits/M02-02-MAC-01-2026-11-13-01/`; TEMP is not its sole durable location. Any later fresh fixture evidence must be retained/hashes verified before approved cleanup. Historical archival remains PENDING_AUTHORIZATION; a second-device backup is not certified.

## Q. Source Integrity

Fresh tracked-file SHA-256/Git blob inventory is retained; final verification compares every captured tracked byte and the prior report, checks HEAD/tag and validates this report's links/A–S structure. Git status should contain only the preserved earlier report and this report. A self-excluding new manifest seals the fresh audit; it is change-detection evidence, not a signature/independent runtime witness. No commit/push/reset/switch/history rewrite occurred.

## R. Owner Decisions Required

Approve or execute the concrete Node24.22.3/isolated locked-dependency setup; then review newly available runner/package behavior before tests. Separately establish the supported Mac development scope and any Windows-host verification coverage. For production work, approve the identity model, independent authoritative source/protocol/custody, workspace membership ownership and exact integration scope. Current official M02 exit contract/sign-off remains incomplete. None of these decisions is inferred from this request.

## S. Single Recommended Next Milestone

**Owner-Authorized Independent Identity Trust-Root Provisioning & Integration**, conditional on environment readiness and all identity/membership/contract approvals. It remains **BLOCKED**, has not started, and is not automatically PI11C. The detailed conditional scope in the prior report remains applicable. No delivery worker, synthetic auth issuer or positive execution/publication/delivery path is introduced.

**MACOS_TOOLCHAIN_PARTIAL · SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE.** Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; production identity UNAVAILABLE; workers/output delivery BLOCKED; OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE retained.
