<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { ButtonSize, ButtonVariant } from "./Button.svelte";

  type Props = HTMLAnchorAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  let { children, variant = "secondary", size = "default", ...attributes }: Props = $props();
</script>

<a {...attributes} data-ui-primitive="button" data-variant={variant} data-size={size}>
  {@render children?.()}
</a>
