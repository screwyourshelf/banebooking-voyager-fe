export type KlubbRespons = {
  slug: string;
  navn: string;
  kontaktEpost?: string;
  nettside?: string | null;
  latitude?: number;
  longitude?: number;
  feedUrl?: string;
  feedSynligAntallDager: number;
};
