import {
    ukedager,
    dagNavnTilEnum,
    tilDatoTekst,
    enumTilDagNavn,
    dagIndexTilBackendUkedag,
    finnUkedagerIDatoPeriode,
} from "@/utils/datoUtils";

import type { OpprettArrangementDto } from "@/types";

export function finnTilgjengeligeUkedager(datoFra: Date, datoTil: Date): string[] {
    const dager = new Set<string>();
    const fra = new Date(datoFra);
    const til = new Date(datoTil);

    for (let d = new Date(fra); d <= til; d.setDate(d.getDate() + 1)) {
        const idx = d.getDay();
        const backendUkedag = dagIndexTilBackendUkedag[idx];
        const norskKort = enumTilDagNavn[backendUkedag];
        if (norskKort) dager.add(norskKort);
    }

    return ukedager.filter((d) => dager.has(d));
}

export function byggDto(args: {
    datoFra: Date;
    datoTil: Date;
    valgteBaner: string[];
    valgteUkedager: string[];
    valgteTidspunkter: string[];
    kategori: string;
    beskrivelse: string;
    onWarning: (msg: string) => void;
}): OpprettArrangementDto | null {
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

    if (!datoFra || !datoTil) {
        onWarning("Du må velge start- og sluttdato");
        return null;
    }
    if (valgteBaner.length === 0) {
        onWarning("Du må velge minst én bane");
        return null;
    }
    if (valgteTidspunkter.length === 0) {
        onWarning("Du må velge minst ett tidspunkt");
        return null;
    }
    if (valgteUkedager.length === 0) {
        onWarning("Du må velge minst én ukedag");
        return null;
    }

    const faktiskeUkedager = finnUkedagerIDatoPeriode(datoFra, datoTil);
    const backendUkedager = valgteUkedager
        .map((d) => dagNavnTilEnum[d])
        .filter((d) => faktiskeUkedager.has(d));

    if (backendUkedager.length === 0) {
        onWarning("Ingen av de valgte ukedagene finnes i datointervallet");
        return null;
    }

    return {
        tittel: kategori,
        beskrivelse,
        kategori: kategori as OpprettArrangementDto["kategori"],
        startDato: tilDatoTekst(datoFra),
        sluttDato: tilDatoTekst(datoTil),
        ukedager: backendUkedager,
        tidspunkter: valgteTidspunkter,
        baneIder: valgteBaner,
    };
}
