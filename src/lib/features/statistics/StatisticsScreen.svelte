<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { getApiClient } from "#lib/platform/api/index.ts";
  import { getTenantContext } from "#lib/platform/tenant/index.ts";
  import { Button, Feedback, Page, Tabs, VisualizationLayout } from "#lib/ui/index.ts";
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
  const browser = typeof document !== "undefined";
  let filters = $state(createStatisticsFilters());
  let period = $state<StatistikkPeriodevalg>("året-så-langt");
  let activeTab = $state<Statistikkfane>("banebruk");
  let memberBookingType = $state<Medlemsbookingtype>("alle");
  let exporting = $state(false);
  let exportFailed = $state(false);

  const statisticsQuery = createQuery(() =>
    bookingStatisticsQueryOptions(api, tenant.slug, filters)
  );
  const activitiesQuery = createQuery(() => statisticsActivitiesQueryOptions(api, tenant.slug));
  const courtsQuery = createQuery(() => statisticsCourtsQueryOptions(api, tenant.slug));
  const filteredCourts = $derived(availableCourts(courtsQuery.data ?? [], filters.grenId));
  const setupLoading = $derived(activitiesQuery.isPending || courtsQuery.isPending);
  const canExport = $derived(
    statisticsQuery.isSuccess &&
      !statisticsQuery.isFetching &&
      !statisticsQuery.isPlaceholderData &&
      !exporting
  );

  async function exportStatistics() {
    const statistics = statisticsQuery.data;
    if (!browser || !canExport || !statistics) return;

    const activity =
      activitiesQuery.data?.find((item) => item.id === filters.grenId)?.slug ??
      filters.grenId ??
      "alle-grener";
    const court = filters.baneId ? `-${filters.baneId}` : "";
    const fileName = `statistikk-${tenant.slug}-${activity}${court}-${statistics.periode.fra}-${statistics.periode.til}.json`;
    exporting = true;
    exportFailed = false;
    try {
      const { downloadJsonFile } = await import("#lib/platform/download/download-json.client.ts");
      downloadJsonFile(statistics, fileName);
    } catch {
      exportFailed = true;
    } finally {
      exporting = false;
    }
  }

  function selectPeriod(value: StatistikkPeriodevalg) {
    period = value;
    filters = applyPeriodSelection(filters, value);
  }

  function selectActivity(value: string | null) {
    filters = applyActivityFilter(filters, value, courtsQuery.data ?? []);
  }
</script>

{#snippet actions()}
  <Button variant="secondary" disabled={!canExport} onclick={exportStatistics}>
    {exporting ? "Eksporterer …" : "Eksporter JSON"}
  </Button>
{/snippet}

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
  {actions}
>
  {#if exportFailed}
    <Feedback
      tone="danger"
      title="Statistikken kunne ikke eksporteres"
      description="Prøv å eksportere JSON på nytt."
    />
  {/if}
  <VisualizationLayout variant="dashboard">
    <Tabs
      label="Statistikkområder"
      bind:value={activeTab}
      controls={filtersContent}
      items={[
        { value: "banebruk", label: "Banebruk", content: usageContent },
        { value: "medlemmer", label: "Medlemmer", content: membersContent },
      ]}
    />
  </VisualizationLayout>
</Page>
