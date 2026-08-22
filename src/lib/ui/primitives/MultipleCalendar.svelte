<script lang="ts">
  import { Calendar as BitsCalendar } from "bits-ui";
  import type { DateValue } from "@internationalized/date";
  import CalendarBody from "./CalendarBody.svelte";
  import { parseIsoDate, serializeDateValue } from "./calendar-date";

  type Props = {
    calendarLabel: string;
    disabled?: boolean;
    maxSelections?: number;
    maxValue?: string;
    minValue?: string;
    onValueChange?: (value: string[]) => void;
    value?: string[];
  };

  let {
    calendarLabel,
    disabled = false,
    maxSelections,
    maxValue,
    minValue,
    onValueChange,
    value = [],
  }: Props = $props();

  const selectedDates = $derived(value.map(parseIsoDate).filter((date) => date !== undefined));
  const minimumDate = $derived(parseIsoDate(minValue));
  const maximumDate = $derived(parseIsoDate(maxValue));

  function handleValueChange(nextValue: DateValue[]) {
    onValueChange?.(
      nextValue
        .map(serializeDateValue)
        .filter((date): date is string => date !== null)
        .sort()
    );
  }
</script>

<BitsCalendar.Root
  type="multiple"
  value={selectedDates}
  onValueChange={handleValueChange}
  placeholder={selectedDates[0] ?? minimumDate}
  minValue={minimumDate}
  maxValue={maximumDate}
  maxDays={maxSelections}
  {disabled}
  {calendarLabel}
  locale="nb-NO"
  weekStartsOn={1}
  weekdayFormat="short"
  fixedWeeks
  disableDaysOutsideMonth
  data-ui-primitive="calendar"
  data-selection="multiple"
>
  {#snippet children({ months, weekdays })}
    <CalendarBody {months} {weekdays} />
  {/snippet}
</BitsCalendar.Root>
