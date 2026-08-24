<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { requireNavigationContext } from "./navigation-context";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    children?: Snippet;
    title: string;
  };

  let { children, title, ...attributes }: Props = $props();

  const headingId = $props.id();
  const navigation = requireNavigationContext();
</script>

<section {...attributes} class="min-w-0" data-ui="navigation-section" aria-labelledby={headingId}>
  <h2
    class={[
      "m-0 mb-sm text-caption font-navigation-section tracking-navigation-section uppercase",
      navigation.layout === "sidebar" && navigation.surface !== "overlay"
        ? "text-control-muted"
        : navigation.surface === "overlay"
          ? "text-ink-faint"
          : "text-menu-muted",
    ]}
    id={headingId}
    data-part="title"
  >
    {title}
  </h2>
  <div class="min-w-0" data-part="content">{@render children?.()}</div>
</section>
