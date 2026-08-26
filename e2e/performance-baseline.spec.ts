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

type DevelopmentProfile = "admin" | "medlem";

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
  slotSluttTid: string;
  slotStartTid: string;
};

type ArrangementFixture = {
  arrangementId: string;
  court: Court;
  date: string;
  daysAhead: number;
  slots: [CalendarSlot, CalendarSlot, CalendarSlot];
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
  const adminSession = await developmentLogin(request, "admin");
  const fixture = await createArrangementFixture(request, adminSession);
  const cleanupCourt = fixture.court;
  const cleanupErrors: unknown[] = [];

  try {
    const anonymous = await createMeasuredPage(browser, request);
    await anonymous.recorder.begin("cold-anonymous-booking-startup");
    await anonymous.page.goto(tenantUrl());
    await expectUsableBooking(anonymous.page);
    anonymous.recorder.markReady();
    flows.push(await anonymous.recorder.end());
    await anonymous.context.close();

    const authenticated = await createMeasuredPage(browser, request, memberSession);
    await authenticated.recorder.begin("cold-authenticated-booking-startup-terms-accepted");
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

    setMemberTermsAcceptance(false);
    const withoutTerms = await createMeasuredPage(browser, request, memberSession);
    await withoutTerms.recorder.begin("cold-authenticated-booking-startup-terms-missing");
    await withoutTerms.page.goto(tenantUrl());
    await expectUsableBooking(withoutTerms.page);
    withoutTerms.recorder.markReady();
    flows.push(await withoutTerms.recorder.end());
    await withoutTerms.context.close();

    const polling = await createMeasuredPage(browser, request, memberSession);
    await polling.page.goto(tenantUrl());
    await expectUsableBooking(polling.page);
    await polling.recorder.begin("foreground-booking-calendar-polling");
    polling.recorder.markReady();
    await polling.page.waitForTimeout(calendarDurationMs);
    flows.push(await polling.recorder.end());
    await polling.context.close();

    const arrangement = await createMeasuredPage(browser, request, adminSession);
    await arrangement.page.goto(tenantUrl("arrangement"));
    await expect(
      arrangement.page.getByRole("heading", { level: 1, name: "Administrer arrangementer" })
    ).toBeVisible();
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
    for (const cleanup of [
      () => restoreCourt(request, adminSession, cleanupCourt),
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
      if (available.length < 3) continue;

      const slots = available.slice(-3) as [CalendarSlot, CalendarSlot, CalendarSlot];
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

  throw new Error("Fant ikke tre ledige slots på samme aktive bane de neste åtte dagene.");
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
