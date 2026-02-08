export const MAX_VISNINGSNAVN_LENGTH = 50;
export const VISNINGSNAVN_REGEX = /^[\p{L}\d\s.@'_%+-]{3,}$/u;

export function validateVisningsnavn(navnRaw: string): string | null {
  const navn = navnRaw.trim();

  if (navn.length === 0) return "Visningsnavn kan ikke være tomt.";
  if (navn.length < 3) return "Visningsnavn må være minst 3 tegn.";
  if (!VISNINGSNAVN_REGEX.test(navn)) return "Visningsnavn inneholder ugyldige tegn.";
  if (navn.length > MAX_VISNINGSNAVN_LENGTH)
    return `Visningsnavn kan ikke være lengre enn ${MAX_VISNINGSNAVN_LENGTH} tegn.`;

  return null;
}
