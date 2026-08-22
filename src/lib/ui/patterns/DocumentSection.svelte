<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    children?: Snippet;
    description?: string;
    title: string;
  };

  let { children, description, title, ...attributes }: Props = $props();

  const headingId = $props.id();
</script>

<section {...attributes} data-ui="document-section" aria-labelledby={headingId}>
  <h2 id={headingId} data-part="title">{title}</h2>
  {#if description}<p data-part="description">{description}</p>{/if}
  <div data-part="content">{@render children?.()}</div>
</section>
