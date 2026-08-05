import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { DayOfWeek } from "@/types";

const tallformat = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });
const timeformat = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const ukedagsnavn: Record<DayOfWeek, string> = {
  Monday: "Mandag",
  Tuesday: "Tirsdag",
  Wednesday: "Onsdag",
  Thursday: "Torsdag",
  Friday: "Fredag",
  Saturday: "Lørdag",
  Sunday: "Søndag",
};

export function formatAntall(verdi: number) {
  return tallformat.format(verdi);
}

export function formatAntallMedEnhet(verdi: number) {
  return `${formatAntall(verdi)} stk.`;
}

export function formatDesimaltall(verdi: number) {
  return timeformat.format(verdi);
}

export function formatTimer(verdi: number) {
  return `${timeformat.format(verdi)} t`;
}

export function formatProsent(verdi: number | null) {
  if (verdi === null) return null;
  const fortegn = verdi > 0 ? "+" : "";
  return `${fortegn}${timeformat.format(verdi)} %`;
}

export function formatMånedsnavn(måned: number) {
  return format(new Date(2026, måned - 1, 1), "MMM", { locale: nb }).replace(".", "");
}

export function formatDatoIso(dato: string) {
  return format(new Date(`${dato}T00:00:00`), "d. MMM yyyy", { locale: nb });
}

export function formatTidspunkt(dato: string) {
  return new Date(dato).toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUkedag(ukedag: DayOfWeek) {
  return ukedagsnavn[ukedag];
}
