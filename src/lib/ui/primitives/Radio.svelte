<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "checked" | "onchange" | "type" | "value"> & {
    checked: boolean;
    onSelect: (value: string) => void;
    value: string;
  };

  let { checked, disabled = false, onSelect, value, ...attributes }: Props = $props();

  function select() {
    if (!disabled) onSelect(value);
  }
</script>

<input
  {...attributes}
  class="w-radio h-radio flex-none appearance-none border border-line-strong rounded-control bg-surface cursor-pointer checked:border-radio-selected checked:border-selection-indicator focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  type="radio"
  {value}
  {checked}
  {disabled}
  data-ui-primitive="radio"
  onchange={select}
/>
