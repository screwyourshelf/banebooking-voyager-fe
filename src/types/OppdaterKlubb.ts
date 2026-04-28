// Request types for Klubb
export type OppdaterKlubbForespørsel = {
  navn: string;
  kontaktEpost?: string;
  nettside?: string;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
};
