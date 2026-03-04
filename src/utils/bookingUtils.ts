import type { BookingSlotRespons, SlotStatus } from "@/types";
import { harHandling } from "@/utils/handlingUtils";

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

export function utledSlotStatus(slot: BookingSlotRespons, erInnlogget: boolean): SlotStatus {
  if (slot.status) return slot.status;

  if (slot.erPassert) return "passert";
  if (slot.arrangementTittel) return "arrangement";
  if (erInnlogget && slot.erEier === true) return "din_booking";

  const erBooket =
    !!slot.booketAv ||
    harHandling(slot.tillattHandlinger, "booking:slett") ||
    harHandling(slot.tillattHandlinger, "booking:avbestill");

  if (erBooket) return "opptatt";

  if (
    erInnlogget &&
    slot.tillattHandlinger.length > 0 &&
    !harHandling(slot.tillattHandlinger, "booking:book")
  ) {
    return "opptatt";
  }

  return "ledig";
}

export function utledSlotVisning(slot: BookingSlotRespons, erInnlogget: boolean): SlotVisning {
  const status = utledSlotStatus(slot, erInnlogget);
  const visning = visningPerStatus[status];

  if (status === "arrangement" && slot.arrangementTittel) {
    return { ...visning, tekst: slot.arrangementTittel };
  }

  return visning;
}

export function grupperSlots(slots: BookingSlotRespons[]): BookingSlotRespons[] {
  const sett = new Set<string>();
  return slots.filter((slot) => {
    if (!slot.bookingId) return true;
    if (sett.has(slot.bookingId)) return false;
    sett.add(slot.bookingId);
    return true;
  });
}

export function erSpennendBooking(slot: BookingSlotRespons): boolean {
  return (
    slot.bookingStartTid !== null &&
    (slot.startTid !== slot.bookingStartTid || slot.sluttTid !== slot.bookingSluttTid)
  );
}
