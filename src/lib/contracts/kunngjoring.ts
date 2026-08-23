export type KunngjøringBekreftelseRespons = {
  visningsnavn: string;
  epost: string;
  bekreftetTidspunkt: string;
};

export type KunngjøringAdminRespons = {
  id: string;
  tittel: string;
  tekst: string;
  opprettetTidspunkt: string;
  utløperTidspunkt: string;
  antallBekreftelser: number;
  antallMålgruppe: number;
  bekreftelser: KunngjøringBekreftelseRespons[];
};

export type OpprettKunngjøringForespørsel = {
  tittel: string;
  tekst: string;
  utløperTidspunkt: string;
};
