<script lang="ts" module>
  export type CollectionToggleControl = {
    checked: boolean;
    description?: string;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
    pending?: boolean;
    title: string;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import { setCollectionContext } from "./collection-context";
  import CollectionToggle from "./CollectionToggle.svelte";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLElement>>, "children" | "title"> & {
    busy?: boolean;
    children?: Snippet;
    contextAction?: Snippet;
    embedded?: boolean;
    filters?: Snippet;
    filtersLabel?: string;
    footer?: Snippet;
    icon?: Snippet;
    notice?: Snippet;
    scope?: string;
    title: string;
    toggle?: CollectionToggleControl;
  };

  let {
    busy = false,
    children,
    contextAction,
    embedded = false,
    filters,
    filtersLabel = "Filtre",
    footer,
    icon,
    notice,
    scope,
    title,
    toggle,
    ...attributes
  }: Props = $props();

  setCollectionContext({
    get embedded() {
      return embedded;
    },
  });
  const headingId = $props.id();
</script>

<section
  {...attributes}
  class={[
    "@container overflow-hidden text-ink",
    embedded
      ? "border-0 rounded-none bg-surface shadow-none"
      : "border border-line rounded-collection bg-surface-raised shadow-surface-md",
  ]}
  data-ui="collection"
  data-embedded={embedded || undefined}
  aria-labelledby={headingId}
  aria-busy={busy || undefined}
>
  <header
    class={[
      "flex min-h-collection-header items-center justify-between gap-md border-b px-collection-header-inline py-md collection-wide:min-h-collection-header-wide collection-wide:py-collection-header-wide-block",
      embedded
        ? "border-line bg-surface-subtle text-ink collection-wide:px-editor-dialog-wide-inline"
        : "border-collection-control-divider bg-collection-control text-control-text collection-wide:px-xl",
    ]}
    data-part="header"
    data-has-context-action={contextAction ? "true" : undefined}
  >
    <div class="flex min-w-0 items-center gap-collection-summary" data-part="summary">
      {#if icon}
        <span
          class={[
            "size-collection-header-icon flex-none place-items-center rounded-collection-control-item text-activity-accent collection-icon-svg:size-collection-header-glyph",
            embedded ? "bg-surface" : "bg-collection-icon-surface",
            contextAction ? "hidden collection-wide:grid" : "grid",
          ]}
          data-part="icon"
          aria-hidden="true">{@render icon()}</span
        >
      {/if}
      <div class="grid min-w-0 gap-2xs" data-part="intro">
        <h2
          class={[
            "overflow-hidden text-body-sm font-collection-title leading-collection-title text-ellipsis whitespace-nowrap",
            embedded ? "text-ink" : "text-control-text",
          ]}
          id={headingId}
          data-part="title"
        >
          {title}
        </h2>
        {#if scope}
          <p
            class={[
              "m-0 overflow-hidden text-caption leading-collection-title text-ellipsis whitespace-nowrap",
              embedded ? "text-ink-soft" : "text-control-muted",
            ]}
            data-part="scope"
          >
            {scope}
          </p>
        {/if}
        {#if notice}
          <div
            class={[
              "m-0 overflow-hidden text-caption leading-collection-title text-ellipsis whitespace-nowrap",
              embedded ? "text-ink-soft" : "text-control-muted",
            ]}
            data-part="notice"
          >
            {@render notice()}
          </div>
        {/if}
      </div>
    </div>
    {#if contextAction || toggle}
      <div class="flex flex-none items-center gap-sm" data-part="header-actions">
        {#if contextAction}
          <div class="flex items-center" data-part="context-action">{@render contextAction()}</div>
        {/if}
        {#if toggle}<CollectionToggle {...toggle} />{/if}
      </div>
    {/if}
  </header>

  {#if filters}
    <div
      class={[
        "border-b collection-wide:p-0",
        embedded
          ? "border-line bg-surface-subtle text-ink"
          : "border-collection-control-divider bg-control-surface text-control-text",
      ]}
      data-part="filters"
      role="group"
      aria-label={filtersLabel}
    >
      {@render filters()}
    </div>
  {/if}

  <div
    class="min-w-0 collection-feedback:mx-record-inline collection-feedback:my-md collection-feedback:w-auto"
    data-part="body"
  >
    {@render children?.()}
  </div>
  {#if footer}
    <footer class="flex justify-center border-t border-line px-lg py-md" data-part="footer">
      {@render footer()}
    </footer>
  {/if}
</section>
