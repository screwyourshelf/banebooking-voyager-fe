export type RolleType = 'Medlem' | 'Utvidet' | 'KlubbAdmin';

export interface BrukerDto {
    id: string;
    epost: string;
    roller: RolleType[];
}
