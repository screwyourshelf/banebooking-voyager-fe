import type { TurneringStatus } from "@/types";

export const STATUS_REKKEFOLGE: TurneringStatus[] = [
  "Oppsett",
  "PaameldingAapen",
  "PaameldingLukket",
  "DrawPublisert",
  "Pagaar",
  "Avsluttet",
];

export const STATUS_LABELS: Record<TurneringStatus, string> = {
  Oppsett: "Oppsett",
  PaameldingAapen: "Påmelding åpen",
  PaameldingLukket: "Påmelding lukket",
  DrawPublisert: "Draw publisert",
  Pagaar: "Pågår",
  Avsluttet: "Avsluttet",
};

export function nesteStatus(gjeldende: TurneringStatus): TurneringStatus | null {
  const idx = STATUS_REKKEFOLGE.indexOf(gjeldende);
  return idx >= 0 && idx < STATUS_REKKEFOLGE.length - 1 ? STATUS_REKKEFOLGE[idx + 1]! : null;
}
