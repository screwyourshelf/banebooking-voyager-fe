<script lang="ts" module>
  export type FormActionsAlign = "between" | "end" | "start";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    align?: FormActionsAlign;
    children?: Snippet;
    embedded?: boolean;
    fullWidth?: boolean;
  };

  let {
    align = "end",
    children,
    embedded = true,
    fullWidth = false,
    ...attributes
  }: Props = $props();
</script>

<div
  {...attributes}
  data-ui="form-actions"
  data-align={align}
  data-embedded={embedded ? "true" : undefined}
  data-full-width={fullWidth ? "true" : undefined}
>
  {@render children?.()}
</div>
