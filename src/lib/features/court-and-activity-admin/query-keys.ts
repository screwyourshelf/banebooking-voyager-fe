import { createTenantQueryKey } from "$lib/platform/query";

export const courtAndActivityAdminQueryKeys = {
  all: (slug: string) => createTenantQueryKey("court-and-activity-admin", slug),
  courts: (slug: string) => [...courtAndActivityAdminQueryKeys.all(slug), "courts"] as const,
  activities: (slug: string) =>
    [...courtAndActivityAdminQueryKeys.all(slug), "activities"] as const,
};
