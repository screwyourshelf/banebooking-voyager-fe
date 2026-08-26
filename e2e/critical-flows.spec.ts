import { expect, test } from "./harness";

test("all development profiles load user data with tenant and base path", async ({ page, e2e }) => {
  const profiles = [
    { accountName: "Utvikling Medlem · Medlem", profile: "medlem" },
    { accountName: "Utvikling Utvidet · Utvidet bruker", profile: "utvidet" },
    {
      accountName: "Utvikling Administrator · Klubbadministrator",
      profile: "admin",
    },
  ] as const;

  for (const profile of profiles) {
    const signedIn = await e2e.signIn(page, profile.profile);
    expect(signedIn.accountName).toBe(profile.accountName);
    await expect(
      page.getByRole("button", { name: profile.accountName, exact: true })
    ).toBeVisible();

    await page.getByRole("button", { name: profile.accountName, exact: true }).click();
    await page.getByRole("button", { name: "Logg ut", exact: true }).click();
    await expect(page.getByRole("link", { name: "Logg inn", exact: true })).toBeVisible();
  }
});

test("mandatory announcement redirect survives the login return navigation", async ({
  page,
  e2e,
}) => {
  await page.route("**/api/klubb/aas-tennisklubb/bruker", async (route) => {
    const response = await route.fetch();
    const bruker = (await response.json()) as Record<string, unknown>;
    await route.fulfill({
      response,
      json: {
        ...bruker,
        erSperret: false,
        måBekrefteMedlemskap: false,
        ulestKunngjøring: {
          id: "e2e-login-policy-redirect",
          tittel: "E2E-kunngjøring",
          tekst: JSON.stringify({
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Les dette." }] }],
          }),
        },
      },
    });
  });

  const signedIn = await e2e.signIn(page, "utvidet");

  expect(signedIn.landingPath).toBe("kunngjøring");
  await expect(page.getByRole("heading", { level: 1, name: "E2E-kunngjøring" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Jeg har lest kunngjøringen" })).toBeVisible();
});

test("member books and cancels the same slot", async ({ page, e2e }) => {
  await e2e.signIn(page, "medlem");
  const tomorrowSlots = page.waitForResponse(
    (response) => response.url().includes("/kalender?") && response.ok()
  );
  await page.getByRole("button", { name: "I morgen", exact: true }).click();
  await tomorrowSlots;

  const selectedCourt = await page
    .getByRole("group", { name: "Bane" })
    .getByRole("button", { pressed: true })
    .innerText();
  const bookButton = page.getByRole("button", { name: /^Book tiden / }).first();
  const bookingLabel = await bookButton.getAttribute("aria-label");
  expect(bookingLabel).toMatch(/^Book tiden \d{2}:\d{2} til \d{2}:\d{2}$/);
  const startTime = bookingLabel!.slice("Book tiden ".length, "Book tiden 00:00".length);

  await bookButton.click();
  await expect(page.getByText("Din tid", { exact: true }).first()).toBeVisible();

  await page.goto(e2e.tenantPath("bookinger"));
  await expect(page.getByRole("heading", { level: 1, name: "Mine bookinger" })).toBeVisible();
  const createdBookingRow = page
    .locator('[data-ui="collection-row"]')
    .filter({ hasText: selectedCourt.trim() })
    .filter({ hasText: startTime })
    .first();
  await expect(createdBookingRow).toBeVisible();
  await createdBookingRow.getByRole("button").first().click();
  await createdBookingRow.getByRole("button", { name: "Avbestill", exact: true }).click();
  await expect(createdBookingRow).toHaveCount(0);
});

test("administrator changes and restores the club name", async ({ page, e2e }) => {
  const originalClub = await e2e.preserveClubSettings();
  const temporaryName = `${originalClub.navn} E2E`;
  await e2e.signIn(page, "admin");
  await page.goto(e2e.tenantPath("admin/klubb"));

  const clubName = page.getByLabel("Klubbnavn");
  await expect(clubName).toHaveValue(originalClub.navn);
  await clubName.fill(temporaryName);
  await page.getByRole("button", { name: "Lagre endringer" }).click();
  await expect(page.getByText("Klubbinnstillingene er lagret")).toBeVisible();
  await expect(clubName).toHaveValue(temporaryName);

  await clubName.fill(originalClub.navn);
  await page.getByRole("button", { name: "Lagre endringer" }).click();
  await expect(page.getByText("Klubbinnstillingene er lagret")).toBeVisible();
  await expect(clubName).toHaveValue(originalClub.navn);
});
