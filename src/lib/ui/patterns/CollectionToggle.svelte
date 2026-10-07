<script lang="ts">
  import { getCollectionContext } from "./collection-context";
  import Switch from "../primitives/Switch.svelte";

  type Props = {
    checked: boolean;
    description?: string;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
    pending?: boolean;
    title: string;
  };

  let {
    checked,
    description,
    disabled = false,
    onCheckedChange,
    pending = false,
    title,
  }: Props = $props();

  const descriptionId = $props.id();
  const isDisabled = $derived(disabled || pending);
  const collection = getCollectionContext();
  const embedded = $derived(collection?.embedded ?? false);
</script>

<label
  class={[
    "flex min-w-0 min-h-collection-toggle items-center justify-between gap-collection-control-item rounded-collection-control-item px-collection-control-item-inline py-sm cursor-pointer collection-wide:min-w-collection-toggle-wide",
    embedded ? "bg-surface" : "bg-collection-control-item-surface",
    isDisabled && "cursor-not-allowed opacity-collection-disabled",
  ]}
  data-ui="collection-toggle"
  aria-busy={pending || undefined}
>
  <span class="flex min-w-0 flex-col" data-part="content">
    <strong
      class={[
        "text-label font-collection-toggle whitespace-nowrap",
        embedded ? "text-ink" : "text-control-text",
      ]}
      data-part="title">{title}</strong
    >
    {#if description}
      <small
        class={["text-caption", embedded ? "text-ink-soft" : "text-control-muted"]}
        id={descriptionId}
        data-part="description">{description}</small
      >
    {/if}
  </span>
  <Switch
    {checked}
    disabled={isDisabled}
    aria-label={title}
    aria-describedby={description ? descriptionId : undefined}
    {onCheckedChange}
  />
</label>
