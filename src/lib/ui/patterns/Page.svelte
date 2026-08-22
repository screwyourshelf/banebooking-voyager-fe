<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    actions?: Snippet;
    children?: Snippet;
    description?: string;
    eyebrow?: string;
    standalone?: boolean;
    title?: string;
  };

  let {
    actions,
    children,
    description,
    eyebrow,
    standalone = false,
    title,
    ...attributes
  }: Props = $props();

  const hasHeader = $derived(Boolean(eyebrow || title || description || actions));
</script>

{#snippet content()}
  {#if hasHeader}
    <div data-part="content">
      <header data-part="header">
        <div data-part="intro">
          {#if eyebrow}<p data-part="eyebrow">{eyebrow}</p>{/if}
          {#if title}<h1 data-part="title">{title}</h1>{/if}
          {#if description}<p data-part="description">{description}</p>{/if}
        </div>
        {#if actions}<div data-part="actions">{@render actions()}</div>{/if}
      </header>
      {@render children?.()}
    </div>
  {:else}
    {@render children?.()}
  {/if}
{/snippet}

{#if standalone}
  <main {...attributes} data-ui="page">{@render content()}</main>
{:else}
  <div {...attributes} data-ui="page">{@render content()}</div>
{/if}
