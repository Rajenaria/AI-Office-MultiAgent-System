import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request as httpRequest } from "node:http";
import { demoFixture } from "../../src/demo/fixture.js";
import { e2eFixture, launch } from "./helpers.js";

async function connect(page: Page, secret: string) {
  try { await page.getByLabel("Launch passphrase").fill(secret); await page.getByRole("button", { name: "Connect session", exact: true }).click(); }
  catch { throw new Error("Private session entry failed"); }
  await expect(page.getByTestId("connection-status")).toHaveText("CONNECTED");
  await expect(page.getByText("Session: authenticated", { exact: true })).toBeVisible();
}
async function open(page: Page, folder: string) {
  await page.getByLabel("Disposable project folder").fill(folder); await page.getByRole("button", { name: "Open project", exact: true }).click();
}

test("real shell initializes A/B, rejects late A, detects disconnect and recovers persisted state after process restarts", async ({ page }) => {
  const f = await e2eFixture(); let app: Awaited<ReturnType<typeof launch>> | undefined;
  const browserErrors: string[] = []; page.on("pageerror", (error) => browserErrors.push(error.name));
  const skillRequests: string[] = [];
  page.on("request", (request) => { const route = new URL(request.url()).pathname; if (/^\/api\/(skills?|runtimes?|providers?)(\/|$)/.test(route)) skillRequests.push(route); });
  try {
    app = await launch(f); await page.goto(app.url); await connect(page, app.secret);
    const skills = page.getByTestId("skill-panel");
    await expect(skills).toContainText("No verified skill inventory is available");
    await expect(skills).toContainText("Foundation skill execution: OFF");
    await expect(skills.getByRole("button")).toHaveCount(0);
    await expect(skills.getByTestId("skill-record")).toHaveCount(0);
    const headers = await app.headers();
    const setup = async (folder: string, content: string) => {
      await open(page, folder);
      await expect(page.getByRole("button", { name: "Confirm metadata initialization", exact: true })).toBeVisible();
      expect(await readdir(folder)).toEqual([]);
      await page.getByRole("button", { name: "Confirm metadata initialization", exact: true }).click();
      await expect(page.getByTestId("lifecycle")).toHaveText("LOADING");
      await page.getByRole("button", { name: "Confirm state initialization", exact: true }).click();
      await expect(page.getByTestId("lifecycle")).toHaveText("READY");
      const projectId = (await page.getByTestId("project-id").innerText()).trim();
      await expect(skills.getByTestId("skill-project-scope")).toContainText(projectId);
      await expect(skills.getByTestId("skill-record")).toHaveCount(0);
      const current = await (await fetch(app!.url + "/api/workspace", { headers })).json() as { view: { binding: unknown } };
      const scope = { projectId, binding: current.view.binding };
      await mkdir(path.join(folder, ".ai-office/brain")); await writeFile(path.join(folder, ".ai-office/brain/fixture.md"), content);
      const response = await fetch(app!.url + "/api/dev/demo/initialize", { method: "POST", headers, body: JSON.stringify({ scope, fixture: demoFixture(projectId, content, content) }) });
      expect(response.status).toBe(200);
      await expect(page.getByTestId("agent-card")).toContainText(content);
      await page.getByRole("button", { name: "Read knowledge:fixture v1", exact: true }).click();
      await expect(page.getByTestId("knowledge-result")).toContainText(content);
      await expect(page.getByTestId("record-counts")).toContainText("1 task(s) · 1 event(s)");
      return { projectId, scope };
    };
    const a = await setup(f.a, "A_ONLY");
    const b = await setup(f.b, "B_ONLY");
    expect(a.projectId).not.toBe(b.projectId);
    await expect(page.getByRole("main")).not.toContainText("A_ONLY");
    await open(page, f.a); await expect(page.getByTestId("project-id")).toHaveText(a.projectId);
    await expect(page.getByTestId("agent-card")).toContainText("A_ONLY");

    // Delay an actual backend response, not a fabricated API payload.
    let release!: () => void, arrived!: () => void;
    const held = new Promise<void>((resolve) => { arrived = resolve; });
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route("**/api/state/snapshot", async (route) => {
      const body = route.request().postDataJSON() as { projectId?: string };
      if (body.projectId !== a.projectId) { await route.continue(); return; }
      const response = await route.fetch(); arrived(); await gate;
      await route.fulfill({ response }).catch(() => undefined);
    }, { times: 1 });
    await held;
    await open(page, f.b);
    // The old A content disappears before B is attached.
    await expect(page.getByRole("main")).not.toContainText("A_ONLY");
    await expect(page.getByTestId("project-id")).toHaveText(b.projectId);
    await expect(skills).not.toContainText(a.projectId);
    await expect(skills.getByTestId("skill-project-scope")).toContainText(b.projectId);
    release(); await page.unroute("**/api/state/snapshot");
    await expect(page.getByTestId("agent-card")).toContainText("B_ONLY");
    await expect(page.getByRole("main")).not.toContainText("A_ONLY");

    // Changed knowledge never retains effective approval or old content.
    await writeFile(path.join(f.b, ".ai-office/brain/fixture.md"), "B_CHANGED");
    await page.getByRole("button", { name: "Read knowledge:fixture v1", exact: true }).click();
    await expect(page.getByTestId("knowledge-result")).toContainText("CHANGED / UNVERIFIED");
    await writeFile(path.join(f.b, ".ai-office/brain/fixture.md"), "B_ONLY");
    await app.stopBackend();
    await expect(page.getByTestId("connection-status")).toHaveText("DISCONNECTED");
    await expect(page.getByTestId("freshness")).toHaveText("disconnected", { ignoreCase: true });
    await expect(page.getByText("Last-known project data; backend state is not currently confirmed.")).toBeVisible();
    await expect(skills.getByTestId("skill-project-scope")).toContainText("NOT VERIFIED");
    await expect(skills).not.toContainText(b.projectId);
    const restarted = await app.startBackend(); expect(Number(restarted.backendPid)).not.toBe(app.backendPid);
    await expect(page.getByTestId("connection-status")).toHaveText("SESSION_INVALID");
    await connect(page, app.secret); await expect(page.getByTestId("lifecycle")).toHaveText("DETACHED");
    for (const [folder, projectId, content] of [[f.b, b.projectId, "B_ONLY"], [f.a, a.projectId, "A_ONLY"]]) {
      await open(page, folder!); await expect(page.getByTestId("project-id")).toHaveText(projectId!);
      await expect(page.getByTestId("lifecycle")).toHaveText("READY");
      await expect(page.getByTestId("agent-card")).toContainText(content!);
      await expect(page.getByTestId("record-counts")).toContainText("1 task(s) · 1 event(s)");
    }
    // A browser reload must bootstrap a new in-memory client, with no stored tokens.
    await page.reload(); await expect(page.getByLabel("Launch passphrase")).toBeVisible();
    await connect(page, app.secret); await expect(page.getByTestId("project-id")).toHaveText(a.projectId);
    expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
    // Restart both launcher-owned processes using the same fixture storage.
    const oldFrontendPid = app.frontendPid, oldBackendPid = app.backendPid;
    await app.close(); app = await launch(f);
    expect(app.frontendPid).not.toBe(oldFrontendPid); expect(app.backendPid).not.toBe(oldBackendPid);
    await page.goto(app.url); await connect(page, app.secret);
    await open(page, f.b); await expect(page.getByTestId("project-id")).toHaveText(b.projectId);
    await expect(page.getByTestId("record-counts")).toContainText("1 task(s) · 1 event(s)");
    await open(page, f.a); await expect(page.getByTestId("project-id")).toHaveText(a.projectId);
    await page.getByRole("button", { name: "Read knowledge:fixture v1", exact: true }).click();
    await expect(page.getByTestId("knowledge-result")).toContainText("A_ONLY");
    await open(page, f.a); await expect(page.getByTestId("project-id")).toHaveText(a.projectId);
    await page.getByRole("button", { name: "Read knowledge:fixture v1", exact: true }).click();
    await expect(page.getByTestId("knowledge-result")).toContainText("A_ONLY");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const artifacts = fileURLToPath(new URL("./artifacts/screenshots/", import.meta.url)); await mkdir(artifacts, { recursive: true });
    await page.screenshot({ path: path.join(artifacts, "shell-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 960 });
    await page.screenshot({ path: path.join(artifacts, "shell-ready.png"), fullPage: true });
    expect(browserErrors).toEqual([]); expect(app.output).not.toContain(app.secret);
    expect(app.output).not.toContain(createHash("sha256").update(app.secret).digest("hex"));
    await page.getByRole("button", { name: "Close workspace", exact: true }).click();
    await expect(page.getByTestId("lifecycle")).toHaveText("DETACHED");
    await expect(page.getByTestId("agent-card")).toHaveCount(0);
    await expect(skills.getByTestId("skill-project-scope")).toContainText("NOT VERIFIED");
    expect(skillRequests).toEqual([]);
  } finally { await app?.close(); await f.cleanup(); }
});

test("proxy keeps Host/Origin/session/fixture boundaries and serves only frontend sources", async ({ page }) => {
  const f = await e2eFixture(); const other = await e2eFixture(); let app: Awaited<ReturnType<typeof launch>> | undefined;
  try {
    app = await launch(f, false); const headers = await app.headers();
    for (const route of ["/api/state/initialize", "/api/workspace/open"]) {
      const response = await fetch(app.url + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); expect(response.status).toBe(403);
      expect((await fetch(app.url + route, { method: "POST", headers: { ...headers, Origin: "http://foreign.invalid" }, body: "{}" })).status).toBe(403);
    }
    const rawStatus = (custom: Record<string, string>) => new Promise<number>((resolve, reject) => {
      const request = httpRequest(app!.url + "/api/workspace", { headers: { ...headers, ...custom } }, (response) => { response.resume(); response.on("end", () => resolve(response.statusCode!)); });
      request.on("error", reject); request.end();
    });
    expect(await rawStatus({ Host: "foreign.invalid" })).toBe(403);
    expect(await rawStatus({ "X-Forwarded-Host": "127.0.0.1" })).toBe(403);
    for (const route of ["/src/server/index.ts", "/docs/AI_OFFICE_CURRENT_BASELINE.md", "/@fs/C:/Windows/win.ini", "/.env"]) expect((await fetch(app.url + route)).status).toBe(404);
    expect((await fetch(app.url + "/api/dev/demo/initialize", { method: "POST", headers, body: "{}" })).status).toBe(404);
    await page.goto(app.url); await connect(page, app.secret); await open(page, other.a);
    await expect(page.getByRole("alert")).toContainText("DISPOSABLE_PROJECT_BOUNDARY_REQUIRED");
    expect(await readdir(other.a)).toEqual([]); await expect(page.getByTestId("project-id")).toHaveText("NONE");
    // Arbitrary DB selectors and execution endpoints remain unavailable.
    expect((await fetch(app.url + "/api/state/snapshot", { method: "POST", headers, body: JSON.stringify({ databasePath: f.a }) })).status).toBe(400);
    for (const route of ["/api/worker/execute", "/api/paid-api/enable", "/api/shell", "/api/skills/discover", "/api/skills/install", "/api/skills/execute", "/api/skills/assign"]) expect((await fetch(app.url + route, { method: "POST", headers, body: "{}" })).status).toBe(404);
    const built = fileURLToPath(new URL("./artifacts/build/", import.meta.url));
    for (const filename of await readdir(path.join(built, "assets"))) expect(await readFile(path.join(built, "assets", filename), "utf8")).not.toContain(app.secret);
  } finally { await app?.close(); await f.cleanup(); await other.cleanup(); }
});
