import { createTenantQueryKey } from "$lib/platform/query";

export const announcementAdminQueryKeys = {
  all: (slug: string) => createTenantQueryKey("announcement-admin", slug),
  active: (slug: string) => [...announcementAdminQueryKeys.all(slug), "active"] as const,
};
