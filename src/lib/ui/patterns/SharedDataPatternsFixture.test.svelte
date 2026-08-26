<script lang="ts">
  import Metric from "./Metric.svelte";
  import MetricGrid from "./MetricGrid.svelte";
  import ScheduleTime from "./ScheduleTime.svelte";
  import Weather from "./Weather.svelte";
</script>

{#snippet compactWeather()}
  <Weather compact symbol="fair_day" temperature={18.4} wind={4.2} />
{/snippet}

{#snippet metricIcon()}
  <span data-testid="metric-icon">M</span>
{/snippet}

<ScheduleTime start="10:00" end="11:00" accessory={compactWeather} />

<Weather symbol="cloudy" temperature={19.4} wind={4.2} />

<MetricGrid label="Nøkkeltall">
  <Metric
    label="Bookede timer"
    value="44,5"
    unit="t"
    description="Året før: 35 t"
    change="−2,5 %"
    direction="down"
    icon={metricIcon}
  />
</MetricGrid>

<MetricGrid label="Medlemsnøkkeltall" variant="members">
  <Metric
    label="Aktive brukere"
    value="8"
    unit="brukere"
    description="Med minst én booking"
    icon={metricIcon}
  />
</MetricGrid>
