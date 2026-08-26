import { createTenantQueryKey } from "$lib/platform/query";

export const arrangementAdminQueryKeys = {
  all: (slug: string) => createTenantQueryKey("arrangement-admin", slug),
  arrangements: (slug: string) => [...arrangementAdminQueryKeys.all(slug), "arrangements"] as const,
  activities: (slug: string) => [...arrangementAdminQueryKeys.all(slug), "activities"] as const,
  courts: (slug: string) => [...arrangementAdminQueryKeys.all(slug), "courts"] as const,
  bookings: (slug: string, arrangementId: string) =>
    [...arrangementAdminQueryKeys.all(slug), "bookings", arrangementId] as const,
};
