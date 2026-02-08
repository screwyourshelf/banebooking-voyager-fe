export type BookingDto = {
  id: string;
  baneId: string;
  baneNavn: string;
  dato: string; // yyyy-MM-dd
  startTid: string; // HH:mm
  sluttTid: string; // HH:mm
  aktiv: boolean;
  type?: string;
  kommentar?: string;
};
