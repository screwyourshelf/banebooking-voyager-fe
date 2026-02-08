// Response
export type BaneRespons = {
  id: string;
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
};

// Requests
export type OpprettBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
};

export type OppdaterBaneForespørsel = {
  navn: string;
  beskrivelse?: string;
  aktiv: boolean;
};
