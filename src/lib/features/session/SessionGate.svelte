<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext, stripBasePath } from "$lib/platform/tenant";
  import { ErrorState, Page, PageLoading } from "$lib/ui";
  import type { Snippet } from "svelte";
  import { getSessionDataContext } from "./context";
  import { resolvePolicyRedirect } from "./guard-model";

  let { children }: { children: Snippet } = $props();

  const auth = getAuthContext();
  const session = getSessionDataContext();
  const tenant = getTenantContext();
  let lastRedirectAttempt: string | null = null;

  const redirectTarget = $derived(
    auth.state.status === "authenticated" && session.bruker
      ? resolvePolicyRedirect({
          bruker: session.bruker,
          currentUrl: page.url,
          tenant,
          basePath: base,
        })
      : null
  );

  $effect(() => {
    if (session.klubbStatus !== "success") return;
    void import("$lib/platform/storage/browser-storage.client").then(({ skrivLokalLagring }) => {
      skrivLokalLagring("slug", tenant.slug);
    });
  });

  $effect(() => {
    if (!redirectTarget) {
      lastRedirectAttempt = null;
      return;
    }

    // Innlogging kan starte en retur-navigasjon samtidig som brukerdata utløser policyredirecten.
    // Knyt forsøket til kilde-URL-en slik at en avbrutt redirect prøves igjen etter at returen lander.
    const redirectAttempt = `${page.url.href}\n${redirectTarget}`;
    if (redirectAttempt === lastRedirectAttempt) return;
    lastRedirectAttempt = redirectAttempt;
    void goto(resolve(stripBasePath(redirectTarget, base)), { replaceState: true });
  });
</script>

{#if auth.state.status === "initializing"}
  <PageLoading label="Kontrollerer innlogging …" />
{:else if session.klubbStatus === "pending"}
  <PageLoading label="Laster klubben …" />
{:else if session.klubbStatus === "error" || !session.klubb}
  <Page eyebrow="Klubb" title="Fant ikke klubben">
    <ErrorState
      title="Klubben kunne ikke lastes"
      description="Sjekk at adressen er riktig og prøv igjen."
      isRetrying={session.klubbFetching}
      onRetry={() => void session.refetchKlubb()}
    />
  </Page>
{:else if auth.state.status === "authenticated" && session.brukerStatus === "pending"}
  <PageLoading label="Kontrollerer tilgangen …" />
{:else if auth.state.status === "authenticated" && session.brukerStatus === "error"}
  <Page eyebrow="Tilgang" title="Kunne ikke laste brukerdata">
    <ErrorState
      title="Tilgangen kunne ikke kontrolleres"
      description="Prøv på nytt før du fortsetter."
      isRetrying={session.brukerFetching}
      onRetry={() => void session.refetchBruker()}
    />
  </Page>
{:else if redirectTarget}
  <PageLoading label="Sender deg til riktig side …" />
{:else}
  {@render children()}
{/if}
