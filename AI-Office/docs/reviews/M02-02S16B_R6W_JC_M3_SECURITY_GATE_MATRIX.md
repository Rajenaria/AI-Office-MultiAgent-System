# M02-02S16B-R6W-JC-M3 Security Gate Matrix

2026-11-07 Asia/Jakarta. J0_OS_PASS_WITH_TOKEN_PARTIAL. C PASS / L PASS / J0 PASS / T PARTIAL / S BLOCKED.

## 1. Scope and evidence conventions

M3_ROOT=<TEMP>/ai-office-m0202s16br6wjcm3-ec787404-0ad7-46e4-95e7-4f39da23e131. File prefixes reporter/ and watchdog/ mean source/reporter and source/watchdog. checkpoint/,binding/,static/,fault-injection/,preflight/,runtime/,metadata/,lifecycle/,audit/ mean evidence subdirectories, except build/reporter/source-manifest.json explicitly. E001-E015 refer metadata/reporter-result.json Result.Queries. T01-T45/F01-F25 are actual M3 tests/faults; R01-R30 internal same-agent review; PF01-PF32 preflight.

HOST_ONLY_OS_VERIFIED means current invocation receipts plus specified source custody, not cross-version/hostile guarantee. SOURCE_VERIFIED includes explicit command/file/IL scope. STATIC_TEST_VERIFIED means fake providers; PARTIAL preserves unknown value; NOT_RUN/NOT_VERIFIED/BLOCKED preserve absent evidence. Published API, historical observation, source, fake, current OS and engineering inference kept separate; published references in audit/references.json and Report A G-P.

## 2. Gates M3-01 through M3-88

| Gate | Requirement | Status | Evidence class | Exact file / symbol / receipt | Tests / review | Faults | Result | Actual observation / limit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M3-01 | M2 checkpoint verified | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | checkpoint/preflight.json; M2 manifest | T06 | - | PASS | M2 reporter/test/manifest hashes matched; M2 not executed |
| M3-02 | Historical evidence preserved | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | inventory/baseline-protected.json; audit/final-integrity.json | R29 | - | PASS | 11 retained roots including M2 preserved; unavailable history not claimed verified |
| M3-03 | M2 reporter source verified | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | binding/source-diff.json; M2 source manifest | T09-T18 | - | PASS | TokenQuery byte-identical to M2 |
| M3-04 | M2 class-20 strictness | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | reporter/TokenQuery.cs TokenElevation/Read | T09-T11 | F05,F06 | PASS | Exact20 size4; unknown/elevated blocks J0 |
| M3-05 | M2 class-21 policy | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | reporter/TokenQuery.cs class21 branch | T12-T18 | F07-F10 | PASS | Unknown21/no decode; optional only on safe ledger |
| M3-06 | Reporter binary provenance | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | binding/build-provenance.json; source-manifest.json | R28 | - | PASS | M2 based; final fresh reporter hash/source manifest bound |
| M3-07 | Watchdog source provenance | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | binding/source-diff.json Watchdog | T31-T45 | - | PASS | Four controls byte-identical; entry normalized binding equality |
| M3-08 | Revised reporter hash binding | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | binding/fixed-target.json; runtime/watchdog-claim.json | T01,T05,T08 | F01 | PASS | New actual reporter hash accepted; only fixed reporter launched |
| M3-09 | Obsolete hash rejection | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | watchdog/Lifecycle.cs Spec.Accept | T02,T05 | F01 | PASS | Obsolete M hash and mismatched hash rejected in fake tests |
| M3-10 | Fixed executable path | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | watchdog/WatchdogProgram.Main; NativeHost.Prepare | T03,T04 | F02 | PASS | Fresh-root fixed build/reporter path; locked rehash/no arguments |
| M3-11 | Invocation nonce/generation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | runtime claims; watchdog/owned-identity.json | T06 | F03 | PASS | Fresh invocation/generation correlated across all receipts |
| M3-12 | No stale receipt acceptance | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | watchdog/ReporterReceipt.Validate | T07 | F04,F24 | PASS | Stale/missing receipt cannot full-pass; new receipts separately nonce/hash checked |
| M3-13 | Watchdog Jc logic preserved | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | binding/source-diff.json normalized entry | T31-T45 | - | PASS | Jc lifecycle/control semantics unchanged |
| M3-14 | Private Jc creation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | watchdog/final-lifecycle.json CreateJobObjectW event | T31 | F19 | PASS | One private unnamed Jc created by watchdog |
| M3-15 | Kill-on-close configuration | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | watchdog/final-lifecycle.json Set/query class9 | T32 | F19 | PASS | Configured0x2000 and read back8192 before reporter creation |
| M3-16 | Atomic admission | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | NativeHost.Create; lifecycle CreateProcessW/JOB_LIST events | T33 | F20 | PASS | Atomic JOB_LIST creation path used |
| M3-17 | No uncontained fallback | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | NativeHost.Create; api-il-audit.json | T34 | - | PASS | No create-then-assign/uncontained fallback |
| M3-18 | Reporter suspended before verification | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle CreateProcessW flags0x08080404; ResumeThread | T35 | F21 | PASS | Suspended creation, resume only after checks |
| M3-19 | Reporter identity | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | owned-identity.json; E001; lifecycle identity query | T35,T37 | F21 | PASS | Reporter1612 creation/image/original-handle correlation |
| M3-20 | Jc membership before resume | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle IsProcessInJob/admission-members events | T36 | F20 | PASS | Before resume: Jc assigned1/IDs1612 |
| M3-21 | Original process-handle custody | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle HandleKey/wait events; NativeHost.Demand | T37 | F21-F23 | PASS | Original process custody retained through exit |
| M3-22 | Original thread-handle accounting | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle original-thread flags/CloseHandle events | T38 | - | PASS | Original thread acquired, flags0, released |
| M3-23 | No intentional Jc inheritance | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle Jc/original flags, CreateProcessW InheritHandlesfalse | T39 | - | PASS | No intentional control inheritance; not hostile holder proof |
| M3-24 | No intentional Jc duplication | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | PrivateContainmentJob.cs; IL imports; duplicates0 receipt | T40 | - | PASS | No intentional duplication/export; external acquisition unverified |
| M3-25 | No breakaway | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle Jc flags8192/CreateProcess flags0x08080404 | T32,T39 | - | PASS | No requested breakaway flags |
| M3-26 | Safe token-query behavior | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E004-E010; unchanged TokenQuery | T09-T18 | F05-F10 | PASS | Observed safe classification; no memory/resource failure receipt |
| M3-27 | TokenElevation exact validation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E006 | T09-T11 | F05,F06 | PASS | Native success/error0/request4/return4/elevatedfalse |
| M3-28 | Class-21 compatibility classification | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E008 | T12,T13 | F07 | PASS | Success/error0/request4/return1 COMPAT_RETURN1 |
| M3-29 | No fabricated class-21 value | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | E008 MetadataValue/DecodedBytes/SecurityAuthority | T13,T14 | F07 | PASS | No Value Boolean; NOT_OBSERVED/decoded0 |
| M3-30 | Fatal safety failures remain fatal | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | TokenQuery; JobSecurityReader; Engine fatal guard | T16,T17,T25,T28 | F09,F14,F18 | PASS | Token/descriptor/resource fatal conditions remain fatal |
| M3-31 | Safe optional uncertainty isolation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E008 then E011-E014; Engine.Run | T15 | F10 | PASS | Safe optional uncertainty continued to J0; token metadata partial |
| M3-32 | Jc/J0 separation | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | watchdog PrivateContainmentJob vs reporter CreateJob | T20,T29,T30 | - | PASS | Jc containment/J0 metadata roles and custody separate |
| M3-33 | At most one J0 | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result JobAttempts/E011; Once source | T19 | F11 | PASS | Exactly1 J0 attempt in sole runtime |
| M3-34 | J0 unnamed | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | NativeProvider.CreateJob(NULL,NULL); E011 | T20,T21 | - | PASS | Unnamed by successful fixed API arguments, not namespace enumeration |
| M3-35 | J0 owner query | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E013 GetSecurityInfo status0/Descriptor.Owner | T23 | F12 | PASS | Owner observed REDACTED_PRINCIPAL |
| M3-36 | J0 DACL query | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E013 Descriptor Present/Entries; NativeStatus0 | T24,T25 | F13,F14 | PASS | DACL present/non-null,3 ACE summaries |
| M3-37 | J0 security descriptor buffer release | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E013 DescriptorResource/LocalFreeReleased; E015 | T24,T28 | - | PASS | 140-byte SD resource LocalFreeReleased true/error0 |
| M3-38 | J0 handle flags | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E012 GetHandleInformation | T26 | F15 | PASS | RawFlags0; inheritfalse/protectfalse; not granted mask |
| M3-39 | J0 membership | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E014 class3/ReturnLength8/pointer8/cap4096 | T22,T27 | F16,F17 | PASS | Membership query succeeded and bounded |
| M3-40 | J0 zero assigned processes | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E014 NumberOfAssignedProcesses/NumberOfProcessIdsInList | T22 | F17 | PASS | Both observed0; not inferred from newness |
| M3-41 | J0 close accounting | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E015 J0 HANDLE resource | T28 | F18 | PASS | Close attempted/releasedtrue/error0 |
| M3-42 | No reporter-created child | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | api-il-audit.json reporter no CreateProcess | T29,T30 | - | PASS | Reporter has no child-creation capability; not a global process census |
| M3-43 | Focused static tests | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | static/results-initial.json; summary-initial.json | T01-T45 | - | PASS | 45 PASS,0 FAIL/SKIP/TIMEOUT after1 repair |
| M3-44 | Fake-provider fault injection | STATIC_TEST_VERIFIED | STATIC_FAKE_PROVIDER | fault-injection/results-initial.json | - | F01-F25 | PASS | 25 PASS,0 FAIL/SKIP/TIMEOUT |
| M3-45 | Superseded regression coverage | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | audit/superseded-regression.json | T31-T45 | - | PASS | R6W-T33 remains SUPERSEDED, invariant mapped |
| M3-46 | C# builds | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | build/*/build*.log; binding/build-provenance.json | R28 | - | PASS | 6 compiler exits0,0 warnings,1 focused static repair |
| M3-47 | Source/IL audit | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | audit/api-il-audit.json | R01-R30 | - | PASS | Reporter15 imports837 refs; watchdog19/1516; tests0 imports |
| M3-48 | SHA-256 verification | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | binding/build-provenance; inventory/manifest.json | R28 | - | PASS | Source/binary/report/receipt SHA256 inventory |
| M3-49 | Internal adversarial review | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | preflight/internal-review.json | R01-R30 | - | PASS | SAFETY_REVIEW_PASS30/30, same-agent second pass |
| M3-50 | Runtime preflight | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | preflight/runtime-decision.json | PF01-PF32 | - | PASS | 32 prerequisites PASS; conditional one-shot authorized |
| M3-51 | One watchdog session maximum | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | outer-launch-claim/outer-result/no-retry.json | T45 | F25 | PASS | One watchdog PID11116, no retry |
| M3-52 | One reporter process maximum | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle LaunchAttempts1/E001/owned-identity | T45 | F25 | PASS | One reporter PID1612 |
| M3-53 | One Jc maximum | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle CreateJobObjectW current-watchdog event | T31 | F19 | PASS | One Jc creation |
| M3-54 | One J0 maximum | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result JobAttempts1/E011 | T19 | F11 | PASS | One J0 creation, no second attempt |
| M3-55 | Actual reporter token observation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E004-E010; lifecycle/reconciliation.json | T09-T18 | F05-F10 | PASS | Self token observed, MEDIUM IL, no worker-token inference |
| M3-56 | Actual J0 creation | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E011 | T19-T21 | F11 | PASS | J0 CreateJobObjectW success/error0 |
| M3-57 | Actual J0 DACL/owner | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E013 | T23-T25 | F12-F14 | PASS | Actual GetSecurityInfo SE_KERNEL_OBJECT6/OWNER/DACL5 status0 |
| M3-58 | Actual J0 flags | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E012 | T26 | F15 | PASS | Actual raw handle flags0 |
| M3-59 | Actual J0 empty membership | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | reporter-result E014 | T22,T27 | F16,F17 | PASS | Actual empty membership0/0 |
| M3-60 | Actual reporter exit | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle wait0/exit30; E001 creation correlation | T41-T43 | F22,F23 | PASS | Reporter exit observed through original handle, no termination |
| M3-61 | Actual watchdog exit | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | runtime/outer-result.json | R21 | - | PASS | Watchdog original Process-object wait true/exit30 |
| M3-62 | Final Jc membership | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle final-members event | T36 | - | PASS | Jc assigned0/IDs[] after independent exit |
| M3-63 | Owned handle disposition | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | E015; lifecycle Releases; reconciliation.json | T28,T38 | F18 | PASS | Reporter13/13 released/remaining0; watchdog3 handles closed |
| M3-64 | Gate C | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle/reconciliation.json GateC | T31-T40 | F19-F21 | PASS | Gate C PASS for this host/normal invocation |
| M3-65 | Gate L | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle/reconciliation.json GateL | T37-T45 | F22-F25 | PASS | Gate L PASS; no crash inference |
| M3-66 | Gate J0 | HOST_ONLY_OS_VERIFIED | CURRENT_M3_OS_RECEIPT_AND_SOURCE | lifecycle/reconciliation.json GateJ0 | T19-T30 | F11-F18 | PASS | Gate J0 PASS, separate from token completeness |
| M3-67 | Gate T | PARTIAL | CURRENT_M3_OS_RECEIPT_LIMITED | lifecycle/reconciliation.json GateT; E008 | T12-T18 | F07-F10 | PARTIAL | Gate T PARTIAL, class21 value NOT_OBSERVED |
| M3-68 | Gate S | BLOCKED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | reconciliation GateS; Report A AE | - | - | BLOCKED | Real worker security BLOCKED |
| M3-69 | No deliberate crash | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | runtime/no-retry.json; command scope | - | - | PASS | No deliberate watchdog/reporter crash or hang |
| M3-70 | No runtime retry | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | exclusive claims; no-retry.json; Controller guard | T45 | F25 | PASS | Remaining runtime budget0; no retry |
| M3-71 | No MXC | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | command scope; missing candidate check | - | - | PASS | MXC invocations0; no restore/substitute |
| M3-72 | No app-server | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | source/IL + command scope | - | - | PASS | app-server invocations0 |
| M3-73 | No real worker | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | source/IL + command scope | - | - | PASS | Real coding worker0 |
| M3-74 | No inference/paid API | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | source/IL + command scope; references.json | - | - | PASS | Inference0/paidAPI0/providerAuth0; public doc browsing only |
| M3-75 | No production changes | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | baseline-ai.json; audit/final-integrity.json | R25,R29 | - | PASS | 459 existing files unchanged, exactly2 reports new |
| M3-76 | No Windows security mutation | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | source/IL + command audit; baseline-protected.json | R25 | - | PASS | No ACL/SD/token/privilege/OS security mutation; Jc limits only as authorized |
| M3-77 | Source/system integrity | SOURCE_VERIFIED | SOURCE_HASH_IL_OR_COMMAND_SCOPE | audit/final-integrity.json; baseline snapshots | R29 | - | PASS | 11 roots586 files; Codex50; Hermes647 tracked; scoped checks |
| M3-78 | Historical PID uncertainty | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | checkpoint/preflight; Report A AE | - | - | NOT_VERIFIED | 23376/23644 HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; untouched |
| M3-79 | Missing pinned Codex candidate | BLOCKED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | candidate absence check; audit/final-integrity.json | - | - | BLOCKED | MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE; no restore |
| M3-80 | Watchdog-crash runtime verification | NOT_RUN | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | runtime/no-retry; Report A AE | - | - | NOT_RUN | Watchdog-crash validation outside experiment |
| M3-81 | Hostile same-user handle access | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE; private job last-global-handle limitation | - | - | NOT_VERIFIED | Hostile same-user/external handle access not tested |
| M3-82 | Real process-tree cleanup | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE; reporter no-child source scope | - | - | NOT_VERIFIED | Real process-tree cleanup not tested |
| M3-83 | MXC nested-job compatibility | BLOCKED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | missing pinned candidate; Report A AE | - | - | BLOCKED | MXC nested-job compatibility not tested |
| M3-84 | Physical output fencing | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE | - | - | NOT_VERIFIED | Physical output fencing unverified |
| M3-85 | Credential custody | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE; no credential access | - | - | NOT_VERIFIED | Credential custody unverified |
| M3-86 | Subscription entitlement | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE | - | - | NOT_VERIFIED | Subscription entitlement unverified |
| M3-87 | Included-only billing | NOT_VERIFIED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | Report A AE; paidAPI remainsOFF | - | - | NOT_VERIFIED | Included-only billing guarantee unverified |
| M3-88 | Real worker readiness | BLOCKED | MISSING_OR_OUT_OF_SCOPE_EVIDENCE | GateS; Report A AE | - | - | BLOCKED | Real worker readiness BLOCKED |

## 3. Binding, builds and hashes

| Artifact | Bytes | SHA-256 |
| --- | --- | --- |
| source/reporter/JobSecurity.cs | 4031 | F79C5855EE2C942905E39A631DDF1EC6EC7A8AA99009F34F981E7EB7C5A2F8E2 |
| source/reporter/Model.cs | 8988 | F553F9870403D57848BABEF5E5CF112996D254867F644715C131A4095994CF6A |
| source/reporter/NativeProvider.cs | 12090 | 899F49663C6854752CE4E04C3EDF61A64CAA8C9855D4CB07C36AE01C60CC8AC5 |
| source/reporter/Program.cs | 3866 | 4D0A71581A43CFA10AC5290A9BD92F1374CDECB0E27E34ECF69640B076928797 |
| source/reporter/TokenQuery.cs | 8951 | C5671A23D343A1DE5F1556FECC5627694689844DDC5755F1A605A3321ED87000 |
| source/watchdog/Lifecycle.cs | 11584 | 40986C23A446CB26B224945EFD544BE5254CCE38BC49CE732A3A0F001F5E5531 |
| source/watchdog/NativeHost.cs | 13348 | 41BE3C909D57E7C24D61EBFFADFBAE7BC3BA9E92EB1F3CBD0466E0FE93E8B024 |
| source/watchdog/PrivateContainmentJob.cs | 12715 | C2CD6B420CA7F87853C4C19DFAAE62E68BFA87D9D98D459638D4665FB67F044B |
| source/watchdog/ReporterReceipt.cs | 3575 | 4E76CCC56772DD88E042611A0B6069C2E08025502AC07ED605766415A837F35B |
| source/watchdog/WatchdogProgram.cs | 4489 | 949A3FD0E28B7E019B337DB757A12BA6195F5F13D95FA9CDB20CE5D3416F40CC |
| build/reporter/R6MetadataReporter.exe | 48640 | 6F194E67053DA5F7C3C4FADC0CC40745DB6C2A78E36F5AB7C7F6FC6FEA075572 |
| build/watchdog/JCWatchdog.exe | 75776 | 10CF97D4D8E72FB046C9361547A22CB026DCE231CB5AB8E5C0326A2339E76D62 |
| build/tests/JC.Tests.dll | 49664 | 19B53A905C5F12A8E3C0BAD38CEDB2C29707936B23334D5A5DC6984E744346F4 |

Fresh invocation 93a544d8-8f10-4501-9cc4-d74cc1822b0b, generation 260e8f6b-e22c-48a0-bd09-89a3758e6b86. Source manifest 6DB0D0165E547E7C77D4937F11F088B29B2127916ABBE83FFC898D6C1117F305. Permit binds fixed root-relative reporter executable, actual hash, source manifest, all source hashes and final watchdog hash. NativeHost locks and rehashes image; path/hash/nonce stale/mismatch tested. Four watchdog controls byte-identical; entry changes GUIDs and source list only. GetSecurityInfo descriptor helper is a narrow reporter addition explicitly required by M3, not Jc redesign.

Compiler ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3, Valid Microsoft .NET Framework64 csc14.8.10001.0. Six exit0,zero warning,reporter2/watchdog1/test3 builds,x64 optimize+/warn4/warnaserror+. One pre-runtime static repair: status6 must be fatal, T25 added; initial passing results/source/binary/review snapshots preserved. Reporter15 imports837 refs,watchdog19/1516,tests0 imports; no unexpected process/security/network capability. No post-runtime source or binary change.

## 4. Actual static and fault results

45 targeted tests PASS,25 fake faults PASS,30 internal review questions PASS,32 runtime preflight requirements PASS. Final FAIL0,SKIP0,TIMEOUT0. Initial45/25 PASS retained; after1 focused safety repair final45/25 PASS. No historical broad suites rerun/count inflation. R6W-T33 remains SUPERSEDED with current T31-T45 and unchanged-control hash mapping.

Report A Q/R/V/W gives every test/fault/review/preflight row; static/results-initial.json and fault-injection/results-initial.json are final actual Runner outputs. before-repair1-* preserve initial evidence. fault-injection/reconciled-results.json only maps existing assertions into explicit per-fault expected/actual/resource/security/authorization rows; no runtime/test rerun after experiment. All fake fixtures are non-OS evidence.

## 5. Runtime authorization and actual counts

M3_RUNTIME_AUTHORIZED only after32 prerequisites,final review/IL/hash/snapshot checks PASS. Exclusive outer/watchdog/reporter claims consume one-shot invocation. Actual watchdog1(PID11116),reporter1(PID1612),Jc1,J0=1; runtime retry0,crash0,termination requests0,unrelated targets0,live duplication0,MXC0,app-server0,worker0,inference0,providerAuth0,paidAPI0. Reporter no child-create API; no global descendant census.

runtime/no-retry.json seals remaining budget0. Reporter/watchdog authorized final hashes rechecked after completion. Runtime normal only; no forced failure/hang/crash. Host receipt-parser PSCustomObject correction occurred after experiment without executable/source changes or relaunch.

## 6. Actual token and J0 evidence

E006 class20 nativeSuccess/error0/request4/return4/Valuefalse. E005 MEDIUM integrity. E008 class21 nativeSuccess/error0/request4/return1,COMPAT_RETURN1,NOT_OBSERVED,OPTIONAL_UNCERTAINTY,DecodedBytes0,SecurityAuthorityfalse,Value absent. Native observation of shape is verified; semantic restriction Boolean remains unobserved.

E011 J0 CreateJobObjectW(NULL,NULL)success/error0; one attempt. E012 GetHandleInformation RawFlags0,inheritfalse,protectfalse,granted-mask unobserved. E013 GetSecurityInfo SE_KERNEL_OBJECT6/OWNER|DACL5,status0,error0,descriptor140 bytes,owner redacted,DACL present/non-null,3 ACE summaries;LocalFreeReleasedtrue/error0. E014 class3cap4096/returned8/ptr8,assigned0/listed0. E015 J0 handle and descriptor resource released with all13 reporter resources/remaining0. No assignment/termination/limit config on J0; Jc/J0 topology distinct.

Raw reporter Completedtrue/GateM PARTIAL/SecurityStopfalse. Unchanged watchdog full receipt classifier retains GateM INCONCLUSIVE/LIFECYCLE_PASS_METADATA_PARTIAL and conservative reporter-release label. Auditor independently validates J0 and E015 with nonce/hash/PID/time rather than rewriting raw results or promoting unknown21.

## 7. Containment, exit and resource acceptance

C PASS: current privateJc Create success,flags0x2000/readback8192,atomic suspended creation,original identity/membership1[1612] verified before resume,no fallback. Jc final membership0[] after independent reporter exit,owned handle closed.

L PASS: reporter WaitForSingleObject original handle returns0,GetExitCodeProcess30; outer original watchdog Process-object waittrue/exit30. No timeout/termination;thread/process/Jc handles released; invocation identity/hash matches. Normal exit does not verify watchdog-crash cleanup.

J0 PASS: all required current query/release facts present. T PARTIAL: safe unknown21 intentionally incomplete. S BLOCKED: no worker-security promotion. E01513 resources =3HANDLE/9HGLOBAL/1LOCAL_ALLOC,all released/error0/dependents0;remaining0. Watchdog3 owned handles and environment/attribute/image-lock buffers accounted. No global heap or hostile-handle census.

## 8. Source/system integrity and remaining blockers

459 prior AI-Office hashes unchanged,461 final;git136->138 with exactly2 new reports. Scope excludes .git/node_modules, includesSQLite/history/ProjectState/S12-S15. Protected11 roots586 files includes M2 root74/M63/activeCodex50;Hermes647 tracked files/pathset unchanged. 82 disposable files, 81 manifest entries self excluded. audit/final-integrity.json verifies actual counts/hashes and44 requested integrity items; inventory/manifest.json binds both reports and all evidence.

No global Windows security mutation or production/dependency changes. Requested public documentation browsing occurred; no experimental network/provider/credential traffic. Old2209 missing files/17 roots per M remain not verified. PIDs23376/23644 remain HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; not control targets. MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE, candidate not restored/substituted.

Gates80-88 remain NOT_RUN/NOT_VERIFIED/BLOCKED:actual watchdog crash,hostile same-user handles,real process-tree cleanup,MXC nested jobs,physical output fencing,credential custody,entitlement,included-only billing,real worker readiness. Source byte equality and empty J0 cannot prove those properties.

## 9. Exactly one recommended next action

Separately authorized M02-02S16B-R6W-JC-CRASH Controlled Watchdog-Crash Containment Validation. One controlled synthetic target/trusted external observer,exact identities,membership before crash,last-handle custody,bounded failure trigger,independent target exit,no uncontrolled descendants/no broad or PID-only kill,finite fallback and explicit failure outcomes,noMXC/noWorker. Not executed by M3; no later milestone started.

M02-02S16B-R6W-JC-M3 J0_OS_PASS_WITH_TOKEN_PARTIAL — EMPTY JOB METADATA VERIFIED — TOKEN RESTRICTION VALUE NOT OBSERVED — CONTAINMENT AND NORMAL LIFECYCLE VERIFIED — REAL WORKER BLOCKED.
