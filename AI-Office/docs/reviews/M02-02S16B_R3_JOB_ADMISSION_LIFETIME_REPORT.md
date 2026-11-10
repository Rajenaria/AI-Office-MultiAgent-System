# M02-02S16B-R3 - Private Job Admission, Handle Lifetime & Failure-Disposition Resolution

Tanggal2026-11-05. Root disposable tunggal: C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s16br3-7ec22741-2f4b-4bb4-bcf2-bd023d5f3ce1. Evidence paths relatif ke root ini kecuali disebutkan lain.

## A. Executive decision

**STATIC_PASS_RUNTIME_BLOCKED.** Admission, custody dan failure-disposition model selesai secara design/static: **229 PASS, 0 FAIL, 0 SKIP, 0 TIMEOUT**, termasuk152 regresi R2,52 required checks R3 dan25 new fault scenarios. Tiga build C# berhasil tanpa warning. Initial complete validation PASS; static repair cycles R3=0 dari batas2.

Second-pass review **SAFETY_REVIEW_INCONCLUSIVE**: external handle acquisition/admission boundary belum terbukti. H1/H2 **NOT RUN**; zero target creation/native process-control calls. Tidak ada HOST_ONLY_OS_VERIFIED. R3-A PASS; B/C design/static complete; D/E PASS; F INCONCLUSIVE; G BLOCKED; H scoped integrity PASS. Tidak ada manual guard override/S16C/S17.

## B. S16B-R2 checkpoint

Dilanjutkan dari **R2 PARTIAL_PASS_STOPPED**, tanpa mengulang eksperimen historis. Preflight membaca delapan report/matrix S16/B/R/R2, actual latest source, failing safety findings, compiler dan user-change inventory. R2 manifest84 entries/root85 file diverifikasi; manifest SHA256 anchor14260641BC809D3E4FD15027A1B9E026568542BB492CF9EA16BE4317B2DE80F0.

Checkpoint:152 tests/26 faults PASS,84 tests R termasuk17 negatives retained, dua historical repair cycles, locked native guards, H1/H2 NOT RUN. Seluruh152 direvalidasi pada source disposable baru; batas repair R3 terpisah. Old binaries tidak dieksekusi, evidence lama tidak ditimpa. Evidence: checkpoint/preflight.json.

## C. Source/evidence inventory

Sembilan input R2 disalin sebagai provenance di source/baseline dan jalur aktif yang diperlukan. Kini12 build inputs:9 source dan3 tests; baseline tidak dikompilasi.

- Baru: source/AdmissionLifetime.cs, source/R3Native.cs, static-tests/R3Tests.cs.
- NativeDeclarations.cs: tambahan GetCurrentProcess; ABI/declarations lama tetap.
- NativeAtomicPlatform.cs, SyntheticFixture.cs, PriorTests.cs, R2Tests.cs: root/fixed fixture/build/output filename adjustments; assertions tetap.
- Core.cs, LifecycleModel.cs, LegacyRegression.cs, AtomicProtocol.cs: parser/model/negative checks/old guard tetap. LegacyRegression content identik copied baseline.

build-run1.json memuat hash12 inputs/3 binaries; inventory/manifest.json final memuat relative path, bytes dan SHA256 root kecuali dirinya sendiri. Source hashes dicek pasca-build/review/audit. Hanya dua repository reports dibuat; implementation/evidence tetap disposable.

## D. Existing unresolved security blocker

Lifetime contradiction R2 diselesaikan secara statis: unknown identity bukan alasan otomatis menahan owned job handle tanpa batas ketika independent exclusive scope terbukti.

Runtime prerequisite yang tersisa: **EXTERNAL_ADMISSION_ACCESS_BOUNDARY_UNPROVEN**. Unnamed/noninherited job dan no local DuplicateHandle belum membuktikan external PROCESS_DUP_HANDLE access ke supervisor tertutup. Tidak ada actual foreign process/duplicate yang diamati; ini gap bukti, bukan exploit terbukti. Fake NoForeignRoute=true tidak mengisi gap OS.

## E. Admission authority model

InvocationOwner terikat object identity, bukan hanya string. Facts: freshness/current-invocation creation/verified limits/no inheritance/no exports/atomic only/fixed executable/no breakaway/no foreign route. Native permit membutuhkan fixed entry/root, no-reparse ancestors, source/binary hashes serta review/prelaunch PASS. Permit tidak diterbitkan.

Candidate baru: satu CreateProcessAtomic site, STARTUPINFOEXW, JOB_LIST0x2000D dan CHILD_PROCESS_POLICY0x2000E, flags0x08080404, bInheritHandles=false, limits0x2008, ActiveProcessLimit1. Fixed synthetic target suspended; verify original handles/image/ctime/membership sebelum resume. Tidak ada create-then-assign fallback; old adapter locked. Tidak ada arbitrary executable/PID/job interface.

A01-A10 menguji source-local policy. NativeAdmissionEvidence.Verify tetap unapproved candidate: structural comments no foreign route tidak cukup untuk mint actual exclusive scope tanpa external-boundary proof.

## F. Exclusive scope versus member identity

Scope: SCOPE_NOT_CREATED, SCOPE_EXCLUSIVE_VERIFIED, SCOPE_EXCLUSIVE_STATIC_ONLY, SCOPE_UNKNOWN, SCOPE_COMPROMISED. Identity: IDENTITY_COMPLETE, IDENTITY_PARTIAL, IDENTITY_UNKNOWN, IDENTITY_CONFLICT.

Actual native state **SCOPE_NOT_CREATED / IDENTITY_UNKNOWN**. Fake exclusive scope diberi STATIC_TEST_VERIFIED dan tidak memberi NativeExclusive. Static-only tidak menjadi OS evidence. Identity observation tidak mengubah scope; compromise sticky walau identity kemudian sukses. Identity conflict saja berbeda dari foreign-admission proof.

| Case | Kondisi | Disposition | Batas klaim |
|---|---|---|---|
| A | Independent exclusive + complete | Owned original/job cleanup; independent exits; close | PASS hanya dengan semua receipts |
| B | Independent exclusive + partial/unknown identity | Preapproved emergency job cleanup/owned close | Identity/exits INCONCLUSIVE; no next launch |
| C | Unknown/compromised scope | Deny launch/security stop; independent original capability saja | No broad job action/PID guess |
| D | No process | Release owned initialization | No fabricated exit |
| CRASH | Supervisor dead | No live cleanup call; conditional OS expectation | No surviving observer/receipt |

## G. Job Object ownership

Candidate menciptakan unnamed job satu kali per invocation, memeriksa noninheritance/exact limits/stable empty membership/supervisor outside job sebelum target. No local named-open/duplicate/foreign assign route; attribute values hidup sampai DeleteProcThreadAttributeList.

Internal custody berbeda dari external authority. Default job descriptor berasal dari creator token; create handle memiliki all-access: [Microsoft Job Object access rights](https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights). Job handles dapat diduplikasi dengan PROCESS_DUP_HANDLE yang sesuai: [DuplicateHandle](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle). Inferensi review: no local duplication code belum menutup external duplication. Tidak dilakukan ACL/token change atau duplication experiment.

## H. Handle custody ledger

Ledger fields: ID/type/owner/creation phase/transfer/borrowed/inherited/duplicated/kill-on-close/dependencies/close attempt/error/disposition. Release callback maksimal sekali. Double/borrowed/foreign close dan pending-wait close ditolak. Transfer harus memiliki next owner; tidak ada finalizer sebagai termination mechanism. Tabel ini design/source schema, bukan actual native receipts.

| Resource | Custody/creation | Allowed disposition |
|---|---|---|
| Job | Own successful CreateJobObject, no transfer | A/B independently scoped close; D empty release; C denies group action |
| Original process | Register valid returned handle before query | Own only; wait dependency zero; close is not exit |
| Primary thread | Register every valid returned handle | Own close once; resume only verified scope/identity/membership |
| Attribute list | Allocation/initialized state separate | Delete only initialized list then free |
| Job-array/child-policy | Own allocation | Keep values until Delete; free afterward |
| Environment block | Explicit owned allocation | Free after create/failure; no credential/Codex env copied |
| Query/limit buffers | Unique ledger records | Bounded finally release; preserve error |
| Fixture FileStream lock | Managed owned handle | Dispose once; pin fixture during session |
| Duplicates | Intended local creation prohibited | External unknown is unowned; do not close; reassess scope |
| Synchronization | None in supervisor; target would own ManualResetEvent | Target NOT RUN; no actual event receipt |
| Completion port | Not used | No acquire/close claimed |

Close failure preserves error and does not suppress independent resource disposition. Candidate temporary buffers and fixture lock are ledgered along with control resources.

## I. Last-handle closure policy

Close request/success, actual last-handle trigger dan independently observed exit adalah hal berbeda. SOLE_OWNED, ADDITIONAL_TRACKED dan UNKNOWN tidak dipersamakan. UNKNOWN tidak memberi LastCloseGuaranteed. Uncontrolled duplicate memerlukan reassessment scope; no false last-close claim.

Verified Case B boleh close owned job tanpa complete identity. Case C tidak mengasumsikan group cleanup aman. No-process cleanup tidak membutuhkan exit receipt. Close failure: once, preserve error, dispose independent resources, stop. [Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) menjelaskan last-close KILL_ON_JOB_CLOSE; documented effect bukan actual R3 exit evidence.

## J. Unknown-membership disposition

S02/S03/H09/D03/D04 menguji emergency cleanup pada independently exclusive **modeled** scope meskipun identity incomplete. S04-S08/D05-D06 menolak group action pada unknown/compromised scope. Engine memisahkan JobTermination/JobClose/OriginalTermination/ReleaseInitialization/StopNext/LastCloseGuaranteed.

API success dan close tidak memberikan exit proof. lifetime/disposition-table.json memuat12 kombinasi utama, termasuk identity conflict/last-unknown/dead supervisor. Incomplete enumeration tidak mint exclusive scope. No observed-PID OpenProcess/kill route.

## K. Partial initialization failure paths

F01-F18 lengkap: evidence/lifetime/partial-initialization.json. Setiap row memiliki known/possible resources, couldExecute, owner, scope, allowed/prohibited action, required evidence dan classification. Ambiguous creation tetap POSSIBLY_CREATED; valid returned handles dicatat sebelum identity queries.

Aturan ownership setiap row: hanya current-invocation-owned returned handle/allocation; borrowed/uncertain handles bukan miliknya. Prohibited setiap row: PID/name targeting, borrowed close, fabricated exit, downstream launch/runtime retry setelah unresolved result. Required evidence setiap row: API/error/returned handles, custody phase, independent scope proof, raw query/wait/close dan durable receipt. EXCLUSIVE_CONDITIONAL di bawah prerequisite design, belum OS-verified.

| Failure | Known resources | Possible resources | Could execute | Scope | Allowed | Final limit |
| --- | --- | --- | --- | --- | --- | --- |
| F01 Job creation fails fixture-lock none NO NOT_CREATED Release only fixture lock RESOURCE_RELEASED_NO_PROCESS |
| F02 Job configuration fails fixture-lock;job none NO OWNED_EMPTY_UNCONFIGURED Close owned empty job; release fixture lock RESOURCE_RELEASED_NO_PROCESS |
| F03 Attribute allocation fails fixture-lock;job attribute allocation if allocation result ambiguous NO EXCLUSIVE_CONDITIONAL Release known allocations; close owned empty job RESOURCE_RELEASED_NO_PROCESS |
| F04 Attribute initialization fails fixture-lock;job;attribute allocation none NO EXCLUSIVE_CONDITIONAL Free allocation; Delete list only if initialization completed; close empty job RESOURCE_RELEASED_NO_PROCESS |
| F05 Job-list update fails fixture-lock;job;initialized attributes;job-array none NO EXCLUSIVE_CONDITIONAL Delete attributes before freeing arrays; close empty owned job RESOURCE_RELEASED_NO_PROCESS |
| F06 Creation returns failure and no handles fixture-lock;job;attributes;job-array;child-policy;environment none only when API failure and all returned handles invalid NO EXCLUSIVE_CONDITIONAL Release owned initialization; no exit claim RESOURCE_RELEASED_NO_PROCESS |
| F07 Creation ambiguous job;initialization;all valid returned handles registered immediately target;missing process/thread handles POSSIBLE; intended CREATE_SUSPENDED is not a receipt EXCLUSIVE_CONDITIONAL Case B job disposition if independently exclusive; original action only with independent capability INCONCLUSIVE |
| F08 Identity collection fails job;original process;thread;initialization uncollected identity/exit NO RESUME AUTHORIZED EXCLUSIVE_CONDITIONAL Case B private-job termination/last-close; bounded original-handle wait if owned INCONCLUSIVE |
| F09 Membership query fails job;original process;thread;initialization unobserved member identities NO RESUME AUTHORIZED EXCLUSIVE_CONDITIONAL Case B emergency disposition; preserve raw query and incomplete identity INCONCLUSIVE |
| F10 Thread handle unavailable job;valid original process;initialization target;thread handle NO RESUME AUTHORIZED EXCLUSIVE_CONDITIONAL Case B owned-job cleanup; release only returned owned handles INCONCLUSIVE |
| F11 Process handle ownership uncertain job;known owned thread/initialization target;unowned or borrowed process handle POSSIBLE EXCLUSIVE_CONDITIONAL No close/wait/terminate on uncertain original; Case B independently verified job only INCONCLUSIVE |
| F12 Resume fails or count ambiguous job;original process;thread;initialization target execution if API/result ambiguous POSSIBLE EXCLUSIVE_CONDITIONAL One emergency scoped job cleanup; no resume retry; preserve raw previous count INCONCLUSIVE |
| F13 Termination request fails job;original process;thread;initialization live target YES IF PREVIOUSLY RESUMED EXCLUSIVE_CONDITIONAL No termination retry; separately authorized finite last-close; bounded wait; retain request failure FAILED_OR_INCONCLUSIVE |
| F14 Exit wait times out job;original process;thread;initialization live/unobserved target POSSIBLE EXCLUSIVE_CONDITIONAL Record WAIT_TIMEOUT; no fake exit code; preapproved last-close; bounded subsequent observation INCONCLUSIVE |
| F15 Exit wait API fails job;original process;thread;initialization live/unobserved target POSSIBLE EXCLUSIVE_CONDITIONAL Record WAIT_FAILED and immediate error; no exit-code API before signal; scoped final disposition INCONCLUSIVE |
| F16 Job handle disposal fails job still unresolved;other owned handles remaining live target if earlier cleanup unconfirmed POSSIBLE EXCLUSIVE_CONDITIONAL Record one failed close; independently dispose remaining resources; stop; no success or hidden close retry BLOCKED |
| F17 Unexpected member observed job;known original handles;initialization;raw observed IDs identity of unexpected member POSSIBLE EXCLUSIVE_IF_IDENTITY_ONLY;COMPROMISED_IF_FOREIGN_ADMISSION_PROVEN Case B only with independent scope; Case C denies job action if foreign admission/provenance breach; never open/kill observed PID INCONCLUSIVE_OR_BLOCKED |
| F18 Last-handle status unknown owned job/control/initialization records additional job handle outside complete ledger POSSIBLE UNKNOWN_IF_UNCONTROLLED_DUPLICATION;OTHERWISE_SEPARATE_SCOPE_PROOF_REQUIRED No last-close guarantee; if exclusive scope independently remains proven, explicit TerminateJob and close owned handle allowed; otherwise Case C INCONCLUSIVE_OR_BLOCKED |

## L. Supervisor crash behavior

Tidak ada deliberate crash experiment. Fake crash menghilangkan live cleanup authority; tidak mengeluarkan termination setelah supervisor dianggap mati. OS expectation memerlukan configured limit dan actual final handle close. Dead supervisor tidak mengamati exit atau menulis receipt baru. Missing receipt unresolved; side effects setelah resume tidak terbukti recoverable. Semua11 windows DESIGN_SPECIFIED; actual crash/last-close proof NOT RUN.

| ID | Window | Conditional OS expectation | Actual exit | Durable evidence |
| --- | --- | --- | --- | --- |
| C01 | before job creation | No private job or target created | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C02 | after job creation | Owned initialization handles close on process death; no target admitted | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C03 | during attribute preparation | Owned initialization handles close on process death; no target admitted | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C04 | during process creation | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C05 | after successful atomic creation | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C06 | before resume | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C07 | after resume | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C08 | during cleanup | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C09 | after termination request | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C10 | before receipt persistence | Conditional KILL_ON_JOB_CLOSE expectation only if configured and the actual last handle closes; atomic admission avoids a deliberate create-then-assign gap | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |
| C11 | with inherited or duplicated job handle still open | Last-close trigger cannot be assumed while another handle survives | NOT RUN; dead supervisor cannot observe or persist new receipts | Only already persisted evidence survives; missing receipt is unresolved, never success |

## M. Disposable implementation changes

AdmissionLifetime: typed owner/scope/identity, immutable facts, native proof boundary, RequireAdmission/Resume, custody ledger, failure classification. Fake/model tidak memperoleh native permit; compromise sticky.

R3Native candidate: fixed guarded entry, hash pinning, no-reparse ancestors, fixture lock, controlled env, intended child restriction, atomic suspended creation, immediate returned-handle custody, finite query/READY/wait bounds dan JSON receipts. Dispose attempts each independent resource once, preserves request/wait/close errors; Case B depends on independently proven NativeExclusive.

Adapter tetap unapproved. Old guard unconditional reject; new entry requires artifacts that do not exist. Production source/.gitignore/startup/DB/state/registry/dependency tidak diubah.

## N. Static test results

Initial full run **229 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT**. Repair cycles0/2; tidak ada failed static evidence dibuang. Console/run receipt exit0 dan actual rows diperiksa.

- prior84-run3.json:84 R tests termasuk17 legacy negatives.
- r2-baseline.json:152 total (84+68),26 R2 faults.
- r3-run1.json:77 added (A10/S10/H12/D12/O8=52, FI25), combined229.

R3Tests memanggil seluruh R2 suite; old negative assertions dipertahankan, LegacyRegression content identik baseline. Semua managed fake/model/source checks, bukan actual Windows cleanup. Zero native control calls/targets.

## O. Fault-injection results

25/25 new scenarios PASS dan26 R2 faults PASS. Setiap new row merekam initial/injected/expected/actual/cleanup authority/attempted downstream request/newLaunch=false/evidence/PASS. Operation names fake/model, bukan Win32 calls. Setiap fault juga menguji finite owned-allocation release dan sticky failed gate terhadap next-stage request.

Expected classification ditentukan terpisah dari engine output; self-reported model Pass tidak dijadikan oracle. Fake crash tidak mengeluarkan live cleanup. Detail evidence/fault-injection/r3-run1.json.

| ID | Fault | Initial | Expected | Actual | Cleanup authorized | New launch | Assertion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FI01 | job-create | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | RESOURCE_RELEASED_NO_PROCESS | RELEASE_OWNED_INITIALIZATION/RESOURCE_RELEASED_NO_PROCESS | True | False | PASS |
| FI02 | job-config | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | RESOURCE_RELEASED_NO_PROCESS | RELEASE_OWNED_INITIALIZATION/RESOURCE_RELEASED_NO_PROCESS | True | False | PASS |
| FI03 | attribute-alloc | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | RESOURCE_RELEASED_NO_PROCESS | RELEASE_OWNED_INITIALIZATION/RESOURCE_RELEASED_NO_PROCESS | True | False | PASS |
| FI04 | attribute-init | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | RESOURCE_RELEASED_NO_PROCESS | RELEASE_OWNED_INITIALIZATION/RESOURCE_RELEASED_NO_PROCESS | True | False | PASS |
| FI05 | attribute-update | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | RESOURCE_RELEASED_NO_PROCESS | RELEASE_OWNED_INITIALIZATION/RESOURCE_RELEASED_NO_PROCESS | True | False | PASS |
| FI06 | ambiguous | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI07 | process-missing | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI08 | thread-missing | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI09 | creation | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI10 | inherited | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | BLOCKED | SECURITY_STOP_SCOPED_ORIGINAL_ONLY/BLOCKED | True | False | PASS |
| FI11 | duplicate | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | BLOCKED | SECURITY_STOP_SCOPED_ORIGINAL_ONLY/BLOCKED | True | False | PASS |
| FI12 | foreign | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | BLOCKED | SECURITY_STOP_SCOPED_ORIGINAL_ONLY/BLOCKED | True | False | PASS |
| FI13 | truncated | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI14 | query | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI15 | unexpected | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI16 | identity | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI17 | resume | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI18 | terminate | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | FAILED | AUTHORIZED_PRIVATE_JOB_DISPOSITION/FAILED | True | False | PASS |
| FI19 | timeout | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI20 | wait-failed | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI21 | last-unknown | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI22 | partial-exception | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI23 | crash | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | SUPERVISOR_UNAVAILABLE_OS_LAST_CLOSE_EXPECTATION_ONLY/INCONCLUSIVE | False | False | PASS |
| FI24 | receipt-loss | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |
| FI25 | downstream | CREATED_SUSPENDED/SCOPE_EXCLUSIVE_VERIFIED | INCONCLUSIVE | AUTHORIZED_PRIVATE_JOB_DISPOSITION/INCONCLUSIVE | True | False | PASS |

## P. C# build results

Existing compiler C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe version14.8.10001.0, valid Microsoft signature; SHA256 ECA02E6B15CDE93009A59A3D129D5A77FB5008F2E1CF62CF573B6737C747ECC3. Explicit existing mscorlib/System/System.Core/System.Web.Extensions; no install/restore.12 reviewed inputs per /main; baseline excluded. Flags /noconfig /nostdlib+ /target:exe /platform:x64 /checked+ /optimize+ /warn:4 /warnaserror+. Three builds exit0, no diagnostics. Only new static binary executed; native/fixture unexecuted.

| Binary | Entry point | Exit | SHA256 |
| --- | --- | --- | --- |
| s16br3-static.exe | S16BR.R3Tests | 0 | DC4FC88E9AB550A3E66EDE45045825396ABB324A31B98A8812461F0B061AC968 |
| s16br3-native.exe | S16BR.NativeBridge | 0 | 5E213D109444825B1EA2C8BE8517B9374BB9493A9F68F3831CB2E773F29A2948 |
| synthetic-fixture.exe | S16BR.SyntheticFixture | 0 | 029B4675744F8D4D21A41E31F5ABA3FAC6ED0B96952B6E2D1805ACE10D0FEA77 |

| Active input | SHA256 |
| --- | --- |
| source\AdmissionLifetime.cs | 3F9CC0E7B5C2B03A47DAD8798404DFB49E860D8E990F161BFA8BB924C8BC190B |
| source\AtomicProtocol.cs | 72D1F4CF2E83E76EFE2C39EF352BE413B0E9EF936C5518BEBE3D4C92EBCDE997 |
| source\Core.cs | 599625D3FE42D15E2583AC67B68FE6AA72F90762C52B62CB080E6D377A331C07 |
| source\LegacyRegression.cs | FBEE7C76B9F1CA0F6913E997D7C53E4B19DCE75B040E8288F432F4802561F763 |
| source\LifecycleModel.cs | E84F9581A1EE3E7EA8393F471D0C8E34E01EDDB9D11711792BD67BC342786364 |
| source\NativeAtomicPlatform.cs | 9D1CCB7370193D7C211455AD11B8511DEC59710162E7AC4A892F1F236F6E5F70 |
| source\NativeDeclarations.cs | BDC210C8979EFBC2B9BCBA693764940DF9BA28E9BDE1E3E695CA5048D78F996D |
| source\R3Native.cs | 4F5542CC48C847092BDB41446D8A74FC9286649C4B488E2815A1D4B514376F8D |
| source\SyntheticFixture.cs | 934F272FB009CBE6EA103F75B7F6D40037851624F388EE887453044DABADE5EC |
| static-tests\PriorTests.cs | 8B6D4C212230A3E47C770D2FFDCCC2A0E240144555C99E5FAFF274D8046FDE4E |
| static-tests\R2Tests.cs | C621BC071653B62D7826805FA753E12A924D4908405969796F6CA757F9C7F34D |
| static-tests\R3Tests.cs | 8A46B2A4AB3AD54E4DD9D88BB7CA58750ADF460E6D3EBEB90756760B57ECAFD9 |

## Q. Independent safety review

**SAFETY_REVIEW_INCONCLUSIVE**. Distinct second pass atas source/native declarations/guards/hashes/actual receipts setelah static validation. Dilakukan agent yang sama, bukan separate human/third-party/sub-agent claim. Review #1/#3/#4/#7/#13/#19 menghalangi authorization runtime.

Source-local no-export/no-inherit tidak membuktikan external PROCESS_DUP_HANDLE exclusion. No exploit/duplication/security change dilakukan. Ketidakpastian tidak ditimpa static PASS; full20 questions persisted.

| No | Question | Evidence | Finding |
| --- | --- | --- | --- |
| 1 | Scope established before creation | INCONCLUSIVE | Local source ordering does so conditionally, but exclusive external admission is not established by the candidate proof. |
| 2 | Private job | SOURCE_VERIFIED | Current-invocation unnamed CreateJobObjectW(NULL,NULL); no named OpenJobObject path. No OS job created in R3. |
| 3 | Admission restricted | INCONCLUSIVE | Fixed atomic route, false inheritance, active limit1 and child restriction exist in source. External handle acquisition is not ruled out. |
| 4 | Can external process join | INCONCLUSIVE | No route in bridge source. A separate process with PROCESS_DUP_HANDLE may duplicate a job handle; no access-boundary evidence excludes this. No exploit performed. |
| 5 | Can target break away | SOURCE_VERIFIED | Exact intended flags0x2008 exclude both breakaway flags; fixed synthetic source spawns no descendants. OS behavior NOT RUN. |
| 6 | Unexpected job-handle inheritance | STATIC_TEST_VERIFIED | False bInheritHandles, source flag checks, A08/H05 and preserved negatives. No OS inheritance receipt. |
| 7 | Duplicate handle can keep job alive | INCONCLUSIVE | Ledger detects modeled duplicates; no duplicate API in bridge. External duplication and actual last-handle status are not proven absent. |
| 8 | Execution before containment | SOURCE_VERIFIED | One new-adapter atomic CreateProcessAtomic site, CREATE_SUSPENDED; no create-then-assign fallback. Old adapter remains locked. |
| 9 | Original handle lost | STATIC_TEST_VERIFIED | Every valid returned handle registered before identity queries; F26 prior regression and partial-init models preserve creation uncertainty. |
| 10 | Cleanup scope versus identity | STATIC_TEST_VERIFIED | Separate enums, Case A/B/C/D/CRASH, S01-S10 and D01-D12. |
| 11 | Unknown identity without PID guess | STATIC_TEST_VERIFIED | No OpenProcess, taskkill, name kill, or per-observed-PID action in new adapter. Case B uses conditional private job authority. |
| 12 | Private-job cleanup without every PID receipt | STATIC_TEST_VERIFIED | S02/S03/H09/D03/D04 permit scope-based emergency disposition but classify incomplete accounting INCONCLUSIVE. |
| 13 | Unsupported last-handle assumption | INCONCLUSIVE | Model explicitly separates sole/tracked/unknown and close from exit. Native candidate assumes no outside duplicate without verifying the process access boundary. |
| 14 | Cleanup versus exit | STATIC_TEST_VERIFIED | D07-D11/H11 and preserved tests require independent signal/code receipts; native not executed. |
| 15 | Partial init uncontrolled execution | SOURCE_VERIFIED | Atomic suspended admission, immediate handle registration, finite owned disposal; actual failure cleanup remains NOT RUN. |
| 16 | Crash behavior accurate | DESIGN_SPECIFIED | 11 windows; fake crash issues no live cleanup calls; no deliberate crash test and no durable recovery proof. |
| 17 | Native guards before review | STATIC_TEST_VERIFIED | Old unconditional guards preserved; O05/O08 reject fake promotion; no authorization.json/build-gate.json exists; native binary never invoked. |
| 18 | Failure permits next launch | STATIC_TEST_VERIFIED | Persistent GateEngine failures and FI01-FI25 downstream request checks; H2 additionally requires H1 accepted PASS and one-shot issue file. |
| 19 | Unrelated process targetable | INCONCLUSIVE | No targeting path in source; if external admission were possible, whole-job cleanup could affect a foreign member. Therefore no native launch authorized. |
| 20 | Results classified accurately | SOURCE_VERIFIED | 229 static PASS and 25 new faults are managed/model evidence only. Native H1/H2, job membership, identity and exit are NOT RUN. |

## R. Runtime feasibility gate

**HOST_ONLY_RUNTIME_NOT_AUTHORIZED**. Prelaunch18 conditions tersimpan. Exclusive ownership/no foreign admission/actual last-handle assurance dan review PASS belum terpenuhi. Source fixed/atomic/finite properties tidak menggantikan prerequisite tersebut.

authorization.json/build-gate.json tidak dibuat. Tidak ada permit, H1/H2 issue file, native invocation/job/target/control handle. Tidak mencoba probe untuk melewati gate; mandatory uncertainty menghentikan advancement.

## S. Host-only test results or NOT RUN

| Test | Result | Targets | Resume | Cleanup | Exit |
|---|---|---|---|---|---|
| H1 suspended atomic/original cleanup | NOT RUN | 0 | 0 | NOT RUN | NOT RUN |
| H2 running fixed target/job cleanup | NOT RUN | 0 | 0 | NOT RUN | NOT RUN |

No retries/detached target/descendant/MXC/app-server/worker/crash experiment. Fixture secondary30s self-expiration tetap source-only, bukan safety justification.

## T. Termination and exit evidence

Native TerminateProcess0/TerminateJobObject0/control CloseHandle0/target wait0. H1/H2 exit evidence NOT RUN. Native handles0 acquired/0 outstanding karena tidak ada acquisition; bukan live-target cleanup proof.

Compiler invocations3 exit0, managed static runner1 exit0. Tool/shell infrastructure bukan synthetic targets dan tidak ditargetkan. Fake receipts tidak dipromosikan menjadi exit receipts; zero new targets tidak menyelesaikan historical PIDs.

## U. Source/system integrity

Before-reports:443 existing AI files unchanged. Final audit membandingkan semua443 lagi dengan mengecualikan hanya dua authorized reports; expected final445. Initial git inventory120 entries/preexisting Asset_3D_Model work dipertahankan, tanpa reset/overwrite. Current asset tree tidak diklaim sama dengan older419-file R2 baseline.

Protected R2=85/R=54/B=79/installed Codex=50 dan16 fixture roots=2124; total20 roots/2392 files. Hermes3D647 tracked hashes unchanged dalam accessible scope.45 candidate files already missing, bukan deletion R3. AI snapshot excludes .git/directories named node_modules; protected snapshots penuh. Hermes tracked scope, bukan whole disk/OS attestation.

Production/S12-S15/DB/registry/state/existing reviews unchanged dalam snapshot. Action audit: no elevation/ACL/UAC/Defender/firewall/registry/service/task/WSL/global-config/PATH/install/credential/provider/inference/paid API/broad kill. Host harness network calls0; Microsoft docs dibaca melalui web tool, sehingga tidak diklaim seluruh aktivitas asisten tanpa web access.

Final report hashes/delta: evidence/audit/final-audit.json; inventory/manifest.json excludes itself. Reports tidak embed manifest hash untuk menghindari circular hash. Documentation command delivery sempat gagal sebelum proses dibuat (OS206 dan shell parse); tidak ada build/test failure atau repair cycle akibat itu.

## V. Historical PID and Codex candidate status

23376 dan23644 tetap HISTORICAL_PROCESS_IDENTITY_UNRESOLVED; tidak ditargetkan, tidak menganggap lookup kosong sebagai historical exit. Tidak ada relevant change untuk mengulang investigasi.

C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s4-AJ7ErW\candidate\bin\codex.exe absent: MXC_PINNED_RUNTIME_BASELINE_UNAVAILABLE.45 missing paths sudah direkonsiliasi R2; read-only availability check saja. No restore/substitution/global Codex execution. Installed Codex50 accessible files unchanged.

## W. Remaining safety blockers

External admission/handle-acquisition boundary dan actual last-handle assurance belum proven. Failure model membutuhkan independent exclusivity; tidak menghasilkannya dari incomplete enumeration. Zero target creations, tidak ada R3 process residue.

Host-crash runtime, pinned MXC/nested jobs, hostile/arbitrary descendants, production supervisor/durable recovery, output fencing, app-server, credentials, entitlement dan included-only billing enforcement belum verified. No expenditure bukan billing protection proof. R3-54 sampai62 tidak dipromosikan; real worker BLOCKED.

## X. Final decision

**STATIC_PASS_RUNTIME_BLOCKED**. Model/regressions/fault checks PASS; native prerequisite belum proven, H1/H2 tidak diotorisasi.62 gate rows di report pendamping/evidence/security-gates.json.

**M02-02S16B-R3 STATIC_PASS — ADMISSION AND HANDLE-LIFETIME MODEL VERIFIED STATICALLY — HOST-ONLY RUNTIME NOT AUTHORIZED — REAL WORKER BLOCKED.**

## Y. Recommended next bounded step

Satu langkah: **read-only** review/validasi batas akses handle supervisor/job dan admission threat model untuk membuktikan atau secara eksplisit membatasi NoForeignRoute sebelum safety review ulang. Tidak memulai native test, mengubah ACL atau restore MXC di R3.

Owner direction terpisah hanya jika narrowing ke cooperative trusted-host boundary atau access-control change diajukan. Tidak ada routine approval ditunggu. S16C/S17 tidak dimulai; missing candidate tetap future MXC prerequisite tanpa substitusi otomatis.

