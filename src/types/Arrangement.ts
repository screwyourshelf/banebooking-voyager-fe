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

/** .NET DayOfWeek som string */
export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

/**
 * Request til backend for å opprette arrangement.
 * Matcher C# OpprettArrangementForespørsel.
 */
export type OpprettArrangementDto = {
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string;   // yyyy-MM-dd
  sluttDato: string;   // yyyy-MM-dd
  ukedager: DayOfWeek[];
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
  kanSlettes: boolean;
};
