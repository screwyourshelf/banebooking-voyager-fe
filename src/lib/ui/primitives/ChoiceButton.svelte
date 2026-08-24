<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<
    PublicHtmlAttributes<HTMLButtonAttributes>,
    "aria-pressed" | "children" | "onclick"
  > & {
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
  class={[
    "relative inline-flex min-w-choice min-h-choice items-center justify-center overflow-hidden border rounded-choice px-choice-inline py-choice-block font-body text-body-sm font-choice leading-choice whitespace-nowrap cursor-pointer transition duration-160 enabled:hover:bg-choice-hover-surface enabled:hover:text-choice-hover-text focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    selected
      ? "border-choice-selected-border bg-choice-selected-surface text-choice-selected-text"
      : "border-choice-border bg-choice-surface text-choice-text",
  ]}
  {type}
  {disabled}
  aria-pressed={selected}
  data-ui-primitive="choice"
  data-selected={selected}
  onclick={select}
>
  {@render children()}
  <span
    class={[
      "absolute inset-x-sm bottom-choice-indicator-offset h-choice-indicator rounded-control",
      selected ? "bg-choice-indicator" : "bg-transparent",
    ]}
    data-part="indicator"
    aria-hidden="true"
  ></span>
</button>
