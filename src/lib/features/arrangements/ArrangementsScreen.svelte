<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { ArrangementRespons } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    Page,
  } from "$lib/ui";
  import ArrangementRow from "./ArrangementRow.svelte";
  import {
    ARRANGEMENT_PAGE_SIZE,
    filterArrangementsByBranch,
    getArrangementBranchOptions,
    visibleCountForSelectedArrangement,
  } from "./model";
  import { arrangementsQueryOptions, cancelArrangementMutationOptions } from "./queries";

  let {
    initialArrangementId,
    referenceDate,
  }: { initialArrangementId?: string; referenceDate?: Date } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  let includeHistorical = $state(false);
  let selectedBranches = $state<string[]>([]);
  let visibleCount = $state(ARRANGEMENT_PAGE_SIZE);
  let openArrangementId = $state("");
  let appliedInitialArrangementId = $state<string | undefined>();
  let cancellingId = $state<string | null>(null);

  $effect(() => {
    if (initialArrangementId === appliedInitialArrangementId) return;
    appliedInitialArrangementId = initialArrangementId;
    openArrangementId = initialArrangementId ?? "";
  });

  const authenticated = $derived(auth.state.status === "authenticated");
  const arrangementsQuery = createQuery(() =>
    arrangementsQueryOptions(api, tenant.slug, includeHistorical, authenticated)
  );
  const cancelMutation = createMutation(() =>
    cancelArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const arrangements = $derived(arrangementsQuery.data ?? []);
  const branchOptions = $derived(getArrangementBranchOptions(arrangements));
  const filteredArrangements = $derived(filterArrangementsByBranch(arrangements, selectedBranches));
  const effectiveVisibleCount = $derived(
    visibleCountForSelectedArrangement(filteredArrangements, initialArrangementId, visibleCount)
  );
  const visibleArrangements = $derived(filteredArrangements.slice(0, effectiveVisibleCount));
  const remainingCount = $derived(Math.max(0, filteredArrangements.length - effectiveVisibleCount));
  const hasFilteredEmptyState = $derived(
    arrangements.length > 0 && filteredArrangements.length === 0
  );
  const countLabel = $derived(
    arrangementsQuery.isPending
      ? "Laster arrangementer …"
      : `${filteredArrangements.length} ${filteredArrangements.length === 1 ? "arrangement" : "arrangementer"}`
  );

  function toggleHistorical(value: boolean) {
    includeHistorical = value;
    visibleCount = ARRANGEMENT_PAGE_SIZE;
    selectedBranches = [];
    cancelMutation.reset();
  }

  function toggleBranch(branch: string) {
    selectedBranches = selectedBranches.includes(branch)
      ? selectedBranches.filter((selected) => selected !== branch)
      : [...selectedBranches, branch];
    visibleCount = ARRANGEMENT_PAGE_SIZE;
  }

  function resetFilters() {
    selectedBranches = [];
    visibleCount = ARRANGEMENT_PAGE_SIZE;
  }

  function prepareCancellation(arrangementId: string) {
    cancellingId = arrangementId;
    cancelMutation.reset();
  }

  function resetCancellation() {
    if (!cancelMutation.isPending) {
      cancellingId = null;
      cancelMutation.reset();
    }
  }

  async function cancelSelectedArrangement(arrangement: ArrangementRespons) {
    cancellingId = arrangement.id;
    return cancelMutation.mutateAsync(arrangement.id);
  }
</script>

{#snippet filters()}
  <CollectionControls
    label="Filtrer arrangementer"
    groups={branchOptions.length > 1
      ? [
          {
            label: "Gren",
            options: branchOptions,
            selectedValues: selectedBranches,
            onSelect: toggleBranch,
          },
        ]
      : []}
    onReset={resetFilters}
    disabled={arrangementsQuery.isFetching}
  />
{/snippet}

{#snippet emptyAction()}
  {#if hasFilteredEmptyState}
    <Button variant="secondary" onclick={resetFilters}>Nullstill filter</Button>
  {/if}
{/snippet}

{#snippet footer()}
  {#if remainingCount > 0}
    <Button variant="secondary" onclick={() => (visibleCount += ARRANGEMENT_PAGE_SIZE)}>
      Vis flere ({remainingCount} gjenstår)
    </Button>
  {/if}
{/snippet}

<Page
  eyebrow="Klubben"
  title="Arrangementer"
  description="Se hva som skjer, når det starter og hvilke baner som brukes."
>
  <Collection
    title={countLabel}
    scope={includeHistorical ? "Kommende og tidligere" : "Kommende"}
    busy={arrangementsQuery.isFetching}
    toggle={{
      title: "Vis tidligere",
      checked: includeHistorical,
      onCheckedChange: toggleHistorical,
      pending: arrangementsQuery.isFetching,
    }}
    filters={branchOptions.length > 1 ? filters : undefined}
    filtersLabel="Arrangementsfiltre"
    footer={remainingCount > 0 ? footer : undefined}
  >
    {#if arrangementsQuery.isPending}
      <CollectionLoading label="Laster arrangementer" rows={4} />
    {:else if arrangementsQuery.isError}
      <CollectionError
        title="Kunne ikke laste arrangementene"
        description={arrangementsQuery.error instanceof Error
          ? arrangementsQuery.error.message
          : "Prøv igjen om litt."}
        isRetrying={arrangementsQuery.isFetching}
        onRetry={() => void arrangementsQuery.refetch()}
      />
    {:else if filteredArrangements.length === 0}
      <CollectionEmpty
        title={hasFilteredEmptyState
          ? "Ingen arrangementer for valgt gren"
          : includeHistorical
            ? "Ingen arrangementer ennå"
            : "Ingen kommende arrangementer"}
        description={hasFilteredEmptyState
          ? "Velg en annen gren eller nullstill filteret."
          : includeHistorical
            ? "Når klubben publiserer noe, vises kommende og tidligere arrangementer her."
            : "Nye arrangementer dukker opp her når de blir publisert av klubben."}
        action={hasFilteredEmptyState ? emptyAction : undefined}
      />
    {:else}
      <CollectionList
        bind:value={openArrangementId}
        label="Arrangementer"
        busy={arrangementsQuery.isFetching}
      >
        {#each visibleArrangements as arrangement (arrangement.id)}
          <ArrangementRow
            {arrangement}
            {referenceDate}
            cancelling={cancelMutation.isPending && cancellingId === arrangement.id}
            cancelError={cancelMutation.isError && cancellingId === arrangement.id
              ? cancelMutation.error instanceof Error
                ? cancelMutation.error.message
                : "Arrangementet kunne ikke avlyses."
              : null}
            onPrepareCancel={() => prepareCancellation(arrangement.id)}
            onResetCancel={resetCancellation}
            onCancel={() => cancelSelectedArrangement(arrangement)}
          />
        {/each}
      </CollectionList>
    {/if}
  </Collection>
</Page>
