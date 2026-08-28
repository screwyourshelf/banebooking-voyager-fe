import type {
  BaneRespons,
  BookingInnstillingRespons,
  BookingstatusRespons,
  GrenRespons,
  KalenderSlotRespons,
  OpprettBookingForespørsel,
  SlotStatus,
} from "$lib/contracts";
import { formatDatoKort } from "$lib/domain";
import {
  erSlotBooket,
  grupperSlots,
  harHandling,
  Kapabiliteter,
  utledSlotStatus,
} from "$lib/domain";

export type BookingSelection = {
  activityId: string;
  courtId: string;
  courts: BaneRespons[];
};

export type BookingSlotPresentation = {
  canBook: boolean;
  canCancel: boolean;
  canConnectToArrangement: boolean;
  cannotBook: boolean;
  category: { label: string; tone: "event" } | undefined;
  end: string;
  hasDetails: boolean;
  key: string;
  muted: boolean;
  start: string;
  status: { label: string; tone: "available" | "busy" | "past" };
  title?: string;
};

export type BookingLimitFacts = {
  quotas: Array<{ label: string; value: string }>;
  times: Array<{ label: string; value: string }>;
};

export type BookingLimitCopy = {
  exemptExplanation: string;
  quotaDescription: string;
  quotaExplanation: string;
  timeDescription: string;
  timeExplanation: string;
};

export function resolveBookingSelection(
  activities: readonly GrenRespons[],
  courts: readonly BaneRespons[],
  preferredActivityId: string | null,
  preferredCourtId: string | null
): BookingSelection {
  const fallbackActivityId =
    activities.find((activity) => courts.some((court) => court.grenId === activity.id))?.id ??
    activities[0]?.id ??
    "";
  const activityId = activities.some((activity) => activity.id === preferredActivityId)
    ? (preferredActivityId ?? fallbackActivityId)
    : fallbackActivityId;
  const activityCourts = activityId
    ? courts.filter((court) => court.grenId === activityId)
    : [...courts];
  const courtId = activityCourts.some((court) => court.id === preferredCourtId)
    ? (preferredCourtId ?? "")
    : (activityCourts[0]?.id ?? "");

  return { activityId, courtId, courts: activityCourts };
}

export function getBookingSlotPresentation(
  slot: KalenderSlotRespons,
  authenticated: boolean
): BookingSlotPresentation {
  const can = (capability: string) => harHandling(slot.kapabiliteter, capability);
  const status = utledSlotStatus(slot, authenticated);
  const booked = erSlotBooket(slot);
  const canConnectToArrangement = can(Kapabiliteter.booking.kobleTilArrangement);
  const canCancel = can(Kapabiliteter.booking.fjern);
  const cannotBook =
    authenticated &&
    !slot.erPassert &&
    !booked &&
    !slot.arrangementTittel &&
    !can(Kapabiliteter.booking.book);
  const hasPublicDetails = Boolean(slot.arrangementBeskrivelse?.trim());
  const hasArrangementOwner = Boolean(slot.arrangementTittel && slot.booketAv?.trim());

  return {
    canBook: authenticated && !slot.erPassert && can(Kapabiliteter.booking.book),
    canCancel,
    canConnectToArrangement,
    cannotBook,
    category: slot.arrangementTittel ? { label: "Arrangement", tone: "event" } : undefined,
    end: (slot.bookingSluttTid ?? slot.slotSluttTid).slice(0, 5),
    hasDetails:
      hasPublicDetails ||
      hasArrangementOwner ||
      (authenticated && (canConnectToArrangement || canCancel || cannotBook)),
    key: getBookingSlotKey(slot),
    muted: slot.erPassert,
    start: (slot.bookingStartTid ?? slot.slotStartTid).slice(0, 5),
    status: getSlotStatusPresentation(status),
    title: getSlotTitle(slot, status, booked),
  };
}

export function getVisibleBookingSlots(
  slots: readonly KalenderSlotRespons[],
  selectedDate: string,
  today: string,
  showPast: boolean
) {
  const grouped = grupperSlots([...slots]);
  return selectedDate === today && !showPast ? grouped.filter((slot) => !slot.erPassert) : grouped;
}

export function countPassedBookingSlots(slots: readonly KalenderSlotRespons[]) {
  return grupperSlots([...slots]).filter((slot) => slot.erPassert).length;
}

export function countAvailableBookingSlots(
  slots: readonly KalenderSlotRespons[],
  authenticated: boolean
) {
  return slots.filter((slot) => !slot.erPassert && utledSlotStatus(slot, authenticated) === "ledig")
    .length;
}

export function getBookingDayChoice(date: string, today: string, tomorrow: string) {
  if (date === today) return "today";
  if (date === tomorrow) return "tomorrow";
  return "date";
}

export function addDaysToIsoDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(year, month - 1, day + days);
  const resultYear = result.getFullYear();
  const resultMonth = String(result.getMonth() + 1).padStart(2, "0");
  const resultDay = String(result.getDate()).padStart(2, "0");
  return `${resultYear}-${resultMonth}-${resultDay}`;
}

export function getBookingLimitFacts(
  settings: BookingInnstillingRespons,
  status: BookingstatusRespons | null,
  maxDate: string
): BookingLimitFacts {
  return {
    quotas: status
      ? [
          {
            label: "Valgt dag",
            value: formatQuotaUsage(
              status.bookingerPaaDato,
              status.maksPerDag,
              status.gjenstaaendePaaDato
            ),
          },
          {
            label: "Kommende",
            value: formatQuotaUsage(
              status.kommendeBookinger,
              status.maksKommende,
              status.gjenstaaendeKommende
            ),
          },
        ]
      : [
          {
            label: "Per dag",
            value: `Maks ${formatCount(settings.maksPerDag, "booking", "bookinger")}`,
          },
          {
            label: "Kommende",
            value: `Maks ${formatCount(settings.maksKommende, "booking", "bookinger")}`,
          },
        ],
    times: [
      { label: "Åpningstid", value: `${settings.aapningstid}–${settings.stengetid}` },
      { label: "Lengde per tid", value: `${settings.slotLengdeMinutter} minutter` },
      { label: "Kan bookes til", value: formatDatoKort(status?.sisteBookbareDato ?? maxDate) },
    ],
  };
}

export function getBookingLimitCopy(activity: GrenRespons, court: BaneRespons): BookingLimitCopy {
  const activityName = activity.navn.toLocaleLowerCase("nb-NO");

  return {
    exemptExplanation: "Du har administratortilgang og er ikke begrenset av disse kvotene.",
    quotaDescription: `Alle dine ordinære bookinger i ${activityName} teller, også på andre baner.`,
    quotaExplanation:
      "Passerte bookinger teller fortsatt på valgt dag. En kommende booking frigjør plass etter sluttiden.",
    timeDescription: `${court.navn} kan ha andre tider og en annen bookinghorisont enn øvrige baner.`,
    timeExplanation: `Siste booking må være ferdig kl. ${court.bookingInnstillinger.stengetid}.`,
  };
}

export function markSlotAsOwnBooking(
  slots: readonly KalenderSlotRespons[],
  request: OpprettBookingForespørsel
) {
  return slots.map((slot) =>
    slot.slotStartTid === request.startTid && slot.slotSluttTid === request.sluttTid
      ? {
          ...slot,
          bookingId: null,
          booketAv: "Du",
          erEier: true,
          bookingStartTid: slot.slotStartTid,
          bookingSluttTid: slot.slotSluttTid,
          kapabiliteter: [Kapabiliteter.booking.fjern],
        }
      : slot
  );
}

export function markSlotAsAvailable(slots: readonly KalenderSlotRespons[], bookingId: string) {
  return slots.map((slot) =>
    slot.bookingId === bookingId
      ? {
          ...slot,
          bookingId: null,
          booketAv: null,
          erEier: false,
          bookingStartTid: null,
          bookingSluttTid: null,
          kapabiliteter: [Kapabiliteter.booking.book],
        }
      : slot
  );
}

function getBookingSlotKey(slot: KalenderSlotRespons) {
  return slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`;
}

function getSlotStatusPresentation(status: SlotStatus): BookingSlotPresentation["status"] {
  if (status === "ledig") return { label: "Ledig", tone: "available" };
  if (status === "passert") return { label: "Passert", tone: "past" };
  return { label: "Opptatt", tone: "busy" };
}

function getSlotTitle(slot: KalenderSlotRespons, status: SlotStatus, booked: boolean) {
  if (slot.arrangementTittel) return slot.arrangementTittel;
  if (status === "din_booking") return "Din tid";
  if (status === "ledig" || !booked) return undefined;
  return slot.booketAv?.trim() || "Booket";
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatQuotaUsage(used: number, maximum: number, remaining: number) {
  return `${used} av ${maximum} brukt · ${remaining} igjen`;
}
