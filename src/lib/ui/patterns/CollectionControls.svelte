<script lang="ts" module>
  export type {
    CollectionChoiceContext,
    CollectionChoiceOption,
    CollectionControlField,
    CollectionControlGroup,
    CollectionSearchControl,
    CollectionSortControl,
  } from "./collection-controls";
</script>

<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import Select from "../primitives/Select.svelte";
  import CollectionControlField from "./CollectionControlField.svelte";
  import CollectionControlGroup from "./CollectionControlGroup.svelte";
  import CollectionControlsHeader from "./CollectionControlsHeader.svelte";
  import type {
    CollectionControlField as CollectionControlFieldContract,
    CollectionControlGroup as CollectionControlGroupContract,
    CollectionSearchControl,
    CollectionSortControl,
  } from "./collection-controls";

  type Props = {
    collapsible?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    fields?: readonly CollectionControlFieldContract[];
    groups?: readonly CollectionControlGroupContract[];
    indicator?: "default" | "activity";
    label: string;
    mode?: "filter" | "selection";
    onOpenChange?: (open: boolean) => void;
    onReset?: () => void;
    open?: boolean;
    pending?: boolean;
    search?: CollectionSearchControl;
    sort?: CollectionSortControl;
  };

  let {
    collapsible,
    defaultOpen = false,
    disabled = false,
    fields = [],
    groups = [],
    indicator = "default",
    label,
    mode = "filter",
    onOpenChange,
    onReset,
    open = $bindable(defaultOpen),
    pending = false,
    search,
    sort,
  }: Props = $props();

  const generatedId = $props.id();
  const contentId = `${generatedId}-content`;
  const searchId = `${generatedId}-search`;
  const isCollapsible = $derived(collapsible ?? mode === "filter");
  const contentVisible = $derived(!isCollapsible || open);
  const isDisabled = $derived(disabled || pending);
  const selectedCount = $derived(
    groups.reduce((count, group) => count + group.selectedValues.length, 0)
  );
  const hasActiveFilters = $derived(selectedCount > 0 || Boolean(search?.value.trim()));

  function setOpen(nextOpen: boolean) {
    open = nextOpen;
    onOpenChange?.(nextOpen);
  }
</script>

<section
  class={[
    "bg-collection-control px-collection-controls-inline pt-collection-controls-top pb-collection-controls-bottom text-control-text collection-controls-following:border-t collection-controls-following:border-collection-control-divider collection-booking-choice:text-control-muted collection-booking-choice-selected:border-collection-choice-selected-border collection-booking-choice-selected:bg-collection-control-item-hover collection-booking-choice-selected:text-control-text collection-choice-control:border-collection-control-divider collection-choice-control:bg-collection-control-item-surface collection-choice-control:text-control-muted collection-choice-control:enabled:hover:bg-collection-control-item-hover collection-choice-control:enabled:hover:text-control-text collection-choice-selected:border-collection-choice-selected-border collection-choice-selected:bg-collection-control-item-hover collection-choice-selected:text-control-text collection-field-control:w-full collection-field-control:min-h-collection-field-control collection-field-control:border-collection-field-border collection-field-control:bg-collection-control-item-surface collection-field-control:text-control-text collection-field-control:text-body-sm collection-toggle-control:h-collection-toggle collection-toggle-control:border-collection-field-border collection-toggle-control:bg-collection-control-item-surface collection-toggle-control:text-control-muted collection-toggle-control:enabled:hover:bg-collection-control-item-surface collection-toggle-expanded:border-collection-toggle-expanded-border collection-toggle-expanded:bg-collection-control-item-hover collection-toggle-expanded:text-control-text collection-toggle-expanded:enabled:hover:bg-collection-control-item-hover collection-reset-control:text-control-text collection-wide:px-xl collection-wide:pt-md collection-wide:pb-collection-controls-wide-bottom collection-wide:collection-toggle-control:hidden collection-wide:collection-reset-control:self-center collection-wide:collection-reset-control:ml-auto",
    indicator === "activity" && "collection-choice-selected-indicator:bg-activity-accent",
  ]}
  data-ui="collection-controls"
  data-mode={mode}
  data-indicator={indicator}
  data-collapsible={isCollapsible}
  data-has-search={Boolean(search)}
  data-open={contentVisible}
  aria-label={label}
  aria-busy={pending || undefined}
>
  {#if isCollapsible}
    <CollectionControlsHeader
      {contentId}
      {contentVisible}
      disabled={isDisabled}
      {label}
      onToggle={() => setOpen(!contentVisible)}
      {search}
      {searchId}
      {selectedCount}
    />
  {/if}

  <div
    class={[
      "grid min-w-0 gap-md collection-wide:flex collection-wide:flex-wrap collection-wide:items-end collection-wide:gap-lg",
      isCollapsible &&
        "mt-collection-controls-content border-t border-collection-control-divider pt-md",
      !contentVisible && "hidden collection-wide:flex",
      search
        ? "collection-wide:mt-md collection-wide:border-t collection-wide:border-collection-control-divider collection-wide:pt-md"
        : "collection-wide:mt-0 collection-wide:border-0 collection-wide:pt-0",
    ]}
    id={contentId}
    data-part="content"
  >
    {#each groups as group (group.label)}
      <CollectionControlGroup disabled={isDisabled} {group} hasSearch={Boolean(search)} {mode} />
    {/each}

    {#each fields as field (field.id)}
      <CollectionControlField disabled={isDisabled} {field} {generatedId} />
    {/each}

    {#if sort}
      <div
        class="grid min-w-collection-control-field gap-collection-control-detail collection-wide:grow-0 collection-wide:shrink collection-wide:basis-collection-control-field-wide"
        data-part="sort"
      >
        <label
          class="text-control-muted text-caption font-collection-control-label"
          for={`${generatedId}-sort`}>{sort.label}</label
        >
        <Select
          id={`${generatedId}-sort`}
          aria-label={sort.label}
          value={sort.value}
          options={sort.options}
          disabled={isDisabled}
          onValueChange={sort.onValueChange}
        />
      </div>
    {/if}

    {#if mode === "filter" && hasActiveFilters && onReset}
      <Button
        variant="ghost"
        size="small"
        data-part="reset"
        disabled={isDisabled}
        onclick={onReset}
      >
        Nullstill
      </Button>
    {/if}
  </div>
</section>
