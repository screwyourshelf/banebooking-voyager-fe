export type BookingRespons = {
  id: string;
  baneId: string;
  baneNavn: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  aktiv: boolean;
  type?: string;
  kommentar?: string;
};

export type BookingOperasjonRespons = {
  vellykket: boolean;
  melding: string;
  feilkode?: string;
  bookingId?: string;
};
