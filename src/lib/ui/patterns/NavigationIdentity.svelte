<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "children"> & {
    logo?: Snippet;
    meta?: string;
    name: string;
  };

  let { logo, meta, name, ...attributes }: Props = $props();
</script>

<a {...attributes} data-ui="navigation-identity">
  {#if logo}<span data-part="logo" aria-hidden="true">{@render logo()}</span>{/if}
  <span data-part="intro">
    <span data-part="name">{name}</span>
    {#if meta}<span data-part="meta">{meta}</span>{/if}
  </span>
</a>
