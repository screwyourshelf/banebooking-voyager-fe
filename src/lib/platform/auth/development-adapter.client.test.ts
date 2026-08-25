// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createDevelopmentAuthAdapter } from "./development-adapter.client";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("development auth adapter", () => {
  it("eksponerer utviklingstoken med backendens DevelopmentBearer-scheme", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "development-token",
          expiresAt: "2099-08-25T14:00:00Z",
          user: {
            id: "development-user",
            email: "medlem@example.no",
            name: "Medlem",
            developmentProfile: "medlem",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const adapter = createDevelopmentAuthAdapter({ fetch: fetchMock, enabled: true });

    await adapter.signInAsDevelopmentProfile?.("medlem");

    await expect(adapter.getAuthorization()).resolves.toEqual({
      scheme: "DevelopmentBearer",
      token: "development-token",
    });

    await adapter.signOut();
  });
});
