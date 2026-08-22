<script lang="ts">
  import Page from "./Page.svelte";

  let { label, standalone = false }: { label: string; standalone?: boolean } = $props();
</script>

<Page {standalone}>
  <div data-ui="page-loading" role="status" aria-live="polite" aria-atomic="true">
    <span data-part="label">{label}</span>
    <div data-part="header" aria-hidden="true">
      <span data-part="eyebrow"></span>
      <span data-part="title"></span>
      <span data-part="description"></span>
    </div>
    <div data-part="surface" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</Page>
