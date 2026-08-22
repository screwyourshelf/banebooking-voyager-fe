import { createTenantQueryKey } from "$lib/platform/query";

export const sessionQueryKeys = {
  klubb: (slug: string) => createTenantQueryKey("klubb", slug),
  bruker: (slug: string) => createTenantQueryKey("bruker", slug),
};
