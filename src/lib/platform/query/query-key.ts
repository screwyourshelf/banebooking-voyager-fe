import type { QueryClient } from "@tanstack/svelte-query";

export type TenantQueryResource =
  | "activities"
  | "announcements"
  | "arrangement-bookings"
  | "arrangements"
  | "booking-slots"
  | "club"
  | "courts"
  | "membership-policy"
  | "my-bookings"
  | "news"
  | "statistics"
  | "user"
  | "user-blocks"
  | "users";

type TenantQueryMetadata = {
  slug: string;
  resources: readonly TenantQueryResource[];
};

type InvalidateTenantResourcesOptions = {
  excludeScopes?: readonly string[];
};

export function createTenantQueryKey<const TScope extends string>(scope: TScope, slug: string) {
  return [scope, { slug }] as const;
}

export function tenantQueryMeta(slug: string, ...resources: readonly TenantQueryResource[]) {
  return { tenantQuery: { resources, slug } satisfies TenantQueryMetadata };
}

export function invalidateTenantResources(
  queryClient: QueryClient,
  slug: string,
  resources: readonly TenantQueryResource[],
  { excludeScopes = [] }: InvalidateTenantResourcesOptions = {}
) {
  const requestedResources = new Set(resources);
  const excludedScopes = new Set(excludeScopes);
  return queryClient.invalidateQueries({
    predicate: ({ meta, queryKey }) => {
      if (excludedScopes.has(String(queryKey[0]))) return false;
      const tenantQuery = readTenantQueryMetadata(meta?.tenantQuery);
      return (
        tenantQuery?.slug === slug &&
        tenantQuery.resources.some((resource) => requestedResources.has(resource))
      );
    },
  });
}

function readTenantQueryMetadata(value: unknown): TenantQueryMetadata | null {
  if (!value || typeof value !== "object" || !("slug" in value) || !("resources" in value)) {
    return null;
  }
  const { resources, slug } = value;
  if (typeof slug !== "string" || !Array.isArray(resources)) return null;
  return { resources: resources as TenantQueryResource[], slug };
}
