<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<
    PublicHtmlAttributes<HTMLButtonAttributes>,
    "aria-checked" | "children" | "onclick" | "role"
  > & {
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
  class={[
    "relative inline-flex w-switch h-switch flex-none items-center border border-transparent rounded-control p-switch-padding cursor-pointer transition duration-120 focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    checked ? "bg-selection-indicator" : "bg-switch-track",
  ]}
  {type}
  {disabled}
  role="switch"
  aria-checked={checked}
  data-ui-primitive="switch"
  onclick={toggle}
>
  <span
    class={[
      "w-switch-thumb h-switch-thumb rounded-control bg-background shadow-switch-thumb transition duration-120",
      checked ? "translate-x-switch-thumb-shift" : "translate-x-0",
    ]}
    data-part="thumb"
    aria-hidden="true"
  ></span>
</button>
