<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import { requireNavigationContext } from "./navigation-context";

  export type NavigationBadge = {
    accessibleLabel?: string;
    label: string;
    tone?: "neutral" | "accent";
  };

  type Props = Omit<PublicHtmlAttributes<HTMLAnchorAttributes>, "children"> & {
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

  const navigation = requireNavigationContext();
</script>

<li
  class="min-w-0"
  data-ui="navigation-item"
  data-kind="link"
  data-active={active || undefined}
  data-presentation={presentation}
>
  <a
    {...attributes}
    class={[
      "relative flex min-w-0 items-center gap-navigation-item border-0 rounded-navigation-item text-body-sm font-navigation-item text-left no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
      presentation === "icon"
        ? "size-navigation-action-icon min-h-0 justify-center p-0"
        : navigation.layout === "bottom"
          ? "w-full px-xs py-sm"
          : navigation.layout === "section"
            ? "w-full px-lg py-navigation-item-block"
            : "w-full px-md py-navigation-item-block",
      !active &&
        navigation.layout === "sidebar" &&
        navigation.surface !== "overlay" &&
        "bg-transparent text-control-text hover:bg-nav-active-surface hover:text-nav-active",
      !active &&
        navigation.layout === "sidebar" &&
        navigation.surface === "overlay" &&
        "bg-transparent text-ink hover:bg-nav-active-surface hover:text-nav-active",
      !active &&
        navigation.layout === "bottom" &&
        "bg-transparent text-ink-soft hover:bg-nav-active-surface hover:text-nav-active",
      !active &&
        navigation.layout !== "sidebar" &&
        navigation.layout !== "bottom" &&
        "bg-transparent text-menu-text hover:bg-nav-active-surface hover:text-nav-active",
      active &&
        navigation.layout === "sidebar" &&
        navigation.surface !== "overlay" &&
        "bg-navigation-sidebar-active-surface text-navigation-sidebar-active",
      active &&
        navigation.layout === "bottom" &&
        "bg-transparent text-brand before:absolute before:top-0 before:right-md before:left-md before:h-navigation-bottom-indicator before:rounded-navigation-bottom-indicator before:bg-brand before:content-empty",
      active &&
        navigation.layout !== "bottom" &&
        !(navigation.layout === "sidebar" && navigation.surface !== "overlay") &&
        "bg-nav-active-surface text-nav-active",
      navigation.layout === "bottom" &&
        "min-h-navigation-bottom-item flex-col justify-center gap-xs rounded-none text-caption text-center",
      navigation.layout === "section" &&
        "min-h-navigation-section-item rounded-navigation-section-item",
      active &&
        navigation.layout === "section" &&
        "after:absolute after:right-md after:-bottom-navigation-section-indicator-bottom after:left-md after:h-navigation-section-indicator after:rounded-navigation-section-indicator after:bg-nav-indicator after:content-empty",
    ]}
    aria-current={active ? "page" : undefined}
    aria-label={presentation === "icon" ? label : undefined}
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
  </a>
</li>
