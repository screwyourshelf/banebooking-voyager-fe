import { createTenantQueryKey } from "#lib/platform/query/index.ts";

export const arrangementQueryKeys = {
  all: (slug: string) => createTenantQueryKey("arrangements", slug),
  list: (slug: string, includeHistorical: boolean, authenticated: boolean) =>
    [...arrangementQueryKeys.all(slug), "list", { authenticated, includeHistorical }] as const,
};
