<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type CollectionRowInteraction =
    | { type: "static" }
    | { type: "open"; onOpen: () => void }
    | { type: "action"; action: Snippet };

  export type CollectionRowLayout = "entity" | "schedule";
</script>

<script lang="ts">
  import CollectionStatus, { type CollectionRowStatus } from "./CollectionStatus.svelte";

  type Props = {
    ariaLabel?: string;
    category?: CollectionRowStatus;
    description?: string;
    disabled?: boolean;
    interaction?: CollectionRowInteraction;
    layout?: CollectionRowLayout;
    leading?: Snippet;
    meta?: string;
    muted?: boolean;
    status?: CollectionRowStatus;
    title: string;
  };

  let {
    ariaLabel,
    category,
    description,
    disabled = false,
    interaction = { type: "static" },
    layout = "entity",
    leading,
    meta,
    muted = false,
    status,
    title,
  }: Props = $props();

  const titleStatus = $derived(layout === "entity" ? status : undefined);
  const layoutStatus = $derived(layout === "schedule" ? status : undefined);
</script>

{#snippet summary()}
  <span
    data-part="summary"
    data-layout={layout}
    data-has-leading={leading ? "true" : undefined}
    data-has-status={status ? "true" : undefined}
  >
    {#if leading}<span data-part="leading">{@render leading()}</span>{/if}

    <span data-part="content">
      <span data-part="title">
        {#if category}<CollectionStatus {...category} />{/if}
        <span data-part="title-text">{title}</span>
        {#if titleStatus}<CollectionStatus {...titleStatus} />{/if}
      </span>
      {#if description}<span data-part="description">{description}</span>{/if}
      {#if meta}<span data-part="meta">{meta}</span>{/if}
    </span>

    {#if layoutStatus}<CollectionStatus {...layoutStatus} />{/if}
  </span>
{/snippet}

<div
  data-ui="collection-row"
  data-interaction={interaction.type}
  data-muted={muted || undefined}
  role="listitem"
>
  {#if interaction.type === "open"}
    <button
      type="button"
      data-part="surface"
      aria-label={ariaLabel ?? `Åpne ${title}`}
      onclick={interaction.onOpen}
      {disabled}
    >
      {@render summary()}
      <span data-part="indicator" aria-hidden="true">›</span>
    </button>
  {:else}
    <article data-part="surface">
      {@render summary()}
      {#if interaction.type === "action"}
        <div data-part="action">{@render interaction.action()}</div>
      {/if}
    </article>
  {/if}
</div>
