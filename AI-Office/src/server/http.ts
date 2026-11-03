import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { SERVER_POLICY } from "./policy.js";
import { safeFailure, WorkspaceFailure } from "./workspace/errors.js";
import type { WorkspaceManager } from "./workspace/manager.js";

const BODY_LIMIT = 8192;
const routes = new Map([
  ["/api/health", "GET"], ["/api/session", "POST"], ["/api/workspace", "GET"],
  ["/api/workspace/open", "POST"], ["/api/workspace/initialize", "POST"],
  ["/api/workspace/detach", "POST"], ["/api/workspace/inspect", "POST"],
  ["/api/state/initialize", "POST"], ["/api/state/snapshot", "POST"], ["/api/brain/read", "POST"],
]);
const matches = (actual: string | string[] | undefined, expected: string) => {
  if (typeof actual !== "string") return false;
  const left = Buffer.from(actual), right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

function reply(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'", "Connection": "close" });
  response.end(JSON.stringify(body));
}

function readBody(request: IncomingMessage): Promise<unknown> {
  if (!/^application\/json(?:;\s*charset=utf-8)?$/i.test(request.headers["content-type"] ?? "") ||
      request.headers["content-encoding"] !== undefined) {
    throw new WorkspaceFailure("STATE_UNAVAILABLE", "JSON_CONTENT_TYPE_REQUIRED", 415);
  }
  if (Number(request.headers["content-length"] ?? 0) > BODY_LIMIT) {
    throw new WorkspaceFailure("STATE_UNAVAILABLE", "BODY_TOO_LARGE", 413);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0, failed = false;
    request.on("data", (chunk: Buffer) => {
      if (failed) return;
      size += chunk.length;
      if (size > BODY_LIMIT) {
        failed = true; chunks.length = 0;
        reject(new WorkspaceFailure("STATE_UNAVAILABLE", "BODY_TOO_LARGE", 413));
      } else chunks.push(chunk);
    });
    request.once("end", () => {
      if (failed) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new WorkspaceFailure("STATE_UNAVAILABLE", "INVALID_JSON", 400)); }
    });
    request.once("error", reject);
    request.once("aborted", () => reject(new WorkspaceFailure("STATE_UNAVAILABLE", "REQUEST_ABORTED", 400)));
  });
}

export async function listenHttp(manager: WorkspaceManager, port: number, demoHttp = false,
  development: { origin?: string; bootstrapToken?: string } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid backend port");
  if (development.origin && (!/^http:\/\/127\.0\.0\.1:\d+$/.test(development.origin) ||
      Number(new URL(development.origin).port) < 1 || Number(new URL(development.origin).port) > 65535)) throw new Error("Invalid development origin");
  if (development.bootstrapToken && !/^[a-f0-9]{64}$/.test(development.bootstrapToken)) throw new Error("Invalid bootstrap capability");
  const bootstrapToken = development.bootstrapToken ?? randomBytes(32).toString("hex");
  const bootstrapExpiresAt = Date.now() + 10 * 60_000;
  const sessionToken = randomBytes(32).toString("hex");
  const csrfNonce = randomBytes(32).toString("hex");
  let host = "", closing = false;
  const server = createServer({ maxHeaderSize: 8192, requestTimeout: 5000, headersTimeout: 5000 }, (request, response) => {
    void (async () => {
      try {
        if (closing) throw new WorkspaceFailure("BACKEND_UNAVAILABLE", "BACKEND_CLOSING", 503);
        const sensitive = new Set(["host", "origin", "authorization", "x-ai-office-session", "x-ai-office-nonce", "content-type", "content-length"]);
        const seen = new Set<string>();
        for (let i = 0; i < request.rawHeaders.length; i += 2) {
          const name = request.rawHeaders[i]!.toLowerCase();
          if (sensitive.has(name) && seen.has(name)) throw new WorkspaceFailure("ACCESS_DENIED", "DUPLICATE_HEADER", 403);
          seen.add(name);
        }
        if (request.socket.remoteAddress !== "127.0.0.1" || request.headers.host !== host ||
            (request.headers.origin !== undefined && request.headers.origin !== `http://${host}` && request.headers.origin !== development.origin) ||
            (request.headers["sec-fetch-site"] !== undefined && !["same-origin", "none"].includes(String(request.headers["sec-fetch-site"])))) {
          throw new WorkspaceFailure("ACCESS_DENIED", "LOCAL_ORIGIN_REQUIRED", 403);
        }
        const route = request.url ?? "";
        const method = route === "/api/dev/demo/initialize" && demoHttp ? "POST" : routes.get(route);
        if (!method) throw new WorkspaceFailure("STATE_UNAVAILABLE", "UNKNOWN_ROUTE", 404);
        if (request.method !== method) throw new WorkspaceFailure("STATE_UNAVAILABLE", "METHOD_NOT_ALLOWED", 405);
        if (route !== "/api/health") {
          const authorized = route === "/api/session" ? Date.now() <= bootstrapExpiresAt && matches(request.headers.authorization, `Bearer ${bootstrapToken}`) :
            matches(request.headers["x-ai-office-session"], sessionToken) && matches(request.headers["x-ai-office-nonce"], csrfNonce);
          if (!authorized) throw new WorkspaceFailure("ACCESS_DENIED", "LOCAL_SESSION_REQUIRED", 403);
        }
        if (method === "GET" && (request.headers["transfer-encoding"] || Number(request.headers["content-length"] ?? 0) !== 0)) {
          throw new WorkspaceFailure("STATE_UNAVAILABLE", "UNEXPECTED_BODY", 400);
        }
        const body = method === "POST" ? await readBody(request) : undefined;
        let result: unknown;
        switch (route) {
          case "/api/health": result = { status: "ok", milestone: "M01-04", stateService: manager.stateServiceStatus, policy: SERVER_POLICY }; break;
          case "/api/session": z.strictObject({}).parse(body); result = { sessionToken, csrfNonce }; break;
          case "/api/workspace": result = await manager.current(); break;
          case "/api/workspace/open": result = await manager.open(body); break;
          case "/api/workspace/initialize": result = await manager.initialize(body); break;
          case "/api/workspace/detach": result = await manager.detach(body); break;
          case "/api/workspace/inspect": result = await manager.inspect(body); break;
          case "/api/state/initialize": result = await manager.initializeState(body); break;
          case "/api/state/snapshot": result = await manager.projectSnapshot(body); break;
          case "/api/brain/read": result = await manager.knowledge(body); break;
          case "/api/dev/demo/initialize": result = await manager.seedDemo(body); break;
        }
        reply(response, 200, result);
      } catch (error) {
        const failure = error instanceof z.ZodError ? new WorkspaceFailure("STATE_UNAVAILABLE", "INVALID_REQUEST", 400) : safeFailure(error);
        if (!response.headersSent && !response.destroyed) reply(response, failure.status, { error: { code: failure.code }, reason: failure.reason });
      }
    })();
  });
  server.setTimeout(5000, (socket) => socket.destroy());
  server.maxConnections = 32;
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      server.off("error", reject);
      const address = server.address();
      if (!address || typeof address === "string") { reject(new Error("Missing loopback address")); return; }
      host = `127.0.0.1:${address.port}`;
      resolve();
    });
  });
  return {
    url: `http://${host}`, bootstrapToken,
    async close() {
      closing = true;
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}
