export type RolleType = "Medlem" | "Utvidet" | "KlubbAdmin";

// Response
export interface BrukerRespons {
  id: string;
  epost: string;
  visningsnavn: string;
  roller: RolleType[];
  vilkårAkseptertDato?: string | null;
  vilkårVersjon?: string | null;
  kapabiliteter: string[];
  erSperret?: boolean;
  antallAktiveSperrer?: number;
  opprettetTid?: string;
  måBekrefteMedlemskap?: boolean;
  medlemskapBekreftelseLabel?: string | null;
  medlemskapBekreftetDato?: string | null;
  fulltNavn?: string | null;
  medlemskapType?: string | null;
}

export interface BrukerSperreRespons {
  id: string;
  brukerId: string;
  klubbId: string | null;
  klubbNavn: string | null;
  type: string;
  aktivFra: string;
  aktivTil: string | null;
  årsak: string;
  opprettetAv: string;
  opprettetTidspunkt: string;
  opphevtAv: string | null;
  opphevtTidspunkt: string | null;
  erAktiv: boolean;
}

export interface BrukerSperrerRespons {
  brukerId: string;
  antallAktive: number;
  sperrer: BrukerSperreRespons[];
}

export interface SperrBrukerForespørsel {
  type: string;
  årsak: string;
  aktivTil: string | null;
}

export interface OpphevSperreRespons {
  sperreId: string;
  opphevtTidspunkt: string;
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
