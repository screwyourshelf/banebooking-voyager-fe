<script lang="ts">
  import type { RichTextContentNode } from "./rich-text-content";
  import RichTextNodes from "./RichTextNodes.svelte";
  import RichTextText from "./RichTextText.svelte";

  let { nodes }: { nodes: readonly RichTextContentNode[] } = $props();
</script>

{#each nodes as node (node)}
  {#if node.type === "text"}
    <RichTextText {node} />
  {:else if node.type === "paragraph"}
    <p><RichTextNodes nodes={node.content} /></p>
  {:else if node.type === "heading" && node.attrs?.level === 2}
    <h2><RichTextNodes nodes={node.content} /></h2>
  {:else if node.type === "heading" && node.attrs?.level === 3}
    <h3><RichTextNodes nodes={node.content} /></h3>
  {:else if node.type === "bulletList"}
    <ul><RichTextNodes nodes={node.content} /></ul>
  {:else if node.type === "orderedList"}
    <ol><RichTextNodes nodes={node.content} /></ol>
  {:else if node.type === "listItem"}
    <li><RichTextNodes nodes={node.content} /></li>
  {:else if node.type === "blockquote"}
    <blockquote><RichTextNodes nodes={node.content} /></blockquote>
  {:else if node.type === "hardBreak"}
    <br />
  {:else if node.type === "horizontalRule"}
    <hr />
  {:else if node.type === "table"}
    <div data-part="table-scroll">
      <table><tbody><RichTextNodes nodes={node.content} /></tbody></table>
    </div>
  {:else if node.type === "tableRow"}
    <tr><RichTextNodes nodes={node.content} /></tr>
  {:else if node.type === "tableHeader"}
    <th><RichTextNodes nodes={node.content} /></th>
  {:else if node.type === "tableCell"}
    <td><RichTextNodes nodes={node.content} /></td>
  {/if}
{/each}
