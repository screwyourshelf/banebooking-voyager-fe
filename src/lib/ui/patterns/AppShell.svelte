<script lang="ts">
  import type { Snippet } from "svelte";
  import NavigationLoading from "./NavigationLoading.svelte";

  type ReadyNavigation = {
    children: Snippet;
    desktopNavigation: Snippet;
    mobileHeader: Snippet;
    mobileNavigation: Snippet;
    navigationLoadingLabel?: never;
  };

  type LoadingNavigation = {
    children?: Snippet;
    desktopNavigation?: never;
    mobileHeader?: never;
    mobileNavigation?: never;
    navigationLoadingLabel: string;
  };

  type Props = {
    background?: "canvas" | "court";
  } & (ReadyNavigation | LoadingNavigation);

  let {
    background = "court",
    children,
    desktopNavigation,
    mobileHeader,
    mobileNavigation,
    navigationLoadingLabel,
  }: Props = $props();

  const navigationState = $derived(navigationLoadingLabel === undefined ? "ready" : "loading");
  const loadingLabel = $derived(navigationLoadingLabel ?? "Laster navigasjon …");
</script>

<div data-ui="app-shell" data-background={background} data-navigation-state={navigationState}>
  <div data-part="frame">
    <aside data-part="sidebar">
      {#if desktopNavigation}
        {@render desktopNavigation()}
      {:else}
        <NavigationLoading label={loadingLabel} layout="sidebar" items={7} />
      {/if}
    </aside>

    <div data-part="workspace">
      <header data-part="topbar">
        {#if mobileHeader}
          {@render mobileHeader()}
        {:else}
          <div data-part="topbar-loading" aria-hidden="true">
            <span data-part="identity"></span>
            <span data-part="action"></span>
            <span data-part="action"></span>
          </div>
        {/if}
      </header>

      <main data-part="main">
        {@render children?.()}
      </main>
    </div>
  </div>

  <div data-part="bottom-navigation">
    {#if mobileNavigation}
      {@render mobileNavigation()}
    {:else}
      <NavigationLoading label={loadingLabel} layout="bottom" items={4} />
    {/if}
  </div>
</div>
