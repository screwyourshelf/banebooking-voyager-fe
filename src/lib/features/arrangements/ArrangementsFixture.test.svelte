<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setAuthContext } from "$lib/platform/auth";
  import { setTenantContext } from "$lib/platform/tenant";
  import ArrangementsScreen from "./ArrangementsScreen.svelte";

  let {
    authenticated = false,
    initialArrangementId,
    referenceDate = new Date(2026, 7, 23),
    request,
  }: {
    authenticated?: boolean;
    initialArrangementId?: string;
    referenceDate?: Date;
    request: ApiClient["request"];
  } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setAuthContext({
    get state() {
      return authenticated
        ? {
            status: "authenticated" as const,
            user: {
              id: "user-1",
              email: "ada@example.no",
              name: "Ada",
              source: "supabase" as const,
            },
          }
        : { status: "anonymous" as const, user: null };
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
  <ArrangementsScreen {initialArrangementId} {referenceDate} />
</QueryClientProvider>
