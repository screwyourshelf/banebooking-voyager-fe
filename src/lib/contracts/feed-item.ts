// Transportkontrakt for klubbens feed.
export type FeedItemRespons = {
  tittel: string;
  innhold: string | null;
  lenke: string;
  publisertDato: string | null;
};
