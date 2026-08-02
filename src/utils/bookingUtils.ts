import type { KalenderSlotRespons, SlotStatus } from "@/types";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export type SlotVisning = {
  tekst: string;
  variant: "default" | "secondary" | "outline" | "destructive";
};

const visningPerStatus: Record<SlotStatus, SlotVisning> = {
  ledig: { tekst: "Ledig", variant: "secondary" },
  passert: { tekst: "Passert", variant: "outline" },
  arrangement: { tekst: "Arrangement", variant: "default" },
  din_booking: { tekst: "Din booking", variant: "default" },
  opptatt: { tekst: "Opptatt", variant: "outline" },
};

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

export function utledSlotVisning(slot: KalenderSlotRespons, erInnlogget: boolean): SlotVisning {
  const status = utledSlotStatus(slot, erInnlogget);
  return visningPerStatus[status];
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

export function erSpennendBooking(slot: KalenderSlotRespons): boolean {
  return (
    slot.bookingStartTid !== null &&
    (slot.slotStartTid !== slot.bookingStartTid || slot.slotSluttTid !== slot.bookingSluttTid)
  );
}
