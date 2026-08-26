import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test";
import {
  E2E_APP_BASE_PATH,
  E2E_APP_ORIGIN,
  E2E_BACKEND_ORIGIN,
  E2E_TENANT_SLUG,
} from "./environment";

const enabled = process.env.PERFORMANCE_BASELINE === "1";
const calendarDurationMs = Number(process.env.PERFORMANCE_CALENDAR_DURATION_MS ?? 10 * 60_000);
const developmentSessionKey = "banebooking_development_session";
const frontendRoot = path.resolve(import.meta.dirname, "..");
const backendRoot = path.resolve(frontendRoot, "../backend");

type DevelopmentProfile = "admin" | "medlem" | "utvidet";

type DevelopmentSession = {
  accessToken: string;
  expiresAt: string;
  user: {
    developmentProfile: DevelopmentProfile;
    email: string;
    id: string;
    name: string;
  };
};

type Court = {
  aktiv: boolean;
  bookingInnstillinger: {
    aapningstid: string;
    dagerFremITid: number;
    maksPerDag: number;
    maksTotalt: number;
    slotLengdeMinutter: number;
    stengetid: string;
  };
  bookingOverstyring: {
    aapningstid: string | null;
    dagerFremITid: number | null;
    maksPerDag: number | null;
    maksTotalt: number | null;
    slotLengdeMinutter: number | null;
    stengetid: string | null;
  } | null;
  beskrivelse: string;
  grenId: string;
  grenNavn: string;
  harOverstyring: boolean;
  id: string;
  navn: string;
  sortering: number;
};

type CalendarSlot = {
  baneId: string;
  bookingId?: string | null;
  erPassert: boolean;
  kapabiliteter?: string[];
  dato?: string;
  slotSluttTid: string;
  slotStartTid: string;
};

type ArrangementFixture = {
  arrangementId: string;
  court: Court;
  date: string;
  daysAhead: number;
  slots: [CalendarSlot, CalendarSlot, CalendarSlot, CalendarSlot];
  title: string;
};

type NetworkRequest = {
  cacheHeaders: {
    age: string | null;
    cacheControl: string | null;
    etag: string | null;
    xCache: string | null;
  };
  decodedBodyBytes: number;
  durationMs: number;
  failed: boolean;
  fromServiceWorker: boolean;
  method: string;
  path: string;
  startMs: number;
  status: number | null;
};

type NetworkFlow = {
  apiCalls: number;
  decodedBodyBytes: number;
  finishedAt: string;
  label: string;
  readyMs: number | null;
  requests: NetworkRequest[];
  sequentialRounds: number;
  startedAt: string;
  totalDurationMs: number;
};

type ActiveFlow = {
  label: string;
  readyMs: number | null;
  requests: Map<Request, { startMs: number }>;
  result: NetworkRequest[];
  startedAt: string;
  startedAtMs: number;
};

test.skip(!enabled, "Kjøres eksplisitt med PERFORMANCE_BASELINE=1.");
test.describe.configure({ mode: "serial" });
test.use({ actionTimeout: 10_000 });

test("records the local API and full-stack baseline", async ({ browser, request }, testInfo) => {
  test.setTimeout(Math.max(15 * 60_000, calendarDurationMs + 5 * 60_000));

  const flows: NetworkFlow[] = [];
  const memberSession = await developmentLogin(request, "medlem");
  const extendedSession = await developmentLogin(request, "utvidet");
  const adminSession = await developmentLogin(request, "admin");
  const fixture = await createArrangementFixture(request, adminSession);
  const cleanupCourt = fixture.court;
  const cleanupBookings: { bookingId: string; session: DevelopmentSession }[] = [];
  let cleanupCreatedArrangementId: string | null = null;
  const cleanupErrors: unknown[] = [];

  try {
    const skippedScenarios: string[] = [];
    for (let run = 1; run <= 3; run += 1) {
      const anonymous = await createMeasuredPage(browser, request);
      await anonymous.recorder.begin(`cold-anonymous-booking-startup-run-${run}`);
      await anonymous.page.goto(tenantUrl());
      await expectUsableBooking(anonymous.page);
      anonymous.recorder.markReady();
      flows.push(await anonymous.recorder.end());
      if (run === 1) {
        skippedScenarios.push(
          ...(await measurePublicBookingInteractions(anonymous.page, anonymous.recorder, flows))
        );
      }
      await anonymous.context.close();
    }

    for (let run = 1; run <= 3; run += 1) {
      const authenticated = await createMeasuredPage(browser, request, memberSession);
      await authenticated.recorder.begin(
        `cold-authenticated-booking-startup-terms-accepted-run-${run}`
      );
      await authenticated.page.goto(tenantUrl());
      await expectUsableBooking(authenticated.page);
      await expect(
        authenticated.page.getByRole("button", {
          name: "Utvikling Medlem · Medlem",
          exact: true,
        })
      ).toBeVisible();
      authenticated.recorder.markReady();
      flows.push(await authenticated.recorder.end());
      await authenticated.context.close();
    }

    setMemberTermsAcceptance(false);
    const withoutTerms = await createMeasuredPage(browser, request, memberSession);
    await withoutTerms.recorder.begin("cold-authenticated-booking-startup-terms-missing");
    await withoutTerms.page.goto(tenantUrl());
    await expectUsableBooking(withoutTerms.page);
    withoutTerms.recorder.markReady();
    flows.push(await withoutTerms.recorder.end());
    await withoutTerms.context.close();

    skippedScenarios.push(
      ...(await measureMemberFlows({
        browser,
        cleanupBookings,
        extendedSession,
        fixture,
        flows,
        memberSession,
        request,
      }))
    );

    const polling = await createMeasuredPage(browser, request, memberSession);
    await polling.page.goto(tenantUrl());
    await expectUsableBooking(polling.page);
    await polling.recorder.begin("foreground-booking-calendar-polling");
    polling.recorder.markReady();
    await polling.page.waitForTimeout(calendarDurationMs);
    flows.push(await polling.recorder.end());
    await polling.context.close();

    await measureAdminReadSurfaces(browser, request, adminSession, flows);

    const arrangement = await createMeasuredPage(browser, request, adminSession);
    await arrangement.page.goto(tenantUrl("arrangement"));
    await expect(
      arrangement.page.getByRole("heading", { level: 1, name: "Administrer arrangementer" })
    ).toBeVisible();
    cleanupCreatedArrangementId = await createArrangementThroughUi(
      arrangement.page,
      arrangement.recorder,
      flows,
      fixture
    );
    await arrangement.page
      .getByRole("button", { name: new RegExp(`^Rediger ${escapeRegex(fixture.title)},`) })
      .click();
    const arrangementEditor = arrangement.page.getByRole("dialog").filter({
      has: arrangement.page.getByRole("navigation", { name: "Rediger arrangement" }),
    });
    await expect(arrangementEditor).toBeVisible();

    const description = arrangementEditor.getByLabel("Intern beskrivelse");
    await description.fill("Performance baseline måling");
    await arrangement.recorder.begin("update-arrangement-metadata");
    await arrangementEditor.getByRole("button", { name: "Lagre informasjon" }).click();
    await expect(arrangementEditor.getByText("Informasjonen er lagret")).toBeVisible();
    arrangement.recorder.markReady();
    flows.push(await arrangement.recorder.end());

    await arrangementEditor.getByRole("button", { name: /Tider$/ }).click();
    await expect(
      arrangementEditor.getByRole("button", {
        name: bookingRowName(fixture.court.navn, fixture.slots[0]),
      })
    ).toBeVisible();

    await arrangementEditor
      .getByRole("button", { name: bookingRowName(fixture.court.navn, fixture.slots[0]) })
      .click();
    const bookingEditor = arrangement.page.getByRole("dialog", { name: "Rediger banetid" });
    await expect(bookingEditor).toBeVisible();
    await bookingEditor.getByRole("combobox", { name: "Starttid" }).click();
    await arrangement.page
      .getByRole("option", { name: fixture.slots[1].slotStartTid, exact: true })
      .click();
    await arrangement.recorder.begin("edit-arrangement-booking");
    await bookingEditor.getByRole("button", { name: "Lagre endring" }).click();
    await expect(bookingEditor).toBeHidden();
    await expect(
      arrangementEditor.getByRole("button", {
        name: bookingRowName(fixture.court.navn, fixture.slots[1]),
      })
    ).toBeVisible();
    arrangement.recorder.markReady();
    flows.push(await arrangement.recorder.end());

    await selectScheduleDate(arrangementEditor, fixture.daysAhead);
    await arrangementEditor.getByRole("switch", { name: "Alle ukedager i perioden" }).click();
    await arrangementEditor.getByRole("button", { name: fixture.court.navn, exact: true }).click();
    await arrangementEditor
      .getByRole("button", { name: fixture.slots[2].slotStartTid, exact: true })
      .click();
    await arrangementEditor.getByRole("button", { name: "Legg forslag i listen" }).click();
    await expect(
      arrangementEditor.getByRole("button", { name: "Opprett 1 forslag" })
    ).toBeVisible();

    await arrangement.recorder.begin("create-arrangement-booking");
    await arrangementEditor.getByRole("button", { name: "Opprett 1 forslag" }).click();
    await expect(
      arrangementEditor.getByRole("button", {
        name: bookingRowName(fixture.court.navn, fixture.slots[2]),
      })
    ).toBeVisible();
    arrangement.recorder.markReady();
    flows.push(await arrangement.recorder.end());

    await arrangementEditor
      .getByRole("button", { name: bookingRowName(fixture.court.navn, fixture.slots[2]) })
      .click();
    await expect(bookingEditor).toBeVisible();
    await arrangement.recorder.begin("delete-arrangement-booking");
    await bookingEditor.getByRole("button", { name: "Avlys banetid" }).click();
    await expect(bookingEditor).toBeHidden();
    await expect(
      arrangementEditor.getByRole("button", {
        name: bookingRowName(fixture.court.navn, fixture.slots[2]),
      })
    ).toHaveCount(0);
    arrangement.recorder.markReady();
    flows.push(await arrangement.recorder.end());

    await arrangementEditor.getByRole("button", { name: /Informasjon$/ }).click();
    await arrangementEditor.getByRole("button", { name: "Avlys arrangement", exact: true }).click();
    const deleteArrangementDialog = arrangement.page.getByRole("dialog", {
      name: "Avlys arrangement?",
    });
    await expect(deleteArrangementDialog).toBeVisible();
    await arrangement.recorder.begin("delete-arrangement");
    await deleteArrangementDialog
      .getByRole("button", { name: "Avlys arrangement", exact: true })
      .click();
    await expect(arrangementEditor).toBeHidden();
    await expect(
      arrangement.page.getByRole("button", {
        name: new RegExp(`^Rediger ${escapeRegex(fixture.title)},`),
      })
    ).toHaveCount(0);
    arrangement.recorder.markReady();
    flows.push(await arrangement.recorder.end());
    await arrangement.context.close();

    const court = await createMeasuredPage(browser, request, adminSession);
    await court.page.goto(tenantUrl("admin/baner"));
    await expect(
      court.page.getByRole("heading", { level: 1, name: "Baner og grener" })
    ).toBeVisible();
    await court.page
      .getByRole("button", { name: `Åpne ${cleanupCourt.navn}`, exact: true })
      .click();
    const courtEditor = court.page.getByRole("dialog", { name: cleanupCourt.navn });
    await expect(courtEditor).toBeVisible();
    await courtEditor
      .getByLabel("Beskrivelse")
      .fill(`${cleanupCourt.beskrivelse} [performance baseline]`);
    if (!cleanupCourt.harOverstyring) {
      await courtEditor.getByRole("switch", { name: "Egne bookingregler" }).click();
      await courtEditor.getByRole("switch", { name: "Egen grense per dag" }).click();
    } else {
      const overrideSwitch = courtEditor.getByRole("switch", { name: "Egen grense per dag" });
      if (!(await overrideSwitch.isChecked())) await overrideSwitch.click();
    }

    await court.recorder.begin("save-court-general-fields-and-booking-override");
    await courtEditor.getByRole("button", { name: "Lagre endringer" }).click();
    await expect(courtEditor.getByText("Baneinnstillingene er lagret")).toBeVisible();
    court.recorder.markReady();
    flows.push(await court.recorder.end());
    await court.context.close();

    const result = {
      browser: await browser.version(),
      calendarDurationMs,
      commit: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: frontendRoot,
        encoding: "utf8",
      }).trim(),
      coverage: {
        developmentProfiles: ["admin", "utvidet", "medlem"],
        regressionContracts: [
          "auth/callback prerender and refresh",
          "auth/callback returnTo tenant isolation",
        ],
        skippedScenarios,
      },
      finishedAt: new Date().toISOString(),
      flows,
      node: process.version,
      note: "Lokale enkeltmålinger er diagnostikk, ikke produksjons-SLO-er.",
    };
    const outputDirectory = path.join(frontendRoot, "test-results");
    const outputPath = path.join(outputDirectory, "performance-baseline.json");
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    await testInfo.attach("performance-baseline", {
      body: Buffer.from(JSON.stringify(result, null, 2)),
      contentType: "application/json",
    });
  } finally {
    try {
      setMemberTermsAcceptance(true);
    } catch (error) {
      cleanupErrors.push(error);
    }
    for (const booking of cleanupBookings) {
      try {
        await deleteBookingFixture(request, booking.session, booking.bookingId);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
    for (const cleanup of [
      () => restoreCourt(request, adminSession, cleanupCourt),
      ...(cleanupCreatedArrangementId
        ? [() => deleteArrangementFixture(request, adminSession, cleanupCreatedArrangementId)]
        : []),
      () => deleteArrangementFixture(request, adminSession, fixture.arrangementId),
    ]) {
      try {
        await cleanup();
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(cleanupErrors, "Performanceharnessen kunne ikke rydde opp testdata.");
  }
});

async function measurePublicBookingInteractions(
  page: Page,
  recorder: FlowRecorder,
  flows: NetworkFlow[]
) {
  const skipped: string[] = [];
  const dayGroup = page.getByRole("group", { name: "Dag" });
  await recorder.begin("public-booking-change-date");
  await dayGroup.getByRole("button", { name: "I morgen", exact: true }).click();
  await expectBookingSelectionSettled(page);
  recorder.markReady();
  flows.push(await recorder.end());

  const courtChoice = page
    .getByRole("group", { name: "Bane" })
    .getByRole("button", { pressed: false })
    .first();
  if ((await courtChoice.count()) > 0) {
    await recorder.begin("public-booking-change-court");
    await courtChoice.click();
    await expectBookingSelectionSettled(page);
    recorder.markReady();
    flows.push(await recorder.end());
  } else {
    skipped.push("Bytte bane: testdataene har bare én aktiv bane i valgt gren.");
  }

  const activityChoice = page
    .getByRole("group", { name: "Gren" })
    .getByRole("button", { pressed: false })
    .first();
  if ((await activityChoice.count()) > 0) {
    await recorder.begin("public-booking-change-activity");
    await activityChoice.click();
    await expectBookingSelectionSettled(page);
    recorder.markReady();
    flows.push(await recorder.end());
  } else {
    skipped.push("Bytte gren: testdataene har bare én aktiv gren.");
  }

  await page.getByRole("link", { name: "Arrangementer", exact: true }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Arrangementer" })).toBeVisible();
  await recorder.begin("warm-booking-route-return");
  await page.getByRole("link", { name: "Book bane", exact: true }).first().click();
  await expectUsableBooking(page);
  recorder.markReady();
  flows.push(await recorder.end());
  return skipped;
}

async function measureMemberFlows({
  browser,
  cleanupBookings,
  extendedSession,
  fixture,
  flows,
  memberSession,
  request,
}: {
  browser: Browser;
  cleanupBookings: { bookingId: string; session: DevelopmentSession }[];
  extendedSession: DevelopmentSession;
  fixture: ArrangementFixture;
  flows: NetworkFlow[];
  memberSession: DevelopmentSession;
  request: APIRequestContext;
}) {
  const skipped: string[] = [];
  const measured = await createMeasuredPage(browser, request, memberSession);
  try {
    await measured.recorder.begin("member-arrangements-list");
    await measured.page.goto(tenantUrl("arrangementer"));
    await expect(
      measured.page.getByRole("heading", { level: 1, name: "Arrangementer" })
    ).toBeVisible();
    await expect(measured.page.getByText("Laster arrangementer", { exact: true })).toHaveCount(0);
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());

    const arrangementRow = measured.page
      .getByRole("button", { name: new RegExp(escapeRegex(fixture.title)) })
      .first();
    if ((await arrangementRow.count()) > 0) {
      await measured.recorder.begin("member-arrangement-details");
      await arrangementRow.click();
      await expect(measured.page.getByRole("heading", { level: 4, name: "Program" })).toBeVisible();
      measured.recorder.markReady();
      flows.push(await measured.recorder.end());
    } else {
      skipped.push("Arrangementsdetalj: testfixture var ikke synlig i medlemslisten.");
    }
    skipped.push(
      "Arrangementspåmelding, endring og trekking: produktet har ingen slik medlemsflate eller arrangementkontrakt."
    );

    await measured.page.goto(tenantUrl());
    await expectUsableBooking(measured.page);
    await measured.page
      .getByRole("group", { name: "Dag" })
      .getByRole("button", {
        name: "I morgen",
        exact: true,
      })
      .click();
    await expectBookingSelectionSettled(measured.page);
    const date = addDays(todayIso(), 1);
    const successfulCandidate = await getBookableSlot(request, memberSession, date);
    if (!successfulCandidate) {
      skipped.push("Vellykket booking og konflikt: ingen bookbar tid i morgen.");
      return skipped;
    }

    const bookButton = measured.page.getByRole("button", {
      name: bookingButtonName(successfulCandidate.slot),
      exact: true,
    });
    await expect(bookButton).toBeVisible();
    const createResponse = measured.page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === `/api/klubb/${E2E_TENANT_SLUG}/bookinger`
    );
    await measured.recorder.begin("create-member-booking");
    await bookButton.click();
    const createdResponse = await createResponse;
    expect(createdResponse.ok()).toBe(true);
    await expect(measured.page.getByText("Din tid", { exact: true }).first()).toBeVisible();
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());
    const created = (await createdResponse.json()) as { bookingId: string };
    cleanupBookings.push({ bookingId: created.bookingId, session: memberSession });

    await measured.recorder.begin("open-my-bookings-after-create");
    await measured.page.goto(tenantUrl("bookinger"));
    await expect(
      measured.page.getByRole("heading", { level: 1, name: "Mine bookinger" })
    ).toBeVisible();
    const createdRow = measured.page
      .locator('[data-ui="collection-row"]')
      .filter({ hasText: successfulCandidate.court.navn })
      .filter({ hasText: successfulCandidate.slot.slotStartTid })
      .first();
    await expect(createdRow).toBeVisible();
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());

    await createdRow.getByRole("button").first().click();
    await measured.recorder.begin("cancel-member-booking");
    await createdRow.getByRole("button", { name: "Avbestill", exact: true }).click();
    await expect(createdRow).toHaveCount(0);
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());

    await measured.page.goto(tenantUrl());
    await expectUsableBooking(measured.page);
    await measured.page
      .getByRole("group", { name: "Dag" })
      .getByRole("button", {
        name: "I morgen",
        exact: true,
      })
      .click();
    await expectBookingSelectionSettled(measured.page);
    const conflictCandidate = await getBookableSlot(request, memberSession, date);
    if (!conflictCandidate) {
      skipped.push("Bookingkonflikt: ingen bookbar tid i morgen etter opprydding.");
      return skipped;
    }
    const blockingBooking = await createBookingFixture(
      request,
      extendedSession,
      date,
      conflictCandidate
    );
    cleanupBookings.push({ bookingId: blockingBooking, session: extendedSession });
    const conflictingButton = measured.page.getByRole("button", {
      name: bookingButtonName(conflictCandidate.slot),
      exact: true,
    });
    await expect(conflictingButton).toBeVisible();
    await measured.recorder.begin("create-member-booking-conflict");
    await conflictingButton.click();
    await expect(measured.page.getByText("Tiden kunne ikke bookes", { exact: true })).toBeVisible();
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());
    await deleteBookingFixture(request, extendedSession, blockingBooking);
  } finally {
    await measured.context.close();
  }
  return skipped;
}

async function measureAdminReadSurfaces(
  browser: Browser,
  request: APIRequestContext,
  adminSession: DevelopmentSession,
  flows: NetworkFlow[]
) {
  for (const surface of [
    {
      label: "open-user-administration",
      path: "admin/brukere",
      ready: async (page: Page) => {
        await expect(page.getByRole("heading", { level: 1, name: "Brukere" })).toBeVisible();
        await expect(page.getByText("Laster brukere", { exact: true })).toHaveCount(0);
      },
    },
    {
      label: "open-booking-statistics",
      path: "admin/statistikk",
      ready: async (page: Page) => {
        await expect(page.getByRole("heading", { level: 1, name: "Statistikk" })).toBeVisible();
        await expect(
          page.getByText(/^(Beregnet .+|Ingen bookinger i perioden)$/).first()
        ).toBeVisible();
      },
    },
  ]) {
    const measured = await createMeasuredPage(browser, request, adminSession);
    await measured.recorder.begin(surface.label);
    await measured.page.goto(tenantUrl(surface.path));
    await surface.ready(measured.page);
    measured.recorder.markReady();
    flows.push(await measured.recorder.end());
    await measured.context.close();
  }
}

async function createArrangementThroughUi(
  page: Page,
  recorder: FlowRecorder,
  flows: NetworkFlow[],
  fixture: ArrangementFixture
) {
  await page.getByRole("button", { name: "Nytt arrangement", exact: true }).click();
  const editor = page.getByRole("dialog").filter({
    has: page.getByRole("navigation", { name: "Opprett arrangement" }),
  });
  await expect(editor).toBeVisible();
  await editor.getByRole("combobox", { name: "Gren" }).click();
  await page.getByRole("option", { name: fixture.court.grenNavn, exact: true }).click();
  await editor.getByLabel("Intern beskrivelse").fill(`Performance UI-opprettelse ${Date.now()}`);
  await editor.getByRole("button", { name: "Neste: Tider", exact: true }).click();
  await selectScheduleDate(editor, fixture.daysAhead);
  await editor.getByRole("switch", { name: "Alle ukedager i perioden" }).click();
  await editor.getByRole("button", { name: fixture.court.navn, exact: true }).click();
  await editor.getByRole("button", { name: fixture.slots[3].slotStartTid, exact: true }).click();
  await editor.getByRole("button", { name: "Legg forslag i listen", exact: true }).click();
  const submit = editor.getByRole("button", { name: "Opprett arrangement (1)", exact: true });
  await expect(submit).toBeVisible();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === `/api/klubb/${E2E_TENANT_SLUG}/arrangement`
  );
  await recorder.begin("create-arrangement");
  await submit.click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  await expect(page.getByText("Arrangementet er opprettet", { exact: true })).toBeVisible();
  recorder.markReady();
  flows.push(await recorder.end());
  return ((await response.json()) as { arrangementId: string }).arrangementId;
}

async function createMeasuredPage(
  browser: Browser,
  request: APIRequestContext,
  session?: DevelopmentSession
) {
  const context = await browser.newContext({
    baseURL: `${E2E_APP_ORIGIN}${E2E_APP_BASE_PATH}/`,
    serviceWorkers: "block",
  });
  if (session) {
    await context.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: developmentSessionKey,
      value: JSON.stringify(session),
    });
  }
  const page = await context.newPage();
  return { context, page, recorder: new FlowRecorder(page, request) };
}

class FlowRecorder {
  private active: ActiveFlow | null = null;

  constructor(
    private readonly page: Page,
    private readonly api: APIRequestContext
  ) {
    page.on("request", (request) => this.onRequest(request));
    page.on("requestfinished", (request) => void this.onRequestFinished(request, false));
    page.on("requestfailed", (request) => void this.onRequestFinished(request, true));
  }

  async begin(label: string) {
    if (this.active) throw new Error(`Målingen ${this.active.label} er fortsatt aktiv.`);
    await marker(this.api, label, "start");
    this.active = {
      label,
      readyMs: null,
      requests: new Map(),
      result: [],
      startedAt: new Date().toISOString(),
      startedAtMs: performance.now(),
    };
  }

  markReady() {
    if (!this.active) throw new Error("Ingen aktiv måling.");
    this.active.readyMs = round(performance.now() - this.active.startedAtMs);
  }

  async end(): Promise<NetworkFlow> {
    const active = this.active;
    if (!active) throw new Error("Ingen aktiv måling.");
    await this.waitForStableNetwork(active);
    const finishedAtMs = performance.now();
    this.active = null;
    await marker(this.api, active.label, "end");
    const requests = active.result.sort((left, right) => left.startMs - right.startMs);
    return {
      apiCalls: requests.length,
      decodedBodyBytes: requests.reduce((sum, request) => sum + request.decodedBodyBytes, 0),
      finishedAt: new Date().toISOString(),
      label: active.label,
      readyMs: active.readyMs,
      requests,
      sequentialRounds: countSequentialRounds(requests),
      startedAt: active.startedAt,
      totalDurationMs: round(finishedAtMs - active.startedAtMs),
    };
  }

  private onRequest(request: Request) {
    const active = this.active;
    if (!active || !isApiRequest(request.url())) return;
    active.requests.set(request, { startMs: performance.now() - active.startedAtMs });
  }

  private async onRequestFinished(request: Request, failed: boolean) {
    const active = this.active;
    const pending = active?.requests.get(request);
    if (!active || !pending) return;
    active.requests.delete(request);
    const response = await request.response();
    let decodedBodyBytes = 0;
    if (response) {
      try {
        decodedBodyBytes = (await response.body()).byteLength;
      } catch {
        decodedBodyBytes = 0;
      }
    }
    const responseEnd = request.timing().responseEnd;
    active.result.push({
      cacheHeaders: {
        age: response ? await response.headerValue("age") : null,
        cacheControl: response ? await response.headerValue("cache-control") : null,
        etag: response ? await response.headerValue("etag") : null,
        xCache: response ? await response.headerValue("x-cache") : null,
      },
      decodedBodyBytes,
      durationMs: round(
        responseEnd >= 0 ? responseEnd : performance.now() - active.startedAtMs - pending.startMs
      ),
      failed,
      fromServiceWorker: response?.fromServiceWorker() ?? false,
      method: request.method(),
      path: apiPath(request.url()),
      startMs: round(pending.startMs),
      status: response?.status() ?? null,
    });
  }

  private async waitForStableNetwork(active: ActiveFlow) {
    const deadline = performance.now() + 15_000;
    let stableSince = active.requests.size === 0 ? performance.now() : null;
    while (performance.now() < deadline) {
      if (active.requests.size === 0) {
        stableSince ??= performance.now();
        if (performance.now() - stableSince >= 500) return;
      } else {
        stableSince = null;
      }
      await this.page.waitForTimeout(50);
    }
    throw new Error(`${active.label} hadde fortsatt ${active.requests.size} API-kall etter 15 s.`);
  }
}

async function developmentLogin(request: APIRequestContext, profile: DevelopmentProfile) {
  const response = await request.post(`${E2E_BACKEND_ORIGIN}/api/dev-auth/login`, {
    data: { profile },
  });
  expect(response.ok()).toBe(true);
  return (await response.json()) as DevelopmentSession;
}

async function createArrangementFixture(
  request: APIRequestContext,
  session: DevelopmentSession
): Promise<ArrangementFixture> {
  const headers = developmentAuthorization(session);
  const courtsResponse = await request.get(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/baner?inkluderInaktive=true`,
    { headers }
  );
  expect(courtsResponse.ok()).toBe(true);
  const courts = ((await courtsResponse.json()) as Court[]).filter(
    (court) => court.aktiv && !court.harOverstyring
  );

  for (let daysAhead = 0; daysAhead <= 7; daysAhead += 1) {
    const date = addDays(todayIso(), daysAhead);
    for (const court of courts) {
      const calendarResponse = await request.get(
        `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/kalender?baneId=${court.id}&dato=${date}`,
        { headers }
      );
      if (!calendarResponse.ok()) continue;
      const available = ((await calendarResponse.json()) as CalendarSlot[]).filter(
        (slot) => !slot.bookingId && !slot.erPassert
      );
      if (available.length < 4) continue;

      const slots = available.slice(-4) as [CalendarSlot, CalendarSlot, CalendarSlot, CalendarSlot];
      const title = `Performance baseline ${Date.now()}`;
      const createResponse = await request.post(
        `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/arrangement`,
        {
          data: {
            baneGrupper: [{ baneIder: [court.id], tidspunkter: [slots[0].slotStartTid] }],
            beskrivelse: "Performance baseline original",
            eksplisitteSlots: [
              {
                baneId: court.id,
                dato: date,
                sluttTid: slots[0].slotSluttTid,
                startTid: slots[0].slotStartTid,
              },
            ],
            grenId: court.grenId,
            kategori: "Annet",
            publisertPåNettsiden: false,
            sluttDato: date,
            startDato: date,
            tittel: title,
            ukedager: [dayOfWeek(date)],
          },
          headers,
        }
      );
      if (!createResponse.ok()) continue;
      const result = (await createResponse.json()) as {
        arrangementId: string;
        antallOpprettet: number;
      };
      if (result.antallOpprettet !== 1) {
        await deleteArrangementFixture(request, session, result.arrangementId);
        continue;
      }
      return { arrangementId: result.arrangementId, court, date, daysAhead, slots, title };
    }
  }

  throw new Error("Fant ikke fire ledige slots på samme aktive bane de neste åtte dagene.");
}

async function getBookableSlot(
  request: APIRequestContext,
  session: DevelopmentSession,
  date: string
) {
  const response = await request.get(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/booking-bootstrap?dato=${date}`,
    { headers: developmentAuthorization(session) }
  );
  expect(response.ok()).toBe(true);
  const bootstrap = (await response.json()) as {
    baner: Court[];
    kalenderSlots: CalendarSlot[];
    valgtBaneId: string | null;
  };
  const court = bootstrap.baner.find((candidate) => candidate.id === bootstrap.valgtBaneId);
  const slot = bootstrap.kalenderSlots.find(
    (candidate) =>
      !candidate.bookingId &&
      !candidate.erPassert &&
      (candidate.kapabiliteter?.includes("booking:book") ?? true)
  );
  return court && slot ? { court, slot } : null;
}

async function createBookingFixture(
  request: APIRequestContext,
  session: DevelopmentSession,
  date: string,
  candidate: { court: Court; slot: CalendarSlot }
) {
  const response = await request.post(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/bookinger`,
    {
      data: {
        baneId: candidate.court.id,
        dato: date,
        sluttTid: candidate.slot.slotSluttTid,
        startTid: candidate.slot.slotStartTid,
      },
      headers: developmentAuthorization(session),
    }
  );
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { bookingId: string }).bookingId;
}

async function deleteBookingFixture(
  request: APIRequestContext,
  session: DevelopmentSession,
  bookingId: string
) {
  const response = await request.delete(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/bookinger/${bookingId}`,
    { headers: developmentAuthorization(session) }
  );
  expect(response.ok() || response.status() === 404).toBe(true);
}

async function deleteArrangementFixture(
  request: APIRequestContext,
  session: DevelopmentSession,
  arrangementId: string
) {
  const response = await request.delete(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/arrangement/${arrangementId}`,
    { headers: developmentAuthorization(session) }
  );
  expect(response.ok() || response.status() === 404).toBe(true);
}

async function restoreCourt(request: APIRequestContext, session: DevelopmentSession, court: Court) {
  const headers = developmentAuthorization(session);
  const generalResponse = await request.put(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/baner/${court.id}`,
    {
      data: {
        aktiv: court.aktiv,
        beskrivelse: court.beskrivelse,
        grenId: court.grenId,
        navn: court.navn,
        sortering: court.sortering,
      },
      headers,
    }
  );
  expect(generalResponse.ok()).toBe(true);
  const overrideResponse = await request.put(
    `${E2E_BACKEND_ORIGIN}/api/klubb/${E2E_TENANT_SLUG}/baner/${court.id}/booking-innstillinger`,
    {
      data: court.bookingOverstyring ?? {
        aapningstid: null,
        dagerFremITid: null,
        maksPerDag: null,
        maksTotalt: null,
        slotLengdeMinutter: null,
        stengetid: null,
      },
      headers,
    }
  );
  expect(overrideResponse.ok()).toBe(true);
}

async function expectUsableBooking(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Book bane" })).toBeVisible();
  await expect(page.getByRole("region", { name: /ledige tider$/ })).toBeVisible();
}

async function expectBookingSelectionSettled(page: Page) {
  await expect(page.getByRole("region", { name: /ledige tider$/ })).toBeVisible();
  await expect(page.getByText("Laster tider …", { exact: true })).toHaveCount(0);
}

async function selectScheduleDate(editor: Locator, daysAhead: number) {
  const nextDayButtons = editor.getByRole("button", { name: "Neste dag" });
  for (let day = 0; day < daysAhead; day += 1) {
    await nextDayButtons.nth(1).click();
    await nextDayButtons.nth(0).click();
  }
}

async function marker(api: APIRequestContext, label: string, boundary: "end" | "start") {
  const response = await api.get(
    `${E2E_BACKEND_ORIGIN}/api/health/cache?performanceFlow=${encodeURIComponent(label)}&boundary=${boundary}`
  );
  expect(response.ok()).toBe(true);
}

function setMemberTermsAcceptance(accepted: boolean) {
  const assignments = accepted
    ? `"VilkaarAkseptertDato" = NOW(), "VilkaarVersjon" = '2025-06-27'`
    : '"VilkaarAkseptertDato" = NULL, "VilkaarVersjon" = NULL';
  const sql = `UPDATE "Brukere" SET ${assignments} WHERE "Sub" = 'dev|medlem';`;
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "db",
      "sh",
      "-c",
      'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$1"',
      "performance-baseline",
      sql,
    ],
    { cwd: backendRoot, stdio: "pipe" }
  );
}

function developmentAuthorization(session: DevelopmentSession) {
  return { Authorization: `DevelopmentBearer ${session.accessToken}` };
}

function tenantUrl(relativePath = "") {
  const suffix = relativePath ? `/${relativePath.replace(/^\/+|\/+$/g, "")}` : "";
  return `${E2E_APP_ORIGIN}${E2E_APP_BASE_PATH}/${E2E_TENANT_SLUG}${suffix}`;
}

function isApiRequest(url: string) {
  return new URL(url).pathname.startsWith("/api/");
}

function apiPath(url: string) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}

function countSequentialRounds(requests: NetworkRequest[]) {
  let rounds = 0;
  let currentRoundEnd = -1;
  for (const request of requests) {
    const requestEnd = request.startMs + request.durationMs;
    if (request.startMs > currentRoundEnd + 5) rounds += 1;
    currentRoundEnd = Math.max(currentRoundEnd, requestEnd);
  }
  return rounds;
}

function bookingRowName(courtName: string, slot: CalendarSlot) {
  return `Rediger ${courtName}, ${slot.slotStartTid}–${slot.slotSluttTid}`;
}

function bookingButtonName(slot: CalendarSlot) {
  return `Book tiden ${slot.slotStartTid} til ${slot.slotSluttTid}`;
}

function todayIso() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function dayOfWeek(date: string) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date(`${date}T12:00:00`).getDay()
  ];
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
