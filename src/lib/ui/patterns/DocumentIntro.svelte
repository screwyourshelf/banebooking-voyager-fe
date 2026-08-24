<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
</script>

<div
  {...attributes}
  class="block border-b border-line bg-document-intro-surface p-lg text-ink-soft text-body leading-document-intro whitespace-pre-wrap document-intro-child:whitespace-normal document-intro-flow:mt-md md:px-document-wide-inline md:py-document-wide-block"
  data-ui="document-intro"
>
  {@render children?.()}
</div>
