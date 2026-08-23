import type { BaneRespons, BookingRegelRespons, GrenRespons } from "$lib/contracts";

const bookingRules: BookingRegelRespons = {
  aapningstid: "07:00",
  stengetid: "22:00",
  maksPerDag: 2,
  maksTotalt: 5,
  dagerFremITid: 7,
  slotLengdeMinutter: 60,
};

export function createActivity(overrides: Partial<GrenRespons> = {}): GrenRespons {
  return {
    id: "activity-1",
    navn: "Tennis",
    slug: "tennis",
    banereglement: "Vis hensyn til andre spillere.",
    sortering: 0,
    aktiv: true,
    bookingInnstillinger: bookingRules,
    kapabiliteter: ["grener:admin"],
    ...overrides,
  };
}

export function createCourt(overrides: Partial<BaneRespons> = {}): BaneRespons {
  return {
    id: "court-1",
    navn: "Bane 1",
    beskrivelse: "Ved klubbhuset",
    aktiv: true,
    sortering: 0,
    grenId: "activity-1",
    grenNavn: "Tennis",
    kapabiliteter: ["baner:admin"],
    bookingInnstillinger: bookingRules,
    harOverstyring: false,
    bookingOverstyring: null,
    ...overrides,
  };
}
