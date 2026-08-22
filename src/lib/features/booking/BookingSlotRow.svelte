<script lang="ts">
  import type { KalenderSlotRespons } from "$lib/contracts";
  import { Button, CollectionRow, DocumentFacts, ScheduleTime, Weather } from "$lib/ui";
  import ArrangementBookingDialog from "./ArrangementBookingDialog.svelte";
  import { getBookingSlotPresentation } from "./model";

  let {
    activityId,
    authenticated,
    busy = false,
    onBook,
    onCancel,
    slot,
  }: {
    activityId: string;
    authenticated: boolean;
    busy?: boolean;
    onBook: (slot: KalenderSlotRespons, arrangementId?: string) => void;
    onCancel: (slot: KalenderSlotRespons) => void;
    slot: KalenderSlotRespons;
  } = $props();

  const presentation = $derived(getBookingSlotPresentation(slot, authenticated));
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
  {#if presentation.cannotBook}
    <p>Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.</p>
  {/if}
{/snippet}

{#snippet actions()}
  {#if presentation.canConnectToArrangement}
    <ArrangementBookingDialog
      {activityId}
      disabled={busy}
      onSelect={(arrangementId) => onBook(slot, arrangementId)}
    />
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
