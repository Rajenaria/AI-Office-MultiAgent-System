# M02-02S16B-R6 — Security Gate Matrix

Tanggal2026-11-05. Classification **STATIC_ONLY_RUNTIME_BLOCKED**, internal review **SAFETY_REVIEW_INCONCLUSIVE**, runtime **R6_RUNTIME_NOT_AUTHORIZED**. Companion [M/J0 report](M02-02S16B_R6_MJ0_SECURITY_METADATA_REPORT.md).

## 1. R6-01 through R6-69

SOURCE_VERIFIED/STATIC_TEST_VERIFIED bukan runtime OS metadata acceptance. NOT RUN setelah failed prerequisite bukan Win32 denial atau successful cleanup. No forbidden API adalah source/IL finding; no invocation adalah scoped command record.

| Gate | Requirement | Evidence status | Actual evidence | Result / limitation | Runtime blocked | Next action |
|---|---|---|---|---|---|---|
| R6-01 | R5 checkpoint verified | SOURCE_VERIFIED | evidence/preflight/checkpoint.json; verified R5 manifest | R5 C checkpoint accessible, preserved | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-02 | Historical evidence preserved | SOURCE_VERIFIED | inventory baselines; evidence/audit/final-integrity.json | Scoped file/hash preservation; final report additions only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-03 | R3 runtime guard unchanged | SOURCE_VERIFIED | inventory baselines; evidence/audit/final-integrity.json | Scoped file/hash preservation; final report additions only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-04 | Quarantined binary not executed | NOT RUN | execution record; metadata/not-run.json | No such execution performed | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-05 | Minimal reporter source | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Source property only; not an OS observation | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-06 | API allowlist verified | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Source property only; not an OS observation | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-07 | Forbidden API absence | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Source property only; not an OS observation | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-08 | Compiler provenance | SOURCE_VERIFIED | build/build-provenance.json | Existing signed Microsoft compiler; version/hash recorded | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-09 | Source hash | SOURCE_VERIFIED | build/build-provenance.json | Three reporter source hashes plus static-test source hash | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-10 | Binary hash | SOURCE_VERIFIED | build/build-provenance.json | One fresh reporter executable hash bound to compiled sources | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-11 | Static tests | STATIC_TEST_VERIFIED | static-tests/results-initial.json; source/StaticTests.cs | 32 PASS /0 FAIL /0 SKIP /0 TIMEOUT, one managed test batch | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-12 | Fault injection | STATIC_TEST_VERIFIED | static-tests/results-initial.json; source/StaticTests.cs | Fake query/create/flags/membership/close failures and bounds injected, no native calls | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-13 | Pointer-safe interop | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | x64 pointer-size declarations and bounded offsets; caller-owned self-relative SD buffers; no native runtime proof | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-14 | Resource ownership | STATIC_TEST_VERIFIED | static-tests/results-initial.json; source/StaticTests.cs | Lifetime one-shot release/dependents and Engine finally tested; native release not observed | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-15 | Internal safety review | INCONCLUSIVE | evidence/safety/internal-review.json IR14 | SAFETY_REVIEW_INCONCLUSIVE: bounded self-completion/release not enforceable by cooperative checks | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-16 | Runtime prelaunch gate | BLOCKED | evidence/safety/prelaunch-decision.json | R6_RUNTIME_NOT_AUTHORIZED; no activation file created | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-17 | One reporter maximum | NOT RUN | metadata/not-run.json; absence of invocation claim | 0 reporter Main/native runtime invocations; assembly loading for pure tests is not reporter execution | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-18 | Reporter identity | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-19 | Reporter process metadata | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-20 | Reporter process DACL query | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-21 | Reporter owner classification | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-22 | Reporter token query | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-23 | Reporter integrity | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-24 | Reporter elevation | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-25 | Reporter privileges | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-26 | Reporter restrictions | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-27 | Reporter AppContainer classification | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-28 | One empty job maximum | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | One-shot job attempt guard; 0 actual creation attempts | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-29 | Private unnamed job | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Unnamed CreateJobObjectW(NULL,NULL) in source only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-30 | Default security attributes | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | NULL security attributes in source; no actual default descriptor measured | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-31 | Job owner query | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-32 | Job DACL query | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-33 | Job security buffer integrity | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-34 | Job handle flags | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-35 | Job handle inheritance status | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-36 | Job membership query | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-37 | No assigned target | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Assignment API absent; 0 processes assigned by R6 | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-38 | No unexpected job member | NOT RUN | evidence/metadata/not-run.json | No runtime observation because mandatory safety predecessor did not pass | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-39 | No process assignment API | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-40 | No process creation API | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-41 | No process termination API | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-42 | No job termination API | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-43 | No security mutation API | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-44 | No privilege elevation | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | No elevation/privilege-mutation path; actual reporter token NOT RUN | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-45 | No handle duplication | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | Forbidden capability absent from reviewed reporter imports/IL; actual reporter not launched | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-46 | No network access | SOURCE_VERIFIED | source + evidence/safety/api-il-audit.json | No reporter network API/path or explicit network/browser/provider command in R6; no machine-wide packet attestation | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-47 | Resource close accounting | NOT RUN | evidence/metadata/not-run.json | 0 runtime-owned handles/buffers acquired, 0 release events; static accounting only | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-48 | Reporter exit | NOT RUN | evidence/metadata/not-run.json | No reporter process launched, no exit receipt exists | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-49 | Sanitized evidence | STATIC_TEST_VERIFIED | static-tests/results-initial.json; source/StaticTests.cs | Category sanitization and no false worker/supervisor/mask/termination claims tested | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-50 | Evidence inventory | SOURCE_VERIFIED | inventory baselines; evidence/audit/final-integrity.json | Scoped file/hash preservation; final report additions only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-51 | Source/system integrity | SOURCE_VERIFIED | inventory baselines; evidence/audit/final-integrity.json | Scoped file/hash preservation; final report additions only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-52 | No MXC | NOT RUN | execution record; metadata/not-run.json | No such execution performed | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-53 | No app-server | NOT RUN | execution record; metadata/not-run.json | No such execution performed | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-54 | No real worker | NOT RUN | execution record; metadata/not-run.json | No such execution performed | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-55 | No production database change | SOURCE_VERIFIED | inventory baselines; evidence/audit/final-integrity.json | Scoped file/hash preservation; final report additions only | false | Preserve source/test/integrity evidence; no automatic runtime advance |
| R6-56 | Metadata Gate M | NOT RUN | evidence/metadata/not-run.json | Gate M NOT RUN; no actual M/J0 OS metadata | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-57 | Security Sufficiency Gate S | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Gate S BLOCKED: no malicious-worker/host/process containment proof | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-58 | Actual worker token | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-59 | Malicious same-user isolation | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-60 | Host-only process containment | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-61 | Process-tree termination | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-62 | Host-crash cleanup | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-63 | MXC nested-job compatibility | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-64 | Physical output fencing | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-65 | Production supervisor | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-66 | Credential custody | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-67 | Subscription entitlement | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-68 | Included-only billing | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |
| R6-69 | Real worker activation | BLOCKED | R5 baseline; not-run.json; separate M/S acceptance | Not accepted by empty-job metadata source/static tests; no runtime evidence | true | Resolve enforceable lifetime/release design before any reporter execution; separate later authority for worker/control stages |


## 2. Actual source/build/static evidence

| Artifact | SHA256 |
|---|---|
| Compiler | ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3 |
| source/Model.cs | 597C9B0D94F6EE7855B78BA971CCF683CED7DCCB57CBAEE7F4C23AB634157791 |
| source/NativeProvider.cs | 0584F45DE80F009CAA7A0895FFBC3EF4D78B5D949D734AB3757945EF9B1BD6F5 |
| source/Program.cs | 90DF541BDC563866BD237B448409EB033648DF3AAC4F169212020CC5FEB68F19 |
| build/source-manifest.json | B19E4C43D715C5E1E5F56C24E8AA723B08D26033B06C8BE5C06BC3DAD9B5603E |
| build/R6MetadataReporter.exe | 71B610E575D894C2B2E9390331D01D5385E2350EC0C9AF9776F72BA0B170E2B7 |
| source/StaticTests.cs | E4C65160642B4021683EE96F2608AE5F0D74D5B3CC99F960AF45A7C483B7DD82 |
| static-tests/R6StaticTests.dll | B343D75C305DAF2E64B96E50C3591CCFD34F7ECAB66C614924663AFFA4E72BC4 |


Existing signed Microsoft Framework64 csc, x64/warn4/warnaserror, reporter exe dan test library masing-masing compilation exit0/warnings0. Satu reporter executable; test DLL terpisah tanpa process entry. Main tidak diinvoke oleh tests/reflection/IL inspection.

12 PInvoke imports/625 method references diaudit, zero forbidden/calli finding. Self-only PID internal, process mask0x21000, TOKEN_QUERY0x8, fixed token classes, one-shot unnamed NULL-attributes job. Tidak ada path process creation/assignment/termination/limit/security mutation/network/auth/credential. Tidak ada PID/command/executable/output input arbitrer.

GetKernelObjectSecurity adalah allowed alternative: caller-allocated bounded self-relative descriptor buffer, OWNER|DACL0x5; no SACL/label/LocalFree allocation. LookupPrivilegeNameW NULL system adalah justified local read-only name lookup, bukan privilege mutation/account lookup. Managed memory/parsing/hash/fixed-root I/O diperiksa; trusted framework transitive implementation tidak seluruhnya didisassemble. Tidak ada R6 browser/network research; existing R5 references/local source declarations digunakan.

| Test | Behavior | Result |
|---|---|---|
| T01 | TokenUser bounded SID parsing | PASS |
| T02 | Integrity label parsing | PASS |
| T03 | Elevation boolean | PASS |
| T04 | Privilege bounds and enabled attributes | PASS |
| T05 | Owner categories redact identifying principals | PASS |
| T06 | DACL present-empty distinguished | PASS |
| T07 | Process descriptor error preserved partial | PASS |
| T08 | Token buffer-too-small failure not fabricated success | PASS |
| T09 | Invalid buffer lengths rejected | PASS |
| T10 | x64 pointer arithmetic no truncation | PASS |
| T11 | Job creation failure no retry and cleanup | PASS |
| T12 | Job descriptor query failure remains partial | PASS |
| T13 | Handle flags include no mask | PASS |
| T14 | Inheritable job handle security stop | PASS |
| T15 | Unexpected nonempty membership stop | PASS |
| T16 | Membership failure never means zero observed | PASS |
| T17 | Close failure blocks clean completion | PASS |
| T18 | Double close prevented | PASS |
| T19 | Second job attempt forbidden after failure | PASS |
| T20 | No fabricated granted access mask | PASS |
| T21 | No false worker-token claim | PASS |
| T22 | No false production-supervisor claim | PASS |
| T23 | Handle closure not termination proof | PASS |
| T24 | Fail-closed exception still cleanup | PASS |
| T25 | Sanitized evidence has categories not SID/handle | PASS |
| T26 | Active dependent prevents close | PASS |
| T27 | Failed close attempted only once | PASS |
| T28 | Null DACL is distinct from empty DACL | PASS |
| T29 | Unknown elevation blocks job creation | PASS |
| T30 | Elevated token blocks job creation | PASS |
| T31 | Privilege/membership overflow rejected | PASS |
| T32 | Fake full metadata pass never security acceptance | PASS |


32 PASS /0 FAIL /0 SKIP /0 TIMEOUT, satu pure managed test batch. Shared Engine/Lifetime/parser fault tests tidak memberi actual native failure/release/deadline proof. Fake query5/122/234 tidak dipersist sebagai actual OS security errors.

Dua focused audit-tool repairs, failures preserved: generic ResolveMethod context lalu PowerShell List serialization. Tidak ada reporter source/assertion weakening, test rerun atau cycle ketiga; no historical229 rerun. Original failed scripts/receipts dan final successful API-IL receipt semuanya dipertahankan.

## 3. Internal safety review and prelaunch

**INTERNAL_ADVERSARIAL_REVIEW**, same agent separate pass after implementation/tests/audit; not human/external auditor. Outcome **SAFETY_REVIEW_INCONCLUSIVE**.

| ID | Challenge | Outcome | Evidence / limitation |
|---|---|---|---|
| IR01 | Process creation code present? | PASS | No CreateProcess/Process.Start/shell path in reporter; source and all IL references audited. |
| IR02 | At most one job? | PASS | Once.Demand precedes the only Native.CreateJobObjectW call; no retry; T11/T19. |
| IR03 | Job unnamed? | PASS | CreateJobObjectW(IntPtr.Zero,null), fixed source call. |
| IR04 | Can assign processes? | PASS | Assignment API absent from imports and IL; no exposed command input. |
| IR05 | Can terminate processes/jobs? | PASS | Termination API/path absent; CloseHandle not represented as termination. |
| IR06 | Can mutate descriptors? | PASS | Only security query with OWNER\|DACL; no setters/SACL request. |
| IR07 | Can enable privileges? | PASS | TOKEN_QUERY only; no AdjustTokenPrivileges or token mutation. |
| IR08 | Can open unrelated processes? | PASS | OpenProcess PID comes only from GetCurrentProcessId, mask0x21000, inherit=false; no PID arguments. |
| IR09 | Can duplicate arbitrary handles? | PASS | No DuplicateHandle, WindowsPrincipal or dynamic interop path. |
| IR10 | Can expose job handle unexpectedly? | PASS | Native values stay private provider fields, no IPC/raw pointer/handle output; hostile same-user access remains unverified Gate S. |
| IR11 | Can run arbitrary shell commands? | PASS | No process/shell API; Main accepts zero arguments and fixed owned paths. |
| IR12 | Can access network? | PASS | No System.Net/socket/provider references in reporter IL/imports; local privilege-name lookup uses NULL system. |
| IR13 | Can read credentials? | PASS | Only fixed generated source/build/gate files and own token metadata; no credential store/path or provider auth. |
| IR14 | Are all resource lifetimes bounded? | INCONCLUSIVE | 20s cooperative checks do not preempt synchronous Win32 calls, hashing or file flush. If a call does not return, finally/disposition cannot be guaranteed within the bound. No independently safe authorized hard deadline mechanism exists in this build. |
| IR15 | Pointer declarations correct? | PASS | x64 explicit DWORD/BOOL/IntPtr/FILETIME declarations, checked pointer-relative offsets, max64KiB buffers, pure SID/ACL parsing and pointer bounds tests. Source-level only, not OS validation. |
| IR16 | DACL permissions understood? | PASS | READ_CONTROL for OWNER\|DACL; own process0x21000; job API documented broad return, not minimum-rights or measured mask. GetKernelObjectSecurity returns BOOL/last-error and caller-owned self-relative buffer. |
| IR17 | Token metadata sanitized? | PASS | Private principals become categories; no name translation, raw SID/token/handle serialized; T05/T25. |
| IR18 | Failed query triggers another job? | PASS | No retry; one job attempt gate remains consumed even on creation failure; elevation unknown/elevated prevents job. |
| IR19 | One execution sufficient? | PASS | One potential invocation suffices for the scoped point-in-time metadata, not worker security; none authorized after failed mandatory predecessor. |
| IR20 | Failure can leave a worker/child? | PASS | Reporter has no worker/child creation path. This does not resolve reporter-only hang/resource-release uncertainty or pre-existing external actors. |


| ID | Condition | State | Evidence |
|---|---|---|---|
| PL01 | Exact source/binary binding | PASS | build/build-provenance.json and source-manifest.json |
| PL02 | No quarantined executable | PASS | Fresh source and fresh reporter executable, old R3 guard preserved |
| PL03 | No intentional unsafe handle inheritance | SOURCE_VERIFIED | No launcher runtime performed; reporter exports no handles; actual inherited handle set NOT OBSERVED |
| PL04 | Non-elevated actual launch context | NOT OBSERVED | Operational prelaunch not advanced after failed review; code checks own TokenElevation before J0; source is not actual context proof |
| PL05 | Compiler/provenance/dependencies | PASS | Existing signed Microsoft Framework64 compiler; no dependency installation |
| PL06 | No target/assignment/termination/security mutation | PASS | Source + API/IL audit, no forbidden path |
| PL07 | Finite enforceable lifetime/resource release | INCONCLUSIVE | Cooperative 20s checks and prospective outer observation cannot preempt blocked native/I/O calls or guarantee release |
| PL08 | Static resource fault coverage | PASS_WITH_LIMIT | Managed engine/Lifetime faults passed; not native API fault receipts or deadline enforcement |
| PL09 | Fixed new-root output | SOURCE_VERIFIED | Only compiled-root relative paths, CreateNew evidence; no arbitrary output argument |
| PL10 | No network/provider implementation | PASS | Source/IL contain none; no R6 web research |
| PL11 | Internal safety review | INCONCLUSIVE | SAFETY_REVIEW_INCONCLUSIVE; mandatory predecessor not passed |


20s deadline hanya checks antar panggilan. Native calls, hash dan file write/Flush bersifat synchronous; bila tidak kembali, finally/resource cleanup belum tentu berjalan dalam batas waktu. Prospective25s outer observation tidak menjamin self-completion atau release. R6 §16 secara eksplisit melarang launch bila bounded self-completion/release tidak dapat dijamin; §§19-20 hanya mengizinkan review PASS maju ke operational gate. IR14 gagal memberi guarantee itu.

Tidak ada runtime-authorization.json diterbitkan, tidak ada negative-gate trial execution. Actual non-elevated launch context NOT OBSERVED karena operational gate tidak dilanjutkan; source TokenElevation check bukan actual prelaunch proof. Blocker ini tentang reporter-only lifetime, terpisah dari Gate S hostile isolation yang memang belum diwajibkan PASS di milestone metadata.

## 4. Actual runtime counts and API outcomes

| Counter / receipt | Actual |
|---|---|
| Reporter Main/native runtime invocations | 0 |
| Job create attempts / successful jobs | 0 /0 |
| Processes assigned / targets / workers | 0 /0 /0 |
| Runtime-owned handles / buffers | 0 /0 |
| Native resource releases | 0; no closure receipt |
| Reporter PID / creation / exit | NOT RUN |
| Actual native errors | NONE OBSERVED |
| runtime-authorization.json / invocation-claim.json / reporter-result.json | All absent |
| Metadata Gate M | NOT RUN |
| Security Sufficiency Gate S | BLOCKED |


Actual reporter API results/query failures: **NONE OBSERVED**. Reporter PID/creation/exit: **NOT RUN**. Prepared nonce/source/hash bukan invocation receipt. Tidak ada J0 atau original runtime handles yang dapat ditutup/diklaim observed.

## 5. M01-M16 observation register

| ID | Required observation | Status | Actual value / limitation |
|---|---|---|---|
| M01 | Actual reporter PID | NOT RUN | NOT RUN; no reporter OS observation |
| M02 | Reporter invocation identity | SOURCE_VERIFIED | Prepared nonce, not an executed invocation |
| M03 | Reporter executable provenance | SOURCE_VERIFIED | Source/binary hashes in provenance, not a running image |
| M04 | Process SD query outcome | NOT RUN | NOT RUN; no reporter OS observation |
| M05 | Owner classification | NOT RUN | NOT RUN; no reporter OS observation |
| M06 | DACL presence/parsing | NOT RUN | NOT RUN; no reporter OS observation |
| M07 | Sanitized relevant DACL ACEs | NOT RUN | NOT RUN; no reporter OS observation |
| M08 | Requested process-query mask | SOURCE_VERIFIED | 0x00021000 in source, no handle acquired |
| M09 | Actual process query result | NOT RUN | NOT RUN; no reporter OS observation |
| M10 | Process handle flags | NOT RUN | NOT RUN; no reporter OS observation |
| M11 | Token query result | NOT RUN | NOT RUN; no reporter OS observation |
| M12 | Token integrity | NOT RUN | NOT RUN; no reporter OS observation |
| M13 | Token elevation | NOT RUN | NOT RUN; no reporter OS observation |
| M14 | Token privileges | NOT RUN | NOT RUN; no reporter OS observation |
| M15 | Token restrictions | NOT RUN | NOT RUN; no reporter OS observation |
| M16 | Token AppContainer | NOT RUN | NOT RUN; no reporter OS observation |


All values refer to reporter only, never production supervisor/worker. Requested rights are source fields; no independent full granted-mask dump.

## 6. J01-J18 observation register

| ID | Required observation | Status | Actual value / limitation |
|---|---|---|---|
| J01 | Job creation outcome | NOT RUN | NOT RUN; J0 not created |
| J02 | Job creation error | NOT RUN | NOT RUN; J0 not created |
| J03 | Unnamed construction | SOURCE_VERIFIED | NULL name source only |
| J04 | Job handle ownership | SOURCE_VERIFIED | Intended private reporter owner, no runtime handle |
| J05 | Inheritance flag | NOT RUN | NOT RUN; J0 not created |
| J06 | Protect-from-close flag | NOT RUN | NOT RUN; J0 not created |
| J07 | Job SD query outcome | NOT RUN | NOT RUN; J0 not created |
| J08 | Job owner | NOT RUN | NOT RUN; J0 not created |
| J09 | DACL present/absent | NOT RUN | NOT RUN; J0 not created |
| J10 | Sanitized ACEs | NOT RUN | NOT RUN; J0 not created |
| J11 | READ_CONTROL query result | NOT RUN | NOT RUN; J0 not created |
| J12 | Membership query result | NOT RUN | NOT RUN; J0 not created |
| J13 | NumberOfAssignedProcesses | NOT RUN | NOT RUN; J0 not created |
| J14 | NumberOfProcessIdsInList | NOT RUN | NOT RUN; J0 not created |
| J15 | Unexpected member observed | NOT RUN | NOT RUN; J0 not created |
| J16 | Job handle closure | NOT RUN | NOT RUN; J0 not created |
| J17 | Remaining owned query handles | NOT RUN | 0 runtime resources acquired; no closure receipt |
| J18 | Job observation completeness | NOT RUN | NOT RUN; J0 not created |


NULL/default/unnamed source construction dan documented broad original creation rights bukan actual job descriptor, flags, emptiness atau measured granted-mask. GetHandleInformation tidak mengembalikan granted access. Zero creation/assignment actions bukan actual zero-members query. Closure bukan termination proof. Empty job bukan future production/MXC job.

## 7. Failure disposition and owned-resource accounting

| ID | Failure | Resource state | Disposition | Runtime observed |
|---|---|---|---|---|
| F01 | Source validation fails | No reporter resources created; preserve static artifacts | Block runtime; preserve failure and stop after at most two focused static repairs | NO |
| F02 | Compilation fails | No reporter resources created; preserve static artifacts | Block runtime; preserve failure and stop after at most two focused static repairs | NO |
| F03 | Unexpected API reference | No reporter resources created; preserve static artifacts | Block runtime; preserve failure and stop after at most two focused static repairs | NO |
| F04 | Preflight scope violation | No reporter resources created; preserve static artifacts | Block runtime; preserve failure and stop after at most two focused static repairs | NO |
| F05 | Reporter fails to start | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F06 | Token query fails | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F07 | Process descriptor query fails | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F08 | Job creation fails | At most one failed job attempt; no second creation | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F09 | Job flags query fails | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F10 | Job descriptor query fails | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F11 | Membership query fails | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F12 | Unexpected job member | Known original owned resources only; possible J0; no authority over members | SECURITY_STOP; no member interaction; predefined original owned-handle disposition only, then stop | NO |
| F13 | Descriptor buffer handling fails | Known original owned resources only; possible J0; no authority over members | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F14 | Owned handle close fails | Known original owned resources only; possible J0; no authority over members | SECURITY_STOP, one close attempt per resource; retain unresolved state, no blind retry | NO |
| F15 | Reporter exits without final resource receipt | At most one reporter, self-query resources and conditional owned J0 | Record actual BOOL/DWORD/error; no security changes/control fallback; only reviewed owned cleanup; partial or stop according to result | NO |
| F16 | Reporter timeout / stalled call | Reporter/resource state uncertain; no authorized external kill/reopen cleanup | Stop scheduling work at cooperative checks if reachable; never launch if bounded return/release not established; external observation alone is not enforcement | NO |
| F17 | Evidence missing | No trustworthy complete observation/exit/resource claim | Reject evidence; preserve gap; no automatic runtime retry | NO |
| F18 | Evidence checksum mismatch | No trustworthy complete observation/exit/resource claim | Reject evidence; preserve gap; no automatic runtime retry | NO |


Original owned self-process/TOKEN_QUERY/J0 handles saja yang boleh CloseHandle; borrowed pseudo-handle tidak ditutup. HGLOBAL token/security buffers max64KiB dan job buffer4096 dilepas FreeHGlobal dalam reviewed finally; no GetSecurityInfo allocation/LocalFree responsibility. Ledger register/lifetime/one-shot/dependent/error rules tested at managed level. No finalizer-only cleanup, no double-close/retry/control fallback.

Actual acquired runtime handles/buffers0; actual resource releases0; no unresolved created reporter resource exists because no invocation. This is not runtime release PASS. Inability to bound blocked-call return/disposition is the reason for stop before Main.

## 8. Separate acceptance and remaining Boundary B gaps

**Gate M NOT RUN; Gate S BLOCKED.** Source/tests/build cannot establish METADATA_OS_PASS or PARTIAL_METADATA_OBSERVED with no runtime metadata. Gates58-69 remain BLOCKED: actual worker token, malicious same-user isolation, host containment, process-tree termination/independent exit, crash cleanup, MXC nested jobs, physical output fencing, production supervisor, credential custody, entitlement, billing, activation.

Boundary B remains conditional; no actor silently excluded and no automatic same-user isolation assumed. No hostile grant/denial measured. Local ledger/default descriptor/unnamed job/hash issuance do not exclude existing/inherited/duplicated capabilities or control-file tampering. Source self reporter is not production host or MXC.

Historical PID23376/23644 remain HISTORICAL_PROCESS_IDENTITY_UNRESOLVED, untouched. Candidate remains MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE, not restored/substituted. Old R3 native guarded; H1/H2 NOT RUN.

## 9. Final source/system integrity

Pemeriksaan akhir: evidence/audit/final-integrity.json. Baseline **449 file AI OFFICE** dipertahankan byte-for-byte dalam scope snapshot; final **451 file**, hanya dua laporan R6 baru. Git scope **126 entri lama** dipertahankan; final **128 entri**. **23 protected roots /2502 files** tetap sama, termasuk R5 (24 files), R4 (19), R3 (67) dan distribusi Codex terpasang (50). **647 tracked files Hermes3D** beserta set path/hash tidak berubah.

AI snapshot mengecualikan directory bernama .git/node_modules; protected roots dihash penuh; Hermes mencakup tracked baseline. Ini bukan attestation seluruh disk/OS/proses atau packet trace. User changes tidak direset/ditimpa. Tidak ada perubahan source produksi, database, historical reports/fixtures/bridge, active Codex, token/DACL/IL/privileges, OS security configuration, service atau scheduled task. Candidate pinned tetap tidak ada/tidak direstore. R3 activation/build gates tetap absent; historical negative review/prelaunch tetap sama.

R6 tidak menjalankan web/network/provider/auth/credential/inference/paid API, MXC, app-server, worker/target, process assignment/termination/handle duplication, elevation atau dependency install. Klaim aktivitas mengikuti command record dan reviewed source, bukan monitoring global. Runtime reporter0, job0, assigned processes0, runtime-owned handles/buffers0. Satu executable reporter dan satu DLL tes baru dibuat; DLL tidak memiliki process entry. Compiler/preflight/shell commands bukan synthetic targets.

Hash evidence berada di inventory/manifest.json, yang mengecualikan dirinya; dua report hashes dicatat di final-integrity dan manifest tanpa circular hash. Semua initial audit-tool failure receipts dipertahankan.

## 10. One next action and Owner review

One bounded action: **Owner architecture/safety decision on enforceable reporter lifetime and owned-resource release**, before any native execution. Determine a compliant enforcement mechanism within allowed capabilities, or explicitly revise the guarantee/authorization if none can meet it. Do not silently substitute cooperative checks/observation timeout for hard completion/release. No identical empty-job retry or automatic S16C/S17/later execution.

Any later containment proposal separately requires atomic admission, original process identity, safe owned-scope cleanup, external-access assumptions, independent exit and crash limitations. R6 resolves none through static-only status.

**M02-02S16B-R6 STATIC_ONLY — REPORTER SAFETY GATE NOT CLEARED — OS METADATA EXPERIMENT NOT RUN — REAL WORKER BLOCKED.**

