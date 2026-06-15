export interface KunngjøringBekreftelseRespons {
  visningsnavn: string;
  epost: string;
  bekreftetTidspunkt: string;
}

export interface KunngjøringAdminRespons {
  id: string;
  tittel: string;
  tekst: string;
  opprettetTidspunkt: string;
  utløperTidspunkt: string;
  antallBekreftelser: number;
  antallMålgruppe: number;
  bekreftelser: KunngjøringBekreftelseRespons[];
}
