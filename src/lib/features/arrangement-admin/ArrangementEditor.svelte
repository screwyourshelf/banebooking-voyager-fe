<script lang="ts">
  import {
    createMutation as createSvelteMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { ArrangementRespons, BaneRespons, GrenRespons } from "$lib/contracts";
  import { formaterAntallBanetider } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
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
  import {
    addUniqueBookings,
    arrangementToMetadataDraft,
    createArrangementRequest,
    createMetadataDraft,
    mapExistingBookings,
    mergePreview,
    metadataRequest,
    previewRequest,
    reconcileBatchResult,
    toBookingRequest,
    validateMetadata,
    type ArrangementEditorMode,
    type ArrangementEditorStep,
    type LocalBooking,
    type ScheduleMode,
  } from "./model";
  import {
    addArrangementBookingMutationOptions,
    addArrangementBookingsBatchMutationOptions,
    arrangementBookingsQueryOptions,
    createArrangementMutationOptions,
    deleteArrangementBookingMutationOptions,
    deleteArrangementMutationOptions,
    previewArrangementMutationOptions,
    updateArrangementMetadataMutationOptions,
  } from "./queries";

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

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const arrangementId = $derived(arrangement?.id ?? "");
  const bookingsQuery = createQuery(() =>
    arrangementBookingsQueryOptions(api, tenant.slug, mode === "edit" ? arrangementId : "")
  );
  const previewMutation = createSvelteMutation(() =>
    previewArrangementMutationOptions(api, tenant.slug, mode === "edit" ? arrangementId : undefined)
  );
  const createArrangementMutation = createSvelteMutation(() =>
    createArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const metadataMutation = createSvelteMutation(() =>
    updateArrangementMetadataMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const deleteMutation = createSvelteMutation(() =>
    deleteArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const addBookingMutation = createSvelteMutation(() =>
    addArrangementBookingMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const addBatchMutation = createSvelteMutation(() =>
    addArrangementBookingsBatchMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const deleteBookingMutation = createSvelteMutation(() =>
    deleteArrangementBookingMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );

  let synchronizedArrangementId = $state<string | undefined>();
  let initialized = $state(false);
  let synchronizedBookings = $state("");
  let step = $state<ArrangementEditorStep>("information");
  let scheduleMode = $state<ScheduleMode>("recurring");
  let draft = $state(createMetadataDraft());
  let metadataSubmitted = $state(false);
  let bookings = $state<LocalBooking[]>([]);
  let selectedBooking = $state<LocalBooking | null>(null);
  let bookingDialogOpen = $state(false);
  let deleteDialogOpen = $state(false);
  let feedback = $state<{
    description?: string;
    title: string;
    tone: "danger" | "success" | "warning";
  } | null>(null);

  const errors = $derived(validateMetadata(draft));
  const visibleErrors = $derived(
    metadataSubmitted ? errors : { activityId: null, websiteTitle: null }
  );
  const filteredCourts = $derived(courts.filter((court) => court.grenId === draft.activityId));
  const stagedBookings = $derived(bookings.filter((booking) => booking.source !== "existing"));
  const creatableBookings = $derived(
    stagedBookings.filter((booking) => booking.status !== "conflict")
  );
  const busy = $derived(
    bookingsQuery.isFetching ||
      previewMutation.isPending ||
      createArrangementMutation.isPending ||
      metadataMutation.isPending ||
      deleteMutation.isPending ||
      addBookingMutation.isPending ||
      addBatchMutation.isPending ||
      deleteBookingMutation.isPending
  );

  $effect(() => onBusyChange?.(busy));

  $effect(() => {
    if (initialized && arrangement?.id === synchronizedArrangementId) return;
    initialized = true;
    synchronizedArrangementId = arrangement?.id;
    step = "information";
    metadataSubmitted = false;
    feedback = null;
    bookings = [];
    synchronizedBookings = "";
    if (arrangement) {
      const activityId =
        activities.find((activity) => activity.slug === arrangement.grenSlug)?.id ?? "";
      draft = arrangementToMetadataDraft(arrangement, activityId);
    } else {
      draft = createMetadataDraft(activities[0]?.id ?? "");
    }
  });

  $effect(() => {
    if (mode !== "edit" || !bookingsQuery.data) return;
    const signature = JSON.stringify(bookingsQuery.data);
    if (signature === synchronizedBookings) return;
    synchronizedBookings = signature;
    bookings = addUniqueBookings(
      mapExistingBookings(bookingsQuery.data),
      bookings.filter((booking) => booking.source !== "existing")
    );
  });

  function resetFeedback() {
    feedback = null;
    metadataMutation.reset();
  }

  function showTimes() {
    metadataSubmitted = true;
    if (Object.values(errors).some(Boolean)) return;
    step = "times";
    feedback = null;
  }

  async function preview(nextBookings: LocalBooking[]) {
    const candidates = nextBookings.filter((booking) =>
      mode === "edit" ? booking.source !== "existing" : true
    );
    const request = previewRequest(candidates, draft.activityId, draft.category);
    if (!request) return;
    try {
      const result = await previewMutation.mutateAsync(request);
      bookings = nextBookings.map((booking) => {
        if (mode === "edit" && booking.source === "existing") return booking;
        return mergePreview([booking], result)[0];
      });
    } catch {
      feedback = {
        tone: "danger",
        title: "Konfliktsjekken feilet",
        description:
          previewMutation.error instanceof Error
            ? previewMutation.error.message
            : "Forslagene er beholdt. Prøv igjen før du lagrer.",
      };
    }
  }

  async function createNewArrangement() {
    metadataSubmitted = true;
    if (Object.values(errors).some(Boolean)) {
      step = "information";
      return;
    }
    const request = createArrangementRequest(draft, bookings);
    if (!request) {
      feedback = {
        tone: "warning",
        title: "Arrangementet mangler banetider",
        description: "Legg til minst én ledig banetid før du oppretter arrangementet.",
      };
      return;
    }
    try {
      const result = await createArrangementMutation.mutateAsync(request);
      if (result.antallOpprettet === 0) {
        bookings = mergePreview(bookings, {
          ledige: [],
          konflikter: result.konflikter.map((conflict) => ({ ...conflict, baneNavn: "" })),
        });
        feedback = {
          tone: "warning",
          title: "Ingen banetider ble opprettet",
          description: "Alle valgte tidspunkter var opptatt. Juster forslagene og prøv igjen.",
        };
        return;
      }
      const conflictCount =
        bookings.filter((booking) => booking.status === "conflict").length +
        result.konflikter.length;
      onCreated?.(
        conflictCount > 0
          ? `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet. ${conflictCount} tidspunkt ble ikke tatt med.`
          : `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet.`,
        conflictCount > 0 ? "warning" : "success"
      );
    } catch {
      // Mutationfeilen vises i den vedvarende feedbackflaten under.
    }
  }

  async function saveMetadata() {
    metadataSubmitted = true;
    if (!arrangement || Object.values(errors).some(Boolean)) return;
    try {
      await metadataMutation.mutateAsync(metadataRequest(draft));
      feedback = {
        tone: "success",
        title: "Informasjonen er lagret",
        description: "Arrangementoversikten er oppdatert.",
      };
    } catch {
      // Mutationfeilen vises under.
    }
  }

  async function saveStagedBookings() {
    if (!arrangement || creatableBookings.length === 0) return;
    const snapshot = [...creatableBookings];
    try {
      const result = await addBatchMutation.mutateAsync({
        bookinger: snapshot.map(toBookingRequest),
      });
      const reconciled = reconcileBatchResult(snapshot, result);
      bookings = [
        ...bookings.filter((booking) => booking.source === "existing"),
        ...reconciled.failed,
      ];
      feedback = reconciled.failed.length
        ? {
            tone: "warning",
            title: `${reconciled.failed.length} av ${snapshot.length} banetider kunne ikke opprettes`,
            description: [...new Set(reconciled.failed.map((booking) => booking.message))]
              .filter(Boolean)
              .join(", "),
          }
        : {
            tone: "success",
            title: `${formaterAntallBanetider(snapshot.length)} ble opprettet`,
            description: "De nye tidene vises nå i listen.",
          };
    } catch {
      // Mutationfeilen vises under.
    }
  }

  function editBooking(booking: LocalBooking) {
    selectedBooking = booking;
    bookingDialogOpen = true;
    feedback = null;
  }

  async function deleteBooking(booking: LocalBooking) {
    if (booking.source === "existing" && booking.externalId) {
      await deleteBookingMutation.mutateAsync(booking.externalId);
      bookings = bookings.filter((candidate) => candidate.id !== booking.id);
    } else {
      bookings = bookings.filter((candidate) => candidate.id !== booking.id);
    }
  }

  async function saveBooking(original: LocalBooking, updated: LocalBooking) {
    if (original.source === "existing" && original.externalId) {
      await deleteBookingMutation.mutateAsync(original.externalId);
      await addBookingMutation.mutateAsync(toBookingRequest(updated));
      bookings = bookings.filter((booking) => booking.id !== original.id);
      return;
    }
    const next = bookings.map((booking) => (booking.id === original.id ? updated : booking));
    bookings = next;
    await preview(next);
  }

  async function deleteWholeArrangement() {
    if (!arrangement) return;
    try {
      await deleteMutation.mutateAsync(arrangement.id);
      deleteDialogOpen = false;
      onDeleted?.();
    } catch {
      // Dialogen forblir åpen og viser mutasjonsfeilen.
    }
  }
</script>

<FormSteps
  label={mode === "create" ? "Opprett arrangement" : "Rediger arrangement"}
  bind:value={step}
  items={[
    { value: "information", label: "Informasjon" },
    { value: "times", label: "Tider" },
  ]}
>
  {#if step === "information"}
    <Form
      variant="editor"
      pending={busy}
      onsubmit={(event) => {
        event.preventDefault();
        void (mode === "create" ? showTimes() : saveMetadata());
      }}
    >
      <SettingsStack embedded>
        <ArrangementMetadataFields
          {activities}
          bind:draft
          errors={visibleErrors}
          disabled={busy}
          onChange={resetFeedback}
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
                  disabled={busy}
                  onclick={() => (deleteDialogOpen = true)}
                >
                  Avlys arrangement
                </Button>
              </SettingsRow>
            </SettingsPanel>
          </SettingsSection>
        {/if}

        <FormActions>
          {#if metadataMutation.isError}
            <Feedback
              tone="danger"
              title="Informasjonen kunne ikke lagres"
              description={metadataMutation.error instanceof Error
                ? metadataMutation.error.message
                : "Prøv igjen."}
            />
          {:else if feedback && mode === "edit"}
            <Feedback {...feedback} />
          {/if}
          <FormSubmit
            pending={metadataMutation.isPending}
            disabled={busy && !metadataMutation.isPending}
          >
            {mode === "create" ? "Neste: Tider" : "Lagre informasjon"}
          </FormSubmit>
        </FormActions>
      </SettingsStack>
    </Form>
  {:else}
    <Form
      variant="editor"
      pending={busy}
      onsubmit={(event) => {
        event.preventDefault();
        void (mode === "create" ? createNewArrangement() : saveStagedBookings());
      }}
    >
      <SettingsStack embedded>
        <ScheduleBuilder
          courts={filteredCourts}
          bind:bookings
          bind:mode={scheduleMode}
          {busy}
          onGenerate={preview}
        />

        <SettingsSection
          embedded
          eyebrow="Kontroll"
          title="Banetider"
          description={mode === "edit"
            ? "Eksisterende tider og nye forslag vises i samme liste."
            : "Kontroller forslagene før arrangementet opprettes."}
        >
          {#if mode === "edit" && bookingsQuery.isPending}
            <Feedback tone="info" title="Laster arrangementets banetider" />
          {:else if mode === "edit" && bookingsQuery.isError}
            {#snippet retryBookings()}
              <Button
                variant="secondary"
                size="small"
                disabled={bookingsQuery.isFetching}
                onclick={() => void bookingsQuery.refetch()}
              >
                {bookingsQuery.isFetching ? "Prøver igjen …" : "Prøv igjen"}
              </Button>
            {/snippet}
            <Feedback
              tone="danger"
              title="Kunne ikke laste banetidene"
              description={bookingsQuery.error instanceof Error
                ? bookingsQuery.error.message
                : "Prøv igjen."}
              action={retryBookings}
            />
          {:else}
            <BookingCollection {bookings} {busy} onEdit={editBooking} />
          {/if}
        </SettingsSection>

        <FormActions>
          {#if previewMutation.isError || createArrangementMutation.isError || addBatchMutation.isError || addBookingMutation.isError || deleteBookingMutation.isError}
            {@const mutationError =
              previewMutation.error ??
              createArrangementMutation.error ??
              addBatchMutation.error ??
              addBookingMutation.error ??
              deleteBookingMutation.error}
            <Feedback
              tone="danger"
              title="Banetidene kunne ikke oppdateres"
              description={mutationError instanceof Error ? mutationError.message : "Prøv igjen."}
            />
          {:else if feedback}
            <Feedback {...feedback} />
          {/if}
          {#if mode === "create"}
            <FormSubmit
              pending={createArrangementMutation.isPending}
              pendingLabel="Oppretter arrangement …"
              disabled={creatableBookings.length === 0 || busy}
            >
              Opprett arrangement ({creatableBookings.length})
            </FormSubmit>
          {:else if creatableBookings.length > 0}
            <FormSubmit
              pending={addBatchMutation.isPending}
              pendingLabel={`Oppretter ${creatableBookings.length} …`}
              disabled={busy}
            >
              Opprett {creatableBookings.length} forslag
            </FormSubmit>
          {/if}
        </FormActions>
      </SettingsStack>
    </Form>
  {/if}
</FormSteps>

<BookingEditorDialog
  bind:open={bookingDialogOpen}
  booking={selectedBooking}
  courts={filteredCourts}
  {busy}
  onDelete={deleteBooking}
  onSave={saveBooking}
/>

{#snippet deleteActions({ close }: { close: () => void })}
  <Button variant="secondary" disabled={deleteMutation.isPending} onclick={close}
    >Behold arrangementet</Button
  >
  <Button
    variant="destructive"
    disabled={deleteMutation.isPending}
    onclick={() => void deleteWholeArrangement()}
  >
    {deleteMutation.isPending ? "Avlyser …" : "Avlys arrangement"}
  </Button>
{/snippet}

<Dialog
  bind:open={deleteDialogOpen}
  title="Avlys arrangement?"
  description={`Er du sikker på at du vil avlyse «${arrangement?.tittel ?? "arrangementet"}»? Alle tilknyttede banetider slettes.`}
  pending={deleteMutation.isPending}
  actions={deleteActions}
>
  {#if deleteMutation.isError}
    <Feedback
      tone="danger"
      title="Arrangementet kunne ikke avlyses"
      description={deleteMutation.error instanceof Error
        ? deleteMutation.error.message
        : "Prøv igjen."}
    />
  {/if}
</Dialog>
