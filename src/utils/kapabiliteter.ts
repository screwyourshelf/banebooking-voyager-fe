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
  },
  klubb: {
    admin: "klubb:admin",
  },
  baner: {
    admin: "baner:admin",
  },
  brukere: {
    admin: "brukere:admin",
  },
} as const;
