export type BaneDto = {
    id: string;
    navn: string;
};

export type ArrangementSlotDto = {
    dato: string;     // yyyy-MM-dd
    startTid: string; // HH:mm
    sluttTid: string; // HH:mm
    baneId: string;   // GUID
    baneNavn: string;
};

export type ArrangementForhandsvisningDto = {
    ledige: ArrangementSlotDto[];
    konflikter: ArrangementSlotDto[];
};

export type ArrangementKonfliktDto = {
  dato: string;       // yyyy-MM-dd
  baneId: string;     // GUID
  startTid: string;   // HH:mm
  sluttTid: string;   // HH:mm
  feilmelding: string;
};

export type OpprettArrangementResponsDto = {
  arrangementId: string;
  antallOpprettet: number;
  konflikter: ArrangementKonfliktDto[];
};
