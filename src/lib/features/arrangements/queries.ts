import type { QueryClient } from "@tanstack/svelte-query";
import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import { cancelArrangement, getArrangements } from "./api";
import { sortArrangements } from "./model";
import { arrangementQueryKeys } from "./query-keys";

export function arrangementsQueryOptions(
  api: ApiClient,
  slug: string,
  includeHistorical: boolean,
  authenticated: boolean
) {
  return {
    meta: tenantQueryMeta(slug, "arrangements"),
    queryKey: arrangementQueryKeys.list(slug, includeHistorical, authenticated),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getArrangements(api, slug, includeHistorical, authenticated, signal),
    select: sortArrangements,
    staleTime: 5 * 60_000,
  };
}

export function cancelArrangementMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (arrangementId: string) => cancelArrangement(api, slug, arrangementId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: arrangementQueryKeys.all(slug) }),
    retry: false,
  };
}
