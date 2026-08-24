<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { requireNavigationContext } from "./navigation-context";

  type Props = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
  const navigation = requireNavigationContext();
</script>

<ul
  {...attributes}
  class={[
    "flex min-w-0 m-0 p-0 list-none",
    navigation.layout === "sidebar" && "flex-col gap-xs",
    navigation.layout === "bottom" &&
      "grid grid-flow-col auto-cols-fr min-h-navigation-bottom-list border-t border-line bg-navigation-bottom-surface pb-navigation-safe shadow-navigation-bottom backdrop-blur-navigation-bottom",
    navigation.layout === "section" && "w-max min-w-full gap-xs",
    navigation.layout === "actions" && "flex-wrap gap-navigation-actions",
  ]}
  data-ui="navigation-list"
>
  {@render children?.()}
</ul>
