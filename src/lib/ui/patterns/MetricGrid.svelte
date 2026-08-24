<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    label,
    variant = "default",
  }: { children: Snippet; label: string; variant?: "default" | "members" } = $props();
</script>

<section
  class={["md:gap-metric-grid-wide", variant === "members" ? "md:grid-cols-3" : "md:grid-cols-4"]}
  data-ui="metric-grid"
  data-variant={variant}
  aria-label={label}
>
  {@render children()}
</section>
