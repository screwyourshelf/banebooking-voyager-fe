import type { Page } from "@playwright/test";
import { expect, test, type DevelopmentProfile } from "./harness";
import {
  installStylingReferenceFixtures,
  STYLING_REFERENCE_TIME,
} from "./styling-reference-fixtures";

type Theme = "dark" | "light";
type Viewport = { height: number; width: number };

type BrowserDiagnostics = {
  messages: string[];
};

const mobile: Viewport = { height: 844, width: 390 };
const desktop: Viewport = { height: 1000, width: 1440 };

test.use({ locale: "nb-NO", timezoneId: "Europe/Oslo" });

test("anonymous login — mobile, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    theme: "light",
    viewport: mobile,
  });
  await page.goto(e2e.tenantPath("login"));

  await expectProductSurface(page, "Logg inn");
  await expectStableScreenshot(page, diagnostics, "anonymous-login-mobile-light.png");
});

test("public terms — desktop, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    theme: "dark",
    viewport: desktop,
  });
  await page.goto(e2e.tenantPath("vilkaar"));

  await expectProductSurface(page, "Vilkår for bruk");
  await expectStableScreenshot(page, diagnostics, "public-terms-desktop-dark.png");
});

test("member account — desktop, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "light",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath("minside"));

  await expectProductSurface(page, "Min side");
  await expectStableScreenshot(page, diagnostics, "member-account-desktop-light.png");
});

test("club administrator — mobile, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    capabilities: ["klubb:admin", "medlemskap:aktiver"],
    profile: "admin",
    theme: "dark",
    viewport: mobile,
  });
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/klubb"));

  await expectProductSurface(page, "Klubbinnstillinger");
  await page.getByRole("tab", { name: "Medlemskap" }).click();
  await expect(page.getByText("42 av 57 medlemmer")).toBeVisible();
  await expectStableScreenshot(page, diagnostics, "club-administrator-mobile-dark.png");
});

test("member booking collection — desktop, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "dark",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath());

  await expectProductSurface(page, "Book bane");
  await expect(page.getByRole("heading", { name: "2 ledige tider" })).toBeVisible();
  await expectStableScreenshot(page, diagnostics, "member-booking-collection-desktop-dark.png");
});

test("member booking calendar — mobile, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "light",
    viewport: mobile,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath());

  await expectProductSurface(page, "Book bane");
  const trigger = page.getByRole("button", { name: "Velg annen dato" });
  await trigger.click();
  await expect(page.locator('[data-ui-primitive="date-popover"]')).toBeVisible();
  await expect(page.locator('[data-part="day"][data-value="2026-08-23"]')).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expectStableScreenshot(page, diagnostics, "member-booking-calendar-mobile-light.png");

  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-part="day"][data-value="2026-08-24"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-ui-primitive="date-popover"]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expectNoBrowserDiagnostics(diagnostics);
});

test("member booking rules dialog — desktop, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "light",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath());

  await expectProductSurface(page, "Book bane");
  const trigger = page.getByRole("button", { name: "Bookingregler" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Bookingregler for Senterbanen" })).toBeVisible();
  const close = page.getByRole("button", { name: "Lukk dialog" });
  await expect(close).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expectStableScreenshot(page, diagnostics, "member-booking-rules-dialog-desktop-light.png");

  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expectNoBrowserDiagnostics(diagnostics);
});

test("user administrator editor and select — desktop, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    capabilities: ["brukere:admin", "brukere:lese"],
    profile: "admin",
    theme: "dark",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/brukere"));

  await expectProductSurface(page, "Brukere");
  await expect(page.getByRole("heading", { name: "2 brukere" })).toBeVisible();
  await page.getByText("Ola Medlem", { exact: true }).click();
  const editTrigger = page.getByRole("button", { name: "Rediger", exact: true });
  await editTrigger.click();
  await expect(page.getByRole("dialog", { name: "Rediger bruker" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alle brukere" })).toBeFocused();

  const roleSelect = page.getByRole("combobox", { name: "Rolle" });
  await roleSelect.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox", { name: "Rolle" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectStableScreenshot(
    page,
    diagnostics,
    "user-administrator-editor-select-desktop-dark.png"
  );

  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox", { name: "Rolle" })).toHaveCount(0);
  await expect(roleSelect).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(editTrigger).toBeFocused();
  await expectNoBrowserDiagnostics(diagnostics);
});

test("announcement rich-text editor — mobile, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    capabilities: ["kunngjøring:admin"],
    profile: "admin",
    theme: "light",
    viewport: mobile,
  });
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/kunngjøringer"));

  await expectProductSurface(page, "Kunngjøringer");
  const trigger = page.getByRole("button", { name: "Ny kunngjøring" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Opprett kunngjøring" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alle kunngjøringer" })).toBeFocused();
  await expect(page.locator('[data-ui="editor"][data-state="ready"]')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectStableScreenshot(page, diagnostics, "announcement-editor-mobile-light.png");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expectNoBrowserDiagnostics(diagnostics);
});

test("statistics court usage — desktop, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    capabilities: ["statistikk:lese"],
    profile: "admin",
    theme: "dark",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/statistikk"));

  await expectProductSurface(page, "Statistikk");
  await expectStatisticsReady(page);
  await expectStableScreenshot(page, diagnostics, "statistics-court-usage-desktop-dark.png");
});

test("statistics members — mobile, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    capabilities: ["statistikk:lese"],
    profile: "admin",
    theme: "light",
    viewport: mobile,
  });
  await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/statistikk"));

  await expectProductSurface(page, "Statistikk");
  await expectStatisticsReady(page);
  const usageTab = page.getByRole("tab", { name: "Banebruk" });
  await usageTab.focus();
  await page.keyboard.press("ArrowRight");
  const membersTab = page.getByRole("tab", { name: "Medlemmer" });
  await expect(membersTab).toBeFocused();
  await expect(membersTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Aktive brukere")).toBeVisible();
  await expectStableScreenshot(page, diagnostics, "statistics-members-mobile-light.png");

  await page.keyboard.press("ArrowLeft");
  await expect(usageTab).toBeFocused();
  await expect(usageTab).toHaveAttribute("aria-selected", "true");
  await expectNoBrowserDiagnostics(diagnostics);
});

async function prepareReferenceSurface(
  page: Page,
  options: {
    capabilities?: readonly string[];
    profile?: DevelopmentProfile;
    theme: Theme;
    viewport: Viewport;
  }
) {
  const diagnostics = captureBrowserDiagnostics(page);
  await page.clock.setFixedTime(STYLING_REFERENCE_TIME);
  await page.setViewportSize(options.viewport);
  await page.emulateMedia({ colorScheme: options.theme, reducedMotion: "reduce" });
  await page.addInitScript((theme: Theme) => {
    localStorage.setItem("vite-ui-theme", theme);
  }, options.theme);
  await installStylingReferenceFixtures(page, options);
  return diagnostics;
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

async function expectProductSurface(page: Page, title: string) {
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await expectNoHorizontalOverflow(page);
}

async function expectStatisticsReady(page: Page) {
  await expect(page.getByText("44,5 t")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Linjediagram over bookede timer per måned" })
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Stolpediagram over bookede timer per klokkeslett" })
  ).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        body: document.body.scrollWidth <= document.body.clientWidth,
        document: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      }))
    )
    .toEqual({ body: true, document: true });
}

async function expectStableScreenshot(page: Page, diagnostics: BrowserDiagnostics, name: string) {
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
  await expectNoBrowserDiagnostics(diagnostics);
}

function captureBrowserDiagnostics(page: Page): BrowserDiagnostics {
  const diagnostics: BrowserDiagnostics = { messages: [] };
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      diagnostics.messages.push(`console.${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.messages.push(`pageerror: ${error.message}`);
  });
  return diagnostics;
}

async function expectNoBrowserDiagnostics(diagnostics: BrowserDiagnostics) {
  await expect.poll(() => diagnostics.messages).toEqual([]);
}
