<script lang="ts">
  import type { NavigationLayout } from "./Navigation.svelte";

  let {
    items = 4,
    label,
    layout,
  }: { items?: number; label: string; layout: NavigationLayout } = $props();

  const itemCount = $derived(
    Number.isFinite(items) ? Math.max(1, Math.min(12, Math.floor(items))) : 4
  );
</script>

<div
  data-ui="navigation-loading"
  data-layout={layout}
  role="status"
  aria-label={label}
  aria-live="polite"
  aria-atomic="true"
>
  <div data-part="list" aria-hidden="true">
    {#each Array(itemCount) as _, index (index)}
      <span data-part="item"></span>
    {/each}
  </div>
</div>
