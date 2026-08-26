<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
    date: string;
    label: string;
    relativeLabel?: string;
  };

  let { children, date, label, relativeLabel }: Props = $props();
  const headingId = $props.id();
</script>

<div
  class="grid min-w-0 gap-sm collection-group-following:mt-lg"
  data-ui="collection-group"
  role="listitem"
>
  <h3
    class="px-lg pt-md pb-0 text-ink-soft text-label font-collection-group leading-collection-group collection-wide:px-xl"
    id={headingId}
    data-part="heading"
  >
    <time class="flex flex-wrap items-baseline gap-sm" datetime={date}>
      {#if relativeLabel}
        <strong class="text-accent font-collection-group-relative">{relativeLabel}</strong>
      {/if}
      <span>{label}</span>
    </time>
  </h3>
  <div
    class="grid min-w-0 gap-record-gap p-record-inline collection-list-last-surface:collection-wide:border-b-0 collection-wide:gap-0 collection-wide:p-0"
    data-part="list"
    role="list"
    aria-labelledby={headingId}
  >
    {@render children?.()}
  </div>
</div>
