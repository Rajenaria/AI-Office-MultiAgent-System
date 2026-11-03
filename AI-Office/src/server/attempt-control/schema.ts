import { AttemptSchema, PhaseSchema, hash, type Attempt } from "./contracts.js";

export const APPLICATION_ID = 0x41494f46;
export const USER_VERSION = 5;
export const PROFILE = "s15-isolated-authority-v1";
export const ATTEMPT_KEYS = Object.keys(AttemptSchema.unwrap().shape) as (keyof Attempt)[];
const phases = PhaseSchema.options.map((phase) => `'${phase}'`).join(",");
const terminal = "'COMPLETED','FAILED','INTERRUPTED','APPROVAL_DENIED'";
const immutable = ["projectId", "authorityIncarnation", "taskId", "attemptId", "issueRequestId", "issueDigest",
  "bindingId", "bindingGeneration", "scopeDigest", "actionDigest", "permissionDigest", "runtimeRef", "executionMode", "createdAtMs"];
const safe = "BETWEEN 1 AND 9007199254740991";
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
];
export const SCHEMA_SQL = SCHEMA_STATEMENTS.join(";\n") + ";";
export const SCHEMA_DIGEST = hash(SCHEMA_SQL);
