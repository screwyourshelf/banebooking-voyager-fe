<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type TabsPrimitiveItem = {
    content: Snippet;
    disabled?: boolean;
    label: string;
    value: string;
  };
</script>

<script lang="ts">
  import { Tabs } from "bits-ui";

  type Props = {
    "data-ui"?: string;
    "data-variant"?: string;
    controls?: Snippet;
    items: readonly TabsPrimitiveItem[];
    label: string;
    onValueChange?: (value: string) => void;
    value: string;
  };

  let {
    "data-ui": dataUi,
    "data-variant": dataVariant,
    controls,
    items,
    label,
    onValueChange,
    value,
  }: Props = $props();
</script>

<Tabs.Root
  class="min-w-0"
  {value}
  {onValueChange}
  activationMode="automatic"
  loop
  data-ui-primitive="tabs"
  data-ui={dataUi}
  data-variant={dataVariant}
>
  <Tabs.List aria-label={label} data-slot="tabs-list" data-count={items.length}>
    {#each items as item (item.value)}
      <Tabs.Trigger value={item.value} disabled={item.disabled} data-slot="tabs-trigger">
        {item.label}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>

  {@render controls?.()}

  {#each items as item (item.value)}
    <Tabs.Content value={item.value} data-slot="tabs-content">
      {@render item.content()}
    </Tabs.Content>
  {/each}
</Tabs.Root>
