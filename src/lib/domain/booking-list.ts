import type { BrukerBookingRespons } from "$lib/contracts";

export function sortBookingsByRelevance(bookings: readonly BrukerBookingRespons[]) {
  return [...bookings].sort((left, right) => {
    if (left.erPassert !== right.erPassert) return left.erPassert ? 1 : -1;
    const direction = left.erPassert ? -1 : 1;
    const dateDifference = left.dato.localeCompare(right.dato) * direction;
    return dateDifference || left.startTid.localeCompare(right.startTid) * direction;
  });
}

export type BookingDateGroup = {
  date: string;
  bookings: BrukerBookingRespons[];
};

export function groupBookingsByDate(bookings: readonly BrukerBookingRespons[]): BookingDateGroup[] {
  return bookings.reduce<BookingDateGroup[]>((groups, booking) => {
    const date = booking.dato.slice(0, 10);
    const lastGroup = groups.at(-1);
    if (lastGroup?.date === date) lastGroup.bookings.push(booking);
    else groups.push({ date, bookings: [booking] });
    return groups;
  }, []);
}

export function buildBookingKey(booking: BrukerBookingRespons) {
  return (
    booking.bookingId || `${booking.baneId}-${booking.dato}-${booking.startTid}-${booking.sluttTid}`
  );
}

export function getBookingActivityOptions(bookings: readonly BrukerBookingRespons[]) {
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
  bookings: readonly BrukerBookingRespons[],
  activityIds: readonly string[]
) {
  if (!activityIds.length) return [...bookings];
  return bookings.filter((booking) => activityIds.includes(booking.grenId));
}
