import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PlanningBoard } from "../planning/model.js";
import { PlanTransferError, PlanTransferSession, type PlanImportPreview } from "../planning/transfer.js";
import { exportPlanFile } from "../planning/download.js";

export function PlanImportPreviewPanel({ preview, confirmed, onConfirm, onApply, onCancel }: {
  preview: PlanImportPreview; confirmed: boolean; onConfirm: (value: boolean) => void; onApply: () => void; onCancel: () => void;
}) {
  return <div className="confirmation" role="region" aria-label="Import plan preview">
    <h3>Review local plan import</h3>
    <dl><dt>Schema version</dt><dd>{preview.schemaVersion}</dd><dt>Incoming tasks</dt><dd>{preview.taskCount}</dd>
      <dt>Source scope</dt><dd>{preview.sourceScope.kind} · {preview.sourceScope.label} · {preview.sourceScope.projectId}</dd>
      <dt>Selected destination</dt><dd>{preview.targetScope.kind} · {preview.targetScope.label} · {preview.targetScope.projectId}</dd>
      <dt>Effect</dt><dd>Replace {preview.replacedTaskCount} current task(s) with {preview.taskCount} imported task(s). No merge.</dd></dl>
    <ul>{preview.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
    <label className="replace-confirmation"><input type="checkbox" checked={confirmed} onChange={event => onConfirm(event.target.checked)} />
      Replace the current in-memory board. I understand its existing tasks will be discarded.</label>
    <div className="actions"><button type="button" onClick={onApply} disabled={!confirmed}>Confirm replacement and import</button>
      <button type="button" onClick={onCancel}>Cancel import</button></div>
  </div>;
}

export function PlanTransferPanel({ board, onReplace }: { board: PlanningBoard; onReplace: (next: PlanningBoard) => void }) {
  const [session] = useState(() => new PlanTransferSession());
  const transfer = useSyncExternalStore(session.subscribe, session.getState, session.getState);
  const current = useRef(board), picker = useRef<HTMLInputElement>(null); current.current = board;
  const [exportNotice, setExportNotice] = useState<string | null>(null), [exportError, setExportError] = useState<string | null>(null);
  useEffect(() => { session.activate(); return () => session.dispose(); }, [session]);
  function exportPlan() {
    try {
      exportPlanFile(current.current);
      setExportError(null); setExportNotice("Export download requested. Your browser controls whether the file is saved. This is planning data only.");
    } catch (error) {
      setExportNotice(null); setExportError(error instanceof PlanTransferError ? error.message : "The browser could not start the plan download. No tasks changed.");
    }
  }
  function apply() {
    try { onReplace(session.apply(current.current)); } catch { /* Session exposes a fixed safe error; no parent board update. */ }
  }
  return <div className="transfer-panel" aria-label="Local plan files">
    <h3>Save or restore planning work</h3>
    <p className="muted">One selected scope per JSON file, up to 100 tasks and 1 MiB. No credentials, execution permissions or persistent audit history. Import always requires review and replacement confirmation.</p>
    <div className="actions"><button type="button" onClick={exportPlan}>Export plan</button>
      <button type="button" disabled={transfer.phase === "READING"} onClick={() => picker.current?.click()}>Import plan</button></div>
    {!board.tasks.length && <p className="muted">This board is empty. Create a plan before exporting, or import a saved plan file.</p>}
    <input className="visually-hidden" ref={picker} type="file" accept=".json,application/json" aria-label="Select local plan JSON file"
      onChange={event => {
        const file = event.target.files?.[0]; event.target.value = ""; setExportNotice(null); setExportError(null);
        if (file) void session.load(file, () => current.current); else session.cancel();
      }} />
    {exportNotice && <p role="status">{exportNotice}</p>}{exportError && <p role="alert" className="error">{exportError}</p>}
    {transfer.notice && <p role="status">{transfer.notice}</p>}{transfer.error && <p role="alert" className="error">{transfer.error.message}</p>}
    {transfer.phase === "READING" && <button type="button" onClick={() => session.cancel()}>Cancel import</button>}
    {transfer.preview && <PlanImportPreviewPanel preview={transfer.preview} confirmed={transfer.confirmed}
      onConfirm={value => session.confirm(value)} onApply={apply} onCancel={() => session.cancel()} />}
  </div>;
}
