<script lang="ts">
  import type { BookingstatusRespons, KalenderSlotRespons } from "#lib/contracts/index.ts";
  import { Button, CollectionRow, DocumentFacts, ScheduleTime, Weather } from "#lib/ui/index.ts";
  import { getBookingSlotPresentation } from "./model";

  let {
    authenticated,
    bookingstatus,
    busy = false,
    onBook,
    onCancel,
    onCreateArrangement,
    onConnectArrangement,
    slot,
  }: {
    authenticated: boolean;
    bookingstatus: BookingstatusRespons | null;
    busy?: boolean;
    onBook: (slot: KalenderSlotRespons) => void;
    onCancel: (slot: KalenderSlotRespons) => void;
    onCreateArrangement: (slot: KalenderSlotRespons) => void;
    onConnectArrangement: (slot: KalenderSlotRespons) => void;
    slot: KalenderSlotRespons;
  } = $props();

  const presentation = $derived(getBookingSlotPresentation(slot, authenticated, bookingstatus));
  const arrangementOwner = $derived(slot.arrangementTittel ? slot.booketAv?.trim() : null);
</script>

{#snippet weather()}
  <Weather compact symbol={slot.værSymbol} temperature={slot.temperatur} wind={slot.vind} />
{/snippet}

{#snippet time()}
  <ScheduleTime
    start={presentation.start}
    end={presentation.end}
    accessory={slot.værSymbol || typeof slot.temperatur === "number" ? weather : undefined}
  />
{/snippet}

{#snippet quickBook()}
  <Button
    size="small"
    disabled={busy}
    aria-label={`Book tiden ${presentation.start} til ${presentation.end}`}
    onclick={() => onBook(slot)}
  >
    Book
  </Button>
{/snippet}

{#snippet details()}
  {#if slot.arrangementBeskrivelse}<p>{slot.arrangementBeskrivelse}</p>{/if}
  {#if arrangementOwner}
    <DocumentFacts items={[{ label: "Booket av", value: arrangementOwner }]} />
  {/if}
  {#if presentation.cannotBookExplanation}
    <p>{presentation.cannotBookExplanation}</p>
  {/if}
{/snippet}

{#snippet actions()}
  {#if presentation.canConnectToArrangement}
    <Button
      variant="secondary"
      size="small"
      disabled={busy}
      onclick={() => onConnectArrangement(slot)}
    >
      Koble til arrangement
    </Button>
    <Button
      variant="secondary"
      size="small"
      disabled={busy}
      onclick={() => onCreateArrangement(slot)}
    >
      Opprett nytt arrangement
    </Button>
  {/if}
  {#if presentation.canCancel}
    <Button variant="destructive" size="small" disabled={busy} onclick={() => onCancel(slot)}>
      Avbestill
    </Button>
  {/if}
{/snippet}

{#if presentation.hasDetails}
  <CollectionRow
    layout="schedule"
    leading={time}
    title={presentation.title}
    category={presentation.category}
    status={presentation.status}
    muted={presentation.muted}
    {busy}
    interaction={{
      type: "expand",
      value: presentation.key,
      details,
      actions,
      summaryAction: presentation.canBook ? quickBook : undefined,
    }}
  />
{:else if presentation.canBook}
  <CollectionRow
    layout="schedule"
    leading={time}
    title={presentation.title}
    category={presentation.category}
    status={presentation.status}
    muted={presentation.muted}
    {busy}
    interaction={{ type: "action", action: quickBook }}
  />
{:else}
  <CollectionRow
    layout="schedule"
    leading={time}
    title={presentation.title}
    category={presentation.category}
    status={presentation.status}
    muted={presentation.muted}
    {busy}
  />
{/if}
