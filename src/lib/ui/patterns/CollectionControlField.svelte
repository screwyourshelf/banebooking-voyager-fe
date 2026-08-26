<script lang="ts">
  import DatePicker from "../primitives/DatePicker.svelte";
  import Select from "../primitives/Select.svelte";
  import Switch from "../primitives/Switch.svelte";
  import type { CollectionControlField } from "./collection-controls";

  let {
    disabled,
    field,
    generatedId,
  }: {
    disabled: boolean;
    field: CollectionControlField;
    generatedId: string;
  } = $props();
</script>

<div
  class={[
    "grid min-w-collection-control-field gap-collection-control-detail collection-wide:grow-0 collection-wide:shrink collection-wide:basis-collection-control-field-wide",
    field.width === "wide" &&
      "collection-wide:grow collection-wide:basis-collection-control-field-expanded",
  ]}
  data-part="field"
  data-control={field.type}
  data-width={field.width ?? "default"}
  aria-busy={field.pending || undefined}
>
  {#if field.type === "switch"}
    <label
      class="flex min-h-collection-toggle items-center justify-between gap-md rounded-collection-control-item bg-collection-control-item-surface px-collection-control-item-inline py-sm font-collection-control-label"
    >
      <span class="grid min-w-0" data-part="field-content">
        <strong class="text-control-text text-label">{field.title}</strong>
        {#if field.description}
          <small class="text-control-muted text-caption">{field.description}</small>
        {/if}
      </span>
      <Switch
        checked={field.checked}
        aria-label={field.title}
        disabled={disabled || field.disabled || field.pending}
        onCheckedChange={field.onCheckedChange}
      />
    </label>
  {:else}
    <label
      class="text-control-muted text-caption font-collection-control-label"
      for={`${generatedId}-${field.id}`}>{field.label}</label
    >
    {#if field.type === "date"}
      <DatePicker
        id={`${generatedId}-${field.id}`}
        presentation="filter"
        value={field.value}
        minValue={field.min}
        maxValue={field.max}
        disabled={disabled || field.disabled}
        pending={field.pending}
        onValueChange={field.onValueChange}
      />
    {:else}
      <Select
        id={`${generatedId}-${field.id}`}
        aria-label={field.label}
        value={field.value}
        options={field.options}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        pending={field.pending}
        onValueChange={field.onValueChange}
      />
    {/if}
  {/if}
</div>
