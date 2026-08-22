<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import CollectionList from "./CollectionList.svelte";
  import CollectionRow from "./CollectionRow.svelte";

  let {
    busy = false,
    onDetailsAction,
    onMoveDown,
    onMoveUp,
    onOpen,
    onQuickAction,
    value = $bindable("first"),
  }: {
    busy?: boolean;
    onDetailsAction: () => void;
    onMoveDown: () => void;
    onMoveUp: () => void;
    onOpen: () => void;
    onQuickAction: () => void;
    value?: string;
  } = $props();
</script>

{#snippet firstDetails()}
  <p>Medlemskap og sperrehistorikk.</p>
{/snippet}

{#snippet firstActions()}
  <Button variant="secondary" size="small" onclick={onDetailsAction}>Rediger bruker</Button>
{/snippet}

{#snippet quickAction()}
  <Button size="small" onclick={onQuickAction}>Book</Button>
{/snippet}

{#snippet secondDetails()}
  <p>Banereglement og bookingvilkår.</p>
{/snippet}

<CollectionList label="Sammensatte rader" bind:value>
  <CollectionRow
    title="Ada Lovelace"
    description="ada@example.no"
    interaction={{
      type: "expand",
      value: "first",
      details: firstDetails,
      actions: firstActions,
    }}
  />
  <CollectionRow
    title="Bane 1"
    description="09:00–10:00"
    interaction={{
      type: "expand",
      value: "second",
      details: secondDetails,
      summaryAction: quickAction,
    }}
  />
  <CollectionRow
    title="Sentralbanen"
    description="Tennis"
    {busy}
    interaction={{
      type: "reorder",
      onOpen,
      onMoveUp,
      onMoveDown,
      moveUpDisabled: true,
    }}
  />
</CollectionList>
