// src/types/Turnering.ts

export type TurneringStatus =
  | "Oppsett"
  | "PaameldingAapen"
  | "PaameldingLukket"
  | "DrawPublisert"
  | "Pagaar"
  | "Avsluttet";

export type KlasseType =
  | "HerreSingle"
  | "DameSingle"
  | "HerreDobbel"
  | "DameDobbel"
  | "MixedDobbel"
  | "JuniorSingle"
  | "JuniorDobbel";

export type TurneringStruktur = "RoundRobin" | "GruppeMedSluttspill" | "Utslagning";

export type PaameldingStatus = "Sokt" | "Godkjent" | "Reserve" | "Avslatt" | "TrukketSeg";

export type KampStatus = "Planlagt" | "Pagaar" | "Ferdig" | "WalkOver" | "Utsatt" | "Bye";

export type KampVinner = "Spiller1" | "Spiller2";

export type KampAvslutning = "Normal" | "Retired" | "Default";

export type KampFormat = {
  antallSett: number;
  spillTil: number;
  superTiebreak: boolean;
};

// ─────────── Responses ───────────

export type TurneringKlasseRespons = {
  id: string;
  klasseType: KlasseType;
  maxDeltakere: number | null;
  paameldingFrist: string | null;
  autoGodkjenn: boolean;
  struktur: TurneringStruktur;
  antallGrupper: number | null;
  antallSomGaarViderePerGruppe: number | null;
  sluttspillKampFormat: KampFormat;
  gruppespillKampFormat: KampFormat | null;
  antallGodkjente: number;
  antallSokt: number;
  antallReserve: number;
  foreslåttStartTid: string | null;
};

export type TurneringRespons = {
  id: string;
  arrangementId: string;
  arrangementTittel: string;
  status: TurneringStatus;
  klasser: TurneringKlasseRespons[];
  kapabiliteter: string[];
};

export type TurneringPaameldingRespons = {
  id: string;
  spiller1Navn: string;
  spiller2Navn: string | null;
  status: PaameldingStatus;
  paameldtTid: string;
  adminMerknad: string | null;
  kanTrekkeSeg: boolean;
  seed: number | null;
};

export type TurneringPaameldingListeRespons = {
  turneringKlasseId: string;
  klasseType: KlasseType;
  antallGodkjente: number;
  antallSokt: number;
  antallReserve: number;
  paameldinger: TurneringPaameldingRespons[];
};

export type Stilling = {
  kampVunnet: number;
  kampTapt: number;
  settVunnet: number;
  settTapt: number;
  gameVunnet: number;
  gameTapt: number;
};

export type GruppeDeltakerVisning = {
  gruppeDeltakerId: string;
  spillerNavn: string;
  seeding: number;
  trukketSeg: boolean;
  stilling: Stilling;
};

export type SettResultat = {
  settNummer: number;
  spiller1Games: number;
  spiller2Games: number;
};

export type KampResultatVisning = {
  vinner: KampVinner;
  avslutning?: KampAvslutning;
  sett: SettResultat[];
};

export type GruppeKampVisning = {
  id: string;
  spiller1Navn: string;
  spiller2Navn: string;
  bane: string | null;
  tidspunkt: string | null;
  status: KampStatus;
  resultat: KampResultatVisning | null;
};

export type TurneringGruppeVisning = {
  id: string;
  navn: string;
  foreslåttBane: string | null;
  deltakere: GruppeDeltakerVisning[];
  kamper: GruppeKampVisning[];
};

export type SluttspillKampVisning = {
  id: string;
  kampNummer: number | null;
  runde: number;
  bracketPosisjon: number;
  spiller1Navn: string | null;
  spiller2Navn: string | null;
  bane: string | null;
  tidspunkt: string | null;
  status: KampStatus;
  resultat: KampResultatVisning | null;
};

export type DrawKlasseVisning = {
  id: string;
  klasseType: KlasseType;
  struktur: TurneringStruktur;
  kapabiliteter: string[];
};

export type DrawVisningRespons = {
  klasse: DrawKlasseVisning;
  grupper: TurneringGruppeVisning[] | null;
  sluttspill: SluttspillKampVisning[] | null;
};

export type TurneringAnsvarligRespons = {
  brukerId: string;
  navn: string;
  epost: string;
};

export type TurneringAnsvarligeRespons = {
  turneringId: string;
  ansvarlige: TurneringAnsvarligRespons[];
};

export type GenererDrawRespons = {
  klasseId: string;
  struktur: TurneringStruktur;
  antallGrupper: number;
  antallGruppekamper: number;
  antallSluttspillKamper: number;
};

export type FrøSluttspillRespons = {
  klasseId: string;
  antallSeeded: number;
  antallByes: number;
};

export type KampResultatRespons = {
  kampId: string;
  status: KampStatus;
  vinner: KampVinner;
  avslutning: KampAvslutning;
};

// ─────────── Requests ───────────

export type OpprettTurneringForespørsel = {
  arrangementId: string;
};

export type OppdaterTurneringStatusForespørsel = {
  nyStatus: TurneringStatus;
};

export type LeggTilKlasseForespørsel = {
  klasseType: KlasseType;
  maxDeltakere?: number;
  paameldingFrist?: string;
  autoGodkjenn?: boolean;
  struktur: TurneringStruktur;
  antallGrupper?: number;
  antallSomGaarViderePerGruppe?: number;
  sluttspillKampFormat: KampFormat;
  gruppespillKampFormat?: KampFormat;
};

export type MeldPaaKlasseForespørsel = {
  spiller1BrukerId?: string;
  spiller1Navn?: string;
  spiller1Epost?: string;
  spiller2BrukerId?: string;
  spiller2Navn?: string;
  spiller2Epost?: string;
};

export type OppdaterPaameldingStatusForespørsel = {
  nyStatus: PaameldingStatus;
  adminMerknad?: string;
};

export type OppdaterPaameldingSeedForespørsel = {
  seed: number | null;
};

export type GenererDrawForespørsel = {
  struktur?: TurneringStruktur;
  antallGrupper?: number;
  antallSomGaarViderePerGruppe?: number;
};

export type RegistrerResultatForespørsel = {
  vinner: KampVinner;
  avslutning?: KampAvslutning;
  sett: SettResultat[];
};

export type LeggTilAnsvarligForespørsel = {
  brukerId: string;
};

export type GenererKampplanForespørsel = {
  startTid: string;
  kampVarighetMinutter?: number;
  baner: string[];
};

export type GenererKampplanKampRespons = {
  kampId: string;
  kampNummer: number;
  spiller1Navn: string;
  spiller2Navn: string;
  bane: string;
  tidspunkt: string;
};

export type GenererKampplanRespons = {
  antallKamperPlanlagt: number;
  kamper: GenererKampplanKampRespons[];
};
