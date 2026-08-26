<script lang="ts" module>
  export type VisualizationLegendItem = {
    label: string;
    series: "current" | "previous";
  };
</script>

<script lang="ts">
  let { items }: { items: VisualizationLegendItem[] } = $props();
</script>

<span
  class="flex flex-wrap justify-start gap-x-md gap-y-visualization-legend-row text-ink-faint text-stat-chart-meta font-stat-chart-meta md:justify-end"
  data-ui="visualization-legend"
  aria-label="Tegnforklaring"
>
  {#each items as item (item.series)}
    <span class="inline-flex items-center gap-visualization-legend-item" data-series={item.series}>
      <span
        class={[
          "size-visualization-swatch rounded-visualization-swatch",
          item.series === "previous" ? "bg-chart-2" : "bg-chart-1",
        ]}
        aria-hidden="true"
      ></span>
      {item.label}
    </span>
  {/each}
</span>
