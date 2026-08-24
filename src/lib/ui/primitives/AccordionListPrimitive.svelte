<script lang="ts">
  import { Accordion } from "bits-ui";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: Snippet;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    value?: string;
  };

  let {
    children,
    defaultValue = "",
    onValueChange,
    value = $bindable(defaultValue),
    ...attributes
  }: Props = $props();

  function handleValueChange(nextValue: string) {
    value = nextValue;
    onValueChange?.(nextValue);
  }

  const accordionAttributes = $derived({ ...attributes, id: attributes.id ?? undefined });
</script>

<Accordion.Root
  {...accordionAttributes}
  class="min-w-0"
  type="single"
  {value}
  onValueChange={handleValueChange}
  data-ui-primitive="accordion-list"
>
  {@render children?.()}
</Accordion.Root>
