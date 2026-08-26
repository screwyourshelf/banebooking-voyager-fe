import type { BaneRespons } from "./bane";
import type { GrenRespons } from "./gren";
import type { KalenderSlotRespons } from "./kalender-slot";

export type BookingBootstrapRespons = {
  grener: GrenRespons[];
  baner: BaneRespons[];
  valgtGrenId: string | null;
  valgtBaneId: string | null;
  dato: string;
  kalenderSlots: KalenderSlotRespons[];
};
