<script lang="ts">
  import {
    Calendar03Icon,
    CalendarCheckIn01Icon,
    CalendarSetting01Icon,
    UserMultiple02Icon,
  } from "@hugeicons/core-free-icons";
  import type { BookingstatistikkRespons } from "$lib/contracts";
  import { Icon, Metric, MetricGrid } from "$lib/ui";
  import { formatCount, formatHours, formatPercentage } from "./model";

  let { statistics }: { statistics: BookingstatistikkRespons } = $props();

  const metrics = $derived.by(() => {
    const { nøkkeltall, sammenligning, endringBookedeTimerProsent } = statistics;
    return [
      {
        label: "Bookede timer",
        value: formatHours(nøkkeltall.bookedeTimer),
        description: sammenligning
          ? `Året før: ${formatHours(sammenligning.bookedeTimer)}`
          : "Valgt periode",
        change: formatPercentage(endringBookedeTimerProsent),
        direction:
          endringBookedeTimerProsent !== null && endringBookedeTimerProsent < 0
            ? ("down" as const)
            : ("up" as const),
        icon: CalendarSetting01Icon,
      },
      {
        label: "Antall bookinger",
        value: formatCount(nøkkeltall.antallBookinger),
        unit: "stk.",
        description: sammenligning
          ? `Året før: ${formatCount(sammenligning.antallBookinger)} stk.`
          : "Valgt periode",
        icon: CalendarCheckIn01Icon,
      },
      {
        label: "Personlige bookinger",
        value: formatCount(nøkkeltall.personligeBookinger),
        unit: "stk.",
        description: sammenligning
          ? `Året før: ${formatCount(sammenligning.personligeBookinger)} stk.`
          : "Valgt periode",
        icon: UserMultiple02Icon,
      },
      {
        label: "Bookinger for arrangement",
        value: formatCount(nøkkeltall.arrangementbookinger),
        unit: "stk.",
        description: sammenligning
          ? `Året før: ${formatCount(sammenligning.arrangementbookinger)} stk.`
          : "Valgt periode",
        icon: Calendar03Icon,
      },
    ];
  });
</script>

<MetricGrid label="Nøkkeltall">
  {#each metrics as metric (metric.label)}
    {#snippet metricIcon()}<Icon icon={metric.icon} />{/snippet}
    <Metric
      label={metric.label}
      value={metric.value}
      unit={metric.unit}
      description={metric.description}
      change={metric.change}
      direction={metric.direction}
      icon={metricIcon}
    />
  {/each}
</MetricGrid>
