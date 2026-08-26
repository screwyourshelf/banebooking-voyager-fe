<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import type { ApiClient, ApiRequestOptions } from "$lib/platform/api";
  import { setApiClient } from "$lib/platform/api";
  import { setAuthContext, type AuthContextValue } from "$lib/platform/auth";
  import { setTenantContext } from "$lib/platform/tenant";
  import BookingScreen from "./BookingScreen.svelte";

  let {
    authenticated = false,
    request,
  }: {
    authenticated?: boolean;
    request: ApiClient["request"];
  } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options?: ApiRequestOptions<TBody>) =>
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
