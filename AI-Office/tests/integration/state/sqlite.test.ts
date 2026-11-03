import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, expect, it } from "vitest";
import path from "node:path";
import { fixture, type Fixture } from "../workspace/helpers.js";

let f: Fixture;
beforeEach(async () => { f = await fixture(); });
afterEach(async () => { await f.cleanup(); });

it("actual Node SQLite supports bound statements, commit, rollback, FK and reopen", () => {
  const filename = path.join(f.root, "smoke.db");
  const db = new DatabaseSync(filename);
  try {
    db.exec("PRAGMA foreign_keys=ON; CREATE TABLE parent(id TEXT PRIMARY KEY); CREATE TABLE child(id TEXT PRIMARY KEY, parent TEXT REFERENCES parent(id)); BEGIN IMMEDIATE");
    db.prepare("INSERT INTO parent VALUES (?)").run("fixture ' ; -- 日本語");
    db.prepare("INSERT INTO child VALUES (?, ?)").run("one", "fixture ' ; -- 日本語");
    db.exec("COMMIT");
    db.exec("BEGIN IMMEDIATE");
    db.prepare("INSERT INTO parent VALUES (?)").run("rolled-back");
    expect(() => db.prepare("INSERT INTO child VALUES (?, ?)").run("invalid", "absent")).toThrow();
    db.exec("ROLLBACK");
    expect(db.prepare("SELECT count(*) AS n FROM parent").get()?.n).toBe(1);
  } finally { db.close(); }
  const reopened = new DatabaseSync(filename, { readOnly: true });
  try {
    expect(reopened.prepare("SELECT parent FROM child WHERE id=?").get("one")?.parent).toBe("fixture ' ; -- 日本語");
    expect(reopened.prepare("PRAGMA quick_check(1)").get()?.quick_check).toBe("ok");
    expect(reopened.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
  } finally { reopened.close(); }
});

it("actual Windows SQLite reports SQLITE_BUSY under an exclusive writer lock", () => {
  const filename = path.join(f.root, "busy.db");
  const first = new DatabaseSync(filename), second = new DatabaseSync(filename);
  try {
    first.exec("CREATE TABLE sample(id INTEGER); BEGIN EXCLUSIVE");
    second.exec("PRAGMA busy_timeout=25");
    try { second.prepare("INSERT INTO sample VALUES (?)").run(1); throw new Error("Expected lock failure"); }
    catch (error) { expect(error).toMatchObject({ errcode: 5 }); }
    first.exec("ROLLBACK");
    second.prepare("INSERT INTO sample VALUES (?)").run(2);
    expect(second.prepare("SELECT id FROM sample").get()?.id).toBe(2);
  } finally { first.close(); second.close(); }
});
