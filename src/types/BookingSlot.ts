export type BookingSlotRespons = {
  baneId: string;
  baneNavn: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  booketAv: string | null;
  erEier?: boolean;
  arrangementTittel?: string;
  arrangementBeskrivelse?: string;
  kanBookes: boolean;
  kanAvbestille: boolean;
  kanSlette: boolean;
  erPassert: boolean;
  værSymbol?: string;
  temperatur?: number;
  vind?: number;
};

// Requests
export type OpprettBookingForespørsel = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
};

export type AvbestillBookingForespørsel = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
};
