import type { QueryClient } from "@tanstack/svelte-query";
import type {
  BatchLeggTilArrangementBookingerForespørsel,
  LeggTilArrangementBookingForespørsel,
  OpprettArrangementForespørsel,
  OppdaterArrangementMetadataForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantQueries } from "$lib/platform/query";
import {
  addArrangementBooking,
  addArrangementBookingsBatch,
  createArrangement,
  deleteArrangement,
  deleteArrangementBooking,
  getAdminArrangements,
  getArrangementActivities,
  getArrangementBookings,
  getArrangementCourts,
  previewArrangement,
  previewArrangementEdit,
  updateArrangementMetadata,
} from "./api";
import { arrangementAdminQueryKeys } from "./query-keys";

export function adminArrangementsQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    queryKey: arrangementAdminQueryKeys.arrangements(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getAdminArrangements(api, slug, signal),
    staleTime: 30_000,
  };
}

export function arrangementActivitiesQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    queryKey: arrangementAdminQueryKeys.activities(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getArrangementActivities(api, slug, signal),
    staleTime: 60_000,
  };
}

export function arrangementCourtsQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    queryKey: arrangementAdminQueryKeys.courts(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getArrangementCourts(api, slug, signal),
    staleTime: 60_000,
  };
}

export function arrangementBookingsQueryOptions(
  api: ApiClient,
  slug: string,
  arrangementId: string
) {
  return {
    enabled: Boolean(arrangementId),
    queryKey: arrangementAdminQueryKeys.bookings(slug, arrangementId),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getArrangementBookings(api, slug, arrangementId, signal),
    staleTime: 30_000,
  };
}

export function previewArrangementMutationOptions(
  api: ApiClient,
  slug: string,
  arrangementId?: string
) {
  return {
    mutationFn: (request: OpprettArrangementForespørsel) =>
      arrangementId
        ? previewArrangementEdit(api, slug, arrangementId, request)
        : previewArrangement(api, slug, request),
    retry: false,
  };
}

export function createArrangementMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (request: OpprettArrangementForespørsel) => createArrangement(api, slug, request),
    onSuccess: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function updateArrangementMetadataMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  arrangementId: string
) {
  return {
    mutationFn: (request: OppdaterArrangementMetadataForespørsel) =>
      updateArrangementMetadata(api, slug, arrangementId, request),
    onSuccess: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function deleteArrangementMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (arrangementId: string) => deleteArrangement(api, slug, arrangementId),
    onSuccess: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function addArrangementBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  arrangementId: string
) {
  return {
    mutationFn: (request: LeggTilArrangementBookingForespørsel) =>
      addArrangementBooking(api, slug, arrangementId, request),
    onSettled: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function addArrangementBookingsBatchMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  arrangementId: string
) {
  return {
    mutationFn: (request: BatchLeggTilArrangementBookingerForespørsel) =>
      addArrangementBookingsBatch(api, slug, arrangementId, request),
    onSettled: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}

export function deleteArrangementBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  arrangementId: string
) {
  return {
    mutationFn: (bookingId: string) =>
      deleteArrangementBooking(api, slug, arrangementId, bookingId),
    onSettled: () => invalidateTenantQueries(queryClient, slug),
    retry: false,
  };
}
