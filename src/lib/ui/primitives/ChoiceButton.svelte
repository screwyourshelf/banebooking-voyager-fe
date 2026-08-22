<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "aria-pressed" | "children" | "onclick"> & {
    children: Snippet;
    onSelect: () => void;
    selected: boolean;
  };

  let {
    children,
    disabled = false,
    onSelect,
    selected,
    type = "button",
    ...attributes
  }: Props = $props();

  function select() {
    if (!disabled) onSelect();
  }
</script>

<button
  {...attributes}
  {type}
  {disabled}
  aria-pressed={selected}
  data-ui-primitive="choice"
  data-selected={selected}
  onclick={select}
>
  {@render children()}
</button>
