import type { BookingRegelRespons } from "./Klubbdetaljer";

// Response
export type BaneBookingOverstyringRespons = {
  aapningstid: string | null;
  stengetid: string | null;
  slotLengdeMinutter: number | null;
  maksPerDag: number | null;
  maksTotalt: number | null;
  dagerFremITid: number | null;
};

export type BaneRespons = {
  id: string;
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
  tillattHandlinger: string[];
  bookingInnstillinger: BookingRegelRespons;
  harOverstyring: boolean;
  bookingOverstyring: BaneBookingOverstyringRespons | null;
};

// Requests
export type OpprettBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
};

export type OppdaterBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
  aktiv: boolean;
};

export type OppdaterBaneBookingInnstillingerForespørsel = {
  aapningstid: string | null;
  stengetid: string | null;
  slotLengdeMinutter: number | null;
  maksPerDag: number | null;
  maksTotalt: number | null;
  dagerFremITid: number | null;
};
