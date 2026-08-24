<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { ButtonSize, ButtonVariant } from "./Button.svelte";

  type Props = HTMLAnchorAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  let { children, variant = "secondary", size = "default", ...attributes }: Props = $props();
</script>

<a
  {...attributes}
  class={[
    "inline-flex min-w-0 items-center justify-center gap-control-gap border rounded-control font-action text-center no-underline whitespace-nowrap cursor-pointer transition duration-120 focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 active:translate-y-px",
    variant === "primary"
      ? "border-transparent bg-brand text-action-primary-text hover:bg-action-primary-hover"
      : variant === "secondary"
        ? "border-line-strong bg-action-secondary text-ink hover:bg-surface-subtle"
        : variant === "destructive"
          ? "border-transparent bg-status-danger-bg text-status-danger-text hover:bg-action-destructive-hover"
          : "border-transparent bg-transparent text-ink hover:bg-surface-subtle",
    size === "default"
      ? "min-h-control px-action-inline py-control-block text-label leading-control"
      : size === "small"
        ? "min-h-compact-control px-control-inline py-action-compact-block text-caption leading-control"
        : size === "icon"
          ? "w-control min-h-control justify-center p-0 text-label leading-control"
          : "w-compact-control h-compact-control min-h-compact-control justify-center p-0",
  ]}
  data-ui-primitive="button"
  data-variant={variant}
  data-size={size}
>
  {@render children?.()}
</a>
