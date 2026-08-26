<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../../../../src/lib/ui/public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children"> & {
    label: string;
  };

  let { label, ...attributes }: Props = $props();
</script>

<div {...attributes} aria-label={label}></div>
