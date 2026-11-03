# M02-02S7 — Network Gate Matrix

Tanggal: **30 Oktober 2026, Asia/Jakarta**. Primary: [Network Enforcement Report](M02-02S7_NETWORK_ENFORCEMENT_REPORT.md). Evidence prefix <S7_ROOT>/evidence/; exact locator pada primary section9.

**HOST VERIFIED != OS VERIFIED != CODEX RUNTIME VERIFIED != ACCOUNT VERIFIED.**

## 1. S7-01 through S7-43

**ACCEPTED — BOUNDED MXC LOOPBACK BEHAVIOR CHARACTERIZED.** Actual **MXC_LOOPBACK_DENIAL_OBSERVED — TESTED ENDPOINT**,127.0.0.1:36442. Public egress tetap NOT VERIFIED. S7 experiment budget exhausted.

| Gate | Requirement | Status | Evidence / boundary |
|---|---|---|---|
| S7-01 | Official Codex0.164.0 candidate verified | HOST_VERIFIED | Current main/helper signatures Valid OpenAI, main SHA6F267830…6D36; retained S4 inventory60entries match/full61files unchanged. |
| S7-02 | Active Codex installation preserved | HOST_VERIFIED | Global0.162.1 package50/50 unchanged; active IDE22256 untouched; separate candidate path. |
| S7-03 | Node executable verified | HOST_VERIFIED | Existing24.21.0 FileVersion and SHA BA4E6D11…6C32 match; no install/upgrade. |
| S7-04 | Fresh synthetic fixture verified | HOST_VERIFIED | One owned canonical UUID temp root, A/B synthetic markers, no reparse. |
| S7-05 | Strict S6-equivalent filesystem rules | HOST_VERIFIED | Only name/root literals changed, normalized text equal; profile hash5A621D3F…9C0EF unchanged. |
| S7-06 | Project A-only workspace scope | HOST_VERIFIED | Fresh A cwd, dot-only workspace write, explicit sibling denies; no additional roots/broad grant. |
| S7-07 | Managed configuration included | HOST_VERIFIED | --include-managed-config; inspected system/registry/new-home managed metadata safe; no suppression. |
| S7-08 | Network disabled in selected profile | HOST_VERIFIED | network.enabled=false retained in fresh config and explicit named-profile selection; not full merged-policy proof. |
| S7-09 | Effective network policy limitations classified | HOST_VERIFIED | EFFECTIVE_POLICY_PARTIALLY_VERIFIED; config/argv/pinned-source/sanity evidence; no complete SDK/kernel/proxy policy dump. |
| S7-10 | No new network allowlist or proxy changes | HOST_VERIFIED | No new domains/proxy feature/local-binding override; nine-key input excludes proxy env; no settings changed. |
| S7-11 | Test server bound only to127.0.0.1 | HOST_VERIFIED | Fixed server.listen host literal, actual address127.0.0.1/familyIPv4, exclusive bind. |
| S7-12 | Assigned port verified | HOST_VERIFIED | OS port0 assignment36442 recorded after listening; client sameport; no scan/fixedserviceport. |
| S7-13 | Test server ownership verified | HOST_VERIFIED | Exact fixed-node/source ChildProcess handle, PID5200 +fixture events/launch window; no marker-only process identity. |
| S7-14 | Normal-user TCP baseline | HOST_VERIFIED | PID17128,7ms; connect127.0.0.1:36442 from36443, marker/ACK match, peer end/socket close; independent server record. |
| S7-15 | Fixed inline client source reviewed | HOST_VERIFIED | Reviewed3793byte template A578…2CCC; fixed validated-port construction frozen4213bytes SHA3B4C…835B before launch. |
| S7-16 | One MXC launch limit | HOST_VERIFIED | Exclusive issuance +opt-in; actual1/max1, no retry/fallback/secondlistener. |
| S7-17 | Sandbox Node bootstrap | MXC_BEHAVIOR_VERIFIED | S7_CLIENT_BOOTSTRAP_OK PID20600/PPID17132, followed by structured fs/net events. |
| S7-18 | Project A allowed read | MXC_BEHAVIOR_VERIFIED | S7-F01 direct read success/content matched. |
| S7-19 | Project B denied read | MXC_BEHAVIOR_VERIFIED | S7-F02 direct read EPERM/-4048/open, sanity=true before TCP. |
| S7-20 | TCP connection actually attempted | MXC_BEHAVIOR_VERIFIED | One direct socket.connect, literal127.0.0.1:36442, family4/autoSelectFamilyfalse; attempt/error events. |
| S7-21 | MXC TCP result captured | LOOPBACK_DENIED_OBSERVED | EACCES/errno-4092/syscallconnect; connected=false, no marker/ACK, socketClosed=true, no timeout. |
| S7-22 | Host server independently observed result | HOST_VERIFIED | Same server listening across invocation; accepted baseline only, zero MXC connection/marker; bounded ordered server records. |
| S7-23 | Loopback behavior correctly classified | LOOPBACK_DENIED_OBSERVED | MXC_LOOPBACK_DENIAL_OBSERVED - TESTED ENDPOINT; consistent disabled/unproxied tagged translation; no universalnetwork claim. |
| S7-24 | Connection deadlines respected | HOST_VERIFIED | Baseline2s/connect3s/client10s/outer12s/server20s/host19s; no timeout/overflow/termination; baseline7ms/native343ms. |
| S7-25 | Host listener shutdown verified | HOST_VERIFIED | Server closed .792Z, listeningfalse/addressnull/activeSockets0; exactport36442 has no LISTEN after test. |
| S7-26 | Test-owned process accounting | HOST_VERIFIED | 5200/1476/20600/17132 absent and fixture-querynone; host17128 separatelyabsent; active22256alive; no kills. |
| S7-27 | No external network test traffic | HOST_VERIFIED | Fixed literal IPv4 source only, no DNS/proxy/public/LAN/realservice calls; task-source/action evidence, not wholehostpackettrace. |
| S7-28 | No Windows security modifications | HOST_VERIFIED | Read-only metadata only; no ACL/firewall/Defender/registry/UAC/features/elevation/WSL changes. |
| S7-29 | No provider login or inference | HOST_VERIFIED | Synthetic ephemeralhome, no auth/sessioncopy/.sandbox-secrets/model/exec/appserver/worker command. |
| S7-30 | No paid API/credits | HOST_VERIFIED | No provider/API/billing action; nonusage only, not included-onlycap proof. |
| S7-31 | Existing application source integrity | HOST_VERIFIED | 121/121 existing AI files unchanged; final123 only2reports; global50/Hermes647/eightretainedroots unchanged. |
| S7-32 | Public internet egress enforcement | NOT VERIFIED | NOT VERIFIED BY S7; NOT RUN, no public/provider/documentation-IP probe. |
| S7-33 | DNS and LAN confinement | NOT VERIFIED | NOT RUN; no DNS request, LAN/gateway target, IPv6 or UDP test. |
| S7-34 | Child-process network inheritance | NOT VERIFIED | NOT RUN; sandbox client spawned no child; prior S6 childfs result is not network evidence. |
| S7-35 | Hostile/detached process containment | NOT VERIFIED | NOT RUN; no hostile/detached/orphan/crash experiment or general JobObject proof. |
| S7-36 | Future-file deny timing | NOT VERIFIED | NOT RUN; only pre-existing A/B read sanity; no timing/race/watcher experiment. |
| S7-37 | Real credential custody | NOT VERIFIED | No actual credential/store/realDB experiment; fake-path prior evidence not realcustody proof. |
| S7-38 | Codex app-server readiness | NOT VERIFIED | NOT RUN; no protocol/adapter/tools/thread/turn readiness test. |
| S7-39 | Actual runtime approvals/cancellation | NOT VERIFIED | NOT RUN; no actual Codex approval/cancel/interrupt race; host controls remain historical. |
| S7-40 | Durable production worker lease/recovery | NOT VERIFIED | No durable production lease/dispatch/recovery/reconciliation or powerfailure test. |
| S7-41 | Subscription/model entitlement | NOT VERIFIED | Account eligibility UNKNOWN; no account/auth/modelavailability query. |
| S7-42 | Included-only billing enforcement | NOT VERIFIED | No cap/fallback-exclusion proof; Paid API/credits OFF and unused. |
| S7-43 | Real worker activation | BLOCKED | S7 narrow endpoint characterization only; unresolved OS/runtime/state/account/billing gates and explicit prohibition. |

## 2. Requested network profile settings

Named ai-office-s7-16b2965d-aafd-42b2-ad34-62ce08a424b1: network.enabled=false, root/temp deny, minimal runtime read, fresh A-only workspace write, B/private/credential/home/evidence deny. Extends preserved :workspace. No extra roots, parent/drive/user/Temp grant, domain exception, proxy feature or allow_local_binding override. Old/new profile hashes and exact path/name-only semantic diff preserved.

Requested configuration is HOST_VERIFIED, not automatically runtime-wide enforcement. The observed result supplies evidence for one endpoint only.

## 3. Evidence of selected MXC mode

Actual argv explicitly selects windows.sandbox=mxc, includes --include-managed-config and the unique strict permission profile. Fresh synthetic CODEX_HOME, cwd A, fixed Node --eval, no shell/detach/legacy fallback. Exact full inert vector/source/environment saved in invocation-spec.json; client-source-freeze.json records4213bytes/SHA3B4C5FA7…835B before launch.

Native launcher1476 exit0,343ms,stdout2034bytes/stderr0. Client20600/PPID17132 produced consistent bootstrap, filesystem and TCP observations. No fallback/auth/elevation diagnostic. Exit0 is successful observation, not successful TCP connect.

## 4. Effective policy uncertainties

**EFFECTIVE_POLICY_PARTIALLY_VERIFIED.** Source/config/selection/runtime A/B contrast support the selected boundary; no complete merged SDK/kernel/network-proxy policy dump.

Current managed metadata: no system config/requirements, registry RequirementsPath redirect or new-home legacy managed file. No private operator config/session inspected. Config absence is not whole-host proof of every internal proxy/network influence. No hidden effective-policy values invented.

## 5. Host baseline evidence

One normal-user TCP client in host controller17128. Start23:38:31.954Z,finish.961Z,7ms. Fixed literal127.0.0.1:36442; local36443. Server records peer36443, baseline marker17bytes, ACK; client receives exact7byte ACK and closes normally. Host fs A/B baseline2/2 also passed.

No DNS/shell/proxy/other endpoint or retry. This confirms same endpoint normally reachable, not sandbox isolation.

## 6. Sandbox network attempt evidence

Actual sequence: bootstrap.744Z →A read.747Z →B EPERM/open.748Z →sanity=true/net-ready →one TCP attempt.749Z →EACCES/-4092/connect.751Z →closed summary. No timeout/lookup/protocol failure.

Summary connected=false,markerSent=false,ackMatch=false,socketClosed=true. tcp_attempt emitted before direct connect and actual permission error captured. No new destination or automatic alternate-family attempt. Source only node:fs/node:net, no child spawning/project imports.

## 7. Server-side connection evidence

PID5200 owned fixed Node server bound127.0.0.1/IPv4/OS-assigned36442. Listening at23:38:31.950Z. Before-window.962Z and after-native23:38:32.788Z both report same address/listening=true, activeSockets0.

Only baseline accepted; final connectionCount1, zero MXC marker. Source has one listen and no interval close/relisten. Absent server receipt is corroboration combined with actual client error, not standalone denial proof. Marker alone never treated as authenticated process identity.

## 8. Observed loopback behavior

**LOOPBACK_DENIED_OBSERVED. MXC_LOOPBACK_DENIAL_OBSERVED — TESTED ENDPOINT.**

S7 characterized the exact IPv4/TCP address/port/profile/runtime. It does not establish denial of all localhost ports, IPv6/UDP, public destinations, DNS/LAN, proxies or descendants. No LOOPBACK_ALLOWED_OBSERVED result and no loopback-reachable finding occurred.

## 9. Expected versus unexpected exception analysis

[Current Windows sandbox guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox) discusses MXC loopback/managed-network caveats. [Tagged0.164.0 policy](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/policy.rs) distinguishes disabled/unproxied denial from proxied loopback allowance; [validation](https://github.com/openai/codex/blob/rust-v0.164.0/codex-rs/mxc-sandbox/src/lib.rs) constrains managed-network support.

Observed deny is consistent with the disabled/unproxied branch; this is a source-supported inference, not a kernel dump. It does not refute loopback allowance in other configurations. Future allowed loopback would need policy-context analysis, not an automatic sandbox-escape label.

## 10. Public internet egress NOT VERIFIED

**PUBLIC INTERNET EGRESS ENFORCEMENT: NOT VERIFIED BY S7.** No public IP/domain/provider, reserved documentation address or unreachable-target test. Local permission denial cannot certify public egress. Network=false remains configuration evidence outside this exact observation.

Official-source research is separate from experimental client traffic and subject to a different boundary.

## 11. DNS/LAN NOT VERIFIED

**NOT RUN /NOT VERIFIED.** Fixed IPv4 literal with family4/autoSelectFamily=false, no lookup observed. No DNS servers, LAN/private devices/gateways or actual backend contacted. No scanning/discovery. Absence of DNS use in this probe is not proof a future process cannot use DNS.

## 12. Network proxy limitations

No proxy/domain/local-binding change and no proxy endpoint test. [Permissions guidance](https://learn.chatgpt.com/docs/permissions) distinguishes enabling network access from starting proxy enforcement; domain rules need an active proxy. MCP/browser/connectors/Codex service/model/auth traffic is outside this command's domain-filtering evidence.

Full effective proxy state NOT VERIFIED; no runtime-wide/no-proxy assertion from custom-file absence alone.

## 13. Actual AI OFFICE backend exposure risks

Primary section22 provides the read-only12-boundary review of src/server/http.ts: loopback/session/Origin/CSRF/project/request authority/nonces/mutations/worker channels/credential headers/debug/other local services. No endpoint contacted or real session read.

Source shows session+nonce protection beyond loopback for non-health routes; source observation is not live auth acceptance. Native callers can supply headers, so Origin/localhost cannot replace capability verification. Keep UI/bootstrap credentials away from workers and require backend-owned project/operation authority. Current per-server nonce is not shown to be a one-shot request capability.

No backend vulnerability/exploit claimed. Even this endpoint's denied connection cannot justify trusting localhost or removing independent backend protections.

## 14. Future child network tests not performed

**NOT VERIFIED /NOT RUN.** Client has no child_process import/spawn. Host test-server process is outside MXC and is not a sandbox child-inheritance test. S6 established only fixed cooperative filesystem behavior; no network status promoted retrospectively.

## 15. Filesystem boundary status

S7 minimal direct fs sanity **MXC_BEHAVIOR_VERIFIED**: A read/content matched; B read failedEPERM/-4048/open before TCP. Two marker hashes unchanged. Profile root/temp/sibling denial intent preserved; no full old matrix repeated, new write/credential/future-file/junction claim or source change.

Historical S5R2 and S6 results remain historical and scoped to their actual operations.

## 16. Process lifecycle status

One listener5200, launcher1476, client20600/reportedPPID17132, host controller/baseline17128. Fixed handles/source/executable/PID/event windows used for ownership. No live client CIM CreationDate captured before fast completion; no invented kernel ancestry proof.

Baseline socket closed; denied socket closed; server close at23:38:32.792Z reports listening=false/addressnull/activeSockets0; host server exits0 by.802Z. Exact-port LISTEN query36442 empty at23:38:45.2288816Z. Known PIDs and fixture-scoped process query absent; host17128 separately absent. Active22256alive.

No timeout/overflow/kill; deadlines2s/3s/10s/12s/20s/19s preserved. Hostile/detached cleanup, cancellation/kill escalation and crash recovery NOT VERIFIED. Evidence files retained, separate from process/socket cleanup.

## 17. Real credential isolation gaps

**NOT VERIFIED.** No real auth/.sandbox-secrets/keyring/token/SQLite read/copy/probe. Nine-key environment excludes arbitrary secrets. Prior fake-path denial does not prove credential custody across runtime env/argv/logs/IPC/tools. No real credentials needed for S7.

## 18. App-server protocol gaps

**NOT VERIFIED /NOT RUN.** No app-server/SDK/adapter/thread/turn/tool integration. CLI sandbox TCP result does not establish actual provider runtime routing, credential handling or tool containment.

## 19. Actual approvals/cancellation gaps

**NOT VERIFIED /NOT RUN.** No actual Codex approval/interrupt/cancel/completion race. Historical host-only supervisor/approval tests remain historical. Normal server shutdown and socket close do not prove runtime cancellation semantics.

## 20. Production attempt/recovery gaps

**NOT VERIFIED.** Exclusive experiment issuance is a test replay guard, not production lease/durable attempt journal/cross-process dispatch dedup/recovery or machine-crash safety. No authoritative Project State/schema changes or real worker started.

## 21. Subscription and included-only billing gaps

**NOT VERIFIED; entitlement UNKNOWN.** No account/login/subscription/model availability inquiry, inference or paid/credit usage. Zero spend is not provider-enforced included-only cap or purchased-credit fallback exclusion. Paid API and credits remain OFF.

## 22. Real worker activation decision

**BLOCKED.** Outcome A accepted for bounded loopback characterization. S7-32–42 remain NOT VERIFIED and S7-43 BLOCKED. No full network containment, arbitrary-code/hostile-process certification or M02-03 activation.

Actual preservation: AI121/121 unchanged →123only2reports; global Codex50/50; Hermes647/647; eight retained roots242files unchanged, known reparse preserved/no follow. No historical cleanup/security/install/dependency/PATH/globalconfig mutations. Google AI Studio not written, not checksum-audited.

Historical M01 300PASS/1SKIPPED, runtime-security60PASS, S5R2 12/12 and S6 acceptance were not rerun. No browser E2E or screenshot changes.

## 23. Recommended next milestone

Propose **M02-02S8 — Bounded Cooperative Child Loopback Policy Inheritance**: new owned loopback endpoint, one host baseline, one fixed MXC parent/one cooperative child, one child TCP attempt, same strict network-off policy and explicit identity/deadline/correlation/cleanup limits. No public/DNS/LAN/provider, hostile/detached or permission-relaxation scope. **Not started.**

## 24. Owner approvals required

Owner review applies to this completed concrete S7 result and a separately authorized precise S8 scope: fixed source/argv, fresh fixture/profile bindings, listener/baseline/launch/spawn/connect counts, deadlines/ownership/cleanup/retention and stop rules. No repeated permission request for S7 work already authorized/completed.

S7 one-listener/one-baseline/one-MXC/one-TCP allowances are exhausted. No next milestone, public-egress experiment, actual backend contact, M02-03/app-server/worker/model/auth/paid activation or security changes automatically.

**M02-02S7 COMPLETE — BOUNDED MXC LOOPBACK BEHAVIOR CHARACTERIZED — PUBLIC EGRESS NOT VERIFIED — REAL CODING WORKER BLOCKED.**
