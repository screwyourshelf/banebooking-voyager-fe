import type { OpprettKunngjøringForespørsel } from "$lib/contracts";

export const MAX_ANNOUNCEMENT_TITLE_LENGTH = 200;
const MAX_ANNOUNCEMENT_CONTENT_LENGTH = 5000;

export type AnnouncementDraft = {
  title: string;
  content: string;
  expiresOn: string | null;
};

export type AnnouncementDraftErrors = Record<keyof AnnouncementDraft, string | null>;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createAnnouncementDraft(): AnnouncementDraft {
  return { title: "", content: "", expiresOn: null };
}

function localIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nextLocalIsoDate(referenceDate = new Date()) {
  const tomorrow = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() + 1
  );
  return localIsoDate(tomorrow);
}

export function validateAnnouncementDraft(
  draft: AnnouncementDraft,
  referenceDate = new Date()
): AnnouncementDraftErrors {
  const title = draft.title.trim();
  const content = draft.content.trim();
  const minimumDate = nextLocalIsoDate(referenceDate);

  return {
    title: !title
      ? "Skriv inn en tittel."
      : title.length > MAX_ANNOUNCEMENT_TITLE_LENGTH
        ? `Tittelen kan ikke være lengre enn ${MAX_ANNOUNCEMENT_TITLE_LENGTH} tegn.`
        : null,
    content: !content
      ? "Skriv inn kunngjøringen."
      : content.length > MAX_ANNOUNCEMENT_CONTENT_LENGTH
        ? `Det lagrede innholdet kan ikke være lengre enn ${MAX_ANNOUNCEMENT_CONTENT_LENGTH} tegn.`
        : null,
    expiresOn:
      draft.expiresOn && LOCAL_DATE_PATTERN.test(draft.expiresOn) && draft.expiresOn >= minimumDate
        ? null
        : "Velg en utløpsdato fra og med i morgen.",
  };
}

export function toCreateAnnouncementRequest(
  draft: AnnouncementDraft,
  referenceDate = new Date()
): OpprettKunngjøringForespørsel | null {
  if (
    Object.values(validateAnnouncementDraft(draft, referenceDate)).some(Boolean) ||
    !draft.expiresOn
  ) {
    return null;
  }

  return {
    tittel: draft.title.trim(),
    tekst: draft.content.trim(),
    utløperTidspunkt: `${draft.expiresOn}T00:00:00.000Z`,
  };
}

export function confirmationProgress(confirmed: number, audience: number) {
  if (audience === 0) return "Ingen brukere i målgruppen";
  return `${confirmed} av ${audience} bekreftet`;
}
