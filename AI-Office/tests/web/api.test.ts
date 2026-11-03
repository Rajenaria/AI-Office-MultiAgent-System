import { afterEach, describe, expect, it, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { ApiClient, boundScope, capabilityHash, KnowledgeResponseSchema } from "../../src/web/api.js";
import { deferred, PROJECT_B, ready, snapshot } from "./fixtures.js";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const credentials = (character: string) => ({ sessionToken: character.repeat(64), csrfNonce: "c".repeat(64) });

describe("in-memory API client boundary", () => {
  it("keeps bootstrap/session credentials in headers and never URL/body/cache storage", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(credentials("a"))).mockResolvedValueOnce(json(ready())); vi.stubGlobal("fetch", fetcher);
    const passphrase = randomBytes(32).toString("hex"), api = new ApiClient();
    await api.bootstrap(passphrase); await api.current();
    const bootstrap = fetcher.mock.calls[0]!; expect(bootstrap[0]).toBe("/api/session");
    expect(bootstrap[1].body).toBe("{}"); expect(bootstrap[1].headers.Authorization).toBe(`Bearer ${await capabilityHash(passphrase)}`);
    const read = fetcher.mock.calls[1]!; expect(read[0]).toBe("/api/workspace");
    expect(read[1].headers["X-AI-Office-Session"]).toBe(credentials("a").sessionToken);
    expect(read[1].headers["X-AI-Office-Nonce"]).toBe(credentials("a").csrfNonce);
    expect(read[1].cache).toBe("no-store"); expect(read[1].credentials).toBe("omit");
  });
  it("does not replace a fresh session with a delayed old bootstrap response", async () => {
    const delayed = deferred<Response>(); const fetcher = vi.fn().mockImplementationOnce(() => delayed.promise)
      .mockResolvedValueOnce(json(credentials("b"))).mockResolvedValueOnce(json(ready())); vi.stubGlobal("fetch", fetcher);
    const api = new ApiClient(); const first = api.bootstrap(randomBytes(32).toString("hex")).catch((error: unknown) => error);
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await api.bootstrap(randomBytes(32).toString("hex")); delayed.resolve(json(credentials("a"))); await first;
    await api.current(); expect(fetcher.mock.calls[2]![1].headers["X-AI-Office-Session"]).toBe(credentials("b").sessionToken);
  });
  it("rejects wrong snapshot binding and knowledge project/version", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(snapshot(PROJECT_B))).mockResolvedValueOnce(json({
      metadata: snapshot(PROJECT_B).snapshot.knowledge[0], integrity: "VERIFIED", effectiveStatus: "CANDIDATE", actualHash: "a".repeat(64),
      content: "fixture", contentType: "text/markdown", trustedAsInstructions: false,
    })); vi.stubGlobal("fetch", fetcher); const api = new ApiClient(); const scope = boundScope(ready());
    await expect(api.snapshot(scope)).rejects.toMatchObject({ reason: "RESPONSE_BINDING_MISMATCH" });
    await expect(api.knowledge(scope, snapshot().snapshot.knowledge[0]!)).rejects.toMatchObject({ reason: "KNOWLEDGE_PROJECT_OR_VERSION_MISMATCH" });
  });
  it("sanitizes malformed error responses and never presents raw HTML/stack data", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("secret internal stack", { status: 502 }))
      .mockResolvedValueOnce(json({ stack: "unrelated-sensitive-content" }, 500)); vi.stubGlobal("fetch", fetcher);
    const api = new ApiClient(); await expect(api.current()).rejects.toMatchObject({ reason: "BACKEND_RESPONSE_UNAVAILABLE" });
    await expect(api.current()).rejects.toMatchObject({ reason: "INVALID_ERROR_RESPONSE" });
  });
  it("does not issue an aborted mutation or retry a rejected mutation", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("offline")); vi.stubGlobal("fetch", fetcher); const api = new ApiClient();
    const abort = new AbortController(); abort.abort(); await expect(api.open("fixture", 0, abort.signal)).rejects.toThrow(); expect(fetcher).not.toHaveBeenCalled();
    await expect(api.open("fixture", 0)).rejects.toMatchObject({ kind: "NETWORK" }); expect(fetcher).toHaveBeenCalledOnce();
  });
  it("rejects a CHANGED response that still claims approved effective content", () => {
    expect(KnowledgeResponseSchema.safeParse({ metadata: snapshot().snapshot.knowledge[0], integrity: "CHANGED", effectiveStatus: "APPROVED",
      actualHash: "b".repeat(64), content: "must be withheld", contentType: "text/markdown", trustedAsInstructions: false }).success).toBe(false);
  });
});
