import type { DayOfWeek } from "@/types";

export type StatistikkPeriode = {
  fra: string;
  til: string;
  sammenligningFra: string | null;
  sammenligningTil: string | null;
};

export type BookingNøkkeltall = {
  antallBookinger: number;
  bookedeTimer: number;
  personligeBookinger: number;
  arrangementbookinger: number;
};

type SammenlignbarBookingstatistikk = {
  antallBookinger: number;
  bookedeTimer: number;
  sammenligningAntallBookinger: number | null;
  sammenligningBookedeTimer: number | null;
  endringBookedeTimerProsent: number | null;
};

export type BookingPerMåned = SammenlignbarBookingstatistikk & {
  år: number;
  måned: number;
  personligeBookinger: number;
  arrangementbookinger: number;
};

export type BookingPerGren = SammenlignbarBookingstatistikk & {
  grenId: string;
  grenNavn: string;
  personligeBookinger: number;
  arrangementbookinger: number;
};

export type BookingPerBane = SammenlignbarBookingstatistikk & {
  baneId: string;
  baneNavn: string;
  grenId: string;
  grenNavn: string;
  personligeBookinger: number;
  arrangementbookinger: number;
};

export type BookingPerUkedag = SammenlignbarBookingstatistikk & {
  ukedag: DayOfWeek;
};

export type BookingPerTime = {
  time: number;
  bookedeTimer: number;
  sammenligningBookedeTimer: number | null;
};

export type BookingToppBruker = {
  brukerId: string;
  navn: string;
  epost: string;
  antallBookinger: number;
  bookedeTimer: number;
  personligeBookinger: number;
  arrangementbookinger: number;
};

export type BookingMedlemsstatistikk = {
  aktiveBrukere: number;
  gjennomsnittBookingerPerBruker: number;
  gjennomsnittBookedeTimerPerBruker: number;
  toppBrukere: BookingToppBruker[];
};

export type BookingMedlemsstatistikkPerBookingtype = {
  vanlige: BookingMedlemsstatistikk;
  arrangement: BookingMedlemsstatistikk;
};

export type BookingstatistikkRespons = {
  periode: StatistikkPeriode;
  nøkkeltall: BookingNøkkeltall;
  sammenligning: BookingNøkkeltall | null;
  endringBookedeTimerProsent: number | null;
  perMåned: BookingPerMåned[];
  perGren: BookingPerGren[];
  perBane: BookingPerBane[];
  perUkedag: BookingPerUkedag[];
  perTime: BookingPerTime[];
  medlemmer: BookingMedlemsstatistikk;
  medlemmerPerBookingtype: BookingMedlemsstatistikkPerBookingtype;
  generertTidspunkt: string;
};

export type BookingstatistikkFiltre = {
  fra: string;
  til: string;
  sammenlignMedForrigeÅr: boolean;
  grenId: string | null;
  baneId: string | null;
};

export type StatistikkPeriodevalg = "året-så-langt" | "forrige-år" | "siste-12" | "egendefinert";

export type Medlemsbookingtype = "alle" | "vanlige" | "arrangement";
