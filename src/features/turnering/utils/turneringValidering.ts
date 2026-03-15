import type { KampAvslutning, KampVinner } from "@/types";

export type ParsedSett = { spiller1Games: number; spiller2Games: number };

// ─── Sett-score regler ───────────────────────────────────────────────────────

export function erGyldigRegularSettScore(s1: number, s2: number): boolean {
  const [hi, lo] = s1 >= s2 ? [s1, s2] : [s2, s1];
  if (hi === 6 && lo <= 4) return true;
  if (hi === 7 && (lo === 5 || lo === 6)) return true;
  return false;
}

export function erGyldigSuperTiebreakScore(s1: number, s2: number): boolean {
  const [hi, lo] = s1 >= s2 ? [s1, s2] : [s2, s1];
  return hi >= 10 && hi - lo >= 2;
}

export function erGyldigSettScore(s1: number, s2: number, erSuperTiebreak: boolean): boolean {
  return erSuperTiebreak ? erGyldigSuperTiebreakScore(s1, s2) : erGyldigRegularSettScore(s1, s2);
}

// ─── Vinner/sett regler (kun Normal avslutning) ───────────────────────────────

export function erVinnerReflektertISett(vinner: KampVinner, sett: ParsedSett[]): boolean {
  if (sett.length === 0) return false;
  const sp1 = sett.filter((s) => s.spiller1Games > s.spiller2Games).length;
  const sp2 = sett.filter((s) => s.spiller2Games > s.spiller1Games).length;
  return vinner === "Spiller1" ? sp1 > sp2 : sp2 > sp1;
}

export function vinnerHarNokSett(
  vinner: KampVinner,
  sett: ParsedSett[],
  antallSett: number
): boolean {
  const needed = Math.ceil(antallSett / 2);
  const vunnet = sett.filter((s) =>
    vinner === "Spiller1" ? s.spiller1Games > s.spiller2Games : s.spiller2Games > s.spiller1Games
  ).length;
  return vunnet >= needed;
}

export function erAntallSettGyldig(sett: ParsedSett[], antallSett: number): boolean {
  const needed = Math.ceil(antallSett / 2);
  let sp1 = 0;
  let sp2 = 0;
  for (let i = 0; i < sett.length - 1; i++) {
    if (sett[i].spiller1Games > sett[i].spiller2Games) sp1++;
    else sp2++;
    if (sp1 >= needed || sp2 >= needed) return false;
  }
  return true;
}

// ─── Vinner ved Retired/Default ───────────────────────────────────────────────

export function erVinnerKorrektVedAvslutning(
  vinner: KampVinner,
  sett: ParsedSett[],
  avslutning: KampAvslutning
): boolean {
  if (avslutning === "Normal") return true;
  const fullforteSett = sett.slice(0, -1);
  const vinnerVunnet = fullforteSett.filter((s) =>
    vinner === "Spiller1" ? s.spiller1Games > s.spiller2Games : s.spiller2Games > s.spiller1Games
  ).length;
  const taperVunnet = fullforteSett.filter((s) =>
    vinner === "Spiller1" ? s.spiller2Games > s.spiller1Games : s.spiller1Games > s.spiller2Games
  ).length;
  return vinnerVunnet >= taperVunnet;
}

// ─── Draw-regler ──────────────────────────────────────────────────────────────

export function erGyldigAntallGrupper(antallPaameldte: number, antallGrupper: number): boolean {
  return antallGrupper > 0 && antallGrupper < antallPaameldte;
}

export function erGyldigSomGaarViderePerGruppe(
  antallGrupper: number,
  antallSomGaarViderePerGruppe: number
): boolean {
  if (antallSomGaarViderePerGruppe < 1) return false;
  return antallGrupper * antallSomGaarViderePerGruppe >= 2;
}

export function gyldigeSomGaarVidereAlternativer(antallGrupper: number): number[] {
  return [1, 2, 4].filter((k) => erGyldigSomGaarViderePerGruppe(antallGrupper, k));
}
