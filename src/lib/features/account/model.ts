import type { BrukerRespons } from "$lib/contracts";

export type AccountTab = "profil" | "persondata";
export type DisplayNameMode = "epost" | "navn";

export const MAX_DISPLAY_NAME_LENGTH = 50;
const DISPLAY_NAME_PATTERN = /^[\p{L}\d\s.@'_%+-]{3,}$/u;

export function resolveAccountTab(value: string | null): AccountTab {
  return value === "persondata" ? "persondata" : "profil";
}

export function createDisplayNameDraft(user: BrukerRespons) {
  const displayName = user.visningsnavn?.trim() ?? "";
  const usesEmail = !displayName || displayName === user.epost;
  return {
    mode: (usesEmail ? "epost" : "navn") as DisplayNameMode,
    value: usesEmail ? "" : displayName,
  };
}

export function validateDisplayName(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return "Visningsnavn kan ikke være tomt.";
  if (value.length < 3) return "Visningsnavn må være minst 3 tegn.";
  if (!DISPLAY_NAME_PATTERN.test(value)) return "Visningsnavn inneholder ugyldige tegn.";
  if (value.length > MAX_DISPLAY_NAME_LENGTH) {
    return `Visningsnavn kan ikke være lengre enn ${MAX_DISPLAY_NAME_LENGTH} tegn.`;
  }
  return null;
}

export function resolveDisplayName(user: BrukerRespons, mode: DisplayNameMode, value: string) {
  return mode === "epost" ? user.epost : value.trim();
}
