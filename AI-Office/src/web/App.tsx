import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { ApiClient } from "./api.js";
import { ShellController } from "./workspace/controller.js";
import { ActivityPanel, BrainPanel } from "./components/ProjectPanels.js";
import { SkillMetadataPanel } from "./components/SkillMetadataPanel.js";

export default function App() {
  const [controller] = useState(() => new ShellController(new ApiClient()));
  const state = useSyncExternalStore(controller.subscribe, controller.getState);
  const [passphrase, setPassphrase] = useState("");
  const [folder, setFolder] = useState("");
  useEffect(() => { void controller.checkHealth(); return () => controller.stop(); }, [controller]);
  const workspace = state.workspace;
  const scope = workspace?.identity?.projectId ?? "NONE";
  const label = state.requestedPath?.split(/[\\/]/).filter(Boolean).at(-1);
  const canCommand = state.sessionReady && !state.busy && state.connection === "CONNECTED";
  function connect(event: FormEvent) {
    event.preventDefault(); const secret = passphrase; setPassphrase(""); void controller.connect(secret);
  }
  function open(event: FormEvent) { event.preventDefault(); void controller.open(folder); }
  return <div className="shell">
    <header><div><p className="eyebrow">Local development · M01-05</p><h1>AI Office <span>Development Shell</span></h1></div>
      <span className="badge">FIXTURE / DEMO ONLY</span></header>
    <p className="notice">Disposable projects only. This diagnostic shell verifies backend state. Valuable project data requires a verified backup path.</p>
    <section aria-labelledby="connection-heading" className="connection-panel">
      <h2 id="connection-heading">Connection</h2>
      <div className="status-row"><strong data-testid="connection-status">{state.connection}</strong>
        <span data-testid="freshness">{state.freshness.toUpperCase()}</span>
        <span>Session: {state.sessionReady ? "authenticated" : "required"}</span></div>
      <dl><dt>Last successful snapshot</dt><dd data-testid="last-success">{state.lastSuccessAt ?? "UNKNOWN"}</dd>
        <dt>Project scope</dt><dd className="mono">{scope}</dd></dl>
      {(state.connection !== "CONNECTED" || state.freshness === "stale" || state.freshness === "disconnected") && state.snapshot && <p className="warning">Last-known project data; backend state is not currently confirmed.</p>}
      {!state.sessionReady && <form onSubmit={connect} className="inline-form">
        <label htmlFor="launch-passphrase">Launch passphrase<input id="launch-passphrase" type="password" autoComplete="off" spellCheck={false}
          value={passphrase} onChange={(event) => setPassphrase(event.target.value)} minLength={20} required disabled={state.busy} /></label>
        <button disabled={state.busy} type="submit">Connect session</button>
        <p className="muted">Enter the same private passphrase used in the launcher. Kept in memory; bootstrap expires after 10 minutes.</p>
      </form>}
      <div className="actions"><button onClick={() => { void controller.checkHealth(); }} disabled={state.busy}>Check backend</button>
        {state.sessionReady && <button onClick={() => { void controller.refreshWorkspace(); }} disabled={state.busy}>Refresh workspace state</button>}</div>
      {state.error && <p role="alert" className="error">{state.error.code ?? state.error.kind}: {state.error.reason}. No mutation is automatically replayed.</p>}
    </section>
    <main>
      <section aria-labelledby="workspace-heading">
        <h2 id="workspace-heading">Workspace</h2>
        <form onSubmit={open}><label htmlFor="project-folder">Disposable project folder<input id="project-folder" value={folder}
          onChange={(event) => setFolder(event.target.value)} placeholder="Absolute Windows path within the configured fixture root" required disabled={!canCommand} /></label>
          <button type="submit" disabled={!canCommand}>Open project</button></form>
        <p aria-live="polite">{state.busy ? "Request in progress" : "Awaiting command"}</p>
        <dl><dt>Lifecycle</dt><dd data-testid="lifecycle">{workspace?.view.state ?? "UNKNOWN"}</dd>
          <dt>Folder label</dt><dd>{workspace?.identity ? label ?? "Unavailable; reopen a folder to show its path" : "—"}</dd>
          <dt>Project ID</dt><dd className="mono" data-testid="project-id">{workspace?.identity?.projectId ?? "NONE"}</dd>
          <dt>Accepted folder request</dt><dd className="mono" data-testid="project-path">{workspace?.identity ? state.requestedPath ?? "Path is not included in the server response" : "—"}</dd>
          <dt>Binding generation</dt><dd>{workspace?.view.generation ?? "UNKNOWN"}</dd></dl>
        {workspace?.nextAction && <div className="confirmation">
          <h3>Metadata confirmation required</h3><p>{workspace.nextAction.kind}</p><code>{workspace.nextAction.canonicalPath}</code>
          <p>Initialize/register only this fixture folder. New identity metadata is written to .ai-office/project.json; existing identity is preserved.</p>
          <button disabled={!canCommand} onClick={() => { void controller.initializeMetadata(); }}>Confirm metadata initialization</button>
        </div>}
        {workspace?.stateInitializationRequired && <div className="confirmation">
          <h3>State confirmation required</h3><p>Create schema v1 in private fixture storage for this project. No DEMO data is seeded automatically.</p>
          <button disabled={!canCommand} onClick={() => { void controller.initializeState(); }}>Confirm state initialization</button>
        </div>}
        {workspace && <button onClick={() => { void controller.detach(); }} disabled={!canCommand}>Close workspace</button>}
      </section>
      <ActivityPanel state={state} />
      <BrainPanel state={state} controller={controller} />
      <SkillMetadataPanel state={state} />
      <section aria-labelledby="policy-heading"><h2 id="policy-heading">Foundation policy</h2>
        <p>Workers OFF · Provider connections OFF · Paid API OFF · Skill execution OFF</p>
        <p>Provider quota: UNKNOWN</p><p className="muted">Visual assets follow the Owner's Visual Lab handoff. This shell has no 3D scene.</p>
      </section>
    </main>
    <footer>Snapshots poll approximately every 2 seconds while READY. Fresh transport does not imply live coding.</footer>
  </div>;
}
