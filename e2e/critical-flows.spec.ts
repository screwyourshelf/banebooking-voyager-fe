import { expect, test } from "./harness";

test("development login preserves tenant and base path", async ({ page, e2e }) => {
  await page.goto(e2e.tenantPath("login"));

  await expect(page.getByRole("heading", { level: 1, name: "Logg inn" })).toBeVisible();
  await page.getByText("Testinnlogging").click();
  await page.getByRole("button", { name: "Medlem", exact: true }).click();

  await expect(page).toHaveURL(/\/banebooking\/aas-tennisklubb\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Book bane" })).toBeVisible();
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
