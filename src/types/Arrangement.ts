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

// ─────────── Requests ───────────

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

// ─────────── Responses ───────────

export type ArrangementSlotRespons = {
  dato: string;
  startTid: string;
  sluttTid: string;
  baneNavn: string;
  baneId: string;
};

export type ArrangementForhåndsvisningRespons = {
  ledige: ArrangementSlotRespons[];
  konflikter: ArrangementSlotRespons[];
};

export type ArrangementKonfliktRespons = {
  dato: string;
  baneId: string;
  startTid: string;
  sluttTid: string;
  feilmelding: string;
};

export type OpprettArrangementRespons = {
  arrangementId: string;
  antallOpprettet: number;
  konflikter: ArrangementKonfliktRespons[];
};

export type SlettArrangementRespons = {
  arrangementId: string;
  antallBookingerDeaktivert: number;
};

export type KommendeArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  baner: string[];
  ukedager: DayOfWeek[];
  tidspunkter: string[];
  slotLengdeMinutter: number;
};
