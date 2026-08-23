import type { Page } from "@playwright/test";
import { expect, test, type DevelopmentProfile } from "./harness";

type Theme = "dark" | "light";

test("anonymous login — mobile, light", async ({ page, e2e }) => {
  await prepareVisualSurface(page, { height: 844, theme: "light", width: 390 });
  await mockStableApplicationData(page);
  await page.goto(e2e.tenantPath("login"));
  await expect(page.getByRole("heading", { level: 1, name: "Logg inn" })).toBeVisible();

  await expectStableScreenshot(page, "anonymous-login-mobile-light.png");
});

test("public terms — desktop, dark", async ({ page, e2e }) => {
  await prepareVisualSurface(page, { height: 1000, theme: "dark", width: 1440 });
  await mockStableApplicationData(page);
  await page.goto(e2e.tenantPath("vilkaar"));
  await expect(page.getByRole("heading", { level: 1, name: "Vilkår for bruk" })).toBeVisible();

  await expectStableScreenshot(page, "public-terms-desktop-dark.png");
});

test("member account — desktop, light", async ({ page, e2e }) => {
  await prepareVisualSurface(page, { height: 1000, theme: "light", width: 1440 });
  await mockStableApplicationData(page, "medlem");
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath("minside"));
  await expect(page.getByRole("heading", { level: 1, name: "Min side" })).toBeVisible();

  await expectStableScreenshot(page, "member-account-desktop-light.png");
});

test("club administrator — mobile, dark", async ({ page, e2e }) => {
  await prepareVisualSurface(page, { height: 844, theme: "dark", width: 390 });
  await mockStableApplicationData(page, "admin");
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/klubb"));
  await expect(page.getByRole("heading", { level: 1, name: "Klubbinnstillinger" })).toBeVisible();

  await expectStableScreenshot(page, "club-administrator-mobile-dark.png");
});

async function prepareVisualSurface(
  page: Page,
  options: { height: number; theme: Theme; width: number }
) {
  await page.setViewportSize({ height: options.height, width: options.width });
  await page.addInitScript((theme: Theme) => {
    localStorage.setItem("vite-ui-theme", theme);
  }, options.theme);
}

async function signInAndOpen(
  page: Page,
  signIn: (page: Page, profile: DevelopmentProfile) => Promise<void>,
  profile: DevelopmentProfile,
  target: string
) {
  await signIn(page, profile);
  await page.goto(target);
}

async function expectStableScreenshot(page: Page, name: string) {
  const visibleIdentity = page.locator('[data-ui="navigation-identity"]:visible');
  await expect(visibleIdentity).toHaveCount(1);
  await expect(visibleIdentity).toContainText("Ås tennisklubb");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#boot")).toHaveCount(0);
  await page.addStyleTag({ content: ".tsqd-parent-container { display: none !important; }" });
  await expect(page).toHaveScreenshot(name, {
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
}

async function mockStableApplicationData(page: Page, profile?: DevelopmentProfile) {
  await page.route(/\/api\/klubb\/aas-tennisklubb(?:\/bruker)?(?:\?.*)?$/, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/bruker") && profile) {
      await route.fulfill({
        json: {
          id: `visual-${profile}`,
          epost: `${profile}@example.test`,
          visningsnavn: profile === "admin" ? "Visuell administrator" : "Visuelt medlem",
          roller: profile === "admin" ? ["KlubbAdmin"] : ["Medlem"],
          vilkårAkseptertDato: "2026-08-23T00:00:00Z",
          vilkårVersjon: "1.0",
          kapabiliteter: profile === "admin" ? ["klubb:admin", "medlemskap:aktiver"] : [],
        },
      });
      return;
    }

    await route.fulfill({
      json: {
        slug: "aas-tennisklubb",
        navn: "Ås tennisklubb",
        kontaktEpost: "post@example.test",
        nettside: "https://example.test",
        latitude: 59.66,
        longitude: 10.77,
        feedUrl: "https://example.test/rss.xml",
        feedSynligAntallDager: 14,
      },
    });
  });
}
