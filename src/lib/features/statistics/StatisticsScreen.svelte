<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import { Page, Tabs } from "$lib/ui";
  import {
    applyActivityFilter,
    applyPeriodSelection,
    availableCourts,
    createStatisticsFilters,
    type Medlemsbookingtype,
    type Statistikkfane,
    type StatistikkPeriodevalg,
  } from "./model";
  import {
    bookingStatisticsQueryOptions,
    statisticsActivitiesQueryOptions,
    statisticsCourtsQueryOptions,
  } from "./queries";
  import StatisticsFilters from "./StatisticsFilters.svelte";
  import StatisticsResults from "./StatisticsResults.svelte";

  const api = getApiClient();
  const tenant = getTenantContext();
  let filters = $state(createStatisticsFilters());
  let period = $state<StatistikkPeriodevalg>("året-så-langt");
  let activeTab = $state<Statistikkfane>("banebruk");
  let memberBookingType = $state<Medlemsbookingtype>("alle");

  const statisticsQuery = createQuery(() =>
    bookingStatisticsQueryOptions(api, tenant.slug, filters)
  );
  const activitiesQuery = createQuery(() => statisticsActivitiesQueryOptions(api, tenant.slug));
  const courtsQuery = createQuery(() => statisticsCourtsQueryOptions(api, tenant.slug));
  const filteredCourts = $derived(availableCourts(courtsQuery.data ?? [], filters.grenId));
  const setupLoading = $derived(activitiesQuery.isPending || courtsQuery.isPending);

  function selectPeriod(value: StatistikkPeriodevalg) {
    period = value;
    filters = applyPeriodSelection(filters, value);
  }

  function selectActivity(value: string | null) {
    filters = applyActivityFilter(filters, value, courtsQuery.data ?? []);
  }
</script>

{#snippet filtersContent()}
  <StatisticsFilters
    {filters}
    {period}
    activities={activitiesQuery.data ?? []}
    courts={filteredCourts}
    bookingType={memberBookingType}
    showBookingType={activeTab === "medlemmer"}
    disabled={setupLoading}
    onFiltersChange={(nextFilters) => {
      const datesChanged = nextFilters.fra !== filters.fra || nextFilters.til !== filters.til;
      filters = nextFilters;
      if (datesChanged) period = "egendefinert";
    }}
    onPeriodChange={selectPeriod}
    onActivityChange={selectActivity}
    onCourtChange={(baneId) => (filters = { ...filters, baneId })}
    onBookingTypeChange={(value) => (memberBookingType = value)}
  />
{/snippet}

{#snippet usageContent()}
  <StatisticsResults
    tab="banebruk"
    {filters}
    bookingType={memberBookingType}
    statistics={statisticsQuery.data}
    error={statisticsQuery.error}
    initialLoading={statisticsQuery.isPending}
    fetching={statisticsQuery.isFetching}
    onRetry={() => void statisticsQuery.refetch()}
  />
{/snippet}

{#snippet membersContent()}
  <StatisticsResults
    tab="medlemmer"
    {filters}
    bookingType={memberBookingType}
    statistics={statisticsQuery.data}
    error={statisticsQuery.error}
    initialLoading={statisticsQuery.isPending}
    fetching={statisticsQuery.isFetching}
    onRetry={() => void statisticsQuery.refetch()}
  />
{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Statistikk"
  description="Se hvordan klubbens baner brukes og sammenlign bookingaktivitet over tid."
>
  <div class="statistics-dashboard">
    <Tabs
      label="Statistikkområder"
      bind:value={activeTab}
      controls={filtersContent}
      items={[
        { value: "banebruk", label: "Banebruk", content: usageContent },
        { value: "medlemmer", label: "Medlemmer", content: membersContent },
      ]}
    />
  </div>
</Page>
