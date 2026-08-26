import { browser } from "$app/environment";
import { ApiError } from "$lib/platform/api";
import { QueryClient } from "@tanstack/svelte-query";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => shouldRetryQuery(failureCount, error),
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError && error.status && [401, 403, 404].includes(error.status)) {
    return false;
  }
  return true;
}
