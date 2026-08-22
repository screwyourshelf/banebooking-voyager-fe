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

<div data-ui="collection-group" role="listitem">
  <h3 id={headingId} data-part="heading">
    <time datetime={date}>
      {#if relativeLabel}<strong>{relativeLabel}</strong>{/if}
      <span>{label}</span>
    </time>
  </h3>
  <div data-part="list" role="list" aria-labelledby={headingId}>{@render children?.()}</div>
</div>
