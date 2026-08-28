<script lang="ts">
  import type { BookingInnstillingRespons } from "$lib/contracts";
  import { SettingsRange, SettingsRow, SettingsSwitchRow, SettingsValue } from "$lib/ui";
  import type { BookingOverrideDraft } from "./model";
  import { defaultOverrideValue, hourLabel } from "./model";

  type BookingTimeField = keyof BookingOverrideDraft;
  type BookingTimeValues = Record<BookingTimeField, number | null>;

  let {
    defaults,
    disabled = false,
    onChange,
    overridable = false,
    values,
  }: {
    defaults?: BookingInnstillingRespons;
    disabled?: boolean;
    onChange: (field: BookingTimeField, value: number | null) => void;
    overridable?: boolean;
    values: BookingTimeValues;
  } = $props();

  const slotValues = [30, 45, 60, 90] as const;

  function toggle(field: BookingTimeField, enabled: boolean) {
    if (!enabled) onChange(field, null);
    else if (defaults) onChange(field, defaultOverrideValue(field, defaults));
  }

  function defaultDescription(field: BookingTimeField, suffix = "") {
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
    title="Egen siste sluttid"
    description={defaultDescription("closingHour")}
    checked={values.closingHour !== null}
    onCheckedChange={(checked) => toggle("closingHour", checked)}
    {disabled}
  />
{/if}
{#if values.closingHour !== null}
  {#snippet closingValue()}<SettingsValue>{hourLabel(values.closingHour ?? 0)}</SettingsValue
    >{/snippet}
  <SettingsRow
    title="Siste sluttid"
    description="Bookingen må være ferdig innen dette tidspunktet."
    right={closingValue}
  >
    <SettingsRange
      aria-label="Siste sluttid"
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
    title="Egen bookinghorisont"
    description={defaultDescription("daysAhead", " dager")}
    checked={values.daysAhead !== null}
    onCheckedChange={(checked) => toggle("daysAhead", checked)}
    {disabled}
  />
{/if}
{#if values.daysAhead !== null}
  {#snippet daysAheadValue()}<SettingsValue>{values.daysAhead} dager</SettingsValue>{/snippet}
  <SettingsRow
    title="Bookinghorisont"
    description="Antall dager frem i tid."
    right={daysAheadValue}
  >
    <SettingsRange
      aria-label="Dager frem i tid"
      value={values.daysAhead}
      min="1"
      max="150"
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
