<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
</script>

<div {...attributes} data-ui="document-intro">
  {@render children?.()}
</div>
