import type { TurneringStatus } from "@/types";

export const STATUS_REKKEFOLGE: TurneringStatus[] = [
  "Oppsett",
  "PaameldingAapen",
  "Pagaar",
  "Avsluttet",
];

export const STATUS_LABELS: Record<TurneringStatus, string> = {
  Oppsett: "Oppsett",
  PaameldingAapen: "Påmelding åpen",
  Pagaar: "Pågår",
  Avsluttet: "Avsluttet",
};

export function nesteStatus(gjeldende: TurneringStatus): TurneringStatus | null {
  const idx = STATUS_REKKEFOLGE.indexOf(gjeldende);
  return idx >= 0 && idx < STATUS_REKKEFOLGE.length - 1 ? STATUS_REKKEFOLGE[idx + 1]! : null;
}

const TILLATTE_FORRIGE: Partial<Record<TurneringStatus, TurneringStatus>> = {
  PaameldingAapen: "Oppsett",
};

export function forrigeStatus(gjeldende: TurneringStatus): TurneringStatus | null {
  return TILLATTE_FORRIGE[gjeldende] ?? null;
}
