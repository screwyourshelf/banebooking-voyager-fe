<script lang="ts">
  import { base } from "$app/paths";

  let {
    compact = false,
    symbol,
    temperature,
    wind,
  }: {
    compact?: boolean;
    symbol?: string | null;
    temperature?: number | null;
    wind?: number | null;
  } = $props();

  const hasTemperature = $derived(typeof temperature === "number");
  const hasWind = $derived(typeof wind === "number");
  const symbolPath = $derived(
    symbol ? `${base}/weather-symbols/svg/${encodeURIComponent(symbol)}.svg` : null
  );
</script>

{#if symbolPath || hasTemperature || (!compact && hasWind)}
  <span
    class={[
      "inline-flex items-center gap-xs text-ink-soft",
      compact ? "text-caption" : "text-body-sm",
    ]}
    data-ui="weather"
    data-variant={compact ? "compact" : "default"}
  >
    {#if symbolPath}
      <img
        class="size-weather-icon select-none"
        src={symbolPath}
        alt=""
        width="16"
        height="16"
        data-part="icon"
        draggable="false"
      />
    {/if}
    {#if hasTemperature}<span>{Math.round(temperature ?? 0)}°</span>{/if}
    {#if !compact && hasTemperature && hasWind}<span aria-hidden="true">·</span>{/if}
    {#if !compact && hasWind}<span>{Math.round(wind ?? 0)} m/s</span>{/if}
  </span>
{/if}
