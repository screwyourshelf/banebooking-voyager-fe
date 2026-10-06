// Transportkontrakt for personlige reservasjoner i Mine tider og brukeradministrasjon.
export type BrukerBookingRespons = {
  bookingId: string;
  grenId: string;
  grenNavn: string;
  baneId: string;
  baneNavn: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  erPassert: boolean;
  kapabiliteter: string[];
  værSymbol?: string;
  temperatur?: number;
  vind?: number;
};
