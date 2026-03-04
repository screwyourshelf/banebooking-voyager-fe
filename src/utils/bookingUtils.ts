import type { BookingSlotRespons } from "@/types";

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
