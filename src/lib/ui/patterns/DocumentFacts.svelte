<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type DocumentFact = {
    label: string;
    value: string;
  };

  type Props = Omit<HTMLAttributes<HTMLDListElement>, "aria-label" | "children"> & {
    items: readonly DocumentFact[];
    label?: string;
  };

  let { items, label, ...attributes }: Props = $props();
</script>

<dl {...attributes} data-ui="document-facts" aria-label={label}>
  {#each items as item (item.label)}
    <div>
      <dt>{item.label}</dt>
      <dd>{item.value}</dd>
    </div>
  {/each}
</dl>
