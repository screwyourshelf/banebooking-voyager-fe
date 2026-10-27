import type { HandleClientError } from "@sveltejs/kit/hooks";
import { beforeEach, describe, expect, it, vi } from "vitest";

const browserStartup = vi.hoisted(() => ({
  assetRecoveryActive: false,
  captureException: vi.fn(),
  initialize: vi.fn(async () => undefined),
}));

vi.mock("#lib/platform/app/browser-startup.client.ts", () => ({
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
      kind: "unknown",
      error,
      event: {
        route: { id: "/[[slug=tenant]]/(protected)/bookinger" },
        params: {},
        url: new URL("https://example.test/bookinger"),
      },
    } as Parameters<HandleClientError>[0]);

    expect(browserStartup.captureException).toHaveBeenCalledWith(error, {
      routeId: "/[[slug=tenant]]/(protected)/bookinger",
      source: "sveltekit.client",
      status: 500,
    });
  });

  it.each(["app", "framework"] as const)(
    "rapporterer ikke forventede %s-feil som uventede",
    (kind) => {
      handleError({
        kind,
        error: { status: 404, message: "Ikke funnet" },
        event: {
          route: { id: null },
          params: {},
          url: new URL("https://example.test/ukjent"),
        },
      } as Parameters<HandleClientError>[0]);

      expect(browserStartup.captureException).not.toHaveBeenCalled();
    }
  );

  it("rapporterer ikke routefeilen som recoveryen allerede håndterer", () => {
    browserStartup.assetRecoveryActive = true;

    handleError({
      kind: "unknown",
      error: new TypeError("Failed to fetch dynamically imported module"),
      event: {
        route: { id: "/[[slug=tenant]]/(public)/login" },
        params: {},
        url: new URL("https://example.test/login"),
      },
    } as Parameters<HandleClientError>[0]);

    expect(browserStartup.captureException).not.toHaveBeenCalled();
  });
});
