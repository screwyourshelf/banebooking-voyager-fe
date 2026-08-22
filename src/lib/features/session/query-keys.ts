import { createTenantQueryKey } from "$lib/platform/query";
import type { QueryClient } from "@tanstack/svelte-query";

export const sessionQueryKeys = {
  klubb: (slug: string) => createTenantQueryKey("klubb", slug),
  bruker: (slug: string) => createTenantQueryKey("bruker", slug),
};

export function invalidateSessionBruker(queryClient: QueryClient, slug: string) {
  return queryClient.invalidateQueries({ queryKey: sessionQueryKeys.bruker(slug) });
}
