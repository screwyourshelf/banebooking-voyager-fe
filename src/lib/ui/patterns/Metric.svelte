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

<article data-ui="metric">
  <div data-part="content">
    <span data-part="icon" aria-hidden="true">{@render icon()}</span>
    <span data-part="value">
      <small data-stat-role="chart-label">{label}</small>
      <strong data-stat-role="key-value">
        {value}{#if unit}<span data-part="unit"> {unit}</span>{/if}
      </strong>
      <span data-stat-role="chart-meta">{description}</span>
    </span>
    {#if change}
      <span data-part="change" data-direction={direction} data-stat-role="chart-meta">
        {change}
      </span>
    {/if}
  </div>
</article>
