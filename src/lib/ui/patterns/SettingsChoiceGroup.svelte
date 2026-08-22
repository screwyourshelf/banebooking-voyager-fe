<script lang="ts" module>
  export type SettingsChoiceOption = {
    disabled?: boolean;
    label: string;
    value: string;
  };
</script>

<script lang="ts">
  import ChoiceButton from "../primitives/ChoiceButton.svelte";

  type Props = {
    disabled?: boolean;
    label: string;
    onToggle: (value: string) => void;
    options: readonly SettingsChoiceOption[];
    pending?: boolean;
    selectedValues: readonly string[];
  };

  let {
    disabled = false,
    label,
    onToggle,
    options,
    pending = false,
    selectedValues,
  }: Props = $props();
</script>

<div
  data-ui="settings-choice-group"
  role="group"
  aria-label={label}
  aria-busy={pending || undefined}
>
  {#each options as option (option.value)}
    <ChoiceButton
      selected={selectedValues.includes(option.value)}
      disabled={disabled || pending || option.disabled}
      onSelect={() => onToggle(option.value)}
    >
      {option.label}
    </ChoiceButton>
  {/each}
</div>
