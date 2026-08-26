<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import type { KunngjøringAdminRespons } from "$lib/contracts";
  import { formatDatoKort, formatTidspunktKort } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Document,
    DocumentFacts,
    DocumentIntro,
    EditorDialog,
    Feedback,
    FormActions,
    RichTextContent,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsValue,
  } from "$lib/ui";
  import { confirmationProgress } from "./model";
  import { deactivateAnnouncementMutationOptions } from "./queries";

  let { announcement, onClose }: { announcement: KunngjøringAdminRespons; onClose: () => void } =
    $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() =>
    deactivateAnnouncementMutationOptions(api, queryClient, tenant.slug)
  );
  let open = $state(true);

  function close() {
    open = false;
    onClose();
  }

  async function deactivate() {
    try {
      await mutation.mutateAsync(announcement.id);
      close();
    } catch {
      // Den normaliserte mutationfeilen beholdes i dialogen.
    }
  }
</script>

<EditorDialog
  bind:open
  pending={mutation.isPending}
  {onClose}
  backLabel="Alle kunngjøringer"
  eyebrow="Aktiv kunngjøring"
  title={announcement.tittel}
  description={`Publisert ${formatDatoKort(announcement.opprettetTidspunkt)}`}
>
  <SettingsStack embedded>
    <SettingsSection
      embedded
      eyebrow="Kunngjøring"
      title="Publisert innhold"
      description={`Aktiv til ${formatDatoKort(announcement.utløperTidspunkt)}.`}
    >
      <Document label="Publisert kunngjøring">
        <DocumentIntro><RichTextContent value={announcement.tekst} /></DocumentIntro>
        <DocumentFacts
          items={[
            { label: "Status", value: "Aktiv" },
            { label: "Utløper", value: formatDatoKort(announcement.utløperTidspunkt) },
            {
              label: "Bekreftet",
              value: confirmationProgress(
                announcement.antallBekreftelser,
                announcement.antallMålgruppe
              ),
            },
          ]}
        />
      </Document>
    </SettingsSection>

    <SettingsSection
      embedded
      eyebrow="Målgruppe"
      title="Bekreftelser"
      description="Brukere som har lest og bekreftet kunngjøringen."
    >
      {#if announcement.bekreftelser.length === 0}
        <Feedback
          tone="info"
          title="Ingen bekreftelser ennå"
          description="Bekreftelser vises her etter hvert som brukerne leser kunngjøringen."
        />
      {:else}
        <SettingsPanel>
          {#each announcement.bekreftelser as confirmation (confirmation.epost)}
            <SettingsRow title={confirmation.visningsnavn} description={confirmation.epost}>
              <SettingsValue>{formatTidspunktKort(confirmation.bekreftetTidspunkt)}</SettingsValue>
            </SettingsRow>
          {/each}
        </SettingsPanel>
      {/if}
    </SettingsSection>

    <SettingsSection
      embedded
      eyebrow="Fareområde"
      title="Deaktiver kunngjøring"
      description="Brukere som ikke har bekreftet, blir ikke lenger blokkert."
      tone="danger"
    >
      <FormActions align="start">
        {#if mutation.isError}
          <Feedback
            tone="danger"
            title="Kunngjøringen kunne ikke deaktiveres"
            description={mutation.error instanceof Error ? mutation.error.message : "Prøv igjen."}
          />
        {/if}
        <Button
          variant="destructive"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending || undefined}
          onclick={() => void deactivate()}
        >
          {mutation.isPending ? "Deaktiverer …" : "Deaktiver kunngjøring"}
        </Button>
      </FormActions>
    </SettingsSection>
  </SettingsStack>
</EditorDialog>
