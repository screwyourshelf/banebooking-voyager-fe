import type {
  AktiverMedlemskapBekreftelseForespørsel,
  KlubbRespons,
  OppdaterKlubbForespørsel,
} from "$lib/contracts";

export const MAX_CLUB_NAME_LENGTH = 60;
export const MAX_MEMBERSHIP_PERIOD_LABEL_LENGTH = 100;

export type ClubSettingsDraft = {
  contactEmail: string;
  feedDays: string;
  feedUrl: string;
  latitude: string;
  longitude: string;
  name: string;
  website: string;
};

export type ClubSettingsField = keyof ClubSettingsDraft;
export type ClubSettingsErrors = Record<ClubSettingsField, string | null>;

export type MembershipActivationDraft = {
  expiresOn: string | null;
  label: string;
};

export type MembershipActivationErrors = Record<keyof MembershipActivationDraft, string | null>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createClubSettingsDraft(club: KlubbRespons): ClubSettingsDraft {
  return {
    name: club.navn ?? "",
    contactEmail: club.kontaktEpost ?? "",
    website: club.nettside ?? "",
    latitude: club.latitude?.toString() ?? "",
    longitude: club.longitude?.toString() ?? "",
    feedUrl: club.feedUrl ?? "",
    feedDays: (club.feedSynligAntallDager ?? 50).toString(),
  };
}

export function validateClubSettings(draft: ClubSettingsDraft): ClubSettingsErrors {
  return {
    name: validateClubName(draft.name),
    contactEmail: validateContactEmail(draft.contactEmail),
    website: null,
    latitude: validateCoordinate(draft.latitude, -90, 90, "Breddegrad"),
    longitude: validateCoordinate(draft.longitude, -180, 180, "Lengdegrad"),
    feedUrl: null,
    feedDays: validateFeedDays(draft.feedDays),
  };
}

export function isClubSettingsDirty(draft: ClubSettingsDraft, club: KlubbRespons) {
  const original = createClubSettingsDraft(club);
  return (Object.keys(original) as ClubSettingsField[]).some(
    (field) => draft[field] !== original[field]
  );
}

export function toUpdateClubRequest(
  draft: ClubSettingsDraft,
  club: KlubbRespons
): OppdaterKlubbForespørsel | null {
  if (Object.values(validateClubSettings(draft)).some(Boolean)) return null;

  return {
    navn: draft.name.trim(),
    kontaktEpost: draft.contactEmail.trim(),
    nettside: draft.website.trim() || undefined,
    latitude: parseOptionalDecimal(draft.latitude) ?? club.latitude,
    longitude: parseOptionalDecimal(draft.longitude) ?? club.longitude,
    feedUrl: draft.feedUrl.trim() || undefined,
    feedSynligAntallDager: parseOptionalInteger(draft.feedDays) ?? club.feedSynligAntallDager ?? 50,
  };
}

export function validateMembershipActivation(
  draft: MembershipActivationDraft
): MembershipActivationErrors {
  const label = draft.label.trim();
  return {
    label: !label
      ? "Skriv inn et periodenavn."
      : label.length > MAX_MEMBERSHIP_PERIOD_LABEL_LENGTH
        ? `Periodenavnet kan ikke være lengre enn ${MAX_MEMBERSHIP_PERIOD_LABEL_LENGTH} tegn.`
        : null,
    expiresOn:
      draft.expiresOn && LOCAL_DATE_PATTERN.test(draft.expiresOn)
        ? null
        : "Velg datoen perioden utløper.",
  };
}

export function toMembershipActivationRequest(
  draft: MembershipActivationDraft
): AktiverMedlemskapBekreftelseForespørsel | null {
  if (Object.values(validateMembershipActivation(draft)).some(Boolean) || !draft.expiresOn) {
    return null;
  }

  return {
    label: draft.label.trim(),
    gyldigTil: `${draft.expiresOn}T00:00:00.000Z`,
  };
}

function validateClubName(name: string) {
  const value = name.trim();
  if (!value) return "Klubbnavn kan ikke være tomt.";
  if (value.length < 2) return "Klubbnavn må være minst 2 tegn.";
  if (value.length > MAX_CLUB_NAME_LENGTH) {
    return `Klubbnavn kan ikke være lengre enn ${MAX_CLUB_NAME_LENGTH} tegn.`;
  }
  return null;
}

function validateContactEmail(email: string) {
  const value = email.trim();
  if (!value) return "Kontakt-e-post kan ikke være tom.";
  return EMAIL_PATTERN.test(value) ? null : "Skriv inn en gyldig e-postadresse.";
}

function validateFeedDays(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  const days = Number(normalized);
  return Number.isInteger(days) && days >= 1 && days <= 150
    ? null
    : "Antall dager må være mellom 1 og 150.";
}

function validateCoordinate(value: string, minimum: number, maximum: number, label: string) {
  if (!value.trim()) return null;
  const coordinate = parseOptionalDecimal(value);
  return coordinate !== undefined && coordinate >= minimum && coordinate <= maximum
    ? null
    : `${label} må være mellom ${minimum} og ${maximum}.`;
}

function parseOptionalDecimal(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const number = Number(normalized.replace(",", "."));
  return Number.isFinite(number) ? number : undefined;
}

function parseOptionalInteger(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const number = Number(normalized);
  return Number.isInteger(number) ? number : undefined;
}
