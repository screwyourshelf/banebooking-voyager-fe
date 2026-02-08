export type KlubbDetaljer = {
  slug: string;
  navn: string;
  kontaktEpost?: string;
  banereglement?: string;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
  bookingRegel: {
    aapningstid: string;
    stengetid: string;
    maksPerDag: number;
    maksTotalt: number;
    dagerFremITid: number;
    slotLengdeMinutter: number;
  };
};
