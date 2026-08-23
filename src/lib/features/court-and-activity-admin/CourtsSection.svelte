<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { BaneRespons } from "$lib/contracts";
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
  } from "$lib/ui";
  import CourtForm from "./CourtForm.svelte";
  import {
    courtDraftIsDirty,
    courtToDraft,
    createCourtDraft,
    createCourtReorderUpdates,
    hasErrors,
    nextCourtSortOrder,
    sortActivities,
    sortCourts,
    toCourtBookingSettingsRequest,
    toCourtUpdateRequest,
    validateCourtDraft,
    type CourtDraft,
  } from "./model";
  import {
    adminActivitiesQueryOptions,
    adminCourtsQueryOptions,
    createCourtMutationOptions,
    reorderCourtsMutationOptions,
    saveCourtMutationOptions,
  } from "./queries";

  let { createOpen = $bindable(false) }: { createOpen?: boolean } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const courtsQuery = createQuery(() => adminCourtsQueryOptions(api, tenant.slug));
  const activitiesQuery = createQuery(() => adminActivitiesQueryOptions(api, tenant.slug));
  const createCourtMutation = createMutation(() =>
    createCourtMutationOptions(api, queryClient, tenant.slug)
  );
  const saveMutation = createMutation(() =>
    saveCourtMutationOptions(api, queryClient, tenant.slug)
  );
  const reorderMutation = createMutation(() =>
    reorderCourtsMutationOptions(api, queryClient, tenant.slug)
  );

  let editorOpen = $state(false);
  let selectedCourtId = $state("");
  let selectedActivities = $state<string[]>([]);
  let drafts = $state<Record<string, CourtDraft>>({});
  let createDraft = $state<CourtDraft>(createCourtDraft(""));
  let createAttempted = $state(false);
  let editAttempted = $state(false);
  let savedCourtId = $state<string | null>(null);
  let reorderSaved = $state(false);

  const courts = $derived(sortCourts(courtsQuery.data ?? []));
  const activities = $derived(sortActivities(activitiesQuery.data ?? []));
  const activeActivities = $derived(activities.filter((activity) => activity.aktiv));
  const selectedCourt = $derived(courts.find((court) => court.id === selectedCourtId) ?? null);
  const selectedDraft = $derived(
    selectedCourt ? (drafts[selectedCourt.id] ?? courtToDraft(selectedCourt)) : null
  );
  const selectedCourtActivities = $derived(
    selectedCourt && !activeActivities.some((activity) => activity.id === selectedCourt.grenId)
      ? [
          ...activeActivities,
          ...activities.filter((activity) => activity.id === selectedCourt.grenId),
        ]
      : activeActivities
  );
  const filteredCourts = $derived(
    selectedActivities.length === 0
      ? courts
      : courts.filter((court) => selectedActivities.includes(court.grenId))
  );
  const filterOptions = $derived(
    activities
      .filter((activity) => courts.some((court) => court.grenId === activity.id))
      .map((activity) => ({ label: activity.navn, value: activity.id }))
  );
  const editErrors = $derived(
    selectedDraft && editAttempted
      ? validateCourtDraft(selectedDraft)
      : { name: null, description: null, activityId: null }
  );
  const createErrors = $derived(
    createAttempted
      ? validateCourtDraft(createDraft)
      : { name: null, description: null, activityId: null }
  );
  const selectedDirty = $derived(
    Boolean(selectedCourt && selectedDraft && courtDraftIsDirty(selectedCourt, selectedDraft))
  );
  const createDirty = $derived(Boolean(createDraft.name.trim() || createDraft.description.trim()));
  const busy = $derived(
    courtsQuery.isFetching ||
      activitiesQuery.isFetching ||
      createCourtMutation.isPending ||
      saveMutation.isPending ||
      reorderMutation.isPending
  );

  $effect(() => {
    if (!createDraft.activityId && activeActivities[0]) {
      createDraft = { ...createDraft, activityId: activeActivities[0].id };
    }
  });

  function openCourt(court: BaneRespons) {
    selectedCourtId = court.id;
    editorOpen = true;
    editAttempted = false;
    savedCourtId = null;
    saveMutation.reset();
  }

  function updateSelectedDraft(draft: CourtDraft) {
    if (!selectedCourt) return;
    drafts = { ...drafts, [selectedCourt.id]: draft };
    savedCourtId = null;
    saveMutation.reset();
  }

  async function saveSelectedCourt() {
    if (!selectedCourt || !selectedDraft || !selectedDirty) return;
    editAttempted = true;
    const errors = validateCourtDraft(selectedDraft);
    if (hasErrors(errors)) return;
    const original = courtToDraft(selectedCourt);
    const bookingSettingsChanged =
      JSON.stringify(selectedDraft.overrides) !== JSON.stringify(original.overrides);
    const courtChanged =
      selectedDraft.name !== original.name ||
      selectedDraft.description !== original.description ||
      selectedDraft.active !== original.active ||
      selectedDraft.activityId !== original.activityId;

    try {
      await saveMutation.mutateAsync({
        bookingSettingsChanged,
        bookingSettingsRequest: toCourtBookingSettingsRequest(selectedDraft.overrides),
        courtChanged,
        courtId: selectedCourt.id,
        courtRequest: toCourtUpdateRequest(selectedCourt, selectedDraft),
      });
      const next = { ...drafts };
      delete next[selectedCourt.id];
      drafts = next;
      editAttempted = false;
      savedCourtId = selectedCourt.id;
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }

  async function submitCreateCourt() {
    createAttempted = true;
    const errors = validateCourtDraft(createDraft);
    if (hasErrors(errors) || !createDirty) return;
    try {
      await createCourtMutation.mutateAsync({
        grenId: createDraft.activityId,
        navn: createDraft.name.trim(),
        beskrivelse: createDraft.description,
        sortering: nextCourtSortOrder(courts, createDraft.activityId),
      });
      createDraft = createCourtDraft(activeActivities[0]?.id ?? "");
      createAttempted = false;
      createOpen = false;
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }

  async function moveCourt(court: BaneRespons, direction: -1 | 1) {
    const updates = createCourtReorderUpdates(courts, court.id, direction);
    if (updates.length === 0) return;
    reorderSaved = false;
    reorderMutation.reset();
    try {
      await reorderMutation.mutateAsync(updates);
      reorderSaved = true;
    } catch {
      // onSettled henter autoritativ rekkefølge; feilen beholdes over listen.
    }
  }

  function courtPosition(court: BaneRespons) {
    const activityCourts = courts.filter((candidate) => candidate.grenId === court.grenId);
    return {
      index: activityCourts.findIndex((candidate) => candidate.id === court.id),
      count: activityCourts.length,
    };
  }
</script>

{#snippet filters()}
  <CollectionControls
    label="Filtrer baner"
    groups={filterOptions.length > 1
      ? [
          {
            label: "Gren",
            options: filterOptions,
            selectedValues: selectedActivities,
            onSelect: (activityId) =>
              (selectedActivities = selectedActivities.includes(activityId)
                ? selectedActivities.filter((selected) => selected !== activityId)
                : [...selectedActivities, activityId]),
          },
        ]
      : []}
    onReset={() => (selectedActivities = [])}
    disabled={busy}
  />
{/snippet}

{#snippet resetFilter()}
  <Button variant="secondary" onclick={() => (selectedActivities = [])}>Nullstill filter</Button>
{/snippet}

<Collection
  title={courtsQuery.isPending
    ? "Laster baner …"
    : `${filteredCourts.length} ${filteredCourts.length === 1 ? "bane" : "baner"}`}
  scope={selectedActivities.length > 0
    ? `${selectedActivities.length} ${selectedActivities.length === 1 ? "gren" : "grener"} valgt`
    : "Velg en bane for å redigere"}
  filters={filterOptions.length > 1 ? filters : undefined}
  filtersLabel="Banefiltre"
  {busy}
>
  {#if courtsQuery.isPending || activitiesQuery.isPending}
    <CollectionLoading label="Laster baner" rows={4} />
  {:else if courtsQuery.isError || activitiesQuery.isError}
    <CollectionError
      title="Kunne ikke laste banene"
      description={(courtsQuery.error ?? activitiesQuery.error) instanceof Error
        ? (courtsQuery.error ?? (activitiesQuery.error as Error)).message
        : "Prøv igjen om litt."}
      isRetrying={courtsQuery.isFetching || activitiesQuery.isFetching}
      onRetry={() => void Promise.all([courtsQuery.refetch(), activitiesQuery.refetch()])}
    />
  {:else if filteredCourts.length === 0}
    <CollectionEmpty
      title={courts.length === 0 ? "Ingen baner ennå" : "Ingen baner for valgt gren"}
      description={courts.length === 0
        ? activeActivities.length === 0
          ? "Opprett og aktiver en gren før du legger til den første banen."
          : "Bruk knappen Ny bane for å opprette den første."
        : "Velg en annen gren eller nullstill filteret."}
      action={courts.length > 0 ? resetFilter : undefined}
    />
  {:else}
    {#if reorderMutation.isError}
      <Feedback
        tone="danger"
        title="Kunne ikke lagre rekkefølgen"
        description={reorderMutation.error instanceof Error
          ? reorderMutation.error.message
          : "Listen er hentet på nytt."}
      />
    {:else if reorderSaved}
      <Feedback
        tone="success"
        title="Rekkefølgen er lagret"
        description="Bookingoversikten bruker den nye rekkefølgen."
      />
    {/if}
    <CollectionList label="Baner" {busy}>
      {#each filteredCourts as court (court.id)}
        {@const draft = drafts[court.id]}
        {@const unsaved = Boolean(draft && courtDraftIsDirty(court, draft))}
        {@const position = courtPosition(court)}
        <CollectionRow
          title={draft?.name.trim() || court.navn}
          description={(draft?.description ?? court.beskrivelse).trim() || undefined}
          meta={court.grenNavn}
          status={{
            label: unsaved ? "Ulagret" : (draft?.active ?? court.aktiv) ? "Aktiv" : "Inaktiv",
            tone: unsaved ? "warning" : (draft?.active ?? court.aktiv) ? "available" : "past",
          }}
          disabled={busy}
          interaction={{
            type: "reorder",
            onOpen: () => openCourt(court),
            onMoveUp: () => void moveCourt(court, -1),
            onMoveDown: () => void moveCourt(court, 1),
            moveUpDisabled: position.index === 0,
            moveDownDisabled: position.index === position.count - 1,
          }}
        />
      {/each}
    </CollectionList>
  {/if}
</Collection>

<EditorDialog
  bind:open={createOpen}
  backLabel="Alle baner"
  eyebrow="Ny bane"
  title="Opprett bane"
  description="Legg til en ny bane i klubbens bookingtilbud."
  pending={createCourtMutation.isPending}
  onClose={() => createCourtMutation.reset()}
>
  <CourtForm
    mode="create"
    activities={activeActivities}
    draft={createDraft}
    errors={createErrors}
    valid={createDirty}
    pending={createCourtMutation.isPending}
    error={createCourtMutation.isError && createCourtMutation.error instanceof Error
      ? createCourtMutation.error.message
      : null}
    onChange={(draft) => {
      createDraft = draft;
      createCourtMutation.reset();
    }}
    onSubmit={() => void submitCreateCourt()}
  />
</EditorDialog>

{#if selectedCourt && selectedDraft}
  <EditorDialog
    bind:open={editorOpen}
    backLabel="Alle baner"
    eyebrow="Rediger bane"
    title={selectedDraft.name.trim() || selectedCourt.navn}
    description={`${activities.find((activity) => activity.id === selectedDraft.activityId)?.navn ?? selectedCourt.grenNavn} · ${selectedDraft.active ? "Aktiv" : "Inaktiv"}`}
    pending={saveMutation.isPending}
  >
    <CourtForm
      mode="edit"
      court={selectedCourt}
      activities={selectedCourtActivities}
      draft={selectedDraft}
      errors={editErrors}
      valid={selectedDirty}
      pending={saveMutation.isPending}
      saved={savedCourtId === selectedCourt.id && !selectedDirty}
      error={saveMutation.isError && saveMutation.error instanceof Error
        ? saveMutation.error.message
        : null}
      onChange={updateSelectedDraft}
      onSubmit={() => void saveSelectedCourt()}
    />
  </EditorDialog>
{/if}
