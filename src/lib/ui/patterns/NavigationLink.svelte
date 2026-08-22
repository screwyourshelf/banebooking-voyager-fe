<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  export type NavigationBadge = {
    accessibleLabel?: string;
    label: string;
    tone?: "neutral" | "accent";
  };

  type Props = Omit<HTMLAnchorAttributes, "children"> & {
    active?: boolean;
    badge?: NavigationBadge;
    icon?: Snippet;
    label: string;
    presentation?: "icon" | "item";
  };

  let {
    active = false,
    badge,
    icon,
    label,
    presentation = "item",
    ...attributes
  }: Props = $props();
</script>

<li
  data-ui="navigation-item"
  data-kind="link"
  data-active={active || undefined}
  data-presentation={presentation}
>
  <a
    {...attributes}
    aria-current={active ? "page" : undefined}
    aria-label={presentation === "icon" ? label : undefined}
  >
    {#if icon}<span data-part="icon" aria-hidden="true">{@render icon()}</span>{/if}
    {#if presentation !== "icon"}<span data-part="label">{label}</span>{/if}
    {#if badge}
      <span data-part="badge" data-tone={badge.tone ?? "neutral"} aria-label={badge.accessibleLabel}
        >{badge.label}</span
      >
    {/if}
  </a>
</li>
