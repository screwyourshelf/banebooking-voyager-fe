<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { untrack } from "svelte";
  import type {
    BatchLeggTilArrangementBookingerRespons,
    KalenderSlotRespons,
  } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    CollectionEmpty,
    CollectionError,
    CollectionLoading,
    Dialog,
    DocumentFacts,
    Feedback,
    SettingsRadioGroup,
  } from "$lib/ui";
  import ArrangementTimeSelection from "./ArrangementTimeSelection.svelte";
  import { createArrangementTimeSelection } from "./arrangement-time-selection.svelte";
  import {
    activeArrangementsQueryOptions,
    connectArrangementTimesMutationOptions,
  } from "./queries";

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
  const times = createArrangementTimeSelection(
    untrack(() => initialSlot),
    () => slots
  );
  let open = $state(true);
  let selectedArrangementId = $state("");
  let submitted = $state(false);
  let submittedCount = $state(0);
  let result = $state<BatchLeggTilArrangementBookingerRespons | null>(null);
  const arrangements = createQuery(() =>
    activeArrangementsQueryOptions(api, tenant.slug, activityId, open)
  );
  const mutation = createMutation(() =>
    connectArrangementTimesMutationOptions(api, queryClient, tenant.slug)
  );
  const busy = $derived(mutation.isPending);
  const connected = $derived(Boolean(result?.opprettet.length));
  const selectedArrangement = $derived(
    arrangements.data?.find((arrangement) => arrangement.id === selectedArrangementId)
  );
  const conflictDescription = $derived(
    result?.feilet
      .map(
        (slot) => `${slot.startTid.slice(0, 5)}–${slot.sluttTid.slice(0, 5)}: ${slot.feilmelding}`
      )
      .join(". ")
  );

  async function submit() {
    submitted = true;
    if (
      !selectedArrangement ||
      times.selectionError ||
      busy ||
      disabled ||
      connected ||
      arrangements.isError
    )
      return;
    submittedCount = times.selectedSlots.length;
    result = null;
    try {
      result = await mutation.mutateAsync({
        arrangementId: selectedArrangementId,
        request: {
          bookinger: times.selectedSlots.map((slot) => ({
            baneId: slot.baneId,
            dato: slot.dato,
            startTid: slot.slotStartTid,
            sluttTid: slot.slotSluttTid,
          })),
        },
      });
    } catch {
      // Mutationfeilen vises ved handlingen; arrangement og tidsvalg beholdes.
    }
  }
</script>

<Dialog
  bind:open
  title="Koble til arrangement"
  description="Velg et aktivt arrangement og tider på den valgte banen. Du kan velge flere tider på samme dato."
  pending={busy}
  {onClose}
>
  {#if connected && result}
    <Feedback
      tone={result.feilet.length ? "warning" : "success"}
      title={result.feilet.length
        ? `${result.opprettet.length} av ${submittedCount} tider er koblet til arrangementet`
        : `${result.opprettet.length} ${result.opprettet.length === 1 ? "tid er" : "tider er"} koblet til arrangementet`}
      description={conflictDescription || "Kalenderen er oppdatert."}
    />
  {:else if arrangements.isPending}
    <CollectionLoading label="Laster arrangementer" rows={2} />
  {:else if arrangements.isError}
    <CollectionError
      title="Kunne ikke laste arrangementene"
      description={arrangements.error instanceof Error ? arrangements.error.message : undefined}
      isRetrying={arrangements.isFetching}
      onRetry={() => void arrangements.refetch()}
    />
  {:else if arrangements.data.length === 0}
    <CollectionEmpty
      title="Ingen aktive arrangementer"
      description="Opprett eller aktiver et arrangement før du kobler tidene til det."
    />
  {:else}
    <SettingsRadioGroup
      label="Aktive arrangementer"
      layout="stacked"
      value={selectedArrangementId}
      disabled={busy || disabled}
      onValueChange={(value) => (selectedArrangementId = value)}
      options={arrangements.data.map((arrangement) => ({
        value: arrangement.id,
        label: arrangement.tittel,
        description: arrangement.beskrivelse || "Aktivt arrangement",
      }))}
    />
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
    <ArrangementTimeSelection selection={times} disabled={busy || disabled} {submitted} />
    {#if result}
      <Feedback
        tone="danger"
        title="Tidene ble ikke koblet til arrangementet"
        description={conflictDescription || "Ingen av de valgte tidene kunne reserveres."}
      />
    {:else if mutation.isError}
      <Feedback
        tone="danger"
        title="Tidene kunne ikke kobles til arrangementet"
        description={mutation.error instanceof Error
          ? mutation.error.message
          : "Prøv igjen om litt."}
      />
    {/if}
  {/if}

  {#snippet actions({ close })}
    <Button variant="secondary" disabled={busy} onclick={close}
      >{connected ? "Lukk" : "Avbryt"}</Button
    >
    {#if !connected}
      <Button
        disabled={disabled ||
          busy ||
          !selectedArrangement ||
          arrangements.isPending ||
          arrangements.isError ||
          Boolean(times.selectionError)}
        onclick={() => void submit()}
      >
        Koble {times.selectedKeys.length}
        {times.selectedKeys.length === 1 ? "tid" : "tider"} til arrangement
      </Button>
    {/if}
  {/snippet}
</Dialog>
