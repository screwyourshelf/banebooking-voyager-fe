<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import { getOptionalNavigationContext } from "./navigation-context";

  type Props = Omit<PublicHtmlAttributes<HTMLAnchorAttributes>, "children"> & {
    logo?: Snippet;
    meta?: string;
    name: string;
  };

  let { logo, meta, name, ...attributes }: Props = $props();

  const navigation = getOptionalNavigationContext();
</script>

<a
  {...attributes}
  class={[
    "inline-flex min-w-0 items-center gap-navigation-item rounded-navigation-item no-underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
    navigation?.surface === "shell" ? "text-sidebar-text" : "text-ink",
  ]}
  data-ui="navigation-identity"
>
  {#if logo}
    <span
      class="grid size-navigation-action-icon flex-none place-items-center overflow-hidden rounded-navigation-item bg-nav-active-surface text-nav-active navigation-logo-media:size-full navigation-logo-media:object-contain"
      data-part="logo"
      aria-hidden="true">{@render logo()}</span
    >
  {/if}
  <span class="grid min-w-0" data-part="intro">
    <span
      class="overflow-hidden text-body font-navigation-identity text-ellipsis whitespace-nowrap"
      data-part="name">{name}</span
    >
    {#if meta}
      <span
        class={[
          "overflow-hidden text-caption text-ellipsis whitespace-nowrap",
          navigation?.surface === "shell" ? "text-control-muted" : "text-ink-soft",
        ]}
        data-part="meta">{meta}</span
      >
    {/if}
  </span>
</a>
