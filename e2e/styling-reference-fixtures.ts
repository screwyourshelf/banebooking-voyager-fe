import type { Page, Route } from "@playwright/test";
import {
  createActivity,
  createBootstrap,
  createCourt,
  createSlot,
} from "../src/lib/features/booking/booking-test-data";
import { createStatisticsData } from "../src/lib/features/statistics/statistics-test-data";
import type { DevelopmentProfile } from "./harness";

export const STYLING_REFERENCE_TIME = "2026-08-23T12:00:00+02:00";

type StylingReferenceFixtureOptions = {
  capabilities?: readonly string[];
  profile?: DevelopmentProfile;
};

const tenantSlug = "aas-tennisklubb";
const clubApiPath = `/api/klubb/${tenantSlug}`;
const bookingDate = "2026-08-23";

const club = {
  slug: tenantSlug,
  navn: "Ås tennisklubb",
  kontaktEpost: "post@example.test",
  nettside: "https://example.test",
  latitude: 59.66,
  longitude: 10.77,
  feedUrl: "https://example.test/rss.xml",
  feedSynligAntallDager: 14,
};

const tennis = createActivity({
  id: "activity-tennis",
  navn: "Tennis",
  slug: "tennis",
});
const padel = createActivity({
  id: "activity-padel",
  navn: "Padel",
  slug: "padel",
  sortering: 2,
});
const centreCourt = createCourt({
  id: "court-centre",
  navn: "Senterbanen",
  beskrivelse: "Utendørs",
  grenId: tennis.id,
  grenNavn: tennis.navn,
});
const parkCourt = createCourt({
  id: "court-park",
  navn: "Parkbanen",
  beskrivelse: "Kunstgress",
  grenId: tennis.id,
  grenNavn: tennis.navn,
  sortering: 2,
});
const padelCourt = createCourt({
  id: "court-padel",
  navn: "Padelbane 1",
  beskrivelse: "Innendørs",
  grenId: padel.id,
  grenNavn: padel.navn,
});

const bookingSlots = [
  createSlot({
    baneId: centreCourt.id,
    baneNavn: centreCourt.navn,
    dato: bookingDate,
    slotStartTid: "14:00",
    slotSluttTid: "15:00",
    kapabiliteter: ["booking:book"],
    temperatur: 19.2,
    vind: 2.8,
    værSymbol: "fair_day",
  }),
  createSlot({
    bookingId: "booking-own",
    baneId: centreCourt.id,
    baneNavn: centreCourt.navn,
    dato: bookingDate,
    slotStartTid: "15:00",
    slotSluttTid: "16:00",
    bookingStartTid: "15:00",
    bookingSluttTid: "16:00",
    booketAv: "Visuelt medlem",
    erEier: true,
    kapabiliteter: ["booking:fjern"],
  }),
  createSlot({
    bookingId: "booking-event",
    baneId: centreCourt.id,
    baneNavn: centreCourt.navn,
    dato: bookingDate,
    slotStartTid: "16:00",
    slotSluttTid: "17:00",
    bookingStartTid: "16:00",
    bookingSluttTid: "17:00",
    booketAv: "Turneringskomiteen",
    arrangementId: "event-autumn",
    arrangementTittel: "Høstturnering",
    arrangementBeskrivelse: "Åpen klubbturnering med puljespill.",
    kapabiliteter: [],
  }),
  createSlot({
    baneId: centreCourt.id,
    baneNavn: centreCourt.navn,
    dato: bookingDate,
    slotStartTid: "17:00",
    slotSluttTid: "18:00",
    kapabiliteter: ["booking:book"],
  }),
];

const bookingBootstrap = createBootstrap({
  klubb: club,
  grener: [tennis, padel],
  baner: [centreCourt, parkCourt, padelCourt],
  valgtGrenId: tennis.id,
  valgtBaneId: centreCourt.id,
  dato: bookingDate,
  kalenderSlots: bookingSlots,
});

const adminUsers = [
  {
    id: "visual-admin",
    epost: "admin@example.test",
    visningsnavn: "Visuell administrator",
    roller: ["KlubbAdmin"],
    kapabiliteter: ["bruker:seSperre", "bruker:endreVisningsnavn"],
    opprettetTid: "2026-08-01T10:00:00Z",
    medlemskapBekreftetDato: "2026-08-02T10:00:00Z",
    fulltNavn: "Ada Administrasjon",
    medlemskapType: "Voksen",
    erSperret: false,
    antallAktiveSperrer: 0,
  },
  {
    id: "user-ola",
    epost: "ola@example.test",
    visningsnavn: "Ola Medlem",
    roller: ["Medlem"],
    kapabiliteter: [
      "bruker:endreRolle",
      "bruker:endreVisningsnavn",
      "bruker:slett",
      "bruker:sperr",
      "bruker:opphevSperre",
      "bruker:seSperre",
    ],
    opprettetTid: "2026-07-01T10:00:00Z",
    måBekrefteMedlemskap: true,
    fulltNavn: "Ola Nordmann",
    medlemskapType: "Familie",
    erSperret: false,
    antallAktiveSperrer: 0,
  },
];

export async function installStylingReferenceFixtures(
  page: Page,
  options: StylingReferenceFixtureOptions = {}
) {
  await page.route(`**${clubApiPath}**`, async (route) => {
    await fulfillClubRequest(route, options);
  });
}

async function fulfillClubRequest(route: Route, options: StylingReferenceFixtureOptions) {
  const request = route.request();
  const url = new URL(request.url());
  const decodedPath = decodeURIComponent(url.pathname);
  const resource = decodedPath.slice(clubApiPath.length);

  if (request.method() !== "GET") {
    await rejectUnexpectedRequest(route, request.method(), resource);
    return;
  }

  if (resource === "") {
    await route.fulfill({ json: club });
    return;
  }
  if (resource === "/bruker") {
    await route.fulfill({ json: createSessionUser(options) });
    return;
  }
  if (resource === "/booking-bootstrap") {
    await route.fulfill({
      json: {
        ...bookingBootstrap,
        bruker: options.profile ? createSessionUser(options) : null,
      },
    });
    return;
  }
  if (resource === "/kalender") {
    await route.fulfill({ json: bookingSlots });
    return;
  }
  if (resource === "/grener") {
    await route.fulfill({ json: [tennis, padel] });
    return;
  }
  if (resource === "/baner") {
    await route.fulfill({ json: [centreCourt, parkCourt, padelCourt] });
    return;
  }
  if (resource === "/medlemskap/status") {
    await route.fulfill({
      json: {
        aktivBekreftelse: {
          id: "membership-2026",
          label: "Sesongen 2026",
          opprettetTidspunkt: "2026-01-02T09:00:00Z",
          gyldigTil: "2026-12-31T23:59:59Z",
        },
        antallBekreftet: 42,
        antallTotalt: 57,
      },
    });
    return;
  }
  if (resource === "/bruker/admin/bruker") {
    await route.fulfill({ json: adminUsers });
    return;
  }
  if (resource === "/kunngjøringer/aktiv") {
    await route.fulfill({ body: "null", contentType: "application/json" });
    return;
  }
  if (resource === "/statistikk/bookinger") {
    await route.fulfill({ json: createStatisticsData() });
    return;
  }

  await rejectUnexpectedRequest(route, request.method(), resource);
}

function createSessionUser({ capabilities = [], profile }: StylingReferenceFixtureOptions) {
  if (!profile) return null;

  return {
    id: `visual-${profile}`,
    epost: `${profile}@example.test`,
    visningsnavn: profile === "admin" ? "Visuell administrator" : "Visuelt medlem",
    roller: profile === "admin" ? ["KlubbAdmin"] : ["Medlem"],
    vilkårAkseptertDato: "2026-08-23T00:00:00Z",
    vilkårVersjon: "1.0",
    kapabiliteter: [...capabilities],
  };
}

async function rejectUnexpectedRequest(route: Route, method: string, resource: string) {
  await route.abort("failed");
  throw new Error(`Uventet API-kall i stylingreferansen: ${method} ${resource || "/"}`);
}
