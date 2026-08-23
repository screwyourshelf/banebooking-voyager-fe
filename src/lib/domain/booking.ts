import type { KalenderSlotRespons, SlotStatus } from "$lib/contracts";
import { harHandling } from "./handling";
import { Kapabiliteter } from "./kapabiliteter";

export function utledSlotStatus(slot: KalenderSlotRespons, erInnlogget: boolean): SlotStatus {
  if (slot.status) return slot.status;

  if (slot.erPassert) return "passert";
  if (slot.arrangementTittel) return "arrangement";
  if (erInnlogget && slot.erEier === true) return "din_booking";

  if (erSlotBooket(slot)) return "opptatt";

  return "ledig";
}

export function erSlotBooket(slot: KalenderSlotRespons) {
  return (
    Boolean(slot.bookingId || slot.booketAv) ||
    harHandling(slot.kapabiliteter, Kapabiliteter.booking.fjern)
  );
}

export function grupperSlots(slots: KalenderSlotRespons[]): KalenderSlotRespons[] {
  const sett = new Set<string>();
  return slots.filter((slot) => {
    if (!slot.bookingId) return true;
    if (sett.has(slot.bookingId)) return false;
    sett.add(slot.bookingId);
    return true;
  });
}
