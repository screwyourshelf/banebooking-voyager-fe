export const Kapabiliteter = {
  booking: {
    book: "booking:book",
    fjern: "booking:fjern",
    kobleTilArrangement: "booking:kobleTilArrangement",
  },
  arrangement: {
    avlys: "arrangement:avlys",
    se: "arrangement:se",
  },
  klubb: {
    admin: "klubb:admin",
  },
  kunngjøring: {
    admin: "kunngjøring:admin",
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
  statistikk: {
    lese: "statistikk:lese",
  },
} as const;
