<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    change,
    description,
    direction,
    icon,
    label,
    unit,
    value,
  }: {
    change?: string | null;
    description: string;
    direction?: "up" | "down";
    icon: Snippet;
    label: string;
    unit?: string;
    value: string;
  } = $props();
</script>

<article
  class="min-w-0 overflow-hidden border border-line rounded-record bg-surface shadow-surface-sm"
  data-ui="metric"
>
  <div
    class="relative grid min-w-0 grid-cols-metric-content items-start gap-metric-content-gap p-metric-content"
    data-part="content"
  >
    <span
      class="grid size-metric-icon place-items-center rounded-metric-icon bg-brand-soft text-brand-strong metric-icon-svg:size-control-icon"
      data-part="icon"
      aria-hidden="true">{@render icon()}</span
    >
    <span class="grid min-w-0 gap-metric-value" data-part="value">
      <small
        class="text-ink-faint text-stat-chart-label font-stat-chart-label leading-metric-label"
      >
        {label}
      </small>
      <strong
        class="text-ink font-display text-stat-key-value font-stat-key-value leading-metric-value tracking-metric-value tabular-nums whitespace-nowrap"
      >
        {value}{#if unit}<span
            class="font-sans text-metric-unit font-metric-unit tracking-metric-unit"
            data-part="unit"
          >
            {unit}</span
          >{/if}
      </strong>
      <span
        class="overflow-hidden text-ink-faint text-stat-chart-meta font-stat-chart-meta text-ellipsis whitespace-nowrap"
        >{description}</span
      >
    </span>
    {#if change}
      <span
        class={[
          "absolute top-0 right-md rounded-control px-metric-change-inline py-metric-change-block text-stat-chart-meta font-metric-change",
          direction === "down"
            ? "bg-status-danger-bg text-status-danger-text"
            : "bg-status-available-bg text-status-available-text",
        ]}
        data-part="change"
        data-direction={direction}
      >
        {change}
      </span>
    {/if}
  </div>
</article>
