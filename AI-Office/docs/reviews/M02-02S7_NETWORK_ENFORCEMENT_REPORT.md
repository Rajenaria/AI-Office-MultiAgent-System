# M02-02S7 — Network Enforcement Report

Tanggal review: **30 Oktober 2026, Asia/Jakarta**. Actual UTC 29 Oktober 23:38:32 = **30 Oktober 06:38:32 WIB**. Companion: [Network Gate Matrix](M02-02S7_NETWORK_GATE_MATRIX.md). Internal evidence berada di satu owned S7 root; locator pada section 9.

## 1. Executive summary

**ACCEPTED — BOUNDED MXC LOOPBACK BEHAVIOR CHARACTERIZED.**

Actual classification: **MXC_LOOPBACK_DENIAL_OBSERVED — TESTED ENDPOINT**. Satu normal-user baseline berhasil mencapai owned **127.0.0.1:36442**, mengirim marker dan menerima ACK. Satu fixed MXC Node client, setelah filesystem sanity A-ALLOW/B-DENY lulus, mencoba endpoint yang sama tepat sekali dan menerima **EACCES, errno -4092, syscall connect**. Server tetap listening sebelum dan sesudah percobaan; hanya baseline connection diterima, tidak ada MXC marker.

Satu listener, satu baseline, satu MXC launch, satu sandbox TCP attempt. Native exit0, stderr kosong,343ms; client socket closed, no timeout. Host server exit0 dan listener shutdown dikonfirmasi dengan close event serta exact-port Windows metadata. Tidak ada retry, fallback atau perluasan izin.

**PUBLIC INTERNET EGRESS ENFORCEMENT: NOT VERIFIED BY S7. REAL CODING WORKER BLOCKED.** Acceptance ini characterization satu local endpoint, bukan full network isolation.

## 2. Previous S6 security baseline

[S6 report](M02-02S6_COOPERATIVE_CHILD_CONFINEMENT_REPORT.md) dan [matrix](M02-02S6_CHILD_PROCESS_GATE_MATRIX.md) memberi historical bounded cooperative-child filesystem evidence: parent A-positive/B-deny; child2ALLOW/5DENY; clean exits, no residual owned process. Network belum diuji pada S6.

[S5R2 report](M02-02S5R2_INLINE_CONTAINMENT_REPORT.md)/[matrix](M02-02S5R2_OS_GATE_MATRIX.md) memberi historical12 direct filesystem operations. Host-harness report/matrix, R1 atomic issuance dan S4 provenance menjadi context; tidak mengulang architecture audit atau mengubah hasil lama.

S7 preflight membandingkan S6 recorded inventory38/38 entries dan S5R2 37/37 entries: no mismatch. Full before/after snapshots S6 **39/39**, S5R2 **38/38** unchanged; known S5R2 junction tidak diikuti/dimodifikasi. S6 process IDs absent pada initial observation.

## 3. Windows/Codex/Node identity

Actual Windows **Microsoft Windows 11 Home Single Language**,10.0.26300, build **26300.9711 /26H2**,64-bit. Existing Node FileVersion **24.21.0**, C:\Program Files\nodejs\node.exe. Retained official **Codex0.164.0**, terpisah dari global0.162.1; tidak ada upgrade/download/install/version-help launch baru.

| Artifact | Actual SHA-256 |
|---|---|
| Candidate main | 6F267830B029EE25D9339864AA867CD45DE9F8FD4C5EA007D2E63C13A0C66D36 |
| Command runner helper | 30B0BA5D42D3A95C839731FBF9939D728A70FCD9E433245A7CB15BC79418A4DB |
| Sandbox setup helper | 2CAC62FF24ACA3AEF7768AB5B96D4102E8434EB0CF8DDBC6171B85A8FB3BB4EF |
| Node executable | BA4E6D110E8C1592A1ECD390F6B05F3DA124B13871A5BE62B341A07A853C6C32 |

Main dan kedua helpers Authenticode **Valid, OpenAI OpCo, LLC.** Helpers tidak dieksekusi langsung. [S4 provenance](M02-02S4_ISOLATED_CODEX_COMPATIBILITY_REPORT.md) dan [official pinned release](https://github.com/openai/codex/releases/tag/rust-v0.164.0) mendukung retained identity. Current S4 recorded60entries match; full61files including45candidatefiles unchanged. Global package50/50 unchanged; whole IDE extension tidak checksummed, tetapi active Codex22256 diamati dan tidak disentuh.

## 4. Official documentation reviewed

OpenAI Docs digunakan untuk [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [permissions](https://learn.chatgpt.com/docs/permissions) dan [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). Current docs membedakan network enablement, proxy/domain filtering, managed requirements, dan MXC loopback caveat. Interpretasi version-specific menggunakan tagged0.164.0 source, bukan asumsi bahwa semua current prose berlaku tanpa syarat.

Exact [Node24.21.0 net API](https://nodejs.org/download/release/v24.21.0/docs/api/net.html) dan [child-process API](https://nodejs.org/download/release/v24.21.0/docs/api/child_process.html) ditinjau untuk literal IPv4 connect, autoSelectFamily=false, ephemeral bind, asynchronous close dan captured foreground lifecycle. No runtime upgrade.

## 5. Network-disabled profile verification

Selected **ai-office-s7-16b2965d-aafd-42b2-ad34-62ce08a424b1**. Original S6 config SHA-256 **BB41FFDFD0FA12A15BC8B277442A59449F41634054606BCCD2EAC824963338A7**. Fresh S7 hash **5A621D3FE628D7B8EE862495EE9B0F16A4D6CCADCACFAD4833BCC2726A39C0EF**. Config hashes differ because profile name/root literals change; reverse substitution gives exact original text. No permission value/inheritance change.

Preserved root deny, minimal runtime read, A-only workspace write, B/private/credential/home/evidence denies, tmpdir/slash_tmp deny, ephemeral credential store, explicit MXC and **network.enabled=false**. New private/credential sibling directories remain empty but denied semantically; no actual data needed for this network experiment. No broad user/drive/fixture-parent/Temp grants, extra workspace roots, legacy sandbox override or unrestricted profile.

## 6. Managed configuration observations

--include-managed-config retained. Read-only current metadata: no HKLM64 RequirementsPath override, no C:\ProgramData\OpenAI\Codex system config/requirements, no new-home managed_config.toml. Root and A/B/private/credential/home/temp ownership match current user; process not elevated.

No managed security requirement was disabled. No active user auth/config was copied or unnecessarily read. Full effective merged policy/kernel introspection was not available; status **EFFECTIVE_POLICY_PARTIALLY_VERIFIED**. Explicit argv, semantic equivalence, fresh cwd and actual A/B sanity support selected boundary; no complete policy attestation claimed.

## 7. Network proxy configuration limitations

No proxy feature/config/domain allowlist/local-binding setting added or changed; no localhost allow rule. The nine-key target environment omits provider/proxy secret variables. No supported full effective-proxy dump collected and no proxy endpoint contacted.

Network enablement and proxy activation are separate controls; domain restrictions need an active proxy. Sandbox command networking is also separate from Codex service/model/auth, MCP, browser/connectors or documentation research traffic. S7 tests only the fixed command's direct TCP connection. [Permissions networking guidance](https://learn.chatgpt.com/docs/permissions)

Absence of proxy settings in this custom file is configuration evidence, not whole-host proof that no proxy exists. Current managed metadata and captured execution contain no proxy-start/fallback warning or evidence of an unexpected extra listener.

## 8. MXC host-loopback behavior analysis

Current [Windows documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox) describes host-loopback access and effective allow_local_binding=true for managed networking. It must not be read as proof that every network-disabled MXC invocation permits loopback.

Pinned0.164.0 [policy translator](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) sets disabled/unproxied ingress/egress defaults and host_loopback to Deny; its proxied branch adds loopback allowance. [Managed-network validation](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs) requires proxy ports and local-binding permission. [Debug sandbox path](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/cli/src/debug_sandbox.rs) carries active proxy context.

**Inference:** actual EACCES with this disabled profile is consistent with the disabled/unproxied translation. No claim to having independently dumped effective SDK/kernel policy or disproved the documented exception in other configurations.

Pre-execution hypotheses were recorded separately. H01 supported for this endpoint; H02 not observed here; H03 listener/transport-only explanation not supported by baseline/live-server/permission-error evidence; H04 no relevant managed metadata found but full internal influence not attested; H05 refuted because bootstrap/fs/net/attempt/error events exist.

## 9. New S7 fixture layout

Exactly one fresh canonical OS-temp immediate child, UUID **16b2965d-aafd-42b2-ad34-62ce08a424b1**:

```text
C:\Users\USEP REZA USAMAH\AppData\Local\Temp\ai-office-m0202s7-16b2965d-aafd-42b2-ad34-62ce08a424b1
```

```text
<S7_ROOT>/
  project-a/input/marker.txt
  project-a/output/                           [empty]
  project-b/input/marker.txt
  app-private/                               [empty, denied]
  fake-credentials/                          [empty, denied]
  test-home/config.toml
  test-home/tmp/arg0-windows/...              [normal CLI aliases]
  config/semantic-diff.json
  scripts/{server-template.txt,host-server.cjs,client-template.txt,client-inline.js}
  evidence/
  temp/
```

No real data, credentials, SQLite, junction or unexpected reparse. Canonical roots/input hashes/sizes/single-link identities recorded. Host filesystem controls A/B2/2 passed; both markers remain unchanged. No S5R2/S6 root reused as writable input.

## 10. Host server design and ownership

One fixed Node host-server.cjs, only node:net/node:fs, outside MXC under normal user. Source **4299bytes**, SHA-256 **D46036084CF6ADB4B8D3FE10DF6AACEB5B449FECA39D3BBADC38858E693F38DC**. Parse/manual review before listener start; no project import or backend state.

Direct verified Node spawn, shell=false, detached=false, windowsHide=true, owned stdin/control and captured pipes; actual server PID **5200**. Ownership uses exact ChildProcess handle, pinned executable/source, launch window and matching event PID/fixture ID, not marker alone. Read limit32bytes; fixed synthetic messages only; at most2intended connections. Unexpected connection/content/control would stop as interference. No admin interface, HTTP framework, detached registration or child spawn.

## 11. Actual bind address and port classification

One server.listen({host:'127.0.0.1',port:0,exclusive:true}). Actual listening event **2026-10-29T23:38:31.950Z**: address **127.0.0.1**, family **IPv4**, port **36442**, PID5200. Port selected by OS; no fixed service port/scan/discovery/rebind.

This is a disposable **TEST_OWNED_LOOPBACK** endpoint, not an AI OFFICE backend, proxy or provider endpoint. No 0.0.0.0, IPv6, LAN or hostname binding. Listener identity/port validated before baseline or MXC.

## 12. Baseline TCP result

Exactly one fixed host client in controller PID **17128**: start **23:38:31.954Z**, finish **.961Z**, **7ms**. Client local127.0.0.1:36443 → server127.0.0.1:36442. Server independently records peer36443; endpoint pair matches.

Connect success, S7_BASELINE_PING sent/received17bytes, S7_ACK received/matched7bytes, graceful peer end/socket close, no timeout/error. Server recorded marker at.958Z and baseline socket closed at.960Z. No DNS/proxy/other destination. This proves ordinary Windows reachability only.

## 13. Fixed inline sandbox client

Reviewed template **3793bytes**, SHA-256 **A578261DC742694E8B6DA622C495B0B54CFDD76E2F383E18CAE3422FF08D2CCC**. Literal construction only inserts fixed fixture data and the owned server's validated assigned port; reviewed before listener execution. Exact resulting source frozen before MXC: **4213bytes**, SHA-256 **3B4C5FA7A1544921D296F3D7FC8C44DDB62B11E9D14297647C4BE4BB13BC835B**.

Sequence: bootstrap → fs A read/B deny → sanity → node:net ready → one socket.connect → actual result → bounded close/summary. Only node:fs/node:net; no project modules, child spawn, shell, arbitrary traversal or dynamic code. Literal127.0.0.1/family4/autoSelectFamily=false prevents address-family fallback; no DNS name. One connect call, no retry. Max ACK7bytes, message32bytes.

Controller SHA-256 **F7B1AD061FCC5F71FED94ADD00744C32B1338DC6F1D2AC0AB201A30BF67CECCF**; static syntax/manual review and source hashes recorded before experiment. Port-dependent final client hash is recorded at23:38:32.436Z, before native launch.

## 14. Exact sanitized MXC argv

Executable: retained <S4_ROOT>/candidate/bin/codex.exe; actual absolute path and complete literal argv/source stored internally in evidence/invocation-spec.json.

```json
[
  "-c",
  "cli_auth_credentials_store=\"ephemeral\"",
  "-c",
  "windows.sandbox=mxc",
  "sandbox",
  "--include-managed-config",
  "--permission-profile",
  "ai-office-s7-16b2965d-aafd-42b2-ad34-62ce08a424b1",
  "--",
  "C:\\Program Files\\nodejs\\node.exe",
  "--eval",
  "<literal UTF-8 scripts/client-inline.js; SHA-256 3B4C5FA7A1544921D296F3D7FC8C44DDB62B11E9D14297647C4BE4BB13BC835B>"
]
```

Actual execution used separate argument elements, no shell or placeholder. Cwd fresh S7 project-a. Explicit nine-key environment: SystemRoot,WINDIR,ComSpec,SystemDrive,LOCALAPPDATA, bounded PATH, fresh denied TEMP/TMP, synthetic CODEX_HOME. ComSpec is a validated startup variable, not the payload. No USERPROFILE/NODE_OPTIONS/API/proxy secret/operator opt-in forwarded. Hidden window, ignored client stdin, captured output.

## 15. Actual MXC launch count

**1/max1 MXC**, listener1/max1, baseline1/max1, sandbox TCP1/max1. Exclusive experiment/listener/baseline/MXC issuance records written before their respective actions; explicit matching opt-in. No automatic npm/test hook, retry, fallback, alternate address/profile/environment or second listener.

Native launcher **1476**, start **2026-10-29T23:38:32.444Z**, finish **.786Z**, reported **343ms**, exit **0**, signal/error null. Stdout2034bytes, stderr0; parseError=false. Exit0 means probe completed and reported a denial, not successful network access. Budget exhausted.

## 16. Filesystem sanity results

| ID | Operation | Actual |
|---|---|---|
| S7-F01 | A marker read, expected ALLOW | Success/content matched at23:38:32.747Z. |
| S7-F02 | B marker read, expected DENY | EPERM,errno-4048,syscall open at.748Z. |

Sanity passed before net-ready/connection attempt. B remains denied sibling outside A. No full S5R2 matrix repeated; no new filesystem-write/credential/path-form claim. No host policy evaluator used.

## 17. Actual TCP result and OS errors

Client bootstrap PID **20600**, reported PPID **17132**. TCP attempt emitted at **23:38:32.749Z** for127.0.0.1:36442. Direct connect error at **.751Z**:

```json
{"code":"EACCES","errno":-4092,"syscall":"connect"}
```

Final summary: attempted=true, connected=false, markerSent=false, ackMatch=false, socketClosed=true, timeout=false, protocolFailure=false, lookupObserved=false, status=PERMISSION_DENIED. This was an actual permission-related failure, not ECONNREFUSED/timeout/ENOENT/startup failure. Node-reported metadata is not an independently captured kernel trace.

Classification **MXC_LOOPBACK_DENIAL_OBSERVED — TESTED ENDPOINT**. No all-network/public-egress conclusion.

## 18. Client/server event correlation

Server reports same listening127.0.0.1:36442 with zero active sockets at **23:38:31.962Z**, before native launch; after native completion at **23:38:32.788Z**, still listening with zero active sockets and total accepted connections **1**. Single-instance fixed server has no close/relisten path during that interval.

Only accepted connection/marker was baseline. **Zero MXC accepted connections, zero S7_MXC_PING markers**, no ACK to MXC. Combined client permission error and independent server event history corroborate no accepted MXC connection, without treating absent server receipt alone as proof of deny. Correlation uses ordered windows, exact target/owner, PID/fixture consistency and baseline endpoint pair; not marker-as-process-authentication.

## 19. Timeout observations

Fixed limits: baseline2s; TCP3s; sandbox client10s; outer MXC12s; listener20s; host orchestration19s. Stdout16KiB/stderr8KiB per child. No deadline extended.

No baseline/TCP/client/server/outer/overall timeout, overflow or retry. Server process941ms inclusive startup/exit; listening duration about842ms. Timeout-kill/crash/hostile cleanup not tested; no kill requested or performed.

## 20. Socket and listener cleanup

Baseline socket closed normally; denied MXC socket emitted close with hadError=true and no established connection. Host stop requested23:38:32.791Z; server close event **.792Z**: listening=false,address=null,activeSockets0,baseline recordclosed=true. Server exited0 by.802Z; no signal/stderr.

At **23:38:45.2288816Z**, Windows Get-NetTCPConnection -State Listen -LocalPort36442 returned no listener; exact5200/1476/20600/17132 PID queries and fixture-scoped Node/Codex query returned absent. Host controller/baseline17128 separately absent at23:39:21.4309882Z. Active Codex22256 alive. No port connection/scan used for cleanup verification; read-only metadata only. TIME_WAIT, if any, is not a listening server.

No unrelated process terminated. Cooperative foreground cleanup only, no hostile-tree/kill-escalation certification.

## 21. Security findings

No unexpected endpoint, configuration broadening, forbidden filesystem success, fallback, interference or persistent listener observed. No confirmed sandbox escape; no observed loopback-reachable requirement gap in this run.

Result supports denial of **one tested IPv4 endpoint**. Stronger claims—every localhost port/address/protocol, public egress, DNS/LAN and child networking—remain unverified. A future configuration enabling managed networking/proxy may have different loopback semantics and needs independent characterization. No vulnerability severity assigned without an observed exploit.

## 22. Implications for AI OFFICE localhost services

Read-only architectural review of [http.ts](../../src/server/http.ts), without starting/contacting actual services or reading sessions. Current foundation code checks peer/Host/optional Origin/fetch metadata, uses expiring bootstrap bearer then session token + csrfNonce, validates request format/body limits and calls backend-owned manager APIs. These are source observations, not a S7 live authentication/security acceptance test.

| Boundary | Implication / required future proof |
|---|---|
| Backend loopback endpoints | Binding127.0.0.1 reduces exposure but is not caller authorization; keep independent authentication even after this denial. |
| Session/request authentication | Preserve bearer/session verification; untrusted worker must not receive UI/bootstrap/session capabilities. |
| Origin verification | Retain browser-origin checks as an extra layer; native TCP/HTTP clients can supply/omit headers, so Origin is not process identity. |
| CSRF controls | Pair browser protections with authenticated requests; native callers are a separate threat. |
| Per-project access | Backend must verify current binding/project ownership for each operation; a localhost request cannot select arbitrary project authority. |
| Request-specific authorization | Exact operation/resource/task/attempt authority must be checked beyond transport/session possession. |
| Nonce handling | Current csrfNonce is generated per server instance, not proven single-use per request; future worker capabilities need scoped lifetime/replay handling. |
| State-changing endpoints | Keep authenticated method/schema/permission checks; independently test unauthorized mutations later. |
| Worker-to-host communication | Use narrow explicit channels/capabilities; do not reuse general UI session authority. |
| Credential headers/tokens | Keep out of worker env/argv/files/logs; actual custody remains unverified. |
| Debug/diagnostic endpoints | Review minimal disclosure; current health route is unauthenticated by source design, not exploited/contacted here. |
| Other localhost services | Do not assume all local processes are trusted or protected by this one endpoint's denial. |

No claim that backend auth is bypassed or proven secure. Host-loopback reachability and backend authorization are distinct boundaries; neither proves the other. Strict zero-network-including-all-localhost requirement remains unverified beyond this specific test.

## 23. Explicit public egress limitations

**PUBLIC INTERNET EGRESS ENFORCEMENT: NOT VERIFIED BY S7.** No public IP/domain/provider/DNS/LAN/gateway/real service contacted by test code. No reserved documentation IP, unreachable destination or timeout substituted as security proof.

Profile network=false was verified; it is not runtime-wide outbound certification. Official documentation/source research traffic is outside the experiment, separate from sandbox command traffic. IPv6, UDP, DNS, LAN, proxy/domain enforcement and child network inheritance remain NOT RUN/NOT VERIFIED.

## 24. Existing source/binary preservation

Actual pre/post hash comparisons, including final check after reports:

| Scope | Result |
|---|---|
| AI OFFICE outside node_modules | **121/121 original files unchanged**, final **123files**, only2authorized S7reports added. |
| Existing source/security modules/tests/probes/contracts/schema/package/lock/screenshots/prior reports | Included in unchanged121; no implementation edits. |
| Global Codex0.162.1 | **50/50 unchanged**; no update/default/PATH registration. |
| S4 candidate/evidence | **61/61 unchanged**, including45candidatefiles. |
| Other historical retained roots | QHnCi9 22/22;TLkI1Y22/22;nUSJvQ6/6;S5 36/36;S5R18/18;S5R2 38/38;S6 39/39 unchanged. |
| Hermes3D tracked files | **647/647 unchanged**, HEAD beb76292747b816ef317aa6f9a3992e0014f81d9; pre-existing modified package-lock.json preserved. |
| Parent PATH | Fingerprint unchanged; no user/system mutation. |

No real credentials/.sandbox-secrets, provider login/logout/inference, Paid API/credits, worker/app-server/exec/turn, global config writes, Windows ACL/firewall/Defender/UAC/registry/features changes, elevation, WSL, dependencies, Git init, browser E2E or historical fixture cleanup. Metadata reads only; no global auth/config/full-extension/external Google AI Studio checksum audit or whole-host forensic guarantee.

Historical M01 300PASS/1SKIPPED, security60PASS, S5R2 12/12 and S6 acceptance **not rerun**. New evidence is source/static validation, host fs2/2, one host TCP baseline, one MXC sanity/TCP attempt, cleanup and integrity checks.

## 25. Retained artifacts

All new S7 synthetic artifacts retained in section9 root: marker manifest, exact strict config/semantic diff, reviewed templates/fixed sources, budgets/preconditions/ownership metadata, host fs/TCP controls, actual assigned endpoint, exclusive issuances, full internal argv, sanitized native/server receipts, before/after listening observations, hypothesis records, process/listener accounting, protected baselines/comparisons, final change-safety/verification and relative hash inventory.

Inventory covers every retained file except its own inventory record and never traverses reparse. Normal Codex arg0 alias/.lock files are only in new owned home, never directly executed. No operator deletion, automatic approval rejection or cleanup-policy bypass; retention is intentional.

## 26. Remaining worker blockers

Public egress/DNS/LAN, child network inheritance, hostile/detached lifecycle/crash recovery, future-file timing, real credential custody, app-server protocol/tools, real approvals/cancellation/skills, durable production lease/dispatch/reconciliation, entitlement and included-only hard cap remain **NOT VERIFIED**. Account eligibility UNKNOWN; no spend does not prove billing enforcement.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.** S7 characterization does not activate workers or M02-03.

## 27. Recommended next bounded task

Propose **M02-02S8 — Bounded Cooperative Child Loopback Policy Inheritance**: separately authorize one new owned loopback endpoint, one host baseline, one fixed MXC parent/one cooperative child, and one child TCP attempt under unchanged network-disabled strict semantics. Reuse S6 identity/deadline discipline and S7 exact-endpoint client/server correlation. No hostile/detached process, public/DNS/LAN/provider traffic or policy relaxation. **Not started.**

Owner can review completed S7 result and authorize a new precise S8 scope including exact code/argv, fixture, listener/launch/spawn/connect budgets, deadlines, ownership/cleanup and retention. No additional S7 probe/listener, M02-03, app-server, inference, worker, Paid API or credits.

**M02-02S7 COMPLETE — BOUNDED MXC LOOPBACK BEHAVIOR CHARACTERIZED — PUBLIC EGRESS NOT VERIFIED — REAL CODING WORKER BLOCKED.**
