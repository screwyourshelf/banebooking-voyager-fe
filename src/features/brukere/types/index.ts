import type { RolleType, BrukerRespons } from "@/types";

export type { RolleType, BrukerRespons };

export type EditState = {
  rolle: RolleType;
  visningsnavn: string;
};

export const ROLLER: RolleType[] = ["Medlem", "Utvidet", "KlubbAdmin"];
