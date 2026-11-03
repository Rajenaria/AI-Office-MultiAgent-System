import { projectSkillMetadata, type SkillViewContext } from "../skills/projection.js";

type Props = { state: SkillViewContext; fixtureMetadata?: readonly unknown[] };

export function SkillMetadataPanel({ state, fixtureMetadata = [] }: Props) {
  let projection: ReturnType<typeof projectSkillMetadata>;
  try { projection = projectSkillMetadata(fixtureMetadata, state); }
  catch {
    return <section aria-labelledby="skills-heading" data-testid="skill-panel">
      <h2 id="skills-heading">Agent Skills — Metadata &amp; Policy</h2>
      <p role="status">Skill metadata rejected. No inventory has been verified.</p>
      <p>Foundation skill execution: OFF</p>
    </section>;
  }
  const groups = [{ label: "Global metadata", records: projection.global }, { label: "Project metadata", records: projection.project }];
  return <section aria-labelledby="skills-heading" data-testid="skill-panel">
    <h2 id="skills-heading">Agent Skills — Metadata &amp; Policy</h2>
    <p>No verified skill inventory is available. Runtime discovery and session verification have not yet been performed.</p>
    <p className="muted">Inventory absence does not establish whether skills are installed on this computer.</p>
    <p>Foundation skill execution: OFF</p>
    <p className="muted">Assigned ≠ Available ≠ Allowed ≠ Enforced. Global scope grants no session or filesystem permission.</p>
    <p className="muted" data-testid="skill-project-scope">Project metadata scope: {projection.activeProjectId ?? "NOT VERIFIED — requires a current READY binding and fresh snapshot"}</p>
    {fixtureMetadata.length > 0 && <p className="badge">DEMO / TEST METADATA — not runtime observations</p>}
    {groups.map((group) => <div key={group.label}>
      <h3>{group.label}</h3>
      {!group.records.length && <p className="muted">No metadata supplied for this view.</p>}
      <ul className="record-list">{group.records.map(({ key, metadata }) => <li key={key} data-testid="skill-record">
        <strong>{metadata.skillId}</strong><span className="badge">DEMO / TEST</span>
        <dl>
          <dt>Runtime</dt><dd>{metadata.runtime.runtimeId}</dd>
          <dt>Runtime version</dt><dd>{metadata.runtime.version ?? "UNKNOWN"}</dd>
          <dt>Scope</dt><dd>{metadata.scope}</dd>
          {metadata.scope === "project" && <><dt>Project ID</dt><dd className="mono">{metadata.projectId}</dd></>}
          <dt>Proposed assignment</dt><dd>{metadata.proposedAgentRole ? `${metadata.proposedAgentRole} (PROPOSED)` : "NOT CONFIGURED"}</dd>
          <dt>Installed</dt><dd>{metadata.installationStatus}</dd>
          <dt>Discovered</dt><dd>{metadata.discoveryStatus}</dd>
          <dt>Compatible</dt><dd>{metadata.compatibilityStatus}</dd>
          <dt>Session availability</dt><dd>{metadata.sessionAvailability}</dd>
          <dt>Session verification</dt><dd>{metadata.sessionVerification}</dd>
          <dt>Metadata policy</dt><dd>{metadata.allowedByPolicy}</dd>
          <dt>Enforcement</dt><dd>{metadata.enforcementVerification}</dd>
        </dl>
      </li>)}</ul>
    </div>)}
  </section>;
}
