export type ArrangementKategori =
    | 'Trening'
    | 'Turnering'
    | 'Klubbmersterskap'
    | 'Kurs'
    | 'Lagkamp'
    | 'Stigespill'
    | 'Dugnad'
    | 'Vedlikehold'
    | 'Sosialt'
    | 'Annet';

export type OpprettArrangementDto = {
    tittel: string;
    beskrivelse?: string;
    kategori: ArrangementKategori;

    startDato: string;      // yyyy-MM-dd
    sluttDato: string;      // yyyy-MM-dd

    ukedager: string[];     // ["Monday", "Wednesday"]
    tidspunkter: string[];  // ["08:00"]
    baneIder: string[];     // GUIDs
};

export type ArrangementDto = {
    id: string;
    tittel: string;
    beskrivelse?: string;
    kategori: ArrangementKategori;

    startDato: string;
    sluttDato: string;

    førsteBane: string;
    førsteStartTid: string;
    førsteSluttTid: string;

    antallBookinger: number;
};