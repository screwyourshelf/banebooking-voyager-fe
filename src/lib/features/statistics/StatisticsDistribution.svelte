<script lang="ts" module>
  export type StatisticsDistributionPoint = {
    id: string;
    label: string;
    bookedHours: number;
    comparisonHours: number | null;
  };
</script>

<script lang="ts">
  import { DataVisualization, Section } from "$lib/ui";
  import { formatHours } from "./model";

  let {
    description,
    points,
    summary,
    title,
  }: {
    description: string;
    points: StatisticsDistributionPoint[];
    summary?: string;
    title: string;
  } = $props();

  const maximum = $derived(
    Math.max(1, ...points.flatMap((point) => [point.bookedHours, point.comparisonHours ?? 0]))
  );
</script>

<Section variant="surface" {title} {description}>
  <DataVisualization kind="distribution">
    {#if summary}
      <p data-visualization="summary">{summary}</p>
    {/if}

    <div data-visualization="list">
      {#each points as point (point.id)}
        <div data-visualization="row">
          <div data-visualization="row-label">
            <strong data-visualization="row-label-title">{point.label}</strong>
            <span data-visualization="row-label-meta">
              <strong data-visualization="row-label-value">{formatHours(point.bookedHours)}</strong>
              {#if point.comparisonHours !== null}
                · året før {formatHours(point.comparisonHours)}
              {/if}
            </span>
          </div>
          <div data-visualization="bars" aria-hidden="true">
            <span
              data-visualization="bar"
              data-series="current"
              style={`--statistics-bar-width: ${(point.bookedHours / maximum) * 100}%`}
            ></span>
            {#if point.comparisonHours !== null}
              <span
                data-visualization="bar"
                data-series="previous"
                style={`--statistics-bar-width: ${(point.comparisonHours / maximum) * 100}%`}
              ></span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </DataVisualization>
</Section>

<style>
  [data-visualization="bar"] {
    width: var(--statistics-bar-width);
  }
</style>
