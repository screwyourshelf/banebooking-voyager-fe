<div
  class="grid gap-lg"
  data-ui="visualization-loading"
  role="status"
  aria-label="Laster statistikk"
  aria-live="polite"
>
  <div
    class="grid grid-cols-2 gap-metric-grid md:grid-cols-4 md:gap-metric-grid-wide"
    data-part="metrics"
    aria-hidden="true"
  >
    {#each Array(4) as _, index (index)}
      <span
        class="h-visualization-loading-metric rounded-record bg-surface-subtle animate-collection-loading motion-reduce:animate-none"
      ></span>
    {/each}
  </div>
  <div
    class="grid gap-lg border border-line rounded-record bg-surface p-lg shadow-surface-sm"
    data-part="chart"
    aria-hidden="true"
  >
    <span
      class="block w-visualization-loading-title h-visualization-loading-title rounded-visualization-summary bg-surface-subtle animate-collection-loading motion-reduce:animate-none"
    ></span>
    <span
      class="block h-visualization-hour-plot rounded-visualization-plot bg-surface-subtle animate-collection-loading motion-reduce:animate-none md:h-visualization-hour-plot-wide"
    ></span>
  </div>
</div>
