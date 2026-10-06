<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { BrukerRespons } from "$lib/contracts";
  import {
    filterBookingsByActivity,
    formaterDatoGruppe,
    getBookingActivityOptions,
    groupBookingsByDate,
    harHandling,
    Kapabiliteter,
    sortBookingsByRelevance,
  } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionError,
    CollectionGroup,
    CollectionList,
    CollectionLoading,
    EditorDialog,
    ScheduleRow,
  } from "$lib/ui";
  import { getUserDisplayName } from "./model";
  import { userBookingsQueryOptions } from "./queries";

  let { user, onClose }: { user: BrukerRespons; onClose: () => void } = $props();
  const api = getApiClient();
  const tenant = getTenantContext();
  const canView = $derived(harHandling(user.kapabiliteter, Kapabiliteter.brukere.seBookinger));
  const bookingsQuery = createQuery(() =>
    userBookingsQueryOptions(api, tenant.slug, user.id, canView)
  );
  let open = $state(true);
  let includeHistorical = $state(true);
  let selectedActivityIds = $state<string[]>([]);
  let visibleCount = $state(10);
  const sortedBookings = $derived(sortBookingsByRelevance(bookingsQuery.data ?? []));
  const relevantBookings = $derived(
    sortedBookings.filter((booking) => includeHistorical || !booking.erPassert)
  );
  const activityOptions = $derived(getBookingActivityOptions(relevantBookings));
  const filteredBookings = $derived(
    filterBookingsByActivity(relevantBookings, selectedActivityIds)
  );
  const groups = $derived(groupBookingsByDate(filteredBookings.slice(0, visibleCount)));
  const remainingCount = $derived(Math.max(0, filteredBookings.length - visibleCount));
  const displayName = $derived(getUserDisplayName(user));

  function toggleHistorical(value: boolean) {
    includeHistorical = value;
    selectedActivityIds = [];
    visibleCount = 10;
  }

  function toggleActivity(id: string) {
    selectedActivityIds = selectedActivityIds.includes(id)
      ? selectedActivityIds.filter((selected) => selected !== id)
      : [...selectedActivityIds, id];
    visibleCount = 10;
  }

  function resetFilters() {
    selectedActivityIds = [];
    visibleCount = 10;
  }
</script>

{#snippet filters()}
  <CollectionControls
    label="Filtrer bookinger"
    groups={[
      {
        label: "Gren",
        options: activityOptions,
        selectedValues: selectedActivityIds,
        onSelect: toggleActivity,
      },
    ]}
    onReset={resetFilters}
    disabled={bookingsQuery.isFetching}
  />
{/snippet}

{#snippet resetAction()}
  <Button variant="secondary" onclick={resetFilters}>Nullstill filter</Button>
{/snippet}

{#snippet footer()}
  <Button variant="secondary" onclick={() => (visibleCount += 10)}
    >Vis flere ({remainingCount} gjenstår)</Button
  >
{/snippet}

<EditorDialog
  bind:open
  {onClose}
  backLabel="Til brukeren"
  eyebrow="Brukeradministrasjon"
  title="Bookinger"
  description={displayName === user.epost ? user.epost : `${displayName} · ${user.epost}`}
>
  {#if canView}
    <Collection
      title={bookingsQuery.isPending
        ? "Laster bookinger …"
        : `${filteredBookings.length} ${filteredBookings.length === 1 ? "booking" : "bookinger"}`}
      scope="Personlige reservasjoner i klubben"
      busy={bookingsQuery.isFetching}
      toggle={{
        title: "Vis tidligere",
        checked: includeHistorical,
        onCheckedChange: toggleHistorical,
        disabled: bookingsQuery.isPending,
      }}
      filters={activityOptions.length > 1 ? filters : undefined}
      filtersLabel="Bookingfiltre"
      footer={remainingCount > 0 ? footer : undefined}
    >
      {#if bookingsQuery.isPending}
        <CollectionLoading label="Laster bookinger" rows={3} layout="schedule" />
      {:else if bookingsQuery.isError}
        <CollectionError
          title="Kunne ikke laste brukerens bookinger"
          description={bookingsQuery.error instanceof Error
            ? bookingsQuery.error.message
            : undefined}
          isRetrying={bookingsQuery.isFetching}
          onRetry={() => void bookingsQuery.refetch()}
        />
      {:else if filteredBookings.length === 0}
        <CollectionEmpty
          title={selectedActivityIds.length
            ? "Ingen bookinger for valgt gren"
            : includeHistorical
              ? "Ingen bookinger ennå"
              : "Ingen kommende bookinger"}
          description="Her vises brukerens personlige reservasjoner i denne klubben."
          action={selectedActivityIds.length ? resetAction : undefined}
        />
      {:else}
        <CollectionList busy={bookingsQuery.isFetching}>
          {#each groups as group (group.bookings[0].bookingId)}
            {@const heading = formaterDatoGruppe(group.date)}
            <CollectionGroup
              date={group.date}
              label={heading.label}
              relativeLabel={heading.relativeLabel ?? undefined}
            >
              {#each group.bookings as booking (booking.bookingId)}
                <ScheduleRow
                  id={booking.bookingId}
                  start={booking.startTid}
                  end={booking.sluttTid}
                  title={booking.baneNavn}
                  description={booking.grenNavn}
                  muted={booking.erPassert}
                />
              {/each}
            </CollectionGroup>
          {/each}
        </CollectionList>
      {/if}
    </Collection>
  {/if}
</EditorDialog>
