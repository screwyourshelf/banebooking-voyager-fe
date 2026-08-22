<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type SectionVariant = "soft" | "surface" | "plain";
  export type SectionPadding = "small" | "medium" | "large";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    actions?: Snippet;
    children?: Snippet;
    description?: string;
    padding?: SectionPadding;
    title?: string;
    variant?: SectionVariant;
  };

  let {
    actions,
    children,
    description,
    padding = "medium",
    title,
    variant = "soft",
    ...attributes
  }: Props = $props();

  const headingId = $props.id();
  const hasHeader = $derived(Boolean(title || description || actions));
  const dataPadding = $derived(padding === "small" ? "sm" : padding === "large" ? "lg" : "md");
</script>

<section
  {...attributes}
  data-ui="section"
  data-variant={variant}
  data-padding={dataPadding}
  aria-labelledby={title ? headingId : undefined}
>
  {#if hasHeader}
    <header data-ui="section-header">
      <div data-part="intro">
        {#if title}<h2 id={headingId} data-part="title">{title}</h2>{/if}
        {#if description}<p data-part="description">{description}</p>{/if}
      </div>
      {#if actions}<div data-part="actions">{@render actions()}</div>{/if}
    </header>
  {/if}
  <div data-part="content">{@render children?.()}</div>
</section>
