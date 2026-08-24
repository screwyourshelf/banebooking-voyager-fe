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

<span
  class="flex min-w-0 flex-col items-start gap-schedule-time text-ink-faint text-body-sm font-schedule-time tabular-nums"
  data-ui="schedule-time"
>
  <span class="grid gap-schedule-time-range whitespace-nowrap" data-part="range">
    <strong
      class="text-choice-indicator text-body-lg font-schedule-time-start leading-schedule-time tracking-schedule-time-start"
      data-part="start">{start}</strong
    >
    <span class="text-caption leading-schedule-time" data-part="end">{end}</span>
  </span>
  {#if accessory}
    <span class="inline-flex" data-part="accessory">{@render accessory()}</span>
  {/if}
</span>
