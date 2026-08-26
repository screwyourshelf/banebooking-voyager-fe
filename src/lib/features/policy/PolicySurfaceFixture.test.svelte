<script lang="ts">
  import type { BrukerRespons } from "$lib/contracts";
  import type { ApiClient, ApiRequestOptions } from "$lib/platform/api";
  import { setApiClient } from "$lib/platform/api";
  import { createAppQueryClient } from "$lib/platform/query";
  import { setTenantContext } from "$lib/platform/tenant";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import BlockedAccountScreen from "./BlockedAccountScreen.svelte";
  import MembershipConfirmationScreen from "./MembershipConfirmationScreen.svelte";
  import RequiredAnnouncementScreen from "./RequiredAnnouncementScreen.svelte";

  let {
    mode,
    onConfirmed,
    request,
  }: {
    mode: "announcement" | "blocked" | "membership";
    onConfirmed: () => Promise<unknown>;
    request: ApiClient["request"];
  } = $props();

  const queryClient = createAppQueryClient();
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setTenantContext({ slug: "fjordvik", source: "route" });

  const klubb = {
    kontaktEpost: "booking@fjordvik.no",
    feedSynligAntallDager: 30,
    navn: "Fjordvik Tennisklubb",
    nettside: "https://fjordvik.no/medlemskap",
    slug: "fjordvik",
  };
  const bruker: BrukerRespons = {
    id: "user-1",
    epost: "ada@example.no",
    visningsnavn: "Ada",
    roller: ["Medlem"],
    kapabiliteter: [],
    måBekrefteMedlemskap: true,
    medlemskapBekreftelseLabel: "Sesongen 2026",
  };
</script>

<QueryClientProvider client={queryClient}>
  {#if mode === "blocked"}
    <BlockedAccountScreen {klubb} />
  {:else if mode === "announcement"}
    <RequiredAnnouncementScreen
      announcement={{ id: "news-1", tittel: "Viktig beskjed", tekst: "Les dette\nnøye." }}
      {onConfirmed}
    />
  {:else}
    <MembershipConfirmationScreen {bruker} {klubb} {onConfirmed} termsHref="/fjordvik/vilkaar" />
  {/if}
</QueryClientProvider>
