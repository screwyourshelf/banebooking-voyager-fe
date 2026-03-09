import type { KlasseType } from "@/types";

const labels: Record<KlasseType, string> = {
  HerreSingle: "Herre single",
  DameSingle: "Dame single",
  HerreDobbel: "Herre dobbel",
  DameDobbel: "Dame dobbel",
  MixedDobbel: "Mixed dobbel",
  JuniorSingle: "Junior single",
  JuniorDobbel: "Junior dobbel",
};

export function klasseTypeNavn(type: KlasseType): string {
  return labels[type];
}
