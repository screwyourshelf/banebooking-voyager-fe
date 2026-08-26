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

<div class="flex min-w-0 min-h-full flex-1 flex-col" data-ui="form-steps">
  <nav
    class="flex-none border-b border-line bg-surface px-form-step-navigation-inline pt-sm pb-0 md:px-form-step-navigation-wide-inline md:pt-md"
    data-part="navigation"
    aria-label={label}
  >
    <ol class="grid max-w-form-steps grid-cols-2 gap-xs m-0 p-0 list-none" data-part="list">
      {#each items as item, index (item.value)}
        {@const active = item.value === resolvedValue}
        <li
          class={[
            "form-step-trigger:relative form-step-trigger:w-full form-step-trigger:justify-start form-step-trigger:gap-sm form-step-trigger:rounded-none form-step-trigger:text-body-sm form-step-trigger:font-form-step",
            active ? "form-step-trigger:text-ink" : "form-step-trigger:text-ink-faint",
          ]}
          data-state={active ? "active" : "inactive"}
        >
          <Button
            data-part="trigger"
            variant="ghost"
            size="small"
            aria-current={active ? "step" : undefined}
            onclick={() => select(item.value)}
          >
            <span
              class="text-choice-indicator font-form-step-number tabular-nums"
              data-part="number">{index + 1}</span
            >
            <span>{item.label}</span>
            <span
              class={[
                "absolute inset-x-md bottom-0 h-form-step-indicator rounded-t-control pointer-events-none",
                active ? "bg-choice-indicator" : "bg-transparent",
              ]}
              data-part="indicator"
              aria-hidden="true"
            ></span>
          </Button>
        </li>
      {/each}
    </ol>
  </nav>
  <div
    class="flex min-w-0 min-h-0 flex-1 flex-col form-steps-form:min-h-full form-steps-form:flex-1"
    data-part="content"
  >
    {@render children()}
  </div>
</div>
