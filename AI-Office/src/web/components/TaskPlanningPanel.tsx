import { useState, type FormEvent } from "react";
import { AI_OFFICE_V1_RUNTIME_TARGET } from "../../contracts/runtime-platform.js";
import type { ShellState } from "../workspace/controller.js";
import { PlanTransferPanel } from "./PlanTransferPanel.js";
import { PLANNING_ROLES, PlanningScopeSchema, attachedPlanningScope, markTaskPlanned, newPlanningBoard,
  planRolePreview, planningScopeKey, savePlanForm, type PlanFormValues, type PlanningBoard,
  type PlanningScope, type TaskPlan } from "../planning/model.js";

function PlanEditor({ task, onSave }: { task: TaskPlan | null; onSave: (values: PlanFormValues) => void }) {
  const [title, setTitle] = useState(task?.title ?? ""), [description, setDescription] = useState(task?.description ?? "");
  const [role, setRole] = useState(task?.proposedAgentRole ?? "");
  function submit(event: FormEvent) { event.preventDefault(); onSave({ title, description, proposedAgentRole: role || null }); }
  return <form onSubmit={submit} aria-label={task ? "Edit task plan" : "Create task plan"}>
    <label htmlFor="plan-title">Task title<input id="plan-title" required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} /></label>
    <label htmlFor="plan-description">Plan notes<textarea id="plan-description" maxLength={2000} rows={4} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <label htmlFor="plan-role">Proposed agent role<select id="plan-role" value={role} onChange={event => setRole(event.target.value)}>
      <option value="">Unassigned</option>{PLANNING_ROLES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select></label>
    <button type="submit">{task ? "Save draft changes" : "Create draft plan"}</button>
    <p className="muted">Editing a planned task returns it to Draft for review. A proposed role does not assign a running agent.</p>
  </form>;
}

export function TaskPlanBoard({ board, selectedId, onSelect, onNew, onSave, onMark }: {
  board: PlanningBoard; selectedId: string | null; onSelect: (id: string) => void; onNew: () => void;
  onSave: (values: PlanFormValues) => void; onMark: (task: TaskPlan) => void;
}) {
  const task = board.tasks.find(item => item.taskId === selectedId) ?? null, preview = task ? planRolePreview(task) : null;
  return <>
    <div className="status-row"><h3>{board.scope.label}</h3><span className="badge">{board.scope.kind === "TEMPORARY" ? "TEMPORARY WORKSPACE" : "CURRENT PROJECT — CLIENT PLANS"}</span></div>
    <p className="mono">Planning project: {board.scope.projectId}</p>
    <div className="planning-grid">
      <div><div className="actions"><strong>Task plans ({board.tasks.length}/100)</strong><button type="button" onClick={onNew}>New task plan</button></div>
        {!board.tasks.length && <p>No task plans yet. Create a draft to preview its role and status.</p>}
        <ul className="record-list">{board.tasks.map(item => <li key={item.taskId}>
          <button type="button" aria-pressed={item.taskId === selectedId} onClick={() => onSelect(item.taskId)}>{item.title}</button>
          <span>{item.state === "DRAFT" ? "Draft" : "Planned"} · {planRolePreview(item).label} (proposed) · v{item.version}</span>
        </li>)}</ul>
      </div>
      <div><h3>{task ? "Edit and inspect plan" : "Create task plan"}</h3>
        <PlanEditor key={task ? `${task.taskId}/${task.version}` : "new"} task={task} onSave={onSave} />
        {task && preview && <article className="agent-card" aria-label="Task plan inspector">
          <h3>{task.title}</h3><dl><dt>Plan status</dt><dd>{task.state === "DRAFT" ? "Draft" : "Planned"}</dd>
            <dt>Proposed role</dt><dd>{preview.label}</dd><dt>Worker runtime</dt><dd>Blocked — no active worker</dd>
            <dt>Plan version</dt><dd>{task.version}</dd><dt>Updated (client time)</dt><dd>{task.updatedAt}</dd>
            <dt>Task ID</dt><dd className="mono">{task.taskId}</dd><dt>Storage</dt><dd>Temporary browser memory; not persisted</dd></dl>
          <p>Agent execution, publishing and delivery are unavailable.</p>
          <button type="button" onClick={() => onMark(task)} disabled={!task.proposedAgentRole || task.state === "PLANNED"}>Mark as planned</button>
          {!task.proposedAgentRole && <p className="muted">Choose a proposed role and save before marking this plan.</p>}
          <p className="muted">Planned is a local planning state. It is not approval, dispatch, progress or completion.</p>
        </article>}
      </div>
    </div>
    <details><summary>Session change history ({board.changes.length}, latest 100)</summary>
      <p className="muted">Local planning history only; not a persistent security audit.</p>
      <ol>{board.changes.map((change, index) => <li key={index}>{change.action} · {change.taskId} · v{change.version} · {change.at}</li>)}</ol>
    </details>
  </>;
}

export function TaskPlanningPanel({ state }: { state: ShellState }) {
  const attached = attachedPlanningScope(state);
  const [mode, setMode] = useState<"CURRENT" | "TEMPORARY">("CURRENT");
  const [temporary, setTemporary] = useState<PlanningScope | null>(null), [name, setName] = useState("");
  const [boards, setBoards] = useState<Record<string, PlanningBoard>>({}), [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scope = mode === "CURRENT" ? attached : temporary;
  const key = scope ? planningScopeKey(scope) : null;
  const board = scope && key ? boards[key] ?? newPlanningBoard(scope) : null;
  function startTemporary(event: FormEvent) {
    event.preventDefault();
    try {
      const next = PlanningScopeSchema.parse({ kind: "TEMPORARY", projectId: crypto.randomUUID(), label: name.trim() });
      setTemporary(next); setMode("TEMPORARY"); setSelectedId(null); setError(null);
    } catch { setError("Enter a workspace name of 1–200 characters."); }
  }
  function save(values: PlanFormValues) {
    if (!board || !key) return;
    try {
      const id = selectedId && board.tasks.some(item => item.taskId === selectedId) ? selectedId : `plan:${crypto.randomUUID()}`;
      const next = savePlanForm(board, id, values, new Date().toISOString());
      setBoards(previous => ({ ...previous, [key]: next })); setSelectedId(id); setError(null);
    } catch { setError("Plan not saved. Check the title (1–200 characters), notes (up to 2,000), proposed role and current plan version."); }
  }
  function mark(task: TaskPlan) {
    if (!board || !key) return;
    try {
      const next = markTaskPlanned(board, { projectId: board.scope.projectId, taskId: task.taskId,
        expectedVersion: task.version, at: new Date().toISOString() });
      setBoards(previous => ({ ...previous, [key]: next })); setError(null);
    } catch { setError("Plan not marked. Save a proposed role and refresh the selected plan before trying again."); }
  }
  return <section className="planning-panel" aria-labelledby="planning-heading">
    <h2 id="planning-heading">Task planning <span className="badge">NON-EXECUTING</span></h2>
    <p>Create, edit and inspect a task plan with a proposed agent role. Workers remain blocked.</p>
    <p className="notice">Plans stay in this browser tab's memory and disappear on reload. Use Export plan and Import plan to save and restore a local JSON file. Plans are not saved to a project database, submitted to an agent or included in persisted DEMO history.</p>
    <p className="muted">Planning target: {AI_OFFICE_V1_RUNTIME_TARGET === "WINDOWS_AND_MACOS" ? "Windows and macOS" : "Unverified"}. No provider connection is needed.</p>
    <div className="actions">{attached && <button type="button" onClick={() => { setMode("CURRENT"); setSelectedId(null); setError(null); }}>Plan for current project</button>}
      {temporary && mode !== "TEMPORARY" && <button type="button" onClick={() => { setMode("TEMPORARY"); setSelectedId(null); setError(null); }}>Return to temporary workspace</button>}</div>
    {!temporary && <form onSubmit={startTemporary} className="inline-form" aria-label="Start temporary planning workspace">
      <label htmlFor="planning-workspace">Temporary planning workspace name<input id="planning-workspace" required maxLength={200} value={name} onChange={event => setName(event.target.value)} /></label>
      <button type="submit">Start temporary planning workspace</button>
      <p className="muted">Available without a backend. This does not open a folder or create a registered project.</p>
    </form>}
    {!board && <p role="status">No current project is available for planning. Open a current, fresh workspace or use a temporary planning workspace.</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {board && <PlanTransferPanel key={key} board={board} onReplace={next => {
      if (key) { setBoards(previous => ({ ...previous, [key]: next })); setSelectedId(null); setError(null); }
    }} />}
    {board && <TaskPlanBoard key={key} board={board} selectedId={selectedId} onSelect={id => { setSelectedId(id); setError(null); }}
      onNew={() => { setSelectedId(null); setError(null); }} onSave={save} onMark={mark} />}
  </section>;
}
