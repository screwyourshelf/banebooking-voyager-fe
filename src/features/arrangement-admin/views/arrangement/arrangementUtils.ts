import {
  tilDatoTekst,
  finnDayOfWeeksIPeriode,
  dayOfWeekTilIso,
  finnUkedagerIDatoPeriode,
} from "@/utils/datoUtils";
import type {
  OpprettArrangementForespørsel,
  BaneGruppeForespørsel,
  ArrangementKategori,
  DayOfWeek,
} from "@/types";
import type { BaneRespons } from "@/types";

export function finnTilgjengeligeUkedager(datoFra: Date, datoTil: Date): DayOfWeek[] {
  return finnDayOfWeeksIPeriode(datoFra, datoTil);
}

// ─────────── Tidspunkt-beregning ───────────

function parseTimeToMinutes(tid: string): number {
  const [h, m] = tid.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function genererTidspunkter(start: string, slutt: string, slotMinutter: number): string[] {
  const startMin = parseTimeToMinutes(start);
  const sluttMin = parseTimeToMinutes(slutt);
  const result: string[] = [];
  for (let t = startMin; t + slotMinutter <= sluttMin; t += slotMinutter) {
    result.push(minutesToTime(t));
  }
  return result;
}

function getEffektivSlotLengde(bane: BaneRespons): number {
  return (
    bane.bookingOverstyring?.slotLengdeMinutter ?? bane.bookingInnstillinger.slotLengdeMinutter
  );
}

export type TidspunktResultat = {
  tidspunkter: string[];
  harUlikSlotLengde: boolean;
  advarselTekst: string | undefined;
};

export function beregnTidspunkterForBaner(
  baner: BaneRespons[],
  valgteBaneIder: string[]
): TidspunktResultat {
  const valgte = baner.filter((b) => valgteBaneIder.includes(b.id));

  if (valgte.length === 0) {
    return { tidspunkter: [], harUlikSlotLengde: false, advarselTekst: undefined };
  }

  const klubbRegel = valgte[0].bookingInnstillinger;
  const start = klubbRegel.aapningstid || "08:00";
  const slutt = klubbRegel.stengetid || "22:00";

  const slotLengder = valgte.map(getEffektivSlotLengde);
  const unikeSlotLengder = [...new Set(slotLengder)].sort((a, b) => a - b);
  const harUlik = unikeSlotLengder.length > 1;
  const maxSlot = Math.max(...slotLengder);

  const tidspunkter = genererTidspunkter(start, slutt, maxSlot);

  const advarselTekst = harUlik
    ? `De valgte banene har ulike slot-lengder (${unikeSlotLengder.join(" og ")} min). Tidspunktene er tilpasset til ${maxSlot} min mellomrom for å unngå overlappende bookinger. For mer fleksible tidspunkter, opprett separate arrangementer per bane-type.`
    : undefined;

  return { tidspunkter, harUlikSlotLengde: harUlik, advarselTekst };
}

// ─────────── Gruppering per slot-lengde ───────────

export type SlotLengdeGruppe = {
  slotLengdeMinutter: number;
  baneIder: string[];
  baneNavn: string[];
  tidspunkter: string[];
};

export function grupperBanerEtterSlotLengde(
  baner: BaneRespons[],
  valgteBaneIder: string[]
): SlotLengdeGruppe[] {
  const valgte = baner.filter((b) => valgteBaneIder.includes(b.id));
  if (valgte.length === 0) return [];

  const klubbRegel = valgte[0].bookingInnstillinger;
  const start = klubbRegel.aapningstid || "08:00";
  const slutt = klubbRegel.stengetid || "22:00";

  const gruppeMap = new Map<number, BaneRespons[]>();
  for (const bane of valgte) {
    const sl = getEffektivSlotLengde(bane);
    const list = gruppeMap.get(sl) ?? [];
    list.push(bane);
    gruppeMap.set(sl, list);
  }

  return [...gruppeMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([slotLengde, banerIGruppe]) => ({
      slotLengdeMinutter: slotLengde,
      baneIder: banerIGruppe.map((b) => b.id),
      baneNavn: banerIGruppe.map((b) => b.navn),
      tidspunkter: genererTidspunkter(start, slutt, slotLengde),
    }));
}

type ByggDtoArgs = {
  datoFra: Date;
  datoTil: Date;
  baneGrupper: BaneGruppeForespørsel[];
  valgteUkedager: DayOfWeek[];
  kategori: ArrangementKategori;
  beskrivelse: string;
  nettsideTittel: string;
  nettsideBeskrivelse: string;
  publisertPåNettsiden: boolean;
  tillaterPaamelding: boolean;
  onWarning: (msg: string) => void;
};

export function byggDto(args: ByggDtoArgs): OpprettArrangementForespørsel | null {
  const {
    datoFra,
    datoTil,
    baneGrupper,
    valgteUkedager,
    kategori,
    beskrivelse,
    nettsideBeskrivelse,
    publisertPåNettsiden,
    onWarning,
  } = args;

  const gyldigeGrupper = baneGrupper.filter(
    (g) => g.baneIder.length > 0 && g.tidspunkter.length > 0
  );

  if (gyldigeGrupper.length === 0 || gyldigeGrupper.every((g) => g.baneIder.length === 0))
    return (onWarning("Du må velge minst én bane"), null);

  if (gyldigeGrupper.every((g) => g.tidspunkter.length === 0))
    return (onWarning("Du må velge minst ett tidspunkt"), null);

  if (valgteUkedager.length === 0) return (onWarning("Du må velge minst én ukedag"), null);

  const faktiskeIso = finnUkedagerIDatoPeriode(datoFra, datoTil);
  const gyldigeUkedager = valgteUkedager.filter((d) => faktiskeIso.has(dayOfWeekTilIso(d)));

  if (gyldigeUkedager.length === 0)
    return (onWarning("Ingen av de valgte ukedagene finnes i datointervallet"), null);

  return {
    tittel: kategori,
    beskrivelse: beskrivelse?.trim() ? beskrivelse : undefined,
    nettsideTittel: args.nettsideTittel?.trim() ? args.nettsideTittel : undefined,
    nettsideBeskrivelse: nettsideBeskrivelse?.trim() ? nettsideBeskrivelse : undefined,
    publisertPåNettsiden: publisertPåNettsiden || undefined,
    kategori,
    startDato: tilDatoTekst(datoFra),
    sluttDato: tilDatoTekst(datoTil),
    ukedager: gyldigeUkedager,
    baneGrupper: gyldigeGrupper,
    tillaterPaamelding: args.tillaterPaamelding,
  };
}
