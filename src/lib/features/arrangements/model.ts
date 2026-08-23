import type { ArrangementRespons, DagMedSlotsRespons } from "$lib/contracts";
import {
  Kapabiliteter,
  formaterArrangementMetadata,
  getArrangementLifecycleStatus,
  harHandling,
} from "$lib/domain";

export const ARRANGEMENT_PAGE_SIZE = 10;
export const INITIAL_PROGRAM_DAY_COUNT = 3;
export const PROGRAM_DAYS_PER_PAGE = 3;

function localIsoDate(referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

function formatShortDate(value: string, includeYear: boolean) {
  return parseLocalDate(value).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

export function sortArrangements(arrangements: readonly ArrangementRespons[]) {
  return [...arrangements].sort((left, right) => {
    if (left.erPassert !== right.erPassert) return left.erPassert ? 1 : -1;
    return left.erPassert
      ? right.startDato.localeCompare(left.startDato)
      : left.startDato.localeCompare(right.startDato);
  });
}

export function getArrangementBranchOptions(arrangements: readonly ArrangementRespons[]) {
  return [...new Set(arrangements.map((arrangement) => arrangement.grenNavn))]
    .sort((left, right) => left.localeCompare(right, "nb-NO"))
    .map((branch) => ({ label: branch, value: branch }));
}

export function filterArrangementsByBranch(
  arrangements: readonly ArrangementRespons[],
  selectedBranches: readonly string[]
) {
  if (selectedBranches.length === 0) return [...arrangements];
  return arrangements.filter((arrangement) => selectedBranches.includes(arrangement.grenNavn));
}

export function formatArrangementDateRange(
  arrangement: Pick<ArrangementRespons, "startDato" | "sluttDato">,
  referenceDate = new Date()
) {
  const startYear = parseLocalDate(arrangement.startDato).getFullYear();
  const endYear = parseLocalDate(arrangement.sluttDato).getFullYear();
  const currentYear = referenceDate.getFullYear();
  const start = formatShortDate(
    arrangement.startDato,
    startYear !== currentYear || startYear !== endYear
  );
  const end =
    arrangement.startDato === arrangement.sluttDato
      ? null
      : formatShortDate(arrangement.sluttDato, endYear !== currentYear);
  return { start, end, label: end ? `${start}–${end}` : start };
}

export function formatProgramDate(value: string) {
  const formatted = parseLocalDate(value).toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toLocaleUpperCase("nb-NO") + formatted.slice(1);
}

export function formatCourts(courts: readonly string[]) {
  const sorted = [...courts].sort((left, right) => left.localeCompare(right, "nb-NO"));
  if (sorted.length <= 2) return sorted.join(" og ");
  return `${sorted.slice(0, -1).join(", ")} og ${sorted.at(-1)}`;
}

export function getUpcomingProgramDays(
  days: readonly DagMedSlotsRespons[],
  referenceDate = new Date()
) {
  const today = localIsoDate(referenceDate);
  return days.filter((day) => day.dato >= today && day.slots.length > 0);
}

export function createProgramSummary(days: readonly DagMedSlotsRespons[]) {
  const slots = days.flatMap((day) => day.slots);
  if (slots.length === 0) return null;
  const start = slots.map((slot) => slot.startTid.slice(0, 5)).sort()[0];
  const end = slots
    .map((slot) => slot.sluttTid.slice(0, 5))
    .sort()
    .at(-1);
  const timeLabel = slots.length === 1 ? "tid" : "tider";
  const dayLabel = days.length === 1 ? "dag" : "dager";
  return `${slots.length} ${timeLabel} · ${days.length} ${dayLabel} · ${start}–${end}`;
}

function formatRelativeStart(value: string, referenceDate: Date) {
  const start = parseLocalDate(value);
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const days = Math.max(0, Math.ceil((start.getTime() - today.getTime()) / 86_400_000));
  if (days === 0) return "Starter i dag";
  if (days === 1) return "Starter i morgen";
  return `Starter om ${days} dager`;
}

export function createArrangementListItem(
  arrangement: ArrangementRespons,
  referenceDate = new Date()
) {
  const description = arrangement.beskrivelse?.trim() ?? "";
  const bookedBy = arrangement.booketAv?.trim() ?? "";
  const programDays = getUpcomingProgramDays(arrangement.slotsPrDag ?? [], referenceDate);
  const programSummary = createProgramSummary(programDays);
  const lifecycle = getArrangementLifecycleStatus(arrangement, referenceDate);
  const nextDate = programDays[0]?.dato;
  const canCancel =
    !arrangement.erPassert &&
    harHandling(arrangement.kapabiliteter, Kapabiliteter.arrangement.avlys);

  return {
    bookedBy,
    canCancel,
    dateRange: formatArrangementDateRange(arrangement, referenceDate),
    description,
    hasDetails:
      Boolean(description || bookedBy || programSummary || canCancel) ||
      (!arrangement.erPassert && !programSummary),
    lifecycle,
    metadata: formaterArrangementMetadata(arrangement),
    programDays,
    programSummary,
    relativeStart:
      lifecycle.label === "Kommende" && nextDate
        ? formatRelativeStart(nextDate, referenceDate)
        : undefined,
  };
}

export function visibleCountForSelectedArrangement(
  arrangements: readonly ArrangementRespons[],
  selectedId: string | undefined,
  requestedCount: number
) {
  if (!selectedId) return requestedCount;
  const selectedIndex = arrangements.findIndex((arrangement) => arrangement.id === selectedId);
  return Math.max(requestedCount, selectedIndex + 1);
}
