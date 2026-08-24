<script lang="ts">
  import type { Snippet } from "svelte";

  export type VisualizationLayoutVariant =
    | "dashboard"
    | "distributions"
    | "results"
    | "status"
    | "tab";

  let {
    children,
    fetching = false,
    variant,
  }: {
    children: Snippet;
    fetching?: boolean;
    variant: VisualizationLayoutVariant;
  } = $props();
</script>

<div
  class={[
    variant === "status"
      ? "flex flex-wrap justify-between gap-x-lg gap-y-visualization-status px-xs text-ink-faint text-stat-chart-meta font-stat-chart-meta md:text-control-muted"
      : "grid min-w-0 gap-lg",
    ["dashboard", "results"].includes(variant) && "md:gap-xl",
    variant === "distributions" && "md:grid-cols-2 md:gap-xl",
    variant === "results" &&
      "transition-opacity duration-160 data-[fetching=true]:opacity-visualization-fetching",
  ]}
  data-ui="visualization-layout"
  data-variant={variant}
  data-fetching={variant === "results" ? fetching : undefined}
  aria-busy={variant === "results" ? fetching : undefined}
>
  {@render children()}
</div>
