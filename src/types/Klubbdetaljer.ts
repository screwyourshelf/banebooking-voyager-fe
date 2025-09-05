export type KlubbDetaljer = {
    slug: string;
    navn: string;
    kontaktEpost?: string;
    adminEpost?: string;
    banereglement?: string;
    latitude?: number;
    longitude?: number;
    feedUrl?: string;
    feedSynligAntallDager: number;
    bookingRegel: {
        maksPerDag: number;
        maksTotalt: number;
        dagerFremITid: number;
        slotLengdeMinutter: number;
        aapningstid: string;
        stengetid: string;
    };
};
