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
  type="radio"
  {value}
  {checked}
  {disabled}
  data-ui-primitive="radio"
  onchange={select}
/>
