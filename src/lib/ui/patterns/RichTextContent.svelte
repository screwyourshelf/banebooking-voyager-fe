<script lang="ts">
  import RichTextNodes from "./RichTextNodes.svelte";
  import { parseRichTextContent } from "./rich-text-content";

  let { value }: { value: string } = $props();
  const content = $derived(parseRichTextContent(value));
</script>

<div data-ui="rich-text-content">
  {#if content.kind === "plain"}
    {content.text}
  {:else}
    <RichTextNodes nodes={content.content} />
  {/if}
</div>
