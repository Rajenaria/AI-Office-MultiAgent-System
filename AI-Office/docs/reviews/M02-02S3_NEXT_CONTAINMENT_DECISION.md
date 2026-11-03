# M02-02S3 — Next Containment Decision

Tanggal:29 Oktober2026, Asia/Jakarta. Evidence: [MXC Version Compatibility Report](M02-02S3_MXC_VERSION_COMPATIBILITY_REPORT.md). Semua tindakan masa depan di bawah adalah proposal; S3 hanya source review dan dua laporan.

## 1. Executive recommendation

**Primary: Option B — Version Compatibility Validation. Fallback: Option C — Official Support.**

Ajukan task terpisah **M02-02S4 — Isolated Codex0.164.0 MXC Startup Compatibility Validation**: official stable candidate side-by-side, existing CLI/credentials/config tetap, source-backed host startup prerequisites, paling banyak satu fixed sandbox-only echo. **Belum dimulai dan belum diotorisasi oleh S3.**

Alasan konkret: PR #54027 berada pada standalone MXC path, absent pada source0.162.1 dan present pada0.164.0; ancestry mendukung inclusion. New source membutuhkan SystemDrive/LOCALAPPDATA pada parent process. Tidak ada alasan lagi untuk general-purpose source investigation tanpa pertanyaan baru, tetapi root cause203 belum terbukti dan success candidate belum diketahui.

## 2. Current evidence status

| Evidence | Status |
|---|---|
| Installed old native binary identity | Actual hash ulang cocok; package metadata0.162.1/native win32-x64 |
| Release-source gap | RELEASE SOURCE VERIFIED; relevant changes absent old/present new |
| New release inclusion | COMMIT ANCESTRY VERIFIED untuk #54027/#54069 |
| Installed executable embeds exact tagged code | BINARY CONTENT NOT INDEPENDENTLY PROVEN; metadata/source correlation saja |
| #54027 applicability | Direct standalone source path; host prerequisites jelas |
| #54069 applicability | Indirect remote-MCP context; bukan observed standalone branch |
| Error203 causality | CONSISTENT BUT UNPROVEN; exact native operation/key UNKNOWN |
| Current MXC startup | FAILED pada S; S1/S2/S3 no retest |
| Direct OS isolation / real runtime | NOT VERIFIED; real worker BLOCKED |

0.164.0 juga berisi SDK migration #55378 dan policy changes. Future test merupakan candidate-configuration validation, bukan controlled proof bahwa satu PR memperbaiki error lama.

## 3. Four-option decision matrix

| Option | Source-backed justification | Batas | Keputusan |
|---|---|---|---|
| A — Current0.162.1 targeted environment retest | Dua omitted host startup variables kini punya concrete relevance dari later code | Old transport tidak punya host-value repair/guard; success/failure tidak memvalidasi later SDK; tidak dipilih sebagai automatic additional attempt | NOT PRIMARY; tidak dieksekusi/diikutkan dalam proposed S4 |
| B — Official0.164.0 compatibility validation | Relevant fix absent old/present stable new; same standalone path; specific prerequisite | Requires separately approved official artifact acquisition/provenance, disposable profile, one launch, rollback; regression risk tetap | **PRIMARY** |
| C — Official support | Existing S2 draft siap; supplement S3 mempersempit applicability/diagnostic questions | Explicit Owner-controlled submission; tidak mengirim raw buffer/credentials | **FALLBACK** bila safe preflight/one test gagal |
| D — WSL2 feasibility | Bisa menilai alternate boundary bila native path tidak layak | No immediate distro startup; mounts/interop/credentials/state/process/network belum terbukti | DEFERRED; bukan fallback otomatis yang dipilih |

## 4. Recommended primary next task

**M02-02S4 — Isolated Codex0.164.0 MXC Startup Compatibility Validation.**

Concrete question: “Dapatkah official0.164.0 candidate, dengan required host SystemDrive/LOCALAPPDATA tersedia, isolated synthetic home/cwd, explicit MXC dan managed requirements, menghasilkan MXC_OK/exit0 tanpa auth, inference, setup atau weaker fallback?”

Acceptance hanya **MXC STARTUP VERIFIED FOR THE TESTED CONFIGURATION** bila exit0 dan expected output terbukti. Tidak menerima changed error, version/help success atau recorder exit0 sebagai startup PASS. Startup success tidak membuka OS containment acceptance, M02-03 atau worker.

## 5. Recommended fallback

**Option C — Official Support** jika artifact/provenance/auth/security/lifecycle prerequisite tidak aman atau satu actual candidate command gagal. Stop setelah kegagalan; tidak berpindah ke current binary, alternate version/cwd/profile atau legacy sandbox dalam task yang sama.

Gunakan S2 standalone support draft tanpa mengedit file tersebut. Supplement S3 di report section19 memperjelas old/new source/ancestry, parent startup prerequisites dan SDK migration. Tambahkan future result hanya jika ada dan tersanitasi. External submission memerlukan Owner approval tersendiri; tidak dianggap authorized dari proposal S4 atau source review ini.

## 6. Exact proposed scope

1. Satu release target **rust-v0.164.0**, bukan latest/preview, dan satu native win32-x64 package candidate.
2. Preserve current0.162.1 installation; future artifact di directory disposable khusus, dipanggil melalui absolute path, bukan installed globally.
3. Read-only package/startup-path preflight dan provenance. Bila safe sandbox-only no-credential behavior tidak dapat dipastikan, stop sebelum invocation.
4. Fresh test-owned root/home/cwd/output, bukan retained S fixture dan bukan real project.
5. Paling banyak **satu MXC sandbox invocation**, fixed trusted system cmd echo. Tidak mengulang after failure/timeout/different error.
6. Capture bounded sanitized result, exact ownership/lifetime dan unchanged-file checks, lalu stop.

Tidak mencakup root-cause proof, real model, OS negative tests, task orchestration, adapter/API implementation, destructive cleanup atau global CLI replacement.

## 7. Allowed operations bila future scope disetujui

- Read required reports, official docs/source dan metadata.
- Acquire hanya selected official release archive dan verify provenance/digest; ini memerlukan izin baru karena **S3 tidak mengotorisasi download executable**.
- Inspect archive member paths sebelum extraction; reject absolute/traversal/unsafe links dan targets di luar owned root; tidak memakai installer.
- Extract selected package side-by-side tanpa mengubah installed directories, PATH, shims, services, registry atau updater.
- Inspect package layout/executable/helper metadata tanpa menjalankan helpers langsung. Candidate `--version`/`sandbox --help` hanya jika explicit future preflight scope memasukkannya dan no-auth startup telah direview; bukan additional MXC tests.
- Prepare minimal synthetic home/config/evidence, one harmless compatibility invocation dan bounded owned-process accounting.

Allowed list ini adalah usulan konkret untuk Owner, bukan tindakan yang telah dilakukan.

## 8. Prohibited operations

No global npm install/update, replacement shims/binary, arbitrary alternate build, upstream build/test scripts, authentication/login/logout/OAuth, real/default Codex home/state copying, raw environment/SDK log dumps, model/app-server/exec/SDK worker, real project write, actual DB/credentials, paidAPI/credits, security/ACL/firewall/user/feature/admin changes, new VM/container/WSL, bypass helper guard, managed-policy removal, unrestricted/legacy fallback, repeated probe, retained-fixture deletion, unrelated PID kill, Gitinit, Hermes/VisualLab edit atau automatic support submission.

Jika platform membutuhkan salah satu tindakan tersebut, stop dan ajukan scope lain; jangan memperluas scope lewat interpretasi.

## 9. Official binary/version provenance requirements

Official target: [rust-v0.164.0 release](https://github.com/openai/codex/releases/tag/rust-v0.164.0), non-prerelease, published23 Oct2026UTC. Source commit `6aaac694803004a63c6f393d153c96d22521a6b9`.

Verified metadata candidate archive: **codex-package-x86_64-pc-windows-msvc.tar.gz**,167,144,380 bytes; release digest **sha256:700116be3143576d006467af8576f7f4c9dada1feddfdb7f69743bfde0997018**. **Tidak diunduh pada S3.** Metadata/digest harus diverifikasi ulang sebelum future acquisition. Jangan memilih app-server package, symbols atau platform lain secara diam-diam.

Future verification: official source/asset association, archive hash, safe member layout, native target architecture, package version, main executable hash/Authenticode expected publisher, required resource paths, dan sandbox-only startup behavior. Archive digest bukan hash executable; record keduanya berbeda. Signature/digest tidak membuktikan keselamatan seluruh runtime.

Jangan menjalankan candidate bila signature/version/layout berubah, extraction keluar root, dependency hilang atau safe provenance tidak bisa dipastikan. Tidak mengunduh file “repair” tambahan, memasang runtime atau menjalankan unknown helper untuk melanjutkan.

## 10. Disposable fixture requirements

Fresh canonical OS-temp child dengan prefix task-specific, verified owner/realpath/identity dan no-reparse ancestors/entries. Home harus sudah ada sebelum invocation. Cwd kosong; config/evidence berada di owned root; tidak menyalin project code, database, marker, auth, sessions atau skills.

Minimum future structure: candidate package, empty synthetic home, empty test workspace, bounded evidence. Validasi paths sebelum setiap write/extraction/cleanup; preserve S/S1/S2 retained roots. Default akhir adalah **retain for review**, bukan recursive deletion. Candidate/data bukan asset bernilai dan bukan actual account home.

## 11. Environment handling dan redaction requirements

Preserve actual nonempty Unicode **SystemDrive dan LOCALAPPDATA pada parent native Codex process**: source0.164.0 encode membaca host std::env::var, bukan hanya intended child env. Tidak cukup menambah keys ke child map jika parent tidak memilikinya. Pertahankan Windows startup inputs yang direview, termasuk actual host SystemRoot/WINDIR; jangan menebak drive/profile paths.

Explicit secret-free allowlist, bukan entire environment inheritance. TEMP/TMP dan CODEX_HOME boleh menunjuk fresh disposable root **hanya jika future scope mengizinkan child-scoped overrides**; tidak mengubah process/session/global settings milik Owner. PATH dibatasi pada reviewed package/system paths. USERPROFILE/PATH bukan unconditional new encode guards; kebutuhan tambahan harus dibuktikan, bukan diperluas tanpa alasan.

No provider secrets, NODE_OPTIONS, active runtime launch context atau arbitrary inherited variables. Record key presence/classification saja, no values/personal paths. Keep target env nonempty/explicit; jangan sengaja mengaktifkan SDK profile-default empty-env branch untuk eksperimen ini. Required host values tidak membuktikan bahwa sandbox tak bisa mengakses credential files—gate credential isolation tetap terpisah.

## 12. Managed configuration requirements

Tetap gunakan explicit `-c windows.sandbox=mxc`, `--include-managed-config`, `--permission-profile :workspace`. Review actual candidate help/source sebelum invocation. Jangan mengubah managed requirements atau global config; applicable policy collision menghentikan test.

Conceptual fixed command, **belum dijalankan**:

```text
<VERIFIED_0_164_0_NATIVE_CODEX> -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- <SYSTEM_CMD> /d /c echo MXC_OK
```

`:workspace` hanya bounded compatibility profile; tidak menyatakan deny reads di luar A. Effective profile evidence harus dibedakan dari requested argv. Tidak memberi kebebasan mengganti profile ke unrestricted saat gagal. Temporary-home alias guard tetap dihormati; warning dicatat terpisah, tidak dibypass.

## 13. Authentication dan billing restrictions

Empty pre-created synthetic CODEX_HOME dengan ephemeral credential-store configuration, tanpa auth copying, no login/session/model/account calls. Review candidate config/bootstrap source agar actual auth store atau active account home tidak dibuka; bila tidak dapat memastikan safe startup, stop sebelum run. Jangan menonaktifkan managed config untuk menghindari ketidakpastian tersebut.

PaidAPI OFF, purchased-credit fallback prohibited. Subscription entitlement/model availability UNKNOWN dan included-only billing cap NOT VERIFIED tetap berlaku. Startup echo tidak menguji eligibility/billing; tidak ada izin menuju inference bila sukses.

## 14. Negative sandbox tests needed afterward

Setelah future startup success, task OS-containment terpisah masih perlu:

- Effective minimal permissions, positive A read/write dan direct negative B read/write dengan baseline host accessibility.
- Fake private state/credentials read/write denial, alias/junction/hardlink/traversal boundaries.
- Newly created denied files dan process-start snapshot/race behavior.
- Cooperative inheritance/lifetime dan hostile/detached-child limitations.
- Network/loopback/proxy behavior sesuai policy dengan safe positive controls.
- Owned-process cleanup, intact canaries dan authoritative state outside worker.

Tidak menjalankan probe ini otomatis dalam single startup task; startup PASS bukan OS acceptance.

## 15. Rollback/retention plan untuk future candidate

Sebelum acquisition/invocation, record installed0.162.1 hash/package identity serta protected source/config metadata yang aman. Jangan menyentuh installation atau global env/config sejak awal, sehingga rollback berarti stop memakai side-by-side candidate, bukan downgrade/reinstall.

Saat gagal: stop owned process sesuai verified lifecycle, preserve bounded outputs dan exact failure, jangan retry. Default retain fresh evidence/candidate di owned root; report paths/status tersamarkan. Tidak menghapus retained old fixtures atau menjalankan recursive cleanup yang pernah ditolak. Any later deletion membutuhkan exact ownership/path checks dan effective authorization, tanpa bypass.

Setelah selesai, confirm existing installation/hash dan protected files tetap. Jangan menjalankan old CLI sebagai “recovery test”; tidak diperlukan untuk membuktikan unchanged bytes.

## 16. Stop conditions

- Provenance/version/signature/layout tidak cocok, unsafe archive paths atau unreviewed helper requirement.
- Startup required variable missing/empty/non-Unicode; tidak manufacture value atau dump environment.
- Actual credential/profile/session read, auth/model/provider request, security/install/admin prompt.
- Managed restriction, implicit fallback, disabled isolation, valuable/non-owned cwd atau redirected fixture.
- Process ownership/lifetime/cleanup tidak dapat dipastikan; jangan meluncurkan bila safe deadline accounting belum jelas.
- Satu compatibility command telah dijalankan, apa pun hasilnya; no second attempt.
- Timeout/output bound/new error, unexpected background process atau write di luar approved disposable paths.

Target future timeout usulan10s dan output limit64KiB harus direview sebelum run; gunakan hidden bounded launcher dan explicit ownership. Tidak menyamakan TTL/root-PID disappearance dengan hostile tree proof. Tidak boleh membunuh proses berdasarkan nama atau stale PID.

## 17. Owner approvals needed

Owner harus secara eksplisit menyetujui **future side-by-side acquisition/extraction/verification official0.164.0**, dedicated disposable paths, child-scoped nonsecret startup environment/home, dan **maksimum satu sandbox-only echo** setelah preflight. Candidate preflight version/help perlu disebut jika akan dijalankan. Tidak ada global update/install/security/auth/worker permission yang diikutkan.

Approval untuk external support submission adalah keputusan terpisah tentang destination/content, bukan otomatis dari fallback recommendation. Tidak meminta izin ulang untuk source review S3 yang sudah selesai. Dasar stop/approval adalah instruksi S3 sections6/7/15/16/24; no update atau retest diotorisasi sekarang.

## 18. Remaining M02-03 blockers dan actual safety checks

Host path policy, atomic issuance satu authority, synthetic approvals dan tested supervision tetap historical HOST_VERIFIED. Actual OS filesystem/private state/credentials/network/hostile tree, app-server protocol, real approvals/cancellation, runtime skills, durable production lease/crash recovery/cross-processdedup dan auditability tetap NOT VERIFIED. Entitlement/model availability UNKNOWN; included-only cap NOT VERIFIED; Paid API/credits tetap prohibited. **REAL WORKER BLOCKED.**

Actual S3 pre/post comparison: **108/108 existing AI-Office hashes unchanged**, final inventory **110 files** di luar node_modules; hanya dua report S3 baru. Semua source/contracts/schema/security harness/package/config/tests/screenshots/prior reports, termasuk S2 standalone support draft, tercakup baseline. Historical fixture **22/22+22/22**, S fixture **6/6**, Hermes tracked **647/647** hashes unchanged; semua retained. Hermes HEAD/status pre-existing dipertahankan. External VisualLab assets tidak checksum-audited dan tidak ditulis.

S3 tidak menjalankan tests/version/help/Codex/sandbox/helper/WSL/model/app-server, tidak mengunduh executable atau membuat fixture, tidak menyentuh credentials/OS/env/home/managedpolicy/globalconfig, tidak menghapus data/kill process, dan tidak submit support. Source/PR/release text hanya dibaca melalui HTTP GET ke official public sources. Source retrieval query yang diperbaiki tidak dipakai sebagai evidence sebelum successful read.

## 19. Final recommendation

**Satu primaryB, satu fallbackC.** Source gap dan specific parent startup prerequisites cukup untuk scoped future candidate validation; tidak perlu mengulang general investigation. 0.164.0 tidak dinyatakan sebagai guaranteed fix. Jika one safe candidate test tidak dapat dilakukan atau gagal, hentikan jalur eksperimen dan gunakan official support dengan exact new evidence, bukan another blind retry.

**M02-02S3 COMPLETE — MXC VERSION COMPATIBILITY GAP IDENTIFIED — BOUNDED FOLLOW-UP RECOMMENDED — REAL CODEX WORKER BLOCKED.**
