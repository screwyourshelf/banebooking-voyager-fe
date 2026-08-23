<script lang="ts">
  import type { FeedItemRespons } from "$lib/contracts";
  import { ButtonLink, CollectionRow } from "$lib/ui";
  import { formatNewsDate, safeExternalNewsUrl, textFromNewsContent } from "./model";

  let { item }: { item: FeedItemRespons } = $props();

  const publishedDate = $derived(formatNewsDate(item.publisertDato));
  const summary = $derived(textFromNewsContent(item.innhold));
  const externalUrl = $derived(safeExternalNewsUrl(item.lenke));
</script>

{#snippet externalAction()}
  <ButtonLink
    href={externalUrl ?? undefined}
    target="_blank"
    rel="noopener noreferrer"
    size="small"
  >
    Les mer
  </ButtonLink>
{/snippet}

<CollectionRow
  meta={publishedDate ?? "Fra klubben"}
  title={item.tittel}
  description={summary || undefined}
  interaction={externalUrl ? { type: "action", action: externalAction } : { type: "static" }}
/>
