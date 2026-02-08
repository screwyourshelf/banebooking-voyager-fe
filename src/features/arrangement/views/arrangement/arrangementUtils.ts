import {
  tilDatoTekst,
  finnDayOfWeeksIPeriode,
  dayOfWeekTilIso,
  finnUkedagerIDatoPeriode,
} from "@/utils/datoUtils";
import type { OpprettArrangementForespørsel, ArrangementKategori, DayOfWeek } from "@/types";

export function finnTilgjengeligeUkedager(datoFra: Date, datoTil: Date): DayOfWeek[] {
  return finnDayOfWeeksIPeriode(datoFra, datoTil);
}

type ByggDtoArgs = {
  datoFra: Date;
  datoTil: Date;
  valgteBaner: string[];
  valgteUkedager: DayOfWeek[];
  valgteTidspunkter: string[];
  kategori: ArrangementKategori;
  beskrivelse: string;
  onWarning: (msg: string) => void;
};

export function byggDto(args: ByggDtoArgs): OpprettArrangementForespørsel | null {
  const {
    datoFra,
    datoTil,
    valgteBaner,
    valgteUkedager,
    valgteTidspunkter,
    kategori,
    beskrivelse,
    onWarning,
  } = args;

  if (valgteBaner.length === 0) return (onWarning("Du må velge minst én bane"), null);
  if (valgteTidspunkter.length === 0) return (onWarning("Du må velge minst ett tidspunkt"), null);
  if (valgteUkedager.length === 0) return (onWarning("Du må velge minst én ukedag"), null);

  const faktiskeIso = finnUkedagerIDatoPeriode(datoFra, datoTil);
  const gyldigeUkedager = valgteUkedager.filter((d) => faktiskeIso.has(dayOfWeekTilIso(d)));

  if (gyldigeUkedager.length === 0)
    return (onWarning("Ingen av de valgte ukedagene finnes i datointervallet"), null);

  return {
    tittel: kategori,
    beskrivelse: beskrivelse?.trim() ? beskrivelse : undefined,
    kategori,
    startDato: tilDatoTekst(datoFra),
    sluttDato: tilDatoTekst(datoTil),
    ukedager: gyldigeUkedager,
    tidspunkter: valgteTidspunkter,
    baneIder: valgteBaner,
  };
}
