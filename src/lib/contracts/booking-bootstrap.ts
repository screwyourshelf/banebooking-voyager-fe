import type { BaneRespons } from "./bane";
import type { BrukerRespons } from "./bruker";
import type { GrenRespons } from "./gren";
import type { KalenderSlotRespons } from "./kalender-slot";
import type { KlubbRespons } from "./klubb";

export type BookingBootstrapRespons = {
  klubb: KlubbRespons;
  bruker: BrukerRespons | null;
  grener: GrenRespons[];
  baner: BaneRespons[];
  valgtGrenId: string | null;
  valgtBaneId: string | null;
  dato: string;
  kalenderSlots: KalenderSlotRespons[];
};
