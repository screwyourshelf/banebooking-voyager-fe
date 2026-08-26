<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { formatDatoKort } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    CollectionRow,
    Page,
  } from "$lib/ui";
  import AnnouncementDetailsDialog from "./AnnouncementDetailsDialog.svelte";
  import AnnouncementEditorDialog from "./AnnouncementEditorDialog.svelte";
  import { confirmationProgress } from "./model";
  import { activeAnnouncementQueryOptions } from "./queries";

  const api = getApiClient();
  const tenant = getTenantContext();
  const announcementQuery = createQuery(() => activeAnnouncementQueryOptions(api, tenant.slug));
  let createOpen = $state(false);
  let detailsOpen = $state(false);

  const activeAnnouncement = $derived(announcementQuery.data ?? null);
</script>

{#snippet createAction()}
  <Button
    onclick={() => (createOpen = true)}
    disabled={announcementQuery.isPending || announcementQuery.isError}
  >
    Ny kunngjøring
  </Button>
{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Kunngjøringer"
  description="Styr informasjon som må leses og bekreftes før brukerne går videre."
  actions={!activeAnnouncement ? createAction : undefined}
>
  <Collection
    title={announcementQuery.isPending
      ? "Laster kunngjøringer …"
      : activeAnnouncement
        ? "1 kunngjøring"
        : "Ingen kunngjøring"}
    scope="Krever bekreftelse"
    busy={announcementQuery.isFetching}
  >
    {#if announcementQuery.isPending}
      <CollectionLoading label="Laster kunngjøringer" rows={1} />
    {:else if announcementQuery.isError}
      <CollectionError
        title="Kunne ikke laste kunngjøringer"
        description={announcementQuery.error instanceof Error
          ? announcementQuery.error.message
          : undefined}
        isRetrying={announcementQuery.isFetching}
        onRetry={() => void announcementQuery.refetch()}
      />
    {:else if !activeAnnouncement}
      <CollectionEmpty
        title="Klar for neste beskjed"
        description="Opprett en kunngjøring når alle brukere må lese viktig informasjon."
      />
    {:else}
      <CollectionList label="Aktive kunngjøringer">
        <CollectionRow
          title={activeAnnouncement.tittel}
          description={confirmationProgress(
            activeAnnouncement.antallBekreftelser,
            activeAnnouncement.antallMålgruppe
          )}
          meta={`Utløper ${formatDatoKort(activeAnnouncement.utløperTidspunkt)}`}
          status={{ label: "Aktiv", tone: "available" }}
          interaction={{ type: "open", onOpen: () => (detailsOpen = true) }}
        />
      </CollectionList>
    {/if}
  </Collection>
</Page>

{#if createOpen}
  <AnnouncementEditorDialog onClose={() => (createOpen = false)} />
{/if}

{#if detailsOpen && activeAnnouncement}
  <AnnouncementDetailsDialog
    announcement={activeAnnouncement}
    onClose={() => (detailsOpen = false)}
  />
{/if}
