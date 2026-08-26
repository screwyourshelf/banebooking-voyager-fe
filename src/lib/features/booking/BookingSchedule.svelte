<script lang="ts">
  import { CalendarAdd01Icon } from "@hugeicons/core-free-icons";
  import type { BaneRespons, GrenRespons, KalenderSlotRespons } from "$lib/contracts";
  import {
    Button,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    DatePicker,
    Feedback,
    Icon,
    Page,
    type CollectionChoiceContext,
    type CollectionControlGroup,
  } from "$lib/ui";
  import BookingRulesDialog from "./BookingRulesDialog.svelte";
  import BookingSlotRow from "./BookingSlotRow.svelte";
  import {
    countAvailableBookingSlots,
    countPassedBookingSlots,
    getBookingDayChoice,
    getVisibleBookingSlots,
  } from "./model";

  let {
    activities,
    authenticated,
    courts,
    date,
    mutationBusy = false,
    mutationError,
    onActivityChange,
    onBook,
    onCancel,
    onCourtChange,
    onDateChange,
    onSlotsRetry,
    selectedActivityId,
    selectedCourtId,
    setupFetching = false,
    slots,
    slotsError,
    slotsFetching = false,
    slotsLoading = false,
    today,
    tomorrow,
  }: {
    activities: GrenRespons[];
    authenticated: boolean;
    courts: BaneRespons[];
    date: string;
    mutationBusy?: boolean;
    mutationError?: { description: string; title: string } | null;
    onActivityChange: (activityId: string) => void;
    onBook: (slot: KalenderSlotRespons, arrangementId?: string) => void;
    onCancel: (slot: KalenderSlotRespons) => void;
    onCourtChange: (courtId: string) => void;
    onDateChange: (date: string) => void;
    onSlotsRetry: () => void;
    selectedActivityId: string;
    selectedCourtId: string;
    setupFetching?: boolean;
    slots: KalenderSlotRespons[];
    slotsError?: string | null;
    slotsFetching?: boolean;
    slotsLoading?: boolean;
    today: string;
    tomorrow: string;
  } = $props();

  let showPast = $state(false);
  const selectedActivity = $derived(
    activities.find((activity) => activity.id === selectedActivityId)
  );
  const selectedCourt = $derived(courts.find((court) => court.id === selectedCourtId));
  const selectedDay = $derived(getBookingDayChoice(date, today, tomorrow));
  const visibleSlots = $derived(getVisibleBookingSlots(slots, date, today, showPast));
  const passedCount = $derived(countPassedBookingSlots(slots));
  const availableCount = $derived(countAvailableBookingSlots(slots, authenticated));
  const resultTitle = $derived(
    slotsLoading || slotsFetching
      ? "Laster tider …"
      : slotsError
        ? "Tider utilgjengelige"
        : availableCount === 0
          ? "Ingen ledige tider"
          : `${availableCount} ${availableCount === 1 ? "ledig tid" : "ledige tider"}`
  );
  const selectionGroups = $derived<CollectionControlGroup[]>([
    {
      label: "Gren",
      options: activities.map((activity) => ({ value: activity.id, label: activity.navn })),
      selectedValues: selectedActivityId ? [selectedActivityId] : [],
      onSelect: onActivityChange,
    },
    {
      label: "Dag",
      options: [
        { value: "today", label: "I dag" },
        { value: "tomorrow", label: "I morgen" },
        { value: "date", label: "Velg dato", control: dateChoice },
      ],
      selectedValues: [selectedDay],
      onSelect: selectDay,
    },
    {
      label: "Bane",
      options: courts.map((court) => ({ value: court.id, label: court.navn })),
      selectedValues: selectedCourtId ? [selectedCourtId] : [],
      onSelect: onCourtChange,
    },
  ]);

  function selectDay(value: string) {
    if (value === "today") onDateChange(today);
    if (value === "tomorrow") onDateChange(tomorrow);
  }
</script>

{#snippet dateChoice({ disabled, selected }: CollectionChoiceContext)}
  <DatePicker
    presentation="booking"
    value={date}
    minValue={today}
    {disabled}
    {selected}
    aria-label="Velg annen dato"
    onValueChange={onDateChange}
  />
{/snippet}

{#snippet collectionIcon()}
  <Icon icon={CalendarAdd01Icon} />
{/snippet}

{#snippet rulesAction()}
  <BookingRulesDialog
    activity={selectedActivity}
    court={selectedCourt}
    disabled={!selectedActivity || !selectedCourt}
  />
{/snippet}

{#snippet filters()}
  <CollectionControls
    mode="selection"
    indicator="activity"
    label="Velg gren, dag og bane"
    groups={selectionGroups}
    pending={setupFetching}
  />
{/snippet}

{#snippet footer()}
  <Button variant="secondary" size="small" onclick={() => (showPast = !showPast)}>
    {showPast ? "Skjul passerte" : `Vis passerte (${passedCount})`}
  </Button>
{/snippet}

<Page eyebrow="Booking" title="Book bane" description="Finn en ledig tid.">
  <Collection
    title={resultTitle}
    scope={selectedCourt
      ? `${selectedCourt.navn}${selectedActivity ? ` · ${selectedActivity.navn}` : ""}`
      : "Velg en bane for å se tider"}
    icon={collectionIcon}
    contextAction={rulesAction}
    {filters}
    footer={date === today && passedCount > 0 ? footer : undefined}
    busy={slotsFetching || mutationBusy}
    aria-label="Tilgjengelige tider"
  >
    {#if mutationError}
      <Feedback tone="danger" title={mutationError.title} description={mutationError.description} />
    {/if}

    {#if slotsError}
      <CollectionError
        title="Kunne ikke laste tidene"
        description={slotsError}
        isRetrying={slotsFetching}
        onRetry={onSlotsRetry}
      />
    {:else if activities.length === 0}
      <CollectionEmpty
        title="Booking er ikke satt opp"
        description="Klubben har ingen aktive grener som kan bookes ennå."
      />
    {:else if courts.length === 0}
      <CollectionEmpty
        title="Ingen baner å vise"
        description={`Det er ikke lagt til baner for ${selectedActivity?.navn ?? "denne grenen"}.`}
      />
    {:else if slotsLoading}
      <CollectionLoading label="Laster tider" rows={5} layout="schedule" />
    {:else if slots.length === 0}
      <CollectionEmpty
        title="Ingen tider denne dagen"
        description="Prøv en annen dato eller bane."
      />
    {:else if visibleSlots.length === 0}
      <CollectionEmpty
        title="Dagens spilletider er over"
        description="Vis passerte tider eller velg neste dag."
      />
    {:else}
      <CollectionList label="Tilgjengelige tider" busy={slotsFetching || mutationBusy}>
        {#each visibleSlots as slot (slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`)}
          <BookingSlotRow
            activityId={selectedActivityId}
            {authenticated}
            busy={mutationBusy}
            {slot}
            {onBook}
            {onCancel}
          />
        {/each}
      </CollectionList>
    {/if}
  </Collection>
</Page>
