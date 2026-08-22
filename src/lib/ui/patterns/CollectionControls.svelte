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
  data-ui="collection-controls"
  data-surface="control"
  data-mode={mode}
  data-indicator={indicator}
  data-collapsible={isCollapsible}
  data-has-search={Boolean(search)}
  data-open={contentVisible}
  aria-label={label}
  aria-busy={pending || undefined}
>
  {#if isCollapsible}
    <div data-part="top">
      {#if search}
        <div data-part="search">
          <label data-ui="visually-hidden" for={searchId}>{search.label}</label>
          <span data-part="search-icon"><Icon icon={Search01Icon} /></span>
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
        <span data-part="label"><Icon icon={FilterHorizontalIcon} /> {label}</span>
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
        {#if selectedCount > 0}<span data-part="count">{selectedCount}</span>{/if}
      </Button>
    </div>
  {/if}

  <div id={contentId} data-part="content">
    {#each groups as group (group.label)}
      <fieldset data-part="group">
        <legend>{group.label}</legend>
        <div data-part="choices">
          {#each group.options as option (option.value)}
            {@const selected = group.selectedValues.includes(option.value)}
            {@const optionDisabled = isDisabled || Boolean(option.disabled)}
            {#if option.control}
              <span data-part="custom-control">
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
        data-part="field"
        data-control={field.type}
        data-width={field.width ?? "default"}
        aria-busy={field.pending || undefined}
      >
        {#if field.type === "switch"}
          <label>
            <span data-part="field-content">
              <strong>{field.title}</strong>
              {#if field.description}<small>{field.description}</small>{/if}
            </span>
            <Switch
              checked={field.checked}
              aria-label={field.title}
              disabled={isDisabled || field.disabled || field.pending}
              onCheckedChange={field.onCheckedChange}
            />
          </label>
        {:else}
          <label for={`${generatedId}-${field.id}`}>{field.label}</label>
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
      <div data-part="sort">
        <label for={`${generatedId}-sort`}>{sort.label}</label>
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
