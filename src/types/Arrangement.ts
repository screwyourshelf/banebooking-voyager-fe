// src/types/arrangement.ts

export type ArrangementKategori =
    | "Trening"
    | "Turnering"
    | "Klubbmersterskap"
    | "Kurs"
    | "Lagkamp"
    | "Stigespill"
    | "Dugnad"
    | "Vedlikehold"
    | "Sosialt"
    | "Annet";

/**
 * ISO-kontrakt mot backend
 * (mapper direkte til C# OpprettArrangementDto)
 */
export type OpprettArrangementDto = {
    tittel: string;
    beskrivelse?: string;
    kategori: ArrangementKategori;

    startDato: string;   // yyyy-MM-dd
    sluttDato: string;   // yyyy-MM-dd

    ukedager: number[];  // DayOfWeek (0=Sunday ... 6=Saturday)
    tidspunkter: string[]; // HH:mm (TimeOnly)
    baneIder: string[];  // Guid
};


export type ArrangementDto = {
    id: string;
    tittel: string;
    beskrivelse?: string;
    kategori: ArrangementKategori;

    startDato: string;
    sluttDato: string;

    førsteBane: string;
    førsteStartTid: string;
    førsteSluttTid: string;

    antallBookinger: number;

    kanSlettes: boolean
};