<script lang="ts">
  import type { NavigationLayout } from "./navigation-context";

  let {
    items = 4,
    label,
    layout,
    surface = "default",
  }: {
    items?: number;
    label: string;
    layout: NavigationLayout;
    surface?: "default" | "shell";
  } = $props();

  const itemCount = $derived(
    Number.isFinite(items) ? Math.max(1, Math.min(12, Math.floor(items))) : 4
  );
</script>

<div
  class={[
    layout === "bottom" &&
      "w-full border-t border-line bg-navigation-bottom-surface pb-navigation-safe shadow-navigation-bottom backdrop-blur-navigation-bottom",
    layout === "sidebar" && surface === "shell" && "w-full",
  ]}
  data-ui="navigation-loading"
  data-layout={layout}
  role="status"
  aria-label={label}
  aria-live="polite"
  aria-atomic="true"
>
  <div
    class={[
      "flex gap-sm",
      layout === "sidebar" && "w-full max-w-navigation-sidebar flex-col",
      layout === "bottom" && "grid grid-flow-col auto-cols-fr",
    ]}
    data-part="list"
    aria-hidden="true"
  >
    {#each Array(itemCount) as _, index (index)}
      <span
        class={[
          "min-h-navigation-loading-item rounded-navigation-item animate-navigation-loading motion-reduce:animate-none",
          layout === "sidebar" && surface === "shell"
            ? "bg-navigation-loading-shell-placeholder"
            : "bg-navigation-loading-placeholder",
          layout === "bottom" && "min-h-navigation-bottom-item rounded-none",
        ]}
        data-part="item"
      ></span>
    {/each}
  </div>
</div>
