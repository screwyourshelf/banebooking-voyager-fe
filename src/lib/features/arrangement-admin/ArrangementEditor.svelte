<script lang="ts">
  import type { ArrangementRespons, BaneRespons, GrenRespons } from "$lib/contracts";
  import {
    Button,
    Dialog,
    Feedback,
    Form,
    FormActions,
    FormSteps,
    FormSubmit,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
  } from "$lib/ui";
  import ArrangementMetadataFields from "./ArrangementMetadataFields.svelte";
  import BookingCollection from "./BookingCollection.svelte";
  import BookingEditorDialog from "./BookingEditorDialog.svelte";
  import ScheduleBuilder from "./ScheduleBuilder.svelte";
  import { createArrangementEditorController } from "./arrangement-editor-controller.svelte";
  import type { ArrangementEditorMode } from "./model";

  let {
    activities,
    arrangement,
    courts,
    mode,
    onBusyChange,
    onCreated,
    onDeleted,
  }: {
    activities: readonly GrenRespons[];
    arrangement?: ArrangementRespons;
    courts: readonly BaneRespons[];
    mode: ArrangementEditorMode;
    onBusyChange?: (busy: boolean) => void;
    onCreated?: (message: string, tone: "success" | "warning") => void;
    onDeleted?: () => void;
  } = $props();

  const controller = createArrangementEditorController({
    get activities() {
      return activities;
    },
    get arrangement() {
      return arrangement;
    },
    get courts() {
      return courts;
    },
    get mode() {
      return mode;
    },
    get onBusyChange() {
      return onBusyChange;
    },
    get onCreated() {
      return onCreated;
    },
    get onDeleted() {
      return onDeleted;
    },
  });
</script>

<FormSteps
  label={mode === "create" ? "Opprett arrangement" : "Rediger arrangement"}
  bind:value={controller.step}
  items={[
    { value: "information", label: "Informasjon" },
    { value: "times", label: "Tider" },
  ]}
>
  {#if controller.step === "information"}
    <Form
      variant="editor"
      pending={controller.busy}
      onsubmit={(event) => {
        event.preventDefault();
        void (mode === "create" ? controller.showTimes() : controller.saveMetadata());
      }}
    >
      <SettingsStack embedded>
        <ArrangementMetadataFields
          {activities}
          bind:draft={controller.draft}
          errors={controller.visibleErrors}
          disabled={controller.busy}
          onChange={controller.resetFeedback}
        />

        {#if mode === "edit" && arrangement}
          <SettingsSection
            embedded
            eyebrow="Fareområde"
            title="Avlys arrangement"
            description="Alle tilknyttede banetider slettes. Handlingen må bekreftes."
            tone="danger"
          >
            <SettingsPanel>
              <SettingsRow
                title="Fjern arrangementet"
                description="Bruk avlysning bare når arrangementet og alle tidene skal fjernes."
              >
                <Button
                  variant="destructive"
                  disabled={controller.busy}
                  onclick={() => (controller.deleteDialogOpen = true)}
                >
                  Avlys arrangement
                </Button>
              </SettingsRow>
            </SettingsPanel>
          </SettingsSection>
        {/if}

        <FormActions>
          {#if controller.metadataMutation.isError}
            <Feedback
              tone="danger"
              title="Informasjonen kunne ikke lagres"
              description={controller.metadataMutation.error instanceof Error
                ? controller.metadataMutation.error.message
                : "Prøv igjen."}
            />
          {:else if controller.feedback && mode === "edit"}
            <Feedback
              tone={controller.feedback.tone}
              title={controller.feedback.title}
              description={controller.feedback.description}
            />
          {/if}
          <FormSubmit
            pending={controller.metadataMutation.isPending}
            disabled={controller.busy && !controller.metadataMutation.isPending}
          >
            {mode === "create" ? "Neste: Tider" : "Lagre informasjon"}
          </FormSubmit>
        </FormActions>
      </SettingsStack>
    </Form>
  {:else}
    <Form
      variant="editor"
      pending={controller.busy}
      onsubmit={(event) => {
        event.preventDefault();
        void (mode === "create"
          ? controller.createNewArrangement()
          : controller.saveStagedBookings());
      }}
    >
      <SettingsStack embedded>
        <ScheduleBuilder
          courts={controller.filteredCourts}
          bind:bookings={controller.bookings}
          bind:mode={controller.scheduleMode}
          busy={controller.busy}
          onGenerate={controller.preview}
        />

        <SettingsSection
          embedded
          eyebrow="Kontroll"
          title="Banetider"
          description={mode === "edit"
            ? "Eksisterende tider og nye forslag vises i samme liste."
            : "Kontroller forslagene før arrangementet opprettes."}
        >
          {#if mode === "edit" && controller.bookingsQuery.isPending}
            <Feedback tone="info" title="Laster arrangementets banetider" />
          {:else if mode === "edit" && controller.bookingsQuery.isError}
            {#snippet retryBookings()}
              <Button
                variant="secondary"
                size="small"
                disabled={controller.bookingsQuery.isFetching}
                onclick={() => void controller.bookingsQuery.refetch()}
              >
                {controller.bookingsQuery.isFetching ? "Prøver igjen …" : "Prøv igjen"}
              </Button>
            {/snippet}
            <Feedback
              tone="danger"
              title="Kunne ikke laste banetidene"
              description={controller.bookingsQuery.error instanceof Error
                ? controller.bookingsQuery.error.message
                : "Prøv igjen."}
              action={retryBookings}
            />
          {:else}
            <BookingCollection
              bookings={controller.bookings}
              busy={controller.busy}
              onEdit={controller.editBooking}
            />
          {/if}
        </SettingsSection>

        <FormActions>
          {#if controller.previewMutation.isError || controller.createArrangementMutation.isError || controller.addBatchMutation.isError || controller.addBookingMutation.isError || controller.deleteBookingMutation.isError}
            {@const mutationError =
              controller.previewMutation.error ??
              controller.createArrangementMutation.error ??
              controller.addBatchMutation.error ??
              controller.addBookingMutation.error ??
              controller.deleteBookingMutation.error}
            <Feedback
              tone="danger"
              title="Banetidene kunne ikke oppdateres"
              description={mutationError instanceof Error ? mutationError.message : "Prøv igjen."}
            />
          {:else if controller.feedback}
            <Feedback
              tone={controller.feedback.tone}
              title={controller.feedback.title}
              description={controller.feedback.description}
            />
          {/if}
          {#if mode === "create"}
            <FormSubmit
              pending={controller.createArrangementMutation.isPending}
              pendingLabel="Oppretter arrangement …"
              disabled={controller.creatableBookings.length === 0 || controller.busy}
            >
              Opprett arrangement ({controller.creatableBookings.length})
            </FormSubmit>
          {:else if controller.creatableBookings.length > 0}
            <FormSubmit
              pending={controller.addBatchMutation.isPending}
              pendingLabel={`Oppretter ${controller.creatableBookings.length} …`}
              disabled={controller.busy}
            >
              Opprett {controller.creatableBookings.length} forslag
            </FormSubmit>
          {/if}
        </FormActions>
      </SettingsStack>
    </Form>
  {/if}
</FormSteps>

<BookingEditorDialog
  bind:open={controller.bookingDialogOpen}
  booking={controller.selectedBooking}
  courts={controller.filteredCourts}
  busy={controller.busy}
  onDelete={controller.deleteBooking}
  onSave={controller.saveBooking}
/>

{#snippet deleteActions({ close }: { close: () => void })}
  <Button variant="secondary" disabled={controller.deleteMutation.isPending} onclick={close}
    >Behold arrangementet</Button
  >
  <Button
    variant="destructive"
    disabled={controller.deleteMutation.isPending}
    onclick={() => void controller.deleteWholeArrangement()}
  >
    {controller.deleteMutation.isPending ? "Avlyser …" : "Avlys arrangement"}
  </Button>
{/snippet}

<Dialog
  bind:open={controller.deleteDialogOpen}
  title="Avlys arrangement?"
  description={`Er du sikker på at du vil avlyse «${arrangement?.tittel ?? "arrangementet"}»? Alle tilknyttede banetider slettes.`}
  pending={controller.deleteMutation.isPending}
  actions={deleteActions}
>
  {#if controller.deleteMutation.isError}
    <Feedback
      tone="danger"
      title="Arrangementet kunne ikke avlyses"
      description={controller.deleteMutation.error instanceof Error
        ? controller.deleteMutation.error.message
        : "Prøv igjen."}
    />
  {/if}
</Dialog>
