import { describe, expect, it, vi } from "vitest";

import { createSentryBrowserObservability, sanitizeSentryEvent } from "./sentry-browser.client";

function createSentrySdk() {
  const scope = { setContext: vi.fn() };
  return {
    scope,
    sdk: {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      init: vi.fn(),
      withScope: vi.fn((callback: (value: typeof scope) => void) => callback(scope)),
    },
  };
}

describe("Sentry browser observability", () => {
  it("initialiserer bare produksjonsruntime med en konfigurert DSN", () => {
    const disabled = createSentrySdk();
    createSentryBrowserObservability(
      { dsn: "https://public@example.test/1", enabled: false, environment: "development" },
      disabled.sdk
    ).captureMessage("ignored");

    const missingDsn = createSentrySdk();
    createSentryBrowserObservability(
      { dsn: "  ", enabled: true, environment: "production" },
      missingDsn.sdk
    ).captureException(new Error("ignored"));

    expect(disabled.sdk.init).not.toHaveBeenCalled();
    expect(disabled.sdk.captureMessage).not.toHaveBeenCalled();
    expect(missingDsn.sdk.init).not.toHaveBeenCalled();
    expect(missingDsn.sdk.captureException).not.toHaveBeenCalled();
  });

  it("slår av bruker-, header-, body-, query- og variabelinnsamling", () => {
    const { sdk } = createSentrySdk();
    createSentryBrowserObservability(
      { dsn: " https://public@example.test/1 ", enabled: true, environment: "production" },
      sdk
    );

    expect(sdk.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://public@example.test/1",
        environment: "production",
        dataCollection: expect.objectContaining({
          userInfo: false,
          cookies: false,
          httpHeaders: { request: false, response: false },
          httpBodies: [],
          urlQueryParams: false,
          stackFrameVariables: false,
        }),
      })
    );
  });

  it("sender bare filtrert, hendelseslokal kontekst til Sentry", () => {
    const { scope, sdk } = createSentrySdk();
    const observability = createSentryBrowserObservability(
      { dsn: "https://public@example.test/1", enabled: true, environment: "production" },
      sdk
    );

    observability.captureMessage("Storage unavailable", {
      accessToken: "hemmelig",
      detail: "x".repeat(300),
      operation: "les",
    });

    expect(scope.setContext).toHaveBeenCalledWith("banebooking", {
      detail: "x".repeat(250),
      operation: "les",
    });
    expect(sdk.captureMessage).toHaveBeenCalledWith("Storage unavailable");
  });

  it("fjerner sensitiv nested kontekst og queryparametere før sending", () => {
    expect(
      sanitizeSentryEvent({
        user: { email: "bruker@example.test" },
        request: {
          url: "https://booking.example.test/auth/callback?code=hemmelig#fragment",
          headers: { authorization: "Bearer hemmelig" },
          data: { password: "hemmelig" },
        },
        contexts: {
          app: {
            responseBody: "hemmelig",
            routeId: "/[[slug=tenant]]/(public)/login",
            sessionId: "hemmelig",
          },
        },
      })
    ).toEqual({
      request: { url: "https://booking.example.test/auth/callback" },
      contexts: { app: { routeId: "/[[slug=tenant]]/(public)/login" } },
    });
  });

  it("fjerner queryparametere fra navigasjons- og nettverksbreadcrumbs", () => {
    const { sdk } = createSentrySdk();
    createSentryBrowserObservability(
      { dsn: "https://public@example.test/1", enabled: true, environment: "production" },
      sdk
    );
    const options = sdk.init.mock.calls[0][0];

    expect(
      options.beforeBreadcrumb?.({
        category: "navigation",
        data: {
          from: "/login?returnTo=%2Fhemmelig",
          to: "https://booking.example.test/auth/callback?code=hemmelig#fragment",
        },
      })
    ).toEqual({
      category: "navigation",
      data: {
        from: "/login",
        to: "https://booking.example.test/auth/callback",
      },
    });
  });
});
