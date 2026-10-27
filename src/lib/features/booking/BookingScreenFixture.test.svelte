<script lang="ts">
  import { untrack } from "svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import type { ApiClient, ApiRequestOptions } from "#lib/platform/api/index.ts";
  import { setApiClient } from "#lib/platform/api/index.ts";
  import { setAuthContext, type AuthContextValue } from "#lib/platform/auth/index.ts";
  import { setTenantContext } from "#lib/platform/tenant/index.ts";
  import BookingScreen from "./BookingScreen.svelte";

  let {
    authenticated = false,
    request,
    onQueryClient,
  }: {
    authenticated?: boolean;
    request: ApiClient["request"];
    onQueryClient?: (client: QueryClient) => void;
  } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  untrack(() => onQueryClient?.(queryClient));
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setAuthContext({
    get state(): AuthContextValue["state"] {
      return authenticated
        ? {
            status: "authenticated",
            user: {
              id: "user-1",
              email: "ada@example.no",
              name: "Ada",
              source: "supabase",
            },
          }
        : { status: "anonymous", user: null };
    },
    sendEmailOtp: async () => undefined,
    signInAsDevelopmentProfile: async () => undefined,
    signInWithOAuth: async () => undefined,
    signOut: async () => undefined,
    verifyEmailOtp: async () => undefined,
  });
  setTenantContext({ slug: "fjordvik", source: "route" });
</script>

<QueryClientProvider client={queryClient}>
  <BookingScreen />
</QueryClientProvider>
