<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
  export type ButtonSize = "small" | "default" | "icon";

  type Props = HTMLButtonAttributes & {
    fullWidth?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  let {
    children,
    fullWidth = false,
    type = "button",
    variant = "primary",
    size = "default",
    ...attributes
  }: Props = $props();
</script>

<button
  {...attributes}
  {type}
  data-ui-primitive="button"
  data-variant={variant}
  data-size={size}
  data-full-width={fullWidth || undefined}
>
  {@render children?.()}
</button>
