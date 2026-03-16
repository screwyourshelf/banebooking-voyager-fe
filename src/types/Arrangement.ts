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

export type BaneGruppeForespørsel = {
  baneIder: string[];
  tidspunkter: string[];
};

export type OpprettArrangementForespørsel = {
  tittel: string;
  beskrivelse?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden?: boolean;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  ukedager: DayOfWeek[];
  baneGrupper: BaneGruppeForespørsel[];
  tillaterPaamelding: boolean;
};

export type SlettArrangementForespørsel = {
  arrangementId: string;
};

// ─────────── Responses ───────────

export type ArrangementPresentasjonType =
  | "EnkeltDato"
  | "DatoIntervallAlleDager"
  | "DatoIntervallUkedager"
  | "Uregelmessig";

export type ArrangementPresentasjon = {
  type: ArrangementPresentasjonType;
  startDato: string;
  sluttDato: string;
  ukedager: DayOfWeek[];
  tidspunkter: string[];
  baneNavn: string[];
  harAvvikendeSlots: boolean;
};

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
  tillaterPaamelding: boolean;
  konflikter: ArrangementKonfliktRespons[];
};

export type SlettArrangementRespons = {
  arrangementId: string;
  antallBookingerSlettet: number;
};

export type BaneGruppeRespons = {
  baneIder: string[];
  baneNavn: string[];
  tidspunkter: string[];
  slotLengdeMinutter: number;
};

export type OffentligArrangementRespons = {
  id: string;
  tittel: string;
  /** Innholdet fra nettsideBeskrivelse – kan være HTML eller Markdown */
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  baneGrupper: BaneGruppeRespons[];
  ukedager: DayOfWeek[];
  tillaterPaamelding: boolean;
  antallPaameldte: number;
  presentasjon: ArrangementPresentasjon;
};

export type ArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden: boolean;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  baneGrupper: BaneGruppeRespons[];
  ukedager: DayOfWeek[];
  tillaterPaamelding: boolean;
  antallPaameldte: number;
  erPaameldt: boolean;
  erPassert: boolean;
  kapabiliteter: string[];
  turneringId: string | null;
  turneringStatus: string | null;
  presentasjon: ArrangementPresentasjon;
};

export type ArrangementPaameldingRespons = {
  arrangementId: string;
  antallPaameldte: number;
  erPaameldt: boolean;
};

export type AktivtArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  tillaterPaamelding: boolean;
};

export type PaameldtBrukerRespons = {
  brukerId: string;
  visningsnavn: string;
  paameldtTid: string;
};

export type ArrangementPaameldtListeRespons = {
  arrangementId: string;
  tillaterPaamelding: boolean;
  antallPaameldte: number;
  paameldte: PaameldtBrukerRespons[];
};

export type ErstattArrangementRespons = {
  arrangementId: string;
  antallOpprettet: number;
  antallPaameldingFjernet: number;
  tillaterPaamelding: boolean;
  konflikter: ArrangementKonfliktRespons[];
};
