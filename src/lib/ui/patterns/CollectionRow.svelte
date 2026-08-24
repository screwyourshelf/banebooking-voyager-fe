<script lang="ts" module>
  import type { Snippet } from "svelte";

  type CollectionRowExpandContent =
    | { details: Snippet; actions?: Snippet }
    | { details?: Snippet; actions: Snippet };

  export type CollectionRowInteraction =
    | { type: "static" }
    | { type: "open"; onOpen: () => void }
    | { type: "action"; action: Snippet }
    | ({ type: "expand"; value: string; summaryAction?: Snippet } & CollectionRowExpandContent)
    | {
        type: "reorder";
        onOpen: () => void;
        onMoveUp: () => void;
        onMoveDown: () => void;
        moveUpDisabled?: boolean;
        moveDownDisabled?: boolean;
      };

  export type CollectionRowLayout = "entity" | "schedule";
</script>

<script lang="ts">
  import { ArrowDown02Icon, ArrowUp02Icon } from "@hugeicons/core-free-icons";
  import AccordionRowPrimitive from "../primitives/AccordionRowPrimitive.svelte";
  import Button from "../primitives/Button.svelte";
  import Icon from "../primitives/Icon.svelte";
  import CollectionStatus, { type CollectionRowStatus } from "./CollectionStatus.svelte";

  type Props = {
    ariaLabel?: string;
    busy?: boolean;
    category?: CollectionRowStatus;
    description?: string;
    disabled?: boolean;
    interaction?: CollectionRowInteraction;
    layout?: CollectionRowLayout;
    leading?: Snippet;
    meta?: string;
    muted?: boolean;
    status?: CollectionRowStatus;
    title?: string;
  };

  let {
    ariaLabel,
    busy = false,
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
  const isDisabled = $derived(disabled || busy);
</script>

{#snippet summary()}
  <span
    data-part="summary"
    data-layout={layout}
    data-has-leading={leading ? "true" : undefined}
    data-has-status={status ? "true" : undefined}
  >
    {#if leading}<span data-part="leading">{@render leading()}</span>{/if}

    {#if title || category || titleStatus || description || meta}
      <span data-part="content">
        {#if title || category || titleStatus}
          <span data-part="title">
            {#if category}<CollectionStatus {...category} />{/if}
            {#if title}<span data-part="title-text">{title}</span>{/if}
            {#if titleStatus}<CollectionStatus {...titleStatus} />{/if}
          </span>
        {/if}
        {#if description}<span data-part="description">{description}</span>{/if}
        {#if meta}<span data-part="meta">{meta}</span>{/if}
      </span>
    {/if}

    {#if layoutStatus}<CollectionStatus {...layoutStatus} />{/if}
  </span>
{/snippet}

<div
  data-ui="collection-row"
  data-interaction={interaction.type}
  data-muted={muted || undefined}
  role="listitem"
  aria-busy={busy || undefined}
>
  {#if interaction.type === "expand"}
    <AccordionRowPrimitive
      value={interaction.value}
      disabled={isDisabled}
      action={interaction.summaryAction}
    >
      {@render summary()}
      {#snippet details()}
        <div data-part="details-content">
          {#if interaction.details}{@render interaction.details()}{/if}
          {#if interaction.actions}
            <div data-part="actions">{@render interaction.actions()}</div>
          {/if}
        </div>
      {/snippet}
    </AccordionRowPrimitive>
  {:else if interaction.type === "reorder"}
    <article data-part="surface">
      <button
        type="button"
        data-part="select"
        aria-label={ariaLabel ?? (title ? `Åpne ${title}` : "Åpne rad")}
        onclick={interaction.onOpen}
        disabled={isDisabled}
      >
        {@render summary()}
        <span data-part="indicator" aria-hidden="true">›</span>
      </button>
      <div data-part="actions" role="group" aria-label={`Rekkefølge for ${title ?? "rad"}`}>
        <Button
          aria-label={`Flytt ${title ?? "rad"} opp`}
          title="Flytt opp"
          variant="ghost"
          size="icon"
          disabled={isDisabled || interaction.moveUpDisabled}
          onclick={interaction.onMoveUp}
        >
          <Icon icon={ArrowUp02Icon} size="button" />
        </Button>
        <Button
          aria-label={`Flytt ${title ?? "rad"} ned`}
          title="Flytt ned"
          variant="ghost"
          size="icon"
          disabled={isDisabled || interaction.moveDownDisabled}
          onclick={interaction.onMoveDown}
        >
          <Icon icon={ArrowDown02Icon} size="button" />
        </Button>
      </div>
    </article>
  {:else if interaction.type === "open"}
    <button
      type="button"
      data-part="surface"
      aria-label={ariaLabel ?? (title ? `Åpne ${title}` : "Åpne rad")}
      onclick={interaction.onOpen}
      disabled={isDisabled}
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
