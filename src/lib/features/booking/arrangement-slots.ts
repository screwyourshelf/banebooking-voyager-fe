import type { KalenderSlotRespons } from "$lib/contracts";
import { harHandling, Kapabiliteter } from "$lib/domain";

export function arrangementSlotKey(slot: KalenderSlotRespons) {
  return `${slot.baneId}_${slot.dato}_${slot.slotStartTid}_${slot.slotSluttTid}`;
}

export function canSelectArrangementSlot(slot: KalenderSlotRespons) {
  return (
    !slot.bookingId &&
    !slot.erPassert &&
    harHandling(slot.kapabiliteter, Kapabiliteter.booking.kobleTilArrangement)
  );
}
