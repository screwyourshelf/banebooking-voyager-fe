<script lang="ts" module>
  import type { TabsPrimitiveItem } from "../primitives/TabsPrimitive.svelte";

  export type TabItem = TabsPrimitiveItem;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import TabsPrimitive from "../primitives/TabsPrimitive.svelte";

  let {
    controls,
    items,
    label,
    onValueChange,
    value = $bindable(items[0]?.value ?? ""),
  }: {
    controls?: Snippet;
    items: readonly TabItem[];
    label: string;
    onValueChange?: (value: string) => void;
    value?: string;
  } = $props();

  const resolvedValue = $derived(
    items.some((item) => item.value === value) ? value : (items[0]?.value ?? "")
  );

  function selectValue(nextValue: string) {
    value = nextValue;
    onValueChange?.(nextValue);
  }
</script>

{#if items.length > 0}
  <TabsPrimitive
    {items}
    {controls}
    {label}
    value={resolvedValue}
    onValueChange={selectValue}
    data-ui="tabs"
    data-variant="section"
  />
{/if}
