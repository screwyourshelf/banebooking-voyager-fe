import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const ROOT_ORIGIN = "http://127.0.0.1:4175";
const BASE_PATH_ORIGIN = "http://127.0.0.1:4176";
const PRODUCTION_STATIC_SERVER = JSON.stringify(
  fileURLToPath(new URL("./e2e/production-static-server.mjs", import.meta.url))
);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "production-routes.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "root-path",
      use: { baseURL: `${ROOT_ORIGIN}/` },
    },
    {
      name: "base-path",
      use: { baseURL: `${BASE_PATH_ORIGIN}/banebooking/` },
    },
  ],
  webServer: [
    {
      name: "Cloudflare Pages production artifact",
      command: `node ${PRODUCTION_STATIC_SERVER} --root .e2e-build/root --port 4175 --fallback index.html`,
      url: ROOT_ORIGIN,
      reuseExistingServer: false,
      timeout: 30_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    },
    {
      name: "GitHub Pages production artifact",
      command: `node ${PRODUCTION_STATIC_SERVER} --root .e2e-build/base --port 4176 --base /banebooking --fallback 404.html`,
      url: `${BASE_PATH_ORIGIN}/banebooking/`,
      reuseExistingServer: false,
      timeout: 30_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    },
  ],
});
