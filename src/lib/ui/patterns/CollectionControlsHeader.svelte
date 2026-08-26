<script lang="ts">
  import { Cancel01Icon, FilterHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons";
  import Button from "../primitives/Button.svelte";
  import Icon from "../primitives/Icon.svelte";
  import Input from "../primitives/Input.svelte";
  import type { CollectionSearchControl } from "./collection-controls";

  let {
    contentId,
    contentVisible,
    disabled,
    label,
    onToggle,
    search,
    searchId,
    selectedCount,
  }: {
    contentId: string;
    contentVisible: boolean;
    disabled: boolean;
    label: string;
    onToggle: () => void;
    search?: CollectionSearchControl;
    searchId: string;
    selectedCount: number;
  } = $props();
</script>

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
        {disabled}
        oninput={(event) => search?.onValueChange(event.currentTarget.value)}
      />
      {#if search.value}
        <button
          class="absolute z-20 top-1/2 right-sm grid w-compact-control h-compact-control -translate-y-1/2 place-items-center border-0 rounded-control bg-transparent text-ink-faint enabled:hover:bg-surface-subtle enabled:hover:text-ink focus-visible:outline-3 focus-visible:outline-focus-outline focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 collection-icon:size-collection-control-icon"
          type="button"
          data-part="clear-search"
          aria-label="Tøm søket"
          {disabled}
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
    {disabled}
    onclick={onToggle}
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
