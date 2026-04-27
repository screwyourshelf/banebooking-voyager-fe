import type { RolleType, BrukerRespons } from "@/types";

export type { RolleType, BrukerRespons };

export type MedlemskapFilterType = "bekreftet" | "ikke-bekreftet";

export const MEDLEMSKAP_FILTER_VALG: { value: MedlemskapFilterType; label: string }[] = [
  { value: "bekreftet", label: "Bekreftet" },
  { value: "ikke-bekreftet", label: "Ikke bekreftet" },
];

export type EditState = {
  rolle: RolleType;
  visningsnavn: string;
};

export const ROLLER: RolleType[] = ["Medlem", "Utvidet", "KlubbAdmin"];
