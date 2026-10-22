import type { Page } from "@playwright/test";
import type {
  ArrangementRespons,
  BatchLeggTilArrangementBookingerForespørsel,
  BatchLeggTilArrangementBookingerRespons,
  EksplisittArrangementSlot,
  OpprettArrangementForespørsel,
  OpprettArrangementRespons,
} from "../src/lib/contracts";
import {
  createArrangement,
  deleteArrangement,
  getAdminArrangements,
  getArrangementBookings,
  getArrangementCourts,
} from "../src/lib/features/arrangement-admin/api";
import { createApiClient, type ApiClient } from "../src/lib/platform/api/client";
import { E2E_BACKEND_ORIGIN, E2E_TENANT_SLUG } from "./environment";
import { expect, test as base } from "./harness";

const createPath = `/api/klubb/${E2E_TENANT_SLUG}/arrangement`;
const test = base.extend<{
  arrangements: { api: ApiClient; ownedIds: Set<string> };
}>({
  arrangements: async ({ page, request }, provideFixture) => {
    const login = await request.post(`${E2E_BACKEND_ORIGIN}/api/dev-auth/login`, {
      data: { profile: "admin" },
    });
    expect(login.ok()).toBe(true);
    const { accessToken } = (await login.json()) as { accessToken: string };
    const api = createApiClient({
      baseUrl: `${E2E_BACKEND_ORIGIN}/api`,
      fetch: globalThis.fetch,
      getAuthorization: async () => ({ scheme: "DevelopmentBearer", token: accessToken }),
      onUnauthorized: async () => {
        throw new Error("Local admin session expired");
      },
    });
    const ownedIds = new Set<string>();
    const pendingCaptures: Promise<void>[] = [];
    page.on("response", (response) => {
      if (
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === createPath &&
        response.ok()
      ) {
        pendingCaptures.push(
          response.json().then((created: OpprettArrangementRespons) => {
            if (created.arrangementId !== "00000000-0000-0000-0000-000000000000") {
              ownedIds.add(created.arrangementId);
            }
          })
        );
      }
    });

    try {
      await provideFixture({ api, ownedIds });
    } finally {
      await Promise.all(pendingCaptures);
      for (const arrangementId of ownedIds) {
        await deleteArrangement(api, E2E_TENANT_SLUG, arrangementId);
      }
    }
  },
});

test("extended user creates an arrangement with several calendar times and admin edits its title", async ({
  page,
  arrangements,
  e2e,
}, testInfo) => {
  const { api } = arrangements;
  const title = "Kurs";
  const description = `Opprettet fra to valgte tider i bookingkalenderen. E2E ${Date.now()}`;
  const signedIn = await e2e.signIn(page, "utvidet");
  const { dialog, timeChoices, date, activityName, courtName } =
    await openQuickArrangementDialog(page);
  const court = (await getArrangementCourts(api, E2E_TENANT_SLUG)).find(
    (candidate) => candidate.navn === courtName.trim() && candidate.grenNavn === activityName.trim()
  );
  expect(court).toBeDefined();

  await timeChoices.getByRole("button", { pressed: false }).first().click();
  const selectedTimes = await timeChoices.getByRole("button", { pressed: true }).allTextContents();
  expect(selectedTimes).toHaveLength(2);

  await dialog.getByRole("combobox", { name: "Type", exact: true }).click();
  await page.getByRole("option", { name: "Kurs", exact: true }).click();
  await dialog.getByLabel("Beskrivelse", { exact: true }).fill(description);

  await page.screenshot({ path: testInfo.outputPath("quick-arrangement-desktop.png") });
  const desktopViewport = page.viewportSize()!;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => dialog.evaluate((element) => element.scrollWidth <= element.clientWidth))
    .toBe(true);
  await dialog.getByRole("combobox", { name: "Type", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("quick-arrangement-mobile.png") });
  await timeChoices.getByRole("button").last().scrollIntoViewIfNeeded();
  await expect(timeChoices.getByRole("button").last()).toBeInViewport();
  await expect(
    dialog.getByRole("button", { name: "Opprett arrangement med 2 tider", exact: true })
  ).toBeInViewport();
  await page.setViewportSize(desktopViewport);

  const createdResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname === createPath
  );
  await dialog
    .getByRole("button", { name: "Opprett arrangement med 2 tider", exact: true })
    .click();
  const response = await createdResponse;
  expect(response.ok()).toBe(true);
  const submitted = response.request().postDataJSON() as OpprettArrangementForespørsel;
  const created = (await response.json()) as OpprettArrangementRespons;
  expect(created.antallOpprettet).toBe(2);
  expect(created.konflikter).toEqual([]);
  expect(submitted).toMatchObject({
    grenId: court!.grenId,
    tittel: title,
    beskrivelse: description,
    kategori: "Kurs",
    publisertPåNettsiden: false,
  });
  expect(submitted.eksplisitteSlots).toHaveLength(2);
  expect(submitted.startDato).toBe(date);
  expect(submitted.sluttDato).toBe(date);
  expect(submitted.eksplisitteSlots).toEqual(
    selectedTimes.map((time) => {
      const [startTid, sluttTid] = time.trim().split("–");
      return { baneId: court!.id, dato: submitted.startDato, startTid, sluttTid };
    })
  );
  await expect(dialog.getByRole("button", { name: /^Opprett arrangement med / })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expectCalendarArrangementAtTimes(
    page,
    title,
    submitted.eksplisitteSlots!.map((slot) => slot.startTid)
  );
  const bookings = await getArrangementBookings(api, E2E_TENANT_SLUG, created.arrangementId);
  expect(bookings).toHaveLength(2);
  for (const slot of submitted.eksplisitteSlots!) {
    expect(bookings).toContainEqual(expect.objectContaining(slot));
  }

  await page.getByRole("button", { name: signedIn.accountName, exact: true }).click();
  await page.getByRole("button", { name: "Logg ut", exact: true }).click();
  await expect(page.getByRole("link", { name: "Logg inn", exact: true })).toBeVisible();
  await e2e.signIn(page, "admin");
  const adminList = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      new URL(response.url()).pathname === `/api/klubb/${E2E_TENANT_SLUG}/arrangementer` &&
      new URL(response.url()).searchParams.get("inkluderHistoriske") === "true"
  );
  await page.goto(e2e.tenantPath("arrangement"));
  const visibleArrangements = ((await (await adminList).json()) as ArrangementRespons[]).filter(
    (arrangement) => !arrangement.erPassert
  );
  const ownedRowIndex = visibleArrangements.findIndex(
    (arrangement) => arrangement.id === created.arrangementId
  );
  expect(ownedRowIndex).toBeGreaterThanOrEqual(0);
  await page
    .getByRole("button", { name: /^Rediger / })
    .nth(ownedRowIndex)
    .click();
  const editor = page.getByRole("dialog");
  const editedTitle = `Kalender E2E endret ${Date.now()}`;
  await expect(editor.getByLabel("Intern beskrivelse")).toHaveValue(description);
  await expect(editor.getByRole("textbox", { name: "Tittel", exact: true })).toHaveValue(title);
  await editor.getByRole("textbox", { name: "Tittel", exact: true }).fill(editedTitle);
  await editor.getByRole("button", { name: "Lagre informasjon", exact: true }).click();
  await expect(editor.getByText("Informasjonen er lagret", { exact: true })).toBeVisible();
  await editor.getByRole("button", { name: "Alle arrangementer", exact: true }).click();
  await page.getByRole("button", { name: new RegExp(`^Rediger ${editedTitle},`) }).click();
  await expect(
    page.getByRole("dialog").getByRole("textbox", { name: "Tittel", exact: true })
  ).toHaveValue(editedTitle);
  const persisted = (await getAdminArrangements(api, E2E_TENANT_SLUG)).find(
    (arrangement) => arrangement.id === created.arrangementId
  );
  expect(persisted).toMatchObject({
    tittel: editedTitle,
    beskrivelse: description,
    kategori: "Kurs",
    publisertPåNettsiden: false,
  });

  // Avlys begge tidene i editoren. Bare siste tid skal slette arrangementet.
  for (let remaining = 2; remaining > 0; remaining--) {
    const eventEditor = page.getByRole("dialog", { name: editedTitle, exact: true });
    await eventEditor.getByRole("button", { name: /Tider/ }).click();
    await eventEditor
      .getByRole("button", { name: /^Rediger / })
      .first()
      .click();
    const removed = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes(`/arrangement/${created.arrangementId}/bookinger/`)
    );
    await page
      .getByRole("dialog", { name: "Rediger banetid" })
      .getByRole("button", { name: "Avlys banetid" })
      .click();
    const confirmation = page.getByRole("dialog", { name: "Avlys banetid" });
    if (remaining === 1) {
      await expect(confirmation).toContainText(
        "Dette er arrangementets siste tid. Arrangementet slettes også."
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: testInfo.outputPath("last-arrangement-time-mobile.png") });
      await confirmation.getByRole("button", { name: "Ja, avlys" }).click();
    } else {
      await expect(confirmation).not.toBeVisible();
    }
    const removal = await removed;
    expect(removal.ok()).toBe(true);
    if (remaining === 1) {
      expect((await removal.json()).slettetArrangementId).toBe(created.arrangementId);
      arrangements.ownedIds.delete(created.arrangementId);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    } else {
      await expect(confirmation).not.toBeVisible();
      await expect(eventEditor.getByText("1 banetid", { exact: true })).toBeVisible();
    }
  }
  expect(
    (await getAdminArrangements(api, E2E_TENANT_SLUG)).some(
      (item) => item.id === created.arrangementId
    )
  ).toBe(false);
});

test("last arrangement time is confirmed and removed from the calendar", async ({
  page,
  arrangements,
  e2e,
}, testInfo) => {
  await e2e.signIn(page, "utvidet");
  const { dialog, timeChoices } = await openQuickArrangementDialog(page, 1);
  const selectedTime = await timeChoices.getByRole("button", { pressed: true }).innerText();
  const [start, end] = selectedTime.trim().split("–");
  const creation = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname === createPath
  );
  await dialog.getByRole("button", { name: "Opprett arrangement med 1 tid", exact: true }).click();
  const created = (await (await creation).json()) as OpprettArrangementRespons;
  expect(created.antallOpprettet).toBe(1);
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  const row = page
    .getByRole("list", { name: "Tilgjengelige tider", exact: true })
    .locator('[data-ui="collection-row"]')
    .filter({ has: page.getByText(start, { exact: true }) });
  await row.getByRole("button", { name: /Annet/ }).click();
  await row.getByRole("button", { name: "Avbestill", exact: true }).click();
  const confirmation = page.getByRole("dialog", { name: "Avlys banetid" });
  await expect(confirmation).toContainText(
    "Dette er arrangementets siste tid. Arrangementet slettes også."
  );
  await page.screenshot({ path: testInfo.outputPath("last-calendar-time-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => confirmation.evaluate((element) => element.scrollWidth <= element.clientWidth))
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath("last-calendar-time-mobile.png") });
  const deletion = page.waitForResponse(
    (response) => response.request().method() === "DELETE" && response.url().includes("/bookinger/")
  );
  await confirmation.getByRole("button", { name: "Ja, avlys" }).click();
  const response = await deletion;
  expect(response.ok()).toBe(true);
  expect((await response.json()).slettetArrangementId).toBe(created.arrangementId);
  arrangements.ownedIds.delete(created.arrangementId);
  await expect(confirmation).not.toBeVisible();
  await expect(
    row.getByRole("button", { name: `Book tiden ${start} til ${end}`, exact: true })
  ).toBeVisible();
  expect(
    (await getAdminArrangements(arrangements.api, E2E_TENANT_SLUG)).some(
      (item) => item.id === created.arrangementId
    )
  ).toBe(false);
});

test("a time taken after opening the dialog leaves a partial result without a second create action", async ({
  page,
  e2e,
  arrangements,
}) => {
  const { api, ownedIds } = arrangements;
  await e2e.signIn(page, "admin");
  const { dialog, timeChoices, date, activityName, courtName } =
    await openQuickArrangementDialog(page);
  const court = (await getArrangementCourts(api, E2E_TENANT_SLUG)).find(
    (candidate) => candidate.navn === courtName.trim() && candidate.grenNavn === activityName.trim()
  );
  expect(court).toBeDefined();
  const conflictingTime = timeChoices.getByRole("button", { pressed: false }).first();
  const [startTid, sluttTid] = (await conflictingTime.innerText()).trim().split("–");
  await conflictingTime.click();
  const conflictTitle = `Samtidig E2E ${Date.now()}`;
  const conflict = await createArrangement(api, E2E_TENANT_SLUG, {
    grenId: court!.grenId,
    tittel: conflictTitle,
    kategori: "Annet",
    startDato: date,
    sluttDato: date,
    ukedager: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    baneGrupper: [{ baneIder: [court!.id], tidspunkter: [startTid] }],
    eksplisitteSlots: [{ baneId: court!.id, dato: date, startTid, sluttTid }],
  });
  ownedIds.add(conflict.arrangementId);
  expect(conflict.antallOpprettet).toBe(1);

  await expect(dialog.getByRole("combobox", { name: "Type", exact: true })).toHaveText("Annet");
  await expect(dialog.getByLabel("Beskrivelse", { exact: true })).toHaveValue("");
  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname === createPath
  );
  await dialog
    .getByRole("button", { name: "Opprett arrangement med 2 tider", exact: true })
    .click();
  const response = await createResponse;
  expect(response.ok()).toBe(true);
  const submitted = response.request().postDataJSON() as OpprettArrangementForespørsel;
  expect(submitted).toMatchObject({ tittel: "Annet", kategori: "Annet" });
  expect(submitted.beskrivelse).toBeUndefined();
  const created = (await response.json()) as OpprettArrangementRespons;
  expect(created.antallOpprettet).toBe(1);
  expect(created.konflikter).toHaveLength(1);
  await expect(
    dialog.getByText("Arrangement opprettet med 1 av 2 tider", { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByText(/Du kan legge til eller endre tider i arrangementsadministrasjonen/)
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: /^Opprett arrangement med / })).toHaveCount(0);
  await expect(dialog.getByRole("textbox", { name: "Tittel", exact: true })).toHaveCount(0);
  const bookings = await getArrangementBookings(api, E2E_TENANT_SLUG, created.arrangementId);
  expect(bookings).toHaveLength(1);
  expect(bookings[0].startTid).not.toBe(startTid);
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await expectCalendarArrangementAtTimes(page, "Annet", [bookings[0].startTid]);
  await expectCalendarArrangementAtTimes(page, conflictTitle, [startTid]);
});

test("extended user links several calendar times to an existing arrangement without changing its metadata", async ({
  page,
  e2e,
  arrangements,
}, testInfo) => {
  await e2e.signIn(page, "utvidet");
  const { dialog, timeChoices, arrangementId, metadata, seedSlot, additionalTimeLabel } =
    await openExistingArrangementDialog(page, arrangements);
  const submit = dialog.getByRole("button", {
    name: "Koble 1 tid til arrangement",
    exact: true,
  });
  await expect(submit).toBeDisabled();
  await dialog
    .getByRole("radiogroup", { name: "Aktive arrangementer", exact: true })
    .getByRole("radio", { name: new RegExp(`^${metadata.tittel}`) })
    .check();
  await expect(submit).toBeEnabled();
  await timeChoices.getByRole("button", { name: additionalTimeLabel, exact: true }).click();
  const selectedTimes = await timeChoices.getByRole("button", { pressed: true }).allTextContents();
  expect(selectedTimes).toHaveLength(2);
  const selectedSlots = selectedTimes.map((time) => calendarSlot(seedSlot, time));

  await page.screenshot({ path: testInfo.outputPath("link-arrangement-desktop.png") });
  const desktopViewport = page.viewportSize()!;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => dialog.evaluate((element) => element.scrollWidth <= element.clientWidth))
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await timeChoices.getByRole("button").last().scrollIntoViewIfNeeded();
  await expect(timeChoices.getByRole("button").last()).toBeInViewport();
  await expect(
    dialog.getByRole("button", { name: "Koble 2 tider til arrangement", exact: true })
  ).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("link-arrangement-mobile.png") });
  await page.setViewportSize(desktopViewport);

  const linkResponse = waitForArrangementLink(page, arrangementId);
  await dialog.getByRole("button", { name: "Koble 2 tider til arrangement", exact: true }).click();
  const response = await linkResponse;
  expect(response.ok()).toBe(true);
  expect(response.request().postDataJSON() as BatchLeggTilArrangementBookingerForespørsel).toEqual({
    bookinger: selectedSlots,
  });
  const result = (await response.json()) as BatchLeggTilArrangementBookingerRespons;
  expect(result.opprettet).toHaveLength(2);
  expect(result.feilet).toEqual([]);
  await expect(
    dialog.getByText("2 tider er koblet til arrangementet", { exact: true })
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: /^Koble \d+ tid/ })).toHaveCount(0);
  const bookings = await getArrangementBookings(arrangements.api, E2E_TENANT_SLUG, arrangementId);
  expect(bookings).toHaveLength(3);
  for (const slot of [seedSlot, ...selectedSlots]) {
    expect(bookings).toContainEqual(expect.objectContaining(slot));
  }
  const persisted = (await getAdminArrangements(arrangements.api, E2E_TENANT_SLUG)).find(
    (arrangement) => arrangement.id === arrangementId
  );
  expect(persisted).toMatchObject(metadata);
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expectCalendarArrangementAtTimes(
    page,
    metadata.tittel,
    [seedSlot, ...selectedSlots].map((slot) => slot.startTid)
  );
});

test("linking existing arrangement times reports a partial conflict without submitting again", async ({
  page,
  e2e,
  arrangements,
}) => {
  await e2e.signIn(page, "utvidet");
  const { dialog, timeChoices, arrangementId, metadata, seedSlot, additionalTimeLabel, court } =
    await openExistingArrangementDialog(page, arrangements);
  await dialog
    .getByRole("radiogroup", { name: "Aktive arrangementer", exact: true })
    .getByRole("radio", { name: new RegExp(`^${metadata.tittel}`) })
    .check();
  await timeChoices.getByRole("button", { name: additionalTimeLabel, exact: true }).click();
  const selectedSlots = (
    await timeChoices.getByRole("button", { pressed: true }).allTextContents()
  ).map((time) => calendarSlot(seedSlot, time));
  expect(selectedSlots).toHaveLength(2);
  const conflictSlot = calendarSlot(seedSlot, additionalTimeLabel);
  const conflictTitle = `Samtidig kobling E2E ${Date.now()}`;
  await createOwnedCalendarArrangement(arrangements, court, conflictSlot, {
    tittel: conflictTitle,
    kategori: "Annet",
  });

  const linkResponse = waitForArrangementLink(page, arrangementId);
  await dialog.getByRole("button", { name: "Koble 2 tider til arrangement", exact: true }).click();
  const response = await linkResponse;
  expect(response.ok()).toBe(true);
  expect(response.request().postDataJSON() as BatchLeggTilArrangementBookingerForespørsel).toEqual({
    bookinger: selectedSlots,
  });
  const result = (await response.json()) as BatchLeggTilArrangementBookingerRespons;
  expect(result.opprettet).toHaveLength(1);
  expect(result.feilet).toHaveLength(1);
  expect(result.feilet[0]).toMatchObject(conflictSlot);
  await expect(
    dialog.getByText("1 av 2 tider er koblet til arrangementet", { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByText(
      `${conflictSlot.startTid}–${conflictSlot.sluttTid}: ${result.feilet[0].feilmelding}`,
      { exact: true }
    )
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: /^Koble \d+ tid/ })).toHaveCount(0);
  const bookings = await getArrangementBookings(arrangements.api, E2E_TENANT_SLUG, arrangementId);
  expect(bookings).toHaveLength(2);
  expect(bookings).toContainEqual(expect.objectContaining(seedSlot));
  expect(bookings).toContainEqual(expect.objectContaining(result.opprettet[0]));
  expect(bookings.some((booking) => booking.startTid === conflictSlot.startTid)).toBe(false);
  const persisted = (await getAdminArrangements(arrangements.api, E2E_TENANT_SLUG)).find(
    (arrangement) => arrangement.id === arrangementId
  );
  expect(persisted).toMatchObject(metadata);
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await expectCalendarArrangementAtTimes(page, metadata.tittel, [
    seedSlot.startTid,
    result.opprettet[0].startTid,
  ]);
  await expectCalendarArrangementAtTimes(page, conflictTitle, [conflictSlot.startTid]);
});

async function openExistingArrangementDialog(
  page: Page,
  arrangements: { api: ApiClient; ownedIds: Set<string> }
) {
  const discovery = await openQuickArrangementDialog(page, 3);
  const court = (await getArrangementCourts(arrangements.api, E2E_TENANT_SLUG)).find(
    (candidate) =>
      candidate.navn === discovery.courtName.trim() &&
      candidate.grenNavn === discovery.activityName.trim()
  );
  expect(court).toBeDefined();
  const initialTimeLabel = await discovery.timeChoices
    .getByRole("button", { pressed: true })
    .innerText();
  const freeTimes = await discovery.timeChoices
    .getByRole("button", { pressed: false })
    .allTextContents();
  const seedSlot = calendarSlot({ baneId: court!.id, dato: discovery.date }, freeTimes.at(-1)!);
  const metadata = {
    tittel: `Eksisterende E2E ${Date.now()}`,
    beskrivelse: "Eksisterende informasjon skal beholdes når flere tider kobles til.",
    kategori: "Trening" as const,
    nettsideTittel: "Behold nettsidetittelen",
    nettsideBeskrivelse: "Behold nettsidebeskrivelsen",
    publisertPåNettsiden: false,
  };
  const created = await createOwnedCalendarArrangement(arrangements, court!, seedSlot, metadata);
  await discovery.dialog.getByRole("button", { name: "Avbryt", exact: true }).click();
  await expect(discovery.dialog).not.toBeVisible();
  const [initialStart, initialEnd] = initialTimeLabel.trim().split("–");
  const freeRow = page.locator('[data-ui="collection-row"]').filter({
    has: page.getByRole("button", {
      name: `Book tiden ${initialStart} til ${initialEnd}`,
      exact: true,
    }),
  });
  await freeRow.getByRole("button", { name: "Koble til arrangement", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Koble til arrangement", exact: true });
  await expect(dialog).toBeVisible();
  const timeChoices = dialog.getByRole("group", { name: "Banetider", exact: true });
  await expect(timeChoices.getByRole("button", { pressed: true })).toHaveCount(1);
  await expect(
    timeChoices.getByRole("button", { name: initialTimeLabel.trim(), exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  return {
    dialog,
    timeChoices,
    arrangementId: created.arrangementId,
    metadata,
    seedSlot,
    additionalTimeLabel: freeTimes[0].trim(),
    court: court!,
  };
}

async function createOwnedCalendarArrangement(
  arrangements: { api: ApiClient; ownedIds: Set<string> },
  court: { id: string; grenId: string },
  slot: EksplisittArrangementSlot,
  metadata: Pick<OpprettArrangementForespørsel, "tittel" | "kategori"> &
    Partial<OpprettArrangementForespørsel>
) {
  const created = await createArrangement(arrangements.api, E2E_TENANT_SLUG, {
    ...metadata,
    grenId: court.grenId,
    startDato: slot.dato,
    sluttDato: slot.dato,
    ukedager: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    baneGrupper: [{ baneIder: [court.id], tidspunkter: [slot.startTid] }],
    eksplisitteSlots: [slot],
  });
  arrangements.ownedIds.add(created.arrangementId);
  expect(created.antallOpprettet).toBe(1);
  return created;
}

function calendarSlot(
  scope: Pick<EksplisittArrangementSlot, "baneId" | "dato">,
  timeLabel: string
): EksplisittArrangementSlot {
  const [startTid, sluttTid] = timeLabel.trim().split("–");
  return { baneId: scope.baneId, dato: scope.dato, startTid, sluttTid };
}

function waitForArrangementLink(page: Page, arrangementId: string) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === `${createPath}/${arrangementId}/bookinger/batch`
  );
}

async function expectCalendarArrangementAtTimes(page: Page, title: string, startTimes: string[]) {
  const slots = page.getByRole("list", { name: "Tilgjengelige tider", exact: true });
  for (const startTime of startTimes) {
    const row = slots.locator('[data-ui="collection-row"]').filter({
      has: page.getByText(startTime, { exact: true }),
    });
    await expect(row.getByText(title, { exact: true })).toBeVisible();
  }
}

async function openQuickArrangementDialog(page: Page, minimumFreeTimes = 2) {
  const tomorrowCalendar = page.waitForResponse(
    (response) => response.url().includes("/kalender?") && response.ok()
  );
  await page.getByRole("button", { name: "I morgen", exact: true }).click();
  const date = new URL((await tomorrowCalendar).url()).searchParams.get("dato")!;
  await selectCourtWithFreeTimes(page, minimumFreeTimes);
  const activityName = await page
    .getByRole("group", { name: "Gren", exact: true })
    .getByRole("button", { pressed: true })
    .innerText();
  const courtName = await page
    .getByRole("group", { name: "Bane", exact: true })
    .getByRole("button", { pressed: true })
    .innerText();
  const initialTime = await page
    .getByRole("button", { name: /^Book tiden / })
    .first()
    .getAttribute("aria-label");
  const freeRow = page.locator('[data-ui="collection-row"]').filter({
    has: page.getByRole("button", { name: initialTime!, exact: true }),
  });
  await freeRow.getByRole("button", { expanded: false }).click();
  await expect(
    freeRow.getByRole("button", { name: "Koble til arrangement", exact: true })
  ).toBeVisible();
  await freeRow.getByRole("button", { name: "Opprett nytt arrangement", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Opprett nytt arrangement", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Tittel", exact: true })).toHaveCount(0);
  await expect(
    dialog
      .locator('[data-ui="form-field"]')
      .first()
      .getByRole("combobox", { name: "Type", exact: true })
  ).toBeVisible();
  const timeChoices = dialog.getByRole("group", { name: "Banetider", exact: true });
  await expect(timeChoices.getByRole("button", { pressed: true })).toHaveCount(1);
  const initialTimeLabel = initialTime!.replace("Book tiden ", "").replace(" til ", "–");
  await expect(
    timeChoices.getByRole("button", { name: initialTimeLabel, exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  return { dialog, timeChoices, date, activityName, courtName };
}

async function selectCourtWithFreeTimes(page: Page, minimumFreeTimes: number) {
  const bookButtons = page.getByRole("button", { name: /^Book tiden / });
  const activities = page.getByRole("group", { name: "Gren", exact: true });
  for (const activityName of await activities.getByRole("button").allTextContents()) {
    const activity = activities.getByRole("button", { name: activityName.trim(), exact: true });
    await activity.click();
    await expect(activity).toHaveAttribute("aria-pressed", "true");
    const courts = page.getByRole("group", { name: "Bane", exact: true });
    for (const courtName of await courts.getByRole("button").allTextContents()) {
      const court = courts.getByRole("button", { name: courtName.trim(), exact: true });
      await court.click();
      await expect(court).toHaveAttribute("aria-pressed", "true");
      const slots = page.getByRole("list", { name: "Tilgjengelige tider", exact: true });
      await expect(slots).toBeVisible();
      await expect(slots).not.toHaveAttribute("aria-busy", "true");
      if ((await bookButtons.count()) >= minimumFreeTimes) return;
    }
  }
  throw new Error(
    `Quick arrangement E2E requires ${minimumFreeTimes} free times on the same court tomorrow.`
  );
}
