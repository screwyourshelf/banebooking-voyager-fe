<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    accessory,
    end,
    start,
  }: {
    accessory?: Snippet;
    end: string;
    start: string;
  } = $props();
</script>

<span data-ui="schedule-time">
  <span data-part="range">
    <strong data-part="start">{start}</strong>
    <span data-part="end">{end}</span>
  </span>
  {#if accessory}<span data-part="accessory">{@render accessory()}</span>{/if}
</span>
