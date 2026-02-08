// src/types/Arrangement.ts

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

// Request
export type OpprettArrangementForespørsel = {
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  ukedager: DayOfWeek[];
  tidspunkter: string[];
  baneIder: string[];
};

export type SlettArrangementForespørsel = {
  arrangementId: string;
};
