import { addDays, endOfYear, startOfDay, startOfYear, subYears } from "date-fns";
import type {
  BaneRespons,
  BookingMedlemsstatistikk,
  BookingstatistikkFiltre,
  BookingstatistikkRespons,
  DayOfWeek,
} from "$lib/contracts";
import { tilDatoTekst } from "$lib/domain";

export type StatistikkPeriodevalg = "året-så-langt" | "forrige-år" | "siste-12" | "egendefinert";
export type Medlemsbookingtype = "alle" | "vanlige" | "arrangement";
export type Statistikkfane = "banebruk" | "medlemmer";

export const STATISTICS_PERIOD_OPTIONS = [
  { value: "året-så-langt", label: "Året så langt" },
  { value: "forrige-år", label: "Forrige kalenderår" },
  { value: "siste-12", label: "Siste 12 måneder" },
  { value: "egendefinert", label: "Egendefinert periode" },
] as const;

export const MEMBER_BOOKING_TYPE_OPTIONS = [
  { value: "alle", label: "Alle" },
  { value: "vanlige", label: "Vanlige bookinger" },
  { value: "arrangement", label: "Arrangement" },
] as const;

export function periodFor(
  selection: Exclude<StatistikkPeriodevalg, "egendefinert">,
  referenceDate = new Date()
) {
  const today = startOfDay(referenceDate);

  if (selection === "forrige-år") {
    const previousYear = subYears(today, 1);
    return {
      fra: tilDatoTekst(startOfYear(previousYear)),
      til: tilDatoTekst(endOfYear(previousYear)),
    };
  }

  if (selection === "siste-12") {
    return {
      fra: tilDatoTekst(addDays(subYears(today, 1), 1)),
      til: tilDatoTekst(today),
    };
  }

  return { fra: tilDatoTekst(startOfYear(today)), til: tilDatoTekst(today) };
}

export function createStatisticsFilters(referenceDate = new Date()): BookingstatistikkFiltre {
  return {
    ...periodFor("året-så-langt", referenceDate),
    sammenlignMedForrigeÅr: true,
    grenId: null,
    baneId: null,
  };
}

export function applyPeriodSelection(
  filters: BookingstatistikkFiltre,
  selection: StatistikkPeriodevalg,
  referenceDate = new Date()
) {
  return selection === "egendefinert"
    ? filters
    : { ...filters, ...periodFor(selection, referenceDate) };
}

export function applyFromDate(filters: BookingstatistikkFiltre, fra: string) {
  return { ...filters, fra, til: filters.til < fra ? fra : filters.til };
}

export function applyActivityFilter(
  filters: BookingstatistikkFiltre,
  grenId: string | null,
  courts: readonly BaneRespons[]
) {
  const selectedCourt = courts.find((court) => court.id === filters.baneId);
  return {
    ...filters,
    grenId,
    baneId: !grenId || (selectedCourt && selectedCourt.grenId !== grenId) ? null : filters.baneId,
  };
}

export function availableCourts(courts: readonly BaneRespons[], grenId: string | null) {
  return grenId ? courts.filter((court) => court.grenId === grenId) : courts;
}

export function selectMemberStatistics(
  statistics: BookingstatistikkRespons,
  bookingType: Medlemsbookingtype
): BookingMedlemsstatistikk {
  return bookingType === "alle"
    ? statistics.medlemmer
    : statistics.medlemmerPerBookingtype[bookingType];
}

const numberFormat = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const monthFormat = new Intl.DateTimeFormat("nb-NO", { month: "short" });

const weekdayNames: Record<DayOfWeek, string> = {
  Monday: "Mandag",
  Tuesday: "Tirsdag",
  Wednesday: "Onsdag",
  Thursday: "Torsdag",
  Friday: "Fredag",
  Saturday: "Lørdag",
  Sunday: "Søndag",
};

export function formatCount(value: number) {
  return numberFormat.format(value);
}

export function formatCountWithUnit(value: number) {
  return `${formatCount(value)} stk.`;
}

export function formatDecimal(value: number) {
  return decimalFormat.format(value);
}

export function formatHours(value: number) {
  return `${decimalFormat.format(value)} t`;
}

export function formatPercentage(value: number | null) {
  if (value === null) return null;
  return `${value > 0 ? "+" : ""}${decimalFormat.format(value)} %`;
}

export function formatMonth(month: number) {
  return monthFormat.format(new Date(2026, month - 1, 1)).replace(".", "");
}

export function formatIsoDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatGeneratedAt(date: string) {
  return new Date(date).toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWeekday(weekday: DayOfWeek) {
  return weekdayNames[weekday];
}
