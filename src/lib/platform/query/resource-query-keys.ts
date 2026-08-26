import { createTenantQueryKey } from "./query-key";

export const tenantResourceQueryKeys = {
  activities: (slug: string, includeInactive: boolean, auth: "optional" | "required") =>
    [
      ...createTenantQueryKey("tenant-resource", slug),
      "activities",
      { auth, includeInactive },
    ] as const,
  courts: (slug: string, includeInactive: boolean, auth: "optional" | "required") =>
    [
      ...createTenantQueryKey("tenant-resource", slug),
      "courts",
      { auth, includeInactive },
    ] as const,
};
