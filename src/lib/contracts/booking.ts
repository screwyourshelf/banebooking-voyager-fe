// Transportkontrakter for bookingmutasjoner.
export type BookingSuksessRespons = {
  bookingId?: string;
  melding: string;
  slettetArrangementId?: string | null;
};

// Requests
export type OpprettBookingForespørsel = {
  arrangementId?: string;
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
};
