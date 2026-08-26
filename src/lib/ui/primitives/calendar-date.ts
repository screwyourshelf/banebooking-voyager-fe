import { parseDate, type CalendarDate, type DateValue } from "@internationalized/date";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(value: string | null | undefined): CalendarDate | undefined {
  if (!value || !isoDatePattern.test(value)) return undefined;

  try {
    const parsed = parseDate(value);
    return parsed.toString() === value ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function serializeDateValue(value: DateValue | undefined): string | null {
  return value?.toString() ?? null;
}

export function formatDatePickerValue(
  value: string | null | undefined,
  presentation: "booking" | "field" | "filter"
): string | null {
  const parsed = parseIsoDate(value);
  if (!parsed) return null;

  const date = new Date(parsed.year, parsed.month - 1, parsed.day);
  const options: Intl.DateTimeFormatOptions =
    presentation === "field"
      ? { weekday: "short", day: "numeric", month: "long" }
      : presentation === "filter"
        ? { day: "numeric", month: "short", year: "numeric" }
        : { day: "numeric", month: "short" };
  const formatted = new Intl.DateTimeFormat("nb-NO", options).format(date);

  return presentation === "field"
    ? formatted.charAt(0).toLocaleUpperCase("nb-NO") + formatted.slice(1)
    : formatted;
}
