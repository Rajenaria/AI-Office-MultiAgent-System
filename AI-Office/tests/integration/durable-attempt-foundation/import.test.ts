import { expect, it, vi } from "vitest";

vi.mock("node:sqlite", () => ({ DatabaseSync: vi.fn(() => { throw new Error("Unexpected database open on import"); }) }));
vi.mock("node:fs", () => Object.fromEntries(["closeSync", "lstatSync", "mkdirSync", "mkdtempSync", "openSync", "readFileSync", "realpathSync", "writeFileSync"]
  .map((name) => [name, vi.fn(() => { throw new Error("Unexpected filesystem operation on import"); })])));
vi.mock("node:child_process", () => ({ spawn: vi.fn(), fork: vi.fn(), exec: vi.fn() }));
it("all six foundation modules import without filesystem, DB, process or timer activation", async () => {
  const timeout = vi.spyOn(globalThis, "setTimeout"), interval = vi.spyOn(globalThis, "setInterval");
  try {
    await import("../../../src/server/attempt-control/repository.js");
    const sqlite = await import("node:sqlite"), fs = await import("node:fs"), children = await import("node:child_process");
    expect(sqlite.DatabaseSync).not.toHaveBeenCalled();
    for (const key of ["lstatSync", "mkdirSync", "mkdtempSync", "openSync", "readFileSync", "writeFileSync"] as const)
      expect(fs[key]).not.toHaveBeenCalled();
    expect(children.spawn).not.toHaveBeenCalled(); expect(children.fork).not.toHaveBeenCalled(); expect(children.exec).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled(); expect(interval).not.toHaveBeenCalled();
  } finally { timeout.mockRestore(); interval.mockRestore(); }
});
