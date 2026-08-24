<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: Snippet;
    embedded?: boolean;
  };

  let { children, embedded = false, ...attributes }: Props = $props();
</script>

<div
  {...attributes}
  class={[
    "min-w-0",
    embedded
      ? "settings-stack-embedded-section:border-t settings-stack-embedded-section:border-line"
      : "settings-stack-flow:mt-lg",
  ]}
  data-ui="settings-stack"
  data-embedded={embedded || undefined}
>
  {@render children?.()}
</div>
