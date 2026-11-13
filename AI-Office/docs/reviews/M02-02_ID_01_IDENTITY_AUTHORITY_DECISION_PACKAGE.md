# M02-02-ID-01 — Independent Identity Authority Decision Package

2026-11-13 · Asia/Jakarta · Contract finalization only · No implementation authorization inferred.

## A. Executive Decision

**ID01_CONTRACT_PARTIAL.** This package gives the owner one concrete authority candidate, explicit lifecycle recommendations, one bounded verification-only implementation proposal, and five approval groups. It cannot honestly finalize an installation-specific trust contract: no actual identity tenant/issuer, responsible provisioner, enrollment record, authentication-return mechanism, protected custody deployment, or supported Windows test host has been supplied or verified. Canonical production membership and current-run authorities are also absent. These are named prerequisites, not details an implementer may silently choose.

Recommend **ID00 Option C**, initially one local application owner, local workspace data, no public multi-user access, and a proposed Windows runtime deployment. Recommend **Microsoft Entra ID, one owner-controlled organizational tenant, OIDC v2 authorization-code flow with PKCE**, as the independent identity authority candidate for owner evaluation. This refines the unprovisioned local-broker candidate in ID00; it does not record an approved provider change. It introduces a proposed online identity dependency, which D1/D2 must explicitly accept. Local-first workspace storage does not imply offline authenticated authority.

The Microsoft service is a real independent issuer; **an actual owner tenant is NOT_IDENTIFIED, NOT_VERIFIED and NOT_SELECTED**. Do not treat the product name, a URL template, a Microsoft account already signed into this Mac, or approval of this document as a provisioned trust root. Identity integration remains **BLOCKED**. If the owner requires identity to remain fully offline, reject this candidate and retain UNPROVISIONED; a separately engineered local authority contract is then required before implementation.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · PRODUCTION_HOST_AUTHORITY_UNAVAILABLE.**

```text
executionAuthority: false
publicationAuthority: false
deliveryAuthority: false
```

All D1–D5 statuses are **PENDING_OWNER_APPROVAL**. The current instruction authorizes documentation only. No implementation milestone is reported as completed.

## B. Verified Source Context

Repository HEAD: `b7f80cdc93927bd2db000c60101bf19ce13ee0a0`, branch `main`. Current source findings below were checked against actual files; report results are attributed to their original milestones.

| Evidence | Verified meaning and limit |
|---|---|
| [ID00 architecture](M02-02_ID_00_IDENTITY_TRUST_ROOT_ARCHITECTURE_2026-11-13.md), especially B/C/F/H/I/L/Q | Proposed local-first architecture and missing independent authority, membership, current-run and freshness contracts. ID00 did not approve a broker or issuer. |
| [PI11A implementation](M02-02_PI_11A_HELD_OUTPUT_ATOMIC_OUTBOX_IMPLEMENTATION.md) and [security matrix](M02-02_PI_11A_SECURITY_GATE_MATRIX.md) | Schema10, 18 tables; fixture-only metadata/operation/sequence/HELD outbox/audit committed on one connection. Historical 1,194 PASS; no production acceptance/delivery. |
| [PI11B implementation](M02-02_PI_11B_HELD_OUTPUT_REVALIDATION_IMPLEMENTATION.md) and [security matrix](M02-02_PI_11B_SECURITY_GATE_MATRIX.md) | Historical Windows 1,295 PASS, scoped TypeScript exit0, 26 PASS / 2 PARTIAL gates. Missing authoritative current run and live membership persist. Not rerun by ID01; Windows TEMP logs are not newly available evidence. |
| [MAC01 readiness](M02-02_MAC_01_MACOS_DEVELOPMENT_READINESS_2026-11-13.md) and [MAC02 baseline](M02-02_MAC_02_ISOLATED_OFFLINE_TEST_BASELINE_2026-11-13.md) | Owner-prepared isolated native tools subsequently supported five files: 90 PASS / 0 FAIL / 0 SKIP; scoped TypeScript exit0. Other 48 test files NOT_RUN. No production identity or containment evidence. |
| [host-principal.ts](../../src/server/attempt-control/host-principal.ts), ConfigurationSchema / HostPrincipalVerification / createHostPrincipalBoundary | Only `UNPROVISIONED` configuration. `authenticate` returns principal:null/context:null; readiness denies before workspace/SQL. A configuration callback, key or issuer cannot install trust. |
| [host.ts](../../src/server/host.ts), BackendHostOptions / composeBackendHost | Creates identity/admission/publication boundaries before registry acquisition. Workspace invalidation/close fans out to those boundaries and repository resources. Composition is listener-free but registry acquisition can write locks; it is not generally effect-free. |
| [workspace-repositories.ts](../../src/server/attempt-control/workspace-repositories.ts), WorkspaceRepositoryHandle / HostWorkspaceRepositories | Lifecycle-checked narrow host facade. It has no authenticated membership reader, independent active-run reader, production principal mapping writer or HELD writer. |
| [provenance.ts](../../src/server/attempt-control/provenance.ts) and [host-session.ts](../../src/server/attempt-control/host-session.ts) | `LOCAL_TEST_FIXTURE`/`pi03-fixture-source-v1`, fixture-only issuer handles and stored session associations. Consistency is not independent authentication. |
| [repository.ts](../../src/server/attempt-control/repository.ts), readTransaction / sessionSnapshot / evaluateHeldOutputRevalidation | Existing canonical local attempt/history and same-connection checks. Ordinary host HELD revalidation denies before SQL because it lacks private fixture ownership. Do not remove that gate to use a real login. |
| [http.ts](../../src/server/http.ts), listenHttp | Bootstrap/session/CSRF possession protects current local UI transport. It is not independent account identity, owner enrollment or canonical workspace membership. |

The new persistent ID01 audit records 3,789 tracked files, four prior untracked review reports, and 34 relevant source/document hashes. It checks preservation, not external identity trust. No application tests or TypeScript compiler were run in ID01; document checks below are not new application PASS results.

## C. Deployment Model

**Recommended, awaiting owner approval:** one human owner operates one local installation and local workspaces. The first runtime platform remains Windows, subject to the existing security stop and containment gates. No worker is authorized by approving a platform recommendation.

| Boundary | Contract |
|---|---|
| A — macOS offline development | Reviewed pure contracts, protocol parsing/validation vectors and import-safe logic may be developed/tested using the isolated MAC02 tools after implementation scope approval. No Windows guard bypass. Existing 90 tests establish only their recorded scope. |
| B — proposed initial Windows runtime | Preserve existing Windows path/storage/Jobs/MXC constraints. Initial deployment itself is PENDING_OWNER_APPROVAL. Identity verification and Windows containment are separate gates. No runtime activation in the first integration slice. |
| C — future macOS runtime | Requires independent process custody, containment, credential/state protection, cancellation/closure and output-fencing design and evidence. Neither Mac tooling nor portable OIDC grants Mac worker support. |
| Online identity exception | If D1/D2 approve Entra, workspace data stays local while specifically approved authentication/metadata exchanges use the issuer. No workspace/source/output content is sent for identity verification. Network loss removes authenticated inspection availability; no cached offline authority. |
| Future expansion | Separate tenant/issuer/deployment namespaces, explicit new users/workspace enrollment and separately reviewed remote ingress. No federation, public listener, implicit account linking or cloud task store is included. |

The realm key must distinguish issuer, tenant, client registration and deployment. A future remote workspace cannot trust a local session merely because subject display names or project UUIDs match.

## D. Identity Authority Recommendation

**One recommended candidate: Microsoft Entra ID organizational single-tenant OIDC v2.** Microsoft operates the issuer/signing infrastructure; an owner-named tenant administrator operates account lifecycle, app registration, assignment and recovery. AI Office is a relying party/public native client, never an issuer. The actual tenant operator and provisioner are currently **NOT_IDENTIFIED**.

This is a conditional recommendation, not evidence that the owner has a tenant, licensing, a suitable account or administrative privileges. No account discovery, tenant inspection, registration, purchase or sign-in was performed. Provider/licensing availability must be established by the owner before selection.

| Required authority property | Concrete recommendation / unresolved binding |
|---|---|
| Issuer | Exact owner-approved `https://login.microsoftonline.com/<tenant-guid>/v2.0`; actual GUID/issuer missing. No `/common`, `/organizations`, personal-account or arbitrary tenant fallback. This template is not a configured endpoint. |
| Provisioner | Named tenant administrator registers one native public client, restricts tenant/assigned initial owner, approves redirect mechanism and publishes a provisioning receipt outside project control. Responsible person/record missing. |
| Protected anchor | Approved tenant GUID, exact issuer, client ID/audience, deployment ID, discovery/JWKS locations, allowed algorithm, profile generation and provisioning receipt. Authenticated OS TLS trust plus issuer metadata anchors signing keys; a token's supplied key URL does not. Protected installation/update ownership must be demonstrated. |
| Principal protocol | OIDC authorization code + PKCE S256, external user agent, state and nonce. Require signed ID-token validation. Use a reviewed established implementation, selected/pinned during authorized dependency review; no custom issuer or home-grown cryptography. |
| Transport | HTTPS issuer endpoints with certificate/hostname validation and fixed profile destinations. Registered native return channel must be concretely selected and independently tested; no callback listener or OS protocol registration is authorized here. |
| Custody | Issuer signing keys stay with Microsoft. No app client secret in a public client. Ephemeral code/verifier/token/challenge material stays in the verifier's private process memory for the proposed slice. No refresh-token persistence or existing browser/provider token-store reads. |
| Rotation | Approved issuer JWKS rollover with validated metadata and bounded refresh; profile/tenant/client changes require administrative generation change. Unknown key denies until refreshed from the approved source. No token-controlled root installation. |
| Revocation | Local sessions/observations invalidated by host/profile generation; future canonical membership/grants revoked by their protected writer. Entra account/session revocation does not by itself prove immediate revocation of an already issued token or an app session. |
| Recovery | Tenant administrator's independent recovery plus installation reprovisioning and explicit workspace relink. No self-signing fallback or “first login becomes owner.” |
| Source failure | Timeout, unavailable metadata/keys, uncertain clock, missing profile or unsupported claims produce DENIED/UNAVAILABLE. Preserve stop; no OS-name/JSON/fixture fallback. |

Microsoft documents [code flow with PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [ID-token claim semantics](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference), and [signing-key rollover](https://learn.microsoft.com/en-us/entra/identity-platform/signing-key-rollover). These support the candidate protocol, not this installation's provisioning or security.

Why refine ID00's broker candidate: no actual independently provisioned broker, authenticated peer protocol, protected service identity or deployment evidence exists in the inspected implementation. Creating a local service merely to return an OS username/SID/trusted string would reproduce the trust gap. Entra supplies an established independent issuer protocol, with an explicit online dependency. A real offline broker may be reconsidered only through a separate concrete owner-selected contract; it is not an automatic fallback.

## E. Provisioning and Trust Protocol

**Proposed ceremony, NOT_PERFORMED.** This list defines owner/provisioner responsibilities, not authorization to execute it.

1. Owner records D1–D5 against this document's reviewed revision/hash. D2 names tenant operator and provisioner and supplies the public tenant GUID, issuer, client ID, registered return URI/mechanism, approved endpoint policy and tenant assignment evidence. Do not send tokens, passwords, private keys or recovery codes in chat/Git.
2. Independent tenant administration establishes the initial human account and assignment; recommended phishing-resistant authentication requires tenant-policy and real protocol evidence. No assumption that `amr`, a Windows login name or an existing browser cookie proves that requirement.
3. Approved installation administration provisions the public trust profile and initial-admin enrollment intent into a protected installation location outside workspace/worker writes. The location, ACL/update owner and rollback/recovery mechanism must be supplied and reviewed under D2/D4. A JSON profile alone is an assertion; independent provisioning provenance and actual protection are necessary.
4. A future approved acquisition component initiates code flow with a verifier-owned nonce/state/PKCE transaction and exact registered return channel. Authorization code is redeemed only at the approved token endpoint. No client secret, resource-owner-password flow, implicit flow, token pasted into a UI, or client-selected issuer is allowed.
5. Existing host PI08 composition consumes evidence through its private verification seam, checks the selected profile and yields a scoped observation. It never trusts the acquisition tool's `authenticated:true`, decoded claims or a signed assertion from AI Office itself. Protocol-state and origin checks precede any domain access.
6. Provisioning receipt binds public profile digest, tenant/app/deployment, initial-admin subject reference, generation, responsible administrator, date and independent verification evidence reference. Audit digests alone do not authenticate the ceremony.

The acquisition/return-channel contract is a **remaining blocker**. Native OAuth permits specified return mechanisms; PKCE and an external browser do not make arbitrary callback handling safe. [RFC8252](https://www.rfc-editor.org/rfc/rfc8252.html) supplies the native-app constraints. D5 must name the already approved test acquisition mechanism; implementation must not quietly open a localhost listener or install a helper to resolve this gap.

No request, project file, environment override or fixture can supply a trust profile or verifier callback. No production root is generated by the host. Signing-key retrieval is from the protected issuer profile, never `jku`/`x5u` or an arbitrary URL in evidence. Metadata redirects or newly advertised hosts require policy validation; do not broaden egress automatically.

## F. Principal Verification Contract

Design contract only; no interfaces below have been added to source. Preserve current synchronous `authenticate` and `assessSessionReadiness` denials. A proposed separate async operation, `inspectIndependentIdentity`, belongs to the existing PI08 boundary. It cannot return an execution context or capability.

Ordered checks:

1. Protected profile exists, belongs to this deployment, has approved provenance/current generation and is not invalidated. Reject oversized, non-inert, accessor-bearing or malformed input before expensive work; recommended serialized evidence cap 64 KiB. No caller `atMs` or `verified` flag is trusted.
2. Require the actual approved flow transaction: state/nonce, PKCE-bound acquisition provenance, exact client/redirect/profile/host generation and unused challenge. A valid signature on an arbitrary pasted ID token is insufficient to establish this login transaction. PKCE is enforced during code redemption; token validation alone cannot prove it happened.
3. Verify signature using the approved issuer's validated keys; recommended initial allowlist RS256 only, no `none`/HS substitution or algorithm chosen by the caller. Validate exact `iss`, `tid`, `aud`, supported token version, `sub`, required `oid`, time claims, nonce and applicable authorized-party rules. Require `auth_time` for the recommended freshness policy; absence denies that profile. OIDC's checks are specified in [Core §3.1.3.7](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation).
4. Build an owned subject key `(issuer, tenantId, clientId, subject)` with independently checked tenant object ID retained for approved mapping. Display name, email, preferred username, groups and token roles do not establish AI Office ownership/membership. Mapping to the existing UUID principalId is an explicit future protected enrollment; no hash-casting or automatic row creation.
5. Recheck cancellation, profile/host generation, clock continuity and elapsed budgets after each await. Consume the challenge atomically in its private owner; an old generation/restart invalidates every challenge. Recommended challenge and session state is memory-only and never restored, avoiding a persistent replay cache in this slice.
6. Append a sanitized durable observation receipt before reporting ordinary success. If audit append fails, return UNAVAILABLE/AUDIT_UNAVAILABLE with no claimed durable receipt. No raw token, code, secret, nonce, PKCE verifier, owner nonce, full subject/email or untrusted exception text enters receipts.
7. Request authoritative membership and run assessment only through existing host/repository ownership boundaries. Current production sources are absent: return membership UNAVAILABLE and activeRun NOT_EVALUATED; overall DENIED. Do not query fixture rows and rename their consistency as production membership/run verification.

An internal observation handle must be privately registered, immutable, host/profile/challenge-bound and time-bounded. Serialization/copy/cast cannot mint one. These runtime origin checks protect ordinary API boundaries, not hostile code already inside the verifier process.

Proposed response semantics:

```text
decision: DENIED
identity: AUTHENTIC_TOKEN_OBSERVED | DENIED | UNAVAILABLE
accountRevocationCurrency: NOT_VERIFIED
membership: UNAVAILABLE | DENIED | VERIFIED_OBSERVATION
activeRun: NOT_EVALUATED | UNAVAILABLE | DENIED | VERIFIED_OBSERVATION
canonicalPrincipalId: null unless separately enrolled and resolved
auditReceiptId: durable receipt reference, or null on audit failure
executionAuthority: false
publicationAuthority: false
deliveryAuthority: false
```

`VERIFIED_OBSERVATION` membership/run branches describe the later full contract and are **unreachable with current production sources**. Authentic-token observation means protocol authenticity and the checked token time window, not current account entitlement or a production host context. Existing PI09A/PI09B receive no new positive return shape; their existing denial APIs remain intact.

## G. Membership Authority

| Fact | Existing canonical source / responsible writer | Independent verification versus assertion; proposed ownership |
|---|---|---|
| Workspace exists and is attached | [identity.ts](../../src/server/workspace/identity.ts), [registry.ts](../../src/server/workspace/registry.ts), [manager.ts](../../src/server/workspace/manager.ts): identity creation/attachment, registry persistence, open/initialize/inspect and binding lifecycle | Canonical filesystem/registry association in its current scope. Editable/copied project identity and folder access do not prove a human owner. Existing initialization can write files; it is not enrollment. |
| Human workspace owner/members | No independent production membership source/writer exists. `runtime_principal_provenance` stores fixture assertions, not owner/member enrollment. | Propose the existing protected repository as the future canonical membership owner with a separately approved writer/schema. Initial administrator identity and action-bound enrollment intent originate outside the unowned workspace. Current status UNAVAILABLE. |
| Principal UUID mapping | Existing principal provenance UUID is fixture-scoped; no production mapping enrollment exists. | Future protected writer binds qualified independently verified subject to UUID and versioned workspace registration. Duplicate/ambiguous/foreign mappings deny; login alone creates nothing. |
| Capability/policy grant and revocation | `runtime_policy_provenance` / `runtime_grant_provenance`, repository fixture provenance paths; scoped/fake capability APIs are test-only | Stored rows are assertions checked for fixture consistency. Future deterministic policy owner, authenticated admin intent and same-transaction revision/revocation writer are required. Entra app assignment/roles are not execution grants. |
| Output classification and destination permission | [output-metadata.ts](../../src/server/attempt-control/output-metadata.ts), [output-revalidation.ts](../../src/server/attempt-control/output-revalidation.ts), held stream bindings | Classification source UNVERIFIED/OFFLINE_SUPPLIED; destination/channel metadata equality is not authoritative routing permission. No production classifier, destination authorizer or delivery owner exists. Preserve NOT_EVALUATED and false authority. |

Future membership key includes realm, projectId, authorityIncarnation, explicit root registration/revision and principal mapping/revision. Caller WorkspaceRef and expected versions are comparisons only. Moving/relinking a project or restoring a duplicate project UUID requires explicit registration resolution; filesystem ownership cannot overwrite canonical membership.

**Consistency contract:** external authentication completes outside SQL; recheck owned observation generation, then use one repository connection/read snapshot for membership, attempt/run, security, sessions and policy/grant facts. No nested calls to public transaction-owning evaluators and no merge of independently read snapshots. Future authoritative changes serialize through the existing protected writer with expected-revision CAS and audit in the same transaction. Revoke-first denies stale contenders; read-first remains only a historical observation. BUSY, missing/corrupt rows or stale expected revisions deny without implicit retries or repairs.

There is no atomic transaction between Entra and local SQLite. Fresh tokens or TTLs do not close that race. Any later positive action needs its own approved external freshness/fencing and effective revocation point; this proposal does not supply it.

## H. Run-State Authority

| Fact | Existing source and responsible writer | Authority limit / required rule |
|---|---|---|
| Attempt identity, owner fence, generation | `runtime_attempts`, `runtime_owner_epochs` and `runtime_attempt_events`; DurableAttemptRepository.issue/transition and existing recovery ownership methods | Canonical local persisted attempt/history. ownerId/hostInstanceId/nonce hash fence local ownership; they do not authenticate the human or an actual worker. |
| Lifecycle/cancellation/recovery | Existing repository/control methods and [cancellation.ts](../../src/server/attempt-control/cancellation.ts), [recovery.ts](../../src/server/attempt-control/recovery.ts) | Canonical cancellation/terminal/recovery payload must be checked, not phase alone. A noLaunch cancellation can retain APPROVAL_GRANTED. A RUNNING row does not prove a live owned process. No restricted suite is run here. |
| Application/execution sessions | `runtime_application_session_bindings`, `runtime_execution_sessions`; existing fixture session writer paths / host-session validators | Stored fixture associations. No independent latest-active-run pointer, runtime invocation registration or producer authentication. |
| Run epoch | Historical `executionEpoch=attemptGeneration`; `runIncarnationId=executionSessionId` | Preserve historical meanings. Do not infer a global/current run epoch from a new attempt whose generation restarts at1. |
| Production current run | No canonical production writer/current pointer exists | Propose the existing deterministic lifecycle/repository owner as the future sole writer. Require trusted controller registration tied to verified subject, workspace registration, task/attempt/session and a distinct monotonically advanced runEpoch. Current status UNAVAILABLE. |

Future current-run registration/pointer changes, epoch increment, cancellation/revocation fencing and audit must commit together under uniqueness/CAS. A terminal, stopping, recovered, mismatched or superseded run denies. Runtime evidence must come from the future approved controller/custody boundary, not worker JSON, heartbeat possession, timestamp order, foreground project selection or a submitted runId. No separate scheduler/task store is introduced.

Loss of COMMIT acknowledgement requires explicit reconciliation by stable operation identity, not retrying a transaction body/launch. Whole consistent database rollback remains undetectable without an independent monotonic witness; **EXTERNAL_MONOTONIC_WITNESS_NOT_IMPLEMENTED** persists. No migration or rewriting immutable HELD history is included.

## I. Session and Revocation

All values here are **RECOMMENDED_ONLY**, subject to D4; none is owner-approved or a claimed Entra default. Missing approved limits deny. Issuer token lifetime is separate from these shorter relying-party acceptance limits.

| Control | Recommended reviewable rule |
|---|---|
| Initial enrollment | Tenant administrator independently identifies one human; owner separately approves exact subject-to-admin and workspace enrollment bindings. No first-use/first-login ownership. Enrollment writes are outside the first slice. |
| Flow transaction | 256-bit random state and nonce, PKCE S256 using a compliant verifier; one use, 120-second host transaction deadline. A slow consent/sign-in restarts authentication; no deadline extension from the caller. |
| Token time checks | Exact issuer expiry/not-before validation; maximum 60-second clock skew; maximum token issuance age 120 seconds for new observations; authentication age at most 300 seconds via required `auth_time`. Reject future-issued tokens beyond skew. Require at least 30 seconds until expiry without skew for observation issuance. |
| Observation | At most 30 seconds, capped by actual token expiry and remaining approved freshness budget; no action authority. Recheck host/profile/session generation at use and after awaits. No refresh by copying/replaying a receipt. |
| Host session | First slice creates no authenticated reusable UI session. If later approved: 15-minute idle / 60-minute absolute maximum, bounded by token and freshness expiry, reauthentication when any shorter bound is reached. Never extend validity merely from activity. Current HTTP session is not upgraded. |
| Authentication strength | Recommended phishing-resistant owner authentication, independently evidenced tenant policy and emitted authentication-context contract. No inference from a generic MFA flag; unavailable assurance denies that profile. Policy identifiers/claims remain owner/provisioner inputs. |
| Local invalidation | On lock/logout, close, workspace invalidation, trust/profile generation change, admin session revoke or cancellation: invalidate in-memory observations/sessions before allowing another assessment. In-flight awaits recheck generation. Trigger plumbing must be tested; it does not exist as a verified guarantee today. |
| Membership/grant changes | Future protected writer increments canonical revocation/revision in the same transaction as change/audit; next serialized assessment rejects old versions. No unmanaged membership cache. |
| External revocation | Current account-revocation currency remains NOT_VERIFIED. No finite provider-to-app revocation SLA is claimed from ID tokens or login timestamps. Local app revocation cannot promise to discover a tenant-side event immediately. Positive authority remains BLOCKED until an independently evidenced effective-point contract exists. |
| Outage/offline | Zero protected-use grace. Network/key-source unavailability denies new authenticated observations; it must not be described as a production offline login mode. Cache is not an authority fallback. |
| Budgets | 5-second per-request identity metadata/key fetch timeout, no automatic authority exchange retries in the first slice; 120-second total transaction deadline. Explicit retry creates a new challenge. Unknown kid allows at most one bounded refresh from the approved key source. |
| Clock/restart | Verifier-owned wall time for token claims; monotonic elapsed-time budgets within one known process clock domain. Clock rollback/continuity uncertainty denies; restart clears challenges/sessions/handles. No request timestamp or restored process state supplies freshness. |

Microsoft explains that [application sessions need application revocation](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access) and that [refresh-token revocation varies with the event](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens). This contract requests no refresh tokens (`offline_access` is excluded), no Graph permissions and no provider administration APIs. It does not promise account-currentness from a signed token.

## J. Recovery and Custody

**Recommended separation:** tenant administration owns account recovery; installation administration owns trusted profile/update/custody; the future deterministic repository writer owns workspace membership/run/grant state. They may be operated by one human, but provisioning must occur through independently protected administrative authority, outside request/project/worker control. The same unrestricted local user modifying the verifier defeats local enforcement; an OS credential-store label or file mode alone does not solve that threat.

Lost credential: deny use, use the tenant's independently verified recovery process, revoke affected application observations/sessions and explicitly re-enroll/relink any changed subject. No recovery through project-folder possession or an editable owner flag. Recommended recovery custody is an independent tenant recovery administrator and vendor-supported recovery method; the owner must supply an actual feasible arrangement before approval. No recovery material is generated or collected here.

Host migration: preserve project/history bytes as data; discard tokens, sessions, challenges and machine-bound trust state. Provision the approved application/profile on the new host, independently reauthenticate and approve root registration/subject relink. No private-key/token-store copy or automatic trust restoration from backup. Old host trust must be explicitly retired; uncertainty leaves both action paths stopped.

Trust-store/verifier compromise: keep stop active, invalidate local generations, isolate affected installation, have independent tenant administration revoke affected access, recover from an authenticated clean baseline, rotate/reapprove profile generation and review history. Restoring a matching old database/profile does not prove freshness. No app-minted replacement root, historical audit repair or automatic resume.

Audit receipts: recommend a dedicated protected installation security audit sink, with opaque enrollment references, deployment/profile/generation, fixed result/reason, checked source versions/time bounds, correlation ID, null-or-owned canonical references and all three false authority flags. It is not a duplicate task store or a cross-store transaction. Retention recommendation: 90 days, owner-approved export/access/delete policy; source and custody must be named under D4/D5. Local digests are consistency evidence, not independent witnessing. Audit failure blocks ordinary observation success; shutdown still denies/invalidate first and reports disposal/audit failure without resuming work.

## K. Threat Model

| Challenge | Required result / retained limitation |
|---|---|
| Client sends auth:true, decoded token, OS name, copied JSON, fixture handle | No principal authority. Only the selected independently signed protocol plus owned flow checks can create an observation. |
| Wrong tenant/audience/issuer, algorithm confusion, token-supplied key URL | Deny before workspace acquisition; pinned public profile, strict algorithm and approved metadata source. |
| Genuine stolen/replayed token | Exact owned flow nonce/state/client/deployment/generation, one-time challenge and short deadlines. Bearer theft/same-process compromise remains a threat; no proof of possession is invented. |
| Login cookie reused as fresh authentication | Required `auth_time` and separately evidenced authentication strength; absent/stale evidence denies. Browser login alone is insufficient. |
| Revoked account with unexpired signed token | Observation is not account-currentness or permission; retain revocation NOT_VERIFIED and positive authority BLOCKED. |
| Token roles or successful login become workspace owner | Separate approved subject mapping and protected membership enrollment; no bootstrap from an unowned workspace. |
| Caller currentRun/runEpoch or new session masquerades as latest | Read actual canonical lifecycle owner; missing active pointer denies. No timestamp/row-order heuristic. |
| Async verify crosses logout/close/revoke/root switch | Recheck private generations after awaits and before snapshot/receipt. Old handles cannot survive. |
| Split snapshots or concurrent stop/member/grant change | One canonical repository snapshot; future writer CAS/serialization; no external-to-SQL atomicity claim. |
| Malicious project alters profile/authority state | Protected installation boundary and platform evidence required; same-user arbitrary code inside TCB is outside in-process protection. |
| Key rollover/source outage or rollback | Bounded approved-source refresh; deny unknown/stale source; no fallback/repair. Whole-state rollback witness still absent. |
| Audit leak/failure, denied operation during shutdown | Fixed sanitized codes, opaque IDs, no credential logs; audit failure cannot yield successful receipt, and cannot prevent denial/invalidation. |
| Genuine identity unlocks production or Mac workers | Preserve PI08 legacy denials, PI09A throw/false, synchronous PI09B false, fixture-only HELD gates and Windows guards. |

This is an internal source/contract review, not independent certification, penetration testing or a delegated security review. Future non-production evidence must come from the actual independent source/platform.

## L. Source Integration Map

Paths below are relative to `AI-Office`. Existing paths/symbols exist; **new names are proposed files/APIs, NOT_CREATED**.

| Exact file/interface | Bounded future treatment |
|---|---|
| `src/server/attempt-control/host-principal.ts` — HostPrincipalConfiguration / HostPrincipalVerification / createHostPrincipalBoundary | Proposed modification: retain default UNPROVISIONED and synchronous denials; add a separate async inspection operation behind a protected approved profile. Never change existing authenticate to accept real identity or return a fixture context. |
| `src/server/host.ts` — BackendHostOptions / composeBackendHost | Proposed modification: bind private inspection/profile/audit dependencies at startup, rejecting request-installed callbacks/keys; invalidate/close them through current lifecycle. No new listener or bootstrap entrypoint. |
| `src/server/attempt-control/entra-identity-verification.ts` — NEW | Proposed strict approved-profile token verification and owned-flow observation, using a reviewed standard implementation. No signing/enrollment API, dynamic issuer or generic trusted-string adapter. Dependency/version choice is still required in D5. |
| `src/server/attempt-control/identity-observation-audit.ts` — NEW | Proposed sanitized append adapter and failure contract for a provisioned private installation sink. Exact protected path/owner is a D4/D5 input; no real store opened now. |
| `src/server/workspace/{identity,registry,manager,paths}.ts` | Existing root identity/binding validation and lifecycle; regression boundaries, unchanged in the first slice. No enrollment or platform bypass. |
| `src/server/attempt-control/workspace-repositories.ts` — WorkspaceRepositoryHandle / HostWorkspaceRepositories | Canonical host access seam for later membership/run readers. No positive reader is fabricated. Current facade lacks those capabilities; first slice reports their unavailability. No schema/facade mutation is included in the bounded proposal. |
| `src/server/attempt-control/{repository,schema,host-sqlite,provenance,host-session}.ts` | Current fixture/source/transaction semantics preserved. Production subject mapping/membership/current-run writer and schema change are separate future scopes, not modifications bundled into this slice. |
| `src/server/attempt-control/{execution-admission,output-publication}.ts` | Unchanged. Use existing actual APIs for deny regressions; PI09A always denies/throws and PI09B stays synchronous with no sink. Async inspection never enters its dependency implicitly. |
| `src/server/attempt-control/{output-metadata,output-journal,output-revalidation,security-stop}.ts` | Unchanged fixture ownership, immutable HELD records, read-only evaluation and active stop. Never call createHostIssuerForTest with a real subject. |
| `src/server/http.ts`, `src/server/index.ts`, scripts, runtime-security supervisor, contracts/testing | Unchanged and not started. No new route/session upgrade, worker, test issuer, capability engine, provider adapter or process harness. |

Proposed new tests: `tests/integration/durable-attempt-foundation/entra-identity-verification.test.ts` and `identity-observation-audit.test.ts`. Proposed focused changes to existing `host-principal.test.ts` / `host-composition.test.ts` cover the new inspection seam only. Existing `execution-admission.test.ts`, `output-publication.test.ts`, `host-session.test.ts`, `provenance.test.ts`, `output-metadata.test.ts` and `output-revalidation.test.ts` are retained regression targets, selected by platform/import audit. Full Windows-dependent files must not be forced through Mac guards. No tests were edited or run now.

## M. Minimal Implementation Slice

**Proposed next implementation: independently sourced principal observation at PI08, denial-only domain assessment. Not authorized or implemented by ID01.** This is the smallest honest increment with current source. It is not a completed six-stage production authorization integration.

| Required stage | Smallest proposed behavior / current blocker |
|---|---|
| 1. Receive independent evidence | Host-private inspection entry receives genuine Entra-issued evidence tied to an owned acquisition transaction from the separately approved non-production mechanism. No fixture principal or pasted-token shortcut. Actual tenant and return/acquisition mechanism missing. |
| 2. Verify authenticity/freshness/scope | Execute F/I against the approved profile, nonce, client/tenant/deployment/generation and real signed evidence; emit only an audited authentic-token observation, account revocation currency NOT_VERIFIED. |
| 3. Resolve authoritative membership | Require separately enrolled canonical mapping/membership at the existing repository owner. It is absent today: report UNAVAILABLE and deny. Do not create a parallel resolver that returns a trusted string. Positive resolution requires a later explicit writer/schema contract. |
| 4. Verify canonical run/state | With membership established, require actual current-run pointer, ownership/epoch/lifecycle and trusted controller registration in the same canonical source. Absent today: NOT_EVALUATED after membership failure, otherwise UNAVAILABLE. No fixture or new-session substitution. |
| 5. Feed denial-first foundations | Return overall DENIED. Preserve current actual PI08 authenticate/PI09A/PI09B paths; exercise their denial regressions alongside the inspection result. Do not claim downstream repository checks ran if short-circuited. |
| 6. Auditable result, no activation | Durable sanitized identity observation/denial receipt where sink works; no receipt claim on failure, no grant, command queue, worker, provider, publication or output dispatch. |

**Explicit scope limit:** A fully successful membership-and-run verification path cannot be implemented truthfully against today's production sources. D3 approves proposed ownership; it does not automatically authorize building the missing schema/writers. If the owner requires all six stages to verify successfully in the first increment, this bounded slice must remain blocked until a separately reviewed concrete membership/run-state implementation contract is provided. Do not label scaffolding or fixture successes as that outcome.

Permitted effects only after explicit D5 authorization: approved public metadata/key retrieval; approved real non-production authentication transactions in the named acquisition mechanism; memory-only challenge/observation state; sanitized append to a newly owned provisioned audit sink; read-only domain inspection where authoritative sources actually exist. No automatic provisioning, backend/HTTP listener, helper/service launch, user workspace acquisition, membership/grant/session-domain writes, schema migration or app dependency installation is included. Any necessary dependency manifest/lock change must be named/versioned in the D5 implementation amendment before implementation.

Stop conditions: unavailable actual issuer/provisioner/profile/flow, unsupported assurance or return-channel evidence, unprotected audit/custody, missing independent test evidence, unknown platform or need to expand effects. Preserve UNPROVISIONED and report the blocker. No workaround by issuing application tokens or loosening fixture-origin checks.

## N. Offline Test Plan

Every proposed row is **PROPOSED_NOT_RUN**. Synthetic vectors verify code behavior, not production provisioning or independently current account state. No historical safe suite or restricted process test was rerun for this document.

| Class / location | Proposed evidence and pass/deny assertions | Platform / limit |
|---|---|---|
| Pure parsing/profile tests, new verifier test | Wrong issuer/tenant/audience/algorithm/key URL, malformed/oversized/accessor input, missing auth_time/nonce, unsafe URLs deny; no project access | Mac offline after approved source/import/effect review; synthetic negatives remain synthetic. |
| Pure time/origin/replay tests | 120s deadline, 60s skew, 300s auth age, token expiry/30s remaining, monotonic discontinuity, copied handle, cross-host/profile generation, duplicate challenge and restart behavior | Mac offline; controlled clocks and crypto vectors do not prove trusted production time/custody. |
| Audit adapter tests | Approved fresh synthetic private sink, restart/reopen receipt, sanitization, write/close failure returns unavailable, no token/subject leakage | Mac only if implementation imports/effects qualify; no production store/secret read. |
| Host seam/default-deny regression | Unsupported profile rejected before registry; invalidation/close after await; real inspection observation cannot alter authenticate/admission/publication; downstream NOT_EVALUATED reported honestly | Pure cases may be isolated on Mac only after audit; full composition/registry files require Windows. |
| Canonical authority absence | Genuine verification result plus no production principal mapping/membership/current-run yields DENIED, no fixture issuance or domain mutations | Mac pure boundary checks versus Windows actual composition evidence kept separate. |
| Future membership/run consistency | One connection/snapshot, stale revisions, member revoke, cancel payload, terminal/superseded run, new attempt epoch, BUSY, lost acknowledgement, no automatic repair | New fresh owned fixtures after separate schema/writer approval; not current production trust evidence. |
| Independent real protocol interoperability | Actual named tenant/admin provisioning, registered native acquisition/return channel, signed real token, nonce/client/tenant/time checks, issuer key-source/rollover failure, applicable assurance | Approved platform protocol host and authority exchanges required; no live run now. Existing generic signed fixtures do not satisfy this row. |
| Windows-only integration | Actual listener-free host composition, approved profile/audit ACLs and lifecycle invalidation, real protocol seam, Windows canonical path/host storage behavior | Separately approved supported Windows test host; no containment experiment or worker. |
| Future runtime acceptance | Actual process identity/controller binding, effective revocation/commit ordering, containment/cancellation/recovery, authorized output pipeline | NOT_AUTHORIZED; separate future runtime scope required. No credit from present verifier plan. |

A future evidence bundle must retain source/dependency/profile-public hashes, exact selected command/host/build/time, allowlisted effects, sanitized actual outcomes and failures, real authority/provisioning references, false-flag/stop assertions and an independent reviewer/operator's acceptance record. Raw authentication responses and secrets remain outside evidence. A vector issuer controlled by a test is not independent production trust; an independent non-production tenant proves only that tested deployment, not production enrollment.

Preserve four historical suites `concurrency.test.ts`, `lease.test.ts`, `cancellation.test.ts`, `recovery.test.ts` as NOT_RUN, plus historical runtime-security process/Jobs/MXC/crash suites. Use no Windows TEMP evidence as newly recovered proof. Reuse the MAC02 harness only within its reviewed allowlist; new tests/crypto/FS/network permissions need explicit import/effect review and a new bounded harness plan.

## O. Windows Test Host Requirements

**Supported host NOT_IDENTIFIED; approval PENDING_OWNER_APPROVAL; Windows integration BLOCKED.** A Mac, compatibility shim or Windows-shaped path is not an acceptable substitute.

Before Windows-specific testing, D5 must name the host owner, host identifier, supported Windows edition/version/build and support evidence at test time; architecture, native pinned Node/tooling, approved app checkout, security/update state, operator and independently administered non-production identity source. No Windows build/support status is assumed from historical logs.

Use a newly owned disposable test directory and protected installation/profile/audit location with actual administrator/worker access separation evidence. No user/historical database, token store, old PID, recovery archive or production membership is used. Document all allowed endpoint/return-channel and filesystem effects, test account scope, receipt custody and cleanup permission; cleanup is never inferred for historical artifacts.

Tests must be listener-free at the AI Office host seam, preserve non-win32 path rejection, and require no worker/provider/process-containment execution. If the selected native authentication-return mechanism requires an additional helper/listener/OS registration, that is a separate named D5 approval/amendment before it is installed or started. Do not launch an unreviewed broker as a test convenience.

## P. Owner Authorization Matrix D1–D5

This is the **single owner decision table**. The five approvals authorize no work until their exact scope, concrete missing public bindings and revision are recorded. Generic “continue” or approval of the recommendation alone is not provisioning evidence. All statuses remain as shown.

| Group | Recommended choice | Technical rationale | Security implications | Alternatives rejected for this slice | Exact owner approval requested | Current approval status |
|---|---|---|---|---|---|---|
| **D1 — Deployment** | ID00 Option C; one local human owner, local workspace data; proposed Windows initial runtime; Mac offline development only; separately bounded online identity | Fits Windows/local-first baseline without assuming multi-user ingress or Mac containment | Accepts proposed online login dependency; network outage gives no authenticated authority. Windows deployment still subject to existing stop/runtime gates | Public/multi-user initial rollout; Mac workers inferred from compiler success; silent federation | “Approve proposed initial Windows/single-owner/local-workspace scope, Mac offline development boundary, separate future remote/Mac runtime review, and the bounded online identity dependency described in C.” If fully offline identity is required, reject this candidate explicitly | **PENDING_OWNER_APPROVAL** |
| **D2 — Identity authority** | One owner-administered Microsoft Entra organizational tenant, exact OIDC v2 issuer/client/PKCE profile in D–F | Uses an existing independent issuer standard instead of creating a self-issuing local broker | Owner must establish real administrator/provisioner and protected trust profile. No app issuer/private signing key. Tenant/account existence not assumed | Username/SID string, editable JSON, fixture issuer, locally self-minted JWT; unengineered local broker; personal/common/multi-tenant fallback | Name actual tenant operator and provisioner; supply public tenant GUID, issuer, client ID, registered return URI/mechanism, discovery/key endpoint policy, assurance/assignment and provisioning-record references; explicitly select this authority. No secrets. Without these bindings D2 cannot be closed | **PENDING_OWNER_APPROVAL** |
| **D3 — Ownership** | Independently enrolled initial admin; future protected existing repository owns subject mapping, workspace membership and current-run registration; deterministic lifecycle owner owns run/epoch/cancel; existing policy owner owns grants | Avoids duplicate task/authorization stores and caller canonicalization | Login/folder possession cannot enroll owner. Actual production mapping/membership/run writer/schema are missing and require a later bounded implementation contract | First-login owner, OS-file owner, token role as workspace grant, latest timestamp/session as current run | Identify initial administrator by independently verified qualified subject reference and enrollment receipt; approve exact workspace/root enrollment ownership and sole writer model in G/H. Explicitly acknowledge that this does not authorize schema/writer creation or produce a successful membership/run path | **PENDING_OWNER_APPROVAL** |
| **D4 — Lifecycle** | Adopt proposed I/J limits, zero offline grace, memory-only proof state, protected 90-day sanitized audit, independent tenant/installation recovery | Separates credential/session/member/run lifetimes and refuses unsupported revocation guarantees | External revocation currency remains NOT_VERIFIED; no positive action SLA. Same-user TCB compromise/rollback remains unresolved | Indefinite sessions, token validity as live entitlement, TTL as atomic revocation, secret/credential restore, app-generated recovery root | Approve or explicitly replace every I limit; name approved assurance profile, trust/custody/audit location and access/update/recovery owners, independent tenant recovery arrangement, and effective revocation limitation. Any positive authority requires a separately evidenced external fencing contract | **PENDING_OWNER_APPROVAL** |
| **D5 — Integration/testing** | Exact L/M PI08 inspection slice, new verifier/audit modules and focused tests, no source activation now; genuine non-production evidence; supported Windows host | Delivers real issuer verification at the existing seam while preserving denial-first barriers | Only explicitly named authority exchanges and sanitized audit writes; missing membership/run still denies. No listener, worker, schema migration or authenticated UI upgrade | Fixture success relabeled production; new generic auth engine; hidden helper/listener; default test/dev execution; historical TEMP as current evidence | Approve exact file/API/test/effect boundaries in L–O; name authority exchange endpoints and already approved acquisition/return mechanism; identify dependency/version amendment if needed, protected audit sink, independent evidence/operator/reviewer and supported Windows host. Confirm six-stage success is deferred until real canonical sources exist. No integration starts with these inputs absent | **PENDING_OWNER_APPROVAL** |

An owner response must identify this document/revision, each accepted group, any replacements and the required concrete public references. Partial approval does not authorize unresolved groups. Account/key provisioning, future schema work, runtime activation, historical Option A/D9/archival and final M02 acceptance are separate decisions.

## Q. PRD/M02 Exit Contract Status

**M02_EXIT_CONTRACT_NOT_VERIFIED · OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE · M02_NOT_COMPLETE.**

Available [Current Baseline](../AI_OFFICE_CURRENT_BASELINE.md) approves DEC001–006 architectural direction, while detailed roadmap/design sign-off is pending. [Current roadmap](../roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md), “M02 — Codex Runtime Feasibility,” is explicitly DRAFT FOR OWNER REVIEW / proposed design. It describes a real bounded task, interface/entitlement/billing/isolation/approval/cancellation/recovery evidence and critical gates; these are source-grounded draft expectations, not newly approved exit criteria.

[MASTER_DESIGN](../specifications/MASTER_DESIGN.md) is a design-discovery handoff, not a final PRD. [MASTER_SYSTEM](../specifications/MASTER_SYSTEM.md) has a proposed historical milestone scheme in which M02 refers to a visual office environment; that numbering cannot substitute for the current runtime milestone. The PI01 exit/security matrix and PI11B reports preserve incomplete official exit/sign-off.

The inspected documentation search found no separately approved current versioned PRD and signed official M02 acceptance contract. This is an availability finding within inspected project docs, not proof that no owner-held document exists elsewhere. Required separate product decision: owner identifies the actual approved PRD/version, canonical M02 criteria, required evidence/deferrals and acceptance authority, then performs explicit final sign-off when evidence exists. Do not add a sixth identity approval group or treat D1–D5 as product completion.

## R. Remaining Blockers

1. **Actual independent authority binding:** real tenant, provisioner/operator, app/client/issuer/return channel, assurance/assignment and independent provisioning evidence missing. Product-level recommendation is complete enough to evaluate; actual source selection stays BLOCKED.
2. **Custody and recovery:** protected profile/update/audit deployment, recovery administrator/arrangement, clock/currency guarantees and rollback limits not independently established. No secret/root was provisioned to resolve them.
3. **Canonical domain truth:** actual production principal mapping, workspace membership/enrollment writer and current-run/controller registration/pointer absent. A complete successful six-stage integration remains blocked; first slice must surface those denials honestly.
4. **D1–D5:** all PENDING_OWNER_APPROVAL, including exact dependency/acquisition/test effects and supported Windows test host. Contract-only instruction does not authorize implementation or authority exchanges.
5. **External revocation/positive effects:** independent current account status/effective revocation-to-commit/fencing unverified; Windows containment, protected state/custody/closure, provider entitlement/billing, grants/destination/classification, publication/acceptance/delivery and real bounded E2E remain separate blocked gates.
6. **Product completion:** actual approved PRD/M02 exit contract and final sign-off unavailable. Historical Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; historical archival PENDING_AUTHORIZATION; four process suites NOT_RUN. No prior failure/PARTIAL/BLOCKED or missing Windows TEMP evidence is promoted.

No broad alternate-architecture exploration or new offline output machinery is needed to make these decisions. The next authorized action is owner review of the concrete choices and missing public bindings, not implementation or installation.

## S. Final Decision

**ID01_CONTRACT_PARTIAL.** One source-grounded owner decision package and one explicitly bounded first implementation proposal delivered. `ID01_CONTRACT_READY_AWAITING_OWNER_SIGNOFF` is withheld because the actual issuer/provisioner/acquisition/custody/test-host bindings are unresolved, and a successful canonical membership/run path cannot yet be contracted against production sources. These omissions are explicit owner/external prerequisites, not fabricated approvals or generic implementation discretion.

Only this new review document was added in the application tree. All 3,789 tracked files and four prior Mac/ID00 reports were preserved by before/after byte hashes; no application source, tests, configuration, dependency/lockfile or previous report changed. New audit material is outside the repository at `/Users/rajenaria/Documents/AI-Office-Audits/M02-02-ID-01-2026-11-13-01`. Document structure/link/status and preservation checks are design evidence only; no new application test/typecheck, listener, authority protocol exchange, credential/key/root provisioning, worker/provider/output execution, database migration, commit or push occurred.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · M02_EXIT_CONTRACT_NOT_VERIFIED.**

**executionAuthority: false · publicationAuthority: false · deliveryAuthority: false.**
