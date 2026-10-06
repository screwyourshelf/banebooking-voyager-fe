<script lang="ts">
  import type { Snippet } from "svelte";
  import CollectionRow from "./CollectionRow.svelte";
  import ScheduleTime from "./ScheduleTime.svelte";
  import Weather from "./Weather.svelte";

  let {
    id,
    start,
    end,
    title,
    description,
    muted = false,
    busy = false,
    weather,
    actions,
  }: {
    id: string;
    start: string;
    end: string;
    title: string;
    description?: string;
    muted?: boolean;
    busy?: boolean;
    weather?: { symbol?: string; temperature?: number; wind?: number };
    actions?: Snippet;
  } = $props();

  const hasWeather = $derived(
    Boolean(weather?.symbol) ||
      typeof weather?.temperature === "number" ||
      typeof weather?.wind === "number"
  );
</script>

{#snippet weatherContent()}
  <Weather
    compact
    symbol={weather?.symbol}
    temperature={weather?.temperature}
    wind={weather?.wind}
  />
{/snippet}

{#snippet time()}
  <ScheduleTime
    start={start.slice(0, 5)}
    end={end.slice(0, 5)}
    accessory={hasWeather ? weatherContent : undefined}
  />
{/snippet}

<CollectionRow
  layout="schedule"
  leading={time}
  {title}
  {description}
  {muted}
  {busy}
  interaction={actions ? { type: "expand", value: id, actions } : { type: "static" }}
/>
