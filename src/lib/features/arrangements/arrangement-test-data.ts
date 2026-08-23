import type { ArrangementRespons } from "$lib/contracts";

export function createArrangement(overrides: Partial<ArrangementRespons> = {}): ArrangementRespons {
  return {
    id: "event-1",
    tittel: "Høstcup",
    beskrivelse: "Velkommen til klubbens årlige høstcup.",
    nettsideTittel: "Høstcup",
    nettsideBeskrivelse: "Velkommen til klubbens årlige høstcup.",
    publisertPåNettsiden: true,
    booketAv: "Ada Lovelace",
    grenNavn: "Tennis",
    grenSlug: "tennis",
    kategori: "Turnering",
    startDato: "2026-08-25",
    sluttDato: "2026-08-27",
    baneGrupper: [],
    ukedager: ["Tuesday", "Wednesday", "Thursday"],
    erPassert: false,
    kapabiliteter: ["arrangement:avlys"],
    presentasjon: {
      type: "DatoIntervallAlleDager",
      startDato: "2026-08-25",
      sluttDato: "2026-08-27",
      ukedager: ["Tuesday", "Wednesday", "Thursday"],
      tidspunkter: ["10:00"],
      baneNavn: ["Bane 1"],
    },
    slotsPrDag: [
      {
        dato: "2026-08-25",
        slots: [{ startTid: "10:00", sluttTid: "11:00", baneNavn: ["Bane 1"] }],
      },
    ],
    ...overrides,
  };
}
