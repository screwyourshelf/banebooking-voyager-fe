import type { DayOfWeek } from "$lib/contracts/arrangement";

export type UkedagIso = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Man=1 ... Søn=7

export function dateTilUkedagIso(d: Date): UkedagIso {
  const js = d.getDay();
  return (js === 0 ? 7 : js) as UkedagIso;
}

function finnUkedagerIDatoPeriode(fra: Date, til: Date): Set<UkedagIso> {
  const dager = new Set<UkedagIso>();
  const start = new Date(fra.getFullYear(), fra.getMonth(), fra.getDate());
  const slutt = new Date(til.getFullYear(), til.getMonth(), til.getDate());
  for (let d = new Date(start); d <= slutt; d.setDate(d.getDate() + 1)) {
    dager.add(dateTilUkedagIso(d));
  }
  return dager;
}

export function tilDatoTekst(dato: Date): string {
  const år = dato.getFullYear();
  const måned = String(dato.getMonth() + 1).padStart(2, "0");
  const dag = String(dato.getDate()).padStart(2, "0");
  return `${år}-${måned}-${dag}`;
}

export function formatDatoKort(datoInput: string | Date): string {
  const dato = new Date(datoInput);
  return dato.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatTidspunktKort(datoInput: string | Date): string {
  const dato = new Date(datoInput);
  return dato.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formaterDatoGruppe(datoIso: string, referanseDato = new Date()) {
  const dato = new Date(`${datoIso.slice(0, 10)}T00:00:00`);
  const iDag = new Date(
    referanseDato.getFullYear(),
    referanseDato.getMonth(),
    referanseDato.getDate()
  );
  const dagDifferanse = Math.round((dato.getTime() - iDag.getTime()) / 86_400_000);
  const fullDato = dato.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    relativeLabel: dagDifferanse === 0 ? "I dag" : dagDifferanse === 1 ? "I morgen" : null,
    label: fullDato.charAt(0).toLocaleUpperCase("nb-NO") + fullDato.slice(1),
  };
}

const isoToDayOfWeek: Record<UkedagIso, DayOfWeek> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export function isoTilDayOfWeek(iso: UkedagIso): DayOfWeek {
  return isoToDayOfWeek[iso];
}

function isoTilDayOfWeeks(isos: UkedagIso[]): DayOfWeek[] {
  return isos.map(isoTilDayOfWeek);
}

const dayOfWeekTilKortNorsk: Record<DayOfWeek, string> = {
  Monday: "Man",
  Tuesday: "Tir",
  Wednesday: "Ons",
  Thursday: "Tor",
  Friday: "Fre",
  Saturday: "Lør",
  Sunday: "Søn",
};

/** Konverterer DayOfWeek til kort norsk visning ("Man", "Tir", etc.) */
export function dayOfWeekKortNorsk(day: DayOfWeek): string {
  return dayOfWeekTilKortNorsk[day];
}

/** Finner hvilke DayOfWeek som finnes i en datoperiode */
export function finnDayOfWeeksIPeriode(fra: Date, til: Date): DayOfWeek[] {
  const dager = finnUkedagerIDatoPeriode(fra, til);
  return isoTilDayOfWeeks([...dager].sort((a, b) => a - b));
}
