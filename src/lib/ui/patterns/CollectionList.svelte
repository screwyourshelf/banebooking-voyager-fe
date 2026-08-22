<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> & {
    busy?: boolean;
    children?: Snippet;
    label?: string;
  };

  let { busy = false, children, label, ...attributes }: Props = $props();
</script>

<div
  {...attributes}
  data-ui="collection-list"
  role="list"
  aria-label={label}
  aria-busy={busy || undefined}
>
  {@render children?.()}
</div>
