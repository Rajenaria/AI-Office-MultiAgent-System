import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { request as rawRequest } from "node:http";
import { readdir } from "node:fs/promises";
import { initialize, session } from "../workspace/helpers.js";
import { stateFixture, scope, seeded, SnapshotResponseSchema, type StateFixture } from "./helpers.js";

describe("state API reuses the existing local security boundary", () => {
  let f: StateFixture;
  beforeEach(async () => { f = await stateFixture(); });
  afterEach(async () => { await f.cleanup(); });
  const post = (url: string, body: unknown, headers: Record<string, string>) => fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  it("keeps DEMO HTTP unavailable by default even when fixture state is enabled", async () => {
    const backend = await f.stateStart(); const headers = await session(backend);
    const response = await post(backend.url + "/api/dev/demo/initialize", {}, headers);
    expect(response.status).toBe(404);
    expect(await readdir(f.a)).toEqual([]);
  });

  it("keeps ordinary backend identity-only without enabling fixture state", async () => {
    const backend = await f.start(); const identity = await initialize(backend.manager, f.a); const headers = await session(backend);
    const result = await post(backend.url + "/api/state/initialize", { scope: scope(identity), consent: true }, headers);
    expect(result.status).toBe(503); expect(await result.json()).toMatchObject({ reason: "FIXTURE_STATE_SERVICE_NOT_ENABLED" });
    expect(await readdir(f.dataRoot)).not.toContain("projects");
  });

  it.each(["/api/state/initialize", "/api/state/snapshot", "/api/brain/read", "/api/dev/demo/initialize"])("guards %s against missing credentials/nonce and foreign origins", async (route) => {
    const backend = await f.stateStart({ demoHttp: true }); const headers = await session(backend);
    expect((await post(backend.url + route, {}, { "Content-Type": "application/json" })).status).toBe(403);
    expect((await post(backend.url + route, {}, { ...headers, "X-AI-Office-Nonce": "invalid" })).status).toBe(403);
    expect((await post(backend.url + route, {}, { ...headers, Origin: "https://foreign.invalid" })).status).toBe(403);
    const hostStatus = await new Promise<number>((resolve, reject) => {
      const request = rawRequest(backend.url + route, { method: "POST", headers: { ...headers, Host: "foreign.invalid" } }, (response) => {
        response.resume(); response.on("end", () => resolve(response.statusCode!));
      });
      request.on("error", reject); request.end("{}");
    });
    expect(hostStatus).toBe(403);
    expect((await fetch(backend.url + route, { headers })).status).toBe(405);
    expect(await readdir(f.dataRoot)).not.toContain("projects");
  });

  it("returns validated snapshots without DB paths and denies client path/SQL selectors", async () => {
    const backend = await f.stateStart(); const a = await seeded(backend.manager, f.a, "A_ONLY"); const headers = await session(backend);
    const response = await post(backend.url + "/api/state/snapshot", a.owner, headers);
    expect(response.status).toBe(200);
    const text = await response.text(); const parsed = SnapshotResponseSchema.parse(JSON.parse(text));
    expect(parsed.identity.projectId).toBe(a.owner.projectId); expect(text).not.toContain(f.dataRoot);
    expect(text).not.toContain("canonicalRootRef"); expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect((await post(backend.url + "/api/state/snapshot", { ...a.owner, databasePath: f.b }, headers)).status).toBe(400);
    expect((await post(backend.url + "/api/brain/read", { scope: a.owner, path: ".env", knowledgeId: "knowledge:fixture", version: 1 }, headers)).status).toBe(400);
    expect((await post(backend.url + "/api/sql", { sql: "SELECT *" }, headers)).status).toBe(404);
    const read = await post(backend.url + "/api/brain/read", { scope: a.owner, knowledgeId: "knowledge:fixture", version: 1 }, headers);
    expect(read.status).toBe(200); expect(await read.json()).toMatchObject({ content: "A_ONLY", integrity: "VERIFIED" });
  });

  it("requires initialization consent and rejects stale cross-project HTTP reads", async () => {
    const backend = await f.stateStart(); const headers = await session(backend);
    const a = await initialize(backend.manager, f.a); const ownerA = scope(a);
    expect((await post(backend.url + "/api/state/initialize", { scope: ownerA, consent: false }, headers)).status).toBe(400);
    expect(await readdir(f.dataRoot)).not.toContain("projects");
    expect((await post(backend.url + "/api/state/initialize", { scope: ownerA, consent: true }, headers)).status).toBe(200);
    const b = await seeded(backend.manager, f.b, "B_ONLY");
    const stale = await post(backend.url + "/api/state/snapshot", ownerA, headers);
    expect(stale.status).toBe(409); expect(await stale.json()).toMatchObject({ error: { code: "STALE_BINDING" } });
    const forged = { projectId: ownerA.projectId, binding: { ...b.owner.binding, projectId: ownerA.projectId } };
    const wrong = await post(backend.url + "/api/brain/read", { scope: forged, knowledgeId: "knowledge:fixture", version: 1 }, headers);
    expect(wrong.status).toBe(403); expect(await wrong.text()).not.toContain("B_ONLY");
  });
});
