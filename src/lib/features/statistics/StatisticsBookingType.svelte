<script lang="ts">
  import type { BookingNøkkeltall } from "$lib/contracts";
  import { DataVisualization, Section } from "$lib/ui";
  import { formatCountWithUnit } from "./model";

  let { metrics }: { metrics: BookingNøkkeltall } = $props();

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const personal = $derived(metrics.personligeBookinger);
  const event = $derived(metrics.arrangementbookinger);
  const total = $derived(personal + event);
  const personalLength = $derived(total > 0 ? (personal / total) * circumference : 0);
  const eventLength = $derived(total > 0 ? (event / total) * circumference : 0);

  function formatShare(value: number) {
    return total === 0 ? "0 %" : `${Math.round((value / total) * 100)} %`;
  }
</script>

<Section
  variant="surface"
  title="Bookingtype"
  description="Andel personlige bookinger og arrangementsbookinger."
>
  <DataVisualization kind="donut">
    <div data-visualization="donut-chart">
      <svg
        data-visualization="donut-svg"
        viewBox="0 0 128 128"
        role="img"
        aria-label="Fordeling mellom bookingtyper"
      >
        <title>
          {formatCountWithUnit(personal)} personlige bookinger ({formatShare(personal)}) og
          {formatCountWithUnit(event)} arrangementsbookinger ({formatShare(event)})
        </title>
        <circle data-visualization="donut-track" cx="64" cy="64" r={radius}></circle>
        <circle
          data-visualization="donut-segment"
          data-series="current"
          cx="64"
          cy="64"
          r={radius}
          stroke-dasharray={`${personalLength} ${circumference}`}
        ></circle>
        <circle
          data-visualization="donut-segment"
          data-series="previous"
          cx="64"
          cy="64"
          r={radius}
          stroke-dasharray={`${eventLength} ${circumference}`}
          stroke-dashoffset={-personalLength}
        ></circle>
      </svg>
      <span data-visualization="donut-center" aria-hidden="true">
        <strong data-visualization="donut-value">{formatCountWithUnit(total)}</strong>
        <small data-visualization="donut-meta">bookinger</small>
      </span>
    </div>

    <dl data-visualization="donut-legend">
      <div data-visualization="donut-legend-item" data-series="current">
        <span data-visualization="donut-swatch" data-series="current" aria-hidden="true"></span>
        <dt data-visualization="donut-term">Personlige</dt>
        <dd data-visualization="donut-description">
          <strong data-visualization="donut-description-value"
            >{formatCountWithUnit(personal)}</strong
          >
          <span data-visualization="donut-description-meta">{formatShare(personal)}</span>
        </dd>
      </div>
      <div data-visualization="donut-legend-item" data-series="previous">
        <span data-visualization="donut-swatch" data-series="previous" aria-hidden="true"></span>
        <dt data-visualization="donut-term">Arrangement</dt>
        <dd data-visualization="donut-description">
          <strong data-visualization="donut-description-value">{formatCountWithUnit(event)}</strong>
          <span data-visualization="donut-description-meta">{formatShare(event)}</span>
        </dd>
      </div>
    </dl>
  </DataVisualization>
</Section>
