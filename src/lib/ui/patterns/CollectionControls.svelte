<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SelectOption } from "../primitives/Select.svelte";

  export type CollectionChoiceContext = {
    disabled: boolean;
    onSelect: () => void;
    selected: boolean;
  };

  export type CollectionChoiceOption = {
    control?: Snippet<[CollectionChoiceContext]>;
    disabled?: boolean;
    label: string;
    value: string;
  };

  export type CollectionControlGroup = {
    label: string;
    onSelect: (value: string) => void;
    options: readonly CollectionChoiceOption[];
    selectedValues: readonly string[];
  };

  export type CollectionSearchControl = {
    label: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    value: string;
  };

  export type CollectionSortControl = {
    label: string;
    onValueChange: (value: string) => void;
    options: readonly SelectOption[];
    value: string;
  };

  type CollectionControlFieldBase = {
    disabled?: boolean;
    id: string;
    pending?: boolean;
    width?: "default" | "wide";
  };

  export type CollectionControlField =
    | (CollectionControlFieldBase & {
        label: string;
        max?: string;
        min?: string;
        onValueChange: (value: string) => void;
        type: "date";
        value: string;
      })
    | (CollectionControlFieldBase & {
        label: string;
        onValueChange: (value: string) => void;
        options: readonly SelectOption[];
        placeholder?: string;
        type: "select";
        value: string;
      })
    | (CollectionControlFieldBase & {
        checked: boolean;
        description?: string;
        onCheckedChange: (checked: boolean) => void;
        title: string;
        type: "switch";
      });
</script>

<script lang="ts">
  import { Cancel01Icon, FilterHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons";
  import Button from "../primitives/Button.svelte";
  import ChoiceButton from "../primitives/ChoiceButton.svelte";
  import DatePicker from "../primitives/DatePicker.svelte";
  import Icon from "../primitives/Icon.svelte";
  import Input from "../primitives/Input.svelte";
  import Select from "../primitives/Select.svelte";
  import Switch from "../primitives/Switch.svelte";

  type Props = {
    collapsible?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    fields?: readonly CollectionControlField[];
    groups?: readonly CollectionControlGroup[];
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
    <div
      class={[
        "grid min-h-collection-toggle grid-cols-collection-controls-top items-center gap-sm",
        !search && "collection-wide:hidden",
      ]}
      data-part="top"
    >
      {#if search}
        <div
          class="relative min-w-0 collection-native-search-cancel:hidden collection-wide:max-w-collection-search"
          data-part="search"
        >
          <label class="sr-only" data-ui="visually-hidden" for={searchId}>{search.label}</label>
          <span
            class="absolute z-10 top-1/2 left-collection-search-icon grid w-control-icon h-control-icon -translate-y-1/2 text-ink-faint pointer-events-none collection-icon:size-collection-control-icon"
            data-part="search-icon"><Icon icon={Search01Icon} /></span
          >
          <Input
            id={searchId}
            type="search"
            value={search.value}
            placeholder={search.placeholder}
            inputmode="search"
            autocomplete="off"
            disabled={isDisabled}
            oninput={(event) => search?.onValueChange(event.currentTarget.value)}
          />
          {#if search.value}
            <button
              class="absolute z-20 top-1/2 right-sm grid w-compact-control h-compact-control -translate-y-1/2 place-items-center border-0 rounded-control bg-transparent text-ink-faint enabled:hover:bg-surface-subtle enabled:hover:text-ink focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 collection-icon:size-collection-control-icon"
              type="button"
              data-part="clear-search"
              aria-label="Tøm søket"
              disabled={isDisabled}
              onclick={() => search?.onValueChange("")}
            >
              <Icon icon={Cancel01Icon} />
            </button>
          {/if}
        </div>
      {:else}
        <span
          class="inline-flex items-center gap-collection-control-detail text-control-muted text-caption font-collection-control-label collection-icon:size-collection-control-icon"
          data-part="label"><Icon icon={FilterHorizontalIcon} /> {label}</span
        >
      {/if}

      <Button
        variant="secondary"
        size="small"
        data-part="toggle"
        aria-expanded={contentVisible}
        aria-controls={contentId}
        disabled={isDisabled}
        onclick={() => setOpen(!contentVisible)}
      >
        Filtre
        {#if selectedCount > 0}
          <span
            class="grid size-collection-control-count min-w-collection-control-count place-items-center rounded-control bg-control-text text-control-surface text-micro leading-collection-count"
            data-part="count">{selectedCount}</span
          >
        {/if}
      </Button>
    </div>
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
      <fieldset
        class={[
          "grid min-w-0 gap-collection-control-detail border-0 m-0 p-0",
          mode === "filter" &&
            !search &&
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
            {@const optionDisabled = isDisabled || Boolean(option.disabled)}
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
    {/each}

    {#each fields as field (field.id)}
      <div
        class={[
          "grid min-w-collection-control-field gap-collection-control-detail collection-wide:grow-0 collection-wide:shrink collection-wide:basis-collection-control-field-wide",
          field.width === "wide" &&
            "collection-wide:grow collection-wide:basis-collection-control-field-expanded",
        ]}
        data-part="field"
        data-control={field.type}
        data-width={field.width ?? "default"}
        aria-busy={field.pending || undefined}
      >
        {#if field.type === "switch"}
          <label
            class="flex min-h-collection-toggle items-center justify-between gap-md rounded-collection-control-item bg-collection-control-item-surface px-collection-control-item-inline py-sm font-collection-control-label"
          >
            <span class="grid min-w-0" data-part="field-content">
              <strong class="text-control-text text-label">{field.title}</strong>
              {#if field.description}
                <small class="text-control-muted text-caption">{field.description}</small>
              {/if}
            </span>
            <Switch
              checked={field.checked}
              aria-label={field.title}
              disabled={isDisabled || field.disabled || field.pending}
              onCheckedChange={field.onCheckedChange}
            />
          </label>
        {:else}
          <label
            class="text-control-muted text-caption font-collection-control-label"
            for={`${generatedId}-${field.id}`}>{field.label}</label
          >
          {#if field.type === "date"}
            <DatePicker
              id={`${generatedId}-${field.id}`}
              presentation="filter"
              value={field.value}
              minValue={field.min}
              maxValue={field.max}
              disabled={isDisabled || field.disabled}
              pending={field.pending}
              onValueChange={field.onValueChange}
            />
          {:else}
            <Select
              id={`${generatedId}-${field.id}`}
              aria-label={field.label}
              value={field.value}
              options={field.options}
              placeholder={field.placeholder}
              disabled={isDisabled || field.disabled}
              pending={field.pending}
              onValueChange={field.onValueChange}
            />
          {/if}
        {/if}
      </div>
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
