import type { DatabaseSync } from "node:sqlite";
import type { z } from "zod";
import { AcceptedSchema, BindingSchema, ClaimSchema, EventSchema, OperationSchema, OutboxSchema, StreamSchema,
  OUTPUT_TABLES, OUTPUT_LIMITS, bindingDigest, metadataDigest, outputEventDigest, outputRequestDigest, projectionDigest,
  outputRequire, OutputFailure, type OutputTable, type OutputEvent } from "./output-metadata.js";
export function outputRow<T>(schema: z.ZodType<T>, input: unknown): T {
  try { return schema.parse(input); } catch { throw new OutputFailure("OUTPUT_INTEGRITY"); }
}
export function readOutputBinding(text: string) {
  outputRequire(Buffer.byteLength(text,"utf8")<=16384,"OUTPUT_INTEGRITY");
  let value: unknown; try { value=JSON.parse(text); } catch { throw new OutputFailure("OUTPUT_INTEGRITY"); }
  return outputRow(BindingSchema,value);
}
export function insertOutputRow(db: DatabaseSync, table: OutputTable, row: object): void {
  outputRequire(OUTPUT_TABLES.includes(table),"OUTPUT_INTEGRITY");
  const keys=Object.keys(row);
  outputRequire(keys.length>0 && keys.every(k=>/^[A-Za-z][A-Za-z0-9]*$/.test(k)),"OUTPUT_INTEGRITY");
  db.prepare(`INSERT INTO ${table}(${keys.join(",")}) VALUES(${keys.map(()=>"?").join(",")})`)
    .run(...Object.values(row) as (string|number|null)[]);
}
export function appendOutputEvent(db: DatabaseSync, event: OutputEvent): void {
  outputRequire(event.eventDigest===outputEventDigest(event),"OUTPUT_INTEGRITY");
  insertOutputRow(db,"runtime_output_events",event);
}
// Current PI11A ledger has one immutable held event per output, no delivery/control state machine.
export function verifyOutputHistory(db: DatabaseSync, ref: {projectId:string;authorityIncarnation:string}): void {
  const streams=db.prepare("SELECT * FROM runtime_output_streams LIMIT 129").all();
  outputRequire(streams.length<=OUTPUT_LIMITS.streams,"OUTPUT_INTEGRITY");
  let total=0, claims=0;
  for(const raw of streams){
    const s=outputRow(StreamSchema,raw);
    outputRequire(s.projectId===ref.projectId && s.authorityIncarnation===ref.authorityIncarnation &&
      s.lastAccepted===s.revision && s.lastAccepted<=OUTPUT_LIMITS.outputsPerStream,"OUTPUT_INTEGRITY");
    const session=db.prepare("SELECT * FROM runtime_execution_sessions WHERE executionSessionId=?").get(s.executionSessionId);
    const epoch=db.prepare("SELECT * FROM runtime_owner_epochs WHERE projectId=? AND attemptId=? AND attemptGeneration=?")
      .get(s.projectId,s.attemptId,s.attemptGeneration);
    const attempt=db.prepare("SELECT * FROM runtime_attempts WHERE projectId=? AND attemptId=?").get(s.projectId,s.attemptId);
    outputRequire(session && epoch && attempt && session.projectId===s.projectId && session.authorityIncarnation===s.authorityIncarnation &&
      session.attemptId===s.attemptId && session.attemptGeneration===s.attemptGeneration &&
      session.sourceKind==="LOCAL_TEST_FIXTURE","OUTPUT_INTEGRITY");
    const accepted=db.prepare("SELECT * FROM runtime_accepted_outputs WHERE streamId=? ORDER BY sequence LIMIT 4097").all(s.streamId);
    outputRequire(accepted.length===s.lastAccepted,"OUTPUT_INTEGRITY");
    for(let i=0;i<accepted.length;i++){
      const a=outputRow(AcceptedSchema,accepted[i]), b=readOutputBinding(a.bindingSnapshot);
      outputRequire(a.sequence===i+1 && a.streamId===s.streamId && a.createdAtMs>=s.createdAtMs &&
        a.bindingDigest===bindingDigest(b) && b.expiresAtMs>b.issuedAtMs && b.issuedAtMs===a.createdAtMs &&
        b.projectId===s.projectId && b.authorityIncarnation===s.authorityIncarnation &&
        b.attemptId===s.attemptId && b.attemptGeneration===s.attemptGeneration && b.executionSessionId===s.executionSessionId &&
        b.destinationId===s.destinationId && b.channel===s.channel && b.producerId===a.producerId && a.producerId===epoch.ownerId &&
        b.principalId===session.principalId && b.applicationSessionId===session.applicationSessionId &&
        b.workspaceBindingId===attempt.bindingId && b.workspaceGeneration===attempt.bindingGeneration &&
        b.policyId===session.policyId && b.grantId===session.grantId &&
        b.attemptStateVersion===a.attemptStateVersion && b.principalRevision===a.principalRevision &&
        b.applicationGeneration===a.applicationGeneration && b.applicationRevision===a.applicationRevision &&
        b.bindingRevision===a.sessionBindingRevision && b.policyId===a.policyId && b.policyVersion===a.policyVersion &&
        b.policyRevision===a.policyRevision && b.grantId===a.grantId && b.authorizationRevision===a.authorizationRevision &&
        b.provenanceSourceRevision===a.provenanceSourceRevision &&
        a.classificationSource===(a.confidentiality==="UNVERIFIED"?"UNVERIFIED":"OFFLINE_SUPPLIED"),"OUTPUT_INTEGRITY");
      const op=outputRow(OperationSchema,db.prepare("SELECT * FROM runtime_output_operations WHERE operationId=?").get(a.operationId));
      const o=outputRow(OutboxSchema,db.prepare("SELECT * FROM runtime_output_outbox WHERE outboxId=?").get(a.outboxId));
      const e=outputRow(EventSchema,db.prepare("SELECT * FROM runtime_output_events WHERE eventId=?").get(o.lastEventId));
      outputRequire(op.streamId===s.streamId && op.outputId===a.outputId && op.createdAtMs===a.createdAtMs &&
        op.requestDigest===outputRequestDigest(s,a,b,op.claimKey) && a.payloadDigest===metadataDigest(op.requestDigest) &&
        o.outputId===a.outputId && o.createdAtMs===a.createdAtMs && o.updatedAtMs===o.createdAtMs &&
        e.outboxId===o.outboxId && e.rowRevision===o.rowRevision && e.atMs===a.createdAtMs &&
        e.snapshotDigest===projectionDigest(o,a,op.requestDigest) && e.eventDigest===outputEventDigest(e),"OUTPUT_INTEGRITY");
      if(op.claimKey!==null){
        const c=outputRow(ClaimSchema,db.prepare("SELECT * FROM runtime_output_grant_claims WHERE claimKey=?").get(op.claimKey));
        outputRequire(c.operationId===op.operationId && c.grantId===a.grantId &&
          c.authorizationRevision===a.authorizationRevision && c.claimedAtMs===a.createdAtMs,"OUTPUT_INTEGRITY");
        claims++;
      }
      total++;
    }
  }
  for(const t of ["runtime_output_operations","runtime_accepted_outputs","runtime_output_outbox","runtime_output_events"] as const){
    outputRequire(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n===total,"OUTPUT_INTEGRITY");
  }
  outputRequire(db.prepare("SELECT count(*) AS n FROM runtime_output_grant_claims").get()?.n===claims,"OUTPUT_INTEGRITY");
}
