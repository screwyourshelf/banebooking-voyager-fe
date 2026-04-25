export type BookingSuksessRespons = {
  bookingId?: string;
  melding: string;
};

// Requests
export type OpprettBookingForespørsel = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
};
