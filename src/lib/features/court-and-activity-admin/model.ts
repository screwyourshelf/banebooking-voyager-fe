import type {
  BaneBookingOverstyringRespons,
  BaneRespons,
  BookingRegelRespons,
  GrenRespons,
  OppdaterBaneBookingInnstillingerForespørsel,
  OppdaterBaneForespørsel,
  OpprettGrenForespørsel,
  OppdaterGrenForespørsel,
} from "$lib/contracts";

export type CourtAndActivityAdminSection = "courts" | "activities";

export type BookingOverrideDraft = {
  openingHour: number | null;
  closingHour: number | null;
  slotMinutes: number | null;
  maxPerDay: number | null;
  maxActive: number | null;
  daysAhead: number | null;
};

export type CourtDraft = {
  name: string;
  description: string;
  active: boolean;
  activityId: string;
  overrides: BookingOverrideDraft | null;
};

export type ActivityDraft = {
  name: string;
  rules: string;
  active: boolean;
  sortOrder: number;
  openingHour: number;
  closingHour: number;
  maxPerDay: number;
  maxActive: number;
  daysAhead: number;
  slotMinutes: number;
};

export type CourtReorderUpdate = {
  courtId: string;
  request: OppdaterBaneForespørsel;
};

export const EMPTY_BOOKING_OVERRIDE: BookingOverrideDraft = {
  openingHour: null,
  closingHour: null,
  slotMinutes: null,
  maxPerDay: null,
  maxActive: null,
  daysAhead: null,
};

export const DEFAULT_ACTIVITY_DRAFT: ActivityDraft = {
  name: "",
  rules: "",
  active: true,
  sortOrder: 0,
  openingHour: 7,
  closingHour: 22,
  maxPerDay: 2,
  maxActive: 5,
  daysAhead: 7,
  slotMinutes: 60,
};

export function courtToDraft(court: BaneRespons): CourtDraft {
  return {
    name: court.navn,
    description: court.beskrivelse,
    active: court.aktiv,
    activityId: court.grenId,
    overrides: court.harOverstyring ? bookingOverrideToDraft(court.bookingOverstyring) : null,
  };
}

export function activityToDraft(activity: GrenRespons): ActivityDraft {
  return {
    name: activity.navn,
    rules: activity.banereglement,
    active: activity.aktiv,
    sortOrder: activity.sortering,
    openingHour: timeToHour(activity.bookingInnstillinger.aapningstid),
    closingHour: timeToHour(activity.bookingInnstillinger.stengetid),
    maxPerDay: activity.bookingInnstillinger.maksPerDag,
    maxActive: activity.bookingInnstillinger.maksTotalt,
    daysAhead: activity.bookingInnstillinger.dagerFremITid,
    slotMinutes: activity.bookingInnstillinger.slotLengdeMinutter,
  };
}

export function createCourtDraft(activityId: string): CourtDraft {
  return { name: "", description: "", active: true, activityId, overrides: null };
}

export function createActivityDraft(sortOrder: number): ActivityDraft {
  return { ...DEFAULT_ACTIVITY_DRAFT, sortOrder };
}

export function validateCourtDraft(draft: CourtDraft) {
  return {
    name: requiredLimitedText(draft.name, 100, "Navn er påkrevd.", "Navn kan maks være 100 tegn."),
    description: draft.description.length > 500 ? "Beskrivelse kan maks være 500 tegn." : null,
    activityId: draft.activityId ? null : "Gren er påkrevd.",
  };
}

export function validateActivityDraft(draft: ActivityDraft) {
  return {
    name: requiredLimitedText(draft.name, 100, "Navn er påkrevd.", "Navn kan maks være 100 tegn."),
    rules: draft.rules.length > 5000 ? "Banereglement kan maks være 5000 tegn." : null,
    hours: draft.openingHour >= draft.closingHour ? "Åpningstid må være før stengetid." : null,
  };
}

export function hasErrors(errors: Record<string, string | null>) {
  return Object.values(errors).some(Boolean);
}

export function courtDraftIsDirty(court: BaneRespons, draft: CourtDraft) {
  return (
    draft.name !== court.navn ||
    draft.description !== court.beskrivelse ||
    draft.active !== court.aktiv ||
    draft.activityId !== court.grenId ||
    JSON.stringify(draft.overrides) !==
      JSON.stringify(court.harOverstyring ? bookingOverrideToDraft(court.bookingOverstyring) : null)
  );
}

export function activityDraftIsDirty(activity: GrenRespons, draft: ActivityDraft) {
  const original = activityToDraft(activity);
  return (Object.keys(original) as Array<keyof ActivityDraft>).some(
    (key) => draft[key] !== original[key]
  );
}

export function toCourtUpdateRequest(
  court: BaneRespons,
  draft: CourtDraft
): OppdaterBaneForespørsel {
  return {
    grenId: draft.activityId,
    navn: draft.name.trim(),
    beskrivelse: draft.description,
    aktiv: draft.active,
    sortering: court.sortering,
  };
}

export function toCourtBookingSettingsRequest(
  override: BookingOverrideDraft | null
): OppdaterBaneBookingInnstillingerForespørsel {
  const value = override ?? EMPTY_BOOKING_OVERRIDE;
  return {
    aapningstid: value.openingHour === null ? null : hourToTime(value.openingHour),
    stengetid: value.closingHour === null ? null : hourToTime(value.closingHour),
    slotLengdeMinutter: value.slotMinutes,
    maksPerDag: value.maxPerDay,
    maksTotalt: value.maxActive,
    dagerFremITid: value.daysAhead,
  };
}

export function toActivityUpdateRequest(draft: ActivityDraft): OppdaterGrenForespørsel {
  return {
    navn: draft.name.trim(),
    banereglement: draft.rules,
    sortering: draft.sortOrder,
    aktiv: draft.active,
    aapningstid: hourToTime(draft.openingHour),
    stengetid: hourToTime(draft.closingHour),
    maksPerDag: draft.maxPerDay,
    maksTotalt: draft.maxActive,
    dagerFremITid: draft.daysAhead,
    slotLengdeMinutter: draft.slotMinutes,
  };
}

export function toActivityCreateRequest(draft: ActivityDraft): OpprettGrenForespørsel {
  const { aktiv: _active, ...request } = toActivityUpdateRequest(draft);
  return request;
}

export function sortCourts(courts: readonly BaneRespons[]) {
  return [...courts].sort(
    (left, right) =>
      left.grenNavn.localeCompare(right.grenNavn, "nb-NO") ||
      left.sortering - right.sortering ||
      left.navn.localeCompare(right.navn, "nb-NO")
  );
}

export function sortActivities(activities: readonly GrenRespons[]) {
  return [...activities].sort(
    (left, right) =>
      left.sortering - right.sortering || left.navn.localeCompare(right.navn, "nb-NO")
  );
}

export function createCourtReorderUpdates(
  courts: readonly BaneRespons[],
  courtId: string,
  direction: -1 | 1
): CourtReorderUpdate[] {
  const court = courts.find((candidate) => candidate.id === courtId);
  if (!court) return [];
  const activityCourts = sortCourts(courts).filter(
    (candidate) => candidate.grenId === court.grenId
  );
  const index = activityCourts.findIndex((candidate) => candidate.id === courtId);
  const target = activityCourts[index + direction];
  if (index < 0 || !target) return [];

  const reordered = [...activityCourts];
  [reordered[index], reordered[index + direction]] = [
    reordered[index + direction],
    reordered[index],
  ];
  return reordered.flatMap((candidate, sortOrder) =>
    candidate.sortering === sortOrder
      ? []
      : [
          {
            courtId: candidate.id,
            request: {
              grenId: candidate.grenId,
              navn: candidate.navn,
              beskrivelse: candidate.beskrivelse,
              aktiv: candidate.aktiv,
              sortering: sortOrder,
            },
          },
        ]
  );
}

export function nextCourtSortOrder(courts: readonly BaneRespons[], activityId: string) {
  return (
    Math.max(
      -1,
      ...courts.filter((court) => court.grenId === activityId).map((court) => court.sortering)
    ) + 1
  );
}

export function nextActivitySortOrder(activities: readonly GrenRespons[]) {
  return Math.max(-1, ...activities.map((activity) => activity.sortering)) + 1;
}

export function hourLabel(hour: number) {
  return hourToTime(hour);
}

function bookingOverrideToDraft(
  override: BaneBookingOverstyringRespons | null
): BookingOverrideDraft {
  return {
    openingHour: override?.aapningstid == null ? null : timeToHour(override.aapningstid),
    closingHour: override?.stengetid == null ? null : timeToHour(override.stengetid),
    slotMinutes: override?.slotLengdeMinutter ?? null,
    maxPerDay: override?.maksPerDag ?? null,
    maxActive: override?.maksTotalt ?? null,
    daysAhead: override?.dagerFremITid ?? null,
  };
}

export function defaultOverrideValue(
  field: keyof BookingOverrideDraft,
  defaults: BookingRegelRespons
) {
  const values: Record<keyof BookingOverrideDraft, number> = {
    openingHour: timeToHour(defaults.aapningstid),
    closingHour: timeToHour(defaults.stengetid),
    slotMinutes: defaults.slotLengdeMinutter,
    maxPerDay: defaults.maksPerDag,
    maxActive: defaults.maksTotalt,
    daysAhead: defaults.dagerFremITid,
  };
  return values[field];
}

function timeToHour(time: string) {
  const hour = Number.parseInt(time.split(":")[0] ?? "0", 10);
  return Number.isFinite(hour) ? hour : 0;
}

function hourToTime(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function requiredLimitedText(
  value: string,
  maxLength: number,
  requiredMessage: string,
  maxLengthMessage: string
) {
  if (!value.trim()) return requiredMessage;
  return value.length > maxLength ? maxLengthMessage : null;
}
