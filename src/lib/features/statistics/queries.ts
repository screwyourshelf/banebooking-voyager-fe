import { keepPreviousData } from "@tanstack/svelte-query";
import type { BookingstatistikkFiltre } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { getBookingStatistics, getStatisticsActivities, getStatisticsCourts } from "./api";
import { statisticsQueryKeys } from "./query-keys";

export function bookingStatisticsQueryOptions(
  api: ApiClient,
  slug: string,
  filters: BookingstatistikkFiltre
) {
  return {
    queryKey: statisticsQueryKeys.booking(slug, filters),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getBookingStatistics(api, slug, filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60_000,
  };
}

export function statisticsActivitiesQueryOptions(api: ApiClient, slug: string) {
  return {
    queryKey: statisticsQueryKeys.activities(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getStatisticsActivities(api, slug, signal),
    staleTime: 5 * 60_000,
  };
}

export function statisticsCourtsQueryOptions(api: ApiClient, slug: string) {
  return {
    queryKey: statisticsQueryKeys.courts(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getStatisticsCourts(api, slug, signal),
    staleTime: 5 * 60_000,
  };
}
