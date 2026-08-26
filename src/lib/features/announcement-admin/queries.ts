import type { QueryClient } from "@tanstack/svelte-query";
import type { OpprettKunngjøringForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantResources, tenantQueryMeta } from "$lib/platform/query";
import { createAnnouncement, deactivateAnnouncement, getActiveAnnouncement } from "./api";
import { announcementAdminQueryKeys } from "./query-keys";

export function activeAnnouncementQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "announcements"),
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
    onSuccess: (announcement: Awaited<ReturnType<typeof createAnnouncement>>) => {
      queryClient.setQueryData(announcementAdminQueryKeys.active(slug), announcement);
      return invalidateTenantResources(queryClient, slug, ["user"]);
    },
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
    onSuccess: () => {
      queryClient.setQueryData(announcementAdminQueryKeys.active(slug), null);
      return invalidateTenantResources(queryClient, slug, ["user"]);
    },
    retry: false,
  };
}
