<script lang="ts">
  import { Accordion } from "bits-ui";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "class"> & {
    busy?: boolean;
    children?: Snippet;
    class?: "grid";
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    presentation?: "default" | "collection";
    value?: string;
  };

  let {
    busy = false,
    children,
    class: className,
    defaultValue = "",
    onValueChange,
    presentation = "default",
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
  class={[
    "min-w-0",
    className === "grid" && "grid",
    presentation === "collection" &&
      "gap-record-gap p-record-inline collection-list-last-surface:collection-wide:border-b-0 collection-wide:gap-0 collection-wide:p-0",
    presentation === "collection" &&
      busy &&
      "opacity-collection-busy transition-opacity duration-collection-busy ease-collection",
  ]}
  type="single"
  {value}
  onValueChange={handleValueChange}
  data-ui-primitive="accordion-list"
>
  {@render children?.()}
</Accordion.Root>
