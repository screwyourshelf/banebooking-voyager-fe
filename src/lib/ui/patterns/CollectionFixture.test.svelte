<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import Collection from "./Collection.svelte";
  import CollectionGroup from "./CollectionGroup.svelte";
  import CollectionList from "./CollectionList.svelte";
  import CollectionRow from "./CollectionRow.svelte";

  let {
    busy = false,
    grouped = false,
    onAction,
    onOpen,
  }: {
    busy?: boolean;
    grouped?: boolean;
    onAction: () => void;
    onOpen: () => void;
  } = $props();
</script>

{#snippet icon()}
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>
{/snippet}

{#snippet filters()}
  <button type="button">Kommende</button>
{/snippet}

{#snippet rowAction()}
  <Button variant="secondary" size="small" onclick={onAction}>Les mer</Button>
{/snippet}

{#snippet timeRange()}
  <span><strong>09:00</strong>–10:00</span>
{/snippet}

{#snippet footer()}
  <Button variant="secondary" size="small">Vis flere</Button>
{/snippet}

<Collection
  title="3 arrangementer"
  scope="Kommende"
  {busy}
  {icon}
  {filters}
  {footer}
  filtersLabel="Arrangementfiltre"
>
  <CollectionList label="Arrangementer" {busy}>
    {#if grouped}
      <CollectionGroup date="2026-08-22" label="lørdag 22. august" relativeLabel="I dag">
        <CollectionRow
          layout="schedule"
          leading={timeRange}
          title="Bane 1"
          description="Tennis"
          status={{ label: "Ledig", tone: "available" }}
        />
      </CollectionGroup>
    {:else}
      <CollectionRow
        title="Klubbmesterskap"
        category={{ label: "Turnering", tone: "event" }}
        description="Tennis · Åpent for alle medlemmer"
        meta="Starter om 4 dager"
      />
      <CollectionRow
        title="Høstcup"
        description="Padel"
        status={{ label: "Kommende", tone: "available" }}
        interaction={{ type: "open", onOpen }}
      />
      <CollectionRow
        title="Ny banebooking"
        description="Nytt fra klubben"
        interaction={{ type: "action", action: rowAction }}
      />
    {/if}
  </CollectionList>
</Collection>
