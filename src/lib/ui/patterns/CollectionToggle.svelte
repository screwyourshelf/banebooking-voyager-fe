<script lang="ts">
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
</script>

<label data-ui="collection-toggle" aria-busy={pending || undefined}>
  <span data-part="content">
    <strong data-part="title">{title}</strong>
    {#if description}<small id={descriptionId} data-part="description">{description}</small>{/if}
  </span>
  <Switch
    {checked}
    disabled={isDisabled}
    aria-label={title}
    aria-describedby={description ? descriptionId : undefined}
    {onCheckedChange}
  />
</label>
