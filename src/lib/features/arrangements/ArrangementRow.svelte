<script lang="ts">
  import type { ArrangementRespons } from "$lib/contracts";
  import { Button, CollectionRow, DocumentFacts, type DocumentFact } from "$lib/ui";
  import ArrangementCancelDialog from "./ArrangementCancelDialog.svelte";
  import {
    INITIAL_PROGRAM_DAY_COUNT,
    PROGRAM_DAYS_PER_PAGE,
    createArrangementListItem,
    formatCourts,
    formatProgramDate,
  } from "./model";

  let {
    arrangement,
    cancelError,
    cancelling = false,
    onCancel,
    onPrepareCancel,
    onResetCancel,
    referenceDate,
  }: {
    arrangement: ArrangementRespons;
    cancelError?: string | null;
    cancelling?: boolean;
    onCancel: () => Promise<unknown>;
    onPrepareCancel: () => void;
    onResetCancel: () => void;
    referenceDate?: Date;
  } = $props();

  let visibleDayCount = $state(INITIAL_PROGRAM_DAY_COUNT);
  const generatedId = $props.id();
  const programHeadingId = `${generatedId}-program`;
  const item = $derived(createArrangementListItem(arrangement, referenceDate));
  const visibleDays = $derived(item.programDays.slice(0, visibleDayCount));
  const programFacts = $derived(
    visibleDays.flatMap((day) =>
      day.slots.map(
        (slot): DocumentFact => ({
          label: `${formatProgramDate(day.dato)}, ${slot.startTid.slice(0, 5)}–${slot.sluttTid.slice(0, 5)}`,
          value: formatCourts(slot.baneNavn),
        })
      )
    )
  );
  const hasMoreDays = $derived(item.programDays.length > visibleDayCount);
</script>

{#snippet details()}
  {#if item.description}<p>{item.description}</p>{/if}

  {#if item.bookedBy}
    <DocumentFacts items={[{ label: "Booket av", value: item.bookedBy }]} />
  {/if}

  {#if item.programSummary}
    <section aria-labelledby={programHeadingId}>
      <h4 id={programHeadingId}>Program</h4>
      <p>{item.programSummary}</p>
      <DocumentFacts items={programFacts} label={`Program for ${arrangement.tittel}`} />
      {#if hasMoreDays}
        <Button
          variant="ghost"
          size="small"
          onclick={() => (visibleDayCount += PROGRAM_DAYS_PER_PAGE)}
        >
          Vis flere datoer
        </Button>
      {/if}
    </section>
  {:else if !arrangement.erPassert}
    <p>Ingen kommende tider i programmet.</p>
  {/if}
{/snippet}

{#snippet actions()}
  <ArrangementCancelDialog
    title={arrangement.tittel}
    error={cancelError}
    pending={cancelling}
    {onCancel}
    onPrepare={onPrepareCancel}
    onReset={onResetCancel}
  />
{/snippet}

<CollectionRow
  title={arrangement.tittel}
  description={item.metadata}
  meta={[item.dateRange.label, item.relativeStart].filter(Boolean).join(" · ")}
  status={item.lifecycle}
  muted={arrangement.erPassert}
  busy={cancelling}
  interaction={item.hasDetails
    ? {
        type: "expand",
        value: arrangement.id,
        details,
        actions: item.canCancel ? actions : undefined,
      }
    : { type: "static" }}
/>
