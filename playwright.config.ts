import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import {
  E2E_APP_BASE_PATH,
  E2E_APP_ORIGIN,
  E2E_BACKEND_ORIGIN,
  E2E_TENANT_SLUG,
} from "./e2e/environment";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: "production-routes.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `${E2E_APP_ORIGIN}${E2E_APP_BASE_PATH}/`,
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      name: "development backend",
      command:
        "dotnet run --no-launch-profile --project Banebooking.Api --urls http://127.0.0.1:5015",
      cwd: fileURLToPath(new URL("../backend", import.meta.url)),
      env: { ASPNETCORE_ENVIRONMENT: "Development" },
      url: `${E2E_BACKEND_ORIGIN}/api/health/db`,
      reuseExistingServer: true,
      timeout: 120_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    },
    {
      name: "SvelteKit frontend",
      command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
      env: {
        VITE_BASE_PATH: E2E_APP_BASE_PATH,
        VITE_DEFAULT_SLUG: E2E_TENANT_SLUG,
      },
      url: `${E2E_APP_ORIGIN}${E2E_APP_BASE_PATH}/${E2E_TENANT_SLUG}`,
      reuseExistingServer: true,
      timeout: 120_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    },
  ],
});
