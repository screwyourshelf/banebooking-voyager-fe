<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { KalenderSlotRespons, OpprettBookingForespørsel } from "$lib/contracts";
  import { tilDatoTekst } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext } from "$lib/platform/tenant";
  import { Collection, CollectionLoading, ErrorState, Page } from "$lib/ui";
  import BookingSchedule from "./BookingSchedule.svelte";
  import { addDaysToIsoDate, resolveBookingSelection } from "./model";
  import {
    bookingBootstrapQueryOptions,
    bookingSlotsQueryOptions,
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
  const initialSlots = $derived(
    bootstrap.data &&
      selection.courtId === bootstrap.data.initialCourtId &&
      selectedDate === bootstrap.data.date
      ? bootstrap.data.slots
      : undefined
  );
  const slots = createQuery(() =>
    bookingSlotsQueryOptions(api, tenant.slug, selection.courtId, selectedDate, initialSlots)
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

  function selectActivity(activityId: string) {
    preferredActivityId = activityId;
    preferredCourtId = null;
  }

  function selectCourt(courtId: string) {
    preferredCourtId = courtId;
  }

  function selectDate(date: string) {
    selectedDate = date;
  }

  function bookSlot(slot: KalenderSlotRespons, arrangementId?: string) {
    cancelMutation.reset();
    const request: OpprettBookingForespørsel = {
      baneId: selection.courtId,
      dato: selectedDate,
      startTid: slot.slotStartTid,
      sluttTid: slot.slotSluttTid,
      ...(arrangementId ? { arrangementId } : {}),
    };
    bookMutation.mutate(request);
  }

  function cancelSlot(slot: KalenderSlotRespons) {
    if (!slot.bookingId) return;
    bookMutation.reset();
    cancelMutation.mutate({ bookingId: slot.bookingId });
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
    slots={slots.data ?? []}
    slotsLoading={slots.isPending && slots.isFetching}
    slotsFetching={slots.isFetching}
    slotsError={slots.isError && slots.error instanceof Error ? slots.error.message : null}
    setupFetching={bootstrap.isFetching}
    authenticated={auth.state.status === "authenticated"}
    {mutationBusy}
    {mutationError}
    onActivityChange={selectActivity}
    onCourtChange={selectCourt}
    onDateChange={selectDate}
    onBook={bookSlot}
    onCancel={cancelSlot}
    onSlotsRetry={() => void slots.refetch()}
  />
{/if}
