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
  const surfaceDelegatesSpacing = $derived(
    interaction.type === "expand" || interaction.type === "reorder"
  );
  const surfaceOwnsSummaryLayout = $derived(
    interaction.type === "static" || interaction.type === "open" || interaction.type === "action"
  );
</script>

{#snippet summary()}
  <span
    class={[
      surfaceOwnsSummaryLayout && "grid min-w-0 flex-1 grid-cols-1 items-center gap-md",
      surfaceOwnsSummaryLayout &&
        !(layout === "schedule" && leading) &&
        "collection-wide:gap-collection-row-summary-wide",
      surfaceOwnsSummaryLayout && leading && "grid-cols-collection-row-leading",
      surfaceOwnsSummaryLayout &&
        layout === "schedule" &&
        leading &&
        "grid-cols-collection-row-schedule grid-rows-collection-row-schedule gap-x-md gap-y-collection-row-copy",
      surfaceOwnsSummaryLayout &&
        layout === "schedule" &&
        "collection-row-schedule-status:row-start-1 collection-row-schedule-status:col-start-2 collection-row-schedule-status:justify-self-start",
    ]}
    data-part="summary"
    data-layout={layout}
    data-has-leading={leading ? "true" : undefined}
    data-has-status={status ? "true" : undefined}
  >
    {#if leading}
      <span
        class={[
          surfaceOwnsSummaryLayout && "flex min-w-0 items-center",
          surfaceOwnsSummaryLayout &&
            layout === "schedule" &&
            "row-start-1 row-span-2 col-start-1 self-center",
          surfaceOwnsSummaryLayout && layout === "schedule" && !status && "row-start-1",
        ]}
        data-part="leading">{@render leading()}</span
      >
    {/if}

    {#if title || category || titleStatus || description || meta}
      <span
        class={[
          surfaceOwnsSummaryLayout && "flex min-w-0 flex-col",
          surfaceOwnsSummaryLayout && layout === "schedule" && "row-start-2 col-start-2",
          surfaceOwnsSummaryLayout && layout === "schedule" && !status && "row-start-1",
        ]}
        data-part="content"
      >
        {#if title || category || titleStatus}
          <span
            class={surfaceOwnsSummaryLayout
              ? "flex overflow-hidden min-w-0 items-center gap-collection-control-detail text-ink text-body font-collection-row-title leading-collection-row-copy whitespace-nowrap"
              : ""}
            data-part="title"
          >
            {#if category}<CollectionStatus {...category} />{/if}
            {#if title}
              <span
                class={surfaceOwnsSummaryLayout
                  ? "overflow-hidden min-w-0 text-ellipsis whitespace-nowrap"
                  : ""}
                data-part="title-text">{title}</span
              >
            {/if}
            {#if titleStatus}<CollectionStatus {...titleStatus} />{/if}
          </span>
        {/if}
        {#if description}
          <span
            class={surfaceOwnsSummaryLayout
              ? "overflow-hidden min-w-0 mt-collection-row-description text-ink-soft text-body-sm font-collection-row-description leading-collection-row-copy text-ellipsis whitespace-nowrap"
              : ""}
            data-part="description">{description}</span
          >
        {/if}
        {#if meta}
          <span
            class={surfaceOwnsSummaryLayout
              ? "overflow-hidden min-w-0 mt-collection-row-meta text-ink-faint text-caption font-collection-row-meta leading-collection-row-copy text-ellipsis whitespace-nowrap"
              : ""}
            data-part="meta">{meta}</span
          >
        {/if}
      </span>
    {/if}

    {#if layoutStatus}<CollectionStatus {...layoutStatus} />{/if}
  </span>
{/snippet}

<div
  class={[
    "min-w-0 collection-row-surface:w-full collection-row-surface:min-w-0 collection-row-surface:min-h-collection-row collection-row-surface:border collection-row-surface:border-line collection-row-surface:rounded-record collection-row-surface:bg-surface-raised collection-row-surface:text-ink collection-row-surface:shadow-record collection-row-surface:text-left collection-row-button-surface:cursor-pointer collection-row-button-surface:enabled:hover:border-line-strong collection-row-button-surface:enabled:hover:bg-surface-subtle collection-row-button-surface:focus-visible:outline-3 collection-row-button-surface:focus-visible:outline-focus-outline collection-row-button-surface:focus-visible:outline-offset-2 collection-row-button-surface:disabled:cursor-not-allowed collection-row-button-surface:disabled:opacity-collection-row-disabled collection-wide:collection-row-surface:min-h-collection-row-wide collection-wide:collection-row-surface:border-x-0 collection-wide:collection-row-surface:border-t-0 collection-wide:collection-row-surface:rounded-none collection-wide:collection-row-surface:shadow-none",
    !surfaceDelegatesSpacing &&
      "collection-row-surface:flex collection-row-surface:items-stretch collection-row-surface:gap-md collection-row-surface:px-md collection-row-surface:py-collection-row-block collection-wide:collection-row-surface:px-xl collection-wide:collection-row-surface:py-sm",
    muted &&
      "collection-row-surface:bg-collection-row-muted-surface collection-row-surface:shadow-none",
    interaction.type === "expand" &&
      "collection-row-surface:block collection-row-surface:overflow-hidden collection-row-surface:p-0 collection-row-summary-row:flex collection-row-summary-row:min-w-0 collection-row-summary-row:items-stretch collection-row-trigger-header:flex collection-row-trigger-header:min-w-0 collection-row-trigger-header:flex-1 collection-row-trigger:flex collection-row-trigger:w-full collection-row-trigger:min-w-0 collection-row-trigger:min-h-collection-row-trigger collection-row-trigger:items-center collection-row-trigger:gap-md collection-row-trigger:border-0 collection-row-trigger:bg-transparent collection-row-trigger:px-md collection-row-trigger:py-collection-row-block collection-row-trigger:text-ink collection-row-trigger:text-left collection-row-trigger:enabled:hover:bg-surface-subtle collection-row-trigger:focus-visible:z-10 collection-row-trigger:focus-visible:outline-3 collection-row-trigger:focus-visible:outline-focus-outline collection-row-trigger:focus-visible:outline-offset-collection-inset collection-row-trigger:disabled:cursor-not-allowed collection-row-trigger:disabled:opacity-collection-row-disabled collection-row-trigger-indicator:grid collection-row-trigger-indicator:size-collection-row-trigger-indicator collection-row-trigger-indicator:flex-none collection-row-trigger-indicator:place-items-center collection-row-trigger-indicator:text-ink-faint collection-row-trigger-indicator:transition-transform collection-row-trigger-indicator:duration-160 collection-row-trigger-indicator:ease-collection collection-row-summary-action:flex collection-row-summary-action:flex-none collection-row-summary-action:items-center collection-row-summary-action:pr-md collection-row-details:border-t collection-row-details:border-line collection-row-details:bg-surface-subtle collection-wide:collection-row-surface:p-0 collection-wide:collection-row-trigger:min-h-collection-row-wide collection-wide:collection-row-trigger:px-xl collection-wide:collection-row-trigger:py-sm collection-wide:collection-row-summary-action:pr-xl",
    interaction.type === "reorder" &&
      "collection-row-surface:flex collection-row-surface:items-stretch collection-row-surface:overflow-hidden collection-row-surface:gap-0 collection-row-surface:p-0 collection-wide:collection-row-surface:p-0",
  ]}
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
        <div
          class="grid gap-lg p-collection-row-details collection-wide:px-xl collection-wide:py-lg"
          data-part="details-content"
        >
          {#if interaction.details}{@render interaction.details()}{/if}
          {#if interaction.actions}
            <div class="flex flex-wrap justify-end gap-sm" data-part="actions">
              {@render interaction.actions()}
            </div>
          {/if}
        </div>
      {/snippet}
    </AccordionRowPrimitive>
  {:else if interaction.type === "reorder"}
    <article data-part="surface">
      <button
        class="flex min-w-0 flex-1 items-center gap-md border-0 bg-transparent px-md py-collection-row-block text-ink text-left enabled:hover:bg-surface-subtle focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-collection-inset disabled:cursor-not-allowed disabled:opacity-collection-row-disabled collection-wide:min-h-collection-row-wide collection-wide:px-xl collection-wide:py-sm"
        type="button"
        data-part="select"
        aria-label={ariaLabel ?? (title ? `Åpne ${title}` : "Åpne rad")}
        onclick={interaction.onOpen}
        disabled={isDisabled}
      >
        {@render summary()}
        <span data-part="indicator" aria-hidden="true">›</span>
      </button>
      <div
        class="grid flex-none content-center gap-2xs border-l border-line p-xs collection-reorder-control:text-ink-soft"
        data-part="actions"
        role="group"
        aria-label={`Rekkefølge for ${title ?? "rad"}`}
      >
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
      <span
        class="grid flex-none self-center place-items-center text-ink-faint text-collection-row-indicator leading-collection-status"
        data-part="indicator"
        aria-hidden="true">›</span
      >
    </button>
  {:else}
    <article data-part="surface">
      {@render summary()}
      {#if interaction.type === "action"}
        <div class="flex flex-none items-center collection-wide:pl-sm" data-part="action">
          {@render interaction.action()}
        </div>
      {/if}
    </article>
  {/if}
</div>
