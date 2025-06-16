export type Bane = {
    id: string;
    navn: string;
    beskrivelse: string;
    aktiv: boolean
};

export type NyBane = {
    navn: string;
    beskrivelse: string;
};

export type OppdaterBane = NyBane;
