<script lang="ts">
  import type { BookingNøkkeltall } from "$lib/contracts";
  import { Section } from "$lib/ui";
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
  data-context="statistics"
  data-view="booking-types"
>
  <div class="statistics-booking-types__content">
    <div class="statistics-booking-types__chart">
      <svg viewBox="0 0 128 128" role="img" aria-label="Fordeling mellom bookingtyper">
        <title>
          {formatCountWithUnit(personal)} personlige bookinger ({formatShare(personal)}) og
          {formatCountWithUnit(event)} arrangementsbookinger ({formatShare(event)})
        </title>
        <circle class="statistics-donut__track" cx="64" cy="64" r={radius}></circle>
        <circle
          class="statistics-donut__segment"
          data-series="current"
          cx="64"
          cy="64"
          r={radius}
          stroke-dasharray={`${personalLength} ${circumference}`}
        ></circle>
        <circle
          class="statistics-donut__segment"
          data-series="previous"
          cx="64"
          cy="64"
          r={radius}
          stroke-dasharray={`${eventLength} ${circumference}`}
          stroke-dashoffset={-personalLength}
        ></circle>
      </svg>
      <span aria-hidden="true">
        <strong data-stat-role="chart-value">{formatCountWithUnit(total)}</strong>
        <small data-stat-role="chart-meta">bookinger</small>
      </span>
    </div>

    <dl class="statistics-booking-types__legend">
      <div data-series="current">
        <dt data-stat-role="chart-label">Personlige</dt>
        <dd>
          <strong data-stat-role="chart-value">{formatCountWithUnit(personal)}</strong>
          <span data-stat-role="chart-meta">{formatShare(personal)}</span>
        </dd>
      </div>
      <div data-series="previous">
        <dt data-stat-role="chart-label">Arrangement</dt>
        <dd>
          <strong data-stat-role="chart-value">{formatCountWithUnit(event)}</strong>
          <span data-stat-role="chart-meta">{formatShare(event)}</span>
        </dd>
      </div>
    </dl>
  </div>
</Section>
