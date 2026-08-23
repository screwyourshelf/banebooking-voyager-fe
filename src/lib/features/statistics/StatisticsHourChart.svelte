<script lang="ts">
  import type { BookingPerTime } from "$lib/contracts";
  import { Section } from "$lib/ui";
  import { formatHours } from "./model";

  let { points, showComparison }: { points: BookingPerTime[]; showComparison: boolean } = $props();

  const visiblePoints = $derived.by(() => {
    const activeHours = points
      .filter((point) => point.bookedeTimer > 0 || (point.sammenligningBookedeTimer ?? 0) > 0)
      .map((point) => point.time);
    if (activeHours.length === 0) return points;
    const firstHour = Math.max(0, Math.min(...activeHours) - 1);
    const lastHour = Math.min(23, Math.max(...activeHours) + 1);
    return points.filter((point) => point.time >= firstHour && point.time <= lastHour);
  });
  const maximum = $derived(
    Math.max(
      1,
      ...visiblePoints.flatMap((point) => [
        point.bookedeTimer,
        point.sammenligningBookedeTimer ?? 0,
      ])
    )
  );
</script>

{#snippet legend()}
  {#if showComparison}
    <span class="statistics-chart-legend" aria-label="Tegnforklaring">
      <span data-series="current">Valgt periode</span>
      <span data-series="previous">Året før</span>
    </span>
  {/if}
{/snippet}

<Section
  variant="surface"
  title="Tid på døgnet"
  description="Når på døgnet banene brukes mest."
  actions={legend}
  data-context="statistics"
  data-view="hour-chart"
>
  <div class="statistics-hour-chart__scroll">
    <div
      class="statistics-hour-chart__plot"
      role="img"
      aria-label="Stolpediagram over bookede timer per klokkeslett"
      style={`--statistics-hour-count: ${visiblePoints.length}`}
    >
      {#each visiblePoints as point (point.time)}
        {@const comparison = point.sammenligningBookedeTimer}
        {@const time = `${String(point.time).padStart(2, "0")}:00`}
        <div
          class="statistics-hour-chart__hour"
          aria-label={comparison === null
            ? `${time}: ${formatHours(point.bookedeTimer)}`
            : `${time}: ${formatHours(point.bookedeTimer)}. Året før: ${formatHours(comparison)}`}
        >
          <div class="statistics-hour-chart__bars" aria-hidden="true">
            <span
              data-series="current"
              style={`--statistics-bar-height: ${(point.bookedeTimer / maximum) * 100}%`}
              title={`${formatHours(point.bookedeTimer)} – valgt periode`}
            ></span>
            {#if showComparison}
              <span
                data-series="previous"
                style={`--statistics-bar-height: ${((comparison ?? 0) / maximum) * 100}%`}
                title={`${formatHours(comparison ?? 0)} – året før`}
              ></span>
            {/if}
          </div>
          <strong data-stat-role="chart-value">{formatHours(point.bookedeTimer)}</strong>
          <span data-stat-role="chart-meta">{String(point.time).padStart(2, "0")}</span>
        </div>
      {/each}
    </div>
  </div>
</Section>
