import { randomUUID, createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import children from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import { DurableAttemptRepository, type TestFault } from "../../../src/server/attempt-control/repository.js";
import { SCHEMA_STATEMENTS, USER_VERSION, PROFILE, APPLICATION_ID } from "../../../src/server/attempt-control/schema.js";
import { createTestDatabase, openTestConnection, testDatabaseFilename } from "../../../src/server/attempt-control/test-storage.js";
import { openOwnedFixtureConnection } from "../../../src/server/attempt-control/connection.js";
import { hash } from "../../../src/server/attempt-control/contracts.js";
import { HostSQLiteProvider } from "../../../src/server/attempt-control/host-sqlite.js";
import { validateRoot } from "../../../src/server/workspace/paths.js";
import type { RegistryEntry } from "../../../src/server/workspace/registry.js";
import { HeldOutputCommandSchema, OUTPUT_TABLES, bindingDigest, type HeldOutputCommand, type HeldOutputResult,
  type OutputFaultStage } from "../../../src/server/attempt-control/output-metadata.js";
import { insertOutputRow } from "../../../src/server/attempt-control/output-journal.js";
import { createHostPrincipalBoundary } from "../../../src/server/attempt-control/host-principal.js";
import { createExecutionAdmissionBoundary } from "../../../src/server/attempt-control/execution-admission.js";
import { createOutputPublicationBoundary } from "../../../src/server/attempt-control/output-publication.js";
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
function flags(r: HeldOutputResult) {
  expect(r).toMatchObject({productionAccepted:false,executionAuthority:false,publicationAuthority:false,deliveryAuthority:false});
  expect(Object.isFrozen(r)).toBe(true);
}
function committed(r: HeldOutputResult) {
  flags(r); expect(r.outcome,JSON.stringify(r)).toBe("FIXTURE_HELD_METADATA_COMMITTED");
  if(r.outcome!=="FIXTURE_HELD_METADATA_COMMITTED") throw new Error("Fixture commit required: "+("reasonCode" in r?r.reasonCode:r.outcome));
  expect(r.state).toBe("HELD"); expect(r.payloadReference).toBeNull(); return r;
}
function denied(r: HeldOutputResult, reason?: string) {
  flags(r); expect(r.outcome).toBe("OUTPUT_DENIED"); if(reason) expect(r).toMatchObject({reasonCode:reason});
}
function snapshot(f: ReturnType<typeof setup>) { return OUTPUT_TABLES.map(t=>f.raw.db.prepare(`SELECT * FROM ${t}`).all()); }
function original(f: ReturnType<typeof setup>) {
  return ["runtime_attempts","runtime_attempt_events","runtime_owner_epochs","runtime_execution_security","runtime_security_stop_events","runtime_security_stop_operations"]
    .map(t=>f.raw.db.prepare(`SELECT * FROM ${t}`).all());
}
function next(q: HeldOutputCommand, r: ReturnType<typeof committed>): HeldOutputCommand {
  return {...structuredClone(q),operationId:randomUUID(),outputId:randomUUID(),idempotencyKey:"key:"+randomUUID(),
    producerEventId:"event:"+randomUUID(),sequence:r.sequence+1,expectedStream:{streamId:r.streamId,revision:r.sequence,lastAccepted:r.sequence}};
}
function tamper(f: ReturnType<typeof setup>, table: string, sql: string, kind="no_update") {
  const name=table+"_"+kind;
  f.raw.db.exec("PRAGMA foreign_keys=OFF; PRAGMA ignore_check_constraints=ON");
  f.raw.db.exec("DROP TRIGGER "+name); f.raw.db.exec(sql);
  f.raw.db.exec(SCHEMA_STATEMENTS.find(s=>s.startsWith("CREATE TRIGGER "+name+" "))!);
  f.raw.db.exec("PRAGMA foreign_keys=ON; PRAGMA ignore_check_constraints=OFF");
}

describe("PI11A real repository held metadata",()=>{
  it("S01 schema10 has six held tables, no delivery/lease structure and no implicit rows",()=>{
    const f=setup(); expect(USER_VERSION).toBe(10); expect(PROFILE).toBe("pi11a-held-output-metadata-v1");
    expect(f.raw.db.prepare("SELECT count(*) AS n FROM sqlite_schema WHERE type='table'").get()?.n).toBe(18);
    expect(f.raw.db.prepare("SELECT name FROM sqlite_schema WHERE name LIKE '%delivery%' OR name LIKE '%acknowledgment%'").all()).toEqual([]);
    expect(f.raw.db.prepare("PRAGMA table_info(runtime_output_outbox)").all().map(r=>String(r.name))).not.toContain("leaseGeneration");
    expect(snapshot(f).every(t=>t.length===0)).toBe(true);
  });
  it("S02 actual commit writes one linked metadata/outbox/audit and preserves original authority",()=>{
    const f=setup(), before=original(f), r=committed(f.repository.recordHeldOutputForTest(f.q));
    expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]); expect(original(f)).toEqual(before);
    const a=f.raw.db.prepare("SELECT * FROM runtime_accepted_outputs").get()!;
    expect(a).toMatchObject({recordClass:"OFFLINE_CONTRACT_ONLY",recordVersion:1,payloadReference:null,payloadByteLength:0,classificationSource:"UNVERIFIED"});
    expect(a.bindingDigest).toBe(bindingDigest(JSON.parse(String(a.bindingSnapshot))));
    expect(JSON.stringify(r)).not.toContain(f.issue.ownerNonce);
    expect(HeldOutputCommandSchema.safeParse({...f.q,payloadDigest:hash("raw")}).success).toBe(false);
    evidence("pi11a-commit",{ref:f.ref,receipt:r,counts:snapshot(f).map(t=>t.length),originalPreserved:true});
  });
  it.each(["payloadReference","stdout","stderr","payload","modelResponse","toolResult","isFixture","sourceClass","bindingDigest","publicationAuthority"])(
    "S03 extra %s cannot persist input or override metadata provenance",field=>{
      const f=setup(), before=snapshot(f); denied(f.repository.recordHeldOutputForTest({...f.q,[field]:"SYNTHETIC_PRIVATE"}));
      expect(snapshot(f)).toEqual(before);
    });
  it.each(["outputId","operationId","producerId","executionSessionId","destinationId","channel","policyId","grantId"])(
    "S04 missing %s denies",field=>{
      const f=setup(), q: Record<string,unknown>=structuredClone(f.q); delete q[field];
      denied(f.repository.recordHeldOutputForTest(q)); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
    });
  it.each(["project","incarnation","generation","owner","session","producer","destination","channel","policyRevision","grantRevision","applicationGeneration","applicationRevision","principalRevision","bindingRevision","securityRevision"])(
    "S05 wrong %s binding denies",kind=>{
      const f=setup(), q=structuredClone(f.q);
      if(kind==="project") q.expected.projectId=randomUUID();
      if(kind==="incarnation") q.expected.authorityIncarnation=randomUUID();
      if(kind==="generation") q.expected.attemptGeneration++;
      if(kind==="owner") q.expected.ownerNonce=hash("wrong");
      if(kind==="session") q.executionSessionId="other";
      if(kind==="producer") q.producerId=randomUUID();
      if(kind==="destination") q.destinationId="other";
      if(kind==="channel") Reflect.set(q,"channel","external-send");
      if(kind==="policyRevision") q.policyRevision++;
      if(kind==="grantRevision") q.authorizationRevision++;
      if(kind==="applicationGeneration") q.expectedApplicationGeneration++;
      if(kind==="applicationRevision") q.expectedApplicationRevision++;
      if(kind==="principalRevision") q.expectedPrincipalRevision++;
      if(kind==="bindingRevision") q.expectedBindingRevision++;
      if(kind==="securityRevision") q.expectedSecurityRevision++;
      denied(f.repository.recordHeldOutputForTest(q)); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
    });
  it.each([0,-1,1.5,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1])("S06 invalid/overflow sequence %s denies",sequence=>{
    const f=setup(); denied(f.repository.recordHeldOutputForTest({...f.q,sequence})); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
  });
  it("S07 malformed record/accessor cannot run payload getter or leak data",()=>{
    const f=setup(), getter=vi.fn(()=>{throw new Error("SYNTHETIC_PRIVATE");}), q=Object.defineProperty(structuredClone(f.q),"payload",{get:getter});
    denied(f.repository.recordHeldOutputForTest(q)); expect(getter).not.toHaveBeenCalled();
    denied(f.repository.recordHeldOutputForTest({...f.q,recordVersion:2}));
    expect(snapshot(f).every(t=>t.length===0)).toBe(true);
  });
  it("I01 exact retry returns original identities without new sequence/event/claim",()=>{
    const f=setup(); f.q.claim={claimKey:hash("fixture-claim"),grantId:f.grant.grantId,authorizationRevision:1};
    const first=committed(f.repository.recordHeldOutputForTest(f.q)), before=snapshot(f);
    const replay=f.repository.recordHeldOutputForTest({...f.q,atMs:2100,expectedStream:{streamId:null,revision:900,lastAccepted:900}});
    flags(replay); expect(replay).toMatchObject({...first,outcome:"FIXTURE_HELD_METADATA_REPLAY"}); expect(snapshot(f)).toEqual(before);
  });
  it.each(["producerEventId","outputId","idempotencyKey","classification","claim"])("I02 conflicting %s retry denies",field=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q)); const before=snapshot(f), q=structuredClone(f.q);
    if(field==="producerEventId") q.producerEventId="changed";
    if(field==="outputId") q.outputId=randomUUID();
    if(field==="idempotencyKey") q.idempotencyKey="changed";
    if(field==="classification") q.confidentiality="PUBLIC";
    if(field==="claim") q.claim={claimKey:hash("changed"),grantId:q.grantId,authorizationRevision:1};
    denied(f.repository.recordHeldOutputForTest(q),"OUTPUT_CONFLICT"); expect(snapshot(f)).toEqual(before);
  });
  it("I03 sequential allocation and per-channel namespace survive reopen",()=>{
    const f=setup(), r1=committed(f.repository.recordHeldOutputForTest(f.q));
    const q2=next(f.q,r1), r2=committed(f.repository.recordHeldOutputForTest(q2)); expect(r2.sequence).toBe(2);
    const other={...structuredClone(f.q),operationId:randomUUID(),outputId:randomUUID(),channel:"fixture.diagnostic" as const};
    expect(committed(f.repository.recordHeldOutputForTest(other)).sequence).toBe(1);
    f.repository.close(); const reopened=own(DurableAttemptRepository.openForTest(f.ref));
    const before=snapshot(f), replay=reopened.recordHeldOutputForTest(q2); expect(replay).toMatchObject({...r2,outcome:"FIXTURE_HELD_METADATA_REPLAY"});
    expect(snapshot(f)).toEqual(before); expect(committed(reopened.recordHeldOutputForTest(next(q2,r2))).sequence).toBe(3);
  });
  it("I04 second owned repository connection competes for same stream sequence and can replay winner",()=>{
    const f=setup(), second=own(DurableAttemptRepository.openForTest(f.ref));
    const r=committed(f.repository.recordHeldOutputForTest(f.q));
    const stale={...structuredClone(f.q),operationId:randomUUID(),outputId:randomUUID(),producerEventId:"other"};
    denied(second.recordHeldOutputForTest(stale),"OUTPUT_CONFLICT");
    expect(second.recordHeldOutputForTest(f.q)).toMatchObject({...r,outcome:"FIXTURE_HELD_METADATA_REPLAY"});
    expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]);
    expect(committed(second.recordHeldOutputForTest(next(f.q,r))).sequence).toBe(2);
  });
  it("I05 duplicate stable key/event/output with new operation cannot silently coalesce",()=>{
    const f=setup(), r=committed(f.repository.recordHeldOutputForTest(f.q));
    for(const field of ["idempotencyKey","producerEventId","outputId"] as const){
      const q=next(f.q,r); q[field]=f.q[field]; denied(f.repository.recordHeldOutputForTest(q),"OUTPUT_CONFLICT");
    }
    expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]);
  });
});

describe("PI11A SQL state constraints and atomicity",()=>{
  it.each(["PENDING","CLAIMED","DELIVERING","DELIVERED","CANCELLED","RETRYABLE_FAILURE"])("D01 SQL cannot insert state %s",state=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q));
    const row=f.raw.db.prepare("SELECT * FROM runtime_output_outbox").get()!;
    f.raw.db.exec("PRAGMA foreign_keys=OFF");
    expect(()=>insertOutputRow(f.raw.db,"runtime_output_outbox",{...row,outboxId:randomUUID(),outputId:randomUUID(),state})).toThrow(/CHECK/);
    f.raw.db.exec("PRAGMA foreign_keys=ON"); expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]);
  });
  it.each(["payloadReference","payloadByteLength","recordVersion","recordClass","classificationDigest"])("D02 SQL cannot persist forbidden %s",field=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q));
    const row=f.raw.db.prepare("SELECT * FROM runtime_accepted_outputs").get()!;
    const value=field==="payloadByteLength"||field==="recordVersion"?2:field==="classificationDigest"?hash("unverified"):"SYNTHETIC_PRIVATE";
    f.raw.db.exec("PRAGMA foreign_keys=OFF");
    expect(()=>insertOutputRow(f.raw.db,"runtime_accepted_outputs",{...row,outputId:randomUUID(),operationId:randomUUID(),outboxId:randomUUID(),
      sequence:2,producerEventId:randomUUID(),[field]:value})).toThrow(/CHECK/);
    f.raw.db.exec("PRAGMA foreign_keys=ON");
  });
  it.each(["runtime_accepted_outputs","runtime_output_operations","runtime_output_outbox","runtime_output_events","runtime_output_grant_claims"])(
    "D03 %s supported SQL UPDATE/DELETE is rejected",table=>{
      const f=setup(); f.q.claim={claimKey:hash("claim"),grantId:f.grant.grantId,authorizationRevision:1};
      committed(f.repository.recordHeldOutputForTest(f.q)); const before=snapshot(f);
      expect(()=>f.raw.db.exec(`UPDATE ${table} SET ${table==="runtime_output_grant_claims"?"claimKey=claimKey":table==="runtime_output_events"?"atMs=atMs":"createdAtMs=createdAtMs"}`)).toThrow(/retained|immutable/);
      expect(()=>f.raw.db.exec(`DELETE FROM ${table}`)).toThrow(); expect(snapshot(f)).toEqual(before);
    });
  const stages: OutputFaultStage[]=["afterSequence","afterOperation","afterClaim","afterMetadata","afterOutbox","auditWrite","afterAudit","constraint","beforeCommit"];
  it.each(stages)("F01 %s fault rolls back every row/counter and healthy retry succeeds",stage=>{
    const fault: TestFault={eventType:"OUTPUT_HELD_RECORDED",stage}, f=setup(fault);
    f.q.claim={claimKey:hash("claim"),grantId:f.grant.grantId,authorizationRevision:1};
    const before=original(f), r=f.repository.recordHeldOutputForTest(f.q); denied(r);
    expect(snapshot(f).every(t=>t.length===0)).toBe(true); expect(original(f)).toEqual(before);
    fault.stage="none"; const stored=committed(f.repository.recordHeldOutputForTest(f.q));
    expect(stored.sequence).toBe(1); expect(snapshot(f).map(t=>t.length)).toEqual([1,1,1,1,1,1]);
    evidence("pi11a-rollback",{stage,denial:r,receipt:stored,counts:snapshot(f).map(t=>t.length)});
  });
  it("F02 actual BEGIN BUSY leaves no metadata and explicit retry works",()=>{
    const f=setup(); f.raw.db.exec("BEGIN IMMEDIATE");
    try { denied(f.repository.recordHeldOutputForTest(f.q),"DATABASE_BUSY"); } finally { f.raw.db.exec("ROLLBACK"); }
    expect(snapshot(f).every(t=>t.length===0)).toBe(true); committed(f.repository.recordHeldOutputForTest(f.q));
  });
  it("F03 actual COMMIT BUSY from a held read lock is not success or sequence advance",()=>{
    const f=setup(); f.raw.db.exec("BEGIN"); f.raw.db.prepare("SELECT * FROM runtime_attempts").all();
    let r: HeldOutputResult;
    try { r=f.repository.recordHeldOutputForTest(f.q); denied(r,"DATABASE_BUSY"); } finally { f.raw.db.exec("ROLLBACK"); }
    expect(snapshot(f).every(t=>t.length===0)).toBe(true); const rollbackCounts=snapshot(f).map(t=>t.length);
    committed(f.repository.recordHeldOutputForTest(f.q));
    evidence("pi11a-commit-busy",{denial:r,rollbackCounts,note:"actual reader/writer in DELETE journal, no process"});
  });
  it("F04 actual query-only owned fixture connection cannot write or clear READONLY",()=>{
    const f=setup(), ro=own(DurableAttemptRepository.openHostOwnedForFixtures(openOwnedFixtureConnection(f.ref,true)));
    denied(ro.recordHeldOutputForTest(f.q),"DATABASE_FAILURE"); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
    committed(f.repository.recordHeldOutputForTest(f.q));
  });
  it("F05 successful COMMIT with lost acknowledgment reconciles original operation after reopen",()=>{
    const f=setup({eventType:"OUTPUT_HELD_RECORDED",stage:"afterCommit"});
    const lost=f.repository.recordHeldOutputForTest(f.q); flags(lost); expect(lost.outcome).toBe("COMMIT_OUTCOME_UNKNOWN");
    expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]);
    const reopened=own(DurableAttemptRepository.openForTest(f.ref)), before=snapshot(f);
    const lookup=reopened.lookupOutputOperation({expected:f.q.expected,operationId:f.q.operationId});
    expect(lookup.outcome).toBe("FIXTURE_HELD_METADATA_REPLAY"); expect(reopened.recordHeldOutputForTest(f.q)).toEqual(lookup);
    expect(snapshot(f)).toEqual(before); evidence("pi11a-lost-ack",{lost,lookup,counts:snapshot(f).map(t=>t.length)});
  });
  it("F06 injected rollback cleanup refusal returns unknown and quarantine, not false success",()=>{
    const f=setup({eventType:"OUTPUT_HELD_RECORDED",stage:"rollbackFailure"}), r=f.repository.recordHeldOutputForTest(f.q);
    flags(r); expect(r.outcome).toBe("COMMIT_OUTCOME_UNKNOWN");
    const reopened=own(DurableAttemptRepository.openForTest(f.ref)); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
    committed(reopened.recordHeldOutputForTest(f.q));
  });
  it("F07 deferred pair links prevent COMMIT of metadata/op/outbox-only partial records",()=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q)); const row=f.raw.db.prepare("SELECT * FROM runtime_output_operations").get()!;
    f.raw.db.exec("BEGIN IMMEDIATE");
    try { insertOutputRow(f.raw.db,"runtime_output_operations",{...row,operationId:randomUUID(),outputId:randomUUID(),idempotencyKey:randomUUID()});
      expect(()=>f.raw.db.exec("COMMIT")).toThrow(/FOREIGN KEY/);
    } finally { if(f.raw.db.isTransaction) f.raw.db.exec("ROLLBACK"); }
    expect(snapshot(f).map(t=>t.length)).toEqual([1,1,0,1,1,1]);
  });
});

describe("PI11A reopen, corruption and authority boundary",()=>{
  const corruptions: [string,string,string,string?][]=[
    ["binding digest","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET bindingDigest='"+hash("wrong")+"'"],
    ["binding shape","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET bindingSnapshot='{}'"],
    ["metadata digest","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET payloadDigest='"+hash("wrong")+"'"],
    ["record version","runtime_accepted_outputs","UPDATE runtime_accepted_outputs SET recordVersion=2"],
    ["held state","runtime_output_outbox","UPDATE runtime_output_outbox SET state='DELIVERED'"],
    ["audit head","runtime_output_outbox","UPDATE runtime_output_outbox SET lastEventId='"+randomUUID()+"'"],
    ["audit digest","runtime_output_events","UPDATE runtime_output_events SET eventDigest='"+hash("wrong")+"'"],
    ["missing audit","runtime_output_events","DELETE FROM runtime_output_events","no_delete"],
    ["orphan outbox","runtime_accepted_outputs","DELETE FROM runtime_accepted_outputs","no_delete"],
    ["missing outbox","runtime_output_outbox","DELETE FROM runtime_output_outbox","no_delete"],
    ["missing operation","runtime_output_operations","DELETE FROM runtime_output_operations","no_delete"],
  ];
  it.each(corruptions)("R01 %s fails closed on warm lookup and reopen without repair",(_label,table,sql,kind)=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q)); tamper(f,table,sql,kind);
    denied(f.repository.lookupOutputOperation({expected:f.q.expected,operationId:f.q.operationId}));
    const before=snapshot(f); f.repository.close(); expect(()=>DurableAttemptRepository.openForTest(f.ref)).toThrow();
    expect(snapshot(f)).toEqual(before);
  });
  it("R02 counter advance without matching output is corruption, never silently repaired",()=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q));
    f.raw.db.exec("UPDATE runtime_output_streams SET lastAccepted=lastAccepted+1,revision=revision+1");
    denied(f.repository.recordHeldOutputForTest(f.q)); f.repository.close(); expect(()=>DurableAttemptRepository.openForTest(f.ref)).toThrow();
  });
  it("R03 legitimate later policy revision does not rewrite or corrupt historical metadata",()=>{
    const f=setup(), first=committed(f.repository.recordHeldOutputForTest(f.q)), before=snapshot(f);
    f.raw.db.exec("UPDATE runtime_policy_provenance SET revision=revision+1,policyVersion=policyVersion+1");
    expect(f.repository.lookupOutputOperation({expected:f.q.expected,operationId:f.q.operationId})).toMatchObject({...first,outcome:"FIXTURE_HELD_METADATA_REPLAY"});
    denied(f.repository.recordHeldOutputForTest(next(f.q,first))); expect(snapshot(f)).toEqual(before);
    f.repository.close(); const reopened=own(DurableAttemptRepository.openForTest(f.ref));
    expect(reopened.recordHeldOutputForTest(f.q).outcome).toBe("FIXTURE_HELD_METADATA_REPLAY");
  });
  it.each(["BLOCKED","ACTIVE_STOP","MISSING","CANCELLED","TERMINAL"])("H01 %s cannot create new fixture metadata and stop remains untouched",state=>{
    const f=setup();
    if(state==="BLOCKED") f.raw.db.exec("UPDATE runtime_execution_security SET securityState='BLOCKED',securityRevision=securityRevision+1");
    if(state==="ACTIVE_STOP") f.repository.activateSecurityStop({expected:f.q.expected,expectedSecurityRevision:1,operationId:randomUUID(),eventId:randomUUID(),
      action:"ACTIVATE_STOP",reason:"TEST_SECURITY_CONCERN",atMs:1500});
    if(state==="MISSING") f.raw.db.exec("DELETE FROM runtime_execution_security");
    if(state==="CANCELLED") {
      const terminal=f.repository.commitTerminal(terminalCommand(f.attempt,f.issue.ownerNonce,"INTERRUPTED")).attempt;
      f.q.expected=expected(terminal,f.issue.ownerNonce);
    }
    if(state==="TERMINAL") {
      let a=f.attempt; for(const phase of ["LAUNCHING","RUNNING"] as const) a=f.repository.transition(transitionCommand(a,f.issue.ownerNonce,phase));
      const terminal=f.repository.commitTerminal(terminalCommand(a,f.issue.ownerNonce,"COMPLETED")).attempt;
      f.q.expected=expected(terminal,f.issue.ownerNonce);
    }
    const before=original(f); denied(f.repository.recordHeldOutputForTest(f.q)); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
    expect(original(f)).toEqual(before);
  });
  it("H02 serialized/flagged fixture labels cannot mint repository ownership",()=>{
    const f=setup(); expect(()=>DurableAttemptRepository.openHostOwnedForFixtures({sourceClass:"LOCAL_TEST_FIXTURE",isFixture:true})).toThrow();
    denied(DurableAttemptRepository.prototype.recordHeldOutputForTest.call({isFixture:true} as unknown as DurableAttemptRepository,f.q),"OUTPUT_FIXTURE_REQUIRED");
    denied(f.repository.recordHeldOutputForTest({...f.q,isFixture:true})); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
  });
  it("H05 historical replay after stop cannot create another output or clear stop",()=>{
    const f=setup(), receipt=committed(f.repository.recordHeldOutputForTest(f.q));
    f.repository.activateSecurityStop({expected:f.q.expected,expectedSecurityRevision:1,operationId:randomUUID(),eventId:randomUUID(),
      action:"ACTIVATE_STOP",reason:"TEST_SECURITY_CONCERN",atMs:2500});
    const before=original(f), rows=snapshot(f);
    expect(f.repository.recordHeldOutputForTest(f.q)).toMatchObject({...receipt,outcome:"FIXTURE_HELD_METADATA_REPLAY"});
    denied(f.repository.recordHeldOutputForTest(next(f.q,receipt)));
    expect(original(f)).toEqual(before); expect(snapshot(f)).toEqual(rows);
  });
  it("H06 operation identity alone cannot replay across owner or incarnation",()=>{
    const f=setup(); committed(f.repository.recordHeldOutputForTest(f.q)); const rows=snapshot(f);
    for(const expected of [{...f.q.expected,ownerNonce:hash("other")},{...f.q.expected,authorityIncarnation:randomUUID()}]) {
      denied(f.repository.recordHeldOutputForTest({...f.q,expected}));
      denied(f.repository.lookupOutputOperation({expected,operationId:f.q.operationId}));
    }
    expect(snapshot(f)).toEqual(rows);
  });
  it("H07 actual persisted noLaunch cancellation at APPROVAL_GRANTED denies metadata",()=>{
    const f=setup(undefined,true), clock=clockAt(f.attempt,f.attempt.updatedAtMs+1-f.issue.createdAtMs), expectedBefore=f.q.expected;
    const authority=f.repository.authorizeHostForTest(expectedBefore,clock);
    const a=f.repository.requestCancellation({expected:expectedBefore,clock,requestId:randomUUID(),decisionId:randomUUID(),
      eventId:randomUUID(),reason:"OWNER_CANCELLED",authorization:"s12-test-only"},authority).attempt;
    expect(a.phase).toBe("APPROVAL_GRANTED"); expect(JSON.parse(a.cancellationPayload!).noLaunch).toBe(true);
    const before=original(f); denied(f.repository.recordHeldOutputForTest({...f.q,expected:expected(a,f.issue.ownerNonce)}));
    expect(original(f)).toEqual(before); expect(snapshot(f).every(t=>t.length===0)).toBe(true);
  });
  it("H03 actual HOST_SQLITE repository denies fixture API before SQL; legacy-version reopen is read-only denial",async()=>{
    const base=path.join(root.root,"host-output-"+randomUUID()), storageRoot=path.join(base,"storage"), registryRoot=path.join(base,"registry"), project=path.join(base,"project");
    for(const p of [base,storageRoot,registryRoot,project]) fs.mkdirSync(p);
    const canonical=await validateRoot(project), projectId=randomUUID(), incarnation=randomUUID(), storageId=randomUUID();
    const entry={identity:{schemaVersion:1 as const,projectId,createdAt:"2026-11-10T00:00:00.000Z"},canonicalPath:canonical.canonicalPath,fileKey:canonical.fileKey,status:"IDENTITY_ATTACHED" as const};
    const provider=HostSQLiteProvider.create({providerKind:"HOST_SQLITE",providerId:randomUUID(),storageRoot,bindings:[{
      projectId,authorityIncarnation:incarnation,storageId,workspaceRoot:project,initializationPolicy:"CREATE_NEW"}]},registryRoot,()=>entry as RegistryEntry);
    const repository=own(DurableAttemptRepository.openHostOwnedSQLite(provider.open(projectId)));
    const f=setup(); denied(repository.recordHeldOutputForTest(f.q),"OUTPUT_FIXTURE_REQUIRED"); denied(repository.lookupOutputOperation({expected:f.q.expected,operationId:f.q.operationId}),"OUTPUT_FIXTURE_REQUIRED");
    repository.close();
    const filename=path.join(storageRoot,storageId,"authority.db");
    const db=new (await import("node:sqlite")).DatabaseSync(filename); try { db.exec("PRAGMA user_version=9"); } finally { db.close(); }
    const digest=()=>createHash("sha256").update(fs.readFileSync(filename)).digest("hex"), before=digest();
    expect(()=>provider.open(projectId)).toThrow(); expect(digest()).toBe(before);
  });
  it("H04 production guard chain and request effect barrier remain deny-only",()=>{
    const f=setup(), write=vi.spyOn(fs,"writeFileSync"), fork=vi.spyOn(children,"fork"), listen=vi.spyOn(net.Server.prototype,"listen"), fetch=vi.spyOn(globalThis,"fetch");
    try {
      expect(createHostPrincipalBoundary().api.authenticate({authenticated:true}).executionAuthority).toBe(false);
      const d=createOutputPublicationBoundary().api.evaluate(f.q,{authenticated:true}); expect(d.publicationAuthority).toBe(false);
      expect(createExecutionAdmissionBoundary().api).toHaveProperty("admit");
      for(const spy of [write,fork,listen,fetch]) expect(spy).not.toHaveBeenCalled();
    } finally { vi.restoreAllMocks(); }
  });
  it("R04 reconstructed actual schema9 fixture is rejected without migration or byte change",()=>{
    const ref=createTestDatabase(root), raw=own(openTestConnection(ref));
    const old=SCHEMA_STATEMENTS.filter(s=>!s.includes("runtime_output_")&&!s.includes("runtime_accepted_outputs"))
      .map(s=>s.replaceAll(PROFILE,"pi05-isolated-security-stop-v1"));
    const oldSql=old.join(";\n")+";";
    raw.db.exec("PRAGMA foreign_keys=OFF");
    for(const row of raw.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()){
      const name=String(row.name); if(!/^[a-z_]+$/.test(name)) throw new Error("Fixed fixture table only"); raw.db.exec("DROP TABLE "+name);
    }
    raw.db.exec("BEGIN IMMEDIATE");
    try {
      raw.db.exec(oldSql); raw.db.exec(`PRAGMA application_id=${APPLICATION_ID}; PRAGMA user_version=9`);
      raw.db.prepare("INSERT INTO runtime_control_meta(projectId,authorityIncarnation,schemaRevision,profile,schemaDigest) VALUES(?,?,1,?,?)")
        .run(ref.projectId,ref.authorityIncarnation,"pi05-isolated-security-stop-v1",hash(oldSql));
      raw.db.prepare("INSERT INTO runtime_execution_security(projectId,authorityIncarnation) VALUES(?,?)").run(ref.projectId,ref.authorityIncarnation);
      raw.db.exec("COMMIT");
    } catch(e){if(raw.db.isTransaction)raw.db.exec("ROLLBACK");throw e;}
    const filename=testDatabaseFilename(ref), digest=()=>hash(fs.readFileSync(filename).toString("hex")), before=digest();
    expect(()=>DurableAttemptRepository.openForTest(ref)).toThrow(); expect(digest()).toBe(before);
  });
});
