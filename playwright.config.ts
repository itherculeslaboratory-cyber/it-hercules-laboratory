import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.IHL_WEB_PORT ?? 3000);
const apiPort = Number(process.env.IHL_API_PORT ?? 8000);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        process.platform === "win32"
          ? `docker compose up api`
          : `python -m uvicorn apps.api.main:app --host 127.0.0.1 --port ${apiPort}`,
      url: `http://127.0.0.1:${apiPort}/health`,
      reuseExistingServer: !process.env.CI,
      cwd: ".",
      env: {
        ...process.env,
        IHL_DEV_EXPOSE_MAGIC_TOKEN: "1",
      },
    },
    {
      command: "npm run dev",
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: !process.env.CI,
      cwd: "apps/web",
      env: {
        ...process.env,
        IHL_API_URL: `http://127.0.0.1:${apiPort}`,
      },
    },
  ],
});
