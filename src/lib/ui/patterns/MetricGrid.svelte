<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    label,
    variant = "default",
  }: { children: Snippet; label: string; variant?: "default" | "members" } = $props();
</script>

<section data-ui="metric-grid" data-variant={variant} aria-label={label}>
  {@render children()}
</section>
