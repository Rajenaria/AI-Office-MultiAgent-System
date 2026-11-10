import { randomUUID, createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";
import { DurableAttemptRepository, type TestFault } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS, USER_VERSION } from "../../../src/server/attempt-control/schema.js";
import { createTestDatabase, openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { openOwnedFixtureConnection, type RepositoryConnection } from "../../../src/server/attempt-control/connection.js";
import { hash, AttemptSchema } from "../../../src/server/attempt-control/contracts.js";
import { OUTPUT_TABLES, type HeldOutputCommand } from "../../../src/server/attempt-control/output-metadata.js";
import { HeldOutputRevalidationSchema, type HeldOutputRevalidationResult } from "../../../src/server/attempt-control/output-revalidation.js";
import { insertOutputRow } from "../../../src/server/attempt-control/output-journal.js";
import { appendEvent, verifyHistory } from "../../../src/server/attempt-control/journal.js";
import { createHostPrincipalBoundary } from "../../../src/server/attempt-control/host-principal.js";
import { createExecutionAdmissionBoundary } from "../../../src/server/attempt-control/execution-admission.js";
import { createOutputPublicationBoundary } from "../../../src/server/attempt-control/output-publication.js";
import { HostSQLiteProvider } from "../../../src/server/attempt-control/host-sqlite.js";
import { validateRoot } from "../../../src/server/workspace/paths.js";
import type { RegistryEntry } from "../../../src/server/workspace/registry.js";
import { evidence, expected, issueCommand, own, root, terminalCommand, transitionCommand } from "./helpers.js";
import { clockAt } from "./lease-helpers.js";

function insert(db: ReturnType<typeof openTestConnection>["db"], table: string, row: object) {
  const keys=Object.keys(row); db.prepare(`INSERT INTO ${table}(${keys.join(",")}) VALUES(${keys.map(()=>"?").join(",")})`)
    .run(...Object.values(row) as (string|number|null)[]);
}
function setup(fault?: TestFault, leased=false) {
  const ref=createTestDatabase(root), repository=own(DurableAttemptRepository.openForTest(ref,fault));
  const baseIssue=issueCommand(ref), issue={...baseIssue,...(leased?{leaseClock:{hostInstanceId:baseIssue.hostInstanceId,
    clockDomainId:randomUUID(),wallMs:baseIssue.createdAtMs,monotonicMs:100}}:{})};
  let attempt=repository.issue(issue).attempt;
  for(const phase of ["APPROVAL_PENDING","APPROVAL_GRANTED"] as const) attempt=repository.transition({
    ...transitionCommand(attempt,issue.ownerNonce,phase),...(leased?{clock:clockAt(attempt,attempt.updatedAtMs+1-issue.createdAtMs)}:{})});
  const common={recordVersion:1,projectId:ref.projectId,authorityIncarnation:ref.authorityIncarnation,
    sourceId:"pi03-fixture-source-v1",sourceRevision:1,sourceClass:"LOCAL_TEST_FIXTURE",status:"ACTIVE",validFromMs:1000,expiresAtMs:10000};
  const principal={...common,principalId:randomUUID(),principalKind:"HUMAN",revision:1};
  const policy={...common,policyId:randomUUID(),policyVersion:1,revision:1,action:"attempt.execute",taskId:attempt.taskId,destinationId:"fixture-held"};
  const executionId="execution:"+randomUUID(), applicationId="application:"+randomUUID();
  const grant={...common,grantId:randomUUID(),authorizationRevision:1,principalId:principal.principalId,principalRevision:1,
    policyId:policy.policyId,policyRevision:1,policyVersion:1,sessionId:executionId,attemptId:attempt.attemptId,
    attemptGeneration:1,action:policy.action,taskId:attempt.taskId,destinationId:policy.destinationId};
  const session={recordVersion:1,projectId:ref.projectId,authorityIncarnation:ref.authorityIncarnation,
    principalId:principal.principalId,principalRevision:1,sourceKind:"LOCAL_TEST_FIXTURE",status:"ACTIVE",validFromMs:1000,expiresAtMs:9000};
  const app={...session,applicationSessionId:applicationId,generation:1,revision:1};
  const issuer=repository.hostIssuerForTest;
  const execution={...session,executionSessionId:executionId,bindingRevision:1,applicationSessionId:applicationId,
    applicationGeneration:1,attemptId:attempt.attemptId,attemptGeneration:1,policyId:policy.policyId,policyVersion:1,
    policyRevision:1,grantId:grant.grantId,authorizationRevision:1,provenanceSourceRevision:1,
    hostIssuerId:issuer.issuerId,hostIssuerGeneration:issuer.generation,hostContextRevision:issuer.contextRevision};
  const raw=own(openTestConnection(ref));
  for(const [table,row] of [["runtime_principal_provenance",principal],["runtime_policy_provenance",policy],
    ["runtime_grant_provenance",grant],["runtime_application_session_bindings",app],["runtime_execution_sessions",execution]] as const) insert(raw.db,table,row);
  const q: HeldOutputCommand={recordVersion:1,expected:expected(attempt,issue.ownerNonce),expectedSecurityRevision:1,
    executionSessionId:executionId,expectedBindingRevision:1,expectedApplicationGeneration:1,expectedApplicationRevision:1,
    expectedPrincipalRevision:1,policyId:policy.policyId,policyVersion:1,policyRevision:1,grantId:grant.grantId,
    authorizationRevision:1,provenanceSourceRevision:1,expectedStream:{streamId:null,revision:0,lastAccepted:0},
    operationId:randomUUID(),idempotencyKey:"held:"+randomUUID(),outputId:randomUUID(),producerId:issue.ownerId,
    producerEventId:"event:"+randomUUID(),destinationId:policy.destinationId,channel:"fixture.metadata",sequence:1,
    confidentiality:"UNVERIFIED",claim:null,atMs:2000};
  return {ref,repository,raw,issue,attempt,policy,principal,grant,execution,app,q};
}
function ready() {
  const f=setup(), receipt=f.repository.recordHeldOutputForTest(f.q);
  expect(receipt.outcome,JSON.stringify(receipt)).toBe("FIXTURE_HELD_METADATA_COMMITTED");
  if(receipt.outcome!=="FIXTURE_HELD_METADATA_COMMITTED") throw new Error("Fixture required");
  const request=HeldOutputRevalidationSchema.parse({
    expected:f.q.expected,outputId:receipt.outputId,operationId:receipt.operationId,outboxId:receipt.outboxId,
    executionSessionId:f.execution.executionSessionId,applicationSessionId:f.app.applicationSessionId,
    workspaceBindingId:f.attempt.bindingId,workspaceGeneration:f.attempt.bindingGeneration,
    producerId:f.q.producerId,producerEventId:f.q.producerEventId,idempotencyKey:f.q.idempotencyKey,
    destinationId:f.q.destinationId,channel:f.q.channel,sequence:receipt.sequence,securityRevision:1,atMs:2100,
  });
  return {...f,receipt,request};
}
type Fixture=ReturnType<typeof ready>;
function denied(r: HeldOutputRevalidationResult, reason?:string) {
  expect(r).toMatchObject({decision:"DENIED",productionAccepted:false,executionAuthority:false,publicationAuthority:false,deliveryAuthority:false});
  expect(Object.isFrozen(r)).toBe(true);expect(Object.isFrozen(r.checks)).toBe(true);expect(Object.isFrozen(r.reasons)).toBe(true);
  expect(r.checks).toMatchObject({productionAuthentication:"UNAVAILABLE",productionAuthorization:"NOT_EVALUATED",
    destinationAuthorization:"NOT_EVALUATED",classificationAuthority:"NOT_EVALUATED",delivery:"NOT_EVALUATED"});
  if(reason) expect(r.reasonCode,JSON.stringify(r)).toBe(reason);
  return r;
}
function state(f:Fixture) {
  return f.raw.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all()
    .map(r=>[r.name,f.raw.db.prepare('SELECT * FROM "'+String(r.name)+'"').all()]);
}
function outputState(f:Fixture) {return OUTPUT_TABLES.map(t=>f.raw.db.prepare("SELECT * FROM "+t).all());}
function files(f:Fixture) {
  const folder=path.dirname(testDatabaseFilename(f.ref));
  return fs.readdirSync(folder).sort().map(name=>({name,sha:createHash("sha256").update(fs.readFileSync(path.join(folder,name))).digest("hex")}));
}
function evaluateUnchanged(f:Fixture, input:unknown=f.request) {
  const before=state(f), bytes=files(f), r=denied(f.repository.evaluateHeldOutputRevalidation(input));
  expect(state(f)).toEqual(before); expect(files(f)).toEqual(bytes);
  expect(JSON.stringify(r)).not.toContain(f.issue.ownerNonce); return r;
}
// Corruption setup only against the newly initialized, test-owned database.
function corrupt(f:Fixture, table:string, sql:string) {
  const triggers=f.raw.db.prepare("SELECT name,sql FROM sqlite_schema WHERE type='trigger' AND tbl_name=?").all(table);
  f.raw.db.exec("PRAGMA foreign_keys=OFF; PRAGMA ignore_check_constraints=ON");
  try {for(const t of triggers) f.raw.db.exec("DROP TRIGGER "+String(t.name)); f.raw.db.exec(sql);}
  finally {for(const t of triggers) f.raw.db.exec(String(t.sql)); f.raw.db.exec("PRAGMA foreign_keys=ON; PRAGMA ignore_check_constraints=OFF");}
}
function cancelInFixture(f:Fixture) {
  const requestId=randomUUID(),decisionId=randomUUID(),atMs=2200;
  const a=AttemptSchema.parse({...f.attempt,stateVersion:f.attempt.stateVersion+1,updatedAtMs:atMs,
    cancellationPayload:JSON.stringify({requestId,decisionId,intentGeneration:1,reason:"OWNER_CANCELLED",
      requestDigest:hash("synthetic-cancel"),requestedAtMs:atMs,noLaunch:true,ack:null,exit:null})});
  f.raw.db.prepare("UPDATE runtime_attempts SET stateVersion=?,updatedAtMs=?,cancellationPayload=? WHERE attemptId=?")
    .run(a.stateVersion,a.updatedAtMs,a.cancellationPayload,a.attemptId);
  appendEvent(f.raw.db,a,randomUUID(),"CANCEL_INTENT",requestId,decisionId); verifyHistory(f.raw.db,a);
  return a;
}
function stop(f:Fixture, repository=f.repository) {
  return repository.activateSecurityStop({expected:f.q.expected,expectedSecurityRevision:1,operationId:randomUUID(),
    eventId:randomUUID(),action:"ACTIVATE_STOP",reason:"TEST_SECURITY_CONCERN",atMs:2200});
}
// Deterministic scheduling in tests only; no callback is installed in production repository code.
function duringRead(f:Fixture, mutation:()=>void) {
  const original=DatabaseSync.prototype.prepare; let fired=false;
  const spy=vi.spyOn(DatabaseSync.prototype,"prepare").mockImplementation(function(this:DatabaseSync,sql:string) {
    const stmt=original.call(this,sql);
    if(!fired && this!==f.raw.db && sql==="SELECT * FROM runtime_accepted_outputs WHERE outputId=?") {fired=true;mutation();}
    return stmt;
  });
  try {const r=f.repository.evaluateHeldOutputRevalidation(f.request); expect(fired).toBe(true);return denied(r);}
  finally {spy.mockRestore();}
}

describe("PI11B contract and current canonical fixture",()=>{
  it("C01 valid fixture is structurally consistent but UNKNOWN and production authority deny",()=>{
    const f=ready(),r=evaluateUnchanged(f);
    expect(USER_VERSION).toBe(10); expect(r).toMatchObject({held:true,outputId:f.receipt.outputId,
      consistency:"FIXTURE_METADATA_CONSISTENT",reasonCode:"SECURITY_STATE_UNKNOWN",
      checks:{metadata:"VERIFIED",attempt:"VERIFIED",session:"VERIFIED",provenance:"VERIFIED",security:"UNKNOWN"},
      observed:{attemptVersion:3,executionEpoch:1,securityRevision:1,policyRevision:1,authorizationRevision:1}});
    expect(Object.isFrozen(r.observed)).toBe(true);evidence("pi11b-consistency",{result:r,reference:f.ref,noMutation:true});
  });
  it("C02 missing output and unknown operation have deterministic safe denials",()=>{
    const f=ready();expect(evaluateUnchanged(f,{...f.request,outputId:randomUUID()}).reasonCode).toBe("OUTPUT_NOT_FOUND");
    expect(evaluateUnchanged(f,{...f.request,operationId:randomUUID()}).reasonCode).toBe("OUTPUT_OPERATION_NOT_FOUND");
  });
  it.each(["outputId","operationId","expected","outboxId","executionSessionId","securityRevision"])("C03 missing %s rejects",field=>{
    const f=ready(),q:Record<string,unknown>=structuredClone(f.request);delete q[field];
    expect(evaluateUnchanged(f,q).reasonCode).toBe("INVALID_REQUEST");
  });
  it.each(["payload","stdout","stderr","isFixture","sourceClass","publicationAuthority","deliveryAuthority","callback"])(
    "C04 untrusted extra %s is not a permit or payload channel",field=>{
      const f=ready();expect(evaluateUnchanged(f,{...f.request,[field]:"SYNTHETIC_PRIVATE"}).reasonCode).toBe("INVALID_REQUEST");
    });
  it("C05 accessors and oversized input never leak values or execute getters",()=>{
    const f=ready(),getter=vi.fn(()=>{throw new Error("SYNTHETIC_PRIVATE");});
    evaluateUnchanged(f,Object.defineProperty({...f.request},"payload",{get:getter}));expect(getter).not.toHaveBeenCalled();
    expect(evaluateUnchanged(f,{...f.request,idempotencyKey:"X".repeat(1000)}).reasonCode).toBe("INVALID_REQUEST");
  });
  it.each(["project","incarnation","task","attempt","epoch","owner","host","nonce","application","execution","workspace","generation",
    "producer","destination","channel","event","key","sequence","outbox"])("B01 wrong %s binding denies",kind=>{
    const f=ready(),q=structuredClone(f.request);
    if(kind==="project")q.expected.projectId=randomUUID();if(kind==="incarnation")q.expected.authorityIncarnation=randomUUID();
    if(kind==="task")q.expected.taskId="other";if(kind==="attempt")q.expected.attemptId=randomUUID();
    if(kind==="epoch")q.expected.attemptGeneration++;if(kind==="owner")q.expected.ownerId=randomUUID();
    if(kind==="host")q.expected.hostInstanceId=randomUUID();if(kind==="nonce")q.expected.ownerNonce=hash("wrong");
    if(kind==="application")q.applicationSessionId="other";if(kind==="execution")q.executionSessionId="other";
    if(kind==="workspace")q.workspaceBindingId="other";if(kind==="generation")q.workspaceGeneration++;
    if(kind==="producer")q.producerId=randomUUID();if(kind==="destination")q.destinationId="other";
    if(kind==="channel")q.channel="fixture.diagnostic";if(kind==="event")q.producerEventId="other";
    if(kind==="key")q.idempotencyKey="other";if(kind==="sequence")q.sequence++;if(kind==="outbox")q.outboxId=randomUUID();
    expect(evaluateUnchanged(f,q).consistency).not.toBe("FIXTURE_METADATA_CONSISTENT");
  });
  it.each([0,-1,1.5,Number.MAX_SAFE_INTEGER+1])("B02 invalid sequence %s rejects",sequence=>{
    const f=ready();expect(evaluateUnchanged(f,{...f.request,sequence}).reasonCode).toBe("INVALID_REQUEST");
  });
  it("B03 duplicate sequence cannot be persisted by SQL and revalidation never allocates",()=>{
    const f=ready(),a=f.raw.db.prepare("SELECT * FROM runtime_accepted_outputs").get()!;
    f.raw.db.exec("PRAGMA foreign_keys=OFF");
    try {expect(()=>insertOutputRow(f.raw.db,"runtime_accepted_outputs",{...a,outputId:randomUUID(),operationId:randomUUID(),outboxId:randomUUID()})).toThrow(/UNIQUE/);}
    finally {f.raw.db.exec("PRAGMA foreign_keys=ON");}
    const before=outputState(f); for(let i=0;i<5;i++)evaluateUnchanged(f);expect(outputState(f)).toEqual(before);
  });
});

describe("PI11B integrity, schema and reopen",()=>{
  const cases:[string,string,string][]=[
    ["missing outbox","runtime_output_outbox","DELETE FROM runtime_output_outbox"],
    ["missing metadata","runtime_accepted_outputs","DELETE FROM runtime_accepted_outputs"],
    ["missing operation","runtime_output_operations","DELETE FROM runtime_output_operations"],
    ["missing audit","runtime_output_events","DELETE FROM runtime_output_events"],
    ["missing attempt","runtime_attempts","DELETE FROM runtime_attempts"],
    ["missing session","runtime_execution_sessions","DELETE FROM runtime_execution_sessions"],
    ["missing application","runtime_application_session_bindings","DELETE FROM runtime_application_session_bindings"],
    ["missing principal","runtime_principal_provenance","DELETE FROM runtime_principal_provenance"],
    ["missing policy","runtime_policy_provenance","DELETE FROM runtime_policy_provenance"],
    ["missing grant","runtime_grant_provenance","DELETE FROM runtime_grant_provenance"],
    ["outbox association","runtime_output_outbox","UPDATE runtime_output_outbox SET outputId='"+randomUUID()+"'"],
    ["binding shape","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET bindingSnapshot='{}'"],
    ["binding digest","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET bindingDigest='"+hash("wrong")+"'"],
    ["metadata digest","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET payloadDigest='"+hash("wrong")+"'"],
    ["metadata version","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET recordVersion=2"],
    ["nonnull reference","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET payloadReference='SYNTHETIC_PRIVATE'"],
    ["nonHELD","runtime_output_outbox","UPDATE runtime_output_outbox SET state='DELIVERED'"],
    ["audit head","runtime_output_outbox","UPDATE runtime_output_outbox SET lastEventId='"+randomUUID()+"'"],
    ["event type/version","runtime_output_events","UPDATE runtime_output_events SET eventType='UNSUPPORTED_V2'"],
    ["event digest","runtime_output_events","UPDATE runtime_output_events SET eventDigest='"+hash("wrong")+"'"],
    ["sequence owner","runtime_output_streams","UPDATE runtime_output_streams SET attemptGeneration=2"],
    ["operation digest","runtime_output_operations","UPDATE runtime_output_operations SET requestDigest='"+hash("wrong")+"'"],
    ["sequence counter","runtime_output_streams","UPDATE runtime_output_streams SET lastAccepted=2,revision=2"],
  ];
  it.each(cases)("I01 %s denies warm reads and cold open without repair",(_label,table,sql)=>{
    const f=ready();corrupt(f,table,sql);const r=evaluateUnchanged(f);
    expect(r.consistency).not.toBe("FIXTURE_METADATA_CONSISTENT");
    f.repository.close();const before=files(f);expect(()=>DurableAttemptRepository.openForTest(f.ref)).toThrow();
    expect(files(f)).toEqual(before);
  });
  it("I02 unsupported schema warm denial and cold rejection never migrates",()=>{
    const f=ready();f.raw.db.exec("PRAGMA user_version=99");
    expect(evaluateUnchanged(f).reasonCode).toBe("SCHEMA_UNSUPPORTED");f.repository.close();
    const before=files(f);expect(()=>DurableAttemptRepository.openForTest(f.ref)).toThrow();expect(files(f)).toEqual(before);
  });
  it("I03 normal reopen preserves HELD/identity and denies stale per-instance issuer without rebinding",()=>{
    const f=ready(),before=outputState(f); f.repository.close();
    const repository=own(DurableAttemptRepository.openForTest(f.ref));
    const r=denied(repository.evaluateHeldOutputRevalidation(f.request));
    expect(r.reasons).toContain("HOST_ISSUER_MISMATCH");expect(r.held).toBe(true);expect(outputState(f)).toEqual(before);
    evidence("pi11b-reopen",{result:r,noRebind:true,noOutputMutation:true});
  });
});

describe("PI11B current lifecycle and provenance",()=>{
  it("L01 terminal and revision changes deny even when caller supplies current Expected",()=>{
    const f=ready(),a=f.repository.commitTerminal(terminalCommand(f.attempt,f.issue.ownerNonce,"INTERRUPTED")).attempt;
    const r=evaluateUnchanged(f,{...f.request,expected:expected(a,f.issue.ownerNonce),atMs:2300});
    expect(r.reasons).toContain("ATTEMPT_TERMINAL");expect(r.reasons).toContain("ATTEMPT_REVISION_STALE");
  });
  it("L02 persisted noLaunch cancellation is considered even at APPROVAL_GRANTED",()=>{
    const f=ready();f.raw.db.exec("BEGIN IMMEDIATE");const a=cancelInFixture(f);f.raw.db.exec("COMMIT");
    const r=evaluateUnchanged(f,{...f.request,expected:expected(a,f.issue.ownerNonce),atMs:2300});
    expect(a.phase).toBe("APPROVAL_GRANTED");expect(r.reasons).toContain("ATTEMPT_CANCELLED");
  });
  it("L03 actual phase transition makes captured attempt revision stale",()=>{
    const f=ready(),a=f.repository.transition(transitionCommand(f.attempt,f.issue.ownerNonce,"LAUNCHING"));
    const r=evaluateUnchanged(f,{...f.request,expected:expected(a,f.issue.ownerNonce)});
    expect(r.reasons).toContain("ATTEMPT_REVISION_STALE");expect(r.reasons).toContain("ATTEMPT_LIFECYCLE_DENIED");
  });
  it("L04 actual recovery fencing prevents old epoch/owner from being reused",()=>{
    const f=ready(),a=f.repository.transition(transitionCommand(f.attempt,f.issue.ownerNonce,"UNCERTAIN"));
    f.repository.fenceForTestRecovery({expected:expected(a,f.issue.ownerNonce),newOwner:{hostInstanceId:randomUUID(),ownerId:randomUUID(),ownerNonce:hash("new")},
      eventId:randomUUID(),atMs:a.updatedAtMs+1,authorization:"s12-test-only",testRecoveryGrantId:randomUUID()});
    expect(evaluateUnchanged(f).consistency).not.toBe("FIXTURE_METADATA_CONSISTENT");
  });
  const updates:[string,string,string][]=[
    ["principal revoked","UPDATE runtime_principal_provenance SET status='REVOKED',revision=revision+1","PRINCIPAL_REVOKED"],
    ["policy revoked","UPDATE runtime_policy_provenance SET status='REVOKED',revision=revision+1","POLICY_REVOKED"],
    ["policy revision","UPDATE runtime_policy_provenance SET revision=revision+1","POLICY_REVISION_MISMATCH"],
    ["grant revoked","UPDATE runtime_grant_provenance SET status='REVOKED',authorizationRevision=authorizationRevision+1","GRANT_REVOKED"],
    ["authorization revision","UPDATE runtime_grant_provenance SET authorizationRevision=authorizationRevision+1","GRANT_REVISION_MISMATCH"],
    ["session revoked","UPDATE runtime_execution_sessions SET status='REVOKED',bindingRevision=bindingRevision+1","SESSION_REVOKED"],
    ["application revoked","UPDATE runtime_application_session_bindings SET status='REVOKED',revision=revision+1","APPLICATION_SESSION_REVOKED"],
    ["host generation","UPDATE runtime_execution_sessions SET hostIssuerGeneration=hostIssuerGeneration+1,bindingRevision=bindingRevision+1","HOST_ISSUER_GENERATION_MISMATCH"],
    ["application generation","UPDATE runtime_application_session_bindings SET generation=generation+1,revision=revision+1","SESSION_APPLICATION_GENERATION_MISMATCH"],
  ];
  it.each(updates)("P01 current %s denies without rewriting metadata",(_label,sql,reason)=>{
    const f=ready(),before=outputState(f);f.raw.db.exec(sql);const r=evaluateUnchanged(f);
    expect(r.reasons).toContain(reason);expect(r.consistency).toBe("FIXTURE_METADATA_INVALID");expect(outputState(f)).toEqual(before);
  });
  it("P02 expiry and time rollback are inspection denials, not trusted-clock assertions",()=>{
    const f=ready();expect(evaluateUnchanged(f,{...f.request,atMs:10001}).reasons).toContain("OUTPUT_BINDING_TIME_INVALID");
    expect(evaluateUnchanged(f,{...f.request,atMs:1999}).reasons).toContain("OUTPUT_BINDING_TIME_INVALID");
  });
});

describe("PI11B security and read-only behavior",()=>{
  it.each(["UNKNOWN","BLOCKED","ACTIVE_STOP","MISSING","CORRUPT","UNSUPPORTED","STALE"])("S01 %s always denies and never clears security",kind=>{
    const f=ready();
    if(kind==="BLOCKED")f.raw.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=2");
    if(kind==="ACTIVE_STOP")stop(f);
    if(kind==="MISSING")corrupt(f,"runtime_execution_security","DELETE FROM runtime_execution_security");
    if(kind==="CORRUPT")corrupt(f,"runtime_execution_security","UPDATE runtime_execution_security SET securityRevision=0");
    if(kind==="UNSUPPORTED")corrupt(f,"runtime_execution_security","UPDATE runtime_execution_security SET recordVersion=2");
    const r=evaluateUnchanged(f,kind==="STALE"?{...f.request,securityRevision:2}:f.request);
    if(kind==="UNKNOWN")expect(r.reasonCode).toBe("SECURITY_STATE_UNKNOWN");
    if(kind==="BLOCKED")expect(r.reasons).toContain("SECURITY_STATE_BLOCKED");
    if(kind==="ACTIVE_STOP")expect(r.reasons).toContain("SECURITY_STOP_ACTIVE");
    if(kind==="STALE")expect(r.reasons).toContain("SECURITY_REVISION_STALE");
  });
  it("S02 stop journal corruption fails closed without activation or audit repair",()=>{
    const f=ready();stop(f);corrupt(f,"runtime_security_stop_events","UPDATE runtime_security_stop_events SET eventDigest='"+hash("wrong")+"'");
    const activate=vi.spyOn(f.repository,"activateSecurityStop");evaluateUnchanged(f);expect(activate).not.toHaveBeenCalled();
  });
  it("R01 actual query_only connection performs consistent read without writable fallback",()=>{
    const f=ready();
    const db=(f.repository as unknown as {connection:RepositoryConnection}).connection.db;
    db.exec("PRAGMA query_only=ON");
    const before=files(f),r=evaluateUnchanged(f);
    expect(r.consistency).toBe("FIXTURE_METADATA_CONSISTENT");expect(db.prepare("PRAGMA query_only").get()?.query_only).toBe(1);
    expect(files(f)).toEqual(before);
    const readonly=own(DurableAttemptRepository.openHostOwnedForFixtures(openOwnedFixtureConnection(f.ref,true)));
    const reopened=denied(readonly.evaluateHeldOutputRevalidation(f.request));
    expect(reopened.reasons).toContain("HOST_ISSUER_MISMATCH");expect(files(f)).toEqual(before);
    evidence("pi11b-readonly",{queryOnly:1,result:r,reopened,byteStable:true});
  });
  it("R02 executed SQL consists only of read statements and BEGIN/COMMIT",()=>{
    const f=ready(),sql:string[]=[],p=DatabaseSync.prototype.prepare,x=DatabaseSync.prototype.exec;
    const ps=vi.spyOn(DatabaseSync.prototype,"prepare").mockImplementation(function(this:DatabaseSync,s:string){sql.push(s);return p.call(this,s);});
    const xs=vi.spyOn(DatabaseSync.prototype,"exec").mockImplementation(function(this:DatabaseSync,s:string){sql.push(s);return x.call(this,s);});
    try {denied(f.repository.evaluateHeldOutputRevalidation(f.request));}finally{ps.mockRestore();xs.mockRestore();}
    expect(sql.length).toBeGreaterThan(20);expect(sql.every(s=>/^(SELECT|PRAGMA (application_id|user_version|quick_check\(1\)|foreign_key_check)|BEGIN$|COMMIT$)/.test(s))).toBe(true);
    expect(sql.filter(s=>s==="BEGIN")).toHaveLength(1);expect(sql.filter(s=>s==="COMMIT")).toHaveLength(1);
  });
  it("R03 actual EXCLUSIVE lock produces BUSY, no positive or partial result",()=>{
    const f=ready(),before=outputState(f);f.raw.db.exec("BEGIN EXCLUSIVE");
    let r:HeldOutputRevalidationResult;try{r=denied(f.repository.evaluateHeldOutputRevalidation(f.request),"STORAGE_BUSY");}
    finally{f.raw.db.exec("ROLLBACK");}
    expect(outputState(f)).toEqual(before);evaluateUnchanged(f);evidence("pi11b-busy",{result:r!,noMutation:true});
  });
  it("R04 injected read failure discloses only fixed code and no input/SQL details",()=>{
    const f=ready(),prepare=DatabaseSync.prototype.prepare;
    const spy=vi.spyOn(DatabaseSync.prototype,"prepare").mockImplementation(function(this:DatabaseSync,s:string){
      if(this!==f.raw.db && s==="SELECT * FROM runtime_accepted_outputs WHERE outputId=?")throw new Error("SYNTHETIC_PRIVATE path SQL");
      return prepare.call(this,s);
    });
    let r:HeldOutputRevalidationResult;try{r=denied(f.repository.evaluateHeldOutputRevalidation(f.request),"STORAGE_UNAVAILABLE");}
    finally{spy.mockRestore();}expect(JSON.stringify(r!)).not.toContain("SYNTHETIC_PRIVATE");evaluateUnchanged(f);
  });
  it("R05 close before or during evaluation denies; missing/serialized receiver cannot acquire storage",()=>{
    const f=ready();f.repository.close();denied(f.repository.evaluateHeldOutputRevalidation(f.request),"REPOSITORY_CLOSED");
    const g=ready(),r=duringRead(g,()=>g.repository.close());expect(r.consistency).not.toBe("FIXTURE_METADATA_CONSISTENT");
    denied(DurableAttemptRepository.prototype.evaluateHeldOutputRevalidation.call({} as unknown as DurableAttemptRepository,g.request),
      "PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
  });
});

describe("PI11B actual overlapping SQLite snapshots",()=>{
  it.each(["policy+security","cancel","revision","session invalidation"])("T01 concurrent %s is observed wholly before or after commit",kind=>{
    const f=ready(),before=outputState(f);let changed:ReturnType<typeof cancelInFixture>|undefined;
    const r=duringRead(f,()=>{
      f.raw.db.exec("BEGIN IMMEDIATE");
      if(kind==="cancel")changed=cancelInFixture(f);
      if(kind==="policy+security")f.raw.db.exec("UPDATE runtime_policy_provenance SET revision=revision+1; UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=2");
      if(kind==="session invalidation")f.raw.db.exec("UPDATE runtime_execution_sessions SET hostIssuerGeneration=hostIssuerGeneration+1,bindingRevision=bindingRevision+1");
      if(kind==="revision") {
        const a=AttemptSchema.parse({...f.attempt,phase:"LAUNCHING",stateVersion:4,updatedAtMs:2200});
        f.raw.db.prepare("UPDATE runtime_attempts SET phase=?,stateVersion=?,updatedAtMs=? WHERE attemptId=?").run(a.phase,a.stateVersion,a.updatedAtMs,a.attemptId);
        appendEvent(f.raw.db,a,randomUUID(),"PHASE_CHANGED",randomUUID(),null);
      }
    });
    expect(r.consistency).toBe("FIXTURE_METADATA_CONSISTENT");
    expect(r.observed).toMatchObject({attemptVersion:3,policyRevision:1,securityRevision:1});
    f.raw.db.exec("COMMIT");const after=evaluateUnchanged(f,{...f.request,atMs:2300,...(changed?{expected:expected(changed,f.issue.ownerNonce)}:{})});
    expect(after.consistency).toBe("FIXTURE_METADATA_INVALID");expect(outputState(f)).toEqual(before);
    evidence("pi11b-snapshot",{kind,beforeCommit:r,afterCommit:after,oneReaderSnapshot:true,noOutputMutation:true});
  });
  it("T02 actual competing stop activation cannot commit over reader; later activation invalidates next read",()=>{
    const f=ready(),before=outputState(f),writer=own(DurableAttemptRepository.openForTest(f.ref));let failure:unknown;
    const r=duringRead(f,()=>{try{stop(f,writer);}catch(error){failure=error;}});
    expect(failure).toMatchObject({code:"DATABASE_BUSY"});expect(r.consistency).toBe("FIXTURE_METADATA_CONSISTENT");
    stop(f);expect(evaluateUnchanged(f).reasons).toContain("SECURITY_STOP_ACTIVE");expect(outputState(f)).toEqual(before);
  });
  it("T03 independent reader connection keeps denial and no writes",()=>{
    const f=ready(),other=own(DurableAttemptRepository.openHostOwnedForFixtures(openOwnedFixtureConnection(f.ref,true))),before=state(f);
    const r=duringRead(f,()=>denied(other.evaluateHeldOutputRevalidation(f.request)));
    expect(r.consistency).toBe("FIXTURE_METADATA_CONSISTENT");expect(state(f)).toEqual(before);
  });
});

describe("PI11B host/fixture separation and effect barriers",()=>{
  it("H01 real HOST_SQLITE construction short-circuits before revalidation SQL; no fixture API exposure",async()=>{
    const base=path.join(root.root,"pi11b-host-"+randomUUID()),storageRoot=path.join(base,"storage"),registryRoot=path.join(base,"registry"),project=path.join(base,"project");
    for(const p of [base,storageRoot,registryRoot,project])fs.mkdirSync(p);
    const canonical=await validateRoot(project),projectId=randomUUID();
    const entry={identity:{schemaVersion:1 as const,projectId,createdAt:"2026-11-10T00:00:00.000Z"},canonicalPath:canonical.canonicalPath,
      fileKey:canonical.fileKey,status:"IDENTITY_ATTACHED" as const};
    const provider=HostSQLiteProvider.create({providerKind:"HOST_SQLITE",providerId:randomUUID(),storageRoot,bindings:[{
      projectId,authorityIncarnation:randomUUID(),storageId:randomUUID(),workspaceRoot:project,initializationPolicy:"CREATE_NEW"}]},registryRoot,()=>entry as RegistryEntry);
    const repository=own(DurableAttemptRepository.openHostOwnedSQLite(provider.open(projectId))),f=ready(),spy=vi.spyOn(DatabaseSync.prototype,"prepare");
    try{const r=denied(repository.evaluateHeldOutputRevalidation(f.request),"PRODUCTION_HOST_AUTHORITY_UNAVAILABLE");
      expect(r.checks.metadata).toBe("NOT_EVALUATED");expect(spy).not.toHaveBeenCalled();}
    finally{spy.mockRestore();}
    expect(repository.recordHeldOutputForTest(f.q).outcome).toBe("OUTPUT_DENIED");
  });
  it("H02 actual authentication/admission/publication chain stays unreachable and receipt cannot authorize",async()=>{
    const f=ready(),r=evaluateUnchanged(f),auth=createHostPrincipalBoundary(),admission=createExecutionAdmissionBoundary(auth.api),
      publication=createOutputPublicationBoundary(auth.api),write=vi.spyOn(fs,"writeFileSync"),fork=vi.spyOn(children,"fork"),
      listen=vi.spyOn(net.Server.prototype,"listen"),fetch=vi.spyOn(globalThis,"fetch");
    try{
      expect(auth.api.authenticate(r).status).toBe("AUTHENTICATION_DENIED");
      expect(await admission.api.admit(r,r)).toMatchObject({executionAuthority:false});
      const deniedPublication=publication.api.evaluate(r,r);
      expect(deniedPublication).toMatchObject({accepted:false,publicationAuthority:false,executionAuthority:false});
      expect(publication.inspectDenial(deniedPublication)).toMatchObject({repository:"NOT_EVALUATED",ownership:"NOT_EVALUATED",
        destination:"NOT_EVALUATED",confidentiality:"NOT_EVALUATED"});
      expect(write).not.toHaveBeenCalled();expect(fork).not.toHaveBeenCalled();expect(listen).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
      auth.invalidate();publication.invalidate();denied(f.repository.evaluateHeldOutputRevalidation(f.request));
      expect(publication.api.evaluate(r,r).accepted).toBe(false);
    }finally{write.mockRestore();fork.mockRestore();listen.mockRestore();fetch.mockRestore();auth.close();publication.close();admission.close();}
  });
});

