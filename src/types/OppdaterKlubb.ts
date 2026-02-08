// Request types for Klubb
export type OppdaterBookingRegelForespørsel = {
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

export type OppdaterKlubbForespørsel = {
  navn: string;
  kontaktEpost?: string;
  banereglement?: string;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
  bookingRegel: OppdaterBookingRegelForespørsel;
};
