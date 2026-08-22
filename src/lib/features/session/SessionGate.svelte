<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { Button } from "$lib/ui";
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
  <div data-ui="auth-status" role="status">Kontrollerer innlogging …</div>
{:else if klubbQuery.isPending}
  <div data-ui="auth-status" role="status">Laster klubben …</div>
{:else if klubbQuery.isError || !klubbQuery.data}
  <section data-ui="route-error" aria-labelledby="tenant-error-title">
    <h1 id="tenant-error-title">Fant ikke klubben</h1>
    <p>Sjekk at adressen er riktig og prøv igjen.</p>
    <Button variant="secondary" onclick={() => klubbQuery.refetch()}>Prøv igjen</Button>
  </section>
{:else if auth.state.status === "authenticated" && brukerQuery.isPending}
  <div data-ui="auth-status" role="status">Kontrollerer tilgangen …</div>
{:else if auth.state.status === "authenticated" && brukerQuery.isError}
  <section data-ui="route-error" aria-labelledby="user-error-title">
    <h1 id="user-error-title">Kunne ikke laste brukerdata</h1>
    <p>Prøv på nytt før du fortsetter.</p>
    <Button variant="secondary" onclick={() => brukerQuery.refetch()}>Prøv igjen</Button>
  </section>
{:else if redirectTarget}
  <div data-ui="auth-status" role="status">Sender deg til riktig side …</div>
{:else}
  {@render children()}
{/if}
