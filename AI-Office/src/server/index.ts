import path from "node:path";
import { pathToFileURL } from "node:url";
import { listenHttp } from "./http.js";
import { hasCode, safeFailure, WorkspaceFailure } from "./workspace/errors.js";
import { composeBackendHost, createBackendShutdown, type BackendHostOptions } from "./host.js";

// Backend-only development port. Conflict is fatal; never try a different port.
export const DEFAULT_PORT = 43123;
export async function startBackend(options: BackendHostOptions & { port?: number; developmentOrigin?: string; bootstrapToken?: string }) {
  if (options.developmentOrigin && !options.fixtureState) throw new WorkspaceFailure("ACCESS_DENIED", "DEVELOPMENT_ORIGIN_REQUIRES_FIXTURE_MODE", 403);
  const host = await composeBackendHost(options);
  const manager = host.manager;
  try {
    const http = await listenHttp(manager, options.port ?? DEFAULT_PORT, options.fixtureState?.demoHttp === true,
      { ...(options.developmentOrigin ? { origin: options.developmentOrigin } : {}),
        ...(options.bootstrapToken ? { bootstrapToken: options.bootstrapToken } : {}) });
    return { url: http.url, bootstrapToken: http.bootstrapToken, manager,
      close: createBackendShutdown(() => http.close(), () => host.close()) };
  } catch (error) {
    await host.close();
    if (hasCode(error, "EADDRINUSE")) throw new WorkspaceFailure("BACKEND_UNAVAILABLE", "PORT_IN_USE", 503);
    throw error;
  }
}

async function main(): Promise<void> {
  const local = process.env.LOCALAPPDATA;
  const dataRoot = process.env.AI_OFFICE_DATA_ROOT ?? (local ? path.join(local, "AI-Office") : undefined);
  if (!dataRoot) throw new WorkspaceFailure("STATE_UNAVAILABLE", "APP_DATA_ROOT_REQUIRED");
  // M01-04 is opt-in, disposable-fixture-only. The root is trusted launcher
  // configuration, never an HTTP-supplied path or production-data permission.
  const fixtureRoot = process.env.AI_OFFICE_FIXTURE_ROOT;
  let launchToken: string | undefined;
  if (process.env.AI_OFFICE_LAUNCHER === "1") {
    if (!process.send) throw new WorkspaceFailure("ACCESS_DENIED", "OWNED_LAUNCHER_IPC_REQUIRED");
    launchToken = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new WorkspaceFailure("ACCESS_DENIED", "LAUNCHER_BOOTSTRAP_TIMEOUT")), 10_000);
      process.once("message", (message: unknown) => {
        clearTimeout(timer);
        if (typeof message === "object" && message !== null && "type" in message && message.type === "bootstrap" &&
            "token" in message && typeof message.token === "string" && /^[a-f0-9]{64}$/.test(message.token)) resolve(message.token);
        else reject(new WorkspaceFailure("ACCESS_DENIED", "INVALID_LAUNCHER_BOOTSTRAP"));
      });
      process.send!({ type: "bootstrap-required" });
    });
  }
  const backend = await startBackend({ dataRoot, port: process.env.AI_OFFICE_PORT === undefined ? DEFAULT_PORT : Number(process.env.AI_OFFICE_PORT),
    ...(launchToken ? { bootstrapToken: launchToken } : {}),
    ...(process.env.AI_OFFICE_DEV_ORIGIN ? { developmentOrigin: process.env.AI_OFFICE_DEV_ORIGIN } : {}),
    ...(fixtureRoot ? { fixtureState: { root: fixtureRoot, demoHttp: process.env.AI_OFFICE_DEMO_HTTP === "1" } } : {}) });
  // Bootstrap capability is delivered only to the launching owner, not by an
  // unauthenticated HTTP endpoint, URL, cookie or file. Never log session/nonce.
  if (process.send) process.send({ type: "started", url: backend.url, bootstrapToken: backend.bootstrapToken });
  else {
    process.stdout.write(`AI Office M01-04: ${backend.url}\n`);
    process.stdout.write("Use npm run dev for the in-memory development session workflow.\n");
  }
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    void backend.close().then(() => { if (process.connected) process.disconnect(); }, (error: unknown) => {
      process.stderr.write(`${safeFailure(error).reason}\n`); process.exitCode = 1;
      if (process.connected) process.disconnect();
    });
  };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
  // Owned test launcher IPC only; no process-wide enumeration or external kill.
  process.on("message", (message) => { if (message === "shutdown") stop(); });
  process.once("disconnect", stop);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  void main().catch((error: unknown) => {
    process.stderr.write(`${safeFailure(error).reason}\n`); process.exitCode = 1;
  });
}
