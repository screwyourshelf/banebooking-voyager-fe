import {
    ukedager,
    ukedagKortTilIso,
    tilDatoTekst,
    finnUkedagerIDatoPeriode,
    isoTilDayOfWeeks,
} from "@/utils/datoUtils";

import type { UkedagKortNorsk, UkedagIso } from "@/types/dato";
import type { OpprettArrangementForespørsel, ArrangementKategori } from "@/types";

export function finnTilgjengeligeUkedager(datoFra: Date, datoTil: Date): UkedagKortNorsk[] {
    const faktiske = finnUkedagerIDatoPeriode(datoFra, datoTil); // Set<UkedagIso>

    const tilgjengeligeKort = new Set<UkedagKortNorsk>();
    for (const iso of faktiske) {
        // iso -> kort norsk (via reverse mapping)
        // enklest: finn key ved å bruke ukedager + ukedagKortTilIso
        // (for 7 elementer er dette helt ok)
        const kort = ukedager.find((k) => ukedagKortTilIso[k] === iso);
        if (kort) tilgjengeligeKort.add(kort);
    }

    return ukedager.filter((d) => tilgjengeligeKort.has(d));
}

type ByggDtoArgs = {
    datoFra: Date;
    datoTil: Date;
    valgteBaner: string[];
    valgteUkedager: UkedagKortNorsk[];
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

    if (valgteBaner.length === 0) return onWarning("Du må velge minst én bane"), null;
    if (valgteTidspunkter.length === 0) return onWarning("Du må velge minst ett tidspunkt"), null;
    if (valgteUkedager.length === 0) return onWarning("Du må velge minst én ukedag"), null;

    const faktiskeIso = finnUkedagerIDatoPeriode(datoFra, datoTil); // Set<UkedagIso>

    const isoUkedager = valgteUkedager
        .map((k) => ukedagKortTilIso[k])
        .filter((iso) => faktiskeIso.has(iso));

    if (isoUkedager.length === 0) return onWarning("Ingen av de valgte ukedagene finnes i datointervallet"), null;

    return {
        tittel: kategori,
        beskrivelse: beskrivelse?.trim() ? beskrivelse : undefined,
        kategori,
        startDato: tilDatoTekst(datoFra),
        sluttDato: tilDatoTekst(datoTil),
        ukedager: isoTilDayOfWeeks(isoUkedager),
        tidspunkter: valgteTidspunkter,
        baneIder: valgteBaner,
    };
}
