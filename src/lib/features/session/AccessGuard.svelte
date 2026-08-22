<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { buildLoginPath, getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { Button } from "$lib/ui";
  import { createQuery } from "@tanstack/svelte-query";
  import type { Snippet } from "svelte";
  import { getBrukerWithCurrentTermsAcceptance } from "./api";
  import { hasAnyRequiredCapability, requiredCapabilitiesForPath } from "./guard-model";
  import { sessionQueryKeys } from "./query-keys";

  let { children, mode }: { children: Snippet; mode: "admin" | "protected" } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  let lastRedirect: string | null = null;

  const brukerQuery = createQuery(() => ({
    queryKey: sessionQueryKeys.bruker(tenant.slug),
    queryFn: () => getBrukerWithCurrentTermsAcceptance(api, tenant.slug),
    enabled: auth.state.status === "authenticated",
    staleTime: 60_000,
  }));

  const loginTarget = $derived(
    auth.state.status === "anonymous" ? buildLoginPath(tenant, page.url, base) : null
  );
  const requiredCapabilities = $derived(
    mode === "admin" ? requiredCapabilitiesForPath(page.url.pathname) : null
  );
  const allowed = $derived(
    mode === "protected" ||
      (requiredCapabilities !== null &&
        hasAnyRequiredCapability(brukerQuery.data, requiredCapabilities))
  );

  $effect(() => {
    if (!loginTarget || loginTarget === lastRedirect) return;
    lastRedirect = loginTarget;
    void goto(resolve(stripBasePath(loginTarget, base)), { replaceState: true });
  });
</script>

{#if auth.state.status === "initializing"}
  <div data-ui="auth-status" role="status">Kontrollerer innlogging …</div>
{:else if loginTarget}
  <div data-ui="auth-status" role="status">Sender deg til innlogging …</div>
{:else if brukerQuery.isPending}
  <div data-ui="auth-status" role="status">Kontrollerer tilgangen …</div>
{:else if brukerQuery.isError}
  <section data-ui="route-error" aria-labelledby="guard-error-title">
    <h1 id="guard-error-title">Kunne ikke kontrollere tilgangen</h1>
    <Button variant="secondary" onclick={() => brukerQuery.refetch()}>Prøv igjen</Button>
  </section>
{:else if !allowed}
  <section data-ui="access-blocked" aria-labelledby="access-blocked-title">
    <h1 id="access-blocked-title">Du har ikke tilgang</h1>
    <p>Klubben har ikke gitt brukeren din tilgang til denne siden.</p>
  </section>
{:else}
  {@render children()}
{/if}
