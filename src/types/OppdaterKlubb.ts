export type BookingRegelDto = {
    maksPerDag: number;
    maksTotalt: number;
    dagerFremITid: number;
    slotLengdeMinutter: number;
    aapningstid: string; // "07:00"
    stengetid: string;   // "22:00"
};

export type OppdaterKlubb = {
    navn: string;
    kontaktEpost: string;
    banereglement: string;

    latitude: number | null;
    longitude: number | null;

    feedUrl?: string | null;
    feedSynligAntallDager: number;

    bookingRegel: BookingRegelDto;
};
