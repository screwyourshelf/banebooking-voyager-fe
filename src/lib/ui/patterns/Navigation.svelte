<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type NavigationLayout = "sidebar" | "bottom" | "section" | "actions";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    busy?: boolean;
    children?: Snippet;
    label: string;
    layout: NavigationLayout;
  };

  let { busy = false, children, label, layout, ...attributes }: Props = $props();
</script>

<nav
  {...attributes}
  data-ui="navigation"
  data-layout={layout}
  aria-label={label}
  aria-busy={busy || undefined}
>
  {@render children?.()}
</nav>
