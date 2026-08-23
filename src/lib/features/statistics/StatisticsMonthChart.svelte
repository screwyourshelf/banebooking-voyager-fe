<script lang="ts">
  import type { BookingPerMaaned } from "$lib/contracts";
  import { Section } from "$lib/ui";
  import { formatHours, formatMonth } from "./model";

  let { points, showComparison }: { points: BookingPerMaaned[]; showComparison: boolean } =
    $props();

  const height = 260;
  const top = 24;
  const bottom = 42;
  const left = 46;
  const right = 24;
  let availableWidth = $state(0);
  const maximum = $derived(
    Math.max(
      1,
      ...points.flatMap((point) => [point.bookedeTimer, point.sammenligningBookedeTimer ?? 0])
    )
  );
  const minimumWidth = $derived(Math.max(620, (points.length - 1) * 76 + left + right));
  const chartWidth = $derived(Math.max(minimumWidth, availableWidth));
  const hasMultipleYears = $derived(new Set(points.map((point) => point.år)).size > 1);
  const current = $derived(createLine((point) => point.bookedeTimer));
  const comparison = $derived(createLine((point) => point.sammenligningBookedeTimer));
  const grid = [0, 0.25, 0.5, 0.75, 1];

  function createLine(readValue: (point: BookingPerMaaned) => number | null) {
    const drawingWidth = chartWidth - left - right;
    const drawingHeight = height - top - bottom;
    const distance = points.length > 1 ? drawingWidth / (points.length - 1) : 0;

    return points.flatMap((point, index) => {
      const value = readValue(point);
      if (value === null) return [];
      return [
        {
          x: points.length > 1 ? left + index * distance : left + drawingWidth / 2,
          y: top + (1 - value / maximum) * drawingHeight,
          value,
          point,
        },
      ];
    });
  }

  function polyline(line: ReturnType<typeof createLine>) {
    return line.map(({ x, y }) => `${x},${y}`).join(" ");
  }
</script>

{#snippet legend()}
  <span class="statistics-chart-legend" aria-label="Tegnforklaring">
    <span data-series="current">Valgt periode</span>
    {#if showComparison}<span data-series="previous">Året før</span>{/if}
  </span>
{/snippet}

<Section
  variant="surface"
  title="Utvikling gjennom perioden"
  description="Bookede timer per måned i den valgte perioden."
  actions={legend}
  data-context="statistics"
  data-view="month-chart"
>
  <div class="statistics-month-chart__scroll" bind:clientWidth={availableWidth}>
    <div
      class="statistics-month-chart__plot"
      style={`--statistics-line-chart-width: ${chartWidth}px`}
    >
      <svg
        width={chartWidth}
        {height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        role="img"
        aria-label="Linjediagram over bookede timer per måned"
      >
        <title>Utvikling i bookede timer per måned</title>

        {#each grid as share (share)}
          {@const y = top + (1 - share) * (height - top - bottom)}
          <g class="statistics-line-chart__grid">
            <line x1={left} x2={chartWidth - right} y1={y} y2={y}></line>
            <text x={left - 8} y={y + 4} text-anchor="end" data-stat-role="chart-meta">
              {formatHours(Math.round(maximum * share))}
            </text>
          </g>
        {/each}

        {#if showComparison && comparison.length > 1}
          <polyline
            class="statistics-line-chart__line"
            data-series="previous"
            points={polyline(comparison)}
          ></polyline>
        {/if}
        {#if current.length > 1}
          <polyline
            class="statistics-line-chart__line"
            data-series="current"
            points={polyline(current)}
          ></polyline>
        {/if}

        {#if showComparison}
          {#each comparison as item (`previous-${item.point.år}-${item.point.måned}`)}
            <circle
              class="statistics-line-chart__point"
              data-series="previous"
              cx={item.x}
              cy={item.y}
              r="4"
            >
              <title>{formatMonth(item.point.måned)} året før: {formatHours(item.value)}</title>
            </circle>
          {/each}
        {/if}

        {#each current as item (`${item.point.år}-${item.point.måned}`)}
          {@const month = formatMonth(item.point.måned)}
          <g>
            <circle
              class="statistics-line-chart__point"
              data-series="current"
              cx={item.x}
              cy={item.y}
              r="4.5"
            >
              <title>{month} {item.point.år}: {formatHours(item.value)}</title>
            </circle>
            <text
              class="statistics-line-chart__label"
              data-stat-role="chart-meta"
              x={item.x}
              y={height - 13}
              text-anchor="middle"
            >
              {hasMultipleYears ? `${month} ${String(item.point.år).slice(-2)}` : month}
            </text>
          </g>
        {/each}
      </svg>
    </div>
  </div>
</Section>
