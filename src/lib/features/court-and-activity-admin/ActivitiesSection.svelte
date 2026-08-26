<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { GrenRespons } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Collection,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    CollectionRow,
    EditorDialog,
  } from "$lib/ui";
  import ActivityForm from "./ActivityForm.svelte";
  import {
    activityDraftIsDirty,
    activityToDraft,
    createActivityDraft,
    hasErrors,
    hourLabel,
    nextActivitySortOrder,
    sortActivities,
    toActivityCreateRequest,
    toActivityUpdateRequest,
    validateActivityDraft,
    type ActivityDraft,
  } from "./model";
  import {
    adminActivitiesQueryOptions,
    createActivityMutationOptions,
    updateActivityMutationOptions,
  } from "./queries";

  let { createOpen = $bindable(false) }: { createOpen?: boolean } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const activitiesQuery = createQuery(() => adminActivitiesQueryOptions(api, tenant.slug));
  const createActivityMutation = createMutation(() =>
    createActivityMutationOptions(api, queryClient, tenant.slug)
  );
  const updateMutation = createMutation(() =>
    updateActivityMutationOptions(api, queryClient, tenant.slug)
  );

  let editorOpen = $state(false);
  let selectedActivityId = $state("");
  let drafts = $state<Record<string, ActivityDraft>>({});
  let createDraft = $state<ActivityDraft>(createActivityDraft(0));
  let createAttempted = $state(false);
  let editAttempted = $state(false);
  let savedActivityId = $state<string | null>(null);

  const activities = $derived(sortActivities(activitiesQuery.data ?? []));
  const selectedActivity = $derived(
    activities.find((activity) => activity.id === selectedActivityId) ?? null
  );
  const selectedDraft = $derived(
    selectedActivity ? (drafts[selectedActivity.id] ?? activityToDraft(selectedActivity)) : null
  );
  const editErrors = $derived(
    selectedDraft && editAttempted
      ? validateActivityDraft(selectedDraft)
      : { name: null, rules: null, hours: null }
  );
  const createErrors = $derived(
    createAttempted ? validateActivityDraft(createDraft) : { name: null, rules: null, hours: null }
  );
  const selectedDirty = $derived(
    Boolean(
      selectedActivity && selectedDraft && activityDraftIsDirty(selectedActivity, selectedDraft)
    )
  );
  const createDirty = $derived(Boolean(createDraft.name.trim()));
  const busy = $derived(
    activitiesQuery.isFetching || createActivityMutation.isPending || updateMutation.isPending
  );

  $effect(() => {
    if (!createOpen || createDraft.name || createDraft.sortOrder !== 0) return;
    createDraft = createActivityDraft(nextActivitySortOrder(activities));
  });

  function openActivity(activity: GrenRespons) {
    selectedActivityId = activity.id;
    editorOpen = true;
    editAttempted = false;
    savedActivityId = null;
    updateMutation.reset();
  }

  function updateSelectedDraft(draft: ActivityDraft) {
    if (!selectedActivity) return;
    drafts = { ...drafts, [selectedActivity.id]: draft };
    savedActivityId = null;
    updateMutation.reset();
  }

  async function saveSelectedActivity() {
    if (!selectedActivity || !selectedDraft || !selectedDirty) return;
    editAttempted = true;
    if (hasErrors(validateActivityDraft(selectedDraft))) return;
    try {
      await updateMutation.mutateAsync({
        activityId: selectedActivity.id,
        request: toActivityUpdateRequest(selectedDraft),
      });
      const next = { ...drafts };
      delete next[selectedActivity.id];
      drafts = next;
      editAttempted = false;
      savedActivityId = selectedActivity.id;
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }

  async function submitCreateActivity() {
    createAttempted = true;
    if (hasErrors(validateActivityDraft(createDraft)) || !createDirty) return;
    try {
      const request = toActivityCreateRequest(createDraft);
      await createActivityMutation.mutateAsync(request);
      createDraft = createActivityDraft(nextActivitySortOrder(activities));
      createAttempted = false;
      createOpen = false;
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }
</script>

<Collection
  title={activitiesQuery.isPending
    ? "Laster grener …"
    : `${activities.length} ${activities.length === 1 ? "gren" : "grener"}`}
  scope="Velg en gren for å redigere"
  {busy}
>
  {#if activitiesQuery.isPending}
    <CollectionLoading label="Laster grener" rows={3} />
  {:else if activitiesQuery.isError}
    <CollectionError
      title="Kunne ikke laste grenene"
      description={activitiesQuery.error instanceof Error
        ? activitiesQuery.error.message
        : "Prøv igjen om litt."}
      isRetrying={activitiesQuery.isFetching}
      onRetry={() => void activitiesQuery.refetch()}
    />
  {:else if activities.length === 0}
    <CollectionEmpty
      title="Ingen grener ennå"
      description="Bruk knappen Ny gren for å opprette den første."
    />
  {:else}
    <CollectionList label="Grener" {busy}>
      {#each activities as activity (activity.id)}
        {@const draft = drafts[activity.id]}
        {@const values = draft ?? activityToDraft(activity)}
        {@const unsaved = Boolean(draft && activityDraftIsDirty(activity, draft))}
        <CollectionRow
          title={values.name.trim() || activity.navn}
          description={`${values.slotMinutes} min · maks ${values.maxPerDay} per dag`}
          meta={`${hourLabel(values.openingHour)}–${hourLabel(values.closingHour)}`}
          status={{
            label: unsaved ? "Ulagret" : values.active ? "Aktiv" : "Inaktiv",
            tone: unsaved ? "warning" : values.active ? "available" : "past",
          }}
          disabled={busy}
          interaction={{ type: "open", onOpen: () => openActivity(activity) }}
        />
      {/each}
    </CollectionList>
  {/if}
</Collection>

<EditorDialog
  bind:open={createOpen}
  backLabel="Alle grener"
  eyebrow="Ny gren"
  title="Opprett gren"
  description="Angi navn og standardregler for banene i grenen."
  pending={createActivityMutation.isPending}
  onClose={() => createActivityMutation.reset()}
>
  <ActivityForm
    mode="create"
    draft={createDraft}
    errors={createErrors}
    valid={createDirty}
    pending={createActivityMutation.isPending}
    error={createActivityMutation.isError && createActivityMutation.error instanceof Error
      ? createActivityMutation.error.message
      : null}
    onChange={(draft) => {
      createDraft = draft;
      createActivityMutation.reset();
    }}
    onSubmit={() => void submitCreateActivity()}
  />
</EditorDialog>

{#if selectedActivity && selectedDraft}
  <EditorDialog
    bind:open={editorOpen}
    backLabel="Alle grener"
    eyebrow="Rediger gren"
    title={selectedDraft.name.trim() || selectedActivity.navn}
    description={`${selectedDraft.active ? "Aktiv" : "Inaktiv"} · ${hourLabel(selectedDraft.openingHour)}–${hourLabel(selectedDraft.closingHour)}`}
    pending={updateMutation.isPending}
  >
    <ActivityForm
      mode="edit"
      draft={selectedDraft}
      errors={editErrors}
      valid={selectedDirty}
      pending={updateMutation.isPending}
      saved={savedActivityId === selectedActivity.id && !selectedDirty}
      error={updateMutation.isError && updateMutation.error instanceof Error
        ? updateMutation.error.message
        : null}
      onChange={updateSelectedDraft}
      onSubmit={() => void saveSelectedActivity()}
    />
  </EditorDialog>
{/if}
