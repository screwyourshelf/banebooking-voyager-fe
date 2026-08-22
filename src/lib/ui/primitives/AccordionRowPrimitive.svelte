<script lang="ts">
  import { Accordion } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    action?: Snippet;
    children: Snippet;
    details: Snippet;
    disabled?: boolean;
    value: string;
  };

  let { action, children: summary, details, disabled = false, value }: Props = $props();
</script>

<Accordion.Item {value} {disabled} data-ui-primitive="accordion-row" data-part="surface">
  <div data-part="summary-row">
    <Accordion.Header level={3} data-part="trigger-header">
      <Accordion.Trigger data-part="trigger">
        {@render summary()}
        <span data-part="indicator" aria-hidden="true">
          <svg viewBox="0 0 20 20"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg>
        </span>
      </Accordion.Trigger>
    </Accordion.Header>
    {#if action}<div data-part="summary-action">{@render action()}</div>{/if}
  </div>

  <Accordion.Content forceMount={false} data-part="details">
    {@render details()}
  </Accordion.Content>
</Accordion.Item>
