<script lang="ts">
  import Page from "./Page.svelte";

  let { label, standalone = false }: { label: string; standalone?: boolean } = $props();
</script>

<Page {standalone}>
  <div
    class="relative grid min-w-0 min-h-page-loading content-start gap-xl overflow-hidden border border-line rounded-surface bg-surface-subtle p-page-loading"
    data-ui="page-loading"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <span class="sr-only" data-part="label">{label}</span>
    <div class="grid min-w-0 gap-page-loading-line" data-part="header" aria-hidden="true">
      <span
        class="block w-page-loading-eyebrow h-page-loading-eyebrow rounded-control bg-page-loading-placeholder"
        data-part="eyebrow"
      ></span>
      <span
        class="block w-page-loading-title h-page-loading-title rounded-control bg-page-loading-placeholder"
        data-part="title"
      ></span>
      <span
        class="block w-page-loading-description h-page-loading-description rounded-control bg-page-loading-placeholder"
        data-part="description"
      ></span>
    </div>
    <div
      class="grid min-w-0 gap-page-loading-line border border-line rounded-page-loading-surface bg-surface-raised p-lg"
      data-part="surface"
      aria-hidden="true"
    >
      <span class="block w-full h-page-loading-row rounded-record bg-page-loading-placeholder"
      ></span>
      <span class="block w-full h-page-loading-row rounded-record bg-page-loading-placeholder"
      ></span>
      <span class="block w-full h-page-loading-row rounded-record bg-page-loading-placeholder"
      ></span>
    </div>
    <span
      class="absolute inset-0 w-full h-full pointer-events-none bg-page-loading-sheen bg-size-page-loading-sheen animate-page-loading motion-reduce:animate-none"
      data-part="sheen"
      aria-hidden="true"
    ></span>
  </div>
</Page>
