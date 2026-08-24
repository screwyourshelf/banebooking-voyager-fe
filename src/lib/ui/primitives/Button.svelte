<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
  export type ButtonSize = "small" | "default" | "icon" | "compact-icon";

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

  const dataPart = $derived(attributes["data-part"]);
  // Contextual pattern selectors stay authoritative until their SWP-3 migration.
  const patternOwnsMinimumWidth = $derived(attributes["data-ui"] === "form-submit");
  const patternOwnsVariant = $derived(dataPart === "toggle");
  const patternOwnsTypographyAndShape = $derived(dataPart === "trigger");
  const patternOwnsGhostText = $derived(
    dataPart === "back" ||
      dataPart === "reset" ||
      dataPart === "trigger" ||
      (dataPart === "control" && Boolean(attributes["data-tone"]))
  );
</script>

<button
  {...attributes}
  class={[
    "inline-flex items-center justify-center gap-control-gap border font-action text-center no-underline whitespace-nowrap cursor-pointer transition duration-120 focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    !patternOwnsMinimumWidth && "min-w-0",
    fullWidth && "w-full",
    !patternOwnsTypographyAndShape && "rounded-control",
    !patternOwnsVariant && variant === "primary"
      ? "border-transparent bg-brand text-action-primary-text enabled:hover:bg-action-primary-hover"
      : !patternOwnsVariant && variant === "secondary"
        ? "border-line-strong bg-action-secondary text-ink enabled:hover:bg-surface-subtle"
        : !patternOwnsVariant && variant === "destructive"
          ? "border-transparent bg-status-danger-bg text-status-danger-text enabled:hover:bg-action-destructive-hover"
          : !patternOwnsVariant && variant === "ghost"
            ? "border-transparent bg-transparent enabled:hover:bg-surface-subtle"
            : "",
    variant === "ghost" && !patternOwnsGhostText && "text-ink",
    size === "default"
      ? "min-h-control px-action-inline py-control-block text-label leading-control"
      : size === "small"
        ? patternOwnsTypographyAndShape
          ? "min-h-compact-control px-control-inline py-action-compact-block leading-control"
          : "min-h-compact-control px-control-inline py-action-compact-block text-caption leading-control"
        : size === "icon"
          ? "w-control min-h-control justify-center p-0 text-label leading-control"
          : "w-compact-control h-compact-control min-h-compact-control justify-center p-0",
  ]}
  {type}
  data-ui-primitive="button"
  data-variant={variant}
  data-size={size}
  data-full-width={fullWidth || undefined}
>
  {@render children?.()}
</button>
