<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
</script>

<div {...attributes} data-ui="settings-panel">
  <div data-ui="row-list" data-divided="true" data-density="compact">
    {@render children?.()}
  </div>
</div>
