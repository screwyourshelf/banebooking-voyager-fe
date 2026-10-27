<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { untrack } from "svelte";
  import type { KalenderSlotRespons, OpprettArrangementRespons } from "#lib/contracts/index.ts";
  import { ARRANGEMENT_KATEGORI_VALG, formaterArrangementKategori } from "#lib/domain/index.ts";
  import { getApiClient } from "#lib/platform/api/index.ts";
  import { getTenantContext } from "#lib/platform/tenant/index.ts";
  import {
    Button,
    Dialog,
    DocumentFacts,
    Feedback,
    Form,
    FormField,
    FormFields,
    FormSubmit,
    Select,
    Textarea,
  } from "#lib/ui/index.ts";
  import { createQuickArrangementMutationOptions } from "./queries";
  import { quickArrangementRequest, type QuickArrangementDraft } from "./quick-arrangement";
  import ArrangementTimeSelection from "./ArrangementTimeSelection.svelte";
  import { createArrangementTimeSelection } from "./arrangement-time-selection.svelte";

  let {
    activityId,
    disabled = false,
    initialSlot,
    onClose,
    slots,
  }: {
    activityId: string;
    disabled?: boolean;
    initialSlot: KalenderSlotRespons;
    onClose: () => void;
    slots: readonly KalenderSlotRespons[];
  } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() =>
    createQuickArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const formId = $props.id();
  const times = createArrangementTimeSelection(
    untrack(() => initialSlot),
    () => slots
  );
  let open = $state(true);
  let draft = $state<QuickArrangementDraft>({ description: "", category: "Annet" });
  let submitted = $state(false);
  let result = $state<OpprettArrangementRespons | null>(null);
  let submittedCount = $state(0);
  const created = $derived(Boolean(result && result.antallOpprettet > 0));
  const busy = $derived(mutation.isPending);
  const request = $derived(
    times.staleSelection ? null : quickArrangementRequest(activityId, draft, times.selectedSlots)
  );
  const conflictDescription = $derived(
    result?.konflikter
      .map((conflict) =>
        conflict.baneId === "00000000-0000-0000-0000-000000000000"
          ? conflict.feilmelding
          : `${conflict.startTid.slice(0, 5)}–${conflict.sluttTid.slice(0, 5)}: ${conflict.feilmelding}`
      )
      .join(". ")
  );

  async function submit(event?: SubmitEvent) {
    event?.preventDefault();
    submitted = true;
    if (!request || busy || disabled || created) return;
    submittedCount = times.selectedSlots.length;
    result = null;
    try {
      result = await mutation.mutateAsync(request);
    } catch {
      // Mutationfeilen vises ved handlingen; utkast og tidsvalg beholdes.
    }
  }
</script>

<Dialog
  bind:open
  title="Opprett nytt arrangement"
  description="Opprett et arrangement på den valgte banen. Du kan velge flere tider på samme dato."
  pending={busy}
  {onClose}
>
  <DocumentFacts
    items={[
      { label: "Bane", value: initialSlot.baneNavn },
      {
        label: "Dato",
        value: new Date(`${initialSlot.dato}T00:00:00`).toLocaleDateString("nb-NO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
    ]}
  />
  {#if created && result}
    <Feedback
      tone={result.konflikter.length ? "warning" : "success"}
      title={result.konflikter.length
        ? `Arrangement opprettet med ${result.antallOpprettet} av ${submittedCount} tider`
        : "Arrangementet er opprettet"}
      description={result.konflikter.length
        ? `${conflictDescription}. Du kan legge til eller endre tider i arrangementsadministrasjonen.`
        : `${formaterArrangementKategori(draft.category)} er lagt til i kalenderen.`}
    />
  {:else}
    <Form id={formId} onsubmit={submit} pending={busy}>
      <FormFields>
        <FormField label="Type" required>
          <Select
            name="kategori"
            options={ARRANGEMENT_KATEGORI_VALG}
            bind:value={draft.category}
            disabled={busy}
          />
        </FormField>
        <FormField label="Beskrivelse" description="Valgfritt.">
          <Textarea name="beskrivelse" bind:value={draft.description} disabled={busy} />
        </FormField>
      </FormFields>
      <ArrangementTimeSelection selection={times} {submitted} disabled={busy || disabled} />
    </Form>
    {#if result}
      <Feedback
        tone="danger"
        title="Arrangementet ble ikke opprettet"
        description={conflictDescription || "Ingen av de valgte tidene kunne reserveres."}
      />
    {:else if mutation.isError}
      <Feedback
        tone="danger"
        title="Arrangementet kunne ikke opprettes"
        description={mutation.error instanceof Error
          ? mutation.error.message
          : "Prøv igjen om litt."}
      />
    {/if}
  {/if}

  {#snippet actions({ close })}
    <Button variant="secondary" disabled={busy} onclick={close}
      >{created ? "Lukk" : "Avbryt"}</Button
    >
    {#if !created}
      <FormSubmit
        form={formId}
        pending={busy}
        disabled={disabled || times.selectedKeys.length === 0 || times.staleSelection}
      >
        Opprett arrangement med {times.selectedKeys.length}
        {times.selectedKeys.length === 1 ? "tid" : "tider"}
      </FormSubmit>
    {/if}
  {/snippet}
</Dialog>
