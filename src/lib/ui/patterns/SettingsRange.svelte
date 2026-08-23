<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "children" | "type"> & {
    labels?: Snippet;
  };

  let { labels, ...attributes }: Props = $props();
</script>

<div data-ui="settings-range">
  <input {...attributes} type="range" data-part="control" />
  {#if labels}
    <div data-part="labels" aria-hidden="true">{@render labels()}</div>
  {/if}
</div>
