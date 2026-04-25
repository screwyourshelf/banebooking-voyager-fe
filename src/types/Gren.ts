import type { BookingRegelRespons } from "./Klubbdetaljer";

// Response
export type GrenRespons = {
  id: string;
  navn: string;
  slug: string;
  banereglement: string;
  sortering: number;
  aktiv: boolean;
  bookingInnstillinger: BookingRegelRespons;
  kapabiliteter: string[];
};

// Requests
export type OpprettGrenForespørsel = {
  navn: string;
  banereglement?: string;
  sortering?: number;
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

export type OppdaterGrenForespørsel = {
  navn: string;
  banereglement?: string;
  sortering?: number;
  aktiv: boolean;
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};
