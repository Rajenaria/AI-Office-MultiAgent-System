import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: ".", testMatch: "**/*.spec.ts", workers: 1, retries: 0, timeout: 90_000,
  expect: { timeout: 10_000 }, reporter: "list", outputDir: "./artifacts/results",
  use: { browserName: "chromium", channel: "chrome", headless: true, trace: "off", video: "off", screenshot: "off",
    viewport: { width: 1280, height: 960 } } });
