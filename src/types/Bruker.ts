export type RolleType = "Medlem" | "Utvidet" | "KlubbAdmin";

// Response
export interface BrukerRespons {
  id: string;
  epost: string;
  visningsnavn: string;
  roller: RolleType[];
  vilkårAkseptertDato?: string | null;
  vilkårVersjon?: string | null;
}

// Requests
export interface OppdaterBrukerForespørsel {
  rolle: string;
  visningsnavn?: string;
}

export interface OppdaterProfilForespørsel {
  visningsnavn?: string;
}

export interface AksepterVilkårForespørsel {
  versjon: string;
}
