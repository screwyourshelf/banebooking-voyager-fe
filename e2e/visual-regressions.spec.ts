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

test("anonymous login — desktop, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    theme: "dark",
    viewport: desktop,
  });
  await page.goto(e2e.tenantPath("login"));

  await expectProductSurface(page, "Logg inn");
  await expect(page.locator('[data-ui="page"]')).toHaveAttribute("data-layout", "focused");
  await expectStableScreenshot(page, diagnostics, "anonymous-login-desktop-dark.png");
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

test("public news preview and navigation count — mobile, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    newsCount: 3,
    theme: "light",
    viewport: mobile,
  });
  await page.goto(e2e.tenantPath("nyheter"));

  await expectProductSurface(page, "Nyheter");
  await expect(page.getByRole("heading", { name: "3 nyheter" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nyheter, 3 publiserte nyheter" })).toBeVisible();
  await expectStableScreenshot(page, diagnostics, "public-news-preview-mobile-light.png");
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

test("member booking collection — mobile, dark", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "dark",
    viewport: mobile,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath());

  await expectProductSurface(page, "Book bane");
  await expect(page.getByRole("heading", { name: "2 ledige tider" })).toBeVisible();
  await expectStableScreenshot(page, diagnostics, "member-booking-collection-mobile-dark.png");
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

test("member booking limits and times dialog — desktop, light", async ({ page, e2e }) => {
  const diagnostics = await prepareReferenceSurface(page, {
    profile: "medlem",
    theme: "light",
    viewport: desktop,
  });
  await signInAndOpen(page, e2e.signIn, "medlem", e2e.tenantPath());

  await expectProductSurface(page, "Book bane");
  const trigger = page.getByRole("button", { name: "Grenser og tider" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Grenser og tider for Senterbanen" })
  ).toBeVisible();
  const close = page.getByRole("button", { name: "Lukk dialog" });
  await expect(close).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expectStableScreenshot(page, diagnostics, "member-booking-limits-dialog-desktop-light.png");

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
    newsCount?: number;
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

for (const viewport of [mobile, desktop]) {
  for (const history of ["bookings", "blocks"] as const) {
    test(`admin ${history} history scrolls to the last row — ${viewport.width}`, async ({
      page,
      e2e,
    }) => {
      const diagnostics = await prepareReferenceSurface(page, {
        capabilities: ["brukere:admin", "brukere:lese"],
        profile: "admin",
        theme: "light",
        viewport,
      });
      await page.route("**/api/klubb/*/bruker/admin/bruker", (route) =>
        route.fulfill({
          json: [
            {
              id: "history-user",
              epost: "history@example.test",
              visningsnavn: "Historikkbruker",
              roller: ["Medlem"],
              kapabiliteter: ["bruker:seBookinger", "bruker:seSperre"],
              antallAktiveSperrer: 0,
            },
          ],
        })
      );
      const bookings = Array.from({ length: 24 }, (_, index) => ({
        bookingId: `booking-${index}`,
        grenId: "tennis",
        grenNavn: "Tennis",
        baneId: `court-${index}`,
        baneNavn: `Bane ${index + 1}`,
        dato: "2026-06-01",
        startTid: "08:00",
        sluttTid: "09:00",
        erPassert: true,
        kapabiliteter: [],
      }));
      const blocks = Array.from({ length: 24 }, (_, index) => ({
        id: `block-${index}`,
        brukerId: "history-user",
        klubbId: "club",
        klubbNavn: "Ås tennisklubb",
        type: "Booking",
        årsak: `Sperre ${index + 1}`,
        aktivFra: "2026-06-01T08:00:00Z",
        aktivTil: "2026-06-02T08:00:00Z",
        opprettetAv: "Administrator",
        opprettetTidspunkt: "2026-06-01T08:00:00Z",
        opphevtAv: null,
        opphevtTidspunkt: null,
        erAktiv: false,
      }));
      await page.route("**/api/klubb/*/bruker/admin/bruker/history-user/bookinger", (route) =>
        route.fulfill({ json: bookings })
      );
      await page.route("**/api/klubb/*/bruker/admin/bruker/history-user/sperr", (route) =>
        route.fulfill({ json: { brukerId: "history-user", antallAktive: 0, sperrer: blocks } })
      );
      await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/brukere"));
      await page.getByText("Historikkbruker", { exact: true }).click();
      await page
        .getByRole("button", {
          name: history === "bookings" ? "Vis bookinger" : "Vis historikk",
        })
        .click();
      const dialog = page.getByRole("dialog", {
        name: history === "bookings" ? "Bookinger" : "Sperrehistorikk",
        exact: true,
      });
      const content = dialog.locator('[data-ui="editor-dialog"] > [data-part="content"]');
      await expect(
        dialog.getByText(history === "bookings" ? "Bane 1" : "Sperre 1", {
          exact: true,
        })
      ).toBeVisible();
      const backgroundScroll = await page.evaluate(() => window.scrollY);
      const header = dialog.locator('[data-ui="editor-dialog"] > [data-part="header"]');
      const headerTop = await header.evaluate((element) => element.getBoundingClientRect().top);
      async function scrollToBottom() {
        const box = await content.boundingBox();
        if (!box) throw new Error("Dialoginnholdet mangler");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 10_000);
        await expect
          .poll(() => content.evaluate((element) => element.scrollTop))
          .toBeGreaterThan(0);
      }
      await scrollToBottom();
      if (history === "bookings") {
        for (const remaining of [14, 4]) {
          const more = dialog.getByRole("button", { name: `Vis flere (${remaining} gjenstår)` });
          await expect(more).toBeInViewport();
          await more.click();
          await scrollToBottom();
        }
      }
      await expect(
        dialog.getByText(history === "bookings" ? "Bane 24" : "Sperre 24", {
          exact: true,
        })
      ).toBeInViewport();
      expect(await page.evaluate(() => window.scrollY)).toBe(backgroundScroll);
      expect(await header.evaluate((element) => element.getBoundingClientRect().top)).toBe(
        headerTop
      );
      await expectNoHorizontalOverflow(page);
      await dialog.getByRole("button", { name: "Til brukeren" }).click();
      await expect(dialog).toHaveCount(0);
      await expectNoBrowserDiagnostics(diagnostics);
    });
  }
  test(`admin user bookings share the schedule presentation — ${viewport.width}`, async ({
    page,
    e2e,
  }, testInfo) => {
    const diagnostics = await prepareReferenceSurface(page, {
      capabilities: ["brukere:admin", "brukere:lese"],
      profile: "admin",
      theme: "light",
      viewport,
    });
    const users = [
      {
        id: "school-user",
        epost: "school@example.test",
        visningsnavn: "Skolebruker",
        roller: ["Medlem"],
        kapabiliteter: ["bruker:seBookinger"],
        opprettetTid: "2026-05-27T08:00:00Z",
      },
    ];
    const bookings = [
      {
        bookingId: "past",
        dato: "2026-06-01",
        startTid: "08:00",
        sluttTid: "09:00",
        erPassert: true,
      },
      {
        bookingId: "future",
        dato: "2026-08-25",
        startTid: "09:00",
        sluttTid: "10:00",
        erPassert: false,
      },
    ].map((booking) => ({
      ...booking,
      grenId: "tennis",
      grenNavn: "Tennis",
      baneId: "a",
      baneNavn: "Bane A",
      kapabiliteter: [],
    }));
    await page.route("**/api/klubb/*/bruker/admin/bruker", (route) =>
      route.fulfill({ json: users })
    );
    await page.route("**/api/klubb/*/bruker/admin/bruker/school-user/bookinger", (route) =>
      route.fulfill({ json: bookings })
    );
    await page.route("**/api/klubb/*/bookinger/mine*", (route) => {
      const includeHistorical =
        new URL(route.request().url()).searchParams.get("inkluderHistoriske") === "true";
      return route.fulfill({
        json: bookings.filter((booking) => includeHistorical || !booking.erPassert),
      });
    });
    await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/brukere"));
    await page.getByText("Skolebruker", { exact: true }).click();
    await page.getByRole("button", { name: "Vis bookinger" }).click();
    const dialog = page.getByRole("dialog", { name: "Bookinger", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "2 bookinger" })).toBeVisible();
    await expect(dialog.getByRole("switch", { name: "Vis tidligere" })).toBeChecked();
    await expect(dialog.getByRole("button", { name: "Avbestill" })).toHaveCount(0);
    await expect(dialog.locator('[data-ui="collection-row"]')).toHaveCount(2);
    const adminRows = await dialog.locator('[data-ui="collection-row"]').allTextContents();
    await page.screenshot({ path: testInfo.outputPath("admin-bookings.png"), fullPage: true });
    await dialog.getByRole("button", { name: "Til brukeren" }).click();
    await page.goto(e2e.tenantPath("bookinger"));
    await expect(page.getByRole("heading", { name: "Mine bookinger", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "1 booking", exact: true })).toBeVisible();
    await page.getByRole("switch", { name: "Vis tidligere" }).click();
    await expect(page.getByRole("heading", { name: "2 bookinger" })).toBeVisible();
    expect(await page.locator('[data-ui="collection-row"]').allTextContents()).toEqual(adminRows);
    await page.screenshot({ path: testInfo.outputPath("my-bookings.png"), fullPage: true });
    expect(diagnostics.messages).toEqual([]);
  });
}

for (const viewport of [mobile, desktop]) {
  for (const theme of ["light", "dark"] as const) {
    test(`user dialogs share embedded surfaces — ${viewport.width}, ${theme}`, async ({
      page,
      e2e,
    }) => {
      const diagnostics = await prepareReferenceSurface(page, {
        capabilities: ["brukere:admin", "brukere:lese"],
        profile: "admin",
        theme,
        viewport,
      });
      await page.route("**/api/klubb/*/bruker/admin/bruker", (route) =>
        route.fulfill({
          json: [
            {
              id: "dialog-user",
              epost: "ola@example.test",
              visningsnavn: "Ola Medlem",
              roller: ["Medlem"],
              kapabiliteter: [
                "bruker:endreRolle",
                "bruker:endreVisningsnavn",
                "bruker:seBookinger",
                "bruker:seSperre",
                "bruker:opphevSperre",
              ],
              antallAktiveSperrer: 1,
            },
          ],
        })
      );
      await page.route("**/api/klubb/*/bruker/admin/bruker/dialog-user/bookinger", (route) =>
        route.fulfill({
          json: [
            {
              bookingId: "tennis",
              grenId: "tennis",
              grenNavn: "Tennis",
              baneId: "a",
              baneNavn: "Bane A",
              dato: "2026-08-25",
              startTid: "09:00",
              sluttTid: "10:00",
              erPassert: false,
              kapabiliteter: [],
            },
            {
              bookingId: "padel",
              grenId: "padel",
              grenNavn: "Padel",
              baneId: "b",
              baneNavn: "Padel B",
              dato: "2026-08-20",
              startTid: "18:00",
              sluttTid: "19:00",
              erPassert: true,
              kapabiliteter: [],
            },
          ],
        })
      );
      await page.route("**/api/klubb/*/bruker/admin/bruker/dialog-user/sperr", (route) =>
        route.fulfill({
          json: {
            brukerId: "dialog-user",
            antallAktive: 1,
            sperrer: [
              {
                id: "active",
                årsak: "Gjentatt manglende oppmøte",
                erAktiv: true,
                aktivTil: "2026-09-01T08:00:00Z",
              },
              {
                id: "revoked",
                årsak: "Sperre opphevet etter avklaring",
                erAktiv: false,
                aktivTil: null,
                opphevtAv: "Ada Administrasjon",
                opphevtTidspunkt: "2026-08-20T08:00:00Z",
              },
              {
                id: "expired",
                årsak: "Tidligere brudd på bookingreglene",
                erAktiv: false,
                aktivTil: "2026-08-15T08:00:00Z",
              },
            ].map((block) => ({
              brukerId: "dialog-user",
              klubbId: "club",
              klubbNavn: "Ås tennisklubb",
              type: "Booking",
              aktivFra: "2026-08-01T08:00:00Z",
              opprettetAv: "Ada Administrasjon",
              opprettetTidspunkt: "2026-08-01T08:00:00Z",
              opphevtAv: null,
              opphevtTidspunkt: null,
              ...block,
            })),
          },
        })
      );
      await signInAndOpen(page, e2e.signIn, "admin", e2e.tenantPath("admin/brukere"));
      await page.getByText("Ola Medlem", { exact: true }).click();
      for (const [trigger, title, name] of [
        ["Vis bookinger", "Bookinger", "bookings"],
        ["Vis historikk", "Sperrehistorikk", "blocks"],
        ["Rediger", "Rediger bruker", "edit"],
      ]) {
        const opener = page.getByRole("button", { name: trigger, exact: true });
        await opener.click();
        const dialog = page.getByRole("dialog", { name: title, exact: true });
        await expect(
          dialog.getByText("Ola Medlem · ola@example.test", { exact: true })
        ).toBeVisible();
        if (name === "bookings") {
          await expect(dialog.getByRole("heading", { name: "2 bookinger" })).toBeVisible();
          if (viewport === mobile)
            await dialog.getByRole("button", { name: "Filtre", exact: true }).click();
          await dialog.getByRole("button", { name: "Tennis", exact: true }).click();
          await expect(dialog.getByRole("heading", { name: "1 booking" })).toBeVisible();
        } else if (name === "blocks") {
          await expect(dialog.getByRole("heading", { name: "3 sperrer · 1 aktiv" })).toBeVisible();
          await expect(dialog.getByRole("button", { name: "Opphev sperre" })).toHaveCount(1);
        }
        await expectNoHorizontalOverflow(page);
        await expectStableScreenshot(
          page,
          diagnostics,
          `user-dialog-${name}-${viewport.width}-${theme}.png`
        );
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(opener).toBeFocused();
      }
    });
  }
}
