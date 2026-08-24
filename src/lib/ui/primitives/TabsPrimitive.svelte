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
    presentation: "section";
    value: string;
  };

  let {
    "data-ui": dataUi,
    "data-variant": dataVariant,
    controls,
    items,
    label,
    onValueChange,
    presentation,
    value,
  }: Props = $props();
</script>

<Tabs.Root
  class={["min-w-0", presentation === "section" && "grid gap-lg md:gap-xl lg:gap-md"]}
  {value}
  {onValueChange}
  activationMode="automatic"
  loop
  data-ui-primitive="tabs"
  data-ui={dataUi}
  data-variant={dataVariant}
>
  <Tabs.List
    class={presentation === "section"
      ? "grid w-full grid-cols-2 gap-xs border border-tabs-list-border rounded-tabs-list bg-tabs-list p-xs shadow-surface-sm data-[count=1]:grid-cols-1 md:w-fit md:min-w-tabs-list"
      : ""}
    aria-label={label}
    data-slot="tabs-list"
    data-count={items.length}
  >
    {#each items as item (item.value)}
      <Tabs.Trigger
        class={presentation === "section"
          ? "min-w-0 min-h-tabs-trigger gap-sm border border-transparent rounded-tabs-trigger px-md py-tabs-trigger text-control-muted text-body-sm font-tabs-trigger after:right-tabs-indicator-inline after:bottom-tabs-indicator-bottom after:left-tabs-indicator-inline after:h-tabs-indicator after:rounded-control after:bg-transparent after:content-empty after:opacity-100 data-[state=active]:border-tabs-active-border data-[state=active]:bg-tabs-active-surface data-[state=active]:text-control-text data-[state=active]:shadow-none data-[state=active]:after:bg-choice-indicator data-[active]:border-tabs-active-border data-[active]:bg-tabs-active-surface data-[active]:text-control-text data-[active]:shadow-none data-[active]:after:bg-choice-indicator"
          : ""}
        value={item.value}
        disabled={item.disabled}
        data-slot="tabs-trigger"
      >
        {item.label}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>

  {@render controls?.()}

  {#each items as item (item.value)}
    <Tabs.Content
      class={presentation === "section" ? "min-w-0 m-0 lg:relative lg:z-1" : ""}
      value={item.value}
      data-slot="tabs-content"
    >
      {@render item.content()}
    </Tabs.Content>
  {/each}
</Tabs.Root>
