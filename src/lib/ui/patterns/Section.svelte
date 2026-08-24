<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type SectionVariant = "soft" | "surface" | "plain";
  export type SectionPadding = "small" | "medium" | "large";
  export type SectionLayout = "default" | "data-table";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    actions?: Snippet;
    children?: Snippet;
    description?: string;
    layout?: SectionLayout;
    padding?: SectionPadding;
    title?: string;
    variant?: SectionVariant;
  };

  let {
    actions,
    children,
    description,
    layout = "default",
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
  class={[
    "grid min-w-0",
    "gap-section",
    variant === "soft"
      ? "rounded-section bg-section-soft"
      : variant === "surface"
        ? "border border-line rounded-section bg-surface-raised text-ink shadow-surface-sm"
        : "",
    layout === "data-table"
      ? "overflow-hidden pt-md px-0 pb-0"
      : padding === "small"
        ? "p-md"
        : padding === "large"
          ? "p-xl"
          : "p-lg",
  ]}
  data-ui="section"
  data-variant={variant}
  data-padding={dataPadding}
  aria-labelledby={title ? headingId : undefined}
>
  {#if hasHeader}
    <header
      class={[
        "flex items-start justify-between gap-md",
        layout === "data-table" && "px-lg pt-xs pb-lg",
      ]}
      data-ui="section-header"
    >
      <div class="grid min-w-0 gap-xs" data-part="intro">
        {#if title}
          <h2
            class="text-ink text-body-lg font-section-title leading-section-title"
            id={headingId}
            data-part="title"
          >
            {title}
          </h2>
        {/if}
        {#if description}
          <p
            class="max-w-section-description text-ink-soft text-body-sm leading-section-description"
            data-part="description"
          >
            {description}
          </p>
        {/if}
      </div>
      {#if actions}<div class="flex-none" data-part="actions">{@render actions()}</div>{/if}
    </header>
  {/if}
  <div class="grid min-w-0 gap-md" data-part="content">{@render children?.()}</div>
</section>
