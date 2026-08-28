<script lang="ts">
  import { SettingsRange, SettingsRow, SettingsValue } from "$lib/ui";

  let {
    disabled = false,
    maxPerDay,
    maxUpcoming,
    onChange,
  }: {
    disabled?: boolean;
    maxPerDay: number;
    maxUpcoming: number;
    onChange: (field: "maxPerDay" | "maxUpcoming", value: number) => void;
  } = $props();
</script>

{#snippet maxPerDayValue()}<SettingsValue>{maxPerDay}</SettingsValue>{/snippet}
<SettingsRow
  title="Maks per dag"
  description="Ordinære bookinger per medlem på én dato."
  right={maxPerDayValue}
>
  <SettingsRange
    aria-label="Maks bookinger per dag"
    value={maxPerDay}
    min="1"
    max="10"
    step="1"
    oninput={(event) => onChange("maxPerDay", Number(event.currentTarget.value))}
    {disabled}
  />
</SettingsRow>

{#snippet maxUpcomingValue()}<SettingsValue>{maxUpcoming}</SettingsValue>{/snippet}
<SettingsRow
  title="Maks kommende"
  description="Uavsluttede ordinære bookinger per medlem i grenen."
  right={maxUpcomingValue}
>
  <SettingsRange
    aria-label="Maks kommende bookinger"
    value={maxUpcoming}
    min="1"
    max="20"
    step="1"
    oninput={(event) => onChange("maxUpcoming", Number(event.currentTarget.value))}
    {disabled}
  />
</SettingsRow>
