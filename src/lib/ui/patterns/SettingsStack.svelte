<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: Snippet;
    embedded?: boolean;
  };

  let { children, embedded = false, ...attributes }: Props = $props();
</script>

<div {...attributes} data-ui="settings-stack" data-embedded={embedded || undefined}>
  {@render children?.()}
</div>
