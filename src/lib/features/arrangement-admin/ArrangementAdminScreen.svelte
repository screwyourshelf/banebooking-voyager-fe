<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { ArrangementRespons } from "$lib/contracts";
  import {
    formaterArrangementMetadata,
    getArrangementLifecycleStatus,
    harHandling,
    Kapabiliteter,
  } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    CollectionRow,
    EditorDialog,
    Feedback,
    Page,
  } from "$lib/ui";
  import ArrangementEditor from "./ArrangementEditor.svelte";
  import { arrangementDateRange } from "./model";
  import {
    adminArrangementsQueryOptions,
    arrangementActivitiesQueryOptions,
    arrangementCourtsQueryOptions,
  } from "./queries";

  let { capabilities }: { capabilities: readonly string[] } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const allowed = $derived(harHandling(capabilities, Kapabiliteter.arrangement.se));
  const arrangementsQuery = createQuery(() =>
    adminArrangementsQueryOptions(api, tenant.slug, allowed)
  );
  const activitiesQuery = createQuery(() =>
    arrangementActivitiesQueryOptions(api, tenant.slug, allowed)
  );

  let createOpen = $state(false);
  let editorOpen = $state(false);
  let editorBusy = $state(false);
  let selectedArrangementId = $state("");
  let includeHistorical = $state(false);
  let selectedActivities = $state<string[]>([]);
  let creationFeedback = $state<{ message: string; tone: "success" | "warning" } | null>(null);

  const editorNeedsCourts = $derived(createOpen || editorOpen);
  const courtsQuery = createQuery(() =>
    arrangementCourtsQueryOptions(api, tenant.slug, allowed && editorNeedsCourts)
  );

  const arrangements = $derived(arrangementsQuery.data ?? []);
  const activities = $derived(activitiesQuery.data ?? []);
  const courts = $derived(courtsQuery.data ?? []);
  const selectedArrangement = $derived(
    arrangements.find((arrangement) => arrangement.id === selectedArrangementId)
  );
  const visibleArrangements = $derived(
    arrangements.filter(
      (arrangement) =>
        (includeHistorical || !arrangement.erPassert) &&
        (selectedActivities.length === 0 || selectedActivities.includes(arrangement.grenSlug))
    )
  );
  const filterOptions = $derived(
    activities
      .filter((activity) =>
        arrangements.some((arrangement) => arrangement.grenSlug === activity.slug)
      )
      .map((activity) => ({ value: activity.slug, label: activity.navn }))
  );
  const loading = $derived(arrangementsQuery.isPending || activitiesQuery.isPending);
  const fetching = $derived(
    arrangementsQuery.isFetching || activitiesQuery.isFetching || courtsQuery.isFetching
  );
  const queryError = $derived(
    arrangementsQuery.error ??
      activitiesQuery.error ??
      (editorNeedsCourts ? courtsQuery.error : null)
  );

  function toggleActivity(value: string) {
    selectedActivities = selectedActivities.includes(value)
      ? selectedActivities.filter((activity) => activity !== value)
      : [...selectedActivities, value];
  }

  function openArrangement(arrangement: ArrangementRespons) {
    selectedArrangementId = arrangement.id;
    editorOpen = true;
    creationFeedback = null;
  }

  function created(message: string, tone: "success" | "warning") {
    creationFeedback = { message, tone };
    editorBusy = false;
    createOpen = false;
  }

  function deleted() {
    editorBusy = false;
    editorOpen = false;
    selectedArrangementId = "";
  }

  function closeEditor() {
    if (editorBusy) return;
    editorOpen = false;
    selectedArrangementId = "";
  }
</script>

{#snippet actions()}
  <Button onclick={() => (createOpen = true)} disabled={fetching}>Nytt arrangement</Button>
{/snippet}

{#snippet filters()}
  <CollectionControls
    label="Filtrer arrangementer"
    groups={filterOptions.length > 1
      ? [
          {
            label: "Gren",
            options: filterOptions,
            selectedValues: selectedActivities,
            onSelect: toggleActivity,
          },
        ]
      : []}
    onReset={() => (selectedActivities = [])}
    disabled={fetching}
  />
{/snippet}

{#snippet emptyAction()}
  {#if selectedActivities.length > 0}
    <Button variant="secondary" onclick={() => (selectedActivities = [])}>Nullstill filter</Button>
  {/if}
{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Administrer arrangementer"
  description="Planlegg program, legg til banetider og styr publisering."
  actions={allowed ? actions : undefined}
>
  {#if !allowed}
    <Feedback
      tone="warning"
      title="Du har ikke tilgang til arrangementadministrasjon"
      description="En klubbadministrator må gi deg tilgang før du kan administrere arrangementer."
    />
  {:else}
    {#if creationFeedback}
      <Feedback
        tone={creationFeedback.tone}
        title="Arrangementet er opprettet"
        description={creationFeedback.message}
      />
    {/if}

    <Collection
      title={loading
        ? "Laster arrangementer …"
        : `${visibleArrangements.length} ${visibleArrangements.length === 1 ? "arrangement" : "arrangementer"}`}
      scope={includeHistorical ? "Alle" : "Nå og fremover"}
      toggle={{
        title: "Vis tidligere",
        checked: includeHistorical,
        onCheckedChange: (checked) => (includeHistorical = checked),
        pending: fetching,
      }}
      filters={filterOptions.length > 1 ? filters : undefined}
      filtersLabel="Arrangementsfiltre"
      busy={fetching}
    >
      {#if loading}
        <CollectionLoading label="Laster arrangementer" rows={4} />
      {:else if queryError}
        <CollectionError
          title="Kunne ikke laste arrangementene"
          description={queryError instanceof Error ? queryError.message : "Prøv igjen om litt."}
          isRetrying={fetching}
          onRetry={() =>
            void Promise.all([
              arrangementsQuery.refetch(),
              activitiesQuery.refetch(),
              ...(editorNeedsCourts ? [courtsQuery.refetch()] : []),
            ])}
        />
      {:else if visibleArrangements.length === 0}
        <CollectionEmpty
          title={selectedActivities.length > 0
            ? "Ingen arrangementer for valgt gren"
            : includeHistorical
              ? "Ingen arrangementer ennå"
              : "Ingen aktive arrangementer"}
          description={selectedActivities.length > 0
            ? "Velg en annen gren eller nullstill filteret."
            : includeHistorical
              ? "Opprett et arrangement for å legge til tider."
              : "Vis tidligere eller opprett et nytt arrangement."}
          action={selectedActivities.length > 0 ? emptyAction : undefined}
        />
      {:else}
        <CollectionList>
          {#each visibleArrangements as arrangement (arrangement.id)}
            <CollectionRow
              title={arrangement.tittel}
              description={arrangementDateRange(arrangement)}
              meta={formaterArrangementMetadata(arrangement)}
              status={getArrangementLifecycleStatus(arrangement)}
              muted={arrangement.erPassert}
              interaction={{ type: "open", onOpen: () => openArrangement(arrangement) }}
              ariaLabel={`Rediger ${arrangement.tittel}, ${arrangementDateRange(arrangement)}`}
            />
          {/each}
        </CollectionList>
      {/if}
    </Collection>
  {/if}
</Page>

<EditorDialog
  bind:open={createOpen}
  backLabel="Alle arrangementer"
  eyebrow="Nytt arrangement"
  title="Opprett arrangement"
  description="Legg inn informasjon og bygg listen over banetider."
  pending={editorBusy}
  onClose={() => (editorBusy = false)}
>
  {#if createOpen}
    <ArrangementEditor
      mode="create"
      {activities}
      {courts}
      onBusyChange={(busy) => (editorBusy = busy)}
      onCreated={created}
    />
  {/if}
</EditorDialog>

<EditorDialog
  bind:open={editorOpen}
  backLabel="Alle arrangementer"
  eyebrow="Rediger arrangement"
  title={selectedArrangement?.tittel ?? "Arrangement"}
  description={selectedArrangement
    ? `${arrangementDateRange(selectedArrangement)} · ${selectedArrangement.grenNavn}`
    : "Laster arrangementet."}
  pending={editorBusy}
  onClose={closeEditor}
>
  {#if editorOpen && selectedArrangement}
    <ArrangementEditor
      mode="edit"
      arrangement={selectedArrangement}
      {activities}
      {courts}
      onBusyChange={(busy) => (editorBusy = busy)}
      onDeleted={deleted}
    />
  {/if}
</EditorDialog>
