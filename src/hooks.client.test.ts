import type { HandleClientError } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";

const browserStartup = vi.hoisted(() => ({
  assetRecoveryActive: false,
  captureException: vi.fn(),
  initialize: vi.fn(async () => undefined),
}));

vi.mock("$lib/platform/app/browser-startup.client", () => ({
  getBrowserObservability: () => ({
    captureException: browserStartup.captureException,
    captureMessage: vi.fn(),
  }),
  initializeBrowserAppStartup: browserStartup.initialize,
  isBrowserAssetRecoveryActive: () => browserStartup.assetRecoveryActive,
}));

import { handleError, init } from "./hooks.client";

beforeEach(() => {
  vi.clearAllMocks();
  browserStartup.assetRecoveryActive = false;
});

describe("SvelteKit client hooks", () => {
  it("initialiserer browserplattformen før appen starter", async () => {
    await init();

    expect(browserStartup.initialize).toHaveBeenCalledOnce();
  });

  it("rapporterer uventede navigasjonsfeil uten URL eller feilmelding som kontekst", () => {
    const error = new Error("Uventet feil");
    handleError({
      error,
      event: { route: { id: "/[[slug=tenant]]/(protected)/bookinger" } },
      message: "Internal Error",
      status: 500,
    } as Parameters<HandleClientError>[0]);

    expect(browserStartup.captureException).toHaveBeenCalledWith(error, {
      routeId: "/[[slug=tenant]]/(protected)/bookinger",
      source: "sveltekit.client",
      status: 500,
    });
  });

  it("rapporterer ikke routefeilen som recoveryen allerede håndterer", () => {
    browserStartup.assetRecoveryActive = true;

    handleError({
      error: new TypeError("Failed to fetch dynamically imported module"),
      event: { route: { id: "/[[slug=tenant]]/(public)/login" } },
      message: "Internal Error",
      status: 500,
    } as Parameters<HandleClientError>[0]);

    expect(browserStartup.captureException).not.toHaveBeenCalled();
  });
});
