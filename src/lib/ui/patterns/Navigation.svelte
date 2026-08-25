<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import { setNavigationContext } from "./navigation-context";
  import type {
    NavigationContext,
    NavigationLayout,
    NavigationSurface,
  } from "./navigation-context";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLElement>>, "children"> & {
    busy?: boolean;
    children?: Snippet;
    footer?: Snippet;
    header?: Snippet;
    label: string;
    layout: NavigationLayout;
    surface?: NavigationSurface;
  };

  let {
    busy = false,
    children,
    footer,
    header,
    label,
    layout,
    surface = "control",
    ...attributes
  }: Props = $props();

  const hasShellRegions = $derived(
    layout === "sidebar" && surface === "shell" && (header !== undefined || footer !== undefined)
  );

  const navigationContext = {
    get layout() {
      return layout;
    },
    get surface() {
      return surface;
    },
  } satisfies NavigationContext;

  setNavigationContext(navigationContext);
</script>

<nav
  {...attributes}
  class={[
    "min-w-0",
    layout === "sidebar" && !hasShellRegions && "grid gap-navigation-sidebar",
    hasShellRegions && "flex min-h-0 flex-col gap-navigation-sidebar",
    layout === "sidebar" &&
      surface === "control" &&
      "w-full max-w-navigation-sidebar rounded-navigation-sidebar bg-control-surface p-lg text-control-text",
    layout === "sidebar" &&
      surface === "shell" &&
      "w-full max-w-none flex-1 rounded-none bg-transparent p-0 text-control-text",
    layout === "sidebar" &&
      surface === "overlay" &&
      "w-full max-w-none rounded-none bg-transparent p-0 text-ink",
    layout === "bottom" && "w-full",
    layout === "section" && "overflow-x-auto border-b border-line scrollbar-thin",
  ]}
  data-ui="navigation"
  data-layout={layout}
  data-surface={surface}
  aria-label={label}
  aria-busy={busy || undefined}
>
  {#if hasShellRegions}
    {#if header}
      <div class="min-w-0 shrink-0" data-part="header">{@render header()}</div>
    {/if}
    <div
      class="grid min-h-0 flex-1 content-start gap-navigation-sidebar overflow-y-auto"
      data-part="content"
    >
      {@render children?.()}
    </div>
    {#if footer}
      <div class="min-w-0 shrink-0" data-part="footer">{@render footer()}</div>
    {/if}
  {:else}
    {@render children?.()}
  {/if}
</nav>
