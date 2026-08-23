<script lang="ts" module>
  export type FormStep = {
    label: string;
    value: string;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "../primitives/Button.svelte";

  let {
    children,
    items,
    label,
    onValueChange,
    value = $bindable(items[0]?.value ?? ""),
  }: {
    children: Snippet;
    items: readonly FormStep[];
    label: string;
    onValueChange?: (value: string) => void;
    value?: string;
  } = $props();

  const resolvedValue = $derived(
    items.some((item) => item.value === value) ? value : (items[0]?.value ?? "")
  );

  function select(nextValue: string) {
    value = nextValue;
    onValueChange?.(nextValue);
  }
</script>

<div data-ui="form-steps">
  <nav data-part="navigation" aria-label={label}>
    <ol data-part="list">
      {#each items as item, index (item.value)}
        <li data-state={item.value === resolvedValue ? "active" : "inactive"}>
          <Button
            data-part="trigger"
            variant="ghost"
            size="small"
            aria-current={item.value === resolvedValue ? "step" : undefined}
            onclick={() => select(item.value)}
          >
            <span data-part="number">{index + 1}</span>
            <span>{item.label}</span>
          </Button>
        </li>
      {/each}
    </ol>
  </nav>
  <div data-part="content">{@render children()}</div>
</div>
