<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getAuthContext } from "$lib/platform/auth";
  import { buildLoginPath, getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { ErrorState, Feedback, Page, PageLoading } from "$lib/ui";
  import type { Snippet } from "svelte";
  import { getSessionDataContext } from "./context";
  import { hasAnyRequiredCapability, requiredCapabilitiesForPath } from "./guard-model";

  let { children, mode }: { children: Snippet; mode: "admin" | "protected" } = $props();

  const auth = getAuthContext();
  const session = getSessionDataContext();
  const tenant = getTenantContext();
  let lastRedirect: string | null = null;

  const loginTarget = $derived(
    auth.state.status === "anonymous" ? buildLoginPath(tenant, page.url, base) : null
  );
  const requiredCapabilities = $derived(
    mode === "admin" ? requiredCapabilitiesForPath(page.url.pathname) : null
  );
  const allowed = $derived(
    mode === "protected" ||
      (requiredCapabilities !== null &&
        hasAnyRequiredCapability(session.bruker, requiredCapabilities))
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
{:else if session.brukerStatus === "pending"}
  <PageLoading label="Kontrollerer tilgangen …" />
{:else if session.brukerStatus === "error"}
  <Page eyebrow="Tilgang" title="Kunne ikke kontrollere tilgangen">
    <ErrorState
      title="Brukerdata kunne ikke lastes"
      isRetrying={session.brukerFetching}
      onRetry={() => void session.refetchBruker()}
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
