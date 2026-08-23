<script lang="ts">
  import type { BaneRespons, DayOfWeek } from "$lib/contracts";
  import { dayOfWeekKortNorsk } from "$lib/domain/dato";
  import {
    Button,
    DatePicker,
    Feedback,
    FormActions,
    FormField,
    FormFields,
    MultiDatePicker,
    SettingsChoiceGroup,
    SettingsRadioGroup,
    SettingsSection,
    SettingsSwitchRow,
    SettingsText,
  } from "$lib/ui";
  import {
    addUniqueBookings,
    availableWeekdays,
    generateManualBookings,
    generateRecurringBookings,
    groupCourtsBySlotLength,
    type LocalBooking,
    type ScheduleMode,
  } from "./model";

  let {
    bookings = $bindable([]),
    busy = false,
    courts,
    mode = $bindable("recurring"),
    onGenerate,
  }: {
    bookings?: LocalBooking[];
    busy?: boolean;
    courts: readonly BaneRespons[];
    mode?: ScheduleMode;
    onGenerate?: (bookings: LocalBooking[]) => void | Promise<void>;
  } = $props();

  const weekdayOrder: readonly DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  let startDate = $state(todayIso);
  let endDate = $state(todayIso);
  let manualDates = $state<string[]>([]);
  let selectedCourtIds = $state<string[]>([]);
  let selectedWeekdays = $state<DayOfWeek[]>([]);
  let allWeekdays = $state(false);
  let allCourts = $state(false);
  let allTimes = $state<Record<number, boolean>>({});
  let selectedTimes = $state<Record<number, string[]>>({});

  const effectiveCourtIds = $derived(
    allCourts ? courts.map((court) => court.id) : selectedCourtIds
  );
  const groups = $derived(groupCourtsBySlotLength(courts, effectiveCourtIds));
  const weekdaysInPeriod = $derived(availableWeekdays(startDate, endDate));
  const effectiveWeekdays = $derived(allWeekdays ? weekdaysInPeriod : selectedWeekdays);
  const timesByGroup = $derived(
    Object.fromEntries(
      groups.map((group) => [
        group.slotLengthMinutes,
        allTimes[group.slotLengthMinutes]
          ? group.startTimes
          : (selectedTimes[group.slotLengthMinutes] ?? []).filter((time) =>
              group.startTimes.includes(time)
            ),
      ])
    )
  );
  const hasTimes = $derived(Object.values(timesByGroup).some((times) => times.length > 0));
  const canGenerate = $derived(
    effectiveCourtIds.length > 0 &&
      hasTimes &&
      (mode === "manual"
        ? manualDates.length > 0
        : Boolean(startDate && endDate && endDate >= startDate && effectiveWeekdays.length > 0))
  );
  const mixedSlotLengths = $derived(groups.length > 1);

  function toggle<T>(values: readonly T[], value: T) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  async function generate() {
    if (!canGenerate) return;
    const additions =
      mode === "manual"
        ? generateManualBookings(manualDates, groups, timesByGroup)
        : generateRecurringBookings(startDate, endDate, effectiveWeekdays, groups, timesByGroup);
    const next = addUniqueBookings(bookings, additions);
    bookings = next;
    if (mode === "manual") manualDates = [];
    await onGenerate?.(next);
  }
</script>

<SettingsSection
  embedded
  eyebrow="Tider"
  title="Velg oppsett"
  description="Begge metodene legger konkrete forslag i den samme listen."
>
  <FormFields>
    <FormField label="Metode">
      <SettingsRadioGroup
        label="Velg oppsettstype"
        value={mode}
        onValueChange={(value) => (mode = value as ScheduleMode)}
        options={[
          { value: "recurring", label: "Gjentakende" },
          { value: "manual", label: "Manuelt" },
        ]}
        disabled={busy}
      />
    </FormField>
  </FormFields>
</SettingsSection>

<SettingsSection
  embedded
  eyebrow="Oppsett"
  title={mode === "recurring" ? "Gjentakende tider" : "Manuelle tider"}
  description={mode === "recurring"
    ? "Velg periode, ukedager, baner og tidspunkter."
    : "Velg konkrete datoer, baner og tidspunkter."}
>
  <FormFields>
    {#if mode === "recurring"}
      <FormField label="Fra dato" required>
        <DatePicker bind:value={startDate} showDayNavigation disabled={busy} />
      </FormField>
      <FormField
        label="Til dato"
        error={endDate < startDate ? "Til-dato må være lik eller etter fra-dato." : null}
        required
      >
        <DatePicker bind:value={endDate} minValue={startDate} showDayNavigation disabled={busy} />
      </FormField>
      <SettingsSwitchRow
        title="Alle ukedager i perioden"
        description="Bruk alle dager som finnes mellom fra- og til-dato."
        bind:checked={allWeekdays}
        disabled={busy}
      />
      <FormField label="Ukedager" description="Velg dagene som skal gjentas.">
        <SettingsChoiceGroup
          label="Ukedager"
          options={weekdayOrder.map((day) => ({
            value: day,
            label: dayOfWeekKortNorsk(day),
            disabled: !weekdaysInPeriod.includes(day),
          }))}
          selectedValues={effectiveWeekdays}
          onToggle={(value) => (selectedWeekdays = toggle(selectedWeekdays, value as DayOfWeek))}
          disabled={busy || allWeekdays}
        />
      </FormField>
    {:else}
      <FormField label="Datoer" description="Velg én eller flere datoer i kalenderen." required>
        <MultiDatePicker
          bind:value={manualDates}
          aria-label="Velg datoer for banetidene"
          disabled={busy}
        />
        <SettingsText>
          {manualDates.length === 0
            ? "Ingen datoer valgt."
            : `${manualDates.length} ${manualDates.length === 1 ? "dato" : "datoer"} valgt.`}
        </SettingsText>
      </FormField>
    {/if}

    <SettingsSwitchRow
      title="Alle baner"
      description="Bruk alle banene i valgt gren."
      bind:checked={allCourts}
      disabled={busy || courts.length === 0}
    />
    <FormField label="Baner" description="Velg banene arrangementet skal bruke.">
      <SettingsChoiceGroup
        label="Baner"
        options={courts.map((court) => ({ value: court.id, label: court.navn }))}
        selectedValues={effectiveCourtIds}
        onToggle={(value) => (selectedCourtIds = toggle(selectedCourtIds, value))}
        disabled={busy || allCourts}
      />
    </FormField>

    {#if mixedSlotLengths}
      <Feedback
        tone="warning"
        title="Banene har ulik varighet"
        description="Tidspunktene vises per slotlengde slik at forslagene ikke overlapper."
      />
    {/if}

    {#each groups as group (group.slotLengthMinutes)}
      <SettingsSwitchRow
        title={groups.length > 1
          ? `Alle tidspunkter · ${group.slotLengthMinutes} min`
          : "Alle tidspunkter"}
        description={group.courtNames.join(", ")}
        checked={allTimes[group.slotLengthMinutes] ?? false}
        onCheckedChange={(checked) =>
          (allTimes = { ...allTimes, [group.slotLengthMinutes]: checked })}
        disabled={busy}
      />
      <FormField
        label={groups.length > 1 ? `Tidspunkter · ${group.slotLengthMinutes} min` : "Tidspunkter"}
        description={group.courtNames.join(", ")}
      >
        <SettingsChoiceGroup
          label={`Tidspunkter for ${group.slotLengthMinutes} minutter`}
          options={group.startTimes.map((time) => ({ value: time, label: time }))}
          selectedValues={timesByGroup[group.slotLengthMinutes] ?? []}
          onToggle={(value) =>
            (selectedTimes = {
              ...selectedTimes,
              [group.slotLengthMinutes]: toggle(
                selectedTimes[group.slotLengthMinutes] ?? [],
                value
              ),
            })}
          disabled={busy || Boolean(allTimes[group.slotLengthMinutes])}
        />
      </FormField>
    {/each}
  </FormFields>

  <FormActions>
    <Button disabled={!canGenerate || busy} onclick={() => void generate()}>
      Legg forslag i listen
    </Button>
  </FormActions>
</SettingsSection>
