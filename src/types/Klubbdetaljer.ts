// Response
export type BookingRegelRespons = {
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

export type KlubbRespons = {
  slug: string;
  navn: string;
  kontaktEpost?: string;
  banereglement?: string;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
  bookingRegel: BookingRegelRespons;
};
