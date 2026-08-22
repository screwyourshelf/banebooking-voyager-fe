<script lang="ts" module>
  export type SettingsRadioGroupLayout = "grid" | "stacked";
  export type SettingsRadioOption = {
    description?: string;
    disabled?: boolean;
    label: string;
    value: string;
  };
</script>

<script lang="ts">
  import Radio from "../primitives/Radio.svelte";

  type Props = {
    disabled?: boolean;
    label: string;
    layout?: SettingsRadioGroupLayout;
    name?: string;
    onValueChange: (value: string) => void;
    options: readonly SettingsRadioOption[];
    pending?: boolean;
    value: string;
  };

  let {
    disabled = false,
    label,
    layout = "grid",
    name,
    onValueChange,
    options,
    pending = false,
    value,
  }: Props = $props();

  const generatedId = $props.id();
  const groupName = $derived(name ?? `settings-radio-${generatedId}`);
</script>

<div
  data-ui="settings-radio-group"
  data-layout={layout}
  role="radiogroup"
  aria-label={label}
  aria-busy={pending || undefined}
>
  {#each options as option, index (option.value)}
    {@const optionDisabled = disabled || pending || option.disabled}
    {@const optionId = `${generatedId}-${index}`}
    <label
      data-ui="settings-radio-option"
      data-selected={value === option.value}
      data-disabled={optionDisabled || undefined}
      for={optionId}
    >
      <Radio
        id={optionId}
        name={groupName}
        value={option.value}
        checked={value === option.value}
        disabled={optionDisabled}
        onSelect={onValueChange}
      />
      <span data-part="content">
        <span data-part="label">{option.label}</span>
        {#if option.description}<span data-part="description">{option.description}</span>{/if}
      </span>
    </label>
  {/each}
</div>
