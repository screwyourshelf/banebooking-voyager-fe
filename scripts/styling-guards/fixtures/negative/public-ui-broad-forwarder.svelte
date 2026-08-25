<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../../../../src/lib/ui/public-html-attributes";

  type UnsafeProps = PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>> & {
    class?: string;
    label: string;
  };

  let { label, ...attributes }: UnsafeProps = $props();
</script>

<div {...attributes} aria-label={label}></div>
