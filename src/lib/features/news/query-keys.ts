import { createTenantQueryKey } from "$lib/platform/query";

export const newsQueryKeys = {
  all: (slug: string) => createTenantQueryKey("news", slug),
};
