<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    CollectionEmpty,
    CollectionError,
    CollectionLoading,
    Dialog,
    SettingsRadioGroup,
  } from "$lib/ui";
  import { activeArrangementsQueryOptions } from "./queries";

  let {
    activityId,
    disabled = false,
    onSelect,
  }: {
    activityId: string;
    disabled?: boolean;
    onSelect: (arrangementId: string) => void;
  } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  let open = $state(false);
  let selectedArrangementId = $state("");
  const arrangements = createQuery(() =>
    activeArrangementsQueryOptions(api, tenant.slug, activityId, open)
  );

  function showDialog() {
    selectedArrangementId = "";
    open = true;
  }

  function submit() {
    if (!selectedArrangementId) return;
    onSelect(selectedArrangementId);
    open = false;
  }
</script>

<Button variant="secondary" size="small" {disabled} onclick={showDialog}>
  Koble til arrangement
</Button>

<Dialog
  bind:open
  title="Koble til arrangement"
  description="Velg hvilket aktivt arrangement tiden skal høre til."
>
  {#if arrangements.isPending}
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
      description="Opprett eller aktiver et arrangement før du kobler tiden til det."
    />
  {:else}
    <SettingsRadioGroup
      label="Aktive arrangementer"
      layout="stacked"
      value={selectedArrangementId}
      onValueChange={(value) => (selectedArrangementId = value)}
      options={arrangements.data.map((arrangement) => ({
        value: arrangement.id,
        label: arrangement.tittel,
        description: arrangement.beskrivelse || "Aktivt arrangement",
      }))}
    />
  {/if}

  {#snippet actions()}
    <Button
      disabled={!selectedArrangementId || arrangements.isPending || arrangements.isError}
      onclick={submit}
    >
      Koble til valgt arrangement
    </Button>
  {/snippet}
</Dialog>
