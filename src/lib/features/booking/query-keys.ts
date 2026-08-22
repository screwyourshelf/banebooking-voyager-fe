import { createTenantQueryKey } from "$lib/platform/query";

export const bookingQueryKeys = {
  all: (slug: string) => createTenantQueryKey("booking", slug),
  bootstrap: (slug: string, date: string, userIdentity: string) =>
    [...bookingQueryKeys.all(slug), "bootstrap", { date, userIdentity }] as const,
  slots: (slug: string, courtId: string, date: string) =>
    [...bookingQueryKeys.all(slug), "slots", { courtId, date }] as const,
  mine: (slug: string) => [...bookingQueryKeys.all(slug), "mine"] as const,
  activeArrangements: (slug: string, activityId: string) =>
    [...bookingQueryKeys.all(slug), "active-arrangements", { activityId }] as const,
};
