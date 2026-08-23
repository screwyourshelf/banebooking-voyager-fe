import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";
import { E2E_BACKEND_ORIGIN, E2E_TENANT_SLUG } from "./environment";

export type DevelopmentProfile = "admin" | "medlem" | "utvidet";

type DevelopmentLoginResponse = {
  accessToken: string;
};

type BookingMutationResponse = {
  bookingId?: string;
};

type ClubResponse = {
  feedSynligAntallDager: number;
  feedUrl?: string;
  kontaktEpost?: string;
  latitude?: number;
  longitude?: number;
  navn: string;
  nettside?: string | null;
};

type ClubUpdateRequest = {
  feedSynligAntallDager: number;
  feedUrl?: string;
  kontaktEpost?: string;
  latitude?: number;
  longitude?: number;
  navn: string;
  nettside?: string;
};

type TrackedBooking = {
  bookingId: string;
  bearerToken: string;
};

type ClubCleanup = {
  original: ClubResponse;
  restoreToken: string;
};

export type E2EHarness = {
  preserveClubSettings(): Promise<ClubResponse>;
  signIn(page: Page, profile: DevelopmentProfile): Promise<void>;
  tenantPath(path?: string): string;
};

const developmentProfileLabels: Record<DevelopmentProfile, string> = {
  admin: "Klubbadministrator",
  medlem: "Medlem",
  utvidet: "Utvidet bruker",
};

export const test = base.extend<{ e2e: E2EHarness }>({
  e2e: async ({ context, request }, provideFixture) => {
    const trackedBookings = new Map<string, TrackedBooking>();
    const cleanupState: { club: ClubCleanup | null } = { club: null };

    await context.route("**/api/**", async (route) => {
      const interceptedRequest = route.request();
      const headers = interceptedRequest.headers();
      const bearerToken = readBearerToken(headers.authorization);

      if (bearerToken) headers.authorization = `DevelopmentBearer ${bearerToken}`;

      if (!isTrackedBookingMutation(interceptedRequest.method(), interceptedRequest.url())) {
        await route.continue({ headers });
        return;
      }

      const response = await route.fetch({ headers });
      if (response.ok() && bearerToken) {
        if (interceptedRequest.method() === "POST") {
          const payload = (await response.json()) as BookingMutationResponse;
          if (payload.bookingId) {
            trackedBookings.set(payload.bookingId, {
              bookingId: payload.bookingId,
              bearerToken,
            });
          }
        } else {
          const bookingId = bookingIdFromDeleteUrl(interceptedRequest.url());
          if (bookingId) trackedBookings.delete(bookingId);
        }
      }
      await route.fulfill({ response });
    });

    await provideFixture({
      async preserveClubSettings() {
        if (cleanupState.club) return cleanupState.club.original;

        const restoreToken = await signInForCleanup(request, "admin");
        const response = await request.get(
          `${E2E_BACKEND_ORIGIN}/api/klubb/${encodeURIComponent(E2E_TENANT_SLUG)}`
        );
        expect(response.ok(), "E2E-harnessen må kunne lese klubbinnstillinger").toBe(true);
        const original = (await response.json()) as ClubResponse;
        cleanupState.club = { original, restoreToken };
        return original;
      },
      async signIn(page, profile) {
        await page.goto(buildTenantPath("login"));
        await page.getByText("Testinnlogging").click();
        await page
          .getByRole("button", { name: developmentProfileLabels[profile], exact: true })
          .click();
        await expect(page.getByRole("heading", { level: 1, name: "Book bane" })).toBeVisible();
      },
      tenantPath(path = "") {
        return buildTenantPath(path);
      },
    });

    for (const tracked of trackedBookings.values()) {
      const response = await request.delete(
        `${E2E_BACKEND_ORIGIN}/api/klubb/${encodeURIComponent(E2E_TENANT_SLUG)}/bookinger/${encodeURIComponent(tracked.bookingId)}`,
        { headers: developmentAuthorization(tracked.bearerToken) }
      );
      expect(
        response.ok() || response.status() === 404,
        `E2E-harnessen må rydde booking ${tracked.bookingId}`
      ).toBe(true);
    }

    if (cleanupState.club) {
      const response = await request.put(
        `${E2E_BACKEND_ORIGIN}/api/klubb/${encodeURIComponent(E2E_TENANT_SLUG)}`,
        {
          data: toClubUpdateRequest(cleanupState.club.original),
          headers: developmentAuthorization(cleanupState.club.restoreToken),
        }
      );
      expect(response.ok(), "E2E-harnessen må gjenopprette klubbinnstillingene").toBe(true);
    }
  },
});

export { expect };

async function signInForCleanup(request: APIRequestContext, profile: DevelopmentProfile) {
  const response = await request.post(`${E2E_BACKEND_ORIGIN}/api/dev-auth/login`, {
    data: { profile },
  });
  expect(response.ok(), `E2E-harnessen må kunne hente ${profile}-token`).toBe(true);
  const payload = (await response.json()) as DevelopmentLoginResponse;
  return payload.accessToken;
}

function developmentAuthorization(token: string) {
  return { Authorization: `DevelopmentBearer ${token}` };
}

function readBearerToken(authorization: string | undefined) {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isTrackedBookingMutation(method: string, url: string) {
  if (method !== "POST" && method !== "DELETE") return false;
  const pathname = new URL(url).pathname;
  return /\/api\/klubb\/[^/]+\/bookinger(?:\/[^/]+)?$/.test(pathname);
}

function bookingIdFromDeleteUrl(url: string) {
  return new URL(url).pathname.match(/\/bookinger\/([^/]+)$/)?.[1] ?? null;
}

function toClubUpdateRequest(club: ClubResponse): ClubUpdateRequest {
  return {
    navn: club.navn,
    kontaktEpost: club.kontaktEpost,
    nettside: club.nettside ?? undefined,
    latitude: club.latitude,
    longitude: club.longitude,
    feedUrl: club.feedUrl,
    feedSynligAntallDager: club.feedSynligAntallDager,
  };
}

function buildTenantPath(path = "") {
  const suffix = path.replace(/^\/+|\/+$/g, "");
  return `./${E2E_TENANT_SLUG}${suffix ? `/${suffix}` : ""}`;
}
