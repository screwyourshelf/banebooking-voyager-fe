<script lang="ts">
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
  import { createCourtsSectionController } from "./courts-section-controller.svelte";

  let { createOpen = $bindable(false) }: { createOpen?: boolean } = $props();

  const controller = createCourtsSectionController({
    closeCreateEditor: () => (createOpen = false),
  });
</script>

{#snippet filters()}
  <CollectionControls
    label="Filtrer baner"
    groups={controller.filterOptions.length > 1
      ? [
          {
            label: "Gren",
            options: controller.filterOptions,
            selectedValues: controller.selectedActivities,
            onSelect: controller.toggleActivityFilter,
          },
        ]
      : []}
    onReset={controller.resetActivityFilter}
    disabled={controller.busy}
  />
{/snippet}

{#snippet resetFilter()}
  <Button variant="secondary" onclick={controller.resetActivityFilter}>Nullstill filter</Button>
{/snippet}

<Collection
  title={controller.courtsQuery.isPending
    ? "Laster baner …"
    : `${controller.filteredCourts.length} ${controller.filteredCourts.length === 1 ? "bane" : "baner"}`}
  scope={controller.selectedActivities.length > 0
    ? `${controller.selectedActivities.length} ${controller.selectedActivities.length === 1 ? "gren" : "grener"} valgt`
    : "Velg en bane for å redigere"}
  filters={controller.filterOptions.length > 1 ? filters : undefined}
  filtersLabel="Banefiltre"
  busy={controller.busy}
>
  {#if controller.courtsQuery.isPending || controller.activitiesQuery.isPending}
    <CollectionLoading label="Laster baner" rows={4} />
  {:else if controller.courtsQuery.isError || controller.activitiesQuery.isError}
    <CollectionError
      title="Kunne ikke laste banene"
      description={(controller.courtsQuery.error ?? controller.activitiesQuery.error) instanceof
      Error
        ? (controller.courtsQuery.error ?? (controller.activitiesQuery.error as Error)).message
        : "Prøv igjen om litt."}
      isRetrying={controller.courtsQuery.isFetching || controller.activitiesQuery.isFetching}
      onRetry={() =>
        void Promise.all([controller.courtsQuery.refetch(), controller.activitiesQuery.refetch()])}
    />
  {:else if controller.filteredCourts.length === 0}
    <CollectionEmpty
      title={controller.courts.length === 0 ? "Ingen baner ennå" : "Ingen baner for valgt gren"}
      description={controller.courts.length === 0
        ? controller.activeActivities.length === 0
          ? "Opprett og aktiver en gren før du legger til den første banen."
          : "Bruk knappen Ny bane for å opprette den første."
        : "Velg en annen gren eller nullstill filteret."}
      action={controller.courts.length > 0 ? resetFilter : undefined}
    />
  {:else}
    {#if controller.reorderMutation.isError}
      <Feedback
        tone="danger"
        title="Kunne ikke lagre rekkefølgen"
        description={controller.reorderMutation.error instanceof Error
          ? controller.reorderMutation.error.message
          : "Listen er hentet på nytt."}
      />
    {:else if controller.reorderSaved}
      <Feedback
        tone="success"
        title="Rekkefølgen er lagret"
        description="Bookingoversikten bruker den nye rekkefølgen."
      />
    {/if}
    <CollectionList label="Baner" busy={controller.busy}>
      {#each controller.filteredCourts as court (court.id)}
        {@const draft = controller.draftFor(court.id)}
        {@const unsaved = controller.isCourtDraftDirty(court)}
        {@const position = controller.courtPosition(court)}
        <CollectionRow
          title={draft?.name.trim() || court.navn}
          description={(draft?.description ?? court.beskrivelse).trim() || undefined}
          meta={court.grenNavn}
          status={{
            label: unsaved ? "Ulagret" : (draft?.active ?? court.aktiv) ? "Aktiv" : "Inaktiv",
            tone: unsaved ? "warning" : (draft?.active ?? court.aktiv) ? "available" : "past",
          }}
          disabled={controller.busy}
          interaction={{
            type: "reorder",
            onOpen: () => controller.openCourt(court),
            onMoveUp: () => void controller.moveCourt(court, -1),
            onMoveDown: () => void controller.moveCourt(court, 1),
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
  pending={controller.createCourtMutation.isPending}
  onClose={() => controller.createCourtMutation.reset()}
>
  <CourtForm
    mode="create"
    activities={controller.activeActivities}
    draft={controller.createDraft}
    errors={controller.createErrors}
    valid={controller.createDirty}
    pending={controller.createCourtMutation.isPending}
    error={controller.createCourtMutation.isError &&
    controller.createCourtMutation.error instanceof Error
      ? controller.createCourtMutation.error.message
      : null}
    onChange={(draft) => {
      controller.createDraft = draft;
      controller.createCourtMutation.reset();
    }}
    onSubmit={() => void controller.submitCreateCourt()}
  />
</EditorDialog>

{#if controller.selectedCourt && controller.selectedDraft}
  <EditorDialog
    bind:open={controller.editorOpen}
    backLabel="Alle baner"
    eyebrow="Rediger bane"
    title={controller.selectedDraft.name.trim() || controller.selectedCourt.navn}
    description={`${controller.activities.find((activity) => activity.id === controller.selectedDraft?.activityId)?.navn ?? controller.selectedCourt.grenNavn} · ${controller.selectedDraft.active ? "Aktiv" : "Inaktiv"}`}
    pending={controller.saveMutation.isPending}
  >
    <CourtForm
      mode="edit"
      court={controller.selectedCourt}
      activities={controller.selectedCourtActivities}
      draft={controller.selectedDraft}
      errors={controller.editErrors}
      valid={controller.selectedDirty}
      pending={controller.saveMutation.isPending}
      saved={controller.savedCourtId === controller.selectedCourt.id && !controller.selectedDirty}
      error={controller.saveMutation.isError && controller.saveMutation.error instanceof Error
        ? controller.saveMutation.error.message
        : null}
      onChange={controller.updateSelectedDraft}
      onSubmit={() => void controller.saveSelectedCourt()}
    />
  </EditorDialog>
{/if}
