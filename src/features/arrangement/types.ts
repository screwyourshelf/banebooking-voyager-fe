// Responses for Arrangement
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
