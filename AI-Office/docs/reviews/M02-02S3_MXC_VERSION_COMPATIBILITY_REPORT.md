# M02-02S3 — MXC Version Compatibility Report

Tanggal audit/source access: **29 Oktober 2026, Asia/Jakarta**. Companion: [Next Containment Decision](M02-02S3_NEXT_CONTAINMENT_DECISION.md). Audit source-level read-only; tidak ada runtime test atau update.

## 1. Executive summary

**COMPATIBILITY GAP CONFIRMED — BOUNDED TEST RECOMMENDED.** Source release 0.162.1 tidak memuat perubahan PR #54027 dan #54069; source 0.164.0 memuat keduanya dan commit ancestry mengonfirmasi inclusion. PR #54027 **DIRECTLY APPLICABLE secara source path** pada standalone `codex sandbox` yang memilih MXC. PR #54069 **INDIRECTLY RELEVANT**, bukan direct fix untuk invocation standalone yang diamati.

Gap ini membenarkan **primary Option B — Version Compatibility Validation** terhadap official stable 0.164.0 secara side-by-side, dengan supported host startup variables dan satu bounded sandbox-only echo bila kelak diotorisasi. **Fallback Option C — Official Support**, memakai S2 draft plus supplement S3. Tidak memilih blind retry current binary atau WSL2 sebagai primary/fallback tahap ini.

**Tidak ada bukti error 203 pasti diperbaiki.** Environment enam-key lama tidak boleh dipakai begitu saja pada versi baru: transport 0.164.0 membaca SystemDrive/LOCALAPPDATA dari proses Codex sendiri dan gagal lebih awal bila hilang, kosong, atau non-Unicode. Ini bukan mekanisme yang menciptakan host variable yang tidak ada.

0.164.0 juga membawa SDK migration PR #55378 dan perubahan policy resolution. Future candidate test bukan eksperimen satu perubahan untuk membuktikan sebab; hasilnya hanya compatibility untuk exact candidate configuration. **Real Codex worker BLOCKED.**

## 2. Installed CLI baseline dan historical evidence

Sepuluh required reports tersedia dan ditinjau untuk context/gates; fokus pada kedua laporan S, S1 dan S2. Tidak mengulangi audit arsitektur atau mengedit laporan lama. Context M02-01, host harness dan R01 dipertahankan sebagai historical evidence.

| Item | Evidence aktual / batas |
|---|---|
| Windows/Node/npm | S/S1 discovery: Home Single Language x64, build 26300.9711/26H2; Node 24.21.0/npm 11.19.0. Tidak menjalankan discovery versi baru |
| Native package | Metadata dibaca ulang: base 0.162.1; platform 0.162.1-win32-x64, win32/x64 |
| Main executable | Ada, non-reparse entry, 333,479,728 bytes; dipilih langsung, bukan shim |
| Actual SHA-256 S3 | `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A`, sama dengan S |
| Actual --version | Historical S receipt codex-cli 0.162.1; binary tidak dieksekusi ulang pada S3 |
| Architecture/signature | S1/S2 metadata: PE AMD64/Authenticode Valid; tidak dipromosikan menjadi fresh PE/signature inspection S3 |
| Original launch | Explicit MXC, --include-managed-config, --permission-profile :workspace, fixed cmd /d /c echo MXC_OK |
| Result | Retained receipt dibaca: exit 1, stdout kosong, 1322 ms, error 203 dan helper warning |
| Home/cwd | Retained synthetic workspace ada; manifest mencatat pre-created home dengan config ephemeral credential-store saja |
| Retention | Enam file S ada, inspected tree tanpa reparse entries; synthetic sandbox.log tetap tidak ada |
| Additional launches | S1=0, S2=0, **S3=0**; tidak ada successful startup result baru |

Original recorder input environment tepat enam key: SystemRoot, WINDIR, PATH, TEMP, TMP, CODEX_HOME. SystemDrive/LOCALAPPDATA tidak diteruskan. Ini bukan full inherited environment dan bukan dump final helper/target environment.

Redacted historical argv:

```text
<NATIVE_CODEX> -c windows.sandbox=mxc sandbox --include-managed-config --permission-profile :workspace -- <SYSTEM_CMD> /d /c echo MXC_OK
```

Exact error:

```text
MXC launcher: CreateProcessInSandbox failed with error code 203 (0x000000CB).
```

## 3. Official release chronology

Release timestamps berikut UTC, bukan local WIB; accessed 29 Oktober 2026. API menyatakan kedua release bukan draft/prerelease.

| Event | Published/merged UTC | Commit identity |
|---|---|---|
| [rust-v0.162.1](https://github.com/openai/codex/releases/tag/rust-v0.162.1) | 9 Oct 2026 19:44:51Z | Commit `092d3acd6bec3e3a14bdc7e7a2810ab628ab759d`; annotated tag object `7a078f6bb4ce0dc2a81408b334ce52979d92c603` |
| [PR #54027](https://github.com/openai/codex/pull/54027) | 14 Oct 2026 16:31:23Z | `81aee8c86ba2549e53f82ea56f163c3e450fb55a` |
| [PR #54069](https://github.com/openai/codex/pull/54069) | 14 Oct 2026 18:57:01Z | `0fd85b075288c4fee50f0df3e4e4f98f80c693fe` |
| [PR #55378](https://github.com/openai/codex/pull/55378) SDK migration | 19 Oct 2026 20:54:56Z | `c6e29b4fcb1fa1ac127f5fa9346fe3c7022ff091` |
| [rust-v0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0) | 23 Oct 2026 04:48:10Z | Commit `6aaac694803004a63c6f393d153c96d22521a6b9`; annotated tag object `fe3b29455488c2e189e43ad5526a107900c5e1b7` |

Release 0.164.0 changelog mencantumkan ketiga PR. Publication date saja tidak menjadi inclusion proof; tag contents dan ancestry diperiksa terpisah.

## 4. PR #54027 detailed source analysis

Actual changed files:

- `codex-rs/mxc-sandbox/src/lib.rs`: MxcCommand.default_child_env dan create_command_args.
- `codex-rs/mxc-sandbox/src/transport.rs`: encode/decode.
- `codex-rs/mxc-sandbox/src/transport_tests.rs`, `policy_tests.rs`.
- `codex-rs/mxc-sandbox/README.md`.
- `codex-rs/exec-server/tests/exec_process/windows_sandbox.rs`.

Function-level effect, verified against patch dan 0.164.0 source:

| Function/field | Perubahan |
|---|---|
| MxcCommand.default_child_env | serde-default bool menandai original command env empty setelah mengabaikan transport keys |
| create_command_args | Menghitung marker sebelum transport menambah host/bootstrap entries |
| transport::encode | Membaca **host process** SystemDrive dan LOCALAPPDATA; nonempty Unicode required. SystemRoot tambahan hanya untuk default_child_env branch |
| Override handling | Menghapus semua caller-map keys yang eq_ignore_ascii_case dengan required key, lalu memasukkan nilai host; bukan mempercayai caller override yang berbeda case |
| Error handling | std::env::var failure/empty value menghasilkan explicit preparation error `MXC requires nonempty Unicode host <key>` melalui context/`?`, sebelum SDK spawn |
| transport::decode | Scrub transport metadata, decode request, clear bootstrap env bila default_child_env, sehingga SDK dapat memakai default child environment |

Host lookup memakai std::env::var(key); case-insensitive caller-map replacement terlihat eksplisit pada code. Tidak menafsirkan key-name casing sebagai missing-variable evidence. [0.164.0 lib.rs:46–94](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs#L46-L94), [transport.rs:13–39](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/transport.rs#L13-L39).

Patch bukan temp-home repair dan tidak mengubah arg0 alias guard. USERPROFILE/PATH disebut dalam upstream regression expectations/default-env behavior, bukan unconditional host-variable guards dalam encode. Upstream tests hanya dibaca; tidak dijalankan lokal.

## 5. PR #54069 detailed source analysis

Satu changed file: `codex-rs/rmcp-client/src/stdio_server_launcher.rs`. `ExecutorStdioServerLauncher::remote_env_policy` menerima tambahan env map, menambahkan SYSTEMDRIVE/LOCALAPPDATA ke include_only saat explicit remote vars mengaktifkan allowlist, serta mengisi ExecEnvPolicy.set dari env.clone(). Caller meneruskan env ke policy; final overlay tetap untuk older executor behavior. Regression coverage pada file itu diperluas.

Tag comparison: [0.162.1:682–710](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/rmcp-client/src/stdio_server_launcher.rs#L682-L710) vs [0.164.0:682–715](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/rmcp-client/src/stdio_server_launcher.rs#L682-L715).

**INDIRECTLY RELEVANT** untuk broader Windows filtering; **NOT APPLICABLE TO THE OBSERVED PATH secara langsung**. Direct standalone sandbox invocation tidak meluncurkan remote MCP server, sehingga perubahan method ini tidak berada pada call chain yang dipetakan di section 8. Tidak menyebutnya universal app-server fix: app-server/MCP flows yang memakai launcher tersebut dapat terpengaruh, tetapi actual AI Office runtime belum dijalankan.

## 6. Tagged-source inclusion matrix

| Source version | PR #54027 | PR #54069 | Evidence class |
|---|---|---|---|
| rust-v0.162.1 / 092d3acd… | **ABSENT**: tidak ada default_child_env/host injection pada reviewed lib/transport | **ABSENT**: old remote_env_policy signature, allowlist dan empty set | **RELEASE SOURCE VERIFIED**; tidak ada equivalent backport pada relevant tag contents |
| rust-v0.164.0 / 6aaac694… | **PRESENT**, host guards + original-empty semantics tetap ada | **PRESENT**, startup allowlist + override policy | **RELEASE SOURCE VERIFIED; COMMIT ANCESTRY VERIFIED** |
| Installed 0.162.1 binary | Correlation dengan old release source, bukan independent embedded-code proof | Sama | **BINARY CONTENT NOT INDEPENDENTLY PROVEN**; metadata/hash identity terverifikasi |

Tidak mengklaim semua branches/backports repository telah diaudit. Tidak ditemukannya original merge commit sebagai ancestor saja tidak cukup menolak cherry-pick; absence conclusion di atas juga berdasarkan relevant source markers/logic pada tag.

## 7. Commit ancestry dan later changes

GitHub compare API, base=PR merge commit, head=release tag:

| Base | Head | Result | Interpretation |
|---|---|---|---|
| 81aee8c8… | rust-v0.162.1 | diverged; ahead4/behind273 | Original merge bukan ancestor tag; common merge-base ac9b5b8380517ded445b09dd3196d8d9e2ba3c59 |
| 0fd85b07… | rust-v0.162.1 | diverged; ahead4/behind288 | Sama; tidak menyederhanakan old branch sebagai linear behind |
| 81aee8c8… | rust-v0.164.0 | ahead284/behind0; merge-base sama dengan base | Fix commit ancestor new tag |
| 0fd85b07… | rust-v0.164.0 | ahead269/behind0; merge-base sama dengan base | Fix commit ancestor new tag |

Reproducible read-only source links: [54027→0.162.1](https://github.com/openai/codex/compare/81aee8c86ba2549e53f82ea56f163c3e450fb55a...rust-v0.162.1), [54027→0.164.0](https://github.com/openai/codex/compare/81aee8c86ba2549e53f82ea56f163c3e450fb55a...rust-v0.164.0), [54069→0.162.1](https://github.com/openai/codex/compare/0fd85b075288c4fee50f0df3e4e4f98f80c693fe...rust-v0.162.1), [54069→0.164.0](https://github.com/openai/codex/compare/0fd85b075288c4fee50f0df3e4e4f98f80c693fe...rust-v0.164.0). API metadata dipakai tanpa clone/checkout.

Later relevant change **PR #55378** mengganti separate MXC crates dengan mxc-sdk pada pinned revision `b21120168d70befe12356411423266bfef168446`; old Cargo memakai Microsoft MXC revision `6cd3d58f05d3447e67109cfb75e042803b843ca4`. New policy::build_request memakai `Some(env)` untuk nonempty dan `None` untuk empty. PR54027 guard/marker tetap ada; SDK migration mengubah representation/launch dependency, bukan membatalkan startup fix. [Migration](https://github.com/openai/codex/pull/55378), [new policy:271–289](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs#L271-L289).

Release juga memuat PR #54363, filter uninspectable network roots dari implicit MXC read grants; new windows.rs mempunyai implicit_read_roots. Perubahan ini menambah alasan menguji exact version/config, bukan menganggap version upgrade satu-variable repair. [PR54363](https://github.com/openai/codex/pull/54363), [0.164.0 windows.rs:95–118](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/windows.rs#L95-L118). Tidak mengekstrapolasi semua changes setelah 0.164.0 atau menyebutnya latest release.

## 8. Standalone CLI sandbox code-path mapping

Static source chain untuk old invocation; **source-backed reachable path, bukan captured stack trace**:

1. [0.162.1 main.rs:1031–1038](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/main.rs#L1031-L1038): main → arg0_dispatch_or_else → cli_main.
2. [main.rs:1671–1726](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/main.rs#L1671-L1726): Sandbox subcommand merges root flags, rejects remote mode, dispatches Windows to run_command_under_windows_sandbox. Echo bukan setup/uninstall.
3. [debug_sandbox.rs:132–165,190–200](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/debug_sandbox.rs#L132-L200): options + ManagedRequirementsMode; explicit profile dengan include-managed-config tetap Include.
4. Config/profile resolution menghasilkan cwd, runtime_permission_profile dan shell_environment_policy; create_env dipanggil pada [debug_sandbox.rs:251–261](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/debug_sandbox.rs#L251-L261). Effective MXC selection menjaga branch tetap native; old legacy session branch dilewati bila effective type WindowsMxc.
5. [debug_sandbox.rs:477–520](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/debug_sandbox.rs#L477-L520): SandboxManager::transform dengan WindowsMxc, current_exe dan environment terfilter.
6. [manager.rs:387–431](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/sandboxing/src/manager.rs#L387-L431): availability check lalu codex_mxc_sandbox::create_command_args; **di sinilah lib/transport PR54027 terhubung ke standalone path**, tanpa remote MCP mode.
7. [debug_sandbox.rs:611–639](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/debug_sandbox.rs#L611-L639): helper spawned dengan env_clear/envs; bukan re-inherit seluruh parent. Stdio inherited, kill_on_drop.
8. [arg0:104–107](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/arg0/src/lib.rs#L104-L107): hidden MXC argument dispatches sebelum ordinary alias initialization. [windows.rs:28–77](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/mxc-sandbox/src/windows.rs#L28-L77): read helper vars, transport decode/scrub, build request/platform roots → native::launch → SDK spawn.
9. [old native.rs:18–42](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/mxc-sandbox/src/native.rs#L18-L42): buffered logger, SDK error_message keluar; target creation tidak berhasil dibuktikan oleh receipt.

New tag mempertahankan WindowsMxc transform/current_exe/helper architecture: [0.164.0 debug_sandbox.rs:478–521](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs#L478-L521), lib::create_command_args → encode guard sebelum re-exec. Tidak perlu pindah ke remote transport untuk memperoleh PR54027.

**First runtime evidence gap:** setelah recorded argv/input environment, effective config/profile/shell policy dan constructed helper env tidak direkam. Receipt akhir membuktikan generic launch failure, tetapi tidak menampilkan values/stack/native operation. Static chain tetap dapat dibuktikan; actual intermediate state tidak diisi dengan tebakan.

## 9. Empat environment layers

| Layer | Source behavior | Evidence S |
|---|---|---|
| Codex parent process | Recorder memasok environment ke native CLI. New encode membaca std::env::var dari proses ini | Six-key manifest diketahui; missing SystemDrive/LOCALAPPDATA pada input |
| MXC helper environment | create_env policy → transform/encode → env_clear/envs → hidden re-exec; new encode inserts host-owned values | Exact final map tidak direkam; bukan selalu enam key |
| SDK bootstrap context | Helper mempunyai Windows startup context untuk platform directories/SDK initialization; original-empty marker membedakan bootstrap vs intended empty target map | Source-level behavior saja; actual internal API context UNKNOWN |
| Sandbox target child | Decoded request.env diteruskan ke SDK; new empty map menjadi None/defaults, nonempty menjadi Some(explicit map) | Target startup/env tidak diamati karena no MXC_OK |

Old shell_environment::create_env memfilter input menurut policy dan pada Windows menambahkan PATHEXT bila hilang. WINDOWS_CORE_ENV_VARS mencakup SYSTEMDRIVE/LOCALAPPDATA, tetapi filter tidak memulihkan variabel yang tidak ada pada parent. Config.set dapat mengubah map; effective config lama UNKNOWN. [0.162.1 shell_environment.rs:53–88,99–158,169–202](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/protocol/src/shell_environment.rs#L53-L202).

Karena create_env dapat menambah PATHEXT, enam key recorder tidak boleh dianggap exact SDK/target env. Empty/default-child branch adalah generic transport behavior; tidak diklaim telah dipilih pada old echo atau perlu dipilih dalam future test.

## 10. Variable-specific applicability

| Variable | Role yang dibuktikan | Kesimpulan untuk old S |
|---|---|---|
| SystemDrive | New encode unconditional host nonempty-Unicode prerequisite; override map diganti host value | Input lama tidak memuatnya; **directly relevant prerequisite gap**, bukan proven cause203 |
| LOCALAPPDATA | Sama | Sama; parent harus mempertahankan actual host value pada future candidate |
| SystemRoot | Tambahan host guard hanya ketika default_child_env true; normal Windows startup/bootstrap relevan | Input lama sudah memuatnya; tidak menyatakan missing SystemRoot |
| USERPROFILE | Tidak ada unconditional encode guard; dapat terkait SDK user-profile defaults/upstream test expectations | Bukan alasan memasukkan guessed value atau copying real profile |
| PATH | Tidak ada unconditional encode guard; resolution/runtime dependencies dan upstream expectations berbeda | Input lama override; target cmd absolut; missing dependency belum diidentifikasi |

**Upgrade saja dengan parent environment lama diperkirakan gagal pada earlier preparation guard**, bukan otomatis mencapai SDK. Menambahkan key hanya ke intended child map juga tidak memperbaiki host std::env::var lookup jika CLI parent tidak memilikinya. Future prerequisite validation harus membedakan kedua lapisan, meneruskan actual nonsecret host values tanpa dump dan tanpa permanent environment mutation.

## 11. Error-203 causality assessment

203/0xCB = ERROR_ENVVAR_NOT_FOUND. Pinned SDK generic formatter menampilkan angka Win32 dengan label CreateProcessInSandbox; tidak menamai missing option atau exact API. Codex wrapper hanya meneruskan SDK error_message, sehingga API-specific extended_error tidak muncul. [Microsoft mapping](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-), [SDK diagnostics:37–72](https://github.com/microsoft/mxc/blob/6cd3d58f05d3447e67109cfb75e042803b843ca4/src/backends/appcontainer/common/src/launch_diagnostics.rs#L37-L72).

| Claim | Assessment |
|---|---|
| Old source lacks relevant fix, new source includes it | **DIRECTLY DEMONSTRATED** dari tag/ancestry |
| Fix lies on standalone MXC preparation path | **STRONGLY SUPPORTED** oleh linked source call chain; bukan runtime tracing |
| Missing host startup values dapat relevan | **CONSISTENT BUT UNPROVEN** sebagai causal explanation untuk old203; specific prerequisite kini source-backed |
| Exact SystemDrive/LOCALAPPDATA omission menghasilkan203 | **UNKNOWN**, tidak ada source/runtime counterfactual yang membuktikan exact return code |
| New missing host value menghasilkan earlier explicit error | **DIRECTLY DEMONSTRATED pada source**, bukan local execution result |
| SystemRoot hilang atau Windows Home pasti unsupported | **NOT SUPPORTED** oleh evidence yang ada |
| Same error203 dari operasi MXC lain mungkin | **UNKNOWN** untuk exact operation; formatter bersifat generic sehingga pesan tidak mengeliminasi alternatif |
| Candidate0.164.0 pasti sukses | **NOT SUPPORTED**; OS/policy/SDK regressions/prerequisites belum diuji |

Old windows.rs platform_read_roots dapat mengeluarkan HRESULT-specific directory error sebelum native::launch. Mengutip public SystemDrive/ProgramData directory failures saja tidak membuktikan SDK203 ini mempunyai sebab yang sama.

Future single startup test dapat memfalsifikasi klaim sempit “candidate configuration dapat startup”; failure dengan prerequisites valid menolak sufficiency. Success tidak membuktikan omission menyebabkan old203 karena version, SDK dan input environment berbeda. Jangan memakai outcome future sebagai retroactive root-cause confirmation.

## 12. Temporary CODEX_HOME warning

Release-build guard menolak helper aliases di bawah temp_dir; caller mencetak warning dan melanjutkan. Source lama [arg0:185–190,338–353](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/arg0/src/lib.rs#L185-L353), source baru [arg0:160–165,311–326](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/arg0/src/lib.rs#L160-L326). Warning tetap ada pada kedua tags; PR54027 tidak mengubah file ini.

**Separate nonfatal warning; no direct causal link established.** Hidden MXC dispatch mendahului ordinary alias setup pada helper, dan old version/help sukses dengan warning sama. Tidak ada direct source evidence bahwa guard sendiri menghentikan MXC target creation. Indirect effects tetap UNKNOWN; tidak bypass guard, memindah home/TEMP agar lolos, membuat aliases atau menyalin real home.

## 13. Supported dan unsupported hypotheses

Supported: **release-source compatibility gap**, specific Windows host startup prerequisite pada later transport, direct standalone applicability #54027, remote-path distinction #54069. Unsupported sebagai established facts: guaranteed repair, root cause203 identified, missing checked helper, fatal alias guard, mandatory OS upgrade/admin setup atau unsafe fallback.

Tidak ada basis mengubah global config atau menyebut OS rusak. Stronger source evidence S3 memperbarui applicability assessment S2 tanpa menulis ulang historical findings/support draft.

## 14. Confidence dan batas pembuktian

- **RELEASE SOURCE VERIFIED:** relevant behavior old/new diperiksa langsung.
- **COMMIT ANCESTRY VERIFIED:** original PR commits merupakan ancestors 0.164.0; bukan ancestors old release.
- **BINARY CONTENT NOT INDEPENDENTLY PROVEN:** installed identity/version/hash berkorelasi dengan old tag, tanpa reproducible-build/decompilation proof.
- **NOT VERIFIED:** new local binary provenance/behavior, Windows MXC capability/policy compatibility, actual environment layers dan OS denial.

Sumber publik bukan confidential local runtime logs. Tidak mengeksekusi upstream tests/scripts atau merekayasa evidence yang hilang.

## 15. Missing runtime evidence

Masih tidak ada effective merged policy, helper/target env receipt, exact native API diagnostic, current-build capability proof, candidate startup, direct allow/deny IO, new-file timing, network/children confinement atau actual app-server/account/billing evidence. Source gap confirmation cukup untuk bounded experiment recommendation, bukan gate promotion.

Historical results tetap historical: 300 PASS/1 SKIPPED,60 host-security PASS; tidak ada tests pada S3. Real worker **BLOCKED**.

## 16. Version-update limitations

Target future experiment spesifik **official stable rust-v0.164.0**, bukan arbitrary preview/latest. Existing0.162.1 tetap dipertahankan. No install/update/download/checkout/build dilakukan pada S3.

Official release metadata mencantumkan asset **codex-package-x86_64-pc-windows-msvc.tar.gz**,167,144,380 bytes, SHA-256 archive `700116be3143576d006467af8576f7f4c9dada1feddfdb7f69743bfde0997018`. Metadata saja dibaca; artifact tidak diunduh. Digest ini **archive hash**, bukan executable hash dan bukan independent binary provenance attestation.

Future approved task harus verify official origin/digest/layout/version/executable signature/hash sebelum invocation; gunakan dedicated side-by-side extraction, tidak mengganti global npm/PATH/shims/extensions/config/auth. Bila safe isolated packaging/provenance tidak dapat dipastikan, stop menuju fallbackC. SDK migration/filter changes berarti one echo hanya startup compatibility; stable tidak menjamin bebas regresi.

## 17. Reference index dan source identities

Line identifiers pada sections4–12 mengacu actual tag contents. Tag-to-commit mapping section3 dan compare evidence section7 membatasi version ambiguity. Semua URLs diakses 29 Oktober2026.

- Official releases [0.162.1](https://github.com/openai/codex/releases/tag/rust-v0.162.1), [0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0).
- Actual patches/metadata [#54027](https://github.com/openai/codex/pull/54027), [#54069](https://github.com/openai/codex/pull/54069), [#55378](https://github.com/openai/codex/pull/55378).
- [Windows sandbox docs](https://learn.chatgpt.com/docs/windows/windows-sandbox): documented compatibility shape; documentation bukan local PASS.
- Old Microsoft MXC dependency source pinned6cd3d58f… di section11; new dependency b2112016… di section7. Tidak menganggap old diagnostic source identik dengan semua internals new SDK.
- Official GitHub release/tag/compare/PR API metadata dibaca read-only; raw individual source dibaca di memory. Tidak clone repository atau persist runtime source tree.

## 18. Safety dan unchanged-file verification

Hanya dua report S3 yang ditulis. Initial protected AI-Office baseline **108 files** di luar node_modules; source/contracts/schema/security harness/tests/package/config/screenshots/prior reports tercakup actual pre/post hash comparison pada companion. Old fixtures22+22 dan S6 retained; tidak ada new fixture/cleanup. S2 support draft tetap identik, tidak dikirim.

Binary main hash diperiksa ulang dan cocok. Tidak ada current-runtime invocation, upgrade, alternative binary download/install/build, dependency install, env/home/globalconfig/requirements/ACL/OS/security mutation, WSL/VM/container startup, auth/credential/transcript/.sandbox-secrets read, model/worker/app-server/SDK inference, paidAPI/creditfallback, Gitinit, Hermes/VisualLab write atau external submission. Tidak menghentikan proses apa pun.

## 19. Recommended next action dan support supplement

**Primary B:** ajukan **M02-02S4 — Isolated Codex0.164.0 MXC Startup Compatibility Validation**, satu official side-by-side candidate, preflight/provenance dan satu harmless echo setelah fresh disposable profile/startup prerequisites aman. Ini proposal, **belum diotorisasi/dimulai**. Exact scope/rollback/stops di companion. Tidak menyertakan actual worker atau OS negative tests otomatis.

**Fallback C:** jika provenance/security prerequisites gagal atau satu candidate launch gagal, stop dan gunakan official support. Jangan mencoba binary/profile/directory lain atau weaker isolation. WSL2 feasibility hanya alternatif keputusan terpisah kelak.

Proposed redacted supplement untuk S2, **tidak diposting dan S2 tidak diubah**: source0.162.1 lacks54027/54069; source0.164.0+ancestry contains both;54027 is on standalone MXC path and requires parent SystemDrive/LOCALAPPDATA; same six-key parent would fail earlier new guard; SDK55378 changes candidate comparison; causality203 remains unproven. Pertanyaan support yang tersisa: supported candidate configuration dan safe API-specific failure fields bila one future bounded test gagal.

**M02-02S3 COMPLETE — MXC VERSION COMPATIBILITY GAP IDENTIFIED — BOUNDED FOLLOW-UP RECOMMENDED — REAL CODEX WORKER BLOCKED.**
