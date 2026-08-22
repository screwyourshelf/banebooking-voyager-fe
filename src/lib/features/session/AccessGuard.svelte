<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { buildLoginPath, getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { ErrorState, Feedback, Page, PageLoading } from "$lib/ui";
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
  <PageLoading label="Kontrollerer innlogging …" />
{:else if loginTarget}
  <PageLoading label="Sender deg til innlogging …" />
{:else if brukerQuery.isPending}
  <PageLoading label="Kontrollerer tilgangen …" />
{:else if brukerQuery.isError}
  <Page eyebrow="Tilgang" title="Kunne ikke kontrollere tilgangen">
    <ErrorState
      title="Brukerdata kunne ikke lastes"
      isRetrying={brukerQuery.isFetching}
      onRetry={() => void brukerQuery.refetch()}
    />
  </Page>
{:else if !allowed}
  <Page eyebrow="Tilgang" title="Du har ikke tilgang">
    <Feedback
      tone="warning"
      title="Siden er ikke tilgjengelig for brukeren din"
      description="Klubben har ikke gitt brukeren din tilgang til denne siden."
    />
  </Page>
{:else}
  {@render children()}
{/if}
