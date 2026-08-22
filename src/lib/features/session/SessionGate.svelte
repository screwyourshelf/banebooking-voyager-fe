<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { ErrorState, Page, PageLoading } from "$lib/ui";
  import { createQuery } from "@tanstack/svelte-query";
  import type { Snippet } from "svelte";
  import { getBrukerWithCurrentTermsAcceptance, getKlubb } from "./api";
  import { resolvePolicyRedirect } from "./guard-model";
  import { sessionQueryKeys } from "./query-keys";

  let { children }: { children: Snippet } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  let lastRedirect: string | null = null;

  const klubbQuery = createQuery(() => ({
    queryKey: sessionQueryKeys.klubb(tenant.slug),
    queryFn: () => getKlubb(api, tenant.slug),
  }));

  const brukerQuery = createQuery(() => ({
    queryKey: sessionQueryKeys.bruker(tenant.slug),
    queryFn: () => getBrukerWithCurrentTermsAcceptance(api, tenant.slug),
    enabled: auth.state.status === "authenticated" && klubbQuery.isSuccess,
    staleTime: 60_000,
  }));

  const redirectTarget = $derived(
    auth.state.status === "authenticated" && brukerQuery.data
      ? resolvePolicyRedirect({
          bruker: brukerQuery.data,
          currentUrl: page.url,
          tenant,
          basePath: base,
        })
      : null
  );

  $effect(() => {
    if (!klubbQuery.isSuccess) return;
    void import("$lib/platform/storage/browser-storage.client").then(({ skrivLokalLagring }) => {
      skrivLokalLagring("slug", tenant.slug);
    });
  });

  $effect(() => {
    if (!redirectTarget || redirectTarget === lastRedirect) return;
    lastRedirect = redirectTarget;
    void goto(resolve(stripBasePath(redirectTarget, base)), { replaceState: true });
  });
</script>

{#if auth.state.status === "initializing"}
  <PageLoading label="Kontrollerer innlogging …" />
{:else if klubbQuery.isPending}
  <PageLoading label="Laster klubben …" />
{:else if klubbQuery.isError || !klubbQuery.data}
  <Page eyebrow="Klubb" title="Fant ikke klubben">
    <ErrorState
      title="Klubben kunne ikke lastes"
      description="Sjekk at adressen er riktig og prøv igjen."
      isRetrying={klubbQuery.isFetching}
      onRetry={() => void klubbQuery.refetch()}
    />
  </Page>
{:else if auth.state.status === "authenticated" && brukerQuery.isPending}
  <PageLoading label="Kontrollerer tilgangen …" />
{:else if auth.state.status === "authenticated" && brukerQuery.isError}
  <Page eyebrow="Tilgang" title="Kunne ikke laste brukerdata">
    <ErrorState
      title="Tilgangen kunne ikke kontrolleres"
      description="Prøv på nytt før du fortsetter."
      isRetrying={brukerQuery.isFetching}
      onRetry={() => void brukerQuery.refetch()}
    />
  </Page>
{:else if redirectTarget}
  <PageLoading label="Sender deg til riktig side …" />
{:else}
  {@render children()}
{/if}
