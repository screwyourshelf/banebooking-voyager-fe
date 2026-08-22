<script lang="ts">
  import type { CollectionRowLayout } from "./CollectionRow.svelte";

  let {
    label,
    layout = "entity",
    rows = 3,
  }: { label: string; layout?: CollectionRowLayout; rows?: number } = $props();

  const rowCount = $derived(
    Number.isFinite(rows) ? Math.max(1, Math.min(12, Math.floor(rows))) : 3
  );
</script>

<div
  data-ui="collection-loading"
  data-layout={layout}
  role="status"
  aria-label={label}
  aria-live="polite"
  aria-atomic="true"
>
  <div data-part="list" aria-hidden="true">
    {#each Array(rowCount) as _, index (index)}
      <div data-part="row">
        <span data-part="leading"></span>
        <span data-part="content"></span>
        <span data-part="status"></span>
      </div>
    {/each}
  </div>
</div>
