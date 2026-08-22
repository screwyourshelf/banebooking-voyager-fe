<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "aria-checked" | "children" | "onclick" | "role"> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  };

  let {
    checked = $bindable(false),
    disabled = false,
    onCheckedChange,
    type = "button",
    ...attributes
  }: Props = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onCheckedChange?.(checked);
  }
</script>

<button
  {...attributes}
  {type}
  {disabled}
  role="switch"
  aria-checked={checked}
  data-ui-primitive="switch"
  onclick={toggle}
>
  <span data-part="thumb" aria-hidden="true"></span>
</button>
