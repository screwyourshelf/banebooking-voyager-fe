import { createTenantQueryKey } from "$lib/platform/query";

export const accountQueryKeys = {
  booking: (slug: string) => createTenantQueryKey("booking", slug),
  myBookings: (slug: string) => [...accountQueryKeys.booking(slug), "mine"] as const,
  myBookingsList: (slug: string, includeHistorical: boolean) =>
    [...accountQueryKeys.myBookings(slug), { includeHistorical }] as const,
  bookingCalendar: (slug: string, courtId: string, date: string) =>
    [...accountQueryKeys.booking(slug), "calendar", { courtId, date }] as const,
};
