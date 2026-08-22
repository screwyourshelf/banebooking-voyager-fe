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
  };

  let { active = false, badge, icon, label, ...attributes }: Props = $props();
</script>

<li data-ui="navigation-item" data-kind="link" data-active={active || undefined}>
  <a {...attributes} aria-current={active ? "page" : undefined}>
    {#if icon}<span data-part="icon" aria-hidden="true">{@render icon()}</span>{/if}
    <span data-part="label">{label}</span>
    {#if badge}
      <span data-part="badge" data-tone={badge.tone ?? "neutral"} aria-label={badge.accessibleLabel}
        >{badge.label}</span
      >
    {/if}
  </a>
</li>
