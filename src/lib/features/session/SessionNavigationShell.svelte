<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import type { Snippet } from "svelte";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext } from "$lib/platform/tenant";
  import { getThemeContext } from "$lib/platform/theme";
  import { AppShell } from "$lib/ui";
  import DesktopNavigation from "./DesktopNavigation.svelte";
  import MobileBottomNavigation from "./MobileBottomNavigation.svelte";
  import MobileHeaderNavigation from "./MobileHeaderNavigation.svelte";
  import NavigationOverlays from "./NavigationOverlays.svelte";
  import { getSessionDataContext } from "./context";
  import { buildAppNavigationState } from "./navigation-model";
  import { feedStatusQueryOptions } from "./queries";

  let { children }: { children: Snippet } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const session = getSessionDataContext();
  const tenant = getTenantContext();
  const theme = getThemeContext();
  let accountOpen = $state(false);
  let moreOpen = $state(false);
  let signingOut = $state(false);

  const feedConfigured = $derived(Boolean(session.klubb?.feedUrl?.trim()));
  const feedStatusQuery = createQuery(() => ({
    ...feedStatusQueryOptions(api, tenant.slug),
    enabled: session.klubbStatus === "success" && feedConfigured,
  }));

  const navigation = $derived(
    buildAppNavigationState({
      auth: auth.state,
      basePath: base,
      bruker: { data: session.bruker, status: session.brukerStatus },
      klubb: { data: session.klubb, status: session.klubbStatus },
      newsCount: feedConfigured ? (feedStatusQuery.data?.antallNyheter ?? 0) : 0,
      pathname: page.url.pathname,
      tenant,
    })
  );

  async function signOut() {
    if (signingOut) return;
    signingOut = true;
    try {
      await auth.signOut();
      accountOpen = false;
      moreOpen = false;
    } finally {
      signingOut = false;
    }
  }
</script>

{#if navigation.status === "loading"}
  <AppShell navigationLoadingLabel={navigation.label}>
    {@render children()}
  </AppShell>
{:else}
  <AppShell>
    {#snippet desktopNavigation()}
      <DesktopNavigation
        {navigation}
        onOpenAccount={() => (accountOpen = true)}
        onToggleTheme={theme.toggle}
        theme={theme.current}
      />
    {/snippet}
    {#snippet mobileHeader()}
      <MobileHeaderNavigation {navigation} onToggleTheme={theme.toggle} theme={theme.current} />
    {/snippet}
    {#snippet mobileNavigation()}
      <MobileBottomNavigation {navigation} onOpenMore={() => (moreOpen = true)} />
    {/snippet}
    {@render children()}
  </AppShell>

  <NavigationOverlays
    bind:accountOpen
    bind:moreOpen
    {navigation}
    onSignOut={() => void signOut()}
    {signingOut}
  />
{/if}
