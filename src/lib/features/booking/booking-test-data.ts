import type {
  BaneRespons,
  BookingBootstrapRespons,
  GrenRespons,
  KalenderSlotRespons,
} from "$lib/contracts";

export const bookingRules = {
  aapningstid: "08:00",
  stengetid: "22:00",
  maksPerDag: 2,
  maksTotalt: 5,
  dagerFremITid: 14,
  slotLengdeMinutter: 60,
};

export function createActivity(overrides: Partial<GrenRespons> = {}): GrenRespons {
  return {
    id: "activity-1",
    navn: "Tennis",
    slug: "tennis",
    banereglement: "Vis hensyn til andre spillere.",
    sortering: 1,
    aktiv: true,
    bookingInnstillinger: bookingRules,
    kapabiliteter: [],
    ...overrides,
  };
}

export function createCourt(overrides: Partial<BaneRespons> = {}): BaneRespons {
  return {
    id: "court-1",
    navn: "Bane 1",
    beskrivelse: "Utendørs",
    aktiv: true,
    sortering: 1,
    grenId: "activity-1",
    grenNavn: "Tennis",
    kapabiliteter: [],
    bookingInnstillinger: bookingRules,
    harOverstyring: false,
    bookingOverstyring: null,
    ...overrides,
  };
}

export function createSlot(overrides: Partial<KalenderSlotRespons> = {}): KalenderSlotRespons {
  return {
    bookingId: null,
    baneId: "court-1",
    baneNavn: "Bane 1",
    dato: "2026-08-23",
    slotStartTid: "10:00",
    slotSluttTid: "11:00",
    bookingStartTid: null,
    bookingSluttTid: null,
    booketAv: null,
    erPassert: false,
    kapabiliteter: [],
    ...overrides,
  };
}

export function createBootstrap(
  overrides: Partial<BookingBootstrapRespons> = {}
): BookingBootstrapRespons {
  const activity = createActivity();
  const court = createCourt();
  return {
    grener: [activity],
    baner: [court],
    valgtGrenId: activity.id,
    valgtBaneId: court.id,
    dato: "2026-08-23",
    kalenderSlots: [createSlot()],
    ...overrides,
  };
}
