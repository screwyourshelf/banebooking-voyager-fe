export type BookingRegelDto = {
  aapningstid: string; // "07:00"
  stengetid: string;   // "22:00"
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

export type OppdaterKlubb = {
  navn: string;
  kontaktEpost?: string;
  banereglement?: string;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
  bookingRegel: BookingRegelDto;
};
