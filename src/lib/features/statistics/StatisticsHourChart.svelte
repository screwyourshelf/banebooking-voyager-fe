<script lang="ts">
  import type { BookingPerTime } from "$lib/contracts";
  import { DataVisualization, Section, VisualizationLegend } from "$lib/ui";
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
    <VisualizationLegend
      items={[
        { series: "current", label: "Valgt periode" },
        { series: "previous", label: "Året før" },
      ]}
    />
  {/if}
{/snippet}

<Section
  variant="surface"
  title="Tid på døgnet"
  description="Når på døgnet banene brukes mest."
  actions={legend}
>
  <DataVisualization kind="bars">
    <div
      data-visualization="hour-plot"
      role="img"
      aria-label="Stolpediagram over bookede timer per klokkeslett"
      style={`--statistics-hour-count: ${visiblePoints.length}`}
    >
      {#each visiblePoints as point (point.time)}
        {@const comparison = point.sammenligningBookedeTimer}
        {@const time = `${String(point.time).padStart(2, "0")}:00`}
        <div
          data-visualization="hour"
          aria-label={comparison === null
            ? `${time}: ${formatHours(point.bookedeTimer)}`
            : `${time}: ${formatHours(point.bookedeTimer)}. Året før: ${formatHours(comparison)}`}
        >
          <div data-visualization="hour-bars" aria-hidden="true">
            <span
              data-visualization="hour-bar"
              data-series="current"
              style={`--statistics-bar-height: ${(point.bookedeTimer / maximum) * 100}%`}
              title={`${formatHours(point.bookedeTimer)} – valgt periode`}
            ></span>
            {#if showComparison}
              <span
                data-visualization="hour-bar"
                data-series="previous"
                style={`--statistics-bar-height: ${((comparison ?? 0) / maximum) * 100}%`}
                title={`${formatHours(comparison ?? 0)} – året før`}
              ></span>
            {/if}
          </div>
          <strong>{formatHours(point.bookedeTimer)}</strong>
          <span data-visualization="hour-label">{String(point.time).padStart(2, "0")}</span>
        </div>
      {/each}
    </div>
  </DataVisualization>
</Section>

<style>
  [data-visualization="hour-plot"] {
    min-width: max(36rem, calc(var(--statistics-hour-count) * 3.5rem));
    grid-template-columns: repeat(var(--statistics-hour-count), minmax(2.75rem, 1fr));
  }

  [data-visualization="hour-bar"] {
    height: var(--statistics-bar-height);
  }
</style>
