export type RolleType = 'Medlem' | 'Utvidet' | 'KlubbAdmin';

export interface BrukerDto {
    id: string;
    epost: string;
    visningsnavn: string;
    roller: RolleType[];

    vilkaarAkseptertDato?: string | null;
    vilkaarVersjon?: string | null;
}
