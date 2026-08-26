import type { BookingstatistikkRespons } from "$lib/contracts";

const comparison = {
  antallBookinger: 28,
  bookedeTimer: 35,
  personligeBookinger: 22,
  arrangementbookinger: 6,
};

export function createStatisticsData(
  overrides: Partial<BookingstatistikkRespons> = {}
): BookingstatistikkRespons {
  return {
    periode: {
      fra: "2026-01-01",
      til: "2026-08-23",
      sammenligningFra: "2025-01-01",
      sammenligningTil: "2025-08-23",
    },
    nøkkeltall: {
      antallBookinger: 36,
      bookedeTimer: 44.5,
      personligeBookinger: 29,
      arrangementbookinger: 7,
    },
    sammenligning: comparison,
    endringBookedeTimerProsent: 27.14,
    perMåned: [
      {
        år: 2026,
        måned: 1,
        antallBookinger: 16,
        bookedeTimer: 19.5,
        personligeBookinger: 13,
        arrangementbookinger: 3,
        sammenligningAntallBookinger: 12,
        sammenligningBookedeTimer: 15,
        endringBookedeTimerProsent: 30,
      },
      {
        år: 2026,
        måned: 2,
        antallBookinger: 20,
        bookedeTimer: 25,
        personligeBookinger: 16,
        arrangementbookinger: 4,
        sammenligningAntallBookinger: 16,
        sammenligningBookedeTimer: 20,
        endringBookedeTimerProsent: 25,
      },
    ],
    perGren: [
      {
        grenId: "activity-tennis",
        grenNavn: "Tennis",
        antallBookinger: 30,
        bookedeTimer: 37,
        personligeBookinger: 24,
        arrangementbookinger: 6,
        sammenligningAntallBookinger: 24,
        sammenligningBookedeTimer: 29,
        endringBookedeTimerProsent: 27.59,
      },
      {
        grenId: "activity-padel",
        grenNavn: "Padel",
        antallBookinger: 6,
        bookedeTimer: 7.5,
        personligeBookinger: 5,
        arrangementbookinger: 1,
        sammenligningAntallBookinger: 4,
        sammenligningBookedeTimer: 6,
        endringBookedeTimerProsent: 25,
      },
    ],
    perBane: [
      {
        baneId: "court-center",
        baneNavn: "Senterbanen",
        grenId: "activity-tennis",
        grenNavn: "Tennis",
        antallBookinger: 18,
        bookedeTimer: 22,
        personligeBookinger: 14,
        arrangementbookinger: 4,
        sammenligningAntallBookinger: 14,
        sammenligningBookedeTimer: 17,
        endringBookedeTimerProsent: 29.41,
      },
    ],
    perUkedag: [
      {
        ukedag: "Monday",
        antallBookinger: 14,
        bookedeTimer: 18,
        sammenligningAntallBookinger: 10,
        sammenligningBookedeTimer: 12,
        endringBookedeTimerProsent: 50,
      },
      {
        ukedag: "Tuesday",
        antallBookinger: 22,
        bookedeTimer: 26.5,
        sammenligningAntallBookinger: 18,
        sammenligningBookedeTimer: 23,
        endringBookedeTimerProsent: 15.22,
      },
    ],
    perTime: Array.from({ length: 24 }, (_, time) => ({
      time,
      bookedeTimer: time === 17 ? 18 : time === 18 ? 26.5 : 0,
      sammenligningBookedeTimer: time === 17 ? 14 : time === 18 ? 21 : 0,
    })),
    medlemmer: {
      aktiveBrukere: 8,
      gjennomsnittBookingerPerBruker: 4.5,
      gjennomsnittBookedeTimerPerBruker: 5.56,
      toppBrukere: [
        {
          brukerId: "user-1",
          navn: "Ada Lovelace",
          epost: "ada@example.no",
          antallBookinger: 9,
          bookedeTimer: 11.5,
          personligeBookinger: 7,
          arrangementbookinger: 2,
        },
      ],
    },
    medlemmerPerBookingtype: {
      vanlige: {
        aktiveBrukere: 7,
        gjennomsnittBookingerPerBruker: 4.14,
        gjennomsnittBookedeTimerPerBruker: 5,
        toppBrukere: [],
      },
      arrangement: {
        aktiveBrukere: 3,
        gjennomsnittBookingerPerBruker: 2.33,
        gjennomsnittBookedeTimerPerBruker: 2.5,
        toppBrukere: [],
      },
    },
    generertTidspunkt: "2026-08-23T12:30:00Z",
    ...overrides,
  };
}
