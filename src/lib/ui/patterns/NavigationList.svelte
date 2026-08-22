<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
</script>

<ul {...attributes} data-ui="navigation-list">
  {@render children?.()}
</ul>
