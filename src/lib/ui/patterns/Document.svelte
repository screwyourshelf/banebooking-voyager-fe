<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<
    PublicHtmlAttributes<HTMLAttributes<HTMLElement>>,
    "aria-label" | "children"
  > & {
    children?: Snippet;
    label?: string;
  };

  let { children, label, ...attributes }: Props = $props();
</script>

<article
  {...attributes}
  class={[
    "overflow-hidden w-full max-w-document border border-line rounded-document bg-surface-raised shadow-surface-md md:rounded-document-wide",
    "document-section-flow:border-t document-section-flow:border-line",
    "document-strong:text-ink document-strong:font-document-strong",
    "document-link:text-brand document-link:font-document-link document-link:underline document-link:decoration-document-link-decoration document-link:underline-offset-document-link document-link:hover:text-brand-strong document-link:hover:decoration-brand-strong",
  ]}
  data-ui="document"
  aria-label={label}
>
  {@render children?.()}
</article>
