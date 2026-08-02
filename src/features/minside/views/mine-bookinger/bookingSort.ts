import type { MinBookingRespons } from "@/types";

export function sortBookingerEtterRelevans(bookinger: MinBookingRespons[]): MinBookingRespons[] {
  return [...bookinger].sort((a, b) => {
    if (a.erPassert !== b.erPassert) return a.erPassert ? 1 : -1;

    const retning = a.erPassert ? -1 : 1;
    const datoDiff = a.dato.localeCompare(b.dato) * retning;
    if (datoDiff !== 0) return datoDiff;
    return a.startTid.localeCompare(b.startTid) * retning;
  });
}

export function buildBookingKey(b: MinBookingRespons): string {
  return b.bookingId ?? `${b.baneId}-${b.dato}-${b.startTid}-${b.sluttTid}`;
}
