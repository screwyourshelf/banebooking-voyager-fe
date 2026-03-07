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
  sortering: number;
  kapabiliteter: string[];
  bookingInnstillinger: BookingRegelRespons;
  harOverstyring: boolean;
  bookingOverstyring: BaneBookingOverstyringRespons | null;
};

// Requests
export type OpprettBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
  sortering?: number;
};

export type OppdaterBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
  aktiv: boolean;
  sortering?: number;
};

export type OppdaterBaneBookingInnstillingerForespørsel = {
  aapningstid: string | null;
  stengetid: string | null;
  slotLengdeMinutter: number | null;
  maksPerDag: number | null;
  maksTotalt: number | null;
  dagerFremITid: number | null;
};
