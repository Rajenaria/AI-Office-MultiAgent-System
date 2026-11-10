import { AttemptSchema, PhaseSchema, hash, type Attempt } from "./contracts.js";

export const APPLICATION_ID = 0x41494f46;
export const USER_VERSION = 10;
export const PROFILE = "pi11a-held-output-metadata-v1";
export const ATTEMPT_KEYS = Object.keys(AttemptSchema.unwrap().shape) as (keyof Attempt)[];
const phases = PhaseSchema.options.map((phase) => `'${phase}'`).join(",");
const terminal = "'COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED'";
const immutable = ["projectId", "authorityIncarnation", "taskId", "attemptId", "issueRequestId", "issueDigest",
  "bindingId", "bindingGeneration", "scopeDigest", "actionDigest", "permissionDigest", "runtimeRef", "executionMode", "createdAtMs"];
const safe = "BETWEEN 1 AND 9007199254740991";
const provenanceColumns = `recordVersion INTEGER NOT NULL DEFAULT 1 CHECK(recordVersion=1),
    projectId TEXT NOT NULL, authorityIncarnation TEXT NOT NULL,
    sourceId TEXT NOT NULL DEFAULT 'unavailable', sourceRevision INTEGER NOT NULL DEFAULT 1 CHECK(sourceRevision ${safe}),
    sourceClass TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(sourceClass IN ('UNVERIFIED','LOCAL_TEST_FIXTURE','PRODUCTION_AUTHORITY_UNAVAILABLE','REVOKED','INVALID')),
    status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(status IN ('UNKNOWN','ACTIVE','REVOKED')),
    validFromMs INTEGER NOT NULL CHECK(validFromMs BETWEEN 0 AND 9007199254740991),
    expiresAtMs INTEGER NOT NULL CHECK(expiresAtMs BETWEEN 0 AND 9007199254740991 AND expiresAtMs>validFromMs)`;
const sessionColumns = `recordVersion INTEGER NOT NULL DEFAULT 1 CHECK(recordVersion=1),
    projectId TEXT NOT NULL, authorityIncarnation TEXT NOT NULL, principalId TEXT NOT NULL,
    principalRevision INTEGER NOT NULL CHECK(principalRevision ${safe}),
    sourceKind TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(sourceKind IN ('UNVERIFIED','LOCAL_TEST_FIXTURE','PRODUCTION_HOST_AUTHORITY_UNAVAILABLE')),
    status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(status IN ('UNKNOWN','ACTIVE','REVOKED')),
    validFromMs INTEGER NOT NULL CHECK(validFromMs BETWEEN 0 AND 9007199254740991),
    expiresAtMs INTEGER NOT NULL CHECK(expiresAtMs BETWEEN 0 AND 9007199254740991 AND expiresAtMs>validFromMs)`;
export const SCHEMA_STATEMENTS = [
  `CREATE TABLE runtime_control_meta (
    projectId TEXT PRIMARY KEY, authorityIncarnation TEXT NOT NULL,
    schemaRevision INTEGER NOT NULL CHECK(schemaRevision=1), profile TEXT NOT NULL CHECK(profile='${PROFILE}'),
    schemaDigest TEXT NOT NULL, UNIQUE(projectId,authorityIncarnation)
  ) STRICT`,
  `CREATE TABLE runtime_attempts (
    projectId TEXT NOT NULL, authorityIncarnation TEXT NOT NULL, taskId TEXT NOT NULL CHECK(length(taskId) BETWEEN 1 AND 128),
    attemptId TEXT PRIMARY KEY, issueRequestId TEXT NOT NULL, issueDigest TEXT NOT NULL CHECK(length(issueDigest)=64),
    bindingId TEXT NOT NULL, bindingGeneration INTEGER NOT NULL CHECK(bindingGeneration ${safe}),
    scopeDigest TEXT NOT NULL CHECK(length(scopeDigest)=64), actionDigest TEXT NOT NULL CHECK(length(actionDigest)=64),
    permissionDigest TEXT NOT NULL CHECK(length(permissionDigest)=64), runtimeRef TEXT NOT NULL CHECK(runtimeRef='s12-host-only'),
    executionMode TEXT NOT NULL CHECK(executionMode='synthetic'),
    createdAtMs INTEGER NOT NULL CHECK(createdAtMs BETWEEN 0 AND 9007199254740991),
    updatedAtMs INTEGER NOT NULL CHECK(updatedAtMs BETWEEN createdAtMs AND 9007199254740991),
    attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}), stateVersion INTEGER NOT NULL CHECK(stateVersion ${safe}),
    phase TEXT NOT NULL CHECK(phase IN (${phases})), hostInstanceId TEXT NOT NULL, ownerId TEXT NOT NULL,
    ownerNonceHash TEXT NOT NULL CHECK(length(ownerNonceHash)=64), ownerMode TEXT NOT NULL CHECK(ownerMode IN ('EXECUTION','RECOVERY')),
    conflictHeld INTEGER NOT NULL CHECK(conflictHeld=1), terminalReceiptId TEXT UNIQUE,
    terminalDigest TEXT, terminalPayload TEXT CHECK(terminalPayload IS NULL OR length(terminalPayload)<=4096),
    leasePayload TEXT CHECK(leasePayload IS NULL OR (json_valid(leasePayload) AND length(leasePayload)<=4096)),
    cancellationPayload TEXT CHECK(cancellationPayload IS NULL OR (json_valid(cancellationPayload) AND length(cancellationPayload)<=8192)),
    recoveryPayload TEXT CHECK(recoveryPayload IS NULL OR (json_valid(recoveryPayload) AND length(recoveryPayload)<=8192)),
    UNIQUE(projectId,attemptId), UNIQUE(projectId,taskId,issueRequestId),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(projectId,attemptId,attemptGeneration,hostInstanceId,ownerId,ownerNonceHash,ownerMode)
      REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration,hostInstanceId,ownerId,ownerNonceHash,ownerMode)
      DEFERRABLE INITIALLY DEFERRED,
    CHECK((phase IN (${terminal}) AND terminalReceiptId IS NOT NULL AND terminalDigest IS NOT NULL AND terminalPayload IS NOT NULL)
      OR (phase NOT IN (${terminal}) AND terminalReceiptId IS NULL AND terminalDigest IS NULL AND terminalPayload IS NULL))
  ) STRICT`,
  "CREATE UNIQUE INDEX runtime_project_conflict ON runtime_attempts(projectId) WHERE conflictHeld=1",
  "CREATE UNIQUE INDEX runtime_cancel_request ON runtime_attempts(json_extract(cancellationPayload,'$.requestId')) WHERE cancellationPayload IS NOT NULL",
  `CREATE TABLE runtime_owner_epochs (
    projectId TEXT NOT NULL, attemptId TEXT NOT NULL, attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}),
    hostInstanceId TEXT NOT NULL, ownerId TEXT NOT NULL, ownerNonceHash TEXT NOT NULL CHECK(length(ownerNonceHash)=64),
    ownerMode TEXT NOT NULL CHECK(ownerMode IN ('EXECUTION','RECOVERY')), acquiredAtMs INTEGER NOT NULL,
    PRIMARY KEY(projectId,attemptId,attemptGeneration),
    UNIQUE(projectId,attemptId,attemptGeneration,hostInstanceId,ownerId,ownerNonceHash,ownerMode),
    FOREIGN KEY(projectId,attemptId) REFERENCES runtime_attempts(projectId,attemptId)
  ) STRICT`,
  `CREATE TABLE runtime_attempt_events (
    eventId TEXT PRIMARY KEY, projectId TEXT NOT NULL, attemptId TEXT NOT NULL,
    attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}),
    priorVersion INTEGER NOT NULL CHECK(priorVersion BETWEEN 0 AND 9007199254740990),
    newVersion INTEGER NOT NULL CHECK(newVersion=priorVersion+1),
    eventType TEXT NOT NULL CHECK(eventType IN ('ATTEMPT_ISSUED','PHASE_CHANGED','OWNER_FENCED','TERMINAL_COMMITTED','LEASE_RENEWED','LEASE_QUARANTINED','CANCEL_INTENT','CANCEL_ACK','CANCEL_EXIT','RECOVERY_CLASSIFIED')),
    payloadVersion INTEGER NOT NULL CHECK(payloadVersion=1), writerHostInstanceId TEXT NOT NULL,
    idempotencyKey TEXT NOT NULL, atMs INTEGER NOT NULL, payload TEXT NOT NULL CHECK(length(CAST(payload AS BLOB))<=16384),
    payloadDigest TEXT NOT NULL CHECK(length(payloadDigest)=64), previousEventDigest TEXT,
    eventDigest TEXT NOT NULL CHECK(length(eventDigest)=64),
    UNIQUE(projectId,attemptId,newVersion), UNIQUE(projectId,attemptId,idempotencyKey),
    FOREIGN KEY(projectId,attemptId,attemptGeneration) REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration)
  ) STRICT`,
  `CREATE TRIGGER runtime_identity_immutable BEFORE UPDATE ON runtime_attempts
    WHEN ${immutable.map((key) => `NEW.${key} IS NOT OLD.${key}`).join(" OR ")}
    BEGIN SELECT RAISE(ABORT,'immutable identity'); END`,
  `CREATE TRIGGER runtime_version_guard BEFORE UPDATE ON runtime_attempts
    WHEN NEW.stateVersion<>OLD.stateVersion+1 OR NEW.attemptGeneration NOT IN (OLD.attemptGeneration,OLD.attemptGeneration+1)
      OR (NEW.attemptGeneration<>OLD.attemptGeneration AND
        (OLD.phase<>'UNCERTAIN' OR NEW.phase<>'RECONCILIATION_REQUIRED' OR NEW.ownerMode<>'RECOVERY'))
    BEGIN SELECT RAISE(ABORT,'invalid version or epoch'); END`,
  `CREATE TRIGGER runtime_terminal_immutable BEFORE UPDATE ON runtime_attempts WHEN OLD.terminalReceiptId IS NOT NULL
    BEGIN SELECT RAISE(ABORT,'terminal immutable'); END`,
  ...["runtime_attempts", "runtime_owner_epochs", "runtime_attempt_events", "runtime_control_meta"].map((table) =>
    `CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table} BEGIN SELECT RAISE(ABORT,'retained authority'); END`),
  ...["runtime_owner_epochs", "runtime_attempt_events", "runtime_control_meta"].map((table) =>
    `CREATE TRIGGER ${table}_no_update BEFORE UPDATE ON ${table} BEGIN SELECT RAISE(ABORT,'append only'); END`),
  // Additive fixture schema. Existing attempts/epochs/events retain their contracts.
  `CREATE TABLE runtime_execution_security (
    projectId TEXT PRIMARY KEY, authorityIncarnation TEXT NOT NULL,
    recordVersion INTEGER NOT NULL DEFAULT 1 CHECK(recordVersion=1),
    securityRevision INTEGER NOT NULL DEFAULT 1 CHECK(securityRevision ${safe}),
    securityState TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(securityState IN ('UNKNOWN','BLOCKED','ACTIVE_STOP')),
    policyVersion TEXT CHECK(policyVersion IS NULL OR length(policyVersion) BETWEEN 1 AND 128),
    stopJournalHead TEXT REFERENCES runtime_security_stop_events(eventId) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation)
  ) STRICT`,
  `CREATE TRIGGER runtime_security_guard BEFORE UPDATE ON runtime_execution_security
    WHEN NEW.projectId IS NOT OLD.projectId OR NEW.authorityIncarnation IS NOT OLD.authorityIncarnation
      OR NEW.recordVersion IS NOT OLD.recordVersion OR NEW.securityRevision<>OLD.securityRevision+1
      OR (OLD.securityState='ACTIVE_STOP' AND NEW.securityState<>'ACTIVE_STOP')
      OR (OLD.securityState='BLOCKED' AND NEW.securityState='UNKNOWN')
      OR OLD.stopJournalHead IS NOT NULL
    BEGIN SELECT RAISE(ABORT,'invalid security revision or relaxation'); END`,
  `CREATE TRIGGER runtime_security_stop_retained BEFORE DELETE ON runtime_execution_security
    WHEN OLD.stopJournalHead IS NOT NULL BEGIN SELECT RAISE(ABORT,'retained security stop projection'); END`,
  // One sticky activation per authority incarnation; operation/event links defer until COMMIT.
  `CREATE TABLE runtime_security_stop_events (
    eventId TEXT PRIMARY KEY, operationId TEXT NOT NULL UNIQUE, recordVersion INTEGER NOT NULL CHECK(recordVersion=1),
    projectId TEXT NOT NULL, authorityIncarnation TEXT NOT NULL, taskId TEXT NOT NULL,
    attemptId TEXT NOT NULL, attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}),
    attemptStateVersion INTEGER NOT NULL CHECK(attemptStateVersion ${safe}),
    attemptPhase TEXT NOT NULL CHECK(attemptPhase IN (${phases})), hostInstanceId TEXT NOT NULL, ownerId TEXT NOT NULL,
    ownerNonceHash TEXT NOT NULL CHECK(length(ownerNonceHash)=64),
    action TEXT NOT NULL CHECK(action='ACTIVATE_STOP'),
    reason TEXT NOT NULL CHECK(reason IN ('OWNER_REPORTED_RISK','INTEGRITY_CONCERN','POLICY_VIOLATION','TEST_SECURITY_CONCERN')),
    sourceClass TEXT NOT NULL CHECK(sourceClass='LOCAL_TEST_FIXTURE'),
    revisionBefore INTEGER NOT NULL CHECK(revisionBefore ${safe}),
    revisionAfter INTEGER NOT NULL CHECK(revisionAfter ${safe} AND revisionAfter=revisionBefore+1),
    stateBefore TEXT NOT NULL CHECK(stateBefore IN ('UNKNOWN','BLOCKED')),
    stateAfter TEXT NOT NULL CHECK(stateAfter='ACTIVE_STOP'),
    policyVersion TEXT, journalSequence INTEGER NOT NULL CHECK(journalSequence=1),
    atMs INTEGER NOT NULL CHECK(atMs BETWEEN 0 AND 9007199254740991),
    requestDigest TEXT NOT NULL CHECK(length(requestDigest)=64), eventDigest TEXT NOT NULL CHECK(length(eventDigest)=64),
    UNIQUE(projectId,authorityIncarnation,journalSequence), UNIQUE(projectId,authorityIncarnation,revisionAfter),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(projectId,attemptId,attemptGeneration) REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration),
    FOREIGN KEY(operationId) REFERENCES runtime_security_stop_operations(operationId) DEFERRABLE INITIALLY DEFERRED
  ) STRICT`,
  `CREATE TABLE runtime_security_stop_operations (
    operationId TEXT PRIMARY KEY, recordVersion INTEGER NOT NULL CHECK(recordVersion=1),
    projectId TEXT NOT NULL, authorityIncarnation TEXT NOT NULL, eventId TEXT NOT NULL UNIQUE,
    requestDigest TEXT NOT NULL CHECK(length(requestDigest)=64),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(eventId) REFERENCES runtime_security_stop_events(eventId) DEFERRABLE INITIALLY DEFERRED
  ) STRICT`,
  ...["runtime_security_stop_events", "runtime_security_stop_operations"].flatMap(table => [
    `CREATE TRIGGER ${table}_no_update BEFORE UPDATE ON ${table} BEGIN SELECT RAISE(ABORT,'append only security audit'); END`,
    `CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table} BEGIN SELECT RAISE(ABORT,'retained security audit'); END`,
  ]),
  `CREATE TABLE runtime_principal_provenance (
    ${provenanceColumns}, principalId TEXT PRIMARY KEY,
    principalKind TEXT NOT NULL CHECK(principalKind IN ('HUMAN','SYSTEM')),
    revision INTEGER NOT NULL DEFAULT 1 CHECK(revision ${safe}),
    UNIQUE(projectId,authorityIncarnation,principalId),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation)
  ) STRICT`,
  `CREATE TABLE runtime_policy_provenance (
    ${provenanceColumns}, policyId TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 1 CHECK(revision ${safe}),
    policyVersion INTEGER NOT NULL DEFAULT 1 CHECK(policyVersion ${safe}), action TEXT NOT NULL,
    taskId TEXT NOT NULL, destinationId TEXT NOT NULL,
    UNIQUE(projectId,authorityIncarnation,policyId),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation)
  ) STRICT`,
  `CREATE TABLE runtime_grant_provenance (
    ${provenanceColumns}, grantId TEXT PRIMARY KEY,
    authorizationRevision INTEGER NOT NULL DEFAULT 1 CHECK(authorizationRevision ${safe}),
    principalId TEXT NOT NULL, principalRevision INTEGER NOT NULL CHECK(principalRevision ${safe}),
    policyId TEXT NOT NULL, policyRevision INTEGER NOT NULL CHECK(policyRevision ${safe}),
    policyVersion INTEGER NOT NULL CHECK(policyVersion ${safe}), sessionId TEXT NOT NULL,
    attemptId TEXT NOT NULL, attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}),
    action TEXT NOT NULL, taskId TEXT NOT NULL, destinationId TEXT NOT NULL,
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(projectId,authorityIncarnation,principalId) REFERENCES runtime_principal_provenance(projectId,authorityIncarnation,principalId),
    FOREIGN KEY(projectId,authorityIncarnation,policyId) REFERENCES runtime_policy_provenance(projectId,authorityIncarnation,policyId),
    FOREIGN KEY(projectId,attemptId) REFERENCES runtime_attempts(projectId,attemptId)
  ) STRICT`,
  ...([
    ["runtime_principal_provenance", "revision", ["principalId", "principalKind"]],
    ["runtime_policy_provenance", "revision", ["policyId"]],
    ["runtime_grant_provenance", "authorizationRevision", ["grantId", "principalId", "principalRevision", "policyId", "policyRevision", "policyVersion",
      "sessionId", "attemptId", "attemptGeneration", "action", "taskId", "destinationId"]],
  ] as const).flatMap(([table, revision, keys]) => [
    `CREATE TRIGGER ${table}_guard BEFORE UPDATE ON ${table}
      WHEN ${["projectId", "authorityIncarnation", "recordVersion", "sourceId", "sourceClass", ...keys]
        .map(key => `NEW.${key} IS NOT OLD.${key}`).join(" OR ")}
        OR NEW.${revision}<>OLD.${revision}+1 OR NEW.sourceRevision<OLD.sourceRevision
        OR (OLD.status='REVOKED' AND NEW.status<>'REVOKED')
        ${table === "runtime_policy_provenance" ? "OR NEW.policyVersion<OLD.policyVersion" : ""}
      BEGIN SELECT RAISE(ABORT,'invalid provenance change'); END`,
    `CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table} BEGIN SELECT RAISE(ABORT,'retained provenance'); END`,
  ]),
  // Local canonical associations, not an HTTP/login session service or authentication database.
  `CREATE TABLE runtime_application_session_bindings (
    ${sessionColumns}, applicationSessionId TEXT PRIMARY KEY,
    generation INTEGER NOT NULL DEFAULT 1 CHECK(generation ${safe}), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision ${safe}),
    UNIQUE(projectId,authorityIncarnation,applicationSessionId),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(projectId,authorityIncarnation,principalId) REFERENCES runtime_principal_provenance(projectId,authorityIncarnation,principalId)
  ) STRICT`,
  `CREATE TABLE runtime_execution_sessions (
    ${sessionColumns}, executionSessionId TEXT PRIMARY KEY,
    bindingRevision INTEGER NOT NULL DEFAULT 1 CHECK(bindingRevision ${safe}),
    applicationSessionId TEXT NOT NULL, applicationGeneration INTEGER NOT NULL CHECK(applicationGeneration ${safe}),
    attemptId TEXT NOT NULL, attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration ${safe}),
    policyId TEXT NOT NULL, policyVersion INTEGER NOT NULL CHECK(policyVersion ${safe}), policyRevision INTEGER NOT NULL CHECK(policyRevision ${safe}),
    grantId TEXT NOT NULL, authorizationRevision INTEGER NOT NULL CHECK(authorizationRevision ${safe}),
    provenanceSourceRevision INTEGER NOT NULL CHECK(provenanceSourceRevision ${safe}),
    hostIssuerId TEXT, hostIssuerGeneration INTEGER CHECK(hostIssuerGeneration IS NULL OR hostIssuerGeneration ${safe}),
    hostContextRevision INTEGER NOT NULL DEFAULT 1 CHECK(hostContextRevision ${safe}),
    FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
    FOREIGN KEY(projectId,authorityIncarnation,principalId) REFERENCES runtime_principal_provenance(projectId,authorityIncarnation,principalId),
    FOREIGN KEY(projectId,authorityIncarnation,applicationSessionId) REFERENCES runtime_application_session_bindings(projectId,authorityIncarnation,applicationSessionId),
    FOREIGN KEY(projectId,attemptId) REFERENCES runtime_attempts(projectId,attemptId),
    FOREIGN KEY(projectId,authorityIncarnation,policyId) REFERENCES runtime_policy_provenance(projectId,authorityIncarnation,policyId),
    FOREIGN KEY(grantId) REFERENCES runtime_grant_provenance(grantId)
  ) STRICT`,
  `CREATE TRIGGER runtime_application_session_bindings_guard BEFORE UPDATE ON runtime_application_session_bindings
    WHEN NEW.projectId IS NOT OLD.projectId OR NEW.authorityIncarnation IS NOT OLD.authorityIncarnation
      OR NEW.applicationSessionId IS NOT OLD.applicationSessionId OR NEW.sourceKind IS NOT OLD.sourceKind OR NEW.recordVersion IS NOT OLD.recordVersion
      OR NEW.revision<>OLD.revision+1 OR NEW.generation NOT IN (OLD.generation,OLD.generation+1)
      OR (NEW.principalId IS NOT OLD.principalId AND NEW.generation<>OLD.generation+1)
      OR (OLD.status='REVOKED' AND NEW.status<>'REVOKED')
    BEGIN SELECT RAISE(ABORT,'invalid application session binding'); END`,
  `CREATE TRIGGER runtime_execution_sessions_guard BEFORE UPDATE ON runtime_execution_sessions
    WHEN ${["projectId", "authorityIncarnation", "principalId", "principalRevision", "sourceKind", "recordVersion", "executionSessionId",
      "applicationSessionId", "applicationGeneration", "attemptId", "attemptGeneration", "policyId", "policyVersion", "policyRevision",
      "grantId", "authorizationRevision", "provenanceSourceRevision"].map(k => `NEW.${k} IS NOT OLD.${k}`).join(" OR ")}
      OR NEW.bindingRevision<>OLD.bindingRevision+1 OR NEW.hostContextRevision<OLD.hostContextRevision
      OR (OLD.status='REVOKED' AND NEW.status<>'REVOKED')
    BEGIN SELECT RAISE(ABORT,'invalid execution session binding'); END`,
  ...["runtime_application_session_bindings", "runtime_execution_sessions"].map(table =>
    `CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table} BEGIN SELECT RAISE(ABORT,'retained session binding'); END`),
  // PI11A: inert metadata only. No delivery tables, leases, or state beyond HELD.
  `CREATE TABLE runtime_output_streams (
  streamId TEXT PRIMARY KEY NOT NULL,
  projectId TEXT NOT NULL,
  authorityIncarnation TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  attemptGeneration INTEGER NOT NULL CHECK(attemptGeneration BETWEEN 1 AND 9007199254740991),
  executionSessionId TEXT NOT NULL,
  destinationId TEXT NOT NULL CHECK(length(destinationId) BETWEEN 1 AND 128),
  channel TEXT NOT NULL CHECK(channel IN ('fixture.metadata','fixture.diagnostic')),
  lastAccepted INTEGER NOT NULL DEFAULT 0 CHECK(lastAccepted BETWEEN 0 AND 9007199254740991),
  revision INTEGER NOT NULL DEFAULT 0 CHECK(revision BETWEEN 0 AND 9007199254740991),
  createdAtMs INTEGER NOT NULL CHECK(createdAtMs BETWEEN 0 AND 9007199254740991),
  UNIQUE(projectId,authorityIncarnation,attemptId,attemptGeneration,executionSessionId,destinationId,channel),
  FOREIGN KEY(projectId,authorityIncarnation) REFERENCES runtime_control_meta(projectId,authorityIncarnation),
  FOREIGN KEY(projectId,attemptId,attemptGeneration) REFERENCES runtime_owner_epochs(projectId,attemptId,attemptGeneration),
  FOREIGN KEY(executionSessionId) REFERENCES runtime_execution_sessions(executionSessionId),
  CHECK(revision=lastAccepted)
) STRICT`,
  `CREATE TABLE runtime_output_operations (
  operationId TEXT PRIMARY KEY NOT NULL,
  streamId TEXT NOT NULL,
  idempotencyKey TEXT NOT NULL CHECK(length(idempotencyKey) BETWEEN 1 AND 128),
  requestDigest TEXT NOT NULL CHECK(length(requestDigest)=64 AND requestDigest NOT GLOB '*[^0-9a-f]*'),
  outputId TEXT NOT NULL UNIQUE,
  claimKey TEXT UNIQUE,
  createdAtMs INTEGER NOT NULL CHECK(createdAtMs BETWEEN 0 AND 9007199254740991),
  UNIQUE(streamId,idempotencyKey),
  UNIQUE(operationId,outputId),
  UNIQUE(operationId,outputId,streamId),
  UNIQUE(operationId,claimKey),
  FOREIGN KEY(streamId) REFERENCES runtime_output_streams(streamId),
  FOREIGN KEY(outputId,operationId) REFERENCES runtime_accepted_outputs(outputId,operationId) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY(operationId,claimKey) REFERENCES runtime_output_grant_claims(operationId,claimKey) DEFERRABLE INITIALLY DEFERRED
) STRICT`,
  `CREATE TABLE runtime_output_grant_claims (
  claimKey TEXT PRIMARY KEY NOT NULL CHECK(length(claimKey)=64 AND claimKey NOT GLOB '*[^0-9a-f]*'),
  operationId TEXT NOT NULL UNIQUE,
  grantId TEXT NOT NULL,
  authorizationRevision INTEGER NOT NULL CHECK(authorizationRevision BETWEEN 1 AND 9007199254740991),
  claimedAtMs INTEGER NOT NULL CHECK(claimedAtMs BETWEEN 0 AND 9007199254740991),
  UNIQUE(operationId,claimKey),
  FOREIGN KEY(grantId) REFERENCES runtime_grant_provenance(grantId),
  FOREIGN KEY(operationId,claimKey) REFERENCES runtime_output_operations(operationId,claimKey) DEFERRABLE INITIALLY DEFERRED
) STRICT`,
  `CREATE TABLE runtime_accepted_outputs (
  recordVersion INTEGER NOT NULL DEFAULT 1 CHECK(recordVersion=1),
  outputId TEXT PRIMARY KEY NOT NULL,
  operationId TEXT NOT NULL UNIQUE,
  outboxId TEXT NOT NULL UNIQUE,
  streamId TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK(sequence BETWEEN 1 AND 9007199254740991),
  producerId TEXT NOT NULL CHECK(length(producerId) BETWEEN 1 AND 128),
  producerEventId TEXT NOT NULL CHECK(length(producerEventId) BETWEEN 1 AND 128),
  recordClass TEXT NOT NULL DEFAULT 'OFFLINE_CONTRACT_ONLY' CHECK(recordClass='OFFLINE_CONTRACT_ONLY'),
  confidentiality TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(confidentiality IN ('UNVERIFIED','PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED')),
  classificationSource TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(classificationSource IN ('UNVERIFIED','OFFLINE_SUPPLIED')),
  classificationDigest TEXT CHECK(classificationDigest IS NULL),
  bindingSnapshot TEXT NOT NULL CHECK(json_valid(bindingSnapshot) AND length(CAST(bindingSnapshot AS BLOB))<=16384),
  bindingDigest TEXT NOT NULL CHECK(length(bindingDigest)=64 AND bindingDigest NOT GLOB '*[^0-9a-f]*'),
  payloadReference TEXT CHECK(payloadReference IS NULL),
  payloadDigest TEXT NOT NULL CHECK(length(payloadDigest)=64 AND payloadDigest NOT GLOB '*[^0-9a-f]*'),
  payloadByteLength INTEGER NOT NULL DEFAULT 0 CHECK(payloadByteLength=0),
  attemptStateVersion INTEGER NOT NULL CHECK(attemptStateVersion BETWEEN 1 AND 9007199254740991),
  securityRevision INTEGER NOT NULL CHECK(securityRevision BETWEEN 1 AND 9007199254740991),
  principalRevision INTEGER NOT NULL CHECK(principalRevision BETWEEN 1 AND 9007199254740991),
  applicationGeneration INTEGER NOT NULL CHECK(applicationGeneration BETWEEN 1 AND 9007199254740991),
  applicationRevision INTEGER NOT NULL CHECK(applicationRevision BETWEEN 1 AND 9007199254740991),
  sessionBindingRevision INTEGER NOT NULL CHECK(sessionBindingRevision BETWEEN 1 AND 9007199254740991),
  policyId TEXT NOT NULL,
  policyVersion INTEGER NOT NULL CHECK(policyVersion BETWEEN 1 AND 9007199254740991),
  policyRevision INTEGER NOT NULL CHECK(policyRevision BETWEEN 1 AND 9007199254740991),
  grantId TEXT NOT NULL,
  authorizationRevision INTEGER NOT NULL CHECK(authorizationRevision BETWEEN 1 AND 9007199254740991),
  provenanceSourceRevision INTEGER NOT NULL CHECK(provenanceSourceRevision BETWEEN 1 AND 9007199254740991),
  createdAtMs INTEGER NOT NULL CHECK(createdAtMs BETWEEN 0 AND 9007199254740991),
  UNIQUE(outputId,operationId),
  UNIQUE(outputId,outboxId),
  UNIQUE(streamId,sequence),
  UNIQUE(streamId,producerId,producerEventId),
  FOREIGN KEY(streamId) REFERENCES runtime_output_streams(streamId),
  FOREIGN KEY(policyId) REFERENCES runtime_policy_provenance(policyId),
  FOREIGN KEY(grantId) REFERENCES runtime_grant_provenance(grantId),
  FOREIGN KEY(operationId,outputId,streamId) REFERENCES runtime_output_operations(operationId,outputId,streamId) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY(outboxId,outputId) REFERENCES runtime_output_outbox(outboxId,outputId) DEFERRABLE INITIALLY DEFERRED
) STRICT`,
  `CREATE TABLE runtime_output_outbox (
  outboxId TEXT PRIMARY KEY NOT NULL, outputId TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'HELD' CHECK(state='HELD'),
  rowRevision INTEGER NOT NULL DEFAULT 1 CHECK(rowRevision=1),
  lastEventId TEXT NOT NULL,
  holdReason TEXT NOT NULL DEFAULT 'AUTHORITY_UNAVAILABLE' CHECK(holdReason='AUTHORITY_UNAVAILABLE'),
  createdAtMs INTEGER NOT NULL CHECK(createdAtMs BETWEEN 0 AND 9007199254740991),
  updatedAtMs INTEGER NOT NULL CHECK(updatedAtMs=createdAtMs),
  UNIQUE(outboxId,outputId),
  FOREIGN KEY(outputId,outboxId) REFERENCES runtime_accepted_outputs(outputId,outboxId) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY(lastEventId,outboxId,rowRevision) REFERENCES runtime_output_events(eventId,outboxId,rowRevision) DEFERRABLE INITIALLY DEFERRED
) STRICT`,
  `CREATE TABLE runtime_output_events (
  eventId TEXT PRIMARY KEY NOT NULL, outboxId TEXT NOT NULL UNIQUE,
  rowRevision INTEGER NOT NULL CHECK(rowRevision=1),
  eventType TEXT NOT NULL CHECK(eventType='OFFLINE_HELD_RECORDED'),
  priorState TEXT CHECK(priorState IS NULL), newState TEXT NOT NULL CHECK(newState='HELD'),
  reasonCode TEXT NOT NULL CHECK(reasonCode='AUTHORITY_UNAVAILABLE'),
  atMs INTEGER NOT NULL CHECK(atMs BETWEEN 0 AND 9007199254740991),
  snapshotDigest TEXT NOT NULL CHECK(length(snapshotDigest)=64 AND snapshotDigest NOT GLOB '*[^0-9a-f]*'),
  previousEventId TEXT CHECK(previousEventId IS NULL), previousDigest TEXT CHECK(previousDigest IS NULL),
  eventDigest TEXT NOT NULL CHECK(length(eventDigest)=64 AND eventDigest NOT GLOB '*[^0-9a-f]*'),
  UNIQUE(outboxId,rowRevision), UNIQUE(eventId,outboxId,rowRevision),
  FOREIGN KEY(outboxId) REFERENCES runtime_output_outbox(outboxId)
) STRICT`,
  `CREATE INDEX runtime_output_attempt_stream ON runtime_output_streams(projectId,attemptId,attemptGeneration)`,
  `CREATE INDEX runtime_output_event_chain ON runtime_output_events(outboxId,rowRevision)`,
  `CREATE TRIGGER runtime_output_operations_no_update BEFORE UPDATE ON runtime_output_operations
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_operations_no_delete BEFORE DELETE ON runtime_output_operations
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_grant_claims_no_update BEFORE UPDATE ON runtime_output_grant_claims
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_grant_claims_no_delete BEFORE DELETE ON runtime_output_grant_claims
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_accepted_outputs_no_update BEFORE UPDATE ON runtime_accepted_outputs
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_accepted_outputs_no_delete BEFORE DELETE ON runtime_accepted_outputs
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_events_no_update BEFORE UPDATE ON runtime_output_events
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_events_no_delete BEFORE DELETE ON runtime_output_events
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_streams_no_delete BEFORE DELETE ON runtime_output_streams
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_outbox_no_delete BEFORE DELETE ON runtime_output_outbox
BEGIN SELECT RAISE(ABORT,'retained output metadata'); END`,
  `CREATE TRIGGER runtime_output_stream_binding BEFORE INSERT ON runtime_output_streams
WHEN NOT EXISTS (
  SELECT 1 FROM runtime_execution_sessions e
  WHERE e.executionSessionId=NEW.executionSessionId AND e.projectId=NEW.projectId
    AND e.authorityIncarnation=NEW.authorityIncarnation AND e.attemptId=NEW.attemptId
    AND e.attemptGeneration=NEW.attemptGeneration AND e.sourceKind='LOCAL_TEST_FIXTURE'
)
BEGIN SELECT RAISE(ABORT,'output session mismatch'); END`,
  `CREATE TRIGGER runtime_output_stream_guard BEFORE UPDATE ON runtime_output_streams
WHEN NEW.streamId IS NOT OLD.streamId OR NEW.projectId IS NOT OLD.projectId
 OR NEW.authorityIncarnation IS NOT OLD.authorityIncarnation OR NEW.attemptId IS NOT OLD.attemptId
 OR NEW.attemptGeneration IS NOT OLD.attemptGeneration OR NEW.executionSessionId IS NOT OLD.executionSessionId
 OR NEW.destinationId IS NOT OLD.destinationId OR NEW.channel IS NOT OLD.channel
 OR NEW.createdAtMs IS NOT OLD.createdAtMs
 OR NEW.lastAccepted<>OLD.lastAccepted+1 OR NEW.revision<>OLD.revision+1
BEGIN SELECT RAISE(ABORT,'output sequence conflict'); END`,
  `CREATE TRIGGER runtime_output_outbox_no_update BEFORE UPDATE ON runtime_output_outbox BEGIN SELECT RAISE(ABORT,'held output immutable'); END`,
];
export const SCHEMA_SQL = SCHEMA_STATEMENTS.join(";\n") + ";";
export const SCHEMA_DIGEST = hash(SCHEMA_SQL);
