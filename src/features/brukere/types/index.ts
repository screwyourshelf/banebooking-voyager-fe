import type { RolleType, BrukerRespons } from "@/types";

export type { RolleType, BrukerRespons };

export type MedlemskapFilterType = "bekreftet" | "ikke-bekreftet";
export type BrukerSortering = "nyeste" | "eldste" | "navn";

export const MEDLEMSKAP_FILTER_VALG: { value: MedlemskapFilterType; label: string }[] = [
  { value: "bekreftet", label: "Bekreftet" },
  { value: "ikke-bekreftet", label: "Ikke bekreftet" },
];

export const BRUKER_SORTERING_VALG: { value: BrukerSortering; label: string }[] = [
  { value: "nyeste", label: "Nyeste opprettet" },
  { value: "eldste", label: "Eldste opprettet" },
  { value: "navn", label: "Navn A–Å" },
];

export type EditState = {
  rolle: RolleType;
  visningsnavn: string;
};
