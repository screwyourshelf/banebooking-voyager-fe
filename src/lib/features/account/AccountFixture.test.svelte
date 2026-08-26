<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import type { BrukerRespons } from "$lib/contracts";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setAuthContext } from "$lib/platform/auth";
  import { setTenantContext } from "$lib/platform/tenant";
  import AccountScreen from "./AccountScreen.svelte";
  import type { AccountTab } from "./model";
  import MyBookingsScreen from "./MyBookingsScreen.svelte";

  let {
    activeTab = "profil",
    mode = "account",
    onSignOut = async () => undefined,
    onUserUpdated = async () => undefined,
    request,
    status = "success",
    user = {
      id: "user-1",
      epost: "ada@example.no",
      visningsnavn: "Ada",
      roller: ["Medlem"],
      kapabiliteter: [],
      vilkårAkseptertDato: "2026-08-20T12:00:00Z",
      vilkårVersjon: "1.0",
      medlemskapBekreftelseLabel: "Bekreftet 2026",
      fulltNavn: "Ada Lovelace",
      medlemskapType: "Voksen",
      medlemskapBekreftetDato: "2026-08-21T12:00:00Z",
    },
  }: {
    activeTab?: AccountTab;
    mode?: "account" | "bookings";
    onSignOut?: () => Promise<void>;
    onUserUpdated?: () => Promise<unknown>;
    request: ApiClient["request"];
    status?: "error" | "pending" | "success";
    user?: BrukerRespons | null;
  } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options?: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setAuthContext({
    state: {
      status: "authenticated",
      user: { id: "user-1", email: "ada@example.no", name: "Ada", source: "supabase" },
    },
    sendEmailOtp: async () => undefined,
    signInAsDevelopmentProfile: async () => undefined,
    signInWithOAuth: async () => undefined,
    signOut: () => onSignOut(),
    verifyEmailOtp: async () => undefined,
  });
  setTenantContext({ slug: "fjordvik", source: "route" });
</script>

<QueryClientProvider client={queryClient}>
  {#if mode === "bookings"}
    <MyBookingsScreen bookingHref="/fjordvik" />
  {:else}
    <AccountScreen
      {activeTab}
      profileHref="/fjordvik/minside?tab=profil"
      dataHref="/fjordvik/minside?tab=persondata"
      termsHref="/fjordvik/vilkaar"
      {user}
      {status}
      onRetry={async () => undefined}
      {onUserUpdated}
    />
  {/if}
</QueryClientProvider>
