import { createTenantQueryKey } from "$lib/platform/query";

export const userAdminQueryKeys = {
  all: (slug: string) => createTenantQueryKey("user-admin", slug),
  users: (slug: string) => [...userAdminQueryKeys.all(slug), "users"] as const,
  blocks: (slug: string, userId: string) =>
    [...userAdminQueryKeys.all(slug), "blocks", userId] as const,
};
