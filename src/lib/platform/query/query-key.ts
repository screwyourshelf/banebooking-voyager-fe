import type { QueryClient } from "@tanstack/svelte-query";

export function createTenantQueryKey<const TScope extends string>(scope: TScope, slug: string) {
  return [scope, { slug }] as const;
}

/**
 * Invaliderer alle cacher som kan inneholde avledede data for samme tenant. Dette er den delte
 * grensen for mutationer som endrer bootstrapressurser brukt av flere isolerte features.
 */
export function invalidateTenantQueries(queryClient: QueryClient, slug: string) {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      queryKey.some(
        (part) => typeof part === "object" && part !== null && "slug" in part && part.slug === slug
      ),
  });
}
