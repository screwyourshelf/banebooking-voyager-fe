export type SlotStatus = "ledig" | "passert" | "arrangement" | "din_booking" | "opptatt";

export type KalenderSlotRespons = {
  bookingId: string | null;
  baneId: string;
  baneNavn: string;
  dato: string;
  slotStartTid: string;
  slotSluttTid: string;
  bookingStartTid: string | null;
  bookingSluttTid: string | null;
  booketAv: string | null;
  erEier?: boolean;
  arrangementTittel?: string;
  arrangementBeskrivelse?: string;
  arrangementId?: string;
  erPassert: boolean;
  status?: SlotStatus;
  værSymbol?: string;
  temperatur?: number;
  vind?: number;
  kapabiliteter: string[];
};
