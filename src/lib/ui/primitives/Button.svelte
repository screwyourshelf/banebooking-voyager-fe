<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
  export type ButtonSize = "small" | "default" | "icon" | "compact-icon";

  type Props = PublicHtmlAttributes<HTMLButtonAttributes> & {
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
  class={[
    "inline-flex items-center justify-center gap-control-gap border font-action text-center no-underline whitespace-nowrap cursor-pointer transition duration-120 focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    "min-w-0",
    fullWidth && "w-full",
    "rounded-control",
    variant === "primary"
      ? "border-transparent bg-brand text-action-primary-text enabled:hover:bg-action-primary-hover"
      : variant === "secondary"
        ? "border-line-strong bg-action-secondary text-ink enabled:hover:bg-surface-subtle"
        : variant === "destructive"
          ? "border-transparent bg-status-danger-bg text-status-danger-text enabled:hover:bg-action-destructive-hover"
          : variant === "ghost"
            ? "border-transparent bg-transparent enabled:hover:bg-surface-subtle"
            : "",
    variant === "ghost" && "text-ink",
    size === "default"
      ? "min-h-control px-action-inline py-control-block text-label leading-control"
      : size === "small"
        ? "min-h-compact-control px-control-inline py-action-compact-block text-caption leading-control"
        : size === "icon"
          ? "w-control min-h-control flex-none justify-center p-0 text-label leading-control"
          : "w-compact-control h-compact-control min-h-compact-control flex-none justify-center p-0",
  ]}
  {type}
  data-ui-primitive="button"
  data-variant={variant}
  data-size={size}
  data-full-width={fullWidth || undefined}
>
  {@render children?.()}
</button>
