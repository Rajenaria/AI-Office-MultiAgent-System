import type { ShellController, ShellState } from "../workspace/controller.js";
import { mapVisualAgents } from "../visual/mapper.js";

export function BrainPanel({ state, controller }: { state: ShellState; controller: ShellController }) {
  const records = state.snapshot?.snapshot.knowledge ?? [];
  return <section aria-labelledby="brain-heading">
    <h2 id="brain-heading">Shared Brain</h2>
    <p className="muted">Registered metadata. Content is verified only when explicitly read.</p>
    {!records.length && <p>No registered knowledge loaded.</p>}
    <ul className="record-list">{records.map((record) => <li key={`${record.knowledgeId}/${record.version}`}>
      <strong>{record.knowledgeId}</strong><span>Version {record.version} · Source {record.source} · Metadata {record.status}</span>
      <code>{record.relativePath}</code>
      <button disabled={state.busy || !state.sessionReady || state.connection !== "CONNECTED"} onClick={() => { void controller.readKnowledge(record); }}>Read {record.knowledgeId} v{record.version}</button>
    </li>)}</ul>
    {state.knowledge && <div className="knowledge-result" data-testid="knowledge-result">
      <p><strong>{state.knowledge.integrity} / {state.knowledge.effectiveStatus}</strong></p>
      <p>Recorded source: {state.knowledge.metadata.source} · Version {state.knowledge.metadata.version}</p>
      <p className="muted">Stored metadata status: {state.knowledge.metadata.status}</p>
      {state.knowledge.integrity === "CHANGED" ? <p role="status" className="warning">Content changed. UNVERIFIED; content withheld. The stored hash was preserved.</p> :
        <><p className="muted">Hash verified when read. Untrusted plain text.</p><pre>{state.knowledge.content}</pre></>}
      <details><summary>Content hashes</summary><p className="hash">Recorded: {state.knowledge.metadata.contentHash}</p><p className="hash">Read: {state.knowledge.actualHash}</p></details>
    </div>}
  </section>;
}

export function ActivityPanel({ state }: { state: ShellState }) {
  const snapshot = state.snapshot?.snapshot;
  const agents = snapshot ? mapVisualAgents(snapshot, state.freshness) : [];
  return <section aria-labelledby="activity-heading">
    <h2 id="activity-heading">Agent activity <span className="badge">DEMO</span></h2>
    <p className="muted">Historical fixture events. No coding worker is active.</p>
    {!agents.length && <p>No persisted DEMO tasks loaded. Fixture setup is explicit and separate from opening a project.</p>}
    {agents.map((agent) => <article className="agent-card" key={agent.taskId} data-testid="agent-card">
      <h3>{agent.title}</h3><dl>
        <dt>Agent</dt><dd>{agent.agentId}</dd><dt>Task</dt><dd>{agent.taskId}</dd>
        <dt>Task state</dt><dd>{agent.taskState}</dd><dt>Last event</dt><dd>{agent.activityType}</dd>
        <dt>Event time</dt><dd>{agent.occurredAt ?? "UNKNOWN"}</dd><dt>Source</dt><dd>DEMO</dd>
        <dt>Transport freshness</dt><dd>{agent.freshness.toUpperCase()}</dd>
      </dl>
    </article>)}
    {snapshot && <p className="muted" data-testid="record-counts">{snapshot.tasks.length} task(s) · {snapshot.events.length} event(s) · Snapshot v{snapshot.snapshotVersion}</p>}
  </section>;
}
