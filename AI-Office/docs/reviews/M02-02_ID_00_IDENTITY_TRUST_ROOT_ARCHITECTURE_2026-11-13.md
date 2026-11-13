# M02-02-ID-00 — Independent Identity Trust-Root Architecture and Integration Contract

2026-11-13 · Asia/Jakarta · **proposal for owner review; documentation only**.

## A. Executive Decision

**ID00_ARCHITECTURE_PROPOSED_AWAITING_OWNER_DECISION.** No previously authorized production identity authority, provisioning contract or verifier was found. Recommend **ID00 Option C: local-first deployment with explicitly separated future remote trust domains**, initially operating as a proposed single-owner, local-only Windows desktop profile. The single-owner assumption requires owner approval; local-first does not prove it automatically.

The smallest subsequent slice is a **genuine independently provisioned identity verifier integrated into the existing PI08 host boundary, for audited inspection only**. It must consume an approved real authority protocol/profile, not mint a fixture issuer. Membership, active-run truth and action authorization remain separate dependencies. No implementation begins in ID00.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · OFFICIAL_M02_EXIT_CRITERIA_INCOMPLETE · PRODUCTION_HOST_AUTHORITY_UNAVAILABLE.** Execution/publication/delivery authority remain false. No authentication code, providers, keys, credentials, services, listeners, workers, database migrations or Git history changes were created/executed. No application tests or typechecks were run in ID00; all acceptance tests below are proposed.

Terminology: **ID00 Option C** means a deployment proposal. It is unrelated to **PI08 Strategy C**, the existing UNPROVISIONED denial boundary. **ID00 Option A** below is likewise unrelated to the historical **Option A — No Action / Preserve Security Stop**, which remains PENDING_OWNER_APPROVAL.

## B. Existing Architecture Findings

| Inspected source | Finding and authority limit |
|---|---|
| [Current architecture baseline](../AI_OFFICE_CURRENT_BASELINE.md), DEC001/003 and sections A/C/D | Approved direction is standalone, Windows-first, local-first, workspace-based, with a human owner. Detailed deployment/storage design remains proposed; a logical module name does not prove a separate protected service. |
| [Current roadmap](../roadmap/AI_OFFICE_ROADMAP_CURRENT_DRAFT.md), current M02/M04/M06 | Draft for owner review. Current M02 includes one real bounded worker task, not just security foundations; parallel execution and remote features are later gated work. |
| [MASTER_SYSTEM](../specifications/MASTER_SYSTEM.md), sections0/1/8; [MASTER_DESIGN](../specifications/MASTER_DESIGN.md) | System/product draft and design-discovery handoff. MASTER_DESIGN explicitly is not a final PRD. No separately finalized current PRD/versioned M02 exit sign-off was found; do not invent one or substitute legacy visual M02 numbering. |
| [PI08](M02-02_PI_08_HOST_PRINCIPAL_TRUST_ROOT_IMPLEMENTATION.md), [host-principal.ts](../../src/server/attempt-control/host-principal.ts) | Configuration accepts only UNPROVISIONED. authenticate returns AUTHENTICATION_DENIED with principal:null/context:null; readiness denies before workspace/SQL. There is no standards verifier or independent key/issuer provisioning. |
| [host.ts](../../src/server/host.ts), composeBackendHost | Creates principal, admission and publication boundaries before registry acquisition; workspace lifecycle invalidates/closes them. This is the existing integration seam, not a production identity source. |
| [PI11A](M02-02_PI_11A_HELD_OUTPUT_ATOMIC_OUTBOX_IMPLEMENTATION.md), [PI11B](M02-02_PI_11B_HELD_OUTPUT_REVALIDATION_IMPLEMENTATION.md) | Schema10/18-table foundation; fixture-only HELD metadata, same-connection atomic metadata/outbox history and read-only revalidation. All authority flags false. No production acceptance/delivery broker. |
| [MAC01](M02-02_MAC_01_MACOS_DEVELOPMENT_READINESS_2026-11-13.md), [MAC02](M02-02_MAC_02_ISOLATED_OFFLINE_TEST_BASELINE_2026-11-13.md) | Owner subsequently prepared an isolated toolchain. MAC02 verified90 passes/five files and scoped typecheck0;48 other files NOT_RUN. These are prior milestone results, not tests run by ID00 or production identity evidence. |

HEAD remains `b7f80cdc93927bd2db000c60101bf19ce13ee0a0` on main. The historical1,295-test Windows result was not rerun. Windows containment remains unsupported on Mac. Source symbol locations/hashes for32 relevant files are recorded in the new ID00 audit; no names such as Verified/Principal/Auth were treated as proof.

## C. Current Trust Boundary Map

The following enumerates identified trust-confusion points in the inspected ingress, repositories and test-authority paths. These are boundaries to preserve, **not claims that the current deny-only application has exploitable positive authorization paths**.

| Boundary/value | Actual origin and consumer | Meaning today / required production rule |
|---|---|---|
| Browser headers, bootstrap/session tokens | [http.ts](../../src/server/http.ts), listenHttp; launcher-delivered/bootstrap possession and in-memory session/CSRF comparisons | Existing local UI transport protection. Loopback/origin/header possession does not identify an independently enrolled human/service or establish project membership. Session token has no independent production principal or per-account revocation record. |
| Startup identity configuration | HostPrincipalConfiguration in host-principal.ts, passed by composeBackendHost | Only UNPROVISIONED is accepted. A request/config containing publicKey, issuer, verifier callback or authenticated:true cannot install authority. Future profile lookup must originate in protected startup composition. |
| Project identity file | [workspace/identity.ts](../../src/server/workspace/identity.ts), registry/manager attach | Portable project UUID and filesystem consistency metadata; editable/copied project files cannot enroll their holder as owner. |
| Foreground workspace and binding | [WorkspaceManager.authorize/inspect/current](../../src/server/workspace/manager.ts) | An issued in-process binding/generation, checked against canonical files/registry. It is a UI/workspace lifecycle reference, not principal membership or an active worker lease. |
| Storage provider/config/file identity | [host-sqlite.ts](../../src/server/attempt-control/host-sqlite.ts), HostSQLiteProvider; host bindings/storage.json/dev:ino checks | Host-owned configuration and file consistency. UUIDs, file ownership and a protected-looking directory do not authenticate a principal. CREATE_NEW initializes storage; OPEN_EXISTING is read-only/query_only. Neither proves independent trust. |
| ExpectedSchema/IssueSchema owner fields | [contracts.ts](../../src/server/attempt-control/contracts.ts), repository.issue/readiness | Caller expectations and synthetic issuance inputs. ownerId/hostInstanceId/ownerNonce possession and its stored hash fence repository ownership; they are not a human login or workload credential. executionMode is synthetic. |
| Principal/policy/grant rows | [provenance.ts](../../src/server/attempt-control/provenance.ts), evaluateProvenanceRows; repository.provenanceRows | Persisted canonical fixture rows. Validator requires LOCAL_TEST_FIXTURE and pi03-fixture-source-v1. ACTIVE, sourceRevision and matching FKs prove checked local associations, not independent issuance/revocation freshness. Do not relabel these rows as production grants. |
| Session IDs, generations, caller atMs | [host-session.ts](../../src/server/attempt-control/host-session.ts), evaluateSessionBinding; repository.sessionSnapshot | Fixture session/application associations, expected revisions and fixture time. They are not a trusted production clock or external session validity observation. |
| FixtureHostContext / hostIssuerForTest | createHostIssuerForTest / issueHostContextForTest | Private WeakMap object membership with a per-repository fixture issuer. It prevents tested handle forgery across fixture issuers; it does not establish a production trust root. Never issue a fixture handle from a real identity and call that integration. |
| WorkspaceRepositoryHandle | [workspace-repositories.ts](../../src/server/attempt-control/workspace-repositories.ts), acquire/run/facade | Host-owned, lifecycle-checked narrow reads/readiness. It exposes no production HELD writer or authenticated membership issuer. Callers still submit expectations. |
| Attempt lifecycle/epoch | [repository.ts](../../src/server/attempt-control/repository.ts), issue/transition/fenceForTestRecovery; lease/cancel/recovery contracts | Canonical local attempt state and owner fencing, under repository transactions. RUNNING is not independent evidence of an actual owned OS process, provider session or current external run. |
| Run incarnation aliases | PI11A/PI11B contracts and output stream bindings | runIncarnationId aliases executionSessionId; executionEpoch aliases attemptGeneration. No independently authoritative latest-active-run pointer exists. A new session row does not supersede another by implication. |
| Pure eligibility assertions | [contracts/execution-fence.ts](../../src/contracts/execution-fence.ts), evaluateWorkerAdmission/evaluateOutputPublication | Caller-supplied evidence/status/time/policy predicates. A returned eligibility decision is not authentication or a capability. A future trusted adapter must source every asserted fact independently. |
| Fake/scoped capabilities and approvals | [scoped-capability.ts](../../src/contracts/testing/scoped-capability.ts), fake-authority/durable-mock modules; [SyntheticApprovals](../../src/server/runtime-security/approval.ts) | Test-only origin/consumption/one-shot behaviour. MOCK_CAPABILITY_ISSUED, controller references and ALLOW fixture decisions cannot become production approval/grant evidence. |
| PI09A positive-looking dependency result | [execution-admission.ts](../../src/server/attempt-control/execution-admission.ts), admit / requireExecutionAdmission | Always denied, even if an injected dependency returns something positive. requireExecutionAdmission always throws. An identity verifier cannot unlock this by changing its return shape. |
| PI09B identity result | [output-publication.ts](../../src/server/attempt-control/output-publication.ts), evaluate / denyOutputPublication | Synchronous, deny-only; thenables/unknown positives deny. No sink/queue dependency. Do not silently insert an async verifier here. |
| Output fields and digest | [output-metadata.ts](../../src/server/attempt-control/output-metadata.ts), recordHeldOutputForTest / output-journal | operationId/idempotencyKey/outputId/producer/destination/classification are fixture expectations/metadata. Repository-derived immutable bindings and hashes prove checked metadata integrity, not external subject, destination, confidentiality or delivery permission. producerId currently matches the stored epoch ownerId. |
| HELD consistency result | [output-revalidation.ts](../../src/server/attempt-control/output-revalidation.ts), inspectHeldOutputSnapshot; repository.evaluateHeldOutputRevalidation | One read snapshot; fixture registry gates entry. Ordinary HOST_SQLITE short-circuits with authority unavailable. FIXTURE_METADATA_CONSISTENT remains DENIED; production authentication UNAVAILABLE and downstream authority NOT_EVALUATED. A receipt cannot be replayed as a send permit. |
| Stop/readiness and audit identifiers | [execution-readiness.ts](../../src/server/attempt-control/execution-readiness.ts), [security-stop.ts](../../src/server/attempt-control/security-stop.ts), journals | UNKNOWN/BLOCKED/ACTIVE_STOP all deny. Local journals/digests/correlation IDs are not signed identity proof, clearance, externally witnessed freshness or rollback resistance. No new CLEARED path is proposed. |

Actual call chains matter: HTTP currently calls WorkspaceManager for workspace/state/brain/DEMO routes, not a real production admission/dispatch endpoint. composeBackendHost creates PI08/09 boundaries, while [SyntheticSecurityHarness](../../src/server/runtime-security/supervisor.ts) separately calls requireExecutionAdmission before its command queue and denyOutputPublication at finish. That harness contains fork-capable code and is not a production runtime wired by HTTP. ID00 does not run it.

## D. Identity Architecture Options

| Aspect | ID00 Option A — local-first single owner | ID00 Option B — multi-user | ID00 Option C — local-first with separate future remote domains |
|---|---|---|---|
| Fit to sources | Closest initial deployment shape, but singleton owner is not yet formally approved | Adds accounts/tenant operations beyond current local product scope | Preserves local product direction while making identity scope explicit before future remote work |
| Threat model | Other local users/processes, stolen session proof, malicious project/worker, editable state; same-user code compromise needs a real protection boundary | Adds remote attackers, tenant confusion, account recovery/session theft and network/service compromise | Includes A initially; B applies only to a separately authorized remote realm, with no implicit trust bridge |
| Trust anchor | Independently provisioned OS-authenticated broker/approved local identity authority; externally approved owner enrollment and application audience | Approved account/IdP authority with standards verification, server-side sessions and tenant/workspace ownership | A's approved root initially; future remote issuer/audience/tenant/deployment roots remain distinct |
| Credentials/keys | Broker custody and OS peer identity; app must not hold issuer-signing secrets. Any client binding/session secret has separate limited custody | IdP lifecycle, protected session store, access/refresh credentials where approved; public desktop client must not rely on an embedded shared secret | Separate credentials per realm; no local key, OS name or cached browser session becomes a remote credential |
| Revocation | Broker/host-session invalidation plus protected per-project membership/run revisions; no unmanaged offline grace for protected decisions | Provider revocation/session termination plus server membership/run revisions; disconnects and stale replicas deny | Independent revocation epochs per realm; local availability never excuses unavailable remote authority |
| Portability | Move project IDs/content, then re-enroll device/owner/roots. OS identity and machine-bound custody do not silently migrate | Account identity may persist; new device/session, tenant membership and workload enrollment still verified | Portable qualified domain IDs; explicit migration/relink and reauthentication, not private-key/session copying |
| Operations/complexity | No mandatory hosted account service, but protected broker/bootstrap/update/recovery are substantial work and absent today | Hosting/IdP/client registration, TLS/session management, account recovery, membership administration and service identities | A-sized initial implementation plus qualified identifiers/ports; defer federation and remote services rather than building both now |
| Main risk | Treating same-user storage/Keychain/username as independent protection, or self-enrolling the app as owner | Trusting identity-token roles as workspace permission, tenant mixing or pretending cached claims are current | Designing a generic new framework instead of integrating the existing host/repository; control scope through one selected profile |

Keychain can be a custody mechanism in a future Mac design; it does not establish principal entitlement, workspace membership or run ownership. Merely running a broker in another process under the same unrestricted identity also does not establish independence.

For B or a future remote realm, use an established OIDC/OAuth profile, not a bespoke token protocol. OIDC defines issuer/audience/expiry/nonce and ID-token validation; it does not supply AI Office membership or run truth. Native public-client OAuth uses an external user agent and PKCE; RFC9700 adds current replay/refresh-token protections. These are protocol constraints if selected, not proof of a configured provider. [OIDC Core3.1.3.7](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation), [RFC8252](https://www.rfc-editor.org/rfc/rfc8252.html), [RFC9700](https://www.rfc-editor.org/rfc/rfc9700.html).

## E. Recommended Deployment Model

**Recommend C with A's local-only topology for the first approved profile.** One owner operates one installed host; no remote/multi-user listener, tenant service or account system is introduced in the first slice. The recommendation follows Windows/local-first DEC001/003 and deferred remote gates. It does not assert a finalized PRD or owner approval.

Every principal/project reference must nevertheless carry an **authority/realm/deployment namespace**. Future remote identities are qualified by their actual issuer and tenant; a local subject cannot be automatically linked to a remote subject by matching username, email, UUID, path or display name. A workspace belongs to exactly one authoritative realm at a time. Migration requires explicit verified ownership/relink decisions; local cached state cannot become the remote authority database.

If the owner actually needs multiple humans/remote access initially, select B before implementing login/membership; do not ship A and silently expose it to a network. No federation/account linking or external IdP vendor is selected by ID00.

## F. Independent Trust Anchor Design

**Proposed local authority chain; no component below is provisioned today:**

| Fact/claim | Issuer/owner | Independent verifier and root of trust |
|---|---|---|
| Enrollment of the application authority/profile and initial administrator | Human owner through an approved installer/admin ceremony outside workspace/application request control | Protected profile loader verifies the approved provisioning record/root. It cannot accept a root bundled in the incoming claim or editable project config. |
| Local OS logon identity | OS authentication subsystem | A separately protected, owner-approved broker authenticates the IPC peer using the selected platform's actual security token/channel mechanisms; supplied username/PID/header is insufficient. |
| Application-scoped identity response | That independently provisioned broker, bound to subject, deployment, audience, session and a fresh challenge/channel | Host verifier checks the broker's independently established identity/protocol and freshness against the protected profile. The application does not generate/accept its own production issuer. |
| Initial workspace ownership | Provisioner/owner's separately authenticated enrollment intent, tied to the exact project and root registration | Future protected membership writer validates that authority and current policy; it never accepts owner:true or possession of project.json as enrollment. |
| Membership changes / active run facts | Existing domain owners evolved into protected repository commands, with independently authenticated admin intent / trusted runtime-controller observations | Same canonical repository validates provenance/revisions and records atomic transitions; read ports return repository-owned observations, not caller state. |

For the Windows-first candidate, evaluate authenticated local IPC with explicit access policy, authenticated server identity, OS-derived client token/logon session and approved application identity/custody. Named-pipe defaults are not sufficient: Microsoft documents explicit security descriptors/access checks and logon-SID restrictions. A pipe name, DACL, PID or SID string alone is not the complete handshake/provisioning design. Exact broker protocol and its security review remain owner prerequisites. [Microsoft named-pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights).

Provisioning must name who administers the authority, its protocol/endpoint or OS service identity, permitted audiences, deployment ID, allowed credential kinds/algorithms where applicable, trusted verification-key source, custody/access controls, trust generation, key validity/rotation/revocation and recovery procedure. A profile's parser/schema is not its authenticity. No automatic trust-on-first-use, client-selected key URL, downloaded arbitrary root, environment-selected issuer or locally generated fallback key.

Protect the verifier/update path, profile and administrative stores from untrusted project/worker writes. Protect broker issuer credentials from the host/worker where the chosen model requires independence. A writable trust store or arbitrary code execution inside the verifier TCB defeats this contract; no WeakMap, signature check or Keychain label repairs that. If the required separation cannot be demonstrated on the deployment platform, keep production authority unavailable or return to an independently managed account authority with owner approval.

Trust-anchor rotation is an authenticated administrative operation with monotonically versioned profile generations. Emergency compromise invalidates dependent sessions/handles and pending assessments, preserves the security stop and requires recovery from an independently trusted channel/clean baseline. Backups do not automatically restore trust, freshness or old grants.

## G. Proposed TypeScript Interfaces

**Design notation only.** These interfaces are not source files, an implemented verifier or approved wire format. Concrete protocol adapters must use the selected standard/OS contract and runtime validation; types, readonly and brands are not proof. No issuer-signing API belongs in the application verifier.

```ts
type Realm =
  | Readonly<{ kind: "LOCAL_DESKTOP"; authorityId: string; deploymentId: string }>
  | Readonly<{ kind: "REMOTE_TENANT"; authorityId: string;
      deploymentId: string; issuer: string; tenantId: string }>;

type SubjectKey = Readonly<{
  realm: Realm; issuer: string; subject: string; kind: "HUMAN" | "SERVICE";
}>; // Never email, display name or filesystem owner as the canonical key.

type Freshness = Readonly<{
  sourceId: string; sourceRevision: number; snapshotId: string;
  observedAtMs: number; validUntilMs: number;
  trustGeneration: number; revocationRevision: number;
  hostGeneration: number; clockDomainId: string;
}>;

type TrustProfileSummary = Readonly<{
  profileId: string; realm: Realm;
  protocol: "OS_AUTHENTICATED_BROKER" | "OIDC_CODE_PKCE";
  issuer: string; audiences: readonly string[];
  trustGeneration: number; provisioningReceiptId: string;
  maxCredentialAgeMs: number; maxClockSkewMs: number;
  challengeLifetimeMs: number; sessionIdleMs: number; sessionAbsoluteMs: number;
  maxRevocationAgeMs: number; maxObservationAgeMs: number;
  offlineProtectedUse: "DENY";
}>; // All limits required from the approved profile; no permissive defaults.

// Private to the verification module in an implementation. Serialization, an
// `as` cast, or reproducing this shape must fail runtime origin/lifetime checks.
declare const privateOrigin: unique symbol;
type Handle<K extends string> = Readonly<{ [privateOrigin]: K }>;
type ProfileHandle = Handle<"PROFILE">;
type PeerHandle = Handle<"AUTHENTICATED_CHANNEL">;
type ChallengeHandle = Handle<"UNUSED_CHALLENGE">;
type PrincipalHandle = Handle<"VERIFIED_PRINCIPAL">;
type MembershipHandle = Handle<"CURRENT_MEMBERSHIP">;
type RunHandle = Handle<"CURRENT_RUN">;

type Failure = "UNPROVISIONED" | "AUTHORITY_UNAVAILABLE" | "INVALID_PROOF" |
  "EXPIRED" | "REPLAY" | "REVOKED" | "CLOCK_UNTRUSTED" | "WRONG_REALM" |
  "MEMBERSHIP_DENIED" | "RUN_MISMATCH" | "STALE_REVISION" |
  "HOST_INVALIDATED" | "AUDIT_UNAVAILABLE";
type Check<T> =
  | Readonly<{ status: "VERIFIED"; value: T; auditReceiptId: string }>
  | Readonly<{ status: "DENIED" | "UNAVAILABLE"; reason: Failure;
      correlationId: string }>;

type PrincipalSummary = Readonly<{
  subject: SubjectKey; sessionId: string; sessionRevision: number;
  authenticatedAtMs: number; credentialExpiresAtMs: number;
  freshness: Freshness;
}>;
type WorkspaceRef = Readonly<{
  realm: Realm; projectId: string; authorityIncarnation: string;
  registrationId: string; registrationRevision: number;
  bindingId: string; bindingGeneration: number;
}>;
type MembershipSummary = Readonly<{
  subject: SubjectKey; workspace: WorkspaceRef;
  roles: readonly ("OWNER" | "READER" | "OPERATOR")[];
  membershipRevision: number; freshness: Freshness;
}>; // Role membership is an input to policy, never an execution grant.
type RunExpectation = Readonly<{
  taskId: string; attemptId: string; attemptGeneration: number;
  executionSessionId: string; runId: string; runEpoch: number;
}>; // Caller expectations only; resolver must query its canonical source.
type RunSummary = Readonly<{
  workspace: WorkspaceRef; taskId: string; attemptId: string;
  attemptGeneration: number; attemptStateVersion: number;
  executionSessionId: string; runId: string; runEpoch: number;
  runRevision: number; ownerSubject: SubjectKey; producerSubject: SubjectKey;
  lifecycle: "REGISTERED" | "ACTIVE" | "STOPPING" | "TERMINAL";
  runtimeEvidenceRef: string | null; freshness: Freshness;
}>;

// Startup-only dependencies from protected composition; never HTTP-supplied
// callbacks/config. Profile/channel/challenge handles have no public mint factory.
interface ProvisionedProfileReader {
  openApprovedProfile(profileId: string): Promise<Check<ProfileHandle>>;
}
interface PrincipalVerifier {
  verify(profile: ProfileHandle, peer: PeerHandle, challenge: ChallengeHandle,
    untrustedResponse: unknown): Promise<Check<PrincipalHandle>>;
  summarize(principal: PrincipalHandle): PrincipalSummary;
}
interface MembershipReader {
  observe(principal: PrincipalHandle, expected: WorkspaceRef):
    Promise<Check<MembershipHandle>>;
  summarize(membership: MembershipHandle): MembershipSummary;
}
interface ActiveRunReader {
  observe(principal: PrincipalHandle, membership: MembershipHandle,
    expected: RunExpectation): Promise<Check<RunHandle>>;
  summarize(run: RunHandle): RunSummary;
}

type AuditObservation = Readonly<{
  correlationId: string; deploymentId: string; profileId: string;
  trustGeneration: number; principalRef: string | null;
  projectId: string | null; sourceRevisions: Readonly<Record<string, number>>;
  outcome: "VERIFIED_OBSERVATION" | "DENIED" | "UNAVAILABLE";
  reasonCode: string; observedAtMs: number;
  executionAuthority: false; publicationAuthority: false; deliveryAuthority: false;
}>;
interface IdentityObservationAudit {
  append(event: AuditObservation): Promise<Check<Readonly<{ receiptId: string }>>>;
} // Separately authorized audit write; not a membership/grant/action writer.

type IdentityInspection = Readonly<{
  decision: "DENIED";
  identity: "VERIFIED_OBSERVATION" | "DENIED" | "UNAVAILABLE";
  membership: "VERIFIED_OBSERVATION" | "DENIED" | "NOT_EVALUATED";
  activeRun: "VERIFIED_OBSERVATION" | "DENIED" | "NOT_EVALUATED";
  canonicalPrincipalId: string | null; auditReceiptId: string;
  executionAuthority: false; publicationAuthority: false; deliveryAuthority: false;
}>;
```

Implementation requirements behind these signatures: strict bounded inert inputs; independent protocol verification before handle registration; private runtime registries for profile/channel/challenge/principal origins; exact realm/source/host-generation matching; immutable owned snapshots; consumed/expired challenges; no exported factory accepting parsed claims as trusted. Existing fixture registries remain separate. These object-origin checks protect ordinary caller paths, not malicious code inside the trusted Node realm.

Qualified SubjectKey must map through an approved protected binding to the existing UUID principalId. No truncating/hash-casting an OIDC subject into a UUID, no automatic linking by email, and no assumption that ownerId/producerId equals a human principalId. The initial verifier-only slice may leave canonicalPrincipalId null; it does not create rows to make the mapping appear provisioned.

The proposed async verification is deliberately distinct from current synchronous authenticate/publication contracts. Existing PI09B must not receive a Promise and treat it as verified; network/IPC verification happens before any SQLite transaction and an internal owned observation is consumed synchronously only where a future reviewed contract permits it.

## H. Workspace Membership Authority

**Proposed local source of truth:** protected, project-scoped membership/registration records owned by the existing authority repository, added only under a future approved schema/write profile. The independently enrolled administrator issues authenticated, action-bound administrative intent. The existing command/policy boundary validates it; one protected writer commits registration/membership revision and its audit event. This is a membership fact source integrated with the current owner, not a second grant/policy engine.

Bootstrap ownership cannot be circular: the provisioning ceremony identifies the initial administrator and approved workspace registration; an unowned project cannot authorize the caller to become its owner merely because it lacks a membership row. No registration is synthesized from registry.json, a copied project UUID, host config, a successful login or OS read/write access.

Bind realm/project/incarnation to a protected registration ID, host storage binding and independently validated canonical root identity. Revalidate actual path/file keys using the existing platform policy. Moving/replacing/relinking a root or attaching duplicate project identity requires explicit ownership resolution and a new registration/binding revision; it never imports membership from the folder. Membership binds SubjectKey to registration and permitted role scope; the existing policy/grant machinery still decides each action.

MembershipReader performs scoped reads from that canonical source, not a role passed in a JWT/UI request. A remote IdP's group claim is not AI Office workspace membership unless an approved, versioned mapping makes it authoritative for that exact resource. Remote deployment would move this source/writer to the authoritative server; the desktop cache remains an observation only.

Existing schema10 has no such production enrollment/membership authority. host-session's application/execution rows, WorkspaceManager bindings and HostSQLiteConfig cannot stand in for it. Current HostSQLite OPEN_EXISTING remains read-only; no writer or schema change is authorized by this design.

## I. Active Run Authority

Keep one logical lifecycle owner: the deterministic orchestrator/authority repository envisaged by DEC002. Introduce no parallel task scheduler or independently mutable run database. A future protected run-registration command must consume authenticated runtime-controller observations and existing canonical attempt ownership, not a worker's own claimed run ID. Actual OS invocation/closure/containment evidence remains a separate prerequisite; logical ACTIVE never certifies process isolation.

Proposed current-run namespace: **(realm, projectId, authorityIncarnation, taskId)**. A durable pointer identifies its current runId plus monotonically advancing runEpoch/runRevision; it is not keyed by runId itself, which could not establish supersession between runs. Existing project-wide conflictHeld issuance constraints remain enforced; designing a task namespace does not enable parallel attempts.

A registration ties runId to attemptId, attemptGeneration, executionSessionId, exact workspace binding/generation, host/runtime incarnation and qualified owner/producer service subjects. Producer identity is distinct from the human initiating work. Current fixture producerId=epoch.ownerId semantics remain unchanged; any production mapping requires explicit compatibility/schema review.

Allocate/update the pointer and corresponding attempt/run audit under the same protected repository transaction with uniqueness/CAS and expected versions. A new attempt can reset its attemptGeneration to1, so runEpoch must not be an alias of that counter. Terminal/cancel/recovery state fences the run; registration/pointer changes never resurrect an old attempt. Do not infer latest from timestamps, row order, foreground selection, heartbeat possession or two session rows.

The existing aliases runIncarnationId=executionSessionId and executionEpoch=attemptGeneration stay as historical semantics. A new independently sourced run binding must be represented explicitly, not retrofitted into immutable HELD snapshots. No active-run table, API or proof exists today; ActiveRunReader must report UNAVAILABLE until its actual writer/source contract is provisioned.

## J. Session and Revocation Model

Separate four lifetimes: issuer credential; authenticated host/UI session; workspace membership/binding; run/attempt ownership. Each carries its own source revision and revocation state. None refreshes another merely by being present. Provider subscription/model entitlement and service/workload credentials are separate again.

The approved profile must supply exact challenge, credential-age, clock-skew, idle/absolute-session, observation-age and revocation-freshness limits. Missing/invalid limits deny; ID00 does not invent defaults or claim an assurance level. NIST distinguishes authentication/session requirements and reauthentication; its guidance does not certify this proposed app. [NIST SP800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html).

One-time authentication responses are bound to a host-generated challenge, audience/deployment, authenticated channel/session and request intent. Consume their challenge/code atomically at the protocol's chosen replay owner; host restart changes generation and invalidates old challenges/handles. A jti string or process-local Set alone is insufficient across restart. Session reuse is not automatically a replay: legitimate authenticated requests require current server-side session verification and operation/idempotency semantics, not repeated acceptance of an old login response.

Use verifier-owned wall time for issuer expiry/nbf checks and monotonic time within a known clock domain for elapsed-time budgets. Never trust request.atMs. Recheck expiry, host generation and cancellation after awaits. Clock rollback/unknown continuity, source outage, unconfirmed revocation/rotation or expired data produce explicit denial/unavailability. No automatic local/remote/fixture fallback, no cached protected-use grace and no session refresh that resets membership/run revisions without checking them.

Session logout/revocation, membership changes, workspace detach/switch, host close/restart and trust generation changes invalidate affected observations/handles. Preserve existing lifecycle invalidation ordering in host.ts; do not interpret invalidation as clearance or permission to force-kill a process. Existing separately authorized safety controls must retain their own policy; ordinary identity/audit failure neither clears SECURITY_STOP nor manufactures new cancellation/cleanup authority.

**SQLite/freshness contract:**

1. Verify external identity/channel/revocation evidence outside SQL; bound timeouts and capture source/host/profile revisions. Never perform IPC/network calls or await inside repository transactions.
2. A read-only assessment uses one repository-owned connection/read snapshot for attempt, owner generation, cancellation/recovery, session, security journal, policy/grant and any future canonical membership/run rows. Reuse private same-connection helpers; do not compose public repository calls into nested transactions or merge independently read snapshots.
3. Validate exact expected project/incarnation/task/attempt/owner/epoch/state/security/policy/session/membership/run revisions. A snapshot result remains a point-in-time observation with all authority false; reading again after an external call still does not make it a reusable execution/delivery permit.
4. Future authoritative membership/run mutations and action metadata must serialize through the same protected writer/BEGIN IMMEDIATE boundary. Revocation committed first makes a stale contender deny; acceptance committed first is historical and any later external effect still requires its own current fencing/authorization.
5. External identity/IdP revocation and local SQLite are not one atomic system. A fetched token, signed timestamp or cached revision cannot guarantee revocation currency at local COMMIT. Before any future positive activation, approve and demonstrate either a shared authoritative decision/serialization boundary or an operation-bound freshness/fencing protocol whose revocation linearization point is explicit. If the source cannot provide the required guarantee, keep the protected action BLOCKED; do not promise immediate revocation or zero TOCTOU from a TTL.
6. Lost COMMIT acknowledgment requires explicit reconciliation by stable operation ID, not automatic body/transport retry. Local hash consistency does not detect a complete older consistent database/profile restore; external monotonic witness remains NOT_IMPLEMENTED. An identity success does not close that gap.

## K. Threat Model

| Threat | Required control / retained limit |
|---|---|
| Forged principal, header, auth:true or borrowed fixture handle | Reject untrusted shape/status as evidence; verify actual protocol/root/channel and runtime-owned handle origin. Fixture/serialized contexts never cross into production. |
| Rogue local service or copied OS username/SID string | Independently authenticated IPC service/client identities and approved enrollment; no trust from pipe/socket name, path ACL or same-UID process alone. |
| Stolen/replayed proof | Audience/deployment/channel/challenge/session binding, one-time consumption, expiry, current session/revocation and generation checks. Identifier uniqueness alone is insufficient. |
| Workspace/tenant confusion, symlink/relink/duplicate project ID | Qualified realms and protected registration membership plus existing canonical-root checks; deny ambiguous/moved bindings and local-to-remote identity substitution. |
| Stale membership/run/epoch and concurrent revocation | Read canonical revisions within one SQL snapshot; serialize authoritative writes; require separate external freshness/fencing before future effects. Never derive latest run from caller-selected fields. |
| Revoked identity, trust-key rotation, offline source | Required revocation/profile checks; deny unknown/expired/missing key source, no permissive cached fallback or implicit alternate issuer. |
| Algorithm/key-selection or issuer confusion | Selected protocol/library profile with pinned issuer/audience/allowed verification rules; no caller-controlled key URL/algorithm trust negotiation. ID token, API access token and workload credential have distinct validation/usage profiles. |
| Trust-store/verifier compromise | Protected provisioning/update/custody, generation invalidation and out-of-band recovery. Treat TCB compromise as a stop, not a reason to self-sign a replacement root. |
| Malicious project/worker altering state/evidence | Protected authority storage and platform containment remain prerequisites; folder modes/Keychain/DB checksums are not full same-user isolation. |
| Audit leakage/tampering/rollback | Safe fixed reasons and opaque principal/receipt refs, approved retention/access, append-only protected writer and reconciliation. No raw credentials/tokens/owner nonce/SQL errors. A local digest is not a witness/signature. |
| Denial/audit-service outage | Fail closed for ordinary protected observations/actions; bounded timeouts and safe correlation IDs. Do not disable separately authorized safety controls or create implicit force-cleanup permission. |

Public failures should expose a generic denial/unavailability plus correlation ID; trusted audit may distinguish expired/revoked/replay/mismatch/source outage using fixed codes. Do not log raw claim envelopes, keys, credentials, broker challenges, token fingerprints or potentially sensitive canonical paths. Use an authorized internal principal reference rather than a reversible/guessable hash of an OS username/SID.

## L. Integration Point Map

| Exact existing file/interface | Proposed integration / operation class |
|---|---|
| host-principal.ts: HostPrincipalConfiguration, createHostPrincipalBoundary, HostPrincipalVerification | Evolve the existing boundary with an explicit approved verification-only profile and internal verifier. Preserve default UNPROVISIONED and current authenticate/assessSessionReadiness denials. New async inspection must not be mistaken for an action grant. |
| host.ts: BackendHostOptions, composeBackendHost | Load/validate protected profile through trusted composition before project resource acquisition. No HTTP-installed callbacks/keys. Retain invalidation/close fan-out; await external verification outside SQL. |
| http.ts: listenHttp and session routes; index.ts / scripts/dev.mjs bootstrap | Existing local session stays DEMO transport. Any later independently authenticated session/pairing ingress is a separate explicit scope; do not promote present headers/bootstrap to production principal or add a listener in the first slice. |
| workspace/identity.ts, registry.ts, manager.ts: acquire, authorize, inspect | Retain filesystem/project attachment identity. Future subject membership is an additional check, not a replacement. These operations are not all read-only: registry/initialize/open lifecycle can write metadata/locks. They must not be used as implicit enrollment. |
| workspace-repositories.ts: acquire/run/WorkspaceRepositoryHandle | Future verified-principal + membership checks before protected acquisition, then canonical lifecycle revalidation; narrow facade remains read-only. Current inspection takes a binding, not an authenticated subject. |
| repository.ts: assessExecutionReadiness, assessProvenanceReadiness, assessSessionReadiness, private readTransaction/sessionSnapshot/provenanceRows | Keep current outputs deny-only; reuse same-connection consistency helpers. Production source support requires an explicit validated profile/schema design, not changing fixture source strings. |
| host-session.ts / provenance.ts: fixture schemas, createHostIssuerForTest, evaluateSessionBinding/evaluateProvenanceRows | Preserve fixture-origin semantics. Future production binding has independently verified source references and qualified identity mapping; never route it through the fixture issuer or pretend old fixture rows became production. |
| execution-admission.ts: admit/requireExecutionAdmission | Preserve admitted:false/throwing barrier. Any later positive execution change is a different authorized milestone after every identity, policy, runtime, stop and provider gate; not part of verifier integration. |
| output-publication.ts: evaluate/denyOutputPublication | Preserve synchronous deny-only barrier and no sink. Async identity verification must not be silently inserted into this contract; future bridging needs an owned preverified observation and separate scope. |
| repository.ts: recordHeldOutputForTest/evaluateHeldOutputRevalidation; output-metadata.ts/output-revalidation.ts/output-journal.ts | Fixture writer remains fixture-only; revalidation stays read-only/DENIED. Later production metadata association may reference verified subject/membership/run receipts under approved schema, without rewriting historical snapshots or granting delivery. |
| schema.ts / host-sqlite.ts | Future principal mapping, membership/current-run/revocation rows require deliberate schema/profile/version/digest/open-path review and protected write authority. Current schema10/OPEN_EXISTING read-only checks remain unchanged. No automatic migration. |
| security-stop.ts, journal.ts, repository.activateSecurityStop / ownership fencing/cancellation/recovery | Existing stop/history/control ownership remains authoritative within its scope. New identity cannot issue clearance, resume, overwrite uncertain history or certify process closure. |
| runtime-security/supervisor.ts and contracts/testing/* | Regression boundaries only. No fake issuer/capability/approval becomes an adapter, and no harness/fork/containment experiment is launched to test identity. |

**Read-only versus writes:** signature/OS-proof verification, source introspection and repository assessment do not authorize domain mutations. An audit append is a separate protected write, even when the inspected business data is read-only. Session/challenge replay registration, initial ownership enrollment, membership/revocation changes, subject-to-principal mapping, active-run pointer changes and action/grant consumption all need explicitly authorized protected writers. Identity proof alone grants none of these.

## M. Dependency Ordering

1. Owner approves deployment/threat boundary and names the independent provisioner/source/protocol/profile. No root is synthesized to unblock development.
2. Review bootstrap/custody/update/recovery and trusted clock/revocation/freshness guarantees, plus the accepted non-production verification evidence and supported integration test host.
3. Implement only the genuine verification/inspection slice in Q through PI08/host composition, with durable sanitized observation receipts; all action boundaries remain denied.
4. Separately approve protected canonical principal mapping/workspace enrollment/membership writes and source-version rules, then read membership through the existing facade/manager boundary.
5. Separately establish authoritative run registration/current pointer from the deterministic lifecycle owner and trusted runtime evidence; preserve existing attempt fencing and no positive launch.
6. Review same-transaction policy/grant/admission/held-output integration and external freshness guarantees. Destination/confidentiality authority, payload custody, containment, provider entitlement/billing and authorized output acceptance remain additional gates.
7. Only under later exact authorization could execution/delivery infrastructure and bounded E2E evidence be considered; final M02 criteria/sign-off remain outstanding. This is not an executable queue and does not automatically schedule PI11C.

## N. Acceptance Test Plan

**Every row is PROPOSED_NOT_RUN in ID00.** Unit/protocol-vector tests are not production proof; offline fixtures must not issue a substitute production identity. Production checks require a separately authorized independent non-production authority deployment and, ultimately, explicit production acceptance evidence.

| Scenario | Unit / protocol checks | Offline integration against real application source | Future authoritative acceptance |
|---|---|---|---|
| Valid identity | Selected authority's valid interoperability vectors; strict issuer/audience/subject parsing | Real verifier -> PI08/composeBackendHost -> sanitized observation, all authority false | Independently provisioned test principal/channel proves the selected source and deployment binding |
| Invalid/forged claims | Bad signature/OS evidence, wrong root/algorithm/issuer/audience, auth:true/callback/accessor/oversized input | Deny before project/DB acquisition; no fallback | Rogue client/service and tampered enrollment rejected under actual platform protections |
| Membership mismatch/isolation | Wrong subject/realm/project/registration/role/version | Owned A/B projects, missing/revoked/duplicate/moved membership; no cross-project receipt reuse | Owner-enrolled source and actual protected writer/read permissions verified |
| Revocation/rotation | Credential/session/key/trust generation invalidation; unknown key denied | Existing handles invalid after source/host generation change; no stale observation survives await | Source outage/rotation/revocation effective-point evidence and recovery ceremony |
| Expiry/replay | Credential/challenge/session expiry; nonce/code reuse; permitted session reuse distinguished | Restart/lost clock domain/old browser session and consumed response deny | Actual protocol replay/freshness semantics and authenticated channel demonstrated |
| Run ownership mismatch | Qualified owner/producer and attempt/session mismatch | Current pointer differs from expected run; old run cannot use a new owner's receipts | Actual independently authenticated runtime-controller binding; no identity inference from worker JSON |
| Stale epoch/lifecycle | Distinct runEpoch vs attemptGeneration; terminal/cancel/recovery denial | Same-connection canonical epoch/version changes fence old observations; no phase-only cancellation shortcut | Real lifecycle/closure and no-resurrection evidence after separately authorized runtime work |
| Source unavailable | Bounded timeout/malformed/revocation unavailable | DENIED/UNAVAILABLE with downstream NOT_EVALUATED; no local/fixture/remote fallback | Effective source failure policy, revocation SLA and recovery verified |
| Concurrent membership/run/stop changes | Deterministic ordering model | Two owned SQLite connections: revoke-first/commit-first snapshots, CAS conflicts, BUSY, lost acknowledgment, no nested transactions | External revocation/SQLite race guarantee tested at the actual decision owner; no TTL-only atomicity claim |
| Persistent audit receipts | Sanitization/fixed reasons/no secret fields, duplicate-event semantics | New private audit sink; reopen retains receipt; failure causes ordinary verification unavailability; no mutation of HELD history | Protected append/custody/retention/recovery and authorized observer access verified |
| Default-deny regression | Fixture, serialized and otherwise genuine identity success cannot confer an action | Existing PI08/09 and HELD regressions; execution/publication/delivery false, stop preserved, no listeners/processes/provider calls | No positive runtime acceptance credited without separate critical-gate authorization |
| Compromised trust store/rollback | Unapproved profile/older generation/source substitution | Fail closed/quarantine; no auto-key generation, history repair or old-DB promotion | Independent recovery/witness boundary; current missing witness remains explicit |

The existing MAC02 five-file baseline can guard unrelated contract/import regressions after a future source change. It is not adequate coverage of a new verifier. Windows registry/host composition requires a supported Windows offline host: ProjectRegistry.acquire calls Windows-only validateLocalPath even before workspace storage is configured. Do not remove that check to run a convenient Mac integration test. New unit tests may run on Mac where imports/guards are safe; any allowlist expansion needs its own review.

## O. macOS/Windows Compatibility Considerations

Pure identifier/contract/protocol-validation logic can be developed offline on Mac using the isolated toolchain. Platform peer authentication, broker custody, protected trust stores and integration fixtures must use their actual approved platform mechanisms. Windows authenticated IPC/OS tokens and Jobs/MXC are different concerns; identity verification does not prove containment. A future Mac broker/Keychain/XPC or other IPC design requires its own review and authorization, not an automatic port.

No OS username, owner UID, file mode, Keychain item label or symlink/canonical-path check alone supplies application authorization. Cross-device restore keeps portable project history while requiring explicit trust re-provisioning and subject/workspace reattachment. Mac test success cannot promote Windows security gates; Windows historical evidence cannot authorize Mac workers.

## P. Owner Decisions Required

| Decision | Proposed approval target / required concrete input |
|---|---|
| D1 — deployment | Approve C with one-owner/local-only Windows initial deployment and remote/multi-user deferred; otherwise choose B before integration. No automatic local/remote account linking. |
| D2 — independent authority/provisioner | Approve an independently provisioned Windows OS-authenticated broker as the local candidate, name the responsible provisioner/admin and actual supported source/protocol/service identity; or identify an existing account authority instead. Supply approved public profile/verification-contract references, never private keys/tokens in chat/Git. No self-issued fallback. |
| D3 — initial owner and membership ownership | Identify the independently enrolled initial administrator and approve explicit project/root enrollment. Approve the existing protected repository as canonical membership/run-state owner, with future writes/schema changes separately scoped. No ownership from folder possession. |
| D4 — lifecycle/freshness | Approve the selected source's exact issuer/audience/deployment and credential/session/challenge/clock/revocation limits, zero offline protected-use grace, trust rotation/recovery and required external revocation/commit guarantee. Missing guarantees keep later positive actions blocked. |
| D5 — first implementation scope/evidence | Authorize Q's verification-only host slice, named adapter/profile, sanitized persistent audit-write scope and genuine independent non-production vectors/channel evidence. Explicitly bound any permitted identity-source verification/IPC/introspection exchanges to the selected source. Specify a supported Windows offline integration host; no new listener/service, AI/model-provider call, worker, account/key provisioning or positive admission/publication/delivery is included. |
| D6 — formal product acceptance | Identify/approve the versioned current PRD/M02 exit criteria and any intended deferrals before final M02 sign-off. This gap does not retroactively invalidate the bounded foundations or imply approval to implement them again. |

D1–D5 must be resolved before ID01 implementation can honestly connect to an independent source. If no actual source/protocol/provisioning contract is supplied, the next step is that owner decision, not building another mock boundary. Approving this proposal would not approve historical Option A/D9/archival or production runtime activation.

## Q. Recommended First Implementation Slice

**Proposed ID01 — Independently Provisioned Principal Verification in the Existing Host, Inspection Only.** Not authorized or implemented by this document.

Inputs: D1–D5, approved public provisioning/profile reference, actual independently provisioned non-production source/protocol and accepted evidence, protected verifier/custody/audit design and supported test host. If unavailable, preserve UNPROVISIONED; do not invent keys, enroll a host, install an IdP or emit a successful fixture principal merely to complete the slice.

The future slice may communicate with an already provisioned authority only through the exact owner-approved verification exchanges. That does not authorize launching an identity service, opening the application backend, signing into AI providers or performing general network discovery. No such exchange is performed in ID00.

Scope and target files:

- **host-principal.ts:** retain UNPROVISIONED and current denial APIs. Add a narrowly named async verification-inspection operation behind approved profile/runtime-origin validation. Genuine verification may produce only a sanitized, audited principal observation; membership/run remain NOT_EVALUATED and every action-authority flag stays false.
- **host.ts:** resolve that real verifier through protected composition, preserving lifecycle invalidation and denial-before-project-acquisition ordering. No caller-installed verifier callbacks or mutable trust configuration.
- **New protocol-specific module under src/server/attempt-control/**, with its exact filename/API selected only after D2: use the approved OS/standard verifier/custody adapter; do not write an application issuer or custom authentication protocol. A protected profile reader and sanitized installation-security audit adapter may be private dependencies, not new policy/grant engines.
- **host-principal.test.ts and host-composition.test.ts**, plus a new selected-protocol verifier test file: default/invalid/revoked/unavailable/config/serialization negatives and approved real-protocol vector verification. Actual listener-free composition runs on the supported platform; vectors alone do not establish provisioned production authority.
- **execution-admission.test.ts/output-publication.test.ts and existing fixture-origin tests** as scoped regressions: even a genuine identity observation cannot unlock current boundaries. Do not change production admission/publication/repository schema or expose a new HTTP route.

Business-state reads remain read-only; challenge/replay state and a durable sanitized identity-observation audit append are explicit, limited writes requiring D5. The audit sink is installation security evidence, not a parallel task store or a claim of cross-store atomic action acceptance. If mandatory audit persistence fails, return unavailable for the ordinary observation rather than fabricate a durable receipt. Project membership/run/grant/HELD stores and historical evidence are untouched.

Acceptance: demonstrable independently sourced identity verification reaches the actual PI08/host composition seam; copied/forged/stale/wrong-realm inputs deny; profile and host invalidation work; safe durable receipts exist; existing action/fixture/stop barriers remain unchanged; focused reviewed tests and appropriate scoped compilation produce new persistent evidence. No positive production authority or worker is required to prove this vertical slice. The slice has a real external input and real application consumer, unlike another disconnected fake issuer.

Subsequent membership/run/schema work is not bundled into ID01. No successful identity observation is passed to createHostIssuerForTest or used to loosen evaluateProvenanceRows, security state, held-output origin gates or synchronous publication contracts.

## R. Remaining Security Blockers

Independent identity source/profile/bootstrap is unprovisioned; first owner/membership authority and protected writer are undefined; authoritative current-run registration/pointer and real invocation source are absent; source freshness/clock/revocation/commit ordering and trust recovery are unapproved. Protected storage/anti-rollback/external witness limits persist. Destination/confidentiality/payload authority, positive grants/admission/acceptance/delivery, provider entitlement/billing, runtime containment/custody/closure, real bounded E2E and formal M02 sign-off remain blocked.

Keep the historical decisions: **Option A PENDING_OWNER_APPROVAL; D9 NOT_AUTHORIZED; historical evidence archival PENDING_AUTHORIZATION; workers/output delivery BLOCKED**. No local broker/account choice is an implicit approval of those actions. All existing failed/PARTIAL/NOT_RUN reports and missing Windows TEMP evidence remain unchanged.

## S. Final Status

**ID00_ARCHITECTURE_PROPOSED_AWAITING_OWNER_DECISION.** One review document produced; no production authentication code, source/test/config/lock changes, installations, credentials/keys, database access, application tests/typechecks, services/listeners, providers or workers. Source/document hashes, HEAD/status and document checks are retained in the new persistent ID00 audit; this is new design evidence, not reconstructed runtime proof.

Before implementation, the owner must approve **D1 deployment; D2 actual independent authority/provisioner/protocol; D3 initial owner and membership/state ownership; D4 exact lifecycle/freshness/revocation/recovery profile; D5 the bounded verification-only slice and independent test evidence/platform**. D6 remains required for final product acceptance. No authority is assumed while those decisions are pending.

**SECURITY_STOP_PRESERVED · M02_NOT_COMPLETE · executionAuthority:false · publicationAuthority:false · deliveryAuthority:false.**
