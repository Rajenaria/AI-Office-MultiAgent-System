import type { Freshness, KnowledgeVersion } from "../../contracts/index.js";
import { ApiFailure, assertBinding, boundScope, type ShellApi, type WorkspaceResponse, type SnapshotResponse, type KnowledgeResponse } from "../api.js";

export type ShellState = Readonly<{
  connection: "UNKNOWN" | "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "SESSION_INVALID";
  sessionReady: boolean; busy: boolean; workspace: WorkspaceResponse | null; snapshot: SnapshotResponse | null;
  knowledge: KnowledgeResponse | null; freshness: Freshness["status"]; lastSuccessAt: string | null;
  requestedPath: string | null; error: ApiFailure | null;
}>;
const initial: ShellState = { connection: "UNKNOWN", sessionReady: false, busy: false, workspace: null, snapshot: null,
  knowledge: null, freshness: "unknown", lastSuccessAt: null, requestedPath: null, error: null };

// Ephemeral transport/view projection only. SQLite remains authoritative.
export class ShellController {
  private state: ShellState = initial;
  private listeners = new Set<() => void>();
  private epoch = 0;
  private readEpoch = 0;
  private abort = new AbortController();
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private readonly api: ShellApi, private readonly now = () => Date.now()) {}
  getState = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(change: Partial<ShellState>) { this.state = Object.freeze({ ...this.state, ...change }); this.listeners.forEach((listener) => listener()); }
  private cancel() { clearTimeout(this.timer); this.timer = undefined; this.abort.abort(); this.abort = new AbortController(); this.readEpoch++; }
  private begin(path = this.state.requestedPath) {
    this.epoch++; this.cancel();
    this.update({ busy: true, workspace: null, snapshot: null, knowledge: null, lastSuccessAt: null, freshness: "unknown", requestedPath: path, error: null });
    return this.epoch;
  }
  private failure(error: unknown, epoch: number) {
    if (epoch !== this.epoch) return;
    const failure = error instanceof ApiFailure ? error : new ApiFailure("INVALID_RESPONSE", "RESPONSE_CONTRACT_MISMATCH");
    if (failure.kind === "AUTH") {
      this.cancel(); this.api.clearSession();
      this.update({ connection: "SESSION_INVALID", sessionReady: false, freshness: "disconnected", knowledge: null, error: failure });
    } else if (failure.kind === "NETWORK") {
      const elapsed = this.state.lastSuccessAt ? this.now() - Date.parse(this.state.lastSuccessAt) : Infinity;
      this.update({ connection: "DISCONNECTED", freshness: elapsed < 6000 ? "stale" : "disconnected", error: failure });
    } else {
      this.cancel(); this.update({ snapshot: null, knowledge: null, workspace: null, freshness: "unknown", error: failure });
    }
  }
  async checkHealth() {
    const epoch = this.epoch;
    this.update({ connection: "CONNECTING" });
    try { await this.api.health(this.abort.signal); if (epoch === this.epoch) this.update({ connection: "CONNECTED", error: null }); }
    catch (error) { this.failure(error, epoch); }
  }
  async connect(passphrase: string) {
    const epoch = this.begin(null); this.update({ connection: "CONNECTING", sessionReady: false });
    try {
      await this.api.bootstrap(passphrase, this.abort.signal);
      if (epoch !== this.epoch) return;
      this.update({ sessionReady: true, connection: "CONNECTED" });
      await this.acceptWorkspace(await this.api.current(this.abort.signal), epoch);
    } catch (error) { this.failure(error, epoch); }
    finally { if (epoch === this.epoch) { this.update({ busy: false }); this.schedule(epoch); } }
  }
  private async acceptWorkspace(workspace: WorkspaceResponse, epoch: number) {
    if (epoch !== this.epoch) return;
    this.update({ workspace, connection: "CONNECTED", error: null });
    if (workspace.nextAction) this.update({ requestedPath: workspace.nextAction.canonicalPath });
    if (workspace.view.state === "READY") await this.fetchSnapshot(epoch, workspace);
  }
  private async fetchSnapshot(epoch: number, workspace: WorkspaceResponse) {
    const scope = boundScope(workspace);
    const response = await this.api.snapshot(scope, this.abort.signal);
    if (epoch !== this.epoch) return;
    // Guard even non-cooperative transports or future API implementations.
    assertBinding(response.snapshot.binding, scope.binding);
    if (response.identity.projectId !== scope.projectId) throw new ApiFailure("INVALID_RESPONSE", "SNAPSHOT_PROJECT_MISMATCH");
    if (this.state.snapshot && response.snapshot.snapshotVersion < this.state.snapshot.snapshot.snapshotVersion) throw new ApiFailure("INVALID_RESPONSE", "SNAPSHOT_VERSION_REGRESSION");
    this.update({ snapshot: response, lastSuccessAt: new Date(this.now()).toISOString(), freshness: response.snapshot.freshness.status,
      connection: "CONNECTED", error: null });
  }
  private schedule(epoch: number) {
    clearTimeout(this.timer);
    if (epoch !== this.epoch || !this.state.sessionReady || this.state.workspace?.view.state !== "READY") return;
    this.timer = setTimeout(() => { void this.poll(epoch); }, 2000);
  }
  private async poll(epoch: number) {
    if (epoch !== this.epoch || !this.state.sessionReady || this.state.busy || this.state.workspace?.view.state !== "READY") return;
    try { await this.fetchSnapshot(epoch, this.state.workspace); }
    catch (error) { this.failure(error, epoch); }
    finally { if (epoch === this.epoch) this.schedule(epoch); }
  }
  private async command(operation: (signal: AbortSignal) => Promise<WorkspaceResponse>, path = this.state.requestedPath) {
    const epoch = this.begin(path);
    try { await this.acceptWorkspace(await operation(this.abort.signal), epoch); }
    catch (error) { this.failure(error, epoch); }
    finally { if (epoch === this.epoch) { this.update({ busy: false }); this.schedule(epoch); } }
  }
  open(path: string) {
    return this.command(async (signal) => { const current = await this.api.current(signal); return this.api.open(path, current.view.generation, signal); }, path);
  }
  initializeMetadata() {
    const workspace = this.state.workspace;
    if (workspace) return this.command((signal) => this.api.initializeMetadata(workspace, signal));
  }
  initializeState() {
    const workspace = this.state.workspace;
    if (workspace) return this.command((signal) => this.api.initializeState(workspace, signal));
  }
  detach() {
    const workspace = this.state.workspace;
    if (workspace) return this.command((signal) => this.api.detach(workspace, signal), null);
  }
  refreshWorkspace() { return this.command((signal) => this.api.current(signal)); }
  async readKnowledge(record: KnowledgeVersion) {
    const workspace = this.state.workspace;
    if (!workspace || workspace.view.state !== "READY") return;
    const epoch = this.epoch, readEpoch = ++this.readEpoch;
    this.update({ knowledge: null, error: null });
    try {
      const response = await this.api.knowledge(boundScope(workspace), record, this.abort.signal);
      if (epoch !== this.epoch || readEpoch !== this.readEpoch) return;
      if (response.metadata.projectId !== workspace.identity?.projectId || response.metadata.knowledgeId !== record.knowledgeId || response.metadata.version !== record.version) {
        throw new ApiFailure("INVALID_RESPONSE", "KNOWLEDGE_PROJECT_OR_VERSION_MISMATCH");
      }
      this.update({ knowledge: response });
    } catch (error) { if (readEpoch === this.readEpoch) this.failure(error, epoch); }
  }
  stop() { this.epoch++; this.cancel(); this.api.clearSession(); }
}
