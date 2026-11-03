import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, symlink } from "node:fs/promises";
import path from "node:path";
import { securityFixture, fileRequest, type SecurityFixture } from "./fixtures/helpers.js";

describe("S01-S06 fixture-issued ownership and host path policy", () => {
  let f: SecurityFixture;
  beforeEach(async () => { f = await securityFixture(); });
  afterEach(async () => { await f.checkSentinels(); await f.cleanup(); });

  it("allows scoped A operations without performing the requested mutation", async () => {
    const context = await f.issue();
    const read = await f.harness.policy.evaluate(context, fileRequest(context, "read/input.txt"));
    expect(await readFile(read.canonicalPath, "utf8")).toBe("A_ONLY");
    await f.harness.policy.evaluate(context, fileRequest(context, "work/new.txt", "CREATE"));
    await f.harness.policy.evaluate(context, fileRequest(context, "work/existing.txt", "WRITE"));
    expect(await readFile(path.join(f.a, "work/existing.txt"), "utf8")).toBe("A_WORK");
    await expect(readFile(path.join(f.a, "work/new.txt"))).rejects.toThrow();
  });
  it("keeps synthetic A ownership after foreground B and rejects copied capabilities", async () => {
    const a = await f.issue(), b = await f.issue("b");
    expect(a.projectId).not.toBe(b.projectId);
    expect(Object.isFrozen(a)).toBe(true); expect(Object.isFrozen(a.readScope)).toBe(true);
    expect((await f.harness.policy.evaluate(a, fileRequest(a, "read/input.txt"))).canonicalPath).toContain("project-a");
    await expect(f.harness.policy.evaluate({ ...a, projectId: b.projectId }, fileRequest(b, "read/input.txt"))).rejects.toThrow("CONTEXT_NOT_ISSUED");
    await expect(f.harness.policy.evaluate(a, fileRequest(b, "read/input.txt"))).rejects.toThrow("REQUEST_SCOPE_MISMATCH");
    await expect(f.harness.policy.evaluate(b, fileRequest(b, path.join(f.a, "read/input.txt")))).rejects.toThrow();
  });
  it("requires genuine backend binding and rejects wrong identity", async () => {
    const options = await f.options();
    await expect(f.authority.issue({ ...options, scope: { projectId: options.scope.projectId } })).rejects.toThrow();
    const forged = randomUUID();
    await expect(f.authority.issue({ ...options, scope: { projectId: forged, binding: { ...options.scope.binding, projectId: forged } } })).rejects.toThrow();
    const context = await f.authority.issue(options);
    await expect(f.authority.issue({ ...options, taskId: "task:other" })).rejects.toThrow("ATTEMPT_ID_ALREADY_ISSUED");
    await expect(f.harness.policy.evaluate(context, { ...fileRequest(context, "read/input.txt"), taskId: "task:other" })).rejects.toThrow("REQUEST_SCOPE_MISMATCH");
  });
  it("rejects expired and revoked contexts instead of refreshing ownership", async () => {
    const a = await f.issue("a", { lifetimeMs: 10 }); f.advance(11);
    await expect(f.harness.policy.evaluate(a, fileRequest(a, "read/input.txt"))).rejects.toThrow("CONTEXT_EXPIRED");
    const next = await f.issue(); f.authority.revoke(next);
    await expect(f.harness.policy.evaluate(next, fileRequest(next, "read/input.txt"))).rejects.toThrow("CONTEXT_NOT_ISSUED");
  });
  it.each(["project-b/read/input.txt", "app-private/sentinel.txt", "dummy-credentials/fake-token.txt"])("rejects A access to fixture sibling %s", async (target) => {
    const a = await f.issue();
    await expect(f.harness.policy.evaluate(a, fileRequest(a, path.join(f.root, target)))).rejects.toThrow();
  });
  it.each(["../project-b/read/input.txt", "C:work/input.txt", "\\\\server\\share\\file", "\\\\?\\C:\\file", "work/../read/input.txt", "work/file:stream", "work\\input.txt"])("rejects unsafe request %j", async (target) => {
    const a = await f.issue(); await expect(f.harness.policy.evaluate(a, fileRequest(a, target))).rejects.toThrow();
  });
  it("rejects prefix collisions, authority metadata, unapproved writes/deletes and extra command fields", async () => {
    const a = await f.issue();
    await mkdir(path.join(f.root, "project-a-collision"));
    for (const request of [fileRequest(a, path.join(f.root, "project-a-collision/file")), fileRequest(a, ".ai-office/project.json"),
      fileRequest(a, "read/input.txt", "WRITE"), fileRequest(a, "work/existing.txt", "DELETE"),
      { ...fileRequest(a, "read/input.txt"), executable: "cmd.exe" },
      { ...fileRequest(a, "work/existing.txt", "WRITE"), attemptGeneration: 2 }]) {
      await expect(f.harness.policy.evaluate(a, request)).rejects.toThrow();
    }
  });
  it("rejects an actual junction escape and hard-linked file", async () => {
    const a = await f.issue();
    await symlink(path.join(f.b, "read"), path.join(f.a, "work/escape"), "junction");
    await link(path.join(f.b, "read/input.txt"), path.join(f.a, "work/hard.txt"));
    await expect(f.harness.policy.evaluate(a, fileRequest(a, "work/escape/input.txt"))).rejects.toThrow();
    await expect(f.harness.policy.evaluate(a, fileRequest(a, "work/hard.txt"))).rejects.toThrow();
  });
});
