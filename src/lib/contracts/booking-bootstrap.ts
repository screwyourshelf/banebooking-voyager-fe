import type { BaneRespons } from "./bane";
import type { GrenRespons } from "./gren";
import type { KalenderRespons } from "./kalender-slot";

export type BookingBootstrapRespons = {
  grener: GrenRespons[];
  baner: BaneRespons[];
  valgtGrenId: string | null;
  valgtBaneId: string | null;
  dato: string;
  kalender: KalenderRespons;
};
