import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { request as httpRequest } from "node:http";
import { readdir } from "node:fs/promises";
import { startBackend } from "../../../src/server/index.js";
import { fixture, readWorkspace, session, type Fixture } from "./helpers.js";

describe("loopback command boundary", () => {
  let f: Fixture;
  let backend: Awaited<ReturnType<Fixture["start"]>>;
  let headers: Awaited<ReturnType<typeof session>>;
  beforeEach(async () => { f = await fixture(); backend = await f.start(); headers = await session(backend); });
  afterEach(async () => { await f.cleanup(); });
  const post = async (url: string, body: unknown, requestHeaders: Record<string, string>) =>
    fetch(url, { method: "POST", headers: requestHeaders, body: JSON.stringify(body) });

  it("health reports disabled policy and bootstrap is not publicly readable", async () => {
    expect(new URL(backend.url).hostname).toBe("127.0.0.1");
    const health = await fetch(`${backend.url}/api/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toMatchObject({ stateService: "NOT_IMPLEMENTED", policy: {
      workersEnabled: false, paidApiEnabled: false, providerConnectionsEnabled: false, skillExecutionEnabled: false,
      quotaStatus: "UNKNOWN", executionMode: "demo",
    } });
    const denied = await post(`${backend.url}/api/session`, {}, { "Content-Type": "application/json" });
    expect(denied.status).toBe(403);
    expect(await denied.text()).not.toContain(backend.bootstrapToken);
    expect((await fetch(`${backend.url}/api/workspace`)).status).toBe(403);
    expect((await fetch(`${backend.url}/api/session`)).status).toBe(405);
  });

  it.each([{}, { "X-AI-Office-Session": "invalid", "X-AI-Office-Nonce": "invalid" }])("rejects unauthorized mutation %#", async (auth) => {
    const response = await post(`${backend.url}/api/workspace/open`, { path: f.a, expectedGeneration: 0 }, { "Content-Type": "application/json", ...auth });
    expect(response.status).toBe(403); expect(await readdir(f.a)).toEqual([]);
  });

  it("rejects missing/wrong nonce even with valid session", async () => {
    for (const nonce of [undefined, "incorrect"]) {
      const custom: Record<string, string> = { "Content-Type": "application/json", "X-AI-Office-Session": headers["X-AI-Office-Session"] };
      if (nonce) custom["X-AI-Office-Nonce"] = nonce;
      expect((await post(`${backend.url}/api/workspace/open`, { path: f.a, expectedGeneration: 0 }, custom)).status).toBe(403);
    }
    expect(await readdir(f.a)).toEqual([]);
  });

  it.each(["http://evil.invalid", "http://localhost:43123", "null"])("rejects foreign Origin %s", async (origin) => {
    expect((await post(`${backend.url}/api/workspace/open`, { path: f.a, expectedGeneration: 0 }, { ...headers, Origin: origin })).status).toBe(403);
    expect((await post(`${backend.url}/api/session`, {}, { "Content-Type": "application/json", Authorization: `Bearer ${backend.bootstrapToken}`, Origin: origin })).status).toBe(403);
  });

  it("rejects foreign Host and cross-site fetch metadata", async () => {
    // Node fetch normalizes Host; use raw HTTP to actually send the attack header.
    const status = (custom: Record<string, string>) => new Promise<number>((resolve, reject) => {
      const request = httpRequest(`${backend.url}/api/workspace/open`, { method: "POST", headers: { ...headers, ...custom } }, (response) => {
        response.resume(); response.on("end", () => resolve(response.statusCode!));
      });
      request.on("error", reject); request.end("{}");
    });
    expect(await status({ Host: "evil.invalid" })).toBe(403);
    expect(await status({ "Sec-Fetch-Site": "cross-site" })).toBe(403);
  });

  it("accepts exact local origin with valid session and no permissive CORS", async () => {
    const response = await post(`${backend.url}/api/workspace/open`, { path: f.a, expectedGeneration: 0 }, { ...headers, Origin: backend.url });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await readWorkspace(response)).nextAction?.kind).toBe("INITIALIZATION_REQUIRED");
  });

  it.each(["/api/shell", "/api/files/read", "/api/files/write", "/api/sql", "/api/tasks/dispatch", "/api/providers", "/api/skills/execute", "/api/workspace?path=secret"])("has no arbitrary command route %s", async (route) => {
    const response = await post(backend.url + route, {}, headers);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "STATE_UNAVAILABLE" }, reason: "UNKNOWN_ROUTE" });
  });

  it.each(["GET", "DELETE", "PUT", "OPTIONS"])("rejects invalid command method %s", async (method) => {
    expect((await fetch(`${backend.url}/api/workspace/open`, { method, headers })).status).toBe(405);
  });

  it("rejects malformed JSON, excessive bodies, wrong content type and extra fields", async () => {
    const url = `${backend.url}/api/workspace/open`;
    expect((await fetch(url, { method: "POST", headers, body: "{invalid" })).status).toBe(400);
    expect((await fetch(url, { method: "POST", headers, body: "x".repeat(9000) })).status).toBe(413);
    expect((await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": "text/plain" }, body: "{}" })).status).toBe(415);
    expect((await post(url, { path: f.a, expectedGeneration: 0, dataRoot: f.b }, headers)).status).toBe(400);
    expect((await post(url, { path: f.a, expectedGeneration: "0" }, headers)).status).toBe(400);
    expect(await readdir(f.a)).toEqual([]);
  });

  it("bounds chunked bodies and rejects duplicate security headers", async () => {
    const raw = (customHeaders: Record<string, string | string[]>, chunks: string[]) => new Promise<{ status: number; text: string }>((resolve, reject) => {
      const request = httpRequest(`${backend.url}/api/workspace/open`, { method: "POST", headers: customHeaders }, (response) => {
        let text = ""; response.on("data", (chunk) => { text += String(chunk); });
        response.on("end", () => resolve({ status: response.statusCode!, text }));
      });
      request.on("error", reject); for (const chunk of chunks) request.write(chunk); request.end();
    });
    expect((await raw({ ...headers, "Transfer-Encoding": "chunked" }, ["x".repeat(4500), "x".repeat(4500)])).status).toBe(413);
    expect((await raw({ ...headers, Origin: [backend.url, backend.url] }, ["{}"])).status).toBe(403);
  });

  it("exercises authorized API open/consent/inspect/detach and sanitizes errors", async () => {
    const opened = await post(`${backend.url}/api/workspace/open`, { path: f.a, expectedGeneration: 0 }, headers);
    const pending = await readWorkspace(opened);
    expect(await readdir(f.a)).toEqual([]);
    const attached = await post(`${backend.url}/api/workspace/initialize`, { path: pending.nextAction!.canonicalPath, expectedGeneration: pending.view.generation,
      consent: true, consentToken: pending.nextAction!.consentToken }, headers);
    expect(attached.status).toBe(200); const result = await readWorkspace(attached);
    expect(result.view.state).toBe("LOADING");
    if (result.view.state !== "LOADING" || !result.identity) throw new Error("Expected identity attachment");
    expect("canonicalRootRef" in result.view.binding).toBe(false);
    const scope = { projectId: result.identity.projectId, binding: result.view.binding };
    expect((await post(`${backend.url}/api/workspace/inspect`, scope, headers)).status).toBe(200);
    const denied = await post(`${backend.url}/api/workspace/open`, { path: `${f.root}\\missing-SECRET-fixture`, expectedGeneration: result.view.generation }, headers);
    expect(denied.status).toBe(400);
    const text = await denied.text(); expect(text).not.toContain("SECRET"); expect(text).not.toContain("stack");
    const current = await readWorkspace(await fetch(`${backend.url}/api/workspace`, { headers }));
    expect(current.view.state).toBe("ERROR"); expect(current.identity).toBeNull();
    const detached = await post(`${backend.url}/api/workspace/detach`, { expectedGeneration: current.view.generation, scope: null }, headers);
    expect((await readWorkspace(detached)).view.state).toBe("DETACHED");
  });

  it("fails explicitly on port conflict and releases the failed instance claim", async () => {
    const otherRoot = `${f.root}\\other-data`;
    await expect(startBackend({ dataRoot: otherRoot, port: Number(new URL(backend.url).port) })).rejects.toMatchObject({ reason: "PORT_IN_USE" });
    expect(await readdir(otherRoot)).toEqual([]);
    expect((await fetch(`${backend.url}/api/health`)).status).toBe(200);
  });
});
