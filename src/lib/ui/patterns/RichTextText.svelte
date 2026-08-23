<script lang="ts">
  import type { RichTextContentNode } from "./rich-text-content";

  let { node }: { node: RichTextContentNode } = $props();
  const bold = $derived(node.marks.includes("bold"));
  const italic = $derived(node.marks.includes("italic"));
  const strike = $derived(node.marks.includes("strike"));
</script>

{#snippet italicContent()}
  {#if italic}<em>{node.text}</em>{:else}{node.text}{/if}
{/snippet}

{#snippet boldContent()}
  {#if bold}<strong>{@render italicContent()}</strong>{:else}{@render italicContent()}{/if}
{/snippet}

{#if strike}<s>{@render boldContent()}</s>{:else}{@render boldContent()}{/if}
