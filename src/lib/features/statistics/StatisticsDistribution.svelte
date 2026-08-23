<script lang="ts" module>
  export type StatisticsDistributionPoint = {
    id: string;
    label: string;
    bookedHours: number;
    comparisonHours: number | null;
  };
</script>

<script lang="ts">
  import { Section } from "$lib/ui";
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

<Section variant="surface" {title} {description} data-context="statistics" data-view="distribution">
  {#if summary}
    <p class="statistics-distribution__summary" data-stat-role="chart-label">{summary}</p>
  {/if}

  <div class="statistics-distribution__list">
    {#each points as point (point.id)}
      <div class="statistics-distribution__row">
        <div class="statistics-distribution__label">
          <strong data-stat-role="chart-label">{point.label}</strong>
          <span data-stat-role="chart-meta">
            <strong data-stat-role="chart-value">{formatHours(point.bookedHours)}</strong>
            {#if point.comparisonHours !== null}
              · året før {formatHours(point.comparisonHours)}
            {/if}
          </span>
        </div>
        <div class="statistics-distribution__bars" aria-hidden="true">
          <span
            data-series="current"
            style={`--statistics-bar-width: ${(point.bookedHours / maximum) * 100}%`}
          ></span>
          {#if point.comparisonHours !== null}
            <span
              data-series="previous"
              style={`--statistics-bar-width: ${(point.comparisonHours / maximum) * 100}%`}
            ></span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</Section>
