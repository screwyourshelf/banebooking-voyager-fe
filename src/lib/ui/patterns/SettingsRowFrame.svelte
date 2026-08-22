<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
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
  data-ui="settings-row"
  data-layout="row"
  data-density="default"
  data-kind={kind}
  data-disabled={disabled || undefined}
  aria-busy={busy || undefined}
>
  <div data-part="header">
    <div data-part="intro">
      <div data-part="title">{title}</div>
      {#if description}<div data-part="description">{description}</div>{/if}
    </div>
    {#if right}<div data-part="actions">{@render right()}</div>{/if}
  </div>

  {#if hasContent}
    <div data-part="content" data-has-header="true">{@render children?.()}</div>
  {/if}
</div>
