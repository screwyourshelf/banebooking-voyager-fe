<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    children?: Snippet;
    title: string;
  };

  let { children, title, ...attributes }: Props = $props();

  const headingId = $props.id();
</script>

<section {...attributes} data-ui="navigation-section" aria-labelledby={headingId}>
  <h2 id={headingId} data-part="title">{title}</h2>
  <div data-part="content">{@render children?.()}</div>
</section>
