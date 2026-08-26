<script lang="ts">
  import ChoiceButton from "../primitives/ChoiceButton.svelte";
  import type { CollectionControlGroup } from "./collection-controls";

  let {
    disabled,
    group,
    hasSearch,
    mode,
  }: {
    disabled: boolean;
    group: CollectionControlGroup;
    hasSearch: boolean;
    mode: "filter" | "selection";
  } = $props();
</script>

<fieldset
  class={[
    "grid min-w-0 gap-collection-control-detail border-0 m-0 p-0",
    mode === "filter" &&
      !hasSearch &&
      "collection-wide:flex collection-wide:flex-1 collection-wide:items-center collection-wide:gap-md",
    mode === "selection" &&
      "collection-wide:flex collection-wide:flex-initial collection-wide:items-center collection-wide:gap-md",
  ]}
  data-part="group"
>
  <legend class="text-control-muted text-caption font-collection-control-label"
    >{group.label}</legend
  >
  <div class="flex min-w-0 flex-wrap gap-collection-control-detail" data-part="choices">
    {#each group.options as option (option.value)}
      {@const selected = group.selectedValues.includes(option.value)}
      {@const optionDisabled = disabled || Boolean(option.disabled)}
      {#if option.control}
        <span class="contents" data-part="custom-control">
          {@render option.control({
            disabled: optionDisabled,
            onSelect: () => group.onSelect(option.value),
            selected,
          })}
        </span>
      {:else}
        <ChoiceButton
          {selected}
          disabled={optionDisabled}
          onSelect={() => group.onSelect(option.value)}
        >
          {option.label}
        </ChoiceButton>
      {/if}
    {/each}
  </div>
</fieldset>
