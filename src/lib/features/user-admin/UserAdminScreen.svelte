<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { BrukerRespons, RolleType } from "$lib/contracts";
  import { harHandling, Kapabiliteter } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
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
    PageStatus,
  } from "$lib/ui";
  import BlockUserDialog from "./BlockUserDialog.svelte";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import EditUserDialog from "./EditUserDialog.svelte";
  import {
    createUserFilters,
    filterAndSortUsers,
    MEMBERSHIP_OPTIONS,
    ROLE_OPTIONS,
    SORT_OPTIONS,
    type MembershipFilter,
    type UserSort,
  } from "./model";
  import { adminUsersQueryOptions } from "./queries";
  import UserBlockHistoryDialog from "./UserBlockHistoryDialog.svelte";
  import UserRow from "./UserRow.svelte";

  let { capabilities, currentUserId }: { capabilities: readonly string[]; currentUserId: string } =
    $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const usersQuery = createQuery(() => adminUsersQueryOptions(api, tenant.slug));
  const globalAdmin = $derived(harHandling(capabilities, Kapabiliteter.brukere.admin));
  let filters = $state(createUserFilters());
  let visibleLimit = $state(20);
  let expandedUserId = $state("");
  let editingUser = $state<BrukerRespons | null>(null);
  let blockingUser = $state<BrukerRespons | null>(null);
  let deletingUser = $state<BrukerRespons | null>(null);
  let historyUser = $state<BrukerRespons | null>(null);
  const filteredUsers = $derived(filterAndSortUsers(usersQuery.data ?? [], filters));
  const visibleUsers = $derived(filteredUsers.slice(0, visibleLimit));
  const remainingCount = $derived(Math.max(0, filteredUsers.length - visibleUsers.length));
  const followUpCount = $derived(
    filteredUsers.filter((user) => user.erSperret || user.måBekrefteMedlemskap).length
  );
  const hasActiveFilters = $derived(
    Boolean(
      filters.query.trim() ||
      filters.showDeleted ||
      filters.roles.length ||
      filters.memberships.length
    )
  );

  function updateFilters(update: Partial<typeof filters>) {
    filters = { ...filters, ...update };
    visibleLimit = 20;
    expandedUserId = "";
  }

  function toggleRole(role: RolleType) {
    updateFilters({
      roles: filters.roles.includes(role)
        ? filters.roles.filter((candidate) => candidate !== role)
        : [...filters.roles, role],
    });
  }

  function toggleMembership(membership: MembershipFilter) {
    updateFilters({
      memberships: filters.memberships.includes(membership)
        ? filters.memberships.filter((candidate) => candidate !== membership)
        : [...filters.memberships, membership],
    });
  }

  function resetFilters() {
    filters = createUserFilters();
    visibleLimit = 20;
    expandedUserId = "";
  }
</script>

{#snippet filtersContent()}
  <CollectionControls
    label="Filtrer brukere"
    search={{
      label: "Søk etter bruker",
      placeholder: "Søk på navn eller e-post",
      value: filters.query,
      onValueChange: (query) => updateFilters({ query }),
    }}
    groups={[
      {
        label: "Rolle",
        options: ROLE_OPTIONS,
        selectedValues: filters.roles,
        onSelect: (role) => toggleRole(role as RolleType),
      },
      {
        label: "Medlemskap",
        options: MEMBERSHIP_OPTIONS,
        selectedValues: filters.memberships,
        onSelect: (membership) => toggleMembership(membership as MembershipFilter),
      },
    ]}
    sort={{
      label: "Sorter etter",
      value: filters.sort,
      options: SORT_OPTIONS,
      onValueChange: (sort) => updateFilters({ sort: sort as UserSort }),
    }}
    onReset={resetFilters}
    disabled={usersQuery.isFetching}
  />
{/snippet}

{#snippet followUpNotice()}
  <PageStatus tone="warning" label={`${followUpCount} trenger oppfølging`} />
{/snippet}

{#snippet resetAction()}
  <Button variant="secondary" onclick={resetFilters}>Nullstill filtre</Button>
{/snippet}

{#snippet footer()}
  <Button variant="secondary" size="small" onclick={() => (visibleLimit += 20)}>
    Vis flere ({remainingCount} gjenstår)
  </Button>
{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Brukere"
  description="Følg opp medlemskap, roller og tilgang til klubben."
>
  <Collection
    title={usersQuery.isPending
      ? "Laster brukere …"
      : `${filteredUsers.length} ${filteredUsers.length === 1 ? "bruker" : "brukere"}`}
    scope="Medlemskap, roller og tilgang"
    notice={!usersQuery.isPending && followUpCount > 0 ? followUpNotice : undefined}
    toggle={{
      title: "Vis slettede",
      checked: filters.showDeleted,
      onCheckedChange: (showDeleted) => updateFilters({ showDeleted }),
      disabled: usersQuery.isPending,
      pending: usersQuery.isFetching && !usersQuery.isPending,
    }}
    filters={filtersContent}
    filtersLabel="Brukerfiltre"
    footer={remainingCount > 0 ? footer : undefined}
    busy={usersQuery.isFetching}
  >
    {#if usersQuery.isPending}
      <CollectionLoading label="Laster brukere" rows={6} />
    {:else if usersQuery.isError}
      <CollectionError
        title="Kunne ikke laste brukerne"
        description={usersQuery.error instanceof Error ? usersQuery.error.message : undefined}
        isRetrying={usersQuery.isFetching}
        onRetry={() => void usersQuery.refetch()}
      />
    {:else if filteredUsers.length === 0}
      <CollectionEmpty
        title={hasActiveFilters ? "Ingen brukere funnet" : "Ingen brukere ennå"}
        description={hasActiveFilters
          ? "Prøv et annet søk eller fjern noen av filtrene."
          : "Klubben har ingen registrerte brukere."}
        action={hasActiveFilters ? resetAction : undefined}
      />
    {:else}
      <CollectionList label="Brukere" bind:value={expandedUserId}>
        {#each visibleUsers as user (user.id)}
          <UserRow
            {user}
            {currentUserId}
            {globalAdmin}
            onEdit={() => (editingUser = user)}
            onBlock={() => (blockingUser = user)}
            onDelete={() => (deletingUser = user)}
            onOpenHistory={() => (historyUser = user)}
          />
        {/each}
      </CollectionList>
    {/if}
  </Collection>
</Page>

{#if editingUser}
  <EditUserDialog user={editingUser} onClose={() => (editingUser = null)} />
{/if}
{#if blockingUser}
  <BlockUserDialog user={blockingUser} onClose={() => (blockingUser = null)} />
{/if}
{#if deletingUser}
  <DeleteUserDialog user={deletingUser} onClose={() => (deletingUser = null)} />
{/if}
{#if historyUser}
  <UserBlockHistoryDialog user={historyUser} onClose={() => (historyUser = null)} />
{/if}
