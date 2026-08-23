<script lang="ts">
  import { News01Icon } from "@hugeicons/core-free-icons";
  import { createQuery } from "@tanstack/svelte-query";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    Collection,
    CollectionEmpty,
    CollectionError,
    CollectionList,
    CollectionLoading,
    Icon,
    Page,
  } from "$lib/ui";
  import NewsRow from "./NewsRow.svelte";
  import { NEWS_PAGE_SIZE } from "./model";
  import { newsQueryOptions } from "./queries";

  const api = getApiClient();
  const tenant = getTenantContext();
  let visibleCount = $state(NEWS_PAGE_SIZE);
  const newsQuery = createQuery(() => newsQueryOptions(api, tenant.slug));
  const feed = $derived(newsQuery.data ?? []);
  const visibleNews = $derived(feed.slice(0, visibleCount));
  const remainingCount = $derived(Math.max(0, feed.length - visibleCount));
  const countLabel = $derived(
    newsQuery.isPending
      ? "Laster nyheter …"
      : `${feed.length} ${feed.length === 1 ? "nyhet" : "nyheter"}`
  );
</script>

{#snippet collectionIcon()}
  <Icon icon={News01Icon} />
{/snippet}

{#snippet footer()}
  {#if remainingCount > 0}
    <Button variant="secondary" onclick={() => (visibleCount += NEWS_PAGE_SIZE)}>
      Vis flere ({remainingCount} gjenstår)
    </Button>
  {/if}
{/snippet}

<Page eyebrow="Klubben" title="Nyheter" description="Siste nytt fra klubben.">
  <Collection
    icon={collectionIcon}
    title={countLabel}
    busy={newsQuery.isFetching}
    footer={remainingCount > 0 ? footer : undefined}
  >
    {#if newsQuery.isPending}
      <CollectionLoading label="Laster nyheter" rows={4} />
    {:else if newsQuery.isError}
      <CollectionError
        title="Kunne ikke laste nyhetene"
        description={newsQuery.error instanceof Error
          ? newsQuery.error.message
          : "Prøv igjen om litt."}
        isRetrying={newsQuery.isFetching}
        onRetry={() => void newsQuery.refetch()}
      />
    {:else if feed.length === 0}
      <CollectionEmpty
        title="Ingen nyheter akkurat nå"
        description="Når klubben publiserer noe, vises det her."
      />
    {:else}
      <CollectionList label="Nyheter" busy={newsQuery.isFetching}>
        {#each visibleNews as item, index (`${item.lenke}|${item.tittel}|${item.publisertDato}|${index}`)}
          <NewsRow {item} />
        {/each}
      </CollectionList>
    {/if}
  </Collection>
</Page>
