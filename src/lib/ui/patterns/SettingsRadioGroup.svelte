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
  import { getOptionalFormControlContext, mergeAriaIds } from "../primitives/form-control-context";

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
  const formControl = getOptionalFormControlContext();
  const describedBy = $derived(mergeAriaIds(formControl?.descriptionId, formControl?.errorId));
</script>

<div
  class={["grid gap-sm", layout === "stacked" ? "grid-cols-1" : "md:grid-cols-2"]}
  id={formControl?.controlId}
  data-ui="settings-radio-group"
  data-layout={layout}
  role="radiogroup"
  aria-label={formControl ? undefined : label}
  aria-labelledby={formControl?.labelId}
  aria-describedby={describedBy}
  aria-invalid={formControl?.invalid ? "true" : undefined}
  aria-required={formControl?.required || undefined}
  aria-busy={pending || undefined}
>
  {#each options as option, index (option.value)}
    {@const optionDisabled = disabled || pending || option.disabled}
    {@const optionId = `${generatedId}-${index}`}
    {@const selected = value === option.value}
    <label
      class={[
        "relative flex min-h-settings-radio-option items-center gap-md overflow-hidden border rounded-settings-radio-option bg-surface px-md py-settings-radio-option text-body-sm font-settings-radio-option cursor-pointer transition duration-160",
        selected
          ? "border-settings-radio-selected-border bg-settings-radio-selected-surface text-ink"
          : "border-line text-ink-soft hover:border-line-strong hover:bg-surface-subtle hover:text-ink",
        optionDisabled && "cursor-not-allowed opacity-settings-disabled",
      ]}
      data-ui="settings-radio-option"
      data-selected={selected}
      data-disabled={optionDisabled || undefined}
      for={optionId}
    >
      <Radio
        id={optionId}
        name={groupName}
        value={option.value}
        checked={selected}
        disabled={optionDisabled}
        onSelect={onValueChange}
      />
      <span class="grid min-w-0 gap-2xs" data-part="content">
        <span data-part="label">{option.label}</span>
        {#if option.description}
          <span
            class={[
              "text-caption font-settings-radio-description leading-settings-description",
              selected ? "text-ink-soft" : "text-ink-faint",
            ]}
            data-part="description"
          >
            {option.description}
          </span>
        {/if}
      </span>
      <span
        class={[
          "absolute inset-x-md bottom-settings-radio-indicator h-choice-indicator rounded-control pointer-events-none",
          selected ? "bg-choice-indicator" : "bg-transparent",
        ]}
        data-part="indicator"
        aria-hidden="true"
      ></span>
    </label>
  {/each}
</div>
