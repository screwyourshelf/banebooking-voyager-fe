<script lang="ts">
  import RichTextNodes from "./RichTextNodes.svelte";
  import { parseRichTextContent } from "./rich-text-content";

  let { value }: { value: string } = $props();
  const content = $derived(parseRichTextContent(value));
</script>

<div
  class="min-w-0 whitespace-pre-wrap rich-text-content-child:whitespace-normal rich-text-content-flow:mt-md rich-text-content-heading:text-ink rich-text-content-heading:font-rich-text-content-heading rich-text-content-heading:leading-rich-text-content-heading rich-text-content-heading-2:text-heading-sm rich-text-content-heading-3:text-body-lg rich-text-content-list:grid rich-text-content-list:gap-rich-text-content-list rich-text-content-list:pl-rich-text-content-list-inline rich-text-content-quote:border-l-rich-text-content-quote rich-text-content-quote:border-rich-text-content-quote-border rich-text-content-quote:pl-rich-text-content-quote rich-text-content-quote:text-ink-soft rich-text-content-table-scroll:max-w-full rich-text-content-table-scroll:overflow-x-auto rich-text-content-table:w-full rich-text-content-table:min-w-rich-text-content-table rich-text-content-table:border-collapse rich-text-content-cell:border rich-text-content-cell:border-line rich-text-content-cell:p-sm rich-text-content-cell:text-left rich-text-content-cell:align-top"
  data-ui="rich-text-content"
>
  {#if content.kind === "plain"}
    {content.text}
  {:else}
    <RichTextNodes nodes={content.content} />
  {/if}
</div>
