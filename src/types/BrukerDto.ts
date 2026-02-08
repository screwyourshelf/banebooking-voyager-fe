export type RolleType = 'Medlem' | 'Utvidet' | 'KlubbAdmin';

export interface BrukerDto {
  id: string;
  epost: string;
  visningsnavn: string;
  roller: RolleType[];
  vilkårAkseptertDato?: string | null;
  vilkårVersjon?: string | null;
}
