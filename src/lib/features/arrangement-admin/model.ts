import type {
  ArrangementForhåndsvisningRespons,
  ArrangementKategori,
  ArrangementRespons,
  BaneRespons,
  BatchLeggTilArrangementBookingerRespons,
  DayOfWeek,
  EksplisittArrangementSlot,
  LeggTilArrangementBookingForespørsel,
  OpprettArrangementForespørsel,
  OppdaterArrangementMetadataForespørsel,
} from "$lib/contracts";
import { dateTilUkedagIso, finnDayOfWeeksIPeriode, isoTilDayOfWeek } from "$lib/domain/dato";

export type ArrangementEditorMode = "create" | "edit";
export type ArrangementEditorStep = "information" | "times";
export type ScheduleMode = "recurring" | "manual";
type LocalBookingStatus = "active" | "available" | "conflict" | "unknown";
export type LocalBookingSource = "existing" | "manual" | "recurring";

export type LocalBooking = {
  courtId: string;
  courtName: string;
  date: string;
  endTime: string;
  externalId?: string;
  id: string;
  message?: string;
  source: LocalBookingSource;
  startTime: string;
  status: LocalBookingStatus;
};

export type ArrangementMetadataDraft = {
  activityId: string;
  category: ArrangementKategori;
  description: string;
  publishedOnWebsite: boolean;
  websiteDescription: string;
  websiteTitle: string;
};

export type ArrangementMetadataErrors = {
  activityId: string | null;
  websiteTitle: string | null;
};

export type CourtScheduleGroup = {
  courtIds: string[];
  courtNames: string[];
  slotLengthMinutes: number;
  startTimes: string[];
};

const DAYS: readonly DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let localBookingSequence = 0;

function localBookingId() {
  localBookingSequence += 1;
  return `arrangement-slot-${localBookingSequence}`;
}

function parseMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function addMinutes(value: string, minutes: number) {
  const total = parseMinutes(value) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function getCourtSlotLength(court: BaneRespons) {
  return (
    court.bookingOverstyring?.slotLengdeMinutter ?? court.bookingInnstillinger.slotLengdeMinutter
  );
}

export function generateStartTimes(start: string, end: string, slotLengthMinutes: number) {
  const startMinutes = parseMinutes(start);
  const endMinutes = parseMinutes(end);
  const times: string[] = [];
  for (
    let current = startMinutes;
    current + slotLengthMinutes <= endMinutes;
    current += slotLengthMinutes
  ) {
    times.push(
      `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`
    );
  }
  return times;
}

export function groupCourtsBySlotLength(
  courts: readonly BaneRespons[],
  selectedCourtIds: readonly string[]
) {
  const selected = courts.filter((court) => selectedCourtIds.includes(court.id));
  const groups = new Map<number, BaneRespons[]>();
  for (const court of selected) {
    const slotLength = getCourtSlotLength(court);
    groups.set(slotLength, [...(groups.get(slotLength) ?? []), court]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([slotLengthMinutes, groupCourts]): CourtScheduleGroup => {
      const rules = groupCourts[0].bookingInnstillinger;
      return {
        courtIds: groupCourts.map((court) => court.id),
        courtNames: groupCourts.map((court) => court.navn),
        slotLengthMinutes,
        startTimes: generateStartTimes(
          rules.aapningstid || "08:00",
          rules.stengetid || "22:00",
          slotLengthMinutes
        ),
      };
    });
}

function bookingKey(booking: Pick<LocalBooking, "courtId" | "date" | "endTime" | "startTime">) {
  return `${booking.date}_${booking.startTime}_${booking.endTime}_${booking.courtId}`;
}

export function addUniqueBookings(
  current: readonly LocalBooking[],
  additions: readonly LocalBooking[]
) {
  const keys = new Set(current.map(bookingKey));
  return [...current, ...additions.filter((booking) => !keys.has(bookingKey(booking)))];
}

function generateBookings(
  dates: readonly string[],
  groups: readonly CourtScheduleGroup[],
  timesBySlotLength: Readonly<Record<number, readonly string[]>>,
  source: Exclude<LocalBookingSource, "existing">
) {
  return dates.flatMap((date) =>
    groups.flatMap((group) =>
      (timesBySlotLength[group.slotLengthMinutes] ?? []).flatMap((startTime) =>
        group.courtIds.map(
          (courtId, index): LocalBooking => ({
            courtId,
            courtName: group.courtNames[index],
            date,
            endTime: addMinutes(startTime, group.slotLengthMinutes),
            id: localBookingId(),
            source,
            startTime,
            status: "unknown",
          })
        )
      )
    )
  );
}

export function generateManualBookings(
  dates: readonly string[],
  groups: readonly CourtScheduleGroup[],
  timesBySlotLength: Readonly<Record<number, readonly string[]>>
) {
  return generateBookings([...dates].sort(), groups, timesBySlotLength, "manual");
}

export function generateRecurringBookings(
  startDate: string,
  endDate: string,
  weekdays: readonly DayOfWeek[],
  groups: readonly CourtScheduleGroup[],
  timesBySlotLength: Readonly<Record<number, readonly string[]>>
) {
  if (!startDate || !endDate || endDate < startDate) return [];
  const selectedDays = new Set(weekdays);
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  for (; current <= end; current.setDate(current.getDate() + 1)) {
    if (selectedDays.has(DAYS[current.getDay()])) {
      dates.push(
        `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
      );
    }
  }
  return generateBookings(dates, groups, timesBySlotLength, "recurring");
}

export function previewRequest(
  bookings: readonly LocalBooking[],
  activityId: string,
  category: ArrangementKategori
): OpprettArrangementForespørsel | null {
  if (!activityId || bookings.length === 0) return null;
  const dates = bookings.map((booking) => booking.date).sort();
  const weekdays = [
    ...new Set(
      bookings.map((booking) =>
        isoTilDayOfWeek(dateTilUkedagIso(new Date(`${booking.date}T00:00:00`)))
      )
    ),
  ] as DayOfWeek[];
  const byCourt = new Map<string, Set<string>>();
  for (const booking of bookings) {
    const times = byCourt.get(booking.courtId) ?? new Set<string>();
    times.add(booking.startTime);
    byCourt.set(booking.courtId, times);
  }
  return {
    baneGrupper: [...byCourt.entries()].map(([courtId, times]) => ({
      baneIder: [courtId],
      tidspunkter: [...times].sort(),
    })),
    eksplisitteSlots: bookings.map(toExplicitSlot),
    grenId: activityId,
    kategori: category,
    sluttDato: dates.at(-1)!,
    startDato: dates[0],
    tittel: category,
    ukedager: weekdays,
  };
}

export function mergePreview(
  bookings: readonly LocalBooking[],
  preview: ArrangementForhåndsvisningRespons
) {
  const conflicts = new Set(
    preview.konflikter.map(
      (slot) => `${slot.dato}_${slot.startTid}_${slot.sluttTid}_${slot.baneId}`
    )
  );
  const available = new Set(
    preview.ledige.map((slot) => `${slot.dato}_${slot.startTid}_${slot.sluttTid}_${slot.baneId}`)
  );
  return bookings.map((booking): LocalBooking => {
    const key = bookingKey(booking);
    if (conflicts.has(key))
      return { ...booking, message: "Tidspunktet er allerede opptatt.", status: "conflict" };
    if (available.has(key)) return { ...booking, message: undefined, status: "available" };
    return booking;
  });
}

export function mapExistingBookings(
  bookings: readonly {
    bookingId: string;
    baneId: string;
    baneNavn: string;
    dato: string;
    sluttTid: string;
    startTid: string;
  }[]
) {
  return bookings.map(
    (booking): LocalBooking => ({
      courtId: booking.baneId,
      courtName: booking.baneNavn,
      date: booking.dato,
      endTime: booking.sluttTid,
      externalId: booking.bookingId,
      id: `existing-${booking.bookingId}`,
      source: "existing",
      startTime: booking.startTid,
      status: "active",
    })
  );
}

function sortBookings(bookings: readonly LocalBooking[]) {
  return [...bookings].sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      left.startTime.localeCompare(right.startTime) ||
      left.courtName.localeCompare(right.courtName)
  );
}

export function groupBookingsByDate(bookings: readonly LocalBooking[]) {
  const groups = new Map<string, LocalBooking[]>();
  for (const booking of sortBookings(bookings)) {
    groups.set(booking.date, [...(groups.get(booking.date) ?? []), booking]);
  }
  return groups;
}

export function createMetadataDraft(activityId = ""): ArrangementMetadataDraft {
  return {
    activityId,
    category: "Annet",
    description: "",
    publishedOnWebsite: false,
    websiteDescription: "",
    websiteTitle: "",
  };
}

export function arrangementToMetadataDraft(
  arrangement: ArrangementRespons,
  activityId: string
): ArrangementMetadataDraft {
  return {
    activityId,
    category: arrangement.kategori,
    description: arrangement.beskrivelse ?? "",
    publishedOnWebsite: arrangement.publisertPåNettsiden,
    websiteDescription: arrangement.nettsideBeskrivelse ?? "",
    websiteTitle: arrangement.nettsideTittel ?? "",
  };
}

export function validateMetadata(draft: ArrangementMetadataDraft): ArrangementMetadataErrors {
  return {
    activityId: draft.activityId ? null : "Velg en gren.",
    websiteTitle:
      draft.publishedOnWebsite && draft.websiteTitle.trim().length > 100
        ? "Nettsidetittelen kan være maks 100 tegn."
        : null,
  };
}

export function metadataRequest(
  draft: ArrangementMetadataDraft
): OppdaterArrangementMetadataForespørsel {
  return {
    beskrivelse: draft.description.trim() || undefined,
    kategori: draft.category,
    nettsideBeskrivelse:
      draft.publishedOnWebsite && draft.websiteDescription.trim()
        ? draft.websiteDescription
        : undefined,
    nettsideTittel:
      draft.publishedOnWebsite && draft.websiteTitle.trim() ? draft.websiteTitle.trim() : undefined,
    publisertPåNettsiden: draft.publishedOnWebsite,
  };
}

function toExplicitSlot(booking: LocalBooking): EksplisittArrangementSlot {
  return {
    baneId: booking.courtId,
    dato: booking.date,
    sluttTid: booking.endTime,
    startTid: booking.startTime,
  };
}

export function createArrangementRequest(
  draft: ArrangementMetadataDraft,
  bookings: readonly LocalBooking[]
): OpprettArrangementForespørsel | null {
  const available = bookings.filter((booking) => booking.status !== "conflict");
  const preview = previewRequest(available, draft.activityId, draft.category);
  if (!preview) return null;
  return { ...preview, ...metadataRequest(draft) };
}

export function toBookingRequest(booking: LocalBooking): LeggTilArrangementBookingForespørsel {
  return toExplicitSlot(booking);
}

export function reconcileBatchResult(
  submitted: readonly LocalBooking[],
  response: BatchLeggTilArrangementBookingerRespons
) {
  const failures = new Map(
    response.feilet.map((failure) => [
      `${failure.dato}_${failure.startTid}_${failure.sluttTid}_${failure.baneId}`,
      failure.feilmelding,
    ])
  );
  return {
    failed: submitted
      .filter((booking) => failures.has(bookingKey(booking)))
      .map((booking) => ({
        ...booking,
        message: failures.get(bookingKey(booking)),
        status: "conflict" as const,
      })),
    succeeded: submitted.filter((booking) => !failures.has(bookingKey(booking))),
  };
}

export function availableWeekdays(startDate: string, endDate: string) {
  if (!startDate || !endDate || endDate < startDate) return [];
  return finnDayOfWeeksIPeriode(new Date(`${startDate}T00:00:00`), new Date(`${endDate}T00:00:00`));
}

export function arrangementDateRange(
  arrangement: Pick<ArrangementRespons, "sluttDato" | "startDato">,
  referenceDate = new Date()
) {
  const format = (value: string, year: boolean) =>
    new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      ...(year ? { year: "numeric" } : {}),
    });
  const currentYear = referenceDate.getFullYear();
  const startYear = Number(arrangement.startDato.slice(0, 4));
  const endYear = Number(arrangement.sluttDato.slice(0, 4));
  const start = format(arrangement.startDato, startYear !== currentYear || startYear !== endYear);
  return arrangement.startDato === arrangement.sluttDato
    ? start
    : `${start}–${format(arrangement.sluttDato, endYear !== currentYear)}`;
}
