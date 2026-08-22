<script lang="ts">
  import { Calendar as BitsCalendar } from "bits-ui";
  import type { DateValue } from "@internationalized/date";
  import CalendarBody from "./CalendarBody.svelte";
  import { parseIsoDate, serializeDateValue } from "./calendar-date";

  type Props = {
    calendarLabel: string;
    disabled?: boolean;
    initialFocus?: boolean;
    maxValue?: string;
    minValue?: string;
    onValueChange?: (value: string) => void;
    value?: string | null;
  };

  let {
    calendarLabel,
    disabled = false,
    initialFocus = false,
    maxValue,
    minValue,
    onValueChange,
    value,
  }: Props = $props();

  const selectedDate = $derived(parseIsoDate(value));
  const minimumDate = $derived(parseIsoDate(minValue));
  const maximumDate = $derived(parseIsoDate(maxValue));

  function handleValueChange(nextValue: DateValue | undefined) {
    const serialized = serializeDateValue(nextValue);
    if (serialized) onValueChange?.(serialized);
  }
</script>

<BitsCalendar.Root
  type="single"
  value={selectedDate}
  onValueChange={handleValueChange}
  placeholder={selectedDate ?? minimumDate}
  minValue={minimumDate}
  maxValue={maximumDate}
  {disabled}
  {initialFocus}
  {calendarLabel}
  locale="nb-NO"
  weekStartsOn={1}
  weekdayFormat="short"
  fixedWeeks
  disableDaysOutsideMonth
  preventDeselect
  data-ui-primitive="calendar"
>
  {#snippet children({ months, weekdays })}
    <CalendarBody {months} {weekdays} />
  {/snippet}
</BitsCalendar.Root>
