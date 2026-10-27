import { createTenantQueryKey } from "#lib/platform/query/index.ts";

export const newsQueryKeys = {
  all: (slug: string) => createTenantQueryKey("news", slug),
};
