import type { ArrangementPresentasjon } from "@/types/Arrangement";
import { dayOfWeekTilIso, sorterUkedager, ukedagTilLangNorsk } from "./datoUtils";
import type { DayOfWeek } from "@/types/Arrangement";

function dayOfWeekTilIsoLokal(day: DayOfWeek): number {
  return dayOfWeekTilIso(day);
}

function parseDato(datoStr: string): Date {
  return new Date(`${datoStr}T00:00:00`);
}

function formatDatoMedMåned(datoStr: string): string {
  return parseDato(datoStr).toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
}

function formatKompaktDatoIntervall(startDato: string, sluttDato: string): string {
  if (startDato === sluttDato) {
    return parseDato(startDato).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const start = parseDato(startDato);
  const slutt = parseDato(sluttDato);

  if (start.getMonth() === slutt.getMonth() && start.getFullYear() === slutt.getFullYear()) {
    const sluttFormatert = formatDatoMedMåned(sluttDato);
    return `${start.getDate()}.–${sluttFormatert}`;
  }

  return `${formatDatoMedMåned(startDato)} – ${formatDatoMedMåned(sluttDato)}`;
}

function formatUkedagerIntervall(ukedager: DayOfWeek[]): string {
  if (ukedager.length === 0) return "";

  const isos = ukedager.map(dayOfWeekTilIsoLokal) as (1 | 2 | 3 | 4 | 5 | 6 | 7)[];
  const sortert = sorterUkedager(isos);
  const navn = sortert.map(ukedagTilLangNorsk);

  if (sortert.length >= 2) {
    const first = sortert[0];
    const last = sortert[sortert.length - 1];
    if (last - first === sortert.length - 1) {
      return `${navn[0]}–${navn[navn.length - 1]}`;
    }
  }

  return listeFormat(navn);
}

function listeFormat(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} og ${items[items.length - 1]}`;
}

function formatTidspunkter(tidspunkter: string[]): string {
  if (tidspunkter.length === 0) return "";
  const formatted = tidspunkter.map((t) => t.substring(0, 5));
  return `kl.\u00a0${listeFormat(formatted)}`;
}

export type PresentasjonLinjer = {
  dato: string;
  tidspunkt: string;
  baner: string;
};

/**
 * Bygger strukturerte visningslinjer fra presentasjonsmodellen.
 * Frontend kan bruke disse direkte i UI uten videre logikk.
 */
export function byggPresentasjonLinjer(p: ArrangementPresentasjon): PresentasjonLinjer {
  const dato = formatKompaktDatoIntervall(p.startDato, p.sluttDato);

  const ukedagDel = formatUkedagerIntervall(p.ukedager);
  const tidDel = formatTidspunkter(p.tidspunkter);

  let tidspunkt: string;
  if (ukedagDel && tidDel) {
    tidspunkt = `${ukedagDel} \u00b7 ${tidDel}`;
  } else {
    tidspunkt = ukedagDel || tidDel;
  }

  const baner = listeFormat(p.baneNavn);

  return { dato, tidspunkt, baner };
}
