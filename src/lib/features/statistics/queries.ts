import { keepPreviousData } from "@tanstack/svelte-query";
import type { BookingstatistikkFiltre } from "#lib/contracts/index.ts";
import type { ApiClient } from "#lib/platform/api/index.ts";
import { tenantQueryMeta } from "#lib/platform/query/index.ts";
import { getBookingStatistics, getStatisticsActivities, getStatisticsCourts } from "./api";
import { statisticsQueryKeys } from "./query-keys";

export function bookingStatisticsQueryOptions(
  api: ApiClient,
  slug: string,
  filters: BookingstatistikkFiltre
) {
  return {
    meta: tenantQueryMeta(slug, "statistics"),
    queryKey: statisticsQueryKeys.booking(slug, filters),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getBookingStatistics(api, slug, filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60_000,
  };
}

export function statisticsActivitiesQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "activities"),
    queryKey: statisticsQueryKeys.activities(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getStatisticsActivities(api, slug, signal),
    staleTime: 10 * 60_000,
  };
}

export function statisticsCourtsQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "courts"),
    queryKey: statisticsQueryKeys.courts(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getStatisticsCourts(api, slug, signal),
    staleTime: 10 * 60_000,
  };
}
