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
    tid: string;        // HH:mm
    baneId: string;     // GUID
    feilmelding: string;
};

export type OpprettArrangementResponsDto = {
    opprettet: {
        id: string;
        baneId: string;
        dato: string;
        startTid: string;
        sluttTid: string;
        aktiv: boolean;
    }[];
    konflikter: ArrangementKonfliktDto[];
};
