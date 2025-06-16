export type BookingSlot = {
    baneId: string;
    baneNavn: string;
    dato: string;
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
    arrangementTittel?: string;
    arrangementBeskrivelse?: string;
    kanBookes: boolean;
    kanAvbestille: boolean;
    kanSlette: boolean;
    erPassert: boolean;

    værSymbol?: string;
    temperatur?: number;
    vind?: number;
};
