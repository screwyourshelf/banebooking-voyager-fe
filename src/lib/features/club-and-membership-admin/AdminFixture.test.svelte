<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import type { KlubbRespons } from "$lib/contracts";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setTenantContext } from "$lib/platform/tenant";
  import ClubAndMembershipAdminScreen from "./ClubAndMembershipAdminScreen.svelte";
  import MembershipSettings from "./MembershipSettings.svelte";

  let {
    capabilities = ["klubb:admin", "medlemskap:aktiver"],
    club = {
      slug: "fjordvik",
      navn: "Fjordvik Tennisklubb",
      kontaktEpost: "post@fjordvik.no",
      nettside: "https://fjordvik.no",
      latitude: 59.1,
      longitude: 10.2,
      feedUrl: "https://fjordvik.no/feed",
      feedSynligAntallDager: 30,
    },
    mode = "screen",
    request,
  }: {
    capabilities?: string[];
    club?: KlubbRespons;
    mode?: "membership" | "screen";
    request: ApiClient["request"];
  } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setTenantContext({ slug: "fjordvik", source: "route" });
</script>

<QueryClientProvider client={queryClient}>
  {#if mode === "membership"}
    <MembershipSettings canManage={capabilities.includes("medlemskap:aktiver")} />
  {:else}
    <ClubAndMembershipAdminScreen {club} {capabilities} />
  {/if}
</QueryClientProvider>
