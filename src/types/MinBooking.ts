export type MinBookingRespons = {
  bookingId: string;
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
