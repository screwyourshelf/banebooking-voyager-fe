<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setNavigationContext } from "./navigation-context";
  import type {
    NavigationContext,
    NavigationLayout,
    NavigationSurface,
  } from "./navigation-context";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    busy?: boolean;
    children?: Snippet;
    label: string;
    layout: NavigationLayout;
    surface?: NavigationSurface;
  };

  let {
    busy = false,
    children,
    label,
    layout,
    surface = "control",
    ...attributes
  }: Props = $props();

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
    layout === "sidebar" && "grid gap-navigation-sidebar",
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
  {@render children?.()}
</nav>
