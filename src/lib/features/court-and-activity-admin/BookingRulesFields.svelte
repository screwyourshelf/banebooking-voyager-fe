<script lang="ts">
  import type { BookingRegelRespons } from "$lib/contracts";
  import { SettingsRange, SettingsRow, SettingsSwitchRow, SettingsValue } from "$lib/ui";
  import type { BookingOverrideDraft } from "./model";
  import { defaultOverrideValue, hourLabel } from "./model";

  type BookingRuleField = keyof BookingOverrideDraft;
  type BookingRuleValues = Record<BookingRuleField, number | null>;

  let {
    defaults,
    disabled = false,
    onChange,
    overridable = false,
    values,
  }: {
    defaults?: BookingRegelRespons;
    disabled?: boolean;
    onChange: (field: BookingRuleField, value: number | null) => void;
    overridable?: boolean;
    values: BookingRuleValues;
  } = $props();

  const slotValues = [30, 45, 60, 90] as const;

  function toggle(field: BookingRuleField, enabled: boolean) {
    if (!enabled) onChange(field, null);
    else if (defaults) onChange(field, defaultOverrideValue(field, defaults));
  }

  function defaultDescription(field: BookingRuleField, suffix = "") {
    if (!defaults) return undefined;
    const value = defaultOverrideValue(field, defaults);
    return `Standard: ${field === "openingHour" || field === "closingHour" ? hourLabel(value) : `${value}${suffix}`}`;
  }
</script>

{#snippet rangeLabels(values: readonly number[])}
  {#each values as value (value)}<span>{value}</span>{/each}
{/snippet}

{#snippet slotLabels()}
  {@render rangeLabels(slotValues)}
{/snippet}

{#if overridable}
  <SettingsSwitchRow
    title="Egen åpningstid"
    description={defaultDescription("openingHour")}
    checked={values.openingHour !== null}
    onCheckedChange={(checked) => toggle("openingHour", checked)}
    {disabled}
  />
{/if}
{#if values.openingHour !== null}
  {#snippet openingValue()}<SettingsValue>{hourLabel(values.openingHour ?? 0)}</SettingsValue
    >{/snippet}
  <SettingsRow title="Åpningstid" description="Tidligste starttid." right={openingValue}>
    <SettingsRange
      aria-label="Åpningstid"
      value={values.openingHour}
      min="6"
      max="23"
      step="1"
      oninput={(event) => onChange("openingHour", Number(event.currentTarget.value))}
      {disabled}
    />
  </SettingsRow>
{/if}

{#if overridable}
  <SettingsSwitchRow
    title="Egen stengetid"
    description={defaultDescription("closingHour")}
    checked={values.closingHour !== null}
    onCheckedChange={(checked) => toggle("closingHour", checked)}
    {disabled}
  />
{/if}
{#if values.closingHour !== null}
  {#snippet closingValue()}<SettingsValue>{hourLabel(values.closingHour ?? 0)}</SettingsValue
    >{/snippet}
  <SettingsRow title="Stengetid" description="Seneste starttid." right={closingValue}>
    <SettingsRange
      aria-label="Stengetid"
      value={values.closingHour}
      min="6"
      max="23"
      step="1"
      oninput={(event) => onChange("closingHour", Number(event.currentTarget.value))}
      {disabled}
    />
  </SettingsRow>
{/if}

{#if overridable}
  <SettingsSwitchRow
    title="Egen grense per dag"
    description={defaultDescription("maxPerDay")}
    checked={values.maxPerDay !== null}
    onCheckedChange={(checked) => toggle("maxPerDay", checked)}
    {disabled}
  />
{/if}
{#if values.maxPerDay !== null}
  {#snippet maxPerDayValue()}<SettingsValue>{values.maxPerDay}</SettingsValue>{/snippet}
  <SettingsRow title="Maks per dag" description="Bookinger per medlem." right={maxPerDayValue}>
    <SettingsRange
      aria-label="Maks bookinger per dag"
      value={values.maxPerDay}
      min="1"
      max="5"
      step="1"
      oninput={(event) => onChange("maxPerDay", Number(event.currentTarget.value))}
      {disabled}
    />
  </SettingsRow>
{/if}

{#if overridable}
  <SettingsSwitchRow
    title="Egen grense for aktive bookinger"
    description={defaultDescription("maxActive")}
    checked={values.maxActive !== null}
    onCheckedChange={(checked) => toggle("maxActive", checked)}
    {disabled}
  />
{/if}
{#if values.maxActive !== null}
  {#snippet maxActiveValue()}<SettingsValue>{values.maxActive}</SettingsValue>{/snippet}
  <SettingsRow
    title="Maks aktive"
    description="Samtidige bookinger per medlem."
    right={maxActiveValue}
  >
    <SettingsRange
      aria-label="Maks aktive bookinger"
      value={values.maxActive}
      min="1"
      max="10"
      step="1"
      oninput={(event) => onChange("maxActive", Number(event.currentTarget.value))}
      {disabled}
    />
  </SettingsRow>
{/if}

{#if overridable}
  <SettingsSwitchRow
    title="Egen bookinghorisont"
    description={defaultDescription("daysAhead", " dager")}
    checked={values.daysAhead !== null}
    onCheckedChange={(checked) => toggle("daysAhead", checked)}
    {disabled}
  />
{/if}
{#if values.daysAhead !== null}
  {#snippet daysAheadValue()}<SettingsValue>{values.daysAhead} dager</SettingsValue>{/snippet}
  <SettingsRow title="Bookinghorisont" description="Dager frem i tid." right={daysAheadValue}>
    <SettingsRange
      aria-label="Dager frem i tid"
      value={values.daysAhead}
      min="1"
      max="14"
      step="1"
      oninput={(event) => onChange("daysAhead", Number(event.currentTarget.value))}
      {disabled}
    />
  </SettingsRow>
{/if}

{#if overridable}
  <SettingsSwitchRow
    title="Egen lengde på tider"
    description={defaultDescription("slotMinutes", " min")}
    checked={values.slotMinutes !== null}
    onCheckedChange={(checked) => toggle("slotMinutes", checked)}
    {disabled}
  />
{/if}
{#if values.slotMinutes !== null}
  {@const slotIndex = Math.max(
    0,
    slotValues.indexOf(values.slotMinutes as (typeof slotValues)[number])
  )}
  {#snippet slotValue()}<SettingsValue>{values.slotMinutes} min</SettingsValue>{/snippet}
  <SettingsRow title="Lengde på tider" right={slotValue}>
    <SettingsRange
      aria-label="Lengde på tider"
      value={slotIndex}
      min="0"
      max={String(slotValues.length - 1)}
      step="1"
      labels={slotLabels}
      oninput={(event) => onChange("slotMinutes", slotValues[Number(event.currentTarget.value)])}
      {disabled}
    />
  </SettingsRow>
{/if}
