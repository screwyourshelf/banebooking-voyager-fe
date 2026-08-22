<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "aria-label" | "children"> & {
    children?: Snippet;
    label?: string;
  };

  let { children, label, ...attributes }: Props = $props();
</script>

<article {...attributes} data-ui="document" aria-label={label}>
  {@render children?.()}
</article>
