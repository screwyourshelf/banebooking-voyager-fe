<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { KalenderSlotRespons, OpprettBookingForespørsel } from "#lib/contracts/index.ts";
  import { tilDatoTekst } from "#lib/domain/index.ts";
  import { getApiClient } from "#lib/platform/api/index.ts";
  import { getAuthContext } from "#lib/platform/auth/index.ts";
  import { getTenantContext } from "#lib/platform/tenant/index.ts";
  import { Collection, CollectionLoading, ErrorState, Page } from "#lib/ui/index.ts";
  import BookingCancelDialog from "./BookingCancelDialog.svelte";
  import BookingSchedule from "./BookingSchedule.svelte";
  import ArrangementBookingDialog from "./ArrangementBookingDialog.svelte";
  import QuickArrangementDialog from "./QuickArrangementDialog.svelte";
  import { canSelectArrangementSlot } from "./arrangement-slots";
  import { addDaysToIsoDate, resolveBookingSelection } from "./model";
  import {
    bookingBootstrapQueryOptions,
    bookingCalendarQueryOptions,
    cancelBookingMutationOptions,
    createBookingMutationOptions,
  } from "./queries";

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const today = tilDatoTekst(new Date());
  const tomorrow = addDaysToIsoDate(today, 1);
  let preferredActivityId = $state<string | null>(null);
  let preferredCourtId = $state<string | null>(null);
  let selectedDate = $state(today);
  let cancellationSlot = $state<KalenderSlotRespons | null>(null);
  let cancellationOpen = $state(false);
  let arrangementSelection = $state<{
    mode: "create" | "connect";
    slot: KalenderSlotRespons;
  } | null>(null);

  const userIdentity = $derived(
    auth.state.status === "authenticated" ? auth.state.user.id : "anonymous"
  );
  const bootstrap = createQuery(() =>
    bookingBootstrapQueryOptions(api, tenant.slug, today, userIdentity)
  );
  const activities = $derived(bootstrap.data?.activities ?? []);
  const allCourts = $derived(bootstrap.data?.courts ?? []);
  const selection = $derived(
    resolveBookingSelection(
      activities,
      allCourts,
      preferredActivityId ?? bootstrap.data?.initialActivityId ?? null,
      preferredCourtId ?? bootstrap.data?.initialCourtId ?? null
    )
  );
  const selectedCourt = $derived(allCourts.find((court) => court.id === selection.courtId));
  const selectedMaxDate = $derived(
    selectedCourt
      ? addDaysToIsoDate(today, selectedCourt.bookingInnstillinger.dagerFremITid)
      : today
  );
  const initialCalendar = $derived(
    bootstrap.data &&
      selection.courtId === bootstrap.data.initialCourtId &&
      selectedDate === bootstrap.data.date
      ? bootstrap.data.calendar
      : undefined
  );
  const calendar = createQuery(() =>
    bookingCalendarQueryOptions(api, tenant.slug, selection.courtId, selectedDate, initialCalendar)
  );
  const bookMutation = createMutation(() =>
    createBookingMutationOptions(api, queryClient, tenant.slug, selection.courtId, selectedDate)
  );
  const cancelMutation = createMutation(() =>
    cancelBookingMutationOptions(api, queryClient, tenant.slug, selection.courtId, selectedDate)
  );
  const mutationBusy = $derived(bookMutation.isPending || cancelMutation.isPending);
  const mutationError = $derived(
    bookMutation.isError
      ? {
          title: "Tiden kunne ikke bookes",
          description:
            bookMutation.error instanceof Error
              ? bookMutation.error.message
              : "Bookingen kunne ikke gjennomføres.",
        }
      : cancelMutation.isError
        ? {
            title: "Tiden kunne ikke avbestilles",
            description:
              cancelMutation.error instanceof Error
                ? cancelMutation.error.message
                : "Avbestillingen kunne ikke gjennomføres.",
          }
        : null
  );

  $effect(() => {
    if (selectedDate > selectedMaxDate) selectedDate = selectedMaxDate;
  });

  function selectActivity(activityId: string) {
    arrangementSelection = null;
    preferredActivityId = activityId;
    preferredCourtId = null;
  }

  function selectCourt(courtId: string) {
    arrangementSelection = null;
    preferredCourtId = courtId;
  }

  function selectDate(date: string) {
    arrangementSelection = null;
    selectedDate = date;
  }

  function isCurrentSlot(slot: KalenderSlotRespons) {
    return (
      !calendar.isPlaceholderData && slot.baneId === selection.courtId && slot.dato === selectedDate
    );
  }

  function bookSlot(slot: KalenderSlotRespons) {
    if (!isCurrentSlot(slot) || mutationBusy) return;
    cancelMutation.reset();
    const request: OpprettBookingForespørsel = {
      baneId: selection.courtId,
      dato: selectedDate,
      startTid: slot.slotStartTid,
      sluttTid: slot.slotSluttTid,
    };
    bookMutation.mutate(request);
  }

  function cancelSlot(slot: KalenderSlotRespons) {
    if (!slot.bookingId || !isCurrentSlot(slot) || mutationBusy) return;
    bookMutation.reset();
    cancelMutation.reset();
    if (slot.arrangementId && slot.erSisteArrangementBooking) {
      cancellationSlot = slot;
      cancellationOpen = true;
      return;
    }
    cancelMutation.mutate({ bookingId: slot.bookingId, arrangementId: slot.arrangementId });
  }

  function openArrangementDialog(slot: KalenderSlotRespons, mode: "create" | "connect") {
    if (!isCurrentSlot(slot) || calendar.isError || mutationBusy || !canSelectArrangementSlot(slot))
      return;
    arrangementSelection = { slot, mode };
  }
</script>

{#if bootstrap.isPending}
  <Page eyebrow="Booking" title="Book bane" description="Finn en ledig tid.">
    <Collection title="Laster tider …" scope="Henter bookingoppsettet" busy>
      <CollectionLoading label="Laster booking" rows={5} layout="schedule" />
    </Collection>
  </Page>
{:else if bootstrap.isError}
  <Page eyebrow="Booking" title="Kunne ikke starte bookingen">
    <ErrorState
      title="Bookingdataene kunne ikke lastes"
      description={bootstrap.error instanceof Error
        ? bootstrap.error.message
        : "Prøv igjen om litt."}
      isRetrying={bootstrap.isFetching}
      onRetry={() => void bootstrap.refetch()}
    />
  </Page>
{:else}
  <BookingSchedule
    {activities}
    courts={selection.courts}
    date={selectedDate}
    {today}
    {tomorrow}
    selectedActivityId={selection.activityId}
    selectedCourtId={selection.courtId}
    maxDate={selectedMaxDate}
    slots={calendar.data?.slots ?? []}
    bookingstatus={calendar.data?.bookingstatus ?? null}
    slotsLoading={calendar.isPending && calendar.isFetching}
    slotsFetching={calendar.isFetching}
    slotsError={calendar.isError && calendar.error instanceof Error ? calendar.error.message : null}
    setupFetching={bootstrap.isFetching}
    authenticated={auth.state.status === "authenticated"}
    mutationBusy={mutationBusy || calendar.isPlaceholderData}
    {mutationError}
    onActivityChange={selectActivity}
    onCourtChange={selectCourt}
    onDateChange={selectDate}
    onBook={bookSlot}
    onCancel={cancelSlot}
    onCreateArrangement={(slot) => openArrangementDialog(slot, "create")}
    onConnectArrangement={(slot) => openArrangementDialog(slot, "connect")}
    onSlotsRetry={() => void calendar.refetch()}
  />
  {#if arrangementSelection && arrangementSelection.slot.baneId === selection.courtId && arrangementSelection.slot.dato === selectedDate && auth.state.status === "authenticated"}
    {#if arrangementSelection.mode === "create"}
      <QuickArrangementDialog
        activityId={selection.activityId}
        initialSlot={arrangementSelection.slot}
        slots={calendar.data?.slots ?? []}
        disabled={mutationBusy || calendar.isPlaceholderData || calendar.isError}
        onClose={() => (arrangementSelection = null)}
      />
    {:else}
      <ArrangementBookingDialog
        activityId={selection.activityId}
        initialSlot={arrangementSelection.slot}
        slots={calendar.data?.slots ?? []}
        disabled={mutationBusy || calendar.isPlaceholderData || calendar.isError}
        onClose={() => (arrangementSelection = null)}
      />
    {/if}
  {/if}
{/if}

<BookingCancelDialog
  bind:open={cancellationOpen}
  slot={cancellationSlot}
  pending={cancelMutation.isPending}
  error={cancelMutation.isError ? mutationError?.description : null}
  onConfirm={async () => {
    if (!cancellationSlot?.bookingId) return;
    await cancelMutation.mutateAsync({
      bookingId: cancellationSlot.bookingId,
      arrangementId: cancellationSlot.arrangementId,
    });
  }}
/>
