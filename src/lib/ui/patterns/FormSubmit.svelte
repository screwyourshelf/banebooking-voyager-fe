<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Button, { type ButtonSize, type ButtonVariant } from "../primitives/Button.svelte";

  type Props = Omit<HTMLButtonAttributes, "children" | "disabled" | "type"> & {
    children: Snippet;
    disabled?: boolean;
    fullWidth?: boolean;
    pending?: boolean;
    pendingLabel?: string;
    size?: ButtonSize;
    variant?: ButtonVariant;
  };

  let {
    children,
    disabled = false,
    fullWidth = false,
    pending = false,
    pendingLabel = "Lagrer …",
    size = "small",
    variant = "primary",
    ...attributes
  }: Props = $props();
</script>

<Button
  {...attributes}
  type="submit"
  {size}
  {variant}
  disabled={disabled || pending}
  data-ui="form-submit"
  data-full-width={fullWidth ? "true" : undefined}
  data-pending={pending ? "true" : undefined}
  aria-busy={pending || undefined}
>
  {#if pending}<span data-part="spinner" aria-hidden="true"></span>{/if}
  <span data-part="label" aria-live={pending ? "polite" : undefined}>
    {#if pending}{pendingLabel}{:else}{@render children()}{/if}
  </span>
</Button>
