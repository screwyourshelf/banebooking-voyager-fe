export interface MedlemskapBekreftelseRespons {
  id: string;
  label: string;
  opprettetTidspunkt: string;
  gyldigTil: string;
}

export interface MedlemskapStatusRespons {
  aktivBekreftelse: MedlemskapBekreftelseRespons | null;
  antallBekreftet: number;
  antallTotalt: number;
}

export interface AktiverMedlemskapBekreftelseForespørsel {
  label: string;
  gyldigTil: string;
}

export interface BekreftMedlemskapForespørsel {
  fulltNavn: string;
  medlemskapType: string;
}
