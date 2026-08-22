<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { NavigationBadge } from "./NavigationLink.svelte";

  export type NavigationActionPresentation = "item" | "icon" | "back";

  type BaseProps = Omit<HTMLButtonAttributes, "children"> & {
    badge?: NavigationBadge;
    busy?: boolean;
    label: string;
  };

  type Props = BaseProps &
    (
      | { icon?: Snippet; presentation?: Exclude<NavigationActionPresentation, "icon"> }
      | { icon: Snippet; presentation: "icon" }
    );

  let {
    badge,
    busy = false,
    disabled = false,
    icon,
    label,
    onclick,
    presentation = "item",
    type = "button",
    ...attributes
  }: Props = $props();
</script>

<li
  data-ui="navigation-item"
  data-kind="action"
  data-presentation={presentation}
  data-disabled={disabled || undefined}
>
  <button
    {...attributes}
    {type}
    {disabled}
    onclick={disabled ? undefined : onclick}
    aria-label={presentation === "icon" ? label : undefined}
    aria-busy={busy || undefined}
  >
    {#if icon}<span data-part="icon" aria-hidden="true">{@render icon()}</span>{/if}
    {#if presentation !== "icon"}<span data-part="label">{label}</span>{/if}
    {#if badge}
      <span data-part="badge" data-tone={badge.tone ?? "neutral"} aria-label={badge.accessibleLabel}
        >{badge.label}</span
      >
    {/if}
  </button>
</li>
