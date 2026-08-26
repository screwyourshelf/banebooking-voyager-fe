import type { QueryClient } from "@tanstack/svelte-query";
import type {
  OpprettBaneForespørsel,
  OpprettGrenForespørsel,
  OppdaterBaneBookingInnstillingerForespørsel,
  OppdaterBaneForespørsel,
  OppdaterGrenForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantResources, tenantQueryMeta } from "$lib/platform/query";
import {
  createActivity,
  createCourt,
  getAdminActivities,
  getAdminCourts,
  updateActivity,
  updateCourt,
  updateCourtBookingSettings,
} from "./api";
import type { CourtReorderUpdate } from "./model";
import { courtAndActivityAdminQueryKeys } from "./query-keys";

export type SaveCourtVariables = {
  bookingSettingsChanged: boolean;
  bookingSettingsRequest: OppdaterBaneBookingInnstillingerForespørsel;
  courtChanged: boolean;
  courtId: string;
  courtRequest: OppdaterBaneForespørsel;
};

export function adminCourtsQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "courts"),
    queryKey: courtAndActivityAdminQueryKeys.courts(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getAdminCourts(api, slug, signal),
    staleTime: 60_000,
  };
}

export function adminActivitiesQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "activities"),
    queryKey: courtAndActivityAdminQueryKeys.activities(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getAdminActivities(api, slug, signal),
    staleTime: 60_000,
  };
}

export function createCourtMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (request: OpprettBaneForespørsel) => createCourt(api, slug, request),
    onSuccess: () => invalidateCourtResources(queryClient, slug),
    retry: false,
  };
}

export function saveCourtMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: async ({
      bookingSettingsChanged,
      bookingSettingsRequest,
      courtChanged,
      courtId,
      courtRequest,
    }: SaveCourtVariables) => {
      if (courtChanged) await updateCourt(api, slug, courtId, courtRequest);
      if (bookingSettingsChanged) {
        await updateCourtBookingSettings(api, slug, courtId, bookingSettingsRequest);
      }
    },
    onSuccess: () => invalidateCourtResources(queryClient, slug),
    retry: false,
  };
}

export function reorderCourtsMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (updates: CourtReorderUpdate[]) =>
      Promise.all(updates.map(({ courtId, request }) => updateCourt(api, slug, courtId, request))),
    onSuccess: () => invalidateCourtResources(queryClient, slug),
    retry: false,
  };
}

export function createActivityMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (request: OpprettGrenForespørsel) => createActivity(api, slug, request),
    onSuccess: () => invalidateActivityResources(queryClient, slug),
    retry: false,
  };
}

export function updateActivityMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: ({
      activityId,
      request,
    }: {
      activityId: string;
      request: OppdaterGrenForespørsel;
    }) => updateActivity(api, slug, activityId, request),
    onSuccess: () => invalidateActivityResources(queryClient, slug),
    retry: false,
  };
}

function invalidateCourtResources(queryClient: QueryClient, slug: string) {
  return invalidateTenantResources(queryClient, slug, [
    "arrangement-bookings",
    "arrangements",
    "booking-slots",
    "courts",
    "statistics",
  ]);
}

function invalidateActivityResources(queryClient: QueryClient, slug: string) {
  return invalidateTenantResources(queryClient, slug, [
    "activities",
    "arrangements",
    "booking-slots",
    "courts",
    "statistics",
  ]);
}
