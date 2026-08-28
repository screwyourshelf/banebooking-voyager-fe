import type {
  ArrangementBookingRespons,
  ArrangementRespons,
  BaneRespons,
  GrenRespons,
} from "$lib/contracts";

export const activity: GrenRespons = {
  aktiv: true,
  banereglement: "",
  bookingInnstillinger: {
    aapningstid: "08:00",
    dagerFremITid: 30,
    maksPerDag: 2,
    maksKommende: 4,
    slotLengdeMinutter: 60,
    stengetid: "10:00",
  },
  id: "activity-1",
  kapabiliteter: [],
  navn: "Tennis",
  slug: "tennis",
  sortering: 0,
};

export const court: BaneRespons = {
  aktiv: true,
  beskrivelse: "Ved klubbhuset",
  bookingInnstillinger: activity.bookingInnstillinger,
  bookingOverstyring: null,
  grenId: activity.id,
  grenNavn: activity.navn,
  harOverstyring: false,
  id: "court-1",
  kapabiliteter: [],
  navn: "Bane 1",
  sortering: 0,
};

export const arrangement: ArrangementRespons = {
  baneGrupper: [],
  beskrivelse: "Intern cup",
  booketAv: "Ada",
  erPassert: false,
  grenNavn: activity.navn,
  grenSlug: activity.slug,
  id: "event-1",
  kapabiliteter: ["arrangement:avlys"],
  kategori: "Turnering",
  nettsideBeskrivelse: "",
  nettsideTittel: "Høstcup",
  presentasjon: {
    baneNavn: [court.navn],
    sluttDato: "2026-08-24",
    startDato: "2026-08-24",
    tidspunkter: ["08:00"],
    type: "EnkeltDato",
    ukedager: ["Monday"],
  },
  publisertPåNettsiden: false,
  slotsPrDag: [],
  sluttDato: "2026-08-24",
  startDato: "2026-08-24",
  tittel: "Høstcup",
  ukedager: ["Monday"],
};

export const arrangementBooking: ArrangementBookingRespons = {
  baneId: court.id,
  baneNavn: court.navn,
  bookingId: "booking-1",
  dato: "2026-08-24",
  sluttTid: "09:00",
  startTid: "08:00",
};
