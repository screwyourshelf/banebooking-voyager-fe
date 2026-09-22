import type { QueryClient } from "@tanstack/svelte-query";
import type {
  ArrangementBookingRespons,
  ArrangementRespons,
  BatchLeggTilArrangementBookingerForespørsel,
  LeggTilArrangementBookingForespørsel,
  OpprettArrangementForespørsel,
  OppdaterArrangementMetadataForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantResources, tenantQueryMeta } from "$lib/platform/query";
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
  updateArrangementBooking,
  updateArrangementMetadata,
} from "./api";
import { arrangementAdminQueryKeys } from "./query-keys";

export type UpdateArrangementBookingVariables = {
  bookingId: string;
  request: LeggTilArrangementBookingForespørsel;
};

export function adminArrangementsQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    meta: tenantQueryMeta(slug, "arrangements"),
    queryKey: arrangementAdminQueryKeys.arrangements(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getAdminArrangements(api, slug, signal),
    staleTime: 5 * 60_000,
  };
}

export function arrangementActivitiesQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    meta: tenantQueryMeta(slug, "activities"),
    queryKey: arrangementAdminQueryKeys.activities(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getArrangementActivities(api, slug, signal),
    staleTime: 10 * 60_000,
  };
}

export function arrangementCourtsQueryOptions(api: ApiClient, slug: string, enabled = true) {
  return {
    enabled,
    meta: tenantQueryMeta(slug, "courts"),
    queryKey: arrangementAdminQueryKeys.courts(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getArrangementCourts(api, slug, signal),
    staleTime: 10 * 60_000,
  };
}

export function arrangementBookingsQueryOptions(
  api: ApiClient,
  slug: string,
  arrangementId: string
) {
  return {
    enabled: Boolean(arrangementId),
    meta: tenantQueryMeta(slug, "arrangement-bookings"),
    queryKey: arrangementAdminQueryKeys.bookings(slug, arrangementId),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getArrangementBookings(api, slug, arrangementId, signal),
    staleTime: 30_000,
  };
}

export function previewArrangementMutationOptions(api: ApiClient, slug: string) {
  return {
    // Både opprettelse og tillegg må sjekke mot alle eksisterende bookinger.
    mutationFn: (request: OpprettArrangementForespørsel) => previewArrangement(api, slug, request),
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
    onSuccess: () => invalidateArrangementDerivedResources(queryClient, slug),
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
    onSuccess: (metadata: Awaited<ReturnType<typeof updateArrangementMetadata>>) => {
      queryClient.setQueryData<ArrangementRespons[]>(
        arrangementAdminQueryKeys.arrangements(slug),
        (arrangements) =>
          arrangements?.map((arrangement) =>
            arrangement.id === metadata.arrangementId
              ? {
                  ...arrangement,
                  beskrivelse: metadata.beskrivelse,
                  kategori: metadata.kategori,
                  nettsideBeskrivelse: metadata.nettsideBeskrivelse,
                  nettsideTittel: metadata.nettsideTittel,
                  publisertPåNettsiden: metadata.publisertPåNettsiden,
                }
              : arrangement
          )
      );
      return invalidateArrangementResourcesOutsideAdmin(queryClient, slug);
    },
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
    onSuccess: (result: Awaited<ReturnType<typeof deleteArrangement>>) => {
      queryClient.setQueryData<ArrangementRespons[]>(
        arrangementAdminQueryKeys.arrangements(slug),
        (arrangements) =>
          arrangements?.filter((arrangement) => arrangement.id !== result.arrangementId)
      );
      queryClient.removeQueries({
        queryKey: arrangementAdminQueryKeys.bookings(slug, result.arrangementId),
      });
      return invalidateArrangementDerivedResources(queryClient, slug, true);
    },
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
    onSuccess: (booking: ArrangementBookingRespons) => {
      appendArrangementBookings(queryClient, slug, arrangementId, [booking]);
      return invalidateArrangementDerivedResources(queryClient, slug);
    },
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
    onSuccess: (result: Awaited<ReturnType<typeof addArrangementBookingsBatch>>) => {
      appendArrangementBookings(queryClient, slug, arrangementId, result.opprettet);
      return invalidateArrangementDerivedResources(queryClient, slug);
    },
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
    onSuccess: (_result: void, bookingId: string) => {
      queryClient.setQueryData<ArrangementBookingRespons[]>(
        arrangementAdminQueryKeys.bookings(slug, arrangementId),
        (bookings) => bookings?.filter((booking) => booking.bookingId !== bookingId)
      );
      return invalidateArrangementDerivedResources(queryClient, slug);
    },
    retry: false,
  };
}

export function updateArrangementBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  arrangementId: string
) {
  return {
    mutationFn: ({ bookingId, request }: UpdateArrangementBookingVariables) =>
      updateArrangementBooking(api, slug, arrangementId, bookingId, request),
    onSuccess: (updated: ArrangementBookingRespons) => {
      queryClient.setQueryData<ArrangementBookingRespons[]>(
        arrangementAdminQueryKeys.bookings(slug, arrangementId),
        (bookings) =>
          bookings?.map((booking) => (booking.bookingId === updated.bookingId ? updated : booking))
      );
      return invalidateArrangementDerivedResources(queryClient, slug);
    },
    retry: false,
  };
}

function appendArrangementBookings(
  queryClient: QueryClient,
  slug: string,
  arrangementId: string,
  created: readonly ArrangementBookingRespons[]
) {
  if (created.length === 0) return;
  queryClient.setQueryData<ArrangementBookingRespons[]>(
    arrangementAdminQueryKeys.bookings(slug, arrangementId),
    (bookings) => {
      if (!bookings) return bookings;
      const existingIds = new Set(bookings.map((booking) => booking.bookingId));
      return [...bookings, ...created.filter((booking) => !existingIds.has(booking.bookingId))];
    }
  );
}

function invalidateArrangementResourcesOutsideAdmin(queryClient: QueryClient, slug: string) {
  return invalidateTenantResources(queryClient, slug, ["arrangements"], {
    excludeScopes: ["arrangement-admin"],
  });
}

function invalidateArrangementDerivedResources(
  queryClient: QueryClient,
  slug: string,
  excludeAdminArrangements = false
) {
  return invalidateTenantResources(
    queryClient,
    slug,
    ["arrangements", "booking-slots"],
    excludeAdminArrangements ? { excludeScopes: ["arrangement-admin"] } : undefined
  );
}
