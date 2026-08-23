import type { BookingstatistikkFiltre } from "$lib/contracts";
import { createTenantQueryKey } from "$lib/platform/query";

export const statisticsQueryKeys = {
  all: (slug: string) => createTenantQueryKey("statistics", slug),
  booking: (slug: string, filters: BookingstatistikkFiltre) =>
    [
      ...statisticsQueryKeys.all(slug),
      "booking",
      filters.fra,
      filters.til,
      filters.sammenlignMedForrigeÅr,
      filters.grenId,
      filters.baneId,
    ] as const,
  activities: (slug: string) => [...statisticsQueryKeys.all(slug), "activities"] as const,
  courts: (slug: string) => [...statisticsQueryKeys.all(slug), "courts"] as const,
};
