import type { UkedagIso } from "@/types/dato";

export type KommendeArrangementDto = {
    id: string;
    tittel: string;
    beskrivelse?: string;
    kategori: string; // evt ArrangementKategori senere

    startDato: string; // yyyy-MM-dd
    sluttDato: string; // yyyy-MM-dd

    baner: string[];
    ukedager: UkedagIso[];     // 1..7
    tidspunkter: string[];     // HH:mm
    slotLengdeMinutter: number;
};
