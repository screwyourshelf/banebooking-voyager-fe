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
  class="relative overflow-hidden"
  data-ui="collection-loading"
  data-layout={layout}
  role="status"
  aria-label={label}
  aria-live="polite"
  aria-atomic="true"
>
  <div
    class="grid gap-record-gap p-record-inline collection-wide:gap-0 collection-wide:p-0"
    data-part="list"
    aria-hidden="true"
  >
    {#each Array(rowCount) as _, index (index)}
      <div
        class={[
          "grid min-h-collection-row items-center gap-md border border-line rounded-record bg-surface-raised px-md py-collection-row-block shadow-record collection-wide:min-h-collection-row-wide collection-wide:border-x-0 collection-wide:border-t-0 collection-wide:rounded-none collection-wide:px-xl collection-wide:py-sm collection-wide:shadow-none",
          layout === "schedule"
            ? "grid-cols-collection-loading-schedule collection-wide:grid-cols-collection-loading-wide"
            : "grid-cols-collection-loading-entity collection-wide:grid-cols-collection-loading-wide",
          index === rowCount - 1 && "collection-wide:border-b-0",
        ]}
        data-part="row"
      >
        <span
          class="w-collection-loading-leading h-md rounded-control bg-collection-loading-placeholder collection-wide:w-collection-loading-leading-wide"
          data-part="leading"
        ></span>
        <span
          class="w-collection-loading-content h-md rounded-control bg-collection-loading-placeholder"
          data-part="content"
        ></span>
        <span class="h-md rounded-control bg-collection-loading-placeholder" data-part="status"
        ></span>
      </div>
    {/each}
  </div>
  <span
    class="absolute inset-0 w-full h-full bg-collection-loading-sheen bg-size-collection-loading-sheen animate-collection-loading pointer-events-none motion-reduce:animate-none"
    data-part="sheen"
    aria-hidden="true"
  ></span>
</div>
