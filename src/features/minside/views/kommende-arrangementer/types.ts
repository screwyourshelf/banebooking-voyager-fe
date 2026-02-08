import type { ArrangementKategori, DayOfWeek } from "@/types/Arrangement";

export type KommendeArrangementRespons = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string;
  sluttDato: string;
  baner: string[];
  ukedager: DayOfWeek[];
  tidspunkter: string[];
  slotLengdeMinutter: number;
};
