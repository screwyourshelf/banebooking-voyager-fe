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
  grenId: string;
  tittel: string;
  beskrivelse?: string;
  nettsideTittel?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden?: boolean;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  ukedager: DayOfWeek[];
  baneGrupper: BaneGruppeForespørsel[];
  /** Eksplisitte slots – overstyrer gjentakende generering dersom satt. */
  eksplisitteSlots?: EksplisittArrangementSlot[];
};

export type EksplisittArrangementSlot = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
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
  presentasjon: ArrangementPresentasjon;
};

export type ArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  nettsideTittel?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden: boolean;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  baneGrupper: BaneGruppeRespons[];
  ukedager: DayOfWeek[];
  erPassert: boolean;
  kapabiliteter: string[];
  turneringId: string | null;
  turneringStatus: string | null;
  presentasjon: ArrangementPresentasjon;
};

export type AktivtArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
};

/**
 * Én enkelt booking tilknyttet et arrangement.
 * Returneres fra GET /api/klubb/{slug}/arrangement/{id}/bookinger.
 * dato = "YYYY-MM-DD", startTid/sluttTid = "HH:MM"
 */
export type ArrangementBookingRespons = {
  bookingId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  baneId: string;
  baneNavn: string;
};

export type OppdaterArrangementMetadataForespørsel = {
  kategori: ArrangementKategori;
  beskrivelse?: string;
  nettsideTittel?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden: boolean;
};

/**
 * Forespørsel for å legge til én booking i en arrangementsserie.
 * POST /api/klubb/{slug}/arrangement/{id}/bookinger
 */
export type LeggTilArrangementBookingForespørsel = {
  baneId: string;
  dato: string; // "YYYY-MM-DD"
  startTid: string; // "HH:MM"
  sluttTid: string; // "HH:MM"
};

/**
 * Forespørsel for batch-opprettelse av bookinger.
 * POST /api/klubb/{slug}/arrangement/{id}/bookinger/batch
 */
export type BatchLeggTilArrangementBookingerForespørsel = {
  bookinger: LeggTilArrangementBookingForespørsel[];
};

export type BatchBookingFeilet = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  feilmelding: string;
};

export type BatchLeggTilArrangementBookingerRespons = {
  opprettet: ArrangementBookingRespons[];
  feilet: BatchBookingFeilet[];
};

export type OppdaterArrangementMetadataRespons = {
  arrangementId: string;
  kategori: ArrangementKategori;
  beskrivelse?: string;
  nettsideTittel?: string;
  nettsideBeskrivelse?: string;
  publisertPåNettsiden: boolean;
};

export type ErstattArrangementRespons = {
  arrangementId: string;
  antallOpprettet: number;
  konflikter: ArrangementKonfliktRespons[];
};
