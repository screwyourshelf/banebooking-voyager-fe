<script lang="ts">
  import { CalendarCheckIn01Icon } from "@hugeicons/core-free-icons";
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { MinBookingRespons } from "$lib/contracts";
  import { formaterDatoGruppe } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    ButtonLink,
    Collection,
    CollectionControls,
    CollectionEmpty,
    CollectionError,
    CollectionGroup,
    CollectionList,
    CollectionLoading,
    Feedback,
    Icon,
    Page,
  } from "$lib/ui";
  import MyBookingRow from "./MyBookingRow.svelte";
  import {
    filterBookingsByActivity,
    getBookingActivityOptions,
    groupBookingsByDate,
    sortBookingsByRelevance,
  } from "./model";
  import { cancelMyBookingMutationOptions, myBookingsQueryOptions } from "./queries";

  let { bookingHref }: { bookingHref: string } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  let includeHistorical = $state(false);
  let selectedActivityIds = $state<string[]>([]);
  let visibleCount = $state(10);

  const bookingsQuery = createQuery(() =>
    myBookingsQueryOptions(api, tenant.slug, includeHistorical)
  );
  const cancelMutation = createMutation(() =>
    cancelMyBookingMutationOptions(api, queryClient, tenant.slug)
  );
  const sortedBookings = $derived(sortBookingsByRelevance(bookingsQuery.data ?? []));
  const activityOptions = $derived(getBookingActivityOptions(sortedBookings));
  const filteredBookings = $derived(filterBookingsByActivity(sortedBookings, selectedActivityIds));
  const visibleBookings = $derived(filteredBookings.slice(0, visibleCount));
  const groups = $derived(groupBookingsByDate(visibleBookings));
  const remainingCount = $derived(Math.max(0, filteredBookings.length - visibleCount));
  const hasFilteredEmptyState = $derived(
    sortedBookings.length > 0 && filteredBookings.length === 0
  );
  const countLabel = $derived(
    bookingsQuery.isPending
      ? "Laster bookinger …"
      : `${filteredBookings.length} ${filteredBookings.length === 1 ? "booking" : "bookinger"}`
  );

  function toggleHistorical(value: boolean) {
    includeHistorical = value;
    visibleCount = 10;
    cancelMutation.reset();
  }

  function toggleActivity(activityId: string) {
    selectedActivityIds = selectedActivityIds.includes(activityId)
      ? selectedActivityIds.filter((id) => id !== activityId)
      : [...selectedActivityIds, activityId];
    visibleCount = 10;
  }

  function resetFilters() {
    selectedActivityIds = [];
    visibleCount = 10;
  }

  function cancelBooking(booking: MinBookingRespons) {
    if (!booking.bookingId || cancelMutation.isPending) return;
    cancelMutation.mutate({
      bookingId: booking.bookingId,
      courtId: booking.baneId,
      date: booking.dato.slice(0, 10),
    });
  }
</script>

{#snippet collectionIcon()}
  <Icon icon={CalendarCheckIn01Icon} />
{/snippet}

{#snippet filters()}
  <CollectionControls
    label="Filtrer bookinger"
    groups={activityOptions.length > 1
      ? [
          {
            label: "Gren",
            options: activityOptions,
            selectedValues: selectedActivityIds,
            onSelect: toggleActivity,
          },
        ]
      : []}
    onReset={resetFilters}
    disabled={bookingsQuery.isFetching}
  />
{/snippet}

{#snippet emptyAction()}
  {#if hasFilteredEmptyState}
    <Button variant="secondary" onclick={resetFilters}>Nullstill filter</Button>
  {:else}
    <ButtonLink href={bookingHref} variant="primary">Book en bane</ButtonLink>
  {/if}
{/snippet}

{#snippet footer()}
  {#if remainingCount > 0}
    <Button variant="secondary" onclick={() => (visibleCount += 10)}>
      Vis flere ({remainingCount} gjenstår)
    </Button>
  {/if}
{/snippet}

<Page
  eyebrow="Min konto"
  title="Mine bookinger"
  description="Hold oversikt over kommende og gjennomførte tider."
>
  <Collection
    icon={collectionIcon}
    title={countLabel}
    scope="Dine reservasjoner"
    busy={bookingsQuery.isFetching || cancelMutation.isPending}
    toggle={{
      title: "Vis tidligere",
      checked: includeHistorical,
      onCheckedChange: toggleHistorical,
      pending: bookingsQuery.isFetching,
    }}
    filters={activityOptions.length > 1 ? filters : undefined}
    filtersLabel="Bookingfiltre"
    footer={remainingCount > 0 ? footer : undefined}
  >
    {#if cancelMutation.isError}
      <Feedback
        tone="danger"
        title="Kunne ikke avbestille"
        description={cancelMutation.error instanceof Error
          ? cancelMutation.error.message
          : "Avbestillingen kunne ikke gjennomføres."}
      />
    {/if}

    {#if bookingsQuery.isPending}
      <CollectionLoading label="Laster bookinger" rows={3} layout="schedule" />
    {:else if bookingsQuery.isError}
      <CollectionError
        title="Kunne ikke laste bookingene dine"
        description={bookingsQuery.error instanceof Error
          ? bookingsQuery.error.message
          : "Prøv igjen om litt."}
        isRetrying={bookingsQuery.isFetching}
        onRetry={() => void bookingsQuery.refetch()}
      />
    {:else if filteredBookings.length === 0}
      <CollectionEmpty
        title={hasFilteredEmptyState
          ? "Ingen bookinger for valgt gren"
          : includeHistorical
            ? "Ingen bookinger ennå"
            : "Ingen kommende bookinger"}
        description={hasFilteredEmptyState
          ? "Velg en annen gren eller nullstill filteret."
          : includeHistorical
            ? "Når du booker en bane, vises kommende og gjennomførte tider her."
            : "Finn en ledig tid som passer, så dukker den opp her med en gang."}
        action={emptyAction}
      />
    {:else}
      <CollectionList busy={bookingsQuery.isFetching || cancelMutation.isPending}>
        {#each groups as group (group.date)}
          {@const heading = formaterDatoGruppe(group.date)}
          <CollectionGroup
            date={group.date}
            label={heading.label}
            relativeLabel={heading.relativeLabel ?? undefined}
          >
            {#each group.bookings as booking (booking.bookingId)}
              <MyBookingRow {booking} busy={cancelMutation.isPending} onCancel={cancelBooking} />
            {/each}
          </CollectionGroup>
        {/each}
      </CollectionList>
    {/if}
  </Collection>
</Page>
