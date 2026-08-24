<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children" | "title"> & {
    busy?: boolean;
    children?: Snippet;
    description?: string;
    disabled?: boolean;
    kind: "default" | "switch";
    right?: Snippet;
    title: string;
  };

  let {
    busy = false,
    children,
    description,
    disabled = false,
    kind,
    right,
    title,
    ...attributes
  }: Props = $props();

  const hasContent = $derived(Boolean(children));
</script>

<div
  {...attributes}
  class={[
    "px-sm py-sm",
    kind === "default" && "md:grid md:grid-cols-settings-row md:items-start md:gap-xl",
  ]}
  data-ui="settings-row"
  data-layout="row"
  data-density="default"
  data-kind={kind}
  data-disabled={disabled || undefined}
  aria-busy={busy || undefined}
>
  <div class="flex items-start justify-between gap-sm" data-part="header">
    <div class="min-w-0" data-part="intro">
      <div
        class="text-body-sm font-settings-row-title leading-settings-row-title"
        data-part="title"
      >
        {title}
      </div>
      {#if description}
        <div
          class="mt-xs text-ink-soft text-caption leading-settings-row-description"
          data-part="description"
        >
          {description}
        </div>
      {/if}
    </div>
    {#if right}<div class="flex-none" data-part="actions">{@render right()}</div>{/if}
  </div>

  {#if hasContent}
    <div class="mt-sm md:mt-0" data-part="content" data-has-header="true">
      {@render children?.()}
    </div>
  {/if}
</div>
