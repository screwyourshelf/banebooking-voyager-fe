import { defineConfig, devices } from "@playwright/test";
import { E2E_APP_BASE_PATH, E2E_APP_ORIGIN, E2E_TENANT_SLUG } from "./e2e/environment";

// Stylingreferansene eier alle API-svar, inkludert utviklingsinnlogging, og trenger derfor
// bare en lokal frontend. Dette holder snapshots deterministiske og uavhengige av PostgreSQL.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "visual-regressions.spec.ts",
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
  webServer: {
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
});
