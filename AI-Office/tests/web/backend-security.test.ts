import { afterEach, expect, it, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { startBackend } from "../../src/server/index.js";
import { fixture } from "../integration/workspace/helpers.js";

afterEach(() => { vi.restoreAllMocks(); });
it("permits only the explicitly configured fixture development origin; session/nonce still required", async () => {
  const f = await fixture(); const token = randomBytes(32).toString("hex");
  const backend = await startBackend({ dataRoot: f.dataRoot, port: 0, fixtureState: { root: f.root }, developmentOrigin: "http://127.0.0.1:43124", bootstrapToken: token });
  try {
    const bootstrap = (origin: string) => fetch(backend.url + "/api/session", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, Authorization: `Bearer ${token}` }, body: "{}" });
    expect((await bootstrap("http://127.0.0.1:43125")).status).toBe(403); expect((await bootstrap("http://foreign.invalid")).status).toBe(403);
    const correct = await bootstrap("http://127.0.0.1:43124"); expect(correct.status).toBe(200); expect(correct.headers.get("access-control-allow-origin")).toBeNull();
    expect((await fetch(backend.url + "/api/workspace", { headers: { Origin: "http://127.0.0.1:43124" } })).status).toBe(403);
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 11 * 60_000);
    expect((await bootstrap("http://127.0.0.1:43124")).status).toBe(403);
  } finally { vi.restoreAllMocks(); await backend.close(); await f.cleanup(); }
});

it("rejects a broad development origin and releases the failed writer claim", async () => {
  const f = await fixture();
  try {
    await expect(startBackend({ dataRoot: f.dataRoot, port: 0, fixtureState: { root: f.root }, developmentOrigin: "http://localhost:*" })).rejects.toThrow();
    const valid = await startBackend({ dataRoot: f.dataRoot, port: 0 }); await valid.close();
  } finally { await f.cleanup(); }
});
