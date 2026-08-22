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
  import CollectionToggle from "./CollectionToggle.svelte";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    busy?: boolean;
    children?: Snippet;
    contextAction?: Snippet;
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

  const headingId = $props.id();
</script>

<section
  {...attributes}
  data-ui="collection"
  aria-labelledby={headingId}
  aria-busy={busy || undefined}
>
  <header
    data-part="header"
    data-surface="control"
    data-has-context-action={contextAction ? "true" : undefined}
  >
    <div data-part="summary">
      {#if icon}<span data-part="icon" aria-hidden="true">{@render icon()}</span>{/if}
      <div data-part="intro">
        <h2 id={headingId} data-part="title">{title}</h2>
        {#if scope}<p data-part="scope">{scope}</p>{/if}
        {#if notice}<div data-part="notice">{@render notice()}</div>{/if}
      </div>
    </div>
    {#if contextAction || toggle}
      <div data-part="header-actions">
        {#if contextAction}<div data-part="context-action">{@render contextAction()}</div>{/if}
        {#if toggle}<CollectionToggle {...toggle} />{/if}
      </div>
    {/if}
  </header>

  {#if filters}
    <div data-part="filters" role="group" aria-label={filtersLabel}>{@render filters()}</div>
  {/if}

  <div data-part="body">{@render children?.()}</div>
  {#if footer}<footer data-part="footer">{@render footer()}</footer>{/if}
</section>
