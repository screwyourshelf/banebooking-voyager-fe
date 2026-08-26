<script lang="ts">
  import { DatePicker, Form, FormField, FormFields, MultiDatePicker } from "$lib/ui";

  let {
    disabled = false,
    invalid = false,
    onDateChange,
    onDatesChange,
    pending = false,
  }: {
    disabled?: boolean;
    invalid?: boolean;
    onDateChange: (value: string) => void;
    onDatesChange: (value: string[]) => void;
    pending?: boolean;
  } = $props();

  let date = $state<string | null>("2026-08-22");
  let dates = $state(["2026-08-22", "2026-08-24"]);
</script>

<Form aria-label="Datofelter">
  <FormFields>
    <FormField
      label="Startdato"
      description="Velg en dato i august."
      error={invalid ? "Datoen er ikke gyldig." : null}
      required
    >
      <DatePicker
        bind:value={date}
        name="startDate"
        minValue="2026-08-20"
        maxValue="2026-09-05"
        calendarLabel="Velg startdato"
        showDayNavigation
        {disabled}
        {pending}
        onValueChange={onDateChange}
      />
    </FormField>

    <FormField label="Bookingdato" description="Velg dag for bookingen.">
      <DatePicker
        value="2026-08-25"
        presentation="booking"
        selected
        calendarLabel="Velg bookingdato"
      />
    </FormField>

    <FormField label="Annen bookingdato">
      <DatePicker value="2026-08-25" presentation="booking" />
    </FormField>

    <FormField label="Statistikk fra">
      <DatePicker value="2026-01-01" presentation="filter" />
    </FormField>

    <FormField label="Tom dato">
      <DatePicker calendarLabel="Velg tom dato" />
    </FormField>

    <FormField label="Bookingdatoer" description="Velg én eller flere datoer." required>
      <MultiDatePicker
        bind:value={dates}
        name="dates"
        minValue="2026-08-20"
        maxValue="2026-09-05"
        calendarLabel="Velg bookingdatoer"
        {disabled}
        {pending}
        onValueChange={onDatesChange}
      />
    </FormField>
  </FormFields>
</Form>
