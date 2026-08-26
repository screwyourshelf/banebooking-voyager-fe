<script lang="ts">
  import type { Snippet } from "svelte";
  import { setAppShellContext } from "./app-shell-context";
  import type { AppShellBackground, AppShellContext } from "./app-shell-context";
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
    background?: AppShellBackground;
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

  const appShellContext: AppShellContext = {
    get background() {
      return background;
    },
  };
  setAppShellContext(appShellContext);
</script>

<div
  class={["min-h-app-shell bg-canvas", background === "court" && "md:bg-app-shell-court"]}
  data-ui="app-shell"
  data-background={background}
  data-navigation-state={navigationState}
>
  <div
    class="min-h-app-shell md:relative md:grid md:grid-cols-app-shell md:isolate md:bg-sidebar md:before:fixed md:before:-z-1 md:before:inset-0 md:before:bg-app-shell-desktop-backdrop md:before:content-empty md:before:pointer-events-none lg:bg-transparent"
    data-part="frame"
  >
    <aside
      class="hidden md:sticky md:top-0 md:flex md:h-app-shell md:flex-col md:gap-app-shell-sidebar md:overflow-hidden md:border-r-sidebar-divider-width md:border-sidebar-divider md:bg-app-shell-sidebar md:px-app-shell-sidebar-inline md:py-app-shell-sidebar-block md:shadow-app-shell-sidebar lg:m-0 lg:border-0 lg:border-r-sidebar-divider-width lg:rounded-none lg:bg-app-shell-sidebar-desktop lg:shadow-app-shell-sidebar-desktop"
      data-part="sidebar"
    >
      {#if desktopNavigation}
        {@render desktopNavigation()}
      {:else}
        <NavigationLoading label={loadingLabel} layout="sidebar" items={7} surface="shell" />
      {/if}
    </aside>

    <div
      class="flex min-w-0 min-h-app-shell flex-col pb-app-shell-workspace-safe md:bg-transparent md:pb-0 md:shadow-none lg:relative lg:isolate"
      data-part="workspace"
    >
      <header
        class="sticky z-30 top-0 flex min-h-app-shell-topbar items-center border-b border-app-shell-topbar-divider bg-app-shell-topbar px-app-shell-topbar-inline pt-app-shell-topbar-safe pb-0 backdrop-blur-app-shell-topbar md:hidden app-shell-topbar-identity:min-w-0 app-shell-topbar-identity:flex-1 app-shell-topbar-actions:flex-none"
        data-part="topbar"
      >
        {#if mobileHeader}
          {@render mobileHeader()}
        {:else}
          <div
            class="flex w-full items-center gap-app-shell-loading"
            data-part="topbar-loading"
            aria-hidden="true"
          >
            <span
              class="block h-app-shell-loading w-app-shell-loading-identity mr-auto rounded-app-shell-loading bg-app-shell-loading-placeholder animate-navigation-loading"
              data-part="identity"
            ></span>
            <span
              class="block h-app-shell-loading w-app-shell-loading-action flex-none rounded-app-shell-loading bg-app-shell-loading-placeholder animate-navigation-loading"
              data-part="action"
            ></span>
            <span
              class="block h-app-shell-loading w-app-shell-loading-action flex-none rounded-app-shell-loading bg-app-shell-loading-placeholder animate-navigation-loading"
              data-part="action"
            ></span>
          </div>
        {/if}
      </header>

      <main
        class="w-full min-h-0 max-w-content flex-1 mx-auto bg-app-shell-main pb-app-shell-main-safe md:bg-transparent md:pb-0 lg:relative lg:z-1"
        data-part="main"
      >
        {@render children?.()}
      </main>
    </div>
  </div>

  <div class="fixed z-40 inset-x-0 bottom-0 md:hidden" data-part="bottom-navigation">
    {#if mobileNavigation}
      {@render mobileNavigation()}
    {:else}
      <NavigationLoading label={loadingLabel} layout="bottom" items={4} />
    {/if}
  </div>
</div>
