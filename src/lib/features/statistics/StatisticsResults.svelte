<script lang="ts">
  import type { BookingstatistikkFiltre, BookingstatistikkRespons } from "$lib/contracts";
  import { CollectionEmpty, CollectionError, Section } from "$lib/ui";
  import type { Medlemsbookingtype, Statistikkfane } from "./model";
  import {
    formatGeneratedAt,
    formatHours,
    formatIsoDate,
    formatWeekday,
    selectMemberStatistics,
  } from "./model";
  import StatisticsBookingType from "./StatisticsBookingType.svelte";
  import StatisticsCourtTable from "./StatisticsCourtTable.svelte";
  import StatisticsDistribution from "./StatisticsDistribution.svelte";
  import StatisticsHourChart from "./StatisticsHourChart.svelte";
  import StatisticsLoading from "./StatisticsLoading.svelte";
  import StatisticsMembers from "./StatisticsMembers.svelte";
  import StatisticsMetrics from "./StatisticsMetrics.svelte";
  import StatisticsMonthChart from "./StatisticsMonthChart.svelte";

  let {
    bookingType,
    error,
    fetching,
    filters,
    initialLoading,
    onRetry,
    statistics,
    tab,
  }: {
    bookingType: Medlemsbookingtype;
    error: Error | null;
    fetching: boolean;
    filters: BookingstatistikkFiltre;
    initialLoading: boolean;
    onRetry: () => void;
    statistics?: BookingstatistikkRespons;
    tab: Statistikkfane;
  } = $props();

  const mostUsedWeekday = $derived(
    statistics?.perUkedag.length
      ? statistics.perUkedag.reduce((mostUsed, weekday) =>
          weekday.bookedeTimer > mostUsed.bookedeTimer ? weekday : mostUsed
        )
      : undefined
  );
</script>

{#if initialLoading && !statistics}
  <StatisticsLoading />
{:else if error && !statistics}
  <Section variant="surface">
    <CollectionError
      title="Kunne ikke laste statistikken"
      description={error.message}
      isRetrying={fetching}
      {onRetry}
    />
  </Section>
{:else if statistics}
  <div class="statistics-dashboard__results" data-fetching={fetching} aria-busy={fetching}>
    <div class="statistics-dashboard__status">
      <span>{formatIsoDate(statistics.periode.fra)}–{formatIsoDate(statistics.periode.til)}</span>
      <span>
        {fetching ? "Oppdaterer…" : `Beregnet ${formatGeneratedAt(statistics.generertTidspunkt)}`}
      </span>
    </div>

    {#if statistics.nøkkeltall.antallBookinger === 0}
      <Section variant="surface">
        <CollectionEmpty
          title="Ingen bookinger i perioden"
          description="Prøv en annen periode, gren eller bane for å se bookingaktivitet."
        />
      </Section>
    {:else if tab === "medlemmer"}
      <StatisticsMembers members={selectMemberStatistics(statistics, bookingType)} {bookingType} />
    {:else}
      <div class="statistics-dashboard__tab-content">
        <StatisticsMetrics {statistics} />
        <StatisticsMonthChart
          points={statistics.perMåned}
          showComparison={Boolean(statistics.sammenligning)}
        />

        <div class="statistics-dashboard__distributions">
          <StatisticsBookingType metrics={statistics.nøkkeltall} />
          <StatisticsDistribution
            title="Grener"
            description={filters.grenId
              ? "Bookede timer for valgt gren."
              : "Bookede timer fordelt på klubbens grener. Velg en gren for å sammenligne banene."}
            points={statistics.perGren.map((activity) => ({
              id: activity.grenId,
              label: activity.grenNavn,
              bookedHours: activity.bookedeTimer,
              comparisonHours: activity.sammenligningBookedeTimer,
            }))}
          />
        </div>

        <StatisticsDistribution
          title="Ukemønster"
          description="Bookede timer fordelt på ukedag."
          summary={mostUsedWeekday
            ? `Mest brukt: ${formatWeekday(mostUsedWeekday.ukedag)} · ${formatHours(mostUsedWeekday.bookedeTimer)}`
            : undefined}
          points={statistics.perUkedag.map((weekday) => ({
            id: weekday.ukedag,
            label: formatWeekday(weekday.ukedag),
            bookedHours: weekday.bookedeTimer,
            comparisonHours: weekday.sammenligningBookedeTimer,
          }))}
        />

        <StatisticsHourChart
          points={statistics.perTime}
          showComparison={Boolean(statistics.sammenligning)}
        />

        {#if filters.grenId}
          <StatisticsCourtTable courts={statistics.perBane} />
        {/if}
      </div>
    {/if}
  </div>
{/if}
