import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { link, mkdir, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { checkedDescendant, isWithin, validateRoot } from "../../../src/server/workspace/paths.js";
import { hasCode } from "../../../src/server/workspace/errors.js";
import { fixture, initialize, type Fixture } from "./helpers.js";

describe("real Windows paths and containment", () => {
  let f: Fixture;
  beforeEach(async () => { f = await fixture(); });
  afterEach(async () => { await f.cleanup(); });

  it("recognizes spaces, Unicode and casing without changing identity", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    const reopened = await manager.open({ path: f.a.toUpperCase(), expectedGeneration: a.view.generation });
    expect(reopened.identity).toEqual(a.identity);
    const entries = JSON.parse(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).entries;
    expect(entries).toHaveLength(1);
  });

  it.each(["relative/folder", "C:relative", "C:\\", "C:/", "\\\\server\\share\\project", "\\\\?\\C:\\project", "\\\\.\\C:\\project", "C:\\project\\..\\other", "C:\\project\\.\\other", "C:\\project\\file:stream", "C:\\project\\NUL", "C:\\project.\\child", "C:\\project ", "C:\\project\\\\child", "C:\\project\u0000child"])("rejects unsafe root %j", async (input) => {
    await expect(validateRoot(input)).rejects.toMatchObject({ code: "INVALID_ROOT" });
  });

  it("rejects nonexistent paths and files as project roots", async () => {
    await expect(validateRoot(path.join(f.root, "absent"))).rejects.toMatchObject({ code: "INVALID_ROOT" });
    const filename = path.join(f.root, "ordinary.txt"); await writeFile(filename, "unrelated");
    await expect(validateRoot(filename)).rejects.toMatchObject({ code: "INVALID_ROOT" });
    expect(await readFile(filename, "utf8")).toBe("unrelated");
  });

  it("resolves a root junction alias to the same registry entry", async () => {
    const { manager } = await f.start();
    const a = await initialize(manager, f.a);
    const alias = path.join(f.root, "Alias A");
    await symlink(f.a, alias, "junction");
    expect((await validateRoot(alias)).aliasDetected).toBe(true);
    const reopened = await manager.open({ path: alias, expectedGeneration: a.view.generation });
    expect(reopened.identity).toEqual(a.identity);
    expect(JSON.parse(await readFile(path.join(f.dataRoot, "registry.json"), "utf8")).entries).toHaveLength(1);
  });

  it("rejects metadata junction escape without writing to its target", async () => {
    await symlink(f.b, path.join(f.a, ".ai-office"), "junction");
    const { manager } = await f.start();
    await expect(manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readdir(f.b)).toEqual([]);
  });

  it("rejects changed metadata junction after consent", async () => {
    const { manager } = await f.start();
    const pending = await manager.open({ path: f.a, expectedGeneration: 0 });
    await symlink(f.b, path.join(f.a, ".ai-office"), "junction");
    await expect(manager.initialize({ path: f.a, consent: true, consentToken: pending.nextAction!.consentToken, expectedGeneration: 1 })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readdir(f.b)).toEqual([]);
  });

  it("rejects marker file symlinks where the OS permits creation", async (context) => {
    const target = path.join(f.b, "target.json"); await writeFile(target, "do not read or overwrite");
    await mkdir(path.join(f.a, ".ai-office"));
    try { await symlink(target, path.join(f.a, ".ai-office/project.json"), "file"); }
    catch (error) {
      if (hasCode(error, "EPERM") || hasCode(error, "EACCES")) { context.skip("NOT VERIFIED: Windows file symlink creation unavailable"); return; }
      throw error;
    }
    const { manager } = await f.start();
    await expect(manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readFile(target, "utf8")).toBe("do not read or overwrite");
  });

  it("rejects hard-linked project markers", async () => {
    const target = path.join(f.b, "target.json"); await writeFile(target, "unrelated");
    await mkdir(path.join(f.a, ".ai-office")); await link(target, path.join(f.a, ".ai-office/project.json"));
    const { manager } = await f.start();
    await expect(manager.open({ path: f.a, expectedGeneration: 0 })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readFile(target, "utf8")).toBe("unrelated");
  });

  it("rejects prefix collisions and knowledge-reference junction escapes without reading content", async () => {
    const root = await validateRoot(f.a);
    const neighbor = `${f.a}-Backup`; await mkdir(neighbor);
    expect(isWithin(f.a, neighbor)).toBe(false);
    expect(isWithin(f.a, path.join(f.a, "brain"))).toBe(true);
    await symlink(neighbor, path.join(f.a, "brain"), "junction");
    await writeFile(path.join(neighbor, "secret.md"), "fixture only");
    await expect(checkedDescendant(root, "brain/secret.md")).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await expect(checkedDescendant(root, "../Project B/secret.md")).rejects.toMatchObject({ code: "INVALID_ROOT" });
  });

  it("rejects project/app-data overlap", async () => {
    const { manager } = await f.start();
    await expect(manager.open({ path: f.root, expectedGeneration: 0 })).rejects.toMatchObject({ reason: "PROJECT_REGISTRY_OVERLAP" });
    expect(await readdir(f.a)).toEqual([]);
  });

  it.skip("NOT VERIFIED: directory ACL denial/read-only directory under this Windows account; no ACL changes to user folders", () => {});
});
