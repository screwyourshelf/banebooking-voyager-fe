import type { BrukerRespons, MinBookingRespons } from "$lib/contracts";

export type AccountTab = "profil" | "persondata";
export type DisplayNameMode = "epost" | "navn";

export const MAX_DISPLAY_NAME_LENGTH = 50;
const DISPLAY_NAME_PATTERN = /^[\p{L}\d\s.@'_%+-]{3,}$/u;

export function resolveAccountTab(value: string | null): AccountTab {
  return value === "persondata" ? "persondata" : "profil";
}

export function createDisplayNameDraft(user: BrukerRespons) {
  const displayName = user.visningsnavn?.trim() ?? "";
  const usesEmail = !displayName || displayName === user.epost;
  return {
    mode: (usesEmail ? "epost" : "navn") as DisplayNameMode,
    value: usesEmail ? "" : displayName,
  };
}

export function validateDisplayName(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return "Visningsnavn kan ikke være tomt.";
  if (value.length < 3) return "Visningsnavn må være minst 3 tegn.";
  if (!DISPLAY_NAME_PATTERN.test(value)) return "Visningsnavn inneholder ugyldige tegn.";
  if (value.length > MAX_DISPLAY_NAME_LENGTH) {
    return `Visningsnavn kan ikke være lengre enn ${MAX_DISPLAY_NAME_LENGTH} tegn.`;
  }
  return null;
}

export function resolveDisplayName(user: BrukerRespons, mode: DisplayNameMode, value: string) {
  return mode === "epost" ? user.epost : value.trim();
}

export function sortBookingsByRelevance(bookings: readonly MinBookingRespons[]) {
  return [...bookings].sort((left, right) => {
    if (left.erPassert !== right.erPassert) return left.erPassert ? 1 : -1;
    const direction = left.erPassert ? -1 : 1;
    const dateDifference = left.dato.localeCompare(right.dato) * direction;
    return dateDifference || left.startTid.localeCompare(right.startTid) * direction;
  });
}

export type BookingDateGroup = {
  date: string;
  bookings: MinBookingRespons[];
};

export function groupBookingsByDate(bookings: readonly MinBookingRespons[]): BookingDateGroup[] {
  return bookings.reduce<BookingDateGroup[]>((groups, booking) => {
    const date = booking.dato.slice(0, 10);
    const lastGroup = groups.at(-1);
    if (lastGroup?.date === date) lastGroup.bookings.push(booking);
    else groups.push({ date, bookings: [booking] });
    return groups;
  }, []);
}

export function buildBookingKey(booking: MinBookingRespons) {
  return (
    booking.bookingId || `${booking.baneId}-${booking.dato}-${booking.startTid}-${booking.sluttTid}`
  );
}

export function getBookingActivityOptions(bookings: readonly MinBookingRespons[]) {
  return [
    ...new Map(
      bookings.map((booking) => [
        booking.grenId,
        { value: booking.grenId, label: booking.grenNavn },
      ])
    ).values(),
  ].sort((left, right) => left.label.localeCompare(right.label, "nb-NO"));
}

export function filterBookingsByActivity(
  bookings: readonly MinBookingRespons[],
  activityIds: readonly string[]
) {
  if (!activityIds.length) return [...bookings];
  return bookings.filter((booking) => activityIds.includes(booking.grenId));
}
