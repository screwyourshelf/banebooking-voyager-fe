import type { LokalBooking } from "../../types";

/**
 * Stabil nøkkel for én booking-kombinasjon.
 * Brukes til deduplisering, merge og conflict tracking.
 */
export function lagBookingNøkkel(
  b: Pick<LokalBooking, "dato" | "startTid" | "sluttTid" | "baneId">
): string {
  return `${b.dato}_${b.startTid}_${b.sluttTid}_${b.baneId}`;
}
/**
 * Sorterer bookinger kronologisk: dato → startTid → baneNavn.
 */
export function sorterBookinger(bookinger: LokalBooking[]): LokalBooking[] {
  return [...bookinger].sort(
    (a, b) =>
      a.dato.localeCompare(b.dato) ||
      a.startTid.localeCompare(b.startTid) ||
      a.baneNavn.localeCompare(b.baneNavn)
  );
}

/**
 * Formatterer dato til "Man 17.06"-format for bruk i BookingListe-tabellen.
 * Forventer "YYYY-MM-DD"-streng.
 */
export function formatDatoMedUkedag(dato: string): string {
  const [år, måned, dag] = dato.split("-").map(Number);
  // Bruk eksplisitt lokal dato for å unngå UTC-offset-problemer
  const d = new Date(år, måned - 1, dag);
  const ukedag = d.toLocaleDateString("nb-NO", { weekday: "short" });
  const datoDel = d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
  return `${ukedag.charAt(0).toUpperCase()}${ukedag.slice(1, 3)} ${datoDel}`;
}

/**
 * Teller antall aktive konflikter i listen (ikke slettet).
 */
export function tellKonflikter(bookinger: LokalBooking[]): number {
  return bookinger.filter((b) => !b.erSlettet && b.status === "konflikt").length;
}
