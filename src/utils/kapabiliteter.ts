export const Kapabiliteter = {
  booking: {
    book: "booking:book",
    avbestill: "booking:avbestill",
    slett: "booking:slett",
    kobleTilArrangement: "booking:kobleTilArrangement",
    meldAv: "booking:meldAv",
    meldPaa: "booking:meldPaa",
  },
  arrangement: {
    kopierLenke: "arrangement:kopierLenke",
    avlys: "arrangement:avlys",
    meldAv: "arrangement:meldAv",
    meldPaa: "arrangement:meldPaa",
    se: "arrangement:se",
    seTurnering: "arrangement:seTurnering",
    administrerTurnering: "arrangement:administrerTurnering",
  },
  klubb: {
    admin: "klubb:admin",
  },
  baner: {
    admin: "baner:admin",
  },
  brukere: {
    admin: "brukere:admin",
    slett: "bruker:slett",
    sperr: "bruker:sperr",
    opphevSperre: "bruker:opphevSperre",
    seSperre: "bruker:seSperre",
  },
  turnering: {
    administrer: "turnering:administrer",
    leggTilAnsvarlig: "turnering:leggTilAnsvarlig",
    meldPaaKlasse: "turnering:meldPaaKlasse",
    seKampprogram: "turnering:seKampprogram",
    registrerResultat: "turnering:registrerResultat",
    genererKampplan: "turnering:genererKampplan",
    frøSluttspill: "turnering:frøSluttspill",
  },
} as const;
