import type { ArrangementKategori, DayOfWeek } from "@/types/Arrangement";

export type KommendeArrangementDto = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategori: ArrangementKategori;
  startDato: string; // yyyy-MM-dd
  sluttDato: string; // yyyy-MM-dd
  baner: string[];
  ukedager: DayOfWeek[];
  tidspunkter: string[]; // HH:mm
  slotLengdeMinutter: number;
};
