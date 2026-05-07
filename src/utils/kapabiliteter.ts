export const Kapabiliteter = {
  booking: {
    book: "booking:book",
    fjern: "booking:fjern",
    kobleTilArrangement: "booking:kobleTilArrangement",
  },
  arrangement: {
    avlys: "arrangement:avlys",
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
  grener: {
    admin: "grener:admin",
  },
  brukere: {
    admin: "brukere:admin",
    lese: "brukere:lese",
    slett: "bruker:slett",
    sperr: "bruker:sperr",
    opphevSperre: "bruker:opphevSperre",
    seSperre: "bruker:seSperre",
  },
  medlemskap: {
    aktiver: "medlemskap:aktiver",
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
