<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLElement>>, "children" | "title"> & {
    children?: Snippet;
    description?: string;
    title: string;
  };

  let { children, description, title, ...attributes }: Props = $props();

  const headingId = $props.id();
</script>

<section
  {...attributes}
  class="p-lg md:px-document-wide-inline md:py-document-wide-block"
  data-ui="document-section"
  aria-labelledby={headingId}
>
  <h2
    class="text-brand-strong text-body-lg font-document-section-title leading-document-section-title"
    id={headingId}
    data-part="title"
  >
    {title}
  </h2>
  {#if description}
    <p
      class="mt-xs text-ink-faint text-body-sm leading-document-section-description"
      data-part="description"
    >
      {description}
    </p>
  {/if}
  <div
    class="grid gap-md mt-sm text-ink-soft text-body-sm leading-document-section-content"
    data-part="content"
  >
    {@render children?.()}
  </div>
</section>
