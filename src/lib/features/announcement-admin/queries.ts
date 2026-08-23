import type { QueryClient } from "@tanstack/svelte-query";
import type { OpprettKunngjøringForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantQueries } from "$lib/platform/query";
import { createAnnouncement, deactivateAnnouncement, getActiveAnnouncement } from "./api";
import { announcementAdminQueryKeys } from "./query-keys";

export function activeAnnouncementQueryOptions(api: ApiClient, slug: string) {
  return {
    queryKey: announcementAdminQueryKeys.active(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getActiveAnnouncement(api, slug, signal),
    staleTime: 30_000,
  };
}

export function createAnnouncementMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (request: OpprettKunngjøringForespørsel) => createAnnouncement(api, slug, request),
    onSuccess: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function deactivateAnnouncementMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (announcementId: string) => deactivateAnnouncement(api, slug, announcementId),
    onSuccess: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}
