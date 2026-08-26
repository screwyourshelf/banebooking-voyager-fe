<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import AccordionListPrimitive from "../primitives/AccordionListPrimitive.svelte";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children" | "role"> & {
    busy?: boolean;
    children?: Snippet;
    defaultValue?: string;
    label?: string;
    onValueChange?: (value: string) => void;
    value?: string;
  };

  let {
    busy = false,
    children,
    defaultValue = "",
    label,
    onValueChange,
    value = $bindable(defaultValue),
    ...attributes
  }: Props = $props();
</script>

<AccordionListPrimitive
  {...attributes}
  class="grid"
  {busy}
  presentation="collection"
  data-ui="collection-list"
  role="list"
  aria-label={label}
  aria-busy={busy || undefined}
  bind:value
  {onValueChange}
>
  {@render children?.()}
</AccordionListPrimitive>
