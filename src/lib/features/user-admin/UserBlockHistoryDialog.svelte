<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { BrukerRespons, BrukerSperreRespons } from "$lib/contracts";
  import { formatDatoKort, formatTidspunktKort } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionList,
    CollectionRow,
    CollectionEmpty,
    CollectionError,
    CollectionLoading,
    EditorDialog,
    Feedback,
  } from "$lib/ui";
  import { getUserDisplayName } from "./model";
  import { revokeBlockMutationOptions, userBlocksQueryOptions } from "./queries";

  let { onClose, user }: { onClose: () => void; user: BrukerRespons } = $props();
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const historyQuery = createQuery(() => userBlocksQueryOptions(api, tenant.slug, user.id, true));
  const revokeMutation = createMutation(() =>
    revokeBlockMutationOptions(api, queryClient, tenant.slug)
  );
  const displayName = $derived(getUserDisplayName(user));
  let open = $state(true);
  const canRevoke = $derived(user.kapabiliteter.includes("bruker:opphevSperre"));

  function statusFor(block: BrukerSperreRespons) {
    return block.erAktiv
      ? { label: "Aktiv", tone: "danger" as const }
      : block.opphevtTidspunkt
        ? { label: "Opphevet", tone: "past" as const }
        : { label: "Utløpt", tone: "past" as const };
  }

  async function revoke(blockId: string) {
    try {
      await revokeMutation.mutateAsync({ userId: user.id, blockId });
    } catch {
      // Historikken og mutationfeilen forblir synlige.
    }
  }
</script>

<EditorDialog
  bind:open
  pending={revokeMutation.isPending}
  {onClose}
  backLabel="Til brukeren"
  eyebrow="Brukeradministrasjon"
  title="Sperrehistorikk"
  description={displayName === user.epost ? user.epost : `${displayName} · ${user.epost}`}
>
  <Collection
    embedded
    title={historyQuery.isPending
      ? "Laster sperrer …"
      : historyQuery.isError
        ? "Sperrer"
        : `${historyQuery.data?.sperrer.length ?? 0} ${historyQuery.data?.sperrer.length === 1 ? "sperre" : "sperrer"} · ${historyQuery.data?.antallAktive ?? 0} ${historyQuery.data?.antallAktive === 1 ? "aktiv" : "aktive"}`}
    busy={historyQuery.isFetching}
  >
    {#if historyQuery.isPending}
      <CollectionLoading label="Henter sperrer" rows={3} />
    {:else if historyQuery.isError}
      <CollectionError
        title="Kunne ikke hente sperrene"
        description={historyQuery.error instanceof Error ? historyQuery.error.message : undefined}
        isRetrying={historyQuery.isFetching}
        onRetry={() => void historyQuery.refetch()}
      />
    {:else if historyQuery.data?.sperrer.length}
      <CollectionList busy={historyQuery.isFetching}>
        {#each historyQuery.data.sperrer as block (block.id)}
          {#snippet revokeAction()}
            <Button
              size="small"
              variant="secondary"
              disabled={revokeMutation.isPending}
              onclick={() => void revoke(block.id)}
              >{revokeMutation.isPending ? "Opphever …" : "Opphev sperre"}</Button
            >
          {/snippet}
          <CollectionRow
            title={block.årsak}
            status={statusFor(block)}
            contentPresentation="preview"
            description={`${block.aktivTil ? `${block.erAktiv ? "Utløper" : "Utløpsdato"} ${formatDatoKort(block.aktivTil)}` : "Ingen utløpsdato"}${block.opphevtAv && block.opphevtTidspunkt ? ` · Opphevet ${formatTidspunktKort(block.opphevtTidspunkt)} av ${block.opphevtAv}` : ""}`}
            meta={`Sperret ${formatTidspunktKort(block.opprettetTidspunkt)} av ${block.opprettetAv}`}
            interaction={block.erAktiv && canRevoke
              ? { type: "action", action: revokeAction }
              : { type: "static" }}
          />
        {/each}
      </CollectionList>
    {:else}
      <CollectionEmpty
        title="Ingen sperrer"
        description="Det er ikke registrert sperrer for denne brukeren."
      />
    {/if}
    {#if revokeMutation.isError}
      <Feedback
        tone="danger"
        title="Kunne ikke oppheve sperren"
        description={revokeMutation.error instanceof Error
          ? revokeMutation.error.message
          : undefined}
      />
    {/if}
  </Collection>
</EditorDialog>
