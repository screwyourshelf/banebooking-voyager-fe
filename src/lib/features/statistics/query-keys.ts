import type { BookingstatistikkFiltre } from "$lib/contracts";
import { createTenantQueryKey, tenantResourceQueryKeys } from "$lib/platform/query";

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
  activities: (slug: string) => tenantResourceQueryKeys.activities(slug, true, "required"),
  courts: (slug: string) => tenantResourceQueryKeys.courts(slug, true, "required"),
};
