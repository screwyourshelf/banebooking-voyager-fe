import type { ArrangementKategori } from "@/types";

export const ARRANGEMENT_KATEGORI_VALG: Array<{
  value: ArrangementKategori;
  label: string;
}> = [
  { value: "Trening", label: "Trening" },
  { value: "Turnering", label: "Turnering" },
  { value: "Klubbmersterskap", label: "Klubbmesterskap" },
  { value: "Kurs", label: "Kurs" },
  { value: "Lagkamp", label: "Lagkamp" },
  { value: "Stigespill", label: "Stigespill" },
  { value: "Dugnad", label: "Dugnad" },
  { value: "Vedlikehold", label: "Vedlikehold" },
  { value: "Sosialt", label: "Sosialt" },
  { value: "Annet", label: "Annet" },
];

export function formaterArrangementKategori(kategori: ArrangementKategori) {
  return ARRANGEMENT_KATEGORI_VALG.find((valg) => valg.value === kategori)?.label ?? kategori;
}

export function formaterAntallBanetider(antall: number) {
  return `${antall} ${antall === 1 ? "banetid" : "banetider"}`;
}
