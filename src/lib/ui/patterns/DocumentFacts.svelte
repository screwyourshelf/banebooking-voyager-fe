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

<dl
  {...attributes}
  class="grid grid-cols-document-facts gap-sm m-0"
  data-ui="document-facts"
  aria-label={label}
>
  {#each items as item (item.label)}
    <div
      class="grid content-start gap-xs border border-line rounded-document-fact bg-surface-subtle p-md"
    >
      <dt
        class="text-ink-faint text-caption font-document-fact-label tracking-document-fact-label uppercase"
      >
        {item.label}
      </dt>
      <dd class="m-0 text-ink text-body-sm font-document-fact-value leading-document-fact-value">
        {item.value}
      </dd>
    </div>
  {/each}
</dl>
