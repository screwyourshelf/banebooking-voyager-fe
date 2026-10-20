import type { ArrangementKategori, ArrangementRespons } from "$lib/contracts";

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

type ArrangementPresentation = Pick<
  ArrangementRespons,
  "erPassert" | "grenNavn" | "kategori" | "sluttDato" | "startDato" | "tittel"
>;

function todayIso(referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getArrangementLifecycleStatus(
  arrangement: Pick<ArrangementPresentation, "erPassert" | "sluttDato" | "startDato">,
  referenceDate = new Date()
) {
  if (arrangement.erPassert) {
    return { label: "Gjennomført", tone: "past" as const };
  }

  const today = todayIso(referenceDate);
  const isOngoing =
    arrangement.startDato.slice(0, 10) <= today && arrangement.sluttDato.slice(0, 10) >= today;

  return isOngoing
    ? { label: "Pågår", tone: "event" as const }
    : { label: "Kommende", tone: "event" as const };
}

export function formaterArrangementMetadata(
  arrangement: Pick<ArrangementPresentation, "grenNavn" | "kategori" | "tittel">
) {
  const categoryLabel = formaterArrangementKategori(arrangement.kategori);
  const categoryDiffersFromTitle =
    categoryLabel.toLocaleLowerCase("nb-NO") !==
    arrangement.tittel.trim().toLocaleLowerCase("nb-NO");

  return [arrangement.grenNavn, categoryDiffersFromTitle ? categoryLabel : null]
    .filter(Boolean)
    .join(" · ");
}

export function formaterAntallBanetider(antall: number) {
  return `${antall} ${antall === 1 ? "banetid" : "banetider"}`;
}
