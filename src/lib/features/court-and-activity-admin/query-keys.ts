import { tenantResourceQueryKeys } from "$lib/platform/query";

export const courtAndActivityAdminQueryKeys = {
  courts: (slug: string) => tenantResourceQueryKeys.courts(slug, true, "required"),
  activities: (slug: string) => tenantResourceQueryKeys.activities(slug, true, "required"),
};
