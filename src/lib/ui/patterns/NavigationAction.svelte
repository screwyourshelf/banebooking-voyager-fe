<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { NavigationBadge } from "./NavigationLink.svelte";
  import { requireNavigationContext } from "./navigation-context";

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

  const navigation = requireNavigationContext();
</script>

<li
  class="min-w-0"
  data-ui="navigation-item"
  data-kind="action"
  data-presentation={presentation}
  data-disabled={disabled || undefined}
>
  <button
    {...attributes}
    class={[
      "relative flex min-w-0 items-center gap-navigation-item border-0 rounded-navigation-item bg-transparent text-body-sm font-navigation-item text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      navigation.layout === "sidebar" && navigation.surface !== "overlay"
        ? "text-control-text hover:bg-nav-active-surface hover:text-nav-active"
        : navigation.layout === "sidebar" && navigation.surface === "overlay"
          ? "text-ink hover:bg-nav-active-surface hover:text-nav-active"
          : navigation.layout === "bottom"
            ? "text-ink-faint hover:bg-nav-active-surface hover:text-nav-active"
            : "text-menu-text hover:bg-nav-active-surface hover:text-nav-active",
      navigation.layout === "bottom" &&
        "min-h-navigation-bottom-item flex-col justify-center gap-xs rounded-none text-caption text-center",
      presentation === "item" &&
        (navigation.layout === "bottom"
          ? "w-full px-xs py-sm"
          : "w-full px-md py-navigation-item-block"),
      presentation === "icon" && "size-navigation-action-icon min-h-0 justify-center p-0",
      presentation === "back" && "w-auto px-md py-navigation-item-block",
    ]}
    {type}
    {disabled}
    onclick={disabled ? undefined : onclick}
    aria-label={presentation === "icon" ? label : undefined}
    aria-busy={busy || undefined}
  >
    {#if icon}
      <span
        class="grid size-navigation-icon flex-none place-items-center navigation-icon-svg:size-full"
        data-part="icon"
        aria-hidden="true">{@render icon()}</span
      >
    {/if}
    {#if presentation !== "icon"}
      <span
        class={[
          "min-w-0 overflow-hidden flex-1 text-ellipsis whitespace-nowrap",
          navigation.layout === "bottom" && "flex-initial",
        ]}
        data-part="label">{label}</span
      >
    {/if}
    {#if badge}
      <span
        class={[
          "inline-flex min-w-navigation-badge min-h-navigation-badge flex-none items-center justify-center rounded-navigation-badge px-navigation-badge text-micro font-navigation-badge",
          badge.tone === "accent"
            ? "bg-status-warning-bg text-status-warning-text"
            : "bg-surface-subtle text-ink-soft",
          navigation.layout === "bottom" &&
            "absolute top-navigation-bottom-badge-top left-navigation-bottom-badge-left",
        ]}
        data-part="badge"
        data-tone={badge.tone ?? "neutral"}
        aria-label={badge.accessibleLabel}>{badge.label}</span
      >
    {/if}
  </button>
</li>
