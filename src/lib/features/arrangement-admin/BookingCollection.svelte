<script lang="ts">
  import { formaterDatoGruppe } from "$lib/domain/dato";
  import {
    Button,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionGroup,
    CollectionList,
    CollectionRow,
    ScheduleTime,
  } from "$lib/ui";
  import { groupBookingsByDate, type LocalBooking } from "./model";

  let {
    bookings,
    busy = false,
    onEdit,
  }: {
    bookings: readonly LocalBooking[];
    busy?: boolean;
    onEdit: (booking: LocalBooking) => void;
  } = $props();

  let conflictsOnly = $state(false);
  const conflictCount = $derived(
    bookings.filter((booking) => booking.status === "conflict").length
  );
  const stagedCount = $derived(
    bookings.filter((booking) => booking.source !== "existing" && booking.status !== "conflict")
      .length
  );
  const existingCount = $derived(
    bookings.filter((booking) => booking.source === "existing").length
  );
  const visibleBookings = $derived(
    conflictsOnly ? bookings.filter((booking) => booking.status === "conflict") : bookings
  );
  const groups = $derived(groupBookingsByDate(visibleBookings));
  const summary = $derived(
    [
      existingCount ? `${existingCount} ${existingCount === 1 ? "aktiv" : "aktive"}` : null,
      stagedCount ? `${stagedCount} forslag` : null,
      conflictCount ? `${conflictCount} ${conflictCount === 1 ? "konflikt" : "konflikter"}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Ingen tider er lagt til ennå."
  );
</script>

{#snippet filters()}
  <CollectionControls
    label="Filtrer banetider"
    groups={[
      {
        label: "Status",
        options: [{ value: "conflict", label: "Konflikter" }],
        selectedValues: conflictsOnly ? ["conflict"] : [],
        onSelect: () => (conflictsOnly = !conflictsOnly),
      },
    ]}
    onReset={() => (conflictsOnly = false)}
    disabled={busy}
  />
{/snippet}

{#snippet resetFilter()}
  <Button variant="secondary" onclick={() => (conflictsOnly = false)}>Vis alle tider</Button>
{/snippet}

<Collection
  title={`${visibleBookings.length} ${visibleBookings.length === 1 ? "banetid" : "banetider"}`}
  scope={summary}
  filters={conflictCount > 0 ? filters : undefined}
  filtersLabel="Banetidsfiltre"
  {busy}
>
  {#if visibleBookings.length === 0}
    <CollectionEmpty
      title={conflictsOnly ? "Ingen konflikter" : "Ingen banetider ennå"}
      description={conflictsOnly
        ? "Alle forslagene kan opprettes."
        : "Bruk oppsettet over for å legge til konkrete tider."}
      action={conflictsOnly ? resetFilter : undefined}
    />
  {:else}
    <CollectionList>
      {#each groups as [date, dateBookings] (date)}
        {@const heading = formaterDatoGruppe(date)}
        <CollectionGroup
          {date}
          label={heading.label}
          relativeLabel={heading.relativeLabel ?? undefined}
        >
          {#each dateBookings as booking (booking.id)}
            {@const status =
              booking.status === "conflict"
                ? { label: "Konflikt", tone: "warning" as const }
                : booking.source === "existing"
                  ? { label: "Aktiv", tone: "available" as const }
                  : { label: "Forslag", tone: "event" as const }}
            {#snippet time()}
              <ScheduleTime start={booking.startTime} end={booking.endTime} />
            {/snippet}
            <CollectionRow
              layout="schedule"
              leading={time}
              title={booking.courtName}
              description={booking.message}
              {status}
              interaction={{ type: "open", onOpen: () => onEdit(booking) }}
              ariaLabel={`Rediger ${booking.courtName}, ${booking.startTime}–${booking.endTime}`}
              {busy}
            />
          {/each}
        </CollectionGroup>
      {/each}
    </CollectionList>
  {/if}
</Collection>
