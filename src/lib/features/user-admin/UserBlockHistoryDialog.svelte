<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { BrukerRespons, BrukerSperreRespons } from "$lib/contracts";
  import { formatDatoKort, formatTidspunktKort } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    CollectionEmpty,
    CollectionError,
    CollectionLoading,
    EditorDialog,
    Feedback,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsText,
  } from "$lib/ui";
  import { revokeBlockMutationOptions, userBlocksQueryOptions } from "./queries";

  let { onClose, user }: { onClose: () => void; user: BrukerRespons } = $props();
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const historyQuery = createQuery(() => userBlocksQueryOptions(api, tenant.slug, user.id, true));
  const revokeMutation = createMutation(() =>
    revokeBlockMutationOptions(api, queryClient, tenant.slug)
  );
  let open = $state(true);
  const canRevoke = $derived(user.kapabiliteter.includes("bruker:opphevSperre"));

  function statusFor(block: BrukerSperreRespons) {
    return block.erAktiv
      ? { label: "Aktiv", description: "Sperren gjelder nå" }
      : block.opphevtTidspunkt
        ? { label: "Opphevet", description: "Sperren er manuelt opphevet" }
        : { label: "Utløpt", description: "Sperreperioden er avsluttet" };
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
  eyebrow="Tilgang"
  title="Sperrehistorikk"
  description={user.epost}
>
  <SettingsStack embedded>
    <SettingsSection
      embedded
      eyebrow="Historikk"
      title="Registrerte sperrer"
      description="Aktive, utløpte og opphevede sperrer for denne brukeren."
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
        <SettingsPanel>
          {#each historyQuery.data.sperrer as block (block.id)}
            {@const status = statusFor(block)}
            <SettingsRow
              title={block.årsak}
              description={`${status.label} · Sperret ${formatTidspunktKort(block.opprettetTidspunkt)} av ${block.opprettetAv}`}
            >
              <SettingsText>
                {block.aktivTil ? `Utløper ${formatDatoKort(block.aktivTil)}` : "Ingen utløpsdato"}
                {#if block.opphevtAv && block.opphevtTidspunkt}
                  <br />Opphevet {formatTidspunktKort(block.opphevtTidspunkt)} av {block.opphevtAv}
                {/if}
              </SettingsText>
              {#if block.erAktiv && canRevoke}
                <Button
                  size="small"
                  variant="secondary"
                  disabled={revokeMutation.isPending}
                  onclick={() => void revoke(block.id)}
                  >{revokeMutation.isPending ? "Opphever …" : "Opphev sperre"}</Button
                >
              {/if}
            </SettingsRow>
          {/each}
        </SettingsPanel>
      {:else}
        <CollectionEmpty
          title="Ingen sperrer"
          description="Det er ikke registrert sperrer for denne brukeren."
        />
      {/if}
    </SettingsSection>

    {#if revokeMutation.isError}
      <Feedback
        tone="danger"
        title="Kunne ikke oppheve sperren"
        description={revokeMutation.error instanceof Error
          ? revokeMutation.error.message
          : undefined}
      />
    {/if}
  </SettingsStack>
</EditorDialog>
