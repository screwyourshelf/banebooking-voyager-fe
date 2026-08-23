<script lang="ts">
  import type { BrukerRespons } from "$lib/contracts";
  import {
    formaterMedlemskapType,
    formaterRolle,
    formatDatoKort,
    harHandling,
    Kapabiliteter,
  } from "$lib/domain";
  import { Button, CollectionRow, SettingsPanel, SettingsRow, SettingsText } from "$lib/ui";
  import { getPrimaryRole, getUserDisplayName, isDeletedUser } from "./model";

  let {
    currentUserId,
    globalAdmin,
    onBlock,
    onDelete,
    onEdit,
    onOpenHistory,
    user,
  }: {
    currentUserId: string;
    globalAdmin: boolean;
    onBlock: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onOpenHistory: () => void;
    user: BrukerRespons;
  } = $props();

  const deleted = $derived(isDeletedUser(user));
  const isCurrentUser = $derived(user.id === currentUserId);
  const canEdit = $derived(
    globalAdmin &&
      !isCurrentUser &&
      !deleted &&
      (harHandling(user.kapabiliteter, "bruker:endreRolle") ||
        harHandling(user.kapabiliteter, "bruker:endreVisningsnavn"))
  );
  const canBlock = $derived(
    !isCurrentUser && !deleted && harHandling(user.kapabiliteter, Kapabiliteter.brukere.sperr)
  );
  const canDelete = $derived(
    !isCurrentUser && !deleted && harHandling(user.kapabiliteter, Kapabiliteter.brukere.slett)
  );
  const canViewHistory = $derived(harHandling(user.kapabiliteter, Kapabiliteter.brukere.seSperre));
  const displayName = $derived(getUserDisplayName(user));
  const showEmail = $derived(displayName !== user.epost);
  const membershipDescription = $derived(
    user.medlemskapBekreftetDato
      ? `Bekreftet ${formatDatoKort(user.medlemskapBekreftetDato)}`
      : "Ikke bekreftet"
  );
  const createdDescription = $derived(
    user.opprettetTid ? `Opprettet ${formatDatoKort(user.opprettetTid)}` : "Opprettet dato mangler"
  );
</script>

{#snippet details()}
  <SettingsPanel>
    <SettingsRow
      title="Medlemskap"
      description={user.medlemskapType
        ? formaterMedlemskapType(user.medlemskapType)
        : membershipDescription}
    >
      {#if user.medlemskapType && user.medlemskapBekreftetDato}
        <SettingsText>{membershipDescription}</SettingsText>
      {/if}
    </SettingsRow>

    {#if user.fulltNavn?.trim() && user.fulltNavn.trim() !== user.visningsnavn?.trim()}
      <SettingsRow title="Navn i medlemskapet" description={user.fulltNavn} />
    {/if}

    {#if user.antallAktiveSperrer !== undefined}
      <SettingsRow
        title="Sperrehistorikk"
        description={user.antallAktiveSperrer === 0
          ? "Ingen aktive sperrer"
          : `${user.antallAktiveSperrer} aktive sperrer`}
      >
        {#if canViewHistory}
          <Button size="small" variant="ghost" onclick={onOpenHistory}>Vis historikk</Button>
        {/if}
      </SettingsRow>
    {/if}
  </SettingsPanel>
{/snippet}

{#snippet actions()}
  {#if canEdit}<Button size="small" onclick={onEdit}>Rediger</Button>{/if}
  {#if canBlock}
    <Button size="small" variant="destructive" onclick={onBlock}>Sperr</Button>
  {/if}
  {#if canDelete}
    <Button size="small" variant="destructive" onclick={onDelete}>Slett</Button>
  {/if}
{/snippet}

<CollectionRow
  title={displayName || "Ukjent bruker"}
  description={showEmail ? user.epost : undefined}
  meta={`${formaterRolle(getPrimaryRole(user))} · ${createdDescription}`}
  muted={deleted}
  category={isCurrentUser ? { label: "Deg", tone: "own" } : undefined}
  status={deleted
    ? { label: "Slettet", tone: "past" }
    : user.erSperret
      ? { label: "Sperret", tone: "warning" }
      : undefined}
  interaction={{
    type: "expand",
    value: user.id,
    details,
    actions: canEdit || canBlock || canDelete ? actions : undefined,
  }}
/>
