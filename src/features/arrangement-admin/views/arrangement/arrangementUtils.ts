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
import type { LokalBooking } from "../../types";

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
  grenId: string;
  datoFra: Date;
  datoTil: Date;
  baneGrupper: BaneGruppeForespørsel[];
  valgteUkedager: DayOfWeek[];
  kategori: ArrangementKategori;
  beskrivelse: string;
  nettsideTittel: string;
  nettsideBeskrivelse: string;
  publisertPåNettsiden: boolean;
  onWarning: (msg: string) => void;
};

export function byggDto(args: ByggDtoArgs): OpprettArrangementForespørsel | null {
  const {
    grenId,
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
    grenId,
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
  };
}

// ─────────── LokalBooking-generering ───────────

type GenererLokalBookingerArgs = {
  datoFra: Date;
  datoTil: Date;
  valgteUkedager: DayOfWeek[];
  /** Én eller flere slot-grupper. Bruk `grupperBanerEtterSlotLengde` for å bygge disse. */
  slotGrupper: SlotLengdeGruppe[];
  /** Valgte tidspunkter per slotLengde. Nøkkel = slotLengdeMinutter. */
  tidspunkterPerGruppe: Record<number, string[]>;
};

/**
 * Genererer LokalBooking[] fra gjentakende oppsett-parametre.
 * Én booking per kombinasjon av dato × starttidspunkt × bane.
 * Sluttid beregnes som startTid + slotLengdeMinutter.
 * Status settes til "ukjent" – konfliktsjekk skjer i steg 2b.
 */
export function genererLokalBookinger({
  datoFra,
  datoTil,
  valgteUkedager,
  slotGrupper,
  tidspunkterPerGruppe,
}: GenererLokalBookingerArgs): LokalBooking[] {
  const faktiskeUkedagerIso = finnUkedagerIDatoPeriode(datoFra, datoTil);

  // Bygg sett av ISO-ukedager som er valgt OG finnes i perioden
  const gyldigeIso = new Set(
    valgteUkedager.map(dayOfWeekTilIso).filter((iso) => faktiskeUkedagerIso.has(iso))
  );

  if (gyldigeIso.size === 0) return [];

  // Iterer alle datoer i perioden
  const start = new Date(datoFra.getFullYear(), datoFra.getMonth(), datoFra.getDate());
  const slutt = new Date(datoTil.getFullYear(), datoTil.getMonth(), datoTil.getDate());

  const bookinger: LokalBooking[] = [];

  for (let d = new Date(start); d <= slutt; d.setDate(d.getDate() + 1)) {
    const jsUkedag = d.getDay();
    const iso = (jsUkedag === 0 ? 7 : jsUkedag) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    if (!gyldigeIso.has(iso)) continue;

    const dato = tilDatoTekst(new Date(d));

    for (const gruppe of slotGrupper) {
      const tidspunkter = tidspunkterPerGruppe[gruppe.slotLengdeMinutter] ?? [];

      for (const startTid of tidspunkter) {
        const sluttTid = leggTilMinutter(startTid, gruppe.slotLengdeMinutter);

        for (let bi = 0; bi < gruppe.baneIder.length; bi++) {
          bookinger.push({
            id: crypto.randomUUID(),
            dato,
            startTid,
            sluttTid,
            baneId: gruppe.baneIder[bi],
            baneNavn: gruppe.baneNavn[bi],
            status: "ukjent",
            kilde: "generert",
          });
        }
      }
    }
  }

  return bookinger;
}

function leggTilMinutter(tid: string, minutter: number): string {
  const [h, m] = tid.split(":").map(Number);
  const total = h * 60 + m + minutter;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const JS_DAY_TO_DOW: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Bygger et minimalt OpprettArrangementForespørsel til bruk i konfliktsjekk
 * (POST /arrangement/forhandsvis). Utleder ukedager og periode direkte fra
 * de aktive bookingene i listen – fungerer for både manuelt og gjentakende oppsett.
 *
 * Dersom ukedager er tomme (f.eks. ingen aktive bookinger), returnerer null.
 */
export function byggKonfliktSjekkDto(
  aktive: LokalBooking[],
  grenId: string,
  kategori: ArrangementKategori
): OpprettArrangementForespørsel | null {
  if (aktive.length === 0) return null;

  const unikeUkedager: DayOfWeek[] = [
    ...new Set(aktive.map((b) => JS_DAY_TO_DOW[new Date(b.dato + "T00:00:00").getDay()])),
  ];

  const datoer = aktive.map((b) => b.dato).sort();

  // Én banegruppe per bane med unike starttidspunkter
  const baneMap = new Map<string, Set<string>>();
  for (const b of aktive) {
    const tider = baneMap.get(b.baneId) ?? new Set<string>();
    tider.add(b.startTid);
    baneMap.set(b.baneId, tider);
  }
  const baneGrupper = [...baneMap.entries()].map(([baneId, tider]) => ({
    baneIder: [baneId],
    tidspunkter: [...tider].sort(),
  }));

  return {
    grenId,
    tittel: kategori,
    kategori,
    startDato: datoer[0],
    sluttDato: datoer[datoer.length - 1],
    ukedager: unikeUkedager,
    baneGrupper,
    eksplisitteSlots: aktive.map((b) => ({
      baneId: b.baneId,
      dato: b.dato,
      startTid: b.startTid,
      sluttTid: b.sluttTid,
    })),
  };
}
