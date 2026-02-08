import type { UkedagIso, UkedagKortNorsk } from "@/types/dato";
import type { DayOfWeek } from "@/types/Arrangement";

export const ukedager: readonly UkedagKortNorsk[] = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export const ukedagKortTilIso: Record<UkedagKortNorsk, UkedagIso> = {
  Man: 1, Tir: 2, Ons: 3, Tor: 4, Fre: 5, Lør: 6, Søn: 7,
};

export const ukedagIsoTilKort: Record<UkedagIso, UkedagKortNorsk> = {
  1: "Man", 2: "Tir", 3: "Ons", 4: "Tor", 5: "Fre", 6: "Lør", 7: "Søn",
};

export function ukedagTilLangNorsk(d: UkedagIso): string {
  switch (d) {
    case 1: return "Mandag";
    case 2: return "Tirsdag";
    case 3: return "Onsdag";
    case 4: return "Torsdag";
    case 5: return "Fredag";
    case 6: return "Lørdag";
    case 7: return "Søndag";
  }
}

export function sorterUkedager<T extends UkedagIso>(dager: T[]): T[] {
  return [...dager].sort((a, b) => a - b);
}

export function formatUkedagerLangNorsk(dager: UkedagIso[] | undefined): string {
  if (!dager?.length) return "—";
  return sorterUkedager(dager).map(ukedagTilLangNorsk).join(", ");
}

export function dateTilUkedagIso(d: Date): UkedagIso {
  const js = d.getDay();
  return (js === 0 ? 7 : js) as UkedagIso;
}

export function finnUkedagerIDatoPeriode(fra: Date, til: Date): Set<UkedagIso> {
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

export function formatDatoLang(datoStr: string): string {
  const dato = new Date(`${datoStr}T00:00:00`);
  return dato.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

const dayOfWeekToIso: Record<DayOfWeek, UkedagIso> = {
  Sunday: 7, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const isoToDayOfWeek: Record<UkedagIso, DayOfWeek> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday",
};

export function dayOfWeekTilIso(day: DayOfWeek): UkedagIso {
  return dayOfWeekToIso[day];
}

export function isoTilDayOfWeek(iso: UkedagIso): DayOfWeek {
  return isoToDayOfWeek[iso];
}

export function dayOfWeeksTilIso(days: DayOfWeek[]): UkedagIso[] {
  return days.map(dayOfWeekTilIso);
}

export function isoTilDayOfWeeks(isos: UkedagIso[]): DayOfWeek[] {
  return isos.map(isoTilDayOfWeek);
}

export function formatDayOfWeeksLangNorsk(days: DayOfWeek[] | undefined): string {
  if (!days?.length) return "—";
  const isoDager = dayOfWeeksTilIso(days);
  return sorterUkedager(isoDager).map(ukedagTilLangNorsk).join(", ");
}
