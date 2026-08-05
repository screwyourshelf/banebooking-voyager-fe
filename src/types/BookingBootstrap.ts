import type { BaneRespons } from "./Bane";
import type { BrukerRespons } from "./Bruker";
import type { GrenRespons } from "./Gren";
import type { KalenderSlotRespons } from "./KalenderSlot";
import type { KlubbRespons } from "./Klubbdetaljer";

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
